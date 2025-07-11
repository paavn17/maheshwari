'use client';

import { useState } from 'react';
import InstituteLayout from '@/components/institute/page-layout';

const dummyProfile = {
  name: 'Vignan Institute of Technology',
  code: 'VGN01',
  email: 'contact@vignan.edu.in',
  phone: '9876543210',
  address: 'Guntur, Andhra Pradesh, India',
  principal: 'Dr. S. Ramesh',
};

export default function Page() {
  const [profile, setProfile] = useState(dummyProfile);
  const [editMode, setEditMode] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    console.log('Updated Profile:', profile);
    setEditMode(false);
  };

  return (
    <InstituteLayout>
      <div className="p-6 max-w-3xl bg-sky-50 rounded shadow space-y-6">
        <h1 className="text-2xl font-semibold text-sky-800">Update Institute Profile</h1>

        {/* FORM */}
        <div className="space-y-4">
          <FormRow
            label="Institute Name"
            name="name"
            value={profile.name}
            editable={false}
          />
          <FormRow
            label="Institute Code"
            name="code"
            value={profile.code}
            editable={false}
          />
          <FormRow
            label="Email"
            name="email"
            value={profile.email}
            onChange={handleChange}
            editable={editMode}
          />
          <FormRow
            label="Phone Number"
            name="phone"
            value={profile.phone}
            onChange={handleChange}
            editable={editMode}
          />
          <FormRow
            label="Address"
            name="address"
            value={profile.address}
            onChange={handleChange}
            editable={editMode}
          />
          <FormRow
            label="Principal Name"
            name="principal"
            value={profile.principal}
            onChange={handleChange}
            editable={editMode}
          />
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
          value={value}
          onChange={onChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      ) : (
        <p className="px-3 py-2 bg-gray-50 border border-gray-200 rounded text-gray-800">{value}</p>
      )}
    </div>
  );
}
