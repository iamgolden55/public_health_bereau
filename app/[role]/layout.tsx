// app/[role]/layout.tsx
"use client"

import { useUser } from "@/app/context/user-context"
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useParams } from 'next/navigation'

interface RoleLayoutProps {
  children: React.ReactNode
}

export default function RoleLayout({ children }: RoleLayoutProps) {
  const router = useRouter()
  const { userData } = useUser()
  const params = useParams()
  const role = params.role as string

  useEffect(() => {
    // Guard against unauthorized access
    if (!userData) {
      router.push('/auth/login')
      return
    }

    // Check professional access for professional role
    if (role === 'professional' && 
        (!userData.has_professional_access || !userData.professional_data?.is_verified)) {
      router.push('/role/patient')
      return
    }

    // Store the current view
    localStorage.setItem('lastActiveView', role)
  }, [userData, role, router])

  return <>{children}</>
}