export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'manager' | 'developer' | 'tester';
}

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  gender: 'Male' | 'Female' | 'Other';
  email: string;
  phone: string;
  designation: string;
  experience: number; // years
  joinedDate: string;
  skills: string[];
  currentProjects: string[];
  availability: number; // percentage
  status: 'active' | 'inactive' | 'on-leave';
  salary?: number;
  department: string;
  manager?: string;
  startDate?: string; // Available from date
  endDate?: string; // Available until date
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'completed';
  startDate: string;
  endDate?: string;
  manager: string;
  teamMembers: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  budget?: number;
  createdAt: string;
  prefix?: string; // Added to match mock data
  projectType?: string; // Added to match mock data
  progress?: number; // Added to match mock data
}

export interface DefectHistoryEntry {
  status: 'new' | 'open' | 'in-progress' | 'resolved' | 'closed' | 'rejected';
  changedAt: string;
  comment?: string;
}

export interface Defect {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'new' | 'open' | 'in-progress' | 'resolved' | 'closed' | 'rejected';
  projectId: string;
  assignedTo?: string;
  reportedBy: string;
  stepsToReproduce?: string[];
  environment?: string;
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
  rejectionComment?: string;
  defectHistory?: DefectHistoryEntry[];
}

export interface TestCase {
  id: string;
  description: string;
  steps: string;
  priority: 'low' | 'medium' | 'high';
  projectId: string;
  createdBy: string;
  status: 'draft' | 'active' | 'deprecated';
  category: string;
  estimatedTime?: number; // minutes
  createdAt: string;
  selected?: boolean;
  releaseId?: string;
  module?: string;
  subModule?: string;
  type?: 'functional' | 'regression' | 'smoke' | 'integration';
  severity?: 'low' | 'medium' | 'high' | 'critical';
}

export interface Release {
  id: string;
  name: string;
  version: string;
  description: string;
  projectId: string;
  status: 'planned' | 'in-progress' | 'testing' | 'released' | 'completed';
  releaseDate?: string;
  Testcase: string[]; // List of test case IDs (capital C for consistency with AppContext)
  features: string[];
  bugFixes: string[];
  createdAt: string;
}

export interface WorkflowItem {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high';
  assignedTo?: string;
  dueDate?: string;
  estimatedHours?: number;
  actualHours?: number;
  tags: string[];
  createdAt: string;
}

export interface BenchAllocation {
  id: string;
  employeeId: string;
  projectId: string;
  startDate: string;
  endDate?: string;
  allocationPercentage: number;
  role: string;
  createdAt: string;
}

export interface WorkflowStatus {
  id: string;
  name: string;
  color: string;
  description?: string;
  order: number;
}

export interface StatusTransition {
  id: string;
  fromStatus: string;
  toStatus: string;
}

export interface EmailConfig {
  id: string;
  name: string;
  smtpHost: string;
  smtpPort: number;
  username: string;
  password: string;
  fromEmail: string;
  fromName: string;
  isActive: boolean;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

// Submodule and Module types for module management
export interface Submodule {
  id: string;
  name: string;
  assignedDevs: string[];
}

export interface Module {
  projectId: number;
  moduleName: string;
  id: string;
  name: string;
  submodules: Submodule[];
  assignedDevs: string[];
}

export interface CreateModuleRequest {
  moduleName: string;
  projectId: string;
  submodules?: { name: string }[];
}

export interface CreateModuleResponse {
  success: boolean;
  message?: string;
  module?: Module;
}

export interface GetModulesResponse {
  modules: Module[];
}