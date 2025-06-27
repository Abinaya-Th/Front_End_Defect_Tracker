import apiClient from "../apiClient";

export interface ProjectReleaseProps {
    message: string;
    data: any;
    status: string;
    statusCode: string;
}

export const projectReleaseCardView = (projectId: string | null): Promise<ProjectReleaseProps> => {
    return apiClient
        .get<ProjectReleaseProps>(`releases/projectId/${projectId}`)
        .then(({ data }) => data);
};
