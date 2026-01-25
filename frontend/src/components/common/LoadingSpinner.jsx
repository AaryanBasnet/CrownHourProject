import { motion } from 'framer-motion';

/**
 * LoadingSpinner Component
 * Luxury-themed loading indicator
 */
export const LoadingSpinner = ({ size = 'md', fullScreen = false }) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  const spinner = (
    <motion.div
      className={`${sizeClasses[size]} border-4 border-crown-gold/30 border-t-crown-gold rounded-full`}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
    />
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-crown-black">
        <div className="text-center">
          {spinner}
          <p className="mt-4 text-crown-gray">Loading...</p>
        </div>
      </div>
    );
  }

  return spinner;
};
