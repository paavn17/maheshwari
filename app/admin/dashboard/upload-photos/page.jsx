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

    setStudents((prev) =>
      prev.map((s) => (s.id === student.id ? updated : s))
    );

    setUploadingId(null);
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-2xl font-semibold mb-6 text-gray-800">Upload Photos & Payment Status</h1>

        {/* Filters */}
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Search Student</label>
            <input
              type="text"
              placeholder="Search by name or roll number"
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full p-2 border border-gray-300 rounded"
            />
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
                    <th className="px-4 py-3 text-left">Roll No</th>
                    <th className="px-4 py-3 text-left">Branch</th>
                    <th className="px-4 py-3 text-left">Photo</th>
                    <th className="px-4 py-3 text-left">Payment</th>
                    <th className="px-4 py-3 text-left">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100 text-sm">
                  {filteredStudents.map((student) => {
                    const tempImage = tempImages[student.id];
                    const hasImage = student.image || tempImage;

                    return (
                      <tr
                        key={student.id}
                        className={!hasImage ? 'bg-red-50' : 'hover:bg-gray-50'}
                      >
                        <td className="px-4 py-2">{student.first_name}</td>
                        <td className="px-4 py-2">{student.last_name}</td>
                        <td className="px-4 py-2">{student.roll_no}</td>
                        <td className="px-4 py-2">{student.branch}</td>
                        <td className="px-4 py-2">
                          {hasImage ? (
                            <img
                              src={tempImage || student.image}
                              alt="profile"
                              className="w-12 h-12 rounded object-cover border"
                            />
                          ) : (
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleFileChange(e, student.id)}
                              className="text-xs bg-gray-100 rounded p-1 cursor-pointer"
                            />
                          )}
                        </td>
                        <td className="px-4 py-2 font-medium">
                          {student.payment_status === 'paid' ? (
                            <span className="text-green-600">Paid</span>
                          ) : (
                            <span className="text-red-600">Unpaid</span>
                          )}
                        </td>
                        <td className="px-4 py-2">
                          {uploadingId === student.id && tempImage && (
                            <button
                              onClick={() => handleSavePhoto(student)}
                              className="text-xs px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition"
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
