'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  UploadCloud,
  UserPlus,
  UserCircle,
  ShieldCheck,
  CreditCard,
  IdCard,
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

export default function InstituteLayout({ children }) {
  const pathname = usePathname();

  const navItems = [
    {
      label: 'Dashboard',
      href: '/institute/dashboard/',
      icon: <LayoutDashboard size={18} className="mr-2" />,
    },
    {
      label: 'Upload Students Data',
      href: '/institute/dashboard/upload-students',
      icon: <UploadCloud size={18} className="mr-2" />,
    },
    {
      label: 'Upload Employee Data',
      href: '/institute/dashboard/upload-employees',
      icon: <UserPlus size={18} className="mr-2" />,
    },
    {
      label: 'Update Students Data',
      href: '/institute/dashboard/update-student',
      icon: <UploadCloud size={18} className="mr-2" />,
    },
    {
      label: 'Update Profile',
      href: '/institute/dashboard/update-profile',
      icon: <UserCircle size={18} className="mr-2" />,
    },
    {
      label: 'Payment',
      href: '/institute/dashboard/payment',
      icon: <CreditCard size={18} className="mr-2" />,
    },
    {
      label: 'Card Designs',
      href: '/institute/dashboard/card-designs',
      icon: <IdCard size={18} className="mr-2" />,
    },
    {
      label: 'Upload Card Design',
      href: '/institute/dashboard/upload-card',
      icon: <IdCard size={18} className="mr-2" />,
    },
        {
      label: 'Requested changes',
      href: '/institute/dashboard/requested-changes',
      icon: <IdCard size={18} className="mr-2" />,
    },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      {/* Sidebar */}
      <aside className="sticky top-0 h-screen w-64 bg-white shadow-lg flex flex-col justify-between border-r border-gray-200">
        <div>
          {/* Logo & Name */}
          <div className="flex flex-col items-center py-6 px-4">
            <Image
              src="/images/logo.png"
              alt="Institute Logo"
              width={160}
              height={80}
              className="object-contain rounded-xl shadow"
            />
            <span className="mt-4 text-lg font-bold text-orange-600 text-center">
              Maheshwari ID Cards
            </span>
          </div>

          {/* Navigation */}
          <nav className="flex flex-col px-4 mt-8 space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center px-4 py-2 rounded-xl text-sm transition-all duration-150 ${
                    isActive
                      ? 'bg-orange-100 text-orange-700 font-semibold shadow-sm'
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
          <div className="px-6 mt-12">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:text-red-700 transition-all"
            >
              <LogOut size={18} className="mr-2" />
              Log out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto max-h-screen p-6 md:p-10 bg-gray-50">
        {children || (
          <div className="text-gray-500 text-lg font-medium">
            Institute content goes here...
          </div>
        )}
      </main>
    </div>
  );
}
