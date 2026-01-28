/**
 * useIdleTimeout Hook
 * Integrates idle timeout manager with React application
 * Automatically logs out users after 2 minutes of inactivity
 */

import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@store/authStore';
import { useToast } from '../context/ToastContext';
import idleTimeoutManager from '@utils/idleTimeout';

export const useIdleTimeout = () => {
  const { isLoggedIn, logout } = useAuthStore();
  const { addToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Only start idle timeout if user is logged in
    if (!isLoggedIn) {
      idleTimeoutManager.stop();
      return;
    }

    console.log('[useIdleTimeout] Starting idle timeout tracking');

    // Handle automatic logout
    const handleAutoLogout = async () => {
      console.log('[useIdleTimeout] EXECUTING Auto-logout');

      // Clear auth state immediately
      await logout();

      // Show logout notification
      addToast(
        'Security Alert: You have been logged out due to inactivity.',
        'warning',
        10000
      );

      // Redirect to login with reason
      console.log('[useIdleTimeout] Redirecting to login...');
      navigate('/login?reason=idle_timeout', { replace: true });
    };

    // Handle warning (30 seconds before logout)
    const handleWarning = (secondsRemaining) => {
      console.log(`[useIdleTimeout] EXECUTING Warning: ${secondsRemaining}s remaining`);

      addToast(
        `Security Alert: You will be logged out in ${secondsRemaining} seconds due to inactivity. Move your mouse to stay logged in.`,
        'warning',
        28000
      );
    };

    // Start the idle timeout manager
    idleTimeoutManager.start(handleAutoLogout, handleWarning);

    // Cleanup on unmount or logout
    return () => {
      console.log('[useIdleTimeout] Effect Cleanup - Stopping tracking');
      idleTimeoutManager.stop();
    };
  }, [isLoggedIn, logout, navigate, addToast]);

  return {
    isActive: idleTimeoutManager.isActive,
    getRemainingTime: () => idleTimeoutManager.getRemainingTime(),
  };
};
