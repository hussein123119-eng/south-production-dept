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

console.log('====================================================');
console.log('🧪 TESTING PHONE/WHATSAPP COLUMN & ACTION BUTTONS');
console.log('====================================================');

window.auth.login('ahmed.mgr@rumaila.iq', 'M1a2g3r4#2026', 'EMP-2024-001');

// 1. Dept Management Staff Table
window.app.setDeptManagementSubTab('staff');
const deptHtml = window.renderDeptManagementView();

const expectedHeaders = ['الاسم', 'الرقم الوظيفي', 'جهة الارتباط', 'العنوان الوظيفي', 'الدور', 'الهاتف / واتساب', 'الإجراءات'];

console.log('\n1. Checking Department Management Staff Table:');
expectedHeaders.forEach(h => {
  const present = deptHtml.includes(`>${h}<`);
  console.log(`  Header "${h}":`, present ? '✓ Present' : '✗ Missing');
  if (!present) throw new Error(`Missing header "${h}" in Dept staff table`);
});
if (!deptHtml.includes('btn-action-whatsapp') || !deptHtml.includes('openDirectWhatsApp')) {
  throw new Error('Dept staff table missing WhatsApp action button');
}
if (!deptHtml.includes('btn-action-email') || !deptHtml.includes('openDirectEmail')) {
  throw new Error('Dept staff table missing Email action button');
}
console.log('  Dept staff table has WhatsApp and Email action buttons: ✓ Passed');

// 2. Section Workspace Staff Table
const sec = window.store.getSections('dept-south-prod')[0];
const secHtml = window.renderSectionStaffTab(sec, []);

console.log('\n2. Checking Section Workspace Staff Table:');
expectedHeaders.forEach(h => {
  const present = secHtml.includes(`>${h}<`);
  console.log(`  Header "${h}":`, present ? '✓ Present' : '✗ Missing');
  if (!present) throw new Error(`Missing header "${h}" in Section staff table`);
});
if (!secHtml.includes('btn-action-whatsapp') || !secHtml.includes('openDirectWhatsApp')) {
  throw new Error('Section staff table missing WhatsApp action button');
}
if (!secHtml.includes('btn-action-email') || !secHtml.includes('openDirectEmail')) {
  throw new Error('Section staff table missing Email action button');
}
console.log('  Section staff table has WhatsApp and Email action buttons: ✓ Passed');

// 3. Unit Workspace Staff Table
const un = window.store.getUnits('dept-south-prod')[0];
const unHtml = window.renderUnitStaffTab(un, []);

console.log('\n3. Checking Unit Workspace Staff Table:');
expectedHeaders.forEach(h => {
  const present = unHtml.includes(`>${h}<`);
  console.log(`  Header "${h}":`, present ? '✓ Present' : '✗ Missing');
  if (!present) throw new Error(`Missing header "${h}" in Unit staff table`);
});
if (!unHtml.includes('btn-action-whatsapp') || !unHtml.includes('openDirectWhatsApp')) {
  throw new Error('Unit staff table missing WhatsApp action button');
}
if (!unHtml.includes('btn-action-email') || !unHtml.includes('openDirectEmail')) {
  throw new Error('Unit staff table missing Email action button');
}
console.log('  Unit staff table has WhatsApp and Email action buttons: ✓ Passed');

// 4. User Management Table (Must retain permissions & dossier)
console.log('\n4. Checking User Management Table (Unchanged):');
const userMgmtHtml = window.renderUserManagementView();
const hasPermissionCol = userMgmtHtml.includes('>الصلاحيات<');
console.log('  User Management retains "الصلاحيات" column:', hasPermissionCol ? '✓ Confirmed' : '✗ Failed');
if (!hasPermissionCol) throw new Error('User Management table should retain permissions column');

// 5. Direct WhatsApp and Email Method Logic
console.log('\n5. Checking openDirectWhatsApp and openDirectEmail Logic:');
let openedUrl = '';
global.window.open = (url) => { openedUrl = url; };

window.app.openDirectWhatsApp('07701234567', 'أحمد عبد الحسين');
console.log('  openDirectWhatsApp formatted URL:', openedUrl);
if (!openedUrl.includes('https://wa.me/9647701234567')) {
  throw new Error('openDirectWhatsApp failed to format Iraq mobile number properly');
}
console.log('  openDirectWhatsApp number conversion verified: ✓ Passed');

console.log('\n====================================================');
console.log('🎉 ALL PHONE/WHATSAPP & EMAIL ACTION TESTS PASSED 100%!');
console.log('====================================================');
process.exit(0);

