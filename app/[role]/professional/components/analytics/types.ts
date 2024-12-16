export interface DateRange {
    from: Date
    to?: Date
  }
  
  export interface PatientMetric {
    month: string
    newPatients: number
    followUps: number
    referrals: number
  }
  
  export interface HealthOutcome {
    name: string
    value: number
    color: string
  }
  
  export interface QuickStatCardProps {
    title: string
    value: string
    change: string
    icon: React.ElementType
    trend?: 'up' | 'down'
  }
  
  export type MetricType = 'all' | 'patients' | 'outcomes' | 'revenue'