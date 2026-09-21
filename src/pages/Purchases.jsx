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
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import { useLocation } from 'react-router-dom';

import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import VoiceButton from '../components/VoiceButton';
import { getPurchases, createPurchase, getSuppliers, getProducts } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { useSimpleMode } from '../context/SimpleModeContext';
import {
  getLocalizedProduct,
  getLocalizedUnit,
  getLocalizedDateString,
} from '../utils/productLocalization';

const defaultPurchaseItem = {
  productId: '',
  productName: '',
  quantity: 1,
  unitPrice: 0,
  unit: 'packets',
};

const initialPurchaseForm = {
  supplier: 'Lakshmi Agro Traders',
  supplierId: null,
  status: 'Received',
  tax: 0,
  items: [{ ...defaultPurchaseItem }],
};

const Purchases = ({ showToast, onTriggerVoiceConfirm }) => {
  const location = useLocation();
  const { t, selectedLanguage } = useLanguage();
  const { simpleMode } = useSimpleMode();

  const [purchases, setPurchases] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [formData, setFormData] = useState(initialPurchaseForm);

  useEffect(() => {
    loadPurchases();
    loadLookups();

    if (location.state?.openNewPurchase) {
      setFormData(initialPurchaseForm);
      setOpenModal(true);
    } else if (location.state?.restockItem) {
      const item = location.state.restockItem;
      setFormData({
        supplier: 'Lakshmi Agro Traders',
        supplierId: null,
        status: 'Ordered',
        tax: 0,
        items: [
          {
            productId: '',
            productName: item.product || '',
            quantity: 50,
            unitPrice: 70,
            unit: item.remaining?.includes('kg') ? 'kg' : 'packets',
          },
        ],
      });
      setOpenModal(true);
    }
  }, [location.state]);

  const loadPurchases = async () => {
    try {
      const data = await getPurchases();
      setPurchases(data);
    } catch (err) {
      showToast?.(t('toast.errorGeneric'), 'error');
    }
  };

  const loadLookups = async () => {
    try {
      const [sups, prods] = await Promise.all([getSuppliers(), getProducts()]);
      setSuppliers(Array.isArray(sups) ? sups : []);
      setAvailableProducts(Array.isArray(prods) ? prods : []);
    } catch (err) {
      console.error(err);
    }
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
          unitPrice: prod.purchasePrice || prod.costPrice || 0,
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
      items: [...prev.items, { ...defaultPurchaseItem }],
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
    const tax = Number(formData.tax) || 0;
    return Math.max(0, subtotal + tax);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validItems = (formData.items || []).filter(
      (it) => (it.productName && it.productName.trim()) || it.productId
    );

    if (validItems.length === 0) {
      showToast?.('Please specify at least one product in the purchase.', 'warning');
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
    const tax = Number(formData.tax) || 0;
    const totalAmount = Math.max(0, subtotal + tax);

    try {
      const purchasePayload = {
        supplierId: formData.supplierId || null,
        supplierName: formData.supplier || 'Direct Supplier',
        supplier: formData.supplier || 'Direct Supplier',
        amount: totalAmount,
        quantity: validItems.reduce((acc, it) => acc + (Number(it.quantity) || 1), 0),
        tax,
        status: formData.status || 'Received',
        products: validItems.map((it) => `${it.productName} (${it.quantity})`).join(', '),
        items: validItems.map((it) => ({
          productId: it.productId ? Number(it.productId) : null,
          productName: it.productName,
          quantity: Number(it.quantity) || 1,
          unitPrice: Number(it.unitPrice) || 0,
          unit: it.unit || 'packets',
        })),
      };

      await createPurchase(purchasePayload);
      showToast?.(t('toast.purchaseSaved') || 'Purchase recorded successfully!', 'success');
      setOpenModal(false);
      loadPurchases();
    } catch (err) {
      showToast?.(t('toast.errorGeneric') || 'Failed to save purchase.', 'error');
    }
  };

  const handleVoiceCommand = (parsed) => {
    if (parsed.intent === 'ADD_STOCK') {
      if (onTriggerVoiceConfirm) {
        onTriggerVoiceConfirm(parsed);
      }
    } else {
      const prod = availableProducts.find(
        (p) => (p.name || '').toLowerCase() === (parsed.product || '').toLowerCase()
      );
      setFormData({
        supplier: 'Lakshmi Agro Traders',
        supplierId: null,
        status: 'Received',
        tax: 0,
        items: [
          {
            productId: prod ? prod.id : '',
            productName: parsed.product || 'Stock order',
            quantity: Number(parsed.quantity) || 50,
            unitPrice: prod?.purchasePrice || 40,
            unit: parsed.unit || 'units',
          },
        ],
      });
      setOpenModal(true);
      showToast?.(`Voice detected: Purchase of ${parsed.product}. Review details.`, 'info');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Received':
        return <Chip size="small" label={t('purchases.received') || 'Received (In Stock)'} sx={{ backgroundColor: '#ecfdf5', color: '#065f46', fontWeight: 700, border: '1px solid #a7f3d0' }} />;
      case 'Pending Delivery':
        return <Chip size="small" label={t('purchases.pendingDelivery') || 'Pending Delivery'} sx={{ backgroundColor: '#fffbeb', color: '#b45309', fontWeight: 700, border: '1px solid #fde68a' }} />;
      case 'Ordered':
        return <Chip size="small" label={t('purchases.ordered') || 'Ordered'} sx={{ backgroundColor: '#eff6ff', color: '#1d4ed8', fontWeight: 700, border: '1px solid #bfdbfe' }} />;
      default:
        return <Chip size="small" label={status} />;
    }
  };

  return (
    <Box>
      <PageHeader
        title={t('purchases.title')}
        subtitle={t('purchases.subtitle')}
        action={
          <Stack direction="row" spacing={1.5}>
            <VoiceButton
              variant="button"
              label={t('voice.voicePurchase')}
              contextHint="Purchased 50 kg rice from Lakshmi Traders"
              onCommandResult={handleVoiceCommand}
            />
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => {
                setFormData(initialPurchaseForm);
                setOpenModal(true);
              }}
              sx={{
                py: simpleMode ? 1.4 : 1,
                px: simpleMode ? 2.5 : 2,
                fontSize: simpleMode ? '1rem' : '0.88rem',
                fontWeight: 700,
              }}
            >
              {t('purchases.newPurchaseBtn')}
            </Button>
          </Stack>
        }
      />

      {/* 4 Stat Cards */}
      <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title={t('reports.purchaseReport')}
            value="₹1,85,200"
            change="+4.2% this month"
            trend="up"
            icon={<ShoppingCartIcon />}
            color="emerald"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title={t('purchases.pendingDelivery')}
            value="1 Order"
            subtitle="Fortune Oil (40L)"
            trend="warning"
            icon={<PendingActionsIcon />}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title={t('purchases.weeklySpend')}
            value="₹24,000"
            subtitle="Restocked 6 SKUs"
            trend="up"
            icon={<CurrencyRupeeIcon />}
            color="blue"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title={t('purchases.activeSuppliers')}
            value="5 Vendors"
            subtitle={t('purchases.distributorNetwork')}
            trend="up"
            icon={<LocalShippingIcon />}
            color="emerald"
          />
        </Grid>
      </Grid>

      {/* Purchases Table */}
      <Card sx={{ borderRadius: 3.5, border: '1px solid #e2e8f0' }}>
        <TableContainer component={Paper} elevation={0}>
          <Table sx={{ minWidth: 700 }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f8fafc' }}>
                <TableCell sx={{ fontWeight: 700, color: '#475569' }}>{t('purchases.purchaseId')}</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569' }}>{t('purchases.supplier')}</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569' }}>{t('purchases.itemsOrdered')}</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569' }}>{t('products.stock')}</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569' }} align="right">{t('purchases.cost')}</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569' }}>{t('products.status')}</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569' }}>{t('sales.date')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {purchases.map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell sx={{ fontWeight: 800, color: '#2563eb' }}>{row.id}</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#0f172a' }}>{row.supplier}</TableCell>
                  <TableCell sx={{ color: '#334155' }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>
                      {getLocalizedProduct(row.products, selectedLanguage)}
                    </Typography>
                    {selectedLanguage !== 'en' && row.products && getLocalizedProduct(row.products, selectedLanguage) !== row.products && (
                      <Typography variant="caption" sx={{ color: '#64748b', display: 'block', fontSize: '0.72rem' }}>
                        {row.products}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#059669' }}>{row.quantity}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem' }}>
                    ₹{row.amount}
                  </TableCell>
                  <TableCell>{getStatusBadge(row.status)}</TableCell>
                  <TableCell sx={{ color: '#64748b', fontSize: '0.85rem' }}>
                    {getLocalizedDateString(row.date, selectedLanguage)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* New Purchase Dialog - Multi-item Restocking */}
      <Dialog
        open={openModal}
        onClose={() => setOpenModal(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3.5, p: 1 } }}
      >
        <DialogTitle sx={{ pb: 1, pt: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            {t('purchases.newPurchaseBtn') || 'New Purchase / Stock Inward'}
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748b' }}>
            {t('purchases.newPurchaseDesc') || 'Record multi-item inventory purchases and increase available stock.'}
          </Typography>
        </DialogTitle>
        <Divider />

        <form onSubmit={handleSubmit}>
          <DialogContent sx={{ py: 2.5 }}>
            <Grid container spacing={2} sx={{ mb: 2.5 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label={t('purchases.supplier') || 'Supplier'}
                  fullWidth
                  value={formData.supplier}
                  onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                  placeholder="e.g. Lakshmi Agro Traders"
                  helperText={
                    suppliers.length > 0 ? 'Select or type supplier name' : ''
                  }
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  label={t('purchases.deliveryStatus') || 'Delivery Status'}
                  fullWidth
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <MenuItem value="Received">{t('purchases.received') || 'Received (In Stock)'}</MenuItem>
                  <MenuItem value="Pending Delivery">{t('purchases.pendingDelivery') || 'Pending Delivery'}</MenuItem>
                  <MenuItem value="Ordered">{t('purchases.ordered') || 'Ordered'}</MenuItem>
                </TextField>
              </Grid>
            </Grid>

            <Divider sx={{ my: 2 }}>
              <Chip label="Items Ordered / Inward" size="small" sx={{ fontWeight: 700 }} />
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
                        label="Stock Product"
                        fullWidth
                        value={item.productId || ''}
                        onChange={(e) => handleItemProductSelect(idx, e.target.value)}
                      >
                        <MenuItem value="">-- Select or Type Custom --</MenuItem>
                        {availableProducts.map((p) => (
                          <MenuItem key={p.id} value={p.id}>
                            {getLocalizedProduct(p.name, selectedLanguage)} ({p.quantity || p.stock} {p.unit})
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>

                    <Grid item xs={12} sm={3}>
                      <TextField
                        size="small"
                        label="Item Name *"
                        required
                        fullWidth
                        placeholder="e.g. Basmati Rice"
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
                        label="Cost (₹) *"
                        type="number"
                        required
                        fullWidth
                        value={item.unitPrice}
                        onChange={(e) => handleItemFieldChange(idx, 'unitPrice', Math.max(0, Number(e.target.value) || 0))}
                      />
                    </Grid>

                    <Grid item xs={8} sm={1.5} textAlign="right">
                      <Typography variant="body2" sx={{ fontWeight: 800, color: '#0f172a' }}>
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

            {/* Purchase Summary Breakdown */}
            <Card variant="outlined" sx={{ p: 2, borderRadius: 2.5, bgcolor: '#f8fafc' }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={5}>
                  <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                    Subtotal ({formData.items.length} items):
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a' }}>
                    ₹{calculateSubtotal().toFixed(2)}
                  </Typography>
                </Grid>

                <Grid item xs={6} sm={3}>
                  <TextField
                    size="small"
                    label="Tax / Shipping (₹)"
                    type="number"
                    fullWidth
                    value={formData.tax}
                    onChange={(e) => setFormData({ ...formData, tax: Math.max(0, Number(e.target.value) || 0) })}
                    inputProps={{ min: 0 }}
                  />
                </Grid>

                <Grid item xs={12} sm={4} textAlign={{ xs: 'left', sm: 'right' }}>
                  <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                    Total Purchase Cost:
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 900, color: '#0f172a' }}>
                    ₹{calculateTotal().toFixed(2)}
                  </Typography>
                </Grid>
              </Grid>
            </Card>
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

export default Purchases;
