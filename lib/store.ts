'use client';

import { Patient, Invoice, Treatment } from './types';
import { patients as initialPatients, invoices as initialInvoices, treatments as initialTreatments } from './mockData';

// Simple in-memory store using module-level state (persists within session)
let patientsData: Patient[] = [...initialPatients];
let invoicesData: Invoice[] = [...initialInvoices];
const treatmentsData: Treatment[] = [...initialTreatments];

export function getPatients(): Patient[] {
  return patientsData;
}

export function getPatientById(id: string): Patient | undefined {
  return patientsData.find(p => p.id === id);
}

export function addPatient(patient: Patient): void {
  patientsData = [...patientsData, patient];
}

export function updatePatient(updated: Patient): void {
  patientsData = patientsData.map(p => p.id === updated.id ? updated : p);
}

export function deletePatient(id: string): void {
  patientsData = patientsData.filter(p => p.id !== id);
}

export function getTreatments(): Treatment[] {
  return treatmentsData;
}

export function getInvoices(): Invoice[] {
  return invoicesData;
}

export function getInvoiceById(id: string): Invoice | undefined {
  return invoicesData.find(inv => inv.id === id);
}

export function addInvoice(invoice: Invoice): void {
  invoicesData = [...invoicesData, invoice];
}

export function updateInvoice(updated: Invoice): void {
  invoicesData = invoicesData.map(inv => inv.id === updated.id ? updated : inv);
}

export function generateInvoiceId(): string {
  const next = invoicesData.length + 1;
  return `inv${String(next).padStart(3, '0')}`;
}

export function generatePatientId(): string {
  const next = patientsData.length + 1;
  return `p${String(next).padStart(3, '0')}`;
}
