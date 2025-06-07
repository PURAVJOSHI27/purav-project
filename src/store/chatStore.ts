import { create } from 'zustand';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  doc, 
  getDoc,
  updateDoc,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { ConversationState, Conversation } from '../types';
import { useAuthStore } from './authStore';
import { encryptMessage, decryptMessage, getEncryptionKey, storeEncryptionKey, generateEncryptionKey } from '../utils/encryption';

export const useChatStore = create<ConversationState & {
  fetchConversations: () => Promise<void>;
  getOrCreateConversation: (userId: string) => Promise<string | null>;
  setActiveConversation: (conversation: Conversation | null) => void;
  createNewConversation: (participantIds: string[]) => Promise<string | null>;
}>((set, get) => ({
  conversations: [],
  activeConversation: null,
  loading: false,
  error: null,

  fetchConversations: async () => {
    const user = useAuthStore.getState().user;
    
    if (!user) {
      set({ error: 'User not authenticated' });
      return;
    }
    
    try {
      set({ loading: true, error: null });
      
      // Get all conversations where the current user is a participant
      const participantsRef = collection(db, 'conversation_participants');
      const participantsQuery = query(
        participantsRef,
        where('user_id', '==', user.id)
      );
      
      const participantsSnapshot = await getDocs(participantsQuery);
      const conversationIds = participantsSnapshot.docs.map(doc => doc.data().conversation_id);
      
      // For each conversation, get all participants and conversation details
      const conversations: Conversation[] = [];
      
      for (const convId of conversationIds) {
        // Get conversation details
        const conversationDoc = await getDoc(doc(db, 'conversations', convId));
        const conversationData = conversationDoc.data();
        
        if (!conversationData) continue;
        
        // Get all participants
        const participantsQuery = query(
          participantsRef,
          where('conversation_id', '==', convId)
        );
        
        const participantsSnapshot = await getDocs(participantsQuery);
        const participantIds = participantsSnapshot.docs.map(doc => doc.data().user_id);
        
        // Get participant profiles
        const profiles = [];
        for (const participantId of participantIds) {
          const profileDoc = await getDoc(doc(db, 'profiles', participantId));
          const profileData = profileDoc.data();
          if (profileData) {
            profiles.push({
              id: participantId,
              ...profileData
            });
          }
        }
        
        conversations.push({
          id: convId,
          created_at: (conversationData.created_at as Timestamp).toDate().toISOString(),
          updated_at: conversationData.updated_at ? (conversationData.updated_at as Timestamp).toDate().toISOString() : null,
          last_message: conversationData.last_message || null,
          last_message_at: conversationData.last_message_at ? (conversationData.last_message_at as Timestamp).toDate().toISOString() : null,
          participants: profiles,
        });
      }
      
      set({ conversations, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  getOrCreateConversation: async (userId) => {
    const user = useAuthStore.getState().user;
    
    if (!user) {
      set({ error: 'User not authenticated' });
      return null;
    }
    
    if (userId === user.id) {
      set({ error: 'Cannot create conversation with yourself' });
      return null;
    }
    
    try {
      set({ loading: true, error: null });
      
      // Check if conversation already exists
      const participantsRef = collection(db, 'conversation_participants');
      const userConvsQuery = query(
        participantsRef,
        where('user_id', '==', user.id)
      );
      
      const userConvsSnapshot = await getDocs(userConvsQuery);
      const conversationIds = userConvsSnapshot.docs.map(doc => doc.data().conversation_id);
      
      // Find conversations where the other user is a participant
      for (const convId of conversationIds) {
        const otherParticipantQuery = query(
          participantsRef,
          where('conversation_id', '==', convId),
          where('user_id', '==', userId)
        );
        
        const otherParticipantSnapshot = await getDocs(otherParticipantQuery);
        
        if (!otherParticipantSnapshot.empty) {
          // Found existing conversation
          const conversationDoc = await getDoc(doc(db, 'conversations', convId));
          const conversationData = conversationDoc.data();
          
          if (conversationData) {
            // Get participants
            const participantsQuery = query(
              participantsRef,
              where('conversation_id', '==', convId)
            );
            
            const participantsSnapshot = await getDocs(participantsQuery);
            const participantIds = participantsSnapshot.docs.map(doc => doc.data().user_id);
            
            // Get participant profiles
            const profiles = [];
            for (const participantId of participantIds) {
              const profileDoc = await getDoc(doc(db, 'profiles', participantId));
              const profileData = profileDoc.data();
              if (profileData) {
                profiles.push({
                  id: participantId,
                  ...profileData
                });
              }
            }
            
            const conversation: Conversation = {
              id: convId,
              created_at: (conversationData.created_at as Timestamp).toDate().toISOString(),
              updated_at: conversationData.updated_at ? (conversationData.updated_at as Timestamp).toDate().toISOString() : null,
              last_message: conversationData.last_message || null,
              last_message_at: conversationData.last_message_at ? (conversationData.last_message_at as Timestamp).toDate().toISOString() : null,
              participants: profiles,
            };
            
            set({ activeConversation: conversation });
            return convId;
          }
        }
      }
      
      // If no existing conversation, create a new one
      return await get().createNewConversation([user.id, userId]);
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      return null;
    } finally {
      set({ loading: false });
    }
  },

  setActiveConversation: (conversation) => {
    set({ activeConversation: conversation });
  },

  createNewConversation: async (participantIds) => {
    try {
      set({ loading: true, error: null });
      
      // Create new conversation
      const conversationsRef = collection(db, 'conversations');
      const newConversationRef = await addDoc(conversationsRef, {
        created_at: serverTimestamp(),
        updated_at: null,
        last_message: null,
        last_message_at: null
      });
      
      // Create conversation participants entries
      const participantsRef = collection(db, 'conversation_participants');
      for (const userId of participantIds) {
        await addDoc(participantsRef, {
          conversation_id: newConversationRef.id,
          user_id: userId
        });
      }
      
      // Generate and store encryption key for this conversation
      const encryptionKey = generateEncryptionKey();
      storeEncryptionKey(newConversationRef.id, encryptionKey);
      
      // Fetch participants details
      const profiles = [];
      for (const userId of participantIds) {
        const profileDoc = await getDoc(doc(db, 'profiles', userId));
        const profileData = profileDoc.data();
        if (profileData) {
          profiles.push({
            id: userId,
            ...profileData
          });
        }
      }
      
      const conversation: Conversation = {
        id: newConversationRef.id,
        created_at: new Date().toISOString(),
        updated_at: null,
        last_message: null,
        last_message_at: null,
        participants: profiles,
      };
      
      set({ activeConversation: conversation });
      
      // Update conversations list
      const { conversations } = get();
      set({ conversations: [...conversations, conversation] });
      
      return newConversationRef.id;
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      return null;
    } finally {
      set({ loading: false });
    }
  },
}));