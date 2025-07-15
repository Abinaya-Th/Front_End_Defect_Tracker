import React from 'react';
import { AlertTriangle, CheckCircle, Clock, Bug, AlertCircle } from 'lucide-react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface ProjectCardProps {
  project: {
    id: string;
    name: string;
    status: 'green' | 'yellow' | 'red';
    totalDefects: number;
    openDefects: number;
    criticalDefects: number;
    lastUpdated: string;
  };
  onClick: (projectId: string) => void;
  outlineClass?: string;
  bgClass?: string;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onClick, outlineClass, bgClass }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'green':
        return {
          bg: 'bg-green-50',
          border: 'border-green-500',
          text: 'text-green-600',
          icon: CheckCircle
        };
      case 'yellow':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-500',
          text: 'text-yellow-600',
          icon: Clock
        };
      case 'red':
        return {
          bg: 'bg-red-50',
          border: 'border-red-500',
          text: 'text-red-600',
          icon: AlertTriangle
        };
      default:
        return {
          bg: 'bg-gray-100',
          border: 'border-gray-500',
          text: 'text-gray-600',
          icon: Clock
        };
    }
  };

  const statusConfig = getStatusColor(project.status);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Circular Card */}
      <div
        className={`
          relative w-56 h-56 rounded-full 
          ${bgClass || statusConfig.bg} 
          border-4 ${outlineClass || statusConfig.border}
          shadow-lg cursor-pointer transition-all duration-300
          hover:scale-105 hover:shadow-xl
          flex flex-col items-center justify-center
        `}
        onClick={() => onClick(project.id)}
      >
        {/* Status Icon */}
        <div className="absolute -top-2 -right-2 flex flex-col items-center">
          {/* Animated pulsing red ring for red status */}
          {project.status === 'red' && (
            <span className="relative flex h-8 w-8 items-center justify-center">
              <span className="absolute inline-flex h-10 w-10 rounded-full border-4 border-red-400 opacity-60 animate-ping"></span>
              <span className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center relative z-10">
                <AlertTriangle className="w-4 h-4 text-white" />
              </span>
            </span>
          )}
          {/* Small clock icon for yellow status */}
          {project.status === 'yellow' && (
            <span className="relative flex h-8 w-8 mb-1">
              <span className="relative inline-flex rounded-full h-8 w-8 bg-yellow-400/80 flex items-center justify-center">
                <Clock className="w-4 h-4 text-yellow-700" />
              </span>
            </span>
          )}
          {project.status !== 'red' && (
            <div className={`w-8 h-8 rounded-full ${outlineClass ? outlineClass.replace('border-', 'bg-') : statusConfig.border.replace('border-', 'bg-')} flex items-center justify-center`}>
              <StatusIcon className="w-4 h-4 text-white" />
            </div>
          )}
        </div>

        {/* Content Layout */}
        <div className="text-center space-y-2">
          {/* Project Name */}
          <h3 className="text-xl font-extrabold text-gray-900 px-2 leading-tight mb-2 drop-shadow-sm" style={{letterSpacing: '0.5px'}}>
            {project.name}
          </h3>
          
          {/* Total Defects - Main Number */}
          <div className="text-3xl font-bold text-gray-900">
            {project.totalDefects > 9 ? '9+' : project.totalDefects}
          </div>
          
          {/* Label */}
          <div className="text-xs text-gray-500 font-medium">
            TOTAL DEFECTS
          </div>
          
          {/* Bottom Metrics */}
          <div className="flex justify-center space-x-4 text-xs">
            <div className="flex items-center space-x-1">
              <Bug className="w-3 h-3 text-blue-500" />
              <span className="font-medium">{project.openDefects}</span>
            </div>
            <div className="flex items-center space-x-1">
              <AlertCircle className="w-3 h-3 text-red-500" />
              <span className="font-medium">{project.criticalDefects}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Project Info Below Circle */}
      <div className="text-center space-y-1">
        <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusConfig.text} bg-gray-50`}>
          {project.status.toUpperCase()}
        </div>
        <div className="text-xs text-gray-500">
          Updated {project.lastUpdated}
        </div>
      </div>

      {/* Removed Time to Find Defect and Time to Fix Defect bar charts for a cleaner card as requested. */}
    </div>
  );
}; 