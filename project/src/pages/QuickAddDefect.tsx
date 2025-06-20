import React, { useState } from 'react';
import { Bug, Plus } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { useApp } from '../context/AppContext';
import { MdBugReport } from "react-icons/md";

const mockModules: Record<string, { id: string; name: string; submodules: string[] }[]> = {
  '2': [
    { id: 'auth', name: 'Authentication', submodules: ['Biometric Login', 'PIN Login', 'Password Reset', 'Session Management'] },
    { id: 'acc', name: 'Account Management', submodules: ['Account Overview', 'Transaction History', 'Account Statements', 'Account Settings'] },
    { id: 'tra', name: 'Money Transfer', submodules: ['Quick Transfer', 'Scheduled Transfer', 'International Transfer', 'Transfer Limits'] },
    { id: 'bil', name: 'Bill Payments', submodules: ['Bill List', 'Payment Scheduling', 'Payment History', 'Recurring Payments'] },
    { id: 'sec', name: 'Security Features', submodules: ['Two-Factor Auth', 'Device Management', 'Security Alerts', 'Fraud Protection'] },
    { id: 'sup', name: 'Customer Support', submodules: ['Chat Support', 'FAQs', 'Contact Us', 'Feedback'] }
  ],
  '3': [
    { id: 'auth', name: 'Authentication', submodules: ['Login', 'Registration', 'Password Reset'] },
    { id: 'reporting', name: 'Reporting', submodules: ['Analytics', 'Exports', 'Dashboards', 'Custom Reports'] },
    { id: 'data', name: 'Data Management', submodules: ['Data Import', 'Data Processing', 'Data Export'] },
    { id: 'visualization', name: 'Visualization', submodules: ['Charts', 'Graphs', 'Widgets'] }
  ],
  '4': [
    { id: 'auth', name: 'Authentication', submodules: ['Login', 'Registration', 'Password Reset'] },
    { id: 'content', name: 'Content Management', submodules: ['Articles', 'Media', 'Categories', 'Templates'] },
    { id: 'user', name: 'User Management', submodules: ['Profile', 'Settings', 'Permissions', 'Roles'] },
    { id: 'workflow', name: 'Workflow', submodules: ['Approval Process', 'Review Process', 'Publishing'] }
  ]
};

const QuickAddDefect: React.FC = () => {
  const { selectedProjectId, projects } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    module: '',
    subModule: '',
    title: '',
    description: '',
    type: 'bug',
    priority: 'medium',
    severity: 'medium',
  });
  const [success, setSuccess] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      setIsModalOpen(false);
      setFormData({
        module: '',
        subModule: '',
        title: '',
        description: '',
        type: 'bug',
        priority: 'medium',
        severity: 'medium',
      });
    }, 1200);
  };

  const projectModules: { id: string; name: string; submodules: string[] }[] = selectedProjectId ? mockModules[selectedProjectId] || [] : [];
  const submodules: string[] = projectModules.find((m: { name: string }) => m.name === formData.module)?.submodules || [];
  const selectedProject = projects.find((p: { id: string }) => p.id === selectedProjectId);

  return (
    <div>
      <Button
        onClick={() => setIsModalOpen(true)}
        className="flex items-center justify-center p-0 rounded-full shadow-lg bg-white hover:bg-gray-100 text-blue-700 relative group border border-blue-200"
        disabled={!selectedProjectId}
        style={{ width: 40, height: 40, minWidth: 40, minHeight: 40, borderRadius: '50%' }}
      >
        {/* Lucide Bug Icon as red */}
        <Bug size={22} style={{ color: '#e11d48', position: 'absolute', left: 9, top: 9 }} />
        {/* Plus Icon, overlayed in the bottom right, with white background, dark blue plus */}
        <span style={{ position: 'absolute', right: 2, bottom: 2, background: '#fff', borderRadius: '50%', width: 11, height: 11, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Plus className="w-2.5 h-2.5" style={{ color: '#1e3a8a' }} />
        </span>
        {/* Tooltip on hover */}
        <span className="absolute left-1/2 -translate-x-1/2 -top-8 bg-gray-900 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
          Add Defect
        </span>
      </Button>
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedProject ? `Quick Add Defect (${selectedProject.name})` : 'Quick Add Defect'}
        size="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Module</label>
              <select
                value={formData.module}
                onChange={e => {
                  handleInputChange('module', e.target.value);
                  handleInputChange('subModule', '');
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={!selectedProjectId}
              >
                <option value="">Select Module</option>
                {projectModules.map((module: { id: string; name: string }) => (
                  <option key={module.id} value={module.name}>{module.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sub Module</label>
              <select
                value={formData.subModule}
                onChange={e => handleInputChange('subModule', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={!formData.module}
              >
                <option value="">Select Sub Module</option>
                {submodules.map((submodule: string) => (
                  <option key={submodule} value={submodule}>{submodule}</option>
                ))}
              </select>
            </div>
            <Input
              label="Type"
              value={formData.type}
              onChange={e => handleInputChange('type', e.target.value)}
              required
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                value={formData.priority}
                onChange={e => handleInputChange('priority', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
              <select
                value={formData.severity}
                onChange={e => handleInputChange('severity', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>
          <Input
            label="Defect Title"
            value={formData.title}
            onChange={e => handleInputChange('title', e.target.value)}
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={e => handleInputChange('description', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={2}
              required
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={success}>
              {success ? 'Added!' : 'Add Defect'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default QuickAddDefect; 