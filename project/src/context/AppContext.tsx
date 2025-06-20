import React, { createContext, useContext, useState } from 'react';
import { Employee, Project, Defect, TestCase, Release, WorkflowItem, BenchAllocation, WorkflowStatus, StatusTransition } from '../types';

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
      id: '1',
      name: 'E-commerce Platform',
      prefix: 'ECOM',
      description: 'Online shopping platform with payment integration',
      status: 'active',
      startDate: '2024-01-01',
      endDate: '2024-06-30',
      manager: 'John Smith',
      priority: 'high',
      projectType: 'web',
      progress: 65,
      teamMembers: [],
      createdAt: '2024-01-01T00:00:00Z'
    },
    {
      id: '2',
      name: 'Mobile Banking App',
      prefix: 'MBAP',
      description: 'Secure banking application for iOS and Android',
      status: 'active',
      startDate: '2024-02-01',
      endDate: '2024-08-31',
      manager: 'Sarah Johnson',
      priority: 'high',
      projectType: 'mobile',
      progress: 45,
      teamMembers: [],
      createdAt: '2024-02-01T00:00:00Z'
    },
    {
      id: '3',
      name: 'Inventory Management',
      prefix: 'INVM',
      description: 'Enterprise inventory tracking system',
      status: 'completed',
      startDate: '2023-09-01',
      endDate: '2024-01-31',
      manager: 'Mike Brown',
      priority: 'medium',
      projectType: 'desktop',
      progress: 100,
      teamMembers: [],
      createdAt: '2023-09-01T00:00:00Z'
    }
  ]);
  
  const [defects, setDefects] = useState<Defect[]>([
    // E-commerce Platform Defects
    {
      id: 'D001',
      title: 'Login fails with special characters in password',
      description: 'User login fails when password contains special characters like @#$%',
      status: 'open',
      severity: 'high',
      priority: 'high',
      projectId: '1',
      module: 'Authentication',
      subModule: 'Login',
      type: 'bug',
      reportedBy: 'QA Team',
      createdAt: '2024-03-01',
      testCaseId: 'TC001'
    },
    {
      id: 'D002',
      title: 'Payment gateway timeout after 30 seconds',
      description: 'Payment gateway times out after 30 seconds of inactivity',
      status: 'in-progress',
      severity: 'critical',
      priority: 'high',
      projectId: '1',
      module: 'Payment',
      subModule: 'Checkout',
      type: 'bug',
      reportedBy: 'QA Team',
      createdAt: '2024-03-02',
      testCaseId: 'TC002'
    },
    {
      id: 'D003',
      title: 'Product search not working with special characters',
      description: 'Product search fails when search term contains special characters',
      status: 'open',
      severity: 'medium',
      priority: 'medium',
      projectId: '1',
      module: 'Product',
      subModule: 'Search',
      type: 'bug',
      reportedBy: 'QA Team',
      createdAt: '2024-03-03',
      testCaseId: 'TC003'
    },

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
      type: 'security',
      reportedBy: 'Security Team',
      createdAt: '2024-03-04',
      testCaseId: 'TC005'
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
      type: 'ui',
      reportedBy: 'QA Team',
      createdAt: '2024-03-05',
      testCaseId: 'TC006'
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
      testCaseId: 'TC007'
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
      testCaseId: 'TC008'
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
      type: 'performance',
      reportedBy: 'QA Team',
      createdAt: '2024-03-08',
      testCaseId: 'TC009'
    }
  ]);

  const [testCases, setTestCases] = useState<TestCase[]>([
    // E-commerce Platform Test Cases
    {
      id: 'TC001',
      module: 'Authentication',
      subModule: 'Login',
      description: 'Verify user login functionality with valid credentials',
      steps: [
        'Navigate to login page',
        'Enter valid email and password',
        'Click login button',
        'Verify successful login and redirection'
      ],
      type: 'functional',
      severity: 'high',
      status: 'active',
      projectId: '1',
      releaseId: 'R001'
    },
    {
      id: 'TC002',
      module: 'Payment',
      subModule: 'Checkout',
      description: 'Test payment gateway integration with multiple payment methods',
      steps: [
        'Add items to cart',
        'Proceed to checkout',
        'Select payment method',
        'Enter payment details',
        'Verify transaction completion'
      ],
      type: 'integration',
      severity: 'critical',
      status: 'active',
      projectId: '1',
      releaseId: 'R001'
    },
    // Mobile Banking App Test Cases
    {
      id: 'TC-AUT-BIO-0001',
      title: 'Biometric Login Validation',
      module: 'Authentication',
      subModule: 'Biometric Login',
      description: 'Verify that users can log in using biometric authentication',
      steps: [
        'Open the mobile banking app',
        'Select biometric login option',
        'Authenticate using fingerprint/face ID',
        'Verify successful login and redirection to dashboard'
      ],
      expectedResult: 'User should be successfully logged in using biometric authentication',
      actualResult: '',
      type: 'functional',
      severity: 'high',
      status: 'active',
      projectId: '2'
    },
    {
      id: 'TC-AUT-BIO-0002',
      title: 'Biometric Login Fallback',
      module: 'Authentication',
      subModule: 'Biometric Login',
      description: 'Verify fallback to PIN login when biometric authentication fails',
      steps: [
        'Open the mobile banking app',
        'Select biometric login option',
        'Fail biometric authentication 3 times',
        'Verify fallback to PIN login screen',
        'Enter correct PIN',
        'Verify successful login'
      ],
      expectedResult: 'System should fallback to PIN login after 3 failed biometric attempts',
      actualResult: '',
      type: 'functional',
      severity: 'high',
      status: 'active',
      projectId: '2'
    },
    {
      id: 'TC-AUT-PIN-0001',
      title: 'PIN Login Security',
      module: 'Authentication',
      subModule: 'PIN Login',
      description: 'Test PIN login security features',
      steps: [
        'Enter incorrect PIN 3 times',
        'Verify account lockout',
        'Wait for lockout period',
        'Enter correct PIN',
        'Verify successful login'
      ],
      expectedResult: 'Account should be locked after 3 failed attempts and unlocked after waiting period',
      actualResult: '',
      type: 'functional',
      severity: 'critical',
      status: 'active',
      projectId: '2'
    },
    {
      id: 'TC-AUT-PIN-0002',
      title: 'PIN Change Process',
      module: 'Authentication',
      subModule: 'PIN Login',
      description: 'Verify PIN change functionality',
      steps: [
        'Log in to the app',
        'Navigate to security settings',
        'Select change PIN option',
        'Enter current PIN',
        'Enter new PIN twice',
        'Verify PIN change confirmation'
      ],
      expectedResult: 'PIN should be changed successfully with proper validation',
      actualResult: '',
      type: 'functional',
      severity: 'high',
      status: 'active',
      projectId: '2'
    },
    {
      id: 'TC-AUT-PAS-0001',
      title: 'Password Reset Request',
      module: 'Authentication',
      subModule: 'Password Reset',
      description: 'Test password reset request process',
      steps: [
        'Click forgot password link',
        'Enter registered email address',
        'Verify OTP sent to email',
        'Enter OTP',
        'Set new password',
        'Verify password change confirmation'
      ],
      expectedResult: 'Password reset process should complete successfully with email verification',
      actualResult: '',
      type: 'functional',
      severity: 'high',
      status: 'active',
      projectId: '2'
    },
    {
      id: 'TC-AUT-PAS-0002',
      title: 'Password Strength Validation',
      module: 'Authentication',
      subModule: 'Password Reset',
      description: 'Verify password strength requirements',
      steps: [
        'Initiate password reset',
        'Enter weak password (less than 8 characters)',
        'Verify error message',
        'Enter password without special character',
        'Verify error message',
        'Enter strong password meeting all requirements',
        'Verify acceptance'
      ],
      expectedResult: 'System should enforce password strength requirements',
      actualResult: '',
      type: 'functional',
      severity: 'high',
      status: 'active',
      projectId: '2'
    },
    {
      id: 'TC-AUT-SES-0001',
      title: 'Session Timeout',
      module: 'Authentication',
      subModule: 'Session Management',
      description: 'Verify session timeout functionality',
      steps: [
        'Log in to the app',
        'Leave app idle for 5 minutes',
        'Attempt to perform an action',
        'Verify session timeout message',
        'Verify redirection to login screen'
      ],
      expectedResult: 'Session should timeout after 5 minutes of inactivity',
      actualResult: '',
      type: 'functional',
      severity: 'high',
      status: 'active',
      projectId: '2'
    },
    {
      id: 'TC-AUT-SES-0002',
      title: 'Multiple Device Session',
      module: 'Authentication',
      subModule: 'Session Management',
      description: 'Test session handling across multiple devices',
      steps: [
        'Log in on first device',
        'Log in on second device',
        'Verify session status on first device',
        'Perform action on second device',
        'Verify session remains active on both devices'
      ],
      expectedResult: 'System should maintain separate sessions for different devices',
      actualResult: '',
      type: 'functional',
      severity: 'medium',
      status: 'active',
      projectId: '2'
    },
    {
      id: 'TC-ACC-OVE-0003',
      title: 'Account Overview Display',
      module: 'Account Management',
      subModule: 'Account Overview',
      description: 'Verify account overview displays correct information',
      steps: [
        'Log in to the app',
        'Navigate to account overview',
        'Verify account balance display',
        'Check recent transactions list',
        'Verify account details accuracy'
      ],
      expectedResult: 'Account overview should display accurate balance and recent transactions',
      actualResult: '',
      type: 'functional',
      severity: 'high',
      status: 'active',
      projectId: '2'
    },
    {
      id: 'TC-TRA-QUI-0004',
      title: 'Quick Transfer Functionality',
      module: 'Money Transfer',
      subModule: 'Quick Transfer',
      description: 'Test quick transfer feature between accounts',
      steps: [
        'Select quick transfer option',
        'Choose source and destination accounts',
        'Enter transfer amount',
        'Confirm transfer',
        'Verify transaction completion'
      ],
      expectedResult: 'Transfer should be completed successfully with correct amount',
      actualResult: '',
      type: 'functional',
      severity: 'critical',
      status: 'active',
      projectId: '2'
    },
    {
      id: 'TC-BIL-LIS-0005',
      title: 'Bill List Management',
      module: 'Bill Payments',
      subModule: 'Bill List',
      description: 'Verify bill list management functionality',
      steps: [
        'Navigate to bill payments section',
        'Add new biller',
        'Verify biller details',
        'Check bill list display',
        'Test bill payment process'
      ],
      expectedResult: 'Bill list should be managed correctly with accurate biller information',
      actualResult: '',
      type: 'functional',
      severity: 'high',
      status: 'active',
      projectId: '2'
    },
    {
      id: 'TC-SEC-2FA-0006',
      title: 'Two-Factor Authentication',
      module: 'Security Features',
      subModule: 'Two-Factor Auth',
      description: 'Test two-factor authentication process',
      steps: [
        'Enable 2FA in security settings',
        'Log out and attempt login',
        'Enter primary credentials',
        'Enter 2FA code',
        'Verify successful authentication'
      ],
      expectedResult: '2FA should provide additional security layer during login',
      actualResult: '',
      type: 'functional',
      severity: 'critical',
      status: 'active',
      projectId: '2'
    },
    {
      id: 'TC-SUP-CHT-0007',
      title: 'Chat Support Functionality',
      module: 'Customer Support',
      subModule: 'Chat Support',
      description: 'Verify in-app chat support features',
      steps: [
        'Access customer support section',
        'Initiate chat session',
        'Send test message',
        'Verify message delivery',
        'Check response handling'
      ],
      expectedResult: 'Chat support should provide real-time communication with support team',
      actualResult: '',
      type: 'functional',
      severity: 'medium',
      status: 'active',
      projectId: '2'
    },
    {
      id: 'TC-AUT-PIN-0003',
      title: 'PIN Length Validation',
      module: 'Authentication',
      subModule: 'PIN Login',
      description: 'Verify PIN length requirements and validation',
      steps: [
        'Navigate to PIN change screen',
        'Enter PIN with less than 6 digits',
        'Verify error message for short PIN',
        'Enter PIN with more than 6 digits',
        'Verify error message for long PIN',
        'Enter valid 6-digit PIN',
        'Verify PIN acceptance'
      ],
      expectedResult: 'System should enforce 6-digit PIN requirement',
      actualResult: '',
      type: 'functional',
      severity: 'high',
      status: 'active',
      projectId: '2'
    },
    {
      id: 'TC-AUT-PIN-0004',
      title: 'Consecutive Numbers PIN',
      module: 'Authentication',
      subModule: 'PIN Login',
      description: 'Test validation for consecutive numbers in PIN',
      steps: [
        'Navigate to PIN change screen',
        'Enter PIN with consecutive numbers (e.g., 123456)',
        'Verify warning message',
        'Enter PIN with non-consecutive numbers',
        'Verify PIN acceptance'
      ],
      expectedResult: 'System should warn against using consecutive numbers in PIN',
      actualResult: '',
      type: 'functional',
      severity: 'medium',
      status: 'active',
      projectId: '2'
    },
    {
      id: 'TC-AUT-PIN-0005',
      title: 'PIN Lockout Duration',
      module: 'Authentication',
      subModule: 'PIN Login',
      description: 'Verify PIN lockout duration and reset functionality',
      steps: [
        'Enter incorrect PIN 3 times',
        'Verify account lockout message',
        'Wait for 15 minutes',
        'Attempt login with correct PIN',
        'Verify successful login',
        'Enter incorrect PIN 3 times again',
        'Verify new lockout period'
      ],
      expectedResult: 'Account should be locked for 15 minutes after 3 failed attempts',
      actualResult: '',
      type: 'functional',
      severity: 'critical',
      status: 'active',
      projectId: '2'
    },
    {
      id: 'TC-AUT-PIN-0006',
      title: 'PIN Reset via OTP',
      module: 'Authentication',
      subModule: 'PIN Login',
      description: 'Test PIN reset process using OTP verification',
      steps: [
        'Select forgot PIN option',
        'Enter registered mobile number',
        'Verify OTP sent to mobile',
        'Enter received OTP',
        'Set new PIN',
        'Confirm new PIN',
        'Verify PIN reset confirmation'
      ],
      expectedResult: 'PIN should be reset successfully after OTP verification',
      actualResult: '',
      type: 'functional',
      severity: 'high',
      status: 'active',
      projectId: '2'
    },
    {
      id: 'TC-AUT-PIN-0007',
      title: 'PIN History Validation',
      module: 'Authentication',
      subModule: 'PIN Login',
      description: 'Verify that users cannot reuse previous PINs',
      steps: [
        'Change PIN to a new value',
        'Log out and log back in',
        'Navigate to PIN change screen',
        'Attempt to set previous PIN',
        'Verify error message',
        'Set different PIN',
        'Verify successful PIN change'
      ],
      expectedResult: 'System should prevent reuse of previous PINs',
      actualResult: '',
      type: 'functional',
      severity: 'high',
      status: 'active',
      projectId: '2'
    },
    {
      id: 'TC-AUT-PIN-0008',
      title: 'PIN Entry Masking',
      module: 'Authentication',
      subModule: 'PIN Login',
      description: 'Verify PIN entry field security features',
      steps: [
        'Navigate to PIN entry screen',
        'Enter PIN digits',
        'Verify digits are masked',
        'Toggle show/hide PIN option',
        'Verify PIN visibility toggle works',
        'Verify PIN is masked by default after screen timeout'
      ],
      expectedResult: 'PIN digits should be masked by default with option to show/hide',
      actualResult: '',
      type: 'functional',
      severity: 'medium',
      status: 'active',
      projectId: '2'
    }
  ]);

  const [releases, setReleases] = useState<Release[]>([
    {
      id: 'R001',
      name: 'E-commerce v1.0',
      version: '1.0.0',
      description: 'Initial release with basic e-commerce features',
      projectId: '1',
      status: 'in-progress',
      releaseDate: '2024-03-15',
      TestCase: ['TC001', 'TC002', 'TC003', 'TC004']
    },
    {
      id: 'R002',
      name: 'Mobile Banking v2.1',
      version: '2.1.0',
      description: 'Security enhancements and UI updates for mobile banking',
      projectId: '2',
      status: 'planned',
      releaseDate: '2024-04-01',
      TestCase: ['TC005', 'TC006', 'TC007']
    },
    {
      id: 'R003',
      name: 'Inventory v1.2',
      version: '1.2.0',
      description: 'Performance improvements and bug fixes for inventory system',
      projectId: '3',
      status: 'completed',
      releaseDate: '2024-02-15',
      TestCase: ['TC008', 'TC009']
    }
  ]);

  const [workflowItems, setWorkflowItems] = useState<WorkflowItem[]>([]);
  const [benchAllocations, setBenchAllocations] = useState<BenchAllocation[]>([]);
  const [workflowStatuses, setWorkflowStatuses] = useState<WorkflowStatus[]>([]);
  const [transitions, setTransitions] = useState<StatusTransition[]>([]);

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
    // Implementation for adding defect
  };

  const updateDefect = (defect: Defect) => {
    // Implementation for updating defect
  };

  const deleteDefect = (defectId: string) => {
    // Implementation for deleting defect
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