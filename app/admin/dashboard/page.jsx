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

  const { totalInstitutions, totalStudents, totalWithNoImage, institutions } = data;

  return (
    <DashboardLayout>
      <div className="p-6 space-y-8 min-h-screen">
        <h1 className="text-3xl font-bold text-orange-700">Super Admin Dashboard</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <Card label="Total Institutions" value={totalInstitutions} color="bg-orange-500" />
          <Card label="Total Students" value={totalStudents} color="bg-orange-400" />
          <Card label="Students Without Image" value={totalWithNoImage} color="bg-red-400" />
        </div>

        {/* Institutions List */}
        <div>
          <h3 className="text-lg font-semibold mb-2 text-orange-700">Institutions</h3>
          <ul className="list-disc ml-6 text-sm text-gray-800 space-y-1">
            {institutions.map((inst) => (
              <li key={inst.id}>
                {inst.name} <span className="text-gray-500">({inst.code})</span>
              </li>
            ))}
          </ul>
        </div>
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
