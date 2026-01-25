const TestimonialCard = ({ initials, name, title, text }) => {
  return (
    <div className="p-8 bg-stone-50 relative hover:-translate-y-2 hover:shadow-xl transition-all duration-300">
      {/* Quote Mark */}
      <span className="absolute top-6 left-6 font-display text-7xl text-amber-600/20 leading-none">
        "
      </span>
      
      {/* Rating */}
      <div className="flex gap-1 mb-4 text-amber-600">
        {[...Array(5)].map((_, i) => (
          <span key={i}>★</span>
        ))}
      </div>
      
      {/* Text */}
      <p className="text-lg leading-relaxed mb-6 relative z-10">{text}</p>
      
      {/* Author */}
      <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center text-white font-display text-lg font-medium">
          {initials}
        </div>
        <div>
          <div className="font-display text-lg font-medium">{name}</div>
          <div className="text-sm text-gray-500">{title}</div>
        </div>
      </div>
    </div>
  );
};

export default TestimonialCard;