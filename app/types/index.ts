// app/types/index.ts

// Core exports
export * from './core';

// Medical exports (explicitly excluding TelemedicineSession)
export type {
  MedicalRecord,
  VitalSigns,
  Diagnosis,
  Medication,
  Procedure,
  LabResult
} from './medical';

// Communication exports (including TelemedicineSession)
export type {
  Message,
  TelemedicineSession,
  TelemedicineStatus,
  ChatMessage,
  MessageType,
  Notification
} from './communication';

// Hospital exports
export * from './hospital';

// Billing exports
export * from './billing';

// Device exports
export * from './devices';

// Research exports
export * from './research';