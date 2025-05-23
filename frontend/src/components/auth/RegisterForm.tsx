import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    TextField,
    Button,
    Box,
    Typography,
    Alert,
    Paper,
    FormControl,
    InputLabel,
    MenuItem,
} from '@mui/material';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { authService } from '../../services/auth';
import { RegisterData } from '../../types/auth';

export const RegisterForm: React.FC = () => {
    const [searchParams] = useSearchParams();
    const roleParam = searchParams.get('role');
    const [formData, setFormData] = useState<RegisterData>(() => ({
        username: '',
        password: '',
        password2: '',
        email: '',
        first_name: '',
        last_name: '',
        role: roleParam === 'recipient' ? 'recipient' : 'donor',
        phone_number: '',
        address: '',
    }));
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // Sync role from query param whenever it changes
    useEffect(() => {
        if (roleParam === 'recipient' || roleParam === 'donor') {
            setFormData(prev => ({
                ...prev,
                role: roleParam as RegisterData['role'],
            }));
        }
    }, [roleParam]);

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
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'background.default',
                py: 4,
            }}
        >
            <Paper elevation={3} sx={{ p: 4, maxWidth: 800, width: '100%', mx: 2 }}>
                <Typography variant="h4" component="h1" gutterBottom textAlign="center">
                    Register
                </Typography>
                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                        {error && (
                            <Box sx={{ width: '100%' }}>
                                <Alert severity="error">{error}</Alert>
                            </Box>
                        )}
                        {/* Row 1 */}
                        <Box sx={{ flex: '1 1 calc(50% - 8px)' }}>
                            <TextField fullWidth name="username" label="Username" margin="normal" value={formData.username} onChange={handleChange} required />
                        </Box>
                        <Box sx={{ flex: '1 1 calc(50% - 8px)' }}>
                            <TextField fullWidth name="email" label="Email" type="email" margin="normal" value={formData.email} onChange={handleChange} required />
                        </Box>
                        {/* Row 2 */}
                        <Box sx={{ flex: '1 1 calc(50% - 8px)' }}>
                            <TextField fullWidth name="first_name" label="First Name" margin="normal" value={formData.first_name} onChange={handleChange} required />
                        </Box>
                        <Box sx={{ flex: '1 1 calc(50% - 8px)' }}>
                            <TextField fullWidth name="last_name" label="Last Name" margin="normal" value={formData.last_name} onChange={handleChange} required />
                        </Box>
                        {/* Row 3 */}
                        <Box sx={{ flex: '1 1 calc(50% - 8px)' }}>
                            <FormControl fullWidth margin="normal">
                                <InputLabel>Role</InputLabel>
                                <Select name="role" value={formData.role} label="Role" onChange={(e: SelectChangeEvent<RegisterData['role']>) => setFormData(prev => ({ ...prev, role: e.target.value as RegisterData['role'] }))} required>
                                    <MenuItem value="donor">Donor</MenuItem>
                                    <MenuItem value="recipient">Recipient</MenuItem>
                                </Select>
                            </FormControl>
                        </Box>
                        <Box sx={{ flex: '1 1 calc(50% - 8px)' }}>
                            <TextField fullWidth name="phone_number" label="Phone Number" margin="normal" value={formData.phone_number} onChange={handleChange} />
                        </Box>
                        {/* Row 4 */}
                        <Box sx={{ width: '100%' }}>
                            <TextField fullWidth name="address" label="Address" margin="normal" multiline rows={3} value={formData.address} onChange={handleChange} />
                        </Box>
                        {/* Row 5 */}
                        <Box sx={{ flex: '1 1 calc(50% - 8px)' }}>
                            <TextField fullWidth name="password" label="Password" type="password" margin="normal" value={formData.password} onChange={handleChange} required />
                        </Box>
                        <Box sx={{ flex: '1 1 calc(50% - 8px)' }}>
                            <TextField fullWidth name="password2" label="Confirm Password" type="password" margin="normal" value={formData.password2} onChange={handleChange} required />
                        </Box>
                        {/* Submit */}
                        <Box sx={{ width: '100%' }}>
                            <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>Register</Button>
                        </Box>
                        <Box sx={{ width: '100%', textAlign: 'center' }}>
                            <Typography>
                                Already have an account?{' '}
                                <Button onClick={() => navigate('/login')}>Login here</Button>
                            </Typography>
                        </Box>
                    </Box>
                </Box>
            </Paper>
        </Box>
    );
}; 