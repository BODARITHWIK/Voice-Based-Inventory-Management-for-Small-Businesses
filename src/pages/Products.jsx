import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  MenuItem,
  Typography,
  Stack,
  Divider,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import { useLocation } from 'react-router-dom';

import PageHeader from '../components/PageHeader';
import ProductTable from '../components/ProductTable';
import VoiceButton from '../components/VoiceButton';
import ConfirmDialog from '../components/ConfirmDialog';
import ScanStockModal from '../components/ScanStockModal';
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { useSimpleMode } from '../context/SimpleModeContext';
import {
  getLocalizedCategory,
  getLocalizedUnit,
} from '../utils/productLocalization';

const categories = [
  'Grains & Pulses',
  'Packaged Food',
  'Oils & Ghee',
  'Snacks & Confectionery',
  'Daily Essentials',
  'Dairy',
  'Beverages',
  'Spices & Masala',
  'Personal Care',
];

const units = ['kg', 'packets', 'litres', 'packs', 'bottles', 'grams', 'boxes'];

const initialForm = {
  name: '',
  category: 'Grains & Pulses',
  sku: '',
  quantity: '',
  unit: 'kg',
  minStock: '10',
  purchasePrice: '',
  sellingPrice: '',
  supplier: '',
};

const Products = ({ showToast, onTriggerVoiceConfirm }) => {
  const location = useLocation();
  const { t, selectedLanguage, selectedLocale } = useLanguage();
  const { simpleMode } = useSimpleMode();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Dialog states
  const [openModal, setOpenModal] = useState(false);
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' | 'edit' | 'view'
  const [formData, setFormData] = useState(initialForm);
  const [selectedProductId, setSelectedProductId] = useState(null);

  // Delete dialog
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  useEffect(() => {
    loadProducts();
    if (location.state?.openAddModal) {
      handleOpenAdd();
    }
  }, [location.state]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await getProducts();
      setProducts(data);
    } catch (err) {
      showToast?.(t('toast.errorGeneric'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setModalMode('add');
    setFormData({
      ...initialForm,
      sku: `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
    });
    setOpenModal(true);
  };

  const handleOpenEdit = (item) => {
    setModalMode('edit');
    setSelectedProductId(item.id);
    setFormData({
      name: item.name,
      category: item.category,
      sku: item.sku,
      quantity: item.stock,
      unit: item.unit,
      minStock: item.minStock,
      purchasePrice: item.purchasePrice,
      sellingPrice: item.sellingPrice,
      supplier: item.supplier || '',
    });
    setOpenModal(true);
  };

  const handleOpenView = (item) => {
    setModalMode('view');
    setSelectedProductId(item.id);
    setFormData({
      name: item.name,
      category: item.category,
      sku: item.sku,
      quantity: item.stock,
      unit: item.unit,
      minStock: item.minStock,
      purchasePrice: item.purchasePrice,
      sellingPrice: item.sellingPrice,
      supplier: item.supplier || '',
    });
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.sellingPrice) {
      showToast?.('Please fill required fields (Name & Selling Price)', 'warning');
      return;
    }

    try {
      if (modalMode === 'add') {
        await createProduct(formData);
        showToast?.(t('toast.stockAdded', { item: formData.name, qty: formData.quantity || 1, unit: formData.unit }), 'success');
      } else if (modalMode === 'edit') {
        await updateProduct(selectedProductId, formData);
        showToast?.(t('toast.stockAdded', { item: formData.name, qty: formData.quantity || 1, unit: formData.unit }), 'success');
      }
      handleCloseModal();
      loadProducts();
    } catch (err) {
      showToast?.(t('toast.errorGeneric'), 'error');
    }
  };

  // Delete handlers
  const handleTriggerDelete = (item) => {
    setProductToDelete(item);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    try {
      await deleteProduct(productToDelete.id);
      showToast?.(t('toast.itemRemoved'), 'info');
      setDeleteConfirmOpen(false);
      setProductToDelete(null);
      loadProducts();
    } catch (err) {
      showToast?.(t('toast.errorGeneric'), 'error');
    }
  };

  // Voice Add handler
  const handleVoiceCommand = (parsed) => {
    if (parsed.intent === 'ADD_STOCK' || parsed.intent === 'REMOVE_STOCK') {
      if (onTriggerVoiceConfirm) {
        onTriggerVoiceConfirm(parsed);
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        name: parsed.product || parsed.rawText,
        quantity: parsed.quantity || 10,
        unit: parsed.unit || 'packets',
        sku: `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      }));
      setModalMode('add');
      setOpenModal(true);
      showToast?.(`Voice detected: ${parsed.product}. Check details and save.`, 'info');
    }
  };

  return (
    <Box>
      <PageHeader
        title={t('products.title')}
        subtitle={t('products.subtitle')}
        action={
          <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
            <Button
              variant="contained"
              startIcon={<CameraAltIcon />}
              onClick={() => setIsScanModalOpen(true)}
              sx={{
                py: simpleMode ? 1.4 : 1,
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
            <VoiceButton
              variant="button"
              language={selectedLanguage}
              locale={selectedLocale}
              label={t('voice.voiceAdd')}
              contextHint="Add 20 packets of Maggi"
              onCommandResult={handleVoiceCommand}
            />
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleOpenAdd}
              sx={{
                py: simpleMode ? 1.4 : 1,
                px: simpleMode ? 2.5 : 2,
                fontSize: simpleMode ? '1rem' : '0.88rem',
                fontWeight: 700,
              }}
            >
              {t('products.addItemBtn')}
            </Button>
          </Stack>
        }
      />

      {/* Product Table Component with Filters & Search */}
      <ProductTable
        products={products}
        categories={categories}
        onEdit={handleOpenEdit}
        onDelete={handleTriggerDelete}
        onView={handleOpenView}
      />

      {/* Add / Edit / View Dialog */}
      <Dialog
        open={openModal}
        onClose={handleCloseModal}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3.5, p: 1 } }}
      >
        <DialogTitle sx={{ pb: 1, pt: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            {modalMode === 'add'
              ? t('products.addItemBtn')
              : modalMode === 'edit'
              ? t('products.editItem')
              : t('products.itemDetails')}
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748b' }}>
            {modalMode === 'view'
              ? 'Item pricing and alert thresholds'
              : 'Enter item name, stock quantity, and selling price.'}
          </Typography>
        </DialogTitle>
        <Divider />

        <form onSubmit={handleSubmit}>
          <DialogContent sx={{ py: 3 }}>
            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={8}>
                <TextField
                  label={t('products.item')}
                  required
                  fullWidth
                  disabled={modalMode === 'view'}
                  placeholder="e.g. Basmati Rice (Kohinoor)"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  select
                  label={t('products.category')}
                  fullWidth
                  disabled={modalMode === 'view'}
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                >
                  {categories.map((cat) => (
                    <MenuItem key={cat} value={cat}>
                      {getLocalizedCategory(cat, selectedLanguage)}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  label={t('products.code')}
                  fullWidth
                  disabled={modalMode === 'view'}
                  placeholder="e.g. GRN-RIC-001"
                  value={formData.sku}
                  onChange={(e) => handleInputChange('sku', e.target.value)}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  label={t('products.stock')}
                  type="number"
                  fullWidth
                  disabled={modalMode === 'view'}
                  placeholder="e.g. 50"
                  value={formData.quantity}
                  onChange={(e) => handleInputChange('quantity', e.target.value)}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  select
                  label={t('products.unit')}
                  fullWidth
                  disabled={modalMode === 'view'}
                  value={formData.unit}
                  onChange={(e) => handleInputChange('unit', e.target.value)}
                >
                  {units.map((u) => (
                    <MenuItem key={u} value={u}>
                      {getLocalizedUnit(u, selectedLanguage)}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  label={t('products.minStock')}
                  type="number"
                  fullWidth
                  disabled={modalMode === 'view'}
                  placeholder="10"
                  value={formData.minStock}
                  onChange={(e) => handleInputChange('minStock', e.target.value)}
                  helperText="Warns when stock falls below this"
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  label={`${t('products.buyPrice')} (₹)`}
                  type="number"
                  fullWidth
                  disabled={modalMode === 'view'}
                  placeholder="Cost per unit"
                  value={formData.purchasePrice}
                  onChange={(e) => handleInputChange('purchasePrice', e.target.value)}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  label={`${t('products.sellPrice')} (₹)`}
                  type="number"
                  required
                  fullWidth
                  disabled={modalMode === 'view'}
                  placeholder="Retail price"
                  value={formData.sellingPrice}
                  onChange={(e) => handleInputChange('sellingPrice', e.target.value)}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label={t('products.supplier')}
                  fullWidth
                  disabled={modalMode === 'view'}
                  placeholder="e.g. Lakshmi Agro Traders"
                  value={formData.supplier}
                  onChange={(e) => handleInputChange('supplier', e.target.value)}
                />
              </Grid>
            </Grid>
          </DialogContent>

          <Divider />
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={handleCloseModal} sx={{ color: '#64748b' }}>
              {t('confirm.cancel')}
            </Button>
            {modalMode !== 'view' && (
              <Button type="submit" variant="contained" color="primary" sx={{ fontWeight: 700 }}>
                {t('products.saveBtn')}
              </Button>
            )}
          </DialogActions>
        </form>
      </Dialog>

      {/* Destructive Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title={t('confirm.destructiveTitle')}
        type="destructive"
        destructiveMessage={`Are you sure you want to remove "${productToDelete?.name}" from your stock?`}
        confirmText="Remove Item"
      />

      {/* AI Stock Photo Analysis Modal */}
      <ScanStockModal
        open={isScanModalOpen}
        onClose={() => setIsScanModalOpen(false)}
        onStockUpdated={loadProducts}
      />
    </Box>
  );
};

export default Products;
