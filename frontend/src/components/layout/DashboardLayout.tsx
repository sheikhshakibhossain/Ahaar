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
} from '@mui/material';
import {
    Menu as MenuIcon,
    Dashboard as DashboardIcon,
    Add as AddIcon,
    History as HistoryIcon,
    Logout as LogoutIcon,
    LocationOn as LocationIcon,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

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

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const donorMenuItems = [
        { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
        { text: 'New Donation', icon: <AddIcon />, path: '/dashboard/donate' },
        { text: 'Donation History', icon: <HistoryIcon />, path: '/dashboard/history' },
    ];

    const recipientMenuItems = [
        { text: 'Dashboard', icon: <DashboardIcon />, path: '/recipient-dashboard' },
        { text: 'Available Donations', icon: <LocationIcon />, path: '/recipient-dashboard/nearby' },
        { text: 'My Donations', icon: <HistoryIcon />, path: '/recipient-dashboard/history' },
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
            <AppBar
                position="fixed"
                sx={{
                    width: { sm: `calc(100% - ${drawerWidth}px)` },
                    ml: { sm: `${drawerWidth}px` },
                }}
            >
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2, display: { sm: 'none' } }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" noWrap component="div">
                        {title}
                    </Typography>
                </Toolbar>
            </AppBar>
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
                    mt: '64px',
                }}
            >
                {children}
            </Box>
        </Box>
    );
}; 