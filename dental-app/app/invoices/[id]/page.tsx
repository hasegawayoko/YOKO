'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getInvoiceById, getPatientById, getTreatments, markInvoicePaid } from '@/lib/firestore';
import type { Invoice, Patient, Treatment } from '@/lib/types';
import StatusBadge from '@/components/StatusBadge';

function formatYen(amount: number): string {
  return amount.toLocaleString('ja-JP') + '円';
}

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params.id === 'string' ? params.id : Array.isArray(params.id) ? params.id[0] : '';

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);

  const load = async () => {
    try {
      const [inv, trmt] = await Promise.all([getInvoiceById(id), getTreatments()]);
      if (!inv) {
        setError('請求書が見つかりません');
        setLoading(false);
        return;
      }
      setInvoice(inv);
      setTreatments(trmt);
      const pat = await getPatientById(inv.patientId);
      setPatient(pat ?? null);
    } catch (e) {
      setError('データの読み込みに失敗しました: ' + (e instanceof Error ? e.message : String(e)));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) load();
  }, [id]);

  const handleMarkPaid = async () => {
    if (!invoice) return;
    setPaying(true);
    try {
      const today = new Date().toISOString().slice(0, 10);
      await markInvoicePaid(invoice.id, today);
      await load();
    } catch (e) {
      setError('支払処理に失敗しました: ' + (e instanceof Error ? e.message : String(e)));
    } finally {
      setPaying(false);
    }
  };

  const treatmentMap = new Map(treatments.map(t => [t.id, t]));

  if (loading) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-16">
          <span className="text-gray-500">読み込み中...</span>
        </div>
      </main>
    );
  }

  if (error || !invoice) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="p-4 bg-red-50 text-red-700 rounded-md border border-red-200">
          {error ?? '請求書が見つかりません'}
        </div>
        <Link href="/invoices" className="mt-4 inline-block text-sm text-blue-700 hover:underline">
          ← 請求書一覧に戻る
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <Link href="/invoices" className="text-sm text-blue-700 hover:underline">
          ← 請求書一覧に戻る
        </Link>
        <div className="flex gap-2">
          {invoice.status === 'unpaid' && (
            <button
              onClick={handleMarkPaid}
              disabled={paying}
              className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 disabled:opacity-50"
            >
              {paying ? '処理中...' : '支払済みにする'}
            </button>
          )}
          <button
            onClick={() => window.print()}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50"
          >
            印刷
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md border border-red-200">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow border border-gray-100 p-8 print:shadow-none print:border-none">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">領収書 / 請求書</h1>
          <p className="text-sm text-gray-500 mt-1">よこ歯科クリニック</p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
          <div>
            <p className="text-gray-500 mb-1">患者名</p>
            <p className="font-semibold text-gray-800">{patient?.name ?? invoice.patientId}</p>
          </div>
          <div>
            <p className="text-gray-500 mb-1">診療日</p>
            <p className="font-semibold text-gray-800">{invoice.date}</p>
          </div>
          {patient && (
            <>
              <div>
                <p className="text-gray-500 mb-1">生年月日</p>
                <p className="text-gray-700">{patient.birthdate}</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">保険種別</p>
                <p className="text-gray-700">{patient.insuranceType}</p>
              </div>
            </>
          )}
          <div>
            <p className="text-gray-500 mb-1">状態</p>
            <StatusBadge status={invoice.status} />
          </div>
          {invoice.paymentDate && (
            <div>
              <p className="text-gray-500 mb-1">支払日</p>
              <p className="text-gray-700">{invoice.paymentDate}</p>
            </div>
          )}
        </div>

        <div className="mb-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-2 border-b border-gray-200 pb-1">治療内容</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-500">
                <th className="text-left py-1 font-medium">治療名</th>
                <th className="text-center py-1 font-medium w-16">数量</th>
                <th className="text-right py-1 font-medium">単価</th>
                <th className="text-right py-1 font-medium">小計</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {invoice.treatments.map((item, idx) => {
                const t = treatmentMap.get(item.treatmentId);
                return (
                  <tr key={idx}>
                    <td className="py-2 text-gray-700">{t?.name ?? item.treatmentId}</td>
                    <td className="py-2 text-center text-gray-700">{item.quantity}</td>
                    <td className="py-2 text-right text-gray-700">{t ? formatYen(t.price) : '-'}</td>
                    <td className="py-2 text-right text-gray-700">{t ? formatYen(t.price * item.quantity) : '-'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="border-t border-gray-200 pt-4 space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>合計金額（保険点数）</span>
            <span>{formatYen(invoice.totalAmount)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold text-gray-800">
            <span>患者負担額</span>
            <span className="text-blue-700">{formatYen(invoice.patientBurden)}</span>
          </div>
        </div>

        {invoice.notes && (
          <div className="mt-6 p-3 bg-gray-50 rounded text-sm text-gray-600">
            <p className="font-medium mb-1">備考</p>
            <p>{invoice.notes}</p>
          </div>
        )}
      </div>
    </main>
  );
}
