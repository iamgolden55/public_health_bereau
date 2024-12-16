// app/types/research/projects.ts

export interface ResearchProject {
    id: number;
    title: string;
    description: string;
    principal_investigator: number;
    hospital: number;
    status: ResearchStatus;
    ethics_approval_number?: string;
    start_date: string;
    end_date?: string;
    is_ai_enabled: boolean;
    keywords: string[];
    created_at: string;
    updated_at: string;
  }
  
  export interface ResearchCriteria {
    id: number;
    project: number;
    criteria_type: CriteriaType;
    category: CriteriaCategory;
    condition: any; // JSON field for complex criteria
    created_at: string;
  }
  
  export interface ResearchCohort {
    id: number;
    project: number;
    name: string;
    description: string;
    is_control_group: boolean;
    size: number;
    created_at: string;
    updated_at: string;
  }
  
  export interface CohortMembership {
    id: number;
    cohort: number;
    patient: number;
    joined_date: string;
    consent_date?: string;
    withdrawn_date?: string;
    status: CohortStatus;
  }
  
  export type ResearchStatus = 
    | 'PROPOSED'
    | 'APPROVED'
    | 'IN_PROGRESS'
    | 'COMPLETED'
    | 'PUBLISHED'
    | 'ARCHIVED';
  
  export type CriteriaType = 'INCLUSION' | 'EXCLUSION';
  
  export type CriteriaCategory = 
    | 'AGE'
    | 'GENDER'
    | 'DIAGNOSIS'
    | 'MEDICATION'
    | 'LAB_RESULT'
    | 'PROCEDURE'
    | 'CUSTOM';
  
  export type CohortStatus = 
    | 'ELIGIBLE'
    | 'CONSENTED'
    | 'ACTIVE'
    | 'COMPLETED'
    | 'WITHDRAWN';