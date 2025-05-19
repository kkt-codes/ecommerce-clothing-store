import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import initialBuyersData from '../data/buyers.json'; // Predefined buyer users
import initialSellersData from '../data/sellers.json'; // Predefined seller users

// Create the authentication context
const AuthContext = createContext(null);

// Define localStorage keys for storing authentication data to ensure consistency
const CUSTOM_USERS_STORAGE_KEY = 'appCustomRegisteredUsers'; // Stores users signed up during runtime
const AUTH_TOKEN_KEY = 'appAuthToken'; // Stores the mock authentication token
const AUTH_USER_DATA_KEY = 'appAuthUserData'; // Stores data of the currently signed-in user
const AUTH_USER_ROLE_KEY = 'appAuthUserRole'; // Stores the role of the currently signed-in user

/**
 * Custom hook to easily access the authentication context.
 * Throws an error if used outside of an AuthProvider.
 */
export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

/**
 * AuthProvider component that wraps the application to provide authentication state and functions.
 */
export const AuthProvider = ({ children }) => {
  // State for the currently signed-in user's data
  const [currentUser, setCurrentUser] = useState(null);
  // State to indicate if a user is currently authenticated
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // State for the role of the authenticated user ('Buyer', 'Seller', or null)
  const [userRole, setUserRole] = useState(null); 
  // State to indicate if the initial authentication check (from localStorage) is in progress
  const [isLoading, setIsLoading] = useState(true); 
  
  const navigate = useNavigate(); // Hook for programmatic navigation

  /**
   * Retrieves all users by combining predefined static users (from JSON files)
   * with custom users registered during runtime (stored in localStorage).
   * This allows newly signed-up users to be recognized for sign-in.
   */
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
    
    // Start with custom users, then add static users if their email isn't already in the custom list
    const all = [...customUsers];
    [...initialBuyersData, ...initialSellersData].forEach(staticUser => {
        if (!all.find(u => u.email === staticUser.email)) {
            all.push(staticUser);
        }
    });
    return all;
  }, []); // Empty dependency array as initialBuyersData and initialSellersData don't change

  /**
   * Effect to check for an existing authenticated session in localStorage when the app loads.
   * This allows users to stay signed in across page refreshes or browser restarts.
   */
  useEffect(() => {
    setIsLoading(true); // Start loading
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    const userDataString = localStorage.getItem(AUTH_USER_DATA_KEY);
    const roleString = localStorage.getItem(AUTH_USER_ROLE_KEY);

    if (token && userDataString && roleString) {
      try {
        const userData = JSON.parse(userDataString);
        // Restore session if all data is present and valid
        setCurrentUser(userData);
        setUserRole(roleString);
        setIsAuthenticated(true); 
        console.log("AuthContext: Session restored for", userData.email);
      } catch (error) {
        console.error("AuthContext: Error parsing user data from localStorage during session restore", error);
        // Clear potentially corrupted data if parsing fails
        localStorage.removeItem(AUTH_TOKEN_KEY);
        localStorage.removeItem(AUTH_USER_DATA_KEY);
        localStorage.removeItem(AUTH_USER_ROLE_KEY);
      }
    }
    setIsLoading(false); // Finished initial auth check
  }, []); // Runs once on component mount

  /**
   * Handles the "Sign In" action.
   * @param {string} email - User's email.
   * @param {string} password - User's password.
   * @param {'Buyer'|'Seller'|null} [roleAttempt] - Optional: The role the user is attempting to sign in as. 
   * If null, checks against both buyer and seller lists.
   * @returns {Promise<{success: boolean, user?: object, error?: string}>} Result of the sign-in attempt.
   */
  const signin = useCallback(async (email, password, roleAttempt) => {
    setIsLoading(true);
    const combinedUsers = getAllUsers(); // Get all known users
    let foundUser = null;

    // Find user based on email, password, and optionally roleAttempt
    if (roleAttempt) {
        // If a specific role is provided, only check users with that role
        foundUser = combinedUsers.find(u => u.email === email && u.password === password && u.role === roleAttempt);
    } else {
        // If no role is specified, find any user matching email and password
        foundUser = combinedUsers.find(u => u.email === email && u.password === password);
    }
    
    // Simulate API delay for better UX
    await new Promise(resolve => setTimeout(resolve, 500));

    if (foundUser) {
      const determinedRole = foundUser.role; // Role is part of the user object
      const token = `mockToken-${determinedRole.toLowerCase()}-${foundUser.id}-${Date.now()}`;
      const userDataToStore = { // Store a consistent user object shape in context and localStorage
        id: foundUser.id,
        firstName: foundUser.firstName,
        lastName: foundUser.lastName,
        email: foundUser.email,
        role: determinedRole,
      };

      // Persist authentication state to localStorage
      localStorage.setItem(AUTH_TOKEN_KEY, token);
      localStorage.setItem(AUTH_USER_DATA_KEY, JSON.stringify(userDataToStore));
      localStorage.setItem(AUTH_USER_ROLE_KEY, determinedRole);
      
      // Update context state
      setCurrentUser(userDataToStore);
      setUserRole(determinedRole);
      setIsAuthenticated(true);
      setIsLoading(false);
      console.log("AuthContext: User signed in:", userDataToStore.email, "as", determinedRole);
      return { success: true, user: userDataToStore }; 
    } else {
      setIsLoading(false);
      console.log("AuthContext: Sign in failed for email:", email);
      return { success: false, error: "Invalid email or password." }; 
    }
  }, [getAllUsers]); // Dependency: getAllUsers

  /**
   * Handles the "Sign Up" action for new users.
   * @param {object} userDataFromForm - Object containing { firstName, lastName, email, password, role }.
   * @returns {Promise<{success: boolean, user?: object, error?: string}>} Result of the sign-up attempt.
   */
  const signup = useCallback(async (userDataFromForm) => {
    setIsLoading(true);
    
    const allCurrentUsers = getAllUsers();
    // Check if email already exists among all users (static + custom)
    const existingUserByEmail = allCurrentUsers.find(u => u.email === userDataFromForm.email);

    if (existingUserByEmail) {
        setIsLoading(false);
        console.log("AuthContext: Signup failed, email already in use:", userDataFromForm.email);
        return { success: false, error: "Email already in use." };
    }

    // Create a new user object
    const newUser = {
        id: `${userDataFromForm.role.toLowerCase()}-custom-${Date.now()}`, // Unique ID for custom user
        firstName: userDataFromForm.firstName,
        lastName: userDataFromForm.lastName,
        email: userDataFromForm.email,
        password: userDataFromForm.password, // Storing plain text for mock environment
        role: userDataFromForm.role,
    };
    
    // Add the new user to the list of custom users in localStorage
    let customUsers = [];
    try {
        const customUsersString = localStorage.getItem(CUSTOM_USERS_STORAGE_KEY);
        if (customUsersString) {
            customUsers = JSON.parse(customUsersString);
        }
    } catch (error) {
        console.error("AuthContext: Error parsing custom users from localStorage during signup", error);
        // If parsing fails, start with an empty array to avoid losing other custom users if possible,
        // though this might indicate a larger issue with localStorage data.
    }
    customUsers.push(newUser);
    localStorage.setItem(CUSTOM_USERS_STORAGE_KEY, JSON.stringify(customUsers));
    console.log("AuthContext: New user added to custom users in localStorage:", newUser.email);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Automatically sign in the new user by setting session storage and context state
    const token = `mockToken-${newUser.role.toLowerCase()}-${newUser.id}-${Date.now()}`;
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    localStorage.setItem(AUTH_USER_DATA_KEY, JSON.stringify(newUser)); // Store the new user object for the session
    localStorage.setItem(AUTH_USER_ROLE_KEY, newUser.role);

    setCurrentUser(newUser);
    setUserRole(newUser.role);
    setIsAuthenticated(true);
    setIsLoading(false);
    console.log("AuthContext: User signed up and signed in:", newUser.email, "as", newUser.role);
    return { success: true, user: newUser };
  }, [getAllUsers]); // Dependency: getAllUsers

  /**
   * Handles the "Sign Out" action.
   * Clears authentication state from context and localStorage.
   * Navigates the user to the homepage.
   */
  const signout = useCallback(() => {
    setIsLoading(true); // Indicate a change is happening
    console.log("AuthContext: Signing out user:", currentUser?.email);
    
    // Clear authentication data from localStorage
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_DATA_KEY);
    localStorage.removeItem(AUTH_USER_ROLE_KEY);
    
    // Reset context state
    setCurrentUser(null);
    setUserRole(null);
    setIsAuthenticated(false);
    setIsLoading(false); // Finished sign out process
    
    navigate('/'); // Redirect to homepage
  }, [navigate, currentUser]); // Dependency: navigate, currentUser (for logging)

  // The value provided by the context to its consumers
  const value = {
    currentUser,
    isAuthenticated,
    userRole,
    isLoading,
    signin,     // Expose the 'signin' function
    signup,     // Expose the 'signup' function
    signout,    // Expose the 'signout' function
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
