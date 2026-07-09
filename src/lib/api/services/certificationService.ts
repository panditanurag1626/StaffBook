import apiClient from '../config';
import {
    ApiResponse,
    APICertification,
    AddCertificationRequest,
    UpdateCertificationRequest
} from '../types';

/**
 * Certification API Service
 */
export const certificationService = {
    /**
     * Add a new certification
     * @param data - Certification data
     */
    addCertification: async (data: AddCertificationRequest): Promise<ApiResponse<APICertification>> => {
        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('issuing_organization', data.issuing_organization);
        formData.append('issue_date', data.issue_date);
        formData.append('expiration_date', data.expiration_date || '');
        formData.append('credential_id', data.credential_id || '');
        formData.append('credential_url', data.credential_url || '');
        formData.append('description', data.description || '');

        const response = await apiClient.post<ApiResponse<APICertification>>(
            'certification/add-certification',
            formData
        );
        return response.data;
    },

    /**
     * Update an existing certification
     * @param data - Certification data including ID
     */
    updateCertification: async (data: UpdateCertificationRequest): Promise<ApiResponse<APICertification>> => {
        const formData = new FormData();
        formData.append('id', data.id.toString());
        formData.append('name', data.name);
        formData.append('issuing_organization', data.issuing_organization);
        formData.append('issue_date', data.issue_date);
        formData.append('expiration_date', data.expiration_date || '');
        formData.append('credential_id', data.credential_id || '');
        formData.append('credential_url', data.credential_url || '');
        formData.append('description', data.description || '');

        if (data.delete_media_ids) {
            formData.append('delete_media_ids', data.delete_media_ids);
        }

        const response = await apiClient.post<ApiResponse<APICertification>>(
            'certification/update-certification',
            formData
        );
        return response.data;
    },

    /**
     * Delete a certification
     * @param id - Certification ID
     */
    deleteCertification: async (id: number): Promise<ApiResponse<any>> => {
        const response = await apiClient.post<ApiResponse<any>>(
            'certification/delete-certification',
            { id }
        );
        return response.data;
    }
};
