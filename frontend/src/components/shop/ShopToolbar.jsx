import PropTypes from 'prop-types';

/**
 * ShopToolbar Component - Light Theme
 */
export const ShopToolbar = ({ totalResults, currentSort, onSortChange }) => {
    const sortOptions = [
        { value: '-createdAt', label: 'Newest Arrivals' },
        { value: 'price', label: 'Price: Low to High' },
        { value: '-price', label: 'Price: High to Low' },
        { value: '-rating.average', label: 'Highest Rated' },
        { value: 'name', label: 'Name: A-Z' },
    ];

    return (
        <div className="flex justify-between items-center mb-8 pb-4 border-b border-black/5">
            <span className="text-sm text-[#6B6B6B]">
                Showing <span className="text-[#1A1A1A] font-medium">{totalResults}</span> results
            </span>

            <div className="flex items-center gap-3">
                <span className="text-xs text-[#6B6B6B] uppercase tracking-wider">Sort by:</span>
                <select
                    value={currentSort}
                    onChange={(e) => onSortChange(e.target.value)}
                    className="bg-transparent border border-black/10 text-[#1A1A1A] text-sm px-4 py-2 cursor-pointer focus:outline-none focus:border-[#C9A962] transition-colors"
                >
                    {sortOptions.map((option) => (
                        <option key={option.value} value={option.value} className="bg-white">
                            {option.label}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
};

ShopToolbar.propTypes = {
    totalResults: PropTypes.number.isRequired,
    currentSort: PropTypes.string.isRequired,
    onSortChange: PropTypes.func.isRequired,
};
