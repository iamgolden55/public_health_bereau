import { useState, useEffect } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { useUser } from '@/app/context/user-context'
import { Verified } from 'lucide-react'
import { cn } from "@/lib/utils"

export default function Settings() {
  const { userData, setUserData } = useUser()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("details")

  // Form states for each section
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const tabs = [
    { id: 'details', label: 'My details' },
    { id: 'profile', label: 'Profile' },
    { id: 'password', label: 'Password' },
    { id: 'team', label: 'Team', count: '48' },
    { id: 'plan', label: 'Plan' },
    { id: 'billing', label: 'Billing' },
    { id: 'email', label: 'Email' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'integrations', label: 'Integrations' },
    { id: 'api', label: 'API' },
  ]

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          current_password: passwordForm.currentPassword,
          new_password: passwordForm.newPassword
        })
      })

      if (!response.ok) throw new Error('Update failed')

      toast({
        title: "Password updated",
        description: "Your password has been changed successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update password. Please try again.",
        variant: "destructive"
      })
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header with avatar and title */}
      <div className="border-b">
        <div className="max-w-[1200px] mx-auto p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative">
              <Avatar className="h-16 w-16 rounded-full border-2 border-white shadow-lg">
                <AvatarFallback className="bg-blue-100 text-blue-600">
                  {userData?.first_name?.[0]}{userData?.last_name?.[0]}
                </AvatarFallback>
              </Avatar>
              <Verified className="absolute bottom-0 right-0 text-blue-500 h-5 w-5 bg-white rounded-full" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">Settings</h1>
              <p className="text-gray-500">{userData?.email}</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex items-center space-x-6 text-sm">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "relative py-4 text-gray-500 hover:text-gray-800 transition-colors",
                  activeTab === tab.id && "text-gray-800"
                )}
              >
                <div className="flex items-center gap-2">
                  {tab.label}
                  {tab.count && (
                    <span className="bg-gray-100 px-2 py-0.5 rounded-full text-xs">
                      {tab.count}
                    </span>
                  )}
                </div>
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-800" />
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content area */}
      <div className="max-w-[1200px] mx-auto p-6">
        {activeTab === 'password' && (
          <div className="max-w-xl">
            <h2 className="text-base font-medium mb-1">Password</h2>
            <p className="text-sm text-gray-500 mb-6">
              Please enter your current password to change your password.
            </p>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Current password
                </label>
                <Input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm(prev => ({
                    ...prev,
                    currentPassword: e.target.value
                  }))}
                  className="max-w-md"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  New password
                </label>
                <Input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm(prev => ({
                    ...prev,
                    newPassword: e.target.value
                  }))}
                  className="max-w-md"
                />
                <div className="text-xs text-gray-500 mt-1">
                  Your new password must be more than 8 characters.
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Confirm new password
                </label>
                <Input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm(prev => ({
                    ...prev,
                    confirmPassword: e.target.value
                  }))}
                  className="max-w-md"
                />
              </div>

              <Button 
                type="submit" 
                className="mt-6"
                disabled={!passwordForm.currentPassword || 
                  !passwordForm.newPassword || 
                  !passwordForm.confirmPassword}
              >
                Save password
              </Button>
            </form>
          </div>
        )}

        {/* Implement other tab content sections similarly */}
      </div>
    </div>
  )
}