import React, { useState } from 'react';
import { Plus, Bug, AlertCircle, Clock, CheckCircle, X, FileText, Edit2, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { useApp } from '../context/AppContext';

export const Defects: React.FC = () => {
  const { defects, projects, releases, testCases, addDefect, updateDefect, deleteDefect } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDefect, setEditingDefect] = useState<any>(null);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    module: '',
    subModule: '',
    type: 'bug' as 'bug' | 'test-failure' | 'enhancement',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'critical',
    severity: 'medium' as 'low' | 'medium' | 'high' | 'critical',
    status: 'open' as 'open' | 'in-progress' | 'resolved' | 'closed' | 'rejected',
    projectId: '',
    releaseId: '',
    testCaseId: '',
    assignedTo: '',
    reportedBy: '',
  });

  // Group defects by module
  const defectsByModule = defects.reduce((acc, defect) => {
    if (!acc[defect.module]) {
      acc[defect.module] = [];
    }
    acc[defect.module].push(defect);
    return acc;
  }, {} as Record<string, typeof defects>);

  const toggleModule = (module: string) => {
    setExpandedModules(prev => {
      const next = new Set(prev);
      if (next.has(module)) {
        next.delete(module);
      } else {
        next.add(module);
      }
      return next;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingDefect) {
      updateDefect({
        ...formData,
        id: editingDefect.id,
        createdAt: editingDefect.createdAt,
        updatedAt: new Date().toISOString(),
      });
    } else {
      const newDefect = {
        ...formData,
        id: `DEF-${Date.now()}`,
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
      releaseId: defect.releaseId || '',
      testCaseId: defect.testCaseId || '',
      assignedTo: defect.assignedTo || '',
      reportedBy: defect.reportedBy,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (defectId: string) => {
    if (window.confirm('Are you sure you want to delete this defect?')) {
      deleteDefect(defectId);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      module: '',
      subModule: '',
      type: 'bug',
      priority: 'medium',
      severity: 'medium',
      status: 'open',
      projectId: '',
      releaseId: '',
      testCaseId: '',
      assignedTo: '',
      reportedBy: '',
    });
    setEditingDefect(null);
    setIsModalOpen(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-red-100 text-red-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      case 'rejected':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return AlertCircle;
      case 'in-progress':
        return Clock;
      case 'resolved':
        return CheckCircle;
      case 'closed':
        return CheckCircle;
      case 'rejected':
        return X;
      default:
        return Bug;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Defects</h1>
          <p className="text-gray-600">Track and manage defects by module</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} icon={Plus}>
          Report Defect
        </Button>
      </div>

      <div className="space-y-4">
        {Object.entries(defectsByModule).map(([module, moduleDefects]) => (
          <Card key={module}>
            <CardContent className="p-0">
              <div 
                className="p-4 bg-gray-50 border-b border-gray-200 cursor-pointer hover:bg-gray-100"
                onClick={() => toggleModule(module)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {expandedModules.has(module) ? (
                      <ChevronUp className="w-5 h-5 text-gray-500" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-500" />
                    )}
                    <h3 className="text-lg font-semibold text-gray-900">{module}</h3>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                      {moduleDefects.length} defects
                    </span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-500">
                      {moduleDefects.filter(d => d.status === 'open').length} open
                    </span>
                    <span className="text-sm text-gray-500">
                      {moduleDefects.filter(d => d.status === 'in-progress').length} in progress
                    </span>
                  </div>
                </div>
              </div>

              {expandedModules.has(module) && (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Title
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Sub Module
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Priority
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Severity
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Project
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {moduleDefects.map((defect) => {
                        const StatusIcon = getStatusIcon(defect.status);
                        const project = projects.find(p => p.id === defect.projectId);
                        
                        return (
                          <tr key={defect.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {defect.id}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              <div className="flex items-center">
                                <StatusIcon className="w-4 h-4 mr-2" />
                                {defect.title}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {defect.subModule}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {defect.type}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(defect.priority)}`}>
                                {defect.priority}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(defect.severity)}`}>
                                {defect.severity}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(defect.status)}`}>
                                {defect.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {project?.name || 'Unknown'}
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
                                  onClick={() => handleDelete(defect.id)}
                                  className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                                  title="Delete Defect"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {defects.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Bug className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No defects reported</h3>
            <p className="text-gray-500 mb-4">Start by reporting your first defect</p>
            <Button onClick={() => setIsModalOpen(true)} icon={Plus}>
              Report Defect
            </Button>
          </CardContent>
        </Card>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={resetForm}
        title={editingDefect ? "Edit Defect" : "Report New Defect"}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Defect Title"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            required
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={4}
              required
            />
          </div>
          
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
                <option value="bug">Bug</option>
                <option value="test-failure">Test Failure</option>
                <option value="enhancement">Enhancement</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => handleInputChange('priority', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
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
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Project
              </label>
              <select
                value={formData.projectId}
                onChange={(e) => handleInputChange('projectId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select a project</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Release
              </label>
              <select
                value={formData.releaseId}
                onChange={(e) => handleInputChange('releaseId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a release</option>
                {releases.map((release) => (
                  <option key={release.id} value={release.id}>
                    {release.name} (v{release.version})
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Test Case
              </label>
              <select
                value={formData.testCaseId}
                onChange={(e) => handleInputChange('testCaseId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a test case</option>
                {testCases.map((testCase) => (
                  <option key={testCase.id} value={testCase.id}>
                    {testCase.id} - {testCase.description}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Assigned To"
              value={formData.assignedTo}
              onChange={(e) => handleInputChange('assignedTo', e.target.value)}
            />
            
            <Input
              label="Reported By"
              value={formData.reportedBy}
              onChange={(e) => handleInputChange('reportedBy', e.target.value)}
              required
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={resetForm}
            >
              Cancel
            </Button>
            <Button type="submit">Report Defect</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};