const { doubleCsrf } = require("csrf-csrf");

/**
 * CSRF Protection Configuration
 * Using Double Submit Cookie pattern tied to Session ID
 */

const {
    invalidCsrfTokenError,
    generateCsrfToken,
    validateRequest,
    doubleCsrfProtection,
} = doubleCsrf({
    getSecret: () => process.env.CSRF_SECRET, // Must be set in .env
    cookieName: "psid_csrf",
    cookieOptions: {
        sameSite: "strict", // ✅ Maximum CSRF protection (OAuth uses token exchange)
        secure: process.env.NODE_ENV === "production",
        signed: false,
        httpOnly: true,
    },
    size: 64,
    ignoredMethods: ["GET", "HEAD", "OPTIONS"],
    getSessionIdentifier: (req) => {
        // Use session ID if available, fallback to a consistent identifier
        return req.sessionID || (req.session && req.session.id) || "anonymous";
    },
});

module.exports = {
    invalidCsrfTokenError,
    generateCsrfToken,
    validateRequest,
    doubleCsrfProtection,
};
