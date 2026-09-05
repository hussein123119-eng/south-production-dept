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

window.auth.login('ahmed.mgr@southprod.iq', 'password123', 'EMP-2024-001');
const user = window.auth.getCurrentUser();
console.log('Logged in as:', user.fullName, '| Role:', user.role);

// Test Dept Management rendering for all 5 tabs
const tabs = ['notifs', 'staff', 'docs', 'interviews', 'vehicles'];
tabs.forEach(tab => {
  window.app.currentDeptManagementSubTab = tab;
  const html = window.renderDeptManagementView();
  console.log(`Dept Management Tab "${tab}" Rendered OK, length:`, html.length);
});

// Test adding an interview request
const newReqRes = window.store.addInterviewRequest({
  topic: 'مقابلة فنية بخصوص خطوط الأنابيب',
  details: 'مناقشة أعمال التبطين والربط لمحطة القرينات',
  priority: 'URGENT',
  applicantSection: 'الشعبة الأولى'
}, user);
console.log('Add Interview Request Result:', newReqRes.success, '| ID:', newReqRes.request.id);

// Test adding a vehicle
const newVehRes = window.store.addDepartmentVehicle({
  sideNumber: '199',
  vehicleNumber: '99887 - بصرة',
  driverName: 'حامد جابر',
  sectionName: 'الشعبة الثانية',
  operationalState: 'OPERATIONAL'
}, user);
console.log('Add Vehicle Result:', newVehRes.success, '| Side No:', newVehRes.vehicle.sideNumber);

// Test Sidebar navigation link
const sidebar = window.renderSidebar('dept_management');
console.log('Sidebar has "إدارة القسم":', sidebar.includes('إدارة القسم'));
