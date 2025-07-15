import React, { useState } from 'react';
import { Filter, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ProjectCard } from '../components/ProjectCard';

const ROW_COLORS = [
  { status: 'red', bg: 'bg-red-50', border: 'border-red-500' },    // First row
  { status: 'yellow', bg: 'bg-yellow-50', border: 'border-yellow-500' }, // Second row
  { status: 'green', bg: 'bg-green-50', border: 'border-green-500' },  // Third row
];

const Dashboard1: React.FC = () => {
  const [selectedProject, setSelectedProject] = useState('all');
  const [dateRange, setDateRange] = useState('30d');
  const { projects, defects } = useApp();
  const navigate = useNavigate();

  // Filter projects if a specific one is selected
  const filteredProjects = selectedProject === 'all'
    ? projects
    : projects.filter(p => p.id === selectedProject);

  // Helper to get defect stats for a project
  const getProjectDefectStats = (projectId: string) => {
    const projectDefects = defects.filter(d => d.projectId === projectId);
    const openDefects = projectDefects.filter(d => d.status === 'open').length;
    const criticalDefects = projectDefects.filter(d => d.severity === 'critical').length;
    const totalDefects = projectDefects.length;
    const lastUpdated = projectDefects.length > 0
      ? new Date(Math.max(...projectDefects.map(d => new Date(d.updatedAt).getTime()))).toLocaleDateString()
      : '';
    return { openDefects, criticalDefects, totalDefects, lastUpdated };
  };

  const handleProjectClick = (projectId: string) => {
    navigate(`/projects/${projectId}/metrics`);
  };

  // 4 columns per row
  const columns = 4;

  return (
    <div>
      {/* Header and filters */}
      <div className="flex justify-between items-center py-8 px-8 bg-gray-50">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Overview of your project's health and metrics</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              className="border rounded-md px-2 py-1 text-sm"
              value={selectedProject}
              onChange={e => setSelectedProject(e.target.value)}
            >
              <option value="all">All Projects</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>{project.name}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <select
              className="border rounded-md px-2 py-1 text-sm"
              value={dateRange}
              onChange={e => setDateRange(e.target.value)}
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded shadow">
            Generate Report
          </button>
        </div>
      </div>

      {/* Project Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 px-8 mt-8">
        {filteredProjects.map((project, idx) => {
          const { openDefects, criticalDefects, totalDefects, lastUpdated } = getProjectDefectStats(project.id);
          // Determine row index for color
          const rowIdx = Math.floor(idx / columns);
          const colorConfig = ROW_COLORS[rowIdx % ROW_COLORS.length];
          return (
            <ProjectCard
              key={project.id}
              project={{
                id: project.id,
                name: project.name,
                status: colorConfig.status as 'red' | 'yellow' | 'green',
                totalDefects,
                openDefects,
                criticalDefects,
                lastUpdated: lastUpdated || new Date(project.createdAt).toLocaleDateString(),
              }}
              outlineClass={colorConfig.border}
              bgClass={colorConfig.bg}
              onClick={handleProjectClick}
            />
          );
        })}
      </div>
    </div>
  );
};

export default Dashboard1;
