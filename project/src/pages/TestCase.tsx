import React, { useState, useEffect, useMemo } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Eye,
  CheckSquare,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Upload,
} from "lucide-react";
import { Card, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Modal } from "../components/ui/Modal";
import { useApp } from "../context/AppContext";
import { Badge } from "../components/ui/Badge";
import { useParams, useNavigate } from "react-router-dom";
import QuickAddTestCase from "./QuickAddTestCase";
import QuickAddDefect from "./QuickAddDefect";
import * as XLSX from "xlsx";
import { TestCase as TestCaseType } from "../types/index";

// Define interfaces for our data types
interface Module {
  id: string;
  name: string;
  submodules: string[];
}

// Mock data for modules and submodules
export const mockModules: { [key: string]: Module[] } = {
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

export const TestCase: React.FC = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const {
    projects,
    testCases = [],
    addTestCase,
    updateTestCase,
    deleteTestCase,
    releases,
    setSelectedProjectId,
  } = useApp();
  const [selectedModule, setSelectedModule] = useState("");
  const [selectedSubmodule, setSelectedSubmodule] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewStepsModalOpen, setIsViewStepsModalOpen] = useState(false);
  const [isViewTestCaseModalOpen, setIsViewTestCaseModalOpen] = useState(false);
  const [selectedTestCases, setSelectedTestCases] = useState<string[]>([]);
  const [viewingTestCase, setViewingTestCase] = useState<TestCaseType | null>(
    null
  );
  const [editingTestCase, setEditingTestCase] = useState<TestCaseType | null>(
    null
  );
  const [formData, setFormData] = useState<Omit<TestCaseType, "id">>({
    module: "",
    subModule: "",
    description: "",
    steps: "",
    type: "functional",
    severity: "medium",
    projectId: "",
  });
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [isDescriptionModalOpen, setIsDescriptionModalOpen] = useState(false);
  const [selectedDescription, setSelectedDescription] = useState("");
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [selectedSubmodules, setSelectedSubmodules] = useState<string[]>([]);
  const [isBulkAddModalOpen, setIsBulkAddModalOpen] = useState(false);
  const [bulkRows, setBulkRows] = useState([
    {
      module: "",
      subModule: "",
      description: "",
      steps: "",
      type: "functional",
      severity: "medium",
    },
  ]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [filterText, setFilterText] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterSeverity, setFilterSeverity] = useState("");

  useEffect(() => {
    if (projectId) {
      setSelectedProjectId(projectId);
    }
  }, [projectId, setSelectedProjectId]);

  // If no projectId, show a message or redirect
  if (!projectId) {
    return (
      <div className="p-8 text-center text-gray-500">
        Please select a project to view its test cases.
      </div>
    );
  }

  // Get modules for selected project
  const projectModules = projectId ? mockModules[projectId] || [] : [];

  // Compute selected test case IDs based on selected modules/submodules
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const selectedTestCaseIds = useMemo(() => {
    let ids: string[] = [];
    if (selectedModules.length > 0) {
      ids = [
        ...new Set(
          testCases
            .filter(
              (tc) =>
                tc.projectId === projectId &&
                selectedModules.includes(tc.module)
            )
            .map((tc) => tc.id)
        ),
      ];
    }
    if (selectedSubmodules.length > 0) {
      ids = [
        ...ids,
        ...new Set(
          testCases
            .filter(
              (tc) =>
                tc.projectId === projectId &&
                selectedSubmodules.includes(tc.subModule)
            )
            .map((tc) => tc.id)
        ),
      ];
    }
    return Array.from(new Set(ids));
  }, [selectedModules, selectedSubmodules, testCases, projectId]);

  // Compute filtered test cases for the table (union of all selected modules/submodules)
  const filteredTestCases = React.useMemo(() => {
    let cases = testCases.filter((tc) => {
      if (!projectId) return false;
      if (tc.projectId !== projectId) return false;
      if (selectedModule && tc.module !== selectedModule) return false;
      if (selectedSubmodule && tc.subModule !== selectedSubmodule) return false;
      return true;
    });
    if (filterText) {
      cases = cases.filter((tc) =>
        tc.description.toLowerCase().includes(filterText.toLowerCase())
      );
    }
    if (filterType) {
      cases = cases.filter((tc) => tc.type === filterType);
    }
    if (filterSeverity) {
      cases = cases.filter((tc) => tc.severity === filterSeverity);
    }
    return cases;
  }, [
    testCases,
    projectId,
    selectedModule,
    selectedSubmodule,
    filterText,
    filterType,
    filterSeverity,
  ]);

  // Handle project selection
  const handleProjectSelect = (projectId: string) => {
    setSelectedProjectId(projectId);
    setSelectedModule("");
    setSelectedSubmodule("");
    setSelectedTestCases([]);
  };

  // Handle module selection
  const handleModuleSelect = (moduleName: string) => {
    setSelectedModule(moduleName);
    setSelectedSubmodule("");
    setSelectedTestCases([]);
  };

  // Handle submodule selection
  const handleSubmoduleSelect = (submoduleName: string) => {
    setSelectedSubmodule(submoduleName);
    setSelectedTestCases([]);
  };

  // When selection changes, update selectedTestCases for bulk actions
  useEffect(() => {
    if (selectedModules.length > 0 || selectedSubmodules.length > 0) {
      setSelectedTestCases(selectedTestCaseIds);
    }
  }, [selectedTestCaseIds, selectedModules, selectedSubmodules]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Generate module and submodule IDs
    const moduleId = formData.module.substring(0, 3).toUpperCase();
    const subModuleId = formData.subModule.substring(0, 3).toUpperCase();
    const timestamp = Date.now().toString().slice(-4);

    if (editingTestCase) {
      updateTestCase({
        ...formData,
        id: editingTestCase.id,
        steps: formData.steps,
      });
    } else {
      addTestCase({
        ...formData,
        id: `TC-${moduleId}-${subModuleId}-${timestamp}`,
        steps: formData.steps,
      });
    }
    resetForm();
  };

  const handleEdit = (testCase: TestCaseType) => {
    setEditingTestCase(testCase);
    setFormData({
      module: testCase.module,
      subModule: testCase.subModule,
      description: testCase.description,
      steps: testCase.steps,
      type: testCase.type,
      severity: testCase.severity,
      projectId: testCase.projectId,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this test case?")) {
      deleteTestCase(id);
    }
  };

  const resetForm = () => {
    setFormData({
      module: "",
      subModule: "",
      description: "",
      steps: "",
      type: "functional",
      severity: "medium",
      projectId: projectId,
    });
    setEditingTestCase(null);
    setIsModalOpen(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleStepChange = (index: number, value: string) => {
    const newSteps = [...formData.steps.split("\n")];
    newSteps[index] = value;
    setFormData((prev) => ({ ...prev, steps: newSteps.join("\n") }));
  };

  const addStep = () => {
    if (formData.steps.split("\n").length < 5) {
      setFormData((prev) => ({
        ...prev,
        steps: [...prev.steps.split("\n"), ""].join("\n"),
      }));
    }
  };

  const removeStep = (index: number) => {
    if (formData.steps.split("\n").length > 1) {
      const newSteps = formData.steps.split("\n").filter((_, i) => i !== index);
      setFormData((prev) => ({ ...prev, steps: newSteps.join("\n") }));
    }
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

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTestCases(filteredTestCases.map((tc: TestCaseType) => tc.id));
    } else {
      setSelectedTestCases([]);
    }
  };

  const handleSelectTestCase = (testCaseId: string, checked: boolean) => {
    if (checked) {
      setSelectedTestCases([...selectedTestCases, testCaseId]);
    } else {
      setSelectedTestCases(selectedTestCases.filter((id) => id !== testCaseId));
    }
  };

  const handleViewSteps = (testCase: TestCaseType) => {
    setViewingTestCase(testCase);
    setIsViewStepsModalOpen(true);
  };

  const handleViewTestCase = (testCase: TestCaseType) => {
    setViewingTestCase(testCase);
    setIsViewTestCaseModalOpen(true);
  };

  const toggleRowExpansion = (testCaseId: string) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(testCaseId)) {
        newSet.delete(testCaseId);
      } else {
        newSet.add(testCaseId);
      }
      return newSet;
    });
  };

  const handleViewDescription = (description: string) => {
    setSelectedDescription(description);
    setIsDescriptionModalOpen(true);
  };

  const handleBulkRowChange = (idx: number, field: string, value: string) => {
    setBulkRows((rows) =>
      rows.map((row, i) => (i === idx ? { ...row, [field]: value } : row))
    );
  };

  const handleAddBulkRow = () => {
    setBulkRows((rows) => [
      {
        module: "",
        subModule: "",
        description: "",
        steps: "",
        type: "functional",
        severity: "medium",
      },
      ...rows,
    ]);
  };

  const handleRemoveBulkRow = (idx: number) => {
    setBulkRows((rows) =>
      rows.length > 1 ? rows.filter((_, i) => i !== idx) : rows
    );
  };

  const handleBulkAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validRows = bulkRows.filter(
      (row) => row.module && row.subModule && row.description && row.steps
    );
    validRows.forEach((tc, idx) => {
      const moduleId = tc.module.substring(0, 3).toUpperCase();
      const subModuleId = tc.subModule.substring(0, 3).toUpperCase();
      const timestamp = (Date.now() + idx).toString().slice(-4);
      addTestCase({
        id: `TC-${moduleId}-${subModuleId}-${timestamp}`,
        module: tc.module,
        subModule: tc.subModule,
        description: tc.description,
        steps: tc.steps,
        type: tc.type as "functional" | "regression" | "smoke" | "integration",
        severity: tc.severity as "low" | "medium" | "high" | "critical",
        projectId: projectId,
      });
    });
    setBulkRows([
      {
        module: "",
        subModule: "",
        description: "",
        steps: "",
        type: "functional",
        severity: "medium",
      },
    ]);
    setIsBulkAddModalOpen(false);
  };

  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = evt.target?.result;
      if (!data) return;
      const workbook = XLSX.read(data, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const json: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      // Expect header row: Module, Submodule, Description, Steps, Type, Severity
      const rows = json
        .slice(1)
        .map((row: any[]) => ({
          module: row[0] || "",
          subModule: row[1] || "",
          description: row[2] || "",
          steps: row[3] || "",
          type: row[4] || "functional",
          severity: row[5] || "medium",
        }))
        .filter(
          (row) => row.module && row.subModule && row.description && row.steps
        );
      if (rows.length > 0) setBulkRows(rows);
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="max-w-6xl mx-auto ">
      {/* Fixed Header Section */}
      <div className="flex-none p-6 pb-4">
        <div className="flex justify-between items-center mb-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-gray-900">Test Cases</h1>
            <p className="text-sm text-gray-500">
              {projectId
                ? `Project: ${projects.find((p) => p.id === projectId)?.name}`
                : "Select a project to begin"}
            </p>
          </div>
        </div>

        {/* Project Selection Panel */}
        <Card>
          <CardContent className="p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              Project Selection
            </h2>
            <div className="relative flex items-center">
              <button
                onClick={() => {
                  const container = document.getElementById("project-scroll");
                  if (container) container.scrollLeft -= 200;
                }}
                className="flex-shrink-0 z-10 bg-white shadow-md rounded-full p-1 hover:bg-gray-50 mr-2"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div
                id="project-scroll"
                className="flex space-x-2 overflow-x-auto pb-2 scroll-smooth flex-1"
                style={{
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                  maxWidth: "100%",
                }}
              >
                {projects.map((project) => (
                  <Button
                    key={project.id}
                    variant={projectId === project.id ? "primary" : "secondary"}
                    onClick={() => {
                      setSelectedProjectId(project.id);
                      navigate(`/projects/${project.id}/test-cases`);
                    }}
                    className="whitespace-nowrap m-2"
                  >
                    {project.name}
                  </Button>
                ))}
              </div>
              <button
                onClick={() => {
                  const container = document.getElementById("project-scroll");
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

      {/* Content Area - Now scrollable at page level */}
      <div className="flex-1 px-6 pb-6">
        <div className="flex flex-col">
          {/* Module Selection Panel */}
          {projectId && (
            <Card className="mb-4">
              <CardContent className="p-4">
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Module Selection
                  </h2>
                </div>
                <div className="relative flex items-center">
                  <button
                    onClick={() => {
                      const container =
                        document.getElementById("module-scroll");
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
                      const moduleTestCases = testCases.filter(
                        (tc: TestCase) =>
                          tc.projectId === projectId &&
                          tc.module === module.name
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
                      const container =
                        document.getElementById("module-scroll");
                      if (container) container.scrollLeft += 200;
                    }}
                    className="flex-shrink-0 z-10 bg-white shadow-md rounded-full p-1 hover:bg-gray-50 ml-2"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Submodule Selection Panel */}
          {projectId && selectedModule && (
            <Card className="mb-4">
              <CardContent className="p-4">
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Submodule Selection
                  </h2>
                </div>
                <div className="relative flex items-center">
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
                    className="flex space-x-2 overflow-x-auto pb-2 scroll-smooth flex-1"
                    style={{
                      scrollbarWidth: "none",
                      msOverflowStyle: "none",
                      maxWidth: "100%",
                    }}
                  >
                    {projectModules
                      .find((m) => m.name === selectedModule)
                      ?.submodules.map((submodule) => {
                        const submoduleTestCases = testCases.filter(
                          (tc: TestCase) =>
                            tc.projectId === projectId &&
                            tc.module === selectedModule &&
                            tc.subModule === submodule
                        );
                        return (
                          <div key={submodule} className="flex items-center">
                            <div className="flex items-center border border-gray-200 rounded-lg p-0.5 bg-white hover:border-gray-300 transition-colors">
                              <Button
                                variant={
                                  selectedSubmodule === submodule
                                    ? "primary"
                                    : "secondary"
                                }
                                onClick={() => handleSubmoduleSelect(submodule)}
                                className="whitespace-nowrap border-0 m-2"
                              >
                                {submodule}
                                <Badge variant="info" className="ml-2">
                                  {submoduleTestCases.length}
                                </Badge>
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setFormData((prev) => ({
                                    ...prev,
                                    module: selectedModule,
                                    subModule: submodule,
                                    projectId: projectId,
                                  }));
                                  setIsModalOpen(true);
                                }}
                                className="p-1 border-0 hover:bg-gray-50"
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
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
          )}

          {/* Bulk Operations Panel */}
          {projectId && selectedModule && selectedTestCases.length > 0 && (
            <div className="flex justify-end space-x-3 mb-4">
              <Button
                onClick={() => {
                  if (
                    window.confirm(
                      `Are you sure you want to delete ${selectedTestCases.length} test case(s)?`
                    )
                  ) {
                    selectedTestCases.forEach((id) => deleteTestCase(id));
                    setSelectedTestCases([]);
                  }
                }}
                className="flex items-center space-x-2 bg-red-600 hover:bg-red-700"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete ({selectedTestCases.length})</span>
              </Button>
            </div>
          )}

          {/* Bulk Add Button above the table */}
          {projectId && (
            <div className="flex justify-end mb-4">
              <Button
                onClick={() => setIsBulkAddModalOpen(true)}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                <span>Bulk Add</span>
              </Button>
            </div>
          )}

          {/* Filter Options Above Table */}
          {projectId && selectedModule && (
            <div className="flex flex-wrap items-center gap-4 mb-4">
              <input
                type="text"
                placeholder="Search by description..."
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                style={{ minWidth: 220 }}
              />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Types</option>
                <option value="functional">Functional</option>
                <option value="regression">Regression</option>
                <option value="smoke">Smoke</option>
                <option value="integration">Integration</option>
              </select>
              <select
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Severities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
              {(filterText || filterType || filterSeverity) && (
                <button
                  onClick={() => {
                    setFilterText("");
                    setFilterType("");
                    setFilterSeverity("");
                  }}
                  className="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300 text-gray-700"
                >
                  Clear
                </button>
              )}
            </div>
          )}

          {/* Test Cases Table - Now with dynamic height */}
          {projectId && selectedModule && (
            <Card>
              <CardContent className="p-0">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr className="border-b border-gray-200">
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <input
                          type="checkbox"
                          checked={
                            selectedTestCases.length ===
                            filteredTestCases.length
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
                    {filteredTestCases.map((testCase: TestCaseType) => (
                      <React.Fragment key={testCase.id}>
                        <tr className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="checkbox"
                              checked={selectedTestCases.includes(testCase.id)}
                              onChange={(e) =>
                                handleSelectTestCase(
                                  testCase.id,
                                  e.target.checked
                                )
                              }
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                          </td>
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
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleViewTestCase(testCase)}
                                className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                                title="View"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleEdit(testCase)}
                                className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                                title="Edit"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(testCase.id)}
                                className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Add/Edit Test Case Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={resetForm}
        title={editingTestCase ? "Edit Test Case" : "Create New Test Case"}
        size="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Module Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Module
              </label>
              <select
                value={formData.module}
                onChange={(e) => {
                  handleInputChange("module", e.target.value);
                  handleInputChange("subModule", ""); // Reset submodule when module changes
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select Module</option>
                {projectModules.map((module) => (
                  <option key={module.id} value={module.name}>
                    {module.name}
                  </option>
                ))}
              </select>
            </div>
            {/* Submodule Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sub Module
              </label>
              <select
                value={formData.subModule}
                onChange={(e) => handleInputChange("subModule", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={!formData.module}
              >
                <option value="">Select Sub Module</option>
                {(
                  projectModules.find((m) => m.name === formData.module)
                    ?.submodules || []
                ).map((submodule) => (
                  <option key={submodule} value={submodule}>
                    {submodule}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={1}
              required
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Test Steps
              </label>
            </div>
            <div className="space-y-2">
              <textarea
                value={formData.steps}
                onChange={(e) => handleInputChange("steps", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={6}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => handleInputChange("type", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="functional">Functional</option>
                <option value="regression">Regression</option>
                <option value="smoke">Smoke</option>
                <option value="integration">Integration</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Severity
              </label>
              <select
                value={formData.severity}
                onChange={(e) => handleInputChange("severity", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="secondary" onClick={resetForm}>
              Cancel
            </Button>
            <Button type="submit">
              {editingTestCase ? "Update Test Case" : "Create Test Case"}
            </Button>
          </div>
        </form>
      </Modal>

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

      {/* Description View Modal */}
      <Modal
        isOpen={isDescriptionModalOpen}
        onClose={() => {
          setIsDescriptionModalOpen(false);
          setSelectedDescription("");
        }}
        title="Test Case Description"
      >
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-gray-700 whitespace-pre-wrap">
              {selectedDescription}
            </p>
          </div>
          <div className="flex justify-end">
            <Button
              variant="secondary"
              onClick={() => {
                setIsDescriptionModalOpen(false);
                setSelectedDescription("");
              }}
            >
              Close
            </Button>
          </div>
        </div>
      </Modal>

      {/* Bulk Add Modal */}
      <Modal
        isOpen={isBulkAddModalOpen}
        onClose={() => setIsBulkAddModalOpen(false)}
        title="Bulk Add Test Cases"
        size="2xl"
      >
        <form onSubmit={handleBulkAddSubmit} className="space-y-4 ">
            <div className="flex items-center justify-between mb-2">
            <div>
              <button
                type="button"
                className="flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded shadow mr-3"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-4 h-4 mr-2" />
                Import from Excel/CSV
              </button>
              <input
                type="file"
                accept=".xlsx,.csv"
                onChange={handleImportExcel}
                ref={fileInputRef}
                className="hidden"
              />
            </div>
            <Button
              type="button"
              onClick={handleAddBulkRow}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
            >
              + Add Row
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-2 py-1 border">Module</th>
                  <th className="px-2 py-1 border">Submodule</th>
                  <th className="px-2 py-1 border">Description</th>
                  <th className="px-2 py-1 border">Steps</th>
                  <th className="px-2 py-1 border">Type</th>
                  <th className="px-2 py-1 border">Severity</th>
                  <th className="px-2 py-1 border">Remove</th>
                </tr>
              </thead>
              <tbody>
                {bulkRows.map((row, idx) => (
                  <tr key={idx}>
                    <td className="px-2 py-1 border">
                      <select
                        value={row.module}
                        onChange={(e) =>
                          handleBulkRowChange(idx, "module", e.target.value)
                        }
                        className="w-32 px-2 py-1 border rounded"
                        required
                      >
                        <option value="">Select</option>
                        {projectModules.map((module) => (
                          <option key={module.id} value={module.name}>
                            {module.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-2 py-1 border">
                      <select
                        value={row.subModule}
                        onChange={(e) =>
                          handleBulkRowChange(idx, "subModule", e.target.value)
                        }
                        className="w-32 px-2 py-1 border rounded"
                        required
                        disabled={!row.module}
                      >
                        <option value="">Select</option>
                        {(
                          projectModules.find((m) => m.name === row.module)
                            ?.submodules || []
                        ).map((submodule) => (
                          <option key={submodule} value={submodule}>
                            {submodule}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-2 py-1 border">
                      <input
                        type="text"
                        value={row.description}
                        onChange={(e) =>
                          handleBulkRowChange(
                            idx,
                            "description",
                            e.target.value
                          )
                        }
                        className="w-48 px-2 py-1 border rounded"
                        required
                      />
                    </td>
                    <td className="px-2 py-1 border">
                      <input
                        type="text"
                        value={row.steps}
                        onChange={(e) =>
                          handleBulkRowChange(idx, "steps", e.target.value)
                        }
                        className="w-48 px-2 py-1 border rounded"
                        required
                      />
                    </td>
                    <td className="px-2 py-1 border">
                      <select
                        value={row.type}
                        onChange={(e) =>
                          handleBulkRowChange(idx, "type", e.target.value)
                        }
                        className="w-28 px-2 py-1 border rounded"
                      >
                        <option value="functional">Functional</option>
                        <option value="regression">Regression</option>
                        <option value="smoke">Smoke</option>
                        <option value="integration">Integration</option>
                      </select>
                    </td>
                    <td className="px-2 py-1 border">
                      <select
                        value={row.severity}
                        onChange={(e) =>
                          handleBulkRowChange(idx, "severity", e.target.value)
                        }
                        className="w-28 px-2 py-1 border rounded"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="critical">Critical</option>
                      </select>
                    </td>
                    <td className="px-2 py-1 border text-center">
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => handleRemoveBulkRow(idx)}
                        className="px-2 py-1"
                        disabled={bulkRows.length === 1}
                      >
                        Remove
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-end items-center mt-2">
            <div className="flex space-x-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsBulkAddModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Add Test Cases</Button>
            </div>
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
    </div>
  );
};
