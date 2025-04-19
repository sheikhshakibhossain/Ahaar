import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Alert,
  CircularProgress,
  Container,
} from '@mui/material';
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
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 4,
              background: 'linear-gradient(to bottom right, #ffffff, #f8fafc)',
              borderRadius: 2,
            }}
          >
            <Typography 
              variant="h4" 
              component="h1" 
              gutterBottom 
              sx={{ 
                color: '#1a4731',
                fontWeight: 600,
                mb: 4,
                textAlign: 'center'
              }}
            >
              Create a Donation
            </Typography>
            
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
          </Paper>
        </Box>
        
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