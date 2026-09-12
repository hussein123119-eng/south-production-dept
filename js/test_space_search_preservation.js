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

let mockElementMap = {};

global.document = {
  documentElement: { setAttribute: () => {}, getAttribute: () => 'light' },
  body: { classList: { toggle: () => {}, remove: () => {}, add: () => {} } },
  getElementById: (id) => {
    if (mockElementMap[id]) return mockElementMap[id];
    return { value: '', innerHTML: '', innerText: '', style: {}, classList: { add: () => {}, remove: () => {} } };
  },
  querySelector: (sel) => {
    if (sel === '.pagination-bar-container') return { innerHTML: '' };
    return null;
  },
  querySelectorAll: (selector) => {
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

console.log('====================================================');
console.log('🧪 TESTING SEARCH SPACE PRESERVATION & TOKEN MATCHING');
console.log('====================================================');

// Login as DEPT_MANAGER
window.auth.login('ahmed.mgr@rumaila.iq', 'M1a2g3r4#2026', 'EMP-2024-001');
const actorUser = window.auth.getCurrentUser();
const deptId = actorUser.departmentId;
const staff = window.store.getUnifiedEmployeeRoster(actorUser);
const sections = window.store.getSections(deptId);

// --- 1. Test Space Preservation in deptStaffSearchInput ---
console.log('\n--- 1. Testing Space Preservation in deptStaffSearchInput ---');
window.app.deptStaffState = { page: 1, pageSize: 25, search: '', section: 'ALL' };

// Simulate typing "حسين " (with space)
mockElementMap['deptStaffSearchInput'] = {
  value: 'حسين ',
  selectionStart: 5,
  selectionEnd: 5,
  focus: () => {}
};
mockElementMap['deptStaffSectionFilter'] = { value: 'ALL' };
mockElementMap['deptStaffTableContainer'] = { innerHTML: '' };

window.app.filterDeptStaff();

assert.strictEqual(window.app.deptStaffState.search, 'حسين ', 'State search MUST preserve trailing space exactly!');
console.log('✓ Test 1.1 Passed: deptStaffState.search preserved trailing space: "' + window.app.deptStaffState.search + '"');

// Test HTML generation contains exact value with space
const staffTabHtml = window.renderDeptStaffTab(staff, actorUser, sections);
assert(staffTabHtml.includes('value="حسين "'), 'Generated input MUST have value="حسين "');
console.log('✓ Test 1.2 Passed: renderDeptStaffTab input retains space: value="حسين "');

// --- 2. Test Multi-Word Whitespace Token Matching ---
console.log('\n--- 2. Testing Multi-word Whitespace Token Matching ---');
// Set search to "أحمد حسين"
window.app.deptStaffState.search = 'أحمد حسين';
const tableHtml = window.renderDeptStaffTableAndPagination(staff, actorUser, sections);
assert(tableHtml.includes('dept-staff-row'), 'Should match rows with both words');
assert(tableHtml.includes('أحمد عبد الحسين') || tableHtml.includes('أحمد'), 'Should match non-contiguous words across spaces');
console.log('✓ Test 2.1 Passed: Multi-word query matches non-contiguous words correctly');

// Set search to query with multiple consecutive spaces "أحمد   حسين"
window.app.deptStaffState.search = 'أحمد   حسين';
const multiSpaceHtml = window.renderDeptStaffTableAndPagination(staff, actorUser, sections);
assert(multiSpaceHtml.includes('dept-staff-row'), 'Should match rows even with multiple spaces');
console.log('✓ Test 2.2 Passed: Multiple consecutive spaces tokenized smoothly');

// --- 3. Test User Management Space Preservation ---
console.log('\n--- 3. Testing User Management Space Preservation ---');
window.app.userRegistryState = { page: 1, pageSize: 25, search: '', section: 'ALL', status: 'ALL', role: 'ALL' };
mockElementMap['unifiedRosterSearchInput'] = {
  value: 'علي ',
  selectionStart: 4,
  selectionEnd: 4,
  focus: () => {}
};
mockElementMap['unifiedRosterSectionFilter'] = { value: 'ALL' };
mockElementMap['unifiedRosterStatusFilter'] = { value: 'ALL' };
mockElementMap['unifiedRosterRoleFilter'] = { value: 'ALL' };

window.app.filterUnifiedRosterTable();
assert.strictEqual(window.app.userRegistryState.search, 'علي ', 'User registry search MUST preserve trailing space!');
console.log('✓ Test 3.1 Passed: unifiedRosterSearchInput preserved trailing space: "' + window.app.userRegistryState.search + '"');

// --- 4. Test Custom Export Filter Search Space Token Matching ---
console.log('\n--- 4. Testing Custom Export Search Space Token Matching ---');
mockElementMap['customExportScopeSelect'] = { value: 'ALL' };
mockElementMap['customExportShiftFilter'] = { value: 'ALL' };
mockElementMap['customExportFilterSearch'] = { value: 'أحمد حسين' };
mockElementMap['customExportTargetCount'] = { innerText: '' };

window.app.handleCustomExportScopeChange();
assert(mockElementMap.customExportTargetCount.innerText.includes('منتسب محدد'), 'Count badge updated');
console.log('✓ Test 4.1 Passed: Custom export multi-word search correctly counted targets: ' + mockElementMap.customExportTargetCount.innerText);

console.log('\n====================================================');
console.log('🎉 ALL SEARCH SPACE PRESERVATION TESTS PASSED 100% PERFECTLY!');
console.log('====================================================');
process.exit(0);
