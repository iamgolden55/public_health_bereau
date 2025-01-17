// app/auth/register/components/RegistrationSteps.tsx
"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import africaData from "@/app/api/african.json"; // Ensure this path is correct
import { useEffect } from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  RotateCcw,
  Copy,
  Sun,
  MoreVertical,
  Volume2,
  ArrowUp,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "@/components/ui/toast";
import { API_BASE_URL } from "@/app/config";
import { CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";





const RegistrationSteps = {
    PERSONAL_INFO: 'personal_info',
    MEDICAL_HISTORY: 'medical_history',
    GP_REGISTRATION: 'gp_registration',
    VERIFICATION: 'verification'
  };
  
  const GPRegistrationStep = () => {
    const [postcode, setPostcode] = useState('');
    const [gpPractices, setGPPractices] = useState([]);
    const [selectedPractice, setSelectedPractice] = useState(null);
  
    const searchGPPractices = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/gp-practices/?postcode=${postcode}`,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
            }
          }
        );
        
        const data = await response.json();
        setGPPractices(data);
      } catch (error) {
        console.error('Error searching GP practices:', error);
      }
    };
  
    const registerWithGP = async (practiceId: string) => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/gp-practices/${practiceId}/register_patient/`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
            }
          }
        );
        
        const data = await response.json();
        
        if (response.ok) {
          // Move to next step or show success
          toast({
            title: "GP Registration Submitted",
            description: "Your GP registration request has been submitted successfully.",
          });
        }
      } catch (error) {
        console.error('Error registering with GP:', error);
      }
    };
  
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Register with a GP Practice</h2>
          <p className="text-muted-foreground">
            Find and register with a GP practice near you using your postcode
          </p>
        </div>
  
        <div className="flex gap-4">
          <Input 
            placeholder="Enter your postcode"
            value={postcode}
            onChange={(e) => setPostcode(e.target.value)}
          />
          <Button onClick={searchGPPractices}>Search</Button>
        </div>
  
        {gpPractices.length > 0 && (
          <div className="space-y-4">
            {gpPractices.map((practice) => (
              <Card key={practice.id}>
                <CardHeader>
                  <CardTitle>{practice.name}</CardTitle>
                  <CardDescription>{practice.address}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div>
                      <p>Contact: {practice.contact_number}</p>
                      <p>Accepting new patients: {practice.is_accepting_patients ? 'Yes' : 'No'}</p>
                    </div>
                    <Button onClick={() => registerWithGP(practice.id)}>
                      Register with this Practice
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  };