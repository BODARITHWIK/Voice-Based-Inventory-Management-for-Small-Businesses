import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Typography,
  Box,
  Stack,
} from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import TuneIcon from '@mui/icons-material/Tune';
import { useLanguage } from '../context/LanguageContext';
import { getLocalizedProduct, getLocalizedDateString } from '../utils/productLocalization';

const TransactionTable = ({ transactions = [] }) => {
  const { t, selectedLanguage } = useLanguage();
  const getTypeBadge = (type) => {
    switch (type) {
      case 'Sale':
        return (
          <Chip
            size="small"
            icon={<ArrowUpwardIcon sx={{ fontSize: '13px !important' }} />}
            label={t('nav.sales') || 'Sale'}
            sx={{
              backgroundColor: '#ecfdf5',
              color: '#065f46',
              fontWeight: 600,
              fontSize: '0.75rem',
              border: '1px solid #a7f3d0',
            }}
          />
        );
      case 'Purchase':
        return (
          <Chip
            size="small"
            icon={<ArrowDownwardIcon sx={{ fontSize: '13px !important' }} />}
            label={t('nav.purchases') || 'Purchase'}
            sx={{
              backgroundColor: '#eff6ff',
              color: '#1d4ed8',
              fontWeight: 600,
              fontSize: '0.75rem',
              border: '1px solid #bfdbfe',
            }}
          />
        );
      case 'Adjustment':
        return (
          <Chip
            size="small"
            icon={<TuneIcon sx={{ fontSize: '13px !important' }} />}
            label={t('common.actions') || 'Adjustment'}
            sx={{
              backgroundColor: '#fffbeb',
              color: '#b45309',
              fontWeight: 600,
              fontSize: '0.75rem',
              border: '1px solid #fde68a',
            }}
          />
        );
      default:
        return <Chip size="small" label={type} />;
    }
  };

  return (
    <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 3 }}>
      <Table sx={{ minWidth: 650 }}>
        <TableHead>
          <TableRow sx={{ backgroundColor: '#f8fafc' }}>
            <TableCell sx={{ fontWeight: 600, color: '#475569' }}>{t('sales.invoice') || 'Txn ID'}</TableCell>
            <TableCell sx={{ fontWeight: 600, color: '#475569' }}>{t('products.item') || 'Product'}</TableCell>
            <TableCell sx={{ fontWeight: 600, color: '#475569' }}>{t('confirm.action') || 'Type'}</TableCell>
            <TableCell sx={{ fontWeight: 600, color: '#475569' }}>{t('confirm.quantity') || 'Quantity'}</TableCell>
            <TableCell sx={{ fontWeight: 600, color: '#475569' }}>{t('confirm.amount') || 'Amount'}</TableCell>
            <TableCell sx={{ fontWeight: 600, color: '#475569' }}>{t('sales.date') || 'Date'}</TableCell>
            <TableCell sx={{ fontWeight: 600, color: '#475569' }}>{t('common.status') || 'Status'}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {transactions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                <Typography variant="body2" sx={{ color: '#64748b' }}>
                  {t('dashboard.recentActivitySub') || 'No recent transactions recorded.'}
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            transactions.map((row) => (
              <TableRow
                key={row.id}
                hover
                sx={{
                  '&:last-child td, &:last-child th': { border: 0 },
                  transition: 'background-color 0.15s ease',
                }}
              >
                <TableCell sx={{ fontWeight: 600, color: '#2563eb' }}>
                  {row.id}
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#0f172a' }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a' }}>
                    {getLocalizedProduct(row.product, selectedLanguage)}
                  </Typography>
                  {selectedLanguage !== 'en' && row.product && getLocalizedProduct(row.product, selectedLanguage) !== row.product && (
                    <Typography variant="caption" sx={{ color: '#64748b', display: 'block', fontSize: '0.72rem' }}>
                      {row.product}
                    </Typography>
                  )}
                </TableCell>
                <TableCell>{getTypeBadge(row.type)}</TableCell>
                <TableCell>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      color: (Number(row.quantity) < 0 || String(row.quantity || '').startsWith('-')) ? '#dc2626' : '#059669',
                    }}
                  >
                    {row.quantity}
                  </Typography>
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#0f172a' }}>
                  {row.amount}
                </TableCell>
                <TableCell sx={{ color: '#64748b' }}>
                  {getLocalizedDateString(row.date, selectedLanguage)}
                </TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={row.status === 'Completed' ? (t('sales.completed') || row.status) : row.status}
                    sx={{
                      backgroundColor: row.status === 'Completed' ? '#f0fdf4' : '#f8fafc',
                      color: row.status === 'Completed' ? '#166534' : '#475569',
                      border: '1px solid #dcfce7',
                      fontSize: '0.75rem',
                      fontWeight: 500,
                    }}
                  />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default TransactionTable;
