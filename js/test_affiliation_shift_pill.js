const fs = require('fs');
const path = require('path');
const base = __dirname;

const localStorageData = {};
localStorageData['config_shift_settings'] = JSON.stringify({
  startTime: '07:30',
  shiftDurationHours: 24,
  referenceShift: 'A',
  referenceDate: '2026-01-01T07:30:00Z',
  notes: 'تنويهات شغيلية'
});

global.localStorage = {
  getItem: (k) => localStorageData[k] || null,
  setItem: (k, v) => { localStorageData[k] = v; },
  removeItem: (k) => { delete localStorageData[k]; }
};
const sessionStorageData = {};
localStorageData['users'] = null;
global.sessionStorage = {
  getItem: (k) => sessionStorageData[k] || null,
  setItem: (k, v) => { sessionStorageData[k] = v; },
  removeItem: (k) => { delete sessionStorageData[k]; }
};
global.window = global;
global.location = { hostname: 'localhost', href: 'http://localhost:3000' };

global.document = {
  documentElement: { setAttribute: () => {}, getAttribute: () => 'light' },
  body: { classList: { toggle: () => {}, remove: () => {}, add: () => {} } },
  getElementById: (id) => ({
    id,
    value: '07:30',
    innerHTML: '',
    style: {},
    classList: {add: () => {}, remove: () => {}, contains: () => false}
  }),
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

console.log('--- Testing Affiliation Column (Station + Shift Pill) ---');
window.auth.login('ahmed.mgr@rumaila.iq', 'M1a2g3r4#2026', 'EMP-2024-001');

// 1. Test User Management View for Employee EMP-2024-004 (Ammar - Shift B)
const usersHtml = window.renderUserManagementView();

console.log('1. User Management Table Checks:');
const hasPinUMS = usersHtml.includes('👍 الموقع:');
console.log('  Does NOT contain \"👍 الموقعغ\":', !hasPinUMS ? '✓ Passed' : '�� Failed');
if (hasPinUMS) throw new Error('User management table still contains pin/extra label');

console.log('  Contains shift pill roster-shift-pill for Shift B:', usersHtml.includes('roster-shift-pill shift-B') ? '✓ Passed' : '�� Failed');
if (!usersHtml.includes('roster-shift-pill shift-B')) throw new Error('Shift pill missing in user management');

// 2. Test Section Workspace Staff Table
const sec = window.store.getSections('dept-south-prod')[0];
const secHtml = window.renderSectionStaffTab(sec, []);

console.log('\n2. Section Workspace Staff Table Checks:');
console.log('  Does NOT contain "الموقع:":', !secHtml.includes('الموقع:') ? '✓ Passed' : '✗ Failed');
if (secHtml.includes('الموقع:')) throw new Error('Section table still contains pin/extra label');

console.log('  Contains shift pill roster-shift-pill for Shift B:', secHtml.includes('roster-shift-pill shift-B') ? '✓ Passed' : '✗ Failed');
if (!secHtml.includes('roster-shift-pill shift-B')) throw new Error('Shift pill missing in section table');

// 3. Test Department Management Staff Table
window.app.setDeptManagementSubTab('staff');
const deptHtml = window.renderDeptManagementView();

console.log('\n3. Department Management Staff Table Checks:');
console.log('  Does NOT contain "الموقع:":', !deptHtml.includes('الموقع:') ? '✓ Passed' : '✗ Failed');
if (deptHtml.includes('الموقع:')) throw new Error('Dept table still contains extra label');

console.log('  Contains shift pill roster-shift-pill for Shift B:', deptHtml.includes('roster-shift-pill shift-B') ? '✓ Passed' : '✗ Failed');
if (!deptHtml.includes('roster-shift-pill shift-B')) throw new Error('Shift pill missing in dept table');

console.log('\n====================================================');
console.log('🎉 ALL AFFILIATION & SHIFT PILL CHECKS PASSED 100%!');
console.log('====================================================');
