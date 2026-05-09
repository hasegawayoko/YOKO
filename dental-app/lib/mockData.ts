import { Patient, Treatment, Invoice } from './types';

export const patients: Patient[] = [
  {
    id: 'p001',
    name: '田中 花子',
    birthdate: '1985-04-12',
    phone: '090-1234-5678',
    insuranceType: '社保',
  },
  {
    id: 'p002',
    name: '山田 太郎',
    birthdate: '1972-09-23',
    phone: '080-2345-6789',
    insuranceType: '国保',
  },
  {
    id: 'p003',
    name: '鈴木 一郎',
    birthdate: '1990-01-05',
    phone: '070-3456-7890',
    insuranceType: '社保',
  },
  {
    id: 'p004',
    name: '佐藤 美咲',
    birthdate: '2001-07-30',
    phone: '090-4567-8901',
    insuranceType: '国保',
  },
  {
    id: 'p005',
    name: '高橋 健二',
    birthdate: '1965-11-18',
    phone: '080-5678-9012',
    insuranceType: '自費',
  },
  {
    id: 'p006',
    name: '伊藤 さくら',
    birthdate: '1998-03-22',
    phone: '090-6789-0123',
    insuranceType: '社保',
  },
  {
    id: 'p007',
    name: '渡辺 正樹',
    birthdate: '1955-08-14',
    phone: '070-7890-1234',
    insuranceType: '国保',
  },
];

export const treatments: Treatment[] = [
  {
    id: 't001',
    name: '初診料',
    price: 2820,
    insuranceCoverage: 0.7,
  },
  {
    id: 't002',
    name: '再診料',
    price: 730,
    insuranceCoverage: 0.7,
  },
  {
    id: 't003',
    name: '抜歯（単純）',
    price: 4680,
    insuranceCoverage: 0.7,
  },
  {
    id: 't004',
    name: '抜歯（難抜歯）',
    price: 8870,
    insuranceCoverage: 0.7,
  },
  {
    id: 't005',
    name: '充填（コンポジットレジン）',
    price: 2300,
    insuranceCoverage: 0.7,
  },
  {
    id: 't006',
    name: 'クリーニング（PMTC）',
    price: 3500,
    insuranceCoverage: 0.0,
  },
  {
    id: 't007',
    name: 'スケーリング',
    price: 1800,
    insuranceCoverage: 0.7,
  },
  {
    id: 't008',
    name: 'レントゲン（デンタル）',
    price: 1500,
    insuranceCoverage: 0.7,
  },
  {
    id: 't009',
    name: 'レントゲン（パノラマ）',
    price: 3200,
    insuranceCoverage: 0.7,
  },
  {
    id: 't010',
    name: 'クラウン（金属）',
    price: 15000,
    insuranceCoverage: 0.7,
  },
  {
    id: 't011',
    name: 'クラウン（セラミック）',
    price: 120000,
    insuranceCoverage: 0.0,
  },
  {
    id: 't012',
    name: '根管治療',
    price: 9500,
    insuranceCoverage: 0.7,
  },
];

export const invoices: Invoice[] = [
  {
    id: 'inv001',
    patientId: 'p001',
    date: '2026-05-01',
    treatments: [
      { treatmentId: 't001', quantity: 1 },
      { treatmentId: 't008', quantity: 2 },
    ],
    totalAmount: 7820,
    patientBurden: 2346,
    status: 'paid',
    paymentDate: '2026-05-01',
  },
  {
    id: 'inv002',
    patientId: 'p002',
    date: '2026-05-02',
    treatments: [
      { treatmentId: 't002', quantity: 1 },
      { treatmentId: 't005', quantity: 2 },
    ],
    totalAmount: 5330,
    patientBurden: 1599,
    status: 'paid',
    paymentDate: '2026-05-02',
  },
  {
    id: 'inv003',
    patientId: 'p003',
    date: '2026-05-05',
    treatments: [
      { treatmentId: 't003', quantity: 1 },
      { treatmentId: 't008', quantity: 1 },
    ],
    totalAmount: 6180,
    patientBurden: 1854,
    status: 'unpaid',
  },
  {
    id: 'inv004',
    patientId: 'p004',
    date: '2026-05-06',
    treatments: [
      { treatmentId: 't001', quantity: 1 },
      { treatmentId: 't009', quantity: 1 },
      { treatmentId: 't012', quantity: 1 },
    ],
    totalAmount: 15520,
    patientBurden: 4656,
    status: 'unpaid',
  },
  {
    id: 'inv005',
    patientId: 'p005',
    date: '2026-05-07',
    treatments: [
      { treatmentId: 't006', quantity: 1 },
      { treatmentId: 't011', quantity: 1 },
    ],
    totalAmount: 123500,
    patientBurden: 123500,
    status: 'unpaid',
  },
  {
    id: 'inv006',
    patientId: 'p006',
    date: '2026-05-08',
    treatments: [
      { treatmentId: 't002', quantity: 1 },
      { treatmentId: 't007', quantity: 1 },
    ],
    totalAmount: 2530,
    patientBurden: 759,
    status: 'paid',
    paymentDate: '2026-05-08',
  },
  {
    id: 'inv007',
    patientId: 'p007',
    date: '2026-05-09',
    treatments: [
      { treatmentId: 't001', quantity: 1 },
      { treatmentId: 't010', quantity: 1 },
    ],
    totalAmount: 17820,
    patientBurden: 5346,
    status: 'unpaid',
  },
];
