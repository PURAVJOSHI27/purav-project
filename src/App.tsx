import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { Auth } from './pages/Auth';
import { ChatLayout } from './components/chat/ChatLayout';
import { FriendsList } from './components/chat/FriendsList';
import { ChatWindow } from './components/chat/ChatWindow';

const App: React.FC = () => {
  const { user, loading } = useAuthStore();
  
  // Fetch user on app load
  useEffect(() => {
    useAuthStore.getState().fetchUser();
  }, []);
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={user ? <Navigate to="/chat" /> : <Auth />} />
        
        {/* Protected chat routes */}
        <Route path="/chat" element={user ? <ChatLayout /> : <Navigate to="/login" />}>
          {/* Friends list (default chat view) */}
          <Route index element={<FriendsList />} />
          {/* Individual chat window */}
          <Route path=":friendId" element={<ChatWindow />} />
        </Route>
        
        {/* Default redirect */}
        <Route path="*" element={<Navigate to={user ? "/chat" : "/login"} />} />
      </Routes>
    </Router>
  );
};

export default App;