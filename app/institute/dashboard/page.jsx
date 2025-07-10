'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/institute/page-layout';
import { getStudentsByCollege } from '@/lib/fetchers/getStudents';

export default function InstituteDashboardPage() {
  const [students, setStudents] = useState([]);
  const [stats, setStats] = useState(null);

  const college = {
    name: 'Vignan Institute of Technology',
    code: 'VGN01',
  };

  useEffect(() => {
    async function load() {
      const fetchedStudents = await getStudentsByCollege(college.name);
      setStudents(fetchedStudents);

      const paid = fetchedStudents.filter((s) => s.payment_status === 'paid').length;
      const unpaid = fetchedStudents.length - paid;
      const noImage = fetchedStudents.filter((s) => !s.image || s.image === '').length;

      const branches = [...new Set(fetchedStudents.map((s) => s.branch))];
      const years = [...new Set(fetchedStudents.map((s) => s.year))].sort();

      setStats({
        totalStudents: fetchedStudents.length,
        paid,
        unpaid,
        noImage,
        totalBranches: branches.length,
        uniqueYears: years,
      });
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

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <h1 className="text-3xl font-semibold mb-4 text-sky-800">🏫 Institute Dashboard</h1>

        {/* College Info */}
        <div className="bg-white p-4 rounded shadow border">
          <h2 className="text-xl font-semibold mb-2">{college.name}</h2>
          <p className="text-gray-600">Code: <strong>{college.code}</strong></p>
        </div>

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
              const count = students.filter((s) => s.year === year).length;
              return (
                <li key={i}>
                  {year}: {count} student{count !== 1 ? 's' : ''}
                </li>
              );
            })}
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
