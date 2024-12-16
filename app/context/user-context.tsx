// app/context/user-context.tsx
'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User, LoginResponse, ApiResponse, TokenResponse } from '@/app/types'

interface UserContextType {
  userData: User | null;
  setUserData: (data: User | null) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  authError: string | null;
  handleLogout: () => void;
  updateUserData: (token: string) => Promise<User>;
}

const UserContext = createContext<UserContextType | undefined>(undefined)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000/api'

export function UserProvider({ children }: { children: ReactNode }) {
  const [userData, setUserData] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState<string | null>(null)

  const storeAuthTokens = (access: string, refresh: string) => {
    console.log('Storing auth tokens...')
    localStorage.setItem('token', access)
    localStorage.setItem('refresh', refresh)
    document.cookie = `token=${access}; path=/; secure; samesite=lax; max-age=3600; domain=${window.location.hostname}`
  }

  const refreshToken = async () => {
    console.log('Attempting token refresh...')
    try {
      const refresh = localStorage.getItem('refresh')
      if (!refresh) throw new Error('No refresh token available')

      const response = await fetch(`${API_BASE_URL}/token/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh }),
      })

      if (!response.ok) throw new Error('Token refresh failed')

      const data: TokenResponse = await response.json()
      storeAuthTokens(data.access, refresh)
      return data.access
    } catch (error) {
      console.error('Token refresh error:', error)
      handleLogout()
      throw error
    }
  }

  const updateUserData = async (token: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/user/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) throw new Error('Failed to fetch user data')

      const data: User = await response.json()
      
      // Store role and user data
      if (data.role) {
        localStorage.setItem('userRole', data.role)
      }
      
      setUserData(data)
      return data
    } catch (error) {
      console.error('Error updating user data:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token')
      if (token) {
        await fetch(`${API_BASE_URL}/logout/`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Clear all storage
      localStorage.clear()
      sessionStorage.clear()
      
      // Clear cookies
      document.cookie.split(";").forEach(cookie => {
        document.cookie = cookie
          .replace(/^ +/, "")
          .replace(/=.*/, `=;expires=${new Date(0).toUTCString()};path=/`)
      })
      
      // Reset state
      setUserData(null)
      setLoading(false)
      setAuthError(null)
      
      // Redirect to login
      window.location.href = '/auth/login'
    }
  }

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('token')
        
        if (!token) {
          setLoading(false)
          return
        }

        try {
          await updateUserData(token)
        } catch (error) {
          console.log('Error with existing token, attempting refresh...')
          try {
            const newToken = await refreshToken()
            await updateUserData(newToken)
          } catch (refreshError) {
            console.error('Auth refresh failed:', refreshError)
            handleLogout()
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        setAuthError(error instanceof Error ? error.message : 'Authentication failed')
      } finally {
        setLoading(false)
      }
    }

    if (loading) {
      initializeAuth()
    }
  }, [loading])

  return (
    <UserContext.Provider
      value={{
        userData,
        setUserData,
        loading,
        setLoading,
        authError,
        handleLogout,
        updateUserData,
      }}
    >
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}