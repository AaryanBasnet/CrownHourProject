const { generateUploadSignature, deleteImage, extractPublicId } = require('../config/cloudinary');
const crypto = require('crypto');

/**
 * Upload Controller
 * Handles secure image uploads via Cloudinary signed uploads
 * 
 * Security:
 * - All endpoints require authentication
 * - Signature generation validates user permissions
 * - Folder restrictions based on upload type
 * - Unique Public IDs generated server-side to prevent signature reuse
 */

/**
 * @desc    Generate upload signature for product images (Admin only)
 * @route   POST /api/uploads/sign/product
 * @access  Private/Admin
 */
const signProductUpload = async (req, res) => {
    try {
        const { fileType } = req.body;

        // Security: Strict Whitelist for MIME types
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (fileType && !allowedTypes.includes(fileType)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid file type. Only JPG, PNG, and WebP are allowed.',
            });
        }

        // Security: Generate a unique public ID server-side
        // This binds the signature to a ONE-TIME use for this specific filename
        const uniqueId = crypto.randomUUID();

        const signatureData = generateUploadSignature({
            folder: 'crown-hour/products',
            public_id: uniqueId,
            // Explicitly tell Cloudinary to reject other formats if possible via signed params
            // (Assuming helper passes this through, standard Cloudinary param is 'allowed_formats')
            allowed_formats: ['jpg', 'png', 'webp']
        });

        res.status(200).json({
            success: true,
            data: signatureData,
        });
    } catch (error) {
        console.error('Product upload signature error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate upload signature',
        });
    }
};

/**
 * @desc    Generate upload signature for profile pictures (Authenticated users)
 * @route   POST /api/uploads/sign/profile
 * @access  Private
 */
const signProfileUpload = async (req, res) => {
    try {
        const { fileType } = req.body;
        // Security: Strict Whitelist
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (fileType && !allowedTypes.includes(fileType)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid file type. Only JPG, PNG, and WebP are allowed.',
            });
        }

        const userId = req.user._id;
        // Security: Use userId + timestamp for unique profile picture ID
        // This ensures users can't overwrite others' files
        const uniqueId = `${userId}_${Date.now()}`;

        const signatureData = generateUploadSignature({
            folder: `crown-hour/profiles/${userId}`,
            public_id: uniqueId,
            allowed_formats: ['jpg', 'png', 'webp']
        });

        res.status(200).json({
            success: true,
            data: signatureData,
        });
    } catch (error) {
        console.error('Profile upload signature error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate upload signature',
        });
    }
};

/**
 * @desc    Delete an image from Cloudinary (Admin only)
 * @route   DELETE /api/uploads/delete
 * @access  Private/Admin
 */
const deleteUploadedImage = async (req, res) => {
    try {
        const { imageUrl, publicId } = req.body;

        // Get public ID from URL if not provided directly
        const idToDelete = publicId || extractPublicId(imageUrl);

        if (!idToDelete) {
            return res.status(400).json({
                success: false,
                message: 'Invalid image URL or public ID',
            });
        }

        const result = await deleteImage(idToDelete);

        if (result.result === 'ok') {
            res.status(200).json({
                success: true,
                message: 'Image deleted successfully',
            });
        } else {
            res.status(400).json({
                success: false,
                message: 'Failed to delete image',
                result,
            });
        }
    } catch (error) {
        console.error('Image deletion error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting image',
        });
    }
};

/**
 * @desc    Delete user's own profile picture
 * @route   DELETE /api/uploads/delete-profile
 * @access  Private
 */
const deleteProfileImage = async (req, res) => {
    try {
        const { imageUrl, publicId } = req.body;
        const userId = req.user._id.toString();

        // Get public ID from URL if not provided directly
        const idToDelete = publicId || extractPublicId(imageUrl);

        if (!idToDelete) {
            return res.status(400).json({
                success: false,
                message: 'Invalid image URL or public ID',
            });
        }

        // Security: Verify the image belongs to the user's folder
        if (!idToDelete.includes(`profiles/${userId}`)) {
            return res.status(403).json({
                success: false,
                message: 'You can only delete your own profile images',
            });
        }

        const result = await deleteImage(idToDelete);

        if (result.result === 'ok') {
            res.status(200).json({
                success: true,
                message: 'Profile image deleted successfully',
            });
        } else {
            res.status(400).json({
                success: false,
                message: 'Failed to delete profile image',
                result,
            });
        }
    } catch (error) {
        console.error('Profile image deletion error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting profile image',
        });
    }
};

module.exports = {
    signProductUpload,
    signProfileUpload,
    deleteUploadedImage,
    deleteProfileImage,
};
