import React, { useState } from "react";
import { Bug, Plus } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
import { Input } from "../components/ui/Input";
import { useApp } from "../context/AppContext";
import { MdBugReport } from "react-icons/md";
import * as XLSX from "xlsx";
import { importDefects } from "../api/importTestCase";

const QuickAddDefect: React.FC = () => {
  const { selectedProjectId, projects, defects, addDefect, modulesByProject, releases } =
    useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    module: "",
    subModule: "",
    type: "bug",
    priority: "medium",
    severity: "medium",
    status: "open",
    assignedTo: "",
    rejectionComment: "",
  });
  const [success, setSuccess] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [modals, setModals] = useState([
    {
      open: false,
      formData: { ...formData },
    },
  ]);
  const [currentModalIdx, setCurrentModalIdx] = useState(0);

  const mockModules = [
    {
      name: "Authentication",
      submodules: ["Login", "Logout", "Password Reset"],
    },
    {
      name: "Dashboard",
      submodules: ["Overview", "Reports", "Analytics"],
    },
    {
      name: "User Management",
      submodules: ["Add User", "Edit User", "Delete User"],
    },
  ];
  const projectModules = selectedProjectId
    ? modulesByProject[selectedProjectId] && modulesByProject[selectedProjectId].length > 0
      ? modulesByProject[selectedProjectId]
      : mockModules
    : mockModules;
  const modulesList = projectModules.map((m) => m.name);
  let submodulesList: string[] = [];
  if (formData.module) {
    const found = projectModules.find((m) => m.name === formData.module);
    if (found) {
      // Always map to string[]
      submodulesList = (found.submodules || []).map((s: any) =>
        typeof s === 'string' ? s : s.name
      );
    }
  }
  const selectedProject = projects.find((p) => p.id === selectedProjectId);
  const activeRelease = selectedProjectId ? releases.find(r => r.projectId === selectedProjectId && r.status === 'active') : null;

  // Helper to generate next defect ID in order (same as Defects.tsx)
  const getNextDefectId = () => {
    const projectDefects = defects.filter(
      (d) => d.projectId === selectedProjectId
    );
    const ids = projectDefects
      .map((d) => d.id)
      .map((id) => parseInt(id.replace("DEF-", "")))
      .filter((n) => !isNaN(n));
    const nextNum = ids.length > 0 ? Math.max(...ids) + 1 : 1;
    return `DEF-${nextNum.toString().padStart(4, "0")}`;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(true);
    // Add defect to main defect table
    addDefect({
      ...formData,
      id: getNextDefectId(),
      projectId: selectedProjectId || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: "open", // Always set status to 'open' on add
      type: formData.type as "bug" | "test-failure" | "enhancement",
      priority: formData.priority as "low" | "medium" | "high" | "critical",
      severity: formData.severity as "low" | "medium" | "high" | "critical",
      reportedBy: "", // Set to empty string or user info if available
    });
    setTimeout(() => {
      setSuccess(false);
      setIsModalOpen(false);
      setFormData({
        title: "",
        description: "",
        module: "",
        subModule: "",
        type: "bug",
        priority: "medium",
        severity: "medium",
        status: "open",
        assignedTo: "",
        rejectionComment: "",
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
        setModals(response.data.map((row: any) => ({ open: true, formData: row })));
        setCurrentModalIdx(0);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 1200);
      } else {
        alert("Import succeeded but no data returned.");
      }
    } catch (error: any) {
      alert("Failed to import defects: " + (error?.message || error));
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
        {selectedProject && (
          <div className="font-bold text-blue-600 text-base mb-2">
            {selectedProject.name}
          </div>
        )}
        {activeRelease && (
          <div className="font-semibold text-green-700 text-sm mb-2">
            Active Release: {activeRelease.name}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Brief Description */}
          <Input
            label="Brief Description"
            value={formData.title}
            onChange={(e) => handleInputChange("title", e.target.value)}
            required
          />
          {/* Steps/Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Steps
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              required
            />
          </div>
          {/* Modules and Submodules */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Module
              </label>
              <select
                value={formData.module}
                onChange={(e) => {
                  handleInputChange("module", e.target.value);
                  handleInputChange("subModule", "");
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={!selectedProjectId}
              >
                <option value="">Select...</option>
                {modulesList.map((module: string) => (
                  <option key={module} value={module}>
                    {module}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Submodule
              </label>
              <select
                value={formData.subModule}
                onChange={(e) => handleInputChange("subModule", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={!formData.module}
              >
                <option value="">Select...</option>
                {submodulesList.map((submodule: string) => (
                  <option key={submodule} value={submodule}>
                    {submodule}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {/* Severity, Priority, Type */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Severity
              </label>
              <select
                value={formData.severity}
                onChange={(e) => handleInputChange("severity", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select severity</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => handleInputChange("priority", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select priority</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
          {/* Type and Assigned To in one row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => handleInputChange("type", e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select type</option>
                <option value="bug">Bug</option>
                <option value="test-failure">Test Failure</option>
                <option value="enhancement">Enhancement</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assigned To
              </label>
              <select
                value={formData.assignedTo}
                onChange={(e) => handleInputChange("assignedTo", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select assignee</option>
                {Array.from(new Set(defects.map((d) => d.assignedTo).filter(Boolean))).map((user) => (
                  <option key={user} value={user}>{user}</option>
                ))}
              </select>
            </div>
          </div>
          {/* Show rejection comment if status is rejected */}
          {formData.status === "rejected" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rejection Comment
              </label>
              <Input
                value={formData.rejectionComment}
                onChange={(e) =>
                  handleInputChange("rejectionComment", e.target.value)
                }
                placeholder="Enter reason for rejection"
                required={formData.status === "rejected"}
              />
            </div>
          )}
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
              {success ? "Added!" : "Save Defect"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default QuickAddDefect;
