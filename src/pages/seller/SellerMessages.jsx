// src/pages/seller/SellerMessages.jsx
import React, { useEffect, useState, useMemo, useCallback } from "react";
import Sidebar from "../../components/Sidebar";
import { useAuthContext } from "../../context/AuthContext";
import toast from 'react-hot-toast';
import {
  ChatBubbleLeftEllipsisIcon, PaperAirplaneIcon, ArrowLeftIcon,
  ArchiveBoxIcon, PlusCircleIcon, ChartBarIcon, InboxIcon
} from "@heroicons/react/24/outline";
import { getConversationsForUser, getConversationById, sendMockMessage, getMockUserById } from "../../data/mockMessages"; // Using mock data
import { formatDistanceToNowStrict, parseISO } from 'date-fns';

// Seller Sidebar Links
const sellerLinks = [
  { label: "Dashboard", path: "/seller/dashboard", icon: ChartBarIcon },
  { label: "My Products", path: "/seller/products", icon: ArchiveBoxIcon },
  { label: "Add Product", path: "/seller/add-product", icon: PlusCircleIcon },
  { label: "Messages", path: "/seller/messages", icon: ChatBubbleLeftEllipsisIcon }
];

// Component for an individual conversation in the list
const ConversationListItem = ({ conversation, onSelectConversation, isActive }) => {
  const { otherParticipant, lastMessageText, lastMessageTimestamp, isUnread, unreadMessagesCount } = conversation;

  return (
    <button
      onClick={() => onSelectConversation(conversation.id)}
      className={`w-full text-left p-3 hover:bg-gray-100 rounded-lg transition-colors duration-150 flex items-start space-x-3
        ${isActive ? 'bg-blue-50 shadow-sm' : ''}
        ${isUnread ? 'font-semibold text-gray-800' : 'text-gray-600'}`}
    >
      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-500 text-sm">
        {otherParticipant.avatarFallback || otherParticipant.name?.charAt(0).toUpperCase() || '?'}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center">
          <p className={`truncate text-sm ${isUnread ? 'text-blue-600' : 'text-gray-800'}`}>
            {otherParticipant.name}
          </p>
          <p className={`text-xs whitespace-nowrap ${isUnread ? 'text-blue-500' : 'text-gray-400'}`}>
            {lastMessageTimestamp ? formatDistanceToNowStrict(parseISO(lastMessageTimestamp), { addSuffix: true }) : ''}
          </p>
        </div>
        <div className="flex justify-between items-center mt-1">
          <p className={`truncate text-xs ${isUnread ? 'text-gray-700' : 'text-gray-500'}`}>
            {lastMessageText}
          </p>
          {isUnread && unreadMessagesCount > 0 && (
            <span className="ml-2 px-2 py-0.5 text-xs font-bold text-white bg-red-500 rounded-full">
              {unreadMessagesCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
};

// Component for displaying a single chat message
const ChatMessageBubble = ({ message, currentUserId, senderDetails }) => {
  const isCurrentUserSender = message.senderId === currentUserId;
  const senderName = senderDetails?.name || 'Unknown';

  return (
    <div className={`flex mb-3 ${isCurrentUserSender ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[70%] p-3 rounded-xl shadow-sm ${
        isCurrentUserSender 
          ? 'bg-blue-500 text-white rounded-br-none' // Seller's message
          : 'bg-gray-200 text-gray-800 rounded-bl-none' // Buyer's message
      }`}>
        {!isCurrentUserSender && ( // Show name only if it's the other person (Buyer)
          <p className="text-xs font-semibold mb-0.5 text-gray-600">{senderName}</p>
        )}
        <p className="text-sm whitespace-pre-wrap break-words">{message.text}</p>
        <p className={`text-xs mt-1.5 opacity-80 text-right ${isCurrentUserSender ? 'text-blue-100' : 'text-gray-500'}`}>
          {message.timestamp ? formatDistanceToNowStrict(parseISO(message.timestamp), { addSuffix: true }) : 'sending...'}
        </p>
      </div>
    </div>
  );
};


export default function SellerMessages() {
  const { currentUser, isAuthenticated, userRole, isLoading: isAuthLoading } = useAuthContext();
  
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);
  const [isSending, setIsSending] = useState(false);

  const currentUserDetails = useMemo(() => {
      if (currentUser) return getMockUserById(currentUser.id);
      return null;
  }, [currentUser]);

  const loadConversations = useCallback(() => {
    if (!currentUser || userRole !== 'Seller') {
      setConversations([]);
      setIsLoadingMessages(false);
      return;
    }
    setIsLoadingMessages(true);
    setTimeout(() => {
      const userConversations = getConversationsForUser(currentUser.id);
      setConversations(userConversations);
      setIsLoadingMessages(false);
    }, 500);
  }, [currentUser, userRole]);

  useEffect(() => {
    if (!isAuthLoading) {
        loadConversations();
    }
  }, [isAuthLoading, loadConversations]);

  const handleSelectConversation = useCallback((conversationId) => {
    if (!currentUser) return;
    const fullConvo = getConversationById(conversationId, currentUser.id);
    setSelectedConversation(fullConvo);
    setConversations(prev => 
        prev.map(c => c.id === conversationId ? {...c, isUnread: false, unreadMessagesCount: 0} : c)
    );
  }, [currentUser]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation || !currentUser || isSending) return;

    setIsSending(true);
    setTimeout(() => {
      const updatedConversation = sendMockMessage(selectedConversation.id, currentUser.id, newMessage.trim());
      if (updatedConversation) {
        const refreshedConvo = getConversationById(selectedConversation.id, currentUser.id);
        setSelectedConversation(refreshedConvo);
        loadConversations(); 
      } else {
        toast.error("Failed to send message.");
      }
      setNewMessage("");
      setIsSending(false);
    }, 300);
  };
  
  const handleBackToList = () => {
    setSelectedConversation(null);
    loadConversations();
  };

  if (isAuthLoading || (isLoadingMessages && conversations.length === 0)) {
    return (
      <div className="flex h-screen bg-gray-100">
        <Sidebar links={sellerLinks} userRole="Seller" userName={currentUserDetails?.name || "User"} />
        <main className="flex-1 p-6 flex justify-center items-center">
          <p className="text-gray-500 animate-pulse text-lg">Loading Your Messages...</p>
        </main>
      </div>
    );
  }

  if (!isAuthenticated || userRole !== 'Seller') {
     return (
      <div className="flex h-screen bg-gray-100">
        <Sidebar links={sellerLinks} userRole="Seller" />
        <main className="flex-1 p-6 flex flex-col justify-center items-center text-center">
            <ChatBubbleLeftEllipsisIcon className="h-16 w-16 text-gray-300 mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Access Denied</h2>
            <p className="text-gray-600">Please sign in as a Seller to view your messages.</p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar links={sellerLinks} userRole="Seller" userName={currentUserDetails?.name || "User"} />
      
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        <div className={`
          ${selectedConversation && 'hidden md:flex'} md:flex-col 
          w-full md:w-2/5 lg:w-1/3 xl:w-1/4 
          border-r border-gray-200 bg-white 
          flex flex-col
        `}>
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">Messages</h2>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
            {conversations.length > 0 ? (
              conversations.map(convo => (
                <ConversationListItem 
                  key={convo.id} 
                  conversation={convo} 
                  onSelectConversation={handleSelectConversation}
                  isActive={selectedConversation?.id === convo.id}
                />
              ))
            ) : (
              !isLoadingMessages && (
                <div className="p-4 text-center text-gray-500">
                  <InboxIcon className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                  No conversations yet.
                </div>
              )
            )}
            {isLoadingMessages && conversations.length === 0 && <p className="p-4 text-gray-400">Loading...</p>}
          </div>
        </div>

        <div className={`
          ${!selectedConversation && 'hidden md:flex'} md:flex-col 
          w-full md:w-3/5 lg:w-2/3 xl:w-3/4 
          bg-gray-50 flex flex-col
        `}>
          {selectedConversation ? (
            <>
              <div className="p-3 sm:p-4 border-b border-gray-200 bg-white flex items-center space-x-3 shadow-sm">
                <button onClick={handleBackToList} className="md:hidden p-2 rounded-full hover:bg-gray-100 text-gray-600">
                  <ArrowLeftIcon className="h-5 w-5" />
                </button>
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-500 text-sm">
                  {selectedConversation.otherParticipant?.avatarFallback || selectedConversation.otherParticipantName?.charAt(0).toUpperCase() || '?'}
                </div>
                <div>
                    <h3 className="text-md font-semibold text-gray-800">{selectedConversation.otherParticipantName || "Conversation"}</h3>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                {selectedConversation.messages.map(msg => (
                  <ChatMessageBubble 
                    key={msg.id} 
                    message={msg} 
                    currentUserId={currentUser.id}
                    senderDetails={selectedConversation.participantsDetails[msg.senderId]}
                  />
                ))}
                 {isSending && <p className="text-xs text-gray-400 italic text-center my-2">Sending...</p>}
              </div>

              <div className="p-3 sm:p-4 border-t border-gray-200 bg-white">
                <form onSubmit={handleSendMessage} className="flex items-center space-x-2 sm:space-x-3">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm"
                    disabled={isSending}
                  />
                  <button 
                    type="submit" 
                    className="p-2.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors shadow focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:opacity-70"
                    disabled={!newMessage.trim() || isSending}
                    aria-label="Send message"
                  >
                    <PaperAirplaneIcon className="h-5 w-5" />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="hidden md:flex flex-1 flex-col justify-center items-center text-center p-8 text-gray-500">
              <ChatBubbleLeftEllipsisIcon className="h-20 w-20 text-gray-300 mb-4" />
              <h2 className="text-xl font-semibold">Select a conversation</h2>
              <p>Choose a conversation from the list to view messages.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
