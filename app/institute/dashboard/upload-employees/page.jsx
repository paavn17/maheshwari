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
    reader.onloadend = () => setImageBase64(reader.result);
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
      <div className="p-6  min-h-screen">
        <h1 className="text-3xl font-bold text-orange-700 mb-6"> Upload Employee Data</h1>

        {/* Single Upload */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-orange-600 mb-4"> Add Single Employee</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 max-w-6xl">
            {Object.entries(formData).map(([key, value]) => (
              <div key={key}>
                <label className="block text-sm font-medium text-orange-800 mb-1 capitalize">
                  {key.replace(/_/g, ' ')} {requiredFields.includes(key) ? '*' : ''}
                </label>
                <input
                  type={['dob', 'doj'].includes(key) ? 'date' : 'text'}
                  name={key}
                  value={value}
                  onChange={handleInputChange}
                  className="p-2 border border-orange-300 rounded w-full text-sm focus:ring-2 focus:ring-orange-400"
                />
              </div>
            ))}

            <div>
              <label className="block text-sm font-medium text-orange-800 mb-1">Profile Picture</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="text-sm"
              />
              {imageBase64 && (
                <img
                  src={imageBase64}
                  alt="Preview"
                  className="mt-2 w-28 h-28 object-cover border border-orange-300 rounded shadow"
                />
              )}
            </div>
          </div>

          <button
            onClick={handleManualSubmit}
            className="mt-5 bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded shadow font-semibold"
          >
            ➕ Add Employee
          </button>
        </section>

        {/* Bulk Upload */}
        <section>
          <h2 className="text-xl font-semibold text-orange-600 mb-4"> Upload via Excel</h2>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center mb-4">
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
              multiple
              ref={folderInputRef}
              onChange={handleFolderUpload}
              className="text-sm text-orange-600"
            />
            <button
              onClick={handleBulkUpload}
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded shadow transition font-medium"
            >
              Upload File
            </button>
          </div>

          {fileData.length > 0 && (
            <div className="overflow-auto max-h-[500px] border border-orange-300 rounded-lg shadow">
              <table className="min-w-full text-sm table-fixed border-collapse">
                <thead className="bg-orange-100 sticky top-0 z-10 text-orange-800">
                  <tr>
                    {Object.keys(fileData[0])
                      .filter((key) => key !== 'preview')
                      .map((field) => (
                        <th
                          key={field}
                          className="px-3 py-2 border-b border-orange-300 text-left font-semibold min-w-[140px]"
                        >
                          {field.replace(/_/g, ' ')}
                        </th>
                      ))}
                    <th className="px-3 py-2 border-b border-orange-300 text-left font-semibold min-w-[140px]">
                      Image
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {fileData.map((row, index) => (
                    <tr key={index} className="even:bg-orange-50 odd:bg-white">
                      {Object.entries(row)
                        .filter(([key]) => key !== 'preview')
                        .map(([field, value]) => (
                          <td key={field} className="px-3 py-2 border-b border-orange-200">
                            <input
                              type="text"
                              value={value}
                              onChange={(e) => handleCellChange(index, field, e.target.value)}
                              className="w-full p-1 border border-orange-300 rounded text-xs bg-white focus:outline-none focus:ring-1 focus:ring-orange-400"
                            />
                          </td>
                        ))}
                      <td className="px-3 py-2 border-b border-orange-200 text-center">
                        {row.preview ? (
                          <img
                            src={row.preview}
                            alt="preview"
                            className="w-12 h-12 object-cover rounded border shadow"
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

          {statusMessage && (
            <p className="text-sm mt-6 font-medium text-orange-700">{statusMessage}</p>
          )}
        </section>
      </div>
    </DashboardLayout>
  );
}
