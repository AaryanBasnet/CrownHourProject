const cloudinary = require('cloudinary').v2;

/**
 * Cloudinary Configuration
 * 
 * Security:
 * - API credentials stored in environment variables
 * - Signed uploads enforced for security
 * - Upload presets configured for restricted access
 */

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true, // Always use HTTPS
});

/**
 * Generate a signed upload signature
 * This allows the frontend to upload directly to Cloudinary
 * while keeping the API secret secure on the backend
 * 
 * @param {Object} params - Upload parameters to sign
 * @param {string} params.folder - Target folder for upload
 * @param {number} params.timestamp - Unix timestamp
 * @param {string} [params.public_id] - Optional public ID for the uploaded asset
 * @returns {Object} Signature and upload parameters
 */
const generateUploadSignature = (params) => {
    const timestamp = params.timestamp || Math.round(new Date().getTime() / 1000);

    const allowedFormats = params.allowed_formats || ['jpg', 'png', 'jpeg', 'webp'];

    // Security: Transformation to strip metadata (prevent EXIF injection) and limit dimensions (prevent pixel bombs)
    const eagerTransform = 'w_400,h_400,c_fill,fl_strip_profile|w_800,h_800,c_fill,fl_strip_profile';

    const paramsToSign = {
        timestamp,
        folder: params.folder || 'crown-hour/general',
        eager: eagerTransform,
        allowed_formats: Array.isArray(allowedFormats) ? allowedFormats.join(',') : allowedFormats,
        // Security: Apply incoming transformation to prevent pixel bombs (e.g., very large images)
        transformation: 'c_limit,w_5000,h_5000',
    };

    // Security: Bind signature to a specific public_id if provided (Prevents signature reuse for flooding)
    if (params.public_id) {
        paramsToSign.public_id = params.public_id;
    }

    const signature = cloudinary.utils.api_sign_request(
        paramsToSign,
        process.env.CLOUDINARY_API_SECRET
    );

    return {
        signature,
        timestamp: paramsToSign.timestamp,
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        apiKey: process.env.CLOUDINARY_API_KEY,
        folder: paramsToSign.folder,
        eager: paramsToSign.eager,
        allowedFormats: paramsToSign.allowed_formats,
        publicId: params.public_id,
        resourceType: 'image',
        transformation: paramsToSign.transformation,
    };
};

/**
 * Delete an image from Cloudinary
 * 
 * @param {string} publicId - The public ID of the image to delete
 * @returns {Promise} Cloudinary deletion result
 */
const deleteImage = async (publicId) => {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        return result;
    } catch (error) {
        console.error('Cloudinary deletion error:', error);
        throw error;
    }
};

/**
 * Extract public ID from Cloudinary URL
 * 
 * @param {string} url - Cloudinary image URL
 * @returns {string} Public ID
 */
const extractPublicId = (url) => {
    if (!url || !url.includes('cloudinary.com')) {
        return null;
    }

    // Extract the public_id from URL like:
    // https://res.cloudinary.com/cloud_name/image/upload/v123456/folder/filename.jpg
    const matches = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[a-z]+)?$/i);
    return matches ? matches[1] : null;
};

module.exports = {
    cloudinary,
    generateUploadSignature,
    deleteImage,
    extractPublicId,
};
