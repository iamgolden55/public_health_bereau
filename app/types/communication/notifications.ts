// app/types/communication/notifications.ts

export interface Notification {
    id: number;
    recipient: number;
    title: string;
    message: string;
    type: NotificationType;
    priority: NotificationPriority;
    is_read: boolean;
    action_url?: string;
    created_at: string;
    expires_at?: string;
    metadata?: Record<string, any>;
  }
  
  export interface NotificationPreference {
    user: number;
    notification_type: NotificationType;
    email_enabled: boolean;
    sms_enabled: boolean;
    push_enabled: boolean;
    quiet_hours_start?: string;
    quiet_hours_end?: string;
  }
  
  export type NotificationType = 
    | 'APPOINTMENT'
    | 'MEDICATION'
    | 'LAB_RESULT'
    | 'MESSAGE'
    | 'TASK'
    | 'BILLING'
    | 'EMERGENCY'
    | 'SYSTEM';
  
  export type NotificationPriority = 
    | 'LOW'
    | 'NORMAL'
    | 'HIGH'
    | 'URGENT';