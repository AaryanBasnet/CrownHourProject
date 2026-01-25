import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

/**
 * RelatedProducts Component
 * Displays related products grid
 */
export const RelatedProducts = ({ products }) => {
    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(price);
    };

    return (
        <section className="max-w-[1400px] mx-auto px-4 py-16 border-t border-black/5">
            <h2 className="font-display text-3xl lg:text-4xl text-center text-[#1A1A1A] mb-12">
                Complete Your Collection
            </h2>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8">
                {products.map((product) => {
                    const primaryImage = product.images?.find(img => img.isPrimary) || product.images?.[0];

                    return (
                        <Link
                            key={product._id}
                            to={`/product/${product.slug}`}
                            className="group bg-white p-6 text-center border border-transparent hover:border-[#C9A962] transition-all hover:-translate-y-2"
                        >
                            <img
                                src={primaryImage?.url || 'https://via.placeholder.com/300'}
                                alt={product.name}
                                className="w-full h-48 object-contain mb-4"
                            />
                            <h3 className="font-display text-lg lg:text-xl text-[#1A1A1A] mb-2 group-hover:text-[#C9A962] transition-colors">
                                {product.name}
                            </h3>
                            <p className="text-[#6B6B6B]">
                                {formatPrice(product.price)}
                            </p>
                        </Link>
                    );
                })}
            </div>
        </section>
    );
};

RelatedProducts.propTypes = {
    products: PropTypes.arrayOf(PropTypes.shape({
        _id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        slug: PropTypes.string.isRequired,
        price: PropTypes.number.isRequired,
        images: PropTypes.array,
    })).isRequired,
};
