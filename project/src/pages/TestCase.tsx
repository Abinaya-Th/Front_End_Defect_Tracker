import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Eye, CheckSquare, ChevronRight, ChevronLeft, ChevronDown } from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { useApp } from '../context/AppContext';
import { Badge } from '../components/ui/Badge';

// Define interfaces for our data types
interface TestCase {
  id: string;
  title?: string;
  module: string;
  subModule: string;
  description: string;
  steps: string[];
  expectedResult?: string;
  actualResult?: string;
  type: 'functional' | 'regression' | 'smoke' | 'integration';
  severity: 'low' | 'medium' | 'high' | 'critical';
  // status: 'active' | 'inactive';
  projectId: string;
  releaseId?: string;
}

interface Module {
  id: string;
  name: string;
  submodules: string[];
}

// Mock data for modules and submodules
const mockModules: { [key: string]: Module[] } = {
  '1': [ // E-commerce Platform
    { id: 'auth', name: 'Authentication', submodules: ['Login', 'Registration', 'Password Reset'] },
    { id: 'user', name: 'User Management', submodules: ['Profile', 'Settings', 'Permissions'] },
    { id: 'content', name: 'Content Management', submodules: ['Articles', 'Media', 'Categories'] },
    { id: 'payment', name: 'Payment Processing', submodules: ['Transactions', 'Refunds', 'Invoices'] },
    { id: 'reporting', name: 'Reporting', submodules: ['Analytics', 'Exports', 'Dashboards'] }
  ],
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

// Mock test cases data
const mockTestCases: TestCase[] = [
  {
    id: 'TC-AUT-LOG-0001',
    title: 'User Login Validation',
    module: 'Authentication',
    subModule: 'Login',
    description: 'Verify that users can log in with valid credentials',
    steps: [
      'Navigate to login page',
      'Enter valid email and password',
      'Click login button',
      'Verify successful login and redirection'
    ],
    expectedResult: 'User should be successfully logged in and redirected to dashboard',
    actualResult: '',
    type: 'functional',
    severity: 'high',
    // status: 'active',
    projectId: '1'
  },
  {
    id: 'TC-AUT-PAS-0002',
    title: 'Password Reset Flow',
    module: 'Authentication',
    subModule: 'Password Reset',
    description: 'Test the password reset functionality',
    steps: [
      'Click forgot password link',
      'Enter email address',
      'Check email for reset link',
      'Click reset link',
      'Enter new password',
      'Confirm new password'
    ],
    expectedResult: 'User should receive reset email and be able to set new password',
    actualResult: '',
    type: 'functional',
    severity: 'high',
    // status: 'active',
    projectId: '1'
  },
  {
    id: 'TC-USE-PRO-0003',
    title: 'User Profile Update',
    module: 'User Management',
    subModule: 'Profile',
    description: 'Verify profile information can be updated',
    steps: [
      'Navigate to profile page',
      'Update user information',
      'Save changes',
      'Verify updated information is displayed'
    ],
    expectedResult: 'Profile information should be successfully updated',
    actualResult: '',
    type: 'functional',
    severity: 'medium',
    // status: 'active',
    projectId: '1'
  },
  {
    id: 'TC-CON-ART-0004',
    title: 'Article Creation',
    module: 'Content Management',
    subModule: 'Articles',
    description: 'Test article creation functionality',
    steps: [
      'Navigate to article creation page',
      'Fill in article details',
      'Add content',
      'Select category',
      'Publish article'
    ],
    expectedResult: 'Article should be created and published successfully',
    actualResult: '',
    type: 'functional',
    severity: 'medium',
    // status: 'active',
    projectId: '1'
  },
  {
    id: 'TC-PAY-TRA-0005',
    title: 'Payment Transaction',
    module: 'Payment Processing',
    subModule: 'Transactions',
    description: 'Verify payment transaction processing',
    steps: [
      'Select items for purchase',
      'Proceed to checkout',
      'Enter payment details',
      'Complete transaction'
    ],
    expectedResult: 'Payment should be processed successfully',
    actualResult: '',
    type: 'functional',
    severity: 'critical',
    // status: 'active',
    projectId: '2'
  },
  {
    id: 'TC-PAY-REF-0006',
    title: 'Refund Processing',
    module: 'Payment Processing',
    subModule: 'Refunds',
    description: 'Test refund processing functionality',
    steps: [
      'Navigate to order history',
      'Select order for refund',
      'Enter refund amount',
      'Submit refund request',
      'Verify refund status'
    ],
    expectedResult: 'Refund should be processed and reflected in user account',
    actualResult: '',
    type: 'functional',
    severity: 'high',
    // status: 'active',
    projectId: '2'
  },
  {
    id: 'TC-PAY-INV-0007',
    title: 'Invoice Generation',
    module: 'Payment Processing',
    subModule: 'Invoices',
    description: 'Verify invoice generation and delivery',
    steps: [
      'Complete a purchase',
      'Check invoice generation',
      'Verify invoice details',
      'Confirm email delivery'
    ],
    expectedResult: 'Invoice should be generated and sent to user email',
    actualResult: '',
    type: 'functional',
    severity: 'medium',
    //status: 'active',
    projectId: '2'
  },
  {
    id: 'TC-REP-ANA-0008',
    title: 'Report Generation',
    module: 'Reporting',
    subModule: 'Analytics',
    description: 'Test report generation functionality',
    steps: [
      'Navigate to reports section',
      'Select report type',
      'Set date range',
      'Generate report',
      'Verify report content'
    ],
    expectedResult: 'Report should be generated with correct data',
    actualResult: '',
    type: 'functional',
    severity: 'medium',
    // status: 'active',
    projectId: '3'
  },
  {
    id: 'TC-REP-EXP-0009',
    title: 'Data Export',
    module: 'Reporting',
    subModule: 'Exports',
    description: 'Verify data export functionality',
    steps: [
      'Select data to export',
      'Choose export format',
      'Initiate export',
      'Download file',
      'Verify file contents'
    ],
    expectedResult: 'Data should be exported in correct format with all selected fields',
    actualResult: '',
    type: 'functional',
    severity: 'medium',
    // status: 'active',
    projectId: '3'
  },
  {
    id: 'TC-REP-DAS-0010',
    title: 'Dashboard Widgets',
    module: 'Reporting',
    subModule: 'Dashboards',
    description: 'Test dashboard widget functionality',
    steps: [
      'Add new widget',
      'Configure widget settings',
      'Verify data display',
      'Test widget interactions'
    ],
    expectedResult: 'Widgets should display correct data and respond to interactions',
    actualResult: '',
    type: 'functional',
    severity: 'low',
    // status: 'active',
    projectId: '3'
  },
  {
    id: 'TC-AUT-REG-0011',
    title: 'User Registration',
    module: 'Authentication',
    subModule: 'Registration',
    description: 'Test new user registration process',
    steps: [
      'Navigate to registration page',
      'Fill registration form',
      'Submit form',
      'Verify email verification',
      'Complete registration'
    ],
    expectedResult: 'New user should be registered and able to log in',
    actualResult: '',
    type: 'functional',
    severity: 'high',
    // status: 'active',
    projectId: '4'
  },
  {
    id: 'TC-USE-SET-0012',
    title: 'User Settings',
    module: 'User Management',
    subModule: 'Settings',
    description: 'Verify user settings functionality',
    steps: [
      'Access settings page',
      'Modify preferences',
      'Save changes',
      'Verify settings persistence'
    ],
    expectedResult: 'User settings should be saved and applied correctly',
    actualResult: '',
    type: 'functional',
    severity: 'medium',
    // status: 'active',
    projectId: '4'
  },
  {
    id: 'TC-CON-MED-0013',
    title: 'Media Upload',
    module: 'Content Management',
    subModule: 'Media',
    description: 'Test media file upload functionality',
    steps: [
      'Navigate to media section',
      'Select file to upload',
      'Upload file',
      'Verify file display',
      'Test file operations'
    ],
    expectedResult: 'Media files should upload and display correctly',
    actualResult: '',
    type: 'functional',
    severity: 'medium',
    // status: 'active',
    projectId: '4'
  }
];

export const TestCase: React.FC = () => {
  const { projects, testCases = [], addTestCase, updateTestCase, deleteTestCase, releases } = useApp();
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedModule, setSelectedModule] = useState('');
  const [selectedSubmodule, setSelectedSubmodule] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAllocateModalOpen, setIsAllocateModalOpen] = useState(false);
  const [isViewStepsModalOpen, setIsViewStepsModalOpen] = useState(false);
  const [isViewTestCaseModalOpen, setIsViewTestCaseModalOpen] = useState(false);
  const [selectedTestCases, setSelectedTestCases] = useState<string[]>([]);
  const [selectedRelease, setSelectedRelease] = useState('');
  const [viewingTestCase, setViewingTestCase] = useState<TestCase | null>(null);
  const [editingTestCase, setEditingTestCase] = useState<TestCase | null>(null);
  const [formData, setFormData] = useState<Omit<TestCase, 'id'>>({
    module: '',
    subModule: '',
    title: '',
    description: '',
    steps: [''],
    expectedResult: '',
    actualResult: '',
    type: 'functional',
    severity: 'medium',
    // status: 'active',
    projectId: '',
  });
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [isDescriptionModalOpen, setIsDescriptionModalOpen] = useState(false);
  const [selectedDescription, setSelectedDescription] = useState('');
  const [moduleSelectMode, setModuleSelectMode] = useState(false);
  const [submoduleSelectMode, setSubmoduleSelectMode] = useState(false);
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [selectedSubmodules, setSelectedSubmodules] = useState<string[]>([]);

  // Get modules for selected project
  const projectModules = selectedProject ? mockModules[selectedProject] || [] : [];

  // Compute selected test case IDs based on selected modules/submodules
  const selectedTestCaseIds = React.useMemo(() => {
    let ids: string[] = [];
    if (moduleSelectMode && selectedModules.length > 0) {
      ids = [
        ...new Set(
          testCases.filter(tc => tc.projectId === selectedProject && selectedModules.includes(tc.module)).map(tc => tc.id)
        )
      ];
    }
    if (submoduleSelectMode && selectedSubmodules.length > 0) {
      ids = [
        ...ids,
        ...new Set(
          testCases.filter(tc => tc.projectId === selectedProject && selectedSubmodules.includes(tc.subModule)).map(tc => tc.id)
        )
      ];
    }
    if (!moduleSelectMode && !submoduleSelectMode) return selectedTestCases;
    return Array.from(new Set(ids));
  }, [moduleSelectMode, submoduleSelectMode, selectedModules, selectedSubmodules, testCases, selectedProject, selectedTestCases]);

  // Compute filtered test cases for the table (union of all selected modules/submodules)
  const filteredTestCases = React.useMemo(() => {
    if (moduleSelectMode && selectedModules.length > 0) {
      return testCases.filter(tc => tc.projectId === selectedProject && selectedModules.includes(tc.module));
    }
    if (submoduleSelectMode && selectedSubmodules.length > 0) {
      return testCases.filter(tc => tc.projectId === selectedProject && selectedSubmodules.includes(tc.subModule));
    }
    return testCases.filter(tc => {
      if (!selectedProject) return false;
      if (tc.projectId !== selectedProject) return false;
      if (tc.module !== selectedModule) return false;
      return selectedSubmodule ? tc.subModule === selectedSubmodule : true;
    });
  }, [moduleSelectMode, submoduleSelectMode, selectedModules, selectedSubmodules, testCases, selectedProject, selectedModule, selectedSubmodule]);

  // Handle project selection
  const handleProjectSelect = (projectId: string) => {
    setSelectedProject(projectId);
    setSelectedModule('');
    setSelectedSubmodule('');
    setSelectedTestCases([]);
  };

  // Handle module selection
  const handleModuleSelect = (moduleName: string) => {
    setSelectedModule(moduleName);
    setSelectedSubmodule('');
    setSelectedTestCases([]);
  };

  // Handle submodule selection
  const handleSubmoduleSelect = (submoduleName: string) => {
    setSelectedSubmodule(submoduleName);
    setSelectedTestCases([]);
  };

  // Handle module tab click in select mode
  const handleModuleTabClick = (moduleName: string) => {
    if (!moduleSelectMode) {
      setSelectedModule(moduleName);
      setSelectedSubmodule('');
      setSelectedTestCases([]);
      return;
    }
    setSelectedModules(prev =>
      prev.includes(moduleName)
        ? prev.filter(m => m !== moduleName)
        : [...prev, moduleName]
    );
  };

  // Handle submodule tab click in select mode
  const handleSubmoduleTabClick = (submoduleName: string) => {
    if (!submoduleSelectMode) {
      setSelectedSubmodule(submoduleName);
      setSelectedTestCases([]);
      return;
    }
    setSelectedSubmodules(prev =>
      prev.includes(submoduleName)
        ? prev.filter(s => s !== submoduleName)
        : [...prev, submoduleName]
    );
  };

  // When selection mode is toggled off, clear multi-select state
  useEffect(() => {
    if (!moduleSelectMode) setSelectedModules([]);
    if (!submoduleSelectMode) setSelectedSubmodules([]);
  }, [moduleSelectMode, submoduleSelectMode]);

  // When selection changes, update selectedTestCases for bulk actions
  useEffect(() => {
    if (moduleSelectMode || submoduleSelectMode) {
      setSelectedTestCases(selectedTestCaseIds);
    }
  }, [selectedTestCaseIds, moduleSelectMode, submoduleSelectMode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Generate module and submodule IDs
    const moduleId = formData.module.substring(0, 3).toUpperCase();
    const subModuleId = formData.subModule.substring(0, 3).toUpperCase();
    const timestamp = Date.now().toString().slice(-4);
    
    if (editingTestCase) {
      updateTestCase({
        ...formData,
        id: editingTestCase.id,
        steps: formData.steps.filter(step => step.trim() !== ''),
      });
    } else {
      addTestCase({
        ...formData,
        id: `TC-${moduleId}-${subModuleId}-${timestamp}`,
        steps: formData.steps.filter(step => step.trim() !== ''),
      });
    }
    resetForm();
  };

  const handleEdit = (testCase: TestCase) => {
    setEditingTestCase(testCase);
    setFormData({
      module: testCase.module,
      subModule: testCase.subModule,
      title: testCase.title || '',
      description: testCase.description,
      steps: testCase.steps,
      expectedResult: testCase.expectedResult || '',
      actualResult: testCase.actualResult || '',
      type: testCase.type,
      severity: testCase.severity,
      // status: testCase.status,
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
      module: '',
      subModule: '',
      title: '',
      description: '',
      steps: [''],
      expectedResult: '',
      actualResult: '',
      type: 'functional',
      severity: 'medium',
      // status: 'active',
      projectId: selectedProject,
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
      const testCase = testCases.find((tc: TestCase) => tc.id === testCaseId);
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
      setSelectedTestCases(filteredTestCases.map((tc: TestCase) => tc.id));
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

  const handleViewSteps = (testCase: TestCase) => {
    setViewingTestCase(testCase);
    setIsViewStepsModalOpen(true);
  };

  const handleViewTestCase = (testCase: TestCase) => {
    setViewingTestCase(testCase);
    setIsViewTestCaseModalOpen(true);
  };

  const toggleRowExpansion = (testCaseId: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(testCaseId)) {
        newSet.delete(testCaseId);
      } else {
        newSet.add(testCaseId);
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
            <h1 className="text-2xl font-bold text-gray-900">Test Cases</h1>
            <p className="text-sm text-gray-500">
              {selectedProject ? `Project: ${projects.find(p => p.id === selectedProject)?.name}` : 'Select a project to begin'}
            </p>
          </div>
          <Button 
            onClick={() => setIsModalOpen(true)} 
            className="flex items-center space-x-2"
            disabled={!selectedProject}
          >
            <Plus className="w-4 h-4" />
            <span>Add Test Case</span>
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
                    variant={selectedProject === project.id ? 'primary' : 'secondary'}
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
          {selectedProject && (
            <Card className="mb-4">
              <CardContent className="p-4">
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-lg font-semibold text-gray-900">Module Selection</h2>
                  <Button
                    variant={moduleSelectMode ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => setModuleSelectMode(m => !m)}
                  >
                    {moduleSelectMode ? 'Done' : 'Select'}
                  </Button>
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
                      const moduleTestCases = testCases.filter(
                        (tc: TestCase) => tc.projectId === selectedProject && tc.module === module.name
                      );
                      const isSelected = moduleSelectMode && selectedModules.includes(module.name);
                      return (
                        <Button
                          key={module.id}
                          variant={selectedModule === module.name && !moduleSelectMode ? 'primary' : 'secondary'}
                          onClick={() => handleModuleTabClick(module.name)}
                          className={`whitespace-nowrap transition-all ${isSelected ? 'bg-blue-100 text-blue-800 ring-2 ring-blue-500 rounded-full' : ''}`}
                        >
                          {module.name}
                          <Badge variant="info" className="ml-2">
                            {moduleTestCases.length}
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
          {selectedProject && selectedModule && (
            <Card className="mb-4">
              <CardContent className="p-4">
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-lg font-semibold text-gray-900">Submodule Selection</h2>
                  <Button
                    variant={submoduleSelectMode ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => setSubmoduleSelectMode(m => !m)}
                  >
                    {submoduleSelectMode ? 'Done' : 'Select'}
                  </Button>
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
                        const isModuleSelected = moduleSelectMode && selectedModules.includes(selectedModule);
                        const isSelected = (submoduleSelectMode && selectedSubmodules.includes(submodule)) || isModuleSelected;
                        const submoduleTestCases = testCases.filter(
                          (tc: TestCase) => tc.projectId === selectedProject && tc.module === selectedModule && tc.subModule === submodule
                        );
                        return (
                          <div
                            key={submodule}
                            className={`flex items-center transition-all ${isSelected ? 'bg-blue-100 text-blue-800 ring-2 ring-blue-500 rounded-full' : ''}`}
                          >
                            <div className="flex items-center border border-gray-200 rounded-lg p-0.5 bg-white hover:border-gray-300 transition-colors">
                              <Button
                                variant={selectedSubmodule === submodule && !submoduleSelectMode ? 'primary' : 'secondary'}
                                onClick={() => handleSubmoduleTabClick(submodule)}
                                className="whitespace-nowrap border-0"
                              >
                                {submodule}
                                <Badge variant="info" className="ml-2">
                                  {submoduleTestCases.length}
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
                                    projectId: selectedProject
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

          {/* Bulk Operations Panel */}
          {selectedProject && selectedModule && selectedTestCases.length > 0 && (
            <div className="flex justify-end space-x-3 mb-4">
              <Button 
                onClick={() => {
                  if (window.confirm(`Are you sure you want to delete ${selectedTestCases.length} test case(s)?`)) {
                    selectedTestCases.forEach(id => deleteTestCase(id));
                    setSelectedTestCases([]);
                  }
                }}
                className="flex items-center space-x-2 bg-red-600 hover:bg-red-700"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete ({selectedTestCases.length})</span>
              </Button>
              <Button 
                onClick={() => setIsAllocateModalOpen(true)}
                className="flex items-center space-x-2"
              >
                <CheckSquare className="w-4 h-4" />
                <span>Allocate ({selectedTestCases.length})</span>
              </Button>
            </div>
          )}

          {/* Test Cases Table - Now with dynamic height */}
          {selectedProject && selectedModule && (
            <Card>
              <CardContent className="p-0">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr className="border-b border-gray-200">
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <input
                          type="checkbox"
                          checked={selectedTestCases.length === filteredTestCases.length}
                          onChange={(e) => handleSelectAll(e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Test Case ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Title
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">
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
                    {filteredTestCases.map((testCase: TestCase) => (
                      <React.Fragment key={testCase.id}>
                        <tr className="hover:bg-gray-50">
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
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {testCase.title || 'Untitled'}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            <div className="flex items-center space-x-2">
                              <span className="truncate max-w-[180px]">
                                {testCase.description}
                              </span>
                              <button
                                onClick={() => toggleRowExpansion(testCase.id)}
                                className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-transform duration-200"
                                style={{
                                  transform: expandedRows.has(testCase.id) ? 'rotate(180deg)' : 'rotate(0deg)'
                                }}
                              >
                                <ChevronDown className="w-4 h-4" />
                              </button>
                            </div>
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
                                onClick={() => handleViewTestCase(testCase)}
                                className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                                title="View"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
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
                        {expandedRows.has(testCase.id) && (
                          <tr className="bg-gray-50">
                            <td colSpan={8} className="px-6 py-4">
                              <div className="bg-white rounded-lg border border-gray-200 p-4">
                                <h4 className="text-sm font-medium text-gray-700 mb-2">Full Description</h4>
                                <p className="text-sm text-gray-600 whitespace-pre-wrap">
                                  {testCase.description}
                                </p>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Add/Edit Test Case Modal */}
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
              Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
              >
                <Plus className="w-4 h-4" />
                <span>Add Step</span>
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
                Expected Result
              </label>
              <textarea
                value={formData.expectedResult}
                onChange={(e) => handleInputChange('expectedResult', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={2}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Actual Result
              </label>
              <textarea
                value={formData.actualResult}
                onChange={(e) => handleInputChange('actualResult', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={2}
              />
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

      {/* View Steps Modal */}
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

      {/* Allocate to Release Modal */}
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
            >
              <option value="">Select a release</option>
              {releases.map(release => (
                <option key={release.id} value={release.id}>
                  {release.name}
                </option>
              ))}
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

      {/* View Test Case Modal */}
      <Modal
        isOpen={isViewTestCaseModalOpen}
        onClose={() => {
          setIsViewTestCaseModalOpen(false);
          setViewingTestCase(null);
        }}
        title={`Test Case Details - ${viewingTestCase?.id}`}
        size="xl"
      >
        {viewingTestCase && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Title</h3>
                <p className="mt-1 text-sm text-gray-900">{viewingTestCase.title || 'Untitled'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Type</h3>
                <p className="mt-1 text-sm text-gray-900 capitalize">{viewingTestCase.type}</p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Description</h3>
              <p className="mt-1 text-sm text-gray-900">{viewingTestCase.description}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Test Steps</h3>
              <div className="space-y-2">
                {viewingTestCase.steps.map((step, index) => (
                  <div key={index} className="flex items-start space-x-3 bg-gray-50 p-3 rounded-lg">
                    <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center text-sm font-medium text-blue-600 bg-blue-50 rounded-full">
                      {index + 1}
                    </span>
                    <p className="text-sm text-gray-900">{step}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Expected Result</h3>
                <p className="mt-1 text-sm text-gray-900">{viewingTestCase.expectedResult || 'Not specified'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Actual Result</h3>
                <p className="mt-1 text-sm text-gray-900">{viewingTestCase.actualResult || 'Not specified'}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Severity</h3>
                <span className={`mt-1 inline-flex px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(viewingTestCase.severity)}`}>
                  {viewingTestCase.severity}
                </span>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Status</h3>
                <span className="mt-1 inline-flex px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  N/A
                </span>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Module</h3>
                <p className="mt-1 text-sm text-gray-900">{viewingTestCase.module} / {viewingTestCase.subModule}</p>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setIsViewTestCaseModalOpen(false);
                  setViewingTestCase(null);
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
        title="Test Case Description"
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
