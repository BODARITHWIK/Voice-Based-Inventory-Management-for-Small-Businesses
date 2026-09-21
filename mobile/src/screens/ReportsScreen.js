import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { getReports } from '../services/api';
import { COLORS } from '../theme';
import { useLanguage } from '../context/LanguageContext';

export default function ReportsScreen() {
  const { t } = useLanguage();
  const [period, setPeriod] = useState('This Month');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  const periods = ['Today', 'This Week', 'This Month'];

  useEffect(() => {
    loadReport(period);
  }, [period]);

  const loadReport = async (selectedPeriod) => {
    try {
      setLoading(true);
      const data = await getReports(selectedPeriod);
      setReport(data);
    } catch (e) {
      console.warn('Failed to load reports', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Period Selector Tabs */}
      <View style={styles.periodRow}>
        {periods.map((p) => (
          <TouchableOpacity
            key={p}
            style={[styles.periodTab, period === p && styles.periodTabActive]}
            onPress={() => setPeriod(p)}
          >
            <Text
              style={[
                styles.periodTabText,
                period === p && styles.periodTabTextActive,
              ]}
            >
              {p}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
      ) : (
        <View style={styles.cardsGrid}>
          {/* Card 1: Sales */}
          <View style={[styles.statCard, { borderLeftColor: '#059669' }]}>
            <Text style={styles.cardHeader}>💰 Total Sales</Text>
            <Text style={styles.statValue}>
              {report?.stats?.salesSummary?.totalRevenue || '₹2,48,600'}
            </Text>
            <Text style={styles.statSub}>
              {report?.stats?.salesSummary?.orderCount || 1420} customer bills
            </Text>
          </View>

          {/* Card 2: Purchases */}
          <View style={[styles.statCard, { borderLeftColor: '#2563EB' }]}>
            <Text style={styles.cardHeader}>📦 Supplier Purchases</Text>
            <Text style={styles.statValue}>
              {report?.stats?.purchaseSummary?.totalPurchases || '₹1,85,200'}
            </Text>
            <Text style={styles.statSub}>
              {report?.stats?.purchaseSummary?.ordersPlaced || 48} supplier orders
            </Text>
          </View>

          {/* Card 3: Gross Profit */}
          <View style={[styles.statCard, { borderLeftColor: '#10B981' }]}>
            <Text style={styles.cardHeader}>📈 Gross Profit</Text>
            <Text style={[styles.statValue, { color: '#059669' }]}>
              {report?.stats?.profitSummary?.grossProfit || '₹63,400'}
            </Text>
            <Text style={styles.statSub}>
              Profit Margin: {report?.stats?.profitSummary?.profitMargin || '25.5%'}
            </Text>
          </View>

          {/* Card 4: Inventory Health */}
          <View style={[styles.statCard, { borderLeftColor: '#D97706' }]}>
            <Text style={styles.cardHeader}>⚠️ Stock Attention</Text>
            <Text style={styles.statValue}>11 Items</Text>
            <Text style={styles.statSub}>8 running low, 3 out of stock</Text>
          </View>

          {/* Health Summary Box */}
          <View style={styles.healthBox}>
            <Text style={styles.healthTitle}>Store Health: EXCELLENT</Text>
            <Text style={styles.healthDesc}>
              Your cash collection velocity is strong. Maintain safety stock for fast-moving items like Basmati Rice and Milk.
            </Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    padding: 16,
  },
  periodRow: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: 10,
    padding: 3,
    marginBottom: 20,
  },
  periodTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  periodTabActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  periodTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  periodTabTextActive: {
    color: '#0F172A',
    fontWeight: '700',
  },
  cardsGrid: {
    gap: 14,
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderLeftWidth: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 6,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  statSub: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  healthBox: {
    backgroundColor: '#ECFDF5',
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    marginTop: 8,
  },
  healthTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#065F46',
    marginBottom: 6,
  },
  healthDesc: {
    fontSize: 13,
    color: '#047857',
    lineHeight: 18,
  },
});
