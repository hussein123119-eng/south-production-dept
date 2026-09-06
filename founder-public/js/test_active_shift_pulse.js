const fs = require('fs');
const path = require('path');
const base = __dirname;

const localStorageData = {};
localStorageData['config_shift_settings'] = JSON.stringify({
  startTime: '07:30',
  shiftDurationHours: 24,
  referenceShift: 'B',
  referenceDate: new Date().isoString ? new Date().toISOString() : '2026-09-07T00:00:00Z',
  notes: 'تنويهات نوباة'
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

console.log('--- Testing Active Working Shift Pulsing Badges ---');
window.auth.login('ahmed.mgr@rumaila.iq', 'M1a2g3r4#2026', 'EMP-2024-001');

const currentShift = window.store.getCurrentShiftInfo().currentShift;
console.log('Current Active Shift From Engine:', currentShift);

// 1. Test User Management View
const usersHtml = window.renderUserManagementView();
const hasActivePulseUMS = usersHtml.includes('active-working-shift');
console.log('1. User Management contains active-working-shift pulse:', hasActivePulseUMS ? '✓ Passed' : '✗ Failed');
if (!hasActivePulseUMS) throw new Error('Pulse badge missing in user management');

// 2. Test Section Workspace Staff Tab
const sec = window.store.getSections('dept-south-prod')[0];
const secHtml = window.renderSectionStaffTab(sec, []);
const hasActivePulseSec = secHtml.includes('active-working-shift');
console.log('2. Section Workspace contains active-working-shift pulse:', hasActivePulseSec ? '✓ Passed' : '✗ Failed');
if (!hasActivePulseSec) throw new Error('Pulse badge missing in section workspace');

// 3. Test Department Management Staff Tab
window.app.setDeptManagementSubTab('staff');
const deptHtml = window.renderDeptManagementView();
const hasActivePulseDept = deptHtml.includes('active-working-shift');
console.log('3. Department Management contains active-working-shift pulse:', hasActivePulseDept ? '✓ Passed' : '✗ Failed');
if (!hasActivePulseDept) throw new Error('Pulse badge missing in department management');

console.log('\n====================================================');
console.log('🎉 ALL ACTIVE WORKING SHIFT PULSE TESTS PASSED 100%!');
console.log('====================================================');
process.exit(0);