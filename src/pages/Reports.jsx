import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardHeader,
  CardContent,
  Typography,
  Button,
  Stack,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Divider,
} from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import InventoryIcon from '@mui/icons-material/Inventory';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

import PageHeader from '../components/PageHeader';
import { getReports, exportSalesCsv } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { useSimpleMode } from '../context/SimpleModeContext';

const Reports = ({ showToast }) => {
  const { t } = useLanguage();
  const { simpleMode } = useSimpleMode();

  const [dateRange, setDateRange] = useState('This Month');
  const [reportData, setReportData] = useState(null);
  const [activeReportTab, setActiveReportTab] = useState('sales');

  useEffect(() => {
    loadData(dateRange);
  }, [dateRange]);

  const loadData = async (range) => {
    try {
      const data = await getReports(range);
      setReportData(data);
    } catch (err) {
      console.error(err);
    }
  };

  const getDateRangeLabel = (range) => {
    switch (range) {
      case 'Today': return t('reports.today');
      case 'This Week': return t('reports.thisWeek');
      case 'This Month': return t('reports.thisMonth');
      case 'Custom Range': return t('reports.customRange');
      default: return range;
    }
  };

  const handleExportCSV = async () => {
    try {
      await exportSalesCsv();
      showToast?.(`✅ ${t('reports.exportCsv')} (${getDateRangeLabel(dateRange)})`, 'success');
    } catch (e) {
      showToast?.(t('toast.errorGeneric'), 'error');
    }
  };

  const handleExportPDF = () => {
    window.print();
  };

  const reportCards = [
    {
      id: 'sales',
      title: t('reports.salesReport'),
      val: reportData?.stats?.salesSummary?.totalRevenue || '₹2,48,600',
      sub: `${reportData?.stats?.salesSummary?.orderCount || 1420} ${t('sales.billsCount')}`,
      icon: <TrendingUpIcon />,
      color: '#059669',
      bgColor: '#ecfdf5',
    },
    {
      id: 'purchases',
      title: t('reports.purchaseReport'),
      val: reportData?.stats?.purchaseSummary?.totalPurchases || '₹1,85,200',
      sub: `${reportData?.stats?.purchaseSummary?.ordersPlaced || 48} ${t('purchases.title')}`,
      icon: <ShoppingBagIcon />,
      color: '#2563eb',
      bgColor: '#eff6ff',
    },
    {
      id: 'inventory',
      title: t('reports.inventoryReport'),
      val: '126 SKUs',
      sub: `₹4,12,000 ${t('reports.assetValue')}`,
      icon: <InventoryIcon />,
      color: '#0284c7',
      bgColor: '#e0f2fe',
    },
    {
      id: 'profit',
      title: t('reports.profitReport'),
      val: reportData?.stats?.profitSummary?.grossProfit || '₹63,400',
      sub: `${t('reports.margin')}: ${reportData?.stats?.profitSummary?.profitMargin || '25.5%'}`,
      icon: <AccountBalanceIcon />,
      color: '#16a34a',
      bgColor: '#dcfce7',
    },
    {
      id: 'lowstock',
      title: t('reports.lowStockReport'),
      val: '11 Items',
      sub: `8 ${t('products.runningLow')}, 3 ${t('products.outOfStock')}`,
      icon: <WarningAmberIcon />,
      color: '#d97706',
      bgColor: '#fffbeb',
    },
  ];

  return (
    <Box>
      <PageHeader
        title={t('reports.title')}
        subtitle={t('reports.subtitle')}
        action={
          <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel id="range-select-label">{t('reports.timePeriod')}</InputLabel>
              <Select
                labelId="range-select-label"
                label={t('reports.timePeriod')}
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
              >
                <MenuItem value="Today">{t('reports.today')}</MenuItem>
                <MenuItem value="This Week">{t('reports.thisWeek')}</MenuItem>
                <MenuItem value="This Month">{t('reports.thisMonth')}</MenuItem>
                <MenuItem value="Custom Range">{t('reports.customRange')}</MenuItem>
              </Select>
            </FormControl>

            <Button
              variant="outlined"
              color="primary"
              startIcon={<FileDownloadIcon />}
              onClick={handleExportCSV}
              sx={{ fontWeight: 700 }}
            >
              {t('reports.exportCsv')}
            </Button>

            <Button
              variant="contained"
              color="primary"
              startIcon={<PictureAsPdfIcon />}
              onClick={handleExportPDF}
              sx={{ fontWeight: 700 }}
            >
              {t('reports.exportPdf')}
            </Button>
          </Stack>
        }
      />

      {/* 5 Report Overview Cards */}
      <Grid container spacing={2} sx={{ mb: 3.5 }}>
        {reportCards.map((card) => (
          <Grid item xs={12} sm={6} md={2.4} key={card.id}>
            <Card
              onClick={() => setActiveReportTab(card.id)}
              sx={{
                p: 2,
                cursor: 'pointer',
                borderRadius: 3,
                border: activeReportTab === card.id ? `2px solid ${card.color}` : '1px solid #e2e8f0',
                backgroundColor: '#ffffff',
                boxShadow: activeReportTab === card.id ? '0 6px 18px rgba(0,0,0,0.06)' : 'none',
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                },
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b', fontSize: '0.8rem' }}>
                  {card.title}
                </Typography>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: 2,
                    backgroundColor: card.bgColor,
                    color: card.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {card.icon}
                </Box>
              </Stack>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>
                {card.val}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500 }}>
                {card.sub}
              </Typography>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Charts Grid */}
      <Grid container spacing={3}>
        {/* Sales Trend Chart */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%', borderRadius: 3.5, border: '1px solid #e2e8f0' }}>
            <CardHeader
              title={
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                  {t('reports.salesReport')} ({getDateRangeLabel(dateRange)})
                </Typography>
              }
              subheader="Daily revenue velocity"
            />
            <Divider />
            <CardContent sx={{ height: 300, pt: 3 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={reportData?.salesOverview || []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="day" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" tickFormatter={(v) => `₹${v}`} />
                  <RechartsTooltip formatter={(v) => [`₹${v}`, 'Sales']} />
                  <Area type="monotone" dataKey="revenue" stroke="#059669" fill="#ecfdf5" strokeWidth={2.5} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Purchase Trend Chart */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%', borderRadius: 3.5, border: '1px solid #e2e8f0' }}>
            <CardHeader
              title={
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                  {t('reports.purchaseReport')}
                </Typography>
              }
              subheader="Monthly supplier spend"
            />
            <Divider />
            <CardContent sx={{ height: 300, pt: 3 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={reportData?.purchasesOverview || []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" tickFormatter={(v) => `₹${v / 1000}k`} />
                  <RechartsTooltip formatter={(v) => [`₹${v}`, 'Purchases']} />
                  <Bar dataKey="amount" fill="#2563eb" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Profit Overview */}
        <Grid item xs={12} md={8}>
          <Card sx={{ borderRadius: 3.5, border: '1px solid #e2e8f0' }}>
            <CardHeader
              title={
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                  {t('reports.profitReport')}
                </Typography>
              }
              subheader="Revenue vs Cost vs Net Profit"
            />
            <Divider />
            <CardContent sx={{ height: 320, pt: 3 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={reportData?.profitTrend || []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" tickFormatter={(v) => `₹${v / 1000}k`} />
                  <RechartsTooltip formatter={(v) => `₹${v}`} />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#059669" strokeWidth={2.5} />
                  <Line type="monotone" dataKey="cost" name="Cost" stroke="#64748b" strokeWidth={2} strokeDasharray="3 3" />
                  <Line type="monotone" dataKey="profit" name="Net Profit" stroke="#2563eb" strokeWidth={2.5} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Inventory Status Breakdown */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', borderRadius: 3.5, border: '1px solid #e2e8f0' }}>
            <CardHeader
              title={
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                  {t('products.title')}
                </Typography>
              }
              subheader="Stock health breakdown"
            />
            <Divider />
            <CardContent sx={{ height: 320, display: 'flex', flexDirection: 'column', alignItems: 'center', pt: 1 }}>
              <ResponsiveContainer width="100%" height={230}>
                <PieChart>
                  <Pie
                    data={reportData?.inventoryStatus || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    dataKey="value"
                  >
                    {reportData?.inventoryStatus?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Reports;
