import { useEffect, useState } from 'react';
import api from '../services/api';

const CONDITIONS = ['Mint in Box', 'Near Mint', 'Good', 'Fair', 'Poor'];
const RARITIES = ['Common', 'Uncommon', 'Rare', 'Super Rare', 'Ultra Rare'];
const SORTS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
];

export default function ListingFilters({ filters, onChange }) {
  const [meta, setMeta] = useState({ brands: [], series: [] });

  useEffect(() => {
    api.get('/listings/meta/filters').then(r => setMeta(r.data)).catch(() => {});
  }, []);

  const set = (key, value) => onChange({ ...filters, [key]: value, page: 1 });
  const clear = () => onChange({ sort: 'newest', page: 1 });

  const hasFilters = Object.keys(filters).some(k => k !== 'sort' && k !== 'page' && filters[k]);

  return (
    <aside className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-white">Filters</h2>
        {hasFilters && (
          <button onClick={clear} className="text-xs text-red-400 hover:text-red-300 transition-colors">Clear all</button>
        )}
      </div>

      {/* Sort */}
      <div>
        <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wide">Sort by</label>
        <select
          value={filters.sort || 'newest'}
          onChange={e => set('sort', e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 text-gray-200 text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-gray-500"
        >
          {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>

      {/* Price range */}
      <div>
        <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wide">Price Range</label>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min"
            value={filters.minPrice || ''}
            onChange={e => set('minPrice', e.target.value)}
            className="w-1/2 bg-gray-800 border border-gray-700 text-gray-200 text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-gray-500"
          />
          <input
            type="number"
            placeholder="Max"
            value={filters.maxPrice || ''}
            onChange={e => set('maxPrice', e.target.value)}
            className="w-1/2 bg-gray-800 border border-gray-700 text-gray-200 text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-gray-500"
          />
        </div>
      </div>

      {/* Brand */}
      {meta.brands.length > 0 && (
        <FilterGroup
          label="Brand"
          options={meta.brands}
          value={filters.brand}
          onChange={v => set('brand', v)}
        />
      )}

      {/* Series */}
      {meta.series.length > 0 && (
        <FilterGroup
          label="Series"
          options={meta.series}
          value={filters.series}
          onChange={v => set('series', v)}
        />
      )}

      {/* Condition */}
      <FilterGroup
        label="Condition"
        options={CONDITIONS}
        value={filters.condition}
        onChange={v => set('condition', v)}
      />

      {/* Rarity */}
      <FilterGroup
        label="Rarity"
        options={RARITIES}
        value={filters.rarity}
        onChange={v => set('rarity', v)}
      />

      {/* Limited Edition */}
      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.isLimitedEdition === 'true'}
            onChange={e => set('isLimitedEdition', e.target.checked ? 'true' : '')}
            className="rounded"
          />
          <span className="text-sm text-gray-300">Limited Edition only</span>
        </label>
      </div>
    </aside>
  );
}

function FilterGroup({ label, options, value, onChange }) {
  return (
    <div>
      <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wide">{label}</label>
      <div className="flex flex-wrap gap-1.5">
        {options.map(opt => (
          <button
            key={opt}
            onClick={() => onChange(value === opt ? '' : opt)}
            className={`text-xs px-3 py-1 rounded-full border transition-colors ${
              value === opt
                ? 'bg-red-600 border-red-600 text-white'
                : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-500 hover:text-gray-200'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
