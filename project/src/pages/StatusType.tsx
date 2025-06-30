import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '../components/ui/Table';
import { ChevronLeft, Plus, Edit2, Trash2, ListPlus } from 'lucide-react';
import { StatusType as StatusTypeInterface } from '../types';
import { 
  getAllDefectStatuses, 
  createDefectStatus, 
  updateDefectStatus, 
  deleteDefectStatus,
  DefectStatus 
} from '../api/defectStatus';

// Utility function to normalize color values
const normalizeColor = (color: string): string => {
  if (!color) return '#000000';
  
  // Remove any non-hex characters
  const cleanColor = color.replace(/[^0-9A-Fa-f]/g, '');
  
  // Handle different length hex values
  if (cleanColor.length === 3) {
    // Convert 3-digit hex to 6-digit
    return `#${cleanColor[0]}${cleanColor[0]}${cleanColor[1]}${cleanColor[1]}${cleanColor[2]}${cleanColor[2]}`;
  } else if (cleanColor.length === 1) {
    // Convert 1-digit to 6-digit
    return `#${cleanColor}${cleanColor}${cleanColor}${cleanColor}${cleanColor}${cleanColor}`;
  } else if (cleanColor.length === 2) {
    // Convert 2-digit to 6-digit
    return `#${cleanColor}${cleanColor}${cleanColor}`;
  } else if (cleanColor.length >= 6) {
    // Take first 6 characters
    return `#${cleanColor.substring(0, 6)}`;
  }
  
  // Default fallback
  return '#000000';
};

const StatusType: React.FC = () => {
  const navigate = useNavigate();
  const colorInputRef = useRef<HTMLInputElement>(null);
  
  const [statusTypes, setStatusTypes] = useState<DefectStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingStatus, setEditingStatus] = useState<DefectStatus | null>(null);
  const [deletingStatus, setDeletingStatus] = useState<DefectStatus | null>(null);
  const [formData, setFormData] = useState({
    defectStatusName: '',
    colorCode: '#000000',
  });
  const [error, setError] = useState('');
  const [apiError, setApiError] = useState('');

  // Fetch all status types on component mount
  useEffect(() => {
    fetchStatusTypes();
  }, []);

  const fetchStatusTypes = async () => {
    try {
      setLoading(true);
      setApiError('');
      const response = await getAllDefectStatuses();
      // Normalize color values for all status types
      const normalizedStatusTypes = response.data.map(status => ({
        ...status,
        colorCode: normalizeColor(status.colorCode)
      }));
      setStatusTypes(normalizedStatusTypes);
    } catch (error: any) {
      setApiError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ defectStatusName: '', colorCode: '#000000' });
    setError('');
  };

  const validateForm = () => {
    if (formData.defectStatusName.trim() === '') {
      setError('Status Name cannot be empty.');
      return false;
    }
    
    // Validate color format
    const normalizedColor = normalizeColor(formData.colorCode);
    if (!/^#[0-9A-Fa-f]{6}$/.test(normalizedColor)) {
      setError('Please enter a valid color code (e.g., #FF0000).');
      return false;
    }
    
    setError('');
    return true;
  };

  const handleCreate = async () => {
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      const normalizedColor = normalizeColor(formData.colorCode);
      await createDefectStatus({
        ...formData,
        colorCode: normalizedColor
      });
      await fetchStatusTypes(); // Refresh the list
      setIsCreateModalOpen(false);
      resetForm();
    } catch (error: any) {
      setApiError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!validateForm()) return;
    if (!editingStatus) return;
    
    try {
      setLoading(true);
      const normalizedColor = normalizeColor(formData.colorCode);
      await updateDefectStatus(editingStatus.id, {
        ...formData,
        colorCode: normalizedColor
      });
      await fetchStatusTypes(); // Refresh the list
      setIsEditModalOpen(false);
      setEditingStatus(null);
      resetForm();
    } catch (error: any) {
      setApiError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingStatus) return;
    
    try {
      setLoading(true);
      await deleteDefectStatus(deletingStatus.id);
      await fetchStatusTypes(); // Refresh the list
      setIsDeleteModalOpen(false);
      setDeletingStatus(null);
    } catch (error: any) {
      setApiError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (status: DefectStatus) => {
    setEditingStatus(status);
    setFormData({ 
      defectStatusName: status.defectStatusName, 
      colorCode: normalizeColor(status.colorCode)
    });
    setError('');
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (status: DefectStatus) => {
    setDeletingStatus(status);
    setIsDeleteModalOpen(true);
  };

  const handleColorChange = (color: string) => {
    const normalizedColor = normalizeColor(color);
    setFormData({ ...formData, colorCode: normalizedColor });
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
          disabled={loading}
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Status
        </Button>
      </div>

      {/* API Error Display */}
      {apiError && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600">{apiError}</p>
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow-md">
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading...</span>
          </div>
        ) : (
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
                  <TableCell className="font-medium">{status.defectStatusName}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <div
                        className="w-6 h-6 rounded-full border border-gray-300 mr-3"
                        style={{ backgroundColor: status.colorCode }}
                      />
                      <span>{status.colorCode}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => openEditModal(status)} 
                      className="mr-2"
                      disabled={loading}
                    >
                      <Edit2 className="w-4 h-4 text-blue-500" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => openDeleteModal(status)}
                      disabled={loading}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Create Modal */}
      <Modal isOpen={isCreateModalOpen} onClose={() => { setIsCreateModalOpen(false); resetForm(); }} title="Create Status Type">
        <div className="space-y-4">
          <Input
            label="Status Name"
            value={formData.defectStatusName}
            onChange={(e) => setFormData({ ...formData, defectStatusName: e.target.value.toUpperCase() })}
            placeholder="e.g., IN PROGRESS"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Colour</label>
            <div className="flex items-center gap-2">
              <div
                className="w-10 h-10 rounded-md border border-gray-300 cursor-pointer"
                style={{ backgroundColor: formData.colorCode }}
                onClick={() => colorInputRef.current?.click()}
              />
              <Input
                type="text"
                value={formData.colorCode}
                onChange={(e) => handleColorChange(e.target.value)}
                className="flex-grow"
              />
              <input
                type="color"
                ref={colorInputRef}
                value={formData.colorCode}
                onChange={(e) => handleColorChange(e.target.value)}
                className="opacity-0 w-0 h-0 absolute"
              />
            </div>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end space-x-2">
            <Button 
              variant="secondary" 
              onClick={() => { setIsCreateModalOpen(false); resetForm(); }}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={loading}>
              {loading ? 'Creating...' : 'Create'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => { setIsEditModalOpen(false); resetForm(); }} title="Edit Status Type">
        <div className="space-y-4">
          <Input
            label="Status Name"
            value={formData.defectStatusName}
            onChange={(e) => setFormData({ ...formData, defectStatusName: e.target.value.toUpperCase() })}
            placeholder="e.g., IN PROGRESS"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Colour</label>
            <div className="flex items-center gap-2">
              <div
                className="w-10 h-10 rounded-md border border-gray-300 cursor-pointer"
                style={{ backgroundColor: formData.colorCode }}
                onClick={() => colorInputRef.current?.click()}
              />
              <Input
                type="text"
                value={formData.colorCode}
                onChange={(e) => handleColorChange(e.target.value)}
                className="flex-grow"
              />
              <input
                type="color"
                ref={colorInputRef}
                value={formData.colorCode}
                onChange={(e) => handleColorChange(e.target.value)}
                className="opacity-0 w-0 h-0 absolute"
              />
            </div>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end space-x-2">
            <Button 
              variant="secondary" 
              onClick={() => { setIsEditModalOpen(false); resetForm(); }}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button onClick={handleEdit} disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Delete Status Type">
        <div>
          <p>Are you sure you want to delete the status "<strong>{deletingStatus?.defectStatusName}</strong>"?</p>
          <div className="flex justify-end space-x-2 mt-4">
            <Button 
              variant="secondary" 
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              variant="danger" 
              onClick={handleDelete}
              disabled={loading}
            >
              {loading ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default StatusType; 