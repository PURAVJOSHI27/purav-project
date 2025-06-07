import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export const LoginForm: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signInWithGoogle, user, loading } = useAuthStore();
  const navigate = useNavigate();

  // Redirect if user is already authenticated
  useEffect(() => {
    if (user && !loading) {
      navigate('/chat');
    }
  }, [user, loading, navigate]);

  const handleGoogleSignIn = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const { error } = await signInWithGoogle();
      
      if (error) {
        setError(error.message || 'Failed to sign in with Google');
      }
      // Don't navigate here - the redirect will happen automatically
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="w-full max-w-md mx-auto text-center">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="mt-4 text-slate-600">Loading...</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-md mx-auto"
    >
      <div className="text-center mb-8">
        <Heart className="h-12 w-12 text-primary-500 mx-auto animate-heart-beat" />
        <h2 className="mt-4 text-3xl font-bold text-slate-900">Welcome to LoveChat</h2>
        <p className="mt-2 text-slate-600">Sign in with Google to start your conversations</p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-100 text-red-600">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <button
          onClick={handleGoogleSignIn}
          disabled={isLoading || loading}
          className="w-full flex items-center justify-center px-4 py-3 border-2 border-gray-300 rounded-lg bg-white text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin mr-3"></div>
          ) : (
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          )}
          <span className="text-gray-700">
            {isLoading ? 'Signing in...' : 'Continue with Google'}
          </span>
        </button>
      </div>

      <div className="mt-8 text-center">
        <p className="text-xs text-slate-500">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </motion.div>
  );
}; 