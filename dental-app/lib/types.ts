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
  price: number; // total price in yen
  insuranceCoverage: number; // 0-1 ratio (e.g. 0.7 = 70% covered by insurance)
}

export interface InvoiceTreatment {
  treatmentId: string;
  quantity: number;
}

export interface Invoice {
  id: string;
  patientId: string;
  date: string;
  treatments: InvoiceTreatment[];
  totalAmount: number;
  patientBurden: number;
  status: InvoiceStatus;
  paymentDate?: string;
  notes?: string;
}
