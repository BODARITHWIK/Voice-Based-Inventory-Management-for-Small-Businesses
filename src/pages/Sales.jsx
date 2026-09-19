import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Grid,
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
  MenuItem,
  Typography,
  Stack,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import PrintIcon from '@mui/icons-material/Print';
import VisibilityIcon from '@mui/icons-material/Visibility';
import StorefrontIcon from '@mui/icons-material/Storefront';
import { useLocation } from 'react-router-dom';

import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import VoiceButton from '../components/VoiceButton';
import { getSales, createSale, getProducts, getCustomers } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { useSimpleMode } from '../context/SimpleModeContext';
import { useAuth } from '../context/AuthContext';

const paymentMethods = [
  { value: 'UPI', label: 'UPI (PhonePe / GPay / Paytm)' },
  { value: 'CASH', label: 'Cash (నగదు / नकद)' },
  { value: 'CARD', label: 'Card' },
  { value: 'CREDIT', label: 'Credit (Khata / ఖాతా / उधार)' },
];

const initialSaleForm = {
  customerName: '',
  customerId: null,
  products: '',
  productId: null,
  quantity: 1,
  unitPrice: '',
  amount: '',
  paymentMethod: 'UPI',
  status: 'Completed',
};

const Sales = ({ showToast, onTriggerVoiceConfirm }) => {
  const location = useLocation();
  const { t } = useLanguage();
  const { simpleMode } = useSimpleMode();
  const { user } = useAuth();

  const [sales, setSales] = useState([]);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [availableCustomers, setAvailableCustomers] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [formData, setFormData] = useState(initialSaleForm);

  // Invoice Print / View Modal State
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [activeInvoice, setActiveInvoice] = useState(null);

  useEffect(() => {
    loadSales();
    loadLookups();
    if (location.state?.openNewSale) {
      handleOpenNewSale();
    }
  }, [location.state]);

  const loadSales = async () => {
    try {
      const data = await getSales();
      setSales(Array.isArray(data) ? data : []);
    } catch (err) {
      showToast?.(t('toast.errorGeneric'), 'error');
    }
  };

  const loadLookups = async () => {
    try {
      const [prods, custs] = await Promise.all([getProducts(), getCustomers()]);
      setAvailableProducts(Array.isArray(prods) ? prods : []);
      setAvailableCustomers(Array.isArray(custs) ? custs : []);
    } catch (e) {
      console.warn('Could not load products or customers:', e);
    }
  };

  const handleOpenNewSale = () => {
    setFormData(initialSaleForm);
    setOpenModal(true);
  };

  const handleSelectProduct = (e) => {
    const selectedId = e.target.value;
    const prod = availableProducts.find((p) => String(p.id) === String(selectedId));
    if (prod) {
      const unitP = prod.sellingPrice || 50;
      const qty = formData.quantity || 1;
      setFormData((prev) => ({
        ...prev,
        productId: prod.id,
        products: prod.name,
        unitPrice: unitP,
        amount: Number(unitP) * Number(qty),
      }));
    }
  };

  const handleQuantityChange = (qtyVal) => {
    const qty = Math.max(1, Number(qtyVal) || 1);
    const unitP = Number(formData.unitPrice) || 50;
    setFormData((prev) => ({
      ...prev,
      quantity: qty,
      amount: unitP * qty,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.products || !formData.amount) {
      showToast?.('Please specify items sold and amount.', 'warning');
      return;
    }

    try {
      const salePayload = {
        ...formData,
        customerName: formData.customerName || 'Walk-in Customer',
        items: formData.productId
          ? [
              {
                productId: formData.productId,
                productName: formData.products,
                quantity: Number(formData.quantity || 1),
                unitPrice: Number(formData.unitPrice || formData.amount),
              },
            ]
          : [],
      };

      await createSale(salePayload);

      if (formData.paymentMethod === 'CREDIT' || formData.paymentMethod === 'Credit') {
        showToast?.(`✅ Credit sale recorded! Added to ${formData.customerName || 'Customer'}'s Khata.`, 'info');
      } else {
        showToast?.(t('toast.saleCompleted'), 'success');
      }

      setOpenModal(false);
      loadSales();
    } catch (err) {
      showToast?.(t('toast.errorGeneric'), 'error');
    }
  };

  const handlePrintInvoice = (invoice) => {
    setActiveInvoice(invoice);
    setInvoiceModalOpen(true);
  };

  const triggerBrowserPrint = () => {
    window.print();
  };

  const getPaymentBadge = (method) => {
    const m = (method || '').toUpperCase();
    switch (m) {
      case 'UPI':
        return <Chip size="small" label="UPI" sx={{ backgroundColor: '#ecfdf5', color: '#065f46', fontWeight: 700, border: '1px solid #a7f3d0' }} />;
      case 'CASH':
        return <Chip size="small" label={t('sales.cash')} sx={{ backgroundColor: '#eff6ff', color: '#1d4ed8', fontWeight: 700, border: '1px solid #bfdbfe' }} />;
      case 'CARD':
        return <Chip size="small" label="Card" sx={{ backgroundColor: '#f5f3ff', color: '#6d28d9', fontWeight: 700, border: '1px solid #ddd6fe' }} />;
      case 'CREDIT':
        return <Chip size="small" label="Khata / Credit" sx={{ backgroundColor: '#fff1f2', color: '#be123c', fontWeight: 700, border: '1px solid #fecdd3' }} />;
      default:
        return <Chip size="small" label={method || 'Cash'} />;
    }
  };

  return (
    <Box>
      <PageHeader
        title={t('sales.title')}
        subtitle={t('sales.subtitle')}
        action={
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleOpenNewSale}
            sx={{
              py: simpleMode ? 1.4 : 1,
              px: simpleMode ? 2.5 : 2,
              fontSize: simpleMode ? '1rem' : '0.88rem',
              fontWeight: 700,
            }}
          >
            {t('sales.newSaleBtn')}
          </Button>
        }
      />

      {/* 4 Summary Stats */}
      <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title={t('sales.todayTotal')}
            value="₹8,450"
            change="+12% today"
            trend="up"
            icon={<CurrencyRupeeIcon />}
            color="emerald"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title={t('sales.billsCount')}
            value={sales.length > 0 ? `${sales.length} Bills` : '28 Bills'}
            subtitle={t('sales.completed')}
            trend="up"
            icon={<ReceiptLongIcon />}
            color="blue"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="UPI / Digital"
            value="₹5,200"
            subtitle="PhonePe / GPay"
            trend="up"
            icon={<ShoppingBagIcon />}
            color="purple"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Khata / Credit"
            value="₹1,250"
            subtitle="Added to ledger"
            trend="warning"
            icon={<CreditCardIcon />}
            color="warning"
          />
        </Grid>
      </Grid>

      {/* Sales Table */}
      <Card sx={{ borderRadius: 3.5, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <TableContainer component={Paper} elevation={0}>
          <Table sx={{ minWidth: 700 }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f8fafc' }}>
                <TableCell sx={{ fontWeight: 700, color: '#475569' }}>{t('sales.invoice')}</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569' }}>{t('sales.customer')}</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569' }}>{t('sales.itemsSold')}</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569' }} align="right">{t('sales.amount')}</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569' }}>{t('sales.payment')}</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569' }}>{t('sales.status')}</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569' }}>{t('sales.date')}</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569' }} align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sales.map((row) => (
                <TableRow key={row.id || row.invoiceNumber} hover>
                  <TableCell sx={{ fontWeight: 800, color: '#2563eb' }}>
                    {row.invoiceNumber || row.id}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a' }}>
                      {row.customerName || 'Walk-in Customer'}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ color: '#334155' }}>
                    {row.items?.length > 0
                      ? row.items.map((i) => `${i.productName} (${i.quantity} ${i.unit || ''})`).join(', ')
                      : row.products || 'Retail Grocery'}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 800, color: '#059669', fontSize: '0.95rem' }}>
                    ₹{row.total || row.amount}
                  </TableCell>
                  <TableCell>{getPaymentBadge(row.paymentMethod)}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label="Completed"
                      sx={{
                        backgroundColor: '#f0fdf4',
                        color: '#166534',
                        border: '1px solid #bbf7d0',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ color: '#64748b', fontSize: '0.85rem' }}>
                    {row.createdAt ? new Date(row.createdAt).toLocaleDateString() : (row.date || 'Today')}
                  </TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={0.5} justifyContent="center">
                      <Tooltip title="Print Retail Bill">
                        <IconButton size="small" onClick={() => handlePrintInvoice(row)}>
                          <PrintIcon fontSize="small" sx={{ color: '#059669' }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="View Details">
                        <IconButton size="small" onClick={() => handlePrintInvoice(row)}>
                          <VisibilityIcon fontSize="small" sx={{ color: '#2563eb' }} />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* New Sale Dialog */}
      <Dialog
        open={openModal}
        onClose={() => setOpenModal(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3.5, p: 1 } }}
      >
        <DialogTitle sx={{ pb: 1, pt: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            {t('sales.recordSaleTitle')}
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748b' }}>
            Record product sales, reduce stock automatically, and manage customer Udhaar.
          </Typography>
        </DialogTitle>
        <Divider />

        <form onSubmit={handleSubmit}>
          <DialogContent sx={{ py: 3 }}>
            <Grid container spacing={2}>
              {/* Select Existing Product */}
              <Grid item xs={12} sm={8}>
                <TextField
                  select
                  label="Select Product from Stock"
                  fullWidth
                  value={formData.productId || ''}
                  onChange={handleSelectProduct}
                  helperText="Or type custom product below"
                >
                  <MenuItem value="">-- Select Product --</MenuItem>
                  {availableProducts.map((p) => (
                    <MenuItem key={p.id} value={p.id}>
                      {p.name} (Stock: {p.quantity || p.stock} {p.unit}) — ₹{p.sellingPrice}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  label="Quantity *"
                  type="number"
                  required
                  fullWidth
                  value={formData.quantity}
                  onChange={(e) => handleQuantityChange(e.target.value)}
                  inputProps={{ min: 1 }}
                />
              </Grid>

              <Grid item xs={12} sm={8}>
                <TextField
                  label={t('sales.itemsSold')}
                  required
                  fullWidth
                  placeholder="e.g. Maggi 2-Minute Noodles"
                  value={formData.products}
                  onChange={(e) => setFormData({ ...formData, products: e.target.value })}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  label={`${t('sales.amount')} (₹) *`}
                  type="number"
                  required
                  fullWidth
                  placeholder="150"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label={t('sales.customer')}
                  fullWidth
                  placeholder="Walk-in Customer or Ramesh"
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  label={t('sales.paymentMethod')}
                  fullWidth
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                >
                  {paymentMethods.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>

            {formData.paymentMethod === 'CREDIT' && (
              <Box sx={{ mt: 2, p: 1.5, bgcolor: '#fff1f2', borderRadius: 2, border: '1px solid #fecdd3' }}>
                <Typography variant="caption" sx={{ color: '#be123c', fontWeight: 700 }}>
                  ℹ️ This ₹{formData.amount || 0} will be automatically added to {formData.customerName || 'Customer'}'s Khata ledger.
                </Typography>
              </Box>
            )}
          </DialogContent>

          <Divider />
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={() => setOpenModal(false)} sx={{ color: '#64748b' }}>
              {t('confirm.cancel')}
            </Button>
            <Button type="submit" variant="contained" color="primary" sx={{ fontWeight: 700 }}>
              {t('sales.completeSaleBtn')}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Printable Invoice / Receipt Modal */}
      <Dialog
        open={invoiceModalOpen}
        onClose={() => setInvoiceModalOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, p: 2 } }}
      >
        <DialogContent sx={{ p: 2 }}>
          <Box id="printable-invoice" sx={{ p: 2, border: '1px dashed #cbd5e1', borderRadius: 2 }}>
            {/* Store Header */}
            <Stack alignItems="center" spacing={0.5} mb={2}>
              <StorefrontIcon sx={{ fontSize: 32, color: '#059669' }} />
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>
                {user?.businessName || 'Swaranidhi Kirana & General Store'}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b' }}>
                Main Mandi Road, Vijayawada | Ph: 9876543210
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b' }}>
                GSTIN: 37AAAAA0000A1Z5
              </Typography>
            </Stack>

            <Divider sx={{ my: 1.5 }} />

            {/* Bill Details */}
            <Grid container spacing={1} sx={{ mb: 2 }}>
              <Grid item xs={6}>
                <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>
                  Invoice No: <strong>{activeInvoice?.invoiceNumber || activeInvoice?.id}</strong>
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>
                  Date: {activeInvoice?.createdAt ? new Date(activeInvoice.createdAt).toLocaleString() : (activeInvoice?.date || 'Today')}
                </Typography>
              </Grid>
              <Grid item xs={6} textAlign="right">
                <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>
                  Customer: <strong>{activeInvoice?.customerName || 'Walk-in'}</strong>
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>
                  Payment: <strong>{activeInvoice?.paymentMethod}</strong>
                </Typography>
              </Grid>
            </Grid>

            {/* Items Table */}
            <Table size="small" sx={{ mb: 2 }}>
              <TableHead sx={{ bgcolor: '#f8fafc' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Item</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>Qty</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>Total (₹)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {activeInvoice?.items?.length > 0 ? (
                  activeInvoice.items.map((it, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{it.productName}</TableCell>
                      <TableCell align="center">{it.quantity} {it.unit || ''}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>₹{it.totalPrice || it.unitPrice * it.quantity}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell>{activeInvoice?.products || 'Retail Item'}</TableCell>
                    <TableCell align="center">{activeInvoice?.quantity || 1} units</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>₹{activeInvoice?.total || activeInvoice?.amount}</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            <Divider sx={{ my: 1 }} />

            {/* Total */}
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ py: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a' }}>
                Grand Total:
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#059669' }}>
                ₹{activeInvoice?.total || activeInvoice?.amount}
              </Typography>
            </Stack>

            <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', color: '#94a3b8', mt: 2 }}>
              🙏 Thank you for your visit! / మళ్లీ రండి / फिर पधारें!
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setInvoiceModalOpen(false)} sx={{ color: '#64748b' }}>
            Close
          </Button>
          <Button
            variant="contained"
            startIcon={<PrintIcon />}
            onClick={triggerBrowserPrint}
            sx={{ bgcolor: '#059669', fontWeight: 700, '&:hover': { bgcolor: '#047857' } }}
          >
            Print Receipt
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Sales;
