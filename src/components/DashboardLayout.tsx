import { useState, memo } from 'react';
import type { ReactNode, SyntheticEvent } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Avatar,
  IconButton,
  Divider,
  useMediaQuery,
  useTheme,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  Menu as MenuIcon,
  Logout as LogoutIcon,
  Add as AddIcon,
  CheckBox as TodoIcon,
  WbSunny as MyDayIcon,
  Star as ImportantIcon,
  Assignment as AssignedIcon,
  ViewList as AllTasksIcon,
  Group as ReporteeIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import NewRequestPopup from './NewRequestPopup';
import NotificationCenter from './NotificationCenter';
import logo from '../assets/logo.jpeg';

interface DashboardLayoutProps {
  children: ReactNode;
  activeTab?: number;
  onTabChange?: (event: SyntheticEvent, newValue: number) => void;
  tabs?: { label: string }[];
}

// Map tab labels to icons
const TAB_ICONS: Record<string, ReactNode> = {
  'Todos': <TodoIcon />,
  'Tasks Assigned': <AssignedIcon />,
  'All Tasks': <AllTasksIcon />,
  'My Day': <MyDayIcon />,
  'Important': <ImportantIcon />,
  'Reportees': <ReporteeIcon />,
};

const formatRole = (role?: string) => {
  if (!role) return '';
  return role
    .replace(/^ROLE_/, '')
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

const DashboardLayout = ({ children, activeTab, onTabChange, tabs }: DashboardLayoutProps) => {
  const { user, logout } = useAuth();
  const [showNewRequest, setShowNewRequest] = useState(false);
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState<null | HTMLElement>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const hasTabs = tabs && onTabChange !== undefined && activeTab !== undefined;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'var(--bg)' }}>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          background: 'var(--header-gradient)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(255,255,255,0.15)',
          boxShadow: '0 4px 30px rgba(0, 0, 0, 0.15)',
          color: '#fff',
          top: 0,
          left: 0,
          right: 0,
          zIndex: (theme) => (theme.zIndex.appBar ?? theme.zIndex.drawer) + 3
        }}
      >
        <Toolbar sx={{ px: { xs: 2, md: 4 }, py: 1.25, flexDirection: 'row', flexWrap: 'nowrap', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 }, flex: { xs: 1, sm: '0 0 auto' }, minWidth: 0 }}>
            {hasTabs && isMobile && (
              <>
                <IconButton edge="start" color="inherit" aria-label="menu" onClick={(e) => setMobileMenuAnchor(e.currentTarget)} sx={{ mr: 0 }}>
                  <MenuIcon />
                </IconButton>
                <Menu
                  anchorEl={mobileMenuAnchor}
                  open={Boolean(mobileMenuAnchor)}
                  onClose={() => setMobileMenuAnchor(null)}
                  sx={{
                    mt: 1.5,
                    '& .MuiPaper-root': { width: 220, borderRadius: 2, boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }
                  }}
                >
                  {tabs.map((tab, index) => (
                    <MenuItem
                      key={index}
                      selected={activeTab === index}
                      onClick={(e) => {
                        onTabChange?.(e as any, index);
                        setMobileMenuAnchor(null);
                      }}
                      sx={{ py: 1.5 }}
                    >
                      <ListItemIcon sx={{ color: activeTab === index ? 'var(--accent)' : 'inherit', minWidth: 36 }}>
                        {TAB_ICONS[tab.label] ?? <AllTasksIcon />}
                      </ListItemIcon>
                      <ListItemText primary={
                        <Typography sx={{ fontWeight: activeTab === index ? 700 : 500, fontSize: '0.9rem' }}>
                          {tab.label}
                        </Typography>
                      } />
                    </MenuItem>
                  ))}
                </Menu>
              </>
            )}
            <Box
              component="img"
              src={logo}
              alt="Logo"
              sx={{ height: 44, width: 'auto', display: { xs: 'none', sm: 'block' }, borderRadius: 2 }}
            />
            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 36, height: 36, display: { xs: 'flex', sm: 'none' } }}>
              T
            </Avatar>
            <Box sx={{ minWidth: 0, overflow: 'hidden' }}>
              <Typography variant="h6" noWrap sx={{ fontWeight: 800, letterSpacing: '-0.5px', lineHeight: 1.2 }}>
                ISD
              </Typography>
              <Typography variant="caption" noWrap sx={{ opacity: 0.7, fontSize: '0.65rem', letterSpacing: '0.5px', display: 'block' }}>
                Task Management
              </Typography>
            </Box>
          </Box>

          {/* Desktop tab pills — hidden on mobile */}
          <Box sx={{ flex: 1, minWidth: 0, display: { xs: 'none', md: 'flex' }, justifyContent: 'center', overflow: 'hidden', px: { md: 1, lg: 2 } }}>
            {hasTabs && (
              <Box sx={{
                display: 'flex', gap: 1, flexWrap: 'nowrap',
                justifyContent: { md: 'flex-start', lg: 'center' },
                overflowX: 'auto', py: 1, width: '100%', maxWidth: 760,
                '&::-webkit-scrollbar': { display: 'none' },
                scrollbarWidth: 'none',
              }}>
                {tabs.map((tab, index) => {
                  const isActive = activeTab === index;
                  return (
                    <Button
                      key={index}
                      onClick={(event) => onTabChange?.(event, index)}
                      variant={isActive ? 'contained' : 'text'}
                      sx={{
                        borderRadius: 999,
                        px: 1.75,
                        py: 0.75,
                        minWidth: 'auto',
                        textTransform: 'none',
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        whiteSpace: 'nowrap',
                        color: isActive ? '#0f172a' : 'rgba(255,255,255,0.82)',
                        bgcolor: isActive ? 'rgba(255,255,255,0.95)' : 'transparent',
                        boxShadow: isActive ? '0 4px 12px rgba(0,0,0,0.18)' : 'none',
                        transition: 'all 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)',
                        '&:hover': {
                          bgcolor: isActive ? 'rgba(255,255,255,0.98)' : 'rgba(255,255,255,0.12)',
                          color: isActive ? '#0f172a' : '#fff',
                          transform: 'translateY(-1px)'
                        }
                      }}
                    >
                      {tab.label}
                    </Button>
                  );
                })}
              </Box>
            )}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.5 }, flexShrink: 0, width: 'auto', justifyContent: 'flex-end', ml: 'auto' }}>
            <Button
              variant="contained"
              startIcon={<AddIcon sx={{ fontSize: 18 }} />}
              onClick={() => setShowNewRequest(true)}
              sx={{
                borderRadius: 3,
                px: { xs: 1.5, md: 1.5 },
                py: 0.5,
                textTransform: 'none',
                fontWeight: 700,
                fontSize: '0.85rem',
                boxShadow: 'none',
                border: '1px solid rgba(255,255,255,0.12)',
                background: 'rgba(255,255,255,0.95)',
                color: 'var(--accent)',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  background: '#fff',
                  boxShadow: '0 8px 24px rgba(37,99,235,0.25)',
                  transform: 'translateY(-2px)'
                },
                display: 'inline-flex',
                alignItems: 'center',
              }}
            >
              <Box component="span" sx={{ lineHeight: 1 }}>New Task</Box>
            </Button>

            <NotificationCenter />

            <Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(255,255,255,0.2)', my: 1, display: { xs: 'none', md: 'block' } }} />

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: { xs: '100%', md: 'auto' }, justifyContent: { xs: 'space-between', md: 'flex-end' } }}>
              <Box sx={{ textAlign: 'right', display: { xs: 'none', lg: 'block' } }}>
                <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1.2, color: '#fff' }}>
                  {user?.name}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.65, fontSize: '0.7rem' }}>
                  {formatRole(user?.role)}
                </Typography>
              </Box>
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  bgcolor: 'rgba(255,255,255,0.2)',
                  color: '#fff',
                  fontWeight: 'bold',
                  fontSize: '0.875rem',
                  border: '2px solid rgba(255,255,255,0.4)',
                  transition: 'border-color 0.2s',
                  '&:hover': { borderColor: 'rgba(255,255,255,0.8)' }
                }}
              >
                {user?.name?.split(' ')?.map((n: string) => n[0]).join('')}
              </Avatar>
              <IconButton
                onClick={logout}
                size="small"
                sx={{
                  color: 'rgba(255,255,255,0.7)',
                  '&:hover': { color: '#fff', background: 'rgba(255,255,255,0.1)' }
                }}
              >
                <LogoutIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          px: { xs: 1.5, sm: 2, md: 4, lg: 6 },
          py: { xs: 2, md: 4 },
        }}
      >
        {children}
      </Box>

      <NewRequestPopup open={showNewRequest} onClose={() => setShowNewRequest(false)} />
    </Box>
  );
};

export default memo(DashboardLayout);