import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PhotoCapture from '../components/PhotoCapture';
import api, { serverUrl } from '../services/api';
import axios from 'axios';

export default function CreateListing() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState('photo');
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState(null);
  const [capturedFile, setCapturedFile] = useState(null);
  const [ai, setAi] = useState(null);
  const [price, setPrice] = useState('');
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
      setAi(result);
      setPrice(result.estimatedValueHigh ? String(Math.ceil(result.estimatedValueHigh * 0.9)) : '');
      setStep('confirm');
    } catch (err) {
      setAnalyzeError(err.response?.data?.error || 'AI analysis failed. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handlePublish = async () => {
    if (!price) return alert('Please set a price.');
    setPublishing(true);
    try {
      const res = await api.post('/listings', {
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
        price: Number(price),
        status: 'published',
      });
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
      <h1 className="text-2xl font-bold text-white mb-2">List</h1>
      <p className="text-gray-400 text-sm mb-8">Take or upload a photo</p>

      {step === 'photo' && (
        <>
          {analyzing ? (
            <div className="text-center py-16 space-y-4">
              <div className="text-5xl animate-bounce">🔍</div>
              <p className="text-white font-medium">Analyzing...</p>
            </div>
          ) : (
            <>
              <PhotoCapture onCapture={handleCapture} />
              {analyzeError && <p className="text-red-400 text-sm mt-3 text-center">{analyzeError}</p>}
            </>
          )}
        </>
      )}

      {step === 'confirm' && ai && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <p className="text-green-400 text-sm font-medium">Complete</p>
            <button onClick={() => { setStep('photo'); setAi(null); }} className="text-gray-400 hover:text-white text-sm transition-colors">← Retake</button>
          </div>

          {/* AI summary */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-3">
            <p className="text-white font-semibold">{ai.suggestedTitle}</p>

            <div className="flex flex-wrap gap-2">
              {ai.brand && <Chip>{ai.brand}</Chip>}
              {ai.condition && <Chip>{ai.condition}</Chip>}
              {ai.rarity && <Chip>{ai.rarity}</Chip>}
              {ai.isLimitedEdition && <Chip red>Limited Edition</Chip>}
            </div>

            {ai.suggestedDescription && (
              <p className="text-gray-400 text-sm leading-relaxed">{ai.suggestedDescription}</p>
            )}

            {(ai.estimatedValueLow || ai.estimatedValueHigh) && (
              <p className="text-gray-500 text-xs">AI value estimate: ${ai.estimatedValueLow}–${ai.estimatedValueHigh}</p>
            )}

            {ai.aiNotes && (
              <p className="text-gray-500 text-xs border-t border-gray-800 pt-3">{ai.aiNotes}</p>
            )}
          </div>

          {/* Price */}
          <div>
            <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wide">Your Price ($) *</label>
            <input
              type="number"
              min={0}
              step={0.01}
              value={price}
              onChange={e => setPrice(e.target.value)}
              placeholder="0.00"
              className="w-full bg-gray-800 border border-gray-700 text-gray-200 text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:border-gray-500 placeholder-gray-500"
            />
          </div>

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

function Chip({ children, red }) {
  return (
    <span className={`text-xs px-2.5 py-0.5 rounded-full ${red ? 'bg-red-900 text-red-300' : 'bg-gray-800 text-gray-400'}`}>
      {children}
    </span>
  );
}
