'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function InstituteLayout({ children }) {
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
              alt="Institute Logo"
              width={120}
              height={120}
              className="object-contain"
            />
          </div>

          {/* Navigation */}
          <nav className="flex flex-col text-[16px] font-medium text-gray-800 space-y-4">
              <Link
              href="/institute/dashboard/"
              className={`hover:text-sky-700 transition mb-16 font-bold ${
                isActive('/institute/dashboard/upload-employees') ? 'text-sky-700 font-semibold' : ''
              }`}
            >
              Dashboard
            </Link>

            <Link
              href="/institute/dashboard/upload-students"
              className={`hover:text-sky-700 transition ${
                isActive('/institute/dashboard/upload-students') ? 'text-sky-700 font-semibold' : ''
              }`}
            >
              Upload Students Data
            </Link>

            <Link
              href="/institute/dashboard/upload-employees"
              className={`hover:text-sky-700 transition ${
                isActive('/institute/dashboard/upload-employees') ? 'text-sky-700 font-semibold' : ''
              }`}
            >
              Upload Employee Data
            </Link>

            <Link
              href="/institute/dashboard/update-profile"
              className={`hover:text-sky-700 transition ${
                isActive('/institute/dashboard/update-profile') ? 'text-sky-700 font-semibold' : ''
              }`}
            >
              Update Profile
            </Link>

            <Link
              href="/institute/dashboard/access-control"
              className={`hover:text-sky-700 transition ${
                isActive('/institute/dashboard/access-control') ? 'text-sky-700 font-semibold' : ''
              }`}
            >
              Access Control
            </Link>

            {/* Spacer */}
            <div className="h-4" />

            <Link
              href="/institute/dashboard/payment"
              className={`hover:text-sky-700 transition ${
                isActive('/institute/dashboard/payment') ? 'text-sky-700 font-semibold' : ''
              }`}
            >
              Payment
            </Link>

            <Link
              href="/institute/dashboard/card-designs"
              className={`hover:text-sky-700 transition ${
                isActive('/institute/dashboard/card-designs') ? 'text-sky-700 font-semibold' : ''
              }`}
            >
              Card Designs
            </Link>
          </nav>
        </div>

        {/* Logout Button */}
        <div className="mt-10">
          <Link
            href="/login"
            className="text-left text-red-600 hover:text-red-700 transition font-medium"
          >
            Logout
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-white p-10">
        {children || <div className="text-gray-400 text-xl">Institute content goes here...</div>}
      </main>
    </div>
  );
}
