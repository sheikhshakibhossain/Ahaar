import React from 'react';
import {
    Card,
    CardContent,
    Typography,
    Box,
    CircularProgress,
    Alert,
    Stack,
    Chip,
    Avatar,
} from '@mui/material';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Donation } from '../../types/donation';
import { format } from 'date-fns';

export const DonorDashboard: React.FC = () => {
    const { user } = useAuth();
    const [stats, setStats] = React.useState({
        totalDonations: 0,
        completedDonations: 0,
        trustScore: 100,
    });
    const [donations, setDonations] = React.useState<Donation[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        const fetchDonationStats = async () => {
            try {
                setLoading(true);
                const [donationsResponse, userResponse] = await Promise.all([
                    api.get<Donation[]>('/api/donations/'),
                    api.get('/api/me/')
                ]);
                
                const donationsData = donationsResponse.data;
                const userData = userResponse.data;

                // Calculate statistics
                const totalDonations = donationsData.length;
                const completedDonations = donationsData.filter(d => 
                    d.status === 'claimed' || d.status === 'expired' || d.status === 'cancelled'
                ).length;

                setStats({
                    totalDonations,
                    completedDonations,
                    trustScore: userData.penalty_score ? 100 - userData.penalty_score : 100,
                });
                
                setDonations(donationsData);
            } catch (err) {
                setError('Failed to load donation statistics');
                console.error('Error fetching donation stats:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchDonationStats();
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'available':
                return 'success';
            case 'claimed':
                return 'info';
            case 'expired':
            case 'cancelled':
                return 'error';
            default:
                return 'default';
        }
    };

    return (
        <DashboardLayout title="Donor Dashboard">
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            
            <Stack spacing={3}>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
                    <Card sx={{ flex: 1 }}>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom>
                                Total Donations
                            </Typography>
                            {loading ? (
                                <CircularProgress size={24} />
                            ) : (
                                <Typography variant="h5">
                                    {stats.totalDonations}
                                </Typography>
                            )}
                        </CardContent>
                    </Card>
                    <Card sx={{ flex: 1 }}>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom>
                                Completed Donations
                            </Typography>
                            {loading ? (
                                <CircularProgress size={24} />
                            ) : (
                                <Typography variant="h5">
                                    {stats.completedDonations}
                                </Typography>
                            )}
                        </CardContent>
                    </Card>
                    <Card sx={{ flex: 1 }}>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom>
                                Trust Score
                            </Typography>
                            {loading ? (
                                <CircularProgress size={24} />
                            ) : (
                                <Box position="relative" display="inline-flex">
                                    <CircularProgress
                                        variant="determinate"
                                        value={stats.trustScore}
                                        color={stats.trustScore < 50 ? "error" : "success"}
                                    />
                                    <Box
                                        top={0}
                                        left={0}
                                        bottom={0}
                                        right={0}
                                        position="absolute"
                                        display="flex"
                                        alignItems="center"
                                        justifyContent="center"
                                    >
                                        <Typography variant="caption" component="div" color="textSecondary">
                                            {stats.trustScore}%
                                        </Typography>
                                    </Box>
                                </Box>
                            )}
                            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                                Based on recipient feedback and donation history
                            </Typography>
                        </CardContent>
                    </Card>
                </Stack>
                
                {/* Donations Grid */}
                <Box>
                    <Typography variant="h6" sx={{ mb: 3 }}>
                        Your Donations
                    </Typography>
                    {loading ? (
                        <Box display="flex" justifyContent="center" p={3}>
                            <CircularProgress />
                        </Box>
                    ) : donations.length === 0 ? (
                        <Box p={3} textAlign="center">
                            <Typography color="textSecondary">
                                You haven't made any donations yet.
                            </Typography>
                        </Box>
                    ) : (
                        <Stack 
                            direction={{ xs: 'column', sm: 'row' }} 
                            spacing={3}
                            sx={{ 
                                display: 'grid',
                                gridTemplateColumns: {
                                    xs: '1fr',
                                    sm: 'repeat(2, 1fr)',
                                    md: 'repeat(3, 1fr)'
                                },
                                gap: 3
                            }}
                        >
                            {donations.map((donation) => (
                                <Card key={donation.id}>
                                    <CardContent>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
                                            {donation.image ? (
                                                <Avatar 
                                                    src={donation.image} 
                                                    alt={donation.title}
                                                    sx={{ width: 120, height: 120, mb: 2 }}
                                                />
                                            ) : (
                                                <Avatar 
                                                    sx={{ 
                                                        width: 120, 
                                                        height: 120, 
                                                        mb: 2,
                                                        bgcolor: 'primary.main',
                                                        fontSize: '3rem'
                                                    }}
                                                >
                                                    {donation.title.charAt(0)}
                                                </Avatar>
                                            )}
                                            <Typography variant="h6" align="center" gutterBottom>
                                                {donation.title}
                                            </Typography>
                                            <Chip 
                                                label={donation.status_display} 
                                                color={getStatusColor(donation.status)}
                                                size="small"
                                                sx={{ mb: 1 }}
                                            />
                                        </Box>
                                        
                                        <Box sx={{ mt: 2 }}>
                                            <Typography variant="body2" color="textSecondary" gutterBottom>
                                                Category: {donation.category}
                                            </Typography>
                                            <Typography variant="body2" color="textSecondary" gutterBottom>
                                                Quantity: {donation.quantity_taken > 0 ? (
                                                    <Typography component="span" variant="body2">
                                                        {donation.quantity_taken}/{donation.quantity} taken
                                                    </Typography>
                                                ) : (
                                                    donation.quantity
                                                )}
                                            </Typography>
                                            <Typography variant="body2" color="textSecondary">
                                                Expires: {format(new Date(donation.expiry_date), 'MMM d, yyyy')}
                                            </Typography>
                                        </Box>
                                    </CardContent>
                                </Card>
                            ))}
                        </Stack>
                    )}
                </Box>
            </Stack>
        </DashboardLayout>
    );
};

export default DonorDashboard; 