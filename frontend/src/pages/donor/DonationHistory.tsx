import React, { useState, useEffect } from 'react';
import {
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    Chip,
    IconButton,
    Alert,
    Box,
    TextField,
    MenuItem,
    TablePagination,
    TableSortLabel,
    Toolbar,
    Button,
} from '@mui/material';
import {
    Cancel as CancelIcon,
    Visibility as VisibilityIcon,
    FilterList as FilterListIcon,
    LocationOn,
} from '@mui/icons-material';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { DonationDetailsDialog } from '../../components/donation/DonationDetailsDialog';
import { DateRangePicker } from '@mui/x-date-pickers-pro/DateRangePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format } from 'date-fns';
import { Donation, DonationFilter } from '../../types/donation';
import { api } from '../../services/api';

export const DonationHistory: React.FC = () => {
    const [donations, setDonations] = useState<Donation[]>([]);
    const [filteredDonations, setFilteredDonations] = useState<Donation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');
    const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);
    const [showDetailsDialog, setShowDetailsDialog] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    
    // Pagination
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    
    // Sorting
    const [orderBy, setOrderBy] = useState<keyof Donation>('created_at');
    const [order, setOrder] = useState<'asc' | 'desc'>('desc');
    
    // Filters
    const [filters, setFilters] = useState<DonationFilter>({
        status: '',
        dateRange: {
            start: null,
            end: null,
        },
        searchQuery: '',
    });

    const fetchDonations = async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/donations/');
            setDonations(response.data);
            applyFilters(response.data, filters);
        } catch (err) {
            setError('Failed to load donation history');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDonations();
    }, []);

    useEffect(() => {
        applyFilters(donations, filters);
    }, [filters]);

    const applyFilters = (data: Donation[], currentFilters: DonationFilter) => {
        let filtered = [...data];

        // Apply status filter
        if (currentFilters.status) {
            filtered = filtered.filter(d => d.status === currentFilters.status);
        }

        // Apply date range filter
        if (currentFilters.dateRange?.start && currentFilters.dateRange?.end) {
            filtered = filtered.filter(d => {
                const donationDate = new Date(d.created_at);
                return donationDate >= currentFilters.dateRange!.start! &&
                       donationDate <= currentFilters.dateRange!.end!;
            });
        }

        // Apply search query
        if (currentFilters.searchQuery) {
            const query = currentFilters.searchQuery.toLowerCase();
            filtered = filtered.filter(d =>
                d.title.toLowerCase().includes(query) ||
                d.description.toLowerCase().includes(query)
            );
        }

        // Apply sorting
        filtered.sort((a, b) => {
            const aValue = a[orderBy] ?? '';
            const bValue = b[orderBy] ?? '';
            
            if (order === 'asc') {
                return aValue < bValue ? -1 : 1;
            } else {
                return aValue > bValue ? -1 : 1;
            }
        });

        setFilteredDonations(filtered);
    };

    const handleSort = (property: keyof Donation) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
        applyFilters(donations, filters);
    };

    const handleCancel = async (id: number) => {
        try {
            await api.post(`/api/donations/${id}/cancel/`);
            fetchDonations();
        } catch (err) {
            setError('Failed to cancel donation');
        }
    };

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

    const getLocationDisplay = (donation: Donation) => {
        try {
            if (!donation.location) return 'No location';
            
            // If location is already an object, use it directly
            if (typeof donation.location === 'object') {
                return donation.location.address || 'No address';
            }
            
            // If location is a string, try to parse it
            const locationData = JSON.parse(donation.location);
            return locationData.address || 'No address';
        } catch (error) {
            console.error('Error parsing location:', error);
            return 'Invalid location';
        }
    };

    return (
        <DashboardLayout title="Donation History">
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            
            <Paper elevation={3}>
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{ flex: '1 1 100%' }}>
                        Donations
                    </Typography>
                    <Button
                        startIcon={<FilterListIcon />}
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        Filters
                    </Button>
                </Toolbar>

                {showFilters && (
                    <Box sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                            <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
                                <TextField
                                    fullWidth
                                    label="Search"
                                    value={filters.searchQuery}
                                    onChange={(e) => setFilters(prev => ({
                                        ...prev,
                                        searchQuery: e.target.value
                                    }))}
                                />
                            </Box>
                            <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
                                <TextField
                                    fullWidth
                                    select
                                    label="Status"
                                    value={filters.status}
                                    onChange={(e) => setFilters(prev => ({
                                        ...prev,
                                        status: e.target.value
                                    }))}
                                >
                                    <MenuItem value="">All</MenuItem>
                                    <MenuItem value="available">Available</MenuItem>
                                    <MenuItem value="claimed">Claimed</MenuItem>
                                    <MenuItem value="expired">Expired</MenuItem>
                                    <MenuItem value="cancelled">Cancelled</MenuItem>
                                </TextField>
                            </Box>
                            <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
                                <LocalizationProvider dateAdapter={AdapterDateFns}>
                                    <DateRangePicker
                                        value={[filters.dateRange?.start ?? null, filters.dateRange?.end ?? null]}
                                        onChange={(newValue) => setFilters(prev => ({
                                            ...prev,
                                            dateRange: {
                                                start: newValue[0],
                                                end: newValue[1]
                                            }
                                        }))}
                                    />
                                </LocalizationProvider>
                            </Box>
                        </Box>
                    </Box>
                )}

                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>
                                    <TableSortLabel
                                        active={orderBy === 'title'}
                                        direction={orderBy === 'title' ? order : 'asc'}
                                        onClick={() => handleSort('title')}
                                    >
                                        Title
                                    </TableSortLabel>
                                </TableCell>
                                <TableCell>
                                    <TableSortLabel
                                        active={orderBy === 'status'}
                                        direction={orderBy === 'status' ? order : 'asc'}
                                        onClick={() => handleSort('status')}
                                    >
                                        Status
                                    </TableSortLabel>
                                </TableCell>
                                <TableCell>Location</TableCell>
                                <TableCell>
                                    <TableSortLabel
                                        active={orderBy === 'created_at'}
                                        direction={orderBy === 'created_at' ? order : 'asc'}
                                        onClick={() => handleSort('created_at')}
                                    >
                                        Created At
                                    </TableSortLabel>
                                </TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {(rowsPerPage > 0
                                ? filteredDonations.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                : filteredDonations
                            ).map((donation) => {
                                // Parse location data
                                let locationStr = 'No location';
                                try {
                                    const location = typeof donation.location === 'string' 
                                        ? JSON.parse(donation.location) 
                                        : donation.location;
                                    if (location && location.lat && location.lng) {
                                        locationStr = `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`;
                                    }
                                } catch (err) {
                                    console.error('Error parsing location:', err);
                                }

                                return (
                                    <TableRow key={donation.id}>
                                        <TableCell>{donation.title}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={donation.status_display || donation.status}
                                                color={getStatusColor(donation.status) as any}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                icon={<LocationOn />}
                                                label={locationStr}
                                                size="small"
                                                variant="outlined"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            {format(new Date(donation.created_at), 'MMM d, yyyy h:mm a')}
                                        </TableCell>
                                        <TableCell>
                                            <IconButton
                                                onClick={() => {
                                                    setSelectedDonation(donation);
                                                    setShowDetailsDialog(true);
                                                }}
                                                size="small"
                                            >
                                                <VisibilityIcon />
                                            </IconButton>
                                            {donation.status === 'available' && (
                                                <IconButton
                                                    onClick={() => handleCancel(donation.id)}
                                                    size="small"
                                                    color="error"
                                                >
                                                    <CancelIcon />
                                                </IconButton>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
                
                <TablePagination
                    component="div"
                    count={filteredDonations.length}
                    page={page}
                    onPageChange={(e, newPage) => setPage(newPage)}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={(e) => {
                        setRowsPerPage(parseInt(e.target.value, 10));
                        setPage(0);
                    }}
                />
                
                {filteredDonations.length === 0 && !loading && (
                    <Box p={3} textAlign="center">
                        <Typography color="textSecondary">
                            No donations found
                        </Typography>
                    </Box>
                )}
            </Paper>

            <DonationDetailsDialog
                donation={selectedDonation}
                open={showDetailsDialog}
                onClose={() => {
                    setShowDetailsDialog(false);
                    setSelectedDonation(null);
                }}
            />
        </DashboardLayout>
    );
}; 