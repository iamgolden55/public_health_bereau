'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Clock, MapPin, Search, Plus, ChevronRight, X, AlertCircle, Filter, Bell, FileText, MoreVertical } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { useUser } from '@/app/context/user-context'

// Define types for Appointment and Doctor
interface Appointment {
  id: number
  title: string
  doctor: string
  location: string
  date: string
  time: string
  status: 'upcoming' | 'completed' | 'canceled'
  avatar: string
  preparationProgress: number
  notes?: string
  reminders: boolean
  recurrence?: string
  preparationTasks?: { task: string, completed: boolean }[]
  rating?: number
  feedback?: string
  patientName?: string
  patientId?: string
}

interface Doctor {
  name: string
  specialty: string
  bio: string
}

export default function AppointmentsPage() {


   // Add user context
  const { userData, loading } = useUser()

  const [appointments, setAppointments] = useState<Appointment[]>([
    {
      id: 1,
      title: "Annual Check-up",
      doctor: "Dr. Emily Watson",
      location: "Central Hospital, Room 302",
      date: "2024-11-15",
      time: "10:00 AM",
      status: 'upcoming',
      avatar: "/placeholder.svg?height=40&width=40",
      preparationProgress: 75,
      notes: "Bring recent lab results",
      reminders: true,
      preparationTasks: [{ task: "Bring recent lab results", completed: false }],
      // Add patient info from userData
      patientName: userData?.first_name + " " + userData?.last_name || 'Loading...',
      patientId: userData?.hpn || 'Loading...'
    },
    // Add more appointments...
  ])



  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string[]>(['upcoming', 'completed', 'canceled'])
  const [selectedTab, setSelectedTab] = useState('all')
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)
  const [recurrence, setRecurrence] = useState('')

  const doctors: Doctor[] = [
    { name: "Dr. Emily Watson", specialty: "General Practitioner", bio: "Expert in family medicine with 15 years of experience." },
    // Add more doctor profiles here
  ]

  const filteredAppointments = appointments.filter(appointment =>
    (appointment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    appointment.doctor.toLowerCase().includes(searchTerm.toLowerCase())) &&
    statusFilter.includes(appointment.status) &&
    (selectedTab === 'all' || (selectedTab === 'reminders' && appointment.reminders))
  )

  const removeAppointment = (id: number) => {
    setAppointments(appointments.filter(app => app.id !== id))
  }

  const toggleReminder = (id: number) => {
    setAppointments(appointments.map(app =>
      app.id === id ? { ...app, reminders: !app.reminders } : app
    ))
  }

  const toggleTaskCompletion = (appointmentId: number, taskIndex: number, completed: boolean) => {
    setAppointments(appointments.map(app => {
      if (app.id === appointmentId && app.preparationTasks) {
        const updatedTasks = [...app.preparationTasks];
        updatedTasks[taskIndex].completed = completed;
        return { ...app, preparationTasks: updatedTasks };
      }
      return app;
    }));
  };

  const updateFeedback = (id: number, feedback: string) => {
    setAppointments(appointments.map(app => 
      app.id === id ? { ...app, feedback } : app
    ));
  };

  const setRating = (id: number, rating: number) => {
    setAppointments(appointments.map(app => 
      app.id === id ? { ...app, rating } : app
    ));
  };

  const viewDoctorProfile = (doctorName: string) => {
    const doctor = doctors.find(doc => doc.name === doctorName);
    setSelectedDoctor(doctor || null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 via-gray-50 to-white p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="relative flex-1">
  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
  <Input
    className="pl-10 pr-4 py-3 w-full bg-white border rounded-full shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 transition-all"
    placeholder="Search appointments by title or doctor..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)} // Updates searchTerm dynamically
  />
</div>
        <header className="flex flex-col sm:flex-row justify-between items-center mb-6 sm:mb-8">
          <div className="text-center sm:text-left">
            <h1 className="text-3xl font-semibold text-gray-900">{userData?.first_name}'s Appointments</h1>
            <p className="text-gray-500 text-sm sm:text-base">
              Manage your healthcare effortlessly with a few clicks.
            </p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full px-4 py-2 sm:px-6 sm:py-3 shadow-lg hover:shadow-xl transition-all duration-300">
                <Plus className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
                New Appointment
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white rounded-lg p-4 sm:p-6 w-[95vw] max-w-md mx-auto">
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold mb-4">Schedule New Appointment</DialogTitle>
                <DialogDescription>
                  Fill in the details to book your new appointment.
                </DialogDescription>
              </DialogHeader>
              <form className="space-y-4">
                <div>
                  <Label htmlFor="title">Appointment Title</Label>
                  <Input id="title" placeholder="Enter appointment title" />
                </div>
                <div>
                  <Label htmlFor="doctor">Doctor</Label>
                  <Input id="doctor" placeholder="Enter doctor's name" />
                </div>
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input id="date" type="date" />
                </div>
                <div>
                  <Label htmlFor="time">Time</Label>
                  <Input id="time" type="time" />
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" placeholder="Enter appointment location" />
                </div>
                <div>
                  <Label htmlFor="recurrence">Recurrence</Label>
                  <Select onValueChange={(value) => setRecurrence(value)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select recurrence" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea id="notes" placeholder="Enter any additional notes" />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="reminders" />
                  <Label htmlFor="reminders">Enable reminders</Label>
                </div>
              </form>
              <DialogFooter>
                <Button type="submit" className="w-full mt-4">Schedule Appointment</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </header>

        {/* Appointment Cards */}
        <div className="grid gap-6">
          {filteredAppointments.map((appointment, index) => (
            <motion.div
              key={appointment.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="p-4 sm:p-6 bg-gradient-to-br from-white to-gray-50 shadow-md rounded-2xl hover:shadow-lg transition-all duration-300">
                <CardContent>
                  <div className="flex items-center space-x-4">
                    <Avatar className="w-12 h-12 sm:w-16 sm:h-16">
                      <AvatarImage src={appointment.avatar} alt={appointment.doctor} />
                      <AvatarFallback>{appointment.doctor.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-lg sm:text-xl font-medium text-gray-800">{appointment.title}</h3>
                      <p className="text-sm text-gray-600">{appointment.doctor}</p>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-4 text-sm text-gray-700">
                    <div className="flex items-center">
                      <Calendar className="w-5 h-5 text-blue-500 mr-2" />
                      {appointment.date}
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-5 h-5 text-blue-500 mr-2" />
                      {appointment.time}
                    </div>
                    <div className="col-span-2 flex items-center">
                      <MapPin className="w-5 h-5 text-blue-500 mr-2" />
                      {appointment.location}
                    </div>
                  </div>
                  {appointment.notes && (
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-gray-700">
                      <AlertCircle className="inline-block w-5 h-5 text-blue-500 mr-2" />
                      {appointment.notes}
                    </div>
                  )}
                  <div className="mt-4 flex justify-between items-center">
                    <Badge
                      variant={appointment.status === 'upcoming' ? 'default' : appointment.status === 'completed' ? 'secondary' : 'destructive'}
                      className="capitalize px-2 py-1 text-xs font-medium"
                    >
                      {appointment.status}
                    </Badge>
                    <Button variant="ghost" className="text-blue-500 hover:bg-blue-50 px-3 py-2 rounded-full">
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* No Appointments Fallback */}
        {filteredAppointments.length === 0 && (
          <div className="text-center text-gray-500">
            <p>No appointments found.</p>
            <p>Try adjusting your filters or schedule a new appointment.</p>
          </div>
        )}
      </div>
    </div>
  )
}