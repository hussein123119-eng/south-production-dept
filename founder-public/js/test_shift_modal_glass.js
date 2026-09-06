const fs = require('fs');
const path = require('path');
const base = __dirname;

const localStorageData = {};

global.localStorage = {
  getItem: (k) => localStorageData[k] || null,
  setItem: (k, v) => { localStorageData[k] = v; },
  removeItem: (k) => { delete localStorageData[k]; }
};
const sessionStorageData = {};
global.sessionStorage = {
  getItem: (k) => sessionStorageData[k] || null,
  setItem: (k, v) => { sessionStorageData[k] = v; },
  removeItem: (k) => { delete sessionStorageData[k]; }
};
global.window = global;
global.location = { hostname: 'localhost', href: 'http://localhost:3000' };
lastModalTitle = '';
lastModalBody = '';

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

window.app.showModal = (title, body) => {
  lastModalTitle = title;
  lastModalBody = body;
};

console.log('--- Testing Glassmorphic Shift Settings Modal ---');
const loginRes = window.auth.login('ahmed.mgr@rumaila.iq', 'M1a2g3r4#2026', 'EMP-2024-001');
console.log('loginRes:', loginRes);
console.log('currentUser:', window.auth.getCurrentUser());
window.app.openShiftSettingsModal();

console.log('lastModalTitle:', lastModalTitle);
console.log('lastModalBody length:', lastModalBody.length);
if (!lastModalTitle) {
  throw new Error('lastModalTitle is empty');
}

const requiredClasses = [
  'shift-modal-container',
  'shift-hero-banner',
  'shift-hero-badge',
  'shift-pulse-live-dot',
  'shift-glass-grid',
  'shift-glass-card',
  'shift-card-header',
  'shift-preset-chips-container',
  'shift-preset-chip',
  'shift-live-preview-container'
];

  let allPassed = true;
requiredClasses.forEach(cls => {
  const present = lastModalBody.includes(cls);
  console.log('  Class .' + cls + ':', present ? '✓ Present' : '�� Missing');
  if (!present) allPassed = false;
});

if (!allPassed) throw new Error('Missing glassmorphic classes');

console.log('\n2. Checking Input Elements:');
const requiredElems = ['shiftStartTimeInput', 'shiftDurationSelect', 'shiftReferenceSelect', 'shiftRefDateInput', 'shiftLivePreviewBox', 'shiftNotesInput'];
requiredElems.forEach(id => {
  const present = lastModalBody.includes('id="' + id + '"');
  console.log('  Element #' + id + ':', present ? '✓ Present' : ' Missing');
  if (!present) allPassed = false;
});

if (!allPassed) throw new Error('Missing elements');

['06:00', '07:00', '07:30', '08:00', '08:30'].forEach(time => {
  const present = lastModalBody.includes("setShiftStartTimePreset('" + time + "')");
  console.log('  Chip ' + time + ':', present ? '✓ Present' : '✗ Missing');
  if (!present) allPassed = false;
});

if (!allPassed) throw new Error('Missing chips');

console.log('\n====================================================');
console.log('🎉 ALL GLASSMORPHIC SHIFT MODAL CHECKS PASSED 100%!');
console.log('====================================================');
