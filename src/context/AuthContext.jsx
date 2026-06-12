import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const SERVER = import.meta.env.VITE_API_URL || '';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${SERVER}/auth/me`, { withCredentials: true })
      .then(res => setUser(res.data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const logout = async () => {
    await axios.get(`${SERVER}/auth/logout`, { withCredentials: true });
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const res = await axios.get(`${SERVER}/auth/me`, { withCredentials: true });
      setUser(res.data.user);
    } catch {
      setUser(null);
    }
  };

  const toggleWatch = async (listingId) => {
    if (!user) return;
    try {
      const res = await axios.post(`${SERVER}/api/users/me/watchlist/${listingId}`, {}, { withCredentials: true });
      setUser(u => ({ ...u, watchlist: res.data.watchlist }));
    } catch {}
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout, refreshUser, setUser, toggleWatch }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
