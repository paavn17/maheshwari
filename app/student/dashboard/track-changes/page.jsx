'use client';

import { useEffect, useState } from 'react';
import StudentLayout from '@/components/student/page-layout';

export default function MyChangeRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/student/request-change', {
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setRequests(data.requests || []);
    } catch (err) {
      setError(err.message || 'Error');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  return (
    <StudentLayout>
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-6">My Change Requests</h1>
        {loading && <p>Loading...</p>}
        {error && <p className="text-red-600">{error}</p>}
        {!loading && !error && requests.length === 0 && (
          <p>No change requests found.</p>
        )}

        <div className="space-y-6">
          {requests.map((req) => (
            <div key={req.request_id} className="border rounded p-4 shadow bg-white">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-orange-700">
                  {req.field_name}
                </span>
                <span className={`text-xs rounded-full px-2 py-1 ${
                  req.status === 'pending'
                  ? 'bg-yellow-100 text-yellow-800'
                  : req.status === 'approved'
                  ? 'bg-green-100 text-green-800'
                  : req.status === 'rejected'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-gray-100 text-gray-700'
                }`}>
                  {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className='font-semibold'>Old Value:</div>
                  <div>{req.old_value || <em>N/A</em>}</div>
                </div>
                <div>
                  <div className='font-semibold'>New Value:</div>
                  <div>{req.new_value || <em>N/A</em>}</div>
                </div>
              </div>
              <div className="text-xs text-gray-400 mt-2">
                Requested at: {new Date(req.requested_at).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </StudentLayout>
  );
}
