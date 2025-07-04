import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    AppBar,
    Box,
    CssBaseline,
    Divider,
    Drawer,
    IconButton,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Toolbar,
    Typography,
    useTheme,
    Avatar,
    Menu,
    MenuItem,
    Badge,
    Button,
} from '@mui/material';
import {
    Menu as MenuIcon,
    Dashboard as DashboardIcon,
    Add as AddIcon,
    History as HistoryIcon,
    Logout as LogoutIcon,
    LocationOn as LocationIcon,
    Person as PersonIcon,
    Notifications as NotificationsIcon,
    Warning as WarningIcon,
    NotificationsActive as AlertIcon,
    Psychology as PsychologyIcon,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { GenerosityAIChat } from '../ai/GenerosityAIChat';

interface DashboardLayoutProps {
    children: React.ReactNode;
    title: string;
}

const drawerWidth = 240;

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, title }) => {
    const theme = useTheme();
    const navigate = useNavigate();
    const { logout, user } = useAuth();
    const [mobileOpen, setMobileOpen] = React.useState(false);
    const [warningCount, setWarningCount] = React.useState(0);
    const [alertCount, setAlertCount] = React.useState(0);
    const [chatOpen, setChatOpen] = React.useState(false);

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    // Fetch warning and alert counts
    React.useEffect(() => {
        const fetchCounts = async () => {
            try {
                // Fetch warning count
                const warningsResponse = await fetch('/api/donor/warnings/', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                    }
                });
                if (warningsResponse.ok) {
                    const warningsData = await warningsResponse.json();
                    setWarningCount(warningsData.warnings?.length || 0);
                }

                // Fetch alert count
                const alertsResponse = await fetch('/api/user/crisis-alerts/', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                    }
                });
                if (alertsResponse.ok) {
                    const alertsData = await alertsResponse.json();
                    setAlertCount(alertsData.alerts?.length || 0);
                }
            } catch (error) {
                console.error('Error fetching counts:', error);
            }
        };

        fetchCounts();
    }, []);

    const donorMenuItems = [
        { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
        { text: 'New Donation', icon: <AddIcon />, path: '/dashboard/donate' },
        { text: 'Donation History', icon: <HistoryIcon />, path: '/dashboard/history' },
        { 
            text: 'Warnings', 
            icon: <Badge badgeContent={warningCount} color="error"><WarningIcon /></Badge>, 
            path: '/dashboard/warnings' 
        },
        { 
            text: 'Alerts', 
            icon: <Badge badgeContent={alertCount} color="warning"><AlertIcon /></Badge>, 
            path: '/dashboard/alerts' 
        },
    ];

    const recipientMenuItems = [
        { text: 'Dashboard', icon: <DashboardIcon />, path: '/recipient-dashboard' },
        { text: 'Available Donations', icon: <LocationIcon />, path: '/recipient-dashboard/nearby' },
        { text: 'My Donations', icon: <HistoryIcon />, path: '/recipient-dashboard/history' },
        { 
            text: 'Alerts', 
            icon: <Badge badgeContent={alertCount} color="warning"><AlertIcon /></Badge>, 
            path: '/recipient-dashboard/alerts' 
        },
    ];

    const menuItems = user?.role === 'donor' ? donorMenuItems : recipientMenuItems;

    const drawer = (
        <div>
            <Toolbar>
                <Typography variant="h6" noWrap>
                    Ahaar
                </Typography>
            </Toolbar>
            <Divider />
            <List>
                {menuItems.map((item) => (
                    <ListItem
                        component="div"
                        key={item.text}
                        onClick={() => navigate(item.path)}
                        sx={{ cursor: 'pointer' }}
                    >
                        <ListItemIcon>{item.icon}</ListItemIcon>
                        <ListItemText primary={item.text} />
                    </ListItem>
                ))}
                
                {/* Generosity AI Chat Button */}
                <ListItem
                    component="div"
                    onClick={() => setChatOpen(true)}
                    sx={{ 
                        cursor: 'pointer',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        mx: 1,
                        borderRadius: 2,
                        mb: 1,
                        '&:hover': {
                            background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                        }
                    }}
                >
                    <ListItemIcon sx={{ color: 'white' }}>
                        <PsychologyIcon />
                    </ListItemIcon>
                    <ListItemText 
                        primary="Generosity AI" 
                        primaryTypographyProps={{ 
                            sx: { 
                                fontWeight: 'bold',
                                fontSize: '0.9rem'
                            } 
                        }}
                    />
                </ListItem>
                
                <Divider />
                <ListItem component="div" onClick={logout} sx={{ cursor: 'pointer' }}>
                    <ListItemIcon><LogoutIcon /></ListItemIcon>
                    <ListItemText primary="Logout" />
                </ListItem>
            </List>
        </div>
    );

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <Box
                component="nav"
                sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
            >
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{
                        keepMounted: true, // Better open performance on mobile.
                    }}
                    sx={{
                        display: { xs: 'block', sm: 'none' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                    }}
                >
                    {drawer}
                </Drawer>
                <Drawer
                    variant="permanent"
                    sx={{
                        display: { xs: 'none', sm: 'block' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                    }}
                    open
                >
                    {drawer}
                </Drawer>
            </Box>
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    width: { sm: `calc(100% - ${drawerWidth}px)` },
                    ml: { sm: `${drawerWidth}px` },
                }}
            >
                {children}
            </Box>
            
            {/* Generosity AI Chat Dialog */}
            <GenerosityAIChat 
                open={chatOpen} 
                onClose={() => setChatOpen(false)} 
            />
        </Box>
    );
}; 