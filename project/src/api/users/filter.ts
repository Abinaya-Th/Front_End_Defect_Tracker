import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL;

export interface UserFilter {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNo: string;
  joinDate: string;
  userGender: string;
  userStatus: string;
  designationId: number;
}

export interface GetUsersByFilterResponse {
  status: string;
  message: string;
  data: UserFilter[];
  statusCode: number;
}

export const getUsersByFilter = (gender?: string, status?: string, designationId?: string | number): Promise<GetUsersByFilterResponse> => {
  let url = `${BASE_URL}users/filter?`;
  const params = [];
  if (gender) params.push(`userGender=${encodeURIComponent(gender)}`);
  if (status) params.push(`userStatus=${encodeURIComponent(status)}`); // typo matches backend
  if (designationId) params.push(`designationId=${encodeURIComponent(designationId)}`);
  url += params.join('&');
  return axios.get<GetUsersByFilterResponse>(url).then(({ data }) => data);
};
//http://192.168.1.107:8080/api/v1/users/filter?userStaus=Active
//http://192.168.1.107:8080/api/v1/users/filter?designationId=1