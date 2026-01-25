import { useState, useEffect, useRef } from 'react';
import { genderProductService } from '@services';

/**
 * useGenderProducts Hook
 * Handles gender-specific product fetching with race condition prevention
 * 
 * @param {string} gender - 'men' or 'women'
 * @param {object} filters - Filter parameters
 * @param {number} limit - Items per page
 * @returns {object} Products, pagination, loading state, error
 */
export const useGenderProducts = (gender, filters, limit = 12) => {
    const [products, setProducts] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, limit, total: 0, pages: 1 });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Track the latest request to prevent race conditions
    const latestRequestId = useRef(0);

    useEffect(() => {
        const fetchProducts = async () => {
            // Increment request ID for this fetch
            const requestId = ++latestRequestId.current;

            setIsLoading(true);
            setError(null);

            try {
                const params = {
                    page: filters.page,
                    limit,
                    sort: filters.sort,
                };

                // Add filters
                if (filters.movement) {
                    params.movement = filters.movement;
                }
                if (filters.strapMaterial) {
                    params.strapMaterial = filters.strapMaterial;
                }
                if (filters.search) {
                    params.search = filters.search;
                }

                // Call appropriate service based on gender
                const response = gender === 'men'
                    ? await genderProductService.getMensProducts(params)
                    : await genderProductService.getWomensProducts(params);

                // Only update state if this is still the latest request
                if (requestId === latestRequestId.current) {
                    setProducts(response.data.products);
                    setPagination(response.data.pagination);
                }
            } catch (err) {
                // Only set error if this is still the latest request
                if (requestId === latestRequestId.current) {
                    console.error(`Failed to fetch ${gender}'s products:`, err);
                    setError(err.response?.data?.message || `Failed to load ${gender}'s products`);
                }
            } finally {
                // Only update loading if this is still the latest request
                if (requestId === latestRequestId.current) {
                    setIsLoading(false);
                }
            }
        };

        fetchProducts();
    }, [gender, filters, limit]);

    return { products, pagination, isLoading, error };
};
