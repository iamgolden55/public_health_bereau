import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { GPPractice } from "@/app/types/medical/gp";
import { MapPin, Phone, Mail, Users, Check, Loader2 } from "lucide-react";

interface GPRegistrationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  practices: GPPractice[];
  onSubmit: (practiceId: string) => void;
  isSubmitting: boolean;
}

export const GPRegistrationDialog = ({
  open,
  onOpenChange,
  practices = [], // Default empty array
  onSubmit,
  isSubmitting
}: GPRegistrationDialogProps) => {
  // Ensure practices is always an array
  const practicesList = Array.isArray(practices) ? practices : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Register with a GP Practice</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="flex-1 pr-4">
          <div className="grid gap-4">
            {practicesList.map((practice) => (
              <Card key={practice.id} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold text-lg">{practice.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          Registration Number: {practice.registration_number}
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>{practice.address}, {practice.city}, {practice.postcode}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>{practice.contact_number}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span>{practice.email}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>{practice.capacity} patient capacity</span>
                        </div>
                      </div>
                    </div>
                    
                    <Button
                      onClick={() => onSubmit(practice.id.toString())}
                      disabled={isSubmitting || !practice.is_accepting_patients}
                      className="min-w-[120px]"
                    >
                      {isSubmitting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : practice.is_accepting_patients ? (
                        <>
                          <Check className="mr-2 h-4 w-4" />
                          Register
                        </>
                      ) : (
                        "Not Accepting"
                      )}
                    </Button>
                  </div>

                  {!practice.is_accepting_patients && (
                    <p className="mt-4 text-sm text-red-500">
                      This practice is currently not accepting new patients.
                    </p>
                  )}

                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2">Opening Hours</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {Object.entries(practice.opening_hours).map(([day, hours]) => (
                        <div key={day} className="flex justify-between">
                          <span className="font-medium">{day}:</span>
                          <span>{hours}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {practicesList.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No GP practices found in your area.
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};