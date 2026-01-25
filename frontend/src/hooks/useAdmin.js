import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as adminService from '../services/adminService';

/**
 * Admin Hooks using TanStack Query
 * Provides data fetching, caching, and mutation capabilities
 * 
 * Features:
 * - Automatic caching and background refetching
 * - Optimistic updates
 * - Error handling
 * - Loading states
 */

// Dashboard
export const useDashboardStats = () => {
    return useQuery({
        queryKey: ['admin', 'dashboard', 'stats'],
        queryFn: adminService.getDashboardStats,
        staleTime: 1000 * 60 * 5, // 5 minutes
        refetchInterval: 1000 * 60 * 5, // Auto-refetch every 5 minutes
    });
};

// Users Management
export const useUsers = (params) => {
    return useQuery({
        queryKey: ['admin', 'users', params],
        queryFn: () => adminService.getUsers(params),
        keepPreviousData: true,
    });
};

export const useUser = (userId) => {
    return useQuery({
        queryKey: ['admin', 'users', userId],
        queryFn: () => adminService.getUserById(userId),
        enabled: !!userId,
    });
};

export const useUpdateUserStatus = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ userId, isActive }) =>
            adminService.updateUserStatus(userId, isActive),
        onSuccess: (data, variables) => {
            // Invalidate and refetch users list
            queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
            // Update specific user cache
            queryClient.setQueryData(['admin', 'users', variables.userId], (old) => ({
                ...old,
                user: { ...old?.user, isActive: variables.isActive },
            }));
        },
    });
};

export const useDeleteUser = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: adminService.deleteUser,
        onSuccess: () => {
            // Invalidate users list to refetch
            queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
        },
    });
};

// Orders Management
export const useOrders = (params) => {
    return useQuery({
        queryKey: ['admin', 'orders', params],
        queryFn: () => adminService.getOrders(params),
        keepPreviousData: true,
    });
};

export const useOrder = (orderId) => {
    return useQuery({
        queryKey: ['admin', 'orders', orderId],
        queryFn: () => adminService.getOrderById(orderId),
        enabled: !!orderId,
    });
};

export const useUpdateOrderStatus = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ orderId, ...data }) =>
            adminService.updateOrderStatus(orderId, data),
        onSuccess: (data, variables) => {
            // Invalidate orders list
            queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] });
            // Update specific order cache
            queryClient.invalidateQueries({ queryKey: ['admin', 'orders', variables.orderId] });
            // Also invalidate dashboard stats
            queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard', 'stats'] });
        },
    });
};

// Products Management
export const useProducts = (params) => {
    return useQuery({
        queryKey: ['admin', 'products', params],
        queryFn: () => adminService.getProducts(params),
        keepPreviousData: true,
    });
};

export const useDeleteProduct = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: adminService.deleteProduct,
        onSuccess: () => {
            // Invalidate products list
            queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
            // Invalidate dashboard stats as well
            queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard', 'stats'] });
        },
    });
};

// Reviews Management
export const useReviews = (params) => {
    return useQuery({
        queryKey: ['admin', 'reviews', params],
        queryFn: () => adminService.getReviews(params),
        keepPreviousData: true,
    });
};

export const useUpdateReviewStatus = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ reviewId, isApproved }) =>
            adminService.updateReviewStatus(reviewId, isApproved),
        onSuccess: () => {
            // Invalidate reviews list
            queryClient.invalidateQueries({ queryKey: ['admin', 'reviews'] });
        },
    });
};

export const useDeleteReview = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: adminService.deleteReview,
        onSuccess: () => {
            // Invalidate reviews list
            queryClient.invalidateQueries({ queryKey: ['admin', 'reviews'] });
        },
    });
};

// Audit Logs
export const useAuditLogs = (params) => {
    return useQuery({
        queryKey: ['admin', 'audit-logs', params],
        queryFn: () => adminService.getAuditLogs(params),
        keepPreviousData: true,
    });
};
