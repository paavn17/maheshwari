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
      <nav className="w-full max-w-8xl mx-auto bg-white/70 backdrop-blur-md border border-white/30 rounded-xl px-6 md:px-10 py-4 shadow-md">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          {/* Logo */}
          <Image src="/images/logo.png" alt="Logo" width={90} height={50} />

          {/* Auth Button */}
          <div className="w-full sm:w-auto">
            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                className="w-full sm:w-auto px-6 py-3 text-base sm:text-sm font-semibold text-gray-700 bg-white/80 border border-gray-300 rounded-lg hover:bg-white hover:shadow-md transition duration-200"
              >
                Logout
              </button>
            ) : (
              <button
                onClick={handleLogin}
                className="w-full sm:w-auto px-6 py-3 text-base sm:text-sm font-semibold text-gray-700 bg-blue-300  border border-gray-300 rounded-lg hover:bg-white hover:shadow-md transition duration-200"
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
