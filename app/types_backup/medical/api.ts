// types/medical/api.ts
// API response types
export interface ApiResponse<T> {
    data?: T;
    error?: string;
    message?: string;
    status: number;
  }