import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Table, TableBody, TableCell, TableRow } from '../components/ui/Table';
import { Modal } from '../components/ui/Modal';
import { ChevronLeft, Plus, Edit2, Trash2, Flag, AwardIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getAllPriorities, updatePriority, deletePriority, createPriority } from '../api/priority';
import AlertModal from '../components/ui/AlertModal';
import { HexColorPicker } from 'react-colorful';

interface Priority {
  id: number;
  name: string;
  color: string;
}

const Priority: React.FC = () => {
  const navigate = useNavigate();
  const [priorities, setPriorities] = useState<Priority[]>([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;
  const totalPages = Math.ceil(priorities.length / pageSize);
  const paginatedPriorities = priorities.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Alert state for different actions
  const [createAlert, setCreateAlert] = useState({ isOpen: false, message: '' });
  const [editAlert, setEditAlert] = useState({ isOpen: false, message: '' });
  const [deleteAlert, setDeleteAlert] = useState({ isOpen: false, message: '' });
  // Pending success flags
  const [pendingCreateSuccess, setPendingCreateSuccess] = useState(false);
  const [pendingEditSuccess, setPendingEditSuccess] = useState(false);
  const [pendingDeleteSuccess, setPendingDeleteSuccess] = useState(false);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingPriority, setEditingPriority] = useState<Priority | null>(null);
  const [deletingPriority, setDeletingPriority] = useState<Priority | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    color: '#000000',
  });
  const [showColorPickerCreate, setShowColorPickerCreate] = useState(false);
  const [showColorPickerEdit, setShowColorPickerEdit] = useState(false);

  useEffect(() => {
    getAllPriorities()
      .then((res) => {
        if (res && Array.isArray(res.data)) {
          const mapped = res.data.map((item) => ({
            id: item.id,
            name: item.priority,
            color: item.color.startsWith('#') ? item.color : `#${item.color}`,
          }));
          setPriorities(mapped);
        } else {
          setPriorities([]);
          console.error("API response does not contain data array:", res);
        }
      })
      .catch((err) => {
        setPriorities([]);
        console.error("Failed to fetch priorities:", err);
      });
    setCurrentPage(1); // Reset to first page on mount
  }, []);

  const resetForm = () => {
    setFormData({
      name: '',
      color: '#000000',
    });
  };

  const handleCreate = async () => {
    try {
      const res = await createPriority({
        priority: formData.name,
        color: formData.color,
      });
      const refreshed = await getAllPriorities();
      const mapped = refreshed.data.map((item) => ({
        id: item.id,
        name: item.priority,
        color: item.color.startsWith('#') ? item.color : `#${item.color}`,
      }));
      setPriorities(mapped);
      setIsCreateModalOpen(false);
      resetForm();
      setPendingCreateSuccess(true);
    } catch (err) {
      setCreateAlert({ isOpen: true, message: 'Failed to create priority' });
      console.error('Failed to create priority:', err);
    }
  };

  useEffect(() => {
    if (!isCreateModalOpen && pendingCreateSuccess) {
      setCreateAlert({ isOpen: true, message: 'Priority created successfully!' });
      setPendingCreateSuccess(false);
    }
  }, [isCreateModalOpen, pendingCreateSuccess]);

  const handleEdit = async () => {
    if (!editingPriority) return;
    try {
      await updatePriority(editingPriority.id, {
        priority: formData.name,
        color: formData.color,
      });
      const updatedPriorities = priorities.map(priority =>
        priority.id === editingPriority.id
          ? { ...priority, name: formData.name, color: formData.color }
          : priority
      );
      setPriorities(updatedPriorities);
      setIsEditModalOpen(false);
      setEditingPriority(null);
      resetForm();
      setEditAlert({ isOpen: true, message: 'Priority updated successfully!' });
    } catch (err) {
      setEditAlert({ isOpen: true, message: 'Failed to update priority' });
      console.error('Failed to update priority:', err);
    }
  };

  const handleDelete = async () => {
    if (!deletingPriority) return;
    try {
      await deletePriority(deletingPriority.id);
      const updatedPriorities = priorities.filter(
        priority => priority.id !== deletingPriority.id
      );
      setPriorities(updatedPriorities);
      setIsDeleteModalOpen(false);
      setDeletingPriority(null);
      setDeleteAlert({ isOpen: true, message: 'Priority deleted successfully!' });
    } catch {
      setDeleteAlert({ isOpen: true, message: 'Failed to delete priority' });
    }
  };

  const openEditModal = (priority: Priority) => {
    setEditingPriority(priority);
    setFormData({
      name: priority.name,
      color: priority.color,
    });
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (priority: Priority) => {
    setDeletingPriority(priority);
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
          <Flag className="w-8 h-8 text-blue-500 mr-3" />
          <h1 className="text-3xl font-bold text-gray-900">Priority Management</h1>
        </div>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create Priority
        </Button>
      </div>

      {/* Priorities Table */}
      <Card>
        <div className="flex flex-row items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Priority Levels</h2>
        </div>
        <CardContent>
          <Table>
            <thead className="bg-gray-50">
              <TableRow>
                <TableCell header>Name</TableCell>
                <TableCell header>Color</TableCell>
                <TableCell header>Actions</TableCell>
              </TableRow>
            </thead>
            <TableBody>
              {paginatedPriorities.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center text-gray-500 py-4">
                    No priorities found.
                  </td>
                </tr>
              ) : (
                paginatedPriorities.map((priority) => (
                  <TableRow key={priority.id}>
                    <TableCell className="font-medium">{priority.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full border border-gray-300"
                          style={{ backgroundColor: priority.color }}
                        />
                        <span className="text-sm text-gray-600">{priority.color}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditModal(priority)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDeleteModal(priority)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
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

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          resetForm();
          setShowColorPickerCreate(false);
        }}
        title="Create New Priority"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Priority Name
            </label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter priority name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Color
            </label>
            <div className="flex flex-col items-center gap-2 w-full">
              <div className="flex items-center gap-3 w-full">
                <Input
                  value={formData.color}
                  onChange={e => setFormData({ ...formData, color: e.target.value })}
                  placeholder="#000000"
                  className="flex-1"
                  maxLength={7}
                />
                <div
                  className="w-10 h-10 rounded-md border border-gray-300 cursor-pointer"
                  style={{ backgroundColor: formData.color }}
                  onClick={() => setShowColorPickerCreate((v) => !v)}
                  aria-label="Pick color"
                />
              </div>
              {showColorPickerCreate && (
                <div className="z-50 mt-2">
                  <HexColorPicker
                    color={formData.color}
                    onChange={color => setFormData({ ...formData, color })}
                  />
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => {
                setIsCreateModalOpen(false);
                resetForm();
                setShowColorPickerCreate(false);
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
          setEditingPriority(null);
          resetForm();
          setShowColorPickerEdit(false);
        }}
        title="Edit Priority"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Priority Name
            </label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter priority name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Color
            </label>
            <div className="flex flex-col items-center gap-2 w-full">
              <div className="flex items-center gap-3 w-full">
                <Input
                  value={formData.color}
                  onChange={e => setFormData({ ...formData, color: e.target.value })}
                  placeholder="#000000"
                  className="flex-1"
                  maxLength={7}
                />
                <div
                  className="w-10 h-10 rounded-md border border-gray-300 cursor-pointer"
                  style={{ backgroundColor: formData.color }}
                  onClick={() => setShowColorPickerEdit((v) => !v)}
                  aria-label="Pick color"
                />
              </div>
              {showColorPickerEdit && (
                <div className="z-50 mt-2">
                  <HexColorPicker
                    color={formData.color}
                    onChange={color => setFormData({ ...formData, color })}
                  />
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => {
                setIsEditModalOpen(false);
                setEditingPriority(null);
                resetForm();
                setShowColorPickerEdit(false);
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
          setDeletingPriority(null);
        }}
        title="Delete Priority"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Are you sure you want to delete the priority "{deletingPriority?.name}"?
            This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setDeletingPriority(null);
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
    </div>
  );
};

export default Priority;