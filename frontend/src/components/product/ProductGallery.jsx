import { useState } from 'react';
import PropTypes from 'prop-types';

/**
 * ProductGallery Component
 * Image gallery with zoom effect and secondary images
 */
export const ProductGallery = ({ images, productName }) => {
    const [activeImage, setActiveImage] = useState(0);
    const [isZoomed, setIsZoomed] = useState(false);

    const primaryImage = images?.find(img => img.isPrimary) || images?.[0];
    const allImages = images || [];

    return (
        <div className="flex flex-col gap-6">
            {/* Main Image */}
            <div
                className="relative bg-white border border-black/5 p-8 lg:p-16 h-[500px] lg:h-[700px] flex items-center justify-center overflow-hidden cursor-zoom-in"
                onMouseEnter={() => setIsZoomed(true)}
                onMouseLeave={() => setIsZoomed(false)}
            >
                <img
                    src={allImages[activeImage]?.url || primaryImage?.url || 'https://via.placeholder.com/600'}
                    alt={allImages[activeImage]?.alt || productName}
                    className={`max-w-[90%] max-h-[90%] object-contain transition-transform duration-500 drop-shadow-xl ${isZoomed ? 'scale-110' : 'scale-100'
                        }`}
                />
            </div>

            {/* Secondary Images */}
            {allImages.length > 1 && (
                <div className="grid grid-cols-2 gap-4 lg:gap-6">
                    {allImages.slice(0, 4).map((image, index) => (
                        <button
                            key={index}
                            onClick={() => setActiveImage(index)}
                            className={`bg-white border p-6 h-[150px] lg:h-[200px] flex items-center justify-center transition-all ${activeImage === index
                                    ? 'border-[#C9A962]'
                                    : 'border-black/5 hover:border-[#C9A962]/50'
                                }`}
                        >
                            <img
                                src={image.url}
                                alt={image.alt || `${productName} view ${index + 1}`}
                                className="max-w-full max-h-full object-contain"
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

ProductGallery.propTypes = {
    images: PropTypes.arrayOf(PropTypes.shape({
        url: PropTypes.string.isRequired,
        alt: PropTypes.string,
        isPrimary: PropTypes.bool,
    })),
    productName: PropTypes.string.isRequired,
};
