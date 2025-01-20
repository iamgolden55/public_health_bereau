// types/medical/professional.ts
// Medical professional types
export interface MedicalProfessional {
    id: number;
    user: number;
    license_number: string;
    professional_type: 'DOCTOR' | 'NURSE' | 'SPECIALIST' | 'EMERGENCY';
    specialization: string;
    hospital: number;
    department?: number;
    is_verified: boolean;
  }