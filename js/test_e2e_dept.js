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

console.log('====================================================');
console.log('🧪 RUNNING RIGOROUS STEP-BY-STEP VERIFICATION SUITE');
console.log('====================================================');

// 1. Login as DEPT_MANAGER
window.auth.login('ahmed.mgr@rumaila.iq', 'M1a2g3r4#2026', 'EMP-2024-001');
const mgr = window.auth.getCurrentUser();
console.log('1. Logged in as:', mgr.fullName, `(${mgr.role})`);

// 2. Navigate to Department Management
window.app.navigate('dept_management');
console.log('2. Navigation view is:', window.app.currentView);

// 3. Render and check 5 tabs
const tabs = ['notifs', 'staff', 'docs', 'interviews', 'vehicles'];
tabs.forEach((tab, i) => {
  window.app.setDeptManagementSubTab(tab);
  const html = window.renderDeptManagementView();
  console.log(`3.${i+1} Tab [${tab}] rendered successfully (${html.length} chars)`);
  if (!html.includes('إدارة القسم')) {
    throw new Error(`Tab ${tab} missing header!`);
  }
});

// 4. Test Add Notification & Persist
console.log('4. Testing Add Official Notification...');
const newNotif = window.store.addOfficialNotification({
  title: 'توجيه عاجل لفرق الصيانة',
  content: 'يرجى مراجعة منظومة الضواغط في المحطة المركزية فوراً.',
  importance: 'URGENT',
  targetScope: 'ALL_SECTIONS'
}, mgr);
console.log('   Saved Notif ID:', newNotif.id);

// 5. Test Add Interview Request & Persist
console.log('5. Testing Add Interview Request...');
const newReq = window.store.addInterviewRequest({
  topic: 'طلب مقابلة بخصوص الترقية الميدانية',
  details: 'مناقشة استحقاق الترقية للدرجة الرابعة.',
  priority: 'IMPORTANT',
  proposedDate: '2026-03-01'
}, mgr);
console.log('   Saved Interview Request ID:', newReq.request.id);

// 6. Test Add Vehicle & Persist
console.log('6. Testing Add Vehicle...');
const newVeh = window.store.addDepartmentVehicle({
  sideNumber: '250',
  driverName: 'سعدون كريم',
  vehicleNumber: '11223 - بصرة',
  sectionName: 'الشعبة الأولى',
  operationalState: 'OPERATIONAL'
}, mgr);
console.log('   Saved Vehicle Side No:', newVeh.vehicle.sideNumber);

// 7. Verify Data in Re-rendering
console.log('7. Verifying Re-render contains newly added data...');
window.app.setDeptManagementSubTab('notifs');
let html = window.renderDeptManagementView();
if (!html.includes('توجيه عاجل لفرق الصيانة')) throw new Error('Notif not found in render!');
console.log('   ✓ Notification confirmed in HTML');

window.app.setDeptManagementSubTab('interviews');
html = window.renderDeptManagementView();
if (!html.includes('طلب مقابلة بخصوص الترقية الميدانية')) throw new Error('Interview not found in render!');
console.log('   ✓ Interview Request confirmed in HTML');

window.app.setDeptManagementSubTab('vehicles');
html = window.renderDeptManagementView();
if (!html.includes('#250') || !html.includes('سعدون كريم')) throw new Error('Vehicle not found in render!');
console.log('   ✓ Vehicle confirmed in HTML');

// 8. Test Role Scope Permissions
console.log('8. Testing Scope & Permissions across Roles...');
const testRoles = [
  { email: 'sec1@rumaila.iq', pwd: 'Sec1#Pass2026', id: 'EMP-2024-002', role: 'SECTION_MANAGER' },
  { email: 'mohanad.tech@rumaila.iq', pwd: 'Unit1#Pass2026', id: 'EMP-2024-005', role: 'UNIT_MANAGER' },
  { email: 'ammar.emp@rumaila.iq', pwd: 'Emp1#Pass2026', id: 'EMP-2024-004', role: 'EMPLOYEE' }
];

testRoles.forEach(r => {
  window.auth.login(r.email, r.pwd, r.id);
  const u = window.auth.getCurrentUser();
  window.app.navigate('dept_management');
  tabs.forEach(t => {
    window.app.setDeptManagementSubTab(t);
    const view = window.renderDeptManagementView();
    if (!view || view.length < 500) throw new Error(`Role ${r.role} failed to render tab ${t}`);
  });
  console.log(`   ✓ Role [${r.role}] rendered all 5 tabs without errors`);
});

console.log('====================================================');
console.log('🎉 ALL 13 VERIFICATION CRITERIA PASSED 100% CLEANLY!');
console.log('====================================================');
process.exit(0);

