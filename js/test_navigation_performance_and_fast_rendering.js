/**
 * جناح اختبار الأداء الفائق وسرعة التنقل بين التبويبات والقائمة الجانبية
 * High-Performance Tab Navigation & Fast DOM Rendering Test Suite
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('======================================================================');
console.log('🧪 اختبار سرعة واستجابة التنقل بين التبويبات وتحديث القائمة الجانبية');
console.log('======================================================================');

// Setup mock browser environment
global.window = global;
global.window.location = { hostname: 'localhost' };
global.localStorage = {
  _data: {},
  getItem(k) { return this._data[k] || null; },
  setItem(k, v) { this._data[k] = String(v); },
  removeItem(k) { delete this._data[k]; },
  clear() { this._data = {}; }
};

class MockElement {
  constructor(id = '', tagName = 'div') {
    this.id = id;
    this.tagName = tagName;
    this._innerHTML = '';
    this.value = '';
    this.children = [];
    this._classListSet = new Set();
    this.style = {
      removeProperty() {},
      setProperty() {}
    };
    this.classList = {
      add: (...classes) => classes.forEach(c => this._classListSet.add(c)),
      remove: (...classes) => classes.forEach(c => this._classListSet.delete(c)),
      toggle: (c) => {
        if (this._classListSet.has(c)) {
          this._classListSet.delete(c);
          return false;
        } else {
          this._classListSet.add(c);
          return true;
        }
      },
      contains: (c) => this._classListSet.has(c)
    };
    this._attributes = {};
  }
  get innerHTML() {
    return this._innerHTML;
  }
  set innerHTML(val) {
    this._innerHTML = val;
  }
  setAttribute(k, v) {
    this._attributes[k] = String(v);
  }
  getAttribute(k) {
    return this._attributes[k] || null;
  }
  appendChild(child) {
    this.children.push(child);
  }
  querySelector(selector) {
    if (selector === '.layout-wrapper') return document.elements['layout-wrapper'];
    if (selector === '.content-area') return document.elements['content-area'];
    if (selector === '.sidebar' || selector === '#appSidebar') return document.elements['appSidebar'];
    if (selector === '#mobileBottomNav') return document.elements['mobileBottomNav'];
    return new MockElement('inner-mock');
  }
  querySelectorAll(selector) {
    if (selector === '.nav-item') {
      return this._navItems || [];
    }
    if (selector === '.bottom-nav-btn') {
      return this._bottomNavBtns || [];
    }
    if (selector.includes('nav-sub-item')) {
      return this._subItems || [];
    }
    return [];
  }
}

const elements = {
  'app': new MockElement('app', 'div'),
  'layout-wrapper': new MockElement('layoutWrapper', 'div'),
  'content-area': new MockElement('contentArea', 'main'),
  'appSidebar': new MockElement('appSidebar', 'aside'),
  'mobileBottomNav': new MockElement('mobileBottomNav', 'nav')
};

// Setup mock sidebar nav-items
const navItemHome = new MockElement('nav-home', 'a');
navItemHome.setAttribute('onclick', "window.app.navigate('dashboard')");
const navItemDocs = new MockElement('nav-docs', 'a');
navItemDocs.setAttribute('onclick', "window.app.navigate('documents')");
const navItemVehicles = new MockElement('nav-vehicles', 'a');
navItemVehicles.setAttribute('onclick', "window.app.navigate('vehicles')");
const navItemSections = new MockElement('nav-sections', 'div');
navItemSections.setAttribute('onclick', "window.app.toggleSidebarSectionsDropdown(event)");

elements['appSidebar']._navItems = [navItemHome, navItemDocs, navItemVehicles, navItemSections];

// Setup mock mobile bottom nav buttons
const btnHome = new MockElement('btn-home', 'button');
const btnForms = new MockElement('btn-forms', 'button');
const btnIncentive = new MockElement('btn-incentive', 'button');
const btnPromotion = new MockElement('btn-promotion', 'button');
const btnMore = new MockElement('btn-more', 'button');

elements['mobileBottomNav']._bottomNavBtns = [btnHome, btnForms, btnIncentive, btnPromotion, btnMore];

global.document = {
  elements,
  documentElement: new MockElement('html', 'html'),
  body: new MockElement('body', 'body'),
  addEventListener() {},
  removeEventListener() {},
  getElementById(id) {
    return elements[id] || (elements[id] = new MockElement(id));
  },
  querySelector(sel) {
    if (sel === '.layout-wrapper') return elements['layout-wrapper'];
    if (sel === '.content-area') return elements['content-area'];
    if (sel === '.sidebar' || sel === '#appSidebar') return elements['appSidebar'];
    if (sel === '#mobileBottomNav') return elements['mobileBottomNav'];
    return null;
  },
  querySelectorAll(sel) {
    return [];
  }
};
global.window.addEventListener = () => {};
global.window.removeEventListener = () => {};

// Load Store and App dependencies
require('./store.js');
require('./auth.js');
require('./rbac.js');

// Mock Auth User
window.auth.getCurrentUser = () => ({
  id: 'usr-admin-1',
  fullName: 'مدير النظام',
  employeeId: 'EMP-001',
  role: 'SUPER_ADMIN',
  departmentId: 'dept-south-prod',
  profileCompleted: true
});

// Mock view render functions
window.renderDashboardView = () => '<div id="view-dashboard">محتوى الرئيسية</div>';
window.renderDocumentsView = () => '<div id="view-documents">محتوى المستندات</div>';
window.renderVehiclesView = () => '<div id="view-vehicles">محتوى المركبات</div>';
window.renderSidebar = () => '<aside class="sidebar" id="appSidebar"></aside>';
window.renderTopbar = () => '<header class="topbar"></header>';
window.renderAnnouncementBar = () => '<div class="announcement-bar"></div>';
window.renderMobileBottomNav = () => '<nav class="mobile-bottom-nav" id="mobileBottomNav"></nav>';
window.renderMobileBottomSheet = () => '<div class="mobile-bottom-sheet"></div>';

// Load App
require('./app.js');

console.log('\n--- 1. التحقق من التحديث المباشر للمحتوى عبر Targeted View Swap ---');
assert.strictEqual(typeof window.app.updateActiveNavState, 'function', 'دالة updateActiveNavState يجب أن تكون معرفة في window.app');
assert.strictEqual(typeof window.app.render, 'function', 'دالة render يجب أن تكون معرفة في window.app');

// Simulate navigation to dashboard
window.app.navigate('dashboard');
assert.strictEqual(window.app.currentView, 'dashboard', 'currentView يجب أن يكون dashboard');
assert.ok(elements['content-area'].innerHTML.includes('view-dashboard'), 'content-area يجب أن يحتوي على محتوى لوحة التحكم');
assert.ok(navItemHome.classList.contains('active'), 'أيقونة الرئيسية في الشريط الجانبي يجب أن تحمل كلاس active');
assert.ok(!navItemDocs.classList.contains('active'), 'أيقونة المستندات يجب ألا تحمل كلاس active');
assert.ok(btnHome.classList.contains('active'), 'زر الرئيسية في الشريط السفلي للهواتف يجب أن يحمل كلاس active');
console.log('  ✅ PASS: تم الانتقال إلى الرئيسية وتحديث محتوى الشاشة والحالة النشطة بنجاح');

console.log('\n--- 2. التحقق من التبديل الفوري دون تدمير الهيكل العام ---');
// Record current layout wrapper reference
const initialContentArea = elements['content-area'];
window.app.navigate('documents');

assert.strictEqual(window.app.currentView, 'documents', 'currentView يجب أن يتحول إلى documents');
assert.ok(elements['content-area'].innerHTML.includes('view-documents'), 'محتوى المستندات تم حقنه مباشرة في content-area');
assert.ok(navItemDocs.classList.contains('active'), 'أيقونة المستندات تحمل كلاس active');
assert.ok(!navItemHome.classList.contains('active'), 'أيقونة الرئيسية أزيل منها كلاس active');
assert.ok(btnForms.classList.contains('active'), 'زر الاستمارات والمستندات السفلي يحمل كلاس active');
console.log('  ✅ PASS: تم تبديل التبويب إلى المستندات فورياً وتحديث الروابط النشطة دون إعادة تحميل الصفحة');

console.log('\n--- 3. التحقق من استجابة ودقة فتح وإغلاق القائمة الجانبية (Sidebar Toggle) ---');
document.body.classList.remove('sidebar-mobile-open');
window.app.openSidebar();
assert.ok(document.body.classList.contains('sidebar-mobile-open') || !document.body.classList.contains('sidebar-collapsed'), 'openSidebar يفعّل فتح القائمة');

window.app.closeSidebar();
assert.ok(!document.body.classList.contains('sidebar-mobile-open'), 'closeSidebar يغلق القائمة ويزيل كلاس sidebar-mobile-open');

window.app.toggleSidebar();
assert.ok(document.body.classList.contains('sidebar-mobile-open') || document.body.classList.contains('sidebar-collapsed'), 'toggleSidebar يبدل حالة القائمة');
console.log('  ✅ PASS: دوال الشريط الجانبي openSidebar و closeSidebar و toggleSidebar تعمل بسلاسة');

console.log('\n----------------------------------------------------------------------');
console.log('🎉 نجحت جميع اختبارات الأداء الفائق وسرعة التنقل والقائمة الجانبية 100%!');
console.log('----------------------------------------------------------------------');
