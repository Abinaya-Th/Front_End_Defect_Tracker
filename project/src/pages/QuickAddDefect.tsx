import React, { useState, useEffect } from "react";
import { Bug, Plus } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
import { Input } from "../components/ui/Input";
import { useApp } from "../context/AppContext";
import { importDefects } from "../api/importTestCase";
import { getModulesByProjectId } from "../api/module/getModule";
import { getSubmodulesByModuleId } from "../api/submodule/submoduleget";
import { getDefectTypes } from "../api/defectType";
import { getSeverities } from "../api/severity";
import { getAllPriorities } from "../api/priority";
import { projectReleaseCardView } from "../api/releaseView/ProjectReleaseCardView";
import axios from "axios";
import { addDefects } from "../api/defect/addNewDefect";
import { getAllocatedUsersByModuleId } from '../api/module/getModule';
import AlertModal from '../components/ui/AlertModal';

interface QuickAddDefectProps {
  projectModules: { id: string; name: string; submodules: { id: string; name: string }[] }[];
  onDefectAdded?: () => void;
}

const QuickAddDefect: React.FC<QuickAddDefectProps> = ({ projectModules, onDefectAdded }) => {
  const { selectedProjectId, projects, addDefect, employees } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    description: "",
    steps: "",
    moduleId: "",
    subModuleId: "",
    severityId: "",
    priorityId: "",
    typeId: "",
    assigntoId: "",
    assignbyId: "",
    releaseId: "",
    attachment: "",
    statusId: "",
  });
  const [success, setSuccess] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Dropdown data
  const [modules, setModules] = useState<{ id: string; name: string }[]>([]);
  const [submodules, setSubmodules] = useState<{ id: string; name: string }[]>([]);
  const [defectTypes, setDefectTypes] = useState<{ id: number; defectTypeName: string }[]>([]);
  const [severities, setSeverities] = useState<{ id: number; name: string }[]>([]);
  const [priorities, setPriorities] = useState<{ id: number; priority: string }[]>([]);
  const [releasesData, setReleasesData] = useState<any[]>([]);

  // Add state for allocated users for the selected module
  const [allocatedUsers, setAllocatedUsers] = useState<{ userId: number; userName: string }[]>([]);
  const [isAllocatedUsersLoading, setIsAllocatedUsersLoading] = useState(false);

  // Add state for alert modal
  const [alert, setAlert] = useState<{ open: boolean; message: string }>({ open: false, message: '' });
  const showAlert = (message: string) => setAlert({ open: true, message });
  const closeAlert = () => setAlert({ open: false, message: '' });

  // Fetch static data only once on mount
  useEffect(() => {
    getSeverities().then(res => setSeverities(res.data));
    getAllPriorities().then(res => setPriorities(res.data));
    getDefectTypes().then(res => setDefectTypes(res.data));
  }, []);

  // Fetch project-specific data only when project changes
  useEffect(() => {
    if (selectedProjectId) {
      projectReleaseCardView(selectedProjectId).then(res => {
        setReleasesData(res.data || []);
      }).catch(() => setReleasesData([]));
      getModulesByProjectId(selectedProjectId)
        .then((res) => {
          setModules((res.data || []).map((m: any) => ({ id: m.id?.toString(), name: m.moduleName })));
        })
        .catch(() => setModules([]));
    } else {
      setReleasesData([]);
      setModules([]);
    }
  }, [selectedProjectId]);

  // Fetch submodules when module changes
  useEffect(() => {
    if (formData.moduleId) {
      getSubmodulesByModuleId(formData.moduleId).then(res => {
        const mapped = (res.data || []).map((sm: any) => ({
          id: sm.id?.toString() || sm.subModuleId?.toString(),
          name: sm.subModuleName || sm.name || ''
        }));
        setSubmodules(mapped);
      }).catch(() => setSubmodules([]));
    } else {
      setSubmodules([]);
    }
  }, [formData.moduleId]);

  // Fetch allocated users when moduleId changes in the form
  useEffect(() => {
    if (!formData.moduleId) {
      setAllocatedUsers([]);
      return;
    }
    setIsAllocatedUsersLoading(true);
    getAllocatedUsersByModuleId(formData.moduleId)
      .then((data) => {
        // The API returns an array of allocations, may have duplicate users for submodules
        // We'll deduplicate by userId
        const uniqueUsers: { [id: number]: string } = {};
        (Array.isArray(data) ? data : []).forEach((item: any) => {
          if (item.userId && item.userName) {
            uniqueUsers[item.userId] = item.userName;
          }
        });
        setAllocatedUsers(Object.entries(uniqueUsers).map(([userId, userName]) => ({ userId: Number(userId), userName })));
      })
      .catch(() => setAllocatedUsers([]))
      .finally(() => setIsAllocatedUsersLoading(false));
  }, [formData.moduleId]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(true);

    // Build the payload to match Defects.tsx
    const payload: any = {
      description: formData.description,
      projectId: Number(selectedProjectId),
      releasesId: formData.releaseId ? Number(formData.releaseId) : undefined,
      modulesId: Number(formData.moduleId),
      steps: formData.steps || undefined,
      typeId: formData.typeId ? Number(formData.typeId) : undefined,
      severityId: formData.severityId ? Number(formData.severityId) : undefined,
      priorityId: formData.priorityId ? Number(formData.priorityId) : undefined,
      assignbyId: formData.assignbyId ? Number(formData.assignbyId) : undefined,
      assigntoId: formData.assigntoId ? Number(formData.assigntoId) : undefined,
      attachment: formData.attachment || undefined,
      // defectStatusId: only include if editing (see below)
      subModuleId: formData.subModuleId ? Number(formData.subModuleId) : undefined,
      testCaseId: formData.testCaseId ? Number(formData.testCaseId) : undefined,
      reOpenCount: 0,
    };
    // Only include defectStatusId if editing (i.e., formData.statusId is set)
    if (formData.statusId) {
      payload.defectStatusId = Number(formData.statusId);
    }

    try {
      const response = await addDefects(payload as any);
      if (response.status === "Success" || response.statusCode === 200) {
        showAlert("Defect added successfully!");
        setTimeout(() => {
          setSuccess(false);
          setIsModalOpen(false);
          setFormData({
            description: "",
            steps: "",
            moduleId: "",
            subModuleId: "",
            severityId: "",
            priorityId: "",
            typeId: "",
            assigntoId: "",
            assignbyId: "",
            releaseId: "",
            attachment: "",
            statusId: "",
          });
        }, 1200);
        if (onDefectAdded) onDefectAdded();
      } else {
        setSuccess(false);
        showAlert(response.message || "Failed to add defect.");
      }
    } catch (error: any) {
      setSuccess(false);
      const backendMsg = error?.response?.data?.message;
      if (backendMsg) {
        showAlert(backendMsg);
      } else {
        showAlert("Error adding defect. Please try again.\n" + (error?.message || error));
      }
    }
  };

  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await importDefects(formData);
      if (response && response.data && Array.isArray(response.data)) {
        showAlert("Import succeeded but no data returned.");
      } else {
        showAlert("Import succeeded but no data returned.");
      }
    } catch (error: any) {
      showAlert("Failed to import defects: " + (error?.message || error));
    }
  };

  return (
    <div>
      <Button
        onClick={() => setIsModalOpen(true)}
        className="flex items-center justify-center p-0 rounded-full shadow-lg bg-white hover:bg-gray-100 text-blue-700 relative group border border-blue-200"
        disabled={!selectedProjectId}
        style={{
          width: 40,
          height: 40,
          minWidth: 40,
          minHeight: 40,
          borderRadius: "50%",
        }}
      >
        {/* Lucide Bug Icon as red */}
        <Bug
          size={22}
          style={{ color: "#e11d48", position: "absolute", left: 9, top: 9 }}
        />
        {/* Plus Icon, overlayed in the bottom right, with white background, dark blue plus */}
        <span
          style={{
            position: "absolute",
            right: 2,
            bottom: 2,
            background: "#fff",
            borderRadius: "50%",
            width: 11,
            height: 11,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Plus className="w-2.5 h-2.5" style={{ color: "#1e3a8a" }} />
        </span>
        {/* Tooltip on hover */}
        <span className="absolute left-1/2 -translate-x-1/2 -top-8 bg-gray-900 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
          Add Defect
        </span>
      </Button>
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New Defect"
        size="xl"
      >
        {selectedProjectId && (
          <div className="font-bold text-blue-600 text-base mb-2">
            {projects.find((p) => p.id === selectedProjectId)?.name}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Brief Description */}
          <Input
            label="Brief Description"
            value={formData.description}
            onChange={e => handleInputChange("description", e.target.value)}
            required
          />
          {/* Steps */}
          {/* Steps */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Steps
            </label>
            <textarea
              value={formData.steps}
              onChange={e => handleInputChange("steps", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              required
            />
          </div>
          {/* Attachment URL */}
          <Input
            label="Attachment URL"
            value={formData.attachment || ''}
            onChange={e => handleInputChange('attachment', e.target.value)}
            placeholder="Paste attachment URL here"
          />
          {/* Modules and Submodules */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Modules
              </label>
              <select
                value={formData.moduleId}
                onChange={e => setFormData(f => ({ ...f, moduleId: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select a module</option>
                {modules.map(module => (
                  <option key={module.id} value={module.id}>{module.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Submodules
              </label>
              <select
                value={formData.subModuleId}
                onChange={e => setFormData(f => ({ ...f, subModuleId: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={!formData.moduleId}
              >
                <option value="">
                  {submodules.length === 0
                    ? "No submodules"
                    : "Select a submodule"}
                </option>
                {submodules.map((submodule) => (
                  <option key={submodule.id} value={submodule.id}>
                    {submodule.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {/* Severity, Priority, Type, Release, Assigned To */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <select
                value={formData.typeId}
                onChange={e => handleInputChange('typeId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select type</option>
                {defectTypes.map((t) => (
                  <option key={t.id} value={t.id}>{t.defectTypeName}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Severity
              </label>
              <select
                value={formData.severityId}
                onChange={e => handleInputChange('severityId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select severity</option>
                {severities.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Found in Release
              </label>
              <select
                value={formData.releaseId}
                onChange={e => handleInputChange('releaseId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select release</option>
                {releasesData.map(release => (
                  <option key={release.id} value={release.id}>{release.releaseName}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                value={formData.priorityId}
                onChange={e => handleInputChange('priorityId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select priority</option>
                {priorities.map(p => (
                  <option key={p.id} value={p.id.toString()}>{p.priority}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assigned To
              </label>
              <select
                value={formData.assigntoId}
                onChange={e => handleInputChange('assigntoId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={isAllocatedUsersLoading || !formData.moduleId}
                required
              >
                <option value="">
                  {isAllocatedUsersLoading ? "Loading users..." : allocatedUsers.length === 0 ? "No users available for this module" : "Select assignee"}
                </option>
                {allocatedUsers.map(user => (
                  <option key={user.userId} value={user.userId.toString()}>{user.userName}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={success}>
              {success ? "Added!" : "Submit"}
            </Button>
          </div>
        </form>
      </Modal>
      <AlertModal isOpen={alert.open} message={alert.message} onClose={closeAlert} />
    </div>
  );
};

export default QuickAddDefect;
