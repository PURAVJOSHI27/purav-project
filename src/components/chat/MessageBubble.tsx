import React from 'react';
import { Check, CheckCheck, Image } from 'lucide-react';
import { Message } from '../../types';
import { useAuthStore } from '../../store/authStore';
import { formatMessageTime } from '../../utils/dateFormatter';

interface MessageBubbleProps {
  message: Message;
  isConsecutive?: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ 
  message,
  isConsecutive = false
}) => {
  const { user } = useAuthStore();
  const isSentByMe = message.sender_id === user?.id;
  
  const renderReadStatus = () => {
    if (!isSentByMe) return null;
    
    return message.read_at ? (
      <CheckCheck className="h-3.5 w-3.5 text-blue-500 flex-shrink-0 ml-1" />
    ) : (
      <Check className="h-3.5 w-3.5 text-slate-400 flex-shrink-0 ml-1" />
    );
  };
  
  const renderAttachment = () => {
    if (!message.attachment_url) return null;
    
    if (message.attachment_type?.startsWith('image/')) {
      return (
        <div className="mb-1 rounded-lg overflow-hidden">
          <img 
            src={message.attachment_url} 
            alt="Attachment" 
            className="max-w-full h-auto max-h-60 object-contain"
          />
        </div>
      );
    }
    
    return (
      <div className="mb-1 p-3 bg-slate-100 rounded-lg flex items-center">
        <Image className="h-5 w-5 text-slate-500 mr-2" />
        <span className="text-sm text-slate-700 line-clamp-1">Attachment</span>
      </div>
    );
  };

  return (
    <div className={`flex flex-col ${isSentByMe ? 'items-end' : 'items-start'} ${isConsecutive ? 'mt-1' : 'mt-4'}`}>
      <div className={`
        ${isSentByMe ? 'message-bubble-sent' : 'message-bubble-received'}
      `}>
        {renderAttachment()}
        <div className="min-w-[4rem]">{message.content}</div>
      </div>
      <div className={`
        flex items-center mt-1 text-xs
        ${isSentByMe ? 'text-slate-500' : 'text-slate-400'}
      `}>
        <span>{formatMessageTime(message.created_at)}</span>
        {renderReadStatus()}
      </div>
    </div>
  );
};