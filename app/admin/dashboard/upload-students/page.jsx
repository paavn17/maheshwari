'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/admin/page-layout';
import { getStudentsClient } from '@/lib/fetchers/getStudents';

export default function UploadStudentsPage() {
  const [students, setStudents] = useState([]);

  useEffect(() => {
    getStudentsClient().then((data) => {
      setStudents(data);
    });
  }, []);

  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-2xl font-semibold mb-4">Upload Student Details</h1>

        {students.length === 0 ? (
          <p className="text-gray-500">Loading student data...</p>
        ) : (
          <ul className="space-y-2 text-gray-800">
            {students.map((s) => (
              <li key={s.id}>
                {s.first_name} {s.last_name}
              </li>
            ))}
          </ul>
        )}
      </div>
    </DashboardLayout>
  );
}
