import React, { useState, useEffect } from 'react';
import {
    Container,
    Grid,
    Paper,
    Typography,
    Box,
    CircularProgress,
    Alert,
    Card,
    CardContent,
    CardMedia,
    Chip,
} from '@mui/material';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { api } from '../../services/api';
import { Donation } from '../../types/donation';
import { AdminWarningAlert } from '../../components/donor/AdminWarningAlert';

const DonorDashboard: React.FC = () => {
    const [stats, setStats] = useState({
        totalDonations: 0,
        activeDonations: 0,
        completedDonations: 0,
        cancelledDonations: 0,
    });
    const [donations, setDonations] = useState<Donation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [donationsResponse, userResponse] = await Promise.all([
                    api.get<Donation[]>('/api/donations/'),
                    api.get('/api/me/')
                ]);

                const donationsData = donationsResponse.data;
                setDonations(donationsData);

                // Calculate statistics
                setStats({
                    totalDonations: donationsData.length,
                    activeDonations: donationsData.filter(d => d.status === 'available').length,
                    completedDonations: donationsData.filter(d => d.status === 'completed').length,
                    cancelledDonations: donationsData.filter(d => d.status === 'cancelled').length,
                });
            } catch (err) {
                setError('Failed to fetch dashboard data');
                console.error('Error fetching dashboard data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <DashboardLayout title="Donor Dashboard">
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                    <CircularProgress />
                </Box>
            </DashboardLayout>
        );
    }

    if (error) {
        return (
            <DashboardLayout title="Donor Dashboard">
                <Alert severity="error">{error}</Alert>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Donor Dashboard">
            <Container maxWidth="lg">
                <AdminWarningAlert />
                <Box mb={4}>
                    <Typography variant="h4" gutterBottom>
                        Welcome to Your Dashboard
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Manage your donations and track their status
                    </Typography>
                </Box>

                {/* Statistics Cards */}
                <Grid container spacing={3} mb={4}>
                    <Grid item xs={12} sm={6} md={3}>
                        <Paper sx={{ p: 2, textAlign: 'center' }}>
                            <Typography variant="h6">Total Donations</Typography>
                            <Typography variant="h4">{stats.totalDonations}</Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Paper sx={{ p: 2, textAlign: 'center' }}>
                            <Typography variant="h6">Active Donations</Typography>
                            <Typography variant="h4">{stats.activeDonations}</Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Paper sx={{ p: 2, textAlign: 'center' }}>
                            <Typography variant="h6">Completed</Typography>
                            <Typography variant="h4">{stats.completedDonations}</Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Paper sx={{ p: 2, textAlign: 'center' }}>
                            <Typography variant="h6">Cancelled</Typography>
                            <Typography variant="h4">{stats.cancelledDonations}</Typography>
                        </Paper>
                    </Grid>
                </Grid>

                {/* Recent Donations */}
                <Box mb={4}>
                    <Typography variant="h5" gutterBottom>
                        Recent Donations
                    </Typography>
                    <Grid container spacing={3}>
                        {donations.map((donation) => (
                            <Grid item xs={12} sm={6} md={4} key={donation.id}>
                                <Card>
                                    {donation.image && (
                                        <CardMedia
                                            component="img"
                                            height="140"
                                            image={donation.image}
                                            alt={donation.title}
                                        />
                                    )}
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>
                                            {donation.title}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" gutterBottom>
                                            {donation.description}
                                        </Typography>
                                        <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
                                            <Chip
                                                label={donation.status_display}
                                                color={
                                                    donation.status === 'available'
                                                        ? 'success'
                                                        : donation.status === 'completed'
                                                        ? 'primary'
                                                        : 'error'
                                                }
                                            />
                                            <Typography variant="body2">
                                                Quantity: {donation.quantity}
                                            </Typography>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            </Container>
        </DashboardLayout>
    );
};

export default DonorDashboard; 