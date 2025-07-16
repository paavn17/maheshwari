'use client';

import { useState, useEffect } from 'react';
import StudentLayout from '@/components/student/page-layout';
import Image from 'next/image';

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
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600 mb-4"></div>
            <p className="text-gray-600">Loading your details...</p>
          </div>
        </div>
      </StudentLayout>
    );
  }

  // Group fields into sections
  const personalInfo = ['name', 'father_name', 'dob', 'gender', 'mobile', 'email'];
  const identificationInfo = ['roll_no', 'adhaar_no', 'identification', 'blood_group'];
  const academicInfo = ['class', 'section', 'student_type', 'address'];

  const renderField = (key, value, isFullWidth = false) => {
    if (key === 'profile_pic') return null;
    
    const label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    const displayValue = key === 'dob' && value
      ? new Date(value).toISOString().split('T')[0]
      : value || '';

    return (
      <div key={key} className={isFullWidth ? 'col-span-2' : ''}>
        <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
        <div className="relative">
          <input
            type="text"
            name={key}
            value={displayValue}
            disabled
            className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-colors"
          />
        </div>
      </div>
    );
  };

  const renderSection = (title, fields, icon) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-r from-sky-500 to-blue-600 rounded-lg flex items-center justify-center">
          {icon}
        </div>
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fields.map(field => student[field] !== undefined && renderField(field, student[field]))}
      </div>
    </div>
  );

  return (
    <StudentLayout>
      <div className="p-6 min-h-screen">
        <div className="max-w-6xl mx-auto space-y-6">
          
          {/* Header Section */}
          <div className="bg-gradient-to-r from-sky-600 to-blue-700 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold mb-2">Student Dashboard</h1>
                {student.institution_name && (
                  <p className="text-sky-100 text-sm">
                    <span className="font-medium">Institution:</span> {student.institution_name} ({student.institution_code})
                  </p>
                )}
              </div>
              <div className="hidden md:block">
                <svg className="w-16 h-16 text-sky-200" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>

          {/* Profile Picture and Quick Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="relative">
                <Image
                  src={student.profile_pic || '/images/avatar-placeholder.png'}
                  alt="Student Profile"
                  width={120}
                  height={120}
                  className="rounded-xl border-4 border-sky-100 object-cover shadow-lg"
                  unoptimized
                />
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">{student.name || 'Student Name'}</h2>
                <p className="text-gray-600 mb-2">Roll No: {student.roll_no || 'N/A'}</p>
                <p className="text-gray-600 mb-4">{student.class || 'Class'} - Section {student.section || 'N/A'}</p>
                
                {/* Payment Status */}
                <div className="flex items-center gap-2 justify-center md:justify-start">
                  <span className="text-sm font-medium text-gray-600">Payment Status:</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    student.payment_status === 'paid' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {student.payment_status === 'paid' ? 'Paid' : 'Unpaid'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Information Sections */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {renderSection(
              'Personal Information',
              personalInfo,
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            )}

            {renderSection(
              'Identification Details',
              identificationInfo,
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
              </svg>
            )}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {renderSection(
              'Academic Information',
              academicInfo,
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
              </svg>
            )}
          </div>

          {/* Action Buttons */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Actions</h3>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                disabled
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                Pay Now
              </button>
              
              <button
                onClick={() =>
                  alert(`Downloading card: ${student.selected_id || 'Selected ID not found'}`)
                }
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-sky-500 to-sky-600 text-white px-6 py-3 rounded-lg font-medium hover:from-sky-600 hover:to-sky-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                disabled={student.payment_status !== 'paid'}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                {student.payment_status === 'paid' ? 'Download Card' : 'Payment Required'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}