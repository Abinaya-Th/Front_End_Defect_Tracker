import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ChevronLeft, Eye, Edit2, Trash2 } from 'lucide-react';
import { Modal } from '../components/ui/Modal';

const TABS = [
  { key: 'testcases', label: 'Test Case View' },
  { key: 'allocate', label: 'Allocate Test Cases' },
  { key: 'qa', label: 'Allocate QA' },
];

export const ReleaseDetails: React.FC = () => {
  const { projectId, releaseId } = useParams();
  const navigate = useNavigate();
  const { releases, testCases } = useApp();
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

  return (
    <div className="max-w-6xl mx-auto">
      <Button variant="secondary" onClick={() => navigate(`/projects/${projectId}/releases`)} className="mb-4 flex items-center">
        <ChevronLeft className="w-4 h-4 mr-1" /> Back to Releases
      </Button>
      <Card className="mb-6">
        <CardContent className="p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{release?.name || 'Release Details'}</h1>
          <div className="text-gray-700 mb-1">{release?.description}</div>
          <div className="text-sm text-gray-500 mb-1">Type: {release?.type || 'N/A'}</div>
          <div className="text-sm text-gray-500 mb-1">Delivery Date: {release?.releaseDate || 'TBD'}</div>
        </CardContent>
      </Card>
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
            {/* Module Panel */}
            <Card className="mb-4">
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
            {/* Submodule Panel */}
            {selectedModule && (
              <Card className="mb-4">
                <CardContent className="p-4">
                  <h2 className="text-lg font-semibold text-gray-900 mb-3">Submodule Selection</h2>
                  <div className="flex flex-wrap gap-2">
                    {mockModules.find(m => m.name === selectedModule)?.submodules.map(submodule => (
                      <Button
                        key={submodule}
                        variant={selectedSubmodule === submodule ? 'primary' : 'secondary'}
                        onClick={() => setSelectedSubmodule(submodule)}
                      >
                        {submodule}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
            {/* Test Case Table - Replicated from TestCase page */}
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr className="border-b border-gray-200">
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Test Case ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Steps</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Severity</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {submoduleTestCases.map(tc => (
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
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => { setViewingTestCase(tc); setIsViewTestCaseModalOpen(true); }}
                                className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                                title="View"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {/* edit logic here */}}
                                className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                                title="Edit"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {/* delete logic here */}}
                                className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {submoduleTestCases.length === 0 && (
                        <tr>
                          <td colSpan={6} className="text-center text-gray-400 py-8">No test cases allocated to this release.</td>
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
                      <span className={`mt-1 inline-flex px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(viewingTestCase.severity)}`}>{viewingTestCase.severity}</span>
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
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Steps</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Severity</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
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
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => { setViewingTestCase(tc); setIsViewTestCaseModalOpen(true); }}
                                className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                                title="View"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {/* edit logic here */}}
                                className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                                title="Edit"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {/* delete logic here */}}
                                className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
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
    </div>
  );
}; 