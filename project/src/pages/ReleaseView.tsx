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
import { getModulesByProjectId } from "../api/module/getModule";
import { getTestCasesByFilter } from "../api/releasetestcase";
import { getSubmodulesByModuleId } from "../api/submodule/submoduleget";
import axios from 'axios';
const BASE_URL = import.meta.env.VITE_BASE_URL;

interface TestCase {
  id: string;
  module: string;
  subModule: string;
  description: string;
  steps: string;
  type: string;
  severity: string;
  projectId: string;
  releaseId?: string;
}

interface Module {
  id: string;
  name: string;
  submodules: string[]; // Not used, but kept for type compatibility
}

export const ReleaseView: React.FC = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const {
    projects,
    setSelectedProjectId,
    addRelease,
  } = useApp();

  // State
  const [selectedProject, setSelectedProject] = useState<string | null>(projectId || null);
  const [selectedRelease, setSelectedRelease] = useState<string | null>(null);
  const [releases, setReleases] = useState<any[]>([]);
  const [selectedModule, setSelectedModule] = useState("");
  const [projectModules, setProjectModules] = useState<Module[]>([]);
  const [filteredTestCases, setFilteredTestCases] = useState<TestCase[]>([]);
  const [loadingTestCases, setLoadingTestCases] = useState(false);
  const [testCaseError, setTestCaseError] = useState<string | null>(null);
  const [isViewStepsModalOpen, setIsViewStepsModalOpen] = useState(false);
  const [isViewTestCaseModalOpen, setIsViewTestCaseModalOpen] = useState(false);
  const [isCreateReleaseModalOpen, setIsCreateReleaseModalOpen] = useState(false);
  const [viewingTestCase, setViewingTestCase] = useState<TestCase | null>(null);
  const [releaseFormData, setReleaseFormData] = useState({
    name: "",
    version: "",
    description: "",
    releaseDate: "",
    releaseType: "",
  });
  const [releaseSearch, setReleaseSearch] = useState("");
  const [searchResults, setSearchResults] = useState<any[] | null>(null);
  const [searchError, setSearchError] = useState<string>("");
  const [isSearching, setIsSearching] = useState(false);
  const [submodules, setSubmodules] = useState<any[]>([]);
  const [selectedSubmoduleId, setSelectedSubmoduleId] = useState<string | null>(null);

  // Fetch modules when project changes
  useEffect(() => {
    if (selectedProject) {
      getModulesByProjectId(selectedProject)
        .then((res) => {
          // Map API response to Module[] as in TestCase.tsx
          const modules = (res.data || []).map((mod: any) => ({
            id: String(mod.id),
            name: mod.moduleName || mod.name,
            submodules: [], // add this to match the Module interface
          }));
          setProjectModules(modules);
        })
        .catch(() => setProjectModules([]));
    } else {
      setProjectModules([]);
    }
  }, [selectedProject]);

  // Fetch test cases when all filters are selected
  useEffect(() => {
    if (selectedProject && selectedModule && selectedSubmoduleId && selectedRelease) {
      setLoadingTestCases(true);
      setTestCaseError(null);
      getTestCasesByFilter(selectedProject, selectedModule, selectedSubmoduleId, selectedRelease)
        .then((res) => setFilteredTestCases(res.data || []))
        .catch((err) => setTestCaseError(err.message || "Failed to load test cases"))
        .finally(() => setLoadingTestCases(false));
    } else {
      setFilteredTestCases([]);
    }
  }, [selectedProject, selectedModule, selectedSubmoduleId, selectedRelease]);

  // Fetch releases for the selected project
  const getReleaseCardView = async () => {
    try {
      const response = await projectReleaseCardView(selectedProject);
      setReleases(response.data || []);
    } catch (error) {
      setReleases([]);
    }
  };
  useEffect(() => {
    getReleaseCardView();
  }, [selectedProject]);

  // Project selection
  const handleProjectSelect = (projectId: string) => {
    setSelectedProject(projectId);
    setSelectedProjectId(projectId);
    setSelectedRelease(null);
    setSelectedModule("");
    setProjectModules([]);
    setFilteredTestCases([]);
  };

  // Release selection
  const handleReleaseSelect = (releaseId: string) => {
    setSelectedRelease(releaseId);
    setSelectedModule("");
    setFilteredTestCases([]);
  };

  const handleModuleSelect = async (moduleId: string) => {
    setSelectedModule(moduleId);
    setSelectedSubmoduleId(null);
    getSubmodulesByModuleId(moduleId)
      .then((res) => setSubmodules(res.data || []))
      .catch(() => setSubmodules([]));
  };

  // UI helpers
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

  // Render
    return (
      <div className="max-w-6xl mx-auto py-8">
      {/* Project Selection Panel */}
      <ProjectSelector
        projects={projects}
        selectedProjectId={selectedProject}
        onSelect={handleProjectSelect}
        className="mb-6"
      />

      {/* Release Selection Panel */}
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
          {releases.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-gray-500">
                  No releases found for the selected project. Please create releases first.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {releases.map((release: any) => (
                <Card
                  key={release.id}
                  hover
                  className="cursor-pointer group transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
                  onClick={() => handleReleaseSelect(release.id)}
                >
                  <CardContent className="p-6">
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {release.releaseName}
                      </h3>
                      <p className="text-sm text-gray-500">
                        v{release.releaseId}
                      </p>
          </div>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {release.description}
                    </p>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center space-x-2">
                        <FileText className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">Test Cases</p>
                          <p className="text-sm font-medium text-gray-900">
                            {/* You can show test case count here if needed */}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">Release Date</p>
                          <p className="text-sm font-medium text-gray-900">
                            {release.releaseDate
                              ? new Date(release.releaseDate).toLocaleDateString()
                              : "TBD"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

          {/* Module Selection Panel */}
      {selectedRelease && (
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
                {projectModules.map((module: Module) => (
                      <Button
                        key={module.id}
                    variant={selectedModule === module.id ? "primary" : "secondary"}
                        onClick={() => handleModuleSelect(module.id)}
                        className="whitespace-nowrap m-2"
                      >
                        {module.name}
                      </Button>
                ))}
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
      )}

      {/* Submodule Selection Panel */}
      {selectedRelease && selectedModule && (
        <Card className="mb-4">
          <CardContent className="p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              Submodule Selection
            </h2>
            <div className="flex space-x-2">
              {submodules.map((submodule) => (
                <Button
                  key={submodule.subModuleId}
                  variant={selectedSubmoduleId === String(submodule.subModuleId) ? "primary" : "secondary"}
                  onClick={() => setSelectedSubmoduleId(String(submodule.subModuleId))}
                >
                  {submodule.subModuleName}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Test Cases Table */}
      {selectedRelease && selectedModule && (
          <Card>
            <CardContent className="p-0">
            {loadingTestCases ? (
              <div className="p-8 text-center">Loading test cases...</div>
            ) : testCaseError ? (
              <div className="p-8 text-center text-red-500">{testCaseError}</div>
            ) : (
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{testCase.id}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{testCase.description}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          <button
                          onClick={() => {
                            setViewingTestCase(testCase);
                            setIsViewStepsModalOpen(true);
                          }}
                            className="text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                            title="View Steps"
                          >
                            <Eye className="w-4 h-4" />
                            <span>View</span>
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{testCase.type}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(testCase.severity)}`}>
                            {testCase.severity}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex space-x-2">
                            <button
                            onClick={() => {
                              setViewingTestCase(testCase);
                              setIsViewTestCaseModalOpen(true);
                            }}
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
            )}
            </CardContent>
          </Card>
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
        <form onSubmit={async (e) => {
          e.preventDefault();
          if (!selectedProject) return;
          const payload = {
            releaseName: releaseFormData.name,
            releaseDate: releaseFormData.releaseDate,
            releaseType: releaseFormData.releaseType,
            projectId: Number(selectedProject),
            description: "Description: ",
            releaseStatus: releaseFormData.releaseType,
          };
          try {
            const response = await createRelease(payload);
            if (response.status === "success" && response.statusCode === 2000) {
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
        }} className="space-y-4">
          <Input
            label="Release Name"
            value={releaseFormData.name}
            onChange={(e) => setReleaseFormData((prev) => ({ ...prev, name: e.target.value }))}
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Release Type
            </label>
            <select
              value={releaseFormData.releaseType}
              onChange={(e) => setReleaseFormData((prev) => ({ ...prev, releaseType: e.target.value }))}
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
              Release Date
            </label>
            <input
              type="date"
              value={releaseFormData.releaseDate}
              onChange={(e) => setReleaseFormData((prev) => ({ ...prev, releaseDate: e.target.value }))}
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
            <Button type="submit">Submit</Button>
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
        <QuickAddTestCase selectedProjectId={selectedProject || ""} />
        <QuickAddDefect />
      </div>
    </div>
  );
};