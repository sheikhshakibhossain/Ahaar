import { api } from './api';

export interface BadDonor {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    donation_count: number;
    average_rating: number;
    warning_count: number;
    feedback_count: number;
    is_banned: boolean;
}

export interface BadDonorsResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: BadDonor[];
}

export const adminService = {
    async getBadDonors(params: {
        page: number;
        page_size: number;
        min_feedback: number;
        sort_by: 'rating' | 'feedback';
        search?: string;
    }): Promise<BadDonorsResponse> {
        const response = await api.get('/api/admin/bad-donors/', { params });
        return response.data;
    },

    async banDonor(donorId: number): Promise<void> {
        await api.post(`/api/admin/donors/${donorId}/ban/`);
    },

    async unbanDonor(donorId: number): Promise<void> {
        await api.post(`/api/admin/donors/${donorId}/unban/`);
    },

    async warnDonor(donorId: number): Promise<void> {
        await api.post(`/api/admin/donors/${donorId}/warn/`);
    },

    async getDonorWarnings(donorId: number): Promise<{ id: string; message: string; timestamp: string }[]> {
        const response = await api.get(`/api/admin/donors/${donorId}/warnings`);
        return response.data;
    }
}; 