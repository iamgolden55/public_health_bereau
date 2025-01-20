import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  AlertCircle,
  ChevronRight 
} from 'lucide-react';
import { Appointment } from '@/app/types/medical';

interface AppointmentCardProps {
  appointment: Appointment;
  onCancel: () => Promise<void>;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'SCHEDULED':
      return 'bg-blue-100 text-blue-800';
    case 'COMPLETED':
      return 'bg-green-100 text-green-800';
    case 'CANCELLED':
      return 'bg-red-100 text-red-800';
    case 'NO_SHOW':
      return 'bg-orange-100 text-orange-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'EMERGENCY':
      return 'bg-red-100 text-red-800';
    case 'URGENT':
      return 'bg-orange-100 text-orange-800';
    case 'ROUTINE':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  onCancel
}) => {
  const appointmentDate = new Date(appointment.appointment_date);
  const formattedDate = appointmentDate.toLocaleDateString();
  const formattedTime = appointmentDate.toLocaleTimeString();
  
  const canCancel = appointment.status === 'SCHEDULED' && 
    new Date(appointment.appointment_date) > new Date(Date.now() + 24 * 60 * 60 * 1000);

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={`/api/avatar/${appointment.provider}`} />
              <AvatarFallback>
                {appointment.provider_name?.[0] || 'DR'}
              </AvatarFallback>
            </Avatar>
            
            <div>
              <h3 className="font-medium text-gray-900">
                {appointment.reason}
              </h3>
              <p className="text-sm text-gray-500">
                Dr. {appointment.provider_name}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end space-y-2">
            <Badge className={getStatusColor(appointment.status)}>
              {appointment.status.toLowerCase()}
            </Badge>
            <Badge className={getPriorityColor(appointment.priority)}>
              {appointment.priority.toLowerCase()}
            </Badge>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="flex items-center text-gray-600">
            <Calendar className="h-4 w-4 mr-2" />
            {formattedDate}
          </div>
          <div className="flex items-center text-gray-600">
            <Clock className="h-4 w-4 mr-2" />
            {formattedTime}
          </div>
          {appointment.practice && (
            <div className="col-span-2 flex items-center text-gray-600">
              <MapPin className="h-4 w-4 mr-2" />
              {appointment.practice}
            </div>
          )}
        </div>

        {appointment.notes && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-blue-500 mr-2" />
              <p className="text-sm text-gray-700">{appointment.notes}</p>
            </div>
          </div>
        )}

        <div className="mt-4 flex justify-between items-center">
          <Badge variant="outline" className={`${appointment.reminders_enabled ? 'bg-blue-50' : ''}`}>
            Reminders {appointment.reminders_enabled ? 'On' : 'Off'}
          </Badge>
          
          <div className="flex space-x-2">
            {canCancel && (
              <Button
                variant="outline"
                className="text-red-600 hover:bg-red-50"
                onClick={onCancel}
              >
                Cancel
              </Button>
            )}
            <Button variant="ghost" className="text-blue-600">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AppointmentCard;