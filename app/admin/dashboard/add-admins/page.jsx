'use client';

import DashboardLayout from '@/components/admin/page-layout';
import { useState, useEffect } from 'react';

export default function AddInstitutionAdminPage() {
  const [mode, setMode] = useState('existing');
  const [institutions, setInstitutions] = useState([]);
  const [form, setForm] = useState({});

  useEffect(() => {
    fetch('/api/superadmin/institutions/all')
      .then((res) => res.json())
      .then((data) => setInstitutions(data));
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
    if (mode === 'existing') {
      const res = await fetch('/api/superadmin/institution-admins/add-existing', {
        method: 'POST',
        body: JSON.stringify(form),
        headers: { 'Content-Type': 'application/json' },
      });
      alert(res.ok ? '✅ Admin Added' : '❌ Error');
    } else {
      const payload = {
        college_name: form.name,
        college_code: form.code,
        admin_name: form.admin_name,
        admin_email: form.admin_email,
        admin_phone: form.admin_phone,
        admin_password: form.admin_password,
      };

      const res = await fetch('/api/superadmin/institutions/add-with-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      alert(res.ok ? '✅ Institution & Admin Added' : '❌ Error');
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl w-full bg-white rounded-2xl p-8 shadow-md space-y-6">
          <h2 className="text-2xl font-bold text-orange-700 mb-2">Add Institution / Admin</h2>

          {/* Mode Selection */}
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="mode"
                value="existing"
                checked={mode === 'existing'}
                onChange={() => setMode('existing')}
                className="text-orange-600 focus:ring-orange-400"
              />
              <span className="text-sm font-medium text-gray-700">
                Add Admin to Existing Institution
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="mode"
                value="new"
                checked={mode === 'new'}
                onChange={() => setMode('new')}
                className="text-orange-600 focus:ring-orange-400"
              />
              <span className="text-sm font-medium text-gray-700">
                Add New Institution & Ad.min
              </span>
            </label>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            {mode === 'existing' ? (
              <>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">
                    Select Institution
                  </label>
                  <select
                    name="institution_id"
                    onChange={handleChange}
                    className="w-full border border-orange-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                  >
                    <option value="">-- Select Institution --</option>
                    {institutions.map((inst) => (
                      <option key={inst.id} value={inst.id}>
                        {inst.name}
                      </option>
                    ))}
                  </select>
                </div>
                <input
                  name="name"
                  placeholder="Admin Name"
                  onChange={handleChange}
                  className="w-full border border-orange-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
                <input
                  name="email"
                  placeholder="Admin Email"
                  onChange={handleChange}
                  className="w-full border border-orange-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
                <input
                  name="phone"
                  placeholder="Admin Phone"
                  onChange={handleChange}
                  className="w-full border border-orange-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
                <input
                  name="password"
                  placeholder="Admin Password"
                  type="password"
                  onChange={handleChange}
                  className="w-full border border-orange-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </>
            ) : (
              <>
                <input
                  name="name"
                  placeholder="Institution Name"
                  onChange={handleChange}
                  className="w-full border border-orange-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
                <input
                  name="code"
                  placeholder="Institution Code"
                  onChange={handleChange}
                  className="w-full border border-orange-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
                <input
                  name="admin_name"
                  placeholder="Admin Name"
                  onChange={handleChange}
                  className="w-full border border-orange-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
                <input
                  name="admin_email"
                  placeholder="Admin Email"
                  onChange={handleChange}
                  className="w-full border border-orange-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
                <input
                  name="admin_phone"
                  placeholder="Admin Phone"
                  onChange={handleChange}
                  className="w-full border border-orange-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
                <input
                  name="admin_password"
                  type="password"
                  placeholder="Admin Password"
                  onChange={handleChange}
                  className="w-full border border-orange-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </>
            )}
          </div>

          <button
            onClick={handleSubmit}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded-md shadow-md transition"
          >
            Submit
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
