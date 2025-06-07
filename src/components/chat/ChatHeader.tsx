import React from 'react';
import { ArrowLeft, MoreVertical, Phone, Video } from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { Conversation, User } from '../../types';
import { useAuthStore } from '../../store/authStore';

interface ChatHeaderProps {
  conversation: Conversation | null;
  onBackClick?: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ conversation, onBackClick }) => {
  const { user: currentUser } = useAuthStore();
  
  if (!conversation) {
    return (
      <div className="h-16 flex items-center px-4 border-b border-slate-200 bg-white">
        <div className="w-full text-center">
          <p className="text-slate-500">Select a conversation</p>
        </div>
      </div>
    );
  }
  
  // Find the other user in the conversation
  const otherUser = conversation.participants.find(
    (participant) => participant.id !== currentUser?.id
  ) as User;
  
  if (!otherUser) {
    return (
      <div className="h-16 flex items-center px-4 border-b border-slate-200 bg-white">
        <p className="text-slate-500">No participants found</p>
      </div>
    );
  }

  return (
    <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200 bg-white">
      <div className="flex items-center">
        <button 
          onClick={onBackClick} 
          className="md:hidden mr-2 p-1 rounded-full hover:bg-slate-100"
        >
          <ArrowLeft className="h-5 w-5 text-slate-600" />
        </button>
        
        <Avatar 
          src={otherUser.avatar_url} 
          alt={otherUser.username}
          fallback={otherUser.username.substring(0, 2)} 
          size="md"
          status="online"
        />
        
        <div className="ml-3">
          <h3 className="font-medium text-slate-900">{otherUser.username}</h3>
          <p className="text-xs text-slate-500">Online</p>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <button className="p-2 rounded-full hover:bg-slate-100 text-slate-600">
          <Phone className="h-5 w-5" />
        </button>
        <button className="p-2 rounded-full hover:bg-slate-100 text-slate-600">
          <Video className="h-5 w-5" />
        </button>
        <button className="p-2 rounded-full hover:bg-slate-100 text-slate-600">
          <MoreVertical className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};