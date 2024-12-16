// app/[role]/professional/resources.tsx
"use client"

import { useState } from 'react'
import { useUser } from '@/app/context/user-context';
import { motion } from 'framer-motion'
import Link from 'next/link'
import HealthVideoLibrary from './HealthVideoLibrary';
import { 
  Search, 
  Filter, 
  FileText, 
  BookOpen, 
  Microscope, 
  Download, 
  Share2, 
  ExternalLink, 
  Clock, 
  Star, 
  BookMarked,
  Scale,
  ClipboardList,
  FileBarChart,
  Brain,
  AlertTriangle
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { TabsContent, Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"


// Import constants
import { 
  MEDICAL_SPECIALTIES, 
  RESOURCE_CATEGORIES, 
  EVIDENCE_LEVELS,
  type MedicalResource 
} from './resources/constants'
import { Separator } from '@radix-ui/react-select';

// Define the allowed types
type ResourceType = 'guidelines' | 'protocols' | 'research' | 'videos';

// Add interface for component props
interface ResourcesProps {
    type?: ResourceType;
  }
  

// Enhanced Resource Card Component
const SAMPLE_RESOURCES: MedicalResource[] = [
    {
      id: '1',
      title: 'Hypertension Management Guidelines 2024',
      description: 'Updated guidelines for managing hypertension in adults',
      specialty: 'CARDIOLOGY',
      category: 'CLINICAL_GUIDELINES',
      evidenceLevel: 'LEVEL_1',
      lastUpdated: '2024-01-15',
      authors: ['Dr. Smith', 'Dr. Johnson'],
      institution: 'American Heart Association',
      keywords: ['hypertension', 'blood pressure', 'cardiovascular'],
      url: 'https://example.com/guidelines',
      downloadable: true,
      fileType: 'PDF',
      fileSize: 2.4,
      citations: 145,
      rating: 4.8,
      reviews: 32
    },
    {
      id: '2',
      title: 'Diabetes Care Protocol 2024',
      description: 'Comprehensive protocol for managing type 1 and type 2 diabetes',
      specialty: 'INTERNAL_MEDICINE',
      category: 'CLINICAL_GUIDELINES',
      evidenceLevel: 'LEVEL_1',
      lastUpdated: '2024-02-01',
      authors: ['Dr. Davis', 'Dr. Wilson'],
      institution: 'American Diabetes Association',
      keywords: ['diabetes', 'insulin', 'glucose management'],
      url: 'https://example.com/diabetes',
      downloadable: true,
      fileType: 'PDF',
      fileSize: 3.1,
      citations: 98,
      rating: 4.7,
      reviews: 45
    },
    {
      id: '3',
      title: 'Emergency Stroke Protocol',
      description: 'Acute stroke management and rapid response protocol',
      specialty: 'NEUROLOGY',
      category: 'TREATMENT_PROTOCOLS',
      evidenceLevel: 'LEVEL_1',
      lastUpdated: '2024-01-30',
      authors: ['Dr. Brown', 'Dr. Lee'],
      institution: 'American Stroke Association',
      keywords: ['stroke', 'emergency', 'neurological assessment'],
      url: 'https://example.com/stroke',
      downloadable: true,
      fileType: 'PDF',
      fileSize: 1.8,
      citations: 76,
      rating: 4.9,
      reviews: 28
    },
    {
      id: '4',
      title: 'COVID-19 Treatment Update',
      description: 'Latest research findings on COVID-19 treatment approaches',
      specialty: 'INTERNAL_MEDICINE',
      category: 'RESEARCH_PAPERS',
      evidenceLevel: 'LEVEL_2',
      lastUpdated: '2024-02-10',
      authors: ['Dr. Chen', 'Dr. Patel'],
      institution: 'CDC',
      keywords: ['covid-19', 'treatment', 'clinical trials'],
      url: 'https://example.com/covid',
      downloadable: true,
      fileType: 'PDF',
      fileSize: 2.9,
      citations: 234,
      rating: 4.6,
      reviews: 67
    },
    {
      id: '5',
      title: 'Pediatric Vaccination Schedule 2024',
      description: 'Updated immunization guidelines for children and adolescents',
      specialty: 'PEDIATRICS',
      category: 'CLINICAL_GUIDELINES',
      evidenceLevel: 'LEVEL_1',
      lastUpdated: '2024-01-05',
      authors: ['Dr. Martinez', 'Dr. Thompson'],
      institution: 'American Academy of Pediatrics',
      keywords: ['vaccination', 'pediatrics', 'immunization'],
      url: 'https://example.com/vaccines',
      downloadable: true,
      fileType: 'PDF',
      fileSize: 1.5,
      citations: 112,
      rating: 4.9,
      reviews: 53
    },
    {
      id: '6',
      title: 'Mental Health Assessment Tools',
      description: 'Standardized assessment protocols for mental health disorders',
      specialty: 'PSYCHIATRY',
      category: 'TREATMENT_PROTOCOLS',
      evidenceLevel: 'LEVEL_2',
      lastUpdated: '2024-01-20',
      authors: ['Dr. White', 'Dr. Garcia'],
      institution: 'American Psychiatric Association',
      keywords: ['mental health', 'assessment', 'psychiatric evaluation'],
      url: 'https://example.com/mental-health',
      downloadable: true,
      fileType: 'PDF',
      fileSize: 2.2,
      citations: 89,
      rating: 4.7,
      reviews: 41
    }
  ];
const ResourceCard = ({ resource }: { resource: MedicalResource }) => (
  <Card className="hover:shadow-lg transition-shadow">
    <CardContent className="p-6">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-semibold">{resource.title}</h3>
            <Badge 
              variant={resource.evidenceLevel === 'LEVEL_1' ? 'default' : 'secondary'}
              className="ml-2"
            >
              {MEDICAL_SPECIALTIES[resource.specialty].name}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">{resource.description}</p>
        </div>
        <div className="flex items-center space-x-1">
          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
          <span className="text-sm font-medium">{resource.rating}</span>
          <span className="text-sm text-muted-foreground">/5.0</span>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
          <div className="flex items-center">
            <Clock className="mr-1 h-4 w-4" />
            {new Date(resource.lastUpdated).toLocaleDateString()}
          </div>
          <div className="flex items-center">
            <FileText className="mr-1 h-4 w-4" />
            {resource.institution}
          </div>
          {resource.citations && (
            <div className="flex items-center">
              <BookOpen className="mr-1 h-4 w-4" />
              {resource.citations} citations
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {resource.downloadable && (
            <Button variant="outline" size="sm" className="h-8">
              <Download className="mr-2 h-4 w-4" />
              Download {resource.fileType}
            </Button>
          )}
          <Button variant="outline" size="sm" className="h-8">
            <ExternalLink className="mr-2 h-4 w-4" />
            View Source
          </Button>
          <Button variant="outline" size="sm" className="h-8">
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
        </div>
      </div>

      {resource.keywords && (
        <div className="mt-4 flex flex-wrap gap-2">
          {resource.keywords.map(keyword => (
            <Badge key={keyword} variant="secondary" className="text-xs">
              {keyword}
            </Badge>
          ))}
        </div>
      )}
    </CardContent>
  </Card>
)

// Quick Access Category Card
const CategoryCard = ({ 
    title, 
    description, 
    icon: Icon,
    category,
    onSelect
  }: { 
    title: string; 
    description: string; 
    icon: React.ElementType;
    category: string;
    onSelect: (category: string) => void;
  }) => (
    <Card 
      className="hover:bg-accent cursor-pointer transition-colors" 
      onClick={() => onSelect(category)}
    >
      <CardContent className="p-6">
        <div className="flex items-center space-x-4">
          <div className="bg-primary/10 p-3 rounded-lg">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="font-medium">{title}</h3>
            <p className="text-sm text-muted-foreground">
              {description}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )

// Sample categories for quick access
const QUICK_ACCESS_CATEGORIES = [
    {
      title: 'Clinical Guidelines',
      description: 'Standard diagnostic guides',
      icon: ClipboardList,
      category: 'CLINICAL_GUIDELINES'
    },
    {
      title: 'Treatment Protocols',
      description: 'Emergency procedures',
      icon: AlertTriangle,
      category: 'TREATMENT_PROTOCOLS'
    },
    {
      title: 'Research Papers',
      description: 'Latest clinical trials',
      icon: FileBarChart,
      category: 'RESEARCH_PAPERS'
    },
    {
      title: 'Medical Algorithms',
      description: 'Decision support tools',
      icon: Brain,
      category: 'MEDICAL_ALGORITHMS'
    }
  ]

export default function Resources({ type = 'guidelines' }: ResourcesProps) {
  // State management
  const [activeTab, setActiveTab] = useState("guidelines")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("all")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
  }
  const [resources, setResources] = useState(SAMPLE_RESOURCES)

  // Filter resources based on search and filters
  const filteredResources = resources.filter(resource => {
    // Existing search and filter conditions
    const matchesSearch = 
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesSpecialty = 
      selectedSpecialty === "all" || 
      resource.specialty === selectedSpecialty
    
    const matchesCategory = 
      selectedCategory === "all" || 
      resource.category === selectedCategory

    // Add type filtering
    const matchesType = 
      type === 'guidelines' ? resource.category === 'CLINICAL_GUIDELINES' :
      type === 'protocols' ? resource.category === 'TREATMENT_PROTOCOLS' :
      type === 'research' ? resource.category === 'RESEARCH_PAPERS' :
      true

    // Return true only if all conditions are met
    return matchesSearch && matchesSpecialty && matchesCategory && matchesType
  })

  return (
    <div className="p-6"> 
    <div className="space-y-6">
      {/* Header Section */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Medical Resources</h2>
        <p className="text-muted-foreground">
          Access clinical guidelines, protocols, research materials and research videos
        </p>
      </div>
        
        

        {type === 'research' && ( // Check if the current type is 'research'
        <Card>
            <CardHeader>
            <CardTitle>Health A to Z </CardTitle>
            <CardDescription>
            <p className="text-5l font-light tracking-tight">This resources is provided from the NHS Healthcare United Kingdom. You can use the Health A to Z to access information on over 850 medical conditions directly. Please engage with the <Link href="#" className="text-blue-500">Terms and conditions</Link> outlined.</p>
            </CardDescription>
            <CardContent className="space-y-4">
                <Separator />
                <div style={{ width: '100%', maxWidth: '1000px', borderRadius: '8px', overflow: 'hidden' }}>
                    <iframe 
                    title="NHS.UK Health A to Z widget" 
                    src="https://developer.api.nhs.uk/widgets/conditions?uid=261352f0-ba2d-11ef-b7b2-f5810bf97bf0" 
                    style={{ 
                        border: 'solid 1px #ccc', 
                        width: '100%', 
                        height: '100%', 
                        aspectRatio: '16 / 9' 
                    }} 
                    ></iframe>
                </div>
                </CardContent>
            </CardHeader>
        </Card>
        )}


    {type === 'videos' ? (
            <HealthVideoLibrary />
            ) : (
            <>
      {/* Search and Filters Card */}
      <Card>
        <CardHeader>
          <CardTitle>Search Resources</CardTitle>
          <CardDescription>
          <p className="text-5l font-light tracking-tight">The resources provided are fully vetted and approved by medical professionals, ensuring they meet the highest standards of accuracy and reliability. Each resource has undergone thorough review and validation, making it a trusted tool for research, clinical consultations, and educational purposes. Rest assured, all materials adhere to established medical guidelines and are designed to support evidence-based practices. Please make reference to the <Link href="#" className="text-blue-500">Terms and conditions</Link> outlined.</p>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search resources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Select
              value={selectedSpecialty}
              onValueChange={setSelectedSpecialty}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Specialties" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Specialties</SelectItem>
                {Object.entries(MEDICAL_SPECIALTIES).map(([key, value]) => (
                  <SelectItem key={key} value={key}>
                    {value.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {Object.entries(RESOURCE_CATEGORIES).map(([key, value]) => (
                  <SelectItem key={key} value={key}>
                    {value.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Access Categories */}
      <div className="grid gap-4 md:grid-cols-4">
        {QUICK_ACCESS_CATEGORIES.map((category, index) => (
            <CategoryCard 
            key={index} 
            {...category} 
            onSelect={handleCategorySelect}
            />
        ))}
     </div>

      {/* Resource List */}
      <div className="space-y-4">
        {filteredResources.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <div className="flex flex-col items-center space-y-2">
                <Search className="h-8 w-8 text-muted-foreground" />
                <p className="text-lg font-medium">No resources found</p>
                <p className="text-sm text-muted-foreground">
                  Try adjusting your search or filters
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredResources.map(resource => (
            <ResourceCard key={resource.id} resource={resource} />
          ))
        )}
      </div>
        </>
        )}
    </div>
    </div>
  )
}