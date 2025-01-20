// app/types/devices/devices.ts

export interface MedicalDevice {
    id: number;
    name: string;
    device_type: string;
    serial_number: string;
    hospital: number;
    department: string;
    location: string;
    last_maintenance?: string;
    next_maintenance?: string;
    status: DeviceStatus;
    hospital_name?: string;
  }
  
  export interface DeviceReading {
    id: number;
    device: number;
    patient: number;
    reading_type: string;
    value: any;
    unit: string;
    timestamp: string;
    is_abnormal: boolean;
    notes?: string;
    device_name?: string;
    patient_name?: string;
  }
  
  export interface DeviceMaintenance {
    id: number;
    device: number;
    maintenance_type: MaintenanceType;
    scheduled_date: string;
    completed_date?: string;
    performed_by?: number;
    status: MaintenanceStatus;
    notes?: string;
    next_maintenance_date?: string;
  }
  
  export interface DeviceCalibration {
    id: number;
    device: number;
    calibration_date: string;
    performed_by: number;
    results: CalibrationResult;
    next_calibration_date: string;
    is_passed: boolean;
  }
  
  export interface CalibrationResult {
    baseline_reading: number;
    actual_reading: number;
    deviation: number;
    is_within_tolerance: boolean;
    tolerance_range: {
      min: number;
      max: number;
    };
  }
  
  export type DeviceStatus = 
    | 'ACTIVE'
    | 'MAINTENANCE'
    | 'INACTIVE'
    | 'FAULTY';
  
  export type MaintenanceType = 
    | 'ROUTINE'
    | 'PREVENTIVE'
    | 'CORRECTIVE'
    | 'EMERGENCY';
  
  export type MaintenanceStatus = 
    | 'SCHEDULED'
    | 'IN_PROGRESS'
    | 'COMPLETED'
    | 'CANCELLED';