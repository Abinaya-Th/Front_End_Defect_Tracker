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
import { ProjectSelector } from "../components/ui/ProjectSelector";
import { projectReleaseCardView } from "../api/releaseView/ProjectReleaseCardView";
import { createRelease } from "../api/createRelease/CreateRelease";
import { searchRelease } from "../api/searchRelease/SearchRelease";

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

export const ReleaseView: React.FC = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const {
    projects,
    releases,
    testCases,
    setSelectedProjectId,
    addRelease,
    modulesByProject,
  } = useApp();
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
  const [releaseSearch, setReleaseSearch] = useState("");
  const [releaseCardView, setReleaseCardView] = useState<any>(null);
  const [searchResults, setSearchResults] = useState<any[] | null>(null);
  const [searchError, setSearchError] = useState<string>("");
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (selectedProject) {
      setSelectedProjectId(selectedProject);
    }
  }, [selectedProject, setSelectedProjectId]);

  const getReleaseCardView =  async() =>{

      try {
          const response = await projectReleaseCardView(selectedProject);
          setReleaseCardView(response.data)
      } catch (error) {
          console.error("Error fetching release card view:", error);
      }
  }
  useEffect(() => {
      getReleaseCardView();
  }, [selectedProject]);

  console.log(releaseCardView);
  

  // Filter releases for selected project and search
  const projectReleases = releases.filter(
    (r) => r.projectId === selectedProject &&
      (!releaseSearch || r.name.toLowerCase().includes(releaseSearch.toLowerCase()))
  );

  // Get modules for selected project from context
  const projectModules = selectedProject
    ? modulesByProject[selectedProject] || []
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
  const handleCreateRelease = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedProject) return;

    // Prepare payload for API
    const payload = {
      releaseName: releaseFormData.name,
      releaseDate: releaseFormData.releaseDate, // YYYY-MM-DD
      releaseType: releaseFormData.releaseType,
      projectId: selectedProject,
    };

    try {
      const response = await createRelease(payload);
      if (response.status === "success" && response.statusCode === 2000) {
        // Optionally, you can refresh the release list or call getReleaseCardView();
        getReleaseCardView();
        setIsCreateReleaseModalOpen(false);
        setReleaseFormData({
          name: "",
          version: "",
          description: "",
          releaseDate: "",
          releaseType: "",
        });
        alert("Release created successfully");
      } else {
        alert(response.message || "Failed to create release");
      }
    } catch (error: any) {
      alert(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to create release"
      );
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setReleaseFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Handle release search
  const handleReleaseSearch = async (searchValue: string) => {
    setReleaseSearch(searchValue);
    setIsSearching(true);
    setSearchError("");
    if (!searchValue && !selectedProject) {
      setSearchResults(null);
      setIsSearching(false);
      return;
    }
    try {
      const params: any = {};
      if (searchValue) params.releaseName = searchValue;
      if (selectedProject) params.projectId = selectedProject;
      const response = await searchRelease(params);
      if (response.status === "success" && response.statusCode === 2000) {
        setSearchResults(response.data);
      } else {
        setSearchResults([]);
        setSearchError(response.message || "No results found");
      }
    } catch (error: any) {
      setSearchResults([]);
      setSearchError(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to search releases"
      );
    } finally {
      setIsSearching(false);
    }
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
                  {(() => {
                    const submodules =
                      projectModules.find((m) => m.name === selectedModule)
                        ?.submodules || [];
                    if (submodules.length === 0) {
                      return (
                        <span className="italic text-gray-400">
                          No submodules for this module
                        </span>
                      );
                    }
                    return submodules.map((submodule, idx) => {
                      // Strictly check for valid id and name
                      const isValidId =
                        typeof submodule.id === "string" ||
                        typeof submodule.id === "number";
                      const isValidName =
                        typeof submodule.name === "string" &&
                        submodule.name.length > 0;
                      if (!isValidId || !isValidName) {
                        // Optionally log a warning for debugging
                        if (process.env.NODE_ENV === "development") {
                          // eslint-disable-next-line no-console
                          console.warn(
                            "Skipping invalid submodule object:",
                            submodule
                          );
                        }
                        return null;
                      }
                      const submoduleId = submodule.id;
                      const submoduleName = submodule.name;
                      const submoduleTestCases = filteredTestCases.filter(
                        (tc) =>
                          tc.module === selectedModule &&
                          tc.subModule === submoduleName
                      );
                      return (
                        <Button
                          key={String(submoduleId)}
                          variant={
                            selectedSubmodule === submoduleName
                              ? "primary"
                              : "secondary"
                          }
                          onClick={() => handleSubmoduleSelect(submoduleName)}
                          className="whitespace-nowrap m-2"
                        >
                          {submoduleName}
                          <Badge variant="info" className="ml-2">
                            {submoduleTestCases.length}
                          </Badge>
                        </Button>
                      );
                    });
                  })()}
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
          <ChevronLeft className="w-5 h-4 mr-2" /> Back
        </Button>
      </div>

      {/* Project Selection Panel */}
      <ProjectSelector
        projects={projects}
        selectedProjectId={selectedProject}
        onSelect={handleProjectSelect}
        className="mb-6"
      />

      {/* Release Search Bar */}
      {selectedProject && (
        <div className="mb-4 flex items-center justify-between">
          <input
            type="text"
            placeholder="Search releases by name..."
            value={releaseSearch}
            onChange={e => handleReleaseSearch(e.target.value)}
            className="w-full md:w-1/2 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            style={{ minWidth: 220 }}
          />
        </div>
      )}

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
          {isSearching && (
            <div className="text-center text-gray-500 mb-4">Searching...</div>
          )}
          {searchError && (
            <div className="text-center text-red-500 mb-4">{searchError}</div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(searchResults !== null ? searchResults : projectReleases).map((release) => {
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
                        {release.name || release.releaseName}
                      </h3>
                      <p className="text-sm text-gray-500">
                        v{release.version || release.releaseId}
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
