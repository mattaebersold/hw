import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/users').then(res => setUsers(res.data.users)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-20 text-gray-500">Loading…</div>;

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">
        Collectors <span className="text-gray-500 font-normal text-lg">({users.length})</span>
      </h1>

      <div className="space-y-2">
        {users.map(u => (
          <Link
            key={u._id}
            to={`/profile/${u._id}`}
            className="flex items-center gap-4 bg-gray-900 border border-gray-800 hover:border-gray-600 rounded-2xl px-5 py-4 transition-colors group"
          >
            <img
              src={u.profilePhoto || `https://api.dicebear.com/7.x/initials/svg?seed=${u._id}`}
              alt={u.username}
              className="w-12 h-12 rounded-full object-cover border border-gray-700 group-hover:border-gray-500 transition-colors flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium">@{u.username}</p>
              <p className="text-gray-500 text-sm">
                {u.listingCount === 0 ? 'No listings' : `${u.listingCount} listing${u.listingCount !== 1 ? 's' : ''}`}
              </p>
            </div>
            <span className="text-gray-600 group-hover:text-gray-400 transition-colors text-lg">→</span>
          </Link>
        ))}

        {users.length === 0 && (
          <div className="text-center py-16 text-gray-500">No collectors yet.</div>
        )}
      </div>
    </div>
  );
}
