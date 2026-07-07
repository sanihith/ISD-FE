import { useState } from 'react';
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
  Paper,
  useMediaQuery,
  useTheme
} from '@mui/material';
import {
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
  'Todos':          <TodoIcon />,
  'Tasks Assigned': <AssignedIcon />,
  'All Tasks':      <AllTasksIcon />,
  'My Day':         <MyDayIcon />,
  'Important':      <ImportantIcon />,
  'Reportee':       <ReporteeIcon />,
};

const DashboardLayout = ({ children, activeTab, onTabChange, tabs }: DashboardLayoutProps) => {
  const { user, logout } = useAuth();
  const [showNewRequest, setShowNewRequest] = useState(false);
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
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          color: '#fff',
          top: 0,
          left: 0,
          right: 0,
          zIndex: (theme) => (theme.zIndex.appBar ?? theme.zIndex.drawer) + 3
        }}
      >
        <Toolbar sx={{ px: { xs: 2, md: 4 }, py: 1.25, flexDirection: 'row', flexWrap: 'nowrap', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0, minWidth: 0 }}>
            <Box
              component="img"
              src={logo}
              alt="Logo"
              sx={{ height: 44, width: 'auto', display: { xs: 'none', sm: 'block' }, borderRadius: 2 }}
            />
            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 36, height: 36, display: { xs: 'flex', sm: 'none' } }}>
              T
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: '-0.5px', lineHeight: 1.2 }}>
                WorkTrack
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.7, fontSize: '0.65rem', letterSpacing: '0.5px' }}>
                Task Management
              </Typography>
            </Box>
          </Box>

          {/* Desktop tab pills — hidden on mobile */}
          <Box sx={{ flexGrow: 1, minWidth: 0, display: { xs: 'none', md: 'flex' }, justifyContent: 'center', width: '100%', overflow: 'hidden' }}>
            {hasTabs && (
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'nowrap', justifyContent: 'center', overflowX: 'auto', py: 1, width: '100%', maxWidth: 760 }}>
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
                        color: isActive ? '#0f172a' : 'rgba(255,255,255,0.82)',
                        bgcolor: isActive ? 'rgba(255,255,255,0.95)' : 'transparent',
                        boxShadow: isActive ? '0 4px 12px rgba(0,0,0,0.18)' : 'none',
                        '&:hover': {
                          bgcolor: isActive ? 'rgba(255,255,255,0.98)' : 'rgba(255,255,255,0.12)',
                          color: isActive ? '#0f172a' : '#fff'
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

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexShrink: 0, width: 'auto', maxWidth: 380, justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              startIcon={<AddIcon sx={{ fontSize: 18 }} />}
              onClick={() => setShowNewRequest(true)}
              sx={{
                borderRadius: 3,
                px: { xs: 1.25, md: 1.5 },
                py: 0.5,
                textTransform: 'none',
                fontWeight: 700,
                fontSize: '0.85rem',
                boxShadow: 'none',
                border: '1px solid rgba(255,255,255,0.12)',
                background: 'rgba(255,255,255,0.95)',
                color: 'var(--accent)',
                '&:hover': {
                  background: '#fff',
                  boxShadow: '0 6px 14px rgba(0,0,0,0.12)',
                  transform: 'translateY(-1px)'
                },
                transition: 'all 0.15s',
                display: 'inline-flex',
                alignItems: 'center',
                minWidth: 110
              }}
            >
              <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' }, lineHeight: 1 }}>New Task</Box>
              <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>+</Box>
            </Button>

            <NotificationCenter />

            <Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(255,255,255,0.2)', my: 1, display: { xs: 'none', md: 'block' } }} />

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: { xs: '100%', md: 'auto' }, justifyContent: { xs: 'space-between', md: 'flex-end' } }}>
              <Box sx={{ textAlign: 'right', display: { xs: 'none', lg: 'block' } }}>
                <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1.2, color: '#fff' }}>
                  {user?.name}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.65, fontSize: '0.7rem' }}>
                  {user?.role}
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

      {/* Main content — adds bottom padding on mobile so content isn't hidden behind bottom nav */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          px: { xs: 1.5, sm: 2, md: 4, lg: 6 },
          py: { xs: 2, md: 4 },
          pb: { xs: hasTabs && isMobile ? 10 : 2, md: 4 }
        }}
      >
        {children}
      </Box>

      {/* Mobile Bottom Navigation — shown only on xs/sm when tabs are present */}
      {hasTabs && isMobile && (
        <Paper
          elevation={8}
          className="mobile-bottom-nav"
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: (theme) => theme.zIndex.appBar + 2,
            borderTop: '1px solid var(--border)',
            borderRadius: 0,
            background: 'var(--header-gradient)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'stretch',
              overflowX: 'auto',
              scrollbarWidth: 'none',
              '&::-webkit-scrollbar': { display: 'none' },
              px: 0.5,
              py: 0.5,
            }}
          >
            {tabs.map((tab, index) => {
              const isActive = activeTab === index;
              const icon = TAB_ICONS[tab.label] ?? <AllTasksIcon />;
              return (
                <Box
                  key={index}
                  onClick={(e) => onTabChange?.(e as any, index)}
                  sx={{
                    flex: '0 0 auto',
                    minWidth: tabs.length <= 5 ? `${100 / tabs.length}%` : 72,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 0.4,
                    py: 1,
                    px: 0.5,
                    cursor: 'pointer',
                    borderRadius: 2,
                    mx: 0.25,
                    transition: 'all 0.18s cubic-bezier(0.4,0,0.2,1)',
                    bgcolor: isActive ? 'rgba(255,255,255,0.18)' : 'transparent',
                    position: 'relative',
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.12)',
                    },
                    // Active indicator dot
                    '&::after': isActive ? {
                      content: '""',
                      position: 'absolute',
                      top: 4,
                      width: 4,
                      height: 4,
                      borderRadius: '50%',
                      bgcolor: '#fff',
                    } : {},
                  }}
                >
                  <Box
                    sx={{
                      color: isActive ? '#fff' : 'rgba(255,255,255,0.55)',
                      transition: 'color 0.18s, transform 0.18s',
                      transform: isActive ? 'scale(1.15)' : 'scale(1)',
                      display: 'flex',
                      '& svg': { fontSize: 22 }
                    }}
                  >
                    {icon}
                  </Box>
                  <Typography
                    sx={{
                      fontSize: '0.6rem',
                      fontWeight: isActive ? 800 : 500,
                      color: isActive ? '#fff' : 'rgba(255,255,255,0.55)',
                      lineHeight: 1.1,
                      textAlign: 'center',
                      whiteSpace: 'nowrap',
                      letterSpacing: isActive ? '0.02em' : '0',
                      transition: 'all 0.18s',
                    }}
                  >
                    {tab.label}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        </Paper>
      )}

      <NewRequestPopup open={showNewRequest} onClose={() => setShowNewRequest(false)} />
    </Box>
  );
};

export default DashboardLayout;