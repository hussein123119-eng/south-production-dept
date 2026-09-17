/* ==========================================================================
   إدارة قسم الإنتاج الجنوبي - High-Capacity IndexedDB Enterprise Storage Engine
   ========================================================================== */

(function(global) {
  'use strict';

  const DB_NAME = 'SPD_ENTERPRISE_IDB_V3';
  const DB_VERSION = 1;
  const STORE_NAME = 'app_state';

  class SPDIndexedDB {
    constructor() {
      this.db = null;
      this.initPromise = null;
    }

    /**
     * Check if IndexedDB is supported in current environment
     * @returns {boolean}
     */
    static isSupported() {
      return typeof indexedDB !== 'undefined' && indexedDB !== null;
    }

    /**
     * Open or create the database connection
     * @returns {Promise<IDBDatabase>}
     */
    async openDB() {
      if (this.db) return this.db;
      if (this.initPromise) return this.initPromise;

      if (!SPDIndexedDB.isSupported()) {
        return null;
      }

      this.initPromise = new Promise((resolve, reject) => {
        try {
          const request = indexedDB.open(DB_NAME, DB_VERSION);

          request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
              db.createObjectStore(STORE_NAME);
            }
          };

          request.onsuccess = (event) => {
            this.db = event.target.result;
            resolve(this.db);
          };

          request.onerror = (event) => {
            console.warn('SPDIndexedDB open error:', event.target.error);
            resolve(null);
          };
        } catch (err) {
          console.warn('SPDIndexedDB open exception:', err);
          resolve(null);
        }
      });

      return this.initPromise;
    }

    /**
     * Retrieve an item by key
     * @param {string} key 
     * @returns {Promise<any>}
     */
    async get(key) {
      try {
        const db = await this.openDB();
        if (!db) return null;

        return new Promise((resolve) => {
          const transaction = db.transaction([STORE_NAME], 'readonly');
          const store = transaction.objectStore(STORE_NAME);
          const request = store.get(key);

          request.onsuccess = () => {
            resolve(request.result !== undefined ? request.result : null);
          };
          request.onerror = () => {
            resolve(null);
          };
        });
      } catch (e) {
        return null;
      }
    }

    /**
     * Store an item by key
     * @param {string} key 
     * @param {any} value 
     * @returns {Promise<boolean>}
     */
    async set(key, value) {
      try {
        const db = await this.openDB();
        if (!db) return false;

        return new Promise((resolve) => {
          const transaction = db.transaction([STORE_NAME], 'readwrite');
          const store = transaction.objectStore(STORE_NAME);
          const request = store.put(value, key);

          request.onsuccess = () => {
            resolve(true);
          };
          request.onerror = (e) => {
            console.warn('SPDIndexedDB set error:', e);
            resolve(false);
          };
        });
      } catch (e) {
        return false;
      }
    }

    /**
     * Delete an item by key
     * @param {string} key 
     * @returns {Promise<boolean>}
     */
    async delete(key) {
      try {
        const db = await this.openDB();
        if (!db) return false;

        return new Promise((resolve) => {
          const transaction = db.transaction([STORE_NAME], 'readwrite');
          const store = transaction.objectStore(STORE_NAME);
          const request = store.delete(key);

          request.onsuccess = () => resolve(true);
          request.onerror = () => resolve(false);
        });
      } catch (e) {
        return false;
      }
    }

    /**
     * Clear all records in object store
     * @returns {Promise<boolean>}
     */
    async clear() {
      try {
        const db = await this.openDB();
        if (!db) return false;

        return new Promise((resolve) => {
          const transaction = db.transaction([STORE_NAME], 'readwrite');
          const store = transaction.objectStore(STORE_NAME);
          const request = store.clear();

          request.onsuccess = () => resolve(true);
          request.onerror = () => resolve(false);
        });
      } catch (e) {
        return false;
      }
    }

    /**
     * Estimate storage usage and quota
     * @returns {Promise<{usage: number, quota: number, percentUsed: number, usageFormatted: string, quotaFormatted: string}>}
     */
    async estimateUsage() {
      if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.estimate) {
        try {
          const estimate = await navigator.storage.estimate();
          const usage = estimate.usage || 0;
          const quota = estimate.quota || 0;
          const percentUsed = quota > 0 ? parseFloat(((usage / quota) * 100).toFixed(2)) : 0;
          const format = (bytes) => {
            if (!bytes || bytes <= 0) return '0 MB';
            const mb = bytes / (1024 * 1024);
            if (mb >= 1024) return (mb / 1024).toFixed(2) + ' GB';
            return mb.toFixed(1) + ' MB';
          };
          return {
            usage,
            quota,
            percentUsed,
            usageFormatted: format(usage),
            quotaFormatted: format(quota),
            isSupported: true
          };
        } catch (e) {}
      }

      return {
        usage: 0,
        quota: 1024 * 1024 * 1024, // Fallback 1GB
        percentUsed: 0,
        usageFormatted: 'غير محدد',
        quotaFormatted: '> 1.0 GB (IndexedDB غير محدود)',
        isSupported: false
      };
    }
  }

  const idbInstance = new SPDIndexedDB();
  global.SPDIndexedDB = idbInstance;
  if (typeof window !== 'undefined') window.SPDIndexedDB = idbInstance;
  if (typeof globalThis !== 'undefined') globalThis.SPDIndexedDB = idbInstance;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = idbInstance;
  }
})(typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : globalThis));
