import { api } from './api';
import { Donation } from '../types/donation';

export const donationService = {
    // Get all available donations
    getAvailableDonations: async () => {
        const response = await api.get<Donation[]>('/api/donations/');
        return response.data;
    },

    // Get a single donation by ID
    getDonationById: async (id: number) => {
        const response = await api.get<Donation>(`/api/donations/${id}/`);
        return response.data;
    },

    // Create a new donation
    createDonation: async (donationData: Partial<Donation>) => {
        const response = await api.post<Donation>('/api/donations/', donationData);
        return response.data;
    },

    // Claim a donation
    claimDonation: async (donationId: number, quantity: number) => {
        const response = await api.post<Donation>(`/api/donations/${donationId}/claim/`, {
            quantity
        });
        return response.data;
    },

    // Cancel a donation
    cancelDonation: async (donationId: number) => {
        const response = await api.post<Donation>(`/api/donations/${donationId}/cancel/`);
        return response.data;
    },

    // Get user's donation history
    getUserDonations: async () => {
        const response = await api.get<Donation[]>('/api/donations/my-donations/');
        return response.data;
    },

    // Get claimed donations
    getClaimedDonations: async () => {
        const response = await api.get<Donation[]>('/api/donations/claimed/');
        return response.data;
    }
}; 