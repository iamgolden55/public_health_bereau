// app/utils/errors/ErrorFallback.tsx

import { useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { ErrorFallbackProps } from './types'

export function ErrorFallback({ error, resetError }: ErrorFallbackProps) {
  // Log error to your error reporting service
  useEffect(() => {
    // Here you would typically log to your error tracking service
    console.error('Error caught by boundary:', error)
  }, [error])

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Alert variant="destructive" className="max-w-md">
        <AlertTitle>Something went wrong</AlertTitle>
        <AlertDescription className="mt-2">
          {error.message || 'An unexpected error occurred'}
        </AlertDescription>
        <div className="mt-4 flex justify-end">
          <Button 
            variant="outline" 
            onClick={resetError}
          >
            Try again
          </Button>
        </div>
      </Alert>
    </div>
  )
}