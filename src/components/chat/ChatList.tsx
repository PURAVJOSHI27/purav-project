import React, { useEffect, useState } from 'react';
import { Search, Plus, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import { Avatar } from '../ui/Avatar';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useChatStore } from '../../store/chatStore';
import { Conversation, User } from '../../types';
import { useAuthStore } from '../../store/authStore';
import { formatLastMessageTime } from '../../utils/dateFormatter';

interface ChatListProps {
  onConversationSelect: (conversation: Conversation) => void;
  activeConversationId: string | null;
  className?: string;
}

export const ChatList: React.FC<ChatListProps> = ({ 
  onConversationSelect,
  activeConversationId,
  className = '',
}) => {
  const { user: currentUser } = useAuthStore();
  const { conversations, fetchConversations, loading } = useChatStore();
  const [searchQuery, setSearchQuery] = useState('');
  
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);
  
  const filteredConversations = conversations.filter(conversation => {
    // Find other user in conversation
    const otherUser = conversation.participants.find(
      participant => participant.id !== currentUser?.id
    ) as User;
    
    if (!otherUser) return false;
    
    return otherUser.username.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const getOtherUser = (conversation: Conversation) => {
    return conversation.participants.find(
      participant => participant.id !== currentUser?.id
    ) as User;
  };

  return (
    <div className={`h-full flex flex-col bg-white border-r border-slate-200 ${className}`}>
      <div className="p-4 border-b border-slate-200">
        <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
          <MessageSquare className="h-5 w-5 text-primary-500 mr-2" />
          Messages
        </h2>
        <Input
          placeholder="Search conversations..."
          leftIcon={<Search className="h-4 w-4" />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      <div className="p-4">
        <Button 
          fullWidth 
          leftIcon={<Plus className="h-4 w-4" />}
        >
          New Conversation
        </Button>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-center text-slate-500">
            <span className="animate-pulse">Loading conversations...</span>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="p-4 text-center text-slate-500">
            {searchQuery ? 'No matching conversations found' : 'No conversations yet'}
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {filteredConversations.map((conversation) => {
              const otherUser = getOtherUser(conversation);
              const isActive = activeConversationId === conversation.id;
              
              return (
                <motion.li
                  key={conversation.id}
                  whileHover={{ backgroundColor: 'rgba(0,0,0,0.02)' }}
                  className={`
                    cursor-pointer p-3 transition-colors
                    ${isActive ? 'bg-slate-50 border-l-4 border-primary-500' : ''}
                  `}
                  onClick={() => onConversationSelect(conversation)}
                >
                  <div className="flex items-center">
                    <Avatar
                      src={otherUser?.avatar_url}
                      alt={otherUser?.username || 'User'}
                      fallback={otherUser?.username?.substring(0, 2) || 'U'}
                      status="online"
                    />
                    <div className="ml-3 flex-1 min-w-0">
                      <p className="font-medium text-slate-900 truncate">
                        {otherUser?.username || 'Unknown User'}
                      </p>
                      <p className="text-sm text-slate-500 truncate">
                        {conversation.last_message || 'Start a conversation...'}
                      </p>
                    </div>
                    {conversation.last_message_at && (
                      <span className="text-xs text-slate-400 whitespace-nowrap">
                        {formatLastMessageTime(conversation.last_message_at)}
                      </span>
                    )}
                  </div>
                </motion.li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};