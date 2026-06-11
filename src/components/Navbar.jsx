import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="bg-gray-900 border-b border-gray-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <span className="text-red-500">🏎</span> HW Marketplace
        </Link>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link
                to="/create"
                className="bg-red-600 hover:bg-red-500 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
              >
                + List a Car
              </Link>
              <Link to={`/profile/${user._id}`} className="flex items-center gap-2 group">
                <img
                  src={user.profilePhoto || `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover border border-gray-700 group-hover:border-gray-500 transition-colors"
                />
                <span className="text-sm text-gray-300 group-hover:text-white hidden sm:inline transition-colors">{user.name}</span>
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Sign out
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="text-sm text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 px-4 py-2 rounded-xl transition-colors"
            >
              Sign in / Register
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
