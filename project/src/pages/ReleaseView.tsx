import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Input } from "../components/ui/Input";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  FileText,
  Users,
  Eye,
  Edit2,
  Trash2,
  Plus,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { Modal } from "../components/ui/Modal";
import QuickAddTestCase from "./QuickAddTestCase";
import QuickAddDefect from "./QuickAddDefect";

// Define interfaces for our data types
interface TestCase {
  id: string;
  module: string;
  subModule: string;
  description: string;
  steps: string;
  type: "functional" | "regression" | "smoke" | "integration";
  severity: "low" | "medium" | "high" | "critical";
  projectId: string;
  releaseId?: string;
}

interface Module {
  id: string;
  name: string;
  submodules: string[];
}

// Mock data for modules and submodules
const mockModules: { [key: string]: Module[] } = {
  "2": [
    // Mobile Banking App
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
    // Analytics Dashboard
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
    // Content Management
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

export const ReleaseView: React.FC = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { projects, releases, testCases, setSelectedProjectId, addRelease } =
    useApp();
  const [selectedProject, setSelectedProject] = useState<string | null>(
    projectId || null
  );
  const [selectedRelease, setSelectedRelease] = useState<string | null>(null);
  const [selectedModule, setSelectedModule] = useState("");
  const [selectedSubmodule, setSelectedSubmodule] = useState("");
  const [isViewStepsModalOpen, setIsViewStepsModalOpen] = useState(false);
  const [isViewTestCaseModalOpen, setIsViewTestCaseModalOpen] = useState(false);
  const [isCreateReleaseModalOpen, setIsCreateReleaseModalOpen] =
    useState(false);
  const [viewingTestCase, setViewingTestCase] = useState<TestCase | null>(null);
  const [releaseFormData, setReleaseFormData] = useState({
    name: "",
    version: "",
    description: "",
    releaseDate: "",
    releaseType: "",
  });

  useEffect(() => {
    if (selectedProject) {
      setSelectedProjectId(selectedProject);
    }
  }, [selectedProject, setSelectedProjectId]);

  // Filter releases for selected project
  const projectReleases = releases.filter(
    (r) => r.projectId === selectedProject
  );

  // Get modules for selected project
  const projectModules = selectedProject
    ? mockModules[selectedProject] || []
    : [];

  // Filter test cases for selected release
  const releaseTestCases = testCases.filter(
    (tc) => tc.projectId === selectedProject && tc.releaseId === selectedRelease
  );

  // Filter test cases based on module/submodule selection
  const filteredTestCases = React.useMemo(() => {
    if (!selectedRelease) return [];

    let filtered = releaseTestCases;

    if (selectedModule) {
      filtered = filtered.filter((tc) => tc.module === selectedModule);
    }

    if (selectedSubmodule) {
      filtered = filtered.filter((tc) => tc.subModule === selectedSubmodule);
    }

    return filtered;
  }, [releaseTestCases, selectedModule, selectedSubmodule, selectedRelease]);

  // Handle project selection
  const handleProjectSelect = (projectId: string) => {
    setSelectedProject(projectId);
    setSelectedProjectId(projectId);
    setSelectedRelease(null);
    setSelectedModule("");
    setSelectedSubmodule("");
  };

  // Handle release selection
  const handleReleaseSelect = (releaseId: string) => {
    setSelectedRelease(releaseId);
    setSelectedModule("");
    setSelectedSubmodule("");
  };

  // Handle module selection
  const handleModuleSelect = (moduleName: string) => {
    setSelectedModule(moduleName);
    setSelectedSubmodule("");
  };

  // Handle submodule selection
  const handleSubmoduleSelect = (submoduleName: string) => {
    setSelectedSubmodule(submoduleName);
  };

  // Get severity color
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

  const handleViewSteps = (testCase: TestCase) => {
    setViewingTestCase(testCase);
    setIsViewStepsModalOpen(true);
  };

  const handleViewTestCase = (testCase: TestCase) => {
    setViewingTestCase(testCase);
    setIsViewTestCaseModalOpen(true);
  };

  // Handle create release
  const handleCreateRelease = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedProject) return;

    const newRelease = {
      id: `R${Date.now()}`,
      name: releaseFormData.name,
      version: releaseFormData.version,
      description: releaseFormData.description,
      projectId: selectedProject,
      status: "planned" as const,
      releaseDate: releaseFormData.releaseDate || undefined,
      Testcase: [],
      features: [],
      bugFixes: [],
      releaseType: releaseFormData.releaseType,
      createdAt: new Date().toISOString(),
    };

    addRelease(newRelease);
    setReleaseFormData({
      name: "",
      version: "",
      description: "",
      releaseDate: "",
      releaseType: "",
    });
    setIsCreateReleaseModalOpen(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setReleaseFormData((prev) => ({ ...prev, [field]: value }));
  };

  // If we're in detailed release view (release selected)
  if (selectedRelease) {
    const currentRelease = releases.find((r) => r.id === selectedRelease);
    const currentProject = projects.find((p) => p.id === selectedProject);

    return (
      <div className="max-w-6xl mx-auto">
        {/* Fixed Header Section */}
        <div className="flex-none p-6 pb-4">
          <div className="flex justify-between items-center mb-4">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-gray-900">
                Release Details
              </h1>
              <p className="text-sm text-gray-500">
                {currentProject?.name} - {currentRelease?.name}
              </p>
            </div>
            <Button
              variant="secondary"
              onClick={() => setSelectedRelease(null)}
              className="flex items-center space-x-2"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </Button>
          </div>

          {/* Module Selection Panel */}
          <Card className="mb-4">
            <CardContent className="p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                Module Selection
              </h2>
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
                    const moduleTestCases = filteredTestCases.filter(
                      (tc) => tc.module === module.name
                    );
                    return (
                      <Button
                        key={module.id}
                        variant={
                          selectedModule === module.name
                            ? "primary"
                            : "secondary"
                        }
                        onClick={() => handleModuleSelect(module.name)}
                        className="whitespace-nowrap m-2"
                      >
                        {module.name}
                        <Badge variant="info" className="ml-2">
                          {moduleTestCases.length}
                        </Badge>
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

          {/* Submodule Selection Panel */}
          <Card className="mb-4">
            <CardContent className="p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                Submodule Selection
              </h2>
              <div className="relative flex items-center min-h-[44px]">
                <button
                  onClick={() => {
                    const container =
                      document.getElementById("submodule-scroll");
                    if (container) container.scrollLeft -= 200;
                  }}
                  className="flex-shrink-0 z-10 bg-white shadow-md rounded-full p-1 hover:bg-gray-50 mr-2"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>
                <div
                  id="submodule-scroll"
                  className="flex space-x-2 overflow-x-auto p-2 scroll-smooth flex-1"
                  style={{
                    scrollbarWidth: "none",
                    msOverflowStyle: "none",
                    maxWidth: "100%",
                  }}
                >
                  {projectModules
                    .find((m) => m.name === selectedModule)
                    ?.submodules.map((submodule) => {
                      const submoduleTestCases = filteredTestCases.filter(
                        (tc) =>
                          tc.module === selectedModule &&
                          tc.subModule === submodule
                      );
                      return (
                        <Button
                          key={submodule}
                          variant={
                            selectedSubmodule === submodule
                              ? "primary"
                              : "secondary"
                          }
                          onClick={() => handleSubmoduleSelect(submodule)}
                          className="whitespace-nowrap m-2"
                        >
                          {submodule}
                          <Badge variant="info" className="ml-2">
                            {submoduleTestCases.length}
                          </Badge>
                        </Button>
                      );
                    })}
                </div>
                <button
                  onClick={() => {
                    const container =
                      document.getElementById("submodule-scroll");
                    if (container) container.scrollLeft += 200;
                  }}
                  className="flex-shrink-0 z-10 bg-white shadow-md rounded-full p-1 hover:bg-gray-50 ml-2"
                >
                  <ChevronRight className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Content Area - Test Cases Table */}
        <div className="flex-1 px-6 pb-6">
          <Card>
            <CardContent className="p-0">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr className="border-b border-gray-200">
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
                  {filteredTestCases.map((testCase: TestCase) => (
                    <tr key={testCase.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {testCase.id}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {testCase.description}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <button
                          onClick={() => handleViewSteps(testCase)}
                          className="text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                          title="View Steps"
                        >
                          <Eye className="w-4 h-4" />
                          <span>View</span>
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {testCase.type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(
                            testCase.severity
                          )}`}
                        >
                          {testCase.severity}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleViewTestCase(testCase)}
                            className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>

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
                  <h3 className="text-sm font-medium text-gray-500">
                    Severity
                  </h3>
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
      </div>
    );
  }

  // Main Release View page (project selection and release cards)
  return (
    <div className="max-w-6xl mx-auto py-8">
      {/* Back Button at the top right */}
      <div className="mb-4 flex justify-end">
        <Button
          variant="secondary"
          onClick={() => navigate(`/projects/${projectId}/project-management`)}
          className="flex items-center"
        >
          <ChevronLeft className="w-5 h-5 mr-2" /> Back
        </Button>
      </div>

      {/* Project Selection Panel */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            Project Selection
          </h2>
          <div className="relative flex items-center">
            <button
              onClick={() => {
                const container = document.getElementById("project-scroll");
                if (container) container.scrollLeft -= 200;
              }}
              className="flex-shrink-0 z-10 bg-white shadow-md rounded-full p-1 hover:bg-gray-50 mr-2"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div
              id="project-scroll"
              className="flex space-x-2 overflow-x-auto p-2 scroll-smooth flex-1"
              style={{
                scrollbarWidth: "none",
                msOverflowStyle: "none",
                maxWidth: "100%",
              }}
            >
              {projects.map((project) => (
                <Button
                  key={project.id}
                  variant={
                    selectedProject === project.id ? "primary" : "secondary"
                  }
                  onClick={() => handleProjectSelect(project.id)}
                  className="whitespace-nowrap"
                >
                  {project.name}
                </Button>
              ))}
            </div>
            <button
              onClick={() => {
                const container = document.getElementById("project-scroll");
                if (container) container.scrollLeft += 200;
              }}
              className="flex-shrink-0 z-10 bg-white shadow-md rounded-full p-1 hover:bg-gray-50 ml-2"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Release Cards Panel */}
      {selectedProject && (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Release Overview
            </h2>
            <Button
              onClick={() => setIsCreateReleaseModalOpen(true)}
              className="flex items-center space-x-2"
              disabled={!selectedProject}
            >
              <Plus className="w-4 h-4" />
              <span>Create Release</span>
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projectReleases.map((release) => {
              const releaseTestCases = testCases.filter(
                (tc) =>
                  tc.projectId === selectedProject &&
                  tc.releaseId === release.id
              );
              const totalTestCases = releaseTestCases.length;
              const currentProject = projects.find(
                (p) => p.id === selectedProject
              );

              return (
                <Card
                  key={release.id}
                  hover
                  className="cursor-pointer group transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
                  onClick={() => handleReleaseSelect(release.id)}
                >
                  <CardContent className="p-6">
                    {/* Header */}
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {release.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        v{release.version}
                      </p>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {release.description}
                    </p>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center space-x-2">
                        <FileText className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">Test Cases</p>
                          <p className="text-sm font-medium text-gray-900">
                            {totalTestCases}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">Release Date</p>
                          <p className="text-sm font-medium text-gray-900">
                            {release.releaseDate
                              ? new Date(
                                  release.releaseDate
                                ).toLocaleDateString()
                              : "TBD"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Project Info */}
                    {currentProject && (
                      <div className="pt-4 border-t border-gray-200">
                        <div className="flex items-center space-x-2">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span className="text-xs text-gray-500">
                            Project: {currentProject.name}
                          </span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Instructions */}
      {selectedProject && projectReleases.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-500">
              No releases found for the selected project. Please create releases
              first.
            </p>
          </CardContent>
        </Card>
      )}

      {!selectedProject && (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-500">
              Please select a project to view available releases.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Create Release Modal */}
      <Modal
        isOpen={isCreateReleaseModalOpen}
        onClose={() => {
          setIsCreateReleaseModalOpen(false);
          setReleaseFormData({
            name: "",
            version: "",
            description: "",
            releaseDate: "",
            releaseType: "",
          });
        }}
        title="Create New Release"
        size="xl"
      >
        <form onSubmit={handleCreateRelease} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Release Name"
              value={releaseFormData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              required
            />
            <Input
              label="Version"
              value={releaseFormData.version}
              onChange={(e) => handleInputChange("version", e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Release Type
            </label>
            <select
              value={releaseFormData.releaseType}
              onChange={(e) => handleInputChange("releaseType", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Select Release Type</option>
              <option value="Client Release">Client Release</option>
              <option value="Project Release">Project Release</option>
              <option value="Frontend Release">Frontend Release</option>
              <option value="QA Release">QA Release</option>
              <option value="Backend Release">Backend Release</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={releaseFormData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Release Date
            </label>
            <input
              type="date"
              value={releaseFormData.releaseDate}
              onChange={(e) => handleInputChange("releaseDate", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsCreateReleaseModalOpen(false);
                setReleaseFormData({
                  name: "",
                  version: "",
                  description: "",
                  releaseDate: "",
                  releaseType: "",
                });
              }}
            >
              Cancel
            </Button>
            <Button type="submit">Create Release</Button>
          </div>
        </form>
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
