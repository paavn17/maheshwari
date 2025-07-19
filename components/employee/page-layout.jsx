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

export default function EmployeeLayout({ children }) {
  const pathname = usePathname();

  const navItems = [
    {
      label: 'Dashboard',
      icon: <LayoutDashboard size={18} className="mr-2" />,
      href: '/employee/dashboard',
    },
    {
      label: 'Payment',
      icon: <CreditCard size={18} className="mr-2" />,
      href: '/employee/dashboard/payment',
    },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="sticky top-0 h-screen w-[250px] bg-white shadow-lg flex flex-col justify-between rounded-r-2xl">
        <div>
          {/* Logo & Name */}
          <div className="flex flex-col items-center py-6">
            <div className="w-40 h-40 relative">
              <Image
                src="/images/logo.png"
                alt="ID Card's Logo"
                fill
                className="object-contain"
              />
            </div>
            <span className="mt-2 font-semibold text-base text-gray-800 text-center">
              Maheshwari ID Cards
            </span>
          </div>

          {/* Navigation */}
          <nav className="flex flex-col space-y-3 px-6 mt-6">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center px-4 py-2 rounded-xl text-sm transition font-medium ${
                    isActive
                      ? 'bg-orange-100 text-orange-600 shadow-inner'
                      : 'text-gray-700 hover:bg-gray-200 hover:text-orange-600'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="px-6 mt-12">
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
      <main className="flex-1 overflow-y-auto max-h-screen p-8 bg-gray-50 rounded-l-2xl shadow-inner">
        {children || (
          <div className="text-gray-400 text-lg">Employee content goes here...</div>
        )}
      </main>
    </div>
  );
}
