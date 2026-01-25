import { useState } from 'react';
import PropTypes from 'prop-types';
import { ChevronDown } from 'lucide-react';

/**
 * ShopFilters Component - Light Theme
 * Sidebar filters for product filtering
 */
export const ShopFilters = ({ filters, onFilterChange, filterOptions }) => {
    const [expandedSections, setExpandedSections] = useState({
        category: true,
        movement: true,
        strapMaterial: true,
    });

    const toggleSection = (section) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section],
        }));
    };

    const handleFilterToggle = (filterType, value) => {
        const currentValues = filters[filterType] || [];
        const newValues = currentValues.includes(value)
            ? currentValues.filter(v => v !== value)
            : [...currentValues, value];

        onFilterChange(filterType, newValues);
    };

    const isFilterActive = (filterType, value) => {
        return filters[filterType]?.includes(value) || false;
    };

    return (
        <aside className="sticky top-32 h-fit">
            {/* Category Filter */}
            <div className="mb-8 pb-6 border-b border-black/5">
                <button
                    onClick={() => toggleSection('category')}
                    className="w-full flex items-center justify-between mb-4 text-[#1A1A1A] font-display text-xl"
                >
                    Collection
                    <ChevronDown
                        size={18}
                        className={`transition-transform duration-300 ${expandedSections.category ? 'rotate-180' : ''
                            }`}
                    />
                </button>
                {expandedSections.category && (
                    <ul className="space-y-3">
                        {filterOptions?.categories?.map((category) => (
                            <li
                                key={category}
                                onClick={() => handleFilterToggle('category', category)}
                                className="flex items-center gap-3 cursor-pointer group"
                            >
                                <span
                                    className={`w-4 h-4 border flex items-center justify-center transition-all ${isFilterActive('category', category)
                                            ? 'bg-[#C9A962] border-[#C9A962]'
                                            : 'border-[#6B6B6B]/30 group-hover:border-[#C9A962]'
                                        }`}
                                >
                                    {isFilterActive('category', category) && (
                                        <span className="text-white text-xs">✓</span>
                                    )}
                                </span>
                                <span className="text-sm text-[#6B6B6B] group-hover:text-[#1A1A1A] transition-colors capitalize">
                                    {category}
                                </span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Movement Filter */}
            <div className="mb-8 pb-6 border-b border-black/5">
                <button
                    onClick={() => toggleSection('movement')}
                    className="w-full flex items-center justify-between mb-4 text-[#1A1A1A] font-display text-xl"
                >
                    Movement
                    <ChevronDown
                        size={18}
                        className={`transition-transform duration-300 ${expandedSections.movement ? 'rotate-180' : ''
                            }`}
                    />
                </button>
                {expandedSections.movement && (
                    <ul className="space-y-3">
                        {filterOptions?.movements?.map((movement) => (
                            <li
                                key={movement}
                                onClick={() => handleFilterToggle('movement', movement)}
                                className="flex items-center gap-3 cursor-pointer group"
                            >
                                <span
                                    className={`w-4 h-4 border flex items-center justify-center transition-all ${isFilterActive('movement', movement)
                                            ? 'bg-[#C9A962] border-[#C9A962]'
                                            : 'border-[#6B6B6B]/30 group-hover:border-[#C9A962]'
                                        }`}
                                >
                                    {isFilterActive('movement', movement) && (
                                        <span className="text-white text-xs">✓</span>
                                    )}
                                </span>
                                <span className="text-sm text-[#6B6B6B] group-hover:text-[#1A1A1A] transition-colors capitalize">
                                    {movement}
                                </span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Strap Material Filter */}
            <div className="mb-8 pb-6 border-b border-black/5">
                <button
                    onClick={() => toggleSection('strapMaterial')}
                    className="w-full flex items-center justify-between mb-4 text-[#1A1A1A] font-display text-xl"
                >
                    Strap Material
                    <ChevronDown
                        size={18}
                        className={`transition-transform duration-300 ${expandedSections.strapMaterial ? 'rotate-180' : ''
                            }`}
                    />
                </button>
                {expandedSections.strapMaterial && (
                    <ul className="space-y-3">
                        {filterOptions?.strapMaterials?.map((material) => (
                            <li
                                key={material}
                                onClick={() => handleFilterToggle('strapMaterial', material)}
                                className="flex items-center gap-3 cursor-pointer group"
                            >
                                <span
                                    className={`w-4 h-4 border flex items-center justify-center transition-all ${isFilterActive('strapMaterial', material)
                                            ? 'bg-[#C9A962] border-[#C9A962]'
                                            : 'border-[#6B6B6B]/30 group-hover:border-[#C9A962]'
                                        }`}
                                >
                                    {isFilterActive('strapMaterial', material) && (
                                        <span className="text-white text-xs">✓</span>
                                    )}
                                </span>
                                <span className="text-sm text-[#6B6B6B] group-hover:text-[#1A1A1A] transition-colors capitalize">
                                    {material}
                                </span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </aside>
    );
};

ShopFilters.propTypes = {
    filters: PropTypes.object.isRequired,
    onFilterChange: PropTypes.func.isRequired,
    filterOptions: PropTypes.shape({
        categories: PropTypes.arrayOf(PropTypes.string),
        movements: PropTypes.arrayOf(PropTypes.string),
        strapMaterials: PropTypes.arrayOf(PropTypes.string),
    }),
};
