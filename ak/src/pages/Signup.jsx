import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Lock, UserPlus, Music } from 'lucide-react';

const Signup = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try { await signup(username, email, password); navigate('/'); } catch (err) { setError(err.response?.data?.message || 'Signup failed'); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-8 w-full max-w-md">
        <div className="text-center mb-8"><div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4"><Music size={32} /></div><h2 className="text-3xl font-bold">Create Account</h2><p className="text-gray-400 mt-2">Start your music journey</p></div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative"><User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} /><input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} className="input-glass pl-10" required /></div>
          <div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} /><input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-glass pl-10" required /></div>
          <div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} /><input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="input-glass pl-10" required /></div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2"><UserPlus size={18} /> Sign Up</button>
        </form>
        <p className="text-center mt-6 text-gray-400">Already have an account? <Link to="/login" className="text-purple-400 hover:underline">Sign in</Link></p>
      </motion.div>
    </div>
  );
};
export default Signup;