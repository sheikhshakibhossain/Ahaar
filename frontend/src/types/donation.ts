export interface Donation {
    id: number;
    title: string;
    description: string;
    quantity: number;
    quantity_taken: number;
    remaining_quantity: number;
    expiry_date: string;
    category: 'cooked' | 'packaged' | 'raw' | 'other';
    location: {
        lat: number;
        lng: number;
        address?: string;
    };
    image_url?: string;
    status: 'available' | 'claimed' | 'expired' | 'cancelled' | 'completed';
    status_display: string;
    is_available: boolean;
    donor: {
        id: number;
        name: string;
        email: string;
    };
    created_at: string;
    updated_at: string;
}

export interface DonationFilter {
    status?: string;
    dateRange?: {
        start: Date | null;
        end: Date | null;
    };
    searchQuery?: string;
} 