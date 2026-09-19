import React, { useState, useEffect } from 'react';
import { Chip, Tooltip, Box } from '@mui/material';
import WifiIcon from '@mui/icons-material/Wifi';
import WifiOffIcon from '@mui/icons-material/WifiOff';
import { useLanguage } from '../context/LanguageContext';

const ConnectivityStatus = () => {
  const { t } = useLanguage();
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <Tooltip
      title={
        isOnline
          ? 'Connected to local store server'
          : t('connectivity.offlineTooltip')
      }
      arrow
    >
      <Chip
        size="small"
        icon={
          isOnline ? (
            <WifiIcon sx={{ fontSize: '14px !important', color: '#059669 !important' }} />
          ) : (
            <WifiOffIcon sx={{ fontSize: '14px !important', color: '#d97706 !important' }} />
          )
        }
        label={isOnline ? t('connectivity.online') : t('connectivity.offline')}
        sx={{
          height: 26,
          px: 0.5,
          fontWeight: 600,
          fontSize: '0.75rem',
          backgroundColor: isOnline ? '#ecfdf5' : '#fffbeb',
          color: isOnline ? '#065f46' : '#92400e',
          border: `1px solid ${isOnline ? '#a7f3d0' : '#fde68a'}`,
          cursor: 'help',
          display: { xs: 'none', sm: 'inline-flex' },
        }}
      />
    </Tooltip>
  );
};

export default ConnectivityStatus;
