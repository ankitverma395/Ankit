// frontend/src/pages/Profile.jsx
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import axios from 'axios';
import SongCard from '../components/SongCard';
import { 
  User, Mail, Calendar, Heart, 
  Settings, Edit2, Trash2, Lock, 
  LogOut, Camera, Loader
} from 'lucide-react';

const Profile = () => {
  const { user, token, logout, refreshUser } = useAuth();
  const [likedSongs, setLikedSongs] = useState([]);
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  
  // Modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // Form states
  const [editUsername, setEditUsername] = useState(user?.username || '');
  const [editEmail, setEditEmail] = useState(user?.email || '');
  const [editProfilePicture, setEditProfilePicture] = useState(user?.profilePicture || '');
  const [imagePreview, setImagePreview] = useState(user?.profilePicture || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  
  const fileInputRef = useRef(null);

  // Compress image before converting to base64
  const compressImage = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxSize = 300; // max dimension 300px
          if (width > height && width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          } else if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7); // 70% quality
          resolve(compressedBase64);
        };
        img.onerror = reject;
      };
      reader.onerror = reject;
    });
  };

  useEffect(() => {
    fetchLikedSongs();
  }, [token]);

  const fetchLikedSongs = async () => {
    setLoading(true);
    try {
      const likedRes = await axios.get(`${import.meta.env.VITE_API_URL}/auth/liked-songs`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLikedSongs(likedRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle image upload with compression
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }
      
      try {
        const compressedBase64 = await compressImage(file);
        setEditProfilePicture(compressedBase64);
        setImagePreview(compressedBase64);
      } catch (err) {
        console.error('Compression error:', err);
        alert('Failed to process image');
      }
    }
  };

  // Edit profile
  const updateProfile = async () => {
    setUpdating(true);
    setError('');
    try {
      const res = await axios.put(`${import.meta.env.VITE_API_URL}/auth/profile`,
        { username: editUsername, email: editEmail, profilePicture: editProfilePicture },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      refreshUser(res.data.user);
      setShowEditModal(false);
      alert('Profile updated successfully!');
    } catch (err) {
      console.error('Update error:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Update failed. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  // Change password
  const changePassword = async () => {
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setUpdating(true);
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/auth/change-password`,
        { currentPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowPasswordModal(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      alert('Password changed successfully');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setUpdating(false);
    }
  };

  // Delete account
  const deleteAccount = async () => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/auth/account`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      logout();
    } catch (err) {
      alert('Failed to delete account');
    }
  };

  // Unlike a song
  const unlikeSong = async (songId) => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/auth/like-song`, 
        { songId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLikedSongs(likedSongs.filter(s => s._id !== songId));
    } catch (err) { console.error(err); }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'liked', label: 'Liked Songs', icon: Heart },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  if (loading) return <div className="text-center py-12">Loading...</div>;

  return (
    <div className="space-y-8 pb-24">
      {/* Header Card */}
      <motion.div className="glass-card p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl" />
        <div className="relative flex items-center gap-6 flex-wrap">
          {/* Profile Picture with hover upload button */}
          <div className="relative group">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-xl overflow-hidden">
              {user?.profilePicture ? (
                <img src={user.profilePicture} className="w-full h-full rounded-full object-cover" alt="Profile" />
              ) : (
                <User size={48} />
              )}
            </div>
            <button
              onClick={() => {
                setEditUsername(user?.username || '');
                setEditEmail(user?.email || '');
                setEditProfilePicture(user?.profilePicture || '');
                setImagePreview(user?.profilePicture || '');
                setShowEditModal(true);
              }}
              className="absolute bottom-0 right-0 p-1.5 rounded-full bg-purple-500 text-white opacity-0 group-hover:opacity-100 transition hover:bg-purple-600"
            >
              <Camera size={14} />
            </button>
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold">{user?.username}</h1>
            <div className="flex flex-wrap gap-4 mt-2 text-gray-400">
              <span className="flex items-center gap-1"><Mail size={16} /> {user?.email}</span>
              <span className="flex items-center gap-1"><Calendar size={16} /> Joined {new Date(user?.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10 pb-2 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full transition ${activeTab === tab.id ? 'bg-purple-500 text-white' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
          >
            <tab.icon size={18} />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <button onClick={() => {
              setEditUsername(user?.username || '');
              setEditEmail(user?.email || '');
              setEditProfilePicture(user?.profilePicture || '');
              setImagePreview(user?.profilePicture || '');
              setShowEditModal(true);
            }} className="flex items-center gap-2 text-purple-400 hover:text-purple-300">
              <Edit2 size={18} /> Edit Profile
            </button>
          </div>
          <div className="glass-card p-6 text-center">
            <p className="text-gray-400">Manage your playlists from the <strong>Library</strong> page.</p>
          </div>
        </div>
      )}

      {/* Liked Songs Tab */}
      {activeTab === 'liked' && (
        <div>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Heart size={24} className="text-purple-400" /> Liked Songs</h2>
          {likedSongs.length === 0 ? (
            <div className="glass-card p-12 text-center"><Heart size={48} className="mx-auto text-gray-500 mb-3" /><p className="text-gray-400">No liked songs yet</p></div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {likedSongs.map((song, idx) => (
                <div key={song._id} className="relative group">
                  <SongCard song={song} index={idx} allSongs={likedSongs} />
                  <button
                    onClick={() => unlikeSong(song._id)}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition hover:bg-red-500"
                  >
                    <Heart size={14} className="fill-white" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="glass-card p-6 space-y-4">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Settings size={24} className="text-purple-400" /> Account Settings</h2>
          <button onClick={() => setShowPasswordModal(true)} className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/10 transition">
            <span className="flex items-center gap-2"><Lock size={18} /> Change Password</span>
            <span className="text-purple-400">→</span>
          </button>
          <button onClick={() => setShowDeleteModal(true)} className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-red-500/10 transition text-red-400">
            <span className="flex items-center gap-2"><Trash2 size={18} /> Delete Account</span>
            <span>→</span>
          </button>
          <button onClick={logout} className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/10 transition">
            <span className="flex items-center gap-2"><LogOut size={18} /> Logout</span>
            <span>→</span>
          </button>
        </div>
      )}

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div className="glass-card p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Edit Profile</h3>
            
            {/* Profile Picture Upload */}
            <div className="flex justify-center mb-4">
              <div className="relative">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  {imagePreview ? (
                    <img src={imagePreview} className="w-full h-full object-cover" alt="Preview" />
                  ) : (
                    <User size={40} className="text-white" />
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current.click()}
                  className="absolute bottom-0 right-0 p-1.5 rounded-full bg-purple-500 text-white hover:bg-purple-600 transition"
                >
                  <Camera size={14} />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
            </div>

            <input
              type="text"
              placeholder="Username"
              value={editUsername}
              onChange={(e) => setEditUsername(e.target.value)}
              className="input-glass mb-3"
            />
            <input
              type="email"
              placeholder="Email"
              value={editEmail}
              onChange={(e) => setEditEmail(e.target.value)}
              className="input-glass mb-4"
            />
            {error && <p className="text-red-400 text-sm mb-2">{error}</p>}
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowEditModal(false)} className="px-4 py-2 rounded-lg hover:bg-white/10">Cancel</button>
              <button onClick={updateProfile} disabled={updating} className="btn-primary px-5 py-2 flex items-center gap-2">
                {updating && <Loader size={16} className="animate-spin" />}
                Save
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div className="glass-card p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Change Password</h3>
            <input
              type="password"
              placeholder="Current Password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="input-glass mb-3"
            />
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="input-glass mb-3"
            />
            <input
              type="password"
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input-glass mb-4"
            />
            {error && <p className="text-red-400 text-sm mb-2">{error}</p>}
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowPasswordModal(false)} className="px-4 py-2 rounded-lg hover:bg-white/10">Cancel</button>
              <button onClick={changePassword} disabled={updating} className="btn-primary px-5 py-2 flex items-center gap-2">
                {updating && <Loader size={16} className="animate-spin" />}
                Update
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div className="glass-card p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4 text-red-400">Delete Account</h3>
            <p className="text-gray-300 mb-4">Are you sure? This action is permanent and cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 rounded-lg hover:bg-white/10">Cancel</button>
              <button onClick={deleteAccount} className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600">Delete</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Profile;