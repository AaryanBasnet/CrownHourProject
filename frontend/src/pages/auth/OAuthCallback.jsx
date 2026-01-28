import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { authService } from '../../services/authService';
import { useToast } from '../../context/ToastContext';

/**
 * OAuth Callback Handler
 *
 * Security: One-Time Token Exchange Pattern
 * - Extracts one-time OAuth token from URL
 * - Exchanges token for JWT with sameSite: 'strict'
 * - Token is single-use and expires in 60 seconds
 * - Prevents token replay attacks
 */
const OAuthCallback = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { setAuth } = useAuthStore();
    const { addToast } = useToast();
    const [error, setError] = useState(null);

    useEffect(() => {
        const handleCallback = async () => {
            try {
                // Extract one-time token from URL
                const params = new URLSearchParams(location.search);
                const oauthToken = params.get('token');
                const errorParam = params.get('error');

                // Check for error in URL
                if (errorParam) {
                    console.error('[OAuth Callback] Error from backend:', errorParam);
                    setError(errorParam);
                    addToast(`OAuth failed: ${errorParam}`, 'error');
                    setTimeout(() => navigate('/login', { replace: true }), 2000);
                    return;
                }

                // Validate token exists
                if (!oauthToken) {
                    console.error('[OAuth Callback] No token in URL');
                    setError('Missing OAuth token');
                    addToast('OAuth token missing', 'error');
                    setTimeout(() => navigate('/login', { replace: true }), 2000);
                    return;
                }

                console.log('[OAuth Callback] Exchanging one-time token...');

                // Exchange one-time token for JWT with sameSite: 'strict'
                const response = await authService.exchangeOAuthToken(oauthToken);

                if (response.success && response.data?.user) {
                    console.log('[OAuth Callback] Token exchange successful');

                    // Update auth store with user data
                    setAuth(response.data.user);

                    // Success!
                    addToast('Login successful!', 'success');
                    navigate('/', { replace: true });
                } else {
                    throw new Error('Invalid response from token exchange');
                }
            } catch (err) {
                console.error('[OAuth Callback] Token exchange failed:', err);

                const errorMessage = err.response?.data?.message || 'OAuth authentication failed';
                setError(errorMessage);
                addToast(errorMessage, 'error');

                // Redirect to login after delay
                setTimeout(() => navigate('/login', { replace: true }), 2000);
            }
        };

        handleCallback();
    }, [location, navigate, setAuth, addToast]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-crown-black">
            <div className="text-center">
                {!error ? (
                    <>
                        <div className="w-16 h-16 border-4 border-crown-gold/30 border-t-crown-gold rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-crown-gray tracking-widest text-xs uppercase">Completing Login...</p>
                        <p className="text-crown-gray/50 text-xs mt-2">Exchanging secure token</p>
                    </>
                ) : (
                    <>
                        <div className="w-16 h-16 flex items-center justify-center bg-red-500/10 rounded-full mx-auto mb-4">
                            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <p className="text-red-400 tracking-widest text-xs uppercase">{error}</p>
                        <p className="text-crown-gray/50 text-xs mt-2">Redirecting to login...</p>
                    </>
                )}
            </div>
        </div>
    );
};

export default OAuthCallback;
