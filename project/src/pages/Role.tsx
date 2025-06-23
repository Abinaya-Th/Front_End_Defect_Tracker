import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { ChevronLeft, Plus, Edit2, Trash2, UserCog } from 'lucide-react';

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  level: 'basic' | 'standard' | 'advanced' | 'admin';
  department: string;
  createdAt: string;
  updatedAt: string;
}

const Role: React.FC = () => {
  const navigate = useNavigate();
  const [roles, setRoles] = useState<Role[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [deletingRole, setDeletingRole] = useState<Role | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: [] as string[],
    level: 'basic' as Role["level"],
    department: ''
  });

  // Available permissions
  const availablePermissions = [
    'View Dashboard',
    'Manage Projects',
    'Create Defects',
    'Edit Defects',
    'Delete Defects',
    'Manage Test Cases',
    'Execute Tests',
    'Manage Employees',
    'View Reports',
    'Manage Configurations',
    'Admin Access'
  ];

  // Load mock data on component mount
  useEffect(() => {
    const mockRoles: Role[] = [
      {
        id: '1',
        name: 'Admin',
        description: 'Full system access with all permissions',
        permissions: ['Admin Access', 'View Dashboard', 'Manage Projects', 'Create Defects', 'Edit Defects', 'Delete Defects', 'Manage Test Cases', 'Execute Tests', 'Manage Employees', 'View Reports', 'Manage Configurations'],
        level: 'admin',
        department: 'IT',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z'
      },
      {
        id: '2',
        name: 'Project Manager',
        description: 'Manages projects and team coordination',
        permissions: ['View Dashboard', 'Manage Projects', 'Create Defects', 'Edit Defects', 'Manage Test Cases', 'View Reports'],
        level: 'advanced',
        department: 'Project Management',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z'
      },
      {
        id: '3',
        name: 'QA Engineer',
        description: 'Quality assurance and testing responsibilities',
        permissions: ['View Dashboard', 'Create Defects', 'Edit Defects', 'Manage Test Cases', 'Execute Tests', 'View Reports'],
        level: 'standard',
        department: 'Quality Assurance',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z'
      },
      {
        id: '4',
        name: 'Developer',
        description: 'Software development and defect resolution',
        permissions: ['View Dashboard', 'Create Defects', 'Edit Defects', 'View Reports'],
        level: 'standard',
        department: 'Engineering',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z'
      },
      {
        id: '5',
        name: 'Viewer',
        description: 'Read-only access to view information',
        permissions: ['View Dashboard', 'View Reports'],
        level: 'basic',
        department: 'General',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z'
      }
    ];
    setRoles(mockRoles);
  }, []);

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      permissions: [],
      level: 'basic',
      department: ''
    });
  };

  const handleCreate = () => {
    const newRole: Role = {
      id: Date.now().toString(),
      ...formData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setRoles([...roles, newRole]);
    setIsCreateModalOpen(false);
    resetForm();
  };

  const handleEdit = () => {
    if (!editingRole) return;
    
    const updatedRoles = roles.map(role =>
      role.id === editingRole.id
        ? { ...role, ...formData, updatedAt: new Date().toISOString() }
        : role
    );
    setRoles(updatedRoles);
    setIsEditModalOpen(false);
    setEditingRole(null);
    resetForm();
  };

  const handleDelete = () => {
    if (!deletingRole) return;
    
    const updatedRoles = roles.filter(
      role => role.id !== deletingRole.id
    );
    setRoles(updatedRoles);
    setIsDeleteModalOpen(false);
    setDeletingRole(null);
  };

  const openEditModal = (role: Role) => {
    setEditingRole(role);
    setFormData({
      name: role.name,
      description: role.description,
      permissions: role.permissions,
      level: role.level,
      department: role.department
    });
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (role: Role) => {
    setDeletingRole(role);
    setIsDeleteModalOpen(true);
  };

  const togglePermission = (permission: string) => {
    const updatedPermissions = formData.permissions.includes(permission)
      ? formData.permissions.filter(p => p !== permission)
      : [...formData.permissions, permission];
    setFormData({ ...formData, permissions: updatedPermissions });
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'basic': return 'bg-green-100 text-green-800';
      case 'standard': return 'bg-blue-100 text-blue-800';
      case 'advanced': return 'bg-purple-100 text-purple-800';
      case 'admin': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLevelLabel = (level: string) => {
    switch (level) {
      case 'basic': return 'Basic';
      case 'standard': return 'Standard';
      case 'advanced': return 'Advanced';
      case 'admin': return 'Admin';
      default: return level;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-8">
      {/* Back Button */}
      <div className="mb-6 flex justify-end">
        <Button
          variant="secondary"
          onClick={() => navigate('/configurations')}
          className="flex items-center"
        >
          <ChevronLeft className="w-5 h-5 mr-2" /> Back
        </Button>
      </div>

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center">
          <UserCog className="w-8 h-8 text-blue-500 mr-3" />
          <h1 className="text-3xl font-bold text-gray-900">Role Management</h1>
        </div>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create Role
        </Button>
      </div>

      {/* Roles Table */}
      <div className="overflow-x-auto rounded-lg shadow mb-8 max-w-2xl mx-auto">
        <table className="min-w-full divide-y divide-gray-200 text-base">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-5 py-3 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Role</th>
              <th className="px-5 py-3 text-center text-sm font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {roles.map((role) => (
              <tr key={role.id}>
                <td className="px-5 py-3 whitespace-nowrap font-semibold text-gray-900 text-base">{role.name}</td>
                <td className="px-5 py-3 whitespace-nowrap text-center">
                  <button
                    onClick={() => openEditModal(role)}
                    className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded mr-2"
                    title="Edit"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => openDeleteModal(role)}
                    className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                    title="Delete"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          resetForm();
        }}
        title="Create New Role"
        size="sm"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role Name
            </label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter role name"
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => {
                setIsCreateModalOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!formData.name}
            >
              Create
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingRole(null);
          resetForm();
        }}
        title="Edit Role"
        size="sm"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role Name
            </label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter role name"
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => {
                setIsEditModalOpen(false);
                setEditingRole(null);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleEdit}
              disabled={!formData.name}
            >
              Update
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingRole(null);
        }}
        title="Delete Role"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Are you sure you want to delete the role "{deletingRole?.name}"? 
            This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setDeletingRole(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Role; 