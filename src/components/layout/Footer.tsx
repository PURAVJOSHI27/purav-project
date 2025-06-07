import React from 'react';
import { Heart } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-white border-t border-gray-200 py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row justify-between items-center">
          <div className="mb-4 sm:mb-0">
            <p className="text-gray-600 text-sm">
              © {currentYear} Moments Shared
            </p>
          </div>
          
          <div className="flex items-center text-gray-600 text-sm">
            <span className="flex items-center">
              Made with <Heart className="h-4 w-4 mx-1 text-secondary-500" fill="currentColor" /> for each other
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;