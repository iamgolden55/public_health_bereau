'use client'

import React, { useState } from 'react'
import { MapPin, Navigation, Home, ChevronLeft, AlertCircle, Baby, Heart, Brain, Pill, Bone, Plus } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function Emergency() {
  const [selectedEmergency, setSelectedEmergency] = useState<string | null>(null)

  const emergencyTypes = [
    { id: 'accident', title: 'Accident Emergency', icon: AlertCircle, description: 'Injuries, falls, or accidents' },
    { id: 'pregnancy', title: 'Pregnancy Emergency', icon: Baby, description: 'Labor, pregnancy complications' },
    { id: 'cardiac', title: 'Cardiac Emergency', icon: Heart, description: 'Chest pain, heart problems' },
    { id: 'neurological', title: 'Neurological Emergency', icon: Brain, description: 'Seizures, severe headaches' },
    { id: 'medical', title: 'Medical Emergency', icon: Pill, description: 'Severe illness, allergic reactions' },
    { id: 'orthopedic', title: 'Orthopedic Emergency', icon: Bone, description: 'Broken bones, severe sprains' },
    { id: 'other', title: 'Other Emergency', icon: Plus, description: 'Any other urgent medical situation' },
  ]

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <header className="bg-red-600 text-white p-4 flex items-center">
        {selectedEmergency && (
          <Button variant="ghost" size="icon" className="mr-2" onClick={() => setSelectedEmergency(null)}>
            <ChevronLeft className="h-6 w-6" />
          </Button>
        )}
        <div>
          <h1 className="text-2xl font-bold">PHB Emergency</h1>
          <p className="text-sm opacity-90">
            {selectedEmergency ? emergencyTypes.find(e => e.id === selectedEmergency)?.title : 'Select Emergency Type'}
          </p>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 p-4 flex flex-col">
        {!selectedEmergency ? (
          <ScrollArea className="flex-1">
            <div className="space-y-2">
              {emergencyTypes.map((emergency) => (
                <Button
                  key={emergency.id}
                  variant="outline"
                  className="w-full justify-between p-4 h-auto"
                  onClick={() => setSelectedEmergency(emergency.id)}
                >
                  <div className="flex items-center">
                    <emergency.icon className="h-5 w-5 text-red-600 mr-3" />
                    <div className="text-left">
                      <div className="font-medium">{emergency.title}</div>
                      <p className="text-sm text-muted-foreground">{emergency.description}</p>
                    </div>
                  </div>
                  <ChevronLeft className="h-5 w-5 text-muted-foreground rotate-180" />
                </Button>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <>
            {/* Map View */}
            <Card className="mb-4 flex-1">
              <CardContent className="p-0 h-full relative">
                <div className="absolute inset-0 bg-gray-200 rounded-lg">
                  {/* Placeholder for map */}
                  <img
                    src="/placeholder.svg?height=400&width=600"
                    alt="Map"
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <MapPin className="h-12 w-12 text-red-600 drop-shadow-lg" />
                </div>
              </CardContent>
            </Card>

            {/* Service Options */}
            <div className="grid grid-cols-2 gap-4">
              <Button className="h-auto py-4 flex-col" onClick={() => alert('Directing to nearest clinic...')}>
                <Navigation className="h-6 w-6 mb-2" />
                <span>Nearest Clinic</span>
              </Button>
              <Button className="h-auto py-4 flex-col" variant="outline" onClick={() => alert('Ordering home service...')}>
                <Home className="h-6 w-6 mb-2" />
                <span>Home Service</span>
              </Button>
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 p-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
              <p className="text-sm">If this is a life-threatening emergency, please call emergency services immediately.</p>
            </div>
          </CardContent>
        </Card>
      </footer>
    </div>
  )
}