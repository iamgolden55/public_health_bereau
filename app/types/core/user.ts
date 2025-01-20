// app/types/core/user.ts
export interface User {
    id: number;
    email: string;
    username: string;
    first_name: string;
    last_name: string;
    date_of_birth?: string;
    country?: string;
    city?: string;
    hpn?: string;
    is_verified: boolean;
    verification_token: string;
    password_reset_token?: string;
    social_provider?: string;
    social_id?: string;
    primary_hospital?: number;
    last_active_view?: 'patient' | 'professional';
    has_registered_gp: boolean;
    current_gp_practice?: number;
    current_gp?: number;
    blood_type?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
    allergies?: string;
    chronic_conditions?: string;
    emergency_contact_name?: string;
    emergency_contact_phone?: string;
    is_high_risk: boolean;
    last_visit_date?: string;
}
