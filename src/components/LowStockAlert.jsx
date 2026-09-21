import React from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  Typography,
  Box,
  List,
  ListItem,
  Button,
  Chip,
  LinearProgress,
  Stack,
  Divider,
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ErrorOutlinedIcon from '@mui/icons-material/ErrorOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { getLocalizedProduct } from '../utils/productLocalization';

const LowStockAlert = ({ alerts = [], onRestockClick }) => {
  const navigate = useNavigate();
  const { t, selectedLanguage } = useLanguage();

  return (
    <Card
      sx={{
        borderRadius: 3.5,
        border: '1px solid #e2e8f0',
        boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <CardHeader
        avatar={
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 2,
              backgroundColor: '#fffbeb',
              color: '#d97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #fde68a',
            }}
          >
            <WarningAmberIcon fontSize="small" />
          </Box>
        }
        action={
          <Button
            size="small"
            endIcon={<ArrowForwardIcon sx={{ fontSize: 16 }} />}
            onClick={() => navigate('/products')}
            sx={{ color: '#059669', fontWeight: 600, fontSize: '0.8rem' }}
          >
            View All
          </Button>
        }
        title={
          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a' }}>
            {t('stats.runningLow')}
          </Typography>
        }
        subheader={
          <Typography variant="caption" sx={{ color: '#64748b' }}>
            {alerts.length} {t('stats.needsAttention')}
          </Typography>
        }
        sx={{ pb: 1 }}
      />
      <Divider />

      <CardContent sx={{ p: 0, flexGrow: 1, overflowY: 'auto' }}>
        {alerts.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: '#059669', fontWeight: 600 }}>
              All inventory levels are healthy!
            </Typography>
          </Box>
        ) : (
          <List disablePadding>
            {alerts.map((item, index) => {
              const isOutOfStock = item.urgency === 'out-of-stock';
              return (
                <React.Fragment key={item.id || index}>
                  <ListItem
                    sx={{
                      py: 1.75,
                      px: 2.5,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'stretch',
                      '&:hover': { backgroundColor: '#f8fafc' },
                    }}
                  >
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={0.5}>
                      <Box>
                        <Stack direction="row" spacing={1} alignItems="center">
                          {isOutOfStock ? (
                            <ErrorOutlinedIcon sx={{ fontSize: 16, color: '#dc2626' }} />
                          ) : (
                            <WarningAmberIcon sx={{ fontSize: 16, color: '#d97706' }} />
                          )}
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a' }}>
                              {getLocalizedProduct(item.product, selectedLanguage)}
                            </Typography>
                            {selectedLanguage !== 'en' && item.product && getLocalizedProduct(item.product, selectedLanguage) !== item.product && (
                              <Typography variant="caption" sx={{ color: '#64748b', display: 'block', fontSize: '0.7rem' }}>
                                {item.product}
                              </Typography>
                            )}
                          </Box>
                        </Stack>
                        <Typography variant="caption" sx={{ color: '#64748b', ml: 3 }}>
                          Threshold: {item.minStock}
                        </Typography>
                      </Box>

                      <Chip
                        size="small"
                        label={isOutOfStock ? 'Empty' : item.remaining}
                        sx={{
                          fontWeight: 700,
                          fontSize: '0.75rem',
                          backgroundColor: isOutOfStock ? '#fee2e2' : '#fef3c7',
                          color: isOutOfStock ? '#991b1b' : '#92400e',
                          border: `1px solid ${isOutOfStock ? '#fca5a5' : '#fde68a'}`,
                        }}
                      />
                    </Stack>

                    <Box sx={{ width: '100%', mt: 1 }}>
                      <LinearProgress
                        variant="determinate"
                        value={isOutOfStock ? 0 : 25}
                        sx={{
                          height: 6,
                          borderRadius: 3,
                          backgroundColor: '#f1f5f9',
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: isOutOfStock ? '#dc2626' : '#d97706',
                            borderRadius: 3,
                          },
                        }}
                      />
                    </Box>

                    {onRestockClick && (
                      <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                          size="small"
                          variant="text"
                          onClick={() => onRestockClick(item)}
                          sx={{ fontSize: '0.75rem', color: '#2563eb', p: 0 }}
                        >
                          + Quick Order
                        </Button>
                      </Box>
                    )}
                  </ListItem>
                  {index < alerts.length - 1 && <Divider component="li" />}
                </React.Fragment>
              );
            })}
          </List>
        )}
      </CardContent>
    </Card>
  );
};

export default LowStockAlert;
