import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import QuickAddTestCase from './QuickAddTestCase';
import QuickAddDefect from './QuickAddDefect';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export const ProjectDashboard: React.FC = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { projects, defects, setSelectedProjectId } = useApp();

  // Project selection handler
  const handleProjectSelect = (id: string) => {
    setSelectedProjectId(id);
    navigate(`/projects/${id}`);
  };

  if (!projectId) {
    return <div className="p-8 text-center text-gray-500">No project selected.</div>;
  }

  const project = projects && projects.find((p) => p.id === projectId);
  const projectDefects = defects.filter((d) => d.projectId === projectId);

  // Get modules for the selected project from mockModules
  const { modulesByProject } = useApp();
  const projectModules = modulesByProject[projectId] || [];

  const [kloc, setKloc] = useState(2);
  const defectCount = projectDefects.length;
  const defectDensity = kloc > 0 ? (defectCount / kloc).toFixed(2) : 0;

  // Modern SVG meter chart for defect density
  function DefectDensityMeter({ value }: { value: number }) {
    // Clamp value for meter (e.g., 0-20)
    const min = 0, max = 20;
    const percent = Math.min(Math.max(value, min), max) / max;
    const angle = percent * 180 - 90; // -90deg (left) to +90deg (right)
    // Gradient for arc
    const gradientId = 'meterGradient';
    // Color stops: green to yellow to red
    // Arc color based on value for pointer
    const pointerColor = value < 7 ? '#22c55e' : value < 14 ? '#eab308' : '#ef4444';
    return (
      <svg width="130" height="90" viewBox="0 0 130 90">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#22c55e" />
            <stop offset="50%" stopColor="#eab308" />
            <stop offset="100%" stopColor="#ef4444" />
          </linearGradient>
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000" floodOpacity="0.10" />
          </filter>
        </defs>
        {/* Background arc */}
        <path d="M20,70 A50,50 0 0,1 110,70" fill="none" stroke="#e5e7eb" strokeWidth="14" filter="url(#shadow)" />
        {/* Foreground arc (gradient) */}
        <path d="M20,70 A50,50 0 0,1 110,70" fill="none" stroke={`url(#${gradientId})`} strokeWidth="14" strokeDasharray="157" strokeDashoffset={157 - percent * 157} filter="url(#shadow)" />
        {/* Center circle */}
        <circle cx="65" cy="70" r="8" fill="#fff" stroke="#d1d5db" strokeWidth="2" />
        {/* Pointer */}
        <line x1="65" y1="70" x2={65 + 48 * Math.cos((angle * Math.PI) / 180)} y2={70 + 48 * Math.sin((angle * Math.PI) / 180)} stroke={pointerColor} strokeWidth="5" strokeLinecap="round" filter="url(#shadow)" />
      </svg>
    );
  }

  // --- Severity Index Calculation Helper ---
  function calculateSeverityIndex(defects: any[]): number {
    if (!defects.length) return 0;
    const weights: Record<string, number> = { low: 1, medium: 2, high: 3, critical: 4 };
    const total = defects.reduce((sum, d) => sum + (weights[d.severity] || 0), 0);
    return Number((total / defects.length).toFixed(2));
  }

  // --- Defect Severity Gauge Component ---
  function DefectSeverityGauge({ value }: { value: number }) {
    // value: 1 (low) to 4 (critical)
    const min = 1, max = 4;
    const percent = (value - min) / (max - min);
    const angle = percent * 180 - 90;
    // Color zones: green (1-2), yellow (2-3), red (3-4)
    let arcColor = '#22c55e';
    if (value >= 3) arcColor = '#ef4444';
    else if (value >= 2) arcColor = '#eab308';
    return (
      <svg width="180" height="100" viewBox="0 0 180 100">
        <defs>
          <linearGradient id="severityIndexGrad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#22c55e" />
            <stop offset="50%" stopColor="#eab308" />
            <stop offset="100%" stopColor="#ef4444" />
          </linearGradient>
          <filter id="severityIndexShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000" floodOpacity="0.10" />
          </filter>
        </defs>
        {/* Background arc */}
        <path d="M30,90 A60,60 0 0,1 150,90" fill="none" stroke="#e5e7eb" strokeWidth="18" filter="url(#severityIndexShadow)" />
        {/* Foreground arc (gradient) */}
        <path d="M30,90 A60,60 0 0,1 150,90" fill="none" stroke="url(#severityIndexGrad)" strokeWidth="18" strokeDasharray="188" strokeDashoffset={188 - percent * 188} filter="url(#severityIndexShadow)" />
        {/* Center circle */}
        <circle cx="90" cy="90" r="12" fill="#fff" stroke="#d1d5db" strokeWidth="3" />
        {/* Pointer */}
        <line x1="90" y1="90" x2={90 + 60 * Math.cos((angle * Math.PI) / 180)} y2={90 + 60 * Math.sin((angle * Math.PI) / 180)} stroke={arcColor} strokeWidth="7" strokeLinecap="round" filter="url(#severityIndexShadow)" />
      </svg>
    );
  }

  // --- Pie Chart Data Helper ---
  function getReopenFrequencyData(defects: any[]) {
    const buckets = [2, 3, 4, 5];
    const freq: Record<string, number> = { '2 times': 0, '3 times': 0, '4 times': 0, '5 times': 0, '>5 times': 0 };
    defects.forEach(d => {
      const count = d.reOpenCount || 0;
      if (count === 2) freq['2 times']++;
      else if (count === 3) freq['3 times']++;
      else if (count === 4) freq['4 times']++;
      else if (count === 5) freq['5 times']++;
      else if (count > 5) freq['>5 times']++;
    });
    return Object.entries(freq).map(([name, value]) => ({ name, value }));
  }
  const PIE_COLORS = ['#60a5fa', '#fbbf24', '#34d399', '#f87171', '#a78bfa'];

  return (
    <div className="max-w-6xl mx-auto py-8 relative">
      {/* Back Button in top-right */}
      <button
        onClick={() => navigate('/dashboard')}
        className="absolute top-4 right-4 flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg shadow hover:bg-blue-50 hover:border-blue-400 transition-all duration-150 z-20"
        aria-label="Back to Overall Dashboard"
      >
        <ArrowLeft className="w-5 h-5 text-blue-600" />
        <span className="text-sm font-medium text-blue-700">Back</span>
      </button>
      {/* Project Selection Panel - Individual Gradient Cards */}
      <div className="w-full flex flex-col items-center mb-6">
        <div className="flex items-center mb-4">
          <span className="inline-block w-1.5 h-7 bg-blue-500 rounded-full mr-3"></span>
          <span className="text-2xl font-extrabold text-gray-900 tracking-tight">Select Project</span>
        </div>
        <div className="w-full flex flex-row flex-wrap items-center justify-center gap-4">
          {projects.map(project => {
            const selected = projectId === project.id;
            return (
              <button
                key={project.id}
                onClick={() => handleProjectSelect(project.id)}
                className={`min-w-[120px] max-w-[180px] h-20 px-4 py-3 rounded-xl border transition-all duration-200 shadow-sm flex flex-col items-center justify-center
                  bg-gradient-to-br from-blue-50 via-white to-blue-100
                  ${selected ? 'border-blue-500 shadow-md scale-105' : 'border-gray-200 hover:border-blue-400 hover:shadow-md'}
                `}
                style={{ outline: selected ? '2px solid #3b82f6' : 'none', outlineOffset: '2px' }}
              >
                <span className="text-base font-medium text-gray-900 text-center truncate w-full">{project.name}</span>
                {selected && <span className="mt-1 text-[11px] text-blue-500 font-medium">Selected</span>}
              </button>
            );
          })}
        </div>
      </div>
      {/* End Project Selection Panel */}
      <h1 className="text-2xl font-bold mb-4 text-gray-900">{project?.name || 'Project Dashboard'}</h1>
      {/* KLOC and Meter Section - Modern Card Layout */}
      <div className="w-full flex justify-center mb-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 w-full max-w-2xl bg-white border border-gray-200 rounded-2xl shadow-lg p-8">
          <div className="flex-1 flex flex-col items-start mb-6 md:mb-0">
            <div className="text-lg font-bold text-blue-700 mb-2 tracking-tight">KLOC & Defect Density</div>
            <label htmlFor="kloc" className="text-sm font-semibold text-gray-700 mb-2">KLOC (Thousands of Lines of Code)</label>
            <input
              id="kloc"
              type="number"
              min={1}
              value={kloc}
              onChange={e => setKloc(Number(e.target.value))}
              className="w-28 px-4 py-2 border-2 border-blue-200 rounded-lg text-2xl font-bold text-blue-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-150 shadow-sm"
            />
          </div>
          <div className="flex-1 flex flex-col items-center justify-center">
            <DefectDensityMeter value={Number(defectDensity)} />
            <div className="flex flex-col items-center mt-4">
              <span className="text-lg font-bold text-blue-900 mb-1 tracking-tight">Defect Density</span>
              <span className="text-4xl font-extrabold text-gray-900 drop-shadow-sm">{defectDensity}</span>
            </div>
          </div>
        </div>
      </div>
      {/* Project Summary Card - Modern UI */}
      <div className="w-full flex justify-center mb-10">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full flex flex-col items-center border border-gray-100">
          {/* Gauges */}
          <div className="w-full flex flex-col items-center mb-6">
            {/* Priority Gauge */}
            <div className="mb-4">
              <PriorityGauge value={getPriorityValue(projectDefects)} />
              <div className="text-sm font-semibold text-gray-700 mt-2 text-center">Priority</div>
            </div>
            {/* Severity Gauge */}
            <div>
              <SeverityGauge value={getSeverityValue(projectDefects)} />
              <div className="text-sm font-semibold text-gray-700 mt-2 text-center">Severity</div>
            </div>
          </div>
          {/* Project Info */}
          <div className="w-full flex flex-col items-center mb-4">
            <div className="text-xs text-gray-500">Total: {projectDefects.length}</div>
            <div className="text-lg font-bold text-blue-700 mt-1 mb-2 text-center">{project?.name}</div>
            <div className="w-full flex justify-center">
              <span className="px-4 py-1 rounded-full bg-orange-100 text-orange-700 font-semibold text-sm shadow-sm">Defect Density: {defectDensity}</span>
            </div>
          </div>
          {/* Legend */}
          <div className="w-full flex flex-row flex-wrap justify-center gap-4 mt-4">
            {/* Priority Legend */}
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-red-500 inline-block"></span>
              <span className="text-xs text-gray-700">High</span>
              <span className="w-3 h-3 rounded-full bg-yellow-400 inline-block ml-2"></span>
              <span className="text-xs text-gray-700">Medium</span>
              <span className="w-3 h-3 rounded-full bg-green-500 inline-block ml-2"></span>
              <span className="text-xs text-gray-700">Low</span>
            </div>
            {/* Severity Legend (reuse same colors for demo) */}
            <div className="flex items-center gap-1 ml-4">
              <span className="w-3 h-3 rounded-full bg-red-500 inline-block"></span>
              <span className="text-xs text-gray-700">High</span>
              <span className="w-3 h-3 rounded-full bg-yellow-400 inline-block ml-2"></span>
              <span className="text-xs text-gray-700">Medium</span>
              <span className="w-3 h-3 rounded-full bg-green-500 inline-block ml-2"></span>
              <span className="text-xs text-gray-700">Low</span>
            </div>
          </div>
        </div>
      </div>
      {/* Pie Chart + Defect Severity Index Row */}
      <div className="w-full flex flex-col md:flex-row gap-8 mb-10">
        {/* Pie Chart Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-lg w-full flex flex-col items-center border border-gray-200">
          <div className="text-xl font-bold text-blue-700 mb-4 tracking-tight">Defects Reopened by Frequency</div>
          <ResponsiveContainer width="100%" height={220} minWidth={220} minHeight={220}>
            <PieChart>
              <Pie
                data={getReopenFrequencyData(projectDefects)}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                label={({ name, value }) => value > 0 ? `${name}` : ''}
              >
                {getReopenFrequencyData(projectDefects).map((entry, idx) => (
                  <Cell key={`cell-${idx}`} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        {/* Defect Severity Index Card - right side */}
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-lg w-full flex flex-col items-center border border-gray-200">
          <div className="text-xl font-bold text-blue-700 mb-4 tracking-tight">Defect Severity Index</div>
          <DefectSeverityGauge value={calculateSeverityIndex(projectDefects)} />
          <div className="mt-4 flex flex-col items-center">
            <span className="text-lg font-semibold text-gray-700 mb-1">Severity Index</span>
            <span className="text-3xl font-extrabold text-gray-900">{calculateSeverityIndex(projectDefects)}</span>
          </div>
          <div className="mt-4 flex flex-row gap-4">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-500 inline-block"></span><span className="text-xs text-gray-700">Low</span></span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-yellow-400 inline-block"></span><span className="text-xs text-gray-700">Medium</span></span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-500 inline-block"></span><span className="text-xs text-gray-700">High/Critical</span></span>
          </div>
        </div>
      </div>

      
      
    </div>
  );
};

// --- Gauge Components and Value Helpers ---
function getPriorityValue(defects: any[]) {
  const high = defects.filter((d: any) => d.priority === 'high').length;
  const medium = defects.filter((d: any) => d.priority === 'medium').length;
  const low = defects.filter((d: any) => d.priority === 'low').length;
  const total = high + medium + low;
  if (!total) return 0;
  return Math.round((high * 100 + medium * 60 + low * 20) / total);
}
function getSeverityValue(defects: any[]) {
  const high = defects.filter((d: any) => d.severity === 'high' || d.severity === 'critical').length;
  const medium = defects.filter((d: any) => d.severity === 'medium').length;
  const low = defects.filter((d: any) => d.severity === 'low').length;
  const total = high + medium + low;
  if (!total) return 0;
  return Math.round((high * 100 + medium * 60 + low * 20) / total);
}
function PriorityGauge({ value }: { value: number }) {
  const percent = Math.min(Math.max(value, 0), 100) / 100;
  const angle = percent * 180 - 90;
  return (
    <svg width="120" height="60" viewBox="0 0 120 60">
      <defs>
        <linearGradient id="priorityGrad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#22c55e" />
          <stop offset="50%" stopColor="#eab308" />
          <stop offset="100%" stopColor="#ef4444" />
        </linearGradient>
        <filter id="priorityShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000" floodOpacity="0.10" />
        </filter>
      </defs>
      <path d="M15,55 A45,45 0 0,1 105,55" fill="none" stroke="#e5e7eb" strokeWidth="12" filter="url(#priorityShadow)" />
      <path d="M15,55 A45,45 0 0,1 105,55" fill="none" stroke="url(#priorityGrad)" strokeWidth="12" strokeDasharray="141" strokeDashoffset={141 - percent * 141} filter="url(#priorityShadow)" />
      <circle cx="60" cy="55" r="7" fill="#fff" stroke="#d1d5db" strokeWidth="2" />
      <line x1="60" y1="55" x2={60 + 42 * Math.cos((angle * Math.PI) / 180)} y2={55 + 42 * Math.sin((angle * Math.PI) / 180)} stroke="#ef4444" strokeWidth="5" strokeLinecap="round" filter="url(#priorityShadow)" />
    </svg>
  );
}
function SeverityGauge({ value }: { value: number }) {
  const percent = Math.min(Math.max(value, 0), 100) / 100;
  const angle = percent * 180 - 90;
  return (
    <svg width="120" height="60" viewBox="0 0 120 60">
      <defs>
        <linearGradient id="severityGrad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#22c55e" />
          <stop offset="50%" stopColor="#eab308" />
          <stop offset="100%" stopColor="#ef4444" />
        </linearGradient>
        <filter id="severityShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000" floodOpacity="0.10" />
        </filter>
      </defs>
      <path d="M15,55 A45,45 0 0,1 105,55" fill="none" stroke="#e5e7eb" strokeWidth="12" filter="url(#severityShadow)" />
      <path d="M15,55 A45,45 0 0,1 105,55" fill="none" stroke="url(#severityGrad)" strokeWidth="12" strokeDasharray="141" strokeDashoffset={141 - percent * 141} filter="url(#severityShadow)" />
      <circle cx="60" cy="55" r="7" fill="#fff" stroke="#d1d5db" strokeWidth="2" />
      <line x1="60" y1="55" x2={60 + 42 * Math.cos((angle * Math.PI) / 180)} y2={55 + 42 * Math.sin((angle * Math.PI) / 180)} stroke="#eab308" strokeWidth="5" strokeLinecap="round" filter="url(#severityShadow)" />
    </svg>
  );
} 