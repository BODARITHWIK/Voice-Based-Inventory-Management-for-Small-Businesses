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
import {
  getLocalizedProduct,
  getLocalizedUnit,
  getLocalizedDateString,
  getLocalizedCustomerName,
} from '../utils/productLocalization';

const getPaymentMethods = (t) => [
  { value: 'UPI', label: 'UPI (PhonePe / GPay / Paytm)' },
  { value: 'CASH', label: t('sales.cash') },
  { value: 'CARD', label: t('sales.card') || 'Card' },
  { value: 'CREDIT', label: t('sales.credit') },
];

const defaultSaleItem = {
  productId: '',
  productName: '',
  quantity: 1,
  unitPrice: 0,
  unit: 'packets',
};

const initialSaleForm = {
  customerName: '',
  customerId: null,
  paymentMethod: 'UPI',
  status: 'Completed',
  discount: 0,
  tax: 0,
  items: [{ ...defaultSaleItem }],
};

const Sales = ({ showToast, onTriggerVoiceConfirm }) => {
  const location = useLocation();
  const { t, selectedLanguage } = useLanguage();
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
    setFormData({
      customerName: '',
      customerId: null,
      paymentMethod: 'UPI',
      status: 'Completed',
      discount: 0,
      tax: 0,
      items: [{ ...defaultSaleItem }],
    });
    setOpenModal(true);
  };

  const handleItemProductSelect = (index, prodId) => {
    const prod = availableProducts.find((p) => String(p.id) === String(prodId));
    setFormData((prev) => {
      const updated = [...prev.items];
      if (prod) {
        updated[index] = {
          ...updated[index],
          productId: prod.id,
          productName: prod.name,
          unitPrice: prod.sellingPrice || 0,
          unit: prod.unit || 'packets',
        };
      } else {
        updated[index] = {
          ...updated[index],
          productId: '',
        };
      }
      return { ...prev, items: updated };
    });
  };

  const handleItemFieldChange = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.items];
      updated[index] = {
        ...updated[index],
        [field]: value,
      };
      return { ...prev, items: updated };
    });
  };

  const handleAddItemRow = () => {
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, { ...defaultSaleItem }],
    }));
  };

  const handleRemoveItemRow = (index) => {
    if (formData.items.length <= 1) return;
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const calculateSubtotal = () => {
    return (formData.items || []).reduce(
      (sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0),
      0
    );
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const discount = Number(formData.discount) || 0;
    const tax = Number(formData.tax) || 0;
    return Math.max(0, subtotal - discount + tax);
  };

  const handleVoiceCommand = (parsed) => {
    if (parsed.intent === 'SALE' || parsed.product) {
      const prod = availableProducts.find(
        (p) => p.name.toLowerCase() === (parsed.product || '').toLowerCase()
      );
      const unitP = prod ? (prod.sellingPrice || 50) : 50;
      setFormData({
        customerName: parsed.customer || 'Walk-in Customer',
        customerId: null,
        paymentMethod: parsed.paymentMethod || 'CASH',
        status: 'Completed',
        discount: 0,
        tax: 0,
        items: [
          {
            productId: prod ? prod.id : '',
            productName: parsed.product || 'Retail Item',
            quantity: Number(parsed.quantity) || 1,
            unitPrice: unitP,
            unit: parsed.unit || prod?.unit || 'packets',
          },
        ],
      });
      setOpenModal(true);
      showToast?.(`Voice detected sale: ${parsed.product}. Review details.`, 'info');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validItems = (formData.items || []).filter(
      (it) => (it.productName && it.productName.trim()) || it.productId
    );

    if (validItems.length === 0) {
      showToast?.('Please specify at least one product item in the sale.', 'warning');
      return;
    }

    for (const it of validItems) {
      if (!it.quantity || Number(it.quantity) <= 0) {
        showToast?.(`Quantity for ${it.productName || 'item'} must be at least 1.`, 'warning');
        return;
      }
      if (Number(it.unitPrice) < 0) {
        showToast?.(`Unit price for ${it.productName || 'item'} cannot be negative.`, 'warning');
        return;
      }
    }

    const subtotal = calculateSubtotal();
    const discount = Number(formData.discount) || 0;
    const tax = Number(formData.tax) || 0;
    const totalAmount = Math.max(0, subtotal - discount + tax);

    try {
      const salePayload = {
        customerId: formData.customerId ? Number(formData.customerId) : null,
        customerName: formData.customerName?.trim() || 'Walk-in Customer',
        paymentMethod: formData.paymentMethod || 'UPI',
        discount,
        tax,
        amount: totalAmount,
        quantity: validItems.reduce((acc, it) => acc + (Number(it.quantity) || 1), 0),
        products: validItems.map((it) => `${it.productName} (${it.quantity})`).join(', '),
        items: validItems.map((it) => ({
          productId: it.productId ? Number(it.productId) : null,
          productName: it.productName,
          quantity: Number(it.quantity) || 1,
          unitPrice: Number(it.unitPrice) || 0,
          unit: it.unit || 'packets',
        })),
      };

      await createSale(salePayload);

      if (formData.paymentMethod === 'CREDIT' || formData.paymentMethod === 'Credit') {
        showToast?.(
          `✅ Credit sale recorded! ₹${totalAmount} added to ${salePayload.customerName}'s Khata.`,
          'info'
        );
      } else {
        showToast?.(t('toast.saleCompleted') || 'Sale completed successfully!', 'success');
      }

      setOpenModal(false);
      loadSales();
    } catch (err) {
      showToast?.(t('toast.errorGeneric') || 'Failed to record sale.', 'error');
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
        return <Chip size="small" label={t('sales.card') || 'Card'} sx={{ backgroundColor: '#f5f3ff', color: '#6d28d9', fontWeight: 700, border: '1px solid #ddd6fe' }} />;
      case 'CREDIT':
        return <Chip size="small" label={t('sales.credit') || 'Khata / Credit'} sx={{ backgroundColor: '#fff1f2', color: '#be123c', fontWeight: 700, border: '1px solid #fecdd3' }} />;
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
          <Stack direction="row" spacing={1.5}>
            <VoiceButton
              variant="button"
              label={t('voice.voiceSale') || 'Voice Sale'}
              contextHint="Sold 2 kg sugar to Ramesh"
              onCommandResult={handleVoiceCommand}
            />
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
          </Stack>
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
            value={sales.length > 0 ? t('dashboard.bills', { count: sales.length }) : t('dashboard.bills', { count: 28 })}
            subtitle={t('sales.invoicesGenerated')}
            trend="neutral"
            icon={<ReceiptLongIcon />}
            color="blue"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title={t('sales.digitalSales')}
            value="₹5,200"
            subtitle={t('sales.digitalSalesSub')}
            trend="up"
            icon={<ShoppingBagIcon />}
            color="purple"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title={t('sales.credit')}
            value="₹1,250"
            subtitle={t('sales.creditSalesSub')}
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
                <TableCell sx={{ fontWeight: 700, color: '#475569' }} align="center">{t('products.actions')}</TableCell>
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
                      {getLocalizedCustomerName(row.customerName || 'Walk-in Customer', selectedLanguage)}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ color: '#334155' }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>
                      {row.items?.length > 0
                        ? row.items.map((i) => `${getLocalizedProduct(i.productName, selectedLanguage)} (${i.quantity} ${getLocalizedUnit(i.unit, selectedLanguage) || ''})`).join(', ')
                        : getLocalizedProduct(row.products, selectedLanguage) || 'Retail Grocery'}
                    </Typography>
                    {selectedLanguage !== 'en' && row.products && getLocalizedProduct(row.products, selectedLanguage) !== row.products && (
                      <Typography variant="caption" sx={{ color: '#64748b', display: 'block', fontSize: '0.72rem' }}>
                        {row.products}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 800, color: '#059669', fontSize: '0.95rem' }}>
                    ₹{row.total || row.amount}
                  </TableCell>
                  <TableCell>{getPaymentBadge(row.paymentMethod)}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={t('sales.completed') || 'Completed'}
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
                    {row.createdAt ? new Date(row.createdAt).toLocaleDateString() : getLocalizedDateString(row.date || 'Today', selectedLanguage)}
                  </TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={0.5} justifyContent="center">
                      <Tooltip title={t('sales.printInvoice') || 'Print Retail Bill'}>
                        <IconButton size="small" onClick={() => handlePrintInvoice(row)}>
                          <PrintIcon fontSize="small" sx={{ color: '#059669' }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={t('sales.viewInvoice') || 'View Details'}>
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

      {/* New Sale Dialog - Multi-item Cart */}
      <Dialog
        open={openModal}
        onClose={() => setOpenModal(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3.5, p: 1 } }}
      >
        <DialogTitle sx={{ pb: 1, pt: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            {t('sales.recordSaleTitle') || 'Record New Sale / Bill'}
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748b' }}>
            Record multi-item bills, auto-decrement inventory stock, and post Khata Udhaar.
          </Typography>
        </DialogTitle>
        <Divider />

        <form onSubmit={handleSubmit}>
          <DialogContent sx={{ py: 2.5 }}>
            {/* Customer and Payment Method */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label={t('sales.customer') || 'Customer'}
                  fullWidth
                  placeholder="Walk-in Customer or select customer"
                  value={formData.customerName}
                  onChange={(e) => {
                    const matched = availableCustomers.find(
                      (c) => c.name.toLowerCase() === e.target.value.toLowerCase()
                    );
                    setFormData({
                      ...formData,
                      customerName: e.target.value,
                      customerId: matched ? matched.id : null,
                    });
                  }}
                  helperText={
                    availableCustomers.length > 0
                      ? 'Tip: Type customer name to link Khata ledger'
                      : ''
                  }
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
                  {getPaymentMethods(t).map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>

            <Divider sx={{ my: 2 }}>
              <Chip label="Bill Line Items" size="small" sx={{ fontWeight: 700 }} />
            </Divider>

            {/* Line Items List */}
            <Stack spacing={2} sx={{ mb: 2 }}>
              {formData.items.map((item, idx) => (
                <Card
                  key={idx}
                  variant="outlined"
                  sx={{
                    p: 1.5,
                    borderRadius: 2.5,
                    bgcolor: '#fafafa',
                    borderColor: '#e2e8f0',
                  }}
                >
                  <Grid container spacing={1.5} alignItems="center">
                    <Grid item xs={12} sm={4}>
                      <TextField
                        select
                        size="small"
                        label={t('sales.selectProduct') || 'Select Product'}
                        fullWidth
                        value={item.productId || ''}
                        onChange={(e) => handleItemProductSelect(idx, e.target.value)}
                      >
                        <MenuItem value="">-- Select Product from Stock --</MenuItem>
                        {availableProducts.map((p) => (
                          <MenuItem key={p.id} value={p.id}>
                            {getLocalizedProduct(p.name, selectedLanguage)} ({p.quantity || p.stock} {p.unit}) — ₹{p.sellingPrice}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>

                    <Grid item xs={12} sm={3}>
                      <TextField
                        size="small"
                        label="Product / Item Name *"
                        required
                        fullWidth
                        placeholder="e.g. Rice 5kg"
                        value={item.productName}
                        onChange={(e) => handleItemFieldChange(idx, 'productName', e.target.value)}
                      />
                    </Grid>

                    <Grid item xs={6} sm={1.5}>
                      <TextField
                        size="small"
                        label="Qty *"
                        type="number"
                        required
                        fullWidth
                        value={item.quantity}
                        onChange={(e) => handleItemFieldChange(idx, 'quantity', Math.max(1, Number(e.target.value) || 1))}
                        inputProps={{ min: 1 }}
                      />
                    </Grid>

                    <Grid item xs={6} sm={1.5}>
                      <TextField
                        size="small"
                        label="Unit (₹) *"
                        type="number"
                        required
                        fullWidth
                        value={item.unitPrice}
                        onChange={(e) => handleItemFieldChange(idx, 'unitPrice', Math.max(0, Number(e.target.value) || 0))}
                      />
                    </Grid>

                    <Grid item xs={8} sm={1.5} textAlign="right">
                      <Typography variant="body2" sx={{ fontWeight: 800, color: '#059669' }}>
                        ₹{((Number(item.quantity) || 1) * (Number(item.unitPrice) || 0)).toFixed(2)}
                      </Typography>
                    </Grid>

                    <Grid item xs={4} sm={0.5} textAlign="center">
                      <IconButton
                        size="small"
                        color="error"
                        disabled={formData.items.length <= 1}
                        onClick={() => handleRemoveItemRow(idx)}
                      >
                        ✕
                      </IconButton>
                    </Grid>
                  </Grid>
                </Card>
              ))}
            </Stack>

            <Button
              variant="outlined"
              size="small"
              startIcon={<AddIcon />}
              onClick={handleAddItemRow}
              sx={{ fontWeight: 700, mb: 3 }}
            >
              + Add Another Item
            </Button>

            {/* Bill Summary Breakdown */}
            <Card variant="outlined" sx={{ p: 2, borderRadius: 2.5, bgcolor: '#f8fafc' }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={4}>
                  <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                    Subtotal ({formData.items.length} items):
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a' }}>
                    ₹{calculateSubtotal().toFixed(2)}
                  </Typography>
                </Grid>

                <Grid item xs={6} sm={2.5}>
                  <TextField
                    size="small"
                    label="Discount (₹)"
                    type="number"
                    fullWidth
                    value={formData.discount}
                    onChange={(e) => setFormData({ ...formData, discount: Math.max(0, Number(e.target.value) || 0) })}
                    inputProps={{ min: 0 }}
                  />
                </Grid>

                <Grid item xs={6} sm={2.5}>
                  <TextField
                    size="small"
                    label="Tax / GST (₹)"
                    type="number"
                    fullWidth
                    value={formData.tax}
                    onChange={(e) => setFormData({ ...formData, tax: Math.max(0, Number(e.target.value) || 0) })}
                    inputProps={{ min: 0 }}
                  />
                </Grid>

                <Grid item xs={12} sm={3} textAlign={{ xs: 'left', sm: 'right' }}>
                  <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                    Total Bill Amount:
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 900, color: '#059669' }}>
                    ₹{calculateTotal().toFixed(2)}
                  </Typography>
                </Grid>
              </Grid>
            </Card>

            {formData.paymentMethod === 'CREDIT' && (
              <Box sx={{ mt: 2, p: 1.5, bgcolor: '#fff1f2', borderRadius: 2, border: '1px solid #fecdd3' }}>
                <Typography variant="caption" sx={{ color: '#be123c', fontWeight: 700 }}>
                  ℹ️ Total bill of ₹{calculateTotal().toFixed(2)} will be automatically added to {formData.customerName || 'Customer'}'s Khata ledger.
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
                  <TableCell sx={{ fontWeight: 700 }}>{t('products.item')}</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>{t('confirm.quantity')}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>{t('sales.total')}</TableCell>
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
                {t('sales.total')}:
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#059669' }}>
                ₹{activeInvoice?.total || activeInvoice?.amount}
              </Typography>
            </Stack>

            <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', color: '#94a3b8', mt: 2 }}>
              🙏 Thank you for your visit!
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setInvoiceModalOpen(false)} sx={{ color: '#64748b' }}>
            {t('sales.closeInvoice')}
          </Button>
          <Button
            variant="contained"
            startIcon={<PrintIcon />}
            onClick={triggerBrowserPrint}
            sx={{ bgcolor: '#059669', fontWeight: 700, '&:hover': { bgcolor: '#047857' } }}
          >
            {t('sales.printInvoice')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Sales;
