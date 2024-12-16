// app/types/medical/appointments.ts

export interface Appointment {
  id: number;
  patient: number;
  provider: number;
  hospital: number;
  appointment_date: string;
  reason: string;
  status: AppointmentStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
  patient_name?: string;
  provider_name?: string;
  hospital_name?: string;
}

export type AppointmentStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';

//export interface TelemedicineSession {
//  id: number;
//  appointment_id: number;
//  session_url: string;
//  status: TelemedicineStatus;
  //doctor: {
    //id: number;
   // first_name: string;
    //last_name: string;
  //};
  //appointment: {
   // appointment_date: string;
  //};
 // notes?: string;
  //recording_url?: string;
  //duration?: number;
//}

//export type TelemedicineStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';