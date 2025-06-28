import React, { useEffect, useState } from 'react';
import {
    Alert,
    AlertTitle,
    Box,
    Button,
    Collapse,
    IconButton,
    Chip,
    Typography,
} from '@mui/material';
import {
    Close as CloseIcon,
    Warning as WarningIcon,
    Error as ErrorIcon,
    Info as InfoIcon,
    Notifications as NotificationsIcon,
} from '@mui/icons-material';
import { api } from '../../services/api';

interface CrisisAlert {
    id: number;
    title: string;
    message: string;
    alert_type: string;
    alert_type_display: string;
    severity: string;
    severity_display: string;
    severity_color: string;
    location?: {
        lat: number;
        lng: number;
    };
    affected_areas: string[];
    is_active: boolean;
    is_system_generated: boolean;
    source_url?: string;
    created_at: string;
    expires_at?: string;
    is_expired: boolean;
}

export const CrisisAlertBanner: React.FC = () => {
    const [alerts, setAlerts] = useState<CrisisAlert[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchAlerts = async () => {
        try {
            setLoading(true);
            const response = await api.get<{ alerts: CrisisAlert[] }>('/api/user/crisis-alerts/');
            console.log('Fetched crisis alerts:', response.data);
            
            // Check if response.data.alerts exists
            if (!response.data || !response.data.alerts) {
                console.warn('No alerts data in response:', response.data);
                setAlerts([]);
                setError(null);
                return;
            }
            
            // Filter out expired alerts and sort by severity
            const activeAlerts = response.data.alerts
                .filter(alert => alert && !alert.is_expired && alert.is_active)
                .sort((a, b) => {
                    const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
                    return (severityOrder[b.severity as keyof typeof severityOrder] || 0) - 
                           (severityOrder[a.severity as keyof typeof severityOrder] || 0);
                });
            
            setAlerts(activeAlerts);
            setError(null);
        } catch (err) {
            console.error('Error fetching crisis alerts:', err);
            setError('Failed to fetch crisis alerts');
            setAlerts([]); // Set empty array on error
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAlerts();
        // Set up polling to check for new alerts every 5 minutes
        const interval = setInterval(fetchAlerts, 300000);
        return () => clearInterval(interval);
    }, []);

    const handleDismiss = async (alertId: number) => {
        try {
            await api.post(`/api/user/crisis-alerts/${alertId}/dismiss/`);
            // Refresh alerts to get the updated list (dismissed alerts will be filtered out)
            fetchAlerts();
        } catch (err) {
            console.error('Error dismissing alert:', err);
        }
    };

    const getSeverityIcon = (severity: string) => {
        switch (severity) {
            case 'critical':
                return <ErrorIcon />;
            case 'high':
                return <WarningIcon />;
            case 'medium':
                return <NotificationsIcon />;
            case 'low':
                return <InfoIcon />;
            default:
                return <InfoIcon />;
        }
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'critical':
                return 'error';
            case 'high':
                return 'warning';
            case 'medium':
                return 'info';
            case 'low':
                return 'success';
            default:
                return 'info';
        }
    };

    // Early returns to prevent rendering issues
    if (loading) {
        return null;
    }

    if (error) {
        return null;
    }

    const visibleAlerts = alerts.filter(alert => alert && !alert.is_expired);

    if (visibleAlerts.length === 0) {
        return null;
    }

    // Wrap the entire render in try-catch to prevent crashes
    try {
        return (
            <Box sx={{ mb: 2 }}>
                {visibleAlerts.map((alert) => (
                    <Alert
                        key={alert.id}
                        severity={getSeverityColor(alert.severity) as any}
                        sx={{ 
                            mb: 1,
                            '& .MuiAlert-icon': {
                                fontSize: '1.5rem'
                            }
                        }}
                        icon={getSeverityIcon(alert.severity)}
                        action={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                {alert.source_url && (
                                    <Button
                                        size="small"
                                        color="inherit"
                                        href={alert.source_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        Learn More
                                    </Button>
                                )}
                                <IconButton
                                    color="inherit"
                                    size="small"
                                    onClick={() => handleDismiss(alert.id)}
                                >
                                    <CloseIcon />
                                </IconButton>
                            </Box>
                        }
                    >
                        <AlertTitle sx={{ fontWeight: 'bold', mb: 1 }}>
                            {alert.title || 'Alert'}
                            {alert.alert_type_display && (
                                <Chip
                                    label={alert.alert_type_display}
                                    size="small"
                                    sx={{ ml: 1, fontSize: '0.7rem' }}
                                />
                            )}
                            {alert.is_system_generated && (
                                <Chip
                                    label="Auto"
                                    size="small"
                                    variant="outlined"
                                    sx={{ ml: 1, fontSize: '0.7rem' }}
                                />
                            )}
                        </AlertTitle>
                        
                        <Typography variant="body2" sx={{ mb: 1 }}>
                            {alert.message || 'No message available'}
                        </Typography>
                        
                        {alert.affected_areas && alert.affected_areas.length > 0 && (
                            <Typography variant="caption" color="text.secondary">
                                <strong>Affected Areas:</strong> {alert.affected_areas.join(', ')}
                            </Typography>
                        )}
                        
                        {alert.location && alert.location.lat && alert.location.lng && (
                            <Typography variant="caption" display="block" color="text.secondary">
                                <strong>Location:</strong> {alert.location.lat.toFixed(4)}, {alert.location.lng.toFixed(4)}
                            </Typography>
                        )}
                    </Alert>
                ))}
            </Box>
        );
    } catch (err) {
        console.error('Error rendering CrisisAlertBanner:', err);
        return null; // Return null instead of crashing
    }
}; 