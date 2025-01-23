// app/context/user-context.tsx
'use client'

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'
import { User, LoginResponse, ApiResponse,  } from '@/app/types'

interface TokenResponse {
  access: string;
  refresh: string;
}

interface UserContextType {
  userData: User | null;
  setUserData: (data: User | null) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  authError: string | null;
  handleLogout: () => void;
  updateUserData: (token: string) => Promise<User | null>;
  clearUserData: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000/api'

export function UserProvider({ children }: { children: ReactNode }) {
  const [userData, setUserData] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState<string | null>(null)

  const clearUserData = useCallback(() => {
    setUserData(null)
    localStorage.removeItem('token')
    localStorage.removeItem('refresh')
    localStorage.removeItem('userRole')
  }, [])

  const storeAuthTokens = (access: string, refresh: string) => {
    console.log('Storing auth tokens...')
    localStorage.setItem('token', access)
    localStorage.setItem('refresh', refresh)
    document.cookie = `token=${access}; path=/; secure; samesite=lax; max-age=3600; domain=${window.location.hostname}`
  }

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token')
      if (token) {
        await fetch(`${API_BASE_URL}/api/logout/`, {
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
      clearUserData()
      // Reset state
      setLoading(false)
      setAuthError(null)
      // Redirect to login
      window.location.href = '/auth/login'
    }
  }

  const refreshToken = async () => {
    console.log('Attempting token refresh...')
    try {
      const refresh = localStorage.getItem('refresh')
      if (!refresh) throw new Error('No refresh token available')

      const response = await fetch(`${API_BASE_URL}/api/token/refresh/`, {
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

  const updateUserData = useCallback(async (token: string): Promise<User | null> => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/user/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        throw new Error(errorData.error || 'Failed to fetch user data');
      }

      const userData = await response.json();
      
      if (userData.role) {
        localStorage.setItem('userRole', userData.role);
      }
      
      setUserData(userData);
      return userData;
    } catch (error) {
      console.error('Error updating user data:', error);
      clearUserData();
      throw error;
    } finally {
      setLoading(false);
    }
  }, [clearUserData]);

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
  }, [loading, updateUserData, refreshToken, handleLogout])

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
        clearUserData,
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