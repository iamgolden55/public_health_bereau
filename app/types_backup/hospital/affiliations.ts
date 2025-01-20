// app/types/hospital/affiliations.ts

export interface HospitalBasic {
    id: number;
    name: string;
    facility_type: HospitalFacilityType;
    registration_number: string;
    city: string;
    country: string;
    contact_number: string;
    email: string;
    is_verified: boolean;
    has_emergency: boolean;
  }
  
  export interface HospitalAffiliation {
    id: number;
    hospital: HospitalBasic;
    is_primary: boolean;
    start_date: string;
    end_date?: string;
    schedule?: HospitalSchedule; // JSON field for working hours/days
    department: string;
    status: AffiliationStatus;
  }
  
  export interface HospitalSchedule {
    working_days: string[];
    working_hours: {
      start: string;
      end: string;
    };
    break_hours?: {
      start: string;
      end: string;
    };
  }
  
  export type HospitalFacilityType = 'GENERAL' | 'SPECIALTY' | 'CLINIC' | 'EMERGENCY';
  export type AffiliationStatus = 'ACTIVE' | 'ON_LEAVE' | 'INACTIVE';