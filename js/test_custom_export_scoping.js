const fs = require('fs');
const path = require('path');
const assert = require('assert');

const base = __dirname;
const localStorageData = {};
global.localStorage = {
  getItem: (k) => localStorageData[k] || null,
  setItem: (k, v) => { localStorageData[k] = v; },
  removeItem: (k) => { delete localStorageData[k]; }
};
global.sessionStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
global.window = global;
global.location = { hostname: 'localhost', href: 'http://localhost:3000' };
global.window.location = global.location;
global.alert = (msg) => {};
global.confirm = (msg) => true;

let lastModalTitle = '';
let lastModalBody = '';
let mockElementMap = {};

global.document = {
  documentElement: { setAttribute: () => {}, getAttribute: () => 'light' },
  body: { classList: { toggle: () => {}, remove: () => {}, add: () => {} } },
  getElementById: (id) => {
    if (mockElementMap[id]) return mockElementMap[id];
    return { value: '', innerHTML: '', innerText: '', style: {}, classList: { add: () => {}, remove: () => {} } };
  },
  querySelector: () => null,
  querySelectorAll: (selector) => {
    if (selector === '.custom-exp-field:checked') {
      return [{ value: 'fullName' }, { value: 'employeeId' }, { value: 'jobTitle' }];
    }
    return [];
  },
  addEventListener: () => {}
};

const scripts = [
  'store.js', 'auth.js', 'rbac.js', 'utils/exporter.js',
  'components/sidebar.js', 'components/topbar.js', 'components/announcement_bar.js',
  'components/dashboard.js', 'components/sections.js', 'components/section_workspace.js',
  'components/units.js', 'components/unit_workspace.js', 'components/station_workspace.js',
  'components/technical_status.js', 'components/documents.js', 'components/announcements.js',
  'components/notifications.js', 'components/employees.js', 'components/vehicles.js',
  'components/promotion_calculator.js', 'components/recycle_bin.js', 'components/profile.js',
  'components/audit_logs.js', 'components/super_admin.js', 'components/user_management.js',
  'components/mail_system.js', 'components/dept_management.js', 'components/requests.js', 'app.js'
];

for (const s of scripts) {
  const code = fs.readFileSync(path.join(base, s), 'utf8');
  eval(code);
}

// Mock showModal to capture modal content
window.app.showModal = (title, bodyHtml) => {
  lastModalTitle = title;
  lastModalBody = bodyHtml;
};

// Mock exporter methods
let lastExportCall = null;
window.exporter.exportToStyledExcel = (title, headers, rows, meta) => {
  lastExportCall = { type: 'EXCEL', title, headers, rows, meta };
};
window.exporter.exportToWordDoc = (title, subtitle, headers, rows, meta) => {
  lastExportCall = { type: 'WORD', title, subtitle, headers, rows, meta };
};
window.exporter.printDocument = (title, subtitle, html, meta) => {
  lastExportCall = { type: 'PRINT', title, subtitle, html, meta };
};

console.log('====================================================');
console.log('🧪 TESTING CUSTOM EXPORT SCOPING HIERARCHY');
console.log('====================================================');

// 1. Login as DEPT_MANAGER
window.auth.login('ahmed.mgr@rumaila.iq', 'M1a2g3r4#2026', 'EMP-2024-001');
const db = window.store.getDb();
const allStaff = window.store.getUnifiedEmployeeRoster(window.auth.getCurrentUser());

// ----------------------------------------------------
// TEST 1: Department Context (كافة كادر القسم)
// ----------------------------------------------------
console.log('\n--- 1. Testing Department Context (No Options) ---');
window.app.openCustomStaffExportModal();
assert(lastModalTitle.includes('كافة كادر ومنتسبي القسم'), 'Title must mention department staff');
assert(lastModalBody.includes('value="ALL"'), 'Dropdown must include ALL option for department');
assert(lastModalBody.includes('🌐 كافة كادر قسم الإنتاج الجنوبي'), 'Must show department wide label');
assert(lastModalBody.includes('الشعبة الأولى') && lastModalBody.includes('الشعبة الثانية'), 'Must list all sections');
console.log('✓ Test 1.1 Passed: Department context shows all staff and full section freedom.');

// ----------------------------------------------------
// TEST 2: Section Context (الشعبة ومحطاتها فقط)
// ----------------------------------------------------
console.log('\n--- 2. Testing Section Context (sec-1) ---');
const sec1 = db.sections.find(s => s.id === 'sec-1') || db.sections[0];
const sec1Stations = db.stations.filter(st => st.sectionId === sec1.id);
const sec1Staff = allStaff.filter(e => e.sectionId === sec1.id);

window.app.openCustomStaffExportModal({ sectionId: sec1.id, scopeType: 'SECTION' });

assert(lastModalTitle.includes(sec1.name), 'Title must be scoped to section name');
const secScopeMatch = lastModalBody.match(/<select id="customExportScopeSelect"[^>]*>([\s\S]*?)<\/select>/);
const secScopeHtml = secScopeMatch ? secScopeMatch[1] : '';

assert(secScopeHtml.includes(`value="SECTION:${sec1.id}"`), 'Must have section option');
assert(secScopeHtml.includes(`كافة كادر شعبة ${sec1.name} ومحطاتها`), 'Must have section and its stations label');

// Must NOT have 'ALL' option in scope dropdown
assert(!secScopeHtml.includes('value="ALL"'), 'Section modal scope select must NOT include global ALL option');
// Must NOT have other sections (e.g. sec-2)
const otherSec = db.sections.find(s => s.id !== sec1.id);
if (otherSec) {
  assert(!secScopeHtml.includes(`value="SECTION:${otherSec.id}"`), `Section modal must NOT include ${otherSec.name}`);
}

// Must list sec1 stations
if (sec1Stations.length > 0) {
  assert(secScopeHtml.includes(`value="STATION:${sec1Stations[0].id}"`), 'Section modal must list its own stations');
}

// Mock elements for change handler
mockElementMap = {
  customExportScopeSelect: { value: `SECTION:${sec1.id}` },
  customExportShiftFilter: { value: 'ALL' },
  customExportFilterSearch: { value: '' },
  customExportTargetCount: { innerText: '' }
};

window.app.handleCustomExportScopeChange();
assert.strictEqual(mockElementMap.customExportTargetCount.innerText, `${sec1Staff.length} منتسب محدد`, 'Count must match section staff');

// Test export in section context
window.app.executeCustomStaffExport('EXCEL');
assert(lastExportCall, 'Export must be executed');
assert.strictEqual(lastExportCall.rows.length, sec1Staff.length, 'Exported rows count must match section staff');
assert(lastExportCall.meta.sectionName.includes(sec1.name), 'Export meta section name must match section');

console.log('✓ Test 2.1 Passed: Section context displays ONLY section data & its stations.');
console.log('✓ Test 2.2 Passed: Section export output strictly scoped to section staff.');

// ----------------------------------------------------
// TEST 3: Station Context (المحطة فقط)
// ----------------------------------------------------
console.log('\n--- 3. Testing Station Context ---');
const targetStation = sec1Stations[0] || db.stations[0];
const targetStationStaff = allStaff.filter(e => e.stationId === targetStation.id);

window.app.openCustomStaffExportModal({ stationId: targetStation.id, scopeType: 'STATION' });

assert(lastModalTitle.includes(targetStation.name), 'Title must be scoped to station name');
const stScopeMatch = lastModalBody.match(/<select id="customExportScopeSelect"[^>]*>([\s\S]*?)<\/select>/);
const stScopeHtml = stScopeMatch ? stScopeMatch[1] : '';

assert(stScopeHtml.includes(`value="STATION:${targetStation.id}"`), 'Must have station option');
assert(!stScopeHtml.includes('value="ALL"'), 'Station modal scope select must NOT include global ALL option');
if (otherSec) {
  assert(!stScopeHtml.includes(`value="SECTION:${otherSec.id}"`), 'Station modal must NOT include other sections');
}

mockElementMap = {
  customExportScopeSelect: { value: `STATION:${targetStation.id}` },
  customExportShiftFilter: { value: 'ALL' },
  customExportFilterSearch: { value: '' },
  customExportTargetCount: { innerText: '' }
};

window.app.handleCustomExportScopeChange();
assert.strictEqual(mockElementMap.customExportTargetCount.innerText, `${targetStationStaff.length} منتسب محدد`, 'Count must match station staff');

window.app.executeCustomStaffExport('EXCEL');
assert.strictEqual(lastExportCall.rows.length, targetStationStaff.length, 'Exported rows count must match station staff');
console.log('✓ Test 3.1 Passed: Station context displays ONLY station data.');

// ----------------------------------------------------
// TEST 4: Unit Context (الوحدة فقط)
// ----------------------------------------------------
console.log('\n--- 4. Testing Unit Context ---');
const targetUnit = db.units[0];
if (targetUnit) {
  const targetUnitStaff = allStaff.filter(e => e.unitId === targetUnit.id || (targetUnit.sectionId && e.sectionId === targetUnit.sectionId && !e.stationId));
  window.app.openCustomStaffExportModal({ unitId: targetUnit.id, scopeType: 'UNIT' });

  assert(lastModalTitle.includes(targetUnit.name), 'Title must be scoped to unit name');
  const unitScopeMatch = lastModalBody.match(/<select id="customExportScopeSelect"[^>]*>([\s\S]*?)<\/select>/);
  const unitScopeHtml = unitScopeMatch ? unitScopeMatch[1] : '';

  assert(unitScopeHtml.includes(`value="UNIT:${targetUnit.id}"`), 'Must have unit option');
  assert(!unitScopeHtml.includes('value="ALL"'), 'Unit modal scope select must NOT include global ALL option');

  mockElementMap = {
    customExportScopeSelect: { value: `UNIT:${targetUnit.id}` },
    customExportShiftFilter: { value: 'ALL' },
    customExportFilterSearch: { value: '' },
    customExportTargetCount: { innerText: '' }
  };

  window.app.handleCustomExportScopeChange();
  assert.strictEqual(mockElementMap.customExportTargetCount.innerText, `${targetUnitStaff.length} منتسب محدد`, 'Count must match unit staff');
  console.log('✓ Test 4.1 Passed: Unit context displays ONLY unit data.');
}

// ----------------------------------------------------
// TEST 5: Role Filtering (تصفية حسب الدور الوظيفي)
// ----------------------------------------------------
console.log('\n--- 5. Testing Role Filtering in Custom Export ---');
window.app.openCustomStaffExportModal();
assert(lastModalBody.includes('id="customExportRoleFilter"'), 'Modal must contain customExportRoleFilter select element');
assert(lastModalBody.includes('value="AUTHORIZED_DRIVER"'), 'Role filter must include AUTHORIZED_DRIVER');
assert(lastModalBody.includes('value="DRIVER"'), 'Role filter must include DRIVER');
assert(lastModalBody.includes('value="NO_ACCOUNT"'), 'Role filter must include NO_ACCOUNT');
assert(lastModalBody.includes('value="roleName"'), 'Modal must include roleName export checkbox');

// Test role filter SECTION_MANAGER (present in seed data)
const secMgrCount = allStaff.filter(e => e.role === 'SECTION_MANAGER').length;
mockElementMap = {
  customExportScopeSelect: { value: 'ALL' },
  customExportShiftFilter: { value: 'ALL' },
  customExportRoleFilter: { value: 'SECTION_MANAGER' },
  customExportFilterSearch: { value: '' },
  customExportTargetCount: { innerText: '' }
};

window.app.handleCustomExportScopeChange();
assert.strictEqual(mockElementMap.customExportTargetCount.innerText, `${secMgrCount} منتسب محدد`, 'Badge count must match SECTION_MANAGER count');

window.app.executeCustomStaffExport('EXCEL');
assert.strictEqual(lastExportCall.rows.length, secMgrCount, 'Exported rows count must match SECTION_MANAGER staff');
assert(lastExportCall.meta.scopeName.includes('الدور:'), 'Scope name must contain role label');

// Test DRIVER & AUTHORIZED_DRIVER dynamically by assigning role to linked user in db
const targetUser = db.users.find(u => u.employeeId && allStaff.some(s => s.employeeId === u.employeeId));
if (targetUser) {
  const prevUserRole = targetUser.role;
  
  targetUser.role = 'DRIVER';
  mockElementMap.customExportRoleFilter.value = 'DRIVER';
  window.app.handleCustomExportScopeChange();
  const currentDriverCount = window.store.getUnifiedEmployeeRoster(window.auth.getCurrentUser()).filter(e => e.role === 'DRIVER').length;
  assert.strictEqual(mockElementMap.customExportTargetCount.innerText, `${currentDriverCount} منتسب محدد`, 'Badge count must match DRIVER count');
  window.app.executeCustomStaffExport('EXCEL');
  assert.strictEqual(lastExportCall.rows.length, currentDriverCount, 'Exported rows must match DRIVER count');
  assert(lastExportCall.meta.scopeName.includes('سائق'), 'Scope name must mention driver role');

  targetUser.role = 'AUTHORIZED_DRIVER';
  mockElementMap.customExportRoleFilter.value = 'AUTHORIZED_DRIVER';
  window.app.handleCustomExportScopeChange();
  const currentAuthDriverCount = window.store.getUnifiedEmployeeRoster(window.auth.getCurrentUser()).filter(e => e.role === 'AUTHORIZED_DRIVER').length;
  assert.strictEqual(mockElementMap.customExportTargetCount.innerText, `${currentAuthDriverCount} منتسب محدد`, 'Badge count must match AUTHORIZED_DRIVER count');
  window.app.executeCustomStaffExport('EXCEL');
  assert.strictEqual(lastExportCall.rows.length, currentAuthDriverCount, 'Exported rows must match AUTHORIZED_DRIVER count');
  assert(lastExportCall.meta.scopeName.includes('سائق مخول'), 'Scope name must mention authorized driver role');

  targetUser.role = prevUserRole;
}

// Test role filter NO_ACCOUNT
const noAccountCount = allStaff.filter(e => !e.role || !e.hasAccount).length;
mockElementMap.customExportRoleFilter.value = 'NO_ACCOUNT';
window.app.handleCustomExportScopeChange();
assert.strictEqual(mockElementMap.customExportTargetCount.innerText, `${noAccountCount} منتسب محدد`, 'Badge count must match NO_ACCOUNT count');

window.app.executeCustomStaffExport('EXCEL');
assert.strictEqual(lastExportCall.rows.length, noAccountCount, 'Exported rows count must match NO_ACCOUNT staff');
assert(lastExportCall.meta.scopeName.includes('بدون حساب مستخدم'), 'Scope name must contain no account label');

console.log('✓ Test 5.1 Passed: Role filter properly renders and accurately scopes staff by role, drivers, and no-account status.');

console.log('====================================================');
console.log('🎉 ALL CUSTOM EXPORT SCOPING & ROLE TESTS PASSED 100% PERFECTLY!');
console.log('====================================================');
process.exit(0);

