import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Eye, CheckSquare, ChevronRight, ChevronLeft, ChevronDown, Bug, AlertCircle, Clock, CheckCircle, X } from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { useApp } from '../context/AppContext';
import { Badge } from '../components/ui/Badge';
import { useParams, useNavigate } from 'react-router-dom';

// Define interfaces for our data types
interface Defect {
  id: string;
  title: string;
  description: string;
  module: string;
  subModule: string;
  type: 'bug' | 'test-failure' | 'enhancement';
  priority: 'low' | 'medium' | 'high' | 'critical';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in-progress' | 'resolved' | 'closed' | 'rejected';
  projectId: string;
  releaseId?: string;
  testCaseId?: string;
  assignedTo?: string;
  reportedBy: string;
  createdAt?: string;
  updatedAt?: string;
}

interface Module {
  id: string;
  name: string;
  submodules: string[];
}

// Mock data for modules and submodules
const mockModules: { [key: string]: Module[] } = {
  '2': [ // Mobile Banking App
    { id: 'auth', name: 'Authentication', submodules: ['Biometric Login', 'PIN Login', 'Password Reset', 'Session Management'] },
    { id: 'acc', name: 'Account Management', submodules: ['Account Overview', 'Transaction History', 'Account Statements', 'Account Settings'] },
    { id: 'tra', name: 'Money Transfer', submodules: ['Quick Transfer', 'Scheduled Transfer', 'International Transfer', 'Transfer Limits'] },
    { id: 'bil', name: 'Bill Payments', submodules: ['Bill List', 'Payment Scheduling', 'Payment History', 'Recurring Payments'] },
    { id: 'sec', name: 'Security Features', submodules: ['Two-Factor Auth', 'Device Management', 'Security Alerts', 'Fraud Protection'] },
    { id: 'sup', name: 'Customer Support', submodules: ['Chat Support', 'FAQs', 'Contact Us', 'Feedback'] }
  ],
  '3': [ // Analytics Dashboard
    { id: 'auth', name: 'Authentication', submodules: ['Login', 'Registration', 'Password Reset'] },
    { id: 'reporting', name: 'Reporting', submodules: ['Analytics', 'Exports', 'Dashboards', 'Custom Reports'] },
    { id: 'data', name: 'Data Management', submodules: ['Data Import', 'Data Processing', 'Data Export'] },
    { id: 'visualization', name: 'Visualization', submodules: ['Charts', 'Graphs', 'Widgets'] }
  ],
  '4': [ // Content Management
    { id: 'auth', name: 'Authentication', submodules: ['Login', 'Registration', 'Password Reset'] },
    { id: 'content', name: 'Content Management', submodules: ['Articles', 'Media', 'Categories', 'Templates'] },
    { id: 'user', name: 'User Management', submodules: ['Profile', 'Settings', 'Permissions', 'Roles'] },
    { id: 'workflow', name: 'Workflow', submodules: ['Approval Process', 'Review Process', 'Publishing'] }
  ]
};

// Mock defects data
const mockDefects: Defect[] = [
  {
    id: 'DEF-AUT-BIO-0001',
    title: 'Biometric login fails on iOS devices',
    description: 'Users are unable to login using fingerprint authentication on iOS devices running version 15.0 and above. The app crashes when attempting to access biometric data.',
    module: 'Authentication',
    subModule: 'Biometric Login',
    type: 'bug',
    priority: 'high',
    severity: 'high',
    status: 'open',
    projectId: '2',
    releaseId: 'rel-001',
    testCaseId: 'TC-AUT-BIO-0001',
    assignedTo: 'John Developer',
    reportedBy: 'Sarah Tester',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z'
  },
  {
    id: 'DEF-ACC-TRA-0002',
    title: 'Transaction history not loading',
    description: 'Transaction history page shows blank screen when user has more than 100 transactions. The API call times out after 30 seconds.',
    module: 'Account Management',
    subModule: 'Transaction History',
    type: 'bug',
    priority: 'medium',
    severity: 'medium',
    status: 'in-progress',
    projectId: '2',
    releaseId: 'rel-002',
    testCaseId: 'TC-ACC-TRA-0002',
    assignedTo: 'Mike Developer',
    reportedBy: 'David QA',
    createdAt: '2024-01-14T14:20:00Z',
    updatedAt: '2024-01-16T09:15:00Z'
  },
  {
    id: 'DEF-TRA-INT-0003',
    title: 'International transfer currency conversion error',
    description: 'Currency conversion rates are not updating in real-time during international transfers. Users see outdated rates from 24 hours ago.',
    module: 'Money Transfer',
    subModule: 'International Transfer',
    type: 'bug',
    priority: 'critical',
    severity: 'critical',
    status: 'open',
    projectId: '2',
    releaseId: 'rel-001',
    testCaseId: 'TC-TRA-INT-0003',
    assignedTo: 'Lisa Developer',
    reportedBy: 'Customer Support',
    createdAt: '2024-01-16T08:45:00Z',
    updatedAt: '2024-01-16T08:45:00Z'
  },
  {
    id: 'DEF-BIL-SCH-0004',
    title: 'Payment scheduling not working',
    description: 'Users cannot schedule recurring bill payments. The system shows "Invalid date format" error when trying to set future payment dates.',
    module: 'Bill Payments',
    subModule: 'Payment Scheduling',
    type: 'bug',
    priority: 'high',
    severity: 'high',
    status: 'resolved',
    projectId: '2',
    releaseId: 'rel-003',
    testCaseId: 'TC-BIL-SCH-0004',
    assignedTo: 'Alex Developer',
    reportedBy: 'Emma Tester',
    createdAt: '2024-01-13T11:00:00Z',
    updatedAt: '2024-01-15T16:30:00Z'
  },
  {
    id: 'DEF-SEC-2FA-0005',
    title: 'Two-factor authentication SMS delay',
    description: 'SMS verification codes are taking 5-10 minutes to arrive, causing user frustration and timeout issues.',
    module: 'Security Features',
    subModule: 'Two-Factor Auth',
    type: 'bug',
    priority: 'medium',
    severity: 'medium',
    status: 'in-progress',
    projectId: '2',
    releaseId: 'rel-002',
    testCaseId: 'TC-SEC-2FA-0005',
    assignedTo: 'Tom Developer',
    reportedBy: 'User Feedback',
    createdAt: '2024-01-15T13:20:00Z',
    updatedAt: '2024-01-16T10:45:00Z'
  },
  {
    id: 'DEF-REP-ANA-0006',
    title: 'Analytics dashboard performance issue',
    description: 'Dashboard takes 15+ seconds to load when displaying large datasets. Need to implement pagination and caching.',
    module: 'Reporting',
    subModule: 'Analytics',
    type: 'enhancement',
    priority: 'medium',
    severity: 'low',
    status: 'open',
    projectId: '3',
    releaseId: 'rel-004',
    testCaseId: 'TC-REP-ANA-0006',
    assignedTo: 'Sam Developer',
    reportedBy: 'Product Manager',
    createdAt: '2024-01-14T09:30:00Z',
    updatedAt: '2024-01-14T09:30:00Z'
  },
  {
    id: 'DEF-REP-EXP-0007',
    title: 'Export functionality missing CSV format',
    description: 'Users can only export data in PDF format. Need to add CSV export option for better data analysis.',
    module: 'Reporting',
    subModule: 'Exports',
    type: 'enhancement',
    priority: 'low',
    severity: 'low',
    status: 'open',
    projectId: '3',
    releaseId: 'rel-005',
    testCaseId: 'TC-REP-EXP-0007',
    assignedTo: 'Unassigned',
    reportedBy: 'Business Analyst',
    createdAt: '2024-01-16T12:00:00Z',
    updatedAt: '2024-01-16T12:00:00Z'
  },
  {
    id: 'DEF-DAT-IMP-0008',
    title: 'Data import fails with large files',
    description: 'Import process fails when uploading files larger than 50MB. Need to implement chunked upload and progress indicator.',
    module: 'Data Management',
    subModule: 'Data Import',
    type: 'bug',
    priority: 'high',
    severity: 'medium',
    status: 'open',
    projectId: '3',
    releaseId: 'rel-004',
    testCaseId: 'TC-DAT-IMP-0008',
    assignedTo: 'Chris Developer',
    reportedBy: 'Data Team',
    createdAt: '2024-01-15T16:45:00Z',
    updatedAt: '2024-01-15T16:45:00Z'
  },
  {
    id: 'DEF-VIS-CHA-0009',
    title: 'Chart rendering issues in Safari',
    description: 'Charts are not displaying correctly in Safari browser. Elements are overlapping and colors are incorrect.',
    module: 'Visualization',
    subModule: 'Charts',
    type: 'bug',
    priority: 'medium',
    severity: 'medium',
    status: 'in-progress',
    projectId: '3',
    releaseId: 'rel-005',
    testCaseId: 'TC-VIS-CHA-0009',
    assignedTo: 'Rachel Developer',
    reportedBy: 'QA Team',
    createdAt: '2024-01-14T10:15:00Z',
    updatedAt: '2024-01-16T11:20:00Z'
  },
  {
    id: 'DEF-AUT-REG-0010',
    title: 'Registration form validation error',
    description: 'Email validation is too strict and rejecting valid email addresses with special characters.',
    module: 'Authentication',
    subModule: 'Registration',
    type: 'bug',
    priority: 'high',
    severity: 'medium',
    status: 'resolved',
    projectId: '4',
    releaseId: 'rel-006',
    testCaseId: 'TC-AUT-REG-0010',
    assignedTo: 'Kevin Developer',
    reportedBy: 'Customer Support',
    createdAt: '2024-01-13T15:30:00Z',
    updatedAt: '2024-01-15T14:20:00Z'
  },
  {
    id: 'DEF-CON-ART-0011',
    title: 'Article editor missing spell check',
    description: 'Content editor lacks spell check functionality. Users are requesting this feature for better content quality.',
    module: 'Content Management',
    subModule: 'Articles',
    type: 'enhancement',
    priority: 'low',
    severity: 'low',
    status: 'open',
    projectId: '4',
    releaseId: 'rel-007',
    testCaseId: 'TC-CON-ART-0011',
    assignedTo: 'Unassigned',
    reportedBy: 'Content Team',
    createdAt: '2024-01-16T13:45:00Z',
    updatedAt: '2024-01-16T13:45:00Z'
  },
  {
    id: 'DEF-USE-PER-0012',
    title: 'Permission system not working correctly',
    description: 'Users with "Editor" role cannot edit articles they created. Permission inheritance is broken.',
    module: 'User Management',
    subModule: 'Permissions',
    type: 'bug',
    priority: 'critical',
    severity: 'high',
    status: 'open',
    projectId: '4',
    releaseId: 'rel-006',
    testCaseId: 'TC-USE-PER-0012',
    assignedTo: 'Pat Developer',
    reportedBy: 'Admin User',
    createdAt: '2024-01-15T11:00:00Z',
    updatedAt: '2024-01-15T11:00:00Z'
  },
  {
    id: 'DEF-WOR-APP-0013',
    title: 'Workflow approval process stuck',
    description: 'Articles get stuck in "Pending Approval" status when approver is on vacation. Need auto-escalation feature.',
    module: 'Workflow',
    subModule: 'Approval Process',
    type: 'bug',
    priority: 'medium',
    severity: 'medium',
    status: 'in-progress',
    projectId: '4',
    releaseId: 'rel-007',
    testCaseId: 'TC-WOR-APP-0013',
    assignedTo: 'Dana Developer',
    reportedBy: 'Editor Team',
    createdAt: '2024-01-14T14:30:00Z',
    updatedAt: '2024-01-16T08:15:00Z'
  }
];

export const Defects: React.FC = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { projects, releases, testCases = [], addDefect, updateDefect, deleteDefect, setSelectedProjectId } = useApp();
  // Use mock defects data instead of empty array from context
  const defects = mockDefects;
  const [selectedModule, setSelectedModule] = useState('');
  const [selectedSubmodule, setSelectedSubmodule] = useState('');
  const [selectedRelease, setSelectedRelease] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewDetailsModalOpen, setIsViewDetailsModalOpen] = useState(false);
  const [selectedDefects, setSelectedDefects] = useState<string[]>([]);
  const [viewingDefect, setViewingDefect] = useState<Defect | null>(null);
  const [editingDefect, setEditingDefect] = useState<Defect | null>(null);
  const [formData, setFormData] = useState<Omit<Defect, 'id'>>({
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
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [isDescriptionModalOpen, setIsDescriptionModalOpen] = useState(false);
  const [selectedDescription, setSelectedDescription] = useState('');
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [selectedSubmodules, setSelectedSubmodules] = useState<string[]>([]);

  useEffect(() => {
    if (projectId) {
      setSelectedProjectId(projectId);
    }
  }, [projectId, setSelectedProjectId]);

  // If no projectId, show a message or redirect
  if (!projectId) {
    return <div className="p-8 text-center text-gray-500">Please select a project to view its defects.</div>;
  }

  // Get modules for selected project
  const projectModules = projectId ? mockModules[projectId] || [] : [];

  // Compute selected defect IDs based on selected modules/submodules
  const selectedDefectIds = React.useMemo(() => {
    let ids: string[] = [];
    if (selectedModules.length > 0) {
      ids = [
        ...new Set(
          defects.filter(d => d.projectId === projectId && selectedModules.includes(d.module)).map(d => d.id)
        )
      ];
    }
    if (selectedSubmodules.length > 0) {
      ids = [
        ...ids,
        ...new Set(
          defects.filter(d => d.projectId === projectId && selectedSubmodules.includes(d.subModule)).map(d => d.id)
        )
      ];
    }
    return Array.from(new Set(ids));
  }, [selectedModules, selectedSubmodules, defects, projectId]);

  // Compute filtered defects for the table (union of all selected modules/submodules)
  const filteredDefects = React.useMemo(() => {
    if (selectedModules.length > 0) {
      return defects.filter(d => d.projectId === projectId && selectedModules.includes(d.module));
    }
    if (selectedSubmodules.length > 0) {
      return defects.filter(d => d.projectId === projectId && selectedSubmodules.includes(d.subModule));
    }
    return defects.filter(d => {
      if (!projectId) return false;
      if (d.projectId !== projectId) return false;
      if (d.module !== selectedModule) return false;
      return selectedSubmodule ? d.subModule === selectedSubmodule : true;
    });
  }, [selectedModules, selectedSubmodules, defects, projectId, selectedModule, selectedSubmodule]);

  // Handle project selection
  const handleProjectSelect = (projectId: string) => {
    setSelectedProjectId(projectId);
    setSelectedModule('');
    setSelectedSubmodule('');
    setSelectedRelease('');
    setSelectedDefects([]);
  };

  // Handle module selection
  const handleModuleSelect = (moduleName: string) => {
    setSelectedModule(moduleName);
    setSelectedSubmodule('');
    setSelectedRelease('');
    setSelectedDefects([]);
  };

  // Handle submodule selection
  const handleSubmoduleSelect = (submoduleName: string) => {
    setSelectedSubmodule(submoduleName);
    setSelectedRelease('');
    setSelectedDefects([]);
  };

  // Handle release selection
  const handleReleaseSelect = (releaseId: string) => {
    setSelectedRelease(releaseId);
    setSelectedDefects([]);
  };

  // When selection changes, update selectedDefects for bulk actions
  useEffect(() => {
    if (selectedModules.length > 0 || selectedSubmodules.length > 0) {
      setSelectedDefects(selectedDefectIds);
    }
  }, [selectedDefectIds, selectedModules, selectedSubmodules]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Generate module and submodule IDs
    const moduleId = formData.module.substring(0, 3).toUpperCase();
    const subModuleId = formData.subModule.substring(0, 3).toUpperCase();
    const timestamp = Date.now().toString().slice(-4);
    
    if (editingDefect) {
      updateDefect({
        ...formData,
        id: editingDefect.id,
        createdAt: editingDefect.createdAt,
        updatedAt: new Date().toISOString(),
      });
    } else {
      addDefect({
        ...formData,
        id: `DEF-${moduleId}-${subModuleId}-${timestamp}`,
        projectId: projectId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
    resetForm();
  };

  const handleEdit = (defect: Defect) => {
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
      reportedBy: defect.reportedBy || '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this defect?')) {
      deleteDefect(id);
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
      projectId: projectId,
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

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedDefects(filteredDefects.map((d: Defect) => d.id));
    } else {
      setSelectedDefects([]);
    }
  };

  const handleSelectDefect = (defectId: string, checked: boolean) => {
    if (checked) {
      setSelectedDefects([...selectedDefects, defectId]);
    } else {
      setSelectedDefects(selectedDefects.filter(id => id !== defectId));
    }
  };

  const handleViewDetails = (defect: Defect) => {
    setViewingDefect(defect);
    setIsViewDetailsModalOpen(true);
  };

  const toggleRowExpansion = (defectId: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(defectId)) {
        newSet.delete(defectId);
      } else {
        newSet.add(defectId);
      }
      return newSet;
    });
  };

  const handleViewDescription = (description: string) => {
    setSelectedDescription(description);
    setIsDescriptionModalOpen(true);
  };

  return (
    <div className="min-h-screen w-full flex flex-col">
      {/* Fixed Header Section */}
      <div className="flex-none p-6 pb-4">
        <div className="flex justify-between items-center mb-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-gray-900">Defects</h1>
            <p className="text-sm text-gray-500">
              {projectId ? `Project: ${projects.find(p => p.id === projectId)?.name}` : 'Select a project to begin'}
            </p>
          </div>
          <Button 
            onClick={() => setIsModalOpen(true)} 
            className="flex items-center space-x-2"
            disabled={!projectId}
          >
            <Plus className="w-4 h-4" />
            <span>Report Defect</span>
          </Button>
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
                  onClick={() => handleProjectSelect(project.id)}
                  className="whitespace-nowrap"
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

      {/* Content Area - Now scrollable at page level */}
      <div className="flex-1 px-6 pb-6">
        <div className="flex flex-col">
          
          {/* Module Selection Panel */}
          {projectId && (
            <Card className="mb-4">
              <CardContent className="p-4">
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-lg font-semibold text-gray-900">Module Selection</h2>
        </div>
                <div className="relative flex items-center">
                  <button
                    onClick={() => {
                      const container = document.getElementById('module-scroll');
                      if (container) container.scrollLeft -= 200;
                    }}
                    className="flex-shrink-0 z-10 bg-white shadow-md rounded-full p-1 hover:bg-gray-50 mr-2"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-600" />
                  </button>
                  <div
                    id="module-scroll"
                    className="flex space-x-2 overflow-x-auto pb-2 scroll-smooth flex-1"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                  >
                    {projectModules.map(module => {
                      const moduleDefects = defects.filter(
                        (d: Defect) => d.projectId === projectId && d.module === module.name
                      );
                      return (
            <Button 
                          key={module.id}
                          variant={selectedModule === module.name ? 'primary' : 'secondary'}
                          onClick={() => handleModuleSelect(module.name)}
                          className="whitespace-nowrap"
                        >
                          {module.name}
                          <Badge variant="info" className="ml-2">
                            {moduleDefects.length}
                          </Badge>
            </Button>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => {
                      const container = document.getElementById('module-scroll');
                      if (container) container.scrollLeft += 200;
                    }}
                    className="flex-shrink-0 z-10 bg-white shadow-md rounded-full p-1 hover:bg-gray-50 ml-2"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Submodule Selection Panel */}
          {projectId && selectedModule && (
            <Card className="mb-4">
              <CardContent className="p-4">
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-lg font-semibold text-gray-900">Submodule Selection</h2>
                </div>
                <div className="relative flex items-center">
                  <button
                    onClick={() => {
                      const container = document.getElementById('submodule-scroll');
                      if (container) container.scrollLeft -= 200;
                    }}
                    className="flex-shrink-0 z-10 bg-white shadow-md rounded-full p-1 hover:bg-gray-50 mr-2"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-600" />
                  </button>
                  <div
                    id="submodule-scroll"
                    className="flex space-x-2 overflow-x-auto pb-2 scroll-smooth flex-1"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', maxWidth: '100%' }}
                  >
                    {projectModules
                      .find(m => m.name === selectedModule)
                      ?.submodules.map(submodule => {
                        const submoduleDefects = defects.filter(
                          (d: Defect) => d.projectId === projectId && d.module === selectedModule && d.subModule === submodule
                        );
                        return (
                          <div
                            key={submodule}
                            className="flex items-center"
                          >
                            <div className="flex items-center border border-gray-200 rounded-lg p-0.5 bg-white hover:border-gray-300 transition-colors">
                              <Button
                                variant={selectedSubmodule === submodule ? 'primary' : 'secondary'}
                                onClick={() => handleSubmoduleSelect(submodule)}
                                className="whitespace-nowrap border-0"
                              >
                                {submodule}
                                <Badge variant="info" className="ml-2">
                                  {submoduleDefects.length}
                                </Badge>
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setFormData(prev => ({
                                    ...prev,
                                    module: selectedModule,
                                    subModule: submodule,
                                    projectId: projectId
                                  }));
                                  setIsModalOpen(true);
                                }}
                                className="p-1 border-0 hover:bg-gray-50"
                              >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>
                        );
                      })}
                  </div>
                  <button
                    onClick={() => {
                      const container = document.getElementById('submodule-scroll');
                      if (container) container.scrollLeft += 200;
                    }}
                    className="flex-shrink-0 z-10 bg-white shadow-md rounded-full p-1 hover:bg-gray-50 ml-2"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
          </CardContent>
        </Card>
          )}

          {/* Release Selection Panel */}
          {projectId && selectedModule && selectedSubmodule && (
            <Card className="mb-4">
              <CardContent className="p-4">
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-lg font-semibold text-gray-900">Release Selection</h2>
                </div>
                <div className="relative flex items-center">
                  <button
                    onClick={() => {
                      const container = document.getElementById('release-scroll');
                      if (container) container.scrollLeft -= 200;
                    }}
                    className="flex-shrink-0 z-10 bg-white shadow-md rounded-full p-1 hover:bg-gray-50 mr-2"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-600" />
                  </button>
                  <div
                    id="release-scroll"
                    className="flex space-x-2 overflow-x-auto pb-2 scroll-smooth flex-1"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', maxWidth: '100%' }}
                  >
                    {releases.map(release => {
                      const releaseDefects = defects.filter(
                        (d: Defect) => d.projectId === projectId && d.module === selectedModule && d.subModule === selectedSubmodule && d.releaseId === release.id
                      );
                      return (
                        <div
                          key={release.id}
                          className="flex items-center"
                        >
                          <div className="flex items-center border border-gray-200 rounded-lg p-0.5 bg-white hover:border-gray-300 transition-colors">
                            <Button
                              variant={selectedRelease === release.id ? 'primary' : 'secondary'}
                              onClick={() => handleReleaseSelect(release.id)}
                              className="whitespace-nowrap border-0"
                            >
                              {release.name} v{release.version}
                              <Badge variant="info" className="ml-2">
                                {releaseDefects.length}
                              </Badge>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setFormData(prev => ({
                                  ...prev,
                                  module: selectedModule,
                                  subModule: selectedSubmodule,
                                  releaseId: release.id,
                                  projectId: projectId
                                }));
                                setIsModalOpen(true);
                              }}
                              className="p-1 border-0 hover:bg-gray-50"
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                    </div>
                    </div>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => {
                      const container = document.getElementById('release-scroll');
                      if (container) container.scrollLeft += 200;
                    }}
                    className="flex-shrink-0 z-10 bg-white shadow-md rounded-full p-1 hover:bg-gray-50 ml-2"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Bulk Operations Panel */}
          {projectId && selectedModule && selectedDefects.length > 0 && (
            <div className="flex justify-end space-x-3 mb-4">
              <Button 
                onClick={() => {
                  if (window.confirm(`Are you sure you want to delete ${selectedDefects.length} defect(s)?`)) {
                    selectedDefects.forEach((id: string) => deleteDefect(id));
                    setSelectedDefects([]);
                  }
                }}
                className="flex items-center space-x-2 bg-red-600 hover:bg-red-700"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete ({selectedDefects.length})</span>
              </Button>
            </div>
          )}

          {/* Defects Table - Now with dynamic height */}
          {projectId && selectedModule && (
            <Card>
              <CardContent className="p-0">
                    <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr className="border-b border-gray-200">
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            <input
                              type="checkbox"
                          checked={selectedDefects.length === filteredDefects.length}
                              onChange={(e) => handleSelectAll(e.target.checked)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Defect ID
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Title
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
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
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                    {filteredDefects.map((defect: Defect) => {
                          const StatusIcon = getStatusIcon(defect.status);
                          
                          return (
                        <React.Fragment key={defect.id}>
                          <tr className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <input
                                  type="checkbox"
                                  checked={selectedDefects.includes(defect.id)}
                                  onChange={(e) => handleSelectDefect(defect.id, e.target.checked)}
                                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {defect.id}
                              </td>
                            <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                                <div className="flex items-center">
                                  <StatusIcon className="w-4 h-4 mr-2" />
                                  {defect.title}
                                </div>
                              </td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                              <button
                                onClick={() => handleViewDescription(defect.description)}
                                className="text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                                title="View Description"
                              >
                                <Eye className="w-4 h-4" />
                                <span>View</span>
                              </button>
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
                                <div className="flex space-x-2">
                                <button
                                  onClick={() => handleViewDetails(defect)}
                                  className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                                  title="View"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                  <button
                                    onClick={() => handleEdit(defect)}
                                    className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                                  title="Edit"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDelete(defect.id)}
                                    className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                                  title="Delete"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                        </React.Fragment>
                          );
                        })}
                      </tbody>
                    </table>
              </CardContent>
            </Card>
      )}
        </div>
      </div>

      {/* Add/Edit Defect Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={resetForm}
        title={editingDefect ? "Edit Defect" : "Report New Defect"}
        size="xl"
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
              rows={3}
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
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="open">Open</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
                <option value="rejected">Rejected</option>
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
                    {release.name} - {release.version}
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
            <Button type="submit">
              {editingDefect ? 'Update Defect' : 'Report Defect'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* View Defect Details Modal */}
      <Modal
        isOpen={isViewDetailsModalOpen}
        onClose={() => {
          setIsViewDetailsModalOpen(false);
          setViewingDefect(null);
        }}
        title={`Defect Details - ${viewingDefect?.id}`}
        size="xl"
      >
        {viewingDefect && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Title</h3>
                <p className="mt-1 text-sm text-gray-900">{viewingDefect.title}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Description</h3>
                <p className="mt-1 text-sm text-gray-900">{viewingDefect.description}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Priority</h3>
                <span className={`mt-1 inline-flex px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(viewingDefect.priority)}`}>
                  {viewingDefect.priority}
                </span>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Severity</h3>
                <span className={`mt-1 inline-flex px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(viewingDefect.severity)}`}>
                  {viewingDefect.severity}
                </span>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Status</h3>
                <span className={`mt-1 inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(viewingDefect.status)}`}>
                  {viewingDefect.status}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Module</h3>
                <p className="mt-1 text-sm text-gray-900">{viewingDefect.module} / {viewingDefect.subModule}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Type</h3>
                <p className="mt-1 text-sm text-gray-900">{viewingDefect.type}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Assigned To</h3>
                <p className="mt-1 text-sm text-gray-900">{viewingDefect.assignedTo || 'Not assigned'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Reported By</h3>
                <p className="mt-1 text-sm text-gray-900">{viewingDefect.reportedBy}</p>
              </div>
            </div>
            <div className="flex justify-end pt-4">
            <Button
              type="button"
              variant="secondary"
                onClick={() => {
                  setIsViewDetailsModalOpen(false);
                  setViewingDefect(null);
                }}
            >
                Close
            </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Description View Modal */}
      <Modal
        isOpen={isDescriptionModalOpen}
        onClose={() => {
          setIsDescriptionModalOpen(false);
          setSelectedDescription('');
        }}
        title="Defect Description"
      >
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-gray-700 whitespace-pre-wrap">
              {selectedDescription}
            </p>
          </div>
          <div className="flex justify-end">
            <Button
              variant="secondary"
              onClick={() => {
                setIsDescriptionModalOpen(false);
                setSelectedDescription('');
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