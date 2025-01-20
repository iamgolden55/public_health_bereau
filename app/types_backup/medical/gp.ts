// types/medical/gp.ts
// GP-specific types
import { User, Hospital } from './base';

export interface GPPractice {
  id: number;
  name: string;
  registration_number: string;
  address: string;
  city: string;
  postcode: string;
  contact_number: string;
  email: string;
  capacity: number;
  is_accepting_patients: boolean;
  opening_hours: {
    [key: string]: {
      open: string;
      close: string;
    };
  };
}

export interface GeneralPractitioner {
  id: number;
  user: number;
  practice: number;
  license_number: string;
  specializations: string[];
  availability_schedule: {
    [key: string]: string[];
  };
  max_daily_appointments: number;
  is_accepting_appointments: boolean;
  qualification: string;
  years_of_experience: number;
  biography?: string;
}

export interface GPRegistration {
  id: number;
  patient: number;
  practice: number;
  gp?: number;
  registration_date: string;
  status: 'ACTIVE' | 'PENDING' | 'TRANSFERRED' | 'INACTIVE';
  previous_practice?: number;
  notes?: string;
}