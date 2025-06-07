import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { usePhotoStore } from '../store/photoStore';
import { Upload, X, Image, Check } from 'lucide-react';

const UploadPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { addPhoto } = usePhotoStore();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [fileRejection, setFileRejection] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  
  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    if (rejectedFiles.length > 0) {
      setFileRejection('Please upload an image file (JPG, PNG, GIF) under 5MB');
      return;
    }
    
    setFileRejection(null);
    
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      const reader = new FileReader();
      
      reader.onload = (e) => {
        if (e.target && e.target.result) {
          setPreviewImage(e.target.result as string);
        }
      };
      
      reader.readAsDataURL(file);
    }
  }, []);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
    },
    maxSize: 5242880, // 5MB
    maxFiles: 1,
  });
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!previewImage || !user) return;
    
    setIsUploading(true);
    
    try {
      // In a real app, we'd upload the image to a server
      // For this demo, we'll use the data URL directly
      addPhoto({
        url: previewImage,
        title,
        description: description || undefined,
        uploadedBy: user.id,
      });
      
      setUploadSuccess(true);
      
      // Reset form after successful upload
      setTimeout(() => {
        navigate('/gallery');
      }, 1500);
    } catch (error) {
      console.error('Error uploading photo:', error);
    } finally {
      setIsUploading(false);
    }
  };
  
  const resetForm = () => {
    setPreviewImage(null);
    setTitle('');
    setDescription('');
    setFileRejection(null);
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Share a Moment</h1>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-xl shadow-sm p-6"
        >
          {uploadSuccess ? (
            <div className="text-center py-8">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <Check className="h-6 w-6 text-green-600" />
              </div>
              <h2 className="mt-4 text-lg font-medium text-gray-900">Upload Successful!</h2>
              <p className="mt-2 text-gray-500">Your photo has been shared successfully.</p>
              <p className="text-sm text-gray-500 mt-1">Redirecting you to the gallery...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {!previewImage ? (
                <div 
                  {...getRootProps()} 
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                    isDragActive ? 'border-primary-400 bg-primary-50' : 'border-gray-300 hover:border-primary-300'
                  }`}
                >
                  <input {...getInputProps()} />
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-primary-50 mb-4">
                    <Upload className="h-6 w-6 text-primary-500" />
                  </div>
                  
                  {isDragActive ? (
                    <p className="text-primary-600">Drop your photo here...</p>
                  ) : (
                    <>
                      <p className="text-gray-700">Drag and drop your photo here, or click to select</p>
                      <p className="text-sm text-gray-500 mt-1">JPG, PNG, GIF (max 5MB)</p>
                    </>
                  )}
                  
                  {fileRejection && (
                    <p className="text-red-500 text-sm mt-2">{fileRejection}</p>
                  )}
                </div>
              ) : (
                <div className="mb-6 relative">
                  <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={previewImage}
                      alt="Preview"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="absolute top-2 right-2 p-1 rounded-full bg-gray-800 bg-opacity-70 text-white hover:bg-opacity-90 transition-opacity"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
              
              {previewImage && (
                <>
                  <div className="mb-4">
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      id="title"
                      required
                      placeholder="Enter a title for your photo"
                      className="input"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>
                  
                  <div className="mb-6">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                      Description (optional)
                    </label>
                    <textarea
                      id="description"
                      rows={3}
                      placeholder="Add a description..."
                      className="input"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="btn bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 mr-3"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!title || isUploading}
                      className="btn btn-primary flex items-center"
                    >
                      {isUploading ? 'Uploading...' : 'Share Photo'}
                    </button>
                  </div>
                </>
              )}
            </form>
          )}
        </motion.div>
        
        <div className="mt-8 bg-primary-50 rounded-lg p-6">
          <div className="flex">
            <div className="mr-4 flex-shrink-0">
              <Image className="h-10 w-10 text-primary-500" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">Tips for great photos</h3>
              <ul className="mt-2 text-sm text-gray-600 space-y-2">
                <li>• Choose high-quality images that capture special moments</li>
                <li>• Add descriptive titles to make them easier to find later</li>
                <li>• Include details in the description for context</li>
                <li>• Share regularly to build your collection of memories</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadPage;