'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/institute/page-layout';

export default function InstituteDashboardPage() {
  const [students, setStudents] = useState([]);
  const [stats, setStats] = useState(null);
  const [institution, setInstitution] = useState(null);

  useEffect(() => {
  async function load() {
    const res = await fetch('/api/institute/dashboard');
    const data = await res.json();

    if (res.ok) {
      setStudents(data.students);
      setStats(data.stats);
      if (data.institution) {
        setInstitution(data.institution); // ✅ use this instead of student[0]
      }
    } else {
      console.error('Failed to load dashboard:', data.error);
    }
  }

  load();
}, []);


  if (!stats) {
    return (
      <DashboardLayout>
        <div className="p-6">Loading...</div>
      </DashboardLayout>
    );
  }

  // Compute extra breakdowns
  const studentTypeCounts = students.reduce((acc, student) => {
    const type = student.student_type || 'Unknown';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  const genderCounts = students.reduce((acc, student) => {
    const gender = student.gender || 'Not Specified';
    acc[gender] = (acc[gender] || 0) + 1;
    return acc;
  }, {});

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold text-sky-800">
          🏫 {institution?.name || 'Your Institution'} ({institution?.code || 'Code'})
        </h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card label="Total Students" value={stats.totalStudents} color="bg-sky-500" />
          <Card label="Paid Students" value={stats.paid} color="bg-green-500" />
          <Card label="Unpaid Students" value={stats.unpaid} color="bg-yellow-500" />
          <Card label="Missing Photos" value={stats.noImage} color="bg-red-500" />
          <Card label="Total Branches" value={stats.totalBranches} color="bg-indigo-500" />
        </div>

        {/* Year-wise breakdown */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2 text-sky-700">📊 Year-wise Student Count</h3>
          <ul className="list-disc ml-6 text-sm text-gray-700">
            {stats.uniqueYears.map((year, i) => {
              const count = students.filter((s) => s.class === year).length;
              return (
                <li key={i}>
                  {year}: {count} student{count !== 1 ? 's' : ''}
                </li>
              );
            })}
          </ul>
        </div>

        {/* Student Type Breakdown */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2 text-sky-700">🎓 Student Type</h3>
          <ul className="list-disc ml-6 text-sm text-gray-700">
            {Object.entries(studentTypeCounts).map(([type, count]) => (
              <li key={type}>
                {type}: {count}
              </li>
            ))}
          </ul>
        </div>

        {/* Gender Breakdown */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2 text-sky-700">🧑‍🤝‍🧑 Gender Distribution</h3>
          <ul className="list-disc ml-6 text-sm text-gray-700">
            {Object.entries(genderCounts).map(([gender, count]) => (
              <li key={gender}>
                {gender}: {count}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
}

// Stat Card Component
function Card({ label, value, color }) {
  return (
    <div className={`p-4 rounded shadow text-white ${color}`}>
      <div className="text-sm uppercase tracking-wider font-medium">{label}</div>
      <div className="text-2xl font-bold mt-1">{value}</div>
    </div>
  );
}
