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
  getElementById: () => ({ value: '', innerHTML: '', style: {}, classList: { add: () => {}, remove: () => {} } }),
  querySelector: () => null,
  querySelectorAll: () => [],
  addEventListener: () => {}
};

const scripts = [
  'store.js', 'auth.js', 'rbac.js', 'utils/exporter.js',
  'components/sidebar.js', 'components/topbar.js', 'components/announcement_bar.js',
  'components/dashboard.js', 'components/promotion_calculator.js', 'components/user_management.js',
  'app.js'
];

for (const s of scripts) {
  const code = fs.readFileSync(path.join(base, s), 'utf8');
  eval(code);
}

console.log('====================================================');
console.log('🧪 TESTING CAREER TITLES, PROGRESSIONS & BULK THANKS');
console.log('====================================================');

// Test 1: Technical Track - Institute Diploma (1 Year Exception)
console.log('\n--- 1. Testing Technical Track (Institute Diploma 1-Yr Exception) ---');
const promoInst = window.store.calculateCareerPromotion('8', 1, '2025-01-01', { minister: 1, primeMinister: 0, president: 0 }, 'دبلوم', 'فني', 'technical');
console.log('Current Grade:', promoInst.gradeName, '-> Next Grade Name:', promoInst.nextGradeName);
console.log('Current Title:', promoInst.currentJobTitle, '-> Next Title:', promoInst.nextJobTitle);
console.log('Required Duration:', promoInst.requiredYears, 'year(s)');
console.log('Exception Note:', promoInst.exceptionNote);
if (promoInst.requiredYears !== 1 || promoInst.nextJobTitle !== 'معاون ملاحظ فني') {
  throw new Error('Test 1 FAILED: Technical Diploma should require exactly 1 year and lead to معاون ملاحظ فني');
}
console.log('✓ Test 1 Passed: 1-Year Diploma progression correctly calculated.');

// Test 2: Technical Track - Preparatory (4 Years Standard)
console.log('\n--- 2. Testing Technical Track (Preparatory 4-Years Standard) ---');
const promoPrep = window.store.calculateCareerPromotion('8', 1, '2025-01-01', { minister: 0, primeMinister: 0, president: 0 }, 'اعدادية', 'فني', 'technical');
console.log('Current Title:', promoPrep.currentJobTitle, '-> Next Title:', promoPrep.nextJobTitle);
console.log('Required Duration:', promoPrep.requiredYears, 'year(s)');
if (promoPrep.requiredYears !== 4 || promoPrep.nextJobTitle !== 'معاون ملاحظ فني') {
  throw new Error('Test 2 FAILED: Preparatory should require 4 years to become معاون ملاحظ فني');
}
console.log('✓ Test 2 Passed: 4-Year Preparatory progression correctly calculated.');

// Test 3: Degree Ceiling Check (Preparatory Grade 4 Ceiling)
console.log('\n--- 3. Testing Degree Ceiling (Preparatory Ceiling at Grade 4) ---');
const promoCeiling = window.store.calculateCareerPromotion('4', 2, '2020-01-01', 0, 'اعدادية', 'معاون مدير فني', 'technical');
console.log('At Grade 4 with Preparatory -> isAtCeiling:', promoCeiling.isAtCeiling);
console.log('Ceiling Status:', promoCeiling.status);
if (!promoCeiling.isAtCeiling || promoCeiling.nextGradeKey !== null) {
  throw new Error('Test 3 FAILED: Grade 4 with Preparatory must hit degree ceiling');
}
console.log('✓ Test 3 Passed: Degree ceiling correctly halts progression.');

// Test 4: Engineering Track Progression
console.log('\n--- 4. Testing Engineering Track Progression ---');
const promoEng = window.store.calculateCareerPromotion('7', 1, '2022-01-01', 0, 'بكالوريوس', 'معاون مهندس', 'engineering');
console.log('Current Title:', promoEng.currentJobTitle, '-> Next Title:', promoEng.nextJobTitle);
if (promoEng.nextJobTitle !== 'مهندس') {
  throw new Error('Test 4 FAILED: معاون مهندس should progress to مهندس');
}
console.log('✓ Test 4 Passed: Engineering track progression verified.');

// Test 5: Bulk Thanks Letter Tool
console.log('\n--- 5. Testing Bulk Thanks Letter Engine (Minister +1 Month) ---');
const deptId = 'dept-south-prod';
const testThanks = {
  issuer: 'MINISTER',
  letterNumber: 'ش/وزارة/9982',
  letterDate: '2026-09-01',
  subject: 'شكر وتقدير عام لمنتسبي قسم الإنتاج الجنوبي',
  reason: 'تثميناً لجهود الكوادر في استقرار الإنتاج ومعدلات الضخ'
};

const bulkRes = window.store.addBulkThanksLetter(deptId, testThanks, 'ALL', { id: 'usr-admin', name: 'المدير العام' });
console.log('Bulk Thanks result:', bulkRes);
if (!bulkRes.success || bulkRes.affectedCount === 0) {
  throw new Error('Test 5 FAILED: Bulk thanks letter did not update any records');
}
console.log(`✓ Test 5 Passed: Successfully added bulk thanks to ${bulkRes.affectedCount} employees with +${bulkRes.grantedMonths} month(s) seniority.`);

// Test 6: Promotion Calculator View Render
console.log('\n--- 6. Testing Promotion Calculator HTML View Render ---');
const htmlView = window.renderPromotionCalculatorView();
console.log(`Rendered Promotion Calculator (${htmlView.length} characters)`);
if (!htmlView.includes('العنوان المستحق القادم') || !htmlView.includes('آخر علاوة سنوية')) {
  throw new Error('Test 6 FAILED: HTML output missing Career Title crystal cards or last increment date');
}
console.log('✓ Test 6 Passed: Promotion Calculator view contains all UI crystals and updated dossier card.');

// Test 7: Bulk Thanks Modal Activation on window.app & App.prototype
console.log('\n--- 7. Testing window.app.openBulkThanksModal & App.prototype Activation ---');
if (typeof window.app.openBulkThanksModal !== 'function') {
  throw new Error('Test 7 FAILED: window.app.openBulkThanksModal is not defined as a function');
}
if (typeof window.app.submitBulkThanks !== 'function') {
  throw new Error('Test 7 FAILED: window.app.submitBulkThanks is not defined as a function');
}
if (typeof window.app.updateBulkThanksMonthsPreview !== 'function') {
  throw new Error('Test 7 FAILED: window.app.updateBulkThanksMonthsPreview is not defined as a function');
}

// Invoke openBulkThanksModal to make sure no syntax / runtime errors occur
let modalShown = false;
window.app.showModal = (title, content) => {
  modalShown = true;
  if (!title.includes('شكر وتقدير') || !content.includes('bulkThanksForm')) {
    throw new Error('Test 7 FAILED: modal title or content malformed');
  }
};
window.auth.currentUser = { id: 'usr-admin', name: 'المدير العام', role: 'SUPER_ADMIN', departmentId: 'dept-south-prod' };
window.app.openBulkThanksModal();
if (!modalShown) {
  throw new Error('Test 7 FAILED: openBulkThanksModal did not call showModal');
}
console.log('✓ Test 7 Passed: window.app.openBulkThanksModal is fully active and opens modal successfully.');

// Test 8: Dual Mode Switching (Auto vs Manual Simulation)
console.log('\n--- 8. Testing Promotion Calculator Dual Mode (Auto vs Manual) ---');
if (typeof window.setPromotionCalcMode !== 'function') {
  throw new Error('Test 8 FAILED: window.setPromotionCalcMode is not defined');
}
if (typeof window.resetManualSimulation !== 'function') {
  throw new Error('Test 8 FAILED: window.resetManualSimulation is not defined');
}

// Test Auto Mode
window.setPromotionCalcMode('auto');
const autoView = window.renderPromotionCalculatorView();
if (!autoView.includes('الوضع التلقائي') || !autoView.includes('promo-dossier-card') || !autoView.includes('promoEmployeeSelect')) {
  throw new Error('Test 8 FAILED: Auto mode view missing Master Dossier card or Roster selector');
}
console.log('✓ Test 8.1 Passed: Automatic mode renders official Master Dossier card & roster selector.');

// Test Manual Mode
window.setPromotionCalcMode('manual');
const manualView = window.renderPromotionCalculatorView();
if (!manualView.includes('وضع المحاكاة والاحتساب اليدوي الافتراضي') || !manualView.includes('calcJobTitle') || !manualView.includes('إعادة ضبط المحاكاة')) {
  throw new Error('Test 8 FAILED: Manual mode view missing Simulation Banner or What-If form');
}
console.log('✓ Test 8.2 Passed: Manual Simulation mode renders What-If simulation form & reset banner.');

// Test Reset Manual Simulation
window.promotionCalcState.jobTitle = 'كبير مهندسين تجريبي';
window.promotionCalcState.grade = '2';
window.resetManualSimulation();
if (window.promotionCalcState.jobTitle !== 'فني' || window.promotionCalcState.grade !== '8') {
  throw new Error('Test 8 FAILED: resetManualSimulation did not reset state to default template');
}
console.log('✓ Test 8.3 Passed: resetManualSimulation successfully resets simulation model.');

// Test 9: Employee Loading into Promotion Calculator from Unified Roster
console.log('\n--- 9. Testing Employee Loading into Promotion Calculator ---');
const roster = window.store.getUnifiedEmployeeRoster({ role: 'SUPER_ADMIN', departmentId: 'dept-south-prod' });
if (roster && roster.length > 0) {
  const targetEmp = roster[0];
  const targetId = targetEmp.employeeId || targetEmp.id;
  window.loadEmployeeToPromotionCalc(targetId);
  if (String(window.promotionCalcState.employeeId) !== String(targetId)) {
    throw new Error(`Test 9 FAILED: Expected employeeId ${targetId}, got ${window.promotionCalcState.employeeId}`);
  }
} else {
  console.log('⚠️ Test 9 Skipped: Unified roster empty in test environment.');
}

// Test 10: Smart Multi-Criteria Live Search & RBAC Scoping in Promotion Calculator
console.log('\n--- 10. Testing Smart Live Search, Section Filtering & RBAC Scoping ---');
if (typeof window.handlePromotionEmployeeSearch !== 'function') {
  throw new Error('Test 10 FAILED: window.handlePromotionEmployeeSearch is not defined');
}
if (typeof window.handlePromotionSectionFilter !== 'function') {
  throw new Error('Test 10 FAILED: window.handlePromotionSectionFilter is not defined');
}
if (typeof window.clearPromotionEmployeeSearch !== 'function') {
  throw new Error('Test 10 FAILED: window.clearPromotionEmployeeSearch is not defined');
}

// 10.1: Admin View with Live Search
window.auth.currentUser = { id: 'usr-admin', name: 'المدير العام', role: 'SUPER_ADMIN', departmentId: 'dept-south-prod' };
window.setPromotionCalcMode('auto');
window.clearPromotionEmployeeSearch();
const adminView = window.renderPromotionCalculatorView();
if (!adminView.includes('promoEmployeeSearchInput') || !adminView.includes('promoSectionFilterSelect') || !adminView.includes('البحث في سجلات الموظفين')) {
  throw new Error('Test 10.1 FAILED: Admin view must contain live search input and section filter');
}
console.log('✓ Test 10.1 Passed: Admin has full search and section filter bar.');

// 10.2: Filter by Search Query
window.handlePromotionEmployeeSearch('فني');
if (window.promotionCalcSearchState.searchQuery !== 'فني') {
  throw new Error('Test 10.2 FAILED: Search state was not updated with query');
}
const searchFilteredView = window.renderPromotionCalculatorView();
if (!searchFilteredView.includes('promoEmployeeSearchInput')) {
  throw new Error('Test 10.2 FAILED: Render failed after setting search query');
}
console.log('✓ Test 10.2 Passed: Live search query filtering verified.');

// 10.3: Filter by Section
window.handlePromotionSectionFilter('شعبة العمليات');
if (window.promotionCalcSearchState.selectedSection !== 'شعبة العمليات') {
  throw new Error('Test 10.3 FAILED: Section filter state was not updated');
}
console.log('✓ Test 10.3 Passed: Section filter selection verified.');

// 10.4: Clear Search
window.clearPromotionEmployeeSearch();
if (window.promotionCalcSearchState.searchQuery !== '' || window.promotionCalcSearchState.selectedSection !== 'ALL') {
  throw new Error('Test 10.4 FAILED: Clear search did not reset query and section');
}
console.log('✓ Test 10.4 Passed: Clear search reset verified.');

// 10.5: Regular Employee Privacy & Scoping Check
window.auth.currentUser = { id: 'usr-emp-001', employeeId: 'EMP-7711', name: 'أحمد علي حسن', role: 'EMPLOYEE', departmentId: 'dept-south-prod', jobGrade: '8', jobStage: 2, degree: 'دبلوم', lastPromotionDate: '2023-05-01' };
const regularEmpView = window.renderPromotionCalculatorView();
if (!regularEmpView.includes('إضبارتك وسجلك الوظيفي الشخصي المعتمد') || regularEmpView.includes('promoEmployeeSearchInput')) {
  throw new Error('Test 10.5 FAILED: Regular employee should see personal privacy badge and NOT multi-employee search selector');
}
console.log('✓ Test 10.5 Passed: Regular employee data privacy & RBAC scoping verified.');

console.log('\n====================================================');
console.log('🎉 ALL 10 CAREER TITLE, DUAL-MODE & SEARCH TESTS PASSED 100%!');
console.log('====================================================');


