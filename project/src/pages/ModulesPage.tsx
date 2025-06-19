import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Check, Package } from 'lucide-react';
import { Project, Module, Submodule } from '../../types';

interface ModulesPageProps {
  project?: Project;
}

const ModulesPage: React.FC<ModulesPageProps> = ({ project }) => {
  const [modules, setModules] = useState<Module[]>(project?.modules || []);
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [showSubmoduleModal, setShowSubmoduleModal] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [selectedModuleId, setSelectedModuleId] = useState<string>('');
  const [moduleFormData, setModuleFormData] = useState({ name: '' });
  const [submoduleFormData, setSubmoduleFormData] = useState({ name: '' });

  if (!project) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No project selected</p>
      </div>
    );
  }

  const handleAddModule = (e: React.FormEvent) => {
    e.preventDefault();
    const newModule: Module = {
      id: `m${Date.now()}`,
      name: moduleFormData.name,
      projectId: project.id,
      submodules: []
    };
    setModules([...modules, newModule]);
    setShowModuleModal(false);
    setModuleFormData({ name: '' });
  };

  const handleAddSubmodule = (e: React.FormEvent) => {
    e.preventDefault();
    const newSubmodule: Submodule = {
      id: `sm${Date.now()}`,
      name: submoduleFormData.name,
      moduleId: selectedModuleId
    };
    
    setModules(modules.map(module => 
      module.id === selectedModuleId
        ? { ...module, submodules: [...module.submodules, newSubmodule] }
        : module
    ));
    
    setShowSubmoduleModal(false);
    setSubmoduleFormData({ name: '' });
    setSelectedModuleId('');
  };

  const handleDeleteModule = (moduleId: string) => {
    setModules(modules.filter(module => module.id !== moduleId));
  };

  const handleDeleteSubmodule = (moduleId: string, submoduleId: string) => {
    setModules(modules.map(module => 
      module.id === moduleId
        ? { ...module, submodules: module.submodules.filter(sub => sub.id !== submoduleId) }
        : module
    ));
  };

  const openSubmoduleModal = (moduleId: string) => {
    setSelectedModuleId(moduleId);
    setShowSubmoduleModal(true);
  };

  // Calculate summary by severity (mock data for demonstration)
  // const getSummaryCards = () => {
  //   return [
  //     { severity: 'High', count: 15, color: 'bg-red-50 border-red-200 text-red-700' },
  //     { severity: 'Medium', count: 28, color: 'bg-yellow-50 border-yellow-200 text-yellow-700' },
  //     { severity: 'Low', count: 12, color: 'bg-green-50 border-green-200 text-green-700' }
  //   ];
  // };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {getSummaryCards().map((card, index) => (
          <div key={index} className={`p-4 rounded-lg border-2 ${card.color}`}>
            <div className="text-center">
              <p className="text-2xl font-bold">{card.count}</p>
              <p className="text-sm font-medium opacity-80">{card.severity} Severity</p>
            </div>
          </div>
        ))}
      </div> */}

      {/* Add Module Button */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowModuleModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Add Module</span>
        </button>
      </div>

      {/* Modules Table */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Package className="h-6 w-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Project Modules</h3>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Module Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submodules
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {modules.map((module) => (
                <tr key={module.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{module.name}</div>
                    <div className="text-sm text-gray-500">{module.id}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-2">
                      {module.submodules.map((submodule) => (
                        <div key={submodule.id} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded">
                          <div className="flex items-center space-x-2">
                            <Check className="h-4 w-4 text-green-500" />
                            <span className="text-sm text-gray-700">{submodule.name}</span>
                          </div>
                          <button
                            onClick={() => handleDeleteSubmodule(module.id, submodule.id)}
                            className="text-red-600 hover:text-red-900 p-1 rounded"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => openSubmoduleModal(module.id)}
                        className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm"
                      >
                        <Plus className="h-3 w-3" />
                        <span>Add Submodule</span>
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setEditingModule(module);
                          setModuleFormData({ name: module.name });
                          setShowModuleModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteModule(module.id)}
                        className="text-red-600 hover:text-red-900 p-1 rounded"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Module Modal */}
      {showModuleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingModule ? 'Edit Module' : 'Add New Module'}
            </h3>
            
            <form onSubmit={handleAddModule} className="space-y-4">
              <div>
                <label htmlFor="moduleName" className="block text-sm font-medium text-gray-700 mb-1">
                  Module Name
                </label>
                <input
                  type="text"
                  id="moduleName"
                  value={moduleFormData.name}
                  onChange={(e) => setModuleFormData({ name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowModuleModal(false);
                    setEditingModule(null);
                    setModuleFormData({ name: '' });
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingModule ? 'Update' : 'Add'} Module
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Submodule Modal */}
      {showSubmoduleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Submodule</h3>
            
            <form onSubmit={handleAddSubmodule} className="space-y-4">
              <div>
                <label htmlFor="submoduleName" className="block text-sm font-medium text-gray-700 mb-1">
                  Submodule Name
                </label>
                <input
                  type="text"
                  id="submoduleName"
                  value={submoduleFormData.name}
                  onChange={(e) => setSubmoduleFormData({ name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowSubmoduleModal(false);
                    setSubmoduleFormData({ name: '' });
                    setSelectedModuleId('');
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Submodule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModulesPage;