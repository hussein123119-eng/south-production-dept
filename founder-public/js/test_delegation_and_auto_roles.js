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

console.log('======================================================================');
console.log('🧪 اختبارات التحقق من مصفوفة التفويض الهرمي والتعيين التلقائي للأدوار');
console.log('======================================================================\n');

// 1. اختبار قاعدة التعيين التلقائي (Auto-Role Assignment)
console.log('1. التحقق من قاعدة التعيين التلقائي الذكي حسب العنوان والافتراضي:');
assert(window.rbac.resolveDefaultRole('سائق صهريج نقل وقود') === 'DRIVER', 'العنوان الوظيفي لسائق يُمنح دور DRIVER');
assert(window.rbac.resolveDefaultRole('سائق خفيفة أقدم') === 'DRIVER', 'سائق خفيفة أقدم يُمنح دور DRIVER');
assert(window.rbac.resolveDefaultRole('سائق آليات تخصصية مخول') === 'AUTHORIZED_DRIVER', 'سائق مخول يُمنح دور AUTHORIZED_DRIVER');
assert(window.rbac.resolveDefaultRole('مشغل محطة إنتاجية') === 'OPERATOR', 'مشغل محطة إنتاجية يُمنح دور OPERATOR كحد أدنى');
assert(window.rbac.resolveDefaultRole('فني صيانة ميكانيكية') === 'OPERATOR', 'فني صيانة يُمنح دور OPERATOR كحد أدنى');
assert(window.rbac.resolveDefaultRole('مهندس نفط موقعي') === 'OPERATOR', 'مهندس نفط بدون منصب يُمنح دور OPERATOR');
assert(window.rbac.resolveDefaultRole('') === 'OPERATOR', 'أي منتسب بدون عنوان محدد يدخل بأدنى رتبة OPERATOR');
assert(window.rbac.resolveDefaultRole(null) === 'OPERATOR', 'أي منتسب جديد (null) يدخل بأدنى رتبة OPERATOR');

// 2. التحقق من صلاحيات المستوى الأول: مدير القسم (DEPT_MANAGER)
console.log('\n2. التحقق من صلاحيات المستوى 1: مدير القسم (DEPT_MANAGER):');
const deptMgr = { id: 'usr-dm', role: 'DEPT_MANAGER', departmentId: 'dept-south-prod', status: 'APPROVED' };
assert(window.rbac.canGrantRole(deptMgr, 'ADMIN_MANAGER') === true, 'مدير القسم يستطيع تعيين مدير إدارة');
assert(window.rbac.canGrantRole(deptMgr, 'SECTION_MANAGER') === true, 'مدير القسم يستطيع تعيين مسؤول شعبة');
assert(window.rbac.canGrantRole(deptMgr, 'UNIT_MANAGER') === true, 'مدير القسم يستطيع تعيين مسؤول وحدة');
assert(window.rbac.canGrantRole(deptMgr, 'ADMINISTRATOR') === true, 'مدير القسم يستطيع تعيين إداري مخول');
assert(window.rbac.canGrantRole(deptMgr, 'SUPER_ADMIN') === false, 'مدير القسم لا يستطيع منح دور المؤسس SUPER_ADMIN');

// 3. التحقق من صلاحيات المستوى الثاني: مدير الإدارة (ADMIN_MANAGER)
console.log('\n3. التحقق من صلاحيات المستوى 2: مدير الإدارة (ADMIN_MANAGER):');
const adminMgr = { id: 'usr-am', role: 'ADMIN_MANAGER', departmentId: 'dept-south-prod', status: 'APPROVED' };
const targetOperator = { id: 'usr-op1', role: 'OPERATOR', sectionId: 'sec-1', status: 'APPROVED' };
const targetDriver = { id: 'usr-drv1', role: 'DRIVER', sectionId: 'sec-2', status: 'APPROVED' };
const targetSectionMgr = { id: 'usr-sm1', role: 'SECTION_MANAGER', sectionId: 'sec-1', status: 'APPROVED' };

assert(window.rbac.canManageTargetUser(adminMgr, targetOperator) === true, 'مدير الإدارة يستطيع تعديل دور المشغل في أي شعبة');
assert(window.rbac.canManageTargetUser(adminMgr, targetDriver) === true, 'مدير الإدارة يستطيع تعديل دور السائق في أي شعبة');
assert(window.rbac.canManageTargetUser(adminMgr, targetSectionMgr) === true, 'مدير الإدارة يستطيع تسكين وتعديل كادر الشعب');
assert(window.rbac.canManageTargetUser(adminMgr, deptMgr) === false, 'مدير الإدارة محظور من تعديل حساب مدير القسم');
assert(window.rbac.canGrantRole(adminMgr, 'SECTION_MANAGER') === true, 'مدير الإدارة يستطيع منح دور مسؤول شعبة');
assert(window.rbac.canGrantRole(adminMgr, 'STATION_MANAGER') === true, 'مدير الإدارة يستطيع منح دور مسؤول موقع');
assert(window.rbac.canGrantRole(adminMgr, 'ADMINISTRATOR') === true, 'مدير الإدارة يستطيع منح دور إداري مخول');
assert(window.rbac.canGrantRole(adminMgr, 'DEPT_MANAGER') === false, 'مدير الإدارة لا يستطيع ترقية أحد لدور مدير قسم');
assert(window.rbac.canGrantRole(adminMgr, 'ADMIN_MANAGER') === false, 'مدير الإدارة لا يستطيع ترقية أحد لمستواه الإداري');

// 4. التحقق من صلاحيات المستوى الثالث: مسؤول الشعبة (SECTION_MANAGER)
console.log('\n4. التحقق من صلاحيات المستوى 3: مسؤول الشعبة (SECTION_MANAGER):');
const sec1Mgr = { id: 'usr-sm-sec1', role: 'SECTION_MANAGER', sectionId: 'sec-1', departmentId: 'dept-south-prod', status: 'APPROVED' };
const staffInSec1 = { id: 'usr-staff-s1', role: 'OPERATOR', sectionId: 'sec-1', status: 'APPROVED' };
const staffInSec2 = { id: 'usr-staff-s2', role: 'OPERATOR', sectionId: 'sec-2', status: 'APPROVED' };

assert(window.rbac.canManageTargetUser(sec1Mgr, staffInSec1) === true, 'مسؤول الشعبة يستطيع إدارة كوادر شعبته');
assert(window.rbac.canManageTargetUser(sec1Mgr, staffInSec2) === false, 'مسؤول الشعبة محظور تماماً من إدارة كوادر شعبة أخرى');
assert(window.rbac.canGrantRole(sec1Mgr, 'STATION_MANAGER') === true, 'مسؤول الشعبة يستطيع تعيين مسؤول موقع لشعبته');
assert(window.rbac.canGrantRole(sec1Mgr, 'STATION_SUPERVISOR') === true, 'مسؤول الشعبة يستطيع تعيين مشرف محطة');
assert(window.rbac.canGrantRole(sec1Mgr, 'SHIFT_ENGINEER') === true, 'مسؤول الشعبة يستطيع تعيين مهندس مناوب');
assert(window.rbac.canGrantRole(sec1Mgr, 'SHIFT_SUPERVISOR') === true, 'مسؤول الشعبة يستطيع تعيين مشرف نوبة');
assert(window.rbac.canGrantRole(sec1Mgr, 'ADMINISTRATOR') === true, 'مسؤول الشعبة يستطيع تعيين إداري مخول لشعبته');
assert(window.rbac.canGrantRole(sec1Mgr, 'SECTION_MANAGER') === false, 'مسؤول الشعبة لا يستطيع منح دور مسؤول شعبة لموظف');
assert(window.rbac.canGrantRole(sec1Mgr, 'ADMIN_MANAGER') === false, 'مسؤول الشعبة لا يستطيع منح دور مدير إدارة');

// 5. التحقق من صلاحيات المستوى الرابع: مسؤول الموقع / المحطة (STATION_MANAGER / STATION_SUPERVISOR)
console.log('\n5. التحقق من صلاحيات المستوى 4: مسؤول الموقع / المحطة (STATION_MANAGER):');
const st1Mgr = { id: 'usr-stm-101', role: 'STATION_MANAGER', sectionId: 'sec-1', stationId: 'st-101', departmentId: 'dept-south-prod', status: 'APPROVED' };
const staffInSt101 = { id: 'usr-op-101', role: 'OPERATOR', sectionId: 'sec-1', stationId: 'st-101', status: 'APPROVED' };
const staffInSt102 = { id: 'usr-op-102', role: 'OPERATOR', sectionId: 'sec-1', stationId: 'st-102', status: 'APPROVED' };

assert(window.rbac.canManageTargetUser(st1Mgr, staffInSt101) === true, 'مسؤول الموقع يستطيع إدارة كوادر محطته');
assert(window.rbac.canManageTargetUser(st1Mgr, staffInSt102) === false, 'مسؤول الموقع محظور من إدارة كوادر محطة أخرى');
assert(window.rbac.canGrantRole(st1Mgr, 'SHIFT_SUPERVISOR') === true, 'مسؤول الموقع يستطيع تعيين مشرف نوبة / وكيل وجبة');
assert(window.rbac.canGrantRole(st1Mgr, 'OPERATOR') === true, 'مسؤول الموقع يستطيع تعيين وتثبيت مشغل');
assert(window.rbac.canGrantRole(st1Mgr, 'DRIVER') === true, 'مسؤول الموقع يستطيع تعيين سائق المحطة');
assert(window.rbac.canGrantRole(st1Mgr, 'STATION_MANAGER') === false, 'مسؤول الموقع لا يستطيع ترقية أحد لنفس مستواه');
assert(window.rbac.canGrantRole(st1Mgr, 'SECTION_MANAGER') === false, 'مسؤول الموقع لا يستطيع منح دور مسؤول شعبة');

console.log('\n----------------------------------------------------------------------');
console.log(`النتيجة الإجمالية: ${passedCount} ناجح | ${failedCount} راسب`);
console.log('----------------------------------------------------------------------');

if (failedCount > 0) {
  process.exit(1);
} else {
  console.log('🎉 جميع اختبارات مصفوفة التفويض الهرمي والتعيين التلقائي نجحت بنسبة 100%!');
  process.exit(0);
}
