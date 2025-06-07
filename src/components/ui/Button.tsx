import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  className = '',
  ...props
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-primary-500 hover:bg-primary-600 text-white shadow-sm';
      case 'secondary':
        return 'bg-white hover:bg-gray-50 text-slate-900 border border-slate-200 shadow-sm';
      case 'outline':
        return 'bg-transparent hover:bg-gray-50 text-slate-900 border border-slate-200';
      case 'ghost':
        return 'bg-transparent hover:bg-gray-50 text-slate-700';
      default:
        return 'bg-primary-500 hover:bg-primary-600 text-white';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'text-sm px-2.5 py-1.5 rounded-md';
      case 'md':
        return 'text-sm px-4 py-2 rounded-md';
      case 'lg':
        return 'text-base px-5 py-2.5 rounded-md';
      default:
        return 'text-sm px-4 py-2 rounded-md';
    }
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`
        font-medium inline-flex items-center justify-center
        focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1
        disabled:opacity-50 disabled:cursor-not-allowed transition-colors
        ${getVariantClasses()}
        ${getSizeClasses()}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading && (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      )}
      {!isLoading && leftIcon && (
        <span className="mr-2">{leftIcon}</span>
      )}
      {children}
      {!isLoading && rightIcon && (
        <span className="ml-2">{rightIcon}</span>
      )}
    </motion.button>
  );
};