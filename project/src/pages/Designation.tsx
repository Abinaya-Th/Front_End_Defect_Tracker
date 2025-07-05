import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { ChevronLeft, Plus, Edit2, Trash2, Briefcase } from 'lucide-react';
import axios from 'axios';

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
    name: ''
  
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const baseUrl=import.meta.env.VITE_BASE_URL;

  // Fetch designations from API on mount
  const fetchDesignations = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${baseUrl}designation`);
      setDesignations(
        (response.data.data || []).map((item: any) => ({
          id: item.id.toString(),
          name: item.name,
          description: item.description || '',
          level: item.level || 'entry',
          department: item.department || '',
          createdAt: item.createdAt || '',
          updatedAt: item.updatedAt || ''
        }))
      );
    } catch (err: any) {
      setError('Failed to fetch designations');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDesignations();
  }, []);

  const resetForm = () => {
    setFormData({
      name: ''
    
    });
  };

  const handleCreate = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await axios.post(`${baseUrl}designation`, formData);
      await fetchDesignations(); // Refresh the list from backend
      setIsCreateModalOpen(false);
      resetForm();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create designation');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!editingDesignation) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.put(
        `${baseUrl}designation/${editingDesignation.id}`,
        formData
      );
      const updatedDesignation: Designation = {
        ...editingDesignation,
        ...formData,
        updatedAt: response.data.updatedAt || new Date().toISOString()
      };
      setDesignations(
        designations.map((designation) =>
          designation.id === editingDesignation.id ? updatedDesignation : designation
        )
      );
      setIsEditModalOpen(false);
      setEditingDesignation(null);
      resetForm();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update designation');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingDesignation) return;
    setIsLoading(true);
    setError(null);
    try {
      await axios.delete(`${baseUrl}designation/${deletingDesignation.id}`);
      setDesignations(
        designations.filter((designation) => designation.id !== deletingDesignation.id)
      );
      setIsDeleteModalOpen(false);
      setDeletingDesignation(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete designation');
    } finally {
      setIsLoading(false);
    }
  };

  const openEditModal = (designation: Designation) => {
    setEditingDesignation(designation);
    setFormData({
      name: designation.name
    
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

      {/* Designations Table */}
      <div className="overflow-x-auto rounded-lg shadow mb-8 max-w-2xl mx-auto">
        <table className="min-w-full divide-y divide-gray-200 text-base">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-5 py-3 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Designation Name</th>
              <th className="px-5 py-3 text-center text-sm font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {designations.length === 0 && !isLoading && !error && (
              <tr>
                <td colSpan={2} className="px-5 py-3 text-center text-gray-500">
                  No designations found.
                </td>
              </tr>
            )}
            {error && (
              <tr>
                <td colSpan={2} className="px-5 py-3 text-center text-red-600">
                  {error}
                </td>
              </tr>
            )}
            {designations.map((designation) => (
              <tr key={designation.id}>
                <td className="px-5 py-3 whitespace-nowrap font-semibold text-gray-900 text-base">{designation.name}</td>
                <td className="px-5 py-3 whitespace-nowrap text-center">
                  <button
                    onClick={() => openEditModal(designation)}
                    className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded mr-2"
                    title="Edit"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => openDeleteModal(designation)}
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
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => {
                setIsCreateModalOpen(false);
                resetForm();
              }}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!formData.name || isLoading}
            >
              {isLoading ? 'Creating...' : 'Create'}
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