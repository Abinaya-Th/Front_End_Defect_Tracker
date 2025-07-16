import React, { useEffect, useState } from "react";
import { deleteDefectById } from '../api/defect/delete_defect';

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
  MessageCircle,
  MessageSquare,
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

import { updateDefectById } from '../api/defect/updateDefect';
import axios from "axios";
import { ProjectRelease, projectReleaseCardView } from "../api/releaseView/ProjectReleaseCardView";
import { addDefects } from "../api/defect/addNewDefect";
import { getDefectHistoryByDefectId, DefectHistoryEntry as RealDefectHistoryEntry } from '../api/defect/defectHistory';
import { getAllocatedUsersByModuleId } from '../api/module/getModule';
const BASE_URL = import.meta.env.VITE_BASE_URL;


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
  const [releasesData, setReleasesData] = useState<ProjectRelease[]>([]);
  const [formData, setFormData] = useState({
    defectId: '',
    id: '', // real numeric id
    description: '',
    steps: '',
    moduleId: '',
    subModuleId: '',
    severityId: '',
    priorityId: '',
    typeId: '',
    assigntoId: '',
    assignbyId: '',
    releaseId: '',
    attachment: '',
    statusId: '',
    testCaseId: '',
  });

  const [isViewStepsModalOpen, setIsViewStepsModalOpen] = useState(false);
  const [viewingSteps, setViewingSteps] = useState<string | null>(null);
  const [isViewDefectDetailsModalOpen, setIsViewDefectDetailsModalOpen] = useState(false);
  const [viewingDefectDetails, setViewingDefectDetails] = useState<any>(null);
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

  // Fetch static lookup data only once on mount
  React.useEffect(() => {
    getSeverities().then(res => setSeverityMap(Object.fromEntries((res.data || []).map((s: any) => [s.id, s.name]))));
    getAllPriorities().then(res => setPriorityMap(Object.fromEntries((res.data || []).map((p: any) => [p.id, p.priority]))));
    getDefectTypes().then(res => setTypeMap(Object.fromEntries((res.data || []).map((t: any) => [t.id, t.defectTypeName]))));
  }, []);

  // Fetch project-specific lookup data when selectedProjectId changes
  React.useEffect(() => {
    if (!selectedProjectId) return;
    getAllDefectStatuses().then((statuses) => {
      setStatusMap(Object.fromEntries((statuses.data || []).map((s: any) => [s.id, s.defectStatusName])));
    });
    getModulesByProjectId(selectedProjectId).then((modules) => {
      setModuleMap(Object.fromEntries((modules.data || []).map((m: any) => [m.id, m.moduleName])));
      // Fetch submodules for each module
      Promise.all((modules.data || []).map((m: any) => getSubmodulesByModuleId(m.id)))
        .then((submoduleResults) => {
          const subMap: Record<string, string> = {};
          submoduleResults.forEach((res) => {
            (res.data || []).forEach((sm: any) => {
              subMap[String(sm.id)] = sm.name;
            });
          });
          setSubmoduleMap(subMap);
        })
        .catch(() => setSubmoduleMap({}));
    });
  }, [selectedProjectId]);

  // Fetch defects when project changes or filters change
  const fetchData = () => {
    const hasFilters =
      filters.type ||
      filters.severity ||
      filters.priority ||
      filters.status ||
      filters.module ||
      filters.subModule;
    if (!hasFilters) {
      // No filters: use the new project endpoint
      axios
        .get(`http://34.171.115.156:8087/api/v1/defect/project/${selectedProjectId}`)
        .then((res) => {
          setBackendDefects(res.data.data || []);
        })
        .catch((err) => {
          setBackendDefects([]);
          // Only log the error once, not on every render
          if (err && backendDefects.length === 0) {
            console.error('Failed to fetch defects for project:', err.message);
          }
        });
    } else {
      // Filters applied: use the filter API
      const backendFilters = {
        projectId: Number(selectedProjectId),
        typeId: filters.type ? defectTypes && defectTypes.find(t => t.defectTypeName === filters.type)?.id : undefined,
        severityId: filters.severity ? severities && severities.find(s => s.name === filters.severity)?.id : undefined,
        priorityId: filters.priority ? priorities && priorities.find(p => p.priority === filters.priority)?.id : undefined,
        defectStatusId: filters.status ? defectStatuses && defectStatuses.find(s => s.defectStatusName === filters.status)?.id : undefined,
        releaseTestCaseId: filters.releaseId ? Number(filters.releaseId) : undefined,
      };
      filterDefects(backendFilters)
        .then(setBackendDefects)
        .catch(error => {
          // Only log the error once, not on every render
          if (error && backendDefects.length === 0) {
            console.error('Failed to filter defects:', error.message);
          }
          setBackendDefects([]);
        });
    }
  }

  React.useEffect(() => {
    if (!selectedProjectId) return;
    fetchData();
  }, [selectedProjectId, filters.type, filters.severity, filters.priority, filters.status, filters.module, filters.subModule, filters.releaseId]);

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
      (!filters.module || d.module_name === filters.module) &&
      (!filters.subModule || d.sub_module_name === filters.subModule) &&
      (!filters.type || d.defect_type_name === filters.type) &&
      (!filters.severity || d.severity_name === filters.severity) &&
      (!filters.priority || d.priority_name === filters.priority) &&
      (!filters.status || d.defect_status_name === filters.status)
    );
  });

  const fetchReleaseData = async (selectedProject: string | null) => {
    try {
      const response = await projectReleaseCardView(selectedProject);
      setReleasesData(response.data || []);
    } catch (error) {
      console.error("Failed to fetch releases:", error);
    }
  };

  useEffect(() => {
    fetchReleaseData(selectedProjectId);
  }, [selectedProjectId]);

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

  const defectAdd = async () => {
    // Removed userList validation - allow submission even without users
    // The API can handle null values for assigntoId

    const payload = {
      description: formData.description,
      severityId: Number(formData.severityId),
      priorityId: Number(formData.priorityId),
      typeId: Number(formData.typeId),
      assigntoId: Number(formData.assigntoId) || null, // Ensure number or null
      attachment: formData.attachment || undefined,
      assignbyId: Number(formData.assignbyId) || null, // Ensure number or null
      steps: formData.steps || undefined,
      projectId: Number(selectedProjectId),
      modulesId: Number(formData.moduleId),
      subModuleId: formData.subModuleId ? Number(formData.subModuleId) : null,
      defectStatusId: formData.statusId
        ? Number(formData.statusId)
        : (defectStatuses.find(s => s.defectStatusName.toLowerCase().startsWith("new"))?.id ?? null),
      reOpenCount: 0, // Default value as per API sample
      releaseId: formData.releaseId ? Number(formData.releaseId) : null, // <-- Ensure releaseId is always included
    };
    try {
      const response = await addDefects(payload as any);

      // Check for success - API returns "Success" (uppercase) or statusCode 2000
      if (response.status === "Success" || response.statusCode === 200) {
        // Handle successful defect addition
        alert("Defect added successfully!");
        fetchData();
        // Refresh the defects list
        if (selectedProjectId) {
          const backendFilters = {
            projectId: Number(selectedProjectId),
            typeId: filters.type ? (defectTypes && defectTypes.find(t => t.defectTypeName === filters.type)?.id ? Number(defectTypes.find(t => t.defectTypeName === filters.type)?.id) : undefined) : undefined,
            severityId: filters.severity ? (severities && severities.find(s => s.name === filters.severity)?.id ? Number(severities.find(s => s.name === filters.severity)?.id) : undefined) : undefined,
            priorityId: filters.priority ? (priorities && priorities.find(p => p.priority === filters.priority)?.id ? Number(priorities.find(p => p.priority === filters.priority)?.id) : undefined) : undefined,
            defectStatusId: filters.status ? (defectStatuses && defectStatuses.find(s => s.defectStatusName === filters.status)?.id ? Number(defectStatuses.find(s => s.defectStatusName === filters.status)?.id) : undefined) : undefined,
            releaseTestCaseId: filters.releaseId ? Number(filters.releaseId) : undefined,
            moduleId: filters.module ? (() => { const id = modules && modules.find(m => m.name === filters.module)?.id; return id !== undefined ? Number(id) : undefined; })() : undefined,
            subModuleId: filters.subModule ? (() => { const id = filterSubmodules && filterSubmodules.find(sm => sm.name === filters.subModule)?.id; return id !== undefined ? Number(id) : undefined; })() : undefined,
            assignToId: filters.assignedTo ? (userList && userList.find(u => `${u.firstName} ${u.lastName}` === filters.assignedTo)?.id ? Number(userList.find(u => `${u.firstName} ${u.lastName}` === filters.assignedTo)?.id) : undefined) : undefined,
            assignById: filters.reportedBy ? (userList && userList.find(u => `${u.firstName} ${u.lastName}` === filters.reportedBy)?.id ? Number(userList.find(u => `${u.firstName} ${u.lastName}` === filters.reportedBy)?.id) : undefined) : undefined,
          };
          filterDefects(backendFilters)
            .then(setBackendDefects)
            .catch(error => {
              // Only log the error once, not on every render
              if (error && backendDefects.length === 0) {
                console.error('Failed to filter defects:', error.message);
              }
              setBackendDefects([]);
            });
        }
        // Close modal and reset form
        resetForm();
      } else {
        // Handle error in defect addition
        console.error("Failed to add defect:", response.message);
        alert("Failed to add defect: " + response.message);
      }
    } catch (error) {
      console.error("Error adding defect:", error);
      alert("Error adding defect. Please try again.");
    }
  };

  // CRUD handlers
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.description.trim()) {
      alert('Please enter a description');
      return;
    }
    if (!formData.severityId) {
      alert('Please select a severity');
      return;
    }
    if (!formData.priorityId) {
      alert('Please select a priority');
      return;
    }
    if (!formData.typeId) {
      alert('Please select a type');
      return;
    }

    if (!formData.moduleId) {
      alert('Please select a module');
      return;
    }
    if (!formData.steps.trim()) {
      alert('Please enter steps to reproduce');
      return;
    }

    if (editingDefect) {
      // EDIT: Call updateDefectById with new API
      // console.log(formData);

      try {
        const defectIdForApi = Number(formData.id);
        // Use the new payload structure as per backend requirements
        const payload = {
          description: formData.description,
          projectId: Number(selectedProjectId),
          severityId: Number(formData.severityId),
          priorityId: Number(formData.priorityId),
          defectStatusId: formData.statusId ? Number(formData.statusId) : null, // can be null
          typeId: Number(formData.typeId),
          reOpenCount: editingDefect.reOpenCount || 0,
          attachment: formData.attachment || '',
          steps: formData.steps,
          releaseId: formData.releaseId ? Number(formData.releaseId) : null, // required
          assignbyId: formData.assignbyId ? Number(formData.assignbyId) : null, // can be null
          assigntoId: formData.assigntoId ? Number(formData.assigntoId) : null, // can be null
          modulesId: Number(formData.moduleId),
          subModuleId: formData.subModuleId ? Number(formData.subModuleId) : null,
        };
        const response = await updateDefectById(
          defectIdForApi,
          payload
        );
        if (response.status === 'Success' || response.statusCode === 2000) {
          alert('Defect updated successfully!');
          fetchData();
          resetForm();
        } else {
          alert('Failed to update defect: ' + (response.message || 'Unknown error'));
        }
      } catch (error: any) {
        if (error.response && error.response.data) {
          alert('Error updating defect: ' + JSON.stringify(error.response.data));
        } else {
          alert('Error updating defect: ' + (error?.message || error));
        }
      }
    } else {
      // ADD: Call defectAdd for new defect
      await defectAdd();
    }
  };
  const handleEdit = async (defect: FilteredDefect) => {
    // Map names to IDs for dropdowns
    const moduleId = modules.find(m => m.name === defect.module_name)?.id || '';
    const severityId = severities.find(s => s.name === defect.severity_name)?.id?.toString() || '';
    const priorityId = priorities.find(p => p.priority === defect.priority_name)?.id?.toString() || '';
    const typeId = defectTypes.find(t => t.defectTypeName === defect.defect_type_name)?.id?.toString() || '';
    const assigntoId = userList.find(u => `${u.firstName} ${u.lastName}` === defect.assigned_to_name)?.id?.toString() || '';
    const assignbyId = userList.find(u => `${u.firstName} ${u.lastName}` === defect.assigned_by_name)?.id?.toString() || '';
    const statusId = defectStatuses.find(s => s.defectStatusName === defect.defect_status_name)?.id?.toString() || '';
    const releaseId = releasesData.find(r => r.releaseName === defect.release_test_case_description)?.id?.toString() || '';
    const id = backendDefects.find(x => x.id === defect.id)?.id?.toString() || "";
    // console.log(id);
    // console.log('Editing defect:', {
    //   defectReleaseDesc: defect.release_test_case_description,
    //   releasesData: releasesData.map(r => r.releaseName),
    //   foundReleaseId: releaseId
    // });


    setEditingDefect(defect);
    setFormData(prev => ({
      ...prev,
      id,
      defectId: defect.defectId || '',
      description: defect.description || '',
      steps: defect.steps || '',
      moduleId,
      subModuleId: '', // temporarily clear until submodules are loaded
      severityId,
      priorityId,
      typeId,
      assigntoId,
      assignbyId,
      releaseId,
      attachment: defect.attachment || '',
      statusId,
    }));
    setIsModalOpen(true);
    // Fetch submodules for the selected module, then set subModuleId
    if (moduleId) {
      try {
        const res = await getSubmodulesByModuleId(moduleId);
        const mapped = (res.data || []).map((sm: any) => ({
          id: sm.id?.toString() || sm.subModuleId?.toString(),
          name: sm.name || sm.subModuleName
        }));
        setSubmodules(mapped);
        const subModuleId = mapped.find(sm => sm.name === defect.sub_module_name)?.id || '';
        setFormData(prev => ({ ...prev, subModuleId }));
      } catch (err) {
        setSubmodules([]);
        setFormData(prev => ({ ...prev, subModuleId: '' }));
      }
    }
  };
  const handleDelete = async (defectId: string) => {
    if (window.confirm("Are you sure you want to delete this defect?")) {
      try {
        // Find the defect to get its numeric ID for the API
        const defect = backendDefects.find(d => d.defectId === defectId);
        if (!defect) {
          alert("Defect not found.");
          return;
        }

        // Call the delete API with the numeric ID
        const response = await deleteDefectById(defect.id.toString());

        // Handle successful deletion
        if (response.status === 'Success' || response.statusCode === 2000) {
          // Filter out the deleted defect from the backendDefects state
          setBackendDefects(prevDefects => prevDefects.filter(d => d.defectId !== defectId));
          alert("Defect deleted successfully.");
        } else {
          console.error("Delete failed:", response.message);
          alert("Delete failed. Please try again.");
        }
      } catch (error: any) {
        console.error("Error occurred while deleting defect:", error);
        alert("Error: " + (error.message || 'Failed to delete defect'));
      }
    }
  };


  const resetForm = () => {
    setFormData({
      defectId: '',
      id: '', // real numeric id
      description: '',
      steps: '',
      moduleId: '',
      subModuleId: '',
      severityId: '',
      priorityId: '',
      typeId: '',
      assigntoId: '',
      assignbyId: '',
      releaseId: '',
      attachment: '',
      statusId: '',
      testCaseId: '',
    });
    setEditingDefect(null);
    setIsModalOpen(false);
  };
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
  const [submoduleError, setSubmoduleError] = React.useState<string>("");

  // Separate state for filter submodules
  const [filterSubmodules, setFilterSubmodules] = React.useState<{ id: string; name: string }[]>([]);

  // Fetch modules when project changes
  React.useEffect(() => {
    if (!selectedProjectId) return;
    getModulesByProjectId(selectedProjectId)
      .then((res) => {
        setModules((res.data || []).map((m: any) => ({ id: m.id?.toString(), name: m.moduleName })));
      })
      .catch(error => {
        console.error('Failed to fetch modules:', error.message);
        setModules([]);
      });
  }, [selectedProjectId]);

  // Fetch submodules when module changes in the form
  React.useEffect(() => {
    if (!formData.moduleId) {
      setSubmodules([]);
      setFormData(f => ({ ...f, subModuleId: '' }));
      return;
    }
    getSubmodulesByModuleId(formData.moduleId)
      .then(res => {
        const mapped = (res.data || []).map((sm: any) => ({
          id: sm.id?.toString() || sm.subModuleId?.toString(),
          name: sm.name || sm.subModuleName
        }));
        setSubmodules(mapped);
      })
      .catch((err) => {
        // Only log the error once, not on every render
        if (err && !submodules.length) {
          console.error('Failed to fetch submodules:', err.message);
        }
        setSubmodules([]);
      });
  }, [formData.moduleId]);

  // Fetch submodules for filter when module filter changes
  React.useEffect(() => {
    if (!filters.module) {
      setFilterSubmodules([]);
      return;
    }
    const selectedModule = modules && modules.find(m => m.name === filters.module);
    if (!selectedModule || !selectedModule.id) {
      setFilterSubmodules([]);
      return;
    }
    getSubmodulesByModuleId(selectedModule.id)
      .then(res => {
        const mapped = (res.data || []).map((sm: any) => ({
          id: sm.id?.toString() || sm.subModuleId?.toString(),
          name: sm.name || sm.subModuleName
        }));
        setFilterSubmodules(mapped);
      })
      .catch(() => setFilterSubmodules([]));
  }, [filters.module, modules]);

  // For Assigned To and Entered By, use employees context
  // Remove mock/fallback employeeOptions; only use userList from backend

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
  const [viewingDefectHistory, setViewingDefectHistory] = useState<RealDefectHistoryEntry[]>([]);
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

  // Fetch severities and defect types on mount (only once)
  React.useEffect(() => {
    getSeverities()
      .then(res => setSeverities(res.data))
      .catch(error => {
        console.error('Failed to fetch severities:', error.message);
        setSeverities([]);
      });
    getDefectTypes()
      .then(res => setDefectTypes(res.data))
      .catch(error => {
        console.error('Failed to fetch defect types:', error.message);
        setDefectTypes([]);
      });
    getAllPriorities()
      .then(res => setPriorities(res.data || []))
      .catch(error => {
        console.error("Failed to fetch priorities:", error);
        setPriorities([]);
      });
    getAllDefectStatuses()
      .then(res => {
        setDefectStatuses(res.data || []);
        setIsStatusLoading(false);
      })
      .catch(err => {
        setStatusError(err.message || "Failed to fetch statuses");
        setDefectStatuses([]);
        setIsStatusLoading(false);
      });
  }, []); // Only run once on mount

  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!selectedProjectId) {
      alert("Please select a project before importing defects.");
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await axios.post(
        `${BASE_URL}defect/import/${selectedProjectId}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
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
  // Add exportDefects function
  const exportDefects = async () => {
    if (!selectedProjectId) {
      alert("Please select a project before exporting defects.");
      return;
    }
    try {
      const response = await axios.get(
        `${BASE_URL}defect/export/${selectedProjectId}`,
        {
          responseType: "blob",
        }
      );
      // Create a link to download the file
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      // Try to get filename from content-disposition header, fallback to defects_export.csv
      const contentDisposition = response.headers["content-disposition"];
      let fileName = "defects_export.csv";
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?([^";]+)"?/);
        if (match && match[1]) fileName = match[1];
      }
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert("Failed to export defects. Please try again.");
    }
  };

  // Update handleExportExcel to use exportDefects
  const handleExportExcel = () => {
    exportDefects();
  };

  const releaseMap = React.useMemo(() => Object.fromEntries(releases.map(r => [Number(r.id), r.name])), [releases]);

  const handleStatusSave = (defect: FilteredDefect, newStatus: string, comment: string) => {
    const now = new Date().toISOString();
    setBackendDefects(prev =>
      prev.map(d =>
        d.defectId === defect.defectId
          ? {
            ...d,
            defect_status_name: newStatus,
          }
          : d
      )
    );
    setEditingStatusId(null);
  };

  // Add state for users for 'Assigned To' and 'Entered By'
  const [userList, setUserList] = React.useState<{ id: number; firstName: string; lastName: string }[]>([]);

  // Fetch users for 'Assigned To' and 'Entered By' on mount
  React.useEffect(() => {
    setIsUsersLoading(true);

    // Try the correct API endpoint based on your PowerShell test
    const userApiUrl = 'http://34.171.115.156:8087/api/v1/user';

    axios.get(userApiUrl).then(res => {
      if (res.data && Array.isArray(res.data.data)) {
        setUserList(res.data.data.map((u: any) => ({ id: u.id, firstName: u.firstName, lastName: u.lastName })));
      } else {
        console.warn('No users found or invalid response format');
        setUserList([]);
      }
    }).catch(error => {
      // Only log the error once, not on every render
      if (error && userList.length === 0) {
        console.error('Failed to fetch users:', error.message);
      }
      setUserList([]);
    }).finally(() => {
      setIsUsersLoading(false);
    });
  }, []);

  // Compute releases for the selected project, with mock fallback
  let projectReleases = selectedProjectId ? releases.filter(r => r.projectId === selectedProjectId) : [];
  if (projectReleases.length === 0 && selectedProjectId) {
    projectReleases = [
      { id: 'REL-001', name: 'Release 1.0', projectId: selectedProjectId, status: 'planned', version: '1.0', description: '', Testcase: [], features: [], bugFixes: [], createdAt: new Date().toISOString() },
      { id: 'REL-002', name: 'Release 2.0', projectId: selectedProjectId, status: 'planned', version: '2.0', description: '', Testcase: [], features: [], bugFixes: [], createdAt: new Date().toISOString() },
    ];
  }

  // Add state for loading and error
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [isUsersLoading, setIsUsersLoading] = useState(true);

  // Update handler to fetch real defect history
  const handleOpenDefectHistory = async (defectId: string) => {
    setIsHistoryModalOpen(true);
    setIsHistoryLoading(true);
    setHistoryError(null);
    try {
      // Extract numeric part from defectId (e.g., DF00002 -> 2)
      const numericIdMatch = defectId.match(/(\d+)$/);
      const numericId = numericIdMatch ? parseInt(numericIdMatch[1], 10) : defectId;
      const data = await getDefectHistoryByDefectId(numericId);
      setViewingDefectHistory(data);
    } catch (err: any) {
      setViewingDefectHistory([]);
      setHistoryError(err.message || 'Failed to fetch defect history');
    } finally {
      setIsHistoryLoading(false);
    }
  };

  // Add state for comments by defect
  const [commentsByDefectId, setCommentsByDefectId] = useState<Record<string, { text: string; timestamp: string }[]>>({});
  const [isCommentsModalOpen, setIsCommentsModalOpen] = useState(false);
  const [activeCommentsDefectId, setActiveCommentsDefectId] = useState<string | null>(null);
  const [newCommentText, setNewCommentText] = useState('');

  const handleOpenCommentsModal = (defectId: string) => {
    setActiveCommentsDefectId(defectId);
    setIsCommentsModalOpen(true);
    setNewCommentText('');
  };

  const handleAddComment = () => {
    if (activeCommentsDefectId && newCommentText.trim()) {
      setCommentsByDefectId(prev => {
        const prevComments = prev[activeCommentsDefectId] || [];
        return {
          ...prev,
          [activeCommentsDefectId]: [
            ...prevComments,
            { text: newCommentText, timestamp: new Date().toISOString() },
          ],
        };
      });
      setNewCommentText('');
    }
  };

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const defectsPerPage = 10;
  const totalPages = Math.ceil(filteredDefects.length / defectsPerPage);

  // Reset to page 1 when filters or project change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedProjectId, filters]);

  // Paginated defects
  const paginatedDefects = filteredDefects.slice(
    (currentPage - 1) * defectsPerPage,
    currentPage * defectsPerPage
  );

  // Add state for allocated users for the selected module
  const [allocatedUsers, setAllocatedUsers] = useState<{ userId: number; userName: string }[]>([]);
  const [isAllocatedUsersLoading, setIsAllocatedUsersLoading] = useState(false);

  // Fetch allocated users when moduleId changes in the form
  useEffect(() => {
    if (!formData.moduleId) {
      setAllocatedUsers([]);
      return;
    }
    setIsAllocatedUsersLoading(true);
    getAllocatedUsersByModuleId(formData.moduleId)
      .then((data) => {
        // The API returns an array of allocations, may have duplicate users for submodules
        // We'll deduplicate by userId
        const uniqueUsers: { [id: number]: string } = {};
        (Array.isArray(data) ? data : []).forEach((item: any) => {
          if (item.userId && item.userName) {
            uniqueUsers[item.userId] = item.userName;
          }
        });
        setAllocatedUsers(Object.entries(uniqueUsers).map(([userId, userName]) => ({ userId: Number(userId), userName })));
      })
      .catch(() => setAllocatedUsers([]))
      .finally(() => setIsAllocatedUsersLoading(false));
  }, [formData.moduleId]);

  return (
    <div className="max-w-6xl mx-auto">

      {/* Project Selection Panel */}
      <ProjectSelector
        projects={projects}
        selectedProjectId={selectedProjectId}
        onSelect={handleProjectSelect}
      />

      {/* Defect Severity Breakdown (copied from Dashboard) */}
      <div className="mb-8 mt-4">
        <div className="flex items-center mb-3 gap-4">
          <h2 className="text-lg font-semibold text-gray-700">Defect Severity Breakdown</h2>
          <span className="text-base font-medium text-gray-500">(Total Defects : {filteredDefects.length})</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {['high', 'medium', 'low'].map(severity => {
            const severityLabel = `Defects on ${severity.charAt(0).toUpperCase() + severity.slice(1)}`;
            const colorMap = {
              critical: 'border-l-4 border-pink-600',
              high: 'border-l-4 border-red-500',
              medium: 'border-l-4 border-yellow-400',
              low: 'border-l-4 border-green-500',
            };
            const titleColor = {
              critical: 'text-pink-600',
              high: 'text-red-500',
              medium: 'text-yellow-500',
              low: 'text-green-500',
            };
            const borderColor = {
              critical: 'border-pink-200',
              high: 'border-red-200',
              medium: 'border-yellow-200',
              low: 'border-green-200',
            };
            const statusList = defectStatuses.map(s => s.defectStatusName);
            const statusColorMap = Object.fromEntries(defectStatuses.map(s => [s.defectStatusName, s.color || '#ccc']));
            const defectsBySeverity = filteredDefects.filter(d => (d.severity_name || '').toLowerCase() === severity);
            const total = defectsBySeverity.length;
            // Count by status
            const statusCounts = statusList.map(status =>
              defectsBySeverity.filter(d => (d.defect_status_name || '').toLowerCase() === status.toLowerCase()).length
            );
            // Split status legend into two columns
            const half = Math.ceil(statusList.length / 2);
            const leftStatuses = statusList.slice(0, half);
            const rightStatuses = statusList.slice(half);
            return (
              <div
                key={severity}
                className={`bg-white rounded-xl shadow flex flex-col justify-between min-h-[200px] border ${borderColor[severity]} ${colorMap[severity]}`}
              >
                <div className="flex items-center justify-between px-6 pt-4 pb-1">
                  <span className={`font-semibold text-base ${titleColor[severity]}`}>{severityLabel}</span>
                  <span className="font-semibold text-gray-600 text-base">Total: {total}</span>
                </div>
                <div className="flex flex-row gap-8 px-6 pb-1">
                  <div className="flex flex-col gap-1">
                    {leftStatuses.map((status, idx) => (
                      <div key={status} className="flex items-center gap-2 text-xs">
                        <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ backgroundColor: statusColorMap[status] }}></span>
                        <span className="text-gray-700 font-normal">{status}</span>
                        <span className="text-gray-700 font-medium">{statusCounts[idx]}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-col gap-1">
                    {rightStatuses.map((status, idx) => (
                      <div key={status} className="flex items-center gap-2 text-xs">
                        <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ backgroundColor: statusColorMap[status] }}></span>
                        <span className="text-gray-700 font-normal">{status}</span>
                        <span className="text-gray-700 font-medium">{statusCounts[half + idx]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

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
              onChange={e => setFilters(f => ({ ...f, subModule: e.target.value }))}
              className="w-full h-8 text-xs border border-gray-300 rounded"
              disabled={!filters.module}
            >
              <option value="">All</option>
              {filterSubmodules.map(sm => (
                <option key={sm.id} value={sm.name}>{sm.name}</option>
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
              {[...new Set(backendDefects.map(d => (d as any).releaseId).filter(Boolean))].map(id => (
                <option key={id} value={id}>{releaseMap[id] || id}</option>
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
              {userList.map((user) => (
                <option key={user.id} value={`${user.firstName} ${user.lastName}`}>{user.firstName} {user.lastName}</option>
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
              {userList.map((user) => (
                <option key={user.id} value={`${user.firstName} ${user.lastName}`}>{user.firstName} {user.lastName}</option>
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
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 z-20 bg-gray-50" style={{ minWidth: 120 }}>
                    Defect ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-[120px] z-20 bg-gray-50" style={{ minWidth: 220 }}>
                    Brief Description
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Steps
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Attachment
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
                  paginatedDefects.map((defect) => (
                    <tr
                      key={defect.defectId}
                      ref={
                        highlightId === defect.defectId
                          ? highlightedRowRef
                          : undefined
                      }
                      className={`${highlightId === defect.defectId ? "  border-2 " : ""}`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 sticky left-0 z-10 bg-white border-r border-gray-200" style={{ minWidth: 120 }}>
                        {defect.defectId}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 sticky left-[120px] z-10 bg-white border-r border-gray-200" style={{ minWidth: 220 }}>
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
                        {defect.attachment ? (
                          <a
                            href={defect.attachment}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 underline"
                          >
                            View Attachment
                          </a>
                        ) : (
                          <span className="text-gray-400">No attachment</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {defect.module_name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {defect.sub_module_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {defect.defect_type_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor((defect.severity_name || '').toLowerCase())}`}>
                          {defect.severity_name || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor((defect.priority_name || '').toLowerCase())}`}>
                          {defect.priority_name || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap w-32">
                        <div className="flex flex-col items-center gap-1">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor((defect.defect_status_name || '').toLowerCase())}`}>
                            {defect.defect_status_name || '-'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                        <button
                          type="button"
                          className="text-blue-600 hover:text-blue-900 p-1"
                          title="View defect history"
                          onClick={() => handleOpenDefectHistory(defect.defectId)}
                        >
                          <History className="h-5 w-5 inline" />
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {defect.assigned_to_name || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {defect.assigned_by_name || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {((defect as any).release_name?.toString() || releaseMap[(defect as any).releaseId || ''] || '-')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            className="text-blue-600 hover:text-blue-900 flex items-center"
                            title="View Defect Details"
                            onClick={() => {
                              setViewingDefectDetails({
                                defectId: defect.defectId,
                                description: defect.description,
                                steps: defect.steps,
                                module: defect.module_name,
                                submodule: defect.sub_module_name,
                                type: defect.defect_type_name,
                                severity: defect.severity_name,
                                priority: defect.priority_name,
                                status: defect.defect_status_name,
                                assignedTo: defect.assigned_to_name,
                                enteredBy: defect.assigned_by_name,
                                release: (defect as any).release_name?.toString() || releaseMap[(defect as any).releaseId || ''] || '-',
                                attachment: defect.attachment
                              });
                              setIsViewDefectDetailsModalOpen(true);
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
                            onClick={() => handleDelete(defect.defectId)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            className="relative text-blue-600 hover:text-blue-800 flex items-center"
                            title="Comments"
                            onClick={() => handleOpenCommentsModal(defect.defectId)}
                          >
                            <MessageSquare className="w-5 h-5" />
                            {commentsByDefectId[defect.defectId]?.length > 0 && (
                              <span className="absolute -top-1 -right-2 bg-blue-500 text-white text-xs rounded-full px-1">
                                {commentsByDefectId[defect.defectId].length}
                              </span>
                            )}
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
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 py-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              {/* Page number range */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => {
                // Show first, last, current, and neighbors; collapse others with ...
                const isCurrent = pageNum === currentPage;
                const isEdge = pageNum === 1 || pageNum === totalPages;
                const isNear = Math.abs(pageNum - currentPage) <= 1;
                if (isEdge || isNear) {
                  return (
                    <button
                      key={pageNum}
                      className={`px-2 py-1 rounded text-sm font-medium ${isCurrent ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-blue-100'}`}
                      onClick={() => setCurrentPage(pageNum)}
                      disabled={isCurrent}
                      style={{ minWidth: 32 }}
                    >
                      {pageNum}
                    </button>
                  );
                }
                // Show ... after first and before last if needed
                if (pageNum === 2 && currentPage > 3) {
                  return <span key="start-ellipsis" className="px-2">...</span>;
                }
                if (pageNum === totalPages - 1 && currentPage < totalPages - 2) {
                  return <span key="end-ellipsis" className="px-2">...</span>;
                }
                return null;
              })}
              <Button
                type="button"
                variant="secondary"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
              {/* Page number input */}
              <span className="ml-4 text-sm text-gray-700">Go to</span>
              <input
                type="number"
                min={1}
                max={totalPages}
                value={currentPage}
                onChange={e => {
                  let val = Number(e.target.value);
                  if (isNaN(val)) val = 1;
                  if (val < 1) val = 1;
                  if (val > totalPages) val = totalPages;
                  setCurrentPage(val);
                }}
                className="w-16 px-2 py-1 border border-gray-300 rounded text-center mx-1 text-sm"
                style={{ minWidth: 48 }}
              />
              <span className="text-sm text-gray-700">/ {totalPages}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal for Add/Edit Defect */}
      <Modal
        isOpen={isModalOpen}
        onClose={resetForm}
        title={editingDefect ? "Edit Defect" : "Add New Defect"}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Brief Description */}
          <Input
            label="Brief Description"
            value={formData.description}
            onChange={e => handleInputChange("description", e.target.value)}
            required
          />
          {/* Steps */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Steps
            </label>
            <textarea
              value={formData.steps}
              onChange={e => handleInputChange("steps", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              required
            />
          </div>
          {/* Attachment URL */}
          <Input
            label="Attachment URL"
            value={formData.attachment || ''}
            onChange={e => handleInputChange('attachment', e.target.value)}
            placeholder="Paste attachment URL here"
          />
          {/* Modules and Submodules */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Modules
              </label>
              <select
                value={formData.moduleId}
                onChange={e => setFormData(f => ({ ...f, moduleId: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select a module</option>
                {modules.map(module => (
                  <option key={module.id} value={module.id}>{module.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Submodules
              </label>
              {submoduleError && (
                <div className="mb-2 text-red-600 text-sm">{submoduleError}</div>
              )}
              <select
                value={formData.subModuleId}
                onChange={e => setFormData(f => ({ ...f, subModuleId: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={!formData.moduleId}
              >
                <option value="">
                  {submodules.length === 0
                    ? "No submodules"
                    : "Select a submodule "}
                </option>
                {submodules.map((submodule) => (
                  <option key={submodule.id} value={submodule.id}>
                    {submodule.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {/* Severity, Priority, Type, Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <select
                value={formData.typeId}
                onChange={e => handleInputChange('typeId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              //nilux
              >
                <option value="">Select type</option>
                {defectTypes.map((t) => (
                  <option key={t.id} value={t.id}>{t.defectTypeName}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Severity
              </label>
              <select
                value={formData.severityId}
                onChange={e => handleInputChange('severityId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select severity</option>
                {severities.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            {/* Found in Release and Priority side by side */}




            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Found in Release
              </label>
              {editingDefect ? (
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                  value={
                    releasesData.find(r => r.id === String(formData.releaseId))?.releaseName ||
                    (editingDefect as any).release_name?.toString() ||
                    '-'
                  }
                  readOnly
                  disabled
                />
              ) : (
                <select
                  value={formData.releaseId}
                  onChange={e => handleInputChange('releaseId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select release</option>
                  {releasesData.map(release => (
                    <option key={release.id} value={release.id}>{release.releaseName}</option>
                  ))}
                </select>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                value={formData.priorityId}
                onChange={e => handleInputChange('priorityId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select priority</option>
                {priorities.map(p => (
                  <option key={p.id} value={p.id.toString()}>{p.priority}</option>
                ))}
              </select>
            </div>
            {/* Assigned To for Add Defect */}
            {!editingDefect && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assigned To
                </label>
                <select
                  value={formData.assigntoId}
                  onChange={e => handleInputChange('assigntoId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={isAllocatedUsersLoading || !formData.moduleId}
                >
                  <option value="">
                    {isAllocatedUsersLoading ? "Loading users..." : allocatedUsers.length === 0 ? " available users for this module" : "Select assignee"}
                  </option>
                  {allocatedUsers.map(user => (
                    <option key={user.userId} value={user.userId.toString()}>{user.userName}</option>
                  ))}
                </select>
              </div>
            )}
            {editingDefect && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.statusId || ''}
                    onChange={e => handleInputChange('statusId', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select status</option>
                    {defectStatuses.map((s) => (
                      <option key={s.id} value={s.id}>{s.defectStatusName}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reassign
                  </label>
                  <select
                    value={formData.assigntoId}
                    onChange={e => handleInputChange('assigntoId', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={isAllocatedUsersLoading || !formData.moduleId}
                  >
                    <option value="">
                      {isAllocatedUsersLoading ? "Loading users..." : allocatedUsers.length === 0 ? "No users available for this module" : "Select assignee"}
                    </option>
                    {allocatedUsers.map(user => (
                      <option key={user.userId} value={user.userId.toString()}>{user.userName}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Entered By</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                    value={editingDefect?.assigned_by_name || '-'}
                    readOnly
                    disabled
                  />
                </div>
              </>
            )}
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

      {/* Modal for viewing steps only */}
      <Modal
        isOpen={isViewStepsModalOpen}
        onClose={() => setIsViewStepsModalOpen(false)}
        title="Steps to Reproduce"
        size="md"
      >
        <div className="overflow-x-auto">
          {viewingSteps ? (
            <div className="whitespace-pre-line text-gray-700 p-4 bg-gray-50 rounded-lg">
              {viewingSteps}
            </div>
          ) : (
            <div className="text-gray-500 text-center py-8">
              No steps provided
            </div>
          )}
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

      {/* Modal for viewing defect details */}
      <Modal
        isOpen={isViewDefectDetailsModalOpen}
        onClose={() => setIsViewDefectDetailsModalOpen(false)}
        title="Defect Details"
        size="lg"
      >
        <div className="overflow-x-auto">
          {viewingDefectDetails && (
            <table className="min-w-full divide-y divide-gray-200">
              <tbody className="bg-white divide-y divide-gray-200">
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 w-1/3">Defect ID</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{viewingDefectDetails.defectId}</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Description</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{viewingDefectDetails.description}</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Steps to Reproduce</td>
                  <td className="px-6 py-4 text-sm text-gray-700 whitespace-pre-line">{viewingDefectDetails.steps || 'No steps provided'}</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Module</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{viewingDefectDetails.module}</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Submodule</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{viewingDefectDetails.submodule}</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Type</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{viewingDefectDetails.type}</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Severity</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor((viewingDefectDetails.severity || '').toLowerCase())}`}>
                      {viewingDefectDetails.severity}
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Priority</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor((viewingDefectDetails.priority || '').toLowerCase())}`}>
                      {viewingDefectDetails.priority}
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Status</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor((viewingDefectDetails.status || '').toLowerCase())}`}>
                      {viewingDefectDetails.status}
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Assigned To</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{viewingDefectDetails.assignedTo || '-'}</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Entered By</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{viewingDefectDetails.enteredBy || '-'}</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Release</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{viewingDefectDetails.release}</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Attachment</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {viewingDefectDetails.attachment ? (
                      <a
                        href={viewingDefectDetails.attachment}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline"
                      >
                        View Attachment
                      </a>
                    ) : (
                      <span className="text-gray-400">No attachment</span>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          )}
        </div>
        <div className="flex justify-end pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={() => setIsViewDefectDetailsModalOpen(false)}
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
                const defect = backendDefects.find(d => d.defectId === editingStatusId) as FilteredDefect;
                if (!defect) return setIsRejectionCommentModalOpen(false);
                // For now, just close the modal since updateDefect doesn't work with the new structure
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
        size="xl"
      >
        <div className="flex flex-col items-center w-full max-w-4xl mx-auto">
          {isHistoryLoading ? (
            <div className="text-gray-500">Loading history...</div>
          ) : historyError ? (
            <div className="text-red-500">{historyError}</div>
          ) : !Array.isArray(viewingDefectHistory) || viewingDefectHistory.length === 0 ? (
            <div className="text-gray-500">No history available.</div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Assigned By</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Assigned To</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Previous Status</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Current Status</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Release</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Array.isArray(viewingDefectHistory) && viewingDefectHistory.map((entry, idx) => (
                  <tr key={idx}>
                    <td className="px-4 py-2 text-sm text-gray-700">{entry.assignedByName}</td>
                    <td className="px-4 py-2 text-sm text-gray-700">{entry.assignedToName}</td>
                    <td className="px-4 py-2 text-sm text-gray-700">{entry.defectDate}</td>
                    <td className="px-4 py-2 text-sm text-gray-700">{entry.defectTime}</td>
                    <td className="px-4 py-2 text-sm text-gray-700">{entry.previousStatus}</td>
                    <td className="px-4 py-2 text-sm text-gray-700">{entry.defectStatus}</td>
                    <td className="px-4 py-2 text-sm text-gray-700">{entry.releaseName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div className="flex justify-end pt-4">
          <Button type="button" variant="secondary" onClick={() => setIsHistoryModalOpen(false)}>
            Close
          </Button>
        </div>
      </Modal>

      {/* Comments Modal */}
      <Modal
        isOpen={isCommentsModalOpen}
        onClose={() => setIsCommentsModalOpen(false)}
        title="Comments"
        size="sm"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Add a comment</label>
          <textarea
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={3}
            value={newCommentText}
            onChange={e => setNewCommentText(e.target.value)}
            placeholder="Enter your comment here..."
          />
          <div className="flex justify-end pt-4 gap-2 mb-4">
            <Button type="button" variant="secondary" onClick={() => setIsCommentsModalOpen(false)}>
              Close
            </Button>
            <Button type="button" variant="primary" onClick={handleAddComment} disabled={!newCommentText.trim()}>
              Add Comment
            </Button>
          </div>
          {activeCommentsDefectId && (commentsByDefectId[activeCommentsDefectId]?.length > 0) ? (
            <ul className="space-y-2">
              {commentsByDefectId[activeCommentsDefectId].map((c, idx) => (
                <li key={idx} className="border-b pb-2">
                  <div className="text-xs text-gray-400 mb-1">{new Date(c.timestamp).toLocaleString()}</div>
                  <div className="text-gray-800">{c.text}</div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-gray-500">No comments yet.</div>
          )}
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
        <QuickAddTestCase selectedProjectId={selectedProjectId || ''} />
        <QuickAddDefect projectModules={modules.map(m => ({ ...m, submodules: [] }))} onDefectAdded={fetchData} />
      </div>
    </div>
  );
};
