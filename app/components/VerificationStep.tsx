// app/dashboard/components/VerificationStep.tsx
import { CheckCircle2, Clock } from 'lucide-react'
import { Badge } from "@/components/ui/badge"

interface VerificationStepProps {
  title: string;
  completed: boolean;
  description: string;
}

export const VerificationStep = ({ title, completed, description }: VerificationStepProps) => {
  return (
    <div className="flex items-start gap-3 p-4 rounded-lg border">
      <div className={`p-2 rounded-full ${
        completed ? 'bg-green-100' : 'bg-gray-100'
      }`}>
        {completed ? (
          <CheckCircle2 className="w-4 h-4 text-green-600" />
        ) : (
          <Clock className="w-4 h-4 text-gray-400" />
        )}
      </div>
      <div>
        <h3 className="font-medium flex items-center gap-2">
          {title}
          {completed && (
            <Badge className="bg-green-100 text-green-700">
              Completed
            </Badge>
          )}
        </h3>
        <p className="text-sm text-gray-500 mt-1">{description}</p>
      </div>
    </div>
  )
}