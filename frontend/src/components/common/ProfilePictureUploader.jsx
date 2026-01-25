import { useState, useRef } from 'react';
import { Camera, Loader2, X, Check } from 'lucide-react';
import { uploadProfilePicture, updateUserProfilePicture } from '../../services/uploadService';

/**
 * ProfilePictureUploader Component
 * Circular profile picture uploader with camera icon overlay
 * 
 * @param {Object} props
 * @param {Object} props.user - User object with profilePicture field
 * @param {Function} props.onUpdate - Called when profile picture is updated
 * @param {string} props.size - Size class (sm, md, lg, xl)
 */
const ProfilePictureUploader = ({
    user,
    onUpdate,
    size = 'lg',
}) => {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const fileInputRef = useRef(null);

    const sizeClasses = {
        sm: 'w-16 h-16',
        md: 'w-24 h-24',
        lg: 'w-32 h-32',
        xl: 'w-40 h-40',
    };

    const iconSizes = {
        sm: 'w-4 h-4',
        md: 'w-5 h-5',
        lg: 'w-6 h-6',
        xl: 'w-8 h-8',
    };

    const currentImage = user?.profilePicture?.url;

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

        setError(null);
        setSuccess(false);
        setUploading(true);
        setProgress(0);

        try {
            // Upload to Cloudinary
            const uploadResult = await uploadProfilePicture(file, setProgress);

            // Update user profile in database
            await updateUserProfilePicture(user.id, {
                url: uploadResult.url,
                publicId: uploadResult.publicId,
            });

            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);

            // Call parent callback
            if (onUpdate) {
                onUpdate({
                    url: uploadResult.url,
                    publicId: uploadResult.publicId,
                });
            }
        } catch (err) {
            console.error('Profile picture upload error:', err);
            setError(err.message || 'Upload failed');
        } finally {
            setUploading(false);
            setProgress(0);
            e.target.value = '';
        }
    };

    const handleClick = () => {
        if (!uploading) {
            fileInputRef.current?.click();
        }
    };

    // Get initials for fallback
    const getInitials = () => {
        if (!user) return '?';
        const first = user.firstName?.[0] || '';
        const last = user.lastName?.[0] || '';
        return (first + last).toUpperCase() || user.email?.[0]?.toUpperCase() || '?';
    };

    return (
        <div className="profile-picture-uploader relative inline-block">
            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleFileSelect}
                disabled={uploading}
            />

            {/* Profile picture container */}
            <div
                onClick={handleClick}
                className={`
          ${sizeClasses[size]}
          rounded-full relative overflow-hidden cursor-pointer
          bg-gradient-to-br from-amber-100 to-amber-200
          border-4 border-white shadow-lg
          group transition-transform hover:scale-105
        `}
            >
                {/* Image or initials */}
                {currentImage ? (
                    <img
                        src={currentImage}
                        alt={`${user?.firstName || 'User'}'s profile`}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <span className={`font-semibold text-amber-700 ${size === 'xl' ? 'text-3xl' : size === 'lg' ? 'text-2xl' : 'text-lg'}`}>
                            {getInitials()}
                        </span>
                    </div>
                )}

                {/* Upload overlay */}
                {uploading ? (
                    <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center">
                        <Loader2 className={`${iconSizes[size]} text-white animate-spin`} />
                        <span className="text-white text-xs mt-1">{progress}%</span>
                    </div>
                ) : (
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Camera className={`${iconSizes[size]} text-white`} />
                    </div>
                )}

                {/* Success indicator */}
                {success && (
                    <div className="absolute inset-0 bg-green-500/80 flex items-center justify-center">
                        <Check className={`${iconSizes[size]} text-white`} />
                    </div>
                )}
            </div>

            {/* Camera badge */}
            <div
                onClick={handleClick}
                className={`
          absolute bottom-0 right-0 
          ${size === 'sm' ? 'w-6 h-6' : size === 'md' ? 'w-8 h-8' : 'w-10 h-10'}
          bg-amber-500 rounded-full flex items-center justify-center
          border-2 border-white shadow-md cursor-pointer
          hover:bg-amber-600 transition-colors
        `}
            >
                <Camera className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} color="white" />
            </div>

            {/* Error message */}
            {error && (
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                    <div className="bg-red-500 text-white text-xs px-3 py-1 rounded-full flex items-center gap-1">
                        <X className="w-3 h-3" />
                        {error}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfilePictureUploader;
