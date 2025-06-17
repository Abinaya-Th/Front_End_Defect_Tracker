import React, { useState } from 'react';
import { 
  Plus, Rocket, FileText, Package, ArrowRight, CheckCircle, X, 
  Clock, AlertTriangle, Filter, Search, ChevronDown, ChevronUp,
  BarChart2, List, Grid, Calendar, Users, Tag
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { Badge } from '../components/ui/Badge';
import { CheckCircle as CheckCircleIcon, XCircle, AlertCircle } from 'lucide-react';

export const Releases: React.FC = () => {
  const navigate = useNavigate();
  const { releases, projects, testCases, addRelease, updateRelease, addDefect, updateTestCase } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDefectModalOpen, setIsDefectModalOpen] = useState(false);
  const [selectedRelease, setSelectedRelease] = useState<string>('');
  const [selectedTestCase, setSelectedTestCase] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [expandedRelease, setExpandedRelease] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    version: '',
    description: '',
    projectId: '',
    status: 'planned' as 'planned' | 'in-progress' | 'testing' | 'released' | 'completed',
    releaseDate: '',
    testCases: [] as string[],
  });
  const [defectFormData, setDefectFormData] = useState({
    title: '',
    description: '',
    severity: 'high',
    priority: 'high',
    type: 'functional',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addRelease(formData);
    setFormData({
      name: '',
      version: '',
      description: '',
      projectId: '',
      status: 'planned',
      releaseDate: '',
      testCases: [],
    });
    setIsModalOpen(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTestCaseResult = (testCase: any, result: 'pass' | 'fail') => {
    if (result === 'pass') {
      updateTestCase({
        ...testCase,
        status: 'passed',
        result: 'pass'
      });
    } else {
      setSelectedTestCase(testCase);
      setIsDefectModalOpen(true);
    }
  };

  const handleDefectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTestCase) {
      const newDefect = {
        id: `DEF-${Date.now()}`,
        title: defectFormData.title,
        description: defectFormData.description,
        status: 'open',
        severity: defectFormData.severity,
        priority: defectFormData.priority,
        type: defectFormData.type,
        projectId: selectedTestCase.projectId,
        testCaseId: selectedTestCase.id,
        reportedBy: 'Current User',
        createdAt: new Date().toISOString(),
      };

      addDefect(newDefect);

      updateTestCase({
        ...selectedTestCase,
        status: 'failed',
        result: 'fail',
        defectId: newDefect.id
      });

      setDefectFormData({
        title: '',
        description: '',
        severity: 'high',
        priority: 'high',
        type: 'functional',
      });
      setSelectedTestCase(null);
      setIsDefectModalOpen(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'planned':
        return 'bg-yellow-100 text-yellow-800';
      case 'released':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredReleases = releases.filter(release => {
    const matchesSearch = release.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         release.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesProject = selectedProject === 'all' || release.projectId === selectedProject;
    return matchesSearch && matchesProject;
  });

  const toggleRelease = (releaseId: string) => {
    setExpandedRelease(expandedRelease === releaseId ? null : releaseId);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Releases</h1>
          <p className="text-gray-600">Manage your product releases</p>
        </div>
        <div className="flex items-center space-x-4">
          <Button onClick={() => setIsModalOpen(true)} icon={Plus}>
            Create Release
          </Button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search releases..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Projects</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>{project.name}</option>
              ))}
            </select>
            <div className="flex items-center space-x-2 border border-gray-300 rounded-lg p-1">
              <Button
                variant={viewMode === 'board' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('board')}
                className="px-2"
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="px-2"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {viewMode === 'board' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {['planned', 'in-progress', 'testing', 'released'].map((status) => (
            <div key={status} className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-900 capitalize">{status}</h3>
                <Badge variant="outline">
                  {filteredReleases.filter(r => r.status === status).length}
                </Badge>
              </div>
              <div className="space-y-4">
                {filteredReleases
                  .filter(release => release.status === status)
                  .map(release => (
                    <Card key={release.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-4" onClick={() => toggleRelease(release.id)}>
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900">{release.name}</h4>
                            <p className="text-sm text-gray-600 mt-1">{release.version}</p>
                          </div>
                          <Badge className={getStatusColor(release.status)}>
                            {release.status}
                          </Badge>
                        </div>
                        <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(release.releaseDate).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Users className="w-4 h-4" />
                            <span>{release.testCases.length} tests</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReleases.map(release => (
            <Card key={release.id} className="overflow-hidden">
              <CardHeader className="bg-gray-50 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleRelease(release.id)}
                      className="p-1"
                    >
                      {expandedRelease === release.id ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </Button>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{release.name}</h3>
                      <p className="text-sm text-gray-600">{release.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Badge variant="outline">{projects.find(p => p.id === release.projectId)?.name}</Badge>
                    <Badge className={getStatusColor(release.status)}>
                      {release.status}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              {expandedRelease === release.id && (
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Version:</span>
                      <span className="ml-2 font-medium">{release.version}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Release Date:</span>
                      <span className="ml-2 font-medium">
                        {new Date(release.releaseDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="mt-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-medium text-gray-900">Test Cases</h4>
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="outline" className="text-green-700 border-green-200 hover:bg-green-50">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Pass All
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-700 border-red-200 hover:bg-red-50">
                          <X className="w-4 h-4 mr-1" />
                          Fail All
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-4">
                      {testCases
                        .filter(tc => release.testCases.includes(tc.id))
                        .map((testCase) => (
                          <div key={testCase.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div className="space-y-1">
                              <div className="flex items-center space-x-2">
                                <span className="font-medium">{testCase.id}</span>
                                <Badge variant="outline">{testCase.type}</Badge>
                                <Badge
                                  variant={
                                    testCase.severity === 'critical' ? 'error' :
                                    testCase.severity === 'high' ? 'warning' :
                                    'default'
                                  }
                                >
                                  {testCase.severity}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600">{testCase.description}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                              {testCase.result ? (
                                <Badge
                                  variant={testCase.result === 'pass' ? 'success' : 'error'}
                                  className="flex items-center space-x-1"
                                >
                                  {testCase.result === 'pass' ? (
                                    <CheckCircleIcon className="w-4 h-4" />
                                  ) : (
                                    <X className="w-4 h-4" />
                                  )}
                                  <span>{testCase.result}</span>
                                </Badge>
                              ) : (
                                <div className="flex space-x-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleTestCaseResult(testCase, 'pass')}
                                    className="flex items-center space-x-1 bg-green-50 hover:bg-green-100 text-green-700 border-green-200 hover:border-green-300"
                                  >
                                    <CheckCircleIcon className="w-4 h-4" />
                                    <span>Pass</span>
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleTestCaseResult(testCase, 'fail')}
                                    className="flex items-center space-x-1 bg-red-50 hover:bg-red-100 text-red-700 border-red-200 hover:border-red-300"
                                  >
                                    <X className="w-4 h-4" />
                                    <span>Fail</span>
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      {filteredReleases.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Rocket className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No releases found</h3>
            <p className="text-gray-500 mb-4">
              {searchQuery || selectedProject !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Create your first release to get started'}
            </p>
            <Button onClick={() => setIsModalOpen(true)} icon={Plus}>
              Create Release
            </Button>
          </CardContent>
        </Card>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Release"
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Release Name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              required
            />
            <Input
              label="Version"
              value={formData.version}
              onChange={(e) => handleInputChange('version', e.target.value)}
              placeholder="e.g., 1.0.0"
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
          
          <div className="grid grid-cols-2 gap-4">
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
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="planned">Planned</option>
                <option value="in-progress">In Progress</option>
                <option value="testing">Testing</option>
                <option value="released">Released</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
          
          <Input
            label="Release Date"
            type="date"
            value={formData.releaseDate}
            onChange={(e) => handleInputChange('releaseDate', e.target.value)}
          />

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Create Release</Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isDefectModalOpen}
        onClose={() => {
          setIsDefectModalOpen(false);
          setSelectedTestCase(null);
        }}
        title="Create Defect from Failed Test Case"
      >
        <form onSubmit={handleDefectSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Defect Title
            </label>
            <input
              type="text"
              value={defectFormData.title}
              onChange={(e) => setDefectFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={defectFormData.description}
              onChange={(e) => setDefectFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Severity
              </label>
              <select
                value={defectFormData.severity}
                onChange={(e) => setDefectFormData(prev => ({ ...prev, severity: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                value={defectFormData.priority}
                onChange={(e) => setDefectFormData(prev => ({ ...prev, priority: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsDefectModalOpen(false);
                setSelectedTestCase(null);
              }}
            >
              Cancel
            </Button>
            <Button type="submit">
              Create Defect
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};