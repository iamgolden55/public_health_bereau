// app/[role]/professional/patients.tsx
"use client"

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import debounce from 'lodash/debounce'
import { Spinner } from "@nextui-org/react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import {
  Activity,
  AlertCircle,
  Calendar,
  FileText,
  History,
  Search,
  User,
  Pill,
  Microscope,
  Syringe,
  Clock,
  Plus,
  Filter
} from "lucide-react"
import { format } from "date-fns"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000/api';

// Types based on your models
interface Patient {
  id: string
  hpn: string
  first_name: string
  last_name: string
  date_of_birth: string
  blood_type: string
  allergies: string
  chronic_conditions: string
  is_high_risk: boolean
  last_visit_date: string
  emergency_contact_name: string
  emergency_contact_phone: string
  medical_records: MedicalRecord[]
  appointments: Appointment[]
}

interface MedicalRecord {
  id: string
  chief_complaint: string
  present_illness: string
  vital_signs: {
    blood_pressure: string
    temperature: number
    pulse: number
    respiratory_rate: number
  }
  assessment: string
  plan: string
  created_at: string
  provider: {
    name: string
    specialization: string
  }
}

interface Appointment {
  id: string
  appointment_date: string
  reason: string
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'
  provider: {
    name: string
    specialization: string
  }
}

export default function PatientManagement() {
  const [searchQuery, setSearchQuery] = useState("")
  const [patients, setPatients] = useState<Patient[]>([])
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  const { toast } = useToast()

  const debouncedSearch = useCallback(
    debounce(async (query: string) => {
      if (!query) return;
      try {
        setLoading(true);
        // Get token from localStorage
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No authentication token found');

        // Log the full URL being called
        const url = `${API_BASE_URL}/medical-professionals/search-patients/?hpn=${query}`;
        console.log('Calling API:', url);

        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          // Get more details about the error
          const errorText = await response.text();
          console.error('API Error:', {
            status: response.status,
            statusText: response.statusText,
            body: errorText
          });
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Search results:', data);  // Log the response data
        setPatients(data.results || []);

      } catch (error) {
        console.error('Search error:', error);
        toast({
          variant: "destructive",
          title: "Search Failed",
          description: error instanceof Error ? error.message : "Failed to search patients. Please try again.",
        });
        setPatients([]);
      } finally {
        setLoading(false);
      }
    }, 300),
    [toast]
  );

  // Effect for search
  useEffect(() => {
    if (searchQuery) {
      debouncedSearch(searchQuery)
    }
    return () => {
      debouncedSearch.cancel()
    }
  }, [searchQuery, debouncedSearch])

// Handler for selecting a patient
const handlePatientSelect = async (hpn: string) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');
  
      const response = await fetch(`${API_BASE_URL}/medical-professionals/patient-details/${hpn}/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
      setSelectedPatient(data);
      setActiveTab("overview");
    } catch (error) {
      console.error('Patient detail error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load patient details. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Patient Overview Component
  const PatientOverview = ({ patient }: { patient: Patient }) => (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Personal Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">HPN</span>
              <span className="font-medium">{patient.hpn}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">DOB</span>
              <span className="font-medium">
                {format(new Date(patient.date_of_birth), 'PP')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Blood Type</span>
              <Badge variant="outline">{patient.blood_type}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Risk Status</span>
              <Badge variant={patient.is_high_risk ? "destructive" : "secondary"}>
                {patient.is_high_risk ? "High Risk" : "Normal"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Medical Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="rounded-lg bg-red-50 p-3">
              <h4 className="font-medium text-red-900">Allergies</h4>
              <p className="text-sm text-red-700">{patient.allergies || "None reported"}</p>
            </div>
            <div className="rounded-lg bg-yellow-50 p-3">
              <h4 className="font-medium text-yellow-900">Chronic Conditions</h4>
              <p className="text-sm text-yellow-700">{patient.chronic_conditions || "None reported"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Emergency Contact</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Name</span>
              <span className="font-medium">{patient.emergency_contact_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Phone</span>
              <span className="font-medium">{patient.emergency_contact_phone}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="md:col-span-2 lg:col-span-3">
        <CardHeader>
          <CardTitle className="text-lg">Recent Medical Records</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Chief Complaint</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Assessment</TableHead>
                <TableHead>Plan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {patient.medical_records.slice(0, 5).map((record) => (
                <TableRow key={record.id}>
                  <TableCell>{format(new Date(record.created_at), 'PP')}</TableCell>
                  <TableCell>{record.chief_complaint}</TableCell>
                  <TableCell>
                    {record.provider.name}
                    <br />
                    <span className="text-sm text-muted-foreground">
                      {record.provider.specialization}
                    </span>
                  </TableCell>
                  <TableCell>{record.assessment}</TableCell>
                  <TableCell>{record.plan}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Patient Management</h1>
          <p className="text-muted-foreground">
            Search and manage patient records using HPN
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add New Patient
        </Button>
      </div>

      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle>Patient Search</CardTitle>
          <CardDescription>
            Enter patient's HPN number to view their records
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by HPN number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
          </div>
           
          {/* Loading State */}
            {loading && (
            <div className="mt-8 flex flex-col items-center justify-center gap-4">
                <Spinner 
                size="lg"
                color="primary"
                labelColor="primary"
                label="Searching patients..."
                />
            </div>
            )}

            {/* No Results State */}
            {!loading && searchQuery && patients.length === 0 && (
            <div className="mt-8 flex flex-col items-center justify-center gap-2 py-8">
                <AlertCircle className="h-8 w-8 text-warning" />
                <div className="text-center">
                <p className="text-lg font-semibold">No Results Found</p>
                <p className="text-sm text-muted-foreground">
                    No patients found with HPN: {searchQuery}
                </p>
                </div>
            </div>
            )}


          {/* Search Results */}
          {patients.length > 0 && !selectedPatient && (
            <div className="mt-4 rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>HPN</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>DOB</TableHead>
                    <TableHead>Last Visit</TableHead>
                    <TableHead>Risk Status</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {patients.map((patient) => (
                    <TableRow key={patient.id}>
                      <TableCell>{patient.hpn}</TableCell>
                      <TableCell>
                        {patient.first_name} {patient.last_name}
                      </TableCell>
                      <TableCell>
                        {format(new Date(patient.date_of_birth), 'PP')}
                      </TableCell>
                      <TableCell>
                        {patient.last_visit_date
                          ? format(new Date(patient.last_visit_date), 'PP')
                          : 'No visits'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={patient.is_high_risk ? "destructive" : "secondary"}>
                          {patient.is_high_risk ? "High Risk" : "Normal"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          onClick={() => handlePatientSelect(patient.hpn)}
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Patient Details Section */}
      {selectedPatient && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>
                  {selectedPatient.first_name} {selectedPatient.last_name}
                </CardTitle>
                <CardDescription>HPN: {selectedPatient.hpn}</CardDescription>
              </div>
              <Button
                variant="outline"
                onClick={() => setSelectedPatient(null)}
              >
                Back to Search
              </Button>
            </div>
          </CardHeader>
          <CardContent>
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-4 py-8">
            <Spinner 
                size="lg"
                color="primary"
                labelColor="primary"
                label="Loading patient details..."
            />
            </div>
        ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="overview">
                  <User className="mr-2 h-4 w-4" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="records">
                  <FileText className="mr-2 h-4 w-4" />
                  Medical Records
                </TabsTrigger>
                <TabsTrigger value="appointments">
                  <Calendar className="mr-2 h-4 w-4" />
                  Appointments
                </TabsTrigger>
                <TabsTrigger value="lab-results">
                  <Microscope className="mr-2 h-4 w-4" />
                  Lab Results
                </TabsTrigger>
                <TabsTrigger value="medications">
                  <Pill className="mr-2 h-4 w-4" />
                  Medications
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <PatientOverview patient={selectedPatient} />
              </TabsContent>

              <TabsContent value="records">
                {/* Medical Records Tab Content */}
                <div className="space-y-4">
                  {/* Records content here */}
                </div>
              </TabsContent>

              <TabsContent value="appointments">
                {/* Appointments Tab Content */}
                <div className="space-y-4">
                  {/* Appointments content here */}
                </div>
              </TabsContent>

              <TabsContent value="lab-results">
                {/* Lab Results Tab Content */}
                <div className="space-y-4">
                  {/* Lab results content here */}
                </div>
              </TabsContent>

              <TabsContent value="medications">
                {/* Medications Tab Content */}
                <div className="space-y-4">
                  {/* Medications content here */}
                </div>
              </TabsContent>
            </Tabs>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}