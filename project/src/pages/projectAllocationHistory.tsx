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

interface ProjectAllocationHistory {
  allocations: any;
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
 
  const fetchProjectAllocations = async (projectId: string) => {
   try {
     const response = await getProjectAllocationHistory(Number(projectId));

     setAllocationHistory(response.data);
   } catch (error) {
    console.log("Failed to fetch project allocation history:", error);
   }
  }
  useEffect(() => {
    if (selectedProjectId) {
      setLoading(true);
      getProjectAllocationHistory(Number(selectedProjectId))
        .then((response: any) => {
          // Expecting response.data to be an array of allocation history objects
          setAllocationHistory(Array.isArray(response.data) ? response.data : []);
          // If the API also returns user allocations, set them here
          if (Array.isArray(response.userAllocations)) {
            setUserAllocations(response.userAllocations);
          } else {
            setUserAllocations([]);
          }
        })
        .catch((error) => {
          console.log("Failed to fetch project allocation history:", error);
          setAllocationHistory([]);
          setUserAllocations([]);
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

  const getStatusColor = (status: string) => {
    // Only show allocated (green) or deallocated (red)
    if (status === true || status === 'allocated') {
      return 'bg-green-100 text-green-800';
    }
    if (status === false || status === 'deallocated') {
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
                const userHistory = getUserHistory(user.userId);
                const isExpanded = expandedUser === user.userId;
                
                return (
                  <Card key={user.userId + '-' + userIdx} className="border border-gray-200">
                    <CardContent className="p-0">
                      {/* User Row */}
                      {user && Array.isArray(user.allocations) && user.allocations.map((allocation:any, allocIdx:number) => (
                      <div 
                        key={user.userId + '-' + allocation.id + '-' + allocIdx}
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
                              <h4 className="font-semibold text-gray-900">{allocation.firstName}</h4>
                              <p className="text-sm text-gray-600">{allocation.email}</p>
                              <p className="text-xs text-gray-500">{allocation.roleName}</p>
                            </div>
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-sm font-medium text-gray-900">{allocation.roleName}</p>
                              <p className="text-xs text-gray-600">{allocation.percentage}% allocated</p>
                              <p className="text-xs text-gray-500">
                                {allocation.startDate && allocation.endDate
                                  ? `${allocation.startDate} to ${allocation.endDate}`
                                  : 'No period set'
                                }
                              </p>
                            </div>
                            <Badge className={getStatusColor(allocation.status)}>
                              {allocation.status === true || allocation.status === 'allocated'
                                ? 'Allocated'
                                : (allocation.status === false || allocation.status === 'deallocated')
                                  ? 'Deallocated'
                                  : 'Unknown'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      ))}

                      {/* Expanded History */}
                      {isExpanded && (
                        <div className="border-t border-gray-200 bg-gray-50">
                          <div className="p-4">
                            <h5 className="font-semibold text-gray-900 mb-3">Allocation History</h5>
                            {Array.isArray(userHistory) && userHistory.length === 0 ? (
                              <p className="text-gray-500 text-sm">No allocation history available.</p>
                            ) : (
                              <div className="space-y-3">
                                {Array.isArray(userHistory) && userHistory.map((history, histIdx) => (
                                  <div key={user.userId + '-' + history.id + '-' + histIdx} className="bg-white p-3 rounded-lg border">
                                    <div className="flex items-center justify-between mb-2">
                                      <div className="flex items-center gap-2">
                                        <Badge className={getActionColor(history.action)}>
                                          {typeof history.action === 'string' && history.action
                                            ? history.action.replace('_', ' ')
                                            : (history.action !== undefined && history.action !== null ? String(history.action) : 'Unknown')}
                                        </Badge>
                                        <span className="text-sm text-gray-600">
                                          {history.date ? new Date(history.date).toLocaleDateString() : 'Unknown date'}
                                        </span>
                                      </div>
                                      <span className="text-sm font-medium">{history.allocatedBy || 'Unknown'}</span>
                                    </div>
                                    {/* Allocation Details - formatted for clarity */}
                                    <div className="space-y-2">
                                      {history.action === 'percentage_changed' && (
                                        <div className="text-sm">
                                          <p><span className="font-medium">Percentage:</span> {history.fromPercentage}% → {history.toPercentage}%</p>
                                          <p><span className="font-medium">Role:</span> {history.fromRole}</p>
                                          <p><span className="font-medium">Period:</span> {history.toStartDate} to {history.toEndDate}</p>
                                        </div>
                                      )}
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

      {/* Summary Statistics panel removed as requested */}
    </div>
  );
};

export default ProjectAllocationHistory;