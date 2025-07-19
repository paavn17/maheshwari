// Navbar Component
'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  const handleLogin = () => {
    router.push('/login');
  };

  const handleLogout = () => {
    console.log('Logging out...');
    setIsLoggedIn(false);
  };

  return (
    <div className="pt-6 px-4 md:px-8">
      <nav className="w-full max-w-7xl mx-auto bg-white/90 backdrop-blur-md border border-orange-100 rounded-2xl px-6 md:px-10 shadow-lg">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 py-4">
          {/* Logo */}
          <Image src="/images/logo.png" alt="Logo" width={90} height={50} />

          {/* Auth Button */}
          <div className="w-full sm:w-auto">
            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                className="w-full sm:w-auto px-6 py-3 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded-xl transition-colors"
              >
                Logout
              </button>
            ) : (
              <button
                onClick={handleLogin}
                className="w-full sm:w-auto px-8 py-3 text-sm font-semibold text-white bg-orange-400 hover:bg-orange-500 rounded-xl shadow-md transition-colors"
              >
                Login
              </button>
            )}
          </div>
        </div>
      </nav>
    </div>
  );
}