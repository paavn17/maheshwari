'use client';

import { useState, useEffect } from 'react';
import InstituteLayout from '@/components/institute/page-layout';

export default function Page() {
  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [status, setStatus] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      const res = await fetch('/api/institute/profile');
      const data = await res.json();
      if (res.ok) setProfile(data.profile);
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSizeInBytes = 4 * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      setStatus('❌ Logo file size must be less than 4MB. Please choose a smaller image.');
      e.target.value = '';
      return;
    }

    setStatus('');

    const reader = new FileReader();
    reader.onloadend = () => {
      setProfile((prev) => ({ ...prev, logo: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    const res = await fetch('/api/institute/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
    });
    const data = await res.json();
    if (res.ok) {
      setStatus('✅ Profile updated successfully.');
      setEditMode(false);
    } else {
      setStatus(`❌ ${data.error || 'Failed to update profile.'}`);
    }
  };

  if (!profile) {
    return (
      <InstituteLayout>
        <div className="p-6 text-orange-600">Loading...</div>
      </InstituteLayout>
    );
  }

  return (
    <InstituteLayout>
      <div className="p-6 max-w-3xl rounded shadow space-y-6">
        <h1 className="text-2xl font-bold text-orange-700">Update Institute Profile</h1>

        {status && <p className="text-sm font-semibold text-orange-600">{status}</p>}

        {/* Logo Upload */}
        <div>
          <label className="block text-sm font-medium text-orange-800 mb-1">
            Logo <span className="text-xs text-gray-500">(Max: 4MB)</span>
          </label>
          {editMode && (
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoChange}
              className="block w-full text-sm text-orange-800 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-orange-100 file:text-orange-700 hover:file:bg-orange-200"
            />
          )}
          {profile.logo && (
            <div className="mt-3">
              <img
                src={profile.logo}
                alt="Institution Logo"
                className="h-16 w-auto rounded border border-orange-300 shadow-sm"
              />
            </div>
          )}
        </div>

        {/* Profile Fields */}
        <div className="space-y-4">
          <FormRow label="Institute Name" name="name" value={profile.name} editable={false} />
          <FormRow label="Institute Code" name="code" value={profile.code} editable={false} />
          <FormRow label="Email" name="email" value={profile.email} onChange={handleChange} editable={editMode} />
          <FormRow label="Phone Number" name="phone" value={profile.phone} onChange={handleChange} editable={editMode} />
          <FormRow label="Address" name="address" value={profile.address} onChange={handleChange} editable={editMode} />
          <FormRow label="State" name="state" value={profile.state} onChange={handleChange} editable={editMode} />
          <FormRow label="City" name="city" value={profile.city} onChange={handleChange} editable={editMode} />
          <FormRow label="Pincode" name="pincode" value={profile.pincode} onChange={handleChange} editable={editMode} />
          <FormRow label="Type" name="type" value={profile.type} onChange={handleChange} editable={editMode} />
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-4">
          {editMode ? (
            <>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition"
              >
                Save
              </button>
              <button
                onClick={() => setEditMode(false)}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={() => setEditMode(true)}
              className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition"
            >
              Edit Profile
            </button>
          )}
        </div>
      </div>
    </InstituteLayout>
  );
}

// Reusable input row
function FormRow({ label, name, value, onChange, editable }) {
  return (
    <div>
      <label className="block text-sm font-medium text-orange-800 mb-1">{label}</label>
      {editable ? (
        <input
          type="text"
          name={name}
          value={value || ''}
          onChange={onChange}
          className="w-full px-3 py-2 border border-orange-300 rounded focus:ring-2 focus:ring-orange-400 text-sm"
        />
      ) : (
        <p className="px-3 py-2 bg-white border border-orange-200 rounded text-orange-900 text-sm">
          {value}
        </p>
      )}
    </div>
  );
}
