'use client';

import { useEffect, useState } from 'react';
import InstituteLayout from '@/components/institute/page-layout';

export default function InstituteAdminChangeRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch pending requests for institution
  const fetchRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/institute/change-requests?status=pending', {
        credentials: 'include',
      });
      if (!res.ok) {
        const errorText = await res.text();
        console.error('Failed to fetch change requests. Status:', res.status, 'Response:', errorText);
        throw new Error('Failed to fetch change requests');
      }
      const data = await res.json();
      console.log('Fetched change requests:', data);
      setRequests(data.requests || []);
    } catch (err) {
      console.error('Error fetching change requests:', err);
      setError(err.message || 'Error fetching requests');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // Handle approve/reject decisions
  const handleDecision = async (requestId, decision) => {
    try {
      const res = await fetch('/api/institute/change-requests/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ request_id: requestId, decision }),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error('Failed to submit decision. Status:', res.status, 'Response:', errorData);
        throw new Error(errorData.error || 'Failed to submit decision');
      }
      const result = await res.json();
      console.log('Decision submitted successfully:', result);
      await fetchRequests(); // Refresh after approval/rejection
    } catch (err) {
      console.error('Error submitting decision:', err);
      alert(err.message);
    }
  };

  return (
    <InstituteLayout>
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-6">Student Change Requests</h1>
        {loading && <p>Loading change requests...</p>}
        {error && <p className="text-red-600">Error: {error}</p>}

        {!loading && !error && requests.length === 0 && <p>No pending change requests.</p>}

        <div className="space-y-6">
          {requests.map((req) => (
            <div key={req.request_id} className="border rounded p-5 shadow bg-white">
              <div className="flex justify-between items-center mb-2">
                <h2 className="font-semibold text-lg">
                  {req.student_name || 'Unknown Student'} — Roll No: {req.roll_no} &nbsp;|&nbsp; Class: {req.class} &nbsp;|&nbsp; Section: {req.section}
                  {req.branch && ` | Branch: ${req.branch}`}
                </h2>
                <span className="text-sm text-gray-500">Field: {req.field_name}</span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div>
                  <strong>Old Value:</strong>
                  <p className="mt-1">{req.old_value || <em>N/A</em>}</p>
                </div>
                <div>
                  <strong>New Value:</strong>
                  <p className="mt-1">{req.new_value || <em>N/A</em>}</p>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => handleDecision(req.request_id, 'approve')}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleDecision(req.request_id, 'reject')}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </InstituteLayout>
  );
}
