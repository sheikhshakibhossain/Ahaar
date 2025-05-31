import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    Chip,
    IconButton,
    Alert,
    CircularProgress,
} from '@mui/material';
import {
    Warning as WarningIcon,
    Block as BlockIcon,
    CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { BadDonor, BadDonorsResponse } from '../../services/admin';
import { WarningDialog } from '../../components/admin/WarningDialog';
import { api } from '../../services/api';

export const AdminBadDonorsView: React.FC = () => {
    const [donors, setDonors] = useState<BadDonor[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedDonor, setSelectedDonor] = useState<BadDonor | null>(null);
    const [showWarningDialog, setShowWarningDialog] = useState(false);

    const fetchDonors = async () => {
        try {
            setLoading(true);
            const response = await api.get<BadDonorsResponse>('/api/admin/bad-donors/');
            setDonors(response.data.donors);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDonors();
    }, []);

    const handleAction = async (donorId: number, action: 'warn' | 'ban' | 'unban') => {
        try {
            if (action === 'warn') {
                console.log('Warning action triggered for donor:', donorId);
                const donor = donors.find(d => d.id === donorId);
                console.log('Found donor:', donor);
                if (donor) {
                    setSelectedDonor(donor);
                    setShowWarningDialog(true);
                    console.log('Warning dialog should be visible now');
                }
                return;
            }

            await api.post(`/api/admin/donors/${donorId}/${action}/`);
            // Refresh the list after action
            fetchDonors();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        }
    };

    const handleWarningSent = () => {
        fetchDonors();
    };

    if (loading) {
        return (
            <DashboardLayout title="Bad Donors Management">
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                    <CircularProgress />
                </Box>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Bad Donors Management">
            <Box sx={{ p: 3 }}>
                <Typography variant="h4" gutterBottom>
                    Bad Donors Management
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Name</TableCell>
                                <TableCell>Email</TableCell>
                                <TableCell>Donations</TableCell>
                                <TableCell>Rating</TableCell>
                                <TableCell>Warnings</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {donors.map((donor) => (
                                <TableRow key={donor.id}>
                                    <TableCell>{donor.first_name} {donor.last_name}</TableCell>
                                    <TableCell>{donor.email}</TableCell>
                                    <TableCell>{donor.donation_count}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={`${donor.average_rating.toFixed(1)} ⭐`}
                                            color={donor.average_rating < 3 ? 'error' : 'default'}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={donor.warning_count || 0}
                                            color="warning"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={donor.is_banned ? 'Banned' : 'Active'}
                                            color={donor.is_banned ? 'error' : 'success'}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                            <IconButton
                                                color="warning"
                                                onClick={() => handleAction(donor.id, 'warn')}
                                                title="Send Warning"
                                            >
                                                <WarningIcon />
                                            </IconButton>
                                            {!donor.is_banned ? (
                                                <IconButton
                                                    color="error"
                                                    onClick={() => handleAction(donor.id, 'ban')}
                                                    title="Ban Donor"
                                                >
                                                    <BlockIcon />
                                                </IconButton>
                                            ) : (
                                                <IconButton
                                                    color="success"
                                                    onClick={() => handleAction(donor.id, 'unban')}
                                                    title="Unban Donor"
                                                >
                                                    <CheckCircleIcon />
                                                </IconButton>
                                            )}
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>

            <WarningDialog
                open={showWarningDialog}
                onClose={() => {
                    setShowWarningDialog(false);
                    setSelectedDonor(null);
                }}
                donorId={selectedDonor?.id || 0}
                onWarningSent={handleWarningSent}
            />
        </DashboardLayout>
    );
}; 