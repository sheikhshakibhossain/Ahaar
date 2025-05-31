import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { TextField, Button, Box, Typography, Alert, Paper } from '@mui/material';
import { authService } from '../../services/auth';
import { useAuth } from '../../context/AuthContext';

export const LoginForm: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { login, user, isAuthenticated } = useAuth();

    // Handle navigation after successful login
    useEffect(() => {
        if (isAuthenticated && user) {
            console.log('User authenticated:', user);
            if (user.role === 'donor') {
                navigate('/dashboard', { replace: true });
            } else if (user.role === 'recipient') {
                navigate('/recipient-dashboard', { replace: true });
            } else if (user.role === 'admin') {
                navigate('/admin', { replace: true });
            }
        }
    }, [isAuthenticated, user, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // First, get the tokens
            const response = await authService.login({ username, password });
            console.log('Login response:', response);
            
            // Check if user is banned
            if (response.user?.is_banned) {
                setError("This account has been banned. Please contact support for more information.");
                return;
            }
            
            // Update auth context and get user data
            await login(response.access, response.refresh);
            console.log('Auth context updated');
            
            // Navigation will be handled by the useEffect hook
        } catch (err: any) {
            console.error('Login error:', err);
            setError(err.message || 'An error occurred during login. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box 
            sx={{ 
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'background.default',
                py: 4
            }}
        >
            <Paper 
                elevation={3} 
                sx={{ 
                    p: 4, 
                    maxWidth: 400,
                    width: '100%',
                    mx: 2
                }}
            >
                <Typography variant="h4" component="h1" gutterBottom textAlign="center">
                    Welcome Back
                </Typography>
                
                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
                    {error && (
                        <Alert 
                            severity="error" 
                            sx={{ 
                                mb: 2,
                                '& .MuiAlert-message': { 
                                    whiteSpace: 'pre-line',
                                    '& a': {
                                        color: 'inherit',
                                        textDecoration: 'underline'
                                    }
                                }
                            }}
                        >
                            <div dangerouslySetInnerHTML={{ __html: error }} />
                        </Alert>
                    )}
                    {location.state?.message && (
                        <Alert severity="success" sx={{ mb: 2 }}>
                            {location.state.message}
                        </Alert>
                    )}
                    <TextField
                        fullWidth
                        label="Username"
                        margin="normal"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        disabled={loading}
                    />
                    <TextField
                        fullWidth
                        label="Password"
                        type="password"
                        margin="normal"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={loading}
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                        disabled={loading}
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </Button>
                    <Box sx={{ textAlign: 'center', mt: 2 }}>
                        <Typography>
                            Don't have an account?{' '}
                            <Link to="/register" style={{ color: 'inherit' }}>
                                Register here
                            </Link>
                        </Typography>
                        <Button
                            component={Link}
                            to="/"
                            sx={{ mt: 2 }}
                            disabled={loading}
                        >
                            Back to Home
                        </Button>
                    </Box>
                </Box>
            </Paper>
        </Box>
    );
}; 