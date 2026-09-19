import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Button,
  Box,
  Badge,
  Menu,
  MenuItem,
  Avatar,
  TextField,
  InputAdornment,
  Divider,
  ListItemIcon,
  ListItemText,
  Chip,
  Stack,
  Popover,
  List,
  ListItem,
  Tooltip,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import SearchIcon from '@mui/icons-material/Search';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import { useLocation, useNavigate } from 'react-router-dom';

import VoiceButton from './VoiceButton';
import LanguageSelector from './LanguageSelector';
import ConnectivityStatus from './ConnectivityStatus';
import { useLanguage } from '../context/LanguageContext';
import { useSimpleMode } from '../context/SimpleModeContext';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ onDrawerToggle, onVoiceCommandParsed }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { simpleMode, toggleSimpleMode, ttsEnabled, toggleTts } = useSimpleMode();
  const { user, logout } = useAuth();

  const [anchorElUser, setAnchorElUser] = useState(null);
  const [anchorElNotif, setAnchorElNotif] = useState(null);
  const [unreadCount, setUnreadCount] = useState(3);

  const handleOpenUserMenu = (event) => setAnchorElUser(event.currentTarget);
  const handleCloseUserMenu = () => setAnchorElUser(null);

  const handleOpenNotif = (event) => {
    setAnchorElNotif(event.currentTarget);
    setUnreadCount(0);
  };
  const handleCloseNotif = () => setAnchorElNotif(null);

  const getPageTitle = (pathname) => {
    switch (pathname) {
      case '/':
      case '/dashboard':
        return t('nav.dashboard');
      case '/products':
        return t('products.title');
      case '/sales':
        return t('sales.title');
      case '/purchases':
        return t('purchases.title');
      case '/suppliers':
        return t('suppliers.title');
      case '/customers':
        return t('customers.title');
      case '/reports':
        return t('reports.title');
      case '/settings':
        return t('settings.title');
      default:
        return t('appName');
    }
  };

  const notificationsList = [
    {
      id: 1,
      title: 'Basmati Rice',
      desc: 'Only 5 kg remaining. Time to reorder.',
      time: '10 min ago',
      type: 'warning',
      icon: <WarningAmberIcon sx={{ color: '#d97706', fontSize: 20 }} />,
    },
    {
      id: 2,
      title: 'Sale Completed',
      desc: 'Bill #INV-1025 for ₹216 via UPI.',
      time: '25 min ago',
      type: 'success',
      icon: <CheckCircleIcon sx={{ color: '#059669', fontSize: 20 }} />,
    },
    {
      id: 3,
      title: 'Stock Inward Received',
      desc: '50 kg rice from Lakshmi Agro added to stock.',
      time: '1 hour ago',
      type: 'info',
      icon: <LocalShippingOutlinedIcon sx={{ color: '#2563eb', fontSize: 20 }} />,
    },
    {
      id: 4,
      title: 'Swaranidhi Assistant',
      desc: 'Multilingual speech engine ready (English, Telugu, Hindi).',
      time: '2 hours ago',
      type: 'system',
      icon: <InfoOutlinedIcon sx={{ color: '#64748b', fontSize: 20 }} />,
    },
  ];

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        color: '#0f172a',
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar sx={{ minHeight: '70px !important', px: { xs: 2, md: 3 } }}>
        {/* Mobile Hamburger */}
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={onDrawerToggle}
          sx={{ mr: 1.5, display: { md: 'none' } }}
        >
          <MenuIcon />
        </IconButton>

        {/* Page Title & Breadcrumb */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Typography
            variant="h6"
            noWrap
            sx={{
              fontWeight: 800,
              fontSize: simpleMode ? '1.3rem' : { xs: '1.05rem', md: '1.25rem' },
              color: '#0f172a',
              fontFamily: "'Outfit', sans-serif",
            }}
          >
            {getPageTitle(location.pathname)}
          </Typography>

          {/* Connectivity Status (Online/Offline) */}
          <ConnectivityStatus />
        </Box>

        {/* Global Search Bar */}
        <Box
          sx={{
            display: { xs: 'none', lg: 'flex' },
            alignItems: 'center',
            ml: 3,
            width: 280,
          }}
        >
          <TextField
            size="small"
            fullWidth
            placeholder={t('products.searchPlaceholder')}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#94a3b8', fontSize: 18 }} />
                </InputAdornment>
              ),
              sx: {
                backgroundColor: '#f8fafc',
                borderRadius: 2.5,
                fontSize: '0.85rem',
                '& fieldset': { borderColor: '#e2e8f0' },
              },
            }}
          />
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        {/* Actions (Language Selector, TTS, Simple Mode, Voice Icon, Notifications, User) */}
        <Stack direction="row" spacing={1.2} alignItems="center">
          {/* Language Selector Dropdown */}
          <LanguageSelector />

          {/* Simple Mode Quick Toggle */}
          <Tooltip title={simpleMode ? 'Simple Mode (Larger Text): ON' : 'Turn on Simple Mode'}>
            <IconButton
              size="small"
              onClick={toggleSimpleMode}
              sx={{
                display: { xs: 'none', sm: 'inline-flex' },
                backgroundColor: simpleMode ? '#ecfdf5' : '#f8fafc',
                color: simpleMode ? '#059669' : '#64748b',
                border: `1px solid ${simpleMode ? '#a7f3d0' : '#e2e8f0'}`,
                fontWeight: 700,
              }}
              aria-label="Toggle Simple Mode"
            >
              <TextFieldsIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          {/* Voice Response TTS Toggle */}
          <Tooltip title={ttsEnabled ? 'Voice Responses: Spoken' : 'Voice Responses: Muted'}>
            <IconButton
              size="small"
              onClick={toggleTts}
              sx={{
                display: { xs: 'none', sm: 'inline-flex' },
                backgroundColor: ttsEnabled ? '#ecfdf5' : '#f8fafc',
                color: ttsEnabled ? '#059669' : '#94a3b8',
                border: '1px solid #e2e8f0',
              }}
              aria-label="Toggle Voice Responses"
            >
              {ttsEnabled ? <VolumeUpIcon fontSize="small" /> : <VolumeOffIcon fontSize="small" />}
            </IconButton>
          </Tooltip>

          {/* Quick Voice Command in Navbar */}
          <VoiceButton
            variant="icon"
            onCommandResult={onVoiceCommandParsed}
          />

          {/* Notifications Popover Trigger */}
          <IconButton
            onClick={handleOpenNotif}
            sx={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              '&:hover': { backgroundColor: '#f1f5f9' },
            }}
            aria-label="Notifications"
          >
            <Badge badgeContent={unreadCount} color="error">
              <NotificationsOutlinedIcon sx={{ color: '#475569', fontSize: 20 }} />
            </Badge>
          </IconButton>

          <Popover
            open={Boolean(anchorElNotif)}
            anchorEl={anchorElNotif}
            onClose={handleCloseNotif}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            PaperProps={{
              sx: {
                width: 340,
                maxHeight: 450,
                borderRadius: 3,
                boxShadow: '0 12px 32px rgba(0,0,0,0.1)',
                border: '1px solid #e2e8f0',
                mt: 1,
              },
            }}
          >
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                {t('settings.notificationsTab')}
              </Typography>
              <Chip label="4 New" size="small" color="primary" sx={{ height: 20, fontSize: '0.7rem' }} />
            </Box>
            <Divider />
            <List disablePadding>
              {notificationsList.map((item) => (
                <ListItem
                  key={item.id}
                  button
                  onClick={handleCloseNotif}
                  sx={{
                    py: 1.5,
                    px: 2,
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 1.5,
                    borderBottom: '1px solid #f8fafc',
                    '&:hover': { backgroundColor: '#f8fafc' },
                  }}
                >
                  <Box sx={{ mt: 0.5 }}>{item.icon}</Box>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a' }}>
                      {item.title}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mt: 0.25 }}>
                      {item.desc}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.68rem', mt: 0.5, display: 'block' }}>
                      {item.time}
                    </Typography>
                  </Box>
                </ListItem>
              ))}
            </List>
            <Box sx={{ p: 1, textAlign: 'center', bgcolor: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
              <Button
                size="small"
                fullWidth
                onClick={() => {
                  handleCloseNotif();
                  navigate('/notifications');
                }}
                sx={{ textTransform: 'none', fontWeight: 700, color: '#059669' }}
              >
                View all alerts →
              </Button>
            </Box>
          </Popover>

          <Divider orientation="vertical" flexItem sx={{ mx: 0.5, my: 1.5 }} />

          {/* User Profile Avatar & Menu */}
          <Box
            onClick={handleOpenUserMenu}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              cursor: 'pointer',
              p: 0.5,
              borderRadius: 2,
              '&:hover': { backgroundColor: '#f8fafc' },
            }}
          >
            <Avatar
              sx={{
                width: 36,
                height: 36,
                bgcolor: '#059669',
                fontWeight: 700,
                fontSize: '0.9rem',
              }}
            >
              {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'R'}
            </Avatar>
            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a', lineHeight: 1.2 }}>
                {user?.fullName || 'Ramesh Kumar'}
              </Typography>
              <Typography variant="caption" sx={{ color: '#059669', fontWeight: 600 }}>
                {user?.businessName || 'Shop Owner'}
              </Typography>
            </Box>
          </Box>

          <Menu
            anchorEl={anchorElUser}
            open={Boolean(anchorElUser)}
            onClose={handleCloseUserMenu}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            PaperProps={{
              sx: {
                width: 210,
                borderRadius: 2.5,
                boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                border: '1px solid #e2e8f0',
                mt: 1,
              },
            }}
          >
            <MenuItem onClick={() => { handleCloseUserMenu(); navigate('/settings'); }}>
              <ListItemIcon>
                <PersonOutlinedIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary={t('settings.profileTab')} />
            </MenuItem>
            <MenuItem onClick={() => { handleCloseUserMenu(); navigate('/settings'); }}>
              <ListItemIcon>
                <SettingsOutlinedIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary={t('nav.settings')} />
            </MenuItem>
            <Divider />
            <MenuItem
              onClick={() => {
                handleCloseUserMenu();
                logout();
                navigate('/login');
              }}
              sx={{ color: '#dc2626' }}
            >
              <ListItemIcon>
                <LogoutOutlinedIcon fontSize="small" sx={{ color: '#dc2626' }} />
              </ListItemIcon>
              <ListItemText primary="Logout" />
            </MenuItem>
          </Menu>
        </Stack>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
