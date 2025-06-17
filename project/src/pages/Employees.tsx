import React, { useState } from 'react';
import { Plus, Edit, Trash2, Eye, Mail, Phone, Calendar, Award } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { Table, TableHeader, TableBody, TableRow, TableCell } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { useApp } from '../context/AppContext';
import { Employee } from '../types';

export const Employees: React.FC = () => {
  const { employees, addEmployee, updateEmployee, deleteEmployee } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [viewingEmployee, setViewingEmployee] = useState<Employee | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    designation: '',
    experience: 0,
    joinedDate: '',
    skills: '',
    department: '',
    manager: '',
    availability: 100,
    status: 'active' as 'active' | 'inactive' | 'on-leave',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const employeeData = {
      ...formData,
      skills: formData.skills.split(',').map(skill => skill.trim()).filter(Boolean),
      currentProjects: [],
    };

    if (editingEmployee) {
      updateEmployee(editingEmployee.id, employeeData);
      setEditingEmployee(null);
    } else {
      addEmployee(employeeData);
    }

    resetForm();
    setIsModalOpen(false);
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      designation: '',
      experience: 0,
      joinedDate: '',
      skills: '',
      department: '',
      manager: '',
      availability: 100,
      status: 'active',
    });
  };

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setFormData({
      firstName: employee.firstName,
      lastName: employee.lastName,
      email: employee.email,
      phone: employee.phone,
      designation: employee.designation,
      experience: employee.experience,
      joinedDate: employee.joinedDate,
      skills: employee.skills.join(', '),
      department: employee.department,
      manager: employee.manager || '',
      availability: employee.availability,
      status: employee.status,
    });
    setIsModalOpen(true);
  };

  const handleView = (employee: Employee) => {
    setViewingEmployee(employee);
    setIsViewModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      deleteEmployee(id);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">Active</Badge>;
      case 'inactive':
        return <Badge variant="error">Inactive</Badge>;
      case 'on-leave':
        return <Badge variant="warning">On Leave</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Employee Management</h1>
          <p className="text-gray-600 mt-1">Manage your team members and their information</p>
        </div>
        <Button 
          onClick={() => {
            resetForm();
            setEditingEmployee(null);
            setIsModalOpen(true);
          }} 
          icon={Plus}
          className="shadow-lg hover:shadow-xl transition-shadow duration-200"
        >
          Add Employee
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">Total Employees</p>
                <p className="text-3xl font-bold">{employees.length}</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Award className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100">Active</p>
                <p className="text-3xl font-bold">
                  {employees.filter(emp => emp.status === 'active').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Award className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100">On Leave</p>
                <p className="text-3xl font-bold">
                  {employees.filter(emp => emp.status === 'on-leave').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Employee Table */}
      <Card className="shadow-lg">
        <CardHeader>
          <h3 className="text-xl font-semibold text-gray-900">Employee Directory</h3>
        </CardHeader>
        <CardContent className="p-0">
          {employees.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell header>Employee</TableCell>
                  <TableCell header>Contact</TableCell>
                  <TableCell header>Role</TableCell>
                  <TableCell header>Department</TableCell>
                  <TableCell header>Experience</TableCell>
                  <TableCell header>Status</TableCell>
                  <TableCell header>Actions</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">
                            {employee.firstName.charAt(0)}{employee.lastName.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {employee.firstName} {employee.lastName}
                          </p>
                          <p className="text-sm text-gray-500">ID: {employee.id}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-gray-600">
                          <Mail className="w-4 h-4 mr-2" />
                          {employee.email}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone className="w-4 h-4 mr-2" />
                          {employee.phone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium text-gray-900">{employee.designation}</p>
                      <p className="text-sm text-gray-500">
                        Joined: {new Date(employee.joinedDate).toLocaleDateString()}
                      </p>
                    </TableCell>
                    <TableCell>
                      <p className="text-gray-900">{employee.department}</p>
                      {employee.manager && (
                        <p className="text-sm text-gray-500">Manager: {employee.manager}</p>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="info">{employee.experience} years</Badge>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(employee.status)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleView(employee)}
                          className="p-2 hover:bg-blue-50 text-blue-600"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(employee)}
                          className="p-2 hover:bg-yellow-50 text-yellow-600"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(employee.id)}
                          className="p-2 hover:bg-red-50 text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="p-12 text-center">
              <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No employees yet</h3>
              <p className="text-gray-500 mb-4">Get started by adding your first employee</p>
              <Button onClick={() => setIsModalOpen(true)} icon={Plus}>
                Add Employee
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Employee Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingEmployee(null);
          resetForm();
        }}
        title={editingEmployee ? 'Edit Employee' : 'Add New Employee'}
        size="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="First Name"
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              required
            />
            <Input
              label="Last Name"
              value={formData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              required
            />
            <Input
              label="Phone"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Designation"
              value={formData.designation}
              onChange={(e) => handleInputChange('designation', e.target.value)}
              required
            />
            <Input
              label="Department"
              value={formData.department}
              onChange={(e) => handleInputChange('department', e.target.value)}
              required
            />
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Experience (Years)"
              type="number"
              value={formData.experience}
              onChange={(e) => handleInputChange('experience', parseInt(e.target.value) || 0)}
              required
            />
            <Input
              label="Joined Date"
              type="date"
              value={formData.joinedDate}
              onChange={(e) => handleInputChange('joinedDate', e.target.value)}
              required
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="on-leave">On Leave</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Manager"
              value={formData.manager}
              onChange={(e) => handleInputChange('manager', e.target.value)}
            />
            <Input
              label="Availability (%)"
              type="number"
              min="0"
              max="100"
              value={formData.availability}
              onChange={(e) => handleInputChange('availability', parseInt(e.target.value) || 0)}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Skills (comma-separated)
            </label>
            <textarea
              value={formData.skills}
              onChange={(e) => handleInputChange('skills', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              placeholder="React, Node.js, TypeScript, etc."
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsModalOpen(false);
                setEditingEmployee(null);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button type="submit">
              {editingEmployee ? 'Update Employee' : 'Add Employee'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* View Employee Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setViewingEmployee(null);
        }}
        title="Employee Details"
        size="lg"
      >
        {viewingEmployee && (
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xl">
                  {viewingEmployee.firstName.charAt(0)}{viewingEmployee.lastName.charAt(0)}
                </span>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {viewingEmployee.firstName} {viewingEmployee.lastName}
                </h3>
                <p className="text-gray-600">{viewingEmployee.designation}</p>
                {getStatusBadge(viewingEmployee.status)}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Contact Information</h4>
                  <div className="space-y-2">
                    <div className="flex items-center text-gray-600">
                      <Mail className="w-4 h-4 mr-2" />
                      {viewingEmployee.email}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Phone className="w-4 h-4 mr-2" />
                      {viewingEmployee.phone}
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Work Information</h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Department:</span> {viewingEmployee.department}</p>
                    <p><span className="font-medium">Experience:</span> {viewingEmployee.experience} years</p>
                    <p><span className="font-medium">Joined:</span> {new Date(viewingEmployee.joinedDate).toLocaleDateString()}</p>
                    {viewingEmployee.manager && (
                      <p><span className="font-medium">Manager:</span> {viewingEmployee.manager}</p>
                    )}
                    <p><span className="font-medium">Availability:</span> {viewingEmployee.availability}%</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {viewingEmployee.skills.map((skill, index) => (
                      <Badge key={index} variant="info" size="sm">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Current Projects</h4>
                  {viewingEmployee.currentProjects.length > 0 ? (
                    <div className="space-y-1">
                      {viewingEmployee.currentProjects.map((project, index) => (
                        <Badge key={index} variant="success" size="sm">
                          {project}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No current projects</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};