'use client';

import React, { useState, useMemo } from 'react';
import DashboardLayout from '@/components/admin/page-layout';
import {
  getStudentsByCollege,
  getUniqueColleges,
  getBranchesByCollege,
} from '@/lib/fetchers/getStudents';

export default function OrganizationWisePage() {
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

  const handleBranchChange = (e) => {
    setSelectedBranch(e.target.value);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

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

  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-2xl font-semibold mb-6">Organization-wise Student Details</h1>

        {/* College Selection */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-1">Select College:</label>
          <select
            value={selectedCollege}
            onChange={handleCollegeChange}
            className="p-2 border border-gray-300 rounded w-full max-w-md"
          >
            <option value="">-- Select a college --</option>
            {colleges.map((college, index) => (
              <option key={index} value={college}>
                {college}
              </option>
            ))}
          </select>
        </div>

        {/* Branch Selection */}
        {branches.length > 0 && (
          <div className="mb-4">
            <label className="block text-gray-700 mb-1">Select Branch:</label>
            <select
              value={selectedBranch}
              onChange={handleBranchChange}
              className="p-2 border border-gray-300 rounded w-full max-w-md"
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

        {/* Search Box */}
        {students.length > 0 && (
          <div className="mb-6">
            <label className="block text-gray-700 mb-1">Search Student (Name or Roll No):</label>
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="p-2 border border-gray-300 rounded w-full max-w-md"
            />
          </div>
        )}

        {/* Table */}
        {filteredStudents.length > 0 ? (
            <>
            <div className="flex justify-center text-sm text-gray-700 mb-2">
      Total Students: {filteredStudents.length}
        </div>
          <div className="overflow-x-auto">
            <table className="min-w-full border text-left text-sm">
              <thead className="bg-sky-100">
                <tr>
                  <th className="p-2 border">First Name</th>
                  <th className="p-2 border">Last Name</th>
                  <th className="p-2 border">College Code</th>
                  <th className="p-2 border">Roll No</th>
                  <th className="p-2 border">Branch</th>
                  <th className="p-2 border">Year</th>
                  <th className="p-2 border">Mobile</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => (
                  <tr key={student.id}>
                    <td className="p-2 border">{student.first_name}</td>
                    <td className="p-2 border">{student.last_name}</td>
                    <td className="p-2 border">{student.college_code}</td>
                    <td className="p-2 border">{student.roll_no}</td>
                    <td className="p-2 border">{student.branch}</td>
                    <td className="p-2 border">{student.year}</td>
                    <td className="p-2 border">{student.mobile}</td>
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
