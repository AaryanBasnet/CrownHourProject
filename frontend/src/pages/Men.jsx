import { useState, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ShopFilters, ShopToolbar, ProductCard, Pagination, SearchBar } from '@components/shop';
import { useGenderProducts } from '@hooks';
import { useToast } from '../context/ToastContext';
import { useCartStore } from '@store/cartStore';
import { useWishlistStore } from '@store/wishlistStore';
import { Loader2, SlidersHorizontal, X } from 'lucide-react';

/**
 * Men's Collection Page
 * 
 * Architecture:
 * - Uses useGenderProducts hook (race condition prevention)
 * - Separate SearchBar component (debounced)
 * - Reuses Shop components (DRY principle)
 * - Non-destructive URL updates
 * 
 * Security:
 * - XSS protection via React escaping
 * - Backend filtering
 * - Rate limiting
 */
export const Men = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const { addToast } = useToast();
    const { addToCart } = useCartStore();
    const { toggleWishlist } = useWishlistStore();
    const productGridRef = useRef(null);

    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

    // Get filters from URL
    const getFiltersFromURL = () => ({
        movement: searchParams.get('movement') || '',
        strapMaterial: searchParams.get('strapMaterial') || '',
        sort: searchParams.get('sort') || '-createdAt',
        page: parseInt(searchParams.get('page')) || 1,
        search: searchParams.get('search') || '',
    });

    const [filters, setFilters] = useState(getFiltersFromURL());

    // Use custom hook for gender-specific products
    const { products, pagination, isLoading, error } = useGenderProducts('men', filters);

    // Non-destructive URL update
    const updateURL = useCallback((newFilters) => {
        const params = new URLSearchParams(searchParams);

        params.delete('movement');
        params.delete('strapMaterial');
        params.delete('sort');
        params.delete('page');
        params.delete('search');

        Object.entries(newFilters).forEach(([key, value]) => {
            if (value) {
                params.set(key, value);
            }
        });

        setSearchParams(params, { replace: true });
    }, [searchParams, setSearchParams]);

    const handleFilterChange = useCallback((filterType, value) => {
        const newFilters = {
            ...filters,
            [filterType]: value,
            page: 1,
        };
        setFilters(newFilters);
        updateURL(newFilters);
        setIsMobileFilterOpen(false);
    }, [filters, updateURL]);

    const handleSortChange = useCallback((sortValue) => {
        const newFilters = {
            ...filters,
            sort: sortValue,
            page: 1,
        };
        setFilters(newFilters);
        updateURL(newFilters);
    }, [filters, updateURL]);

    const handlePageChange = useCallback((page) => {
        const newFilters = {
            ...filters,
            page,
        };
        setFilters(newFilters);
        updateURL(newFilters);

        if (productGridRef.current) {
            productGridRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [filters, updateURL]);

    const handleSearch = useCallback((searchValue) => {
        const newFilters = {
            ...filters,
            search: searchValue,
            page: 1,
        };
        setFilters(newFilters);
        updateURL(newFilters);
    }, [filters, updateURL]);

    const handleAddToCart = useCallback(async (product) => {
        console.log('Men: Adding to cart:', product._id, product.name);

        // Get default variants if product has them
        const defaultColor = product.variants?.colors?.find(c => c.inStock) || product.variants?.colors?.[0];
        const defaultStrap = product.variants?.straps?.find(s => s.inStock) || product.variants?.straps?.[0];

        const success = await addToCart(product, 1, {
            color: defaultColor,
            strap: defaultStrap
        });

        if (success) {
            addToast(`${product.name} added to cart`, 'success');
        } else {
            addToast('Failed to add to cart', 'error');
        }
    }, [addToCart, addToast]);

    const handleAddToWishlist = useCallback(async (product) => {
        await toggleWishlist(product);
        addToast(`${product.name} wishlist updated`, 'success');
    }, [toggleWishlist, addToast]);

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
                    <p className="text-[#6B6B6B] tracking-widest text-sm uppercase">Loading Men's Collection...</p>
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
                        <span className="text-[#C9A962]">Men</span>
                    </div>
                    <h1 className="font-display text-5xl md:text-6xl text-[#1A1A1A] mb-4">
                        Men's Collection
                    </h1>
                    <p className="text-[#6B6B6B] max-w-2xl mx-auto text-lg mb-8">
                        Precision-engineered timepieces for the modern gentleman. Bold designs that command attention and respect.
                    </p>

                    <SearchBar
                        initialValue={filters.search}
                        onSearch={handleSearch}
                        placeholder="Search men's watches..."
                    />
                </div>
            </section>

            {/* Main Content */}
            <section className="max-w-7xl mx-auto px-6 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-12">
                    {/* Desktop Filters */}
                    <div className="hidden lg:block">
                        <aside className="sticky top-32 h-fit">
                            {/* Simplified filters for gender pages */}
                            <div className="mb-8 pb-6 border-b border-black/5">
                                <h3 className="font-display text-xl text-[#1A1A1A] mb-4">Movement</h3>
                                <select
                                    value={filters.movement}
                                    onChange={(e) => handleFilterChange('movement', e.target.value)}
                                    className="w-full px-4 py-2 border border-black/10 bg-white text-[#1A1A1A] focus:outline-none focus:border-[#C9A962]"
                                >
                                    <option value="">All Movements</option>
                                    <option value="automatic">Automatic</option>
                                    <option value="mechanical">Mechanical</option>
                                    <option value="quartz">Quartz</option>
                                </select>
                            </div>

                            <div className="mb-8 pb-6 border-b border-black/5">
                                <h3 className="font-display text-xl text-[#1A1A1A] mb-4">Strap Material</h3>
                                <select
                                    value={filters.strapMaterial}
                                    onChange={(e) => handleFilterChange('strapMaterial', e.target.value)}
                                    className="w-full px-4 py-2 border border-black/10 bg-white text-[#1A1A1A] focus:outline-none focus:border-[#C9A962]"
                                >
                                    <option value="">All Materials</option>
                                    <option value="Leather">Leather</option>
                                    <option value="Steel Bracelet">Steel Bracelet</option>
                                    <option value="Rubber">Rubber</option>
                                </select>
                            </div>
                        </aside>
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
                                className="absolute right-0 top-0 h-full w-80 max-w-[85vw] bg-white shadow-2xl overflow-y-auto p-6"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="font-display text-2xl text-[#1A1A1A]">Filters</h2>
                                    <button onClick={() => setIsMobileFilterOpen(false)} className="p-2">
                                        <X size={24} />
                                    </button>
                                </div>

                                <div className="mb-6">
                                    <h3 className="font-display text-xl text-[#1A1A1A] mb-4">Movement</h3>
                                    <select
                                        value={filters.movement}
                                        onChange={(e) => handleFilterChange('movement', e.target.value)}
                                        className="w-full px-4 py-2 border border-black/10 bg-white"
                                    >
                                        <option value="">All Movements</option>
                                        <option value="automatic">Automatic</option>
                                        <option value="mechanical">Mechanical</option>
                                        <option value="quartz">Quartz</option>
                                    </select>
                                </div>

                                <div className="mb-6">
                                    <h3 className="font-display text-xl text-[#1A1A1A] mb-4">Strap Material</h3>
                                    <select
                                        value={filters.strapMaterial}
                                        onChange={(e) => handleFilterChange('strapMaterial', e.target.value)}
                                        className="w-full px-4 py-2 border border-black/10 bg-white"
                                    >
                                        <option value="">All Materials</option>
                                        <option value="Leather">Leather</option>
                                        <option value="Steel Bracelet">Steel Bracelet</option>
                                        <option value="Rubber">Rubber</option>
                                    </select>
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

                        <div ref={productGridRef} className="scroll-mt-32">
                            {isLoading && products.length > 0 && (
                                <div className="relative mb-6">
                                    <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center rounded">
                                        <Loader2 className="w-8 h-8 text-[#C9A962] animate-spin" />
                                    </div>
                                </div>
                            )}

                            {error && (
                                <div className="text-center py-12 bg-red-50 border border-red-200 rounded mb-6">
                                    <p className="text-red-600">{error}</p>
                                </div>
                            )}

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
