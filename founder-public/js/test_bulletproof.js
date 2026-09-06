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
  'components/dashboard.js', 'components/sections.js', 'components/section_workspace.js',
  'components/units.js', 'components/unit_workspace.js', 'components/station_workspace.js',
  'components/technical_status.js', 'components/documents.js', 'components/announcements.js',
  'components/notifications.js', 'components/employees.js', 'components/vehicles.js',
  'components/promotion_calculator.js', 'components/recycle_bin.js', 'components/profile.js',
  'components/audit_logs.js', 'components/super_admin.js', 'components/user_management.js',
  'components/dept_management.js', 'components/requests.js', 'app.js'
];

for (const s of scripts) {
  const code = fs.readFileSync(path.join(base, s), 'utf8');
  eval(code);
}

console.log('✅ ALL SCRIPTS PARSED & LOADED');

const usersToTest = [
  { email: 'ahmed.mgr@rumaila.iq', pwd: 'M1a2g3r4#2026', id: 'EMP-2024-001', role: 'DEPT_MANAGER' },
  { email: 'sec1@rumaila.iq', pwd: 'Sec1#Pass2026', id: 'EMP-2024-002', role: 'SECTION_MANAGER' },
  { email: 'sec2@rumaila.iq', pwd: 'Sec2#Pass2026', id: 'EMP-2024-003', role: 'SECTION_MANAGER' },
  { email: 'mohanad.tech@rumaila.iq', pwd: 'Unit1#Pass2026', id: 'EMP-2024-005', role: 'UNIT_MANAGER' },
  { email: 'ammar.emp@rumaila.iq', pwd: 'Emp1#Pass2026', id: 'EMP-2024-004', role: 'EMPLOYEE' }
];

const tabs = ['notifs', 'staff', 'docs', 'interviews', 'vehicles'];

usersToTest.forEach(u => {
  window.auth.login(u.email, u.pwd, u.id);
  const curUser = window.auth.getCurrentUser();
  console.log(`\nTesting Role [${curUser.role}] (${curUser.fullName})...`);

  window.app.navigate('dept_management');
  if (window.app.currentView !== 'dept_management') {
    throw new Error(`Current view should be dept_management but is ${window.app.currentView}`);
  }

  tabs.forEach(tab => {
    window.app.setDeptManagementSubTab(tab);
    const html = window.renderDeptManagementView();
    if (!html || html.length < 500) {
      throw new Error(`HTML for tab ${tab} is too short or empty: ${html ? html.length : 0}`);
    }
    console.log(`  ✓ Tab [${tab}] rendered (${html.length} chars)`);
  });
});

console.log('\nTesting empty database scenario...');
const db = window.store.getDb();
db.officialNotifications = [];
db.interviewRequests = [];
db.vehicleMovements = [];
db.documents = [];
window.store.saveDb(db);

window.auth.login('ammar.emp@rumaila.iq', 'Emp1#Pass2026', 'EMP-2024-004');
tabs.forEach(tab => {
  window.app.setDeptManagementSubTab(tab);
  const html = window.renderDeptManagementView();
  if (!html || html.length < 500) {
    throw new Error(`Empty DB HTML for tab ${tab} failed!`);
  }
  console.log(`  ✓ Empty DB Tab [${tab}] rendered with helpful message (${html.length} chars)`);
});

console.log('\n🎉 ALL ZERO-FAIL RESILIENCE CHECKS PASSED PERFECTLY!');
