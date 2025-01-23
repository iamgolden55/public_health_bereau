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

export interface RegisterCredentials {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    date_of_birth: string;
    gender: 'M' | 'F' | 'O';
    phone_number?: string;
    country?: string;
    city?: string;
}

export interface RegisterResponse {
    message: string;
    user: {
        id: number;
        email: string;
        first_name: string;
        last_name: string;
        gender: string;
        hpn: string;
    };
}

export interface LoginResponse {
    access: string;
    refresh: string;
    user: {
        id: number;
        email: string;
        first_name: string;
        last_name: string;
        is_verified: boolean;
        hpn: string;
        date_of_birth: string;
        role: 'professional' | 'patient';
        has_professional_access: boolean;
        professional_details: {
            license_number: string;
            professional_type: string;
            specialization: string;
            is_verified: boolean;
            department?: number;
            hospital?: number;
        } | null;
        last_active_view: 'professional' | 'patient';
    };
}

export interface SocialAuthResponse {
    access: string;
    refresh: string;
    user: {
        id: number;
        email: string;
        first_name: string;
        last_name: string;
        is_verified: boolean;
    };
    created: boolean;
}