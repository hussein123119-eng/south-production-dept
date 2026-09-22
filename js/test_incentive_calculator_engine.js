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
global.alert = (msg) => { /* Mock alert */ };
global.print = () => { /* Mock print */ };
global.document = {
  documentElement: { setAttribute: () => {}, getAttribute: () => 'light' },
  body: { classList: { toggle: () => {}, remove: () => {}, add: () => {} } },
  getElementById: () => ({ value: '', innerHTML: '', style: {}, focus: () => {}, setSelectionRange: () => {} }),
  querySelector: () => null,
  querySelectorAll: () => [],
  addEventListener: () => {}
};

const scripts = [
  'store.js', 'auth.js', 'rbac.js', 'utils/exporter.js',
  'components/sidebar.js', 'components/topbar.js', 'components/announcement_bar.js',
  'components/dashboard.js', 'components/incentive_calculator.js', 'app.js'
];

for (const s of scripts) {
  const code = fs.readFileSync(path.join(base, s), 'utf8');
  eval(code);
}

console.log('======================================================================');
console.log('🧪 جناح اختبارات حاسبة الحافز المالي والتشغيلي الرسمي (القسم المالي)');
console.log('======================================================================');

let passCount = 0;
function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
  console.log(`  ✅ PASS: ${message}`);
  passCount++;
}

// --- 1. التحقق من تهيئة الحالة والوضع المزدوج ---
console.log('\n--- 1. التحقق من تهيئة الحالة والوضع المزدوج ---');
assert(typeof window.incentiveState === 'object', 'توفر كائن حالة الحافز window.incentiveState');
assert(window.incentiveState.calcMode === 'auto', 'الوضع الافتراضي للحاسبة هو الوضع التلقائي auto');
assert(window.incentiveState.pointPrice === 10000, 'سعر النقطة القياسي الافتراضي 10,000 د.ع');

window.setIncentiveCalcMode('manual');
assert(window.incentiveState.calcMode === 'manual', 'التبديل إلى وضع المحاكاة والاحتساب اليدوي manual بنجاح');

window.setIncentiveCalcMode('auto');
assert(window.incentiveState.calcMode === 'auto', 'العودة إلى الوضع التلقائي auto بنجاح');

// --- 2. التحقق من دوال البحث والفلترة الفورية ---
console.log('\n--- 2. التحقق من دوال البحث والفلترة الفورية ---');
assert(typeof window.handleIncentiveEmployeeSearch === 'function', 'توفر دالة البحث الفوري handleIncentiveEmployeeSearch');
assert(typeof window.handleIncentiveSectionFilter === 'function', 'توفر دالة فلترة الشعب handleIncentiveSectionFilter');
assert(typeof window.clearIncentiveEmployeeSearch === 'function', 'توفر دالة مسح البحث clearIncentiveEmployeeSearch');

window.handleIncentiveEmployeeSearch('مهندس');
assert(window.incentiveSearchState.searchQuery === 'مهندس', 'تحديث نص البحث بنجاح');

window.handleIncentiveSectionFilter('شعبة العمليات');
assert(window.incentiveSearchState.selectedSection === 'شعبة العمليات', 'تحديث فلتر الشعبة بنجاح');

window.clearIncentiveEmployeeSearch();
assert(window.incentiveSearchState.searchQuery === '', 'تفريغ نص البحث عند المسح');
assert(window.incentiveSearchState.selectedSection === 'ALL', 'إعادة ضبط فلتر الشعبة إلى ALL');

// --- 3. التحقق من التحميل الذكي لبيانات الموظف ---
console.log('\n--- 3. التحقق من سحب بيانات الموظف من الملاك الرسمي ---');
const employees = window.store.getUnifiedEmployeeRoster({ role: 'SUPER_ADMIN', departmentId: 'dept-south-prod' });
assert(employees && employees.length > 0, 'توفر سجلات موظفين في الملاك الرسمي');

const testEmp = employees[0];
window.loadEmployeeToIncentive(testEmp.id);
assert(String(window.incentiveState.employeeId) === String(testEmp.employeeId || testEmp.id), 'تطابق معرف الموظف المحمل');
assert(window.incentiveState.employeeName === (testEmp.name || testEmp.fullName), 'تطابق اسم الموظف المحمل');
assert(typeof window.incentiveState.serviceYears === 'number' && window.incentiveState.serviceYears >= 0, 'احتساب سنوات الخدمة تلقائياً كعدد موجب');
assert(window.incentiveState.leaveDays === 0, 'تصفير أيام الإجازات عند تحميل موظف جديد لاحتساب استحقاق نظيف');
assert(window.incentiveState.absenceDays === 0, 'تصفير أيام الغياب عند تحميل موظف جديد');

// --- 4. التحقق من النماذج الجاهزة السريعة ---
console.log('\n--- 4. التحقق من النماذج الجاهزة السريعة (Presets) ---');
window.applyIncentivePreset('prod_engineer');
assert(window.incentiveState.leadership === 'unit_head_shift_eng', 'تطبيق منصب مهندس تشغيل مناوب');
assert(window.incentiveState.category === 'shift_tech_prod', 'تطبيق فئة مناوب فني إنتاجي [x10.0]');

window.applyIncentivePreset('section_manager');
assert(window.incentiveState.leadership === 'deputy_dept_section_vertical', 'تطبيق منصب مسؤول شعبة رأسي');

window.applyIncentivePreset('leave_deduction');
assert(window.incentiveState.leaveDays === 6, 'تطبيق 6 أيام إجازة في نموذج الإجازات');

window.applyIncentivePreset('absence_deduction');
assert(window.incentiveState.absenceDays === 2, 'تطبيق يومان غياب في نموذج الغياب');

window.applyIncentivePreset('penalty_attention');
assert(window.incentiveState.penalty === 'attention', 'تطبيق عقوبة لفت نظر');

window.applyIncentivePreset('total_withholding');
assert(window.incentiveState.withholdingCase === 'study_leave', 'تطبيق حالة الحجب الكلي 100% لإجازة دراسية');

// --- 5. التحقق من دقة المحرك الحسابي والمعادلات ---
console.log('\n--- 5. التحقق من دقة المحرك الحسابي والمعادلات ---');
// مهندس بكالوريوس (9.0 * 0.15 = 1.35) + ممتاز (10 * 0.225 = 2.25) + خدمة 10 سنوات (10 * 0.1 = 1.0) + مناوب مهندس (4 * 0.15 = 0.6)
// المجموع الداخلي = 1.35 + 2.25 + 1.0 + 0.6 = 5.200
// ضرب معامل الموقع 10.0 = 52.000 نقطة
// سعر النقطة 10,000 د.ع = 520,000 د.ع
window.incentiveState.degree = 'bachelor_high_diploma';
window.incentiveState.evaluation = 'excellent';
window.incentiveState.serviceYears = 10;
window.incentiveState.leadership = 'unit_head_shift_eng';
window.incentiveState.category = 'shift_tech_prod';
window.incentiveState.pointPrice = 10000;
window.incentiveState.leaveDays = 0;
window.incentiveState.absenceDays = 0;
window.incentiveState.penalty = 'none';
window.incentiveState.withholdingCase = 'none';

let html = window.renderIncentiveCalculatorView();
assert(html.includes('52.000'), 'مجموع النقاط المحسوب بدقة هو 52.000 نقطة');
assert(html.includes('520,000'), 'الحافز الإجمالي الخام بدقة هو 520,000 د.ع');

// استقطاع إجازة 6 أيام (الزائد = 2 يوم * 2 = 4 أيام استقطاع)
// قيمة اليوم = 520,000 / 30 = 17,333.33 -> 4 أيام = 69,333 د.ع
window.incentiveState.leaveDays = 6;
html = window.renderIncentiveCalculatorView();
assert(html.includes('استقطاع 4 يوم حافز'), 'تطبيق قاعدة استقطاع يومان عن كل يوم إجازة يزيد عن 4 أيام');

// استقطاع غياب يوم واحد = ثلث الحافز
window.incentiveState.leaveDays = 0;
window.incentiveState.absenceDays = 1;
html = window.renderIncentiveCalculatorView();
assert(html.includes('ثلث الحافز'), 'استقطاع ثلث الحافز لغياب يوم واحد بدون عذر');

// غياب أكثر من يومين = حجب كامل 100%
window.incentiveState.absenceDays = 3;
html = window.renderIncentiveCalculatorView();
assert(html.includes('محجوب بالكامل') || html.includes('حجب الحافز بالكامل'), 'حجب الحافز 100% لغياب أكثر من يومين');

// --- 6. التحقق من صلاحيات RBAC وحماية الخصوصية ---
console.log('\n--- 6. التحقق من صلاحيات RBAC وحماية الخصوصية ---');
window.setIncentiveCalcMode('auto');

// أ. الموظف العادي
window.auth.getCurrentUser = () => ({ id: 'usr-regular', employeeId: testEmp.employeeId || testEmp.id, role: 'EMPLOYEE', name: testEmp.name });
html = window.renderIncentiveCalculatorView();
assert(html.includes('inc-privacy-banner'), 'عرض بنر الخصوصية والحماية للموظف العادي');
assert(html.includes('حساب شخصي مؤمن') || html.includes('حساب شخصي'), 'تأكيد الحساب الشخصي للموظف العادي');

// ب. مسؤول الشعبة
window.auth.getCurrentUser = () => ({ id: 'usr-sec-mgr', role: 'SECTION_MANAGER', section: 'شعبة التشغيل والإنتاج' });
html = window.renderIncentiveCalculatorView();
assert(html.includes('نطاق الشعبة'), 'تحديد نطاق البحث لشعبة المسؤول فقط');

// ج. مدير القسم والمشرف العام
window.auth.getCurrentUser = () => ({ id: 'usr-admin', role: 'SUPER_ADMIN' });
html = window.renderIncentiveCalculatorView();
assert(html.includes('صلاحية شاملة'), 'منح صلاحية البحث الشاملة للإدارة العليا');
assert(html.includes('incEmployeeSearchInput'), 'توفر حقل البحث الفوري الشامل');

// --- 7. التحقق من حاسبة سعر النقطة المركزية ---
console.log('\n--- 7. التحقق من حاسبة سعر النقطة المركزية للقسم ---');
assert(typeof window.autoCalculateDepartmentTotalPoints === 'function', 'توفر دالة حساب مجموع نقاط كادر القسم');
assert(typeof window.calculateAndApplyCentralPointPrice === 'function', 'توفر دالة اعتماد وتطبيق سعر النقطة المحسوب');

window.incentiveState.centralMode = 'direct';
window.incentiveState.centralDirectPoolAmount = 500000000;
window.incentiveState.centralTotalStaffPoints = 50000;
window.calculateAndApplyCentralPointPrice();
assert(window.incentiveState.pointPrice === 10000, 'احتساب سعر النقطة بدقة: 500 مليون / 50 ألف نقطة = 10,000 د.ع');

// --- 8. التحقق من عناصر واجهة المستخدم الفاخرة ---
console.log('\n--- 8. التحقق من عناصر واجهة المستخدم الفاخرة ---');
window.setIncentiveTab('calculator');
html = window.renderIncentiveCalculatorView();
assert(html.includes('inc-mode-switcher'), 'توفر مبدل الوضع المزدوج التلقائي/اليدوي');
assert(html.includes('inc-crystal-grid'), 'توفر شبكة البلورات الكريستالية الرباعية');
assert(html.includes('inc-crystal-points'), 'توفر بلورة مجموع النقاط');
assert(html.includes('inc-crystal-gross'), 'توفر بلورة الحافز الخام');
assert(html.includes('inc-crystal-deductions'), 'توفر بلورة الاستقطاعات');
assert(html.includes('inc-crystal-net'), 'توفر بلورة الصافي المستحق');
assert(html.includes('printIncentiveVoucher'), 'توفر زر طباعة سند وقسيمة الاستحقاق');

console.log('----------------------------------------------------------------------');
console.log(`النتيجة الإجمالية: ${passCount} ناجح | 0 راسب من أصل ${passCount}`);
console.log('----------------------------------------------------------------------');
console.log('🎉 جميع اختبارات منظومة حاسبة الحافز والبحث الذكي بالصلاحيات نجحت بنسبة 100%!');
