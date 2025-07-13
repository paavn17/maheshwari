'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  FileBarChart2,
  CreditCard,
  Lock,
  LogOut,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';

const menuItems = [
  {
    title: 'Dashboard',
    href: '/admin/dashboard',
    icon: <LayoutDashboard size={18} className="mr-2" />,
  },
  {
    title: 'User Management',
    icon: <Users size={18} className="mr-2" />,
    submenu: [
      { title: 'Admin Details', href: '/admin/dashboard/admin-details' },
      { title: 'Upload Students Data', href: '/admin/dashboard/upload-students' },
      { title: 'Upload Employee Data', href: '/admin/dashboard/upload-employees' },
      { title: 'Upload Photo', href: '/admin/dashboard/upload-photos' },
      { title: 'Card Master', href: '/admin/dashboard/card-master' },
    ],
  },
  {
    title: 'Payment Details',
    href: '/admin/dashboard/payment-details',
    icon: <CreditCard size={18} className="mr-2" />,
  },
  {
    title: 'Reports',
    icon: <FileBarChart2 size={18} className="mr-2" />,
    submenu: [
      { title: 'Organizationwise', href: '/admin/dashboard/organization-wise' },
      { title: 'Payment Report', href: '/admin/dashboard/payment-report' },
      { title: 'Download Data', href: '/admin/dashboard/download-data' },
      { title: 'Card Designs', href: '/admin/dashboard/card-designs' },
    ],
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
  const [expandedMenus, setExpandedMenus] = useState({});

  const toggleMenu = (title) => {
    setExpandedMenus((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  const isActive = (href) => pathname === href;

  useEffect(() => {
    const initiallyExpanded = {};
    menuItems.forEach((item) => {
      if (item.submenu) {
        item.submenu.forEach((sub) => {
          if (pathname.startsWith(sub.href)) {
            initiallyExpanded[item.title] = true;
          }
        });
      }
    });
    setExpandedMenus((prev) => ({ ...prev, ...initiallyExpanded }));
  }, [pathname]);

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/logout');
      if (res.ok) window.location.href = '/login';
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  return (
    <div className="flex min-h-screen font-sans bg-gray-50">
      {/* Sidebar */}
      <aside className="sticky top-0 h-screen w-[240px] bg-white shadow-md flex flex-col justify-between">
        <div>
          {/* Logo & Title */}
          <div className="flex flex-col items-center py-6">
            <Image
              src="/images/logo.png"
              alt="ID Card Logo"
              width={150}
              height={80}
              className="object-contain"
            />
            <span className="mt-2 font-bold text-lg text-gray-800 text-center">
              Maheshwari ID Cards
            </span>
          </div>

          {/* Navigation */}
          <nav className="flex flex-col space-y-3 px-4 mt-10 text-sm font-medium">
            {menuItems.map((item) =>
              item.submenu ? (
                <div key={item.title}>
                  <button
                    onClick={() => toggleMenu(item.title)}
                    className="flex items-center justify-between w-full text-gray-700 hover:text-sky-700 transition"
                  >
                    <div className="flex items-center">
                      {item.icon}
                      <span>{item.title}</span>
                    </div>
                    {expandedMenus[item.title] ? (
                      <ChevronDown size={18} />
                    ) : (
                      <ChevronRight size={18} />
                    )}
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      expandedMenus[item.title] ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <div className="mt-2 flex flex-col space-y-1 text-gray-700">
                      {item.submenu.map((sub) => (
                        <Link
                          key={sub.href}
                          href={sub.href}
                          className={`px-6 py-2 rounded-md transition-all text-left hover:bg-sky-100 ${
                            isActive(sub.href)
                              ? 'bg-sky-100 text-sky-700 font-semibold'
                              : ''
                          }`}
                        >
                          {sub.title}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              ) : item.title === 'Logout' ? (
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
      <main className="flex-1 overflow-y-auto max-h-screen p-8 bg-sky-100">
        {children || (
          <div className="text-gray-400 text-lg">Main content goes here...</div>
        )}
      </main>
    </div>
  );
}
