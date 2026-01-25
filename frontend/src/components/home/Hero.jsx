import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/axios';

const Hero = () => {
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHeroProduct = async () => {
      try {
        const { data } = await apiClient.get('/products?featured=true&limit=1');
        if (data.success && data.data.products.length > 0) {
          setProduct(data.data.products[0]);
        }
      } catch (error) {
        console.error('Failed to fetch hero product:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHeroProduct();
  }, []);

  const trustBadges = [
    { value: '5 Years', label: 'International Warranty' },
    { value: '256-bit', label: 'Secure Checkout' },
    { value: '30 Days', label: 'Free Returns' }
  ];

  const variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
    }
  };

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-stone-50 flex items-center justify-center">Loading...</div>;
  }

  // Fallback if no featured product found (or handle as null return)
  if (!product) {
    return null; // Or keep static content as fallback? User specifically asked for dynamic.
  }

  // Helper to split name for styling if desired, or just show full name
  const nameParts = product.name.split(' ');
  const mainName = nameParts.length > 1 ? nameParts.slice(0, -1).join(' ') : product.name;
  const secondaryName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';

  return (
    <section className="min-h-screen flex items-center pt-32 pb-16 px-6 bg-stone-50 relative overflow-hidden">
      {/* Background Text */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-display text-[20vw] font-light text-amber-900/5 whitespace-nowrap pointer-events-none select-none z-0">
        PRECISION
      </div>

      <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-16 items-center relative z-10">
        {/* Content */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="visible"
        >
          {/* Eyebrow */}
          <motion.div variants={variants} className="inline-flex items-center gap-4 mb-8">
            <span className="w-10 h-px bg-amber-600" />
            <span className="text-xs font-medium tracking-widest uppercase text-amber-600">
              Limited Edition 2026
            </span>
          </motion.div>

          {/* Title */}
          <motion.h1 variants={variants} className="font-display text-5xl md:text-6xl lg:text-7xl leading-tight mb-6 font-normal text-crown-black">
            {secondaryName ? (
              <>
                {mainName}<br />
                <em className="font-display italic text-amber-700">{secondaryName}</em>
              </>
            ) : (
              product.name
            )}
          </motion.h1>

          {/* Description */}
          <motion.p variants={variants} className="text-lg text-gray-600 mb-8 max-w-lg leading-relaxed font-light">
            {product.description}
          </motion.p>

          {/* Price & Availability */}
          <motion.div variants={variants} className="flex items-center gap-10 mb-10 flex-wrap">
            <div className="flex flex-col">
              <span className="text-xs tracking-widest uppercase text-gray-500 mb-1">Starting From</span>
              <span className="font-display text-4xl font-medium text-crown-black">
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: product.currency || 'USD' }).format(product.price)}
              </span>
            </div>
            <div className="w-px h-12 bg-gray-200 hidden sm:block" />
            <div className="flex items-center gap-3">
              <div className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </div>
              <span className="text-sm font-medium text-gray-600">In Stock • Ships in 24h</span>
            </div>
          </motion.div>

          {/* CTAs */}
          <motion.div variants={variants} className="flex gap-4 mb-12 flex-wrap">
            <button
              onClick={() => navigate('/shop')}
              className="px-8 py-4 bg-crown-black text-white text-xs font-medium tracking-widest uppercase hover:bg-amber-700 transition-all duration-300 flex items-center gap-3 group shadow-lg shadow-amber-900/10"
            >
              Shop Collection
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </button>
            <button
              onClick={() => navigate(`/product/${product.slug}`)}
              className="px-8 py-4 border border-crown-black text-crown-black text-xs font-medium tracking-widest uppercase hover:bg-crown-black hover:text-white transition-all duration-300"
            >
              Explore Details
            </button>
          </motion.div>

          {/* Trust Badges */}
          <motion.div variants={variants} className="flex gap-10 flex-wrap pt-8 border-t border-gray-100">
            {trustBadges.map((badge) => (
              <div key={badge.label} className="flex flex-col">
                <span className="font-display text-2xl font-medium text-crown-black">{badge.value}</span>
                <span className="text-xs tracking-wider uppercase text-gray-500">{badge.label}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Visual */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
          className="relative hidden lg:block"
        >
          {/* Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-600/10 rounded-full blur-3xl" />

          {/* Rotating Ring */}
          <div className="absolute top-1/2 left-1/2 w-[450px] h-[450px] border border-amber-600/10 rounded-full animate-rotate-slow">
            <div className="absolute -top-1 left-1/2 w-2 h-2 bg-amber-600 rounded-full" />
          </div>

          {/* Watch Image */}
          {product.images && product.images.length > 0 && (
            <motion.img
              src={product.images[0].url}
              alt={product.name}
              className="w-full max-w-lg mx-auto relative z-10 drop-shadow-2xl"
              animate={{ translateY: [-10, 10, -10] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            />
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;