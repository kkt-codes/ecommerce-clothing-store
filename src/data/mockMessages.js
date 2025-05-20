import buyersData from './buyers.json';
import sellersData from './sellers.json';

export const getMockUserById = (userId) => {
  let user = null;

  // 1. Check buyersData
  user = buyersData.find(b => String(b.id) === String(userId));
  if (user) {
    return {
      id: user.id,
      name: `${user.firstName} ${user.lastName}`,
      avatarFallback: `${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}`.toUpperCase(),
      role: user.role || 'Buyer', // Ensure role is present
    };
  }

  // 2. Check sellersData
  user = sellersData.find(s => String(s.id) === String(userId));
  if (user) {
    // For sellers, you might have a company name or prefer first/last name.
    // For now, using first/last name as per structure.
    // If sellers have a 'companyName' field in sellers.json, you could use that.
    return {
      id: user.id,
      name: `${user.firstName} ${user.lastName}`, // Or a company name if available
      avatarFallback: `${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}`.toUpperCase(),
      role: user.role || 'Seller', // Ensure role is present
    };
  }
  
  // 3. Fallback for any other user ID not found in buyers.json or sellers.json
  // (e.g., if AuthContext creates dynamic IDs for custom registered users not yet in these static files,
  // or if a conversation involves an ID not covered).
  // This part can be adjusted based on how comprehensive buyers/sellers.json are intended to be.
  console.warn(`getMockUserById: User ID "${userId}" not found in buyers.json or sellers.json. Returning generic.`);
  return { 
    id: userId, 
    name: `User ${String(userId).substring(0,6)}`, 
    avatarFallback: String(userId).charAt(0).toUpperCase() + (String(userId).charAt(1) || ''), 
    role: 'Unknown' 
  };
};


// Main conversation data store
// In a real app, this would come from a backend. We simulate it here.
// `unreadCountFor[userId]` indicates how many messages in this conversation are unread by that specific user.
let conversationsStore = [
  {
    id: 'conv_b001_s001',
    participants: ['buyer-001', 'seller-001'], // Buyer 1 with Seller 1
    messages: [
      { id: 'msg1_1', senderId: 'buyer-001', text: 'Hi, I’m interested in the Elegant Red Dress. Is it available in size M?', timestamp: '2025-05-19T10:00:00Z' },
      { id: 'msg1_2', senderId: 'seller-001', text: 'Hello Jane! Yes, the Elegant Red Dress is available in Medium. It tends to run true to size.', timestamp: '2025-05-19T10:05:00Z' },
      { id: 'msg1_3', senderId: 'buyer-001', text: 'Great! How long does shipping usually take to downtown?', timestamp: '2025-05-19T10:07:00Z' },
      { id: 'msg1_4', senderId: 'seller-001', text: 'Typically 2-3 business days. We can also arrange express shipping if needed.', timestamp: '2025-05-20T09:15:00Z' },
    ],
    lastMessageTimestamp: '2025-05-20T09:15:00Z',
    unreadCountFor: { 'buyer-001': 1, 'seller-001': 0 } 
  },
  {
    id: 'conv_b001_s002',
    participants: ['buyer-001', 'seller-002'], // Buyer 1 with Seller 2
    messages: [
      { id: 'msg2_1', senderId: 'buyer-001', text: 'Hello, I saw the Leather Biker Jacket. Could you tell me more about the leather quality?', timestamp: '2025-05-18T14:30:00Z' },
      { id: 'msg2_2', senderId: 'seller-002', text: 'Hi Jane, it’s made from premium full-grain cowhide leather. Very durable and ages beautifully.', timestamp: '2025-05-18T14:35:00Z' },
    ],
    lastMessageTimestamp: '2025-05-18T14:35:00Z',
    unreadCountFor: { 'buyer-001': 0, 'seller-002': 0 }
  },
  {
    id: 'conv_b002_s001',
    participants: ['buyer-002', 'seller-001'], // Buyer 2 with Seller 1
    messages: [
      { id: 'msg3_1', senderId: 'buyer-002', text: 'I have a question about the Denim Blue Jacket.', timestamp: '2025-05-20T11:00:00Z' },
      { id: 'msg3_2', senderId: 'seller-001', text: 'Hi Alex, sure, what would you like to know?', timestamp: '2025-05-20T11:02:00Z'},
      { id: 'msg3_3', senderId: 'buyer-002', text: 'What is the return policy for it?', timestamp: '2025-05-20T11:05:00Z' },
    ],
    lastMessageTimestamp: '2025-05-20T11:05:00Z',
    unreadCountFor: { 'buyer-002': 0, 'seller-001': 1 } 
  },
   {
    id: 'conv_b001_s003',
    participants: ['buyer-001', 'seller-003'], // Buyer 1 with Seller 3
    messages: [
      { id: 'msg4_1', senderId: 'seller-003', text: 'Thanks for your recent order of the Kids Rainbow T-shirt! It has been shipped.', timestamp: '2025-05-17T16:20:00Z' },
      { id: 'msg4_2', senderId: 'buyer-001', text: 'Oh, wonderful! Thank you for the update!', timestamp: '2025-05-17T16:25:00Z' },
    ],
    lastMessageTimestamp: '2025-05-17T16:25:00Z',
    unreadCountFor: { 'buyer-001': 0, 'seller-003': 0 }
  },
];

// Function to get conversations relevant for a specific user
export const getConversationsForUser = (currentUserId) => {
  if (!currentUserId) return [];
  return conversationsStore
    .filter(convo => convo.participants.includes(currentUserId))
    .map(convo => {
      const otherParticipantId = convo.participants.find(pId => pId !== currentUserId);
      const otherParticipant = getMockUserById(otherParticipantId || 'unknown'); // Uses updated getMockUserById
      const lastMessage = convo.messages[convo.messages.length - 1];
      
      const isUnread = (convo.unreadCountFor[currentUserId] || 0) > 0;

      return {
        id: convo.id,
        otherParticipant, // This will now have details from buyers.json/sellers.json
        lastMessageText: lastMessage ? lastMessage.text : 'No messages yet.',
        lastMessageTimestamp: lastMessage ? lastMessage.timestamp : convo.lastMessageTimestamp,
        isUnread,
        unreadMessagesCount: convo.unreadCountFor[currentUserId] || 0,
      };
    })
    .sort((a, b) => new Date(b.lastMessageTimestamp) - new Date(a.lastMessageTimestamp));
};

// Function to get a specific conversation by ID, with participant details
export const getConversationById = (conversationId, currentUserId) => {
    if (!conversationId || !currentUserId) return null;
    const conversation = conversationsStore.find(c => c.id === conversationId);
    if (!conversation) return null;

    const otherParticipantId = conversation.participants.find(pId => pId !== currentUserId);
    const otherParticipant = getMockUserById(otherParticipantId || 'unknown'); // Uses updated getMockUserById
    const currentUserDetails = getMockUserById(currentUserId); // Uses updated getMockUserById

    if (conversation.unreadCountFor[currentUserId] > 0) {
        conversation.unreadCountFor[currentUserId] = 0;
        console.log(`Mock: Conversation ${conversationId} marked as read for ${currentUserId}`);
    }
    
    return {
        ...conversation, 
        participantsDetails: { 
            [currentUserId]: currentUserDetails,
            [otherParticipantId]: otherParticipant,
        },
        otherParticipantName: otherParticipant.name, 
    };
};

// Simulate sending a message
export const sendMockMessage = (conversationId, senderId, text) => {
    const convoIndex = conversationsStore.findIndex(c => c.id === conversationId);
    if (convoIndex === -1) {
        console.error("sendMockMessage: Conversation not found", conversationId);
        return null; 
    }

    const conversation = conversationsStore[convoIndex];
    const receiverId = conversation.participants.find(p => p !== senderId);

    if (!receiverId) {
        console.error("sendMockMessage: Receiver not found in conversation", conversationId);
        return null;
    }

    const newMessage = {
        id: `msg${Date.now()}${Math.random().toString(16).slice(2)}`,
        senderId,
        text,
        timestamp: new Date().toISOString(),
    };

    conversation.messages.push(newMessage);
    conversation.lastMessageTimestamp = newMessage.timestamp;
    
    conversation.unreadCountFor[receiverId] = (conversation.unreadCountFor[receiverId] || 0) + 1;
    conversation.unreadCountFor[senderId] = 0; 

    console.log("sendMockMessage: Message sent, updated store:", conversationsStore[convoIndex]);
    return { ...conversation }; 
};

// Helper to add a new conversation if one doesn't exist
export const findOrCreateConversation = (userId1, userId2) => {
    const existingConversation = conversationsStore.find(c => 
        c.participants.includes(userId1) && c.participants.includes(userId2)
    );
    if (existingConversation) {
        return existingConversation.id;
    }
    const newConversationId = `conv_${userId1}_${userId2}_${Date.now()}`;
    const newConversation = {
        id: newConversationId,
        participants: [userId1, userId2],
        messages: [],
        lastMessageTimestamp: new Date().toISOString(),
        unreadCountFor: {
            [userId1]: 0,
            [userId2]: 0,
        },
    };
    conversationsStore.push(newConversation);
    return newConversationId;
};
