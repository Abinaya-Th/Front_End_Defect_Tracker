export interface Project {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'completed';
  startDate: string;
  endDate: string;
  role?: string;
  manager: string;
  teamMembers: string[];
  progress?: number;
  description: string;
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

export interface ProjectFormData {
  name: string;
  status: 'active' | 'inactive' | 'completed';
  startDate: string;
  endDate: string;
  role: string;
  manager: string;
  clientName: string;
  clientCountry: string;
  clientState: string;
  clientEmail: string;
  clientPhone: string;
  address: string;
  description: string;
  privileges: {
    read: boolean;
    write: boolean;
    delete: boolean;
    admin: boolean;
    exportImport: boolean;
    manageUsers: boolean;
    viewReports: boolean;
  };
}

export interface Defect {
  id: string;
  title: string;
  description: string;
  module: string;
  subModule: string;
  type: 'bug' | 'test-failure' | 'enhancement';
  priority: 'low' | 'medium' | 'high' | 'critical';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in-progress' | 'resolved' | 'closed' | 'rejected';
  projectId: string;
  releaseId?: string;
  testCaseId?: string;
  assignedTo?: string;
  reportedBy: string;
  createdAt: string;
  updatedAt: string;
  rejectionComment?: string;
}

export interface StatusType {
  id: string;
  name: string;
  color: string;
}

// ... rest of the types ... 