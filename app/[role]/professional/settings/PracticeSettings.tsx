import React, { useState } from 'react';
import { useUser } from '@/app/context/user-context';
import { motion } from 'framer-motion';
import {
  Card,
  CardBody,
  CardHeader,
  Input,
  Button,
  Select,
  SelectItem,
  Textarea,
  Accordion,
  AccordionItem,
  Divider,
  Badge,
  Avatar,
  useDisclosure
} from "@nextui-org/react";
import {
  Award,
  Calendar as CalendarIcon,
  Clock,
  Building2,
  GraduationCap,
  Stethoscope,
  Globe,
  MapPin,
  Phone,
  Mail,
  AlertCircle,
  FileText,
  Plus,
  Settings2,
  Upload
} from "lucide-react";
import { format } from "date-fns";

// Interfaces
interface PracticeInfo {
  licenseNumber: string;  
  licenseExpiryDate: Date;
  professionalType: string;
  specialization: string;
  subSpecialization: string[];
  yearsOfExperience: number;
  boardCertifications: {
    name: string;
    issueDate: Date;
    expiryDate: Date;
  }[];
}

interface FormState {
  consultationDuration: string;
  maxPatientsPerDay: string;
  preferredLanguages: string;
  telemedicineAvailable: string;
}

interface EducationInfo {
  degree: string;
  institution: string;
  graduationYear: number;
  country: string;
  additionalQualifications: {
    qualification: string;
    institution: string;
    year: number;
  }[];
}

interface HospitalAffiliation {
  hospitalName: string;
  role: string;
  department: string;
  startDate: Date;
  endDate?: Date;
  isPrimary: boolean;
  workingHours: {
    days: string[];
    startTime: string;
    endTime: string;
  };
}

const PracticeSettings = () => {
  const { userData } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [activeSection, setActiveSection] = useState("license");
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Form state management
  const [formValues, setFormValues] = useState<FormState>({
    consultationDuration: '30',
    maxPatientsPerDay: '',
    preferredLanguages: '',
    telemedicineAvailable: 'yes'
  });

  const [practiceInfo, setPracticeInfo] = useState<PracticeInfo>({
    licenseNumber: "",
    licenseExpiryDate: new Date(),
    professionalType: "",
    specialization: "",
    subSpecialization: [],
    yearsOfExperience: 0,
    boardCertifications: []
  });

  // Constants for dropdowns and selections
  const PROFESSIONAL_TYPES = [
    { value: "DOCTOR", label: "Medical Doctor" },
    { value: "NURSE", label: "Registered Nurse" },
    { value: "SPECIALIST", label: "Medical Specialist" },
    { value: "SURGEON", label: "Surgeon" },
    { value: "RESIDENT", label: "Medical Resident" },
    { value: "CONSULTANT", label: "Consultant" }
  ];

  const SPECIALIZATIONS = [
    "Cardiology",
    "Neurology",
    "Orthopedics",
    "Pediatrics",
    "Internal Medicine",
    "Surgery",
    "Oncology",
    "Emergency Medicine",
    "Obstetrics & Gynecology",
    "Psychiatry"
  ];

  // Form submission handler
  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      // TODO: Add API call to save changes
      console.log('Saving form values:', {
        practiceInfo,
        formValues
      });
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
    } catch (error) {
      console.error('Error saving changes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle form value changes
  const handlePracticeInfoChange = (field: keyof PracticeInfo, value: any) => {
    setPracticeInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFormValueChange = (field: keyof FormState, value: string) => {
    setFormValues(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleReset = () => {
    setFormValues({
      consultationDuration: '30',
      maxPatientsPerDay: '',
      preferredLanguages: '',
      telemedicineAvailable: 'yes'
    });
  };

  const formatDate = (date: Date | undefined) => {
    if (!date) return "";
    return format(date, "PPP");
  };

  // Render functions for different cards
  const renderLicenseCard = () => (
    <Card className="w-full">
      <CardHeader className="flex gap-3">
        <Award className="w-6 h-6 text-warning"/>
        <div className="flex flex-col">
          <p className="text-md font-semibold">License & Certification</p>
          <p className="text-small text-default-500">Manage your professional licenses</p>
        </div>
      </CardHeader>
      <CardBody className="gap-4">
        <Input
          label="Medical License Number"
          placeholder="Enter license number"
          value={practiceInfo.licenseNumber}
          onChange={(e) => handlePracticeInfoChange('licenseNumber', e.target.value)}
          description="Your state/country medical license number"
        />
        <Input
          type="date"
          label="License Expiry Date"
          placeholder="Select date"
          value={practiceInfo.licenseExpiryDate?.toISOString().split('T')[0]}
          onChange={(e) => handlePracticeInfoChange('licenseExpiryDate', new Date(e.target.value))}
        />
        <div className="flex items-center gap-2 p-2 bg-warning-50 rounded-lg">
          <AlertCircle className="text-warning"/>
          <span className="text-sm">License renewal required in 90 days</span>
        </div>
      </CardBody>
    </Card>
  );

  const renderSpecializationCard = () => (
    <Card className="w-full">
      <CardHeader className="flex gap-3">
        <Stethoscope className="w-6 h-6 text-success"/>
        <div className="flex flex-col">
          <p className="text-md font-semibold">Specialization & Expertise</p>
          <p className="text-small text-default-500">Your medical specialties</p>
        </div>
      </CardHeader>
      <CardBody className="gap-4">
        <Select
          label="Professional Type"
          placeholder="Select type"
          selectedKeys={[practiceInfo.professionalType]}
          onChange={(e) => handlePracticeInfoChange('professionalType', e.target.value)}
        >
          {PROFESSIONAL_TYPES.map((type) => (
            <SelectItem key={type.value} value={type.value}>
              {type.label}
            </SelectItem>
          ))}
        </Select>

        <Select
          label="Primary Specialization"
          placeholder="Select specialization"
          selectedKeys={[practiceInfo.specialization]}
          onChange={(e) => handlePracticeInfoChange('specialization', e.target.value)}
        >
          {SPECIALIZATIONS.map((spec) => (
            <SelectItem key={spec} value={spec}>
              {spec}
            </SelectItem>
          ))}
        </Select>

        <Input
          type="number"
          label="Years of Experience"
          placeholder="Years of practice"
          min={0}
          value={practiceInfo.yearsOfExperience}
          onChange={(e) => handlePracticeInfoChange('yearsOfExperience', parseInt(e.target.value))}
        />
      </CardBody>
    </Card>
  );

  const renderHospitalAffiliations = () => (
    <Card className="w-full">
      <CardHeader className="flex gap-3">
        <Building2 className="w-6 h-6 text-success"/>
        <div className="flex flex-col">
          <p className="text-md font-semibold">Hospital Affiliations</p>
          <p className="text-small text-default-500">Manage your hospital associations</p>
        </div>
      </CardHeader>
      <CardBody>
        <Accordion>
          <AccordionItem
            key="1"
            aria-label="Primary Hospital Affiliation"
            title="Primary Hospital Affiliation"
          >
            <div className="flex flex-col gap-4 p-2">
              <Input
                label="Hospital Name"
                placeholder="Enter hospital name"
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Department"
                  placeholder="Enter department"
                />
                <Input
                  label="Role"
                  placeholder="Enter role"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  type="time"
                  label="Working Hours (Start)"
                />
                <Input
                  type="time"
                  label="Working Hours (End)"
                />
              </div>
            </div>
          </AccordionItem>
        </Accordion>
        <Button
          color="primary"
          variant="light"
          startContent={<Plus />}
          className="mt-4"
        >
          Add Another Hospital
        </Button>
      </CardBody>
    </Card>
  );

  const renderDocumentsCard = () => (
    <Card className="w-full">
      <CardHeader className="flex gap-3">
        <FileText className="w-6 h-6 text-danger"/>
        <div className="flex flex-col">
          <p className="text-md font-semibold">Documents & Verification</p>
          <p className="text-small text-default-500">Upload and manage documents</p>
        </div>
      </CardHeader>
      <CardBody className="gap-4">
        <div className="grid gap-4">
          {['Medical License', 'Board Certification', 'Medical Degree', 'Insurance'].map((doc) => (
            <div key={doc} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-default-400"/>
                <span>{doc}</span>
              </div>
              <Button
                size="sm"
                color="primary"
                variant="flat"
                startContent={<Upload className="w-4 h-4"/>}
              >
                Upload
              </Button>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="p-6 space-y-6"
    >
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Practice Settings</h1>
          <p className="text-default-500">Manage your professional information</p>
        </div>
        <Button
          color="primary"
          isLoading={isLoading}
          onClick={handleSubmit}
        >
          Save Changes
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {renderLicenseCard()}
        {renderSpecializationCard()}
        {renderHospitalAffiliations()}
        {renderDocumentsCard()}
      </div>

      <div className="flex justify-end gap-3">
        <Button 
          variant="bordered"
          onPress={handleReset}
        >
          Cancel
        </Button>
        <Button
          color="primary"
          isLoading={isLoading}
          onPress={handleSubmit}
        >
          Save All Changes
        </Button>
      </div>
    </motion.div>
  );
};

export default PracticeSettings;