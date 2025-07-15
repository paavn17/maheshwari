'use client';

import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import DashboardLayout from '@/components/institute/page-layout';

export default function AddStudentsPage() {
  const initialForm = {
    name: '',
    father_name: '',
    roll_no: '',
    mobile: '',
    email: '',
    gender: '',
    dob: '',
    blood_group: '',
    adhaar_no: '',
    identification: '',
    address: '',
    class: '',
    section: '',
    branch: '',
    student_type: '', // School / Intermediate / College
  };

  const requiredFields = ['name', 'roll_no', 'mobile', 'student_type'];

  const [formData, setFormData] = useState(initialForm);
  const [fileData, setFileData] = useState([]);
  const [statusMessage, setStatusMessage] = useState('');
  const fileInputRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const isFormValid = () =>
    requiredFields.every((field) => formData[field]?.trim() !== '');

  const handleManualSubmit = async () => {
    if (!isFormValid()) {
      setStatusMessage('❌ Please fill all required fields marked with *');
      return;
    }

    setStatusMessage('⏳ Adding student...');
    const res = await fetch('/api/institute/upload-student', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    const data = await res.json();
    setStatusMessage(data.success ? '✅ Student added successfully' : `❌ ${data.error}`);
    setFormData(initialForm);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const workbook = XLSX.read(evt.target.result, { type: 'binary' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet);

      const invalidRow = json.findIndex((student, i) =>
        requiredFields.some((field) => !student[field] || student[field].toString().trim() === '')
      );

      if (invalidRow !== -1) {
        setStatusMessage(`❌ Missing required fields in row ${invalidRow + 2} of Excel`);
        setFileData([]);
        return;
      }

      setFileData(json);
      setStatusMessage(`📄 Loaded ${json.length} students from Excel.`);
    };
    reader.readAsBinaryString(file);
  };

  const handleCellChange = (index, field, value) => {
    setFileData((prev) => {
      const copy = [...prev];
      copy[index][field] = value;
      return copy;
    });
  };

  const handleBulkUpload = async () => {
    if (!fileData || fileData.length === 0) {
      setStatusMessage('❌ Please upload a valid Excel file.');
      return;
    }

    setStatusMessage('⏳ Uploading...');
    const res = await fetch('/api/institute/upload-student-bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ students: fileData }),
    });

    const data = await res.json();
    setStatusMessage(data.success ? '✅ Bulk upload successful!' : `❌ ${data.error}`);
    fileInputRef.current.value = null;
    setFileData([]);
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold text-sky-800 mb-6">📥 Upload Student Data</h1>

        {/* Manual Entry Form */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-sky-700 mb-4">🔹 Manual Entry</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-w-6xl">
            {Object.entries(formData).map(([key, value]) => (
              <div key={key}>
                <label className="block text-sm text-gray-700 mb-1 capitalize">
                  {key.replace('_', ' ')} {requiredFields.includes(key) ? '*' : ''}
                </label>
                <input
                  type={key === 'dob' ? 'date' : 'text'}
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
            className="mt-4 bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded shadow"
          >
            ➕ Add Student
          </button>
        </section>

        {/* Excel Upload */}
       <section>
  <h2 className="text-xl font-semibold text-sky-700 mb-4">📑 Excel Upload</h2>
  <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center mb-4">
    <input
      type="file"
      accept=".xlsx, .xls"
      ref={fileInputRef}
      onChange={handleFileChange}
      className="file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-sky-200 file:text-gray-700 hover:file:bg-sky-300"
    />
    <button
      onClick={handleBulkUpload}
      className="bg-sky-600 text-white px-4 py-2 rounded hover:bg-sky-700 transition"
    >
      ⬆️ Upload File
    </button>
  </div>

  {statusMessage && (
    <p className="text-sm mt-2 font-medium text-sky-700">{statusMessage}</p>
  )}

  {/* Live Preview Table */}
  {fileData.length > 0 && (
    <div className="overflow-auto mt-6 max-h-[500px] border border-gray-300 rounded shadow">
      <table className="min-w-full text-sm table-fixed">
        <thead className="bg-gray-100 sticky top-0 z-10">
          <tr>
            {Object.keys(fileData[0]).map((field) => (
              <th
                key={field}
                className="px-3 py-2 border-b text-left font-medium text-gray-700 min-w-[160px] truncate"
              >
                {field.replace(/_/g, ' ')}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {fileData.map((student, index) => (
            <tr key={index} className="even:bg-white odd:bg-gray-50">
              {Object.entries(student).map(([field, value]) => (
                <td key={field} className="px-3 py-1 border-b align-top min-w-[160px]">
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => handleCellChange(index, field, e.target.value)}
                    className="w-full p-1 border border-gray-300 rounded bg-white text-sm"
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )}
</section>


      </div>
    </DashboardLayout>
  );
}
