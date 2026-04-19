const LoadingSkeleton = () => {
  return (
    <div className="space-y-10">
      {/* Hero Skeleton (Matches Home.jsx Hero height) */}
      <div className="relative h-64 md:h-80 w-full rounded-[2rem] overflow-hidden bg-white/5 border border-white/10 animate-pulse">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
      </div>

      {/* Grid Section Skeleton */}
      <section className="space-y-6">
        <div className="h-8 w-48 bg-white/10 rounded-lg animate-pulse" />
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {[...Array(6)].map((_, i) => (
            <div 
              key={i} 
              className="glass-card p-4 space-y-4 border border-white/5"
            >
              {/* Thumbnail */}
              <div className="relative w-full aspect-square bg-white/10 rounded-2xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
              </div>
              
              {/* Text Lines */}
              <div className="space-y-2">
                <div className="h-4 bg-white/10 rounded-md w-3/4 animate-pulse" />
                <div className="h-3 bg-white/5 rounded-md w-1/2 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default LoadingSkeleton;