'use client';

import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import DashboardLayout from '@/components/institute/page-layout';

export default function UploadEmployeesPage() {
  const initialForm = {
    name: '',
    father_name: '',
    emp_id: '',
    pf_no: '',
    designation: '',
    department: '',
    doj: '',
    dob: '',
    gender: '',
    mobile: '',
    email: '',
    adhaar_no: '',
    blood_group: '',
    identification: '',
    address: '',
  };

  const requiredFields = ['name', 'emp_id', 'mobile'];

  const [formData, setFormData] = useState(initialForm);
  const [imageBase64, setImageBase64] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [fileData, setFileData] = useState([]);
  const [imageMap, setImageMap] = useState({});
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
    reader.onloadend = () => {
      setImageBase64(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const isFormValid = () => requiredFields.every((field) => formData[field]?.trim() !== '');

  const handleManualSubmit = async () => {
    if (!isFormValid()) {
      setStatusMessage('❌ Please fill all required fields marked with *');
      return;
    }

    const payload = {
      ...formData,
      profile_pic: imageBase64,
    };

    setStatusMessage('⏳ Adding employee...');
    try {
      const res = await fetch('/api/institute/employees/add-single', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      setStatusMessage(data.success ? '✅ Employee added successfully' : `❌ ${data.error}`);
      setFormData(initialForm);
      setImageBase64('');
    } catch (err) {
      console.error(err);
      setStatusMessage('❌ Network error');
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
        setStatusMessage(`❌ Missing required fields in row ${invalidRow + 2}`);
        setFileData([]);
        return;
      }

      const enriched = json.map((row) => {
        const matchKey = row.emp_id?.toString();
        const matchedImage = imageMap[matchKey];
        return matchedImage ? { ...row, preview: matchedImage } : row;
      });

      setFileData(enriched);
      setStatusMessage(`📄 Loaded ${json.length} employees from Excel`);
    };
    reader.readAsBinaryString(file);
  };

  const handleCellChange = (index, field, value) => {
    setFileData((prev) => {
      const updated = [...prev];
      updated[index][field] = value;
      return updated;
    });
  };

  const handleFolderUpload = (e) => {
    const files = e.target.files;
    const newImageMap = {};
    const pending = [];

    Array.from(files).forEach((file) => {
      const key = file.name.split('.')[0];
      const reader = new FileReader();

      pending.push(
        new Promise((resolve) => {
          reader.onloadend = () => {
            newImageMap[key] = reader.result;
            resolve();
          };
          reader.readAsDataURL(file);
        })
      );
    });

    Promise.all(pending).then(() => {
      setImageMap(newImageMap);
      setStatusMessage(`🖼️ Loaded ${Object.keys(newImageMap).length} images.`);
    });
  };

  const handleBulkUpload = async () => {
    if (!fileData.length) {
      setStatusMessage('❌ Please select a valid Excel file.');
      return;
    }

    setStatusMessage('⏳ Uploading employees...');
    try {
      const payload = fileData.map((emp) => ({
        ...emp,
        profile_pic: imageMap[emp.emp_id?.toString()] || '',
      }));

      const res = await fetch('/api/institute/employees/bulk-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employees: payload }),
      });

      const data = await res.json();
      setStatusMessage(data.success ? '✅ Bulk upload successful!' : `❌ ${data.error}`);
      setFileData([]);
      fileInputRef.current.value = null;
    } catch (err) {
      console.error(err);
      setStatusMessage('❌ Upload failed.');
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold text-sky-800 mb-6">📥 Upload Employee Data</h1>

        {/* Single Upload */}
        <section>
          <h2 className="text-xl font-semibold text-sky-700 mb-4">🔹 Add Single Employee</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-w-6xl">
            {Object.entries(formData).map(([key, value]) => (
              <div key={key}>
                <label className="block text-sm text-gray-700 mb-1 capitalize">
                  {key.replace(/_/g, ' ')} {requiredFields.includes(key) ? '*' : ''}
                </label>
                <input
                  type={['dob', 'doj'].includes(key) ? 'date' : 'text'}
                  name={key}
                  value={value}
                  onChange={handleInputChange}
                  className="p-2 border border-gray-300 rounded w-full"
                />
              </div>
            ))}

            <div>
              <label className="block text-sm text-gray-700 mb-1">Profile Picture</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="p-2 border border-gray-300 rounded w-full"
              />
              {imageBase64 && (
                <img
                  src={imageBase64}
                  alt="Preview"
                  className="mt-2 w-32 h-32 object-cover border rounded"
                />
              )}
            </div>
          </div>

          <button
            onClick={handleManualSubmit}
            className="mt-4 bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded shadow"
          >
            ➕ Add Employee
          </button>
        </section>

        {/* Bulk Upload */}
        <section className="mt-12">
          <h2 className="text-xl font-semibold text-sky-700 mb-4">📑 Bulk Upload via Excel</h2>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center mb-4">
            <input
              type="file"
              accept=".xlsx, .xls"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-sky-200 file:text-gray-700 hover:file:bg-sky-300"
            />
            <input
              type="file"
              webkitdirectory="true"
              multiple
              ref={folderInputRef}
              onChange={handleFolderUpload}
              className="text-sm text-sky-600"
            />
            <button
              onClick={handleBulkUpload}
              className="bg-sky-600 text-white px-4 py-2 rounded hover:bg-sky-700 transition"
            >
              ⬆️ Upload File
            </button>
          </div>

          {fileData.length > 0 && (
            <div className="overflow-auto max-h-[500px] border border-gray-300 rounded shadow">
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
                    <th className="px-3 py-2 border-b text-left font-medium text-gray-700 min-w-[160px]">Image</th>
                  </tr>
                </thead>
                <tbody>
                  {fileData.map((row, index) => (
                    <tr key={index} className="even:bg-white odd:bg-gray-50">
                      {Object.entries(row).map(([field, value]) => (
                        <td key={field} className="px-3 py-1 border-b align-top min-w-[160px]">
                          <input
                            type="text"
                            value={value}
                            onChange={(e) => handleCellChange(index, field, e.target.value)}
                            className="w-full p-1 border border-gray-300 rounded bg-white text-sm"
                          />
                        </td>
                      ))}
                      <td className="px-3 py-1 border-b">
                        {row.preview ? (
                          <img
                            src={row.preview}
                            alt="preview"
                            className="w-12 h-12 object-cover rounded"
                          />
                        ) : (
                          <span className="text-xs text-gray-400">No image</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {statusMessage && (
          <p className="text-sm mt-6 font-medium text-sky-700">{statusMessage}</p>
        )}
      </div>
    </DashboardLayout>
  );
}