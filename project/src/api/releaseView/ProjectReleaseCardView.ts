import axios from "axios";

export interface ProjectReleaseProps{
    message: string;
    data:any;
    status: string;
    statusCode:string;
}

export const projectReleaseCardView = (projectId:string | null):Promise<ProjectReleaseProps> => {
    return axios
    .get<ProjectReleaseProps>(`http://192.168.1.112:8087/api/v1/releases/projectId/${projectId}`)
        .then(({data}) => data);
};
