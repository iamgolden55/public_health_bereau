import { Plane } from 'lucide-react'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'

interface TicketDetailProps {
  isOpen: boolean
  onClose: () => void
  ticket: {
    id: string
    type: string
    from: string
    fromCity: string
    to: string
    toCity: string
    departureTime: string
    arrivalTime: string
    date: string
    fromTerminal: string
    fromGate: string
    toTerminal: string
    toGate: string
    flightNumber: string
  }
}

export function TicketDetail({ isOpen, onClose, ticket }: TicketDetailProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-6">
        {/* Add DialogTitle for Accessibility */}
        <DialogTitle>{`Details for ${ticket.flightNumber}`}</DialogTitle>
        <div className="relative bg-[#E57559] text-white rounded-2xl overflow-hidden">
          <div className="absolute left-8 top-0 bottom-0 flex items-center -rotate-90">
            <span className="text-4xl font-bold opacity-20">{ticket.flightNumber}</span>
          </div>

          {/* Jagged edge separator */}
          <div className="absolute left-1/2 top-0 bottom-0 w-4 -ml-2">
            <div className="h-full w-full flex flex-col justify-between py-2">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="w-4 h-4">
                  <div className="w-2 h-4 bg-white" />
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 h-full">
            {/* Left side */}
            <div className="p-6">
              <div className="mb-8">
                <div className="text-4xl font-bold mb-1">{ticket.from}</div>
                <div className="text-lg text-white/70">{ticket.fromCity}</div>
              </div>

              <div className="space-y-1 mb-4">
                <div className="text-2xl text-[#FF9980]">{ticket.departureTime}</div>
                <div className="text-white/70">{ticket.date}</div>
              </div>

              <div className="space-y-2">
                <div className="flex gap-2">
                  <span className="text-white/70">Terminal</span>
                  <span className="text-[#FF9980] font-medium">{ticket.fromTerminal}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-white/70">Gate</span>
                  <span className="text-[#FF9980] font-medium">{ticket.fromGate}</span>
                </div>
              </div>
            </div>

            {/* Right side */}
            <div className="p-6 bg-white/10">
              <div className="mb-8">
                <div className="text-4xl font-bold mb-1">{ticket.to}</div>
                <div className="text-lg text-white/70">{ticket.toCity}</div>
              </div>

              <div className="space-y-1 mb-4">
                <div className="text-2xl text-[#FF9980]">{ticket.arrivalTime}</div>
                <div className="text-white/70">{ticket.date}</div>
              </div>

              <div className="space-y-2">
                <div className="flex gap-2">
                  <span className="text-white/70">Terminal</span>
                  <span className="text-[#FF9980] font-medium">{ticket.toTerminal}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-white/70">Gate</span>
                  <span className="text-[#FF9980] font-medium">{ticket.toGate}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
