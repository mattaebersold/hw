import { useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { serverUrl } from '../services/api';

export default function ProfilePhotoUpload({ user, onUpdate }) {
  const { refreshUser } = useAuth();
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const handleChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('photo', file);
      const res = await axios.post(`${serverUrl}/api/users/me/photo`, formData, { withCredentials: true });
      await refreshUser();
      onUpdate?.(res.data.user);
    } catch (err) {
      alert(err.response?.data?.error || 'Upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div className="relative group w-fit">
      <img
        src={user.profilePhoto || `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`}
        alt={user.name}
        className="w-24 h-24 rounded-full object-cover border-2 border-gray-700"
      />
      <button
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-medium"
      >
        {uploading ? '…' : 'Change'}
      </button>
      <input ref={inputRef} type="file" accept="image/*" onChange={handleChange} className="hidden" />
    </div>
  );
}
