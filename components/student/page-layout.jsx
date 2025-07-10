'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function StudentLayout({ children }) {
  const pathname = usePathname();

  const isActive = (href) => pathname === href;

  return (
    <div className="flex min-h-screen font-sans">
      {/* Sidebar */}
      <aside className="bg-sky-200 p-6 shadow-lg flex flex-col justify-between min-w-[220px] max-w-[260px]">
        <div>
          {/* Logo */}
          <div className="flex items-center justify-center mb-10">
            <Image
              src="/images/logo.png"
              alt="ID Card's Logo"
              width={120}
              height={120}
              className="object-contain"
            />
          </div>

          {/* Navigation */}
          <nav className="flex flex-col text-[16px] font-medium text-gray-800 space-y-4">
            <Link
              href="/student/dashboard"
              className={`text-left hover:text-sky-700 transition ${
                isActive('/student/dashboard') ? 'text-sky-700 font-semibold' : ''
              }`}
            >
              Dashboard
            </Link>

            <Link
              href="/student/dashboard/card-designs"
              className={`text-left hover:text-sky-700 transition ${
                isActive('/student/dashboard/card-designs') ? 'text-sky-700 font-semibold' : ''
              }`}
            >
              Card Designs
            </Link>
            <Link
            href="/login"
            className="text-left text-red-600 hover:text-red-700 transition font-medium mt-16"
          >
            Logout
          </Link>
          </nav>
        </div>

        {/* Logout Button */}
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-white p-10">
        {children || <div className="text-gray-400 text-xl">Student content goes here...</div>}
      </main>
    </div>
  );
}
