'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import EmployeeLayout from '@/components/employee/page-layout';

const InfoRow = ({ label, value }) => (
  <div className="flex flex-col gap-0.5">
    <span className="text-xs text-gray-500">{label}</span>
    <span className="text-sm text-gray-800 font-medium">
      {value || <span className="italic text-gray-400">N/A</span>}
    </span>
  </div>
);

export default function EmployeeDashboard() {
  const [employee, setEmployee] = useState(null);

  useEffect(() => {
    const fetchEmployee = async () => {
      const res = await fetch('/api/employee/profile');
      const data = await res.json();
      if (res.ok) setEmployee(data);
    };
    fetchEmployee();
  }, []);

  const getImageSrc = () => {
    if (!employee?.profile_pic) return '/images/avatar-placeholder.png';
    const buffer = employee.profile_pic.data;
    const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
    return `data:image/jpeg;base64,${base64}`;
  };

  if (!employee) {
    return (
      <EmployeeLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-orange-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500 text-sm">Loading profile...</p>
          </div>
        </div>
      </EmployeeLayout>
    );
  }

  return (
    <EmployeeLayout>
      <div className="max-w-5xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-xl font-semibold text-gray-800">Employee Profile</h1>
          <p className="text-sm text-gray-500">{employee.institution_name}</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 flex flex-col md:flex-row gap-8">
          {/* Left: Profile Picture */}
          <div className="flex flex-col items-center w-full md:w-1/3">
            <Image
              src={getImageSrc()}
              alt="Profile"
              width={140}
              height={140}
              className="rounded-full border-4 border-orange-200 shadow object-cover"
              unoptimized
            />
            <span className="mt-3 bg-orange-100 text-orange-700 text-xs font-semibold px-3 py-1 rounded-full">
              {employee.designation}
            </span>
          </div>

          {/* Right: Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 flex-1 text-sm">
            <InfoRow label="Name" value={employee.name} />
            <InfoRow label="Emp ID" value={employee.emp_id} />
            <InfoRow label="PF No" value={employee.pf_no} />
            <InfoRow label="Department" value={employee.department} />
            <InfoRow label="DOJ" value={employee.doj} />
            <InfoRow label="DOB" value={employee.dob} />
            <InfoRow label="Gender" value={employee.gender} />
            <InfoRow label="Mobile" value={employee.mobile} />
            <InfoRow label="Email" value={employee.email} />
            <InfoRow label="Adhaar No" value={employee.adhaar_no} />
            <InfoRow label="Blood Group" value={employee.blood_group} />
            <InfoRow label="Identification Marks" value={employee.identification} />
            <InfoRow label="Address" value={employee.address} />
            <InfoRow label="Account Status" value={employee.acc_status} />
            <InfoRow label="Registered At" value={employee.reg_date} />
          </div>
        </div>
      </div>
    </EmployeeLayout>
  );
}
