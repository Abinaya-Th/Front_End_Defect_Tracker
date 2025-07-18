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
import { getDefectsByModule } from '../api/dashboard/defectbymodule';
import { getAllProjects } from '../api/projectget';
import { getProjectCardColor } from '../api/dashboard/projectCardColor';
import { getReopenCountSummary } from '../api/dashboard/Defectreopen';
ChartJS.register(ArcElement, ChartTooltip, ChartLegend);

export const Dashboard: React.FC = () => {
  // Remove projects from context for overview
  const { defects } = useApp();
  const [projects, setProjects] = useState<any[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [projectsError, setProjectsError] = useState<string | null>(null);
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
  const [defectsByModule, setDefectsByModule] = useState<any[]>([]);
  const [loadingDefectsByModule, setLoadingDefectsByModule] = useState(false);
  const [defectsByModuleError, setDefectsByModuleError] = useState<string | null>(null);
  const [projectColors, setProjectColors] = useState<{ [projectId: string]: string }>({});

  useEffect(() => {
    setLoadingProjects(true);
    setProjectsError(null);
    getAllProjects()
      .then((data) => {
        // Ensure we always set an array
        let arr: any[] = [];
        if (Array.isArray(data)) {
          arr = data;
        } else if (data && Array.isArray((data as any).data)) {
          arr = (data as any).data;
        }
        setProjects(arr);
        setLoadingProjects(false);
        // Fetch card color for each project
        arr.forEach((project) => {
          getProjectCardColor(project.id)
            .then((className) => {
              setProjectColors((prev) => ({ ...prev, [project.id]: className }));
            })
            .catch(() => {
              // fallback: do not set color
            });
        });
      })
      .catch((err) => {
        setProjectsError('Failed to load projects');
        setLoadingProjects(false);
      });
  }, []);
  const [reopenSummary, setReopenSummary] = useState<any[]>([]);
  const [loadingReopenSummary, setLoadingReopenSummary] = useState(false);
  const [reopenSummaryError, setReopenSummaryError] = useState<string | null>(null);

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

  useEffect(() => {
    if (!selectedProjectId) {
      setDefectsByModule([]);
      return;
    }
    setLoadingDefectsByModule(true);
    setDefectsByModuleError(null);
    getDefectsByModule(selectedProjectId)
      .then((res) => {
        if (res && Array.isArray(res.data)) {
          setDefectsByModule(res.data);
        } else if (res && Array.isArray(res)) {
          setDefectsByModule(res);
        } else {
          setDefectsByModule([]);
          setDefectsByModuleError('Invalid defects by module data');
        }
        setLoadingDefectsByModule(false);
      })
      .catch(() => {
        setDefectsByModuleError('Failed to load defects by module');
        setDefectsByModule([]);
        setLoadingDefectsByModule(false);
      });
  }, [selectedProjectId]);

  useEffect(() => {
    if (!selectedProjectId) {
      setReopenSummary([]);
      return;
    }
    setLoadingReopenSummary(true);
    setReopenSummaryError(null);
    getReopenCountSummary(selectedProjectId)
      .then((res) => {
        if (res && Array.isArray(res.data)) {
          setReopenSummary(res.data);
        } else if (res && Array.isArray(res)) {
          setReopenSummary(res);
        } else {
          setReopenSummary([]);
          setReopenSummaryError('Invalid reopen summary data');
        }
        setLoadingReopenSummary(false);
      })
      .catch(() => {
        setReopenSummaryError('Failed to load reopen summary');
        setReopenSummary([]);
        setLoadingReopenSummary(false);
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
  const selectedProject = Array.isArray(projects) ? projects.find((p: any) => p.id === selectedProjectId) : null;

  // --- Project Health Summary Logic ---
  // Count projects by risk color from integration
  const riskCounts = { high: 0, medium: 0, low: 0 };
  projects.forEach(project => {
    const risk = getRiskLevelFromClass(projectColors[project.id]);
    if (risk) riskCounts[risk]++;
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

  // Helper to extract text color class from Tailwind bg-gradient class
  function getTextColorClass(bgClass: string | undefined): string {
    if (!bgClass) return '';
    // Try to extract the 'from-...' color and convert to 'text-...'
    const match = bgClass.match(/from-([a-z]+-[0-9]+)/);
    if (match) {
      return `text-${match[1]}`;
    }
    // fallback
    return '';
  }

  // Helper to extract risk label from Tailwind bg-gradient class
  function getRiskLabelFromClass(bgClass: string | undefined): string {
    if (!bgClass) return '';
    if (bgClass.includes('red')) return 'High Risk';
    if (bgClass.includes('yellow')) return 'Medium Risk';
    if (bgClass.includes('green')) return 'Low Risk';
    return '';
  }

  // Helper to extract risk level from Tailwind bg-gradient class
  function getRiskLevelFromClass(bgClass: string | undefined): 'high' | 'medium' | 'low' | undefined {
    if (!bgClass) return undefined;
    if (bgClass.includes('red')) return 'high';
    if (bgClass.includes('yellow')) return 'medium';
    if (bgClass.includes('green')) return 'low';
    return undefined;
  }

  // Get risk label for selected project
  const selectedProjectRiskLabel = getRiskLabelFromClass(selectedProject ? projectColors[selectedProject.id] : undefined);

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
                <div className="text-4xl font-extrabold text-red-600">{riskCounts.high}</div>
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
                <div className="text-4xl font-extrabold text-yellow-600">{riskCounts.medium}</div>
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
                <div className="text-4xl font-extrabold text-green-600">{riskCounts.low}</div>
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
            {loadingProjects ? (
              <div className="text-gray-500">Loading projects...</div>
            ) : projectsError ? (
              <div className="text-red-500">{projectsError}</div>
            ) : projects.length === 0 ? (
              <div className="text-gray-400">No projects found.</div>
            ) : (() => {
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
                      name={project.name || project.projectName || 'Unnamed Project'}
                      risk={risk}
                      defectCounts={{ high: highCount, medium: mediumCount, low: lowCount }}
                      onClick={() => setSelectedProjectId(project.id)}
                      size="small"
                      customBgClass={projectColors[project.id]}
                      riskLabel={getRiskLabelFromClass(projectColors[project.id])}
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
              <div className="text-2xl font-bold text-gray-900">{selectedProject.name || selectedProject.projectName || 'Unnamed Project'}</div>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-gray-500 text-sm mb-1">Status</span>
              {selectedProjectRiskLabel && (
                <span
                  className={
                    selectedProjectRiskLabel === 'High Risk'
                      ? 'bg-red-100 text-red-700 rounded-full px-4 py-1 text-sm font-semibold'
                      : selectedProjectRiskLabel === 'Medium Risk'
                      ? 'bg-yellow-100 text-yellow-800 rounded-full px-4 py-1 text-sm font-semibold'
                      : selectedProjectRiskLabel === 'Low Risk'
                      ? 'bg-green-100 text-green-800 rounded-full px-4 py-1 text-sm font-semibold'
                      : 'bg-gray-100 text-gray-500 rounded-full px-4 py-1 text-sm font-semibold'
                  }
                >
                  {selectedProjectRiskLabel}
                </span>
              )}
              {!selectedProjectRiskLabel && (
                <span className="bg-gray-100 text-gray-500 rounded-full px-4 py-1 text-sm font-semibold">NO RISK</span>
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
          // Use API data for status counts
          const statusList = statusTypes.map(s => (s.defectStatusName || '').toLowerCase());
          const statusColorMap = Object.fromEntries(statusTypes.map(s => [(s.defectStatusName || '').toLowerCase(), s.colorCode]));
          const summary = defectSeveritySummary[severity] || { statusCounts: {}, total: 0 };
          const statusCounts = statusList.map(status => summary.statusCounts?.[status] || 0);
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
            (() => {
              // Parse dsi as number
              const dsiValue = typeof dsi === 'string' ? parseFloat(dsi) : (typeof dsi === 'number' ? dsi : 0);
              let barColor = '#22c55e'; // green
              let numberColor = 'text-green-600';
              if (dsiValue >= 50) {
                barColor = '#ef4444'; // red
                numberColor = 'text-red-600';
              } else if (dsiValue >= 25) {
                barColor = '#facc15'; // yellow
                numberColor = 'text-yellow-500';
              }
              // Bar height: max 120px, min 0px
              const maxBarHeight = 120;
              const cappedDsi = Math.max(0, Math.min(dsiValue, 100));
              const barHeight = (cappedDsi / 100) * maxBarHeight;
              return (
                <div className="flex flex-col items-center w-full">
                  <div className="flex flex-row items-end justify-center gap-6 w-full" style={{ minHeight: maxBarHeight + 20 }}>
                    {/* Vertical Bar Meter */}
                    <div className="flex flex-col items-center justify-end h-full" style={{ height: maxBarHeight }}>
                      <div style={{
                        width: '28px',
                        height: `${maxBarHeight}px`,
                        background: '#f3f4f6',
                        borderRadius: '16px',
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'flex-end',
                        boxShadow: '0 2px 8px 0 rgba(30,41,59,0.07)'
                      }}>
                        <div style={{
                          width: '100%',
                          height: `${barHeight}px`,
                          background: barColor,
                          borderRadius: '16px',
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          transition: 'height 0.7s cubic-bezier(0.4,0,0.2,1)',
                        }} />
                        {/* Tick marks */}
                        <div style={{
                          position: 'absolute',
                          left: '100%',
                          top: 0,
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          marginLeft: '6px',
                          fontSize: '12px',
                          color: '#64748b',
                          fontWeight: 500,
                          pointerEvents: 'none',
                        }}>
                          <span>100</span>
                          <span>75</span>
                          <span>50</span>
                          <span>25</span>
                          <span>0</span>
                        </div>
                      </div>
                    </div>
                    {/* DSI Value and Label */}
                    <div className="flex flex-col items-center justify-center ml-2">
                      <span className={`text-4xl font-bold mb-2 ${numberColor}`}>{isNaN(dsiValue) ? '0.00' : dsiValue.toString()}</span>
                      <span className="text-gray-700 text-center">Weighted severity score (higher = more severe defects)</span>
                    </div>
                  </div>
                </div>
              );
            })()
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
        {loadingReopenSummary ? (
          <div className="text-gray-500">Loading...</div>
        ) : reopenSummaryError ? (
          <div className="text-red-500">{reopenSummaryError}</div>
        ) : reopenSummary && reopenSummary.length > 0 ? (
          (() => {
            const labels = reopenSummary.map(item => item.label);
            const data = {
              labels,
              datasets: [
                {
                  data: reopenSummary.map(item => item.count),
                  backgroundColor: [
                    '#4285F4', '#FBBC05', '#EA4335', '#C5221F', '#F29900', '#00B894', '#A259F7', '#00B8D9', '#FF6F00', '#8E24AA',
                  ].slice(0, reopenSummary.length),
                },
              ],
            };
            const total = reopenSummary.reduce((a, b) => a + (b.count || 0), 0);
            return (
              <>
                <div className="w-64 h-64">
                  <ChartJSPie data={data} options={{ plugins: { legend: { display: false } } }} />
                </div>
                <div className="mt-6 grid grid-cols-1 gap-1 text-sm">
                  {reopenSummary.map((item, idx) => (
                    <div key={item.label} className="flex items-center gap-2">
                      <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: data.datasets[0].backgroundColor[idx] }}></span>
                      <span className="text-gray-700">{item.label}: <span className="font-semibold">{item.count}</span> <span className='text-gray-500'>({total > 0 ? ((item.count / total) * 100).toFixed(1) : 0}%)</span></span>
                    </div>
                  ))}
                </div>
              </>
            );
          })()
        ) : (
          <div className="text-gray-400">No data available.</div>
        )}
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

  {/* Defects by Module Pie Chart (added at the end) */}
  <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow p-8 flex flex-col items-center mt-10">
    <h2 className="text-xl font-bold mb-6 text-center">Defects by Module</h2>
    {loadingDefectsByModule ? (
      <div className="text-gray-500">Loading...</div>
    ) : defectsByModuleError ? (
      <div className="text-red-500">{defectsByModuleError}</div>
    ) : defectsByModule && defectsByModule.length > 0 ? (
      <>
        <div className="w-72 h-72 mx-auto">
          <ChartJSPie
            data={{
              labels: defectsByModule.map((m) => m.name),
              datasets: [
                {
                  data: defectsByModule.map((m) => m.value),
                  backgroundColor: [
                    '#4285F4', '#00B894', '#FBBC05', '#EA4335', '#A259F7', '#00B8D9', '#FF6F00', '#8E24AA', '#43A047', '#F4511E',
                  ].slice(0, defectsByModule.length),
                },
              ],
            }}
            options={{ plugins: { legend: { display: false } } }}
          />
        </div>
        <div className="mt-8 grid grid-cols-1 gap-2 w-full">
          {defectsByModule.map((item, idx) => (
            <div key={item.name} className="flex items-center gap-3 text-base justify-center">
              <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: [
                '#4285F4', '#00B894', '#FBBC05', '#EA4335', '#A259F7', '#00B8D9', '#FF6F00', '#8E24AA', '#43A047', '#F4511E',
              ][idx % 10] }}></span>
              <span className="text-gray-700 w-40">{item.name}</span>
              <span className="font-bold text-gray-900 w-8 text-right">{item.value}</span>
              <span className="text-gray-500">({item.percentage?.toFixed(2) ?? 0}%)</span>
            </div>
          ))}
        </div>
      </>
    ) : (
      <div className="text-gray-400">No data available.</div>
    )}
  </div>
  </>
);
};

export default Dashboard;

function DefectDensityMeter({ kloc, defectCount, defectDensity }: { kloc: number, defectCount: number, defectDensity?: number }) {
  // Use backend defectDensity if provided, otherwise calculate
  const density = typeof defectDensity === 'number' ? defectDensity : (kloc > 0 ? defectCount / kloc : 0);
  // Meter now starts at -90deg (left) and ends at 90deg (right), total sweep 180deg
  // Meter range: 0-15
  const min = 0, max = 15;
  const cappedDensity = Math.max(min, Math.min(density, max));
  // angle = -90 + (density / 15) * 180
  const angle = -90 + (cappedDensity / 15) * 180;
  const needleRef = useRef<SVGPolygonElement>(null);

  useEffect(() => {
    if (needleRef.current) {
      needleRef.current.style.transition = 'transform 0.7s cubic-bezier(0.4,0,0.2,1)';
      needleRef.current.style.transform = `rotate(${angle}deg)`;
    }
  }, [angle]);

  // Color zones for legend
  const getZoneColor = (val: number) => {
    if (val <= 7) return '#22c55e'; // green
    if (val <= 10) return '#facc15'; // yellow
    return '#ef4444'; // red
  };
  const zoneColor = getZoneColor(density);

  // Arc path helpers
  function describeArc(cx: number, cy: number, r: number, startValue: number, endValue: number) {
    // Map value (0-15) to angle (-90 to 90)
    const valueToAngle = (v: number) => -90 + (v / 15) * 180;
    const startAngle = valueToAngle(startValue);
    const endAngle = valueToAngle(endValue);
    const start = polarToCartesian(cx, cy, r, endAngle);
    const end = polarToCartesian(cx, cy, r, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
    return [
      'M', start.x, start.y,
      'A', r, r, 0, largeArcFlag, 0, end.x, end.y
    ].join(' ');
  }
  function polarToCartesian(cx: number, cy: number, r: number, angle: number) {
    const rad = (angle - 90) * Math.PI / 180.0;
    return {
      x: cx + (r * Math.cos(rad)),
      y: cy + (r * Math.sin(rad))
    };
  }

  // Arc value ranges
  const arcGreenStart = 0, arcGreenEnd = 7;
  const arcYellowStart = 7.1, arcYellowEnd = 10;
  const arcRedStart = 10.1, arcRedEnd = 15;

  // Tick positions for 0, 7, 10
  const ticks = [0, 7, 10];
  const valueToAngle = (v: number) => -90 + (v / 15) * 180;
  const tickAngles = ticks.map(valueToAngle);
  const tickRadius = 80;
  const tickLabelRadius = 95;

  return (
    <div className="flex flex-col items-center">
      <div className="text-lg font-semibold mb-1 text-center">
        Defect Density:
        <span className="ml-2 font-extrabold" style={{ color: zoneColor }}>{isNaN(density) ? '0.00' : density.toFixed(2)}</span>
      </div>
      <div className="w-72 h-40 flex items-end justify-center relative">
        <svg viewBox="0 0 200 120" className="w-full h-full">
          {/* Meter background */}
          <path d={describeArc(100, 100, 70, 0, 15)} fill="none" stroke="#e5e7eb" strokeWidth="18" />
          {/* Green arc: 0-7 */}
          <path d={describeArc(100, 100, 70, arcGreenStart, arcGreenEnd)} fill="none" stroke="#22c55e" strokeWidth="14" />
          {/* Yellow arc: 7.1-10 */}
          <path d={describeArc(100, 100, 70, arcYellowStart, arcYellowEnd)} fill="none" stroke="#facc15" strokeWidth="14" />
          {/* Red arc: 10.1-15 */}
          <path d={describeArc(100, 100, 70, arcRedStart, arcRedEnd)} fill="none" stroke="#ef4444" strokeWidth="14" />
          {/* Needle */}
          <g style={{ transform: 'rotate(0deg)', transformOrigin: '100px 100px' }}>
            <polygon
              ref={needleRef}
              points="100,35 97,100 103,100"
              fill="#334155"
              style={{ transform: `rotate(${angle}deg)`, transformOrigin: '100px 100px', transition: 'transform 0.7s cubic-bezier(0.4,0,0.2,1)' }}
            />
          </g>
          {/* Center dot */}
          <circle cx="100" cy="100" r="7" fill="#334155" />
          {/* Tick marks and labels */}
          {ticks.map((tick, i) => {
            const a = tickAngles[i];
            const tickStart = polarToCartesian(100, 100, tickRadius, a);
            const tickEnd = polarToCartesian(100, 100, tickRadius + 8, a);
            const labelPos = polarToCartesian(100, 100, tickLabelRadius, a);
            return (
              <g key={tick}>
                <line x1={tickStart.x} y1={tickStart.y} x2={tickEnd.x} y2={tickEnd.y} stroke="#64748b" strokeWidth="2" />
                <text x={labelPos.x} y={labelPos.y + 5} fontSize="13" fill="#64748b" textAnchor="middle">{tick}</text>
              </g>
            );
          })}
        </svg>
      
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