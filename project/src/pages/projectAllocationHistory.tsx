import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ChevronLeft, Users, Calendar, User, Clock, ArrowRight, ChevronDown, ChevronUp, Search, Filter, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getAllProjects } from '../api/projectget';
import { Project } from '../types';
import { getProjectAllocationHistory } from '../api/projectAllocationHistory/projectAllocationHistory';

interface AllocationRecord {
  id: number;
  percentage: number;
  userFullName: string;
  email: string;
  projectName: string;
  roleName: string;
  startDate: string;
  endDate: string;
  projectId: number;
  userId: number;
  roleId: number;
  status: boolean;
  allocationPercentage: number;
  firstName: string;
  lastName: string;
}

interface ProjectAllocationHistory {
  userId: number;
  allocations: AllocationRecord[];
  deallocations: AllocationRecord[];
}



const ProjectAllocationHistory: React.FC = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const { selectedProjectId: contextProjectId, setSelectedProjectId: setContextProjectId } = useApp();

  // State for projects from API (same pattern as BenchAllocate)
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [projectsError, setProjectsError] = useState<string | null>(null);

  // Always call useState - don't use conditional logic
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(contextProjectId || null);

  const [expandedUser, setExpandedUser] = useState<number | null>(null);
  const [allocationHistory, setAllocationHistory] = useState<ProjectAllocationHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const scrollRef = React.useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (selectedProjectId) {
      setLoading(true);
      getProjectAllocationHistory(Number(selectedProjectId))
        .then((response: any) => {
          // Expecting response.data to be an array of allocation history objects
          setAllocationHistory(Array.isArray(response.data) ? response.data : []);

        })
        .catch((error) => {
          console.log("Failed to fetch project allocation history:", error);
          setAllocationHistory([]);
        })
        .finally(() => setLoading(false));
    }
  }, [selectedProjectId]);
  console.log("Allocation History:", allocationHistory);
  

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

  const getStatusColor = (status: boolean) => {
    if (status === true) {
      return 'bg-green-100 text-green-800';
    }
    if (status === false) {
      return 'bg-red-100 text-red-800';
    }
    return 'bg-gray-100 text-gray-800';
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



  // Removed unused getUserHistory

  // Project selection handler (same pattern as BenchAllocate)
  const handleProjectSelect = (id: string) => {
    setSelectedProjectId(id);
    setContextProjectId?.(id); // If provided by context
    setExpandedUser(null);
    // TODO: In real app, fetch new project allocation data here based on selectedProjectId

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
          {Array.isArray(allocationHistory) && allocationHistory.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No users found matching the selected criteria.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {Array.isArray(allocationHistory) && allocationHistory.map((user, userIdx) => {
                const isExpanded = expandedUser === user.userId;
                return (
                  <Card key={user.userId + '-' + userIdx} className="border border-gray-200">
                    <CardContent className="p-0">
                      {/* User Row: show latest allocation */}
                      {user && Array.isArray(user.allocations) && user.allocations.length > 0 && (
                        <div 
                          key={user.userId + '-' + user.allocations[0].id}
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
                                <h4 className="font-semibold text-gray-900">{user.allocations[0].firstName} {user.allocations[0].lastName}</h4>
                                <p className="text-sm text-gray-600">{user.allocations[0].email}</p>
                                <p className="text-xs text-gray-500">{user.allocations[0].roleName}</p>
                              </div>
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <p className="text-sm font-medium text-gray-900">{user.allocations[0].roleName}</p>
                                <p className="text-xs text-gray-600">{user.allocations[0].percentage}% allocated</p>
                                <p className="text-xs text-gray-500">
                                  {user.allocations[0].startDate && user.allocations[0].endDate
                                    ? `${new Date(user.allocations[0].startDate).toLocaleDateString()} to ${new Date(user.allocations[0].endDate).toLocaleDateString()}`
                                    : 'No period set'
                                  }
                                </p>
                              </div>
                              <Badge className={getStatusColor(user.allocations[0].status)}>
                                {user.allocations[0].status === true
                                  ? 'Allocated'
                                  : user.allocations[0].status === false
                                    ? 'Deallocated'
                                    : ''}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Expanded History: allocations and deallocations sorted by startDate */}
                      {isExpanded && (
                        <div className="border-t border-gray-200 bg-gray-50">
                          <div className="p-4">
                            <h5 className="font-semibold text-gray-900 mb-3">Allocation History</h5>
                            {((user.allocations && user.allocations.length > 0) || (user.deallocations && user.deallocations.length > 0)) ? (
                              <div className="space-y-3">
                                {[...(user.allocations || []), ...(user.deallocations || [])]
                                  .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
                                  .map((record, idx) => (
                                    <div key={user.userId + '-' + record.id + '-' + idx} className="bg-white p-3 rounded-lg border">
                                      <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                          <Badge className={getStatusColor(record.status)}>
                                            {record.status === true ? 'Allocated' : record.status === false ? 'Deallocated' : ''}
                                          </Badge>
                                          <span className="text-sm text-gray-600">
                                            {record.startDate ? new Date(record.startDate).toLocaleDateString() : ''}
                                          </span>
                                        </div>
                                        <span className="text-sm font-medium">{record.roleName || ''}</span>
                                      </div>
                                      <div className="space-y-2">
                                        <div className="text-sm">
                                          <p><span className="font-medium">User:</span> {record.firstName} {record.lastName}</p>
                                          <p><span className="font-medium">Email:</span> {record.email}</p>
                                          <p><span className="font-medium">Role:</span> {record.roleName}</p>
                                          <p><span className="font-medium">Percentage:</span> {record.percentage}%</p>
                                          <p><span className="font-medium">Period:</span> {record.startDate ? new Date(record.startDate).toLocaleDateString() : ''} to {record.endDate ? new Date(record.endDate).toLocaleDateString() : ''}</p>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                              </div>
                            ) : (
                              <p className="text-gray-500 text-sm">No allocation history available.</p>
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

      {/* Summary Statistics panel removed as requested */}
    </div>
  );
};

export default ProjectAllocationHistory;