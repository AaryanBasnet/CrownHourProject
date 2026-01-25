import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productService } from '@services';
import { ShopFilters, ShopToolbar, ProductCard, Pagination, SearchBar } from '@components/shop';
import { useProducts } from '@hooks/useProducts';
import { useToast } from '../context/ToastContext';
import { Loader2, SlidersHorizontal, X } from 'lucide-react';
import { useCartStore } from '@store/cartStore';
import { useWishlistStore } from '@store/wishlistStore';

/**
 * Shop Page - Light Theme
 * 
 * Fixed Issues:
 * 1. ✅ Race condition prevention with request ID tracking
 * 2. ✅ Non-destructive URL updates (merge instead of replace)
 * 3. ✅ Debounced search (500ms auto-search)
 * 4. ✅ Mobile filter drawer
 * 5. ✅ Scroll to product grid (not top of page)
 * 6. ✅ Separate SearchBar component
 */
export const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToast } = useToast();
  const productGridRef = useRef(null);

  // Stores
  const { addToCart } = useCartStore();
  const { toggleWishlist } = useWishlistStore();

  // State
  const [filterOptions, setFilterOptions] = useState(null);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Get filters from URL
  const getFiltersFromURL = () => ({
    category: searchParams.getAll('category'),
    movement: searchParams.getAll('movement'),
    strapMaterial: searchParams.getAll('strapMaterial'),
    sort: searchParams.get('sort') || '-createdAt',
    page: parseInt(searchParams.get('page')) || 1,
    search: searchParams.get('search') || '',
  });

  const [filters, setFilters] = useState(getFiltersFromURL());

  // Use custom hook for products (with race condition prevention)
  const { products, pagination, isLoading, error } = useProducts(filters);

  // Non-destructive URL update - merges with existing params
  const updateURL = useCallback((newFilters) => {
    const params = new URLSearchParams(searchParams);

    // Remove old filter params
    params.delete('category');
    params.delete('movement');
    params.delete('strapMaterial');
    params.delete('sort');
    params.delete('page');
    params.delete('search');

    // Add new filter params
    Object.entries(newFilters).forEach(([key, value]) => {
      if (Array.isArray(value) && value.length > 0) {
        value.forEach(v => params.append(key, v));
      } else if (value && !Array.isArray(value)) {
        params.set(key, value);
      }
    });

    setSearchParams(params, { replace: true }); // Use replace to avoid cluttering history
  }, [searchParams, setSearchParams]);

  // Fetch filter options on mount
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const response = await productService.getFilterOptions();
        setFilterOptions(response.data);
      } catch (err) {
        console.error('Failed to fetch filter options:', err);
        addToast('Failed to load filters', 'error');
      }
    };

    fetchFilterOptions();
  }, [addToast]);

  // Handle filter change
  const handleFilterChange = useCallback((filterType, values) => {
    const newFilters = {
      ...filters,
      [filterType]: values,
      page: 1, // Reset to page 1
    };
    setFilters(newFilters);
    updateURL(newFilters);
    setIsMobileFilterOpen(false); // Close mobile filter on selection
  }, [filters, updateURL]);

  // Handle sort change
  const handleSortChange = useCallback((sortValue) => {
    const newFilters = {
      ...filters,
      sort: sortValue,
      page: 1,
    };
    setFilters(newFilters);
    updateURL(newFilters);
  }, [filters, updateURL]);

  // Handle page change
  const handlePageChange = useCallback((page) => {
    const newFilters = {
      ...filters,
      page,
    };
    setFilters(newFilters);
    updateURL(newFilters);

    // Scroll to product grid, not top of page
    if (productGridRef.current) {
      productGridRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [filters, updateURL]);

  // Handle search (debounced in SearchBar component)
  const handleSearch = useCallback((searchValue) => {
    const newFilters = {
      ...filters,
      search: searchValue,
      page: 1,
    };
    setFilters(newFilters);
    updateURL(newFilters);
  }, [filters, updateURL]);

  // Handle add to cart
  const handleAddToCart = useCallback(async (product) => {
    const success = await addToCart(product, 1);
    if (success) {
      addToast(`${product.name} added to cart`, 'success');
    } else {
      addToast('Failed to add to cart', 'error');
    }
  }, [addToast, addToCart]);

  // Handle add to wishlist
  const handleAddToWishlist = useCallback(async (product) => {
    await toggleWishlist(product);
    addToast(`${product.name} wishlist updated`, 'success');
  }, [addToast, toggleWishlist]);

  // Clear all filters
  const handleClearFilters = useCallback(() => {
    const newFilters = { sort: '-createdAt', page: 1 };
    setFilters(newFilters);
    updateURL(newFilters);
  }, [updateURL]);

  if (isLoading && products.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF8F5]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#C9A962] animate-spin mx-auto mb-4" />
          <p className="text-[#6B6B6B] tracking-widest text-sm uppercase">Loading Collection...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      {/* Header */}
      <section className="pt-32 pb-12 px-6 text-center bg-[#F5F2ED] border-b border-black/5">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center gap-2 text-xs text-[#6B6B6B] uppercase tracking-[0.2em] mb-4">
            <span>Home</span>
            <span>/</span>
            <span className="text-[#C9A962]">Collection</span>
          </div>
          <h1 className="font-display text-5xl md:text-6xl text-[#1A1A1A] mb-4">
            The Collection
          </h1>
          <p className="text-[#6B6B6B] max-w-2xl mx-auto text-lg mb-8">
            Explore our complete range of Swiss-engineered timepieces. From the depths of the ocean to the boardroom, define your legacy.
          </p>

          {/* Search Bar Component */}
          <SearchBar
            initialValue={filters.search}
            onSearch={handleSearch}
            placeholder="Search watches by name, brand, or model..."
          />
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-12">
          {/* Desktop Filters Sidebar */}
          <div className="hidden lg:block">
            {filterOptions && (
              <ShopFilters
                filters={filters}
                onFilterChange={handleFilterChange}
                filterOptions={filterOptions}
              />
            )}
          </div>

          {/* Mobile Filter Button */}
          <div className="lg:hidden fixed bottom-6 right-6 z-50">
            <button
              onClick={() => setIsMobileFilterOpen(true)}
              className="px-6 py-4 bg-[#1A1A1A] text-white rounded-full shadow-2xl flex items-center gap-2 hover:bg-[#C9A962] transition-colors"
            >
              <SlidersHorizontal size={20} />
              <span className="font-medium">Filters</span>
            </button>
          </div>

          {/* Mobile Filter Drawer */}
          {isMobileFilterOpen && (
            <div className="lg:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setIsMobileFilterOpen(false)}>
              <div
                className="absolute right-0 top-0 h-full w-80 max-w-[85vw] bg-white shadow-2xl overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="sticky top-0 bg-white border-b border-black/5 p-4 flex items-center justify-between">
                  <h2 className="font-display text-2xl text-[#1A1A1A]">Filters</h2>
                  <button
                    onClick={() => setIsMobileFilterOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded"
                  >
                    <X size={24} />
                  </button>
                </div>
                <div className="p-6">
                  {filterOptions && (
                    <ShopFilters
                      filters={filters}
                      onFilterChange={handleFilterChange}
                      filterOptions={filterOptions}
                    />
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Products Grid */}
          <div>
            <ShopToolbar
              totalResults={pagination.total}
              currentSort={filters.sort}
              onSortChange={handleSortChange}
            />

            {/* Product Grid Reference Point for Scroll */}
            <div ref={productGridRef} className="scroll-mt-32">
              {/* Loading Overlay */}
              {isLoading && products.length > 0 && (
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center rounded">
                    <Loader2 className="w-8 h-8 text-[#C9A962] animate-spin" />
                  </div>
                </div>
              )}

              {/* Error State */}
              {error && (
                <div className="text-center py-12 bg-red-50 border border-red-200 rounded mb-6">
                  <p className="text-red-600">{error}</p>
                </div>
              )}

              {/* Products Grid */}
              {products.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {products.map((product) => (
                      <ProductCard
                        key={product._id}
                        product={product}
                        onAddToCart={handleAddToCart}
                        onAddToWishlist={handleAddToWishlist}
                      />
                    ))}
                  </div>

                  {/* Pagination */}
                  <Pagination
                    currentPage={pagination.page}
                    totalPages={pagination.pages}
                    onPageChange={handlePageChange}
                  />
                </>
              ) : (
                <div className="text-center py-20">
                  <p className="text-[#6B6B6B] text-lg mb-4">No products found matching your criteria.</p>
                  <button
                    onClick={handleClearFilters}
                    className="px-6 py-3 border border-[#C9A962] text-[#C9A962] hover:bg-[#C9A962] hover:text-white transition-colors"
                  >
                    Clear All Filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
