import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { usePhotoStore } from '../store/photoStore';
import { User, Images, Calendar, Heart, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

const ProfilePage: React.FC = () => {
  const { user } = useAuthStore();
  const { photos, initPhotos } = usePhotoStore();
  const [stats, setStats] = useState({
    totalPhotos: 0,
    totalLikes: 0,
    totalComments: 0,
    partnerPhotos: 0
  });
  
  useEffect(() => {
    initPhotos();
  }, [initPhotos]);
  
  useEffect(() => {
    if (user) {
      const userPhotos = photos.filter(photo => photo.uploadedBy === user.id);
      const partnerPhotos = photos.filter(photo => photo.uploadedBy !== user.id);
      
      setStats({
        totalPhotos: userPhotos.length,
        totalLikes: userPhotos.reduce((sum, photo) => sum + photo.likes, 0),
        totalComments: userPhotos.reduce((sum, photo) => sum + photo.comments.length, 0),
        partnerPhotos: partnerPhotos.length
      });
    }
  }, [photos, user]);
  
  // Get user's recent photos (last 6)
  const userPhotos = photos
    .filter(photo => photo.uploadedBy === user?.id)
    .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
    .slice(0, 6);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <motion.div 
          className="bg-white rounded-xl shadow-sm p-6 mb-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex flex-col sm:flex-row items-center">
            <div className="mb-4 sm:mb-0 sm:mr-6">
              {user?.avatar_url ? (
                <img 
                  src={user.avatar_url} 
                  alt={user.username}
                  className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-primary-100 flex items-center justify-center border-4 border-white shadow-md">
                  <User size={40} className="text-primary-600" />
                </div>
              )}
            </div>
            
            <div className="text-center sm:text-left flex-grow">
              <h1 className="text-2xl font-bold text-gray-900">{user?.username}</h1>
              <p className="text-gray-500 mt-1">{user?.email}</p>
            </div>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 text-center">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-primary-600">{stats.totalPhotos}</div>
              <div className="text-sm text-gray-500">Photos Shared</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-secondary-600">{stats.partnerPhotos}</div>
              <div className="text-sm text-gray-500">Partner's Photos</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-accent-600">{stats.totalLikes}</div>
              <div className="text-sm text-gray-500">Likes Received</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-indigo-600">{stats.totalComments}</div>
              <div className="text-sm text-gray-500">Comments</div>
            </div>
          </div>
        </motion.div>
        
        {/* Your Photos Section */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Your Photos</h2>
            <Link to="/upload" className="text-primary-600 hover:text-primary-800 text-sm font-medium">
              Share a new photo →
            </Link>
          </div>
          
          {userPhotos.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {userPhotos.map((photo, index) => (
                <motion.div
                  key={photo.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Link to={`/photos/${photo.id}`} className="card h-full block group">
                    <div className="relative pb-[100%] overflow-hidden">
                      <img
                        src={photo.url}
                        alt={photo.title}
                        className="absolute h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium text-gray-900 truncate">{photo.title}</h3>
                      
                      <div className="flex items-center justify-between mt-2 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar size={14} className="mr-1" />
                          <span>{format(new Date(photo.uploadedAt), 'MMM d, yyyy')}</span>
                        </div>
                        <div className="flex space-x-3">
                          <div className="flex items-center">
                            <Heart size={14} className="mr-1" />
                            <span>{photo.likes}</span>
                          </div>
                          <div className="flex items-center">
                            <MessageCircle size={14} className="mr-1" />
                            <span>{photo.comments.length}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <Images className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No photos yet</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by sharing a special moment.</p>
              <div className="mt-6">
                <Link to="/upload" className="btn btn-primary inline-flex items-center">
                  <Images size={18} className="mr-2" />
                  Share Your First Photo
                </Link>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default ProfilePage;