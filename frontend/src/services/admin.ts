import { api } from './api';

export interface BadDonor {
    id: string;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    donation_count: number;
    average_rating: number;
    feedback_count: number;
    is_banned: boolean;
    warning_count?: number;
}

export interface BadDonorsResponse {
    donors: BadDonor[];
    total: number;
}

export const adminService = {
    getBadDonors: async (params: any): Promise<BadDonorsResponse> => {
        const response = await api.get('/api/admin/bad-donors/', { params });
        // Map paginated response to expected format
        return {
            donors: response.data.results || [],
            total: response.data.count || 0,
        };
    },

    warnDonor: async (donorId: string): Promise<void> => {
        await api.post(`/api/admin/donors/${donorId}/warn/`);
    },

    banDonor: async (donorId: string): Promise<void> => {
        await api.post(`/api/admin/donors/${donorId}/ban/`);
    },

    unbanDonor: async (donorId: string): Promise<void> => {
        await api.post(`/api/admin/donors/${donorId}/unban/`);
    },

    getDonorWarnings: async (donorId: string): Promise<{ id: string; message: string; timestamp: string }[]> => {
        const response = await api.get(`/api/admin/donors/${donorId}/warnings`);
        return response.data;
    }
}; 