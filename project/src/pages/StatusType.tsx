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
import AlertModal from '../components/ui/AlertModal';
import { HexColorPicker } from 'react-colorful';

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
  // Alert state for different actions
  const [createAlert, setCreateAlert] = useState({ isOpen: false, message: '' });
  const [editAlert, setEditAlert] = useState({ isOpen: false, message: '' });
  const [deleteAlert, setDeleteAlert] = useState({ isOpen: false, message: '' });
  // Pending success flags
  const [pendingCreateSuccess, setPendingCreateSuccess] = useState(false);
  const [pendingEditSuccess, setPendingEditSuccess] = useState(false);
  const [pendingDeleteSuccess, setPendingDeleteSuccess] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;
  const totalPages = Math.ceil(statusTypes.length / pageSize);
  const paginatedStatusTypes = statusTypes.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Fetch all status types on component mount
  useEffect(() => {
    fetchStatusTypes();
    setCurrentPage(1); // Reset to first page on mount
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
      setPendingCreateSuccess(true);
    } catch (error: any) {
      setApiError(error.message);
      setCreateAlert({ isOpen: true, message: '  Status Name can only contain alphabets and spaces.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isCreateModalOpen && pendingCreateSuccess) {
      setCreateAlert({ isOpen: true, message: 'Status type created successfully!' });
      setPendingCreateSuccess(false);
    }
  }, [isCreateModalOpen, pendingCreateSuccess]);

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
      setEditAlert({ isOpen: true, message: 'Status type updated successfully!' });
    } catch (error: any) {
      setApiError(error.message);
      setEditAlert({ isOpen: true, message: 'Status Name can only contain alphabets and spaces.' });
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
      setDeleteAlert({ isOpen: true, message: 'Status type deleted successfully!' });
    } catch (error: any) {
      setApiError(error.message);
      setDeleteAlert({ isOpen: true, message: 'Failed to delete status type' });
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

  // Color input handler: only allow # and hex digits, max 7 chars
  const handleColorInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    if (!value.startsWith('#')) value = '#' + value.replace(/[^0-9A-Fa-f]/gi, '');
    value = '#' + value.slice(1).replace(/[^0-9A-Fa-f]/gi, '');
    value = value.slice(0, 7);
    setFormData({ ...formData, colorCode: value });
  };
  const [showColorPickerCreate, setShowColorPickerCreate] = useState(false);
  const [showColorPickerEdit, setShowColorPickerEdit] = useState(false);

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
      {/* {apiError && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600">{apiError}</p>
        </div>
      )} */}

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
              {paginatedStatusTypes.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center text-gray-500 py-4">
                    No status types found.
                  </td>
                </tr>
              ) : (
                paginatedStatusTypes.map((status) => (
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
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>
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
      <Modal isOpen={isCreateModalOpen} onClose={() => { setIsCreateModalOpen(false); resetForm(); setShowColorPickerCreate(false); }} title="Create Status Type">
        <div className="space-y-4">
          <Input
            label="Status Name"
            value={formData.defectStatusName}
            onChange={(e) => setFormData({ ...formData, defectStatusName: e.target.value.toUpperCase() })}
            placeholder="e.g., IN PROGRESS"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
            <div className="flex flex-col items-center gap-2 w-full">
              <div className="flex items-center gap-3 w-full">
                <Input
                  value={formData.colorCode}
                  onChange={handleColorInput}
                  placeholder="#000000"
                  className="flex-1"
                  maxLength={7}
                />
                <div
                  className="w-10 h-10 rounded-md border border-gray-300 cursor-pointer"
                  style={{ backgroundColor: formData.colorCode }}
                  onClick={() => setShowColorPickerCreate((v) => !v)}
                  aria-label="Pick color"
                />
              </div>
              {showColorPickerCreate && (
                <div className="z-50 mt-2">
                  <HexColorPicker
                    color={formData.colorCode}
                    onChange={color => setFormData({ ...formData, colorCode: color })}
                  />
                </div>
              )}
            </div>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end space-x-2">
            <Button 
              variant="secondary" 
              onClick={() => { setIsCreateModalOpen(false); resetForm(); setShowColorPickerCreate(false); }}
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
      <Modal isOpen={isEditModalOpen} onClose={() => { setIsEditModalOpen(false); resetForm(); setShowColorPickerEdit(false); }} title="Edit Status Type">
        <div className="space-y-4">
          <Input
            label="Status Name"
            value={formData.defectStatusName}
            onChange={(e) => setFormData({ ...formData, defectStatusName: e.target.value.toUpperCase() })}
            placeholder="e.g., IN PROGRESS"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
            <div className="flex flex-col items-center gap-2 w-full">
              <div className="flex items-center gap-3 w-full">
                <Input
                  value={formData.colorCode}
                  onChange={handleColorInput}
                  placeholder="#000000"
                  className="flex-1"
                  maxLength={7}
                />
                <div
                  className="w-10 h-10 rounded-md border border-gray-300 cursor-pointer"
                  style={{ backgroundColor: formData.colorCode }}
                  onClick={() => setShowColorPickerEdit((v) => !v)}
                  aria-label="Pick color"
                />
              </div>
              {showColorPickerEdit && (
                <div className="z-50 mt-2">
                  <HexColorPicker
                    color={formData.colorCode}
                    onChange={color => setFormData({ ...formData, colorCode: color })}
                  />
                </div>
              )}
            </div>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end space-x-2">
            <Button 
              variant="secondary" 
              onClick={() => { setIsEditModalOpen(false); resetForm(); setShowColorPickerEdit(false); }}
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

export default StatusType; 