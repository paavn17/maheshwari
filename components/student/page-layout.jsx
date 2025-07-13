'use client';

import { usePathname } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  LayoutDashboard,
  CreditCard,
  LogOut,
} from 'lucide-react';

const handleLogout = async () => {
  try {
    const res = await fetch('/api/logout');
    if (res.ok) {
      window.location.href = '/login';
    }
  } catch (error) {
    console.error('Logout failed:', error);
  }
};


export default function StudentLayout({ children }) {
  const pathname = usePathname();

  const navItems = [
    {
      label: 'Dashboard',
      icon: <LayoutDashboard size={18} className="mr-2" />,
      href: '/student/dashboard',
    },
    {
      label: 'Payment',
      icon: <CreditCard size={18} className="mr-2" />,
      href: '/student/dashboard/payment'
    },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="sticky top-0 h-screen w-[240px] bg-white shadow-md flex flex-col justify-between">
        <div>
          {/* Logo & Name */}
          <div className="flex flex-col items-center py-6">
            <Image
              src="/images/logo.png"
              alt="ID Card's Logo"
              width={150}
              height={80}
              className="object-contain"
            />
            <span className="mt-2 font-bold text-lg text-gray-800 text-center">
              Maheshwari ID Cards
            </span>
          </div>

          {/* Gap */}
          <div className="mt-4 "></div>

          {/* Navigation */}
          <nav className="flex flex-col space-y-3 px-4 mt-10">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition ${
                    isActive
                      ? 'bg-sky-100 text-sky-700 font-semibold w-auto'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-sky-700'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              );
            })}
          </nav>
                  {/* Logout */}
        <div className="px-8 mt-16">
          <Link
            href="/login"
            className="flex items-center text-sm text-red-600 hover:text-red-700 transition"
            onClick={handleLogout}
          >
            <LogOut size={18} className="mr-2" />
            Log out
          </Link>
        </div>

        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto max-h-screen p-8 bg-sky-100">
        {children || (
          <div className="text-gray-400 text-lg">Student content goes here...</div>
        )}
      </main>
    </div>
  );
}
