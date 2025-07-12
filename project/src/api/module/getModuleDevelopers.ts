import axios from "axios";

export const getDevelopersByModuleId = async (moduleId: number) => {
  const response = await axios.get(
    `${import.meta.env.VITE_BASE_URL}allocateModule/developers/module/${moduleId}`
  );
  return response.data;
}; 