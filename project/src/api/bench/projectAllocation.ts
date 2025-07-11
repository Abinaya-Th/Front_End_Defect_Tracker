import axios from "axios";

// Use VITE_BASE_URL from .env
const BASE_URL = `${import.meta.env.VITE_BASE_URL}projectAllocations`;

export interface ProjectAllocationPayload {
  projectId?: string | number;
  allocations?: Array<{
    employeeId: string | number;
    role: string;
    allocationPercent?: number;
    allocationAvailability?: number;
    startDate?: string;
    allocationStartDate?: string;
    endDate?: string;
    allocationEndDate?: string;
  }>;
  // Alternative structure for individual allocations
  employeeId?: string | number;
  role?: string;
  allocationPercent?: number;
  allocationAvailability?: number;
  startDate?: string;
  endDate?: string;
  // Snake case alternatives
  project_id?: string | number;
  employee_id?: string | number;
  allocation_percent?: number;
  start_date?: string;
  end_date?: string;
  // Nested structure alternatives
  project?: { id: string | number };
  employee?: { id: string | number };
  allocation?: {
    percent: number;
    startDate: string;
    endDate: string;
  };
  // Additional fields that might be required
  id?: string | number;
  createdBy?: string | number;
  updatedBy?: string | number;
  createdAt?: string;
  updatedAt?: string;
  status?: string;
  // Allow any additional properties
  [key: string]: any;
}

export async function postProjectAllocations(payload: ProjectAllocationPayload) {
  try {
    const response = await axios.post(BASE_URL, payload, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      withCredentials: false
    });
    return response.data;
  } catch (error) {
    console.error('Project allocation error:', error);
    if (axios.isAxiosError(error)) {
      if (error.code === 'ERR_NETWORK') {
        throw new Error('Network error - please check if the server is running');
      }
      if (error.response?.status === 0) {
        throw new Error('CORS error - server needs to allow cross-origin requests');
      }

      // Include the actual backend error message if available
      const backendMessage = error.response?.data?.message || error.response?.data?.error || error.response?.data;

      // Log the full error response for debugging
      console.error('Full error response:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.headers
      });

      throw new Error(`Server error: ${error.response?.status} - ${backendMessage || error.message}`);
    }
    throw error;
  }
}

// New: GET project allocations by ID
export async function getProjectAllocationsById(projectId: string | number) {
  try {
    const response = await axios.get(`${BASE_URL}/project/${projectId}`);
    return response.data;
  } catch (error) {
    console.error('Get project allocations error:', error);
    throw error;
  }
}

// Update a specific project allocation by allocationId
export async function updateProjectAllocation(allocationId: string | number, payload: ProjectAllocationPayload) {
  try {
    const response = await axios.put(`${BASE_URL}/${allocationId}`, payload, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      withCredentials: false
    });
    return response.data;
  } catch (error) {
    console.error('Update project allocation error:', error);
    throw error;
  }
}

// Delete a specific project allocation by allocationId
export async function deleteProjectAllocation(allocationId: string | number) {
  try {
    const response = await axios.delete(`${BASE_URL}/${allocationId}`, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      withCredentials: false
    });
    return response.data;
  } catch (error) {
    console.error('Delete project allocation error:', error);
    throw error;
  }
}

// Fetch developers with roles for a given projectId
export async function getDevelopersWithRolesByProjectId(projectId: number) {
  try {
    const response = await axios.get(`${BASE_URL}/developers/${projectId}`);
    return response.data;
  } catch (error) {
    console.error('Get developers with roles error:', error);
    throw error;
  }
}

// Allocate developer to a module
export async function allocateDeveloperToModule(moduleId: number, projectAllocationId: number) {
  try {
    const response = await axios.post(`${import.meta.env.VITE_BASE_URL}allocateModule`, {
      moduleId,
      projectAllocationId
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      withCredentials: false
    });
    return response.data;
  } catch (error) {
    console.error('Allocate developer to module error:', error);
    throw error;
  }
}

// Allocate developer to a submodule
export async function allocateDeveloperToSubModule(moduleId: number, projectAllocationId: number, subModuleId: number) {
  try {
    const response = await axios.post(`${import.meta.env.VITE_BASE_URL}allocateModule/subModule`, {
      moduleId,
      projectAllocationId,
      subModuleId
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      withCredentials: false
    });
    return response.data;
  } catch (error) {
    console.error('Allocate developer to submodule error:', error);
    throw error;
  }
} 