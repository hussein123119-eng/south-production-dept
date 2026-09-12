// Unit test for Section Staff Data Entry Modal
const fs = require('fs');
const path = require('path');
const base = __dirname;

console.log("====================================================");
console.log("🧪 TESTING SECTION STAFF DATA ENTRY MODAL & GETSTAFF");
console.log("====================================================");

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

let capturedModalTitle = null;
let capturedModalHtml = null;
let capturedAlert = null;

const mockElements = {};
global.document = {
  documentElement: { setAttribute: () => {}, getAttribute: () => 'light' },
  body: { classList: { toggle: () => {}, remove: () => {}, add: () => {} } },
  getElementById: (id) => {
    if (!mockElements[id]) {
      mockElements[id] = {
        value: '',
        innerHTML: '',
        style: {},
        options: [],
        selectedOptions: [{ text: '' }],
        classList: { add: () => {}, remove: () => {} },
        focus: () => {}
      };
    }
    return mockElements[id];
  },
  querySelector: () => null,
  querySelectorAll: () => [],
  addEventListener: () => {}
};

global.alert = (msg) => { capturedAlert = msg; };

// Load required scripts in sequence
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

// 1. Test store.getStaff and store.getSectionStaff
console.log("\n--- 1. Testing store.getStaff & store.getSectionStaff ---");
const deptStaff = window.store.getStaff('dept-south-prod');
console.log("deptStaff count:", deptStaff.length);
if (!Array.isArray(deptStaff) || deptStaff.length === 0) {
  console.error("❌ Test 1.1 Failed: store.getStaff did not return staff array");
  process.exit(1);
}
console.log("✓ Test 1.1 Passed: store.getStaff returned", deptStaff.length, "employees.");

const sec1Staff = window.store.getSectionStaff('sec-1', 'dept-south-prod');
console.log("sec-1 staff count:", sec1Staff.length);
if (!Array.isArray(sec1Staff) || sec1Staff.length === 0) {
  console.error("❌ Test 1.2 Failed: store.getSectionStaff did not return staff for sec-1");
  process.exit(1);
}
console.log("✓ Test 1.2 Passed: store.getSectionStaff returned", sec1Staff.length, "employees for sec-1.");

// Mock auth login as SECTION_MANAGER
window.auth.currentUser = {
  id: 'usr-sec-1',
  fullName: 'مسؤول شعبة 1',
  role: 'SECTION_MANAGER',
  sectionId: 'sec-1',
  departmentId: 'dept-south-prod'
};

// Mock showModal on app
window.app.showModal = (title, html) => {
  capturedModalTitle = title;
  capturedModalHtml = html;
};

// 2. Test openSectionDataEntryModal
console.log("\n--- 2. Testing openSectionDataEntryModal('sec-1') ---");
try {
  window.app.openSectionDataEntryModal('sec-1');
} catch (err) {
  console.error("❌ Test 2.1 Failed: openSectionDataEntryModal threw exception:", err);
  process.exit(1);
}

if (!capturedModalTitle || !capturedModalTitle.includes('تحديث وتعديل بيانات كادر')) {
  console.error("❌ Test 2.2 Failed: Modal title not set correctly:", capturedModalTitle);
  process.exit(1);
}
console.log("✓ Test 2.1 Passed: Modal opened with title:", capturedModalTitle);

if (!capturedModalHtml.includes('sectionStaffSelect')) {
  console.error("❌ Test 2.3 Failed: Modal HTML does not contain sectionStaffSelect");
  process.exit(1);
}
if (!capturedModalHtml.includes('sectionStaffModalFilterInput')) {
  console.error("❌ Test 2.4 Failed: Modal HTML does not contain filter input");
  process.exit(1);
}
if (!capturedModalHtml.includes('empJobTitle') || !capturedModalHtml.includes('empStationId')) {
  console.error("❌ Test 2.5 Failed: Modal HTML missing core employee fields (empJobTitle, empStationId)");
  process.exit(1);
}
console.log("✓ Test 2.2 Passed: Modal contains staff dropdown, quick filter, and core fields.");

// 3. Test onSectionStaffSelectChange
console.log("\n--- 3. Testing onSectionStaffSelectChange ---");
const targetEmp = sec1Staff[0];
window.app.onSectionStaffSelectChange('sec-1', targetEmp.employeeId);
const fieldsContainer = document.getElementById('sectionStaffFieldsContainer');
console.log("Fields container HTML updated, length:", fieldsContainer.innerHTML.length);
if (!fieldsContainer.innerHTML.includes(targetEmp.fullName)) {
  console.error("❌ Test 3.1 Failed: Fields container does not contain target employee name:", targetEmp.fullName);
  process.exit(1);
}
console.log("✓ Test 3 Passed: onSectionStaffSelectChange successfully updated container.");

// 4. Test handleSaveSectionStaffDataSubmit
console.log("\n--- 4. Testing handleSaveSectionStaffDataSubmit ---");
document.getElementById('currentStaffEmpId').value = targetEmp.employeeId;
const mockFormData = new Map();
mockFormData.set('empJobTitle', 'مهندس أقدم معدل');
mockFormData.set('empStationId', 'station-1');
mockFormData.set('empWorkShift', 'مناوب');
mockFormData.set('empShiftName', 'B');
mockFormData.set('empPhone', '07701234567');
mockFormData.set('empEmail', 'test.emp@rumaila.iq');

global.FormData = function(form) {
  return {
    get: (k) => mockFormData.get(k) || null
  };
};

const mockEvent = { preventDefault: () => {} };
window.app.handleSaveSectionStaffDataSubmit(mockEvent, 'sec-1');

const updatedMaster = window.store.getEmployeeMasterRecordByEmployeeId(targetEmp.employeeId);
if (updatedMaster.jobTitle !== 'مهندس أقدم معدل') {
  console.error("❌ Test 4.1 Failed: jobTitle was not updated in master record:", updatedMaster.jobTitle);
  process.exit(1);
}
if (updatedMaster.workShift !== 'مناوب' || updatedMaster.assignedShift !== 'B') {
  console.error("❌ Test 4.2 Failed: shift was not updated in master record:", updatedMaster.workShift, updatedMaster.assignedShift);
  process.exit(1);
}
if (updatedMaster.phone !== '07701234567') {
  console.error("❌ Test 4.3 Failed: phone was not updated in master record:", updatedMaster.phone);
  process.exit(1);
}
console.log("✓ Test 4 Passed: Employee master record updated and saved cleanly.");

console.log("\n====================================================");
console.log("🎉 ALL SECTION STAFF DATA ENTRY TESTS PASSED 100%!");
console.log("====================================================");
process.exit(0);
