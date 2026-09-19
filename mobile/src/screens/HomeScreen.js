import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { COLORS, SHADOWS } from '../theme';
import { getSmartAlerts, getProducts, getTodaySalesSummary, syncOfflineQueue, getOfflineQueue } from '../services/api';

export default function HomeScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [todaySales, setTodaySales] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);
  const [alerts, setAlerts] = useState({
    lowStock: [],
    outOfStock: [],
    expiry: { expired: [], expiringSoon: [] },
    totalAlerts: 0,
  });
  const [offlinePending, setOfflinePending] = useState(0);

  const loadDashboardData = async () => {
    try {
      const [alertsData, productsData, salesSummary, offlineQueue] = await Promise.allSettled([
        getSmartAlerts(),
        getProducts(),
        getTodaySalesSummary(),
        getOfflineQueue(),
      ]);

      if (alertsData.status === 'fulfilled' && alertsData.value) {
        setAlerts(alertsData.value);
      }
      if (productsData.status === 'fulfilled' && productsData.value) {
        setTotalProducts(productsData.value.length || 0);
      }
      if (salesSummary.status === 'fulfilled' && salesSummary.value) {
        const sales = salesSummary.value.todaySales || salesSummary.value.totalRevenue || 0;
        setTodaySales(sales);
      }
      if (offlineQueue.status === 'fulfilled' && offlineQueue.value) {
        setOfflinePending(offlineQueue.value.length || 0);
      }
    } catch (err) {
      console.warn('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    syncOfflineQueue().then(() => loadDashboardData());
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning 👋';
    if (hour < 17) return 'Good afternoon ☀️';
    return 'Good evening 🌙';
  };

  const quickActions = [
    {
      id: 'voice',
      label: 'Speak',
      icon: '🎤',
      subtext: 'Multilingual Voice',
      bg: '#EEF2FF',
      border: '#C7D2FE',
      onPress: () => navigation.navigate('VoiceAssistant'),
    },
    {
      id: 'scan',
      label: 'Scan Stock',
      icon: '📷',
      subtext: 'AI Photo Analysis',
      bg: '#ECFDF5',
      border: '#A7F3D0',
      onPress: () => navigation.navigate('ScanStock'),
    },
    {
      id: 'add_stock',
      label: 'Add Stock',
      icon: '➕',
      subtext: 'Manual Entry',
      bg: '#FEF3C7',
      border: '#FDE68A',
      onPress: () => navigation.navigate('Products', { filter: 'add' }),
    },
    {
      id: 'billing',
      label: 'New Sale',
      icon: '🛒',
      subtext: 'POS Billing & GST',
      bg: '#EFF6FF',
      border: '#BFDBFE',
      onPress: () => navigation.navigate('Billing'),
    },
    {
      id: 'khata',
      label: 'Khata',
      icon: '👤',
      subtext: 'Customer Ledger',
      bg: '#FFF1F2',
      border: '#FECDD3',
      onPress: () => navigation.navigate('Khata'),
    },
    {
      id: 'products',
      label: 'Products',
      icon: '📦',
      subtext: 'Stock & Expiry',
      bg: '#F3E8FF',
      border: '#E9D5FF',
      onPress: () => navigation.navigate('Products'),
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primaryDark} />

      {/* Header Bar */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greetingText}>{getGreeting()}</Text>
          <Text style={styles.shopTitle}>Swaranidhi Kirana</Text>
        </View>
        <TouchableOpacity
          style={styles.bellButton}
          onPress={() => navigation.navigate('Alerts')}
        >
          <Text style={styles.bellIcon}>🔔</Text>
          {alerts.totalAlerts > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{alerts.totalAlerts}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
      >
        {/* Offline Queue Sync Bar */}
        {offlinePending > 0 && (
          <TouchableOpacity
            style={styles.offlineBanner}
            onPress={() => syncOfflineQueue().then(() => loadDashboardData())}
          >
            <Text style={styles.offlineText}>
              📶 {offlinePending} action(s) stored offline. Tap to sync now.
            </Text>
          </TouchableOpacity>
        )}

        {/* KPI Cards Row */}
        <View style={styles.kpiRow}>
          {/* Today's Sales */}
          <View style={[styles.kpiCard, SHADOWS.sm]}>
            <Text style={styles.kpiLabel}>Today's Sales</Text>
            <Text style={styles.kpiValue}>₹{Number(todaySales).toLocaleString('en-IN')}</Text>
            <View style={styles.kpiPill}>
              <Text style={styles.kpiPillText}>Live Revenue</Text>
            </View>
          </View>

          {/* Low Stock */}
          <TouchableOpacity
            style={[styles.kpiCard, SHADOWS.sm, alerts.lowStock?.length > 0 && styles.kpiCardWarning]}
            onPress={() => navigation.navigate('Alerts', { tab: 'low_stock' })}
          >
            <Text style={styles.kpiLabel}>Low Stock</Text>
            <Text style={[styles.kpiValue, { color: alerts.lowStock?.length > 0 ? COLORS.danger : COLORS.text }]}>
              {alerts.lowStock?.length || 0}
            </Text>
            <View style={[styles.kpiPill, { backgroundColor: alerts.lowStock?.length > 0 ? COLORS.dangerLight : '#F1F5F9' }]}>
              <Text style={[styles.kpiPillText, { color: alerts.lowStock?.length > 0 ? COLORS.danger : COLORS.textSecondary }]}>
                {alerts.lowStock?.length > 0 ? 'Needs Attention' : 'Healthy'}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Total Products */}
          <TouchableOpacity
            style={[styles.kpiCard, SHADOWS.sm]}
            onPress={() => navigation.navigate('Products')}
          >
            <Text style={styles.kpiLabel}>Total Items</Text>
            <Text style={styles.kpiValue}>{totalProducts}</Text>
            <View style={styles.kpiPill}>
              <Text style={styles.kpiPillText}>In Catalog</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Smart Alerts Banner */}
        {alerts.totalAlerts > 0 && (
          <TouchableOpacity
            style={[styles.alertBanner, SHADOWS.sm]}
            onPress={() => navigation.navigate('Alerts')}
          >
            <View style={styles.alertIconBox}>
              <Text style={styles.alertEmoji}>⚠️</Text>
            </View>
            <View style={styles.alertTextBox}>
              <Text style={styles.alertTitle}>Smart Inventory Alert</Text>
              <Text style={styles.alertSubtitle}>
                {alerts.lowStock?.length > 0 ? `${alerts.lowStock.length} low in stock. ` : ''}
                {alerts.expiry?.expired?.length > 0 ? `${alerts.expiry.expired.length} expired items. ` : ''}
                {alerts.expiry?.expiringSoon?.length > 0 ? `${alerts.expiry.expiringSoon.length} expiring soon.` : ''}
              </Text>
            </View>
            <Text style={styles.alertActionText}>View ›</Text>
          </TouchableOpacity>
        )}

        {/* Section Title */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <Text style={styles.sectionSubtitle}>Tap an action to get started</Text>
        </View>

        {/* 6-Pack Quick Actions Grid */}
        <View style={styles.gridContainer}>
          {quickActions.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={[
                styles.actionCard,
                SHADOWS.sm,
                { backgroundColor: action.bg, borderColor: action.border },
              ]}
              onPress={action.onPress}
              activeOpacity={0.8}
            >
              <View style={styles.iconCircle}>
                <Text style={styles.actionIcon}>{action.icon}</Text>
              </View>
              <Text style={styles.actionLabel}>{action.label}</Text>
              <Text style={styles.actionSubtext}>{action.subtext}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* AI Query Shortcut Card */}
        <TouchableOpacity
          style={[styles.assistantCard, SHADOWS.md]}
          onPress={() => navigation.navigate('VoiceAssistant')}
        >
          <View style={styles.assistantHeader}>
            <Text style={styles.assistantSparkle}>✨</Text>
            <Text style={styles.assistantTitle}>Swaranidhi AI Assistant</Text>
          </View>
          <Text style={styles.assistantPrompt}>
            "Ask me anything: Today's sales, low stock alerts, or customer dues."
          </Text>
          <View style={styles.assistantButton}>
            <Text style={styles.assistantButtonText}>Ask Question 🎤</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.primaryDark,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  greetingText: {
    fontSize: 14,
    color: '#93C5FD',
    fontWeight: '500',
  },
  shopTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 2,
  },
  bellButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  bellIcon: {
    fontSize: 20,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: COLORS.danger,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  offlineBanner: {
    backgroundColor: COLORS.warningLight,
    borderColor: COLORS.warning,
    borderWidth: 1,
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  offlineText: {
    fontSize: 13,
    color: '#C2410C',
    fontWeight: '600',
    textAlign: 'center',
  },
  kpiRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -8,
    marginBottom: 16,
    gap: 8,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  kpiCardWarning: {
    borderColor: '#FECDD3',
    backgroundColor: '#FFF1F2',
  },
  kpiLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  kpiValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginVertical: 4,
  },
  kpiPill: {
    backgroundColor: '#F1F5F9',
    borderRadius: 6,
    paddingVertical: 2,
    paddingHorizontal: 6,
    alignSelf: 'flex-start',
  },
  kpiPillText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  alertBanner: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  alertIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  alertEmoji: {
    fontSize: 18,
  },
  alertTextBox: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#92400E',
  },
  alertSubtitle: {
    fontSize: 12,
    color: '#B45309',
    marginTop: 2,
  },
  alertActionText: {
    fontSize: 16,
    color: '#B45309',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  actionCard: {
    width: '48%',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  actionIcon: {
    fontSize: 22,
  },
  actionLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  actionSubtext: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  assistantCard: {
    backgroundColor: '#1E1B4B',
    borderRadius: 18,
    padding: 18,
    marginBottom: 20,
  },
  assistantHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  assistantSparkle: {
    fontSize: 20,
    marginRight: 6,
  },
  assistantTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E0E7FF',
  },
  assistantPrompt: {
    fontSize: 13,
    color: '#C7D2FE',
    lineHeight: 18,
    marginBottom: 14,
  },
  assistantButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
  },
  assistantButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 13,
  },
});
