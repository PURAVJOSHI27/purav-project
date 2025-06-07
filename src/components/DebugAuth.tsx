import React from 'react';
import { useAuthStore } from '../store/authStore';
import { auth } from '../config/firebase';

export const DebugAuth: React.FC = () => {
  const { user, loading, error } = useAuthStore();
  
  const checkLocalStorage = () => {
    console.log('=== Auth Debug ===');
    console.log('localStorage auth-storage:', localStorage.getItem('auth-storage'));
    console.log('Zustand state:', { user: !!user, loading, error });
    console.log('Firebase currentUser:', !!auth.currentUser);
    console.log('Firebase currentUser email:', auth.currentUser?.email);
    console.log('==================');
  };

  return (
    <div className="fixed bottom-4 left-4 bg-gray-800 text-white p-4 rounded-lg text-xs">
      <div>User: {user ? '✅' : '❌'}</div>
      <div>Loading: {loading ? '🔄' : '✅'}</div>
      <div>Error: {error || 'None'}</div>
      <button 
        onClick={checkLocalStorage}
        className="mt-2 bg-blue-500 px-2 py-1 rounded text-xs"
      >
        Debug
      </button>
    </div>
  );
};
