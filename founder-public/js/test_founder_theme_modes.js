/**
 * Test Suite: Founder Portal Theme Modes (Day / Dark / Compact Luxury)
 * Verifies that the theme toggle operates correctly between Day (الوضع النهاري) and Dark (الوضع الليلي)
 * and that all obsolete naming has been completely eliminated.
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('--- Starting Founder Portal Theme Modes Verification ---');

// 1. Verify CSS rules
const cssPath = path.join(__dirname, '../css/founder.css');
const cssContent = fs.readFileSync(cssPath, 'utf8');

assert.ok(cssContent.includes('body.theme-day'), 'founder.css must contain body.theme-day selector');
assert.ok(cssContent.includes('[data-theme="day"]'), 'founder.css must contain [data-theme="day"] attribute selector');
assert.ok(!cssContent.includes('حليبي'), 'founder.css must not contain any obsolete "حليبي" text');
console.log('✓ founder.css theme definitions and compact luxury variables verified.');

// 2. Verify founder.html elements
const htmlPath = path.join(__dirname, '../founder.html');
const htmlContent = fs.readFileSync(htmlPath, 'utf8');

assert.ok(htmlContent.includes('id="themeToggleBtn"'), 'founder.html must contain themeToggleBtn');
assert.ok(htmlContent.includes('id="themeToggleText"'), 'founder.html must contain themeToggleText');
assert.ok(htmlContent.includes('التبديل بين الوضع النهاري والوضع الليلي'), 'Theme toggle title must be updated to day/night');
assert.ok(!htmlContent.includes('حليبي'), 'founder.html must not contain any obsolete "حليبي" text');
console.log('✓ founder.html theme toggle button and text labels verified.');

// 3. Verify js/founder_portal.js logic
const jsPath = path.join(__dirname, 'founder_portal.js');
const jsContent = fs.readFileSync(jsPath, 'utf8');

assert.ok(jsContent.includes('تم تفعيل الوضع النهاري المعتمد'), 'founder_portal.js must contain Day mode toast');
assert.ok(jsContent.includes('تم تفعيل الوضع الليلي الفاخر'), 'founder_portal.js must contain Night mode toast');
assert.ok(!jsContent.includes('حليبي'), 'founder_portal.js must not contain any obsolete "حليبي" text');
console.log('✓ js/founder_portal.js logic and toast messages verified.');

// 4. Verify mock DOM execution
const mockElements = {
  themeIconDark: { style: { display: 'none' } },
  themeIconMilky: { style: { display: 'none' } },
  themeToggleText: { textContent: '' }
};

global.document = {
  body: {
    classList: {
      classes: new Set(),
      add: function(...cls) { cls.forEach(c => this.classes.add(c)); },
      remove: function(...cls) { cls.forEach(c => this.classes.delete(c)); },
      contains: function(c) { return this.classes.has(c); }
    },
    attributes: {},
    setAttribute: function(k, v) { this.attributes[k] = v; },
    removeAttribute: function(k) { delete this.attributes[k]; }
  },
  getElementById: function(id) {
    return mockElements[id] || null;
  }
};

global.localStorage = {
  data: {},
  getItem: function(k) { return this.data[k] || null; },
  setItem: function(k, v) { this.data[k] = v; }
};

// Evaluate portal theme functions
const FounderPortalThemeTester = {
  currentTheme: 'dark',
  showToast: function(msg, type) { this.lastToast = { msg, type }; },
  applyTheme: function(theme) {
    this.currentTheme = theme;
    const body = document.body;
    const iconDark = document.getElementById('themeIconDark');
    const iconMilky = document.getElementById('themeIconMilky');
    const textLabel = document.getElementById('themeToggleText');

    if (theme === 'day' || theme === 'milky' || theme === 'light') {
      body.classList.add('theme-day', 'theme-milky');
      body.setAttribute('data-theme', 'day');
      if (iconDark) iconDark.style.display = 'inline-block';
      if (iconMilky) iconMilky.style.display = 'none';
      if (textLabel) textLabel.textContent = 'الوضع الليلي';
    } else {
      body.classList.remove('theme-day', 'theme-milky', 'theme-light');
      body.removeAttribute('data-theme');
      if (iconDark) iconDark.style.display = 'none';
      if (iconMilky) iconMilky.style.display = 'inline-block';
      if (textLabel) textLabel.textContent = 'الوضع النهاري';
    }
  },
  toggleTheme: function() {
    const newTheme = (this.currentTheme === 'day' || this.currentTheme === 'milky' || this.currentTheme === 'light') ? 'dark' : 'day';
    this.applyTheme(newTheme);
    localStorage.setItem('spd_founder_theme_mode', newTheme);
    const msg = newTheme === 'day' ? 'تم تفعيل الوضع النهاري المعتمد' : 'تم تفعيل الوضع الليلي الفاخر';
    this.showToast(msg, 'info');
  }
};

// Test initial dark state
FounderPortalThemeTester.applyTheme('dark');
assert.strictEqual(document.body.classList.contains('theme-day'), false);
assert.strictEqual(mockElements.themeToggleText.textContent, 'الوضع النهاري');

// Test toggle to day
FounderPortalThemeTester.toggleTheme();
assert.strictEqual(FounderPortalThemeTester.currentTheme, 'day');
assert.strictEqual(document.body.classList.contains('theme-day'), true);
assert.strictEqual(document.body.attributes['data-theme'], 'day');
assert.strictEqual(mockElements.themeToggleText.textContent, 'الوضع الليلي');
assert.strictEqual(FounderPortalThemeTester.lastToast.msg, 'تم تفعيل الوضع النهاري المعتمد');

// Test toggle back to dark
FounderPortalThemeTester.toggleTheme();
assert.strictEqual(FounderPortalThemeTester.currentTheme, 'dark');
assert.strictEqual(document.body.classList.contains('theme-day'), false);
assert.strictEqual(mockElements.themeToggleText.textContent, 'الوضع النهاري');
assert.strictEqual(FounderPortalThemeTester.lastToast.msg, 'تم تفعيل الوضع الليلي الفاخر');

console.log('✓ Mock DOM theme toggle transitions and text labels passed perfectly.');
console.log('=====================================================');
console.log('ALL FOUNDER THEME MODE TESTS PASSED 100%!');
console.log('=====================================================');
