import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import PlayerBar from './components/PlayerBar'
import Home from './pages/Home'
import Search from './pages/Search'
import PlaylistPage from './pages/PlaylistPage'
import PlayerView from './pages/PlayerView'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Profile from './pages/Profile'
import Analytics from './pages/Analytics'
import Library from './pages/Library'
import { useAuth } from './context/AuthContext'
import { AnimatePresence } from 'framer-motion'
import KeyboardShortcuts from './components/KeyboardShortcuts';
import DailyStats from './pages/DailyStats';
import Trending from './pages/Trending';
import Radio from './pages/Radio';
import Charts from './pages/Charts';
import TopArtists from './pages/TopArtists';
import LikedSongs from './pages/LikedSongs';
import Podcasts from './pages/Podcasts';



function App() {
  const { token, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!token) {
    return (
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="*" element={<Login />} />
        </Routes>
      </AnimatePresence>
    )
  }

  return (
    <div className="flex flex-col h-screen">
      <Navbar />

      <div className="flex flex-1 overflow-hidden pt-16 md:pt-20">
        <Sidebar />

        <main className="flex-1 overflow-y-auto px-4 md:px-8 py-6 pb-32 md:ml-64">
          <AnimatePresence mode="wait">

            {/* ✅ Keyboard Shortcuts */}
            <KeyboardShortcuts />

            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/search" element={<Search />} />
              <Route path="/library" element={<Library />} />
              <Route path="/playlist/:id" element={<PlaylistPage />} />
              <Route path="/player/:songId" element={<PlayerView />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/podcasts" element={<Podcasts />} />
              // Inside Routes:
<Route path="/daily-stats" element={<DailyStats />} />

               <Route path="/trending" element={<Trending />} />
<Route path="/radio" element={<Radio />} />
<Route path="/charts" element={<Charts />} />
<Route path="/top-artists" element={<TopArtists />} />
<Route path="/liked-songs" element={<LikedSongs />} />
            </Routes>

          </AnimatePresence>
        </main>
      </div>

      <PlayerBar />
    </div>
  )
}

export default App