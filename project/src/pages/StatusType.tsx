import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '../components/ui/Table';
import { ChevronLeft, Plus, Edit2, Trash2, ListPlus } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { StatusType as StatusTypeInterface } from '../types';

const StatusType: React.FC = () => {
  const navigate = useNavigate();
  const { statusTypes, addStatusType, updateStatusType, deleteStatusType } = useApp();
  const colorInputRef = useRef<HTMLInputElement>(null);
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingStatus, setEditingStatus] = useState<StatusTypeInterface | null>(null);
  const [deletingStatus, setDeletingStatus] = useState<StatusTypeInterface | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    color: '#000000',
  });
  const [error, setError] = useState('');

  const resetForm = () => {
    setFormData({ name: '', color: '#000000' });
    setError('');
  };

  const validateForm = () => {
    if (formData.name.trim() === '') {
      setError('Status Name cannot be empty.');
      return false;
    }
    setError('');
    return true;
  };

  const handleCreate = () => {
    if (!validateForm()) return;
    addStatusType(formData);
    setIsCreateModalOpen(false);
    resetForm();
  };

  const handleEdit = () => {
    if (!validateForm()) return;
    if (!editingStatus) return;
    updateStatusType(editingStatus.id, formData);
    setIsEditModalOpen(false);
    setEditingStatus(null);
    resetForm();
  };

  const handleDelete = () => {
    if (!deletingStatus) return;
    deleteStatusType(deletingStatus.id);
    setIsDeleteModalOpen(false);
    setDeletingStatus(null);
  };

  const openEditModal = (status: StatusTypeInterface) => {
    setEditingStatus(status);
    setFormData({ name: status.name, color: status.color });
    setError('');
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (status: StatusTypeInterface) => {
    setDeletingStatus(status);
    setIsDeleteModalOpen(true);
  };

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="mb-6 flex justify-end">
        <Button
          variant="secondary"
          onClick={() => navigate('/configurations/status')}
          className="flex items-center"
        >
          <ChevronLeft className="w-5 h-5 mr-2" /> Back
        </Button>
      </div>

      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center">
          <ListPlus className="w-8 h-8 text-blue-700 mr-3" />
          <h1 className="text-3xl font-bold text-gray-900">Status Type Management</h1>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setIsCreateModalOpen(true);
          }}
          className="flex items-center"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Status
        </Button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableCell header className="w-[40%]">Name</TableCell>
              <TableCell header className="w-[40%]">Colour</TableCell>
              <TableCell header className="text-right">Action</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {statusTypes.map((status) => (
              <TableRow key={status.id}>
                <TableCell className="font-medium">{status.name}</TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <div
                      className="w-6 h-6 rounded-full border border-gray-300 mr-3"
                      style={{ backgroundColor: status.color }}
                    />
                    <span>{status.color}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" onClick={() => openEditModal(status)} className="mr-2">
                    <Edit2 className="w-4 h-4 text-blue-500" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => openDeleteModal(status)}>
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Create Modal */}
      <Modal isOpen={isCreateModalOpen} onClose={() => { setIsCreateModalOpen(false); resetForm(); }} title="Create Status Type">
        <div className="space-y-4">
          <Input
            label="Status Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value.toUpperCase() })}
            placeholder="e.g., IN PROGRESS"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Colour</label>
            <div className="flex items-center gap-2">
              <div
                className="w-10 h-10 rounded-md border border-gray-300 cursor-pointer"
                style={{ backgroundColor: formData.color }}
                onClick={() => colorInputRef.current?.click()}
              />
              <Input
                type="text"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="flex-grow"
              />
              <input
                type="color"
                ref={colorInputRef}
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="opacity-0 w-0 h-0 absolute"
              />
            </div>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end space-x-2">
            <Button variant="secondary" onClick={() => { setIsCreateModalOpen(false); resetForm(); }}>Cancel</Button>
            <Button onClick={handleCreate}>Create</Button>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => { setIsEditModalOpen(false); resetForm(); }} title="Edit Status Type">
        <div className="space-y-4">
          <Input
            label="Status Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value.toUpperCase() })}
            placeholder="e.g., IN PROGRESS"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Colour</label>
            <div className="flex items-center gap-2">
              <div
                className="w-10 h-10 rounded-md border border-gray-300 cursor-pointer"
                style={{ backgroundColor: formData.color }}
                onClick={() => colorInputRef.current?.click()}
              />
              <Input
                type="text"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="flex-grow"
              />
              <input
                type="color"
                ref={colorInputRef}
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="opacity-0 w-0 h-0 absolute"
              />
            </div>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end space-x-2">
            <Button variant="secondary" onClick={() => { setIsEditModalOpen(false); resetForm(); }}>Cancel</Button>
            <Button onClick={handleEdit}>Save Changes</Button>
          </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Delete Status Type">
        <div>
          <p>Are you sure you want to delete the status "<strong>{deletingStatus?.name}</strong>"?</p>
          <div className="flex justify-end space-x-2 mt-4">
            <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete}>Delete</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default StatusType; 