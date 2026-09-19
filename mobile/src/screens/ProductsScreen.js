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
  ActivityIndicator,
} from 'react-native';
import { COLORS, SHADOWS } from '../theme';
import { getProducts, createProduct, adjustStock } from '../services/api';

export default function ProductsScreen({ route }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [addModal, setAddModal] = useState(route?.params?.filter === 'add');

  // New Product State
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Grocery');
  const [quantity, setQuantity] = useState('10');
  const [unit, setUnit] = useState('packets');
  const [sellingPrice, setSellingPrice] = useState('50');
  const [purchasePrice, setPurchasePrice] = useState('40');
  const [batchNumber, setBatchNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (e) {
      console.warn('Failed to load products', e);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAdjust = async (product, delta) => {
    try {
      const type = delta > 0 ? 'STOCK_IN' : 'STOCK_OUT';
      await adjustStock(product.id, Math.abs(delta), type, 'Quick adjust via mobile');
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, quantity: Math.max(0, p.quantity + delta) } : p))
      );
    } catch (err) {
      Alert.alert('Adjustment Failed', 'Could not update stock.');
    }
  };

  const handleAddProduct = async () => {
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Product name is required.');
      return;
    }
    setSubmitting(true);
    try {
      await createProduct({
        name: name.trim(),
        category: category.trim(),
        quantity: parseInt(quantity, 10) || 0,
        unit: unit.trim(),
        sellingPrice: parseFloat(sellingPrice) || 0,
        purchasePrice: parseFloat(purchasePrice) || 0,
        batchNumber: batchNumber.trim() || undefined,
        expiryDate: expiryDate.trim() || undefined,
      });
      setName('');
      setBatchNumber('');
      setExpiryDate('');
      setAddModal(false);
      loadProducts();
      Alert.alert('Success', 'New product added to catalog.');
    } catch (err) {
      Alert.alert('Error', 'Failed to create product.');
    } finally {
      setSubmitting(false);
    }
  };

  const categories = ['ALL', 'Grocery', 'Dairy', 'Snacks', 'Beverages', 'Personal Care', 'Spices'];

  const filtered = products.filter((p) => {
    const matchCat = selectedCategory === 'ALL' || p.category?.toLowerCase() === selectedCategory.toLowerCase();
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const getExpiryBadge = (product) => {
    if (!product.expiryDate) return null;
    const exp = new Date(product.expiryDate);
    const now = new Date();
    const diffDays = Math.ceil((exp - now) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return <View style={[styles.badgePill, { backgroundColor: '#FEE2E2' }]}><Text style={[styles.badgeText, { color: COLORS.danger }]}>EXPIRED</Text></View>;
    } else if (diffDays <= 7) {
      return <View style={[styles.badgePill, { backgroundColor: '#FEF3C7' }]}><Text style={[styles.badgeText, { color: '#B45309' }]}>EXP: {diffDays}d</Text></View>;
    }
    return null;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Search and Add Header */}
      <View style={styles.topSection}>
        <TextInput
          style={styles.searchBox}
          placeholder="Search products..."
          value={search}
          onChangeText={setSearch}
        />
        <TouchableOpacity style={styles.addBtn} onPress={() => setAddModal(true)}>
          <Text style={styles.addBtnText}>+ Product</Text>
        </TouchableOpacity>
      </View>

      {/* Category Horizontal Selector */}
      <View style={styles.categoryBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
          {categories.map((c) => (
            <TouchableOpacity
              key={c}
              style={[styles.catTab, selectedCategory === c && styles.catTabActive]}
              onPress={() => setSelectedCategory(c)}
            >
              <Text style={[styles.catText, selectedCategory === c && styles.catTextActive]}>{c}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Product List */}
      <ScrollView contentContainerStyle={styles.listContent}>
        {loading ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
        ) : filtered.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={{ fontSize: 32, marginBottom: 8 }}>📦</Text>
            <Text style={{ color: COLORS.textSecondary }}>No products found in this category.</Text>
          </View>
        ) : (
          filtered.map((item) => (
            <View key={item.id} style={[styles.prodCard, SHADOWS.sm]}>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={styles.prodName}>{item.name}</Text>
                  {getExpiryBadge(item)}
                </View>
                <Text style={styles.prodCat}>{item.category || 'General'} • ₹{item.sellingPrice}</Text>
                {item.batchNumber && (
                  <Text style={styles.prodMeta}>Batch: {item.batchNumber} | Exp: {item.expiryDate || 'N/A'}</Text>
                )}
              </View>

              <View style={styles.stockCol}>
                <Text style={[styles.stockNum, item.quantity <= 5 && { color: COLORS.danger }]}>
                  {item.quantity} {item.unit || 'units'}
                </Text>
                <View style={styles.adjustRow}>
                  <TouchableOpacity style={styles.adjustBtn} onPress={() => handleQuickAdjust(item, -1)}>
                    <Text style={styles.adjustText}>-</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.adjustBtn} onPress={() => handleQuickAdjust(item, 1)}>
                    <Text style={styles.adjustText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Add Product Modal */}
      <Modal visible={addModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, SHADOWS.md]}>
            <ScrollView>
              <Text style={styles.modalTitle}>Add Product to Inventory</Text>
              <TextInput style={styles.input} placeholder="Product Name *" value={name} onChangeText={setName} />
              <TextInput style={styles.input} placeholder="Category (e.g. Grocery)" value={category} onChangeText={setCategory} />
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TextInput style={[styles.input, { flex: 1 }]} placeholder="Stock Qty" keyboardType="numeric" value={quantity} onChangeText={setQuantity} />
                <TextInput style={[styles.input, { flex: 1 }]} placeholder="Unit (packets/kg)" value={unit} onChangeText={setUnit} />
              </View>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TextInput style={[styles.input, { flex: 1 }]} placeholder="Selling Price ₹" keyboardType="numeric" value={sellingPrice} onChangeText={setSellingPrice} />
                <TextInput style={[styles.input, { flex: 1 }]} placeholder="Purchase Price ₹" keyboardType="numeric" value={purchasePrice} onChangeText={setPurchasePrice} />
              </View>
              <TextInput style={styles.input} placeholder="Batch Number (e.g. BATCH-2026-09)" value={batchNumber} onChangeText={setBatchNumber} />
              <TextInput style={styles.input} placeholder="Expiry Date (YYYY-MM-DD)" value={expiryDate} onChangeText={setExpiryDate} />

              <View style={styles.modalActionRow}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setAddModal(false)}>
                  <Text style={{ color: COLORS.textSecondary }}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveBtn} onPress={handleAddProduct} disabled={submitting}>
                  <Text style={{ color: '#FFFFFF', fontWeight: 'bold' }}>Save Product</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
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
  topSection: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 8,
  },
  searchBox: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
  },
  addBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingHorizontal: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 13,
  },
  categoryBar: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  catTab: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
  },
  catTabActive: {
    backgroundColor: COLORS.primary,
  },
  catText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  catTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  emptyBox: {
    alignItems: 'center',
    marginTop: 40,
  },
  prodCard: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  prodName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  prodCat: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  prodMeta: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  badgePill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  stockCol: {
    alignItems: 'flex-end',
  },
  stockNum: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 6,
  },
  adjustRow: {
    flexDirection: 'row',
    gap: 6,
  },
  adjustBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  adjustText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    fontSize: 13,
  },
  modalActionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 10,
  },
  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  saveBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 18,
  },
});
