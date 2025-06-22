import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { ChevronLeft, Plus, Edit2, Trash2, Briefcase } from 'lucide-react';

interface Designation {
  id: string;
  name: string;
  description: string;
  level: 'entry' | 'mid' | 'senior' | 'lead' | 'manager';
  department: string;
  createdAt: string;
  updatedAt: string;
}

const Designation: React.FC = () => {
  const navigate = useNavigate();
  const [designations, setDesignations] = useState<Designation[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingDesignation, setEditingDesignation] = useState<Designation | null>(null);
  const [deletingDesignation, setDeletingDesignation] = useState<Designation | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    level: 'entry' as const,
    department: ''
  });

  // Load mock data on component mount
  useEffect(() => {
    const mockDesignations: Designation[] = [
      {
        id: '1',
        name: 'Software Engineer',
        description: 'Develops software applications and systems',
        level: 'mid',
        department: 'Engineering',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z'
      },
      {
        id: '2',
        name: 'Senior Software Engineer',
        description: 'Leads development of complex software solutions',
        level: 'senior',
        department: 'Engineering',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z'
      },
      {
        id: '3',
        name: 'QA Engineer',
        description: 'Ensures software quality through testing',
        level: 'mid',
        department: 'Quality Assurance',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z'
      },
      {
        id: '4',
        name: 'Project Manager',
        description: 'Manages project delivery and team coordination',
        level: 'manager',
        department: 'Project Management',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z'
      },
      {
        id: '5',
        name: 'UI/UX Designer',
        description: 'Creates user interfaces and user experiences',
        level: 'mid',
        department: 'Design',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z'
      }
    ];
    setDesignations(mockDesignations);
  }, []);

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      level: 'entry',
      department: ''
    });
  };

  const handleCreate = () => {
    const newDesignation: Designation = {
      id: Date.now().toString(),
      ...formData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setDesignations([...designations, newDesignation]);
    setIsCreateModalOpen(false);
    resetForm();
  };

  const handleEdit = () => {
    if (!editingDesignation) return;
    
    const updatedDesignations = designations.map(designation =>
      designation.id === editingDesignation.id
        ? { ...designation, ...formData, updatedAt: new Date().toISOString() }
        : designation
    );
    setDesignations(updatedDesignations);
    setIsEditModalOpen(false);
    setEditingDesignation(null);
    resetForm();
  };

  const handleDelete = () => {
    if (!deletingDesignation) return;
    
    const updatedDesignations = designations.filter(
      designation => designation.id !== deletingDesignation.id
    );
    setDesignations(updatedDesignations);
    setIsDeleteModalOpen(false);
    setDeletingDesignation(null);
  };

  const openEditModal = (designation: Designation) => {
    setEditingDesignation(designation);
    setFormData({
      name: designation.name,
      description: designation.description,
      level: designation.level,
      department: designation.department
    });
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (designation: Designation) => {
    setDeletingDesignation(designation);
    setIsDeleteModalOpen(true);
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'entry': return 'bg-green-100 text-green-800';
      case 'mid': return 'bg-blue-100 text-blue-800';
      case 'senior': return 'bg-purple-100 text-purple-800';
      case 'lead': return 'bg-orange-100 text-orange-800';
      case 'manager': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLevelLabel = (level: string) => {
    switch (level) {
      case 'entry': return 'Entry Level';
      case 'mid': return 'Mid Level';
      case 'senior': return 'Senior';
      case 'lead': return 'Lead';
      case 'manager': return 'Manager';
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
          <Briefcase className="w-8 h-8 text-blue-500 mr-3" />
          <h1 className="text-3xl font-bold text-gray-900">Designation Management</h1>
        </div>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create Designation
        </Button>
      </div>

      {/* Designations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {designations.map((designation) => (
          <Card key={designation.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {designation.name}
                  </h3>
                  <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(designation.level)}`}>
                    {getLevelLabel(designation.level)}
                  </span>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => openEditModal(designation)}
                    className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => openDeleteModal(designation)}
                    className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-gray-600 mb-3">{designation.description}</p>
              <div className="text-sm text-gray-500">
                <p><strong>Department:</strong> {designation.department}</p>
                <p><strong>Created:</strong> {new Date(designation.createdAt).toLocaleDateString()}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          resetForm();
        }}
        title="Create New Designation"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Designation Name
            </label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter designation name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter description"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Level
            </label>
            <select
              value={formData.level}
              onChange={(e) => setFormData({ ...formData, level: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="entry">Entry Level</option>
              <option value="mid">Mid Level</option>
              <option value="senior">Senior</option>
              <option value="lead">Lead</option>
              <option value="manager">Manager</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Department
            </label>
            <Input
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              placeholder="Enter department"
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
              disabled={!formData.name || !formData.description || !formData.department}
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
          setEditingDesignation(null);
          resetForm();
        }}
        title="Edit Designation"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Designation Name
            </label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter designation name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter description"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Level
            </label>
            <select
              value={formData.level}
              onChange={(e) => setFormData({ ...formData, level: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="entry">Entry Level</option>
              <option value="mid">Mid Level</option>
              <option value="senior">Senior</option>
              <option value="lead">Lead</option>
              <option value="manager">Manager</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Department
            </label>
            <Input
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              placeholder="Enter department"
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => {
                setIsEditModalOpen(false);
                setEditingDesignation(null);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleEdit}
              disabled={!formData.name || !formData.description || !formData.department}
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
          setDeletingDesignation(null);
        }}
        title="Delete Designation"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Are you sure you want to delete the designation "{deletingDesignation?.name}"? 
            This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setDeletingDesignation(null);
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

export default Designation; 