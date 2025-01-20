// app/[role]/patient/page.tsx  This is the main Dashboard page file
'use client'

import { useState, useEffect, useRef } from "react"
import React from "react"
import axios from 'axios';
import { Bell, Calendar, Home, Mail, Moon, Phone, Search, Settings, Sun, User, Video, MessageCircle, Menu, X, ChevronRight, FileText, Lock, Maximize2, Minimize2, Send, Copy, ThumbsUp, ThumbsDown, CreditCard, Plus, Check, AlertCircle, ShieldCheck,MessageSquareQuote,Tv, 
  Activity, 
  Pill, 
  Scissors,
  Inbox,
  CalendarClock,
  HeartPulse,
  Fingerprint,
  GraduationCap,
  UsersRound, 
  Heart, 
  Baby, 
  Thermometer, 
  Shield, 
  Brain, 
  Users, 
  ChevronUp, 
  ChevronDown,
  Power, 
  Zap,
  Hash,
  Download,
  Info
} from "lucide-react"
import Link from "next/link"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { motion, AnimatePresence } from 'framer-motion'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import TwitterStyleMedicalSettings from './settings'  // if it's in the app folder
import HealthVideoLibrary from "./HealthVideoLibrary"
import TicketSelector from "./ticket-selector";
import HeartRate from "./gp-usage"
import { HealthRhythmCard, MedicationEfficacyCard } from './creative-medical-cards'
import Emergency from "./emergency"
import Appointments from "./appointments"
import { Pagination } from "@/components/ui/pagination"
import Consultation from "./consultation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import DashboardSkeleton from "./dashboard-skeleton"
import Messages from "./chat"
import { useRouter } from 'next/navigation';
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { Textarea } from "@/components/ui/textarea"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import MedicalRecords from './medical-records'
import { NavUser } from '@/app/components/NavUser'
import { useUser } from '@/app/context/user-context'
import DelightfulHealthChat from '@/app/components/HealthAIChat';
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip"


const healthTips = [
  "Remember to stay hydrated and get at least 30 minutes of exercise daily for optimal health.",
  "Incorporate a variety of colorful fruits and vegetables into your diet for essential nutrients.",
  "Practice mindfulness or meditation for 10 minutes daily to reduce stress and improve mental health.",
  "Aim for 7-9 hours of quality sleep each night to support overall health and cognitive function.",
  "Take regular breaks from screens to reduce eye strain and improve posture.",
  "Stay up to date with your vaccinations and schedule regular check-ups with your healthcare provider.",
  "Practice good hand hygiene by washing your hands frequently with soap and water.",
  "Limit processed foods and added sugars in your diet to maintain a healthy weight.",
  "Engage in activities you enjoy to boost your mood and mental well-being.",
  "Stay socially connected with friends and family to support your emotional health.",
  "Maintain a balanced diet rich in whole grains, lean proteins, and healthy fats.",
  "Drink alcohol in moderation, if at all, to reduce health risks associated with excessive consumption.",
  "Avoid smoking and using tobacco products to lower the risk of chronic diseases.",
  "Protect your skin from the sun by using sunscreen and wearing protective clothing.",
  "Incorporate both aerobic and strength-training exercises into your fitness routine.",
  "Practice good dental hygiene by brushing twice daily and flossing regularly.",
  "Manage stress through activities like yoga, meditation, or deep-breathing exercises.",
  "Keep your living spaces clean to reduce allergens and prevent illnesses.",
  "Stay informed about your family's medical history to anticipate potential health risks.",
  "Ensure adequate vitamin D intake through sunlight exposure or supplements if necessary.",
  "Limit your sodium intake to maintain healthy blood pressure levels.",
  "Include probiotics in your diet to support a healthy gut microbiome.",
  "Engage in mentally stimulating activities like reading or puzzles to keep your mind sharp.",
  "Practice safe sex to prevent sexually transmitted infections.",
  "Avoid prolonged sitting; take regular breaks to stand or walk around.",
  "Stay hydrated by drinking plenty of water throughout the day.",
  "Monitor your blood pressure and cholesterol levels regularly.",
  "Wear seat belts and helmets to reduce the risk of injury in accidents.",
  "Limit caffeine intake to avoid sleep disturbances and anxiety.",
  "Keep vaccinations up to date, including annual flu shots.",
  "Maintain good posture to prevent back and neck pain.",
  "Wash fruits and vegetables thoroughly before consumption.",
  "Avoid exposure to secondhand smoke.",
  "Use appropriate protective gear during sports and physical activities.",
  "Eat smaller, more frequent meals to maintain steady energy levels.",
  "Limit red meat consumption and opt for plant-based proteins when possible.",
  "Include omega-3 fatty acids in your diet for heart and brain health.",
  "Keep emergency contacts and medical information easily accessible.",
  "Use antibiotics responsibly to prevent antibiotic resistance.",
  "Schedule regular eye examinations to maintain good vision.",
  "Practice gratitude and positive thinking to enhance mental well-being.",
  "Protect your hearing by limiting exposure to loud noises.",
  "Engage in community activities to foster social connections.",
  "Choose stairs over elevators to increase daily physical activity.",
  "Prepare meals at home to control ingredients and portion sizes.",
  "Limit screen time before bed to improve sleep quality.",
  "Get regular screenings for cancers relevant to your age and gender.",
  "Maintain a healthy weight to reduce the risk of chronic diseases.",
  "Use proper lifting techniques to prevent injuries.",
  "Apply insect repellent to protect against mosquito-borne illnesses.",
  "Stay informed about public health advisories in your area.",
  "Include fiber-rich foods in your diet to support digestive health.",
  "Be mindful of alcohol consumption and adhere to recommended guidelines.",
  "Manage chronic conditions with the guidance of healthcare professionals.",
  "Practice deep-breathing exercises to improve lung capacity.",
  "Spend time outdoors to boost mood and vitamin D levels.",
  "Ensure ergonomic setups at work to prevent strain injuries.",
  "Track your health metrics like weight and activity levels.",
  "Use natural lighting when possible to enhance mood.",
  "Practice portion control to avoid overeating.",
  "Read nutrition labels to make informed food choices.",
  "Improve indoor air quality with plants and proper ventilation.",
  "Include stretching in your routine to enhance flexibility.",
  "Avoid distracted eating to prevent overconsumption.",
  "Schedule regular health check-ups even when feeling well.",
  "Add nuts and seeds to your diet for healthy fats and nutrients.",
  "Avoid late-night meals to improve digestion and sleep.",
  "Use stress management techniques during challenging times.",
  "Stay hydrated during travel to prevent dehydration.",
  "Monitor your mental health and seek support when needed.",
  "Reduce blue light exposure from screens in the evening.",
  "Practice safe food handling to prevent foodborne illnesses.",
  "Incorporate legumes into your diet for protein and fiber.",
  "Stay active during the day to promote better sleep at night.",
  "Practice mindfulness to stay present and reduce anxiety.",
  "Encourage healthy habits within your family.",
  "Update vaccinations, especially when planning to travel.",
  "Consult healthcare providers before starting new supplements.",
  "Combine socializing with physical activities like group walks.",
  "Balance work and personal life to prevent burnout.",
  "Seek professional help for mental health concerns.",
  "Practice safe driving habits to reduce the risk of accidents.",
  "Stay informed about health trends but consult professionals before making changes.",
  "Wear supportive footwear to prevent foot and back problems.",
  "Consume antioxidant-rich foods like berries and leafy greens.",
  "Limit exposure to environmental pollutants when possible.",
  "Cover your mouth when coughing to practice good respiratory hygiene.",
  "Be aware of medication side effects and interactions.",
  "Engage in activities that promote brain health, such as learning a new skill.",
  "Avoid self-diagnosing; consult healthcare professionals for concerns.",
  "Be mindful of portion sizes when eating out.",
  "Keep tetanus and other booster shots current.",
  "Practice time management to reduce stress levels.",
  "Nurture healthy relationships for emotional support.",
  "Avoid fad diets; focus on sustainable, balanced eating habits.",
  "Take regular breaks during work to prevent mental fatigue.",
  "Stay updated on recommended health screenings for your age group.",
  "Practice financial wellness to reduce stress related to finances.",
  "Follow hygiene practices like regular handwashing to prevent illness.",
  "Familiarize yourself with basic first aid and emergency procedures."
];


const upcomingEvents = [
  {
    id: 1,
    name: "St. Maria Hospitals and Group",
    description: "Optimal Eye Care CheckUp",
    date: "Monday, September 22",
    color: "blue"
  },
  {
    id: 2,
    name: "Hannah Grey's Foundation",
    description: "USG + Consultation",
    date: "Friday, September 20",
    color: "purple"
  },
  {
    id: 3,
    name: "City General Hospital",
    description: "Annual Physical Examination",
    date: "Wednesday, September 25",
    color: "green"
  },
  {
    id: 4,
    name: "Dental Clinic",
    description: "Routine Dental Checkup",
    date: "Thursday, September 26",
    color: "yellow"
  }
]

interface Message {
  id: number
  content: string
  timestamp: string
  type: 'sent' | 'received'
  language?: string
  code?: string
}

const initialMessages: Message[] = [
  {
    id: 1,
    content: "Hello! How can I assist you today?",
    timestamp: "8:45 PM",
    type: 'received'
  },
  {
    id: 2,
    content: "I need help with setting up a medical consultation.",
    timestamp: "8:47 PM",
    type: 'sent'
  },
  {
    id: 3,
    content: "I'll help you schedule a consultation. Here's a code snippet for the booking system:",
    timestamp: "8:48 PM",
    type: 'received',
    language: 'javascript',
    code: `function bookConsultation(doctorId, date) {
  return fetch('/api/consultations', {
    method: 'POST',
    body: JSON.stringify({ doctorId, date }),
    headers: {
      'Content-Type': 'application/json'
    }
  }).then(res => res.json())
}`
  }
]

export default function Dashboard() {
  
  const router = useRouter();
  const { userData, loading, handleLogout } = useUser();
  //const [userData, setUserData] = useState<UserData | null>(null);
  //const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  

  const [darkMode, setDarkMode] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [currentTip, setCurrentTip] = useState(healthTips[0])
  const [activeSection, setActiveSection] = useState('home')
  const [isLoading, setIsLoading] = useState(true)

  
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [newMessage, setNewMessage] = useState("")
  const [isExpanded, setIsExpanded] = useState(false)
  const [activeTab, setActiveTab] = useState("JS")

  const [copySuccess, setCopySuccess] = useState(false);
  const [shownTips, setShownTips] = useState<string[]>([])

  useEffect(() => {
    const isDarkMode = localStorage.getItem('darkMode') === 'true' || 
      (!('darkMode' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
    setDarkMode(isDarkMode)

    // Simulate loading data
    setTimeout(() => setIsLoading(false), 2000)
  }, [])
  

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('darkMode', darkMode.toString())
  }, [darkMode])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTip(prevTip => {
        // Filter out already shown tips
        let availableTips = healthTips.filter(tip => 
          !shownTips.includes(tip) && tip !== prevTip
        )

        // If all tips have been shown, reset the shown tips array
        if (availableTips.length === 0) {
          setShownTips([prevTip])
          availableTips = healthTips.filter(tip => tip !== prevTip)
        }

        // Get random tip from available ones
        const randomIndex = Math.floor(Math.random() * availableTips.length)
        const newTip = availableTips[randomIndex]
        
        // Add new tip to shown tips
        setShownTips(prev => [...prev, newTip])
        
        return newTip
      })
    }, 60000)

    return () => clearInterval(interval)
  }, [])

  const toggleDarkMode = () => setDarkMode(!darkMode)
  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen)

  if (isLoading) {
    return <DashboardSkeleton />
  }
  
  // Add this with your other state hooks
  const handleNavigation = (section: string) => {
    setActiveSection(section)
    // If you're using mobile menu, you might want to close it
    setMobileMenuOpen(false)
  }

  const NavLink = ({ href, icon: Icon, children }) => {
    const isActive = activeSection === href.slice(1)
    return (
      <Link
        href={href}
        className={`flex items-center rounded-full p-3 text-gray-700 hover:bg-blue-50 hover:text-blue-500 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-blue-400 ${
          isActive ? 'bg-blue-50 text-blue-500 dark:bg-gray-700 dark:text-blue-400' : ''
        }`}
        onClick={() => {
          setActiveSection(href.slice(1))
          setMobileMenuOpen(false)
        }}
        aria-current={isActive ? 'page' : undefined}
      >
        <Icon className="mr-4 h-6 w-6" />
        <span className="text-lg">{children}</span>
      </Link>
    )
  }

  const getSectionTitle = (section) => {
    switch (section) {
      case 'home':
        return (
          <div className="flex justify-center">
            <motion.span 
              className="text-4xl font-thin tracking-wide"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
              style={{
                background: "linear-gradient(-45deg, #FF1B6B, #45CAFF, #FF1B6B, #45CAFF)",
                backgroundSize: "200% 200%",
                animation: "gradient 3s ease infinite",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
             Dashboard
              <style jsx>{`
                @keyframes gradient {
                  0% { background-position: 0% 50% }
                  50% { background-position: 100% 50% }
                  100% { background-position: 0% 50% }
                }
              `}</style>
            </motion.span>
          </div>
        )
      case 'appointments':
        return (
          <div className="flex justify-center">
            <motion.span 
              className="text-4xl font-thin tracking-wide"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
              style={{
                background: "linear-gradient(-45deg, #FF1B6B, #45CAFF, #FF1B6B, #45CAFF)",
                backgroundSize: "200% 200%",
                animation: "gradient 3s ease infinite",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
             Appointment
              <style jsx>{`
                @keyframes gradient {
                  0% { background-position: 0% 50% }
                  50% { background-position: 100% 50% }
                  100% { background-position: 0% 50% }
                }
              `}</style>
            </motion.span>
          </div>
        )
      case 'messages':
        return (
          <div className="flex justify-center">
            <motion.span 
              className="text-4xl font-thin tracking-wide"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
              style={{
                background: "linear-gradient(-45deg, #FF1B6B, #45CAFF, #FF1B6B, #45CAFF)",
                backgroundSize: "200% 200%",
                animation: "gradient 3s ease infinite",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
             Elara AI
              <style jsx>{`
                @keyframes gradient {
                  0% { background-position: 0% 50% }
                  50% { background-position: 100% 50% }
                  100% { background-position: 0% 50% }
                }
              `}</style>
            </motion.span>
          </div>
        )
      case 'video-health-tips': return 'Video Health Tips'
      case 'chat-consultant': return 'Chat with a Consultant'
      case 'medical-records': return 'Medical Records'
      case 'settings': return 'Settings'
      case 'emergency': return 'Emergency'
      default: return 'Dashboard'
    }
  }

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const newMsg: Message = {
        id: messages.length + 1,
        content: newMessage,
        timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
        type: 'sent'
      }
      setMessages([...messages, newMsg])
      setNewMessage("")
    }
  }
  

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleSettingsChange = (key, value) => {
    setUserSettings(prev => ({ ...prev, [key]: value }))
  }

  const handleProfilePictureChange = (event) => {
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        handleSettingsChange('profilePicture', reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'home':
        return (
          <>
            {/* User Greeting */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold">
              <motion.h1 
            className="text-5xl font-light tracking-tight mb-4"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
                <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-transparent bg-clip-text">Hello </span>
                <span className="bg-gradient-to-r from-indigo-500 to-purple-500 text-transparent bg-clip-text">{userData?.first_name},</span>
              </motion.h1>
                <motion.h2 
            className="text-4xl font-light tracking-tight"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
                <span className="bg-gradient-to-r from-purple-500 via-indigo-500 to-pink-500 text-transparent bg-clip-text"> How are you doing today ? </span>✨
              </motion.h2>
              </h1>
            </div>
            
            {/* Health Summary Card */}
            <Card className="w-full bg-white dark:bg-gray-800 shadow-lg rounded-3xl overflow-hidden dark:border-gray-700">
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">Health Summary</h2>
        <div className="grid gap-6">
          {/* HPN Section with Tooltip */}
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <Fingerprint className="h-5 w-5 text-blue-500" />
              <span className="text-sm text-gray-500 font-medium">
                Health Point Number (HPN)
              </span>
              <HoverCard>
                <HoverCardTrigger asChild>
                  <button className="inline-flex items-center justify-center rounded-full w-5 h-5 bg-gray-100 hover:bg-gray-200 transition-colors">
                    <Info className="h-3 w-3 text-gray-500" />
                  </button>
                </HoverCardTrigger>
                <HoverCardContent className="w-80 bg-white/95 backdrop-blur border-gray-100">
                  <div className="space-y-2" >
                    <h4 className="font-semibold text-sm">About Your HPN</h4>
                    <p className="text-sm text-gray-600">
                      Your Health Point Number (HPN) is a unique identifier that:
                    </p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Securely links all your medical records</li>
                      <li>• Enables quick access by healthcare providers</li>
                      <li>• Ensures accurate patient identification</li>
                      <li>• Facilitates seamless care coordination</li>
                    </ul>
                    <div className="pt-2 border-t border-gray-100">
                      <p className="text-xs text-gray-500">
                        Share this number with healthcare providers to access your complete medical history.
                      </p>
                    </div>
                  </div>
                </HoverCardContent>
              </HoverCard>
            </div>
            <div className="flex items-center gap-4">
              <div className="font-mono text-2xl font-bold tracking-wider bg-gradient-to-r from-blue-600 to-cyan-600 text-transparent bg-clip-text">
                {userData?.hpn}
              </div>
              <button 
                className="text-xs text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded-full transition-colors"
                onClick={() => {
                  navigator.clipboard.writeText(userData?.hpn || '');
                  setCopySuccess(true);
                  setTimeout(() => setCopySuccess(false), 2000);
                }}
              >
                {copySuccess ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <p className="text-5l font-light tracking-tight">
              Provide this number to your health care provider to access all your medical records. 
              <Link href="#" className="text-blue-500 ml-1">read guidelines</Link>
            </p>
          </div>

          {/* Status Section */}
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <GraduationCap className="h-5 w-5 text-purple-500" />
              <span className="text-sm text-gray-500 font-medium">Profile Status</span>
            </div>
            <div className="flex items-center gap-3">
              {(() => {
                // ... (rest of the age calculation and category logic remains the same)
                const calculateAge = (dob: string): number => {
                  const birthDate = new Date(dob);
                  const today = new Date();
                  let age = today.getFullYear() - birthDate.getFullYear();
                  const month = today.getMonth() - birthDate.getMonth();
                  if (month < 0 || (month === 0 && today.getDate() < birthDate.getDate())) {
                    age--;
                  }
                  return age;
                };

                const age = calculateAge(userData?.date_of_birth || '');
                
                type AgeCategory = {
                  range: string;
                  bgClass: string;
                  textClass: string;
                };
                
                const getAgeCategory = (age: number): AgeCategory => {
                  if (age <= 1) return { range: "Newborn/Infant", bgClass: "bg-blue-50", textClass: "text-blue-700" };
                  if (age <= 4) return { range: "Toddler", bgClass: "bg-green-50", textClass: "text-green-700" };
                  if (age <= 8) return { range: "Young Child", bgClass: "bg-yellow-50", textClass: "text-yellow-700" };
                  if (age <= 12) return { range: "Pre-teen", bgClass: "bg-orange-50", textClass: "text-orange-700" };
                  if (age <= 17) return { range: "Teenager", bgClass: "bg-red-50", textClass: "text-red-700" };
                  if (age <= 24) return { range: "Young Adult", bgClass: "bg-purple-50", textClass: "text-purple-700" };
                  if (age <= 34) return { range: "Early Adulthood", bgClass: "bg-indigo-50", textClass: "text-indigo-700" };
                  if (age <= 44) return { range: "Mid Adulthood", bgClass: "bg-pink-50", textClass: "text-pink-700" };
                  if (age <= 54) return { range: "Early Middle Age", bgClass: "bg-cyan-50", textClass: "text-cyan-700" };
                  if (age <= 64) return { range: "Late Middle Age", bgClass: "bg-teal-50", textClass: "text-teal-700" };
                  if (age <= 74) return { range: "Young Senior", bgClass: "bg-emerald-50", textClass: "text-emerald-700" };
                  if (age <= 84) return { range: "Middle Senior", bgClass: "bg-amber-50", textClass: "text-amber-700" };
                  return { range: "Super Senior", bgClass: "bg-rose-50", textClass: "text-rose-700" };
                };

                const category = getAgeCategory(age);

                return (
                  <>
                    <span className="font-mono text-200 font-bold tracking-wider bg-gradient-to-r from-blue-600 to-cyan-600 text-transparent bg-clip-text">
                      {category.range}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${category.bgClass} ${category.textClass}`}>
                      Age {age}
                    </span>
                  </>
                );
              })()}
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Last updated: {new Date().toLocaleDateString()}</span>
            <span>Next checkup: 3 months</span>
          </div>
        </div>
      </CardContent>
    </Card>
            
    <div className="flex flex-col md:flex-row md:justify-between md:items-stretch gap-4 p-4">
  {/* Desktop Layout */}
  <div className="hidden md:flex md:w-[50%]">
    <Card className="w-full">
      <CardContent className="p-4">
        <TicketSelector />
      </CardContent>
    </Card>
  </div>
  <div className="hidden md:flex md:w-[50%]">
    <Card className="w-full">
      <CardContent className="p-4">
        <img
          src="https://media.licdn.com/dms/image/v2/D5610AQE1qBNky-3pMA/image-shrink_800/image-shrink_800/0/1729134902341?e=2147483647&v=beta&t=dbJiL1HVNxy8VapJ2r7Mq6v8VPULQ0Kado174Ku1upo"
          alt="Right Side Content"
          className="rounded-lg shadow-md object-cover w-full h-full"
        />
      </CardContent>
    </Card>
  </div>

  {/* Mobile Layout */}
  <div className="flex flex-col md:hidden gap-4 w-full">
    <Card className="w-full">
      <CardContent className="p-6">
        <TicketSelector />
      </CardContent>
    </Card>
    <Card className="w-full">
      <CardContent className="p-4">
        <img
          src="https://media.licdn.com/dms/image/v2/D5610AQE1qBNky-3pMA/image-shrink_800/image-shrink_800/0/1729134902341?e=2147483647&v=beta&t=dbJiL1HVNxy8VapJ2r7Mq6v8VPULQ0Kado174Ku1upo"
          alt="Right Side Content"
          className="rounded-lg shadow-md object-cover w-full"
        />
      </CardContent>
    </Card>
  </div>
</div>

         {/* Upcoming Events */}
            <div className="mb-6 rounded-xl bg-white p-6 shadow dark:bg-gray-800 dark:text-white">
              <h2 className="mb-4 text-xl font-semibold">Upcoming Health-Care Events</h2>
              <div className="space-y-4">
                {upcomingEvents.slice(0, 3).map((event) => (
                  <div key={event.id} className="flex items-center space-x-4">
                    <div className={`h-12 w-12 rounded-full bg-${event.color}-100 dark:bg-${event.color}-900`} />
                    <div>
                      <p className="font-medium">{event.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{event.description}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">{event.date}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-right">
                <button onClick={() => setActiveSection('appointments')} className="inline-flex items-center text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300">
                  View all upcoming events
                  <ChevronRight className="ml-1 h-4 w-4" />
                </button>
              </div>
            </div>


            {/* Recent Activities */}
            <div className="mb-6 rounded-xl bg-white p-6 shadow dark:bg-gray-800 dark:text-white">
              <h2 className="mb-4 text-xl font-semibold">Recent Activities</h2>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900" />
                  <div>
                    <p className="font-medium">Lab Results Received</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Your blood work results are now available.</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="h-10 w-10 rounded-full bg-yellow-100 dark:bg-yellow-900" />
                  
                  
                  <div>
                    <p className="font-medium">Prescription Refill</p>
                    
                    <p className="text-sm text-gray-500 dark:text-gray-400">Your prescription Linsdy for has been refilled.</p>
                    
                    <p className="text-xs text-gray-400 dark:text-gray-500">Yesterday</p>
                  </div>
                    
                </div>
              </div>
            </div>
          </>
        )
      case 'appointments':
        return (
          
            <Appointments />
          

        )
      case 'messages':
        return <DelightfulHealthChat />

      case 'video-health-tips':
        return <HealthVideoLibrary />
        

      case 'chat-consultant':
        return <Consultation />
       
      case 'medical-records':
       return <MedicalRecords />

      // In dashboard.tsx, find this section in renderContent():

   case 'settings':
  return <TwitterStyleMedicalSettings />

      case 'emergency':
        return <Emergency />
    }
  }

  return (
    <div className={`flex min-h-screen flex-col lg:flex-row ${darkMode ? 'dark' : ''}`}>
      {/* Mobile Header */}
      <header className="sticky top-0 z-20 border-b border-gray-200 bg-white p-4 lg:hidden dark:bg-gray-800 dark:border-gray-700">
  <div className="flex items-center justify-between">
    <div 
      onClick={toggleMobileMenu}
      className="cursor-pointer"
    >
      <Avatar className="h-10 w-10 sm:h-12 sm:w-12 ring-2 ring-blue-500 dark:ring-blue-400">
        <AvatarFallback className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-sm sm:text-base">
          {userData?.first_name?.charAt(0)}{userData?.last_name?.charAt(0)}
        </AvatarFallback>
      </Avatar>
    </div>
    <h1 className="text-xl font-bold text-gray-900 dark:text-white">{getSectionTitle(activeSection)}</h1>
    <button 
      className="rounded-full p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
      onClick={toggleDarkMode}
      aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
    >
      {darkMode ? <Sun className="h-6 w-6" /> : <Moon className="h-6 w-6" />}
    </button>
  </div>
</header>

{/* Mobile Navigation Menu */}
<div className={`fixed inset-0 z-30 lg:hidden transition-opacity duration-500 ${mobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
  <div 
    className="absolute inset-0 bg-black/20 backdrop-blur-sm"
    onClick={() => setMobileMenuOpen(false)}
  ></div>
  <nav className={`absolute left-0 top-0 bottom-0 w-64 bg-white dark:bg-gray-800 shadow-xl transition-transform duration-500 ease-in-out transform ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">Menu</h2>
        <button 
          onClick={() => setMobileMenuOpen(false)}
          className="text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300"
          aria-label="Close menu"
        >
          <X className="h-6 w-6" />
        </button>
      </div>
      <nav className="flex-1 overflow-y-auto">
        <div className="flex flex-col p-4 space-y-2">
          <NavLink href="#home" icon={Home}>Home</NavLink>
          <NavLink href="#appointments" icon={CalendarClock}>Appointments</NavLink>
          <NavLink href="#messages" icon={Inbox}>Messages</NavLink>
          <NavLink href="#video-health-tips" icon={Tv}>Videos</NavLink>
          <NavLink href="#chat-consultant" icon={UsersRound}>Consultants</NavLink>
          <NavLink href="#community" icon={Hash}>Communities</NavLink>
          <NavLink href="#medical-records" icon={FileText}>Medical Records</NavLink>
          <NavLink href="#settings" icon={Settings}>Settings</NavLink>
        </div>
      </nav>
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">

      <NavUser onNavigate={handleNavigation}/>
      <br />
      <button
        onClick={() => setActiveSection('emergency')}
        className="w-full flex items-center justify-center rounded-xl bg-red-500 p-3 text-white hover:bg-red-600 transition-colors duration-200"
      >
        <Phone className="mr-2 h-5 w-5" />
        <span>Emergency Help</span>
      </button>
      </div>
    </div>
  </nav>
</div>

      {/* Left Sidebar (Desktop) */}
<aside className="hidden lg:flex w-64 border-r border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700 fixed h-screen overflow-y-auto">
  <div className="flex h-screen flex-col p-4">
    <Link className="mb-4 flex items-center text-xl font-bold text-blue-500 dark:text-blue-400" href="#">
      <span className="mr-2 text-2xl"></span><h6>@Public Health Bereau</h6>
    </Link>
    <nav className="space-y-2">
      <NavLink href="#home" icon={Home}>Home</NavLink>
      <NavLink href="#appointments" icon={CalendarClock}>Appointments</NavLink>
      <NavLink href="#messages" icon={Inbox}>Messages</NavLink>
      <NavLink href="#video-health-tips" icon={Tv}>Videos</NavLink>
      <NavLink href="#chat-consultant" icon={UsersRound}>Consultants</NavLink>
      <NavLink href="#community" icon={Hash}>Communities</NavLink>
      <NavLink href="#medical-records" icon={FileText}>Medical Records</NavLink>
      <NavLink href="#settings" icon={Settings}>Settings</NavLink>
    </nav>
    

    
    <div className="mt-auto space-y-4 border-t border-gray-200 dark:border-gray-700">
    <br/>
    <NavUser onNavigate={handleNavigation}/>
 
    
      <button
        onClick={() => setActiveSection('emergency')}
        className="w-full flex items-center justify-center rounded-xl bg-red-500 p-3 text-white hover:bg-red-600 transition-colors duration-200"
      >
        <Phone className="mr-2 h-5 w-5" />
        <span>Emergency Help</span>
      </button>
    </div>
  </div>
</aside>

      {/* Main Content */}
      <main className={`flex-1 flex flex-col bg-gray-100 dark:bg-gray-900 ${mobileMenuOpen ? 'hidden lg:flex' : ''} lg:pl-64`}>
        <header className="sticky top-0 z-10 border-b border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700 hidden lg:block">
          <div className="flex items-center justify-between p-4">
            <h1 className="text-xl font-bold dark:text-white">{getSectionTitle(activeSection)}</h1>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <input
                  className="rounded-full bg-gray-100 py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                  placeholder="Search for anything..."
                  type="text"
                />
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              </div>
              <button 
                className="rounded-full p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                onClick={toggleDarkMode}
                aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
              >
                {darkMode ? <Sun className="h-6 w-6" /> : <Moon className="h-6 w-6" />}
              </button>
              <button 
                onClick={handleLogout}
                className="rounded-full p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                <Power className="h-6 w-6" />
                </button>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4">
          {renderContent()}
        </div>
      </main>

      {/* Right Sidebar */}
      <aside className="w-full lg:w-80 border-t lg:border-l border-gray-200 bg-white p-4 dark:bg-gray-800 dark:border-gray-700 dark:text-white">
        <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
          <h2 className="mb-2 text-lg font-semibold">Health Tips</h2>
          <p className="text-sm text-gray-600 dark:text-gray-300">{currentTip}</p>
        </div>
        <div className="mt-4">
          <h2 className="mb-2 text-lg font-semibold">Quick Actions</h2>
          <button onClick={() => setActiveSection('appointments')} className="mb-2 w-full rounded-full bg-blue-500 p-2 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700">
            Schedule Appointment
          </button>
          <button onClick={() => setActiveSection('medical-records')} className="w-full rounded-full border border-blue-500 p-2 text-blue-500 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-gray-700">
            View Medical Records
          </button>
        </div>
      </aside>
      <style>
        {`
          @keyframes dash {
            to {
              stroke-dashoffset: 0;
            }
          }
          
          .animate-check {
            animation: scale 0.5s ease-in-out;
          }
          
          @keyframes scale {
            0% {
              transform: scale(0);
            }
            50% {
              transform: scale(1.2);
            }
            100% {
              transform: scale(1);
            }
          }
        `}
      </style>
    </div>
  )
}


// version 3.0