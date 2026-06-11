import { useEffect, useState, useCallback } from 'react';
import api from '../services/api';
import ListingCard from '../components/ListingCard';
import ListingFilters from '../components/ListingFilters';
import ListingModal from '../components/ListingModal';

export default function Home() {
  const [listings, setListings] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState({ sort: 'newest', page: 1 });

  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== '' && v != null));
      const res = await api.get('/listings', { params });
      setListings(res.data.listings);
      setTotal(res.data.total);
      setPages(res.data.pages);
    } catch {
      setListings([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchListings(); }, [fetchListings]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Marketplace</h1>
          {!loading && <p className="text-gray-400 text-sm mt-0.5">{total} listing{total !== 1 ? 's' : ''}</p>}
        </div>
        <button
          onClick={() => setFiltersOpen(o => !o)}
          className="lg:hidden flex items-center gap-2 bg-gray-800 border border-gray-700 text-sm text-gray-300 px-4 py-2 rounded-xl hover:border-gray-500 transition-colors"
        >
          <span>⚙</span> Filters
        </button>
      </div>

      <div className="flex gap-8">
        {/* Sidebar filters — desktop */}
        <div className="hidden lg:block w-56 shrink-0">
          <ListingFilters filters={filters} onChange={setFilters} />
        </div>

        {/* Mobile filter drawer */}
        {filtersOpen && (
          <div className="fixed inset-0 z-40 flex lg:hidden">
            <div className="absolute inset-0 bg-black/60" onClick={() => setFiltersOpen(false)} />
            <div className="relative ml-auto w-72 bg-gray-900 h-full overflow-y-auto p-6 border-l border-gray-800">
              <div className="flex justify-between items-center mb-6">
                <span className="font-semibold text-white">Filters</span>
                <button onClick={() => setFiltersOpen(false)} className="text-gray-400 hover:text-white text-xl">✕</button>
              </div>
              <ListingFilters filters={filters} onChange={(f) => { setFilters(f); setFiltersOpen(false); }} />
            </div>
          </div>
        )}

        {/* Listings grid */}
        <div className="flex-1 min-w-0">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl aspect-square animate-pulse" />
              ))}
            </div>
          ) : listings.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              <p className="text-5xl mb-4">🚗</p>
              <p className="text-lg font-medium text-gray-400">No listings found</p>
              <p className="text-sm mt-1">Try adjusting your filters</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                {listings.map(l => (
                  <ListingCard key={l._id} listing={l} onClick={() => setSelected(l)} />
                ))}
              </div>

              {/* Pagination */}
              {pages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
                    <button
                      key={p}
                      onClick={() => setFilters(f => ({ ...f, page: p }))}
                      className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                        filters.page === p
                          ? 'bg-red-600 text-white'
                          : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {selected && <ListingModal listing={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
