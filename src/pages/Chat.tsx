import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Menu, MessageSquare, Users, Settings, LogOut, Heart } from 'lucide-react';
import { Avatar } from '../components/ui/Avatar';
import { ChatList } from '../components/chat/ChatList';
import { ChatHeader } from '../components/chat/ChatHeader';
import { MessageList } from '../components/chat/MessageList';
import { MessageInput } from '../components/chat/MessageInput';
import { useChatStore } from '../store/chatStore';
import { useAuthStore } from '../store/authStore';
import { Conversation } from '../types';

export const Chat: React.FC = () => {
  const { user, signOut } = useAuthStore();
  const { activeConversation, setActiveConversation, conversations, fetchConversations } = useChatStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const handleConversationSelect = (conversation: Conversation) => {
    setActiveConversation(conversation);
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Top Navigation */}
      <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-4">
        <div className="flex items-center">
          <button 
            onClick={toggleMobileMenu}
            className="md:hidden p-2 mr-2 rounded-full hover:bg-slate-100"
          >
            <Menu className="h-5 w-5 text-slate-600" />
          </button>
          
          <div className="flex items-center">
            <Heart className="h-6 w-6 text-primary-500 mr-2" />
            <h1 className="text-xl font-bold text-slate-900">LoveChat</h1>
          </div>
        </div>
        
        <div className="flex items-center space-x-1">
          <button className="p-2 rounded-full hover:bg-slate-100 text-slate-600">
            <MessageSquare className="h-5 w-5" />
          </button>
          <button className="p-2 rounded-full hover:bg-slate-100 text-slate-600">
            <Users className="h-5 w-5" />
          </button>
          <button className="p-2 rounded-full hover:bg-slate-100 text-slate-600">
            <Settings className="h-5 w-5" />
          </button>
          <button 
            onClick={() => signOut()}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-600"
          >
            <LogOut className="h-5 w-5" />
          </button>
          <div className="ml-2">
            <Avatar 
              src={user?.avatar_url} 
              alt={user?.username || 'User'} 
              size="sm" 
              fallback={user?.username?.substring(0, 2) || 'U'}
            />
          </div>
        </div>
      </header>
      
      <div className="flex-1 flex overflow-hidden">
        {/* Chat List - Hidden on mobile when a chat is active */}
        <motion.div 
          initial={false}
          animate={{ 
            x: isMobileMenuOpen || !activeConversation || window.innerWidth >= 768 ? 0 : -320,
            width: window.innerWidth >= 768 ? '320px' : '100%',
            opacity: isMobileMenuOpen || !activeConversation || window.innerWidth >= 768 ? 1 : 0,
          }}
          transition={{ duration: 0.2 }}
          className="fixed md:relative md:block z-10 h-[calc(100%-4rem)] w-full md:w-80 bg-white border-r border-slate-200"
          style={{ display: (isMobileMenuOpen || !activeConversation || window.innerWidth >= 768) ? 'block' : 'none' }}
        >
          <ChatList 
            onConversationSelect={handleConversationSelect}
            activeConversationId={activeConversation?.id || null}
          />
        </motion.div>
        
        {/* Chat Content */}
        <div className="flex-1 flex flex-col h-[calc(100%-4rem)] bg-white">
          <ChatHeader 
            conversation={activeConversation}
            onBackClick={() => setIsMobileMenuOpen(true)}
          />
          
          <div className="flex-1 flex flex-col overflow-hidden">
            <MessageList conversationId={activeConversation?.id || ''} />
            
            {activeConversation && (
              <MessageInput conversationId={activeConversation.id} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};