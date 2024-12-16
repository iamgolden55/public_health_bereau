//app/[role]/professional/page.tsx

"use client"

import { useRouter } from 'next/navigation';
import { useUser } from '@/app/context/user-context';
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { useCustomToast } from '@/app/components/custom-toast';
import * as React from "react"
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import DoctorOverview from './overview'
import DoctorAnalytics from './analytics';
import MedicalReports from './reports';
import PatientManagement from './patients';
import Resources from './resources';
import {Calendar} from "@nextui-org/react";
import PracticeSettings from './settings/PracticeSettings';
import ProfileSettings from './settings/ProfileSettings';
import SecuritySettings from './settings/SecuritySettings';
import EmergencyCare from './quick-access/EmergencyCare';
import SpecialtyClinic from './quick-access/SpecialtyClinic';
import TelemedicineApp from './quick-access/TelemedicineApp';
import AdvancedFeatures from './quick-access/AdvancedFeatures';
import { GlobalErrorBoundary } from '@/app/utils/errors/ErrorBoundary';
import { X } from "lucide-react"
import {
  AudioWaveform,
  BadgeCheck,
  Bell,
  BookOpen,
  Bot,
  ChevronRight,
  ChevronsUpDown,
  Command,
  CreditCard,
  Folder,
  Forward,
  Frame,
  GalleryVerticalEnd,
  LogOut,
  Map,
  MoreHorizontal,
  PieChart,
  Plus,
  Settings2,
  Sparkles,
  SquareTerminal,
  Trash2,
  Users,
  UnfoldHorizontal
} from "lucide-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar"


interface SidebarNavigationProps {
  section: string;
  subsection: string;
  tabValue?: string;
}

interface ResourcesContent {
  guidelines: React.ReactNode;
  protocols: React.ReactNode;
  research: React.ReactNode;
}

interface SettingsContent {
  profile: React.ReactNode;
  practice: React.ReactNode;
  security: React.ReactNode;
}

// Define view switching data structure
const data = {
  // Available views for switching between professional and patient modes
  views: [
    {
      name: "Professional View",
      logo: GalleryVerticalEnd,
      type: "professional",
      description: "Manage your practice"
    },
    {
      name: "Patient View",
      logo: Users,
      type: "patient",
      description: "Access your health records"
    }
  ],

  // Navigation menu structure
  navMain: [
    {
      title: "Dashboard",
      url: "#",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "Overview",
          url: "#",
        },
        {
          title: "Analytics",
          url: "#",
        },
        {
          title: "Reports",
          url: "#",
        },
      ],
    },
    {
      title: "Patients",
      url: "#",
      icon: Users,
      items: [
        {
          title: "Patient List",
          url: "#",
        },
        {
          title: "Add Patient",
          url: "#",
        }
      ]
    },
    {
      title: "Resources",
      url: "#",
      icon: BookOpen,
      items: [
        {
          title: "Guidelines",
          url: "#",
        },
        {
          title: "Protocols",
          url: "#",
        },
        {
          title: "Research",
          url: "#",
        },
        {
          title: "Training Videos",
          url: "#",
        },
      ],
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "Profile",
          url: "#",
        },
        {
          title: "Practice",
          url: "#",
        },
        {
          title: "Security",
          url: "#",
        },
      ],
    },
  ],
  // Quick access projects/departments
  projects: [
    {
      name: "Emergency Care",
      url: "#",
      icon: Frame,
      tabValue: "emergency-care" // Verify these match
    },
    {
      name: "Specialty Clinics",
      url: "#",
      icon: PieChart,
      tabValue: "specialty-clinic", // Verify these match
    },
    {
      name: "Telemedicine",
      url: "#",
      icon: Map,
      tabValue: "telemedicine" // Verify these match
    },
    {
      name: "More Features",
      url: "#",
      icon: MoreHorizontal,
      tabValue: "advanced-features" // Verify these match
    }
  ],
}

const VerificationBadge = () => (
  <div className="inline-flex items-center justify-center h-5 w-5">
    <div className="rounded-full bg-blue-500">
      <BadgeCheck className="h-3 w-3 text-white" />
    </div>
  </div>
)

const TestComponent = () => {
  return <div>Test Component</div>;
};

export default function ProfessionalDashboard() {
  const router = useRouter();
  const { userData } = useUser();
  const [activeView, setActiveView] = React.useState(data.views[0]);
  const { ToastComponent, showToast } = useCustomToast();
  const [activeTab, setActiveTab] = React.useState("overview");
  const [isLoading, setIsLoading] = useState(false);
  const [currentSection, setCurrentSection] = useState('Dashboard');


  useEffect(() => {
    console.log("Current active tab:", activeTab);
  }, [activeTab]);
  
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    
    // Determine the main section and subsection
    let mainSection = 'Dashboard';
    let subSection = value.charAt(0).toUpperCase() + value.slice(1);
  
    // Handle different sections
    if (value === 'patients') {
      mainSection = 'Patient Management';
      subSection = 'Patient List';
    } else if (value !== 'overview') {
      // Find the nav item for other sections
      const navItem = data.navMain.find(item => 
        item.items?.some(subItem => subItem.title.toLowerCase() === value)
      );
      if (navItem) {
        mainSection = navItem.title;
        // Find the specific subsection
        const subItem = navItem.items?.find(
          item => item.title.toLowerCase() === value
        );
        if (subItem) {
          subSection = subItem.title;
        }
      }
    }
  
    // Update breadcrumb
    const headerElement = document.querySelector('header .bp-breadcrumb');
    if (headerElement) {
      const breadcrumbList = headerElement.querySelector('.bp-breadcrumb-list');
      if (breadcrumbList) {
        breadcrumbList.innerHTML = `
          <li><a href="#">${mainSection}</a></li>
          <li class="separator">/</li>
          <li>${subSection}</li>
        `;
      }
    }
  };

  const handleSidebarNavigation = useCallback(({ section, subsection, tabValue }: SidebarNavigationProps) => {
    console.log("Sidebar Navigation:", { section, subsection, tabValue });
    
    if (section === 'Quick Access') {
      const newTabValue = tabValue || subsection.toLowerCase().replace(/\s+/g, '-');
      console.log("Setting quick access tab to:", newTabValue);
      setActiveTab(newTabValue);
    } else {
      const newTabValue = section === 'Resources' 
        ? `resource-${subsection.toLowerCase()}`
        : section === 'Settings'
        ? `setting-${subsection.toLowerCase()}`
        : section.toLowerCase();
      setActiveTab(newTabValue);
    }
    updateBreadcrumb(section, subsection);
  }, []);
  
  // Extract breadcrumb update logic into its own function
  const updateBreadcrumb = (section: string, subsection: string) => {
    const headerElement = document.querySelector('header .bp-breadcrumb');
    if (headerElement) {
      const breadcrumbList = headerElement.querySelector('.bp-breadcrumb-list');
      if (breadcrumbList) {
        breadcrumbList.innerHTML = `
          <li><a href="#">${section}</a></li>
          <li class="separator">/</li>
          <li>${subsection}</li>
        `;
      }
    }
  };


  // Improved logout handler with proper error handling and state cleanup
  const handleLogout = useCallback(async () => {
    const clearLocalState = () => {
      // Clear all localStorage items
      localStorage.removeItem("token");
      localStorage.removeItem("refresh");
      localStorage.removeItem("lastActiveView");
      localStorage.removeItem("userRole");
      
      // Clear all cookies
      document.cookie.split(";").forEach(cookie => {
        document.cookie = cookie
          .replace(/^ +/, "")
          .replace(/=.*/, `=;expires=${new Date(0).toUTCString()};path=/`);
      });
    };

    try {
      // Show initial logout toast
      showToast(
        "Logging out...",
        "Cleaning up your session",
        { duration: 2000, type: 'info' }
      );

      // Attempt server logout
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/logout/`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              refresh_token: localStorage.getItem("refresh"),
            }),
          });

          if (!response.ok) {
            throw new Error("Server logout failed");
          }
        } catch (error) {
          console.warn("Server logout failed, continuing with local cleanup:", error);
        }
      }

      // Clear local state regardless of server response
      clearLocalState();

      // Show success toast
      showToast(
        "Successfully logged out",
        "Redirecting to login page...",
        { 
          duration: 2000,
          type: 'success',
        }
      );

      // Delay redirect slightly to show toast
      setTimeout(() => {
        router.replace("/auth/login");
      }, 1000);

    } catch (error) {
      console.error("Logout error:", error);
      
      // Show error toast
      showToast(
        "Logout Error",
        "An error occurred during logout. Forcing cleanup...",
        { 
          duration: 3000,
          type: 'error',
        }
      );

      // Force logout on critical failure
      clearLocalState();
      setTimeout(() => {
        router.replace("/auth/login");
      }, 2000);
    }
  }, [router, showToast]);
  

  // Handle view switching between professional and patient dashboards
  const handleViewSwitch = useCallback(
    async (view) => {
      try {
        toast({
          title: "Switching Views",
          description: `Redirecting to ${view.name.toLowerCase()}...`,
          duration: 2000,
        });
  
        localStorage.setItem("lastActiveView", view.type);
        router.push(`/role/${view.type}`);
      } catch (error) {
        console.error("View switch error:", error);
        toast({
          title: "Switch Failed",
          description: "Could not switch views. Please try again.",
          variant: "destructive",
        });
      }
    },
    [router]
  );
  

  return (
            <>
{/* Add the Toast component here, just before the final closing tag */}
<ToastComponent />

     <SidebarProvider className="bg-background">
      <Sidebar collapsible="icon" className="border-r border-border bg-background">
        {/* Sidebar Header with View Switcher */}
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="w-full bg-background border border-border rounded-lg shadow-sm hover:bg-accent"
                >
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <activeView.logo className="size-4" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold text-foreground">
                      {activeView.name}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {userData?.professional_data?.specialization}
                    </span>
                  </div>
                  <ChevronsUpDown className="ml-auto text-muted-foreground" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                  className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg bg-popover border border-border shadow-md"
                  align="start"
                  side="bottom"
                  sideOffset={4}
                >
                  <DropdownMenuLabel className="text-xs text-muted-foreground px-2 py-1.5">
                    Switch View
                  <DropdownMenuSeparator />
                  <p className="text-5l font-light tracking-tight">Welcome <span className="text-blue-500"> {userData?.last_name}</span>. Explore all analytic tools necessary. By clicking "Next," you confirm your intention to connect your app to Tradie API. This
                  action signifies you accept of the <Link href="#" className="text-blue-500">Terms and conditions</Link> outlined.</p>
                  <DropdownMenuSeparator />
                  </DropdownMenuLabel>
                  {data.views.map((view, index) => (
                    <DropdownMenuItem
                      key={view.name}
                      onClick={() => {
                        setActiveView(view);
                        handleViewSwitch(view);
                      }}
                      className="gap-2 p-2 hover:bg-accent text-foreground hover:text-accent-foreground"
                    >
                      <div className="flex size-6 items-center justify-center rounded-sm border border-border bg-background">
                        <view.logo className="size-4 shrink-0" />
                      </div>
                      {view.name}
                      <DropdownMenuShortcut className="text-muted-foreground">⌘{index + 1}</DropdownMenuShortcut>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        {/* Main Sidebar Content */}
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Platform</SidebarGroupLabel>
            <SidebarMenu>
              {data.navMain.map((item) => (
                <Collapsible
                  key={item.title}
                  asChild
                  defaultOpen={item.isActive}
                  className="group/collapsible"
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton tooltip={item.title}>
                        {item.icon && <item.icon />}
                        <span>{item.title}</span>
                        <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                      {item.items?.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton 
                            onClick={() => {
                              const section = item.title;  // Parent menu title
                              const subsection = subItem.title;  // Sub-item title
                              
                              // Handle dashboard items differently
                              if (section === 'Dashboard') {
                                handleTabChange(subsection.toLowerCase());
                              } else {
                                handleSidebarNavigation({ section, subsection });
                              }
                            }}
                          >
                            <span>{subItem.title}</span>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              ))}
            </SidebarMenu>
          </SidebarGroup>

          {/* Quick Access Projects Section */}
          <SidebarGroup className="group-data-[collapsible=icon]:hidden">
            <SidebarGroupLabel>Quick Access</SidebarGroupLabel>
            <SidebarMenu>
            {data.projects.map((item) => (
              <SidebarMenuItem key={item.name}>
              <SidebarMenuButton
                onClick={() => {
                  console.log("Clicked:", item.name);
                  console.log("Setting tab value to:", item.tabValue);
                  setActiveTab(item.tabValue);
                  handleSidebarNavigation({
                    section: 'Quick Access',
                    subsection: item.name,
                    tabValue: item.tabValue
                  });
                }}
              >
                <item.icon />
                <span>{item.name}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            ))}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>

        {/* Sidebar Footer with User Profile */}
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    size="lg"
                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                  >
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarImage src={userData?.avatar || ''} alt={userData?.first_name} />
                      <AvatarFallback className="rounded-lg">
                        {userData?.first_name?.[0]}{userData?.last_name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">
                        {userData?.first_name} {userData?.last_name}
                      </span>
                      <span className="truncate text-xs">
                        {userData?.email}
                      </span>
                    </div>
                    <ChevronsUpDown className="ml-auto size-4" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                  side="bottom"
                  align="end"
                  sideOffset={4}
                >
                  <DropdownMenuLabel className="p-0 font-normal">
                    <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                      <Avatar className="h-8 w-8 rounded-lg">
                        <AvatarImage src={userData?.avatar || ''} alt={userData?.first_name} />
                        <AvatarFallback className="rounded-lg">
                          {userData?.first_name?.[0]}{userData?.last_name?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-semibold">
                          {userData?.first_name} {userData?.last_name} {userData.professional_data?.is_verified && <VerificationBadge />}
                        </span>
                        
                        <span className="truncate text-xs">
                          {userData?.email}
                        </span>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem
                    className="gap-2 p-2"
                    >
                      <Sparkles className="h-4 w-4"/>
                      Upgrade to Pro
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem
                    className="gap-2 p-2"
                    >
                      <BadgeCheck className="h-4 w-4"/>
                      Account
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                    className="gap-2 p-2"
                    >
                      <CreditCard className="h-4 w-4"/>
                      Billing
                    </DropdownMenuItem>
                    <DropdownMenuItem

                    className="gap-2 p-2"
                    >
                      <Bell className="h-4 w-4"/>
                      Notifications
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                      onClick={handleLogout}
                      className="gap-2 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
                </SidebarFooter>
                <SidebarRail />
            </Sidebar>
            
            <SidebarInset>
              <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
                <div className="flex items-center gap-2 px-4">
                  <SidebarTrigger className="-ml-1" />
                  <Separator orientation="vertical" className="mr-2 h-4" />
                  <Breadcrumb className="bp-breadcrumb">
                    <BreadcrumbList className="bp-breadcrumb-list">
                      <BreadcrumbItem>
                        <BreadcrumbLink href="#">
                          {activeTab === 'patients' ? 'Patients' : 
                          activeTab === 'overview' ? 'Dashboard' : 
                          data.navMain.find(item => 
                            item.items?.some(subItem => subItem.title.toLowerCase() === activeTab)
                          )?.title}
                        </BreadcrumbLink>
                      </BreadcrumbItem>
                      <BreadcrumbSeparator />
                      <BreadcrumbItem>
                        <BreadcrumbPage>
                          {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                        </BreadcrumbPage>
                      </BreadcrumbItem>
                    </BreadcrumbList>
                  </Breadcrumb>
                </div>
              </header>

              <div className="flex-1">
              {/* Dashboard Section */}
              {(activeTab === 'overview' || activeTab === 'analytics' || activeTab === 'reports') && (
                <Tabs 
                  defaultValue="overview" 
                  value={activeTab} 
                  onValueChange={handleTabChange} 
                  className="h-full space-y-6"
                >
                  <div className="space-between flex items-center px-4 pt-4">
                    <TabsList>
                      <TabsTrigger value="overview">Overview</TabsTrigger>
                      <TabsTrigger value="analytics">Analytics</TabsTrigger>
                      <TabsTrigger value="reports">Reports</TabsTrigger>
                    </TabsList>
                  </div>
                  
                  <TabsContent value="overview" className="h-full">
                    <DoctorOverview />
                  </TabsContent>

                  <TabsContent value="analytics" className="h-full">
                    <DoctorAnalytics />
                  </TabsContent>

                  <TabsContent value="reports" className="h-full">
                    <MedicalReports />
                  </TabsContent>
                </Tabs>
              )}

              {/* Patients Section */}
              {activeTab === 'patients' && <PatientManagement />}

              {/* Resources Section */}
            {activeTab.startsWith('resource-') && (
              <Tabs 
                defaultValue="resource-guidelines" 
                value={activeTab}
                onValueChange={handleTabChange}
                className="h-full space-y-6"
              >
                <div className="space-between flex items-center px-4 pt-4">
                  <TabsList>
                    <TabsTrigger value="resource-guidelines">Guidelines</TabsTrigger>
                    <TabsTrigger value="resource-protocols">Protocols</TabsTrigger>
                    <TabsTrigger value="resource-research">Research</TabsTrigger>
                    <TabsTrigger value="resource-videos">Training Videos</TabsTrigger>
                  </TabsList>
                </div>
                
                <TabsContent value="resource-guidelines" className="h-full">
                  <Resources type="guidelines" />
                </TabsContent>

                <TabsContent value="resource-protocols" className="h-full">
                  <Resources type="protocols" />
                </TabsContent>

                <TabsContent value="resource-research" className="h-full">
                  <Resources type="research" />
                </TabsContent>

                <TabsContent value="resource-videos" className="h-full">
                  <Resources type="videos" />
                </TabsContent>
              </Tabs>
              )}

              {/* Settings Section */}
              {activeTab.startsWith('setting-') && (
                <div className="p-6 space-y-6">
                  <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
                  {activeTab === 'setting-profile' && <ProfileSettings />} {/* Replace div with component */}
                  {activeTab === 'setting-practice' && <PracticeSettings />} {/* Replace div with component */}
                  {activeTab === 'setting-security' && <SecuritySettings />} {/* Replace div with component */}
                </div>
              )}
                
               {/* Quick Access Projects */}
              <GlobalErrorBoundary>
                {activeTab === 'emergency-care' && <EmergencyCare />}
                {activeTab === 'specialty-clinic' && <SpecialtyClinic />}
                {activeTab === 'telemedicine' && <TelemedicineApp />}
                {activeTab === 'advanced-features' && <AdvancedFeatures />}
                
              </GlobalErrorBoundary>
                
            </div>
            </SidebarInset>
          </SidebarProvider>


            </>
        );
        }


