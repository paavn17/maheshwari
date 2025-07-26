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
      label: 'Track Changes',
      icon: <CreditCard size={18} className="mr-2" />,
      href: '/student/dashboard/track-changes',
    },
  ];

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="sticky top-0 h-screen w-[240px] bg-white shadow-lg flex flex-col justify-between rounded-r-2xl">
        <div>
          {/* Logo & Name */}
          <div className="flex flex-col items-center py-6">
            <Image
              src="/images/logo.png"
              alt="ID Card Logo"
              width={160}
              height={80}
              className="object-contain w-40 h-40"
            />
            <span className="mt-2 font-bold text-base text-gray-800 text-center">
              Maheshwari ID Cards
            </span>
          </div>

          {/* Navigation */}
          <nav className="flex flex-col space-y-2 px-4 mt-10">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-orange-100 text-orange-600 font-semibold shadow-sm'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-orange-600'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="px-6 mt-16">
            <button
              onClick={handleLogout}
              className="flex items-center text-sm text-red-600 hover:text-red-700 transition"
            >
              <LogOut size={18} className="mr-2" />
              Log out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto max-h-screen p-8 rounded-l-2xl">
        {children || (
          <div className="text-gray-500 text-lg">Student content goes here...</div>
        )}
      </main>
    </div>
  );
}
