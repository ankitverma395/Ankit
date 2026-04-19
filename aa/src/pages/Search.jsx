import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search as SearchIcon, Loader, Sparkles, X, Filter } from 'lucide-react';
import axios from 'axios';
import SongCard from '../components/SongCard';

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  // Auto-search if query exists in URL on mount
  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      handleSearch(q);
    }
    if (inputRef.current) inputRef.current.focus();
  }, []);

  const handleSearch = async (searchQuery = query) => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setSearchParams({ q: searchQuery });

    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/youtube/search?q=${encodeURIComponent(searchQuery)}`
      );
      setResults(res.data.songs || []);
    } catch (err) {
      console.error("Search error:", err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setSearchParams({});
    if (inputRef.current) inputRef.current.focus();
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 pb-32 pt-4 px-4 md:px-0">
      
      {/* Smaller Search Box */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative group"
      >
        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
        
        <div className="relative glass-card p-3 md:p-4 rounded-2xl border-white/10">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch();
            }}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
          >
            <div className="flex-1 relative">
              <SearchIcon
                className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-500"
                size={18}
              />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search songs, artists..."
                className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-10 text-sm font-medium placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
              />
              {query && (
                <button 
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 hover:bg-white/10 rounded-full text-gray-400"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 bg-white text-black px-5 py-2.5 rounded-xl font-bold uppercase text-xs hover:bg-purple-500 hover:text-white transition-all shadow-md disabled:opacity-50"
            >
              {loading ? <Loader className="animate-spin" size={16} /> : <SearchIcon size={14} />}
              <span>Search</span>
            </button>
          </form>
        </div>
      </motion.div>

      {/* Results Header (unchanged) */}
      <AnimatePresence>
        {results.length > 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-between px-2"
          >
            <div className="flex items-center gap-3">
              <Sparkles className="text-purple-400" size={20} />
              <h2 className="text-2xl font-black italic tracking-tighter uppercase">
                Discovery <span className="text-gray-500 text-lg">({results.length})</span>
              </h2>
            </div>
            <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white">
              <Filter size={14} /> Refine
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results Grid (unchanged) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 md:gap-8">
        <AnimatePresence>
          {results.map((song, idx) => (
            <motion.div
              key={song.youtubeId}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.03 }}
            >
              <SongCard song={song} index={idx} allSongs={results} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Empty/Loading States (unchanged) */}
      {loading && results.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Loader className="w-10 h-10 animate-spin text-purple-500" />
          <p className="text-gray-500 font-black tracking-widest text-[10px] uppercase">Retrieving Data...</p>
        </div>
      )}

      {!loading && results.length === 0 && query && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-32 glass-card rounded-[3rem] border-dashed border-2 border-white/5"
        >
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
            <SearchIcon size={32} className="text-gray-700" />
          </div>
          <h3 className="text-xl font-black italic tracking-tighter uppercase mb-2">Void Encountered</h3>
          <p className="text-gray-500 max-w-xs mx-auto text-sm font-medium">
            We couldn't find any frequencies matching <span className="text-white">"{query}"</span>. Try a different signature.
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default Search;