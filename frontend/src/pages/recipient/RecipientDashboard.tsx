import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  LinearProgress,
  IconButton,
  Tooltip,
  Divider,
  Grid,
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  History as HistoryIcon,
  Search as SearchIcon,
  TrendingUp,
  AccessTime,
  CheckCircle,
  Pending,
  Cancel,
  Info,
  Inventory2,
  PendingActions,
} from '@mui/icons-material';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { format } from 'date-fns';
import { api } from '../../services/api';
import { Donation } from '../../types/donation';
import { User } from '../../types/auth';

interface Request {
  id: string;
  donationTitle: string;
  status: 'pending' | 'approved' | 'completed' | 'rejected';
  createdAt: string;
  updatedAt: string;
  quantity: number;
  donor: {
    name: string;
  };
}

interface DashboardStats {
  totalDonations: number;
  pendingDonations: number;
  completedDonations: number;
  activeDonations: number;
  successRate: number;
  averageResponseTime: number;
}

export const RecipientDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalDonations: 0,
    pendingDonations: 0,
    completedDonations: 0,
    activeDonations: 0,
    successRate: 0,
    averageResponseTime: 0,
  });
  const [recentRequests, setRecentRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        console.log('Fetching claimed donations...');
        // Fetch claimed donations
        const response = await api.get<Donation[]>('/api/donations/claimed/');
        console.log('API Response:', response);
        const claimedDonations = response.data;
        console.log('Claimed Donations:', claimedDonations);
        
        // Count completed donations - all claimed donations are considered completed
        const completedCount = claimedDonations.length;
        console.log('Completed Count:', completedCount);
        
        // Update stats
        setStats(prevStats => ({
          ...prevStats,
          completedDonations: completedCount,
          totalDonations: claimedDonations.length,
        }));
        console.log('Updated Stats:', {
          completedDonations: completedCount,
          totalDonations: claimedDonations.length,
        });
        
        // Convert donations to requests format for recent requests
        const requests: Request[] = claimedDonations.slice(0, 5).map(donation => ({
          id: donation.id.toString(),
          donationTitle: donation.title,
          status: 'completed', // All claimed donations are considered completed
          createdAt: donation.created_at || new Date().toISOString(),
          updatedAt: donation.updated_at || donation.created_at || new Date().toISOString(),
          quantity: typeof donation.quantity === 'string' ? parseInt(donation.quantity) : donation.quantity,
          donor: {
            name: donation.donor?.name || 'Anonymous Donor'
          }
        }));
        
        setRecentRequests(requests);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getStatusColor = (status: Request['status']) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'approved':
        return 'info';
      case 'completed':
        return 'success';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: Request['status']) => {
    switch (status) {
      case 'pending':
        return <Pending />;
      case 'approved':
        return <CheckCircle />;
      case 'completed':
        return <CheckCircle />;
      case 'rejected':
        return <Cancel />;
      default:
        return <Info />;
    }
  };

  const StatCard: React.FC<{
    title: string;
    value: number | string;
    icon: React.ReactNode;
    color: string;
    subtitle?: string;
  }> = ({ title, value, icon, color, subtitle }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box sx={{ 
            p: 1, 
            borderRadius: 1, 
            bgcolor: `${color}.lighter`,
            color: `${color}.main`,
            mr: 2 
          }}>
            {icon}
          </Box>
          <Typography color="textSecondary">
            {title}
          </Typography>
        </Box>
        <Typography variant="h4" component="div" gutterBottom>
          {value}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="textSecondary">
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );

  return (
    <DashboardLayout title="Recipient Dashboard">
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {/* Welcome Section */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 4,
          p: 3,
          bgcolor: 'primary.lighter',
          borderRadius: 2,
        }}>
          <Box>
            <Typography variant="h4" gutterBottom>
              Welcome back, {user?.first_name ? `${user.first_name} ${user.last_name}` : 'Recipient'}! 👋
            </Typography>
            <Typography variant="subtitle1" color="textSecondary">
              Here's what's happening with your donations
            </Typography>
          </Box>
        </Box>

        {/* Personal Information */}
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Personal Information
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Name
              </Typography>
              <Typography variant="body1">
                {user?.first_name} {user?.last_name}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Email
              </Typography>
              <Typography variant="body1">
                {user?.email}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Phone Number
              </Typography>
              <Typography variant="body1">
                {user?.phone_number || 'Not provided'}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Address
              </Typography>
              <Typography variant="body1">
                {user?.address || 'Not provided'}
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Completed Donations"
              value={stats.completedDonations}
              icon={<CheckCircle />}
              color="success"
              subtitle={`${stats.completedDonations} donations taken`}
            />
          </Grid>

          {/* Quick Actions */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  startIcon={<LocationIcon />}
                  onClick={() => navigate('/recipient-dashboard/nearby')}
                >
                  Find Nearby Donations
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<HistoryIcon />}
                  onClick={() => navigate('/recipient-dashboard/history')}
                >
                  View Request History
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </DashboardLayout>
  );
}; 