'use client';

import DashboardLayout from '@/components/admin/page-layout';
import { useState, useMemo } from 'react';
import { CheckCircle, Clock, XCircle } from 'lucide-react';

const dummyPayments = [
  {
    id: 1,
    college_code: 'VIGN001',
    amount: 2500,
    status: 'paid',
    payment_date: '2025-07-09',
    due_date: null,
    id_cards: 50,
    name: 'Ravi Kumar',
  },
  {
    id: 2,
    college_code: 'VIGN001',
    amount: 1500,
    status: 'unpaid',
    payment_date: null,
    due_date: '2025-07-15',
    id_cards: 30,
    name: 'Sneha Reddy',
  },
  {
    id: 3,
    college_code: 'VIGN002',
    amount: 3000,
    status: 'paid',
    payment_date: '2025-07-05',
    due_date: null,
    id_cards: 60,
    name: 'Arun Verma',
  },
  {
    id: 4,
    college_code: 'VIGN003',
    amount: 1800,
    status: 'unpaid',
    payment_date: null,
    due_date: '2025-07-18',
    id_cards: 40,
    name: 'Priya Das',
  },
];

export default function Page() {
  const [payments, setPayments] = useState(dummyPayments);
  const [search, setSearch] = useState('');
  const [selectedPayment, setSelectedPayment] = useState(null);

  const groupedPayments = useMemo(() => {
    const result = {};
    payments.forEach((payment) => {
      if (
        search === '' ||
        payment.college_code.toLowerCase().includes(search.toLowerCase())
      ) {
        if (!result[payment.college_code]) result[payment.college_code] = [];
        result[payment.college_code].push(payment);
      }
    });
    return result;
  }, [search, payments]);

  const confirmMarkAsPaid = () => {
    if (!selectedPayment) return;
    const today = new Date().toISOString().split('T')[0];

    const updated = payments.map((p) =>
      p.id === selectedPayment.id
        ? {
            ...p,
            status: 'paid',
            payment_date: today,
            due_date: null,
          }
        : p
    );
    console.log('Marked as Paid:', {
      ...selectedPayment,
      status: 'paid',
      payment_date: today,
      due_date: null,
    });
    setPayments(updated);
    setSelectedPayment(null); // close modal
  };

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-semibold text-gray-800 mb-4">Payment Details</h1>

      <input
        type="text"
        placeholder="Search by College Code..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-6 px-4 py-2 border rounded w-full md:w-1/3"
      />

      {Object.entries(groupedPayments).map(([collegeCode, payments]) => (
        <div key={collegeCode} className="mb-10">
          <h2 className="text-xl font-semibold text-sky-800 mb-2">
            College Code: {collegeCode}
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
              <thead className="bg-sky-200 text-gray-700 text-left text-sm">
                <tr>
                  <th className="px-6 py-3">#</th>
                  <th className="px-6 py-3">Name</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Amount (₹)</th>
                  <th className="px-6 py-3">ID Cards</th>
                  <th className="px-6 py-3">Payment Date</th>
                  <th className="px-6 py-3">Due Date</th>
                  <th className="px-6 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="text-sm text-gray-800">
                {payments.map((p, idx) => {
                  const isPaid = p.status === 'paid';
                  return (
                    <tr
                      key={p.id}
                      className={`border-t ${
                        isPaid ? 'bg-white' : 'bg-gray-50 text-gray-600'
                      }`}
                    >
                      <td className="px-6 py-3">{idx + 1}</td>
                      <td className="px-6 py-3">{p.name}</td>
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-2">
                          {isPaid ? (
                            <>
                              <CheckCircle className="text-green-600" size={16} />
                              <span className="text-green-700 font-medium">Paid</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="text-red-500" size={16} />
                              <span className="text-red-600 font-medium">Unpaid</span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-3">₹{p.amount}</td>
                      <td className="px-6 py-3">{p.id_cards}</td>
                      <td className="px-6 py-3">
                        {p.payment_date ? (
                          <span className="text-green-700">{p.payment_date}</span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-3">
                        {p.due_date ? (
                          <div className="flex items-center gap-1">
                            <Clock size={14} className="text-yellow-500" />
                            <span className="text-yellow-600">{p.due_date}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-3">
                        {!isPaid && (
                          <button
                            onClick={() => setSelectedPayment(p)}
                            className="bg-sky-500 hover:bg-sky-600 text-white px-3 py-1 text-sm rounded"
                          >
                            Mark as Paid
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      {/* Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg max-w-md w-full">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">
              Confirm Payment
            </h2>
            <div className="text-sm text-gray-700 space-y-1 mb-4">
              <p>
                <strong>Name:</strong> {selectedPayment.name}
              </p>
              <p>
                <strong>College Code:</strong> {selectedPayment.college_code}
              </p>
              <p>
                <strong>Amount:</strong> ₹{selectedPayment.amount}
              </p>
              <p>
                <strong>ID Cards:</strong> {selectedPayment.id_cards}
              </p>
              <p>
                <strong>Due Date:</strong> {selectedPayment.due_date}
              </p>
              <p>
                <strong>Will mark as paid on:</strong>{' '}
                {new Date().toISOString().split('T')[0]}
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setSelectedPayment(null)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-3 py-1 rounded"
              >
                Cancel
              </button>
              <button
                onClick={confirmMarkAsPaid}
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
              >
                Confirm & Save
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
