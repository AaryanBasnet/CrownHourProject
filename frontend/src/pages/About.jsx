import { motion } from 'framer-motion';

export const About = () => {
    const fadeIn = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
    };

    return (
        <div className="bg-[#FAF8F5] min-h-screen">
            {/* Hero Section */}
            <section className="relative h-[60vh] overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 bg-[#0c0c0c]/30 z-10" />
                <img
                    src="https://images.unsplash.com/photo-1547949003-9792a18a2601?q=80&w=2070&auto=format&fit=crop"
                    alt="Watchmaking Workshop"
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="relative z-20 text-center text-white px-4">
                    <motion.h1
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeIn}
                        className="font-display text-5xl md:text-7xl mb-4 tracking-wide"
                    >
                        Our Story
                    </motion.h1>
                    <motion.p
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={{ ...fadeIn, visible: { ...fadeIn.visible, transition: { delay: 0.2, duration: 0.8 } } }}
                        className="text-lg md:text-xl font-light tracking-widest uppercase text-crown-gold"
                    >
                        Crafting Time Since 2026
                    </motion.p>
                </div>
            </section>

            {/* The Vision */}
            <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeIn}
                        className="space-y-6"
                    >
                        <h2 className="font-display text-4xl text-[#1A1A1A]">The Vision</h2>
                        <div className="w-16 h-0.5 bg-crown-gold" />
                        <p className="text-[#6B6B6B] leading-relaxed font-light text-lg">
                            CrownHour was born from a simple yet profound belief: that a watch is not merely an instrument of time, but a custodian of moments. In an era of fleeting digital seconds, we sought to bring back the weight, the presence, and the artistry of mechanical timekeeping.
                        </p>
                        <p className="text-[#6B6B6B] leading-relaxed font-light text-lg">
                            Our founders, united by an obsession for horology and design, envisioned a brand that bridges the gap between heritage craftsmanship and contemporary aesthetics.
                        </p>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="relative h-[600px]"
                    >
                        <img
                            src="https://images.unsplash.com/photo-1509048191080-d2984bad6ae5?q=80&w=1400&auto=format&fit=crop"
                            alt="Watch Detail"
                            className="w-full h-full object-cover shadow-xl"
                        />
                        <div className="absolute -bottom-8 -left-8 w-64 h-64 border border-crown-gold/30 hidden md:block" />
                    </motion.div>
                </div>
            </section>

            {/* Values */}
            <section className="bg-white py-24 px-6">
                <div className="max-w-7xl mx-auto text-center mb-16">
                    <h2 className="font-display text-4xl text-[#1A1A1A] mb-4">Our Values</h2>
                    <p className="text-[#6B6B6B] uppercase tracking-widest text-sm">What drives us forward</p>
                </div>

                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
                    {[
                        { title: 'Precision', desc: 'Every movement is calibrated to perfection, ensuring that your time is measured with absolute accuracy.' },
                        { title: 'Heritage', desc: 'We honor the centuries-old traditions of watchmaking while embracing modern innovation.' },
                        { title: 'Elegance', desc: 'True luxury lies in simplicity. Our designs speak in whispers, not shouts.' }
                    ].map((item, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.2, duration: 0.6 }}
                            className="text-center p-8 border border-black/5 hover:border-crown-gold transition-colors duration-300"
                        >
                            <h3 className="font-display text-2xl mb-4 text-[#1A1A1A]">{item.title}</h3>
                            <p className="text-[#6B6B6B] font-light leading-relaxed">{item.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </section>
        </div>
    );
};

// export default About; // Removed execution

