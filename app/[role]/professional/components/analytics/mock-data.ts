import { PatientMetric, HealthOutcome } from './types'

export const patientTrendData: PatientMetric[] = [
  { month: 'Jan', newPatients: 45, followUps: 120, referrals: 25 },
  { month: 'Feb', newPatients: 52, followUps: 115, referrals: 30 },
  { month: 'Mar', newPatients: 48, followUps: 125, referrals: 28 },
  { month: 'Apr', newPatients: 70, followUps: 140, referrals: 35 },
  { month: 'May', newPatients: 65, followUps: 135, referrals: 32 },
  { month: 'Jun', newPatients: 58, followUps: 130, referrals: 29 }
]

export const healthOutcomesData: HealthOutcome[] = [
  { name: 'Improved', value: 65, color: '#22c55e' },
  { name: 'Stable', value: 25, color: '#3b82f6' },
  { name: 'Needs Attention', value: 10, color: '#ef4444' }
]