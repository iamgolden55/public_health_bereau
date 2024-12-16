"use client"

import { useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Image from "next/image"
import {
  Heart,
  Shield,
  Video,
  Bell,
  Ambulance,
  ChevronRight,
  ChevronLeft,
  Lock,
} from "lucide-react"

const slides = [
  {
    id: 1,
    title: "Your Unique Health Point Number (HPN)",
    description: "Every PHB user receives a unique Health Point Number (HPN) that stores and protects all your health records in one place. Think of it as your personal health ID, accessible anytime, anywhere.",
    icon: Lock,
    color: "bg-blue-500",
    image: "/placeholder.svg?height=200&width=200",
  },
  {
    id: 2,
    title: "Secure Health Records",
    description: "Access your medical history, test results, and prescription details at the touch of a button. Your data is encrypted and accessible only to you and authorized healthcare providers.",
    icon: Shield,
    color: "bg-green-500",
    image: "/placeholder.svg?height=200&width=200",
  },
  {
    id: 3,
    title: "Virtual Consultations & Appointments",
    description: "Book appointments with healthcare professionals, attend virtual consultations, and stay on top of your health from home.",
    icon: Video,
    color: "bg-purple-500",
    image: "/placeholder.svg?height=200&width=200",
  },
  {
    id: 4,
    title: "Personalized Health Alerts",
    description: "Receive reminders for medications, health check-ups, and lifestyle tips tailored to your needs.",
    icon: Bell,
    color: "bg-orange-500",
    image: "/placeholder.svg?height=200&width=200",
  },
  {
    id: 5,
    title: "Emergency Health Services",
    description: "Access emergency services quickly, share your health details securely, and receive immediate support in urgent situations.",
    icon: Ambulance,
    color: "bg-red-500",
    image: "/placeholder.svg?height=200&width=200",
    link: "/dashboard",
  },
]

export default function SplashScreen() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const scrollToSlide = (direction: 'next' | 'prev') => {
    if (containerRef.current) {
      const newSlide = direction === 'next' 
        ? Math.min(currentSlide + 1, slides.length)
        : Math.max(currentSlide - 1, 0)
      
      containerRef.current.scrollTo({
        left: newSlide * containerRef.current.offsetWidth,
        behavior: 'smooth'
      })
      setCurrentSlide(newSlide)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Logo and Welcome Section */}
      <div className="fixed top-0 left-0 right-0 z-10 bg-white/80 backdrop-blur-md p-6 text-center border-b">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Heart className="w-8 h-8 text-blue-500" />
          <h1 className="text-2xl font-bold">PHB</h1>
        </div>
        <p className="text-sm text-muted-foreground">Your Health, One Touch Away</p>
      </div>

      {/* Main Content */}
      <div 
        ref={containerRef}
        className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {/* Welcome Slide */}
        <div className="min-w-full h-screen flex items-center justify-center snap-center p-6">
          <Card className="max-w-lg p-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Image
                src="/placeholder.svg?height=200&width=200"
                alt="Welcome to PHB"
                width={200}
                height={200}
                className="mx-auto mb-6"
              />
              <h2 className="text-3xl font-bold mb-4">Welcome to PHB</h2>
              <p className="text-muted-foreground mb-6">
                Your trusted partner for managing and protecting your health.
              </p>
              <Button 
                onClick={() => scrollToSlide('next')}
                className="bg-blue-500 hover:bg-blue-600"
              >
                Get Started
              </Button>
            </motion.div>
          </Card>
        </div>

        {/* Feature Slides */}
        {slides.map((slide, index) => {
          const Icon = slide.icon
          return (
            <div 
              key={slide.id}
              className="min-w-full h-screen flex items-center justify-center snap-center p-6"
            >
              <Card className="max-w-lg p-8">
                <motion.div
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                  className="text-center"
                >
                  <Image
                    src={slide.image}
                    alt={slide.title}
                    width={200}
                    height={200}
                    className="mx-auto mb-6"
                  />
                  <div className={`w-16 h-16 rounded-full ${slide.color} mx-auto mb-6 flex items-center justify-center`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold mb-4">{slide.title}</h2>
                  <p className="text-muted-foreground mb-6">{slide.description}</p>
                  <div className="flex justify-center gap-4">
                    <Button
                      variant="outline"
                      onClick={() => scrollToSlide('prev')}
                    >
                      <ChevronLeft className="w-4 h-4 mr-2" />
                      Previous
                    </Button>
                    <Button
                      onClick={() => index === slides.length - 1 ? window.location.href = slides[slides.length - 1].link : scrollToSlide('next')}
                      className="bg-blue-500 hover:bg-blue-600"
                    >
                      {index === slides.length - 1 ? 'Get Started' : 'Next'}
                      {index !== slides.length - 1 && <ChevronRight className="w-4 h-4 ml-2" />}
                    </Button>
                  </div>
                </motion.div>
              </Card>
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md p-4 text-center border-t">
        <p className="text-xs text-muted-foreground">
          Your data is securely stored and managed in compliance with GDPR and HIPAA regulations
        </p>
      </div>

      {/* Progress Indicators */}
      <div className="fixed bottom-20 left-0 right-0 flex justify-center gap-2">
        {[0, ...slides.map((_, i) => i + 1)].map((i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-colors ${
              currentSlide === i ? 'bg-blue-500' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>
    </div>
  )
}