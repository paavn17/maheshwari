'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/admin/page-layout';

export default function ChangePasswordPage() {
  const [secretCode, setSecretCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  const verifySecretCode = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const res = await fetch('/api/superadmin/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret: secretCode.trim() }),
      });
      const data = await res.json();
      if (data.valid) {
        setConfirmed(true);
        setSecretCode('');
        setMessage({ type: 'success', text: '✅ Code verified. You may now change the password.' });
      } else {
        setMessage({ type: 'error', text: '❌ Invalid secret code.' });
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Server error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async () => {
    if (!password || password.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters.' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await fetch('/api/superadmin/change-password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword: password }),
      });
      const data = await res.json();

      if (data.success) {
        setMessage({ type: 'success', text: '✅ Password changed successfully.' });
        setPassword('');
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to change password.' });
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Server error. Try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-md mx-auto mt-10 bg-white shadow p-6 rounded-lg border">
        <h1 className="text-xl font-semibold text-orange-700 mb-4">🔐 Change Admin Password</h1>

        {message.text && (
          <div
            className={`mb-4 p-2 text-sm rounded ${
              message.type === 'error'
                ? 'bg-red-100 text-red-700'
                : 'bg-emerald-100 text-emerald-700'
            }`}
          >
            {message.text}
          </div>
        )}

        {!confirmed ? (
          <>
            <label className="block text-sm font-medium text-gray-700 mb-1">Enter Secret Code:</label>
            <input
              type="password"
              value={secretCode}
              onChange={(e) => setSecretCode(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && verifySecretCode()}
              className="w-full border border-orange-300 rounded px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-orange-400"
              placeholder="Secret Code"
            />
            <button
              onClick={verifySecretCode}
              disabled={loading || !secretCode.trim()}
              className="w-full bg-orange-500 text-white py-2 rounded hover:bg-orange-600 transition disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Submit Code'}
            </button>
          </>
        ) : (
          <>
            <label className="block text-sm font-medium text-gray-700 mb-1">Enter New Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && changePassword()}
              className="w-full border border-orange-300 rounded px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-orange-400"
              placeholder="New Password"
            />
            <button
              onClick={changePassword}
              disabled={loading || !password}
              className="w-full bg-orange-500 text-white py-2 rounded hover:bg-orange-600 transition disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Change Password'}
            </button>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
