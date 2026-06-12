import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const close = () => setMenuOpen(false);

  return (
    <nav className="bg-gray-900 border-b border-gray-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <span className="text-red-500">🏎</span> HW Marketplace
        </Link>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link to={`/profile/${user._id}`} className="flex items-center gap-2 group">
                <img
                  src={user.profilePhoto || `https://api.dicebear.com/7.x/initials/svg?seed=${user._id}`}
                  alt={user.username}
                  className="w-8 h-8 rounded-full object-cover border border-gray-700 group-hover:border-gray-500 transition-colors"
                />
                <span className="text-sm text-gray-300 group-hover:text-white hidden sm:inline transition-colors">@{user.username}</span>
              </Link>
              <Link
                to="/create"
                className="w-9 h-9 bg-red-600 hover:bg-red-500 text-white rounded-full flex items-center justify-center text-xl font-bold leading-none transition-colors"
                title="List a car"
              >
                +
              </Link>
            </>
          ) : (
            <Link
              to="/login"
              className="text-sm text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 px-4 py-2 rounded-xl transition-colors"
            >
              Sign in
            </Link>
          )}

          {/* Hamburger */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(o => !o)}
              className="flex flex-col justify-center items-center gap-1.5 w-9 h-9 rounded-xl hover:bg-gray-800 transition-colors"
              aria-label="Menu"
            >
              <span className={`block w-5 h-0.5 bg-gray-400 transition-all duration-200 origin-center ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
              <span className={`block w-5 h-0.5 bg-gray-400 transition-all duration-200 ${menuOpen ? 'opacity-0' : ''}`} />
              <span className={`block w-5 h-0.5 bg-gray-400 transition-all duration-200 origin-center ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-gray-900 border border-gray-800 rounded-2xl shadow-xl shadow-black/40 py-1 overflow-hidden">
                <Link
                  to="/users"
                  onClick={close}
                  className="flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
                >
                  Users
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
