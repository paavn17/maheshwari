'use client';

import { useState, useEffect } from 'react';
import StudentLayout from '@/components/student/page-layout';
import Image from 'next/image';

export default function StudentDashboard() {
  const [student, setStudent] = useState(null);

  console.log(student?.institution_name || null);


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
        <div className="p-6 text-center text-gray-500">Loading your details...</div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="p-6">
        <div className="p-4 rounded space-y-4">
          {/* Header and institution details */}
          <div className="space-y-1 mb-4">
            <h2 className="text-xl font-semibold text-sky-700">Your Details</h2>
            {student.institution_name && (
              <p className="text-sm text-gray-700">
                <strong>Institution:</strong> {student.institution_name} ({student.institution_code})
              </p>
            )}
          </div>

          {/* Main info */}
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(student).map(([key, val]) => {
              if (
                key === 'selected_id' ||
                key === 'payment_status' ||
                key === 'institution_name' ||
                key === 'institution_code'
              )
                return null;

              const label = key.replace(/_/g, ' ');

              if (key === 'profile_pic') {
                return (
                  <div key={key} className="col-span-2 space-y-2">
                    <label className="block text-sm text-gray-600 capitalize">{label}</label>
                    <div className="flex items-center gap-4">
                      <Image
                        src={val || '/images/avatar-placeholder.png'}
                        alt="Student"
                        width={100}
                        height={100}
                        className="rounded border object-cover"
                        unoptimized
                      />
                    </div>
                  </div>
                );
              }

              return (
                <div key={key}>
                  <label className="block text-sm text-gray-600 capitalize mb-1">{label}</label>
                  <input
                    type="text"
                    name={key}
                    value={val || ''}
                    disabled
                    className="w-full p-2 border rounded bg-gray-100"
                  />
                </div>
              );
            })}
          </div>

          {/* Payment Status */}
          <div className="mt-4">
            <label className="block text-sm text-gray-600">Payment Status</label>
            <span
              className={`px-3 py-1 rounded text-white text-sm inline-block ${
                student.payment_status === 'paid' ? 'bg-green-500' : 'bg-red-500'
              }`}
            >
              {student.payment_status || 'unpaid'}
            </span>
          </div>

          {/* Disabled actions */}
          <div className="mt-6 space-x-4">
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
              disabled
            >
              Pay Now
            </button>
            <button
              onClick={() =>
                alert(`Downloading card: ${student.selected_id || 'Selected ID not found'}`)
              }
              className="bg-sky-600 text-white px-4 py-2 rounded disabled:opacity-50"
              disabled={student.payment_status !== 'paid'}
            >
              Download Card
            </button>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}
