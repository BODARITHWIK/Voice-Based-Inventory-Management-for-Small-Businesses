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

const TransactionTable = ({ transactions = [] }) => {
  const getTypeBadge = (type) => {
    switch (type) {
      case 'Sale':
        return (
          <Chip
            size="small"
            icon={<ArrowUpwardIcon sx={{ fontSize: '13px !important' }} />}
            label="Sale"
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
            label="Purchase"
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
            label="Adjustment"
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
            <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Txn ID</TableCell>
            <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Product</TableCell>
            <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Type</TableCell>
            <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Quantity</TableCell>
            <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Amount</TableCell>
            <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Date</TableCell>
            <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {transactions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                <Typography variant="body2" sx={{ color: '#64748b' }}>
                  No recent transactions recorded.
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
                  {row.product}
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
                <TableCell sx={{ color: '#64748b' }}>{row.date}</TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={row.status}
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
