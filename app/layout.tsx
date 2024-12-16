// app/layout.tsx
'use client'

import { UserProvider } from './context/user-context'
import "./globals.css"
import LoadingScreen from './components/LoadingScreen'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { GlobalErrorBoundary } from './utils/errors/ErrorBoundary'
import { Toaster } from "@/components/ui/toaster"
import { NextUIProvider } from '@nextui-org/react'
import { Providers } from "./providers";

// RootLayoutContent remains focused on loading logic
function RootLayoutContent({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true)
  const pathname = usePathname()
  const isAuthPage = pathname?.startsWith('/auth/')

  useEffect(() => {
    if (isAuthPage) {
      setIsLoading(false)
      return
    }

    const token = localStorage.getItem('token')
    if (!token) {
      setIsLoading(false)
      return
    }

    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [isAuthPage])

  if (isLoading && !isAuthPage) {
    return <LoadingScreen />
  }

  return children
}

// Updated AppProviders to include NextUIProvider
function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <GlobalErrorBoundary>
      <UserProvider>
        <NextUIProvider>
          {children}
        </NextUIProvider>
      </UserProvider>
    </GlobalErrorBoundary>
  )
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <AppProviders>
          <RootLayoutContent>
            {children}
          </RootLayoutContent>
          <Toaster />
        </AppProviders>
      </body>
    </html>
  )
}