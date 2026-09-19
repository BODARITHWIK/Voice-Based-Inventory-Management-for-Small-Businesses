import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Typography,
  Stack,
  Divider,
  IconButton,
  Tooltip,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PhoneIcon from '@mui/icons-material/Phone';
import PaymentIcon from '@mui/icons-material/Payment';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';

import PageHeader from '../components/PageHeader';
import {
  getCustomers,
  createCustomer,
  getCustomerKhata,
  recordCustomerPayment,
} from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { useSimpleMode } from '../context/SimpleModeContext';

const initialCustomerForm = {
  name: '',
  phone: '',
  email: '',
  creditAmount: '0',
  status: 'Regular',
};

const Customers = ({ showToast }) => {
  const { t } = useLanguage();
  const { simpleMode } = useSimpleMode();

  const [customers, setCustomers] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [formData, setFormData] = useState(initialCustomerForm);

  // Payment Recording State
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [submittingPayment, setSubmittingPayment] = useState(false);

  // Khata Ledger State
  const [khataModalOpen, setKhataModalOpen] = useState(false);
  const [khataLedger, setKhataLedger] = useState(null);
  const [loadingKhata, setLoadingKhata] = useState(false);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      const data = await getCustomers();
      setCustomers(data);
    } catch (err) {
      showToast?.(t('toast.errorGeneric'), 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      showToast?.('Please enter customer name and phone number.', 'warning');
      return;
    }

    try {
      await createCustomer({
        ...formData,
        creditAmount: formData.creditAmount ? `₹${formData.creditAmount}` : '₹0',
      });
      showToast?.(`Customer ${formData.name} added to Khata.`, 'success');
      setOpenModal(false);
      setFormData(initialCustomerForm);
      loadCustomers();
    } catch (err) {
      showToast?.(t('toast.errorGeneric'), 'error');
    }
  };

  const handleOpenPayment = (customer) => {
    setSelectedCustomer(customer);
    const balanceNum = String(customer.creditAmount || '0').replace(/[^0-9.]/g, '');
    setPaymentAmount(balanceNum > 0 ? balanceNum : '');
    setPaymentMethod('UPI');
    setPaymentNotes('');
    setPaymentModalOpen(true);
  };

  const handleSubmitPayment = async (e) => {
    e.preventDefault();
    if (!paymentAmount || Number(paymentAmount) <= 0) {
      showToast?.('Please enter a valid payment amount.', 'warning');
      return;
    }

    try {
      setSubmittingPayment(true);
      await recordCustomerPayment(selectedCustomer.id, {
        amount: Number(paymentAmount),
        paymentMethod: paymentMethod,
        notes: paymentNotes || 'Udhaar clearance',
      });
      showToast?.(`✅ Payment of ₹${paymentAmount} recorded for ${selectedCustomer.name}!`, 'success');
      setPaymentModalOpen(false);
      setSelectedCustomer(null);
      loadCustomers();
    } catch (err) {
      showToast?.('Payment could not be recorded. Please try again.', 'error');
    } finally {
      setSubmittingPayment(false);
    }
  };

  const handleOpenKhata = async (customer) => {
    setSelectedCustomer(customer);
    setKhataModalOpen(true);
    setLoadingKhata(true);
    try {
      const data = await getCustomerKhata(customer.id);
      setKhataLedger(data);
    } catch (err) {
      setKhataLedger(null);
    } finally {
      setLoadingKhata(false);
    }
  };

  return (
    <Box>
      <PageHeader
        title={t('customers.title')}
        subtitle={t('customers.subtitle')}
        action={
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => setOpenModal(true)}
            sx={{
              py: simpleMode ? 1.4 : 1,
              px: simpleMode ? 2.5 : 2,
              fontSize: simpleMode ? '1rem' : '0.88rem',
              fontWeight: 700,
            }}
          >
            {t('customers.addCustomerBtn')}
          </Button>
        }
      />

      <Card sx={{ borderRadius: 3.5, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <TableContainer component={Paper} elevation={0}>
          <Table sx={{ minWidth: 700 }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f8fafc' }}>
                <TableCell sx={{ fontWeight: 700, color: '#475569' }}>{t('customers.customerName')}</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569' }}>{t('customers.phone')}</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569' }}>{t('customers.totalBought')}</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569' }}>{t('customers.khataBalance')}</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569' }}>{t('customers.lastVisit')}</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569' }}>{t('products.status')}</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569' }} align="center">{t('products.actions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {customers.map((row) => {
                const hasCredit = row.creditAmount && row.creditAmount !== '₹0' && row.creditAmount !== '₹0.00';
                return (
                  <TableRow key={row.id} hover>
                    <TableCell sx={{ fontWeight: 800, color: '#0f172a' }}>
                      {row.name}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#475569' }}>
                        <PhoneIcon sx={{ fontSize: 14, color: '#64748b' }} /> {row.phone}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#0f172a' }}>
                      {row.totalPurchases}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 800, color: hasCredit ? '#dc2626' : '#059669', fontSize: '0.95rem' }}>
                      {row.creditAmount}
                    </TableCell>
                    <TableCell sx={{ color: '#64748b' }}>
                      {row.lastPurchase}
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={hasCredit ? 'Udhaar / Credit' : 'All Clear'}
                        sx={{
                          backgroundColor: hasCredit ? '#fffbeb' : '#f0fdf4',
                          color: hasCredit ? '#92400e' : '#166534',
                          border: `1px solid ${hasCredit ? '#fde68a' : '#bbf7d0'}`,
                          fontSize: '0.75rem',
                          fontWeight: 700,
                        }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={1} justifyContent="center">
                        <Tooltip title={t('customers.recordPayment')}>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<PaymentIcon fontSize="small" />}
                            onClick={() => handleOpenPayment(row)}
                            sx={{
                              color: '#059669',
                              borderColor: '#a7f3d0',
                              bgcolor: '#ecfdf5',
                              fontWeight: 700,
                              textTransform: 'none',
                              fontSize: '0.75rem',
                              '&:hover': { bgcolor: '#d1fae5', borderColor: '#059669' },
                            }}
                          >
                            Pay
                          </Button>
                        </Tooltip>
                        <Tooltip title={t('customers.viewKhata')}>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<AccountBalanceWalletIcon fontSize="small" />}
                            onClick={() => handleOpenKhata(row)}
                            sx={{
                              color: '#2563eb',
                              borderColor: '#bfdbfe',
                              bgcolor: '#eff6ff',
                              fontWeight: 700,
                              textTransform: 'none',
                              fontSize: '0.75rem',
                              '&:hover': { bgcolor: '#dbeafe', borderColor: '#2563eb' },
                            }}
                          >
                            Khata
                          </Button>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Record Payment Dialog */}
      <Dialog
        open={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3.5, p: 1 } }}
      >
        <DialogTitle sx={{ pb: 1, pt: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>
            💰 Record Khata Payment
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748b' }}>
            Customer: <strong>{selectedCustomer?.name}</strong> (Pending: {selectedCustomer?.creditAmount})
          </Typography>
        </DialogTitle>
        <Divider />
        <form onSubmit={handleSubmitPayment}>
          <DialogContent sx={{ py: 2.5 }}>
            <Stack spacing={2}>
              <TextField
                label="Payment Amount (₹) *"
                type="number"
                required
                fullWidth
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <CurrencyRupeeIcon sx={{ color: '#059669', fontSize: 20, mr: 0.5 }} />
                  ),
                }}
              />

              <TextField
                select
                label="Payment Method *"
                fullWidth
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <MenuItem value="UPI">UPI (Google Pay / PhonePe / Paytm)</MenuItem>
                <MenuItem value="CASH">Cash (నగదు / नकद)</MenuItem>
                <MenuItem value="CARD">Debit / Credit Card</MenuItem>
              </TextField>

              <TextField
                label="Notes (Optional)"
                fullWidth
                placeholder="e.g. Cleared full pending balance"
                value={paymentNotes}
                onChange={(e) => setPaymentNotes(e.target.value)}
              />
            </Stack>
          </DialogContent>
          <Divider />
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={() => setPaymentModalOpen(false)} sx={{ color: '#64748b' }}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={submittingPayment}
              sx={{ bgcolor: '#059669', fontWeight: 700, '&:hover': { bgcolor: '#047857' } }}
            >
              {submittingPayment ? <CircularProgress size={20} color="inherit" /> : 'Confirm Payment'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* View Khata Ledger Modal */}
      <Dialog
        open={khataModalOpen}
        onClose={() => setKhataModalOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3.5, p: 1 } }}
      >
        <DialogTitle sx={{ pb: 1, pt: 2 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>
                📖 Khata Ledger — {selectedCustomer?.name}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b' }}>
                Phone: {selectedCustomer?.phone} | Account Status: Active
              </Typography>
            </Box>
            <Chip
              label={`Current Udhaar: ${selectedCustomer?.creditAmount || '₹0'}`}
              sx={{
                bgcolor: '#fee2e2',
                color: '#b91c1c',
                fontWeight: 800,
                fontSize: '0.85rem',
              }}
            />
          </Stack>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ py: 2.5 }}>
          {loadingKhata ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress sx={{ color: '#059669' }} />
            </Box>
          ) : (
            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2 }}>
              <Table size="small">
                <TableHead sx={{ bgcolor: '#f8fafc' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Transaction Type</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Reference</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Description</TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="right">Amount (₹)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {khataLedger?.entries?.length > 0 ? (
                    khataLedger.entries.map((entry, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{entry.date}</TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={entry.type === 'CREDIT_SALE' ? 'Credit Sale' : 'Payment Received'}
                            sx={{
                              bgcolor: entry.type === 'CREDIT_SALE' ? '#fff1f2' : '#f0fdf4',
                              color: entry.type === 'CREDIT_SALE' ? '#e11d48' : '#15803d',
                              fontWeight: 700,
                              fontSize: '0.7rem',
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>{entry.reference || '-'}</TableCell>
                        <TableCell>{entry.description || 'Retail purchase'}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 800, color: entry.type === 'CREDIT_SALE' ? '#e11d48' : '#15803d' }}>
                          {entry.type === 'CREDIT_SALE' ? `+₹${entry.amount}` : `-₹${entry.amount}`}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 3, color: '#64748b' }}>
                        No past credit history recorded yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <Divider />
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setKhataModalOpen(false)} sx={{ color: '#64748b' }}>
            Close
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              setKhataModalOpen(false);
              handleOpenPayment(selectedCustomer);
            }}
            sx={{ bgcolor: '#059669', fontWeight: 700, '&:hover': { bgcolor: '#047857' } }}
          >
            Record Payment Now
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Customer Dialog */}
      <Dialog
        open={openModal}
        onClose={() => setOpenModal(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3.5, p: 1 } }}
      >
        <DialogTitle sx={{ pb: 1, pt: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            {t('customers.addCustomerBtn')}
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748b' }}>
            Add customer account and opening Khata credit balance.
          </Typography>
        </DialogTitle>
        <Divider />

        <form onSubmit={handleSubmit}>
          <DialogContent sx={{ py: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={7}>
                <TextField
                  label={t('customers.customerName')}
                  required
                  fullWidth
                  placeholder="e.g. Ramesh Sharma"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </Grid>

              <Grid item xs={12} sm={5}>
                <TextField
                  label={t('customers.phone')}
                  required
                  fullWidth
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </Grid>

              <Grid item xs={12} sm={7}>
                <TextField
                  label="Email (Optional)"
                  fullWidth
                  placeholder="customer@gmail.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </Grid>

              <Grid item xs={12} sm={5}>
                <TextField
                  label="Opening Udhaar / Khata (₹)"
                  type="number"
                  fullWidth
                  placeholder="0"
                  value={formData.creditAmount}
                  onChange={(e) => setFormData({ ...formData, creditAmount: e.target.value })}
                />
              </Grid>
            </Grid>
          </DialogContent>

          <Divider />
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={() => setOpenModal(false)} sx={{ color: '#64748b' }}>
              {t('confirm.cancel')}
            </Button>
            <Button type="submit" variant="contained" color="primary" sx={{ fontWeight: 700 }}>
              {t('products.saveBtn')}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default Customers;
