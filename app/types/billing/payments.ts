// app/types/billing/payments.ts

export interface Bill {
    id: number;
    patient: number;
    provider: number;
    hospital: number;
    appointment?: number;
    insurance?: number;
    bill_date: string;
    total_amount: number;
    insurance_covered: number;
    patient_responsibility: number;
    status: BillStatus;
    due_date: string;
    payment_method?: PaymentMethod;
    notes?: string;
    created_at: string;
    updated_at: string;
    items: BillItem[];
  }
  
  export interface BillItem {
    id: number;
    bill: number;
    description: string;
    code: string;  // Billing code (CPT/ICD)
    quantity: number;
    unit_price: number;
    total_price: number;
    created_at: string;
  }
  
  export type BillStatus = 
    | 'PENDING'
    | 'SUBMITTED'
    | 'PARTIALLY_PAID'
    | 'PAID'
    | 'OVERDUE'
    | 'CANCELLED';
  
  export type PaymentMethod = 
    | 'CASH'
    | 'CARD'
    | 'INSURANCE'
    | 'BANK_TRANSFER';
  
  export interface Payment {
    id: number;
    bill: number;
    amount: number;
    payment_method: PaymentMethod;
    transaction_date: string;
    status: PaymentStatus;
    reference_number?: string;
    notes?: string;
  }
  
  export type PaymentStatus = 
    | 'PENDING'
    | 'COMPLETED'
    | 'FAILED'
    | 'REFUNDED';