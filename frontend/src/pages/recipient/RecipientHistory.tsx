import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import { format } from 'date-fns';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { DonationDetailsDialog } from '../../components/donation/DonationDetailsDialog';
import { Donation } from '../../types/donation';
import { api } from '../../services/api';

export const RecipientHistory: React.FC = () => {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

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

  const getLocationDisplay = (donation: Donation) => {
    try {
      if (!donation.location) return 'No location';
      
      // If location is already an object, use it directly
      if (typeof donation.location === 'object') {
        return donation.location.address || `${donation.location.lat}, ${donation.location.lng}`;
      }
      
      // If location is a string, try to parse it
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
        
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            My Claimed Donations
          </Typography>
          
          {loading ? (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
          ) : donations.length === 0 ? (
            <Typography color="textSecondary" align="center">
              You haven't claimed any donations yet.
            </Typography>
          ) : (
            <List>
              {donations.map((donation) => (
                <ListItem
                  key={donation.id}
                  divider
                  sx={{ cursor: 'pointer' }}
                  onClick={() => {
                    setSelectedDonation(donation);
                    setShowDetailsDialog(true);
                  }}
                >
                  <ListItemText
                    primary={donation.title}
                    secondary={
                      <>
                        <Typography component="span" variant="body2" color="text.primary">
                          {getLocationDisplay(donation)}
                        </Typography>
                        <br />
                        <Typography component="span" variant="body2" color="text.secondary">
                          Claimed on {format(new Date(donation.created_at), 'MMM d, yyyy')}
                        </Typography>
                      </>
                    }
                  />
                  <ListItemSecondaryAction>
                    <Chip
                      label={donation.status}
                      color={getStatusColor(donation.status)}
                      size="small"
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
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
      </Container>
    </DashboardLayout>
  );
}; 