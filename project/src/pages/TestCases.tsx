import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Eye, CheckSquare } from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { useApp } from '../context/AppContext';

export const TestCases: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAllocateModalOpen, setIsAllocateModalOpen] = useState(false);
  const [isViewStepsModalOpen, setIsViewStepsModalOpen] = useState(false);
  const [selectedTestCases, setSelectedTestCases] = useState<string[]>([]);
  const [selectedRelease, setSelectedRelease] = useState('');
  const [viewingTestCase, setViewingTestCase] = useState<any>(null);
  const [editingTestCase, setEditingTestCase] = useState<any>(null);
  const [formData, setFormData] = useState({
    id: '',
    module: '',
    subModule: '',
    description: '',
    steps: [''],
    type: 'functional' as 'functional' | 'regression' | 'smoke' | 'integration',
    severity: 'medium' as 'low' | 'medium' | 'high' | 'critical',
    status: 'active' as 'active' | 'inactive',
    projectId: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTestCase) {
      updateTestCase({
        ...formData,
        steps: formData.steps.filter(step => step.trim() !== ''),
      });
    } else {
      addTestCase({
        ...formData,
        id: `TC-${Date.now()}`,
        steps: formData.steps.filter(step => step.trim() !== ''),
      });
    }
    resetForm();
  };

  const handleEdit = (testCase: any) => {
    setEditingTestCase(testCase);
    setFormData({
      id: testCase.id,
      module: testCase.module,
      subModule: testCase.subModule,
      description: testCase.description,
      steps: testCase.steps,
      type: testCase.type,
      severity: testCase.severity,
      status: testCase.status,
      projectId: testCase.projectId,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this test case?')) {
      deleteTestCase(id);
    }
  };

  const resetForm = () => {
    setFormData({
      id: '',
      module: '',
      subModule: '',
      description: '',
      steps: [''],
      type: 'functional',
      severity: 'medium',
      status: 'active',
      projectId: '',
    });
    setEditingTestCase(null);
    setIsModalOpen(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleStepChange = (index: number, value: string) => {
    const newSteps = [...formData.steps];
    newSteps[index] = value;
    setFormData(prev => ({ ...prev, steps: newSteps }));
  };

  const addStep = () => {
    if (formData.steps.length < 5) {
      setFormData(prev => ({ ...prev, steps: [...prev.steps, ''] }));
    }
  };

  const removeStep = (index: number) => {
    if (formData.steps.length > 1) {
      const newSteps = formData.steps.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, steps: newSteps }));
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleAllocate = () => {
    if (selectedTestCases.length === 0 || !selectedRelease) return;
    
    selectedTestCases.forEach(testCaseId => {
      const testCase = testCases.find(tc => tc.id === testCaseId);
      if (testCase) {
        updateTestCase({
          ...testCase,
          releaseId: selectedRelease
        });
      }
    });
    
    setSelectedTestCases([]);
    setSelectedRelease('');
    setIsAllocateModalOpen(false);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTestCases(testCases.map(tc => tc.id));
    } else {
      setSelectedTestCases([]);
    }
  };

  const handleSelectTestCase = (testCaseId: string, checked: boolean) => {
    if (checked) {
      setSelectedTestCases([...selectedTestCases, testCaseId]);
    } else {
      setSelectedTestCases(selectedTestCases.filter(id => id !== testCaseId));
    }
  };

  const handleViewSteps = (testCase: any) => {
    setViewingTestCase(testCase);
    setIsViewStepsModalOpen(true);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Test Cases</h1>
        <div className="flex space-x-3">
          {selectedTestCases.length > 0 && (
            <Button 
              onClick={() => setIsAllocateModalOpen(true)}
              className="flex items-center space-x-2"
            >
              <CheckSquare className="w-4 h-4" />
              <span>Allocate ({selectedTestCases.length})</span>
            </Button>
          )}
          <Button onClick={() => setIsModalOpen(true)} className="flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>Add Test Case</span>
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={selectedTestCases.length === testCases.length}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Test Case ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Module
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sub Module
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Steps
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Severity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {testCases.map((testCase) => (
                  <tr key={testCase.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedTestCases.includes(testCase.id)}
                        onChange={(e) => handleSelectTestCase(testCase.id, e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {testCase.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {testCase.module}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {testCase.subModule}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                      {testCase.description}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <button
                        onClick={() => handleViewSteps(testCase)}
                        className="text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                      >
                        <Eye className="w-4 h-4" />
                        <span>{testCase.steps.length} steps</span>
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {testCase.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(testCase.severity)}`}>
                        {testCase.severity}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(testCase)}
                          className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(testCase.id)}
                          className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={resetForm}
        title={editingTestCase ? "Edit Test Case" : "Create New Test Case"}
        size="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Module"
              value={formData.module}
              onChange={(e) => handleInputChange('module', e.target.value)}
              required
            />
            <Input
              label="Sub Module"
              value={formData.subModule}
              onChange={(e) => handleInputChange('subModule', e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              required
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Test Steps (Maximum 5 steps)
              </label>
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                onClick={addStep}
                disabled={formData.steps.length >= 5}
              >
                Add Step
              </Button>
            </div>
            <div className="space-y-2">
              {formData.steps.map((step, index) => (
                <div key={index} className="flex space-x-2">
                  <span className="flex-shrink-0 w-8 h-10 flex items-center justify-center text-sm text-gray-500">
                    {index + 1}.
                  </span>
                  <input
                    type="text"
                    value={step}
                    onChange={(e) => handleStepChange(index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder={`Step ${index + 1}`}
                    required
                  />
                  {formData.steps.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeStep(index)}
                      className="p-2 text-red-600 hover:bg-red-50"
                    >
                      ×
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => handleInputChange('type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="functional">Functional</option>
                <option value="regression">Regression</option>
                <option value="smoke">Smoke</option>
                <option value="integration">Integration</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Severity
              </label>
              <select
                value={formData.severity}
                onChange={(e) => handleInputChange('severity', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={resetForm}
            >
              Cancel
            </Button>
            <Button type="submit">
              {editingTestCase ? 'Update Test Case' : 'Create Test Case'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isAllocateModalOpen}
        onClose={() => {
          setIsAllocateModalOpen(false);
          setSelectedRelease('');
        }}
        title="Allocate Test Cases to Release"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Release
            </label>
            <select
              value={selectedRelease}
              onChange={(e) => setSelectedRelease(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Select a release</option>
            </select>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsAllocateModalOpen(false);
                setSelectedRelease('');
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleAllocate}
              disabled={!selectedRelease}
            >
              Allocate
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isViewStepsModalOpen}
        onClose={() => {
          setIsViewStepsModalOpen(false);
          setViewingTestCase(null);
        }}
        title={`Test Steps - ${viewingTestCase?.id}`}
      >
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="space-y-3">
              {viewingTestCase?.steps.map((step: string, index: number) => (
                <div key={index} className="flex items-start space-x-3 bg-white p-3 rounded-lg shadow-sm">
                  <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center text-sm font-medium text-blue-600 bg-blue-50 rounded-full">
                    {index + 1}
                  </span>
                  <div className="flex-1 text-gray-700">
                    {step}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-end pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsViewStepsModalOpen(false);
                setViewingTestCase(null);
              }}
            >
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};