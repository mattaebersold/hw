import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';


const RARITY_COLOR = {
  'Common': 'bg-gray-700 text-gray-300',
  'Uncommon': 'bg-green-900 text-green-300',
  'Rare': 'bg-blue-900 text-blue-300',
  'Super Rare': 'bg-purple-900 text-purple-300',
  'Limited Edition': 'bg-yellow-900 text-yellow-300',
};

export default function ListingModal({ listing: initialListing, onClose, onSold }) {
  const { user, toggleWatch } = useAuth();
  const overlayRef = useRef(null);
  const [listing, setListing] = useState(initialListing);
  const [photoIdx, setPhotoIdx] = useState(0);
  const [message, setMessage] = useState('');
  const [contactStatus, setContactStatus] = useState('idle');
  const [markingSold, setMarkingSold] = useState(false);
  const isOwner = user && listing.seller && user._id === (listing.seller._id || listing.seller);
  const isWatched = user?.watchlist?.some(id => id.toString() === listing._id.toString());

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose();
  };

  const handleMarkSold = async () => {
    if (!window.confirm('Mark this listing as sold? It will be unpublished.')) return;
    setMarkingSold(true);
    try {
      const res = await api.post(`/listings/${listing._id}/sold`);
      setListing(res.data.listing);
      onSold?.(res.data.listing);
      onClose();
    } catch {
      setMarkingSold(false);
    }
  };

  const handleContact = async (e) => {
    e.preventDefault();
    setContactStatus('sending');
    try {
      await api.post(`/listings/${listing._id}/contact`, { message });
      setContactStatus('sent');
    } catch (err) {
      setContactStatus(err.response?.data?.error || 'error');
    }
  };

  const photos = listing.photos || [];
  const rarityClass = RARITY_COLOR[listing.rarity] || RARITY_COLOR['Common'];

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <div className="bg-gray-900 border border-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h2 className="text-lg font-semibold text-white pr-4">{listing.title}</h2>
          <div className="flex items-center gap-3 shrink-0">
            {user && (
              <button
                onClick={() => toggleWatch(listing._id)}
                className="text-xl leading-none transition-colors"
                title={isWatched ? 'Remove from watchlist' : 'Watch this listing'}
              >
                <span className={isWatched ? 'text-yellow-400' : 'text-gray-500 hover:text-yellow-400'}>
                  {isWatched ? '★' : '☆'}
                </span>
              </button>
            )}
            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors text-2xl leading-none">✕</button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-0">
          {/* Left — photos */}
          <div className="p-6 border-r border-gray-800">
            <div className="aspect-square bg-gray-800 rounded-xl overflow-hidden mb-3">
              {photos.length > 0 ? (
                <img src={photos[photoIdx]} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-7xl">🚗</div>
              )}
            </div>
            {photos.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {photos.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => setPhotoIdx(i)}
                    className={`shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-colors ${i === photoIdx ? 'border-red-500' : 'border-gray-700 hover:border-gray-500'}`}
                  >
                    <img src={p} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right — details */}
          <div className="p-6 space-y-5">
            {/* Price & tags */}
            <div className="space-y-3">
              {listing.price != null && (
                <p className="text-3xl font-bold text-red-400">${listing.price}</p>
              )}
              {listing.estimatedValueLow != null && (
                <p className="text-sm text-gray-500">
                  Estimated value: ${listing.estimatedValueLow}–${listing.estimatedValueHigh}
                </p>
              )}
              <div className="flex flex-wrap gap-1.5">
                {listing.brand && <Tag>{listing.brand}</Tag>}
                {listing.rarity && <span className={`text-xs px-2 py-0.5 rounded-full ${rarityClass}`}>{listing.rarity}</span>}
                {listing.isLimitedEdition && <span className="bg-red-900 text-red-300 text-xs px-2 py-0.5 rounded-full">Limited Edition</span>}
                {listing.condition && <Tag>{listing.condition}</Tag>}
              </div>
            </div>

            {/* Car details */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              {listing.make && <Detail label="Make" value={listing.make} />}
              {listing.model && <Detail label="Model" value={listing.model} />}
              {listing.series && <Detail label="Series" value={listing.series} />}
              {listing.year && <Detail label="Year" value={listing.year} />}
            </div>

            {listing.description && (
              <p className="text-gray-300 text-sm leading-relaxed">{listing.description}</p>
            )}
            {/* {listing.aiNotes && (
              <div className="bg-gray-800 rounded-xl p-3">
                <p className="text-xs text-gray-400 font-medium mb-1">AI Notes</p>
                <p className="text-gray-300 text-sm">{listing.aiNotes}</p>
              </div>
            )} */}

            {/* Seller */}
            {listing.seller?.name && (
              <Link
                to={`/profile/${listing.seller._id}`}
                onClick={onClose}
                className="flex items-center gap-3 p-3 bg-gray-800 rounded-xl hover:bg-gray-750 transition-colors"
              >
                <img
                  src={listing.seller.profilePhoto || `https://api.dicebear.com/7.x/initials/svg?seed=${listing.seller.name}`}
                  alt=""
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="text-white text-sm font-medium">{listing.seller.name}</p>
                  <p className="text-gray-400 text-xs">View profile</p>
                </div>
              </Link>
            )}

            {/* Owner actions */}
            {isOwner ? (
              <div className="space-y-2">
                <Link
                  to={`/listings/${listing._id}/edit`}
                  onClick={onClose}
                  className="block w-full text-center bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium py-2.5 rounded-xl transition-colors"
                >
                  Edit Listing
                </Link>
                <button
                  onClick={handleMarkSold}
                  disabled={markingSold}
                  className="w-full bg-gray-800 hover:bg-gray-700 disabled:opacity-60 text-gray-300 text-sm font-medium py-2.5 rounded-xl transition-colors border border-gray-700"
                >
                  {markingSold ? 'Marking sold…' : 'Mark as Sold'}
                </button>
              </div>
            ) : (
              /* Contact form */
              contactStatus === 'sent' ? (
                <div className="bg-green-900/40 border border-green-700 text-green-300 text-sm rounded-xl p-4 text-center">
                  Message sent! The seller will reply to your email.
                </div>
              ) : user ? (
                <form onSubmit={handleContact} className="space-y-3">
                  <p className="text-sm font-medium text-white">Contact Seller</p>
                  <p className="text-xs text-gray-500">Sending as {user.name}</p>
                  <textarea
                    required
                    rows={3}
                    placeholder="I'm interested in this listing…"
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 text-gray-200 text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-gray-500 resize-none"
                  />
                  {contactStatus !== 'idle' && contactStatus !== 'sending' && (
                    <p className="text-red-400 text-xs">{typeof contactStatus === 'string' && contactStatus !== 'error' ? contactStatus : 'Something went wrong. Please try again.'}</p>
                  )}
                  <button
                    type="submit"
                    disabled={contactStatus === 'sending'}
                    className="w-full bg-red-600 hover:bg-red-500 disabled:opacity-60 text-white text-sm font-medium py-2.5 rounded-xl transition-colors"
                  >
                    {contactStatus === 'sending' ? 'Sending…' : 'Send Message'}
                  </button>
                </form>
              ) : (
                <div className="text-center text-sm text-gray-500 py-2">
                  <a href="/login" className="text-red-400 hover:text-red-300">Sign in</a> to contact the seller.
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Tag({ children }) {
  return <span className="bg-gray-800 text-gray-400 text-xs px-2 py-0.5 rounded-full">{children}</span>;
}

function Detail({ label, value }) {
  return (
    <div>
      <span className="text-gray-500">{label}: </span>
      <span className="text-gray-200">{value}</span>
    </div>
  );
}
