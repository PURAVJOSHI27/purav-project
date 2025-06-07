import { create } from 'zustand';
import { 
  collection,
  query,
  where,
  orderBy,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  QueryDocumentSnapshot
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { MessagesState, Message } from '../types';
import { useAuthStore } from './authStore';
import { encryptMessage, decryptMessage, getEncryptionKey } from '../utils/encryption';

// Helper function to convert Firestore message to our Message type
const convertFirestoreMessage = (doc: QueryDocumentSnapshot): Message => {
  const data = doc.data();
  return {
    id: doc.id,
    conversation_id: data.conversation_id,
    sender_id: data.sender_id,
    content: data.content,
    is_encrypted: data.is_encrypted,
    attachment_url: data.attachment_url || undefined,
    attachment_type: data.attachment_type || undefined,
    created_at: (data.created_at as Timestamp).toDate().toISOString(),
    read_at: data.read_at ? (data.read_at as Timestamp).toDate().toISOString() : undefined
  };
};

export const useMessageStore = create<MessagesState & {
  fetchMessages: (conversationId: string) => Promise<void>;
  sendMessage: (conversationId: string, content: string, attachmentUrl?: string, attachmentType?: string) => Promise<void>;
  markAsRead: (messageIds: string[]) => Promise<void>;
  subscribeToMessages: (conversationId: string) => (() => void);
  searchMessages: (conversationId: string, query: string) => Promise<Message[]>;
}>((set, get) => ({
  messages: {},
  loading: false,
  error: null,

  fetchMessages: async (conversationId) => {
    try {
      set({ loading: true, error: null });
      
      const messagesRef = collection(db, 'messages');
      const messagesQuery = query(
        messagesRef,
        where('conversation_id', '==', conversationId),
        orderBy('created_at', 'asc')
      );
      
      const messagesSnapshot = await getDocs(messagesQuery);
      const messages = messagesSnapshot.docs.map(convertFirestoreMessage);
      
      // Decrypt messages
      const encryptionKey = getEncryptionKey(conversationId);
      const decryptedMessages = messages.map(message => {
        if (message.is_encrypted && encryptionKey) {
          return {
            ...message,
            content: decryptMessage(message.content, encryptionKey)
          };
        }
        return message;
      });
      
      set(state => ({
        messages: {
          ...state.messages,
          [conversationId]: decryptedMessages
        }
      }));
      
      // Mark unread messages as read
      const user = useAuthStore.getState().user;
      if (user) {
        const unreadMessageIds = decryptedMessages
          .filter(msg => msg.sender_id !== user.id && !msg.read_at)
          .map(msg => msg.id);
        
        if (unreadMessageIds.length > 0) {
          get().markAsRead(unreadMessageIds);
        }
      }
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  sendMessage: async (conversationId, content, attachmentUrl, attachmentType) => {
    const user = useAuthStore.getState().user;
    
    if (!user) {
      set({ error: 'User not authenticated' });
      return;
    }
    
    try {
      set({ loading: true, error: null });
      
      // Encrypt the message content
      const encryptionKey = getEncryptionKey(conversationId);
      let encryptedContent = content;
      let isEncrypted = false;
      
      if (encryptionKey) {
        encryptedContent = encryptMessage(content, encryptionKey);
        isEncrypted = true;
      }
      
      const messageData = {
        conversation_id: conversationId,
        sender_id: user.id,
        content: encryptedContent,
        is_encrypted: isEncrypted,
        attachment_url: attachmentUrl || null,
        attachment_type: attachmentType || null,
        created_at: serverTimestamp(),
        read_at: null
      };
      
      const messagesRef = collection(db, 'messages');
      const messageDoc = await addDoc(messagesRef, messageData);
      
      // Update last message in conversation
      const conversationRef = doc(db, 'conversations', conversationId);
      await updateDoc(conversationRef, {
        last_message: content.substring(0, 50) + (content.length > 50 ? '...' : ''),
        last_message_at: serverTimestamp(),
        updated_at: serverTimestamp()
      });
      
      // Add the decrypted message to local state
      const decryptedMessage: Message = {
        id: messageDoc.id,
        conversation_id: messageData.conversation_id,
        sender_id: messageData.sender_id,
        content,
        is_encrypted: messageData.is_encrypted,
        attachment_url: messageData.attachment_url || undefined,
        attachment_type: messageData.attachment_type || undefined,
        created_at: new Date().toISOString(),
        read_at: undefined
      };
      
      set(state => ({
        messages: {
          ...state.messages,
          [conversationId]: [
            ...(state.messages[conversationId] || []),
            decryptedMessage
          ]
        }
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  markAsRead: async (messageIds) => {
    if (!messageIds.length) return;
    
    try {
      const readAt = serverTimestamp();
      
      // Update each message
      for (const messageId of messageIds) {
        const messageRef = doc(db, 'messages', messageId);
        await updateDoc(messageRef, { read_at: readAt });
      }
      
      // Update local state
      const currentTime = new Date().toISOString();
      set(state => {
        const updatedMessages = { ...state.messages };
        
        // Find which conversation these messages belong to
        for (const conversationId in updatedMessages) {
          updatedMessages[conversationId] = updatedMessages[conversationId].map(msg => {
            if (messageIds.includes(msg.id)) {
              return { ...msg, read_at: currentTime };
            }
            return msg;
          });
        }
        
        return { messages: updatedMessages };
      });
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  subscribeToMessages: (conversationId) => {
    // Subscribe to new messages in this conversation
    const messagesRef = collection(db, 'messages');
    const messagesQuery = query(
      messagesRef,
      where('conversation_id', '==', conversationId),
      orderBy('created_at', 'desc')
    );
    
    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const newMessage = convertFirestoreMessage(change.doc);
          
          // Check if message is already in state
          const existingMessages = get().messages[conversationId] || [];
          if (existingMessages.some(msg => msg.id === newMessage.id)) {
            return;
          }
          
          // Decrypt message if needed
          const encryptionKey = getEncryptionKey(conversationId);
          let content = newMessage.content;
          
          if (newMessage.is_encrypted && encryptionKey) {
            content = decryptMessage(newMessage.content, encryptionKey);
          }
          
          const decryptedMessage: Message = {
            ...newMessage,
            content
          };
          
          // Update messages state
          set(state => ({
            messages: {
              ...state.messages,
              [conversationId]: [
                ...(state.messages[conversationId] || []),
                decryptedMessage
              ]
            }
          }));
          
          // Mark as read if received by current user
          const user = useAuthStore.getState().user;
          if (user && newMessage.sender_id !== user.id) {
            get().markAsRead([newMessage.id]);
          }
        }
      });
    });
    
    return unsubscribe;
  },

  searchMessages: async (conversationId, query) => {
    if (!query.trim()) {
      return [];
    }
    
    try {
      // For encrypted messages, we need to search locally since we can't query encrypted content
      const messages = get().messages[conversationId] || [];
      return messages.filter(msg => 
        msg.content.toLowerCase().includes(query.toLowerCase())
      );
    } catch (error) {
      set({ error: (error as Error).message });
      return [];
    }
  }
}));