"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Star, Video, Minimize2, Maximize2, ShieldCheck } from "lucide-react"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { useUser } from '@/app/context/user-context'

const specialties = [
  { icon: "🩺", name: "General Practice", href: "#" },
  { icon: "❤️", name: "Cardiology", href: "#" },
  { icon: "🦴", name: "Orthopedics", href: "#", active: true },
  { icon: "🔬", name: "Oncology", href: "#" },
  { icon: "🦷", name: "Dentistry", href: "#" },
  { icon: "🧬", name: "Neurology", href: "#" },
  { icon: "🧠", name: "Psychiatry", href: "#" },
]

const consultants = [
  {
    id: 1,
    name: "Dr. Jennie Kim",
    title: "Orthopedic Specialist",
    image: "/placeholder.svg?height=400&width=400",
    rate: 36,
    rating: 4.8,
    reviews: 127,
    isTopChoice: true,
    isVerified: true,
  },
  {
    id: 2,
    name: "Prof. Dr. Niall Horan",
    title: "Orthopedic Surgeon",
    image: "/placeholder.svg?height=400&width=400",
    rate: 36,
    rating: 5.0,
    reviews: 145,
    isTopChoice: true,
    isVerified: true,
    experience: "5 years",
    patients: "9845",
    about: `Dr. Niall Horan is a renowned orthopedic specialist known for his extraordinary talents in treating musculoskeletal conditions. With a background in orthopedic surgery and a passion for helping patients regain their mobility, Dr. Horan is celebrated for his groundbreaking techniques in orthopedic medicine.

    Dr. Horan is famous not only for his exceptional surgical skills but also for his unique approach to patient care. He believes in the healing power of empathy, ensuring every patient's journey is treated with utmost personal care and understanding.`,
  },
  {
    id: 3,
    name: "Dr. Alexandra Boje",
    title: "Orthopedic Specialist",
    image: "/placeholder.svg?height=400&width=400",
    rate: 36,
    rating: 4.9,
    reviews: 98,
    isVerified: true,
  },
  {
    id: 4,
    name: "Dr. Michael Chang",
    title: "Orthopedic Surgeon",
    image: "/placeholder.svg?height=400&width=400",
    rate: 40,
    rating: 4.7,
    reviews: 112,
    isVerified: true,
  },
  {
    id: 5,
    name: "Dr. Sarah Johnson",
    title: "Orthopedic Specialist",
    image: "/placeholder.svg?height=400&width=400",
    rate: 38,
    rating: 4.9,
    reviews: 135,
    isTopChoice: true,
    isVerified: true,
  },
]

const upcomingSchedule = [
  {
    consultant: "Dr. Alexandra Boje",
    specialty: "Orthopedics",
    date: "June 12, 2023",
    time: "9:00 AM - 10:00 AM",
    image: "/placeholder.svg?height=400&width=400",
  },
]

const consultantDetails = {
  schedules: [
    { day: "Monday", time: "9:00 AM - 5:00 PM" },
    { day: "Tuesday", time: "10:00 AM - 6:00 PM" },
    { day: "Wednesday", time: "9:00 AM - 5:00 PM" },
    { day: "Thursday", time: "11:00 AM - 7:00 PM" },
    { day: "Friday", time: "9:00 AM - 3:00 PM" },
  ],
  experience: [
    { position: "Senior Orthopedic Surgeon", hospital: "Central Hospital", duration: "2018 - Present" },
    { position: "Orthopedic Specialist", hospital: "City Medical Center", duration: "2015 - 2018" },
    { position: "Resident Doctor", hospital: "University Hospital", duration: "2012 - 2015" },
  ],
  reviews: [
    { name: "John D.", rating: 5, comment: "Dr. Horan is exceptional! His expertise and care made my recovery smooth and quick." },
    { name: "Sarah M.", rating: 4, comment: "Very knowledgeable and professional. The wait times can be long sometimes." },
    { name: "Robert L.", rating: 5, comment: "The best orthopedic surgeon I've ever met. Highly recommended!" },
  ],
}

export default function Component() {
   
  const { userData, loading } = useUser()  // Add user context
  const [selectedConsultant, setSelectedConsultant] = React.useState(consultants[1])
  const [currentPage, setCurrentPage] = React.useState(1)
  const [isMinimized, setIsMinimized] = React.useState(false)
  const [searchTerm, setSearchTerm] = React.useState("")
  const CONSULTANTS_PER_PAGE = 4

  const filteredConsultants = React.useMemo(() => {
    return consultants.filter(consultant => 
      consultant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consultant.title.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [searchTerm])

  const totalPages = Math.ceil(filteredConsultants.length / CONSULTANTS_PER_PAGE)
  const paginatedConsultants = filteredConsultants.slice((currentPage - 1) * CONSULTANTS_PER_PAGE, currentPage * CONSULTANTS_PER_PAGE)

  React.useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f0f4f8] to-[#cfe3f8]">
      <div className="container mx-auto p-4 sm:p-6">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-[#00487c]">
                Welcome, {userData?.first_name}
            </h1>
            <p className="text-gray-700 mt-2 text-lg">Connect with our certified medical consultants for personalized healthcare guidance tailored to your needs.</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
            <Input
              placeholder="Search consultants, specialties..."
              className="pl-10 bg-white border-gray-300 rounded-full shadow-md focus:ring-2 focus:ring-[#00487c]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Specialties */}
        <div className="flex gap-4 overflow-x-auto pb-4 mb-8 scrollbar-hide">
          {specialties.map((specialty) => (
            <a
              key={specialty.name}
              href={specialty.href}
              className={`flex flex-col items-center min-w-[100px] p-4 rounded-lg shadow-lg transition-transform transform hover:scale-105 ${
                specialty.active ? "bg-[#cfe3f8]" : "bg-white"
              } border border-gray-300 hover:border-[#00487c]`}
            >
              <span className="text-3xl mb-2">{specialty.icon}</span>
              <span className="text-base font-medium text-gray-700">{specialty.name}</span>
            </a>
          ))}
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1">
            {/* Recommended Section */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-[#00487c]">
                Recommended Consultants <span className="text-gray-600">({filteredConsultants.length})</span>
              </h2>
              <Button variant="link" className="text-[#00487c] hover:text-[#00315c] text-lg font-medium">
                View All
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
              {paginatedConsultants.map((consultant) => (
                <Card
                  key={consultant.id}
                  className="cursor-pointer hover:shadow-xl transition-shadow bg-white border border-gray-200 rounded-lg"
                  onClick={() => setSelectedConsultant(consultant)}
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center sm:items-start sm:flex-row gap-6">
                      <div className="relative">
                        <Avatar className="h-28 w-28 sm:h-20 sm:w-20 mb-3 sm:mb-0 rounded-full border-2 border-[#00487c]">
                          <AvatarImage src={consultant.image} alt={consultant.name} />
                          <AvatarFallback>{consultant.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        {consultant.isVerified && (
                          <Badge variant="secondary" className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 bg-[#cfe3f8] text-[#00487c] shadow-lg">
                            <ShieldCheck className="w-4 h-4 inline-block mr-1" /> Verified
                          </Badge>
                        )}
                      </div>
                      <div className="flex-1 text-center sm:text-left">
                        <h3 className="font-semibold text-xl text-[#00487c] mb-1">{consultant.name}</h3>
                        <p className="text-gray-600 text-md mb-3">{consultant.title}</p>
                        {consultant.isTopChoice && (
                          <Badge className="bg-[#fff7e6] text-[#e67e22] mb-3 rounded-full px-3 py-1 font-medium">
                            Top Choice
                          </Badge>
                        )}
                        <div className="flex items-center justify-center sm:justify-start gap-2 text-md">
                          <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                          <span className="font-semibold text-[#00487c]">{consultant.rating}</span>
                          <span className="text-gray-500">
                            ({consultant.reviews} reviews)
                          </span>
                        </div>
                      </div>
                      <div className="text-center sm:text-right mt-4 sm:mt-0">
                        <div className="mb-3">
                          <div className="text-sm text-gray-600">Consultation Fee</div>
                          <div className="font-bold text-2xl text-[#00487c]">
                            ${consultant.rate}<span className="text-sm text-gray-500">/hour</span>
                          </div>
                        </div>
                        <Button className="bg-[#00487c] hover:bg-[#00315c] text-white font-semibold rounded-full w-full sm:w-auto px-6 py-2">
                          Book Now
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentPage(prev => Math.max(prev - 1, 1));
                    }}
                    className="bg-white text-gray-700 hover:bg-gray-100 rounded-full px-4 py-2"
                  />
                </PaginationItem>
                {[...Array(totalPages)].map((_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink 
                      href="#" 
                      isActive={currentPage === i + 1}
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage(i + 1);
                      }}
                      className={`bg-white text-gray-700 hover:bg-gray-100 rounded-full px-4 py-2 mx-1 ${
                        currentPage === i + 1 ? 'bg-[#cfe3f8] text-[#00487c]' : ''
                      }`}
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentPage(prev => Math.min(prev + 1, totalPages));
                    }}
                    className="bg-white text-gray-700 hover:bg-gray-100 rounded-full px-4 py-2"
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>

          {/* Sidebar */}
          <div className="w-full lg:w-[400px]">
            {/* Upcoming Schedule */}
            <Card className="mb-8 bg-white border border-gray-300 rounded-lg shadow-lg">
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-semibold text-2xl text-[#00487c]">
                    Upcoming Consultations <span className="text-gray-600">(1)</span>
                  </h3>
                  <Button variant="link" className="text-[#00487c] hover:text-[#00315c] text-md rounded-full">
                    Show All
                  </Button>
                </div>
                {upcomingSchedule.map((appointment, index) => (
                  <div key={index} className="flex items-center gap-6 bg-[#f0f4f8] p-4 rounded-lg">
                    <Avatar className="h-16 w-16 rounded-full border-2 border-[#00487c]">
                      <AvatarImage src={appointment.image} alt={appointment.consultant} />
                      <AvatarFallback>DR</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg text-[#00487c]">{appointment.consultant}</h4>
                      <p className="text-gray-700 text-sm">{appointment.specialty}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                        <span>{appointment.date}</span>
                        <span>•</span>
                        <span>{appointment.time}</span>
                      </div>
                    </div>
                    <Button size="icon" className="bg-[#00487c] hover:bg-[#00315c] text-white rounded-full p-2 shadow-md">
                      <Video className="h-5 w-5" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Consultant Profile */}
            {selectedConsultant && (
              <Card className="bg-white border border-gray-300 rounded-lg shadow-lg">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-6">
                      <Avatar className="h-20 w-20 rounded-full border-2 border-[#00487c]">
                        <AvatarImage src={selectedConsultant.image} alt={selectedConsultant.name} />
                        <AvatarFallback>{selectedConsultant.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-2xl text-[#00487c]">{selectedConsultant.name}</h3>
                          {selectedConsultant.isVerified && (
                            <Badge variant="secondary" className="bg-[#cfe3f8] text-[#00487c] shadow-md">
                              <ShieldCheck className="w-5 h-5 inline-block mr-1" /> Verified
                            </Badge>
                          )}
                        </div>
                        <p className="text-gray-700 mt-2 text-lg">{selectedConsultant.title}</p>
                        <div className="flex items-center gap-2 text-lg mt-2">
                          <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium text-[#00487c]">{selectedConsultant.rating}</span>
                          <span className="text-gray-600">
                            ({selectedConsultant.reviews} reviews)
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="hover:bg-gray-100 rounded-full"
                      onClick={() => setIsMinimized(!isMinimized)}
                    >
                      {isMinimized ? <Maximize2 className="h-5 w-5" /> : <Minimize2 className="h-5 w-5" />}
                      <span className="sr-only">{isMinimized ? 'Expand' : 'Minimize'}</span>
                    </Button>
                  </div>

                  {!isMinimized && (<div>
                      {selectedConsultant.experience && (
                        <div className="grid grid-cols-3 gap-4 mb-6 text-center">
                          <div className="bg-[#f0f4f8] p-4 rounded-lg">
                            <p className="font-semibold text-[#00487c]">{selectedConsultant.experience}</p>
                            <p className="text-sm text-gray-700">Experience</p>
                          </div>
                          <div className="bg-[#f0f4f8] p-4 rounded-lg">
                            <p className="font-semibold text-[#00487c]">{selectedConsultant.patients}</p>
                            <p className="text-sm text-gray-700">Total Patient</p>
                          </div>
                          <div className="bg-[#f0f4f8] p-4 rounded-lg">
                            <p className="font-semibold text-[#00487c]">{selectedConsultant.reviews}</p>
                            <p className="text-sm text-gray-700">Reviews</p>
                          </div>
                        </div>
                      )}

                      <Tabs defaultValue="about" className="w-full">
                        <TabsList className="w-full bg-[#cfe3f8] rounded-lg">
                          {"about schedules experience review".split(" ").map((tab) => (
                            <TabsTrigger
                              key={tab}
                              value={tab}
                              className="flex-1 rounded-full text-[#00487c] data-[state=active]:bg-white data-[state=active]:text-[#00315c]"
                            >
                              {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </TabsTrigger>
                          ))}
                        </TabsList>
                        <TabsContent value="about" className="mt-6">
                          <p className="text-gray-700 text-md whitespace-pre-line">{selectedConsultant.about}</p>
                        </TabsContent>
                        <TabsContent value="schedules" className="mt-6">
                          <ul className="space-y-4">
                            {consultantDetails.schedules.map((schedule, index) => (
                              <li key={index} className="flex justify-between items-center">
                                <span className="font-medium text-[#00487c]">{schedule.day}</span>
                                <span className="text-gray-700">{schedule.time}</span>
                              </li>
                            ))}
                          </ul>
                        </TabsContent>
                        <TabsContent value="experience" className="mt-6">
                          <ul className="space-y-6">
                            {consultantDetails.experience.map((exp, index) => (
                              <li key={index} className="border-b pb-4 last:border-b-0">
                                <h4 className="font-semibold text-lg text-[#00487c]">{exp.position}</h4>
                                <p className="text-md text-gray-700 mt-1">{exp.hospital}</p>
                                <p className="text-md text-gray-500">{exp.duration}</p>
                              </li>
                            ))}
                          </ul>
                        </TabsContent>
                        <TabsContent value="review" className="mt-6">
                          <ul className="space-y-6">
                            {consultantDetails.reviews.map((review, index) => (
                              <li key={index} className="border-b pb-4 last:border-b-0">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="font-medium text-[#00487c]">{review.name}</span>
                                  <div className="flex">
                                    {[...Array(review.rating)].map((_, i) => (
                                      <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                                    ))}
                                  </div>
                                </div>
                                <p className="text-md text-gray-700">{review.comment}</p>
                              </li>
                            ))}
                          </ul>
                        </TabsContent>
                      </Tabs>

                      <Button className="w-full mt-8 bg-[#00487c] hover:bg-[#00315c] text-white font-semibold rounded-full py-3">
                        Book Appointment
                      </Button>
                    </div>)
                  }
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
