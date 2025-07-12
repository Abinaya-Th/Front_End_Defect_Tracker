import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ChevronLeft, Users, Calendar, User, Clock, ArrowRight, ChevronDown, ChevronUp, Search, Filter, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getAllProjects } from '../api/projectget';
import { Project } from '../types';

interface ProjectAllocationHistory {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  designation: string;
  action: 'allocated' | 'deallocated' | 'percentage_changed' | 'role_changed' | 'period_changed';
  fromPercentage: number;
  toPercentage: number;
  fromRole: string;
  toRole: string;
  fromStartDate: string;
  toStartDate: string;
  fromEndDate: string;
  toEndDate: string;
  date: string;
  reason: string;
  allocatedBy: string;
}

interface UserProjectAllocation {
  userId: string;
  userName: string;
  userEmail: string;
  designation: string;
  currentPercentage: number;
  currentRole: string;
  currentStartDate: string;
  currentEndDate: string;
  status: 'active' | 'deallocated' | 'partially_allocated';
  totalAllocations: number;
  lastModified: string;
}

const ProjectAllocationHistory: React.FC = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const { employees, selectedProjectId: contextProjectId, setSelectedProjectId: setContextProjectId } = useApp();
  
  // State for projects from API (same pattern as BenchAllocate)
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [projectsError, setProjectsError] = useState<string | null>(null);
  
  // Always call useState - don't use conditional logic
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(contextProjectId || null);
  
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [allocationHistory, setAllocationHistory] = useState<ProjectAllocationHistory[]>([]);
  const [userAllocations, setUserAllocations] = useState<UserProjectAllocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const scrollRef = React.useRef<HTMLDivElement>(null);

  // Update selectedProjectId when contextProjectId changes
  useEffect(() => {
    if (contextProjectId && contextProjectId !== selectedProjectId) {
      setSelectedProjectId(contextProjectId);
    }
  }, [contextProjectId, selectedProjectId]);

  // Fetch projects from API (same pattern as BenchAllocate)
  useEffect(() => {
    setProjectsLoading(true);
    getAllProjects()
      .then((data: any) => {
        let projectsArray = Array.isArray(data)
          ? data
          : (data && Array.isArray(data.data))
            ? data.data
            : [];
        setProjects(projectsArray);
        setProjectsError(null);
        
        // Set selected project if none is selected
        if (!selectedProjectId && projectsArray.length > 0) {
          const firstActiveProject = projectsArray.find((p: Project) => p.status === 'active');
          if (firstActiveProject) {
            setSelectedProjectId(firstActiveProject.id);
          }
        }
      })
      .catch((err) => {
        console.error("Failed to fetch projects:", err);
        setProjectsError(err.message);
      })
      .finally(() => setProjectsLoading(false));
  }, []);

  // Only show active projects
  const availableProjects = useMemo(() => projects.filter(p => p.status === 'active'), [projects]);
  const currentProject = useMemo(
    () => projects.find(p => String(p.id) === String(selectedProjectId)),
    [selectedProjectId, projects]
  );

  const scrollBy = (offset: number) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  // Mock data - replace with actual API calls
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const mockUserAllocations: UserProjectAllocation[] = [
        {
          userId: 'user1',
          userName: 'John Doe',
          userEmail: 'john.doe@example.com',
          designation: 'Senior Developer',
          currentPercentage: 80,
          currentRole: 'Developer',
          currentStartDate: '2024-01-15',
          currentEndDate: '2024-06-30',
          status: 'active',
          totalAllocations: 3,
          lastModified: '2024-01-20'
        },
        {
          userId: 'user2',
          userName: 'Jane Smith',
          userEmail: 'jane.smith@example.com',
          designation: 'UI/UX Designer',
          currentPercentage: 100,
          currentRole: 'Designer',
          currentStartDate: '2024-01-10',
          currentEndDate: '2024-05-15',
          status: 'active',
          totalAllocations: 1,
          lastModified: '2024-01-10'
        },
        {
          userId: 'user3',
          userName: 'Mike Johnson',
          userEmail: 'mike.johnson@example.com',
          designation: 'QA Engineer',
          currentPercentage: 60,
          currentRole: 'QA Engineer',
          currentStartDate: '2024-01-20',
          currentEndDate: '2024-07-31',
          status: 'partially_allocated',
          totalAllocations: 2,
          lastModified: '2024-01-25'
        },
        {
          userId: 'user4',
          userName: 'Sarah Wilson',
          userEmail: 'sarah.wilson@example.com',
          designation: 'Developer',
          currentPercentage: 0,
          currentRole: 'Developer',
          currentStartDate: '',
          currentEndDate: '',
          status: 'deallocated',
          totalAllocations: 1,
          lastModified: '2024-01-30'
        }
      ];

      const mockHistory: ProjectAllocationHistory[] = [
        {
          id: '1',
          userId: 'user1',
          userName: 'John Doe',
          userEmail: 'john.doe@example.com',
          designation: 'Senior Developer',
          action: 'percentage_changed',
          fromPercentage: 100,
          toPercentage: 80,
          fromRole: 'Developer',
          toRole: 'Developer',
          fromStartDate: '2024-01-15',
          toStartDate: '2024-01-15',
          fromEndDate: '2024-06-30',
          toEndDate: '2024-06-30',
          date: '2024-01-20',
          reason: 'Reduced allocation due to other project commitments',
          allocatedBy: 'Project Manager'
        },
        {
          id: '2',
          userId: 'user2',
          userName: 'Jane Smith',
          userEmail: 'jane.smith@example.com',
          designation: 'UI/UX Designer',
          action: 'allocated',
          fromPercentage: 0,
          toPercentage: 100,
          fromRole: '',
          toRole: 'Designer',
          fromStartDate: '',
          toStartDate: '2024-01-10',
          fromEndDate: '',
          toEndDate: '2024-05-15',
          date: '2024-01-10',
          reason: 'Initial project allocation for UI/UX design work',
          allocatedBy: 'Team Lead'
        },
        {
          id: '3',
          userId: 'user1',
          userName: 'John Doe',
          userEmail: 'john.doe@example.com',
          designation: 'Senior Developer',
          action: 'allocated',
          fromPercentage: 0,
          toPercentage: 100,
          fromRole: '',
          toRole: 'Developer',
          fromStartDate: '',
          toStartDate: '2024-01-15',
          fromEndDate: '',
          toEndDate: '2024-06-30',
          date: '2024-01-15',
          reason: 'Initial project allocation',
          allocatedBy: 'Project Manager'
        },
        {
          id: '4',
          userId: 'user3',
          userName: 'Mike Johnson',
          userEmail: 'mike.johnson@example.com',
          designation: 'QA Engineer',
          action: 'allocated',
          fromPercentage: 0,
          toPercentage: 60,
          fromRole: '',
          toRole: 'QA Engineer',
          fromStartDate: '',
          toStartDate: '2024-01-20',
          fromEndDate: '',
          toEndDate: '2024-07-31',
          date: '2024-01-20',
          reason: 'QA testing phase started - partial allocation',
          allocatedBy: 'QA Lead'
        },
        {
          id: '5',
          userId: 'user4',
          userName: 'Sarah Wilson',
          userEmail: 'sarah.wilson@example.com',
          designation: 'Developer',
          action: 'deallocated',
          fromPercentage: 100,
          toPercentage: 0,
          fromRole: 'Developer',
          toRole: '',
          fromStartDate: '2024-01-05',
          toStartDate: '',
          fromEndDate: '2024-01-30',
          toEndDate: '',
          date: '2024-01-30',
          reason: 'Project completion - moved back to bench',
          allocatedBy: 'Project Manager'
        },
        {
          id: '6',
          userId: 'user4',
          userName: 'Sarah Wilson',
          userEmail: 'sarah.wilson@example.com',
          designation: 'Developer',
          action: 'allocated',
          fromPercentage: 0,
          toPercentage: 100,
          fromRole: '',
          toRole: 'Developer',
          fromStartDate: '',
          toStartDate: '2024-01-05',
          fromEndDate: '',
          toEndDate: '2024-01-30',
          date: '2024-01-05',
          reason: 'Initial project allocation',
          allocatedBy: 'Project Manager'
        }
      ];

      setUserAllocations(mockUserAllocations);
      setAllocationHistory(mockHistory);
      setLoading(false);
    }, 1000);
  }, [selectedProjectId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'partially_allocated':
        return 'bg-yellow-100 text-yellow-800';
      case 'deallocated':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'allocated':
        return 'bg-green-100 text-green-800';
      case 'deallocated':
        return 'bg-red-100 text-red-800';
      case 'percentage_changed':
        return 'bg-blue-100 text-blue-800';
      case 'role_changed':
        return 'bg-purple-100 text-purple-800';
      case 'period_changed':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredUsers = userAllocations.filter(user => {
    const matchesSearch = user.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.designation.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getUserHistory = (userId: string) => {
    return allocationHistory.filter(item => item.userId === userId);
  };

  // Project selection handler (same pattern as BenchAllocate)
  const handleProjectSelect = (id: string) => {
    setSelectedProjectId(id);
    setContextProjectId?.(id); // If provided by context
    setExpandedUser(null);
    // TODO: In real app, fetch new project allocation data here based on selectedProjectId
    // This would involve calling an API to get allocation history for the specific project
  };

  if (loading || projectsLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (projectsError) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-500 mb-4">Failed to load projects: {projectsError}</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header with Back Button */}
      <div className="mb-6">
        <Button
          variant="secondary"
          onClick={() => navigate(`/projects/${projectId}/project-management`)}
          className="flex items-center mb-4"
        >
          <ChevronLeft className="w-5 h-5 mr-2" /> Back to Project Management
        </Button>
        <div className="flex items-center gap-3">
          <Users className="w-8 h-8 text-blue-500" />
          <h1 className="text-3xl font-bold text-gray-900">Project Allocation History</h1>
        </div>
        <p className="text-gray-600 mt-2">Track project-level user allocations and movements</p>
      </div>

      {/* Project Selection Panel - Same as BenchAllocate */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Project Selection</h2>
          <div className="relative flex items-center">
            <button
              onClick={() => {
                const container = document.getElementById('project-scroll');
                if (container) container.scrollLeft -= 200;
              }}
              className="flex-shrink-0 z-10 bg-white shadow-md rounded-full p-1 hover:bg-gray-50 mr-2"
              type="button"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div
              id="project-scroll"
              className="flex space-x-2 overflow-x-auto pb-2 scroll-smooth flex-1"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', maxWidth: '100%' }}
            >
              {projects.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  No projects available
                </div>
              ) : (
                projects.map((project) => {
                  const isSelected = Number(selectedProjectId) === (Number(project?.id));
                  return (
                    <Button
                      key={project.id}
                      variant={isSelected ? 'primary' : 'secondary'}
                      onClick={() => handleProjectSelect(project?.id)}
                      className="whitespace-nowrap m-2"
                    >
                      {project?.projectName || project?.name}
                    </Button>
                  );
                })
              )}
            </div>
            <button
              onClick={() => {
                const container = document.getElementById('project-scroll');
                if (container) container.scrollLeft += 200;
              }}
              className="flex-shrink-0 z-10 bg-white shadow-md rounded-full p-1 hover:bg-gray-50 ml-2"
              type="button"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Search and Filter Controls */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search users by name, email, or designation..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="partially_allocated">Partially Allocated</option>
                <option value="deallocated">Deallocated</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Allocation Table */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Project Allocation History
            {selectedProjectId && (
              <span className="text-sm font-normal text-gray-600">
                - {currentProject?.projectName || currentProject?.name}
              </span>
            )}
          </h3>
        </CardHeader>
        <CardContent>
          {filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No users found matching the selected criteria.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredUsers.map((user) => {
                const userHistory = getUserHistory(user.userId);
                const isExpanded = expandedUser === user.userId;
                
                return (
                  <Card key={user.userId} className="border border-gray-200">
                    <CardContent className="p-0">
                      {/* User Row */}
                      <div 
                        className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => setExpandedUser(isExpanded ? null : user.userId)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              {isExpanded ? (
                                <ChevronUp className="w-4 h-4 text-gray-400" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-gray-400" />
                              )}
                              <User className="w-5 h-5 text-blue-500" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">{user.userName}</h4>
                              <p className="text-sm text-gray-600">{user.userEmail}</p>
                              <p className="text-xs text-gray-500">{user.designation}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-sm font-medium text-gray-900">{user.currentRole}</p>
                              <p className="text-xs text-gray-600">{user.currentPercentage}% allocated</p>
                              <p className="text-xs text-gray-500">
                                {user.currentStartDate && user.currentEndDate 
                                  ? `${user.currentStartDate} to ${user.currentEndDate}`
                                  : 'No period set'
                                }
                              </p>
                            </div>
                            <Badge className={getStatusColor(user.status)}>
                              {user.status.replace('_', ' ')}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {/* Expanded History */}
                      {isExpanded && (
                        <div className="border-t border-gray-200 bg-gray-50">
                          <div className="p-4">
                            <h5 className="font-semibold text-gray-900 mb-3">Allocation History</h5>
                            {userHistory.length === 0 ? (
                              <p className="text-gray-500 text-sm">No allocation history available.</p>
                            ) : (
                              <div className="space-y-3">
                                {userHistory.map((history) => (
                                  <div key={history.id} className="bg-white p-3 rounded-lg border">
                                    <div className="flex items-center justify-between mb-2">
                                      <div className="flex items-center gap-2">
                                        <Badge className={getActionColor(history.action)}>
                                          {history.action.replace('_', ' ')}
                                        </Badge>
                                        <span className="text-sm text-gray-600">
                                          {new Date(history.date).toLocaleDateString()}
                                        </span>
                                      </div>
                                      <span className="text-sm font-medium">{history.allocatedBy}</span>
                                    </div>
                                    
                                    {/* Allocation Details */}
                                    <div className="space-y-2">
                                      {history.action === 'allocated' && (
                                        <div className="text-sm">
                                          <p><span className="font-medium">Allocated:</span> {history.toPercentage}% as {history.toRole}</p>
                                          <p><span className="font-medium">Period:</span> {history.toStartDate} to {history.toEndDate}</p>
                                        </div>
                                      )}
                                      
                                      {history.action === 'deallocated' && (
                                        <div className="text-sm">
                                          <p><span className="font-medium">Deallocated:</span> {history.fromPercentage}% from {history.fromRole}</p>
                                          <p><span className="font-medium">Previous Period:</span> {history.fromStartDate} to {history.fromEndDate}</p>
                                        </div>
                                      )}
                                      
                                      {history.action === 'percentage_changed' && (
                                        <div className="text-sm">
                                          <p><span className="font-medium">Percentage:</span> {history.fromPercentage}% → {history.toPercentage}%</p>
                                          <p><span className="font-medium">Role:</span> {history.fromRole}</p>
                                          <p><span className="font-medium">Period:</span> {history.toStartDate} to {history.toEndDate}</p>
                                        </div>
                                      )}
                                      
                                      {history.action === 'role_changed' && (
                                        <div className="text-sm">
                                          <p><span className="font-medium">Role:</span> {history.fromRole} → {history.toRole}</p>
                                          <p><span className="font-medium">Percentage:</span> {history.toPercentage}%</p>
                                          <p><span className="font-medium">Period:</span> {history.toStartDate} to {history.toEndDate}</p>
                                        </div>
                                      )}
                                      
                                      {history.action === 'period_changed' && (
                                        <div className="text-sm">
                                          <p><span className="font-medium">Period:</span> {history.fromStartDate} to {history.fromEndDate} → {history.toStartDate} to {history.toEndDate}</p>
                                          <p><span className="font-medium">Role:</span> {history.toRole}</p>
                                          <p><span className="font-medium">Percentage:</span> {history.toPercentage}%</p>
                                        </div>
                                      )}
                                    </div>
                                    
                                    <p className="text-sm text-gray-700 mt-2">{history.reason}</p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Statistics */}
      <Card className="mt-6">
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Allocation Summary
          </h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {userAllocations.filter(u => u.status === 'active').length}
              </div>
              <div className="text-sm text-green-600">Active Users</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {userAllocations.filter(u => u.status === 'partially_allocated').length}
              </div>
              <div className="text-sm text-yellow-600">Partially Allocated</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {userAllocations.filter(u => u.status === 'deallocated').length}
              </div>
              <div className="text-sm text-red-600">Deallocated</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {allocationHistory.length}
              </div>
              <div className="text-sm text-blue-600">Total Changes</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectAllocationHistory; 