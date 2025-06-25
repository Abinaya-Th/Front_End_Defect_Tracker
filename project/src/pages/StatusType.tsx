import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '../components/ui/Table';
import { ChevronLeft, Plus, Edit2, Trash2, ListPlus } from 'lucide-react';

export interface StatusType {
  defectStatusId: number;
  defectStatus: string;
}

const API_BASE = 'http://localhost:8080/api/v1/defect/defectStatus';

const StatusType: React.FC = () => {
  const navigate = useNavigate();
  const [statusTypes, setStatusTypes] = useState<StatusType[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingStatus, setEditingStatus] = useState<StatusType | null>(null);
  const [deletingStatus, setDeletingStatus] = useState<StatusType | null>(null);
  const [formData, setFormData] = useState({ defectStatus: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStatusTypes();
  }, []);

  const fetchStatusTypes = async () => {
    try {
      const res = await axios.get(API_BASE);
      setStatusTypes(res.data.result.defectStatus);
    } catch (err) {
      setStatusTypes([]);
    }
  };

  const resetForm = () => {
    setFormData({ defectStatus: '' });
    setError('');
  };

  const validateForm = () => {
    if (formData.defectStatus.trim() === '') {
      setError('Status Name cannot be empty.');
      return false;
    }
    setError('');
    return true;
  };

  const handleCreate = async () => {
    if (!validateForm()) return;
    try {
      await axios.post(API_BASE, { defectStatus: formData.defectStatus });
      fetchStatusTypes();
      setIsCreateModalOpen(false);
      resetForm();
    } catch (err) {
      setError('Failed to create status.');
    }
  };

  const handleEdit = async () => {
    if (!validateForm() || !editingStatus) return;
    try {
      await axios.put(`${API_BASE}/${editingStatus.defectStatusId}`, { defectStatus: formData.defectStatus });
      fetchStatusTypes();
      setIsEditModalOpen(false);
      setEditingStatus(null);
      resetForm();
    } catch (err) {
      setError('Failed to update status.');
    }
  };

  const handleDelete = async () => {
    if (!deletingStatus) return;
    try {
      await axios.delete(`${API_BASE}/${deletingStatus.defectStatusId}`);
      fetchStatusTypes();
      setIsDeleteModalOpen(false);
      setDeletingStatus(null);
    } catch (err) {
      setError('Failed to delete status.');
    }
  };

  const openEditModal = (status: StatusType) => {
    setEditingStatus(status);
    setFormData({ defectStatus: status.defectStatus });
    setError('');
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (status: StatusType) => {
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
              <TableCell header className="w-[70%]">Name</TableCell>
              <TableCell header className="text-right">Action</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {statusTypes.map((status) => (
              <TableRow key={status.defectStatusId}>
                <TableCell className="font-medium">{status.defectStatus}</TableCell>
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
            value={formData.defectStatus}
            onChange={(e) => setFormData({ ...formData, defectStatus: e.target.value.toUpperCase() })}
            placeholder="e.g., IN PROGRESS"
          />
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
            value={formData.defectStatus}
            onChange={(e) => setFormData({ ...formData, defectStatus: e.target.value.toUpperCase() })}
            placeholder="e.g., IN PROGRESS"
          />
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
          <p>Are you sure you want to delete the status "<strong>{deletingStatus?.defectStatus}</strong>"?</p>
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