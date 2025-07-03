import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL;
export interface ProjectRelease {
    id: string;
    releaseId: string;
    releaseName: string;
    description: string;
    releaseStatus: string;
    releaseDate: string; // YYYY-MM-DD
    releaseType: string;
    projectId: number;

}

export interface ProjectReleaseProps {
    message: string;
    data: ProjectRelease[];
    status: string;
    statusCode: string;
}

export const projectReleaseCardView = (projectId: string | null): Promise<ProjectReleaseProps> => {
    return axios
        .get<ProjectReleaseProps>(`${BASE_URL}releases/project/${projectId}`)
        .then(({ data }) => data);
};
