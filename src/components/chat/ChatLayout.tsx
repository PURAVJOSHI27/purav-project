import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export const ChatLayout: React.FC = () => {
  const { user } = useAuthStore();

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-800">LoveChat</h1>
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <img
                src={user?.avatar_url || '/default-avatar.png'}
                alt="Profile"
                className="w-8 h-8 rounded-full"
              />
              <span className="ml-2 text-sm font-medium text-gray-700">
                {user?.username}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main content area */}
      <main className="flex-1 flex overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}; 