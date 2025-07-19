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

    // Check file size (4MB = 4 * 1024 * 1024 bytes)
    const maxSizeInBytes = 4 * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      setStatus('❌ Logo file size must be less than 4MB. Please choose a smaller image.');
      // Clear the file input
      e.target.value = '';
      return;
    }

    // Clear any previous error messages
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
        <div className="p-6">Loading...</div>
      </InstituteLayout>
    );
  }

  return (
    <InstituteLayout>
      <div className="p-6 max-w-3xl bg-sky-50 rounded shadow space-y-6">
        <h1 className="text-2xl font-semibold text-sky-800">Update Institute Profile</h1>

        {status && <p className="text-sm text-sky-700">{status}</p>}

        {/* Logo Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Logo <span className="text-gray-500">(Max: 4MB)</span>
          </label>
          {editMode ? (
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleLogoChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100"
            />
          ) : null}
          {profile.logo && (
            <div className="mt-2">
              <img
                src={profile.logo}
                alt="Institution Logo"
                className="h-16 rounded border"
              />
            </div>
          )}
        </div>

        {/* FORM FIELDS */}
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

        {/* BUTTONS */}
        <div className="flex justify-end gap-4">
          {editMode ? (
            <>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
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
              className="px-4 py-2 bg-sky-600 text-white rounded hover:bg-sky-700 transition"
            >
              Edit Profile
            </button>
          )}
        </div>
      </div>
    </InstituteLayout>
  );
}

// Reusable form input row
function FormRow({ label, name, value, onChange, editable }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {editable ? (
        <input
          type="text"
          name={name}
          value={value || ''}
          onChange={onChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      ) : (
        <p className="px-3 py-2 bg-gray-50 border border-gray-200 rounded text-gray-800">{value}</p>
      )}
    </div>
  );
}
