const Gallery = () => {
  const images = [
    'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=400&q=80',
    'https://images.unsplash.com/photo-1587925358603-c2eea5305bbc?w=400&q=80',
    'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400&q=80',
    'https://images.unsplash.com/photo-1508057198894-247b23fe5ade?w=400&q=80',
    'https://images.unsplash.com/photo-1539874754764-5a96559165b0?w=400&q=80'
  ];

  return (
    <section className="py-16 bg-stone-50">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-4 mb-4">
          <span className="w-8 h-px bg-amber-600" />
          <span className="text-xs font-medium tracking-widest uppercase text-amber-600">
            @CrownHour
          </span>
          <span className="w-8 h-px bg-amber-600" />
        </div>
        <h2 className="font-display text-4xl font-normal">Follow Our Journey</h2>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-1">
        {images.map((img, i) => (
          <div key={i} className="relative aspect-square overflow-hidden cursor-pointer group">
            <img 
              src={img} 
              alt="Gallery" 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
            />
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-white text-2xl">📷</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Gallery;