import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  // 1. Centralized Re-fetch Logic
  const fetchMe = useCallback(async (authToken) => {
    const currentToken = authToken || token;
    if (!currentToken) return;

    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${currentToken}` }
      });
      setUser(res.data.user);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      localStorage.setItem('lastFetch', Date.now().toString());
    } catch (err) {
      console.error("Session re-validation failed:", err);
      if (err.response?.status === 401) logout(); // Kill session if token is invalid
    } finally {
      setLoading(false);
    }
  }, [token]);

  // 2. Initial Boot & Axios Interceptor
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchMe(token);
    } else {
      setLoading(false);
    }
  }, []); // Run once on mount

  // 3. Smart Focus Re-validation
  useEffect(() => {
    const handleFocus = () => {
      const lastFetch = localStorage.getItem('lastFetch');
      const fiveMinutes = 5 * 60 * 1000;
      
      // Only re-fetch if tab gains focus AND it's been more than 5 mins
      if (token && (!lastFetch || Date.now() - parseInt(lastFetch) > fiveMinutes)) {
        fetchMe();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [token, fetchMe]);

  const login = async (email, password) => {
    const res = await axios.post(`${import.meta.env.VITE_API_URL}/auth/login`, { email, password });
    const { token: newToken, user: newUser } = res.data;
    
    saveSession(newToken, newUser);
    return res.data;
  };

  const signup = async (username, email, password) => {
    const res = await axios.post(`${import.meta.env.VITE_API_URL}/auth/register`, { username, email, password });
    const { token: newToken, user: newUser } = res.data;
    
    saveSession(newToken, newUser);
    return res.data;
  };

  const saveSession = (newToken, newUser) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('lastFetch');
    delete axios.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
  };

  const refreshUser = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const value = {
    token,
    user,
    login,
    signup,
    logout,
    refreshUser,
    loading,
    isAuthenticated: !!token
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};