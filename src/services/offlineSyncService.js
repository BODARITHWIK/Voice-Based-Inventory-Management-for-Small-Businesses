/**
 * Swaranidhi Offline Sync Service
 * Manages local mutation queue during network drops with Idempotency Key protection.
 */

const QUEUE_KEY = 'swaranidhi_offline_queue';

class OfflineSyncService {
  constructor() {
    this.listeners = new Set();
    this.isOnline = navigator.onLine;

    window.addEventListener('online', () => {
      this.isOnline = true;
      this.notifyListeners();
      this.syncPendingOperations();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.notifyListeners();
    });
  }

  subscribe(listener) {
    this.listeners.add(listener);
    listener({ isOnline: this.isOnline, pendingCount: this.getQueue().length });
    return () => this.listeners.delete(listener);
  }

  notifyListeners() {
    const status = {
      isOnline: this.isOnline,
      pendingCount: this.getQueue().length,
    };
    this.listeners.forEach((fn) => fn(status));
  }

  getQueue() {
    try {
      const data = localStorage.getItem(QUEUE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  saveQueue(queue) {
    try {
      localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
      this.notifyListeners();
    } catch (e) {
      console.error('Failed to save offline queue', e);
    }
  }

  enqueueOperation(type, endpoint, payload, method = 'POST') {
    const queue = this.getQueue();
    const idempotencyKey = 'IDEM-' + Date.now() + '-' + Math.random().toString(36).substring(2, 9);
    
    // Inject idempotency key into payload if object
    const finalPayload = { ...payload, idempotencyKey };

    const item = {
      id: 'OFFLINE-' + Date.now(),
      type,
      endpoint,
      method,
      payload: finalPayload,
      timestamp: new Date().toISOString(),
      status: 'PENDING',
    };

    queue.push(item);
    this.saveQueue(queue);
    return item;
  }

  async syncPendingOperations(apiClient) {
    if (!navigator.onLine) return;

    const queue = this.getQueue();
    if (queue.length === 0) return;

    const remaining = [];

    for (const item of queue) {
      if (item.status === 'SYNCING') continue;
      item.status = 'SYNCING';

      try {
        if (apiClient) {
          if (item.method === 'POST') {
            await apiClient.post(item.endpoint, item.payload);
          } else if (item.method === 'PUT') {
            await apiClient.put(item.endpoint, item.payload);
          }
        }
        // Success - remove from queue
      } catch (err) {
        // If 4xx conflict or error, do not block other items
        console.warn('Sync failed for item', item.id, err);
        item.status = 'FAILED';
        remaining.push(item);
      }
    }

    this.saveQueue(remaining);
  }
}

export const offlineSyncService = new OfflineSyncService();
