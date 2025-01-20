// types/medical/base.ts
// Base types that are used across multiple medical domains
export interface User {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    hpn: string;
    is_verified: boolean;
    has_registered_gp: boolean;
    current_gp_practice?: number;
    current_gp?: number;
  }
  
  export interface Hospital {
    id: number;
    name: string;
    registration_number: string;
    facility_type: 'GENERAL' | 'SPECIALTY' | 'CLINIC' | 'EMERGENCY';
    address: string;
    city: string;
    country: string;
    contact_number: string;
    email: string;
    is_verified: boolean;
    has_emergency: boolean;
  }