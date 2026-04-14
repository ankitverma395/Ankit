import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search as SearchIcon, Loader } from 'lucide-react';
import axios from 'axios';
import SongCard from '../components/SongCard';

const Search = () => {
  const [searchParams] = useSearchParams();

  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query.trim()) handleSearch();
  }, []);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);

    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/youtube/search?q=${encodeURIComponent(query)}`
      );

      // ✅ FIX: extract songs correctly
      setResults(res.data.songs || []);
    } catch (err) {
      console.error("Search error:", err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">

      {/* SEARCH BAR */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          className="flex gap-3"
        >
          <div className="flex-1 relative">
            <SearchIcon
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search songs, artists, albums..."
              className="input-glass pl-12"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
          >
            {loading ? (
              <Loader className="animate-spin" size={20} />
            ) : (
              'Search'
            )}
          </button>
        </form>
      </motion.div>

      {/* RESULTS */}
      {results.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {results.map((song, idx) => (
            <SongCard
              key={song.youtubeId}
              song={song}
              index={idx}
              allSongs={results}
            />
          ))}
        </div>
      )}

      {/* NO RESULTS */}
      {query && !loading && results.length === 0 && (
        <div className="text-center py-16 glass-card">
          <SearchIcon size={48} className="mx-auto text-gray-500 mb-3" />
          <p className="text-gray-400">
            No results found for "{query}"
          </p>
        </div>
      )}
    </div>
  );
};

export default Search;