// const API_BASE = 'http://192.168.1.46:8088/api/v1';


// export const exportTestCases = async (params: Record<string, string>) => {
//     const queryString = new URLSearchParams(params).toString();
//     const response = await fetch(`${API_BASE}/testcase/export?${queryString}`, {
//         method: 'GET',
//         headers: {
//             'Content-Type': 'application/json',
//             // Uncomment if you need auth:
//             // 'Authorization': `Bearer ${localStorage.getItem('token')}`,
//         },
//     });

//     if (!response.ok) {
//         throw new Error('Failed to export test cases');
//     }

//     return await response.blob();
// }; 
// const API_BASE = 'http://192.168.1.112:8087/api/v1';
// export const exportTestCases = async (params: Record<string, string>): Promise<Blob> => {
//     const response = await axios.get(`${API_BASE}/testcase/export`, {
//         params,
//         responseType: 'blob',
//     });
//     return response.data;
// };
import axios from 'axios';

const API_BASE = 'http://192.168.1.112:8087/api/v1'

export const exportTestCases = async (params = {}) => {
    try {
        const response = await axios.get(`${API_BASE}/testcase/export`, {
            params,
            responseType: 'blob', // This is crucial
            headers: {
                'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            }
        });

        // Verify response is a blob
        if (!(response.data instanceof Blob)) {
            throw new Error('Invalid response format');
        }

        return response.data;
    } catch (error) {
        console.error('Export API error:', error);
        throw error;
    }
};