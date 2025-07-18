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
import { getDefectSeveritySummary } from '../api/dashboard/dash_get';
import { getAllDefectStatuses, DefectStatus } from '../api/defectStatus';
import { getDefectTypeByProjectId } from '../api/dashboard/defecttype';
import { getDefectRemarkRatioByProjectId } from '../api/dashboard/remarkratio';
import { getDefectSeverityIndex } from '../api/dashboard/dsi';
import { getDefectDensity } from '../api/KLOC/getKLOC';
ChartJS.register(ArcElement, ChartTooltip, ChartLegend);

export const Dashboard: React.FC = () => {
  const { defects, projects } = useApp();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  // Remove KLOC state from dashboard, always read from backend
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
  // Add state for defect severity summary from API
  const [defectSeveritySummary, setDefectSeveritySummary] = useState<any>(null);
  const [loadingSeveritySummary, setLoadingSeveritySummary] = useState(false);
  const [severitySummaryError, setSeveritySummaryError] = useState<string | null>(null);
  // Local state for status types
  const [statusTypes, setStatusTypes] = useState<DefectStatus[]>([]);
  const [loadingStatusTypes, setLoadingStatusTypes] = useState(true);
  const [statusTypesError, setStatusTypesError] = useState<string | null>(null);
  // State for defect type distribution
  const [defectTypeData, setDefectTypeData] = useState<{ labels: string[]; counts: number[]; percentages?: number[]; total?: number; mostCommon?: string; mostCount?: number; } | null>(null);
  const [loadingDefectType, setLoadingDefectType] = useState(false);
  const [defectTypeError, setDefectTypeError] = useState<string | null>(null);
  // State for defect to remark ratio
  const [remarkRatioData, setRemarkRatioData] = useState<{ defectCount: number; remarkCount: number } | null>(null);
  const [loadingRemarkRatio, setLoadingRemarkRatio] = useState(false);
  const [remarkRatioError, setRemarkRatioError] = useState<string | null>(null);
  const [dsi, setDsi] = useState<string | null>(null);
  const [loadingDsi, setLoadingDsi] = useState(false);
  const [dsiError, setDsiError] = useState<string | null>(null);
  // Remove KLOC state from dashboard, always read from backend
  const [defectDensity, setDefectDensity] = useState<{ kloc: number; defectCount: number; defectDensity?: number } | null>(null);
  const [loadingDefectDensity, setLoadingDefectDensity] = useState(false);
  const [defectDensityError, setDefectDensityError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedProjectId) {
      setDefectSeveritySummary(null);
      setDsi(null);
      return;
    }
    setLoadingSeveritySummary(true);
    setSeveritySummaryError(null);
    const numericProjectId = String(selectedProjectId).replace(/\D/g, '');
    getDefectSeveritySummary(numericProjectId)
      .then((apiData) => {
        // Map API data to UI format
        const summary = { high: { statusCounts: {}, total: 0 }, medium: { statusCounts: {}, total: 0 }, low: { statusCounts: {}, total: 0 } };
        if (apiData && apiData.data && Array.isArray(apiData.data.defectSummary)) {
          apiData.data.defectSummary.forEach((item) => {
            const sev = item.severity.toLowerCase(); // 'high', 'medium', 'low'
            if (summary[sev]) {
              summary[sev].total = item.total;
              // Map statuses
              const statusCounts = {};
              Object.entries(item.statuses).forEach(([status, val]) => {
                statusCounts[status.toLowerCase()] = val.count;
              });
              summary[sev].statusCounts = statusCounts;
            }
          });
        }
        setDefectSeveritySummary(summary);
        setLoadingSeveritySummary(false);
      })
      .catch((err) => {
        setSeveritySummaryError('Failed to load defect severity summary');
        setLoadingSeveritySummary(false);
      });
  }, [selectedProjectId]);

  useEffect(() => {
    if (!selectedProjectId) {
      setDsi(null);
      setDsiError(null);
      return;
    }
    setLoadingDsi(true);
    setDsiError(null);
    getDefectSeverityIndex(selectedProjectId)
      .then((data) => {
        // Extract dsiPercentage from backend response
        let value = data?.data?.dsiPercentage ?? null;
        if (typeof value === 'number') value = value.toFixed(2);
        setDsi(value?.toString() ?? null);
        setLoadingDsi(false);
      })
      .catch((err) => {
        setDsiError('Failed to load Defect Severity Index');
        setDsi(null);
        setLoadingDsi(false);
      });
  }, [selectedProjectId]);

  // Fetch status types from backend
  useEffect(() => {
    setLoadingStatusTypes(true);
    setStatusTypesError(null);
    getAllDefectStatuses()
      .then((res) => {
        if (res && res.data) {
          setStatusTypes(res.data);
        } else {
          setStatusTypes([]);
        }
        setLoadingStatusTypes(false);
      })
      .catch((err) => {
        setStatusTypesError('Failed to load status types');
        setStatusTypes([]);
        setLoadingStatusTypes(false);
      });
  }, []);

  useEffect(() => {
    if (!selectedProjectId) {
      setDefectTypeData(null);
      return;
    }
    setLoadingDefectType(true);
    setDefectTypeError(null);
    getDefectTypeByProjectId(selectedProjectId)
      .then((res) => {
        // Support new backend structure: res.data.defectTypes is an array
        if (res?.data?.defectTypes && Array.isArray(res.data.defectTypes)) {
          setDefectTypeData({
            labels: res.data.defectTypes.map((d: any) => d.defectType),
            counts: res.data.defectTypes.map((d: any) => d.defectCount),
            percentages: res.data.defectTypes.map((d: any) => d.percentage),
            total: res.data.totalDefectCount,
            mostCommon: res.data.mostCommonDefectType,
            mostCount: res.data.mostCommonDefectCount,
          });
        } else if (Array.isArray(res?.data)) {
          setDefectTypeData({
            labels: res.data.map((d: any) => d.type),
            counts: res.data.map((d: any) => d.count),
          });
        } else if (res?.labels && res?.counts) {
          setDefectTypeData({ labels: res.labels, counts: res.counts });
        } else {
          setDefectTypeData(null);
          setDefectTypeError('Invalid defect type data');
        }
        setLoadingDefectType(false);
      })
      .catch(() => {
        setDefectTypeError('Failed to load defect type distribution');
        setDefectTypeData(null);
        setLoadingDefectType(false);
      });
  }, [selectedProjectId]);

  useEffect(() => {
    if (!selectedProjectId) {
      setRemarkRatioData(null);
      return;
    }
    setLoadingRemarkRatio(true);
    setRemarkRatioError(null);
    getDefectRemarkRatioByProjectId(selectedProjectId)
      .then((res) => {
        // Support numeric fields or string ratio like 'remarks:defects': '20:1'
        if (res?.data && typeof res.data.defectCount === 'number' && typeof res.data.remarkCount === 'number') {
          setRemarkRatioData({ defectCount: res.data.defectCount, remarkCount: res.data.remarkCount });
        } else if (typeof res.defectCount === 'number' && typeof res.remarkCount === 'number') {
          setRemarkRatioData({ defectCount: res.defectCount, remarkCount: res.remarkCount });
        } else if (res?.data && typeof res.data['remarks:defects'] === 'string') {
          // Parse the string, e.g., '20:1' (remarks:defects)
          const [remarks, defects] = res.data['remarks:defects'].split(':').map(Number);
          if (!isNaN(remarks) && !isNaN(defects)) {
            setRemarkRatioData({ defectCount: remarks, remarkCount: defects });
          } else {
            setRemarkRatioData(null);
            setRemarkRatioError('Invalid defect to remark ratio data');
          }
        } else {
          setRemarkRatioData(null);
          setRemarkRatioError('Invalid defect to remark ratio data');
        }
        setLoadingRemarkRatio(false);
      })
      .catch(() => {
        setRemarkRatioError('Failed to load defect to remark ratio');
        setRemarkRatioData(null);
        setLoadingRemarkRatio(false);
      });
  }, [selectedProjectId]);

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

  useEffect(() => {
    if (!selectedProjectId) {
      setDefectDensity(null);
      return;
    }
    setLoadingDefectDensity(true);
    setDefectDensityError(null);
    const numericProjectId = String(selectedProjectId).replace(/\D/g, '');
    getDefectDensity(numericProjectId)
      .then((apiData) => {
        // Use correct backend fields
        if (apiData && apiData.data) {
          setDefectDensity({
            kloc: apiData.data.kloc,
            defectCount: apiData.data.defects,
            defectDensity: apiData.data.defectDensity, // optional, for direct display
          });
        } else {
          setDefectDensity({ kloc: 1, defectCount: 0, defectDensity: 0 });
        }
        setLoadingDefectDensity(false);
      })
      .catch((err) => {
        setDefectDensityError('Failed to load defect density');
        setDefectDensity({ kloc: 1, defectCount: 0, defectDensity: 0 });
        setLoadingDefectDensity(false);
      });
  }, [selectedProjectId]);

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
        {/* Defect Severity Breakdown */}
        <div className="mb-14">
          <h2 className="text-lg font-semibold mb-3 text-gray-600">Defect Severity Breakdown</h2>
          {(loadingSeveritySummary || loadingStatusTypes) && <div className="text-gray-500 p-4">Loading...</div>}
          {(severitySummaryError || statusTypesError) && <div className="text-red-500 p-4">{severitySummaryError || statusTypesError}</div>}
          {!loadingSeveritySummary && !loadingStatusTypes && !severitySummaryError && !statusTypesError && defectSeveritySummary && statusTypes.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {['high', 'medium', 'low'].map(severity => {
                // Only use API data for rendering
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
                // Use backend status types for columns
                const statusList = statusTypes.map(s => s.defectStatusName.toLowerCase());
                const statusColorMap = Object.fromEntries(statusTypes.map(s => [s.defectStatusName.toLowerCase(), s.colorCode]));
                const summary = defectSeveritySummary[severity] || { statusCounts: {}, total: 0 };
                const total = summary.total || 0;
                // Only use API data for status counts
                const statusCounts = statusList.map(status => summary.statusCounts?.[status] || 0);
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
                            <span className="text-gray-700 font-normal">{statusTypes[idx].defectStatusName}</span>
                            <span className="text-gray-700 font-medium">{statusCounts[idx]}</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex flex-col gap-1">
                        {rightStatuses.map((status, idx) => (
                          <div key={status} className="flex items-center gap-2 text-xs">
                            <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ backgroundColor: statusColorMap[status] }}></span>
                            <span className="text-gray-700 font-normal">{statusTypes[half + idx].defectStatusName}</span>
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
          )}
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
            {loadingDefectDensity ? (
              <div className="text-gray-500">Loading...</div>
            ) : defectDensityError ? (
              <div className="text-red-500">{defectDensityError}</div>
            ) : defectDensity ? (
              <DefectDensityMeter kloc={defectDensity.kloc} defectCount={defectDensity.defectCount} defectDensity={defectDensity.defectDensity} />
            ) : null}
          </div>
        </div>
      {/* Defect Severity Index Card */}
      <div className="bg-white rounded-xl shadow flex flex-col p-6 h-full border border-gray-200">
        <h2 className="text-lg font-semibold mb-3 text-gray-700">Defect Severity Index</h2>
        <div className="flex-1 flex flex-col items-center justify-center">
          {loadingDsi ? (
            <span className="text-gray-400">Loading...</span>
          ) : dsiError ? (
            <span className="text-red-500">{dsiError}</span>
          ) : (
            <>
              <span className="text-4xl font-bold text-orange-600 mb-2">{dsi ?? '0.00'}</span>
              <span className="text-gray-700 text-center">Weighted severity score (higher = more severe defects)</span>
            </>
          )}
        </div>
      </div>
      {/* Defect to Remark Ratio Card */}
      <div className="bg-white rounded-xl shadow flex flex-col p-6 h-full border border-gray-200">
        <h2 className="text-lg font-semibold mb-3 text-gray-700">Defect to Remark Ratio</h2>
        <div className="flex-1 flex flex-col items-center justify-center">
          {loadingRemarkRatio ? (
            <span className="text-gray-500">Loading...</span>
          ) : remarkRatioError ? (
            <span className="text-red-500">{remarkRatioError}</span>
          ) : remarkRatioData ? (
            <DefectToRemarkRatio defectCount={remarkRatioData.defectCount} remarkCount={remarkRatioData.remarkCount} />
          ) : (
            <span className="text-gray-400">No data available.</span>
          )}
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
        {loadingDefectType && <div className="text-gray-500 p-4">Loading...</div>}
        {defectTypeError && <div className="text-red-500 p-4">{defectTypeError}</div>}
        {!loadingDefectType && !defectTypeError && defectTypeData && Array.isArray(defectTypeData.labels) && Array.isArray(defectTypeData.counts) && defectTypeData.labels.length === defectTypeData.counts.length && defectTypeData.labels.length > 0 ? (() => {
          const labels = defectTypeData.labels;
          const counts = defectTypeData.counts;
          const percentages = defectTypeData.percentages || counts.map((c, i) => {
            const total = counts.reduce((a, b) => a + b, 0);
            return total > 0 ? (c / total) * 100 : 0;
          });
          const data = {
            labels,
            datasets: [
              {
                data: counts,
                backgroundColor: [
                  '#4285F4', // fallback colors
                  '#00B894',
                  '#FBBC05',
                  '#EA4335',
                  '#A259F7',
                  '#FF6F00',
                  '#8E24AA',
                  '#43A047',
                  '#F4511E',
                ].slice(0, labels.length),
              },
            ],
          };
          const total = defectTypeData.total || counts.reduce((a, b) => a + b, 0);
          const mostCommon = defectTypeData.mostCommon || (() => {
            let idx = 0, max = 0;
            counts.forEach((c, i) => { if (c > max) { max = c; idx = i; } });
            return labels[idx];
          })();
          const mostCount = defectTypeData.mostCount || Math.max(...counts);
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
                      <span className="text-gray-700">{type}: <span className="font-semibold">{counts[idx]}</span> <span className='text-gray-500'>({percentages[idx]?.toFixed(1)}%)</span></span>
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
                    <span className="text-xs text-gray-700 font-semibold">{mostCommon}</span>
                  </div>
                </div>
              </div>
            </>
          );
        })() : null}
        {!loadingDefectType && !defectTypeError && defectTypeData && (!Array.isArray(defectTypeData.labels) || !Array.isArray(defectTypeData.counts) || defectTypeData.labels.length !== defectTypeData.counts.length || defectTypeData.labels.length === 0) && (
          <div className="text-gray-400 p-4">No defect type data available.</div>
        )}
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
  </>
);
};

export default Dashboard;

function DefectDensityMeter({ kloc, defectCount, defectDensity }: { kloc: number, defectCount: number, defectDensity?: number }) {
  // Use backend defectDensity if provided, otherwise calculate
  const density = typeof defectDensity === 'number' ? defectDensity : (kloc > 0 ? defectCount / kloc : 0);
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
      <div className="text-lg font-semibold mb-1 text-center">Defect Density : <span className="ml-2 font-extrabold" style={{ color: zoneColor }}>{isNaN(density) ? '0.00' : density.toFixed(2)}</span></div>
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
}