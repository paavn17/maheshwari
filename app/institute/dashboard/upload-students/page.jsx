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
  };

  const [institutionType, setInstitutionType] = useState('');
  const [formData, setFormData] = useState(initialForm);
  const [imageBase64, setImageBase64] = useState('');

  const [fileData, setFileData] = useState([]);
  const [imageMap, setImageMap] = useState({});
  const [formErrors, setFormErrors] = useState([]);
  const [bulkErrors, setBulkErrors] = useState([]);
  const [formStatus, setFormStatus] = useState('');
  const [bulkStatus, setBulkStatus] = useState('');
  const fileInputRef = useRef(null);
  const folderInputRef = useRef(null);

  const requiredAlways = ['name', 'roll_no', 'mobile', 'dob', 'blood_group'];
  const requiredFields = [
    ...requiredAlways,
    ...(institutionType === 'school' ? ['class', 'section'] : []),
    ...(institutionType === 'college' ? ['branch'] : []),
  ];

  // --- Manual form handlers and validation ---

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

  const validateManualForm = () => {
    const missingFields = !institutionType
      ? []
      : requiredFields.filter(
          (field) => !formData[field] || formData[field].toString().trim() === ''
        );
    const err = [];
    if (!institutionType) err.push('Please select institution type.');
    if (missingFields.length > 0) err.push(`Missing: ${missingFields.join(', ')}`);
    if (!imageBase64) err.push('Please upload a profile photo.');
    setFormErrors(err);
    return err.length === 0;
  };

  const handleManualSubmit = async () => {
    if (!validateManualForm()) {
      setFormStatus('⚠️ Please fix the errors above.');
      return;
    }
    try {
      setFormStatus('⏳ Adding student...');
      const payload = {
        ...formData,
        profile_pic: imageBase64,
        institution_type: institutionType,
      };

      const res = await fetch('/api/institute/upload-student', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setFormStatus('✅ Student added successfully');
        setFormData(initialForm);
        setImageBase64('');
        setFormErrors([]);
      } else {
        setFormStatus(`❌ ${data.error || 'Failed to add student'}`);
      }
    } catch {
      setFormStatus('❌ Upload failed.');
    }
  };

  // --- Bulk upload handlers and validation ---

  const validateBulkData = (data) => {
    const errs = [];
    data.forEach((student, idx) => {
      const missing = !institutionType
        ? []
        : requiredAlways.filter(
            (field) => !student[field] || student[field].toString().trim() === ''
          );
      if (institutionType === 'school') {
        if (!student.class || student.class.toString().trim() === '') missing.push('class');
        if (!student.section || student.section.toString().trim() === '') missing.push('section');
      }
      if (institutionType === 'college') {
        if (!student.branch || student.branch.toString().trim() === '') missing.push('branch');
      }
      if (!student.preview) missing.push('profile photo (missing image in folder)');
      if (!institutionType) missing.push('institution type');
      if (missing.length > 0) errs.push(`Row ${idx + 2}: Missing fields: ${missing.join(', ')}`);
    });
    return errs;
  };

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

      // Just store raw data for preview now, images linked after folder upload
      const enriched = json.map((row) => {
        const matchKey = row.roll_no?.toString();
        const preview = imageMap[matchKey] || null;
        return preview ? { ...row, preview } : row;
      });

      setFileData(enriched);
      setBulkErrors([]);
      setBulkStatus(`Loaded ${json.length} students. Now upload photos folder.`);
    };
    reader.readAsBinaryString(file);
  };

  const handleFolderUpload = (e) => {
    const files = e.target.files;
    if (!files.length) {
      setBulkErrors(['Please select a folder with student photos (image files).']);
      setFileData([]);
      return;
    }

    setBulkErrors([]);
    setBulkStatus('');

    const newImageMap = {};
    const readers = [];

    Array.from(files).forEach((file) => {
      const key = file.name.split('.')[0]; // photo file name without extension
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
      setBulkStatus(`Loaded ${Object.keys(newImageMap).length} photos`);

      // Update previews in fileData
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
    // Validate presence of required inputs
    if (!fileData.length) {
      setBulkStatus('⚠️ Please upload an Excel file first.');
      return;
    }
    if (Object.keys(imageMap).length === 0) {
      setBulkStatus('⚠️ Please upload the photos folder first.');
      return;
    }
    if (!institutionType) {
      setBulkStatus('⚠️ Please select institution type.');
      return;
    }

    // Validate all rows have photos
    const missingImages = fileData.some((student) => !student.preview);
    if (missingImages) {
      setBulkStatus('⚠️ Missing photos for some students, please check the photos folder.');
      return;
    }

    // Validate all fields
    const validationErrors = validateBulkData(fileData);
    if (validationErrors.length > 0) {
      setBulkErrors(validationErrors);
      setBulkStatus('⚠️ Please fix the errors before uploading.');
      return;
    }

    setBulkStatus('⏳ Uploading students...');
    setBulkErrors([]);

    const payload = fileData.map(({ preview, ...rest }) => ({
      ...rest,
      profile_pic: preview || '',
      institution_type: institutionType,
    }));

    try {
      const res = await fetch('/api/institute/upload-student-bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ students: payload }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setBulkStatus('✅ Excel upload successful');
        setFileData([]);
        fileInputRef.current.value = null;
        folderInputRef.current.value = null;
        setImageMap({});
        setBulkErrors([]);
      } else {
        setBulkStatus(`❌ ${data.error || 'Upload failed'}`);
      }
    } catch {
      setBulkStatus('❌ Upload failed due to network or server error.');
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 min-h-screen max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-orange-700 mb-6">Upload Student Data</h1>

        {/* Institution type dropdown */}
        <div className="mb-6 max-w-xs">
          <label className="block text-sm font-medium text-orange-800 mb-2">
            Select Institution Type <span className="text-red-500">*</span>
          </label>
          <select
            value={institutionType}
            onChange={(e) => setInstitutionType(e.target.value)}
            className="p-2 border border-orange-300 rounded text-sm w-full"
            required
            disabled={false}
          >
            <option value="">-- Select --</option>
            <option value="school">School</option>
            <option value="college">College</option>
          </select>
        </div>

        {/* Manual upload section */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-orange-600 mb-4">Manual Entry</h2>

          {formErrors.length > 0 && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded border border-red-300 max-w-4xl">
              <ul className="list-disc pl-5 text-sm max-h-40 overflow-auto">
                {formErrors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 max-w-6xl">
            {Object.entries(formData).map(([key, value]) => {
              const isRequired = requiredFields.includes(key);
              return (
                <div key={key}>
                  <label className="block text-sm text-orange-800 mb-1 capitalize font-medium">
                    {key.replace(/_/g, ' ')} {isRequired ? '*' : ''}
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
              );
            })}
            <div>
              <label className="block text-sm text-orange-800 mb-1 font-medium">
                Profile Photo *
              </label>
              <input type="file" accept="image/*" onChange={handleImageChange} />
              {imageBase64 && (
                <img
                  src={imageBase64}
                  alt="profile preview"
                  className="w-24 h-24 mt-2 rounded object-cover border border-orange-200 shadow"
                />
              )}
            </div>
          </div>
          <button
            onClick={handleManualSubmit}
            className="mt-5 bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded shadow font-medium"
            disabled={!institutionType}
          >
            ➕ Add Student
          </button>
          {formStatus && (
            <p className="mt-3 text-sm font-semibold text-orange-800">{formStatus}</p>
          )}
        </section>

        {/* Bulk upload section */}
        <section>
          <h2 className="text-xl font-semibold text-orange-600 mb-4">Excel & Photos Upload</h2>
          <p className="text-sm mb-4 text-orange-700 max-w-xl">
            Upload an Excel file with student data (without photos) and a folder containing student images named by roll number.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 items-center mb-4 max-w-xl">
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
              disabled={!institutionType || fileData.length === 0 || Object.keys(imageMap).length === 0}
              title={
                !institutionType
                  ? 'Select institution type first'
                  : fileData.length === 0
                  ? 'Upload Excel file first'
                  : Object.keys(imageMap).length === 0
                  ? 'Upload images folder first'
                  : ''
              }
            >
              Upload All
            </button>
          </div>

          {bulkErrors.length > 0 && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded border border-red-300 max-w-4xl">
              <ul className="list-disc pl-5 text-sm max-h-40 overflow-auto">
                {bulkErrors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}
          {bulkStatus && (
            <p className="text-sm mt-2 text-orange-800 font-semibold">{bulkStatus}</p>
          )}

          {/* Preview table */}
          {fileData.length > 0 && (
            <div className="overflow-auto mt-6 max-h-[600px] border border-orange-300 rounded shadow max-w-full">
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
                            alt="Preview"
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
