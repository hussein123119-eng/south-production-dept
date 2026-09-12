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

global.confirm = () => true;
global.alert = () => {};

global.document = {
  documentElement: { setAttribute: () => {}, getAttribute: () => 'light' },
  body: { classList: { toggle: () => {}, remove: () => {}, add: () => {} } },
  getElementById: () => ({ value: '', innerHTML: '', style: {}, classList: { add: () => {}, remove: () => {} }, focus: () => {}, setSelectionRange: () => {} }),
  querySelector: () => null,
  querySelectorAll: () => [],
  addEventListener: () => {}
};

console.log('======================================================================');
console.log('🧪 اختبارات التحقق من نظام وأزرار أرشفة واستعادة المستندات (DMS)');
console.log('======================================================================\n');

const scripts = [
  'store.js', 'auth.js', 'rbac.js', 'utils/exporter.js',
  'components/sidebar.js', 'components/topbar.js', 'components/announcement_bar.js',
  'components/dashboard.js', 'components/dept_management.js', 'components/section_workspace.js', 'components/unit_workspace.js',
  'components/user_management.js', 'components/documents.js', 'app.js'
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

// 1. Check method existence on window.app
assert(typeof window.app.archiveDocument === 'function', 'دالة archiveDocument مدمجة في كائن التطبيق window.app');
assert(typeof window.app.unarchiveDocument === 'function', 'دالة unarchiveDocument مدمجة في كائن التطبيق window.app');
assert(typeof window.app.setDocCategoryFilter === 'function', 'دالة setDocCategoryFilter مدمجة في كائن التطبيق window.app');
assert(typeof window.app.handleDocSearch === 'function', 'دالة handleDocSearch مدمجة في كائن التطبيق window.app');

// 2. Setup user and test documents
window.auth.currentUser = {
  id: 'user-dept-mgr',
  employeeId: 'EMP-2024-001',
  fullName: 'م. أحمد عبد الحسين',
  role: 'DEPT_MANAGER',
  departmentId: 'dept-south-prod'
};

const testDoc = {
  id: 'doc-test-archive-01',
  departmentId: 'dept-south-prod',
  title: 'تقرير الصيانة الوقائية السنوية للمضخات',
  category: 'WORD',
  content: 'محتوى تجريبي لأرشفة المستند',
  version: '1.0',
  status: 'PUBLISHED',
  isArchived: false,
  createdAt: new Date().toISOString(),
  createdByName: 'م. أحمد عبد الحسين'
};

window.store.addDocument(testDoc);

// Verify active state
let docs = window.store.getDocuments('dept-south-prod');
let retrieved = docs.find(d => d.id === 'doc-test-archive-01');
assert(retrieved && !retrieved.isArchived, 'المستند التجريبي مضاف بحالة نشطة وغير مؤرشف');

// 3. Test Archive Action
window.app.archiveDocument('doc-test-archive-01');
docs = window.store.getDocuments('dept-south-prod');
retrieved = docs.find(d => d.id === 'doc-test-archive-01');
assert(retrieved && retrieved.isArchived === true, 'تم تحديث خاصية isArchived إلى true بنجاح عند الضغط على زر الأرشفة');
assert(retrieved && retrieved.status === 'ARCHIVED', 'تم تحويل حالة المستند status إلى ARCHIVED');

// 4. Test Documents View HTML with Archived Tab
window.app.currentDocCategoryFilter = 'ALL';
let html = renderDocumentsView();
assert(!html.includes('doc-test-archive-01') || html.includes('📁 مؤرشف بالأرشيف'), 'المستند المؤرشف يظهر عليه شارة الأرشيف أو يتم فرزه');

window.app.currentDocCategoryFilter = 'ARCHIVED';
html = renderDocumentsView();
assert(html.includes('doc-test-archive-01') && html.includes('unarchiveDocument'), 'تبويب المستندات المؤرشفة يحتوي على المستند وزر استعادة الأرشفة');

// 5. Test Unarchive Action
window.app.unarchiveDocument('doc-test-archive-01');
docs = window.store.getDocuments('dept-south-prod');
retrieved = docs.find(d => d.id === 'doc-test-archive-01');
assert(retrieved && retrieved.isArchived === false, 'تمت استعادة المستند وإلغاء الأرشفة بنجاح isArchived: false');
assert(retrieved && retrieved.status === 'PUBLISHED', 'عادت حالة المستند إلى PUBLISHED');

// Clean up
window.store.deleteDocument('doc-test-archive-01');

console.log('\n----------------------------------------------------------------------');
console.log(`النتيجة الإجمالية: ${passedCount} ناجح | ${failedCount} راسب`);
console.log('----------------------------------------------------------------------');

if (failedCount > 0) {
  console.error('❌ فشل في بعض اختبارات أرشفة المستندات');
  process.exit(1);
} else {
  console.log('🎉 جميع اختبارات أرشفة واستعادة المستندات نجحت بنسبة 100%!');
  process.exit(0);
}
