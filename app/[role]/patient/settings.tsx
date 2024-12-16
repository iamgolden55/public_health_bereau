import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { useUser } from '@/app/context/user-context'
import { cn } from "@/lib/utils"
import {
  Check,
  X,
  Eye,
  EyeOff,
  AlertCircle,
  Camera,
  Settings2,
  Shield
} from 'lucide-react'
import { 
  Alert,
  AlertDescription 
} from "@/components/ui/alert"

const passwordValidations = {
  minLength: 8,
  hasUpperCase: /[A-Z]/,
  hasLowerCase: /[a-z]/,
  hasNumber: /[0-9]/,
  hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/
}

const tabVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 }
}

interface TabItem {
  id: string;
  label: string;
  count?: number;
  icon: React.ElementType;
}

export default function SettingsPage() {
  const { userData, setUserData } = useUser()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState('password')
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  // Form states
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const [profileForm, setProfileForm] = useState({
    firstName: userData?.first_name || '',
    lastName: userData?.last_name || '',
    email: userData?.email || '',
    phone: userData?.phone || ''
  })

  // Tabs configuration
  const tabs: TabItem[] = [
    { id: 'my-details', label: 'My details', icon: Settings2 },
    { id: 'profile', label: 'Profile', icon: Camera },
    { id: 'password', label: 'Password', icon: Shield },
    { id: 'team', label: 'Team', count: 48, icon: Settings2 },
    { id: 'plan', label: 'Plan', icon: Settings2 },
    { id: 'billing', label: 'Billing', icon: Settings2 },
    { id: 'email', label: 'Email', icon: Settings2 },
    { id: 'integrations', label: 'Integrations', icon: Settings2 },
    { id: 'api', label: 'API', icon: Settings2 }
  ]

  // Password validation
  const validatePassword = (password: string) => {
    const errors = []
    if (password.length < passwordValidations.minLength) {
      errors.push(`Password must be at least ${passwordValidations.minLength} characters`)
    }
    if (!passwordValidations.hasUpperCase.test(password)) {
      errors.push('Password must contain an uppercase letter')
    }
    if (!passwordValidations.hasLowerCase.test(password)) {
      errors.push('Password must contain a lowercase letter')
    }
    if (!passwordValidations.hasNumber.test(password)) {
      errors.push('Password must contain a number')
    }
    if (!passwordValidations.hasSpecialChar.test(password)) {
      errors.push('Password must contain a special character')
    }
    return errors
  }

  // Handle password update
  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Validate passwords
    const errors = validatePassword(passwordForm.newPassword)
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.push('Passwords do not match')
    }
    
    if (errors.length > 0) {
      setValidationErrors(errors)
      setIsLoading(false)
      return
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      toast({
        title: "Password updated",
        description: "Your password has been successfully updated.",
      })

      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
      setValidationErrors([])
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update password. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle profile update
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      if (avatarFile) {
        // Handle avatar upload
        console.log('Uploading avatar:', avatarFile)
      }

      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle avatar change
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAvatarFile(file)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="relative h-40 bg-gradient-to-r from-blue-400 via-purple-400 to-orange-400">
        <div className="absolute -bottom-12 left-8">
          <div className="relative group">
            <Avatar className="h-24 w-24 border-4 border-white">
              {avatarFile ? (
                <AvatarImage src={URL.createObjectURL(avatarFile)} />
              ) : (
                <>
                  <AvatarImage src={userData?.avatar} />
                  <AvatarFallback className="bg-blue-500 text-white text-xl">
                    {userData?.first_name?.[0]}{userData?.last_name?.[0]}
                  </AvatarFallback>
                </>
              )}
            </Avatar>
            <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-full">
              <Camera className="w-6 h-6 text-white" />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </label>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-8 pt-16">
        <div className="mb-4">
          <h1 className="text-2xl font-semibold">Settings</h1>
          <p className="text-gray-500">{userData?.email}</p>
        </div>

        {/* Navigation Tabs */}
        <nav className="border-b mb-8">
          <div className="flex space-x-8">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "pb-4 relative flex items-center space-x-2",
                  activeTab === tab.id
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                )}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.count && (
                  <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </nav>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial="initial"
            animate="animate"
            exit="exit"
            variants={tabVariants}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'password' && (
              <div className="max-w-xl">
                <h2 className="text-lg font-medium mb-6">Password</h2>
                <p className="text-gray-500 mb-8">
                  Please enter your current password to change your password.
                </p>

                <form onSubmit={handlePasswordUpdate} className="space-y-6">
                  {validationErrors.length > 0 && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        <ul className="list-disc list-inside">
                          {validationErrors.map((error, index) => (
                            <li key={index}>{error}</li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Current password
                    </label>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm(prev => ({
                          ...prev,
                          currentPassword: e.target.value
                        }))}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-500" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-500" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      New password
                    </label>
                    <Input
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) => {
                        setPasswordForm(prev => ({
                          ...prev,
                          newPassword: e.target.value
                        }))
                        setValidationErrors(validatePassword(e.target.value))
                      }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm new password
                    </label>
                    <Input
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm(prev => ({
                        ...prev,
                        confirmPassword: e.target.value
                      }))}
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <motion.div
                        className="flex items-center"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <RefreshCcw className="w-4 h-4 mr-2" />
                        Updating...
                      </motion.div>
                    ) : (
                      "Update password"
                    )}
                  </Button>
                </form>
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="max-w-xl">
                <h2 className="text-lg font-medium mb-6">Profile</h2>
                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        First name
                      </label>
                      <Input
                        value={profileForm.firstName}
                        onChange={(e) => setProfileForm(prev => ({
                          ...prev,
                          firstName: e.target.value
                        }))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last name
                      </label>
                      <Input
                        value={profileForm.lastName}
                        onChange={(e) => setProfileForm(prev => ({
                          ...prev,
                          lastName: e.target.value
                        }))}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <Input
                      type="email"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm(prev => ({
                        ...prev,
                        email: e.target.value
                      }))}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <Input
                      type="tel"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm(prev => ({
                        ...prev,
                        phone: e.target.value
                      }))}
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <motion.div
                        className="flex items-center"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <RefreshCcw className="w-4 h-4 mr-2" />
                        Updating...
                      </motion.div>
                    ) : (
                      "Update profile"
                    )}
                  </Button>
                </form>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}