import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL;

export interface UpdateUserPayload {
  id: number;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string | null;
  phoneNo: string;
  joinDate: string;
  userGender: string;
  userStatus: string;
  designationId: number;
  designationName: string;
}

export interface UpdateUserResponse {
  status: string;
  message: string;
  data: any;
  statusCode: number;
}

export const updateUser = async (userId: number, data: UpdateUserPayload): Promise<UpdateUserResponse> => {
  const url = `${BASE_URL}users/${userId}`;
  const response = await axios.put<UpdateUserResponse>(url, data);
  return response.data;
};
