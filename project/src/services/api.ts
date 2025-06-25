import axios from 'axios';

const API_BASE = 'http://192.168.1.99:8083/api/v1';

export const searchReleaseByName = async (releaseName: string) => {
    const response = await axios.get(`${API_BASE}/releases/search`, {
        params: { releaseName }
    });
    return response.data.data;
}; 