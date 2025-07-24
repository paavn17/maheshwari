'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/admin/page-layout';
import * as XLSX from 'xlsx';

export default function SuperAdminStudentsPage() {
  const [institutions, setInstitutions] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [allStudents, setAllStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);

  // Dropdown filters
  const [studentType, setStudentType] = useState('');
  const [startYear, setStartYear] = useState('');
  const [endYear, setEndYear] = useState('');
  const [branch, setBranch] = useState('');
  const [className, setClassName] = useState('');
  const [section, setSection] = useState('');

  const [availableFilters, setAvailableFilters] = useState({
    studentTypes: [],
    startYears: [],
    endYears: [],
    branches: [],
    classes: [],
    sections: [],
  });

  const fetchInstitutions = async () => {
    const res = await fetch('/api/superadmin/students/colleges');
    const data = await res.json();
    if (data.success) setInstitutions(data.institutions);
  };

  const fetchStudents = async (institution_id) => {
    const res = await fetch('/api/superadmin/students/by-institution', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ institution_id }),
    });
    const data = await res.json();
    if (data.success) {
      setAllStudents(data.students);
      setFilteredStudents(data.students);
      extractFilters(data.students);
    }
  };

  const extractFilters = (students) => {
    const unique = (key) => [...new Set(students.map((s) => s[key]).filter(Boolean))];

    setAvailableFilters({
      studentTypes: unique('student_type'),
      startYears: unique('start_year'),
      endYears: unique('end_year'),
      branches: unique('branch'),
      classes: unique('class'),
      sections: unique('section'),
    });
  };

  const filterStudents = () => {
    let results = [...allStudents];

    if (studentType) results = results.filter((s) => s.student_type === studentType);
    if (startYear) results = results.filter((s) => s.start_year == startYear);
    if (endYear) results = results.filter((s) => s.end_year == endYear);
    if (studentType !== 'School' && branch) results = results.filter((s) => s.branch === branch);
    if (studentType === 'School') {
      if (className) results = results.filter((s) => s.class === className);
      if (section) results = results.filter((s) => s.section === section);
    }

    setFilteredStudents(results);
  };

  const handleInstitutionChange = (e) => {
    const id = e.target.value;
    setSelectedId(id);
    resetFilters();
    if (id) fetchStudents(id);
    else {
      setAllStudents([]);
      setFilteredStudents([]);
    }
  };

  const resetFilters = () => {
    setStudentType('');
    setStartYear('');
    setEndYear('');
    setBranch('');
    setClassName('');
    setSection('');
    setAvailableFilters({
      studentTypes: [],
      startYears: [],
      endYears: [],
      branches: [],
      classes: [],
      sections: [],
    });
  };

  const handleDownload = () => {
    if (!filteredStudents.length) return;
    const withoutImage = filteredStudents.map(({ profile_pic, ...rest }) => rest);
    const worksheet = XLSX.utils.json_to_sheet(withoutImage);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Students');
    XLSX.writeFile(workbook, `students_${selectedId}.xlsx`);
  };

  useEffect(() => {
    fetchInstitutions();
  }, []);

  useEffect(() => {
    filterStudents();
  }, [studentType, startYear, endYear, branch, className, section]);

  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold text-orange-700 mb-6">🎓 Student Viewer (By Institution)</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <select value={selectedId} onChange={handleInstitutionChange} className="p-2 border rounded">
            <option value="">-- Select Institution --</option>
            {institutions.map((i) => (
              <option key={i.id} value={i.id}>{i.name}</option>
            ))}
          </select>

          {availableFilters.studentTypes.length > 0 && (
            <select value={studentType} onChange={(e) => setStudentType(e.target.value)} className="p-2 border rounded">
              <option value="">All Types</option>
              {availableFilters.studentTypes.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          )}

          {availableFilters.startYears.length > 0 && (
            <select value={startYear} onChange={(e) => setStartYear(e.target.value)} className="p-2 border rounded">
              <option value="">All Start Years</option>
              {availableFilters.startYears.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          )}

          {availableFilters.endYears.length > 0 && (
            <select value={endYear} onChange={(e) => setEndYear(e.target.value)} className="p-2 border rounded">
              <option value="">All End Years</option>
              {availableFilters.endYears.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          )}

          {studentType !== 'School' && availableFilters.branches.length > 0 && (
            <select value={branch} onChange={(e) => setBranch(e.target.value)} className="p-2 border rounded">
              <option value="">All Branches</option>
              {availableFilters.branches.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          )}

          {studentType === 'School' && (
            <>
              <select value={className} onChange={(e) => setClassName(e.target.value)} className="p-2 border rounded">
                <option value="">All Classes</option>
                {availableFilters.classes.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <select value={section} onChange={(e) => setSection(e.target.value)} className="p-2 border rounded">
                <option value="">All Sections</option>
                {availableFilters.sections.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </>
          )}
        </div>

        <div className="mb-4">
          <button
            onClick={handleDownload}
            disabled={!filteredStudents.length}
            className="bg-orange-500 text-white px-4 py-2 rounded shadow disabled:opacity-50"
          >
            ⬇️ Download Excel
          </button>
        </div>

        {filteredStudents.length > 0 ? (
          <div className="overflow-auto border rounded">
            <table className="min-w-full text-sm">
              <thead className="bg-orange-100 sticky top-0">
                <tr>
                  <th className="px-3 py-2">Photo</th>
                  <th className="px-3 py-2">Name</th>
                  <th className="px-3 py-2">Father</th>
                  <th className="px-3 py-2">Roll No</th>
                  <th className="px-3 py-2">Mobile</th>
                  <th className="px-3 py-2">Gender</th>
                  <th className="px-3 py-2">DOB</th>
                  <th className="px-3 py-2">Blood</th>
                  <th className="px-3 py-2">Branch</th>
                  <th className="px-3 py-2">Class</th>
                  <th className="px-3 py-2">Section</th>
                  <th className="px-3 py-2">Start</th>
                  <th className="px-3 py-2">End</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((s) => (
                  <tr key={s.id} className="odd:bg-orange-50 even:bg-white">
                    <td className="px-3 py-2">
  {s.profile_pic ? (
   <img
  src={s.profile_pic || '/images/avatar-placeholder.png'}
  alt="profile"
  className="w-10 h-10 rounded-full object-cover"
/>

  ) : (
    <div className="w-10 h-10 bg-gray-200 rounded-full" />
  )}
</td>

                    <td className="px-3 py-2">{s.name}</td>
                    <td className="px-3 py-2">{s.father_name || '-'}</td>
                    <td className="px-3 py-2">{s.roll_no}</td>
                    <td className="px-3 py-2">{s.mobile}</td>
                    <td className="px-3 py-2">{s.gender}</td>
                    <td className="px-3 py-2">{s.dob}</td>
                    <td className="px-3 py-2">{s.blood_group}</td>
                    <td className="px-3 py-2">{s.branch}</td>
                    <td className="px-3 py-2">{s.class}</td>
                    <td className="px-3 py-2">{s.section}</td>
                    <td className="px-3 py-2">{s.start_year}</td>
                    <td className="px-3 py-2">{s.end_year}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          selectedId && <p className="text-gray-500 italic mt-4">No students found.</p>
        )}
      </div>
    </DashboardLayout>
  );
}
