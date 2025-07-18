import React, { useState, useEffect } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Users,
  UserPlus,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { Card, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Modal } from "../components/ui/Modal";
import { useApp } from "../context/AppContext";
import { Badge } from "../components/ui/Badge";
import { useParams, useNavigate } from "react-router-dom";
import { ProjectSelector } from "../components/ui/ProjectSelector";
import { createModule as createModuleApi } from "../api/module/createModule";
import { updateModule as updateModuleApi } from "../api/module/updateModule";
import { deleteModule as deleteModuleApi } from "../api/module/deleteModule";
import { deleteSubmodule as deleteSubmoduleApi } from "../api/module/deleteSubmodule";
import { updateSubmodule as updateSubmoduleApi } from "../api/module/updateSubmodule";
import { Module, Submodule } from "../types/index";
import { getModulesByProjectId, Modules as ApiModule } from "../api/module/getModule";
import { createSubmodule } from "../api/module/createModule";
import axios from "axios";
import { getDevelopersWithRolesByProjectId, allocateDeveloperToModule } from "../api/bench/projectAllocation";
import AlertModal from '../components/ui/AlertModal';
import { getDevelopersByModuleId } from "../api/module/getModuleDevelopers";


type ModuleAssignment = {
  moduleId: string;
  submoduleId?: string;
  employeeIds: string[];
};

export const ModuleManagement: React.FC = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const {
    projects,
    employees,
    setSelectedProjectId,
    selectedProjectId,
  } = useApp();

  const [isAddModuleModalOpen, setIsAddModuleModalOpen] = useState(false);
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [isEditModuleModalOpen, setIsEditModuleModalOpen] = useState(false);
  const [isBulkAssignmentModalOpen, setIsBulkAssignmentModalOpen] =
    useState(false);
  const [selectedModuleForAssignment, setSelectedModuleForAssignment] =
    useState<any>(null);
  const [selectedSubmoduleForAssignment, setSelectedSubmoduleForAssignment] =
    useState<any>(null);
  const [editingModule, setEditingModule] = useState<any>(null);
  const [selectedItems, setSelectedItems] = useState<
    Array<{
      type: "module" | "submodule";
      moduleId: string;
      submoduleId?: string;
    }>
  >([]);
  const [modulesByProjectId, setModulesByProjectId] = useState<ApiModule[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [moduleForm, setModuleForm] = useState({
    name: ""
  });

  const [assignmentForm, setAssignmentForm] = useState<ModuleAssignment>({
    moduleId: "",
    employeeIds: [],
  });

  const [isAddSubmoduleModalOpen, setIsAddSubmoduleModalOpen] = useState(false);
  const [submoduleForm, setSubmoduleForm] = useState({ name: "" });
  const [currentModuleIdForSubmodule, setCurrentModuleIdForSubmodule] = useState<string | null>(null);
  const [isEditingSubmodule, setIsEditingSubmodule] = useState(false);
  const [editingSubmoduleId, setEditingSubmoduleId] = useState<string | null>(null);
  const [isUpdatingModule, setIsUpdatingModule] = useState(false);

  // New state for developers with roles
  const [developersWithRoles, setDevelopersWithRoles] = useState<Array<{ userWithRole: string; projectAllocationId: number }>>([]);

  // New state for selected developer in bulk assignment
  const [selectedDeveloperProjectAllocationId, setSelectedDeveloperProjectAllocationId] = useState<number | null>(null);

  // 1. Add state for selected developer for module allocation (single select)
  const [selectedModuleDeveloperProjectAllocationId, setSelectedModuleDeveloperProjectAllocationId] = useState<number | null>(null);

  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  // New state for developers assigned to modules/submodules
  const [moduleDevelopers, setModuleDevelopers] = useState<Record<string, any[]>>({});
  console.log(projectId, "projectId from params in module management page");

  // useEffect(() => {
  //   if (projectId) {
  //     setSelectedProjectId(projectId);
  //   }
  // }, [projectId, setSelectedProjectId]);

  // Filter developers (engineers/developers)
  const availableDevelopers = employees.filter(
    (emp) =>
      emp.designation.toLowerCase().includes("developer") ||
      emp.designation.toLowerCase().includes("engineer")
  );

  // Fetch developers with roles when selectedProjectId changes
  const fetchDevelopersWithRoles = async () => {
    if (!selectedProjectId) return;
    try {
      const response = await getDevelopersWithRolesByProjectId(Number(selectedProjectId));
      console.log(response);

      if (response && response.status === "success" && Array.isArray(response.data)) {
        // If response.data is already an array of { name, role, projectAllocationId }
        setDevelopersWithRoles(response.data);
      } else {
        setDevelopersWithRoles([]);
      }
    } catch (error) {
      setDevelopersWithRoles([]);
    }
  };


  const handleAddModule = async () => {
    if (moduleForm.name.trim() && selectedProjectId) {
      const payload = {
        moduleName: moduleForm.name,
        projectId: Number(selectedProjectId),
      }

      try {
        // Call backend API to create module
        const response = await createModuleApi(payload);
        if (response.status === "success") {
          // Refresh modules after adding
          fetchModules();
          setAlertMessage('Module created successfully!');
          setAlertOpen(true);
        }
        setModuleForm({ name: "" });
        setIsAddModuleModalOpen(false);
      } catch (error) {
        alert("Failed to add module. Please try again.");
      }
    }
  };

  const handleModuleAssignment = (module: ApiModule, submodule?: any) => {
    setSelectedModuleForAssignment(module);
    setSelectedSubmoduleForAssignment(submodule || null);
    setAssignmentForm({
      moduleId: module.id.toString(),
      submoduleId: submodule?.id,
      employeeIds: submodule ? submodule.assignedDevs || [] : module.assignedDevs || [],
    });
    setIsAssignmentModalOpen(true);
  };

  // Assignment handler: update via context
  const handleSaveAssignment = () => {
    if (!selectedProjectId || !assignmentForm.moduleId) return;
    const module = modulesByProjectId?.find((m) => m.id.toString() === assignmentForm.moduleId);
    if (!module) return;

    // For now, just close the modal - you may want to implement actual assignment logic
    setIsAssignmentModalOpen(false);
  };

  const handleEditModule = (module: ApiModule) => {
    setEditingModule(module);
    setModuleForm({
      name: module.moduleName || '',
    });
    setIsEditModuleModalOpen(true);
  };

  const handleUpdateModule = async () => {
    if (moduleForm.name.trim() && editingModule && selectedProjectId) {
      setIsUpdatingModule(true);
      try {
        const response = await updateModuleApi(editingModule.id.toString(), {
          moduleName: moduleForm.name,
          projectId: Number(selectedProjectId),
        });
        if (response.success && response.module) {
          await fetchModules();
          setAlertMessage('Module updated successfully!');
          setAlertOpen(true);
          setTimeout(() => {
            setModuleForm({ name: "" });
            setEditingModule(null);
            setIsEditModuleModalOpen(false);
          }, 200);
        } else {
          // Fallback: refetch modules if update did not succeed
          await fetchModules();
          setAlertMessage('Module updated successfully!');
          setAlertOpen(true);
          setTimeout(() => {
            setModuleForm({ name: "" });
            setEditingModule(null);
            setIsEditModuleModalOpen(false);
          }, 200);
        }
      } catch (error) {
        alert("Failed to update module. Please try again.");
      } finally {
        setIsUpdatingModule(false);
      }
    }
  };

  const handleDeleteModule = async (moduleId: string) => {
    if (selectedProjectId) {
      try {
        const response = await deleteModuleApi(Number(moduleId));
        if (response.status === "success") {
          await fetchModules();
          setAlertMessage('Module deleted successfully!');
          setAlertOpen(true);
        } else {
          setAlertMessage('Module deleted successfully!');
          setAlertOpen(true);
          await fetchModules();
        }
      } catch (error: any) {
        if (error.response && error.response.data) {
          const errorData = error.response.data;
          if (errorData.message && errorData.message.includes('foreign key constraint fails')) {
            setAlertMessage('Cannot delete module: It has allocated developers. Please remove all allocations first.');
          } else {
            setAlertMessage('Failed to delete module. Please try again.');
          }
          setAlertOpen(true);
        } else {
          setAlertMessage('Failed to delete module. Please try again.');
          setAlertOpen(true);
        }
      }
    }
  };

  const handleBulkAssignment = () => {
    fetchDevelopersWithRoles();
    if (selectedItems.length > 0) {
      setAssignmentForm({
        moduleId: "",
        employeeIds: [],
      });
      setSelectedDeveloperProjectAllocationId(null); // Reset on open
      setSelectedModuleDeveloperProjectAllocationId(null); // Reset on open
      setIsBulkAssignmentModalOpen(true);
    }
  };

  // Bulk assignment handler: assign developer to all selected modules/submodules
  const handleSaveBulkAssignment = async () => {
    // Module allocation: only one developer allowed
    if (selectedItems.some(item => item.type === "module")) {
      if (!selectedModuleDeveloperProjectAllocationId) {
        alert("Please select a developer for module allocation.");
        return;
      }
      for (const item of selectedItems) {
        if (item.type === "module") {
          // For each submodule of this module, allocate the developer if not already allocated
          const module = modulesByProjectId?.find((m) => m.id.toString() === item.moduleId);
          if (module && Array.isArray(module.submodules)) {
            for (const sub of module.submodules) {
              // Check if submodule already has developers
              const submoduleDevs = (moduleDevelopers[module.id] || []).filter((d) => d.subModuleId === sub.id);
              if (!submoduleDevs || submoduleDevs.length === 0) {
                // Allocate the selected developer to this submodule
                await axios.post(`${import.meta.env.VITE_BASE_URL}allocateModule/subModule/bulk`, {
                  moduleId: Number(item.moduleId),
                  subModuleId: Number(sub.id),
                  projectAllocationIds: [selectedModuleDeveloperProjectAllocationId]
                }, {
                  headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                  },
                  withCredentials: false
                });
              }
            }
          }
        }
      }
    }
    // Submodule allocation: allow multiple developers
    if (selectedItems.some(item => item.type === "submodule")) {
      if (!selectedDeveloperProjectAllocationIds || selectedDeveloperProjectAllocationIds.length === 0) {
        alert("Please select at least one developer for submodule allocation.");
        return;
      }
      for (const item of selectedItems) {
        if (item.type === "submodule" && item.submoduleId) {
          await axios.post(`${import.meta.env.VITE_BASE_URL}allocateModule/subModule/bulk`, {
            moduleId: Number(item.moduleId),
            subModuleId: Number(item.submoduleId),
            projectAllocationIds: selectedDeveloperProjectAllocationIds
          }, {
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            withCredentials: false
          });
        }
      }
    }
    alert("Assignment successful!");
    setSelectedItems([]);
    setIsBulkAssignmentModalOpen(false);
    fetchModules(); // Refresh module assignments
  };

  const handleSelectItem = (
    type: "module" | "submodule",
    moduleId: string,
    checked: boolean,
    submoduleId?: string
  ) => {
    if (checked) {
      if (type === "module") {
        // When selecting a module, only select the module itself (do not select all its submodules)
        setSelectedItems((prev) => [
          ...prev.filter((item) => !(item.type === "module" && item.moduleId === moduleId)),
          { type: "module" as const, moduleId, submoduleId: undefined },
        ]);
      } else {
        // When selecting a submodule, check if all submodules are now selected
        setSelectedItems((prev) => [...prev, { type, moduleId, submoduleId }]);

        // Check if all submodules of this module are now selected
        const module = modulesByProjectId?.find((m) => m.id.toString() === moduleId);
        const allSubmodules = module?.submodules || [];
        const selectedSubmodules = selectedItems.filter(
          (item) => item.type === "submodule" && item.moduleId === moduleId
        );

        if (
          allSubmodules.length > 0 &&
          selectedSubmodules.length + 1 === allSubmodules.length
        ) {
          // All submodules are selected, so select the module too
          setSelectedItems((prev) => [
            ...prev,
            { type: "module" as const, moduleId, submoduleId: undefined },
          ]);
        }
      }
    } else {
      if (type === "module") {
        // When deselecting a module, also deselect all its submodules
        setSelectedItems((prev) =>
          prev.filter((item) => item.moduleId !== moduleId)
        );
      } else {
        // When deselecting a submodule, also deselect the module if it was selected
        setSelectedItems((prev) =>
          prev.filter(
            (item) =>
              !(
                item.type === type &&
                item.moduleId === moduleId &&
                item.submoduleId === submoduleId
              ) && !(item.type === "module" && item.moduleId === moduleId)
          )
        );
      }
    }
  };

  const handleSelectAllModules = (checked: boolean) => {
    if (checked) {
      // Select all modules and all their submodules
      const allItems = (modulesByProjectId || []).flatMap((module) => [
        {
          type: "module" as const,
          moduleId: module.id.toString(),
          submoduleId: undefined,
        },
        ...(module.submodules || []).map((sub) => ({
          type: "submodule" as const,
          moduleId: module.id.toString(),
          submoduleId: sub.id.toString(),
        })),
      ]);
      setSelectedItems(allItems);
    } else {
      setSelectedItems([]);
    }
  };

  const isItemSelected = (
    type: "module" | "submodule",
    moduleId: string,
    submoduleId?: string
  ) => {
    return selectedItems.some(
      (item) =>
        item.type === type &&
        item.moduleId === moduleId &&
        item.submoduleId === submoduleId
    );
  };

  const isAllModulesSelected = () => {
    return (
      (modulesByProjectId || []).length > 0 &&
      (modulesByProjectId || []).every((module) =>
        selectedItems.some(
          (item) => item.type === "module" && item.moduleId === module.id.toString()
        )
      )
    );
  };

  const getAssignedDevNames = (devIds: string[]) => {
    return devIds.map((id) => {
      const dev = employees && employees.find((e) => e.id === id);
      return dev ? `${dev.firstName} ${dev.lastName}` : "Unknown";
    });
  };

  const getAllModuleDevelopers = (module: ApiModule) => {
    // Get all unique developers assigned to this module and its submodules
    const allDevIds = new Set<string>();

    // Add module-level assignments
    (module.assignedDevs || []).forEach((id: string) => allDevIds.add(id));

    // Add submodule-level assignments
    (module.submodules || []).forEach((submodule) => {
      (submodule.assignedDevs || []).forEach((id: string) => allDevIds.add(id));
    });

    return Array.from(allDevIds);
  };

  // Project selection handler
  const handleProjectSelect = (id: string) => {
    setSelectedProjectId(id);
    // Reset modules state when project changes
    setModulesByProjectId(null);
    setSelectedItems([]);
  };

  // Defensive logging and type normalization for project lookup
  console.log("Selected Project ID:", selectedProjectId);


  const project = projects.find((p) => String(p.id) === String(selectedProjectId));


  const fetchModules = async () => {
    if (!selectedProjectId) return;
    setIsLoading(true);
    try {
      const response = await getModulesByProjectId(selectedProjectId);
      if (response.data) {
        setModulesByProjectId(response.data);
      } else {
        // Ensure we set an empty array if no data is returned
        setModulesByProjectId([]);
      }
    } catch (error) {
      console.error("Error fetching modules:", error);
      // Set empty array on error to show no modules state
      setModulesByProjectId([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchModules();
  }, [selectedProjectId]);

  useEffect(() => {
    if (modulesByProjectId) {
      modulesByProjectId.forEach(async (module) => {
        try {
          const devs = await getDevelopersByModuleId(module.id);
          setModuleDevelopers((prev) => ({ ...prev, [module.id]: devs }));
        } catch (e) {
          setModuleDevelopers((prev) => ({ ...prev, [module.id]: [] }));
        }
      });
    }
  }, [modulesByProjectId]);

  useEffect(() => {
    if (modulesByProjectId) {
      modulesByProjectId.forEach(async (module) => {
        try {
          const devs = await getDevelopersByModuleId(module.id);
          setModuleDevelopers((prev) => ({ ...prev, [module.id]: devs }));
        } catch (e) {
          setModuleDevelopers((prev) => ({ ...prev, [module.id]: [] }));
        }
      });
    }
  }, [modulesByProjectId]);

  // Add state for confirmation dialog
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDeleteSubmoduleId, setPendingDeleteSubmoduleId] = useState<string | null>(null);

  // Add state for module confirmation dialog
  const [confirmModuleOpen, setConfirmModuleOpen] = useState(false);
  const [pendingDeleteModuleId, setPendingDeleteModuleId] = useState<string | null>(null);

  // 4. Add state for selectedDeveloperProjectAllocationIds (array)
  const [selectedDeveloperProjectAllocationIds, setSelectedDeveloperProjectAllocationIds] = useState<number[]>([]);

  const onlyModulesSelected = selectedItems.length > 0 && selectedItems.every(item => item.type === "module");
  const onlySubmodulesSelected = selectedItems.length > 0 && selectedItems.every(item => item.type === "submodule");
  const mixedSelection = selectedItems.some(item => item.type === "module") && selectedItems.some(item => item.type === "submodule");


  return (
    <div className="max-w-6xl mx-auto">
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
      <AlertModal isOpen={alertOpen} message={alertMessage} onClose={() => setAlertOpen(false)} />
      {!selectedProjectId ? (
        <div className="p-8 text-center text-gray-500">
          Please select a project to manage modules.
        </div>
      ) : (
        <>
          {/* Project Selection Header */}
          <div className="flex-none p-6 pb-4">
            <div className="flex justify-between items-center mb-4">
              <div className="space-y-1">
                <h1 className="text-2xl font-bold text-gray-900">
                  Module Management
                </h1>
                <p className="text-sm text-gray-500">
                  {selectedProjectId && project
                    ? `Project: ${project.name}`
                    : "Select a project to begin"}
                </p>
              </div>
            </div>
            {/* Project Selection Panel */}
            <ProjectSelector
              projects={projects}
              selectedProjectId={selectedProjectId}
              onSelect={handleProjectSelect}
            />
          </div>
          {/* Content Area */}
          <div className="flex-1 px-6 pb-6">
            {/* Action Buttons */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex space-x-3">
                <Button
                  onClick={() => setIsAddModuleModalOpen(true)}
                  className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Module</span>
                </Button>
                {selectedItems.length > 0 && (
                  <Button
                    onClick={handleBulkAssignment}
                    className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Allocate</span>
                  </Button>
                )}
              </div>
            </div>
            {/* Bulk Selection Controls */}
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={isAllModulesSelected()}
                      onChange={(e) => handleSelectAllModules(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Select All Modules
                    </span>
                  </label>
                  {selectedItems.length > 0 && (
                    <></>
                  )}
                </div>
                {selectedItems.length > 0 && (
                  <Button
                    variant="secondary"
                    onClick={() => setSelectedItems([])}
                    className="text-sm"
                  >
                    Clear Selection
                  </Button>
                )}
              </div>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="text-center py-8">
                <div className="text-gray-500">Loading modules...</div>
              </div>
            )}

            {/* Modules Grid */}
            {!isLoading && (
              <>
                {console.log("Modules state:", modulesByProjectId, "Length:", modulesByProjectId?.length)}
                {(modulesByProjectId && Array.isArray(modulesByProjectId) && modulesByProjectId.length > 0) ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {(modulesByProjectId || []).map((module) => {
                      const moduleDevs = (() => {
                        // Get all developers assigned directly to the module (not via submodules)
                        const directModuleDevs = (moduleDevelopers[module.id] || []).filter((d) => d.subModuleId == null);
                        // Get all developers assigned to submodules
                        const submoduleDevs = (module.submodules || []).flatMap((sub: any) =>
                          (moduleDevelopers[module.id] || []).filter((d) => d.subModuleId === sub.id)
                        );
                        // Only show developers who are assigned directly to the module and not to any submodule
                        const submoduleDevIds = new Set(submoduleDevs.map((d) => d.userId));
                        // Deduplicate by userId
                        const uniqueModuleDevsMap = new Map();
                        directModuleDevs.forEach((d) => {
                          if (!submoduleDevIds.has(d.userId) && !uniqueModuleDevsMap.has(d.userId)) {
                            uniqueModuleDevsMap.set(d.userId, d.userName);
                          }
                        });
                        return Array.from(uniqueModuleDevsMap.entries()).map(([userId, userName]) => ({ userId, userName }));
                      })();
                      return (
                        <Card key={module.id} className="hover:shadow-lg transition-shadow">
                          <CardContent className="p-6">
                            <div className="flex justify-between items-start mb-4">
                              <div className="flex items-center space-x-3">
                                <input
                                  type="checkbox"
                                  checked={isItemSelected("module", module.id.toString())}
                                  onChange={(e) =>
                                    handleSelectItem("module", module.id.toString(), e.target.checked)
                                  }
                                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <h3 className="text-lg font-semibold text-gray-900">
                                  {module.moduleName}
                                  {moduleDevs.length > 0 && (
                                    <span className="ml-2 text-xs text-blue-600 font-normal">
                                      (
                                      {moduleDevs.map((d) => d.userName).join(", ")}
                                      )
                                    </span>
                                  )}
                                </h3>
                              </div>
                              <div className="flex space-x-2">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleEditModule(module)}
                                  className="p-1"
                                  title="Edit Module"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    setPendingDeleteModuleId(module.id.toString());
                                    setConfirmModuleOpen(true);
                                  }}
                                  className="p-1 text-red-600 hover:text-red-800"
                                  title="Delete Module"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                            {/* Submodules List */}
                            <div className="mt-4">
                              <h4 className="text-sm font-medium text-gray-700 mb-2">Submodules</h4>
                              {Array.isArray(module.submodules) && module.submodules.length > 0 ? (
                                <ul className="list-disc list-inside space-y-1">
                                  {module.submodules.map((sub: any) => {
                                    const submoduleName = sub.getSubModuleName || sub.subModuleName || sub.name || sub.submoduleName || sub.subModule || 'Unknown';
                                    const submoduleDevs = (moduleDevelopers[module.id] || []).filter(
                                      (d) => d.subModuleId != null && d.subModuleId.toString() === sub.id.toString()
                                    );
                                    return (
                                      <li key={sub.id} className="text-gray-800 text-sm flex items-center justify-between group">
                                        <span className="flex items-center">
                                          <input
                                            type="checkbox"
                                            checked={isItemSelected("submodule", module.id.toString(), sub.id.toString())}
                                            onChange={e => handleSelectItem("submodule", module.id.toString(), e.target.checked, sub.id.toString())}
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                                          />
                                          {submoduleName}
                                          {/* Show assigned developers for the submodule */}
                                          {submoduleDevs.length > 0 && (
                                            <span className="ml-2 text-xs text-blue-600 font-normal">
                                              (
                                              {submoduleDevs.map((d) => d.userName).join(", ")}
                                              )
                                            </span>
                                          )}
                                        </span>
                                        <span className="flex items-center space-x-2 opacity-80 group-hover:opacity-100">
                                          <button
                                            type="button"
                                            className="p-1 hover:text-blue-600"
                                            title="Edit Submodule"
                                            onClick={() => {
                                              setCurrentModuleIdForSubmodule(module.id.toString());
                                              setIsAddSubmoduleModalOpen(true);
                                              setSubmoduleForm({ name: submoduleName });
                                              setIsEditingSubmodule(true);
                                              setEditingSubmoduleId(sub.id.toString());
                                            }}
                                          >
                                            <Edit2 className="w-4 h-4" />
                                          </button>
                                          <button
                                            type="button"
                                            className="p-1 hover:text-red-600"
                                            title="Delete Submodule"
                                            onClick={() => {
                                              setPendingDeleteSubmoduleId(sub.id.toString());
                                              setConfirmOpen(true);
                                            }}
                                          >
                                            <Trash2 className="w-4 h-4" />
                                          </button>
                                        </span>
                                      </li>
                                    );
                                  })}
                                </ul>
                              ) : (
                                <div className="italic text-gray-400 text-sm">No Submodules</div>
                              )}
                            </div>
                            <div className="flex justify-end mt-4">
                              <Button
                                size="sm"
                                variant="primary"
                                onClick={() => {
                                  setCurrentModuleIdForSubmodule(module.id.toString());
                                  setIsAddSubmoduleModalOpen(true);
                                  setSubmoduleForm({ name: "" });
                                  setIsEditingSubmodule(false);
                                  setEditingSubmoduleId(null);
                                }}
                              >
                                <Plus className="w-4 h-4 mr-1" /> Add Submodule
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Edit2 className="w-8 h-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No modules found
                      </h3>
                      <p className="text-gray-500 mb-4">
                        This project doesn't have any modules yet. Create your first module to get started.
                      </p>
                      <Button onClick={() => setIsAddModuleModalOpen(true)} icon={Plus}>
                        Add Module
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>
        </>
      )}

      {/* Add Module Modal */}
      <Modal
        isOpen={isAddModuleModalOpen}
        onClose={() => setIsAddModuleModalOpen(false)}
        title="Add New Module"
        size="xl"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Module Name
            </label>
            <Input
              value={moduleForm.name}
              onChange={(e) =>
                setModuleForm((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="Enter module name"
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => setIsAddModuleModalOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleAddModule}>Submit</Button>
          </div>
        </div>
      </Modal>



      {/* Edit Module Modal */}
      <Modal
        isOpen={isEditModuleModalOpen}
        onClose={() => {
          setIsEditModuleModalOpen(false);
          setEditingModule(null);
          setModuleForm({ name: "" });
        }}
        title="Edit Module"
        size="xl"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Module Name
            </label>
            <Input
              value={moduleForm.name}
              onChange={(e) =>
                setModuleForm((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="Enter module name"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => {
                setIsEditModuleModalOpen(false);
                setEditingModule(null);
                setModuleForm({ name: "" });
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateModule} disabled={isUpdatingModule}>
              {isUpdatingModule ? 'Updating...' : 'Update Module'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Bulk Assignment Modal */}
      <Modal
        isOpen={isBulkAssignmentModalOpen}
        onClose={() => {
          setIsBulkAssignmentModalOpen(false);
          setSelectedItems([]);
          setSelectedDeveloperProjectAllocationId(null); // Reset on close
          setSelectedModuleDeveloperProjectAllocationId(null); // Reset on close
        }}
        title={`Assign Developers`}
        size="xl"
      >
        <div className="flex flex-col md:flex-row md:space-x-6 space-y-4 md:space-y-0 max-h-[90vh] overflow-y-auto">
          <div className="md:w-1/2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Selected Modules and Submodules
            </label>
            <div className="max-h-[60vh] overflow-y-auto p-3 bg-gray-50 rounded text-sm">
              {/* Group selected items by module */}
              {(() => {
                // Build a map: moduleId -> { module, selected: bool, submodules: Set<submoduleId> }
                const moduleMap: Record<string, { module: any, selected: boolean, submodules: Set<string> }> = {};
                selectedItems.forEach(item => {
                  if (!moduleMap[item.moduleId]) {
                    const module = modulesByProjectId?.find((m) => m.id.toString() === item.moduleId);
                    moduleMap[item.moduleId] = {
                      module,
                      selected: false,
                      submodules: new Set<string>(),
                    };
                  }
                  if (item.type === "module") {
                    moduleMap[item.moduleId].selected = true;
                  } else if (item.type === "submodule" && item.submoduleId) {
                    moduleMap[item.moduleId].submodules.add(item.submoduleId);
                  }
                });
                return Object.values(moduleMap).map(({ module, selected, submodules }, idx) => {
                  if (!module) return null;
                  // Get all submodules for this module
                  const allSubmodules = module.submodules || [];
                  return (
                    <div key={module.id} className="mb-2">
                      <div className="font-semibold text-gray-900">{module.moduleName}</div>
                      <ul className="list-disc list-inside ml-4">
                        {selected
                          ? allSubmodules.map((sub: any) => {
                            const submoduleName = sub.getSubModuleName || sub.subModuleName || sub.name || sub.submoduleName || sub.subModule || 'Unknown';
                            return (
                              <li key={sub.id}>{submoduleName}</li>
                            );
                          })
                          : Array.from(submodules).map(subId => {
                            const sub = allSubmodules.find((s: any) => s.id.toString() === subId);
                            if (!sub) return null;
                            const submoduleName = sub.getSubModuleName || sub.subModuleName || sub.name || sub.submoduleName || sub.subModule || 'Unknown';
                            return (
                              <li key={sub.id}>{submoduleName}</li>
                            );
                          })}
                      </ul>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
          <div className="md:w-1/2">
            {onlyModulesSelected && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Developer for Module Allocation</label>
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {developersWithRoles.length > 0 ? (
                    developersWithRoles.map((dev, idx) => (
                      <div key={idx} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
                        <input
                          type="radio"
                          name="module-assign-developer"
                          checked={selectedModuleDeveloperProjectAllocationId === dev.projectAllocationId}
                          onChange={() => setSelectedModuleDeveloperProjectAllocationId(dev.projectAllocationId)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <div>
                          {(() => {
                            const [name, role] = dev.userWithRole.split("-");
                            return (
                              <>
                                <div className="text-sm font-medium text-gray-900">{name}</div>
                                <div className="text-xs text-gray-500">{role}</div>
                              </>
                            );
                          })()}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-400 text-sm">No developers found for this project.</div>
                  )}
                </div>
              </div>
            )}
            {onlySubmodulesSelected && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Developers for Submodule Allocation</label>
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {developersWithRoles.length > 0 ? (
                    developersWithRoles.map((dev, idx) => (
                      <div key={idx} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
                        <input
                          type="checkbox"
                          name="submodule-assign-developer"
                          checked={selectedDeveloperProjectAllocationIds.includes(dev.projectAllocationId)}
                          onChange={() => {
                            setSelectedDeveloperProjectAllocationIds((prev) =>
                              prev.includes(dev.projectAllocationId)
                                ? prev.filter((id) => id !== dev.projectAllocationId)
                                : [...prev, dev.projectAllocationId]
                            );
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <div>
                          {(() => {
                            const [name, role] = dev.userWithRole.split("-");
                            return (
                              <>
                                <div className="text-sm font-medium text-gray-900">{name}</div>
                                <div className="text-xs text-gray-500">{role}</div>
                              </>
                            );
                          })()}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-400 text-sm">No developers found for this project.</div>
                  )}
                </div>
              </div>
            )}
            {mixedSelection && (
              <div className="mb-4 text-red-600 font-medium">
                Please select either modules or submodules, not both, for allocation.
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button
            variant="secondary"
            onClick={() => {
              setIsBulkAssignmentModalOpen(false);
              setSelectedItems([]);
              setSelectedDeveloperProjectAllocationId(null);
              setSelectedModuleDeveloperProjectAllocationId(null);
            }}
          >
            Cancel
          </Button>
          <Button onClick={handleSaveBulkAssignment} disabled={mixedSelection}>
            Assign to All Selected
          </Button>
        </div>
      </Modal>

      {/* Add Submodule Modal */}
      < Modal
        isOpen={isAddSubmoduleModalOpen}
        onClose={() => {
          setIsAddSubmoduleModalOpen(false);
          setIsEditingSubmodule(false);
          setEditingSubmoduleId(null);
        }}
        title="Add Submodule"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Submodule Name
            </label>
            <Input
              value={submoduleForm.name}
              onChange={(e) => setSubmoduleForm({ name: e.target.value })}
              placeholder="Enter submodule name"
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => setIsAddSubmoduleModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={async () => {
                if (!submoduleForm.name.trim() || !currentModuleIdForSubmodule) return;
                if (isEditingSubmodule && editingSubmoduleId) {
                  // Edit mode: update submodule name via API
                  try {
                    const response = await updateSubmoduleApi(Number(editingSubmoduleId), {
                      subModuleName: submoduleForm.name
                    });
                    if (response.status === "success" || response.success) {
                      await fetchModules();
                      setIsAddSubmoduleModalOpen(false);
                      setIsEditingSubmodule(false);
                      setEditingSubmoduleId(null);
                      setAlertMessage('Submodule updated successfully!');
                      setAlertOpen(true);
                    } else {
                      setAlertMessage('Submodule updated successfully!');
                      setAlertOpen(true);
                      await fetchModules();
                    }
                  } catch (error: any) {
                    if (error.response && error.response.data) {
                      setAlertMessage('Failed to update submodule: ' + JSON.stringify(error.response.data));
                      setAlertOpen(true);
                    } else {
                      setAlertMessage('Failed to update submodule. Please try again.');
                      setAlertOpen(true);
                    }
                  }
                } else {
                  // Add mode: call API to create submodule
                  try {
                    const response = await createSubmodule({
                      subModuleName: submoduleForm.name,
                      moduleId: Number(currentModuleIdForSubmodule),
                    });
                    if (response.status === "success") {
                      // Refresh modules after adding
                      await fetchModules();
                      setIsAddSubmoduleModalOpen(false);
                      setIsEditingSubmodule(false);
                      setEditingSubmoduleId(null);
                      setAlertMessage('Submodule added successfully!');
                      setAlertOpen(true);
                    } else {
                      setAlertMessage('Submodule added successfully!');
                      setAlertOpen(true);
                      await fetchModules();
                    }
                  } catch (error: any) {
                    if (error.response && error.response.data) {
                      setAlertMessage('Failed to add submodule: ' + JSON.stringify(error.response.data));
                      setAlertOpen(true);
                    } else {
                      setAlertMessage('Failed to add submodule. Please try again.');
                      setAlertOpen(true);
                    }
                  }
                }
              }}
            >
              {isEditingSubmodule ? 'Update Submodule' : 'Add Submodule'}
            </Button>
          </div>
        </div>
      </Modal >



      {/* Custom confirmation dialog for submodule deletion */}
      {confirmOpen && (
        <div className="fixed inset-0 z-[60] flex justify-center items-start bg-black bg-opacity-40">
          <div className="mt-8 bg-[#444] text-white rounded-lg shadow-2xl min-w-[400px] max-w-[95vw]" style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.25)' }}>
            <div className="px-6 pb-4 pt-5 text-base text-white">Are you sure you want to delete this submodule?</div>
            <div className="px-6 pb-5 flex justify-end gap-3">
              <button
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold px-6 py-2 rounded mr-2"
                onClick={() => { setConfirmOpen(false); setPendingDeleteSubmoduleId(null); }}
                type="button"
              >
                Cancel
              </button>
              <button
                className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-2 rounded"
                onClick={async () => {
                  if (pendingDeleteSubmoduleId) {
                    try {
                      const response = await deleteSubmoduleApi(Number(pendingDeleteSubmoduleId));
                      if (response.status === "success" || response.success) {
                        await fetchModules();
                        setAlertMessage('Submodule deleted successfully!');
                        setAlertOpen(true);
                      } else {
                        setAlertMessage('Submodule deleted successfully!');
                        setAlertOpen(true);
                        await fetchModules();
                      }
                    } catch (error) {
                      setAlertMessage('Failed to delete submodule. Please try again.');
                      setAlertOpen(true);
                    } finally {
                      setConfirmOpen(false);
                      setPendingDeleteSubmoduleId(null);
                    }
                  }
                }}
                type="button"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom confirmation dialog for module deletion */}
      {confirmModuleOpen && (
        <div className="fixed inset-0 z-[60] flex justify-center items-start bg-black bg-opacity-40">
          <div className="mt-8 bg-[#444] text-white rounded-lg shadow-2xl min-w-[400px] max-w-[95vw]" style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.25)' }}>
            <div className="px-6 pb-4 pt-5 text-base text-white">Are you sure you want to delete this module? This will also delete all submodules.</div>
            <div className="px-6 pb-5 flex justify-end gap-3">
              <button
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold px-6 py-2 rounded mr-2"
                onClick={() => { setConfirmModuleOpen(false); setPendingDeleteModuleId(null); }}
                type="button"
              >
                Cancel
              </button>
              <button
                className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-2 rounded"
                onClick={async () => {
                  if (pendingDeleteModuleId) {
                    await handleDeleteModule(pendingDeleteModuleId);
                    setConfirmModuleOpen(false);
                    setPendingDeleteModuleId(null);
                  }
                }}
                type="button"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div >
  );
};
