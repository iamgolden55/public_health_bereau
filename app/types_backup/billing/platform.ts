// app/types/billing/platform.ts

export interface PlatformRevenue {
    id: number;
    hospital: number;
    consultation: number;
    bill: number;
    amount: number;
    percentage_cut: number;
    platform_earning: number;
    status: RevenueStatus;
    transaction_date: string;
    payout_date?: string;
  }
  
  export interface Subscription {
    id: number;
    name: string;
    price: number;
    duration_days: number;
    features: string[];
    max_users: number;
    max_storage_gb: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
  }
  
  export interface HospitalSubscription {
    id: number;
    hospital: number;
    subscription: number;
    start_date: string;
    end_date: string;
    status: SubscriptionStatus;
    auto_renew: boolean;
    payment_method: string;
    last_payment_date?: string;
    next_payment_date?: string;
  }
  
  export type RevenueStatus = 
    | 'PENDING'
    | 'PROCESSED'
    | 'PAID'
    | 'FAILED';
  
  export type SubscriptionStatus = 
    | 'ACTIVE'
    | 'EXPIRED'
    | 'CANCELLED'
    | 'PENDING';