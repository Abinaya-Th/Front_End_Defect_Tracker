import React, { createContext, useContext, useState } from "react";
import {
  Employee,
  Project,
  Defect,
  TestCase,
  Release,
  WorkflowItem,
  BenchAllocation,
  WorkflowStatus,
  StatusTransition,
  StatusType,
} from "../types";

export interface Project {
  id: string;
  name: string;
  prefix: string;
  projectType: string;
  status: "active" | "inactive" | "completed";
  startDate: string;
  endDate: string;
  manager: string;
  priority: "high" | "medium" | "low";
  teamMembers: string[];
  progress: number;
  description: string;
  role?: string;
  clientName?: string;
  clientCountry?: string;
  clientState?: string;
  clientEmail?: string;
  clientPhone?: string;
  address?: string;
  privileges?: {
    read: boolean;
    write: boolean;
    delete: boolean;
    admin: boolean;
    exportImport: boolean;
    manageUsers: boolean;
    viewReports: boolean;
  };
  createdAt: string;
}

interface Submodule {
  id: string;
  name: string;
  assignedDevs: string[];
}

interface Module {
  id: string;
  name: string;
  submodules: Submodule[];
  assignedDevs: string[];
}

interface ModulesByProject {
  [projectId: string]: Module[];
}

interface AppContextType {
  employees: Employee[];
  projects: Project[];
  defects: Defect[];
  testCases: TestCase[];
  releases: Release[];
  workflowItems: WorkflowItem[];
  benchAllocations: BenchAllocation[];
  workflowStatuses: WorkflowStatus[];
  transitions: StatusTransition[];
  statusTypes: StatusType[];
  selectedProjectId: string | null;
  setSelectedProjectId: (id: string | null) => void;
  addEmployee: (
    employee: Omit<Employee, "id" | "createdAt" | "updatedAt">
  ) => void;
  updateEmployee: (id: string, employee: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;
  addProject: (project: Project) => void;
  updateProject: (project: Project) => void;
  deleteProject: (projectId: string) => void;
  addDefect: (defect: Defect) => void;
  updateDefect: (defect: Defect) => void;
  deleteDefect: (defectId: string) => void;
  addTestCase: (testCase: TestCase) => void;
  updateTestCase: (testCase: TestCase) => void;
  deleteTestCase: (testCaseId: string) => void;
  addRelease: (release: Release) => void;
  updateRelease: (release: Release) => void;
  deleteRelease: (releaseId: string) => void;
  updateWorkflowItem: (id: string, updates: Partial<WorkflowItem>) => void;
  moveTestCaseToRelease: (testCaseIds: string[], releaseId: string) => void;
  allocateEmployee: (
    allocation: Omit<BenchAllocation, "id" | "createdAt">
  ) => void;
  updateWorkflowStatuses: (statuses: WorkflowStatus[]) => void;
  updateTransitions: (transitions: StatusTransition[]) => void;
  addStatusType: (statusType: Omit<StatusType, "id">) => void;
  updateStatusType: (id: string, statusType: Partial<StatusType>) => void;
  deleteStatusType: (id: string) => void;
  testCaseDefectMap: { [testCaseId: string]: string };
  setTestCaseDefectMap: React.Dispatch<
    React.SetStateAction<{ [testCaseId: string]: string }>
  >;
  modulesByProject: ModulesByProject;
  setModulesByProject: React.Dispatch<React.SetStateAction<ModulesByProject>>;
  addModule: (projectId: string, module: Module) => void;
  updateModule: (
    projectId: string,
    moduleId: string,
    updated: Partial<Module>
  ) => void;
  deleteModule: (projectId: string, moduleId: string) => void;
  addSubmodule: (
    projectId: string,
    moduleId: string,
    submodule: string
  ) => void;
  updateSubmodule: (
    projectId: string,
    moduleId: string,
    submoduleIdx: number,
    newName: string
  ) => void;
  deleteSubmodule: (
    projectId: string,
    moduleId: string,
    submoduleIdx: number
  ) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [employees, setEmployees] = useState<Employee[]>([
    {
      id: "1",
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@company.com",
      phone: "+1-555-0123",
      designation: "Senior Developer",
      experience: 5,
      joinedDate: "2020-01-15",
      skills: ["React", "Node.js", "TypeScript", "MongoDB"],
      currentProjects: ["Project Alpha"],
      availability: 75,
      status: "active",
      department: "Engineering",
      manager: "Jane Smith",
      startDate: "2024-01-01",
      endDate: "2024-12-31",
      createdAt: "2020-01-15T00:00:00Z",
      updatedAt: "2024-01-15T00:00:00Z",
    },
    {
      id: "2",
      firstName: "Sarah",
      lastName: "Wilson",
      email: "sarah.wilson@company.com",
      phone: "+1-555-0124",
      designation: "QA Engineer",
      experience: 3,
      joinedDate: "2021-03-10",
      skills: ["Manual Testing", "Automation", "Selenium", "Jest"],
      currentProjects: [],
      availability: 100,
      status: "active",
      department: "Quality Assurance",
      manager: "Mike Johnson",
      startDate: "2024-02-01",
      endDate: "2024-11-30",
      createdAt: "2021-03-10T00:00:00Z",
      updatedAt: "2024-01-15T00:00:00Z",
    },
    {
      id: "3",
      firstName: "Michael",
      lastName: "Brown",
      email: "michael.brown@company.com",
      phone: "+1-555-0125",
      designation: "UI/UX Designer",
      experience: 4,
      joinedDate: "2019-08-20",
      skills: ["Figma", "Adobe XD", "Sketch", "Prototyping"],
      currentProjects: ["Project Beta", "Project Gamma"],
      availability: 50,
      status: "active",
      department: "Design",
      manager: "Lisa Davis",
      startDate: "2024-03-01",
      endDate: "2024-10-31",
      createdAt: "2019-08-20T00:00:00Z",
      updatedAt: "2024-01-15T00:00:00Z",
    },
  ]);

  const [projects, setProjects] = useState<Project[]>([
    {
      id: "PR0001",
      name: "Mobile Banking App",
      prefix: "PR0001",
      description: "Secure banking application for iOS and Android",
      status: "active",
      startDate: "2024-02-01",
      endDate: "2024-08-31",
      manager: "Sarah Johnson",
      priority: "high",
      projectType: "mobile",
      progress: 45,
      teamMembers: [],
      createdAt: "2024-02-01T00:00:00Z",
    },
    {
      id: "PR0002",
      name: "Inventory Management",
      prefix: "INVM",
      description: "Enterprise inventory tracking system",
      status: "completed",
      startDate: "2023-09-01",
      endDate: "2024-01-31",
      manager: "Mike Brown",
      priority: "medium",
      projectType: "desktop",
      progress: 100,
      teamMembers: [],
      createdAt: "2023-09-01T00:00:00Z",
    },
    {
      id: "PR0003",
      name: "E-commerce Platform",
      prefix: "ECOM",
      description: "Online shopping platform for multiple vendors",
      status: "active",
      startDate: "2024-03-01",
      endDate: "2024-12-31",
      manager: "Priya Singh",
      priority: "high",
      projectType: "web",
      progress: 30,
      teamMembers: [],
      createdAt: "2024-03-01T00:00:00Z",
    },
    {
      id: "PR0004",
      name: "Healthcare Portal",
      prefix: "HLTH",
      description: "Patient and doctor management system",
      status: "active",
      startDate: "2024-01-15",
      endDate: "2024-10-15",
      manager: "David Lee",
      priority: "medium",
      projectType: "web",
      progress: 55,
      teamMembers: [],
      createdAt: "2024-01-15T00:00:00Z",
    },
    {
      id: "PR0005",
      name: "Learning Management System",
      prefix: "LMS",
      description: "Platform for online courses and assessments",
      status: "active",
      startDate: "2024-04-01",
      endDate: "2024-11-30",
      manager: "Emily Clark",
      priority: "high",
      projectType: "web",
      progress: 20,
      teamMembers: [],
      createdAt: "2024-04-01T00:00:00Z",
    },
    {
      id: "PR0006",
      name: "CRM Solution",
      prefix: "CRM",
      description: "Customer relationship management tool",
      status: "inactive",
      startDate: "2023-11-01",
      endDate: "2024-09-30",
      manager: "Olivia Turner",
      priority: "low",
      projectType: "desktop",
      progress: 60,
      teamMembers: [],
      createdAt: "2023-11-01T00:00:00Z",
    },
    {
      id: "PR0007",
      name: "IoT Device Dashboard",
      prefix: "IOTD",
      description: "Dashboard for monitoring IoT devices",
      status: "active",
      startDate: "2024-05-01",
      endDate: "2024-12-01",
      manager: "Carlos Martinez",
      priority: "medium",
      projectType: "web",
      progress: 10,
      teamMembers: [],
      createdAt: "2024-05-01T00:00:00Z",
    },
    {
      id: "PR0008",
      name: "Travel Booking System",
      prefix: "TRVL",
      description: "System for booking flights and hotels",
      status: "active",
      startDate: "2024-02-15",
      endDate: "2024-10-31",
      manager: "Sophia Kim",
      priority: "high",
      projectType: "web",
      progress: 40,
      teamMembers: [],
      createdAt: "2024-02-15T00:00:00Z",
    },
    {
      id: "PR0009",
      name: "Fitness Tracker App",
      prefix: "FIT",
      description: "Mobile app for tracking fitness activities",
      status: "active",
      startDate: "2024-03-10",
      endDate: "2024-09-30",
      manager: "Liam Patel",
      priority: "medium",
      projectType: "mobile",
      progress: 25,
      teamMembers: [],
      createdAt: "2024-03-10T00:00:00Z",
    },
    {
      id: "PR0010",
      name: "Event Management System",
      prefix: "EVNT",
      description: "Tool for managing events and registrations",
      status: "completed",
      startDate: "2023-06-01",
      endDate: "2024-05-31",
      manager: "Noah Brown",
      priority: "low",
      projectType: "web",
      progress: 100,
      teamMembers: [],
      createdAt: "2023-09-01T00:00:00Z",
    },
  ]);

  const [defects, setDefects] = useState<Defect[]>([
    // Mobile Banking App Defects
    {
      id: "D004",
      title: "Data not encrypted in transit",
      description:
        "Sensitive data visible in network traffic during transmission",
      status: "open",
      severity: "critical",
      priority: "critical",
      projectId: "PR0001",
      module: "Security",
      subModule: "Encryption",
      type: "bug",
      reportedBy: "Security Team",
      createdAt: "2024-03-04",
      testCaseId: "TC005",
      updatedAt: "2024-03-04T00:00:00Z",
    },
    {
      id: "D005",
      title: "UI elements misaligned on iPhone 12",
      description: "UI elements are misaligned on iPhone 12 device",
      status: "in-progress",
      severity: "medium",
      priority: "medium",
      projectId: "PR0002",
      module: "UI",
      subModule: "Responsive Design",
      type: "bug",
      reportedBy: "QA Team",
      createdAt: "2024-03-05",
      testCaseId: "TC006",
      updatedAt: "2024-03-05T00:00:00Z",
    },
    {
      id: "D006",
      title: "Fund transfer fails for large amounts",
      description: "Fund transfer fails when amount exceeds $10,000",
      status: "open",
      severity: "high",
      priority: "high",
      projectId: "PR0001",
      module: "Transaction",
      subModule: "Transfer",
      type: "bug",
      reportedBy: "QA Team",
      createdAt: "2024-03-06",
      testCaseId: "TC007",
      updatedAt: "2024-03-06T00:00:00Z",
    },

    // Inventory Management Defects
    {
      id: "D007",
      title: "Database connection timeout",
      description: "Database connection times out during high load",
      status: "in-progress",
      severity: "high",
      priority: "high",
      projectId: "PR0003",
      module: "Database",
      subModule: "CRUD Operations",
      type: "bug",
      reportedBy: "DevOps Team",
      createdAt: "2024-03-07",
      testCaseId: "TC008",
      updatedAt: "2024-03-07T00:00:00Z",
    },
    {
      id: "D008",
      title: "Report generation slow for large datasets",
      description:
        "Report generation takes more than 5 minutes for datasets with 10,000+ records",
      status: "open",
      severity: "medium",
      priority: "medium",
      projectId: "PR0003",
      module: "Reporting",
      subModule: "Analytics",
      type: "bug",
      reportedBy: "QA Team",
      createdAt: "2024-03-08",
      testCaseId: "TC009",
      updatedAt: "2024-03-08T00:00:00Z",
    },
  ]);

  const [testCases, setTestCases] = useState<TestCase[]>([
    // Mobile Banking App Test Cases
    {
      id: "TC-AUT-BIO-0001",
      module: "Authentication",
      subModule: "Biometric Login",
      description:
        "Verify that users can log in using biometric authentication",
      steps:
        "Open the mobile banking app\nSelect biometric login option\nAuthenticate using fingerprint/face ID\nVerify successful login and redirection to dashboard",
      type: "functional",
      severity: "high",
      status: "active",
      projectId: "2",
    },
    {
      id: "TC-AUT-BIO-0002",
      module: "Authentication",
      subModule: "Biometric Login",
      description:
        "Verify fallback to PIN login when biometric authentication fails",
      steps:
        "Open the mobile banking app\nSelect biometric login option\nFail biometric authentication 3 times\nVerify fallback to PIN login screen\nEnter correct PIN\nVerify successful login",
      type: "functional",
      severity: "high",
      status: "active",
      projectId: "2",
    },
    {
      id: "TC-AUT-PIN-0001",
      module: "Authentication",
      subModule: "PIN Login",
      description: "Test PIN login security features",
      steps:
        "Enter incorrect PIN 3 times\nVerify account lockout\nWait for lockout period\nEnter correct PIN\nVerify successful login",
      type: "functional",
      severity: "critical",
      status: "active",
      projectId: "2",
    },
    {
      id: "TC-AUT-PIN-0002",
      module: "Authentication",
      subModule: "PIN Login",
      description: "Verify PIN change functionality",
      steps:
        "Log in to the app\nNavigate to security settings\nSelect change PIN option\nEnter current PIN\nEnter new PIN twice\nVerify PIN change confirmation",
      type: "functional",
      severity: "high",
      status: "active",
      projectId: "2",
    },
    {
      id: "TC-AUT-PAS-0001",
      module: "Authentication",
      subModule: "Password Reset",
      description: "Test password reset request process",
      steps:
        "Click forgot password link\nEnter registered email address\nVerify OTP sent to email\nEnter OTP\nSet new password\nVerify password change confirmation",
      type: "functional",
      severity: "high",
      status: "active",
      projectId: "2",
    },
    {
      id: "TC-AUT-PAS-0002",
      module: "Authentication",
      subModule: "Password Reset",
      description: "Verify password strength requirements",
      steps:
        "Initiate password reset\nEnter weak password (less than 8 characters)\nVerify error message\nEnter password without special character\nVerify error message\nEnter strong password meeting all requirements\nVerify acceptance",
      type: "functional",
      severity: "high",
      status: "active",
      projectId: "2",
    },
    {
      id: "TC-AUT-SES-0001",
      module: "Authentication",
      subModule: "Session Management",
      description: "Verify session timeout functionality",
      steps:
        "Log in to the app\nLeave app idle for 5 minutes\nAttempt to perform an action\nVerify session timeout message\nVerify redirection to login screen",
      type: "functional",
      severity: "high",
      status: "active",
      projectId: "2",
    },
    {
      id: "TC-AUT-SES-0002",
      module: "Authentication",
      subModule: "Session Management",
      description: "Test session handling across multiple devices",
      steps:
        "Log in on first device\nLog in on second device\nVerify session status on first device\nPerform action on second device\nVerify session remains active on both devices",
      type: "functional",
      severity: "medium",
      status: "active",
      projectId: "2",
    },
    {
      id: "TC-ACC-OVE-0003",
      module: "Account Management",
      subModule: "Account Overview",
      description: "Verify account overview displays correct information",
      steps:
        "Log in to the app\nNavigate to account overview\nVerify account balance display\nCheck recent transactions list\nVerify account details accuracy",
      type: "functional",
      severity: "high",
      status: "active",
      projectId: "2",
    },
    {
      id: "TC-TRA-QUI-0004",
      module: "Money Transfer",
      subModule: "Quick Transfer",
      description: "Test quick transfer feature between accounts",
      steps:
        "Select quick transfer option\nChoose source and destination accounts\nEnter transfer amount\nConfirm transfer\nVerify transaction completion",
      type: "functional",
      severity: "critical",
      status: "active",
      projectId: "2",
    },
    {
      id: "TC-BIL-LIS-0005",
      module: "Bill Payments",
      subModule: "Bill List",
      description: "Verify bill list management functionality",
      steps:
        "Navigate to bill payments section\nAdd new biller\nVerify biller details\nCheck bill list display\nTest bill payment process",
      type: "functional",
      severity: "high",
      status: "active",
      projectId: "2",
    },
    {
      id: "TC-SEC-2FA-0006",
      module: "Security Features",
      subModule: "Two-Factor Auth",
      description: "Test two-factor authentication process",
      steps:
        "Enable 2FA in security settings\nLog out and attempt login\nEnter primary credentials\nEnter 2FA code\nVerify successful authentication",
      type: "functional",
      severity: "critical",
      status: "active",
      projectId: "2",
    },
    {
      id: "TC-SUP-CHT-0007",
      module: "Customer Support",
      subModule: "Chat Support",
      description: "Verify in-app chat support features",
      steps:
        "Access customer support section\nInitiate chat session\nSend test message\nVerify message delivery\nCheck response handling",
      type: "functional",
      severity: "medium",
      status: "active",
      projectId: "2",
    },
    {
      id: "TC-AUT-PIN-0003",
      module: "Authentication",
      subModule: "PIN Login",
      description: "Verify PIN length requirements and validation",
      steps:
        "Navigate to PIN change screen\nEnter PIN with less than 6 digits\nVerify error message for short PIN\nEnter PIN with more than 6 digits\nVerify error message for long PIN\nEnter valid 6-digit PIN\nVerify PIN acceptance",
      type: "functional",
      severity: "high",
      status: "active",
      projectId: "2",
    },
    {
      id: "TC-AUT-PIN-0004",
      module: "Authentication",
      subModule: "PIN Login",
      description: "Test validation for consecutive numbers in PIN",
      steps:
        "Navigate to PIN change screen\nEnter PIN with consecutive numbers (e.g., 123456)\nVerify warning message\nEnter PIN with non-consecutive numbers\nVerify PIN acceptance",
      type: "functional",
      severity: "medium",
      status: "active",
      projectId: "2",
    },
    {
      id: "TC-AUT-PIN-0005",
      module: "Authentication",
      subModule: "PIN Login",
      description: "Verify PIN lockout duration and reset functionality",
      steps:
        "Enter incorrect PIN 3 times\nVerify account lockout message\nWait for 15 minutes\nAttempt login with correct PIN\nVerify successful login\nEnter incorrect PIN 3 times again\nVerify new lockout period",
      type: "functional",
      severity: "critical",
      status: "active",
      projectId: "2",
    },
    {
      id: "TC-AUT-PIN-0006",
      module: "Authentication",
      subModule: "PIN Login",
      description: "Test PIN reset process using OTP verification",
      steps:
        "Select forgot PIN option\nEnter registered mobile number\nVerify OTP sent to mobile\nEnter received OTP\nSet new PIN\nConfirm new PIN\nVerify PIN reset confirmation",
      type: "functional",
      severity: "high",
      status: "active",
      projectId: "2",
    },
    {
      id: "TC-AUT-PIN-0007",
      module: "Authentication",
      subModule: "PIN Login",
      description: "Verify that users cannot reuse previous PINs",
      steps:
        "Change PIN to a new value\nLog out and log back in\nNavigate to PIN change screen\nAttempt to set previous PIN\nVerify error message\nSet different PIN\nVerify successful PIN change",
      type: "functional",
      severity: "high",
      status: "active",
      projectId: "2",
    },
    {
      id: "TC-AUT-PIN-0008",
      module: "Authentication",
      subModule: "PIN Login",
      description: "Verify PIN entry field security features",
      steps:
        "Navigate to PIN entry screen\nEnter PIN digits\nVerify digits are masked\nToggle show/hide PIN option\nVerify PIN visibility toggle works\nVerify PIN is masked by default after screen timeout",
      type: "functional",
      severity: "medium",
      status: "active",
      projectId: "2",
    },
  ]);

  const [releases, setReleases] = useState<Release[]>([
    // {
    //   id: "R002",
    //   name: "Mobile Banking v2.1",
    //   version: "2.1.0",
    //   description: "Security enhancements and UI updates for mobile banking",
    //   projectId: "2",
    //   status: "planned",
    //   releaseDate: "2024-04-01",
    //   Testcase: ["TC005", "TC006", "TC007"],
    //   features: ["Biometric login", "Quick transfer"],
    //   bugFixes: ["Fixed session timeout"],
    //   createdAt: "2024-03-10T09:00:00Z",
    // },
    // {
    //   id: "R003",
    //   name: "Inventory v1.2",
    //   version: "1.2.0",
    //   description:
    //     "Performance improvements and bug fixes for inventory system",
    //   projectId: "3",
    //   status: "completed",
    //   releaseDate: "2024-02-15",
    //   Testcase: ["TC008", "TC009"],
    //   features: ["Faster report generation"],
    //   bugFixes: ["Fixed database timeout"],
    //   createdAt: "2024-02-01T08:00:00Z",
    // },
    // // Additional mock releases (not related to E-commerce Platform)
    // {
    //   id: "R005",
    //   name: "Mobile Banking v2.2",
    //   version: "2.2.0",
    //   description: "Introduced bill payments and improved security",
    //   projectId: "2",
    //   status: "in-progress",
    //   releaseDate: "2024-06-01",
    //   Testcase: ["TC012", "TC013"],
    //   features: ["Bill payments", "Enhanced 2FA"],
    //   bugFixes: ["Fixed PIN reset issue"],
    //   createdAt: "2024-05-01T11:00:00Z",
    // },
    // {
    //   id: "R006",
    //   name: "Inventory v1.3",
    //   version: "1.3.0",
    //   description: "New analytics dashboard and bug fixes",
    //   projectId: "3",
    //   status: "testing",
    //   releaseDate: "2024-07-01",
    //   Testcase: ["TC014", "TC015"],
    //   features: ["Analytics dashboard"],
    //   bugFixes: ["Fixed export bug"],
    //   createdAt: "2024-06-01T10:00:00Z",
    // },
  ]);

  const [workflowItems, setWorkflowItems] = useState<WorkflowItem[]>([]);
  const [benchAllocations, setBenchAllocations] = useState<BenchAllocation[]>(
    []
  );
  const [workflowStatuses, setWorkflowStatuses] = useState<WorkflowStatus[]>(
    []
  );
  const [transitions, setTransitions] = useState<StatusTransition[]>([]);
  const [statusTypes, setStatusTypes] = useState<StatusType[]>([
    { id: "1", name: "NEW", color: "#2a3eb1" },
    { id: "2", name: "OPEN", color: "#9c27b0" },
    { id: "3", name: "REJECT", color: "#10B981" },
    { id: "4", name: "FIXED", color: "	#F59E0B" },
    { id: "5", name: "CLOSED", color: "#EF4444" },
    { id: "6", name: "REOPEN", color: "#06B6D4" },
    { id: "7", name: "DUPLICATE", color: "#618833" },
    { id: "8", name: "HOLD", color: "#ffeb3b" },
  ]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null
  );
  const [testCaseDefectMap, setTestCaseDefectMap] = useState<{
    [testCaseId: string]: string;
  }>({});

  // Initial modulesByProject (full object shape)
  const [modulesByProject, setModulesByProject] = useState<ModulesByProject>({
    "2": [
      {
        id: "auth",
        name: "Authentication",
        assignedDevs: [],
        submodules: [
          { id: "auth-bio", name: "Biometric Login", assignedDevs: [] },
          { id: "auth-pin", name: "PIN Login", assignedDevs: [] },
          { id: "auth-pass", name: "Password Reset", assignedDevs: [] },
          { id: "auth-session", name: "Session Management", assignedDevs: [] },
        ],
      },
      {
        id: "acc",
        name: "Account Management",
        assignedDevs: [],
        submodules: [
          { id: "acc-overview", name: "Account Overview", assignedDevs: [] },
          { id: "acc-history", name: "Transaction History", assignedDevs: [] },
          {
            id: "acc-statements",
            name: "Account Statements",
            assignedDevs: [],
          },
          { id: "acc-settings", name: "Account Settings", assignedDevs: [] },
        ],
      },
      {
        id: "tra",
        name: "Money Transfer",
        assignedDevs: [],
        submodules: [
          { id: "tra-quick", name: "Quick Transfer", assignedDevs: [] },
          { id: "tra-sched", name: "Scheduled Transfer", assignedDevs: [] },
          { id: "tra-intl", name: "International Transfer", assignedDevs: [] },
          { id: "tra-limits", name: "Transfer Limits", assignedDevs: [] },
        ],
      },
      {
        id: "bil",
        name: "Bill Payments",
        assignedDevs: [],
        submodules: [
          { id: "bil-list", name: "Bill List", assignedDevs: [] },
          { id: "bil-sched", name: "Payment Scheduling", assignedDevs: [] },
          { id: "bil-history", name: "Payment History", assignedDevs: [] },
          { id: "bil-recurring", name: "Recurring Payments", assignedDevs: [] },
        ],
      },
      {
        id: "sec",
        name: "Security Features",
        assignedDevs: [],
        submodules: [
          { id: "sec-2fa", name: "Two-Factor Auth", assignedDevs: [] },
          { id: "sec-device", name: "Device Management", assignedDevs: [] },
          { id: "sec-alerts", name: "Security Alerts", assignedDevs: [] },
          { id: "sec-fraud", name: "Fraud Protection", assignedDevs: [] },
        ],
      },
      {
        id: "sup",
        name: "Customer Support",
        assignedDevs: [],
        submodules: [
          { id: "sup-chat", name: "Chat Support", assignedDevs: [] },
          { id: "sup-faqs", name: "FAQs", assignedDevs: [] },
          { id: "sup-contact", name: "Contact Us", assignedDevs: [] },
          { id: "sup-feedback", name: "Feedback", assignedDevs: [] },
        ],
      },
    ],
    "3": [
      {
        id: "auth",
        name: "Authentication",
        assignedDevs: [],
        submodules: [
          { id: "auth-login", name: "Login", assignedDevs: [] },
          { id: "auth-reg", name: "Registration", assignedDevs: [] },
          { id: "auth-pass", name: "Password Reset", assignedDevs: [] },
        ],
      },
      {
        id: "reporting",
        name: "Reporting",
        assignedDevs: [],
        submodules: [
          { id: "reporting-analytics", name: "Analytics", assignedDevs: [] },
          { id: "reporting-exports", name: "Exports", assignedDevs: [] },
          { id: "reporting-dash", name: "Dashboards", assignedDevs: [] },
          { id: "reporting-custom", name: "Custom Reports", assignedDevs: [] },
        ],
      },
      {
        id: "data",
        name: "Data Management",
        assignedDevs: [],
        submodules: [
          { id: "data-import", name: "Data Import", assignedDevs: [] },
          { id: "data-processing", name: "Data Processing", assignedDevs: [] },
          { id: "data-export", name: "Data Export", assignedDevs: [] },
        ],
      },
      {
        id: "visualization",
        name: "Visualization",
        assignedDevs: [],
        submodules: [
          { id: "viz-charts", name: "Charts", assignedDevs: [] },
          { id: "viz-graphs", name: "Graphs", assignedDevs: [] },
          { id: "viz-widgets", name: "Widgets", assignedDevs: [] },
        ],
      },
    ],
    "4": [
      {
        id: "auth",
        name: "Authentication",
        assignedDevs: [],
        submodules: [
          { id: "auth-login", name: "Login", assignedDevs: [] },
          { id: "auth-reg", name: "Registration", assignedDevs: [] },
          { id: "auth-pass", name: "Password Reset", assignedDevs: [] },
        ],
      },
      {
        id: "content",
        name: "Content Management",
        assignedDevs: [],
        submodules: [
          { id: "content-articles", name: "Articles", assignedDevs: [] },
          { id: "content-media", name: "Media", assignedDevs: [] },
          { id: "content-categories", name: "Categories", assignedDevs: [] },
          { id: "content-templates", name: "Templates", assignedDevs: [] },
        ],
      },
      {
        id: "user",
        name: "User Management",
        assignedDevs: [],
        submodules: [
          { id: "user-profile", name: "Profile", assignedDevs: [] },
          { id: "user-settings", name: "Settings", assignedDevs: [] },
          { id: "user-permissions", name: "Permissions", assignedDevs: [] },
          { id: "user-roles", name: "Roles", assignedDevs: [] },
        ],
      },
      {
        id: "workflow",
        name: "Workflow",
        assignedDevs: [],
        submodules: [
          {
            id: "workflow-approval",
            name: "Approval Process",
            assignedDevs: [],
          },
          { id: "workflow-review", name: "Review Process", assignedDevs: [] },
          { id: "workflow-publish", name: "Publishing", assignedDevs: [] },
        ],
      },
    ],
  });

  // Module management functions (now use full object shape)
  const addModule = (projectId: string, module: Module) => {
    setModulesByProject((prev) => ({
      ...prev,
      [projectId]: prev[projectId] ? [...prev[projectId], module] : [module],
    }));
  };

  const updateModule = (
    projectId: string,
    moduleId: string,
    updated: Partial<Module>
  ) => {
    setModulesByProject((prev) => ({
      ...prev,
      [projectId]:
        prev[projectId]?.map((m) =>
          m.id === moduleId ? { ...m, ...updated } : m
        ) || [],
    }));
  };

  const deleteModule = (projectId: string, moduleId: string) => {
    setModulesByProject((prev) => ({
      ...prev,
      [projectId]: prev[projectId]?.filter((m) => m.id !== moduleId) || [],
    }));
  };

  const addSubmodule = (
    projectId: string,
    moduleId: string,
    submodule: string
  ) => {
    setModulesByProject((prev) => ({
      ...prev,
      [projectId]:
        prev[projectId]?.map((m) =>
          m.id === moduleId
            ? { ...m, submodules: [...m.submodules, submodule] }
            : m
        ) || [],
    }));
  };

  const updateSubmodule = (
    projectId: string,
    moduleId: string,
    submoduleIdx: number,
    newName: string
  ) => {
    setModulesByProject((prev) => ({
      ...prev,
      [projectId]:
        prev[projectId]?.map((m) =>
          m.id === moduleId
            ? {
              ...m,
              submodules: m.submodules.map((s, i) =>
                i === submoduleIdx ? newName : s
              ),
            }
            : m
        ) || [],
    }));
  };

  const deleteSubmodule = (
    projectId: string,
    moduleId: string,
    submoduleIdx: number
  ) => {
    setModulesByProject((prev) => ({
      ...prev,
      [projectId]:
        prev[projectId]?.map((m) =>
          m.id === moduleId
            ? {
              ...m,
              submodules: m.submodules.filter((_, i) => i !== submoduleIdx),
            }
            : m
        ) || [],
    }));
  };

  const addEmployee = (
    employeeData: Omit<Employee, "id" | "createdAt" | "updatedAt">
  ) => {
    const newEmployee: Employee = {
      ...employeeData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setEmployees((prev) => [...prev, newEmployee]);
  };

  const updateEmployee = (id: string, employeeData: Partial<Employee>) => {
    setEmployees((prev) =>
      prev.map((emp) =>
        emp.id === id
          ? { ...emp, ...employeeData, updatedAt: new Date().toISOString() }
          : emp
      )
    );
  };

  const deleteEmployee = (id: string) => {
    setEmployees((prev) => prev.filter((emp) => emp.id !== id));
  };

  const addProject = (project: Project) => {
    setProjects((prev) => [project, ...prev]);
  };

  const updateProject = (project: Project) => {
    setProjects((prev) => prev.map((p) => (p.id === project.id ? project : p)));
  };

  const deleteProject = (projectId: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== projectId));
  };

  const addDefect = (defect: Defect) => {
    setDefects((prev) => [...prev, defect]);
  };

  const updateDefect = (defect: Defect) => {
    setDefects((prev) => prev.map((d) => (d.id === defect.id ? defect : d)));
  };

  const deleteDefect = (defectId: string) => {
    setDefects((prev) => prev.filter((d) => d.id !== defectId));
  };

  const addTestCase = (testCase: TestCase) => {
    setTestCases((prev) => [...prev, testCase]);
  };

  const updateTestCase = (testCase: TestCase) => {
    setTestCases((prev) =>
      prev.map((tc) => (tc.id === testCase.id ? testCase : tc))
    );
  };

  const deleteTestCase = (testCaseId: string) => {
    setTestCases((prev) => prev.filter((tc) => tc.id !== testCaseId));
  };

  const addRelease = (release: Release) => {
    // Implementation for adding release
    setReleases((prev) => [...prev, release]);
  };

  const updateRelease = (release: Release) => {
    // Implementation for updating release
  };

  const deleteRelease = (releaseId: string) => {
    // Implementation for deleting release
  };

  const updateWorkflowItem = (id: string, updates: Partial<WorkflowItem>) => {
    setWorkflowItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const moveTestCaseToRelease = (testCaseIds: string[], releaseId: string) => {
    // Implementation for moving test cases to a release
  };

  const allocateEmployee = (
    allocationData: Omit<BenchAllocation, "id" | "createdAt">
  ) => {
    // Implementation for allocating an employee
  };

  const updateWorkflowStatuses = (statuses: WorkflowStatus[]) => {
    setWorkflowStatuses(statuses);
  };

  const updateTransitions = (newTransitions: StatusTransition[]) => {
    setTransitions(newTransitions);
  };

  const addStatusType = (statusTypeData: Omit<StatusType, "id">) => {
    const newStatusType: StatusType = {
      ...statusTypeData,
      id: Date.now().toString(),
    };
    setStatusTypes((prev) => [...prev, newStatusType]);
  };

  const updateStatusType = (
    id: string,
    statusTypeData: Partial<StatusType>
  ) => {
    setStatusTypes((prev) =>
      prev.map((status) =>
        status.id === id ? { ...status, ...statusTypeData } : status
      )
    );
  };

  const deleteStatusType = (id: string) => {
    setStatusTypes((prev) => prev.filter((status) => status.id !== id));
  };

  return (
    <AppContext.Provider
      value={{
        employees,
        projects,
        defects,
        testCases,
        releases,
        workflowItems,
        benchAllocations,
        workflowStatuses,
        transitions,
        statusTypes,
        selectedProjectId,
        setSelectedProjectId,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        addProject,
        updateProject,
        deleteProject,
        addDefect,
        updateDefect,
        deleteDefect,
        addTestCase,
        updateTestCase,
        deleteTestCase,
        addRelease,
        updateRelease,
        deleteRelease,
        updateWorkflowItem,
        moveTestCaseToRelease,
        allocateEmployee,
        updateWorkflowStatuses,
        updateTransitions,
        addStatusType,
        updateStatusType,
        deleteStatusType,
        testCaseDefectMap,
        setTestCaseDefectMap,
        modulesByProject,
        setModulesByProject,
        addModule,
        updateModule,
        deleteModule,
        addSubmodule,
        updateSubmodule,
        deleteSubmodule,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
