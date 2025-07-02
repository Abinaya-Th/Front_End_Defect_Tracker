import axios from "axios";

let BASE_URL = import.meta.env.VITE_BASE_URL || "http://34.57.197.188:8087/api/v1";
if (BASE_URL.endsWith("/")) {
    BASE_URL = BASE_URL.slice(0, -1);
}

export interface CreateTestCaseRequest {
    testcase: string;
    description: string;
    steps: string;
    submoduleId: number;
    moduleId: number;
    projectId: number;
    severityId: number;
    defectTypeId: number;
    userId?: number; // Optional, will be set from auth context
}

export interface CreateTestCaseResponse {
    status: string;
    message: string;
    data: {
        id: number;
        testcaseId: string;
        testcase: string;
        description: string;
        steps: string;
        submoduleId: number;
        moduleId: number;
        projectId: number;
        severityId: number;
        defectTypeId: number;
        userId: number;
        createdAt: string;
        updatedAt: string;
    };
    statusCode: number;
}

export const createTestCase = async (testCaseData: CreateTestCaseRequest): Promise<CreateTestCaseResponse> => {
    try {
        // Add default userId if not provided (you can get this from auth context later)
        const dataWithUserId = {
            ...testCaseData,
            userId: testCaseData.userId || 1 // Default to user ID 1 for now
        };

        const response = await axios.post<CreateTestCaseResponse>(`${BASE_URL}/testcase`, dataWithUserId, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    } catch (error: any) {
        console.error('Error creating test case:', error);
        if (error.response?.data?.message) {
            throw new Error(error.response.data.message);
        } else if (error.response?.status === 400) {
            throw new Error('Invalid test case data. Please check all required fields.');
        } else if (error.response?.status === 500) {
            throw new Error('Server error. Please try again later.');
        } else {
            throw new Error('Failed to create test case. Please check your connection and try again.');
        }
    }
};

export const createMultipleTestCases = async (testCasesData: CreateTestCaseRequest[]): Promise<CreateTestCaseResponse[]> => {
    try {
        const promises = testCasesData.map(testCaseData => createTestCase(testCaseData));
        return await Promise.all(promises);
    } catch (error: any) {
        console.error('Error creating multiple test cases:', error);
        throw new Error('Failed to create one or more test cases. Please try again.');
    }
};
