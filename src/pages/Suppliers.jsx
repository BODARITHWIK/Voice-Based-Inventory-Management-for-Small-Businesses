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
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import EditIcon from '@mui/icons-material/Edit';

import PageHeader from '../components/PageHeader';
import { getSuppliers, createSupplier } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { useSimpleMode } from '../context/SimpleModeContext';

const initialSupplierForm = {
  name: '',
  contactPerson: '',
  phone: '',
  email: '',
  address: '',
  gstNumber: '',
};

const Suppliers = ({ showToast }) => {
  const { t } = useLanguage();
  const { simpleMode } = useSimpleMode();

  const [suppliers, setSuppliers] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [formData, setFormData] = useState(initialSupplierForm);

  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = async () => {
    try {
      const data = await getSuppliers();
      setSuppliers(data);
    } catch (err) {
      showToast?.(t('toast.errorGeneric'), 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      showToast?.('Please provide supplier name and phone.', 'warning');
      return;
    }

    try {
      await createSupplier(formData);
      showToast?.('Supplier saved successfully.', 'success');
      setOpenModal(false);
      setFormData(initialSupplierForm);
      loadSuppliers();
    } catch (err) {
      showToast?.(t('toast.errorGeneric'), 'error');
    }
  };

  return (
    <Box>
      <PageHeader
        title={t('suppliers.title')}
        subtitle={t('suppliers.subtitle')}
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
            {t('suppliers.addSupplierBtn')}
          </Button>
        }
      />

      <Card sx={{ borderRadius: 3.5, border: '1px solid #e2e8f0' }}>
        <TableContainer component={Paper} elevation={0}>
          <Table sx={{ minWidth: 750 }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f8fafc' }}>
                <TableCell sx={{ fontWeight: 700, color: '#475569' }}>{t('suppliers.name')}</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569' }}>{t('suppliers.contact')}</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569' }}>{t('suppliers.location')}</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569' }}>{t('suppliers.totalPurchases')}</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569' }}>{t('suppliers.outstanding')}</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569' }}>{t('products.status')}</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569' }} align="center">{t('products.actions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {suppliers.map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 800, color: '#0f172a' }}>
                      {row.name}
                    </Typography>
                    {row.contactPerson && (
                      <Typography variant="caption" sx={{ color: '#64748b' }}>
                        {t('suppliers.rep')}: {row.contactPerson}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Stack spacing={0.5}>
                      <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#334155', fontWeight: 600 }}>
                        <PhoneIcon sx={{ fontSize: 13, color: '#64748b' }} /> {row.phone}
                      </Typography>
                      {row.email && (
                        <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#64748b' }}>
                          <EmailIcon sx={{ fontSize: 13, color: '#64748b' }} /> {row.email}
                        </Typography>
                      )}
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" sx={{ display: 'block', color: '#475569', fontWeight: 500 }}>
                      {row.address || 'APMC Mandi'}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#94a3b8', fontFamily: 'monospace' }}>
                      GST: {row.gstNumber || 'N/A'}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#0f172a' }}>
                    {row.totalPurchases}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 800, color: row.outstandingAmount === '₹0' ? '#059669' : '#dc2626' }}>
                    {row.outstandingAmount}
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={row.status}
                      sx={{
                        backgroundColor: '#ecfdf5',
                        color: '#065f46',
                        fontWeight: 700,
                        border: '1px solid #a7f3d0',
                        fontSize: '0.75rem',
                      }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Edit Supplier">
                      <IconButton size="small" onClick={() => showToast?.(`Editing ${row.name}`, 'info')}>
                        <EditIcon fontSize="small" sx={{ color: '#2563eb' }} />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Add Supplier Dialog */}
      <Dialog
        open={openModal}
        onClose={() => setOpenModal(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3.5, p: 1 } }}
      >
        <DialogTitle sx={{ pb: 1, pt: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            {t('suppliers.addSupplierBtn')}
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748b' }}>
            Save wholesale distributor contact and mandi details.
          </Typography>
        </DialogTitle>
        <Divider />

        <form onSubmit={handleSubmit}>
          <DialogContent sx={{ py: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={7}>
                <TextField
                  label={t('suppliers.name')}
                  required
                  fullWidth
                  placeholder="e.g. Lakshmi Agro Traders"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </Grid>

              <Grid item xs={12} sm={5}>
                <TextField
                  label={t('suppliers.rep')}
                  fullWidth
                  placeholder="e.g. Venkat Rao"
                  value={formData.contactPerson}
                  onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Phone Number"
                  required
                  fullWidth
                  placeholder="+91 98480 12345"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Email"
                  type="email"
                  fullWidth
                  placeholder="orders@supplier.in"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Address / Mandi Location"
                  fullWidth
                  placeholder="APMC Market Yard, Guntur, AP"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="GST Number"
                  fullWidth
                  placeholder="37AAAAA0000A1Z5"
                  value={formData.gstNumber}
                  onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
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

export default Suppliers;
