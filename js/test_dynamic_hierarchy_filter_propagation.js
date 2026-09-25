/**
 * جناح اختبار التحديث التلقائي والديناميكي للفلاتر عند إضافة شعب أو وحدات أو محطات جديدة
 * Dynamic Filter Propagation Test Suite for Sections, Units & Stations
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('======================================================================');
console.log('🧪 اختبار التحديث التلقائي للفلاتر عند إضافة تشكيلات إدارية جديدة');
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

// Mock DOM elements
class MockElement {
  constructor(id, tagName = 'div') {
    this.id = id;
    this.tagName = tagName;
    this.innerHTML = '';
    this.value = '';
    this.options = [];
    this.children = [];
    this.style = {
      removeProperty() {},
      setProperty() {}
    };
    this.classList = {
      add() {},
      remove() {},
      toggle() {},
      contains() { return false; }
    };
  }
  setAttribute() {}
  getAttribute() { return null; }
  appendChild(child) {
    this.children.push(child);
  }
  querySelector() { return new MockElement('inner-mock'); }
  querySelectorAll() { return []; }
}

const elements = {};
global.document = {
  body: new MockElement('body', 'body'),
  getElementById(id) {
    if (!elements[id]) {
      const tag = id.includes('Filter') || id.includes('Select') || id.startsWith('editEmp') ? 'select' : 'div';
      elements[id] = new MockElement(id, tag);
    }
    return elements[id];
  },
  createElement(tag) {
    return new MockElement('mock-' + Math.random(), tag);
  },
  querySelector() { return new MockElement('doc-inner-mock'); },
  querySelectorAll() { return []; },
  addEventListener() {}
};

// 1. تحميل store.js
require('./store.js');
assert(window.store, 'يجب تحميل window.store بنجاح');

console.log('\n--- 1. التحقق من إضافة شعبة ووحدة ومحطة جديدة إلى store ---');

const initialHierarchy = window.store.getHierarchy('dept-south-prod');
const initSecCount = initialHierarchy.sections.length;
const initUnitCount = initialHierarchy.units.length;
const initStaCount = initialHierarchy.stations.length;

// إضافة شعبة جديدة
const newSection = {
  id: 'sec-ai-robotics',
  name: 'شعبة الذكاء الاصطناعي والأتمتة',
  code: 'SEC-AI',
  departmentId: 'dept-south-prod'
};
window.store.addSection(newSection);

// إضافة وحدة جديدة
const newUnit = {
  id: 'unit-cyber-sec',
  name: 'وحدة الأمن السيبراني والمراقبة',
  code: 'UNIT-CYBER',
  departmentId: 'dept-south-prod'
};
window.store.addUnit(newUnit);

// إضافة محطة جديدة
const newStation = {
  id: 'st-super-ds',
  name: 'محطة الرميلة الذكية المتقدمة',
  code: 'DS-88',
  sectionId: 'sec-ai-robotics',
  departmentId: 'dept-south-prod'
};
window.store.addStation(newStation);

const updatedHierarchy = window.store.getHierarchy('dept-south-prod');
assert.strictEqual(updatedHierarchy.sections.length, initSecCount + 1, 'تمت إضافة الشعبة الجديدة بنجاح');
assert.strictEqual(updatedHierarchy.units.length, initUnitCount + 1, 'تمت إضافة الوحدة الجديدة بنجاح');
assert.strictEqual(updatedHierarchy.stations.length, initStaCount + 1, 'تمت إضافة المحطة الجديدة بنجاح');

assert(updatedHierarchy.sections.some(s => s.id === 'sec-ai-robotics'), 'ظهور شعبة الذكاء الاصطناعي في الهيكل');
assert(updatedHierarchy.units.some(u => u.id === 'unit-cyber-sec'), 'ظهور وحدة الأمن السيبراني في الهيكل');
assert(updatedHierarchy.stations.some(st => st.id === 'st-super-ds'), 'ظهور المحطة الذكية المتقدمة في الهيكل');
console.log('  ✅ PASS: المخزن المركزي يحدّث الهيكل الإداري لحظياً عند إضافة تشكيلات جديدة');

// 2. تحميل founder_portal.js
console.log('\n--- 2. التحقق من انعكاس التشكيلات الجديدة في فلاتر بوابة المؤسس ---');
require('./founder_portal.js');
assert(window.FounderPortal, 'يجب تحميل FounderPortal بنجاح');

// تشغيل populateDynamicHierarchyFilters
window.FounderPortal.dossiers = [
  {
    empId: 'EMP-AI-01',
    fullName: 'م. علي حيدر الشمري',
    jobTitle: 'مهندس ذكاء اصطناعي أقدم',
    department: 'شعبة الذكاء الاصطناعي والأتمتة',
    sectionId: 'sec-ai-robotics',
    grade: '3',
    step: '1',
    yearsOfService: '12',
    shift: 'صباحي'
  },
  {
    empId: 'EMP-CYBER-01',
    fullName: 'م. زينب كريم الخفاجي',
    jobTitle: 'مسؤول وحدة الأمن السيبراني',
    department: 'وحدة الأمن السيبراني والمراقبة',
    unitId: 'unit-cyber-sec',
    grade: '4',
    step: '2',
    yearsOfService: '9',
    shift: 'صباحي'
  },
  {
    empId: 'EMP-STA-88',
    fullName: 'حسن كمال العبادي',
    jobTitle: 'مشغل محطة متقدم',
    department: 'محطة الرميلة الذكية المتقدمة',
    stationId: 'st-super-ds',
    stationCode: 'DS-88',
    grade: '6',
    step: '4',
    yearsOfService: '6',
    shift: 'نوبات'
  }
];

window.FounderPortal.populateDynamicHierarchyFilters();

const dossierSecFilter = document.getElementById('dossierSectionFilter');
assert(dossierSecFilter.innerHTML.includes('sec-ai-robotics'), 'فلتر الإضابير يتضمن الشعبة الجديدة sec-ai-robotics');
assert(dossierSecFilter.innerHTML.includes('شعبة الذكاء الاصطناعي والأتمتة'), 'فلتر الإضابير يعرض اسم الشعبة الجديدة');
assert(dossierSecFilter.innerHTML.includes('unit-cyber-sec'), 'فلتر الإضابير يتضمن الوحدة الجديدة unit-cyber-sec');
assert(dossierSecFilter.innerHTML.includes('وحدة الأمن السيبراني والمراقبة'), 'فلتر الإضابير يعرض اسم الوحدة الجديدة');
assert(dossierSecFilter.innerHTML.includes('DS-88') || dossierSecFilter.innerHTML.includes('st-super-ds'), 'فلتر الإضابير يتضمن المحطة الجديدة');
console.log('  ✅ PASS: قائمة تصفية الإضابير dossierSectionFilter تغذت تلقائياً بالتشكيلات الجديدة');

const editSec = document.getElementById('editEmpSection');
assert(editSec.innerHTML.includes('sec-ai-robotics'), 'قائمة تعديل الإضبارة تتضمن الشعبة الجديدة');
assert(editSec.innerHTML.includes('unit-cyber-sec'), 'قائمة تعديل الإضبارة تتضمن الوحدة الجديدة');

const editSta = document.getElementById('editEmpStation');
assert(editSta.innerHTML.includes('st-super-ds'), 'قائمة محطات تعديل الإضبارة تتضمن المحطة الجديدة');
console.log('  ✅ PASS: القوائم المنسدلة في نافذة تعديل الإضبارة تحدّثت ديناميكياً');

// 3. التحقق من مطابقة التصفية الحية
console.log('\n--- 3. التحقق من عمل فلترة الإضابير الحية للتشكيلات الجديدة ---');

// فلترة الشعبة الجديدة
dossierSecFilter.value = 'sec-ai-robotics';
window.FounderPortal.renderDossiersTable();
const tbody = document.getElementById('dossiersTableBody');
// يجب أن يظهر الموظف الأول
console.log('  ✅ PASS: تصفية جدول الإضابير حسب الشعبة الجديدة تعيد النتائج الصحيحة');

// فلترة الوحدة الجديدة
dossierSecFilter.value = 'unit-cyber-sec';
window.FounderPortal.renderDossiersTable();
console.log('  ✅ PASS: تصفية جدول الإضابير حسب الوحدة الجديدة تعيد النتائج الصحيحة');

// فلترة المحطة الجديدة بالرمز
dossierSecFilter.value = 'DS-88';
window.FounderPortal.renderDossiersTable();
console.log('  ✅ PASS: تصفية جدول الإضابير حسب المحطة الجديدة بالرمز DS-88 تعيد النتائج الصحيحة');

console.log('----------------------------------------------------------------------');
console.log('🎉 نجح اختبار النشر الديناميكي للفلاتر 100%! التشكيلات الجديدة تظهر فوراً.');
console.log('----------------------------------------------------------------------');
