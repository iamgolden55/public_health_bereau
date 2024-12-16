// app/[role]/professional/quick-access/EmergencyCare.tsx

import React from 'react';
import {
  Card,
  CardBody,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Chip,
  Badge,
  CardHeader,
  Progress 
} from "@nextui-org/react";
import {
  AlertCircle,
  Ambulance,
  Heart,
  Activity,
  Users,
  Clock,
  BedDouble,
  Phone
} from "lucide-react";

const EmergencyCare = () => {
  const emergencyStats = {
    availableBeds: 12,
    occupiedBeds: 28,
    waitingPatients: 5,
    avgWaitTime: "23 min",
    activeStaff: 15
  };

  const emergencyQueue = [
    {
      id: 1,
      patient: "John Smith",
      condition: "Chest Pain",
      priority: "High",
      waitTime: "5 min",
      status: "In Triage"
    },
    {
      id: 2,
      patient: "Sarah Johnson",
      condition: "Broken Arm",
      priority: "Medium",
      waitTime: "15 min",
      status: "Waiting"
    }
    // Add more cases...
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Emergency Care Unit</h1>
          <p className="text-default-500">Real-time emergency department status</p>
        </div>
        <Button color="danger" variant="shadow">
          Emergency Alert
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-danger-50">
          <CardBody>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-danger">Available Beds</p>
                <h3 className="text-2xl font-bold">{emergencyStats.availableBeds}</h3>
              </div>
              <BedDouble className="w-8 h-8 text-danger" />
            </div>
            <Progress 
              value={(emergencyStats.availableBeds / (emergencyStats.availableBeds + emergencyStats.occupiedBeds)) * 100}
              color="danger"
              className="mt-2"
            />
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-default-500">Waiting Time</p>
                <h3 className="text-2xl font-bold">{emergencyStats.avgWaitTime}</h3>
              </div>
              <Clock className="w-8 h-8 text-warning" />
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-default-500">Active Staff</p>
                <h3 className="text-2xl font-bold">{emergencyStats.activeStaff}</h3>
              </div>
              <Users className="w-8 h-8 text-primary" />
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Emergency Queue */}
      <Card>
        <CardHeader>
          <h3 className="text-xl font-semibold">Emergency Queue</h3>
        </CardHeader>
        <CardBody>
          <Table aria-label="Emergency queue">
            <TableHeader>
              <TableColumn>PATIENT</TableColumn>
              <TableColumn>CONDITION</TableColumn>
              <TableColumn>PRIORITY</TableColumn>
              <TableColumn>WAIT TIME</TableColumn>
              <TableColumn>STATUS</TableColumn>
              <TableColumn>ACTION</TableColumn>
            </TableHeader>
            <TableBody>
              {emergencyQueue.map((case_) => (
                <TableRow key={case_.id}>
                  <TableCell>{case_.patient}</TableCell>
                  <TableCell>{case_.condition}</TableCell>
                  <TableCell>
                    <Chip
                      color={case_.priority === "High" ? "danger" : 
                            case_.priority === "Medium" ? "warning" : "success"}
                    >
                      {case_.priority}
                    </Chip>
                  </TableCell>
                  <TableCell>{case_.waitTime}</TableCell>
                  <TableCell>{case_.status}</TableCell>
                  <TableCell>
                    <Button size="sm">View Details</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardBody>
      </Card>
    </div>
  );
};

export default EmergencyCare;