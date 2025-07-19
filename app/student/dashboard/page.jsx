'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import StudentLayout from '@/components/student/page-layout';

const InfoRow = ({ label, value }) => (
  <div className="flex flex-col gap-0.5">
    <span className="text-xs text-gray-500">{label}</span>
    <span className="text-sm text-gray-800 font-medium">
      {value || <span className="italic text-gray-400">N/A</span>}
    </span>
  </div>
);

export default function StudentDashboard() {
  const [student, setStudent] = useState(null);

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const res = await fetch('/api/student/details');
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
            <InfoRow label="Name" value={student.name} />
            <InfoRow label="Father's Name" value={student.father_name} />
            <InfoRow label="Date of Birth" value={student.dob ? new Date(student.dob).toLocaleDateString() : ''} />
            <InfoRow label="Gender" value={student.gender} />
            <InfoRow label="Mobile" value={student.mobile} />
            <InfoRow label="Email" value={student.email} />
            <InfoRow label="Aadhaar Number" value={student.adhaar_no} />
            <InfoRow label="Identification Marks" value={student.identification} />
            <InfoRow label="Blood Group" value={student.blood_group} />
            <InfoRow label="Class" value={student.class} />
            <InfoRow label="Section" value={student.section} />
            <InfoRow label="Student Type" value={student.student_type} />
            <InfoRow label="Address" value={student.address} />
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
