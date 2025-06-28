export interface Donation {
    id: string;
    title: string;
    description: string;
    quantity: string;
    quantity_taken: number;
    remaining_quantity: number;
    expiry_date: string;
    category: string;
    status: string;
    status_display: string;
    is_available: boolean;
    created_at: string;
    updated_at: string;
    image?: string;
    location?: {
        lat: number;
        lng: number;
        address?: string;
    };
    donor?: {
        id: string;
        name: string;
        email: string;
    };
    recipient?: {
        id: string;
        name: string;
        email: string;
    };
}

export interface DonationFilter {
    status?: string;
    dateRange?: {
        start: Date | null;
        end: Date | null;
    };
    searchQuery?: string;
} 