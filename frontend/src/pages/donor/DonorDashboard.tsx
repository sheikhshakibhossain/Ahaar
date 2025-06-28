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
    Avatar,
    LinearProgress,
    Divider,
    Button,
    IconButton,
    Tooltip,
    useTheme,
} from '@mui/material';
import {
    Person as PersonIcon,
    Email as EmailIcon,
    Phone as PhoneIcon,
    LocationOn as LocationIcon,
    Inventory as InventoryIcon,
    CheckCircle as CheckCircleIcon,
    Cancel as CancelIcon,
    TrendingUp as TrendingUpIcon,
    Add as AddIcon,
    Visibility as VisibilityIcon,
    Edit as EditIcon,
    CalendarToday as CalendarIcon,
    LocalShipping as ShippingIcon,
} from '@mui/icons-material';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { api } from '../../services/api';
import { Donation } from '../../types/donation';
import { User } from '../../types/auth';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const DonorDashboard: React.FC = () => {
    const theme = useTheme();
    const [stats, setStats] = useState({
        totalDonations: 0,
        activeDonations: 0,
        completedDonations: 0,
        cancelledDonations: 0,
    });
    const [donations, setDonations] = useState<Donation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [donationsResponse, userResponse] = await Promise.all([
                    api.get<Donation[]>('/api/donations/'),
                    api.get<User>('/api/me/')
                ]);

                const donationsData = donationsResponse.data;
                setDonations(donationsData);
                setUser(userResponse.data);

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

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'available': return 'success';
            case 'completed': return 'primary';
            case 'cancelled': return 'error';
            default: return 'default';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'available': return <InventoryIcon />;
            case 'completed': return <CheckCircleIcon />;
            case 'cancelled': return <CancelIcon />;
            default: return <InventoryIcon />;
        }
    };

    if (loading) {
        return (
            <DashboardLayout title="Donor Dashboard">
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                    <CircularProgress size={60} />
                </Box>
            </DashboardLayout>
        );
    }

    if (error) {
        return (
            <DashboardLayout title="Donor Dashboard">
                <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Donor Dashboard">
            <Container maxWidth="xl">
                {/* Hero Section */}
                <Box 
                    sx={{ 
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        borderRadius: 3,
                        p: 4,
                        mb: 4,
                        color: 'white',
                        position: 'relative',
                        overflow: 'hidden',
                        '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                            opacity: 0.3,
                        }
                    }}
                >
                    <Box position="relative" zIndex={1}>
                        <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
                            Welcome back, {user?.first_name}! 👋
                        </Typography>
                        <Typography variant="h6" sx={{ opacity: 0.9, mb: 3 }}>
                            Your generosity is making a difference in people's lives
                        </Typography>
                        <Button
                            variant="contained"
                            size="large"
                            startIcon={<AddIcon />}
                            onClick={() => navigate('/dashboard/donate')}
                            sx={{ 
                                bgcolor: 'white', 
                                color: 'primary.main',
                                '&:hover': { bgcolor: 'grey.100' }
                            }}
                        >
                            Create New Donation
                        </Button>
                    </Box>
                </Box>

                {/* Statistics Cards */}
                <Grid container spacing={3} mb={4}>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card 
                            sx={{ 
                                p: 3, 
                                textAlign: 'center',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                color: 'white',
                                position: 'relative',
                                overflow: 'hidden',
                                '&::before': {
                                    content: '""',
                                    position: 'absolute',
                                    top: -50,
                                    right: -50,
                                    width: 100,
                                    height: 100,
                                    borderRadius: '50%',
                                    background: 'rgba(255,255,255,0.1)',
                                }
                            }}
                        >
                            <CardContent>
                                <InventoryIcon sx={{ fontSize: 40, mb: 2, opacity: 0.8 }} />
                                <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                                    {stats.totalDonations}
                                </Typography>
                                <Typography variant="h6">Total Donations</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card 
                            sx={{ 
                                p: 3, 
                                textAlign: 'center',
                                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                                color: 'white',
                                position: 'relative',
                                overflow: 'hidden',
                                '&::before': {
                                    content: '""',
                                    position: 'absolute',
                                    top: -50,
                                    right: -50,
                                    width: 100,
                                    height: 100,
                                    borderRadius: '50%',
                                    background: 'rgba(255,255,255,0.1)',
                                }
                            }}
                        >
                            <CardContent>
                                <TrendingUpIcon sx={{ fontSize: 40, mb: 2, opacity: 0.8 }} />
                                <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                                    {stats.activeDonations}
                                </Typography>
                                <Typography variant="h6">Active Donations</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card 
                            sx={{ 
                                p: 3, 
                                textAlign: 'center',
                                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                                color: 'white',
                                position: 'relative',
                                overflow: 'hidden',
                                '&::before': {
                                    content: '""',
                                    position: 'absolute',
                                    top: -50,
                                    right: -50,
                                    width: 100,
                                    height: 100,
                                    borderRadius: '50%',
                                    background: 'rgba(255,255,255,0.1)',
                                }
                            }}
                        >
                            <CardContent>
                                <CheckCircleIcon sx={{ fontSize: 40, mb: 2, opacity: 0.8 }} />
                                <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                                    {stats.completedDonations}
                                </Typography>
                                <Typography variant="h6">Completed</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card 
                            sx={{ 
                                p: 3, 
                                textAlign: 'center',
                                background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                                color: 'white',
                                position: 'relative',
                                overflow: 'hidden',
                                '&::before': {
                                    content: '""',
                                    position: 'absolute',
                                    top: -50,
                                    right: -50,
                                    width: 100,
                                    height: 100,
                                    borderRadius: '50%',
                                    background: 'rgba(255,255,255,0.1)',
                                }
                            }}
                        >
                            <CardContent>
                                <CancelIcon sx={{ fontSize: 40, mb: 2, opacity: 0.8 }} />
                                <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                                    {stats.cancelledDonations}
                                </Typography>
                                <Typography variant="h6">Cancelled</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                <Grid container spacing={4}>
                    {/* Personal Information */}
                    <Grid item xs={12} md={4}>
                        <Card sx={{ p: 3, height: 'fit-content' }}>
                            <Box display="flex" alignItems="center" mb={3}>
                                <Avatar 
                                    sx={{ 
                                        width: 60, 
                                        height: 60, 
                                        bgcolor: 'primary.main',
                                        mr: 2
                                    }}
                                >
                                    <PersonIcon sx={{ fontSize: 30 }} />
                                </Avatar>
                                <Box>
                                    <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                                        {user?.first_name} {user?.last_name}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Generous Donor
                                    </Typography>
                                </Box>
                            </Box>
                            
                            <Divider sx={{ my: 2 }} />
                            
                            <Box sx={{ space: 2 }}>
                                <Box display="flex" alignItems="center" mb={2}>
                                    <EmailIcon sx={{ mr: 2, color: 'primary.main' }} />
                                    <Box>
                                        <Typography variant="body2" color="text.secondary">
                                            Email
                                        </Typography>
                                        <Typography variant="body1">
                                            {user?.email}
                                        </Typography>
                                    </Box>
                                </Box>
                                
                                <Box display="flex" alignItems="center" mb={2}>
                                    <PhoneIcon sx={{ mr: 2, color: 'primary.main' }} />
                                    <Box>
                                        <Typography variant="body2" color="text.secondary">
                                            Phone
                                        </Typography>
                                        <Typography variant="body1">
                                            {user?.phone_number || 'Not provided'}
                                        </Typography>
                                    </Box>
                                </Box>
                                
                                <Box display="flex" alignItems="center">
                                    <LocationIcon sx={{ mr: 2, color: 'primary.main' }} />
                                    <Box>
                                        <Typography variant="body2" color="text.secondary">
                                            Address
                                        </Typography>
                                        <Typography variant="body1">
                                            {user?.address || 'Not provided'}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                        </Card>
                    </Grid>

                    {/* Recent Donations */}
                    <Grid item xs={12} md={8}>
                        <Card sx={{ p: 3 }}>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                                    Recent Donations
                                </Typography>
                                <Button variant="outlined" startIcon={<VisibilityIcon />}>
                                    View All
                                </Button>
                            </Box>
                            
                            {donations.length === 0 ? (
                                <Box textAlign="center" py={4}>
                                    <InventoryIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                                    <Typography variant="h6" color="text.secondary" gutterBottom>
                                        No donations yet
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Start making a difference by creating your first donation
                                    </Typography>
                                </Box>
                            ) : (
                                <Grid container spacing={3}>
                                    {donations.slice(0, 6).map((donation) => (
                                        <Grid item xs={12} sm={6} key={donation.id}>
                                            <Card 
                                                sx={{ 
                                                    p: 2,
                                                    border: '1px solid',
                                                    borderColor: 'divider',
                                                    '&:hover': {
                                                        boxShadow: theme.shadows[8],
                                                        transform: 'translateY(-2px)',
                                                        transition: 'all 0.3s ease'
                                                    }
                                                }}
                                            >
                                                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                                                    <Box>
                                                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                                            {donation.title}
                                                        </Typography>
                                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                                            {donation.description.substring(0, 60)}...
                                                        </Typography>
                                                    </Box>
                                                    <Chip
                                                        icon={getStatusIcon(donation.status)}
                                                        label={donation.status_display}
                                                        color={getStatusColor(donation.status) as any}
                                                        size="small"
                                                    />
                                                </Box>
                                                
                                                <Box display="flex" justifyContent="space-between" alignItems="center">
                                                    <Box display="flex" alignItems="center">
                                                        <ShippingIcon sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                                                        <Typography variant="body2" color="text.secondary">
                                                            Qty: {donation.quantity}
                                                        </Typography>
                                                    </Box>
                                                    <Box display="flex" gap={1}>
                                                        <Tooltip title="View Details">
                                                            <IconButton size="small">
                                                                <VisibilityIcon fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="Edit">
                                                            <IconButton size="small">
                                                                <EditIcon fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </Box>
                                                </Box>
                                            </Card>
                                        </Grid>
                                    ))}
                                </Grid>
                            )}
                        </Card>
                    </Grid>
                </Grid>
            </Container>
        </DashboardLayout>
    );
};

export default DonorDashboard; 