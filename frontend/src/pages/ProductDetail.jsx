import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProductDetail, useReviews } from '@hooks';
import { productService } from '@services';
import { useToast } from '../context/ToastContext';
import { useAuthStore } from '@store/authStore';
import { useCartStore } from '@store/cartStore';
import { useWishlistStore } from '@store/wishlistStore';
import { ProductGallery } from '@components/product/ProductGallery';
import { ProductInfo } from '@components/product/ProductInfo';
import { ProductAccordion } from '@components/product/ProductAccordion';
import { ReviewSection } from '@components/product/ReviewSection';
import { RelatedProducts } from '@components/product/RelatedProducts';
import { Loader2 } from 'lucide-react';

/**
 * Product Detail Page
 * SEO-friendly with slug-based routing
 * 
 * Architecture:
 * - Separate components for each section
 * - Custom hooks for data fetching
 * - DOMPurify ready for user-generated content
 * 
 * Security:
 * - XSS protection on reviews
 * - Authenticated review submission
 * - Rate limiting on API
 */
export const ProductDetail = () => {
    const { slug } = useParams();
    const { addToast } = useToast();
    const { isLoggedIn } = useAuthStore();
    const { addToCart } = useCartStore();
    const { toggleWishlist, isInWishlist } = useWishlistStore();

    // Fetch product data
    const { product, isLoading: productLoading, error: productError } = useProductDetail(slug);

    // Fetch reviews (only when product is loaded)
    const {
        reviews,
        pagination: reviewPagination,
        ratingDistribution,
        isLoading: reviewsLoading,
        changePage: changeReviewPage,
        refetch: refetchReviews,
    } = useReviews(product?._id);

    // Related products
    const [relatedProducts, setRelatedProducts] = useState([]);

    // Selected variants
    const [selectedColor, setSelectedColor] = useState(null);
    const [selectedStrap, setSelectedStrap] = useState(null);

    // Fetch related products
    useEffect(() => {
        const fetchRelated = async () => {
            if (!product?._id) return;
            try {
                const response = await productService.getRelatedProducts(product._id, 4);
                setRelatedProducts(response.data.products);
            } catch (err) {
                console.error('Failed to fetch related products:', err);
            }
        };
        fetchRelated();
    }, [product?._id]);

    // Set default selections
    useEffect(() => {
        if (product?.variants?.colors?.length > 0) {
            setSelectedColor(product.variants.colors[0]);
        }
        if (product?.variants?.straps?.length > 0) {
            setSelectedStrap(product.variants.straps[0]);
        }
    }, [product]);

    // Add to cart handler
    const handleAddToCart = async () => {
        if (!product) return;

        const success = await addToCart(product, 1, {
            color: selectedColor,
            strap: selectedStrap
        });

        if (success) {
            addToast(`${product.name} added to bag`, 'success');
        } else {
            addToast('Failed to add to bag', 'error');
        }
    };

    // Add to wishlist handler
    const handleAddToWishlist = async () => {
        if (!product) return;
        await toggleWishlist(product);

        const isNowIn = isInWishlist(product._id);
        addToast(
            `${product.name} ${!isNowIn ? 'removed from' : 'added to'} wishlist`,
            'success'
        );
    };

    if (productLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#FAF8F5]">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-[#C9A962] animate-spin mx-auto mb-4" />
                    <p className="text-[#6B6B6B] tracking-widest text-sm uppercase">Loading Product...</p>
                </div>
            </div>
        );
    }

    if (productError || !product) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#FAF8F5]">
                <div className="text-center">
                    <p className="text-red-500 text-lg mb-4">{productError || 'Product not found'}</p>
                    <Link
                        to="/shop"
                        className="px-6 py-3 bg-[#1A1A1A] text-white hover:bg-[#C9A962] transition-colors"
                    >
                        Back to Shop
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FAF8F5]">
            {/* Main Product Section */}
            <div className="max-w-[1400px] mx-auto px-4 py-16 pt-28">
                <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-12 lg:gap-20">
                    {/* Left: Gallery */}
                    <ProductGallery images={product.images} productName={product.name} />

                    {/* Right: Product Info (Sticky) */}
                    <div className="lg:sticky lg:top-28 lg:h-fit">
                        <ProductInfo
                            product={product}
                            selectedColor={selectedColor}
                            selectedStrap={selectedStrap}
                            onColorChange={setSelectedColor}
                            onStrapChange={setSelectedStrap}
                            onAddToCart={handleAddToCart}
                            onAddToWishlist={handleAddToWishlist}
                        />

                        {/* Accordion */}
                        <ProductAccordion specifications={product.specifications} />
                    </div>
                </div>
            </div>

            {/* Reviews Section */}
            <ReviewSection
                productId={product._id}
                reviews={reviews}
                pagination={reviewPagination}
                ratingDistribution={ratingDistribution}
                averageRating={product.rating?.average || 0}
                totalReviews={product.rating?.count || 0}
                isLoading={reviewsLoading}
                isLoggedIn={isLoggedIn}
                onPageChange={changeReviewPage}
                onReviewSubmitted={refetchReviews}
            />

            {/* Related Products */}
            {relatedProducts.length > 0 && (
                <RelatedProducts products={relatedProducts} />
            )}
        </div>
    );
};
