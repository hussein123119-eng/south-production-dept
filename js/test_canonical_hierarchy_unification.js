/* ==========================================================================
   اختبارات توحيد الهيكل التنظيمي المعتمد (القسم، الإدارة، الوحدات، الشعب، والمحطات)
   ========================================================================== */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

// المحاكاة البيئية لمتصفح الويب
global.window = global;
global.localStorage = {
  _data: {},
  getItem(k) { return this._data[k] || null; },
  setItem(k, v) { this._data[k] = String(v); },
  removeItem(k) { delete this._data[k]; },
  clear() { this._data = {}; }
};

// تحميل مخزن البيانات
require('./store.js');

console.log('======================================================================');
console.log('🧪 جناح اختبارات توحيد الهيكل التنظيمي المعتمد في التطبيق وبوابة المؤسس');
console.log('======================================================================\n');

// --- 1. التحقق من دالة getHierarchy ومخزن البيانات store.js ---
console.log('--- 1. التحقق من دالة getHierarchy ومخزن البيانات store.js ---');
assert(typeof window.store.getHierarchy === 'function', 'دالة getHierarchy متوفرة في مخزن البيانات');

const hierarchy = window.store.getHierarchy('dept-south-prod');
assert(hierarchy.department && hierarchy.department.id === 'dept-south-prod', 'بيانات القسم صحيحة (SPD-01)');
assert(hierarchy.management && hierarchy.management.code === 'SPD-MGMT', 'بيانات إدارة القسم صحيحة (SPD-MGMT)');

// التحقق من الوحدات الثلاث التابعة للإدارة
assert.strictEqual(hierarchy.units.length, 3, 'عدد الوحدات التابعة للإدارة هو 3');
const unitTech = hierarchy.units.find(u => u.id === 'unit-1');
const unitTrn = hierarchy.units.find(u => u.id === 'unit-2');
const unitHlth = hierarchy.units.find(u => u.id === 'unit-3');
assert(unitTech && unitTech.code === 'UNIT-TECH' && unitTech.name.includes('الفنية'), 'الوحدة الفنية معتمدة برمزها');
assert(unitTrn && unitTrn.code === 'UNIT-TRN' && unitTrn.name.includes('التدريب'), 'وحدة التدريب والتطوير معتمدة برمزها');
assert(unitHlth && unitHlth.code === 'UNIT-HLTH' && unitHlth.name.includes('الضمان الصحي'), 'وحدة الضمان الصحي معتمدة برمزها');
console.log('  ✅ PASS: الوحدات الثلاث التابعة لإدارة القسم موحدة ومعتمدة بنجاح');

// التحقق من الشعب الأربع
assert.strictEqual(hierarchy.sections.length, 4, 'عدد الشُعب الرئيسية هو 4');
const sec1 = hierarchy.sections.find(s => s.id === 'sec-1');
const sec2 = hierarchy.sections.find(s => s.id === 'sec-2');
const sec3 = hierarchy.sections.find(s => s.id === 'sec-3');
const sec4 = hierarchy.sections.find(s => s.id === 'sec-4');
assert(sec1 && sec1.code === 'SEC-01' && sec1.name === 'الشعبة الأولى', 'الشعبة الأولى معتمدة برمز SEC-01');
assert(sec2 && sec2.code === 'SEC-02' && sec2.name === 'الشعبة الثانية', 'الشعبة الثانية معتمدة برمز SEC-02');
assert(sec3 && sec3.code === 'SEC-03' && sec3.name === 'شعبة المختبرات', 'شعبة المختبرات معتمدة برمز SEC-03');
assert(sec4 && sec4.code === 'SEC-04' && sec4.name === 'شعبة العدادات', 'شعبة العدادات معتمدة برمز SEC-04');
console.log('  ✅ PASS: الشعب الأربع الرئيسية موحدة ومعتمدة بنجاح');

// التحقق من المحطات الحقلية السبع المعتمدة
assert.strictEqual(hierarchy.fieldStations.length, 7, 'عدد المحطات الحقلية المعتمدة للشعبتين الأولى والثانية هو 7');
const expectedStationCodes = ['ST-CTR', 'ST-STH', 'ST-RTK', 'ST-SHM', 'ST-QRN', 'ST-MSH-SHM', 'ST-MSH-QRN'];
expectedStationCodes.forEach(code => {
  const found = hierarchy.fieldStations.find(s => s.code === code);
  assert(found, `المحطة الميدانية برمز ${code} موجودة في المحطات الحقلية المعتمدة`);
});
console.log('  ✅ PASS: المحطات الحقلية السبع معتمدة بكامل رموزها القياسية');

// --- 2. التحقق من دقة قاموس رموز المحطات getStationCode ---
console.log('\n--- 2. التحقق من دقة قاموس رموز المحطات getStationCode ---');
assert.strictEqual(window.store.getStationCode(null, 'المحطة المركزية'), 'ST-CTR', 'ترميز المحطة المركزية ST-CTR');
assert.strictEqual(window.store.getStationCode(null, 'المحطة الجنوبية'), 'ST-STH', 'ترميز المحطة الجنوبية ST-STH');
assert.strictEqual(window.store.getStationCode(null, 'محطة الرطكة'), 'ST-RTK', 'ترميز محطة الرطكة ST-RTK');
assert.strictEqual(window.store.getStationCode(null, 'محطة الشامية'), 'ST-SHM', 'ترميز محطة الشامية ST-SHM');
assert.strictEqual(window.store.getStationCode(null, 'محطة القرينات'), 'ST-QRN', 'ترميز محطة القرينات ST-QRN');
assert.strictEqual(window.store.getStationCode(null, 'محطة مشرف شامية'), 'ST-MSH-SHM', 'ترميز محطة مشرف شامية ST-MSH-SHM بأسبقية صحيحة');
assert.strictEqual(window.store.getStationCode(null, 'محطة مشرف قرينات'), 'ST-MSH-QRN', 'ترميز محطة مشرف قرينات ST-MSH-QRN بأسبقية صحيحة');
console.log('  ✅ PASS: قاموس ترميز المحطات يعيد الرموز الرسمية بدقة تامة دون تداخل');

// --- 3. التحقق من ملفات بوابة المؤسس founder.html والمرآة founder-public/founder.html ---
console.log('\n--- 3. التحقق من ملفات بوابة المؤسس والمرآة العامة ---');
const founderHtml = fs.readFileSync(path.join(__dirname, '..', 'founder.html'), 'utf8');
const publicFounderHtml = fs.readFileSync(path.join(__dirname, '..', 'founder-public', 'founder.html'), 'utf8');

// تطابق ملفي المؤسس 100%
assert.strictEqual(founderHtml, publicFounderHtml, 'ملف founder.html متطابق 100% مع founder-public/founder.html');

// خيارات تصفية الإضابير
assert(founderHtml.includes('id="dossierSectionFilter"'), 'توفر قائمة تصفية الإضابير dossierSectionFilter');
assert(founderHtml.includes('value="DEPT"'), 'توفر خيار إدارة القسم المركزية');
assert(founderHtml.includes('value="sec-1"') && founderHtml.includes('value="sec-4"'), 'توفر خيارات الشعب الأربع');
assert(founderHtml.includes('value="unit-1"') && founderHtml.includes('value="unit-3"'), 'توفر خيارات الوحدات الثلاث');
assert(founderHtml.includes('value="ST-CTR"') && founderHtml.includes('value="ST-MSH-QRN"'), 'توفر خيارات المحطات الحقلية السبع');
console.log('  ✅ PASS: قائمة تصفية الإضابير تتضمن التشكيلات الخمسة المعتمدة');

// حقول نافذة تعديل الإضبارة
assert(founderHtml.includes('id="editEmpSection"'), 'توفر حقل اختيار الشعبة والوحدة في نافذة التعديل');
assert(founderHtml.includes('id="editEmpStation"'), 'توفر حقل اختيار المحطة التابعة في نافذة التعديل');

// لوحة الهيكل التنظيمي المعتمدة
assert(founderHtml.includes('id="canonicalHierarchyPanel"'), 'توفر لوحة الهيكل التنظيمي المعتمد في بوابة المؤسس');
assert(founderHtml.includes('SPD-01') && founderHtml.includes('SPD-MGMT'), 'ظهور رموز القسم وإدارة القسم');
assert(founderHtml.includes('UNIT-TECH') && founderHtml.includes('UNIT-TRN') && founderHtml.includes('UNIT-HLTH'), 'ظهور رموز الوحدات');
assert(founderHtml.includes('SEC-01') && founderHtml.includes('SEC-04'), 'ظهور رموز الشعب');
assert(founderHtml.includes('DS-1') && founderHtml.includes('DS-7'), 'ظهور رموز المحطات الحقلية DS-1 إلى DS-7');
console.log('  ✅ PASS: لوحة الهيكل التنظيمي المعتمد مدمجة وتتضمن كافة التشكيلات');

// --- 4. التحقق من كود بوابة المؤسس founder_portal.js ---
console.log('\n--- 4. التحقق من كود بوابة المؤسس founder_portal.js ---');
const founderJs = fs.readFileSync(path.join(__dirname, 'founder_portal.js'), 'utf8');
const publicFounderJs = fs.readFileSync(path.join(__dirname, '..', 'founder-public', 'js', 'founder_portal.js'), 'utf8');

assert.strictEqual(founderJs, publicFounderJs, 'كود founder_portal.js متطابق 100% مع المرآة');
assert(founderJs.includes('dossierSectionFilter'), 'founder_portal.js يدعم dossierSectionFilter');
assert(founderJs.includes('onDossierSectionChange'), 'founder_portal.js يتضمن دالة onDossierSectionChange');
assert(founderJs.includes('المحطة المركزية (ST-CTR)'), 'استمارة الأمر الإداري للنقل تستخدم المحطات الرسمية');
assert(founderJs.includes('الشعبة الأولى (SEC-01)'), 'استمارة الأمر الإداري للنقل تستخدم الشعب الرسمية');
assert(!founderJs.includes('محطة إنتاج الرميلة 1'), 'تم استئصال الأسماء الوهمية من أوامر النقل');
console.log('  ✅ PASS: كود بوابة المؤسس خالٍ تماماً من الأسماء الوهمية ويعتمد الهيكل الموحد');

// --- 5. التحقق من لوحة الإدارة العليا super_admin.js ---
console.log('\n--- 5. التحقق من لوحة الإدارة العليا super_admin.js ---');
const superAdminJs = fs.readFileSync(path.join(__dirname, 'components', 'super_admin.js'), 'utf8');
assert(superAdminJs.includes('الهيكل التنظيمي والتشكيلات المعتمدة'), 'توفر لوحة الهيكل التنظيمي في super_admin.js');
assert(superAdminJs.includes('SPD-01') && superAdminJs.includes('SPD-MGMT'), 'توفر رموز القسم وإدارة القسم في super_admin.js');
assert(superAdminJs.includes('UNIT-TECH') && superAdminJs.includes('UNIT-HLTH'), 'توفر رموز الوحدات في super_admin.js');
assert(superAdminJs.includes('SEC-01') && superAdminJs.includes('SEC-04'), 'توفر رموز الشعب في super_admin.js');
assert(superAdminJs.includes('DS-1') && superAdminJs.includes('DS-7'), 'توفر رموز المحطات في super_admin.js');
console.log('  ✅ PASS: لوحة المؤسس الداخلية super_admin متطابقة مع بوابة المؤسس بالكامل');

// --- 6. التحقق من حاسبة المكافآت incentive_calculator.js ---
console.log('\n--- 6. التحقق من حاسبة المكافآت incentive_calculator.js ---');
const incentiveJs = fs.readFileSync(path.join(__dirname, 'components', 'incentive_calculator.js'), 'utf8');
assert(incentiveJs.includes("section: 'الشعبة الأولى'"), 'النموذج الافتراضي في حاسبة الحوافز يستخدم الشعبة الأولى');
assert(!incentiveJs.includes("شعبة الصيانة الميكانيكية"), 'تم إلغاء شعبة الصيانة الميكانيكية الوهمية من النماذج');
assert(!incentiveJs.includes("شعبة التطوير الفني"), 'تم استبدال شعبة التطوير الفني بالوحدة الفنية');
console.log('  ✅ PASS: حاسبة المكافآت والحوافز تستخدم الشعب والوحدات المعتمدة حصرياً');

console.log('----------------------------------------------------------------------');
console.log('🎉 نجحت جميع اختبارات توحيد الهيكل التنظيمي بنسبة 100%! (6 أقسام رئيسية)');
console.log('----------------------------------------------------------------------');
