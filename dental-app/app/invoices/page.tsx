'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getInvoices, getPatients } from '@/lib/firestore';
import type { Invoice, Patient } from '@/lib/types';
import StatusBadge from '@/components/StatusBadge';

function formatYen(amount: number): string {
  return amount.toLocaleString('ja-JP') + '円';
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
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
    load();
  }, []);

  const patientMap = new Map(patients.map(p => [p.id, p]));

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">請求書一覧</h1>
        <Link
          href="/invoices/new"
          className="px-4 py-2 bg-blue-700 text-white rounded-md text-sm font-medium hover:bg-blue-800"
        >
          新規請求書
        </Link>
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
        <div className="bg-white rounded-lg shadow border border-gray-100 overflow-x-auto">
          {invoices.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-400">請求書がありません</div>
          ) : (
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
                {invoices.map(inv => (
                  <tr key={inv.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-700">
                      <Link href={`/invoices/${inv.id}`} className="text-blue-700 hover:underline">
                        {inv.date}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {patientMap.get(inv.patientId)?.name ?? inv.patientId}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-700">{formatYen(inv.totalAmount)}</td>
                    <td className="px-4 py-3 text-right text-gray-700">{formatYen(inv.patientBurden)}</td>
                    <td className="px-4 py-3 text-center">
                      <Link href={`/invoices/${inv.id}`}>
                        <StatusBadge status={inv.status} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </main>
  );
}
