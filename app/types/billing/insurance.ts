// app/types/billing/insurance.ts

export interface Insurance {
    id: number;
    company_name: string;
    policy_number: string;
    coverage_details: CoverageDetails;
    contact_number: string;
    email: string;
    created_at: string;
    updated_at: string;
  }
  
  export interface CoverageDetails {
    plan_type: string;
    coverage_start: string;
    coverage_end: string;
    deductible: number;
    co_pay: number;
    co_insurance: number;
    max_out_of_pocket: number;
    covered_services: CoveredService[];
  }
  
  export interface CoveredService {
    service_type: string;
    coverage_percentage: number;
    limitations?: string;
    prior_authorization_required: boolean;
  }
  
  export interface InsuranceClaim {
    id: number;
    bill: number;
    insurance: number;
    claim_number: string;
    submission_date: string;
    status: ClaimStatus;
    amount_claimed: number;
    amount_approved?: number;
    denial_reason?: string;
    notes?: string;
  }
  
  export type ClaimStatus = 
    | 'SUBMITTED'
    | 'IN_REVIEW'
    | 'APPROVED'
    | 'PARTIALLY_APPROVED'
    | 'DENIED'
    | 'APPEALED';