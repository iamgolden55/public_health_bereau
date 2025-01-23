// app/auth/login/page.tsx
'use client'

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, AlertCircle, Mail, Loader2 } from 'lucide-react'
import Link from "next/link"
import { FcGoogle } from 'react-icons/fc'
import { FaApple } from 'react-icons/fa'
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useUser } from "@/app/context/user-context"
import { useToast } from "@/components/ui/use-toast"


// Define the shape of our login response from the API
interface LoginResponse {
  access: string
  refresh: string
  user: {
    id: number
    email: string
    first_name: string
    last_name: string
    is_verified: boolean
    hpn: string
    date_of_birth: string
    role: 'professional' | 'patient'
    has_professional_access: boolean
    professional_details: {
      license_number: string
      professional_type: string
      specialization: string
      is_verified: boolean
      department?: number
      hospital?: number
    } | null
    last_active_view: 'professional' | 'patient'
  }
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000/api'

const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(); // Or any other format you prefer
}

export default function LoginPage() {
  // Get necessary functions from user context
  const { updateUserData, setUserData } = useUser()
  const { userData } = useUser();
  const router = useRouter()
  const { toast } = useToast()

  // Form state management
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)

  // Modal states for password reset and email verification
  const [resetEmail, setResetEmail] = useState("")
  const [isResettingPassword, setIsResettingPassword] = useState(false)
  const [resetSuccess, setResetSuccess] = useState(false)
  const [showResetDialog, setShowResetDialog] = useState(false)
  const [resendEmail, setResendEmail] = useState("")
  const [isResending, setIsResending] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)
  const [showResendDialog, setShowResendDialog] = useState(false)

  // Check for existing session on component mount
  useEffect(() => {
    const checkSession = async () => {
      const token = localStorage.getItem('token')
      const role = localStorage.getItem('userRole')
      
      if (token && role) {
        try {
          // Verify token is still valid and refresh user data
          await updateUserData(token)
          console.log('Existing session found, redirecting to:', `/role/${role}`)
          router.push(`/role/${role}`)
        } catch (error) {
          console.error('Session validation failed:', error)
          localStorage.clear()
        }
      }
    }

    checkSession()
  }, [router, updateUserData])

  // Main login handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/login/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        const data: LoginResponse = await response.json();
        console.log('Login response:', data);
        
        if (!response.ok) {
            throw new Error(data.error || "Login failed");
        }

        // Store tokens
        localStorage.setItem("token", data.access);
        localStorage.setItem("refresh", data.refresh);

        // Store user role and data
        localStorage.setItem("userRole", data.user.role);
        console.log('Setting user data:', data.user);
        setUserData(data.user);
        
        toast({
            title: "Login Successful",
            description: "Welcome back!",
            duration: 3000,
        });
        
        router.push(`/role/${data.user.role}`);

    } catch (err) {
        console.error('Login error:', err);
        const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
        setError(errorMessage);
        toast({
            title: "Login Failed",
            description: errorMessage,
            variant: "destructive",
        });
    } finally {
        setIsLoading(false);
    }
  };

  // Social login handler
  const handleSocialLogin = async (provider: 'google' | 'apple') => {
    setIsLoading(true)
    setError("")
    console.log(`Initiating ${provider} login...`)

    try {
      const response = await fetch(`${API_BASE_URL}/api/social-auth/${provider}/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `${provider} login failed`)
      }

      if (data.access) {
        localStorage.setItem("token", data.access)
        localStorage.setItem("refresh", data.refresh)
        
        // Update user data and get role through context
        await updateUserData(data.access)
        const role = localStorage.getItem('userRole')
        
        if (!role) {
          throw new Error("Failed to determine user role")
        }

        console.log(`${provider} login successful, redirecting to:`, `/role/${role}`)
        router.push(`/role/${role}`)
      }
    } catch (err: any) {
      console.error('Social login error:', err)
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  // Password reset handler
  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsResettingPassword(true)
    setError("")

    try {
      const response = await fetch(`${API_BASE_URL}/api/reset-password/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetEmail }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to send reset email")
      }

      setResetSuccess(true)
      setTimeout(() => {
        setShowResetDialog(false)
        setResetSuccess(false)
        setResetEmail("")
      }, 3000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsResettingPassword(false)
    }
  }

  // Email verification resend handler
  const handleResendVerification = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsResending(true)
    setError("")

    try {
      const response = await fetch(`${API_BASE_URL}/api/resend-verification/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resendEmail }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to resend verification email")
      }

      setResendSuccess(true)
      setTimeout(() => {
        setShowResendDialog(false)
        setResendSuccess(false)
        setResendEmail("")
      }, 3000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsResending(false)
    }
  }

  if (userData?.date_of_birth) {
    console.log(formatDate(userData.date_of_birth));
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-4 flex gap-1">
          <div className="h-3 w-3 rounded-full bg-red-500"></div>
          <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
          <div className="h-3 w-3 rounded-full bg-green-500"></div>
        </div>

        <Card className="rounded-3xl bg-white p-8 shadow-sm md:max-w-md mx-auto">
          <div className="flex flex-col space-y-6">
            <h1 className="text-2xl font-semibold tracking-tight text-center">Welcome Back</h1>
            <p className="text-sm text-muted-foreground text-center">Enter your email and password to log in.</p>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="remember" 
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  />
                  <label htmlFor="remember" className="text-sm text-gray-600">
                    Remember me
                  </label>
                </div>

                <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
                  <DialogTrigger asChild>
                    <Button variant="link" className="text-sm text-blue-600 hover:text-blue-500">
                      Forgot password?
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Reset Password</DialogTitle>
                      <DialogDescription>
                        Enter your email address and we'll send you a link to reset your password.
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handlePasswordReset} className="space-y-4">
                      <Input
                        type="email"
                        placeholder="Enter your email"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        required
                      />
                      <DialogFooter>
                        <Button type="submit" disabled={isResettingPassword}>
                          {isResettingPassword ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Sending...
                            </>
                          ) : resetSuccess ? (
                            <>
                              <Mail className="mr-2 h-4 w-4" />
                              Email Sent!
                            </>
                          ) : (
                            'Send Reset Link'
                          )}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              <Button
                type="submit"
                className="w-full bg-black text-white hover:bg-black/90"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  'Log In'
                )}
              </Button>

              <Dialog open={showResendDialog} onOpenChange={setShowResendDialog}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Verify Your Email</DialogTitle>
                    <DialogDescription>
                      Please verify your email address to continue. Haven't received the verification email?
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleResendVerification} className="space-y-4">
                    <Input
                      type="email"
                      placeholder="Confirm your email"
                      value={resendEmail}
                      onChange={(e) => setResendEmail(e.target.value)}
                      required
                    />
                    <DialogFooter>
                      <Button type="submit" disabled={isResending}>
                        {isResending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Sending...
                          </>
                        ) : resendSuccess ? (
                          <>
                            <Mail className="mr-2 h-4 w-4" />
                            Email Sent!
                          </>
                        ) : (
                          'Resend Verification Email'
                        )}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-muted-foreground">Or continue with</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button 
                  variant="outline"
                  onClick={() => handleSocialLogin('google')}
                >
                  <FcGoogle className="mr-2 h-4 w-4" />
                  Google
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => handleSocialLogin('apple')}
                >
                  <FaApple className="mr-2 h-4 w-4" />
                  Apple
                </Button>
              </div>

              <div className="text-center text-sm mt-4">
                Don't have an account?{" "}
                <Link href="/auth/register/" className="text-blue-600 hover:underline">
                  Sign up
                </Link>
              </div>
            </form>
          </div>
        </Card>
      </div>
    </div>
  )
}