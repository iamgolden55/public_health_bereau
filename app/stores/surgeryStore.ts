// app/stores/surgeryStore.ts

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { SurgeryStore, SurgeryRecord } from '@/app/types/medical/surgery'

export const useSurgeryStore = create<SurgeryStore>()(
  persist(
    (set, get) => ({
      // Initial state
      surgeries: [],
      isAddModalOpen: false,
      isEditModalOpen: false,
      selectedSurgery: null,
      loading: false,
      error: null,

      // Actions
      setSurgeries: (surgeries) => set({ surgeries }),

      addSurgery: (surgery) => 
        set((state) => ({ 
          surgeries: [...state.surgeries, {
            ...surgery,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }] 
        })),

      updateSurgery: (id, updatedSurgery) =>
        set((state) => ({
          surgeries: state.surgeries.map((surgery) =>
            surgery.id === id 
              ? { ...surgery, ...updatedSurgery, updated_at: new Date().toISOString() } 
              : surgery
          ),
        })),

      deleteSurgery: (id) =>
        set((state) => ({
          surgeries: state.surgeries.filter((surgery) => surgery.id !== id),
        })),

      setAddModalOpen: (open) => set({ isAddModalOpen: open }),
      setEditModalOpen: (open) => set({ isEditModalOpen: open }),
      setSelectedSurgery: (surgery) => set({ selectedSurgery: surgery }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),

      // Filtered views
      getUpcomingSurgeries: () => {
        const state = get();
        const now = new Date();
        return state.surgeries.filter(
          (surgery) => 
            new Date(surgery.date) > now && 
            surgery.status === 'SCHEDULED'
        );
      },

      getPastSurgeries: () => {
        const state = get();
        const now = new Date();
        return state.surgeries.filter(
          (surgery) => 
            new Date(surgery.date) <= now || 
            surgery.status === 'COMPLETED'
        );
      },

      getEmergencySurgeries: () => {
        const state = get();
        return state.surgeries.filter(
          (surgery) => 
            surgery.priority === 'EMERGENCY' &&
            surgery.status !== 'COMPLETED'
        );
      },
    }),
    {
      name: 'surgery-store',
      version: 1,
      storage: {
        getItem: (name) => {
          try {
            const serializedState = localStorage.getItem(name);
            if (!serializedState) return null;
            return JSON.parse(serializedState);
          } catch (err) {
            console.error('Error loading surgery store:', err);
            return null;
          }
        },
        setItem: (name, value) => {
          try {
            localStorage.setItem(name, JSON.stringify(value));
          } catch (err) {
            console.error('Error saving surgery store:', err);
          }
        },
        removeItem: (name) => localStorage.removeItem(name),
      },
    }
  )
);

// Type-safe selector hooks
export const useUpcomingSurgeries = () => 
  useSurgeryStore(state => state.getUpcomingSurgeries);

export const usePastSurgeries = () => 
  useSurgeryStore(state => state.getPastSurgeries);

export const useEmergencySurgeries = () => 
  useSurgeryStore(state => state.getEmergencySurgeries);
