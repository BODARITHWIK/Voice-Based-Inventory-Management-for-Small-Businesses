import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Modal,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { COLORS, SHADOWS } from '../theme';
import { getProducts, getCustomers, createSale } from '../services/api';

export default function BillingScreen({ navigation }) {
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [cart, setCart] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('CASH'); // CASH, UPI, KHATA
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [invoiceModalVisible, setInvoiceModalVisible] = useState(false);
  const [lastInvoice, setLastInvoice] = useState(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [prodRes, custRes] = await Promise.all([getProducts(), getCustomers()]);
      setProducts(prodRes);
      setCustomers(custRes);
    } catch (e) {
      console.warn('Billing load error', e);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product) => {
    const existing = cart.find((item) => item.id === product.id);
    if (existing) {
      setCart(
        cart.map((item) =>
          item.id === product.id ? { ...item, cartQty: item.cartQty + 1 } : item
        )
      );
    } else {
      setCart([...cart, { ...product, cartQty: 1 }]);
    }
  };

  const updateCartQty = (productId, delta) => {
    setCart(
      cart
        .map((item) => {
          if (item.id === productId) {
            const newQty = item.cartQty + delta;
            return newQty > 0 ? { ...item, cartQty: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const subtotal = cart.reduce(
    (sum, item) => sum + (item.sellingPrice || 0) * item.cartQty,
    0
  );
  const gst = Math.round(subtotal * 0.05 * 100) / 100; // 5% estimate
  const grandTotal = subtotal + gst;

  const handleCheckout = async () => {
    if (cart.length === 0) {
      Alert.alert('Empty Cart', 'Please add at least one item to checkout.');
      return;
    }

    if (paymentMethod === 'KHATA' && !selectedCustomer) {
      Alert.alert('Customer Required', 'Please select a customer for Khata (Credit) sales.');
      return;
    }

    setSubmitting(true);
    try {
      const salePayload = {
        customerId: selectedCustomer?.id || null,
        paymentMethod: paymentMethod === 'KHATA' ? 'CREDIT' : paymentMethod,
        items: cart.map((c) => ({
          productId: c.id,
          quantity: c.cartQty,
          unitPrice: c.sellingPrice,
        })),
        notes: `Mobile POS Sale (${paymentMethod})`,
      };

      const result = await createSale(salePayload);
      setLastInvoice({
        invoiceNumber: result?.invoiceNumber || 'INV-' + Date.now().toString().slice(-6),
        customerName: selectedCustomer ? selectedCustomer.name : 'Walk-in Customer',
        items: [...cart],
        subtotal,
        gst,
        grandTotal,
        paymentMethod,
        date: new Date().toLocaleString(),
      });
      setInvoiceModalVisible(true);
      setCart([]);
      setSelectedCustomer(null);
    } catch (err) {
      Alert.alert('Sale Creation Failed', 'Could not record sale. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Search & Cart Row */}
      <View style={styles.searchSection}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search products to bill..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Product Quick-Add Chips */}
      <View style={styles.chipRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
          {filteredProducts.slice(0, 10).map((prod) => (
            <TouchableOpacity
              key={prod.id}
              style={[styles.productChip, SHADOWS.sm]}
              onPress={() => addToCart(prod)}
            >
              <Text style={styles.chipName}>{prod.name}</Text>
              <Text style={styles.chipPrice}>₹{prod.sellingPrice} +</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Cart Items List */}
      <ScrollView contentContainerStyle={styles.cartContainer}>
        <Text style={styles.cartHeading}>
          Current Order ({cart.reduce((s, i) => s + i.cartQty, 0)} items)
        </Text>

        {cart.length === 0 ? (
          <View style={styles.emptyCartBox}>
            <Text style={styles.emptyEmoji}>🛒</Text>
            <Text style={styles.emptyText}>Cart is empty. Tap products above to add.</Text>
          </View>
        ) : (
          cart.map((item) => (
            <View key={item.id} style={[styles.cartItemCard, SHADOWS.sm]}>
              <View style={{ flex: 1 }}>
                <Text style={styles.cartItemName}>{item.name}</Text>
                <Text style={styles.cartItemRate}>
                  ₹{item.sellingPrice} / {item.unit || 'unit'}
                </Text>
              </View>
              <View style={styles.stepper}>
                <TouchableOpacity style={styles.stepBtn} onPress={() => updateCartQty(item.id, -1)}>
                  <Text style={styles.stepText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.qtyText}>{item.cartQty}</Text>
                <TouchableOpacity style={styles.stepBtn} onPress={() => updateCartQty(item.id, 1)}>
                  <Text style={styles.stepText}>+</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.itemTotal}>₹{(item.sellingPrice * item.cartQty).toFixed(2)}</Text>
            </View>
          ))
        )}

        {/* Customer & Payment Mode Selector */}
        <View style={[styles.paymentCard, SHADOWS.sm]}>
          <Text style={styles.sectionSub}>Customer Account</Text>
          <View style={styles.customerSelector}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              <TouchableOpacity
                style={[styles.custChip, !selectedCustomer && styles.custChipActive]}
                onPress={() => setSelectedCustomer(null)}
              >
                <Text style={[styles.custChipText, !selectedCustomer && styles.custChipTextActive]}>
                  Walk-in (Cash)
                </Text>
              </TouchableOpacity>
              {customers.map((c) => (
                <TouchableOpacity
                  key={c.id}
                  style={[styles.custChip, selectedCustomer?.id === c.id && styles.custChipActive]}
                  onPress={() => setSelectedCustomer(c)}
                >
                  <Text style={[styles.custChipText, selectedCustomer?.id === c.id && styles.custChipTextActive]}>
                    {c.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <Text style={[styles.sectionSub, { marginTop: 12 }]}>Payment Method</Text>
          <View style={styles.methodRow}>
            {['CASH', 'UPI', 'KHATA'].map((m) => (
              <TouchableOpacity
                key={m}
                style={[styles.methodBtn, paymentMethod === m && styles.methodBtnActive]}
                onPress={() => setPaymentMethod(m)}
              >
                <Text style={[styles.methodText, paymentMethod === m && styles.methodTextActive]}>
                  {m === 'CASH' ? '💵 Cash' : m === 'UPI' ? '📱 UPI' : '👤 Khata'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Totals Summary */}
        <View style={[styles.summaryCard, SHADOWS.sm]}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryVal}>₹{subtotal.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Estimated GST (5%)</Text>
            <Text style={styles.summaryVal}>₹{gst.toFixed(2)}</Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total Payable</Text>
            <Text style={styles.totalVal}>₹{grandTotal.toFixed(2)}</Text>
          </View>
        </View>

        {/* Checkout Button */}
        <TouchableOpacity
          style={[styles.checkoutBtn, SHADOWS.md]}
          onPress={handleCheckout}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.checkoutText}>
              Complete Sale • ₹{grandTotal.toFixed(2)}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Digital Receipt Modal */}
      <Modal visible={invoiceModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.receiptCard, SHADOWS.md]}>
            <Text style={styles.receiptHeader}>🧾 Swaranidhi Kirana</Text>
            <Text style={styles.receiptSub}>Invoice: {lastInvoice?.invoiceNumber}</Text>
            <Text style={styles.receiptSub}>{lastInvoice?.date}</Text>
            <Text style={styles.receiptSub}>Customer: {lastInvoice?.customerName}</Text>
            <View style={styles.divider} />

            {lastInvoice?.items.map((it, idx) => (
              <View key={idx} style={styles.receiptItemRow}>
                <Text style={{ flex: 1, fontSize: 13 }}>
                  {it.name} x {it.cartQty}
                </Text>
                <Text style={{ fontSize: 13, fontWeight: 'bold' }}>
                  ₹{(it.sellingPrice * it.cartQty).toFixed(2)}
                </Text>
              </View>
            ))}

            <View style={styles.divider} />
            <View style={styles.receiptItemRow}>
              <Text style={{ fontWeight: 'bold' }}>Total Amount</Text>
              <Text style={{ fontWeight: 'bold', fontSize: 16, color: COLORS.success }}>
                ₹{lastInvoice?.grandTotal.toFixed(2)} ({lastInvoice?.paymentMethod})
              </Text>
            </View>

            <TouchableOpacity
              style={styles.closeReceiptBtn}
              onPress={() => setInvoiceModalVisible(false)}
            >
              <Text style={styles.closeReceiptText}>Done / New Bill</Text>
            </TouchableOpacity>
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
  searchSection: {
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  searchInput: {
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
  },
  chipRow: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  productChip: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  chipPrice: {
    fontSize: 11,
    color: COLORS.primary,
    marginTop: 2,
  },
  cartContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  cartHeading: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 12,
  },
  emptyCartBox: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 30,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emptyEmoji: {
    fontSize: 36,
    marginBottom: 8,
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: 13,
  },
  cartItemCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cartItemName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  cartItemRate: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    marginHorizontal: 12,
  },
  stepBtn: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  qtyText: {
    paddingHorizontal: 8,
    fontSize: 13,
    fontWeight: 'bold',
  },
  itemTotal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text,
    minWidth: 60,
    textAlign: 'right',
  },
  paymentCard: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 14,
    marginTop: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionSub: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  customerSelector: {
    marginBottom: 4,
  },
  custChip: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  custChipActive: {
    backgroundColor: COLORS.primary,
  },
  custChipText: {
    fontSize: 12,
    color: COLORS.text,
  },
  custChipTextActive: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  methodRow: {
    flexDirection: 'row',
    gap: 8,
  },
  methodBtn: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  methodBtnActive: {
    backgroundColor: COLORS.primary,
  },
  methodText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
  },
  methodTextActive: {
    color: '#FFFFFF',
  },
  summaryCard: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 14,
    marginTop: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  summaryLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  summaryVal: {
    fontSize: 13,
    color: COLORS.text,
    fontWeight: '500',
  },
  totalRow: {
    marginTop: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    marginBottom: 0,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  totalVal: {
    fontSize: 17,
    fontWeight: 'bold',
    color: COLORS.success,
  },
  checkoutBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 16,
  },
  checkoutText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  receiptCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '100%',
    padding: 20,
  },
  receiptHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    color: COLORS.text,
  },
  receiptSub: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 12,
  },
  receiptItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  closeReceiptBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 18,
  },
  closeReceiptText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
