import axios from 'axios';

export interface QAAllocationData {
  releaseId: string;
  projectId: string;
  allocations: {
    qaId: string;
    qaName: string;
    testCaseIds: string[];
  }[];
}

export const saveQAAllocation = async (allocationData: QAAllocationData) => {
  try {
    const response = await axios.post(
      'http://192.168.1.99:8083/api/v1/qa-allocations/save',
      allocationData,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.message || 
      error?.message || 
      'Failed to save QA allocation'
    );
  }
};

export const getQAAllocationsByRelease = async (releaseId: string) => {
  try {
    const response = await axios.get(
      `http://192.168.1.99:8083/api/v1/qa-allocations/release/${releaseId}`
    );
    return response.data;
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.message || 
      error?.message || 
      'Failed to fetch QA allocations'
    );
  }
}; 