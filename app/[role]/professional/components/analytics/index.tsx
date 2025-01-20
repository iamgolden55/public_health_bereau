import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area,
} from 'recharts';
import { Button } from "@/components/ui/button";
import {
  Users,
  UserCheck,
  CalendarClock,
  Activity,
  Stethoscope,
  Heart,
  BadgeAlert,
  Clock,
  TrendingUp,
  BrainCircuit,
  Target,
  ClipboardCheck
} from "lucide-react";

// Mock data - Replace with real API data in production
const demographicsData = [
  { age: '18-24', count: 245, percentage: 15 },
  { age: '25-34', count: 420, percentage: 26 },
  { age: '35-44', count: 380, percentage: 24 },
  { age: '45-54', count: 250, percentage: 16 },
  { age: '55-64', count: 190, percentage: 12 },
  { age: '65+', count: 115, percentage: 7 },
];

const conditionData = [
  { name: 'Hypertension', patients: 320 },
  { name: 'Diabetes', patients: 250 },
  { name: 'Asthma', patients: 180 },
  { name: 'Arthritis', patients: 150 },
  { name: 'Heart Disease', patients: 120 },
];

const outcomeData = [
  { month: 'Jan', success: 85, readmission: 12, complications: 3 },
  { month: 'Feb', success: 88, readmission: 10, complications: 2 },
  { month: 'Mar', success: 87, readmission: 11, complications: 4 },
  { month: 'Apr', success: 91, readmission: 8, complications: 1 },
  { month: 'May', success: 89, readmission: 9, complications: 2 },
  { month: 'Jun', success: 92, readmission: 7, complications: 1 },
];

const efficiencyData = [
  { time: '8am', patients: 4, waitTime: 10, utilization: 75 },
  { time: '10am', patients: 8, waitTime: 15, utilization: 90 },
  { time: '12pm', patients: 6, waitTime: 20, utilization: 85 },
  { time: '2pm', patients: 7, waitTime: 12, utilization: 88 },
  { time: '4pm', patients: 5, waitTime: 8, utilization: 80 },
];

// Patient Analytics Component
export const PatientAnalytics = () => {
  return (
    <div className="space-y-6">
      {/* Demographics Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Patient Demographics
          </CardTitle>
          <CardDescription>Age distribution and patient composition</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={demographicsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="age" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#3b82f6" name="Number of Patients" />
                <Bar dataKey="percentage" fill="#22c55e" name="Percentage" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Common Conditions Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Common Conditions
          </CardTitle>
          <CardDescription>Distribution of medical conditions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={conditionData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" />
                <Tooltip />
                <Bar dataKey="patients" fill="#6366f1" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Clinical Outcomes Component
export const ClinicalOutcomes = () => {
  return (
    <div className="space-y-6">
      {/* Treatment Outcomes Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Stethoscope className="h-5 w-5" />
            Treatment Outcomes
          </CardTitle>
          <CardDescription>Monthly success rates and complications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={outcomeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="success" 
                  stroke="#22c55e" 
                  name="Success Rate (%)"
                  strokeWidth={2}
                />
                <Line 
                  type="monotone" 
                  dataKey="readmission" 
                  stroke="#f59e0b" 
                  name="Readmission Rate (%)"
                  strokeWidth={2}
                />
                <Line 
                  type="monotone" 
                  dataKey="complications" 
                  stroke="#ef4444" 
                  name="Complications (%)"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Quality Metrics Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5" />
            Quality Metrics
          </CardTitle>
          <CardDescription>Key performance indicators</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100">Patient Safety</h3>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-300">98.5%</p>
              <p className="text-sm text-blue-700 dark:text-blue-200">Incident-free rate</p>
            </div>
            <div className="rounded-lg bg-green-50 p-4 dark:bg-green-900">
              <h3 className="font-semibold text-green-900 dark:text-green-100">Recovery Rate</h3>
              <p className="text-2xl font-bold text-green-600 dark:text-green-300">92.3%</p>
              <p className="text-sm text-green-700 dark:text-green-200">Expected outcomes</p>
            </div>
            <div className="rounded-lg bg-purple-50 p-4 dark:bg-purple-900">
              <h3 className="font-semibold text-purple-900 dark:text-purple-100">Care Quality</h3>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-300">4.8/5</p>
              <p className="text-sm text-purple-700 dark:text-purple-200">Patient rating</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Practice Efficiency Component
export const PracticeEfficiency = () => {
  return (
    <div className="space-y-6">
      {/* Resource Utilization Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Resource Utilization
          </CardTitle>
          <CardDescription>Daily efficiency metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={efficiencyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="utilization" 
                  stackId="1" 
                  stroke="#3b82f6" 
                  fill="#3b82f6" 
                  name="Resource Utilization (%)"
                />
                <Area 
                  type="monotone" 
                  dataKey="waitTime" 
                  stackId="2" 
                  stroke="#f59e0b" 
                  fill="#f59e0b" 
                  name="Wait Time (min)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Workflow Metrics Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BrainCircuit className="h-5 w-5" />
            Workflow Optimization
          </CardTitle>
          <CardDescription>Process efficiency indicators</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-500" />
                <span className="font-medium">Avg. Appointment Duration</span>
              </div>
              <p className="text-2xl font-bold">28min</p>
              <p className="text-sm text-muted-foreground">Target: 30min</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-green-500" />
                <span className="font-medium">Schedule Adherence</span>
              </div>
              <p className="text-2xl font-bold">94%</p>
              <p className="text-sm text-muted-foreground">Target: 90%</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-purple-500" />
                <span className="font-medium">Staff Utilization</span>
              </div>
              <p className="text-2xl font-bold">87%</p>
              <p className="text-sm text-muted-foreground">Target: 85%</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <BadgeAlert className="h-4 w-4 text-red-500" />
                <span className="font-medium">No-show Rate</span>
              </div>
              <p className="text-2xl font-bold">4.2%</p>
              <p className="text-sm text-muted-foreground">Target: {'<'}5%</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default {
  PatientAnalytics,
  ClinicalOutcomes,
  PracticeEfficiency
};