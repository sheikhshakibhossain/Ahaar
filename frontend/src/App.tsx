import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Box, CircularProgress } from '@mui/material';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginForm } from './components/auth/LoginForm';
import { RegisterForm } from './components/auth/RegisterForm';
import DonorDashboard from './pages/donor/DonorDashboard';
import { CreateDonation } from './pages/donor/CreateDonation';
import { DonationHistory } from './pages/donor/DonationHistory';
import { CreateDonationPage } from './pages/donor/CreateDonationPage';
import DonorWarningsPage from './pages/donor/DonorWarningsPage';
import DonorAlertsPage from './pages/donor/DonorAlertsPage';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import EventPage from './pages/EventPage';
import { theme } from './theme';
import { RecipientDashboard } from './pages/recipient/RecipientDashboard';
import { NearbyDonationsPage } from './pages/recipient/NearbyDonationsPage';
import { RecipientHistory } from './pages/recipient/RecipientHistory';
import RecipientWarningsPage from './pages/recipient/RecipientWarningsPage';
import RecipientAlertsPage from './pages/recipient/RecipientAlertsPage';
import AdminPanel from './pages/admin/AdminPanel';

// Update RootRedirect to handle authenticated users
const RootRedirect: React.FC = () => {
    const { user, loading } = useAuth();
    
    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                <CircularProgress />
            </Box>
        );
    }
    
    if (user) {
        if (user.role === 'donor') {
            return <Navigate to="/dashboard" replace />;
        }
        if (user.role === 'recipient') {
            return <Navigate to="/recipient-dashboard" replace />;
        }
        if (user.role === 'admin') {
            return <Navigate to="/admin" replace />;
        }
    }
    
    return <LandingPage />;
};

function App() {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <AuthProvider>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<RootRedirect />} />
                    <Route path="/login" element={<LoginForm />} />
                    <Route path="/register" element={<RegisterForm />} />
                    <Route path="/event" element={<EventPage />} />
                    
                    {/* Protected Donor Routes */}
                    <Route 
                        path="/dashboard" 
                        element={
                            <ProtectedRoute requiredRole="donor">
                                <DonorDashboard />
                            </ProtectedRoute>
                        } 
                    />
                    <Route 
                        path="/dashboard/donate" 
                        element={
                            <ProtectedRoute requiredRole="donor">
                                <CreateDonationPage />
                            </ProtectedRoute>
                        } 
                    />
                    <Route 
                        path="/dashboard/history" 
                        element={
                            <ProtectedRoute requiredRole="donor">
                                <DonationHistory />
                            </ProtectedRoute>
                        } 
                    />
                    <Route 
                        path="/dashboard/warnings" 
                        element={
                            <ProtectedRoute requiredRole="donor">
                                <DonorWarningsPage />
                            </ProtectedRoute>
                        } 
                    />
                    <Route 
                        path="/dashboard/alerts" 
                        element={
                            <ProtectedRoute requiredRole="donor">
                                <DonorAlertsPage />
                            </ProtectedRoute>
                        } 
                    />

                    {/* Protected Recipient Routes */}
                    <Route 
                        path="/recipient-dashboard" 
                        element={
                            <ProtectedRoute requiredRole="recipient">
                                <RecipientDashboard />
                            </ProtectedRoute>
                        } 
                    />
                    <Route 
                        path="/recipient-dashboard/nearby" 
                        element={
                            <ProtectedRoute requiredRole="recipient">
                                <NearbyDonationsPage />
                            </ProtectedRoute>
                        } 
                    />
                    <Route 
                        path="/recipient-dashboard/history" 
                        element={
                            <ProtectedRoute requiredRole="recipient">
                                <RecipientHistory />
                            </ProtectedRoute>
                        } 
                    />
                    <Route 
                        path="/recipient-dashboard/warnings" 
                        element={
                            <ProtectedRoute requiredRole="recipient">
                                <RecipientWarningsPage />
                            </ProtectedRoute>
                        } 
                    />
                    <Route 
                        path="/recipient-dashboard/alerts" 
                        element={
                            <ProtectedRoute requiredRole="recipient">
                                <RecipientAlertsPage />
                            </ProtectedRoute>
                        } 
                    />

                    {/* Admin Routes */}
                    <Route 
                        path="/admin" 
                        element={
                            <ProtectedRoute requiredRole="admin">
                                <AdminPanel />
                            </ProtectedRoute>
                        } 
                    />

                    {/* Catch all route */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;
