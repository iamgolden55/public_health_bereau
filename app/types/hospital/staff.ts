// app/types/hospital/staff.ts

import { User } from '../core/user';

export interface HospitalStaff {
  id: number;
  hospital: number;
  user: User;
  role: StaffRole;
  department: string;
  is_active: boolean;
  join_date: string;
  access_level: number; // 1-5 access levels
  created_by: number;
}

export type StaffRole = 'ADMIN' | 'MANAGER' | 'STAFF' | 'RECEPTIONIST';

export interface HospitalRegistration {
  id: number;
  name: string;
  registration_number: string;
  facility_type: string;
  address: string;
  city: string;
  country: string;
  contact_number: string;
  email: string;
  admin_first_name: string;
  admin_last_name: string;
  admin_email: string;
  admin_phone: string;
  registration_status: RegistrationStatus;
  documents?: File;
  verification_notes?: string;
  created_at: string;
}

export type RegistrationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';