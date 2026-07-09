import apiClient from '../config';
import {
    ApiResponse,
    APIProject,
    AddProjectRequest,
    UpdateProjectRequest
} from '../types';

/**
 * Project API Service
 */
export const projectService = {
    /**
     * Add a new project
     * @param data - Project data
     */
    addProject: async (data: AddProjectRequest): Promise<ApiResponse<APIProject>> => {
        const formData = new FormData();
        formData.append('title', data.title);
        formData.append('description', data.description || '');
        formData.append('project_url', data.project_url || '');
        formData.append('github_url', data.github_url || '');
        formData.append('start_date', data.start_date);
        formData.append('end_date', data.end_date || '');
        formData.append('technologies', data.technologies || '');

        const response = await apiClient.post<ApiResponse<APIProject>>(
            'project-portfolio/add-project',
            formData
        );
        return response.data;
    },

    /**
     * Update an existing project
     * @param data - Project data including ID
     */
    updateProject: async (data: UpdateProjectRequest): Promise<ApiResponse<APIProject>> => {
        const formData = new FormData();
        formData.append('id', data.id.toString());
        formData.append('title', data.title);
        formData.append('description', data.description || '');
        formData.append('project_url', data.project_url || '');
        formData.append('github_url', data.github_url || '');
        formData.append('start_date', data.start_date);
        formData.append('end_date', data.end_date || '');
        formData.append('technologies', data.technologies || '');

        if (data.delete_media_ids) {
            formData.append('delete_media_ids', data.delete_media_ids);
        }

        const response = await apiClient.post<ApiResponse<APIProject>>(
            'project-portfolio/update-project',
            formData
        );
        return response.data;
    },

    /**
     * Delete a project
     * @param id - Project ID
     */
    deleteProject: async (id: number): Promise<ApiResponse<any>> => {
        // Based on user: body is {"id": 1}. Let's see if the backend expects JSON or FormData. Since it says POST delete-project, I'll send regular JSON if not specified, but the others used FormData. User explicitly wrote: POST project-portfolio/delete-project and b body is {"id": 1}
        const response = await apiClient.post<ApiResponse<any>>(
            'project-portfolio/delete-project',
            { id }
        );
        return response.data;
    }
};
