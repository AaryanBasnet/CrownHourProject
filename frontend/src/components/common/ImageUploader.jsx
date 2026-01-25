import { useState, useRef } from 'react';
import { Upload, X, Loader2, Image as ImageIcon, AlertCircle } from 'lucide-react';

/**
 * ImageUploader Component
 * Reusable image upload component with drag & drop support
 * 
 * @param {Object} props
 * @param {Function} props.onUpload - Called when upload completes with { url, publicId }
 * @param {string} props.currentImage - Current image URL to display
 * @param {Function} props.uploadFunction - The upload function to call (uploadProfilePicture or uploadProductImage)
 * @param {string} props.aspectRatio - CSS aspect ratio (e.g., "1/1", "16/9")
 * @param {string} props.className - Additional CSS classes
 * @param {number} props.maxSizeMB - Maximum file size in MB
 * @param {boolean} props.disabled - Disable the uploader
 */
const ImageUploader = ({
    onUpload,
    currentImage,
    uploadFunction,
    aspectRatio = '1/1',
    className = '',
    maxSizeMB = 5,
    disabled = false,
}) => {
    const [preview, setPreview] = useState(currentImage || null);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);

    const validateFile = (file) => {
        // Check file type
        const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            setError('Please upload a JPG, PNG, or WebP image');
            return false;
        }

        // Check file size
        const maxBytes = maxSizeMB * 1024 * 1024;
        if (file.size > maxBytes) {
            setError(`File size must be less than ${maxSizeMB}MB`);
            return false;
        }

        return true;
    };

    const handleFileSelect = async (file) => {
        if (!file || !validateFile(file)) return;

        setError(null);

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result);
        };
        reader.readAsDataURL(file);

        // Upload file
        setUploading(true);
        setProgress(0);

        try {
            const result = await uploadFunction(file, setProgress);
            onUpload(result);
        } catch (err) {
            console.error('Upload error:', err);
            setError(err.message || 'Upload failed. Please try again.');
            setPreview(currentImage); // Revert to original
        } finally {
            setUploading(false);
            setProgress(0);
        }
    };

    const handleInputChange = (e) => {
        const file = e.target.files?.[0];
        if (file) handleFileSelect(file);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        if (!disabled) setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        if (disabled) return;

        const file = e.dataTransfer.files?.[0];
        if (file) handleFileSelect(file);
    };

    const handleRemove = () => {
        setPreview(null);
        setError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        onUpload(null);
    };

    const handleClick = () => {
        if (!disabled && !uploading) {
            fileInputRef.current?.click();
        }
    };

    return (
        <div className={`image-uploader ${className}`}>
            <div
                className={`
          relative rounded-xl border-2 border-dashed transition-all duration-200 cursor-pointer
          ${isDragging ? 'border-amber-500 bg-amber-50' : 'border-stone-300 hover:border-amber-400'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${error ? 'border-red-400 bg-red-50' : ''}
        `}
                style={{ aspectRatio }}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={handleClick}
            >
                {/* Hidden file input */}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleInputChange}
                    disabled={disabled || uploading}
                />

                {/* Preview image */}
                {preview && !uploading && (
                    <>
                        <img
                            src={preview}
                            alt="Preview"
                            className="absolute inset-0 w-full h-full object-cover rounded-lg"
                        />
                        {!disabled && (
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemove();
                                }}
                                className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </>
                )}

                {/* Upload state */}
                {uploading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 rounded-lg">
                        <Loader2 className="w-8 h-8 text-amber-500 animate-spin mb-2" />
                        <span className="text-sm text-stone-600">Uploading... {progress}%</span>
                        <div className="w-32 h-2 bg-stone-200 rounded-full mt-2 overflow-hidden">
                            <div
                                className="h-full bg-amber-500 transition-all duration-200"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                )}

                {/* Empty state */}
                {!preview && !uploading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-stone-400">
                        {error ? (
                            <>
                                <AlertCircle className="w-8 h-8 text-red-400 mb-2" />
                                <span className="text-sm text-red-500 text-center px-4">{error}</span>
                            </>
                        ) : (
                            <>
                                <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mb-2">
                                    {isDragging ? (
                                        <Upload className="w-6 h-6 text-amber-500" />
                                    ) : (
                                        <ImageIcon className="w-6 h-6 text-amber-500" />
                                    )}
                                </div>
                                <span className="text-sm font-medium text-stone-600">
                                    {isDragging ? 'Drop image here' : 'Click or drag to upload'}
                                </span>
                                <span className="text-xs text-stone-400 mt-1">
                                    JPG, PNG, WebP (max {maxSizeMB}MB)
                                </span>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ImageUploader;
