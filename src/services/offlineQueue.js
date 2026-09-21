// Swaranidhi Production Offline Mutation Queue
// Handles offline-first transactional integrity for kirana shops with intermittent connectivity.

const QUEUE_KEY = 'swaranidhi_offline_mutation_queue';

class OfflineQueue {
  constructor() {
    this.listeners = new Set();
    this.isSyncing = false;
    this.lastSyncError = null;
  }

  getQueue() {
    try {
      const data = localStorage.getItem(QUEUE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Failed to read offline queue:', e);
      return [];
    }
  }

  saveQueue(queue) {
    try {
      localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
      this.notifyListeners();
    } catch (e) {
      console.error('Failed to save offline queue:', e);
    }
  }

  enqueue(type, payload) {
    const item = {
      id: 'queue-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
      type,
      payload,
      createdAt: new Date().toISOString(),
      retryCount: 0,
      status: 'PENDING',
    };

    const queue = this.getQueue();
    queue.push(item);
    this.saveQueue(queue);
    return item;
  }

  remove(id) {
    const queue = this.getQueue().filter((item) => item.id !== id);
    this.saveQueue(queue);
  }

  clear() {
    this.saveQueue([]);
  }

  getPendingCount() {
    return this.getQueue().length;
  }

  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notifyListeners() {
    const count = this.getPendingCount();
    const status = this.isSyncing ? 'SYNCING' : this.lastSyncError ? 'SYNC_FAILED' : 'IDLE';
    this.listeners.forEach((cb) => {
      try {
        cb({ count, status, error: this.lastSyncError });
      } catch (e) {
        console.error('Offline queue listener error:', e);
      }
    });
  }

  async processQueue(apiClient) {
    if (this.isSyncing) return;
    if (typeof navigator !== 'undefined' && !navigator.onLine) return;

    const queue = this.getQueue();
    if (queue.length === 0) {
      this.lastSyncError = null;
      this.notifyListeners();
      return;
    }

    this.isSyncing = true;
    this.lastSyncError = null;
    this.notifyListeners();

    const remaining = [];

    for (const item of queue) {
      try {
        if (apiClient) {
          switch (item.type) {
            case 'CREATE_PRODUCT':
              await apiClient.post('/products', item.payload);
              break;
            case 'UPDATE_PRODUCT':
              await apiClient.put(`/products/${item.payload.id}`, item.payload.data);
              break;
            case 'CREATE_SALE':
              await apiClient.post('/sales', item.payload);
              break;
            case 'CREATE_PURCHASE':
              await apiClient.post('/purchases', item.payload);
              break;
            case 'CUSTOMER_PAYMENT':
              await apiClient.post(`/customers/${item.payload.customerId}/payments`, item.payload.data);
              break;
            default:
              console.warn('Unknown offline action type:', item.type);
          }
        }
      } catch (err) {
        console.error(`Failed to sync queued action ${item.id}:`, err);
        item.retryCount = (item.retryCount || 0) + 1;
        item.lastError = err.message || 'Sync failed';
        remaining.push(item);
        this.lastSyncError = err.message || 'Sync encountered errors';
      }
    }

    this.isSyncing = false;
    this.saveQueue(remaining);
    this.notifyListeners();
  }
}

export const offlineQueue = new OfflineQueue();
export default offlineQueue;
