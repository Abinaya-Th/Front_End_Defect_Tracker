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
import QuickAddTestCase from "./QuickAddTestCase";
import QuickAddDefect from "./QuickAddDefect";
import { ProjectSelector } from "../components/ui/ProjectSelector";
import { createModule as createModuleApi } from "../api/module/createModule";
import { updateModule as updateModuleApi } from "../api/module/updateModule";
import { deleteModule as deleteModuleApi } from "../api/module/deleteModule";
import { Module, Submodule } from "../types/index";
import { getModulesByProjectId, Modules as ApiModule } from "../api/module/getModule";
import { createSubmodule } from "../api/module/createModule";
import axios from "axios";
import { getDevelopersWithRolesByProjectId, allocateDeveloperToModule, allocateDeveloperToSubModule } from "../api/bench/projectAllocation";
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
  const [developersWithRoles, setDevelopersWithRoles] = useState<Array<{ name: string; role: string; projectAllocationId: number }>>([]);

  // New state for selected developer in bulk assignment
  const [selectedDeveloperProjectAllocationId, setSelectedDeveloperProjectAllocationId] = useState<number | null>(null);

  // New state for developers assigned to modules/submodules
  const [moduleDevelopers, setModuleDevelopers] = useState<Record<string, any[]>>({});

  useEffect(() => {
    if (projectId) {
      setSelectedProjectId(projectId);
    }
  }, [projectId, setSelectedProjectId]);

  // Filter developers (engineers/developers)
  const availableDevelopers = employees.filter(
    (emp) =>
      emp.designation.toLowerCase().includes("developer") ||
      emp.designation.toLowerCase().includes("engineer") ||
      emp.department.toLowerCase().includes("engineering")
  );

  // Fetch developers with roles when selectedProjectId changes
  const fetchDevelopersWithRoles = async () => {
    if (!selectedProjectId) return;
    try {
      const response = await getDevelopersWithRolesByProjectId(Number(selectedProjectId));
      if (response && response.status === "success" && Array.isArray(response.data)) {
        const parsed = response.data.map((item: string) => {
          const [name, role, projectAllocationId] = item?.userWithRole.split("-");
          return { name: name?.trim() || "", role: role?.trim() || "", projectAllocationId: item?.projectAllocationId };
        });
        setDevelopersWithRoles(parsed);
      } else {
        setDevelopersWithRoles([]);
      }
    } catch (error) {
      setDevelopersWithRoles([]);
    }
  };

  console.log("developersWithRoles", developersWithRoles);


  const handleAddModule = async () => {
    if (moduleForm.name.trim() && selectedProjectId) {
      const payload = {
        moduleName: moduleForm.name,
        projectId: Number(selectedProjectId),
      }
      console.log({ payload });

      try {
        // Call backend API to create module
        const response = await createModuleApi(payload);
        console.log({ response });
        if (response.status === "success") {
          // Refresh modules after adding
          fetchModules();
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
    console.log('Editing module:', module);
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
        console.log('Update module API response:', response);
        if (response.success && response.module) {
          // Refresh modules after updating
          fetchModules();
        } else {
          // Fallback: refetch modules if update did not succeed
          fetchModules();
        }
        setModuleForm({ name: "" });
        setEditingModule(null);
        setIsEditModuleModalOpen(false);
      } catch (error) {
        alert("Failed to update module. Please try again.");
      } finally {
        setIsUpdatingModule(false);
      }
    }
  };

  const handleDeleteModule = async (moduleId: string) => {
    if (
      window.confirm(
        "Are you sure you want to delete this module? This will also delete all submodules."
      )
    ) {
      if (selectedProjectId) {
        try {
          const response = await deleteModuleApi(Number(moduleId));
          if (response.status === "success") {
            // Refresh modules after deleting
            fetchModules();
          } else {
            alert(response.message || "Failed to delete module on server.");
          }
        } catch (error) {
          alert("Failed to delete module on server.");
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
      setIsBulkAssignmentModalOpen(true);
    }
  };

  // Bulk assignment handler: assign developer to all selected modules/submodules
  const handleSaveBulkAssignment = async () => {
    if (!selectedDeveloperProjectAllocationId) {
      alert("Please select a developer to assign.");
      return;
    }
    try {
      for (const item of selectedItems) {
        if (item.type === "module") {
          await allocateDeveloperToModule(Number(item.moduleId), selectedDeveloperProjectAllocationId);
        } else if (item.type === "submodule" && item.submoduleId) {
          await allocateDeveloperToSubModule(
            Number(item.moduleId),
            selectedDeveloperProjectAllocationId,
            Number(item.submoduleId)
          );
        }
      }
      alert("Assignment successful!");
      setSelectedItems([]);
      setIsBulkAssignmentModalOpen(false);
      fetchModules(); // Refresh module assignments
    } catch (error) {
      if (error.response && error.response.status === 409) {
        alert("Developer is already assigned to this module or submodule.");
      } else {
        alert("Assignment is already done for this module");
      }
      console.error(error);
    }
  };

  const handleSelectItem = (
    type: "module" | "submodule",
    moduleId: string,
    checked: boolean,
    submoduleId?: string
  ) => {
    if (checked) {
      if (type === "module") {
        // When selecting a module, also select all its submodules
        const module = modulesByProjectId?.find((m) => m.id.toString() === moduleId);
        const newItems = [
          { type: "module" as const, moduleId, submoduleId: undefined },
          ...(module?.submodules?.map((sub) => ({
            type: "submodule" as const,
            moduleId,
            submoduleId: sub.id.toString(),
          })) || []),
        ];
        setSelectedItems((prev) => [
          ...prev.filter((item) => !(item.moduleId === moduleId)),
          ...newItems,
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
  };

  // Defensive logging and type normalization for project lookup
  console.log('projects:', projects, 'selectedProjectId:', selectedProjectId, typeof selectedProjectId);
  console.log('project ids:', projects.map(p => [p.id, typeof p.id]));
  const project = projects.find((p) => String(p.id) === String(selectedProjectId));
  console.log('found project:', project);

  const fetchModules = async () => {
    if (!selectedProjectId) return;
    setIsLoading(true);
    try {
      const response = await getModulesByProjectId(selectedProjectId);
      console.log("Fetched modules:", response);

      if (response.data) {
        setModulesByProjectId(response.data);
      }
    } catch (error) {
      console.error("Error fetching modules:", error);

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

  console.log({ modulesByProjectId });

  return (
    <div className="max-w-6xl mx-auto">
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(modulesByProjectId || []).map((module) => {
                  const moduleDevs = (moduleDevelopers[module.id] || []).filter((d) => d.subModuleId == null);
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
                              {/* Show assigned developers for the module */}
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
                              onClick={() => handleDeleteModule(module.id.toString())}
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
                                const submoduleDevs = (moduleDevelopers[module.id] || []).filter((d) => d.subModuleId === sub.id);
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
                                        onClick={async () => {
                                          if (window.confirm('Are you sure you want to delete this submodule?')) {
                                            try {
                                              const response = await axios.delete(`${import.meta.env.VITE_BASE_URL}subModule/${sub.id}`);
                                              if (response.data && response.data.success) {
                                                // Refresh modules after deleting submodule
                                                fetchModules();
                                                alert("Submodule deleted successfully.");
                                              } else {
                                                alert("Submodule deleted successfully.");
                                              }
                                            } catch (error: any) {
                                              if (error.response && error.response.data) {
                                                alert("Failed to delete submodule: " + JSON.stringify(error.response.data));
                                              } else {
                                                alert("Failed to delete submodule. Please try again.");
                                              }
                                            }
                                          }
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Developers
            </label>
            <div className="max-h-60 overflow-y-auto space-y-2">
              {developersWithRoles.length > 0 ? (
                developersWithRoles.map((dev, idx) => (
                  <div key={idx} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
                    <input
                      type="radio"
                      name="bulk-assign-developer"
                      checked={selectedDeveloperProjectAllocationId === dev.projectAllocationId}
                      onChange={() => setSelectedDeveloperProjectAllocationId(dev.projectAllocationId)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {dev.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {dev.role}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-gray-400 text-sm">No developers found for this project.</div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button
            variant="secondary"
            onClick={() => {
              setIsBulkAssignmentModalOpen(false);
              setSelectedItems([]);
              setSelectedDeveloperProjectAllocationId(null);
            }}
          >
            Cancel
          </Button>
          <Button onClick={handleSaveBulkAssignment}>
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
                    const response = await axios.put(
                      `${import.meta.env.VITE_BASE_URL}subModule/${editingSubmoduleId}`,
                      { subModuleName: submoduleForm.name }
                    );
                    if (response.data && response.data.success) {
                      // Refresh modules after updating
                      fetchModules();
                      alert("Submodule updated successfully.");
                    } else {
                      alert("Submodule updated successfully.");
                    }
                  } catch (error: any) {
                    if (error.response && error.response.data) {
                      alert("Failed to update submodule: " + JSON.stringify(error.response.data));
                    } else {
                      alert("Failed to update submodule. Please try again.");
                    }
                  }
                } else {
                  // Add mode: call API to create submodule
                  try {
                    const response = await createSubmodule({
                      subModuleName: submoduleForm.name,
                      moduleId: Number(currentModuleIdForSubmodule),
                    });
                    console.log("Submodule API response:", response);
                    if (response.success) {
                      // Refresh modules after adding
                      fetchModules();
                      setIsAddSubmoduleModalOpen(false);
                      setIsEditingSubmodule(false);
                      setEditingSubmoduleId(null);
                      alert("Submodule added successfully.");
                    } else {
                      alert("Submodule added successfully.");
                    }
                  } catch (error: any) {
                    if (error.response && error.response.data) {
                      alert("Failed to add submodule: " + JSON.stringify(error.response.data));
                    } else {
                      alert("Failed to add submodule. Please try again.");
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

      {/* Fixed Quick Add Button */}
      < div
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
        <QuickAddTestCase selectedProjectId={selectedProjectId || ""} />
        <QuickAddDefect />
      </div >
    </div >
  );
};
