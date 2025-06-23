import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { ChevronLeft, Plus, Edit2, Trash2, Bug } from 'lucide-react';

interface DefectType {
  id: string;
  name: string;
  description: string;
  category: 'functional' | 'performance' | 'security' | 'usability' | 'compatibility' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  priority: 'low' | 'medium' | 'high' | 'critical';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const DefectType: React.FC = () => {
  const navigate = useNavigate();
  const [defectTypes, setDefectTypes] = useState<DefectType[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingDefectType, setEditingDefectType] = useState<DefectType | null>(null);
  const [deletingDefectType, setDeletingDefectType] = useState<DefectType | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'functional' as DefectType["category"],
    severity: 'medium' as DefectType["severity"],
    priority: 'medium' as DefectType["priority"],
    isActive: true
  });

  // Load mock data on component mount
  useEffect(() => {
    const mockDefectTypes: DefectType[] = [
      {
        id: '1',
        name: 'Functional Bug',
        description: 'Defects related to functionality not working as expected',
        category: 'functional',
        severity: 'high',
        priority: 'high',
        isActive: true,
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z'
      },
      {
        id: '2',
        name: 'Performance Issue',
        description: 'Defects related to slow performance or resource usage',
        category: 'performance',
        severity: 'medium',
        priority: 'medium',
        isActive: true,
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z'
      },
      {
        id: '3',
        name: 'Security Vulnerability',
        description: 'Defects related to security flaws and vulnerabilities',
        category: 'security',
        severity: 'critical',
        priority: 'critical',
        isActive: true,
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z'
      },
      {
        id: '4',
        name: 'UI/UX Issue',
        description: 'Defects related to user interface and user experience',
        category: 'usability',
        severity: 'medium',
        priority: 'medium',
        isActive: true,
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z'
      },
      {
        id: '5',
        name: 'Browser Compatibility',
        description: 'Defects related to cross-browser compatibility issues',
        category: 'compatibility',
        severity: 'low',
        priority: 'low',
        isActive: true,
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z'
      },
      {
        id: '6',
        name: 'Data Validation Error',
        description: 'Defects related to data validation and input handling',
        category: 'functional',
        severity: 'high',
        priority: 'high',
        isActive: true,
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z'
      },
      {
        id: '7',
        name: 'API Integration Issue',
        description: 'Defects related to API integration and communication',
        category: 'functional',
        severity: 'high',
        priority: 'high',
        isActive: true,
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z'
      },
      {
        id: '8',
        name: 'Memory Leak',
        description: 'Defects related to memory leaks and resource management',
        category: 'performance',
        severity: 'critical',
        priority: 'high',
        isActive: true,
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z'
      }
    ];
    setDefectTypes(mockDefectTypes);
  }, []);

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: 'functional' as DefectType["category"],
      severity: 'medium' as DefectType["severity"],
      priority: 'medium' as DefectType["priority"],
      isActive: true
    });
  };

  const handleCreate = () => {
    const newDefectType: DefectType = {
      id: Date.now().toString(),
      ...formData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setDefectTypes([...defectTypes, newDefectType]);
    setIsCreateModalOpen(false);
    resetForm();
  };

  const handleEdit = () => {
    if (!editingDefectType) return;
    
    const updatedDefectTypes = defectTypes.map(defectType =>
      defectType.id === editingDefectType.id
        ? { ...defectType, ...formData, updatedAt: new Date().toISOString() }
        : defectType
    );
    setDefectTypes(updatedDefectTypes);
    setIsEditModalOpen(false);
    setEditingDefectType(null);
    resetForm();
  };

  const handleDelete = () => {
    if (!deletingDefectType) return;
    
    const updatedDefectTypes = defectTypes.filter(
      defectType => defectType.id !== deletingDefectType.id
    );
    setDefectTypes(updatedDefectTypes);
    setIsDeleteModalOpen(false);
    setDeletingDefectType(null);
  };

  const openEditModal = (defectType: DefectType) => {
    setEditingDefectType(defectType);
    setFormData({
      name: defectType.name,
      description: defectType.description,
      category: defectType.category,
      severity: defectType.severity,
      priority: defectType.priority,
      isActive: defectType.isActive
    });
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (defectType: DefectType) => {
    setDeletingDefectType(defectType);
    setIsDeleteModalOpen(true);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'functional': return 'bg-blue-100 text-blue-800';
      case 'performance': return 'bg-orange-100 text-orange-800';
      case 'security': return 'bg-red-100 text-red-800';
      case 'usability': return 'bg-purple-100 text-purple-800';
      case 'compatibility': return 'bg-green-100 text-green-800';
      case 'other': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'functional': return 'Functional';
      case 'performance': return 'Performance';
      case 'security': return 'Security';
      case 'usability': return 'UI/UX';
      case 'compatibility': return 'Compatibility';
      case 'other': return 'Other';
      default: return category;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-blue-100 text-blue-800';
      case 'medium': return 'bg-purple-100 text-purple-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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
          <Bug className="w-8 h-8 text-blue-500 mr-3" />
          <h1 className="text-3xl font-bold text-gray-900">Defect Type Management</h1>
        </div>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create Defect Type
        </Button>
      </div>

      {/* Defect Types Table */}
      <div className="overflow-x-auto rounded-lg shadow mb-8 max-w-2xl mx-auto">
        <table className="min-w-full divide-y divide-gray-200 text-base">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-5 py-3 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Defect Type</th>
              <th className="px-5 py-3 text-center text-sm font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {defectTypes.map((defectType) => (
              <tr key={defectType.id}>
                <td className="px-5 py-3 whitespace-nowrap font-semibold text-gray-900 text-base">{defectType.name}</td>
                <td className="px-5 py-3 whitespace-nowrap text-center">
                  <button
                    onClick={() => openEditModal(defectType)}
                    className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded mr-2"
                    title="Edit"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => openDeleteModal(defectType)}
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
        title="Create New Defect Type"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Defect Type Name
            </label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter defect type name"
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
          setEditingDefectType(null);
          resetForm();
        }}
        title="Edit Defect Type"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Defect Type Name
            </label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter defect type name"
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => {
                setIsEditModalOpen(false);
                setEditingDefectType(null);
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
          setDeletingDefectType(null);
        }}
        title="Delete Defect Type"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Are you sure you want to delete the defect type "{deletingDefectType?.name}"? 
            This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setDeletingDefectType(null);
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

export default DefectType; 