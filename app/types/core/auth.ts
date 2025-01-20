// app/types/core/auth.ts
import { User } from './user';

export interface AuthResponse {
    token: string;
    user: User;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterCredentials extends LoginCredentials {
    first_name: string;
    last_name: string;
    password_confirmation: string;
}