/* ==========================================================================
   إدارة قسم الإنتاج الجنوبي - Offline-First Resilience & Auto-Sync Engine
   ========================================================================== */

(function(global) {
  'use strict';

  const QUEUE_KEY = 'SPD_OFFLINE_QUEUE_V1';

  class OfflineSyncManager {
    constructor() {
      this.isOnlineState = typeof navigator !== 'undefined' && typeof navigator.onLine === 'boolean' ? navigator.onLine : true;
      this.isSyncing = false;
      this.listeners = [];
      this.initNetworkListeners();
    }

    /**
     * Initialize network state change listeners
     */
    initNetworkListeners() {
      if (typeof window === 'undefined') return;

      window.addEventListener('online', () => {
        this.isOnlineState = true;
        this.notifyStatusChange({ online: true, event: 'online' });
        this.autoSyncOnReconnect();
      });

      window.addEventListener('offline', () => {
        this.isOnlineState = false;
        this.notifyStatusChange({ online: false, event: 'offline' });
      });
    }

    /**
     * Check if currently online
     * @returns {boolean}
     */
    isOnline() {
      if (typeof navigator !== 'undefined' && typeof navigator.onLine === 'boolean') {
        return navigator.onLine;
      }
      return this.isOnlineState;
    }

    /**
     * Retrieve pending offline action queue
     * @returns {Array<Object>}
     */
    getQueue() {
      try {
        if (typeof localStorage !== 'undefined') {
          const raw = localStorage.getItem(QUEUE_KEY);
          return raw ? JSON.parse(raw) : [];
        }
      } catch (e) {
        console.warn('Error reading offline queue:', e);
      }
      return [];
    }

    /**
     * Save queue to storage
     * @param {Array<Object>} queue 
     */
    saveQueue(queue) {
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(QUEUE_KEY, JSON.stringify(queue || []));
        }
      } catch (e) {
        console.warn('Error saving offline queue:', e);
      }
    }

    /**
     * Add an action to the offline queue
     * @param {Object} action 
     * @returns {Object}
     */
    enqueue(action) {
      const queue = this.getQueue();
      const queuedItem = {
        id: 'off-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
        type: action.type || 'GENERIC_ACTION',
        payload: action.payload || {},
        timestamp: new Date().toISOString(),
        userId: action.userId || null,
        userName: action.userName || 'مستخدم المنظومة',
        description: action.description || 'إجراء أوفلاين قيد المزامنة'
      };

      queue.push(queuedItem);
      this.saveQueue(queue);

      if (typeof window !== 'undefined' && window.dispatchEvent) {
        window.dispatchEvent(new CustomEvent('spd:offline-action-queued', { detail: queuedItem }));
        window.dispatchEvent(new CustomEvent('spd:network-status-changed', {
          detail: { online: this.isOnline(), pendingCount: queue.length }
        }));
      }

      return queuedItem;
    }

    /**
     * Remove an action by ID from queue
     * @param {string} actionId 
     */
    dequeue(actionId) {
      const queue = this.getQueue().filter(item => item.id !== actionId);
      this.saveQueue(queue);
    }

    /**
     * Clear all offline actions
     */
    clearQueue() {
      this.saveQueue([]);
      if (typeof window !== 'undefined' && window.dispatchEvent) {
        window.dispatchEvent(new CustomEvent('spd:network-status-changed', {
          detail: { online: this.isOnline(), pendingCount: 0 }
        }));
      }
    }

    /**
     * Auto-sync when reconnecting
     */
    async autoSyncOnReconnect() {
      if (this.isSyncing) return;
      const queue = this.getQueue();
      if (queue.length === 0 && (!window.store || !window.store.syncWithServer)) return;

      this.isSyncing = true;
      this.notifyStatusChange({ online: true, syncing: true });

      try {
        // Trigger server sync if available
        if (window.store && typeof window.store.syncWithServer === 'function') {
          await window.store.syncWithServer();
        }

        // Process queue items if handler is defined
        if (window.store && typeof window.store.processOfflineAction === 'function') {
          for (const item of queue) {
            try {
              await window.store.processOfflineAction(item);
              this.dequeue(item.id);
            } catch (err) {
              console.warn('Failed to process offline action:', item.id, err);
            }
          }
        } else {
          // If no custom action handler needed, mark queue as flushed
          this.clearQueue();
        }
      } catch (err) {
        console.warn('AutoSyncOnReconnect error:', err);
      } finally {
        this.isSyncing = false;
        this.notifyStatusChange({ online: true, syncing: false, pendingCount: this.getQueue().length });
      }
    }

    /**
     * Notify listeners of network and sync status changes
     * @param {Object} state 
     */
    notifyStatusChange(state) {
      const fullState = {
        online: this.isOnline(),
        syncing: this.isSyncing,
        pendingCount: this.getQueue().length,
        ...state
      };

      if (typeof window !== 'undefined' && window.dispatchEvent) {
        window.dispatchEvent(new CustomEvent('spd:network-status-changed', { detail: fullState }));
      }
    }
  }

  const syncInstance = new OfflineSyncManager();
  global.SPDOfflineSync = syncInstance;
  if (typeof window !== 'undefined') window.SPDOfflineSync = syncInstance;
  if (typeof globalThis !== 'undefined') globalThis.SPDOfflineSync = syncInstance;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = syncInstance;
  }
})(typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : globalThis));
