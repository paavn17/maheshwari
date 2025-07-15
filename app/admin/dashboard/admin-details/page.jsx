'use client';

import { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '@/components/admin/page-layout';
import { Pencil, Check, X, Power } from 'lucide-react';

const Page = () => {
  const [admins, setAdmins] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadAdmins() {
      try {
        const res = await fetch('/api/superadmin/admins');
        const data = await res.json();
        console.log
        if (res.ok) setAdmins(data.admins);
        else setError(data.error || 'Failed to fetch admins');
      } catch (err) {
        console.error(err);
        setError('Unable to load admin data');
      }
    }

    loadAdmins();
  }, []);

  const handleEdit = (admin) => {
    setEditingId(admin.id);
    setEditData({ ...admin });
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditData({});
  };

  const handleSave = async () => {
    try {
      const res = await fetch('/api/superadmin/admins/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);

      setAdmins((prev) =>
        prev.map((admin) => (admin.id === editingId ? { ...admin, ...editData } : admin))
      );
      handleCancel();
    } catch (err) {
      console.error(err);
      alert('⚠️ Failed to update admin');
    }
  };

  const handleChange = (field, value) => {
    setEditData((prev) => ({ ...prev, [field]: value }));
  };

  const groupedAdmins = useMemo(() => {
    const groups = {};
    admins.forEach((admin) => {
      if (
        search === '' ||
        admin.college_code?.toLowerCase().includes(search.toLowerCase())
      ) {
        if (!groups[admin.college_code]) groups[admin.college_code] = [];
        groups[admin.college_code].push(admin);
      }
    });
    return groups;
  }, [admins, search]);

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-semibold text-gray-800 mb-4">Admin Details</h1>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      <input
        type="text"
        placeholder="Search by College Code..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-6 px-4 py-2 border rounded w-full md:w-1/3"
      />

      {Object.entries(groupedAdmins).map(([code, adminsList]) => (
        <div key={code} className="mb-10">
          <h2 className="text-xl font-semibold text-sky-800 mb-2">
            College Code: {code}
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
              <thead className="bg-sky-200 text-gray-700 text-left text-sm">
                <tr>
                  <th className="px-6 py-3">Logo</th>
                  <th className="px-6 py-3">#</th>
                  <th className="px-6 py-3">Name</th>
                  <th className="px-6 py-3">Email</th>
                  <th className="px-6 py-3">Password</th>
                  <th className="px-6 py-3">Phone</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm text-gray-800">
                {adminsList.map((admin, idx) => {
                  const isEditing = editingId === admin.id;
                  const isActive = admin.account_status === 'Live';

                  return (
                    <tr
                      key={admin.id}
                      className={`border-t ${isActive ? 'bg-white' : 'bg-gray-100 text-gray-400'}`}
                    >
                      <td className="px-6 py-3">
                        {admin.institution_logo ? (
                          <img
                            src={admin.institution_logo}
                            alt="Logo"
                            className="h-8 w-8 object-contain rounded"
                          />
                        ) : (
                          <span className="text-gray-400">No Logo</span>
                        )}
                      </td>

                      <td className="px-6 py-3">{idx + 1}</td>
                      <td className="px-6 py-3">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editData.name}
                            onChange={(e) => handleChange('name', e.target.value)}
                            className="border rounded px-2 py-1 text-sm w-full"
                          />
                        ) : (
                          admin.name
                        )}
                      </td>
                      <td className="px-6 py-3">
                        {isEditing ? (
                          <input
                            type="email"
                            value={editData.email}
                            onChange={(e) => handleChange('email', e.target.value)}
                            className="border rounded px-2 py-1 text-sm w-full"
                          />
                        ) : (
                          admin.email
                        )}
                      </td>
                      <td className="px-6 py-3">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editData.password}
                          onChange={(e) => handleChange('password', e.target.value)}
                          className="border rounded px-2 py-1 text-sm w-full"
                        />
                      ) : (
                        <span className="font-mono text-gray-700">{admin.password}</span>
                      )}
                    </td>

                      <td className="px-6 py-3">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editData.phone}
                            onChange={(e) => handleChange('phone', e.target.value)}
                            className="border rounded px-2 py-1 text-sm w-full"
                          />
                        ) : (
                          admin.phone
                        )}
                      </td>
                      <td className="px-6 py-3">
                        {isActive ? (
                          <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-green-500"></span>
                            <span className="text-green-700 font-medium">Live</span>
                          </div>
                        ) : (
                          <span className="text-gray-400">Inactive</span>
                        )}
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex gap-2 items-center">
                          {isEditing ? (
                            <>
                              <button
                                onClick={handleSave}
                                className="bg-green-500 hover:bg-green-600 text-white p-1 rounded"
                              >
                                <Check size={16} />
                              </button>
                              <button
                                onClick={handleCancel}
                                className="bg-gray-300 hover:bg-gray-400 text-gray-800 p-1 rounded"
                              >
                                <X size={16} />
                              </button>
                            </>
                          ) : (
                            isActive && (
                              <button
                                onClick={() => handleEdit(admin)}
                                className="text-sky-600 hover:text-sky-800 p-1"
                              >
                                <Pencil size={16} />
                              </button>
                            )
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </DashboardLayout>
  );
};

export default Page;
