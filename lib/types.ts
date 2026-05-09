export type InsuranceType = '社保' | '国保' | '自費';
export type InvoiceStatus = 'paid' | 'unpaid';

export interface Patient {
  id: string;
  name: string;
  birthdate: string;
  phone: string;
  insuranceType: InsuranceType;
}

export interface Treatment {
  id: string;
  name: string;
  price: number; // base price in yen
  insuranceCoverage: number; // coverage rate 0-1, e.g. 0.7 means 70% covered
}

export interface InvoiceTreatment {
  treatmentId: string;
  treatmentName: string;
  price: number;
  insuranceCoverage: number;
  quantity: number;
  subtotal: number;
  patientBurden: number;
}

export interface Invoice {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  treatments: InvoiceTreatment[];
  totalAmount: number;
  patientBurden: number;
  insuranceCoverage: number;
  status: InvoiceStatus;
  paymentDate?: string;
  notes?: string;
}
