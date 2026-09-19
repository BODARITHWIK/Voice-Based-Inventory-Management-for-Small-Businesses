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
import { getPurchases, createPurchase, getSuppliers } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { useSimpleMode } from '../context/SimpleModeContext';

const initialPurchaseForm = {
  supplier: 'Lakshmi Agro Traders',
  products: '',
  quantity: '',
  amount: '',
  status: 'Received',
};

const Purchases = ({ showToast, onTriggerVoiceConfirm }) => {
  const location = useLocation();
  const { t } = useLanguage();
  const { simpleMode } = useSimpleMode();

  const [purchases, setPurchases] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [formData, setFormData] = useState(initialPurchaseForm);

  useEffect(() => {
    loadPurchases();
    loadSuppliers();

    if (location.state?.openNewPurchase) {
      setFormData(initialPurchaseForm);
      setOpenModal(true);
    } else if (location.state?.restockItem) {
      const item = location.state.restockItem;
      setFormData({
        supplier: 'Lakshmi Agro Traders',
        products: item.product,
        quantity: `50 ${item.remaining?.includes('kg') ? 'kg' : 'units'}`,
        amount: '3500',
        status: 'Ordered',
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

  const loadSuppliers = async () => {
    try {
      const data = await getSuppliers();
      setSuppliers(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.products || !formData.amount) {
      showToast?.('Please specify items bought and cost amount.', 'warning');
      return;
    }

    try {
      await createPurchase(formData);
      showToast?.(t('toast.purchaseSaved'), 'success');
      setOpenModal(false);
      loadPurchases();
    } catch (err) {
      showToast?.(t('toast.errorGeneric'), 'error');
    }
  };

  const handleVoiceCommand = (parsed) => {
    if (parsed.intent === 'ADD_STOCK') {
      if (onTriggerVoiceConfirm) {
        onTriggerVoiceConfirm(parsed);
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        products: parsed.product || 'Stock order',
        quantity: `${parsed.quantity || 50} ${parsed.unit || 'units'}`,
        amount: parsed.quantity ? parsed.quantity * 40 : 2000,
      }));
      setOpenModal(true);
      showToast?.(`Voice detected: Purchase of ${parsed.product}. Fill details to save.`, 'info');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Received':
        return <Chip size="small" label="Received (In Stock)" sx={{ backgroundColor: '#ecfdf5', color: '#065f46', fontWeight: 700, border: '1px solid #a7f3d0' }} />;
      case 'Pending Delivery':
        return <Chip size="small" label="Pending Delivery" sx={{ backgroundColor: '#fffbeb', color: '#b45309', fontWeight: 700, border: '1px solid #fde68a' }} />;
      case 'Ordered':
        return <Chip size="small" label="Ordered" sx={{ backgroundColor: '#eff6ff', color: '#1d4ed8', fontWeight: 700, border: '1px solid #bfdbfe' }} />;
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
            title="Pending Delivery"
            value="1 Order"
            subtitle="Fortune Oil (40L)"
            trend="warning"
            icon={<PendingActionsIcon />}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Weekly Spend"
            value="₹24,000"
            subtitle="Restocked 6 SKUs"
            trend="up"
            icon={<CurrencyRupeeIcon />}
            color="blue"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Suppliers"
            value="5 Vendors"
            subtitle="Distributor network"
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
                  <TableCell sx={{ color: '#334155' }}>{row.products}</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#059669' }}>{row.quantity}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem' }}>
                    ₹{row.amount}
                  </TableCell>
                  <TableCell>{getStatusBadge(row.status)}</TableCell>
                  <TableCell sx={{ color: '#64748b', fontSize: '0.85rem' }}>{row.date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* New Purchase Dialog */}
      <Dialog
        open={openModal}
        onClose={() => setOpenModal(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3.5, p: 1 } }}
      >
        <DialogTitle sx={{ pb: 1, pt: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            {t('purchases.newPurchaseBtn')}
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748b' }}>
            Record incoming stock supplies from your distributor.
          </Typography>
        </DialogTitle>
        <Divider />

        <form onSubmit={handleSubmit}>
          <DialogContent sx={{ py: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  select
                  label={t('purchases.supplier')}
                  fullWidth
                  value={formData.supplier}
                  onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                >
                  {suppliers.map((s) => (
                    <MenuItem key={s.id} value={s.name}>
                      {s.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} sm={8}>
                <TextField
                  label={t('purchases.itemsOrdered')}
                  required
                  fullWidth
                  placeholder="e.g. Basmati Rice (50 kg)"
                  value={formData.products}
                  onChange={(e) => setFormData({ ...formData, products: e.target.value })}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  label={t('products.stock')}
                  required
                  fullWidth
                  placeholder="e.g. 50 kg"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label={t('purchases.cost')}
                  type="number"
                  required
                  fullWidth
                  placeholder="e.g. 2500"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  label="Delivery Status"
                  fullWidth
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <MenuItem value="Received">Received (In Stock)</MenuItem>
                  <MenuItem value="Pending Delivery">Pending Delivery</MenuItem>
                  <MenuItem value="Ordered">Ordered</MenuItem>
                </TextField>
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

export default Purchases;
