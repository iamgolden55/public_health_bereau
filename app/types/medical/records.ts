// app/types/medical/records.ts

export interface MedicalRecord {
  id: number;
  patient: number;
  provider: number;
  hospital: number;
  record_date: string;
  chief_complaint: string;
  present_illness: string;
  vital_signs: VitalSigns;
  assessment: string;
  plan: string;
  is_confidential: boolean;
  created_at: string;
  updated_at: string;
  diagnoses: Diagnosis[];
  medications: Medication[];
  procedures: Procedure[];
  lab_results: LabResult[];
  provider_name?: string;
  hospital_name?: string;
}

export interface VitalSigns {
  blood_pressure?: string;
  temperature?: number;
  heart_rate?: number;
  respiratory_rate?: number;
  oxygen_saturation?: number;
  height?: number;
  weight?: number;
  bmi?: number;
  [key: string]: any;
}

export interface Diagnosis {
  id: number;
  medical_record: number;
  diagnosis_code: string;  // ICD-10 code
  description: string;
  diagnosis_type: DiagnosisType;
  diagnosed_by: number;
  diagnosed_by_name?: string;
  diagnosis_date: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export type DiagnosisType = 'PRIMARY' | 'SECONDARY' | 'DIFFERENTIAL';

export interface Medication {
  id: number;
  medical_record: number;
  name: string;
  dosage: string;
  frequency: string;
  route: MedicationRoute;
  start_date: string;
  end_date?: string;
  prescribed_by: number;
  prescribed_by_name?: string;
  is_active: boolean;
  instructions: string;
  side_effects?: string;
  created_at: string;
  updated_at: string;
  // Metrics-related fields
  efficacy_rate?: number;
  adherence_rate?: number;
  side_effects_rate?: number;
  last_taken?: string;
  doses_missed?: number;
  total_doses?: number;
}

export type MedicationRoute = 'ORAL' | 'IV' | 'IM' | 'SC' | 'TOPICAL';

// Adding missing interfaces
export interface Procedure {
  id: number;
  medical_record: number;
  procedure_code: string;  // CPT code
  name: string;
  description: string;
  performed_by: number;
  performed_by_name?: string;
  procedure_date: string;
  location: number;
  status: ProcedureStatus;
  notes?: string;
  complications?: string;
  created_at: string;
  updated_at: string;
}

export type ProcedureStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface LabResult {
  id: number;
  medical_record: number;
  test_name: string;
  test_code: string;  // LOINC code
  category: string;
  result_value: string;
  unit: string;
  reference_range: string;
  is_abnormal: boolean;
  performed_by: number;
  performed_by_name?: string;
  test_date: string;
  result_date: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}