import { useState, useEffect, useRef, useCallback } from 'react';
import { reviewService } from '@services';

/**
 * useReviews Hook
 * Handles review fetching with pagination
 * 
 * @param {string} productId - Product ID
 * @returns {object} Reviews data, pagination, loading, error, refetch
 */
export const useReviews = (productId) => {
    const [reviews, setReviews] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
    const [ratingDistribution, setRatingDistribution] = useState({ 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const latestRequestId = useRef(0);

    const fetchReviews = useCallback(async (page = 1) => {
        if (!productId) return;

        const requestId = ++latestRequestId.current;
        setIsLoading(true);
        setError(null);

        try {
            const response = await reviewService.getProductReviews(productId, {
                page,
                limit: pagination.limit,
                sort: '-createdAt',
            });

            if (requestId === latestRequestId.current) {
                setReviews(response.data.reviews);
                setPagination(response.data.pagination);
                setRatingDistribution(response.data.ratingDistribution);
            }
        } catch (err) {
            if (requestId === latestRequestId.current) {
                console.error('Failed to fetch reviews:', err);
                setError(err.response?.data?.message || 'Failed to load reviews');
            }
        } finally {
            if (requestId === latestRequestId.current) {
                setIsLoading(false);
            }
        }
    }, [productId, pagination.limit]);

    useEffect(() => {
        fetchReviews(1);
    }, [fetchReviews]);

    const changePage = (page) => {
        fetchReviews(page);
    };

    const refetch = () => {
        fetchReviews(pagination.page);
    };

    return {
        reviews,
        pagination,
        ratingDistribution,
        isLoading,
        error,
        changePage,
        refetch,
    };
};
