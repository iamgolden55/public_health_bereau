// app/types/communication/messages.ts

export interface Message {
    id: number;
    sender: number;
    recipient: number;
    subject: string;
    content: string;
    is_read: boolean;
    attachment?: File;
    created_at: string;
    updated_at: string;
    sender_name?: string;
    recipient_name?: string;
  }
  
  export interface TelemedicineSession {
    id: number;
    patient: number;
    doctor: number;
    appointment: number;
    session_url: string;
    status: TelemedicineStatus;
    notes?: string;
    recording_url?: string;
    duration?: number;
    doctor_name?: string;
    patient_name?: string;
  }
  
  export type TelemedicineStatus = 
    | 'SCHEDULED'
    | 'IN_PROGRESS'
    | 'COMPLETED'
    | 'CANCELLED';
  
  export interface ChatMessage {
    id: number;
    session_id: number;
    sender: number;
    content: string;
    timestamp: string;
    message_type: MessageType;
    attachment_url?: string;
    is_read: boolean;
  }
  
  export type MessageType = 
    | 'TEXT'
    | 'IMAGE'
    | 'FILE'
    | 'PRESCRIPTION'
    | 'LAB_RESULT'
    | 'SYSTEM';