'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getPatients, getTreatments, addInvoice } from '@/lib/firestore';
import type { Patient, Treatment, InsuranceType } from '@/lib/types';

interface TreatmentLine {
  treatmentId: string;
  quantity: number;
}

function calcTotals(
  lines: TreatmentLine[],
  treatmentMap: Map<string, Treatment>,
  insuranceType: InsuranceType
): { totalAmount: number; patientBurden: number } {
  let totalAmount = 0;
  let patientBurden = 0;
  for (const line of lines) {
    const t = treatmentMap.get(line.treatmentId);
    if (!t || line.quantity <= 0) continue;
    const lineTotal = t.price * line.quantity;
    totalAmount += lineTotal;
    let covered = 0;
    if (insuranceType !== '自費') {
      covered = lineTotal * t.insuranceCoverage;
    }
    patientBurden += lineTotal - covered;
  }
  return { totalAmount: Math.round(totalAmount), patientBurden: Math.round(patientBurden) };
}

export default function NewInvoicePage() {
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [patientId, setPatientId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [lines, setLines] = useState<TreatmentLine[]>([{ treatmentId: '', quantity: 1 }]);

  useEffect(() => {
    const load = async () => {
      try {
        const [pat, trmt] = await Promise.all([getPatients(), getTreatments()]);
        setPatients(pat);
        setTreatments(trmt);
        if (pat.length > 0) setPatientId(pat[0].id);
        if (trmt.length > 0) setLines([{ treatmentId: trmt[0].id, quantity: 1 }]);
      } catch (e) {
        setError('データの読み込みに失敗しました: ' + (e instanceof Error ? e.message : String(e)));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const selectedPatient = patients.find(p => p.id === patientId);
  const treatmentMap = new Map(treatments.map(t => [t.id, t]));
  const { totalAmount, patientBurden } = calcTotals(
    lines,
    treatmentMap,
    selectedPatient?.insuranceType ?? '自費'
  );

  const addLine = () => {
    setLines([...lines, { treatmentId: treatments[0]?.id ?? '', quantity: 1 }]);
  };

  const removeLine = (idx: number) => {
    setLines(lines.filter((_, i) => i !== idx));
  };

  const updateLine = (idx: number, field: keyof TreatmentLine, value: string | number) => {
    setLines(lines.map((line, i) => i === idx ? { ...line, [field]: value } : line));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId || !date || lines.length === 0) return;
    const validLines = lines.filter(l => l.treatmentId && l.quantity > 0);
    if (validLines.length === 0) {
      setError('治療内容を1つ以上追加してください');
      return;
    }
    setSubmitting(true);
    try {
      await addInvoice({
        patientId,
        date,
        treatments: validLines,
        totalAmount,
        patientBurden,
        status: 'unpaid',
      });
      router.push('/invoices');
    } catch (e) {
      setError('請求書の作成に失敗しました: ' + (e instanceof Error ? e.message : String(e)));
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-16">
          <span className="text-gray-500">読み込み中...</span>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">新規請求書作成</h1>

      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md border border-red-200">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow border border-gray-100 p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">患者選択 <span className="text-red-500">*</span></label>
            <select
              required
              value={patientId}
              onChange={e => setPatientId(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {patients.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">診療日 <span className="text-red-500">*</span></label>
            <input
              type="date"
              required
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">治療内容</label>
            <button
              type="button"
              onClick={addLine}
              className="text-sm text-blue-700 hover:underline"
            >
              + 治療を追加
            </button>
          </div>
          <div className="space-y-2">
            {lines.map((line, idx) => (
              <div key={idx} className="flex gap-2 items-center">
                <select
                  value={line.treatmentId}
                  onChange={e => updateLine(idx, 'treatmentId', e.target.value)}
                  className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {treatments.map(t => (
                    <option key={t.id} value={t.id}>{t.name} (¥{t.price.toLocaleString('ja-JP')})</option>
                  ))}
                </select>
                <input
                  type="number"
                  min={1}
                  value={line.quantity}
                  onChange={e => updateLine(idx, 'quantity', parseInt(e.target.value) || 1)}
                  className="w-16 border border-gray-300 rounded-md px-2 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-500">回</span>
                {lines.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeLine(idx)}
                    className="text-red-500 hover:text-red-700 text-sm px-1"
                  >
                    削除
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-gray-100 pt-4 space-y-1">
          {selectedPatient && (
            <p className="text-sm text-gray-500">保険種別: {selectedPatient.insuranceType}</p>
          )}
          <div className="flex justify-between text-sm text-gray-700">
            <span>合計金額</span>
            <span className="font-medium">{totalAmount.toLocaleString('ja-JP')}円</span>
          </div>
          <div className="flex justify-between text-base font-bold text-gray-800">
            <span>患者負担額</span>
            <span className="text-blue-700">{patientBurden.toLocaleString('ja-JP')}円</span>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => router.push('/invoices')}
            className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            キャンセル
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2 bg-blue-700 text-white rounded-md text-sm font-medium hover:bg-blue-800 disabled:opacity-50"
          >
            {submitting ? '作成中...' : '請求書を作成'}
          </button>
        </div>
      </form>
    </main>
  );
}
