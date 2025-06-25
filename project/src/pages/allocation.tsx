import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import {
  ChevronLeft,
  Eye,
  Edit2,
  Trash2,
  Plus,
  ChevronRight,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { Modal } from "../components/ui/Modal";
import QuickAddTestCase from "./QuickAddTestCase";
import QuickAddDefect from "./QuickAddDefect";
import { ProjectSelector } from "../components/ui/ProjectSelector";
import axios from "axios";
import { projectReleaseCardView } from "../api/releaseView/ProjectReleaseCardView";

const TABS = [
  { key: "release", label: "Release Allocation" },
  { key: "qa", label: "QA Allocation" },
];

export const Allocation: React.FC = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const {
    projects,
    releases,
    employees,
    testCases,
    setSelectedProjectId,
    modulesByProject,
  } = useApp();
  const [activeTab, setActiveTab] = useState<"release" | "qa">("release");
  const [selectedReleaseIds, setSelectedReleaseIds] = useState<string[]>([]);
  const [selectedModule, setSelectedModule] = useState("");
  const [selectedSubmodule, setSelectedSubmodule] = useState<string>("");
  const [selectedQA, setSelectedQA] = useState<string | null>(null);
  const [selectedTestCases, setSelectedTestCases] = useState<string[]>([]);
  const [isViewStepsModalOpen, setIsViewStepsModalOpen] = useState(false);
  const [isViewTestCaseModalOpen, setIsViewTestCaseModalOpen] = useState(false);
  const [viewingTestCase, setViewingTestCase] = useState<any>(null);
  const [bulkModuleSelect, setBulkModuleSelect] = useState(false);
  const [bulkSubmoduleSelect, setBulkSubmoduleSelect] = useState(false);
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [selectedSubmodules, setSelectedSubmodules] = useState<string[]>([]);
  const [apiRelease, setApiRelease] = useState<any>(null);
  const [loadingRelease, setLoadingRelease] = useState(false);
  const [releaseError, setReleaseError] = useState<string | null>(null);
  const [projectRelease, setProjectRelease] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  React.useEffect(() => {
    if (projectId) setSelectedProjectId(projectId);
  }, [projectId, setSelectedProjectId]);
const getReleaseCardView =  async() =>{

      try {
          const response = await projectReleaseCardView(selectedProject);
          setProjectRelease(response.data || []);
      } catch (error) {
          console.error("Error fetching release card view:", error);
      }
  }
  useEffect(() => {
      getReleaseCardView();
  }, [selectedProject]);

  console.log("Project Release Data:", projectRelease);
  

  // Filter releases for this project
  const projectReleases = releases.filter((r) => r.projectId === projectId);
  // Filter test cases for this project
  const projectTestCases = testCases.filter((tc) => tc.projectId === projectId);

  // Get modules for selected project from context
  const projectModules = projectId ? modulesByProject[projectId] || [] : [];

  // --- Bulk selection effect for test cases ---
  useEffect(() => {
    if (
      activeTab === "release" &&
      selectedReleaseIds.length > 0 &&
      (bulkModuleSelect || bulkSubmoduleSelect)
    ) {
      let ids: string[] = [];
      if (bulkModuleSelect && selectedModules.length > 0) {
        ids = [
          ...ids,
          ...projectTestCases
            .filter((tc) => selectedModules.includes(tc.module))
            .map((tc) => tc.id),
        ];
      } else if (bulkSubmoduleSelect && selectedSubmodules.length > 0) {
        ids = [
          ...ids,
          ...projectTestCases
            .filter((tc) => selectedSubmodules.includes(tc.subModule))
            .map((tc) => tc.id),
        ];
      }
      setSelectedTestCases(Array.from(new Set(ids)));
    }
  }, [
    bulkModuleSelect,
    bulkSubmoduleSelect,
    selectedModules,
    selectedSubmodules,
  ]);

  // --- Filtered test cases for table ---
  let filteredTestCases = projectTestCases;
  if (
    activeTab === "release" &&
    selectedReleaseIds.length > 0 &&
    (bulkModuleSelect || bulkSubmoduleSelect)
  ) {
    let ids: Set<string> = new Set();
    if (bulkModuleSelect && selectedModules.length > 0) {
      projectTestCases.forEach((tc) => {
        if (selectedModules.includes(tc.module)) ids.add(tc.id);
      });
    }
    if (bulkSubmoduleSelect && selectedSubmodules.length > 0) {
      projectTestCases.forEach((tc) => {
        if (selectedSubmodules.includes(tc.subModule)) ids.add(tc.id);
      });
    }
    filteredTestCases = projectTestCases.filter((tc) => ids.has(tc.id));
  } else if (selectedModule) {
    filteredTestCases = projectTestCases.filter(
      (tc) =>
        tc.module === selectedModule &&
        (!selectedSubmodule || tc.subModule === selectedSubmodule)
    );
  }

  // Project selection handler
  const handleProjectSelect = (id: string) => {
    setSelectedProjectId(id);
    setSelectedProject(id);
    setSelectedModule("");
    setSelectedSubmodule("");
    setSelectedTestCases([]);
  };

  // --- UI Panels ---
  const ProjectSelectionPanel = () => (
    <ProjectSelector
      projects={projects}
      selectedProjectId={projectId || null}
      onSelect={handleProjectSelect}
      className="mb-4"
    />
  );


  const ReleaseCardsPanel = () => (
    <div className="mb-4">
      <div className="flex space-x-2 overflow-x-auto">
        {projectRelease.map((release) => {
          const isSelected = selectedReleaseIds.includes(release.releaseId);
          return (
            <div
              key={release.releaseId}
              className={`min-w-[160px] px-4 py-2 rounded-md border text-left transition-colors duration-200 focus:outline-none text-sm font-medium shadow-sm flex flex-col items-start relative bg-white
                ${
                  isSelected
                    ? "border-blue-500 ring-2 ring-blue-300"
                    : "border-gray-200 hover:bg-gray-50"
                }`}
              style={{
                boxShadow: isSelected ? "0 0 0 2px #3b82f6" : undefined,
              }}
            >
              <div className="truncate font-semibold mb-1">{release.releaseName}</div>
              {/* <div className="text-xs text-gray-500 truncate mb-2">
                v{release.version}
              </div> */}
              <Button
                size="sm"
                variant={isSelected ? "primary" : "secondary"}
                className="w-full"
                onClick={() => {
                  setSelectedReleaseIds((prev) =>
                    isSelected
                      ? prev.filter((id) => id !== release.releaseId)
                      : [...prev, release.releaseId]
                  );
                }}
              >
                {isSelected ? "Selected" : "Select"}
              </Button>
            </div>
          );
        })}
      </div>
      {/* Allocate button appears if at least one release is selected */}
      {selectedReleaseIds.length > 0 && (
        <div className="mt-4 flex justify-end">
          <Button
            variant="primary"
            disabled={selectedTestCases.length === 0}
            onClick={() => {
              console.log("Allocate button clicked");
            }}
          >
            Allocate
          </Button>
        </div>
      )}
    </div>
  );

  const ModuleSelectionPanel = () => (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold text-gray-900">
            Module Selection
          </h2>
          {activeTab === "release" && selectedReleaseIds.length > 0 && (
            <Button
              size="sm"
              variant={bulkModuleSelect ? "primary" : "secondary"}
              onClick={() => {
                setBulkModuleSelect((v) => !v);
                setSelectedModules([]);
              }}
            >
              {bulkModuleSelect ? "Cancel Bulk" : "Bulk Select"}
            </Button>
          )}
        </div>
        <div className="relative flex items-center">
          <button
            onClick={() => {
              const container = document.getElementById("module-scroll");
              if (container) container.scrollLeft -= 200;
            }}
            className="flex-shrink-0 z-10 bg-white shadow-md rounded-full p-1 hover:bg-gray-50 mr-2"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div
            id="module-scroll"
            className="flex space-x-2 overflow-x-auto pb-2 scroll-smooth flex-1"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {projectModules.map((module) => {
              const moduleTestCases = testCases.filter(
                (tc: any) =>
                  tc.projectId === projectId && tc.module === module.name
              );
              const isSelected = bulkModuleSelect
                ? selectedModules.includes(module.name)
                : selectedModule === module.name;
              return (
                <Button
                  key={module.id}
                  variant={isSelected ? "primary" : "secondary"}
                  onClick={() => {
                    if (bulkModuleSelect) {
                      setSelectedModules((prev) =>
                        prev.includes(module.name)
                          ? prev.filter((m) => m !== module.name)
                          : [...prev, module.name]
                      );
                    } else {
                      setSelectedModule(module.name);
                      setSelectedSubmodule("");
                      setSelectedTestCases([]);
                    }
                  }}
                  className={`whitespace-nowrap m-2 ${
                    isSelected ? " ring-2 ring-blue-400 border-blue-500" : ""
                  }`}
                >
                  {module.name}
                </Button>
              );
            })}
          </div>
          <button
            onClick={() => {
              const container = document.getElementById("module-scroll");
              if (container) container.scrollLeft += 200;
            }}
            className="flex-shrink-0 z-10 bg-white shadow-md rounded-full p-1 hover:bg-gray-50 ml-2"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </CardContent>
    </Card>
  );

  const SubmoduleSelectionPanel = () => {
    const submodules =
      projectId && selectedModule
        ? projectModules.find((m) => m.name === selectedModule)?.submodules ||
          []
        : [];
    return (
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold text-gray-900">
              Submodule Selection
            </h2>
            {activeTab === "release" && selectedReleaseIds.length > 0 && (
              <Button
                size="sm"
                variant={bulkSubmoduleSelect ? "primary" : "secondary"}
                onClick={() => {
                  setBulkSubmoduleSelect((v) => !v);
                  setSelectedSubmodules([]);
                }}
              >
                {bulkSubmoduleSelect ? "Cancel Bulk" : "Bulk Select"}
              </Button>
            )}
          </div>
          <div className="relative flex items-center">
            <button
              onClick={() => {
                const container = document.getElementById("submodule-scroll");
                if (container) container.scrollLeft -= 200;
              }}
              className="flex-shrink-0 z-10 bg-white shadow-md rounded-full p-1 hover:bg-gray-50 mr-2"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div
              id="submodule-scroll"
              className="flex space-x-2 overflow-x-auto pb-2 scroll-smooth flex-1"
              style={{
                scrollbarWidth: "none",
                msOverflowStyle: "none",
                maxWidth: "100%",
              }}
            >
              {submodules.map((submodule) => {
                const isSelected = bulkSubmoduleSelect
                  ? selectedSubmodules.includes(submodule.name)
                  : selectedSubmodule === submodule.name;
                return (
                  <Button
                    key={submodule.id}
                    variant={isSelected ? "primary" : "secondary"}
                    onClick={() => {
                      if (bulkSubmoduleSelect) {
                        setSelectedSubmodules((prev) =>
                          prev.includes(submodule.name)
                            ? prev.filter((s) => s !== submodule.name)
                            : [...prev, submodule.name]
                        );
                      } else {
                        setSelectedSubmodule(submodule.name);
                        setSelectedTestCases([]);
                      }
                    }}
                    className={`whitespace-nowrap m-2 ${
                      isSelected ? " ring-2 ring-blue-400 border-blue-500" : ""
                    }`}
                  >
                    {submodule.name}
                  </Button>
                );
              })}
            </div>
            <button
              onClick={() => {
                const container = document.getElementById("submodule-scroll");
                if (container) container.scrollLeft += 200;
              }}
              className="flex-shrink-0 z-10 bg-white shadow-md rounded-full p-1 hover:bg-gray-50 ml-2"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Severity color helper
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Selection logic
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTestCases(filteredTestCases.map((tc) => tc.id));
    } else {
      setSelectedTestCases([]);
    }
  };
  const handleSelectTestCase = (testCaseId: string, checked: boolean) => {
    if (checked) {
      setSelectedTestCases([...selectedTestCases, testCaseId]);
    } else {
      setSelectedTestCases(selectedTestCases.filter((id) => id !== testCaseId));
    }
  };

  // Table with all columns and actions
  const TestCaseTable = () => (
    <Card>
      <CardContent className="p-0">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr className="border-b border-gray-200">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <input
                  type="checkbox"
                  checked={
                    selectedTestCases.length === filteredTestCases.length &&
                    filteredTestCases.length > 0
                  }
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Test Case ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Steps
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Severity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredTestCases.map((tc) => (
              <tr key={tc.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedTestCases.includes(tc.id)}
                    onChange={(e) =>
                      handleSelectTestCase(tc.id, e.target.checked)
                    }
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {tc.id}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {tc.description}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  <button
                    onClick={() => {
                      setViewingTestCase(tc);
                      setIsViewStepsModalOpen(true);
                    }}
                    className="text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                    title="View Steps"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View</span>
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {tc.type}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(
                      tc.severity
                    )}`}
                  >
                    {tc.severity}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setViewingTestCase(tc);
                        setIsViewTestCaseModalOpen(true);
                      }}
                      className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                      title="View"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        /* handleEdit(tc) */
                      }}
                      className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        /* handleDelete(tc.id) */
                      }}
                      className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );

  const QASelectionPanel = () => (
    <Card className="mb-4">
      <CardContent className="p-4 flex flex-wrap gap-2">
        {employees
          .filter((emp) => emp.designation.toLowerCase().includes("qa"))
          .map((emp) => (
            <Button
              key={emp.id}
              variant={selectedQA === emp.id ? "primary" : "secondary"}
              onClick={() => setSelectedQA(emp.id)}
            >
              {emp.firstName} {emp.lastName}
            </Button>
          ))}
      </CardContent>
    </Card>
  );

  useEffect(() => {
    if (activeTab === "release" && selectedReleaseIds.length === 1) {
      setLoadingRelease(true);
      setReleaseError(null);
      axios
        .get(
          `http://192.168.1.99:8083/api/v1/releases/releaseId/${selectedReleaseIds[0]}`
        )
        .then((res) => setApiRelease(res.data))
        .catch((err) => setReleaseError(err.message))
        .finally(() => setLoadingRelease(false));
    } else {
      setApiRelease(null);
    }
  }, [activeTab, selectedReleaseIds]);

  return (
    <div className="max-w-5xl mx-auto py-8">
      {/* Back Button at the top right */}
      <div className="mb-4 flex justify-end">
        <Button
          variant="secondary"
          onClick={() => navigate(`/projects/${projectId}/releases`)}
          className="flex items-center"
        >
          <ChevronLeft className="w-5 h-5 mr-2" /> Back
        </Button>
      </div>
      {ProjectSelectionPanel()}
      {/* Show release details if a single release is selected */}
      {activeTab === "release" && selectedReleaseIds.length === 1 && (
        <div className="mb-4">
          {loadingRelease && (
            <div className="p-4 text-center text-blue-600">
              Loading release details...
            </div>
          )}
          {releaseError && (
            <div className="p-4 text-center text-red-600">{releaseError}</div>
          )}
          {apiRelease && (
            <Card className="mb-4">
              <CardContent>
                <div className="font-bold text-lg mb-1">{apiRelease.name}</div>
                <div className="mb-1">Version: {apiRelease.version}</div>
                <div className="mb-1">Description: {apiRelease.description}</div>
                <div className="mb-1">
                  Release Date:{" "}
                  {apiRelease.releaseDate
                    ? new Date(apiRelease.releaseDate).toLocaleDateString()
                    : "TBD"}
                </div>
                <div className="mb-1">Type: {apiRelease.releaseType}</div>
                {/* Add more fields as needed */}
              </CardContent>
            </Card>
          )}
        </div>
      )}
      {/* Tabs */}
      <div className="flex space-x-4 mb-6 border-b border-gray-200">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={`px-4 py-2 font-medium border-b-2 transition-colors duration-200 ${
              activeTab === tab.key
                ? "border-blue-500 text-blue-700"
                : "border-transparent text-gray-500 hover:text-blue-700"
            }`}
            onClick={() => setActiveTab(tab.key as "release" | "qa")}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {/* Tab Content */}
      {activeTab === "release" ? (
        <>
          <ReleaseCardsPanel />
          {ModuleSelectionPanel()}
          {SubmoduleSelectionPanel()}
          <TestCaseTable />
        </>
      ) : (
        <>
          <QASelectionPanel />
          {ModuleSelectionPanel()}
          {SubmoduleSelectionPanel()}
          <TestCaseTable />
        </>
      )}
      {/* View Steps Modal */}
      <Modal
        isOpen={isViewStepsModalOpen}
        onClose={() => {
          setIsViewStepsModalOpen(false);
          setViewingTestCase(null);
        }}
        title={`Test Steps - ${viewingTestCase?.id}`}
      >
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-gray-700 whitespace-pre-line">
              {viewingTestCase?.steps}
            </p>
          </div>
          <div className="flex justify-end pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsViewStepsModalOpen(false);
                setViewingTestCase(null);
              }}
            >
              Close
            </Button>
          </div>
        </div>
      </Modal>
      {/* View Test Case Modal */}
      <Modal
        isOpen={isViewTestCaseModalOpen}
        onClose={() => {
          setIsViewTestCaseModalOpen(false);
          setViewingTestCase(null);
        }}
        title={`Test Case Details - ${viewingTestCase?.id}`}
        size="xl"
      >
        {viewingTestCase && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  Description
                </h3>
                <p className="mt-1 text-sm text-gray-900">
                  {viewingTestCase.description}
                </p>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">
                Test Steps
              </h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700 whitespace-pre-line">
                  {viewingTestCase.steps}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Severity</h3>
                <span
                  className={`mt-1 inline-flex px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(
                    viewingTestCase.severity
                  )}`}
                >
                  {viewingTestCase.severity}
                </span>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Module</h3>
                <p className="mt-1 text-sm text-gray-900">
                  {viewingTestCase.module} / {viewingTestCase.subModule}
                </p>
              </div>
            </div>
            <div className="flex justify-end pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setIsViewTestCaseModalOpen(false);
                  setViewingTestCase(null);
                }}
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
      {/* Fixed Quick Add Button */}
      <div
        style={{
          position: "fixed",
          bottom: 32,
          right: 32,
          zIndex: 50,
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <QuickAddTestCase />
        <QuickAddDefect />
      </div>
    </div>
  );
};
