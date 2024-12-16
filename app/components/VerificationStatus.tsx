// app/dashboard/components/VerificationStatus.tsx
'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Shield, FileCheck, Building2, UserPlus, Brain, CheckCircle2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { VerificationStatus } from '@/app/stores/surgeryVerificationStore'
import { VerificationStep } from './VerificationStep'

interface VerificationStatusProps {
  verification: VerificationStatus
  showDetails?: boolean
}

export const VerificationStatusDisplay = ({ verification, showDetails = false }: VerificationStatusProps) => {
  const getVerificationProgress = () => {
    const steps = [
      verification.documentVerification,
      verification.hospitalVerification,
      verification.surgeonVerification,
      verification.aiVerification,
      verification.doctorReview
    ]
    return (steps.filter(Boolean).length / steps.length) * 100
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Shield className="w-5 h-5 text-blue-500" />
          Verification Status
          {verification.status === 'verified' && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="ml-auto"
            >
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            </motion.div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Progress value={getVerificationProgress()} className="w-full" />

          {showDetails && (
            <div className="space-y-4 mt-4">
              <VerificationStep
                title="Document Verification"
                completed={verification.documentVerification}
                description="Verification of all submitted medical documents"
              />
              <VerificationStep
                title="Hospital Verification"
                completed={verification.hospitalVerification}
                description="Confirmation of hospital and facility details"
              />
              <VerificationStep
                title="Surgeon Verification"
                completed={verification.surgeonVerification}
                description="Validation of surgeon credentials and availability"
              />
              <VerificationStep
                title="AI Analysis"
                completed={verification.aiVerification}
                description="Automated verification using AI technology"
              />
              <VerificationStep
                title="Doctor Review"
                completed={verification.doctorReview}
                description="Final review by medical professional"
              />
            </div>
          )}

          {verification.notes && (
            <p className="text-sm text-gray-500 mt-4">
              {verification.notes}
            </p>
          )}

          {verification.error && (
            <p className="text-sm text-red-500 mt-4">
              {verification.error}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}