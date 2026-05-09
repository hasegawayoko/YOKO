'use client';

import { useEffect, useState } from 'react';
import { getPatients, addPatient } from '@/lib/firestore';
import type { Patient, InsuranceType } from '@/lib/types';
import InsuranceBadge from '@/components/InsuranceBadge';

const INSURANCE_OPTIONS: InsuranceType[] = ['社保', '国保', '自費'];

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: '',
    birthdate: '',
    phone: '',
    insuranceType: '社保' as InsuranceType,
  });

  const loadPatients = async () => {
    try {
      const data = await getPatients();
      setPatients(data);
    } catch (e) {
      setError('患者データの読み込みに失敗しました: ' + (e instanceof Error ? e.message : String(e)));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatients();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.birthdate || !form.phone) return;
    setSubmitting(true);
    try {
      await addPatient(form);
      setForm({ name: '', birthdate: '', phone: '', insuranceType: '社保' });
      setShowForm(false);
      await loadPatients();
    } catch (e) {
      setError('患者の追加に失敗しました: ' + (e instanceof Error ? e.message : String(e)));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">患者一覧</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-700 text-white rounded-md text-sm font-medium hover:bg-blue-800"
        >
          {showForm ? 'キャンセル' : '患者を追加'}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md border border-red-200">
          {error}
        </div>
      )}

      {showForm && (
        <div className="mb-6 bg-white rounded-lg shadow border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">新規患者登録</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">氏名 <span className="text-red-500">*</span></label>
              <input
                type="text"
                required
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="例: 山田 太郎"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">生年月日 <span className="text-red-500">*</span></label>
              <input
                type="date"
                required
                value={form.birthdate}
                onChange={e => setForm({ ...form, birthdate: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">電話番号 <span className="text-red-500">*</span></label>
              <input
                type="tel"
                required
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="例: 090-1234-5678"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">保険種別</label>
              <select
                value={form.insuranceType}
                onChange={e => setForm({ ...form, insuranceType: e.target.value as InsuranceType })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {INSURANCE_OPTIONS.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                キャンセル
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-blue-700 text-white rounded-md text-sm font-medium hover:bg-blue-800 disabled:opacity-50"
              >
                {submitting ? '登録中...' : '登録する'}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <span className="text-gray-500">読み込み中...</span>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow border border-gray-100 overflow-x-auto">
          {patients.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-400">患者データがありません</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-gray-600 font-medium">氏名</th>
                  <th className="px-4 py-3 text-left text-gray-600 font-medium">生年月日</th>
                  <th className="px-4 py-3 text-left text-gray-600 font-medium">電話番号</th>
                  <th className="px-4 py-3 text-left text-gray-600 font-medium">保険種別</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {patients.map(patient => (
                  <tr key={patient.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-800 font-medium">{patient.name}</td>
                    <td className="px-4 py-3 text-gray-600">{patient.birthdate}</td>
                    <td className="px-4 py-3 text-gray-600">{patient.phone}</td>
                    <td className="px-4 py-3">
                      <InsuranceBadge type={patient.insuranceType} />
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
