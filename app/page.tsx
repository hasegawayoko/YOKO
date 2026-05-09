'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Invoice, Patient } from '@/lib/types';
import { getInvoices, getPatients } from '@/lib/store';

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(amount);
}

export default function Dashboard() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);

  useEffect(() => {
    setInvoices(getInvoices());
    setPatients(getPatients());
  }, []);

  const today = new Date().toISOString().split('T')[0];
  const todayInvoices = invoices.filter(inv => inv.date === today);
  const todayRevenue = todayInvoices
    .filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.patientBurden, 0);

  const unpaidInvoices = invoices.filter(inv => inv.status === 'unpaid');
  const unpaidTotal = unpaidInvoices.reduce((sum, inv) => sum + inv.patientBurden, 0);

  const thisMonthStr = new Date().toISOString().slice(0, 7);
  const thisMonthInvoices = invoices.filter(inv => inv.date.startsWith(thisMonthStr));
  const thisMonthRevenue = thisMonthInvoices
    .filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.patientBurden, 0);

  const recentInvoices = [...invoices]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">ダッシュボード</h1>
        <p className="text-gray-500 mt-1">
          {new Date().toLocaleDateString('ja-JP', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long',
          })}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-gray-500">本日の売上</p>
            <span className="text-2xl">💰</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(todayRevenue)}</p>
          <p className="text-xs text-gray-400 mt-1">本日の支払済み請求合計</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-gray-500">未払い金額</p>
            <span className="text-2xl">⚠️</span>
          </div>
          <p className="text-2xl font-bold text-yellow-600">{formatCurrency(unpaidTotal)}</p>
          <p className="text-xs text-gray-400 mt-1">{unpaidInvoices.length}件の未払い請求</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-gray-500">今月の売上</p>
            <span className="text-2xl">📊</span>
          </div>
          <p className="text-2xl font-bold text-blue-600">{formatCurrency(thisMonthRevenue)}</p>
          <p className="text-xs text-gray-400 mt-1">今月の支払済み合計</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-gray-500">患者数</p>
            <span className="text-2xl">👥</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{patients.length}</p>
          <p className="text-xs text-gray-400 mt-1">登録患者総数</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Link
          href="/invoices/new"
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl p-5 flex items-center gap-4 transition-colors shadow-sm"
        >
          <span className="text-3xl">📝</span>
          <div>
            <p className="font-semibold text-lg">請求書作成</p>
            <p className="text-blue-200 text-sm">新しい請求書を作成する</p>
          </div>
        </Link>
        <Link
          href="/patients"
          className="bg-green-600 hover:bg-green-700 text-white rounded-xl p-5 flex items-center gap-4 transition-colors shadow-sm"
        >
          <span className="text-3xl">👤</span>
          <div>
            <p className="font-semibold text-lg">患者管理</p>
            <p className="text-green-200 text-sm">患者情報を管理する</p>
          </div>
        </Link>
        <Link
          href="/invoices"
          className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl p-5 flex items-center gap-4 transition-colors shadow-sm"
        >
          <span className="text-3xl">📋</span>
          <div>
            <p className="font-semibold text-lg">請求書一覧</p>
            <p className="text-purple-200 text-sm">請求書を確認・管理する</p>
          </div>
        </Link>
      </div>

      {/* Recent Invoices */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">最近の請求書</h2>
          <Link href="/invoices" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
            すべて表示 →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">請求書番号</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">患者名</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">診療日</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">患者負担額</th>
                <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">状態</th>
                <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentInvoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-mono text-gray-600">{invoice.id.toUpperCase()}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{invoice.patientName}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{invoice.date}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 text-right">
                    {formatCurrency(invoice.patientBurden)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        invoice.status === 'paid'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {invoice.status === 'paid' ? '支払済み' : '未払い'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Link
                      href={`/invoices/${invoice.id}`}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      詳細
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Unpaid Summary */}
      {unpaidInvoices.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-yellow-800 mb-3">⚠️ 未払い請求一覧</h2>
          <div className="space-y-2">
            {unpaidInvoices.map((inv) => (
              <div
                key={inv.id}
                className="flex items-center justify-between bg-white rounded-lg p-3 border border-yellow-100"
              >
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-500">{inv.date}</span>
                  <span className="text-sm font-medium text-gray-900">{inv.patientName}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-bold text-yellow-700">{formatCurrency(inv.patientBurden)}</span>
                  <Link
                    href={`/invoices/${inv.id}`}
                    className="text-xs bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded-md transition-colors"
                  >
                    詳細
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
