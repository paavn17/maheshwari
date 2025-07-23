'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/admin/page-layout';

export default function SuperAdminDashboardPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/superadmin/dashboard');
        const result = await res.json();
        if (!res.ok) throw new Error(result.error || 'Failed to fetch stats');
        setData(result);
      } catch (err) {
        console.error(err);
        setError('⚠️ Unable to load dashboard stats.');
      }
    }

    fetchStats();
  }, []);

  if (!data) {
    return (
      <DashboardLayout>
        <div className="p-6 text-orange-600">{error || 'Loading stats...'}</div>
      </DashboardLayout>
    );
  }

  const {
    totalInstitutions,
    totalStudents,
    totalWithNoImage,
    totalByYear,
    totalByBranch,
    students,
  } = data;

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
      <div className="p-6 space-y-8  min-h-screen">
        <h1 className="text-3xl font-bold text-orange-700">Super Admin Dashboard</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <Card label="Total Institutions" value={totalInstitutions} color="bg-orange-500" />
          <Card label="Total Students" value={totalStudents} color="bg-orange-400" />
          <Card label="Students Without Image" value={totalWithNoImage} color="bg-red-400" />
        </div>

        {/* Breakdown Lists */}
        <Section title="Year-wise Distribution" data={totalByYear} />
        <Section title="Branch-wise Distribution" data={totalByBranch} />
        <Section title="Student Type Breakdown" data={studentTypeCounts} />
        <Section title="Gender Distribution" data={genderCounts} />
      </div>
    </DashboardLayout>
  );
}

function Card({ label, value, color }) {
  return (
    <div className={`p-4 rounded-lg shadow-sm text-white ${color}`}>
      <div className="text-xs uppercase font-medium tracking-wide">{label}</div>
      <div className="text-3xl font-extrabold mt-1">{value}</div>
    </div>
  );
}

function Section({ title, data }) {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-2 text-orange-700">{title}</h3>
      <ul className="list-disc ml-6 text-sm text-gray-800 space-y-1">
        {Object.entries(data).map(([key, value]) => (
          <li key={key}>
            {key}: <span className="font-semibold">{value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
