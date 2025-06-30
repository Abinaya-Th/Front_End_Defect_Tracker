import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { ChevronLeft, Plus, Edit2, Trash2, Rocket } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  getAllReleaseTypes,
  createReleaseType,
  updateReleaseType,
  deleteReleaseType,
  ReleaseType as ReleaseTypeModel
} from '../api/Releasetype';

const ReleaseType: React.FC = () => {
  const navigate = useNavigate();
  const [releaseTypes, setReleaseTypes] = useState<ReleaseTypeModel[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingReleaseType, setEditingReleaseType] = useState<ReleaseTypeModel | null>(null);
  const [deletingReleaseType, setDeletingReleaseType] = useState<ReleaseTypeModel | null>(null);
  const [formData, setFormData] = useState({
    releaseTypeName: '',
  });

  useEffect(() => {
    getAllReleaseTypes().then((res) => {
      if (res?.data) setReleaseTypes(res.data);
    });
  }, []);

  const resetForm = () => {
    setFormData({
      releaseTypeName: '',
    });
  };

  const handleCreate = async () => {
    try {
      const created = await createReleaseType(formData);
      // Defensive: If backend returns only id, fetch all again; else, add to list
      if (created && created.releaseTypeName) {
        setReleaseTypes((prev) => [...prev, created]);
      } else {
        // fallback: refetch all
        const res = await getAllReleaseTypes();
        if (res?.data) setReleaseTypes(res.data);
      }
      setIsCreateModalOpen(false);
      resetForm();
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleEdit = async () => {
    if (!editingReleaseType) return;
    try {
      const updated = await updateReleaseType(editingReleaseType.id, {
        releaseTypeName: formData.releaseTypeName,
      });
      // Update the local state so the UI refreshes immediately
      setReleaseTypes((prev) =>
        prev.map((rt) =>
          rt.id === editingReleaseType.id
            ? { ...rt, releaseTypeName: formData.releaseTypeName }
            : rt
        )
      );
      setIsEditModalOpen(false);
      setEditingReleaseType(null);
      setFormData({ releaseTypeName: '' });
    } catch (error: any) {
      alert(error.message || "Failed to update release type");
    }
  };

  const handleDelete = async () => {
    if (!deletingReleaseType) return;
    try {
      await deleteReleaseType(deletingReleaseType.id);
      setReleaseTypes((prev) => prev.filter((rt) => rt.id !== deletingReleaseType.id));
      setIsDeleteModalOpen(false);
      setDeletingReleaseType(null);
    } catch (error: any) {
      alert(error.message);
    }
  };

  const openEditModal = (releaseType: ReleaseTypeModel) => {
    setEditingReleaseType(releaseType);
    setFormData({
      releaseTypeName: releaseType.releaseTypeName,
    });
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (releaseType: ReleaseTypeModel) => {
    setDeletingReleaseType(releaseType);
    setIsDeleteModalOpen(true);
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
          <Rocket className="w-8 h-8 text-blue-500 mr-3" />
          <h1 className="text-3xl font-bold text-gray-900">Release Type Management</h1>
        </div>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create Release Type
        </Button>
      </div>

      {/* Release Types Table */}
      <div className="overflow-x-auto rounded-lg shadow mb-8 max-w-2xl mx-auto">
        <table className="min-w-full divide-y divide-gray-200 text-base">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-5 py-3 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Release Type</th>
              <th className="px-5 py-3 text-center text-sm font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {releaseTypes.map((releaseType) => (
              <tr key={releaseType.id}>
                <td className="px-5 py-3 whitespace-nowrap font-semibold text-gray-900 text-base">{releaseType.releaseTypeName}</td>
                <td className="px-5 py-3 whitespace-nowrap text-center">
                  <button
                    onClick={() => openEditModal(releaseType)}
                    className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded mr-2"
                    title="Edit"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => openDeleteModal(releaseType)}
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
        title="Create New Release Type"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Release Type Name
            </label>
            <Input
              value={formData.releaseTypeName}
              onChange={(e) => setFormData({ ...formData, releaseTypeName: e.target.value })}
              placeholder="Enter release type name"
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
              disabled={!formData.releaseTypeName}
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
          setEditingReleaseType(null);
          resetForm();
        }}
        title="Edit Release Type"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Release Type Name
            </label>
            <Input
              value={formData.releaseTypeName}
              onChange={(e) => setFormData({ ...formData, releaseTypeName: e.target.value })}
              placeholder="Enter release type name"
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => {
                setIsEditModalOpen(false);
                setEditingReleaseType(null);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleEdit}
              disabled={!formData.releaseTypeName}
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
          setDeletingReleaseType(null);
        }}
        title="Delete Release Type"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Are you sure you want to delete the release type "{deletingReleaseType?.releaseTypeName}"?
            This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setDeletingReleaseType(null);
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

export default ReleaseType;