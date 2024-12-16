'use client'

import { LoadingProvider } from './loading-context'

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <LoadingProvider>
      {children}
    </LoadingProvider>
  )
}