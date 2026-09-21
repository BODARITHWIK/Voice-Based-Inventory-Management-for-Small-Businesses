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
  Linking,
} from 'react-native';
import { getSuppliers, createSupplier } from '../services/api';
import { COLORS } from '../theme';
import { useLanguage } from '../context/LanguageContext';

export default function SuppliersScreen() {
  const { t } = useLanguage();
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: '',
    contactPerson: '',
    phone: '',
    address: '',
    gstNumber: '',
  });

  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = async () => {
    try {
      setLoading(true);
      const data = await getSuppliers();
      setSuppliers(data);
    } catch (e) {
      console.warn('Failed to load suppliers', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSupplier = async () => {
    if (!form.name.trim() || !form.phone.trim()) {
      Alert.alert('Missing Fields', 'Please enter supplier name and phone number.');
      return;
    }

    try {
      setSaving(true);
      await createSupplier(form);
      setModalVisible(false);
      setForm({ name: '', contactPerson: '', phone: '', address: '', gstNumber: '' });
      loadSuppliers();
      Alert.alert('Success', 'Supplier saved successfully!');
    } catch (e) {
      Alert.alert('Error', 'Failed to save supplier.');
    } finally {
      setSaving(false);
    }
  };

  const handleCall = (phone) => {
    if (phone) {
      Linking.openURL(`tel:${phone}`);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{item.name}</Text>
          {item.contactPerson ? (
            <Text style={styles.rep}>Rep: {item.contactPerson}</Text>
          ) : null}
        </View>
        <TouchableOpacity
          style={styles.callBtn}
          onPress={() => handleCall(item.phone)}
        >
          <Text style={styles.callBtnText}>📞 Call</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.phone}>📱 {item.phone}</Text>
      {item.address ? <Text style={styles.address}>📍 {item.address}</Text> : null}

      <View style={styles.cardFooter}>
        <Text style={styles.dueLabel}>Outstanding:</Text>
        <Text
          style={[
            styles.dueAmount,
            { color: item.outstandingAmount === '₹0' || !item.outstandingAmount ? '#059669' : '#DC2626' },
          ]}
        >
          {item.outstandingAmount || '₹0'}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.sectionTitle}>{t('suppliers')}</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.addBtnText}>+ Add Supplier</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={suppliers}
          keyExtractor={(item, idx) => String(item.id || idx)}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No wholesale suppliers found.</Text>
            </View>
          }
        />
      )}

      {/* Add Supplier Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Wholesale Supplier</Text>

            <Text style={styles.label}>Business / Mandi Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Sri Balaji Agro Traders"
              placeholderTextColor="#94A3B8"
              value={form.name}
              onChangeText={(v) => setForm({ ...form, name: v })}
            />

            <Text style={styles.label}>Contact Person / Rep</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Venkat Rao"
              placeholderTextColor="#94A3B8"
              value={form.contactPerson}
              onChangeText={(v) => setForm({ ...form, contactPerson: v })}
            />

            <Text style={styles.label}>Phone Number *</Text>
            <TextInput
              style={styles.input}
              keyboardType="phone-pad"
              placeholder="+91 98480 12345"
              placeholderTextColor="#94A3B8"
              value={form.phone}
              onChangeText={(v) => setForm({ ...form, phone: v })}
            />

            <Text style={styles.label}>Address / Mandi Yard</Text>
            <TextInput
              style={styles.input}
              placeholder="APMC Yard, Guntur"
              placeholderTextColor="#94A3B8"
              value={form.address}
              onChangeText={(v) => setForm({ ...form, address: v })}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelBtnText}>{t('cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveBtn}
                onPress={handleSaveSupplier}
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
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  rep: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  callBtn: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  callBtnText: {
    color: '#2563EB',
    fontWeight: '700',
    fontSize: 12,
  },
  phone: {
    fontSize: 13,
    color: '#334155',
    marginBottom: 4,
  },
  address: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 8,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 8,
  },
  dueLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  dueAmount: {
    fontSize: 14,
    fontWeight: '800',
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
