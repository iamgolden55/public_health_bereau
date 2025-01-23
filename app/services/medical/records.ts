// app/services/medical/records.ts

import { ApiResponse } from '@/app/types/core/responses';
import { 
    MedicalRecord, 
    MedicalRecordFormData, 
    MedicalRecordQueryParams,
    Immunization,
    MentalHealthAssessment,
    FamilyHistory,
    MenstrualCycle,
    FertilityAssessment,
    HormonePanel,
    GynecologicalExam
} from '@/app/types/medical/records';

class MedicalRecordService {
    // Change this to your Django server URL
    private static BASE_URL = 'http://localhost:8000/api/medical-records';

    static async getMedicalRecords(params?: MedicalRecordQueryParams): Promise<ApiResponse<MedicalRecord[]>> {
        try {
            const queryString = params 
                ? '?' + new URLSearchParams(params as Record<string, string>).toString() 
                : '';
            
            // Let's add a console.log to verify the full URL
            console.log('Fetching from:', `${this.BASE_URL}${queryString}`);

            const response = await fetch(`${this.BASE_URL}${queryString}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Accept': 'application/json'
                }
            });

            // Add this check before parsing JSON
            if (!response.ok) {
                throw new Error(`Failed to fetch data: ${response.statusText}`);
            }

            const data = await response.json();
            return { data, status: response.status };
        } catch (error) {
            return { 
                error: error instanceof Error ? error.message : 'An unknown error occurred', 
                status: 500 
            };
        }
    }

    // Get a single medical record by ID
    static async getMedicalRecord(id: number): Promise<ApiResponse<MedicalRecord>> {
        try {
            const response = await fetch(`${this.BASE_URL}/${id}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch record: ${response.statusText}`);
            }

            const data = await response.json();
            return { data, status: response.status };
        } catch (error) {
            return { 
                error: error instanceof Error ? error.message : 'An unknown error occurred', 
                status: 500 
            };
        }
    }

    // Create a new medical record
    static async createMedicalRecord(formData: MedicalRecordFormData): Promise<ApiResponse<MedicalRecord>> {
        try {
            const response = await fetch(`${this.BASE_URL}/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error(`Failed to create record: ${response.statusText}`);
            }

            const data = await response.json();
            return { data, status: response.status };
        } catch (error) {
            return { 
                error: error instanceof Error ? error.message : 'An unknown error occurred', 
                status: 500 
            };
        }
    }

    // Update an existing medical record
    static async updateMedicalRecord(
        id: number, 
        formData: Partial<MedicalRecordFormData>
    ): Promise<ApiResponse<MedicalRecord>> {
        try {
            const response = await fetch(`${this.BASE_URL}/${id}/`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error(`Failed to update record: ${response.statusText}`);
            }

            const data = await response.json();
            return { data, status: response.status };
        } catch (error) {
            return { 
                error: error instanceof Error ? error.message : 'An unknown error occurred', 
                status: 500 
            };
        }
    }

    // Share a medical record
    static async shareMedicalRecord(
        recordId: number, 
        providerId: number, 
        expiryDate: string
    ): Promise<ApiResponse<void>> {
        try {
            const response = await fetch(`${this.BASE_URL}/${recordId}/share/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    provider_id: providerId,
                    expiry_date: expiryDate,
                }),
            });

            if (!response.ok) {
                throw new Error(`Failed to share record: ${response.statusText}`);
            }

            const data = await response.json();
            return { data, status: response.status };
        } catch (error) {
            return { 
                error: error instanceof Error ? error.message : 'An unknown error occurred', 
                status: 500 
            };
        }
    }

    // Get access history
    static async getAccessHistory(recordId: number): Promise<ApiResponse<any>> {
        try {
            const response = await fetch(`${this.BASE_URL}/${recordId}/access-history/`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch access history: ${response.statusText}`);
            }

            const data = await response.json();
            return { data, status: response.status };
        } catch (error) {
            return { 
                error: error instanceof Error ? error.message : 'An unknown error occurred', 
                status: 500 
            };
        }
    }

    // New methods for additional record types
    static async getImmunizations(): Promise<ApiResponse<Immunization[]>> {
        try {
            const response = await fetch(`${this.BASE_URL}/immunizations/`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Accept': 'application/json'
                }
            });
            const data = await response.json();
            return { data, status: response.status };
        } catch (error) {
            return { 
                error: error instanceof Error ? error.message : 'An unknown error occurred', 
                status: 500 
            };
        }
    }

    static async getMentalHealthAssessments(): Promise<ApiResponse<MentalHealthAssessment[]>> {
        try {
            const response = await fetch(`${this.BASE_URL}/mental-health-assessments/`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Accept': 'application/json'
                }
            });
            const data = await response.json();
            return { data, status: response.status };
        } catch (error) {
            return { 
                error: error instanceof Error ? error.message : 'An unknown error occurred', 
                status: 500 
            };
        }
    }

    static async getFamilyHistory(): Promise<ApiResponse<FamilyHistory[]>> {
        try {
            const response = await fetch(`${this.BASE_URL}/family-history/`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Accept': 'application/json'
                }
            });
            const data = await response.json();
            return { data, status: response.status };
        } catch (error) {
            return { 
                error: error instanceof Error ? error.message : 'An unknown error occurred', 
                status: 500 
            };
        }
    }

    static async getMenstrualCycles(): Promise<ApiResponse<MenstrualCycle[]>> {
        try {
            const response = await fetch(`${this.BASE_URL}/menstrual-cycles/`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Accept': 'application/json'
                }
            });
            const data = await response.json();
            return { data, status: response.status };
        } catch (error) {
            return { 
                error: error instanceof Error ? error.message : 'An unknown error occurred', 
                status: 500 
            };
        }
    }

    static async getFertilityAssessments(): Promise<ApiResponse<FertilityAssessment[]>> {
        try {
            const response = await fetch(`${this.BASE_URL}/fertility-assessments/`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Accept': 'application/json'
                }
            });
            const data = await response.json();
            return { data, status: response.status };
        } catch (error) {
            return { 
                error: error instanceof Error ? error.message : 'An unknown error occurred', 
                status: 500 
            };
        }
    }

    static async getHormonePanels(): Promise<ApiResponse<HormonePanel[]>> {
        try {
            const response = await fetch(`${this.BASE_URL}/hormone-panels/`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Accept': 'application/json'
                }
            });
            const data = await response.json();
            return { data, status: response.status };
        } catch (error) {
            return { 
                error: error instanceof Error ? error.message : 'An unknown error occurred', 
                status: 500 
            };
        }
    }

    static async getGynecologicalExams(): Promise<ApiResponse<GynecologicalExam[]>> {
        try {
            const response = await fetch(`${this.BASE_URL}/gynecological-exams/`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Accept': 'application/json'
                }
            });
            const data = await response.json();
            return { data, status: response.status };
        } catch (error) {
            return { 
                error: error instanceof Error ? error.message : 'An unknown error occurred', 
                status: 500 
            };
        }
    }
}

export default MedicalRecordService;