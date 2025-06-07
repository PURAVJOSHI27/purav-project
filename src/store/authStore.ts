import { create } from 'zustand';
import { persist, PersistOptions } from 'zustand/middleware';
import { 
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { AuthState, User } from '../types';

// Helper function to handle user profile creation and data
const handleUserProfile = async (firebaseUser: any, set: any) => {
  console.log('handleUserProfile: Processing user', firebaseUser.email);
  
  // Check if user profile exists
  const profileDoc = await getDoc(doc(db, 'profiles', firebaseUser.uid));
  
  if (!profileDoc.exists()) {
    console.log('handleUserProfile: Creating new profile');
    // Create profile record for new user
    await setDoc(doc(db, 'profiles', firebaseUser.uid), {
      user_id: firebaseUser.uid,
      username: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || '',
      display_name: firebaseUser.displayName || '',
      email: firebaseUser.email,
      avatar_url: firebaseUser.photoURL || '',
      created_at: new Date().toISOString(),
    });
  }

  // Get profile data
  const updatedProfileDoc = await getDoc(doc(db, 'profiles', firebaseUser.uid));
  const profileData = updatedProfileDoc.data();

  const userData = {
    id: firebaseUser.uid,
    email: firebaseUser.email || '',
    username: profileData?.username || firebaseUser.displayName || firebaseUser.email?.split('@')[0] || '',
    avatar_url: profileData?.avatar_url || firebaseUser.photoURL || '',
    created_at: profileData?.created_at || new Date().toISOString(),
  } as User;

  set({ user: userData, session: { user: firebaseUser }, loading: false, error: null });
  console.log('handleUserProfile: User data set:', userData);
};

type AuthStore = AuthState & {
  signInWithGoogle: () => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  fetchUser: () => Promise<void>;
  checkRedirectResult: () => Promise<void>;
};

type AuthPersist = {
  user: User | null;
  session: null;
};

const persistOptions: PersistOptions<AuthStore, AuthPersist> = {
  name: 'auth-storage',
  partialize: (state) => ({ 
    user: state.user,
    session: null
  })
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, _get) => ({
      user: null,
      session: null,
      loading: true,
      error: null,

      signInWithGoogle: async () => {
        try {
          set({ loading: true, error: null });
          
          const provider = new GoogleAuthProvider();
          await signInWithRedirect(auth, provider);
          
          return { error: null };
        } catch (error) {
          console.error('signInWithGoogle error:', error);
          set({ error: (error as Error).message, loading: false });
          return { error };
        }
      },

      signOut: async () => {
        try {
          set({ loading: true });
          await firebaseSignOut(auth);
          set({ user: null, session: null });
          localStorage.removeItem('auth-storage');
        } catch (error) {
          set({ error: (error as Error).message });
        } finally {
          set({ loading: false });
        }
      },

      fetchUser: async () => {
        try {
          console.log('fetchUser: Starting...');
          set({ loading: true, error: null });
          
          // If no redirect result, check current user
          const firebaseUser = auth.currentUser;
          console.log('fetchUser: Current user:', firebaseUser?.email || 'none');
          
          if (firebaseUser) {
            await handleUserProfile(firebaseUser, set);
          } else {
            console.log('fetchUser: No user found');
            set({ user: null, session: null, loading: false, error: null });
          }
        } catch (error) {
          console.error('fetchUser: Error:', error);
          set({ error: (error as Error).message, loading: false });
        }
      },

      checkRedirectResult: async () => {
        try {
          console.log('checkRedirectResult: Checking for redirect result...');
          set({ loading: true, error: null });
          
          const result = await getRedirectResult(auth);
          if (result) {
            console.log('checkRedirectResult: Processing redirect result', result.user.email);
            const { user: firebaseUser } = result;
            
            // Handle user profile
            await handleUserProfile(firebaseUser, set);
          } else {
            console.log('checkRedirectResult: No redirect result found');
            // Check current user as fallback
            const firebaseUser = auth.currentUser;
            if (firebaseUser) {
              await handleUserProfile(firebaseUser, set);
            } else {
              set({ loading: false });
            }
          }
        } catch (error) {
          console.error('checkRedirectResult: Error:', error);
          set({ error: (error as Error).message, loading: false });
        }
      },
    }),
    persistOptions
  )
);

// Initialize auth listener
let authListenerInitialized = false;

const initializeAuthListener = () => {
  if (authListenerInitialized) return;
  authListenerInitialized = true;

  // Wait a bit for Firebase to fully initialize before setting up the listener
  setTimeout(() => {
    onAuthStateChanged(auth, async (user) => {
      console.log('Auth state changed:', { user: !!user, email: user?.email });
      
      const currentState = useAuthStore.getState();
      
      if (user) {
        // If we have a user but no user data in store, fetch it
        if (!currentState.user || currentState.user.id !== user.uid) {
          console.log('Auth state: User found, fetching profile data');
          try {
            await handleUserProfile(user, useAuthStore.setState);
          } catch (error) {
            console.error('Auth state: Error handling user profile:', error);
            useAuthStore.setState({ loading: false, error: (error as Error).message });
          }
        } else {
          console.log('Auth state: User already in store');
          useAuthStore.setState({ loading: false });
        }
      } else {
        // Don't immediately clear state - wait a bit for potential redirect result
        setTimeout(() => {
          const state = useAuthStore.getState();
          if (!state.user) {
            console.log('Auth state: No user after delay, clearing state');
            useAuthStore.setState({ user: null, session: null, loading: false });
          }
        }, 1000);
      }
    });
  }, 100);
};

// Initialize on import
initializeAuthListener();