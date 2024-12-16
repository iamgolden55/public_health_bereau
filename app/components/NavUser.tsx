// app/components/NavUser.tsx

"use client"

import { useEffect, useState } from "react"
import { useRouter } from 'next/navigation'  // Changed from next/router to next/navigation
import { useUser } from "@/app/context/user-context"
import { AnimatePresence, motion } from "framer-motion"
import { useToast } from "@/components/ui/use-toast"
import { useViewSwitcher } from '@/app/hooks/useViewSwitcher'
import { AlertTriangle, BadgeCheck, Bell, ChevronsUpDown, CreditCard, LogOut, UserCog, Users, Building2, Shield, CheckCircle2, KeySquare } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Switch } from "@/components/ui/switch"

// Type definitions
type SettingsSection = 'profile' | 'billing' | 'notifications';

interface MenuItemProps {
  icon: any;
  text: string;
  color: string;
  onClick?: () => void;
  className?: string;
}

// Component definitions
const VerificationBadge = () => (
  <div className="inline-flex items-center justify-center h-5 w-5">
    <div className="rounded-full bg-blue-500">
      <BadgeCheck className="h-4 w-4 text-white" />
    </div>
  </div>
)

const MenuItem = ({ 
  icon: Icon, 
  text, 
  color, 
  onClick, 
  className = "hover:bg-gray-100 dark:hover:bg-gray-700" 
}: MenuItemProps) => {
  return (
    <DropdownMenuItem 
      className={`p-3 ${className} cursor-pointer`} 
      onClick={(e) => {
        e.preventDefault()
        onClick?.()
      }}
    >
      <Icon className={`mr-2 h-5 w-5 text-${color}-500`} />
      <span className={`text-sm font-medium ${onClick && color === 'red' 
        ? `text-${color}-600 dark:text-${color}-400`
        : "text-gray-700 dark:text-gray-300"}`}
      >
        {text}
      </span>
    </DropdownMenuItem>
  )
}


// Main NavUser component
export function NavUser({ onNavigate }: { onNavigate?: (section: string) => void }) {
  const { userData, handleLogout } = useUser()
  const { switchView, currentView } = useViewSwitcher()
  const { toast } = useToast()
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  // Updated navigation function to work with dashboard
  const navigateToSettings = (section: SettingsSection) => {
    setIsOpen(false) // Close the dropdown
    
    // If onNavigate prop is provided, use it to handle navigation
    if (onNavigate) {
      onNavigate('settings')
      
      // Use setTimeout to allow the settings view to render before scrolling
      setTimeout(() => {
        const sectionElement = document.getElementById(section)
        if (sectionElement) {
          sectionElement.scrollIntoView({ behavior: 'smooth' })
        }
      }, 100)
    }
  }

  useEffect(() => {
    console.log('NavUser Component State:', {
      userData: {
        hasProfessionalAccess: userData?.has_professional_access,
        professionalData: userData?.professional_data,
        isVerified: userData?.professional_data?.is_verified
      },
      currentView,
      isTransitioning
    })
  }, [userData, currentView, isTransitioning])

  const handleViewSwitch = async () => {
    try {
      setIsTransitioning(true)
      const newView = currentView === 'patient' ? 'professional' : 'patient'
      
      toast({
        title: "Switching View",
        description: `Changing to ${newView} dashboard...`,
        duration: 2000,
      })

      await switchView(newView)
      
      toast({
        title: "View Changed",
        description: `Now viewing as ${newView}`,
        duration: 3000,
      })
    } catch (error) {
      console.error('View switch error:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to switch dashboard view. Please try again."
      })
    } finally {
      setIsTransitioning(false)
    }
  }

  if (!userData) return null

  return (
    // Your existing JSX return content
    <div className="w-full ">
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        {/* Rest of your component JSX */}
        <DropdownMenuTrigger asChild>
          {/* Your trigger button content */}
          <motion.button 
            className="flex w-full items-center text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700/50 transition-colors duration-200"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            
            <Avatar className="h-7 w-7 ring-2 ring-blue-500 dark:ring-blue-400">
              <AvatarImage src={userData.avatar_url} alt={`${userData.first_name} ${userData.last_name}`} />
              <AvatarFallback className="bg-gradient-to-br from-blue-400 to-blue-600 text-white">
                {userData.first_name?.[0]}{userData.last_name?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 ml-3 overflow-hidden">
              <div className="flex items-center gap-1">
                <p className="truncate text-sm font-semibold">
                  {userData.first_name} {userData.last_name}
                </p>
                {userData.professional_data?.is_verified && <VerificationBadge />}
              </div>
              <div className="flex items-center">
                <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                  {userData.professional_data 
                    ? `${userData.professional_data.professional_type} - ${userData.professional_data.specialization}`
                    : userData.email}
                </p>
              </div>
            </div>
            <motion.div
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronsUpDown className="h-4 w-4 text-gray-500" />
            </motion.div>
          </motion.button>
        </DropdownMenuTrigger>

        <DropdownMenuContent 
          className="w-72 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl" 
          align="end"
          side="top"
          sideOffset={5}
        >
          {/* Your dropdown menu content */}
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
            >
              <DropdownMenuLabel className="text-gray-900 dark:text-gray-100 p-4">
                <div className="flex flex-col space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-lg">
                      {userData.first_name} {userData.last_name}
                    </span>
                    {userData.professional_data?.is_verified && <VerificationBadge />}
                  </div>
                  {userData.professional_data && (
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <Building2 className="h-4 w-4 mr-1" />
                      {userData.professional_data.hospital?.name}
                    </div>
                  )}
                </div>
              </DropdownMenuLabel>

              {userData.has_professional_access && (
                <>
                  <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
                  <div className="px-4 py-3">
                    <div className="flex flex-col space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {currentView === 'patient' ? (
                            <KeySquare className="h-5 w-5 text-blue-500" />
                          ) : (
                            <UserCog className="h-5 w-5 text-orange-500" />
                          )}
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {currentView === 'patient' ? 'Switch View' : 'Professional View'}
                          </span>
                        </div>
                        <Switch
                          checked={currentView === 'professional'}
                          onCheckedChange={handleViewSwitch}
                          disabled={isTransitioning || !userData.professional_data?.is_verified}
                          className={`transition-all duration-200 ${
                            userData.professional_data?.is_verified 
                              ? 'data-[state=checked]:bg-purple-600' 
                              : 'opacity-50 cursor-not-allowed'
                          }`}
                        />
                      </div>
                      
                      {!userData.professional_data?.is_verified && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex items-center space-x-1 text-sm text-amber-500"
                        >
                          <AlertTriangle className="h-4 w-4" />
                          <span>Verification pending</span>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </>
              )}

              <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
              <DropdownMenuGroup>
              <MenuItem 
                icon={BadgeCheck} 
                text="Profile & Account" 
                color="blue" 
                onClick={() => navigateToSettings('profile')}
              />
              <MenuItem 
                icon={CreditCard} 
                text="Billing & Plans" 
                color="purple" 
                onClick={() => navigateToSettings('billing')}
              />
              <MenuItem 
                icon={Bell} 
                text="Notifications" 
                color="yellow" 
                onClick={() => navigateToSettings('notifications')}
              />
            </DropdownMenuGroup>
              
              <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
              <MenuItem 
                icon={LogOut}
                text="Log out"
                color="red"
                onClick={handleLogout}
                className="hover:bg-red-50 dark:hover:bg-red-900/20"
              />
            </motion.div>
          </AnimatePresence>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

