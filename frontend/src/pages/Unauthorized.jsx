import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

/**
 * Unauthorized Page
 * Shown when user tries to access a route they don't have permission for
 */
export const Unauthorized = () => {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-stone-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full p-8 text-center bg-white shadow-xl border border-stone-200"
      >
        {/* Icon */}
        <div className="inline-block p-4 bg-red-50 rounded-full mb-6">
          <svg
            className="w-16 h-16 text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-serif font-bold text-crown-black mb-4">
          Access Denied
        </h1>

        {/* Message */}
        <p className="text-stone-500 mb-8">
          You don't have permission to access this page. This area is restricted to authorized users only.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/" className="bg-crown-black text-white px-6 py-3 rounded hover:bg-stone-800 transition-colors uppercase tracking-widest text-xs font-medium">
            Go Home
          </Link>
          <Link to="/shop" className="bg-white text-crown-black border border-stone-200 px-6 py-3 rounded hover:bg-stone-50 transition-colors uppercase tracking-widest text-xs font-medium">
            Browse Shop
          </Link>
        </div>
      </motion.div>
    </div>
  );
};
