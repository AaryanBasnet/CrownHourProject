import { useState } from 'react';
import { motion } from 'framer-motion';
import { useToast } from '../../context/ToastContext';

const EnvelopeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

const Newsletter = () => {
  const [email, setEmail] = useState('');
  const { addToast } = useToast();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      addToast("Thank you! You've been added to our exclusive list.", 'success');
      setEmail('');
    }
  };

  return (
    <section className="py-28 px-6 bg-stone-100 relative overflow-hidden">
      {/* Pattern Background */}
      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23C9A962' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="max-w-2xl mx-auto text-center relative z-10"
      >
        {/* Icon */}
        <div className="w-20 h-20 mx-auto mb-8 border border-amber-600/30 rounded-full flex items-center justify-center text-amber-800 bg-white shadow-sm">
          <EnvelopeIcon />
        </div>

        <h2 className="font-display text-4xl md:text-5xl mb-4 font-normal text-crown-black">
          Join The Collector's Circle
        </h2>

        <p className="text-lg text-gray-500 mb-10 leading-relaxed font-light">
          Gain exclusive access to limited editions, private events, and insider insights
          from the world of haute horlogerie.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex gap-3 max-w-lg mx-auto mb-6 flex-col sm:flex-row relative">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            required
            className="flex-1 px-6 py-4 border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600 transition-all shadow-sm"
            aria-label="Email Address"
          />
          <button
            type="submit"
            className="px-8 py-4 bg-crown-black text-white text-xs font-medium tracking-widest uppercase hover:bg-amber-700 transition-all duration-300 shadow-lg hover:translate-y-px"
          >
            Subscribe
          </button>
        </form>

        <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <span>Your data is secure. Unsubscribe anytime.</span>
        </div>
      </motion.div>
    </section>
  );
};

export default Newsletter;