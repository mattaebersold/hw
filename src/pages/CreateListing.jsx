import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PhotoCapture from '../components/PhotoCapture';
import AiDraftForm from '../components/AiDraftForm';
import api, { serverUrl } from '../services/api';
import axios from 'axios';

const aiToDraft = (ai) => ({
  title: ai.suggestedTitle || '',
  description: ai.suggestedDescription || '',
  brand: ai.brand || '',
  make: ai.make || '',
  model: ai.model || '',
  series: ai.series || '',
  year: ai.year || '',
  condition: ai.condition || '',
  rarity: ai.rarity || '',
  isLimitedEdition: ai.isLimitedEdition || false,
  estimatedValueLow: ai.estimatedValueLow,
  estimatedValueHigh: ai.estimatedValueHigh,
  aiNotes: ai.aiNotes || '',
  price: ai.estimatedValueHigh ? String(Math.ceil(ai.estimatedValueHigh * 0.9)) : '',
});

export default function CreateListing() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState('photo');
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState(null);
  const [capturedFile, setCapturedFile] = useState(null);
  const [ebayInfo, setEbayInfo] = useState(null);
  const [draft, setDraft] = useState({});
  const [publishing, setPublishing] = useState(false);

  if (!loading && !user) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400 text-lg mb-4">Sign in to create a listing.</p>
        <div className="flex justify-center gap-3">
          <a href={`${serverUrl}/auth/google`} className="bg-white text-gray-900 text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-gray-100 transition-colors">Sign in with Google</a>
          <Link to="/login" className="bg-gray-800 border border-gray-700 text-gray-300 text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-gray-700 transition-colors">Email / Password</Link>
        </div>
      </div>
    );
  }

  const handleCapture = async (file) => {
    setCapturedFile(file);
    setAnalyzing(true);
    setAnalyzeError(null);
    try {
      const formData = new FormData();
      formData.append('photo', file);
      const res = await axios.post(`${serverUrl}/api/analyze-photo`, formData, { withCredentials: true });
      const result = res.data.result;
      setDraft(aiToDraft(result));
      setEbayInfo(result.ebayListingCount ? {
        low: result.estimatedValueLow,
        high: result.estimatedValueHigh,
        avg: result.ebayAvgPrice,
        count: result.ebayListingCount,
        query: result.ebayQuery,
      } : null);
      setStep('confirm');
    } catch (err) {
      setAnalyzeError(err.response?.data?.error || 'Failed. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handlePublish = async () => {
    if (!draft.title) return alert('Please add a title.');
    if (!draft.price) return alert('Please set a price.');
    setPublishing(true);
    try {
      const res = await api.post('/listings', { ...draft, price: Number(draft.price), status: 'published' });
      const listingId = res.data.listing._id;

      if (capturedFile) {
        const formData = new FormData();
        formData.append('photo', capturedFile);
        await axios.post(`${serverUrl}/api/listings/${listingId}/photos`, formData, { withCredentials: true });
      }

      navigate(`/profile/${user._id}`);
    } catch (err) {
      alert(err.response?.data?.error || 'Publish failed. Please try again.');
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-2">List a Car</h1>
      <p className="text-gray-400 text-sm mb-8">Take or upload a photo</p>

      {step === 'photo' && (
        <>
          {analyzing ? (
            <div className="text-center py-16 space-y-4">
              <div className="text-5xl animate-bounce">🔍</div>
              <p className="text-white font-medium">Analyzing…</p>
              <p className="text-gray-400 text-sm">Identifying make, model, series, and condition</p>
            </div>
          ) : (
            <>
              <PhotoCapture onCapture={handleCapture} />
              {analyzeError && <p className="text-red-400 text-sm mt-3 text-center">{analyzeError}</p>}
            </>
          )}
        </>
      )}

      {step === 'confirm' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-green-400 text-sm font-medium">Complete</p>
            <button
              onClick={() => { setStep('photo'); setDraft({}); setEbayInfo(null); }}
              className="text-gray-400 hover:text-white text-sm transition-colors"
            >
              ← Retake
            </button>
          </div>

          {ebayInfo && (
            <div className="bg-gray-800/60 border border-gray-700 rounded-xl px-4 py-3 text-xs text-gray-400">
              eBay reference: <span className="text-white">${ebayInfo.low}–${ebayInfo.high}</span>
              <span className="text-gray-500"> ({ebayInfo.count} active listings, avg ${ebayInfo.avg})</span>
            </div>
          )}

          <AiDraftForm data={draft} onChange={setDraft} />

          <button
            onClick={handlePublish}
            disabled={publishing}
            className="w-full bg-red-600 hover:bg-red-500 disabled:opacity-60 text-white font-medium py-3 rounded-xl transition-colors"
          >
            {publishing ? 'Publishing…' : 'Publish Listing'}
          </button>
        </div>
      )}
    </div>
  );
}
