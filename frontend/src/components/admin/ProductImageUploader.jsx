import { useState } from 'react';
import { Plus, X, Star, Loader2, AlertCircle } from 'lucide-react';
import { uploadProductImage, deleteProductImage } from '../../services/uploadService';

/**
 * ProductImageUploader Component
 * Allows uploading multiple product images with primary selection
 * 
 * @param {Object} props
 * @param {Array} props.images - Current images array [{ url, alt, isPrimary }]
 * @param {Function} props.onChange - Called when images change
 * @param {number} props.maxImages - Maximum number of images (default: 5)
 */
const ProductImageUploader = ({
    images = [],
    onChange,
    maxImages = 5,
}) => {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState(null);

    const handleFileSelect = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate
        const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            setError('Please upload a JPG, PNG, or WebP image');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setError('File size must be less than 5MB');
            return;
        }

        if (images.length >= maxImages) {
            setError(`Maximum ${maxImages} images allowed`);
            return;
        }

        setError(null);
        setUploading(true);
        setProgress(0);

        try {
            const result = await uploadProductImage(file, setProgress);

            const newImage = {
                url: result.url,
                publicId: result.publicId,
                alt: '',
                isPrimary: images.length === 0, // First image is primary by default
            };

            onChange([...images, newImage]);
        } catch (err) {
            console.error('Upload error:', err);
            setError(err.message || 'Upload failed');
        } finally {
            setUploading(false);
            setProgress(0);
            e.target.value = ''; // Reset input
        }
    };

    const handleRemove = async (index) => {
        const imageToRemove = images[index];

        // Try to delete from Cloudinary
        if (imageToRemove.publicId) {
            try {
                await deleteProductImage({ publicId: imageToRemove.publicId });
            } catch (err) {
                console.error('Failed to delete from Cloudinary:', err);
                // Continue anyway to remove from local state
            }
        }

        const newImages = images.filter((_, i) => i !== index);

        // If we removed the primary image, make the first remaining image primary
        if (imageToRemove.isPrimary && newImages.length > 0) {
            newImages[0].isPrimary = true;
        }

        onChange(newImages);
    };

    const handleSetPrimary = (index) => {
        const newImages = images.map((img, i) => ({
            ...img,
            isPrimary: i === index,
        }));
        onChange(newImages);
    };

    const handleAltChange = (index, alt) => {
        const newImages = [...images];
        newImages[index] = { ...newImages[index], alt };
        onChange(newImages);
    };

    return (
        <div className="product-image-uploader">
            {/* Error message */}
            {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-600">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm">{error}</span>
                    <button
                        onClick={() => setError(null)}
                        className="ml-auto p-1 hover:bg-red-100 rounded"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Image grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {/* Existing images */}
                {images.map((image, index) => (
                    <div
                        key={image.url || index}
                        className={`
              relative aspect-square rounded-xl border-2 overflow-hidden group
              ${image.isPrimary ? 'ring-2 ring-amber-500 border-amber-500' : 'border-stone-200'}
            `}
                    >
                        <img
                            src={image.url}
                            alt={image.alt || `Product image ${index + 1}`}
                            className="w-full h-full object-cover"
                        />

                        {/* Primary badge */}
                        {image.isPrimary && (
                            <div className="absolute top-2 left-2 px-2 py-1 bg-amber-500 text-white text-xs font-medium rounded-full flex items-center gap-1">
                                <Star className="w-3 h-3" />
                                Primary
                            </div>
                        )}

                        {/* Hover overlay */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                            {/* Set as primary button */}
                            {!image.isPrimary && (
                                <button
                                    type="button"
                                    onClick={() => handleSetPrimary(index)}
                                    className="px-3 py-1.5 bg-amber-500 text-white text-xs font-medium rounded-lg hover:bg-amber-600 transition-colors flex items-center gap-1"
                                >
                                    <Star className="w-3 h-3" />
                                    Set Primary
                                </button>
                            )}

                            {/* Remove button */}
                            <button
                                type="button"
                                onClick={() => handleRemove(index)}
                                className="px-3 py-1.5 bg-red-500 text-white text-xs font-medium rounded-lg hover:bg-red-600 transition-colors flex items-center gap-1"
                            >
                                <X className="w-3 h-3" />
                                Remove
                            </button>
                        </div>

                        {/* Alt text input */}
                        <input
                            type="text"
                            placeholder="Alt text..."
                            value={image.alt || ''}
                            onChange={(e) => handleAltChange(index, e.target.value)}
                            className="absolute bottom-0 left-0 right-0 p-2 bg-white/90 text-xs border-t border-stone-200 focus:outline-none focus:bg-white"
                        />
                    </div>
                ))}

                {/* Add new image button */}
                {images.length < maxImages && (
                    <label className={`
            aspect-square rounded-xl border-2 border-dashed border-stone-300 
            flex flex-col items-center justify-center cursor-pointer
            hover:border-amber-500 hover:bg-amber-50 transition-colors
            ${uploading ? 'pointer-events-none opacity-50' : ''}
          `}>
                        <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            className="hidden"
                            onChange={handleFileSelect}
                            disabled={uploading}
                        />

                        {uploading ? (
                            <div className="text-center">
                                <Loader2 className="w-8 h-8 text-amber-500 animate-spin mx-auto mb-2" />
                                <span className="text-xs text-stone-500">{progress}%</span>
                            </div>
                        ) : (
                            <>
                                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center mb-2">
                                    <Plus className="w-5 h-5 text-amber-600" />
                                </div>
                                <span className="text-xs text-stone-500 font-medium">Add Image</span>
                                <span className="text-xs text-stone-400">{images.length}/{maxImages}</span>
                            </>
                        )}
                    </label>
                )}
            </div>

            {/* Help text */}
            <p className="mt-3 text-xs text-stone-500">
                Upload up to {maxImages} images. Click on an image to set it as primary.
                Supported formats: JPG, PNG, WebP (max 5MB each).
            </p>
        </div>
    );
};

export default ProductImageUploader;
