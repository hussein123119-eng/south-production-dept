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

console.log('✅ ALL SCRIPTS EVALUATED CLEANLY');

window.auth.login('ahmed.mgr@rumaila.iq', 'M1a2g3r4#2026', 'EMP-2024-001');
const user = window.auth.getCurrentUser();
console.log('Logged in as:', user.fullName, '| Role:', user.role);

// Test Groups & RBAC
const groups = window.rbac.getPermissionGroups();
console.log('Organized Permission Groups Count:', groups.length);
groups.forEach(g => {
  console.log(`  - ${g.icon} ${g.name}: ${g.permissions.length} sub-permissions`);
});

// Test File Management Group specifically
const filesGroup = groups.find(g => g.id === 'group_files');
console.log('Files Group Name:', filesGroup.name, '| Sub-permissions:', filesGroup.permissions.map(p => p.key).join(', '));

// Test User Management View Render
const userMgmtHtml = window.renderUserManagementView();
console.log('User Management View Rendered? Length:', userMgmtHtml.length);
console.log('Contains new Title "إدارة المستخدمين":', userMgmtHtml.includes('إدارة المستخدمين'));

// Test Permission Checks
const testUser = {
  role: 'SECTION_MANAGER',
  sectionId: 'sec-1',
  customPermissions: ['FILES_VIEW', 'FILES_OPEN', 'FILES_UPLOAD', 'FILES_EDIT', 'FILES_DOWNLOAD', 'FILES_EXPORT', 'FILES_PRINT', 'FILES_SEND', 'FILES_PUBLISH']
};

console.log('Test SM has FILES_VIEW:', window.rbac.hasPermission(testUser, 'FILES_VIEW'));
console.log('Test SM has FILES_DELETE (not granted):', window.rbac.hasPermission(testUser, 'FILES_DELETE'));
console.log('Test SM has FILES_EXPORT (custom granted):', window.rbac.hasPermission(testUser, 'FILES_EXPORT'));
console.log('Test SM has FILES_ARCHIVE (not granted):', window.rbac.hasPermission(testUser, 'FILES_ARCHIVE'));
process.exit(0);

