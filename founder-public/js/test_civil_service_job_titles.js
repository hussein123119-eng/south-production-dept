const fs = require('fs');
const path = require('path');
const base = __dirname;

const localStorageData = {};
global.localStorage = {
  getItem: (k) => localStorageData[k] || null,
  setItem: (k, v) => { localStorageData[k] = v; },
  removeItem: (k) => { delete localStorageData[k]; }
};
const sessionStorageData = {};
global.sessionStorage = {
  getItem: (k) => sessionStorageData[k] || null,
  setItem: (k, v) => { sessionStorageData[k] = v; },
  removeItem: (k) => { delete sessionStorageData[k]; }
};
global.window = global;
global.location = { hostname: 'localhost', href: 'http://localhost:3000' };

global.document = {
  documentElement: { setAttribute: () => {}, getAttribute: () => 'light' },
  body: { classList: { toggle: () => {}, remove: () => {}, add: () => {} } },
  getElementById: () => ({ value: '', innerHTML: '', style: {}, classList: { add: () => {}, remove: () => {} } }),
  querySelector: () => null,
  querySelectorAll: () => [],
  addEventListener: () => {}
};

console.log('======================================================================');
console.log('🧪 اختبارات التمييز بين العنوان الوظيفي القانوني والمنصب/الدور الإداري');
console.log('======================================================================\n');

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

let passedCount = 0;
let failedCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passedCount++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failedCount++;
  }
}

console.log('1. التحقق من العناوين الوظيفية في السجلات والحسابات الافتراضية:');
const deptMgr = window.auth.validateEmployeeDirectory('EMP-2024-001');
assert(deptMgr && deptMgr.jobTitle === 'رئيس مهندسين أقدم', 'مدير القسم يحمل عنوان وظيفي قانوني "رئيس مهندسين أقدم" وليس منصبه');
assert(deptMgr && deptMgr.jobTitle !== 'مدير قسم الإنتاج الجنوبي', 'مدير القسم لا يحمل اسم المنصب داخل حقل العنوان الوظيفي');

const sec1Mgr = window.auth.validateEmployeeDirectory('EMP-2024-002');
assert(sec1Mgr && sec1Mgr.jobTitle === 'رئيس مهندسين', 'مسؤول الشعبة الأولى يحمل عنوان وظيفي قانوني "رئيس مهندسين"');
assert(sec1Mgr && sec1Mgr.jobTitle !== 'مسؤول الشعبة الأولى', 'مسؤول الشعبة لا يحمل اسم المنصب داخل حقل العنوان الوظيفي');

const sec2Mgr = window.auth.validateEmployeeDirectory('EMP-2024-003');
assert(sec2Mgr && sec2Mgr.jobTitle === 'رئيس مهندسين', 'مسؤول الشعبة الثانية يحمل عنوان وظيفي قانوني "رئيس مهندسين"');

const unitMgr = window.auth.validateEmployeeDirectory('EMP-2024-005');
assert(unitMgr && unitMgr.jobTitle === 'معاون رئيس مهندسين', 'مسؤول الوحدة الفنية يحمل عنوان وظيفي قانوني "معاون رئيس مهندسين"');

const founder = window.auth.validateEmployeeDirectory('EMP-0000');
assert(founder && founder.jobTitle === 'رئيس مهندسين أقدم', 'المؤسس العام للمنظومة يحمل عنوان وظيفي قانوني "رئيس مهندسين أقدم"');

console.log('\n2. التحقق من خلو قاعدة البيانات من أي مناصب إدارية داخل حقل jobTitle:');
const dbPath = path.join(base, '../database/spd_production_db.json');
const dbJson = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
const forbiddenTitles = [
  'مدير قسم الإنتاج الجنوبي',
  'مدير قسم',
  'مسؤول الشعبة الأولى',
  'مسؤول الشعبة الثانية',
  'مسؤول شعبة',
  'مسؤول الوحدة الفنية',
  'مسؤول وحدة',
  'المؤسس والمدير العام للنظام'
];

let hasForbidden = false;
function checkNoAdminTitles(obj) {
  if (!obj || typeof obj !== 'object') return;
  if (Array.isArray(obj)) {
    obj.forEach(checkNoAdminTitles);
  } else {
    if (typeof obj.jobTitle === 'string' && forbiddenTitles.includes(obj.jobTitle.trim())) {
      hasForbidden = true;
    }
    for (const k of Object.keys(obj)) {
      if (typeof obj[k] === 'object' && obj[k] !== null) {
        checkNoAdminTitles(obj[k]);
      }
    }
  }
}
checkNoAdminTitles(dbJson);
assert(!hasForbidden, 'قاعدة البيانات المرجعية تخلو تماماً من المسميات الإدارية داخل jobTitle');

console.log('\n3. التحقق من كود الاستمارات وواجهات إدخال وتعديل البيانات:');
const appCode = fs.readFileSync(path.join(base, 'app.js'), 'utf8');
assert(appCode.includes('deJobTitle'), 'يجب احتواء استمارة البيانات على حقل deJobTitle');
assert(appCode.includes('العنوان الوظيفي (التدرج القانوني)'), 'يجب وضوح تسمية العنوان الوظيفي والتدرج القانوني في النموذج');
assert(appCode.includes('placeholder="رئيس مهندسين أقدم / مهندس أقدم / فني / مشغل محطة / سائق..."'), 'يجب أن يظهر المثال السليم للتدرج القانوني في حقل الإدخال');

console.log('\n----------------------------------------------------------------------');
console.log(`النتيجة الإجمالية: ${passedCount} ناجح | ${failedCount} راسب`);
console.log('----------------------------------------------------------------------');

if (failedCount > 0) {
  console.error('❌ فشل في بعض اختبارات العناوين الوظيفية');
  process.exit(1);
} else {
  console.log('🎉 جميع اختبارات العناوين الوظيفية القانونية نجحت بنسبة 100%!');
  process.exit(0);
}
