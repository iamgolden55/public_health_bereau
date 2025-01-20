// app/types/core/auth.ts

import { User } from './user';

export interface LoginRequest {
  email: string;
  password: string;
  remember_me?: boolean;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user: User;
}

export interface RegisterRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  date_of_birth?: string;
  country?: string;
  city?: string;
}

export interface TokenResponse {
  access: string;
  refresh: string;
}
