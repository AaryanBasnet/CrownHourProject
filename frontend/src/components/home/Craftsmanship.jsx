import { Link } from 'react-router-dom';

const Craftsmanship = () => {
  const specs = [
    { label: 'Case Material', value: '316L Stainless Steel' },
    { label: 'Crystal', value: 'Sapphire (AR Coated)' },
    { label: 'Movement', value: 'Swiss Automatic Cal. 9' },
    { label: 'Water Resistance', value: '5 ATM / 50 Meters' },
    { label: 'Power Reserve', value: '48 Hours' }
  ];

  return (
    <section className="bg-white">
      <div className="grid lg:grid-cols-2 min-h-screen">
        {/* Image */}
        <div className="relative overflow-hidden min-h-[500px] group">
          <img
            src="https://images.unsplash.com/photo-1617317376997-8748e6862c01?q=80&w=2070&auto=format&fit=crop"
            alt="Swiss Watchmaker at Work"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute bottom-12 left-12 right-12">
            <h3 className="font-display text-3xl text-white mb-2">Master Craftsmanship</h3>
            <p className="text-sm text-white/70 tracking-widest uppercase">Geneva, Switzerland</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-12 lg:p-16 flex flex-col justify-center bg-stone-50">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-4 mb-4">
            <span className="w-8 h-px bg-amber-600" />
            <span className="text-xs font-medium tracking-widest uppercase text-amber-600">
              The Art of Time
            </span>
          </div>

          <h2 className="font-display text-4xl lg:text-5xl mb-6 font-normal leading-tight">
            Precision in Every Detail
          </h2>

          <p className="text-lg text-gray-500 mb-10 leading-relaxed">
            Our movements are meticulously assembled in Geneva by master horologists with decades
            of experience. The Praeludium Chronograph represents over 50 years of engineering
            excellence and unwavering dedication to perfection.
          </p>

          {/* Specs */}
          <div className="mb-10">
            {specs.map((spec) => (
              <div
                key={spec.label}
                className="flex justify-between items-center py-4 border-b border-gray-200 hover:pl-4 hover:border-amber-600 transition-all cursor-default"
              >
                <span className="text-sm text-gray-500">{spec.label}</span>
                <span className="font-display text-lg font-medium">{spec.value}</span>
              </div>
            ))}
          </div>

          <Link to="/about" className="self-start px-8 py-4 border border-gray-900 text-gray-900 text-xs font-medium tracking-widest uppercase hover:bg-gray-900 hover:text-white transition-all duration-300 flex items-center gap-3 group">
            Discover Our Heritage
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Craftsmanship;