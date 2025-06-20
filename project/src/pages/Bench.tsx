import React, { useState, useMemo } from 'react';
import { UserCheck, Calendar, Percent, ArrowRight, Eye, User, Search, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { Table, TableHeader, TableBody, TableRow, TableCell } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { DonutChart } from '../components/ui/DonutChart';
import { useApp } from '../context/AppContext';
import { Employee } from '../types';

export const Bench: React.FC = () => {
  const { employees, projects, allocateEmployee } = useApp();
  const [isAllocationModalOpen, setIsAllocationModalOpen] = useState(false);
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [viewingEmployee, setViewingEmployee] = useState<Employee | null>(null);
  const [filters, setFilters] = useState({
    search: '',
    designation: '',
    availability: '',
    fromDate: '',
    toDate: '',
  });
  const [allocationData, setAllocationData] = useState({
    projectId: '',
    allocationPercentage: 50,
    role: '',
    startDate: '',
    endDate: '',
  });

  // Filter employees based on criteria
  const filteredEmployees = useMemo(() => {
    return employees
      .filter(emp => emp.availability > 0) // Only show employees with availability > 0
      .filter(emp => {
        const matchesSearch = emp.firstName.toLowerCase().includes(filters.search.toLowerCase()) ||
                            emp.lastName.toLowerCase().includes(filters.search.toLowerCase()) ||
                            emp.designation.toLowerCase().includes(filters.search.toLowerCase());
        const matchesDesignation = !filters.designation || emp.designation === filters.designation;
        const matchesAvailability = !filters.availability || emp.availability >= parseInt(filters.availability);
        const matchesDateRange = (!filters.fromDate || new Date(emp.joinedDate) >= new Date(filters.fromDate)) &&
                                (!filters.toDate || new Date(emp.joinedDate) <= new Date(filters.toDate));
        
        return matchesSearch && matchesDesignation && matchesAvailability && matchesDateRange;
      })
      .sort((a, b) => b.availability - a.availability);
  }, [employees, filters]);

  // Get unique designations for filter dropdown
  const designations = useMemo(() => {
    return Array.from(new Set(employees.map(emp => emp.designation)));
  }, [employees]);

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleAllocate = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsAllocationModalOpen(true);
  };

  const handleViewEmployee = (employee: Employee) => {
    setViewingEmployee(employee);
    setIsEmployeeModalOpen(true);
  };

  const handleAllocationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedEmployee) {
      allocateEmployee({
        employeeId: selectedEmployee.id,
        ...allocationData,
      });
      setIsAllocationModalOpen(false);
      setSelectedEmployee(null);
      setAllocationData({
        projectId: '',
        allocationPercentage: 50,
        role: '',
        startDate: '',
        endDate: '',
      });
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setAllocationData(prev => ({ ...prev, [field]: value }));
  };

  const getAvailabilityColor = (availability: number) => {
    if (availability >= 80) return 'text-green-600';
    if (availability >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getAvailabilityStatus = (availability: number) => {
    if (availability >= 80) return { label: 'Highly Available', variant: 'success' as const };
    if (availability >= 50) return { label: 'Partially Available', variant: 'warning' as const };
    return { label: 'Busy', variant: 'error' as const };
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bench Management</h1>
          <p className="text-gray-600 mt-1">Manage employee availability and project allocations</p>
        </div>
      </div>

      {/* Simplified Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search employees..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="pl-10"
              />
            </div>
            
            <select
              value={filters.designation}
              onChange={(e) => handleFilterChange('designation', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[180px]"
            >
              <option value="">All Designations</option>
              {designations.map((designation) => (
                <option key={designation} value={designation}>
                  {designation}
                </option>
              ))}
            </select>

            <select
              value={filters.availability}
              onChange={(e) => handleFilterChange('availability', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[180px]"
            >
              <option value="">All Availability</option>
              <option value="80">80% and above</option>
              <option value="50">50% and above</option>
              <option value="30">30% and above</option>
              <option value="10">10% and above</option>
            </select>

            <div className="flex gap-2 min-w-[300px]">
              <Input
                type="date"
                value={filters.fromDate}
                onChange={(e) => handleFilterChange('fromDate', e.target.value)}
                placeholder="From Date"
                className="flex-1"
              />
              <Input
                type="date"
                value={filters.toDate}
                onChange={(e) => handleFilterChange('toDate', e.target.value)}
                placeholder="To Date"
                className="flex-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bench Table */}
      <Card className="shadow-lg">
        <CardHeader>
          <h3 className="text-xl font-semibold text-gray-900">Employee Bench</h3>
          <p className="text-gray-600">Click on employee names to view detailed information</p>
        </CardHeader>
        <CardContent className="p-0">
          {filteredEmployees.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell header>Employee</TableCell>
                  <TableCell header>Designation</TableCell>
                  <TableCell header>Availability</TableCell>
                  <TableCell header>Available Period</TableCell>
                  <TableCell header>Current Projects</TableCell>
                  <TableCell header>Actions</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.map((employee) => {
                  const availabilityStatus = getAvailabilityStatus(employee.availability);
                  return (
                    <TableRow key={employee.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-semibold text-sm">
                              {employee.firstName.charAt(0)}{employee.lastName.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <button
                              onClick={() => handleViewEmployee(employee)}
                              className="font-semibold text-blue-600 hover:text-blue-800 transition-colors duration-200"
                            >
                              {employee.firstName} {employee.lastName}
                            </button>
                            <p className="text-sm text-gray-500">{employee.department}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium text-gray-900">{employee.designation}</p>
                        <p className="text-sm text-gray-500">{employee.experience} years exp</p>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <DonutChart 
                            percentage={employee.availability} 
                            size={50}
                            strokeWidth={4}
                          />
                          <div>
                            <p className={`font-semibold ${getAvailabilityColor(employee.availability)}`}>
                              {employee.availability}%
                            </p>
                            <Badge variant={availabilityStatus.variant} size="sm">
                              {availabilityStatus.label}
                            </Badge>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-600">
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {new Date(employee.joinedDate).toLocaleDateString()} - Present
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {employee.currentProjects.length > 0 ? (
                          <div className="space-y-1">
                            {employee.currentProjects.slice(0, 2).map((project, index) => (
                              <Badge key={index} variant="info" size="sm">
                                {project}
                              </Badge>
                            ))}
                            {employee.currentProjects.length > 2 && (
                              <p className="text-xs text-gray-500">
                                +{employee.currentProjects.length - 2} more
                              </p>
                            )}
                          </div>
                        ) : (
                          <Badge variant="default" size="sm">No projects</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewEmployee(employee)}
                            className="p-2 hover:bg-blue-50 text-blue-600"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleAllocate(employee)}
                            disabled={employee.availability < 10}
                            className="shadow-sm"
                          >
                            <ArrowRight className="w-4 h-4 mr-1" />
                            Allocate
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="p-12 text-center">
              <UserCheck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No employees found</h3>
              <p className="text-gray-500">Try adjusting your filters or add employees to the bench</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Allocation Modal */}
      <Modal
        isOpen={isAllocationModalOpen}
        onClose={() => {
          setIsAllocationModalOpen(false);
          setSelectedEmployee(null);
        }}
        title={`Allocate ${selectedEmployee?.firstName} ${selectedEmployee?.lastName}`}
        size="lg"
      >
        <form onSubmit={handleAllocationSubmit} className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center space-x-3">
              <DonutChart 
                percentage={selectedEmployee?.availability || 0} 
                size={60}
                strokeWidth={6}
              />
              <div>
                <p className="font-semibold text-gray-900">
                  Current Availability: {selectedEmployee?.availability}%
                </p>
                <p className="text-sm text-gray-600">
                  {selectedEmployee?.designation} • {selectedEmployee?.department}
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Project
            </label>
            <select
              value={allocationData.projectId}
              onChange={(e) => handleInputChange('projectId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Choose a project</option>
              {projects.filter(p => p.status === 'active').map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name} - {project.manager}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Allocation Percentage
              </label>
              <input
                type="range"
                min="10"
                max={selectedEmployee?.availability || 100}
                value={allocationData.allocationPercentage}
                onChange={(e) => handleInputChange('allocationPercentage', parseInt(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-gray-500 mt-1">
                <span>10%</span>
                <span className="font-semibold text-blue-600">
                  {allocationData.allocationPercentage}%
                </span>
                <span>{selectedEmployee?.availability}%</span>
              </div>
            </div>
            
            <Input
              label="Role in Project"
              value={allocationData.role}
              onChange={(e) => handleInputChange('role', e.target.value)}
              placeholder="e.g., Frontend Developer"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Start Date"
              type="date"
              value={allocationData.startDate}
              onChange={(e) => handleInputChange('startDate', e.target.value)}
              required
            />
            <Input
              label="End Date (Optional)"
              type="date"
              value={allocationData.endDate}
              onChange={(e) => handleInputChange('endDate', e.target.value)}
            />
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> After allocation, the employee's availability will be reduced to{' '}
              <strong>{(selectedEmployee?.availability || 0) - allocationData.allocationPercentage}%</strong>
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsAllocationModalOpen(false);
                setSelectedEmployee(null);
              }}
            >
              Cancel
            </Button>
            <Button type="submit">
              Allocate to Project
            </Button>
          </div>
        </form>
      </Modal>

      {/* Employee Details Modal */}
      <Modal
        isOpen={isEmployeeModalOpen}
        onClose={() => {
          setIsEmployeeModalOpen(false);
          setViewingEmployee(null);
        }}
        title="Employee Details"
        size="xl"
      >
        {viewingEmployee && (
          <div className="space-y-6">
            <div className="flex items-center space-x-6">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-2xl">
                  {viewingEmployee.firstName.charAt(0)}{viewingEmployee.lastName.charAt(0)}
                </span>
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900">
                  {viewingEmployee.firstName} {viewingEmployee.lastName}
                </h3>
                <p className="text-lg text-gray-600">{viewingEmployee.designation}</p>
                <div className="flex items-center space-x-4 mt-2">
                  <Badge 
                    variant={viewingEmployee.status === 'active' ? 'success' : 
                            viewingEmployee.status === 'on-leave' ? 'warning' : 'error'}
                  >
                    {viewingEmployee.status}
                  </Badge>
                  <Badge variant="info">{viewingEmployee.experience} years experience</Badge>
                </div>
              </div>
              <div className="text-center">
                <DonutChart 
                  percentage={viewingEmployee.availability} 
                  size={80}
                  strokeWidth={8}
                />
                <p className="text-sm font-semibold text-gray-700 mt-2">
                  {viewingEmployee.availability}% Available
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    Personal Information
                  </h4>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span className="font-medium">{viewingEmployee.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Phone:</span>
                      <span className="font-medium">{viewingEmployee.phone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Department:</span>
                      <span className="font-medium">{viewingEmployee.department}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Joined Date:</span>
                      <span className="font-medium">
                        {new Date(viewingEmployee.joinedDate).toLocaleDateString()}
                      </span>
                    </div>
                    {viewingEmployee.manager && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Manager:</span>
                        <span className="font-medium">{viewingEmployee.manager}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Skills & Expertise</h4>
                  <div className="flex flex-wrap gap-2">
                    {viewingEmployee.skills.map((skill, index) => (
                      <Badge key={index} variant="info">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Current Projects</h4>
                  {viewingEmployee.currentProjects.length > 0 ? (
                    <div className="space-y-2">
                      {viewingEmployee.currentProjects.map((projectName, index) => {
                        const project = projects.find(p => p.name === projectName);
                        return (
                          <div key={index} className="bg-green-50 p-3 rounded-lg border border-green-200">
                            <p className="font-medium text-green-900">{projectName}</p>
                            {project && (
                              <div className="text-sm text-green-700 mt-1">
                                <p>Manager: {project.manager}</p>
                                <p>Status: {project.status}</p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="bg-gray-50 p-4 rounded-lg text-center">
                      <p className="text-gray-500">No current projects assigned</p>
                      <p className="text-sm text-gray-400 mt-1">Available for new assignments</p>
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Availability Timeline</h4>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-blue-900 font-medium">Current Availability</span>
                      <span className="text-blue-900 font-bold">{viewingEmployee.availability}%</span>
                    </div>
                    <div className="w-full bg-blue-200 rounded-full h-3">
                      <div 
                        className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${viewingEmployee.availability}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-blue-700 mt-2">
                      {viewingEmployee.availability >= 80 ? 'Highly available for new projects' :
                       viewingEmployee.availability >= 50 ? 'Partially available' :
                       'Currently busy with existing commitments'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button
                onClick={() => handleAllocate(viewingEmployee)}
                disabled={viewingEmployee.availability < 10}
                className="shadow-lg"
              >
                <ArrowRight className="w-4 h-4 mr-2" />
                Allocate to Project
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};