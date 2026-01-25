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
 * Example usage:
 * 
 * // For rich text content
 * <div dangerouslySetInnerHTML={{ __html: sanitizeHTML(content) }} />
 * 
 * // For user reviews
 * <div dangerouslySetInnerHTML={{ __html: sanitizeUserContent(review) }} />
 * 
 * // For plain text extraction
 * const text = sanitizeText(htmlString);
 */
