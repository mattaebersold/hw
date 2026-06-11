import { useRef, useState, useEffect } from 'react';

export default function PhotoCapture({ onCapture }) {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);

  useEffect(() => { inputRef.current?.click(); }, []);

  const handleFile = (f) => {
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleChange = (e) => handleFile(e.target.files[0]);

  const handleDrop = (e) => {
    e.preventDefault();
    handleFile(e.dataTransfer.files[0]);
  };

  return (
    <div className="space-y-4">
      {preview ? (
        <div className="relative">
          <img src={preview} alt="Preview" className="w-full max-h-72 object-contain rounded-xl bg-gray-800" />
          <button
            onClick={() => { setPreview(null); setFile(null); }}
            className="absolute top-2 right-2 bg-gray-900/80 hover:bg-gray-800 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm transition-colors"
          >
            ✕
          </button>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={e => e.preventDefault()}
          className="border-2 border-dashed border-gray-700 hover:border-gray-500 rounded-xl p-12 text-center cursor-pointer transition-colors group"
        >
          <p className="text-5xl mb-3 group-hover:scale-110 transition-transform">📷</p>
          <p className="text-gray-300 font-medium">Take or select a photo</p>
          <p className="text-gray-500 text-sm mt-1">Tap to open camera or choose from gallery</p>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleChange}
        className="hidden"
      />

      {!preview && (
        <button
          onClick={() => inputRef.current?.click()}
          className="w-full bg-gray-800 border border-gray-700 hover:border-gray-500 text-gray-300 text-sm py-2.5 rounded-xl transition-colors"
        >
          Choose from library
        </button>
      )}

      {preview && (
        <button
          onClick={() => onCapture(file)}
          className="w-full bg-red-600 hover:bg-red-500 text-white font-medium py-3 rounded-xl transition-colors"
        >
          Submit
        </button>
      )}
    </div>
  );
}
