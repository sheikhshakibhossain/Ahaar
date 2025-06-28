import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    Container,
    Typography,
    Box,
    Card,
    CardContent,
    CardMedia,
    Button,
    Chip,
    TextField,
    InputAdornment,
    Grid,
    Alert,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    Slider,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Paper,
} from '@mui/material';
import {
    Search,
    FilterList,
    Sort,
    LocationOn,
    MyLocation,
    AccessTime,
    Category,
    Close,
    Map,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { api } from '../services/api';
import { Donation } from '../types/donation';

interface EventDonation extends Donation {
    distance?: number;
}

const EventPage: React.FC = () => {
    const [donations, setDonations] = useState<EventDonation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [distanceFilter, setDistanceFilter] = useState(50);
    const [sortBy, setSortBy] = useState('distance');
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [selectedDonation, setSelectedDonation] = useState<EventDonation | null>(null);
    const [showDetailsDialog, setShowDetailsDialog] = useState(false);
    const [showMapDialog, setShowMapDialog] = useState(false);

    useEffect(() => {
        // Get user's location
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setUserLocation({ lat: latitude, lng: longitude });
                },
                (error) => {
                    console.error('Error getting location:', error);
                }
            );
        }

        fetchDonations();
    }, []);

    const fetchDonations = async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/public/donations/');
            let donationsData = response.data.filter((donation: Donation) => {
                // Check if donation is available using multiple criteria
                const isAvailable = donation.is_available !== false; // Default to true if not specified
                const hasRemainingQuantity = donation.remaining_quantity > 0;
                const isNotExpired = new Date(donation.expiry_date) > new Date();
                return isAvailable && hasRemainingQuantity && isNotExpired;
            });

            // Calculate distances if user location is available
            if (userLocation) {
                donationsData = donationsData.map((donation: EventDonation) => {
                    if (donation.location && donation.location.lat && donation.location.lng) {
                        const distance = calculateDistance(
                            userLocation.lat,
                            userLocation.lng,
                            donation.location.lat,
                            donation.location.lng
                        );
                        return { ...donation, distance };
                    }
                    return donation;
                });
            }

            setDonations(donationsData);
        } catch (err) {
            console.error('Error fetching donations:', err);
            setError('Failed to fetch donations');
        } finally {
            setLoading(false);
        }
    };

    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
        const R = 6371; // Radius of the Earth in kilometers
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    };

    const filteredDonations = donations
        .filter(donation => {
            const matchesSearch = donation.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                donation.description.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = categoryFilter === 'all' || donation.category === categoryFilter;
            const matchesDistance = !userLocation || !donation.distance || donation.distance <= distanceFilter;
            return matchesSearch && matchesCategory && matchesDistance;
        })
        .sort((a, b) => {
            switch (sortBy) {
                case 'distance':
                    if (!userLocation) return 0;
                    return (a.distance || Infinity) - (b.distance || Infinity);
                case 'expiry':
                    return new Date(a.expiry_date).getTime() - new Date(b.expiry_date).getTime();
                case 'created':
                    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                default:
                    return 0;
            }
        });

    const handleDonationClick = (donation: EventDonation) => {
        setSelectedDonation(donation);
        setShowDetailsDialog(true);
    };

    const handleMapClick = (donation: EventDonation) => {
        setSelectedDonation(donation);
        setShowMapDialog(true);
    };

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'cooked': return 'success';
            case 'packaged': return 'info';
            case 'raw': return 'warning';
            default: return 'default';
        }
    };

    const getCategoryLabel = (category: string) => {
        switch (category) {
            case 'cooked': return 'Cooked Food';
            case 'packaged': return 'Packaged Food';
            case 'raw': return 'Raw Ingredients';
            default: return 'Other';
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
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <section className="bg-gradient-to-br from-green-600 to-teal-600 text-white py-16">
                <Container maxWidth="lg">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-center"
                    >
                        <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
                            🍽️ Current Donation Event Near You
                        </Typography>
                        <Typography variant="h6" color="green.100" paragraph>
                            Discover fresh food donations available in your area
                        </Typography>
                        <Box mt={3}>
                            <Link to="/register">
                                <Button 
                                    variant="contained" 
                                    size="large"
                                    sx={{ 
                                        bgcolor: 'white', 
                                        color: 'green.700',
                                        '&:hover': { bgcolor: 'green.50' }
                                    }}
                                >
                                    Join Our Community
                                </Button>
                            </Link>
                        </Box>
                    </motion.div>
                </Container>
            </section>

            {/* Filters and Search */}
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Paper sx={{ p: 3, mb: 4 }}>
                    <Grid container spacing={3} alignItems="center">
                        <Grid item xs={12} md={4}>
                            <TextField
                                fullWidth
                                placeholder="Search donations..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Search />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} md={2}>
                            <FormControl fullWidth>
                                <InputLabel>Category</InputLabel>
                                <Select
                                    value={categoryFilter}
                                    onChange={(e) => setCategoryFilter(e.target.value)}
                                    label="Category"
                                >
                                    <MenuItem value="all">All Categories</MenuItem>
                                    <MenuItem value="cooked">Cooked Food</MenuItem>
                                    <MenuItem value="packaged">Packaged Food</MenuItem>
                                    <MenuItem value="raw">Raw Ingredients</MenuItem>
                                    <MenuItem value="other">Other</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={2}>
                            <FormControl fullWidth>
                                <InputLabel>Sort By</InputLabel>
                                <Select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    label="Sort By"
                                >
                                    <MenuItem value="distance">Distance</MenuItem>
                                    <MenuItem value="expiry">Expiry Date</MenuItem>
                                    <MenuItem value="created">Recently Added</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Typography variant="body2" gutterBottom>
                                Max Distance: {distanceFilter} km
                            </Typography>
                            <Slider
                                value={distanceFilter}
                                onChange={(_, value) => setDistanceFilter(value as number)}
                                min={1}
                                max={100}
                                valueLabelDisplay="auto"
                            />
                        </Grid>
                    </Grid>
                </Paper>

                {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {error}
                    </Alert>
                )}

                {/* Donations Grid */}
                <Grid container spacing={3}>
                    {filteredDonations.map((donation, index) => (
                        <Grid item xs={12} sm={6} md={4} key={donation.id}>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: index * 0.1 }}
                            >
                                <Card 
                                    sx={{ 
                                        height: '100%', 
                                        display: 'flex', 
                                        flexDirection: 'column',
                                        cursor: 'pointer',
                                        '&:hover': {
                                            transform: 'translateY(-4px)',
                                            boxShadow: 4,
                                            transition: 'all 0.3s ease'
                                        }
                                    }}
                                    onClick={() => handleDonationClick(donation)}
                                >
                                    {donation.image && (
                                        <CardMedia
                                            component="img"
                                            height="200"
                                            image={donation.image}
                                            alt={donation.title}
                                        />
                                    )}
                                    <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                                        <Typography variant="h6" component="h2" gutterBottom>
                                            {donation.title}
                                        </Typography>
                                        
                                        <Typography variant="body2" color="text.secondary" paragraph sx={{ flexGrow: 1 }}>
                                            {donation.description.length > 100 
                                                ? `${donation.description.substring(0, 100)}...` 
                                                : donation.description
                                            }
                                        </Typography>

                                        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                                            <Chip 
                                                label={getCategoryLabel(donation.category)}
                                                color={getCategoryColor(donation.category) as any}
                                                size="small"
                                            />
                                            {donation.distance && (
                                                <Chip 
                                                    icon={<LocationOn />}
                                                    label={`${donation.distance.toFixed(1)} km`}
                                                    variant="outlined"
                                                    size="small"
                                                />
                                            )}
                                        </Box>

                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Typography variant="body2" color="text.secondary">
                                                <AccessTime sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                                                Expires: {format(new Date(donation.expiry_date), 'MMM dd, HH:mm')}
                                            </Typography>
                                            <IconButton 
                                                size="small"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleMapClick(donation);
                                                }}
                                            >
                                                <Map />
                                            </IconButton>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </Grid>
                    ))}
                </Grid>

                {filteredDonations.length === 0 && !loading && (
                    <Box textAlign="center" py={8}>
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                            No donations found
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Try adjusting your filters or check back later
                        </Typography>
                    </Box>
                )}
            </Container>

            {/* Donation Details Dialog */}
            <Dialog 
                open={showDetailsDialog} 
                onClose={() => setShowDetailsDialog(false)}
                maxWidth="md"
                fullWidth
            >
                {selectedDonation && (
                    <>
                        <DialogTitle>
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                <Typography variant="h6">{selectedDonation.title}</Typography>
                                <IconButton onClick={() => setShowDetailsDialog(false)}>
                                    <Close />
                                </IconButton>
                            </Box>
                        </DialogTitle>
                        <DialogContent>
                            <Grid container spacing={3}>
                                {selectedDonation.image && (
                                    <Grid item xs={12} md={6}>
                                        <img 
                                            src={selectedDonation.image} 
                                            alt={selectedDonation.title}
                                            style={{ width: '100%', borderRadius: '8px' }}
                                        />
                                    </Grid>
                                )}
                                <Grid item xs={12} md={selectedDonation.image ? 6 : 12}>
                                    <Typography variant="body1" paragraph>
                                        {selectedDonation.description}
                                    </Typography>
                                    
                                    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                                        <Chip 
                                            label={getCategoryLabel(selectedDonation.category)}
                                            color={getCategoryColor(selectedDonation.category) as any}
                                        />
                                        {selectedDonation.distance && (
                                            <Chip 
                                                icon={<LocationOn />}
                                                label={`${selectedDonation.distance.toFixed(1)} km away`}
                                                variant="outlined"
                                            />
                                        )}
                                    </Box>

                                    <Typography variant="body2" color="text.secondary" paragraph>
                                        <strong>Quantity:</strong> {selectedDonation.remaining_quantity} available
                                    </Typography>
                                    
                                    <Typography variant="body2" color="text.secondary" paragraph>
                                        <strong>Expires:</strong> {format(new Date(selectedDonation.expiry_date), 'PPP p')}
                                    </Typography>

                                    {selectedDonation.location && (
                                        <Typography variant="body2" color="text.secondary">
                                            <strong>Location:</strong> {selectedDonation.location.address || `${selectedDonation.location.lat.toFixed(6)}, ${selectedDonation.location.lng.toFixed(6)}`}
                                        </Typography>
                                    )}
                                </Grid>
                            </Grid>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setShowDetailsDialog(false)}>
                                Close
                            </Button>
                            <Link to="/register" style={{ textDecoration: 'none' }}>
                                <Button variant="contained" color="primary">
                                    Join to Claim
                                </Button>
                            </Link>
                        </DialogActions>
                    </>
                )}
            </Dialog>

            {/* Map Dialog */}
            <Dialog 
                open={showMapDialog} 
                onClose={() => setShowMapDialog(false)}
                maxWidth="md"
                fullWidth
            >
                {selectedDonation && (
                    <>
                        <DialogTitle>
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                <Typography variant="h6">Location</Typography>
                                <IconButton onClick={() => setShowMapDialog(false)}>
                                    <Close />
                                </IconButton>
                            </Box>
                        </DialogTitle>
                        <DialogContent>
                            <Box sx={{ height: 400, bgcolor: 'grey.100', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Typography variant="body1" color="text.secondary">
                                    Map view would be implemented here
                                </Typography>
                            </Box>
                            {selectedDonation.location && (
                                <Typography variant="body2" sx={{ mt: 2 }}>
                                    <strong>Address:</strong> {selectedDonation.location.address || `${selectedDonation.location.lat.toFixed(6)}, ${selectedDonation.location.lng.toFixed(6)}`}
                                </Typography>
                            )}
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setShowMapDialog(false)}>
                                Close
                            </Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>
        </div>
    );
};

export default EventPage; 