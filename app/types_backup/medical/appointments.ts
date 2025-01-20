// types/medical/appointments.ts
// Appointment-specific types
import { GPPractice, GeneralPractitioner } from './gp';
import { MedicalProfessional } from './professional';

export interface Appointment {
  id: number;
  patient: number;
  provider: number;
  hospital: number;
  gp?: number;
  practice?: number;
  appointment_date: string;
  reason: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  notes?: string;
  appointment_type: 'GP_ROUTINE' | 'GP_FOLLOWUP' | 'SPECIALIST' | 'EMERGENCY' | 'VACCINATION' | 'SCREENING';
  priority: 'ROUTINE' | 'URGENT' | 'EMERGENCY';
  duration: string;
  reminders_enabled: boolean;
  last_reminder_sent?: string;
  check_in_time?: string;
  actual_duration?: string;
}

export interface AppointmentFormData {
  appointment_type: Appointment['appointment_type'];
  priority: Appointment['priority'];
  reason: string;
  provider: number;
  hospital: number;
  appointment_date: string;
  duration: string;
  notes?: string;
  reminders_enabled: boolean;
  practice?: number;
  gp?: number;
}

export interface AvailableSlot {
  start_time: string;
  end_time: string;
  provider_id: number;
  is_available: boolean;
}