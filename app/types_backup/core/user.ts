// app/types/core/user.ts

import { MedicalRecord } from '../medical/records';
import { Appointment } from '../medical/appointments';
import { Bill } from '../billing/payments';
import { TelemedicineSession } from '../communication/messages';
import { HospitalBasic, HospitalAffiliation } from '../hospital/affiliations';

export type BloodType = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  hpn: string | null;
  date_of_birth: string | null;
  country: string | null;
  city: string | null;
  is_verified: boolean;
  blood_type: BloodType | null;
  allergies: string | null;
  chronic_conditions: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  is_high_risk: boolean;
  last_visit_date: string | null;
  
  // Basic data relationships
  medical_records?: MedicalRecord[];
  appointments?: Appointment[];
  bills?: Bill[];
  unread_messages?: number;
  upcoming_telemedicine?: TelemedicineSession[];
  
  // Professional status and details
  has_professional_access: boolean;
  professional_data?: {
    department: string;
    hospital?: {
      id: number;
      name: string;
      facility_type: string;
    };
    is_verified: boolean;
    license_number: string;
    professional_type: string;
    specialization: string;
  };
  last_active_view?: 'patient' | 'professional';
}

// Keep this separate for specific professional operations
export enum ProfessionalType {
  DOCTOR = 'DOCTOR',
  NURSE = 'NURSE',
  SPECIALIST = 'SPECIALIST',
  EMERGENCY = 'EMERGENCY'
}

export interface HospitalAffiliation {
  hospital_id: number;
  hospital_name: string;
  is_primary: boolean;
  department: string;
  start_date: string;
  end_date?: string;
  status: 'ACTIVE' | 'ON_LEAVE' | 'INACTIVE';
}