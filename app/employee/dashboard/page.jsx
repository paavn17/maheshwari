'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import EmployeeLayout from '@/components/employee/page-layout';

const labelClass = "font-medium text-gray-600";
const valueClass = "text-gray-900";

const InfoRow = ({ label, value }) => (
  <div className="flex flex-col sm:flex-row sm:items-center py-1">
    <span className={labelClass + " w-40"}>{label}</span>
    <span className={valueClass}>{value || <span className="italic text-gray-400">N/A</span>}</span>
  </div>
);

const Page = () => {
  const [employee, setEmployee] = useState(null);

  useEffect(() => {
    const fetchEmployee = async () => {
      const res = await fetch('/api/employee/profile');
      const data = await res.json();
      if (res.ok) setEmployee(data);
    };
    fetchEmployee();
  }, []);

  if (!employee) {
    return (
      <EmployeeLayout>
        <div className="flex h-80 items-center justify-center bg-white shadow rounded-lg text-lg">
          Loading...
        </div>
      </EmployeeLayout>
    );
  }

  return (
    <EmployeeLayout>
      <div className="max-w-2xl md:max-w-4xl mx-auto bg-gradient-to-br from-slate-50 to-white shadow-xl rounded-3xl p-8 mt-8 relative">
        {/* Organization at Top */}
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-extrabold text-indigo-900 tracking-tight mb-2">
            Organization : {employee.institution_name}
          </h2>
          <span className="text-lg text-gray-600">Employee Profile</span>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-10">
          <div className="flex-shrink-0 flex flex-col items-center gap-2">
            {employee.profile_pic ? (
              <Image
                src={`data:image/jpeg;base64,${btoa(
                  new Uint8Array(employee.profile_pic.data).reduce((acc, byte) => acc + String.fromCharCode(byte), '')
                )}`}
                alt="Profile"
                width={120}
                height={120}
                className="rounded-full border-4 border-indigo-200 shadow-xl"
              />
            ) : (
              <div className="w-[120px] h-[120px] bg-gray-100 flex items-center justify-center rounded-full border-2 border-gray-200 text-gray-400 text-3xl">
                ?
              </div>
            )}
            <span className="mt-2 bg-indigo-100 text-indigo-700 text-xs rounded-full px-3 py-1 tracking-tight">
              {employee.designation}
            </span>
          </div>

          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-3 mt-6 md:mt-0">
            <InfoRow label="Name:" value={employee.name} />
            <InfoRow label="Emp ID:" value={employee.emp_id} />
            <InfoRow label="PF No:" value={employee.pf_no} />
            <InfoRow label="Department:" value={employee.department} />
            <InfoRow label="Date of Joining:" value={employee.doj} />
            <InfoRow label="Date of Birth:" value={employee.dob} />
            <InfoRow label="Gender:" value={employee.gender} />
            <InfoRow label="Mobile:" value={employee.mobile} />
            <InfoRow label="Email:" value={employee.email} />
            <InfoRow label="Adhaar No:" value={employee.adhaar_no} />
            <InfoRow label="Blood Group:" value={employee.blood_group} />
            <InfoRow label="Identification Marks:" value={employee.identification} />
            <InfoRow label="Address:" value={employee.address} />
            {/* Institution changed to Organization and moved up */}
            {/* <InfoRow label="Institution:" value={employee.institution_name} /> */}
            <InfoRow label="Account Status:" value={employee.acc_status} />
            <InfoRow label="Registered At:" value={employee.reg_date} />
          </div>
        </div>
      </div>
    </EmployeeLayout>
  );
};

export default Page;
