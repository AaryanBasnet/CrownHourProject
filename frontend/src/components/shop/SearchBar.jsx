import { useState, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import PropTypes from 'prop-types';

/**
 * SearchBar Component
 * Separate, reusable search component with debouncing
 * 
 * Features:
 * - Auto-search with 500ms debounce
 * - Clear button
 * - XSS protection (maxLength, trimming)
 */
export const SearchBar = ({ initialValue = '', onSearch, placeholder = 'Search...' }) => {
    const [searchQuery, setSearchQuery] = useState(initialValue);
    const [debounceTimer, setDebounceTimer] = useState(null);

    const handleSearchChange = useCallback((value) => {
        setSearchQuery(value);

        // Clear existing timer
        if (debounceTimer) {
            clearTimeout(debounceTimer);
        }

        // Set new timer for auto-search (500ms debounce)
        const timer = setTimeout(() => {
            onSearch(value.trim());
        }, 500);

        setDebounceTimer(timer);
    }, [debounceTimer, onSearch]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();

        // Clear debounce timer
        if (debounceTimer) {
            clearTimeout(debounceTimer);
        }

        // Immediate search on submit
        onSearch(searchQuery.trim());
    };

    const handleClear = () => {
        setSearchQuery('');

        // Clear debounce timer
        if (debounceTimer) {
            clearTimeout(debounceTimer);
        }

        onSearch('');
    };

    return (
        <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto">
            <div className="relative">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    placeholder={placeholder}
                    className="w-full px-6 py-4 pr-24 bg-white border border-black/10 text-[#1A1A1A] placeholder:text-[#6B6B6B] focus:outline-none focus:border-[#C9A962] transition-colors"
                    maxLength={100}
                    aria-label="Search products"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-2">
                    {searchQuery && (
                        <button
                            type="button"
                            onClick={handleClear}
                            className="p-2 hover:bg-gray-100 transition-colors rounded"
                            aria-label="Clear search"
                        >
                            <X size={18} className="text-[#6B6B6B]" />
                        </button>
                    )}
                    <button
                        type="submit"
                        className="px-4 py-2 bg-[#1A1A1A] text-white hover:bg-[#C9A962] transition-colors"
                        aria-label="Search"
                    >
                        <Search size={18} />
                    </button>
                </div>
            </div>
        </form>
    );
};

SearchBar.propTypes = {
    initialValue: PropTypes.string,
    onSearch: PropTypes.func.isRequired,
    placeholder: PropTypes.string,
};
