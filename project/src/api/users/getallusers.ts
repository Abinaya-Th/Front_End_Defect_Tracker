import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BASE_URL;

export interface User {
  id: string | null;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNo: string;
  joinDate: string;
  designationId: string | null;
  userStatus: string;
  designationName: string;
  userGender: string;
}

export interface GetAllUsersResponse {
  status: string;
  message: string;
  data: {
    totalPages: number;
    pageSize: number;
    currentPage: number;
    content: User[];
    totalElements: number;
  };
  statusCode: number;
}

export async function getAllUsers(page = 0, size = 10): Promise<GetAllUsersResponse> {
  const url = `${BASE_URL}users/all?page=${page}&size=${size}`;
  const response = await axios.get<GetAllUsersResponse>(url);
  return response.data;
}
