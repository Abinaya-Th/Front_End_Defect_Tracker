import React, { useState } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  Eye,
  FileText,
  MessageSquareWarning,
  ChevronLeft,
  ChevronRight,
  History,
} from "lucide-react";
import { Card, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Modal } from "../components/ui/Modal";
import { useApp } from "../context/AppContext";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import QuickAddTestCase from "./QuickAddTestCase";
import QuickAddDefect from "./QuickAddDefect";
import * as XLSX from "xlsx";
import { importDefects } from "../api/importTestCase";

export const Defects: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    defects,
    projects,
    releases,
    addDefect,
    updateDefect,
    deleteDefect,
    setSelectedProjectId,
  } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDefect, setEditingDefect] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    module: "",
    subModule: "",
    type: "bug" as "bug" | "test-failure" | "enhancement",
    priority: "medium" as "low" | "medium" | "high" | "critical",
    severity: "medium" as "low" | "medium" | "high" | "critical",
    status: "open" as
      | "open"
      | "in-progress"
      | "resolved"
      | "closed"
      | "rejected",
    projectId: projectId || "",
    releaseId: "",
    testCaseId: "",
    assignedTo: "",
    reportedBy: "",
    rejectionComment: "",
  });

  const [isViewStepsModalOpen, setIsViewStepsModalOpen] = useState(false);
  const [viewingSteps, setViewingSteps] = useState<string | null>(null);
  const [isRejectionCommentModalOpen, setIsRejectionCommentModalOpen] =
    useState(false);
  const [viewingRejectionComment, setViewingRejectionComment] = useState<
    string | null
  >(null);

  // Filter state
  const [filters, setFilters] = useState({
    id: "",
    module: "",
    subModule: "",
    type: "",
    severity: "",
    priority: "",
    status: "",
    assignedTo: "",
    reportedBy: "",
    search: "",
  });

  // Filtered defects based on filters
  const filteredDefects = defects.filter(
    (d) =>
      d.projectId === projectId &&
      (filters.id === "" ||
        d.id.toLowerCase().includes(filters.id.toLowerCase())) &&
      (filters.module === "" || d.module === filters.module) &&
      (filters.subModule === "" || d.subModule === filters.subModule) &&
      (filters.type === "" || d.type === filters.type) &&
      (filters.severity === "" || d.severity === filters.severity) &&
      (filters.priority === "" || d.priority === filters.priority) &&
      (filters.status === "" || d.status === filters.status) &&
      (filters.assignedTo === "" ||
        (d.assignedTo || "")
          .toLowerCase()
          .includes(filters.assignedTo.toLowerCase())) &&
      (filters.reportedBy === "" ||
        (d.reportedBy || "")
          .toLowerCase()
          .includes(filters.reportedBy.toLowerCase())) &&
      (filters.search === "" ||
        d.id.toLowerCase().includes(filters.search.toLowerCase()) ||
        (d.title || "").toLowerCase().includes(filters.search.toLowerCase()) ||
        (d.description || "")
          .toLowerCase()
          .includes(filters.search.toLowerCase()) ||
        (d.module || "").toLowerCase().includes(filters.search.toLowerCase()) ||
        (d.subModule || "")
          .toLowerCase()
          .includes(filters.search.toLowerCase()) ||
        (d.type || "").toLowerCase().includes(filters.search.toLowerCase()) ||
        (d.severity || "")
          .toLowerCase()
          .includes(filters.search.toLowerCase()) ||
        (d.priority || "")
          .toLowerCase()
          .includes(filters.search.toLowerCase()) ||
        (d.status || "").toLowerCase().includes(filters.search.toLowerCase()) ||
        (d.assignedTo || "")
          .toLowerCase()
          .includes(filters.search.toLowerCase()) ||
        (d.reportedBy || "")
          .toLowerCase()
          .includes(filters.search.toLowerCase()))
  );

  // Project selection handler
  const handleProjectSelect = (id: string) => {
    setSelectedProjectId(id);
    navigate(`/projects/${id}/defects`);
  };

  // Helper to generate next defect ID in order
  const getNextDefectId = () => {
    const projectDefects = defects.filter((d) => d.projectId === projectId);
    const ids = projectDefects
      .map((d) => d.id)
      .map((id) => parseInt(id.replace("DEF-", "")))
      .filter((n) => !isNaN(n));
    const nextNum = ids.length > 0 ? Math.max(...ids) + 1 : 1;
    return `DEF-${nextNum.toString().padStart(4, "0")}`;
  };

  // CRUD handlers
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingDefect) {
      const now = new Date().toISOString();
      const newHistory = [
        ...(editingDefect.defectHistory || []),
        {
          status: formData.status,
          changedAt: now,
          comment: formData.status === "rejected" ? formData.rejectionComment : undefined,
        },
      ];
      updateDefect({
        ...formData,
        projectId: projectId || "",
        id: editingDefect.id,
        createdAt: editingDefect.createdAt,
        updatedAt: now,
        defectHistory: newHistory,
      });
    } else {
      const newDefect = {
        ...formData,
        projectId: projectId || "",
        id: getNextDefectId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: "new",
      };
      addDefect(newDefect);
    }
    resetForm();
  };
  const handleEdit = (defect: any) => {
    setEditingDefect(defect);
    setFormData({
      title: defect.title,
      description: defect.description,
      module: defect.module,
      subModule: defect.subModule,
      type: defect.type,
      priority: defect.priority,
      severity: defect.severity,
      status: defect.status,
      projectId: defect.projectId,
      releaseId: defect.releaseId || "",
      testCaseId: defect.testCaseId || "",
      assignedTo: defect.assignedTo || "",
      reportedBy: defect.reportedBy,
      rejectionComment: defect.rejectionComment || "",
    });
    setIsModalOpen(true);
  };
  const handleDelete = (defectId: string) => {
    if (window.confirm("Are you sure you want to delete this defect?")) {
      deleteDefect(defectId);
    }
  };
  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      module: "",
      subModule: "",
      type: "bug",
      priority: "medium",
      severity: "medium",
      status: "new",
      projectId: projectId || "",
      releaseId: "",
      testCaseId: "",
      assignedTo: "",
      reportedBy: "",
      rejectionComment: "",
    });
    setEditingDefect(null);
    setIsModalOpen(false);
  };
  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Color helpers
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
  const getPriorityColor = (priority: string) => {
    switch (priority) {
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
  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-purple-100 text-purple-800";
      case "in-progress":
        return "bg-blue-100 text-blue-800";
      case "resolved":
        return "bg-green-100 text-green-800";
      case "closed":
        return "bg-gray-100 text-gray-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Use the same mockModules structure as in TestCase.tsx
  interface Module {
    id: string;
    name: string;
    submodules: string[];
  }
  // Project-specific modules and submodules
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

  // Mock data for modules and submodules if none exist for the project
  const fallbackModules = [
    {
      id: "mod1",
      name: "Authentication",
      submodules: ["Login", "Logout", "Password Reset"],
    },
    {
      id: "mod2",
      name: "Dashboard",
      submodules: ["Overview", "Reports", "Analytics"],
    },
    {
      id: "mod3",
      name: "User Management",
      submodules: ["Add User", "Edit User", "Delete User"],
    },
  ];

  // Use fallback if no modules for current project
  const modulesList =
    projectId && mockModules[projectId] && mockModules[projectId].length > 0
      ? mockModules[projectId].map((m) => m.name)
      : fallbackModules.map((m) => m.name);
  const submodulesList =
    formData.module && modulesList.includes(formData.module)
      ? (projectId &&
        mockModules[projectId] &&
        mockModules[projectId].length > 0
        ? mockModules[projectId]
        : fallbackModules
      ).find((m) => m.name === formData.module)?.submodules || []
      : [];

  // Unique values for dropdowns
  const uniqueModules = modulesList;
  const uniqueSubmodules =
    formData.module && modulesList.includes(formData.module)
      ? submodulesList
      : Array.from(
        new Set(
          defects
            .filter((d) => d.projectId === projectId)
            .map((d) => d.subModule)
            .filter(Boolean)
        )
      );
  const uniqueTypes = Array.from(
    new Set(
      defects
        .filter((d) => d.projectId === projectId)
        .map((d) => d.type)
        .filter(Boolean)
    )
  );
  const uniqueSeverities = Array.from(
    new Set(
      defects
        .filter((d) => d.projectId === projectId)
        .map((d) => d.severity)
        .filter(Boolean)
    )
  );
  const uniquePriorities = Array.from(
    new Set(
      defects
        .filter((d) => d.projectId === projectId)
        .map((d) => d.priority)
        .filter(Boolean)
    )
  );
  const uniqueStatuses = Array.from(
    new Set(
      defects
        .filter((d) => d.projectId === projectId)
        .map((d) => d.status)
        .filter(Boolean)
    )
  );
  const uniqueAssignedTo = Array.from(
    new Set(
      defects
        .filter((d) => d.projectId === projectId)
        .map((d) => d.assignedTo)
        .filter(Boolean)
    )
  );

  // Get highlight param from URL
  const highlightId = React.useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get("highlight");
  }, [location.search]);
  // Ref for scrolling
  const highlightedRowRef = React.useRef<HTMLTableRowElement>(null);
  React.useEffect(() => {
    if (highlightedRowRef.current) {
      highlightedRowRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [highlightId]);

  // Add these state hooks at the top of the Defects component
  const [editingStatusId, setEditingStatusId] = useState<string | null>(null);
  const [statusEditValue, setStatusEditValue] = useState<string>('new');
  const [statusEditComment, setStatusEditComment] = useState<string>('');
  const [viewingDefectHistory, setViewingDefectHistory] = useState<DefectHistoryEntry[]>([]);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isEditingRejectionComment, setIsEditingRejectionComment] = useState(false);

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await importDefects(formData);
      if (response && response.data && Array.isArray(response.data)) {
        response.data.forEach((row: any) => addDefect(row));
        alert("Imported defects successfully.");
      } else {
        alert("Import succeeded but no data returned.");
      }
    } catch (error: any) {
      alert("Failed to import defects: " + (error?.message || error));
    }
  };
  const handleExportExcel = () => {
    const exportData = filteredDefects.map((d) => ({
      id: d.id,
      title: d.title,
      description: d.description,
      module: d.module,
      subModule: d.subModule,
      type: d.type,
      priority: d.priority,
      severity: d.severity,
      status: d.status,
      assignedTo: d.assignedTo,
      reportedBy: d.reportedBy,
      releaseId: d.releaseId,
      testCaseId: d.testCaseId,
      rejectionComment: d.rejectionComment,
      createdAt: d.createdAt,
      updatedAt: d.updatedAt,
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Defects");
    XLSX.writeFile(wb, "defects_export.xlsx");
  };

  return (
    <div className="max-w-6xl mx-auto">
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
                  onClick={() => handleProjectSelect(project.id)}
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

      {/* Add Defect Button */}
      <div className="flex justify-between items-center m-4">
        <h1 className="text-2xl font-bold text-gray-900">Defects</h1>
        <Button onClick={() => setIsModalOpen(true)} icon={Plus}>
          Add Defect
        </Button>
      </div>

      {/* Filter Row - compact, scrollable, and responsive design */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg px-2 py-2 mb-6">
        <div className="flex flex-nowrap overflow-x-auto gap-2 hide-scrollbar">
          {/* Each filter in a compact, min-w-[160px] block */}
          <div className="min-w-[140px] flex-shrink-0">
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Defect ID
            </label>
            <Input
              placeholder="Defect ID"
              value={filters.id}
              onChange={(e) =>
                setFilters((f) => ({ ...f, id: e.target.value }))
              }
              className="w-full h-8 text-xs"
            />
          </div>
          <div className="min-w-[140px] flex-shrink-0">
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Test Case ID
            </label>
            <Input
              placeholder="Test Case ID"
              value={filters.testCaseId || ""}
              onChange={(e) =>
                setFilters((f) => ({ ...f, testCaseId: e.target.value }))
              }
              className="w-full h-8 text-xs"
            />
          </div>
          <div className="min-w-[140px] flex-shrink-0">
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Module
            </label>
            <select
              value={filters.module}
              onChange={(e) =>
                setFilters((f) => ({
                  ...f,
                  module: e.target.value,
                  subModule: "",
                }))
              }
              className="w-full h-8 text-xs border border-gray-300 rounded"
            >
              <option value="">All</option>
              {uniqueModules.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
          <div className="min-w-[140px] flex-shrink-0">
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Submodule
            </label>
            <select
              value={filters.subModule}
              onChange={(e) =>
                setFilters((f) => ({ ...f, subModule: e.target.value }))
              }
              className="w-full h-8 text-xs border border-gray-300 rounded"
              disabled={!filters.module}
            >
              <option value="">All</option>
              {uniqueSubmodules.map((sm) => (
                <option key={sm} value={sm}>
                  {sm}
                </option>
              ))}
            </select>
          </div>
          <div className="min-w-[120px] flex-shrink-0">
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Type
            </label>
            <select
              value={filters.type}
              onChange={(e) =>
                setFilters((f) => ({ ...f, type: e.target.value }))
              }
              className="w-full h-8 text-xs border border-gray-300 rounded"
            >
              <option value="">All</option>
              {uniqueTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div className="min-w-[120px] flex-shrink-0">
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Severity
            </label>
            <select
              value={filters.severity}
              onChange={(e) =>
                setFilters((f) => ({ ...f, severity: e.target.value }))
              }
              className="w-full h-8 text-xs border border-gray-300 rounded"
            >
              <option value="">All</option>
              {uniqueSeverities.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div className="min-w-[120px] flex-shrink-0">
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Priority
            </label>
            <select
              value={filters.priority}
              onChange={(e) =>
                setFilters((f) => ({ ...f, priority: e.target.value }))
              }
              className="w-full h-8 text-xs border border-gray-300 rounded"
            >
              <option value="">All</option>
              {uniquePriorities.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
          <div className="min-w-[120px] flex-shrink-0">
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) =>
                setFilters((f) => ({ ...f, status: e.target.value }))
              }
              className="w-full h-8 text-xs border border-gray-300 rounded"
            >
              <option value="">All</option>
              {uniqueStatuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div className="min-w-[140px] flex-shrink-0">
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Assigned To
            </label>
            <Input
              placeholder="Name"
              value={filters.assignedTo}
              onChange={(e) =>
                setFilters((f) => ({ ...f, assignedTo: e.target.value }))
              }
              className="w-full h-8 text-xs"
            />
          </div>
          <div className="min-w-[140px] flex-shrink-0">
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Entered By
            </label>
            <Input
              placeholder="Name"
              value={filters.reportedBy || ""}
              onChange={(e) =>
                setFilters((f) => ({ ...f, reportedBy: e.target.value }))
              }
              className="w-full h-8 text-xs"
            />
          </div>
          <div className="min-w-[160px] flex-shrink-0">
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Search
            </label>
            <Input
              placeholder="Search..."
              value={filters.search || ""}
              onChange={(e) =>
                setFilters((f) => ({ ...f, search: e.target.value }))
              }
              className="w-full h-8 text-xs"
            />
          </div>
        </div>
      </div>

      {/* After the filter row, add: */}
      <div className="flex justify-end gap-2 mb-2">
        <button
          type="button"
          className="flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded shadow"
          onClick={() => fileInputRef.current?.click()}
        >
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4"
            />
          </svg>
          Import from Excel/CSV
        </button>
        <input
          type="file"
          accept=".xlsx,.csv"
          onChange={handleImportExcel}
          ref={fileInputRef}
          className="hidden"
        />
        <button
          type="button"
          className="flex items-center px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded shadow"
          onClick={handleExportExcel}
        >
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4v16m8-8H4"
            />
          </svg>
          Export to Excel
        </button>
      </div>

      {/* Defect Table in a single frame with search/filter in one line */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 whitespace-nowrap">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Defect ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Test Case ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Brief Description
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Steps
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Module
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submodule
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Severity
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    History
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned To</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entered By</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Release</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDefects.length > 0 ? (
                  filteredDefects.map((defect) => (
                    <tr
                      key={defect.id}
                      ref={
                        highlightId === defect.id
                          ? highlightedRowRef
                          : undefined
                      }
                      className={`hover:bg-gray-50${highlightId === defect.id
                        ? " bg-yellow-100 border-2 border-yellow-400"
                        : ""
                        }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {defect.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {defect.testCaseId || "-"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {defect.title}
                      </td>
                      <td className="px-6 py-4 text-sm text-blue-600 cursor-pointer">
                        <button
                          type="button"
                          className="flex items-center space-x-1 hover:underline"
                          onClick={() => {
                            setViewingSteps(defect.description);
                            setIsViewStepsModalOpen(true);
                          }}
                          title="View Steps"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          <span>View</span>
                        </button>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {defect.module}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {defect.subModule}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {defect.type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(
                            defect.severity
                          )}`}
                        >
                          {defect.severity}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(
                            defect.priority
                          )}`}
                        >
                          {defect.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap w-32">
                        <div className="flex flex-col items-center gap-1">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(defect.status)}`}>{defect.status}</span>
                          {editingStatusId === defect.id ? (
                            <form
                              onSubmit={e => {
                                e.preventDefault();
                                if (statusEditValue === 'rejected' && !statusEditComment) return;
                                const now = new Date().toISOString();
                                const newHistory = [
                                  ...(defect.defectHistory || []),
                                  {
                                    status: statusEditValue,
                                    changedAt: now,
                                    comment: statusEditValue === 'rejected' ? statusEditComment : undefined,
                                  },
                                ];
                                updateDefect({
                                  ...defect,
                                  status: statusEditValue,
                                  rejectionComment: statusEditValue === 'rejected' ? statusEditComment : '',
                                  updatedAt: now,
                                  defectHistory: newHistory,
                                });
                                setEditingStatusId(null);
                              }}
                              className="flex flex-col items-center gap-1 mt-2"
                            >
                              <select
                                value={statusEditValue}
                                onChange={e => setStatusEditValue(e.target.value)}
                                className="w-28 px-2 py-1 border border-gray-300 rounded"
                              >
                                <option value="new">New</option>
                                <option value="open">Open</option>
                                <option value="in-progress">In Progress</option>
                                <option value="resolved">Resolved</option>
                                <option value="closed">Closed</option>
                                <option value="rejected">Rejected</option>
                              </select>
                              {statusEditValue === 'rejected' && (
                                <input
                                  type="text"
                                  className="w-28 px-2 py-1 border border-red-400 rounded mt-1"
                                  placeholder="Enter rejection comment"
                                  value={statusEditComment}
                                  onChange={e => setStatusEditComment(e.target.value)}
                                  required
                                />
                              )}
                              <div className="flex gap-2 mt-1">
                                <button
                                  type="submit"
                                  className="bg-blue-600 text-white px-2 py-1 rounded text-xs"
                                  disabled={statusEditValue === 'rejected' && !statusEditComment}
                                >
                                  Save
                                </button>
                                <button
                                  type="button"
                                  className="bg-gray-300 text-gray-800 px-2 py-1 rounded text-xs"
                                  onClick={() => setEditingStatusId(null)}
                                >
                                  Cancel
                                </button>
                              </div>
                            </form>
                          ) : (
                            <div className="flex flex-col items-center gap-1 mt-1">
                              <div className="flex gap-2">
                                {defect.status === "rejected" && defect.rejectionComment && (
                                  <button
                                    type="button"
                                    className="text-blue-600 hover:text-blue-800 flex-shrink-0"
                                    title="View rejection comment"
                                    onClick={() => {
                                      setEditingStatusId(defect.id);
                                      setStatusEditComment(defect.rejectionComment || "");
                                      setIsRejectionCommentModalOpen(true);
                                    }}
                                  >
                                    <MessageSquareWarning className="w-4 h-4 text-red-700" />
                                  </button>
                                )}
                                <button
                                  type="button"
                                  className="text-blue-600 hover:text-blue-900 p-1"
                                  title="Edit status"
                                  onClick={() => {
                                    setEditingStatusId(defect.id);
                                    setStatusEditValue(defect.status);
                                    setStatusEditComment(defect.rejectionComment || '');
                                  }}
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                        <button
                          type="button"
                          className="text-blue-600 hover:text-blue-900 p-1"
                          title="View defect history"
                          onClick={() => {
                            setViewingDefectHistory(defect.defectHistory || []);
                            setIsHistoryModalOpen(true);
                          }}
                        >
                          <History className="h-5 w-5 inline" />
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {defect.assignedTo || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {defect.reportedBy || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {(() => {
                          const release = releases.find(r => r.id === defect.releaseId);
                          return release ? release.name : '-';
                        })()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            className="text-blue-600 hover:text-blue-900 flex items-center"
                            title="View Defect Details"
                            onClick={() => {
                              setViewingSteps(
                                `ID: ${defect.id}\nTitle: ${defect.title}\nDescription: ${defect.description}\nModule: ${defect.module}\nSubmodule: ${defect.subModule}\nType: ${defect.type}\nSeverity: ${defect.severity}\nPriority: ${defect.priority}\nStatus: ${defect.status}\nAssigned To: ${defect.assignedTo}\nEntered By: ${defect.reportedBy}`
                              );
                              setIsViewStepsModalOpen(true);
                            }}
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            className="text-green-600 hover:text-green-900 flex items-center"
                            title="Edit Defect"
                            onClick={() => handleEdit(defect)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            className="text-red-600 hover:text-red-900 flex items-center"
                            title="Delete Defect"
                            onClick={() => handleDelete(defect.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={10} className="p-12 text-center text-gray-500">
                      <CheckCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <div className="text-lg font-medium text-gray-900 mb-2">
                        No defects found
                      </div>
                      <div className="text-gray-500 mb-4">
                        No defects have been reported for this project
                      </div>
                      <Button onClick={() => setIsModalOpen(true)} icon={Plus}>
                        Add Defect
                      </Button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Modal for Add/Edit Defect */}
      <Modal
        isOpen={isModalOpen}
        onClose={resetForm}
        title={editingDefect ? "Edit Defect" : "Add New Defect"}
        size="lg"
      >
        {projects && formData.projectId && (
          (() => {
            const project = projects.find((p) => p.id === formData.projectId);
            return project ? (
              <div className="font-bold text-blue-600 text-base mb-2">{project.name}</div>
            ) : null;
          })()
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Brief Description */}
          <Input
            label="Brief Description"
            value={formData.title}
            onChange={(e) => handleInputChange("title", e.target.value)}
            required
          />
          {/* Steps */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Steps
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              required
            />
          </div>
          {/* Modules and Submodules */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Modules
              </label>
              <select
                value={formData.module}
                onChange={(e) => handleInputChange("module", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select a module</option>
                {modulesList.map((module: string) => (
                  <option key={module} value={module}>
                    {module}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Submodules
              </label>
              <select
                value={formData.subModule}
                onChange={(e) => handleInputChange("subModule", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={!formData.module}
              >
                <option value="">Select a submodule</option>
                {submodulesList.map((submodule: string) => (
                  <option key={submodule} value={submodule}>
                    {submodule}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {/* Severity, Priority, Type */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Severity
              </label>
              <select
                value={formData.severity}
                onChange={(e) => handleInputChange("severity", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select severity</option>
                <option value="critical">Critical</option>
                <option value="major">Major</option>
                <option value="minor">Minor</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => handleInputChange("priority", e.target.value)}
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
          {/* Types and Assigned To in one row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Types
              </label>
              <select
                value={formData.type}
                onChange={(e) => handleInputChange("type", e.target.value)}
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
                Assigned To
              </label>
              <select
                value={formData.assignedTo}
                onChange={(e) =>
                  handleInputChange("assignedTo", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select assignee</option>
                {uniqueAssignedTo.map((user) => (
                  <option key={user} value={user}>
                    {user}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="secondary" onClick={resetForm}>
              Cancel
            </Button>
            <Button type="submit">
              {editingDefect ? "Update Defect" : "Save Defect"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal for viewing steps */}
      <Modal
        isOpen={isViewStepsModalOpen}
        onClose={() => setIsViewStepsModalOpen(false)}
        title="Defect Steps"
        size="md"
      >
        <div
          className="whitespace-pre-line text-gray-800 text-base break-words max-w-full overflow-x-auto"
          style={{ wordBreak: "break-word" }}
        >
          {viewingSteps}
        </div>
        <div className="flex justify-end pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={() => setIsViewStepsModalOpen(false)}
          >
            Close
          </Button>
        </div>
      </Modal>

      {/* Modal for viewing and editing rejection comment */}
      <Modal
        isOpen={isRejectionCommentModalOpen}
        onClose={() => {
          setIsRejectionCommentModalOpen(false);
          setIsEditingRejectionComment(false);
        }}
        title="Rejection Comment"
        size="md"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Rejection Comment</label>
          {!isEditingRejectionComment ? (
            <div className="flex items-center gap-2">
              <span className="text-gray-800 text-base whitespace-pre-line flex-1">{statusEditComment || <span className="italic text-gray-400">No comment</span>}</span>
              <Button type="button" size="sm" variant="secondary" onClick={() => setIsEditingRejectionComment(true)}>
                Edit
              </Button>
            </div>
          ) : (
            <form
              onSubmit={e => {
                e.preventDefault();
                if (!editingStatusId) return setIsRejectionCommentModalOpen(false);
                const defect = defects.find(d => d.id === editingStatusId);
                if (!defect) return setIsRejectionCommentModalOpen(false);
                const now = new Date().toISOString();
                const newHistory = [
                  ...(defect.defectHistory || []),
                  {
                    status: 'rejected',
                    changedAt: now,
                    comment: statusEditComment,
                  },
                ];
                updateDefect({
                  ...defect,
                  rejectionComment: statusEditComment,
                  defectHistory: newHistory,
                  updatedAt: now,
                });
                setIsEditingRejectionComment(false);
                setIsRejectionCommentModalOpen(false);
              }}
            >
              <Input
                value={statusEditComment}
                onChange={e => setStatusEditComment(e.target.value)}
                placeholder="Enter reason for rejection"
                required
              />
              <div className="flex justify-end pt-4 gap-2">
                <Button type="button" variant="secondary" onClick={() => setIsEditingRejectionComment(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  Save
                </Button>
              </div>
            </form>
          )}
        </div>
      </Modal>

      {/* Modal for viewing defect history */}
      <Modal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        title="Defect History"
        size="md"
      >
        <div className="flex flex-col items-center">
          {viewingDefectHistory.length === 0 ? (
            <div className="text-gray-500">No history available.</div>
          ) : (
            <div className="flex items-center flex-wrap gap-2">
              {viewingDefectHistory.map((entry, idx) => (
                <React.Fragment key={idx}>
                  <div className="flex flex-col items-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(entry.status)}`}>{entry.status}</span>
                    {entry.comment && <div className="text-xs text-gray-700 mt-1">{entry.comment}</div>}
                    <div className="text-[10px] text-gray-400 mt-0.5">{new Date(entry.changedAt).toLocaleString()}</div>
                  </div>
                  {idx < viewingDefectHistory.length - 1 && (
                    <span className="mx-1 text-lg text-gray-500">→</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          )}
        </div>
        <div className="flex justify-end pt-4">
          <Button type="button" variant="secondary" onClick={() => setIsHistoryModalOpen(false)}>
            Close
          </Button>
        </div>
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
