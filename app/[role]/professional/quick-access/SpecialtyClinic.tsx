import React, { useState } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Tabs,
  Tab,
  Image,
  Progress,
  Chip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  useDisclosure
} from "@nextui-org/react";
import {
  Brain,
  Heart,
  Eye,
  Bone,
  Activity,
  ZoomIn,
  RotateCw,
  Maximize2,
  Download,
  Share2,
  Plus
} from "lucide-react";

const SpecialtyClinic = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [activeCase, setActiveCase] = useState(null);
  const [viewMode, setViewMode] = useState("3d");

  // Mock data for medical cases
  const medicalCases = [
    {
      id: 1,
      title: "Complex Brain Tumor Case",
      patientId: "PT-2024-001",
      department: "Neurology",
      type: "MRI",
      status: "In Review",
      date: "2024-03-15",
      imageUrl: "/api/placeholder/800/400", // Replace with actual medical image
      annotations: [
        { x: 45, y: 55, label: "Tumor Location", severity: "high" },
        { x: 60, y: 40, label: "Affected Area", severity: "medium" }
      ],
      findings: [
        "Grade III Astrocytoma",
        "Right temporal lobe involvement",
        "No metastasis detected"
      ]
    },
    // Add more cases...
  ];
  // 3D visualization controls
  const handleRotate = (degrees: number) => {
    // Implementation for 3D rotation
    console.log(`Rotating view by ${degrees} degrees`);
  };

  const handleZoom = (factor: number) => {
    // Implementation for zoom
    console.log(`Zooming by factor ${factor}`);
  };

  const renderMedicalViewer = () => (
    <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
      <div className="absolute top-4 right-4 flex gap-2 z-10">
        <Button isIconOnly size="sm" variant="flat">
          <ZoomIn className="w-4 h-4" />
        </Button>
        <Button isIconOnly size="sm" variant="flat">
          <RotateCw className="w-4 h-4" />
        </Button>
        <Button isIconOnly size="sm" variant="flat">
          <Maximize2 className="w-4 h-4" />
        </Button>
      </div>

      {/* Medical Image Viewer */}
      <div className="relative w-full h-full">
        <Image
          alt="Medical scan"
          src="/api/placeholder/800/400"
          className="w-full h-full object-cover"
        />
        
        {/* Interactive Annotations */}
        {activeCase?.annotations.map((annotation, index) => (
          <div
            key={index}
            className={`absolute w-4 h-4 rounded-full cursor-pointer
              ${annotation.severity === 'high' ? 'bg-red-500' : 'bg-yellow-500'}
            `}
            style={{
              left: `${annotation.x}%`,
              top: `${annotation.y}%`,
              transform: 'translate(-50%, -50%)'
            }}
          >
            <div className="absolute left-full ml-2 bg-black/75 text-white text-xs p-1 rounded whitespace-nowrap">
              {annotation.label}
            </div>
          </div>
        ))}

        {/* View Controls */}
        <div className="absolute bottom-4 left-4 flex gap-2">
          <Button
            size="sm"
            variant={viewMode === "3d" ? "solid" : "flat"}
            onPress={() => setViewMode("3d")}
          >
            3D View
          </Button>
          <Button
            size="sm"
            variant={viewMode === "axial" ? "solid" : "flat"}
            onPress={() => setViewMode("axial")}
          >
            Axial
          </Button>
          <Button
            size="sm"
            variant={viewMode === "sagittal" ? "solid" : "flat"}
            onPress={() => setViewMode("sagittal")}
          >
            Sagittal
          </Button>
        </div>
      </div>
    </div>
  );

  const renderDepartments = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[
        { icon: Brain, name: "Neurology", cases: 24, color: "primary" },
        { icon: Heart, name: "Cardiology", cases: 18, color: "danger" },
        { icon: Eye, name: "Ophthalmology", cases: 15, color: "warning" },
        { icon: Bone, name: "Orthopedics", cases: 21, color: "success" }
      ].map((dept) => (
        <Card key={dept.name} isPressable className="hover:scale-105 transition-transform">
          <CardBody>
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-lg bg-${dept.color}/10`}>
                <dept.icon className={`w-6 h-6 text-${dept.color}`} />
              </div>
              <div>
                <h3 className="font-semibold">{dept.name}</h3>
                <p className="text-small text-default-500">{dept.cases} active cases</p>
              </div>
            </div>
          </CardBody>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Specialty Clinic</h1>
          <p className="text-default-500">Advanced medical imaging and case management</p>
        </div>
        <Button color="primary" startContent={<Plus />}>
          New Case
        </Button>
      </div>

      {/* Medical Image Viewer */}
      <Card className="w-full">
        <CardHeader>
          <div className="flex justify-between items-center w-full">
            <h3 className="text-lg font-semibold">Advanced Medical Imaging</h3>
            <div className="flex gap-2">
              <Button variant="flat" startContent={<Download />}>
                Export
              </Button>
              <Button variant="flat" startContent={<Share2 />}>
                Share
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardBody>
          {renderMedicalViewer()}
        </CardBody>
      </Card>

      {/* Specialty Departments */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Specialty Departments</h3>
        </CardHeader>
        <CardBody>
          {renderDepartments()}
        </CardBody>
      </Card>

      {/* Recent Cases */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Recent Cases</h3>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {medicalCases.map((case_) => (
              <Card key={case_.id} isPressable onPress={() => {
                setActiveCase(case_);
                onOpen();
              }}>
                <CardBody>
                  <div className="space-y-3">
                    <Image
                      alt={case_.title}
                      src={case_.imageUrl}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <div>
                      <div className="flex justify-between items-start">
                        <h4 className="font-semibold">{case_.title}</h4>
                        <Chip size="sm" color="primary">{case_.type}</Chip>
                      </div>
                      <p className="text-small text-default-500">
                        Patient ID: {case_.patientId}
                      </p>
                      <p className="text-small text-default-500">
                        Department: {case_.department}
                      </p>
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Case Detail Modal */}
      <Modal size="3xl" isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Case Details</ModalHeader>
              <ModalBody>
                {activeCase && (
                  <div className="space-y-4">
                    {renderMedicalViewer()}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold">Findings</h4>
                        <ul className="list-disc list-inside">
                          {activeCase.findings.map((finding, index) => (
                            <li key={index}>{finding}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold">Case Information</h4>
                        <p>Patient ID: {activeCase.patientId}</p>
                        <p>Department: {activeCase.department}</p>
                        <p>Date: {activeCase.date}</p>
                      </div>
                    </div>
                  </div>
                )}
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default SpecialtyClinic;