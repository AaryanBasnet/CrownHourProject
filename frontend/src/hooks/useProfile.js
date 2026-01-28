import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';
import { sanitizeObject, containsMaliciousContent } from '../utils/sanitize';

export const useProfile = () => {
    const { user, refreshUser } = useAuthStore();
    const { addToast } = useToast();
    const [loading, setLoading] = useState(false);

    // Profile Data State
    const [profileData, setProfileData] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        address: {
            street: '',
            city: '',
            state: '',
            postalCode: '',
            country: '',
        },
    });

    // Password Data State
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    // Orders State
    const [orders, setOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(false);
    const [orderStats, setOrderStats] = useState({ count: 0 });

    const fetchOrders = async () => {
        if (!user) return;
        setOrdersLoading(true);
        try {
            const response = await api.get('/orders?limit=10&page=1');
            setOrders(response.data.data.orders);
            setOrderStats({ count: response.data.data.total });
        } catch (error) {
            console.error('Failed to fetch orders', error);
        } finally {
            setOrdersLoading(false);
        }
    };

    // Initialize/Update form data and fetch orders when user changes
    useEffect(() => {
        if (user) {
            setProfileData({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                phone: user.phone || '',
                address: {
                    street: user.address?.street || '',
                    city: user.address?.city || '',
                    state: user.address?.state || '',
                    postalCode: user.address?.postalCode || '',
                    country: user.address?.country || '',
                },
            });
            fetchOrders();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        if (name.startsWith('address.')) {
            const field = name.split('.')[1];
            setProfileData(prev => ({
                ...prev,
                address: { ...prev.address, [field]: value },
            }));
        } else {
            setProfileData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({ ...prev, [name]: value }));
    };

    const updateProfile = async (e) => {
        e.preventDefault();

        // Security check: Detect if user is attempting to enter scripts
        // This provides better UX than just failing with a 'required' error if tags are stripped
        const checkMalicious = (obj) => {
            for (const value of Object.values(obj)) {
                if (typeof value === 'object' && value !== null) {
                    if (checkMalicious(value)) return true;
                } else if (typeof value === 'string') {
                    if (containsMaliciousContent(value)) return true;
                }
            }
            return false;
        };

        if (checkMalicious(profileData)) {
            addToast('Security Warning: Potentially unsafe content detected and removed.', 'warning');
        }

        setLoading(true);
        try {
            const cleanData = sanitizeObject(profileData);
            await api.put(`/users/${user.id}`, cleanData);
            await refreshUser();
            addToast('Profile updated successfully', 'success');
        } catch (error) {
            console.error(error);
            addToast(error.response?.data?.message || 'Failed to update profile', 'error');
        } finally {
            setLoading(false);
        }
    };

    const changePassword = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            addToast('New passwords do not match', 'error');
            return;
        }
        if (passwordData.newPassword.length < 8) {
            addToast('Password must be at least 8 characters', 'error');
            return;
        }

        setLoading(true);
        try {
            await api.post('/auth/change-password', {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword,
            });
            addToast('Password changed successfully', 'success');
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            console.error(error);
            addToast(error.response?.data?.message || 'Failed to change password', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleAvatarUpdate = () => {
        refreshUser();
        addToast('Profile picture updated', 'success');
    };

    return {
        user,
        loading,
        profileData,
        passwordData,
        handleProfileChange,
        handlePasswordChange,
        updateProfile,
        changePassword,
        handleAvatarUpdate,
        orders,
        ordersLoading,
        orderStats,
    };
};
