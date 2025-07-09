'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/admin/page-layout';

const EmployeeUploadPage = () => {
  const [employeeData, setEmployeeData] = useState({
    first_name: '',
    last_name: '',
    college_name: '',
    phone: '',
    email: '',
    department: '',
    employee_id: '',
    designation: '',
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setEmployeeData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setErrors((prev) => ({
      ...prev,
      [e.target.name]: '',
    }));
  };

  const validate = () => {
    const newErrors = {};
    const phoneRegex = /^[6-9]\d{9}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    Object.entries(employeeData).forEach(([key, value]) => {
      if (!value.trim()) {
        newErrors[key] = 'This field is required.';
      }
    });

    if (employeeData.phone && !phoneRegex.test(employeeData.phone)) {
      newErrors.phone = 'Enter a valid 10-digit phone number.';
    }

    if (employeeData.email && !emailRegex.test(employeeData.email)) {
      newErrors.email = 'Enter a valid email address.';
    }

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
    } else {
      console.log('Submitted Employee Data:', employeeData);
      alert('✅ Employee added successfully!');
      setEmployeeData({
        first_name: '',
        last_name: '',
        college_name: '',
        phone: '',
        email: '',
        department: '',
        employee_id: '',
        designation: '',
      });
      setErrors({});
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 max-w-3xl">
        <h1 className="text-2xl font-bold mb-6">Upload Employee Details</h1>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            ['first_name', 'First Name'],
            ['last_name', 'Last Name'],
            ['college_name', 'College Name'],
            ['phone', 'Phone Number'],
            ['email', 'Email'],
            ['employee_id', 'Employee ID'],
            ['department', 'Department'],
            ['designation', 'Designation'],
          ].map(([key, label]) => (
            <div key={key}>
              <label className="block text-gray-700 mb-1">{label}</label>
              <input
                type="text"
                name={key}
                value={employeeData[key]}
                onChange={handleChange}
                className={`w-full p-2 border ${
                  errors[key] ? 'border-red-500' : 'border-gray-300'
                } rounded`}
                placeholder={`Enter ${label}`}
              />
              {errors[key] && <p className="text-red-500 text-sm mt-1">{errors[key]}</p>}
            </div>
          ))}

          <div className="md:col-span-2">
            <button
              type="submit"
              className="bg-sky-500 text-white px-6 py-2 rounded hover:bg-sky-700 transition"
            >
              Create Employee Login
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default EmployeeUploadPage;
