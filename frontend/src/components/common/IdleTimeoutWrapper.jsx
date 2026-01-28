/**
 * Idle Timeout Wrapper Component
 * Wraps the app to provide automatic logout on idle
 * This component must be inside Router and ToastProvider
 */

import { useIdleTimeout } from '@hooks/useIdleTimeout';

export const IdleTimeoutWrapper = ({ children }) => {
  // This hook handles all the idle timeout logic
  useIdleTimeout();

  // Just render children - the hook does all the work
  return <>{children}</>;
};

export default IdleTimeoutWrapper;
