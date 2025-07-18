'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/admin/page-layout';
import * as XLSX from 'xlsx';

export default function SuperAdminStudentsPage() {
  const [institutions, setInstitutions] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [students, setStudents] = useState([]);

  const fetchInstitutions = async () => {
    const res = await fetch('/api/superadmin/students/colleges');
    const data = await res.json();
    if (data.success) setInstitutions(data.institutions);
  };

  const fetchStudents = async (institution_id) => {
    const res = await fetch('/api/superadmin/students/by-institution', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ institution_id }),
    });
    const data = await res.json();
    if (data.success) setStudents(data.students);
  };

  const handleInstitutionChange = (e) => {
    const id = e.target.value;
    setSelectedId(id);
    if (id) fetchStudents(id);
    else setStudents([]);
  };

  const handleDownload = () => {
    if (!students.length) return;

    const worksheet = XLSX.utils.json_to_sheet(students);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Students');
    XLSX.writeFile(workbook, `students_${selectedId}.xlsx`);
  };

  useEffect(() => {
    fetchInstitutions();
  }, []);

  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold text-sky-800 mb-6">🎓 Student Viewer (By Institution)</h1>

        <div className="flex gap-4 items-center mb-6">
          <label className="text-gray-700 font-medium">Select Institution:</label>
          <select
            value={selectedId}
            onChange={handleInstitutionChange}
            className="p-2 border rounded"
          >
            <option value="">-- Select Institution --</option>
            {institutions.map((inst) => (
              <option key={inst.id} value={inst.id}>
                {inst.name}
              </option>
            ))}
          </select>

          <button
            onClick={handleDownload}
            disabled={!students.length}
            className="ml-auto bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow"
          >
            ⬇️ Download Excel
          </button>
        </div>

        {students.length > 0 ? (
          <div className="overflow-auto border border-gray-300 rounded shadow">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100 sticky top-0">
                <tr>
                  <th className="px-3 py-2 text-left">Name</th>
                  <th className="px-3 py-2 text-left">Roll No</th>
                  <th className="px-3 py-2 text-left">Mobile</th>
                  <th className="px-3 py-2 text-left">Email</th>
                  <th className="px-3 py-2 text-left">Branch</th>
                  <th className="px-3 py-2 text-left">Start Year</th>
                  <th className="px-3 py-2 text-left">End Year</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s.id} className="even:bg-white odd:bg-gray-50">
                    <td className="px-3 py-2">{s.name}</td>
                    <td className="px-3 py-2">{s.roll_no}</td>
                    <td className="px-3 py-2">{s.mobile}</td>
                    <td className="px-3 py-2">{s.email}</td>
                    <td className="px-3 py-2">{s.branch}</td>
                    <td className="px-3 py-2">{s.start_year || '-'}</td>
                    <td className="px-3 py-2">{s.end_year || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          selectedId && (
            <p className="text-gray-500 italic mt-4">No students found for this institution.</p>
          )
        )}
      </div>
    </DashboardLayout>
  );
}
