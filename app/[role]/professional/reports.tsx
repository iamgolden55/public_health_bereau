import React, { useState } from 'react'
import { motion } from "framer-motion"
import { 
  FileText, 
  Filter, 
  Download, 
  Calendar,
  Search,
  Share2,
  Printer,
  Eye,
  AlertCircle,
  CheckCircle2,
  Clock,
  FileBarChart,
  FileImage,
  FileClock,
  FileCheck,
  Plus,
  ChevronDown
} from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import DateRangePicker from "@/components/ui/custom-date-picker"
import { Input, Button, Select, SelectItem } from "@nextui-org/react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { 
    Dropdown, 
    DropdownTrigger, 
    DropdownMenu, 
    DropdownItem 
  } from "@nextui-org/react"

interface Report {
  id: string
  title: string
  type: 'Lab' | 'Imaging' | 'Clinical' | 'Surgery' | 'Progress'
  date: string
  doctor: string
  status: 'complete' | 'pending' | 'in-review'
  priority: 'routine' | 'urgent' | 'critical'
  category: string
}

// Mock data for demonstration
const recentReports: Report[] = [
  {
    id: "REP-2024-001",
    title: "Complete Blood Count Analysis",
    type: "Lab",
    date: "2024-03-15",
    doctor: "Dr. Sarah Chen",
    status: "complete",
    priority: "routine",
    category: "Hematology"
  },
  {
    id: "REP-2024-002",
    title: "Chest X-Ray Examination",
    type: "Imaging",
    date: "2024-03-14",
    doctor: "Dr. Michael Brown",
    status: "complete",
    priority: "urgent",
    category: "Radiology"
  },
  {
    id: "REP-2024-003",
    title: "Post-Surgery Follow-up",
    type: "Surgery",
    date: "2024-03-13",
    doctor: "Dr. James Wilson",
    status: "in-review",
    priority: "critical",
    category: "Orthopedics"
  },
  {
    id: "REP-2024-004",
    title: "Cardiac Stress Test Results",
    type: "Clinical",
    date: "2024-03-12",
    doctor: "Dr. Emily Johnson",
    status: "pending",
    priority: "urgent",
    category: "Cardiology"
  }
]

export default function MedicalReports() {
  // State management
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedType, setSelectedType] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [dateRange, setDateRange] = useState({
    from: new Date(),
    to: new Date()
  })

  // Get status badge styling
  const getStatusBadge = (status: Report['status']) => {
    const styles = {
      complete: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      "in-review": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
    }
    return styles[status]
  }

  // Get priority badge styling
  const getPriorityBadge = (priority: Report['priority']) => {
    const styles = {
      routine: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
      urgent: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
      critical: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
    }
    return styles[priority]
  }

  // Get icon for report type
  const getReportTypeIcon = (type: Report['type']) => {
    const icons = {
      Lab: FileBarChart,
      Imaging: FileImage,
      Clinical: FileText,
      Surgery: FileCheck,
      Progress: FileClock
    }
    return icons[type]
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header Section */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Medical Reports</h1>
          <p className="text-muted-foreground">
            Access and manage all medical reports in one place
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            New Report
          </Button>
          <Button>
            <Download className="mr-2 h-4 w-4" />
            Export Reports
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="relative overflow-hidden">
          <CardHeader className="space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Reports
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,842</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
            <div className="absolute right-4 top-4 text-muted-foreground">
              <FileText className="h-4 w-4" />
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardHeader className="space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Reviews
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18</div>
            <p className="text-xs text-muted-foreground">
              4 urgent reviews needed
            </p>
            <div className="absolute right-4 top-4 text-yellow-500">
              <Clock className="h-4 w-4" />
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardHeader className="space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Critical Reports
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              Immediate attention required
            </p>
            <div className="absolute right-4 top-4 text-red-500">
              <AlertCircle className="h-4 w-4" />
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardHeader className="space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Completed Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">
              All reviews up to date
            </p>
            <div className="absolute right-4 top-4 text-green-500">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters Section */}
      <Card>
        <CardHeader>
          <CardTitle>Report Filters</CardTitle>
          <CardDescription>
            Refine your report view using the filters below
          </CardDescription>
        </CardHeader>
        <CardContent>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Search Input */}
            <div className="flex flex-col space-y-1.5">
                <label className="text-sm font-medium">Search Reports</label>
                <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search by ID, title, or doctor..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                </div>
            </div>

            {/* Report Type Select */}
            <div className="flex flex-col space-y-1.5">
                <label className="text-sm font-medium">Report Type</label>
                <Select
                placeholder="Select type"
                selectedKeys={[selectedType]}
                onChange={(e) => setSelectedType(e.target.value)}
                >
                <SelectItem key="all" value="all">All Types</SelectItem>
                <SelectItem key="lab" value="lab">Laboratory</SelectItem>
                <SelectItem key="imaging" value="imaging">Imaging</SelectItem>
                <SelectItem key="clinical" value="clinical">Clinical</SelectItem>
                <SelectItem key="surgery" value="surgery">Surgery</SelectItem>
                <SelectItem key="progress" value="progress">Progress Notes</SelectItem>
                </Select>
            </div>

            {/* Status Select */}
            <div className="flex flex-col space-y-1.5">
                <label className="text-sm font-medium">Status</label>
                <Select
                placeholder="Select status"
                selectedKeys={[selectedStatus]}
                onChange={(e) => setSelectedStatus(e.target.value)}
                >
                <SelectItem key="all" value="all">All Statuses</SelectItem>
                <SelectItem key="complete" value="complete">Complete</SelectItem>
                <SelectItem key="pending" value="pending">Pending</SelectItem>
                <SelectItem key="in-review" value="in-review">In Review</SelectItem>
                </Select>
            </div>

            {/* Date Range Picker */}
            <div className="flex flex-col space-y-1.5">
                <label className="text-sm font-medium">Date Range</label>
                <DateRangePicker 
                    date={dateRange}
                    onChange={(date) => date && setDateRange(date)}
                    className="w-full"
                />
                </div>
            </div>
        </CardContent>
      </Card>

      {/* Reports Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Reports</CardTitle>
          <CardDescription>
            View and manage your most recent medical reports
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Report ID</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Doctor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentReports.map((report) => {
                const TypeIcon = getReportTypeIcon(report.type)
                return (
                  <TableRow key={report.id}>
                    <TableCell className="font-medium">{report.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <TypeIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                        {report.title}
                      </div>
                    </TableCell>
                    <TableCell>{report.type}</TableCell>
                    <TableCell>{new Date(report.date).toLocaleDateString()}</TableCell>
                    <TableCell>{report.doctor}</TableCell>
                    <TableCell>
                      <Badge className={getStatusBadge(report.status)}>
                        {report.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getPriorityBadge(report.priority)}>
                        {report.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                    <Dropdown>
                        <DropdownTrigger>
                        <Button 
                            variant="light" 
                            isIconOnly
                            size="sm"
                        >
                            <ChevronDown className="h-4 w-4" />
                        </Button>
                        </DropdownTrigger>
                        <DropdownMenu aria-label="Report actions">
                        <DropdownItem
                            key="view"
                            startContent={<Eye className="h-4 w-4" />}
                        >
                            View Report
                        </DropdownItem>
                        <DropdownItem
                            key="download"
                            startContent={<Download className="h-4 w-4" />}
                        >
                            Download
                        </DropdownItem>
                        <DropdownItem
                            key="share"
                            startContent={<Share2 className="h-4 w-4" />}
                        >
                            Share
                        </DropdownItem>
                        <DropdownItem
                            key="print"
                            startContent={<Printer className="h-4 w-4" />}
                        >
                            Print
                        </DropdownItem>
                        </DropdownMenu>
                    </Dropdown>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}