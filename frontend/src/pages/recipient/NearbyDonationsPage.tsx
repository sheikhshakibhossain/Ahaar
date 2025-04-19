import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Alert,
  CircularProgress,
  Container,
  Card,
  CardContent,
  CardMedia,
  Button,
  Chip,
  TextField,
  InputAdornment,
  IconButton,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  MyLocation,
  Search,
  FilterList,
  Sort,
  LocationOn,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { DonationDetailsDialog } from '../../components/donation/DonationDetailsDialog';
import { Donation } from '../../types/donation';
import { donationService } from '../../services/donationService';

interface NearbyDonation extends Donation {
  distance: number;
}

export const NearbyDonationsPage: React.FC = () => {
  const navigate = useNavigate();
  const [donations, setDonations] = useState<NearbyDonation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedDonation, setSelectedDonation] = useState<NearbyDonation | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [maxDistance, setMaxDistance] = useState(10); // in kilometers
  const [sortBy, setSortBy] = useState<'distance' | 'expiry'>('distance');
  const [claimQuantity, setClaimQuantity] = useState<number>(1);
  const [claimDialogOpen, setClaimDialogOpen] = useState(false);

  // Get user's location
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          setError('Unable to get your location. Please enable location services.');
        }
      );
    } else {
      setError('Geolocation is not supported by your browser.');
    }
  }, []);

  // Fetch available donations
  useEffect(() => {
    const fetchDonations = async () => {
      try {
        setLoading(true);
        const data = await donationService.getAvailableDonations();
        // Filter available donations and calculate distances
        const availableDonations = data
          .filter((d: Donation) => d.status === 'available')
          .map((d: Donation) => {
            // Calculate distance if user location is available
            let distance = -1; // -1 indicates unknown distance
            console.log('Processing donation:', d.title);
            console.log('User location:', userLocation);
            console.log('Donation location:', d.location);
            
            if (userLocation && d.location) {
              try {
                // Parse location data if it's a string
                const donationLocation = typeof d.location === 'string' 
                  ? JSON.parse(d.location) 
                  : d.location;
                
                console.log('Parsed donation location:', donationLocation);

                // Calculate distance using the Haversine formula
                const R = 6371; // Earth's radius in km
                const lat1 = userLocation.lat * Math.PI / 180;
                const lat2 = donationLocation.lat * Math.PI / 180;
                const deltaLat = (donationLocation.lat - userLocation.lat) * Math.PI / 180;
                const deltaLng = (donationLocation.lng - userLocation.lng) * Math.PI / 180;

                const a = Math.sin(deltaLat/2) * Math.sin(deltaLat/2) +
                        Math.cos(lat1) * Math.cos(lat2) *
                        Math.sin(deltaLng/2) * Math.sin(deltaLng/2);
                const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
                distance = R * c;
                
                console.log('Calculated distance:', distance);
              } catch (err) {
                console.error('Error processing location:', err);
                distance = -1;
              }
            } else {
              console.log('Missing location data - userLocation or donation.location not available');
            }

            return {
              ...d,
              distance
            } as NearbyDonation;
          })
          .filter(d => {
            // Only filter by distance if we have a valid distance and maxDistance is set
            if (d.distance === -1) return true;
            return d.distance <= maxDistance;
          })
          .sort((a, b) => {
            if (sortBy === 'distance') {
              // Put unknown distances at the end
              if (a.distance === -1) return 1;
              if (b.distance === -1) return -1;
              return a.distance - b.distance;
            } else {
              return new Date(a.expiry_date).getTime() - new Date(b.expiry_date).getTime();
            }
          });

        setDonations(availableDonations);
      } catch (err) {
        setError('Failed to fetch donations. Please try again later.');
        console.error('Error fetching donations:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDonations();
  }, [userLocation, maxDistance, sortBy]);

  const handleClaimClick = (donation: NearbyDonation) => {
    setSelectedDonation(donation);
    setClaimQuantity(1);
    setClaimDialogOpen(true);
  };

  const handleClaimConfirm = async () => {
    if (!selectedDonation) return;

    try {
      setLoading(true);
      await donationService.claimDonation(selectedDonation.id, claimQuantity);
      setClaimDialogOpen(false);
      // Refresh the donations list
      const updatedDonations = donations.filter(d => d.id !== selectedDonation.id);
      setDonations(updatedDonations);
      // Show success message or redirect
      navigate('/recipient/claimed-donations');
    } catch (err: any) {
      // Handle specific error messages from the backend
      const errorMessage = err.response?.data?.error || 'Failed to claim donation. Please try again.';
      setError(errorMessage);
      console.error('Error claiming donation:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="Available Donations">
      <Container maxWidth="lg">
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Filters and Search */}
          <Box>
            <Paper sx={{ p: 2, mb: 2 }}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ flex: '1 1 30%', minWidth: '250px' }}>
                  <TextField
                    fullWidth
                    placeholder="Search donations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>
                <Box sx={{ flex: '1 1 30%', minWidth: '250px' }}>
                  <FormControl fullWidth>
                    <InputLabel>Sort By</InputLabel>
                    <Select
                      value={sortBy}
                      label="Sort By"
                      onChange={(e) => setSortBy(e.target.value as 'distance' | 'expiry')}
                    >
                      <MenuItem value="distance">Distance</MenuItem>
                      <MenuItem value="expiry">Expiry Date</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                <Box sx={{ flex: '1 1 30%', minWidth: '250px' }}>
                  <Box sx={{ px: 2 }}>
                    <Typography gutterBottom>Maximum Distance: {maxDistance}km</Typography>
                    <Slider
                      value={maxDistance}
                      onChange={(_, value) => setMaxDistance(value as number)}
                      min={1}
                      max={50}
                      step={1}
                      valueLabelDisplay="auto"
                    />
                  </Box>
                </Box>
              </Box>
            </Paper>
          </Box>

          {/* Donations List */}
          <Box>
            {loading ? (
              <Box display="flex" justifyContent="center" p={4}>
                <CircularProgress />
              </Box>
            ) : donations.length === 0 ? (
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography>No donations found matching your criteria.</Typography>
              </Paper>
            ) : (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                {donations.map((donation) => (
                  <Box key={donation.id} sx={{ flex: '1 1 30%', minWidth: '300px' }}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          {donation.title}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          {donation.description}
                        </Typography>
                        <Box sx={{ mt: 2 }}>
                          {donation.distance >= 0 ? (
                            <Chip
                              icon={<LocationOn />}
                              label={`${donation.distance.toFixed(1)}km away`}
                              size="small"
                              sx={{ mr: 1 }}
                            />
                          ) : (
                            <Chip
                              icon={<LocationOn />}
                              label="Distance unknown"
                              size="small"
                              sx={{ mr: 1 }}
                            />
                          )}
                          <Chip
                            label={`Expires: ${format(new Date(donation.expiry_date), 'MMM d, h:mm a')}`}
                            size="small"
                            color="warning"
                          />
                        </Box>
                        <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                          <Button
                            variant="contained"
                            color="primary"
                            fullWidth
                            onClick={() => handleClaimClick(donation)}
                          >
                            Claim Now
                          </Button>
                          <Button
                            variant="outlined"
                            fullWidth
                            onClick={() => {
                              setSelectedDonation(donation);
                              setShowDetailsDialog(true);
                            }}
                          >
                            Details
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        </Box>

        <DonationDetailsDialog
          donation={selectedDonation}
          open={showDetailsDialog}
          onClose={() => {
            setShowDetailsDialog(false);
            setSelectedDonation(null);
          }}
        />

        <Dialog open={claimDialogOpen} onClose={() => setClaimDialogOpen(false)}>
          <DialogTitle>Claim Donation</DialogTitle>
          <DialogContent>
            <Typography gutterBottom>
              How many items would you like to claim?
            </Typography>
            <TextField
              type="number"
              label="Quantity"
              value={claimQuantity}
              onChange={(e) => setClaimQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              inputProps={{ min: 1, max: selectedDonation?.quantity || 1 }}
              fullWidth
              sx={{ mt: 2 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setClaimDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleClaimConfirm} variant="contained" color="primary">
              Confirm Claim
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </DashboardLayout>
  );
}; 