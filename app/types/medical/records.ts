// app/types/medical/records.ts



// Base diagnosis type
export interface Diagnosis {
    id: number;
    medical_record: number;
    diagnosis_code: string;
    description: string;
    diagnosis_type: 'PRIMARY' | 'SECONDARY' | 'DIFFERENTIAL';
    diagnosed_by?: number;
    diagnosed_by_name?: string;
    diagnosis_date: string;
    notes?: string;
    created_at: string;
    updated_at: string;
}

// Base medication type
export interface Medication {
    id: number;
    medical_record: number;
    name: string;
    dosage: string;
    frequency: string;
    route: 'ORAL' | 'IV' | 'IM' | 'SC' | 'TOPICAL';
    start_date: string;
    end_date?: string;
    prescribed_by?: number;
    prescribed_by_name?: string;
    is_active: boolean;
    instructions: string;
    side_effects?: string;
}

// Base procedure type
export interface Procedure {
    id: number;
    medical_record: number;
    procedure_code: string;
    name: string;
    description: string;
    performed_by?: number;
    performed_by_name?: string;
    procedure_date: string;
    location?: number;
    status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
    notes?: string;
    complications?: string;
}

// Base lab result type
export interface LabResult {
    id: number;
    medical_record: number;
    test_name: string;
    test_code: string;
    category: string;
    result_value: string;
    unit: string;
    reference_range: string;
    is_abnormal: boolean;
    performed_by?: number;
    performed_by_name?: string;
    test_date: string;
    result_date: string;
    notes?: string;
}

// New Preventive Care Types
export interface Immunization {
    id: number;
    medical_record: number;
    vaccine_name: string;
    vaccine_code: string;
    dose_number: number;
    date_administered: string;
    next_due_date?: string;
    administered_by?: number;
    administered_by_name?: string;
    manufacturer: string;
    lot_number: string;
    site: string;
    route: string;
    status: 'COMPLETED' | 'OVERDUE' | 'UPCOMING';
    notes?: string;
    created_at: string;
    updated_at: string;
}

// Mental Health Types
export interface MentalHealthAssessment {
    id: number;
    medical_record: number;
    assessment_type: 'PHQ9' | 'GAD7' | 'MOOD' | 'COGNITIVE';
    score: number;
    severity: 'MINIMAL' | 'MILD' | 'MODERATE' | 'SEVERE';
    assessed_by?: number;
    assessed_by_name?: string;
    assessment_date: string;
    next_assessment_date?: string;
    recommendations: string;
    notes?: string;
    created_at: string;
    updated_at: string;
}

// Family History Types
export interface FamilyHistory {
    id: number;
    medical_record: number;
    relation: 'MOTHER' | 'FATHER' | 'SIBLING' | 'GRANDPARENT' | 'CHILD' | 'OTHER';
    condition: string;
    age_at_diagnosis?: number;
    current_age?: number;
    deceased: boolean;
    age_at_death?: number;
    cause_of_death?: string;
    notes?: string;
    created_at: string;
    updated_at: string;
}

// Reproductive Health Types
export interface MenstrualCycle {
    id: number;
    medical_record: number;
    cycle_startdate: string;
    cycle_enddate?: string;
    cycle_length: number;
    flow_intensity: 'LIGHT' | 'MODERATE' | 'HEAVY';
    symptoms: string[];
    notes?: string;
    created_at: string;
    updated_at: string;
}

export interface FertilityAssessment {
    id: number;
    medical_record: number;
    assessment_date: string;
    assessed_by?: number;
    assessed_by_name?: string;
    amh_level?: number;
    follicle_count?: number;
    uterine_findings?: string;
    ovarian_findings?: string;
    recommendations: string;
    next_assessment?: string;
    created_at: string;
    updated_at: string;
}

export interface HormonePanel {
    id: number;
    medical_record: number;
    test_date: string;
    estrogen_level: number;
    progesterone_level: number;
    fsh_level: number;
    lh_level: number;
    testosterone_level: number;
    prolactin_level: number;
    is_abnormal: boolean;
    notes?: string;
    created_at: string;
    updated_at: string;
}

export interface GynecologicalExam {
    id: number;
    medical_record: number;
    exam_date: string;
    performed_by?: number;
    performed_by_name?: string;
    exam_type: 'ROUTINE' | 'PROBLEM' | 'FOLLOWUP' | 'EMERGENCY';
    findings: string;
    pap_smear_done: boolean;
    pap_smear_result?: 'NORMAL' | 'ABNORMAL' | 'PENDING';
    breast_exam_done: boolean;
    breast_exam_findings?: string;
    recommendations: string;
    next_exam_date?: string;
    created_at: string;
    updated_at: string;
}

// Main medical record type
export interface MedicalRecord {
    id: number;
    patient: number;
    provider: number;
    hospital: number;
    appointment?: number;
    record_date: string;
    chief_complaint: string;
    present_illness: string;
    vital_signs: string;
    assessment: string;
    plan: string;
    is_confidential: boolean;
    created_at: string;
    updated_at: string;
    diagnoses: Diagnosis[];
    medications: Medication[];
    procedures: Procedure[];
    lab_results: LabResult[];
    // Add new related fields
    immunizations: Immunization[];
    mental_health_assessments: MentalHealthAssessment[];
    family_histories: FamilyHistory[];
    menstrual_cycles: MenstrualCycle[];
    fertility_assessments: FertilityAssessment[];
    hormone_panels: HormonePanel[];
    gynecological_exams: GynecologicalExam[];
}

// Form data types for creating/updating records
export interface MedicalRecordFormData {
    patient: number;
    chief_complaint: string;
    present_illness: string;
    vital_signs: string;
    assessment: string;
    plan: string;
    is_confidential?: boolean;
}

// Optional query parameters for fetching records
export interface MedicalRecordQueryParams {
    patient_id?: number;
    date_from?: string;
    date_to?: string;
    is_confidential?: boolean;
}