// app/dashboard/ViewSurgeryModal.tsx
'use client'

import React, { useState } from 'react'
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Calendar,
  Building2,
  UserPlus,
  FileText,
  Clock,
  AlertCircle,
  CheckCircle2,
  Download,
  Printer,
  Share2,
  ChevronLeft,
  Eye,
  Clock3,
  Stethoscope,
  Upload,
  ClipboardCheck,
  UserCog
} from 'lucide-react'
import { useSurgeryStore } from '@/app/stores/surgeryStore'
import { useVerificationStore } from '@/app/stores/surgeryVerificationStore'
import { VerificationStatusDisplay } from '../../components/VerificationStatus'
import { VerificationStep } from '../../components/VerificationStep'
import { motion, AnimatePresence } from 'framer-motion'

interface ViewSurgeryModalProps {
  surgeryId: string
  onClose: () => void
}

export const ViewSurgeryModal = ({ surgeryId, onClose }: ViewSurgeryModalProps) => {
  const { getSurgery } = useSurgeryStore()
  const { getVerificationStatus } = useVerificationStore()
  const [activeTab, setActiveTab] = useState('details')

  const surgery = getSurgery(surgeryId)
  const verificationStatus = getVerificationStatus(surgeryId)

  if (!surgery) return null

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'SCHEDULED':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
      case 'COMPLETED':
        return 'bg-green-500/10 text-green-500 border-green-500/20'
      case 'CANCELLED':
        return 'bg-red-500/10 text-red-500 border-red-500/20'
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20'
    }
  }

  const statusIcon = {
    'SCHEDULED': <Clock3 className="w-4 h-4" />,
    'COMPLETED': <CheckCircle2 className="w-4 h-4" />,
    'CANCELLED': <AlertCircle className="w-4 h-4" />
  }

  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent className="relative flex flex-col max-w-4xl w-[90vw] max-h-[90vh] p-0 bg-white dark:bg-gray-900 rounded-lg overflow-hidden border shadow-lg">
        {/* Fixed Header */}
        <div className="sticky top-0 z-20 bg-white dark:bg-gray-900 border-b px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={onClose}
              className="hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Badge 
              className={`${getStatusColor(surgery.status)} px-4 py-1.5 flex items-center gap-2`}
            >
              {statusIcon[surgery.status as keyof typeof statusIcon]}
              {surgery.status}
            </Badge>
          </div>

          {/* Surgery Title and Date */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                {surgery.name}
              </h2>
              <p className="text-gray-500 dark:text-gray-400 flex items-center gap-2 mt-1">
                <Calendar className="w-4 h-4" />
                {new Date(surgery.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" className="w-full sm:w-auto">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm" className="w-full sm:w-auto">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button 
                className="bg-black text-white hover:bg-gray-900 w-full sm:w-auto" 
                size="sm"
              >
                <Printer className="w-4 h-4 mr-2" />
                Print Record
              </Button>
            </div>
          </div>

          {/* Tabs Navigation */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
            <TabsList className="bg-gray-100/50 dark:bg-gray-800/50 p-1 h-12 w-full flex justify-start gap-1 rounded-lg">
              <TabsTrigger 
                value="details"
                className="flex-1 md:flex-none data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800"
              >
                <Eye className="w-4 h-4 mr-2" />
                Details
              </TabsTrigger>
              <TabsTrigger 
                value="verification"
                className="flex-1 md:flex-none data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800"
              >
                <ClipboardCheck className="w-4 h-4 mr-2" />
                Verification
              </TabsTrigger>
              <TabsTrigger 
                value="documents"
                className="flex-1 md:flex-none data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800"
              >
                <FileText className="w-4 h-4 mr-2" />
                Documents
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Main Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <AnimatePresence mode="wait">
            {/* Details Tab */}
            <TabsContent value="details" asChild>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* Key Information Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="bg-blue-50/50">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-blue-500/10 rounded-lg">
                          <Building2 className="w-5 h-5 text-blue-500" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Hospital</p>
                          <p className="font-medium mt-1">{surgery.hospital}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-purple-50/50">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-purple-500/10 rounded-lg">
                          <UserCog className="w-5 h-5 text-purple-500" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Surgeon</p>
                          <p className="font-medium mt-1">{surgery.surgeon}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-green-50/50">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-green-500/10 rounded-lg">
                          <Stethoscope className="w-5 h-5 text-green-500" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Type</p>
                          <p className="font-medium mt-1">{surgery.name}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Description */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Procedure Description</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 leading-relaxed">
                      {surgery.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* Verification Tab */}
            <TabsContent value="verification" asChild>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {verificationStatus && (
                  <VerificationStatusDisplay 
                    verification={verificationStatus}
                    showDetails={true}
                  />
                )}
              </motion.div>
            </TabsContent>

            {/* Documents Tab */}
            <TabsContent value="documents" asChild>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Supporting Documents</CardTitle>
                      <Button variant="outline" size="sm">
                        <Upload className="w-4 h-4 mr-2" />
                        Upload New
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {surgery.documents && surgery.documents.length > 0 ? (
                      <div className="space-y-4">
                        {surgery.documents.map((doc, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-4 rounded-lg border hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-blue-50">
                                <FileText className="w-4 h-4 text-blue-500" />
                              </div>
                              <div>
                                <p className="font-medium">{doc}</p>
                                <p className="text-sm text-gray-500">Added {new Date().toLocaleDateString()}</p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm">
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Download className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <FileText className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-1">No Documents Yet</h3>
                        <p className="text-gray-500">Upload supporting documents for this surgery</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  )
}