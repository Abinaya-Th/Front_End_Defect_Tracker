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

interface QuickAddDefectProps {
  projectModules: { id: string; name: string; submodules: { id: string; name: string }[] }[];
}

const QuickAddDefect: React.FC<QuickAddDefectProps> = ({ projectModules }) => {
  const { selectedProjectId, projects, addDefect } = useApp();
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
  const [userList, setUserList] = useState<{ id: number; firstName: string; lastName: string }[]>([]);

  // Fetch modules when project changes
  React.useEffect(() => {
    if (!selectedProjectId) return;
    getModulesByProjectId(selectedProjectId).then((res) => {
      setModules((res.data || []).map((m: any) => ({ id: m.id?.toString(), name: m.moduleName })));
    });
  }, [selectedProjectId]);

  // Fetch submodules when module changes
  React.useEffect(() => {
    if (!formData.moduleId) {
      setSubmodules([]);
      setFormData(f => ({ ...f, subModuleId: '' }));
      return;
    }
    getSubmodulesByModuleId(formData.moduleId)
      .then(res => {
        const mapped = (res.data || []).map((sm: any) => ({
          id: sm.id?.toString() || sm.subModuleId?.toString(),
          name: sm.name || sm.subModuleName
        }));
        setSubmodules(mapped);
      })
      .catch(() => setSubmodules([]));
  }, [formData.moduleId]);

  // Fetch defect types and severities on mount
  React.useEffect(() => {
    getDefectTypes().then(res => setDefectTypes(res.data));
    getSeverities().then(res => setSeverities(res.data));
  }, []);

  // Fetch priorities
  React.useEffect(() => {
    getAllPriorities().then(res => setPriorities(res.data || []));
  }, []);

  // Fetch releases for the selected project
  React.useEffect(() => {
    if (!selectedProjectId) return;
    projectReleaseCardView(selectedProjectId).then(res => setReleasesData(res.data || []));
  }, [selectedProjectId]);

  // Fetch users for 'Assigned To' and 'Entered By' on mount
  React.useEffect(() => {
    axios.get(`${import.meta.env.VITE_BASE_URL}user`).then(res => {
      if (res.data && Array.isArray(res.data.data)) {
        setUserList(res.data.data.map((u: any) => ({ id: u.id, firstName: u.firstName, lastName: u.lastName })));
      }
    });
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(true);
    // Map priorityId and severityId to their names
    const priorityName = priorities.find(p => String(p.id) === formData.priorityId)?.priority || "medium";
    const severityName = severities.find(s => String(s.id) === formData.severityId)?.name || "medium";
    // Add defect to main defect table
    addDefect({
      ...formData,
      id: `DEF-${Date.now()}`,
      projectId: selectedProjectId || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: "open",
      title: formData.description || "Untitled Defect",
      priority: priorityName as "low" | "medium" | "high" | "critical",
      severity: severityName as "low" | "medium" | "high" | "critical",
      reportedBy: "system", // Placeholder, update as needed
    });
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
  };

  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await importDefects(formData);
      if (response && response.data && Array.isArray(response.data)) {
        // The original code had setModals and setCurrentModalIdx, which are removed.
        // If the intent was to show a success message or redirect, this would need to be re-evaluated.
        // For now, we'll just show an alert.
        alert("Import succeeded but no data returned.");
      } else {
        alert("Import succeeded but no data returned.");
      }
    } catch (error: any) {
      alert("Failed to import defects: " + (error?.message || error));
    }
  };

  useEffect(() => {
    getSeverities().then(res => setSeverities(res.data));
    getAllPriorities().then(res => setPriorities(res.data));
    getDefectTypes().then(res => setDefectTypes(res.data));
    if (selectedProjectId) {
      projectReleaseCardView(selectedProjectId).then(res => {
        setReleasesData(res.data || []);
      });
    } else {
      setReleasesData([]);
    }
    // Fetch submodules when module changes
    if (formData.moduleId) {
      const selectedModuleObj = projectModules.find((m: any) => m.id === formData.moduleId);
      if (selectedModuleObj && 'id' in selectedModuleObj && selectedModuleObj.id) {
        getSubmodulesByModuleId(selectedModuleObj.id).then(res => {
          setSubmodules(res.data || []);
        }).catch(() => setSubmodules([]));
      } else {
        setSubmodules([]);
      }
    } else {
      setSubmodules([]);
    }
  }, [selectedProjectId, formData.moduleId, projectModules]);

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
                    : "Select a submodule (optional)"}
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
                required
              >
                <option value="">Select assignee</option>
                {userList.map(user => (
                  <option key={user.id} value={user.id.toString()}>{user.firstName} {user.lastName}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex items-center mb-2">
            <button
              type="button"
              className="flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded shadow mr-3"
              onClick={() => fileInputRef.current?.click()}
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4"
                />
              </svg>
              Import from Excel/CSV
            </button>
            <input
              type="file"
              accept=".xlsx,.csv"
              onChange={handleImportExcel}
              ref={fileInputRef}
              className="hidden"
            />
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
    </div>
  );
};

export default QuickAddDefect;
