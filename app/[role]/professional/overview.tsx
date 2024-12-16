// app/[role]/professional/overview.tsx

import { useUser } from '@/app/context/user-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Activity,
  Calendar,
  Clock,
  FileText,
  Users,
  UserCheck,
  AlertCircle,
  TrendingUp,
  CheckCircle2,
  Bell,
  ClipboardList,
  ChevronRight
} from "lucide-react";
import { motion } from "framer-motion";

// Mock data for charts
const patientActivityData = [
  { name: 'Mon', consultations: 12, procedures: 3 },
  { name: 'Tue', consultations: 15, procedures: 5 },
  { name: 'Wed', consultations: 8, procedures: 2 },
  { name: 'Thu', consultations: 18, procedures: 6 },
  { name: 'Fri', consultations: 14, procedures: 4 },
  { name: 'Sat', consultations: 6, procedures: 1 },
  { name: 'Sun', consultations: 4, procedures: 0 },
];

// Appointment type for TypeScript
interface Appointment {
  id: string;
  patientName: string;
  time: string;
  type: string;
  status: 'scheduled' | 'checked-in' | 'in-progress' | 'completed';
  avatar?: string;
}

export default function DoctorOverview() {
  const { userData } = useUser();

  // Helper function to get status color
  const getStatusColor = (status: string) => {
    const colors = {
      'scheduled': 'bg-yellow-100 text-yellow-800',
      'checked-in': 'bg-blue-100 text-blue-800',
      'in-progress': 'bg-purple-100 text-purple-800',
      'completed': 'bg-green-100 text-green-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  // Today's appointments mock data
  const todayAppointments: Appointment[] = [
    {
      id: '1',
      patientName: 'Sarah Johnson',
      time: '09:00 AM',
      type: 'Check-up',
      status: 'completed'
    },
    {
      id: '2',
      patientName: 'Michael Chen',
      time: '10:30 AM',
      type: 'Consultation',
      status: 'in-progress'
    },
    {
      id: '3',
      patientName: 'Emily Davis',
      time: '02:00 PM',
      type: 'Follow-up',
      status: 'scheduled'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6 p-6"
    >
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Welcome back, Dr. {userData?.last_name}
          </h1>
          <p className="text-muted-foreground">
            Here's your practice overview for today
          </p>
        </div>
        <Button className="bg-primary">
          <Calendar className="mr-2 h-4 w-4" />
          Schedule Appointment
        </Button>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-blue-500" />
              <h3 className="text-sm font-medium">Total Patients</h3>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-bold">1,284</p>
              <p className="text-xs text-muted-foreground">
                +6 new this week
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Activity className="h-4 w-4 text-green-500" />
              <h3 className="text-sm font-medium">Today's Appointments</h3>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-bold">8</p>
              <p className="text-xs text-muted-foreground">
                3 completed, 5 remaining
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-purple-500" />
              <h3 className="text-sm font-medium">Avg. Wait Time</h3>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-bold">12m</p>
              <p className="text-xs text-muted-foreground">
                -2m from last week
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4 text-orange-500" />
              <h3 className="text-sm font-medium">Pending Reports</h3>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-bold">5</p>
              <p className="text-xs text-muted-foreground">
                Due within 24 hours
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Patient Activity Chart */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Patient Activity</CardTitle>
            <CardDescription>Weekly consultation and procedure statistics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={patientActivityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="consultations" 
                    stroke="#2563eb" 
                    strokeWidth={2}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="procedures" 
                    stroke="#7c3aed" 
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Today's Appointments */}
        <Card className="col-span-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Today's Appointments</CardTitle>
                <CardDescription>Scheduled patient visits for today</CardDescription>
              </div>
              <Button variant="ghost" size="sm">
                View All
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {todayAppointments.map((appointment) => (
                <div 
                  key={appointment.id}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarImage src={appointment.avatar} />
                      <AvatarFallback>
                        {appointment.patientName.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{appointment.patientName}</p>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="mr-1 h-3 w-3" />
                        {appointment.time} - {appointment.type}
                      </div>
                    </div>
                  </div>
                  <Badge className={getStatusColor(appointment.status)}>
                    {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Pending Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Pending Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-2 bg-yellow-50 rounded-lg">
                <AlertCircle className="h-5 w-5 text-yellow-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Lab Results Review</p>
                  <p className="text-xs text-muted-foreground">3 results pending review</p>
                </div>
                <Button size="sm" variant="ghost">Review</Button>
              </div>
              <div className="flex items-center gap-4 p-2 bg-blue-50 rounded-lg">
                <ClipboardList className="h-5 w-5 text-blue-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Prescriptions</p>
                  <p className="text-xs text-muted-foreground">2 renewals needed</p>
                </div>
                <Button size="sm" variant="ghost">Process</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Patient discharged</p>
                  <p className="text-xs text-muted-foreground">15 minutes ago</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="h-2 w-2 rounded-full bg-blue-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium">New appointment scheduled</p>
                  <p className="text-xs text-muted-foreground">1 hour ago</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="h-2 w-2 rounded-full bg-purple-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Lab results received</p>
                  <p className="text-xs text-muted-foreground">2 hours ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Tasks */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Calendar className="h-5 w-5 text-blue-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Department Meeting</p>
                  <p className="text-xs text-muted-foreground">Tomorrow, 10:00 AM</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <FileText className="h-5 w-5 text-purple-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Research Review</p>
                  <p className="text-xs text-muted-foreground">Thursday, 2:00 PM</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Users className="h-5 w-5 text-green-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Patient Rounds</p>
                  <p className="text-xs text-muted-foreground">Friday, 9:00 AM</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}