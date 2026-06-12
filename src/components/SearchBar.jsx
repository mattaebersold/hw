import { useEffect, useRef, useState } from 'react';
import api from '../services/api';

export default function SearchBar({ value, onChange }) {
  const [input, setInput] = useState(value || '');
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const debounceRef = useRef(null);
  const containerRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Sync if parent clears the value
  useEffect(() => {
    if (value === '' && input !== '') { setInput(''); setSuggestions([]); setOpen(false); }
  }, [value]);

  const fetchSuggestions = (q) => {
    clearTimeout(debounceRef.current);
    if (!q.trim()) { setSuggestions([]); setOpen(false); return; }
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await api.get('/listings', { params: { q, limit: 6 } });
        setSuggestions(res.data.listings || []);
        setOpen(true);
      } catch { setSuggestions([]); }
    }, 250);
  };

  const handleChange = (e) => {
    setInput(e.target.value);
    fetchSuggestions(e.target.value);
  };

  const handleSelect = (listing) => {
    const q = listing.title;
    setInput(q);
    setSuggestions([]);
    setOpen(false);
    onChange(q);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setOpen(false);
    onChange(input.trim());
  };

  const handleClear = () => {
    setInput('');
    setSuggestions([]);
    setOpen(false);
    onChange('');
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 text-sm">🔍</span>
          <input
            type="text"
            value={input}
            onChange={handleChange}
            onFocus={() => { setFocused(true); if (suggestions.length) setOpen(true); }}
            onBlur={() => setFocused(false)}
            placeholder="Search make, model, brand, series…"
            className="w-full bg-gray-900 border border-gray-700 hover:border-gray-600 focus:border-gray-500 text-gray-200 text-sm rounded-2xl pl-9 pr-9 py-3 focus:outline-none transition-colors"
          />
          {input && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
            >
              ✕
            </button>
          )}
        </div>
      </form>

      {open && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1.5 bg-gray-900 border border-gray-800 rounded-2xl shadow-xl shadow-black/40 overflow-hidden">
          {suggestions.map((l) => (
            <button
              key={l._id}
              onMouseDown={() => handleSelect(l)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-800 transition-colors text-left"
            >
              {l.photos?.[0] ? (
                <img src={l.photos[0]} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0 bg-gray-800" />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center text-lg flex-shrink-0">🚗</div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white truncate">{l.title}</p>
                <p className="text-xs text-gray-500 truncate">
                  {[l.brand, l.make, l.model].filter(Boolean).join(' · ')}
                  {l.price != null && <span className="text-red-400 ml-2">${l.price}</span>}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
