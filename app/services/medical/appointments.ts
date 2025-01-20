// app/services/medical/appointments.ts
import { ApiResponse } from '@/app/types/core';
// Import medical-specific types
import { Appointment, AppointmentFormData, AvailableSlot } from '@/app/types/medical';
import { GPPractice, GeneralPractitioner } from '@/app/types/medical/gp';
class AppointmentService {
  private static BASE_URL = 'http://localhost:8000/api';

  static async getAppointments(): Promise<ApiResponse<Appointment[]>> {
    try {
      const response = await fetch(`${this.BASE_URL}/appointments/`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      return { data, status: response.status };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'An unknown error occurred', status: 500 };
    }
  }

  static async createAppointment(formData: AppointmentFormData): Promise<ApiResponse<Appointment>> {
    try {
      const response = await fetch(`${this.BASE_URL}/appointments/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      return { data, status: response.status };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'An unknown error occurred', status: 500 };
    }
  }

  static async getAvailableSlots(practiceId: string, gpId?: string, date?: string): Promise<ApiResponse<AvailableSlot[]>> {
    try {
      const params = new URLSearchParams();
      if (gpId) params.append('gp_id', gpId);
      if (date) params.append('date', date);

      const response = await fetch(
        `${this.BASE_URL}/appointments/available_slots/?practice_id=${practiceId}&${params}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      const data = await response.json();
      return { data, status: response.status };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'An unknown error occurred', status: 500 };
    }
  }

  static async cancelAppointment(appointmentId: number): Promise<ApiResponse<void>> {
    try {
      const response = await fetch(`${this.BASE_URL}/appointments/${appointmentId}/cancel/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      return { data, status: response.status };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'An unknown error occurred', status: 500 };
    }
  }

  static async rescheduleAppointment(
    appointmentId: number, 
    newDate: string
  ): Promise<ApiResponse<Appointment>> {
    try {
      const response = await fetch(`${this.BASE_URL}/appointments/${appointmentId}/reschedule/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ new_date: newDate }),
      });
      const data = await response.json();
      return { data, status: response.status };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'An unknown error occurred', status: 500 };
    }
  }

  static async getGPPractices(params?: { city?: string; postcode?: string }): Promise<ApiResponse<GPPractice[]>> {
    try {
      const queryString = params ? new URLSearchParams(params).toString() : '';
      const response = await fetch(`${this.BASE_URL}/gp-practices/?${queryString}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      return { data: Array.isArray(data) ? data : [], status: response.status };
    } catch (error) {
      return { data: [], error: error instanceof Error ? error.message : 'An unknown error occurred', status: 500 };
    }
  }

  static async getGeneralPractitioners(practiceId: string): Promise<ApiResponse<GeneralPractitioner[]>> {
    try {
      const response = await fetch(
        `${this.BASE_URL}/general-practitioners/?practice_id=${practiceId}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      const data = await response.json();
      return { data, status: response.status };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'An unknown error occurred', status: 500 };
    }
  }

  static async getGPRegistrationStatus(): Promise<ApiResponse<{ status: string }>> {
    try {
      const response = await fetch(`${this.BASE_URL}/gp-registrations/status/`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      return { data, status: response.status };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'An unknown error occurred', status: 500 };
    }
  }


  static async registerWithGP(practiceId: string, userId: number): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${this.BASE_URL}/gp-registrations/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          practice: practiceId,
          patient: userId,
          status: 'PENDING'
        }),
      });
      const data = await response.json();
      return { data, status: response.status };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'An unknown error occurred', status: 500 };
    }
  }

  static async getDoctors(practiceId: string): Promise<ApiResponse<GeneralPractitioner[]>> {
    try {
      const response = await fetch(
        `${this.BASE_URL}/general-practitioners/?practice=${practiceId}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      const data = await response.json();
      return { data, status: response.status };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'An unknown error occurred', status: 500 };
    }
  }

  static async checkAvailability(appointmentData: Partial<AppointmentFormData>): Promise<ApiResponse<boolean>> {
    try {
      const response = await fetch(`${this.BASE_URL}/appointments/check-availability/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(appointmentData),
      });
      const data = await response.json();
      return { data, status: response.status };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'An unknown error occurred', status: 500 };
    }
  }
}

export default AppointmentService;