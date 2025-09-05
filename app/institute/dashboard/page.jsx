'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/institute/page-layout';

export default function InstituteDashboardPage() {
  const [students, setStudents] = useState([]);
  const [stats, setStats] = useState(null);
  const [institution, setInstitution] = useState(null);
  const [adminBranch, setAdminBranch] = useState(null);
  const [cardDesigns, setCardDesigns] = useState([]);
  const [selectedCard, setSelectedCard] = useState('');

  useEffect(() => {
    async function loadDashboard() {
      const res = await fetch('/api/institute/dashboard');
      const data = await res.json();

      if (res.ok) {
        setStudents(data.students);
        setStats(data.stats);
        setInstitution(data.institution);
        setAdminBranch(data.adminBranch || null);
        setSelectedCard(data.stats.card_design || '');
      } else {
        console.error('Failed to load dashboard:', data.error);
      }
    }

    async function loadCardDesigns() {
      const res = await fetch('/api/institute/card-design');
      const data = await res.json();
      if (res.ok) setCardDesigns(data);
    }

    loadDashboard();
    loadCardDesigns();
  }, []);

  if (!stats) {
    return (
      <DashboardLayout>
        <div className="p-6 text-orange-600 font-semibold">Loading...</div>
      </DashboardLayout>
    );
  }

  // Batch-wise student counts
  const batchesMap = students.reduce((acc, student) => {
    const key = `${student.start_year}-${student.end_year}`;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  const batchEntries = Object.entries(batchesMap).sort(
    (a, b) => parseInt(a[0].split('-')[0], 10) - parseInt(b[0].split('-')[0], 10)
  );

  // Gender counts
  const genderCounts = students.reduce((acc, student) => {
    const gender = student.gender || 'Not Specified';
    acc[gender] = (acc[gender] || 0) + 1;
    return acc;
  }, {});

  // Save selected card design
  const handleSaveCardDesign = async () => {
    if (!selectedCard) return alert('Please select a card design.');
    const res = await fetch('/api/institute/save-card-design', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ card_design: selectedCard }),
    });
    const data = await res.json();
    if (res.ok) {
      alert('Card design saved successfully!');
      setStats({ ...stats, card_design: selectedCard });
    } else {
      alert(data.error || 'Failed to save card design.');
    }
  };

  // Stat Card component
  const Card = ({ label, value, icon, colorClass }) => (
    <div
      className={`p-5 rounded-xl shadow-lg ${colorClass} text-white flex flex-col items-start hover:scale-105 transition-transform duration-150`}
    >
      <div className="flex items-center gap-2 mb-1">
        {icon && <span className="text-2xl">{icon}</span>}
        <div className="text-xs uppercase tracking-wider">{label}</div>
      </div>
      <div className="text-3xl font-extrabold">{value}</div>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="p-6 space-y-8 min-h-screen">
        {/* Header */}
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
            <span className="text-sm font-medium text-orange-500">
              ({institution?.code || 'Code'})
            </span>
          </h1>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <Card colorClass="bg-orange-400" label="Total Students" value={stats.totalStudents} icon="🎓" />
          <Card colorClass="bg-rose-400" label="Missing Photos" value={stats.noImage} icon="📷" />
          <Card colorClass="bg-orange-300" label="Branch" value={adminBranch || 'No department assigned'} icon="🏢" />
        </div>

        {/* Card Design Selector */}
        <div className="mt-6 p-4 bg-white/60 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-orange-700 mb-2">Select Card Design</h3>
          <div className="flex items-center gap-2">
            <select
              value={selectedCard}
              onChange={(e) => setSelectedCard(e.target.value)}
              className="border p-2 rounded"
            >
              <option value="">-- Select Card Design --</option>
              {cardDesigns.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
            <button
              onClick={handleSaveCardDesign}
              className="bg-orange-400 text-white px-4 py-2 rounded hover:bg-orange-500"
            >
              Save
            </button>
          </div>
        </div>

        {/* Batch-wise Student Count */}
        <section className="bg-white/60 rounded-lg p-5 shadow mt-6">
          <h3 className="text-lg font-semibold mb-2 text-orange-700">Batch-wise Student Count</h3>
          {batchEntries.length === 0 ? (
            <p className="text-orange-600">No batch data available.</p>
          ) : (
            <ul className="list-disc ml-6 text-sm text-orange-900 space-y-0.5">
              {batchEntries.map(([batch, count]) => (
                <li key={batch}>
                  {batch}: <span className="font-bold">{count}</span> student{count !== 1 ? 's' : ''}
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Gender Breakdown */}
        <section className="bg-white/60 rounded-lg p-5 shadow mt-6">
          <h3 className="text-lg font-semibold mb-2 text-orange-700">Gender Distribution</h3>
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
