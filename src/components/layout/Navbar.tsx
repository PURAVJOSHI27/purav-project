import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Home, Images, Upload, User, LogOut, Menu, X } from 'lucide-react';
import { motion } from 'framer-motion';

const Navbar: React.FC = () => {
  const { pathname } = useLocation();
  const { user, signOut } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const navItems = [
    { path: '/', label: 'Home', icon: <Home size={20} /> },
    { path: '/gallery', label: 'Gallery', icon: <Images size={20} /> },
    { path: '/upload', label: 'Upload', icon: <Upload size={20} /> },
    { path: '/profile', label: 'Profile', icon: <User size={20} /> }
  ];

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="flex items-center text-primary-600">
              <Images className="h-6 w-6" />
            </div>
            <span className="font-bold text-lg text-gray-900">Moments Shared</span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-4">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 
                  ${pathname === item.path 
                    ? 'bg-primary-50 text-primary-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                  }`}
              >
                <span className="mr-1.5">{item.icon}</span>
                {item.label}
              </Link>
            ))}
            
            <button
              onClick={signOut}
              className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors duration-150"
            >
              <LogOut size={20} className="mr-1.5" />
              Logout
            </button>
          </nav>
          
          {/* User info - Desktop */}
          <div className="hidden md:flex items-center">
            <div className="flex items-center space-x-3">
              {user?.avatar_url && (
                <img 
                  src={user.avatar_url}
                  alt={`${user.username}'s avatar`}
                  className="w-8 h-8 rounded-full object-cover"
                />
              )}
              <span className="text-sm font-medium">{user?.username}</span>
            </div>
          </div>
          
          {/* Mobile menu button */}
          <button
            className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:bg-gray-100 focus:outline-none transition-colors duration-150"
            onClick={toggleMobileMenu}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <motion.div 
          className="md:hidden bg-white shadow-lg"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          <div className="px-2 pt-2 pb-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-3 py-2 rounded-md text-base font-medium ${
                  pathname === item.path
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                onClick={closeMobileMenu}
              >
                <span className="mr-2">{item.icon}</span>
                {item.label}
              </Link>
            ))}
            
            <button
              onClick={() => { closeMobileMenu(); signOut(); }}
              className="w-full flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-100"
            >
              <LogOut size={20} className="mr-2" />
              Logout
            </button>
            
            {/* User info - Mobile */}
            <div className="flex items-center px-3 py-2 mt-4 border-t border-gray-200">
              {user?.avatar_url && (
                <img
                  src={user.avatar_url}
                  alt={`${user.username}'s avatar`}
                  className="w-8 h-8 rounded-full object-cover mr-2"
                />
              )}
              <span className="text-sm font-medium">{user?.username}</span>
            </div>
          </div>
        </motion.div>
      )}
    </header>
  );
};

export default Navbar;