import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuthStore } from '../../store/authStore';
import { User } from '../../types';

export const FriendsList: React.FC = () => {
  const [friends, setFriends] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFriends = async () => {
      if (!user) return;

      try {
        // For now, we'll show all users as potential friends
        // In a real app, you'd want to implement proper friend relationships
        const usersRef = collection(db, 'profiles');
        const q = query(usersRef, where('user_id', '!=', user.id));
        const querySnapshot = await getDocs(q);
        
        const friendsList = querySnapshot.docs.map(doc => ({
          id: doc.data().user_id,
          username: doc.data().username,
          email: doc.data().email,
          avatar_url: doc.data().avatar_url,
          created_at: doc.data().created_at,
        }));

        setFriends(friendsList);
      } catch (error) {
        console.error('Error fetching friends:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFriends();
  }, [user]);

  const handleFriendSelect = (friendId: string) => {
    navigate(`/chat/${friendId}`);
  };

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-white">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">Friends</h2>
      </div>
      
      <div className="overflow-y-auto h-[calc(100vh-8rem)]">
        {friends.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            No friends found. Start a conversation with someone!
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {friends.map((friend) => (
              <button
                key={friend.id}
                onClick={() => handleFriendSelect(friend.id)}
                className="w-full p-4 flex items-center hover:bg-gray-50 transition-colors duration-150"
              >
                <img
                  src={friend.avatar_url || '/default-avatar.png'}
                  alt={friend.username}
                  className="w-12 h-12 rounded-full"
                />
                <div className="ml-4 text-left">
                  <h3 className="font-medium text-gray-900">{friend.username}</h3>
                  <p className="text-sm text-gray-500">{friend.email}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}; 