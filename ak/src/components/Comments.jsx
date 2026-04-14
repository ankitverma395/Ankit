import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { Send, User } from 'lucide-react';
import axios from 'axios';

const Comments = ({ songId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const { token, user } = useAuth();
  const { socket } = useSocket();

  useEffect(() => {
    fetchComments();
    if (socket) {
      socket.emit('join-chat', songId);
      socket.on('new-message', (data) => {
        if (data.songId === songId) {
          setComments(prev => [data.comment, ...prev]);
        }
      });
    }
    return () => socket?.off('new-message');
  }, [socket, songId]);

  const fetchComments = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/comments/song/${songId}`);
      setComments(res.data);
    } catch (err) { console.error(err); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/comments`, 
        { songId, text: newComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      socket?.emit('send-message', { songId, comment: res.data });
      setNewComment('');
    } catch (err) { console.error(err); }
  };

  return (
    <div className="mt-8">
      <h3 className="text-xl font-semibold mb-4">Comments</h3>
      <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          className="flex-1 input-glass"
        />
        <button type="submit" className="btn-primary p-2"><Send size={20} /></button>
      </form>
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {comments.map((c) => (
          <div key={c._id} className="glass-card p-3">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center">
                <User size={12} />
              </div>
              <span className="font-medium text-sm">{c.user?.username}</span>
              <span className="text-xs text-gray-400">{new Date(c.createdAt).toLocaleString()}</span>
            </div>
            <p className="text-sm">{c.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
export default Comments;