import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Lock, UserPlus, Music, Sparkles } from 'lucide-react';

const Signup = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try { 
      await signup(username, email, password); 
      navigate('/'); 
    } catch (err) { 
      setError(err.response?.data?.message || 'Something went wrong. Please try again.'); 
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
      
      {/* Dynamic Background Blobs - Slightly different positions than Login */}
      <div className="absolute top-[20%] right-[-5%] w-[45%] h-[45%] bg-pink-600/20 blur-[130px] rounded-full animate-pulse" />
      <div className="absolute bottom-[10%] left-[-5%] w-[40%] h-[40%] bg-indigo-600/20 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }} 
        animate={{ opacity: 1, scale: 1 }} 
        className="glass-card p-10 w-full max-w-md relative z-10 border border-white/10 shadow-2xl"
      >
        {/* Header */}
        <div className="text-center mb-10">
          <motion.div 
            whileHover={{ y: -5, scale: 1.05 }}
            className="w-20 h-20 bg-gradient-to-tr from-pink-500 via-rose-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-pink-500/20"
          >
            <Music size={40} className="text-white" />
          </motion.div>
          <h2 className="text-4xl font-black tracking-tight text-white mb-2">Join Nexora</h2>
          <p className="text-gray-400 font-medium">Create your rhythm today.</p>
        </div>

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-4">
            {/* Username Field */}
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-pink-400 transition-colors" size={20} />
              <input 
                type="text" 
                placeholder="Pick a username" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:bg-white/[0.07] transition-all" 
                required 
              />
            </div>

            {/* Email Field */}
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-pink-400 transition-colors" size={20} />
              <input 
                type="email" 
                placeholder="Email address" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:bg-white/[0.07] transition-all" 
                required 
              />
            </div>

            {/* Password Field */}
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-pink-400 transition-colors" size={20} />
              <input 
                type="password" 
                placeholder="Create a password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:bg-white/[0.07] transition-all" 
                required 
              />
            </div>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }} 
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl text-red-400 text-sm text-center font-medium"
            >
              {error}
            </motion.div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="group relative w-full bg-white text-black font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-gray-100 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-black/20 border-t-black rounded-full animate-spin" />
            ) : (
              <>
                <UserPlus size={20} /> 
                <span>Create Account</span>
                <Sparkles size={16} className="absolute right-6 opacity-0 group-hover:opacity-100 transition-opacity text-pink-500" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-white/5 text-center">
          <p className="text-gray-400 font-medium">
            Already have an account?{' '}
            <Link to="/login" className="text-pink-400 hover:text-pink-300 font-bold underline-offset-4 hover:underline transition-all">
              Sign in here
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Signup;