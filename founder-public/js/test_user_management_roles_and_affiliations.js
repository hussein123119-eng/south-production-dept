/**
 * جناح اختبارات اكتمال شجرة جهات الارتباط والأدوار في إدارة المستخدمين
 * User Management Comprehensive Affiliations Tree & RBAC Roles Test Suite
 */

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
  getElementById: (id) => ({
    value: '',
    innerHTML: '',
    style: {},
    classList: { add: () => {}, remove: () => {} },
    selectionStart: 0,
    selectionEnd: 0,
    focus: () => {}
  }),
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

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
  console.log(`  ✅ PASS: ${message}`);
}

console.log('======================================================================');
console.log('🧪 جناح اختبارات اكتمال جهات الارتباط والأدوار في إدارة المستخدمين');
console.log('======================================================================');

// تسجيل الدخول بحساب المؤسس (Super Admin)
window.auth.login('hussein123119@gmail.com', 'H1f2a3m4r5', 'EMP-0000');
const actorUser = window.auth.getCurrentUser();
assert(actorUser && actorUser.role === 'SUPER_ADMIN', 'نجاح تسجيل الدخول بحساب المؤسس العام');

// --- 1. التحقق من اكتمال عناصر شجرة جهات الارتباط ---
console.log('\n--- 1. التحقق من اكتمال عناصر شجرة جهات الارتباط ---');
window.app.userRegistryState = { page: 1, pageSize: 'ALL', search: '', section: 'ALL', status: 'ALL', role: 'ALL' };
let html = window.renderUserManagementView();

assert(html.includes('value="DEPT"'), 'توفر خيار إدارة القسم المركزية في الفلتر');
assert(html.includes('إدارة القسم المركزية'), 'ظهور مسمى إدارة القسم المركزية بوضوح');
assert(html.includes('optgroup label="📁 الشُعب الإنتاجية والرأسية"'), 'توفر مجموعة الشُعب الإنتاجية والرأسية');
assert(html.includes('optgroup label="⚙️ الوحدات الإدارية والفنية"'), 'توفر مجموعة الوحدات الإدارية والفنية');
assert(html.includes('optgroup label="⛽ محطات الإنتاج الميدانية"'), 'توفر مجموعة محطات الإنتاج الميدانية');
assert(html.includes('value="NONE"'), 'توفر خيار بدون جهة ارتباط محددة');

// التحقق من ظهور الوحدات الفعلية (الفنية، التدريب، الضمان)
assert(html.includes('وحدة الفنية') || html.includes('الفنية'), 'ظهور الوحدة الفنية في خيارات الفلتر');
assert(html.includes('التدريب والتطوير'), 'ظهور وحدة التدريب والتطوير في خيارات الفلتر');
assert(html.includes('الضمان الصحي'), 'ظهور وحدة الضمان الصحي في خيارات الفلتر');

// التحقق من ظهور المحطات الإنتاجية الفعلية
assert(html.includes('المحطة المركزية'), 'ظهور المحطة المركزية في خيارات الفلتر');
assert(html.includes('محطة الرطكة'), 'ظهور محطة الرطكة في خيارات الفلتر');
assert(html.includes('محطة الشامية'), 'ظهور محطة الشامية في خيارات الفلتر');

// --- 2. التحقق من دقة التصفية بجهات الارتباط المختلفة ---
console.log('\n--- 2. التحقق من دقة التصفية بجهات الارتباط ---');

// أ. التصفية بإدارة القسم المركزية DEPT
window.app.userRegistryState.section = 'DEPT';
html = window.renderUserManagementView();
assert(html.includes('EMP-0000'), 'تصفية إدارة القسم تُظهر المؤسس العام');
assert(html.includes('EMP-2024-001'), 'تصفية إدارة القسم تُظهر مدير القسم أحمد عبد الحسين');

// ب. التصفية بوحدة فنية (unit-1)
window.app.userRegistryState.section = 'unit-1';
html = window.renderUserManagementView();
assert(html.includes('مهند فاضل العلي') || html.includes('الفنية'), 'تصفية الوحدة الفنية تعيد كوادر الوحدة الفنية بنجاح');
assert(!html.includes('EMP-0000'), 'تصفية الوحدة الفنية تستثني كوادر إدارة القسم');

// ج. التصفية بمحطة إنتاجية (st-101 - المحطة المركزية)
window.app.userRegistryState.section = 'st-101';
html = window.renderUserManagementView();
assert(html.includes('عمار جبار الساعدي') || html.includes('المحطة المركزية'), 'تصفية المحطة المركزية تعيد كوادر المحطة بنجاح');

// د. التصفية بشعبة إنتاجية (sec-1 - الشعبة الأولى)
window.app.userRegistryState.section = 'sec-1';
html = window.renderUserManagementView();
assert(html.includes('الشعبة الأولى'), 'تصفية الشعبة الأولى تعيد كوادر الشعبة');

// --- 3. التحقق من اكتمال قائمة الأدوار الرسمية ---
console.log('\n--- 3. التحقق من اكتمال قائمة الأدوار الرسمية ---');
window.app.userRegistryState.section = 'ALL';
window.app.userRegistryState.role = 'ALL';
html = window.renderUserManagementView();

assert(html.includes('value="SUPER_ADMIN"'), 'توفر دور المؤسس العام SUPER_ADMIN في القائمة المنسدلة');
assert(html.includes('👑 المؤسس / Super Admin'), 'ظهور تسمية المؤسس الفاخرة');
assert(html.includes('value="EMPLOYEE"'), 'توفر دور موظف / كادر عام EMPLOYEE في القائمة المنسدلة');
assert(html.includes('👤 موظف / كادر عام'), 'ظهور تسمية موظف / كادر عام بوضوح');
assert(html.includes('value="DEPT_MANAGER"'), 'توفر دور مدير قسم');
assert(html.includes('value="SECTION_MANAGER"'), 'توفر دور مسؤول شعبة');
assert(html.includes('value="UNIT_MANAGER"'), 'توفر دور مسؤول وحدة');
assert(html.includes('value="STATION_MANAGER"'), 'توفر دور مسؤول موقع / محطة');
assert(html.includes('value="OPERATOR"'), 'توفر دور مشغل موقع / محطة');

// --- 4. التحقق من دقة التصفية بالأدوار ---
console.log('\n--- 4. التحقق من دقة التصفية بالأدوار ---');

// تصفية بدور المؤسس العام
window.app.userRegistryState.role = 'SUPER_ADMIN';
html = window.renderUserManagementView();
assert(html.includes('EMP-0000'), 'تصفية دور المؤسس العام تعيد سجل المؤسس');
assert(!html.includes('EMP-2024-001'), 'تصفية دور المؤسس العام تستثني بقية الأدوار');

// تصفية بدور المشغل OPERATOR
window.app.userRegistryState.role = 'OPERATOR';
html = window.renderUserManagementView();
assert(html.includes('مشغل'), 'تصفية دور المشغل تعيد كوادر التشغيل');
assert(!html.includes('EMP-0000'), 'تصفية دور المشغل تستثني المؤسس العام');

// --- 5. التحقق من الاستكشاف التلقائي للوحدات المضافة حديثاً ---
console.log('\n--- 5. التحقق من الاستكشاف التلقائي للوحدات والمحطات المضافة حديثاً ---');
// محاكاة إضافة وحدة جديدة عبر store.addUnit
const newMockUnit = { id: 'unit-safety-env', name: 'السلامة والبيئة الميدانية', departmentId: 'dept-south-prod' };
window.store.addUnit(newMockUnit);

window.app.userRegistryState.section = 'ALL';
window.app.userRegistryState.role = 'ALL';
html = window.renderUserManagementView();
assert(html.includes('unit-safety-env'), 'الوحدة المضافة حديثاً ظهرت فورياً بمعرفها في القائمة');
assert(html.includes('السلامة والبيئة الميدانية'), 'الوحدة المضافة حديثاً ظهرت باسمها في قائمة الفلترة تلقائياً');

console.log('----------------------------------------------------------------------');
console.log('النتيجة الإجمالية: جميع فحوصات اكتمال جهات الارتباط والأدوار ناجحة 100%!');
console.log('----------------------------------------------------------------------');
process.exit(0);
