import React from 'react';
import { Card, CardContent, Typography, Stack, Button, Box } from '@mui/material';
import AddCircleOutlinedIcon from '@mui/icons-material/AddCircleOutlined';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import ShoppingCartCheckoutIcon from '@mui/icons-material/ShoppingCartCheckout';
import MicIcon from '@mui/icons-material/Mic';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import BarChartIcon from '@mui/icons-material/BarChart';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useSimpleMode } from '../context/SimpleModeContext';

const QuickActions = ({ onVoiceClick, onScanClick }) => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { simpleMode } = useSimpleMode();

  return (
    <Card
      sx={{
        borderRadius: 3.5,
        border: '1px solid #e2e8f0',
        backgroundColor: '#ffffff',
        mb: 3.5,
        boxShadow: '0 2px 12px rgba(0,0,0,0.03)',
      }}
    >
      <CardContent sx={{ p: { xs: 2, sm: 2.5 }, '&:last-child': { pb: { xs: 2, sm: 2.5 } } }}>
        <Typography
          variant="caption"
          sx={{
            display: 'block',
            fontWeight: 700,
            color: '#64748b',
            letterSpacing: '0.6px',
            textTransform: 'uppercase',
            mb: 1.5,
            fontSize: simpleMode ? '0.85rem' : '0.72rem',
          }}
        >
          {t('quickActions.title')}
        </Typography>

        <Stack
          direction="row"
          spacing={1.5}
          flexWrap="wrap"
          useFlexGap
          alignItems="center"
        >
          <Button
            variant="contained"
            color="primary"
            startIcon={<CameraAltIcon />}
            onClick={onScanClick}
            sx={{
              py: simpleMode ? 1.5 : 1,
              px: simpleMode ? 2.5 : 2,
              fontSize: simpleMode ? '1rem' : '0.88rem',
              fontWeight: 800,
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)',
              '&:hover': {
                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
              },
            }}
          >
            📷 Scan Stock
          </Button>

          <Button
            variant="outlined"
            color="primary"
            startIcon={<AddCircleOutlinedIcon />}
            onClick={() => navigate('/products', { state: { openAddModal: true } })}
            sx={{
              py: simpleMode ? 1.5 : 1,
              px: simpleMode ? 2.5 : 2,
              fontSize: simpleMode ? '1rem' : '0.88rem',
              fontWeight: 700,
            }}
          >
            {t('quickActions.addItem')}
          </Button>

          <Button
            variant="contained"
            color="secondary"
            startIcon={<PointOfSaleIcon />}
            onClick={() => navigate('/sales', { state: { openNewSale: true } })}
            sx={{
              py: simpleMode ? 1.5 : 1,
              px: simpleMode ? 2.5 : 2,
              fontSize: simpleMode ? '1rem' : '0.88rem',
              fontWeight: 700,
            }}
          >
            {t('quickActions.recordSale')}
          </Button>

          <Button
            variant="outlined"
            startIcon={<ShoppingCartCheckoutIcon />}
            onClick={() => navigate('/purchases', { state: { openNewPurchase: true } })}
            sx={{
              py: simpleMode ? 1.5 : 1,
              px: simpleMode ? 2.5 : 2,
              fontSize: simpleMode ? '1rem' : '0.88rem',
              fontWeight: 700,
              color: '#0f172a',
              borderColor: '#cbd5e1',
              backgroundColor: '#f8fafc',
              '&:hover': {
                backgroundColor: '#f1f5f9',
                borderColor: '#94a3b8',
              },
            }}
          >
            {t('quickActions.recordPurchase')}
          </Button>

          {onVoiceClick && (
            <Button
              variant="outlined"
              color="error"
              startIcon={<MicIcon />}
              onClick={onVoiceClick}
              sx={{
                py: simpleMode ? 1.5 : 1,
                px: simpleMode ? 2.5 : 2,
                fontSize: simpleMode ? '1rem' : '0.88rem',
                fontWeight: 700,
                backgroundColor: '#fef2f2',
                borderColor: '#fca5a5',
                color: '#dc2626',
                '&:hover': {
                  backgroundColor: '#fee2e2',
                  borderColor: '#ef4444',
                },
              }}
            >
              {t('quickActions.speak')}
            </Button>
          )}

          <Button
            variant="text"
            startIcon={<BarChartIcon />}
            onClick={() => navigate('/reports')}
            sx={{
              py: simpleMode ? 1.5 : 1,
              px: 2,
              fontSize: simpleMode ? '0.95rem' : '0.85rem',
              fontWeight: 600,
              color: '#475569',
            }}
          >
            {t('quickActions.viewReports')}
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default QuickActions;
