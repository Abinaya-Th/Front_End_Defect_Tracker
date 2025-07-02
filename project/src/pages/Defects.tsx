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
import { getAllPriorities, Priority } from "../api/priority";
import { getAllDefectStatuses, DefectStatus } from "../api/defectStatus";
import type { Defect as BaseDefect, DefectHistoryEntry } from "../types/index";
import { getDefectTypes } from "../api/defectType";
import { getSeverities } from "../api/severity";
import { ProjectSelector } from "../components/ui/ProjectSelector";
import { getAllProjects } from "../api/projectget";
import type { Project } from "../types";
import { FilteredDefect } from '../api/defect/filterDefectByProject';
import { getModulesByProjectId } from '../api/module/getModule';
import { getSubmodulesByModuleId } from '../api/submodule/submoduleget';
import { filterDefects } from "../api/defect/filterDefectByProject";

// Use Defect type from types/index.ts directly

export const Defects: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    defects,
    releases,
    addDefect,
    updateDefect,
    deleteDefect,
    setSelectedProjectId,
    employees,
  } = useApp();

  // Backend projects state
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectIdLocal] = React.useState<string | null>(projectId || null);

  // Backend defects state
  const [backendDefects, setBackendDefects] = React.useState<FilteredDefect[]>([]);
  // Lookup maps for names
  const [statusMap, setStatusMap] = React.useState<Record<number, string>>({});
  const [severityMap, setSeverityMap] = React.useState<Record<number, string>>({});
  const [priorityMap, setPriorityMap] = React.useState<Record<number, string>>({});
  const [typeMap, setTypeMap] = React.useState<Record<number, string>>({});
  const [moduleMap, setModuleMap] = React.useState<Record<number, string>>({});
  const [submoduleMap, setSubmoduleMap] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    getAllProjects().then((data) => {
      setProjects(Array.isArray(data) ? data : []);
    });
  }, []);

  React.useEffect(() => {
    if (projectId) setSelectedProjectIdLocal(projectId);
  }, [projectId]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDefect, setEditingDefect] = useState<FilteredDefect | null>(null);
  const [formData, setFormData] = useState<Partial<FilteredDefect>>({
    defectId: '',
    description: '',
    projectId: selectedProjectId ? Number(selectedProjectId) : 0,
    severityId: 0,
    priorityId: 0,
    defectStatusId: 0,
    typeId: 0,
    id: null,
    reOpenCount: 0,
    attachment: null,
    steps: '',
    subModuleId: 0,
    releaseTestCaseId: null,
    assignbyId: 0,
    assigntoId: 0,
    moduleId: 0,
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
    releaseId: "",
    assignedTo: "",
    reportedBy: "",
    search: "",
  });

  // Fetch lookup data on mount or project change
  React.useEffect(() => {
    if (!selectedProjectId) return;
    // Fetch all lookup data in parallel
    Promise.all([
      getAllDefectStatuses(),
      getSeverities(),
      getAllPriorities(),
      getDefectTypes(),
      getModulesByProjectId(selectedProjectId),
    ]).then(([statuses, severities, priorities, types, modules]) => {
      setStatusMap(Object.fromEntries((statuses.data || []).map((s: any) => [s.id, s.defectStatusName])));
      setSeverityMap(Object.fromEntries((severities.data || []).map((s: any) => [s.id, s.name])));
      setPriorityMap(Object.fromEntries((priorities.data || []).map((p: any) => [p.id, p.priority])));
      setTypeMap(Object.fromEntries((types.data || []).map((t: any) => [t.id, t.defectTypeName])));
      setModuleMap(Object.fromEntries((modules.data || []).map((m: any) => [m.id, m.moduleName])));
      // For submodules, fetch all for each module
      Promise.all((modules.data || []).map((m: any) => getSubmodulesByModuleId(m.id))).then((submoduleResults) => {
        const subMap: Record<string, string> = {};
        submoduleResults.forEach((res) => {
          (res.data || []).forEach((sm: any) => {
            subMap[String(sm.subModuleId)] = sm.subModuleName;
          });
        });
        setSubmoduleMap(subMap);
      });
    });
  }, [selectedProjectId]);

  // Fetch defects when project changes
  React.useEffect(() => {
    if (!selectedProjectId) return;
    // Prepare backend-supported filters
    const backendFilters = {
      projectId: selectedProjectId,
      typeId: filters.type ? defectTypes.find(t => t.defectTypeName === filters.type)?.id : undefined,
      severityId: filters.severity ? severities.find(s => s.name === filters.severity)?.id : undefined,
      priorityId: filters.priority ? priorities.find(p => p.priority === filters.priority)?.id : undefined,
      defectStatusId: filters.status ? defectStatuses.find(s => s.defectStatusName === filters.status)?.id : undefined,
      releaseTestCaseId: filters.releaseId ? Number(filters.releaseId) : undefined,
    };
    filterDefects(backendFilters).then(setBackendDefects);
  }, [selectedProjectId, filters.type, filters.severity, filters.priority, filters.status, filters.releaseId]);

  // Filtered defects based on filters
  const filteredDefects = backendDefects.filter((d) => {
    const search = filters.search.trim().toLowerCase();
    const matchesSearch =
      !search ||
      (d.description && d.description.toLowerCase().includes(search)) ||
      (d.defectId && d.defectId.toLowerCase().includes(search)) ||
      (d.steps && d.steps.toLowerCase().includes(search));
    return (
      matchesSearch &&
      (!filters.module || moduleMap[d.moduleId] === filters.module) &&
      (!filters.subModule || submoduleMap[String(d.subModuleId)] === filters.subModule) &&
      (!filters.type || typeMap[d.typeId] === filters.type) &&
      (!filters.severity || severityMap[d.severityId] === filters.severity) &&
      (!filters.priority || priorityMap[d.priorityId] === filters.priority) &&
      (!filters.status || statusMap[d.defectStatusId] === filters.status)
    );
  });

  // Project selection handler
  const handleProjectSelect = (id: string) => {
    setSelectedProjectIdLocal(id);
    setSelectedProjectId?.(id); // If provided by context
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
      const newHistory: DefectHistoryEntry[] = [
        ...(editingDefect.defectHistory || []),
        {
          status: formData.status as FilteredDefect["status"],
          changedAt: now,
          comment: formData.status === "rejected" ? formData.rejectionComment : undefined,
        },
      ];
      updateDefect({
        ...editingDefect,
        ...formData,
        projectId: projectId || "",
        id: editingDefect.id,
        createdAt: editingDefect.createdAt,
        updatedAt: now,
        defectHistory: newHistory,
      });
    } else {
      const now = new Date().toISOString();
      const newDefect: FilteredDefect = {
        ...formData,
        projectId: projectId || "",
        id: getNextDefectId(),
        createdAt: now,
        updatedAt: now,
        status: "new",
        reportedBy: formData.reportedBy || "",
        title: formData.title || "",
        description: formData.description || "",
        module: formData.module || "",
        subModule: formData.subModule || "",
        type: formData.type as any || "bug",
        priority: formData.priority as any || "medium",
        severity: formData.severity as any || "medium",
      };
      addDefect(newDefect);
    }
    resetForm();
  };
  const handleEdit = (defect: FilteredDefect) => {
    setEditingDefect(defect);
    setFormData({
      defectId: defect.defectId,
      description: defect.description,
      projectId: defect.projectId,
      severityId: defect.severityId,
      priorityId: defect.priorityId,
      defectStatusId: defect.defectStatusId,
      typeId: defect.typeId,
      id: defect.id,
      reOpenCount: defect.reOpenCount,
      attachment: defect.attachment,
      steps: defect.steps,
      subModuleId: defect.subModuleId,
      releaseTestCaseId: defect.releaseTestCaseId,
      assignbyId: defect.assignbyId,
      assigntoId: defect.assigntoId,
      moduleId: defect.moduleId,
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
      defectId: '',
      description: '',
      projectId: selectedProjectId ? Number(selectedProjectId) : 0,
      severityId: 0,
      priorityId: 0,
      defectStatusId: 0,
      typeId: 0,
      id: null,
      reOpenCount: 0,
      attachment: null,
      steps: '',
      subModuleId: 0,
      releaseTestCaseId: null,
      assignbyId: 0,
      assigntoId: 0,
      moduleId: 0,
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

  // Add state for modules and submodules
  const [modules, setModules] = React.useState<{ id: string; name: string }[]>([]);
  const [submodules, setSubmodules] = React.useState<{ id: string; name: string }[]>([]);

  // Fetch modules when project changes
  React.useEffect(() => {
    if (!selectedProjectId) return;
    getModulesByProjectId(selectedProjectId).then((res) => {
      setModules((res.data || []).map((m: any) => ({ id: m.id?.toString(), name: m.moduleName })));
    });
  }, [selectedProjectId]);

  // Fetch submodules when module changes
  React.useEffect(() => {
    if (!formData.module) {
      setSubmodules([]);
      return;
    }
    // Find moduleId by name
    const selectedModule = modules.find((m) => m.name === formData.module);
    if (!selectedModule) {
      setSubmodules([]);
      return;
    }
    getSubmodulesByModuleId(selectedModule.id).then((res) => {
      setSubmodules((res.data || []).map((sm: any) => ({ id: sm.id?.toString(), name: sm.name })));
    });
  }, [formData.module, modules]);

  // For Assigned To and Entered By, use employees context
  const employeeOptions = employees.map(e => ({ id: e.id, name: `${e.firstName} ${e.lastName}` }));

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

  const [priorities, setPriorities] = useState<Priority[]>([]);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const [defectStatuses, setDefectStatuses] = useState<DefectStatus[]>([]);
  const [isStatusLoading, setIsStatusLoading] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);

  // Add state for severities and defect types
  const [severities, setSeverities] = useState<{ id: number; name: string; color: string }[]>([]);
  const [defectTypes, setDefectTypes] = useState<{ id: number; defectTypeName: string }[]>([]);

  // Fetch severities and defect types on mount
  React.useEffect(() => {
    getSeverities().then(res => setSeverities(res.data));
    getDefectTypes().then(res => setDefectTypes(res.data));
  }, []);

  // Fetch priorities from database
  React.useEffect(() => {
    const fetchPriorities = async () => {
      try {
        const response = await getAllPriorities();
        if (response.data) {
          setPriorities(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch priorities:", error);
      }
    };

    fetchPriorities();
  }, []);

  React.useEffect(() => {
    const fetchStatuses = async () => {
      setIsStatusLoading(true);
      setStatusError(null);
      try {
        const response = await getAllDefectStatuses();
        if (response && response.data) {
          setDefectStatuses(response.data);
        } else {
          setDefectStatuses([]);
        }
      } catch (err: any) {
        setStatusError(err.message || "Failed to fetch statuses");
        setDefectStatuses([]);
      } finally {
        setIsStatusLoading(false);
      }
    };
    fetchStatuses();
  }, []);

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

  const employeeMap = React.useMemo(() => Object.fromEntries(employees.map(e => [Number(e.id), `${e.firstName} ${e.lastName}`])), [employees]);
  const releaseMap = React.useMemo(() => Object.fromEntries(releases.map(r => [Number(r.id), r.name])), [releases]);

  const handleStatusSave = (defect, newStatus, comment) => {
    const now = new Date().toISOString();
    let initialHistory = defect.defectHistory || [];
    if (!initialHistory.length) {
      initialHistory = [{
        status: 'new',
        changedAt: defect.createdAt || now,
        comment: undefined,
      }];
    }
    setBackendDefects(prev =>
      prev.map(d =>
        d.defectId === defect.defectId
          ? {
            ...d,
            defectStatusId: defectStatuses.find(s => s.defectStatusName === newStatus)?.id || d.defectStatusId,
            defectHistory: [
              ...initialHistory,
              {
                status: newStatus,
                changedAt: now,
                comment: newStatus === 'rejected' ? comment : undefined,
              },
            ],
            updatedAt: now,
          }
          : d
      )
    );
    setEditingStatusId(null);
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Project Selection Panel */}
      <ProjectSelector
        projects={projects}
        selectedProjectId={selectedProjectId}
        onSelect={handleProjectSelect}
      />

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
          <div className="min-w-[160px] flex-shrink-0">
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Search
            </label>
            <Input
              placeholder="Search..."
              value={filters.search}
              onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
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
              {modules.map((m) => (
                <option key={m.id} value={m.name}>
                  {m.name}
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
              {submodules.map((sm) => (
                <option key={sm.id} value={sm.name}>
                  {sm.name}
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
              {defectTypes.map((t) => (
                <option key={t.id} value={t.defectTypeName}>{t.defectTypeName}</option>
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
              {severities.map((s) => (
                <option key={s.id} value={s.name}>{s.name}</option>
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
              {priorities.map((priority) => (
                <option key={priority.id} value={priority.priority}>
                  {priority.priority}
                </option>
              ))}
            </select>
          </div>
          <div className="min-w-[140px] flex-shrink-0">
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Release
            </label>
            <select
              value={filters.releaseId}
              onChange={e => setFilters(f => ({ ...f, releaseId: e.target.value }))}
              className="w-full h-8 text-xs border border-gray-300 rounded"
            >
              <option value="">All</option>
              {releases
                .filter(r => r.projectId === projectId)
                .map(r => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
            </select>
          </div>
          <div className="min-w-[120px] flex-shrink-0">
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
              className="w-full h-8 text-xs border border-gray-300 rounded"
              disabled={isStatusLoading || !!statusError}
            >
              <option value="">All</option>
              {isStatusLoading ? (
                <option disabled>Loading...</option>
              ) : statusError ? (
                <option disabled>Error loading statuses</option>
              ) : (
                defectStatuses.map((s) => (
                  <option key={s.id} value={s.defectStatusName}>{s.defectStatusName}</option>
                ))
              )}
            </select>
          </div>
          <div className="min-w-[140px] flex-shrink-0">
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Assigned To
            </label>
            <select
              value={filters.assignedTo}
              onChange={e => setFilters(f => ({ ...f, assignedTo: e.target.value }))}
              className="w-full h-8 text-xs border border-gray-300 rounded"
            >
              <option value="">All</option>
              {employeeOptions.map((user) => (
                <option key={user.id} value={user.name}>{user.name}</option>
              ))}
            </select>
          </div>
          <div className="min-w-[140px] flex-shrink-0">
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Entered By
            </label>
            <select
              value={filters.reportedBy}
              onChange={e => setFilters(f => ({ ...f, reportedBy: e.target.value }))}
              className="w-full h-8 text-xs border border-gray-300 rounded"
            >
              <option value="">All</option>
              {employeeOptions.map((user) => (
                <option key={user.id} value={user.name}>{user.name}</option>
              ))}
            </select>
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
              <tbody className="divide-y divide-gray-200">
                {filteredDefects.length > 0 ? (
                  filteredDefects.map((defect) => (
                    <tr
                      key={defect.defectId}
                      ref={
                        highlightId === defect.defectId
                          ? highlightedRowRef
                          : undefined
                      }
                      className={`${highlightId === defect.defectId ? "  border-2 " : ""}`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {defect.defectId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {defect.releaseTestCaseId || "-"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {defect.description}
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
                        {moduleMap[defect.moduleId] || defect.moduleId}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {submoduleMap[defect.subModuleId] || defect.subModuleId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {typeMap[defect.typeId] || defect.typeId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(severityMap[defect.severityId] || "")}`}
                        >
                          {severityMap[defect.severityId] || defect.severityId}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(priorityMap[defect.priorityId] || "")}`}
                        >
                          {priorityMap[defect.priorityId] || defect.priorityId}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap w-32">
                        <div className="flex flex-col items-center gap-1">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(statusMap[defect.defectStatusId] || "")}`}>{statusMap[defect.defectStatusId] || defect.defectStatusId}</span>
                          {editingStatusId === defect.defectId ? (
                            <form
                              onSubmit={e => {
                                e.preventDefault();
                                if (statusEditValue === 'rejected' && !statusEditComment) return;
                                handleStatusSave(defect, statusEditValue, statusEditComment);
                              }}
                              className="flex flex-col items-center gap-1 mt-2"
                            >
                              <select
                                value={statusEditValue}
                                onChange={e => setStatusEditValue(e.target.value)}
                                className="w-28 px-2 py-1 border border-gray-300 rounded"
                                disabled={isStatusLoading || !!statusError}
                              >
                                {isStatusLoading ? (
                                  <option disabled>Loading...</option>
                                ) : statusError ? (
                                  <option disabled>Error loading statuses</option>
                                ) : (
                                  defectStatuses.map((s) => (
                                    <option key={s.id} value={s.defectStatusName}>{s.defectStatusName}</option>
                                  ))
                                )}
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
                            <button
                              type="button"
                              className="text-blue-600 hover:text-blue-900 p-1 mt-1"
                              title="Edit status"
                              onClick={() => {
                                setEditingStatusId(defect.defectId);
                                setStatusEditValue(statusMap[defect.defectStatusId] || '');
                                setStatusEditComment('');
                              }}
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
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
                        {employeeMap[defect.assigntoId] || defect.assigntoId || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {employeeMap[defect.assignbyId] || defect.assignbyId || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {releaseMap[defect.releaseTestCaseId] || defect.releaseTestCaseId || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            className="text-blue-600 hover:text-blue-900 flex items-center"
                            title="View Defect Details"
                            onClick={() => {
                              setViewingSteps(
                                `ID: ${defect.id}\nTitle: ${defect.title}\nDescription: ${defect.description}\nModule: ${moduleMap[defect.moduleId] || defect.moduleId}\nSubmodule: ${submoduleMap[String(defect.subModuleId)] || defect.subModuleId}\nType: ${typeMap[defect.typeId] || defect.typeId}\nSeverity: ${severityMap[defect.severityId] || defect.severityId}\nPriority: ${priorityMap[defect.priorityId] || defect.priorityId}\nStatus: ${statusMap[defect.defectStatusId] || defect.defectStatusId}`
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
                {modules.map((module) => (
                  <option key={module.id} value={module.name}>
                    {module.name}
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
                {submodules.map((submodule) => (
                  <option key={submodule.id} value={submodule.name}>
                    {submodule.name}
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
                {severities.map((s) => (
                  <option key={s.id} value={s.name}>{s.name}</option>
                ))}
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
                {defectTypes.map((t) => (
                  <option key={t.id} value={t.defectTypeName}>{t.defectTypeName}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assigned To
              </label>
              <select
                value={formData.assignedTo}
                onChange={(e) => handleInputChange("assignedTo", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select assignee</option>
                {employeeOptions.map((user) => (
                  <option key={user.id} value={user.name}>
                    {user.name}
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
              {editingDefect ? "Save Changes" : "Submit"}
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
                const defect = backendDefects.find(d => d.id === editingStatusId) as FilteredDefect;
                if (!defect) return setIsRejectionCommentModalOpen(false);
                const now = new Date().toISOString();
                const newHistory: DefectHistoryEntry[] = [
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
