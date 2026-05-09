'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Invoice } from '@/lib/types';
import { getInvoiceById, updateInvoice } from '@/lib/store';

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(amount);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [isPrinting, setIsPrinting] = useState(false);

  useEffect(() => {
    const id = params.id as string;
    const inv = getInvoiceById(id);
    if (inv) setInvoice(inv);
  }, [params.id]);

  function handleMarkPaid() {
    if (!invoice) return;
    const updated: Invoice = { ...invoice, status: 'paid', paymentDate };
    updateInvoice(updated);
    setInvoice(updated);
    setShowPaymentModal(false);
  }

  function handlePrint() {
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 100);
  }

  if (!invoice) {
    return (
      <div className="p-8 flex items-center justify-center min-h-64">
        <div className="text-center">
          <p className="text-gray-500 text-lg">請求書が見つかりません</p>
          <Link href="/invoices" className="text-blue-600 hover:text-blue-800 mt-2 inline-block">
            請求書一覧に戻る
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Screen Controls - hidden when printing */}
      <div className="p-8 print:hidden">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="text-gray-500 hover:text-gray-700 flex items-center gap-1 text-sm"
            >
              ← 戻る
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">請求書 / 領収書</h1>
              <p className="text-gray-500 text-sm">{invoice.id.toUpperCase()}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {invoice.status === 'unpaid' && (
              <button
                onClick={() => setShowPaymentModal(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors"
              >
                支払い記録
              </button>
            )}
            <button
              onClick={handlePrint}
              disabled={isPrinting}
              className="bg-gray-700 hover:bg-gray-800 text-white px-5 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              🖨️ 印刷 / PDF
            </button>
          </div>
        </div>

        {/* Status Banner */}
        {invoice.status === 'unpaid' && (
          <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-4 mb-6 flex items-center gap-3">
            <span className="text-yellow-600 text-xl">⚠️</span>
            <div>
              <p className="text-yellow-800 font-semibold">未払い</p>
              <p className="text-yellow-600 text-sm">この請求書はまだ支払われていません</p>
            </div>
          </div>
        )}
        {invoice.status === 'paid' && (
          <div className="bg-green-50 border border-green-300 rounded-xl p-4 mb-6 flex items-center gap-3">
            <span className="text-green-600 text-xl">✅</span>
            <div>
              <p className="text-green-800 font-semibold">支払済み</p>
              <p className="text-green-600 text-sm">
                支払日: {invoice.paymentDate ? formatDate(invoice.paymentDate) : '-'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Receipt / Invoice Document */}
      <div className="px-8 pb-8 print:p-0">
        <div
          id="receipt"
          className="bg-white border border-gray-200 rounded-2xl shadow-sm p-10 max-w-2xl print:shadow-none print:border-none print:rounded-none print:max-w-full print:p-8"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-1">
              {invoice.status === 'paid' ? '領収書' : '請求書'}
            </h2>
            <div className="w-16 h-1 bg-blue-600 mx-auto rounded-full"></div>
          </div>

          {/* Clinic Info */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <p className="text-sm text-gray-500 mb-1">請求書番号</p>
              <p className="font-mono font-bold text-gray-900 text-lg">{invoice.id.toUpperCase()}</p>
              <p className="text-sm text-gray-500 mt-3 mb-1">診療日</p>
              <p className="font-medium text-gray-900">{formatDate(invoice.date)}</p>
              {invoice.status === 'paid' && invoice.paymentDate && (
                <>
                  <p className="text-sm text-gray-500 mt-2 mb-1">支払日</p>
                  <p className="font-medium text-gray-900">{formatDate(invoice.paymentDate)}</p>
                </>
              )}
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 justify-end mb-2">
                <span className="text-2xl">🦷</span>
                <div>
                  <p className="font-bold text-gray-900">歯科クリニック</p>
                  <p className="text-sm text-gray-500">Dental Clinic</p>
                </div>
              </div>
              <p className="text-xs text-gray-400">〒100-0001</p>
              <p className="text-xs text-gray-400">東京都千代田区丸の内1-1-1</p>
              <p className="text-xs text-gray-400">TEL: 03-1234-5678</p>
            </div>
          </div>

          {/* Patient Info */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">患者情報</p>
            <div className="flex items-center gap-6">
              <div>
                <p className="text-sm text-gray-500">患者名</p>
                <p className="font-semibold text-gray-900 text-lg">{invoice.patientName} 様</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">患者ID</p>
                <p className="font-mono text-gray-700">{invoice.patientId.toUpperCase()}</p>
              </div>
            </div>
          </div>

          {/* Treatment Table */}
          <table className="w-full mb-6">
            <thead>
              <tr className="border-b-2 border-gray-900">
                <th className="text-left py-3 text-sm font-semibold text-gray-700">診療内容</th>
                <th className="text-center py-3 text-sm font-semibold text-gray-700">数量</th>
                <th className="text-right py-3 text-sm font-semibold text-gray-700">単価</th>
                <th className="text-right py-3 text-sm font-semibold text-gray-700">小計</th>
                <th className="text-center py-3 text-sm font-semibold text-gray-700">保険</th>
                <th className="text-right py-3 text-sm font-semibold text-gray-700">患者負担</th>
              </tr>
            </thead>
            <tbody>
              {invoice.treatments.map((t, index) => (
                <tr key={index} className="border-b border-gray-100">
                  <td className="py-3 text-sm text-gray-900">{t.treatmentName}</td>
                  <td className="py-3 text-sm text-gray-600 text-center">{t.quantity}</td>
                  <td className="py-3 text-sm text-gray-600 text-right">{formatCurrency(t.price)}</td>
                  <td className="py-3 text-sm text-gray-700 text-right">{formatCurrency(t.subtotal)}</td>
                  <td className="py-3 text-center">
                    {t.insuranceCoverage > 0 ? (
                      <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                        {Math.round(t.insuranceCoverage * 100)}%
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">自費</span>
                    )}
                  </td>
                  <td className="py-3 text-sm font-medium text-gray-900 text-right">
                    {formatCurrency(t.patientBurden)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="border-t-2 border-gray-900 pt-4">
            <div className="flex justify-end">
              <div className="w-64 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">診療費合計</span>
                  <span className="text-gray-900">{formatCurrency(invoice.totalAmount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-green-600">保険給付額</span>
                  <span className="text-green-700">-{formatCurrency(invoice.insuranceCoverage)}</span>
                </div>
                <div className="border-t border-gray-300 pt-2 flex justify-between">
                  <span className="font-bold text-gray-900">患者負担額</span>
                  <span className="font-bold text-xl text-gray-900">{formatCurrency(invoice.patientBurden)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div className="mt-6 bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">備考</p>
              <p className="text-sm text-gray-700">{invoice.notes}</p>
            </div>
          )}

          {/* Paid Stamp */}
          {invoice.status === 'paid' && (
            <div className="mt-6 flex justify-end">
              <div className="border-4 border-green-500 rounded-lg px-6 py-3 rotate-[-8deg] opacity-80">
                <p className="text-green-600 font-bold text-2xl tracking-widest">領収済</p>
                <p className="text-green-500 text-xs text-center">{invoice.paymentDate ? formatDate(invoice.paymentDate) : ''}</p>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 pt-4 border-t border-gray-200 text-center">
            <p className="text-xs text-gray-400">
              ご不明な点がございましたら、窓口までお問い合わせください。
            </p>
            <p className="text-xs text-gray-400 mt-1">歯科クリニック ／ TEL: 03-1234-5678</p>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 print:hidden">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-2">支払いを記録する</h2>
            <p className="text-gray-500 text-sm mb-6">
              患者負担額: <strong className="text-gray-900">{formatCurrency(invoice.patientBurden)}</strong>
            </p>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">支払日</label>
              <input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50"
              >
                キャンセル
              </button>
              <button
                onClick={handleMarkPaid}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
              >
                支払い完了
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
