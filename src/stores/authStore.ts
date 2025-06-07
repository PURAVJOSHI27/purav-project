import { create } from 'zustand';

// Mock users
const MOCK_USERS = [
  { id: 1, username: 'user1', password: 'password1', name: 'You', avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=150' },
  { id: 2, username: 'user2', password: 'password2', name: 'Your Girlfriend', avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150' },
];

type User = {
  id: number;
  username: string;
  name: string;
  avatar: string;
};

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  partnerId: number | null;
  error: string | null;
  login: (username: string, password: string) => void;
  logout: () => void;
  initAuth: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  partnerId: null,
  error: null,
  
  login: (username, password) => {
    // Find user in our mock data
    const user = MOCK_USERS.find(u => u.username === username && u.password === password);
    
    if (user) {
      // Remove password before storing in state
      const { password: _, ...safeUser } = user;
      
      // Find partner ID (in this simple case, if user1 is logged in, partner is user2 and vice versa)
      const partnerId = user.id === 1 ? 2 : 1;
      
      // Store in localStorage for persistence
      localStorage.setItem('user', JSON.stringify(safeUser));
      localStorage.setItem('partnerId', String(partnerId));
      
      set({ 
        user: safeUser, 
        isAuthenticated: true, 
        partnerId,
        error: null
      });
    } else {
      set({ error: 'Invalid username or password' });
    }
  },
  
  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('partnerId');
    set({ user: null, isAuthenticated: false, partnerId: null });
  },
  
  initAuth: () => {
    const storedUser = localStorage.getItem('user');
    const storedPartnerId = localStorage.getItem('partnerId');
    
    if (storedUser && storedPartnerId) {
      set({ 
        user: JSON.parse(storedUser),
        isAuthenticated: true,
        partnerId: Number(storedPartnerId)
      });
    }
  },
}));