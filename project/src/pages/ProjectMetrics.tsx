import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { 
  ArrowLeft, Bug, AlertTriangle, CheckCircle, Clock, 
  TrendingUp, TrendingDown, Activity, Gauge, Zap, ChevronDown
} from 'lucide-react';
import { Doughnut, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip as ChartTooltip,
  Legend as ChartLegend,
  LineController,
  PointElement,
  CategoryScale,
  LinearScale,
  LineElement
} from 'chart.js';

ChartJS.register(
  ArcElement,
  ChartTooltip,
  ChartLegend,
  LineController,
  PointElement,
  CategoryScale,
  LinearScale,
  LineElement
);

const STATUS_LIST = ['NEW', 'OPEN', 'FIXED', 'CLOSED', 'REJECT', 'REOPEN', 'DUPLICATE', 'HOLD'];
const STATUS_COLORS = ['#6366F1', '#EF4444', '#10B981', '#3B82F6', '#F59E42', '#F472B6', '#A3A3A3', '#FBBF24'];

const DEMO_DEFECTS = [
  // High severity
  { id: '1', projectId: 'demo', status: 'open', severity: 'high', type: 'UI', module: 'Login', defectHistory: [{ status: 'reopen' }, { status: 'reopen' }] },
  { id: '2', projectId: 'demo', status: 'closed', severity: 'high', type: 'Backend', module: 'API', defectHistory: [{ status: 'reopen' }, { status: 'reopen' }, { status: 'reopen' }] },
  { id: '3', projectId: 'demo', status: 'fixed', severity: 'high', type: 'Performance', module: 'Dashboard', defectHistory: [{ status: 'reopen' }, { status: 'reopen' }, { status: 'reopen' }, { status: 'reopen' }] },
  { id: '4', projectId: 'demo', status: 'open', severity: 'high', type: 'Security', module: 'Reports', defectHistory: [{ status: 'reopen' }, { status: 'reopen' }, { status: 'reopen' }, { status: 'reopen' }, { status: 'reopen' }] },
  { id: '5', projectId: 'demo', status: 'open', severity: 'high', type: 'Integration', module: 'Notifications', defectHistory: [{ status: 'reopen' }, { status: 'reopen' }, { status: 'reopen' }, { status: 'reopen' }, { status: 'reopen' }, { status: 'reopen' }] },
  // Medium severity
  { id: '6', projectId: 'demo', status: 'new', severity: 'medium', type: 'UI', module: 'Login', defectHistory: [{ status: 'reopen' }, { status: 'reopen' }] },
  { id: '7', projectId: 'demo', status: 'open', severity: 'medium', type: 'Backend', module: 'API', defectHistory: [{ status: 'reopen' }, { status: 'reopen' }, { status: 'reopen' }] },
  { id: '8', projectId: 'demo', status: 'fixed', severity: 'medium', type: 'Performance', module: 'Dashboard', defectHistory: [{ status: 'reopen' }, { status: 'reopen' }, { status: 'reopen' }, { status: 'reopen' }] },
  { id: '9', projectId: 'demo', status: 'closed', severity: 'medium', type: 'Security', module: 'Reports', defectHistory: [{ status: 'reopen' }, { status: 'reopen' }, { status: 'reopen' }, { status: 'reopen' }, { status: 'reopen' }] },
  { id: '10', projectId: 'demo', status: 'open', severity: 'medium', type: 'Integration', module: 'Notifications', defectHistory: [{ status: 'reopen' }, { status: 'reopen' }, { status: 'reopen' }, { status: 'reopen' }, { status: 'reopen' }, { status: 'reopen' }] },
  // Low severity
  { id: '11', projectId: 'demo', status: 'open', severity: 'low', type: 'UI', module: 'Login', defectHistory: [{ status: 'reopen' }, { status: 'reopen' }] },
  { id: '12', projectId: 'demo', status: 'fixed', severity: 'low', type: 'Backend', module: 'API', defectHistory: [{ status: 'reopen' }, { status: 'reopen' }, { status: 'reopen' }] },
  { id: '13', projectId: 'demo', status: 'closed', severity: 'low', type: 'Performance', module: 'Dashboard', defectHistory: [{ status: 'reopen' }, { status: 'reopen' }, { status: 'reopen' }, { status: 'reopen' }] },
  { id: '14', projectId: 'demo', status: 'open', severity: 'low', type: 'Security', module: 'Reports', defectHistory: [{ status: 'reopen' }, { status: 'reopen' }, { status: 'reopen' }, { status: 'reopen' }, { status: 'reopen' }] },
  { id: '15', projectId: 'demo', status: 'open', severity: 'low', type: 'Integration', module: 'Notifications', defectHistory: [{ status: 'reopen' }, { status: 'reopen' }, { status: 'reopen' }, { status: 'reopen' }, { status: 'reopen' }, { status: 'reopen' }] },
  // Add more for variety
  { id: '16', projectId: 'demo', status: 'open', severity: 'medium', type: 'Database', module: 'Settings', defectHistory: [{ status: 'reopen' }] },
  { id: '17', projectId: 'demo', status: 'closed', severity: 'high', type: 'API', module: 'API', defectHistory: [{ status: 'reopen' }, { status: 'reopen' }] },
  { id: '18', projectId: 'demo', status: 'fixed', severity: 'low', type: 'UI', module: 'Dashboard', defectHistory: [{ status: 'reopen' }] },
  { id: '19', projectId: 'demo', status: 'open', severity: 'high', type: 'Performance', module: 'Reports', defectHistory: [{ status: 'reopen' }, { status: 'reopen' }] },
  { id: '20', projectId: 'demo', status: 'closed', severity: 'medium', type: 'Security', module: 'Settings', defectHistory: [{ status: 'reopen' }] },
];
const DEMO_PROJECT = { id: 'demo', name: 'Demo Project', status: 'active' };

const REOPEN_SEGMENTS = [2, 3, 4, 5, '5+'];

const ProjectMetrics: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { projects, defects } = useApp();
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [dropdownOpen, setDropdownOpen] = useState<{[key:string]: boolean}>({});
  const [showPie, setShowPie] = useState<{[key:string]: boolean}>({});
  const [demoMode, setDemoMode] = useState(true);
  const [selectedPieSegment, setSelectedPieSegment] = useState<number | string | null>(null);

  useEffect(() => {
    if (projectId) {
      const project = projects.find(p => p.id === projectId);
      setSelectedProject(project);
    }
  }, [projectId, projects]);

  if (!selectedProject) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading project metrics...</p>
        </div>
      </div>
    );
  }

  // Use demo data if demoMode is on
  const projectDefects = demoMode ? DEMO_DEFECTS : defects.filter(d => d.projectId === projectId);
  const selectedProjectData = demoMode ? DEMO_PROJECT : selectedProject;

  // Helper to get status counts for a severity
  const getStatusCounts = (severity: string) => {
    const filtered = projectDefects.filter(d => d.severity === severity);
    return STATUS_LIST.map(status =>
      filtered.filter(d => d.status.toUpperCase() === status).length
    );
  };

  // Pie chart data for a severity
  const getPieData = (severity: string) => {
    const counts = getStatusCounts(severity);
    return {
      labels: STATUS_LIST,
      datasets: [{
        data: counts,
        backgroundColor: STATUS_COLORS,
        borderWidth: 0
      }]
    };
  };

  // Calculate metrics
  const totalDefects = projectDefects.length;
  const openDefects = projectDefects.filter(d => d.status === 'open').length;
  const criticalDefects = projectDefects.filter(d => d.severity === 'critical').length;
  const highDefects = projectDefects.filter(d => d.severity === 'high').length;
  const mediumDefects = projectDefects.filter(d => d.severity === 'medium').length;
  const lowDefects = projectDefects.filter(d => d.severity === 'low').length;
  const kloc = Math.floor(Math.random() * 50) + 10;
  const defectDensity = kloc > 0 ? (totalDefects / kloc).toFixed(1) : '0';
  const resolvedDefects = projectDefects.filter(d => d.status === 'resolved' || d.status === 'closed').length;
  const defectRemovalEfficiency = totalDefects > 0 ? ((resolvedDefects / totalDefects) * 100).toFixed(1) : '0';
  const severityIndex = totalDefects > 0 ? 
    ((criticalDefects * 4 + highDefects * 3 + mediumDefects * 2 + lowDefects) / totalDefects).toFixed(2) : '0';
  const defectLeakage = totalDefects > 0 ? Math.floor(Math.random() * 20) : 0;

  // Dropdown handlers
  const handleDropdown = (severity: string, open: boolean) => {
    setDropdownOpen(prev => ({ ...prev, [severity]: open }));
  };
  const handleShowPie = (severity: string) => {
    setShowPie(prev => ({ ...prev, [severity]: !prev[severity] }));
  };

  // Table data for selected pie segment
  const getTableData = () => {
    if (!selectedPieSegment) return [];
    return projectDefects.filter(d => {
      const count = d.defectHistory?.filter(h => h.status === 'reopen').length || 0;
      if (selectedPieSegment === '5+') return count > 5;
      return count === selectedPieSegment;
    });
  };

  // Card rendering helper
  const renderSeverityCard = (severity: string, color: string) => (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Defects on {severity.charAt(0).toUpperCase() + severity.slice(1)}</h3>
        <div
          className="relative"
          onMouseEnter={() => handleDropdown(severity, true)}
          onMouseLeave={() => handleDropdown(severity, false)}
        >
          <button
            className="p-1 rounded-full hover:bg-gray-100"
            onClick={() => handleShowPie(severity)}
            aria-label="Show Pie Chart"
          >
            <ChevronDown className="w-5 h-5 text-gray-500" />
          </button>
          {dropdownOpen[severity] && (
            <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded shadow-lg z-10">
              <button
                className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm"
                onClick={() => handleShowPie(severity)}
              >
                Show Pie Chart
              </button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {STATUS_LIST.map((status, idx) => (
            <div key={status} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: STATUS_COLORS[idx] }}></div>
                <span className="text-sm text-gray-600">{status}</span>
              </div>
              <span className="text-sm font-medium">
                {getStatusCounts(severity)[idx]}
              </span>
            </div>
          ))}
        </div>
        {showPie[severity] && (
          <div className="mt-4 flex flex-col items-center">
            <Doughnut data={getPieData(severity)} options={{ cutout: '60%' }} />
            <div className="mt-2 text-xs text-gray-500">Status Breakdown</div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6 p-6">
      {/* DEMO MODE TOGGLE */}
      <div className="flex items-center mb-4">
        <label className="flex items-center cursor-pointer">
          <input type="checkbox" checked={demoMode} onChange={() => setDemoMode(v => !v)} className="form-checkbox h-5 w-5 text-blue-600" />
          <span className="ml-2 text-sm font-semibold text-blue-700">Demo Mode</span>
        </label>
        {demoMode && <span className="ml-4 text-xs text-orange-500 font-bold">Demo data is shown for all metrics and charts</span>}
      </div>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/dashboard')}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{selectedProjectData.name}</h1>
            <p className="text-gray-600 mt-1">Project Metrics & Analytics</p>
          </div>
        </div>
        <Badge variant={selectedProjectData.status === 'active' ? 'success' : 'warning'}>
          {selectedProjectData.status}
        </Badge>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100">Total Defects</p>
                <p className="text-3xl font-bold">{totalDefects}</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Bug className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">KLOC</p>
                <p className="text-3xl font-bold">{kloc}</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Activity className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100">Defect Density</p>
                <p className="text-3xl font-bold">{defectDensity}</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Gauge className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100">Removal Efficiency</p>
                <p className="text-3xl font-bold">{defectRemovalEfficiency}%</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {renderSeverityCard('high', '#EF4444')}
        {renderSeverityCard('medium', '#FBBF24')}
        {renderSeverityCard('low', '#10B981')}
      </div>

      {/* Defect Density Meter & Severity Index */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Defect Density Meter */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">Defect Density Meter</h3>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center">
              <div className="relative w-48 h-28 mx-auto">
                <Doughnut
                  data={{
                    labels: ['Defect Density', 'Remaining'],
                    datasets: [
                      {
                        data: [Number(defectDensity), Math.max(10 - Number(defectDensity), 0)],
                        backgroundColor: ['#f59e42', '#e5e7eb'],
                        borderWidth: 0,
                        circumference: 180,
                        rotation: 270,
                      },
                    ],
                  }}
                  options={{
                    cutout: '70%',
                    plugins: { legend: { display: false }, tooltip: { enabled: false } },
                    circumference: 180,
                    rotation: 270,
                  }}
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-orange-600">{defectDensity}</span>
                  <span className="text-xs text-gray-500">defects/KLOC</span>
                </div>
              </div>
              <div className="text-xs text-gray-500 mt-1">Visual representation of defect density</div>
            </div>
          </CardContent>
        </Card>
        {/* Defect Severity Index */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">Defect Severity Index</h3>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center">
              <div className="text-4xl font-bold text-orange-600 mb-2">{severityIndex}</div>
              <div className="text-sm text-gray-500">Weighted severity score for this project</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Defects Reopened Pie Chart */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">Defects Reopened Distribution</h3>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center">
              {(() => {
                // Calculate reopen counts
                const reopenCounts = { '2': 0, '3': 0, '4': 0, '5': 0, '5+': 0 };
                projectDefects.forEach(d => {
                  const reopenHistory = d.defectHistory?.filter(h => h.status === 'reopen') || [];
                  const count = reopenHistory.length;
                  if (count === 2) reopenCounts['2']++;
                  else if (count === 3) reopenCounts['3']++;
                  else if (count === 4) reopenCounts['4']++;
                  else if (count === 5) reopenCounts['5']++;
                  else if (count > 5) reopenCounts['5+']++;
                });
                const data = {
                  labels: ['2 times', '3 times', '4 times', '5 times', 'More than 5'],
                  datasets: [
                    {
                      data: [reopenCounts['2'], reopenCounts['3'], reopenCounts['4'], reopenCounts['5'], reopenCounts['5+']],
                      backgroundColor: ['#fbbf24', '#6366f1', '#ef4444', '#10b981', '#f59e42'],
                      borderWidth: 0,
                    },
                  ],
                };
                return (
                  <div className="w-64 h-64">
                    <Doughnut
                      data={data}
                      options={{ plugins: { legend: { position: 'bottom' } }, onClick: (e, elements, chart) => {
                        if (elements && elements.length > 0) {
                          const idx = elements[0].index;
                          setSelectedPieSegment(REOPEN_SEGMENTS[idx]);
                        }
                      } }}
                    />
                  </div>
                );
              })()}
              <div className="mt-2 text-xs text-gray-500">Distribution of defects reopened 2, 3, 4, 5, and more than 5 times</div>
              {/* Table for selected segment */}
              {selectedPieSegment && (
                <div className="w-full mt-6">
                  <h4 className="text-md font-semibold mb-2 text-gray-800">Defects reopened {selectedPieSegment} times</h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full border border-gray-200 rounded-lg">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="px-3 py-2 text-left text-xs font-bold text-gray-700">Defect ID</th>
                          <th className="px-3 py-2 text-left text-xs font-bold text-gray-700">Time to Reopen</th>
                          <th className="px-3 py-2 text-left text-xs font-bold text-gray-700">Release Number</th>
                          <th className="px-3 py-2 text-left text-xs font-bold text-gray-700">Entered By</th>
                          <th className="px-3 py-2 text-left text-xs font-bold text-gray-700">Assigned To Fix</th>
                        </tr>
                      </thead>
                      <tbody>
                        {getTableData().map((d, i) => (
                          <tr key={d.id} className="border-t">
                            <td className="px-3 py-2 text-sm text-gray-800">{d.id}</td>
                            <td className="px-3 py-2 text-sm text-gray-800">{d.defectHistory?.filter(h => h.status === 'reopen').length || 0}</td>
                            <td className="px-3 py-2 text-sm text-gray-800">{(d as any)?.releaseNumber || '-'}</td>
                            <td className="px-3 py-2 text-sm text-gray-800">{(d as any)?.assignBy || (d as any)?.reportedBy || '-'}</td>
                            <td className="px-3 py-2 text-sm text-gray-800">{(d as any)?.assignTo || '-'}</td>
                          </tr>
                        ))}
                        {getTableData().length === 0 && (
                          <tr><td colSpan={5} className="text-center text-gray-400 py-4">No defects found for this segment.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Defect breakdown by Defect Type Pie Chart */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">Defect Breakdown by Defect Type</h3>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center">
              {(() => {
                // Count by defect type
                const typeCounts: Record<string, number> = {};
                projectDefects.forEach(d => {
                  const type = (d as any)?.type || (d as any)?.defectType || 'Unknown';
                  typeCounts[type] = (typeCounts[type] || 0) + 1;
                });
                const labels = Object.keys(typeCounts);
                const total = labels.reduce((sum, l) => sum + typeCounts[l], 0);
                const colorPalette = [
                  '#6366f1', // Indigo
                  '#fbbf24', // Amber
                  '#ef4444', // Red
                  '#10b981', // Green
                  '#f59e42', // Orange
                  '#3b82f6', // Blue
                  '#f472b6', // Pink
                  '#a3a3a3', // Gray
                  '#eab308', // Yellow
                  '#8b5cf6', // Violet
                  '#14b8a6', // Teal
                  '#f43f5e', // Rose
                  '#22d3ee', // Cyan
                  '#facc15', // Yellow-400
                  '#7c3aed', // Purple
                  '#84cc16', // Lime
                ];
                const backgroundColors = labels.map((_, idx) => colorPalette[idx % colorPalette.length]);
                const data = {
                  labels,
                  datasets: [
                    {
                      data: labels.map(l => typeCounts[l]),
                      backgroundColor: backgroundColors,
                      borderWidth: 0,
                    },
                  ],
                };
                return (
                  <>
                    <div className="w-64 h-64">
                      <Doughnut data={data} options={{ plugins: { legend: { position: 'bottom' } } }} />
                    </div>
                    <div className="mt-2 text-xs text-gray-500">Distribution of defects by defect type</div>
                    {/* Table of defect type details */}
                    <div className="w-full mt-6">
                      <table className="min-w-full border border-gray-200 rounded-lg">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="px-3 py-2 text-left text-xs font-bold text-gray-700">Defect Type</th>
                            <th className="px-3 py-2 text-left text-xs font-bold text-gray-700">Count</th>
                            <th className="px-3 py-2 text-left text-xs font-bold text-gray-700">% of Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {labels.map((type, idx) => (
                            <tr key={type} className="border-t">
                              <td className="px-3 py-2 text-sm text-gray-800 flex items-center"><span className="inline-block w-3 h-3 rounded-full mr-2" style={{backgroundColor: data.datasets[0].backgroundColor[idx]}}></span>{type}</td>
                              <td className="px-3 py-2 text-sm text-gray-800">{typeCounts[type]}</td>
                              <td className="px-3 py-2 text-sm text-gray-800">{((typeCounts[type] / total) * 100).toFixed(1)}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                );
              })()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Defect Severity Breakdown */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <span className="inline-block"><svg xmlns='http://www.w3.org/2000/svg' className='inline w-5 h-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 17v-2a4 4 0 018 0v2m-4-4V7m0 0V5a2 2 0 10-4 0v2m0 0v2a2 2 0 104 0V7m0 0V5a2 2 0 10-4 0v2' /></svg></span>
              Defect Severity Breakdown
            </h3>
          </CardHeader>
          <CardContent>
            {['critical', 'high', 'medium', 'low'].map(severity => {
              const filtered = projectDefects.filter(d => d.severity === severity);
              const open = filtered.filter(d => d.status === 'open').length;
              const inProgress = filtered.filter(d => d.status === 'in-progress').length;
              const closed = filtered.filter(d => d.status === 'closed').length;
              const total = open + inProgress + closed;
              const openPct = total ? (open / total) * 100 : 0;
              const inProgressPct = total ? (inProgress / total) * 100 : 0;
              const closedPct = total ? (closed / total) * 100 : 0;
              const label = severity.charAt(0).toUpperCase() + severity.slice(1);
              return (
                <div key={severity} className="mb-6">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-gray-800">{label}</span>
                    <span className="text-sm text-gray-500 font-bold">Total: {total}</span>
                  </div>
                  <div className="w-full h-5 rounded-full bg-gray-200 flex overflow-hidden">
                    <div className="h-5 bg-red-500" style={{ width: `${openPct}%` }}></div>
                    <div className="h-5 bg-yellow-400" style={{ width: `${inProgressPct}%` }}></div>
                    <div className="h-5 bg-green-500" style={{ width: `${closedPct}%` }}></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-600 mt-1">
                    <span>Open: {open}</span>
                    <span>In Progress: {inProgress}</span>
                    <span>Closed: {closed}</span>
                  </div>
                </div>
              );
            })}
            {/* Time to Find and Time to Fix Defect Graphs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
              <div className="w-full">
                <h4 className="text-sm font-bold text-gray-700 mb-1">Time to Find Defect (days)</h4>
                <Line
                  data={{
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                    datasets: [
                      {
                        label: 'Time to Find',
                        data: [250, 320, 400, 300, 700, 350],
                        borderColor: '#22c55e',
                        backgroundColor: 'rgba(34,197,94,0.1)',
                        tension: 0.4,
                        borderWidth: 4,
                        pointRadius: 0,
                        fill: false,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    plugins: { legend: { display: false } },
                    scales: { y: { beginAtZero: true, title: { display: true, text: 'Days' } } },
                  }}
                />
              </div>
              <div className="w-full">
                <h4 className="text-sm font-bold text-gray-700 mb-1">Time to Fix Defect (days)</h4>
                <Line
                  data={{
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                    datasets: [
                      {
                        label: 'Time to Fix',
                        data: [200, 250, 300, 350, 400, 300],
                        borderColor: '#ef4444',
                        backgroundColor: 'rgba(239,68,68,0.1)',
                        tension: 0.4,
                        borderWidth: 4,
                        pointRadius: 0,
                        fill: false,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    plugins: { legend: { display: false } },
                    scales: { y: { beginAtZero: true, title: { display: true, text: 'Days' } } },
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Defect to Remark Ratio */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M12 20.5C6.753 20.5 2.5 16.247 2.5 11S6.753 1.5 12 1.5 21.5 5.753 21.5 11 17.247 20.5 12 20.5z" /></svg>
              Defect to Remark Ratio
            </h3>
          </CardHeader>
          <CardContent>
            {(() => {
              // Use mock data for remarks
              const totalDefects = projectDefects.length;
              const totalRemarks = 120; // mock value, replace with real data if available
              const ratio = totalDefects > 0 ? (totalRemarks / totalDefects).toFixed(2) : '0.00';
              // For circular progress
              const percent = Math.min(Number(ratio) * 10, 100); // scale for demo
              return (
                <div className="flex flex-col items-center justify-center">
                  <div className="relative w-28 h-28 mb-2">
                    <svg className="w-full h-full" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="42" stroke="#e5e7eb" strokeWidth="10" fill="none" />
                      <circle
                        cx="50" cy="50" r="42"
                        stroke="url(#ratioGradient)"
                        strokeWidth="10"
                        fill="none"
                        strokeDasharray={264}
                        strokeDashoffset={264 - (264 * percent) / 100}
                        strokeLinecap="round"
                        style={{ transition: 'stroke-dashoffset 0.6s' }}
                      />
                      <defs>
                        <linearGradient id="ratioGradient" x1="0" y1="0" x2="100" y2="0">
                          <stop offset="0%" stopColor="#6366f1" />
                          <stop offset="100%" stopColor="#38bdf8" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-extrabold text-blue-600 drop-shadow">{ratio}</span>
                      <span className="text-xs text-gray-500">Ratio</span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">Total Remarks: {totalRemarks} | Total Defects: {totalDefects}</div>
                  <div className="text-xs text-gray-500 mt-1">Ratio of remarks to defects for this project</div>
                </div>
              );
            })()}
          </CardContent>
        </Card>
      </div>

      {/* Defects by Main Module Pie Chart */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">Defects by Main Module</h3>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center">
              {(() => {
                // Count by module
                const moduleCounts: Record<string, number> = {};
                projectDefects.forEach(d => {
                  const module = (d as any)?.module || (d as any)?.moduleName || 'Unknown';
                  moduleCounts[module] = (moduleCounts[module] || 0) + 1;
                });
                const labels = Object.keys(moduleCounts);
                const total = labels.reduce((sum, l) => sum + moduleCounts[l], 0);
                const colorPalette = [
                  '#6366f1', '#fbbf24', '#ef4444', '#10b981', '#f59e42', '#3b82f6', '#f472b6', '#a3a3a3',
                  '#eab308', '#8b5cf6', '#14b8a6', '#f43f5e', '#22d3ee', '#facc15', '#7c3aed', '#84cc16',
                ];
                const backgroundColors = labels.map((_, idx) => colorPalette[idx % colorPalette.length]);
                const data = {
                  labels,
                  datasets: [
                    {
                      data: labels.map(l => moduleCounts[l]),
                      backgroundColor: backgroundColors,
                      borderWidth: 0,
                    },
                  ],
                };
                return (
                  <>
                    <div className="w-64 h-64">
                      <Doughnut data={data} options={{ plugins: { legend: { position: 'bottom' } } }} />
                    </div>
                    <div className="mt-2 text-xs text-gray-500">Distribution of defects by main module</div>
                    {/* Table of module details */}
                    <div className="w-full mt-6">
                      <table className="min-w-full border border-gray-200 rounded-lg">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="px-3 py-2 text-left text-xs font-bold text-gray-700">Module</th>
                            <th className="px-3 py-2 text-left text-xs font-bold text-gray-700">Count</th>
                            <th className="px-3 py-2 text-left text-xs font-bold text-gray-700">% of Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {labels.map((module, idx) => (
                            <tr key={module} className="border-t">
                              <td className="px-3 py-2 text-sm text-gray-800 flex items-center"><span className="inline-block w-3 h-3 rounded-full mr-2" style={{backgroundColor: data.datasets[0].backgroundColor[idx]}}></span>{module}</td>
                              <td className="px-3 py-2 text-sm text-gray-800">{moduleCounts[module]}</td>
                              <td className="px-3 py-2 text-sm text-gray-800">{((moduleCounts[module] / total) * 100).toFixed(1)}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                );
              })()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Activity className="w-5 h-5 text-blue-500" />
                <h3 className="text-sm font-medium text-gray-700">Defect Removal Efficiency</h3>
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-1">
                {defectRemovalEfficiency}%
              </div>
              <div className="text-sm text-gray-500">
                {resolvedDefects} defects resolved
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                <h3 className="text-sm font-medium text-gray-700">Defect Severity Index</h3>
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 mb-1">
                {severityIndex}
              </div>
              <div className="text-sm text-gray-500">
                Weighted severity score
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Zap className="w-5 h-5 text-red-500" />
                <h3 className="text-sm font-medium text-gray-700">Defect Leakage</h3>
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600 mb-1">
                {defectLeakage}%
              </div>
              <div className="text-sm text-gray-500">
                Defects leaked to production
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Gauge className="w-5 h-5 text-green-500" />
                <h3 className="text-sm font-medium text-gray-700">Defect Density</h3>
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-1">
                {defectDensity}
              </div>
              <div className="text-sm text-gray-500">
                defects/KLOC
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProjectMetrics; 