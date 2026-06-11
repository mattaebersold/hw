import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PhotoCapture from '../components/PhotoCapture';
import AiDraftForm from '../components/AiDraftForm';
import { Link } from 'react-router-dom';
import api, { serverUrl } from '../services/api';
import axios from 'axios';

const STEPS = ['photo', 'draft'];

export default function CreateListing() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState('photo');
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState(null);
  const [capturedFile, setCapturedFile] = useState(null);
  const [draft, setDraft] = useState({});
  const [saving, setSaving] = useState(false);

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
      const ai = res.data.result;
      setDraft({
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
        price: ai.estimatedValueHigh ? Math.ceil(ai.estimatedValueHigh * 0.9) : '',
      });
      setStep('draft');
    } catch (err) {
      setAnalyzeError(err.response?.data?.error || 'AI analysis failed. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!draft.title) return alert('Please add a title.');
    if (!draft.price) return alert('Please set a price.');
    setSaving(true);
    try {
      const res = await api.post('/listings', { ...draft, status: 'draft' });
      const listingId = res.data.listing._id;

      // Upload the photo
      if (capturedFile) {
        const formData = new FormData();
        formData.append('photo', capturedFile);
        await axios.post(`${serverUrl}/api/listings/${listingId}/photos`, formData, { withCredentials: true });
      }

      navigate(`/listings/${listingId}/edit`);
    } catch (err) {
      alert(err.response?.data?.error || 'Save failed. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-2">List a Car</h1>
      <p className="text-gray-400 text-sm mb-8">Take or upload a photo — AI will identify and pre-fill the details.</p>

      {/* Step indicator */}
      <div className="flex gap-2 mb-8">
        {STEPS.map((s, i) => (
          <div key={s} className={`h-1 flex-1 rounded-full transition-colors ${step === s || STEPS.indexOf(step) > i ? 'bg-red-500' : 'bg-gray-800'}`} />
        ))}
      </div>

      {step === 'photo' && (
        <div>
          {analyzing ? (
            <div className="text-center py-16 space-y-4">
              <div className="text-5xl animate-bounce">🔍</div>
              <p className="text-white font-medium">Analyzing your car…</p>
              <p className="text-gray-400 text-sm">GPT-4o is identifying the make, model, series, and condition</p>
            </div>
          ) : (
            <>
              <PhotoCapture onCapture={handleCapture} />
              {analyzeError && <p className="text-red-400 text-sm mt-3 text-center">{analyzeError}</p>}
            </>
          )}
        </div>
      )}

      {step === 'draft' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-green-400 text-sm font-medium">✓ AI analysis complete — review and edit below</p>
            <button onClick={() => setStep('photo')} className="text-gray-400 hover:text-white text-sm transition-colors">← Retake</button>
          </div>

          <AiDraftForm data={draft} onChange={setDraft} />

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSaveDraft}
              disabled={saving}
              className="flex-1 bg-gray-700 hover:bg-gray-600 disabled:opacity-60 text-white font-medium py-3 rounded-xl transition-colors"
            >
              {saving ? 'Saving…' : 'Save as Draft'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
