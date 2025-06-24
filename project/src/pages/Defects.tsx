import React, { useState } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  Eye,
  MessageSquareWarning,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Modal } from "../components/ui/Modal";
import { useApp } from "../context/AppContext";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import QuickAddTestCase from "./QuickAddTestCase";
import QuickAddDefect from "./QuickAddDefect";
import { ProjectSelector } from "../components/ui/ProjectSelector";
import { ModuleSelector } from "../components/ui/ModuleSelector";
import { SubmoduleSelector } from "../components/ui/SubmoduleSelector";
import { mockModules } from "../context/mockData";

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
    modulesByProject,
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
      updateDefect({
        ...formData,
        projectId: projectId || "",
        id: editingDefect.id,
        createdAt: editingDefect.createdAt,
        updatedAt: new Date().toISOString(),
      });
    } else {
      const newDefect = {
        ...formData,
        projectId: projectId || "",
        id: getNextDefectId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
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
      status: "open",
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

  // Use centralized mockModules for module and submodule selection
  const modulesList =
    projectId &&
      (
        mockModules as Record<
          string,
          { id: string; name: string; submodules: string[] }[]
        >
      )[projectId]
      ? (
        mockModules as Record<
          string,
          { id: string; name: string; submodules: string[] }[]
        >
      )[projectId].map((m: { name: string }) => m.name)
      : [];
  const submodulesList =
    formData.module &&
      projectId &&
      (
        mockModules as Record<
          string,
          { id: string; name: string; submodules: string[] }[]
        >
      )[projectId]
      ? (
        mockModules as Record<
          string,
          { id: string; name: string; submodules: string[] }[]
        >
      )[projectId].find((m: { name: string }) => m.name === formData.module)
        ?.submodules || []
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

  return (
    <div className="max-w-6xl mx-auto">
      {/* Project Selection Panel */}
      <ProjectSelector
        projects={projects}
        selectedProjectId={projectId || null}
        onSelect={handleProjectSelect}
      />

      {/* Add Defect Button */}
      <div className="flex justify-between items-center m-4">
        <h1 className="text-2xl font-bold text-gray-900">Defects</h1>
        <Button onClick={() => setIsModalOpen(true)} icon={Plus}>
          Add Defect
        </Button>
      </div>

      {/* Filter Row - move above the defect table card */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-4 mb-6">
        <div className="grid grid-cols-8 gap-4 items-end">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              ID
            </label>
            <Input
              placeholder="Defect ID"
              value={filters.id}
              onChange={(e) =>
                setFilters((f) => ({ ...f, id: e.target.value }))
              }
              className="w-full"
            />
          </div>
          <div>
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
              className="w-full px-2 py-1 border border-gray-300 rounded"
            >
              <option value="">All</option>
              {uniqueModules.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Submodule
            </label>
            <select
              value={filters.subModule}
              onChange={(e) =>
                setFilters((f) => ({ ...f, subModule: e.target.value }))
              }
              className="w-full px-2 py-1 border border-gray-300 rounded"
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
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Type
            </label>
            <select
              value={filters.type}
              onChange={(e) =>
                setFilters((f) => ({ ...f, type: e.target.value }))
              }
              className="w-full px-2 py-1 border border-gray-300 rounded"
            >
              <option value="">All</option>
              {uniqueTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Severity
            </label>
            <select
              value={filters.severity}
              onChange={(e) =>
                setFilters((f) => ({ ...f, severity: e.target.value }))
              }
              className="w-full px-2 py-1 border border-gray-300 rounded"
            >
              <option value="">All</option>
              {uniqueSeverities.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Priority
            </label>
            <select
              value={filters.priority}
              onChange={(e) =>
                setFilters((f) => ({ ...f, priority: e.target.value }))
              }
              className="w-full px-2 py-1 border border-gray-300 rounded"
            >
              <option value="">All</option>
              {uniquePriorities.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) =>
                setFilters((f) => ({ ...f, status: e.target.value }))
              }
              className="w-full px-2 py-1 border border-gray-300 rounded"
            >
              <option value="">All</option>
              {uniqueStatuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Assigned To
            </label>
            <Input
              placeholder="Name"
              value={filters.assignedTo}
              onChange={(e) =>
                setFilters((f) => ({ ...f, assignedTo: e.target.value }))
              }
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Defect Table in a single frame with search/filter in one line */}
      <Card>
        <CardContent className="p-0">
          <div className="flex flex-wrap md:flex-nowrap justify-between items-center gap-2 px-4 py-2 bg-gray-50 border-b border-gray-200">
            {/* Search Field (right) */}
            <div className="flex items-center ml-auto">
              <Input
                placeholder="Search..."
                value={filters.search || ""}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, search: e.target.value }))
                }
                className="w-40"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Defect ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Brief Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Steps
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Module
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submodule
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Severity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assigned To
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
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
                        <div className="flex items-center justify-between">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              defect.status
                            )}`}
                          >
                            {defect.status}
                          </span>
                          {defect.status === "rejected" &&
                            defect.rejectionComment && (
                              <button
                                type="button"
                                className="ml-1 text-blue-600 hover:text-blue-800 flex-shrink-0"
                                title="View rejection comment"
                                onClick={() => {
                                  setViewingRejectionComment(
                                    defect.rejectionComment || ""
                                  );
                                  setIsRejectionCommentModalOpen(true);
                                }}
                              >
                                <MessageSquareWarning className="w-4 h-4 text-red-700" />
                              </button>
                            )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {defect.assignedTo}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(defect)}
                            className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                            title="Edit Defect"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(defect.id)}
                            className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                            title="Delete Defect"
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
        title={editingDefect ? "Edit Defect" : "Report New Defect"}
        size="lg"
      >
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
          {/* Modules and Submodules as dropdowns */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Module</label>
              <select
                value={formData.module}
                onChange={e => {
                  handleInputChange("module", e.target.value);
                  handleInputChange("subModule", ""); // Reset submodule when module changes
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select module</option>
                {(modulesByProject[projectId] || []).map((m) => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Submodule</label>
              <select
                value={formData.subModule}
                onChange={e => handleInputChange("subModule", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={!formData.module}
              >
                <option value="">Select submodule</option>
                {((modulesByProject[projectId] || []).find((m) => m.id === formData.module)?.submodules || []).map((sm) => (
                  <option key={sm.id} value={sm.id}>{sm.name}</option>
                ))}
              </select>
            </div>
          </div>
          {/* Severity, Priority, Type, Status */}
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
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange("status", e.target.value)}
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
          {/* Show rejection comment if status is rejected */}
          {formData.status === "rejected" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rejection Comment
              </label>
              <Input
                value={formData.rejectionComment}
                onChange={(e) =>
                  handleInputChange("rejectionComment", e.target.value)
                }
                placeholder="Enter reason for rejection"
                required={formData.status === "rejected"}
              />
            </div>
          )}
          {/* Assigned To */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Assigned To"
              value={formData.assignedTo}
              onChange={(e) => handleInputChange("assignedTo", e.target.value)}
              required
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="secondary" onClick={resetForm}>
              Cancel
            </Button>
            <Button type="submit">
              {editingDefect ? "Update Defect" : "Report Defect"}
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
        <div className="whitespace-pre-line text-gray-800 text-base">
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

      {/* Modal for viewing rejection comment */}
      <Modal
        isOpen={isRejectionCommentModalOpen}
        onClose={() => setIsRejectionCommentModalOpen(false)}
        title="Rejection Comment"
        size="md"
      >
        <div className="text-gray-800 text-base whitespace-pre-line">
          {viewingRejectionComment}
        </div>
        <div className="flex justify-end pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={() => setIsRejectionCommentModalOpen(false)}
          >
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
