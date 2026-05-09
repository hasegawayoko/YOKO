import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  setDoc,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Patient, Invoice, Treatment } from './types';
import { patients as mockPatients, treatments as mockTreatments, invoices as mockInvoices } from './mockData';

// Patients
export async function getPatients(): Promise<Patient[]> {
  const q = query(collection(db, 'patients'), orderBy('name'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Patient));
}

export async function getPatientById(id: string): Promise<Patient | undefined> {
  const snap = await getDoc(doc(db, 'patients', id));
  if (!snap.exists()) return undefined;
  return { id: snap.id, ...snap.data() } as Patient;
}

export async function addPatient(patient: Omit<Patient, 'id'>): Promise<string> {
  const ref = await addDoc(collection(db, 'patients'), patient);
  return ref.id;
}

// Invoices
export async function getInvoices(): Promise<Invoice[]> {
  const q = query(collection(db, 'invoices'), orderBy('date', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Invoice));
}

export async function getInvoiceById(id: string): Promise<Invoice | undefined> {
  const snap = await getDoc(doc(db, 'invoices', id));
  if (!snap.exists()) return undefined;
  return { id: snap.id, ...snap.data() } as Invoice;
}

export async function addInvoice(invoice: Omit<Invoice, 'id'>): Promise<string> {
  const ref = await addDoc(collection(db, 'invoices'), invoice);
  return ref.id;
}

export async function updateInvoice(id: string, data: Partial<Invoice>): Promise<void> {
  await updateDoc(doc(db, 'invoices', id), data as Record<string, unknown>);
}

export async function markInvoicePaid(id: string, paymentDate: string): Promise<void> {
  await updateDoc(doc(db, 'invoices', id), { status: 'paid', paymentDate });
}

// Treatments
export async function getTreatments(): Promise<Treatment[]> {
  const q = query(collection(db, 'treatments'), orderBy('name'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Treatment));
}

// Seed initial data
export async function seedInitialData(): Promise<void> {
  const patientsSnap = await getDocs(collection(db, 'patients'));
  if (!patientsSnap.empty) return;

  for (const patient of mockPatients) {
    const { id, ...data } = patient;
    await setDoc(doc(db, 'patients', id), data);
  }

  for (const treatment of mockTreatments) {
    const { id, ...data } = treatment;
    await setDoc(doc(db, 'treatments', id), data);
  }

  for (const invoice of mockInvoices) {
    const { id, ...data } = invoice;
    await setDoc(doc(db, 'invoices', id), data);
  }
}
