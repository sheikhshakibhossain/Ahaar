import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Alert,
} from '@mui/material';
import { api } from '../../services/api';

interface WarningDialogProps {
    open: boolean;
    onClose: () => void;
    donorId: number;
    onWarningSent: () => void;
}

export const WarningDialog: React.FC<WarningDialogProps> = ({
    open,
    onClose,
    donorId,
    onWarningSent,
}) => {
    const [message, setMessage] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    console.log('WarningDialog rendered with open:', open, 'donorId:', donorId);

    const handleSubmit = async () => {
        if (!message.trim()) {
            setError('Warning message cannot be empty');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            await api.post(`/api/admin/donors/${donorId}/warn/`, {
                message: message.trim()
            });
            setMessage('');
            onWarningSent();
            onClose();
        } catch (err: any) {
            console.error('Error sending warning:', err);
            setError(err.response?.data?.error || 'Failed to send warning');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog 
            open={open} 
            onClose={onClose} 
            maxWidth="sm" 
            fullWidth
        >
            <DialogTitle>Send Warning to Donor</DialogTitle>
            <DialogContent>
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}
                <TextField
                    autoFocus
                    margin="dense"
                    label="Warning Message"
                    fullWidth
                    multiline
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Enter warning message..."
                    disabled={isSubmitting}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={isSubmitting}>
                    Cancel
                </Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    color="warning"
                    disabled={isSubmitting}
                >
                    Send Warning
                </Button>
            </DialogActions>
        </Dialog>
    );
}; 