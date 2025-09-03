'use client';

import DashboardLayout from '@/components/admin/page-layout';
import { useState, useEffect } from 'react';

export default function AddInstitutionAdminPage() {
  const [mode, setMode] = useState('existing');
  const [institutions, setInstitutions] = useState([]);
  const [form, setForm] = useState({});
  const [excelFile, setExcelFile] = useState(null);

  useEffect(() => {
    fetch('/api/superadmin/institutions/all')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setInstitutions(data);
        } else {
          setInstitutions([]);
          console.error('Institutions data is not an array, resetting.');
        }
      })
      .catch((err) => {
        console.error('Error fetching institutions:', err);
        setInstitutions([]);
      });
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleExcelFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setExcelFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (mode === 'existing') {
      const res = await fetch('/api/superadmin/institution-admins/add-existing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      alert(res.ok ? '✅ Admin Added' : '❌ Error');
    } else if (mode === 'new-manual') {
      const payload = {
        college_name: form.name,
        college_code: form.code,
        admin_name: form.admin_name,
        admin_email: form.admin_email,
        admin_phone: form.admin_phone,
        admin_password: form.admin_password,
        admin_department: form.admin_department,
      };
      const res = await fetch('/api/superadmin/institutions/add-with-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      alert(res.ok ? '✅ Institution & Admin Added' : '❌ Error');
    } else if (mode === 'new-excel') {
      if (!excelFile) {
        alert('❌ Please upload an Excel file');
        return;
      }
      const formData = new FormData();
      formData.append('college_name', form.name);
      formData.append('college_code', form.code);
      formData.append('excel_file', excelFile);

      const res = await fetch('/api/superadmin/institutions/add-with-excel', {
        method: 'POST',
        body: formData,
      });
      alert(res.ok ? '✅ Institution & Admins Added from Excel' : '❌ Error');
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl w-full bg-white rounded-2xl p-8 shadow-md space-y-6">
          <h2 className="text-2xl font-bold text-orange-700 mb-2">Add Institution / Admin</h2>

          {/* Mode Selection */}
          <div className="flex flex-col gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="mode"
                value="existing"
                checked={mode === 'existing'}
                onChange={() => setMode('existing')}
                className="text-orange-600 focus:ring-orange-400"
              />
              <span className="text-sm font-medium text-gray-700">Add Admin to Existing Institution</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="mode"
                value="new-manual"
                checked={mode === 'new-manual'}
                onChange={() => setMode('new-manual')}
                className="text-orange-600 focus:ring-orange-400"
              />
              <span className="text-sm font-medium text-gray-700">Add New Institution & Admin (Manual)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="mode"
                value="new-excel"
                checked={mode === 'new-excel'}
                onChange={() => setMode('new-excel')}
                className="text-orange-600 focus:ring-orange-400"
              />
              <span className="text-sm font-medium text-gray-700">Add New Institution & Admins (Excel Upload)</span>
            </label>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            {mode === 'existing' && (
              <>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Select Institution</label>
                  <select
                    name="institution_id"
                    onChange={handleChange}
                    className="w-full border border-orange-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                  >
                    <option value="">-- Select Institution --</option>
                    {Array.isArray(institutions) &&
                      institutions.map((inst) => (
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
                  className="w-full border border-orange-300 rounded-md p-2"
                />
                <input
                  name="email"
                  placeholder="Admin Email"
                  onChange={handleChange}
                  className="w-full border border-orange-300 rounded-md p-2"
                />
                <input
                  name="phone"
                  placeholder="Admin Phone"
                  onChange={handleChange}
                  className="w-full border border-orange-300 rounded-md p-2"
                />
                <input
                  name="password"
                  placeholder="Admin Password"
                  type="password"
                  onChange={handleChange}
                  className="w-full border border-orange-300 rounded-md p-2"
                />
                <input
                  name="department"
                  placeholder="Department"
                  onChange={handleChange}
                  className="w-full border border-orange-300 rounded-md p-2"
                />
              </>
            )}

            {mode === 'new-manual' && (
              <>
                <input
                  name="name"
                  placeholder="Institution Name"
                  onChange={handleChange}
                  className="w-full border border-orange-300 rounded-md p-2"
                />
                <input
                  name="code"
                  placeholder="Institution Code"
                  onChange={handleChange}
                  className="w-full border border-orange-300 rounded-md p-2"
                />
                <input
                  name="admin_name"
                  placeholder="Admin Name"
                  onChange={handleChange}
                  className="w-full border border-orange-300 rounded-md p-2"
                />
                <input
                  name="admin_email"
                  placeholder="Admin Email"
                  onChange={handleChange}
                  className="w-full border border-orange-300 rounded-md p-2"
                />
                <input
                  name="admin_phone"
                  placeholder="Admin Phone"
                  onChange={handleChange}
                  className="w-full border border-orange-300 rounded-md p-2"
                />
                <input
                  name="admin_password"
                  type="password"
                  placeholder="Admin Password"
                  onChange={handleChange}
                  className="w-full border border-orange-300 rounded-md p-2"
                />
                <input
                  name="admin_department"
                  placeholder="Department"
                  onChange={handleChange}
                  className="w-full border border-orange-300 rounded-md p-2"
                />
              </>
            )}

            {mode === 'new-excel' && (
              <>
                <input
                  name="name"
                  placeholder="Institution Name"
                  onChange={handleChange}
                  className="w-full border border-orange-300 rounded-md p-2"
                />
                <input
                  name="code"
                  placeholder="Institution Code"
                  onChange={handleChange}
                  className="w-full border border-orange-300 rounded-md p-2"
                />
                <input
                  type="file"
                  accept=".xls,.xlsx"
                  onChange={handleExcelFileChange}
                  className="w-full border border-orange-300 rounded-md p-2 bg-gray-50"
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
