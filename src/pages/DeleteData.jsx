import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { serverUrl } from '../services/api';
import axios from 'axios';

export default function DeleteData() {
  const { user, loading, setUser } = useAuth();
  const navigate = useNavigate();
  const [confirmed, setConfirmed] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  if (loading) return null;

  if (!user) {
    return (
      <div className="max-w-sm mx-auto mt-12 text-center space-y-4">
        <p className="text-gray-300">You must be signed in to delete your data.</p>
        <Link to="/login" className="inline-block bg-red-600 hover:bg-red-500 text-white text-sm font-medium px-6 py-2.5 rounded-xl transition-colors">
          Sign in
        </Link>
      </div>
    );
  }

  const handleDelete = async () => {
    if (!confirmed) return;
    setDeleting(true);
    setError('');
    try {
      await axios.delete(`${serverUrl}/auth/account`, { withCredentials: true });
      setUser(null);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12">
      <div className="bg-gray-900 border border-red-900 rounded-2xl p-8 space-y-6">
        <div className="text-center space-y-2">
          <p className="text-4xl">⚠️</p>
          <h1 className="text-2xl font-bold text-white">Delete your account</h1>
          <p className="text-gray-400 text-sm">This is permanent and cannot be undone.</p>
        </div>

        <div className="bg-gray-800 rounded-xl p-4 space-y-2 text-sm text-gray-300">
          <p className="font-medium text-white">This will permanently delete:</p>
          <ul className="space-y-1 text-gray-400">
            <li>• Your profile (@{user.username || user.email})</li>
            <li>• All your listings</li>
            <li>• All your account data</li>
          </ul>
        </div>

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={e => setConfirmed(e.target.checked)}
            className="mt-0.5 rounded"
          />
          <span className="text-sm text-gray-300">
            I understand this is permanent and I want to delete my account and all my data.
          </span>
        </label>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <div className="flex gap-3">
          <Link
            to={`/profile/${user._id}`}
            className="flex-1 text-center bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium py-2.5 rounded-xl transition-colors"
          >
            Cancel
          </Link>
          <button
            onClick={handleDelete}
            disabled={!confirmed || deleting}
            className="flex-1 bg-red-700 hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium py-2.5 rounded-xl transition-colors"
          >
            {deleting ? 'Deleting…' : 'Delete everything'}
          </button>
        </div>
      </div>
    </div>
  );
}
