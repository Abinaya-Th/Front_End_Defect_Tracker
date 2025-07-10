import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL;

export interface UpdateUserPayload {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNo?: string;
  joinDate?: string;
  userGender?: string;
  userStatus?: string;
  designationId?: number;
  // Add other fields as needed
}

export interface UpdateUserResponse {
  status: string;
  message: string;
  data: any;
  statusCode: number;
}

export const updateUser = (userId: string | number, data: UpdateUserPayload): Promise<UpdateUserResponse> => {
  return axios.put<UpdateUserResponse>(
    `${BASE_URL}users/${userId}`,
    data
  ).then(({ data }) => data);
};
