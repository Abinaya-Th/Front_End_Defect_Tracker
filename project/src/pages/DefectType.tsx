import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { ChevronLeft, Plus, Edit2, Trash2, Bug } from 'lucide-react';
import { createDefectType, getDefectTypes, getDefectTypeById, updateDefectType, deleteDefectType } from '../api/defectType';
import AlertModal from '../components/ui/AlertModal';

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

  // Alert state for different actions
  const [createAlert, setCreateAlert] = useState({
    isOpen: false,
    message: '',
  });
  const [editAlert, setEditAlert] = useState({
    isOpen: false,
    message: '',
  });
  const [deleteAlert, setDeleteAlert] = useState({
    isOpen: false,
    message: '',
  });

  // Pending success flags
  const [pendingCreateSuccess, setPendingCreateSuccess] = useState(false);
  const [pendingEditSuccess, setPendingEditSuccess] = useState(false);
  const [pendingDeleteSuccess, setPendingDeleteSuccess] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;
  const totalPages = Math.ceil(defectTypes.length / pageSize);
  const paginatedDefectTypes = defectTypes.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  useEffect(() => {
    const fetchDefectTypes = async () => {
      try {
        const response = await getDefectTypes();
        if (response.status === 'success') {
          const transformedData = response.data.map(d => ({
            ...d,
            id: d.id.toString(),
            name: d.defectTypeName
          }));
          setDefectTypes(transformedData);
        } else {
          console.error("Failed to fetch defect types:", response.message);
        }
      } catch (error) {
        console.error("Error fetching defect types:", error);
      }
    };
    fetchDefectTypes();
    // Reset all alert popups on mount so none show at page load
    setCreateAlert({ isOpen: false, message: '' });
    setEditAlert({ isOpen: false, message: '' });
    setDeleteAlert({ isOpen: false, message: '' });
    setCurrentPage(1); // Reset to first page on mount
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

  const handleCreate = async () => {
    try {
      const response = await createDefectType({ defectTypeName: formData.name });
      if (response.status === 'success') {
        const newDefectType: DefectType = {
          id: response.data.id.toString(),
          name: response.data.defectTypeName,
          description: formData.description,
          category: formData.category,
          severity: formData.severity,
          priority: formData.priority,
          isActive: formData.isActive,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        setDefectTypes([...defectTypes, newDefectType]);
        setIsCreateModalOpen(false);
        resetForm();
        setPendingCreateSuccess(true);
      } else {
        setCreateAlert({ isOpen: true, message: 'Failed to create defect type: ' + response.message });
      }
    } catch (error: any) {
      // Check if it's a validation error (400 status)
      if (error.response?.status === 400) {
        setCreateAlert({ isOpen: true, message: 'Defect Type name can only contain alphabets.' });
      } else {
        setCreateAlert({ isOpen: true, message: 'Failed to create defect type: ' + error });
      }
    }
  };

  // Show create alert after modal closes
  useEffect(() => {
    if (!isCreateModalOpen && pendingCreateSuccess) {
      setCreateAlert({ isOpen: true, message: 'Defect type created successfully!' });
      setPendingCreateSuccess(false);
    }
  }, [isCreateModalOpen, pendingCreateSuccess]);

  const handleEdit = async () => {
    if (!editingDefectType) return;
    
    try {
      const payload = {
        defectTypeName: formData.name,
        description: formData.description,
        category: formData.category,
        severity: formData.severity,
        priority: formData.priority,
        isActive: formData.isActive
      };
      
      const response = await updateDefectType(editingDefectType.id, payload);
      
      if (response.status === 'success') {
        const updatedDefectTypes = defectTypes.map(defectType =>
          defectType.id === editingDefectType.id
            ? { 
                ...defectType, 
                name: response.data.defectTypeName,
                ...payload 
              }
            : defectType
        );
        setDefectTypes(updatedDefectTypes);
        setIsEditModalOpen(false);
        setEditingDefectType(null);
        resetForm();
        setEditAlert({ isOpen: true, message: 'Defect type updated successfully!' });
      } else {
        setEditAlert({ isOpen: true, message: 'Failed to update defect type: ' + response.message });
      }
    } catch (error: any) {
      // Check if it's a validation error (400 status)
      if (error.response?.status === 400) {
        setEditAlert({ isOpen: true, message: 'Defect Type name can only contain alphabets.' });
      } else {
        setEditAlert({ isOpen: true, message: 'Failed to update defect type: ' + error });
      }
    }
  };

  const handleDelete = async () => {
    if (!deletingDefectType) return;
    
    try {
      const response = await deleteDefectType(deletingDefectType.id);
      if (response.status === 'success') {
        const updatedDefectTypes = defectTypes.filter(
          defectType => defectType.id !== deletingDefectType.id
        );
        setDefectTypes(updatedDefectTypes);
        setIsDeleteModalOpen(false);
        setDeletingDefectType(null);
        setDeleteAlert({ isOpen: true, message: 'Defect type deleted successfully!' });
      } else {
        setDeleteAlert({ isOpen: true, message: 'Failed to delete defect type: ' + response.message });
      }
    } catch (error) {
      setDeleteAlert({ isOpen: true, message: 'Failed to delete defect type: ' + error });
    }
  };

  const openEditModal = async (defectType: DefectType) => {
    try {
      const response = await getDefectTypeById(defectType.id);
      if (response.status === 'success') {
        const fetchedDefectType = response.data;
        setEditingDefectType({
          ...fetchedDefectType,
          id: fetchedDefectType.id.toString(),
          name: fetchedDefectType.defectTypeName,
        });
        setFormData({
          name: fetchedDefectType.defectTypeName,
          description: fetchedDefectType.description,
          category: fetchedDefectType.category,
          severity: fetchedDefectType.severity,
          priority: fetchedDefectType.priority,
          isActive: fetchedDefectType.isActive
        });
        setIsEditModalOpen(true);
      } else {
        console.error("Failed to fetch defect type for editing:", response.message);
        // Optionally, show an error to the user
      }
    } catch (error) {
      console.error("Error fetching defect type for editing:", error);
      // Optionally, show an error to the user
    }
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
      {/* Create Alert Modal */}
      <AlertModal
        isOpen={createAlert.isOpen}
        message={createAlert.message}
        onClose={() => setCreateAlert({ isOpen: false, message: '' })}
      />

      {/* Edit Alert Modal */}
      <AlertModal
        isOpen={editAlert.isOpen}
        message={editAlert.message}
        onClose={() => setEditAlert({ isOpen: false, message: '' })}
      />

      {/* Delete Alert Modal */}
      <AlertModal
        isOpen={deleteAlert.isOpen}
        message={deleteAlert.message}
        onClose={() => setDeleteAlert({ isOpen: false, message: '' })}
      />

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
            {paginatedDefectTypes.length === 0 ? (
              <tr>
                <td colSpan={2} className="px-5 py-3 text-center text-gray-500">
                  No defect types found.
                </td>
              </tr>
            ) : (
              paginatedDefectTypes.map((defectType) => (
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
            ))
            )}
          </tbody>
        </table>
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 py-4">
            <button
              className="px-3 py-1 rounded border bg-gray-100 text-gray-700 disabled:opacity-50"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                className={`px-3 py-1 rounded border ${currentPage === i + 1 ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'}`}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
            <button
              className="px-3 py-1 rounded border bg-gray-100 text-gray-700 disabled:opacity-50"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          resetForm();
          setCreateAlert({ isOpen: false, message: '' });
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
          setEditAlert({ isOpen: false, message: '' });
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
          setDeleteAlert({ isOpen: false, message: '' });
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