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
  useTheme,
} from '@mui/material';
import {
  MyLocation,
  Search,
  FilterList,
  Sort,
  LocationOn,
  Inventory as InventoryIcon,
  Favorite as FavoriteIcon,
  TrendingUp as TrendingUpIcon,
  AccessTime as AccessTimeIcon,
  Category as CategoryIcon,
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
  const theme = useTheme();
  const navigate = useNavigate();
  const [donations, setDonations] = useState<NearbyDonation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'distance' | 'expiry'>('distance');
  const [distanceFilter, setDistanceFilter] = useState<number>(50);
  const [categoryFilter, setCategoryFilter] = useState<string>('');

  useEffect(() => {
    fetchDonations();
  }, []);

  const fetchDonations = async () => {
    try {
      setLoading(true);
      const response = await donationService.getAvailableDonations();
      
      // Simulate distance calculation (in a real app, this would use actual location)
      const donationsWithDistance = response.map(donation => ({
        ...donation,
        distance: Math.random() * 50 // Random distance for demo
      }));
      
      setDonations(donationsWithDistance);
    } catch (err) {
      setError('Failed to fetch donations');
      console.error('Error fetching donations:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredDonations = donations
    .filter(donation => {
      const matchesSearch = donation.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           donation.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDistance = donation.distance <= distanceFilter;
      const matchesCategory = !categoryFilter || donation.category === categoryFilter;
      return matchesSearch && matchesDistance && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === 'distance') {
        return a.distance - b.distance;
      } else {
        return new Date(a.expiry_date).getTime() - new Date(b.expiry_date).getTime();
      }
    });

  const stats = {
    total: donations.length,
    nearby: donations.filter(d => d.distance <= 10).length,
    expiringSoon: donations.filter(d => {
      const expiryDate = new Date(d.expiry_date);
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return expiryDate <= tomorrow;
    }).length,
    categories: new Set(donations.map(d => d.category)).size,
  };

  if (loading) {
    return (
      <DashboardLayout title="Available Donations">
        <Container maxWidth="xl">
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
            <CircularProgress />
          </Box>
        </Container>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Available Donations">
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
              Available Donations 🎁
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9, mb: 3 }}>
              Discover generous donations from your community
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
                <Typography variant="h6">Total Available</Typography>
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
                <LocationOn sx={{ fontSize: 40, mb: 2, opacity: 0.8 }} />
                <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {stats.nearby}
                </Typography>
                <Typography variant="h6">Nearby (≤10km)</Typography>
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
                <AccessTimeIcon sx={{ fontSize: 40, mb: 2, opacity: 0.8 }} />
                <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {stats.expiringSoon}
                </Typography>
                <Typography variant="h6">Expiring Soon</Typography>
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
                <CategoryIcon sx={{ fontSize: 40, mb: 2, opacity: 0.8 }} />
                <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {stats.categories}
                </Typography>
                <Typography variant="h6">Categories</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Filters and Search */}
        <Card sx={{ p: 3, mb: 4 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
              Find Donations
            </Typography>
            <Chip 
              icon={<InventoryIcon />}
              label={`${filteredDonations.length} results`}
              color="primary"
            />
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Filters and Search */}
            <Box>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
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
                </Grid>
                <Grid item xs={12} md={4}>
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
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>Category</InputLabel>
                    <Select
                      value={categoryFilter}
                      label="Category"
                      onChange={(e) => setCategoryFilter(e.target.value)}
                    >
                      <MenuItem value="">All Categories</MenuItem>
                      {Array.from(new Set(donations.map(d => d.category))).map(category => (
                        <MenuItem key={category} value={category}>{category}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
              
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Distance: {distanceFilter}km
                </Typography>
                <Slider
                  value={distanceFilter}
                  onChange={(_, value) => setDistanceFilter(value as number)}
                  min={1}
                  max={100}
                  valueLabelDisplay="auto"
                  sx={{ width: '100%' }}
                />
              </Box>
            </Box>

            {/* Donations Grid */}
            {filteredDonations.length === 0 ? (
              <Box textAlign="center" py={4}>
                <FavoriteIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No donations found
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Try adjusting your search criteria or check back later
                </Typography>
              </Box>
            ) : (
              <Grid container spacing={3}>
                {filteredDonations.map((donation) => (
                  <Grid item xs={12} sm={6} md={4} key={donation.id}>
                    <Card 
                      sx={{ 
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        '&:hover': {
                          boxShadow: theme.shadows[8],
                          transform: 'translateY(-4px)',
                          transition: 'all 0.3s ease'
                        }
                      }}
                    >
                      {donation.image && (
                        <CardMedia
                          component="img"
                          height="140"
                          image={donation.image}
                          alt={donation.title}
                        />
                      )}
                      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                          <Typography variant="h6" sx={{ fontWeight: 'bold', flex: 1 }}>
                            {donation.title}
                          </Typography>
                          <Chip
                            label={`${donation.distance.toFixed(1)}km`}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        </Box>
                        
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flex: 1 }}>
                          {donation.description.substring(0, 100)}...
                        </Typography>
                        
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                          <Box display="flex" alignItems="center">
                            <LocationOn sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary">
                              Qty: {donation.quantity}
                            </Typography>
                          </Box>
                          <Chip
                            label={donation.category}
                            size="small"
                            variant="outlined"
                          />
                        </Box>
                        
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Typography variant="body2" color="text.secondary">
                            Expires: {format(new Date(donation.expiry_date), 'MMM dd')}
                          </Typography>
                          <Button
                            variant="contained"
                            size="small"
                            onClick={() => {
                              setSelectedDonation(donation);
                              setShowDetailsDialog(true);
                            }}
                          >
                            View Details
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        </Card>

        <DonationDetailsDialog
          donation={selectedDonation}
          open={showDetailsDialog}
          onClose={() => setShowDetailsDialog(false)}
          onClaim={() => {
            setShowDetailsDialog(false);
            // Refresh donations after claiming
            fetchDonations();
          }}
          isRecipient={true}
        />
      </Container>
    </DashboardLayout>
  );
}; 