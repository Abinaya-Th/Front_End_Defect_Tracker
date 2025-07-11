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
import axios from 'axios';
import { projectReleaseCardView } from "../api/releaseView/ProjectReleaseCardView";
import { getSubmodulesByModuleId, Submodule } from "../api/submodule/submoduleget";
import { getTestCasesByProjectAndSubmodule } from "../api/testCase/testCaseApi";
import { getSeverities } from "../api/severity";
import { getDefectTypes } from "../api/defectType";
import { TestCase as TestCaseType } from "../types/index";
import { allocateTestCaseToRelease, allocateTestCaseToMultipleReleases, bulkAllocateTestCasesToReleases, ReleaseTestCaseMappingRequest } from "../api/releasetestcase";

const BASE_URL = import.meta.env.VITE_BASE_URL;
//integration

const TABS = [
  { key: "release", label: "Release Allocation" },
  { key: "qa", label: "QA Allocation" },
];

// --- MOCK DATA SECTION (for modules, testcases, QA, releases) ---

// Mock Modules
// const mockModules = [ ... ];

// Mock QA (engineers/teams)
// const mockQA = [ ... ];

// Mock Releases
// const mockReleases = [ ... ];

// --- END MOCK DATA SECTION ---

// Helper: Use mock data if API/server is not working
export const Allocation: React.FC = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const {
    projects,
    releases,
    employees,
    testCases,
    modulesByProject,
  } = useApp();
  const [activeTab, setActiveTab] = useState<"release" | "qa">("release");
  const [selectedReleaseIds, setSelectedReleaseIds] = useState<string[]>([]);
  const [selectedIds, setSelectedIds]=useState<number[]>([]);
  const [selectedModule, setSelectedModule] = useState("");
  const [selectedQA, setSelectedQA] = useState<string | null>(null);
  const [selectedTestCases, setSelectedTestCases] = useState<string[]>([]);
  const [isViewStepsModalOpen, setIsViewStepsModalOpen] = useState(false);
  const [isViewTestCaseModalOpen, setIsViewTestCaseModalOpen] = useState(false);
  const [viewingTestCase, setViewingTestCase] = useState<any>(null);
  const [bulkModuleSelect, setBulkModuleSelect] = useState(false);
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [selectedSubmodule, setSelectedSubmodule] = useState<string>("");
  const [bulkSubmoduleSelect, setBulkSubmoduleSelect] = useState<boolean>(false);
  const [selectedSubmodules, setSelectedSubmodules] = useState<string[]>([]);
  const [submodules, setSubmodules] = useState<Submodule[]>([]);
  const [submoduleError, setSubmoduleError] = useState<string>("");
  const [apiRelease, setApiRelease] = useState<any>(null);
  const [loadingRelease, setLoadingRelease] = useState(false);
  const [releaseError, setReleaseError] = useState<string | null>(null);
  const [projectRelease, setProjectRelease] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [qaAllocatedTestCases, setQaAllocatedTestCases] = useState<{ [releaseId: string]: string[] }>({});
  const [qaAllocations, setQaAllocations] = useState<{[releaseId: string]: {[qaId: string]: string[]}}>( {} );
  const [selectedTestCasesForQA, setSelectedTestCasesForQA] = useState<{[releaseId: string]: string[]}>({});
  const [loadingQAAllocations, setLoadingQAAllocations] = useState(false);
  const [selectedReleaseForQA, setSelectedReleaseForQA] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string>(String(projectId ?? ''));
  const [loadingReleases, setLoadingReleases] = useState(false);
  const [allocatedTestCases, setAllocatedTestCases] = useState<TestCaseType[]>([]);
  const [severities, setSeverities] = useState<{ id: number; name: string; color: string }[]>([]);
  const [defectTypes, setDefectTypes] = useState<{ id: number; defectTypeName: string }[]>([]);
  const [allocationLoading, setAllocationLoading] = useState(false);
  const [allocationSuccess, setAllocationSuccess] = useState<string | null>(null);
  const [allocationError, setAllocationError] = useState<string | null>(null);
  const [allocationProgress, setAllocationProgress] = useState<{ current: number; total: number } | null>(null);
  const [allocationMode, setAllocationMode] = useState<"one-to-one" | "one-to-many" | "bulk">("one-to-one");

  React.useEffect(() => {
    if (projectId) {
      setSelectedProjectId(projectId);
      setSelectedProject(projectId);
    }
  }, [projectId]);

  const getReleaseCardView = async () => {
    if (!selectedProject) return;
    
    setLoadingReleases(true);
    try {
      const response = await projectReleaseCardView(selectedProject);
      setProjectRelease(response.data || []);
    } catch (error) {
      console.error("Error fetching release card view:", error);
      setProjectRelease([]);
    } finally {
      setLoadingReleases(false);
    }
  };

  const loadExistingQAAllocations = async () => {
    if (!selectedProject || !effectiveProjectRelease.length) return;
    setLoadingQAAllocations(true);
    try {
      // Since API integration is removed, use only mock data or skip loading from API
      // You may want to reset or keep the current state as is
      // setQaAllocations({});
      // setQaAllocatedTestCases({});
    } catch (error) {
      console.error("Error loading existing QA allocations:", error);
    } finally {
      setLoadingQAAllocations(false);
    }
  };

  // Fetch releases when selectedProject changes
  useEffect(() => {
    if (selectedProject) {
      getReleaseCardView();
    }
  }, [selectedProject]);

  // Fetch severities and defect types on mount
  useEffect(() => {
    getSeverities().then(res => setSeverities(res.data));
    getDefectTypes().then(res => setDefectTypes(res.data));
  }, []);

  // Refetch test cases when severities or defect types change to ensure proper mapping
  useEffect(() => {
    if (selectedProjectId && selectedSubmodule && (severities.length > 0 || defectTypes.length > 0)) {
      handleSelectSubModule(selectedSubmodule);
    }
  }, [severities, defectTypes]);

  // Clear allocation messages when tab changes
  useEffect(() => {
    setAllocationSuccess(null);
    setAllocationError(null);
  }, [activeTab]);



  // Filter releases for this project
  const projectReleases = releases.filter((r) => r.projectId === projectId);
  // Filter test cases for this project
  const projectTestCases = testCases.filter((tc) => tc.projectId === projectId);

  // Get modules for selected project from context
  const projectModules = projectId ? modulesByProject[projectId] || [] : [];

  // Use mock data if API/server is not working
  const effectiveProjectRelease = projectRelease;
  const effectiveTestCases = allocatedTestCases.length > 0 ? allocatedTestCases : projectTestCases;
  const effectiveModules = projectModules;

  // Load existing QA allocations when releases are loaded
  useEffect(() => {
    if (effectiveProjectRelease.length > 0) {
      loadExistingQAAllocations();
    }
  }, [effectiveProjectRelease, selectedProject]);

  // Fetch submodules when selectedModule changes
  useEffect(() => {
    if (!selectedModule) {
      setSubmodules([]);
      setSubmoduleError("");
      return;
    }
    // Find the module ID from effectiveModules
    const moduleObj = effectiveModules.find((m: any) => m.name === selectedModule);
    if (moduleObj && moduleObj.id) {
      getSubmodulesByModuleId(moduleObj.id)
        .then((res) => {
          if (res.status !== 'success' || !Array.isArray(res.data) || res.data.length === 0) {
            setSubmodules([]);
            setSubmoduleError(res.message || "No submodules found for this module.");
            return;
          }
          // Normalize submodule name property for UI
          const normalized = (res.data || []).map((sm: any) => ({
            ...sm,
            name: sm.name || sm.subModuleName || sm.submoduleName || "Unnamed"
          }));
          setSubmodules(normalized);
          setSubmoduleError("");
        })
        .catch((err) => {
          setSubmodules([]);
          setSubmoduleError("Failed to fetch submodules. Please try again.");
        });
    } else {
      setSubmodules([]);
      setSubmoduleError("Module not found.");
    }
  }, [selectedModule, effectiveModules]);

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
          ...effectiveTestCases
            .filter((tc: any) => selectedModules.includes(tc.module))
            .map((tc: any) => tc.id),
        ];
      } else if (bulkSubmoduleSelect && selectedSubmodules.length > 0) {
        ids = [
          ...ids,
          ...effectiveTestCases
            .filter((tc: any) => selectedSubmodules.includes(tc.subModule))
            .map((tc: any) => tc.id),
        ];
      }
      setSelectedTestCases(Array.from(new Set(ids)));
    }
  }, [
    bulkModuleSelect,
    bulkSubmoduleSelect,
    selectedModules,
    selectedSubmodules,
    effectiveTestCases,
    activeTab,
    selectedReleaseIds,
  ]);
  // useEffect(() => {
  //   if (!selectedProjectId || selectedSubmoduleId === null) return;
  //   getTestCasesByProjectAndSubmodule(selectedProjectId, selectedSubmoduleId).then((data) => {
  //     // Map moduleId/subModuleId to names for display
  //     const moduleMap = Object.fromEntries(projectModules.map((m: any) => [m.id, m.name]));
  //     const submoduleMap = Object.fromEntries(projectModules.flatMap((m: any) => m.submodules.map((sm: any) => [sm.id, sm.name])));
  //     setTestCases(
  //       (data as any[]).map((tc: any) => ({
  //         ...tc,
  //         module: moduleMap[tc.moduleId] || tc.moduleId,
  //         subModule: submoduleMap[tc.subModuleId] || tc.subModuleId,
  //         severity: (severities && severities.find(s => s.id === tc.severityId)?.name || "") as TestCaseType['severity'],
  //         type: (defectTypes && defectTypes.find(dt => dt.id === tc.defectTypeId)?.defectTypeName || "") as TestCaseType['type'],
  //       })) as TestCaseType[]
  //     );
  //   });
  // }, [selectedProjectId, selectedSubmoduleId, projectModules, severities, defectTypes]);
  // --- Filtered test cases for table ---
  let filteredTestCases = effectiveTestCases;
  if (activeTab === "qa") {
    if (selectedReleaseForQA) {
      // Only show test cases allocated to this release and not yet assigned to any QA
      const allocatedTestCaseIds = qaAllocatedTestCases[selectedReleaseForQA] || [];
      const alreadyAllocatedTestCaseIds = Object.values(qaAllocations[selectedReleaseForQA] || {}).flat();
      const unallocatedTestCaseIds = allocatedTestCaseIds.filter(
        id => !alreadyAllocatedTestCaseIds.includes(id)
      );
      
      // Get the full test case objects for the allocated test cases
      const allocatedTestCases = effectiveTestCases.filter((tc: any) => allocatedTestCaseIds.includes(tc.id));
      filteredTestCases = allocatedTestCases.filter((tc: any) => unallocatedTestCaseIds.includes(tc.id));
    } else {
      filteredTestCases = [];
    }
  } else if (
    activeTab === "release" &&
    selectedReleaseIds.length > 0 &&
    (bulkModuleSelect || bulkSubmoduleSelect)
  ) {
    let ids: Set<string> = new Set();
    if (bulkModuleSelect && selectedModules.length > 0) {
      effectiveTestCases.forEach((tc: any) => {
        if (selectedModules.includes(tc.module)) ids.add(tc.id);
      });
    }
    if (bulkSubmoduleSelect && selectedSubmodules.length > 0) {
      effectiveTestCases.forEach((tc: any) => {
        if (selectedSubmodules.includes(tc.subModule)) ids.add(tc.id);
      });
    }
    filteredTestCases = effectiveTestCases.filter((tc: any) => ids.has(tc.id));
  } else if (selectedSubmodule) {
    // If a submodule is selected, use allocatedTestCases directly
    filteredTestCases = allocatedTestCases;
  } else if (selectedModule) {
    // If only a module is selected, filter by module
    filteredTestCases = effectiveTestCases.filter(
      (tc: any) => tc.module === selectedModule
    );
  }

  // Helper functions for QA allocation (per release)
  const getAllocatedTestCasesForQA = (qaId: string) => {
    if (!selectedReleaseForQA) return [];
    return qaAllocations[selectedReleaseForQA]?.[qaId] || [];
  };

  const isTestCaseAllocated = (testCaseId: string) => {
    if (!selectedReleaseForQA) return false;
    return Object.values(qaAllocations[selectedReleaseForQA] || {}).some(allocations => 
      allocations.includes(testCaseId)
    );
  };

  const allocateTestCasesToQA = (qaId: string, testCaseIds: string[]) => {
    if (!selectedReleaseForQA) return;
    setQaAllocations(prev => ({
      ...prev,
      [selectedReleaseForQA]: {
        ...(prev[selectedReleaseForQA] || {}),
        [qaId]: [...(prev[selectedReleaseForQA]?.[qaId] || []), ...testCaseIds]
      }
    }));
    setSelectedTestCasesForQA(prev => ({
      ...prev,
      [selectedReleaseForQA]: []
    }));
  };

  const removeAllocationFromQA = (qaId: string, testCaseId: string) => {
    if (!selectedReleaseForQA) return;
    setQaAllocations(prev => ({
      ...prev,
      [selectedReleaseForQA]: {
        ...(prev[selectedReleaseForQA] || {}),
        [qaId]: (prev[selectedReleaseForQA]?.[qaId] || []).filter(id => id !== testCaseId)
      }
    }));
  };

  // Project selection handler
  const handleProjectSelect = (id: string) => {
    
    setSelectedProjectId(id);
    setSelectedProject(id);
    setSelectedModule("");
    setSelectedSubmodule("");
    setSelectedTestCases([]);
    setAllocatedTestCases([]);
  };


  // --- UI Panels ---
  const ProjectSelectionPanel = () => (
    <ProjectSelector
      projects={projects}
      selectedProjectId={selectedProjectId || null}
      onSelect={
        (id:string)=>{ 
          setSelectedProjectId(id),
          handleProjectSelect(id)
      }
      
    }
      className="mb-4"
    />
  );
 
  // In ReleaseCardsPanel, on Allocate:
  // For each selected release, store the selected test cases
  const handleAllocate = async () => {
    if (selectedReleaseIds.length === 0 || selectedTestCases.length === 0) {
      setAllocationError("Please select at least one release and test case.");
      return;
    }

    setAllocationLoading(true);
    setAllocationError(null);
    setAllocationSuccess(null);
    setAllocationProgress(null);

    try {
      if (allocationMode === "bulk") {
        setAllocationProgress({ current: 0, total: 1 });
        
        const payload: ReleaseTestCaseMappingRequest[] = [];
        selectedTestCases.forEach((testCaseId:any) => {
          selectedIds.forEach((releaseId:any) => {
            payload.push({ testCaseId, releaseId });
          });
        });
        try {
          const response = await bulkAllocateTestCasesToReleases(payload);
          if (response.status === "success") {
            setAllocationSuccess(response.message || "Success");
          } else {
            setAllocationError(response.message || "Failed");
          }
          setAllocationProgress({ current: 1, total: 1 });
        } catch (allocationError: any) {
          setAllocationError(allocationError?.response?.data?.message || allocationError?.message || "Bulk allocation failed.");
          setAllocationProgress({ current: 1, total: 1 });
        }
      } else if (allocationMode === "one-to-many") {
        const totalAllocations = selectedTestCases.length;
        let completedAllocations = 0;
        let firstMessage: string | null = null;
        let firstIsSuccess = false;
        for (const testCaseId of selectedTestCases) {
          try {
            const response = await allocateTestCaseToMultipleReleases(testCaseId, selectedIds);
            if (!firstMessage) {
              if (
                (typeof response.status === 'string' && response.status.toLowerCase() === "success") ||
                (typeof response.message === 'string' && response.message.toLowerCase().includes("allocated to"))
              ) {
                firstMessage = response.message || "Test case(s) successfully allocated to selected releases!";
                firstIsSuccess = true;
              } else {
                firstMessage = response.message || "Failed";
                firstIsSuccess = false;
              }
            }
          } catch (allocationError: any) {
            if (!firstMessage) {
              firstMessage = allocationError?.response?.data?.message || allocationError?.message || "Failed";
              firstIsSuccess = false;
            }
          }
          completedAllocations++;
          setAllocationProgress({ current: completedAllocations, total: totalAllocations });
        }
        if (firstMessage) {
          if (firstIsSuccess) {
            setAllocationSuccess(firstMessage);
            setAllocationError(null);
          } else {
            setAllocationError(firstMessage);
            setAllocationSuccess(null);
          }
        }
      } else {
        const totalAllocations = selectedReleaseIds.length * selectedTestCases.length;
        let completedAllocations = 0;
        let firstMessage: string | null = null;
        let firstIsSuccess = false;
        
        for (const releaseId of selectedIds) {
          for (const testCaseId of selectedTestCases) {
           
            try {
              const response = await allocateTestCaseToRelease(releaseId, Number(testCaseId));
              if (!firstMessage) {
                if (response.status === "success") {
                  firstMessage = response.message || "Success";
                  firstIsSuccess = true;
                } else {
                  firstMessage = response.message || "Failed";
                  firstIsSuccess = false;
                }
              }
            } catch (allocationError: any) {
              if (!firstMessage) {
                firstMessage = allocationError?.response?.data?.message || allocationError?.message || "Failed";
                firstIsSuccess = false;
              }
            }
            completedAllocations++;
            setAllocationProgress({ current: completedAllocations, total: totalAllocations });
          }
        }
        if (firstMessage) {
          if (firstIsSuccess) setAllocationSuccess(firstMessage);
          else setAllocationError(firstMessage);
        }
      }
      setQaAllocatedTestCases(prev => {
        const updated = { ...prev };
        selectedReleaseIds.forEach(releaseId => {
          updated[releaseId] = [...selectedTestCases];
        });
        return updated;
      });
      setTimeout(() => {
        setSelectedTestCases([]);
        setSelectedReleaseIds([]);
        setSelectedIds([])
        setActiveTab("qa");
        setAllocationSuccess(null);
        setAllocationProgress(null);
      }, 2000);
    } catch (error: any) {
      let errorMessage = error.response?.data?.message || error.message || "Failed to allocate test cases to releases. Please try again.";
      setAllocationError(errorMessage);
    } finally {
      setAllocationLoading(false);
    }
  };
  const handleSelectSubModule = (selectedSubmoduleId: string) => {
   
    setSelectedSubmodule(selectedSubmoduleId);
    setSelectedTestCases([]);
    
    getTestCasesByProjectAndSubmodule(selectedProjectId, selectedSubmoduleId)
      .then((data) => {
        // Map moduleId/subModuleId to names for display
        const moduleMap = Object.fromEntries(effectiveModules.map((m: any) => [m.id, m.name]));
        const submoduleMap = Object.fromEntries(effectiveModules.flatMap((m: any) => m.submodules.map((sm: any) => [sm.id, sm.name])));
        
        setAllocatedTestCases(
          (data as any[]).map((tc: any) => ({
            ...tc,
            module: moduleMap[tc.moduleId] || tc.moduleId,
            subModule: submoduleMap[tc.subModuleId] || tc.subModuleId,
            severity: (severities && severities.find(s => s.id === tc.severityId)?.name || "") as TestCaseType['severity'],
            type: (defectTypes && defectTypes.find(dt => dt.id === tc.defectTypeId)?.defectTypeName || "") as TestCaseType['type'],
          })) as TestCaseType[]
        );
      })
      .catch((error) => {
        console.error("Error fetching test cases:", error);
        setAllocatedTestCases([]);
      });
  };

  const ReleaseCardsPanel = () => (
    <div className="mb-4">
      <div className="flex space-x-2 overflow-x-auto">
        {effectiveProjectRelease.map((release: any) => {
          const releaseId = release.releaseId 
          const ids= release.id
          const isSelected = selectedReleaseIds.includes(releaseId);
          return (
            <div
              key={releaseId}
              className={`min-w-[160px] px-4 py-2 rounded-md border text-left transition-all duration-200 focus:outline-none text-sm font-medium shadow-sm flex flex-col items-start relative bg-white
                ${
                  isSelected
                    ? "border-blue-500 hover:border-blue-500 hover:bg-blue-50 hover:shadow-md hover:ring-1 hover:ring-blue-300"
                    : "border-gray-200 hover:border-blue-500 hover:bg-blue-50 hover:shadow-md hover:ring-1 hover:ring-blue-300"
                }`}
              style={{
                boxShadow: isSelected ? "0 0 0 2px #3b82f6" : undefined,
              }}
            >
              <div className="truncate font-semibold mb-1">{release.releaseName || release.name}</div>
              <div className="text-xs text-gray-500 mb-2">Version: {release.version}</div>
              <Button
                size="sm"
                variant={isSelected ? "primary" : "secondary"}
                className="w-full"
                onClick={() => {
                  if (allocationMode === "one-to-one") {
                    setSelectedReleaseIds(isSelected ? [] : [releaseId]);
                    setSelectedIds(isSelected?[]:[ids])
                  } else {
                    setSelectedReleaseIds((prev) =>
                      isSelected ? prev.filter((id) => id !== id) : [...prev, releaseId]
                    );
                    setSelectedIds((prev) =>
                      isSelected ? prev.filter((id) => id !== id) : [...prev, ids]
                    );
                  }
                }}
                disabled={allocationMode === "one-to-one" && !isSelected && selectedReleaseIds.length >= 1}
              >
                {isSelected ? "Selected" : "Select"}
              </Button>
            </div>
          );
        })}
      </div>
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
            {effectiveModules.map((module: any) => {
              const moduleTestCases = effectiveTestCases.filter(
                (tc: any) => tc.module === module.name
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
                      setAllocatedTestCases([]);
                    }
                  }}
                  className={`whitespace-nowrap m-2 ${isSelected ? " ring-2 ring-blue-400 border-blue-500" : ""
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
          {submoduleError && (
            <div className="mb-2 text-red-600 text-sm">{submoduleError}</div>
          )}
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
              {submodules.map((submodule: any) => {
                // Only use bulk selection logic if bulkSubmoduleSelect is true
                const isSelected = bulkSubmoduleSelect
                  ? selectedSubmodules.includes(String(submodule.subModuleId))
                  : selectedSubmodule === String(submodule.subModuleId);
                return (
                  <Button
                    key={submodule.subModuleId}
                    variant={isSelected ? "primary" : "secondary"}
                    onClick={() => {
                      if (bulkSubmoduleSelect) {
                        setSelectedSubmodules((prev) =>
                          prev.includes(String(submodule.subModuleId))
                            ? prev.filter((s) => s !== String(submodule.subModuleId))
                            : [...prev, String(submodule.subModuleId)]
                        );
                      } else {
                        handleSelectSubModule(String(submodule.subModuleId));
                        setSelectedSubmodule(String(submodule.subModuleId));
                      }
                    }}
                    className={`whitespace-nowrap m-2 ${isSelected ? " ring-2 ring-blue-400 border-blue-500" : ""}`}
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
    if (activeTab === "qa") {
      if (!selectedReleaseForQA) return;
      if (checked) {
        setSelectedTestCasesForQA(prev => ({
          ...prev,
          [selectedReleaseForQA]: filteredTestCases.map((tc: any) => tc.id)
        }));
      } else {
        setSelectedTestCasesForQA(prev => ({
          ...prev,
          [selectedReleaseForQA]: []
        }));
      }
    } else {
      if (checked) {
        setSelectedTestCases(filteredTestCases.map((tc: any) => tc.id));
      } else {
        setSelectedTestCases([]);
      }
    }
  };
  
  const handleSelectTestCase = (testCaseId: string, checked: boolean) => {
    if (activeTab === "qa") {
      if (!selectedReleaseForQA) return;
      if (checked) {
        setSelectedTestCasesForQA(prev => ({
          ...prev,
          [selectedReleaseForQA]: [...(prev[selectedReleaseForQA] || []), testCaseId]
        }));
      } else {
        setSelectedTestCasesForQA(prev => ({
          ...prev,
          [selectedReleaseForQA]: (prev[selectedReleaseForQA] || []).filter((id) => id !== testCaseId)
        }));
      }
    } else {
      if (checked) {
        setSelectedTestCases([...selectedTestCases, testCaseId]);
      } else {
        setSelectedTestCases(selectedTestCases.filter((id) => id !== testCaseId));
      }
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
                    activeTab === "qa" 
                      ? (selectedReleaseForQA ? ((selectedTestCasesForQA[selectedReleaseForQA]?.length ?? 0) === filteredTestCases.length && filteredTestCases.length > 0) : false)
                      : selectedTestCases.length === filteredTestCases.length && filteredTestCases.length > 0
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
            {allocatedTestCases.map((tc: any) => (
              <tr key={tc.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={
                      activeTab === "qa" 
                        ? (selectedReleaseForQA ? (selectedTestCasesForQA[selectedReleaseForQA]?.includes(tc.id) ?? false) : false)
                        : selectedTestCases.includes(tc.id)
                    }
                    disabled={
                      (allocationMode === "one-to-one" && !selectedTestCases.includes(tc.id) && selectedTestCases.length >= 1) ||
                      (allocationMode === "one-to-many" && !selectedTestCases.includes(tc.id) && selectedTestCases.length >= 1)
                    }
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

  // Only show releases that have test cases allocated for QA
  const releasesForQAAllocation = effectiveProjectRelease.filter(
    (release: any) => {
      const releaseId = release.releaseId || release.id;
      return qaAllocatedTestCases[releaseId] && qaAllocatedTestCases[releaseId].length > 0;
    }
  );

  // --- QA Allocation Panel ---
  const QASelectionPanel = () => {
    // Only one release can be selected for QA allocation at a time
    let allocatedRelease: any = null;
    if (selectedReleaseForQA) {
      allocatedRelease = effectiveProjectRelease && effectiveProjectRelease.find((release: any) => 
        (release.releaseId || release.id) === selectedReleaseForQA
      );
    }

    // Get all QA engineers
    const effectiveQAEngineers = employees.filter(emp =>
      emp.designation && emp.designation.toLowerCase().includes('qa')
    );

    // State for summary modal
    const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);

    return (
      <div className="space-y-6">
        {/* Overall Progress Summary */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-semibold">
                📊
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Overall QA Allocation Progress</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="text-2xl font-bold text-blue-600">
                  {releasesForQAAllocation.length}
                </div>
                <div className="text-sm text-blue-700">Releases with Test Cases</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="text-2xl font-bold text-green-600">
                  {releasesForQAAllocation.filter((r: any) => {
                    const releaseId = r.releaseId || r.id;
                    const allocatedTestCases = qaAllocatedTestCases[releaseId] || [];
                    const allocatedToQA = Object.values(qaAllocations[releaseId] || {}).flat().length;
                    return allocatedToQA === allocatedTestCases.length;
                  }).length}
                </div>
                <div className="text-sm text-green-700">Releases Completed</div>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <div className="text-2xl font-bold text-orange-600">
                  {Object.values(qaAllocatedTestCases).flat().length - Object.values(qaAllocations).flatMap(Object.values).flat().length}
                </div>
                <div className="text-sm text-orange-700">Test Cases Remaining</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Step 1: Release Selection */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                1
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Select Release for QA Allocation</h3>
            </div>
            {releasesForQAAllocation.length > 0 ? (
              <div className="flex space-x-2 overflow-x-auto">
                {releasesForQAAllocation.map((release: any) => {
                const releaseId = release.releaseId ;
                const isSelected = selectedReleaseForQA === releaseId;
                const allocatedTestCases = qaAllocatedTestCases[releaseId] || [];
                const allocatedToQA = Object.values(qaAllocations[releaseId] || {}).flat().length;
                const remainingTestCases = allocatedTestCases.length - allocatedToQA;
                
                return (
                  <div
                    key={releaseId}
                    className={`min-w-[180px] px-4 py-2 rounded-md border text-left transition-all duration-200 focus:outline-none text-sm font-medium shadow-sm flex flex-col items-start relative bg-white
                      ${
                        isSelected
                          ? "border-blue-500 hover:border-blue-500 hover:bg-blue-50 hover:shadow-md hover:ring-1 hover:ring-blue-300"
                          : "border-gray-200 hover:border-blue-500 hover:bg-blue-50 hover:shadow-md hover:ring-1 hover:ring-blue-300"
                      }`}
                    style={{
                      boxShadow: isSelected ? "0 0 0 2px #3b82f6" : undefined,
                    }}
                  >
                    <div className="truncate font-semibold mb-1">{release.releaseName || release.name}</div>
                    <div className="text-xs text-gray-500 mb-1">Version: {release.version}</div>
                    <div className="text-xs text-gray-600 mb-2">
                      {allocatedTestCases.length} test cases allocated
                    </div>
                    <div className="text-xs text-green-600 mb-2">
                      {allocatedToQA} assigned to QA • {remainingTestCases} remaining
                    </div>
                    <Button
                      size="sm"
                      variant={isSelected ? "primary" : "secondary"}
                      className="w-full"
                      onClick={() => {
                        if (allocationMode === "one-to-one") {
                          setSelectedReleaseIds(isSelected ? [] : [releaseId]);
                        } else {
                          setSelectedReleaseIds((prev) =>
                            isSelected ? prev.filter((id) => id !== releaseId) : [...prev, releaseId]
                          );
                        }
                      }}
                      disabled={allocationMode === "one-to-one" && !isSelected && selectedReleaseIds.length >= 1}
                    >
                      {isSelected ? "Selected" : "Select"}
                    </Button>
                  </div>
                );
              })}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-sm text-gray-500 mb-2">No releases have test cases allocated for QA.</div>
                <div className="text-xs text-gray-400">Please go back to the Release Allocation tab and allocate test cases to releases first.</div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Step 2: Allocate New Test Cases (only show if release is selected) */}
        {selectedReleaseForQA && (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-semibold">
                    2
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Allocate New Test Cases</h3>
                </div>
                {/* Summary Button */}
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsSummaryModalOpen(true)}
                  className="flex items-center space-x-2"
                >
                  <Eye className="w-4 h-4" />
                  <span>View Summary</span>
                </Button>
              </div>
              
              {/* Release Info */}
              {allocatedRelease && (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-sm font-medium text-blue-900 mb-1">
                    Selected Release:
                  </div>
                  <div className="text-lg font-semibold text-blue-700 mb-1">
                    {allocatedRelease.releaseName || allocatedRelease.name} (v{allocatedRelease.version})
                  </div>
                  <div className="text-sm text-blue-600 mb-2">
                    {qaAllocatedTestCases[selectedReleaseForQA].length} test cases allocated to this release
                  </div>
                  <div className="text-sm text-green-600">
                    {Object.values(qaAllocations[selectedReleaseForQA] || {}).flat().length} already assigned to QA • {qaAllocatedTestCases[selectedReleaseForQA].length - Object.values(qaAllocations[selectedReleaseForQA] || {}).flat().length} remaining for allocation
                  </div>
                </div>
              )}

              {/* QA Selection */}
              <div className="mb-6">
                <h4 className="text-md font-semibold text-gray-800 mb-3">Select QA Engineer:</h4>
                <div className="flex flex-wrap gap-3">
                  {effectiveQAEngineers.map((emp: any) => (
                    <Button
                      key={emp.id}
                      variant={selectedQA === emp.id ? "primary" : "secondary"}
                      onClick={() => setSelectedQA(emp.id)}
                      className="min-w-[120px]"
                    >
                      {emp.firstName} {emp.lastName}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Allocation Action */}
              {selectedQA && selectedReleaseForQA && (selectedTestCasesForQA[selectedReleaseForQA]?.length ?? 0) > 0 && (
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="text-sm font-medium text-green-900 mb-3">
                    Ready to allocate {selectedTestCasesForQA[selectedReleaseForQA]?.length ?? 0} test case(s) to{' '}
                    <span className="font-semibold">
                      {effectiveQAEngineers && effectiveQAEngineers.find((emp: any) => emp.id === selectedQA)?.firstName} {effectiveQAEngineers.find((emp: any) => emp.id === selectedQA)?.lastName}
                    </span>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        if (selectedReleaseForQA) {
                          allocateTestCasesToQA(selectedQA, selectedTestCasesForQA[selectedReleaseForQA] || []);
                        }
                      }}
                    >
                      Confirm Allocation
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setSelectedTestCasesForQA(prev => ({
                        ...prev,
                        [selectedReleaseForQA!]: []
                      }))}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step 3: Release Complete (only show if all test cases for current release are allocated) */}
        {selectedReleaseForQA && Object.values(qaAllocations[selectedReleaseForQA] || {}).flat().length === qaAllocatedTestCases[selectedReleaseForQA].length && (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-semibold">
                  ✓
                </div>
                <h3 className="text-lg font-semibold text-green-900">Release Allocation Complete!</h3>
              </div>
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="text-sm font-medium text-green-900 mb-2">
                  All test cases for "{allocatedRelease?.releaseName || allocatedRelease?.name}" have been allocated successfully!
                </div>
                <div className="text-sm text-green-700 mb-4">
                  {Object.values(qaAllocations[selectedReleaseForQA] || {}).flat().length} of {qaAllocatedTestCases[selectedReleaseForQA].length} test cases allocated
                </div>
                <div className="flex gap-3">
                  {releasesForQAAllocation.find((r: any) => (r.releaseId || r.id) !== selectedReleaseForQA) ? (
                    <Button
                      variant="primary"
                      onClick={() => {
                        const nextRelease = releasesForQAAllocation.find((r: any) => (r.releaseId || r.id) !== selectedReleaseForQA);
                        if (nextRelease) {
                          setSelectedReleaseForQA(nextRelease.releaseId || nextRelease.id);
                          setSelectedQA(null);
                        }
                      }}
                    >
                      Next Release
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      onClick={() => {
                        const currentProjectId = selectedProject || projectId;
                        if (!currentProjectId) return;
                        // Save mock modules to localStorage for TestExecution page
                        localStorage.setItem("mockModules", JSON.stringify(effectiveModules));
                        navigate(`/projects/${currentProjectId}/releases/test-execution`);
                      }}
                    >
                      Proceed to Test Execution
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Summary Modal */}
        <Modal
          isOpen={isSummaryModalOpen}
          onClose={() => setIsSummaryModalOpen(false)}
          title="QA Allocation Summary"
          size="xl"
        >
          <div className="space-y-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="text-2xl font-bold text-blue-600">
                  {Object.values(qaAllocations[selectedReleaseForQA || ''] || {}).flat().length}
                </div>
                <div className="text-sm text-blue-700">Total Allocated</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="text-2xl font-bold text-green-600">
                  {Object.keys(qaAllocations[selectedReleaseForQA || ''] || {}).length}
                </div>
                <div className="text-sm text-green-700">QA Engineers</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <div className="text-2xl font-bold text-purple-600">
                  {qaAllocatedTestCases[selectedReleaseForQA || '']?.length - Object.values(qaAllocations[selectedReleaseForQA || ''] || {}).flat().length || 0}
                </div>
                <div className="text-sm text-purple-700">Remaining</div>
              </div>
            </div>

            {/* QA Engineers List */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-800">QA Engineers & Their Assignments</h4>
              {loadingQAAllocations ? (
                <div className="text-center py-8">
                  <div className="text-sm text-gray-500">Loading existing QA allocations...</div>
                </div>
              ) : (
                <div className="space-y-4">
                  {effectiveQAEngineers.map((qa) => {
                    const allocatedTestCases = getAllocatedTestCasesForQA(qa.id);
                    return (
                      <div key={qa.id} className="border rounded-lg p-4 bg-gray-50">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                              {qa.firstName.charAt(0)}{qa.lastName.charAt(0)}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">
                                {qa.firstName} {qa.lastName}
                              </div>
                              <div className="text-xs text-gray-500">{qa.designation}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-blue-600">
                              {allocatedTestCases.length}
                            </div>
                            <div className="text-xs text-gray-500">test cases</div>
                          </div>
                        </div>
                        {allocatedTestCases.length > 0 && (
                          <div className="space-y-2">
                            <div className="text-xs font-medium text-gray-600 mb-2 flex items-center">
                              <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                              Assigned Test Cases:
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {allocatedTestCases.map((tcId) => {
                                const testCase = effectiveTestCases && effectiveTestCases.find((tc: any) => tc.id === tcId);
                                return (
                                  <div key={tcId} className="flex items-center justify-between text-xs bg-white p-2 rounded border">
                                    <span className="truncate font-mono text-gray-700">{testCase?.id || tcId}</span>
                                    <button
                                      onClick={() => removeAllocationFromQA(qa.id, tcId)}
                                      className="text-red-500 hover:text-red-700 ml-2 p-1 hover:bg-red-50 rounded transition-colors"
                                      title="Remove allocation"
                                    >
                                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                      </svg>
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-4">
              <Button
                variant="secondary"
                onClick={() => setIsSummaryModalOpen(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    );
  };

  // useEffect(() => {
  //   if (activeTab === "release" && selectedReleaseIds.length === 1) {
  //     setLoadingRelease(true);
  //     setReleaseError(null);
  //     axios
  //       .get(`${BASE_URL}releases/releaseId/${selectedReleaseIds[0]}`)
  //       .then((res) => setApiRelease(res.data))
  //       .catch((err) => setReleaseError(err.message))
  //       .finally(() => setLoadingRelease(false));
  //   } else {
  //     setApiRelease(null);
  //   }
  // }, [activeTab, selectedReleaseIds]);

  // Save mock test cases and mock QA to localStorage on mount (for cross-page use)
  // useEffect(() => {
  //   // No mock test case storage
  // }, []);

  // Save allocations to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('qaAllocatedTestCases', JSON.stringify(qaAllocatedTestCases));
  }, [qaAllocatedTestCases]);

  // Save QA allocations to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('qaAllocations', JSON.stringify(qaAllocations));
  }, [qaAllocations]);

  // Add useEffect to enforce selection restrictions
  useEffect(() => {
    if (allocationMode === "one-to-one") {
      if (selectedTestCases.length > 1) {
        setSelectedTestCases([selectedTestCases[0]]);
      }
      if (selectedReleaseIds.length > 1) {
        setSelectedReleaseIds([selectedReleaseIds[0]]);
      }
    
    } else if (allocationMode === "one-to-many") {
      if (selectedTestCases.length > 1) {
        setSelectedTestCases([selectedTestCases[0]]);
      }
      // Allow multiple releases
    }
    // Bulk: allow all
  }, [allocationMode, selectedTestCases, selectedReleaseIds]);

  // Add a useEffect to fetch test cases for all submodules when a module is selected and no submodule is selected
  useEffect(() => {
    if (selectedProjectId && selectedModule && !selectedSubmodule) {
      // Find the module object
      const moduleObj = effectiveModules.find((m: any) => m.name === selectedModule);
      if (moduleObj && Array.isArray(moduleObj.submodules)) {
        // Fetch test cases for all submodules in parallel
        Promise.all(
          moduleObj.submodules.map((sm: any) =>
            getTestCasesByProjectAndSubmodule(selectedProjectId, String(sm.subModuleId))
          )
        ).then((results) => {
          // Flatten and map all test cases
          const moduleMap = Object.fromEntries(effectiveModules.map((m: any) => [m.id, m.name]));
          const submoduleMap = Object.fromEntries(effectiveModules.flatMap((m: any) => m.submodules.map((sm: any) => [sm.id, sm.name])));
          setAllocatedTestCases(
            results.flat().map((tc: any) => ({
              ...tc,
              module: moduleMap[tc.moduleId] || tc.moduleId,
              subModule: submoduleMap[tc.subModuleId] || tc.subModuleId,
              severity: (severities && severities.find(s => s.id === tc.severityId)?.name || "") as TestCaseType['severity'],
              type: (defectTypes && defectTypes.find(dt => dt.id === tc.defectTypeId)?.defectTypeName || "") as TestCaseType['type'],
            })) as TestCaseType[]
          );
        }).catch(() => setAllocatedTestCases([]));
      }
    }
  }, [selectedProjectId, selectedModule, effectiveModules, severities, defectTypes]);

  // The existing useEffect for selectedSubmodule remains, so when a submodule is selected, only its test cases are fetched.
  useEffect(() => {
    if (!selectedProjectId || !selectedSubmodule) return;
    getTestCasesByProjectAndSubmodule(selectedProjectId, selectedSubmodule)
      .then((data) => {
        // Map moduleId/subModuleId to names for display
        const moduleMap = Object.fromEntries(effectiveModules.map((m: any) => [m.id, m.name]));
        const submoduleMap = Object.fromEntries(effectiveModules.flatMap((m: any) => m.submodules.map((sm: any) => [sm.id, sm.name])));
        setAllocatedTestCases(
          (data as any[]).map((tc: any) => ({
            ...tc,
            module: moduleMap[tc.moduleId] || tc.moduleId,
            subModule: submoduleMap[tc.subModuleId] || tc.subModuleId,
            severity: (severities && severities.find(s => s.id === tc.severityId)?.name || "") as TestCaseType['severity'],
            type: (defectTypes && defectTypes.find(dt => dt.id === tc.defectTypeId)?.defectTypeName || "") as TestCaseType['type'],
          })) as TestCaseType[]
        );
      })
      .catch((error) => {
        setAllocatedTestCases([]);
      });
  }, [selectedProjectId, selectedSubmodule, effectiveModules, severities, defectTypes]);

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
      
      {/* Show releases at the top when project is selected (only for Release Allocation tab) */}
      {selectedProject && activeTab === "release" && (
        <div className="mb-6">
          <Card>
            <CardContent className="p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Available Releases
              </h2>
              {loadingReleases ? (
                <div className="text-center py-8">
                  <div className="text-sm text-gray-500">Loading releases...</div>
                </div>
              ) : effectiveProjectRelease.length > 0 ? (
                <>
                  <ReleaseCardsPanel />
                  {/* Allocate button appears if at least one release is selected */}
                  {selectedReleaseIds.length > 0 && (
                    <div className="mt-4 flex flex-col space-y-3">
                      {/* Allocation Mode Selection */}
                      <div className="flex items-center space-x-4">
                        <span className="text-sm font-medium text-gray-700">Allocation Mode:</span>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant={allocationMode === "one-to-one" ? "primary" : "secondary"}
                            onClick={() => setAllocationMode("one-to-one")}
                            disabled={allocationLoading}
                          >
                            One-to-One
                          </Button>
                          <Button
                            size="sm"
                            variant={allocationMode === "one-to-many" ? "primary" : "secondary"}
                            onClick={() => setAllocationMode("one-to-many")}
                            disabled={allocationLoading}
                          >
                            One-to-Many
                          </Button>
                          <Button
                            size="sm"
                            variant={allocationMode === "bulk" ? "primary" : "secondary"}
                            onClick={() => setAllocationMode("bulk")}
                            disabled={allocationLoading}
                          >
                            Bulk
                          </Button>
                        </div>
                      </div>
                      
                      {/* Mode Description */}
                      <div className="text-xs text-gray-500">
                        {allocationMode === "one-to-one" 
                          ? `Each test case will be allocated to each release individually (${selectedTestCases.length} × ${selectedReleaseIds.length} = ${selectedTestCases.length * selectedReleaseIds.length} API calls)`
                          : allocationMode === "one-to-many"
                          ? `Each test case will be allocated to all selected releases in one API call (${selectedTestCases.length} API calls)`
                          : `All selected test cases will be allocated to all selected releases in a single API call (1 API call)`}
                      </div>

                      {/* Allocate Button */}
                      <div className="flex justify-end">
                        <Button
                          variant="primary"
                          disabled={selectedTestCases.length === 0 || allocationLoading}
                          onClick={handleAllocate}
                        >
                          {allocationLoading ? "Allocating..." : `Allocate Selected Releases (${allocationMode === "one-to-many" ? "One-to-Many" : "One-to-One"})`}
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="text-sm text-gray-500">No releases found for this project.</div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Success and Error Messages */}
      {allocationSuccess && (
        <div className="mb-4">
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4">
              <div className="flex items-center text-green-800">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">{allocationSuccess}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {allocationError && (
        <div className="mb-4">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center text-red-800">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">{allocationError}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Allocation Progress */}
      {allocationProgress && (
        <div className="mb-4">
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-center text-blue-800 mb-2">
                <svg className="w-5 h-5 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span className="font-medium">Allocating test cases to releases...</span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${(allocationProgress.current / allocationProgress.total) * 100}%` }}
                ></div>
              </div>
              <div className="text-sm text-blue-600 mt-1">
                {allocationProgress.current} of {allocationProgress.total} {allocationMode === "bulk" ? "bulk allocations" : allocationMode === "one-to-many" ? "test cases" : "allocations"} completed
              </div>
            </CardContent>
          </Card>
        </div>
      )}

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
            className={`px-4 py-2 font-medium border-b-2 transition-colors duration-200 ${activeTab === tab.key
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
          {ModuleSelectionPanel()}
          {selectedModule && <SubmoduleSelectionPanel />}
          {filteredTestCases.length > 0 ? (
            <TestCaseTable />
          ) : (
            selectedSubmodule && (
              <Card className="mb-4">
                <CardContent className="p-8 text-center">
                  <div className="text-gray-500">No test cases found for the selected submodule.</div>
                </CardContent>
              </Card>
            )
          )}
        </>
      ) : (
        <>
          <QASelectionPanel />
          {ModuleSelectionPanel()}
          {selectedModule && <SubmoduleSelectionPanel />}
          {filteredTestCases.length > 0 ? (
            <TestCaseTable />
          ) : (
            selectedSubmodule && (
              <Card className="mb-4">
                <CardContent className="p-8 text-center">
                  <div className="text-gray-500">No test cases found for the selected submodule.</div>
                </CardContent>
              </Card>
            )
          )}
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
        <QuickAddTestCase selectedProjectId={projectId || ""} />
        <QuickAddDefect projectModules={[]} />
      </div>
    </div>
  );
};
