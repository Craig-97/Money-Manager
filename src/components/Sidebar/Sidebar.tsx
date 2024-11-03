import {
  AccountBalanceWallet,
  Dashboard,
  Logout,
  MenuOpen,
  NoteRounded,
  Receipt,
  Settings,
  Update
} from '@mui/icons-material';
import {
  Avatar,
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useLogout } from '~/hooks';
import { useAccountContext } from '~/state';

const DRAWER_WIDTH = 280;
const COLLAPSED_DRAWER_WIDTH = 82;

const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', icon: <Dashboard /> },
  { path: '/notes', label: 'Notes', icon: <NoteRounded /> },
  { path: '/forecast', label: 'Forecast', icon: <Update /> },
  { path: '/bills', label: 'Bills', icon: <Receipt /> },
  { path: '/payments', label: 'Payments Due', icon: <AccountBalanceWallet /> }
];

export const Sidebar = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isBelowMd = useMediaQuery(theme.breakpoints.down('md'));
  const [isCollapsed, setIsCollapsed] = useState(isBelowMd);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const logout = useLogout();
  const { user } = useAccountContext();

  const drawerWidth = isCollapsed ? COLLAPSED_DRAWER_WIDTH : DRAWER_WIDTH;

  useEffect(() => {
    setIsCollapsed(isBelowMd);
  }, [isBelowMd]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    logout();
  };

  // TODO: Sidebar open state doesn't persist on nav item click

  const drawer = (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.paper'
      }}>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton
          onClick={() => {
            if (!isBelowMd) {
              setIsCollapsed(prev => !prev);
            }
          }}
          sx={{ display: { sm: 'none', md: 'flex' } }}>
          <MenuOpen sx={{ transform: isCollapsed ? 'rotate(180deg)' : 'none' }} />
        </IconButton>
        {!isCollapsed && (
          <Typography variant="h6" noWrap component="div" fontWeight={700}>
            Money Manager
          </Typography>
        )}
      </Box>

      <Divider />

      <List sx={{ flex: 1 }}>
        {NAV_ITEMS.map(({ path, label, icon }) => (
          <ListItem key={path} disablePadding>
            <ListItemButton
              component={Link}
              to={path}
              selected={pathname === path}
              onClick={() => isMobile && handleDrawerToggle()}
              sx={{
                minHeight: 48,
                justifyContent: isCollapsed ? 'center' : 'initial',
                px: 2.5
              }}>
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: isCollapsed ? 0 : 3,
                  justifyContent: 'center'
                }}>
                {icon}
              </ListItemIcon>
              {!isCollapsed && (
                <ListItemText
                  primary={label}
                  primaryTypographyProps={{ sx: { fontWeight: 500 } }}
                />
              )}
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider />

      <Box sx={{ p: 2 }}>
        <Stack
          direction={isCollapsed ? 'column' : 'row'}
          spacing={2}
          alignItems="center"
          justifyContent="space-between">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar sx={{ width: 32, height: 32 }}>
              {user.firstName?.[0]}
              {user.surname?.[0]}
            </Avatar>
            {!isCollapsed && (
              <Box>
                <Typography variant="subtitle2">
                  {user.firstName} {user.surname}
                </Typography>
              </Box>
            )}
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Settings">
              <IconButton onClick={() => navigate('/settings')}>
                <Settings fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Logout">
              <IconButton onClick={handleLogout} color="inherit">
                <Logout fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Stack>
      </Box>
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{
        width: { sm: drawerWidth },
        flexShrink: { sm: 0 }
      }}>
      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={isMobile ? mobileOpen : true}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true
        }}
        sx={{
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            borderRight: `1px solid ${theme.palette.divider}`,
            transition: theme.transitions.create(['width'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen
            })
          }
        }}>
        {drawer}
      </Drawer>
    </Box>
  );
};
