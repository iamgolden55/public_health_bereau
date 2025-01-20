// app/types/medical/surgery.ts

export interface SurgeryRecord {
    id: string;
    name: string;
    date: string;
    type: string;
    hospital: string;
    surgeon: string;
    duration?: string;
    description: string;
    status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'IN_PROGRESS';
    priority: 'ELECTIVE' | 'URGENT' | 'EMERGENCY';
    operatingRoom?: string;
    created_at: string;
    updated_at: string;
  }
  
  // Define the store interface
  export interface SurgeryStore {
    // State
    surgeries: SurgeryRecord[];
    isAddModalOpen: boolean;
    isEditModalOpen: boolean;
    selectedSurgery: SurgeryRecord | null;
    loading: boolean;
    error: string | null;
  
    // Actions
    setSurgeries: (surgeries: SurgeryRecord[]) => void;
    addSurgery: (surgery: SurgeryRecord) => void;
    updateSurgery: (id: string, surgery: Partial<SurgeryRecord>) => void;
    deleteSurgery: (id: string) => void;
    setAddModalOpen: (open: boolean) => void;
    setEditModalOpen: (open: boolean) => void;
    setSelectedSurgery: (surgery: SurgeryRecord | null) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
  
    // Filtered views
    getUpcomingSurgeries: () => SurgeryRecord[];
    getPastSurgeries: () => SurgeryRecord[];
    getEmergencySurgeries: () => SurgeryRecord[];
  }