// app/[role]/patient/appointments.tsx
'use client';

import { useState, useEffect } from 'react';
import { AppointmentService } from '@/app/services';
import { useUser } from '@/app/context/user-context';
import { useToast } from '@/components/ui/use-toast';
import { Appointment, AppointmentFormData, GPPractice } from '@/app/types/medical';
import { GlobalErrorBoundary } from '@/app/utils/errors/ErrorBoundary';
import { AppointmentCard } from './components/AppointmentCard';
import { AppointmentForm } from './components/AppointmentForm';
import { GPRegistrationDialog } from './components/GPRegistrationDialog';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Search, 
  Plus, 
  AlertTriangle,
  Loader2,
  Calendar 
} from 'lucide-react';

export default function AppointmentsPage() {
  // Hooks
  const { userData, loading: userLoading } = useUser();
  const { toast } = useToast();

  // State
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string[]>(['SCHEDULED', 'COMPLETED', 'CANCELLED']);
  const [showGPRegistrationDialog, setShowGPRegistrationDialog] = useState(false);
  const [availableGPPractices, setAvailableGPPractices] = useState<GPPractice[]>([]);
  const [isBookingEnabled, setIsBookingEnabled] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAddingAppointment, setIsAddingAppointment] = useState(false);

  // Initialize data
  useEffect(() => {
    const initializeData = async () => {
      if (!userLoading && userData) {
        try {
          setLoading(true);
          // Check GP registration status
          const regResponse = await AppointmentService.getGPRegistrationStatus();
          const hasActiveRegistration = regResponse.data?.status === 'ACTIVE';
          setIsBookingEnabled(hasActiveRegistration);

          if (!hasActiveRegistration) {
            // Load available GP practices
            const practicesResponse = await AppointmentService.getGPPractices();
            if (practicesResponse.data) {
              setAvailableGPPractices(Array.isArray(practicesResponse.data) ? practicesResponse.data : []);
            } else {
              setAvailableGPPractices([]);
            }
          } else {
            // Load existing appointments
            const appointmentsResponse = await AppointmentService.getAppointments();
            if (appointmentsResponse.data) {
              setAppointments(appointmentsResponse.data);
            }
          }
        } catch (error) {
          toast({
            title: "Error",
            description: "Failed to load initial data",
            variant: "destructive"
          });
        } finally {
          setLoading(false);
        }
      }
    };

    initializeData();
  }, [userLoading, userData, toast]);

  // Handle GP Registration
  const handleGPRegistration = async (practiceId: string) => {
    if (!userData?.id) return;
    
    try {
      setIsSubmitting(true);
      const response = await AppointmentService.registerWithGP(practiceId, userData.id);
      
      if (response.status === 200) {
        toast({
          title: "Success",
          description: "GP registration request submitted successfully",
        });
        setShowGPRegistrationDialog(false);
      } else {
        throw new Error(response.error || 'Registration failed');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to register with GP practice",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle New Appointment
  const handleNewAppointment = async (formData: AppointmentFormData) => {
    try {
      setIsSubmitting(true);
      const response = await AppointmentService.createAppointment({
        ...formData,
        patient: userData?.id as number
      });
      
      if (response.status === 200 && response.data) {
        if (response.data) {
          setAppointments(prev => [...prev, response.data as Appointment]);
        }
        setIsAddingAppointment(false);
        toast({
          title: "Success",
          description: "Appointment booked successfully",
        });
      } else {
        throw new Error(response.error || 'Booking failed');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to book appointment",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Appointment Cancellation
  const handleCancelAppointment = async (appointmentId: number) => {
    try {
      const response = await AppointmentService.cancelAppointment(appointmentId);
      if (response.status === 200) {
        setAppointments(prev => 
          prev.map(apt => 
            apt.id === appointmentId 
              ? { ...apt, status: 'CANCELLED' } 
              : apt
          )
        );
        toast({
          title: "Success",
          description: "Appointment cancelled successfully",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cancel appointment",
        variant: "destructive"
      });
    }
  };

  // Filter appointments
  const filteredAppointments = appointments.filter(appointment => {
    const searchFields = [
      appointment.reason.toLowerCase(),
      appointment?.provider_name?.toLowerCase() || '',
    ];
    
    const matchesSearch = searchTerm === '' || 
      searchFields.some(field => field.includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter.includes(appointment.status);
    
    return matchesSearch && matchesStatus;
  });

  if (loading || userLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <GlobalErrorBoundary fallback={<div>Something went wrong. Please try again later.</div>}>
      <div className="min-h-screen bg-gradient-to-b from-gray-100 via-gray-50 to-white p-4 sm:p-6 md:p-8">
        {/* GP Registration Warning */}
        {!isBookingEnabled && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
              <p className="text-sm text-yellow-700">
                You need to register with a GP practice before booking appointments.
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                className="ml-4"
                onClick={() => setShowGPRegistrationDialog(true)}
              >
                Register Now
              </Button>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Search and Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                className="pl-10"
                placeholder="Search appointments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button
              onClick={() => setIsAddingAppointment(true)}
              disabled={!isBookingEnabled}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="mr-2" /> New Appointment
            </Button>
          </div>

          {/* Appointments List */}
          <div className="grid gap-6">
            {filteredAppointments.length > 0 ? (
              filteredAppointments.map((appointment) => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                  onCancel={() => handleCancelAppointment(appointment.id)}
                />
              ))
            ) : (
              <div className="text-center py-10">
                <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">
                  No appointments found
                </h3>
                <p className="mt-1 text-gray-500">
                  {searchTerm ? 'Try adjusting your search terms' : 'Schedule your first appointment'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* GP Registration Dialog */}
        <GPRegistrationDialog
          open={showGPRegistrationDialog}
          onOpenChange={setShowGPRegistrationDialog}
          practices={availableGPPractices}
          onSubmit={handleGPRegistration}
          isSubmitting={isSubmitting}
        />

        {/* New Appointment Dialog */}
        <Dialog open={isAddingAppointment} onOpenChange={setIsAddingAppointment}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Book New Appointment</DialogTitle>
            </DialogHeader>
            
            <AppointmentForm
              onSubmit={handleNewAppointment}
              practiceId={userData?.current_gp_practice?.toString() || ''}
              isSubmitting={isSubmitting}
            />
          </DialogContent>
        </Dialog>
      </div>
    </GlobalErrorBoundary>
  );
}