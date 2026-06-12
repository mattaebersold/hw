import { useAuth } from '../context/AuthContext';

const RARITY_COLOR = {
  'Common': 'bg-gray-700 text-gray-300',
  'Uncommon': 'bg-green-900 text-green-300',
  'Rare': 'bg-blue-900 text-blue-300',
  'Super Rare': 'bg-purple-900 text-purple-300',
  'Limited Edition': 'bg-yellow-900 text-yellow-300',
};

export default function ListingCard({ listing, onClick }) {
  const { user, toggleWatch } = useAuth();
  const photo = listing.photos?.[0];
  const rarityClass = RARITY_COLOR[listing.rarity] || RARITY_COLOR['Common'];
  const isWatched = user?.watchlist?.some(id => id.toString() === listing._id.toString());

  const handleStar = (e) => {
    e.stopPropagation();
    toggleWatch(listing._id);
  };

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onClick?.()}
      className="group bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden text-left transition-all duration-200 w-full cursor-pointer"
    >
      <div className="aspect-square bg-gray-800 overflow-hidden relative">
        {photo ? (
          <img
            src={photo}
            alt={listing.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl">🚗</div>
        )}
        {user && (
          <button
            onClick={handleStar}
            className="absolute top-2 left-2 w-7 h-7 rounded-full bg-gray-900/80 hover:bg-gray-900 flex items-center justify-center transition-colors"
            title={isWatched ? 'Remove from watchlist' : 'Add to watchlist'}
          >
            <span className={`text-lg leading-none ${isWatched ? 'text-yellow-400' : 'text-gray-500 hover:text-yellow-400'}`}>
              {isWatched ? '★' : '☆'}
            </span>
          </button>
        )}

        <div className="flex gap-1 flex-col absolute bottom-1 right-1">
          {listing.brand && listing.brand !== "Unknown" && (
            <span className="inline bg-gray-800 text-gray-400 font-bold text-[9px] px-2 py-0.5 rounded-full text-center">{listing.brand}</span>
          )}
          {listing.rarity && (
            <span className={`inline font-bold text-[9px] px-2 py-0.5 rounded-full text-center ${rarityClass}`}>{listing.rarity}</span>
          )}
        </div>
      </div>

      <div className="p-3 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-white text-sm leading-tight line-clamp-2">{listing.title || 'Untitled'}</h3>
          {listing.price != null && (
            <span className="text-red-400 font-bold text-sm whitespace-nowrap">${listing.price}</span>
          )}
        </div>

        

        {listing.seller && (
          <div className="flex items-center gap-1.5 pt-1 border-t border-gray-800">
            <img
              src={listing.seller.profilePhoto || `https://api.dicebear.com/7.x/initials/svg?seed=${listing.seller.name}`}
              alt=""
              className="w-5 h-5 rounded-full object-cover"
            />
            <span className="text-gray-500 text-xs truncate">{listing.seller.name}</span>
          </div>
        )}
      </div>
    </div>
  );
}
