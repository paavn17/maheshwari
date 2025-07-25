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

  // Required fields for ID card + photo mandated
  const requiredFields = ['name', 'emp_id', 'mobile', 'dob', 'blood_group'];

  // Single employee form state
  const [formData, setFormData] = useState(initialForm);
  const [imageBase64, setImageBase64] = useState('');
  const [formErrors, setFormErrors] = useState([]);
  const [formStatus, setFormStatus] = useState('');

  // Bulk upload states
  const [fileData, setFileData] = useState([]);
  const [imageMap, setImageMap] = useState({});
  const [bulkErrors, setBulkErrors] = useState([]);
  const [bulkStatus, setBulkStatus] = useState('');

  const fileInputRef = useRef(null);
  const folderInputRef = useRef(null);

  // Input change for manual form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Image upload for manual form
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setImageBase64(reader.result);
    reader.readAsDataURL(file);
  };

  // Validate manual form with required fields & photo
  const validateManualForm = () => {
    const errors = [];
    requiredFields.forEach((field) => {
      if (!formData[field] || formData[field].toString().trim() === '') {
        errors.push(`Field "${field.replace(/_/g, ' ')}" is required.`);
      }
    });
    if (!imageBase64) errors.push('Profile photo is required.');
    setFormErrors(errors);
    return errors.length === 0;
  };

  // Manual form submit
  const handleManualSubmit = async () => {
    if (!validateManualForm()) {
      setFormStatus('❌ Please fix the errors above.');
      return;
    }
    setFormStatus('⏳ Adding employee...');
    try {
      const payload = { ...formData, profile_pic: imageBase64 };
      const res = await fetch('/api/institute/employees/add-single', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setFormStatus('✅ Employee added successfully');
        setFormData(initialForm);
        setImageBase64('');
        setFormErrors([]);
      } else {
        setFormStatus(`❌ ${data.error || 'Failed to add employee'}`);
      }
    } catch (err) {
      console.error(err);
      setFormStatus('❌ Network error');
    }
  };

  // Bulk upload validation (required fields + image preview required)
  const validateFileData = (data) => {
    const errors = [];
    data.forEach((employee, idx) => {
      const missingFields = [];
      requiredFields.forEach((field) => {
        if (!employee[field] || employee[field].toString().trim() === '') {
          missingFields.push(field);
        }
      });
      if (!employee.preview) missingFields.push('profile photo (missing image)');
      if (missingFields.length) {
        errors.push(`Row ${idx + 2}: Missing fields - ${missingFields.join(', ')}`);
      }
    });
    return errors;
  };

  // Excel file change handler (load and preview)
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBulkStatus('');
    setBulkErrors([]);
    setFileData([]);

    const reader = new FileReader();
    reader.onload = (evt) => {
      const workbook = XLSX.read(evt.target.result, { type: 'binary' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet);

      const enriched = json.map((row) => {
        const key = row.emp_id?.toString();
        const preview = imageMap[key] || null;
        return preview ? { ...row, preview } : row;
      });

      setFileData(enriched);
      setBulkStatus(`📄 Loaded ${json.length} employees from Excel.`);
    };
    reader.readAsBinaryString(file);
  };

  // Folder upload for employee photos
  const handleFolderUpload = (e) => {
    const files = e.target.files;
    if (!files.length) {
      setBulkErrors(['Please select a folder with employee images.']);
      setFileData([]);
      return;
    }
    setBulkErrors([]);
    setBulkStatus('');

    const newImageMap = {};
    const readers = [];

    Array.from(files).forEach((file) => {
      const key = file.name.split('.')[0]; // filename without extension = emp_id
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
      setBulkStatus(`🖼️ Loaded ${Object.keys(newImageMap).length} images.`);
      setFileData((prevData) =>
        prevData.map((employee) => {
          const roll = employee.emp_id?.toString();
          const preview = newImageMap[roll];
          return preview ? { ...employee, preview } : employee;
        })
      );
    });
  };

  // Inline edit in bulk preview table
  const handleCellChange = (index, field, value) => {
    setFileData((prev) => {
      const newData = [...prev];
      newData[index][field] = value;
      return newData;
    });
  };

  // Bulk upload submit
  const handleBulkUpload = async () => {
    if (!fileData.length) {
      setBulkStatus('❌ Please select a valid Excel file.');
      return;
    }
    if (Object.keys(imageMap).length === 0) {
      setBulkStatus('❌ Please upload the employee images folder.');
      return;
    }

    const errors = validateFileData(fileData);
    if (errors.length) {
      setBulkErrors(errors);
      setBulkStatus('❌ Please fix the above errors before uploading.');
      return;
    }

    setBulkStatus('⏳ Uploading employees...');
    setBulkErrors([]);
    try {
      const payload = fileData.map(({ preview, ...rest }) => ({
        ...rest,
        profile_pic: preview || '',
      }));

      const res = await fetch('/api/institute/employees/bulk-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employees: payload }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setBulkStatus('✅ Bulk upload successful!');
        setFileData([]);
        fileInputRef.current.value = null;
        folderInputRef.current.value = null;
        setImageMap({});
        setBulkErrors([]);
      } else {
        setBulkStatus(`❌ ${data.error || 'Upload failed'}`);
      }
    } catch (error) {
      console.error(error);
      setBulkStatus('❌ Upload failed due to network error.');
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 min-h-screen max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-orange-700 mb-6">Upload Employee Data</h1>

        {/* Single Entry Form */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-orange-600 mb-4">Add Single Employee</h2>
          {formErrors.length > 0 && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded border border-red-300 max-w-4xl">
              <ul className="list-disc pl-5 text-sm max-h-40 overflow-auto">
                {formErrors.map((err, idx) => (
                  <li key={idx}>{err}</li>
                ))}
              </ul>
            </div>
          )}
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
                  placeholder={`Enter ${key.replace(/_/g, ' ')}`}
                />
              </div>
            ))}
            <div>
              <label className="block text-sm font-medium text-orange-800 mb-1">Profile Picture *</label>
              <input type="file" accept="image/*" onChange={handleImageChange} className="text-sm" />
              {imageBase64 && (
                <img
                  src={imageBase64}
                  alt="Profile Preview"
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
          {formStatus && <p className="mt-3 text-sm font-semibold text-orange-800">{formStatus}</p>}
        </section>

        {/* Bulk Upload */}
        <section>
          <h2 className="text-xl font-semibold text-orange-600 mb-4">Upload via Excel</h2>
          <p className="text-sm mb-4 text-orange-700 max-w-xl">
            Upload an Excel file with employee data (without photos) and a folder with employee images named by emp_id.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center mb-4 max-w-xl">
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
              Upload File
            </button>
          </div>

          {bulkErrors.length > 0 && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded border border-red-300 max-w-4xl">
              <ul className="list-disc pl-5 text-sm max-h-40 overflow-auto">
                {bulkErrors.map((err, idx) => (
                  <li key={idx}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {bulkStatus && <p className="text-sm mt-2 text-orange-800 font-semibold">{bulkStatus}</p>}

          {fileData.length > 0 && (
            <div className="overflow-auto mt-6 max-h-[500px] border border-orange-300 rounded shadow max-w-full">
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
                  {fileData.map((row, idx) => (
                    <tr key={idx} className="even:bg-orange-50 odd:bg-white">
                      {Object.entries(row)
                        .filter(([key]) => key !== 'preview')
                        .map(([field, value]) => (
                          <td key={field} className="px-3 py-2 border-b border-orange-200">
                            <input
                              type="text"
                              value={value}
                              onChange={(e) => handleCellChange(idx, field, e.target.value)}
                              className="w-full p-1 border border-orange-300 rounded text-xs bg-white focus:outline-none focus:ring-1 focus:ring-orange-400"
                            />
                          </td>
                        ))}
                      <td className="px-3 py-2 border-b border-orange-200 text-center">
                        {row.preview ? (
                          <img
                            src={row.preview}
                            alt="Preview"
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
        </section>
      </div>
    </DashboardLayout>
  );
}
