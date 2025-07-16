'use client';

import { useEffect, useState } from 'react';
import InstituteLayout from '@/components/institute/page-layout';
import * as XLSX from 'xlsx';

export default function UpdateStudentsPage() {
  const [students, setStudents] = useState([]);
  const [filters, setFilters] = useState({ start_year: '', end_year: '', branch: '', name: '' });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [yearOptions, setYearOptions] = useState([]);

  useEffect(() => {
    fetchYearOptions();
  }, []);

  useEffect(() => {
    if (filters.start_year && filters.end_year) {
      fetchFilteredStudents();
    }
  }, [filters]);

  const fetchYearOptions = async () => {
    try {
      const res = await fetch('/api/institute/batches');
      if (!res.ok) throw new Error('Failed to fetch years');
      const data = await res.json();
      setYearOptions(data.batches || []);
    } catch (err) {
      console.error('Failed to load years:', err);
    }
  };

  const fetchFilteredStudents = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/institute/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filters),
      });
      if (!res.ok) throw new Error('Invalid JSON response');
      const data = await res.json();
      setStudents(data.students || []);
    } catch (err) {
      console.error('Failed to load students:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (index, field, value) => {
    const updated = [...students];
    updated[index][field] = value;
    setStudents(updated);
  };

  const handleImageChange = (index, file) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const updated = [...students];
      updated[index].profile_pic = reader.result;
      setStudents(updated);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveAll = async () => {
    try {
      const res = await fetch('/api/institute/students/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ students }),
      });
      const data = await res.json();
      if (res.ok) setStatus('✅ Changes saved successfully.');
      else setStatus(`❌ ${data.error}`);
    } catch (err) {
      console.error(err);
      setStatus('❌ Failed to save changes.');
    }
  };

  const handleBatchSelect = (e) => {
    const [start, end] = e.target.value.split('-').map(Number);
    if (start && end) {
      setFilters({ ...filters, start_year: start, end_year: end });
    } else {
      setFilters({ start_year: '', end_year: '', branch: '', name: '' });
      setStudents([]);
    }
  };

  const handleDownloadExcel = () => {
    if (!students.length) return;

    const data = students.map(({ id, institution_id, password, student_type, admin_id, profile_pic, ...rest }) => rest);

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Students');

    XLSX.writeFile(workbook, 'students.xlsx');
  };

  return (
    <InstituteLayout>
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-semibold text-sky-800">Update Student Records</h1>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <select
            className="p-2 border rounded"
            onChange={handleBatchSelect}
            defaultValue=""
          >
            <option value="">Select Batch</option>
            {yearOptions.map((y, i) => (
              <option key={i} value={`${y.start_year}-${y.end_year}`}>
                {y.start_year} - {y.end_year}
              </option>
            ))}
          </select>

          <input
            type="text"
            className="p-2 border rounded"
            placeholder="Branch"
            value={filters.branch}
            onChange={(e) => setFilters({ ...filters, branch: e.target.value })}
          />

          <input
            type="text"
            className="p-2 border rounded"
            placeholder="Student Name"
            value={filters.name}
            onChange={(e) => setFilters({ ...filters, name: e.target.value })}
          />
        </div>

        <div className="flex justify-end gap-4">
          <button
            onClick={() => setEditMode(!editMode)}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {editMode ? '🔒 Disable Edit' : '✏️ Enable Edit'}
          </button>

          <button
            onClick={handleDownloadExcel}
            className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            ⬇️ Download Excel
          </button>
        </div>

        {/* Table */}
        {loading ? (
          <p className="text-gray-600">Loading students...</p>
        ) : students.length === 0 ? (
          <p className="text-gray-500">No students found. Please select a batch.</p>
        ) : (
          <div className="overflow-auto border rounded shadow">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  {students[0] && Object.keys(students[0])
                    .filter((field) => !['id', 'institution_id', 'password', 'student_type', 'admin_id'].includes(field))
                    .map((field) => (
                      <th key={field} className="px-3 py-2 border-b text-left whitespace-nowrap">{field}</th>
                    ))}
                </tr>
              </thead>
              <tbody>
                {students.map((student, i) => (
                  <tr key={i} className="odd:bg-white even:bg-gray-50">
                    {Object.entries(student)
                      .filter(([key]) => !['id', 'institution_id', 'password', 'student_type', 'admin_id'].includes(key))
                      .map(([key, val]) => (
                        <td key={key} className="px-3 py-2 border-b min-w-[140px]">
                          {key === 'profile_pic' ? (
                            <div className="space-y-1">
                              {val && typeof val === 'string' && val.startsWith('data:image') && (
                                <img
                                  src={val}
                                  alt="Profile"
                                  className="h-12 w-12 object-cover rounded-full border"
                                />
                              )}
                              {editMode && (
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => handleImageChange(i, e.target.files[0])}
                                />
                              )}
                            </div>
                          ) : editMode ? (
                            key === 'dob' ? (
                              <input
                                type="date"
                                value={val || ''}
                                onChange={(e) => handleFieldChange(i, key, e.target.value)}
                                className="w-full bg-transparent outline-none"
                              />
                            ) : (
                              <input
                                type="text"
                                value={val || ''}
                                onChange={(e) => handleFieldChange(i, key, e.target.value)}
                                className="w-full bg-transparent outline-none"
                              />
                            )
                          ) : (
                            <span>{val}</span>
                          )}
                        </td>
                      ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {editMode && students.length > 0 && (
          <button
            onClick={handleSaveAll}
            className="mt-4 bg-sky-600 text-white px-6 py-2 rounded hover:bg-sky-700"
          >
            💾 Save Changes
          </button>
        )}
        {status && <p className="text-sm text-sky-700 mt-2">{status}</p>}
      </div>
    </InstituteLayout>
  );
}
