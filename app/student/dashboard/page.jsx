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
  { label: "Start Year", key: "start_year" },
  { label: "End Year", key: "end_year" },
  { label: "Mobile", key: "mobile" },
  { label: "Email", key: "email" },
  { label: "Gender", key: "gender" },
  { label: "Date of Birth", key: "dob" },
  { label: "Blood Group", key: "blood_group" },
  { label: "Aadhaar Number", key: "adhaar_no" },
  { label: "Identification Marks", key: "identification" },
  { label: "Address", key: "address" },
  { label: "Branch", key: "branch" },
  { label: "Student Type", key: "student_type" },
  { label: "Reg Date", key: "reg_date" },
  { label: "Account Status", key: "acc_status" }
];

const InfoRow = ({ label, value }) => (
  <div className="flex flex-col gap-0.5">
    <span className="text-xs text-gray-500">{label}</span>
    <span className="text-sm text-gray-800 font-medium">
      {value || <span className="italic text-gray-400">N/A</span>}
    </span>
  </div>
);

function StudentChangeRequestForm({ student, onClose }) {
  const [formData, setFormData] = useState(() => {
    const out = {};
    editableFields.forEach(f => out[f.key] = student[f.key] ?? "");
    return out;
  });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  const handleChange = (key, value) => setFormData(prev => ({ ...prev, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const changes = editableFields
      .filter(f => (formData[f.key] ?? "") !== (student[f.key] ?? ""))
      .map(f => ({
        field_name: f.key,
        old_value: student[f.key] ?? "",
        new_value: formData[f.key]
      }));

    if (!changes.length) {
      setMsg("No changes detected!");
      return;
    }

    setLoading(true);

    setMsg(null);
    try {  const res = await fetch('/api/student/request-change', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          institution_id: student.institution_id,
          roll_no: student.roll_no,
          section: student.section,
          class: student.class,
          changes
        })
      });

      const data = await res.json();
      if (res.ok) {
        setMsg("Change request submitted successfully!");
      } else {
        setMsg(data.error || "Submission failed.");
      }
    } catch (err) {
      console.error("Error submitting change request:", err);
      setMsg("Request failed.");
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-orange-50 rounded-lg p-4 border mt-6">
      <h3 className="font-semibold mb-3 text-orange-700">Request Change</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {editableFields.map(({ label, key }) => (
          <div key={key}>
            <label className="block text-xs text-gray-600">{label}</label>
            <input
              className="w-full border rounded px-2 py-1 text-sm"
              type="text"
              value={formData[key]}
              onChange={e => handleChange(key, e.target.value)}
            />
            <div className="text-xxs text-gray-400">Current: {student[key] ?? <em>N/A</em>}</div>
          </div>
        ))}
      </div>
      <div className="flex gap-4 mt-4">
        <button type="submit"
          disabled={loading}
          className="bg-orange-500 text-white px-4 py-2 rounded disabled:opacity-50">
          {loading ? "Submitting..." : "Submit"}
        </button>
        <button
          type="button"
          className="bg-gray-200 px-3 py-2 rounded"
          onClick={onClose}>
          Cancel
        </button>
      </div>
      {msg && <div className="mt-3 text-sm text-blue-600">{msg}</div>}
    </form>
  );
}

export default function StudentDashboard() {
  const [student, setStudent] = useState(null);
  const [showChangeForm, setShowChangeForm] = useState(false);

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const res = await fetch('/api/student/details', {
          credentials: 'include'
        });
        const data = await res.json();
        setStudent(data.student || {});
      } catch (error) {
        console.error('Failed to fetch student data:', error);
        setStudent({});
      }
    };
    fetchStudent();
  }, []);

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
          <h1 className="text-xl font-semibold text-gray-800">{student.institution_name}</h1>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 flex flex-col md:flex-row gap-8">
          {/* Left: Profile Image */}
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

          {/* Right: Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 flex-1 text-sm">
            {editableFields.map(({ label, key }) => (
              <InfoRow key={key} label={label} value={student[key]} />
            ))}
          </div>
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
            onClick={() => alert(`Downloading card: ${student.selected_id || 'Selected ID not found'}`)}
            className={`px-8 py-3 rounded-lg font-medium transition-colors ${student.payment_status === 'paid'
              ? 'bg-gray-900 text-white hover:bg-gray-800'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
            disabled={student.payment_status !== 'paid'}
          >
            {student.payment_status === 'paid' ? 'Download Card' : 'Payment Required'}
          </button>
          <button
            onClick={() => setShowChangeForm(!showChangeForm)}
            className="px-8 py-3 bg-orange-100 text-orange-700 border border-orange-300 rounded-lg font-medium">
            {showChangeForm ? "Hide" : "Request Change"}
          </button>
        </div>

        {/* Request Change Form */}
        {showChangeForm && (
          <StudentChangeRequestForm student={student} onClose={() => setShowChangeForm(false)} />
        )}

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
