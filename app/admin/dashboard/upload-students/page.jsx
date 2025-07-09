'use client';

import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import DashboardLayout from '@/components/admin/page-layout';
import { addStudent, addStudentsBulk } from '@/lib/fetchers/getStudents';

export default function AddStudentsPage() {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    college_code: '',
    college_name: '',
    roll_no: '',
    year: '',
    mobile: '',
    branch: '',
  });

  const [fileData, setFileData] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');
  const fileInputRef = useRef(null);

  const handleInputChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const isFormValid = () => {
    return Object.values(formData).every((value) => value.trim() !== '');
  };

  const handleManualSubmit = async () => {
    if (!isFormValid()) {
      setStatusMessage(' Please fill in all fields before submitting.');
      return;
    }
    setStatusMessage('Adding student...');
    await addStudent(formData);
    setStatusMessage(' Student added successfully!');
    setFormData({
      first_name: '',
      last_name: '',
      college_code: '',
      college_name: '',
      roll_no: '',
      year: '',
      mobile: '',
      branch: '',
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = evt.target.result;
      const workbook = XLSX.read(data, { type: 'binary' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(sheet);
      setFileData(json);
      setStatusMessage(`📄 Loaded ${json.length} students from Excel.`);
    };
    reader.readAsBinaryString(file);
  };

  const handleBulkUpload = async () => {
    if (!fileData || fileData.length === 0) {
      setStatusMessage(' Please upload a valid Excel file.');
      return;
    }
    setStatusMessage('Uploading students...');
    await addStudentsBulk(fileData);
    setStatusMessage(' Upload successful!');
    setFileData(null);
    fileInputRef.current.value = null;
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-2xl font-semibold mb-6">Add Student Data</h1>

        {/* Manual Entry */}
        <div className="mb-10">
          <h2 className="text-xl font-semibold mb-4">Manually Add a Student</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl">
            {Object.entries(formData).map(([key, value]) => (
              <div key={key}>
                <label className="block text-gray-700 mb-1 capitalize">
                  {key.replace('_', ' ')}:
                </label>
                <input
                  type="text"
                  name={key}
                  value={value}
                  onChange={handleInputChange}
                  className="p-2 border border-gray-300 rounded w-full"
                  placeholder={`Enter ${key.replace('_', ' ')}`}
                />
              </div>
            ))}
          </div>
          <button
            onClick={handleManualSubmit}
            className="mt-4 bg-sky-400 text-white px-4 py-2 rounded hover:bg-sky-700 transition"
          >
            Add Student
          </button>
        </div>

        {/* Excel Upload */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Upload Excel File</h2>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <input
              type="file"
              accept=".xlsx, .xls"
              onChange={handleFileChange}
              ref={fileInputRef}
              onClick={() => {
                fileInputRef.current.value = null; // keep this as you had
              }}
              className="file:mr-4 file:py-2 file:px-4
                        file:rounded file:border-0
                        file:text-sm file:font-semibold
                        file:bg-sky-200 file:text-gray-700
                        hover:file:bg-sky-300
                        max-w-xs"
        />

    <button
      onClick={handleBulkUpload}
      className="bg-sky-400 text-white px-4 py-2 rounded hover:bg-sky-700 transition"
    >
      Upload File
    </button>
  </div>
</div>

        {/* Status Message */}
        {statusMessage && (
          <p className="text-sm mt-4 font-medium text-sky-700">{statusMessage}</p>
        )}
      </div>
    </DashboardLayout>
  );
}
