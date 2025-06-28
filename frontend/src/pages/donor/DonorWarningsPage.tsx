import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Box,
    Paper,
    Card,
    CardContent,
    Grid,
    Alert,
    AlertTitle,
    Button,
    Chip,
    Avatar,
    Divider,
    useTheme,
    CircularProgress,
} from '@mui/material';
import {
    Warning as WarningIcon,
    Notifications as NotificationsIcon,
    CheckCircle as CheckCircleIcon,
    Info as InfoIcon,
    Close as CloseIcon,
    History as HistoryIcon,
    PriorityHigh as PriorityHighIcon,
} from '@mui/icons-material';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { AdminWarningAlert } from '../../components/donor/AdminWarningAlert';
import { api } from '../../services/api';
import { format } from 'date-fns';

interface Warning {
    id: number;
    message: string;
    created_at: string;
    is_read: boolean;
}

const DonorWarningsPage: React.FC = () => {
    const theme = useTheme();
    const [warnings, setWarnings] = useState<Warning[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchWarnings = async () => {
        try {
            setLoading(true);
            const response = await api.get<{ warnings: Warning[] }>('/api/donor/warnings/');
            setWarnings(response.data.warnings || []);
            setError(null);
        } catch (err) {
            console.error('Error fetching warnings:', err);
            setError('Failed to fetch warnings');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWarnings();
        // Set up polling to check for new warnings every 30 seconds
        const interval = setInterval(fetchWarnings, 30000);
        return () => clearInterval(interval);
    }, []);

    const handleDismiss = async (warningId: number) => {
        try {
            await api.post(`/api/donor/warnings/${warningId}/dismiss/`);
            setWarnings(warnings.filter(w => w.id !== warningId));
        } catch (err) {
            console.error('Error dismissing warning:', err);
        }
    };

    const stats = {
        total: warnings.length,
        unread: warnings.filter(w => !w.is_read).length,
        read: warnings.filter(w => w.is_read).length,
        recent: warnings.filter(w => {
            const warningDate = new Date(w.created_at);
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return warningDate >= weekAgo;
        }).length,
    };

    if (loading) {
        return (
            <DashboardLayout title="Warnings">
                <Container maxWidth="xl">
                    <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                        <CircularProgress />
                    </Box>
                </Container>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Warnings">
            <Container maxWidth="xl">
                {/* Hero Section */}
                <Box 
                    sx={{ 
                        background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
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
                            Warnings & Notifications ⚠️
                        </Typography>
                        <Typography variant="h6" sx={{ opacity: 0.9, mb: 3 }}>
                            Stay informed about important messages from administrators
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
                                <WarningIcon sx={{ fontSize: 40, mb: 2, opacity: 0.8 }} />
                                <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                                    {stats.total}
                                </Typography>
                                <Typography variant="h6">Total Warnings</Typography>
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
                                <PriorityHighIcon sx={{ fontSize: 40, mb: 2, opacity: 0.8 }} />
                                <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                                    {stats.unread}
                                </Typography>
                                <Typography variant="h6">Unread</Typography>
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
                                    {stats.read}
                                </Typography>
                                <Typography variant="h6">Read</Typography>
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
                                <HistoryIcon sx={{ fontSize: 40, mb: 2, opacity: 0.8 }} />
                                <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                                    {stats.recent}
                                </Typography>
                                <Typography variant="h6">This Week</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* Warnings Section */}
                <Card sx={{ p: 3, mb: 4 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                            Your Warnings
                        </Typography>
                        <Chip 
                            icon={<NotificationsIcon />}
                            label={`${stats.unread} unread`}
                            color={stats.unread > 0 ? "warning" : "default"}
                        />
                    </Box>

                    {error && (
                        <Alert severity="error" sx={{ mb: 3 }}>
                            {error}
                        </Alert>
                    )}

                    {warnings.length === 0 ? (
                        <Box textAlign="center" py={4}>
                            <InfoIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                            <Typography variant="h6" color="text.secondary" gutterBottom>
                                No warnings yet
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                You're all caught up! No warnings from administrators.
                            </Typography>
                        </Box>
                    ) : (
                        <Box>
                            {warnings.map((warning, index) => (
                                <Box key={warning.id}>
                                    <Alert
                                        severity="warning"
                                        sx={{ 
                                            mb: 2,
                                            borderRadius: 2,
                                            '& .MuiAlert-icon': {
                                                fontSize: 28,
                                            }
                                        }}
                                        action={
                                            <Button 
                                                color="inherit" 
                                                size="small" 
                                                onClick={() => handleDismiss(warning.id)}
                                                startIcon={<CloseIcon />}
                                            >
                                                Dismiss
                                            </Button>
                                        }
                                    >
                                        <AlertTitle sx={{ fontWeight: 'bold', mb: 1 }}>
                                            Admin Warning ⚠️
                                        </AlertTitle>
                                        <Typography variant="body1" sx={{ mb: 2 }}>
                                            {warning.message}
                                        </Typography>
                                        <Box display="flex" alignItems="center" justifyContent="space-between">
                                            <Chip
                                                icon={<HistoryIcon />}
                                                label={format(new Date(warning.created_at), 'MMM dd, yyyy HH:mm')}
                                                size="small"
                                                variant="outlined"
                                            />
                                            {!warning.is_read && (
                                                <Chip
                                                    icon={<PriorityHighIcon />}
                                                    label="Unread"
                                                    color="warning"
                                                    size="small"
                                                />
                                            )}
                                        </Box>
                                    </Alert>
                                    {index < warnings.length - 1 && <Divider sx={{ my: 2 }} />}
                                </Box>
                            ))}
                        </Box>
                    )}
                </Card>

                {/* Information Section */}
                <Card sx={{ p: 3 }}>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3 }}>
                        About Warnings
                    </Typography>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <Box display="flex" alignItems="flex-start" mb={2}>
                                <Avatar sx={{ bgcolor: 'warning.main', mr: 2, mt: 0.5 }}>
                                    <WarningIcon />
                                </Avatar>
                                <Box>
                                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                                        What are warnings?
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Warnings are important messages from administrators about your account or donation behavior. They help maintain community standards.
                                    </Typography>
                                </Box>
                            </Box>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Box display="flex" alignItems="flex-start" mb={2}>
                                <Avatar sx={{ bgcolor: 'info.main', mr: 2, mt: 0.5 }}>
                                    <CheckCircleIcon />
                                </Avatar>
                                <Box>
                                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                                        How to respond
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Read the warning carefully and take appropriate action. You can dismiss warnings once you've addressed the concerns.
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

export default DonorWarningsPage; 