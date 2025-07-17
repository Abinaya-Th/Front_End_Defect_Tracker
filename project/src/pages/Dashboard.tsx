import React, { useState, useRef, useEffect } from 'react';
import ProjectCard from '../components/ui/ProjectCard';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { Doughnut } from 'react-chartjs-2';
import { Pie as ChartJSPie } from 'react-chartjs-2';
import { Modal } from '../components/ui/Modal';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, PieChart, Pie as RechartsPie, Cell } from 'recharts';
import { Chart as ChartJS, ArcElement, Tooltip as ChartTooltip, Legend as ChartLegend } from 'chart.js';
import { AlertCircle, Clock, CheckCircle, TrendingUp, Calendar, User, ChevronLeft, ChevronRight } from 'lucide-react';
import { Tooltip as ReactTooltip } from 'react-tooltip';
import { ProjectSelector } from '../components/ui/ProjectSelector';
import DefectToRemarkRatio from '../components/ui/DefectToRemarkRatio';
ChartJS.register(ArcElement, ChartTooltip, ChartLegend);

export const Dashboard: React.FC = () => {
  const { defects, projects, statusTypes } = useApp();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  // Remove KLOC state from dashboard, always read from localStorage per project
  const navigate = useNavigate();
  const [reopenModal, setReopenModal] = useState<{ open: boolean; label: string; defects: any[] }>({ open: false, label: '', defects: [] });
  const [riskFilter, setRiskFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [pieModal, setPieModal] = useState<{ open: boolean; severity: string | null }>({ open: false, severity: null });
  const [reopenedHoveredIdx, setReopenedHoveredIdx] = useState<number | null>(null);
  const reopenedChartRef = useRef<any>(null);
  const [isReopenedCardHovered, setIsReopenedCardHovered] = useState(false);
  const [hoveredModuleIdx, setHoveredModuleIdx] = useState<number | null>(null);
  const [isModuleCardHovered, setIsModuleCardHovered] = useState(false);
  const [moduleDetailModal, setModuleDetailModal] = useState<{ open: boolean; mod: any; totalHigh: number; totalMed: number; totalLow: number } | null>(null);
  const [reopenedDetailModal, setReopenedDetailModal] = useState<{ open: boolean; label: string; defects: any[] } | null>(null);

  // Helper to determine project status color
  function getProjectStatusColor(projectId: string): 'red' | 'yellow' | 'green' {
    const projectDefects = defects.filter(d => d.projectId === projectId);
    if (projectDefects.some(d => d.severity === 'high' || d.severity === 'critical')) return 'red';
    if (projectDefects.some(d => d.severity === 'medium')) return 'yellow';
    return 'green';
  }

  // Filter defects for selected project
  const projectDefects = selectedProjectId
    ? defects.filter(d => d.projectId === selectedProjectId)
    : [];
  const selectedProject = projects.find(p => p.id === selectedProjectId);

  // --- Project Health Summary Logic ---
  const today = new Date();
  const immediateAttentionProjects = projects.filter(project => {
    const projectDefects = defects.filter(d => d.projectId === project.id);
    const highOrCritical = projectDefects.some(d => (d.severity === 'high' || d.severity === 'critical') && (d.status === 'open' || d.status === 'in-progress'));
    const manyOpen = projectDefects.filter(d => d.status === 'open').length >= 5; // threshold for 'many'
    return highOrCritical || manyOpen;
  });
  const behindScheduleProjects = projects.filter(project => {
    const endDate = project.endDate ? new Date(project.endDate) : null;
    const notCompleted = project.status !== 'completed';
    const lowProgress = typeof project.progress === 'number' && project.progress < 60;
    return (endDate && endDate < today && notCompleted) || lowProgress;
  });
  const performingWellProjects = projects.filter(project => {
    // Not in immediate attention or behind schedule
    return !immediateAttentionProjects.includes(project) && !behindScheduleProjects.includes(project);
  });

  if (!selectedProjectId) {
    // Show summary and project cards grid
    return (
      <>
        {/* Dashboard Heading */}
        <div className="max-w-5xl mx-auto flex flex-col items-center mt-16 mb-12">
          <h1
            className="text-5xl md:text-5xl font-extrabold tracking-tight text-gray-900 mb-4 drop-shadow-sm"
            style={{ letterSpacing: '-0.02em', fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif' }}
          >
            Dashboard Overview
          </h1>
          <p
            className="text-lg md:text-xl font-medium text-gray-500 text-center max-w-2xl mb-2"
            style={{ fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif', lineHeight: '1.6' }}
          >
            Gain insights into your projects with real-time health metrics and status summaries
          </p>
          <div className="h-1 w-24 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-full mt-2 mb-1 opacity-80" />
        </div>
        
        {/* Section: Project Health Summary - Using the better structured version from code 1 */}
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-6 text-left tracking-tight flex items-center gap-3">
            <span className="inline-block w-2 h-8 bg-blue-500 rounded-full mr-2" />
            Project Status Insights
          </h2>
          {/* Modernized Project Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-7 mb-12">
            {/* High Risk Projects */}
            <div className="bg-white rounded-2xl shadow-lg flex items-center p-7 min-h-[150px] border-2 border-red-500/100 hover:shadow-xl transition-transform hover:scale-[1.03] group relative">
              <span className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-red-600 to-red-800 mr-5 shadow-md">
                { <AlertCircle className="w-9 h-9 text-red-100" /> }
              </span>
              <div>
                <div className="text-slate-700 font-semibold text-lg mb-1">High Risk Projects</div>
                <div className="text-4xl font-extrabold text-red-600">{immediateAttentionProjects.length}</div>
                <div className="text-xs text-red-500 mt-1 font-medium">Immediate attention required</div>
              </div>
              <div className="absolute top-4 right-4 w-3 h-3 rounded-full bg-red-500 animate-pulse" />
            </div>
            {/* Moderate Risk Projects */}
            <div className="bg-white rounded-2xl shadow-lg flex items-center p-7 min-h-[150px] border-2 border-yellow-500/100 hover:shadow-xl transition-transform hover:scale-[1.03] group relative">
              <span className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-500 mr-5 shadow-md">
                <Clock className="w-9 h-9 text-yellow-100" />
              </span>
              <div>
                <div className="text-slate-700 font-semibold text-lg mb-1">Medium Risk Projects</div>
                <div className="text-4xl font-extrabold text-yellow-600">{behindScheduleProjects.length}</div>
                <div className="text-xs text-yellow-600 mt-1 font-medium">Monitor progress closely</div>
              </div>
              <div className="absolute top-4 right-4 w-3 h-3 rounded-full bg-yellow-400 animate-pulse" />
            </div>
            {/* Low Risk Projects */}
            <div className="bg-white rounded-2xl shadow-lg flex items-center p-7 min-h-[150px] border-2 border-green-600/80 hover:shadow-xl transition-transform hover:scale-[1.03] group relative">
              <span className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-green-600 mr-5 shadow-md">
                <CheckCircle className="w-9 h-9 text-green-100" />
              </span>
              <div>
                <div className="text-slate-700 font-semibold text-lg mb-1">Low Risk Projects</div>
                <div className="text-4xl font-extrabold text-green-600">{performingWellProjects.length}</div>
                <div className="text-xs text-green-600 mt-1 font-medium">Stable and on track</div>
              </div>
              <div className="absolute top-4 right-4 w-3 h-3 rounded-full bg-green-500 animate-pulse" />
            </div>
          </div>
            </div>
        {/* Divider */}
        <hr className="my-10 border-gray-200 max-w-5xl mx-auto" />
        
        {/* Section: All Projects - Using the better filter implementation from code 2 */}
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <h2 className="text-2xl font-bold text-gray-900">All Projects</h2>
            
                </div>
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-8">
            <span className="text-gray-700 font-medium mr-0 sm:mr-3 whitespace-nowrap self-start sm:self-center">Filter by severity:</span>
            <div className="flex bg-gradient-to-r from-slate-50 via-blue-50 to-slate-100 border border-slate-200 rounded-full shadow-[0_2px_16px_rgba(30,41,59,0.10)] px-2 py-1 gap-4 backdrop-blur-sm w-fit">
              <button
                className={`px-5 py-2 rounded-full font-semibold transition text-sm focus:outline-none focus:ring-2 focus:ring-blue-400
                  ${riskFilter === 'all'
                    ? 'bg-gradient-to-r from-blue-500 to-blue-400 text-white shadow-lg scale-105 ring-2 ring-blue-300'
                    : 'bg-white/60 text-slate-700 hover:bg-blue-100/60 hover:shadow-md hover:scale-105'}
                  backdrop-blur-[2px] border border-transparent`}
                style={{ boxShadow: riskFilter === 'all' ? '0 4px 24px 0 rgba(59,130,246,0.10)' : undefined }}
                onClick={() => setRiskFilter('all')}
              >
                All Projects
              </button>
              <button
                className={`px-5 py-2 rounded-full font-semibold transition text-sm focus:outline-none focus:ring-2 focus:ring-red-300
                  ${riskFilter === 'high'
                    ? 'bg-gradient-to-r from-red-600 to-red-800 text-white shadow-lg scale-105 ring-2 ring-red-200'
                    : 'bg-white/60 text-red-700 hover:bg-red-100/60 hover:shadow-md hover:scale-105'}
                  backdrop-blur-[2px] border border-transparent`}
                style={{ boxShadow: riskFilter === 'high' ? '0 4px 24px 0 rgba(239,68,68,0.10)' : undefined }}
                onClick={() => setRiskFilter('high')}
              >
                High Risk
              </button>
              <button
                className={`px-5 py-2 rounded-full font-semibold transition text-sm focus:outline-none focus:ring-2 focus:ring-yellow-300
                  ${riskFilter === 'medium'
                    ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-white shadow-lg scale-105 ring-2 ring-yellow-200'
                    : 'bg-white/60 text-yellow-700 hover:bg-yellow-100/60 hover:shadow-md hover:scale-105'}
                  backdrop-blur-[2px] border border-transparent`}
                style={{ boxShadow: riskFilter === 'medium' ? '0 4px 24px 0 rgba(251,191,36,0.10)' : undefined }}
                onClick={() => setRiskFilter('medium')}
              >
                Medium Risk
              </button>
              <button
                className={`px-5 py-2 rounded-full font-semibold transition text-sm focus:outline-none focus:ring-2 focus:ring-green-300
                  ${riskFilter === 'low'
                    ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg scale-105 ring-2 ring-green-200'
                    : 'bg-white/60 text-green-700 hover:bg-green-100/60 hover:shadow-md hover:scale-105'}
                  backdrop-blur-[2px] border border-transparent`}
                style={{ boxShadow: riskFilter === 'low' ? '0 4px 24px 0 rgba(34,197,94,0.10)' : undefined }}
                onClick={() => setRiskFilter('low')}
              >
                Low Risk
              </button>
            </div>
          </div>
          {/* Project Cards Grid */}
          <div className="flex flex-wrap gap-8 justify-start py-6">
            {(() => {
              // Sort projects: high risk first, then medium, then low
              const sortedProjects = [...projects].sort((a: any, b: any) => {
                const getRisk = (project: any) => {
                  const projectDefects = defects.filter(d => d.projectId === project.id);
                  if (projectDefects.some(d => d.severity === 'high' || d.severity === 'critical')) return 0; // high
                  if (projectDefects.some(d => d.severity === 'medium')) return 1; // medium
                  return 2; // low
                };
                return getRisk(a) - getRisk(b);
              });
              return sortedProjects.map((project: any, idx: number) => {
                const projectDefects = defects.filter(d => d.projectId === project.id);
                const highCount = projectDefects.filter(d => d.severity === 'high' || d.severity === 'critical').length;
                const mediumCount = projectDefects.filter(d => d.severity === 'medium').length;
                const lowCount = projectDefects.filter(d => d.severity === 'low').length;
                let risk: 'high' | 'medium' | 'low' = 'low';
                if (highCount > 0) risk = 'high';
                else if (mediumCount > 0) risk = 'medium';
                // else low
                if (riskFilter !== 'all' && risk !== riskFilter) return null;
                return (
                  <div
                    key={project.id}
                    className="animate-fade-in"
                    style={{ animationDelay: `${idx * 60}ms` }}
                  >
                    <ProjectCard
                      name={project.name}
                      risk={risk}
                      defectCounts={{ high: highCount, medium: mediumCount, low: lowCount }}
                      onClick={() => setSelectedProjectId(project.id)}
                      size="small"
                    />
                  </div>
                );
              });
            })()}
          </div>
            </div>
      </>
    );
  }



  // Rest of the code remains the same as in code 1 for the project-specific dashboard view
  // [Previous implementation continues...]

  // Show widgets for selected project
  return (
    <>
      <div className="max-w-6xl mx-auto px-4 pt-8">
        {/* Back Button for Project Dashboard */}
        {selectedProject && (
          <div className="flex justify-end mb-4">
            <button
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold shadow-sm border border-gray-200 transition"
              onClick={() => setSelectedProjectId(null)}
            >
              <ChevronLeft className="w-5 h-5" />
              Back
            </button>
                </div>
        )}
        {/* Project Selection Panel (shared component) */}
        <div className="mb-6">
          <ProjectSelector
            projects={projects}
            selectedProjectId={selectedProjectId || ''}
            onSelect={(id: string) => setSelectedProjectId(id)}
          />
              </div>
        {/* Project Name/Status Bar */}
        {selectedProject && (
          <div className="bg-white rounded-2xl border border-gray-200 flex items-center justify-between px-8 py-4 mb-12" style={{ minHeight: '80px' }}>
            <div>
              <div className="text-2xl font-bold text-gray-900">{selectedProject.name}</div>
              </div>
            <div className="flex flex-col items-end">
              <span className="text-gray-500 text-sm mb-1">Status</span>
              {selectedProject.priority === 'high' && (
                <span className="bg-red-100 text-red-700 rounded-full px-4 py-1 text-sm font-semibold">HIGH PRIORITY</span>
              )}
              {selectedProject.priority === 'medium' && (
                <span className="bg-yellow-100 text-yellow-800 rounded-full px-4 py-1 text-sm font-semibold">MEDIUM PRIORITY</span>
              )}
              {selectedProject.priority === 'low' && (
                <span className="bg-green-100 text-green-800 rounded-full px-4 py-1 text-sm font-semibold">LOW PRIORITY</span>
              )}
            </div>
                </div>
        )}
  {/* KLOC and Total Defects Controls removed from project dashboard */}
        {/* Defect Severity Breakdown */}
        <div className="mb-14">
          <h2 className="text-lg font-semibold mb-3 text-gray-600">Defect Severity Breakdown</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {['high', 'medium', 'low'].map(severity => {
              const severityLabel = `Defects on ${severity.charAt(0).toUpperCase() + severity.slice(1)}`;
              const colorMap = {
                high: 'border-l-8 border-red-500',
                medium: 'border-l-8 border-yellow-400',
                low: 'border-l-8 border-green-500',
              };
              const titleColor = {
                high: 'text-red-600',
                medium: 'text-yellow-500',
                low: 'text-green-600',
              };
              const borderColor = {
                high: 'border-red-200',
                medium: 'border-yellow-200',
                low: 'border-green-200',
              };
              const statusList = statusTypes.map(s => s.name.toLowerCase());
              const statusColorMap = Object.fromEntries(statusTypes.map(s => [s.name.toLowerCase(), s.color]));
              const defectsBySeverity = projectDefects.filter(d => d.severity === severity);
              const total = defectsBySeverity.length;
              // Count by status
              const statusCounts = statusList.map(status =>
                defectsBySeverity.filter(d => (d.status || '').toLowerCase() === status).length
              );
              // Split status legend into two columns
              const half = Math.ceil(statusList.length / 2);
              const leftStatuses = statusList.slice(0, half);
              const rightStatuses = statusList.slice(half);
              return (
                <div
                  key={severity}
                  className={`bg-white rounded-xl shadow flex flex-col justify-between min-h-[200px] border ${borderColor[severity as keyof typeof borderColor]} ${colorMap[severity as keyof typeof colorMap]}`}
                >
                  <div className="flex items-center justify-between px-6 pt-4 pb-1">
                    <span className={`font-semibold text-base ${titleColor[severity as keyof typeof titleColor]}`}>{severityLabel}</span>
                    <span className="font-semibold text-gray-600 text-base">Total: {total}</span>
                    </div>
                  <div className="flex flex-row gap-8 px-6 pb-1">
                    <div className="flex flex-col gap-1">
                      {leftStatuses.map((status, idx) => (
                        <div key={status} className="flex items-center gap-2 text-xs">
                          <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ backgroundColor: statusColorMap[status] }}></span>
                          <span className="text-gray-700 font-normal">{statusTypes[idx].name}</span>
                          <span className="text-gray-700 font-medium">{statusCounts[idx]}</span>
                  </div>
                      ))}
                  </div>
                    <div className="flex flex-col gap-1">
                      {rightStatuses.map((status, idx) => (
                        <div key={status} className="flex items-center gap-2 text-xs">
                          <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ backgroundColor: statusColorMap[status] }}></span>
                          <span className="text-gray-700 font-normal">{statusTypes[half + idx].name}</span>
                          <span className="text-gray-700 font-medium">{statusCounts[half + idx]}</span>
                </div>
                      ))}
          </div>
              </div>
                  <div className="px-6 pb-3">
                    <button
                      className="mt-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-md font-medium text-xs border border-blue-100 hover:bg-blue-100 transition"
                      onClick={() => setPieModal({ open: true, severity })}
                    >
                      View Chart
                    </button>
            </div>
              </div>
              );
            })}
              </div>
          {/* Pie Chart Modal */}
          {pieModal.open && pieModal.severity && (() => {
            const severity = pieModal.severity;
            const statusList = statusTypes.map(s => s.name.toLowerCase());
            const statusColorMap = Object.fromEntries(statusTypes.map(s => [s.name.toLowerCase(), s.color]));
            const defectsBySeverity = projectDefects.filter(d => d.severity === severity);
            const statusCounts = statusList.map(status =>
              defectsBySeverity.filter(d => (d.status || '').toLowerCase() === status).length
            );
            const pieData = {
              labels: statusList.map(s => s.toUpperCase()),
              datasets: [
                {
                  data: statusCounts,
                  backgroundColor: statusList.map(s => statusColorMap[s] || '#ccc'),
                },
              ],
            };
            return (
              <Modal isOpen={pieModal.open} onClose={() => setPieModal({ open: false, severity: null })} title={`Status Breakdown for ${severity.charAt(0).toUpperCase() + severity.slice(1)}`}> 
                <div className="flex flex-col items-center justify-center p-4">
                  <div className="w-64 h-64">
                    <ChartJSPie data={pieData} options={{ plugins: { legend: { display: true, position: 'bottom' } } }} />
            </div>
              </div>
              </Modal>
            );
          })()}
            </div>
        {/* Defect Density Meter & Defect Severity Index Row */}
          <div className="mb-14 grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {/* Defect Density Card */}
            <div className="bg-white rounded-xl shadow flex flex-col p-6 h-full border border-gray-200">
              <h2 className="text-lg font-semibold mb-3 text-gray-700">Defect Density</h2>
              <div className="flex-1 flex flex-col justify-center">
                <DefectDensityMeter 
                  kloc={(() => {
                    if (!selectedProjectId) return 1;
                    const stored = localStorage.getItem(`kloc_${selectedProjectId}`);
                    return stored ? Number(stored) || 1 : 1;
                  })()} 
                  defectCount={projectDefects.length} 
                />
              </div>
            </div>
          {/* Defect Severity Index Card */}
          <div className="bg-white rounded-xl shadow flex flex-col p-6 h-full border border-gray-200">
            <h2 className="text-lg font-semibold mb-3 text-gray-700">Defect Severity Index</h2>
            <div className="flex-1 flex flex-col items-center justify-center">
              {(() => {
                const critical = projectDefects.filter(d => d.severity === 'critical').length;
                const high = projectDefects.filter(d => d.severity === 'high').length;
                const medium = projectDefects.filter(d => d.severity === 'medium').length;
                const low = projectDefects.filter(d => d.severity === 'low').length;
                const total = projectDefects.length;
                const index = total > 0 ? ((critical * 4 + high * 3 + medium * 2 + low * 1) / total).toFixed(2) : '0.00';
                return (
                  <>
                    <span className="text-4xl font-bold text-orange-600 mb-2">{index}</span>
                    <span className="text-gray-700 text-center">Weighted severity score (higher = more severe defects)</span>
                  </>
                );
              })()}
            </div>
              </div>
          {/* Defect to Remark Ratio Card */}
          <div className="bg-white rounded-xl shadow flex flex-col p-6 h-full border border-gray-200">
            <h2 className="text-lg font-semibold mb-3 text-gray-700">Defect to Remark Ratio</h2>
            <div className="flex-1 flex flex-col items-center justify-center">
              <DefectToRemarkRatio defectCount={projectDefects.length} remarkCount={150} />
            </div>
              </div>
              </div>
        {/* Defects Reopened Multiple Times & Defect Distribution by Type Row */}
        <div className="mb-14 flex flex-col md:flex-row gap-8 items-stretch">
          {/* Defects Reopened Multiple Times Pie Chart */}
          <div className="flex-1 bg-white rounded-2xl shadow p-6 flex flex-col relative">
            <h2 className="text-lg font-semibold mb-4 text-gray-900">Defects Reopened Multiple Times</h2>
            {(() => {
              // MOCK DATA for visual match
              const labels = ['2 times', '3 times', '4 times', '5 times', '5+ times'];
              const data = {
                labels,
                datasets: [
                  {
                    data: [8, 5, 3, 2, 1],
                    backgroundColor: [
                      '#4285F4', // 2 times
                      '#FBBC05', // 3 times
                      '#EA4335', // 4 times
                      '#C5221F', // 5 times
                      '#F29900', // 5+ times
                    ],
                  },
                ],
              };
              // Mock defect details for each bucket
              // IMPORTANT: The order of defectBuckets must match the order of labels and data.datasets[0].data
              const defectBuckets = [
                [ // 2 times
                  { id: 'DEF-001', title: 'Login fails', assignee: 'Alice', reporter: 'Bob', release: 'v2.1.0' },
                  { id: 'DEF-002', title: 'UI glitch', assignee: 'Carol', reporter: 'Dave', release: 'v2.1.0' },
                  { id: 'DEF-003', title: 'Crash on save', assignee: 'Eve', reporter: 'Frank', release: 'v2.1.0' },
                  { id: 'DEF-004', title: 'Slow load', assignee: 'Grace', reporter: 'Heidi', release: 'v2.1.0' },
                  { id: 'DEF-005', title: 'Data sync issue', assignee: 'Ivan', reporter: 'Judy', release: 'v2.1.0' },
                  { id: 'DEF-006', title: 'Notification bug', assignee: 'Mallory', reporter: 'Niaj', release: 'v2.1.0' },
                  { id: 'DEF-007', title: 'Export error', assignee: 'Olivia', reporter: 'Peggy', release: 'v2.1.0' },
                  { id: 'DEF-008', title: 'Import error', assignee: 'Sybil', reporter: 'Trent', release: 'v2.1.0' },
                ],
                [ // 3 times
                  { id: 'DEF-009', title: 'Database conn...', assignee: 'David Lee', reporter: 'Emma Wilson', release: 'v2.1.0' },
                  { id: 'DEF-010', title: 'Email notificat...', assignee: 'Frank Miller', reporter: 'Grace Taylor', release: 'v2.0.9' },
                  { id: 'DEF-011', title: 'File upload cor...', assignee: 'Helen Garcia', reporter: 'Ivan Rodriguez', release: 'v2.1.0' },
                  { id: 'DEF-012', title: 'Session timeout', assignee: 'Jack Brown', reporter: 'Karen White', release: 'v2.1.0' },
                  { id: 'DEF-013', title: 'API error', assignee: 'Liam Green', reporter: 'Mona Black', release: 'v2.1.0' },
                ],
                [ // 4 times
                  { id: 'DEF-014', title: 'Memory leak', assignee: 'Nina Blue', reporter: 'Oscar Pink', release: 'v2.1.0' },
                  { id: 'DEF-015', title: 'Cache issue', assignee: 'Paul Red', reporter: 'Quinn Yellow', release: 'v2.1.0' },
                  { id: 'DEF-016', title: 'Button misfire', assignee: 'Rita Orange', reporter: 'Sam Violet', release: 'v2.1.0' },
                ],
                [ // 5 times
                  { id: 'DEF-017', title: 'Chart bug', assignee: 'Tom Indigo', reporter: 'Uma Cyan', release: 'v2.1.0' },
                  { id: 'DEF-018', title: 'Theme not saved', assignee: 'Vic Magenta', reporter: 'Walt Lime', release: 'v2.1.0' },
                ],
                [ // 5+ times
                  { id: 'DEF-019', title: 'Critical crash', assignee: 'Xena Gold', reporter: 'Yuri Silver', release: 'v2.1.0' },
                ],
              ];
              // Ensure all arrays are the same length and order
              while (defectBuckets.length < data.labels.length) defectBuckets.push([]);
              while (defectBuckets.length > data.labels.length) defectBuckets.pop();
              // Use Chart.js onHover to set the correct hovered index
              const pieOptions = {
                plugins: { legend: { display: false } },
                onHover: (event, elements) => {
                  if (elements && elements.length > 0) {
                    setReopenedHoveredIdx(elements[0].index);
                  } else if (!isReopenedCardHovered) {
                    setReopenedHoveredIdx(null);
                  }
                },
              };
              // Calculate percentage for hovered segment
              const total = data.datasets[0].data.reduce((a, b) => a + b, 0);
              const hoveredCount = reopenedHoveredIdx !== null ? data.datasets[0].data[reopenedHoveredIdx] : 0;
              const hoveredPct = reopenedHoveredIdx !== null && total > 0 ? ((hoveredCount / total) * 100).toFixed(1) : null;
              return (
                <div
                  className="flex flex-col items-center justify-center relative"
                  onMouseEnter={() => setIsReopenedCardHovered(true)}
                  onMouseLeave={() => {
                    setIsReopenedCardHovered(false);
                    setReopenedHoveredIdx(null);
                  }}
                >
                  <div className="w-64 h-64">
                    <ChartJSPie ref={reopenedChartRef} data={data} options={pieOptions} />
            </div>
                  {/* Floating hover detail card */}
                  {(reopenedHoveredIdx !== null || isReopenedCardHovered) && (() => {
                    // Pie chart geometry (match your chart size)
                    const pieCenterX = 128; // SVG center X (w-64 = 256px)
                    const pieCenterY = 128; // SVG center Y
                    const pieRadius = 100; // Pie outer radius
                    const cardOffset = 60; // Distance from pie edge to card
                    const totalSegments = data.datasets[0].data.length;
                    const segmentAngle = 360 / totalSegments;
                    const idx = reopenedHoveredIdx ?? 0;
                    const angle = (idx + 0.5) * segmentAngle - 90; // -90 to start from top
                    const rad = (angle * Math.PI) / 180;
                    const minHorizontalOffset = 80; // Ensures card is always at least this far from pie center
                    const cardRadius = pieRadius + cardOffset + minHorizontalOffset;
                    const cardX = pieCenterX + cardRadius * Math.cos(rad);
                    let cardY = pieCenterY + cardRadius * Math.sin(rad);
                    // Clamp cardY to stay within the visible area
                    const maxY = 256 - 120;
                    const minY = 120;
                    cardY = Math.max(minY, Math.min(cardY, maxY));
                    // Always position the card to the right of the pie chart
                    const cardStyle = {
                      left: pieCenterX + pieRadius + 48,
                      top: pieCenterY,
                      transform: 'translateY(-50%)',
                      minWidth: 340,
                      position: 'absolute',
                    };
                    return (
                      <div
                        className="absolute z-20 w-[420px] bg-white rounded-xl shadow-lg border border-gray-200 p-6 animate-fade-in"
                        style={cardStyle}
                        onMouseEnter={() => {
                          setIsReopenedCardHovered(true);
                        }}
                        onMouseLeave={() => {
                          setIsReopenedCardHovered(false);
                          setReopenedHoveredIdx(null);
                        }}
                        onMouseDown={() => setReopenedDetailModal({ open: true, label: labels[reopenedHoveredIdx ?? 0], defects: defectBuckets[reopenedHoveredIdx ?? 0] })}
                      >
                        <div className="font-bold text-lg mb-2 text-gray-900">Defects Reopened {labels[reopenedHoveredIdx ?? 0]}</div>
                        <table className="min-w-full text-xs mb-2">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left py-1 px-2">ID</th>
                              <th className="text-left py-1 px-2">Title</th>
                              <th className="text-left py-1 px-2">Assignee</th>
                              <th className="text-left py-1 px-2">Reporter</th>
                              <th className="text-left py-1 px-2">Release</th>
                            </tr>
                          </thead>
                          <tbody>
                            {defectBuckets[(reopenedHoveredIdx ?? 0)] && defectBuckets[(reopenedHoveredIdx ?? 0)].length === 0 ? (
                              <tr><td colSpan={5} className="text-center py-4">No defects</td></tr>
                            ) : (
                              (defectBuckets[(reopenedHoveredIdx ?? 0)] || []).map((defect, idx) => (
                                <tr key={defect.id || idx} className="border-b">
                                  <td className="py-1 px-2 text-blue-700 font-semibold cursor-pointer hover:underline">{defect.id}</td>
                                  <td className="py-1 px-2">{defect.title}</td>
                                  <td className="py-1 px-2">{defect.assignee}</td>
                                  <td className="py-1 px-2">{defect.reporter}</td>
                                  <td className="py-1 px-2">{defect.release}</td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                        <div className="text-xs text-gray-400">Click segment for detailed view</div>
              </div>
                    );
                  })()}
                  <div className="mt-6 grid grid-cols-1 gap-1 text-sm">
                    {labels.map((label, idx) => (
                      <div key={label} className="flex items-center gap-2">
                        <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: data.datasets[0].backgroundColor[idx] }}></span>
                        <span className="text-gray-700">{label}: <span className="font-semibold">{data.datasets[0].data[idx]}</span></span>
            </div>
                  ))}
                  </div>
                <div className="mt-4 text-xs text-gray-400">Hover over segments to view defect details table</div>
                </div>
            );
          })()}
              </div>
          {/* Defect Distribution by Type Pie Chart */}
          <div className="flex-1 bg-white rounded-2xl shadow p-6 flex flex-col">
            <h2 className="text-lg font-semibold mb-4 text-gray-900">Defect Distribution by Type</h2>
            {(() => {
              // MOCK DATA for visual match
              const labels = ['Functional', 'UI/UX', 'Performance', 'Security', 'Integration'];
              const typeCounts = { Functional: 15, 'UI/UX': 8, Performance: 5, Security: 3, Integration: 4 };
              const data = {
                labels,
                datasets: [
                  {
                    data: [15, 8, 5, 3, 4],
                    backgroundColor: [
                      '#4285F4', // Functional
                      '#00B894', // UI/UX
                      '#FBBC05', // Performance
                      '#EA4335', // Security
                      '#A259F7', // Integration
                    ],
                  },
                ],
              };
              const total = 35;
              const mostCommon = 'Functional';
              const mostCount = 15;
              return (
                <>
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-64 h-64">
                      <ChartJSPie data={data} options={{ plugins: { legend: { display: false } } }} />
            </div>
                    <div className="mt-6 grid grid-cols-1 gap-1 text-sm">
                      {labels.map((type, idx) => (
                        <div key={type} className="flex items-center gap-2">
                          <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: data.datasets[0].backgroundColor[idx] }}></span>
                          <span className="text-gray-700">{type}: <span className="font-semibold">{data.datasets[0].data[idx]}</span></span>
      </div>
                  ))}
                  </div>
                    <div className="mt-6 flex justify-between w-full max-w-xs mx-auto border-t pt-4">
                      <div className="flex flex-col items-center">
                        <span className="text-2xl font-bold text-gray-900">{total}</span>
                        <span className="text-xs text-gray-500">Total Defects</span>
                </div>
                      <div className="flex flex-col items-center">
                        <span className="text-2xl font-bold text-blue-600">{mostCount}</span>
                        <span className="text-xs text-gray-500">Most Common</span>
              </div>
                  </div>
                </div>
                </>
              );
            })()}
              </div>
                    </div>
        {/* Time to Find Defects */}
        <div className="mb-14 flex flex-col md:flex-row gap-8 items-stretch">
          {/* Time to Find Defects */}
          <div className="flex-1 bg-white rounded-2xl shadow p-6 flex flex-col">
            <h2 className="text-lg font-semibold mb-4 text-gray-900">Time to Find Defects</h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={[
                  { day: 'Day 1', defects: 2 },
                  { day: 'Day 2', defects: 3 },
                  { day: 'Day 3', defects: 1 },
                  { day: 'Day 4', defects: 4 },
                  { day: 'Day 5', defects: 2 },
                  { day: 'Day 6', defects: 3 },
                  { day: 'Day 7', defects: 2 },
                  { day: 'Day 8', defects: 1 },
                  { day: 'Day 9', defects: 2 },
                  { day: 'Day 10', defects: 1 },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" label={{ value: 'Time (Day)', position: 'insideBottom', offset: -5 }} />
                  <YAxis domain={[0, 5]} tickFormatter={v => v} label={{ value: 'Defects Count', angle: -90, position: 'insideLeft', offset: 10 }} />
                  <Tooltip formatter={v => `${v} defects`} />
                  <Line type="monotone" dataKey="defects" stroke="#2563eb" strokeWidth={3} dot={{ r: 5, stroke: '#2563eb', strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 7 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
           
                  </div>
          {/* Time to Fix Defects */}
          <div className="flex-1 bg-white rounded-2xl shadow p-6 flex flex-col">
            <h2 className="text-lg font-semibold mb-4 text-gray-900">Time to Fix Defects</h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={[
                  { day: 'Day 1', defects: 3 },
                  { day: 'Day 2', defects: 2 },
                  { day: 'Day 3', defects: 4 },
                  { day: 'Day 4', defects: 3 },
                  { day: 'Day 5', defects: 2 },
                  { day: 'Day 6', defects: 3 },
                  { day: 'Day 7', defects: 2 },
                  { day: 'Day 8', defects: 2 },
                  { day: 'Day 9', defects: 1 },
                  { day: 'Day 10', defects: 2 },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" label={{ value: 'Time (Day)', position: 'insideBottom', offset: -5 }} />
                  <YAxis domain={[0, 5]} tickFormatter={v => v} label={{ value: 'Defects Count', angle: -90, position: 'insideLeft', offset: 10 }} />
                  <Tooltip formatter={v => `${v} defects`} />
                  <Line type="monotone" dataKey="defects" stroke="#10b981" strokeWidth={3} dot={{ r: 5, stroke: '#10b981', strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 7 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
           
          </div>
        </div>
        
        {/* More widgets (3-9) will go here */}
      </div>
      {/* Move the 'Defects by Module' section to the end of the dashboard widgets, after all other main sections. */}
      <div className="mb-10 bg-white rounded-2xl max-w-3xl mx-auto shadow p-6 flex flex-col items-center">
        <h2 className="text-lg font-semibold mb-4 text-gray-900">Defects by Module</h2>
        <div className="relative w-64 h-64 mx-auto"
          onMouseLeave={() => {
            if (!isModuleCardHovered) setHoveredModuleIdx(null);
          }}
        >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
              <RechartsPie
                data={[
                  { name: 'Authentication', value: 12, color: '#4285F4' },
                  { name: 'Payment', value: 8, color: '#10b981' },
                  { name: 'User Management', value: 6, color: '#fbbf24' },
                  { name: 'Reporting', value: 4, color: '#ef4444' },
                  { name: 'Dashboard', value: 3, color: '#a259f7' },
                  { name: 'Settings', value: 2, color: '#06b6d4' },
                ]}
                dataKey="value"
                nameKey="name"
                      cx="50%"
                      cy="50%"
                outerRadius={110}
                stroke="#fff"
                isAnimationActive={true}
                label={false}
                onMouseEnter={(_, idx) => setHoveredModuleIdx(idx)}
              >
                {[
                  { name: 'Authentication', value: 12, color: '#4285F4' },
                  { name: 'Payment', value: 8, color: '#10b981' },
                  { name: 'User Management', value: 6, color: '#fbbf24' },
                  { name: 'Reporting', value: 4, color: '#ef4444' },
                  { name: 'Dashboard', value: 3, color: '#a259f7' },
                  { name: 'Settings', value: 2, color: '#06b6d4' },
                ].map((entry, idx) => (
                  <Cell
                    key={`cell-${idx}`}
                    fill={
                      hoveredModuleIdx === idx
                        ? darkenColor(entry.color, 0.18) // darken on hover
                        : entry.color
                    }
                    style={hoveredModuleIdx === idx ? { filter: 'brightness(0.85)' } : {}}
                  />
                ))}
              </RechartsPie>
                  </PieChart>
                </ResponsiveContainer>
          {/* Floating hover card logic as before */}
          {(hoveredModuleIdx !== null || isModuleCardHovered) && (() => {
            const modules = [
              {
                name: 'Authentication', value: 12, percent: 34, submodules: [
                  { name: 'Login', high: 2, med: 1, low: 1 },
                  { name: '2FA', high: 0, med: 2, low: 1 },
                ]
              },
              {
                name: 'Payment', value: 8, percent: 22.9, submodules: [
                  { name: 'Credit Card', high: 1, med: 2, low: 1 },
                  { name: 'PayPal Integration', high: 0, med: 1, low: 2 },
                  { name: 'Refund System', high: 0, med: 0, low: 1 },
                ]
              },
              {
                name: 'User Management', value: 6, percent: 17, submodules: [
                  { name: 'Profile', high: 1, med: 1, low: 1 },
                  { name: 'Roles', high: 0, med: 1, low: 2 },
                ]
              },
              {
                name: 'Reporting', value: 4, percent: 11, submodules: [
                  { name: 'Export', high: 0, med: 1, low: 1 },
                  { name: 'Charts', high: 0, med: 1, low: 1 },
                ]
              },
              {
                name: 'Dashboard', value: 3, percent: 9, submodules: [
                  { name: 'Overview', high: 0, med: 1, low: 1 },
                  { name: 'Widgets', high: 0, med: 0, low: 1 },
                ]
              },
              {
                name: 'Settings', value: 2, percent: 6, submodules: [
                  { name: 'Preferences', high: 0, med: 0, low: 1 },
                  { name: 'Notifications', high: 0, med: 0, low: 1 },
                ]
              },
            ];
            const mod = modules[hoveredModuleIdx ?? 0];
            const totalHigh = mod.submodules.reduce((a, s) => a + s.high, 0);
            const totalMed = mod.submodules.reduce((a, s) => a + s.med, 0);
            const totalLow = mod.submodules.reduce((a, s) => a + s.low, 0);
            // Pie chart geometry (match your chart size)
            const pieCenterX = 128;
            const pieCenterY = 128;
            const pieRadius = 100;
            const cardOffset = 60;
            const totalSegments = modules.length;
            const idx = hoveredModuleIdx ?? 0;
            const segmentAngle = 360 / totalSegments;
            const angle = (idx + 0.5) * segmentAngle - 90;
            const rad = (angle * Math.PI) / 180;
            const cardX = pieCenterX + (pieRadius + cardOffset) * Math.cos(rad);
            const cardY = pieCenterY + (pieRadius + cardOffset) * Math.sin(rad);
            const svgWidth = 256; // w-64 = 256px
            const cardStyle = {
              left: pieCenterX + pieRadius + 48,
              top: pieCenterY,
              transform: 'translateY(-50%)',
              minWidth: 340,
              position: 'absolute',
            };
                return (
              <div
                className="absolute z-30 w-[340px] bg-white rounded-xl shadow-xl border border-gray-100 p-5 animate-fade-in"
                style={cardStyle}
                onMouseEnter={() => {
                  setIsModuleCardHovered(true);
                }}
                onMouseLeave={() => {
                  setIsModuleCardHovered(false);
                  setHoveredModuleIdx(null);
                }}
                onMouseDown={() => setModuleDetailModal({ open: true, mod, totalHigh, totalMed, totalLow })}
              >
                <div className="font-bold text-xl mb-1 text-gray-900">{mod.name} Module</div>
                <div className="mb-2 text-gray-600 text-sm">{mod.value} defects ({mod.percent}%)</div>
                <table className="min-w-full text-sm mb-2 border border-gray-200 divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-1 px-2 font-semibold text-gray-700 border-b border-gray-200">Submodule</th>
                      <th className="text-center py-1 px-2 font-semibold text-red-600 border-b border-gray-200">High</th>
                      <th className="text-center py-1 px-2 font-semibold text-orange-500 border-b border-gray-200">Med</th>
                      <th className="text-center py-1 px-2 font-semibold text-green-600 border-b border-gray-200">Low</th>
                      <th className="text-center py-1 px-2 font-semibold text-gray-700 border-b border-gray-200">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mod.submodules.map((sub: any, idx: number) => (
                      <tr key={sub.name} className="border-b border-gray-200">
                        <td className="py-1 px-2 text-gray-800">{sub.name}</td>
                        <td className="py-1 px-2 text-center text-red-600 font-semibold">{sub.high}</td>
                        <td className="py-1 px-2 text-center text-orange-500 font-semibold">{sub.med}</td>
                        <td className="py-1 px-2 text-center text-green-600 font-semibold">{sub.low}</td>
                        <td className="py-1 px-2 text-center text-gray-900 font-semibold">{sub.high + sub.med + sub.low}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="mt-2 text-sm text-gray-700 font-semibold flex items-center gap-4">
                  <span>Module Total:</span>
                  <span className="text-red-600 font-bold">H: {totalHigh}</span>
                  <span className="text-orange-500 font-bold">M: {totalMed}</span>
                  <span className="text-green-600 font-bold">L: {totalLow}</span>
                </div>
              </div>
            );
          })()}
            </div>
        <ul className="space-y-2 mt-8 w-full max-w-xs mx-auto">
          {[
            { name: 'Authentication', value: 12, color: '#4285F4', percent: 34 },
            { name: 'Payment', value: 8, color: '#10b981', percent: 23 },
            { name: 'User Management', value: 6, color: '#fbbf24', percent: 17 },
            { name: 'Reporting', value: 4, color: '#ef4444', percent: 11 },
            { name: 'Dashboard', value: 3, color: '#a259f7', percent: 9 },
            { name: 'Settings', value: 2, color: '#06b6d4', percent: 6 },
          ].map((mod, idx) => (
            <li key={mod.name} className="flex items-center justify-between text-base">
              <div className="flex items-center gap-3">
                <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: mod.color }}></span>
                <span className="text-gray-700">{mod.name}</span>
      </div>
              <div className="flex items-center gap-1">
                <span className="text-gray-900 font-semibold">{mod.value}</span>
                <span className="text-gray-400 text-sm">({mod.percent}%)</span>
            </div>
            </li>
          ))}
        </ul>
       
       
      </div>
      {/* Module Detail Modal */}
      {moduleDetailModal?.open && (
        <Modal isOpen={moduleDetailModal.open} onClose={() => setModuleDetailModal(null)} title={moduleDetailModal.mod.name + ' Module Details'}>
          <div className="p-6">
            <div className="font-bold text-2xl mb-2 text-gray-900">{moduleDetailModal.mod.name} Module</div>
            <div className="mb-4 text-gray-600 text-lg">{moduleDetailModal.mod.value} defects ({moduleDetailModal.mod.percent}%)</div>
            <table className="min-w-full text-base mb-4 border border-gray-200 divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-2 px-3 font-semibold text-gray-700 border-b border-gray-200">Submodule</th>
                  <th className="text-center py-2 px-3 font-semibold text-red-600 border-b border-gray-200">High</th>
                  <th className="text-center py-2 px-3 font-semibold text-orange-500 border-b border-gray-200">Med</th>
                  <th className="text-center py-2 px-3 font-semibold text-green-600 border-b border-gray-200">Low</th>
                  <th className="text-center py-2 px-3 font-semibold text-gray-700 border-b border-gray-200">Total</th>
                </tr>
              </thead>
              <tbody>
                {moduleDetailModal.mod.submodules.map((sub: any, idx: number) => (
                  <tr key={sub.name} className="border-b border-gray-200">
                    <td className="py-2 px-3 text-gray-800">{sub.name}</td>
                    <td className="py-2 px-3 text-center text-red-600 font-semibold">{sub.high}</td>
                    <td className="py-2 px-3 text-center text-orange-500 font-semibold">{sub.med}</td>
                    <td className="py-2 px-3 text-center text-green-600 font-semibold">{sub.low}</td>
                    <td className="py-2 px-3 text-center text-gray-900 font-semibold">{sub.high + sub.med + sub.low}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-4 text-lg text-gray-700 font-semibold flex items-center gap-6">
              <span>Module Total:</span>
              <span className="text-red-600 font-bold">H: {moduleDetailModal.totalHigh}</span>
              <span className="text-orange-500 font-bold">M: {moduleDetailModal.totalMed}</span>
              <span className="text-green-600 font-bold">L: {moduleDetailModal.totalLow}</span>
            </div>
          </div>
        </Modal>
      )}
      {/* Reopened Defects Detail Modal */}
      {reopenedDetailModal?.open && (
        <Modal isOpen={reopenedDetailModal.open} onClose={() => setReopenedDetailModal(null)} title={`Defects Reopened ${reopenedDetailModal.label}`} size="xl">
          <div className="p-6" style={{ minHeight: 400, maxHeight: 600, overflowY: 'auto' }}>
            <div className="font-bold text-2xl mb-2 text-gray-900">Defects Reopened {reopenedDetailModal.label}</div>
            <table className="min-w-full text-base mb-4 border border-gray-200 divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-2 px-3 font-semibold text-gray-700 border-b border-gray-200">ID</th>
                  <th className="text-left py-2 px-3 font-semibold text-gray-700 border-b border-gray-200">Title</th>
                  <th className="text-left py-2 px-3 font-semibold text-gray-700 border-b border-gray-200">Assignee</th>
                  <th className="text-left py-2 px-3 font-semibold text-gray-700 border-b border-gray-200">Reporter</th>
                  <th className="text-left py-2 px-3 font-semibold text-gray-700 border-b border-gray-200">Release</th>
                </tr>
              </thead>
              <tbody>
                {reopenedDetailModal.defects.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-4">No defects</td></tr>
                ) : (
                  reopenedDetailModal.defects.map((defect: any, idx: number) => (
                    <tr key={defect.id || idx} className="border-b border-gray-200">
                      <td className="py-2 px-3 text-blue-700 font-semibold cursor-pointer hover:underline">{defect.id}</td>
                      <td className="py-2 px-3">{defect.title}</td>
                      <td className="py-2 px-3">{defect.assignee}</td>
                      <td className="py-2 px-3">{defect.reporter}</td>
                      <td className="py-2 px-3">{defect.release}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Modal>
      )}
    </>
  );
};

export default Dashboard;

function DefectDensityMeter({ kloc, defectCount }: { kloc: number, defectCount: number }) {
  const density = kloc > 0 ? defectCount / kloc : 0;
  const min = 0, max = 20;
  const percent = Math.min(Math.max(density, min), max) / max;
  // Cap angle between 0deg (left) and 180deg (right)
  // 0 = leftmost, 10 = center, 20 = rightmost
  const angle = Math.max(0, Math.min(180, (density / max) * 180));
  const needleRef = useRef<SVGPolygonElement>(null);

  useEffect(() => {
    if (needleRef.current) {
      needleRef.current.style.transition = 'transform 0.7s cubic-bezier(0.4,0,0.2,1)';
      needleRef.current.style.transform = `rotate(${angle}deg)`;
    }
  }, [angle]);

  // Color zones
  const getZoneColor = (val: number) => {
    if (val <= 7) return '#22c55e'; // green
    if (val <= 10) return '#facc15'; // yellow
    return '#ef4444'; // red
  };
  const zoneColor = getZoneColor(density);

  return (
    <div className="flex flex-col items-center">
      <div className="text-lg font-semibold mb-1 text-center">Defect Density : <span className="ml-2 font-extrabold" style={{ color: zoneColor }}>{density.toFixed(2)}</span></div>
      <div >
        <div className="relative w-64 h-36 flex items-end justify-center">
          <svg viewBox="0 0 200 100" className="w-full h-full">
            <defs>
              <linearGradient id="gauge-gradient" x1="0%" y1="100%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#22c55e" />
                <stop offset="35%" stopColor="#22c55e" />
                <stop offset="35%" stopColor="#facc15" />
                <stop offset="50%" stopColor="#facc15" />
                <stop offset="50%" stopColor="#ef4444" />
                <stop offset="100%" stopColor="#ef4444" />
              </linearGradient>
            </defs>
            {/* Gauge background */}
            <path d="M20,100 A80,80 0 0,1 180,100" fill="none" stroke="#e5e7eb" strokeWidth="18" />
            {/* Single arc with hard color stops for green, yellow, red */}
            <path d="M36,100 A64,64 0 0,1 164,100" fill="none" stroke="url(#gauge-gradient)" strokeWidth="12" />
            {/* Sharp Needle Pointer */}
            <g style={{ transform: 'rotate(0deg)', transformOrigin: '100px 100px' }}>
              <polygon
                ref={needleRef}
                points="100,40 98,100 102,100"
                fill="#334155"
                style={{ transform: `rotate(${angle}deg)`, transformOrigin: '100px 100px', transition: 'transform 0.7s cubic-bezier(0.4,0,0.2,1)' }}
              />
            </g>
            {/* Center dot */}
            <circle cx="100" cy="100" r="7" fill="#334155" />
            {/* Tick marks */}
            <text x="21" y="95" fontSize="12" fill="#64748b">0</text>
            <text x="100" y="25" fontSize="12" fill="#64748b" textAnchor="middle">10</text>
            <text x="185" y="95" fontSize="12" fill="#64748b" textAnchor="end">20</text>
          </svg>
          </div>
      </div>
    </div>
  );
}

// Utility function to darken a hex color
function darkenColor(hex, amt) {
  let col = hex.replace('#', '');
  if (col.length === 3) col = col.split('').map(x => x + x).join('');
  let num = parseInt(col, 16);
  let r = Math.max(0, (num >> 16) - Math.round(255 * amt));
  let g = Math.max(0, ((num >> 8) & 0x00FF) - Math.round(255 * amt));
  let b = Math.max(0, (num & 0x0000FF) - Math.round(255 * amt));
  return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;

};

// [Rest of the component code remains the same]