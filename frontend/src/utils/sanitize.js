import DOMPurify from 'dompurify';

/**
 * Sanitization Utility
 * Uses DOMPurify to sanitize HTML content
 * 
 * When to use:
 * - Rendering user-generated HTML (reviews, comments)
 * - Rich text editor content
 * - External HTML sources
 * 
 * When NOT needed:
 * - Plain text (React escapes automatically)
 * - Data from trusted backend
 * - No dangerouslySetInnerHTML usage
 */

/**
 * Sanitize HTML string
 * @param {string} dirty - Potentially unsafe HTML
 * @param {object} config - DOMPurify configuration
 * @returns {string} Sanitized HTML safe for rendering
 */
export const sanitizeHTML = (dirty, config = {}) => {
    const defaultConfig = {
        ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li'],
        ALLOWED_ATTR: ['href', 'target', 'rel'],
        ALLOW_DATA_ATTR: false,
        ...config,
    };

    return DOMPurify.sanitize(dirty, defaultConfig);
};

/**
 * Sanitize for plain text (strips all HTML)
 * @param {string} dirty - HTML string
 * @returns {string} Plain text only
 */
export const sanitizeText = (dirty) => {
    return DOMPurify.sanitize(dirty, { ALLOWED_TAGS: [] });
};

/**
 * Sanitize user input for display
 * More restrictive - for user comments, reviews, etc.
 * @param {string} dirty - User input
 * @returns {string} Sanitized content
 */
export const sanitizeUserContent = (dirty) => {
    return DOMPurify.sanitize(dirty, {
        ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
        ALLOWED_ATTR: [],
        KEEP_CONTENT: true,
    });
};

/**
 * Sanitize a single value
 * If string, strips all HTML by default.
 * @param {any} value - Value to sanitize
 * @returns {any} Sanitized value
 */
export const sanitizeValue = (value) => {
    if (typeof value !== 'string') return value;
    return DOMPurify.sanitize(value, { ALLOWED_TAGS: [] });
};

/**
 * Checks if a string contains potentially malicious HTML/Scripts
 * @param {string} dirty 
 * @returns {boolean} True if malicious content was found and stripped
 */
export const containsMaliciousContent = (dirty) => {
    if (typeof dirty !== 'string') return false;
    const clean = DOMPurify.sanitize(dirty, { ALLOWED_TAGS: [] });
    // If the string contains tags and they are being changed/stripped, it's potentially malicious
    return dirty.includes('<') && dirty !== clean;
};

/**
 * Sanitize an entire object (recursively)
 * Useful for sanitizing form data before submission
 * @param {object} obj - Object to sanitize
 * @returns {object} New object with sanitized strings
 */
export const sanitizeObject = (obj) => {
    if (obj === null || typeof obj !== 'object') {
        return sanitizeValue(obj);
    }

    if (Array.isArray(obj)) {
        return obj.map(item => sanitizeObject(item));
    }

    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
        sanitized[key] = sanitizeObject(value);
    }
    return sanitized;
};

/**
 * Example usage:
 * 
 * // For rich text content
 * <div dangerouslySetInnerHTML={{ __html: sanitizeHTML(content) }} />
 * 
 * // For user reviews
 * <div dangerouslySetInnerHTML={{ __html: sanitizeUserContent(review) }} />
 * 
 * // Before submitting a form
 * const cleanData = sanitizeObject(formData);
 * await api.post('/endpoint', cleanData);
 */
