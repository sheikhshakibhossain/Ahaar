import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    TextField,
    Button,
    FormControlLabel,
    Switch,
    Alert,
    Typography,
    Paper,
    Grid,
    IconButton,
} from '@mui/material';
import { PhotoCamera } from '@mui/icons-material';
import { ImagePreview } from '../../components/donation/ImagePreview';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DashboardLayout } from '../../components/layout/DashboardLayout';

interface DonationFormData {
    title: string;
    description: string;
    quantity: number;
    expiry_date: Date;
    pickup_address: string;
    is_perishable: boolean;
    image?: File | null;
}

export const CreateDonation: React.FC = () => {
    const navigate = useNavigate();
    const [error, setError] = useState<string>('');
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [formData, setFormData] = useState<DonationFormData>({
        title: '',
        description: '',
        quantity: 1,
        expiry_date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        pickup_address: '',
        is_perishable: true,
        image: null,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const formDataToSend = new FormData();
            
            // Append all form fields
            Object.entries(formData).forEach(([key, value]) => {
                if (key === 'expiry_date') {
                    formDataToSend.append(key, value.toISOString());
                } else if (key !== 'image') {
                    formDataToSend.append(key, value.toString());
                }
            });

            // Append image if selected
            if (selectedImage) {
                formDataToSend.append('image', selectedImage);
            }

            const response = await fetch('http://localhost:8000/api/auth/donations/', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
                body: formDataToSend,
            });

            if (!response.ok) {
                throw new Error('Failed to create donation');
            }

            navigate('/dashboard/history', {
                state: { message: 'Donation posted successfully!' }
            });
        } catch (err) {
            setError('Failed to create donation. Please try again.');
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'is_perishable' ? checked : value,
        }));
    };

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                setError('Image size should be less than 5MB');
                return;
            }
            setSelectedImage(file);
        }
    };

    return (
        <DashboardLayout title="Create New Donation">
            <Paper elevation={3} sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
                <Typography variant="h5" gutterBottom>
                    Create New Donation
                </Typography>
                
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                
                <Box component="form" onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Title"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                required
                            />
                        </Grid>
                        
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Description"
                                name="description"
                                multiline
                                rows={4}
                                value={formData.description}
                                onChange={handleChange}
                                required
                            />
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Quantity"
                                name="quantity"
                                type="number"
                                value={formData.quantity}
                                onChange={handleChange}
                                required
                                InputProps={{ inputProps: { min: 1 } }}
                            />
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                            <LocalizationProvider dateAdapter={AdapterDateFns}>
                                <DateTimePicker
                                    label="Expiry Date"
                                    value={formData.expiry_date}
                                    onChange={(newValue) => {
                                        setFormData(prev => ({
                                            ...prev,
                                            expiry_date: newValue || new Date(),
                                        }));
                                    }}
                                    minDateTime={new Date()}
                                />
                            </LocalizationProvider>
                        </Grid>
                        
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Pickup Address"
                                name="pickup_address"
                                multiline
                                rows={3}
                                value={formData.pickup_address}
                                onChange={handleChange}
                                required
                            />
                        </Grid>
                        
                        <Grid item xs={12}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={formData.is_perishable}
                                        onChange={handleChange}
                                        name="is_perishable"
                                    />
                                }
                                label="Is Perishable Food?"
                            />
                        </Grid>
                        
                        <Grid item xs={12}>
                            <Box sx={{ mt: 2, mb: 2 }}>
                                <input
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                    id="image-upload"
                                    type="file"
                                    onChange={handleImageChange}
                                />
                                <label htmlFor="image-upload">
                                    <Button
                                        variant="outlined"
                                        component="span"
                                        startIcon={<PhotoCamera />}
                                    >
                                        Upload Food Image (Optional)
                                    </Button>
                                </label>
                            </Box>
                            <ImagePreview
                                file={selectedImage}
                                onRemove={() => setSelectedImage(null)}
                            />
                        </Grid>
                        
                        <Grid item xs={12}>
                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                fullWidth
                                size="large"
                            >
                                Create Donation
                            </Button>
                        </Grid>
                    </Grid>
                </Box>
            </Paper>
        </DashboardLayout>
    );
}; 