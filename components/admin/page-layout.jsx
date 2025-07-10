'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, ChevronRight } from 'lucide-react';

const menuItems = [
  {
    title: 'Dashboard',
    href: '/admin/dashboard',
  },
  {
    title: 'User Management',
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
  },
  {
    title: 'Reports',
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
  },
  {
    title: 'Logout',
    href: '/login',
    danger: true,
  },
];

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const [expandedMenus, setExpandedMenus] = useState({});

  const toggleMenu = (title) => {
    setExpandedMenus((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  const isActive = (href) => pathname === href;

  // ✅ Automatically expand relevant menu if current route matches submenu
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

  return (
    <div className="flex min-h-screen font-sans">
      {/* Sidebar */}
      <aside className="bg-sky-200 p-6 shadow-lg flex flex-col min-w-[220px] max-w-[260px]">
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
        <nav className="flex flex-col text-[16px] font-medium text-gray-800 space-y-5">
          {menuItems.map((item) =>
            item.submenu ? (
              <div key={item.title}>
                <button
                  onClick={() => toggleMenu(item.title)}
                  className="flex items-center justify-between w-full hover:text-sky-700 transition"
                >
                  <span>{item.title}</span>
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
                  <div className="mt-2 flex flex-col space-y-1 text-[15px] text-gray-700">
                    {item.submenu.map((sub) => (
                      <Link
                        key={sub.href}
                        href={sub.href}
                        className="text-left pl-4 py-2 hover:bg-sky-300/40 rounded-md transition-all"
                      >
                        {sub.title}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className={`text-left transition ${
                  item.danger
                    ? 'hover:text-red-600'
                    : 'hover:text-sky-700'
                } ${
                  isActive(item.href)
                    ? item.danger
                      ? 'text-red-600 font-semibold'
                      : 'text-sky-700 font-semibold'
                    : ''
                }`}
              >
                {item.title}
              </Link>
            )
          )}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-white p-10">
        {children || <div className="text-gray-400 text-xl">Main content goes here...</div>}
      </main>
    </div>
  );
}
