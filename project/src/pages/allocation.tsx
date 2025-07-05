import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import {
  ChevronLeft,
  Eye,
  Edit2,
  Trash2,
  Plus,
  ChevronRight,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { Modal } from "../components/ui/Modal";
import QuickAddTestCase from "./QuickAddTestCase";
import QuickAddDefect from "./QuickAddDefect";
import { ProjectSelector } from "../components/ui/ProjectSelector";
import axios from 'axios';
import { projectReleaseCardView } from "../api/releaseView/ProjectReleaseCardView";

const BASE_URL = import.meta.env.VITE_BASE_URL;
//integration

const TABS = [
  { key: "release", label: "Release Allocation" },
  { key: "qa", label: "QA Allocation" },
];

// --- MOCK DATA SECTION (for modules, submodules, testcases, QA, releases) ---

// Mock Modules and Submodules
const mockModules = [
  {
    id: "auth",
    name: "Authentication",
    submodules: [
      { id: "auth-bio", name: "Biometric Login" },
      { id: "auth-pin", name: "PIN Login" },
      { id: "auth-pass", name: "Password Reset" },
      { id: "auth-session", name: "Session Management" },
    ],
  },
  {
    id: "acc",
    name: "Account Management",
    submodules: [
      { id: "acc-overview", name: "Account Overview" },
      { id: "acc-history", name: "Transaction History" },
      { id: "acc-statements", name: "Account Statements" },
      { id: "acc-settings", name: "Account Settings" },
    ],
  },
  {
    id: "payment",
    name: "Payment",
    submodules: [
      { id: "pay-gateway", name: "Gateway Integration" },
      { id: "pay-methods", name: "Payment Methods" },
      { id: "pay-security", name: "Payment Security" },
      { id: "pay-processing", name: "Payment Processing" },
    ],
  },
  {
    id: "cart",
    name: "Shopping Cart",
    submodules: [
      { id: "cart-management", name: "Cart Management" },
      { id: "cart-checkout", name: "Checkout Process" },
      { id: "cart-discounts", name: "Discounts & Coupons" },
      { id: "cart-inventory", name: "Inventory Check" },
    ],
  },
  {
    id: "user",
    name: "User Management",
    submodules: [
      { id: "user-dashboard", name: "Dashboard" },
      { id: "user-profile", name: "Profile Management" },
      { id: "user-preferences", name: "User Preferences" },
      { id: "user-security", name: "Security Settings" },
    ],
  },
  {
    id: "analytics",
    name: "Analytics",
    submodules: [
      { id: "analytics-realtime", name: "Real-time Data" },
      { id: "analytics-trends", name: "Trend Analysis" },
      { id: "analytics-metrics", name: "Key Metrics" },
      { id: "analytics-insights", name: "Data Insights" },
    ],
  },
  {
    id: "reporting",
    name: "Reporting",
    submodules: [
      { id: "reports-custom", name: "Custom Reports" },
      { id: "reports-scheduled", name: "Scheduled Reports" },
      { id: "reports-export", name: "Data Export" },
      { id: "reports-sharing", name: "Report Sharing" },
    ],
  },
  {
    id: "visualization",
    name: "Visualization",
    submodules: [
      { id: "visual-charts", name: "Charts" },
      { id: "visual-graphs", name: "Graphs" },
      { id: "visual-dashboards", name: "Dashboards" },
      { id: "visual-widgets", name: "Widgets" },
    ],
  },
  // ...add more modules as needed
];

// Mock Test Cases
const mockTestCases = [
  {
    id: "TC-AUT-BIO-0001",
    module: "Authentication",
    subModule: "Biometric Login",
    description: "Verify that users can log in using biometric authentication",
    steps: "Open the mobile banking app\nSelect biometric login option\nAuthenticate using fingerprint/face ID\nVerify successful login and redirection to dashboard",
    type: "functional",
    severity: "high",
    status: "active",
    projectId: "PR0001",
  },
  {
    id: "TC-AUT-PIN-0001",
    module: "Authentication",
    subModule: "PIN Login",
    description: "Test PIN login security features",
    steps: "Enter incorrect PIN 3 times\nVerify account lockout\nWait for lockout period\nEnter correct PIN\nVerify successful login",
    type: "functional",
    severity: "critical",
    status: "active",
    projectId: "PR0001",
  },
  {
    id: "TC-PAY-001",
    module: "Payment",
    subModule: "Gateway Integration",
    description: "Test new payment gateway integration",
    steps: "Add items to cart\nProceed to checkout\nSelect new payment method\nComplete payment\nVerify order confirmation",
    type: "integration",
    severity: "high",
    status: "active",
    projectId: "PR0001",
  },
  {
    id: "TC-CART-002",
    module: "Shopping Cart",
    subModule: "Cart Management",
    description: "Test enhanced cart functionality",
    steps: "Add multiple items to cart\nModify quantities\nRemove items\nApply discount codes\nVerify total calculation",
    type: "functional",
    severity: "medium",
    status: "active",
    projectId: "PR0001",
  },
  {
    id: "TC-USER-003",
    module: "User Management",
    subModule: "Dashboard",
    description: "Test new user dashboard features",
    steps: "Login to user account\nNavigate to dashboard\nView order history\nUpdate profile information\nSave changes",
    type: "functional",
    severity: "medium",
    status: "active",
    projectId: "PR0001",
  },
  {
    id: "TC-ANALYTICS-001",
    module: "Analytics",
    subModule: "Real-time Data",
    description: "Test real-time analytics data display",
    steps: "Access analytics dashboard\nSelect real-time data view\nVerify data updates\nExport data\nGenerate reports",
    type: "functional",
    severity: "high",
    status: "active",
    projectId: "PR0002",
  },
  {
    id: "TC-REPORTS-002",
    module: "Reporting",
    subModule: "Custom Reports",
    description: "Test custom report generation",
    steps: "Navigate to reports section\nCreate custom report\nSelect data parameters\nGenerate report\nDownload report",
    type: "functional",
    severity: "medium",
    status: "active",
    projectId: "PR0002",
  },
  {
    id: "TC-VISUAL-003",
    module: "Visualization",
    subModule: "Charts",
    description: "Test data visualization components",
    steps: "Select chart type\nConfigure data source\nCustomize appearance\nSave chart configuration\nShare chart",
    type: "functional",
    severity: "low",
    status: "active",
    projectId: "PR0002",
  },
  // ...add more test cases as needed
];

// Mock QA (engineers/teams)
const mockQA = [
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
  // ...add more QA engineers/teams as needed
];

// Mock Releases
const mockReleases = [
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
  // ...add more releases as needed
];

// --- END MOCK DATA SECTION ---

// Helper: Use mock data if API/server is not working
function useMockOrApiData(apiData: any, mockData: any): any {
  // If API data is empty or null, use mock data
  if (!apiData || (Array.isArray(apiData) && apiData.length === 0)) {
    return mockData;
  }
  return apiData;
}

export const Allocation: React.FC = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const {
    projects,
    releases,
    employees,
    testCases,
    setSelectedProjectId,
    modulesByProject,
  } = useApp();
  const [activeTab, setActiveTab] = useState<"release" | "qa">("release");
  const [selectedReleaseIds, setSelectedReleaseIds] = useState<string[]>([]);
  const [selectedModule, setSelectedModule] = useState("");
  const [selectedSubmodule, setSelectedSubmodule] = useState<string>("");
  const [selectedQA, setSelectedQA] = useState<string | null>(null);
  const [selectedTestCases, setSelectedTestCases] = useState<string[]>([]);
  const [isViewStepsModalOpen, setIsViewStepsModalOpen] = useState(false);
  const [isViewTestCaseModalOpen, setIsViewTestCaseModalOpen] = useState(false);
  const [viewingTestCase, setViewingTestCase] = useState<any>(null);
  const [bulkModuleSelect, setBulkModuleSelect] = useState(false);
  const [bulkSubmoduleSelect, setBulkSubmoduleSelect] = useState(false);
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [selectedSubmodules, setSelectedSubmodules] = useState<string[]>([]);
  const [apiRelease, setApiRelease] = useState<any>(null);
  const [loadingRelease, setLoadingRelease] = useState(false);
  const [releaseError, setReleaseError] = useState<string | null>(null);
  const [projectRelease, setProjectRelease] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [qaAllocatedTestCases, setQaAllocatedTestCases] = useState<{ [releaseId: string]: string[] }>({});
  const [qaAllocations, setQaAllocations] = useState<{[releaseId: string]: {[qaId: string]: string[]}}>( {} );
  const [selectedTestCasesForQA, setSelectedTestCasesForQA] = useState<{[releaseId: string]: string[]}>({});
  const [loadingQAAllocations, setLoadingQAAllocations] = useState(false);
  const [selectedReleaseForQA, setSelectedReleaseForQA] = useState<string | null>(null);
  React.useEffect(() => {
    if (projectId) setSelectedProjectId(projectId);
  }, [projectId, setSelectedProjectId]);

  const getReleaseCardView = async () => {
    try {
      const response = await projectReleaseCardView(selectedProject);
      setProjectRelease(response.data || []);
    } catch (error) {
      console.error("Error fetching release card view:", error);
    }
  };

  const loadExistingQAAllocations = async () => {
    if (!selectedProject || !effectiveProjectRelease.length) return;
    setLoadingQAAllocations(true);
    try {
      // Since API integration is removed, use only mock data or skip loading from API
      // You may want to reset or keep the current state as is
      // setQaAllocations({});
      // setQaAllocatedTestCases({});
    } catch (error) {
      console.error("Error loading existing QA allocations:", error);
    } finally {
      setLoadingQAAllocations(false);
    }
  };

  useEffect(() => {
    getReleaseCardView();
    getReleaseCardView();
  }, [selectedProject]);

  console.log("Project Release Data:", projectRelease);


  // Filter releases for this project
  const projectReleases = releases.filter((r) => r.projectId === projectId);
  // Filter test cases for this project
  const projectTestCases = testCases.filter((tc) => tc.projectId === projectId);

  // Get modules for selected project from context
  const projectModules = projectId ? modulesByProject[projectId] || [] : [];

  // Use mock data if API/server is not working
  const effectiveProjectRelease = useMockOrApiData(projectRelease, mockReleases.filter((r: any) => !projectId || r.projectId === projectId));
  const effectiveTestCases = useMockOrApiData(testCases, mockTestCases.filter((tc: any) => !projectId || tc.projectId === projectId));
  const effectiveModules = useMockOrApiData(projectModules, mockModules);

  // Load existing QA allocations when releases are loaded
  useEffect(() => {
    if (effectiveProjectRelease.length > 0) {
      loadExistingQAAllocations();
    }
  }, [effectiveProjectRelease, selectedProject]);

  // --- Bulk selection effect for test cases ---
  useEffect(() => {
    if (
      activeTab === "release" &&
      selectedReleaseIds.length > 0 &&
      (bulkModuleSelect || bulkSubmoduleSelect)
    ) {
      let ids: string[] = [];
      if (bulkModuleSelect && selectedModules.length > 0) {
        ids = [
          ...ids,
          ...effectiveTestCases
            .filter((tc: any) => selectedModules.includes(tc.module))
            .map((tc: any) => tc.id),
        ];
      } else if (bulkSubmoduleSelect && selectedSubmodules.length > 0) {
        ids = [
          ...ids,
          ...effectiveTestCases
            .filter((tc: any) => selectedSubmodules.includes(tc.subModule))
            .map((tc: any) => tc.id),
        ];
      }
      setSelectedTestCases(Array.from(new Set(ids)));
    }
  }, [
    bulkModuleSelect,
    bulkSubmoduleSelect,
    selectedModules,
    selectedSubmodules,
    effectiveTestCases,
    activeTab,
    selectedReleaseIds,
  ]);

  // --- Filtered test cases for table ---
  let filteredTestCases = effectiveTestCases;
  if (activeTab === "qa") {
    if (selectedReleaseForQA) {
      // Only show test cases allocated to this release and not yet assigned to any QA
      const allocatedTestCases = qaAllocatedTestCases[selectedReleaseForQA] || [];
      const alreadyAllocatedTestCaseIds = Object.values(qaAllocations[selectedReleaseForQA] || {}).flat();
      const unallocatedTestCaseIds = allocatedTestCases.filter(
        id => !alreadyAllocatedTestCaseIds.includes(id)
      );
      filteredTestCases = effectiveTestCases.filter((tc: any) => unallocatedTestCaseIds.includes(tc.id));
    } else {
      filteredTestCases = [];
    }
  } else if (
    activeTab === "release" &&
    selectedReleaseIds.length > 0 &&
    (bulkModuleSelect || bulkSubmoduleSelect)
  ) {
    let ids: Set<string> = new Set();
    if (bulkModuleSelect && selectedModules.length > 0) {
      effectiveTestCases.forEach((tc: any) => {
        if (selectedModules.includes(tc.module)) ids.add(tc.id);
      });
    }
    if (bulkSubmoduleSelect && selectedSubmodules.length > 0) {
      effectiveTestCases.forEach((tc: any) => {
        if (selectedSubmodules.includes(tc.subModule)) ids.add(tc.id);
      });
    }
    filteredTestCases = effectiveTestCases.filter((tc: any) => ids.has(tc.id));
  } else if (selectedModule) {
    filteredTestCases = effectiveTestCases.filter(
      (tc: any) =>
        tc.module === selectedModule &&
        (!selectedSubmodule || tc.subModule === selectedSubmodule)
    );
  }

  // Helper functions for QA allocation (per release)
  const getAllocatedTestCasesForQA = (qaId: string) => {
    if (!selectedReleaseForQA) return [];
    return qaAllocations[selectedReleaseForQA]?.[qaId] || [];
  };

  const isTestCaseAllocated = (testCaseId: string) => {
    if (!selectedReleaseForQA) return false;
    return Object.values(qaAllocations[selectedReleaseForQA] || {}).some(allocations => 
      allocations.includes(testCaseId)
    );
  };

  const allocateTestCasesToQA = (qaId: string, testCaseIds: string[]) => {
    if (!selectedReleaseForQA) return;
    setQaAllocations(prev => ({
      ...prev,
      [selectedReleaseForQA]: {
        ...(prev[selectedReleaseForQA] || {}),
        [qaId]: [...(prev[selectedReleaseForQA]?.[qaId] || []), ...testCaseIds]
      }
    }));
    setSelectedTestCasesForQA(prev => ({
      ...prev,
      [selectedReleaseForQA]: []
    }));
  };

  const removeAllocationFromQA = (qaId: string, testCaseId: string) => {
    if (!selectedReleaseForQA) return;
    setQaAllocations(prev => ({
      ...prev,
      [selectedReleaseForQA]: {
        ...(prev[selectedReleaseForQA] || {}),
        [qaId]: (prev[selectedReleaseForQA]?.[qaId] || []).filter(id => id !== testCaseId)
      }
    }));
  };

  // Project selection handler
  const handleProjectSelect = (id: string) => {
    setSelectedProjectId(id);
    setSelectedProject(id);
    setSelectedModule("");
    setSelectedSubmodule("");
    setSelectedTestCases([]);
  };

  // --- UI Panels ---
  const ProjectSelectionPanel = () => (
    <ProjectSelector
      projects={projects}
      selectedProjectId={projectId || null}
      onSelect={handleProjectSelect}
      className="mb-4"
    />
  );

  // In ReleaseCardsPanel, on Allocate:
  // For each selected release, store the selected test cases
  const handleAllocate = () => {
    setQaAllocatedTestCases(prev => {
      const updated = { ...prev };
      selectedReleaseIds.forEach(id => {
        updated[id] = selectedTestCases;
      });
      return updated;
    });
    setActiveTab("qa");
  };

  const ReleaseCardsPanel = () => (
    <div className="mb-4">
      <div className="flex space-x-2 overflow-x-auto">
        {effectiveProjectRelease.map((release: any) => {
          const releaseId = release.releaseId || release.id;
          const isSelected = selectedReleaseIds.includes(releaseId);
          return (
            <div
              key={releaseId}
              className={`min-w-[160px] px-4 py-2 rounded-md border text-left transition-all duration-200 focus:outline-none text-sm font-medium shadow-sm flex flex-col items-start relative bg-white
                ${
                  isSelected
                    ? "border-blue-500 hover:border-blue-500 hover:bg-blue-50 hover:shadow-md hover:ring-1 hover:ring-blue-300"
                    : "border-gray-200 hover:border-blue-500 hover:bg-blue-50 hover:shadow-md hover:ring-1 hover:ring-blue-300"
                }`}
              style={{
                boxShadow: isSelected ? "0 0 0 2px #3b82f6" : undefined,
              }}
            >
              <div className="truncate font-semibold mb-1">{release.releaseName || release.name}</div>
              <div className="text-xs text-gray-500 mb-2">Version: {release.version}</div>
              <Button
                size="sm"
                variant={isSelected ? "primary" : "secondary"}
                className="w-full"
                onClick={() => {
                  setSelectedReleaseIds((prev) =>
                    isSelected
                      ? prev.filter((id) => id !== releaseId)
                      : [...prev, releaseId]
                  );
                }}
              >
                {isSelected ? "Selected" : "Select"}
              </Button>
            </div>
          );
        })}
      </div>
      {/* Allocate button appears if at least one release is selected */}
      {selectedReleaseIds.length > 0 && (
        <div className="mt-4 flex justify-end">
          <Button
            variant="primary"
            disabled={selectedTestCases.length === 0}
            onClick={handleAllocate}
          >
            Allocate
          </Button>
        </div>
      )}
    </div>
  );

  const ModuleSelectionPanel = () => (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold text-gray-900">
            Module Selection
          </h2>
          {activeTab === "release" && selectedReleaseIds.length > 0 && (
            <Button
              size="sm"
              variant={bulkModuleSelect ? "primary" : "secondary"}
              onClick={() => {
                setBulkModuleSelect((v) => !v);
                setSelectedModules([]);
              }}
            >
              {bulkModuleSelect ? "Cancel Bulk" : "Bulk Select"}
            </Button>
          )}
        </div>
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
            {effectiveModules.map((module: any) => {
              const moduleTestCases = effectiveTestCases.filter(
                (tc: any) => tc.module === module.name
              );
              const isSelected = bulkModuleSelect
                ? selectedModules.includes(module.name)
                : selectedModule === module.name;
              return (
                <Button
                  key={module.id}
                  variant={isSelected ? "primary" : "secondary"}
                  onClick={() => {
                    if (bulkModuleSelect) {
                      setSelectedModules((prev) =>
                        prev.includes(module.name)
                          ? prev.filter((m) => m !== module.name)
                          : [...prev, module.name]
                      );
                    } else {
                      setSelectedModule(module.name);
                      setSelectedSubmodule("");
                      setSelectedTestCases([]);
                    }
                  }}
                  className={`whitespace-nowrap m-2 ${isSelected ? " ring-2 ring-blue-400 border-blue-500" : ""
                    }`}
                >
                  {module.name}
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
  );

  const SubmoduleSelectionPanel = () => {
    const submodules =
      selectedModule
        ? (effectiveModules && effectiveModules.find((m: any) => m.name === selectedModule)?.submodules || [])
        : [];
    return (
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold text-gray-900">
              Submodule Selection
            </h2>
            {activeTab === "release" && selectedReleaseIds.length > 0 && (
              <Button
                size="sm"
                variant={bulkSubmoduleSelect ? "primary" : "secondary"}
                onClick={() => {
                  setBulkSubmoduleSelect((v) => !v);
                  setSelectedSubmodules([]);
                }}
              >
                {bulkSubmoduleSelect ? "Cancel Bulk" : "Bulk Select"}
              </Button>
            )}
          </div>
          <div className="relative flex items-center">
            <button
              onClick={() => {
                const container = document.getElementById("submodule-scroll");
                if (container) container.scrollLeft -= 200;
              }}
              className="flex-shrink-0 z-10 bg-white shadow-md rounded-full p-1 hover:bg-gray-50 mr-2"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div
              id="submodule-scroll"
              className="flex space-x-2 overflow-x-auto pb-2 scroll-smooth flex-1"
              style={{
                scrollbarWidth: "none",
                msOverflowStyle: "none",
                maxWidth: "100%",
              }}
            >
              {submodules.map((submodule: any) => {
                const isSelected = bulkSubmoduleSelect
                  ? selectedSubmodules.includes(submodule.name)
                  : selectedSubmodule === submodule.name;
                return (
                  <Button
                    key={submodule.id}
                    variant={isSelected ? "primary" : "secondary"}
                    onClick={() => {
                      if (bulkSubmoduleSelect) {
                        setSelectedSubmodules((prev) =>
                          prev.includes(submodule.name)
                            ? prev.filter((s) => s !== submodule.name)
                            : [...prev, submodule.name]
                        );
                      } else {
                        setSelectedSubmodule(submodule.name);
                        setSelectedTestCases([]);
                      }
                    }}
                    className={`whitespace-nowrap m-2 ${isSelected ? " ring-2 ring-blue-400 border-blue-500" : ""
                      }`}
                  >
                    {submodule.name}
                  </Button>
                );
              })}
            </div>
            <button
              onClick={() => {
                const container = document.getElementById("submodule-scroll");
                if (container) container.scrollLeft += 200;
              }}
              className="flex-shrink-0 z-10 bg-white shadow-md rounded-full p-1 hover:bg-gray-50 ml-2"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Severity color helper
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

  // Selection logic
  const handleSelectAll = (checked: boolean) => {
    if (activeTab === "qa") {
      if (!selectedReleaseForQA) return;
      if (checked) {
        setSelectedTestCasesForQA(prev => ({
          ...prev,
          [selectedReleaseForQA]: filteredTestCases.map((tc: any) => tc.id)
        }));
      } else {
        setSelectedTestCasesForQA(prev => ({
          ...prev,
          [selectedReleaseForQA]: []
        }));
      }
    } else {
      if (checked) {
        setSelectedTestCases(filteredTestCases.map((tc: any) => tc.id));
      } else {
        setSelectedTestCases([]);
      }
    }
  };
  
  const handleSelectTestCase = (testCaseId: string, checked: boolean) => {
    if (activeTab === "qa") {
      if (!selectedReleaseForQA) return;
      if (checked) {
        setSelectedTestCasesForQA(prev => ({
          ...prev,
          [selectedReleaseForQA]: [...(prev[selectedReleaseForQA] || []), testCaseId]
        }));
      } else {
        setSelectedTestCasesForQA(prev => ({
          ...prev,
          [selectedReleaseForQA]: (prev[selectedReleaseForQA] || []).filter((id) => id !== testCaseId)
        }));
      }
    } else {
      if (checked) {
        setSelectedTestCases([...selectedTestCases, testCaseId]);
      } else {
        setSelectedTestCases(selectedTestCases.filter((id) => id !== testCaseId));
      }
    }
  };

  // Table with all columns and actions
  const TestCaseTable = () => (
    <Card>
      <CardContent className="p-0">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr className="border-b border-gray-200">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <input
                  type="checkbox"
                  checked={
                    activeTab === "qa" 
                      ? (selectedReleaseForQA ? ((selectedTestCasesForQA[selectedReleaseForQA]?.length ?? 0) === filteredTestCases.length && filteredTestCases.length > 0) : false)
                      : selectedTestCases.length === filteredTestCases.length && filteredTestCases.length > 0
                  }
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
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
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredTestCases.map((tc: any) => (
              <tr key={tc.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={
                      activeTab === "qa" 
                        ? (selectedReleaseForQA ? (selectedTestCasesForQA[selectedReleaseForQA]?.includes(tc.id) ?? false) : false)
                        : selectedTestCases.includes(tc.id)
                    }
                    onChange={(e) =>
                      handleSelectTestCase(tc.id, e.target.checked)
                    }
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {tc.id}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {tc.description}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  <button
                    onClick={() => {
                      setViewingTestCase(tc);
                      setIsViewStepsModalOpen(true);
                    }}
                    className="text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                    title="View Steps"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View</span>
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {tc.type}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(
                      tc.severity
                    )}`}
                  >
                    {tc.severity}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setViewingTestCase(tc);
                        setIsViewTestCaseModalOpen(true);
                      }}
                      className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                      title="View"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        /* handleEdit(tc) */
                      }}
                      className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        /* handleDelete(tc.id) */
                      }}
                      className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );

  // Only show releases that were selected in the Release Allocation tab
  const releasesForQAAllocation = effectiveProjectRelease.filter(
    (release: any) => selectedReleaseIds.includes(release.id || release.releaseId)
  );

  // --- QA Allocation Panel ---
  const QASelectionPanel = () => {
    // Only one release can be selected for QA allocation at a time
    let allocatedRelease: any = null;
    if (selectedReleaseForQA) {
      allocatedRelease = effectiveProjectRelease && effectiveProjectRelease.find((release: any) => 
        (release.releaseId || release.id) === selectedReleaseForQA
      );
    }

    // Get all QA engineers
    const effectiveQAEngineers = mockQA.map(qa => ({
      id: qa.id,
      firstName: qa.name.split(' ')[0],
      lastName: qa.name.split(' ').slice(1).join(' '),
      designation: qa.role,
      email: qa.email,
      department: qa.department,
      status: qa.status
    }));

    // State for summary modal
    const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);

    return (
      <div className="space-y-6">
        {/* Step 1: Release Selection */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                1
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Select Release for QA Allocation</h3>
            </div>
            <div className="flex space-x-2 overflow-x-auto">
              {releasesForQAAllocation.map((release: any) => {
                const releaseId = release.releaseId || release.id;
                const isSelected = selectedReleaseForQA === releaseId;
                return (
                  <div
                    key={releaseId}
                    className={`min-w-[160px] px-4 py-2 rounded-md border text-left transition-all duration-200 focus:outline-none text-sm font-medium shadow-sm flex flex-col items-start relative bg-white
                      ${
                        isSelected
                          ? "border-blue-500 hover:border-blue-500 hover:bg-blue-50 hover:shadow-md hover:ring-1 hover:ring-blue-300"
                          : "border-gray-200 hover:border-blue-500 hover:bg-blue-50 hover:shadow-md hover:ring-1 hover:ring-blue-300"
                      }`}
                    style={{
                      boxShadow: isSelected ? "0 0 0 2px #3b82f6" : undefined,
                    }}
                  >
                    <div className="truncate font-semibold mb-1">{release.releaseName || release.name}</div>
                    <div className="text-xs text-gray-500 mb-2">Version: {release.version}</div>
                    <Button
                      size="sm"
                      variant={isSelected ? "primary" : "secondary"}
                      className="w-full"
                      onClick={() => {
                        if (isSelected) {
                          setSelectedReleaseForQA(null);
                          setQaAllocations({});
                        } else {
                          setSelectedReleaseForQA(releaseId);
                        }
                      }}
                    >
                      {isSelected ? "Allocated" : "Select for QA"}
                    </Button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Step 2: Allocate New Test Cases (only show if release is selected) */}
        {selectedReleaseForQA && (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-semibold">
                    2
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Allocate New Test Cases</h3>
                </div>
                {/* Summary Button */}
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsSummaryModalOpen(true)}
                  className="flex items-center space-x-2"
                >
                  <Eye className="w-4 h-4" />
                  <span>View Summary</span>
                </Button>
              </div>
              
              {/* Release Info */}
              {allocatedRelease && (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-sm font-medium text-blue-900 mb-1">
                    Selected Release:
                  </div>
                  <div className="text-lg font-semibold text-blue-700 mb-1">
                    {allocatedRelease.releaseName || allocatedRelease.name} (v{allocatedRelease.version})
                  </div>
                  <div className="text-sm text-blue-600">
                    {qaAllocatedTestCases[selectedReleaseForQA].length} test cases available for allocation
                  </div>
                </div>
              )}

              {/* QA Selection */}
              <div className="mb-6">
                <h4 className="text-md font-semibold text-gray-800 mb-3">Select QA Engineer:</h4>
                <div className="flex flex-wrap gap-3">
                  {effectiveQAEngineers.map((emp: any) => (
                    <Button
                      key={emp.id}
                      variant={selectedQA === emp.id ? "primary" : "secondary"}
                      onClick={() => setSelectedQA(emp.id)}
                      className="min-w-[120px]"
                    >
                      {emp.firstName} {emp.lastName}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Allocation Action */}
              {selectedQA && selectedReleaseForQA && (selectedTestCasesForQA[selectedReleaseForQA]?.length ?? 0) > 0 && (
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="text-sm font-medium text-green-900 mb-3">
                    Ready to allocate {selectedTestCasesForQA[selectedReleaseForQA]?.length ?? 0} test case(s) to{' '}
                    <span className="font-semibold">
                      {effectiveQAEngineers && effectiveQAEngineers.find((emp: any) => emp.id === selectedQA)?.firstName} {effectiveQAEngineers.find((emp: any) => emp.id === selectedQA)?.lastName}
                    </span>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        if (selectedReleaseForQA) {
                          allocateTestCasesToQA(selectedQA, selectedTestCasesForQA[selectedReleaseForQA] || []);
                        }
                      }}
                    >
                      Confirm Allocation
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setSelectedTestCasesForQA(prev => ({
                        ...prev,
                        [selectedReleaseForQA!]: []
                      }))}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step 3: Overall Progress (only show if all test cases are allocated) */}
        {selectedReleaseForQA && Object.values(qaAllocations[selectedReleaseForQA] || {}).flat().length === qaAllocatedTestCases[selectedReleaseForQA].length && (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-semibold">
                  ✓
                </div>
                <h3 className="text-lg font-semibold text-green-900">Allocation Complete!</h3>
              </div>
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="text-sm font-medium text-green-900 mb-2">
                  All test cases have been allocated successfully!
                </div>
                <div className="text-sm text-green-700 mb-4">
                  {Object.values(qaAllocations[selectedReleaseForQA] || {}).flat().length} of {qaAllocatedTestCases[selectedReleaseForQA].length} test cases allocated
                </div>
                <Button
                  variant="primary"
                  onClick={() => {
                    const currentProjectId = selectedProject || projectId;
                    if (!currentProjectId) return;
                    // Save mock modules to localStorage for TestExecution page
                    localStorage.setItem("mockModules", JSON.stringify(effectiveModules));
                    navigate(`/projects/${currentProjectId}/releases/test-execution`);
                  }}
                >
                  Proceed to Test Execution
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Summary Modal */}
        <Modal
          isOpen={isSummaryModalOpen}
          onClose={() => setIsSummaryModalOpen(false)}
          title="QA Allocation Summary"
          size="xl"
        >
          <div className="space-y-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="text-2xl font-bold text-blue-600">
                  {Object.values(qaAllocations[selectedReleaseForQA || ''] || {}).flat().length}
                </div>
                <div className="text-sm text-blue-700">Total Allocated</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="text-2xl font-bold text-green-600">
                  {Object.keys(qaAllocations[selectedReleaseForQA || ''] || {}).length}
                </div>
                <div className="text-sm text-green-700">QA Engineers</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <div className="text-2xl font-bold text-purple-600">
                  {qaAllocatedTestCases[selectedReleaseForQA || '']?.length - Object.values(qaAllocations[selectedReleaseForQA || ''] || {}).flat().length || 0}
                </div>
                <div className="text-sm text-purple-700">Remaining</div>
              </div>
            </div>

            {/* QA Engineers List */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-800">QA Engineers & Their Assignments</h4>
              {loadingQAAllocations ? (
                <div className="text-center py-8">
                  <div className="text-sm text-gray-500">Loading existing QA allocations...</div>
                </div>
              ) : (
                <div className="space-y-4">
                  {effectiveQAEngineers.map((qa) => {
                    const allocatedTestCases = getAllocatedTestCasesForQA(qa.id);
                    return (
                      <div key={qa.id} className="border rounded-lg p-4 bg-gray-50">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                              {qa.firstName.charAt(0)}{qa.lastName.charAt(0)}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">
                                {qa.firstName} {qa.lastName}
                              </div>
                              <div className="text-xs text-gray-500">{qa.designation}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-blue-600">
                              {allocatedTestCases.length}
                            </div>
                            <div className="text-xs text-gray-500">test cases</div>
                          </div>
                        </div>
                        {allocatedTestCases.length > 0 && (
                          <div className="space-y-2">
                            <div className="text-xs font-medium text-gray-600 mb-2 flex items-center">
                              <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                              Assigned Test Cases:
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {allocatedTestCases.map((tcId) => {
                                const testCase = effectiveTestCases && effectiveTestCases.find((tc: any) => tc.id === tcId);
                                return (
                                  <div key={tcId} className="flex items-center justify-between text-xs bg-white p-2 rounded border">
                                    <span className="truncate font-mono text-gray-700">{testCase?.id || tcId}</span>
                                    <button
                                      onClick={() => removeAllocationFromQA(qa.id, tcId)}
                                      className="text-red-500 hover:text-red-700 ml-2 p-1 hover:bg-red-50 rounded transition-colors"
                                      title="Remove allocation"
                                    >
                                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                      </svg>
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-4">
              <Button
                variant="secondary"
                onClick={() => setIsSummaryModalOpen(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    );
  };

  useEffect(() => {
    if (activeTab === "release" && selectedReleaseIds.length === 1) {
      setLoadingRelease(true);
      setReleaseError(null);
      axios
        .get(`${BASE_URL}releases/releaseId/${selectedReleaseIds[0]}`)
        .then((res) => setApiRelease(res.data))
        .catch((err) => setReleaseError(err.message))
        .finally(() => setLoadingRelease(false));
    } else {
      setApiRelease(null);
    }
  }, [activeTab, selectedReleaseIds]);

  // Save mock test cases and mock QA to localStorage on mount (for cross-page use)
  useEffect(() => {
    localStorage.setItem('mockTestCases', JSON.stringify(mockTestCases));
    localStorage.setItem('mockQA', JSON.stringify(mockQA));
  }, []);

  // Save allocations to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('qaAllocatedTestCases', JSON.stringify(qaAllocatedTestCases));
  }, [qaAllocatedTestCases]);

  // Save QA allocations to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('qaAllocations', JSON.stringify(qaAllocations));
  }, [qaAllocations]);

  return (
    <div className="max-w-5xl mx-auto py-8">
      {/* Back Button at the top right */}
      <div className="mb-4 flex justify-end">
        <Button
          variant="secondary"
          onClick={() => navigate(`/projects/${projectId}/releases`)}
          className="flex items-center"
        >
          <ChevronLeft className="w-5 h-5 mr-2" /> Back
        </Button>
      </div>
      {ProjectSelectionPanel()}
      {/* Show release details if a single release is selected */}
      {activeTab === "release" && selectedReleaseIds.length === 1 && (
        <div className="mb-4">
          {loadingRelease && (
            <div className="p-4 text-center text-blue-600">
              Loading release details...
            </div>
          )}
          {releaseError && (
            <div className="p-4 text-center text-red-600">{releaseError}</div>
          )}
          {apiRelease && (
            <Card className="mb-4">
              <CardContent>
                <div className="font-bold text-lg mb-1">{apiRelease.name}</div>
                <div className="mb-1">Version: {apiRelease.version}</div>
                <div className="mb-1">Description: {apiRelease.description}</div>
                <div className="mb-1">
                  Release Date:{" "}
                  {apiRelease.releaseDate
                    ? new Date(apiRelease.releaseDate).toLocaleDateString()
                    : "TBD"}
                </div>
                <div className="mb-1">Type: {apiRelease.releaseType}</div>
                {/* Add more fields as needed */}
              </CardContent>
            </Card>
          )}
        </div>
      )}
      {/* Tabs */}
      <div className="flex space-x-4 mb-6 border-b border-gray-200">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={`px-4 py-2 font-medium border-b-2 transition-colors duration-200 ${activeTab === tab.key
              ? "border-blue-500 text-blue-700"
              : "border-transparent text-gray-500 hover:text-blue-700"
              }`}
            onClick={() => setActiveTab(tab.key as "release" | "qa")}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {/* Tab Content */}
      {activeTab === "release" ? (
        <>
          <ReleaseCardsPanel />
          {ModuleSelectionPanel()}
          {SubmoduleSelectionPanel()}
          <TestCaseTable />
        </>
      ) : (
        <>
          <QASelectionPanel />
          {ModuleSelectionPanel()}
          {SubmoduleSelectionPanel()}
          <TestCaseTable />
        </>
      )}
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
                <h3 className="text-sm font-medium text-gray-500">Severity</h3>
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
        <QuickAddTestCase selectedProjectId={projectId || ""} />
        <QuickAddDefect />
      </div>
    </div>
  );
};
