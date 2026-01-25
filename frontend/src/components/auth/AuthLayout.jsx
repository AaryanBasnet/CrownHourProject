import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const AuthLayout = ({ children, title, subtitle, visualSide = 'right' }) => {
    return (
        <div className="min-h-screen flex bg-stone-50">
            {/* Visual Section - Shown on Left if visualSide is 'left' */}
            {visualSide === 'left' && <VisualSection />}

            {/* Form Section */}
            <motion.div
                initial={{ opacity: 0, x: visualSide === 'left' ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-20 xl:px-24 relative z-10 bg-white"
            >
                <div className="max-w-md w-full mx-auto space-y-8 py-12">
                    {/* Header */}
                    <div className="text-center lg:text-left">
                        <Link to="/" className="inline-block mb-8 lg:hidden">
                            <span className="font-display text-2xl font-bold tracking-widest text-crown-black">CROWNHOUR</span>
                        </Link>
                        <h2 className="font-display text-4xl md:text-5xl font-medium text-crown-black mb-3">
                            {title}
                        </h2>
                        <p className="text-gray-500 text-lg font-light">
                            {subtitle}
                        </p>
                    </div>

                    {children}
                </div>
            </motion.div>

            {/* Visual Section - Shown on Right if visualSide is 'right' */}
            {visualSide === 'right' && <VisualSection />}
        </div>
    );
};

const VisualSection = () => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="hidden lg:flex relative flex-1 items-center justify-center bg-crown-black overflow-hidden"
    >
        {/* Clean, Premium Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black" />

        {/* Subtle Animated Gold Accents */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-amber-600/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        {/* Decorative Elements */}
        <div className="absolute w-[600px] h-[600px] border border-white/5 rounded-full animate-spin-slow" />
        <div className="absolute w-[450px] h-[450px] border border-white/10 rounded-full animate-reverse-spin" />

        <div className="text-center relative z-10 max-w-lg px-8">
            <Link to="/" className="inline-block mb-12">
                <span className="font-display text-4xl font-bold tracking-widest text-white border-b-2 border-amber-600 pb-2">CROWNHOUR</span>
            </Link>
            <blockquote className="font-display text-3xl md:text-4xl text-gray-200 leading-tight italic mb-8">
                "Time is the most valuable thing a man can spend."
            </blockquote>
            <cite className="text-amber-600 not-italic tracking-widest text-sm uppercase font-medium">
                — Theophrastus
            </cite>
        </div>
    </motion.div>
);

export default AuthLayout;
