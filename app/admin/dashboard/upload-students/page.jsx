'use client';

import { useEffect, useState } from 'react';
import InstituteLayout from '@/components/institute/page-layout';
import * as XLSX from 'xlsx';
import DashboardLayout from '@/components/admin/page-layout';

export default function UploadStudentsPage() {
  const [institutions, setInstitutions] = useState([]);
  const [institutionId, setInstitutionId] = useState('');
  const [students, setStudents] = useState([]);
  const [status, setStatus] = useState('');
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    fetch('/api/superadmin/institutions')
      .then((res) => res.json())
      .then((data) => setInstitutions(data.institutions || []))
      .catch((err) => console.error('Failed to load institutions:', err));
  }, []);

  const handleExcelUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet);
      setStudents(rows);
    };
    reader.readAsArrayBuffer(file);
  };

  const handleSaveAll = async () => {
    try {
      const res = await fetch('/api/superadmin/students/bulk-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ institution_id: institutionId, students }),
      });
      const data = await res.json();
      if (res.ok) setStatus('✅ Uploaded successfully.');
      else setStatus(`❌ ${data.error}`);
    } catch (err) {
      console.error('Upload error:', err);
      setStatus('❌ Failed to upload.');
    }
  };

  const handleFieldChange = (index, field, value) => {
    const updated = [...students];
    updated[index][field] = value;
    setStudents(updated);
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-semibold text-sky-800">Super Admin Upload Students</h1>

        {/* Select College */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <select
            className="p-2 border rounded w-full sm:w-auto"
            value={institutionId}
            onChange={(e) => setInstitutionId(e.target.value)}
          >
            <option value="">Select Institution</option>
            {institutions.map((inst) => (
              <option key={inst.id} value={inst.id}>{inst.name}</option>
            ))}
          </select>

          {institutionId && (
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleExcelUpload}
              className="p-2 border rounded"
            />
          )}
        </div>

        {/* Table */}
        {students.length > 0 && (
          <>
            <div className="flex justify-end">
              <button
                onClick={() => setEditMode(!editMode)}
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                {editMode ? 'Cancel' : 'Edit'}</button>
            </div>

            <div className="overflow-auto border rounded shadow">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    {Object.keys(students[0]).filter(k => k !== 'student_type').map((field) => (
                      <th key={field} className="px-3 py-2 border-b text-left whitespace-nowrap">{field}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {students.map((student, i) => (
                    <tr key={i} className="odd:bg-white even:bg-gray-50">
                      {Object.entries(student).filter(([k]) => k !== 'student_type').map(([key, val]) => (
                        <td key={key} className="px-3 py-2 border-b min-w-[140px]">
                          {editMode ? (
                            <input
                              type="text"
                              value={val || ''}
                              onChange={(e) => handleFieldChange(i, key, e.target.value)}
                              className="w-full bg-transparent outline-none"
                            />
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

            <button
              onClick={handleSaveAll}
              className="mt-4 bg-sky-600 text-white px-6 py-2 rounded hover:bg-sky-700"
            >
              Upload Students
            </button>

            {status && <p className="text-sm text-sky-700 mt-2">{status}</p>}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}