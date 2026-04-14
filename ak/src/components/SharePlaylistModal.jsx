import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

const SharePlaylistModal = ({ playlist, onClose }) => {
  const [copied, setCopied] = useState(false);
  const shareUrl = `${window.location.origin}/playlist/shared/${playlist.shareToken}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="glass-card p-6 max-w-md w-full">
        <h3 className="text-xl font-bold mb-4">Share Playlist</h3>
        <p className="text-sm text-gray-400 mb-2">Anyone with this link can view the playlist:</p>
        <div className="flex gap-2 mb-4">
          <input type="text" value={shareUrl} readOnly className="flex-1 input-glass text-sm" />
          <button onClick={copyToClipboard} className="btn-primary p-2">
            {copied ? <Check size={18} /> : <Copy size={18} />}
          </button>
        </div>
        <button onClick={onClose} className="w-full btn-primary">Close</button>
      </div>
    </div>
  );
};
export default SharePlaylistModal;