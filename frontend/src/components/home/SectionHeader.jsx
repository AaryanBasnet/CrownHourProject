const SectionHeader = ({ eyebrow, title, description, centered = true }) => {
  return (
    <div className={`mb-16 ${centered ? 'text-center' : ''}`}>
      <div className={`inline-flex items-center gap-4 mb-4 ${centered ? '' : ''}`}>
        <span className="w-8 h-px bg-amber-600" />
        <span className="text-xs font-medium tracking-widest uppercase text-amber-600">
          {eyebrow}
        </span>
        {centered && <span className="w-8 h-px bg-amber-600" />}
      </div>
      
      <h2 className="font-display text-4xl md:text-5xl mb-4 font-normal">
        {title}
      </h2>
      
      {description && (
        <p className={`text-lg text-gray-500 leading-relaxed ${centered ? 'max-w-2xl mx-auto' : ''}`}>
          {description}
        </p>
      )}
    </div>
  );
};

export default SectionHeader;