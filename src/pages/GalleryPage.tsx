import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { usePhotoStore, type Photo } from '../store/photoStore';
import { useAuthStore } from '../store/authStore';
import { Heart, MessageCircle, Filter, Search, Calendar } from 'lucide-react';
import { format } from 'date-fns';

const GalleryPage: React.FC = () => {
  const { photos, initPhotos } = usePhotoStore();
  const { user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState<'all' | 'mine' | 'partner'>('all');
  
  useEffect(() => {
    initPhotos();
  }, [initPhotos]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Filter and search photos
  const filteredPhotos = photos
    .filter(photo => {
      // Apply user filter
      if (filterBy === 'mine' && photo.uploadedBy !== user?.id) return false;
      if (filterBy === 'partner' && photo.uploadedBy === user?.id) return false;
      
      // Apply search term filter
      if (searchTerm.trim() !== '') {
        const term = searchTerm.toLowerCase();
        return (
          photo.title.toLowerCase().includes(term) || 
          (photo.description?.toLowerCase().includes(term) || false)
        );
      }
      
      return true;
    })
    .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Photo Gallery</h1>
        
        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search photos..."
              className="pl-10 input"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
          
          <div className="sm:w-auto">
            <div className="relative inline-flex items-center">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Filter size={18} className="text-gray-400" />
              </div>
              <select
                className="pl-10 input appearance-none pr-10"
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value as 'all' | 'mine' | 'partner')}
              >
                <option value="all">All Photos</option>
                <option value="mine">My Uploads</option>
                <option value="partner">Partner's Uploads</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Gallery */}
        {filteredPhotos.length > 0 ? (
          <motion.div 
            className="photo-grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {filteredPhotos.map((photo, index) => (
              <PhotoCard key={photo.id} photo={photo} index={index} />
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No photos found matching your criteria.</p>
            {searchTerm && (
              <button 
                className="mt-4 text-primary-600 hover:text-primary-700"
                onClick={() => setSearchTerm('')}
              >
                Clear search
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

interface PhotoCardProps {
  photo: Photo;
  index: number;
}

const PhotoCard: React.FC<PhotoCardProps> = ({ photo, index }) => {
  const { user } = useAuthStore();
  const isPartnerPhoto = photo.uploadedBy !== user?.id;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
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
          {photo.description && (
            <p className="text-gray-500 text-sm mt-1 line-clamp-2">{photo.description}</p>
          )}
          
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
  );
};

export default GalleryPage;