/**
 * ==============================================================================
 * Suite 36: Station Technical & Operational Profile Engine Tests
 * فحص منظومة المواصفات والبيانات الفنية والتشغيلية الشاملة لمحطات الإنتاج
 * ==============================================================================
 */

const fs = require('fs');
const path = require('path');

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passedTests++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    process.exitCode = 1;
  }
}

console.log('======================================================================');
console.log('🧪 جناح اختبارات 36: منظومة البيانات الفنية والتشغيلية لمحطات الإنتاج');
console.log('======================================================================\n');

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
  },
  body: {
    insertAdjacentHTML: (pos, html) => {},
    classList: {
      add: () => {},
      remove: () => {},
      contains: () => false,
      toggle: () => {}
    }
  },
  addEventListener: () => {},
  removeEventListener: () => {},
  getElementById: (id) => ({
    id,
    innerHTML: '',
    className: '',
    value: '',
    style: {},
    appendChild: () => {},
    remove: () => {},
    focus: () => {}
  }),
  querySelectorAll: () => [],
  createElement: (tag) => ({
    id: '',
    className: '',
    innerHTML: '',
    style: {},
    appendChild: () => {},
    remove: () => {}
  })
};

global.alert = (msg) => {};

// 2. تحميل ملفات النظام الأساسية
const storePath = path.join(__dirname, 'store.js');
const rbacPath = path.join(__dirname, 'rbac.js');
const authPath = path.join(__dirname, 'auth.js');
const stationWorkspacePath = path.join(__dirname, 'components', 'station_workspace.js');
const appPath = path.join(__dirname, 'app.js');

assert(fs.existsSync(storePath), 'ملف store.js متوفر بنجاح');
assert(fs.existsSync(stationWorkspacePath), 'ملف components/station_workspace.js متوفر بنجاح');
assert(fs.existsSync(appPath), 'ملف app.js متوفر بنجاح');

// تحميل المحتويات في النطاق العام
const storeCode = fs.readFileSync(storePath, 'utf8');
eval(storeCode);

if (fs.existsSync(rbacPath)) {
  eval(fs.readFileSync(rbacPath, 'utf8'));
}
if (fs.existsSync(authPath)) {
  eval(fs.readFileSync(authPath, 'utf8'));
}

const workspaceCode = fs.readFileSync(stationWorkspacePath, 'utf8');
eval(workspaceCode);

const appCode = fs.readFileSync(appPath, 'utf8');
eval(appCode);

console.log('\n--- 1. التحقق من دوال Store الخاصة بالملف الفني والتشغيلي ---');
assert(typeof window.store.getDefaultStationTechnicalProfile === 'function', 'دالة getDefaultStationTechnicalProfile متوفرة في Store');
assert(typeof window.store.getStationTechnicalProfile === 'function', 'دالة getStationTechnicalProfile متوفرة في Store');
assert(typeof window.store.updateStationTechnicalProfile === 'function', 'دالة updateStationTechnicalProfile متوفرة في Store');

// فحص البيانات الافتراضية
const defaultProfile = window.store.getDefaultStationTechnicalProfile({ id: 'st-101', name: 'محطة الشامية', capacity: '120,000 برميل/يوم' });
assert(defaultProfile && typeof defaultProfile === 'object', 'توليد الملف الفني الافتراضي كائن صحيح');
assert(defaultProfile.wells && typeof defaultProfile.wells.operating === 'number', 'تضمين بيانات الآبار العاملة الافتراضية');
assert(defaultProfile.wells.total === (defaultProfile.wells.operating + defaultProfile.wells.stopped), 'حساب إجمالي الآبار الافتراضية بدقة');
assert(defaultProfile.manifolds && typeof defaultProfile.manifolds.count === 'number', 'تضمين عداد الدمامات (Manifolds) الافتراضي');
assert(defaultProfile.banks && Array.isArray(defaultProfile.banks.banksList), 'تضمين قائمة تفاصيل الضفاف الافتراضية');
assert(defaultProfile.rotatingEquipment && defaultProfile.rotatingEquipment.mainPumps, 'تضمين مواصفات مضخات المين بم الافتراضية');
assert(defaultProfile.rotatingEquipment.boosterPumps, 'تضمين مواصفات مضخات البوسترات الافتراضية');
assert(defaultProfile.rotatingEquipment.turbines, 'تضمين مواصفات التوربينات الافتراضية');
assert(defaultProfile.controlSystem && defaultProfile.controlSystem.type === 'FULL_DCS', 'تضمين حالة منظومة السيطرة DCS الافتراضية');
assert(defaultProfile.salts && defaultProfile.salts.mainLineSalts, 'تضمين فحص أملاح MAIN LINE الافتراضي');
assert(defaultProfile.powerAndFuel && typeof defaultProfile.powerAndFuel.fuelPercentage === 'number', 'تضمين نسبة خزين الكاز (وقود الديزل) الافتراضية');
assert(defaultProfile.compressors && defaultProfile.compressors.dieselBackupStatus, 'تضمين موقف ضاغطة الديزل الاحتياطية الافتراضي');
assert(Array.isArray(defaultProfile.customFields) && defaultProfile.customFields.length > 0, 'تضمين الحقول الفنية المخصصة الافتراضية');

console.log('\n--- 2. التحقق من التحديث الدقيق للمواصفات والبيانات الفنية الميدانية ---');
const actorUser = {
  id: 'user-st-mgr',
  fullName: 'مهندس التشغيل الموقعي',
  employeeId: 'EMP-7711',
  role: 'STATION_MANAGER',
  stationId: 'st-101',
  departmentId: 'dept-south-prod'
};

const updatePayload = {
  wells: {
    operating: 32,
    stopped: 4,
    notes: 'تم إعادة تشغيل بئرين بعد الاستصلاح والإنتاج مستقر.'
  },
  manifolds: {
    count: 5,
    gatheringHeaders: 4
  },
  banks: {
    count: 4,
    totalOilCapacity: '180,000 برميل/يوم',
    totalWaterCapacity: '50,000 برميل/يوم',
    totalGasCapacity: '85 مقمق/يوم',
    banksList: [
      { name: 'الضفة A', capacity: '45,000 برميل/يوم', salts: '22 PTB' },
      { name: 'الضفة B', capacity: '45,000 برميل/يوم', salts: '24 PTB' },
      { name: 'الضفة C', capacity: '45,000 برميل/يوم', salts: '26 PTB' },
      { name: 'الضفة D (جديدة)', capacity: '45,000 برميل/يوم', salts: '23 PTB' }
    ]
  },
  rotatingEquipment: {
    mainPumps: '5 مضخات طرد مركزي (4 عاملة + 1 احتياط ساخن)',
    boosterPumps: '4 مضخات بوستر (3 عاملة + 1 احتياط)',
    turbines: '3 توربينات غازية عالية الكفاءة'
  },
  controlSystem: {
    type: 'FULL_DCS',
    coverageDescription: 'نظام إيمرسون دلتا في متكامل ومربوط بغرفة العمليات المركزية.'
  },
  salts: {
    mainLineSalts: '24.2 PTB',
    banksAverage: '23.8 PTB',
    bsw: '0.08 %',
    notes: 'جميع العينات ضمن الحدود القياسية المسموحة للتصدير.'
  },
  powerAndFuel: {
    dieselGenerators: '4 مولدات بقدرة 2000 KVA',
    fuelPercentage: 92,
    fuelStatusText: 'خزين الكاز ممتلئ بنسبة 92% ويكفي 21 يوماً تشغيلياً.'
  },
  compressors: {
    totalCount: 5,
    operatingCount: 4,
    dieselBackupStatus: 'ضاغطة الديزل الاحتياطية مفحوصة وجاهزة بنسبة 100% بنظام الإقلاع التلقائي.'
  },
  customFields: [
    { id: 'cf-test-1', label: 'وحدة تجفيف الغاز الطبيعي (TEG)', value: 'وحدتان عاملتان', unit: 'نقطة الندى -15 مئوي' },
    { id: 'cf-test-2', label: 'منظومة الحماية الكاثودية للخطوط', value: 'تعمل بكفاءة 98%', unit: 'جهد الحماية -1.15 فولت' }
  ]
};

const updatedProfile = window.store.updateStationTechnicalProfile('st-101', updatePayload, actorUser);
assert(updatedProfile.wells.operating === 32, 'تحديث عدد الآبار العاملة بنجاح إلى 32');
assert(updatedProfile.wells.stopped === 4, 'تحديث عدد الآبار المتوقفة بنجاح إلى 4');
assert(updatedProfile.wells.total === 36, 'احتساب إجمالي الآبار تلقائياً إلى 36 بئر بدقة');
assert(updatedProfile.manifolds.count === 5, 'تحديث عدد الدمامات بنجاح إلى 5');
assert(updatedProfile.manifolds.gatheringHeaders === 4, 'تحديث عدد مجمعات الآبار بنجاح إلى 4');
assert(updatedProfile.banks.count === 4, 'تحديث عدد الضفاف إلى 4');
assert(updatedProfile.banks.banksList.length === 4, 'حفظ قائمة الضفاف الأربعة بدقة');
assert(updatedProfile.salts.mainLineSalts === '24.2 PTB', 'تحديث أملاح خط التصدير الرئيسي MAIN LINE بنجاح');
assert(updatedProfile.powerAndFuel.fuelPercentage === 92, 'تحديث نسبة خزين الكاز إلى 92%');
assert(updatedProfile.compressors.operatingCount === 4, 'تحديث عدد الضاغطات العاملة إلى 4');
assert(updatedProfile.compressors.dieselBackupStatus.includes('الإقلاع التلقائي'), 'تحديث موقف ضاغطة الديزل الاحتياطية بنجاح');
assert(updatedProfile.customFields.length === 2, 'إضافة وحفظ المعايير الفنية المخصصة الجديدة بنجاح');
assert(updatedProfile.customFields[0].label === 'وحدة تجفيف الغاز الطبيعي (TEG)', 'حفظ عنوان المعيار المخصص الأول بدقة');
assert(updatedProfile.updatedByName === 'مهندس التشغيل الموقعي', 'توثيق اسم المسؤول الذي قام بآخر تحديث');

// التحقق من استرجاع الملف المحفوظ
const reloadedProfile = window.store.getStationTechnicalProfile('st-101');
assert(reloadedProfile.wells.total === 36, 'استرجاع الملف الفني المحفوظ بدقة من مخزن البيانات');
assert(reloadedProfile.customFields[1].unit === 'جهد الحماية -1.15 فولت', 'استرجاع وحدات وتفاصيل المعايير المخصصة بدقة');

console.log('\n--- 3. التحقق من دالة العرض renderStationTechnicalTab ---');
assert(typeof window.renderStationTechnicalTab === 'function', 'دالة renderStationTechnicalTab متوفرة ومعرفة في النطاق العام');

const mockStation = {
  id: 'st-101',
  code: 'ST-SHM',
  name: 'محطة الشامية الإنتاجية',
  capacity: '180,000 برميل/يوم',
  technicalProfile: reloadedProfile
};

const renderedHtml = window.renderStationTechnicalTab(mockStation, actorUser);
assert(typeof renderedHtml === 'string' && renderedHtml.length > 500, 'توليد واجهة HTML غنية وشاملة للمواصفات الفنية');
assert(renderedHtml.includes('32') && renderedHtml.includes('الآبار العاملة'), 'عرض عداد الآبار العاملة (32) في الواجهة');
assert(renderedHtml.includes('الآبار المتوقفة'), 'عرض قطاع الآبار المتوقفة في الواجهة');
assert(renderedHtml.includes('36') && renderedHtml.includes('إجمالي الآبار'), 'عرض إجمالي الآبار (36) في الواجهة');
assert(renderedHtml.includes('عدد الدمامات'), 'عرض عداد الدمامات في الواجهة');
assert(renderedHtml.includes('مجمعات الآبار'), 'عرض مجمعات الآبار في الواجهة');
assert(renderedHtml.includes('الضفة D (جديدة)'), 'عرض تفاصيل الضفة المضافة حديثاً في جدول الضفاف');
assert(renderedHtml.includes('24.2 PTB') && renderedHtml.includes('MAIN LINE'), 'عرض فحص أملاح الخط الرئيسي MAIN LINE بوضوح');
assert(renderedHtml.includes('92%'), 'عرض نسبة خزين الكاز 92% في شريط مؤشر الوقود');
assert(renderedHtml.includes('ضاغطة الديزل الاحتياطية'), 'عرض موقف ضاغطة الديزل الاحتياطية في الواجهة');
assert(renderedHtml.includes('وحدة تجفيف الغاز الطبيعي'), 'عرض المعيار الفني المخصص الأول في بطاقات المعايير المخصصة');
assert(renderedHtml.includes('منظومة الحماية الكاثودية'), 'عرض المعيار الفني المخصص الثاني في بطاقات المعايير المخصصة');
assert(renderedHtml.includes('تحديث المواصفات الفنية') || renderedHtml.includes('openEditStationTechnicalModal'), 'توفر زر تحديث المواصفات الفنية للمسؤول');

console.log('\n--- 4. التحقق من دوال AppController الخاصة بالنافذة والمعايير المخصصة ---');
assert(typeof window.app.openEditStationTechnicalModal === 'function', 'دالة openEditStationTechnicalModal متوفرة في AppController');
assert(typeof window.app.closeEditStationTechnicalModal === 'function', 'دالة closeEditStationTechnicalModal متوفرة في AppController');
assert(typeof window.app.addBankDetailRow === 'function', 'دالة addBankDetailRow متوفرة في AppController');
assert(typeof window.app.removeBankDetailRow === 'function', 'دالة removeBankDetailRow متوفرة في AppController');
assert(typeof window.app.addCustomTechnicalFieldRow === 'function', 'دالة addCustomTechnicalFieldRow متوفرة في AppController');
assert(typeof window.app.removeCustomTechnicalFieldRow === 'function', 'دالة removeCustomTechnicalFieldRow متوفرة في AppController');
assert(typeof window.app.handleSaveStationTechnicalProfile === 'function', 'دالة handleSaveStationTechnicalProfile متوفرة في AppController');

console.log('\n--- 5. التحقق من كلاسات وتنسيقات CSS في style.css ---');
const stylePath = path.join(__dirname, '..', 'css', 'style.css');
const styleContent = fs.readFileSync(stylePath, 'utf8');
assert(styleContent.includes('.tech-modal-overlay'), 'توفر كلاس .tech-modal-overlay في style.css');
assert(styleContent.includes('.tech-bank-row'), 'توفر كلاس .tech-bank-row لصفوف الضفاف في style.css');
assert(styleContent.includes('.tech-custom-row'), 'توفر كلاس .tech-custom-row لصفوف المعايير المخصصة في style.css');
assert(styleContent.includes('[data-theme="light"] .tech-bank-row') || styleContent.includes('[data-theme="light"] .tech-custom-row'), 'توفر قواعد المظهر الفاتح لصفوف المعايير الفنية');

console.log('\n----------------------------------------------------------------------');
console.log(`النتيجة الإجمالية: ${passedTests} ناجح | 0 راسب من أصل ${totalTests}`);
console.log('----------------------------------------------------------------------\n');

if (passedTests === totalTests && totalTests >= 35) {
  console.log('🎉 جميع اختبارات منظومة البيانات الفنية والتشغيلية الشاملة لمحطات الإنتاج نجحت بنسبة 100%!');
} else {
  console.error('❌ هناك اختبارات لم تكتمل بالشكل المطلوب.');
  process.exit(1);
}
