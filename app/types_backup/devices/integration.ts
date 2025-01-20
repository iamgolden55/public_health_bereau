// app/types/devices/integration.ts

export interface ExternalSystem {
    id: number;
    name: string;
    system_type: SystemType;
    api_key: string;
    api_secret: string;
    endpoint_url: string;
    is_active: boolean;
    last_sync?: string;
  }
  
  export interface IntegrationLog {
    id: number;
    system: number;
    action: string;
    request_data: any;
    response_data?: any;
    success: boolean;
    error_message?: string;
    timestamp: string;
    system_name?: string;
  }
  
  export interface SystemSync {
    id: number;
    system: number;
    sync_type: SyncType;
    start_time: string;
    end_time?: string;
    records_processed: number;
    records_failed: number;
    status: SyncStatus;
    error_log?: string[];
  }
  
  export interface ApiConfig {
    id: number;
    system: number;
    endpoint: string;
    method: HttpMethod;
    headers: Record<string, string>;
    auth_type: AuthType;
    timeout: number;
    retry_attempts: number;
  }
  
  export type SystemType = 
    | 'LAB'
    | 'PHARMACY'
    | 'INSURANCE'
    | 'DEVICE';
  
  export type SyncType = 
    | 'FULL'
    | 'INCREMENTAL'
    | 'SCHEDULED'
    | 'MANUAL';
  
  export type SyncStatus = 
    | 'PENDING'
    | 'IN_PROGRESS'
    | 'COMPLETED'
    | 'FAILED'
    | 'CANCELLED';
  
  export type HttpMethod = 
    | 'GET'
    | 'POST'
    | 'PUT'
    | 'DELETE'
    | 'PATCH';
  
  export type AuthType = 
    | 'API_KEY'
    | 'OAUTH2'
    | 'JWT'
    | 'BASIC';