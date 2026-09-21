import React from 'react';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  Stack,
  Chip,
} from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';

// Icons
import DashboardIcon from '@mui/icons-material/Dashboard';
import InventoryIcon from '@mui/icons-material/Inventory';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import PeopleIcon from '@mui/icons-material/People';
import AssessmentIcon from '@mui/icons-material/Assessment';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import SettingsIcon from '@mui/icons-material/Settings';
import GraphicEqIcon from '@mui/icons-material/GraphicEq';
import MicIcon from '@mui/icons-material/Mic';

import { useLanguage } from '../context/LanguageContext';
import { useSimpleMode } from '../context/SimpleModeContext';

const DRAWER_WIDTH = 260;

const Sidebar = ({ mobileOpen, onMobileClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t, selectedLanguage } = useLanguage();
  const { simpleMode } = useSimpleMode();

  const menuItems = [
    { text: t('nav.dashboard'), english: 'Dashboard', path: '/dashboard', icon: <DashboardIcon /> },
    { text: t('nav.products'), english: 'My Stock', path: '/products', icon: <InventoryIcon /> },
    { text: t('nav.sales'), english: 'Sales', path: '/sales', icon: <PointOfSaleIcon /> },
    { text: t('nav.purchases'), english: 'Purchases', path: '/purchases', icon: <ShoppingCartIcon /> },
    { text: t('nav.suppliers'), english: 'Suppliers', path: '/suppliers', icon: <LocalShippingIcon /> },
    { text: t('nav.customers'), english: 'Customers (Khata)', path: '/customers', icon: <PeopleIcon /> },
    { text: t('nav.reports'), english: 'Reports', path: '/reports', icon: <AssessmentIcon /> },
    { text: t('nav.notifications') || 'Alerts', english: 'Alerts', path: '/notifications', icon: <NotificationsActiveIcon /> },
    { text: t('nav.settings'), english: 'Settings', path: '/settings', icon: <SettingsIcon /> },
  ];

  const handleNavigate = (path) => {
    navigate(path);
    if (onMobileClose) {
      onMobileClose();
    }
  };

  const drawerContent = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: '#ffffff',
        borderRight: '1px solid #e2e8f0',
      }}
    >
      {/* Brand Header */}
      <Box sx={{ px: 3, pt: 3, pb: 2.5 }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2.5,
              background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(5, 150, 105, 0.25)',
            }}
          >
            <GraphicEqIcon sx={{ fontSize: 26 }} />
          </Box>
          <Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 800,
                color: '#0f172a',
                fontFamily: "'Outfit', sans-serif",
                letterSpacing: '-0.3px',
                lineHeight: 1.1,
              }}
            >
              {t('appName')}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: '#059669',
                fontWeight: 700,
                fontSize: '0.68rem',
                letterSpacing: '0.4px',
                display: 'block',
                mt: 0.25,
              }}
            >
              {t('tagline')}
            </Typography>
          </Box>
        </Stack>
      </Box>

      <Divider sx={{ borderColor: '#f1f5f9' }} />

      {/* Nav List */}
      <Box sx={{ flexGrow: 1, px: 2, py: 2, overflowY: 'auto' }}>
        <List disablePadding>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path === '/dashboard' && location.pathname === '/');
            return (
              <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  onClick={() => handleNavigate(item.path)}
                  sx={{
                    borderRadius: 2.5,
                    py: simpleMode ? 1.4 : 1.1,
                    px: 1.75,
                    position: 'relative',
                    backgroundColor: isActive ? '#ecfdf5' : 'transparent',
                    color: isActive ? '#065f46' : '#475569',
                    fontWeight: isActive ? 700 : 500,
                    transition: 'all 0.15s ease',
                    '&:hover': {
                      backgroundColor: isActive ? '#d1fae5' : '#f8fafc',
                      color: isActive ? '#065f46' : '#0f172a',
                    },
                    ...(isActive && {
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        left: -8,
                        top: '18%',
                        height: '64%',
                        width: 4,
                        borderRadius: 2,
                        backgroundColor: '#059669',
                      },
                    }),
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 36,
                      color: isActive ? '#059669' : '#64748b',
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    secondary={selectedLanguage !== 'en' && item.english !== item.text ? item.english : null}
                    primaryTypographyProps={{
                      fontSize: simpleMode ? '0.98rem' : '0.88rem',
                      fontWeight: isActive ? 800 : 600,
                      lineHeight: 1.2,
                    }}
                    secondaryTypographyProps={{
                      fontSize: '0.68rem',
                      color: isActive ? '#059669' : '#94a3b8',
                      fontWeight: 600,
                      letterSpacing: '0.2px',
                    }}
                  />
                  {item.path === '/products' && (
                    <Chip
                      label="AI Voice"
                      size="small"
                      sx={{
                        height: 18,
                        fontSize: '0.62rem',
                        fontWeight: 700,
                        backgroundColor: '#dcfce7',
                        color: '#15803d',
                      }}
                    />
                  )}
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>

      {/* Bottom Swaranidhi AI Card */}
      <Box sx={{ p: 2 }}>
        <Box
          sx={{
            p: 2,
            borderRadius: 2.5,
            backgroundColor: '#f0fdf4',
            border: '1px solid #bbf7d0',
            textAlign: 'center',
          }}
        >
          <Stack direction="row" alignItems="center" justifyContent="center" spacing={1} mb={0.5}>
            <MicIcon sx={{ fontSize: 18, color: '#059669' }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#065f46' }}>
              {t('aiAssistant')}
            </Typography>
          </Stack>
          <Typography variant="caption" sx={{ color: '#166534', display: 'block', fontSize: '0.75rem', fontWeight: 500 }}>
            {t('smartAssistant')}
          </Typography>
          <Typography variant="caption" sx={{ color: '#059669', fontSize: '0.68rem', mt: 0.5, display: 'block' }}>
            v2.0 • Multilingual AI
          </Typography>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
    >
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: DRAWER_WIDTH,
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop Fixed Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: DRAWER_WIDTH,
            borderRight: '1px solid #e2e8f0',
          },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
};

export default Sidebar;
export { DRAWER_WIDTH };
