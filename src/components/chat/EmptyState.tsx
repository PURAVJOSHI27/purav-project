import React from 'react';
import { motion } from 'framer-motion';
import { Heart, MessageSquare } from 'lucide-react';

export const EmptyState: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 bg-slate-50">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-md"
      >
        <div className="relative mx-auto w-24 h-24 mb-6">
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              repeatType: "reverse"
            }}
            className="absolute inset-0"
          >
            <Heart className="w-full h-full text-primary-500" fill="#ff0000" />
          </motion.div>
          <MessageSquare className="absolute top-1/4 left-1/4 w-1/2 h-1/2 text-white" />
        </div>
        
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Welcome to LoveChat</h2>
        
        <p className="text-slate-600 mb-4">
          Your secure and private messaging app designed for couples. Start a conversation to connect with your loved one.
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
          <div className="bg-white p-3 rounded-lg shadow-message border border-slate-100">
            <div className="flex items-center mb-2">
              <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                <span className="text-primary-500 text-sm">🔒</span>
              </div>
              <h3 className="ml-2 font-medium text-slate-800">Secure Messaging</h3>
            </div>
            <p className="text-sm text-slate-600">End-to-end encryption keeps your conversations private</p>
          </div>
          
          <div className="bg-white p-3 rounded-lg shadow-message border border-slate-100">
            <div className="flex items-center mb-2">
              <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                <span className="text-primary-500 text-sm">📸</span>
              </div>
              <h3 className="ml-2 font-medium text-slate-800">Share Media</h3>
            </div>
            <p className="text-sm text-slate-600">Easily share images and create lasting memories</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};