import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@store/authStore';
import { useCartStore } from '@store/cartStore';
import { useWishlistStore } from '@store/wishlistStore';
import { ShoppingBag, Heart, User, LogOut, Menu, X, ChevronDown } from 'lucide-react';
import { authService } from '@services';

export const Navbar = () => {
  const navigate = useNavigate();
  const { isLoggedIn, user, logout } = useAuthStore();
  const { count: cartCount, fetchCart } = useCartStore();
  const { items: wishlistItems, fetchWishlist } = useWishlistStore();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    // Initial fetch of cart/wishlist state
    fetchCart();
    fetchWishlist();
  }, [fetchCart, fetchWishlist, isLoggedIn]); // Re-fetch on login change

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);

    // Click outside to close profile dropdown
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await authService.logout(); // Backend logout
    } catch (error) {
      console.error("Logout error", error);
    }
    logout(); // Frontend store clear
    useCartStore.getState().clearCart(); // Clear local cart state if needed (or keep for next guest)
    setIsProfileOpen(false);
    navigate('/login');
  };

  const navLinks = [
    { name: 'Shop All', path: '/shop' },
    { name: 'Men', path: '/men' },
    { name: 'Women', path: '/women' },
    { name: 'Our Story', path: '/about' },
  ];

  const textColor = 'text-[#6B6B6B] hover:text-[#1A1A1A]'
  const iconColor = 'text-[#6B6B6B] hover:text-[#1A1A1A]'

  // Golden underline effect styling
  const linkStyles = `
    relative text-xs uppercase tracking-[0.1em] font-normal transition-colors duration-300
    after:content-[''] after:absolute after:-bottom-2 after:left-0 after:w-0 after:h-[1px] 
    after:bg-crown-gold after:transition-[width] after:duration-400 after:ease-[cubic-bezier(0.23,1,0.32,1)]
    hover:after:w-full
  `;

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-md border-b border-black/5' : 'bg-transparent'
        }`}
    >
      <nav className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className={`text-2xl font-display font-medium tracking-widest text-[#000000] `}>
          CROWN<span className="text-crown-gold">HOUR</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex gap-14 items-center">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={`${textColor} ${linkStyles}`}
            >
              {link.name}
            </Link>
          ))}
        </div>

        <div className="flex gap-8 items-center">
          {/* Mobile Menu Toggle */}
          <button
            className={`${textColor} transition-colors lg:hidden z-50`}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} className="text-white" /> : <Menu size={24} />}
          </button>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-8">
            <Link to="/wishlist" className={`relative ${iconColor} transition-colors`}>
              <Heart size={20} className="stroke-[1.5]" />
              {wishlistItems.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-crown-gold text-crown-black text-[10px] rounded-full flex items-center justify-center font-bold">
                  {wishlistItems.length}
                </span>
              )}
            </Link>

            <Link to="/cart" className={`relative ${iconColor} transition-colors`}>
              <ShoppingBag size={20} className="stroke-[1.5]" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-crown-gold text-crown-black text-[10px] rounded-full flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Profile Dropdown */}
            {isLoggedIn ? (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className={`flex items-center gap-2 ${iconColor} transition-colors`}
                >
                  {user?.profilePicture?.url ? (
                    <img
                      src={user.profilePicture.url}
                      alt={user.firstName}
                      className={`w-8 h-8 rounded-full object-cover border ${isScrolled ? 'border-black/10' : 'border-white/20'}`}
                    />
                  ) : (
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-crown-gold border ${isScrolled ? 'bg-black/5 border-black/10' : 'bg-white/10 border-white/5'}`}>
                      <User size={16} />
                    </div>
                  )}
                  <span className="text-xs font-medium tracking-wide hidden xl:block">
                    {user?.firstName}
                  </span>
                  <ChevronDown size={14} className={`transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                <div className={`absolute right-0 mt-4 w-56 bg-white border border-black/10 rounded-lg shadow-2xl py-2 transform transition-all duration-200 origin-top-right ${isProfileOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
                  }`}>
                  <div className="px-4 py-3 border-b border-black/5 mb-2">
                    <p className="text-sm text-[#1A1A1A] font-medium">{user?.firstName} {user?.lastName}</p>
                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                  </div>

                  <Link to="/profile" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-crown-gold transition-colors">
                    <User size={16} />
                    My Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors mt-2 border-t border-black/5 pt-3"
                  >
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <Link
                to="/login"
                className="px-6 py-2 text-xs font-bold tracking-widest uppercase
             bg-black text-white hover:bg-crown-gold transition-colors"
              >
                Sign In
              </Link>

            )}
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div className={`fixed inset-0 bg-crown-black/95 z-40 transition-transform duration-500 lg:hidden ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}>
        <div className="flex flex-col items-center justify-center h-full gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className="text-2xl font-display text-white hover:text-crown-gold transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {link.name}
            </Link>
          ))}
          <div className="flex gap-8 mt-8">
            <Link to="/wishlist" onClick={() => setIsMobileMenuOpen(false)} className="text-white hover:text-crown-gold relative">
              <Heart size={28} />
              {wishlistItems.length > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-crown-gold text-crown-black text-xs rounded-full flex items-center justify-center font-bold">
                  {wishlistItems.length}
                </span>
              )}
            </Link>
            <Link to="/cart" onClick={() => setIsMobileMenuOpen(false)} className="text-white hover:text-crown-gold relative">
              <ShoppingBag size={28} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-crown-gold text-crown-black text-xs rounded-full flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};
