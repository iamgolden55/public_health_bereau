// app/hooks/useViewSwitcher.ts
'use client'

import { useToast } from "@/components/ui/use-toast"
import { useUser } from "@/app/context/user-context"
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

export const useViewSwitcher = () => {
    const router = useRouter()
    const { userData } = useUser()
    const { toast } = useToast()

    // Initialize view state with proper checks
    const [currentView, setCurrentView] = useState<'patient' | 'professional'>(() => {
        if (typeof window === 'undefined') return 'patient'
        
        const storedView = localStorage.getItem('lastActiveView')
        console.log('Initial view check:', {
            storedView,
            userDataView: userData?.last_active_view,
            hasAccess: userData?.has_professional_access
        })

        // If user has no professional access, always default to patient
        if (!userData?.has_professional_access) {
            return 'patient'
        }

        // Use stored view if valid, otherwise use user preference
        if (storedView === 'patient' || storedView === 'professional') {
            return storedView
        }

        return userData?.last_active_view || 'patient'
    })

    // Update server with view preference
    const updateServerPreference = async (view: string) => {
        try {
            const token = localStorage.getItem('token')
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user/dashboard-preference/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ view_type: view })
            })

            if (!response.ok) {
                throw new Error('Failed to update view preference')
            }
        } catch (error) {
            console.error('Server preference update failed:', error)
            // Continue anyway as this is not critical
        }
    }

    // Sync with localStorage and validate current view
    useEffect(() => {
        if (!userData) return

        const isValidView = currentView === 'patient' || 
            (currentView === 'professional' && userData.has_professional_access)

        if (!isValidView) {
            setCurrentView('patient')
            localStorage.setItem('lastActiveView', 'patient')
        } else {
            localStorage.setItem('lastActiveView', currentView)
        }
    }, [currentView, userData])

    const switchView = async (targetView: 'patient' | 'professional') => {
        console.log('Switching view:', {
            from: currentView,
            to: targetView,
            stored: localStorage.getItem('lastActiveView')
        })

        try {
            // Verify professional access for professional view
            if (targetView === 'professional' && 
                (!userData?.has_professional_access || !userData?.professional_data?.is_verified)) {
                toast({
                    title: "Access Denied",
                    description: "You don't have professional access.",
                    variant: "destructive"
                })
                return false
            }

            // Update local state
            setCurrentView(targetView)
            localStorage.setItem('lastActiveView', targetView)
            localStorage.setItem('userRole', targetView)

            // Update server preference asynchronously
            updateServerPreference(targetView).catch(console.error)

            // Show feedback to user
            toast({
                title: "Switching Views",
                description: `Redirecting to ${targetView} dashboard...`,
                duration: 2000,
            })

            // Redirect to appropriate dashboard
            router.push(`/role/${targetView}`)
            return true

        } catch (error) {
            console.error('View switch error:', error)
            // Revert on error
            setCurrentView(currentView)
            localStorage.setItem('lastActiveView', currentView)
            
            toast({
                title: "Switch Failed",
                description: "Could not switch dashboard view. Please try again.",
                variant: "destructive"
            })
            return false
        }
    }

    return { switchView, currentView }
}