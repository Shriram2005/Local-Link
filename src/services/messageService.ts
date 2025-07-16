import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot,
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Message, Conversation } from '@/types';

export class MessageService {
  // Create a new conversation
  static async createConversation(participants: string[], bookingId?: string): Promise<string> {
    if (!db) throw new Error('Database not initialized');
    
    const conversationData = {
      participants,
      bookingId,
      lastMessage: null,
      lastMessageAt: null,
      unreadCount: participants.reduce((acc, id) => ({ ...acc, [id]: 0 }), {}),
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
    
    const docRef = await addDoc(collection(db, 'conversations'), conversationData);
    return docRef.id;
  }

  // Send a message
  static async sendMessage(conversationId: string, senderId: string, content: string, type: 'text' | 'image' = 'text'): Promise<string> {
    if (!db) throw new Error('Database not initialized');
    
    const messageData = {
      conversationId,
      senderId,
      content,
      type,
      isRead: false,
      createdAt: Timestamp.now(),
    };
    
    const docRef = await addDoc(collection(db, 'messages'), messageData);
    
    // Update conversation with last message
    const conversationRef = doc(db, 'conversations', conversationId);
    await updateDoc(conversationRef, {
      lastMessage: content,
      lastMessageAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    
    // Update unread counts for other participants
    const conversationSnap = await getDoc(conversationRef);
    if (conversationSnap.exists()) {
      const conversation = conversationSnap.data() as Conversation;
      const unreadCount = { ...conversation.unreadCount };
      
      conversation.participants.forEach(participantId => {
        if (participantId !== senderId) {
          unreadCount[participantId] = (unreadCount[participantId] || 0) + 1;
        }
      });
      
      await updateDoc(conversationRef, { unreadCount });
    }
    
    return docRef.id;
  }

  // Get conversations for a user
  static async getUserConversations(userId: string): Promise<Conversation[]> {
    if (!db) throw new Error('Database not initialized');
    
    const q = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', userId),
      orderBy('lastMessageAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const conversations: Conversation[] = [];
    
    querySnapshot.forEach((doc) => {
      conversations.push({ id: doc.id, ...doc.data() } as Conversation);
    });
    
    return conversations;
  }

  // Get messages for a conversation
  static async getConversationMessages(conversationId: string, limitCount: number = 50): Promise<Message[]> {
    if (!db) throw new Error('Database not initialized');
    
    const q = query(
      collection(db, 'messages'),
      where('conversationId', '==', conversationId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    const messages: Message[] = [];
    
    querySnapshot.forEach((doc) => {
      messages.push({ id: doc.id, ...doc.data() } as Message);
    });
    
    return messages.reverse(); // Return in chronological order
  }

  // Mark messages as read
  static async markMessagesAsRead(conversationId: string, userId: string): Promise<void> {
    if (!db) throw new Error('Database not initialized');
    
    // Update unread count in conversation
    const conversationRef = doc(db, 'conversations', conversationId);
    const conversationSnap = await getDoc(conversationRef);
    
    if (conversationSnap.exists()) {
      const conversation = conversationSnap.data() as Conversation;
      const unreadCount = { ...conversation.unreadCount };
      unreadCount[userId] = 0;
      
      await updateDoc(conversationRef, { unreadCount });
    }
    
    // Mark individual messages as read
    const q = query(
      collection(db, 'messages'),
      where('conversationId', '==', conversationId),
      where('isRead', '==', false)
    );
    
    const querySnapshot = await getDocs(q);
    const updatePromises = querySnapshot.docs.map(doc => {
      const message = doc.data() as Message;
      if (message.senderId !== userId) {
        return updateDoc(doc.ref, { isRead: true });
      }
      return Promise.resolve();
    });
    
    await Promise.all(updatePromises);
  }

  // Find or create conversation between two users
  static async findOrCreateConversation(user1Id: string, user2Id: string, bookingId?: string): Promise<string> {
    if (!db) throw new Error('Database not initialized');
    
    // Try to find existing conversation
    const q = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', user1Id)
    );
    
    const querySnapshot = await getDocs(q);
    
    for (const doc of querySnapshot.docs) {
      const conversation = doc.data() as Conversation;
      if (conversation.participants.includes(user2Id)) {
        return doc.id;
      }
    }
    
    // Create new conversation if none exists
    return this.createConversation([user1Id, user2Id], bookingId);
  }

  // Listen to conversation updates
  static subscribeToConversation(conversationId: string, callback: (messages: Message[]) => void): () => void {
    if (!db) throw new Error('Database not initialized');
    
    const q = query(
      collection(db, 'messages'),
      where('conversationId', '==', conversationId),
      orderBy('createdAt', 'asc')
    );
    
    return onSnapshot(q, (querySnapshot) => {
      const messages: Message[] = [];
      querySnapshot.forEach((doc) => {
        messages.push({ id: doc.id, ...doc.data() } as Message);
      });
      callback(messages);
    });
  }

  // Listen to user conversations
  static subscribeToUserConversations(userId: string, callback: (conversations: Conversation[]) => void): () => void {
    if (!db) throw new Error('Database not initialized');
    
    const q = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', userId),
      orderBy('lastMessageAt', 'desc')
    );
    
    return onSnapshot(q, (querySnapshot) => {
      const conversations: Conversation[] = [];
      querySnapshot.forEach((doc) => {
        conversations.push({ id: doc.id, ...doc.data() } as Conversation);
      });
      callback(conversations);
    });
  }

  // Get unread message count for user
  static async getUnreadCount(userId: string): Promise<number> {
    if (!db) throw new Error('Database not initialized');
    
    const conversations = await this.getUserConversations(userId);
    return conversations.reduce((total, conversation) => {
      return total + (conversation.unreadCount[userId] || 0);
    }, 0);
  }

  // Delete a message
  static async deleteMessage(messageId: string): Promise<void> {
    if (!db) throw new Error('Database not initialized');
    
    const messageRef = doc(db, 'messages', messageId);
    await updateDoc(messageRef, {
      content: 'This message has been deleted',
      isDeleted: true,
      updatedAt: Timestamp.now(),
    });
  }

  // Search messages
  static async searchMessages(userId: string, searchTerm: string): Promise<Message[]> {
    if (!db) throw new Error('Database not initialized');
    
    // Get user's conversations first
    const conversations = await this.getUserConversations(userId);
    const conversationIds = conversations.map(c => c.id);
    
    // This is a simplified search - in production, use a proper search service
    const allMessages: Message[] = [];
    
    for (const conversationId of conversationIds) {
      const messages = await this.getConversationMessages(conversationId, 100);
      allMessages.push(...messages);
    }
    
    return allMessages.filter(message => 
      message.content.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  // Block/unblock user
  static async blockUser(blockerId: string, blockedId: string): Promise<void> {
    if (!db) throw new Error('Database not initialized');
    
    const blockData = {
      blockerId,
      blockedId,
      createdAt: Timestamp.now(),
    };
    
    await addDoc(collection(db, 'blockedUsers'), blockData);
  }

  // Check if user is blocked
  static async isUserBlocked(userId1: string, userId2: string): Promise<boolean> {
    if (!db) throw new Error('Database not initialized');
    
    const q1 = query(
      collection(db, 'blockedUsers'),
      where('blockerId', '==', userId1),
      where('blockedId', '==', userId2)
    );
    
    const q2 = query(
      collection(db, 'blockedUsers'),
      where('blockerId', '==', userId2),
      where('blockedId', '==', userId1)
    );
    
    const [snapshot1, snapshot2] = await Promise.all([
      getDocs(q1),
      getDocs(q2)
    ]);
    
    return !snapshot1.empty || !snapshot2.empty;
  }
}
