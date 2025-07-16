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
  const [kloc, setKloc] = useState(1);
  const navigate = useNavigate();
  const [reopenModal, setReopenModal] = useState<{ open: boolean; label: string; defects: any[] }>({ open: false, label: '', defects: [] });
  const [riskFilter, setRiskFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [pieModal, setPieModal] = useState<{ open: boolean; severity: string | null }>({ open: false, severity: null });
  const [reopenedHoveredIdx, setReopenedHoveredIdx] = useState<number | null>(null);
  const reopenedChartRef = useRef<any>(null);
  const [isOverlayHovered, setIsOverlayHovered] = useState(false);
  const [hoveredModuleIdx, setHoveredModuleIdx] = useState<number | null>(null);
  const [isModuleCardHovered, setIsModuleCardHovered] = useState(false);

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
        <div className="max-w-5xl mx-auto text-center mt-12 mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard Overview</h1>
          <p className="text-gray-600 text-lg">Monitor project health and status at a glance</p>
        </div>
        {/* Section: Project Health Summary */}
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 text-left">Project Health Summary</h2>
          {/* Add a border to each Project Health Summary card, matching the status color */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {/* Critical Projects */}
            <div className="bg-gradient-to-br from-red-200 to-red-50 rounded-xl shadow flex items-center p-6 min-h-[140px] border-2 border-red-200 transition-transform hover:scale-105 hover:shadow-lg focus-within:ring-2 focus-within:ring-red-300 group" tabIndex={0} aria-label="Critical Projects">
              <span className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-red-300 to-red-100 mr-4">
                <User className="w-8 h-8 text-red-500" />
              </span>
              <div>
                <div className="text-gray-700 font-medium">Critical Projects</div>
                <div className="text-3xl font-bold text-red-600 mt-1">{immediateAttentionProjects.length}</div>
              </div>
            </div>
            {/* At Risk Projects */}
            <div className="bg-gradient-to-br from-yellow-200 to-yellow-50 rounded-xl shadow flex items-center p-6 min-h-[140px] border-2 border-yellow-200 transition-transform hover:scale-105 hover:shadow-lg focus-within:ring-2 focus-within:ring-yellow-300 group" tabIndex={0} aria-label="At Risk Projects">
              <span className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-100 mr-4">
                <Calendar className="w-8 h-8 text-yellow-500" />
              </span>
              <div>
                <div className="text-gray-700 font-medium">At Risk Projects</div>
                <div className="text-3xl font-bold text-yellow-600 mt-1">{behindScheduleProjects.length}</div>
              </div>
            </div>
            {/* Healthy Projects */}
            <div className="bg-gradient-to-br from-green-200 to-green-50 rounded-xl shadow flex items-center p-6 min-h-[140px] border-2 border-green-200 transition-transform hover:scale-105 hover:shadow-lg focus-within:ring-2 focus-within:ring-green-300 group" tabIndex={0} aria-label="Healthy Projects">
              <span className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-green-300 to-green-100 mr-4">
                <TrendingUp className="w-8 h-8 text-green-500" />
              </span>
              <div>
                <div className="text-gray-700 font-medium">Healthy Projects</div>
                <div className="text-3xl font-bold text-green-600 mt-1">{performingWellProjects.length}</div>
              </div>
            </div>
                </div>
              </div>
        {/* Divider */}
        <hr className="my-10 border-gray-200 max-w-5xl mx-auto" />
        {/* Section: All Projects */}
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <h2 className="text-2xl font-bold text-gray-900">All Projects</h2>
            
              </div>
          {/* Filter Bar */}
          <div className="flex items-center gap-3 mb-8">
            <span className="text-gray-700 font-medium mr-2">Filter by severity:</span>
            <button
              className={`px-4 py-2 rounded-lg font-semibold transition focus:outline-none ${riskFilter === 'all' ? 'bg-gray-300 text-gray-900' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'}`}
              onClick={() => setRiskFilter('all')}
            >
              All Projects
            </button>
            <button
              className={`px-4 py-2 rounded-lg font-semibold transition focus:outline-none ${riskFilter === 'high' ? 'bg-red-100 text-red-700' : 'bg-red-50 text-red-700 hover:bg-red-100'}`}
              onClick={() => setRiskFilter('high')}
            >
              High Risk
            </button>
            <button
              className={`px-4 py-2 rounded-lg font-semibold transition focus:outline-none ${riskFilter === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-yellow-50 text-yellow-800 hover:bg-yellow-100'}`}
              onClick={() => setRiskFilter('medium')}
            >
              Medium Risk
            </button>
            <button
              className={`px-4 py-2 rounded-lg font-semibold transition focus:outline-none ${riskFilter === 'low' ? 'bg-green-100 text-green-700' : 'bg-green-50 text-green-700 hover:bg-green-100'}`}
              onClick={() => setRiskFilter('low')}
            >
              Low Risk
            </button>
            </div>
          {/* Project Cards Grid */}
          <div className="flex flex-wrap gap-8 justify-center py-6">
            {projects.map((project, idx) => {
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
            })}
              </div>
            </div>
      </>
    );
  }

  // Show widgets for selected project
  return (
    <>
      <div className="max-w-6xl mx-auto px-4 pt-8">
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
        {/* KLOC and Total Defects Controls - now under project card */}
        {selectedProject && (
          <div className="flex justify-end mb-2">
            <div className="flex gap-4 items-center">
                <div className="flex items-center gap-2">
                  <label className="block text-sm font-medium text-gray-700" htmlFor="kloc-input">KLOC</label>
                  <input
                    id="kloc-input"
                    type="number"
                    min={1}
                    className="w-20 px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                    value={kloc}
                    onChange={e => setKloc(Number(e.target.value) || 1)}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="block text-sm font-medium text-gray-700">Total Defects</span>
                  <input
                    type="text"
                    className="w-20 px-3 py-1 border border-gray-300 rounded-lg bg-gray-50 text-center cursor-not-allowed"
                    value={projectDefects.length}
                    readOnly
                    tabIndex={-1}
                  />
                </div>
            </div>
          </div>
        )}
        {/* Defect Severity Breakdown */}
        <div className="mb-14">
          <h2 className="text-lg font-semibold mb-3 text-gray-600">Defect Severity Breakdown</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {['high', 'medium', 'low'].map(severity => {
              const severityLabel = `Defects on ${severity.charAt(0).toUpperCase() + severity.slice(1)}`;
              const colorMap = {
                high: 'border-l-4 border-red-500',
                medium: 'border-l-4 border-yellow-400',
                low: 'border-l-4 border-green-500',
              };
              const titleColor = {
                high: 'text-red-500',
                medium: 'text-yellow-500',
                low: 'text-green-500',
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
        <div className="mb-16 grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {/* Defect Density Card */}
          <div className="bg-white rounded-xl shadow flex flex-col p-6 h-full">
            <h2 className="text-lg font-semibold mb-3 text-gray-700">Defect Density</h2>
            <div className="flex-1 flex flex-col justify-center">
              <DefectDensityMeter kloc={kloc} defectCount={projectDefects.length} />
            </div>
          </div>
          {/* Defect Severity Index Card */}
          <div className="bg-white rounded-xl shadow flex flex-col p-6 h-full">
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
          <div className="bg-white rounded-xl shadow flex flex-col p-6 h-full">
            <h2 className="text-lg font-semibold mb-3 text-gray-700">Defect to Remark Ratio</h2>
            <div className="flex-1 flex flex-col items-center justify-center">
              <DefectToRemarkRatio defectCount={projectDefects.length} remarkCount={150} />
            </div>
          </div>
        </div>
        {/* Defects Reopened Multiple Times & Defect Distribution by Type Row */}
        <div className="mb-10 flex flex-col md:flex-row gap-8 items-stretch">
          {/* Defects Reopened Multiple Times Pie Chart */}
          <div className="flex-1 bg-white rounded-2xl shadow p-6 flex flex-col relative">
            <h2 className="text-xl font-bold mb-4 text-gray-900">Defects Reopened Multiple Times</h2>
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
              // Chart.js Pie hover handler
              const pieOptions = {
                plugins: { legend: { display: false } },
                onHover: (event: any, elements: any[]) => {
                  if (elements && elements.length > 0) {
                    setReopenedHoveredIdx(elements[0].index);
                  } else {
                    setReopenedHoveredIdx(null);
                  }
                },
                onClick: undefined,
                // hover: { mode: 'index', intersect: true }, // Removed to fix linter error
              };
              // Calculate percentage for hovered segment
              const total = data.datasets[0].data.reduce((a, b) => a + b, 0);
              const hoveredCount = reopenedHoveredIdx !== null ? data.datasets[0].data[reopenedHoveredIdx] : 0;
              const hoveredPct = reopenedHoveredIdx !== null && total > 0 ? ((hoveredCount / total) * 100).toFixed(1) : null;
              return (
                <div
                  className="flex flex-col items-center justify-center relative"
                  onMouseEnter={() => setIsOverlayHovered(true)}
                  onMouseLeave={() => { setIsOverlayHovered(false); setReopenedHoveredIdx(null); }}
                >
                  <div className="w-64 h-64">
                    <ChartJSPie ref={reopenedChartRef} data={data} options={pieOptions} />
                  </div>
                  {/* Floating hover detail card */}
                  {(reopenedHoveredIdx !== null || isOverlayHovered) && (
                    <div
                      className="absolute left-1/2 top-8 z-20 w-[420px] -translate-x-1/2 bg-white rounded-xl shadow-lg border border-gray-200 p-6 animate-fade-in"
                      onMouseEnter={() => setIsOverlayHovered(true)}
                      onMouseLeave={() => setIsOverlayHovered(false)}
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
                          {defectBuckets[(reopenedHoveredIdx ?? 0)].length === 0 ? (
                            <tr><td colSpan={5} className="text-center py-4">No defects</td></tr>
                          ) : (
                            defectBuckets[(reopenedHoveredIdx ?? 0)].map((defect, idx) => (
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
                  )}
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
            <h2 className="text-xl font-bold mb-4 text-gray-900">Defect Distribution by Type</h2>
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
        <div className="mb-10 flex flex-col md:flex-row gap-8 items-stretch">
          {/* Time to Find Defects */}
          <div className="flex-1 bg-white rounded-2xl shadow p-6 flex flex-col">
            <h2 className="text-xl font-bold mb-4 text-gray-900">Time to Find Defects</h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={[
                  { week: 'Week 1', hours: 8.7 },
                  { week: 'Week 2', hours: 7.2 },
                  { week: 'Week 3', hours: 9.1 },
                  { week: 'Week 4', hours: 6.5 },
                  { week: 'Week 5', hours: 5.9 },
                  { week: 'Week 6', hours: 7.4 },
                  { week: 'Week 7', hours: 6.2 },
                  { week: 'Week 8', hours: 5.9 },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis domain={[0, 12]} tickFormatter={v => v} label={{ value: 'Hours', angle: -90, position: 'insideLeft', offset: 10 }} />
                  <Tooltip formatter={v => `${v}h`} />
                  <Line type="monotone" dataKey="hours" stroke="#2563eb" strokeWidth={3} dot={{ r: 5, stroke: '#2563eb', strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 7 }} />
                </LineChart>
              </ResponsiveContainer>
                </div>
            <div className="flex flex-col md:flex-row gap-4 mt-6">
              <div className="flex-1 bg-blue-50 rounded-xl p-4 flex flex-col items-center">
                <span className="text-base font-semibold text-blue-600">Average</span>
                <span className="text-2xl font-bold text-blue-700 mt-1">7.1h</span>
              </div>
              <div className="flex-1 bg-green-50 rounded-xl p-4 flex flex-col items-center">
                <span className="text-base font-semibold text-green-600">Best</span>
                <span className="text-2xl font-bold text-green-700 mt-1">5.8h</span>
            </div>
              <div className="flex-1 bg-red-50 rounded-xl p-4 flex flex-col items-center">
                <span className="text-base font-semibold text-red-600">Worst</span>
                <span className="text-2xl font-bold text-red-700 mt-1">9.1h</span>
              </div>
            </div>
                </div>
          {/* Time to Fix Defects */}
          <div className="flex-1 bg-white rounded-2xl shadow p-6 flex flex-col">
            <h2 className="text-xl font-bold mb-4 text-gray-900">Time to Fix Defects</h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={[
                  { week: 'Week 1', hours: 12.3 },
                  { week: 'Week 2', hours: 10.5 },
                  { week: 'Week 3', hours: 14.1 },
                  { week: 'Week 4', hours: 9.7 },
                  { week: 'Week 5', hours: 8.8 },
                  { week: 'Week 6', hours: 10.6 },
                  { week: 'Week 7', hours: 9.2 },
                  { week: 'Week 8', hours: 8.8 },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis domain={[0, 16]} tickFormatter={v => v} label={{ value: 'Hours', angle: -90, position: 'insideLeft', offset: 10 }} />
                  <Tooltip formatter={v => `${v}h`} />
                  <Line type="monotone" dataKey="hours" stroke="#10b981" strokeWidth={3} dot={{ r: 5, stroke: '#10b981', strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 7 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-col md:flex-row gap-4 mt-6">
              <div className="flex-1 bg-green-50 rounded-xl p-4 flex flex-col items-center">
                <span className="text-base font-semibold text-green-600">Average</span>
                <span className="text-2xl font-bold text-green-700 mt-1">10.6h</span>
              </div>
              <div className="flex-1 bg-blue-50 rounded-xl p-4 flex flex-col items-center">
                <span className="text-base font-semibold text-blue-600">Best</span>
                <span className="text-2xl font-bold text-blue-700 mt-1">8.8h</span>
              </div>
              <div className="flex-1 bg-red-50 rounded-xl p-4 flex flex-col items-center">
                <span className="text-base font-semibold text-red-600">Worst</span>
                <span className="text-2xl font-bold text-red-700 mt-1">14.1h</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* More widgets (3-9) will go here */}
      </div>
      {/* Move the 'Defects by Module' section to the end of the dashboard widgets, after all other main sections. */}
      <div className="mb-10 bg-white rounded-2xl shadow p-6 flex flex-col items-center">
        <h2 className="text-xl font-bold mb-4 text-gray-900">Defects by Module</h2>
        <div className="relative w-64 h-64 mx-auto"
          onMouseLeave={() => { if (!isModuleCardHovered) setHoveredModuleIdx(null); }}
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
                outerRadius={100}
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
                  <Cell key={`cell-${idx}`} fill={entry.color} />
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
            return (
              <div
                className="absolute left-1/2 top-1/2 z-30 w-[340px] -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-xl border border-gray-100 p-5 animate-fade-in"
                onMouseEnter={() => setIsModuleCardHovered(true)}
                onMouseLeave={() => { setIsModuleCardHovered(false); setHoveredModuleIdx(null); }}
              >
                <div className="font-bold text-xl mb-1 text-gray-900">{mod.name} Module</div>
                <div className="mb-3 text-gray-600 text-sm">{mod.value} defects ({mod.percent}%)</div>
                <table className="min-w-full text-sm mb-2">
                  <thead>
                    <tr>
                      <th className="text-left py-1 px-2 font-semibold text-gray-700">Submodule</th>
                      <th className="text-center py-1 px-2 font-semibold text-red-600">High</th>
                      <th className="text-center py-1 px-2 font-semibold text-orange-500">Med</th>
                      <th className="text-center py-1 px-2 font-semibold text-green-600">Low</th>
                      <th className="text-center py-1 px-2 font-semibold text-gray-700">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mod.submodules.map((sub, idx) => (
                      <tr key={sub.name}>
                        <td className="py-1 px-2 text-gray-800">{sub.name}</td>
                        <td className="py-1 px-2 text-center text-red-600 font-semibold">{sub.high}</td>
                        <td className="py-1 px-2 text-center text-orange-500 font-semibold">{sub.med}</td>
                        <td className="py-1 px-2 text-center text-green-600 font-semibold">{sub.low}</td>
                        <td className="py-1 px-2 text-center text-gray-800">{sub.high + sub.med + sub.low}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="mt-2 text-sm text-gray-700 font-medium flex items-center gap-4">
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
        <hr className="my-8 w-full border-gray-200" />
        <div className="text-sm text-gray-500">
          Total: 35 defects across 6 modules
        </div>
        <div className="text-xs text-gray-400 mt-1">Hover over chart segments to view submodule breakdown with severity levels</div>
      </div>
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
      <div className="text-lg font-semibold mb-2 text-center">Defect Density : <span className="ml-2 font-extrabold" style={{ color: zoneColor }}>{density.toFixed(2)}</span></div>
      <div >
        <div className="relative w-64 h-36 flex items-end justify-center">
          <svg viewBox="0 0 200 100" className="w-full h-full">
            <defs>
              <linearGradient id="gauge-gradient" x1="0%" y1="100%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#22c55e" />
                <stop offset="35%" stopColor="#22c55e" />
                <stop offset="50%" stopColor="#facc15" />
                <stop offset="70%" stopColor="#ef4444" />
                <stop offset="100%" stopColor="#ef4444" />
              </linearGradient>
            </defs>
            {/* Gauge background */}
            <path d="M20,100 A80,80 0 0,1 180,100" fill="none" stroke="#e5e7eb" strokeWidth="18" />
            {/* Continuous gradient arc */}
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
            <text x="20" y="95" fontSize="12" fill="#64748b">0</text>
            <text x="100" y="22" fontSize="12" fill="#64748b" textAnchor="middle">10</text>
            <text x="180" y="95" fontSize="12" fill="#64748b" textAnchor="end">20</text>
          </svg>
        </div>
      </div>
    </div>
  );
}