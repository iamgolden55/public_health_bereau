// app/types/index.ts

// Core types (auth, responses, user)
export * from './core';

// Medical domain types
export * from './medical';

// Hospital domain types
export * from './hospital';

// Billing domain types
export * from './billing';

// Communication domain types
export * from './communication';

// Device domain types
export * from './devices';

// Research domain types
export * from './research';

// Re-export specific types that are commonly used
// This makes it easier to import frequently used types directly
export type {
  // Core types
  User,
  AuthResponse,
  ApiResponse,
} from './core';

// Common Medical types
export type {
  Appointment,
  MedicalRecord,
  Patient,
  Doctor,
} from './medical';

// Common Hospital types
export type {
  Hospital,
  Department,
  Staff,
} from './hospital';

// Common Billing types
export type {
  Payment,
  Invoice,
  Insurance,
} from './billing';

// Common Communication types
export type {
  Message,
  Notification,
  Task,
} from './communication';

// Common Device types
export type {
  Device,
  DeviceReading,
  Integration,
} from './devices';

// Common Research types
export type {
  Research,
  Analysis,
  Project,
} from './research';

// Export common type unions or utility types
export type EntityId = number | string;

export type Status = 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'COMPLETED' | 'CANCELLED';

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

// Export common interfaces that are used across multiple domains
export interface Timestamp {
  created_at: string;
  updated_at: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface FilterParams {
  page?: number;
  page_size?: number;
  search?: string;
  ordering?: string;
  [key: string]: any;
}