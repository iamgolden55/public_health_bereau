// app/types/medical/gp.ts
export interface GPPractice {
    id: number;
    name: string;
    registration_number: string;
    address: string;
    city: string;
    postcode: string;
    contact_number: string;
    email: string;
    capacity: number;
    is_accepting_patients: boolean;
    opening_hours: Record<string, string>;
    created_at: string;
    updated_at: string;
}

export interface GeneralPractitioner {
    id: number;
    user: number;
    practice: number;
    license_number: string;
    specializations: string[];
    availability_schedule: Record<string, string[]>;
    max_daily_appointments: number;
    is_accepting_appointments: boolean;
    qualification: string;
    years_of_experience: number;
    biography?: string;
    created_at: string;
    updated_at: string;
}
