import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
// import { Badge } from '../components/ui/Badge';
import { useApp } from '../context/AppContext';
import ProjectSelector from '../components/ui/ProjectSelector';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend, AreaChart, Area
} from 'recharts';
import { 
  AlertTriangle, Bug, CheckCircle, Clock, 
  TrendingUp, TrendingDown, ArrowUp, ArrowDown,
  Filter, Calendar, Users, FolderGit2, MessageSquare,
  Timer, BookOpen, Gauge, Activity, AlertCircle, Zap,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip as ChartTooltip, Legend as ChartLegend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(ArcElement, ChartTooltip, ChartLegend);

// Mock data for charts
const defectTrendData = [
  { month: 'Jan', critical: 5, high: 8, medium: 12, low: 15 },
  { month: 'Feb', critical: 3, high: 10, medium: 14, low: 18 },
  { month: 'Mar', critical: 4, high: 7, medium: 11, low: 13 },
  { month: 'Apr', critical: 2, high: 9, medium: 15, low: 16 },
  { month: 'May', critical: 6, high: 11, medium: 13, low: 14 },
  { month: 'Jun', critical: 3, high: 8, medium: 12, low: 17 },
];

const timeToFixData = [
  { month: 'Jan', avgTime: 4.2, target: 3 },
  { month: 'Feb', avgTime: 3.8, target: 3 },
  { month: 'Mar', avgTime: 3.5, target: 3 },
  { month: 'Apr', avgTime: 3.2, target: 3 },
  { month: 'May', avgTime: 2.9, target: 3 },
  { month: 'Jun', avgTime: 2.7, target: 3 },
];

const defectRemarkData = [
  { month: 'Jan', defects: 40, remarks: 120 },
  { month: 'Feb', defects: 45, remarks: 135 },
  { month: 'Mar', defects: 35, remarks: 105 },
  { month: 'Apr', defects: 50, remarks: 150 },
  { month: 'May', defects: 42, remarks: 126 },
  { month: 'Jun', defects: 38, remarks: 114 },
];

const defectDistributionData = [
  { name: 'Critical', value: 23, color: '#EF4444' },
  { name: 'High', value: 53, color: '#F97316' },
  { name: 'Medium', value: 77, color: '#FBBF24' },
  { name: 'Low', value: 93, color: '#34D399' },
];

const COLORS = ['#EF4444', '#F97316', '#FBBF24', '#34D399'];

export const Dashboard: React.FC = () => {
  const { defects, projects } = useApp();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  // Filter defects by selected project
  const filteredDefects = selectedProjectId
    ? defects.filter(d => String(d.projectId) === String(selectedProjectId))
    : [];

  // Calculate metrics for selected project only
  const totalDefects = filteredDefects.length;
  const criticalDefects = filteredDefects.filter(d => d.severity === 'critical').length;
  const highPriorityDefects = filteredDefects.filter(d => d.priority === 'high').length;

  // Calculate defect density (defects per 1000 lines of code)
  const totalLinesOfCode = 150000; // Mock data
  const defectDensity = ((totalDefects / totalLinesOfCode) * 1000).toFixed(2);

  // Calculate resolution rate
  // const resolvedDefects = filteredDefects.filter(d => d.status === 'resolved').length; // unused
  // const resolutionRate = ((resolvedDefects / totalDefects) * 100).toFixed(1); // unused

  // Calculate trend
  // const lastMonthDefects = 85; // Mock data, unused
  // const defectTrend = ((totalDefects - lastMonthDefects) / lastMonthDefects * 100).toFixed(1); // unused

  // Calculate Defect to Remark Ratio
  // const totalRemarks = 750; // Mock data, unused
  // const defectRemarkRatio = (totalRemarks / totalDefects).toFixed(1); // unused

  // Calculate Time to Find Defect (average days)
  // const avgTimeToFind = 2.5; // Mock data, unused

  // Calculate Time to Fix Defect (average days)
  // const avgTimeToFix = 3.2; // Mock data, unused

  // Calculate K-Log Input Defects
  // const klogDefects = 45; // Mock data, unused
  // const klogPercentage = ((klogDefects / totalDefects) * 100).toFixed(1); // unused

  // Calculate Defect Severity Index
  const severityIndex = (
    (criticalDefects * 4 + highPriorityDefects * 3 + 
     filteredDefects.filter(d => d.severity === 'medium').length * 2 +
     filteredDefects.filter(d => d.severity === 'low').length) / totalDefects
  ).toFixed(2);

  // Prepare data for priority chart (semi-circle)
  const priorityData = {
    labels: ['High', 'Medium', 'Low'],
    datasets: [{
      data: [
        filteredDefects.filter(d => d.priority === 'high').length,
        filteredDefects.filter(d => d.priority === 'medium').length,
        filteredDefects.filter(d => d.priority === 'low').length
      ],
      backgroundColor: ['#EF4444', '#F97316', '#34D399'],
      borderWidth: 0,
      circumference: 180,
      rotation: 270
    }]
  };

  // Prepare data for severity chart (full circle)
  const severityData = {
    labels: ['Critical', 'High', 'Medium', 'Low'],
    datasets: [{
      data: [
        filteredDefects.filter(d => d.severity === 'critical').length,
        filteredDefects.filter(d => d.severity === 'high').length,
        filteredDefects.filter(d => d.severity === 'medium').length,
        filteredDefects.filter(d => d.severity === 'low').length
      ],
      backgroundColor: ['#EF4444', '#F97316', '#FBBF24', '#34D399'],
      borderWidth: 0
    }]
  };

  const chartOptions = {
    cutout: '70%',
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        enabled: true
      }
    }
  };

  const semiCircleOptions = {
    ...chartOptions,
    circumference: 180,
    rotation: 270
  };

  // Mock data for calculations
  const defectsInDevelopment = filteredDefects.filter(d => d.status === 'in-progress').length;
  const defectsAfterRelease = filteredDefects.filter(d => d.status === 'open').length;
  const totalKLOC = 150; // Mock data for thousand lines of code

  // Calculate Defect Removal Efficiency (DRE)
  const calculateDRE = () => {
    const totalDefectsFound = defectsInDevelopment + defectsAfterRelease;
    if (totalDefectsFound === 0) return 0;
    return ((defectsInDevelopment / totalDefectsFound) * 100).toFixed(1);
  };

  // Calculate Defect Severity Index (DSI)
  const calculateDSI = () => {
    const criticalWeight = 4;
    const highWeight = 3;
    const mediumWeight = 2;
    const lowWeight = 1;

    const criticalDefects = defects.filter(d => d.severity === 'critical').length;
    const highDefects = defects.filter(d => d.severity === 'high').length;
    const mediumDefects = defects.filter(d => d.severity === 'medium').length;
    const lowDefects = defects.filter(d => d.severity === 'low').length;

    const weightedSum = (criticalDefects * criticalWeight) +
                       (highDefects * highWeight) +
                       (mediumDefects * mediumWeight) +
                       (lowDefects * lowWeight);

    return (weightedSum / totalDefects).toFixed(2);
  };

  // Calculate Defect Leakage
  const calculateDefectLeakage = () => {
    if (defectsInDevelopment === 0) return 0;
    return ((defectsAfterRelease / defectsInDevelopment) * 100).toFixed(1);
  };

  // Calculate Defect Density
  const calculateDefectDensity = () => {
    return (totalDefects / totalKLOC).toFixed(2);
  };

  // Prepare data for defect density gauge
  const densityGaugeData = {
    labels: ['Defect Density'],
    datasets: [{
      data: [calculateDefectDensity(), 10 - Number(calculateDefectDensity())], // Assuming max density of 10
      backgroundColor: ['#EF4444', '#E5E7EB'],
      borderWidth: 0,
      circumference: 180,
      rotation: 270
    }]
  };

  const gaugeOptions = {
    cutout: '80%',
    circumference: 180,
    rotation: 270,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        enabled: false
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">Overview of your project's health and metrics</p>
          </div>
        </div>
        {/* Project Selection Panel */}
        <div className="max-w-3xl mx-auto w-full">
          <ProjectSelector
            projects={projects}
            selectedProjectId={selectedProjectId}
            onSelect={setSelectedProjectId}
          />
        </div>
      </div>

      {/* Only show widgets if a project is selected */}
      {selectedProjectId && (
        <>
          {/* Defect Quality Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Defect Removal Efficiency */}
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
                    {calculateDRE()}%
                  </div>
                  <div className="text-sm text-gray-500">
                    {filteredDefects.filter(d => d.status === 'in-progress').length} defects caught in development
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Defect Severity Index */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-5 h-5 text-orange-500" />
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

            {/* Defect Density */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Gauge className="w-5 h-5 text-green-500" />
                    <h3 className="text-sm font-medium text-gray-700">Defect Density</h3>
                  </div>
                </div>
                <div className="relative h-24">
                  <Doughnut data={densityGaugeData} options={gaugeOptions} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {calculateDefectDensity()}
                      </div>
                      <div className="text-xs text-gray-500">defects/KLOC</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Total Defects */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Bug className="w-5 h-5 text-red-500" />
                    <h3 className="text-sm font-medium text-gray-700">Total Defects</h3>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-600 mb-1">
                    {totalDefects}
                  </div>
                  <div className="text-sm text-gray-500">
                    For selected project
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Trend Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900">Time to Fix Trend</h3>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={timeToFixData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Area 
                        type="monotone" 
                        dataKey="avgTime" 
                        name="Average Time" 
                        stroke="#3B82F6" 
                        fill="#93C5FD" 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="target" 
                        name="Target" 
                        stroke="#EF4444" 
                        strokeDasharray="5 5" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900">Defect to Remark Ratio Trend</h3>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={defectRemarkData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Legend />
                      <Line 
                        yAxisId="left"
                        type="monotone" 
                        dataKey="defects" 
                        name="Defects" 
                        stroke="#3B82F6" 
                        strokeWidth={2}
                      />
                      <Line 
                        yAxisId="right"
                        type="monotone" 
                        dataKey="remarks" 
                        name="Remarks" 
                        stroke="#10B981" 
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
      {/* If no project selected, show only selector */}
      {!selectedProjectId && (
        <div className="text-center text-gray-500 py-12">Please select a project to view details.</div>
      )}
    </div>
  );
};