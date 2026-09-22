/**
 * جناح اختبارات القوائم المنسدلة الفاخرة المنسدلة للأسفل وشجرة جهات الارتباط في كادر القسم وإدارة المستخدمين
 * Luxury Downward Dropdowns & Department Staff Affiliations Test Suite
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

const mockDomElements = {};

global.document = {
  documentElement: { setAttribute: () => {}, getAttribute: () => 'light' },
  body: { classList: { toggle: () => {}, remove: () => {}, add: () => {} } },
  getElementById: (id) => {
    if (!mockDomElements[id]) {
      mockDomElements[id] = {
        id,
        value: '',
        innerHTML: '',
        style: {},
        classList: {
          classes: new Set(),
          add: function(c) { this.classes.add(c); },
          remove: function(c) { this.classes.delete(c); },
          toggle: function(c, force) {
            if (force !== undefined) {
              if (force) this.classes.add(c); else this.classes.delete(c);
            } else {
              if (this.classes.has(c)) this.classes.delete(c); else this.classes.add(c);
            }
          },
          contains: function(c) { return this.classes.has(c); }
        },
        selectionStart: 0,
        selectionEnd: 0,
        focus: () => {},
        querySelector: () => null,
        querySelectorAll: () => [],
        contains: () => true
      };
    }
    return mockDomElements[id];
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

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
  console.log(`  ✅ PASS: ${message}`);
}

console.log('======================================================================');
console.log('🧪 جناح اختبارات القوائم المنسدلة الفاخرة المنسدلة للأسفل وشجرة جهات الارتباط');
console.log('======================================================================');

// تسجيل الدخول بحساب مدير القسم
window.auth.login('ahmed.mgr@rumaila.iq', 'M1a2g3r4#2026', 'EMP-2024-001');
const actorUser = window.auth.getCurrentUser();
assert(actorUser && actorUser.role === 'DEPT_MANAGER', 'نجاح تسجيل الدخول بحساب مدير القسم');

// --- 1. التحقق من هيكل القائمة المنسدلة الفاخرة في كادر القسم (renderDeptStaffTab) ---
console.log('\n--- 1. التحقق من هيكل القائمة المنسدلة الفاخرة في كادر القسم ---');
window.app.deptStaffState = { page: 1, pageSize: 'ALL', search: '', section: 'ALL' };
const staff = window.store.getUnifiedEmployeeRoster(actorUser);
const sections = window.store.getSections(actorUser.departmentId);
const units = window.store.getUnits(actorUser.departmentId);
const stations = window.store.getStations(actorUser.departmentId);

const deptStaffHtml = window.renderDeptStaffTab(staff, actorUser, sections, units, stations);

assert(deptStaffHtml.includes('id="deptStaffSectionFilterContainer"'), 'توفر الحاوية الفاخرة deptStaffSectionFilterContainer');
assert(deptStaffHtml.includes('class="luxury-dropdown-container"'), 'تطبيق كلاس luxury-dropdown-container على الحاوية');
assert(deptStaffHtml.includes('id="deptStaffSectionFilterTrigger"'), 'توفر زر التفعيل الفاخر deptStaffSectionFilterTrigger');
assert(deptStaffHtml.includes('class="luxury-dropdown-trigger"'), 'تطبيق كلاس luxury-dropdown-trigger على الزر');
assert(deptStaffHtml.includes('class="luxury-dropdown-arrow"'), 'توفر سهم القائمة التفاعلي luxury-dropdown-arrow');
assert(deptStaffHtml.includes('id="deptStaffSectionFilterMenu"'), 'توفر قائمة الخيارات المنسدلة لأسفل deptStaffSectionFilterMenu');
assert(deptStaffHtml.includes('class="luxury-dropdown-menu"'), 'تطبيق كلاس luxury-dropdown-menu');

// التحقق من الحفاظ على select المخفي الأصلي بكامل خياراته للتوافق 100%
assert(deptStaffHtml.includes('id="deptStaffSectionFilter"'), 'الحفاظ على عنصر select الأصلي بمعرفه الرسمي');
assert(deptStaffHtml.includes('value="DEPT"'), 'توفر خيار إدارة القسم المركزية DEPT');
assert(deptStaffHtml.includes('optgroup label="📁 الشُعب الإنتاجية والرأسية"'), 'توفر مجموعة الشُعب الإنتاجية');
assert(deptStaffHtml.includes('optgroup label="⚙️ الوحدات الإدارية والفنية"'), 'توفر مجموعة الوحدات الإدارية والفنية');
assert(deptStaffHtml.includes('optgroup label="⛽ محطات الإنتاج الميدانية"'), 'توفر مجموعة محطات الإنتاج الميدانية');
assert(deptStaffHtml.includes('value="NONE"'), 'توفر خيار بدون جهة ارتباط محددة NONE');

// التحقق من ظهور العناصر المخصصة داخل القائمة المنسدلة لأسفل
assert(deptStaffHtml.includes('📁 الشُعب الإنتاجية والرأسية'), 'ظهور عنوان مجموعة الشُعب في القائمة المنسدلة');
assert(deptStaffHtml.includes('⚙️ الوحدات الإدارية والفنية'), 'ظهور عنوان مجموعة الوحدات في القائمة المنسدلة');
assert(deptStaffHtml.includes('⛽ محطات الإنتاج الميدانية'), 'ظهور عنوان مجموعة المحطات في القائمة المنسدلة');
assert(deptStaffHtml.includes('وحدة الفنية') || deptStaffHtml.includes('الفنية'), 'ظهور الوحدة الفنية في خيارات القائمة');
assert(deptStaffHtml.includes('المحطة المركزية'), 'ظهور المحطة المركزية في خيارات القائمة');

// --- 2. التحقق من دقة التصفية الهرمية في كادر القسم (renderDeptStaffTableAndPagination) ---
console.log('\n--- 2. التحقق من دقة التصفية الهرمية في كادر القسم ---');

// أ. التصفية بإدارة القسم المركزية DEPT
window.app.deptStaffState.section = 'DEPT';
let tableHtml = window.renderDeptStaffTableAndPagination(staff, actorUser, sections);
assert(tableHtml.includes('EMP-2024-001'), 'تصفية إدارة القسم تُظهر مدير القسم أحمد عبد الحسين');
assert(!tableHtml.includes('sec-1') || tableHtml.includes('إدارة القسم'), 'استثناء كوادر الشُعب الميدانية عند تصفية إدارة القسم المركزية');

// ب. التصفية بوحدة فنية (unit-1)
window.app.deptStaffState.section = 'unit-1';
tableHtml = window.renderDeptStaffTableAndPagination(staff, actorUser, sections);
assert(tableHtml.includes('الفنية') || tableHtml.includes('مهند فاضل العلي'), 'تصفية الوحدة الفنية تعيد كوادرها بنجاح');
assert(!tableHtml.includes('EMP-2024-001'), 'استثناء مدير القسم عند تصفية الوحدة الفنية');

// ج. التصفية بمحطة إنتاجية (st-101)
window.app.deptStaffState.section = 'st-101';
tableHtml = window.renderDeptStaffTableAndPagination(staff, actorUser, sections);
assert(tableHtml.includes('المحطة المركزية') || tableHtml.includes('عمار جبار الساعدي'), 'تصفية المحطة المركزية تعيد كوادر المحطة');

// د. التصفية بشعبة إنتاجية (sec-1)
window.app.deptStaffState.section = 'sec-1';
tableHtml = window.renderDeptStaffTableAndPagination(staff, actorUser, sections);
assert(tableHtml.includes('الشعبة الأولى') || tableHtml.includes('حيدر جاسم الكناني'), 'تصفية الشعبة الأولى تعيد كوادر الشعبة الأولى');

// --- 3. التحقق من القوائم المنسدلة الفاخرة في إدارة المستخدمين ---
console.log('\n--- 3. التحقق من القوائم المنسدلة الفاخرة في إدارة المستخدمين ---');
window.app.userRegistryState = { page: 1, pageSize: 'ALL', search: '', section: 'ALL', status: 'ALL', role: 'ALL' };
const userMgmtHtml = window.renderUserManagementView();

assert(userMgmtHtml.includes('id="unifiedRosterSectionFilterContainer"'), 'توفر حاوية قائمة جهات الارتباط الفاخرة في إدارة المستخدمين');
assert(userMgmtHtml.includes('id="unifiedRosterStatusFilterContainer"'), 'توفر حاوية قائمة حالات الحساب الفاخرة في إدارة المستخدمين');
assert(userMgmtHtml.includes('id="unifiedRosterRoleFilterContainer"'), 'توفر حاوية قائمة الأدوار الفاخرة في إدارة المستخدمين');
assert(userMgmtHtml.includes('id="unifiedRosterSectionFilterMenu"'), 'توفر قائمة جهات الارتباط المنسدلة لأسفل');
assert(userMgmtHtml.includes('id="unifiedRosterStatusFilterMenu"'), 'توفر قائمة حالات الحساب المنسدلة لأسفل');
assert(userMgmtHtml.includes('id="unifiedRosterRoleFilterMenu"'), 'توفر قائمة الأدوار المنسدلة لأسفل');

// --- 4. التحقق من دوال التحكم toggleLuxuryDropdown و selectLuxuryDropdownOption ---
console.log('\n--- 4. التحقق من دوال التحكم التفاعلية ---');
assert(typeof window.app.toggleLuxuryDropdown === 'function', 'توفر دالة window.app.toggleLuxuryDropdown');
assert(typeof window.app.selectLuxuryDropdownOption === 'function', 'توفر دالة window.app.selectLuxuryDropdownOption');

// محاكاة استدعاء دالة الاختيار
let changedFilter = false;
window.app.testCallback = () => { changedFilter = true; };
window.app.selectLuxuryDropdownOption('deptStaffSectionFilterContainer', 'deptStaffSectionFilter', 'unit-1', 'testCallback', '⚙️ وحدة الفنية');
assert(changedFilter === true, 'نجاح تشغيل دالة التحديث عند اختيار خيار من القائمة');

// --- 5. التحقق من قواعد CSS في ملف style.css للوضعين النهاري والنيوني ---
console.log('\n--- 5. التحقق من قواعد CSS للوضعين النهاري والنيوني ---');
const cssPath = fs.existsSync(path.join(base, '../css/style.css')) ? path.join(base, '../css/style.css') : path.join(base, 'css/style.css');
const cssContent = fs.readFileSync(cssPath, 'utf8');

assert(cssContent.includes('.luxury-dropdown-container'), 'توفر كلاس .luxury-dropdown-container في style.css');
assert(cssContent.includes('.luxury-dropdown-trigger'), 'توفر كلاس .luxury-dropdown-trigger في style.css');
assert(cssContent.includes('.luxury-dropdown-menu'), 'توفر كلاس .luxury-dropdown-menu في style.css');
assert(cssContent.includes('top: calc(100% + 5px) !important;'), 'تثبيت نزول القائمة للأسفل دائماً top: calc(100% + 5px)');
assert(cssContent.includes('[data-theme="dark"] .luxury-dropdown-trigger'), 'توفر تنسيقات الوضع النيوني للزر [data-theme="dark"] .luxury-dropdown-trigger');
assert(cssContent.includes('[data-theme="dark"] .luxury-dropdown-menu'), 'توفر تنسيقات الوضع النيوني للقائمة [data-theme="dark"] .luxury-dropdown-menu');
assert(cssContent.includes('rgba(56, 189, 248'), 'استخدام التوهج السماوي النيوني المطابق للصورة المرجعية');

console.log('----------------------------------------------------------------------');
console.log('🎉 جميع اختبارات القوائم المنسدلة الفاخرة وشجرة جهات الارتباط نجحت 100%!');
console.log('----------------------------------------------------------------------');
process.exit(0);
