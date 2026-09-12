const fs = require('fs');
const path = require('path');
const assert = require('assert');

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
  'components/mail_system.js', 'components/dept_management.js', 'components/requests.js', 'app.js'
];

for (const s of scripts) {
  const code = fs.readFileSync(path.join(base, s), 'utf8');
  eval(code);
}

console.log('====================================================');
console.log('🧪 TESTING TAB ORDER: MAIL IS 2ND TAB AFTER STAFF');
console.log('====================================================');

// Helper to extract tab button onclick target names from tabs-header in order
function extractTabsOrder(html) {
  const tabsHeaderMatch = html.match(/<div class="tabs-header"[^>]*>([\s\S]*?)<\/div>/);
  if (!tabsHeaderMatch) return [];
  const headerContent = tabsHeaderMatch[1];
  const regex = /onclick="window\.app\.(?:setDeptManagementSubTab|setSectionSubTab|setStationSubTab|setUnitSubTab)\('([^']+)'\)"/g;
  const matches = [];
  let m;
  while ((m = regex.exec(headerContent)) !== null) {
    matches.push(m[1]);
  }
  return matches;
}

// 1. Login as DEPT_MANAGER
window.auth.login('ahmed.mgr@rumaila.iq', 'M1a2g3r4#2026', 'EMP-2024-001');

// Test 1: Department Management
window.app.navigate('dept_management');
const deptHtml = window.renderDeptManagementView();
const deptTabs = extractTabsOrder(deptHtml);
console.log('Dept Tabs:', deptTabs);
assert.strictEqual(deptTabs[0], 'staff', 'Dept 1st tab must be staff');
assert.strictEqual(deptTabs[1], 'mail', 'Dept 2nd tab must be mail');
console.log('✓ Test 1 Passed: Dept tab 1 is staff, tab 2 is mail.');

// Test 2: Section Workspace
window.app.navigate('section_workspace', 'sec-1');
const secHtml = window.renderSectionWorkspaceView('sec-1');
const secTabs = extractTabsOrder(secHtml);
console.log('Section Tabs:', secTabs);
assert.strictEqual(secTabs[0], 'staff', 'Section 1st tab must be staff');
assert.strictEqual(secTabs[1], 'mail', 'Section 2nd tab must be mail');
console.log('✓ Test 2 Passed: Section tab 1 is staff, tab 2 is mail.');

// Test 3: Standard Station Workspace
const db = window.store.getDb();
const standardStation = db.stations.find(s => s.sectionId === 'sec-1' || s.sectionId === 'sec-2') || db.stations[0];
window.app.navigate('station_workspace', standardStation.id);
const stationHtml = window.renderStationWorkspaceView(standardStation.id);
const stationTabs = extractTabsOrder(stationHtml);
console.log('Standard Station Tabs:', stationTabs);
assert.strictEqual(stationTabs[0], 'staff', 'Standard Station 1st tab must be staff');
assert.strictEqual(stationTabs[1], 'mail', 'Standard Station 2nd tab must be mail');
console.log('✓ Test 3 Passed: Standard Station tab 1 is staff, tab 2 is mail.');

// Test 4: Specialized Station Workspace (sec-3 or sec-4)
const specStation = db.stations.find(s => s.sectionId === 'sec-3' || s.sectionId === 'sec-4');
if (specStation) {
  window.app.navigate('station_workspace', specStation.id);
  const specStationHtml = window.renderStationWorkspaceView(specStation.id);
  const specStationTabs = extractTabsOrder(specStationHtml);
  console.log('Specialized Station Tabs:', specStationTabs);
  assert.strictEqual(specStationTabs[0], 'staff', 'Specialized Station 1st tab must be staff');
  assert.strictEqual(specStationTabs[1], 'mail', 'Specialized Station 2nd tab must be mail');
  console.log('✓ Test 4 Passed: Specialized Station tab 1 is staff, tab 2 is mail.');
}

// Test 5: Unit Workspace
const unit = (db.units && db.units[0]) || { id: 'unit-1' };
window.app.navigate('unit_workspace', unit.id);
const unitHtml = window.renderUnitWorkspaceView(unit.id);
const unitTabs = extractTabsOrder(unitHtml);
console.log('Unit Tabs:', unitTabs);
assert.strictEqual(unitTabs[0], 'staff', 'Unit 1st tab must be staff');
assert.strictEqual(unitTabs[1], 'mail', 'Unit 2nd tab must be mail');
console.log('✓ Test 5 Passed: Unit tab 1 is staff, tab 2 is mail.');

console.log('====================================================');
console.log('🎉 ALL TAB ORDER TESTS PASSED 100% PERFECTLY!');
console.log('====================================================');
process.exit(0);
