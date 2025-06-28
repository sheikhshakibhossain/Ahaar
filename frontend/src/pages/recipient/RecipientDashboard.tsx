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
  Avatar,
  useTheme,
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
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Favorite as FavoriteIcon,
  LocalShipping as ShippingIcon,
  Visibility as VisibilityIcon,
  CalendarToday as CalendarIcon,
  Star as StarIcon,
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
  const theme = useTheme();
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
          completedCount: completedCount,
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

  if (loading) {
    return (
      <DashboardLayout title="Recipient Dashboard">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <LinearProgress sx={{ width: '100%', maxWidth: 400 }} />
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Recipient Dashboard">
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
              Welcome back, {user?.first_name}! 👋
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9, mb: 3 }}>
              Discover and claim donations to help those in need
            </Typography>
            <Button
              variant="contained"
              size="large"
              startIcon={<SearchIcon />}
              onClick={() => navigate('/recipient-dashboard/nearby')}
              sx={{ 
                bgcolor: 'white', 
                color: 'primary.main',
                '&:hover': { bgcolor: 'grey.100' }
              }}
            >
              Find Donations
            </Button>
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
                <FavoriteIcon sx={{ fontSize: 40, mb: 2, opacity: 0.8 }} />
                <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {stats.completedDonations}
                </Typography>
                <Typography variant="h6">Donations Received</Typography>
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
                <CheckCircle sx={{ fontSize: 40, mb: 2, opacity: 0.8 }} />
                <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {stats.totalDonations}
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
                <StarIcon sx={{ fontSize: 40, mb: 2, opacity: 0.8 }} />
                <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {stats.successRate || 100}%
                </Typography>
                <Typography variant="h6">Success Rate</Typography>
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
                <AccessTime sx={{ fontSize: 40, mb: 2, opacity: 0.8 }} />
                <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {stats.averageResponseTime || 24}h
                </Typography>
                <Typography variant="h6">Avg Response</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Grid container spacing={4}>
          {/* Personal Information */}
          <Grid item xs={12} md={4}>
            <Card sx={{ p: 3, height: 'fit-content' }}>
              <Box display="flex" alignItems="center" mb={3}>
                <Avatar 
                  sx={{ 
                    width: 60, 
                    height: 60, 
                    bgcolor: 'primary.main',
                    mr: 2
                  }}
                >
                  <PersonIcon sx={{ fontSize: 30 }} />
                </Avatar>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                    {user?.first_name} {user?.last_name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Community Member
                  </Typography>
                </Box>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ space: 2 }}>
                <Box display="flex" alignItems="center" mb={2}>
                  <EmailIcon sx={{ mr: 2, color: 'primary.main' }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Email
                    </Typography>
                    <Typography variant="body1">
                      {user?.email}
                    </Typography>
                  </Box>
                </Box>
                
                <Box display="flex" alignItems="center" mb={2}>
                  <PhoneIcon sx={{ mr: 2, color: 'primary.main' }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Phone
                    </Typography>
                    <Typography variant="body1">
                      {user?.phone_number || 'Not provided'}
                    </Typography>
                  </Box>
                </Box>
                
                <Box display="flex" alignItems="center">
                  <LocationIcon sx={{ mr: 2, color: 'primary.main' }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Address
                    </Typography>
                    <Typography variant="body1">
                      {user?.address || 'Not provided'}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Card>
          </Grid>

          {/* Recent Claims */}
          <Grid item xs={12} md={8}>
            <Card sx={{ p: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                  Recent Claims
                </Typography>
                <Button variant="outlined" startIcon={<HistoryIcon />}>
                  View History
                </Button>
              </Box>
              
              {recentRequests.length === 0 ? (
                <Box textAlign="center" py={4}>
                  <FavoriteIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No claims yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Start exploring available donations in your area
                  </Typography>
                  <Button 
                    variant="contained" 
                    startIcon={<SearchIcon />}
                    onClick={() => navigate('/recipient-dashboard/nearby')}
                  >
                    Find Donations
                  </Button>
                </Box>
              ) : (
                <List>
                  {recentRequests.map((request, index) => (
                    <React.Fragment key={request.id}>
                      <ListItem 
                        sx={{ 
                          p: 2,
                          borderRadius: 2,
                          mb: 1,
                          border: '1px solid',
                          borderColor: 'divider',
                          '&:hover': {
                            boxShadow: theme.shadows[4],
                            transform: 'translateY(-1px)',
                            transition: 'all 0.3s ease'
                          }
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                          <Avatar 
                            sx={{ 
                              bgcolor: `${getStatusColor(request.status)}.main`,
                              mr: 2
                            }}
                          >
                            {getStatusIcon(request.status)}
                          </Avatar>
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                              {request.donationTitle}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Donated by {request.donor.name}
                            </Typography>
                            <Box display="flex" alignItems="center" mt={1}>
                              <ShippingIcon sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                              <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
                                Qty: {request.quantity}
                              </Typography>
                              <CalendarIcon sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                              <Typography variant="body2" color="text.secondary">
                                {format(new Date(request.createdAt), 'MMM dd, yyyy')}
                              </Typography>
                            </Box>
                          </Box>
                          <Chip
                            icon={getStatusIcon(request.status)}
                            label={request.status}
                            color={getStatusColor(request.status) as any}
                            sx={{ ml: 2 }}
                          />
                        </Box>
                      </ListItem>
                      {index < recentRequests.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              )}
            </Card>
          </Grid>
        </Grid>

        {/* Quick Actions */}
        <Card sx={{ p: 3, mt: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3 }}>
            Quick Actions
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                variant="outlined"
                fullWidth
                size="large"
                startIcon={<SearchIcon />}
                onClick={() => navigate('/recipient-dashboard/nearby')}
                sx={{ 
                  p: 3, 
                  height: 'auto',
                  flexDirection: 'column',
                  gap: 1
                }}
              >
                <SearchIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                <Typography variant="h6">Find Donations</Typography>
                <Typography variant="body2" color="text.secondary">
                  Browse available donations
                </Typography>
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                variant="outlined"
                fullWidth
                size="large"
                startIcon={<HistoryIcon />}
                onClick={() => navigate('/recipient-dashboard/history')}
                sx={{ 
                  p: 3, 
                  height: 'auto',
                  flexDirection: 'column',
                  gap: 1
                }}
              >
                <HistoryIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                <Typography variant="h6">View History</Typography>
                <Typography variant="body2" color="text.secondary">
                  Check your claim history
                </Typography>
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                variant="outlined"
                fullWidth
                size="large"
                startIcon={<LocationIcon />}
                sx={{ 
                  p: 3, 
                  height: 'auto',
                  flexDirection: 'column',
                  gap: 1
                }}
              >
                <LocationIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                <Typography variant="h6">Nearby</Typography>
                <Typography variant="body2" color="text.secondary">
                  Find local donations
                </Typography>
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                variant="outlined"
                fullWidth
                size="large"
                startIcon={<Info />}
                sx={{ 
                  p: 3, 
                  height: 'auto',
                  flexDirection: 'column',
                  gap: 1
                }}
              >
                <Info sx={{ fontSize: 40, color: 'primary.main' }} />
                <Typography variant="h6">Help</Typography>
                <Typography variant="body2" color="text.secondary">
                  Get assistance
                </Typography>
              </Button>
            </Grid>
          </Grid>
        </Card>
      </Container>
    </DashboardLayout>
  );
}; 