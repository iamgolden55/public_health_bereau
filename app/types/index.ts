// app/types/index.ts
export * from './core';
export * from './medical';

// Common utility types
export type EntityId = number | string;

export type Status = 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'COMPLETED' | 'CANCELLED';

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface Timestamp {
    created_at: string;
    updated_at: string;
}