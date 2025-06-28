import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Box,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Button,
    Chip,
    TextField,
    InputAdornment,
    CircularProgress,
    Alert,
    Tabs,
    Tab,
    Card,
    CardContent,
    Grid,
    useTheme,
} from '@mui/material';
import {
    Search as SearchIcon,
    Warning as WarningIcon,
    Block as BlockIcon,
    Logout as LogoutIcon,
    LockOpen as UnbanIcon,
    Notifications as NotificationsIcon,
    AdminPanelSettings as AdminIcon,
    People as PeopleIcon,
    Security as SecurityIcon,
    TrendingDown as TrendingDownIcon,
    CheckCircle as CheckCircleIcon,
    Cancel as CancelIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { adminService, BadDonor } from '../../services/admin';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { WarningDialog } from '../../components/admin/WarningDialog';
import { CrisisAlertManager } from '../../components/admin/CrisisAlertManager';

const AdminPanel: React.FC = () => {
    const theme = useTheme();
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const [donors, setDonors] = useState<BadDonor[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalDonors, setTotalDonors] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [minFeedback, setMinFeedback] = useState(3);
    const [sortBy, setSortBy] = useState<'rating' | 'feedback'>('rating');
    const [selectedDonor, setSelectedDonor] = useState<BadDonor | null>(null);
    const [showWarningDialog, setShowWarningDialog] = useState(false);
    const [activeTab, setActiveTab] = useState(0);

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
            toast.success('Logged out successfully');
        } catch (err) {
            console.error('Error logging out:', err);
            toast.error('Failed to log out');
        }
    };

    const fetchBadDonors = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await adminService.getBadDonors({
                page: page + 1,
                page_size: rowsPerPage,
                min_feedback: minFeedback,
                sort_by: sortBy,
                search: searchTerm,
            });
            console.log('API Response:', response);
            setDonors(response.results || []);
            setTotalDonors(response.count || 0);
        } catch (err) {
            console.error('Error fetching bad donors:', err);
            setError('Failed to fetch bad donors');
            setDonors([]); // Always set to array on error
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBadDonors();
        // eslint-disable-next-line
    }, [page, rowsPerPage, minFeedback, sortBy, searchTerm]);

    const handleWarnDonor = (donorId: number) => {
        const donor = donors.find(d => d.id === donorId);
        if (donor) {
            setSelectedDonor(donor);
            setShowWarningDialog(true);
        }
    };

    const handleWarningSent = () => {
        setShowWarningDialog(false);
        setSelectedDonor(null);
        fetchBadDonors();
    };

    const handleBanDonor = async (donorId: number) => {
        try {
            await adminService.banDonor(donorId);
            toast.success('Donor banned successfully');
            fetchBadDonors(); // Refresh the list
        } catch (err) {
            toast.error('Failed to ban donor');
            console.error('Error banning donor:', err);
        }
    };

    const handleUnbanDonor = async (donorId: number) => {
        try {
            await adminService.unbanDonor(donorId);
            toast.success('Donor unbanned successfully');
            fetchBadDonors(); // Refresh the list
        } catch (err) {
            toast.error('Failed to unban donor');
            console.error('Error unbanning donor:', err);
        }
    };

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    // Calculate statistics
    const stats = {
        totalDonors: totalDonors,
        bannedDonors: donors.filter(d => d.is_banned).length,
        warnedDonors: donors.filter(d => (d.warning_count || 0) > 0).length,
        lowRatedDonors: donors.filter(d => d.average_rating < 2.5).length,
    };

    if (loading && donors.length === 0) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
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
                <Box position="relative" zIndex={1} display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                        <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
                            Admin Dashboard 🛡️
                        </Typography>
                        <Typography variant="h6" sx={{ opacity: 0.9, mb: 3 }}>
                            Welcome back, {user?.first_name}! Monitor and manage platform activity
                        </Typography>
                    </Box>
                    <Button
                        variant="outlined"
                        color="inherit"
                        startIcon={<LogoutIcon />}
                        onClick={handleLogout}
                        sx={{ 
                            borderColor: 'rgba(255,255,255,0.3)',
                            color: 'white',
                            '&:hover': { 
                                borderColor: 'white',
                                bgcolor: 'rgba(255,255,255,0.1)'
                            }
                        }}
                    >
                        Logout
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
                            <PeopleIcon sx={{ fontSize: 40, mb: 2, opacity: 0.8 }} />
                            <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                                {stats.totalDonors}
                            </Typography>
                            <Typography variant="h6">Total Donors</Typography>
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
                            <BlockIcon sx={{ fontSize: 40, mb: 2, opacity: 0.8 }} />
                            <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                                {stats.bannedDonors}
                            </Typography>
                            <Typography variant="h6">Banned Donors</Typography>
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
                            <WarningIcon sx={{ fontSize: 40, mb: 2, opacity: 0.8 }} />
                            <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                                {stats.warnedDonors}
                            </Typography>
                            <Typography variant="h6">Warned Donors</Typography>
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
                            <TrendingDownIcon sx={{ fontSize: 40, mb: 2, opacity: 0.8 }} />
                            <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                                {stats.lowRatedDonors}
                            </Typography>
                            <Typography variant="h6">Low Rated</Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Tab Navigation */}
            <Card sx={{ mb: 4 }}>
                <Tabs 
                    value={activeTab} 
                    onChange={(_, newValue) => setActiveTab(newValue)}
                    sx={{
                        '& .MuiTab-root': {
                            minHeight: 64,
                            fontSize: '1rem',
                            fontWeight: 600,
                        }
                    }}
                >
                    <Tab 
                        icon={<WarningIcon />} 
                        label="Bad Donors" 
                        iconPosition="start"
                    />
                    <Tab 
                        icon={<NotificationsIcon />} 
                        label="Crisis Alerts" 
                        iconPosition="start"
                    />
                </Tabs>
            </Card>

            {/* Bad Donors Section */}
            {activeTab === 0 && (
                <Card sx={{ p: 3, mb: 4 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                            Bad Donors Management
                        </Typography>
                        <Box display="flex" gap={2}>
                            <TextField
                                size="small"
                                placeholder="Search donors..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                            <TextField
                                select
                                size="small"
                                value={minFeedback}
                                onChange={(e) => setMinFeedback(Number(e.target.value))}
                                SelectProps={{
                                    native: true,
                                }}
                            >
                                <option value={3}>3+ Feedback</option>
                                <option value={5}>5+ Feedback</option>
                                <option value={10}>10+ Feedback</option>
                            </TextField>
                        </Box>
                    </Box>

                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                    <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
                        <Table>
                            <TableHead>
                                <TableRow sx={{ bgcolor: 'grey.50' }}>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Donations</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Average Rating</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Feedback Count</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {(donors || []).map((donor) => (
                                    <TableRow 
                                        key={donor.id}
                                        sx={{
                                            backgroundColor: donor.is_banned ? 'rgba(255, 0, 0, 0.05)' : 'inherit',
                                            '&:hover': {
                                                backgroundColor: donor.is_banned ? 'rgba(255, 0, 0, 0.1)' : 'rgba(0, 0, 0, 0.04)',
                                            },
                                        }}
                                    >
                                        <TableCell>
                                            <Box display="flex" alignItems="center" gap={1}>
                                                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                                                    {donor.first_name} {donor.last_name}
                                                </Typography>
                                                {donor.is_banned && (
                                                    <Chip
                                                        label="BANNED"
                                                        color="error"
                                                        size="small"
                                                        sx={{ fontWeight: 'bold' }}
                                                    />
                                                )}
                                            </Box>
                                        </TableCell>
                                        <TableCell>{donor.email}</TableCell>
                                        <TableCell>{donor.donation_count}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={donor.average_rating.toFixed(1)}
                                                color={donor.average_rating < 2.5 ? 'error' : 'warning'}
                                                variant="outlined"
                                            />
                                        </TableCell>
                                        <TableCell>{donor.feedback_count}</TableCell>
                                        <TableCell>
                                            <Chip
                                                icon={donor.is_banned ? <BlockIcon /> : <CheckCircleIcon />}
                                                label={donor.is_banned ? 'Banned' : 'Active'}
                                                color={donor.is_banned ? 'error' : 'success'}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Box display="flex" gap={1}>
                                                {donor.is_banned ? (
                                                    <Button
                                                        size="small"
                                                        startIcon={<UnbanIcon />}
                                                        onClick={() => handleUnbanDonor(donor.id)}
                                                        color="success"
                                                        variant="outlined"
                                                    >
                                                        Unban
                                                    </Button>
                                                ) : (
                                                    <>
                                                        <Button
                                                            size="small"
                                                            startIcon={<WarningIcon />}
                                                            onClick={() => handleWarnDonor(donor.id)}
                                                            variant="outlined"
                                                        >
                                                            Warn
                                                        </Button>
                                                        <Button
                                                            size="small"
                                                            startIcon={<BlockIcon />}
                                                            onClick={() => handleBanDonor(donor.id)}
                                                            color="error"
                                                            variant="outlined"
                                                        >
                                                            Ban
                                                        </Button>
                                                    </>
                                                )}
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <TablePagination
                        component="div"
                        count={totalDonors}
                        page={page}
                        onPageChange={handleChangePage}
                        rowsPerPage={rowsPerPage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        sx={{ mt: 2 }}
                    />
                </Card>
            )}

            {/* Crisis Alerts Section */}
            {activeTab === 1 && (
                <CrisisAlertManager />
            )}

            <WarningDialog
                open={showWarningDialog}
                onClose={() => {
                    setShowWarningDialog(false);
                    setSelectedDonor(null);
                }}
                donorId={selectedDonor?.id || 0}
                onWarningSent={handleWarningSent}
            />
        </Container>
    );
};

export default AdminPanel; 