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

let elementMap = {};
global.document = {
  documentElement: { setAttribute: () => {}, getAttribute: () => 'light' },
  body: { classList: { toggle: () => {}, remove: () => {}, add: () => {} } },
  getElementById: (id) => {
    if (!elementMap[id]) {
      elementMap[id] = { value: '', innerHTML: '', style: {}, scrollIntoView: () => {}, classList: { add: () => {}, remove: () => {} } };
    }
    return elementMap[id];
  },
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
console.log('🧪 TESTING IMPORT EMPLOYEE TAB REDESIGN & DUAL MODES');
console.log('====================================================');

window.auth.login('ahmed.mgr@rumaila.iq', 'M1a2g3r4#2026', 'EMP-2024-001');
const actorUser = window.auth.getCurrentUser();

// 1. Check HTML rendering of renderImportEmployeeIDsTab
console.log('\n1. Checking renderImportEmployeeIDsTab HTML elements:');
const html = window.renderImportEmployeeIDsTab(actorUser);

const expectedPhrases = [
  'استيراد ومطابقة سجلات الموظفين الرسمية',
  '<details',
  'دليل وإرشادات صيغ الأعمدة المدعومة في الملفات (اضغط للعرض / الإخفاء)',
  'الحد الأدنى الإلزامي (سريع وبسيط)',
  'عمودان فقط مطلوبان',
  'الصيغة الشاملة الموسّعة',
  'أداة الإضافة الفردية السريعة',
  'quickSingleEmployeeForm',
  'quickEmpFullName',
  'quickEmpId',
  'الاستيراد الجماعي',
  'importCSVTextarea',
  'importPreviewContainer',
  'لو رفعت بيانات 500 موظف هنا، هل تتعبأ وتكون جاهزة قبل تسجيل دخولهم؟'
];

expectedPhrases.forEach(p => {
  const found = html.includes(p);
  console.log(`  Contains "${p}":`, found ? '✓ Confirmed' : '✗ Missing');
  if (!found) throw new Error(`Missing expected phrase in import tab: ${p}`);
});

// Verify schema guide has NO action buttons (purely informative)
const hasCopyBtnInGuide = html.includes('handleCopyTemplateText');
console.log('  Schema guide action buttons removed (purely informative):', !hasCopyBtnInGuide ? '✓ Confirmed' : '✗ Failed');
if (hasCopyBtnInGuide) throw new Error('Schema guide should not have action buttons');

// 2. Test Quick Single Add Employee Form Handler
console.log('\n2. Testing Quick Single Add Employee (handleQuickAddSingleEmployee):');
document.getElementById('quickEmpFullName').value = 'كرار حيدر علي الحسني';
document.getElementById('quickEmpId').value = 'EMP-2026-TEST01';
document.getElementById('quickEmpJobTitle').value = 'مهندس نفط أقدم';
document.getElementById('quickEmpJobGrade').value = 'الرابعة';
document.getElementById('quickEmpJobStage').value = 'الثانية';
document.getElementById('quickEmpDegree').value = 'بكالوريوس';
document.getElementById('quickEmpWorkShift').value = 'صباحي';

window.app.handleQuickAddSingleEmployee({ preventDefault: () => {} });

const masterRec = window.store.getEmployeeMasterRecordByEmployeeId('EMP-2026-TEST01');
if (!masterRec || masterRec.fullName !== 'كرار حيدر علي الحسني') {
  throw new Error('Quick Single Add failed to save employee master record');
}
console.log('  Single employee saved to master records:', masterRec.fullName, `(${masterRec.employeeId})`, '✓ Confirmed');

// 3. Test Sample CSV Loader (handleInsertSampleCSV)
console.log('\n3. Testing Sample CSV Loader:');
window.app.handleInsertSampleCSV('minimal');
const minVal = document.getElementById('importCSVTextarea').value;
if (!minVal.includes('EMP-2026-901') || !minVal.includes('كرار حيدر علي')) {
  throw new Error('Minimal sample CSV not inserted properly');
}
console.log('  Minimal sample inserted and verified: ✓ Passed');

// 4. Test Smart Parsing (handleParseImportEmployeeIDs) with 2-column data
console.log('\n4. Testing Smart CSV Parsing (handleParseImportEmployeeIDs):');
document.getElementById('importCSVTextarea').value = `الرقم الوظيفي,الاسم الكامل
EMP-2026-BULK01,علي حسن عبد الرضا
EMP-2026-BULK02,مصطفى كاظم جواد
EMP-2026-BULK01,علي حسن عبد الرضا
12,رقم قصير غير صالح
EMP-2026-TEST01,كرار حيدر علي الحسني`;

window.app.handleParseImportEmployeeIDs();
const batch = window.app.parsedImportBatch;
console.log('  Parsed batch count:', batch.length);
if (batch.length !== 5) throw new Error('Expected 5 parsed records');

const newRec = batch.find(r => r.employeeId === 'EMP-2026-BULK01');
const dupRec = batch.filter(r => r.employeeId === 'EMP-2026-BULK01')[1];
const invRec = batch.find(r => r.employeeId === '12');
const existRec = batch.find(r => r.employeeId === 'EMP-2026-TEST01');

console.log('  Record 1 (New):', newRec.status, '=>', newRec.statusLabel);
console.log('  Record 3 (Duplicate in batch):', dupRec.status, '=>', dupRec.statusLabel);
console.log('  Record 4 (Invalid length < 3):', invRec.status, '=>', invRec.statusLabel);
console.log('  Record 5 (Already exists in DB):', existRec.status, '=>', existRec.statusLabel);

if (newRec.status !== 'VALID_NEW') throw new Error('Expected VALID_NEW');
if (dupRec.status !== 'DUPLICATE_IN_FILE') throw new Error('Expected DUPLICATE_IN_FILE');
if (invRec.status !== 'INVALID') throw new Error('Expected INVALID');
if (existRec.status !== 'ALREADY_EXISTS') throw new Error('Expected ALREADY_EXISTS');

// 5. Test Bulk Execution (handleExecuteImportEmployeeIDs)
console.log('\n5. Testing Bulk Execution (handleExecuteImportEmployeeIDs):');
global.confirm = () => true;
window.app.handleExecuteImportEmployeeIDs();

const savedRec1 = window.store.getEmployeeMasterRecordByEmployeeId('EMP-2026-BULK01');
const savedRec2 = window.store.getEmployeeMasterRecordByEmployeeId('EMP-2026-BULK02');
if (!savedRec1 || !savedRec2) {
  throw new Error('Bulk execution failed to save valid records');
}
console.log('  Bulk records saved successfully to Master Registry: ✓ Confirmed');

// 6. Test User Login Linking with Imported Record
console.log('\n6. Testing Instant Link on Employee Login/Validation:');
const staffDirectoryCheck = window.auth.validateEmployeeDirectory('EMP-2026-BULK01');
if (!staffDirectoryCheck || staffDirectoryCheck.fullName !== 'علي حسن عبد الرضا') {
  throw new Error('validateEmployeeDirectory failed to recognize imported master record');
}
console.log('  Employee Directory instantly recognizes imported record before account creation:', staffDirectoryCheck.fullName, '✓ Confirmed');

console.log('\n====================================================');
console.log('🎉 ALL IMPORT TAB REDESIGN & DUAL ENTRY TESTS PASSED 100%!');
console.log('====================================================');
process.exit(0);

