import React, { useState } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Avatar,
  Input,
  Badge,
  Progress,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Chip,
  Tabs,
  Tab
} from "@nextui-org/react";
import {
  Video,
  Phone,
  Clock,
  Calendar,
  Heart,
  Activity,
  Thermometer,
  Stethoscope,
  MessageCircle,
  FileText,
  ClipboardList,
  Bot,
  Plus,
  Send
} from "lucide-react";

const TelemedicineApp = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [activeConsultation, setActiveConsultation] = useState(null);
  const [activeTab, setActiveTab] = useState("consultations");

  const vitalSigns = {
    heartRate: 75,
    bloodPressure: "120/80",
    temperature: 37.2,
    oxygenSaturation: 98
  };

  const upcomingConsultations = [
    {
      id: 1,
      patientName: "Sarah Johnson",
      patientAvatar: "/api/placeholder/32/32",
      scheduledTime: "10:30 AM",
      reason: "Follow-up",
      status: "ready"
    },
    {
      id: 2,
      patientName: "Michael Chen",
      patientAvatar: "/api/placeholder/32/32",
      scheduledTime: "11:15 AM",
      reason: "Initial Consultation",
      status: "waiting"
    }
  ];

  const renderVitalsMonitor = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card>
        <CardBody>
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-danger" />
            <div>
              <p className="text-xs text-default-500">Heart Rate</p>
              <p className="text-lg font-semibold">{vitalSigns.heartRate} BPM</p>
            </div>
          </div>
          <Progress 
            value={vitalSigns.heartRate} 
            maxValue={120}
            color="danger"
            className="mt-2"
          />
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-warning" />
            <div>
              <p className="text-xs text-default-500">Blood Pressure</p>
              <p className="text-lg font-semibold">{vitalSigns.bloodPressure}</p>
            </div>
          </div>
          <Progress 
            value={120} 
            maxValue={180}
            color="warning"
            className="mt-2"
          />
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <div className="flex items-center gap-2">
            <Thermometer className="w-5 h-5 text-success" />
            <div>
              <p className="text-xs text-default-500">Temperature</p>
              <p className="text-lg font-semibold">{vitalSigns.temperature}°C</p>
            </div>
          </div>
          <Progress 
            value={vitalSigns.temperature} 
            maxValue={42}
            color="success"
            className="mt-2"
          />
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            <div>
              <p className="text-xs text-default-500">O₂ Saturation</p>
              <p className="text-lg font-semibold">{vitalSigns.oxygenSaturation}%</p>
            </div>
          </div>
          <Progress 
            value={vitalSigns.oxygenSaturation} 
            maxValue={100}
            color="primary"
            className="mt-2"
          />
        </CardBody>
      </Card>
    </div>
  );

  const renderConsultationArea = () => (
    <div className="grid md:grid-cols-3 gap-6">
      {/* Video Area */}
      <div className="md:col-span-2 space-y-4">
        <Card className="w-full aspect-video bg-black">
          <CardBody className="flex items-center justify-center">
            <div className="text-center space-y-2">
              <Video className="w-12 h-12 text-white/50 mx-auto" />
              <p className="text-white/70">Video consultation will appear here</p>
            </div>
          </CardBody>
        </Card>
        
        <div className="flex justify-center gap-2">
          <Button color="primary" startContent={<Video />}>
            Start Video
          </Button>
          <Button color="success" startContent={<Phone />}>
            Start Audio
          </Button>
          <Button color="danger">
            End Call
          </Button>
        </div>
      </div>

      {/* Patient Info & Chat */}
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Patient Information</h3>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar size="lg" src="/api/placeholder/64/64" />
                <div>
                  <p className="font-semibold">Sarah Johnson</p>
                  <p className="text-small text-default-500">Patient ID: PT-2024-001</p>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm"><span className="font-medium">Age:</span> 34</p>
                <p className="text-sm"><span className="font-medium">Reason:</span> Follow-up</p>
                <p className="text-sm"><span className="font-medium">Last Visit:</span> 2024-02-15</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="h-[300px] flex flex-col">
          <CardHeader>
            <h3 className="text-lg font-semibold">Chat</h3>
          </CardHeader>
          <CardBody className="flex-grow overflow-y-auto">
            {/* Chat messages would go here */}
          </CardBody>
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                placeholder="Type your message..."
                endContent={<Send className="w-4 h-4" />}
              />
              <Button isIconOnly color="primary">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Telemedicine Center</h1>
          <p className="text-default-500">Virtual consultations and patient monitoring</p>
        </div>
        <Button 
          color="primary" 
          startContent={<Plus />}
          onPress={onOpen}
        >
          New Consultation
        </Button>
      </div>

      <Tabs 
        selectedKey={activeTab}
        onSelectionChange={setActiveTab}
      >
        <Tab key="vitals" title="Patient Vitals">
          {renderVitalsMonitor()}
        </Tab>
        <Tab key="consultations" title="Active Consultation">
          {renderConsultationArea()}
        </Tab>
      </Tabs>

      {/* Upcoming Consultations */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center w-full">
            <h3 className="text-lg font-semibold">Upcoming Consultations</h3>
            <Button color="primary" variant="flat" startContent={<Calendar />}>
              View Schedule
            </Button>
          </div>
        </CardHeader>
        <CardBody>
          <div className="space-y-4">
            {upcomingConsultations.map((consultation) => (
              <Card key={consultation.id} isPressable>
                <CardBody>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <Avatar src={consultation.patientAvatar} />
                      <div>
                        <p className="font-semibold">{consultation.patientName}</p>
                        <p className="text-small text-default-500">{consultation.reason}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-medium">{consultation.scheduledTime}</p>
                        <Chip
                          size="sm"
                          color={consultation.status === 'ready' ? 'success' : 'warning'}
                        >
                          {consultation.status === 'ready' ? 'Ready' : 'Waiting'}
                        </Chip>
                      </div>
                      <Button color="primary" size="sm">
                        Join
                      </Button>
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* AI Diagnostics Assistant */}
      <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900 dark:to-purple-900">
        <CardBody>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Bot className="w-8 h-8 text-primary" />
            </div>
            <div className="flex-grow">
              <h3 className="text-lg font-semibold">AI Diagnostic Assistant</h3>
              <p className="text-default-500">Get AI-powered insights and suggestions during consultations</p>
            </div>
            <Button color="primary" variant="flat">
              Launch Assistant
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default TelemedicineApp;