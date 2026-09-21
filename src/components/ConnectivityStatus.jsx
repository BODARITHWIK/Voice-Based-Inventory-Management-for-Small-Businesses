import React, { useState, useEffect } from 'react';
import { Chip, Tooltip, Stack } from '@mui/material';
import WifiIcon from '@mui/icons-material/Wifi';
import WifiOffIcon from '@mui/icons-material/WifiOff';
import SyncIcon from '@mui/icons-material/Sync';
import { useLanguage } from '../context/LanguageContext';
import { offlineQueue } from '../services/offlineQueue';
import { syncOfflineQueue } from '../services/api';

const ConnectivityStatus = () => {
  const { t } = useLanguage();
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [queueState, setQueueState] = useState({
    count: offlineQueue.getPendingCount(),
    status: 'IDLE',
    error: null,
  });

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncOfflineQueue();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const unsubscribe = offlineQueue.subscribe((state) => {
      setQueueState(state);
    });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      unsubscribe();
    };
  }, []);

  const handleManualSync = async () => {
    if (isOnline && queueState.count > 0) {
      await syncOfflineQueue();
    }
  };

  return (
    <Stack direction="row" spacing={1} alignItems="center">
      {queueState.count > 0 && (
        <Tooltip
          title={
            isOnline
              ? `${t('connectivity.pendingSync', { count: queueState.count })} - Click to sync now`
              : t('connectivity.offlineTooltip')
          }
          arrow
        >
          <Chip
            size="small"
            icon={<SyncIcon sx={{ fontSize: '14px !important', animation: queueState.status === 'SYNCING' ? 'spin 1.5s linear infinite' : 'none' }} />}
            label={queueState.status === 'SYNCING' ? t('connectivity.syncing') : `${queueState.count} pending`}
            onClick={handleManualSync}
            sx={{
              height: 26,
              px: 0.5,
              fontWeight: 700,
              fontSize: '0.75rem',
              backgroundColor: '#eff6ff',
              color: '#1d4ed8',
              border: '1px solid #bfdbfe',
              cursor: isOnline ? 'pointer' : 'default',
              display: { xs: 'none', sm: 'inline-flex' },
              '@keyframes spin': {
                '0%': { transform: 'rotate(0deg)' },
                '100%': { transform: 'rotate(360deg)' },
              },
            }}
          />
        </Tooltip>
      )}

      <Tooltip
        title={
          isOnline
            ? 'Connected to store server'
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
    </Stack>
  );
};

export default ConnectivityStatus;

