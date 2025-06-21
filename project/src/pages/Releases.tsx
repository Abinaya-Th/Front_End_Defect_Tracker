import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ChevronLeft, Eye } from 'lucide-react';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';

const TABS = [
  { key: 'testcases', label: 'Test Case View' },
  { key: 'allocate', label: 'Allocate Test Cases' },
  { key: 'qa', label: 'Allocate QA' },
];

export const Releases: React.FC = () => {
  const { projectId, releaseId } = useParams();
  const navigate = useNavigate();
  const { releases, testCases, addDefect, testCaseDefectMap, setTestCaseDefectMap, defects } = useApp();
  const [activeTab, setActiveTab] = useState('testcases');
  const release = releases.find(r => r.id === releaseId);

  // Mock modules and submodules (replace with real data if available)
  const mockModules = [
    { id: 'auth', name: 'Authentication', submodules: ['Login', 'Registration', 'Password Reset'] },
    { id: 'user', name: 'User Management', submodules: ['Profile', 'Settings', 'Permissions'] },
    { id: 'content', name: 'Content Management', submodules: ['Articles', 'Media', 'Categories'] },
    { id: 'payment', name: 'Payment Processing', submodules: ['Transactions', 'Refunds', 'Invoices'] },
    { id: 'reporting', name: 'Reporting', submodules: ['Analytics', 'Exports', 'Dashboards'] }
  ];
  const [selectedModule, setSelectedModule] = useState('');
  const [selectedSubmodule, setSelectedSubmodule] = useState('');
  const [isViewStepsModalOpen, setIsViewStepsModalOpen] = useState(false);
  const [isViewTestCaseModalOpen, setIsViewTestCaseModalOpen] = useState(false);
  const [viewingTestCase, setViewingTestCase] = useState<any>(null);

  // State for Allocate Test Cases tab
  const [allocSelectedModule, setAllocSelectedModule] = useState('');
  const [allocSelectedSubmodule, setAllocSelectedSubmodule] = useState('');
  const [allocSelectedTestCases, setAllocSelectedTestCases] = useState<string[]>([]);

  // Add state to track test case statuses
  const [testCaseStatuses, setTestCaseStatuses] = useState<Record<string, 'pass' | 'fail' | undefined>>({});
  // Add state to track assignee (for demo, static user)
  const [testCaseAssignees] = useState<Record<string, string>>({});
  // Add state to track defect IDs for failed test cases
  const [testCaseDefectIds, setTestCaseDefectIds] = useState<Record<string, string>>({});
  // Add state to track which test case is being failed/logged
  const [currentFailingTestCaseId, setCurrentFailingTestCaseId] = useState<string | null>(null);

  // Filter test cases allocated to this release
  const allocatedTestCases = testCases.filter(tc => tc.releaseId === releaseId);

  // Module and submodule filtering
  const moduleTestCases = selectedModule
    ? allocatedTestCases.filter(tc => tc.module === selectedModule)
    : allocatedTestCases;
  const submoduleTestCases = selectedSubmodule
    ? moduleTestCases.filter(tc => tc.subModule === selectedSubmodule)
    : moduleTestCases;

  // All test cases for the project (not just allocated)
  const allProjectTestCases = testCases.filter(tc => tc.projectId === projectId);
  const allocModuleTestCases = allocSelectedModule
    ? allProjectTestCases.filter(tc => tc.module === allocSelectedModule)
    : allProjectTestCases;
  const allocSubmoduleTestCases = allocSelectedSubmodule
    ? allocModuleTestCases.filter(tc => tc.subModule === allocSelectedSubmodule)
    : allocModuleTestCases;

  // Bulk selection logic
  const handleAllocSelectAll = (checked: boolean) => {
    if (checked) {
      setAllocSelectedTestCases(allocSubmoduleTestCases.map(tc => tc.id));
    } else {
      setAllocSelectedTestCases([]);
    }
  };
  const handleAllocSelectTestCase = (testCaseId: string, checked: boolean) => {
    if (checked) {
      setAllocSelectedTestCases([...allocSelectedTestCases, testCaseId]);
    } else {
      setAllocSelectedTestCases(allocSelectedTestCases.filter(id => id !== testCaseId));
    }
  };

  // Handler for status change
  const handleStatusChange = (testCaseId: string, status: 'pass' | 'fail') => {
    setTestCaseStatuses(prev => ({ ...prev, [testCaseId]: status }));
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

  // Mock test case data for demonstration
  const mockTestCases = [
    {
      id: 'TC001',
      description: 'Login with valid credentials',
      steps: '1. Go to login page\n2. Enter valid username and password\n3. Click login',
      type: 'Functional',
      severity: 'high',
      module: 'Authentication',
      subModule: 'Login',
      releaseId: releaseId,
      projectId: projectId,
      assignee: 'Alice Johnson',
    },
    {
      id: 'TC002',
      description: 'Registration with existing email',
      steps: '1. Go to registration page\n2. Enter existing email\n3. Submit',
      type: 'Negative',
      severity: 'medium',
      module: 'Authentication',
      subModule: 'Registration',
      releaseId: releaseId,
      projectId: projectId,
      assignee: 'Bob Smith',
    },
    {
      id: 'TC003',
      description: 'Reset password with invalid token',
      steps: '1. Go to reset password\n2. Enter invalid token\n3. Submit',
      type: 'Negative',
      severity: 'low',
      module: 'Authentication',
      subModule: 'Password Reset',
      releaseId: releaseId,
      projectId: projectId,
      assignee: 'Carol Lee',
    },
  ];

  // Use mock data if no real test cases are found
  const testCasesToShow = submoduleTestCases.length > 0 ? submoduleTestCases : mockTestCases.filter(tc =>
    (!selectedModule || tc.module === selectedModule) &&
    (!selectedSubmodule || tc.subModule === selectedSubmodule)
  );

  // State for defect modal and defect form
  const [isDefectModalOpen, setIsDefectModalOpen] = useState(false);
  const [defectFormData, setDefectFormData] = useState({
    title: '',
    description: '',
    module: '',
    subModule: '',
    type: 'bug',
    priority: 'medium',
    severity: 'medium',
    status: 'open',
    projectId: projectId || '',
    releaseId: releaseId || '',
    testCaseId: '',
    assignedTo: '',
    reportedBy: '',
    rejectionComment: '',
  });

  // Add getNextDefectId function (copied from Defects.tsx)
  const getNextDefectId = () => {
    const projectDefects = defects.filter(d => d.projectId === projectId);
    const ids = projectDefects
      .map(d => d.id)
      .map(id => parseInt(id.replace('DEF-', '')))
      .filter(n => !isNaN(n));
    const nextNum = ids.length > 0 ? Math.max(...ids) + 1 : 1;
    return `DEF-${nextNum.toString().padStart(4, '0')}`;
  };

  // Handler for opening defect modal with prefilled data
  const handleFailClick = (tc: any) => {
    setDefectFormData({
      title: tc.description,
      description: tc.steps,
      module: tc.module,
      subModule: tc.subModule,
      type: tc.type || 'bug',
      priority: 'medium',
      severity: tc.severity || 'medium',
      status: 'open',
      projectId: projectId || '',
      releaseId: releaseId || '',
      testCaseId: tc.id,
      assignedTo: tc.assignee || '',
      reportedBy: '',
      rejectionComment: '',
    });
    setCurrentFailingTestCaseId(tc.id);
    setIsDefectModalOpen(true);
  };

  // Handler for input changes
  const handleDefectInputChange = (field: string, value: string) => {
    setDefectFormData(prev => ({ ...prev, [field]: value }));
  };

  // Handler for submitting the defect form
  const handleDefectFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newDefect = {
      ...defectFormData,
      type: defectFormData.type as 'bug' | 'test-failure' | 'enhancement',
      priority: defectFormData.priority as 'low' | 'medium' | 'high' | 'critical',
      severity: defectFormData.severity as 'low' | 'medium' | 'high' | 'critical',
      status: defectFormData.status as 'open' | 'in-progress' | 'resolved' | 'closed' | 'rejected',
      id: getNextDefectId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    addDefect(newDefect);
    setTestCaseDefectMap(prev => ({ ...prev, [defectFormData.testCaseId]: newDefect.id }));
    setIsDefectModalOpen(false);
    setCurrentFailingTestCaseId(null);
  };

  // State for Edit Test Case modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTestCase, setEditingTestCase] = useState<any | null>(null);

  // Handler for opening edit modal
  const handleEditClick = (tc: any) => {
    setEditingTestCase({ ...tc });
    setIsEditModalOpen(true);
  };

  // Handler for saving edited test case
  const handleEditSave = () => {
    // Update the test case list in context
    // TODO: Use updateTestCase from context if available
    // const updatedTestCases = testCases.map(tc =>
    //   tc.id === editingTestCase.id ? editingTestCase : tc
    // );
    // setTestCases(updatedTestCases);
    setIsEditModalOpen(false);
    setEditingTestCase(null);
  };

  // Handler for deleting a test case
  const handleDeleteClick = (id: string) => {
    if (window.confirm('Are you sure you want to delete this test case?')) {
      // Filter it out from the test case list (or call delete API)
      // const updatedTestCases = testCases.filter(tc => tc.id !== id);
      // setTestCases(updatedTestCases); // If using context
    }
  };

  return (
    <div className="max-w-7xl w-full px-4 mx-auto py-8">
      <Button variant="secondary" onClick={() => navigate(`/projects/${projectId}/releases`)} className="mb-4 flex items-center">
        <ChevronLeft className="w-4 h-4 mr-1" /> Back to Releases
      </Button>
      {/* Make the release card narrower and centered */}
      <div className="max-w-md mx-auto">
        <Card className="mb-4">
          <CardContent className="p-3">
            <h1 className="text-lg font-bold text-gray-900 mb-1">{release?.name || 'Release Details'}</h1>
            <div className="text-gray-700 mb-1 text-sm">{release?.description}</div>
            <div className="text-xs text-gray-500 mb-1">Type: {release?.type || 'N/A'}</div>
            <div className="text-xs text-gray-500 mb-1">Delivery Date: {release?.releaseDate || 'TBD'}</div>
          </CardContent>
        </Card>
      </div>
      {/* Horizontal Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-6 py-2 text-sm font-medium border-b-2 transition-colors duration-200 focus:outline-none ${
              activeTab === tab.key
                ? 'border-blue-600 text-blue-600 bg-blue-50'
                : 'border-transparent text-gray-600 hover:text-blue-600 hover:bg-blue-50'
            }`}
            style={{ borderBottomWidth: '2px' }}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {/* Tab Content */}
      <div className="flex-1">
        {activeTab === 'testcases' && (
          <div>
            {/* Module Panel - always visible and sticky */}
            <div className="sticky top-0 z-10 bg-white pb-2">
              <Card className="mb-2">
                <CardContent className="p-4">
                  <h2 className="text-lg font-semibold text-gray-900 mb-3">Module Selection</h2>
                  <div className="flex flex-wrap gap-2">
                    {mockModules.map(module => (
                      <Button
                        key={module.id}
                        variant={selectedModule === module.name ? 'primary' : 'secondary'}
                        onClick={() => {
                          setSelectedModule(module.name);
                          setSelectedSubmodule('');
                        }}
                      >
                        {module.name}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
              {/* Submodule Panel - always visible, show placeholder if no module selected */}
              <Card className="mb-4">
                <CardContent className="p-4">
                  <h2 className="text-lg font-semibold text-gray-900 mb-3">Submodule Selection</h2>
                  <div className="flex flex-wrap gap-2">
                    {selectedModule ? (
                      mockModules.find(m => m.name === selectedModule)?.submodules.map(submodule => (
                        <Button
                          key={submodule}
                          variant={selectedSubmodule === submodule ? 'primary' : 'secondary'}
                          onClick={() => setSelectedSubmodule(submodule)}
                        >
                          {submodule}
                        </Button>
                      ))
                    ) : (
                      <span className="text-gray-400">Select a module to view submodules</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
            {/* Test Case Table - Replicated from TestCase page */}
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr className="border-b border-gray-200">
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Test Case ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Brief Description</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Steps</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Severity</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assign To</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Defect ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        {/* Removed Actions column */}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {testCasesToShow.map(tc => (
                        <tr key={tc.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{tc.id}</td>
                          <td className="px-6 py-4 text-sm text-gray-500">{tc.description}</td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            <button
                              onClick={() => { setViewingTestCase(tc); setIsViewStepsModalOpen(true); }}
                              className="text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                              title="View Steps"
                            >
                              <Eye className="w-4 h-4" />
                              <span>View</span>
                            </button>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{tc.type}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(tc.severity)}`}>{tc.severity}</span>
                          </td>
                          {/* Assign To column with avatar and name */}
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex items-center space-x-2">
                              <img
                                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(tc.assignee || 'User')}`}
                                alt={tc.assignee || 'Assignee'}
                                className="w-8 h-8 rounded-full border inline-block"
                              />
                              <span>{tc.assignee || 'Unassigned'}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex items-center space-x-2">
                              <Button
                                size="sm"
                                variant="secondary"
                                style={{ backgroundColor: testCaseStatuses[tc.id] === 'pass' ? '#22c55e' : '', color: testCaseStatuses[tc.id] === 'pass' ? 'white' : '' }}
                                onClick={() => handleStatusChange(tc.id, 'pass')}
                              >
                                Pass
                              </Button>
                              <Button
                                size="sm"
                                variant="secondary"
                                style={{ backgroundColor: testCaseStatuses[tc.id] === 'fail' ? '#ef4444' : '', color: testCaseStatuses[tc.id] === 'fail' ? 'white' : '' }}
                                onClick={() => {
                                  handleStatusChange(tc.id, 'fail');
                                  handleFailClick(tc);
                                }}
                              >
                                Fail
                              </Button>
                            </div>
                          </td>
                          {/* Defect ID column: show only if failed and defect ID exists */}
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {testCaseStatuses[tc.id] === 'fail' && testCaseDefectMap[tc.id] ? (
                              <button
                                className="px-2 py-1 rounded bg-blue-100 text-blue-800 font-semibold hover:bg-blue-200 transition"
                                onClick={() => navigate(`/projects/${projectId}/defects?highlight=${testCaseDefectMap[tc.id]}`)}
                                title="View Defect"
                              >
                                {testCaseDefectMap[tc.id]}
                              </button>
                            ) : (
                              '-'
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <button
                              onClick={() => { setViewingTestCase(tc); setIsViewTestCaseModalOpen(true); }}
                              className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {submoduleTestCases.length === 0 && (
                        <tr>
                          <td colSpan={9} className="text-center text-gray-400 py-8">No test cases allocated to this release.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
            {/* View Steps Modal */}
            <Modal
              isOpen={isViewStepsModalOpen}
              onClose={() => { setIsViewStepsModalOpen(false); setViewingTestCase(null); }}
              title={`Test Steps - ${viewingTestCase?.id}`}
            >
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 whitespace-pre-line">
                    {viewingTestCase?.steps}
                  </p>
                </div>
                <div className="flex justify-end pt-4">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => { setIsViewStepsModalOpen(false); setViewingTestCase(null); }}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </Modal>
            {/* View Test Case Modal */}
            <Modal
              isOpen={isViewTestCaseModalOpen}
              onClose={() => { setIsViewTestCaseModalOpen(false); setViewingTestCase(null); }}
              title={`Test Case Details - ${viewingTestCase?.id}`}
              size="xl"
            >
              {viewingTestCase && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Description</h3>
                      <p className="mt-1 text-sm text-gray-900">{viewingTestCase.description}</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Test Steps</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-700 whitespace-pre-line">{viewingTestCase.steps}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Severity</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(viewingTestCase.severity)}`}>{viewingTestCase.severity}</span>
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
                      onClick={() => { setIsViewTestCaseModalOpen(false); setViewingTestCase(null); }}
                    >
                      Close
                    </Button>
                  </div>
                </div>
              )}
            </Modal>
          </div>
        )}
        {activeTab === 'allocate' && (
          <div>
            {/* Module Selection Panel */}
            <Card className="mb-4">
              <CardContent className="p-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Module Selection</h2>
                <div className="flex flex-wrap gap-2">
                  {mockModules.map(module => (
                    <Button
                      key={module.id}
                      variant={allocSelectedModule === module.name ? 'primary' : 'secondary'}
                      onClick={() => {
                        setAllocSelectedModule(module.name);
                        setAllocSelectedSubmodule('');
                        setAllocSelectedTestCases([]);
                      }}
                    >
                      {module.name}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
            {/* Submodule Selection Panel */}
            {allocSelectedModule && (
              <Card className="mb-4">
                <CardContent className="p-4">
                  <h2 className="text-lg font-semibold text-gray-900 mb-3">Submodule Selection</h2>
                  <div className="flex flex-wrap gap-2">
                    {mockModules.find(m => m.name === allocSelectedModule)?.submodules.map(submodule => (
                      <Button
                        key={submodule}
                        variant={allocSelectedSubmodule === submodule ? 'primary' : 'secondary'}
                        onClick={() => {
                          setAllocSelectedSubmodule(submodule);
                          setAllocSelectedTestCases([]);
                        }}
                      >
                        {submodule}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
            {/* Bulk Operations Panel */}
            {allocSelectedModule && allocSelectedTestCases.length > 0 && (
              <div className="flex justify-end space-x-3 mb-4">
                <Button
                  className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
                  onClick={() => {/* Allocation logic here */}}
                >
                  <span>Allocate ({allocSelectedTestCases.length})</span>
                </Button>
              </div>
            )}
            {/* Test Case Table */}
            {allocSelectedModule && (
              <Card>
                <CardContent className="p-0">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr className="border-b border-gray-200">
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <input
                            type="checkbox"
                            checked={allocSelectedTestCases.length === allocSubmoduleTestCases.length && allocSubmoduleTestCases.length > 0}
                            onChange={e => handleAllocSelectAll(e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Test Case ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Brief Description</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Steps</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Severity</th>
                        {/* Removed Actions column */}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {allocSubmoduleTestCases.map(tc => (
                        <tr key={tc.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="checkbox"
                              checked={allocSelectedTestCases.includes(tc.id)}
                              onChange={e => handleAllocSelectTestCase(tc.id, e.target.checked)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{tc.id}</td>
                          <td className="px-6 py-4 text-sm text-gray-500">{tc.description}</td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            <button
                              onClick={() => { setViewingTestCase(tc); setIsViewStepsModalOpen(true); }}
                              className="text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                              title="View Steps"
                            >
                              <Eye className="w-4 h-4" />
                              <span>View</span>
                            </button>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{tc.type}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(tc.severity)}`}>{tc.severity}</span>
                          </td>
                          {/* Removed Actions cell */}
                        </tr>
                      ))}
                      {allocSubmoduleTestCases.length === 0 && (
                        <tr>
                          <td colSpan={7} className="text-center text-gray-400 py-8">No test cases found for this module/submodule.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            )}
          </div>
        )}
        {activeTab === 'qa' && (
          <div>
            <Card>
              <CardContent className="p-8 text-center text-gray-500">Allocate QA UI goes here.</CardContent>
            </Card>
          </div>
        )}
      </div>
      {/* Log Defect Modal */}
      <Modal
        isOpen={isDefectModalOpen}
        onClose={() => setIsDefectModalOpen(false)}
        title={"Report New Defect"}
        size="lg"
      >
        <form onSubmit={handleDefectFormSubmit} className="space-y-4">
          <Input
            label="Brief Description"
            value={defectFormData.title}
            onChange={e => handleDefectInputChange('title', e.target.value)}
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Steps</label>
            <textarea
              value={defectFormData.description}
              onChange={e => handleDefectInputChange('description', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Modules</label>
              <input className="w-full px-3 py-2 border border-gray-300 rounded-lg" value={defectFormData.module} disabled />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Submodules</label>
              <input className="w-full px-3 py-2 border border-gray-300 rounded-lg" value={defectFormData.subModule} disabled />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
              <select
                value={defectFormData.severity}
                onChange={e => handleDefectInputChange('severity', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select severity</option>
                <option value="critical">Critical</option>
                <option value="major">Major</option>
                <option value="minor">Minor</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                value={defectFormData.priority}
                onChange={e => handleDefectInputChange('priority', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select priority</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Types</label>
              <select
                value={defectFormData.type}
                onChange={e => handleDefectInputChange('type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select type</option>
                <option value="ui-issue">UI Issue</option>
                <option value="functional-bug">Functional Bug</option>
                <option value="performance-issue">Performance Issue</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={defectFormData.status}
                onChange={e => handleDefectInputChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select status</option>
                <option value="open">Open</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
          {defectFormData.status === 'rejected' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rejection Comment</label>
              <Input
                value={defectFormData.rejectionComment}
                onChange={e => handleDefectInputChange('rejectionComment', e.target.value)}
                placeholder="Enter reason for rejection"
                required={defectFormData.status === 'rejected'}
              />
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Assigned To"
              value={defectFormData.assignedTo}
              onChange={e => handleDefectInputChange('assignedTo', e.target.value)}
              required
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="secondary" onClick={() => setIsDefectModalOpen(false)}>Cancel</Button>
            <Button type="submit">Report Defect</Button>
          </div>
        </form>
      </Modal>
      {/* Edit Test Case Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Edit Test Case - ${editingTestCase?.id}`}
      >
        {editingTestCase && (
          <form className="space-y-4 p-4">
            <div>
              <label className="block text-xs font-medium text-gray-600">Description</label>
              <input
                className="w-full border rounded px-2 py-1"
                value={editingTestCase.description}
                onChange={e => setEditingTestCase({ ...editingTestCase, description: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600">Steps</label>
              <textarea
                className="w-full border rounded px-2 py-1"
                value={editingTestCase.steps}
                onChange={e => setEditingTestCase({ ...editingTestCase, steps: e.target.value })}
              />
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <Button type="button" variant="primary" onClick={handleEditSave}>Save</Button>
              <Button type="button" variant="secondary" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};