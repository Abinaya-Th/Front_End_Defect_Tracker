import React, { useState } from 'react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { ChevronLeft, Plus, Edit2, Trash2, Rocket } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ReleaseType {
  id: number;
  name: string;
  description: string;
}

const ReleaseType: React.FC = () => {
  const navigate = useNavigate();
  const [releaseTypes, setReleaseTypes] = useState<ReleaseType[]>([
    { id: 1, name: 'Major Release', description: 'Significant feature releases with new functionality and major improvements' },
    { id: 2, name: 'Minor Release', description: 'Small feature updates and minor improvements to existing functionality' },
    { id: 3, name: 'Patch Release', description: 'Bug fixes and minor updates to resolve issues and improve stability' },
    { id: 4, name: 'Hotfix', description: 'Critical bug fixes that need immediate deployment to resolve urgent issues' },
  ]);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingReleaseType, setEditingReleaseType] = useState<ReleaseType | null>(null);
  const [deletingReleaseType, setDeletingReleaseType] = useState<ReleaseType | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
    });
  };

  const handleCreate = () => {
    const newReleaseType: ReleaseType = {
      id: Math.max(...releaseTypes.map(rt => rt.id)) + 1,
      ...formData,
    };
    setReleaseTypes([...releaseTypes, newReleaseType]);
    setIsCreateModalOpen(false);
    resetForm();
  };

  const handleEdit = () => {
    if (!editingReleaseType) return;

    const updatedReleaseTypes = releaseTypes.map(releaseType =>
      releaseType.id === editingReleaseType.id
        ? { ...releaseType, ...formData }
        : releaseType
    );
    setReleaseTypes(updatedReleaseTypes);
    setIsEditModalOpen(false);
    setEditingReleaseType(null);
    resetForm();
  };

  const handleDelete = () => {
    if (!deletingReleaseType) return;

    const updatedReleaseTypes = releaseTypes.filter(
      releaseType => releaseType.id !== deletingReleaseType.id
    );
    setReleaseTypes(updatedReleaseTypes);
    setIsDeleteModalOpen(false);
    setDeletingReleaseType(null);
  };

  const openEditModal = (releaseType: ReleaseType) => {
    setEditingReleaseType(releaseType);
    setFormData({
      name: releaseType.name,
      description: releaseType.description,
    });
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (releaseType: ReleaseType) => {
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
                <td className="px-5 py-3 whitespace-nowrap font-semibold text-gray-900 text-base">{releaseType.name}</td>
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
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
          setDeletingReleaseType(null);
        }}
        title="Delete Release Type"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Are you sure you want to delete the release type "{deletingReleaseType?.name}"?
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