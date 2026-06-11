import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AiDraftForm from '../components/AiDraftForm';
import api, { serverUrl } from '../services/api';
import axios from 'axios';

export default function EditListing() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const photoInputRef = useRef(null);

  const [listing, setListing] = useState(null);
  const [draft, setDraft] = useState({});
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  useEffect(() => {
    api.get(`/listings/${id}`).then(res => {
      const l = res.data.listing;
      setListing(l);
      setDraft({
        title: l.title, description: l.description, price: l.price,
        brand: l.brand, make: l.make, model: l.model, series: l.series,
        year: l.year, condition: l.condition, rarity: l.rarity,
        isLimitedEdition: l.isLimitedEdition, aiNotes: l.aiNotes,
        estimatedValueLow: l.estimatedValueLow, estimatedValueHigh: l.estimatedValueHigh,
      });
    }).catch(() => navigate('/'));
  }, [id, navigate]);

  if (!listing) return <div className="text-center py-20 text-gray-500">Loading…</div>;

  const isOwner = user && user._id === (listing.seller?._id || listing.seller);
  if (!isOwner) return <div className="text-center py-20 text-gray-400">You don't own this listing.</div>;

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.patch(`/listings/${id}`, draft);
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    setPublishing(true);
    try {
      await api.patch(`/listings/${id}`, { ...draft, status: 'published' });
      navigate('/');
    } finally {
      setPublishing(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this listing permanently?')) return;
    setDeleting(true);
    try {
      await api.delete(`/listings/${id}`);
      navigate('/');
    } finally {
      setDeleting(false);
    }
  };

  const handleAddPhoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append('photo', file);
      const res = await axios.post(`${serverUrl}/api/listings/${id}/photos`, formData, { withCredentials: true });
      setListing(res.data.listing);
    } finally {
      setUploadingPhoto(false);
      e.target.value = '';
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Edit Listing</h1>
        <span className={`text-xs px-3 py-1 rounded-full ${listing.status === 'published' ? 'bg-green-900 text-green-300' : 'bg-gray-700 text-gray-400'}`}>
          {listing.status}
        </span>
      </div>

      {/* Photos */}
      <div className="mb-6">
        <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wide">Photos</label>
        <div className="flex gap-2 flex-wrap">
          {listing.photos?.map((p, i) => (
            <div key={i} className="w-20 h-20 rounded-xl overflow-hidden bg-gray-800">
              <img src={p} alt="" className="w-full h-full object-cover" />
            </div>
          ))}
          <button
            onClick={() => photoInputRef.current?.click()}
            disabled={uploadingPhoto}
            className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-700 hover:border-gray-500 flex items-center justify-center text-gray-500 hover:text-gray-300 transition-colors text-2xl disabled:opacity-50"
          >
            {uploadingPhoto ? '…' : '+'}
          </button>
          <input ref={photoInputRef} type="file" accept="image/*" capture="environment" onChange={handleAddPhoto} className="hidden" />
        </div>
      </div>

      <AiDraftForm data={draft} onChange={setDraft} />

      <div className="flex gap-3 mt-8">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex-1 bg-gray-700 hover:bg-gray-600 disabled:opacity-60 text-white font-medium py-3 rounded-xl transition-colors text-sm"
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
        {listing.status !== 'published' && (
          <button
            onClick={handlePublish}
            disabled={publishing}
            className="flex-1 bg-red-600 hover:bg-red-500 disabled:opacity-60 text-white font-medium py-3 rounded-xl transition-colors text-sm"
          >
            {publishing ? 'Publishing…' : 'Publish'}
          </button>
        )}
      </div>

      <div className="mt-4 flex justify-between">
        <Link to="/" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">← Back to marketplace</Link>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="text-red-600 hover:text-red-400 text-sm transition-colors disabled:opacity-50"
        >
          {deleting ? 'Deleting…' : 'Delete listing'}
        </button>
      </div>
    </div>
  );
}
