import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { usePlayer } from '../context/PlayerContext';
import axios from 'axios';
import { TrendingUp, ChevronRight } from 'lucide-react';
import SongCard from '../components/SongCard';
import LoadingSkeleton from '../components/LoadingSkeleton';

const Home = () => {
  const [trending, setTrending] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [dailyMixes, setDailyMixes] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔥 infinite scroll
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef();

  const { user } = useAuth();
  const { playSong } = usePlayer();

  // ✅ helper (safe API handling)
  const getArray = (data) => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.songs)) return data.songs;
    return [];
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (page > 1) loadMoreTrending();
  }, [page]);

  const fetchData = async () => {
    try {
      const trendingRes = await axios.get(
        `${import.meta.env.VITE_API_URL}/youtube/trending?page=1`
      );

      const recRes = await axios.get(
        `${import.meta.env.VITE_API_URL}/youtube/search?q=popular music&page=1`
      );

      const trendingData = getArray(trendingRes.data);
      const recData = getArray(recRes.data);

      setTrending(trendingData);
      setRecommendations(recData.slice(0, 10));

      // 🎧 Daily Mix
      const mixes = trendingData.slice(0, 6).map((song, idx) => ({
        id: idx,
        name: `Daily Mix ${idx + 1}`,
        description: `${song.artist || "Top Hits"} and more`,
        songs: [song],
        image: song.thumbnail
      }));

      setDailyMixes(mixes);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 🔥 infinite scroll load
  const loadMoreTrending = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/youtube/trending?page=${page}`
      );

      const newSongs = getArray(res.data);

      if (newSongs.length === 0) {
        setHasMore(false);
        return;
      }

      setTrending(prev => [...prev, ...newSongs]);

    } catch (err) {
      console.error(err);
    }
  };

  // 🔥 observer fix
  const lastSongRef = (node) => {
    if (loading || !hasMore) return;

    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        setPage(prev => prev + 1);
      }
    });

    if (node) observer.current.observe(node);
  };

  if (loading) return <LoadingSkeleton />;

  const dailyMixSongs = dailyMixes.map(m => m.songs[0]);

  return (
    <div className="space-y-10 pb-32">

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative h-64 md:h-80 rounded-2xl overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1514525253161-7a46d19cd819')] bg-cover bg-center mix-blend-overlay" />
        <div className="relative h-full flex flex-col justify-center px-8 md:px-12">
          <h1 className="text-3xl md:text-5xl font-bold mb-2">
            Good {new Date().getHours() < 12 ? 'Morning' : 'Evening'}, {user?.username}!
          </h1>
          <p className="text-base md:text-lg opacity-90">
            Discover new music and enjoy your favorite tracks
          </p>
        </div>
      </motion.div>

      {/* Made For You */}
      <section>
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-2xl font-bold">Made For You</h2>
          <button className="text-sm text-purple-400 flex items-center gap-1 hover:gap-2">
            Show all <ChevronRight size={16} />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {dailyMixes.map((mix, idx) => (
            <SongCard
              key={mix.id}
              song={mix.songs[0]}
              index={idx}
              allSongs={dailyMixSongs}
            />
          ))}
        </div>
      </section>

      {/* Trending */}
      <section>
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <TrendingUp size={24} className="text-purple-400" /> Trending Now
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.isArray(trending) &&
            trending.map((song, idx) => {
              if (trending.length === idx + 1) {
                return (
                  <div ref={lastSongRef} key={song.youtubeId || idx}>
                    <SongCard
                      song={song}
                      index={idx}
                      allSongs={trending}
                    />
                  </div>
                );
              }

              return (
                <SongCard
                  key={song.youtubeId || idx}
                  song={song}
                  index={idx}
                  allSongs={trending}
                />
              );
            })}
        </div>
      </section>

      {/* Recommended */}
      <section>
        <h2 className="text-2xl font-bold mb-5">Recommended For You</h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.isArray(recommendations) &&
            recommendations.slice(0, 6).map((song, idx) => (
              <SongCard
                key={song.youtubeId || idx}
                song={song}
                index={idx}
                allSongs={recommendations}
              />
            ))}
        </div>
      </section>

    </div>
  );
};

export default Home;