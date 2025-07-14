import React, { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
import { Input } from "../components/ui/Input";
import { useApp } from "../context/AppContext";
import * as exceljs from "xlsx";
import { importTestCases } from "../api/importTestCase";
import { getSeverities } from "../api/severity";
import { getDefectTypes } from "../api/defectType";
import { getModulesByProjectId } from "../api/module/getModule";
import { getSubmodulesByModuleId } from "../api/submodule/submoduleget";
import { createTestCase } from "../api/testCase/createTestcase";
import AlertModal from "../components/ui/AlertModal";

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

const QuickAddTestCase: React.FC<{ selectedProjectId: string }> = ({ selectedProjectId }) => {
  const { projects, addTestCase, modulesByProject } =
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
        severity: "",
      },
    },
  ]);
  const [currentModalIdx, setCurrentModalIdx] = useState(0);
  const [success, setSuccess] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [severities, setSeverities] = useState<{ id: number; name: string; color: string }[]>([]);
  const [defectTypes, setDefectTypes] = useState<{ id: number; defectTypeName: string }[]>([]);
  const [modules, setModules] = useState<any[]>([]);
  const [subModules, setSubModules] = useState<any[]>([]);
  const [alert, setAlert] = useState({ isOpen: false, message: "" });
  const showAlert = (message: string) => setAlert({ isOpen: true, message });
  const closeAlert = () => setAlert((a) => ({ ...a, isOpen: false }));

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
          severity: "",
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
        showAlert("Import succeeded but no data returned.");
      }
    } catch (error: any) {
      showAlert("Failed to import test cases: " + (error?.message || error));
    }
  };

  const handleSubmitAll = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    let allSuccess = true;
    for (const { formData } of modals) {
      // Map names to IDs
      const selectedModule = modules.find((m: any) => m.moduleName === formData.module);
      const selectedSubModule = subModules.find((s: any) => (s.subModuleName || s.name) === formData.subModule);
      const selectedSeverity = severities.find((sev) => sev.name === formData.severity);
      const selectedDefectType = defectTypes.find((dt) => dt.defectTypeName === formData.type);
      if (!selectedModule || !selectedSeverity || !selectedDefectType) {
        allSuccess = false;
        continue;
      }
      const payload = {
        subModuleId: selectedSubModule ? (selectedSubModule.subModuleId || selectedSubModule.id) : 0,
        moduleId: selectedModule.id,
        steps: formData.steps,
        severityId: selectedSeverity.id,
        projectId: Number(selectedProjectId),
        description: formData.description,
        defectTypeId: selectedDefectType.id,
      };
      try {
        const response = await createTestCase(payload);
        if (response?.status === 'Failure' || response?.statusCode === 4000) {
          showAlert(response?.message || 'Failed to create test case.');
          allSuccess = false;
        } else {
          showAlert(response?.message || 'Test case created successfully!');
        }
      } catch (error: any) {
        showAlert(error?.response?.data?.message || error?.message || 'Failed to create test case.');
        allSuccess = false;
      }
    }
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
            severity: "",
          },
        },
      ]);
      setCurrentModalIdx(0);
    }, 1200);
    if (!allSuccess) {
      showAlert("Some test cases could not be added. Please check your input.");
    }
  };

  // Add a helper to check if the current modal form is valid
  const isCurrentModalValid = (modal: any) => {
    return (
      modal.module &&
      modal.subModule &&
      modal.description &&
      modal.steps &&
      modal.type &&
      modal.severity
    );
  };

  // Use modulesByProject from context instead of mockModules
  const projectModules = selectedProjectId
    ? modulesByProject[selectedProjectId] || []
    : [];
  const selectedProject = projects && projects.find(
    (p: { id: string }) => p.id === selectedProjectId
  );

  // Fetch static data only once on mount
  useEffect(() => {
    getSeverities()
      .then(res => setSeverities(res.data))
      .catch(() => setSeverities([]));
    getDefectTypes()
      .then(res => setDefectTypes(res.data))
      .catch(() => setDefectTypes([]));
  }, []);

  // Fetch modules when project changes
  useEffect(() => {
    if (selectedProjectId) {
      getModulesByProjectId(selectedProjectId)
        .then(res => setModules(res.data))
        .catch(() => setModules([]));
    } else {
      setModules([]);
    }
  }, [selectedProjectId]);

  // Fetch submodules for the selected module only
  useEffect(() => {
    const currentModuleName = modals[currentModalIdx]?.formData.module;
    const selectedModuleObj = modules && modules.find(
      (m: any) => m.moduleName === currentModuleName
    );
    if (selectedModuleObj && selectedModuleObj.id) {
      getSubmodulesByModuleId(selectedModuleObj.id)
        .then(res => setSubModules(res.data || []))
        .catch(() => setSubModules([]));
    } else {
      setSubModules([]);
    }
  }, [modals[currentModalIdx]?.formData.module, modules]);

  return (
    <div>
      <Button
        onClick={() => {
          setModals([{ ...modals[0], open: true }]);
          setCurrentModalIdx(0);
        }}
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
            && projectModules.find((m: { name: string }) => m.name === modal.formData.module)
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
                  : "Add New Test Case"
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
                <div className="border rounded-lg p-4 mb-2 relative">
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
                        {modules.map(
                          (module: { id: string; moduleName: string }) => (
                            <option key={module.id} value={module.moduleName}>
                              {module.moduleName}
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
                        onChange={(e) => handleInputChange(idx, "subModule", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        disabled={!modal.formData.module}
                      >
                        <option value="">
                          {subModules.length === 0
                            ? "No submodules"
                            : "Select a submodule (optional)"}
                        </option>
                        {subModules
                          .filter((submodule: any) => {
                            return (
                              submodule.moduleName === modal.formData.module ||
                              submodule.name === modal.formData.subModule ||
                              !submodule.moduleName // fallback for mock data
                            );
                          })
                          .map((submodule: any) => (
                            <option key={submodule.subModuleId || submodule.id || submodule.name} value={submodule.subModuleName || submodule.name}>
                              {submodule.subModuleName || submodule.name}
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
                        <option value="">Select Type</option>
                        {defectTypes.map((type) => (
                          <option key={type.id} value={type.defectTypeName}>
                            {type.defectTypeName}
                          </option>
                        ))}
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
                        <option value="">Select Severity</option>
                        {severities.map((severity) => (
                          <option key={severity.id} value={severity.name}>
                            {severity.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <p className="text-xs text-gray-500 mb-1">Description must contain letters and at least one number or special character</p>
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
                    <p className="text-xs text-gray-500 mb-1">Steps must contain letters and at least one number or special character (e.g., "1. Step one", "Step 1!")</p>
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
                      onClick={() => {
                        if (idx === modals.length - 1) {
                          setModals((prev) => [
                            ...prev,
                            {
                              open: true,
                              formData: {
                                module: modal.formData.module,
                                subModule: modal.formData.subModule,
                                description: "",
                                steps: "",
                                type: "functional",
                                severity: "",
                              },
                            },
                          ]);
                          setCurrentModalIdx(modals.length);
                        } else {
                          setCurrentModalIdx(idx + 1);
                        }
                      }}
                      disabled={!isCurrentModalValid(modal.formData)}
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
                    <Button type="submit" disabled={success || !isCurrentModalValid(modal.formData)}>
                      {success ? "Added!" : "Submit"}
                    </Button>
                  </div>
                </div>
              </form>
            </Modal>
          );
        })()}
      <AlertModal
        isOpen={alert.isOpen}
        message={alert.message}
        onClose={closeAlert}
      />
    </div>
  );
};

export default QuickAddTestCase;
