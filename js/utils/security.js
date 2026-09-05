/* ==========================================================================
   إدارة قسم الإنتاج الجنوبي - Security & XSS Sanitization Utility
   ========================================================================== */

(function(window) {
  'use strict';

  /**
   * Escape dangerous HTML entities to prevent Cross-Site Scripting (XSS)
   */
  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /**
   * Sanitize strings placed inside HTML attributes
   */
  function sanitizeAttribute(str) {
    if (str === null || str === undefined) return '';
    return String(str).replace(/["'>\\]/g, '');
  }

  /**
   * Sanitize URLs to prevent javascript: or data: URI injection
   */
  function sanitizeUrl(url) {
    if (!url) return '';
    const clean = String(url).trim().toLowerCase();
    if (clean.startsWith('javascript:') || clean.startsWith('data:') || clean.startsWith('vbscript:')) {
      return '#';
    }
    return url;
  }

  // Export globally for all components and templates
  if (typeof window !== 'undefined') {
    window.escapeHtml = escapeHtml;
    window.sanitizeAttribute = sanitizeAttribute;
    window.sanitizeUrl = sanitizeUrl;
    window.SecurityUtils = { escapeHtml, sanitizeAttribute, sanitizeUrl };
  }
})(typeof window !== 'undefined' ? window : global);
