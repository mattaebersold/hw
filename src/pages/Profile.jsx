import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ProfilePhotoUpload from '../components/ProfilePhotoUpload';
import ListingCard from '../components/ListingCard';
import ListingModal from '../components/ListingModal';
import api from '../services/api';

export default function Profile() {
  const { id } = useParams();
  const { user: currentUser, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [listings, setListings] = useState([]);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ bio: '', socialLinks: { facebook: '', instagram: '' } });
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState(null);

  const isOwn = currentUser && currentUser._id === id;

  useEffect(() => {
    api.get(`/users/${id}`).then(res => {
      setProfile(res.data.user);
      setListings(res.data.listings);
      setForm({ bio: res.data.user.bio || '', socialLinks: res.data.user.socialLinks || { facebook: '', instagram: '' } });
    }).catch(() => {});
  }, [id]);

  if (!profile) return <div className="text-center py-20 text-gray-500">Loading…</div>;

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.patch('/users/me', form);
      setProfile(res.data.user);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Profile header */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-8">
        <div className="flex items-start gap-5">
          {isOwn ? (
            <ProfilePhotoUpload user={profile} onUpdate={setProfile} />
          ) : (
            <img
              src={profile.profilePhoto || `https://api.dicebear.com/7.x/initials/svg?seed=${profile.name}`}
              alt={profile.name}
              className="w-24 h-24 rounded-full object-cover border-2 border-gray-700"
            />
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h1 className="text-2xl font-bold text-white">{profile.name}</h1>
              {isOwn && !editing && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditing(true)}
                    className="text-sm text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 px-3 py-1.5 rounded-xl transition-colors"
                  >
                    Edit profile
                  </button>
                  <button
                    onClick={async () => { await logout(); navigate('/'); }}
                    className="text-sm text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 px-3 py-1.5 rounded-xl transition-colors"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>

            {editing ? (
              <div className="mt-3 space-y-3">
                <textarea
                  rows={3}
                  placeholder="Tell collectors about yourself…"
                  value={form.bio}
                  onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                  className="w-full bg-gray-800 border border-gray-700 text-gray-200 text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-gray-500 resize-none"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    placeholder="Facebook handle"
                    value={form.socialLinks.facebook}
                    onChange={e => setForm(f => ({ ...f, socialLinks: { ...f.socialLinks, facebook: e.target.value } }))}
                    className="bg-gray-800 border border-gray-700 text-gray-200 text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-gray-500"
                  />
                  <input
                    placeholder="Instagram handle"
                    value={form.socialLinks.instagram}
                    onChange={e => setForm(f => ({ ...f, socialLinks: { ...f.socialLinks, instagram: e.target.value } }))}
                    className="bg-gray-800 border border-gray-700 text-gray-200 text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-gray-500"
                  />
                </div>
                <div className="flex gap-2">
                  <button onClick={handleSave} disabled={saving} className="bg-red-600 hover:bg-red-500 disabled:opacity-60 text-white text-sm px-4 py-2 rounded-xl transition-colors">
                    {saving ? 'Saving…' : 'Save'}
                  </button>
                  <button onClick={() => setEditing(false)} className="text-gray-400 hover:text-white text-sm px-4 py-2 rounded-xl border border-gray-700 hover:border-gray-500 transition-colors">
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                {profile.bio && <p className="text-gray-300 text-sm mt-2 leading-relaxed">{profile.bio}</p>}
                <div className="flex gap-4 mt-3">
                  {profile.socialLinks?.facebook && (
                    <a href={`https://facebook.com/${profile.socialLinks.facebook}`} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 text-sm transition-colors">
                      Facebook
                    </a>
                  )}
                  {profile.socialLinks?.instagram && (
                    <a href={`https://instagram.com/${profile.socialLinks.instagram}`} target="_blank" rel="noopener noreferrer" className="text-pink-400 hover:text-pink-300 text-sm transition-colors">
                      Instagram
                    </a>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Listings */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">
            Listings <span className="text-gray-500 font-normal text-sm">({listings.length})</span>
          </h2>
          {isOwn && (
            <Link to="/create" className="text-sm text-red-400 hover:text-red-300 transition-colors">+ New listing</Link>
          )}
        </div>

        {listings.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-4xl mb-3">🚗</p>
            <p>No listings yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {listings.map(l => (
              <ListingCard key={l._id} listing={l} onClick={() => setSelected(l)} />
            ))}
          </div>
        )}
      </div>

      {selected && <ListingModal listing={selected} onClose={() => setSelected(null)} />}

      {isOwn && (
        <div className="mt-12 pt-8 border-t border-gray-800">
          <Link
            to="/deleteData"
            className="text-sm text-red-700 hover:text-red-500 transition-colors"
          >
            Delete account and all data
          </Link>
        </div>
      )}
    </div>
  );
}
