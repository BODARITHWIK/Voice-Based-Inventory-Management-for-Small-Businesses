import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Default host based on platform: 10.0.2.2 for Android emulator, localhost for iOS/web
const DEFAULT_BASE_URL = Platform.OS === 'android'
  ? 'http://10.0.2.2:8080/api'
  : 'http://localhost:8080/api';

const api = axios.create({
  baseURL: DEFAULT_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Auto-attach auth token from storage
api.interceptors.request.use(async (config) => {
  try {
    const token = await AsyncStorage.getItem('@auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (err) {
    console.warn('Failed to load auth token:', err);
  }
  return config;
});

export const setApiBaseUrl = async (url) => {
  if (url) {
    api.defaults.baseURL = url;
    await AsyncStorage.setItem('@custom_api_url', url);
  }
};

export const initApiConfig = async () => {
  try {
    const savedUrl = await AsyncStorage.getItem('@custom_api_url');
    if (savedUrl) {
      api.defaults.baseURL = savedUrl;
    }
  } catch (e) {
    // fallback to default
  }
};

// ================= API ENDPOINTS =================

// Auth
export const login = async (username, password) => {
  const res = await api.post('/auth/login', { username, password });
  if (res.data?.data?.token) {
    await AsyncStorage.setItem('@auth_token', res.data.data.token);
    await AsyncStorage.setItem('@user_info', JSON.stringify(res.data.data.user || {}));
  }
  return res.data;
};

// Products & Inventory
export const getProducts = async (search = '') => {
  const url = search ? `/products?search=${encodeURIComponent(search)}` : '/products';
  const res = await api.get(url);
  return res.data?.data || [];
};

export const getLowStockProducts = async () => {
  const res = await api.get('/products/low-stock');
  return res.data?.data || [];
};

export const createProduct = async (productData) => {
  const res = await api.post('/products', productData);
  return res.data?.data;
};

export const updateProduct = async (id, productData) => {
  const res = await api.put(`/products/${id}`, productData);
  return res.data?.data;
};

export const adjustStock = async (productId, quantity, type, notes = '') => {
  const res = await api.post('/inventory/adjust', {
    productId,
    quantity,
    type,
    notes,
  });
  return res.data?.data;
};

// Smart Alerts
export const getSmartAlerts = async () => {
  const res = await api.get('/alerts');
  return res.data?.data || {
    lowStock: [],
    outOfStock: [],
    expiry: { expired: [], expiringSoon: [] },
    fastMoving: [],
    totalAlerts: 0,
  };
};

export const removeExpiredStock = async (productId = null) => {
  const res = await api.post('/inventory/remove-expired', productId ? { productId } : {});
  return res.data?.data;
};

// AI Assistant
export const queryAssistant = async (query) => {
  const res = await api.post('/assistant/query', { query });
  return res.data?.data || { answer: 'Unable to query assistant' };
};

// AI Stock Photo Scan
export const analyzeStockPhoto = async (imageUri, mimeType = 'image/jpeg', filename = 'photo.jpg') => {
  const formData = new FormData();
  formData.append('image', {
    uri: imageUri,
    type: mimeType,
    name: filename,
  });

  const res = await api.post('/stock/photo/analyze', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data?.data;
};

export const confirmScan = async (scanId, productId, action, quantity, price, notes = '') => {
  const res = await api.post('/stock/photo/confirm', {
    scanId,
    productId,
    action, // ADD_STOCK, REMOVE_STOCK, ADJUST_STOCK
    quantity,
    unitPrice: price,
    notes,
  });
  return res.data?.data;
};

// POS Sales & Billing
export const createSale = async (saleData) => {
  const res = await api.post('/sales', saleData);
  return res.data?.data;
};

export const getTodaySalesSummary = async () => {
  const res = await api.get('/reports/dashboard');
  return res.data?.data || {};
};

// Customers & Khata
export const getCustomers = async (search = '') => {
  const url = search ? `/customers?search=${encodeURIComponent(search)}` : '/customers';
  const res = await api.get(url);
  return res.data?.data || [];
};

export const createCustomer = async (customerData) => {
  const res = await api.post('/customers', customerData);
  return res.data?.data;
};

export const recordCustomerPayment = async (customerId, amount, type = 'PAYMENT', notes = '') => {
  const res = await api.post(`/customers/${customerId}/payments`, {
    amount,
    type,
    notes,
  });
  return res.data?.data;
};

// ================= OFFLINE QUEUE MANAGER =================
const OFFLINE_QUEUE_KEY = '@offline_action_queue';

export const queueOfflineAction = async (action) => {
  try {
    const raw = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
    const queue = raw ? JSON.parse(raw) : [];
    queue.push({
      ...action,
      id: 'OFFLINE_' + Date.now(),
      queuedAt: new Date().toISOString(),
    });
    await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
    return true;
  } catch (e) {
    console.error('Failed to queue offline action', e);
    return false;
  }
};

export const getOfflineQueue = async () => {
  try {
    const raw = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

export const syncOfflineQueue = async () => {
  try {
    const queue = await getOfflineQueue();
    if (!queue || queue.length === 0) return { synced: 0, failed: 0 };

    let synced = 0;
    let remaining = [];

    for (const item of queue) {
      try {
        if (item.type === 'CONFIRM_SCAN') {
          await confirmScan(item.scanId, item.productId, item.action, item.quantity, item.price, item.notes);
          synced++;
        } else if (item.type === 'CREATE_SALE') {
          await createSale(item.saleData);
          synced++;
        } else if (item.type === 'ADJUST_STOCK') {
          await adjustStock(item.productId, item.quantity, item.adjustmentType, item.notes);
          synced++;
        }
      } catch (err) {
        remaining.push(item);
      }
    }

    await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(remaining));
    return { synced, failed: remaining.length };
  } catch (e) {
    return { synced: 0, failed: 0 };
  }
};

export default api;
