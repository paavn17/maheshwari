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
    student_type: '',
  };

  const requiredFields = ['name', 'roll_no', 'mobile', 'student_type'];
  const [formData, setFormData] = useState(initialForm);
  const [imageBase64, setImageBase64] = useState('');
  const [fileData, setFileData] = useState([]);
  const [imageMap, setImageMap] = useState({});
  const [statusMessage, setStatusMessage] = useState('');
  const fileInputRef = useRef(null);
  const folderInputRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImageBase64(reader.result);
    reader.readAsDataURL(file);
  };

  const isFormValid = () =>
    requiredFields.every((field) => formData[field]?.trim() !== '');

  const handleManualSubmit = async () => {
    if (!isFormValid()) {
      setStatusMessage(' Please fill all required fields marked with *');
      return;
    }
    try {
      const payload = { ...formData, profile_pic: imageBase64 };
      setStatusMessage('⏳ Adding student...');
      const res = await fetch('/api/institute/upload-student', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      setStatusMessage(data.success ? '✅ Student added successfully' : ` ${data.error}`);
      setFormData(initialForm);
      setImageBase64('');
    } catch (err) {
      setStatusMessage(' Upload failed.');
      console.error(err);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const workbook = XLSX.read(evt.target.result, { type: 'binary' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet);

      const invalidRow = json.findIndex((row) =>
        requiredFields.some((field) => !row[field]?.toString().trim())
      );
      if (invalidRow !== -1) {
        setStatusMessage(` Missing required fields in row ${invalidRow + 2}`);
        setFileData([]);
        return;
      }

      const enriched = json.map((row) => {
        const matchKey = row.roll_no?.toString();
        const preview = imageMap[matchKey] || null;
        return preview ? { ...row, preview } : row;
      });

      setFileData(enriched);
      setStatusMessage(` Loaded ${json.length} students.`);
    };
    reader.readAsBinaryString(file);
  };

  const handleFolderUpload = (e) => {
    const files = e.target.files;
    const newImageMap = {};
    const readers = [];

    Array.from(files).forEach((file) => {
      const key = file.name.split('.')[0];
      const reader = new FileReader();
      readers.push(
        new Promise((resolve) => {
          reader.onloadend = () => {
            newImageMap[key] = reader.result;
            resolve();
          };
          reader.readAsDataURL(file);
        })
      );
    });

    Promise.all(readers).then(() => {
      setImageMap(newImageMap);
      setStatusMessage(` Loaded ${Object.keys(newImageMap).length} photos`);

      setFileData((prevData) =>
        prevData.map((student) => {
          const roll = student.roll_no?.toString();
          const preview = newImageMap[roll];
          return preview ? { ...student, preview } : student;
        })
      );
    });
  };

  const handleCellChange = (index, field, value) => {
    setFileData((prev) => {
      const updated = [...prev];
      updated[index][field] = value;
      return updated;
    });
  };

  const handleBulkUpload = async () => {
    if (!fileData.length) {
      setStatusMessage(' Please upload an Excel file.');
      return;
    }

    setStatusMessage('⏳ Uploading students...');
    const payload = fileData.map(({ preview, ...rest }) => ({
      ...rest,
      profile_pic: preview || '',
    }));

    const res = await fetch('/api/institute/upload-student-bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ students: payload }),
    });

    const data = await res.json();
    setStatusMessage(data.success ? 'Excel  upload successful' : ` ${data.error}`);
    setFileData([]);
    fileInputRef.current.value = null;
  };

  return (
    <DashboardLayout>
      <div className="p-6 min-h-screen">
        <h1 className="text-3xl font-bold text-orange-700 mb-6"> Upload Student Data</h1>

        {/* Manual Form */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-orange-600 mb-4"> Manual Entry</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 max-w-6xl">
            {Object.entries(formData).map(([key, value]) => (
              <div key={key}>
                <label className="block text-sm text-orange-800 mb-1 capitalize font-medium">
                  {key.replace(/_/g, ' ')} {requiredFields.includes(key) ? '*' : ''}
                </label>
                <input
                  type={key === 'dob' ? 'date' : 'text'}
                  name={key}
                  value={value}
                  onChange={handleInputChange}
                  className="p-2 border border-orange-300 focus:ring-2 focus:ring-orange-400 rounded w-full text-sm"
                  placeholder={`Enter ${key.replace(/_/g, ' ')}`}
                />
              </div>
            ))}

            <div>
              <label className="block text-sm text-orange-800 mb-1 font-medium">Profile Photo</label>
              <input type="file" accept="image/*" onChange={handleImageChange} />
              {imageBase64 && (
                <img src={imageBase64} className="w-24 h-24 mt-2 rounded object-cover border border-orange-200 shadow" />
              )}
            </div>
          </div>

          <button
            onClick={handleManualSubmit}
            className="mt-5 bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded shadow font-medium"
          >
            ➕ Add Student
          </button>
        </section>

        {/* Bulk Upload Section */}
        <section>
          <h2 className="text-xl font-semibold text-orange-600 mb-4"> Excel Upload</h2>

          <div className="flex flex-col sm:flex-row gap-4 items-start mb-4">
            <input
              type="file"
              accept=".xlsx, .xls"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="text-sm text-orange-800"
            />
            <input
              type="file"
              webkitdirectory="true"
              directory=""
              multiple
              ref={folderInputRef}
              onChange={handleFolderUpload}
              className="text-sm text-orange-600"
            />
            <button
              onClick={handleBulkUpload}
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded shadow"
            >
               Upload All
            </button>
          </div>

          {statusMessage && (
            <p className="text-sm mt-2 text-orange-800 font-semibold">{statusMessage}</p>
          )}

          {/* Table Preview */}
          {fileData.length > 0 && (
            <div className="overflow-auto mt-6 max-h-[600px] border border-orange-300 rounded shadow">
              <table className="min-w-full text-sm table-fixed border-collapse">
                <thead className="bg-orange-100 sticky top-0 z-10 text-orange-900">
                  <tr>
                    {Object.keys(fileData[0])
                      .filter((key) => key !== 'preview')
                      .map((key) => (
                        <th
                          key={key}
                          className="px-4 py-3 text-left font-semibold border-b border-orange-300"
                          style={{ minWidth: '150px' }}
                        >
                          {key.replace(/_/g, ' ')}
                        </th>
                      ))}
                    <th className="px-4 py-3 border-b border-orange-300">Image</th>
                  </tr>
                </thead>
                <tbody>
                  {fileData.map((student, index) => (
                    <tr key={index} className="odd:bg-white even:bg-orange-50">
                      {Object.entries(student)
                        .filter(([key]) => key !== 'preview')
                        .map(([key, value]) => (
                          <td
                            key={key}
                            className="px-3 py-2 border-b border-orange-200"
                          >
                            <input
                              value={value}
                              onChange={(e) => handleCellChange(index, key, e.target.value)}
                              className="w-full p-1 border border-orange-300 rounded text-xs focus:outline-orange-400"
                              type="text"
                            />
                          </td>
                        ))}
                      <td className="px-2 py-2 border-b border-orange-200 text-center">
                        {student.preview ? (
                          <img
                            src={student.preview}
                            className="w-12 h-12 object-cover rounded shadow inline-block"
                          />
                        ) : (
                          <span className="text-xs text-gray-400">No Image</span>
                        )}
                      </td>
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
