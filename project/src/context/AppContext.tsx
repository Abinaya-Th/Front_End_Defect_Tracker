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
  moveTestCasesToRelease: (testCaseIds: string[], releaseId: string) => void;
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
      description: 'Online shopping platform with payment integration',
      status: 'in-progress',
      startDate: '2024-01-01',
      endDate: '2024-06-30',
      manager: 'John Smith',
      priority: 'high',
      projectType: 'web',
      progress: 65
    },
    {
      id: '2',
      name: 'Mobile Banking App',
      description: 'Secure banking application for iOS and Android',
      status: 'active',
      startDate: '2024-02-01',
      endDate: '2024-08-31',
      manager: 'Sarah Johnson',
      priority: 'critical',
      projectType: 'mobile',
      progress: 45
    },
    {
      id: '3',
      name: 'Inventory Management',
      description: 'Enterprise inventory tracking system',
      status: 'completed',
      startDate: '2023-09-01',
      endDate: '2024-01-31',
      manager: 'Mike Brown',
      priority: 'medium',
      projectType: 'desktop',
      progress: 100
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
    {
      id: 'TC003',
      module: 'Product',
      subModule: 'Search',
      description: 'Verify product search functionality with filters',
      steps: [
        'Enter search term',
        'Apply category filter',
        'Apply price range filter',
        'Verify search results'
      ],
      type: 'functional',
      severity: 'medium',
      status: 'active',
      projectId: '1',
      releaseId: 'R001'
    },
    {
      id: 'TC004',
      module: 'Cart',
      subModule: 'Management',
      description: 'Test shopping cart operations',
      steps: [
        'Add items to cart',
        'Update quantities',
        'Remove items',
        'Verify total calculation'
      ],
      type: 'functional',
      severity: 'high',
      status: 'active',
      projectId: '1',
      releaseId: 'R001'
    },

    // Mobile Banking App Test Cases
    {
      id: 'TC005',
      module: 'Security',
      subModule: 'Encryption',
      description: 'Verify data encryption during transmission',
      steps: [
        'Submit sensitive data',
        'Check network traffic',
        'Verify encryption protocol',
        'Validate data integrity'
      ],
      type: 'security',
      severity: 'critical',
      status: 'active',
      projectId: '2',
      releaseId: 'R002'
    },
    {
      id: 'TC006',
      module: 'UI',
      subModule: 'Responsive Design',
      description: 'Test responsive layout across different devices',
      steps: [
        'Open on different screen sizes',
        'Check layout adaptation',
        'Verify content visibility',
        'Test touch interactions'
      ],
      type: 'ui',
      severity: 'medium',
      status: 'active',
      projectId: '2',
      releaseId: 'R002'
    },
    {
      id: 'TC007',
      module: 'Transaction',
      subModule: 'Transfer',
      description: 'Verify fund transfer functionality',
      steps: [
        'Select recipient',
        'Enter amount',
        'Add transfer note',
        'Confirm transaction',
        'Verify confirmation'
      ],
      type: 'functional',
      severity: 'critical',
      status: 'active',
      projectId: '2',
      releaseId: 'R002'
    },

    // Inventory Management Test Cases
    {
      id: 'TC008',
      module: 'Database',
      subModule: 'CRUD Operations',
      description: 'Test database operations for inventory items',
      steps: [
        'Create new inventory item',
        'Read existing item details',
        'Update item information',
        'Delete item record'
      ],
      type: 'functional',
      severity: 'high',
      status: 'active',
      projectId: '3',
      releaseId: 'R003'
    },
    {
      id: 'TC009',
      module: 'Reporting',
      subModule: 'Analytics',
      description: 'Verify inventory analytics and reporting',
      steps: [
        'Generate stock level report',
        'Check reorder suggestions',
        'Verify trend analysis',
        'Export report data'
      ],
      type: 'functional',
      severity: 'medium',
      status: 'active',
      projectId: '3',
      releaseId: 'R003'
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
      testCases: ['TC001', 'TC002', 'TC003', 'TC004']
    },
    {
      id: 'R002',
      name: 'Mobile Banking v2.1',
      version: '2.1.0',
      description: 'Security enhancements and UI updates for mobile banking',
      projectId: '2',
      status: 'planned',
      releaseDate: '2024-04-01',
      testCases: ['TC005', 'TC006', 'TC007']
    },
    {
      id: 'R003',
      name: 'Inventory v1.2',
      version: '1.2.0',
      description: 'Performance improvements and bug fixes for inventory system',
      projectId: '3',
      status: 'completed',
      releaseDate: '2024-02-15',
      testCases: ['TC008', 'TC009']
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
    // Implementation for adding test case
  };

  const updateTestCase = (testCase: TestCase) => {
    // Implementation for updating test case
  };

  const deleteTestCase = (testCaseId: string) => {
    // Implementation for deleting test case
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

  const moveTestCasesToRelease = (testCaseIds: string[], releaseId: string) => {
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
        moveTestCasesToRelease,
        allocateEmployee,
        updateWorkflowStatuses,
        updateTransitions,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};