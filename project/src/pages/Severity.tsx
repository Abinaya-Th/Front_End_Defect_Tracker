import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Table, TableBody, TableCell, TableRow } from '../components/ui/Table';
import { Modal } from '../components/ui/Modal';
import { ChevronLeft, Plus, Edit2, Trash2, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getSeverities, createSeverity as apiCreateSeverity, updateSeverity as apiUpdateSeverity, deleteSeverity as apiDeleteSeverity, Severity as SeverityType } from '../api/severity';
import { Toast } from '../components/ui/Toast';

const Severity: React.FC = () => {
  const navigate = useNavigate();
  const [severities, setSeverities] = useState<SeverityType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingSeverity, setEditingSeverity] = useState<SeverityType | null>(null);
  const [deletingSeverity, setDeletingSeverity] = useState<SeverityType | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    color: '#000000',
  });

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error'; isOpen: boolean }>({
    message: '',
    type: 'success',
    isOpen: false,
  });

  const resetForm = () => {
    setFormData({
      name: '',
      color: '#000000',
    });
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type, isOpen: true });
  };

  const closeToast = () => {
    setToast((prev) => ({ ...prev, isOpen: false }));
  };

  useEffect(() => {
    const fetchSeverities = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getSeverities();
        setSeverities(res.data);
      } catch (err: any) {
        setError('Failed to fetch severities');
      } finally {
        setLoading(false);
      }
    };
    fetchSeverities();
  }, []);

  const handleCreate = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiCreateSeverity(formData);
      if (res.data) {
        setSeverities([...severities, res.data]);
        setIsCreateModalOpen(false);
        resetForm();
        showToast('Severity created successfully!', 'success');
      } else {
        showToast('Failed to create severity: No data returned', 'error');
      }
    } catch (err: any) {
      let msg = 'Failed to create severity';
      if (err?.response?.data?.message) {
        msg = err.response.data.message;
      } else if (err?.message) {
        msg = err.message;
      }
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!editingSeverity) return;
    try {
      setLoading(true);
      setError(null);
      const res = await apiUpdateSeverity(editingSeverity.id, formData);
      if (res.data) {
        const updatedSeverities = severities.map((severity): SeverityType =>
          severity.id === editingSeverity.id ? res.data as SeverityType : severity
        );
        setSeverities(updatedSeverities);
        setIsEditModalOpen(false);
        setEditingSeverity(null);
        resetForm();
        showToast('Severity updated successfully!', 'success');
      } else {
        showToast('Failed to update severity: No data returned', 'error');
      }
    } catch (err: any) {
      let msg = 'Failed to update severity';
      if (err?.response?.data?.message) {
        msg = err.response.data.message;
      } else if (err?.message) {
        msg = err.message;
      }
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingSeverity) return;
    try {
      setLoading(true);
      setError(null);
      await apiDeleteSeverity(deletingSeverity.id);
      const updatedSeverities = severities.filter(
        severity => severity.id !== deletingSeverity.id
      );
      setSeverities(updatedSeverities);
      setIsDeleteModalOpen(false);
      setDeletingSeverity(null);
      showToast('Severity deleted successfully!', 'success');
    } catch (err: any) {
      let msg = 'Failed to delete severity';
      if (err?.response?.data?.message) {
        msg = err.response.data.message;
      }
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (severity: SeverityType) => {
    setEditingSeverity(severity);
    setFormData({
      name: severity.name,
      color: severity.color,
    });
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (severity: SeverityType) => {
    setDeletingSeverity(severity);
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
          <AlertTriangle className="w-8 h-8 text-blue-500 mr-3" />
          <h1 className="text-3xl font-bold text-gray-900">Severity Management</h1>
        </div>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create Severity
        </Button>
      </div>

      {/* Severities Table */}
      <Card>
        <div className="flex flex-row items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Severity Levels</h2>
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
              {severities.map((severity) => (
                <TableRow key={severity.id}>
                  <TableCell className="font-medium">{severity.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-full border border-gray-300"
                        style={{ backgroundColor: severity.color }}
                      />
                      <span className="text-sm text-gray-600">{severity.color}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditModal(severity)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openDeleteModal(severity)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          resetForm();
        }}
        title="Create New Severity"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Severity Name
            </label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter severity name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Color
            </label>
            <div className="flex items-center gap-2">
              <Input
                type="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-16 h-10 p-1"
              />
              <Input
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                placeholder="#000000"
              />
            </div>
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
          setEditingSeverity(null);
          resetForm();
        }}
        title="Edit Severity"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Severity Name
            </label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter severity name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Color
            </label>
            <div className="flex items-center gap-2">
              <Input
                type="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-16 h-10 p-1"
              />
              <Input
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                placeholder="#000000"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => {
                setIsEditModalOpen(false);
                setEditingSeverity(null);
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
          setDeletingSeverity(null);
        }}
        title="Delete Severity"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Are you sure you want to delete the severity "{deletingSeverity?.name}"?
            This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setDeletingSeverity(null);
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

      {loading && <div className="text-gray-600 mb-4">Loading...</div>}
      <Toast
        message={toast.message}
        type={toast.type}
        isOpen={toast.isOpen}
        onClose={closeToast}
      />
    </div>
  );
};

export default Severity;
