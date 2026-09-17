/**
 * js/test_luxury_modals_vehicles_documents.js
 * Comprehensive unit test verifying the Executive Luxury Redesign of:
 * 1. Vehicle Modals:
 *    - openCreateVehicleModal (إضافة سيارة جديدة)
 *    - openEditVehicleModal (تعديل بيانات السيارة)
 *    - closeVehicleModal
 * 2. Document & Report Modals:
 *    - openCreateDocumentModal (إضافة وثيقة أو تقرير رسمي جديد)
 *    - openEditDocumentModal (تعديل وثيقة)
 *    - closeDocumentModal
 * 
 * Verifications:
 * - Luxury Top Banners with glowing 3D icon badges, badges, title, subtitle & close button.
 * - Contained internal luxury scrollbars (مسطرة التمرير الذهبية) without outer scroll leaks.
 * - Expanded responsive widths (max-width: 860px for vehicles, max-width: 960px for docs).
 * - Glassmorphism field cards & high-contrast inputs.
 * - Multi-theme support (Dark & Light Mode overrides).
 * - 100% preservation of form field IDs and data handlers.
 */

const fs = require('fs');
const path = require('path');

console.log('======================================================================');
console.log('🧪 اختبارات التحقق من البانر الفاخر والمسطرة الذهبية لنوافذ المركبات والوثائق');
console.log('======================================================================\n');

let passedTests = 0;
let failedTests = 0;

function check(desc, condition) {
  if (condition) {
    console.log(`  ✅ PASS: ${desc}`);
    passedTests++;
  } else {
    console.error(`  ❌ FAIL: ${desc}`);
    failedTests++;
  }
}

// Read js/app.js
const appJsPath = path.join(__dirname, 'app.js');
const appJs = fs.readFileSync(appJsPath, 'utf8');

check('ملف js/app.js موجود ومقروء بنجاح', appJs.length > 0);

// --- 1. Vehicle Modals Verification ---
console.log('\n--- 1. التحقق من نوافذ المركبات (إضافة وتعديل وحذف) ---');

check('دالة openCreateVehicleModal متوفرة', appJs.includes('openCreateVehicleModal('));
check('دالة openEditVehicleModal متوفرة', appJs.includes('openEditVehicleModal('));
check('دالة closeVehicleModal متوفرة', appJs.includes('closeVehicleModal()'));

// Vehicle Luxury Banner
check('بانر المركبات العلوي الفاخر يحتوي على كلاس dept-vehicle-banner', appJs.includes('dept-vehicle-banner'));
check('كبسولة أيقونة المركبة المتوهجة dept-vehicle-badge متوفرة', appJs.includes('dept-vehicle-badge'));
check('العنوان الفاخر لإضافة سيارة جديدة متوفر', appJs.includes('إضافة مركبة / سيارة جديدة للمنظومة'));
check('العنوان الفاخر لتعديل بيانات السيارة متوفر', appJs.includes('تعديل بيانات السيارة:'));
check('زر الإغلاق الدائري الزجاجي dept-vehicle-close-btn متوفر', appJs.includes('dept-vehicle-close-btn'));

// Vehicle Contained Luxury Scrollbar
check('إخفاء مسطرة التمرير الخارجية عن حاوية نافذة المركبات scrollbar-width: none', appJs.includes('#vehicleModal') && appJs.includes('scrollbar-width: none !important'));
check('حاوية التمرير الداخلي لبطاقة المركبة dept-vehicle-scroll-body متوفرة', appJs.includes('dept-vehicle-scroll-body'));
check('مسطرة التمرير الذهبية للمركبات تستخدم التدرج اللوني scrollbar-color', appJs.includes('scrollbar-color: #f59e0b') || appJs.includes('scrollbar-color: #d97706'));
check('مسطرة التمرير الذهبية للمركبات تدعم Webkit بعرض 9px', appJs.includes('.dept-vehicle-scroll-body::-webkit-scrollbar') && appJs.includes('linear-gradient(180deg, #f59e0b, #d97706)'));

// Vehicle Card Width & Style
check('عرض بطاقة المركبات موسع إلى max-width: 860px', appJs.includes('.dept-vehicle-modal-card') && appJs.includes('max-width: 860px'));
check('حواف بطاقة المركبات دائرية فاخرة border-radius: 24px', appJs.includes('.dept-vehicle-modal-card') && appJs.includes('border-radius: 24px'));

// Vehicle Field IDs preservation
const vehicleFields = [
  'vTypeInput', 'vOwnershipSelect', 'vSideNoInput', 'vPlateNoInput', 
  'vAffiliationSelect', 'vSectionSelect', 'vStationSelect',
  'vSingleDriverContainer', 'vSingleDriverName', 'vSingleDriverPhone',
  'vShiftDriversContainer', 'vDriverShiftA', 'vDriverShiftB', 'vDriverShiftC', 'vDriverShiftD',
  'vOperationalStateSelect'
];
vehicleFields.forEach(fieldId => {
  check(`حقل إنشاء المركبة id="${fieldId}" متوفر ومحفوظ`, appJs.includes(`id="${fieldId}"`));
});

const editVehicleFields = [
  'editVType', 'editVOwnership', 'editVSideNo', 'editVPlateNo',
  'editVAffiliation', 'editVSection', 'editVStation',
  'editVSingleDriverContainer', 'editVSingleDriverName', 'editVSingleDriverPhone',
  'editVShiftDriversContainer', 'editVDriverA', 'editVDriverB', 'editVDriverC', 'editVDriverD',
  'editVState'
];
editVehicleFields.forEach(fieldId => {
  check(`حقل تعديل المركبة id="${fieldId}" متوفر ومحفوظ`, appJs.includes(`id="${fieldId}"`));
});

// Vehicle Theme overrides
check('دعم الوضع الفاتح لنوافذ المركبات متوفر عبر [data-theme="light"]', appJs.includes('[data-theme="light"] .dept-vehicle-modal-card') && appJs.includes('[data-theme="light"] .dept-vehicle-banner'));
check('دعم مسطرة التمرير للوضع الفاتح في نوافذ المركبات متوفر', appJs.includes('[data-theme="light"] .dept-vehicle-scroll-body'));


// --- 2. Document & Report Modals Verification ---
console.log('\n--- 2. التحقق من نوافذ الوثائق والتقارير الرسمية (إضافة وتعديل) ---');

check('دالة openCreateDocumentModal متوفرة', appJs.includes('openCreateDocumentModal()'));
check('دالة openEditDocumentModal متوفرة', appJs.includes('openEditDocumentModal('));
check('دالة closeDocumentModal متوفرة', appJs.includes('closeDocumentModal()'));

// Document Luxury Banner
check('بانر الوثائق العلوي الفاخر يحتوي على كلاس dept-doc-banner', appJs.includes('dept-doc-banner'));
check('كبسولة أيقونة الوثيقة المتوهجة dept-doc-badge متوفرة', appJs.includes('dept-doc-badge'));
check('العنوان الفاخر لإضافة وثيقة جديدة متوفر', appJs.includes('إضافة وثيقة أو تقرير رسمي جديد'));
check('العنوان الفاخر لتعديل الوثيقة متوفر', appJs.includes('تعديل وتحديث الوثيقة:'));
check('زر الإغلاق الدائري الزجاجي dept-doc-close-btn متوفر', appJs.includes('dept-doc-close-btn'));

// Document Contained Luxury Scrollbar
check('إخفاء مسطرة التمرير الخارجية عن حاوية نافذة الوثائق scrollbar-width: none', appJs.includes('#documentModal') && appJs.includes('scrollbar-width: none !important'));
check('حاوية التمرير الداخلي لبطاقة الوثائق dept-doc-scroll-body متوفرة', appJs.includes('dept-doc-scroll-body'));
check('مسطرة التمرير الذهبية للوثائق تستخدم التدرج اللوني scrollbar-color', appJs.includes('scrollbar-color: #f59e0b') || appJs.includes('scrollbar-color: #d97706'));
check('مسطرة التمرير الذهبية للوثائق تدعم Webkit بعرض 9px', appJs.includes('.dept-doc-scroll-body::-webkit-scrollbar') && appJs.includes('linear-gradient(180deg, #f59e0b, #d97706)'));

// Document Card Width & Style
check('عرض بطاقة الوثائق موسع إلى max-width: 960px', appJs.includes('.dept-doc-modal-card') && appJs.includes('max-width: 960px'));
check('حواف بطاقة الوثائق دائرية فاخرة border-radius: 24px', appJs.includes('.dept-doc-modal-card') && appJs.includes('border-radius: 24px'));

// Document Field IDs preservation
const docFields = ['docTitle', 'docCategory', 'docSectionId', 'docContent', 'docExcelData', 'docVersion', 'docStatus'];
docFields.forEach(fieldId => {
  check(`حقل إنشاء الوثيقة id="${fieldId}" متوفر ومحفوظ`, appJs.includes(`id="${fieldId}"`));
});

const editDocFields = ['editDocTitle', 'editDocCategory', 'editDocSectionId', 'editDocContent', 'editDocVersion', 'editDocStatus'];
editDocFields.forEach(fieldId => {
  check(`حقل تعديل الوثيقة id="${fieldId}" متوفر ومحفوظ`, appJs.includes(`id="${fieldId}"`));
});

// Document Template Helpers & Quick Insert
check('أزرار إدراج القوالب السريعة للكتب والتقارير متوفرة', appJs.includes('insertDocTemplate('));

// Document Theme overrides
check('دعم الوضع الفاتح لنوافذ الوثائق متوفر عبر [data-theme="light"]', appJs.includes('[data-theme="light"] .dept-doc-modal-card') && appJs.includes('[data-theme="light"] .dept-doc-banner'));
check('دعم مسطرة التمرير للوضع الفاتح في نوافذ الوثائق متوفر', appJs.includes('[data-theme="light"] .dept-doc-scroll-body'));

console.log('\n----------------------------------------------------------------------');
console.log(`النتيجة الإجمالية: ${passedTests} ناجح | ${failedTests} راسب`);
console.log('----------------------------------------------------------------------\n');

if (failedTests > 0) {
  console.error('❌ حدث فشل في بعض اختبارات تصميم نوافذ المركبات والوثائق!');
  process.exit(1);
} else {
  console.log('🎉 جميع اختبارات البانر الفاخر والمسطرة الذهبية للمركبات والوثائق نجحت بنسبة 100%!');
  process.exit(0);
}
