import React, { useState } from "react";
import { Bug, Plus } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
import { Input } from "../components/ui/Input";
import { useApp } from "../context/AppContext";
import { MdBugReport } from "react-icons/md";

const QuickAddDefect: React.FC = () => {
  const { selectedProjectId, projects, defects, addDefect, modulesByProject } =
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

  // Use modulesByProject from context instead of mockModules
  const projectModules = selectedProjectId
    ? modulesByProject[selectedProjectId] || []
    : [];
  const modulesList = projectModules.map((m) => m.name);
  const submodulesList = formData.module
    ? projectModules
        .find((m) => m.name === formData.module)
        ?.submodules.map((s: any) => s.name) || []
    : [];
  const selectedProject = projects.find((p) => p.id === selectedProjectId);

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
      reportedBy: "", // You can set this if you have user info
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
        title={
          selectedProject
            ? `Quick Add Defect (${selectedProject.name})`
            : "Quick Add Defect"
        }
        size="xl"
      >
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
                <option value="">Select a module</option>
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
                <option value="">
                  {submodulesList.length === 0
                    ? "No submodules"
                    : "Select a submodule (optional)"}
                </option>
                {submodulesList.map((submodule: string) => (
                  <option key={submodule} value={submodule}>
                    {submodule}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {/* Severity, Priority, Type, Status */}
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => handleInputChange("type", e.target.value)}
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
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange("status", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select status</option>
                <option value="open">Open</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
                <option value="rejected">Rejected</option>
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
          {/* Assigned To */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Assigned To"
              value={formData.assignedTo}
              onChange={(e) => handleInputChange("assignedTo", e.target.value)}
              required
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
              {success ? "Added!" : "Add Defect"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default QuickAddDefect;
