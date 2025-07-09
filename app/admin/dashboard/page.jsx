"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/admin/page-layout";
import {
  getStudentsClient,
  getUniqueColleges,
} from "@/lib/fetchers/getStudents";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalColleges: 0,
    totalStudents: 0,
    totalPaid: 0,
    totalUnpaid: 0,
    totalNoImage: 0,
  });

  useEffect(() => {
    async function fetchData() {
      const students = await getStudentsClient();
      const colleges = getUniqueColleges();
      const total = students.length;
      const paid = students.filter((s) => s.payment_status === "paid").length;
      const noImage = students.filter((s) => !s.image || s.image === "").length;
      const unpaid = total - paid;

      setStats({
        totalColleges: colleges.length,
        totalStudents: total,
        totalPaid: paid,
        totalUnpaid: unpaid,
        totalNoImage: noImage,
      });
    }

    fetchData();
  }, []);

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <h1 className="text-3xl font-semibold mb-4">Admin Dashboard</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card label="Total Colleges" value={stats.totalColleges} color="bg-sky-600" />
          <Card label="Total Students" value={stats.totalStudents} color="bg-sky-500" />
          <Card label="Paid Students" value={stats.totalPaid} color="bg-emerald-500" />
          <Card label="Unpaid Students" value={stats.totalUnpaid} color="bg-orange-400" />
          <Card label="Students Without Image" value={stats.totalNoImage} color="bg-rose-500" />
        </div>
      </div>
    </DashboardLayout>
  );
}

function Card({ label, value, color }) {
  return (
    <div className={`p-4 rounded shadow text-white ${color}`}>
      <div className="text-sm uppercase tracking-wider font-medium">{label}</div>
      <div className="text-2xl font-bold mt-1">{value}</div>
    </div>
  );
}
