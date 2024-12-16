import React, { useState } from 'react';
import Link from 'next/link'
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Tabs,
  Tab,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  useDisclosure,
  Progress,
  Badge,
  Input,
  Select,
  SelectItem,
  Chip,
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell
} from "@nextui-org/react";
import {
  Brain,
  Bot,
  FlaskConical,
  Users,
  GraduationCap,
  ChartBar,
  Zap,
  RotateCw,
  Plus,
  Search,
  FileText,
  Share2,
  Book,
  Activity,
  Scale,
  Clock
} from "lucide-react";

const AdvancedFeatures = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [activeModel, setActiveModel] = useState('brain');
  const [activeSection, setActiveSection] = useState('anatomy');

  // 3D Anatomy Explorer
  const renderAnatomyExplorer = () => (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center w-full">
          <h3 className="text-xl font-bold">3D Anatomy Explorer</h3>
          <div className="flex gap-2">
            <Button startContent={<RotateCw />} variant="flat">Rotate</Button>
            <Button startContent={<Plus />} variant="flat">Zoom</Button>
            <Button startContent={<Share2 />} variant="flat">Share</Button>
          </div>
        </div>
      </CardHeader>
      <CardBody>
        <div className="grid md:grid-cols-4 gap-6">
          {/* 3D Model Viewer */}
          <div className="md:col-span-3 aspect-square bg-black/5 rounded-lg relative">
            {/* 3D model would render here */}
            <div className="absolute bottom-4 right-4 flex gap-2">
              <Select
                size="sm"
                value={activeModel}
                onChange={(e) => setActiveModel(e.target.value)}
              >
                <SelectItem key="brain" value="brain">Brain</SelectItem>
                <SelectItem key="heart" value="heart">Heart</SelectItem>
                <SelectItem key="skeleton" value="skeleton">Skeleton</SelectItem>
              </Select>
            </div>
          </div>

          {/* Controls & Information */}
          <div className="space-y-4">
            <Card>
              <CardBody>
                <h4 className="font-semibold">Model Information</h4>
                <div className="space-y-2 mt-2">
                  <p className="text-sm">System: Nervous System</p>
                  <p className="text-sm">Region: Cerebral Cortex</p>
                  <p className="text-sm">Structures: 245</p>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <h4 className="font-semibold">Layers</h4>
                <div className="space-y-2 mt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Muscular</span>
                    <Badge color="primary">Visible</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Skeletal</span>
                    <Badge color="default">Hidden</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Nervous</span>
                    <Badge color="primary">Visible</Badge>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </CardBody>
    </Card>
  );

  // AI Diagnostic Tools
  const renderAIDiagnostics = () => (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900 dark:to-purple-900">
        <CardBody className="py-8">
          <div className="flex items-center gap-6">
            <div className="p-4 bg-primary/10 rounded-lg">
              <Bot className="w-12 h-12 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-bold">AI Diagnostic Assistant</h3>
              <p className="text-1l font-light tracking-tight">Powered by advanced machine learning algorithms.</p>
              <p className="text-5l font-light tracking-tight">Elara can make mistakes. Please double-check responses and Analysis Thoroughly before conclusion.<Link href="#" className="text-blue-500">Read Terms and conditions</Link> outlined.</p>

              <Button className="mt-4" color="primary">
                Start Analysis
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
      <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Image Analysis</h3>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <Plus className="mx-auto w-8 h-8 text-default-400" />
                <p className="mt-2 text-default-500">Drop medical images here</p>
              </div>
              <div className="flex gap-2">
                <Button fullWidth>Upload X-Ray</Button>
                <Button fullWidth>Upload MRI</Button>
                <Button fullWidth>Upload CT Scan</Button>
              </div>
              <p className="text-1l font-light tracking-tight">
                Elara enhances your workflow by providing advanced image analysis, highlighting potential anomalies in X-rays, MRIs, or CT scans. While Elara offers valuable insights to assist your diagnosis, it’s essential to verify its findings as it may occasionally make errors. For details, please 
                <Link href="#" className="text-blue-500"> read the Terms and Conditions</Link>.
              </p>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Symptom Analysis</h3>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              <Input
                label="Enter symptoms"
                placeholder="Describe patient symptoms..."
                endContent={<Search className="w-4 h-4" />}
              />
              <div className="flex gap-2 flex-wrap">
                {['Fever', 'Cough', 'Fatigue', 'Headache'].map((symptom) => (
                  <Chip key={symptom} variant="flat" onClose={() => {}}>
                    {symptom}
                  </Chip>
                ))}
              </div>
              <Button color="primary" fullWidth>
                Analyze Symptoms
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );

  // Research Collaboration Hub
  const renderResearchHub = () => (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="col-span-2">
          <CardHeader>
            <h3 className="text-lg font-semibold">Active Research Projects</h3>
          </CardHeader>
          <CardBody>
            <Table aria-label="Research projects">
              <TableHeader>
                <TableColumn>PROJECT</TableColumn>
                <TableColumn>STATUS</TableColumn>
                <TableColumn>PARTICIPANTS</TableColumn>
                <TableColumn>ACTIONS</TableColumn>
              </TableHeader>
              <TableBody>
                {[
                  {
                    name: "AI in Early Cancer Detection",
                    status: "In Progress",
                    participants: 12
                  },
                  {
                    name: "Novel Drug Delivery Systems",
                    status: "Recruiting",
                    participants: 8
                  }
                ].map((project) => (
                  <TableRow key={project.name}>
                    <TableCell>{project.name}</TableCell>
                    <TableCell>
                      <Chip
                        color={project.status === "In Progress" ? "primary" : "success"}
                        variant="flat"
                      >
                        {project.status}
                      </Chip>
                    </TableCell>
                    <TableCell>{project.participants} researchers</TableCell>
                    <TableCell>
                      <Button size="sm">View Details</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Research Metrics</h3>
          </CardHeader>
          <CardBody>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <span>Publications</span>
                  <span className="font-semibold">24</span>
                </div>
                <Progress value={80} color="primary" />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span>Citations</span>
                  <span className="font-semibold">156</span>
                </div>
                <Progress value={65} color="success" />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span>Grant Funding</span>
                  <span className="font-semibold">$2.4M</span>
                </div>
                <Progress value={45} color="warning" />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );

  // Clinical Trials Dashboard
  const renderClinicalTrials = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center w-full">
            <h3 className="text-lg font-semibold">Active Clinical Trials</h3>
            <Button color="primary" startContent={<Plus />}>
              New Trial
            </Button>
          </div>
        </CardHeader>
        <CardBody>
          <Table aria-label="Clinical trials">
            <TableHeader>
              <TableColumn>TRIAL NAME</TableColumn>
              <TableColumn>PHASE</TableColumn>
              <TableColumn>PARTICIPANTS</TableColumn>
              <TableColumn>STATUS</TableColumn>
              <TableColumn>ACTIONS</TableColumn>
            </TableHeader>
            <TableBody>
              {[
                {
                  name: "Novel Treatment for Type 2 Diabetes",
                  phase: "Phase III",
                  participants: "125/200",
                  status: "Recruiting"
                },
                {
                  name: "Immunotherapy Study",
                  phase: "Phase II",
                  participants: "45/50",
                  status: "Active"
                }
              ].map((trial) => (
                <TableRow key={trial.name}>
                  <TableCell>{trial.name}</TableCell>
                  <TableCell>{trial.phase}</TableCell>
                  <TableCell>{trial.participants}</TableCell>
                  <TableCell>
                    <Chip
                      color={trial.status === "Active" ? "primary" : "success"}
                      variant="flat"
                    >
                      {trial.status}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <Button size="sm">Manage</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardBody>
      </Card>
    </div>
  );

  // Educational Resources
  const renderEducationalResources = () => (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-6">
        {[
          {
            title: "Medical Procedures",
            icon: Book,
            count: 156,
            color: "primary"
          },
          {
            title: "Case Studies",
            icon: FileText,
            count: 89,
            color: "success"
          },
          {
            title: "Video Tutorials",
            icon: GraduationCap,
            count: 45,
            color: "warning"
          }
        ].map((resource) => (
          <Card key={resource.title} isPressable>
            <CardBody>
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg bg-${resource.color}/10`}>
                  <resource.icon className={`w-6 h-6 text-${resource.color}`} />
                </div>
                <div>
                  <p className="font-semibold">{resource.title}</p>
                  <p className="text-default-500">{resource.count} resources</p>
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Recent Resources</h3>
        </CardHeader>
        <CardBody>
          <div className="space-y-4">
            {[
              {
                title: "Advanced Surgical Techniques",
                type: "Video",
                duration: "45 mins",
                author: "Dr. Sarah Chen"
              },
              {
                title: "Cardiac Emergency Response",
                type: "Case Study",
                duration: "20 mins",
                author: "Dr. Michael Brown"
              }
            ].map((resource) => (
              <Card key={resource.title} isPressable>
                <CardBody>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold">{resource.title}</p>
                      <p className="text-small text-default-500">
                        By {resource.author}
                      </p>
                    </div>
                    <div className="text-right">
                      <Chip size="sm" variant="flat">
                        {resource.type}
                      </Chip>
                      <p className="text-small text-default-500 mt-1">
                        {resource.duration}
                      </p>
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );

  // Quality Metrics
  const renderQualityMetrics = () => (
    <div className="space-y-6">
      <div className="grid md:grid-cols-4 gap-6">
        {[
          {
            title: "Patient Satisfaction",
            value: "94%",
            trend: "+2.5%",
            icon: Users
          },
          {
            title: "Treatment Success Rate",
            value: "88%",
            trend: "+1.2%",
            icon: Activity
          },
          {
            title: "Average Wait Time",
            value: "12min",
            trend: "-3min",
            icon: Clock
          },
          {
            title: "Quality Score",
            value: "A+",
            trend: "Stable",
            icon: Scale
          }
        ].map((metric) => (
            <Card key={metric.title}>
              <CardBody>
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <metric.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-default-500">{metric.title}</p>
                    <div className="flex items-center gap-2">
                      <p className="text-xl font-semibold">{metric.value}</p>
                      <Chip
                        size="sm"
                        color={metric.trend.includes('+') ? 'success' : 'primary'}
                      >
                        {metric.trend}
                      </Chip>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Quality Performance</h3>
          </CardHeader>
          <CardBody>
            <Table aria-label="Quality metrics">
              <TableHeader>
                <TableColumn>METRIC</TableColumn>
                <TableColumn>CURRENT</TableColumn>
                <TableColumn>TARGET</TableColumn>
                <TableColumn>STATUS</TableColumn>
              </TableHeader>
              <TableBody>
                {[
                  {
                    metric: "Patient Safety Index",
                    current: "98.5%",
                    target: "95%",
                    status: "Exceeding"
                  },
                  {
                    metric: "Clinical Documentation",
                    current: "92%",
                    target: "95%",
                    status: "Near Target"
                  },
                  {
                    metric: "Care Coordination",
                    current: "96%",
                    target: "90%",
                    status: "Exceeding"
                  },
                  {
                    metric: "Medication Safety",
                    current: "99%",
                    target: "98%",
                    status: "Exceeding"
                  }
                ].map((item) => (
                  <TableRow key={item.metric}>
                    <TableCell>{item.metric}</TableCell>
                    <TableCell>{item.current}</TableCell>
                    <TableCell>{item.target}</TableCell>
                    <TableCell>
                      <Chip
                        color={item.status === 'Exceeding' ? 'success' : 'warning'}
                        variant="flat"
                      >
                        {item.status}
                      </Chip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardBody>
        </Card>
      </div>
  );

return (
  <div className="p-6 space-y-6">
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-bold">Advanced Medical Tools</h1>
        <p className="text-default-500">
          Access advanced medical features and tools
        </p>
        <p className="text-5l font-light tracking-tight">
        Elara enhances your workflow and provides valuable assistance, but it's essential to verify its insights as it may occasionally make errors. For details, please <Link href="#" className="text-blue-500">read the Terms and Conditions</Link>.
      </p>

      </div>
    </div>

    <Tabs 
      aria-label="Advanced features"
      selectedKey={activeSection}
      onSelectionChange={(key) => setActiveSection(key as string)}
    >
      <Tab
        key="anatomy"
        title={
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4" />
            <span>3D Anatomy</span>
          </div>
        }
      >
        {renderAnatomyExplorer()}
      </Tab>
      <Tab
        key="ai"
        title={
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4" />
            <span>AI Tools</span>
          </div>
        }
      >
        {renderAIDiagnostics()}
      </Tab>
      <Tab
        key="research"
        title={
          <div className="flex items-center gap-2">
            <FlaskConical className="w-4 h-4" />
            <span>Research</span>
          </div>
        }
      >
        {renderResearchHub()}
      </Tab>
      <Tab
        key="trials"
        title={
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            <span>Clinical Trials</span>
          </div>
        }
      >
        {renderClinicalTrials()}
      </Tab>
      <Tab
        key="education"
        title={
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4" />
            <span>Education</span>
          </div>
        }
      >
        {renderEducationalResources()}
      </Tab>
      <Tab
        key="quality"
        title={
          <div className="flex items-center gap-2">
            <ChartBar className="w-4 h-4" />
            <span>Quality</span>
          </div>
        }
      >
        {renderQualityMetrics()}
      </Tab>
    </Tabs>
  </div>
);
};

export default AdvancedFeatures;