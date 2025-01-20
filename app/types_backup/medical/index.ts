// app/types/medical/index.ts

// Export everything from each file in the medical domain
export * from './appointments';
export * from './records';
export * from './professional';
export * from './gp';
export * from './surgery';
export * from './base';
export * from './api';

// Re-export specific types that are commonly used within the medical domain
export type {
  Appointment,
  AppointmentFormData,
  AvailableSlot,
} from './appointments';

export type {
  MedicalRecord,
  Diagnosis,
  Medication,
  LabResult,
} from './records';

export type {
  Doctor,
  Specialist,
  Nurse,
} from './professional';

export type {
  GPPractice,
  GeneralPractitioner,
  GPRegistration,
} from './gp';

// Export domain-specific unions or utility types
export type MedicalSpecialty = 
  | 'CARDIOLOGY'
  | 'NEUROLOGY'
  | 'PEDIATRICS'
  | 'ONCOLOGY'
  | 'GENERAL_PRACTICE';

export type MedicalRecordType = 
  | 'CONSULTATION'
  | 'PROCEDURE'
  | 'TEST_RESULT'
  | 'PRESCRIPTION';

// Export common interfaces used across medical domain
export interface VitalSigns {
  bloodPressure: string;
  heartRate: number;
  temperature: number;
  oxygenSaturation: number;
}