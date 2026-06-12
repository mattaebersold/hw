import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ProfilePhotoUpload from '../components/ProfilePhotoUpload';
import ListingCard from '../components/ListingCard';
import ListingModal from '../components/ListingModal';
import api from '../services/api';

const TABS = ['Listings', 'Drafts', 'Watching'];

export default function Profile() {
  const { id } = useParams();
  const { user: currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [listings, setListings] = useState([]);       // published
  const [drafts, setDrafts] = useState([]);           // drafts + sold
  const [watchlist, setWatchlist] = useState([]);
  const [tab, setTab] = useState('Listings');
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

    if (isOwn) {
      api.get('/users/me/listings').then(res => {
        setDrafts(res.data.listings.filter(l => l.status === 'draft'));
      }).catch(() => {});
      api.get('/users/me/watchlist').then(res => {
        setWatchlist(res.data.listings);
      }).catch(() => {});
    }
  }, [id, isOwn]);

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

  const handleDeleteListing = async (e, listingId) => {
    e.stopPropagation();
    if (!window.confirm('Delete this listing?')) return;
    await api.delete(`/listings/${listingId}`);
    setListings(prev => prev.filter(l => l._id !== listingId));
    setDrafts(prev => prev.filter(l => l._id !== listingId));
  };

  const handleMarkSold = async (e, listingId) => {
    e.stopPropagation();
    const res = await api.post(`/listings/${listingId}/sold`);
    const updated = res.data.listing;
    setListings(prev => prev.filter(l => l._id !== listingId));
    setDrafts(prev => [updated, ...prev.filter(l => l._id !== listingId)]);
  };

  const handleRelist = async (e, listingId) => {
    e.stopPropagation();
    const res = await api.post(`/listings/${listingId}/relist`);
    const updated = res.data.listing;
    setDrafts(prev => prev.filter(l => l._id !== listingId));
    setListings(prev => [updated, ...prev]);
  };

  const handlePublish = async (e, listingId) => {
    e.stopPropagation();
    const res = await api.patch(`/listings/${listingId}`, { status: 'published' });
    const updated = res.data.listing;
    setDrafts(prev => prev.filter(l => l._id !== listingId));
    setListings(prev => [updated, ...prev]);
  };

  const visibleTabs = isOwn ? TABS : ['Listings'];

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
                    <a href={`https://facebook.com/${profile.socialLinks.facebook}`} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 text-sm transition-colors">Facebook</a>
                  )}
                  {profile.socialLinks?.instagram && (
                    <a href={`https://instagram.com/${profile.socialLinks.instagram}`} target="_blank" rel="noopener noreferrer" className="text-pink-400 hover:text-pink-300 text-sm transition-colors">Instagram</a>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-900 border border-gray-800 rounded-2xl p-1">
        {visibleTabs.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 text-sm font-medium py-2 rounded-xl transition-colors ${
              tab === t ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            {t === 'Listings' && `Listings${listings.length ? ` (${listings.length})` : ''}`}
            {t === 'Drafts' && `Drafts${drafts.length ? ` (${drafts.length})` : ''}`}
            {t === 'Watching' && `Watching${watchlist.length ? ` (${watchlist.length})` : ''}`}
          </button>
        ))}
      </div>

      {/* Listings tab */}
      {tab === 'Listings' && (
        <div>
          {isOwn && (
            <div className="flex justify-end mb-4">
              <Link to="/create" className="text-sm text-red-400 hover:text-red-300 transition-colors">+ New listing</Link>
            </div>
          )}
          {listings.length === 0 ? (
            <EmptyState emoji="🚗" text="No listings yet" />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {listings.map(l => (
                <div key={l._id} className="relative group/wrap">
                  <ListingCard listing={l} onClick={() => setSelected(l)} />
                  {isOwn && (
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover/wrap:opacity-100 transition-all">
                      <button
                        onClick={e => handleMarkSold(e, l._id)}
                        className="bg-gray-900/90 hover:bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded-lg transition-colors"
                        title="Mark as sold"
                      >
                        Sold
                      </button>
                      <button
                        onClick={e => handleDeleteListing(e, l._id)}
                        className="w-7 h-7 bg-gray-900/90 hover:bg-red-700 text-gray-400 hover:text-white rounded-full flex items-center justify-center text-xs transition-all"
                        title="Delete listing"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Drafts tab */}
      {tab === 'Drafts' && isOwn && (
        <div>
          {drafts.length === 0 ? (
            <EmptyState emoji="📝" text="No drafts" />
          ) : (
            <div className="space-y-3">
              {drafts.map(l => (
                <div key={l._id} className="bg-gray-900 border border-gray-800 rounded-2xl p-4 flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-gray-800 overflow-hidden flex-shrink-0">
                    {l.photos?.[0] ? (
                      <img src={l.photos[0]} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">🚗</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{l.title || 'Untitled'}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {l.isSold ? (
                        <span className="text-xs bg-green-900 text-green-300 px-2 py-0.5 rounded-full">Sold</span>
                      ) : (
                        <span className="text-xs bg-gray-700 text-gray-400 px-2 py-0.5 rounded-full">Draft</span>
                      )}
                      {l.price != null && <span className="text-xs text-gray-500">${l.price}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {l.isSold ? (
                      <button
                        onClick={e => handleRelist(e, l._id)}
                        className="text-xs bg-red-600 hover:bg-red-500 text-white px-3 py-1.5 rounded-xl transition-colors"
                      >
                        Re-list
                      </button>
                    ) : (
                      <button
                        onClick={e => handlePublish(e, l._id)}
                        className="text-xs bg-red-600 hover:bg-red-500 text-white px-3 py-1.5 rounded-xl transition-colors"
                      >
                        Publish
                      </button>
                    )}
                    <button
                      onClick={e => handleDeleteListing(e, l._id)}
                      className="w-7 h-7 bg-gray-800 hover:bg-red-700 text-gray-400 hover:text-white rounded-full flex items-center justify-center text-xs transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Watching tab */}
      {tab === 'Watching' && isOwn && (
        <div>
          {watchlist.length === 0 ? (
            <EmptyState emoji="★" text="Nothing on your watchlist yet — star listings to save them here" />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {watchlist.map(l => (
                <ListingCard key={l._id} listing={l} onClick={() => setSelected(l)} />
              ))}
            </div>
          )}
        </div>
      )}

      {selected && (
        <ListingModal
          listing={selected}
          onClose={() => setSelected(null)}
          onSold={(updated) => {
            setListings(prev => prev.filter(l => l._id !== updated._id));
            setDrafts(prev => [updated, ...prev.filter(l => l._id !== updated._id)]);
          }}
        />
      )}

      {isOwn && (
        <div className="mt-12 pt-8 border-t border-gray-800">
          <Link to="/deleteData" className="text-sm text-red-700 hover:text-red-500 transition-colors">
            Delete account and all data
          </Link>
        </div>
      )}
    </div>
  );
}

function EmptyState({ emoji, text }) {
  return (
    <div className="text-center py-12 text-gray-500">
      <p className="text-4xl mb-3">{emoji}</p>
      <p>{text}</p>
    </div>
  );
}
