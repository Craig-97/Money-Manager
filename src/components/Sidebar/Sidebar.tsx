import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Dashboard, Logout, MenuOpen, NoteRounded, Settings, Update } from '@mui/icons-material';
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
import { useLogout, useSidebarState } from '~/hooks';
import { useAccountContext, useSidebarStore } from '~/state';

export const DRAWER_WIDTH = 280;
export const COLLAPSED_DRAWER_WIDTH = 82;

const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', icon: <Dashboard /> },
  { path: '/forecast', label: 'Forecast', icon: <Update /> },
  { path: '/notes', label: 'Notes', icon: <NoteRounded /> }
];

export const Sidebar = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isBelowMd = useMediaQuery(theme.breakpoints.down('md'));
  const { pathname } = useLocation();
  const { user } = useAccountContext();
  const { isOpen, setSidebarIsOpen } = useSidebarStore();
  const navigate = useNavigate();
  const logout = useLogout();
  const drawerWidth = !isOpen ? COLLAPSED_DRAWER_WIDTH : DRAWER_WIDTH;
  useSidebarState();

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
              setSidebarIsOpen(!isOpen);
            }
          }}
          sx={{ display: { sm: 'none', md: 'flex' } }}>
          <MenuOpen sx={{ transform: !isOpen ? 'rotate(180deg)' : 'none' }} />
        </IconButton>
        {isOpen && (
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
              sx={{
                minHeight: 48,
                justifyContent: !isOpen ? 'center' : 'initial',
                px: 2.5
              }}>
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: !isOpen ? 0 : 3,
                  justifyContent: 'center'
                }}>
                {icon}
              </ListItemIcon>
              {isOpen && (
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
          direction={!isOpen ? 'column' : 'row'}
          spacing={2}
          alignItems="center"
          justifyContent="space-between">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar sx={{ width: 32, height: 32 }}>
              {user.firstName?.[0]}
              {user.surname?.[0]}
            </Avatar>
            {isOpen && (
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
              <IconButton onClick={() => logout()} color="inherit">
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
        open={isOpen}
        onClose={() => setSidebarIsOpen(false)}
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
