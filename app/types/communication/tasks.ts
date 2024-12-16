// app/types/communication/tasks.ts

export interface Task {
    id: number;
    title: string;
    description: string;
    assigned_to: number;
    created_by: number;
    department?: string;
    priority: TaskPriority;
    status: TaskStatus;
    due_date: string;
    completed_at?: string;
    assigned_to_name?: string;
    created_by_name?: string;
  }
  
  export interface Protocol {
    id: number;
    name: string;
    department: string;
    steps: ProtocolStep[];
    required_role: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
  }
  
  export interface ProtocolStep {
    order: number;
    description: string;
    duration?: number;
    required_role?: string;
    dependencies?: number[];
  }
  
  export type TaskPriority = 
    | 'LOW'
    | 'MEDIUM'
    | 'HIGH'
    | 'URGENT';
  
  export type TaskStatus = 
    | 'PENDING'
    | 'IN_PROGRESS'
    | 'COMPLETED'
    | 'CANCELLED';