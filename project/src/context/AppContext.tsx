import React, { createContext, useContext, useState } from 'react';
import { Employee, Project, Defect, TestCase, Release, WorkflowItem, BenchAllocation, WorkflowStatus, StatusTransition } from '../types/index';

export interface Project {
  id: string;
  name: string;
  prefix: string;
  projectType: string;
  status: 'active' | 'inactive' | 'completed';
  startDate: string;
  endDate: string;
  manager: string;
  priority: 'high' | 'medium' | 'low';
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
  selectedProjectId: string | null;
  setSelectedProjectId: (id: string | null) => void;
  addEmployee: (employee: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>) => void;
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
  allocateEmployee: (allocation: Omit<BenchAllocation, 'id' | 'createdAt'>) => void;
  updateWorkflowStatuses: (statuses: WorkflowStatus[]) => void;
  updateTransitions: (transitions: StatusTransition[]) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [employees, setEmployees] = useState<Employee[]>([
    {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@company.com',
      phone: '+1-555-0123',
      designation: 'Senior Developer',
      experience: 5,
      joinedDate: '2020-01-15',
      skills: ['React', 'Node.js', 'TypeScript', 'MongoDB'],
      currentProjects: ['Project Alpha'],
      availability: 75,
      status: 'active',
      department: 'Engineering',
      manager: 'Jane Smith',
      createdAt: '2020-01-15T00:00:00Z',
      updatedAt: '2024-01-15T00:00:00Z',
    },
    {
      id: '2',
      firstName: 'Sarah',
      lastName: 'Wilson',
      email: 'sarah.wilson@company.com',
      phone: '+1-555-0124',
      designation: 'QA Engineer',
      experience: 3,
      joinedDate: '2021-03-10',
      skills: ['Manual Testing', 'Automation', 'Selenium', 'Jest'],
      currentProjects: [],
      availability: 100,
      status: 'active',
      department: 'Quality Assurance',
      manager: 'Mike Johnson',
      createdAt: '2021-03-10T00:00:00Z',
      updatedAt: '2024-01-15T00:00:00Z',
    },
    {
      id: '3',
      firstName: 'Michael',
      lastName: 'Brown',
      email: 'michael.brown@company.com',
      phone: '+1-555-0125',
      designation: 'UI/UX Designer',
      experience: 4,
      joinedDate: '2019-08-20',
      skills: ['Figma', 'Adobe XD', 'Sketch', 'Prototyping'],
      currentProjects: ['Project Beta', 'Project Gamma'],
      availability: 50,
      status: 'active',
      department: 'Design',
      manager: 'Lisa Davis',
      createdAt: '2019-08-20T00:00:00Z',
      updatedAt: '2024-01-15T00:00:00Z',
    },
  ]);
  
  const [projects, setProjects] = useState<Project[]>([
    {
      id: '2',
      name: 'Mobile Banking App',
      description: 'Secure banking application for iOS and Android',
      status: 'active',
      startDate: '2024-02-01',
      manager: 'Sarah Johnson',
      priority: 'high',
      teamMembers: [],
      createdAt: '2024-02-01T00:00:00Z'
    },
    {
      id: '3',
      name: 'Inventory Management',
      description: 'Enterprise inventory tracking system',
      status: 'completed',
      startDate: '2023-09-01',
      manager: 'Mike Brown',
      priority: 'medium',
      teamMembers: [],
      createdAt: '2023-09-01T00:00:00Z'
    }
  ]);
  
  const [defects, setDefects] = useState<Defect[]>([
    // Mobile Banking App Defects
    {
      id: 'D004',
      title: 'Data not encrypted in transit',
      description: 'Sensitive data visible in network traffic during transmission',
      status: 'open',
      severity: 'critical',
      priority: 'critical',
      projectId: '2',
      module: 'Security',
      subModule: 'Encryption',
      type: 'bug',
      reportedBy: 'Security Team',
      createdAt: '2024-03-04',
      testCaseId: 'TC005',
      updatedAt: '2024-03-04T00:00:00Z'
    },
    {
      id: 'D005',
      title: 'UI elements misaligned on iPhone 12',
      description: 'UI elements are misaligned on iPhone 12 device',
      status: 'in-progress',
      severity: 'medium',
      priority: 'medium',
      projectId: '2',
      module: 'UI',
      subModule: 'Responsive Design',
      type: 'bug',
      reportedBy: 'QA Team',
      createdAt: '2024-03-05',
      testCaseId: 'TC006',
      updatedAt: '2024-03-05T00:00:00Z'
    },
    {
      id: 'D006',
      title: 'Fund transfer fails for large amounts',
      description: 'Fund transfer fails when amount exceeds $10,000',
      status: 'open',
      severity: 'high',
      priority: 'high',
      projectId: '2',
      module: 'Transaction',
      subModule: 'Transfer',
      type: 'bug',
      reportedBy: 'QA Team',
      createdAt: '2024-03-06',
      testCaseId: 'TC007',
      updatedAt: '2024-03-06T00:00:00Z'
    },

    // Inventory Management Defects
    {
      id: 'D007',
      title: 'Database connection timeout',
      description: 'Database connection times out during high load',
      status: 'in-progress',
      severity: 'high',
      priority: 'high',
      projectId: '3',
      module: 'Database',
      subModule: 'CRUD Operations',
      type: 'bug',
      reportedBy: 'DevOps Team',
      createdAt: '2024-03-07',
      testCaseId: 'TC008',
      updatedAt: '2024-03-07T00:00:00Z'
    },
    {
      id: 'D008',
      title: 'Report generation slow for large datasets',
      description: 'Report generation takes more than 5 minutes for datasets with 10,000+ records',
      status: 'open',
      severity: 'medium',
      priority: 'medium',
      projectId: '3',
      module: 'Reporting',
      subModule: 'Analytics',
      type: 'bug',
      reportedBy: 'QA Team',
      createdAt: '2024-03-08',
      testCaseId: 'TC009',
      updatedAt: '2024-03-08T00:00:00Z'
    }
  ]);

  const [testCases, setTestCases] = useState<TestCase[]>([
    // Mobile Banking App Test Cases
    {
      id: 'TC-AUT-BIO-0001',
      module: 'Authentication',
      subModule: 'Biometric Login',
      description: 'Verify that users can log in using biometric authentication',
      steps: 'Open the mobile banking app\nSelect biometric login option\nAuthenticate using fingerprint/face ID\nVerify successful login and redirection to dashboard',
      type: 'functional',
      severity: 'high',
      status: 'active',
      projectId: '2'
    },
    {
      id: 'TC-AUT-BIO-0002',
      module: 'Authentication',
      subModule: 'Biometric Login',
      description: 'Verify fallback to PIN login when biometric authentication fails',
      steps: 'Open the mobile banking app\nSelect biometric login option\nFail biometric authentication 3 times\nVerify fallback to PIN login screen\nEnter correct PIN\nVerify successful login',
      type: 'functional',
      severity: 'high',
      status: 'active',
      projectId: '2'
    },
    {
      id: 'TC-AUT-PIN-0001',
      module: 'Authentication',
      subModule: 'PIN Login',
      description: 'Test PIN login security features',
      steps: 'Enter incorrect PIN 3 times\nVerify account lockout\nWait for lockout period\nEnter correct PIN\nVerify successful login',
      type: 'functional',
      severity: 'critical',
      status: 'active',
      projectId: '2'
    },
    {
      id: 'TC-AUT-PIN-0002',
      module: 'Authentication',
      subModule: 'PIN Login',
      description: 'Verify PIN change functionality',
      steps: 'Log in to the app\nNavigate to security settings\nSelect change PIN option\nEnter current PIN\nEnter new PIN twice\nVerify PIN change confirmation',
      type: 'functional',
      severity: 'high',
      status: 'active',
      projectId: '2'
    },
    {
      id: 'TC-AUT-PAS-0001',
      module: 'Authentication',
      subModule: 'Password Reset',
      description: 'Test password reset request process',
      steps: 'Click forgot password link\nEnter registered email address\nVerify OTP sent to email\nEnter OTP\nSet new password\nVerify password change confirmation',
      type: 'functional',
      severity: 'high',
      status: 'active',
      projectId: '2'
    },
    {
      id: 'TC-AUT-PAS-0002',
      module: 'Authentication',
      subModule: 'Password Reset',
      description: 'Verify password strength requirements',
      steps: 'Initiate password reset\nEnter weak password (less than 8 characters)\nVerify error message\nEnter password without special character\nVerify error message\nEnter strong password meeting all requirements\nVerify acceptance',
      type: 'functional',
      severity: 'high',
      status: 'active',
      projectId: '2'
    },
    {
      id: 'TC-AUT-SES-0001',
      module: 'Authentication',
      subModule: 'Session Management',
      description: 'Verify session timeout functionality',
      steps: 'Log in to the app\nLeave app idle for 5 minutes\nAttempt to perform an action\nVerify session timeout message\nVerify redirection to login screen',
      type: 'functional',
      severity: 'high',
      status: 'active',
      projectId: '2'
    },
    {
      id: 'TC-AUT-SES-0002',
      module: 'Authentication',
      subModule: 'Session Management',
      description: 'Test session handling across multiple devices',
      steps: 'Log in on first device\nLog in on second device\nVerify session status on first device\nPerform action on second device\nVerify session remains active on both devices',
      type: 'functional',
      severity: 'medium',
      status: 'active',
      projectId: '2'
    },
    {
      id: 'TC-ACC-OVE-0003',
      module: 'Account Management',
      subModule: 'Account Overview',
      description: 'Verify account overview displays correct information',
      steps: 'Log in to the app\nNavigate to account overview\nVerify account balance display\nCheck recent transactions list\nVerify account details accuracy',
      type: 'functional',
      severity: 'high',
      status: 'active',
      projectId: '2'
    },
    {
      id: 'TC-TRA-QUI-0004',
      module: 'Money Transfer',
      subModule: 'Quick Transfer',
      description: 'Test quick transfer feature between accounts',
      steps: 'Select quick transfer option\nChoose source and destination accounts\nEnter transfer amount\nConfirm transfer\nVerify transaction completion',
      type: 'functional',
      severity: 'critical',
      status: 'active',
      projectId: '2'
    },
    {
      id: 'TC-BIL-LIS-0005',
      module: 'Bill Payments',
      subModule: 'Bill List',
      description: 'Verify bill list management functionality',
      steps: 'Navigate to bill payments section\nAdd new biller\nVerify biller details\nCheck bill list display\nTest bill payment process',
      type: 'functional',
      severity: 'high',
      status: 'active',
      projectId: '2'
    },
    {
      id: 'TC-SEC-2FA-0006',
      module: 'Security Features',
      subModule: 'Two-Factor Auth',
      description: 'Test two-factor authentication process',
      steps: 'Enable 2FA in security settings\nLog out and attempt login\nEnter primary credentials\nEnter 2FA code\nVerify successful authentication',
      type: 'functional',
      severity: 'critical',
      status: 'active',
      projectId: '2'
    },
    {
      id: 'TC-SUP-CHT-0007',
      module: 'Customer Support',
      subModule: 'Chat Support',
      description: 'Verify in-app chat support features',
      steps: 'Access customer support section\nInitiate chat session\nSend test message\nVerify message delivery\nCheck response handling',
      type: 'functional',
      severity: 'medium',
      status: 'active',
      projectId: '2'
    },
    {
      id: 'TC-AUT-PIN-0003',
      module: 'Authentication',
      subModule: 'PIN Login',
      description: 'Verify PIN length requirements and validation',
      steps: 'Navigate to PIN change screen\nEnter PIN with less than 6 digits\nVerify error message for short PIN\nEnter PIN with more than 6 digits\nVerify error message for long PIN\nEnter valid 6-digit PIN\nVerify PIN acceptance',
      type: 'functional',
      severity: 'high',
      status: 'active',
      projectId: '2'
    },
    {
      id: 'TC-AUT-PIN-0004',
      module: 'Authentication',
      subModule: 'PIN Login',
      description: 'Test validation for consecutive numbers in PIN',
      steps: 'Navigate to PIN change screen\nEnter PIN with consecutive numbers (e.g., 123456)\nVerify warning message\nEnter PIN with non-consecutive numbers\nVerify PIN acceptance',
      type: 'functional',
      severity: 'medium',
      status: 'active',
      projectId: '2'
    },
    {
      id: 'TC-AUT-PIN-0005',
      module: 'Authentication',
      subModule: 'PIN Login',
      description: 'Verify PIN lockout duration and reset functionality',
      steps: 'Enter incorrect PIN 3 times\nVerify account lockout message\nWait for 15 minutes\nAttempt login with correct PIN\nVerify successful login\nEnter incorrect PIN 3 times again\nVerify new lockout period',
      type: 'functional',
      severity: 'critical',
      status: 'active',
      projectId: '2'
    },
    {
      id: 'TC-AUT-PIN-0006',
      module: 'Authentication',
      subModule: 'PIN Login',
      description: 'Test PIN reset process using OTP verification',
      steps: 'Select forgot PIN option\nEnter registered mobile number\nVerify OTP sent to mobile\nEnter received OTP\nSet new PIN\nConfirm new PIN\nVerify PIN reset confirmation',
      type: 'functional',
      severity: 'high',
      status: 'active',
      projectId: '2'
    },
    {
      id: 'TC-AUT-PIN-0007',
      module: 'Authentication',
      subModule: 'PIN Login',
      description: 'Verify that users cannot reuse previous PINs',
      steps: 'Change PIN to a new value\nLog out and log back in\nNavigate to PIN change screen\nAttempt to set previous PIN\nVerify error message\nSet different PIN\nVerify successful PIN change',
      type: 'functional',
      severity: 'high',
      status: 'active',
      projectId: '2'
    },
    {
      id: 'TC-AUT-PIN-0008',
      module: 'Authentication',
      subModule: 'PIN Login',
      description: 'Verify PIN entry field security features',
      steps: 'Navigate to PIN entry screen\nEnter PIN digits\nVerify digits are masked\nToggle show/hide PIN option\nVerify PIN visibility toggle works\nVerify PIN is masked by default after screen timeout',
      type: 'functional',
      severity: 'medium',
      status: 'active',
      projectId: '2'
    }
  ]);

  const [releases, setReleases] = useState<Release[]>([
    {
      id: 'R002',
      name: 'Mobile Banking v2.1',
      version: '2.1.0',
      description: 'Security enhancements and UI updates for mobile banking',
      projectId: '2',
      status: 'planned',
      releaseDate: '2024-04-01',
      Testcase: ['TC005', 'TC006', 'TC007'],
      features: ['Biometric login', 'Quick transfer'],
      bugFixes: ['Fixed session timeout'],
      createdAt: '2024-03-10T09:00:00Z',
    },
    {
      id: 'R003',
      name: 'Inventory v1.2',
      version: '1.2.0',
      description: 'Performance improvements and bug fixes for inventory system',
      projectId: '3',
      status: 'completed',
      releaseDate: '2024-02-15',
      Testcase: ['TC008', 'TC009'],
      features: ['Faster report generation'],
      bugFixes: ['Fixed database timeout'],
      createdAt: '2024-02-01T08:00:00Z',
    },
    // Additional mock releases (not related to E-commerce Platform)
    {
      id: 'R005',
      name: 'Mobile Banking v2.2',
      version: '2.2.0',
      description: 'Introduced bill payments and improved security',
      projectId: '2',
      status: 'in-progress',
      releaseDate: '2024-06-01',
      Testcase: ['TC012', 'TC013'],
      features: ['Bill payments', 'Enhanced 2FA'],
      bugFixes: ['Fixed PIN reset issue'],
      createdAt: '2024-05-01T11:00:00Z',
    },
    {
      id: 'R006',
      name: 'Inventory v1.3',
      version: '1.3.0',
      description: 'New analytics dashboard and bug fixes',
      projectId: '3',
      status: 'testing',
      releaseDate: '2024-07-01',
      Testcase: ['TC014', 'TC015'],
      features: ['Analytics dashboard'],
      bugFixes: ['Fixed export bug'],
      createdAt: '2024-06-01T10:00:00Z',
    }
  ]);

  const [workflowItems, setWorkflowItems] = useState<WorkflowItem[]>([]);
  const [benchAllocations, setBenchAllocations] = useState<BenchAllocation[]>([]);
  const [workflowStatuses, setWorkflowStatuses] = useState<WorkflowStatus[]>([]);
  const [transitions, setTransitions] = useState<StatusTransition[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  const addEmployee = (employeeData: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newEmployee: Employee = {
      ...employeeData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setEmployees(prev => [...prev, newEmployee]);
  };

  const updateEmployee = (id: string, employeeData: Partial<Employee>) => {
    setEmployees(prev =>
      prev.map(emp =>
        emp.id === id
          ? { ...emp, ...employeeData, updatedAt: new Date().toISOString() }
          : emp
      )
    );
  };

  const deleteEmployee = (id: string) => {
    setEmployees(prev => prev.filter(emp => emp.id !== id));
  };

  const addProject = (project: Project) => {
    setProjects(prev => [...prev, project]);
  };

  const updateProject = (project: Project) => {
    setProjects(prev => prev.map(p => p.id === project.id ? project : p));
  };

  const deleteProject = (projectId: string) => {
    setProjects(prev => prev.filter(p => p.id !== projectId));
  };

  const addDefect = (defect: Defect) => {
    setDefects(prev => [...prev, defect]);
  };

  const updateDefect = (defect: Defect) => {
    setDefects(prev => prev.map(d => d.id === defect.id ? { ...d, ...defect } : d));
  };

  const deleteDefect = (defectId: string) => {
    setDefects(prev => prev.filter(d => d.id !== defectId));
  };

  const addTestCase = (testCase: TestCase) => {
    setTestCases(prev => [...prev, testCase]);
  };

  const updateTestCase = (testCase: TestCase) => {
    setTestCases(prev => prev.map(tc => tc.id === testCase.id ? testCase : tc));
  };

  const deleteTestCase = (testCaseId: string) => {
    setTestCases(prev => prev.filter(tc => tc.id !== testCaseId));
  };

  const addRelease = (release: Release) => {
    // Implementation for adding release
  };

  const updateRelease = (release: Release) => {
    // Implementation for updating release
  };

  const deleteRelease = (releaseId: string) => {
    // Implementation for deleting release
  };

  const updateWorkflowItem = (id: string, updates: Partial<WorkflowItem>) => {
    setWorkflowItems(prev =>
      prev.map(item => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const moveTestCaseToRelease = (testCaseIds: string[], releaseId: string) => {
    // Implementation for moving test cases to a release
  };

  const allocateEmployee = (allocationData: Omit<BenchAllocation, 'id' | 'createdAt'>) => {
    // Implementation for allocating an employee
  };

  const updateWorkflowStatuses = (statuses: WorkflowStatus[]) => {
    setWorkflowStatuses(statuses);
  };

  const updateTransitions = (newTransitions: StatusTransition[]) => {
    setTransitions(newTransitions);
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
      }}
    >
      {children}
    </AppContext.Provider>
  );
};