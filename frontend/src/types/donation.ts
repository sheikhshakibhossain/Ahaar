export interface Donation {
    id: string;
    title: string;
    description: string;
    quantity: string;
    quantity_taken: number;
    expiry_date: string;
    category: string;
    status: string;
    status_display: string;
    created_at: string;
    updated_at: string;
    image?: string;
    location?: {
        lat: number;
        lng: number;
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