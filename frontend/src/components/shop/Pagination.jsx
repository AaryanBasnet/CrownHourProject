import PropTypes from 'prop-types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Pagination Component - Light Theme
 */
export const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;

    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 5;

        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            if (currentPage <= 3) {
                for (let i = 1; i <= 4; i++) pages.push(i);
                pages.push('...');
                pages.push(totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(1);
                pages.push('...');
                for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
            } else {
                pages.push(1);
                pages.push('...');
                for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
                pages.push('...');
                pages.push(totalPages);
            }
        }

        return pages;
    };

    return (
        <div className="flex items-center justify-center gap-2 mt-12">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="w-10 h-10 border border-black/10 text-[#1A1A1A] flex items-center justify-center hover:border-[#C9A962] hover:text-[#C9A962] transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-black/10 disabled:hover:text-[#1A1A1A]"
                aria-label="Previous page"
            >
                <ChevronLeft size={18} />
            </button>

            {getPageNumbers().map((page, index) => (
                page === '...' ? (
                    <span key={`ellipsis-${index}`} className="w-10 h-10 flex items-center justify-center text-[#6B6B6B]">
                        ...
                    </span>
                ) : (
                    <button
                        key={page}
                        onClick={() => onPageChange(page)}
                        className={`w-10 h-10 border flex items-center justify-center transition-all ${currentPage === page
                                ? 'bg-[#1A1A1A] border-[#1A1A1A] text-white font-bold'
                                : 'border-black/10 text-[#1A1A1A] hover:border-[#C9A962] hover:text-[#C9A962]'
                            }`}
                    >
                        {page}
                    </button>
                )
            ))}

            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="w-10 h-10 border border-black/10 text-[#1A1A1A] flex items-center justify-center hover:border-[#C9A962] hover:text-[#C9A962] transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-black/10 disabled:hover:text-[#1A1A1A]"
                aria-label="Next page"
            >
                <ChevronRight size={18} />
            </button>
        </div>
    );
};

Pagination.propTypes = {
    currentPage: PropTypes.number.isRequired,
    totalPages: PropTypes.number.isRequired,
    onPageChange: PropTypes.func.isRequired,
};
