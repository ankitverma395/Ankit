import express from 'express';
import yts from 'yt-search';

const router = express.Router();

// ⚡ Cache
const cache = new Map();
const CACHE_TIME = 1000 * 60 * 5; // 5 min

// 🔥 Remove duplicates
const getUniqueVideos = (videos) => {
  const seen = new Set();
  return videos.filter(v => {
    if (seen.has(v.videoId)) return false;
    seen.add(v.videoId);
    return true;
  });
};

// 🔥 Cache helpers
const getCache = (key) => {
  const data = cache.get(key);
  if (!data) return null;

  if (Date.now() - data.time > CACHE_TIME) {
    cache.delete(key);
    return null;
  }

  return data.value;
};

const setCache = (key, value) => {
  cache.set(key, {
    value,
    time: Date.now()
  });
};

// 🔍 SEARCH (FAST + SMART)
router.get('/search', async (req, res) => {
  try {
    const { q, page = 1 } = req.query;
    const maxResults = Math.min(parseInt(req.query.maxResults) || 20, 20);

    if (!q) {
      return res.status(400).json({ message: 'Query parameter q is required' });
    }

    const cacheKey = `search-${q}-${page}-${maxResults}`;
    const cached = getCache(cacheKey);
    if (cached) return res.json(cached);

    // 🔥 Smart queries (fast)
    const queries = [
      q,
      `${q} song`,
      `${q} remix`
    ];

    // ⚡ Parallel calls
    const results = await Promise.all(
      queries.map(query => yts(query))
    );

    let allVideos = results.flatMap(r => r.videos);

    const uniqueVideos = getUniqueVideos(allVideos);

    const pageNum = parseInt(page);
    const start = (pageNum - 1) * maxResults;
    const end = start + maxResults;

    const songs = uniqueVideos.slice(start, end).map(video => ({
      youtubeId: video.videoId,
      title: video.title,
      artist: video.author?.name || 'Unknown',
      thumbnail: video.thumbnail,
      duration: video.timestamp || '0:00'
    }));

    const response = {
      page: pageNum,
      hasMore: end < uniqueVideos.length,
      songs
    };

    setCache(cacheKey, response);

    res.json(response);

  } catch (error) {
    console.error('Search error:', error.message);
    res.status(500).json({ message: 'Search failed' });
  }
});


// 🔥 TRENDING (FAST + VARIETY)
router.get('/trending', async (req, res) => {
  try {
    const { page = 1 } = req.query;
    const maxResults = Math.min(parseInt(req.query.maxResults) || 20, 20);

    const cacheKey = `trending-${page}-${maxResults}`;
    const cached = getCache(cacheKey);
    if (cached) return res.json(cached);

    const queries = [
      'trending songs india',
      'bollywood hits',
      'punjabi songs',
      'english pop songs'
    ];

    const results = await Promise.all(
      queries.map(query => yts(query))
    );

    let allVideos = results.flatMap(r => r.videos);

    const uniqueVideos = getUniqueVideos(allVideos);

    const pageNum = parseInt(page);
    const start = (pageNum - 1) * maxResults;
    const end = start + maxResults;

    const songs = uniqueVideos.slice(start, end).map(video => ({
      youtubeId: video.videoId,
      title: video.title,
      artist: video.author?.name || 'Unknown',
      thumbnail: video.thumbnail,
      duration: video.timestamp || '0:00'
    }));

    const response = {
      page: pageNum,
      hasMore: end < uniqueVideos.length,
      songs
    };

    setCache(cacheKey, response);

    res.json(response);

  } catch (error) {
    console.error('Trending error:', error.message);
    res.status(500).json({ message: 'Trending failed' });
  }
});

export default router;