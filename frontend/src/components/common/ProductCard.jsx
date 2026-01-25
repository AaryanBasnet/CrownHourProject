import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useWishlistStore } from '../../store/wishlistStore';

const ProductCard = ({ product }) => {
  const { name, category, badge, badgeType, specs, price, originalPrice, image, slug, id } = product;
  const navigate = useNavigate();
  const { isInWishlist, toggleWishlist } = useWishlistStore();

  const inWishlist = isInWishlist(id);

  const handleNavigate = () => {
    navigate(`/product/${slug}`);
  };

  const handleWishlistToggle = async (e) => {
    e.stopPropagation();
    // Reconstruct product object for wishlist
    const productData = {
      _id: id,
      name,
      slug,
      price,
      images: [{ url: image }],
      category
    };
    await toggleWishlist(productData);
  };

  return (
    <div
      onClick={handleNavigate}
      className="group bg-stone-50 border border-transparent hover:border-amber-600 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl cursor-pointer"
    >
      {/* Image Section */}
      <div className="relative">
        {/* Badge */}
        <span
          className={`absolute top-4 left-4 z-10 px-3 py-1.5 text-xs font-medium tracking-wider uppercase text-white ${badgeType === 'limited' ? 'bg-amber-600' : 'bg-gray-900'
            }`}
        >
          {badge}
        </span>

        {/* Quick Actions */}
        <div className="absolute top-4 right-4 z-10 flex flex-col gap-2 opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
          <button
            onClick={handleWishlistToggle}
            className={`w-10 h-10 bg-white flex items-center justify-center hover:bg-gray-900 transition-colors ${inWishlist ? 'text-red-500 hover:text-white' : 'text-gray-900 hover:text-white'
              }`}
            aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart
              size={20}
              fill={inWishlist ? 'currentColor' : 'none'}
              strokeWidth={2}
            />
          </button>
        </div>

        {/* Image Container */}
        <div className="relative p-12 bg-gradient-to-b from-stone-50 to-stone-100 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-amber-600/10 rounded-full transition-all duration-500 group-hover:w-72 group-hover:h-72" />
          <img
            src={image}
            alt={name}
            className="w-full h-72 object-contain relative z-10 transition-transform duration-700 group-hover:scale-110 group-hover:rotate-6"
          />
        </div>
      </div>

      {/* Details Section */}
      <div className="p-6">
        <div className="text-xs font-medium tracking-widest uppercase text-amber-600 mb-2">
          {category}
        </div>

        <h3 className="font-display text-2xl font-medium mb-2 group-hover:text-amber-600 transition-colors">
          {name}
        </h3>

        {/* Specs */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {specs.map((spec) => (
            <span key={spec} className="px-2 py-1 bg-white text-xs text-gray-500">
              {spec}
            </span>
          ))}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-100">
          <div className="flex flex-col">
            {originalPrice && (
              <span className="text-sm text-gray-400 line-through">
                ${originalPrice.toLocaleString()}
              </span>
            )}
            <span className="font-display text-xl font-medium">
              ${price.toLocaleString()}
            </span>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleNavigate();
            }}
            className="flex items-center gap-2 px-4 py-2 border border-gray-900 text-xs font-medium tracking-wider uppercase hover:bg-gray-900 hover:text-white transition-all group/btn"
          >
            Discover
            <svg
              className="w-4 h-4 transition-transform group-hover/btn:translate-x-1"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;