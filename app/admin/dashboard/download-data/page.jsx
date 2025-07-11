'use client';

import React, { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import DashboardLayout from '@/components/admin/page-layout';
import {
  getStudentsByCollege,
  getUniqueColleges,
  getBranchesByCollege,
} from '@/lib/fetchers/getStudents';

export default function DownloadDataPage() {
  const [selectedCollege, setSelectedCollege] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [students, setStudents] = useState([]);

  const colleges = getUniqueColleges();

  const handleCollegeChange = async (e) => {
    const college = e.target.value;
    setSelectedCollege(college);
    setSelectedBranch('');
    setSearchTerm('');
    const data = await getStudentsByCollege(college);
    setStudents(data);
  };

  const handleBranchChange = (e) => setSelectedBranch(e.target.value);
  const handleSearchChange = (e) => setSearchTerm(e.target.value);

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchBranch = selectedBranch ? student.branch === selectedBranch : true;
      const matchSearch =
        student.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.roll_no.toLowerCase().includes(searchTerm.toLowerCase());
      return matchBranch && matchSearch;
    });
  }, [students, selectedBranch, searchTerm]);

  const branches = selectedCollege ? getBranchesByCollege(selectedCollege) : [];

  const handleDownloadExcel = () => {
    if (filteredStudents.length === 0) return;

    const worksheet = XLSX.utils.json_to_sheet(filteredStudents);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Students');
    XLSX.writeFile(workbook, 'filtered_students.xlsx');
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-2xl font-semibold mb-6 text-gray-800">Download Student Data</h1>

        <div className="grid sm:grid-cols-2 gap-4 mb-6 max-w-2xl">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select College</label>
            <select
              value={selectedCollege}
              onChange={handleCollegeChange}
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value="">-- Select a college --</option>
              {colleges.map((college, index) => (
                <option key={index} value={college}>
                  {college}
                </option>
              ))}
            </select>
          </div>

          {branches.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Branch</label>
              <select
                value={selectedBranch}
                onChange={handleBranchChange}
                className="w-full p-2 border border-gray-300 rounded"
              >
                <option value="">-- All Branches --</option>
                {branches.map((branch, index) => (
                  <option key={index} value={branch}>
                    {branch}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {students.length > 0 && (
          <div className="mb-6 max-w-md">
            <label className="block text-sm font-medium text-gray-700 mb-1">Search Student (Name or Roll No)</label>
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
        )}

        {filteredStudents.length > 0 && (
          <div className="mb-4">
            <button
              onClick={handleDownloadExcel}
              className="bg-sky-500 text-white px-4 py-2 rounded hover:bg-sky-700 transition"
            >
              Download Excel
            </button>
          </div>
        )}

        {filteredStudents.length > 0 ? (
          <>
            <div className="text-sm text-gray-700 mb-2">
              Total Students: {filteredStudents.length}
            </div>
            <div className="overflow-x-auto shadow rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-sky-200 text-gray-700 text-sm">
                  <tr>
                    <th className="px-4 py-3 text-left">First Name</th>
                    <th className="px-4 py-3 text-left">Last Name</th>
                    <th className="px-4 py-3 text-left">College Code</th>
                    <th className="px-4 py-3 text-left">Roll No</th>
                    <th className="px-4 py-3 text-left">Branch</th>
                    <th className="px-4 py-3 text-left">Year</th>
                    <th className="px-4 py-3 text-left">Mobile</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100 text-sm">
                  {filteredStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2">{student.first_name}</td>
                      <td className="px-4 py-2">{student.last_name}</td>
                      <td className="px-4 py-2">{student.college_code}</td>
                      <td className="px-4 py-2">{student.roll_no}</td>
                      <td className="px-4 py-2">{student.branch}</td>
                      <td className="px-4 py-2">{student.year}</td>
                      <td className="px-4 py-2">{student.mobile}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : selectedCollege ? (
          <p className="text-gray-500 mt-4">No students found.</p>
        ) : null}
      </div>
    </DashboardLayout>
  );
}
