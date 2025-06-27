import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Input } from "../components/ui/Input";
import axios from "axios";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  FileText,
  Users,
  Eye,
  Edit2,
  Trash2,
  Plus,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { Modal } from "../components/ui/Modal";
import QuickAddTestCase from "./QuickAddTestCase";
import QuickAddDefect from "./QuickAddDefect";
import { ProjectSelector } from "../components/ui/ProjectSelector";
import { projectReleaseCardView } from "../api/releaseView/ProjectReleaseCardView";
import { createRelease } from "../api/createRelease/CreateRelease";
import { searchRelease } from "../api/searchRelease/SearchRelease";
import { getQAAllocationsByRelease } from "../api/qaAllocation/saveQAAllocation";

// Define interfaces for our data types
interface TestCase {
  id: string;
  module: string;
  subModule: string;
  description: string;
  steps: string;
  type: "functional" | "regression" | "smoke" | "integration";
  severity: "low" | "medium" | "high" | "critical";
  projectId: string;
  releaseId?: string;
}

interface Module {
  id: string;
  name: string;
  submodules: string[];
}

// Mock data for modules and submodules
const mockModules: { [key: string]: Module[] } = {
  "2": [
    // Mobile Banking App
    {
      id: "auth",
      name: "Authentication",
      submodules: [
        "Biometric Login",
        "PIN Login",
        "Password Reset",
        "Session Management",
      ],
    },
    {
      id: "acc",
      name: "Account Management",
      submodules: [
        "Account Overview",
        "Transaction History",
        "Account Statements",
        "Account Settings",
      ],
    },
    {
      id: "tra",
      name: "Money Transfer",
      submodules: [
        "Quick Transfer",
        "Scheduled Transfer",
        "International Transfer",
        "Transfer Limits",
      ],
    },
    {
      id: "bil",
      name: "Bill Payments",
      submodules: [
        "Bill List",
        "Payment Scheduling",
        "Payment History",
        "Recurring Payments",
      ],
    },
    {
      id: "sec",
      name: "Security Features",
      submodules: [
        "Two-Factor Auth",
        "Device Management",
        "Security Alerts",
        "Fraud Protection",
      ],
    },
    {
      id: "sup",
      name: "Customer Support",
      submodules: ["Chat Support", "FAQs", "Contact Us", "Feedback"],
    },
  ],
  "3": [
    // Analytics Dashboard
    {
      id: "auth",
      name: "Authentication",
      submodules: ["Login", "Registration", "Password Reset"],
    },
    {
      id: "reporting",
      name: "Reporting",
      submodules: ["Analytics", "Exports", "Dashboards", "Custom Reports"],
    },
    {
      id: "data",
      name: "Data Management",
      submodules: ["Data Import", "Data Processing", "Data Export"],
    },
    {
      id: "visualization",
      name: "Visualization",
      submodules: ["Charts", "Graphs", "Widgets"],
    },
  ],
  "4": [
    // Content Management
    {
      id: "auth",
      name: "Authentication",
      submodules: ["Login", "Registration", "Password Reset"],
    },
    {
      id: "content",
      name: "Content Management",
      submodules: ["Articles", "Media", "Categories", "Templates"],
    },
    {
      id: "user",
      name: "User Management",
      submodules: ["Profile", "Settings", "Permissions", "Roles"],
    },
    {
      id: "workflow",
      name: "Workflow",
      submodules: ["Approval Process", "Review Process", "Publishing"],
    },
  ],
};

// Add mock releases from allocation.tsx
const allocationMockReleases = [
  {
    id: "R002",
    name: "Mobile Banking v2.1",
    version: "2.1.0",
    description: "Security enhancements and UI updates for mobile banking",
    projectId: "PR0001",
    status: "planned",
    releaseDate: "2024-04-01",
    testCases: ["TC-AUT-BIO-0001", "TC-AUT-PIN-0001"],
    features: ["Biometric login", "Quick transfer"],
    bugFixes: ["Fixed session timeout"],
    createdAt: "2024-03-10T09:00:00Z",
  },
  {
    id: "R003",
    name: "Inventory v1.2",
    version: "1.2.0",
    description: "Performance improvements and bug fixes for inventory system",
    projectId: "PR0003",
    status: "completed",
    releaseDate: "2024-02-15",
    testCases: [],
    features: ["Faster report generation"],
    bugFixes: ["Fixed database timeout"],
    createdAt: "2024-02-01T08:00:00Z",
  },
  {
    id: "R004",
    name: "E-commerce Platform v3.0",
    version: "3.0.0",
    description: "Major update with new payment gateway integration and improved user experience",
    projectId: "PR0001",
    status: "in-progress",
    releaseDate: "2024-05-15",
    testCases: ["TC-PAY-001", "TC-CART-002", "TC-USER-003"],
    features: ["New payment gateway", "Enhanced cart", "User dashboard"],
    bugFixes: ["Fixed checkout flow", "Improved search"],
    createdAt: "2024-04-01T10:00:00Z",
  },
  {
    id: "R005",
    name: "Analytics Dashboard v2.5",
    version: "2.5.0",
    description: "Advanced analytics with real-time data visualization and custom reports",
    projectId: "PR0002",
    status: "planned",
    releaseDate: "2024-06-01",
    testCases: ["TC-ANALYTICS-001", "TC-REPORTS-002", "TC-VISUAL-003"],
    features: ["Real-time analytics", "Custom reports", "Data export"],
    bugFixes: ["Fixed chart rendering", "Improved performance"],
    createdAt: "2024-04-15T14:00:00Z",
  },
];

// Merge allocationMockReleases into mockReleases
const mockReleases = [
  // ...existing mockReleases...
  {
    id: "R001",
    name: "Mobile Banking v2.0",
    version: "2.0.0",
    description: "Major update with new features and improved security",
    projectId: "2",
    status: "completed",
    releaseDate: "2024-03-01",
    testCases: ["TC-AUT-BIO-0001", "TC-AUT-PIN-0001"],
    features: ["Biometric login", "Quick transfer"],
    bugFixes: ["Fixed session timeout"],
    createdAt: "2024-02-15T09:00:00Z",
  },
  {
    id: "R002",
    name: "Analytics Dashboard v1.5",
    version: "1.5.0",
    description: "Enhanced analytics with new visualization options",
    projectId: "3",
    status: "in-progress",
    releaseDate: "2024-04-15",
    testCases: ["TC-ANALYTICS-001", "TC-REPORTS-002"],
    features: ["New charts", "Export functionality"],
    bugFixes: ["Fixed data loading"],
    createdAt: "2024-03-20T10:00:00Z",
  },
  {
    id: "R003",
    name: "Content Management v2.1",
    version: "2.1.0",
    description: "Content management system with workflow improvements",
    projectId: "4",
    status: "planned",
    releaseDate: "2024-05-01",
    testCases: ["TC-CONTENT-001", "TC-WORKFLOW-002"],
    features: ["Workflow automation", "Content approval"],
    bugFixes: ["Fixed publishing issues"],
    createdAt: "2024-04-01T11:00:00Z",
  },
  {
    id: "R004",
    name: "E-commerce Platform v3.0",
    version: "3.0.0",
    description: "Major update with new payment gateway integration and improved user experience",
    projectId: "2",
    status: "in-progress",
    releaseDate: "2024-05-15",
    testCases: ["TC-PAY-001", "TC-CART-002", "TC-USER-003"],
    features: ["New payment gateway", "Enhanced cart", "User dashboard"],
    bugFixes: ["Fixed checkout flow", "Improved search"],
    createdAt: "2024-04-01T10:00:00Z",
  },
  {
    id: "R005",
    name: "Analytics Dashboard v2.5",
    version: "2.5.0",
    description: "Advanced analytics with real-time data visualization and custom reports",
    projectId: "3",
    status: "planned",
    releaseDate: "2024-06-01",
    testCases: ["TC-ANALYTICS-001", "TC-REPORTS-002", "TC-VISUAL-003"],
    features: ["Real-time analytics", "Custom reports", "Data export"],
    bugFixes: ["Fixed chart rendering", "Improved performance"],
    createdAt: "2024-04-15T14:00:00Z",
  },
  // Add allocationMockReleases (filter out duplicates by id)
  ...allocationMockReleases.filter(
    allocRelease => ![
      "R001","R002","R003","R004","R005"
    ].includes(allocRelease.id)
  )
];

// Sample releases for PR0001
const sampleReleases = [
  {
    id: "R002",
    name: "Mobile Banking v2.1",
    version: "2.1.0",
    description: "Security enhancements and UI updates for mobile banking",
    projectId: "PR0001",
    status: "planned",
    releaseDate: "2024-04-01",
    testCases: ["TC-AUT-BIO-0001", "TC-AUT-PIN-0001"],
    features: ["Biometric login", "Quick transfer"],
    bugFixes: ["Fixed session timeout"],
    createdAt: "2024-03-10T09:00:00Z",
  },
  {
    id: "R004",
    name: "E-commerce Platform v3.0",
    version: "3.0.0",
    description: "Major update with new payment gateway integration and improved user experience",
    projectId: "PR0001",
    status: "in-progress",
    releaseDate: "2024-05-15",
    testCases: ["TC-PAY-001", "TC-CART-002", "TC-USER-003"],
    features: ["New payment gateway", "Enhanced cart", "User dashboard"],
    bugFixes: ["Fixed checkout flow", "Improved search"],
    createdAt: "2024-04-01T10:00:00Z",
  },
];

// Merge sample releases into mockReleases (avoid duplicates)
const mockReleasesWithSamples = [
  ...mockReleases,
  ...sampleReleases.filter(
    sample => !mockReleases.some(r => r.id === sample.id)
  )
];

// Mock QA (engineers/teams)
const mockQA: any[] = [
  {
    id: "QA001",
    name: "Sarah Wilson",
    role: "QA Engineer",
    email: "sarah.wilson@company.com",
    skills: ["Manual Testing", "Automation", "Selenium", "Jest"],
    experience: 3,
    department: "Quality Assurance",
    status: "active",
  },
  {
    id: "QA002",
    name: "QA Team Alpha",
    role: "QA Team",
    email: "qa.alpha@company.com",
    skills: ["Regression Testing", "Performance Testing"],
    experience: 5,
    department: "Quality Assurance",
    status: "active",
  },
  {
    id: "QA003",
    name: "Michael Chen",
    role: "Senior QA Engineer",
    email: "michael.chen@company.com",
    skills: ["API Testing", "Mobile Testing", "Cypress", "Appium"],
    experience: 7,
    department: "Quality Assurance",
    status: "active",
  },
  {
    id: "QA004",
    name: "Emily Rodriguez",
    role: "QA Lead",
    email: "emily.rodriguez@company.com",
    skills: ["Test Strategy", "Team Management", "JIRA", "TestRail"],
    experience: 8,
    department: "Quality Assurance",
    status: "active",
  },
  {
    id: "QA005",
    name: "David Thompson",
    role: "Automation Engineer",
    email: "david.thompson@company.com",
    skills: ["Playwright", "Python", "CI/CD", "Performance Testing"],
    experience: 4,
    department: "Quality Assurance",
    status: "active",
  },
  {
    id: "QA006",
    name: "Priya Patel",
    role: "QA Analyst",
    email: "priya.patel@company.com",
    skills: ["Exploratory Testing", "Bug Reporting"],
    experience: 2,
    department: "Quality Assurance",
    status: "active",
  },
  {
    id: "QA007",
    name: "QA Team Beta",
    role: "QA Team",
    email: "qa.beta@company.com",
    skills: ["Load Testing", "Security Testing"],
    experience: 6,
    department: "Quality Assurance",
    status: "active",
  },
];

// Add mockTestCases and mockQA if not already present
const mockTestCases: TestCase[] = [];

// Helper: Use mock data if API/server is not working
function useMockOrApiData(apiData: any, mockData: any): any {
  if (!apiData || (Array.isArray(apiData) && apiData.length === 0)) {
    return mockData;
  }
  return apiData;
}

export const ReleaseView: React.FC = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const {
    projects,
    testCases,
    setSelectedProjectId,
    addRelease,
    modulesByProject,
  } = useApp();
  const [selectedProject, setSelectedProject] = useState<string | null>(
    projectId || null
  );
  const [selectedRelease, setSelectedRelease] = useState<string | null>(null);
  const[releases, setReleases] = useState<any[]>([]);
  const [selectedModule, setSelectedModule] = useState("");
  const [selectedSubmodule, setSelectedSubmodule] = useState("");
  const [isViewStepsModalOpen, setIsViewStepsModalOpen] = useState(false);
  const [isViewTestCaseModalOpen, setIsViewTestCaseModalOpen] = useState(false);
  const [isCreateReleaseModalOpen, setIsCreateReleaseModalOpen] =
    useState(false);
  const [viewingTestCase, setViewingTestCase] = useState<TestCase | null>(null);
  const [releaseFormData, setReleaseFormData] = useState({
    name: "",
    version: "",
    description: "",
    releaseDate: "",
    releaseType: "",
  });
  const [releaseSearch, setReleaseSearch] = useState("");
  const [releaseCardView, setReleaseCardView] = useState<any>(null);
  const [searchResults, setSearchResults] = useState<any[] | null>(null);
  const [searchError, setSearchError] = useState<string>("");
  const [isSearching, setIsSearching] = useState(false);

  const [apiRelease, setApiRelease] = useState<any>(null);
  const [loadingRelease, setLoadingRelease] = useState(false);
  const [releaseError, setReleaseError] = useState<string | null>(null);
  const [qaAllocations, setQaAllocations] = useState<{[releaseId: string]: {[qaId: string]: string[]}}>({});
  const [loadingQAAllocations, setLoadingQAAllocations] = useState<{[releaseId: string]: boolean}>({});

  // Read allocated test cases and QA allocations from localStorage
  const [allocatedTestCases, setAllocatedTestCases] = useState<{[releaseId: string]: string[]}>({});
  useEffect(() => {
    const stored = localStorage.getItem('qaAllocatedTestCases');
    if (stored) setAllocatedTestCases(JSON.parse(stored));
    const qaAlloc = localStorage.getItem('qaAllocations');
    if (qaAlloc) setQaAllocations(JSON.parse(qaAlloc));
  }, []);

  // Filter test cases for selected release using allocation mapping
  const allocatedIds = allocatedTestCases[selectedRelease || ''] || [];
  const releaseTestCases = testCases.filter(
    (tc) => allocatedIds.includes(tc.id)
  );

  useEffect(() => {
    if (selectedRelease) {
      setLoadingRelease(true);
      setReleaseError(null);
      axios
        .get(`http://192.168.1.46:8088/api/v1/releases/releaseId/${selectedRelease}`)
        .then((res) => setApiRelease(res.data))
        .catch((err) => setReleaseError(err.message))
        .finally(() => setLoadingRelease(false));
    } else {
      setApiRelease(null);
    }
  }, [selectedRelease]);
  
  

  useEffect(() => {
    if (selectedProject) {
      setSelectedProjectId(selectedProject);
    }
  }, [selectedProject, setSelectedProjectId]);
  console.log({releaseSearch});
  

  const getReleaseCardView =  async() =>{

      try {
          const response = await projectReleaseCardView(selectedProject);
          setReleases(response.data || []);
      } catch (error) {
          console.error("Error fetching release card view:", error);
      }
  }
  useEffect(() => {
      getReleaseCardView();
  }, [selectedProject]);

  const fetchQAAllocations = async (releaseId: string) => {
    if (qaAllocations[releaseId]) return; // Already loaded
    
    setLoadingQAAllocations(prev => ({ ...prev, [releaseId]: true }));
    try {
      const response = await getQAAllocationsByRelease(releaseId);
      setQaAllocations(prev => ({ 
        ...prev, 
        [releaseId]: response.data || {} 
      }));
    } catch (error) {
      console.error("Error fetching QA allocations:", error);
      // Don't show error to user, just log it
    } finally {
      setLoadingQAAllocations(prev => ({ ...prev, [releaseId]: false }));
    }
  };

  // Fetch QA allocations for all releases when they are loaded
  useEffect(() => {
    if (releases.length > 0) {
      releases.forEach(release => {
        fetchQAAllocations(release.id || release.releaseId);
      });
    }
  }, [releases]);

const handleReleaseSearch = async (searchValue: string) => {
    
    setIsSearching(true);
    setSearchError("");
    // if (!searchValue && !selectedProject) {
    //   setSearchResults(null);
    //   setIsSearching(false);
    //   return;
    // }
    if(!searchValue){
      setSearchResults([])
      getReleaseCardView();
      setIsSearching(false);
    }else{
    try {
      
      
      const response = await searchRelease(searchValue );

      if (response.status === "success" && response.statusCode === 200) {
        setSearchResults(response?.data);
      } else {
        setSearchResults([]);
        setSearchError(response.message || "No results found");
      }
    } catch (error: any) {
      setSearchResults([]);
      setSearchError(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to search releases"
      );
    } finally {
      setIsSearching(false);
    }
  }
  };
  console.log({searchResults});
  console.log(releaseCardView);
  

  // Get modules for selected project
  const projectModules = selectedProject
    ? mockModules[selectedProject] || []
    : [];

  // Filter test cases based on module/submodule selection
  const filteredTestCases = React.useMemo(() => {
    if (!selectedRelease) return [];

    let filtered = releaseTestCases;

    if (selectedModule) {
      filtered = filtered.filter((tc) => tc.module === selectedModule);
    }

    if (selectedSubmodule) {
      filtered = filtered.filter((tc) => tc.subModule === selectedSubmodule);
    }

    return filtered;
  }, [releaseTestCases, selectedModule, selectedSubmodule, selectedRelease]);

  // Handle project selection
  const handleProjectSelect = (projectId: string) => {
    setSelectedProject(projectId);
    setSelectedProjectId(projectId);
    setSelectedRelease(null);
    setSelectedModule("");
    setSelectedSubmodule("");
  };

  // Handle release selection
  const handleReleaseSelect = (releaseId: string) => {
    console.log('Release card clicked:', releaseId);
    setSelectedRelease(releaseId);
    setSelectedModule("");
    setSelectedSubmodule("");
  };

  // Handle module selection
  const handleModuleSelect = (moduleName: string) => {
    setSelectedModule(moduleName);
    setSelectedSubmodule("");
  };

  // Handle submodule selection
  const handleSubmoduleSelect = (submoduleName: string) => {
    setSelectedSubmodule(submoduleName);
  };

  // Get severity color
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Read mockTestCases and mockQA from localStorage if available
  let storedMockTestCases = null;
  let storedMockQA = null;
  try {
    const stored = localStorage.getItem('mockTestCases');
    if (stored) storedMockTestCases = JSON.parse(stored);
    const storedQA = localStorage.getItem('mockQA');
    if (storedQA) storedMockQA = JSON.parse(storedQA);
  } catch (e) {}

  const effectiveTestCases = useMockOrApiData(testCases, storedMockTestCases || mockTestCases);
  const effectiveQA = storedMockQA || mockQA;

  // Update getAssignedQA to use effectiveQA
  function getAssignedQA(testCaseId: string) {
    const allocations = qaAllocations[selectedRelease || ''] || {};
    for (const [qaId, testCaseIds] of Object.entries(allocations)) {
      if ((testCaseIds as string[]).includes(testCaseId)) {
        const qa = effectiveQA.find((q: any) => q.id === qaId);
        return qa ? qa.name : qaId;
      }
    }
    return null;
  }

  const handleViewSteps = (testCase: TestCase) => {
    setViewingTestCase(testCase);
    setIsViewStepsModalOpen(true);
  };

  const handleViewTestCase = (testCase: TestCase) => {
    setViewingTestCase(testCase);
    setIsViewTestCaseModalOpen(true);
  };

  // Handle create release
  const handleCreateRelease = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedProject) return;

    // Prepare payload for API
    const payload = {
      releaseName: releaseFormData.name,
      releaseDate: releaseFormData.releaseDate, // YYYY-MM-DD
      releaseType: releaseFormData.releaseType,
      projectId: selectedProject,
    };

    try {
      const response = await createRelease(payload);
      if (response.status === "success" && response.statusCode === 2000) {
        getReleaseCardView();
        setIsCreateReleaseModalOpen(false);
        setReleaseFormData({
          name: "",
          version: "",
          description: "",
          releaseDate: "",
          releaseType: "",
        });
        alert("Release created successfully");
      } else {
        alert(response.message || "Failed to create release");
      }
    } catch (error: any) {
      alert(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to create release"
      );
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setReleaseFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Use mock data if API/server is not working (moved inside component)
  const effectiveReleases = useMockOrApiData(
    releases,
    mockReleasesWithSamples.filter((r: any) => !selectedProject || r.projectId === selectedProject)
  );

  // If we're in detailed release view (release selected)
  if (selectedRelease) {
    if (loadingRelease) {
      return <div className="p-8 text-center">Loading release details...</div>;
    }
    if (releaseError) {
      return <div className="p-8 text-center text-red-500">{releaseError}</div>;
    }
    const currentRelease = apiRelease;
    const currentProject = projects.find((p) => p.id === selectedProject);

    return (
      <div className="max-w-6xl mx-auto">
        {/* Fixed Header Section */}
        <div className="flex-none p-6 pb-4">
          <div className="flex justify-between items-center mb-4">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-gray-900">
                Release Details
              </h1>
              <p className="text-sm text-gray-500">
                {currentProject?.name} - {currentRelease?.name}
              </p>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="primary"
                onClick={() => navigate(`/projects/${projectId}/releases/allocation`)}
                className="flex items-center space-x-2"
              >
                <Users className="w-4 h-4" />
                <span>Allocate QA</span>
              </Button>
              <Button
                variant="secondary"
                onClick={() => setSelectedRelease(null)}
                className="flex items-center space-x-2"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </Button>
            </div>
          </div>

          {/* QA Allocation Summary */}
          {(() => {
            const releaseId = selectedRelease;
            const releaseAllocations = qaAllocations[releaseId] || {};
            const totalAllocated = Object.values(releaseAllocations).reduce((sum, testCaseIds) => 
              sum + testCaseIds.length, 0
            );
            const totalTestCases = filteredTestCases.length;
            
            if (Object.keys(releaseAllocations).length > 0) {
              return (
                <Card className="mb-4">
                  <CardContent className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">QA Allocation Summary</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{totalAllocated}</div>
                        <div className="text-sm text-gray-500">Test Cases Allocated</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{totalTestCases - totalAllocated}</div>
                        <div className="text-sm text-gray-500">Test Cases Unassigned</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">{Object.keys(releaseAllocations).length}</div>
                        <div className="text-sm text-gray-500">QA Engineers Assigned</div>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(releaseAllocations).map(([qaId, testCaseIds]) => (
                          <div key={qaId} className="flex items-center space-x-2 bg-blue-50 px-3 py-1 rounded-full">
                            <span className="text-sm font-medium text-blue-800">{qaId}</span>
                            <span className="text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                              {testCaseIds.length} test cases
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            }
            return null;
          })()}

          {/* Module Selection Panel */}
          <Card className="mb-4">
            <CardContent className="p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                Module Selection
              </h2>
              <div className="relative flex items-center">
                <button
                  onClick={() => {
                    const container = document.getElementById("module-scroll");
                    if (container) container.scrollLeft -= 200;
                  }}
                  className="flex-shrink-0 z-10 bg-white shadow-md rounded-full p-1 hover:bg-gray-50 mr-2"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>
                <div
                  id="module-scroll"
                  className="flex space-x-2 overflow-x-auto pb-2 scroll-smooth flex-1"
                  style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                  {projectModules.map((module) => {
                    const moduleTestCases = filteredTestCases.filter(
                      (tc) => tc.module === module.name
                    );
                    return (
                      <Button
                        key={module.id}
                        variant={
                          selectedModule === module.name
                            ? "primary"
                            : "secondary"
                        }
                        onClick={() => handleModuleSelect(module.name)}
                        className="whitespace-nowrap m-2"
                      >
                        {module.name}
                        <Badge variant="info" className="ml-2">
                          {moduleTestCases.length}
                        </Badge>
                      </Button>
                    );
                  })}
                </div>
                <button
                  onClick={() => {
                    const container = document.getElementById("module-scroll");
                    if (container) container.scrollLeft += 200;
                  }}
                  className="flex-shrink-0 z-10 bg-white shadow-md rounded-full p-1 hover:bg-gray-50 ml-2"
                >
                  <ChevronRight className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Submodule Selection Panel */}
          <Card className="mb-4">
            <CardContent className="p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                Submodule Selection
              </h2>
              <div className="relative flex items-center min-h-[44px]">
                <button
                  onClick={() => {
                    const container =
                      document.getElementById("submodule-scroll");
                    if (container) container.scrollLeft -= 200;
                  }}
                  className="flex-shrink-0 z-10 bg-white shadow-md rounded-full p-1 hover:bg-gray-50 mr-2"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>
                <div
                  id="submodule-scroll"
                  className="flex space-x-2 overflow-x-auto p-2 scroll-smooth flex-1"
                  style={{
                    scrollbarWidth: "none",
                    msOverflowStyle: "none",
                    maxWidth: "100%",
                  }}
                >
                  {projectModules
                    .find((m) => m.name === selectedModule)
                    ?.submodules.map((submodule) => {
                      const submoduleTestCases = filteredTestCases.filter(
                        (tc) =>
                          tc.module === selectedModule &&
                          tc.subModule === submodule
                      );
                      return (
                        <Button
                          key={submodule}
                          variant={
                            selectedSubmodule === submodule
                              ? "primary"
                              : "secondary"
                          }
                          onClick={() => handleSubmoduleSelect(submodule)}
                          className="whitespace-nowrap m-2"
                        >
                          {submodule}
                          <Badge variant="info" className="ml-2">
                            {submoduleTestCases.length}
                          </Badge>
                        </Button>
                      );
                    })}
                </div>
                <button
                  onClick={() => {
                    const container =
                      document.getElementById("submodule-scroll");
                    if (container) container.scrollLeft += 200;
                  }}
                  className="flex-shrink-0 z-10 bg-white shadow-md rounded-full p-1 hover:bg-gray-50 ml-2"
                >
                  <ChevronRight className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Content Area - Test Cases Table */}
        <div className="flex-1 px-6 pb-6">
          <Card>
            <CardContent className="p-0">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr className="border-b border-gray-200">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Test Case ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Steps
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Severity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Assigned QA
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTestCases.map((testCase: TestCase) => (
                    <tr key={testCase.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {testCase.id}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {testCase.description}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <button
                          onClick={() => handleViewSteps(testCase)}
                          className="text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                          title="View Steps"
                        >
                          <Eye className="w-4 h-4" />
                          <span>View</span>
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {testCase.type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(
                            testCase.severity
                          )}`}
                        >
                          {testCase.severity}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {(() => {
                          const assignedQA = getAssignedQA(testCase.id);
                          return assignedQA ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {assignedQA}
                            </span>
                          ) : (
                            <span className="text-gray-400 text-xs">Not assigned</span>
                          );
                        })()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleViewTestCase(testCase)}
                            className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody >
              </table>
            </CardContent>
          </Card>
        </div>

        {/* View Steps Modal */}
        <Modal
          isOpen={isViewStepsModalOpen}
          onClose={() => {
            setIsViewStepsModalOpen(false);
            setViewingTestCase(null);
          }}
          title={`Test Steps - ${viewingTestCase?.id}`}
        >
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700 whitespace-pre-line">
                {viewingTestCase?.steps}
              </p>
            </div>
            <div className="flex justify-end pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setIsViewStepsModalOpen(false);
                  setViewingTestCase(null);
                }}
              >
                Close
              </Button>
            </div>
          </div>
        </Modal>

        {/* View Test Case Modal */}
        <Modal
          isOpen={isViewTestCaseModalOpen}
          onClose={() => {
            setIsViewTestCaseModalOpen(false);
            setViewingTestCase(null);
          }}
          title={`Test Case Details - ${viewingTestCase?.id}`}
          size="xl"
        >
          {viewingTestCase && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Description
                  </h3>
                  <p className="mt-1 text-sm text-gray-900">
                    {viewingTestCase.description}
                  </p>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  Test Steps
                </h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 whitespace-pre-line">
                    {viewingTestCase.steps}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Severity
                  </h3>
                  <span
                    className={`mt-1 inline-flex px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(
                      viewingTestCase.severity
                    )}`}
                  >
                    {viewingTestCase.severity}
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Module</h3>
                  <p className="mt-1 text-sm text-gray-900">
                    {viewingTestCase.module} / {viewingTestCase.subModule}
                  </p>
                </div>
              </div>
              <div className="flex justify-end pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setIsViewTestCaseModalOpen(false);
                    setViewingTestCase(null);
                  }}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    );
  }

  // Main Release View page (project selection and release cards)
  return (
    <div className="max-w-6xl mx-auto py-8">
      {/* Back Button at the top right */}
      <div className="mb-4 flex justify-end">
        <Button
          variant="secondary"
          onClick={() => navigate(`/projects/${projectId}/project-management`)}
          className="flex items-center"
        >
          <ChevronLeft className="w-5 h-5 mr-2" /> Back
        </Button>
      </div>

      {/* Project Selection Panel */}
      <ProjectSelector
        projects={projects}
        selectedProjectId={selectedProject}
        onSelect={handleProjectSelect}
        className="mb-6"
      />

      {/* Release Search Bar */}
      {selectedProject && (
        <div className="mb-4 flex items-center ">
          <input
            type="text"
            placeholder="Search releases by name..."
             onChange={(e:any) => setReleaseSearch(e.target.value)}

            value={releaseSearch}
           
            className="w-full md:w-1/2 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            style={{ minWidth: 220 }}
          />
          <button 
            onClick={() => handleReleaseSearch(releaseSearch)}
            className="ml-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Search
          </button>
        </div>
      )}

      {/* Release Cards Panel */}
      {selectedProject && (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Release Overview
            </h2>
            <Button
              onClick={() => setIsCreateReleaseModalOpen(true)}
              className="flex items-center space-x-2"
              disabled={!selectedProject}
            >
              <Plus className="w-4 h-4" />
              <span>Create Release</span>
            </Button>
          </div>
          {isSearching && (
            <div className="text-center text-gray-500 mb-4">Searching...</div>
          )}
          {searchError && (
            <div className="text-center text-red-500 mb-4">{searchError}</div>
          )}
          {effectiveReleases.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-gray-500">
                  No releases found for the selected project. Please create releases first.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {effectiveReleases.map((release: any) => {
                const releaseTestCases = testCases.filter(
                  (tc) =>
                    tc.projectId === selectedProject &&
                    tc.releaseId === release.id
                );
                const totalTestCases = releaseTestCases.length;
                const currentProject = projects.find(
                  (p) => p.id === selectedProject
                );
                const releaseId = release.id || release.releaseId;
                const releaseQAAllocations = qaAllocations[releaseId] || {};
                const isLoadingQA = loadingQAAllocations[releaseId];

                return (
                  <Card
                    key={release.id}
                    hover
                    className="cursor-pointer group transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
                    onClick={() => handleReleaseSelect(release.id)}
                  >
                    <CardContent className="p-6">
                      {/* Header */}
                      <div className="mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {release.name || release.releaseName}
                        </h3>
                        <p className="text-sm text-gray-500">
                          v{release.version || release.releaseId}
                        </p>
                      </div>

                      {/* Description */}
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {release.description}
                      </p>
                    
                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center space-x-2">
                          <FileText className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-500">Test Cases</p>
                            <p className="text-sm font-medium text-gray-900">
                              {totalTestCases}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-500">Release Date</p>
                            <p className="text-sm font-medium text-gray-900">
                              {release.releaseDate
                                ? new Date(
                                    release.releaseDate
                                  ).toLocaleDateString()
                                : "TBD"}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* QA Allocation Info */}
                      <div className="mb-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span className="text-xs text-gray-500">QA Allocations</span>
                        </div>
                        {isLoadingQA ? (
                          <div className="text-xs text-gray-400">Loading QA info...</div>
                        ) : Object.keys(releaseQAAllocations).length > 0 ? (
                          <div className="space-y-1">
                            {Object.entries(releaseQAAllocations).map(([qaId, testCaseIds]) => (
                              <div key={qaId} className="flex items-center justify-between text-xs bg-blue-50 p-1 rounded">
                                <span className="text-blue-700 font-medium">{qaId}</span>
                                <span className="text-blue-600">{testCaseIds.length} test cases</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-xs text-gray-400">No QA allocations</div>
                        )}
                      </div>

                      {/* Project Info */}
                      {currentProject && (
                        <div className="pt-4 border-t border-gray-200">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Users className="w-4 h-4 text-gray-400" />
                              <span className="text-xs text-gray-500">
                                Project: {currentProject.name}
                              </span>
                            </div>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/projects/${projectId}/releases/allocation`);
                              }}
                              className="text-xs"
                            >
                              Allocate QA
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Create Release Modal */}
      <Modal
        isOpen={isCreateReleaseModalOpen}
        onClose={() => {
          setIsCreateReleaseModalOpen(false);
          setReleaseFormData({
            name: "",
            version: "",
            description: "",
            releaseDate: "",
            releaseType: "",
          });
        }}
        title="Create New Release"
        size="xl"
      >
        <form onSubmit={handleCreateRelease} className="space-y-4">
          {/* <div className="grid grid-cols-2 gap-4"> */}
            <Input
              label="Release Name"
              value={releaseFormData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              required
            />
            {/* <Input
              label="Version"
              value={releaseFormData.version}
              onChange={(e) => handleInputChange("version", e.target.value)}
              required
            /> */}
          {/* </div> */}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Release Type
            </label>
            <select
              value={releaseFormData.releaseType}
              onChange={(e) => handleInputChange("releaseType", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Select Release Type</option>
              <option value="Client Release">Client Release</option>
              <option value="Project Release">Project Release</option>
              <option value="Frontend Release">Frontend Release</option>
              <option value="QA Release">QA Release</option>
              <option value="Backend Release">Backend Release</option>
            </select>
          </div>

          {/* <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={releaseFormData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              required
            />
          </div> */}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Release Date
            </label>
            <input
              type="date"
              value={releaseFormData.releaseDate}
              onChange={(e) => handleInputChange("releaseDate", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsCreateReleaseModalOpen(false);
                setReleaseFormData({
                  name: "",
                  version: "",
                  description: "",
                  releaseDate: "",
                  releaseType: "",
                });
              }}
            >
              Cancel
            </Button>
            <Button type="submit">Create Release</Button>
          </div>
        </form>
      </Modal>
      {/* Fixed Quick Add Button */}
      <div
        style={{
          position: "fixed",
          bottom: 32,
          right: 32,
          zIndex: 50,
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <QuickAddTestCase />
        <QuickAddDefect />
      </div>

      {/* Always show sample release cards for Mobile Banking v2.1 and E-commerce Platform v3.0 */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Sample Releases (Mock)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sampleReleases.map((release: any) => (
            <Card
              key={release.id}
              hover
              className="cursor-pointer group transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
              onClick={() => handleReleaseSelect(release.id)}
            >
              <CardContent className="p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{release.name}</h3>
                  <p className="text-sm text-gray-500">Version: {release.version}</p>
                </div>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{release.description}</p>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">Release Date:</span>
                    <span className="text-sm font-medium text-gray-900">{release.releaseDate ? new Date(release.releaseDate).toLocaleDateString() : "TBD"}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};