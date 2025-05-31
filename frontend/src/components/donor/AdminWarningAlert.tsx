import React, { useEffect, useState } from 'react';
import { Alert, AlertTitle, Box, Button } from '@mui/material';
import { api } from '../../services/api';

interface Warning {
    id: number;
    message: string;
    created_at: string;
    is_read: boolean;
}

export const AdminWarningAlert: React.FC = () => {
    const [warnings, setWarnings] = useState<Warning[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchWarnings = async () => {
        try {
            setLoading(true);
            const response = await api.get<{ warnings: Warning[] }>('/api/donor/warnings/');
            console.log('Fetched warnings:', response.data); // Debug log
            setWarnings(response.data.warnings || []);
            setError(null);
        } catch (err) {
            console.error('Error fetching warnings:', err);
            setError('Failed to fetch warnings');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWarnings();
        // Set up polling to check for new warnings every 30 seconds
        const interval = setInterval(fetchWarnings, 30000);
        return () => clearInterval(interval);
    }, []);

    const handleDismiss = async (warningId: number) => {
        try {
            await api.post(`/api/donor/warnings/${warningId}/dismiss/`);
            setWarnings(warnings.filter(w => w.id !== warningId));
        } catch (err) {
            console.error('Error dismissing warning:', err);
        }
    };

    if (loading) {
        return null;
    }

    if (error) {
        return null;
    }

    if (warnings.length === 0) {
        return null;
    }

    return (
        <Box sx={{ mb: 2 }}>
            {warnings.map((warning) => (
                <Alert
                    key={warning.id}
                    severity="warning"
                    sx={{ mb: 1 }}
                    action={
                        <Button color="inherit" size="small" onClick={() => handleDismiss(warning.id)}>
                            Dismiss
                        </Button>
                    }
                >
                    <AlertTitle>Admin Warning ⚠️</AlertTitle>
                    {warning.message}
                </Alert>
            ))}
        </Box>
    );
}; 