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
} from '@mui/material';
import {
    Search as SearchIcon,
    Warning as WarningIcon,
    Block as BlockIcon,
    Logout as LogoutIcon,
    LockOpen as UnbanIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { adminService, BadDonor } from '../../services/admin';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminPanel: React.FC = () => {
    const { logout } = useAuth();
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
            console.log('Donors:', response.donors);
            console.log('First donor:', response.donors[0]);
            console.log('Is banned field:', response.donors[0]?.is_banned);
            setDonors(response.donors || []);
            setTotalDonors(response.total || 0);
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

    const handleWarnDonor = async (donorId: string) => {
        try {
            await adminService.warnDonor(donorId);
            toast.success('Warning sent successfully');
            fetchBadDonors(); // Refresh the list
        } catch (err) {
            toast.error('Failed to send warning');
            console.error('Error warning donor:', err);
        }
    };

    const handleBanDonor = async (donorId: string) => {
        try {
            await adminService.banDonor(donorId);
            toast.success('Donor banned successfully');
            fetchBadDonors(); // Refresh the list
        } catch (err) {
            toast.error('Failed to ban donor');
            console.error('Error banning donor:', err);
        }
    };

    const handleUnbanDonor = async (donorId: string) => {
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

    if (loading && donors.length === 0) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="lg">
            <Box mb={4} display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                    <Typography variant="h4" gutterBottom>
                        Admin Panel
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Manage donors and monitor platform activity
                    </Typography>
                </Box>
                <Button
                    variant="outlined"
                    color="error"
                    startIcon={<LogoutIcon />}
                    onClick={handleLogout}
                >
                    Logout
                </Button>
            </Box>

            {/* Bad Donors Section */}
            <Paper sx={{ p: 3, mb: 4 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography variant="h5">Bad Donors</Typography>
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

                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Name</TableCell>
                                <TableCell>Email</TableCell>
                                <TableCell>Donations</TableCell>
                                <TableCell>Average Rating</TableCell>
                                <TableCell>Feedback Count</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Actions</TableCell>
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
                                            {donor.first_name} {donor.last_name}
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
                                        />
                                    </TableCell>
                                    <TableCell>{donor.feedback_count}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={donor.is_banned ? 'Banned' : 'Active'}
                                            color={donor.is_banned ? 'error' : 'success'}
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
                                                >
                                                    Unban
                                                </Button>
                                            ) : (
                                                <>
                                                    <Button
                                                        size="small"
                                                        startIcon={<WarningIcon />}
                                                        onClick={() => handleWarnDonor(donor.id)}
                                                    >
                                                        Warn
                                                    </Button>
                                                    <Button
                                                        size="small"
                                                        startIcon={<BlockIcon />}
                                                        onClick={() => handleBanDonor(donor.id)}
                                                        color="error"
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
                />
            </Paper>
        </Container>
    );
};

export default AdminPanel; 