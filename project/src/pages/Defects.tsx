import React, { useState, useEffect } from "react";
import {
  Plus,
  CheckCircle,
  Eye,
  Edit2,
  Trash2
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

import { mockModules } from "../context/mockData";
import { defectFilterService, Defect } from "../service/defectFilterService";

export const Defects: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const {
    defects,
    projects,
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

  // Filter state (only API filters)
  const [filters, setFilters] = useState({
    status: "",
    priority: "",
    type: "",
    severity: "",
  });

  // State for API defects, loading, and error
  const [apiDefects, setApiDefects] = useState<Defect[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mapping for filter values to backend IDs
  const statusMap: Record<string, string> = {
    open: "1",
    "in-progress": "2",
    resolved: "3",
    closed: "4",
    rejected: "5",
  };
  const priorityMap: Record<string, string> = {
    critical: "1",
    high: "2",
    medium: "3",
    low: "4",
  };
  const typeMap: Record<string, string> = {
    "ui-issue": "1",
    "functional-bug": "2",
    "performance-issue": "3",
  };
  const severityMap: Record<string, string> = {
    critical: "1",
    major: "2",
    minor: "3",
  };

  useEffect(() => {
    if (!projectId) return;
    setIsLoading(true);
    setError(null);
    const statusId = filters.status ? statusMap[filters.status] : "";
    const priorityId = filters.priority ? priorityMap[filters.priority] : "";
    const typeId = filters.type ? typeMap[filters.type] : "";
    const severityId = filters.severity ? severityMap[filters.severity] : "";
    console.log("Calling defectFilterService with:", {
      projectId,
      statusId,
      priorityId,
      typeId,
      severityId,
    });
    defectFilterService({
      projectId,
      statusId,
      priorityId,
      typeId,
      severityId,
    })
      .then(setApiDefects)
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, [projectId, filters]);

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
      apiDefects.map((d) => d.type).filter(Boolean)
    )
  );
  const uniqueSeverities = Array.from(
    new Set(
      apiDefects.map((d) => d.severity).filter(Boolean)
    )
  );
  const uniquePriorities = Array.from(
    new Set(
      apiDefects.map((d) => d.priority).filter(Boolean)
    )
  );
  const uniqueStatuses = Array.from(
    new Set(
      apiDefects.map((d) => d.status).filter(Boolean)
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

      {/* Filter Row - only Status, Priority, Type, Severity */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-4 mb-6">
        <div className="grid grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}
              className="w-full px-2 py-1 border border-gray-300 rounded"
            >
              <option value="">All</option>
              {uniqueStatuses.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Priority</label>
            <select
              value={filters.priority}
              onChange={e => setFilters(f => ({ ...f, priority: e.target.value }))}
              className="w-full px-2 py-1 border border-gray-300 rounded"
            >
              <option value="">All</option>
              {uniquePriorities.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Type</label>
            <select
              value={filters.type}
              onChange={e => setFilters(f => ({ ...f, type: e.target.value }))}
              className="w-full px-2 py-1 border border-gray-300 rounded"
            >
              <option value="">All</option>
              {uniqueTypes.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Severity</label>
            <select
              value={filters.severity}
              onChange={e => setFilters(f => ({ ...f, severity: e.target.value }))}
              className="w-full px-2 py-1 border border-gray-300 rounded"
            >
              <option value="">All</option>
              {uniqueSeverities.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Loading and error states */}
      {isLoading && (
        <div className="text-center text-blue-600 py-8">Loading defects...</div>
      )}
      {error && (
        <div className="text-center text-red-600 py-8">{error}</div>
      )}

      {/* Defect Table */}
      {!isLoading && !error && (
        <Card>
          <CardContent className="p-0">
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
                  {apiDefects.length > 0 ? (
                    apiDefects.map((defect) => (
                      <tr
                        key={defect.defectId}
                        ref={highlightId === String(defect.defectId) ? highlightedRowRef : undefined}
                        className={`hover:bg-gray-50${highlightId === String(defect.defectId)
                          ? " bg-yellow-100 border-2 border-yellow-400"
                          : ""
                          }`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {defect.defectId}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {defect.defectTitle}
                        </td>
                        <td className="px-6 py-4 text-sm text-blue-600 cursor-pointer">
                          <button
                            type="button"
                            className="flex items-center space-x-1 hover:underline"
                            onClick={() => {
                              setViewingSteps(defect.steps);
                              setIsViewStepsModalOpen(true);
                            }}
                            title="View Steps"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            <span>View</span>
                          </button>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {/* Module info not available in backend response */}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {/* Submodule info not available in backend response */}
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
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {defect.assignTo}
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
                              onClick={() => handleDelete(String(defect.defectId))}
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
      )}

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
                {(modulesByProject && modulesByProject[projectId as string]
                  ? modulesByProject[projectId as string]
                  : []
                ).map((m: { id: string; name: string; submodules: { id: string; name: string }[] }) => (
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
                {(
                  (modulesByProject && modulesByProject[projectId as string]
                    ? modulesByProject[projectId as string]
                    : []
                  ).find((m: { id: string }) => m.id === formData.module)?.submodules || []
                ).map((sm: { id: string; name: string }) => (
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
