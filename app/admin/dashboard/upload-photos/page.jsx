'use client';

import React, { useState, useMemo } from 'react';
import DashboardLayout from '@/components/admin/page-layout';
import {
  getStudentsByCollege,
  getUniqueColleges,
  getBranchesByCollege,
} from '@/lib/fetchers/getStudents';

export default function UploadPhotosPage() {
  const [selectedCollege, setSelectedCollege] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [students, setStudents] = useState([]);
  const [uploadingId, setUploadingId] = useState(null);
  const [tempImages, setTempImages] = useState({});

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

  const handleFileChange = (e, studentId) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setTempImages((prev) => ({ ...prev, [studentId]: url }));
      setUploadingId(studentId);
    }
  };

  const handleSavePhoto = (student) => {
    const updated = {
      ...student,
      image: tempImages[student.id],
    };
    console.log('Updated Student:', updated);

    // Simulate update in local students state
    setStudents((prev) =>
      prev.map((s) => (s.id === student.id ? updated : s))
    );

    setUploadingId(null);
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-2xl font-semibold mb-6">Upload Photos & Payment Status</h1>

        {/* Filters */}
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

        {students.length > 0 && (
          <div className="mb-6">
            <label className="block text-gray-700 mb-1">Search Student:</label>
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="p-2 border border-gray-300 rounded w-full max-w-md"
            />
          </div>
        )}

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
                    <th className="p-2 border">Roll No</th>
                    <th className="p-2 border">Branch</th>
                    <th className="p-2 border">Photo</th>
                    <th className="p-2 border">Payment</th>
                    <th className="p-2 border">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student) => {
                    const tempImage = tempImages[student.id];

                    return (
                      <tr
                        key={student.id}
                        className={!student.image && !tempImage ? 'bg-red-100' : ''}
                      >
                        <td className="p-2 border">{student.first_name}</td>
                        <td className="p-2 border">{student.last_name}</td>
                        <td className="p-2 border">{student.roll_no}</td>
                        <td className="p-2 border">{student.branch}</td>
                        <td className="p-2 border">
                          {student.image || tempImage ? (
                            <img
                              src={tempImage || student.image}
                              alt="profile"
                              className="w-12 h-12 rounded object-cover"
                            />
                          ) : (
                            <>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleFileChange(e, student.id)}
                                className="text-xs bg-gray-100 p-2 rounded cursor-pointer"
                              />
                            </>
                          )}
                        </td>
                        <td className="p-2 border">
                          <span
                            className={
                              student.payment_status === 'paid'
                                ? 'text-green-600 font-medium'
                                : 'text-red-600 font-medium'
                            }
                          >
                            {student.payment_status}
                          </span>
                        </td>
                        <td className="p-2 border">
                          {uploadingId === student.id && tempImage && (
                            <button
                              onClick={() => handleSavePhoto(student)}
                              className="text-xs px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                            >
                              Save
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
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
