import React, { useState } from 'react';
import { Plus, Bug, AlertCircle, Clock, CheckCircle, X, FileText, Edit2, Trash2, ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { useApp } from '../context/AppContext';
import { useParams, useNavigate } from 'react-router-dom';

const MODULES = [
  {
    name: "Authentication",
    subModules: ["Login", "Registration", "Password Reset"]
  },
  {
    name: "Account Management",
    subModules: ["Account Overview", "Transaction History", "Account Statements", "Account Settings"]
  },
  {
    name: "Money Transfer",
    subModules: ["Domestic Transfer", "International Transfer"]
  },
  // ...add more as needed
];

export const Defects: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { defects, projects, releases, testCases = [], addDefect, updateDefect, deleteDefect, setSelectedProjectId } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDefect, setEditingDefect] = useState<any>(null);
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
    assignedTo: '',
    reportedBy: '',
    rejectedComments: '',
    score: '',
  });
  const [selectedProjectId, setSelectedProjectIdLocal] = useState('');

  // Only show defects for the current project
  const projectDefects = defects.filter(d => d.projectId === selectedProjectId);

  // Filter state
  const [filters, setFilters] = useState({
    id: '',
    module: '',
    subModule: '',
    type: '',
    severity: '',
    priority: '',
    status: '',
    assignedTo: '',
  });

  // Unique values for dropdowns
  const uniqueModules = Array.from(new Set(defects.map(d => d.module).filter(Boolean)));
  const uniqueSubModules = Array.from(new Set(defects.filter(d => !filters.module || d.module === filters.module).map(d => d.subModule).filter(Boolean)));
  const uniqueTypes = Array.from(new Set(defects.map(d => d.type).filter(Boolean)));
  const uniqueSeverities = Array.from(new Set(defects.map(d => d.severity).filter(Boolean)));
  const uniquePriorities = Array.from(new Set(defects.map(d => d.priority).filter(Boolean)));
  const uniqueStatuses = Array.from(new Set(defects.map(d => d.status).filter(Boolean)));
  const uniqueAssignedTo = Array.from(new Set(defects.map(d => d.assignedTo).filter(Boolean)));

  // Filtered defects
  const filteredDefects = projectDefects.filter(defect => {
    return (
      (!filters.id || defect.id.toLowerCase().includes(filters.id.toLowerCase())) &&
      (!filters.module || defect.module === filters.module) &&
      (!filters.subModule || defect.subModule === filters.subModule) &&
      (!filters.type || defect.type === filters.type) &&
      (!filters.severity || defect.severity === filters.severity) &&
      (!filters.priority || defect.priority === filters.priority) &&
      (!filters.status || defect.status === filters.status) &&
      (!filters.assignedTo || (defect.assignedTo || '').toLowerCase().includes(filters.assignedTo.toLowerCase()))
    );
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingDefect) {
      updateDefect({
        ...formData,
        projectId: selectedProjectId,
        id: editingDefect.id,
        createdAt: editingDefect.createdAt,
        updatedAt: new Date().toISOString(),
        module: formData.module || '',
        subModule: formData.subModule || '',
      });
    } else {
      const newDefect = {
        ...formData,
        projectId: selectedProjectId,
        id: `DEF-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        module: formData.module || '',
        subModule: formData.subModule || '',
      };
      addDefect(newDefect);
    }
    resetForm();
  };

  const handleEdit = (defect: any) => {
    setEditingDefect(defect);
    setFormData({
      title: defect.title || '',
      description: defect.description || '',
      module: defect.module || '',
      subModule: defect.subModule || '',
      type: defect.type || '',
      priority: defect.priority || '',
      severity: defect.severity || '',
      status: defect.status || '',
      projectId: selectedProjectId,
      assignedTo: defect.assignedTo || '',
      reportedBy: defect.reportedBy || '',
      rejectedComments: defect.rejectedComments || '',
      score: defect.score || '',
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
      projectId: selectedProjectId,
      assignedTo: '',
      reportedBy: '',
      rejectedComments: '',
      score: '',
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

  // Project selection handler
  const handleProjectSelect = (id: string) => {
    setSelectedProjectIdLocal(id);
    setFormData(f => ({ ...f, projectId: id }));
  };

  // Add this mapping for user-friendly labels
  const TYPE_LABELS: Record<string, string> = {
    'ui-issue': 'UI Issue',
    'functional-bug': 'Functional Bug',
    'performance-issue': 'Performance Issue',
    'bug': 'Bug',
    'test-failure': 'Test Failure',
    'enhancement': 'Enhancement',
  };

  const SEVERITY_LABELS: Record<string, string> = {
    'critical': 'Critical',
    'major': 'Major',
    'minor': 'Minor',
    'low': 'Low',
    'medium': 'Medium',
    'high': 'High',
  };

  // Update severity color logic
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'major':
        return 'bg-orange-100 text-orange-800';
      case 'minor':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value, ...(field === 'module' ? { subModule: '' } : {}) }));
  };

  return (
    <div className="space-y-6">
      {/* Project Selection Panel as cards */}
      <Card>
        <CardContent className="p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Project Selection</h2>
          <div className="flex flex-wrap gap-2">
            {projects.map(project => (
              <Button
                key={project.id}
                variant={selectedProjectId === project.id ? 'primary' : 'secondary'}
                onClick={() => handleProjectSelect(project.id)}
                className="whitespace-nowrap"
              >
                {project.name}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Add Defect Button */}
      {selectedProjectId && (
        <div className="flex justify-end">
          <Button onClick={() => setIsModalOpen(true)} icon={Plus}>
            Add Defect
          </Button>
        </div>
      )}

      {/* Defect Table */}
      {selectedProjectId && (
        <>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Defect Management</h2>
          {/* Filter Bar */}
          <div className="mb-4 flex flex-wrap gap-3 items-end bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">ID</label>
              <input type="text" value={filters.id} onChange={e => handleFilterChange('id', e.target.value)} className="border px-2 py-1 rounded w-28" placeholder="Defect ID" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Module</label>
              <select value={filters.module} onChange={e => handleFilterChange('module', e.target.value)} className="border px-2 py-1 rounded w-32">
                <option value="">All</option>
                {uniqueModules.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Submodule</label>
              <select value={filters.subModule} onChange={e => handleFilterChange('subModule', e.target.value)} className="border px-2 py-1 rounded w-32">
                <option value="">All</option>
                {uniqueSubModules.map(sm => <option key={sm} value={sm}>{sm}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
              <select value={filters.type} onChange={e => handleFilterChange('type', e.target.value)} className="border px-2 py-1 rounded w-32">
                <option value="">All</option>
                {uniqueTypes.map(t => <option key={t} value={t}>{t ? (TYPE_LABELS[t] || t) : ''}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Severity</label>
              <select value={filters.severity} onChange={e => handleFilterChange('severity', e.target.value)} className="border px-2 py-1 rounded w-28">
                <option value="">All</option>
                {uniqueSeverities.map(s => <option key={s} value={s}>{SEVERITY_LABELS[s] || s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Priority</label>
              <select value={filters.priority} onChange={e => handleFilterChange('priority', e.target.value)} className="border px-2 py-1 rounded w-28">
                <option value="">All</option>
                {uniquePriorities.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
              <select value={filters.status} onChange={e => handleFilterChange('status', e.target.value)} className="border px-2 py-1 rounded w-28">
                <option value="">All</option>
                {uniqueStatuses.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Assigned To</label>
              <input type="text" value={filters.assignedTo} onChange={e => handleFilterChange('assignedTo', e.target.value)} className="border px-2 py-1 rounded w-28" placeholder="Name" />
            </div>
          </div>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Defect ID</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Brief Description</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Steps</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Module</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Submodule</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Severity</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Assigned To</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredDefects.map((defect) => {
                      const StatusIcon = getStatusIcon(defect.status);
                      const project = projects.find(p => p.id === defect.projectId);
                      return (
                        <tr key={defect.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 whitespace-nowrap text-gray-500">{defect.id}</td>
                          <td className="px-4 py-3 text-gray-900">
                            <div className="flex items-center">
                              <StatusIcon className="w-4 h-4 mr-2" />
                              {defect.title}
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-pre-line text-gray-500 max-w-xs truncate">{defect.description}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-gray-500">{defect.module}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-gray-500">{defect.subModule}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-gray-500">{defect.type ? (TYPE_LABELS[defect.type] || defect.type) : ''}</td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(defect.severity)}`}>{SEVERITY_LABELS[defect.severity] || defect.severity}</span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(defect.priority)}`}>{defect.priority}</span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(defect.status)}`}>{defect.status}</span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-gray-500">{defect.assignedTo}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-gray-500">
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
            </CardContent>
          </Card>
        </>
      )}

      {/* No defects message */}
      {selectedProjectId && projectDefects.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Bug className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No defects reported</h3>
            <p className="text-gray-500 mb-4">Start by reporting your first defect</p>
            <Button onClick={() => setIsModalOpen(true)} icon={Plus}>
              Add Defect
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
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Brief Description */}
            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Brief Description</label>
              <input
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                required
              />
            </div>
            {/* Steps */}
            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Steps</label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                rows={4}
                required
              />
            </div>
            {/* Module */}
            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Module</label>
              <select
                value={formData.module}
                onChange={(e) => {
                  handleInputChange('module', e.target.value);
                  handleInputChange('subModule', '');
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                required
              >
                <option value="">Select a module</option>
                {MODULES.map((mod) => (
                  <option key={mod.name} value={mod.name}>{mod.name}</option>
                ))}
              </select>
            </div>
            {/* Submodule */}
            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Submodule</label>
              <select
                value={formData.subModule}
                onChange={(e) => handleInputChange('subModule', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                required
                disabled={!formData.module}
              >
                <option value="">Select a submodule</option>
                {MODULES.find((mod) => mod.name === formData.module)?.subModules.map((sub) => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            </div>
            {/* Severity */}
            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
              <select
                value={formData.severity}
                onChange={(e) => handleInputChange('severity', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                required
              >
                <option value="critical">Critical</option>
                <option value="major">Major</option>
                <option value="minor">Minor</option>
              </select>
            </div>
            {/* Priority */}
            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => handleInputChange('priority', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                required
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            {/* Type */}
            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={formData.type}
                onChange={(e) => handleInputChange('type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                required
              >
                <option value="ui-issue">UI Issue</option>
                <option value="functional-bug">Functional Bug</option>
                <option value="performance-issue">Performance Issue</option>
              </select>
            </div>
            {/* Status */}
            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                required
              >
                <option value="open">Open</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            {/* Rejected Comments - full width if visible */}
            {formData.status === 'rejected' && (
              <div className="mb-2 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Rejected Comments</label>
                <textarea
                  value={formData.rejectedComments}
                  onChange={e => handleInputChange('rejectedComments', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
                  rows={3}
                  placeholder="Enter reason for rejection"
                  required
                />
              </div>
            )}
            {/* Assigned To */}
            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
              <input
                value={formData.assignedTo}
                onChange={(e) => handleInputChange('assignedTo', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                required
              />
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
            <Button type="submit">Report Defect</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};