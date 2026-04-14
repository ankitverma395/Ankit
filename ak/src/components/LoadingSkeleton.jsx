const LoadingSkeleton = () => (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
    {[...Array(6)].map((_, i) => (
      <div key={i} className="glass-card p-4 animate-pulse"><div className="w-full aspect-square bg-white/10 rounded-lg mb-3" /><div className="h-4 bg-white/10 rounded mb-2" /><div className="h-3 bg-white/10 rounded w-2/3" /></div>
    ))}
  </div>
);
export default LoadingSkeleton;