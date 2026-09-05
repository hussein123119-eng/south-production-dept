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
global.document = {
  documentElement: { setAttribute: () => {}, getAttribute: () => 'light' },
  body: { classList: { toggle: () => {}, remove: () => {}, add: () => {} } },
  getElementById: () => ({ value: '', innerHTML: '', style: {}, classList: { add: () => {}, remove: () => {} } }),
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

console.log('✅ ALL SCRIPTS EVALUATED CLEANLY');

// Test 1: Render for DEPT_MANAGER
window.auth.login('ahmed.mgr@southprod.iq', 'password123', 'EMP-2024-001');
const userMgr = window.auth.getCurrentUser();
console.log('User 1 (Manager):', userMgr.fullName, '| Role:', userMgr.role);

const tabs = ['notifs', 'staff', 'docs', 'interviews', 'vehicles'];
tabs.forEach(t => {
  window.app.currentDeptManagementSubTab = t;
  const html = window.renderDeptManagementView();
  if (!html || html.length < 500) {
    throw new Error(`Render failed for tab ${t}: length ${html.length}`);
  }
  console.log(`  Tab "${t}" OK, rendered bytes:`, html.length);
});

// Test 2: Render for Regular EMPLOYEE
window.auth.login('emp1@southprod.iq', 'password123', 'EMP-2024-005');
const userEmp = window.auth.getCurrentUser();
console.log('User 2 (Employee):', userEmp.fullName, '| Role:', userEmp.role);
tabs.forEach(t => {
  window.app.currentDeptManagementSubTab = t;
  const html = window.renderDeptManagementView();
  if (!html || html.length < 500) {
    throw new Error(`Employee Render failed for tab ${t}: length ${html.length}`);
  }
  console.log(`  Tab "${t}" for Employee OK, rendered bytes:`, html.length);
});

// Test 3: Render when all collections are empty
const db = window.store.getDb();
db.officialNotifications = [];
db.interviewRequests = [];
db.vehicleMovements = [];
db.documents = [];
window.store.saveDb(db);

console.log('Testing with completely EMPTY collections...');
tabs.forEach(t => {
  window.app.currentDeptManagementSubTab = t;
  const html = window.renderDeptManagementView();
  if (!html || html.length < 200) {
    throw new Error(`Empty collection render failed for tab ${t}`);
  }
  console.log(`  Empty Tab "${t}" OK, rendered bytes:`, html.length);
});

// Test 4: App navigate to dept_management
window.app.navigate('dept_management');
console.log('App currentView after navigate:', window.app.currentView);
console.log('✅ ALL TESTS PASSED WITH 100% SUCCESS!');
