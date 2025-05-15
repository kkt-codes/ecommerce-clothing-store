// src/pages/seller/SellerMessages.jsx
import React, { useEffect, useState, useMemo, useCallback } from "react";
import Sidebar from "../../components/Sidebar";
import { useAuth } from "../../hooks/useAuth";
import toast from 'react-hot-toast';
import { PaperAirplaneIcon, InboxArrowDownIcon, UserCircleIcon, ArchiveBoxIcon, PlusCircleIcon, ChartBarIcon, ChatBubbleLeftEllipsisIcon } from "@heroicons/react/24/outline";
// Assuming MessageCard.jsx is not used directly, but its concept is incorporated.

export default function SellerMessages() {
  const { sellerData, isLoading: isAuthLoading } = useAuth();
  const [conversations, setConversations] = useState({}); // Object where keys are buyer IDs
  const [replyContent, setReplyContent] = useState({}); // Object to hold reply text for each conversation: { buyerId: "reply text" }
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);

  // Seller Sidebar Links - Copied from SellerDashboard for consistency
  const sellerLinks = [
    { label: "Dashboard", path: "/seller/dashboard", icon: ChartBarIcon },
    { label: "My Products", path: "/seller/products", icon: ArchiveBoxIcon },
    { label: "Add Product", path: "/seller/add-product", icon: PlusCircleIcon },
    { label: "Messages", path: "/seller/messages", icon: ChatBubbleLeftEllipsisIcon }
  ];

  const loadAndProcessMessages = useCallback(() => {
    if (!sellerData) return;
    setIsLoadingMessages(true);
    try {
      const allMessagesString = localStorage.getItem("messages");
      const allMessages = allMessagesString ? JSON.parse(allMessagesString) : [];
      
      const relatedMessages = allMessages.filter(
        (msg) => String(msg.receiverId) === String(sellerData.id) || String(msg.senderId) === String(sellerData.id)
      );

      // Group messages by the "other" person in the conversation
      const groupedConversations = relatedMessages.reduce((acc, msg) => {
        const otherPartyId = String(msg.senderId) === String(sellerData.id) ? msg.receiverId : msg.senderId;
        const otherPartyName = String(msg.senderId) === String(sellerData.id) ? msg.receiverName : msg.senderName; // Assume receiverName exists or fetch it

        if (!acc[otherPartyId]) {
          acc[otherPartyId] = {
            buyerId: otherPartyId, // Store buyerId explicitly
            buyerName: otherPartyName || `User ${otherPartyId.substring(0,6)}`, // Fallback name
            messages: []
          };
        }
        acc[otherPartyId].messages.push(msg);
        return acc;
      }, {});

      // Sort messages within each conversation chronologically
      for (const buyerId in groupedConversations) {
        groupedConversations[buyerId].messages.sort((a, b) => new Date(a.date) - new Date(b.date));
      }
      setConversations(groupedConversations);
    } catch (error) {
      console.error("Error loading or processing messages:", error);
      toast.error("Could not load messages.");
      setConversations({});
    }
    setIsLoadingMessages(false);
  }, [sellerData]);

  useEffect(() => {
    if (!isAuthLoading && sellerData) {
      loadAndProcessMessages();
    }
  }, [isAuthLoading, sellerData, loadAndProcessMessages]);

  const handleReplyChange = (buyerId, text) => {
    setReplyContent(prev => ({ ...prev, [buyerId]: text }));
  };

  const handleSendReply = (buyerId, buyerName) => {
    if (!sellerData || !replyContent[buyerId]?.trim()) {
      toast.error("Reply cannot be empty.");
      return;
    }

    const newReply = {
      id: `message-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      senderId: sellerData.id,
      senderName: `${sellerData.firstName} ${sellerData.lastName}`, // Seller's name
      receiverId: buyerId,
      receiverName: buyerName, // Buyer's name (passed to function)
      content: replyContent[buyerId].trim(),
      date: new Date().toISOString(), // Use ISOString for consistency
    };

    try {
      const allMessagesString = localStorage.getItem("messages");
      const allMessages = allMessagesString ? JSON.parse(allMessagesString) : [];
      allMessages.push(newReply);
      localStorage.setItem("messages", JSON.stringify(allMessages));
      
      toast.success("Reply sent!");
      setReplyContent(prev => ({ ...prev, [buyerId]: "" })); // Clear reply input for this conversation
      loadAndProcessMessages(); // Reload messages to show the new reply
    } catch (error) {
      console.error("Error sending reply:", error);
      toast.error("Could not send reply.");
    }
  };
  
  const conversationArray = useMemo(() => Object.values(conversations).sort((a,b) => {
    const lastMsgA = a.messages[a.messages.length - 1]?.date;
    const lastMsgB = b.messages[b.messages.length - 1]?.date;
    if (!lastMsgA || !lastMsgB) return 0;
    return new Date(lastMsgB) - new Date(lastMsgA); // Sort conversations by most recent message
  }), [conversations]);


  if (isAuthLoading || isLoadingMessages) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar links={sellerLinks} userRole="Seller" userName={sellerData?.firstName || "User"} />
        <main className="flex-1 p-6 sm:p-8 flex justify-center items-center">
          <p className="text-gray-500 animate-pulse">Loading Messages...</p>
        </main>
      </div>
    );
  }
  
  if (!sellerData) {
     return (
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar links={sellerLinks} userRole="Seller" />
        <main className="flex-1 p-6 sm:p-8 flex justify-center items-center">
          <p className="text-gray-600">Please log in as a seller to view messages.</p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar links={sellerLinks} userRole="Seller" userName={sellerData.firstName} />
      <main className="flex-1 p-6 sm:p-8">
        <header className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center">
            <InboxArrowDownIcon className="h-8 w-8 mr-3 text-blue-600" />
            Your Messages
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            View and respond to inquiries from buyers.
          </p>
        </header>

        {conversationArray.length > 0 ? (
          <div className="space-y-8">
            {conversationArray.map(convo => (
              <div key={convo.buyerId} className="bg-white p-4 sm:p-6 rounded-xl shadow-lg">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-700 mb-4 border-b pb-3">
                  Conversation with: <span className="text-blue-600">{convo.buyerName}</span>
                </h2>
                <div className="space-y-4 max-h-96 overflow-y-auto pr-2 mb-4">
                  {convo.messages.map(msg => (
                    <div 
                      key={msg.id} 
                      className={`flex ${String(msg.senderId) === String(sellerData.id) ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[70%] p-3 rounded-lg shadow-sm ${
                        String(msg.senderId) === String(sellerData.id) 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-gray-200 text-gray-800'
                      }`}>
                        <p className="text-xs font-medium mb-0.5">
                          {String(msg.senderId) === String(sellerData.id) ? "You" : msg.senderName}
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
                <form onSubmit={(e) => { e.preventDefault(); handleSendReply(convo.buyerId, convo.buyerName); }} className="mt-4 flex gap-2 items-center border-t pt-4">
                  <input
                    type="text"
                    value={replyContent[convo.buyerId] || ""}
                    onChange={(e) => handleReplyChange(convo.buyerId, e.target.value)}
                    placeholder="Type your reply..."
                    className="flex-grow px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm"
                  />
                  <button
                    type="submit"
                    className="p-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
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
            <h2 className="text-xl font-semibold text-gray-700 mb-2">No Messages Yet</h2>
            <p className="text-gray-500">
              When buyers contact you, their messages will appear here.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
