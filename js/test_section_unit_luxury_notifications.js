/**
 * js/test_section_unit_luxury_notifications.js
 * Verification of:
 * 1. Section and Unit Notification Sub-Tabs (التبليغات الواردة من القسم / التبليغات الصادرة من الشعبة/الوحدة).
 * 2. Executive Luxury Modals for Section and Unit Notifications with contained gold scrollbar and light mode support.
 * 3. Unit notification storage, activity logging, and handlers.
 */

const fs = require('fs');
const path = require('path');

console.log('======================================================================');
console.log('🧪 اختبارات التحقق من التبويبات الفرعية وتصميم التبليغات الفاخر للشعب والوحدات');
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

// 1. Read files
const storeJsPath = path.join(__dirname, 'store.js');
const storeJs = fs.readFileSync(storeJsPath, 'utf8');

const sectionWsPath = path.join(__dirname, 'components', 'section_workspace.js');
const sectionWs = fs.readFileSync(sectionWsPath, 'utf8');

const unitWsPath = path.join(__dirname, 'components', 'unit_workspace.js');
const unitWs = fs.readFileSync(unitWsPath, 'utf8');

const appJsPath = path.join(__dirname, 'app.js');
const appJs = fs.readFileSync(appJsPath, 'utf8');

// Section 1: Store Methods for Unit Notifications
console.log('--- 1. التحقق من دوال وسجل التبليغات للوحدات في store.js ---');
check('دالة getUnitNotifications متوفرة في store.js', storeJs.includes('getUnitNotifications('));
check('دالة addUnitNotification متوفرة في store.js', storeJs.includes('addUnitNotification('));
check('دالة deleteUnitNotification متوفرة في store.js', storeJs.includes('deleteUnitNotification('));
check('توثيق النشاط CREATE_UNIT_NOTIFICATION عند إضافة تبليغ للوحدة', storeJs.includes('CREATE_UNIT_NOTIFICATION'));
check('توثيق النشاط DELETE_UNIT_NOTIFICATION عند حذف تبليغ للوحدة', storeJs.includes('DELETE_UNIT_NOTIFICATION'));

// Section 2: Section Workspace Sub-Tabs
console.log('\n--- 2. التحقق من التبويبات الفرعية لتبليغات الشعبة في section_workspace.js ---');
check('تبويب التبليغات الواردة من القسم متوفر في الشعبة', sectionWs.includes('🏛️ <span>التبليغات الواردة من القسم</span>'));
check('تبويب التبليغات الصادرة من الشعبة متوفر في الشعبة', sectionWs.includes('📢 <span>التبليغات الصادرة من الشعبة</span>'));
check('استدعاء window.app.setSectionNotifSubTab(\'dept\') متوفر', sectionWs.includes("setSectionNotifSubTab('dept')"));
check('استدعاء window.app.setSectionNotifSubTab(\'section\') متوفر', sectionWs.includes("setSectionNotifSubTab('section')"));
check('زر إصدار تبليغ لمحطات الشعبة متوفر', sectionWs.includes('openCreateSectionNotificationModal'));
check('شارة عدد التبليغات tab-count-badge مفعلة للتبويبات الفرعية', sectionWs.includes('tab-count-badge'));

// Section 3: Unit Workspace Sub-Tabs
console.log('\n--- 3. التحقق من التبويبات الفرعية لتبليغات الوحدة في unit_workspace.js ---');
check('تبويب التبليغات الواردة من القسم متوفر في الوحدة', unitWs.includes('🏛️ <span>التبليغات الواردة من القسم</span>'));
check('تبويب التبليغات الصادرة من الوحدة متوفر في الوحدة', unitWs.includes('📢 <span>التبليغات الصادرة من الوحدة</span>'));
check('استدعاء window.app.setUnitNotifSubTab(\'dept\') متوفر', unitWs.includes("setUnitNotifSubTab('dept')"));
check('استدعاء window.app.setUnitNotifSubTab(\'unit\') متوفر', unitWs.includes("setUnitNotifSubTab('unit')"));
check('زر إصدار تبليغ لكادر الوحدة متوفر', unitWs.includes('openCreateUnitNotificationModal'));
check('عرض التبليغات الصادرة من الوحدة مع أزرار المعاينة والطباعة والحذف', unitWs.includes('viewUnitNotificationDetails') && unitWs.includes('printUnitNotification') && unitWs.includes('handleDeleteUnitNotification'));
check('شارة إجمالي التبليغات في رأس تبويبات الوحدة الرئيسية', unitWs.includes('totalUnitNotifs'));

// Section 4: App Controller Sub-Tab switchers and Luxury Modals
console.log('\n--- 4. التحقق من دوال التحكم والتصميم الفاخر لنوافذ التبليغات في app.js ---');
check('دالة setSectionNotifSubTab متوفرة في app.js', appJs.includes('setSectionNotifSubTab(tab)'));
check('دالة setUnitNotifSubTab متوفرة في app.js', appJs.includes('setUnitNotifSubTab(tab)'));

// Section Luxury Modal
check('دالة openCreateSectionNotificationModal متوفرة', appJs.includes('openCreateSectionNotificationModal(sectionId)'));
check('دالة closeSectionNotificationModal متوفرة', appJs.includes('closeSectionNotificationModal()'));
check('حاوية نافذة تبليغ الشعبة sectionNotificationModal مع إخفاء المسطرة الخارجية', appJs.includes('#sectionNotificationModal') && appJs.includes('scrollbar-width: none !important'));
check('بطاقة نافذة تبليغ الشعبة sec-notif-modal-card بعرض 820px وحواف 24px', appJs.includes('sec-notif-modal-card') && appJs.includes('max-width: 820px'));
check('بانر نافذة الشعبة الفاخر sec-notif-banner مع الكبسولة المتوهجة', appJs.includes('sec-notif-banner') && appJs.includes('sec-notif-badge'));
check('مسطرة التمرير الذهبية المدمجة sec-notif-scroll-body بعرض 9px', appJs.includes('sec-notif-scroll-body') && appJs.includes('linear-gradient(180deg, #f59e0b, #d97706)'));
check('حقول استمارة تبليغ الشعبة (العنوان، المحطة المستهدفة، الأولوية، النص)', appJs.includes('id="secNotifTitle"') && appJs.includes('id="secNotifTargetStation"') && appJs.includes('id="secNotifPriority"') && appJs.includes('id="secNotifContent"'));
check('دعم الوضع الفاتح Light Mode لنافذة تبليغ الشعبة', appJs.includes('[data-theme="light"] .sec-notif-modal-card'));

// Unit Luxury Modal
check('دالة openCreateUnitNotificationModal متوفرة', appJs.includes('openCreateUnitNotificationModal(unitId)'));
check('دالة closeUnitNotificationModal متوفرة', appJs.includes('closeUnitNotificationModal()'));
check('حاوية نافذة تبليغ الوحدة unitNotificationModal مع إخفاء المسطرة الخارجية', appJs.includes('#unitNotificationModal') && appJs.includes('scrollbar-width: none !important'));
check('بطاقة نافذة تبليغ الوحدة unit-notif-modal-card بعرض 820px وحواف 24px', appJs.includes('unit-notif-modal-card'));
check('بانر نافذة الوحدة الفاخر unit-notif-banner مع الكبسولة المتوهجة', appJs.includes('unit-notif-banner') && appJs.includes('unit-notif-badge'));
check('مسطرة التمرير الذهبية المدمجة unit-notif-scroll-body بعرض 9px', appJs.includes('unit-notif-scroll-body'));
check('حقول استمارة تبليغ الوحدة (العنوان، النطاق المستهدف، الأولوية، النص)', appJs.includes('id="unitNotifTitle"') && appJs.includes('id="unitNotifTargetScope"') && appJs.includes('id="unitNotifPriority"') && appJs.includes('id="unitNotifContent"'));
check('دعم الوضع الفاتح Light Mode لنافذة تبليغ الوحدة', appJs.includes('[data-theme="light"] .unit-notif-modal-card'));

// Handlers for Unit Notifications
check('دالة handleCreateUnitNotificationSubmit متوفرة', appJs.includes('handleCreateUnitNotificationSubmit(e, unitId)'));
check('دالة handleDeleteUnitNotification متوفرة', appJs.includes('handleDeleteUnitNotification(notifId, unitId)'));
check('دالة viewUnitNotificationDetails متوفرة', appJs.includes('viewUnitNotificationDetails(notifId)'));
check('دالة printUnitNotification متوفرة', appJs.includes('printUnitNotification(notifId)'));
check('تحديث openViewOfficialNotificationModal لدعم تبليغات الوحدة', appJs.includes('db.unitNotifications'));

console.log('\n----------------------------------------------------------------------');
console.log(`النتيجة الإجمالية: ${passedTests} ناجح | ${failedTests} راسب`);
console.log('----------------------------------------------------------------------\n');

if (failedTests > 0) {
  console.error('❌ حدث فشل في بعض اختبارات التبليغات الفرعية والنوافذ الفاخرة للشعب والوحدات!');
  process.exit(1);
} else {
  console.log('🎉 جميع اختبارات التبويبات الفرعية وتصميم التبليغات الفاخر للشعب والوحدات نجحت بنسبة 100%!');
  process.exit(0);
}
