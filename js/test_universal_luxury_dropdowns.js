/**
 * جناح اختبارات تعميم القوائم المنسدلة الفاخرة للأسفل على كافة التطبيق
 * Universal Luxury Downward Dropdowns & System-wide Theme Engine Test Suite
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
        querySelector: function(sel) {
          if (sel === '.luxury-dropdown-menu') return { style: {}, classList: { add: () => {}, remove: () => {} } };
          if (sel === '.luxury-dropdown-arrow') return { style: {} };
          if (sel === '.luxury-dropdown-selected-label') return { innerHTML: '' };
          return null;
        },
        querySelectorAll: function(sel) {
          return [];
        },
        dispatchEvent: () => {},
        appendChild: () => {},
        setAttribute: () => {},
        getAttribute: () => null
      };
    }
    return mockDomElements[id];
  },
  querySelector: () => null,
  querySelectorAll: () => [],
  addEventListener: () => {},
  removeEventListener: () => {}
};

const scripts = [
  'store.js', 'auth.js', 'rbac.js', 'utils/exporter.js',
  'components/sidebar.js', 'components/topbar.js', 'components/announcement_bar.js',
  'components/dashboard.js', 'components/dept_management.js', 'components/section_workspace.js', 'components/unit_workspace.js',
  'components/user_management.js', 'components/vehicles.js', 'components/technical_status.js', 'app.js'
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
console.log('🧪 جناح اختبارات تعميم القوائم المنسدلة الفاخرة للأسفل على كافة التطبيق');
console.log('======================================================================');

// --- 1. التحقق من قواعد CSS العامة لكافة عناصر select في style.css ---
console.log('\n--- 1. التحقق من قواعد CSS لكافة عناصر select في style.css ---');
const cssPath = fs.existsSync(path.join(base, '../css/style.css')) ? path.join(base, '../css/style.css') : path.join(base, 'css/style.css');
const cssContent = fs.readFileSync(cssPath, 'utf8');

assert(cssContent.includes('Universal Luxury Select Dropdowns System'), 'توفر قسم تعميم القوائم المنسدلة الفاخرة في style.css');
assert(cssContent.includes('.dept-doc-select') && cssContent.includes('.sec-notif-select'), 'شمول كافة كلاسات القوائم المنسدلة في النظام');
assert(cssContent.includes('border: 1.5px solid var(--md-sys-color-outline-variant, rgba(11, 87, 208, 0.25))'), 'تطبيق إطار الوضع النهاري الفاخر');
assert(cssContent.includes('[data-theme="dark"] select'), 'تطبيق قواعد الوضع النيوني لكافة عناصر select');
assert(cssContent.includes('border: 1.5px solid rgba(56, 189, 248, 0.38)'), 'تطبيق إطار التوهج النيوني الفاخر للوضع الليلي');
assert(cssContent.includes('stroke=\'%2338bdf8\''), 'استخدام سهم السيان النيوني الفاخر في الوضع المظلم');
assert(cssContent.includes('stroke=\'%230b57d0\''), 'استخدام سهم الأزرق الملكي الفاخر في الوضع النهاري');

// --- 2. التحقق من إلزام نزول جميع القوائم للأسفل حصراً ---
console.log('\n--- 2. التحقق من إلزام نزول جميع القوائم للأسفل حصراً ---');
assert(cssContent.includes('top: calc(100% + 5px) !important;'), 'إلزام فتح القوائم المنسدلة للأسفل دائماً');
assert(cssContent.includes('bottom: auto !important;'), 'إلغاء التمدد للأعلى ومنع عكس اتجاه القائمة');
assert(cssContent.includes('.luxury-dropdown-container select'), 'توفر قاعدة إخفاء عناصر select الأصلية المغلفة داخل الحاوية الفاخرة');

// --- 3. التحقق من ملف founder.css للوضعين النهاري والنيوني ---
console.log('\n--- 3. التحقق من ملف founder.css ---');
const founderCssPath = fs.existsSync(path.join(base, '../css/founder.css')) ? path.join(base, '../css/founder.css') : path.join(base, 'css/founder.css');
const founderCss = fs.readFileSync(founderCssPath, 'utf8');
assert(founderCss.includes('.select-glass'), 'توفر كلاس select-glass في founder.css');
assert(founderCss.includes('stroke=\'%2338bdf8\''), 'توفير سهم السيان النيوني في founder.css');
assert(founderCss.includes('stroke=\'%230b57d0\''), 'توفير سهم الأزرق الملكي في الوضع النهاري بـ founder.css');

// --- 4. التحقق من توفر دوال التحكم والمولد التلقائي في app.js ---
console.log('\n--- 4. التحقق من دوال التحكم والمولد التلقائي في app.js ---');
assert(typeof window.app.toggleLuxuryDropdown === 'function', 'توفر دالة toggleLuxuryDropdown');
assert(typeof window.app.selectLuxuryDropdownOption === 'function', 'توفر دالة selectLuxuryDropdownOption');
assert(typeof window.app.buildLuxuryDropdownHtml === 'function', 'توفر دالة المولد الفاخر buildLuxuryDropdownHtml');
assert(typeof window.app.enhanceSelectToLuxury === 'function', 'توفر دالة enhanceSelectToLuxury');
assert(typeof window.app.enhanceAllSelects === 'function', 'توفر دالة enhanceAllSelects');

// اختبار تشغيل buildLuxuryDropdownHtml برمجياً
const testDropHtml = window.app.buildLuxuryDropdownHtml({
  selectId: 'testCustomSelect',
  selectedValue: 'val2',
  options: [
    { value: 'val1', label: 'الخيار الأول' },
    { value: 'val2', label: 'الخيار الثاني المختار' },
    { value: 'val3', label: 'الخيار الثالث', group: 'المجموعة المتقدمة' }
  ],
  onChangeCallback: 'testCallback'
});

assert(testDropHtml.includes('id="testCustomSelectContainer"'), 'إنشاء حاوية القائمة الفاخرة بالمعرف المتوافق');
assert(testDropHtml.includes('id="testCustomSelectTrigger"'), 'إنشاء زر تفعيل القائمة الفاخرة');
assert(testDropHtml.includes('id="testCustomSelectMenu"'), 'إنشاء قائمة الخيارات المنسدلة للأسفل');
assert(testDropHtml.includes('id="testCustomSelect"'), 'الحفاظ على عنصر select الأصلي مخفياً للتوافق 100%');
assert(testDropHtml.includes('الخيار الثاني المختار'), 'ظهور النص الافتراضي للخيار المحدد');
assert(testDropHtml.includes('المجموعة المتقدمة'), 'دعم مجموعات الخيارات optgroup في القائمة الفاخرة');

// --- 5. التحقق من قوائم الحركات الميدانية للآليات في vehicles.js ---
console.log('\n--- 5. التحقق من قوائم إدارة الآليات (vehicles.js) ---');
const activeMovements = [
  { id: 'm-1', driverName: 'سعد كريم', shift: 'A', vehiclePlate: '12345', affiliationType: 'STATION' }
];
const vehHtml = window.renderActiveMovementsTab(activeMovements, true);

assert(vehHtml.includes('vehAffiliationFilterContainer'), 'توفر حاوية قائمة الارتباطات الفاخرة في الآليات');
assert(vehHtml.includes('vehAffiliationFilterTrigger'), 'توفر زر تفعيل قائمة الارتباطات الفاخرة');
assert(vehHtml.includes('vehAffiliationFilterMenu'), 'توفر القائمة المنسدلة لأسفل للارتباطات');
assert(vehHtml.includes('id="vehAffiliationFilter"'), 'الحفاظ على select الأصلي vehAffiliationFilter');

assert(vehHtml.includes('vehShiftFilterContainer'), 'توفر حاوية قائمة النوبات الفاخرة في الآليات');
assert(vehHtml.includes('vehShiftFilterTrigger'), 'توفر زر تفعيل قائمة النوبات الفاخرة');
assert(vehHtml.includes('vehShiftFilterMenu'), 'توفر القائمة المنسدلة لأسفل للنوبات');
assert(vehHtml.includes('id="vehShiftFilter"'), 'الحفاظ على select الأصلي vehShiftFilter');

// التحقق من اتساع الحاويات لمنع قطع النص
assert(vehHtml.includes('width: 170px'), 'اتساع حاوية الارتباطات لمنع اقتطاع النص (170px)');
assert(vehHtml.includes('width: 155px'), 'اتساع حاوية النوبات لمنع اقتطاع النص (155px)');

// التحقق من توفر دالة تصفية حركات الآليات ومحاكاة عملها
assert(typeof window.app.filterActiveVehiclesMovements === 'function', 'توفر دالة filterActiveVehiclesMovements في app.js');

const mockMovementRow1 = {
  style: { display: '' },
  attrs: { 'data-search': 'سعد كريم 12345 صهريج', 'data-affiliation': 'STATION', 'data-shift': 'A', 'data-section': 'SEC_STATIONS' },
  getAttribute(name) { return this.attrs[name] || ''; }
};
const mockMovementRow2 = {
  style: { display: '' },
  attrs: { 'data-search': 'حسين علي 98765 قلاب', 'data-affiliation': 'DEPT_MGMT', 'data-shift': 'B', 'data-section': 'DEPT' },
  getAttribute(name) { return this.attrs[name] || ''; }
};

const origQSA = global.document.querySelectorAll;
const origQS = global.document.querySelector;
const mockTableBody = { appendChild: () => {} };

global.document.querySelectorAll = (sel) => {
  if (sel === '#activeVehMovementsTable .veh-movement-row') {
    return [mockMovementRow1, mockMovementRow2];
  }
  return [];
};
global.document.querySelector = (sel) => {
  if (sel === '#activeVehMovementsTable tbody') return mockTableBody;
  return null;
};

// تصفية بالنوبة A
global.document.getElementById('vehMovementSearchInput').value = '';
global.document.getElementById('vehAffiliationFilter').value = 'ALL';
global.document.getElementById('vehShiftFilter').value = 'A';
window.app.filterActiveVehiclesMovements();

assert(mockMovementRow1.style.display === '', 'ظهور حركة النوبة A المطابقة');
assert(mockMovementRow2.style.display === 'none', 'إخفاء حركة النوبة B غير المطابقة');

// تصفية بإدارة القسم DEPT_MGMT
global.document.getElementById('vehShiftFilter').value = 'ALL';
global.document.getElementById('vehAffiliationFilter').value = 'DEPT_MGMT';
window.app.filterActiveVehiclesMovements();

assert(mockMovementRow1.style.display === 'none', 'إخفاء حركة المحطة عند تصفية إدارة القسم');
assert(mockMovementRow2.style.display === '', 'ظهور حركة إدارة القسم المطابقة');

// استعادة الدوال
global.document.querySelectorAll = origQSA;
global.document.querySelector = origQS;


// --- 6. التحقق من قوائم الموقف الفني (technical_status.js) ---
console.log('\n--- 6. التحقق من قوائم الموقف الفني (technical_status.js) ---');
const mockStations = [
  { id: 'st-1', name: 'محطة الرطكة' },
  { id: 'st-2', name: 'محطة الشامية' }
];
const techHtml = window.renderSectionTechnicalStatusTab([], mockStations, true);

assert(techHtml.includes('sectionTechStationFilterContainer'), 'توفر حاوية قائمة المحطات الفاخرة في الموقف الفني للشعبة');
assert(techHtml.includes('sectionTechStationFilterMenu'), 'توفر قائمة المحطات المنسدلة لأسفل');
assert(techHtml.includes('id="sectionTechStationFilter"'), 'الحفاظ على select الأصلي sectionTechStationFilter');

assert(techHtml.includes('sectionTechStatusFilterContainer'), 'توفر حاوية قائمة الحالات الفنية الفاخرة في الشعبة');
assert(techHtml.includes('sectionTechStatusFilterMenu'), 'توفر قائمة الحالات الفنية المنسدلة لأسفل');
assert(techHtml.includes('id="sectionTechStatusFilter"'), 'الحفاظ على select الأصلي sectionTechStatusFilter');

const stationTechHtml = window.renderStationTechnicalStatusTab([], mockStations[0], true);
assert(stationTechHtml.includes('stationTechStatusFilterContainer'), 'توفر حاوية قائمة حالات المحطة الفاخرة');
assert(stationTechHtml.includes('stationTechForwardFilterContainer'), 'توفر حاوية قائمة الإرسال الفاخرة بالمحطة');
assert(stationTechHtml.includes('id="stationTechStatusFilter"'), 'الحفاظ على select الأصلي stationTechStatusFilter');
assert(stationTechHtml.includes('id="stationTechForwardFilter"'), 'الحفاظ على select الأصلي stationTechForwardFilter');

console.log('----------------------------------------------------------------------');
console.log('🎉 جميع اختبارات تعميم القوائم المنسدلة الفاخرة نجحت بنسبة 100%!');
console.log('----------------------------------------------------------------------');
process.exit(0);
