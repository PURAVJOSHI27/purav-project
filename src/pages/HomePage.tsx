import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { usePhotoStore, type Photo } from '../store/photoStore';
import { Image, Upload, MessageCircle, Heart, Calendar } from 'lucide-react';
import { format } from 'date-fns';

const HomePage: React.FC = () => {
  const { user } = useAuthStore();
  const { photos, initPhotos } = usePhotoStore();

  useEffect(() => {
    initPhotos();
  }, [initPhotos]);

  // Get recent photos (last 4)
  const recentPhotos = photos
    .slice()
    .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
    .slice(0, 4);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <motion.section 
        className="mb-12 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
          Welcome back, {user?.username}!
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
          Share and cherish your special moments together in your private space.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link to="/upload" className="btn btn-primary flex items-center">
            <Upload size={18} className="mr-2" />
            Share a Moment
          </Link>
          <Link to="/gallery" className="btn bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 flex items-center">
            <Image size={18} className="mr-2" />
            View Gallery
          </Link>
        </div>
      </motion.section>

      {/* Recent Photos Section */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Recent Moments</h2>
          <Link to="/gallery" className="text-primary-600 hover:text-primary-800 text-sm font-medium">
            View all →
          </Link>
        </div>

        {recentPhotos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recentPhotos.map((photo, index) => (
              <RecentPhotoCard key={photo.id} photo={photo} index={index} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <Image className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No moments yet</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by sharing a special moment.</p>
            <div className="mt-6">
              <Link to="/upload" className="btn btn-primary inline-flex items-center">
                <Upload size={18} className="mr-2" />
                Share a Moment
              </Link>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

interface RecentPhotoCardProps {
  photo: Photo;
  index: number;
}

const RecentPhotoCard: React.FC<RecentPhotoCardProps> = ({ photo, index }) => {
  const { user } = useAuthStore();
  
  // Determine if the photo was uploaded by the partner or the current user
  const isPartnerPhoto = photo.uploadedBy !== user?.id;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
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
          {isPartnerPhoto && (
            <div className="absolute top-2 left-2 bg-secondary-500 text-white text-xs px-2 py-1 rounded-full">
              From Partner
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-medium text-gray-900 truncate">{photo.title}</h3>
          
          <div className="flex items-center justify-between mt-2 text-sm text-gray-500">
            <div className="flex items-center">
              <Calendar size={14} className="mr-1" />
              <span>{format(new Date(photo.uploadedAt), 'MMM d')}</span>
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
  );
};

export default HomePage;