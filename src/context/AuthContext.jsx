// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import initialBuyersData from '../data/buyers.json'; // Predefined buyer users
import initialSellersData from '../data/sellers.json'; // Predefined seller users

const AuthContext = createContext(null);

const CUSTOM_USERS_STORAGE_KEY = 'appCustomRegisteredUsers'; 
const AUTH_TOKEN_KEY = 'appAuthToken';
const AUTH_USER_DATA_KEY = 'appAuthUserData';
const AUTH_USER_ROLE_KEY = 'appAuthUserRole';

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null); 
  const [isLoading, setIsLoading] = useState(true); 
  const navigate = useNavigate();

  const getAllUsers = useCallback(() => {
    let customUsers = [];
    try {
      const customUsersString = localStorage.getItem(CUSTOM_USERS_STORAGE_KEY);
      if (customUsersString) {
        customUsers = JSON.parse(customUsersString);
      }
    } catch (error) {
      console.error("AuthContext: Error parsing custom users from localStorage", error);
    }
    const all = [...customUsers];
    [...initialBuyersData, ...initialSellersData].forEach(staticUser => {
        if (!all.find(u => u.email === staticUser.email)) {
            all.push(staticUser);
        }
    });
    return all;
  }, []);

  useEffect(() => {
    setIsLoading(true); 
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    const userDataString = localStorage.getItem(AUTH_USER_DATA_KEY);
    const roleString = localStorage.getItem(AUTH_USER_ROLE_KEY);

    if (token && userDataString && roleString) {
      try {
        const userData = JSON.parse(userDataString);
        setCurrentUser(userData);
        setUserRole(roleString);
        setIsAuthenticated(true); 
      } catch (error) {
        console.error("AuthContext: Error parsing user data from localStorage during session restore", error);
        localStorage.removeItem(AUTH_TOKEN_KEY);
        localStorage.removeItem(AUTH_USER_DATA_KEY);
        localStorage.removeItem(AUTH_USER_ROLE_KEY);
      }
    }
    setIsLoading(false); 
  }, []);

  const signin = useCallback(async (email, password, roleAttempt) => {
    setIsLoading(true);
    const combinedUsers = getAllUsers();
    let foundUser = null;

    if (roleAttempt) {
        foundUser = combinedUsers.find(u => u.email === email && u.password === password && u.role === roleAttempt);
    } else {
        foundUser = combinedUsers.find(u => u.email === email && u.password === password);
    }
    
    await new Promise(resolve => setTimeout(resolve, 300)); 

    if (foundUser) {
      const determinedRole = foundUser.role; 
      const token = `mockToken-${determinedRole.toLowerCase()}-${foundUser.id}-${Date.now()}`;
      const userDataToStore = { 
        id: foundUser.id,
        firstName: foundUser.firstName,
        lastName: foundUser.lastName,
        email: foundUser.email,
        role: determinedRole,
      };
      localStorage.setItem(AUTH_TOKEN_KEY, token);
      localStorage.setItem(AUTH_USER_DATA_KEY, JSON.stringify(userDataToStore));
      localStorage.setItem(AUTH_USER_ROLE_KEY, determinedRole);
      
      setCurrentUser(userDataToStore);
      setUserRole(determinedRole);
      setIsAuthenticated(true);
      setIsLoading(false);
      return { success: true, user: userDataToStore }; 
    } else {
      setIsLoading(false);
      return { success: false, error: "Invalid email or password." }; 
    }
  }, [getAllUsers]);

  const signup = useCallback(async (userDataFromForm) => {
    setIsLoading(true);
    const allCurrentUsers = getAllUsers();
    const existingUserByEmail = allCurrentUsers.find(u => u.email === userDataFromForm.email);

    if (existingUserByEmail) {
        setIsLoading(false);
        return { success: false, error: "Email already in use." };
    }

    const newUser = {
        id: `${userDataFromForm.role.toLowerCase()}-custom-${Date.now()}`,
        ...userDataFromForm 
    };
    
    let customUsers = [];
    try {
        const customUsersString = localStorage.getItem(CUSTOM_USERS_STORAGE_KEY);
        if (customUsersString) {
            customUsers = JSON.parse(customUsersString);
        }
    } catch (error) {
        console.error("AuthContext: Error parsing custom users from localStorage during signup", error);
    }
    customUsers.push(newUser);
    localStorage.setItem(CUSTOM_USERS_STORAGE_KEY, JSON.stringify(customUsers));

    await new Promise(resolve => setTimeout(resolve, 300)); 

    const token = `mockToken-${newUser.role.toLowerCase()}-${newUser.id}-${Date.now()}`;
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    localStorage.setItem(AUTH_USER_DATA_KEY, JSON.stringify(newUser)); 
    localStorage.setItem(AUTH_USER_ROLE_KEY, newUser.role);

    setCurrentUser(newUser);
    setUserRole(newUser.role);
    setIsAuthenticated(true);
    setIsLoading(false);
    return { success: true, user: newUser };
  }, [getAllUsers]);

  const signout = useCallback(() => {
    setIsLoading(true); 
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_DATA_KEY);
    localStorage.removeItem(AUTH_USER_ROLE_KEY);
    setCurrentUser(null);
    setUserRole(null);
    setIsAuthenticated(false);
    setIsLoading(false); 
    navigate('/'); 
  }, [navigate]);

  /**
   * Updates the current user's details in the context and localStorage.
   * This function is responsible for persisting profile changes.
   * @param {object} updatedDetails - An object containing the fields to update (e.g., { firstName, lastName }).
   * Password changes should be handled separately with more security.
   * @returns {boolean} True if update was successful, false otherwise.
   */
  const updateCurrentUserData = useCallback((updatedDetails) => {
    if (!currentUser || !isAuthenticated) {
      console.error("AuthContext: No current user to update or not authenticated.");
      return false; // Or throw an error
    }

    // Create the new user data object by merging current user data with updated details
    const newUserData = { ...currentUser, ...updatedDetails };

    // 1. Update the user's data in the appCustomRegisteredUsers list in localStorage
    //    This is important if the user was one who signed up during runtime.
    let customUsers = [];
    let userFoundAndUpdatedInCustomList = false;
    try {
      const customUsersString = localStorage.getItem(CUSTOM_USERS_STORAGE_KEY);
      if (customUsersString) {
        customUsers = JSON.parse(customUsersString);
        const customUserIndex = customUsers.findIndex(u => u.id === currentUser.id);
        if (customUserIndex > -1) {
          // Update the user in the custom list
          customUsers[customUserIndex] = { ...customUsers[customUserIndex], ...updatedDetails };
          localStorage.setItem(CUSTOM_USERS_STORAGE_KEY, JSON.stringify(customUsers));
          userFoundAndUpdatedInCustomList = true;
          console.log("AuthContext: User updated in customRegisteredUsers list.");
        }
      }
    } catch (error) {
      console.error("AuthContext: Error updating custom user in localStorage", error);
      // Depending on desired behavior, you might return false or let it proceed to update session data
    }
    
    // Note: We are not updating the static initialBuyersData or initialSellersData arrays here,
    // as they are imported and represent a baseline. If a static user updates their profile,
    // their updated details will be primarily managed via the session (authUserDataKey) and
    // if they were also added to customUsers (e.g. if they signed up with an email matching a static one,
    // though our current signup prevents this), they'd be updated there.
    // For a true DB, this would be a single update operation.

    // 2. Update the session-specific user data in localStorage
    localStorage.setItem(AUTH_USER_DATA_KEY, JSON.stringify(newUserData));
    console.log("AuthContext: User data updated in session storage (authUserDataKey).");

    // 3. Update the currentUser state in the context to reflect changes immediately in the UI
    setCurrentUser(newUserData);
    
    // If role was part of updatedDetails and changed, update userRole state as well
    if (updatedDetails.role && updatedDetails.role !== userRole) {
        setUserRole(updatedDetails.role);
        localStorage.setItem(AUTH_USER_ROLE_KEY, updatedDetails.role);
    }

    console.log("AuthContext: Current user state updated in context.", newUserData);
    return true; // Indicate success
  }, [currentUser, isAuthenticated, userRole]); // Added userRole to dependencies

  const value = {
    currentUser,
    isAuthenticated,
    userRole,
    isLoading,
    signin,     
    signup,    
    signout,   
    updateCurrentUserData
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
