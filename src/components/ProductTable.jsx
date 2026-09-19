import React, { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Typography,
  Box,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  TablePagination,
  Stack,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useLanguage } from '../context/LanguageContext';
import { useSimpleMode } from '../context/SimpleModeContext';

const ProductTable = ({
  products = [],
  onEdit,
  onDelete,
  onView,
  categories = [],
}) => {
  const { t } = useLanguage();
  const { simpleMode } = useSimpleMode();

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(8);

  // Filter products based on search and selected filters
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.category && p.category.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesCategory =
        categoryFilter === 'ALL' || p.category === categoryFilter;

      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'IN_STOCK' && p.status === 'In Stock') ||
        (statusFilter === 'LOW_STOCK' && p.status === 'Low Stock') ||
        (statusFilter === 'OUT_OF_STOCK' && p.status === 'Out of Stock');

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [products, searchTerm, categoryFilter, statusFilter]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getStatusChip = (status) => {
    switch (status) {
      case 'In Stock':
        return (
          <Chip
            size="small"
            label={`🟢 ${t('products.inStock')}`}
            sx={{
              backgroundColor: '#ecfdf5',
              color: '#065f46',
              fontWeight: 700,
              fontSize: '0.75rem',
              border: '1px solid #a7f3d0',
            }}
          />
        );
      case 'Low Stock':
        return (
          <Chip
            size="small"
            label={`🟠 ${t('products.runningLow')}`}
            sx={{
              backgroundColor: '#fffbeb',
              color: '#92400e',
              fontWeight: 700,
              fontSize: '0.75rem',
              border: '1px solid #fde68a',
            }}
          />
        );
      case 'Out of Stock':
        return (
          <Chip
            size="small"
            label={`🔴 ${t('products.outOfStock')}`}
            sx={{
              backgroundColor: '#fef2f2',
              color: '#991b1b',
              fontWeight: 700,
              fontSize: '0.75rem',
              border: '1px solid #fecaca',
            }}
          />
        );
      default:
        return <Chip size="small" label={status} />;
    }
  };

  const paginatedProducts = filteredProducts.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box>
      {/* Search and Filters Bar */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          gap: 2,
          mb: 2.5,
          alignItems: { xs: 'stretch', md: 'center' },
          justifyContent: 'space-between',
        }}
      >
        <TextField
          size="small"
          placeholder={t('products.searchPlaceholder')}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPage(0);
          }}
          sx={{ minWidth: { xs: '100%', md: 340 } }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#94a3b8' }} fontSize="small" />
              </InputAdornment>
            ),
          }}
        />

        <Stack direction="row" spacing={1.5} flexWrap="wrap">
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel id="category-filter-label">{t('products.category')}</InputLabel>
            <Select
              labelId="category-filter-label"
              label={t('products.category')}
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPage(0);
              }}
            >
              <MenuItem value="ALL">{t('products.allCategories')}</MenuItem>
              {categories.map((cat) => (
                <MenuItem key={cat} value={cat}>
                  {cat}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel id="status-filter-label">{t('products.status')}</InputLabel>
            <Select
              labelId="status-filter-label"
              label={t('products.status')}
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(0);
              }}
            >
              <MenuItem value="ALL">{t('products.allStatus')}</MenuItem>
              <MenuItem value="IN_STOCK">🟢 {t('products.inStock')}</MenuItem>
              <MenuItem value="LOW_STOCK">🟠 {t('products.runningLow')}</MenuItem>
              <MenuItem value="OUT_OF_STOCK">🔴 {t('products.outOfStock')}</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Box>

      {/* Table */}
      <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 3 }}>
        <Table sx={{ minWidth: 780 }}>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f8fafc' }}>
              <TableCell sx={{ fontWeight: 700, color: '#475569' }}>{t('products.item')}</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#475569' }}>{t('products.category')}</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#475569' }}>{t('products.code')}</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#475569' }} align="right">
                {t('products.stock')}
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#475569' }}>{t('products.unit')}</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#475569' }} align="right">
                {t('products.buyPrice')}
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#475569' }} align="right">
                {t('products.sellPrice')}
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#475569' }}>{t('products.status')}</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#475569' }} align="center">
                {t('products.actions')}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                  <Typography variant="body1" sx={{ color: '#64748b', fontWeight: 600 }}>
                    I couldn't find that item. Try searching again.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedProducts.map((row) => (
                <TableRow
                  key={row.id}
                  hover
                  sx={{
                    '&:last-child td, &:last-child th': { border: 0 },
                    transition: 'background-color 0.15s ease',
                  }}
                >
                  <TableCell sx={{ fontWeight: 700, color: '#0f172a', fontSize: simpleMode ? '1rem' : '0.9rem' }}>
                    {row.name}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ color: '#475569' }}>
                      {row.category}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ color: '#64748b', fontFamily: 'monospace', fontSize: '0.8rem' }}>
                    {row.sku}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 800, color: row.stock === 0 ? '#dc2626' : row.stock <= row.minStock ? '#d97706' : '#0f172a', fontSize: simpleMode ? '1.05rem' : '0.9rem' }}>
                    {row.stock}
                  </TableCell>
                  <TableCell sx={{ color: '#64748b' }}>{row.unit}</TableCell>
                  <TableCell align="right" sx={{ color: '#64748b' }}>
                    ₹{row.purchasePrice}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 800, color: '#059669', fontSize: simpleMode ? '1.05rem' : '0.9rem' }}>
                    ₹{row.sellingPrice}
                  </TableCell>
                  <TableCell>{getStatusChip(row.status)}</TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={0.5} justifyContent="center">
                      {onView && (
                        <Tooltip title="View Details">
                          <IconButton size="small" onClick={() => onView(row)} sx={{ color: '#64748b' }}>
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      {onEdit && (
                        <Tooltip title="Edit Item">
                          <IconButton size="small" onClick={() => onEdit(row)} sx={{ color: '#2563eb' }}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      {onDelete && (
                        <Tooltip title="Remove Item">
                          <IconButton size="small" onClick={() => onDelete(row)} sx={{ color: '#ef4444' }}>
                            <DeleteOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <TablePagination
        rowsPerPageOptions={[5, 8, 15, 25]}
        component="div"
        count={filteredProducts.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Box>
  );
};

export default ProductTable;
