'use client';

import DashboardLayout from '@/components/admin/page-layout';
import { useState, useEffect } from 'react';

export default function AddInstitutionAdminPage() {
  const [mode, setMode] = useState('existing');
  const [institutions, setInstitutions] = useState([]);
  const [form, setForm] = useState({});

  useEffect(() => {
    fetch('/api/superadmin/institutions/all')
      .then(res => res.json())
      .then(data => setInstitutions(data));
  }, []);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
    if (mode === 'existing') {
      const res = await fetch('/api/superadmin/institution-admins/add-existing', {
        method: 'POST',
        body: JSON.stringify(form),
        headers: { 'Content-Type': 'application/json' }
      });
      alert(res.ok ? 'Admin Added' : 'Error');
    } else {
      const payload = {
        college_name: form.name,
        college_code: form.code,
        admin_name: form.admin_name,
        admin_email: form.admin_email,
        admin_phone: form.admin_phone,
        admin_password: form.admin_password
      };

      const res = await fetch('/api/superadmin/institutions/add-with-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      alert(res.ok ? 'Institution & Admin Added' : 'Error');
    }
  };

  return (
    <DashboardLayout>
      <div className="p-4 space-y-4">
        <div>
          <label>
            <input
              type="radio"
              name="mode"
              value="existing"
              checked={mode === 'existing'}
              onChange={() => setMode('existing')}
            />
            Add Admin to Existing Institution
          </label>
          <label className="ml-4">
            <input
              type="radio"
              name="mode"
              value="new"
              checked={mode === 'new'}
              onChange={() => setMode('new')}
            />
            Add New Institution & Admin
          </label>
        </div>

        {mode === 'existing' ? (
          <>
            <select name="institution_id" onChange={handleChange} className="border p-2">
              <option value="">Select Institution</option>
              {institutions.map(i => (
                <option key={i.id} value={i.id}>{i.name}</option>
              ))}
            </select>
            <input name="name" placeholder="Admin Name" onChange={handleChange} className="border p-2 block" />
            <input name="email" placeholder="Email" onChange={handleChange} className="border p-2 block" />
            <input name="phone" placeholder="Phone" onChange={handleChange} className="border p-2 block" />
            <input name="password" placeholder="Password" onChange={handleChange} className="border p-2 block" />
          </>
        ) : (
          <>
            <input name="name" placeholder="Institution Name" onChange={handleChange} className="border p-2 block" />
            <input name="code" placeholder="Institution Code" onChange={handleChange} className="border p-2 block" />

            <input name="admin_name" placeholder="Admin Name" onChange={handleChange} className="border p-2 block" />
            <input name="admin_email" placeholder="Admin Email" onChange={handleChange} className="border p-2 block" />
            <input name="admin_phone" placeholder="Admin Phone" onChange={handleChange} className="border p-2 block" />
            <input name="admin_password" placeholder="Admin Password" onChange={handleChange} className="border p-2 block" />
          </>
        )}

        <button onClick={handleSubmit} className="bg-blue-500 text-white p-2 rounded">
          Submit
        </button>
      </div>
    </DashboardLayout>
  );
}
