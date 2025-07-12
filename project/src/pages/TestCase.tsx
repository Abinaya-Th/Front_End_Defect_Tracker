import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Eye,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { Card, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
import { Badge } from "../components/ui/Badge";
import { useParams, useNavigate } from "react-router-dom";
import QuickAddTestCase from "./QuickAddTestCase";
import QuickAddDefect from "./QuickAddDefect";
import * as XLSX from "xlsx";
import { TestCase as TestCaseType } from "../types/index";
import { ProjectSelector } from "../components/ui/ProjectSelector";
import ModuleSelector from "../components/ui/ModuleSelector";
import { Project } from "../types";
import { getAllProjects } from "../api/projectget";
import { getTestCasesByProjectAndSubmodule } from "../api/testCase/testCaseApi";
import { getSeverities } from "../api/severity";
import { getDefectTypes } from "../api/defectType";
import { searchTestCases } from "../api/testCase/searchTestCase";
import { updateTestCase } from "../api/testCase/updateTestCase";
import { getModulesByProjectId } from "../api/module/getModule";
import { getSubmodulesByModuleId, Submodule } from "../api/submodule/submoduleget";
import { createTestCase } from "../api/testCase/createTestcase";
import axios from "axios";
const BASE_URL = import.meta.env.VITE_BASE_URL;


// --- MOCK DATA for projects/modules/submodules ---
// const mockProjects = [
//   { id: "PROJ001", name: "Project Alpha" },
//   { id: "PROJ002", name: "Project Beta" },
// ];
// --- MOCK DATA for modules/submodules by projectId (numeric IDs matching DB) ---
// const mockModulesByProject: Record<string, { id: string, name: string, submodules: { id: string, name: string }[] }[]> = {
//   "1": [ ... ]
// };

export const TestCase: React.FC = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  // --- State for projects/modules/submodules (real backend) ---
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>(String(projectId ?? ''));
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [selectedSubmoduleId, setSelectedSubmoduleId] = useState<string | null>(null);
  const [testCases, setTestCases] = useState<TestCaseType[]>([]);

  // Add state for modules by project
  const [modulesByProject, setModulesByProject] = useState<Record<string, { id: string, name: string, submodules: { id: string, name: string }[] }[]>>({});

  // Fetch real projects from backend on mount
  useEffect(() => {
    getAllProjects().then(res => setProjects(res));
  }, []);

  // Fetch static data only once on mount
  useEffect(() => {
    getSeverities().then(res => setSeverities(res.data));
    getDefectTypes().then(res => setDefectTypes(res.data));
  }, []);

  // Fetch modules when selectedProjectId changes
  useEffect(() => {
    if (!selectedProjectId) return;
    getModulesByProjectId(selectedProjectId).then((res) => {
      const modules = (res.data || []).map((mod: any) => ({
        id: String(mod.id),
        name: mod.moduleName || mod.name,
        submodules: (mod.submodules || []).map((sm: any) => ({
          id: String(sm.id),
          name: sm.subModuleName || sm.name,
        })),
      }));
      setModulesByProject((prev) => ({ ...prev, [selectedProjectId]: modules }));
    });
  }, [selectedProjectId]);

  // Use fetched modules for the selected project
  const projectModules = selectedProjectId ? modulesByProject[selectedProjectId] || [] : [];

  // ... keep other UI state as before ...
  // const [isModalOpen, setIsModalOpen] = useState(false); // Unused
  const [isViewStepsModalOpen, setIsViewStepsModalOpen] = useState(false);
  const [isViewTestCaseModalOpen, setIsViewTestCaseModalOpen] = useState(false);
  // const [selectedTestCases, setSelectedTestCases] = useState<string[]>([]); // Removed
  const [viewingTestCase, setViewingTestCase] = useState<TestCaseType | null>(null);
  // const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set()); // Unused
  const [isDescriptionModalOpen, setIsDescriptionModalOpen] = useState(false);
  const [selectedDescription, setSelectedDescription] = useState("");
  const [selectedModules] = useState<string[]>([]); // setSelectedModules unused
  const [selectedSubmodules] = useState<string[]>([]); // setSelectedSubmodules unused
  // const [filterText, setFilterText] = useState(""); // Unused
  // const [filterType, setFilterType] = useState(""); // Unused
  // const [filterSeverity, setFilterSeverity] = useState(""); // Unused

  // --- Multi-modal state for bulk add like QuickAddTestCase ---
  interface ModalFormData {
    module: string;
    subModule: string;
    description: string;
    steps: string;
    type: string;
    severity: string;
    projectId: string | undefined;
    id?: string;
    [key: string]: string | undefined;
  }
  const [modals, setModals] = useState<{
    open: boolean;
    formData: ModalFormData;
  }[]>([
    {
      open: false,
      formData: {
        module: "",
        subModule: "",
        description: "",
        steps: "",
        type: "functional",
        severity: "medium",
        projectId: projectId,
      },
    },
  ]);
  const [currentModalIdx, setCurrentModalIdx] = useState(0);
  const [success, setSuccess] = useState(false);
  const [backendProjects, setBackendProjects] = React.useState<Project[]>([]);

  // 1. Add state to track if modal is in edit mode
  const isEditMode = modals[currentModalIdx]?.formData?.id !== undefined && modals[currentModalIdx]?.formData?.id !== '';

  // Add after state declarations
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Add state for submodules
  const [submodules, setSubmodules] = useState<Submodule[]>([]);
  const [submoduleError, setSubmoduleError] = useState<string>("");

  // Fetch submodules when selectedModuleId changes
  useEffect(() => {
    if (!selectedModuleId) {
      setSubmodules([]);
      setSubmoduleError("");
      return;
    }
    getSubmodulesByModuleId(selectedModuleId)
      .then((res) => {
        setSubmodules(res.data || []);
        setSubmoduleError("");
      })
      .catch((err) => {
        if (err?.response?.status === 404) {
          setSubmodules([]);
          setSubmoduleError("No submodules found for this module.");
        } else {
          setSubmodules([]);
          setSubmoduleError("Failed to fetch submodules. Please try again.");
        }
      });
  }, [selectedModuleId]);


  // Add state for severities and defect types
  const [severities, setSeverities] = useState<{ id: number; name: string; color: string }[]>([]);
  const [defectTypes, setDefectTypes] = useState<{ id: number; defectTypeName: string }[]>([]);

  // Fetch test cases when projectId and submoduleId are selected
  useEffect(() => {
    if (!selectedProjectId || selectedSubmoduleId === null) return;
    getTestCasesByProjectAndSubmodule(selectedProjectId, selectedSubmoduleId).then((data) => {
      // Map moduleId/subModuleId to names for display
      const moduleMap = Object.fromEntries(projectModules.map((m: any) => [m.id, m.name]));
      const submoduleMap = Object.fromEntries(projectModules.flatMap((m: any) => m.submodules.map((sm: any) => [sm.id, sm.name])));
      setTestCases(
        (data as any[]).map((tc: any) => ({
          ...tc,
          module: moduleMap[tc.moduleId] || tc.moduleId,
          subModule: submoduleMap[tc.subModuleId] || tc.subModuleId,
          severity: (severities && severities.find(s => s.id === tc.severityId)?.name || "") as TestCaseType['severity'],
          type: (defectTypes && defectTypes.find(dt => dt.id === tc.defectTypeId)?.defectTypeName || "") as TestCaseType['type'],
        })) as TestCaseType[]
      );
    });
  }, [selectedProjectId, selectedSubmoduleId, severities, defectTypes]); // Removed projectModules from dependencies

  // If no selectedProjectId, show a message or redirect
  if (!selectedProjectId) {
    return (
      <div className="p-8 text-center text-gray-500">
        Please select a project to view its test cases.
      </div>
    );
  }

  // Compute selected test case IDs based on selected modules/submodules
  const selectedTestCaseIds = useMemo(() => {
    let ids: string[] = [];
    if (selectedModules.length > 0) {
      ids = [
        ...new Set(
          testCases
            .filter(
              (tc) =>
                tc.projectId === String(selectedProjectId) &&
                selectedModules.includes(tc.module ?? "")
            )
            .map((tc) => tc.id)
        ),
      ];
    }
    if (selectedSubmodules.length > 0) {
      ids = [
        ...ids,
        ...new Set(
          testCases
            .filter(
              (tc) =>
                tc.projectId === String(selectedProjectId) &&
                selectedSubmodules.includes(tc.subModule ?? "")
            )
            .map((tc) => tc.id)
        ),
      ];
    }
    return Array.from(new Set(ids));
  }, [selectedModules, selectedSubmodules, testCases, selectedProjectId]);

  // Compute filtered test cases for the table (show all for module)
  const filteredTestCases = testCases;

  // Handle project selection
  // const handleProjectSelect = (projectId: string) => {
  //   setSelectedProjectId(projectId);
  //   navigate(`/projects/${projectId}/test-cases`);
  // };

  // Handle module selection
  // const handleModuleSelect = (moduleId: string) => {
  //   setSelectedModuleId(Number(moduleId));
  //   setSelectedSubmoduleId(null);
  //   setSelectedTestCases([]);
  //   fetch(`${BASE_URL}testcase/module/${moduleId}`)
  //     .then((res) => res.json())
  //     .then((data) => {
  //       const mapped = (data.data || []).map((tc: any) => ({
  //         id: tc.testCaseId || tc.id,
  //         description: tc.description,
  //         steps: tc.steps,
  //         subModule: tc.subModuleId || tc.subModule,
  //         module: tc.moduleId || tc.module,
  //         projectId: tc.projectId,
  //         severity: tc.severityName || tc.severityId || tc.severity,
  //         type: tc.typeId || tc.type,
  //       }));
  //       setTestCases(mapped);
  //     });
  // };

  // Handle submodule selection (just highlight, no fetch)
  //noneeded
  const handleSubmoduleSelect = (submoduleId: string | null) => {
    setSelectedSubmoduleId(submoduleId);
    // setSelectedTestCases([]); // Removed
    setSearchResults(null);
    setSearchFilters({ description: "", typeId: "", severityId: "", submoduleId: "" });
  };

  // When selection changes, update selectedTestCases for bulk actions
  // useEffect(() => {
  //   if (selectedModules.length > 0 || selectedSubmodules.length > 0) {
  //     setSelectedTestCases(selectedTestCaseIds);
  //   }
  // }, [selectedTestCaseIds, selectedModules, selectedSubmodules]); // Removed

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
          projectId: selectedProjectId,
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

  const handleImportExcelButton = () => {
    fileInputRef.current?.click();
  };
  const handleImportExcelInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = evt.target?.result;
      if (data) {
        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        const rows = json
          .slice(1)
          .map((row: any[]) => ({
            module: row[0] || "",
            subModule: row[1] || "",
            description: row[2] || "",
            steps: row[3] || "",
            type: row[4] || "functional",
            severity: row[5] || "medium",
            projectId: selectedProjectId,
          }))
          .filter((row) => row.module && row.subModule && row.description && row.steps);
        if (rows.length > 0) {
          setModals(rows.map((row) => ({ open: true, formData: row })));
          setCurrentModalIdx(0);
          // setIsModalOpen(true); // isModalOpen state is removed
        }
      }
    };
    reader.readAsBinaryString(file);
  };
  const handleExportExcel = () => {
    const wsData = [
      ["Module", "Sub Module", "Description", "Steps", "Type", "Severity", "Test Case ID"],
      ...filteredTestCases.map(tc => [
        tc.module,
        tc.subModule,
        tc.description,
        tc.steps,
        tc.type,
        tc.severity,
        tc.id
      ])
    ];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "TestCases");
    XLSX.writeFile(wb, `TestCases_${selectedProjectId}_${selectedModuleId}.xlsx`);
  };

  // Add state for bulk validation error
  const [bulkValidationError, setBulkValidationError] = useState<string | null>(null);

  // Validation function for bulk test cases
  function validateTestCases(modals: { formData: any }[]): { idx: number; missing: string[] }[] {
    const requiredFields = ['module', 'subModule', 'type', 'severity', 'description', 'steps'];
    return modals
      .map((modal, idx) => {
        const missing = requiredFields.filter(field => !(modal.formData as any)[field]);
        return missing.length > 0 ? { idx, missing } : null;
      })
      .filter((i): i is { idx: number; missing: string[] } => i !== null);
  }

  const handleSubmitAll = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    // Validate all test cases
    const requiredFields = ['module', 'subModule', 'type', 'severity', 'description', 'steps'];

    // Only include modals that are open and have at least one required field filled
    const modalsToValidate = modals
      .map((modal, idx) => ({ modal, idx }))
      .filter(({ modal }) =>
        modal.open && requiredFields.some(field => (modal.formData as any)[field] && (modal.formData as any)[field].toString().trim() !== '')
      );

    // If there are no modals to validate, do not show an error and do not proceed
    if (modalsToValidate.length === 0) {
      setBulkValidationError(null);
      return;
    }

    const incomplete = validateTestCases(modalsToValidate.map(m => m.modal));
    if (incomplete.length > 0) {
      setBulkValidationError(
        incomplete
          .map((i, errorIdx) => {
            // Use the original row index from modalsToValidate
            const rowNumber = modalsToValidate[errorIdx].idx + 1;
            return (
              `Test Case ${rowNumber} is missing: ` +
              i.missing
                .map(field =>
                  field
                    .replace(/([A-Z])/g, ' $1')
                    .replace(/^./, str => str.toUpperCase())
                    .replace('Sub Module', 'Sub Module')
                    .replace('Test Steps', 'Test Steps')
                )
                .join(', ')
            );
          })
          .join('\n')
      );
      return;
    } else {
      setBulkValidationError(null);
    }

    // Use only the validated modals for submission
    for (const { formData } of modalsToValidate.map(m => m.modal)) {
      // Prepare payload for both create and update
      const payload: any = {
        description: formData.description,
        steps: formData.steps,
        subModuleId: Number(selectedSubmoduleId),
        moduleId: Number(selectedModuleId),
        projectId: Number(formData.projectId),
      };
      const severityId = severities.find(s => s.name === formData.severity)?.id;
      if (typeof severityId === 'number') payload.severityId = severityId;
      const defectTypeId = defectTypes.find(dt => dt.defectTypeName === formData.type)?.id;
      if (typeof defectTypeId === 'number') payload.defectTypeId = defectTypeId;
      try {
        if (formData.id) {
          // Edit mode: update existing test case
          await updateTestCase(extractNumericId(formData.id), payload);
        } else {
          // Add mode: create new test case
          const response = await createTestCase(payload);
        }
      } catch (error) {
        console.error("Error saving test case:", error);
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
            severity: "medium",
            projectId: selectedProjectId,
          },
        },
      ]);
      setCurrentModalIdx(0);
      // setIsModalOpen(false); // isModalOpen state is removed
      // Refresh test cases after update
      if (selectedProjectId && selectedSubmoduleId !== null) {
        getTestCasesByProjectAndSubmodule(selectedProjectId, selectedSubmoduleId).then((data) => {
          const moduleMap = Object.fromEntries(projectModules.map((m: any) => [m.id, m.name]));
          const submoduleMap = Object.fromEntries(projectModules.flatMap((m: any) => m.submodules.map((sm: any) => [sm.id, sm.name])));
          setTestCases(
            (data as any[]).map((tc: any) => ({
              ...tc,
              module: moduleMap[tc.moduleId] || tc.moduleId,
              subModule: submoduleMap[tc.subModuleId] || tc.subModuleId,
              severity: (severities && severities.find(s => s.id === tc.severityId)?.name || "") as TestCaseType['severity'],
              type: (defectTypes && defectTypes.find(dt => dt.id === tc.defectTypeId)?.defectTypeName || "") as TestCaseType['type'],
            })) as TestCaseType[]
          );
        });
      }
    }, 1200);
  };

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

  // const handleSelectAll = (checked: boolean) => {
  //   if (checked) {
  //     setSelectedTestCases(filteredTestCases.map((tc: TestCaseType) => tc.id));
  //   } else {
  //     setSelectedTestCases([]);
  //   }
  // };

  // const handleSelectTestCase = (testCaseId: string, checked: boolean) => {
  //   if (checked) {
  //     setSelectedTestCases([...selectedTestCases, testCaseId]);
  //   } else {
  //     setSelectedTestCases(selectedTestCases.filter((id) => id !== testCaseId));
  //   }
  // };

  const handleViewSteps = (testCase: TestCaseType) => {
    setViewingTestCase(testCase);
    setIsViewStepsModalOpen(true);
  };

  const handleViewTestCase = (testCase: TestCaseType) => {
    setViewingTestCase(testCase);
    setIsViewTestCaseModalOpen(true);
  };
  // Integration removed: no fetching of all projects

  // const toggleRowExpansion = (testCaseId: string) => {
  //   setExpandedRows((prev) => {
  //     const newSet = new Set(prev);
  //     if (newSet.has(testCaseId)) {
  //       newSet.delete(testCaseId);
  //     } else {
  //       newSet.add(testCaseId);
  //     }
  //     return newSet;
  //   });
  // };

  // const handleViewDescription = (description: string) => {
  //   setSelectedDescription(description);
  //   setIsDescriptionModalOpen(true);
  // };

  // Add state for search filters and search results
  const [searchFilters, setSearchFilters] = useState({
    description: "",
    typeId: "",
    severityId: "",
    submoduleId: "",
  });
  const [searchResults, setSearchResults] = useState<TestCaseType[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Add state to track submodules for each modal
  const [modalSubmodules, setModalSubmodules] = useState<Submodule[][]>([]);

  // Add a useEffect to fetch submodules for the selected module in the current modal
  useEffect(() => {
    const currentModal = modals[currentModalIdx];
    // Skip fetching submodules if we're in edit mode (formData.id exists)
    if (currentModal?.formData.id) {
      return;
    }
    const currentModuleName = currentModal?.formData.module;
    const moduleObj = projectModules && projectModules.find((m: any) => m.name === currentModuleName);
    if (moduleObj && moduleObj.id) {
      getSubmodulesByModuleId(moduleObj.id).then(res => {
        setModalSubmodules(prev => {
          const copy = [...prev];
          copy[currentModalIdx] = res.data || [];
          return copy;
        });
      });
    } else {
      setModalSubmodules(prev => {
        const copy = [...prev];
        copy[currentModalIdx] = [];
        return copy;
      });
    }
  }, [modals[currentModalIdx]?.formData.module, projectModules, currentModalIdx]);

  // Helper to get module and submodule names by ID
  const getModuleNameById = (id: string | null) => projectModules.find(m => m.id === id)?.name || "";
  const getSubmoduleNameById = (id: string | null) => submodules.find(sm => sm.id === id)?.name || "";

  // Replace all usages of apiDeleteTestCase with this function
  const deleteTestCaseById = async (testCaseId: string) => {
    const url = `http://34.171.115.156:8087/api/v1/testcase/${testCaseId}`;
    return axios.delete(url);
  };

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Compute paginated test cases (works for both searchResults and filteredTestCases)
  const tableData = searchResults !== null ? searchResults : filteredTestCases;
  const totalRows = tableData.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage) || 1;
  const paginatedTestCases = tableData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  // Reset to first page if data changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchResults, filteredTestCases, rowsPerPage]);

  // Add helper function at the top (after imports)
  function extractNumericId(id: string) {
    return id.replace(/\D/g, '').replace(/^0+/, '');
  }

  return (
    <div className="max-w-6xl mx-auto ">
      {/* Fixed Header Section */}
      <div className="flex-none p-6 pb-4">
        <div className="flex justify-between items-center mb-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-gray-900">Test Cases</h1>
            <p className="text-sm text-gray-500">
              {selectedProjectId
                ? `Project: ${backendProjects.find((p) => p?.id === selectedProjectId)?.name || ''}`
                : "Select a project to begin"}
            </p>
          </div>
        </div>

        {/* Project Selection Panel */}
        <ProjectSelector
          projects={projects}
          selectedProjectId={selectedProjectId || ''}
          onSelect={(id: string) => {
            setSelectedProjectId(id);
            navigate(`/projects/${id}/test-cases`);
          }}
        />
      </div>

      {/* Content Area - Now scrollable at page level */}
      <div className="flex-1 px-6 pb-6">
        <div className="flex flex-col">
          {/* Module Selection Panel */}
          {selectedProjectId && (
            <ModuleSelector
              modules={projectModules}
              selectedModuleId={selectedModuleId}
              onSelect={(id) => {
                setSelectedModuleId(id);
                setSelectedSubmoduleId(null);
                // setSelectedTestCases([]); // Removed
              }}
              className="mb-4"
            />
          )}

          {/* Submodule Selection Panel */}
          {selectedProjectId && selectedModuleId && (
            <Card className="mb-4">
              <CardContent className="p-4">
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Submodule Selection
                  </h2>
                </div>
                {submoduleError && (
                  <div className="mb-2 text-red-600 text-sm">{submoduleError}</div>
                )}
                <div className="relative flex items-center">
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
                    className="flex space-x-2 overflow-x-auto pb-2 scroll-smooth flex-1"
                    style={{
                      scrollbarWidth: "none",
                      msOverflowStyle: "none",
                      maxWidth: "100%",
                    }}
                  >
                    {submodules.map((module: any) => {
                      const submoduleTestCases = testCases.filter(
                        (tc: TestCaseType) =>
                          tc.projectId === selectedProjectId &&
                          tc.subModule === module.subModuleId
                      );
                      return (
                        <div key={module.subModuleId} className="flex items-center">
                          <div className="flex items-center border border-gray-200 rounded-lg p-0.5 bg-white hover:border-gray-300 transition-colors">
                            <Button
                              variant={
                                selectedSubmoduleId === module.subModuleId
                                  ? "primary"
                                  : "secondary"
                              }
                              onClick={() => handleSubmoduleSelect(module.subModuleId)}
                              className="whitespace-nowrap border-0 m-2"
                            >
                              {module.subModuleName}
                              <Badge variant="info" className="ml-2">
                                {submoduleTestCases.length}
                              </Badge>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setModals((prev) => {
                                  const newModals = [
                                    ...prev,
                                    {
                                      open: true,
                                      formData: {
                                        module: module.moduleName,
                                        subModule: module.subModuleName || module.name || "",
                                        description: "",
                                        steps: "",
                                        type: "functional",
                                        severity: "medium",
                                        projectId: selectedProjectId,
                                      },
                                    },
                                  ];
                                  setCurrentModalIdx(newModals.length - 1);
                                  return newModals;
                                });
                              }}
                              className="p-1 border-0 hover:bg-gray-50"
                              disabled={selectedSubmoduleId !== module.subModuleId}
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
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
          )}

          {/* Bulk Operations Panel */}
          {/* Removed bulk delete button */}

          {/* Filter Options Above Table */}
          {selectedProjectId && selectedModuleId && (
            <div className="flex justify-end gap-2 mb-2">
              <button
                type="button"
                className="flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded shadow"
                onClick={handleImportExcelButton}
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
                onChange={handleImportExcelInput}
                ref={fileInputRef}
                className="hidden"
              />
              <button
                type="button"
                className="flex items-center px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded shadow"
                onClick={handleExportExcel}
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
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Export to Excel
              </button>
            </div>
          )}

          {/* Add a search/filter panel above the table */}
          {selectedProjectId && selectedModuleId && (
            <Card className="mb-4">
              <CardContent className="p-4">
                <form
                  className="flex flex-wrap gap-4 items-end"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setIsSearching(true);
                    try {
                      const params: any = {};
                      if (searchFilters.description) params.description = searchFilters.description;
                      if (searchFilters.typeId) params.typeId = Number(searchFilters.typeId);
                      if (searchFilters.severityId) params.severityId = Number(searchFilters.severityId);
                      const res = await searchTestCases(params);
                      const normalized = (res.data || []).map((tc: any) => ({
                        ...tc,
                        type: defectTypes && defectTypes.find(dt => dt.id === tc.defectTypeId)?.defectTypeName || "",
                        severity: severities && severities.find(s => s.id === tc.severityId)?.name || "",
                      }));
                      setSearchResults(normalized);
                    } finally {
                      setIsSearching(false);
                    }
                  }}
                >
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                    <input
                      type="text"
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Search by description"
                      value={searchFilters.description}
                      onChange={e => setSearchFilters(f => ({ ...f, description: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Type</label>
                    <select
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={searchFilters.typeId}
                      onChange={e => setSearchFilters(f => ({ ...f, typeId: e.target.value }))}
                    >
                      <option value="">All</option>
                      {defectTypes.map(type => (
                        <option key={type.id} value={type.id}>{type.defectTypeName}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Severity</label>
                    <select
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={searchFilters.severityId}
                      onChange={e => setSearchFilters(f => ({ ...f, severityId: e.target.value }))}
                    >
                      <option value="">All</option>
                      {severities.map(sev => (
                        <option key={sev.id} value={sev.id}>{sev.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
                      {isSearching ? "Searching..." : "Search"}
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      className="px-4 py-2 rounded"
                      onClick={() => {
                        setSearchFilters({ description: "", typeId: "", severityId: "", submoduleId: "" });
                        setSearchResults(null);
                      }}
                    >
                      Clear
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Test Cases Table - Now with dynamic height */}
          {selectedProjectId && selectedModuleId && (
            <Card>
              <CardContent className="p-0">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr className="border-b border-gray-200">
                      {/* Removed checkbox column */}
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        TEST CASE ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        DESCRIPTION
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        STEPS
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        TYPE
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        SEVERITY
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ACTIONS
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paginatedTestCases.map((testCase: TestCaseType) => (
                      <tr key={testCase.testCaseId} className="hover:bg-gray-50">
                        {/* Removed checkbox column */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {testCase.testCaseId}
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
                              testCase.severity || ""
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
                            <button
                              onClick={() => {
                                setModals([
                                  {
                                    open: true,
                                    formData: {
                                      module: testCase.module || "",
                                      subModule: testCase.subModule || "",
                                      description: testCase.description || "",
                                      steps: testCase.steps || "",
                                      type: testCase.type || "functional",
                                      severity: testCase.severity || "medium",
                                      projectId: testCase.projectId,
                                      id: testCase.testCaseId,
                                    },
                                  },
                                ]);
                                setCurrentModalIdx(0);
                              }}
                              className="p-1 text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50 rounded"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm("Are you sure you want to delete this test case?")) {
                                  deleteTestCaseById(testCase.id).then(() => {
                                    if (selectedProjectId && selectedSubmoduleId !== null) {
                                      getTestCasesByProjectAndSubmodule(selectedProjectId, selectedSubmoduleId).then((data) => {
                                        const moduleMap = Object.fromEntries(projectModules.map((m: any) => [m.id, m.name]));
                                        const submoduleMap = Object.fromEntries(projectModules.flatMap((m: any) => m.submodules.map((sm: any) => [sm.id, sm.name])));
                                        setTestCases(
                                          (data as any[]).map((tc: any) => ({
                                            ...tc,
                                            module: moduleMap[tc.moduleId] || tc.moduleId,
                                            subModule: submoduleMap[tc.subModuleId] || tc.subModuleId,
                                            severity: (severities && severities.find(s => s.id === tc.severityId)?.name || "") as TestCaseType['severity'],
                                            type: (defectTypes && defectTypes.find(dt => dt.id === tc.defectTypeId)?.defectTypeName || "") as TestCaseType['type'],
                                          })) as TestCaseType[]
                                        );
                                      });
                                    }
                                  });
                                }
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
                {/* Pagination Controls */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-6 py-3 bg-gray-50 border-t border-gray-200 gap-2">
                  <div className="flex items-center space-x-2 mb-2 sm:mb-0">
                    <span className="text-sm text-gray-700">Rows per page:</span>
                    <select
                      className="border border-gray-300 rounded px-2 py-1 text-sm"
                      value={rowsPerPage}
                      onChange={e => setRowsPerPage(Number(e.target.value))}
                    >
                      {[5, 10, 20, 50, 100].map(n => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex justify-center items-center gap-2 py-2">
                    <button
                      className="px-3 py-1 rounded border bg-gray-100 text-gray-700 disabled:opacity-50"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => (
                      <button
                        key={i + 1}
                        className={`px-3 py-1 rounded border ${currentPage === i + 1 ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'}`}
                        onClick={() => setCurrentPage(i + 1)}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      className="px-3 py-1 rounded border bg-gray-100 text-gray-700 disabled:opacity-50"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </button>
                  </div>
                  <span className="text-sm text-gray-500 text-center sm:text-right">
                    {totalRows === 0
                      ? 'No test cases'
                      : `Showing ${(currentPage - 1) * rowsPerPage + 1}–${Math.min(currentPage * rowsPerPage, totalRows)} of ${totalRows}`}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Add/Edit Test Case Modal */}
      {modals[currentModalIdx]?.open &&
        (() => {
          const idx = currentModalIdx;
          const modal = modals[idx];
          return (
            <Modal
              isOpen={modal.open}
              onClose={() => {
                if (modals.length === 1) {
                  setModals([{ ...modals[0], open: false }]);
                  setCurrentModalIdx(0);
                } else {
                  handleRemove(idx);
                }
              }}
              title={isEditMode ? "Edit Test Case" : "Create New Test Case"}
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
                  {/* Only show import button in add mode */}
                  {!isEditMode && (
                    <button
                      type="button"
                      className="flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded shadow mr-3"
                      onClick={() => {
                        const input = document.createElement("input");
                        input.type = "file";
                        input.accept = ".xlsx,.csv";
                        input.onchange = (e) => {
                          const file = (e.target as HTMLInputElement).files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (evt) => {
                              const data = evt.target?.result;
                              if (data) {
                                const workbook = XLSX.read(data, { type: "binary" });
                                const sheetName = workbook.SheetNames[0];
                                const worksheet = workbook.Sheets[sheetName];
                                const json: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                                const rows = json
                                  .slice(1)
                                  .map((row: any[]) => ({
                                    module: row[0] || "",
                                    subModule: row[1] || "",
                                    description: row[2] || "",
                                    steps: row[3] || "",
                                    type: row[4] || "functional",
                                    severity: row[5] || "medium",
                                    projectId: selectedProjectId,
                                  }))
                                  .filter((row) => row.module && row.subModule && row.description && row.steps);
                                if (rows.length > 0) {
                                  setModals(rows.map((row) => ({ open: true, formData: row })));
                                  setCurrentModalIdx(0);
                                }
                              }
                            };
                            reader.readAsBinaryString(file);
                          }
                        };
                        input.click();
                      }}
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
                  )}
                </div>
                {bulkValidationError && (
                  <div className="mb-4 p-3 bg-red-100 text-red-700 rounded whitespace-pre-line">
                    {bulkValidationError}
                  </div>
                )}
                <div className="border rounded-lg p-4 mb-2 relative">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Module
                      </label>
                      <div className="w-full px-3 py-2 rounded-lg bg-gray-100 text-gray-800 border border-gray-300">
                        {modal.formData.module}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Sub Module
                      </label>
                      <div className="w-full px-3 py-2 rounded-lg bg-gray-100 text-gray-800 border border-gray-300">
                        {modal.formData.subModule}
                      </div>
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
                        {defectTypes.map(type => (
                          <option key={type.id} value={type.defectTypeName}>{type.defectTypeName}</option>
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
                        {severities.map(sev => (
                          <option key={sev.id} value={sev.name}>{sev.name}</option>
                        ))}
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
                    {!isEditMode && (
                      <>
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => setCurrentModalIdx(idx - 1)}
                          disabled={idx === 0}
                          style={idx === 0 ? { opacity: 0.5, pointerEvents: 'none' } : {}}
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
                                    severity: "medium",
                                    projectId: modal.formData.projectId,
                                  },
                                },
                              ]);
                              setCurrentModalIdx(modals.length);
                            } else {
                              setCurrentModalIdx(idx + 1);
                            }
                          }}
                        >
                          Next
                        </Button>
                      </>
                    )}
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
                    <Button type="submit" disabled={success}>
                      {isEditMode ? (success ? "Updated!" : "Update Test Case") : (success ? "Added!" : "Submit")}
                    </Button>
                  </div>
                </div>
              </form>
            </Modal>
          );
        })()}

      {/* View Steps Modal */}
      <Modal
        isOpen={isViewStepsModalOpen}
        onClose={() => {
          setIsViewStepsModalOpen(false);
          setViewingTestCase(null);
        }}
        title={`Test Steps - ${viewingTestCase?.testCaseId}`}
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

      {/* View Test Case Modal */}
      <Modal
        isOpen={isViewTestCaseModalOpen}
        onClose={() => {
          setIsViewTestCaseModalOpen(false);
          setViewingTestCase(null);
        }}
        title={`Test Case Details - ${viewingTestCase?.testCaseId}`}
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
                    viewingTestCase.severity || ""
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

      {/* Description View Modal */}
      <Modal
        isOpen={isDescriptionModalOpen}
        onClose={() => {
          setIsDescriptionModalOpen(false);
          setSelectedDescription("");
        }}
        title="Test Case Description"
      >
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-gray-700 whitespace-pre-wrap">
              {selectedDescription}
            </p>
          </div>
          <div className="flex justify-end">
            <Button
              variant="secondary"
              onClick={() => {
                setIsDescriptionModalOpen(false);
                setSelectedDescription("");
              }}
            >
              Close
            </Button>
          </div>
        </div>
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
        <QuickAddTestCase selectedProjectId={selectedProjectId} />
        <QuickAddDefect projectModules={projectModules} />
      </div>
    </div>
  );
};

