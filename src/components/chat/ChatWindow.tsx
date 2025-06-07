import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  addDoc, 
  serverTimestamp,
  onSnapshot,
  getDoc,
  doc
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuthStore } from '../../store/authStore';
import { User } from '../../types';
import { ArrowLeft, Send } from 'lucide-react';

interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: any;
}

export const ChatWindow: React.FC = () => {
  const { friendId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [friend, setFriend] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch friend's details
  useEffect(() => {
    const fetchFriend = async () => {
      if (!friendId) return;

      try {
        const friendDoc = await getDoc(doc(db, 'profiles', friendId));
        if (friendDoc.exists()) {
          setFriend({
            id: friendDoc.data().user_id,
            username: friendDoc.data().username,
            email: friendDoc.data().email,
            avatar_url: friendDoc.data().avatar_url,
            created_at: friendDoc.data().created_at,
          });
        }
      } catch (error) {
        console.error('Error fetching friend details:', error);
      }
    };

    fetchFriend();
  }, [friendId]);

  // Subscribe to messages
  useEffect(() => {
    if (!user || !friendId) return;

    const chatQuery = query(
      collection(db, 'messages'),
      where('participants', 'array-contains', user.id),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(chatQuery, (snapshot) => {
      const newMessages = snapshot.docs
        .filter(doc => {
          const data = doc.data();
          return data.participants.includes(friendId);
        })
        .map(doc => ({
          id: doc.id,
          senderId: doc.data().senderId,
          text: doc.data().text,
          timestamp: doc.data().timestamp,
        }));

      setMessages(newMessages);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, friendId]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !friendId || !newMessage.trim()) return;

    try {
      await addDoc(collection(db, 'messages'), {
        text: newMessage.trim(),
        senderId: user.id,
        participants: [user.id, friendId],
        timestamp: serverTimestamp(),
      });

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  if (loading || !friend) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-gray-50">
      {/* Chat header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center">
        <button
          onClick={() => navigate('/chat')}
          className="mr-4 p-1 rounded-full hover:bg-gray-100"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <img
          src={friend.avatar_url || '/default-avatar.png'}
          alt={friend.username}
          className="w-10 h-10 rounded-full"
        />
        <div className="ml-3">
          <h2 className="font-medium text-gray-900">{friend.username}</h2>
          <p className="text-sm text-gray-500">{friend.email}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {messages.map((message) => {
            const isOwnMessage = message.senderId === user?.id;
            return (
              <div
                key={message.id}
                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] rounded-lg px-4 py-2 ${
                    isOwnMessage
                      ? 'bg-primary-500 text-white'
                      : 'bg-white border border-gray-200'
                  }`}
                >
                  <p>{message.text}</p>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message input */}
      <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-200">
        <div className="flex space-x-4">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
}; 