import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Users, UserPlus,  ChevronRight, ChevronLeft } from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { useApp } from '../context/AppContext';
import { Badge } from '../components/ui/Badge';
import { useParams, useNavigate } from 'react-router-dom';
import { mockModules } from './TestCase';
import QuickAddTestCase from './QuickAddTestCase';
import QuickAddDefect from './QuickAddDefect';

interface Module {
  id: string;
  name: string;
  submodules: Submodule[];
  assignedDevs: string[];
}

interface Submodule {
  id: string;
  name: string;
  assignedDevs: string[];
}

interface ModuleAssignment {
  moduleId: string;
  submoduleId?: string;
  employeeIds: string[];
}

export const ModuleManagement: React.FC = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { projects, employees, setSelectedProjectId } = useApp();

  // State for modules (extended version of mockModules)
  const [modules, setModules] = useState<Module[]>([]);
  const [isAddModuleModalOpen, setIsAddModuleModalOpen] = useState(false);
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [isEditModuleModalOpen, setIsEditModuleModalOpen] = useState(false);
  const [isBulkAssignmentModalOpen, setIsBulkAssignmentModalOpen] = useState(false);
  const [selectedModuleForAssignment, setSelectedModuleForAssignment] = useState<Module | null>(null);
  const [selectedSubmoduleForAssignment, setSelectedSubmoduleForAssignment] = useState<Submodule | null>(null);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [selectedItems, setSelectedItems] = useState<Array<{ type: 'module' | 'submodule', moduleId: string, submoduleId?: string }>>([]);

  // Form states
  const [moduleForm, setModuleForm] = useState({
    name: '',
    submodules: [{ id: '', name: '' }]
  });

  const [assignmentForm, setAssignmentForm] = useState<ModuleAssignment>({
    moduleId: '',
    employeeIds: []
  });

  useEffect(() => {
    if (projectId) {
      setSelectedProjectId(projectId);
      // Initialize modules from mockModules
      const projectModules = mockModules[projectId] || [];
      const extendedModules: Module[] = projectModules.map(module => ({
        id: module.id,
        name: module.name,
        submodules: module.submodules.map(sub => ({
          id: `${module.id}-${sub.toLowerCase().replace(/\s+/g, '-')}`,
          name: sub,
          assignedDevs: []
        })),
        assignedDevs: []
      }));
      setModules(extendedModules);
    }
  }, [projectId, setSelectedProjectId]);

  // Filter developers (engineers/developers)
  const availableDevelopers = employees.filter(emp =>
    emp.designation.toLowerCase().includes('developer') ||
    emp.designation.toLowerCase().includes('engineer') ||
    emp.department.toLowerCase().includes('engineering')
  );

  const handleAddModule = () => {
    if (moduleForm.name.trim()) {
      const newModule: Module = {
        id: `mod-${Date.now()}`,
        name: moduleForm.name,
        submodules: moduleForm.submodules.filter(sub => sub.name.trim()).map(sub => ({
          id: `sub-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: sub.name,
          assignedDevs: []
        })),
        assignedDevs: []
      };
      setModules(prev => [...prev, newModule]);
      setModuleForm({ name: '', submodules: [{ id: '', name: '' }] });
      setIsAddModuleModalOpen(false);
    }
  };

  const handleAddSubmodule = () => {
    setModuleForm(prev => ({
      ...prev,
      submodules: [...prev.submodules, { id: '', name: '' }]
    }));
  };

  const handleRemoveSubmodule = (index: number) => {
    setModuleForm(prev => ({
      ...prev,
      submodules: prev.submodules.filter((_, i) => i !== index)
    }));
  };

  const handleSubmoduleChange = (index: number, value: string) => {
    setModuleForm(prev => ({
      ...prev,
      submodules: prev.submodules.map((sub, i) =>
        i === index ? { ...sub, name: value } : sub
      )
    }));
  };

  const handleModuleAssignment = (module: Module, submodule?: Submodule) => {
    setSelectedModuleForAssignment(module);
    setSelectedSubmoduleForAssignment(submodule || null);
    setAssignmentForm({
      moduleId: module.id,
      submoduleId: submodule?.id,
      employeeIds: submodule ? submodule.assignedDevs : module.assignedDevs
    });
    setIsAssignmentModalOpen(true);
  };

  const handleSaveAssignment = () => {
    setModules(prev => prev.map(module => {
      if (module.id === assignmentForm.moduleId) {
        if (assignmentForm.submoduleId) {
          // Assign to submodule
          return {
            ...module,
            submodules: module.submodules.map(sub =>
              sub.id === assignmentForm.submoduleId
                ? { ...sub, assignedDevs: assignmentForm.employeeIds }
                : sub
            )
          };
        } else {
          // Assign to module level - this will also assign to all submodules
          return {
            ...module,
            assignedDevs: assignmentForm.employeeIds,
            submodules: module.submodules.map(sub => ({
              ...sub,
              assignedDevs: assignmentForm.employeeIds // Inherit module assignment
            }))
          };
        }
      }
      return module;
    }));
    setIsAssignmentModalOpen(false);
  };

  const handleEditModule = (module: Module) => {
    setEditingModule(module);
    setModuleForm({
      name: module.name,
      submodules: module.submodules.map(sub => ({ id: sub.id, name: sub.name }))
    });
    setIsEditModuleModalOpen(true);
  };

  const handleUpdateModule = () => {
    if (moduleForm.name.trim() && editingModule) {
      setModules(prev => prev.map(module => {
        if (module.id === editingModule.id) {
          return {
            ...module,
            name: moduleForm.name,
            submodules: moduleForm.submodules.filter(sub => sub.name.trim()).map(sub => ({
              id: sub.id || `sub-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              name: sub.name,
              assignedDevs: module.assignedDevs // Inherit module assignment
            }))
          };
        }
        return module;
      }));
      setModuleForm({ name: '', submodules: [{ id: '', name: '' }] });
      setEditingModule(null);
      setIsEditModuleModalOpen(false);
    }
  };

  const handleDeleteModule = (moduleId: string) => {
    if (window.confirm('Are you sure you want to delete this module? This will also delete all submodules.')) {
      setModules(prev => prev.filter(module => module.id !== moduleId));
    }
  };

  const handleBulkAssignment = () => {
    if (selectedItems.length > 0) {
      setAssignmentForm({
        moduleId: '',
        employeeIds: []
      });
      setIsBulkAssignmentModalOpen(true);
    }
  };

  const handleSaveBulkAssignment = () => {
    setModules(prev => prev.map(module => {
      const moduleSelected = selectedItems.some(item => item.type === 'module' && item.moduleId === module.id);
      const submodulesToUpdate = selectedItems.filter(item =>
        item.type === 'submodule' && item.moduleId === module.id
      );

      if (moduleSelected) {
        // Update module and all its submodules
        return {
          ...module,
          assignedDevs: assignmentForm.employeeIds,
          submodules: module.submodules.map(sub => ({
            ...sub,
            assignedDevs: assignmentForm.employeeIds
          }))
        };
      } else if (submodulesToUpdate.length > 0) {
        // Update only specific submodules
        return {
          ...module,
          submodules: module.submodules.map(sub => {
            const shouldUpdate = submodulesToUpdate.some(item => item.submoduleId === sub.id);
            return shouldUpdate
              ? { ...sub, assignedDevs: assignmentForm.employeeIds }
              : sub;
          })
        };
      }
      return module;
    }));
    setSelectedItems([]);
    setIsBulkAssignmentModalOpen(false);
  };

  const handleSelectItem = (type: 'module' | 'submodule', moduleId: string, checked: boolean, submoduleId?: string) => {
    if (checked) {
      if (type === 'module') {
        // When selecting a module, also select all its submodules
        const module = modules.find(m => m.id === moduleId);
        const newItems = [
          { type: 'module' as const, moduleId, submoduleId: undefined },
          ...(module?.submodules.map(sub => ({
            type: 'submodule' as const,
            moduleId,
            submoduleId: sub.id
          })) || [])
        ];
        setSelectedItems(prev => [
          ...prev.filter(item => !(item.moduleId === moduleId)),
          ...newItems
        ]);
      } else {
        // When selecting a submodule, check if all submodules are now selected
        setSelectedItems(prev => [...prev, { type, moduleId, submoduleId }]);

        // Check if all submodules of this module are now selected
        const module = modules.find(m => m.id === moduleId);
        const allSubmodules = module?.submodules || [];
        const selectedSubmodules = selectedItems.filter(item =>
          item.type === 'submodule' && item.moduleId === moduleId
        );

        if (allSubmodules.length > 0 &&
          selectedSubmodules.length + 1 === allSubmodules.length) {
          // All submodules are selected, so select the module too
          setSelectedItems(prev => [
            ...prev,
            { type: 'module' as const, moduleId, submoduleId: undefined }
          ]);
        }
      }
    } else {
      if (type === 'module') {
        // When deselecting a module, also deselect all its submodules
        setSelectedItems(prev => prev.filter(item => item.moduleId !== moduleId));
      } else {
        // When deselecting a submodule, also deselect the module if it was selected
        setSelectedItems(prev => prev.filter(item =>
          !(item.type === type && item.moduleId === moduleId && item.submoduleId === submoduleId) &&
          !(item.type === 'module' && item.moduleId === moduleId)
        ));
      }
    }
  };

  const handleSelectAllModules = (checked: boolean) => {
    if (checked) {
      // Select all modules and all their submodules
      const allItems = modules.flatMap(module => [
        { type: 'module' as const, moduleId: module.id, submoduleId: undefined },
        ...module.submodules.map(sub => ({
          type: 'submodule' as const,
          moduleId: module.id,
          submoduleId: sub.id
        }))
      ]);
      setSelectedItems(allItems);
    } else {
      setSelectedItems([]);
    }
  };

  const isItemSelected = (type: 'module' | 'submodule', moduleId: string, submoduleId?: string) => {
    return selectedItems.some(item =>
      item.type === type && item.moduleId === moduleId && item.submoduleId === submoduleId
    );
  };

  const isAllModulesSelected = () => {
    return modules.length > 0 && modules.every(module =>
      selectedItems.some(item => item.type === 'module' && item.moduleId === module.id)
    );
  };

  const getAssignedDevNames = (devIds: string[]) => {
    return devIds.map(id => {
      const dev = employees.find(e => e.id === id);
      return dev ? `${dev.firstName} ${dev.lastName}` : 'Unknown';
    });
  };

  const getAllModuleDevelopers = (module: Module) => {
    // Get all unique developers assigned to this module and its submodules
    const allDevIds = new Set<string>();

    // Add module-level assignments
    module.assignedDevs.forEach(id => allDevIds.add(id));

    // Add submodule-level assignments
    module.submodules.forEach(submodule => {
      submodule.assignedDevs.forEach(id => allDevIds.add(id));
    });

    return Array.from(allDevIds);
  };

  if (!projectId) {
    return <div className="p-8 text-center text-gray-500">Please select a project to manage modules.</div>;
  }

  const project = projects.find(p => p.id === projectId);

  return (
    <div className="max-w-6xl mx-auto">
      {/* Project Selection Header */}
      <div className="flex-none p-6 pb-4">
        <div className="flex justify-between items-center mb-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-gray-900">Module Management</h1>
            <p className="text-sm text-gray-500">
              {projectId ? `Project: ${project?.name}` : 'Select a project to begin'}
            </p>
          </div>
        </div>

        {/* Project Selection Panel */}
        <Card>
          <CardContent className="p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Project Selection</h2>
            <div className="relative flex items-center">
              <button
                onClick={() => {
                  const container = document.getElementById('project-scroll');
                  if (container) container.scrollLeft -= 200;
                }}
                className="flex-shrink-0 z-10 bg-white shadow-md rounded-full p-1 hover:bg-gray-50 mr-2"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div
                id="project-scroll"
                className="flex space-x-2 overflow-x-auto pb-2 scroll-smooth flex-1"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', maxWidth: '100%' }}
              >
                {projects.map(project => (
                  <Button
                    key={project.id}
                    variant={projectId === project.id ? 'primary' : 'secondary'}
                    onClick={() => {
                      setSelectedProjectId(project.id);
                      navigate(`/projects/${project.id}/module-management`);
                    }}
                    className="whitespace-nowrap m-2"
                  >
                    {project.name}
                  </Button>
                ))}
              </div>
              <button
                onClick={() => {
                  const container = document.getElementById('project-scroll');
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
                <span className="text-sm font-medium text-gray-700">Select All Modules</span>
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
          {modules.map((module) => (
            <Card key={module.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={isItemSelected('module', module.id)}
                      onChange={(e) => handleSelectItem('module', module.id, e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <h3 className="text-lg font-semibold text-gray-900">{module.name}</h3>
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

                {/* Module Level Assignment */}
                {getAllModuleDevelopers(module).length > 0 && (
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Users className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">Complete Module Team</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {getAssignedDevNames(getAllModuleDevelopers(module)).map((name, index) => (
                        <Badge key={index} variant="info" className="text-xs">
                          {name}
                        </Badge>
                      ))}
                    </div>
                    <div className="mt-2 text-xs text-blue-600">
                      {module.assignedDevs.length > 0 && (
                        <span>Module level: {getAssignedDevNames(module.assignedDevs).join(', ')}</span>
                      )}
                      {module.submodules.some(sub => sub.assignedDevs.length > 0) && (
                        <div className="mt-1">
                          <span>Submodule level: {module.submodules
                            .filter(sub => sub.assignedDevs.length > 0)
                            .map(sub => `${sub.name} (${getAssignedDevNames(sub.assignedDevs).join(', ')})`)
                            .join('; ')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Submodules */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-700">Submodules</h4>
                  {module.submodules.map((submodule) => (
                    <div key={submodule.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={isItemSelected('submodule', module.id, submodule.id)}
                          onChange={(e) => handleSelectItem('submodule', module.id, e.target.checked, submodule.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{submodule.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {/* Show submodule-specific assignments if different from module */}
                        {submodule.assignedDevs.length > 0 &&
                          JSON.stringify(submodule.assignedDevs.sort()) !== JSON.stringify(module.assignedDevs.sort()) && (
                            <div className="flex -space-x-1">
                              {submodule.assignedDevs.slice(0, 3).map((devId, index) => {
                                const dev = employees.find(e => e.id === devId);
                                return (
                                  <div
                                    key={index}
                                    className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs border-2 border-white"
                                    title={dev ? `${dev.firstName} ${dev.lastName}` : 'Unknown'}
                                  >
                                    {dev ? dev.firstName[0] : '?'}
                                  </div>
                                );
                              })}
                              {submodule.assignedDevs.length > 3 && (
                                <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 text-xs border-2 border-white">
                                  +{submodule.assignedDevs.length - 3}
                                </div>
                              )}
                            </div>
                          )}
                        {/* Show inherited module assignments */}
                        {module.assignedDevs.length > 0 &&
                          JSON.stringify(submodule.assignedDevs.sort()) === JSON.stringify(module.assignedDevs.sort()) && (
                            <div className="flex -space-x-1">
                              {module.assignedDevs.slice(0, 3).map((devId, index) => {
                                const dev = employees.find(e => e.id === devId);
                                return (
                                  <div
                                    key={index}
                                    className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs border-2 border-white"
                                    title={`${dev ? dev.firstName + ' ' + dev.lastName : 'Unknown'} (inherited from module)`}
                                  >
                                    {dev ? dev.firstName[0] : '?'}
                                  </div>
                                );
                              })}
                              {module.assignedDevs.length > 3 && (
                                <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 text-xs border-2 border-white">
                                  +{module.assignedDevs.length - 3}
                                </div>
                              )}
                            </div>
                          )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Add Module Modal */}
      <Modal
        isOpen={isAddModuleModalOpen}
        onClose={() => setIsAddModuleModalOpen(false)}
        title="Add New Module"
        size="xl"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Module Name</label>
            <Input
              value={moduleForm.name}
              onChange={(e) => setModuleForm(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter module name"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">Submodules</label>
              <Button
                type="button"
                onClick={handleAddSubmodule}
                className="flex items-center space-x-1 text-sm"
              >
                <Plus className="w-3 h-3" />
                <span>Add Submodule</span>
              </Button>
            </div>
            <div className="space-y-2">
              {moduleForm.submodules.map((submodule, index) => (
                <div key={index} className="flex space-x-2">
                  <Input
                    value={submodule.name}
                    onChange={(e) => handleSubmoduleChange(index, e.target.value)}
                    placeholder={`Submodule ${index + 1}`}
                  />
                  {moduleForm.submodules.length > 1 && (
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => handleRemoveSubmodule(index)}
                      className="px-3"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => setIsAddModuleModalOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleAddModule}>
              Add Module
            </Button>
          </div>
        </div>
      </Modal>

      {/* Assignment Modal */}
      <Modal
        isOpen={isAssignmentModalOpen}
        onClose={() => setIsAssignmentModalOpen(false)}
        title={`Assign Developers - ${selectedModuleForAssignment?.name}${selectedSubmoduleForAssignment ? ` > ${selectedSubmoduleForAssignment.name}` : ''}`}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Developers</label>
            <div className="max-h-60 overflow-y-auto space-y-2">
              {availableDevelopers.map((dev) => (
                <label key={dev.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
                  <input
                    type="checkbox"
                    checked={assignmentForm.employeeIds.includes(dev.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setAssignmentForm(prev => ({
                          ...prev,
                          employeeIds: [...prev.employeeIds, dev.id]
                        }));
                      } else {
                        setAssignmentForm(prev => ({
                          ...prev,
                          employeeIds: prev.employeeIds.filter(id => id !== dev.id)
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
            <Button onClick={handleSaveAssignment}>
              Save Assignment
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Module Modal */}
      <Modal
        isOpen={isEditModuleModalOpen}
        onClose={() => {
          setIsEditModuleModalOpen(false);
          setEditingModule(null);
          setModuleForm({ name: '', submodules: [{ id: '', name: '' }] });
        }}
        title="Edit Module"
        size="xl"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Module Name</label>
            <Input
              value={moduleForm.name}
              onChange={(e) => setModuleForm(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter module name"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">Submodules</label>
              <Button
                type="button"
                onClick={handleAddSubmodule}
                className="flex items-center space-x-1 text-sm"
              >
                <Plus className="w-3 h-3" />
                <span>Add Submodule</span>
              </Button>
            </div>
            <div className="space-y-2">
              {moduleForm.submodules.map((submodule, index) => (
                <div key={index} className="flex space-x-2">
                  <Input
                    value={submodule.name}
                    onChange={(e) => handleSubmoduleChange(index, e.target.value)}
                    placeholder={`Submodule ${index + 1}`}
                  />
                  {moduleForm.submodules.length > 1 && (
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => handleRemoveSubmodule(index)}
                      className="px-3"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => {
                setIsEditModuleModalOpen(false);
                setEditingModule(null);
                setModuleForm({ name: '', submodules: [{ id: '', name: '' }] });
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateModule}>
              Update Module
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
        }}
        title={`Bulk Assign Developers (${selectedItems.length} items)`}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Selected Items</label>
            <div className="max-h-32 overflow-y-auto p-3 bg-gray-50 rounded text-sm">
              {selectedItems.map((item, index) => {
                const module = modules.find(m => m.id === item.moduleId);
                if (item.type === 'module') {
                  return <div key={index}>📁 {module?.name}</div>;
                } else {
                  const submodule = module?.submodules.find(s => s.id === item.submoduleId);
                  return <div key={index}>📄 {module?.name} → {submodule?.name}</div>;
                }
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Developers</label>
            <div className="max-h-60 overflow-y-auto space-y-2">
              {availableDevelopers.map((dev) => (
                <label key={dev.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
                  <input
                    type="checkbox"
                    checked={assignmentForm.employeeIds.includes(dev.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setAssignmentForm(prev => ({
                          ...prev,
                          employeeIds: [...prev.employeeIds, dev.id]
                        }));
                      } else {
                        setAssignmentForm(prev => ({
                          ...prev,
                          employeeIds: prev.employeeIds.filter(id => id !== dev.id)
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
      {/* Fixed Quick Add Button */}
      <div style={{ position: 'fixed', bottom: 32, right: 32, zIndex: 50, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <QuickAddTestCase />
        <QuickAddDefect />
      </div>
    </div>
  );
};
