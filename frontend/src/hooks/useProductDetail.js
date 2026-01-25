import { useState, useEffect } from 'react';
import { productService } from '@services';

/**
 * useProductDetail Hook
 * Fetches product details by slug
 * 
 * @param {string} slug - Product slug
 * @returns {object} Product data, loading state, error
 */
export const useProductDetail = (slug) => {
    const [product, setProduct] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProduct = async () => {
            if (!slug) return;

            setIsLoading(true);
            setError(null);

            try {
                const response = await productService.getProductBySlug(slug);
                setProduct(response.data.product);
            } catch (err) {
                console.error('Failed to fetch product:', err);
                setError(err.response?.data?.message || 'Failed to load product');
            } finally {
                setIsLoading(false);
            }
        };

        fetchProduct();
    }, [slug]);

    return { product, isLoading, error };
};
