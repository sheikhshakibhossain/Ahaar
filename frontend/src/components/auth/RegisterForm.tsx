import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    TextField,
    Button,
    Box,
    Typography,
    Alert,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from '@mui/material';
import { authService } from '../../services/auth';
import { RegisterData } from '../../types/auth';

export const RegisterForm: React.FC = () => {
    const [formData, setFormData] = useState<RegisterData>({
        username: '',
        password: '',
        password2: '',
        email: '',
        first_name: '',
        last_name: '',
        role: 'donor',
        phone_number: '',
        address: '',
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name as string]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        
        try {
            const response = await authService.register(formData);
            navigate('/login', { 
                state: { message: 'Registration successful! Please login.' }
            });
        } catch (err: any) {
            console.error('Registration error:', err.response?.data);
            if (err.response?.data?.errors) {
                // Handle specific field errors
                const errorMessages = Object.entries(err.response.data.errors)
                    .map(([field, messages]) => `${field}: ${messages}`)
                    .join('\n');
                setError(errorMessages);
            } else if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else {
                setError('Registration failed. Please try again.');
            }
        }
    };

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <TextField
                fullWidth
                name="username"
                label="Username"
                margin="normal"
                value={formData.username}
                onChange={handleChange}
                required
            />
            <TextField
                fullWidth
                name="email"
                label="Email"
                type="email"
                margin="normal"
                value={formData.email}
                onChange={handleChange}
                required
            />
            <TextField
                fullWidth
                name="first_name"
                label="First Name"
                margin="normal"
                value={formData.first_name}
                onChange={handleChange}
                required
            />
            <TextField
                fullWidth
                name="last_name"
                label="Last Name"
                margin="normal"
                value={formData.last_name}
                onChange={handleChange}
                required
            />
            <FormControl fullWidth margin="normal">
                <InputLabel>Role</InputLabel>
                <Select
                    name="role"
                    value={formData.role}
                    label="Role"
                    onChange={handleChange}
                    required
                >
                    <MenuItem value="donor">Donor</MenuItem>
                    <MenuItem value="recipient">Recipient</MenuItem>
                </Select>
            </FormControl>
            <TextField
                fullWidth
                name="phone_number"
                label="Phone Number"
                margin="normal"
                value={formData.phone_number}
                onChange={handleChange}
            />
            <TextField
                fullWidth
                name="address"
                label="Address"
                margin="normal"
                multiline
                rows={3}
                value={formData.address}
                onChange={handleChange}
            />
            <TextField
                fullWidth
                name="password"
                label="Password"
                type="password"
                margin="normal"
                value={formData.password}
                onChange={handleChange}
                required
            />
            <TextField
                fullWidth
                name="password2"
                label="Confirm Password"
                type="password"
                margin="normal"
                value={formData.password2}
                onChange={handleChange}
                required
            />
            <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
            >
                Register
            </Button>
            <Typography textAlign="center">
                Already have an account?{' '}
                <Button onClick={() => navigate('/login')}>
                    Login here
                </Button>
            </Typography>
        </Box>
    );
}; 