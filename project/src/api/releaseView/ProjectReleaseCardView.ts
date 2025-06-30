import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL;

export interface ProjectReleaseProps {
    message: string;
    data: any;
    status: string;
    statusCode: string;
}

export const projectReleaseCardView = (projectId: string | null): Promise<ProjectReleaseProps> => {
    return axios
        .get<ProjectReleaseProps>(`${BASE_URL}releases/projectId/${projectId}`)
        .then(({ data }) => data);
};
