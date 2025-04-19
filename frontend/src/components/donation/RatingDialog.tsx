import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Rating,
  TextField,
  Alert,
} from '@mui/material';
import { Donation } from '../../types/donation';
import { api } from '../../services/api';

interface RatingDialogProps {
  donation: Donation;
  open: boolean;
  onClose: () => void;
  onRatingSubmitted?: () => void;
}

export const RatingDialog: React.FC<RatingDialogProps> = ({
  donation,
  open,
  onClose,
  onRatingSubmitted,
}) => {
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!rating) {
      setError('Please provide a rating');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await api.post('/api/feedbacks/', {
        donation: donation.id,
        rating,
        comment: comment.trim() || undefined,
      });

      setSuccess(true);
      if (onRatingSubmitted) {
        onRatingSubmitted();
      }
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (err) {
      setError('Failed to submit rating. Please try again.');
      console.error('Error submitting rating:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setRating(null);
    setComment('');
    setError(null);
    setSuccess(false);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Rate Donation</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body1" gutterBottom>
            How would you rate this donation?
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Rating
              value={rating}
              onChange={(_, newValue) => {
                setRating(newValue);
                setError(null);
              }}
              size="large"
            />
          </Box>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Comments (optional)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            variant="outlined"
            margin="normal"
          />
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mt: 2 }}>
              Thank you for your feedback!
            </Alert>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={loading || !rating}
        >
          {loading ? 'Submitting...' : 'Submit Rating'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}; 