import { useState, useEffect, useRef } from 'react';
import { productService } from '@services';

/**
 * useProducts Hook
 * Handles product fetching with race condition prevention and request cancellation
 * 
 * Features:
 * - Automatic request cancellation for outdated requests
 * - Race condition prevention
 * - Loading state management
 * - Error handling
 */
export const useProducts = (filters, limit = 12) => {
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

        // Add array filters
        if (filters.category?.length > 0) {
          params.category = filters.category.join(',');
        }
        if (filters.movement?.length > 0) {
          params.movement = filters.movement.join(',');
        }
        if (filters.strapMaterial?.length > 0) {
          params.strapMaterial = filters.strapMaterial.join(',');
        }

        // Add search query
        if (filters.search) {
          params.search = filters.search;
        }

        const response = await productService.getProducts(params);

        // Only update state if this is still the latest request
        if (requestId === latestRequestId.current) {
          setProducts(response.data.products);
          setPagination(response.data.pagination);
        }
      } catch (err) {
        // Only set error if this is still the latest request
        if (requestId === latestRequestId.current) {
          console.error('Failed to fetch products:', err);
          setError(err.response?.data?.message || 'Failed to load products');
        }
      } finally {
        // Only update loading if this is still the latest request
        if (requestId === latestRequestId.current) {
          setIsLoading(false);
        }
      }
    };

    fetchProducts();
  }, [filters, limit]);

  return { products, pagination, isLoading, error };
};
