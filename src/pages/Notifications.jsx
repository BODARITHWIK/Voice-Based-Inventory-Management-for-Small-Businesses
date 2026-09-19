import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Chip,
  IconButton,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Tooltip,
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutlined';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import PageHeader from '../components/PageHeader';
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { useSimpleMode } from '../context/SimpleModeContext';

export default function Notifications({ showToast }) {
  const { t } = useLanguage();
  const { simpleMode } = useSimpleMode();
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('ALL'); // 'ALL' | 'UNREAD' | 'STOCK' | 'KHATA'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await getNotifications();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      showToast?.('Notification marked as read', 'success');
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      showToast?.('All notifications marked as read', 'success');
    } catch (e) {
      console.error(e);
    }
  };

  const filtered = notifications.filter((item) => {
    if (filter === 'UNREAD') return !item.read;
    if (filter === 'STOCK') return item.type === 'LOW_STOCK' || item.type === 'OUT_OF_STOCK';
    if (filter === 'KHATA') return item.type === 'CUSTOMER_CREDIT' || item.type === 'PAYMENT_REMINDER';
    return true;
  });

  const getIcon = (type) => {
    switch (type) {
      case 'OUT_OF_STOCK':
        return <ErrorOutlineIcon sx={{ color: '#ef4444', fontSize: 24 }} />;
      case 'LOW_STOCK':
        return <WarningAmberIcon sx={{ color: '#f59e0b', fontSize: 24 }} />;
      case 'CUSTOMER_CREDIT':
      case 'PAYMENT_REMINDER':
        return <AccountBalanceWalletIcon sx={{ color: '#2563eb', fontSize: 24 }} />;
      case 'SALE':
        return <ShoppingBagIcon sx={{ color: '#059669', fontSize: 24 }} />;
      default:
        return <NotificationsActiveIcon sx={{ color: '#059669', fontSize: 24 }} />;
    }
  };

  return (
    <Box>
      <PageHeader
        title="Store Alerts & Notifications"
        subtitle="Stay updated on inventory levels, customer credit, and order syncs"
        action={
          <Button
            variant="outlined"
            startIcon={<DoneAllIcon />}
            onClick={handleMarkAllRead}
            sx={{
              borderColor: '#cbd5e1',
              color: '#334155',
              fontWeight: 700,
              textTransform: 'none',
              '&:hover': { borderColor: '#059669', color: '#059669', bgcolor: '#ecfdf5' },
            }}
          >
            Mark All as Read
          </Button>
        }
      />

      {/* Filter Tabs */}
      <Stack direction="row" spacing={1.5} sx={{ mb: 3 }} flexWrap="wrap" useFlexGap>
        {[
          { key: 'ALL', label: 'All Alerts' },
          { key: 'UNREAD', label: `Unread (${notifications.filter((n) => !n.read).length})` },
          { key: 'STOCK', label: 'Stock Alerts' },
          { key: 'KHATA', label: 'Khata / Credit' },
        ].map((tab) => (
          <Chip
            key={tab.key}
            label={tab.label}
            clickable
            onClick={() => setFilter(tab.key)}
            sx={{
              fontWeight: 700,
              fontSize: simpleMode ? '0.95rem' : '0.85rem',
              py: simpleMode ? 2.2 : 1.8,
              bgcolor: filter === tab.key ? '#059669' : '#fff',
              color: filter === tab.key ? '#fff' : '#475569',
              border: '1px solid',
              borderColor: filter === tab.key ? '#059669' : '#e2e8f0',
              '&:hover': {
                bgcolor: filter === tab.key ? '#047857' : '#f1f5f9',
              },
            }}
          />
        ))}
      </Stack>

      {/* Notifications List */}
      <Card sx={{ borderRadius: 3.5, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <List disablePadding>
          {filtered.length === 0 ? (
            <Box sx={{ py: 6, textAlign: 'center' }}>
              <CheckCircleOutlineIcon sx={{ fontSize: 48, color: '#10b981', mb: 1.5 }} />
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b' }}>
                All Caught Up!
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b' }}>
                No active notifications in this category.
              </Typography>
            </Box>
          ) : (
            filtered.map((item, idx) => (
              <React.Fragment key={item.id || idx}>
                <ListItem
                  sx={{
                    py: 2.2,
                    px: { xs: 2, sm: 3 },
                    bgcolor: item.read ? '#fff' : '#f0fdf4',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    '&:hover': { bgcolor: '#f8fafc' },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      sx={{
                        width: 44,
                        height: 44,
                        borderRadius: 2.5,
                        bgcolor: item.read ? '#f1f5f9' : '#dcfce7',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {getIcon(item.type)}
                    </Box>

                    <Box>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="subtitle2" sx={{ fontWeight: item.read ? 600 : 800, color: '#0f172a' }}>
                          {item.title}
                        </Typography>
                        {!item.read && (
                          <Chip
                            label="New"
                            size="small"
                            sx={{
                              height: 18,
                              fontSize: '0.65rem',
                              fontWeight: 800,
                              bgcolor: '#059669',
                              color: '#fff',
                            }}
                          />
                        )}
                      </Stack>
                      <Typography variant="body2" sx={{ color: '#475569', mt: 0.25 }}>
                        {item.message || item.desc}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.72rem', display: 'block', mt: 0.5 }}>
                        {item.createdAt || item.time || 'Today'}
                      </Typography>
                    </Box>
                  </Box>

                  {!item.read && (
                    <Tooltip title="Mark as read">
                      <IconButton
                        size="small"
                        onClick={() => handleMarkAsRead(item.id)}
                        sx={{ color: '#059669', ml: 2 }}
                      >
                        <CheckCircleOutlineIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </ListItem>
                {idx < filtered.length - 1 && <Divider />}
              </React.Fragment>
            ))
          )}
        </List>
      </Card>
    </Box>
  );
}
