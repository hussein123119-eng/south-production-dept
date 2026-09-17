/* ==========================================================================
   اختبارات إزالة تبويب نظرة عامة والتقارير من المحطات
   Test Suite: Remove Overview & Reports Tab from Stations Workspace (Suite 33)
   ========================================================================== */

const fs = require('fs');
const path = require('path');

let passCount = 0;
let failCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passCount++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failCount++;
  }
}

// 1. إعداد بيئة وهمية للمتصفح (Mock Browser Environment)
const mockStorage = {};
global.localStorage = {
  getItem: (key) => (key in mockStorage ? mockStorage[key] : null),
  setItem: (key, val) => { mockStorage[key] = String(val); },
  removeItem: (key) => { delete mockStorage[key]; },
  clear: () => { Object.keys(mockStorage).forEach(k => delete mockStorage[k]); }
};

global.window = {
  location: { hostname: 'localhost', protocol: 'http:' },
  addEventListener: () => {},
  dispatchEvent: () => true
};

global.document = {
  documentElement: {
    getAttribute: (attr) => (attr === 'data-theme' ? 'light' : null),
    setAttribute: () => {}
  }
};

console.log('======================================================================');
console.log('🧪 اختبارات إزالة تبويب (نظرة عامة والتقارير) من مساحة عمل المحطات');
console.log('======================================================================\n');

// 2. تحميل ملفات النظام والمحرك ومكونات مساحة عمل المحطة
const storeCode = fs.readFileSync(path.join(__dirname, 'store.js'), 'utf8');
eval(storeCode);
global.store = global.window.store;

const rbacCode = fs.readFileSync(path.join(__dirname, 'rbac.js'), 'utf8');
eval(rbacCode);

const authCode = fs.readFileSync(path.join(__dirname, 'auth.js'), 'utf8');
eval(authCode);

global.auth = global.window.auth;
global.window.auth.currentUser = global.store.getUserById('user-alaa-dept-mgr') || global.store.getDb().users[0];

global.window.app = {
  currentStationSubTab: 'staff',
  setStationSubTab: (subTab) => { global.window.app.currentStationSubTab = subTab; },
  navigate: () => {}
};

const stationWorkspaceCode = fs.readFileSync(path.join(__dirname, 'components', 'station_workspace.js'), 'utf8');
eval(stationWorkspaceCode);

async function runTests() {
  console.log('--- 1. التحقق من إزالة تبويب نظرة عامة والتقارير من المحطة الإنتاجية القياسية ---');
  
  // فحص محطة قياسية تابعة للشعبة الأولى (st-101)
  const stationHtml = global.window.renderStationWorkspaceView('st-101');

  assert(!stationHtml.includes('نظرة عامة والتقارير'), 'عدم ظهور نص (نظرة عامة والتقارير) في تبويبات المحطة');
  assert(!stationHtml.includes("setStationSubTab('overview')"), 'عدم وجود استدعاء التبويب الفرعي setStationSubTab(\'overview\')');

  console.log('\n--- 2. التحقق من توفر التبويبات المعتمدة للمحطة الإنتاجية ---');
  assert(stationHtml.includes('الكوادر العاملة'), 'توفر تبويب الكوادر العاملة في المحطة');
  assert(stationHtml.includes('البريد'), 'توفر تبويب البريد في المحطة');
  assert(stationHtml.includes('الموقف الفني'), 'توفر تبويب الموقف الفني في المحطة');
  assert(stationHtml.includes('الوثائق والمستندات'), 'توفر تبويب الوثائق والمستندات في المحطة');
  assert(stationHtml.includes('البيانات الفنية والتشغيل'), 'توفر تبويب البيانات الفنية والتشغيل في المحطة');

  console.log('\n--- 3. التحقق من التراجع التلقائي عند تعيين subTab إلى overview ---');
  global.window.app.currentStationSubTab = 'overview';
  const fallbackHtml = global.window.renderStationWorkspaceView('st-101');
  assert(fallbackHtml.includes('active') && fallbackHtml.includes('الكوادر العاملة'), 'التراجع التلقائي وتفعيل تبويب الكوادر العاملة عند محاولة طلب overview');

  console.log('\n--- 4. التحقق من استقرار مساحات عمل المحطات التخصصية (المختبرات والعدادات) ---');
  const labStation = (global.store.getDb().stations || []).find(s => s.sectionId === 'sec-3') || { id: 'st-lab-1' };
  if (labStation && labStation.id) {
    const labHtml = global.window.renderStationWorkspaceView(labStation.id);
    assert(labHtml && labHtml.length > 50, 'عرض مساحة عمل مواقع المختبرات بنجاح تام وبدون أخطاء');
  }

  console.log('\n----------------------------------------------------------------------');
  console.log(`النتيجة الإجمالية: ${passCount} ناجح | ${failCount} راسب`);
  console.log('----------------------------------------------------------------------\n');

  if (failCount > 0) {
    process.exit(1);
  } else {
    console.log('🎉 جميع اختبارات إزالة تبويب (نظرة عامة والتقارير) نجحت بنسبة 100%!');
  }
}

runTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
