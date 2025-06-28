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
    Button,
    Chip,
    TextField,
    MenuItem,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    TableSortLabel,
    IconButton,
    Tooltip,
    useTheme,
    CircularProgress,
} from '@mui/material';
import {
    History as HistoryIcon,
    CheckCircle as CheckCircleIcon,
    Pending as PendingIcon,
    Cancel as CancelIcon,
    Visibility as VisibilityIcon,
    Search as SearchIcon,
    Sort as SortIcon,
    CalendarToday as CalendarIcon,
    Inventory as InventoryIcon,
    TrendingUp as TrendingUpIcon,
    AccessTime as AccessTimeIcon,
    Category as CategoryIcon,
} from '@mui/icons-material';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { DonationDetailsDialog } from '../../components/donation/DonationDetailsDialog';
import { format } from 'date-fns';
import { Donation } from '../../types/donation';
import { donationService } from '../../services/donationService';

export const RecipientHistory: React.FC = () => {
    const theme = useTheme();
    const [donations, setDonations] = useState<Donation[]>([]);
    const [filteredDonations, setFilteredDonations] = useState<Donation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);
    const [showDetailsDialog, setShowDetailsDialog] = useState(false);
    
    // Pagination
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    
    // Sorting
    const [orderBy, setOrderBy] = useState<keyof Donation>('created_at');
    const [order, setOrder] = useState<'asc' | 'desc'>('desc');
    
    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('');

    const fetchDonations = async () => {
        try {
            setLoading(true);
            const response = await donationService.getClaimedDonations();
            setDonations(response);
            applyFilters(response);
        } catch (err) {
            setError('Failed to load donation history');
            console.error('Error fetching donations:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDonations();
    }, []);

    useEffect(() => {
        applyFilters(donations);
    }, [searchQuery, statusFilter]);

    const applyFilters = (data: Donation[]) => {
        let filtered = [...data];

        // Search filter
        if (searchQuery) {
            filtered = filtered.filter(donation =>
                donation.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                donation.description.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Status filter
        if (statusFilter) {
            filtered = filtered.filter(donation => donation.status === statusFilter);
        }

        setFilteredDonations(filtered);
    };

    const handleSort = (property: keyof Donation) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'claimed':
                return 'info';
            case 'completed':
                return 'success';
            case 'cancelled':
                return 'error';
            default:
                return 'default';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'claimed':
                return <PendingIcon />;
            case 'completed':
                return <CheckCircleIcon />;
            case 'cancelled':
                return <CancelIcon />;
            default:
                return <PendingIcon />;
        }
    };

    // Calculate statistics
    const stats = {
        total: donations.length,
        claimed: donations.filter(d => d.status === 'claimed').length,
        completed: donations.filter(d => d.status === 'completed').length,
        cancelled: donations.filter(d => d.status === 'cancelled').length,
    };

    if (loading) {
        return (
            <DashboardLayout title="My Donations">
                <Container maxWidth="xl">
                    <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                        <CircularProgress />
                    </Box>
                </Container>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="My Donations">
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
                            My Donations 📋
                        </Typography>
                        <Typography variant="h6" sx={{ opacity: 0.9, mb: 3 }}>
                            Track all your claimed donations and their current status
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
                                <InventoryIcon sx={{ fontSize: 40, mb: 2, opacity: 0.8 }} />
                                <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                                    {stats.total}
                                </Typography>
                                <Typography variant="h6">Total Claims</Typography>
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
                                <PendingIcon sx={{ fontSize: 40, mb: 2, opacity: 0.8 }} />
                                <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                                    {stats.claimed}
                                </Typography>
                                <Typography variant="h6">Pending</Typography>
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
                                    {stats.completed}
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
                                    {stats.cancelled}
                                </Typography>
                                <Typography variant="h6">Cancelled</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* Filters and Table */}
                <Card sx={{ p: 3, mb: 4 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                            Your Claimed Donations
                        </Typography>
                        <Chip 
                            icon={<InventoryIcon />}
                            label={`${filteredDonations.length} donations`}
                            color="primary"
                        />
                    </Box>

                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                    {/* Filters */}
                    <Box sx={{ mb: 3 }}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    placeholder="Search donations..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    InputProps={{
                                        startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    select
                                    label="Status"
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                >
                                    <MenuItem value="">All Status</MenuItem>
                                    <MenuItem value="claimed">Claimed</MenuItem>
                                    <MenuItem value="completed">Completed</MenuItem>
                                    <MenuItem value="cancelled">Cancelled</MenuItem>
                                </TextField>
                            </Grid>
                        </Grid>
                    </Box>

                    {/* Donations Table */}
                    {filteredDonations.length === 0 ? (
                        <Box textAlign="center" py={4}>
                            <HistoryIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                            <Typography variant="h6" color="text.secondary" gutterBottom>
                                No donations found
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {donations.length === 0 
                                    ? "You haven't claimed any donations yet. Browse available donations to get started!"
                                    : "No donations match your current filters."
                                }
                            </Typography>
                        </Box>
                    ) : (
                        <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
                            <Table>
                                <TableHead>
                                    <TableRow sx={{ bgcolor: 'grey.50' }}>
                                        <TableCell>
                                            <TableSortLabel
                                                active={orderBy === 'title'}
                                                direction={orderBy === 'title' ? order : 'asc'}
                                                onClick={() => handleSort('title')}
                                            >
                                                Title
                                            </TableSortLabel>
                                        </TableCell>
                                        <TableCell>Status</TableCell>
                                        <TableCell>Quantity</TableCell>
                                        <TableCell>Category</TableCell>
                                        <TableCell>
                                            <TableSortLabel
                                                active={orderBy === 'created_at'}
                                                direction={orderBy === 'created_at' ? order : 'asc'}
                                                onClick={() => handleSort('created_at')}
                                            >
                                                Claimed Date
                                            </TableSortLabel>
                                        </TableCell>
                                        <TableCell>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredDonations
                                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                        .map((donation) => (
                                            <TableRow 
                                                key={donation.id}
                                                sx={{ 
                                                    '&:hover': { 
                                                        bgcolor: 'grey.50',
                                                        cursor: 'pointer'
                                                    }
                                                }}
                                                onClick={() => {
                                                    setSelectedDonation(donation);
                                                    setShowDetailsDialog(true);
                                                }}
                                            >
                                                <TableCell>
                                                    <Box>
                                                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                                                            {donation.title}
                                                        </Typography>
                                                        <Typography variant="body2" color="text.secondary">
                                                            {donation.description.substring(0, 50)}...
                                                        </Typography>
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        icon={getStatusIcon(donation.status)}
                                                        label={donation.status_display}
                                                        color={getStatusColor(donation.status) as any}
                                                        size="small"
                                                    />
                                                </TableCell>
                                                <TableCell>{donation.quantity}</TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={donation.category}
                                                        size="small"
                                                        variant="outlined"
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Box display="flex" alignItems="center">
                                                        <CalendarIcon sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                                                        {format(new Date(donation.created_at), 'MMM dd, yyyy')}
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    <Tooltip title="View Details">
                                                        <IconButton
                                                            size="small"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setSelectedDonation(donation);
                                                                setShowDetailsDialog(true);
                                                            }}
                                                        >
                                                            <VisibilityIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                </TableBody>
                            </Table>
                            <TablePagination
                                rowsPerPageOptions={[5, 10, 25]}
                                component="div"
                                count={filteredDonations.length}
                                rowsPerPage={rowsPerPage}
                                page={page}
                                onPageChange={(event, newPage) => setPage(newPage)}
                                onRowsPerPageChange={(event) => {
                                    setRowsPerPage(parseInt(event.target.value, 10));
                                    setPage(0);
                                }}
                            />
                        </TableContainer>
                    )}
                </Card>

                <DonationDetailsDialog
                    donation={selectedDonation}
                    open={showDetailsDialog}
                    onClose={() => setShowDetailsDialog(false)}
                    isRecipient={true}
                />
            </Container>
        </DashboardLayout>
    );
}; 