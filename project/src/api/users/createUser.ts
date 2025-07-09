import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL;

export interface CreateUserRequest {
  // userId: string;
  firstName: String;
  lastName: string;
  email: string;
  password: string;
  phoneNo?: string;
  joinDate?: string;
  userGender?: string;
  userStatus?: boolean |undefined;
  designationId: number;
}

export interface CreateUserResponse {
  status: string;
  message: string;
  data: CreateUserRequest[];
  statusCode: number;
}

export const createUser = (payload: CreateUserRequest): Promise<CreateUserResponse> => {
  return axios.post<CreateUserResponse>(
    `${BASE_URL}users`,
    payload,
  ).then(({ data }: { data: CreateUserResponse }) => data);
};
