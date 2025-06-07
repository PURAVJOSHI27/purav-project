import React, { useEffect, useRef } from 'react';
import { HeartHandshake } from 'lucide-react';
import { motion } from 'framer-motion';
import { MessageBubble } from './MessageBubble';
import { useMessageStore } from '../../store/messageStore';
import { Message } from '../../types';
import { useAuthStore } from '../../store/authStore';

interface MessageListProps {
  conversationId: string;
}

export const MessageList: React.FC<MessageListProps> = ({ conversationId }) => {
  const { messages, fetchMessages, loading, subscribeToMessages } = useMessageStore();
  const { user } = useAuthStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (conversationId) {
      fetchMessages(conversationId);
      
      // Subscribe to new messages
      const unsubscribe = subscribeToMessages(conversationId);
      
      return () => {
        unsubscribe();
      };
    }
  }, [conversationId, fetchMessages, subscribeToMessages]);
  
  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages[conversationId]]);
  
  if (!conversationId) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4 bg-slate-50">
        <HeartHandshake className="h-16 w-16 text-primary-300 mb-4" />
        <h3 className="text-xl font-semibold text-slate-700">Welcome to LoveChat</h3>
        <p className="text-slate-500 text-center mt-2">
          Select a conversation or start a new one
        </p>
      </div>
    );
  }
  
  const conversationMessages = messages[conversationId] || [];
  
  if (loading && conversationMessages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-4 bg-slate-50">
        <div className="animate-pulse text-slate-500">Loading messages...</div>
      </div>
    );
  }
  
  if (conversationMessages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4 bg-slate-50">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <HeartHandshake className="h-16 w-16 text-primary-300 mb-4" />
        </motion.div>
        <h3 className="text-xl font-semibold text-slate-700">No messages yet</h3>
        <p className="text-slate-500 text-center mt-2">
          Send a message to start the conversation
        </p>
      </div>
    );
  }
  
  // Group consecutive messages from the same sender
  const groupedMessages: { message: Message; isConsecutive: boolean }[] = [];
  
  conversationMessages.forEach((message, index) => {
    const isConsecutive = index > 0 && 
      conversationMessages[index - 1].sender_id === message.sender_id &&
      // Messages within 5 minutes of each other are grouped
      new Date(message.created_at).getTime() - new Date(conversationMessages[index - 1].created_at).getTime() < 5 * 60 * 1000;
    
    groupedMessages.push({ message, isConsecutive });
  });

  return (
    <div className="flex-1 p-4 overflow-y-auto bg-slate-50">
      <div className="space-y-1">
        {groupedMessages.map(({ message, isConsecutive }, index) => (
          <MessageBubble 
            key={message.id} 
            message={message}
            isConsecutive={isConsecutive}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};