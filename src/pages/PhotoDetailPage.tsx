import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { usePhotoStore } from '../stores/photoStore';
import { useAuthStore } from '../stores/authStore';
import { ChevronLeft, Heart, MessageCircle, Trash2, Send } from 'lucide-react';
import { format } from 'date-fns';

const PhotoDetailPage: React.FC = () => {
  const { photoId } = useParams<{ photoId: string }>();
  const navigate = useNavigate();
  const { photos, likePhoto, addComment, deletePhoto } = usePhotoStore();
  const { user } = useAuthStore();
  const [newComment, setNewComment] = useState('');
  
  const photo = photos.find(p => p.id === photoId);
  
  useEffect(() => {
    // If photo not found, redirect to gallery
    if (photoId && !photo) {
      navigate('/gallery');
    }
  }, [photoId, photo, navigate]);
  
  if (!photo) {
    return <div className="container mx-auto px-4 py-8">Photo not found</div>;
  }
  
  const isOwner = photo.uploadedBy === user?.id;
  
  const handleLike = () => {
    if (photoId) {
      likePhoto(photoId);
    }
  };
  
  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (photoId && user && newComment.trim()) {
      addComment(photoId, user.id, newComment.trim());
      setNewComment('');
    }
  };
  
  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this photo?')) {
      deletePhoto(photo.id);
      navigate('/gallery');
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto">
        {/* Back button */}
        <Link 
          to="/gallery" 
          className="inline-flex items-center text-primary-600 hover:text-primary-800 mb-6"
        >
          <ChevronLeft size={20} />
          <span>Back to Gallery</span>
        </Link>
        
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Photo */}
            <motion.div 
              className="relative aspect-square md:aspect-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <img
                src={photo.url}
                alt={photo.title}
                className="w-full h-full object-cover"
              />
            </motion.div>
            
            {/* Details */}
            <div className="p-6 flex flex-col h-full">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{photo.title}</h1>
                  <p className="text-gray-500 text-sm mt-1">
                    {format(new Date(photo.uploadedAt), 'MMMM d, yyyy')}
                  </p>
                </div>
                
                {isOwner && (
                  <button
                    onClick={handleDelete}
                    className="text-gray-400 hover:text-red-500 transition-colors p-1"
                    title="Delete photo"
                  >
                    <Trash2 size={20} />
                  </button>
                )}
              </div>
              
              {photo.description && (
                <p className="text-gray-700 mt-4">{photo.description}</p>
              )}
              
              <div className="flex mt-6 space-x-4">
                <button 
                  onClick={handleLike}
                  className="flex items-center space-x-1 text-gray-600 hover:text-primary-600 transition-colors"
                >
                  <Heart size={20} className={photo.likes > 0 ? 'text-primary-500 fill-current' : ''} />
                  <span>{photo.likes}</span>
                </button>
                
                <div className="flex items-center space-x-1 text-gray-600">
                  <MessageCircle size={20} />
                  <span>{photo.comments.length}</span>
                </div>
              </div>
              
              <div className="border-t border-gray-200 my-6 pt-6 flex-grow">
                <h2 className="font-medium text-gray-900 mb-4">Comments</h2>
                
                <div className="space-y-4 max-h-60 overflow-y-auto">
                  {photo.comments.length > 0 ? (
                    photo.comments.map((comment) => (
                      <div key={comment.id} className="flex space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                            <span className="text-primary-700 text-xs font-bold">
                              {comment.userId === user?.id ? 'You' : 'Her'}
                            </span>
                          </div>
                        </div>
                        <div className="flex-grow">
                          <p className="text-gray-800 text-sm">{comment.text}</p>
                          <p className="text-gray-500 text-xs mt-1">
                            {format(new Date(comment.createdAt), 'MMM d, h:mm a')}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">No comments yet. Be the first to comment!</p>
                  )}
                </div>
                
                <form onSubmit={handleAddComment} className="mt-4">
                  <div className="flex">
                    <input
                      type="text"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Add a comment..."
                      className="input rounded-r-none flex-grow"
                    />
                    <button
                      type="submit"
                      disabled={!newComment.trim()}
                      className="btn btn-primary rounded-l-none px-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send size={16} />
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhotoDetailPage;