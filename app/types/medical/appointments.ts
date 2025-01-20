// app/types/medical/appointments.ts
export interface Appointment {
    id: number;
    patient: number;
    provider: number;
    provider_name: string;
    hospital: number;
    appointment_date: string;
    reason: string;
    status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
    notes?: string;
    created_at: string;
    updated_at: string;
    gp?: number;
    practice?: number;
    appointment_type: 'GP_ROUTINE' | 'GP_FOLLOWUP' | 'SPECIALIST' | 'EMERGENCY' | 'VACCINATION' | 'SCREENING';
    priority: 'ROUTINE' | 'URGENT' | 'EMERGENCY';
    duration: string;
    reminders_enabled: boolean;
    last_reminder_sent?: string;
    check_in_time?: string;
    actual_duration?: string;
}

export interface AppointmentFormData {
    patient: number;  // Add this field
    title?: string;
    appointment_type: Appointment['appointment_type'];
    priority: Appointment['priority'];
    reason: string;
    provider: number;
    hospital: number;
    appointment_date: string;
    duration: string;
    notes?: string;
    reminders_enabled: boolean;
    practice?: number;
    gp?: number;
}

export interface AvailableSlot {
    start_time: string;
    end_time: string;
    provider_id: number;
    is_available: boolean;
}
