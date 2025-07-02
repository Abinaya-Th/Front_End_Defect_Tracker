import React, { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
import { Input } from "../components/ui/Input";
import { useApp } from "../context/AppContext";
import * as exceljs from "xlsx";
import { importTestCases } from "../api/importTestCase";
import { createTestCase, createMultipleTestCases, CreateTestCaseRequest } from "../api/testCase/createTestcase";

// Mock data for modules and submodules
const mockModules: Record<
  string,
  { id: string; name: string; submodules: string[] }[]
> = {
  "2": [
    {
      id: "auth",
      name: "Authentication",
      submodules: [
        "Biometric Login",
        "PIN Login",
        "Password Reset",
        "Session Management",
      ],
    },
    {
      id: "acc",
      name: "Account Management",
      submodules: [
        "Account Overview",
        "Transaction History",
        "Account Statements",
        "Account Settings",
      ],
    },
    {
      id: "tra",
      name: "Money Transfer",
      submodules: [
        "Quick Transfer",
        "Scheduled Transfer",
        "International Transfer",
        "Transfer Limits",
      ],
    },
    {
      id: "bil",
      name: "Bill Payments",
      submodules: [
        "Bill List",
        "Payment Scheduling",
        "Payment History",
        "Recurring Payments",
      ],
    },
    {
      id: "sec",
      name: "Security Features",
      submodules: [
        "Two-Factor Auth",
        "Device Management",
        "Security Alerts",
        "Fraud Protection",
      ],
    },
    {
      id: "sup",
      name: "Customer Support",
      submodules: ["Chat Support", "FAQs", "Contact Us", "Feedback"],
    },
  ],
  "3": [
    {
      id: "auth",
      name: "Authentication",
      submodules: ["Login", "Registration", "Password Reset"],
    },
    {
      id: "reporting",
      name: "Reporting",
      submodules: ["Analytics", "Exports", "Dashboards", "Custom Reports"],
    },
    {
      id: "data",
      name: "Data Management",
      submodules: ["Data Import", "Data Processing", "Data Export"],
    },
    {
      id: "visualization",
      name: "Visualization",
      submodules: ["Charts", "Graphs", "Widgets"],
    },
  ],
  "4": [
    {
      id: "auth",
      name: "Authentication",
      submodules: ["Login", "Registration", "Password Reset"],
    },
    {
      id: "content",
      name: "Content Management",
      submodules: ["Articles", "Media", "Categories", "Templates"],
    },
    {
      id: "user",
      name: "User Management",
      submodules: ["Profile", "Settings", "Permissions", "Roles"],
    },
    {
      id: "workflow",
      name: "Workflow",
      submodules: ["Approval Process", "Review Process", "Publishing"],
    },
  ],
};

const QuickAddTestCase: React.FC = () => {
  const { selectedProjectId, projects, addTestCase, modulesByProject, setSelectedProjectId } =
    useApp();
  const [modals, setModals] = useState([
    {
      open: false,
      formData: {
        module: "",
        subModule: "",
        description: "",
        steps: "",
        type: "functional",
        severity: "medium",
      },
    },
  ]);
  const [currentModalIdx, setCurrentModalIdx] = useState(0);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Helper functions to convert names to IDs
  const getSeverityId = (severityName: string): number => {
    switch (severityName.toLowerCase()) {
      case 'critical': return 1;
      case 'high': return 2;
      case 'medium': return 3;
      case 'low': return 4;
      default: return 3; // Default to medium
    }
  };

  const getDefectTypeId = (typeName: string): number => {
    switch (typeName.toLowerCase()) {
      case 'functional': return 1;
      case 'regression': return 2;
      case 'smoke': return 3;
      case 'integration': return 4;
      default: return 1; // Default to functional
    }
  };

  const handleInputChange = (idx: number, field: string, value: string) => {
    setModals((prev) =>
      prev.map((modal, i) =>
        i === idx
          ? { ...modal, formData: { ...modal.formData, [field]: value } }
          : modal
      )
    );
  };

  const handleAddAnother = () => {
    setModals((prev) => [
      ...prev,
      {
        open: true,
        formData: {
          module: "",
          subModule: "",
          description: "",
          steps: "",
          type: "functional",
          severity: "medium",
        },
      },
    ]);
    setCurrentModalIdx(modals.length); // go to the new modal
  };

  const handleRemove = (idx: number) => {
    if (modals.length === 1) {
      setModals([{ ...modals[0], open: false }]);
      setCurrentModalIdx(0);
    } else {
      setModals((prev) => prev.filter((_, i) => i !== idx));
      setCurrentModalIdx((prevIdx) => (prevIdx > 0 ? prevIdx - 1 : 0));
    }
  };

  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await importTestCases(formData);
      if (response && response.data && Array.isArray(response.data)) {
        setModals(response.data.map((row: any) => ({ open: true, formData: row })));
        setCurrentModalIdx(0);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 1200);
      } else {
        alert("Import succeeded but no data returned.");
      }
    } catch (error: any) {
      alert("Failed to import test cases: " + (error?.message || error));
    }
  };

  const handleSubmitAll = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    setSubmitting(true);
    try {
      const testCasesToCreate: CreateTestCaseRequest[] = [];

      // Convert form data to API format
      for (const { formData } of modals) {
        // Find module and submodule IDs from names
        const moduleObj = projectModules.find(m => m.name === formData.module);
        const submoduleObj = moduleObj?.submodules.find(sm => sm.name === formData.subModule);

        if (moduleObj && submoduleObj && selectedProjectId) {
          testCasesToCreate.push({
            testcase: formData.description,
            description: formData.description,
            steps: formData.steps,
            submoduleId: Number(submoduleObj.id),
            moduleId: Number(moduleObj.id),
            projectId: Number(selectedProjectId),
            severityId: getSeverityId(formData.severity),
            defectTypeId: getDefectTypeId(formData.type),
          });
        }
      }

      if (testCasesToCreate.length > 0) {
        await createMultipleTestCases(testCasesToCreate);
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          setModals([
            {
              open: false,
              formData: {
                module: "",
                subModule: "",
                description: "",
                steps: "",
                type: "functional",
                severity: "medium",
              },
            },
          ]);
          setCurrentModalIdx(0);
        }, 1200);
      } else {
        alert("Please fill in all required fields for at least one test case.");
      }
    } catch (error: any) {
      console.error('Error creating test cases:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Use modulesByProject from context instead of mockModules
  let projectModules = selectedProjectId
    ? modulesByProject[selectedProjectId] || []
    : [];

  // Fallback to mock data if no modules are available
  if (projectModules.length === 0 && selectedProjectId) {
    const mockData = mockModules[selectedProjectId] || [];
    projectModules = mockData.map(module => ({
      id: module.id,
      name: module.name,
      submodules: module.submodules.map(submodule => ({
        id: submodule,
        name: submodule,
        assignedDevs: []
      })),
      assignedDevs: []
    }));
  }

  // Debug logging
  console.log('QuickAddTestCase - selectedProjectId:', selectedProjectId);
  console.log('QuickAddTestCase - projectModules:', projectModules);
  const selectedProject = projects.find(
    (p: { id: string }) => p.id === selectedProjectId
  );

  return (
    <div>
      <Button
        onClick={() => {
          setModals([{ ...modals[0], open: true }]);
          setCurrentModalIdx(0);
        }}
        className="flex items-center justify-center p-0 rounded-full shadow-lg bg-white hover:bg-gray-100 text-blue-700 relative group border border-blue-200"
        style={{
          width: 40,
          height: 40,
          minWidth: 40,
          minHeight: 40,
          borderRadius: "50%",
        }}
      >
        {/* Modern Clipboard with Checkmark SVG, more visible on white bg */}
        <svg
          width="32"
          height="32"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{
            position: "absolute",
            left: 4,
            top: 4,
            filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.12))",
          }}
        >
          <rect
            x="6"
            y="7"
            width="20"
            height="18"
            rx="4"
            fill="#fff"
            stroke="#2563eb"
            strokeWidth="2"
          />
          <rect
            x="11"
            y="3.5"
            width="10"
            height="5"
            rx="2.5"
            fill="#2563eb"
            stroke="#2563eb"
            strokeWidth="1.5"
          />
          <path
            d="M12 16l3 3 5-5"
            stroke="#22c55e"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
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
          Add Test Case
        </span>
      </Button>
      {modals[currentModalIdx]?.open &&
        (() => {
          const idx = currentModalIdx;
          const modal = modals[idx];
          const submodules: string[] =
            projectModules
              .find((m: { name: string }) => m.name === modal.formData.module)
              ?.submodules.map((s: any) => s.name) || [];
          return (
            <Modal
              key={idx}
              isOpen={modal.open}
              onClose={() => {
                if (modals.length === 1) {
                  setModals([{ ...modals[0], open: false }]);
                  setCurrentModalIdx(0);
                } else {
                  handleRemove(idx);
                }
              }}
              title={
                selectedProject
                  ? `Add New Test Case (${selectedProject.name})`
                  : "Add New Test Case - Select Project"
              }
              size="xl"
            >
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSubmitAll();
                }}
                className="space-y-4"
              >
                {!selectedProjectId && (
                  <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center mb-2">
                      <svg className="w-5 h-5 text-yellow-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <label className="block text-sm font-medium text-yellow-800">
                        Select Project First
                      </label>
                    </div>
                    <select
                      value={selectedProjectId || ""}
                      onChange={(e) => {
                        setSelectedProjectId(e.target.value || null);
                      }}
                      className="w-full px-3 py-2 border border-yellow-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                      required
                    >
                      <option value="">Select a Project</option>
                      {projects.map((project: any) => (
                        <option key={project.id} value={project.id}>
                          {project.name}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-yellow-700 mt-1">
                      You need to select a project before creating test cases.
                    </p>
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
                  <Button
                    type="button"
                    onClick={handleAddAnother}
                    className="ml-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
                  >
                    + Add Another Test Case
                  </Button>
                </div>
                <div className="border rounded-lg p-4 mb-2 relative">
                  {modals.length > 1 && (
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => handleRemove(idx)}
                      className="absolute top-2 right-2 px-2 py-1"
                    >
                      Remove
                    </Button>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Module
                      </label>
                      <select
                        value={modal.formData.module}
                        onChange={(e) => {
                          handleInputChange(idx, "module", e.target.value);
                          handleInputChange(idx, "subModule", "");
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                        disabled={!selectedProjectId}
                      >
                        <option value="">Select Module</option>
                        {projectModules.map(
                          (module: { id: string; name: string }) => (
                            <option key={module.id} value={module.name}>
                              {module.name}
                            </option>
                          )
                        )}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Sub Module
                      </label>
                      <select
                        value={modal.formData.subModule}
                        onChange={(e) =>
                          handleInputChange(idx, "subModule", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        // Remove required, allow empty
                        disabled={!modal.formData.module}
                      >
                        <option value="">
                          {submodules.length === 0
                            ? "No submodules"
                            : "Select a submodule (optional)"}
                        </option>
                        {submodules.map((submodule: string) => (
                          <option key={submodule} value={submodule}>
                            {submodule}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Type
                      </label>
                      <select
                        value={modal.formData.type}
                        onChange={(e) =>
                          handleInputChange(idx, "type", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      >
                        <option value="functional">Functional</option>
                        <option value="regression">Regression</option>
                        <option value="smoke">Smoke</option>
                        <option value="integration">Integration</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Severity
                      </label>
                      <select
                        value={modal.formData.severity}
                        onChange={(e) =>
                          handleInputChange(idx, "severity", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="critical">Critical</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={modal.formData.description}
                      onChange={(e) =>
                        handleInputChange(idx, "description", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows={1}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Test Steps
                    </label>
                    <textarea
                      value={modal.formData.steps}
                      onChange={(e) =>
                        handleInputChange(idx, "steps", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows={4}
                      required
                    />
                  </div>
                </div>
                <div className="flex justify-between items-center pt-4">
                  <div className="flex space-x-2">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setCurrentModalIdx(idx - 1)}
                      disabled={idx === 0}
                    >
                      Previous
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setCurrentModalIdx(idx + 1)}
                      disabled={idx === modals.length - 1}
                    >
                      Next
                    </Button>
                  </div>
                  <div className="flex space-x-3">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => {
                        if (modals.length === 1) {
                          setModals([{ ...modals[0], open: false }]);
                          setCurrentModalIdx(0);
                        } else {
                          handleRemove(idx);
                        }
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={success || submitting || !selectedProjectId}>
                      {submitting ? "Submitting..." : (success ? "Added!" : (!selectedProjectId ? "Select Project First" : "Submit"))}
                    </Button>
                  </div>
                </div>
              </form>
            </Modal>
          );
        })()}
    </div>
  );
};

export default QuickAddTestCase;
