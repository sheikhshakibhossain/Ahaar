import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid as MuiGrid,
  Card,
  CardContent,
  CardActions,
  Chip,
  CircularProgress,
  Alert,
  Button,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  LocationOn,
  AccessTime,
  CheckCircle,
  Pending,
  Cancel,
  Visibility,
  Star,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { DonationDetailsDialog } from '../../components/donation/DonationDetailsDialog';
import { RatingDialog } from '../../components/donation/RatingDialog';
import { Donation } from '../../types/donation';
import { api } from '../../services/api';

export const RecipientHistory: React.FC = () => {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showRatingDialog, setShowRatingDialog] = useState(false);

  useEffect(() => {
    const fetchDonations = async () => {
      try {
        setLoading(true);
        const response = await api.get<Donation[]>('/api/donations/claimed/');
        setDonations(response.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load your claimed donations');
      } finally {
        setLoading(false);
      }
    };

    fetchDonations();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'warning';
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
      case 'pending':
        return <Pending />;
      case 'completed':
        return <CheckCircle />;
      case 'cancelled':
        return <Cancel />;
      default:
        return <CheckCircle />;
    }
  };

  const getLocationDisplay = (donation: Donation) => {
    try {
      if (!donation.location) return 'No location';
      
      if (typeof donation.location === 'object') {
        return donation.location.address || `${donation.location.lat}, ${donation.location.lng}`;
      }
      
      const locationData = JSON.parse(donation.location);
      return locationData.address || `${locationData.lat}, ${locationData.lng}`;
    } catch (error) {
      console.error('Error parsing location:', error);
      return 'Invalid location';
    }
  };

  return (
    <DashboardLayout title="My Claimed Donations">
      <Container maxWidth="lg">
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            My Claimed Donations
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Track and manage your claimed donations
          </Typography>
        </Box>
        
        {loading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        ) : donations.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              You haven't claimed any donations yet
            </Typography>
            <Typography color="text.secondary">
              Start exploring available donations to make a difference in your community
            </Typography>
          </Paper>
        ) : (
          <MuiGrid container spacing={3}>
            {donations.map((donation) => (
              <MuiGrid item xs={12} sm={6} md={4} key={donation.id}>
                <Card 
                  sx={{ 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4,
                    },
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Typography variant="h6" component="h2" gutterBottom>
                        {donation.title}
                      </Typography>
                      <Chip
                        icon={getStatusIcon(donation.status)}
                        label={donation.status}
                        color={getStatusColor(donation.status)}
                        size="small"
                      />
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {donation.description}
                    </Typography>
                    
                    <Box sx={{ mt: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <LocationOn sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {getLocationDisplay(donation)}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <AccessTime sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          Claimed on {format(new Date(donation.created_at), 'MMM d, yyyy')}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                  
                  <Divider />
                  
                  <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
                    <Tooltip title="Rate Donation">
                      <IconButton 
                        onClick={() => {
                          setSelectedDonation(donation);
                          setShowRatingDialog(true);
                        }}
                        color="primary"
                        sx={{ mr: 1 }}
                      >
                        <Star />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="View Details">
                      <IconButton 
                        onClick={() => {
                          setSelectedDonation(donation);
                          setShowDetailsDialog(true);
                        }}
                        color="primary"
                      >
                        <Visibility />
                      </IconButton>
                    </Tooltip>
                  </CardActions>
                </Card>
              </MuiGrid>
            ))}
          </MuiGrid>
        )}

        <DonationDetailsDialog
          donation={selectedDonation}
          open={showDetailsDialog}
          onClose={() => {
            setShowDetailsDialog(false);
            setSelectedDonation(null);
          }}
          isRecipient={true}
        />

        {selectedDonation && (
          <RatingDialog
            donation={selectedDonation}
            open={showRatingDialog}
            onClose={() => {
              setShowRatingDialog(false);
              setSelectedDonation(null);
            }}
          />
        )}
      </Container>
    </DashboardLayout>
  );
}; 