'use client';

import DashboardLayout from '@/components/admin/page-layout';
import React, { useMemo } from 'react';

const dummyPayments = [
  {
    id: 1,
    college_code: 'VIGN001',
    amount: 2500,
    status: 'paid',
    payment_date: '2025-07-09',
    due_date: null,
    id_cards: 50,
  },
  {
    id: 2,
    college_code: 'VIGN001',
    amount: 1500,
    status: 'unpaid',
    payment_date: null,
    due_date: '2025-07-15',
    id_cards: 30,
  },
  {
    id: 3,
    college_code: 'VIGN002',
    amount: 3000,
    status: 'paid',
    payment_date: '2025-07-05',
    due_date: null,
    id_cards: 60,
  },
  {
    id: 4,
    college_code: 'VIGN003',
    amount: 1800,
    status: 'unpaid',
    payment_date: null,
    due_date: '2025-07-18',
    id_cards: 40,
  },
  {
    id: 5,
    college_code: 'VIGN004',
    amount: 2000,
    status: 'unpaid',
    payment_date: null,
    due_date: '2025-07-20',
    id_cards: 35,
  },
];

export default function Page() {
  //  Derived Calculations
  const allColleges = useMemo(() => {
    const unique = new Set();
    dummyPayments.forEach((p) => unique.add(p.college_code));
    return [...unique];
  }, []);

  const paidColleges = useMemo(() => {
    const paid = new Set();
    dummyPayments.forEach((p) => {
      if (p.status === 'paid') paid.add(p.college_code);
    });
    return [...paid];
  }, []);

  const unpaidColleges = useMemo(() => {
    const unpaidMap = {};
    dummyPayments.forEach((p) => {
      if (p.status === 'unpaid') {
        if (!unpaidMap[p.college_code]) {
          unpaidMap[p.college_code] = { ...p };
        } else {
          unpaidMap[p.college_code].amount += p.amount;
          unpaidMap[p.college_code].id_cards += p.id_cards;
        }
      }
    });

    return Object.values(unpaidMap).sort(
      (a, b) => new Date(a.due_date) - new Date(b.due_date)
    );
  }, []);

  const totalAmountCollected = useMemo(() => {
    return dummyPayments
      .filter((p) => p.status === 'paid')
      .reduce((sum, p) => sum + p.amount, 0);
  }, []);

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Payment Report</h1>

      {/* 🔹 Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-sky-100 border-l-4 border-sky-500 p-4 rounded shadow">
          <p className="text-sm text-gray-600">Total Colleges</p>
          <h2 className="text-xl font-bold text-sky-800">{allColleges.length}</h2>
        </div>
        <div className="bg-green-100 border-l-4 border-green-500 p-4 rounded shadow">
          <p className="text-sm text-gray-600">Paid Colleges</p>
          <h2 className="text-xl font-bold text-green-800">{paidColleges.length}</h2>
        </div>
        <div className="bg-red-100 border-l-4 border-red-500 p-4 rounded shadow">
          <p className="text-sm text-gray-600">Unpaid Colleges</p>
          <h2 className="text-xl font-bold text-red-800">
            {allColleges.length - paidColleges.length}
          </h2>
        </div>
        <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 rounded shadow">
          <p className="text-sm text-gray-600">Total Amount Collected</p>
          <h2 className="text-xl font-bold text-yellow-800">₹{totalAmountCollected}</h2>
        </div>
      </div>

      {/* 🔻 Table of Unpaid Colleges */}
      <h2 className="text-xl font-semibold text-red-700 mb-2">Unpaid Colleges</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
          <thead className="bg-sky-200 text-gray-700 text-left text-sm">
            <tr>
              <th className="px-6 py-3">#</th>
              <th className="px-6 py-3">College Code</th>
              <th className="px-6 py-3">Total Due (₹)</th>
              <th className="px-6 py-3">ID Cards</th>
              <th className="px-6 py-3">Due Date</th>
            </tr>
          </thead>
          <tbody className="text-sm text-gray-800">
            {unpaidColleges.map((p, idx) => (
              <tr key={p.college_code} className="border-t bg-red-50 text-gray-700">
                <td className="px-6 py-3">{idx + 1}</td>
                <td className="px-6 py-3 font-medium text-red-800">{p.college_code}</td>
                <td className="px-6 py-3">₹{p.amount}</td>
                <td className="px-6 py-3">{p.id_cards}</td>
                <td className="px-6 py-3 text-orange-600">{p.due_date}</td>
              </tr>
            ))}
            {unpaidColleges.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  All colleges have paid.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}
