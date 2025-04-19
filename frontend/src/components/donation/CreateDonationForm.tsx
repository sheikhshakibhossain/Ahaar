import React, { useState, useEffect } from 'react';
import {
  TextField,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Paper,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from '@mui/material';
import { LocationOn, Close, MyLocation } from '@mui/icons-material';
import { ImagePreview } from './ImagePreview';

interface DonationData {
  title: string;
  description: string;
  quantity: string;
  expiryDate: string;
  category: string;
  location: {
    lat: number;
    lng: number;
    address?: string;
  };
  image?: File | null;
}

interface CreateDonationFormProps {
  onSubmit: (donationData: DonationData) => void;
}

export const CreateDonationForm: React.FC<CreateDonationFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<DonationData>({
    title: '',
    description: '',
    quantity: '1',
    expiryDate: '',
    category: '',
    location: {
      lat: 0,
      lng: 0,
    },
    image: null,
  });

  const [mapOpen, setMapOpen] = useState(false);
  const [mapPosition, setMapPosition] = useState({ lat: 0, lng: 0 });
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    // Get user's location when component mounts
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          setMapPosition({ lat: latitude, lng: longitude });
        },
        (error) => {
          console.error('Error getting location:', error);
          // Default to a fallback location if geolocation fails
          setMapPosition({ lat: 0, lng: 0 });
        }
      );
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData({ ...formData, image: file });
  };

  const handleRemoveImage = () => {
    setFormData({ ...formData, image: null });
  };

  const handleOpenMap = () => {
    setMapOpen(true);
  };

  const handleCloseMap = () => {
    setMapOpen(false);
  };

  const handleLocationSelect = (lat: number, lng: number) => {
    console.log('Selected coordinates:', { lat, lng });
    setFormData({
      ...formData,
      location: {
        lat,
        lng,
        address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`
      }
    });
    setMapOpen(false);
  };

  const handleUseCurrentLocation = () => {
    if (userLocation) {
      console.log('Using current location:', userLocation);
      handleLocationSelect(userLocation.lat, userLocation.lng);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
        {/* Left Column */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
          <TextField
            label="Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
            fullWidth
            sx={{
              '& .MuiOutlinedInput-root': {
                '&:hover fieldset': {
                  borderColor: '#059669',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#059669',
                },
              },
            }}
          />

          <TextField
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
            multiline
            rows={4}
            fullWidth
            sx={{
              '& .MuiOutlinedInput-root': {
                '&:hover fieldset': {
                  borderColor: '#059669',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#059669',
                },
              },
            }}
          />

          <TextField
            label="Quantity"
            type="number"
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
            required
            fullWidth
            inputProps={{ min: 1 }}
            sx={{
              '& .MuiOutlinedInput-root': {
                '&:hover fieldset': {
                  borderColor: '#059669',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#059669',
                },
              },
            }}
          />
        </Box>

        {/* Right Column */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
          <TextField
            label="Expiry Date"
            type="datetime-local"
            value={formData.expiryDate}
            onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
            required
            fullWidth
            InputLabelProps={{
              shrink: true,
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                '&:hover fieldset': {
                  borderColor: '#059669',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#059669',
                },
              },
            }}
          />

          <FormControl fullWidth required>
            <InputLabel>Category</InputLabel>
            <Select
              value={formData.category}
              label="Category"
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              sx={{
                '& .MuiOutlinedInput-notchedOutline': {
                  '&:hover': {
                    borderColor: '#059669',
                  },
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#059669',
                },
              }}
            >
              <MenuItem value="">Select a category</MenuItem>
              <MenuItem value="cooked">Cooked Food</MenuItem>
              <MenuItem value="packaged">Packaged Food</MenuItem>
              <MenuItem value="raw">Raw Ingredients</MenuItem>
            </Select>
          </FormControl>

          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Location
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                label="Pickup Location"
                value={formData.location.address}
                onClick={handleOpenMap}
                required
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationOn sx={{ color: '#059669' }} />
                    </InputAdornment>
                  ),
                  readOnly: true,
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#059669',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#059669',
                    },
                  },
                }}
              />
              <Button
                variant="outlined"
                onClick={handleOpenMap}
                sx={{
                  borderColor: '#059669',
                  color: '#059669',
                  '&:hover': {
                    borderColor: '#047857',
                    backgroundColor: 'rgba(5, 150, 105, 0.04)',
                  },
                }}
              >
                Pick
              </Button>
            </Box>
          </Box>

          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Food Image
            </Typography>
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
                sx={{
                  borderColor: '#059669',
                  color: '#059669',
                  '&:hover': {
                    borderColor: '#047857',
                    backgroundColor: 'rgba(5, 150, 105, 0.04)',
                  },
                }}
              >
                Upload Image
              </Button>
            </label>
            {formData.image && (
              <Box sx={{ mt: 2 }}>
                <ImagePreview
                  file={formData.image}
                  onRemove={handleRemoveImage}
                />
              </Box>
            )}
          </Box>
        </Box>
      </Box>

      {/* Submit Button - Full Width */}
      <Box sx={{ mt: 4 }}>
        <Button
          type="submit"
          variant="contained"
          fullWidth
          sx={{
            backgroundColor: '#059669',
            '&:hover': {
              backgroundColor: '#047857',
            },
            py: 1.5,
          }}
        >
          Create Donation
        </Button>
      </Box>

      {/* Location Picker Dialog */}
      <Dialog open={mapOpen} onClose={handleCloseMap} maxWidth="md" fullWidth>
        <DialogTitle>
          Pick Location
          <IconButton
            aria-label="close"
            onClick={handleCloseMap}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ height: 400, position: 'relative', mb: 2 }}>
            {/* Simple map representation without API key */}
            <Box
              sx={{
                width: '100%',
                height: '100%',
                bgcolor: '#e0e0e0',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
              }}
            >
              <Typography variant="h6" gutterBottom>
                Map View
              </Typography>
              <Typography variant="body2" color="text.secondary" align="center">
                Latitude: {mapPosition.lat.toFixed(6)}, Longitude: {mapPosition.lng.toFixed(6)}
              </Typography>
              
              {/* Simple location marker */}
              <Box
                sx={{
                  width: 20,
                  height: 20,
                  bgcolor: '#059669',
                  borderRadius: '50%',
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                }}
              />
              
              {/* Location controls */}
              <Box sx={{ position: 'absolute', bottom: 16, right: 16, display: 'flex', gap: 1 }}>
                <Button
                  variant="contained"
                  startIcon={<MyLocation />}
                  onClick={handleUseCurrentLocation}
                  sx={{ bgcolor: '#059669', '&:hover': { bgcolor: '#047857' } }}
                >
                  Use Current
                </Button>
              </Box>
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField
              label="Latitude"
              type="number"
              value={mapPosition.lat}
              onChange={(e) => setMapPosition({ ...mapPosition, lat: parseFloat(e.target.value) })}
              fullWidth
              inputProps={{ step: 0.000001 }}
            />
            <TextField
              label="Longitude"
              type="number"
              value={mapPosition.lng}
              onChange={(e) => setMapPosition({ ...mapPosition, lng: parseFloat(e.target.value) })}
              fullWidth
              inputProps={{ step: 0.000001 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseMap}>Cancel</Button>
          <Button 
            onClick={() => handleLocationSelect(mapPosition.lat, mapPosition.lng)}
            variant="contained"
            sx={{ bgcolor: '#059669', '&:hover': { bgcolor: '#047857' } }}
          >
            Select Location
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}; 