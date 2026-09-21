import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { getPurchases, createPurchase } from '../services/api';
import { COLORS } from '../theme';
import { useLanguage } from '../context/LanguageContext';

export default function PurchasesScreen() {
  const { t } = useLanguage();
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    supplierName: '',
    products: '',
    quantity: '10',
    amount: '',
  });

  useEffect(() => {
    loadPurchases();
  }, []);

  const loadPurchases = async () => {
    try {
      setLoading(true);
      const data = await getPurchases();
      setPurchases(data);
    } catch (e) {
      console.warn('Failed to load purchases', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePurchase = async () => {
    if (!form.supplierName.trim() || !form.products.trim() || !form.amount.trim()) {
      Alert.alert('Missing Fields', 'Please enter supplier, item, and total amount.');
      return;
    }

    try {
      setSaving(true);
      await createPurchase({
        supplierName: form.supplierName.trim(),
        products: form.products.trim(),
        quantity: parseInt(form.quantity, 10) || 1,
        amount: parseFloat(form.amount) || 0,
        paymentMethod: 'CASH',
      });
      setModalVisible(false);
      setForm({ supplierName: '', products: '', quantity: '10', amount: '' });
      loadPurchases();
      Alert.alert('Success', 'Stock purchase recorded successfully!');
    } catch (e) {
      Alert.alert('Error', 'Failed to record purchase. Stored offline if offline.');
    } finally {
      setSaving(false);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.supplierName}>{item.supplierName || item.supplier || 'Distributor'}</Text>
        <Text style={styles.amount}>₹{item.amount || item.totalCost || '0'}</Text>
      </View>
      <Text style={styles.products}>{item.products || item.itemsOrdered || 'Inventory Items'}</Text>
      <View style={styles.cardFooter}>
        <Text style={styles.date}>{item.date || item.createdAt || 'Recent'}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{item.status || 'Received'}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Action Bar */}
      <View style={styles.topBar}>
        <Text style={styles.sectionTitle}>{t('purchases')}</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.addBtnText}>+ Inward Stock</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={purchases}
          keyExtractor={(item, idx) => String(item.id || idx)}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No purchases recorded yet.</Text>
            </View>
          }
        />
      )}

      {/* Inward Stock Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Record Stock Purchase</Text>

            <Text style={styles.label}>Wholesale Supplier</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Lakshmi Agro Mandi"
              placeholderTextColor="#94A3B8"
              value={form.supplierName}
              onChangeText={(v) => setForm({ ...form, supplierName: v })}
            />

            <Text style={styles.label}>Product / Goods Received</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 50 kg Basmati Rice"
              placeholderTextColor="#94A3B8"
              value={form.products}
              onChangeText={(v) => setForm({ ...form, products: v })}
            />

            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.label}>Quantity</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  placeholder="10"
                  placeholderTextColor="#94A3B8"
                  value={form.quantity}
                  onChangeText={(v) => setForm({ ...form, quantity: v })}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Total Cost (₹)</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  placeholder="2400"
                  placeholderTextColor="#94A3B8"
                  value={form.amount}
                  onChangeText={(v) => setForm({ ...form, amount: v })}
                />
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelBtnText}>{t('cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveBtn}
                onPress={handleSavePurchase}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.saveBtnText}>{t('save')}</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  addBtn: {
    backgroundColor: '#059669',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  listContent: {
    padding: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  supplierName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  amount: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2563EB',
  },
  products: {
    fontSize: 13,
    color: '#475569',
    marginBottom: 10,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 8,
  },
  date: {
    fontSize: 12,
    color: '#94A3B8',
  },
  badge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  badgeText: {
    color: '#065F46',
    fontSize: 11,
    fontWeight: '700',
  },
  empty: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyText: {
    color: '#94A3B8',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
    gap: 12,
  },
  cancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  cancelBtnText: {
    color: '#64748B',
    fontWeight: '600',
  },
  saveBtn: {
    backgroundColor: '#059669',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
