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
  Grid,
} from '@mui/material';
import { LocationOn as LocationIcon, History as HistoryIcon, Search as SearchIcon } from '@mui/icons-material';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface Request {
  id: string;
  donationTitle: string;
  status: 'pending' | 'approved' | 'completed' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

interface DashboardStats {
  totalRequests: number;
  pendingRequests: number;
  completedRequests: number;
  activeRequests: number;
}

export const RecipientDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalRequests: 0,
    pendingRequests: 0,
    completedRequests: 0,
    activeRequests: 0,
  });
  const [recentRequests, setRecentRequests] = useState<Request[]>([]);

  useEffect(() => {
    // TODO: Fetch dashboard stats and recent requests from API
    // This will be implemented when the backend is ready
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

  return (
    <DashboardLayout title="Recipient Dashboard">
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Welcome, {user?.name || 'Recipient'}!
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<SearchIcon />}
            onClick={() => navigate('/recipient-dashboard/nearby')}
          >
            Find Nearby Donations
          </Button>
        </Box>

        <Grid container spacing={3}>
          {/* Stats Cards */}
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Requests
                </Typography>
                <Typography variant="h4">{stats.totalRequests}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Pending Requests
                </Typography>
                <Typography variant="h4">{stats.pendingRequests}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Completed Requests
                </Typography>
                <Typography variant="h4">{stats.completedRequests}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Active Requests
                </Typography>
                <Typography variant="h4">{stats.activeRequests}</Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Recent Requests */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Recent Requests
                </Typography>
                <Button
                  startIcon={<HistoryIcon />}
                  onClick={() => navigate('/recipient-dashboard/history')}
                >
                  View All
                </Button>
              </Box>
              {recentRequests.length > 0 ? (
                <List>
                  {recentRequests.map((request) => (
                    <ListItem key={request.id} divider>
                      <ListItemText
                        primary={request.donationTitle}
                        secondary={`Requested on ${new Date(request.createdAt).toLocaleDateString()}`}
                      />
                      <ListItemSecondaryAction>
                        <Chip
                          label={request.status}
                          color={getStatusColor(request.status)}
                          size="small"
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography color="textSecondary" align="center">
                  No recent requests to display.
                </Typography>
              )}
            </Paper>
          </Grid>

          {/* Quick Actions */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="outlined"
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