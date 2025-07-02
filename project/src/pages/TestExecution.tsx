import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { ChevronLeft, Eye, ChevronRight, Play, FileText, Calendar } from "lucide-react";
import { useApp } from "../context/AppContext";
import { Modal } from "../components/ui/Modal";
import { nanoid } from "nanoid";
import { Input } from "../components/ui/Input";
import QuickAddTestCase from "./QuickAddTestCase";
import QuickAddDefect from "./QuickAddDefect";
import { ProjectSelector } from "../components/ui/ProjectSelector";
import { ModuleSelector } from "../components/ui/ModuleSelector";
import { SubmoduleSelector } from "../components/ui/SubmoduleSelector";
import { projectReleaseCardView } from "../api/releaseView/ProjectReleaseCardView";

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
  executionStatus?:
  | "not-started"
  | "in-progress"
  | "passed"
  | "failed"
  | "blocked";
  assignee?: string;
}

// Add mockQA if not already present
const mockQA: any[] = [
  // ... (copy from allocation.tsx, or keep minimal for fallback)
];

// --- MOCK DATA SECTION (copied from allocation.tsx) ---
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
];

// --- MOCK TEST CASES SECTION (copied from allocation.tsx) ---
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
];

// --- MOCK DATA SECTION (copied from allocation.tsx) ---
const mockReleases = (() => {
  // Try to get mockReleases from localStorage (set by allocation.tsx)
  try {
    const stored = localStorage.getItem('mockReleases');
    if (stored) return JSON.parse(stored);
  } catch (e) {}
  // Fallback to hardcoded mockReleases if not in localStorage
  return [
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
})();

// Helper: Use mock data if API/server is not working
function useMockOrApiData(apiData: any, mockData: any): any {
  if (!apiData || (Array.isArray(apiData) && apiData.length === 0)) {
    return mockData;
  }
  return apiData;
}

export const TestExecution: React.FC = () => {
  const { projectId, releaseId } = useParams();
  const navigate = useNavigate();
  const {
    projects,
    releases,
    testCases,
    setSelectedProjectId,
    addDefect,
    testCaseDefectMap,
    setTestCaseDefectMap,
    defects,
    modulesByProject,
  } = useApp();
  const [selectedProject, setSelectedProject] = useState<string | null>(
    projectId || null
  );
  const [selectedRelease, setSelectedRelease] = useState<string | null>(
    releaseId || null
  );
  const [selectedModule, setSelectedModule] = useState("");
  const [selectedSubmodule, setSelectedSubmodule] = useState("");
  const [isViewStepsModalOpen, setIsViewStepsModalOpen] = useState(false);
  const [isViewTestCaseModalOpen, setIsViewTestCaseModalOpen] = useState(false);
  const [viewingTestCase, setViewingTestCase] = useState<TestCase | null>(null);
  const [executionStatuses, setExecutionStatuses] = useState<{
    [key: string]: TestCase["executionStatus"];
  }>({});
  const [activeReleaseId, setActiveReleaseId] = useState<string | null>(null);
  const [defectModalOpen, setDefectModalOpen] = useState<string | null>(null);
  const [defectFormData, setDefectFormData] = useState({
    title: "",
    description: "",
    module: "",
    subModule: "",
    type: "bug",
    priority: "medium",
    severity: "medium",
    status: "open",
    projectId: projectId || "",
    releaseId: releaseId || "",
    testCaseId: "",
    assignedTo: "",
    reportedBy: "",
    rejectionComment: "",
  });
  const [releaseLoading, setReleaseLoading] = useState(false);
  const [releaseError, setReleaseError] = useState("");
  const [projectReleaseCard, setProjectReleaseCard] = useState<any[]>([]);

  // Read allocations from localStorage (as set by allocation.tsx)
  const allocatedTestCasesMap = JSON.parse(localStorage.getItem('qaAllocatedTestCases') || '{}');
  const qaAllocationsMap = JSON.parse(localStorage.getItem('qaAllocations') || '{}');

  // Helper to get assigned QA for a test case in the selected release
  function getAssignedQAForRelease(testCaseId: string) {
    const allocations = qaAllocationsMap[selectedRelease || ''] || {};
    for (const [qaId, ids] of Object.entries(allocations)) {
      if ((ids as string[]).includes(testCaseId)) {
        // Find the QA name from the QA ID
        const qa = effectiveQA.find((q: any) => q.id === qaId);
        return qa ? qa.name : qaId;
      }
    }
    return null;
  }

  // Use mock data if modulesByProject or testCases are empty
  const safeProjectId = selectedProject || projectId || "";

  // Read mockModules from localStorage (set by allocation.tsx) or fallback to hardcoded mockModules
  let storedMockModules: any = null;
  try {
    const stored = localStorage.getItem('mockModules');
    if (stored) storedMockModules = JSON.parse(stored);
  } catch (e) {}
  const fallbackMockModules: any[] = [
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
  ];
  const mockModules: any[] = storedMockModules || fallbackMockModules;

  // Get submodules for selected module
  const selectedModuleObj = mockModules.find((m: any) => m.name === selectedModule);
  const submodules = selectedModuleObj ? selectedModuleObj.submodules || [] : [];

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

  // Update testCaseIdToQA to use effectiveQA for QA name mapping
  const testCaseIdToQA: Record<string, string> = {};
  if (qaAllocationsMap && Array.isArray(qaAllocationsMap.allocations)) {
    qaAllocationsMap.allocations.forEach((alloc: any) => {
      alloc.testCaseIds.forEach((tcId: string) => {
        const qa = effectiveQA.find((q: any) => q.id === alloc.qaId || q.name === alloc.qaName);
        testCaseIdToQA[tcId] = qa ? qa.name : (alloc.qaName || alloc.qaId);
      });
    });
  }

  const filteredTestCases = effectiveTestCases.filter((tc: any) => {
    if (tc.projectId !== safeProjectId) return false;
    if (allocatedTestCasesMap[selectedRelease || ''] && !allocatedTestCasesMap[selectedRelease || ''].includes(tc.id)) return false;
    if (selectedModule && tc.module !== selectedModule) return false;
    if (selectedSubmodule && tc.subModule !== selectedSubmodule) return false;
    return true;
  });

  useEffect(() => {
    if (selectedProject) {
      setSelectedProjectId(selectedProject);
    }
  }, [selectedProject, setSelectedProjectId]);

  useEffect(() => {
    if (selectedProject) {
      setReleaseLoading(true);
      setReleaseError("");
      projectReleaseCardView(selectedProject)
        .then((res) => {
          if (res.status === "success" || res.statusCode === "2000") {
            console.log("Releases loaded from API:", res.data || []);
            setProjectReleaseCard(res.data || []);
          } else {
            console.log("API returned no releases, using mock data");
            setReleaseError(res.message || "No releases found");
          }
        })
        .catch((err) => {
          // API failed, but mock data fallback will work
          console.log("API unavailable, using mock data fallback");
          // Don't set error since fallback is working
        })
        .finally(() => setReleaseLoading(false));
    }
  }, [selectedProject]);
  console.log("Project Releases:", projectReleaseCard);
  

  // Filter releases for selected project (API or mock fallback)
  const safeReleases = Array.isArray(releases) ? releases : [];
  const projectReleases = (safeReleases.length > 0
    ? safeReleases
    : mockReleases
  ).filter((r: any) => r.projectId === selectedProject);

  // DEBUG LOGGING to diagnose why no release cards are shown
  console.log({ selectedProject, projectReleases, releases, mockReleases });

  // Handle project selection
  const handleProjectSelect = (projectId: string) => {
    setSelectedProject(projectId);
    setSelectedRelease(null);
    setSelectedModule("");
    setSelectedSubmodule("");
  };

  // Handle release selection
  const handleReleaseSelect = (releaseId: string) => {
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

  // Handle execution status change
  const handleExecutionStatusChange = (
    testCaseId: string,
    status: TestCase["executionStatus"]
  ) => {
    setExecutionStatuses((prev) => ({
      ...prev,
      [testCaseId]: status,
    }));
  };

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

  const getExecutionStatusColor = (status: TestCase["executionStatus"]) => {
    switch (status) {
      case "passed":
        return "bg-green-100 text-green-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "in-progress":
        return "bg-blue-100 text-blue-800";
      case "blocked":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleViewSteps = (testCase: TestCase) => {
    setViewingTestCase(testCase);
    setIsViewStepsModalOpen(true);
  };

  const handleViewTestCase = (testCase: TestCase) => {
    setViewingTestCase(testCase);
    setIsViewTestCaseModalOpen(true);
  };

  // Add getNextDefectId function (copied from Defects.tsx)
  const getNextDefectId = () => {
    const projectDefects = defects.filter(
      (d) => d.projectId === selectedProject
    );
    const ids = projectDefects
      .map((d) => d.id)
      .map((id) => parseInt(id.replace("DEF-", "")))
      .filter((n) => !isNaN(n));
    const nextNum = ids.length > 0 ? Math.max(...ids) + 1 : 1;
    return `DEF-${nextNum.toString().padStart(4, "0")}`;
  };

  // Handler for input changes
  const handleDefectInputChange = (field: string, value: string) => {
    setDefectFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Handler for submitting the defect form
  const handleDefectFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newDefect = {
      ...defectFormData,
      type: defectFormData.type as "bug" | "test-failure" | "enhancement",
      priority: defectFormData.priority as
        | "low"
        | "medium"
        | "high"
        | "critical",
      severity: defectFormData.severity as
        | "low"
        | "medium"
        | "high"
        | "critical",
      status: defectFormData.status as
        | "open"
        | "in-progress"
        | "resolved"
        | "closed"
        | "rejected",
      id: getNextDefectId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    addDefect(newDefect);
    setTestCaseDefectMap((prev) => ({
      ...prev,
      [defectFormData.testCaseId]: newDefect.id,
    }));
    setDefectModalOpen(null);
  };

  // Handler for opening defect modal with prefilled data
  const handleFailClick = (testCase: TestCase) => {
    // Map test case type to defect type
    const mapTestCaseTypeToDefectType = (testCaseType: string) => {
      switch (testCaseType) {
        case "functional":
          return "functional-bug";
        case "regression":
          return "functional-bug";
        case "smoke":
          return "functional-bug";
        case "integration":
          return "functional-bug";
        default:
          return "bug";
      }
    };

    setDefectFormData({
      title: testCase.description,
      description: testCase.steps,
      module: testCase.module,
      subModule: testCase.subModule,
      type: mapTestCaseTypeToDefectType(testCase.type),
      priority: "medium",
      severity: testCase.severity || "medium",
      status: "open",
      projectId: selectedProject || "",
      releaseId: selectedRelease || "",
      testCaseId: testCase.id,
      assignedTo: "",
      reportedBy: "",
      rejectionComment: "",
    });
    setDefectModalOpen(testCase.id);
  };

  // If we're in detailed execution view (release selected)
  if (selectedRelease) {
    const currentRelease = releases.find((r) => r.id === selectedRelease);
    const currentProject = projects.find((p) => p.id === selectedProject);

    // Only show test cases allocated to this release, with module/submodule filtering
    const allocatedIds = allocatedTestCasesMap[selectedRelease || ''] || [];
    let allocatedTestCases = effectiveTestCases.filter((tc: any) => allocatedIds.includes(tc.id));
    // If a module is selected, filter to that module
    if (selectedModule) {
      allocatedTestCases = allocatedTestCases.filter((tc: any) => tc.module === selectedModule);
    }
    // If a submodule is selected, filter to that submodule (must also match selected module)
    if (selectedSubmodule) {
      allocatedTestCases = allocatedTestCases.filter((tc: any) => tc.subModule === selectedSubmodule && (!selectedModule || tc.module === selectedModule));
    }

    return (
      <div className="max-w-6xl mx-auto py-8">
        {/* Fixed Header Section */}
        <div className="flex-none p-6 pb-4">
          <div className="flex justify-between items-center mb-4">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-gray-900">
                Test Execution
              </h1>
              <p className="text-sm text-gray-500">
                {currentProject?.name} - {currentRelease?.name}
              </p>
            </div>
            <Button
              variant="secondary"
              onClick={() => setSelectedRelease(null)}
              className="flex items-center space-x-2"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </Button>
          </div>

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
                  {mockModules.map((module) => {
                    const moduleTestCases = allocatedTestCases.filter(
                      (tc: any) => tc.module === module.name
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
                  {mockModules
                    .find((m) => m.name === selectedModule)
                    ?.submodules.map((submodule: any) => {
                      const submoduleTestCases = allocatedTestCases.filter(
                        (tc: any) =>
                          tc.module === selectedModule &&
                          tc.subModule === submodule.name
                      );
                      return (
                        <Button
                          key={submodule.id}
                          variant={
                            selectedSubmodule === submodule.name
                              ? "primary"
                              : "secondary"
                          }
                          onClick={() => handleSubmoduleSelect(submodule.name)}
                          className="whitespace-nowrap m-2"
                        >
                          {submodule.name}
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
                      Assigned To
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Execution Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Defect ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {allocatedTestCases.map((testCase: any) => {
                    const status = executionStatuses[testCase.id] || "not-started";
                    const isFailed = status === "failed";
                    const isPassed = status === "passed";
                    return (
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
                          {getAssignedQAForRelease(testCase.id) || "Unassigned"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex rounded border border-gray-200 bg-white shadow overflow-hidden w-fit">
                            <button
                              type="button"
                              className={`px-3 py-1 text-xs font-semibold focus:outline-none transition-colors duration-200 ${isPassed
                                  ? "bg-green-500 text-white"
                                  : "bg-white text-gray-700 hover:bg-green-100"
                                }`}
                              style={{
                                borderTopLeftRadius: 6,
                                borderBottomLeftRadius: 6,
                              }}
                              onClick={() => {
                                setExecutionStatuses((prev) => ({
                                  ...prev,
                                  [testCase.id]: "passed",
                                }));
                                setDefectModalOpen(null);
                              }}
                              aria-pressed={isPassed}
                            >
                              Pass
                            </button>
                            <button
                              type="button"
                              className={`px-3 py-1 text-xs font-semibold focus:outline-none transition-colors duration-200 ${isFailed
                                  ? "bg-red-500 text-white"
                                  : "bg-white text-gray-700 hover:bg-red-100"
                                }`}
                              style={{
                                borderTopRightRadius: 6,
                                borderBottomRightRadius: 6,
                                borderLeft: "1px solid #e5e7eb",
                              }}
                              onClick={() => {
                                if (!isFailed) {
                                  setExecutionStatuses((prev) => ({
                                    ...prev,
                                    [testCase.id]: "failed",
                                  }));
                                  handleFailClick(testCase);
                                } else {
                                  handleFailClick(testCase);
                                }
                              }}
                              aria-pressed={isFailed}
                            >
                              Fail
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {isFailed && testCaseDefectMap[testCase.id] ? (
                            <button
                              className="px-2 py-1 rounded bg-blue-100 text-blue-800 font-semibold hover:bg-blue-200 transition"
                              onClick={() =>
                                navigate(
                                  `/projects/${selectedProject}/defects?highlight=${testCaseDefectMap[testCase.id]
                                  }`
                                )
                              }
                              title="View Defect"
                            >
                              {testCaseDefectMap[testCase.id]}
                            </button>
                          ) : (
                            ""
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <button
                            onClick={() => handleViewTestCase(testCase)}
                            className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
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
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Execution Status
                  </h3>
                  <select
                    value={
                      executionStatuses[viewingTestCase.id] || "not-started"
                    }
                    onChange={(e) =>
                      handleExecutionStatusChange(
                        viewingTestCase.id,
                        e.target.value as TestCase["executionStatus"]
                      )
                    }
                    className={`mt-1 px-2 py-1 rounded-full text-xs font-medium border-0 focus:ring-2 focus:ring-blue-500 ${getExecutionStatusColor(
                      executionStatuses[viewingTestCase.id] || "not-started"
                    )}`}
                  >
                    <option value="not-started">Not Started</option>
                    <option value="in-progress">In Progress</option>
                    <option value="passed">Passed</option>
                    <option value="failed">Failed</option>
                    <option value="blocked">Blocked</option>
                  </select>
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

        {/* Defect Entry Modal */}
        <Modal
          isOpen={!!defectModalOpen}
          onClose={() => setDefectModalOpen(null)}
          title="Add New Defect"
          size="lg"
        >
          <form onSubmit={handleDefectFormSubmit} className="space-y-4">
            <Input
              label="Brief Description"
              value={defectFormData.title}
              onChange={(e) => handleDefectInputChange("title", e.target.value)}
              required
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Steps
              </label>
              <textarea
                value={defectFormData.description}
                onChange={(e) =>
                  handleDefectInputChange("description", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Modules
                </label>
                <input
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  value={defectFormData.module}
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Submodules
                </label>
                <input
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  value={defectFormData.subModule}
                  disabled
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Severity
                </label>
                <input
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
                  value={defectFormData.severity}
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  value={defectFormData.priority}
                  onChange={(e) =>
                    handleDefectInputChange("priority", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select priority</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Types
                </label>
                <select
                  value={defectFormData.type}
                  onChange={(e) =>
                    handleDefectInputChange("type", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select type</option>
                  <option value="ui-issue">UI Issue</option>
                  <option value="functional-bug">Functional Bug</option>
                  <option value="performance-issue">Performance Issue</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={defectFormData.status}
                  onChange={(e) =>
                    handleDefectInputChange("status", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select status</option>
                  <option value="open">Open</option>
                  <option value="in-progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
            {defectFormData.status === "rejected" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rejection Comment
                </label>
                <Input
                  value={defectFormData.rejectionComment}
                  onChange={(e) =>
                    handleDefectInputChange("rejectionComment", e.target.value)
                  }
                  placeholder="Enter reason for rejection"
                  required={defectFormData.status === "rejected"}
                />
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Assigned To"
                value={defectFormData.assignedTo}
                onChange={(e) =>
                  handleDefectInputChange("assignedTo", e.target.value)
                }
                required
              />
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setDefectModalOpen(null)}
              >
                Cancel
              </Button>
              <Button type="submit">Save Defect</Button>
            </div>
          </form>
        </Modal>
      </div>
    );
  }

  // Main Test Execution page (project selection and release cards)
  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Test Execution</h1>
      {/* Project Selection Panel */}
      <ProjectSelector
        projects={projects}
        selectedProjectId={selectedProject}
        onSelect={handleProjectSelect}
        className="mb-6"
      />
      {/* Release Cards Panel */}
      {releaseLoading && (
        <div className="text-center text-gray-500 mb-4">Loading releases...</div>
      )}
      {releaseError && (
        <div className="text-center text-red-500 mb-4">{releaseError}</div>
      )}
      {selectedProject && !releaseLoading && !releaseError && (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Releases for Project
            </h2>
          </div>
          {projectReleaseCard.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-gray-500">
                  No releases found for the selected project.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projectReleaseCard.map((release: any) => {
                const releaseTestCases = effectiveTestCases.filter(
                  (tc: any) =>
                    tc.projectId === selectedProject &&
                    tc.releaseId === (release.releaseId)
                );
                const totalTestCases = releaseTestCases.length;
                const currentProject = projects.find(
                  (p: any) => p.id === selectedProject
                );
                const isActive = activeReleaseId === ( release.releaseId);
                return (
                <Card
                  key={ release.releaseId}
                  hover
                  className={`group transition-all duration-300 hover:shadow-lg hover:scale-[1.02] ${
                    isActive 
                      ? 'cursor-pointer border-blue-500 ring-2 ring-blue-300' 
                      : 'cursor-default border-gray-200'
                  }`}
                  onClick={() => {
                    // Only allow navigation if the card is active
                    if (isActive) {
                      handleReleaseSelect(release.id || release.releaseId);
                    }
                  }}
                >
                  <CardContent className="p-6">
                      {/* Header */}
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        { release.releaseName}
                      </h3>
                      <p className="text-sm text-gray-500">
                          v{ release.releaseId}
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
                            ? new Date(release.releaseDate).toLocaleDateString()
                            : "TBD"}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Project Info */}
                      {currentProject && (
                        <div className="pt-4 border-t border-gray-200">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-gray-500">
                                Project: {currentProject.name}
                        </span>
                      </div>
                          </div>
                        </div>
                      )}

                      {/* Active/Hold Toggle */}
                      <div className="flex gap-2 mt-4">
                        <button
                          type="button"
                          className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors duration-150 ${
                            isActive 
                              ? 'bg-blue-100 text-blue-700 border-blue-400' 
                              : 'bg-white text-gray-500 border-gray-300 hover:bg-blue-50'
                          }`}
                          onClick={e => {
                            e.stopPropagation();
                            // Set this release as active (only one can be active at a time)
                            setActiveReleaseId(release.id || release.releaseId);
                          }}
                        >
                          Active
                        </button>
                        <button
                          type="button"
                          className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors duration-150 ${
                            !isActive 
                              ? 'bg-red-100 text-red-700 border-red-400' 
                              : 'bg-white text-gray-500 border-gray-300 hover:bg-red-50'
                          }`}
                          onClick={e => {
                            e.stopPropagation();
                            // If this card is currently active, deactivate it
                            if (isActive) {
                              setActiveReleaseId(null);
                            }
                          }}
                        >
                          Hold
                        </button>
                    </div>

                    {/* Status indicator */}
                    {isActive && (
                      <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                          <span className="text-xs font-medium text-blue-700">
                            Active - Click to enter test execution
                          </span>
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
    </div>
  );
};
