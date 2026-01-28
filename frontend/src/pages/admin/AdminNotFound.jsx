import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminNotFound = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="mb-8"
            >
                <div className="w-24 h-24 bg-crown-gold/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <AlertTriangle size={48} className="text-crown-gold" />
                </div>
                <h1 className="text-4xl font-serif font-bold text-gray-900 mb-4">404</h1>
                <h2 className="text-2xl font-medium text-gray-700 mb-4">Page Not Found</h2>
                <p className="text-gray-500 max-w-md mx-auto mb-8">
                    The page you are looking for doesn't exist or has been moved.
                    Please check the URL or return to the dashboard.
                </p>
                <Link
                    to="/admin"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-crown-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                    <ArrowLeft size={20} />
                    Back to Dashboard
                </Link>
            </motion.div>
        </div>
    );
};

export default AdminNotFound;
