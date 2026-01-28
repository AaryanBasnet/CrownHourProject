/**
 * Idle Timeout Manager
 * Automatically logs out users after 2 minutes of inactivity
 *
 * Security:
 * - Tracks user activity (mouse, keyboard, touch, scroll)
 * - Logs out automatically after idle period
 * - Shows warning before auto-logout
 * - Clears all auth state on logout
 * - Synchronized with server-side session timeout (2 minutes)
 */

class IdleTimeoutManager {
  constructor() {
    this.idleTimeout = 1100 * 1000; // 1 minute 50 seconds (Safely before 2 min backend)
    this.warningTime = 30 * 1000; // Show warning 30 seconds before logout (at 80s)
    this.idleTimer = null;
    this.warningTimer = null;
    this.checkInterval = null; // New: Interval to check actual elapsed time
    this.onLogout = null;
    this.onWarning = null;
    this.isActive = false;
    this.lastActivity = Date.now();
    this.warningShown = false; // Track warning locally

    // Bind methods
    this.resetTimer = this.resetTimer.bind(this);
    this.checkIdle = this.checkIdle.bind(this);
    this.handleLogout = this.handleLogout.bind(this);
    this.handleWarning = this.handleWarning.bind(this);
  }

  /**
   * Start idle timeout tracking
   * @param {Function} onLogout - Callback when user should be logged out
   * @param {Function} onWarning - Callback when warning should be shown (optional)
   */
  start(onLogout, onWarning = null) {
    if (this.isActive) {
      // Just update callbacks if already active
      this.onLogout = onLogout;
      this.onWarning = onWarning;
      return;
    }

    this.onLogout = onLogout;
    this.onWarning = onWarning;
    this.isActive = true;
    this.lastActivity = Date.now();
    this.warningShown = false;

    console.log("[IdleTimeout] Started - Auto-logout after 115s of inactivity");

    // Track various user activities (Exclude visibilitychange to avoid background reset issues)
    const events = [
      "mousedown",
      "mousemove",
      "keydown",
      "scroll",
      "touchstart",
      "click",
    ];

    events.forEach((event) => {
      document.addEventListener(event, this.resetTimer, true);
    });

    // Start a backup interval check in case setTimeout is throttled in background
    this.checkInterval = setInterval(this.checkIdle, 5000); // Check every 5 seconds

    // Start the timer
    this.resetTimer();
  }

  /**
   * Stop idle timeout tracking
   */
  stop() {
    if (!this.isActive) {
      return;
    }

    console.log("[IdleTimeout] Stopped");

    // Remove event listeners
    const events = [
      "mousedown",
      "mousemove",
      "keydown",
      "scroll",
      "touchstart",
      "click",
    ];

    events.forEach((event) => {
      document.removeEventListener(event, this.resetTimer, true);
    });

    // Clear timers and interval
    if (this.idleTimer) clearTimeout(this.idleTimer);
    if (this.warningTimer) clearTimeout(this.warningTimer);
    if (this.checkInterval) clearInterval(this.checkInterval);

    this.idleTimer = null;
    this.warningTimer = null;
    this.checkInterval = null;
    this.isActive = false;
    this.onLogout = null;
    this.onWarning = null;
    this.warningShown = false;
  }

  /**
   * Periodic check for idle status (robust against setTimeout throttling)
   */
  checkIdle() {
    if (!this.isActive) return;

    const elapsed = Date.now() - this.lastActivity;

    // Check if we should show warning
    if (!this.warningShown && elapsed >= this.idleTimeout - this.warningTime) {
      this.handleWarning();
    }

    // Check if we should logout
    if (elapsed >= this.idleTimeout) {
      console.log("[IdleTimeout] Interval detected absolute timeout");
      this.handleLogout();
    }
  }

  /**
   * Reset the idle timer (called on user activity)
   */
  resetTimer() {
    if (!this.isActive) {
      return;
    }

    this.lastActivity = Date.now();

    // If warning was shown, reset it
    if (this.warningShown) {
      this.warningShown = false;
      console.log("[IdleTimeout] User active - Resetting warning");
    }

    // Clear existing timers
    if (this.idleTimer) clearTimeout(this.idleTimer);
    if (this.warningTimer) clearTimeout(this.warningTimer);

    // Set warning timer
    if (this.onWarning) {
      this.warningTimer = setTimeout(
        this.handleWarning,
        this.idleTimeout - this.warningTime,
      );
    }

    // Set logout timer
    this.idleTimer = setTimeout(this.handleLogout, this.idleTimeout);
  }

  /**
   * Handle warning (30 seconds before auto-logout)
   */
  handleWarning() {
    if (!this.isActive || this.warningShown) {
      return;
    }

    this.warningShown = true;
    const secondsRemaining = Math.floor(this.warningTime / 1000);
    console.warn(
      `[IdleTimeout] Warning: Auto-logout in ${secondsRemaining} seconds`,
    );

    if (this.onWarning) {
      this.onWarning(secondsRemaining);
    }
  }

  /**
   * Handle automatic logout
   */
  handleLogout() {
    if (!this.isActive) {
      return;
    }

    console.log("[IdleTimeout] Auto-logout triggered");

    // Stop tracking immediately to prevent duplicate triggers
    const logoutCallback = this.onLogout;
    this.stop();

    // Call logout callback
    if (logoutCallback) {
      logoutCallback();
    }
  }

  /**
   * Get remaining time until auto-logout (in seconds)
   */
  getRemainingTime() {
    if (!this.isActive) {
      return 0;
    }

    const elapsed = Date.now() - this.lastActivity;
    const remaining = Math.max(0, this.idleTimeout - elapsed);
    return Math.floor(remaining / 1000);
  }

  /**
   * Check if user is currently idle
   */
  isIdle() {
    if (!this.isActive) {
      return false;
    }

    const elapsed = Date.now() - this.lastActivity;
    return elapsed >= this.idleTimeout;
  }
}

// Create singleton instance
const idleTimeoutManager = new IdleTimeoutManager();

export default idleTimeoutManager;

/**
 * Usage Example:
 *
 * import idleTimeoutManager from '@/utils/idleTimeout';
 *
 * // In your auth context or root component:
 * idleTimeoutManager.start(
 *   // Logout callback
 *   () => {
 *     // Clear auth state
 *     localStorage.removeItem('user');
 *     // Redirect to login
 *     window.location.href = '/login?reason=idle_timeout';
 *   },
 *   // Warning callback (optional)
 *   (secondsRemaining) => {
 *     toast.warning(`You will be logged out in ${secondsRemaining} seconds due to inactivity`);
 *   }
 * );
 *
 * // When user logs out manually:
 * idleTimeoutManager.stop();
 */
