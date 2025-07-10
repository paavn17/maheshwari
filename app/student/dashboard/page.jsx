'use client';

import { useState, useMemo } from 'react';
import StudentLayout from '@/components/student/page-layout';
import Image from 'next/image';
import { idCardImages } from '@/lib/idCard';

const dummyStudent = {
  id: 1,
  first_name: 'Aarav',
  last_name: 'Reddy',
  college_code: 'VGN01',
  roll_no: '21VGNCSE001',
  college_name: 'Vignan Institute of Technology',
  year: '3rd Year',
  mobile: '9876543210',
  branch: 'CSE',
  image: 'https://randomuser.me/api/portraits/men/1.jpg',
  payment_status: 'unpaid',
  selected_id: '',
};

export default function StudentDashboard() {
  const [student, setStudent] = useState(dummyStudent);
  const [searchTerm, setSearchTerm] = useState('');
  const [editMode, setEditMode] = useState(false);

  const filteredCards = useMemo(() => {
    return idCardImages.filter((card) =>
      card.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setStudent((prev) => ({ ...prev, [name]: value }));
  };

  const handleCardSelect = (name) => {
    setStudent((prev) => ({ ...prev, selected_id: name }));
  };

  const handlePay = () => {
    setStudent((prev) => ({ ...prev, payment_status: 'paid' }));
  };

  const handleDownload = () => {
    alert(`Downloading card: ${student.selected_id}`);
  };

  const handleSave = () => {
    const requiredFields = [
      'first_name',
      'last_name',
      'college_code',
      'roll_no',
      'college_name',
      'year',
      'mobile',
      'branch'
    ];

    for (let field of requiredFields) {
      if (!student[field] || student[field].trim() === '') {
        alert(`Please fill in the ${field.replace('_', ' ')} field.`);
        return;
      }
    }

    console.log('Saved student data:', student);
    setEditMode(false);
  };

  return (
    <StudentLayout>
      <div className="flex flex-col md:flex-row gap-6 p-6">
        {/* Left - Student Info */}
        <div className="flex-1 bg-white p-4 rounded space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-sky-700">Your Details</h2>
            {editMode ? (
              <button
                onClick={handleSave}
                className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
              >
                Save
              </button>
            ) : (
              <button
                onClick={() => setEditMode(true)}
                className="bg-sky-500 text-white px-3 py-1 rounded hover:bg-sky-600"
              >
                Edit
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {Object.entries(student).map(([key, val]) => {
              if (['selected_id', 'payment_status'].includes(key)) return null;

              const label = key.replace(/_/g, ' ');

              return (
                <div key={key}>
                  <label className="block text-sm text-gray-600 capitalize mb-1">
                    {label}
                  </label>
                  <input
                    type="text"
                    name={key}
                    value={val}
                    onChange={handleInputChange}
                    disabled={!editMode || key === 'image'}
                    className={`w-full p-2 border rounded ${
                      !editMode || key === 'image' ? 'bg-gray-100' : ''
                    }`}
                  />
                </div>
              );
            })}
          </div>

          <div className="mt-4">
            <label className="block text-sm text-gray-600">Payment Status</label>
            <span
              className={`px-3 py-1 rounded text-white text-sm inline-block ${
                student.payment_status === 'paid' ? 'bg-green-500' : 'bg-red-500'
              }`}
            >
              {student.payment_status}
            </span>
          </div>

          <div className="mt-6 space-x-4">
            <button
              onClick={handlePay}
              className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
              disabled={!student.selected_id || student.payment_status === 'paid'}
            >
              Pay Now
            </button>
            <button
              onClick={handleDownload}
              className="bg-sky-600 text-white px-4 py-2 rounded disabled:opacity-50"
              disabled={student.payment_status !== 'paid'}
            >
              Download Card
            </button>
          </div>
        </div>

        {/* Right - ID Card List */}
        <div className="w-full md:w-[300px] space-y-4">
          <input
            type="text"
            placeholder="Search ID card..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 border rounded"
          />

          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
            {filteredCards.map((card) => (
              <div
                key={card.name}
                className={`p-2 rounded flex flex-col items-center cursor-pointer hover:shadow transition ${
                  student.selected_id === card.name
                    ? 'bg-sky-300'
                    : 'bg-white'
                }`}
                onClick={() => handleCardSelect(card.name)}
              >
                <div className="relative w-[150px] h-[225px]">
                  <Image
                    src={card.url}
                    alt={card.name}
                    fill
                    className="object-cover rounded"
                  />
                </div>
                <span className="mt-2 text-sm text-center font-medium text-sky-800">
                  {card.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}
