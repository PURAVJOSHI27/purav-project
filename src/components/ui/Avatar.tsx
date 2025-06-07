import React, { useState } from 'react';

interface AvatarProps {
  src?: string;
  alt?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  fallback?: string;
  className?: string;
  status?: 'online' | 'offline' | 'away';
}

export const Avatar: React.FC<AvatarProps> = ({ 
  src, 
  alt = 'Avatar', 
  size = 'md', 
  fallback, 
  className = '',
  status
}) => {
  const [hasError, setHasError] = useState(false);
  
  const getSizeClass = () => {
    switch (size) {
      case 'xs': return 'w-6 h-6 text-xs';
      case 'sm': return 'w-8 h-8 text-sm';
      case 'md': return 'w-10 h-10 text-base';
      case 'lg': return 'w-12 h-12 text-lg';
      case 'xl': return 'w-16 h-16 text-xl';
      default: return 'w-10 h-10 text-base';
    }
  };
  
  const statusSizeClass = () => {
    switch (size) {
      case 'xs': return 'w-1.5 h-1.5';
      case 'sm': return 'w-2 h-2';
      case 'md': return 'w-2.5 h-2.5';
      case 'lg': return 'w-3 h-3';
      case 'xl': return 'w-3.5 h-3.5';
      default: return 'w-2.5 h-2.5';
    }
  };
  
  const statusColorClass = () => {
    switch (status) {
      case 'online': return 'bg-success-500';
      case 'offline': return 'bg-gray-400';
      case 'away': return 'bg-warning-500';
      default: return '';
    }
  };

  const getFallbackText = () => {
    if (fallback) return fallback.substring(0, 2).toUpperCase();
    if (alt) return alt.substring(0, 2).toUpperCase();
    return '?';
  };

  return (
    <div className={`relative inline-block ${className}`}>
      {(hasError || !src) ? (
        <div className={`${getSizeClass()} rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-medium`}>
          {getFallbackText()}
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          className={`${getSizeClass()} rounded-full object-cover`}
          onError={() => setHasError(true)}
        />
      )}
      
      {status && (
        <span 
          className={`absolute bottom-0 right-0 rounded-full ring-2 ring-white ${statusColorClass()} ${statusSizeClass()}`}
        />
      )}
    </div>
  );
};