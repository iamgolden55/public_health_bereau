// app/stores/surgeryVerificationStore.ts
import { create } from 'zustand'

export interface VerificationStatus {
  id: string
  status: 'pending' | 'in_progress' | 'verified' | 'rejected'
  documentVerification: boolean
  hospitalVerification: boolean
  surgeonVerification: boolean
  aiVerification: boolean
  doctorReview: boolean
  lastUpdated: Date
  notes?: string
  error?: string
}

interface VerificationStore {
  verifications: Record<string, VerificationStatus>
  isVerifying: boolean
  createVerification: (surgeryId: string) => void
  updateVerification: (surgeryId: string, updates: Partial<VerificationStatus>) => void
  startVerification: (surgeryId: string) => Promise<void>
  getVerificationStatus: (surgeryId: string) => VerificationStatus | null
  setVerifying: (status: boolean) => void
}

export const useVerificationStore = create<VerificationStore>((set, get) => ({
  verifications: {},
  isVerifying: false,

  createVerification: (surgeryId: string) => {
    set((state) => ({
      verifications: {
        ...state.verifications,
        [surgeryId]: {
          id: surgeryId,
          status: 'pending',
          documentVerification: false,
          hospitalVerification: false,
          surgeonVerification: false,
          aiVerification: false,
          doctorReview: false,
          lastUpdated: new Date(),
        },
      },
    }))
  },

  updateVerification: (surgeryId: string, updates: Partial<VerificationStatus>) => {
    set((state) => ({
      verifications: {
        ...state.verifications,
        [surgeryId]: {
          ...state.verifications[surgeryId],
          ...updates,
          lastUpdated: new Date(),
        },
      },
    }))
  },

  startVerification: async (surgeryId: string) => {
    const { updateVerification, setVerifying } = get()
    setVerifying(true)

    try {
      // Start document verification
      updateVerification(surgeryId, { status: 'in_progress' })
      
      // Simulate document verification
      await new Promise(resolve => setTimeout(resolve, 1500))
      updateVerification(surgeryId, { documentVerification: true })

      // Simulate hospital verification
      await new Promise(resolve => setTimeout(resolve, 1000))
      updateVerification(surgeryId, { hospitalVerification: true })

      // Simulate surgeon verification
      await new Promise(resolve => setTimeout(resolve, 1000))
      updateVerification(surgeryId, { surgeonVerification: true })

      // Simulate AI analysis
      await new Promise(resolve => setTimeout(resolve, 2000))
      updateVerification(surgeryId, { aiVerification: true })

      // Update final status
      updateVerification(surgeryId, { 
        status: 'verified',
        doctorReview: true,
        notes: 'All verifications completed successfully'
      })

    } catch (error) {
      updateVerification(surgeryId, { 
        status: 'rejected',
        error: error instanceof Error ? error.message : 'Verification failed'
      })
    } finally {
      setVerifying(false)
    }
  },

  getVerificationStatus: (surgeryId: string) => {
    const state = get()
    return state.verifications[surgeryId] || null
  },

  setVerifying: (status: boolean) => {
    set({ isVerifying: status })
  },
}))