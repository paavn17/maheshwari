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
      if (res.ok) setStatus('Changes saved successfully.');
      else setStatus(`Error: ${data.error}`);
    } catch (err) {
      console.error(err);
      setStatus('Failed to save changes.');
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
      <div className="p-6 space-y-6  min-h-screen">
        <h1 className="text-3xl font-bold text-orange-700">Update Student Records</h1>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <select
            className="p-2 border border-orange-300 rounded text-sm"
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
            className="p-2 border border-orange-300 rounded text-sm"
            placeholder="Branch"
            value={filters.branch}
            onChange={(e) => setFilters({ ...filters, branch: e.target.value })}
          />

          <input
            type="text"
            className="p-2 border border-orange-300 rounded text-sm"
            placeholder="Student Name"
            value={filters.name}
            onChange={(e) => setFilters({ ...filters, name: e.target.value })}
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-4">
          <button
            onClick={() => setEditMode(!editMode)}
            className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
          >
            {editMode ? 'Disable Edit' : 'Enable Edit'}
          </button>

          <button
            onClick={handleDownloadExcel}
            className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
          >
            Download Excel
          </button>
        </div>

        {/* Table */}
        {loading ? (
          <p className="text-orange-600">Loading students...</p>
        ) : students.length === 0 ? (
          <p className="text-orange-600">No students found. Please select a batch or try a different filter.</p>
        ) : (
          <div className="overflow-auto border border-orange-300 rounded shadow-sm">
            <table className="min-w-full text-sm border-collapse">
              <thead className="bg-orange-100 text-orange-900 sticky top-0 z-10">
                <tr>
                  {students[0] &&
                    Object.keys(students[0])
                      .filter((field) => !['id', 'institution_id', 'password', 'student_type', 'admin_id'].includes(field))
                      .map((field) => (
                        <th key={field} className="px-3 py-2 border-b border-orange-300 text-left">
                          {field.replace(/_/g, ' ')}
                        </th>
                      ))}
                </tr>
              </thead>
              <tbody>
                {students.map((student, i) => (
                  <tr key={i} className="even:bg-orange-50 odd:bg-white">
                    {Object.entries(student)
                      .filter(([key]) => !['id', 'institution_id', 'password', 'student_type', 'admin_id'].includes(key))
                      .map(([key, val]) => (
                        <td key={key} className="px-3 py-2 border-b border-orange-200 min-w-[140px]">
                          {key === 'profile_pic' ? (
                            <div className="space-y-1">
                              {val?.startsWith?.('data:image') && (
                                <img
                                  src={val}
                                  alt="Profile"
                                  className="h-10 w-10 object-cover rounded-full border"
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
                                className="w-full bg-white border border-orange-300 rounded px-1 py-1 text-sm"
                              />
                            ) : (
                              <input
                                type="text"
                                value={val || ''}
                                onChange={(e) => handleFieldChange(i, key, e.target.value)}
                                className="w-full bg-white border border-orange-300 rounded px-1 py-1 text-sm"
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

        {/* Save Button */}
        {editMode && students.length > 0 && (
          <button
            onClick={handleSaveAll}
            className="mt-4 bg-orange-500 text-white px-6 py-2 rounded hover:bg-orange-600"
          >
            Save Changes
          </button>
        )}
        {status && (
          <p className="text-sm mt-4 text-orange-700 font-medium">{status}</p>
        )}
      </div>
    </InstituteLayout>
  );
}
