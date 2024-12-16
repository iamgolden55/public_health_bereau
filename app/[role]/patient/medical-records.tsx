// app/dashboard/medical-records.tsx
'use client'

import React, { useState, useRef, useEffect } from 'react' // Added React import
import { motion, AnimatePresence } from 'framer-motion'
import { useUser } from '@/app/context/user-context'
import { 
  Shield, 
  FileText, 
  Activity, 
  Pill, 
  Scissors, 
  Heart, 
  Baby, 
  Thermometer, 
  Brain, 
  Users, 
  ChevronUp, 
  ChevronDown, 
  X, 
  Menu, 
  Download,
  Lock,
  AlertCircle,
  Check,
  ShieldCheck,
  CheckCircle2,
  Zap,
  Upload,
  Plus,
  Trash2,
  Stethoscope,
  FileImage,
  Building2
} from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell 
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { 
  Label 
} from "@/components/ui/label";
import { 
  Textarea 
} from "@/components/ui/textarea";
import { 
  Card, 
  CardContent, 
  CardHeader,
  CardTitle,
  CardDescription 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input"
import { useRouter } from 'next/navigation'
import { 
  useSurgeryStore, 
  useUpcomingSurgeries, 
  usePastSurgeries 
} from '@/app/stores/surgeryStore'
import { AddSurgeryModal } from './medical-surgerymodal'
import { ViewSurgeryModal } from './ViewSurgeryModal'

// Move these components from page.tsx

const SecureVerification = ({ onVerified }) => {
    // State management for OTP digits, validation status, and loading state
    const [otp, setOtp] = useState(['', '', '', '', '', '']); // Array of 6 digits
    const [isValid, setIsValid] = useState(null);  // null = not validated, true/false for validation result
    const [isLoading, setIsLoading] = useState(false);
    const inputRefs = useRef([]); // Refs for each input field for focus management
  
    const correctOtp = '123456'; // Demo OTP - in real app, this would come from backend
  
    // Focus first input on component mount
    useEffect(() => {
      inputRefs.current[0]?.focus();
    }, []);
  
    // Handle input change in OTP fields
    const handleChange = (index, value) => {
      if (isNaN(Number(value))) return; // Only allow numbers
  
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
  
      // Auto-focus next input if value is entered
      if (value !== '' && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
  
      // Validate OTP if all digits are entered
      if (newOtp.every(digit => digit !== '')) {
        validateOtp(newOtp.join(''));
      } else {
        setIsValid(null);
      }
    };
  
    // Handle backspace key for better UX
    const handleKeyDown = (index, e) => {
      if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
        inputRefs.current[index - 1]?.focus(); // Move to previous input
      }
    };
  
    // Validate the entered OTP
    const validateOtp = (code) => {
      setIsLoading(true);
      // Simulate API call with timeout
      setTimeout(() => {
        const isValidCode = code === correctOtp;
        setIsValid(isValidCode);
        setIsLoading(false);
        if (isValidCode) {
          setTimeout(() => onVerified(), 500); // Show success animation before proceeding
        }
      }, 1500);
    };
  
    // Handle form submission
    const handleSubmit = (e) => {
      e.preventDefault();
      validateOtp(otp.join(''));
    };
  
    // Handle Logout Session
    const handleLogout = async () => {
      try {
          const token = localStorage.getItem('token');
          const refreshToken = localStorage.getItem('refresh');
  
          if (token) {
              await fetch('http://127.0.0.1:8000/api/logout/', {
                  method: 'POST',
                  headers: {
                      'Authorization': `Bearer ${token}`,
                      'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                      refresh_token: refreshToken
                  })
              });
          }
      } catch (error) {
          console.error('Logout error:', error);
      } finally {
          // Clear local storage
          localStorage.clear();
          // Redirect to login
          router.push('/auth/login');
      }
  };
  
    // Animation variants for Framer Motion
    const containerVariants = {
      hidden: { opacity: 0, y: 20 },
      visible: {
        opacity: 1,
        y: 0,
        transition: {
          duration: 0.6,
          ease: "easeOut",
          staggerChildren: 0.1
        }
      },
      exit: {
        opacity: 0,
        y: -20,
        transition: {
          duration: 0.4
        }
      }
    };
  
    const itemVariants = {
      hidden: { opacity: 0, y: 20 },
      visible: {
        opacity: 1,
        y: 0
      }
    };
    
    // Surgrey History
    
    // JSX with animations
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="w-full max-w-md mx-auto p-8 bg-white rounded-xl shadow-md dark:bg-gray-800"
      >
        {/* Header with icon */}
        <motion.div 
          variants={itemVariants}
          className="flex items-center justify-center mb-6"
        >
          <ShieldCheck className="w-8 h-8 text-[#1DA1F2] mr-2" />
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Secure Verification</h2>
        </motion.div>
        
        {/* Instructions */}
        <motion.p 
          variants={itemVariants}
          className="text-center text-gray-600 dark:text-gray-300 mb-6"
        >
          We've sent a 6-digit code to your registered mobile number for enhanced security.
        </motion.p>
  
        {/* OTP Input Form */}
        <form onSubmit={handleSubmit}>
          <motion.div 
            variants={itemVariants}
            className="flex justify-between mb-6"
          >
            {/* Generate 6 input fields for OTP */}
            {otp.map((digit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Input
                  ref={el => inputRefs.current[index] = el}
                  className="w-12 h-12 text-center text-xl font-semibold text-gray-800 dark:text-white border-2 rounded-lg focus:border-[#1DA1F2] focus:ring focus:ring-[#1DA1F2]/20 transition-all dark:bg-gray-700 dark:border-gray-600"
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  aria-label={`Digit ${index + 1}`}
                />
              </motion.div>
            ))}
          </motion.div>
  
          {/* Submit Button */}
          <motion.div 
            variants={itemVariants}
            className="relative"
          >
            <Button 
              type="submit"
              className="w-full py-3 text-white bg-[#1DA1F2] rounded-full hover:bg-[#1A8CD8] focus:outline-none focus:ring-2 focus:ring-[#1DA1F2]/50 focus:ring-opacity-50 transition-all duration-200"
              disabled={isLoading}
            >
              {isLoading ? (
                <motion.div 
                  className="flex items-center justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Verifying...
                </motion.div>
              ) : (
                <motion.div 
                  className="flex items-center justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <Lock className="w-4 h-4 mr-2" />
                  Verify Securely
                </motion.div>
              )}
            </Button>
  
            {/* Success/Error Icon */}
            <AnimatePresence>
              {isValid !== null && !isLoading && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
                    isValid ? 'text-green-500' : 'text-red-500'
                  }`}
                >
                  {isValid ? (
                    <Check className="w-6 h-6" />
                  ) : (
                    <AlertCircle className="w-6 h-6" />
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </form>
  
        {/* Error Message */}
        <AnimatePresence>
          {isValid === false && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-4 text-sm text-center text-red-500"
            >
              <AlertCircle className="inline w-4 h-4 mr-1" />
              Incorrect code. Please try again.
            </motion.p>
          )}
        </AnimatePresence>
  
        {/* Security Message */}
        <motion.p 
          variants={itemVariants}
          className="mt-6 text-xs text-center text-gray-500 dark:text-gray-400"
        >
          <Lock className="inline w-4 h-4 mr-1" />
          Your security is our top priority. We use state-of-the-art encryption to protect your data.
        </motion.p>
      </motion.div>
    );
  };


// Component to display medical records after successful verification
const RecordEntry = ({ icon, title, date, children, severity }) => {
    const getSeverityColor = (severity) => {
      switch (severity) {
        case 'normal':
          return 'bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-300';
        case 'warning':
          return 'bg-yellow-50 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300';
        case 'attention':
          return 'bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-300';
        default:
          return '';
      }
    };
  
    return (
      <div className="flex gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="flex flex-col items-center">
          <div className="w-2 h-2 rounded-full bg-blue-500 dark:bg-blue-400" />
          <div className="w-0.5 flex-1 bg-gray-200 dark:bg-gray-700" />
        </div>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
            {React.cloneElement(icon, { className: "w-4 h-4 sm:w-5 sm:h-5 text-blue-500 dark:text-blue-400" })}
            <span className="font-medium text-sm sm:text-base text-gray-900 dark:text-gray-100">{title}</span>
            <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{date}</span>
            {severity && (
              <span className={`text-xs px-2 py-0.5 rounded-full ${getSeverityColor(severity)}`}>
                {severity.charAt(0).toUpperCase() + severity.slice(1)}
              </span>
            )}
          </div>
          <Card className="p-3 sm:p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-200">
            {children}
          </Card>
        </div>
      </div>
    );
  };
  
  const MedicalRecordsContent = () => {
    const { userData, loading } = useUser();
    const { surgeries, setAddModalOpen } = useSurgeryStore()  // Add this
    const upcomingSurgeries = useUpcomingSurgeries()         // Add this
    const pastSurgeries = usePastSurgeries()                 // Add this
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("diagnosticImaging");
    const [selectedSurgeryId, setSelectedSurgeryId] = useState<string | null>(null);  // Add this
  
    // Add this function
    const handleViewDetails = (id: string) => {
      setSelectedSurgeryId(id);
    };
    
    
  
    const downloadAllRecords = () => {
      console.log("Downloading all medical records")
    }
  
    const downloadSpecificRecords = () => {
      console.log("Downloading specific medical records")
    }
  
    const fadeInVariants = {
      hidden: { opacity: 0, y: 10 },
      visible: { 
        opacity: 1, 
        y: 0,
        transition: { duration: 0.5, ease: "easeOut" }
      }
    };
  
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
      >
        {/* Header Controls */}
        <div className="flex justify-between items-center p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 relative z-50 rounded-t-xl">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost"
              size="icon"
              className="sm:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 text-xs sm:text-sm"
              onClick={downloadAllRecords}
            >
              <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              Download All
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hidden sm:flex text-xs sm:text-sm"
              onClick={downloadSpecificRecords}
            >
              <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              Download Specific
            </Button>
          </div>
          <div className="flex gap-1 sm:gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9">
              <ChevronUp className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9">
              <ChevronDown className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
  
        {/* Patient Header */}
        <div className="p-3 sm:p-4 md:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 border-b border-gray-200 dark:border-gray-700">
          <Avatar className="h-10 w-10 sm:h-12 sm:w-12 ring-2 ring-blue-500 dark:ring-blue-400">
            <AvatarFallback className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-sm sm:text-base">
            {userData?.first_name?.charAt(0)}{userData?.last_name?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <h1 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">{userData?.first_name} {userData?.last_name}</h1>
              <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900">
                <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500 dark:text-blue-400" />
                <span className="text-xs sm:text-sm font-medium text-blue-700 dark:text-blue-300">High-risk patient</span>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">Blood Type: <span className="text-xs text-green-600 dark:text-green-400 font-extrabold">{userData?.blood_type || 'Not specified'}</span> </p>
          </div>
        </div>
  
        {/* Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="w-full border-b border-gray-200 dark:border-gray-700 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
            <TabsList className="inline-flex w-max px-1 h-10 sm:h-12 items-center justify-start bg-gray-50 dark:bg-gray-800">
                {[
                  { id: 'diagnosticImaging', icon: FileText, label: 'Diagnostic Imaging' },
                  { id: 'labResults', icon: Activity, label: 'Lab Results' },
                  { id: 'medications', icon: Pill, label: 'Medications' },
                  { id: 'surgeries', icon: Scissors, label: 'Surgeries' },
                  { id: 'chronicConditions', icon: Heart, label: 'Chronic Conditions' },
                  { id: 'reproductiveHealth', icon: Baby, label: 'Reproductive Health' },
                  { id: 'vitalSigns', icon: Thermometer, label: 'Vital Signs' },
                  { id: 'preventiveCare', icon: Shield, label: 'Preventive Care' },
                  { id: 'mentalHealth', icon: Brain, label: 'Mental Health' },
                  { id: 'familyHistory', icon: Users, label: 'Family History' }
                ].map(({ id, icon: Icon, label }) => (
                  <TabsTrigger
                    key={id}
                    value={id}
                    className="flex-shrink-0 inline-flex items-center justify-center px-3 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm font-medium whitespace-nowrap rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-blue-500 dark:data-[state=active]:text-blue-400 transition-all"
                  >
                    <Icon className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline ml-2">{label}</span>
                  </TabsTrigger>
                ))}
                
                <TabsTrigger value="imaging">
                  <FileImage className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline ml-2">Imaging</span>
                </TabsTrigger>
            </TabsList>
          </div>
  
          <div className="p-3 sm:p-4 md:p-6">
          <TabsContent value="diagnosticImaging">
  <motion.div variants={fadeInVariants} initial="hidden" animate="visible">
    <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 text-gray-900 dark:text-white">
      Diagnostic Imaging Records
    </h2>
    
    {userData?.medical_records?.filter(record => record.record_type === 'IMAGING').length > 0 ? (
      userData.medical_records
        .filter(record => record.record_type === 'IMAGING')
        .map(record => (
          <RecordEntry
            key={record.id}
            icon={<FileText />}
            title={record.info} // Use info instead of description split
            date={new Date(record.date_recorded).toLocaleDateString()}
            severity="normal"
          >
            <div className="space-y-3">
              {/* Info summary badge */}
              <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 rounded-full">
                <AlertCircle className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  {record.info}
                </span>
              </div>

              {/* Full description */}
              <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
                {record.description}
              </p>

              {/* Attachment if exists */}
              {record.attachment && (
                <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded-lg w-fit">
                  <FileText className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500 dark:text-blue-400" />
                  <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                    {record.attachment}
                  </span>
                </div>
              )}
            </div>
          </RecordEntry>
        ))
    ) : (
      <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
        <FileText className="w-12 h-12 mb-4 opacity-50" />
        <p className="text-lg font-medium">No Imaging Records Found</p>
        <p className="text-sm mt-2">There are currently no diagnostic imaging records available.</p>
      </div>
    )}
  </motion.div>
</TabsContent>

            <TabsContent value="labResults">
              <motion.div variants={fadeInVariants} initial="hidden" animate="visible">
                <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 text-gray-900 dark:text-white">
                  Laboratory Test Results
                </h2>
                {userData?.medical_records?.map(record => (
                  record.lab_results?.map(lab => (
                    <RecordEntry
                      key={lab.id}
                      icon={<Activity />}
                      title={lab.test_name}
                      date={`Test Date: ${new Date(lab.test_date).toLocaleDateString()}`}
                      severity={lab.is_abnormal ? "warning" : "normal"}
                    >
                      <div className="space-y-4 text-gray-700 dark:text-gray-300">
                        {/* Lab Test Information */}
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <h4 className="font-medium mb-2">Test Information</h4>
                            <div className="space-y-1 text-sm">
                              <p><span className="font-medium">Category:</span> {lab.category}</p>
                              <p><span className="font-medium">Test Code:</span> {lab.test_code}</p>
                              <p><span className="font-medium">Performed By:</span> Dr. {lab.performed_by_name || 'Not Specified'}</p>
                              <p><span className="font-medium">Facility:</span> {record.hospital_name || 'Not Specified'}</p>
                            </div>
                          </div>
                          
                          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <h4 className="font-medium mb-2">Dates</h4>
                            <div className="space-y-1 text-sm">
                              <p><span className="font-medium">Test Date:</span> {new Date(lab.test_date).toLocaleString()}</p>
                              <p><span className="font-medium">Result Date:</span> {new Date(lab.result_date).toLocaleString()}</p>
                            </div>
                          </div>
                        </div>

                        {/* Test Results */}
                        <div className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                          <h4 className="font-medium mb-3">Results</h4>
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">Value:</span>
                              <span className={`${lab.is_abnormal ? 'text-red-600 dark:text-red-400 font-medium' : ''}`}>
                                {lab.result_value} {lab.unit}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">Reference Range:</span>
                              <span>{lab.reference_range}</span>
                            </div>
                            {lab.is_abnormal && (
                              <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg">
                                <div className="flex items-center gap-2">
                                  <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                                  <p className="text-yellow-800 dark:text-yellow-200 text-sm font-medium">
                                    Result outside normal range
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Additional Notes */}
                        {lab.notes && (
                          <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                            <div className="flex items-start gap-2">
                              <FileText className="w-4 h-4 mt-0.5 text-blue-600 dark:text-blue-400" />
                              <div>
                                <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-1">Clinical Notes</h4>
                                <p className="text-sm text-blue-800 dark:text-blue-200">{lab.notes}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </RecordEntry>
                  ))
                ))}
                {(!userData?.medical_records?.length || !userData?.medical_records?.some(record => record.lab_results?.length)) && (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
                    <Activity className="w-12 h-12 mb-4 opacity-50" />
                    <p className="text-lg font-medium">No Lab Results Found</p>
                    <p className="text-sm mt-2">There are currently no laboratory test results available.</p>
                  </div>
                )}
              </motion.div>
            </TabsContent>
              
            <TabsContent value="medications">
              <motion.div variants={fadeInVariants} initial="hidden" animate="visible">
                <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 text-gray-900 dark:text-white">
                  Current Medications
                </h2>
                {userData?.medical_records?.map(record => (
                  record.medications?.map(med => (
                    <RecordEntry
                      key={med.id}
                      icon={<Pill />}
                      title={med.name}
                      date={`Prescribed: ${new Date(med.start_date).toLocaleDateString()}`}
                      severity={med.is_active ? "normal" : "attention"}
                    >
                      <div className="space-y-4 text-gray-700 dark:text-gray-300">
                        {/* Medication Details */}
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <h4 className="font-medium mb-2">Prescription Details</h4>
                            <div className="space-y-1 text-sm">
                              <p><span className="font-medium">Dosage:</span> {med.dosage}</p>
                              <p><span className="font-medium">Route:</span> {med.route}</p>
                              <p><span className="font-medium">Frequency:</span> {med.frequency}</p>
                              <p><span className="font-medium">Status:</span> 
                                <span className={`ml-1 ${med.is_active ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                  {med.is_active ? 'Active' : 'Discontinued'}
                                </span>
                              </p>
                            </div>
                          </div>

                          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <h4 className="font-medium mb-2">Duration</h4>
                            <div className="space-y-1 text-sm">
                              <p><span className="font-medium">Start Date:</span> {new Date(med.start_date).toLocaleDateString()}</p>
                              {med.end_date && (
                                <p><span className="font-medium">End Date:</span> {new Date(med.end_date).toLocaleDateString()}</p>
                              )}
                              <p><span className="font-medium">Prescribed By:</span> Dr. {med.prescribed_by_name || 'Not Specified'}</p>
                            </div>
                          </div>
                        </div>

                        {/* Instructions */}
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                          <div className="flex items-start gap-2">
                            <FileText className="w-4 h-4 mt-0.5 text-blue-600 dark:text-blue-400" />
                            <div>
                              <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-1">Instructions</h4>
                              <p className="text-sm text-blue-800 dark:text-blue-200">{med.instructions}</p>
                            </div>
                          </div>
                        </div>

                        {/* Side Effects Warning */}
                        {med.side_effects && (
                          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg">
                            <div className="flex items-start gap-2">
                              <AlertCircle className="w-4 h-4 mt-0.5 text-yellow-600 dark:text-yellow-400" />
                              <div>
                                <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-1">Potential Side Effects</h4>
                                <p className="text-sm text-yellow-800 dark:text-yellow-200">{med.side_effects}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </RecordEntry>
                  ))
                ))}
                {(!userData?.medical_records?.length || !userData?.medical_records?.some(record => record.medications?.length)) && (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
                    <Pill className="w-12 h-12 mb-4 opacity-50" />
                    <p className="text-lg font-medium">No Medications Found</p>
                    <p className="text-sm mt-2">There are currently no medications on record.</p>
                  </div>
                )}
              </motion.div>
            </TabsContent>
              
            <TabsContent value="surgeries">
              <motion.div variants={fadeInVariants} initial="hidden" animate="visible">
                {/* Header Section */}
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                    Surgical History
                  </h2>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <FileText className="w-4 h-4 mr-2" />
                      Export Records
                    </Button>
                    <Button 
                      className="bg-black text-white" 
                      size="sm"
                      onClick={() => setAddModalOpen(true)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Surgery
                    </Button>
                  </div>
                </div>

                {/* Quick Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Total Surgeries
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{surgeries.length}</div>
                      <p className="text-xs text-muted-foreground">Lifetime procedures</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Latest Surgery
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {surgeries[0]?.name || 'None'}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {surgeries[0]?.date ? new Date(surgeries[0].date).toLocaleDateString() : 'No date'}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Recovery Status
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center">
                        <div className="text-2xl font-bold text-green-500">Complete</div>
                        <CheckCircle2 className="w-5 h-5 ml-2 text-green-500" />
                      </div>
                      <p className="text-xs text-muted-foreground">Last updated today</p>
                    </CardContent>
                  </Card>
                </div>
                  {/* Upcoming Surgeries Section */}
                {userData?.medicalprofessional && (
                  <Card className="mb-6">
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-blue-500" />
                        Upcoming Surgeries
                      </CardTitle>
                      <CardDescription>
                        Scheduled surgical procedures and preparations
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Surgery Type</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Surgeon</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {upcomingSurgeries.map((surgery) => (
                            <TableRow key={surgery.id}>
                              <TableCell className="font-medium">{surgery.name}</TableCell>
                              <TableCell>{new Date(surgery.date).toLocaleDateString()}</TableCell>
                              <TableCell>
                                <Badge className="bg-yellow-500">
                                  {surgery.status}
                                </Badge>
                              </TableCell>
                              <TableCell>{surgery.surgeon}</TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handleViewDetails(surgery.id)}
                                  >
                                    <FileText className="w-4 h-4 mr-1" />
                                    Details
                                  </Button>
                                  <Button variant="outline" size="sm">
                                    <Stethoscope className="w-4 h-4 mr-1" />
                                    Pre-op
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                )}

                {/* Past Surgeries Timeline */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                      <Scissors className="w-5 h-5 text-blue-500" />
                      Past Surgeries
                    </CardTitle>
                    <CardDescription>
                      Complete surgical history and outcomes
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                    {pastSurgeries().map((surgery) => (
                        <RecordEntry
                          key={surgery.id}
                          icon={<Scissors />}
                          title={surgery.name}
                          date={new Date(surgery.date).toLocaleDateString()}
                          severity="normal"
                        >
                          <div className="space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <h4 className="font-medium mb-2">Surgery Details</h4>
                                <div className="space-y-2 text-sm">
                                  <p><span className="font-medium">Hospital:</span> {surgery.hospital}</p>
                                  <p><span className="font-medium">Surgeon:</span> {surgery.surgeon}</p>
                                  <p><span className="font-medium">Type:</span> {surgery.type || 'Not specified'}</p>
                                  <p><span className="font-medium">Duration:</span> {surgery.duration || 'Not specified'}</p>
                                </div>
                              </div>

                              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <h4 className="font-medium mb-2">Outcome & Recovery</h4>
                                <div className="space-y-2 text-sm">
                                  <p><span className="font-medium">Status:</span> 
                                    <Badge className="ml-2 bg-green-500">{surgery.status}</Badge>
                                  </p>
                                  <p><span className="font-medium">Recovery Duration:</span> {surgery.recoveryTime || 'Not specified'}</p>
                                  <p><span className="font-medium">Follow-up Date:</span> {surgery.followUpDate || 'Not scheduled'}</p>
                                </div>
                              </div>
                            </div>

                            {surgery.description && (
                              <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                                <h4 className="font-medium mb-2 text-blue-800 dark:text-blue-200">Notes</h4>
                                <p className="text-sm text-blue-800 dark:text-blue-200">{surgery.description}</p>
                              </div>
                            )}

                            <div className="flex gap-2 mt-4">
                              <Button variant="outline" size="sm">
                                <FileText className="w-4 h-4 mr-2" />
                                View Report
                              </Button>
                              <Button variant="outline" size="sm">
                                <FileImage className="w-4 h-4 mr-2" />
                                View Images
                              </Button>
                              {userData?.medicalprofessional && (
                                <Button variant="outline" size="sm">
                                  <Building2 className="w-4 h-4 mr-2" />
                                  Hospital Records
                                </Button>
                              )}
                            </div>
                          </div>
                        </RecordEntry>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Modals */}
                <AddSurgeryModal />
                {selectedSurgeryId && (
                  <ViewSurgeryModal 
                    surgeryId={selectedSurgeryId} 
                    onClose={() => setSelectedSurgeryId(null)} 
                  />
                )}
              </motion.div>
            </TabsContent>




  
            <TabsContent value="chronicConditions">
              <motion.div variants={fadeInVariants} initial="hidden" animate="visible">
                <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 text-gray-900 dark:text-white">Chronic Conditions</h2>
                <RecordEntry
                  icon={<Heart />}
                  title="Hypertension"
                  date="Diagnosed 2 years ago"
                  severity="warning"
                >
                  <p className="text-gray-700 dark:text-gray-300 mb-2">
                    Well-controlled with medication. Regular monitoring required.
                  </p>
                </RecordEntry>
                <RecordEntry
                  icon={<Heart />}
                  title="Type 2 Diabetes"
                  date="Diagnosed 1 year ago"
                  severity="warning"
                >
                  <p className="text-gray-700 dark:text-gray-300 mb-2">
                    Managed with diet, exercise, and medication. HbA1c levels improving.
                  </p>
                </RecordEntry>
              </motion.div>
            </TabsContent>
  
            <TabsContent value="vitalSigns">
              <motion.div variants={fadeInVariants} initial="hidden" animate="visible">
                <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">Vital Signs</h2>
                <RecordEntry
                  icon={<Thermometer className="w-5 h-5 text-blue-500 dark:text-blue-400" />}
                  title="Latest Measurements"
                  date="Today, 9:30 AM"
                  severity="normal"
                >
                  <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Blood Pressure</p>
                      <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-1">120/80</p>
                      <p className="text-xs text-green-600 dark:text-green-400">Normal</p>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Heart Rate</p>
                      <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-1">72 bpm</p>
                      <p className="text-xs text-green-600 dark:text-green-400">Normal</p>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Temperature</p>
                      <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-1">98.6°F</p>
                      <p className="text-xs text-green-600 dark:text-green-400">Normal</p>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
                      <p className="text-sm text-gray-500 dark:text-gray-400">SpO2</p>
                      <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-1">98%</p>
                      <p className="text-xs text-green-600 dark:text-green-400">Normal</p>
                    </div>
                  </div>
                </RecordEntry>
              </motion.div>
            </TabsContent>
  
            <TabsContent value="preventiveCare">
              <motion.div variants={fadeInVariants} initial="hidden" animate="visible">
                <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">Preventive Care</h2>
                <RecordEntry
                  icon={<Shield className="w-5 h-5 text-green-500 dark:text-green-400" />}
                  title="Immunizations"
                  date="Last Updated: May 2024"
                  severity="normal"
                >
                  <div className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <p className="font-medium">COVID-19 Vaccination</p>
                        <div className="mt-2 space-y-1 text-sm text-gray-700 dark:text-gray-300">
                          <p>Status: Fully Vaccinated + Booster</p>
                          <p>Last Dose: March 15, 2024</p>
                          <p>Next Due: September 2024</p>
                        </div>
                      </div>
                      <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <p className="font-medium">Influenza Vaccine</p>
                        <div className="mt-2 space-y-1 text-sm text-gray-700 dark:text-gray-300">
                          <p>Status: Current</p>
                          <p>Last Dose: October 2023</p>
                          <p>Next Due: October 2024</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </RecordEntry>
              </motion.div>
            </TabsContent>
  
            <TabsContent value="mentalHealth">
              <motion.div variants={fadeInVariants} initial="hidden" animate="visible">
                <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">Mental Health</h2>
                <RecordEntry
                  icon={<Brain className="w-5 h-5 text-purple-500 dark:text-purple-400" />}
                  title="Psychological Assessment"
                  date="1 month ago"
                  severity="normal"
                >
                  <div className="space-y-4 text-gray-700 dark:text-gray-300">
                    <p className="text-sm">Routine assessment with Dr. Jessica Brown</p>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <p className="font-medium">Anxiety Assessment</p>
                        <div className="mt-2 space-y-1 text-sm">
                          <p>GAD-7 Score: 4/21</p>
                          <p>Interpretation: Minimal anxiety</p>
                          <p>Recommendation: Continue monitoring</p>
                        </div>
                      </div>
                      <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <p className="font-medium">Depression Screening</p>
                        <div className="mt-2 space-y-1 text-sm">
                          <p>PHQ-9 Score: 2/27</p>
                          <p>Interpretation: Minimal symptoms</p>
                          <p>Recommendation: Routine follow-up</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </RecordEntry>
              </motion.div>
            </TabsContent>
  
            <TabsContent value="familyHistory">
              <motion.div variants={fadeInVariants} initial="hidden" animate="visible">
                <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">Family History</h2>
                <RecordEntry
                  icon={<Users className="w-5 h-5 text-blue-500 dark:text-blue-400" />}
                  title="Maternal History"
                  date="Updated: Jan 2024"
                  severity="warning"
                >
                  <div className="space-y-4 text-gray-700 dark:text-gray-300">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <p className="font-medium">Mother (Age 65)</p>
                        <ul className="mt-2 space-y-1 text-sm">
                          <li>Hypertension (diagnosed at 45)</li>
                          <li>Type 2 Diabetes (diagnosed at 50)</li>
                          <li>Breast Cancer Survivor (diagnosed at 55)</li>
                        </ul>
                      </div>
                      <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <p className="font-medium">Maternal Grandparents</p>
                        <ul className="mt-2 space-y-1 text-sm">
                          <li>Grandmother: Stroke at 70</li>
                          <li>Grandfather: Heart Disease, died at 75</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </RecordEntry>
              </motion.div>
            </TabsContent>
  
            <TabsContent value="reproductiveHealth">
              <motion.div variants={fadeInVariants} initial="hidden" animate="visible">
                <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 text-gray-900 dark:text-white">Reproductive Health Records</h2>
                
                <RecordEntry
                  icon={<Baby />}
                  title="Gynecological Examination"
                  date="2 months ago"
                  severity="normal"
                >
                  <div className="space-y-3 text-gray-700 dark:text-gray-300">
                    <p className="text-sm sm:text-base">
                      Routine examination performed. No abnormalities detected.
                      Pap smear results normal.
                    </p>
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded-lg">
                        <FileText className="w-4 h-4 text-blue-500" />
                        <span className="text-sm">Pap_Smear_Results_20240315.pdf</span>
                      </div>
                    </div>
                  </div>
                </RecordEntry>
  
                <RecordEntry
                  icon={<Baby />}
                  title="Hormone Panel Results"
                  date="3 months ago"
                  severity="attention"
                >
                  <div className="space-y-3">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <p className="font-medium mb-2">Estrogen Levels</p>
                        <div className="space-y-1 text-sm">
                          <p>Current: 150 pg/mL</p>
                          <p>Reference Range: 30-400 pg/mL</p>
                          <p className="text-yellow-600 dark:text-yellow-400">Note: Lower end of normal range</p>
                        </div>
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <p className="font-medium mb-2">Progesterone Levels</p>
                        <div className="space-y-1 text-sm">
                          <p>Current: 8 ng/mL</p>
                          <p>Reference Range: 5-20 ng/mL</p>
                          <p className="text-green-600 dark:text-green-400">Status: Normal</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </RecordEntry>
  
                <RecordEntry
                  icon={<Baby />}
                  title="Fertility Assessment"
                  date="6 months ago"
                  severity="normal"
                >
                  <div className="space-y-3 text-gray-700 dark:text-gray-300">
                    <p className="text-sm sm:text-base">
                      Comprehensive fertility evaluation completed. Overall reproductive health is good.
                      Recommended follow-up in 12 months.
                    </p>
                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <p className="font-medium mb-2">Ovarian Reserve</p>
                        <div className="space-y-1 text-sm">
                          <p>AMH Level: 2.5 ng/mL</p>
                          <p>Follicle Count: 12</p>
                          <p className="text-green-600 dark:text-green-400">Status: Optimal Range</p>
                        </div>
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <p className="font-medium mb-2">Uterine Health</p>
                        <div className="space-y-1 text-sm">
                          <p>Endometrial Thickness: 8mm</p>
                          <p>Morphology: Normal</p>
                          <p className="text-green-600 dark:text-green-400">Status: Healthy</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </RecordEntry>
  
                <RecordEntry
                  icon={<Baby />}
                  title="Menstrual Cycle Tracking"
                  date="Ongoing"
                  severity="normal"
                >
                  <div className="space-y-3">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <p className="font-medium mb-2">Current Cycle</p>
                        <div className="space-y-1 text-sm">
                          <p>Length: 28 days</p>
                          <p>Last Period: 15 days ago</p>
                          <p>Next Expected: In 13 days</p>
                        </div>
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <p className="font-medium mb-2">Cycle Analysis</p>
                        <div className="space-y-1 text-sm">
                          <p>Average Length: 28-30 days</p>
                          <p>Regularity: Regular</p>
                          <p className="text-green-600 dark:text-green-400">Status: Normal</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </RecordEntry>
              </motion.div>
            </TabsContent>
            
          </div>
        </Tabs>
      </motion.div>
    );
  }





// Main container component that manages the OTP verification state
const MedicalRecordsSection = () => {
    const [otpVerified, setOtpVerified] = useState(false);
  
    return (
      <div className="mb-6 rounded-xl bg-white p-6 shadow dark:bg-gray-800 dark:text-white">
        <motion.h2 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 text-xl font-semibold"
        >
          Medical Records
        </motion.h2>
        <AnimatePresence mode="wait">
          {!otpVerified ? (
            <SecureVerification key="verification" onVerified={() => setOtpVerified(true)} />
          ) : (
            <MedicalRecordsContent key="records" />
          )}
        </AnimatePresence>
      </div>
    );
  };
  
  export default function MedicalRecords() {
    const [otpVerified, setOtpVerified] = useState(false);
  
    return (
      <div className="mb-6 rounded-xl bg-white p-6 shadow dark:bg-gray-800 dark:text-white">
        <motion.h2 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 text-xl font-semibold"
        >
          Medical Records
        </motion.h2>
        <AnimatePresence mode="wait">
          {!otpVerified ? (
            <SecureVerification key="verification" onVerified={() => setOtpVerified(true)} />
          ) : (
            <MedicalRecordsContent key="records" />
          )}
        </AnimatePresence>
      </div>
    );
  }