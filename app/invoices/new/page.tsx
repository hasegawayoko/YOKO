'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Patient, Treatment, Invoice, InvoiceTreatment } from '@/lib/types';
import { getPatients, getTreatments, addInvoice, generateInvoiceId } from '@/lib/store';

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(amount);
}

interface TreatmentRow {
  treatmentId: string;
  quantity: number;
}

export default function NewInvoicePage() {
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [rows, setRows] = useState<TreatmentRow[]>([{ treatmentId: '', quantity: 1 }]);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setPatients(getPatients());
    setTreatments(getTreatments());
  }, []);

  const selectedPatient = patients.find((p) => p.id === selectedPatientId);

  function addRow() {
    setRows([...rows, { treatmentId: '', quantity: 1 }]);
  }

  function removeRow(index: number) {
    setRows(rows.filter((_, i) => i !== index));
  }

  function updateRow(index: number, field: keyof TreatmentRow, value: string | number) {
    setRows(rows.map((r, i) => (i === index ? { ...r, [field]: value } : r)));
  }

  const invoiceTreatments: InvoiceTreatment[] = rows
    .filter((r) => r.treatmentId)
    .map((r) => {
      const t = treatments.find((t) => t.id === r.treatmentId)!;
      if (!t) return null;
      const subtotal = t.price * r.quantity;
      const coverageAmount = Math.floor(subtotal * t.insuranceCoverage);
      const patientBurden = subtotal - coverageAmount;
      return {
        treatmentId: t.id,
        treatmentName: t.name,
        price: t.price,
        insuranceCoverage: t.insuranceCoverage,
        quantity: r.quantity,
        subtotal,
        patientBurden,
      };
    })
    .filter((t): t is InvoiceTreatment => t !== null);

  const totalAmount = invoiceTreatments.reduce((sum, t) => sum + t.subtotal, 0);
  const totalPatientBurden = invoiceTreatments.reduce((sum, t) => sum + t.patientBurden, 0);
  const totalInsuranceCoverage = totalAmount - totalPatientBurden;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    if (!selectedPatientId || invoiceTreatments.length === 0) return;

    const invoice: Invoice = {
      id: generateInvoiceId(),
      patientId: selectedPatientId,
      patientName: selectedPatient!.name,
      date,
      treatments: invoiceTreatments,
      totalAmount,
      patientBurden: totalPatientBurden,
      insuranceCoverage: totalInsuranceCoverage,
      status: 'unpaid',
      notes: notes || undefined,
    };

    addInvoice(invoice);
    router.push(`/invoices/${invoice.id}`);
  }

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">請求書作成</h1>
        <p className="text-gray-500 mt-1">新しい診療請求書を作成します</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Patient & Date */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">基本情報</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                患者 <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  submitted && !selectedPatientId ? 'border-red-400' : 'border-gray-300'
                }`}
              >
                <option value="">患者を選択してください</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}（{p.insuranceType}）
                  </option>
                ))}
              </select>
              {submitted && !selectedPatientId && (
                <p className="text-red-500 text-xs mt-1">患者を選択してください</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                診療日 <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {selectedPatient && (
            <div className="mt-4 bg-blue-50 rounded-lg p-4 flex items-center gap-4">
              <span className="text-blue-600 text-xl">👤</span>
              <div>
                <p className="text-sm font-semibold text-blue-900">{selectedPatient.name}</p>
                <p className="text-xs text-blue-600">
                  生年月日: {selectedPatient.birthdate} ／ 電話: {selectedPatient.phone} ／ 保険: {selectedPatient.insuranceType}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Treatments */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">診療内容</h2>
          <div className="space-y-3 mb-4">
            {rows.map((row, index) => {
              const selectedTreatment = treatments.find((t) => t.id === row.treatmentId);
              const subtotal = selectedTreatment ? selectedTreatment.price * row.quantity : 0;
              const patientBurden = selectedTreatment
                ? subtotal - Math.floor(subtotal * selectedTreatment.insuranceCoverage)
                : 0;
              return (
                <div key={index} className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-5">
                    <select
                      value={row.treatmentId}
                      onChange={(e) => updateRow(index, 'treatmentId', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">処置を選択...</option>
                      {treatments.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      min={1}
                      value={row.quantity}
                      onChange={(e) => updateRow(index, 'quantity', parseInt(e.target.value) || 1)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                    />
                  </div>
                  <div className="col-span-2 text-right">
                    <p className="text-sm text-gray-500">{selectedTreatment ? formatCurrency(subtotal) : '-'}</p>
                    {selectedTreatment && selectedTreatment.insuranceCoverage > 0 && (
                      <p className="text-xs text-green-600">保険{Math.round(selectedTreatment.insuranceCoverage * 100)}%</p>
                    )}
                  </div>
                  <div className="col-span-2 text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {selectedTreatment ? formatCurrency(patientBurden) : '-'}
                    </p>
                    <p className="text-xs text-gray-400">患者負担</p>
                  </div>
                  <div className="col-span-1 text-center">
                    {rows.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeRow(index)}
                        className="text-red-400 hover:text-red-600 text-lg font-bold"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center gap-2 mb-2">
            <div className="flex-1 grid grid-cols-12 gap-2 text-xs text-gray-400 px-1">
              <div className="col-span-5">処置名</div>
              <div className="col-span-2 text-center">数量</div>
              <div className="col-span-2 text-right">小計</div>
              <div className="col-span-2 text-right">患者負担</div>
              <div className="col-span-1"></div>
            </div>
          </div>

          {submitted && invoiceTreatments.length === 0 && (
            <p className="text-red-500 text-xs mb-3">少なくとも1つの処置を選択してください</p>
          )}

          <button
            type="button"
            onClick={addRow}
            className="w-full border-2 border-dashed border-gray-300 text-gray-400 hover:border-blue-400 hover:text-blue-500 rounded-lg py-2.5 text-sm font-medium transition-colors"
          >
            ＋ 処置を追加
          </button>
        </div>

        {/* Notes */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">備考</h2>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="特記事項があれば入力してください..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Summary */}
        {invoiceTreatments.length > 0 && (
          <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
            <h2 className="text-lg font-semibold text-blue-900 mb-4">費用合計</h2>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">診療費合計</span>
                <span className="font-medium">{formatCurrency(totalAmount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-green-600">保険給付額</span>
                <span className="text-green-700 font-medium">-{formatCurrency(totalInsuranceCoverage)}</span>
              </div>
              <div className="border-t border-blue-200 pt-2 mt-2 flex justify-between">
                <span className="text-lg font-bold text-blue-900">患者負担額</span>
                <span className="text-2xl font-bold text-blue-900">{formatCurrency(totalPatientBurden)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 border border-gray-300 text-gray-700 px-6 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors"
          >
            キャンセル
          </button>
          <button
            type="submit"
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
          >
            請求書を作成する
          </button>
        </div>
      </form>
    </div>
  );
}
