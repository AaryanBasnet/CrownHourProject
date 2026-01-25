const Marquee = () => {
  const items = ['Swiss Made', 'Since 1974', 'Handcrafted Excellence', 'Lifetime Service'];
  
  // Duplicate items for seamless loop
  const allItems = [...items, ...items, ...items, ...items];

  return (
    <section className="py-5 bg-gray-900 overflow-hidden">
      <div className="flex animate-marquee">
        {allItems.map((item, i) => (
          <div key={i} className="flex items-center gap-12 px-12 whitespace-nowrap">
            <span className="font-display text-sm font-normal text-white tracking-widest uppercase">
              {item}
            </span>
            <span className="w-1.5 h-1.5 bg-amber-600 rounded-full" />
          </div>
        ))}
      </div>
    </section>
  );
};

export default Marquee;