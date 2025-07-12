import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BASE_URL;

export interface SearchUserResponse {
  statusCode: number;
  message: string;
  data: SearchUserData[];
}

export interface SearchUserData {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNo: string;
  joinDate: string;
  userGender: string;
  userStatus: string;
  designationId: number;
  designationName?: string;
}

export const searchUsers = async (query: string): Promise<SearchUserResponse> => {
  try {
    const response = await axios.get(`${BASE_URL}users/search?query=${encodeURIComponent(query)}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to search users');
  }
};

export const searchUsersByEmployeeId = async (employeeId: string): Promise<SearchUserResponse> => {
  return searchUsers(employeeId);
};

export const searchUsersByFirstName = async (firstName: string): Promise<SearchUserResponse> => {
  return searchUsers(firstName);
};

export const searchUsersByLastName = async (lastName: string): Promise<SearchUserResponse> => {
  return searchUsers(lastName);
};

export const searchUsersByFullName = async (fullName: string): Promise<SearchUserResponse> => {
  return searchUsers(fullName);
};
