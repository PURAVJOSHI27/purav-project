import React, { useState, useRef } from 'react';
import { Send, Smile, Image, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '../ui/Button';
import { useMessageStore } from '../../store/messageStore';

interface MessageInputProps {
  conversationId: string;
}

export const MessageInput: React.FC<MessageInputProps> = ({ conversationId }) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { sendMessage, loading } = useMessageStore();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() && !imagePreview) return;
    
    try {
      await sendMessage(conversationId, message);
      setMessage('');
      setImagePreview(null);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };
  
  const handleImageClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };
  
  const removeImagePreview = () => {
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="border-t border-slate-200 bg-white p-4">
      {imagePreview && (
        <div className="relative mb-2 inline-block">
          <img 
            src={imagePreview} 
            alt="Preview" 
            className="h-20 rounded-md object-cover"
          />
          <button 
            onClick={removeImagePreview}
            className="absolute -top-2 -right-2 bg-slate-800 text-white rounded-full p-1"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="flex items-end gap-2">
        <div className="flex-1 bg-slate-100 rounded-xl px-4 py-2 focus-within:ring-2 focus-within:ring-primary-500 focus-within:ring-opacity-50">
          <div className="flex">
            <textarea
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                setIsTyping(e.target.value.length > 0);
              }}
              placeholder="Type a message..."
              className="w-full bg-transparent border-0 focus:ring-0 resize-none max-h-32 py-2"
              rows={1}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
          </div>
          <div className="flex justify-between items-center py-1">
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={handleImageClick}
                className="text-slate-500 hover:text-slate-700"
              >
                <Image className="h-5 w-5" />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
                className="hidden"
              />
              <button
                type="button"
                className="text-slate-500 hover:text-slate-700"
              >
                <Smile className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
        
        <motion.div
          initial={false}
          animate={{ scale: isTyping || imagePreview ? 1 : 0.8, opacity: isTyping || imagePreview ? 1 : 0.5 }}
        >
          <Button
            type="submit"
            disabled={!message.trim() && !imagePreview}
            isLoading={loading}
            className="rounded-full p-3 h-12 w-12"
          >
            <Send className="h-5 w-5" />
          </Button>
        </motion.div>
      </form>
    </div>
  );
};