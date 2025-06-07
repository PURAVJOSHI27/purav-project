import React from 'react';
import { Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { LoginForm } from '../components/auth/LoginForm';

export const Auth: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left side - Hero Image/Branding */}
      <div className="hidden md:flex md:w-1/2 bg-primary-500 text-white flex-col justify-center items-center p-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="max-w-md text-center"
        >
          <Heart className="h-20 w-20 mb-6 mx-auto" fill="white" />
          <h1 className="text-4xl font-bold mb-4">LoveChat</h1>
          <p className="text-xl mb-6">A secure, private messaging platform designed specifically for couples.</p>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="p-4 bg-white/10 rounded-lg">
              <h3 className="font-semibold text-white">End-to-End Encryption</h3>
              <p className="text-white/80 text-sm">Your messages stay private between you and your loved one</p>
            </div>
            <div className="p-4 bg-white/10 rounded-lg">
              <h3 className="font-semibold text-white">Share Special Moments</h3>
              <p className="text-white/80 text-sm">Easily share photos and create lasting memories</p>
            </div>
            <div className="p-4 bg-white/10 rounded-lg">
              <h3 className="font-semibold text-white">Real-time Updates</h3>
              <p className="text-white/80 text-sm">See when your messages are read instantly</p>
            </div>
            <div className="p-4 bg-white/10 rounded-lg">
              <h3 className="font-semibold text-white">Message Backup</h3>
              <p className="text-white/80 text-sm">Never lose your precious conversations</p>
            </div>
          </div>
        </motion.div>
      </div>
      
      {/* Right side - Auth Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-10 bg-white">
        <LoginForm />
      </div>
    </div>
  );
};