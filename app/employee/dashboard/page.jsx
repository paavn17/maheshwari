'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import EmployeeLayout from '@/components/employee/page-layout';

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

  if (!employee) return <EmployeeLayout><div>Loading...</div></EmployeeLayout>;

  return (
    <EmployeeLayout>
      <div className="bg-white shadow rounded-lg p-6 max-w-4xl mx-auto">
        <h2 className="text-xl font-bold mb-4 text-center">Employee Profile</h2>

        <div className="flex items-center gap-6">
          {employee.profile_pic && (
            <Image
              src={`data:image/jpeg;base64,${btoa(
                new Uint8Array(employee.profile_pic.data).reduce((acc, byte) => acc + String.fromCharCode(byte), '')
              )}`}
              alt="Profile"
              width={100}
              height={100}
              className="rounded-full border"
            />
          )}
          <div>
            <p><strong>Name:</strong> {employee.name}</p>
            <p><strong>Emp ID:</strong> {employee.emp_id}</p>
            <p><strong>PF No:</strong> {employee.pf_no}</p>
            <p><strong>Designation:</strong> {employee.designation}</p>
            <p><strong>Department:</strong> {employee.department}</p>
            <p><strong>Date of Joining:</strong> {employee.doj}</p>
            <p><strong>Date of Birth:</strong> {employee.dob}</p>
            <p><strong>Gender:</strong> {employee.gender}</p>
            <p><strong>Mobile:</strong> {employee.mobile}</p>
            <p><strong>Email:</strong> {employee.email}</p>
            <p><strong>Adhaar No:</strong> {employee.adhaar_no}</p>
            <p><strong>Blood Group:</strong> {employee.blood_group}</p>
            <p><strong>Identification Marks:</strong> {employee.identification}</p>
            <p><strong>Address:</strong> {employee.address}</p>
            <p><strong>Institution:</strong> {employee.institution_name}</p>
            <p><strong>Account Status:</strong> {employee.acc_status}</p>
            <p><strong>Registered At:</strong> {employee.reg_date}</p>
          </div>
        </div>
      </div>
    </EmployeeLayout>
  );
};

export default Page;
