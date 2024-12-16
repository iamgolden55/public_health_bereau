'use client'

import { Skeleton } from "@/components/ui/skeleton"
import { Card } from "@/components/ui/card"

export default function DashboardSkeleton() {
  return (
    <div className="flex min-h-screen flex-col lg:flex-row animate-in fade-in-0 duration-500">
      {/* Mobile Header Skeleton */}
      <header className="sticky top-0 z-20 border-b border-gray-200 bg-white p-4 lg:hidden">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-8 rounded-full bg-blue-200 animate-pulse" />
          <Skeleton className="h-8 w-40 bg-blue-200 animate-pulse" />
          <Skeleton className="h-8 w-8 rounded-full bg-blue-200 animate-pulse" />
        </div>
      </header>

      {/* Left Sidebar Skeleton */}
      <aside className="hidden lg:flex w-64 border-r border-gray-200 bg-white">
        <div className="flex h-screen flex-col p-4 w-full">
          <Skeleton className="h-10 w-40 mb-8 bg-blue-200 animate-pulse" />
          <div className="space-y-4 flex-grow">
            {[1, 2, 3, 4, 5, 6, 7].map((item) => (
              <Skeleton key={item} className="h-12 w-full rounded-full bg-blue-200 animate-pulse" />
            ))}
          </div>
          <Skeleton className="h-14 w-full rounded-full bg-red-200 animate-pulse mt-auto" />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col bg-gray-100 overflow-auto">
        {/* Desktop Header Skeleton */}
        <header className="sticky top-0 z-10 border-b border-gray-200 bg-white hidden lg:block">
          <div className="flex items-center justify-between p-4">
            <Skeleton className="h-8 w-56 bg-blue-200 animate-pulse" />
            <div className="flex items-center space-x-4">
              <Skeleton className="h-10 w-64 rounded-full bg-blue-200 animate-pulse" />
              <Skeleton className="h-10 w-10 rounded-full bg-blue-200 animate-pulse" />
              <Skeleton className="h-10 w-10 rounded-full bg-blue-200 animate-pulse" />
            </div>
          </div>
        </header>

        <div className="flex-1 p-4 space-y-6">
          {/* Greeting Skeleton */}
          <Skeleton className="h-14 w-72 bg-blue-200 animate-pulse" />

          {/* Health Summary Card Skeleton */}
          <Card className="p-6 relative overflow-hidden">
            <div className="space-y-6">
              <Skeleton className="h-10 w-56 bg-blue-200 animate-pulse" />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="space-y-2">
                    <Skeleton className="h-5 w-28 bg-blue-200 animate-pulse" />
                    <Skeleton className="h-8 w-36 bg-blue-200 animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent skeleton-shine" />
          </Card>

          {/* Upcoming Events Card Skeleton */}
          <Card className="p-6 relative overflow-hidden">
            <div className="space-y-6">
              <Skeleton className="h-10 w-72 bg-blue-200 animate-pulse" />
              <div className="space-y-4">
                {[1, 2, 3].map((event) => (
                  <div key={event} className="flex items-center space-x-4">
                    <Skeleton className="h-14 w-14 rounded-full bg-blue-200 animate-pulse" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-6 w-56 bg-blue-200 animate-pulse" />
                      <Skeleton className="h-5 w-40 bg-blue-200 animate-pulse" />
                      <Skeleton className="h-4 w-32 bg-blue-200 animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent skeleton-shine" />
          </Card>

          {/* Recent Activities Card Skeleton */}
          <Card className="p-6 relative overflow-hidden">
            <div className="space-y-6">
              <Skeleton className="h-10 w-56 bg-blue-200 animate-pulse" />
              <div className="space-y-4">
                {[1, 2].map((activity) => (
                  <div key={activity} className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12 rounded-full bg-blue-200 animate-pulse" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-6 w-48 bg-blue-200 animate-pulse" />
                      <Skeleton className="h-5 w-full max-w-md bg-blue-200 animate-pulse" />
                      <Skeleton className="h-4 w-32 bg-blue-200 animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent skeleton-shine" />
          </Card>
        </div>
      </main>

      {/* Right Sidebar Skeleton */}
      <aside className="w-full lg:w-80 border-t lg:border-l border-gray-200 bg-white p-4">
        <Card className="p-4 mb-6 relative overflow-hidden">
          <div className="space-y-4">
            <Skeleton className="h-8 w-40 bg-blue-200 animate-pulse" />
            <Skeleton className="h-24 w-full bg-blue-200 animate-pulse" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent skeleton-shine" />
        </Card>
        <div className="space-y-4">
          <Skeleton className="h-8 w-48 bg-blue-200 animate-pulse" />
          <Skeleton className="h-12 w-full rounded-full bg-blue-200 animate-pulse" />
          <Skeleton className="h-12 w-full rounded-full bg-blue-200 animate-pulse" />
        </div>
      </aside>

      <style jsx>{`
        .skeleton-shine {
          animation: shine 1.5s infinite linear;
          transform: translateX(-100%);
        }
        
        @keyframes shine {
          to {
            transform: translateX(100%);
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: .6;
          }
        }

        .animate-pulse {
          animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  )
}