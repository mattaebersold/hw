const RARITY_COLOR = {
  'Common': 'bg-gray-700 text-gray-300',
  'Uncommon': 'bg-green-900 text-green-300',
  'Rare': 'bg-blue-900 text-blue-300',
  'Super Rare': 'bg-purple-900 text-purple-300',
  'Ultra Rare': 'bg-yellow-900 text-yellow-300',
};

export default function ListingCard({ listing, onClick }) {
  const photo = listing.photos?.[0];
  const rarityClass = RARITY_COLOR[listing.rarity] || RARITY_COLOR['Common'];

  return (
    <button
      onClick={onClick}
      className="group bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden text-left hover:border-gray-600 hover:shadow-lg hover:shadow-black/40 transition-all duration-200 hover:-translate-y-0.5 w-full"
    >
      <div className="aspect-square bg-gray-800 overflow-hidden">
        {photo ? (
          <img
            src={photo}
            alt={listing.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl">🚗</div>
        )}
      </div>

      <div className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-white text-sm leading-tight line-clamp-2">{listing.title || 'Untitled'}</h3>
          {listing.price != null && (
            <span className="text-red-400 font-bold text-sm whitespace-nowrap">${listing.price}</span>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5">
          {listing.brand && (
            <span className="bg-gray-800 text-gray-400 text-xs px-2 py-0.5 rounded-full">{listing.brand}</span>
          )}
          {listing.rarity && (
            <span className={`text-xs px-2 py-0.5 rounded-full ${rarityClass}`}>{listing.rarity}</span>
          )}
          {listing.isLimitedEdition && (
            <span className="bg-red-900 text-red-300 text-xs px-2 py-0.5 rounded-full">Limited</span>
          )}
        </div>

        {listing.condition && (
          <p className="text-gray-500 text-xs">{listing.condition}</p>
        )}

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
    </button>
  );
}
