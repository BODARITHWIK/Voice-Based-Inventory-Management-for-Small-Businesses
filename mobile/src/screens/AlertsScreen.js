import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import { COLORS, SHADOWS } from '../theme';
import { getSmartAlerts, removeExpiredStock } from '../services/api';

export default function AlertsScreen({ route }) {
  const [alerts, setAlerts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState(route?.params?.tab || 'all');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    try {
      const data = await getSmartAlerts();
      setAlerts(data);
    } catch (e) {
      console.warn('Failed to load alerts', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRemoveExpired = async (productId = null) => {
    Alert.alert(
      'Confirm Expired Stock Removal',
      productId
        ? 'Are you sure you want to write off this expired stock item?'
        : 'Are you sure you want to write off ALL expired stock items?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Write Off',
          style: 'destructive',
          onPress: async () => {
            setActionLoading(true);
            try {
              const res = await removeExpiredStock(productId);
              Alert.alert(
                'Stock Written Off ✅',
                `Successfully removed ${res?.removedProductsCount || 1} product(s). Total units written off: ${res?.totalQuantityWrittenOff || 0}.`
              );
              loadAlerts();
            } catch (err) {
              Alert.alert('Error', 'Failed to remove expired stock.');
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Tab Switcher */}
      <View style={styles.tabRow}>
        {[
          { key: 'all', label: 'All Alerts' },
          { key: 'expiry', label: 'Expiry' },
          { key: 'low_stock', label: 'Low Stock' },
          { key: 'fast_moving', label: 'Fast Moving' },
        ].map((t) => (
          <TouchableOpacity
            key={t.key}
            style={[styles.tabBtn, activeTab === t.key && styles.tabBtnActive]}
            onPress={() => setActiveTab(t.key)}
          >
            <Text style={[styles.tabText, activeTab === t.key && styles.tabTextActive]}>
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadAlerts(); }} />}
      >
        {loading ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
        ) : (
          <>
            {/* EXPIRED ITEMS SECTION */}
            {(activeTab === 'all' || activeTab === 'expiry') && alerts?.expiry?.expired?.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeaderRow}>
                  <Text style={[styles.sectionTitle, { color: COLORS.danger }]}>
                    ⚠️ Expired Products ({alerts.expiry.expired.length})
                  </Text>
                  <TouchableOpacity
                    style={styles.removeAllBtn}
                    onPress={() => handleRemoveExpired(null)}
                    disabled={actionLoading}
                  >
                    <Text style={styles.removeAllText}>Write Off All</Text>
                  </TouchableOpacity>
                </View>

                {alerts.expiry.expired.map((item) => (
                  <View key={item.id} style={[styles.alertCard, styles.alertCardExpired, SHADOWS.sm]}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.alertName}>{item.name}</Text>
                      <Text style={styles.alertDetail}>
                        Expired: {item.expiryDate} • Qty: {item.quantity} {item.unit || 'units'}
                      </Text>
                      {item.batchNumber && (
                        <Text style={styles.alertBatch}>Batch: {item.batchNumber}</Text>
                      )}
                    </View>
                    <TouchableOpacity
                      style={styles.writeOffSingleBtn}
                      onPress={() => handleRemoveExpired(item.id)}
                    >
                      <Text style={styles.writeOffSingleText}>Write Off</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            {/* EXPIRING SOON SECTION */}
            {(activeTab === 'all' || activeTab === 'expiry') && alerts?.expiry?.expiringSoon?.length > 0 && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: '#D97706' }]}>
                  ⏳ Expiring Within 7 Days ({alerts.expiry.expiringSoon.length})
                </Text>
                {alerts.expiry.expiringSoon.map((item) => (
                  <View key={item.id} style={[styles.alertCard, styles.alertCardExpiring, SHADOWS.sm]}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.alertName}>{item.name}</Text>
                      <Text style={styles.alertDetail}>
                        Expires: {item.expiryDate} • Stock: {item.quantity} {item.unit || 'units'}
                      </Text>
                    </View>
                    <View style={styles.soonPill}>
                      <Text style={styles.soonPillText}>Action: Discount / Clear</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* LOW STOCK SECTION */}
            {(activeTab === 'all' || activeTab === 'low_stock') && alerts?.lowStock?.length > 0 && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: COLORS.warning }]}>
                  📉 Low Stock ({alerts.lowStock.length})
                </Text>
                {alerts.lowStock.map((item) => (
                  <View key={item.id} style={[styles.alertCard, SHADOWS.sm]}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.alertName}>{item.name}</Text>
                      <Text style={styles.alertDetail}>
                        Only {item.quantity} {item.unit || 'units'} remaining (Min: {item.minimumStock || 10})
                      </Text>
                    </View>
                    <View style={styles.reorderPill}>
                      <Text style={styles.reorderPillText}>Reorder</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* FAST MOVING PRODUCTS SECTION */}
            {(activeTab === 'all' || activeTab === 'fast_moving') && alerts?.fastMoving?.length > 0 && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: COLORS.success }]}>
                  🔥 Top Selling / Fast Moving (7 Days)
                </Text>
                {alerts.fastMoving.map((item, idx) => (
                  <View key={idx} style={[styles.alertCard, SHADOWS.sm]}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.alertName}>{item.name}</Text>
                      <Text style={styles.alertDetail}>
                        Sold {item.soldQuantity} units in 7 days (Velocity: {(item.salesVelocity || 0).toFixed(1)}/day)
                      </Text>
                    </View>
                    <View style={styles.velocityPill}>
                      <Text style={styles.velocityPillText}>Stock: {item.currentStock}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {alerts?.totalAlerts === 0 && (
              <View style={styles.emptyAlertsBox}>
                <Text style={{ fontSize: 40, marginBottom: 12 }}>🎉</Text>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: COLORS.text }}>
                  Everything looks healthy!
                </Text>
                <Text style={{ color: COLORS.textSecondary, fontSize: 13, marginTop: 4 }}>
                  No low stock, out-of-stock, or expired products currently detected.
                </Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabBtnActive: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  removeAllBtn: {
    backgroundColor: COLORS.dangerLight,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
  },
  removeAllText: {
    color: COLORS.danger,
    fontSize: 12,
    fontWeight: 'bold',
  },
  alertCard: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  alertCardExpired: {
    borderColor: '#FECDD3',
    backgroundColor: '#FFF1F2',
  },
  alertCardExpiring: {
    borderColor: '#FDE68A',
    backgroundColor: '#FFFBEB',
  },
  alertName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  alertDetail: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  alertBatch: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  writeOffSingleBtn: {
    backgroundColor: COLORS.danger,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  writeOffSingleText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 12,
  },
  soonPill: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  soonPillText: {
    color: '#92400E',
    fontSize: 11,
    fontWeight: '600',
  },
  reorderPill: {
    backgroundColor: '#FFEDD5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  reorderPillText: {
    color: '#C2410C',
    fontSize: 11,
    fontWeight: 'bold',
  },
  velocityPill: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  velocityPillText: {
    color: '#047857',
    fontSize: 11,
    fontWeight: 'bold',
  },
  emptyAlertsBox: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 30,
    alignItems: 'center',
    marginTop: 30,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
});
