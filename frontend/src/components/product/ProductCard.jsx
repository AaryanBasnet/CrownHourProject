import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

/**
 * ProductCard Component
 * Displays individual product with luxury styling
 * Features image hover zoom effect and gold accents
 */
export const ProductCard = ({ product }) => {
  const {
    _id,
    name,
    brand,
    price,
    imageUrl,
    category,
    stock,
  } = product;

  const isOutOfStock = stock === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
      className="glass-card overflow-hidden group"
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-crown-black-lighter">
        {imageUrl ? (
          <motion.img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover"
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.4 }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg
              className="w-24 h-24 text-crown-gray/30"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        )}

        {/* Out of Stock Badge */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-crown-black/80 flex items-center justify-center">
            <span className="text-crown-gold font-semibold text-lg">
              Out of Stock
            </span>
          </div>
        )}

        {/* Category Badge */}
        {category && !isOutOfStock && (
          <div className="absolute top-3 right-3">
            <span className="bg-crown-gold/20 backdrop-blur-sm border border-crown-gold/50 text-crown-gold text-xs px-3 py-1 rounded-full">
              {category}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Brand */}
        <p className="text-crown-gray text-sm uppercase tracking-wide mb-1">
          {brand}
        </p>

        {/* Name */}
        <h3 className="text-crown-gold-light font-serif text-xl font-semibold mb-3 line-clamp-2">
          {name}
        </h3>

        {/* Price and Action */}
        <div className="flex items-center justify-between mt-4">
          <div className="text-2xl font-serif font-bold text-crown-gold">
            ${price.toLocaleString()}
          </div>

          <Link
            to={`/products/${_id}`}
            className={`
              px-4 py-2 rounded-md font-semibold transition-all duration-300
              ${
                isOutOfStock
                  ? 'bg-crown-gray/20 text-crown-gray cursor-not-allowed'
                  : 'bg-crown-gold text-crown-black hover:shadow-gold-glow'
              }
            `}
            onClick={(e) => isOutOfStock && e.preventDefault()}
          >
            {isOutOfStock ? 'Unavailable' : 'View Details'}
          </Link>
        </div>

        {/* Stock Indicator */}
        {!isOutOfStock && stock < 5 && (
          <p className="text-orange-400 text-xs mt-2">
            Only {stock} left in stock
          </p>
        )}
      </div>
    </motion.div>
  );
};
