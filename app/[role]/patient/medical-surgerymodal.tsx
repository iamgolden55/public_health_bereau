// app/dashboard/medical-surgerymodal.tsx
'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { X, Upload, AlertCircle, Calendar, Building2, UserPlus, FileText } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useSurgeryStore } from '@/app/stores/surgeryStore'
import { useVerificationStore } from '@/app/stores/surgeryVerificationStore'
import { VerificationStatusDisplay } from '../../components/VerificationStatus'
import { motion } from 'framer-motion'

export const AddSurgeryModal = () => {
  const { isAddModalOpen, setAddModalOpen, addSurgery } = useSurgeryStore()
  const { createVerification, startVerification, getVerificationStatus, isVerifying } = useVerificationStore()
  
  // Form states
  const [surgeryId, setSurgeryId] = useState('')
  const [surgeryName, setSurgeryName] = useState('')
  const [surgeryDate, setSurgeryDate] = useState('')
  const [hospital, setHospital] = useState('')
  const [surgeon, setSurgeon] = useState('')
  const [description, setDescription] = useState('')
  const [documents, setDocuments] = useState<File[]>([])
  const [verificationError, setVerificationError] = useState<string | null>(null)

  // Initialize verification on mount
  useEffect(() => {
    if (isAddModalOpen && !surgeryId) {
      const newId = `surgery-${Date.now()}`
      setSurgeryId(newId)
      createVerification(newId)
    }

    // Cleanup function
    return () => {
      if (!isAddModalOpen) {
        setSurgeryId('')
        setVerificationError(null)
      }
    }
  }, [isAddModalOpen, createVerification, surgeryId])

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!surgeryId) return

    try {
      const files = Array.from(e.target.files || [])
      if (files.length > 0) {
        setDocuments(prev => [...prev, ...files])
        
        // Update verification status for documents
        await startVerification(surgeryId)
      }
    } catch (error) {
      setVerificationError('Error uploading documents. Please try again.')
    }
  }, [surgeryId, startVerification])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!surgeryId) {
      setVerificationError('Invalid surgery ID. Please try again.')
      return
    }
    
    try {
      // Start verification process
      await startVerification(surgeryId)
      const verificationStatus = getVerificationStatus(surgeryId)
      
      if (verificationStatus?.status === 'verified') {
        const newSurgery = {
          id: surgeryId,
          name: surgeryName,
          date: surgeryDate,
          hospital,
          surgeon,
          description,
          documents: documents.map(doc => doc.name),
          verificationStatus: 'verified',
          status: 'SCHEDULED'
        }

        addSurgery(newSurgery)
        handleClose()
      } else {
        setVerificationError('Verification failed. Please check the requirements and try again.')
      }
    } catch (error) {
      setVerificationError(error instanceof Error ? error.message : 'An error occurred during verification')
    }
  }

  const handleClose = useCallback(() => {
    setAddModalOpen(false)
    // Reset form
    setSurgeryId('')
    setSurgeryName('')
    setSurgeryDate('')
    setHospital('')
    setSurgeon('')
    setDescription('')
    setDocuments([])
    setVerificationError(null)
  }, [setAddModalOpen])

  const verificationStatus = surgeryId ? getVerificationStatus(surgeryId) : null

  return (
    <Dialog open={isAddModalOpen} onOpenChange={setAddModalOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add New Surgery Record</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Surgery Name */}
          <div className="space-y-2">
            <Label htmlFor="surgeryName">Surgery Name</Label>
            <Input
              id="surgeryName"
              value={surgeryName}
              onChange={(e) => setSurgeryName(e.target.value)}
              placeholder="Enter surgery name"
              required
            />
          </div>

          {/* Surgery Date */}
          <div className="space-y-2">
            <Label htmlFor="surgeryDate">Surgery Date</Label>
            <div className="relative">
              <Input
                id="surgeryDate"
                type="date"
                value={surgeryDate}
                onChange={(e) => setSurgeryDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                required
              />
              <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-gray-500" />
            </div>
          </div>

          {/* Hospital Information */}
          <div className="space-y-2">
            <Label htmlFor="hospital">Hospital</Label>
            <div className="relative">
              <Input
                id="hospital"
                value={hospital}
                onChange={(e) => setHospital(e.target.value)}
                placeholder="Enter hospital name"
                required
              />
              <Building2 className="absolute right-3 top-2.5 h-4 w-4 text-gray-500" />
              {verificationStatus?.hospitalVerification && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute right-10 top-2.5"
                >
                  <span className="text-green-500">✓</span>
                </motion.div>
              )}
            </div>
          </div>

          {/* Surgeon Information */}
          <div className="space-y-2">
            <Label htmlFor="surgeon">Surgeon</Label>
            <div className="relative">
              <Input
                id="surgeon"
                value={surgeon}
                onChange={(e) => setSurgeon(e.target.value)}
                placeholder="Enter surgeon name"
                required
              />
              <UserPlus className="absolute right-3 top-2.5 h-4 w-4 text-gray-500" />
              {verificationStatus?.surgeonVerification && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute right-10 top-2.5"
                >
                  <span className="text-green-500">✓</span>
                </motion.div>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter surgery description"
              required
            />
          </div>

          {/* Document Upload */}
          <div className="space-y-2">
            <Label>Supporting Documents</Label>
            <div className="border-2 border-dashed border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-center">
                <label className="flex flex-col items-center gap-2 cursor-pointer">
                  <Upload className="h-8 w-8 text-gray-400" />
                  <span className="text-sm text-gray-500">Upload files</span>
                  <input
                    type="file"
                    className="hidden"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    onChange={handleFileUpload}
                  />
                </label>
              </div>
              {documents.length > 0 && (
                <div className="mt-4 space-y-2">
                  {documents.map((doc, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{doc.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Verification Status Display */}
          {verificationStatus && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <VerificationStatusDisplay 
                verification={verificationStatus}
                showDetails={true}
              />
            </motion.div>
          )}

          {/* Error Display */}
          {verificationError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Verification Error</AlertTitle>
              <AlertDescription>{verificationError}</AlertDescription>
            </Alert>
          )}

          {/* Submit Button */}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isVerifying || !surgeryId}
              className="bg-black text-white"
            >
              {isVerifying ? 'Verifying...' : 'Add Surgery Record'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}