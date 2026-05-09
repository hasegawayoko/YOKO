'use client';

import { Invoice, Patient } from './types';
import { patients as initialPatients, invoices as initialInvoices } from './mockData';

// Simple in-memory store for client-side state
// In production, this would be replaced with a real database

let patientsData: Patient[] = [...initialPatients];
let invoicesData: Invoice[] = [...initialInvoices];

export function getPatients(): Patient[] {
  return patientsData;
}

export function getPatientById(id: string): Patient | undefined {
  return patientsData.find(p => p.id === id);
}

export function addPatient(patient: Patient): void {
  patientsData = [...patientsData, patient];
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

export function markInvoicePaid(id: string, paymentDate: string): void {
  invoicesData = invoicesData.map(inv =>
    inv.id === id ? { ...inv, status: 'paid', paymentDate } : inv
  );
}
