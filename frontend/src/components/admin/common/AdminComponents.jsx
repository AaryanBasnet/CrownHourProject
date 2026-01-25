import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Search, Filter } from 'lucide-react';

// Colors mapped to Tailwind classes where possible, or arbitrary values
// Cream: bg-[#F5F2ED]
// Champagne: bg-[#FAF8F5]
// Gold: text-[#C9A962]
// Gold Light: text-[#E8D5A3]

export const AdminPageHeader = ({ title, description, action }) => (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b-2 border-[#C9A962]/20">
        <div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-2">{title}</h1>
            <p className="text-gray-500 text-base">{description}</p>
        </div>
        {action && (
            <div>{action}</div>
        )}
    </div>
);

export const AdminCard = ({ children, className = '' }) => (
    <div className={`bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-[#C9A962]/10 overflow-hidden ${className}`}>
        {children}
    </div>
);

export const AdminSearch = ({ value, onChange, placeholder = "Search..." }) => (
    <div className="relative flex-1 min-w-[280px]">
        <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
            type="text"
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            className="w-full pl-12 pr-4 py-3.5 bg-white border border-[#C9A962]/30 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#C9A962] focus:ring-2 focus:ring-[#C9A962]/10 transition-all duration-200"
        />
    </div>
);

export const AdminFilter = ({ value, onChange, options, icon: Icon = Filter }) => (
    <div className="relative">
        <Icon size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <select
            value={value}
            onChange={onChange}
            className="appearance-none w-full pl-12 pr-10 py-3.5 bg-white border border-[#C9A962]/30 rounded-xl text-gray-900 focus:outline-none focus:border-[#C9A962] focus:ring-2 focus:ring-[#C9A962]/10 cursor-pointer transition-all duration-200 min-w-[200px]"
        >
            {options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                    {opt.label}
                </option>
            ))}
        </select>
    </div>
);

export const AdminBadge = ({ variant = 'default', children }) => {
    const variants = {
        default: 'bg-gray-100 text-gray-700',
        success: 'bg-green-100 text-green-800', // Active, Delivered, Paid
        warning: 'bg-amber-100 text-amber-800',  // Pending, Processing, Low Stock
        danger: 'bg-red-100 text-red-800',       // Inactive, Cancelled, Deleted
        primary: 'bg-blue-100 text-blue-800',    // Processing, Shipped
        gold: 'bg-[#C9A962]/10 text-[#C9A962]',  // Admin, VIP
    };

    return (
        <span className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-semibold capitalize ${variants[variant] || variants.default}`}>
            {children}
        </span>
    );
};

export const AdminButton = ({ children, variant = 'primary', onClick, to, disabled, className = '', ...props }) => {
    const baseClasses = "inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
        primary: "bg-gradient-to-br from-[#C9A962] to-[#E8D5A3] text-white hover:shadow-lg hover:-translate-y-0.5 shadow-md shadow-[#C9A962]/20",
        secondary: "bg-white border border-[#C9A962]/30 text-gray-600 hover:border-[#C9A962] hover:text-[#C9A962] hover:bg-[#FAF8F5]",
        danger: "bg-white border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300",
        text: "text-gray-500 hover:text-[#C9A962] p-2 hover:bg-[#C9A962]/5 rounded-lg",
    };

    const classes = `${baseClasses} ${variants[variant]} ${className}`;

    if (to) {
        return (
            <Link to={to} className={classes} {...props}>
                {children}
            </Link>
        );
    }

    return (
        <button onClick={onClick} disabled={disabled} className={classes} {...props}>
            {children}
        </button>
    );
}

export const Pagination = ({ page, totalPages, totalItems, onNext, onPrev }) => (
    <div className="flex flex-col sm:flex-row items-center justify-between p-6 border-t border-[#C9A962]/10 gap-4">
        <p className="text-gray-500 text-sm">
            Page <span className="font-medium text-gray-900">{page}</span> of <span className="font-medium text-gray-900">{totalPages}</span>
            <span className="hidden sm:inline"> ({totalItems} items total)</span>
        </p>
        <div className="flex gap-3">
            <button
                onClick={onPrev}
                disabled={page === 1}
                className="px-4 py-2 border border-[#C9A962]/30 rounded-lg text-gray-600 hover:border-[#C9A962] hover:text-[#C9A962] disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium bg-white"
            >
                Previous
            </button>
            <button
                onClick={onNext}
                disabled={page === totalPages}
                className="px-4 py-2 border border-[#C9A962]/30 rounded-lg text-gray-600 hover:border-[#C9A962] hover:text-[#C9A962] disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium bg-white"
            >
                Next
            </button>
        </div>
    </div>
);

export const AdminStatCard = ({ title, value, icon: Icon, trend, subtitle, color = "blue", to }) => {
    const colors = {
        blue: "bg-blue-50 text-blue-600 border-blue-100",
        purple: "bg-purple-50 text-purple-600 border-purple-100",
        green: "bg-green-50 text-green-600 border-green-100",
        gold: "bg-[#C9A962]/10 text-[#C9A962] border-[#C9A962]/20",
    };

    const Content = () => (
        <div className="p-6">
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${colors[color]}`}>
                    <Icon size={24} />
                </div>
                {trend !== undefined && (
                    <span className={`text-sm font-medium ${trend >= 0 ? 'text-green-600' : 'text-red-600'} flex items-center gap-1`}>
                        {trend > 0 ? '+' : ''}{trend}%
                    </span>
                )}
            </div>
            <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
            <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
            {subtitle && <p className="text-xs text-gray-400 mt-2">{subtitle}</p>}
        </div>
    );

    if (to) {
        return (
            <Link to={to} className="block bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-[#C9A962]/30 transition-all duration-200">
                <Content />
            </Link>
        );
    }

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
            <Content />
        </div>
    );
};
