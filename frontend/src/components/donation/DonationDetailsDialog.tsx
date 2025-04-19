import React, { useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    Chip,
} from '@mui/material';
import { format } from 'date-fns';
import { Donation } from '../../types/donation';

interface DonationDetailsDialogProps {
    donation: Donation | null;
    open: boolean;
    onClose: () => void;
    onClaim?: () => void;
    isRecipient?: boolean;
}

export const DonationDetailsDialog: React.FC<DonationDetailsDialogProps> = ({
    donation,
    open,
    onClose,
    onClaim,
    isRecipient = false,
}) => {
    useEffect(() => {
        if (donation && open) {
            console.log('Pickup Location Coordinates:', {
                latitude: donation.location.lat,
                longitude: donation.location.lng,
                address: donation.location.address
            });
        }
    }, [donation, open]);

    if (!donation) return null;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending':
                return 'warning';
            case 'accepted':
                return 'info';
            case 'collected':
                return 'success';
            case 'expired':
            case 'cancelled':
                return 'error';
            default:
                return 'default';
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>{donation.title}</DialogTitle>
            <DialogContent>
                <Box sx={{ mb: 2 }}>
                    <Typography variant="body1">{donation.description}</Typography>
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                    <Box sx={{ flex: '1 1 calc(50% - 16px)', minWidth: '250px' }}>
                        <Typography variant="subtitle2" color="text.secondary">
                            Category
                        </Typography>
                        <Chip label={donation.category} size="small" />
                    </Box>
                    <Box sx={{ flex: '1 1 calc(50% - 16px)', minWidth: '250px' }}>
                        <Typography variant="subtitle2" color="text.secondary">
                            Quantity
                        </Typography>
                        <Typography variant="body1">{donation.quantity}</Typography>
                    </Box>
                    <Box sx={{ flex: '1 1 calc(50% - 16px)', minWidth: '250px' }}>
                        <Typography variant="subtitle2" color="text.secondary">
                            Expiry Date
                        </Typography>
                        <Typography variant="body1">
                            {format(new Date(donation.expiry_date), 'PPP')}
                        </Typography>
                    </Box>
                    <Box sx={{ flex: '1 1 calc(50% - 16px)', minWidth: '250px' }}>
                        <Typography variant="subtitle2" color="text.secondary">
                            Pickup Location
                        </Typography>
                        <Typography variant="body1">{donation.location.address}</Typography>
                    </Box>
                    <Box sx={{ flex: '1 1 calc(50% - 16px)', minWidth: '250px' }}>
                        <Typography variant="subtitle2" color="text.secondary">
                            Status
                        </Typography>
                        <Chip
                            label={donation.status_display}
                            color={donation.status === 'available' ? 'success' : 'default'}
                            size="small"
                        />
                    </Box>
                    <Box sx={{ flex: '1 1 calc(50% - 16px)', minWidth: '250px' }}>
                        <Typography variant="subtitle2" color="text.secondary">
                            Donor
                        </Typography>
                        <Typography variant="body1">{donation.donor.name}</Typography>
                    </Box>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Close</Button>
                {isRecipient && donation.status === 'available' && (
                    <Button onClick={onClaim} variant="contained" color="primary">
                        Claim Donation
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
}; 