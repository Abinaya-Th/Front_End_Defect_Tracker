import React, { useState } from 'react';
import { PlusCircleIcon } from '@heroicons/react/24/solid';
import { Trash2, Edit2 } from 'lucide-react';

const Test = () => {
  const [expandedModule, setExpandedModule] = useState<string | null>(null);
  const [selectedSubModule, setSelectedSubModule] = useState<string | null>(null);
  const [showFormForSubModule, setShowFormForSubModule] = useState<string | null>(null);
  const [editingTestCase, setEditingTestCase] = useState<{subModuleId: string, index: number} | null>(null);
  const [hoveredSteps, setHoveredSteps] = useState<{x: number, y: number, steps: string[]} | null>(null);
  const [showCheckboxes, setShowCheckboxes] = useState<boolean>(false);

  const [testCases, setTestCases] = useState<Record<string, any[]>>({});
  const [selectedTestCases, setSelectedTestCases] = useState<Set<string>>(new Set());

  const [formData, setFormData] = useState({
    description: '',
    steps: [''],
    type: 'functional',
    severity: 'low',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleStepChange = (index: number, value: string) => {
    const updatedSteps = [...formData.steps];
    updatedSteps[index] = value;
    setFormData({ ...formData, steps: updatedSteps });
  };

  const addStep = () => {
    if (formData.steps.length < 5) {
      setFormData({ ...formData, steps: [...formData.steps, ''] });
    }
  };

  const removeStep = (index: number) => {
    const updatedSteps = formData.steps.filter((_, i) => i !== index);
    setFormData({ ...formData, steps: updatedSteps });
  };

  const resetForm = () => {
    setShowFormForSubModule(null);
    setEditingTestCase(null);
    setFormData({
      description: '',
      steps: [''],
      type: 'functional',
      severity: 'low',
    });
  };

  const handleSubmit = () => {
    // Validate required fields
    if (!formData.description.trim()) {
      alert('Please enter a description');
      return;
    }
    
    if (formData.steps.some(step => !step.trim())) {
      alert('Please fill in all test steps');
      return;
    }

    const newTestCase = { ...formData };
    
    if (editingTestCase) {
      // Update existing test case
      setTestCases(prev => {
        const updated = { ...prev };
        updated[editingTestCase.subModuleId][editingTestCase.index] = newTestCase;
        return updated;
      });
    } else {
      // Add new test case
      setTestCases(prev => ({
        ...prev,
        [showFormForSubModule!]: [...(prev[showFormForSubModule!] || []), newTestCase],
      }));
    }
    resetForm();
  };

  const handleEdit = (subModuleId: string, index: number) => {
    const testCase = testCases[subModuleId][index];
    setFormData({
      description: testCase.description,
      steps: testCase.steps,
      type: testCase.type,
      severity: testCase.severity,
    });
    setEditingTestCase({ subModuleId, index });
    setShowFormForSubModule(subModuleId);
    setSelectedSubModule(subModuleId);
  };

  const handleDelete = (subModuleId: string, index: number) => {
    if (window.confirm('Are you sure you want to delete this test case?')) {
      setTestCases(prev => {
        const updated = { ...prev };
        updated[subModuleId] = updated[subModuleId].filter((_, i) => i !== index);
        if (updated[subModuleId].length === 0) {
          delete updated[subModuleId];
        }
        return updated;
      });
      
      // Remove from selected test cases
      const testCaseId = `${subModuleId}-${index}`;
      setSelectedTestCases(prev => {
        const newSet = new Set(prev);
        newSet.delete(testCaseId);
        return newSet;
      });
    }
  };

  const handleTestCaseSelection = (subModuleId: string, index: number) => {
    const testCaseId = `${subModuleId}-${index}`;
    setSelectedTestCases(prev => {
      const newSet = new Set(prev);
      if (newSet.has(testCaseId)) {
        newSet.delete(testCaseId);
      } else {
        newSet.add(testCaseId);
      }
      return newSet;
    });
  };

  const handleSubModuleSelection = (subModuleId: string) => {
    const subModuleTestCases = testCases[subModuleId] || [];
    const testCaseIds = subModuleTestCases.map((_, index) => `${subModuleId}-${index}`);
    
    // If no test cases exist for this submodule, do nothing
    if (testCaseIds.length === 0) return;
    
    // Check if all test cases are currently selected
    const allSelected = testCaseIds.every(id => selectedTestCases.has(id));
    
    setSelectedTestCases(prev => {
      const newSet = new Set(prev);
      if (allSelected) {
        // Unselect all test cases for this submodule
        testCaseIds.forEach(id => newSet.delete(id));
      } else {
        // Select all test cases for this submodule
        testCaseIds.forEach(id => newSet.add(id));
      }
      return newSet;
    });
  };

  const handleModuleSelection = (moduleId: string) => {
    const module = MockModules.find(m => m.id === moduleId);
    if (!module) return;

    // Get all test case IDs for this module
    const allTestCaseIds: string[] = [];
    module.subModules.forEach(sub => {
      const subModuleTestCases = testCases[sub.id] || [];
      subModuleTestCases.forEach((_, index) => {
        allTestCaseIds.push(`${sub.id}-${index}`);
      });
    });

    // If no test cases exist for this module, do nothing
    if (allTestCaseIds.length === 0) return;

    // Check if all test cases are currently selected
    const allSelected = allTestCaseIds.every(id => selectedTestCases.has(id));

    setSelectedTestCases(prev => {
      const newSet = new Set(prev);
      if (allSelected) {
        // Unselect all test cases for this module
        allTestCaseIds.forEach(id => newSet.delete(id));
      } else {
        // Select all test cases for this module
        allTestCaseIds.forEach(id => newSet.add(id));
      }
      return newSet;
    });
  };

  const isModuleSelected = (moduleId: string) => {
    const module = MockModules.find(m => m.id === moduleId);
    if (!module) return false;

    // Get all test case IDs for this module
    const allTestCaseIds: string[] = [];
    module.subModules.forEach(sub => {
      const subModuleTestCases = testCases[sub.id] || [];
      subModuleTestCases.forEach((_, index) => {
        allTestCaseIds.push(`${sub.id}-${index}`);
      });
    });

    // Module is selected only if it has test cases AND all are selected
    return allTestCaseIds.length > 0 && allTestCaseIds.every(id => selectedTestCases.has(id));
  };

  const isSubModuleSelected = (subModuleId: string) => {
    const subModuleTestCases = testCases[subModuleId] || [];
    const testCaseIds = subModuleTestCases.map((_, index) => `${subModuleId}-${index}`);
    
    // Submodule is selected only if it has test cases AND all are selected
    return testCaseIds.length > 0 && testCaseIds.every(id => selectedTestCases.has(id));
  };

  const handleStepsHover = (e: React.MouseEvent, steps: string[]) => {
    setHoveredSteps({
      x: e.clientX,
      y: e.clientY,
      steps
    });
  };

  const handleStepsLeave = () => {
    setHoveredSteps(null);
  };

  // Mock data for modules and submodules
  const MockModules = [
    {
      id: 'm1',
      name: 'Module 1',
      subModules: [
        { id: 's1', name: 'Submodule A' },
        { id: 's2', name: 'Submodule B' },
      ],
    },
    {
      id: 'm2',
      name: 'Module 2',
      subModules: [
        { id: 's3', name: 'Submodule C' },
        { id: 's4', name: 'Submodule D' },
        { id: 's5', name: 'Submodule E' },
      ],
    },
    {
      id: 'm3',
      name: 'Module 3',
      subModules: [
        { id: 's6', name: 'Submodule F' },
        { id: 's7', name: 'Submodule G' },
        { id: 's8', name: 'Submodule H' },
        { id: 's9', name: 'Submodule I' },
      ],
    },
  ];

  const selectedSubName = MockModules.flatMap(m => m.subModules).find(sub => sub.id === selectedSubModule)?.name;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <div>
        <h1 className="text-2xl font-bold mb-1">Test Case Management</h1>
        <p className="text-l font-normal"> Select a module to view its submodules and manage test cases </p>
        </div>
        <button
          onClick={() => setShowCheckboxes(!showCheckboxes)}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            showCheckboxes 
              ? 'bg-gray-500 text-white hover:bg-gray-600' 
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
        >
          {showCheckboxes ? 'Hide' : 'Select'}
        </button>
      </div>

      {/* ---------- Module Buttons ---------- */}
      <div className="flex flex-wrap gap-4 justify-center mb-6">
        {MockModules.map(module => (
          <div key={module.id} className="flex items-center gap-2">
            {showCheckboxes && (
              <input
                type="checkbox"
                checked={isModuleSelected(module.id)}
                onChange={() => handleModuleSelection(module.id)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
            )}
            <button
              onClick={() => setExpandedModule(prev => (prev === module.id ? null : module.id))}
              className={`px-6 py-3 rounded-xl shadow transition ${
                expandedModule === module.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 hover:bg-blue-500 hover:text-white'
              }`}
            >
              {module.name}
            </button>
          </div>
        ))}
      </div>

      {/* ---------- Submodule Buttons ---------- */}
      {expandedModule && (
        <div className="flex flex-wrap gap-4 justify-center mb-8">
          {MockModules.find(m => m.id === expandedModule)?.subModules.map(sub => (
            <div key={sub.id} className="flex items-center gap-2">
              {showCheckboxes && (
                <input
                  type="checkbox"
                  checked={isSubModuleSelected(sub.id)}
                  onChange={() => handleSubModuleSelection(sub.id)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
              )}
              <div className="relative">
                <button
                  onClick={() => setSelectedSubModule(sub.id)}
                  className={`relative px-6 py-2 rounded-lg shadow bg-blue-100 hover:bg-blue-400 hover:text-white transition`}
                >
                  {sub.name}
                  <PlusCircleIcon
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation();
                      setShowFormForSubModule(sub.id);
                      setSelectedSubModule(sub.id);
                    }}
                    className="absolute -bottom-1 -right-1 h-5 w-5 text-blue-500 hover:text-white cursor-pointer"
                  />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ---------- Test Case Table ---------- */}
      {selectedSubModule && (
        <div className="max-w-6xl mx-auto bg-white p-4 rounded shadow mb-10">
          <h3 className="text-lg font-semibold mb-3">Test Cases for {selectedSubName}</h3>
          {testCases[selectedSubModule]?.length ? (
            <table className="w-full text-sm border border-gray-200">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="p-3">
                    {showCheckboxes && (
                      <input
                        type="checkbox"
                        checked={isSubModuleSelected(selectedSubModule)}
                        onChange={() => handleSubModuleSelection(selectedSubModule)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                    )}
                  </th>
                  <th className="p-3">Test Case ID</th>
                  <th className="p-3">Description</th>
                  <th className="p-3">Steps</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Severity</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {testCases[selectedSubModule].map((tc, i) => (
                  <tr key={i} className="border-t hover:bg-gray-50">
                    <td className="p-3">
                      {showCheckboxes && (
                        <input
                          type="checkbox"
                          checked={selectedTestCases.has(`${selectedSubModule}-${i}`)}
                          onChange={() => handleTestCaseSelection(selectedSubModule, i)}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                      )}
                    </td>
                    <td className="p-3 font-medium">TC{String(i + 1).padStart(3, '0')}</td>
                    <td className="p-3 truncate max-w-xs">{tc.description}</td>
                    <td className="p-3">
                      <span
                        className="text-blue-600 hover:underline cursor-pointer"
                        onMouseEnter={(e) => handleStepsHover(e, tc.steps)}
                        onMouseLeave={handleStepsLeave}
                      >
                        {tc.steps.length} steps
                      </span>
                    </td>
                    <td className="p-3">{tc.type}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        tc.severity === 'critical' ? 'bg-red-100 text-red-700' :
                        tc.severity === 'high' ? 'bg-orange-100 text-orange-700' :
                        tc.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {tc.severity}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleEdit(selectedSubModule, i)}
                          title="Edit"
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(selectedSubModule, i)}
                          title="Delete"
                          className="text-red-600 hover:text-red-800 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-gray-500">No test cases available.</p>
          )}
        </div>
      )}

      {/* ---------- Steps Hover Tooltip ---------- */}
      {hoveredSteps && (
        <div
          className="fixed z-50 bg-black text-white p-3 rounded shadow-lg max-w-xs"
          style={{
            left: hoveredSteps.x + 10,
            top: hoveredSteps.y - 10,
            pointerEvents: 'none'
          }}
        >
          <div className="text-sm font-medium mb-2">Test Steps</div>
          <ol className="text-xs space-y-1">
            {hoveredSteps.steps.map((step, index) => (
              <li key={index} className="flex">
                <span className="mr-2">{index + 1}.</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* ---------- Test Case Form Modal ---------- */}
      {showFormForSubModule && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-2xl rounded-lg p-6 shadow-lg">
            <h2 className="text-xl font-bold mb-4">
              {editingTestCase ? 'Edit Test Case' : 'Create Test Case'}
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              For Sub Module: <strong>{selectedSubName}</strong>
            </p>

            <div className="space-y-4">
              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  required
                />
              </div>

              {/* Steps */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">Test Steps</label>
                  <button
                    type="button"
                    onClick={addStep}
                    className="text-blue-600 hover:text-blue-800 disabled:text-gray-300"
                    disabled={formData.steps.length >= 5}
                  >
                    + Add Step
                  </button>
                </div>
                {formData.steps.map((step, index) => (
                  <div key={index} className="flex items-center gap-2 mb-2">
                    <span className="w-5">{index + 1}.</span>
                    <input
                      value={step}
                      onChange={(e) => handleStepChange(index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded"
                      placeholder={`Step ${index + 1}`}
                      required
                    />
                    {formData.steps.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeStep(index)}
                        className="text-red-500 hover:text-red-700 w-8 h-8 flex items-center justify-center"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Type & Severity */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => handleInputChange('type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="functional">Functional</option>
                    <option value="regression">Regression</option>
                    <option value="smoke">Smoke</option>
                    <option value="integration">Integration</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
                  <select
                    value={formData.severity}
                    onChange={(e) => handleInputChange('severity', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                >
                  {editingTestCase ? 'Update' : 'Submit'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Test;