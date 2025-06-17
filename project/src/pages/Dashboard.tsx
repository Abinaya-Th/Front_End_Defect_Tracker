import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useApp } from '../context/AppContext';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend, AreaChart, Area
} from 'recharts';
import { 
  AlertTriangle, Bug, CheckCircle, Clock, 
  TrendingUp, TrendingDown, ArrowUp, ArrowDown,
  Filter, Calendar, Users, FolderGit2, MessageSquare,
  Timer, BookOpen, Gauge, Activity, AlertCircle, Zap
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
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('30d');

  // Calculate metrics
  const totalDefects = defects.length;
  const openDefects = defects.filter(d => d.status === 'open').length;
  const criticalDefects = defects.filter(d => d.severity === 'critical').length;
  const highPriorityDefects = defects.filter(d => d.priority === 'high').length;

  // Calculate defect density (defects per 1000 lines of code)
  const totalLinesOfCode = 150000; // Mock data
  const defectDensity = ((totalDefects / totalLinesOfCode) * 1000).toFixed(2);

  // Calculate resolution rate
  const resolvedDefects = defects.filter(d => d.status === 'resolved').length;
  const resolutionRate = ((resolvedDefects / totalDefects) * 100).toFixed(1);

  // Calculate trend
  const lastMonthDefects = 85; // Mock data
  const defectTrend = ((totalDefects - lastMonthDefects) / lastMonthDefects * 100).toFixed(1);

  // Calculate Defect to Remark Ratio
  const totalRemarks = 750; // Mock data
  const defectRemarkRatio = (totalRemarks / totalDefects).toFixed(1);

  // Calculate Time to Find Defect (average days)
  const avgTimeToFind = 2.5; // Mock data

  // Calculate Time to Fix Defect (average days)
  const avgTimeToFix = 3.2; // Mock data

  // Calculate K-Log Input Defects
  const klogDefects = 45; // Mock data
  const klogPercentage = ((klogDefects / totalDefects) * 100).toFixed(1);

  // Calculate Defect Severity Index
  const severityIndex = (
    (criticalDefects * 4 + highPriorityDefects * 3 + 
     defects.filter(d => d.severity === 'medium').length * 2 +
     defects.filter(d => d.severity === 'low').length) / totalDefects
  ).toFixed(2);

  // Prepare data for priority chart (semi-circle)
  const priorityData = {
    labels: ['High', 'Medium', 'Low'],
    datasets: [{
      data: [
        defects.filter(d => d.priority === 'high').length,
        defects.filter(d => d.priority === 'medium').length,
        defects.filter(d => d.priority === 'low').length
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
        defects.filter(d => d.severity === 'critical').length,
        defects.filter(d => d.severity === 'high').length,
        defects.filter(d => d.severity === 'medium').length,
        defects.filter(d => d.severity === 'low').length
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
  const defectsInDevelopment = defects.filter(d => d.status === 'in-progress').length;
  const defectsAfterRelease = defects.filter(d => d.status === 'open').length;
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Overview of your project's health and metrics</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select 
              className="border rounded-md px-2 py-1 text-sm"
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
            >
              <option value="all">All Projects</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>{project.name}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <select 
              className="border rounded-md px-2 py-1 text-sm"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
          </div>
          <Button>Generate Report</Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100">Open Defects</p>
                <p className="text-3xl font-bold">{defects.filter(d => d.status === 'open').length}</p>
                <div className="flex items-center mt-2">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  <span className="text-sm">needs attention</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <AlertCircle className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100">Closed Defects</p>
                <p className="text-3xl font-bold">{defects.filter(d => d.status === 'closed').length}</p>
                <div className="flex items-center mt-2">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  <span className="text-sm">resolved</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100">In Progress</p>
                <p className="text-3xl font-bold">{defects.filter(d => d.status === 'in-progress').length}</p>
                <div className="flex items-center mt-2">
                  <Clock className="w-4 h-4 mr-1" />
                  <span className="text-sm">being worked on</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">Resolved</p>
                <p className="text-3xl font-bold">{defects.filter(d => d.status === 'resolved').length}</p>
                <div className="flex items-center mt-2">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  <span className="text-sm">awaiting closure</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add a new Defect Status Summary Card */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900">Defect Status Summary</h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { status: 'open', label: 'Open', color: 'bg-red-100 text-red-800', icon: AlertCircle },
              { status: 'in-progress', label: 'In Progress', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
              { status: 'resolved', label: 'Resolved', color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
              { status: 'closed', label: 'Closed', color: 'bg-green-100 text-green-800', icon: CheckCircle }
            ].map(({ status, label, color, icon: Icon }) => {
              const count = defects.filter(d => d.status === status).length;
              const percentage = ((count / totalDefects) * 100).toFixed(1);
              
              return (
                <div key={status} className="p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Icon className={`w-5 h-5 ${color.split(' ')[1]}`} />
                      <span className="font-medium text-gray-900">{label}</span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}>
                      {percentage}%
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{count}</div>
                  <div className="mt-2 w-full bg-gray-100 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${color.split(' ')[0]}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

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
                {defectsInDevelopment} defects caught in development
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
                {calculateDSI()}
              </div>
              <div className="text-sm text-gray-500">
                Weighted severity score
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Defect Leakage */}
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
                {calculateDefectLeakage()}%
              </div>
              <div className="text-sm text-gray-500">
                {defectsAfterRelease} defects leaked to production
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
      </div>

      {/* Defect Analytics Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardContent className="p-6">
            <div className="space-y-6">
              {/* Priority Chart (Semi-circle) */}
              <div className="relative h-32">
                <Doughnut data={priorityData} options={semiCircleOptions} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-sm text-gray-500">Priority</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {defects.filter(d => d.priority === 'high').length} High
                    </p>
                  </div>
                </div>
              </div>

              {/* Severity Chart (Full circle) */}
              <div className="relative h-32">
                <Doughnut data={severityData} options={chartOptions} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-sm text-gray-500">Severity</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {defects.filter(d => d.severity === 'critical').length} Critical
                    </p>
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">Priority</p>
                  {['High', 'Medium', 'Low'].map((priority, index) => (
                    <div key={priority} className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ 
                          backgroundColor: 
                            priority === 'High' ? '#EF4444' :
                            priority === 'Medium' ? '#F97316' :
                            '#34D399'
                        }}
                      />
                      <span className="text-sm text-gray-600">{priority}</span>
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">Severity</p>
                  {['Critical', 'High', 'Medium', 'Low'].map((severity, index) => (
                    <div key={severity} className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ 
                          backgroundColor: 
                            severity === 'Critical' ? '#EF4444' :
                            severity === 'High' ? '#F97316' :
                            severity === 'Medium' ? '#FBBF24' :
                            '#34D399'
                        }}
                      />
                      <span className="text-sm text-gray-600">{severity}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Defects and Project */}
              <div className="pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500">Total Defects</p>
                    <p className="text-2xl font-bold text-gray-900">{defects.length}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Project</p>
                    <p className="text-sm font-medium text-gray-900">
                      {projects.find(p => p.id === selectedProject)?.name || 'All Projects'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Defect Density */}
              <div className="bg-orange-50 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-orange-800">Defect Density</span>
                  <span className="text-lg font-bold text-orange-900">{defectDensity}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">Defect Severity Index</h3>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-4xl font-bold text-gray-900">{severityIndex}</div>
              <div className="w-32 h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={defectDistributionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={30}
                      outerRadius={50}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {defectDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              {defectDistributionData.map((item, index) => (
                <div key={item.name} className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-sm text-gray-600">{item.name}</span>
                  <span className="text-sm font-medium">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">Defect Status Overview</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {['open', 'in-progress', 'resolved', 'closed'].map((status) => {
                const count = defects.filter(d => d.status === status).length;
                const percentage = ((count / totalDefects) * 100).toFixed(1);
                return (
                  <div key={status} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600 capitalize">{status}</span>
                      <span className="text-sm font-medium text-gray-900">{count}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full"
                        style={{ 
                          width: `${percentage}%`,
                          backgroundColor: 
                            status === 'open' ? '#EF4444' :
                            status === 'in-progress' ? '#F97316' :
                            status === 'resolved' ? '#34D399' :
                            '#10B981'
                        }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trend Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">Defect Trend by Severity</h3>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={defectTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="critical" name="Critical" fill="#EF4444" />
                  <Bar dataKey="high" name="High" fill="#F97316" />
                  <Bar dataKey="medium" name="Medium" fill="#FBBF24" />
                  <Bar dataKey="low" name="Low" fill="#34D399" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

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
      </div>

      {/* Defect to Remark Ratio Trend */}
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
  );
};