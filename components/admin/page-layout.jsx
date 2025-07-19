'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  UserCog,
  Upload,
  Users,
  Layers,
  UserPlus,
  ImageIcon,
  FileText,
  CreditCard,
  Download,
  FileDown,
  Lock,
  LogOut,
} from 'lucide-react';

// Optimized menu items with unique icons and clear priority
const menuItems = [
  {
    title: 'Dashboard',
    href: '/admin/dashboard',
    icon: <LayoutDashboard size={18} className="mr-2" />,
  },
  {
    title: 'Admin Details',
    href: '/admin/dashboard/admin-details',
    icon: <UserCog size={18} className="mr-2" />,
  },
  {
    title: 'Add Admins',
    href: '/admin/dashboard/add-admins',
    icon: <UserPlus size={18} className="mr-2" />,
  },
  {
    title: 'Upload Students Data',
    href: '/admin/dashboard/upload-students',
    icon: <Upload size={18} className="mr-2" />,
  },
  {
    title: 'Upload Employee Data',
    href: '/admin/dashboard/upload-employees',
    icon: <Users size={18} className="mr-2" />,
  },
  {
    title: 'Card Master',
    href: '/admin/dashboard/card-master',
    icon: <Layers size={18} className="mr-2" />,
  },
  {
    title: 'Card Designs',
    href: '/admin/dashboard/card-designs',
    icon: <ImageIcon size={18} className="mr-2" />,
  },
  {
    title: 'Requested Card Designs',
    href: '/admin/dashboard/requested-card-designs',
    icon: <FileText size={18} className="mr-2" />,
  },
  {
    title: 'Payment Details',
    href: '/admin/dashboard/payment-details',
    icon: <CreditCard size={18} className="mr-2" />,
  },
  {
    title: 'Download Employees Data',
    href: '/admin/dashboard/download-employee-data',
    icon: <Download size={18} className="mr-2" />,
  },
  {
    title: 'Download Students Data',
    href: '/admin/dashboard/download-data',
    icon: <FileDown size={18} className="mr-2" />,
  },
  {
    title: 'Change Password',
    href: '/admin/dashboard/change-password',
    icon: <Lock size={18} className="mr-2" />,
  },
  {
    title: 'Logout',
    href: '/login',
    danger: true,
    icon: <LogOut size={18} className="mr-2" />,
  },
];

export default function DashboardLayout({ children }) {
  const pathname = usePathname();

  const isActive = (href) => pathname === href;

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/logout');
      if (res.ok) window.location.href = '/login';
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  return (
    <div className="flex font-sans bg-gray-50">
      {/* Sidebar */}
      <aside className="sticky top-0  w-[240px] bg-white shadow-md flex flex-col justify-between">
        <div>
          {/* Logo & Title */}
          <div className="flex flex-col items-center ">
            <Image
              src="/images/logo.png"
              alt="ID Card Logo"
              width={150}
              height={80}
              className="object-contain"
            />
            <span className=" font-bold text-lg text-gray-800 text-center">
              Maheshwari ID Cards
            </span>
          </div>

          {/* Navigation */}
          <nav className="flex flex-col space-y-2 px-4 mt-10 text-sm font-medium mb-40">
            {menuItems.map((item) =>
              item.title === 'Logout' ? (
                <button
                  key="logout"
                  onClick={handleLogout}
                  className="flex items-center justify-between px-4 py-2 rounded-md transition text-red-600 hover:text-red-700"
                >
                  <div className="flex items-center">
                    {item.icon}
                    <span>{item.title}</span>
                  </div>
                  <div className="w-[18px]" />
                </button>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-4 py-2 rounded-md transition ${
                    item.danger
                      ? 'text-red-600 hover:text-red-700'
                      : 'text-gray-600 hover:text-sky-700 hover:bg-gray-100'
                  } ${
                    isActive(item.href)
                      ? item.danger
                        ? 'text-red-600 font-semibold'
                        : 'bg-sky-100 text-sky-700 font-semibold'
                      : ''
                  }`}
                >
                  <div className="flex items-center">
                    {item.icon}
                    <span>{item.title}</span>
                  </div>
                  <div className="w-[18px]" />
                </Link>
              )
            )}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto  p-8 bg-sky-100">
        {children || (
          <div className="text-gray-400 text-lg">Main content goes here...</div>
        )}
      </main>
    </div>
  );
}
