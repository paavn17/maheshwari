'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import StudentLayout from '@/components/student/page-layout';

const editableFields = [
  { label: "Name", key: "name" },
  { label: "Father's Name", key: "father_name" },
  { label: "Roll No", key: "roll_no" },
  { label: "Class", key: "class" },
  { label: "Section", key: "section" },
  { label: "Mobile", key: "mobile" },
  { label: "Email", key: "email" },
  { label: "Gender", key: "gender" },
  { label: "Date of Birth", key: "dob" },
  { label: "Blood Group", key: "blood_group" },
  { label: "Aadhaar Number", key: "adhaar_no" },
  { label: "Identification Marks", key: "identification" },
  { label: "Address", key: "address" },
  { label: "Branch", key: "branch" },
  { label: "Student Type", key: "student_type" }
];

const EditableInfoRow = ({
  label,
  value,
  editing,
  fieldKey,
  formData,
  onChange,
  oldValue,
}) => (
  <div className="flex flex-col gap-0.5">
    <span className="text-xs text-gray-500">{label}</span>
    {editing ? (
      <>
        <input
          className="w-full border rounded px-2 py-1 text-sm"
          type={fieldKey === 'dob' ? 'date' : 'text'}
          value={formData[fieldKey] ?? ''}
          onChange={e => onChange(fieldKey, e.target.value)}
        />
        <div className="text-xxs text-gray-400">
          Previous: {oldValue || <em>N/A</em>}
        </div>
      </>
    ) : (
      <span className="text-sm text-gray-800 font-medium">
        {value || <span className="italic text-gray-400">N/A</span>}
      </span>
    )}
  </div>
);

export default function StudentDashboard() {
  const [student, setStudent] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  // Fetch student on mount
  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const res = await fetch('/api/student/details', { credentials: 'include' });
        const data = await res.json();
        setStudent(data.student || {});
      } catch (err) {
        setStudent({});
      }
    };
    fetchStudent();
  }, []);

  // Reset formData to current student values when student changes or cancel editing
  useEffect(() => {
    if (student) {
      const initialFormData = {};
      editableFields.forEach(f => {
        // If dob is empty or null, set to empty string; else convert to yyyy-mm-dd for input[type=date]
        if (f.key === 'dob' && student[f.key]) {
          // Normalize date format to YYYY-MM-DD (safe for date input)
          const date = new Date(student[f.key]);
          initialFormData[f.key] = isNaN(date.getTime()) ? '' : date.toISOString().substr(0, 10);
        } else {
          initialFormData[f.key] = student[f.key] ?? '';
        }
      });
      setFormData(initialFormData);
    }
  }, [student]);

  const handleChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const getChanges = () => {
    if (!student) return [];
    return editableFields
      .filter(f => (formData[f.key] ?? '') !== (stringifyValue(student[f.key], f.key) ?? ''))
      .map(f => ({
        field_name: f.key,
        old_value: stringifyValue(student[f.key], f.key) ?? '',
        new_value: formData[f.key],
      }));
  };

  // Helper to normalize student original values for comparison (especially for dob)
  const stringifyValue = (val, key) => {
    if (val == null) return '';
    if (key === 'dob') {
      // Normalize date format
      const date = new Date(val);
      if (isNaN(date.getTime())) return '';
      return date.toISOString().substr(0, 10);
    }
    return String(val);
  };

  const hasChanges = getChanges().length > 0;

  const handleSave = async (e) => {
    e.preventDefault();

    if (!student) return;

    const changes = getChanges();

    if (!changes.length) {
      // No changes, just close edit mode silently
      setIsEditing(false);
      setMsg(null);
      return;
    }

    setLoading(true);
    setMsg(null);

    try {
      const res = await fetch('/api/student/request-change', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          institution_id: student.institution_id,
          roll_no: student.roll_no,
          section: student.section,
          class: student.class,
          changes,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMsg("Change request submitted successfully!");
        setIsEditing(false);
        // Optionally, refetch student details here to refresh data
      } else {
        setMsg(data.error || "Submission failed.");
      }
    } catch (err) {
      setMsg("Request failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form data to original student values
    if (student) {
      const resetData = {};
      editableFields.forEach(f => {
        resetData[f.key] = stringifyValue(student[f.key], f.key);
      });
      setFormData(resetData);
    }
    setIsEditing(false);
    setMsg(null);
  };

  if (!student) {
    return (
      <StudentLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-orange-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500 text-sm">Loading profile...</p>
          </div>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="max-w-5xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-xl font-semibold text-gray-800">
            {student.institution_name}
          </h1>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 flex flex-col md:flex-row gap-8">
          <div className="flex flex-col items-center w-full md:w-1/3">
            <Image
              src={student.profile_pic || '/images/avatar-placeholder.png'}
              alt="Profile"
              width={140}
              height={140}
              className="rounded-full border-4 border-orange-200 shadow object-cover"
              unoptimized
            />
            <span className="mt-3 bg-orange-100 text-orange-700 text-xs font-semibold px-3 py-1 rounded-full">
              Roll No: {student.roll_no || 'N/A'}
            </span>
          </div>

          <form className="grid grid-cols-1 sm:grid-cols-2 gap-6 flex-1 text-sm" onSubmit={handleSave}>
            {editableFields.map(({ label, key }) => (
              <EditableInfoRow
                key={key}
                label={label}
                value={student[key]}
                editing={isEditing}
                fieldKey={key}
                formData={formData}
                onChange={handleChange}
                oldValue={student[key]}
              />
            ))}

            <div className="col-span-full flex gap-3 mt-4">
              {isEditing ? (
                <>
                  <button
                    type="submit"
                    className="bg-orange-500 text-white px-6 py-2 rounded disabled:opacity-50"
                    disabled={loading || !hasChanges}
                  >
                    {loading ? 'Submitting...' : 'Save'}
                  </button>
                  <button
                    type="button"
                    className="bg-gray-200 px-6 py-2 rounded"
                    onClick={handleCancel}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  className="bg-orange-100 text-orange-700 border border-orange-300 rounded-lg font-medium px-6 py-2"
                  onClick={() => setIsEditing(true)}
                >
                  Edit
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Actions */}
        <div className="flex gap-4 justify-center mt-10">
          <button
            className="px-8 py-3 bg-orange-400 text-white rounded-lg font-medium hover:bg-orange-500 transition-colors disabled:opacity-50"
            disabled
          >
            Pay Now
          </button>
          <button
            onClick={() =>
              alert(`Downloading card: ${student.selected_id || 'Selected ID not found'}`)
            }
            className={`px-8 py-3 rounded-lg font-medium transition-colors ${
              student.payment_status === 'paid'
                ? 'bg-gray-900 text-white hover:bg-gray-800'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
            disabled={student.payment_status !== 'paid'}
          >
            {student.payment_status === 'paid' ? 'Download Card' : 'Payment Required'}
          </button>
        </div>

        {/* Message */}
        {msg && <div className="mt-3 text-sm text-blue-600 text-center">{msg}</div>}

        {/* Admin Info */}
        {(student.admin_name || student.admin_phone) && (
          <div className="mt-8 text-center text-xs text-gray-500">
            <p className="mb-1">Added by:</p>
            {student.admin_name && <div className="text-gray-600">{student.admin_name}</div>}
            {student.admin_phone && <div className="text-gray-600">{student.admin_phone}</div>}
          </div>
        )}
      </div>
    </StudentLayout>
  );
}
