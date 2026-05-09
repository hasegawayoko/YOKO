'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/', label: 'ダッシュボード', icon: '🏠' },
  { href: '/patients', label: '患者一覧', icon: '👥' },
  { href: '/invoices', label: '請求書一覧', icon: '📄' },
  { href: '/invoices/new', label: '請求書作成', icon: '➕' },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="bg-blue-900 text-white w-64 min-h-screen flex flex-col shadow-lg">
      <div className="p-6 border-b border-blue-700">
        <h1 className="text-xl font-bold text-white leading-tight">
          🦷 歯科クリニック
        </h1>
        <p className="text-blue-300 text-sm mt-1">会計・請求管理システム</p>
      </div>
      <ul className="flex-1 py-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center gap-3 px-6 py-3 transition-colors ${
                  isActive
                    ? 'bg-blue-700 text-white font-semibold border-l-4 border-blue-300'
                    : 'text-blue-100 hover:bg-blue-800 hover:text-white'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="p-4 border-t border-blue-700 text-blue-400 text-xs">
        <p>© 2026 歯科クリニック管理</p>
      </div>
    </nav>
  );
}
