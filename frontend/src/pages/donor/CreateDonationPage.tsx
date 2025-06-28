import React, { useState } from 'react';
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
  Grid,
  useTheme,
} from '@mui/material';
import {
  Add as AddIcon,
  Inventory as InventoryIcon,
  Description as DescriptionIcon,
  CalendarToday as CalendarIcon,
  Category as CategoryIcon,
  LocationOn as LocationIcon,
  PhotoCamera as PhotoIcon,
} from '@mui/icons-material';
import { CreateDonationForm } from '../../components/donation/CreateDonationForm';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { api } from '../../services/api';

interface DonationData {
  title: string;
  description: string;
  quantity: string;
  expiryDate: string;
  category: string;
  location: {
    lat: number;
    lng: number;
    address?: string;
  };
  image?: File | null;
}

export const CreateDonationPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (donationData: DonationData) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Create FormData object to handle file upload
      const formDataToSend = new FormData();
      
      // Append all form fields
      formDataToSend.append('title', donationData.title);
      formDataToSend.append('description', donationData.description);
      formDataToSend.append('quantity', donationData.quantity);
      formDataToSend.append('expiry_date', donationData.expiryDate);
      formDataToSend.append('category', donationData.category);
      
      // Add location data
      formDataToSend.append('location', JSON.stringify(donationData.location));
      
      // Append image if selected
      if (donationData.image) {
        formDataToSend.append('image', donationData.image);
      }

      // Make API call to create donation
      const response = await api.post('/api/donations/', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // Redirect to donation history page
      navigate('/dashboard/history', {
        state: { message: 'Donation created successfully!' }
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create donation. Please try again.');
      console.error('Error creating donation:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout title="Create a Donation">
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
              Create a New Donation 🎁
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9, mb: 3 }}>
              Share your generosity and help those in need
            </Typography>
          </Box>
        </Box>

        {/* Information Cards */}
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
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                  Item Details
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Provide clear information about your donation
                </Typography>
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
                <DescriptionIcon sx={{ fontSize: 40, mb: 2, opacity: 0.8 }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                  Description
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Help recipients understand what you're offering
                </Typography>
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
                <CalendarIcon sx={{ fontSize: 40, mb: 2, opacity: 0.8 }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                  Expiry Date
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Set when the donation expires
                </Typography>
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
                <LocationIcon sx={{ fontSize: 40, mb: 2, opacity: 0.8 }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                  Location
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Specify pickup location
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Form Section */}
        <Card 
          sx={{ 
            p: 4,
            background: 'linear-gradient(to bottom right, #ffffff, #f8fafc)',
            borderRadius: 3,
            boxShadow: theme.shadows[8],
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 4,
                '& .MuiAlert-icon': {
                  color: '#dc2626'
                }
              }}
            >
              {error}
            </Alert>
          )}
          
          <Box sx={{ width: '100%' }}>
            <CreateDonationForm onSubmit={handleSubmit} />
          </Box>
        </Card>
        
        {isSubmitting && (
          <Box
            sx={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
            }}
          >
            <Paper
              sx={{
                p: 4,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                borderRadius: 2,
              }}
            >
              <CircularProgress size={24} sx={{ color: '#059669' }} />
              <Typography>Creating donation...</Typography>
            </Paper>
          </Box>
        )}
      </Container>
    </DashboardLayout>
  );
}; 