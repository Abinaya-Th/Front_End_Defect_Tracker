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
import AlertModal from '../components/ui/AlertModal';

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
  const totalPages = Math.ceil(releaseTypes.length / pageSize);
  const paginatedReleaseTypes = releaseTypes.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  useEffect(() => {
    getAllReleaseTypes().then((res) => {
      if (res?.data) setReleaseTypes(res.data);
    });
    // Reset all alert popups on mount so none show at page load
    setCreateAlert({ isOpen: false, message: '' });
    setEditAlert({ isOpen: false, message: '' });
    setDeleteAlert({ isOpen: false, message: '' });
    setCurrentPage(1); // Reset to first page on mount
  }, []);

  // Show create alert after modal closes
  useEffect(() => {
    if (!isCreateModalOpen && pendingCreateSuccess) {
      setCreateAlert({ isOpen: true, message: 'Release type created successfully!' });
      setPendingCreateSuccess(false);
    }
  }, [isCreateModalOpen, pendingCreateSuccess]);

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
      setPendingCreateSuccess(true);
    } catch (error: any) {
      setCreateAlert({ isOpen: true, message: 'Failed to create release type' });
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
      setEditAlert({ isOpen: true, message: 'Release type updated successfully!' });
    } catch (error: any) {
      setEditAlert({ isOpen: true, message: 'Failed to update release type' });
    }
  };

  const handleDelete = async () => {
    if (!deletingReleaseType) return;
    try {
      await deleteReleaseType(deletingReleaseType.id);
      setReleaseTypes((prev) => prev.filter((rt) => rt.id !== deletingReleaseType.id));
      setIsDeleteModalOpen(false);
      setDeletingReleaseType(null);
      setDeleteAlert({ isOpen: true, message: 'Release type deleted successfully!' });
    } catch (error: any) {
      setDeleteAlert({ isOpen: true, message: 'Failed to delete release type' });
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
            {paginatedReleaseTypes.length === 0 ? (
              <tr>
                <td colSpan={2} className="px-5 py-3 text-center text-gray-500">
                  No release types found.
                </td>
              </tr>
            ) : (
              paginatedReleaseTypes.map((releaseType) => (
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
          setEditAlert({ isOpen: false, message: '' });
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
          setDeleteAlert({ isOpen: false, message: '' });
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