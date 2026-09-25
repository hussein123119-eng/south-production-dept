/* ==========================================================================
   اختبارات نظام الصادر والوارد المعتمد (العدد الصريح + التاريخ + الباركود)
   (Correspondence Tracking System - CTS Test Suite)
   ========================================================================== */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('======================================================================');
console.log('🧪 جناح اختبارات نظام الصادر والوارد وتتبع الكتب الرسمية (CTS)');
console.log('======================================================================\n');

// 1. محاكاة البيئة للمتصفح
const mockLocalStorage = {
  store: {},
  getItem(k) { return this.store[k] || null; },
  setItem(k, v) { this.store[k] = String(v); },
  removeItem(k) { delete this.store[k]; },
  clear() { this.store = {}; }
};

global.localStorage = mockLocalStorage;
global.sessionStorage = mockLocalStorage;
global.window = global;
global.location = { hostname: 'localhost', href: 'http://localhost:3000' };
global.alert = () => {};
global.confirm = () => true;

global.auth = {
  getCurrentUser() {
    return {
      id: 'user-alaa-dept-mgr',
      departmentId: 'dept-south-prod',
      fullName: 'علاء حسن عبادان',
      role: 'DEPT_MANAGER',
      jobTitle: 'رئيس مهندسين أقدم'
    };
  }
};
global.window.auth = global.auth;

// 2. تحميل المكتبات الأساسية
eval(fs.readFileSync(path.join(__dirname, 'store.js'), 'utf8'));
eval(fs.readFileSync(path.join(__dirname, 'utils/exporter.js'), 'utf8'));
eval(fs.readFileSync(path.join(__dirname, 'components/correspondence.js'), 'utf8'));
eval(fs.readFileSync(path.join(__dirname, 'components/sidebar.js'), 'utf8'));

let passCount = 0;
function pass(msg) {
  console.log(`  ✅ PASS: ${msg}`);
  passCount++;
}

try {
  console.log('--- 1. التحقق من تكامل قاعدة البيانات وسجلات الصادر والوارد ---');
  const store = global.window.store;
  const initialRecords = store.getCorrespondence('dept-south-prod');
  assert(Array.isArray(initialRecords), 'يجب أن يعيد getCorrespondence مصفوفة');
  assert(initialRecords.length >= 4, 'يجب توفر سجلات افتراضية معتمدة');
  pass(`تم تحميل سجلات الصادر والوارد الأولية بنجاح (${initialRecords.length} سجلات)`);

  const outwardList = store.getCorrespondence('dept-south-prod', { type: 'OUTWARD' });
  const inwardList = store.getCorrespondence('dept-south-prod', { type: 'INWARD' });
  assert(outwardList.length >= 2, 'يجب توفر سجلات صادر');
  assert(inwardList.length >= 2, 'يجب توفر سجلات وارد');
  pass(`فصل سجلات الصادر (${outwardList.length}) وسجلات الوارد (${inwardList.length}) سليم`);

  console.log('\n--- 2. التحقق من الثلاثي القانوني المعتمد (العدد + التاريخ + الباركود) ---');
  outwardList.forEach(item => {
    assert(item.docNumber && item.docNumber.includes('ق.ج/ص/'), `العدد الصريح المقروء غير صالح: ${item.docNumber}`);
    assert(item.docDate && item.docDate.match(/^\d{4}-\d{2}-\d{2}$/), `التاريخ الرسمي غير صالح: ${item.docDate}`);
    assert(item.barcodeValue && item.barcodeValue.startsWith('SPD-OUT-'), `رمز الباركود غير صالح: ${item.barcodeValue}`);
    assert(item.verificationHash && item.verificationHash.startsWith('VFY-'), `رمز التحقق غير صالح: ${item.verificationHash}`);
  });
  pass('كافة سجلات الصادر تتضمن الثلاثي القانوني المعتمد (العدد الصريح + التاريخ الكامل + الباركود)');

  inwardList.forEach(item => {
    assert(item.docNumber && item.docNumber.includes('ق.ج/و/'), `رقم الوارد غير صالح: ${item.docNumber}`);
    assert(item.externalDocNumber, 'يجب توفر رقم كتاب الجهة الأصلي للوارد');
    assert(item.docDate, 'يجب توفر تاريخ تسجيل الوارد');
    assert(item.barcodeValue && item.barcodeValue.startsWith('SPD-IN-'), `رمز باركود الوارد غير صالح: ${item.barcodeValue}`);
  });
  pass('كافة سجلات الوارد تتضمن رقم قيد الوارد ورقم كتاب الجهة الأصلي والباركود');

  console.log('\n--- 3. التحقق من التوليد التسلسلي الذكي للأعداد الرسمية ---');
  const nextOutward = store.getNextCorrespondenceNumber('OUTWARD');
  assert(nextOutward.startsWith(`ق.ج/ص/${new Date().getFullYear()}/`), `التسلسل الصادر غير مطابق: ${nextOutward}`);
  pass(`توليد العدد الصادر التسلسلي القادم بنجاح: ${nextOutward}`);

  const nextInward = store.getNextCorrespondenceNumber('INWARD');
  assert(nextInward.startsWith(`ق.ج/و/${new Date().getFullYear()}/`), `التسلسل الوارد غير مطابق: ${nextInward}`);
  pass(`توليد العدد الوارد التسلسلي القادم بنجاح: ${nextInward}`);

  console.log('\n--- 4. قيد وتصدير كتاب صادر جديد وتسجيل كتاب وارد ---');
  const user = global.window.auth.getCurrentUser();
  const newOut = store.addCorrespondence({
    type: 'OUTWARD',
    subject: 'فحص خط أنابيب النفط الخام الرابط بين محطة DS-3 والرميلة الجنوبية',
    recipientDept: 'شعبة خطوط الأنابيب / هيأة العمليات',
    priority: 'HIGH',
    category: 'OFFICIAL_LETTER',
    content: 'يرجى التفضل بإجراء الكشف الميداني العاجل على المقطع km 14.'
  }, user);

  assert(newOut.id && newOut.docNumber, 'يجب إنشاء المعاملة الصادرة وتعيين العدد');
  assert(newOut.barcodeValue && newOut.verificationHash, 'يجب توليد الباركود ورمز التحقق تلقائياً');
  pass(`تم قيد الكتاب الصادر الجديد بنجاح برقم: ${newOut.docNumber}`);

  const newIn = store.addCorrespondence({
    type: 'INWARD',
    externalDocNumber: 'هـ.ت.ر/ع/9981',
    externalDocDate: '2026-09-24',
    senderDept: 'هيأة تشغيل الرميلة / قسم العمليات المركزية',
    subject: 'تزويدنا بموقف الغاز المصاحب الأسبوعي',
    executiveRouting: 'شعبة عزل الغاز / للمتابعة وتجهيز البيانات فوراً',
    priority: 'URGENT'
  }, user);

  assert(newIn.docNumber.includes('ق.ج/و/'), 'يجب تعيين رقم قيد الوارد');
  assert(newIn.executiveRouting, 'يجب حفظ الإحالة والتوجيه الإداري');
  pass(`تم تسجيل الكتاب الوارد الجديد بنجاح برقم الوارد: ${newIn.docNumber}`);

  console.log('\n--- 5. التحقق من محقق صحة الصدور والباركود (Live Verifier) ---');
  const verifyByNumber = store.verifyCorrespondence(newOut.docNumber);
  assert(verifyByNumber.verified === true, 'يجب التحقق بنجاح بالعدد الصريح');
  assert(verifyByNumber.item.subject === newOut.subject, 'يجب مطابقة بيانات المعاملة');
  pass(`نجح فحص صحة الصدور بالعدد الصريح: (${newOut.docNumber})`);

  const verifyByBarcode = store.verifyCorrespondence(newOut.barcodeValue);
  assert(verifyByBarcode.verified === true, 'يجب التحقق بنجاح برمز الباركود');
  pass(`نجح فحص صحة الصدور برمز الباركود: (${newOut.barcodeValue})`);

  const verifyByHash = store.verifyCorrespondence(newOut.verificationHash);
  assert(verifyByHash.verified === true, 'يجب التحقق بنجاح برمز التحقق الرقمي: ' + newOut.verificationHash);
  pass(`نجح فحص صحة الصدور بهاش التحقق الرقمي`);

  const fakeVerify = store.verifyCorrespondence('ق.ج/ص/2026/999999');
  assert(fakeVerify.verified === false, 'يجب رفض الرقم المزيف أو غير المسجل');
  pass('تم رفض الأرقام غير المقيدة وإصدار تنبيه أمني بنجاح');

  console.log('\n--- 6. التحقق من محرك التصدير والترويسة الوزارية الرسمية (Exporter Trio) ---');
  const exporter = global.window.exporter;
  const barcodeSvg = exporter.generateBarcodeSvg('ق.ج/ص/2026/101', 180, 42);
  assert(barcodeSvg.includes('<svg') && barcodeSvg.includes('<rect') && barcodeSvg.includes('ق.ج/ص/2026/101'), 'الباركود المتجهي غير سليم');
  pass('توليد باركود المتجه الصافي SVG نقي وبدقة عالية مع كتابة العدد تحته');

  const qrSvg = exporter.generateQrCodeSvg('ق.ج/ص/2026/101', 54);
  assert(qrSvg.includes('<svg') && qrSvg.includes('<rect'), 'رمز الـ QR غير سليم');
  pass('توليد رمز التحقق المتجهي SVG بنجاح');

  const officialHeader = exporter.renderOfficialHeader({
    docNumber: 'ق.ج/ص/2026/101',
    docDate: '25 أيلول 2026',
    sectionName: 'شعبة العمليات'
  });
  assert(officialHeader.includes('جمهورية العراق - وزارة النفط'), 'الترويسة تفتقر لاسم الوزارة');
  assert(officialHeader.includes('شركة نفط البصرة'), 'الترويسة تفتقر لاسم الشركة');
  assert(officialHeader.includes('قسم الإنتاج الجنوبي'), 'الترويسة تفتقر لاسم القسم');
  assert(officialHeader.includes('العدد:'), 'الترويسة تفتقر لكلمة العدد');
  assert(officialHeader.includes('التاريخ:'), 'الترويسة تفتقر لكلمة التاريخ');
  assert(officialHeader.includes('<svg'), 'الترويسة تفتقر للباركود المتجهي المدمج');
  pass('الترويسة الوزارية الرسمية تطبق الثلاثي المعتمد (العدد الصريح + التاريخ الكامل + الباركود)');

  console.log('\n--- 7. التحقق من واجهة المستخدم والشريط الجانبي (UI & Sidebar) ---');
  const sidebarHtml = renderSidebar('correspondence');
  assert(sidebarHtml.includes('الصادر والوارد'), 'الشريط الجانبي يفتقر لرابط الصادر والوارد');
  assert(sidebarHtml.includes("window.app.navigate('correspondence')"), 'الرابط لا يوجه لوجهة المراسلات');
  assert(!sidebarHtml.includes('سيادي'), 'يجب خلو الشريط الجانبي من كلمة سيادي');
  assert(!sidebarHtml.includes('عليا'), 'يجب خلو الشريط الجانبي من كلمة عليا');
  pass('الشريط الجانبي يتضمن الصادر والوارد وخالٍ تماماً من الكلمات المحظورة');

  const viewHtml = renderCorrespondenceView();
  assert(viewHtml.includes('نظام الصادر والوارد وقيد المعاملات'), 'الواجهة تفتقر للعنوان الرئيسي');
  assert(viewHtml.includes('سجل الصادر'), 'الواجهة تفتقر لتبويب سجل الصادر');
  assert(viewHtml.includes('سجل الوارد'), 'الواجهة تفتقر لتبويب سجل الوارد');
  assert(viewHtml.includes('محقق صحة الصدور والباركود'), 'الواجهة تفتقر لمحقق صحة الصدور');
  assert(!viewHtml.includes('سيادي'), 'واجهة المراسلات خالية من كلمة سيادي');
  assert(!viewHtml.includes('عليا'), 'واجهة المراسلات خالية من كلمة عليا');
  pass('واجهة المراسلات تتضمن كافة السجلات والأدوات الفورية ومتوافقة بالكامل');

  console.log('----------------------------------------------------------------------');
  console.log(`🎉 نجحت جميع اختبارات نظام الصادر والوارد المعتمد بنسبة 100%! (${passCount} اختبار)`);
  console.log('----------------------------------------------------------------------');
  process.exit(0);
} catch (err) {
  console.error('\n❌ فشل أحد الاختبارات:');
  console.error(err.message);
  console.error(err.stack);
  process.exit(1);
}
