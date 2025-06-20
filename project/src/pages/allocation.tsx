import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ChevronLeft, Eye, Edit2, Trash2, Plus, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Modal } from '../components/ui/Modal';

const TABS = [
  { key: 'release', label: 'Release Allocation' },
  { key: 'qa', label: 'QA Allocation' },
];

export const Allocation: React.FC = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { projects, releases, employees, testCases, setSelectedProjectId } = useApp();
  const [activeTab, setActiveTab] = useState<'release' | 'qa'>('release');
  const [selectedReleaseId, setSelectedReleaseId] = useState<string | null>(null);
  const [selectedModule, setSelectedModule] = useState('');
  const [selectedSubmodule, setSelectedSubmodule] = useState('');
  const [selectedQA, setSelectedQA] = useState<string | null>(null);
  const [selectedTestCases, setSelectedTestCases] = useState<string[]>([]);
  const [isViewStepsModalOpen, setIsViewStepsModalOpen] = useState(false);
  const [isViewTestCaseModalOpen, setIsViewTestCaseModalOpen] = useState(false);
  const [viewingTestCase, setViewingTestCase] = useState<any>(null);

  React.useEffect(() => {
    if (projectId) setSelectedProjectId(projectId);
  }, [projectId, setSelectedProjectId]);

  // Mock modules and submodules (should be replaced with real data)
  const mockModules = [
    { id: 'auth', name: 'Authentication', submodules: ['Biometric Login', 'PIN Login', 'Password Reset', 'Session Management'] },
    { id: 'acc', name: 'Account Management', submodules: ['Account Overview', 'Transaction History', 'Account Statements', 'Account Settings'] },
    { id: 'tra', name: 'Money Transfer', submodules: ['Quick Transfer', 'Scheduled Transfer', 'International Transfer', 'Transfer Limits'] },
    { id: 'bil', name: 'Bill Payments', submodules: ['Bill List', 'Payment Scheduling', 'Payment History', 'Recurring Payments'] },
    { id: 'sec', name: 'Security Features', submodules: ['Two-Factor Auth', 'Device Management', 'Security Alerts', 'Fraud Protection'] },
    { id: 'sup', name: 'Customer Support', submodules: ['Chat Support', 'FAQs', 'Contact Us', 'Feedback'] }
  ];

  // Filter releases for this project
  const projectReleases = releases.filter(r => r.projectId === projectId);
  // Filter test cases for this project
  const projectTestCases = testCases.filter(tc => tc.projectId === projectId);

  // --- UI Panels ---
  const ProjectSelectionPanel = () => (
    <Card className="mb-4">
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
                onClick={() => {
                  setSelectedProjectId(project.id);
                  setSelectedModule('');
                  setSelectedSubmodule('');
                  setSelectedTestCases([]);
                }}
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
  );

  const ReleaseCardsPanel = () => (
    <div className="flex space-x-4 mb-4 overflow-x-auto">
      {projectReleases.map(release => (
        <Card
          key={release.id}
          hover
          className={`min-w-[200px] cursor-pointer border-2 ${selectedReleaseId === release.id ? 'border-blue-500' : 'border-transparent'}`}
          onClick={() => setSelectedReleaseId(release.id)}
        >
          <CardContent className="p-4 flex flex-col items-center">
            <span className="font-bold text-blue-700 text-lg mb-1">{release.name}</span>
            <span className="text-xs text-gray-500 mb-2">v{release.version}</span>
            <Badge variant={release.status === 'completed' ? 'success' : 'info'}>{release.status}</Badge>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const ModuleSelectionPanel = () => (
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
            {mockModules.map(module => {
              const moduleTestCases = testCases.filter(
                (tc: any) => tc.projectId === projectId && tc.module === module.name
              );
              return (
                <Button
                  key={module.id}
                  variant={selectedModule === module.name ? 'primary' : 'secondary'}
                  onClick={() => {
                    setSelectedModule(module.name);
                    setSelectedSubmodule('');
                    setSelectedTestCases([]);
                  }}
                  className="whitespace-nowrap"
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
  );

  const SubmoduleSelectionPanel = () => {
    const submodules = mockModules.find(m => m.name === selectedModule)?.submodules || [];
    return (
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
              {submodules.map(submodule => {
                const submoduleTestCases = testCases.filter(
                  (tc: any) => tc.projectId === projectId && tc.module === selectedModule && tc.subModule === submodule
                );
                return (
                  <Button
                    key={submodule}
                    variant={selectedSubmodule === submodule ? 'primary' : 'secondary'}
                    onClick={() => setSelectedSubmodule(submodule)}
                    className="whitespace-nowrap"
                  >
                    {submodule}
                    <Badge variant="info" className="ml-2">
                      {submoduleTestCases.length}
                    </Badge>
                  </Button>
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
    );
  };

  // Severity color helper
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

  // Selection logic
  const filteredTestCases = projectTestCases.filter(tc =>
    (!selectedModule || tc.module === selectedModule) &&
    (!selectedSubmodule || tc.subModule === selectedSubmodule)
  );
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTestCases(filteredTestCases.map(tc => tc.id));
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

  // Table with all columns and actions
  const TestCaseTable = () => (
    <Card>
      <CardContent className="p-0">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr className="border-b border-gray-200">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <input
                  type="checkbox"
                  checked={selectedTestCases.length === filteredTestCases.length && filteredTestCases.length > 0}
                  onChange={e => handleSelectAll(e.target.checked)}
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
            {filteredTestCases.map(tc => (
              <tr key={tc.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedTestCases.includes(tc.id)}
                    onChange={e => handleSelectTestCase(tc.id, e.target.checked)}
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
                      onClick={() => {/* handleEdit(tc) */}}
                      className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {/* handleDelete(tc.id) */}}
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
      </CardContent>
    </Card>
  );

  const QASelectionPanel = () => (
    <Card className="mb-4">
      <CardContent className="p-4 flex flex-wrap gap-2">
        {employees
          .filter(emp => emp.designation.toLowerCase().includes('qa'))
          .map(emp => (
            <Button
              key={emp.id}
              variant={selectedQA === emp.id ? 'primary' : 'secondary'}
              onClick={() => setSelectedQA(emp.id)}
            >
              {emp.firstName} {emp.lastName}
            </Button>
          ))}
      </CardContent>
    </Card>
  );

  return (
    <div className="max-w-5xl mx-auto py-8">
      {/* Back Button at the top */}
      <div className="mb-4">
        <Button variant="secondary" onClick={() => navigate(`/projects/${projectId}/releases`)} className="flex items-center">
          <ChevronLeft className="w-5 h-5 mr-2" /> Back to Releases
        </Button>
      </div>
      {ProjectSelectionPanel()}
      {/* Tabs */}
      <div className="flex space-x-4 mb-6 border-b border-gray-200">
        {TABS.map(tab => (
          <button
            key={tab.key}
            className={`px-4 py-2 font-medium border-b-2 transition-colors duration-200 ${
              activeTab === tab.key ? 'border-blue-500 text-blue-700' : 'border-transparent text-gray-500 hover:text-blue-700'
            }`}
            onClick={() => setActiveTab(tab.key as 'release' | 'qa')}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {/* Tab Content */}
      {activeTab === 'release' ? (
        <>
          <ReleaseCardsPanel />
          {ModuleSelectionPanel()}
          {SubmoduleSelectionPanel()}
          <TestCaseTable />
        </>
      ) : (
        <>
          <QASelectionPanel />
          {ModuleSelectionPanel()}
          {SubmoduleSelectionPanel()}
          <TestCaseTable />
        </>
      )}
      {/* View Steps Modal */}
      <Modal
        isOpen={isViewStepsModalOpen}
        onClose={() => { setIsViewStepsModalOpen(false); setViewingTestCase(null); }}
        title={`Test Steps - ${viewingTestCase?.id}`}
      >
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-gray-700 whitespace-pre-line">{viewingTestCase?.steps}</p>
          </div>
          <div className="flex justify-end pt-4">
            <Button type="button" variant="secondary" onClick={() => { setIsViewStepsModalOpen(false); setViewingTestCase(null); }}>Close</Button>
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
              <Button type="button" variant="secondary" onClick={() => { setIsViewTestCaseModalOpen(false); setViewingTestCase(null); }}>Close</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}; 