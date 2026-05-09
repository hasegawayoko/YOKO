'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getInvoices, getPatients, seedInitialData } from '@/lib/firestore';
import type { Invoice, Patient } from '@/lib/types';
import StatusBadge from '@/components/StatusBadge';

function formatYen(amount: number): string {
  return amount.toLocaleString('ja-JP') + '円';
}

export default function DashboardPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);

  const loadData = async () => {
    try {
      const [inv, pat] = await Promise.all([getInvoices(), getPatients()]);
      setInvoices(inv);
      setPatients(pat);
    } catch (e) {
      setError('データの読み込みに失敗しました: ' + (e instanceof Error ? e.message : String(e)));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        await seedInitialData();
      } catch {
        // Seed may fail if Firebase is not configured; continue anyway
      }
      await loadData();
    };
    init();
  }, []);

  const handleSeed = async () => {
    setSeeding(true);
    try {
      await seedInitialData();
      await loadData();
    } catch (e) {
      setError('初期データの読み込みに失敗しました: ' + (e instanceof Error ? e.message : String(e)));
    } finally {
      setSeeding(false);
    }
  };

  const today = new Date().toISOString().slice(0, 10);
  const todayInvoices = invoices.filter(inv => inv.date === today && inv.status === 'paid');
  const todayRevenue = todayInvoices.reduce((sum, inv) => sum + inv.patientBurden, 0);
  const unpaidInvoices = invoices.filter(inv => inv.status === 'unpaid');
  const unpaidTotal = unpaidInvoices.reduce((sum, inv) => sum + inv.patientBurden, 0);
  const recentInvoices = invoices.slice(0, 5);

  const patientMap = new Map(patients.map(p => [p.id, p]));

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">ダッシュボード</h1>
        <button
          onClick={handleSeed}
          disabled={seeding}
          className="px-4 py-2 bg-blue-700 text-white rounded-md text-sm font-medium hover:bg-blue-800 disabled:opacity-50"
        >
          {seeding ? '読み込み中...' : 'Firebase初期データを読み込む'}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md border border-red-200">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <span className="text-gray-500">読み込み中...</span>
        </div>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow p-5 border border-gray-100">
              <p className="text-sm text-gray-500 mb-1">本日の収入</p>
              <p className="text-2xl font-bold text-blue-700">{formatYen(todayRevenue)}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-5 border border-gray-100">
              <p className="text-sm text-gray-500 mb-1">未払い件数</p>
              <p className="text-2xl font-bold text-red-600">{unpaidInvoices.length}件</p>
            </div>
            <div className="bg-white rounded-lg shadow p-5 border border-gray-100">
              <p className="text-sm text-gray-500 mb-1">未払い合計</p>
              <p className="text-2xl font-bold text-red-600">{formatYen(unpaidTotal)}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-5 border border-gray-100">
              <p className="text-sm text-gray-500 mb-1">患者数</p>
              <p className="text-2xl font-bold text-gray-800">{patients.length}名</p>
            </div>
          </div>

          {/* Recent invoices */}
          <div className="bg-white rounded-lg shadow border border-gray-100">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-700">最近の請求書</h2>
              <Link href="/invoices" className="text-sm text-blue-700 hover:underline">
                すべて表示
              </Link>
            </div>
            {recentInvoices.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-400">請求書がありません</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-gray-600 font-medium">日付</th>
                      <th className="px-4 py-3 text-left text-gray-600 font-medium">患者名</th>
                      <th className="px-4 py-3 text-right text-gray-600 font-medium">合計金額</th>
                      <th className="px-4 py-3 text-right text-gray-600 font-medium">患者負担額</th>
                      <th className="px-4 py-3 text-center text-gray-600 font-medium">状態</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {recentInvoices.map(inv => (
                      <tr key={inv.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-700">{inv.date}</td>
                        <td className="px-4 py-3 text-gray-700">
                          <Link href={`/invoices/${inv.id}`} className="text-blue-700 hover:underline">
                            {patientMap.get(inv.patientId)?.name ?? inv.patientId}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-right text-gray-700">{formatYen(inv.totalAmount)}</td>
                        <td className="px-4 py-3 text-right text-gray-700">{formatYen(inv.patientBurden)}</td>
                        <td className="px-4 py-3 text-center">
                          <StatusBadge status={inv.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </main>
  );
}
