import React, { useState, useEffect } from 'react';
import AppointmentService from '@/app/services/medical/appointments';
import { AppointmentFormData, AvailableSlot, GeneralPractitioner } from '@/app/types/medical';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from 'lucide-react';

interface AppointmentFormProps {
  onSubmit: (data: AppointmentFormData) => Promise<void>;
  practiceId: string;
  isSubmitting: boolean;
}

const APPOINTMENT_DURATIONS = [
  { value: '900', label: '15 minutes' },
  { value: '1800', label: '30 minutes' },
  { value: '2700', label: '45 minutes' },
  { value: '3600', label: '1 hour' }
];

export const AppointmentForm: React.FC<AppointmentFormProps> = ({
  onSubmit,
  practiceId,
  isSubmitting
}) => {
  const [doctors, setDoctors] = useState<GeneralPractitioner[]>([]);
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [formError, setFormError] = useState<string>('');

  useEffect(() => {
    const loadDoctors = async () => {
      const response = await AppointmentService.getDoctors(practiceId);
      if (response.data) {
        setDoctors(response.data);
      }
    };
    
    if (practiceId) {
      loadDoctors();
    }
  }, [practiceId]);

  useEffect(() => {
    const loadAvailableSlots = async () => {
      if (selectedDoctor && selectedDate) {
        const response = await AppointmentService.getAvailableSlots(practiceId, selectedDoctor, selectedDate);
        if (response.data) {
          setAvailableSlots(response.data);
        }
      }
    };

    loadAvailableSlots();
  }, [selectedDoctor, selectedDate, practiceId]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError('');

    const formData = new FormData(e.currentTarget);
    const appointmentData: Partial<AppointmentFormData> = {
      appointment_type: formData.get('appointmentType') as AppointmentFormData['appointment_type'],
      priority: formData.get('priority') as AppointmentFormData['priority'],
      reason: formData.get('reason') as string,
      provider: parseInt(selectedDoctor),
      appointment_date: `${selectedDate}T${formData.get('time')}`,
      duration: formData.get('duration') as string,
      notes: formData.get('notes') as string,
      reminders_enabled: formData.get('reminders') === 'on',
      practice: parseInt(practiceId)
    };

    // Validate time slot availability
    const availabilityCheck = await AppointmentService.checkAvailability(appointmentData);
    if (!availabilityCheck.data) {
      setFormError('Selected time slot is no longer available');
      return;
    }

    await onSubmit(appointmentData as AppointmentFormData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {formError && (
        <Alert variant="destructive">
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      )}

      <div>
        <Label htmlFor="appointmentType">Appointment Type</Label>
        <Select name="appointmentType" required>
          <SelectTrigger>
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="GP_ROUTINE">GP Routine</SelectItem>
            <SelectItem value="GP_FOLLOWUP">GP Follow-up</SelectItem>
            <SelectItem value="SPECIALIST">Specialist</SelectItem>
            <SelectItem value="EMERGENCY">Emergency</SelectItem>
            <SelectItem value="VACCINATION">Vaccination</SelectItem>
            <SelectItem value="SCREENING">Screening</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="priority">Priority Level</Label>
        <Select name="priority" required>
          <SelectTrigger>
            <SelectValue placeholder="Select priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ROUTINE">Routine</SelectItem>
            <SelectItem value="URGENT">Urgent</SelectItem>
            <SelectItem value="EMERGENCY">Emergency</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="doctor">Doctor</Label>
        <Select 
          value={selectedDoctor} 
          onValueChange={setSelectedDoctor}
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Select doctor" />
          </SelectTrigger>
          <SelectContent>
            {doctors.map(doctor => (
              <SelectItem 
                key={doctor.id} 
                value={doctor.id.toString()}
                disabled={!doctor.is_accepting_appointments}
              >
                Dr. {doctor.user} {!doctor.is_accepting_appointments && "(Not Available)"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="date">Date</Label>
        <Input 
          name="date" 
          type="date" 
          required
          min={new Date().toISOString().split('T')[0]}
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />
      </div>

      {selectedDate && selectedDoctor && (
        <div>
          <Label htmlFor="time">Available Time Slots</Label>
          <Select name="time" required>
            <SelectTrigger>
              <SelectValue placeholder="Select time" />
            </SelectTrigger>
            <SelectContent>
              {availableSlots.map(slot => (
                <SelectItem 
                  key={slot.start_time} 
                  value={new Date(slot.start_time).toLocaleTimeString()}
                >
                  {new Date(slot.start_time).toLocaleTimeString()} - 
                  {new Date(slot.end_time).toLocaleTimeString()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div>
        <Label htmlFor="duration">Duration</Label>
        <Select name="duration" required>
          <SelectTrigger>
            <SelectValue placeholder="Select duration" />
          </SelectTrigger>
          <SelectContent>
            {APPOINTMENT_DURATIONS.map(duration => (
              <SelectItem key={duration.value} value={duration.value}>
                {duration.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="reason">Reason for Visit</Label>
        <Textarea name="reason" required placeholder="Please describe your reason for visit" />
      </div>

      <div>
        <Label htmlFor="notes">Additional Notes</Label>
        <Textarea name="notes" placeholder="Any additional information" />
      </div>

      <div className="flex items-center space-x-2">
        <Switch name="reminders" id="reminders" defaultChecked />
        <Label htmlFor="reminders">Enable appointment reminders</Label>
      </div>

      <Button 
        type="submit" 
        disabled={isSubmitting}
        className="w-full"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Scheduling...
          </>
        ) : (
          'Schedule Appointment'
        )}
      </Button>
    </form>
  );
};

export default AppointmentForm;