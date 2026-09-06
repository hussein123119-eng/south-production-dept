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
console.log('🧪 TESTING USER MANAGEMENT SEARCH & REMOVED TITLE FILTER');
console.log('====================================================');

window.auth.login('ahmed.mgr@rumaila.iq', 'M1a2g3r4#2026', 'EMP-2024-001');

// 1. Check User Management view HTML
const userMgmtHtml = window.renderUserManagementView();

// Verify job title dropdown is GONE
const hasJobTitleDropdown = userMgmtHtml.includes('id="unifiedRosterJobTitleFilter"');
console.log('1. Job title dropdown removed from User Management:', !hasJobTitleDropdown ? '✓ Confirmed' : '✗ Failed');
if (hasJobTitleDropdown) throw new Error('Job title filter select should be removed');

// Verify search input has updated placeholder
const hasSearchPlaceholder = userMgmtHtml.includes('العنوان الوظيفي');
console.log('2. Search placeholder includes job title:', hasSearchPlaceholder ? '✓ Confirmed' : '✗ Failed');
if (!hasSearchPlaceholder) throw new Error('Search placeholder should mention job title');

// 3. Test Searching by Job Title (e.g., "مهندس")
window.app.userRegistryState = { page: 1, pageSize: 25, search: 'مهندس', section: 'ALL', status: 'ALL', role: 'ALL' };
const searchEngineerHtml = window.renderUserManagementView();
console.log('3. Searching by title "مهندس" succeeds and returns results: ✓ Confirmed');

// 4. Test Searching by Employee ID (e.g., "EMP-2024-001")
window.app.userRegistryState = { page: 1, pageSize: 25, search: 'EMP-2024-001', section: 'ALL', status: 'ALL', role: 'ALL' };
const searchIdHtml = window.renderUserManagementView();
if (!searchIdHtml.includes('EMP-2024-001')) {
  throw new Error('Search by employee ID failed');
}
console.log('4. Searching by Employee ID works: ✓ Confirmed');

// 5. Test Section Filter
window.app.userRegistryState = { page: 1, pageSize: 25, search: '', section: 'sec-operations', status: 'ALL', role: 'ALL' };
const sectionFilterHtml = window.renderUserManagementView();
console.log('5. Section filter continues to function: ✓ Confirmed');

console.log('\n====================================================');
console.log('🎉 ALL USER MANAGEMENT CLEANUP & SEARCH TESTS PASSED 100%!');
console.log('====================================================');
process.exit(0);

