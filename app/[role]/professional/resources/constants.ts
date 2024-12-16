// app/[role]/professional/resources/constants.ts

export const MEDICAL_SPECIALTIES = {
    CARDIOLOGY: {
      name: 'Cardiology',
      description: 'Diagnosis and treatment of heart diseases',
      subSpecialties: [
        'Interventional Cardiology',
        'Electrophysiology',
        'Heart Failure',
        'Preventive Cardiology'
      ],
      commonConditions: [
        'Coronary Artery Disease',
        'Heart Failure',
        'Arrhythmias',
        'Hypertension'
      ]
    },
    NEUROLOGY: {
      name: 'Neurology',
      description: 'Study and treatment of nervous system disorders',
      subSpecialties: [
        'Stroke Medicine',
        'Epilepsy',
        'Neuromuscular Medicine',
        'Movement Disorders'
      ],
      commonConditions: [
        'Stroke',
        'Epilepsy',
        'Multiple Sclerosis',
        'Parkinson\'s Disease'
      ]
    },
    ONCOLOGY: {
      name: 'Oncology',
      description: 'Diagnosis and treatment of cancer',
      subSpecialties: [
        'Medical Oncology',
        'Radiation Oncology',
        'Surgical Oncology',
        'Pediatric Oncology'
      ],
      commonConditions: [
        'Breast Cancer',
        'Lung Cancer',
        'Leukemia',
        'Lymphoma'
      ]
    },
    PEDIATRICS: {
      name: 'Pediatrics',
      description: 'Medical care of infants, children, and adolescents',
      subSpecialties: [
        'Neonatology',
        'Pediatric Cardiology',
        'Pediatric Neurology',
        'Developmental Pediatrics'
      ],
      commonConditions: [
        'Respiratory Infections',
        'Developmental Disorders',
        'Childhood Obesity',
        'Asthma'
      ]
    },
    EMERGENCY_MEDICINE: {
      name: 'Emergency Medicine',
      description: 'Acute care and emergency response',
      subSpecialties: [
        'Trauma',
        'Critical Care',
        'Toxicology',
        'Sports Medicine'
      ],
      commonConditions: [
        'Trauma',
        'Acute Cardiac Events',
        'Respiratory Distress',
        'Severe Infections'
      ]
    },
    INTERNAL_MEDICINE: {
      name: 'Internal Medicine',
      description: 'Comprehensive adult healthcare',
      subSpecialties: [
        'Endocrinology',
        'Gastroenterology',
        'Rheumatology',
        'Pulmonology'
      ],
      commonConditions: [
        'Diabetes',
        'Hypertension',
        'COPD',
        'Arthritis'
      ]
    },
    SURGERY: {
      name: 'Surgery',
      description: 'Surgical procedures and interventions',
      subSpecialties: [
        'General Surgery',
        'Orthopedic Surgery',
        'Neurosurgery',
        'Cardiothoracic Surgery'
      ],
      commonConditions: [
        'Appendicitis',
        'Hernias',
        'Gallbladder Disease',
        'Trauma'
      ]
    },
    PSYCHIATRY: {
      name: 'Psychiatry',
      description: 'Mental health and behavioral disorders',
      subSpecialties: [
        'Child Psychiatry',
        'Addiction Psychiatry',
        'Geriatric Psychiatry',
        'Forensic Psychiatry'
      ],
      commonConditions: [
        'Depression',
        'Anxiety Disorders',
        'Bipolar Disorder',
        'Schizophrenia'
      ]
    },
    OBSTETRICS_GYNECOLOGY: {
      name: 'Obstetrics & Gynecology',
      description: 'Women\'s reproductive health',
      subSpecialties: [
        'Maternal-Fetal Medicine',
        'Reproductive Endocrinology',
        'Gynecologic Oncology',
        'Urogynecology'
      ],
      commonConditions: [
        'Pregnancy',
        'Endometriosis',
        'Ovarian Cysts',
        'Cervical Cancer'
      ]
    },
    DERMATOLOGY: {
      name: 'Dermatology',
      description: 'Skin, hair, and nail conditions',
      subSpecialties: [
        'Pediatric Dermatology',
        'Dermatopathology',
        'Cosmetic Dermatology',
        'Mohs Surgery'
      ],
      commonConditions: [
        'Acne',
        'Psoriasis',
        'Skin Cancer',
        'Eczema'
      ]
    }
  }
  
  export const RESOURCE_CATEGORIES = {
    CLINICAL_GUIDELINES: {
      name: 'Clinical Guidelines',
      description: 'Evidence-based recommendations for patient care',
      types: [
        'Diagnostic Guidelines',
        'Treatment Guidelines',
        'Prevention Guidelines',
        'Management Guidelines'
      ]
    },
    TREATMENT_PROTOCOLS: {
      name: 'Treatment Protocols',
      description: 'Standardized procedures for specific conditions',
      types: [
        'Emergency Protocols',
        'Surgical Protocols',
        'Medication Protocols',
        'Care Pathways'
      ]
    },
    RESEARCH_PAPERS: {
      name: 'Research Papers',
      description: 'Latest medical research and findings',
      types: [
        'Clinical Trials',
        'Systematic Reviews',
        'Meta-Analyses',
        'Case Studies'
      ]
    },
    MEDICAL_ALGORITHMS: {
      name: 'Medical Algorithms',
      description: 'Decision-making tools and flowcharts',
      types: [
        'Diagnostic Algorithms',
        'Treatment Selection',
        'Risk Assessment',
        'Triage Protocols'
      ]
    },
    PATIENT_EDUCATION: {
      name: 'Patient Education',
      description: 'Materials for patient communication and education',
      types: [
        'Condition Guides',
        'Medication Information',
        'Lifestyle Modifications',
        'Prevention Strategies'
      ]
    },
    REGULATORY_COMPLIANCE: {
      name: 'Regulatory Compliance',
      description: 'Healthcare regulations and standards',
      types: [
        'Safety Guidelines',
        'Documentation Standards',
        'Privacy Protocols',
        'Quality Measures'
      ]
    }
  }
  
  export const EVIDENCE_LEVELS = {
    LEVEL_1: {
      name: 'Level 1',
      description: 'Systematic review of randomized trials',
      strength: 'Highest'
    },
    LEVEL_2: {
      name: 'Level 2',
      description: 'Randomized controlled trials',
      strength: 'High'
    },
    LEVEL_3: {
      name: 'Level 3',
      description: 'Non-randomized controlled studies',
      strength: 'Moderate'
    },
    LEVEL_4: {
      name: 'Level 4',
      description: 'Observational studies',
      strength: 'Limited'
    },
    LEVEL_5: {
      name: 'Level 5',
      description: 'Expert opinion',
      strength: 'Low'
    }
  }
  
  export type Specialty = keyof typeof MEDICAL_SPECIALTIES
  export type ResourceCategory = keyof typeof RESOURCE_CATEGORIES
  export type EvidenceLevel = keyof typeof EVIDENCE_LEVELS
  
  export interface MedicalResource {
    id: string
    title: string
    description: string
    specialty: Specialty
    category: ResourceCategory
    evidenceLevel: EvidenceLevel
    lastUpdated: string
    authors: string[]
    institution: string
    keywords: string[]
    url: string
    downloadable: boolean
    fileType?: string
    fileSize?: number
    citations?: number
    rating?: number
    reviews?: number
  }