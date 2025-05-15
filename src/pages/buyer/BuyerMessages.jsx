// src/pages/buyer/BuyerMessages.jsx
import React, { useEffect, useState, useMemo, useCallback } from "react";
import Sidebar from "../../components/Sidebar";
import { useBuyerAuth } from "../../hooks/useBuyerAuth";
import toast from 'react-hot-toast';
import { PaperAirplaneIcon, InboxArrowDownIcon, UserCircleIcon, ListBulletIcon, ChartBarIcon, ChatBubbleLeftEllipsisIcon, HeartIcon } from "@heroicons/react/24/outline";
import sellersData from "../../data/sellers.json"; // To get seller names if not in message

export default function BuyerMessages() {
  const { buyerData, isLoading: isAuthLoading } = useBuyerAuth();
  const [conversations, setConversations] = useState({}); // Object where keys are seller IDs
  const [replyContent, setReplyContent] = useState({}); // { sellerId: "reply text" }
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);

  // Buyer Sidebar Links - Copied from BuyerDashboard for consistency
  const buyerLinks = [
    { label: "Dashboard", path: "/buyer/dashboard", icon: ChartBarIcon },
    { label: "My Orders", path: "/buyer/orders", icon: ListBulletIcon },
    { label: "Messages", path: "/buyer/messages", icon: ChatBubbleLeftEllipsisIcon },
    { label: "My Profile", path: "/buyer/profile", icon: UserCircleIcon },
    { label: "My Favorites", path: "/buyer/favorites", icon: HeartIcon },
  ];

  const getSellerNameById = (sellerId) => {
    const seller = sellersData.find(s => String(s.id) === String(sellerId));
    return seller ? `${seller.firstName} ${seller.lastName}` : `Seller ${sellerId.substring(0,6)}`;
  };

  const loadAndProcessMessages = useCallback(() => {
    if (!buyerData) return;
    setIsLoadingMessages(true);
    try {
      const allMessagesString = localStorage.getItem("messages");
      const allMessages = allMessagesString ? JSON.parse(allMessagesString) : [];
      
      const relatedMessages = allMessages.filter(
        (msg) => String(msg.receiverId) === String(buyerData.id) || String(msg.senderId) === String(buyerData.id)
      );

      const groupedConversations = relatedMessages.reduce((acc, msg) => {
        const otherPartyId = String(msg.senderId) === String(buyerData.id) ? msg.receiverId : msg.senderId;
        // Determine the name of the other party (seller)
        let otherPartyName = "";
        if (String(msg.senderId) === String(buyerData.id)) { // Buyer sent this message
            otherPartyName = msg.receiverName || getSellerNameById(msg.receiverId);
        } else { // Buyer received this message
            otherPartyName = msg.senderName || getSellerNameById(msg.senderId);
        }


        if (!acc[otherPartyId]) {
          acc[otherPartyId] = {
            sellerId: otherPartyId,
            sellerName: otherPartyName || `Seller ${otherPartyId.substring(0,6)}`,
            messages: []
          };
        }
        acc[otherPartyId].messages.push(msg);
        return acc;
      }, {});

      for (const sellerId in groupedConversations) {
        groupedConversations[sellerId].messages.sort((a, b) => new Date(a.date) - new Date(b.date));
      }
      setConversations(groupedConversations);
    } catch (error) {
      console.error("Error loading or processing messages:", error);
      toast.error("Could not load messages.");
      setConversations({});
    }
    setIsLoadingMessages(false);
  }, [buyerData]);

  useEffect(() => {
    if (!isAuthLoading && buyerData) {
      loadAndProcessMessages();
    }
  }, [isAuthLoading, buyerData, loadAndProcessMessages]);

  const handleReplyChange = (sellerId, text) => {
    setReplyContent(prev => ({ ...prev, [sellerId]: text }));
  };

  const handleSendReply = (sellerId, sellerName) => {
    if (!buyerData || !replyContent[sellerId]?.trim()) {
      toast.error("Reply cannot be empty.");
      return;
    }

    const newReply = {
      id: `message-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      senderId: buyerData.id,
      senderName: `${buyerData.firstName} ${buyerData.lastName}`,
      receiverId: sellerId,
      receiverName: sellerName, // Seller's name
      content: replyContent[sellerId].trim(),
      date: new Date().toISOString(),
    };

    try {
      const allMessagesString = localStorage.getItem("messages");
      const allMessages = allMessagesString ? JSON.parse(allMessagesString) : [];
      allMessages.push(newReply);
      localStorage.setItem("messages", JSON.stringify(allMessages));
      
      toast.success("Reply sent!");
      setReplyContent(prev => ({ ...prev, [sellerId]: "" }));
      loadAndProcessMessages(); 
    } catch (error) {
      console.error("Error sending reply:", error);
      toast.error("Could not send reply.");
    }
  };
  
  const conversationArray = useMemo(() => Object.values(conversations).sort((a,b) => {
    const lastMsgA = a.messages[a.messages.length - 1]?.date;
    const lastMsgB = b.messages[b.messages.length - 1]?.date;
    if (!lastMsgA || !lastMsgB) return 0;
    return new Date(lastMsgB) - new Date(lastMsgA);
  }), [conversations]);

  if (isAuthLoading || isLoadingMessages) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar links={buyerLinks} userRole="Buyer" userName={buyerData?.firstName || "User"} />
        <main className="flex-1 p-6 sm:p-8 flex justify-center items-center">
          <p className="text-gray-500 animate-pulse">Loading Your Messages...</p>
        </main>
      </div>
    );
  }
  
  if (!buyerData) {
     return (
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar links={buyerLinks} userRole="Buyer" />
        <main className="flex-1 p-6 sm:p-8 flex justify-center items-center">
          <p className="text-gray-600">Please log in as a buyer to view your messages.</p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar links={buyerLinks} userRole="Buyer" userName={buyerData.firstName} />
      <main className="flex-1 p-6 sm:p-8">
        <header className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center">
            <InboxArrowDownIcon className="h-8 w-8 mr-3 text-purple-600" />
            Your Conversations
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            View and reply to messages with sellers.
          </p>
        </header>

        {conversationArray.length > 0 ? (
          <div className="space-y-8">
            {conversationArray.map(convo => (
              <div key={convo.sellerId} className="bg-white p-4 sm:p-6 rounded-xl shadow-lg">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-700 mb-4 border-b pb-3">
                  Conversation with: <span className="text-purple-600">{convo.sellerName}</span>
                </h2>
                <div className="space-y-4 max-h-96 overflow-y-auto pr-2 mb-4">
                  {convo.messages.map(msg => (
                    <div 
                      key={msg.id} 
                      className={`flex ${String(msg.senderId) === String(buyerData.id) ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[70%] p-3 rounded-lg shadow-sm ${
                        String(msg.senderId) === String(buyerData.id) 
                          ? 'bg-purple-500 text-white' // Buyer's messages
                          : 'bg-gray-200 text-gray-800'   // Seller's messages
                      }`}>
                        <p className="text-xs font-medium mb-0.5">
                          {String(msg.senderId) === String(buyerData.id) ? "You" : msg.senderName}
                        </p>
                        <p className="text-sm">{msg.content}</p>
                        <p className="text-xs mt-1.5 opacity-75 text-right">
                          {new Date(msg.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} | {new Date(msg.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Reply Form */}
                <form onSubmit={(e) => { e.preventDefault(); handleSendReply(convo.sellerId, convo.sellerName); }} className="mt-4 flex gap-2 items-center border-t pt-4">
                  <input
                    type="text"
                    value={replyContent[convo.sellerId] || ""}
                    onChange={(e) => handleReplyChange(convo.sellerId, e.target.value)}
                    placeholder="Type your reply..."
                    className="flex-grow px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 sm:text-sm"
                  />
                  <button
                    type="submit"
                    className="p-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-1"
                    aria-label="Send reply"
                  >
                    <PaperAirplaneIcon className="h-5 w-5" />
                  </button>
                </form>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl shadow-md">
            <ChatBubbleLeftEllipsisIcon className="mx-auto h-16 w-16 text-gray-300 mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">No Conversations Yet</h2>
            <p className="text-gray-500">
              Contact a seller from a product page to start a conversation.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
