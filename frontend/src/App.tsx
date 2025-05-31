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
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import { theme } from './theme';
import { RecipientDashboard } from './pages/recipient/RecipientDashboard';
import { NearbyDonationsPage } from './pages/recipient/NearbyDonationsPage';
import { RecipientHistory } from './pages/recipient/RecipientHistory';
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
