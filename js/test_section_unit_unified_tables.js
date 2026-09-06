const fs = require('fs');
const path = require('path');
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
global.document = {
  documentElement: { setAttribute: () => {}, getAttribute: () => 'light' },
  body: { classList: { toggle: () => {}, remove: () => {}, add: () => {} } },
  getElementById: () => ({ value: '', innerHTML: '', style: {}, classList: { add: () => {}, remove: () => {} } }),
  querySelector: () => null,
  querySelectorAll: () => [],
  addEventListener: () => {}
};

const scripts = [
  'store.js', 'auth.js', 'rbac.js', 'utils/exporter.js',
  'components/sidebar.js', 'components/topbar.js', 'components/announcement_bar.js',
  'components/dashboard.js', 'components/dept_management.js', 'components/section_workspace.js', 'components/unit_workspace.js',
  'components/user_management.js', 'app.js'
];

for (const s of scripts) {
  const code = fs.readFileSync(path.join(base, s), 'utf8');
  eval(code);
}

console.log('--- Testing Unified 7-Column Tables in Dept, Section & Unit Workspaces ---');

window.auth.login('ahmed.mgr@rumaila.iq', 'M1a2g3r4#2026', 'EMP-2024-001');
const expectedHeaders = ['الاسم', 'الرقم الوظيفي', 'جهة الارتباط', 'العنوان الوظيفي', 'الدور', 'ملاحظات', 'الإجراءات'];

// 1. Test Department Management Staff Table
window.app.setDeptManagementSubTab('staff');
const deptHtml = window.renderDeptManagementView();
console.log('\n1. Checking Department Management Staff Table Headers:');
let deptAllPresent = true;
expectedHeaders.forEach(h => {
  const present = deptHtml.includes(`>${h}<`);
  console.log(`  Header "${h}":`, present ? '✓ Present' : '✗ Missing');
  if (!present) deptAllPresent = false;
});
if (!deptAllPresent) throw new Error('Missing headers in Dept staff table');

// 2. Test Section Workspace Staff Table
const sec = window.store.getSections('dept-south-prod')[0];
const secHtml = window.renderSectionStaffTab(sec, []);

console.log('\n2. Checking Section Workspace Staff Table Headers:');
let secAllPresent = true;
expectedHeaders.forEach(h => {
  const present = secHtml.includes(`>${h}<`);
  console.log(`  Header "${h}":`, present ? '✓ Present' : '✗ Missing');
  if (!present) secAllPresent = false;
});
if (!secAllPresent) throw new Error('Missing headers in Section staff table');

// 3. Test Unit Workspace Staff Table
const un = window.store.getUnits('dept-south-prod')[0];
const unHtml = window.renderUnitStaffTab(un, []);

console.log('\n3. Checking Unit Workspace Staff Table Headers:');
let unAllPresent = true;
expectedHeaders.forEach(h => {
  const present = unHtml.includes(`>${h}<`);
  console.log(`  Header "${h}":`, present ? '✓ Present' : '✗ Missing');
  if (!present) unAllPresent = false;
});
if (!unAllPresent) throw new Error('Missing headers in Unit staff table');

console.log('\n====================================================');
console.log('🎉 ALL DEPT, SECTION & UNIT UNIFIED TABLE CHECKS PASSED 100%!');
console.log('====================================================');
