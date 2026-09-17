/* ==========================================================================
   اختبارات حزمة الذاكرة وضغط الصور وتوسيع التخزين والنسخ الاحتياطي والعمل دون إنترنت
   Storage Expansion, Image Compression, Enterprise Backup & Offline Resilience Test Suite
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
const mockEventListeners = {};

global.localStorage = {
  getItem: (key) => (key in mockStorage ? mockStorage[key] : null),
  setItem: (key, val) => { mockStorage[key] = String(val); },
  removeItem: (key) => { delete mockStorage[key]; },
  clear: () => { Object.keys(mockStorage).forEach(k => delete mockStorage[k]); }
};

global.window = {
  location: { hostname: 'localhost', protocol: 'http:' },
  addEventListener: (event, handler) => {
    if (!mockEventListeners[event]) mockEventListeners[event] = [];
    mockEventListeners[event].push(handler);
  },
  dispatchEvent: (event) => {
    if (mockEventListeners[event.type]) {
      mockEventListeners[event.type].forEach(h => h(event));
    }
    return true;
  },
  CustomEvent: class CustomEvent {
    constructor(type, params) {
      this.type = type;
      this.detail = params ? params.detail : null;
    }
  }
};

global.document = {
  documentElement: {
    getAttribute: (attr) => (attr === 'data-theme' ? 'light' : null),
    setAttribute: () => {}
  },
  getElementById: (id) => null
};

global.navigator = {
  onLine: true,
  storage: {
    estimate: async () => ({ usage: 1024 * 1024 * 2, quota: 1024 * 1024 * 1024 })
  }
};

global.FileReader = class FileReader {
  readAsDataURL(blob) {
    setTimeout(() => {
      this.result = 'data:image/jpeg;base64,' + Buffer.from('mock_image_binary_data_12345').toString('base64');
      if (this.onload) this.onload({ target: { result: this.result } });
    }, 10);
  }
  readAsText(file) {
    setTimeout(() => {
      this.result = typeof file === 'string' ? file : JSON.stringify({ departments: [], users: [] });
      if (this.onload) this.onload({ target: { result: this.result } });
    }, 10);
  }
};

global.Blob = class Blob {
  constructor(parts, options) {
    this.parts = parts;
    this.type = options && options.type;
  }
};

global.URL = {
  createObjectURL: (blob) => 'blob:http://localhost/mock-blob-url',
  revokeObjectURL: () => {}
};

console.log('======================================================================');
console.log('🧪 اختبارات الذاكرة الفائقة وضغط الصور والنسخ الاحتياطي والعمل دون إنترنت');
console.log('======================================================================\n');

// 2. تحميل ملفات المحرك والخدمات
const imageCompressorCode = fs.readFileSync(path.join(__dirname, 'services', 'image_compressor.js'), 'utf8');
eval(imageCompressorCode);

const indexedDbCode = fs.readFileSync(path.join(__dirname, 'services', 'indexed_db_store.js'), 'utf8');
eval(indexedDbCode);

const offlineSyncCode = fs.readFileSync(path.join(__dirname, 'services', 'offline_sync.js'), 'utf8');
eval(offlineSyncCode);

const storeCode = fs.readFileSync(path.join(__dirname, 'store.js'), 'utf8');
eval(storeCode);
global.store = global.window.store;
const storeInstance = global.store;

async function runAllTests() {
  console.log('--- 1. التحقق من محرك ضغط الصور الذكي (Smart Image Compressor) ---');
  assert(typeof global.ImageCompressor !== 'undefined', 'محرك ضغط الصور ImageCompressor متوفر ومعرف عالمياً');
  assert(global.ImageCompressor.isImage('photo.jpg') === true, 'التعرف على صيغة JPG كصورة');
  assert(global.ImageCompressor.isImage('scan.png') === true, 'التعرف على صيغة PNG كصورة');
  assert(global.ImageCompressor.isImage('doc.webp') === true, 'التعرف على صيغة WebP كصورة');
  assert(global.ImageCompressor.isImage('letter.pdf') === false, 'التعرف على ملف PDF كملف مستند وليس صورة');
  assert(global.ImageCompressor.isImage('sheet.xlsx') === false, 'التعرف على ملف Excel كملف بيانات وليس صورة');

  const formatted1 = global.ImageCompressor.formatBytes(1024);
  assert(formatted1 === '1 KB', 'تنسيق الحجم 1024 بايت إلى 1 KB بدقة');
  const formatted2 = global.ImageCompressor.formatBytes(1024 * 1024 * 3.5);
  assert(formatted2 === '3.5 MB', 'تنسيق الحجم إلى 3.5 MB بدقة');

  const testDataUrl = 'data:image/jpeg;base64,' + Buffer.from('mock_test_image_binary_payload_for_compression_testing_abc').toString('base64');
  const byteLen = global.ImageCompressor.getDataUrlByteLength(testDataUrl);
  assert(byteLen > 0, `حساب حجم الـ DataURL بالبايت بدقة (${byteLen} بايت)`);

  const compRes = await global.ImageCompressor.compress(testDataUrl);
  assert(compRes && compRes.dataUrl && compRes.isImage === true, 'تنفيذ ضغط الصورة بنجاح واسترجاع بيانات الـ DataURL المحسنة');

  const nonImgRes = await global.ImageCompressor.compress('data:application/pdf;base64,mockpdfdata');
  assert(nonImgRes && nonImgRes.isImage === false, 'تمرير ملفات المستندات غير الصور بدون تشويه');

  console.log('\n--- 2. التحقق من محرك التخزين الموسع وإحصائيات الذاكرة (Storage Expansion Engine) ---');
  assert(typeof global.SPDIndexedDB !== 'undefined', 'محرك التخزين الموسع SPDIndexedDB متوفر ومعرف');
  assert(typeof global.store.getStorageStats === 'function', 'دالة getStorageStats متوفرة في مدير قاعدة البيانات');

  const stats = global.store.getStorageStats();
  assert(stats && typeof stats.localStorageKB === 'string', `حساب الحجم التخزيني المستهلك (${stats.localStorageKB} KB)`);
  assert(stats.totalRecords > 0, `إحصاء إجمالي السجلات والبيانات المحفوظة (${stats.totalRecords} سجل)`);
  assert(stats.counts && stats.counts.departments > 0, 'تضمين إحصائيات الأقسام في تقرير الذاكرة');
  assert(stats.counts && stats.counts.users > 0, 'تضمين إحصائيات المستخدمين في تقرير الذاكرة');
  assert(stats.counts && stats.counts.technicalStatus >= 0, 'تضمين إحصائيات الموقف الفني في تقرير الذاكرة');

  console.log('\n--- 3. التحقق من محرك النسخ الاحتياطي الشامل والاستعادة (Enterprise Backup & Restore) ---');
  assert(typeof global.store.exportBackupJSON === 'function', 'دالة exportBackupJSON متوفرة لتصدير قاعدة البيانات بالكامل');
  assert(typeof global.store.validateBackup === 'function', 'دالة validateBackup متوفرة للتحقق من سلامة وبنية ملف النسخة الاحتياطية');
  assert(typeof global.store.importBackupJSON === 'function', 'دالة importBackupJSON متوفرة لاستعادة وتحديث البيانات الشاملة');

  const backupJsonStr = global.store.exportBackupJSON({ exportedBy: 'المؤسس العام' });
  assert(typeof backupJsonStr === 'string' && backupJsonStr.length > 50, 'توليد ملف النسخة الاحتياطية بصيغة JSON متكاملة');

  const parsedBackup = JSON.parse(backupJsonStr);
  assert(parsedBackup.schema === 'SPD_ENTERPRISE_BACKUP_V3', 'مطابقة Schema النسخة الاحتياطية للإصدار المعتمد V3');
  assert(parsedBackup.version === '3.0.0', 'مطابقة رقم الإصدار المعتمد 3.0.0');
  assert(parsedBackup.checksum && parsedBackup.checksum.startsWith('CHK-'), `توليد البصمة الرقمية للنسخة الاحتياطية (${parsedBackup.checksum})`);
  assert(parsedBackup.stats && parsedBackup.stats.usersCount > 0, 'تضمين إحصائيات الجداول والمستخدمين في رأس النسخة الاحتياطية');

  // اختبار التحقق من النسخة الاحتياطية
  const valResult = global.store.validateBackup(backupJsonStr);
  assert(valResult.valid === true, 'التحقق بنجاح من صحة النسخة الاحتياطية الصالحة');
  assert(valResult.stats && valResult.stats.usersCount > 0, 'استخراج إحصائيات البيانات من النسخة التي تم فحصها');

  const invalidVal = global.store.validateBackup('{"invalid": true}');
  assert(invalidVal.valid === false && invalidVal.error.includes('departments'), 'رفض ملف النسخة الاحتياطية الناقص أو غير المطابق للمواصفات');

  // اختبار استعادة النسخة الاحتياطية
  const restoreRes = global.store.importBackupJSON(backupJsonStr, {
    id: 'user-founder',
    departmentId: 'dept-south-prod',
    employeeId: 'EMP-0000',
    fullName: 'المؤسس العام'
  });
  assert(restoreRes.success === true, 'تنفيذ استعادة قاعدة البيانات الشاملة بنجاح بنسبة 100%');
  assert(restoreRes.stats && restoreRes.stats.usersCount > 0, 'تأكيد عدد السجلات المستعادة في النتيجة');

  console.log('\n--- 4. التحقق من محرك العمل دون إنترنت والمزامنة التلقائية (Offline-First Resilience) ---');
  assert(typeof global.SPDOfflineSync !== 'undefined', 'محرك العمل دون إنترنت SPDOfflineSync متوفر');
  assert(typeof global.store.isOnline === 'function', 'دالة فحص حالة الاتصال store.isOnline متوفرة');
  assert(typeof global.store.getOfflineQueue === 'function', 'دالة جلب طابور العمليات دون إنترنت store.getOfflineQueue متوفرة');
  assert(typeof global.store.queueOfflineAction === 'function', 'دالة إضافة إجراء لطابور الأوفلاين store.queueOfflineAction متوفرة');
  assert(typeof global.store.flushOfflineQueue === 'function', 'دالة تفريغ ومعالجة طابور الأوفلاين store.flushOfflineQueue متوفرة');

  const queuedAct = global.store.queueOfflineAction({
    type: 'SYNC_TECHNICAL_STATUS',
    payload: { id: 'test-ts-off-1', status: 'OPERATIONAL' },
    userId: 'user-emp1',
    description: 'تحديث الموقف الفني في وضع الأوفلاين'
  });
  assert(queuedAct && queuedAct.id.startsWith('off-'), `إضافة الإجراء لطابور الأوفلاين برقم فريد (${queuedAct.id})`);

  const queueList = global.store.getOfflineQueue();
  assert(queueList.length >= 1, `استرجاع طابور العمليات المعلقة بنجاح (عدد العناصر: ${queueList.length})`);

  // تفريغ الطابور
  await global.store.flushOfflineQueue();
  assert(global.store.getOfflineQueue().length === 0, 'تفريغ طابور الأوفلاين بعد المزامنة التلقائية بنجاح');

  console.log('\n--- 5. التحقق من كود الواجهة والـ Topbar و App.js ---');
  const topbarCode = fs.readFileSync(path.join(__dirname, 'components', 'topbar.js'), 'utf8');
  assert(topbarCode.includes('topbar-network-pill'), 'توفر كبسولة حالة الشبكة topbar-network-pill في شريط التنقل العلوي');
  assert(topbarCode.includes('window.app.openNetworkStorageModal()'), 'ربط كبسولة الشبكة بنافذة إدارة الذاكرة والاتصال openNetworkStorageModal');

  const appCode = fs.readFileSync(path.join(__dirname, 'app.js'), 'utf8');
  assert(appCode.includes('openNetworkStorageModal()'), 'توفر دالة openNetworkStorageModal في app.js');
  assert(appCode.includes('triggerManualSync()'), 'توفر دالة المزامنة اليدوية triggerManualSync في app.js');
  assert(appCode.includes('exportDatabaseBackup()'), 'توفر دالة تصدير النسخة الاحتياطية exportDatabaseBackup في app.js');
  assert(appCode.includes('openRestoreDatabaseModal()'), 'توفر دالة استعادة النسخة الاحتياطية openRestoreDatabaseModal في app.js');
  assert(appCode.includes('handleRestoreDatabaseSubmit'), 'توفر معالج استعادة النسخة الاحتياطية handleRestoreDatabaseSubmit في app.js');
  assert(appCode.includes('initNetworkStatusListener()'), 'توفر مستمع حالة الشبكة الحي initNetworkStatusListener في app.js');

  const styleCode = fs.readFileSync(path.join(__dirname, '..', 'css', 'style.css'), 'utf8');
  assert(styleCode.includes('.topbar-network-pill'), 'توفر كلاسات التنسيق للكبسولة في style.css');
  assert(styleCode.includes('.net-status-dot.dot-green'), 'توفر تنسيق نقطة الاتصال الخضراء في style.css');
  assert(styleCode.includes('.net-status-dot.dot-amber'), 'توفر تنسيق نقطة الأوفلاين البرتقالية في style.css');

  console.log('\n----------------------------------------------------------------------');
  console.log(`النتيجة الإجمالية: ${passCount} ناجح | ${failCount} راسب`);
  console.log('----------------------------------------------------------------------\n');

  if (failCount > 0) {
    process.exit(1);
  } else {
    console.log('🎉 جميع اختبارات حزمة الذاكرة وضغط الصور والنسخ الاحتياطي والعمل دون إنترنت نجحت بنسبة 100%!');
  }
}

runAllTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
