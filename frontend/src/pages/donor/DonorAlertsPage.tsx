import React from 'react';
import {
    Container,
    Typography,
    Box,
    Paper,
    Card,
    CardContent,
    Grid,
    useTheme,
} from '@mui/material';
import {
    NotificationsActive as AlertIcon,
    Warning as WarningIcon,
    Info as InfoIcon,
    Emergency as EmergencyIcon,
    TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { CrisisAlertBanner } from '../../components/crisis/CrisisAlertBanner';

const DonorAlertsPage: React.FC = () => {
    const theme = useTheme();

    return (
        <DashboardLayout title="Crisis Alerts">
            <Container maxWidth="xl">
                {/* Hero Section */}
                <Box 
                    sx={{ 
                        background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
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
                            Crisis Alerts 🚨
                        </Typography>
                        <Typography variant="h6" sx={{ opacity: 0.9, mb: 3 }}>
                            Stay informed about urgent community needs and emergency situations
                        </Typography>
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
                                <AlertIcon sx={{ fontSize: 40, mb: 2, opacity: 0.8 }} />
                                <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                                    Active
                                </Typography>
                                <Typography variant="h6">Crisis Alerts</Typography>
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
                                <EmergencyIcon sx={{ fontSize: 40, mb: 2, opacity: 0.8 }} />
                                <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                                    High
                                </Typography>
                                <Typography variant="h6">Priority</Typography>
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
                                <TrendingUpIcon sx={{ fontSize: 40, mb: 2, opacity: 0.8 }} />
                                <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                                    Real-time
                                </Typography>
                                <Typography variant="h6">Updates</Typography>
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
                                <InfoIcon sx={{ fontSize: 40, mb: 2, opacity: 0.8 }} />
                                <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                                    Community
                                </Typography>
                                <Typography variant="h6">Support</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* Alerts Section */}
                <Card sx={{ p: 3, mb: 4 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                            Current Crisis Alerts
                        </Typography>
                    </Box>
                    
                    <CrisisAlertBanner />
                </Card>

                {/* Information Section */}
                <Card sx={{ p: 3 }}>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3 }}>
                        About Crisis Alerts
                    </Typography>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <Box display="flex" alignItems="flex-start" mb={2}>
                                <AlertIcon sx={{ color: 'warning.main', mr: 2, mt: 0.5, fontSize: 24 }} />
                                <Box>
                                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                                        What are Crisis Alerts?
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Crisis alerts are urgent notifications about community needs, natural disasters, or emergency situations that require immediate attention and support.
                                    </Typography>
                                </Box>
                            </Box>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Box display="flex" alignItems="flex-start" mb={2}>
                                <EmergencyIcon sx={{ color: 'error.main', mr: 2, mt: 0.5, fontSize: 24 }} />
                                <Box>
                                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                                        How to respond
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        When you see a crisis alert, consider how you can help. This might include donating items, volunteering time, or spreading awareness.
                                    </Typography>
                                </Box>
                            </Box>
                        </Grid>
                    </Grid>
                </Card>
            </Container>
        </DashboardLayout>
    );
};

export default DonorAlertsPage; 