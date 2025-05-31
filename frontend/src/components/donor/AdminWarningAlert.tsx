import React, { useState, useEffect } from 'react';
import { Alert, AlertTitle, IconButton, Collapse } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { api } from '../../services/api';

interface Warning {
    id: string;
    message: string;
    timestamp: string;
}

export const AdminWarningAlert: React.FC = () => {
    const [warnings, setWarnings] = useState<Warning[]>([]);
    const [open, setOpen] = useState(true);

    useEffect(() => {
        const fetchWarnings = async () => {
            try {
                const response = await api.get<{ warnings: Warning[] }>('/api/donor/warnings');
                setWarnings(response.data.warnings || []);
            } catch (error) {
                console.error('Error fetching warnings:', error);
                setWarnings([]);
            }
        };

        fetchWarnings();
    }, []);

    if (!warnings || warnings.length === 0) {
        return null;
    }

    return (
        <Collapse in={open}>
            <Alert
                severity="warning"
                sx={{ mb: 2 }}
                action={
                    <IconButton
                        aria-label="close"
                        color="inherit"
                        size="small"
                        onClick={() => setOpen(false)}
                    >
                        <CloseIcon fontSize="inherit" />
                    </IconButton>
                }
            >
                <AlertTitle>Admin Warning</AlertTitle>
                {warnings.map((warning) => (
                    <div key={warning.id}>
                        ⚠️ {warning.message}
                    </div>
                ))}
            </Alert>
        </Collapse>
    );
}; 