'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/', label: 'ダッシュボード' },
  { href: '/patients', label: '患者一覧' },
  { href: '/invoices', label: '請求書一覧' },
  { href: '/invoices/new', label: '請求書作成' },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="bg-blue-700 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🦷</span>
          <span className="font-bold text-xl tracking-wide">よこ歯科クリニック 会計システム</span>
        </div>
        <ul className="flex gap-2">
          {navItems.map(item => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname === item.href
                    ? 'bg-white text-blue-700'
                    : 'hover:bg-blue-600'
                }`}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
