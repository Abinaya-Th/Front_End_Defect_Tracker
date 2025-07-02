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
import { createSubmodule } from "../api/module/createModule";
import { Module, Submodule } from "../types/index";
import { getModulesByProjectId } from "../api/module/getModule";
import axios from "axios";

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
    modulesByProject,
    addModule,
    updateModule,
    deleteModule,
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
  const [modulesByProjectId, setModulesByProjectId] = useState<any[]>([]);

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

  useEffect(() => {
    if (projectId) {
      setSelectedProjectId(projectId);
    }
  }, [projectId, setSelectedProjectId]);

  // Get modules for selected project from context
  const modules = selectedProjectId
    ? modulesByProject[selectedProjectId] || []
    : [];

  // Filter developers (engineers/developers)
  const availableDevelopers = employees.filter(
    (emp) =>
      emp.designation.toLowerCase().includes("developer") ||
      emp.designation.toLowerCase().includes("engineer") ||
      emp.department.toLowerCase().includes("engineering")
  );

  const handleAddModule = async () => {
    if (moduleForm.name.trim() && selectedProjectId) {
      const payload = {
        moduleName: moduleForm.name,
        projectId: selectedProjectId,
        
      }
      console.log({payload});
      
      try {
        // Call backend API to create module
        const response = await createModuleApi(payload);
        if (response.success && response.module) {
          addModule(selectedProjectId, response.module);
        }
        setModuleForm({ name: "" });
        setIsAddModuleModalOpen(false);
      } catch (error) {
        alert("Failed to add module. Please try again.");
      }
    }
  };

  const handleModuleAssignment = (module: Module, submodule?: Submodule) => {
    setSelectedModuleForAssignment(module);
    setSelectedSubmoduleForAssignment(submodule || null);
    setAssignmentForm({
      moduleId: module.id,
      submoduleId: submodule?.id,
      employeeIds: submodule ? submodule.assignedDevs : module.assignedDevs,
    });
    setIsAssignmentModalOpen(true);
  };

  // Assignment handler: update via context
  const handleSaveAssignment = () => {
    if (!selectedProjectId || !assignmentForm.moduleId) return;
    const module = modules.find((m) => m.id === assignmentForm.moduleId);
    if (!module) return;
    if (assignmentForm.submoduleId) {
      // Update only the submodule's assignedDevs
      const updatedSubmodules = module.submodules.map((sub) =>
        sub.id === assignmentForm.submoduleId
          ? { ...sub, assignedDevs: assignmentForm.employeeIds }
          : sub
      );
      updateModule(selectedProjectId, module.id, {
        ...module,
        submodules: updatedSubmodules,
      });
    } else {
      // Update module and all submodules' assignedDevs
      const updatedSubmodules = module.submodules.map((sub) => ({
        ...sub,
        assignedDevs: assignmentForm.employeeIds,
      }));
      updateModule(selectedProjectId, module.id, {
        ...module,
        assignedDevs: assignmentForm.employeeIds,
        submodules: updatedSubmodules,
      });
    }
    setIsAssignmentModalOpen(false);
  };

  const handleEditModule = (module: Module) => {
    setEditingModule(module);
    setModuleForm({
      name: module.name,
    });
    setIsEditModuleModalOpen(true);
  };

  const handleUpdateModule = async () => {
    if (moduleForm.name.trim() && editingModule && selectedProjectId) {
      // Directly update via context (no API wrapper)
      updateModule(selectedProjectId, editingModule.id, {
        ...editingModule,
        name: moduleForm.name,
      });
      setModuleForm({ name: "" });
      setEditingModule(null);
      setIsEditModuleModalOpen(false);
    }
  };

  const handleDeleteModule = async (moduleId: string) => {
    if (
      window.confirm(
        "Are you sure you want to delete this module? This will also delete all submodules."
      )
    ) {
      if (selectedProjectId) {
        // Directly update via context (no API wrapper)
        deleteModule(selectedProjectId, moduleId);
      }
    }
  };

  const handleBulkAssignment = () => {
    if (selectedItems.length > 0) {
      setAssignmentForm({
        moduleId: "",
        employeeIds: [],
      });
      setIsBulkAssignmentModalOpen(true);
    }
  };

  // Bulk assignment handler: update via context
  const handleSaveBulkAssignment = () => {
    if (!selectedProjectId) return;
    selectedItems.forEach((item) => {
      const module = modules.find((m) => m.id === item.moduleId);
      if (!module) return;
      if (item.type === "module") {
        // Assign to module and all submodules
        const updatedSubmodules = module.submodules.map((sub) => ({
          ...sub,
          assignedDevs: assignmentForm.employeeIds,
        }));
        updateModule(selectedProjectId, module.id, {
          ...module,
          assignedDevs: assignmentForm.employeeIds,
          submodules: updatedSubmodules,
        });
      } else if (item.type === "submodule" && item.submoduleId) {
        // Assign to only this submodule
        const updatedSubmodules = module.submodules.map((sub) =>
          sub.id === item.submoduleId
            ? { ...sub, assignedDevs: assignmentForm.employeeIds }
            : sub
        );
        updateModule(selectedProjectId, module.id, {
          ...module,
          submodules: updatedSubmodules,
        });
      }
    });
    setSelectedItems([]);
    setIsBulkAssignmentModalOpen(false);
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
        const module = modules.find((m) => m.id === moduleId);
        const newItems = [
          { type: "module" as const, moduleId, submoduleId: undefined },
          ...(module?.submodules.map((sub) => ({
            type: "submodule" as const,
            moduleId,
            submoduleId: sub.id,
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
        const module = modules.find((m) => m.id === moduleId);
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
      const allItems = modules.flatMap((module) => [
        {
          type: "module" as const,
          moduleId: module.id,
          submoduleId: undefined,
        },
        ...module.submodules.map((sub) => ({
          type: "submodule" as const,
          moduleId: module.id,
          submoduleId: sub.id,
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
      modules.length > 0 &&
      modules.every((module) =>
        selectedItems.some(
          (item) => item.type === "module" && item.moduleId === module.id
        )
      )
    );
  };

  const getAssignedDevNames = (devIds: string[]) => {
    return devIds.map((id) => {
      const dev = employees.find((e) => e.id === id);
      return dev ? `${dev.firstName} ${dev.lastName}` : "Unknown";
    });
  };

  const getAllModuleDevelopers = (module: Module) => {
    // Get all unique developers assigned to this module and its submodules
    const allDevIds = new Set<string>();

    // Add module-level assignments
    module.assignedDevs.forEach((id) => allDevIds.add(id));

    // Add submodule-level assignments
    module.submodules.forEach((submodule) => {
      submodule.assignedDevs.forEach((id) => allDevIds.add(id));
    });

    return Array.from(allDevIds);
  };

  // Project selection handler
  const handleProjectSelect = (id: string) => {
    setSelectedProjectId(id);
  };

  const project = projects.find((p) => p.id === selectedProjectId);

  console.log(selectedProjectId);
  
   const fetchModules = async () => {
    if (!selectedProjectId) return;
    try {
      const response = await getModulesByProjectId(selectedProjectId);
      console.log("Fetched modules:", response); // Debug: log the response
      
      setModulesByProjectId(response.data);
    } catch (error) {
      console.error("Error fetching modules:", error);
    }
  };

  useEffect(() => {
    
    fetchModules();
  }, [selectedProjectId]);

console.log({modulesByProjectId});

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
                  {selectedProjectId
                    ? `Project: ${project?.name}`
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
                    <span>Allocate ({selectedItems.length})</span>
                  </Button>
                )}
              </div>
              <div className="text-sm text-gray-500">
                {availableDevelopers.length} developers available
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
                    <span className="text-sm text-gray-500">
                      {selectedItems.length} item(s) selected
                    </span>
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
            {/* Modules Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {modulesByProjectId.map((module) => (
                <Card key={module.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={isItemSelected("module", module.id)}
                          onChange={(e) =>
                            handleSelectItem("module", module.id, e.target.checked)
                          }
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <h3 className="text-lg font-semibold text-gray-900">
                          {module.moduleName}
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
                          onClick={() => handleDeleteModule(module.id)}
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
                          {module.submodules.map((sub: any) => (
                            <li key={sub.id} className="text-gray-800 text-sm flex items-center justify-between group">
                              <span>{sub.name}</span>
                              <span className="flex items-center space-x-2 opacity-80 group-hover:opacity-100">
                                <button
                                  type="button"
                                  className="p-1 hover:text-blue-600"
                                  title="Edit Submodule"
                                  onClick={() => {
                                    setCurrentModuleIdForSubmodule(module.id);
                                    setIsAddSubmoduleModalOpen(true);
                                    setSubmoduleForm({ name: sub.name });
                                    setIsEditingSubmodule(true);
                                    setEditingSubmoduleId(sub.id);
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
                                        const response = await axios.delete(`http://34.57.197.188:8087/api/v1/subModule/${sub.id}`);
                                        if (response.data && response.data.success) {
                                          setModulesByProjectId(prev =>
                                            prev.map(m =>
                                              m.id === module.id
                                                ? {
                                                    ...m,
                                                    submodules: m.submodules.filter((s: any) => s.id !== sub.id)
                                                  }
                                                : m
                                            )
                                          );
                                          alert("Submodule deleted successfully.");
                                        } else {
                                          alert("Failed to delete submodule. Please try again.");
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
                          ))}
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
                          setCurrentModuleIdForSubmodule(module.id);
                          setIsAddSubmoduleModalOpen(true);
                          setSubmoduleForm({ name: "" });
                        }}
                      >
                        <Plus className="w-4 h-4 mr-1" /> Add Submodule
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
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

      {/* Assignment Modal */}
      <Modal
        isOpen={isAssignmentModalOpen}
        onClose={() => setIsAssignmentModalOpen(false)}
        title={`Assign Developers - ${selectedModuleForAssignment?.name}${selectedSubmoduleForAssignment
          ? ` > ${selectedSubmoduleForAssignment.name}`
          : ""
          }`}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Developers
            </label>
            <div className="max-h-60 overflow-y-auto space-y-2">
              {availableDevelopers.map((dev) => (
                <label
                  key={dev.id}
                  className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded"
                >
                  <input
                    type="checkbox"
                    checked={assignmentForm.employeeIds.includes(dev.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setAssignmentForm((prev: ModuleAssignment) => ({
                          ...prev,
                          employeeIds: [...prev.employeeIds, dev.id],
                        }));
                      } else {
                        setAssignmentForm((prev: ModuleAssignment) => ({
                          ...prev,
                          employeeIds: prev.employeeIds.filter(
                            (id) => id !== dev.id
                          ),
                        }));
                      }
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {dev.firstName} {dev.lastName}
                    </div>
                    <div className="text-xs text-gray-500">
                      {dev.designation} • {dev.department}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => setIsAssignmentModalOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveAssignment}>Save Assignment</Button>
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
            <Button onClick={handleUpdateModule}>Update Module</Button>
          </div>
        </div>
      </Modal>

      {/* Bulk Assignment Modal */}
      <Modal
        isOpen={isBulkAssignmentModalOpen}
        onClose={() => {
          setIsBulkAssignmentModalOpen(false);
          setSelectedItems([]);
        }}
        title={`Bulk Assign Developers (${selectedItems.length} items)`}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Selected Items
            </label>
            <div className="max-h-32 overflow-y-auto p-3 bg-gray-50 rounded text-sm">
              {selectedItems.map((item, index) => {
                const module = modules.find((m) => m.id === item.moduleId);
                if (item.type === "module") {
                  return <div key={index}>📁 {module?.name}</div>;
                } else {
                  const submodule = module?.submodules.find(
                    (s) => s.id === item.submoduleId
                  );
                  return (
                    <div key={index}>
                      📄 {module?.name} → {submodule?.name}
                    </div>
                  );
                }
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Developers
            </label>
            <div className="max-h-60 overflow-y-auto space-y-2">
              {availableDevelopers.map((dev) => (
                <label
                  key={dev.id}
                  className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded"
                >
                  <input
                    type="checkbox"
                    checked={assignmentForm.employeeIds.includes(dev.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setAssignmentForm((prev: ModuleAssignment) => ({
                          ...prev,
                          employeeIds: [...prev.employeeIds, dev.id],
                        }));
                      } else {
                        setAssignmentForm((prev: ModuleAssignment) => ({
                          ...prev,
                          employeeIds: prev.employeeIds.filter(
                            (id) => id !== dev.id
                          ),
                        }));
                      }
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {dev.firstName} {dev.lastName}
                    </div>
                    <div className="text-xs text-gray-500">
                      {dev.designation} • {dev.department}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => {
                setIsBulkAssignmentModalOpen(false);
                setSelectedItems([]);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveBulkAssignment}>
              Assign to All Selected
            </Button>
          </div>
        </div>
      </Modal>

      {/* Add Submodule Modal */}
      <Modal
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
                      `http://34.57.197.188:8087/api/v1/subModule/${editingSubmoduleId}`,
                      { subModuleName: submoduleForm.name }
                    );
                    if (response.data && response.data.success) {
                      setModulesByProjectId(prev =>
                        prev.map(module =>
                          module.id === currentModuleIdForSubmodule
                            ? {
                                ...module,
                                submodules: module.submodules.map((sub: any) =>
                                  sub.id === editingSubmoduleId ? { ...sub, name: submoduleForm.name } : sub
                                )
                              }
                            : module
                        )
                      );
                      alert("Submodule updated successfully.");
                    } else {
                      alert("Failed to update submodule. Please try again.");
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
                    if (response.success && response.submodule) {
                      setModulesByProjectId(prev =>
                        prev.map(module =>
                          module.id === currentModuleIdForSubmodule
                            ? {
                                ...module,
                                submodules: [
                                  ...(Array.isArray(module.submodules) ? module.submodules : []),
                                  response.submodule,
                                ],
                              }
                            : module
                        )
                      );
                    } else {
                      alert("Failed to add submodule. Please try again.");
                    }
                  } catch (error: any) {
                    if (error.response && error.response.data) {
                      alert("Failed to add submodule: " + JSON.stringify(error.response.data));
                    } else {
                      alert("Failed to add submodule. Please try again.");
                    }
                  }
                }
                setIsAddSubmoduleModalOpen(false);
                setIsEditingSubmodule(false);
                setEditingSubmoduleId(null);
              }}
            >
              {isEditingSubmodule ? 'Update Submodule' : 'Add Submodule'}
            </Button>
          </div>
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
