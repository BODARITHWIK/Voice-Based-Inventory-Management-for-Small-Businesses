import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  Alert,
  SafeAreaView,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { COLORS, SHADOWS } from '../theme';
import { getCustomers, createCustomer, recordCustomerPayment } from '../services/api';

export default function KhataScreen() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [addCustModal, setAddCustModal] = useState(false);
  const [paymentModal, setPaymentModal] = useState(false);
  const [selectedCust, setSelectedCust] = useState(null);

  // New Customer Form
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  // Payment Form
  const [payAmount, setPayAmount] = useState('');
  const [payType, setPayType] = useState('PAYMENT'); // PAYMENT (deducts debt) or CREDIT (adds debt)
  const [payNotes, setPayNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    setLoading(false);
    try {
      const list = await getCustomers();
      setCustomers(list);
    } catch (e) {
      console.warn('Failed to load khata', e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCustomer = async () => {
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Customer name is required.');
      return;
    }
    setSubmitting(true);
    try {
      await createCustomer({
        name: name.trim(),
        phone: phone.trim(),
        address: address.trim(),
      });
      setName('');
      setPhone('');
      setAddress('');
      setAddCustModal(false);
      loadCustomers();
    } catch (err) {
      Alert.alert('Error', 'Could not create customer.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRecordPayment = async () => {
    const amt = parseFloat(payAmount);
    if (!amt || amt <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount.');
      return;
    }
    setSubmitting(true);
    try {
      await recordCustomerPayment(selectedCust.id, amt, payType, payNotes);
      setPayAmount('');
      setPayNotes('');
      setPaymentModal(false);
      loadCustomers();
      Alert.alert('Success', `Recorded ${payType === 'PAYMENT' ? 'payment' : 'credit'} of ₹${amt}.`);
    } catch (err) {
      Alert.alert('Error', 'Payment recording failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const sendWhatsAppReminder = (cust) => {
    if (!cust.phone) {
      Alert.alert('No Phone', 'This customer does not have a phone number saved.');
      return;
    }
    const cleanPhone = cust.phone.replace(/[^0-9]/g, '');
    const phoneWithCode = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;
    const msg = encodeURIComponent(
      `Namaste ${cust.name}, this is a gentle reminder from Swaranidhi Kirana that your outstanding balance is ₹${cust.currentBalance || 0}. Kindly clear it at your convenience. Thank you!`
    );
    Linking.openURL(`https://wa.me/${phoneWithCode}?text=${msg}`).catch(() => {
      Alert.alert('Error', 'Could not open WhatsApp.');
    });
  };

  const totalOutstanding = customers.reduce(
    (sum, c) => sum + (c.currentBalance > 0 ? Number(c.currentBalance) : 0),
    0
  );

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.phone && c.phone.includes(search))
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Dues Card */}
      <View style={[styles.duesCard, SHADOWS.sm]}>
        <Text style={styles.duesLabel}>Total Outstanding Khata (Udhaar)</Text>
        <Text style={styles.duesValue}>₹{totalOutstanding.toLocaleString('en-IN')}</Text>
        <Text style={styles.duesSub}>{customers.filter((c) => c.currentBalance > 0).length} customer(s) owe money</Text>
      </View>

      {/* Search & Add Bar */}
      <View style={styles.searchBar}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by customer name or phone..."
          value={search}
          onChangeText={setSearch}
        />
        <TouchableOpacity style={styles.addBtn} onPress={() => setAddCustModal(true)}>
          <Text style={styles.addBtnText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {/* Customer List */}
      <ScrollView contentContainerStyle={styles.listContent}>
        {loading ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
        ) : filtered.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={{ fontSize: 32, marginBottom: 8 }}>👤</Text>
            <Text style={{ color: COLORS.textSecondary }}>No customers found</Text>
          </View>
        ) : (
          filtered.map((cust) => {
            const owes = cust.currentBalance > 0;
            return (
              <View key={cust.id} style={[styles.custCard, SHADOWS.sm]}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.custName}>{cust.name}</Text>
                  <Text style={styles.custPhone}>{cust.phone || 'No phone'}</Text>
                  {cust.address && <Text style={styles.custAddr}>{cust.address}</Text>}
                </View>

                <View style={styles.balanceCol}>
                  <Text style={[styles.balanceValue, owes ? styles.balanceDue : styles.balanceClean]}>
                    ₹{cust.currentBalance || 0}
                  </Text>
                  <Text style={styles.balanceStatus}>{owes ? 'DUE' : 'CLEAR'}</Text>
                </View>

                <View style={styles.actionCol}>
                  <TouchableOpacity
                    style={styles.payBtn}
                    onPress={() => {
                      setSelectedCust(cust);
                      setPaymentModal(true);
                    }}
                  >
                    <Text style={styles.payBtnText}>Record</Text>
                  </TouchableOpacity>
                  {owes && cust.phone && (
                    <TouchableOpacity
                      style={styles.waBtn}
                      onPress={() => sendWhatsAppReminder(cust)}
                    >
                      <Text style={styles.waBtnText}>📲 WA</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Add Customer Modal */}
      <Modal visible={addCustModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, SHADOWS.md]}>
            <Text style={styles.modalTitle}>Add New Khata Customer</Text>
            <TextInput
              style={styles.formInput}
              placeholder="Full Name *"
              value={name}
              onChangeText={setName}
            />
            <TextInput
              style={styles.formInput}
              placeholder="Phone Number (10 digits)"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />
            <TextInput
              style={styles.formInput}
              placeholder="Address / Colony"
              value={address}
              onChangeText={setAddress}
            />
            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setAddCustModal(false)}>
                <Text style={{ color: COLORS.textSecondary }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitBtn} onPress={handleAddCustomer} disabled={submitting}>
                <Text style={{ color: '#FFFFFF', fontWeight: 'bold' }}>Save Customer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Record Payment/Credit Modal */}
      <Modal visible={paymentModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, SHADOWS.md]}>
            <Text style={styles.modalTitle}>Khata Transaction</Text>
            <Text style={{ fontSize: 14, color: COLORS.textSecondary, marginBottom: 12 }}>
              Customer: <Text style={{ fontWeight: 'bold', color: COLORS.text }}>{selectedCust?.name}</Text>
            </Text>

            {/* Type selector */}
            <View style={styles.typeRow}>
              <TouchableOpacity
                style={[styles.typeOption, payType === 'PAYMENT' && styles.typePaymentActive]}
                onPress={() => setPayType('PAYMENT')}
              >
                <Text style={[styles.typeText, payType === 'PAYMENT' && { color: '#FFFFFF' }]}>
                  Received Payment (-)
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.typeOption, payType === 'CREDIT' && styles.typeCreditActive]}
                onPress={() => setPayType('CREDIT')}
              >
                <Text style={[styles.typeText, payType === 'CREDIT' && { color: '#FFFFFF' }]}>
                  Gave Credit (+)
                </Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.formInput}
              placeholder="Amount (₹) *"
              keyboardType="numeric"
              value={payAmount}
              onChangeText={setPayAmount}
            />
            <TextInput
              style={styles.formInput}
              placeholder="Notes (e.g., GPay, Cash, Ration)"
              value={payNotes}
              onChangeText={setPayNotes}
            />

            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setPaymentModal(false)}>
                <Text style={{ color: COLORS.textSecondary }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitBtn} onPress={handleRecordPayment} disabled={submitting}>
                <Text style={{ color: '#FFFFFF', fontWeight: 'bold' }}>Confirm Entry</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  duesCard: {
    backgroundColor: '#7F1D1D',
    margin: 16,
    borderRadius: 16,
    padding: 18,
  },
  duesLabel: {
    color: '#FECDD3',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  duesValue: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: 'bold',
    marginVertical: 4,
  },
  duesSub: {
    color: '#FCA5A5',
    fontSize: 12,
  },
  searchBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 8,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    fontSize: 13,
  },
  addBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 13,
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  emptyBox: {
    alignItems: 'center',
    marginTop: 50,
  },
  custCard: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  custName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  custPhone: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  custAddr: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  balanceCol: {
    alignItems: 'flex-end',
    marginHorizontal: 10,
  },
  balanceValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  balanceDue: {
    color: COLORS.danger,
  },
  balanceClean: {
    color: COLORS.success,
  },
  balanceStatus: {
    fontSize: 10,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  actionCol: {
    gap: 6,
  },
  payBtn: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  payBtnText: {
    color: COLORS.primary,
    fontWeight: 'bold',
    fontSize: 11,
  },
  waBtn: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  waBtnText: {
    color: '#15803D',
    fontWeight: 'bold',
    fontSize: 11,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    width: '100%',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 14,
  },
  formInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    fontSize: 13,
  },
  typeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  typeOption: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  typePaymentActive: {
    backgroundColor: COLORS.success,
  },
  typeCreditActive: {
    backgroundColor: COLORS.danger,
  },
  typeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  modalBtns: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 8,
  },
  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  submitBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 18,
  },
});
