'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Invoice } from '@/lib/types';
import { getInvoices } from '@/lib/store';

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(amount);
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'unpaid'>('all');
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<'date' | 'patientBurden'>('date');
  const [sortDir, setSortDir] = useState<'desc' | 'asc'>('desc');

  useEffect(() => {
    setInvoices(getInvoices());
  }, []);

  const filtered = invoices
    .filter((inv) => {
      if (statusFilter !== 'all' && inv.status !== statusFilter) return false;
      if (search && !inv.patientName.includes(search) && !inv.id.includes(search)) return false;
      return true;
    })
    .sort((a, b) => {
      let cmp = 0;
      if (sortField === 'date') {
        cmp = new Date(a.date).getTime() - new Date(b.date).getTime();
      } else {
        cmp = a.patientBurden - b.patientBurden;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });

  const totalUnpaid = invoices
    .filter((inv) => inv.status === 'unpaid')
    .reduce((sum, inv) => sum + inv.patientBurden, 0);
  const totalPaid = invoices
    .filter((inv) => inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.patientBurden, 0);

  function toggleSort(field: 'date' | 'patientBurden') {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">請求書一覧</h1>
          <p className="text-gray-500 mt-1">全 {invoices.length} 件</p>
        </div>
        <Link
          href="/invoices/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          <span>＋</span> 新規請求書作成
        </Link>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <p className="text-sm text-gray-500 mb-1">合計請求件数</p>
          <p className="text-2xl font-bold text-gray-900">{invoices.length}件</p>
        </div>
        <div className="bg-green-50 rounded-xl border border-green-200 p-5 shadow-sm">
          <p className="text-sm text-green-600 mb-1">支払済み合計</p>
          <p className="text-2xl font-bold text-green-700">{formatCurrency(totalPaid)}</p>
          <p className="text-xs text-green-500 mt-1">{invoices.filter(i => i.status === 'paid').length}件</p>
        </div>
        <div className="bg-yellow-50 rounded-xl border border-yellow-200 p-5 shadow-sm">
          <p className="text-sm text-yellow-600 mb-1">未払い合計</p>
          <p className="text-2xl font-bold text-yellow-700">{formatCurrency(totalUnpaid)}</p>
          <p className="text-xs text-yellow-500 mt-1">{invoices.filter(i => i.status === 'unpaid').length}件</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          placeholder="患者名・請求書IDで検索..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="flex gap-2">
          {(['all', 'unpaid', 'paid'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === s
                  ? s === 'all'
                    ? 'bg-gray-800 text-white'
                    : s === 'paid'
                    ? 'bg-green-600 text-white'
                    : 'bg-yellow-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {s === 'all' ? 'すべて' : s === 'paid' ? '支払済み' : '未払い'}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">請求書番号</th>
              <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">患者名</th>
              <th
                className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700 select-none"
                onClick={() => toggleSort('date')}
              >
                診療日 {sortField === 'date' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
              </th>
              <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">処置数</th>
              <th className="text-right px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">診療費合計</th>
              <th
                className="text-right px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700 select-none"
                onClick={() => toggleSort('patientBurden')}
              >
                患者負担額 {sortField === 'patientBurden' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
              </th>
              <th className="text-center px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">状態</th>
              <th className="text-center px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((invoice) => (
              <tr key={invoice.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-sm font-mono text-gray-600">{invoice.id.toUpperCase()}</td>
                <td className="px-6 py-4 text-sm font-semibold text-gray-900">{invoice.patientName}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{invoice.date}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{invoice.treatments.length}件</td>
                <td className="px-6 py-4 text-sm text-gray-700 text-right">{formatCurrency(invoice.totalAmount)}</td>
                <td className="px-6 py-4 text-sm font-bold text-gray-900 text-right">{formatCurrency(invoice.patientBurden)}</td>
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
                    詳細 / 領収書
                  </Link>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-gray-400 text-sm">
                  該当する請求書が見つかりません
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
