import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Stack,
  Chip,
  Button,
  Divider,
} from '@mui/material';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import RemoveShoppingCartIcon from '@mui/icons-material/RemoveShoppingCart';
import MicIcon from '@mui/icons-material/Mic';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useNavigate } from 'react-router-dom';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
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
import StatCard from '../components/StatCard';
import VoiceButton from '../components/VoiceButton';
import QuickActions from '../components/QuickActions';
import TransactionTable from '../components/TransactionTable';
import LowStockAlert from '../components/LowStockAlert';
import ScanStockModal from '../components/ScanStockModal';
import { getDashboardStats } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { useSimpleMode } from '../context/SimpleModeContext';

const Dashboard = ({ onTriggerVoiceConfirm, showToast }) => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { simpleMode } = useSimpleMode();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await getDashboardStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVoiceCommand = (parsed) => {
    if (onTriggerVoiceConfirm) {
      onTriggerVoiceConfirm(parsed);
    }
  };

  // Determine friendly time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('greeting.morning');
    if (hour < 17) return t('greeting.afternoon');
    return t('greeting.evening');
  };

  return (
    <Box>
      {/* Friendly Time-based Greeting Header */}
      <PageHeader
        title={getGreeting()}
        subtitle={t('greeting.subtitle')}
        chip={
          <Chip
            icon={<MicIcon sx={{ fontSize: '14px !important', color: '#059669 !important' }} />}
            label={t('greeting.activeBadge')}
            size="small"
            sx={{
              backgroundColor: '#ecfdf5',
              color: '#065f46',
              fontWeight: 700,
              border: '1px solid #a7f3d0',
            }}
          />
        }
        action={
          <Button
            variant="contained"
            color="primary"
            startIcon={<Inventory2Icon />}
            onClick={() => navigate('/products')}
            sx={{
              py: simpleMode ? 1.4 : 1,
              px: simpleMode ? 2.5 : 2,
              fontSize: simpleMode ? '1rem' : '0.88rem',
              fontWeight: 700,
            }}
          >
            {t('nav.products')}
          </Button>
        }
      />

      {/* Quick Actions Component */}
      <QuickActions
        onScanClick={() => setIsScanModalOpen(true)}
        onVoiceClick={() => {
          const micBtn = document.getElementById('voice-assistant-card-mic');
          if (micBtn) micBtn.click();
          else navigate('/dashboard');
        }}
      />

      {/* 4 Friendly Stat Cards */}
      <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title={t('stats.todaySales')}
            value={stats?.todaySales?.value || '₹8,450'}
            change="+12.5% vs yesterday"
            trend="up"
            icon={<CurrencyRupeeIcon />}
            color="emerald"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title={t('stats.myStock')}
            value={stats?.totalProducts?.value || 126}
            subtitle={t('stats.itemsInStock')}
            trend="up"
            icon={<Inventory2Icon />}
            color="blue"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title={t('stats.runningLow')}
            value={stats?.lowStock?.value || 8}
            subtitle={t('stats.needsAttention')}
            trend="warning"
            icon={<WarningAmberIcon />}
            color="warning"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title={t('stats.outOfStock')}
            value={stats?.outOfStock?.value || 3}
            subtitle={t('stats.requiresRestocking')}
            trend="danger"
            icon={<RemoveShoppingCartIcon />}
            color="error"
          />
        </Grid>
      </Grid>

      {/* Voice Assistant Hero Section */}
      <Card
        sx={{
          mb: 3.5,
          borderRadius: 3.5,
          background: 'linear-gradient(180deg, #ffffff 0%, #f0fdf4 100%)',
          border: '1.5px solid #a7f3d0',
          boxShadow: '0 4px 20px rgba(5, 150, 105, 0.08)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <CardContent sx={{ py: 3.5, px: { xs: 2.5, md: 4 } }}>
          <Stack alignItems="center" textAlign="center" spacing={1} mb={1}>
            <Chip
              label={t('smartAssistant')}
              size="small"
              sx={{
                fontWeight: 700,
                backgroundColor: '#ecfdf5',
                color: '#059669',
                border: '1px solid #bbf7d0',
                mb: 0.5,
              }}
            />
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                color: '#064e3b',
                fontFamily: "'Outfit', sans-serif",
                fontSize: simpleMode ? { xs: '1.8rem', md: '2.3rem' } : { xs: '1.5rem', md: '1.9rem' },
              }}
            >
              👋 {t('voice.speakToAssistant')}
            </Typography>
            <Typography variant="body1" sx={{ color: '#047857', maxWidth: 540, fontSize: simpleMode ? '1.1rem' : '0.95rem' }}>
              Speak naturally in English, Telugu, or Hindi. Swaranidhi will understand and take care of your shop.
            </Typography>
          </Stack>

          {/* Large Interactive Voice Assistant Component */}
          <VoiceButton
            variant="largeCard"
            onCommandResult={handleVoiceCommand}
          />
        </CardContent>
      </Card>

      {/* Charts Section: 7-Day Sales Overview & Inventory Breakdown */}
      <Grid container spacing={3} sx={{ mb: 3.5 }}>
        {/* Sales Overview Recharts */}
        <Grid item xs={12} lg={8}>
          <Card sx={{ height: '100%', borderRadius: 3.5, border: '1px solid #e2e8f0' }}>
            <CardHeader
              title={
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>
                  {t('reports.salesReport')}
                </Typography>
              }
              subheader={
                <Typography variant="caption" sx={{ color: '#64748b' }}>
                  Last 7 days sales velocity (INR ₹)
                </Typography>
              }
              action={
                <Stack direction="row" spacing={1} alignItems="center">
                  <Chip label="₹50,850 this week" size="small" sx={{ backgroundColor: '#ecfdf5', color: '#065f46', fontWeight: 700 }} />
                </Stack>
              }
            />
            <Divider />
            <CardContent sx={{ pt: 3, pb: 2, height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={stats?.salesOverview || []}
                  margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#059669" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="day" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                  <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} tickFormatter={(val) => `₹${val}`} />
                  <RechartsTooltip
                    formatter={(val) => [`₹${val}`, 'Sales']}
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderRadius: 8,
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#059669"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Inventory Status Donut Chart */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ height: '100%', borderRadius: 3.5, border: '1px solid #e2e8f0' }}>
            <CardHeader
              title={
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>
                  {t('products.title')}
                </Typography>
              }
              subheader={
                <Typography variant="caption" sx={{ color: '#64748b' }}>
                  Stock status health
                </Typography>
              }
            />
            <Divider />
            <CardContent sx={{ pt: 1, pb: 2, height: 320, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <ResponsiveContainer width="100%" height={230}>
                <PieChart>
                  <Pie
                    data={stats?.inventoryStatus || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {stats?.inventoryStatus?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    formatter={(value, name) => [`${value} SKUs`, name]}
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderRadius: 8,
                      border: '1px solid #e2e8f0',
                    }}
                  />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
              <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                <Typography variant="caption" sx={{ color: '#059669', fontWeight: 700 }}>
                  ● {t('products.inStock')}: {stats?.inventoryStatus?.[0]?.value || 115}
                </Typography>
                <Typography variant="caption" sx={{ color: '#d97706', fontWeight: 700 }}>
                  ● {t('products.runningLow')}: {stats?.inventoryStatus?.[1]?.value || 8}
                </Typography>
                <Typography variant="caption" sx={{ color: '#dc2626', fontWeight: 700 }}>
                  ● {t('products.outOfStock')}: {stats?.inventoryStatus?.[2]?.value || 3}
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Bottom Section: Recent Activity & Low Stock Alerts */}
      <Grid container spacing={3}>
        {/* Recent Activity */}
        <Grid item xs={12} lg={8}>
          <Card sx={{ borderRadius: 3.5, border: '1px solid #e2e8f0' }}>
            <CardHeader
              title={
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>
                  Recent Activity
                </Typography>
              }
              subheader={
                <Typography variant="caption" sx={{ color: '#64748b' }}>
                  Latest customer sales, supplier orders, and adjustments
                </Typography>
              }
              action={
                <Button
                  size="small"
                  endIcon={<ArrowForwardIcon sx={{ fontSize: 16 }} />}
                  onClick={() => navigate('/sales')}
                  sx={{ color: '#2563eb', fontWeight: 700 }}
                >
                  {t('nav.sales')}
                </Button>
              }
            />
            <Divider />
            <Box sx={{ p: 2 }}>
              <TransactionTable transactions={stats?.recentTransactions || []} />
            </Box>
          </Card>
        </Grid>

        {/* Low Stock Alerts */}
        <Grid item xs={12} lg={4}>
          <LowStockAlert
            alerts={stats?.lowStockAlerts || []}
            onRestockClick={(item) => {
              navigate('/purchases', { state: { restockItem: item } });
            }}
          />
        </Grid>
      </Grid>

      {/* AI Stock Photo Analysis Modal */}
      <ScanStockModal
        open={isScanModalOpen}
        onClose={() => setIsScanModalOpen(false)}
        onStockUpdated={loadStats}
      />
    </Box>
  );
};

export default Dashboard;
