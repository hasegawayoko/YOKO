import { Invoice, Treatment, InvoiceTreatment, InsuranceType } from './types';
import { treatments } from './mockData';

export function formatCurrency(amount: number): string {
  return `¥${amount.toLocaleString('ja-JP')}`;
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function getTreatmentById(id: string): Treatment | undefined {
  return treatments.find(t => t.id === id);
}

export function calculateTreatmentTotal(
  items: InvoiceTreatment[],
  insuranceType: InsuranceType
): { totalAmount: number; patientBurden: number } {
  let totalAmount = 0;
  let patientBurden = 0;

  for (const item of items) {
    const treatment = getTreatmentById(item.treatmentId);
    if (!treatment) continue;
    const lineTotal = treatment.price * item.quantity;
    totalAmount += lineTotal;

    let covered = 0;
    if (insuranceType !== '自費') {
      covered = lineTotal * treatment.insuranceCoverage;
    }
    patientBurden += lineTotal - covered;
  }

  return { totalAmount: Math.round(totalAmount), patientBurden: Math.round(patientBurden) };
}

export function getInvoiceSummary(invoices: Invoice[]) {
  const today = new Date().toISOString().split('T')[0];
  const todayInvoices = invoices.filter(inv => inv.date === today);
  const todayRevenue = todayInvoices
    .filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.patientBurden, 0);
  const pendingPayments = invoices.filter(inv => inv.status === 'unpaid').length;
  const pendingAmount = invoices
    .filter(inv => inv.status === 'unpaid')
    .reduce((sum, inv) => sum + inv.patientBurden, 0);

  return { todayRevenue, pendingPayments, pendingAmount };
}

export function generateInvoiceId(): string {
  return `inv${Date.now()}`;
}

export function generatePatientId(): string {
  return `p${Date.now()}`;
}
