import React from 'react';
import { Card, CardContent, Typography, Box, Stack, Chip } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ErrorOutlinedIcon from '@mui/icons-material/ErrorOutlined';

const StatCard = ({ title, value, subtitle, change, trend = 'up', icon, color = 'primary' }) => {
  const getColors = () => {
    switch (color) {
      case 'success':
      case 'emerald':
        return {
          bg: '#ecfdf5',
          iconColor: '#059669',
          borderColor: '#d1fae5',
        };
      case 'primary':
      case 'blue':
        return {
          bg: '#eff6ff',
          iconColor: '#2563eb',
          borderColor: '#dbeafe',
        };
      case 'warning':
      case 'orange':
        return {
          bg: '#fffbeb',
          iconColor: '#d97706',
          borderColor: '#fef3c7',
        };
      case 'error':
      case 'red':
        return {
          bg: '#fef2f2',
          iconColor: '#dc2626',
          borderColor: '#fee2e2',
        };
      default:
        return {
          bg: '#f8fafc',
          iconColor: '#475569',
          borderColor: '#e2e8f0',
        };
    }
  };

  const scheme = getColors();

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        borderRadius: 3.5,
        border: '1px solid #e2e8f0',
        boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
        },
      }}
    >
      <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600, fontSize: '0.85rem' }}>
            {title}
          </Typography>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: scheme.bg,
              color: scheme.iconColor,
              border: `1px solid ${scheme.borderColor}`,
            }}
          >
            {icon}
          </Box>
        </Stack>

        <Typography variant="h4" sx={{ fontWeight: 700, color: '#0f172a', mb: 1, letterSpacing: '-0.5px' }}>
          {value}
        </Typography>

        <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
          {change && (
            <Chip
              size="small"
              icon={
                trend === 'up' ? (
                  <TrendingUpIcon sx={{ fontSize: '14px !important', color: '#059669 !important' }} />
                ) : trend === 'down' ? (
                  <TrendingDownIcon sx={{ fontSize: '14px !important', color: '#dc2626 !important' }} />
                ) : undefined
              }
              label={change}
              sx={{
                height: 24,
                fontSize: '0.75rem',
                fontWeight: 600,
                backgroundColor: trend === 'up' ? '#ecfdf5' : '#fee2e2',
                color: trend === 'up' ? '#065f46' : '#991b1b',
                border: `1px solid ${trend === 'up' ? '#a7f3d0' : '#fecaca'}`,
              }}
            />
          )}

          {subtitle && (
            <Stack direction="row" alignItems="center" spacing={0.5}>
              {trend === 'warning' && <WarningAmberIcon sx={{ fontSize: 16, color: '#d97706' }} />}
              {trend === 'danger' && <ErrorOutlinedIcon sx={{ fontSize: 16, color: '#dc2626' }} />}
              <Typography
                variant="caption"
                sx={{
                  color: trend === 'warning' ? '#d97706' : trend === 'danger' ? '#dc2626' : '#64748b',
                  fontWeight: 500,
                }}
              >
                {subtitle}
              </Typography>
            </Stack>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default StatCard;
