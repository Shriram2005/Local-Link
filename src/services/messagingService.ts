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
  Timestamp,
  Unsubscribe
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Message, Conversation } from '@/types';

export class MessagingService {
  // Create a new conversation
  static async createConversation(
    participantIds: string[],
    bookingId?: string,
    initialMessage?: string
  ): Promise<string> {
    if (!db) throw new Error('Database not initialized');
    
    const conversationData = {
      participantIds,
      bookingId: bookingId || null,
      lastMessage: initialMessage || '',
      lastMessageAt: Timestamp.now(),
      unreadCounts: participantIds.reduce((acc, id) => ({ ...acc, [id]: 0 }), {}),
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const docRef = await addDoc(collection(db, 'conversations'), conversationData);
    
    // Send initial message if provided
    if (initialMessage) {
      await this.sendMessage(docRef.id, participantIds[0], initialMessage);
    }
    
    return docRef.id;
  }

  // Send a message
  static async sendMessage(
    conversationId: string,
    senderId: string,
    content: string,
    attachments: string[] = []
  ): Promise<string> {
    if (!db) throw new Error('Database not initialized');
    
    const messageData = {
      conversationId,
      senderId,
      content,
      attachments,
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
    
    return docRef.id;
  }

  // Get conversations for a user
  static async getUserConversations(userId: string): Promise<Conversation[]> {
    if (!db) throw new Error('Database not initialized');
    
    const q = query(
      collection(db, 'conversations'),
      where('participantIds', 'array-contains', userId),
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
  static async getConversationMessages(
    conversationId: string,
    limitCount: number = 50
  ): Promise<Message[]> {
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
    
    const q = query(
      collection(db, 'messages'),
      where('conversationId', '==', conversationId),
      where('senderId', '!=', userId),
      where('isRead', '==', false)
    );

    const querySnapshot = await getDocs(q);
    const updatePromises: Promise<void>[] = [];

    querySnapshot.forEach((doc) => {
      updatePromises.push(
        updateDoc(doc.ref, { isRead: true })
      );
    });

    await Promise.all(updatePromises);
    
    // Update unread count in conversation
    const conversationRef = doc(db, 'conversations', conversationId);
    const conversationDoc = await getDoc(conversationRef);
    
    if (conversationDoc.exists()) {
      const data = conversationDoc.data();
      const unreadCounts = { ...data.unreadCounts, [userId]: 0 };
      await updateDoc(conversationRef, { unreadCounts });
    }
  }

  // Subscribe to conversation messages (real-time)
  static subscribeToMessages(
    conversationId: string,
    callback: (messages: Message[]) => void
  ): Unsubscribe {
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

  // Subscribe to user conversations (real-time)
  static subscribeToConversations(
    userId: string,
    callback: (conversations: Conversation[]) => void
  ): Unsubscribe {
    if (!db) throw new Error('Database not initialized');
    
    const q = query(
      collection(db, 'conversations'),
      where('participantIds', 'array-contains', userId),
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
    let totalUnread = 0;
    
    conversations.forEach(conversation => {
      totalUnread += conversation.unreadCounts?.[userId] || 0;
    });
    
    return totalUnread;
  }

  // Delete a message
  static async deleteMessage(messageId: string): Promise<void> {
    if (!db) throw new Error('Database not initialized');
    
    const messageRef = doc(db, 'messages', messageId);
    await updateDoc(messageRef, {
      content: '[Message deleted]',
      isDeleted: true,
      deletedAt: Timestamp.now(),
    });
  }

  // Search messages in a conversation
  static async searchMessages(
    conversationId: string,
    searchTerm: string
  ): Promise<Message[]> {
    if (!db) throw new Error('Database not initialized');
    
    const messages = await this.getConversationMessages(conversationId, 1000);
    
    return messages.filter(message => 
      message.content.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !message.isDeleted
    );
  }
}
