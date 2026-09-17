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
global.alert = (msg) => { /* console.log('ALERT:', msg); */ };
global.confirm = () => true;

// DOM Mocking
const dummyElements = {};
global.document = {
  documentElement: { setAttribute: () => {}, getAttribute: () => 'light' },
  body: { classList: { toggle: () => {}, remove: () => {}, add: () => {} } },
  getElementById: (id) => {
    if (!dummyElements[id]) {
      dummyElements[id] = { value: '', innerHTML: '', style: {}, checked: true, classList: { add: () => {}, remove: () => {} } };
    }
    return dummyElements[id];
  },
  querySelector: () => null,
  querySelectorAll: (sel) => {
    return [
      {
        getAttribute: (attr) => {
          if (attr === 'data-desc') return 'اختبار مضخات';
          if (attr === 'data-actions') return 'صيانة وقائية';
          if (attr === 'data-notes') return 'ملاحظة';
          if (attr === 'data-eq') return 'مضخات حقن';
          if (attr === 'data-status') return 'OPERATIONAL';
          if (attr === 'data-forward') return 'SENT';
          if (attr === 'data-station') return 'st-1';
          return '';
        },
        style: {}
      }
    ];
  },
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

console.log('================================================================');
console.log('🧪 TESTING STATION TECHNICAL STATUS & SECTION FORWARDING SYSTEM');
console.log('================================================================');

// 1. Authenticate as Department Manager
const loginRes = window.auth.login('ahmed.mgr@rumaila.iq', 'M1a2g3r4#2026', 'EMP-2024-001');
assert.strictEqual(loginRes.success, true, 'Manager login must succeed');
const currentUser = window.auth.getCurrentUser();
const db = window.store.getDb();

// 2. Test Tab Rendering & Order in Standard Station Workspace
console.log('\n--- 1. Testing Station Workspace Subtabs ---');
const standardStation = db.stations.find(s => s.sectionId === 'sec-1' || s.sectionId === 'sec-2') || db.stations[0];
window.app.navigate('station_workspace', standardStation.id);
const standardHtml = window.renderStationWorkspaceView(standardStation.id);

assert.ok(standardHtml.includes('⚙️ <span>الموقف الفني</span>'), 'Standard station workspace must contain Technical Status tab button');
assert.ok(standardHtml.includes("onclick=\"window.app.setStationSubTab('tech_status')\""), 'Standard station workspace must have tech_status onclick action');

// Test Specialized Station Workspace (e.g. Lab or Metering)
const specializedStation = db.stations.find(s => s.sectionId === 'sec-3' || s.sectionId === 'sec-4');
if (specializedStation) {
  window.app.navigate('station_workspace', specializedStation.id);
  const specHtml = window.renderStationWorkspaceView(specializedStation.id);
  assert.ok(specHtml.includes('⚙️ <span>الموقف الفني</span>'), 'Specialized station workspace must contain Technical Status tab button');
}
console.log('✓ Test 1 Passed: All station workspaces include Technical Status tab.');

// 3. Test renderStationTechnicalStatusTab
console.log('\n--- 2. Testing renderStationTechnicalStatusTab Functionality ---');
const section = db.sections.find(sec => sec.id === standardStation.sectionId);
const stationTechHtml = window.renderStationTechnicalStatusTab(standardStation, section, currentUser);

assert.ok(stationTechHtml.includes(`الموقف الفني والتشغيلي — ${standardStation.name}`), 'Header must contain station technical status title');
assert.ok(stationTechHtml.includes('تسجيل موقف فني جديد'), 'Must contain add technical status button');
assert.ok(stationTechHtml.includes('مرسل للشعبة'), 'Must contain Forwarded status metric badge');
assert.ok(stationTechHtml.includes('مسودة بالمحطة'), 'Must contain Draft status metric badge');
assert.ok(stationTechHtml.includes('id="stationTechSearchInput"'), 'Must contain station tech search input');
assert.ok(stationTechHtml.includes('id="stationTechStatusFilter"'), 'Must contain station tech status filter');
assert.ok(stationTechHtml.includes('id="stationTechForwardFilter"'), 'Must contain station tech forwarding filter');
console.log('✓ Test 2 Passed: renderStationTechnicalStatusTab renders complete UI controls & metrics.');

// 4. Test Adding Technical Status from Station Workspace
console.log('\n--- 3. Testing Adding Technical Status from Station ---');
const initialStatusesCount = (db.technicalStatusReports || []).length;
const addRes = window.store.addTechnicalStatus({
  sectionId: standardStation.sectionId,
  stationId: standardStation.id,
  recordDate: new Date().toISOString().split('T')[0],
  status: 'OPERATIONAL',
  equipmentTopic: 'عازلات الغاز والنفط V-101',
  description: 'فحص دوري واستقرار الضغوط التشغيلية ضمن المعدلات الطبيعية 45 PSI.',
  actionsTaken: 'معايرة صمامات التحكم والتحقق من مانعات التسرب.',
  notes: 'المحطة جاهزة بكامل طاقتها الاستيعابية.',
  isSentToSection: false // save as local draft initially
}, currentUser);

assert.strictEqual(addRes.success, true, 'Adding technical status must succeed');
const createdStatus = addRes.technicalStatus;
assert.ok(createdStatus.id, 'Created status must have an ID');
assert.strictEqual(createdStatus.stationId, standardStation.id, 'Status must be linked to station ID');
assert.strictEqual(createdStatus.isSentToSection, false, 'Initial status is local draft');
console.log('✓ Test 3 Passed: Technical status created for station as local draft.');

// 5. Test Forwarding Technical Status to Parent Section
console.log('\n--- 4. Testing Forwarding Technical Status to Parent Section ---');
const forwardRes = window.store.forwardTechnicalStatusToSection(createdStatus.id, currentUser);
assert.strictEqual(forwardRes.success, true, 'Forwarding to section must succeed');
const forwardedStatus = forwardRes.technicalStatus;
assert.strictEqual(forwardedStatus.isSentToSection, true, 'isSentToSection must be true');
assert.ok(forwardedStatus.sentToSectionAt, 'sentToSectionAt timestamp must be recorded');
assert.strictEqual(forwardedStatus.sentToSectionByName, currentUser.fullName, 'sentToSectionByName must record actor name');

const forwardHistory = forwardedStatus.history.find(h => h.action === 'FORWARD_TO_SECTION');
assert.ok(forwardHistory, 'Audit history must contain FORWARD_TO_SECTION event');
console.log('✓ Test 4 Passed: Status successfully forwarded to section with timestamp & audit record.');

// 6. Test Section Technical Status View Highlights Forwarded Station Reports
console.log('\n--- 5. Testing Section View Display of Forwarded Status ---');
const sectionHtml = window.renderSectionTechnicalStatusTab(section, currentUser);
assert.ok(sectionHtml.includes('📥 وارد من المحطة'), 'Section technical status tab must highlight forwarded station reports');
assert.ok(sectionHtml.includes(standardStation.name), 'Section technical status tab must display station name');
console.log('✓ Test 5 Passed: Section technical status tab displays incoming station reports with badge.');

// 7. Test Filtering and App Forwarding Wrapper
console.log('\n--- 6. Testing App Methods (filterStationTechStatus & forwardTechStatusToSection) ---');
assert.strictEqual(typeof window.app.filterStationTechStatus, 'function', 'app.filterStationTechStatus must be a function');
assert.strictEqual(typeof window.app.forwardTechStatusToSection, 'function', 'app.forwardTechStatusToSection must be a function');

// Run filterStationTechStatus
window.app.filterStationTechStatus();
console.log('✓ filterStationTechStatus executed without error.');

// Test forwardTechStatusToSection
window.app.forwardTechStatusToSection(createdStatus.id, standardStation.id);
console.log('✓ window.app.forwardTechStatusToSection executed smoothly.');

// 8. Test Removal of 'آخر تحديث' Column from Technical Status Tables
console.log('\n--- 7. Testing Removal of Last Update Column ---');
assert.strictEqual(stationTechHtml.includes('<th>آخر تحديث</th>'), false, 'Station technical status table must NOT have آخر تحديث column');
assert.strictEqual(sectionHtml.includes('<th>آخر تحديث</th>'), false, 'Section technical status table must NOT have آخر تحديث column');
const globalTechHtml = window.renderTechnicalStatusView();
assert.strictEqual(globalTechHtml.includes('<th>آخر تحديث</th>'), false, 'Global technical status table must NOT have آخر تحديث column');
console.log("✓ Test 7 Passed: 'آخر تحديث' column is completely removed from all technical status tables.");

console.log('\n================================================================');
console.log('🎉 ALL STATION TECHNICAL STATUS & FORWARDING TESTS PASSED 100%!');
console.log('================================================================');
process.exit(0);
