// app/components/LoadingScreen.tsx
'use client'

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-white dark:bg-gray-900 flex items-center justify-center z-50">
      <div className="flex flex-col items-center space-y-4">
        {/* You can customize this animation */}
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-600 dark:text-gray-300">Loading your healthcare dashboard...</p>
      </div>
    </div>
  )
}