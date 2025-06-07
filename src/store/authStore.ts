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

type AuthStore = AuthState & {
  signInWithGoogle: () => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  fetchUser: () => Promise<void>;
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
    (set) => ({
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
          set({ error: (error as Error).message });
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
          set({ loading: true });
          
          // Check for redirect result first
          const result = await getRedirectResult(auth);
          if (result) {
            const { user: firebaseUser } = result;
            
            // Check if user profile exists
            const profileDoc = await getDoc(doc(db, 'profiles', firebaseUser.uid));
            
            if (!profileDoc.exists()) {
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

            // After handling redirect, update the store immediately
            const userData = {
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              username: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || '',
              avatar_url: firebaseUser.photoURL || '',
              created_at: new Date().toISOString(),
            } as User;
            
            set({ user: userData, session: { user: firebaseUser }, loading: false });
            return;
          }
          
          const firebaseUser = auth.currentUser;
          
          if (!firebaseUser) {
            set({ user: null, session: null, loading: false });
            return;
          }
          
          // Fetch user profile
          const profileDoc = await getDoc(doc(db, 'profiles', firebaseUser.uid));
          const profileData = profileDoc.data();
          
          const userData = {
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            username: profileData?.username || firebaseUser.displayName || '',
            avatar_url: profileData?.avatar_url || firebaseUser.photoURL || '',
            created_at: profileData?.created_at || new Date().toISOString(),
          } as User;
          
          set({ user: userData, session: { user: firebaseUser }, loading: false });
        } catch (error) {
          console.error('Error fetching user:', error);
          set({ error: (error as Error).message, loading: false });
        }
      },
    }),
    persistOptions
  )
);

// Initialize auth listener
onAuthStateChanged(auth, (user) => {
  if (user) {
    useAuthStore.getState().fetchUser();
  } else {
    useAuthStore.setState({ user: null, session: null, loading: false });
  }
});

// Initialize on app load
useAuthStore.getState().fetchUser();