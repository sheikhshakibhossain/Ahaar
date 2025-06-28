import React from 'react';
import {
    Container,
    Typography,
    Box,
    Paper,
} from '@mui/material';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { CrisisAlertBanner } from '../../components/crisis/CrisisAlertBanner';

const RecipientAlertsPage: React.FC = () => {
    return (
        <DashboardLayout title="Crisis Alerts">
            <Container maxWidth="lg">
                <Box mb={4}>
                    <Typography variant="h4" gutterBottom>
                        Crisis Alerts
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        View important alerts and notifications
                    </Typography>
                </Box>

                <Paper sx={{ p: 3 }}>
                    <CrisisAlertBanner />
                </Paper>
            </Container>
        </DashboardLayout>
    );
};

export default RecipientAlertsPage; 