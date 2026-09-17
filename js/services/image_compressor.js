/* ==========================================================================
   إدارة قسم الإنتاج الجنوبي - Smart Client-Side Image Compression Engine
   ========================================================================== */

(function(global) {
  'use strict';

  const DEFAULT_OPTIONS = {
    maxWidth: 1600,
    maxHeight: 1600,
    quality: 0.78,
    mimeType: 'image/jpeg', // Default high-efficiency JPEG with broad cross-platform support
    maxSizeBytes: 350 * 1024 // Target under ~350 KB
  };

  class ImageCompressor {
    /**
     * Determine if a given file or MIME type is an image
     * @param {File|Blob|string} input 
     * @returns {boolean}
     */
    static isImage(input) {
      if (!input) return false;
      if (typeof input === 'string') {
        if (input.startsWith('data:image/')) return true;
        const ext = input.split('.').pop().toLowerCase();
        return ['jpg', 'jpeg', 'png', 'webp', 'bmp', 'gif', 'svg'].includes(ext);
      }
      if (input.type && input.type.startsWith('image/')) return true;
      if (input.name) {
        const ext = input.name.split('.').pop().toLowerCase();
        return ['jpg', 'jpeg', 'png', 'webp', 'bmp', 'gif', 'svg'].includes(ext);
      }
      return false;
    }

    /**
     * Calculate byte length of a base64 DataURL
     * @param {string} dataUrl 
     * @returns {number}
     */
    static getDataUrlByteLength(dataUrl) {
      if (!dataUrl || typeof dataUrl !== 'string') return 0;
      const base64Index = dataUrl.indexOf(';base64,');
      if (base64Index === -1) return dataUrl.length;
      const base64Str = dataUrl.substring(base64Index + 8);
      const padding = (base64Str.match(/=/g) || []).length;
      return Math.floor((base64Str.length * 3) / 4) - padding;
    }

    /**
     * Format bytes into human-readable string
     * @param {number} bytes 
     * @returns {string}
     */
    static formatBytes(bytes) {
      if (!bytes || bytes <= 0) return '0 B';
      const k = 1024;
      const sizes = ['B', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }

    /**
     * Compress a single image File, Blob, or DataURL
     * @param {File|Blob|string} fileOrDataUrl 
     * @param {Object} customOptions 
     * @returns {Promise<Object>}
     */
    static async compress(fileOrDataUrl, customOptions = {}) {
      const options = { ...DEFAULT_OPTIONS, ...customOptions };

      // If input is non-image, passthrough with metadata
      if (!this.isImage(fileOrDataUrl)) {
        if (typeof fileOrDataUrl === 'string') {
          return {
            dataUrl: fileOrDataUrl,
            originalSize: this.getDataUrlByteLength(fileOrDataUrl),
            compressedSize: this.getDataUrlByteLength(fileOrDataUrl),
            compressionRatio: 0,
            isImage: false
          };
        }
        return new Promise((resolve, reject) => {
          if (typeof FileReader === 'undefined') {
            resolve({
              dataUrl: '',
              originalSize: fileOrDataUrl.size || 0,
              compressedSize: fileOrDataUrl.size || 0,
              compressionRatio: 0,
              isImage: false
            });
            return;
          }
          const reader = new FileReader();
          reader.onload = (e) => {
            resolve({
              dataUrl: e.target.result,
              originalSize: fileOrDataUrl.size || this.getDataUrlByteLength(e.target.result),
              compressedSize: fileOrDataUrl.size || this.getDataUrlByteLength(e.target.result),
              compressionRatio: 0,
              isImage: false,
              name: fileOrDataUrl.name || 'document',
              type: fileOrDataUrl.type || 'application/octet-stream'
            });
          };
          reader.onerror = reject;
          reader.readAsDataURL(fileOrDataUrl);
        });
      }

      // Convert File/Blob to DataURL first if needed
      let sourceDataUrl = '';
      let originalSize = 0;
      let fileName = 'image.jpg';
      let originalType = 'image/jpeg';

      if (typeof fileOrDataUrl === 'string') {
        sourceDataUrl = fileOrDataUrl;
        originalSize = this.getDataUrlByteLength(sourceDataUrl);
      } else {
        fileName = fileOrDataUrl.name || 'image.jpg';
        originalType = fileOrDataUrl.type || 'image/jpeg';
        originalSize = fileOrDataUrl.size || 0;
        sourceDataUrl = await new Promise((resolve, reject) => {
          if (typeof FileReader === 'undefined') {
            resolve('');
            return;
          }
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target.result);
          reader.onerror = reject;
          reader.readAsDataURL(fileOrDataUrl);
        });
        if (!originalSize && sourceDataUrl) {
          originalSize = this.getDataUrlByteLength(sourceDataUrl);
        }
      }

      // If running in an environment without DOM / Canvas (e.g. Node test mock), return safe fallback
      if (typeof document === 'undefined' || typeof Image === 'undefined') {
        return {
          dataUrl: sourceDataUrl,
          name: fileName,
          type: originalType,
          originalSize,
          compressedSize: originalSize,
          compressionRatio: 0,
          isImage: true,
          width: 800,
          height: 600,
          simulated: true
        };
      }

      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          try {
            let width = img.naturalWidth || img.width;
            let height = img.naturalHeight || img.height;

            // Calculate scaled down dimensions maintaining aspect ratio
            if (width > options.maxWidth || height > options.maxHeight) {
              const ratio = Math.min(options.maxWidth / width, options.maxHeight / height);
              width = Math.round(width * ratio);
              height = Math.round(height * ratio);
            }

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');

            if (ctx) {
              ctx.imageSmoothingEnabled = true;
              ctx.imageSmoothingQuality = 'high';
              ctx.drawImage(img, 0, 0, width, height);

              let compressedDataUrl = canvas.toDataURL(options.mimeType, options.quality);
              let compressedSize = this.getDataUrlByteLength(compressedDataUrl);

              // Secondary quality compression pass if still over max target
              if (compressedSize > options.maxSizeBytes && options.quality > 0.4) {
                const reducedQuality = Math.max(0.4, options.quality * 0.7);
                const secondPassUrl = canvas.toDataURL(options.mimeType, reducedQuality);
                const secondPassSize = this.getDataUrlByteLength(secondPassUrl);
                if (secondPassSize < compressedSize) {
                  compressedDataUrl = secondPassUrl;
                  compressedSize = secondPassSize;
                }
              }

              // If compressed size is unexpectedly larger than original, keep original
              if (originalSize > 0 && compressedSize > originalSize) {
                compressedDataUrl = sourceDataUrl;
                compressedSize = originalSize;
              }

              const compressionRatio = originalSize > 0 ? Math.max(0, Math.round((1 - (compressedSize / originalSize)) * 100)) : 0;

              resolve({
                dataUrl: compressedDataUrl,
                name: fileName,
                type: options.mimeType,
                originalSize,
                compressedSize,
                compressionRatio, // e.g. 75% reduced
                width,
                height,
                isImage: true
              });
            } else {
              // Canvas 2D context not available fallback
              resolve({
                dataUrl: sourceDataUrl,
                name: fileName,
                type: originalType,
                originalSize,
                compressedSize: originalSize,
                compressionRatio: 0,
                isImage: true,
                width,
                height
              });
            }
          } catch (err) {
            // Fallback gracefully on canvas processing error
            resolve({
              dataUrl: sourceDataUrl,
              name: fileName,
              type: originalType,
              originalSize,
              compressedSize: originalSize,
              compressionRatio: 0,
              isImage: true
            });
          }
        };

        img.onerror = () => {
          // If image fails loading, resolve with original
          resolve({
            dataUrl: sourceDataUrl,
            name: fileName,
            type: originalType,
            originalSize,
            compressedSize: originalSize,
            compressionRatio: 0,
            isImage: true
          });
        };

        img.src = sourceDataUrl;
      });
    }

    /**
     * Compress a batch of files concurrently
     * @param {FileList|Array<File>} fileList 
     * @param {Object} options 
     * @returns {Promise<Array<Object>>}
     */
    static async compressFiles(fileList, options = {}) {
      if (!fileList || fileList.length === 0) return [];
      const files = Array.from(fileList);
      return Promise.all(files.map(f => this.compress(f, options)));
    }
  }

  // Export to global environment
  global.ImageCompressor = ImageCompressor;
  if (typeof window !== 'undefined') window.ImageCompressor = ImageCompressor;
  if (typeof globalThis !== 'undefined') globalThis.ImageCompressor = ImageCompressor;
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = ImageCompressor;
  }
})(typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : globalThis));
