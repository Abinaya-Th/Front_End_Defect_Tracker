import axios from 'axios';

const API_BASE = 'http://192.168.1.99:8085/api/v1';

export const searchReleaseByName = async (releaseName: string) => {
    const response = await axios.get(`${API_BASE}/releases/search`, {
        params: { releaseName }
    });
    return response.data.data;
};

export const exportTestCases = async (params = {}) => {
    const response = await axios.get(`${API_BASE}/testcase/export`, {
        params,
        responseType: 'blob',
    });
    return response.data;
}; 