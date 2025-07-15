import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { AlertTriangle, CheckCircle, Clock } from 'lucide-react';

const getSeverityOrder = (severity: string) => {
  switch (severity) {
    case 'high':
    case 'critical':
      return 0;
    case 'medium':
      return 1;
    case 'low':
      return 2;
    default:
      return 3;
  }
};

const getStatusIcon = (severity: string) => {
  switch (severity) {
    case 'high':
    case 'critical':
      return <AlertTriangle className="w-7 h-7 text-white bg-red-500 rounded-full p-1.5 shadow absolute -top-3 -right-3" />;
    case 'medium':
      return <Clock className="w-7 h-7 text-white bg-yellow-400 rounded-full p-1.5 shadow absolute -top-3 -right-3" />;
    case 'low':
      return <CheckCircle className="w-7 h-7 text-white bg-green-500 rounded-full p-1.5 shadow absolute -top-3 -right-3" />;
    default:
      return null;
  }
};

const getProjectSeverity = (defects: any[]) => {
  if (!defects.length) return 'low';
  if (defects.some(d => d.severity === 'high' || d.severity === 'critical')) return 'high';
  if (defects.some(d => d.severity === 'medium')) return 'medium';
  return 'low';
};

const getSeverityCount = (defects: any[], severity: string) =>
  defects.filter(d => d.severity === severity || (severity === 'high' && d.severity === 'critical')).length;

const getUpdatedTime = (projectId: string) => {
  const mockTimes: Record<string, string> = {
    'PR0001': 'Updated 2 hours ago',
    'PR0002': 'Updated 4 hours ago',
    'PR0003': 'Updated 2 hours ago',
    'PR0004': 'Updated 5 hours ago',
    'PR0005': 'Updated 4 hours ago',
  };
  return mockTimes[projectId] || 'Updated recently';
};

const getSeverityLabel = (severity: string) => {
  switch (severity) {
    case 'high':
    case 'critical':
      return 'RED';
    case 'medium':
      return 'YELLOW';
    case 'low':
      return 'GREEN';
    default:
      return '';
  }
};

const getSeverityLabelColor = (severity: string) => {
  switch (severity) {
    case 'high':
    case 'critical':
      return 'text-red-500';
    case 'medium':
      return 'text-yellow-500';
    case 'low':
      return 'text-green-500';
    default:
      return '';
  }
};

const getSeverityBorder = (severity: string) => {
  switch (severity) {
    case 'high':
    case 'critical':
      return 'border-red-500';
    case 'medium':
      return 'border-yellow-400';
    case 'low':
      return 'border-green-500';
    default:
      return 'border-gray-200';
  }
};

const getProjectCardGradient = (severity: string) => {
  switch (severity) {
    case 'high':
    case 'critical':
      return 'bg-gradient-to-br from-white to-red-50';
    case 'medium':
      return 'bg-gradient-to-br from-white to-yellow-50';
    case 'low':
      return 'bg-gradient-to-br from-white to-green-50';
    default:
      return 'bg-gradient-to-br from-white to-gray-50';
  }
};

export const Dashboard = () => {
  const { projects, defects } = useApp();

  // Main summary cards data
  const totalProjects = projects.length;
  const highSeverity = getSeverityCount(defects, 'high');
  const mediumSeverity = getSeverityCount(defects, 'medium');
  const lowSeverity = getSeverityCount(defects, 'low');

  // Prepare sorted projects by severity
  const projectsWithSeverity = projects.map(project => {
    const projectDefects = defects.filter(d => d.projectId === project.id && (d.status === 'open' || d.status === 'in-progress'));
    const severity = getProjectSeverity(projectDefects);
    return { ...project, severity };
  });
  const sortedProjects = projectsWithSeverity.sort((a, b) => getSeverityOrder(a.severity) - getSeverityOrder(b.severity));

  // Separate projects by severity for the new layout
  const highSeverityProjects = projectsWithSeverity.filter(p => p.severity === 'high' || p.severity === 'critical');
  const mediumSeverityProjects = projectsWithSeverity.filter(p => p.severity === 'medium');
  const lowSeverityProjects = projectsWithSeverity.filter(p => p.severity === 'low');

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center px-0 pt-8">
      {/* Top summary cards in a single horizontal row */}
      <div className="w-full flex flex-row justify-center gap-8 mb-12">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl shadow-lg p-8 flex flex-col items-center min-w-[220px] border border-gray-300 border-[1px] transition-transform duration-200 hover:scale-105 hover:shadow-2xl">
          <span className="text-lg font-semibold text-gray-800 mb-2">Total Projects</span>
          <span className="text-4xl font-extrabold text-blue-600 drop-shadow">{projects.length}</span>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-white rounded-2xl shadow-lg p-8 flex flex-col items-center min-w-[220px] border border-gray-300 border-[1px] transition-transform duration-200 hover:scale-105 hover:shadow-2xl">
          <span className="text-lg font-semibold text-gray-800 mb-2">High Severity</span>
          <span className="text-4xl font-extrabold text-red-500 drop-shadow">{highSeverityProjects.length}</span>
        </div>
        <div className="bg-gradient-to-br from-yellow-50 to-white rounded-2xl shadow-lg p-8 flex flex-col items-center min-w-[220px] border border-gray-300 border-[1px] transition-transform duration-200 hover:scale-105 hover:shadow-2xl">
          <span className="text-lg font-semibold text-gray-800 mb-2">Medium Severity</span>
          <span className="text-4xl font-extrabold text-yellow-500 drop-shadow">{mediumSeverityProjects.length}</span>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-white rounded-2xl shadow-lg p-8 flex flex-col items-center min-w-[220px] border border-gray-300 border-[1px] transition-transform duration-200 hover:scale-105 hover:shadow-2xl">
          <span className="text-lg font-semibold text-gray-800 mb-2">Low Severity</span>
          <span className="text-4xl font-extrabold text-green-500 drop-shadow">{lowSeverityProjects.length}</span>
        </div>
      </div>
      {/* Project Overview */}
      <div className="w-full max-w-7xl bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl p-10">
        <div className="text-2xl font-bold text-gray-900 mb-10">Project Overview</div>
        <div className="flex flex-row flex-wrap justify-start gap-12">
          {sortedProjects.map(project => {
            const navigate = useNavigate();
            return (
              <div key={project.id} className="flex flex-col items-center cursor-pointer group" onClick={() => navigate(`/projects/${project.id}`)}>
                {/* Card with colored border, gradient background, and icon in the corner */}
                <div className={`relative w-56 h-56 rounded-full border-8 shadow-xl flex items-center justify-center ${getSeverityBorder(project.severity)} ${getProjectCardGradient(project.severity)} transition-transform duration-200 group-hover:scale-105 group-hover:shadow-2xl`}>
                  <span className="text-2xl font-bold text-gray-900 text-center break-words w-40 mx-auto flex items-center justify-center h-full tracking-tight">{project.name}</span>
                  {/* Severity Icon in the top right corner, perfectly beside the border */}
                  <span className="absolute" style={{ top: '10px', right: '10px', transform: 'translate(50%,-50%)' }}>{getStatusIcon(project.severity)}</span>
                </div>
                {/* Updated Time below the card */}
                <span className="text-sm text-gray-500 mt-4 font-medium">{getUpdatedTime(project.id)}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};