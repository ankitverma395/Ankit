import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Check, X, Share2, Globe, Link as LinkIcon, Sparkles } from 'lucide-react';

const SharePlaylistModal = ({ playlist, onClose }) => {
  const [copied, setCopied] = useState(false);
  const shareUrl = `${window.location.origin}/playlist/shared/${playlist.shareToken}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[100] p-4"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="glass-card p-0 w-full max-w-sm overflow-hidden border border-white/10 shadow-2xl"
      >
        {/* Header with Background Glow */}
        <div className="relative p-6 text-center border-b border-white/5 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-purple-600/20 to-transparent opacity-50" />
          
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 p-2 rounded-xl hover:bg-white/10 text-gray-500 transition-colors"
          >
            <X size={18} />
          </button>

          <div className="relative inline-flex p-4 rounded-3xl bg-purple-600/20 text-purple-400 mb-4 shadow-inner">
            <Share2 size={32} />
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 border-2 border-dashed border-purple-500/30 rounded-3xl"
            />
          </div>

          <h3 className="text-xl font-black uppercase tracking-tight text-white">Share Playlist</h3>
          <p className="text-[10px] font-black text-purple-500 uppercase tracking-[0.2em] mt-1">
            {playlist.name}
          </p>
        </div>

        {/* Content Section */}
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6 p-3 rounded-2xl bg-white/[0.03] border border-white/5">
            <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg">
              <Globe size={16} />
            </div>
            <p className="text-xs text-gray-400 leading-tight">
              Anyone with this secret link can view and listen to this collection.
            </p>
          </div>

          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500" />
            <div className="relative flex items-center gap-2 bg-[#0a0a0a] border border-white/10 rounded-2xl p-1.5 pl-4 transition-all focus-within:border-purple-500/50">
              <LinkIcon size={14} className="text-gray-500" />
              <input 
                type="text" 
                value={shareUrl} 
                readOnly 
                className="flex-1 bg-transparent text-xs text-gray-300 outline-none truncate font-medium py-2" 
              />
              <button 
                onClick={copyToClipboard} 
                className={`relative overflow-hidden px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${
                  copied 
                    ? 'bg-green-500 text-white' 
                    : 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/20'
                }`}
              >
                <AnimatePresence mode="wait">
                  {copied ? (
                    <motion.div
                      key="check"
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      className="flex items-center gap-1"
                    >
                      <Check size={14} /> Copied
                    </motion.div>
                  ) : (
                    <motion.div
                      key="copy"
                      initial={{ y: -10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                    >
                      Copy
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="px-6 pb-8 text-center">
          <div className="flex items-center justify-center gap-2 text-gray-600">
            <Sparkles size={12} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Powered by Nexora Sync</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SharePlaylistModal;