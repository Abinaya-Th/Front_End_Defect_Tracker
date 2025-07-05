import axios from "axios";
import { Employee } from "../../types/index";

const BASE_URL = "http://192.168.1.100:8090/api/v1/bench/search?list";

export async function getBenchList(): Promise<Employee[]> {
  const response = await axios.get(BASE_URL, {
    headers: { "Content-Type": "application/json" },
  });
  // Map backend fields to Employee type
  return (response.data.data || []).map((item: any) => {
    const [firstName, ...rest] = (item.fullName || '').split(' ');
    const lastName = rest.join(' ');
    return {
      id: String(item.userId),
      firstName: firstName || '',
      lastName: lastName || '',
      email: '', // Not provided by backend
      phone: '', // Not provided by backend
      designation: item.designation || '',
      experience: 0, // Not provided by backend
      joinedDate: item.availablePeriods || '', // Use availablePeriods for display
      skills: [], // Not provided by backend
      currentProjects: item.currentProjectName ? [item.currentProjectName] : [],
      availability: item.availability || 0,
      status: 'active', // Default value
      department: '', // Not provided by backend
      manager: '', // Not provided by backend
      startDate: '', // Not provided by backend
      endDate: '', // Not provided by backend
      createdAt: '',
      updatedAt: '',
    };
  });
}
