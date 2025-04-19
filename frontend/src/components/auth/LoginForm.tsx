import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { TextField, Button, Box, Typography, Alert, Paper } from '@mui/material';
import { authService } from '../../services/auth';
import { useAuth } from '../../context/AuthContext';

export const LoginForm: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await authService.login({ username, password });
            await login(response.access, response.refresh);
            
            // Get the user's role and redirect accordingly
            const user = await authService.getCurrentUser();
            if (user.role === 'donor') {
                navigate('/dashboard');
            } else if (user.role === 'recipient') {
                navigate('/recipient-dashboard');
            }
        } catch (err) {
            setError('Invalid username or password');
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
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
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
                    />
                    <TextField
                        fullWidth
                        label="Password"
                        type="password"
                        margin="normal"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                    >
                        Login
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
                        >
                            Back to Home
                        </Button>
                    </Box>
                </Box>
            </Paper>
        </Box>
    );
}; 