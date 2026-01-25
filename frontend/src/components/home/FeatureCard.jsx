const FeatureCard = ({ icon, title, description }) => {
  return (
    <div className="group text-center p-8 bg-white border border-gray-100 hover:border-amber-600 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center border border-amber-600/30 rounded-full text-2xl bg-stone-50 group-hover:bg-amber-600 group-hover:border-amber-600 transition-all">
        {icon}
      </div>
      <h3 className="font-display text-xl font-medium mb-3">{title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
    </div>
  );
};

export default FeatureCard;