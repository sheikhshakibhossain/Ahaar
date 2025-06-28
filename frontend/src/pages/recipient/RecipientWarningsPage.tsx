import React from 'react';
import {
    Container,
    Typography,
    Box,
    Paper,
} from '@mui/material';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { AdminWarningAlert } from '../../components/donor/AdminWarningAlert';

const RecipientWarningsPage: React.FC = () => {
    return (
        <DashboardLayout title="Warnings">
            <Container maxWidth="lg">
                <Box mb={4}>
                    <Typography variant="h4" gutterBottom>
                        Warnings
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        View and manage warnings from administrators
                    </Typography>
                </Box>

                <Paper sx={{ p: 3 }}>
                    <AdminWarningAlert />
                </Paper>
            </Container>
        </DashboardLayout>
    );
};

export default RecipientWarningsPage; 