import React from 'react';
import { TrendingUp, AlertCircle, AlertTriangle, CheckCircle } from 'lucide-react';

interface ProjectCardProps {
  name: string;
  risk: 'high' | 'medium' | 'low';
  defectCounts: { high: number; medium: number; low: number };
  onClick: () => void;
  size?: 'small' | 'large';
}

const riskTheme = {
  high: {
    border: 'border-red-300',
    bg: 'bg-red-50',
    text: 'text-red-700',
    dot: 'bg-red-500',
    badge: 'bg-red-100 text-red-700',
    icon: 'text-red-500',
  },
  medium: {
    border: 'border-yellow-300',
    bg: 'bg-yellow-50',
    text: 'text-yellow-700',
    dot: 'bg-yellow-400',
    badge: 'bg-yellow-100 text-yellow-700',
    icon: 'text-yellow-500',
  },
  low: {
    border: 'border-green-300',
    bg: 'bg-green-50',
    text: 'text-green-700',
    dot: 'bg-green-500',
    badge: 'bg-green-100 text-green-700',
    icon: 'text-green-500',
  },
};

export const ProjectCard: React.FC<ProjectCardProps> = ({ name, risk, defectCounts, onClick, size = 'large' }) => {
  const theme = riskTheme[risk];
  const cardSize = size === 'small' ? 'w-56 h-56' : 'w-72 h-72';
  const iconSize = size === 'small' ? 'w-8 h-8' : 'w-10 h-10';
  const statIconSize = size === 'small' ? 'w-5 h-5' : 'w-6 h-6';
  const nameText = size === 'small' ? 'text-xl' : 'text-2xl';
  const badgeText = size === 'small' ? 'text-xs' : 'text-sm';
  const statText = size === 'small' ? 'text-base' : 'text-lg';
  return (
    <button
      className={`relative ${cardSize} rounded-full border-4 ${theme.border} ${theme.bg} shadow-xl flex flex-col items-center justify-between py-6 px-2 transition-transform hover:scale-105 hover:shadow-2xl focus:outline-none ring-1 ring-gray-200 hover:ring-4 hover:ring-${risk}-200`}
      onClick={onClick}
      aria-label={`Project card for ${name}`}
      style={{ minWidth: size === 'small' ? '14rem' : '18rem', minHeight: size === 'small' ? '14rem' : '18rem' }}
    >
      {/* Status dot */}
      <span className={`absolute top-4 right-4 w-3 h-3 rounded-full ${theme.dot}`}></span>
      {/* Icon */}
      <TrendingUp className={`${iconSize} mb-1 ${theme.icon}`} />
      {/* Project Name */}
      <span className={`${nameText} font-bold mb-1 ${theme.text}`}>{name}</span>
      {/* Risk Badge */}
      <span className={`px-3 py-1 rounded-full font-semibold ${badgeText} ${theme.badge} mb-1`}>{risk === 'high' ? 'High Risk' : risk === 'medium' ? 'Medium Risk' : 'Low Risk'}</span>
      {/* Defect Stats */}
      <div className="flex items-center justify-center gap-5 mt-1">
        <div className="flex flex-col items-center">
          <AlertCircle className={`${statIconSize} text-red-500`} />
          <span className={`${statText} font-bold text-red-700`}>{defectCounts.high}</span>
        </div>
        <div className="flex flex-col items-center">
          <AlertTriangle className={`${statIconSize} text-yellow-500`} />
          <span className={`${statText} font-bold text-yellow-700`}>{defectCounts.medium}</span>
        </div>
        <div className="flex flex-col items-center">
          <CheckCircle className={`${statIconSize} text-green-500`} />
          <span className={`${statText} font-bold text-green-700`}>{defectCounts.low}</span>
        </div>
      </div>
    </button>
  );
};

export default ProjectCard; 