import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { Heart, Images } from 'lucide-react';

const AuthPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login, error } = useAuthStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(username, password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden"
      >
        <div className="p-8">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-3">
              <div className="relative">
                <Images className="h-12 w-12 text-primary-600" />
                <motion.div 
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="absolute -top-1 -right-1"
                >
                  <Heart className="h-6 w-6 text-secondary-500" fill="currentColor" />
                </motion.div>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Moments Shared</h1>
            <p className="mt-2 text-gray-600">Sign in to share your special moments</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <div className="mt-1">
                <input
                  id="username"
                  type="text"
                  required
                  placeholder="Enter your username"
                  className="input"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  type="password"
                  required
                  placeholder="Enter your password"
                  className="input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div className="text-red-500 text-sm py-2">{error}</div>
            )}

            <div>
              <button
                type="submit"
                className="w-full btn btn-primary"
              >
                Sign in
              </button>
            </div>
          </form>

          <div className="mt-8 text-center text-sm text-gray-500">
            <p>Test credentials:</p>
            <p className="mt-1">Username: <strong>user1</strong> Password: <strong>password1</strong></p>
            <p className="mt-1">Username: <strong>user2</strong> Password: <strong>password2</strong></p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthPage;