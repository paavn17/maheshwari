'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/institute/page-layout';

// Enhanced Stat Card: orange-400 theme, subtle shadows, icon support, hover effects
function Card({ label, value, icon }) {
  return (
    <div className="p-5 rounded-xl shadow-lg bg-orange-400 text-white flex flex-col items-start hover:scale-105 transition-transform duration-150">
      <div className="flex items-center gap-2 mb-1">
        {icon && <span className="text-2xl">{icon}</span>}
        <div className="text-xs uppercase tracking-wider">{label}</div>
      </div>
      <div className="text-3xl font-extrabold">{value}</div>
    </div>
  );
}

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
          setInstitution(data.institution);
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
        <div className="p-6 text-orange-600 font-semibold">Loading...</div>
      </DashboardLayout>
    );
  }

  // Compute breakdowns
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
        <div className="flex items-center gap-4 mb-4">
          {institution?.logo && (
            <img
              src={institution.logo}
              alt="Institution Logo"
              className="h-14 w-14 object-contain rounded-lg shadow"
            />
          )}
          <h1 className="text-3xl font-extrabold text-orange-700 drop-shadow-sm">
            {institution?.name || 'Your Institution'}{' '}
            <span className="text-sm font-medium text-orange-500">({institution?.code || 'Code'})</span>
          </h1>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <Card label="Total Students" value={stats.totalStudents}  />
          <Card label="Paid Students" value={stats.paid}  />
          <Card label="Unpaid Students" value={stats.unpaid} />
          <Card label="Missing Photos" value={stats.noImage}  />
          <Card label="Total Branches" value={stats.totalBranches} />
        </div>

        {/* Year-wise breakdown */}
        <section className="bg-white/60 rounded-lg p-5 shadow mt-6">
          <h3 className="text-lg font-semibold mb-2 text-orange-700"> Year-wise Student Count</h3>
          <ul className="list-disc ml-6 text-sm text-orange-900 space-y-0.5">
            {stats.uniqueYears.map((year, i) => {
              const count = students.filter((s) => s.class === year).length;
              return (
                <li key={i}>
                  {year}: <span className="font-bold">{count}</span> student{count !== 1 ? 's' : ''}
                </li>
              );
            })}
          </ul>
        </section>

        {/* Student Type Breakdown */}
        <section className="bg-white/60 rounded-lg p-5 shadow mt-6">
          <h3 className="text-lg font-semibold mb-2 text-orange-700"> Student Type</h3>
          <ul className="list-disc ml-6 text-sm text-orange-900 space-y-0.5">
            {Object.entries(studentTypeCounts).map(([type, count]) => (
              <li key={type}>
                {type}: <span className="font-bold">{count}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Gender Breakdown */}
        <section className="bg-white/60 rounded-lg p-5 shadow mt-6">
          <h3 className="text-lg font-semibold mb-2 text-orange-700"> Gender Distribution</h3>
          <ul className="list-disc ml-6 text-sm text-orange-900 space-y-0.5">
            {Object.entries(genderCounts).map(([gender, count]) => (
              <li key={gender}>
                {gender}: <span className="font-bold">{count}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </DashboardLayout>
  );
}


