import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getModulesByProjectId } from "../api/module/getModule";
import { getSubmodulesByModuleId } from "../api/submodule/submoduleget";
import { getTestCasesByFilter } from "../api/releasetestcase";
import { getSeverities } from "../api/severity";
import { getDefectTypes } from "../api/defectType";
import { Modal } from "../components/ui/Modal";
import QuickAddTestCase from "./QuickAddTestCase";
import QuickAddDefect from "./QuickAddDefect";

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
  assignedBy?: string;
}

interface Module {
  id: string;
  name: string;
}

export const ReleaseDetails: React.FC = () => {
  const { projectId, releaseId } = useParams();
  const navigate = useNavigate();
  const [modules, setModules] = useState<Module[]>([]);
  const [selectedModule, setSelectedModule] = useState<string>("");
  const [submodules, setSubmodules] = useState<any[]>([]);
  const [selectedSubmoduleId, setSelectedSubmoduleId] = useState<string | null>(null);
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [severities, setSeverities] = useState<{ id: number; name: string; color: string }[]>([]);
  const [defectTypes, setDefectTypes] = useState<{ id: number; defectTypeName: string }[]>([]);
  const [isViewStepsModalOpen, setIsViewStepsModalOpen] = useState(false);
  const [viewingTestCase, setViewingTestCase] = useState<TestCase | null>(null);

  useEffect(() => {
    if (projectId) {
      getModulesByProjectId(projectId)
        .then((res) => {
          const modules = (res.data || []).map((mod: any) => ({
            id: String(mod.id),
            name: mod.moduleName || mod.name,
          }));
          setModules(modules);
        })
        .catch(() => setModules([]));
    }
  }, [projectId]);

  useEffect(() => {
    getSeverities().then(res => setSeverities(res.data));
    getDefectTypes().then(res => setDefectTypes(res.data));
  }, []);

  const handleModuleSelect = (moduleId: string) => {
    setSelectedModule(moduleId);
    setSelectedSubmoduleId(null);
    setTestCases([]);
    getSubmodulesByModuleId(moduleId)
      .then((res) => setSubmodules(res.data || []))
      .catch(() => setSubmodules([]));
  };

  const handleSubmoduleSelect = (submoduleId: string) => {
    setSelectedSubmoduleId(submoduleId);
    setTestCases([]);
    if (projectId && selectedModule && submoduleId && releaseId) {
      setLoading(true);
      setError(null);
      getTestCasesByFilter(projectId, selectedModule, submoduleId, releaseId)
        .then((res) => {
          const mappedTestCases = (res.data || []).map((tc: any) => ({
            ...tc,
            severity: (severities.find(s => s.id === tc.severityId)?.name || "") as string,
            type: (defectTypes.find(dt => dt.id === tc.defectTypeId)?.defectTypeName || "") as string,
          }));
          setTestCases(mappedTestCases);
        })
        .catch((err) => setError(err.message || "Failed to load test cases"))
        .finally(() => setLoading(false));
    }
  };

  const getSeverityColor = (severity: string) => {
    if (!severity) return "bg-gray-100 text-gray-800";
    switch (severity.toLowerCase()) {
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

  return (
    <div className="max-w-6xl mx-auto py-8">
      <Button variant="secondary" onClick={() => navigate(-1)} className="mb-4">&larr; Back to Releases</Button>
      <h1 className="text-2xl font-bold mb-6">Release Details</h1>
      {/* Module Selection */}
      <Card className="mb-4">
        <CardContent className="p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Module Selection</h2>
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
              {modules.map((module: Module) => (
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
      {/* Submodule Selection */}
      {selectedModule && (
        <Card className="mb-4">
          <CardContent className="p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Submodule Selection</h2>
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
                className="flex flex-nowrap gap-2 overflow-x-auto scrollbar-hide scroll-smooth flex-1"
                style={{ msOverflowStyle: "none", scrollbarWidth: "none" }}
              >
                {submodules.map((submodule) => (
                  <Button
                    key={submodule.subModuleId}
                    variant={selectedSubmoduleId === String(submodule.subModuleId) ? "primary" : "secondary"}
                    onClick={() => handleSubmoduleSelect(String(submodule.subModuleId))}
                    className="min-w-max whitespace-nowrap m-2"
                  >
                    {submodule.subModuleName}
                  </Button>
                ))}
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
      )}
      {/* Test Cases Table */}
      {selectedModule && selectedSubmoduleId && (
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-8 text-center">Loading test cases...</div>
            ) : error ? (
              <div className="p-8 text-center text-red-500">{error}</div>
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned By</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {testCases.map((testCase: TestCase) => (
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
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          <span>View</span>
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{testCase.type || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(testCase.severity || 'low')}`}>
                          {testCase.severity || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{testCase.assignedBy || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      )}
      {isViewStepsModalOpen && (
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
              <p className="text-gray-700 whitespace-pre-wrap break-words">
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
      )}
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
        <QuickAddTestCase selectedProjectId={projectId || ""} />
        <QuickAddDefect />
      </div>
    </div>
  );
};

export default ReleaseDetails; 