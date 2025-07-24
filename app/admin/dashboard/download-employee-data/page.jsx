'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/admin/page-layout';
import * as XLSX from 'xlsx';

export default function SuperAdminEmployeesPage() {
  const [institutions, setInstitutions] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [employees, setEmployees] = useState([]);

  // Fetch institution list on mount
  const fetchInstitutions = async () => {
    const res = await fetch('/api/superadmin/employees/companies');
    const data = await res.json();
    if (data.success) setInstitutions(data.institutions);
  };

  // Fetch employees by institution ID
  const fetchEmployees = async (institution_id) => {
    const res = await fetch('/api/superadmin/employees/by-institution', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ institution_id }),
    });
    const data = await res.json();
    if (data.success) setEmployees(data.employees);
    else setEmployees([]);
  };

  // Handle institution dropdown change
  const handleInstitutionChange = (e) => {
    const id = e.target.value;
    setSelectedId(id);
    if (id) fetchEmployees(id);
    else setEmployees([]);
  };

  // Export employees as Excel file, excluding image data
  const handleDownload = () => {
    if (!employees.length) return;

    // Exclude profile picture for export
    const exportable = employees.map(({ profile_pic, ...rest }) => rest);
    const worksheet = XLSX.utils.json_to_sheet(exportable);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Employees');
    XLSX.writeFile(workbook, `employees_${selectedId}.xlsx`);
  };

  useEffect(() => {
    fetchInstitutions();
  }, []);

  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold text-orange-700 mb-6">
          📋 Employee Viewer (By Company)
        </h1>

        <div className="flex flex-col md:flex-row gap-4 items-center mb-6">
          <label className="text-gray-700 font-medium whitespace-nowrap">
            Select Company:
          </label>

          <select
            value={selectedId}
            onChange={handleInstitutionChange}
            className="p-2 border border-orange-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-400"
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
            disabled={!employees.length}
            className="ml-auto bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded shadow disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            ⬇️ Download Excel
          </button>
        </div>

        {employees.length > 0 ? (
          <div className="overflow-auto border border-gray-300 rounded shadow">
            <table className="min-w-full text-sm">
              <thead className="bg-orange-100 sticky top-0">
                <tr>
                  <th className="px-3 py-2 text-left">Photo</th>
                  <th className="px-3 py-2 text-left">Name</th>
                  <th className="px-3 py-2 text-left">Emp ID</th>
                  <th className="px-3 py-2 text-left">Mobile</th>
                  <th className="px-3 py-2 text-left">Email</th>
                  <th className="px-3 py-2 text-left">Designation</th>
                  <th className="px-3 py-2 text-left">Department</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => (
                  <tr key={emp.id} className="even:bg-white odd:bg-orange-50">
                    <td className="px-3 py-2">
                      {emp.profile_pic ? (
                        <img
                          src={emp.profile_pic}
                          alt="Profile"
                          className="w-14 h-14 object-cover rounded-full border border-orange-200 shadow"
                        />
                      ) : (
                        <div className="w-14 h-14 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 text-xs">
                          No Image
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-2">{emp.name}</td>
                    <td className="px-3 py-2">{emp.emp_id}</td>
                    <td className="px-3 py-2">{emp.mobile}</td>
                    <td className="px-3 py-2">{emp.email}</td>
                    <td className="px-3 py-2">{emp.designation}</td>
                    <td className="px-3 py-2">{emp.department}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          selectedId && (
            <p className="text-gray-500 italic mt-4">No employees found for this company.</p>
          )
        )}
      </div>
    </DashboardLayout>
  );
}
