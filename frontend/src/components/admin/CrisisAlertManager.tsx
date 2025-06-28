import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Alert,
    CircularProgress,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    IconButton,
    Grid,
    Card,
    CardContent,
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Refresh as RefreshIcon,
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

export const CrisisAlertManager: React.FC = () => {
    const [alerts, setAlerts] = useState<CrisisAlert[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [selectedAlert, setSelectedAlert] = useState<CrisisAlert | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        message: '',
        alert_type: 'admin_alert',
        severity: 'medium',
        affected_areas: '',
        source_url: '',
    });

    const fetchAlerts = async () => {
        try {
            setLoading(true);
            const response = await api.get<{ results: CrisisAlert[] }>('/api/admin/crisis-alerts/');
            setAlerts(response.data.results || []);
            setError(null);
        } catch (err) {
            console.error('Error fetching alerts:', err);
            setError('Failed to fetch crisis alerts');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAlerts();
    }, []);

    const handleCreateAlert = async () => {
        try {
            const alertData = {
                ...formData,
                affected_areas: formData.affected_areas.split(',').map(area => area.trim()).filter(Boolean),
            };

            await api.post('/api/admin/crisis-alerts/send/', alertData);
            setShowCreateDialog(false);
            setFormData({
                title: '',
                message: '',
                alert_type: 'admin_alert',
                severity: 'medium',
                affected_areas: '',
                source_url: '',
            });
            fetchAlerts();
        } catch (err) {
            console.error('Error creating alert:', err);
            setError('Failed to create alert');
        }
    };

    const handleEditAlert = async () => {
        if (!selectedAlert) return;

        try {
            const alertData = {
                ...formData,
                affected_areas: formData.affected_areas.split(',').map(area => area.trim()).filter(Boolean),
            };

            await api.put(`/api/admin/crisis-alerts/${selectedAlert.id}/`, alertData);
            setShowEditDialog(false);
            setSelectedAlert(null);
            setFormData({
                title: '',
                message: '',
                alert_type: 'admin_alert',
                severity: 'medium',
                affected_areas: '',
                source_url: '',
            });
            fetchAlerts();
        } catch (err) {
            console.error('Error updating alert:', err);
            setError('Failed to update alert');
        }
    };

    const handleDeleteAlert = async (alertId: number) => {
        if (!confirm('Are you sure you want to delete this alert?')) return;

        try {
            await api.delete(`/api/admin/crisis-alerts/${alertId}/`);
            fetchAlerts();
        } catch (err) {
            console.error('Error deleting alert:', err);
            setError('Failed to delete alert');
        }
    };

    const handleRefreshSystemAlerts = async () => {
        try {
            await api.post('/api/admin/crisis-alerts/refresh-system/');
            fetchAlerts();
        } catch (err) {
            console.error('Error refreshing system alerts:', err);
            setError('Failed to refresh system alerts');
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

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h5" component="h2">
                    Crisis Alert Management
                </Typography>
                <Box display="flex" gap={2}>
                    <Button
                        variant="outlined"
                        startIcon={<RefreshIcon />}
                        onClick={handleRefreshSystemAlerts}
                    >
                        Refresh System Alerts
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => setShowCreateDialog(true)}
                    >
                        Create Alert
                    </Button>
                </Box>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            {/* Statistics Cards */}
            <Grid container spacing={3} mb={3}>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom>
                                Total Alerts
                            </Typography>
                            <Typography variant="h4">
                                {alerts.length}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom>
                                Active Alerts
                            </Typography>
                            <Typography variant="h4">
                                {alerts.filter(a => a.is_active && !a.is_expired).length}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom>
                                System Generated
                            </Typography>
                            <Typography variant="h4">
                                {alerts.filter(a => a.is_system_generated).length}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom>
                                Critical Alerts
                            </Typography>
                            <Typography variant="h4">
                                {alerts.filter(a => a.severity === 'critical').length}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Alerts Table */}
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Title</TableCell>
                            <TableCell>Type</TableCell>
                            <TableCell>Severity</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Created</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {alerts.map((alert) => (
                            <TableRow key={alert.id}>
                                <TableCell>
                                    <Typography variant="subtitle2">
                                        {alert.title}
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary">
                                        {alert.message.substring(0, 100)}...
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={alert.alert_type_display}
                                        size="small"
                                    />
                                    {alert.is_system_generated && (
                                        <Chip
                                            label="Auto"
                                            size="small"
                                            variant="outlined"
                                            sx={{ ml: 1 }}
                                        />
                                    )}
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        icon={getSeverityIcon(alert.severity)}
                                        label={alert.severity_display}
                                        color={getSeverityColor(alert.severity) as any}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={alert.is_expired ? 'Expired' : (alert.is_active ? 'Active' : 'Inactive')}
                                        color={alert.is_expired ? 'error' : (alert.is_active ? 'success' : 'default')}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>
                                    {new Date(alert.created_at).toLocaleDateString()}
                                </TableCell>
                                <TableCell>
                                    <Box display="flex" gap={1}>
                                        <IconButton
                                            size="small"
                                            onClick={() => {
                                                setSelectedAlert(alert);
                                                setFormData({
                                                    title: alert.title,
                                                    message: alert.message,
                                                    alert_type: alert.alert_type,
                                                    severity: alert.severity,
                                                    affected_areas: alert.affected_areas.join(', '),
                                                    source_url: alert.source_url || '',
                                                });
                                                setShowEditDialog(true);
                                            }}
                                        >
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            color="error"
                                            onClick={() => handleDeleteAlert(alert.id)}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Create Alert Dialog */}
            <Dialog open={showCreateDialog} onClose={() => setShowCreateDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle>Create Crisis Alert</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Title"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                required
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Message"
                                value={formData.message}
                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                multiline
                                rows={4}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                                <InputLabel>Alert Type</InputLabel>
                                <Select
                                    value={formData.alert_type}
                                    onChange={(e) => setFormData({ ...formData, alert_type: e.target.value })}
                                    label="Alert Type"
                                >
                                    <MenuItem value="admin_alert">Admin Alert</MenuItem>
                                    <MenuItem value="natural_disaster">Natural Disaster</MenuItem>
                                    <MenuItem value="weather_alert">Weather Alert</MenuItem>
                                    <MenuItem value="health_crisis">Health Crisis</MenuItem>
                                    <MenuItem value="security_alert">Security Alert</MenuItem>
                                    <MenuItem value="system_alert">System Alert</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                                <InputLabel>Severity</InputLabel>
                                <Select
                                    value={formData.severity}
                                    onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                                    label="Severity"
                                >
                                    <MenuItem value="low">Low</MenuItem>
                                    <MenuItem value="medium">Medium</MenuItem>
                                    <MenuItem value="high">High</MenuItem>
                                    <MenuItem value="critical">Critical</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Affected Areas (comma-separated)"
                                value={formData.affected_areas}
                                onChange={(e) => setFormData({ ...formData, affected_areas: e.target.value })}
                                placeholder="City, State, Country"
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Source URL (optional)"
                                value={formData.source_url}
                                onChange={(e) => setFormData({ ...formData, source_url: e.target.value })}
                                placeholder="https://example.com"
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowCreateDialog(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleCreateAlert} variant="contained">
                        Create Alert
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Edit Alert Dialog */}
            <Dialog open={showEditDialog} onClose={() => setShowEditDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle>Edit Crisis Alert</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Title"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                required
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Message"
                                value={formData.message}
                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                multiline
                                rows={4}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                                <InputLabel>Alert Type</InputLabel>
                                <Select
                                    value={formData.alert_type}
                                    onChange={(e) => setFormData({ ...formData, alert_type: e.target.value })}
                                    label="Alert Type"
                                >
                                    <MenuItem value="admin_alert">Admin Alert</MenuItem>
                                    <MenuItem value="natural_disaster">Natural Disaster</MenuItem>
                                    <MenuItem value="weather_alert">Weather Alert</MenuItem>
                                    <MenuItem value="health_crisis">Health Crisis</MenuItem>
                                    <MenuItem value="security_alert">Security Alert</MenuItem>
                                    <MenuItem value="system_alert">System Alert</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                                <InputLabel>Severity</InputLabel>
                                <Select
                                    value={formData.severity}
                                    onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                                    label="Severity"
                                >
                                    <MenuItem value="low">Low</MenuItem>
                                    <MenuItem value="medium">Medium</MenuItem>
                                    <MenuItem value="high">High</MenuItem>
                                    <MenuItem value="critical">Critical</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Affected Areas (comma-separated)"
                                value={formData.affected_areas}
                                onChange={(e) => setFormData({ ...formData, affected_areas: e.target.value })}
                                placeholder="City, State, Country"
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Source URL (optional)"
                                value={formData.source_url}
                                onChange={(e) => setFormData({ ...formData, source_url: e.target.value })}
                                placeholder="https://example.com"
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowEditDialog(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleEditAlert} variant="contained">
                        Update Alert
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}; 