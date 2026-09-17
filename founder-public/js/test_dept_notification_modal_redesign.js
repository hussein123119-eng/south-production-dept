/**
 * js/test_dept_notification_modal_redesign.js
 * Verification of the redesigned luxury Department Announcement / Notification modal:
 * 1. Banner luxury design, glowing badge, title, and close button.
 * 2. Contained luxury scrollbar (مسطرة التمرير الذهبية) within the card.
 * 3. Expanded width (max-width: 820px).
 * 4. Multi-theme support (Dark Mode and Light Mode).
 * 5. Backwards compatibility with form input IDs and save handlers.
 */

const fs = require('fs');
const path = require('path');

console.log('======================================================================');
console.log('🧪 اختبارات التحقق من البانر الفاخر والمسطرة وتوسيع نافذة التبليغات الإدارية');
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

// 1. Check js/app.js content
const appJsPath = path.join(__dirname, 'app.js');
const appJs = fs.readFileSync(appJsPath, 'utf8');

check('ملف js/app.js موجود ومقروء بنجاح', appJs.length > 0);

// Check method existence
check('دالة openCreateDeptNotificationModal متوفرة', appJs.includes('openCreateDeptNotificationModal()'));
check('دالة closeDeptNotificationModal متوفرة', appJs.includes('closeDeptNotificationModal()'));
check('دالة handleSaveDeptNotification متوفرة', appJs.includes('handleSaveDeptNotification(e)'));

// Check luxury banner elements
check('البانر العلوي الفاخر يحتوي على كلاس dept-notif-banner', appJs.includes('dept-notif-banner'));
check('البانر يحتوي على كبسولة الأيقونة المتوهجة dept-notif-badge', appJs.includes('dept-notif-badge'));
check('البانر يحتوي على العنوان الفاخر للتبليغات الرسمية', appJs.includes('إصدار تبليغ رسمي جديد للقسم'));
check('البانر يحتوي على العنوان الفرعي للنظام والتوجيهات الميدانية', appJs.includes('نظام التعميمات والتبليغات الإدارية الفورية والتوجيهات الميدانية'));
check('البانر يحتوي على زر إغلاق دائري زجاجي dept-notif-close-btn', appJs.includes('dept-notif-close-btn'));

// Check contained luxury scrollbar
check('إخفاء مسطرة التمرير الخارجية عن حاوية النافذة scrollbar-width: none', appJs.includes('#deptNotificationModal') && appJs.includes('scrollbar-width: none !important'));
check('حاوية الاستمارة القابلة للتمرير الداخلي dept-notif-scroll-body متوفرة', appJs.includes('dept-notif-scroll-body'));
check('المسطرة الداخلية المدمجة تستخدم التدرج الذهبي scrollbar-color', appJs.includes('scrollbar-color: #f59e0b') || appJs.includes('scrollbar-color: #d97706'));
check('المسطرة تدعم متصفحات Webkit بعرض 9px وتدرج لوني فخم', appJs.includes('.dept-notif-scroll-body::-webkit-scrollbar') && appJs.includes('linear-gradient(180deg, #f59e0b, #d97706)'));

// Check expanded width & dimensions
check('البطاقة موسعة بعرض مريح max-width: 820px', appJs.includes('max-width: 820px'));
check('الحواف الدائرية للبطاقة الفاخرة border-radius: 24px', appJs.includes('border-radius: 24px'));

// Check form fields and compatibility
check('حقل عنوان التبليغ deptNotifTitleInput متوفر', appJs.includes('id="deptNotifTitleInput"'));
check('حقل الجهة المستهدفة deptNotifTargetSelect متوفر', appJs.includes('id="deptNotifTargetSelect"'));
check('حقل درجة الأهمية deptNotifImportanceSelect متوفر', appJs.includes('id="deptNotifImportanceSelect"'));
check('حقل نص ومحتوى التبليغ deptNotifContentInput متوفر', appJs.includes('id="deptNotifContentInput"'));
check('الأزرار الفاخرة للإلغاء والإصدار متوفرة', appJs.includes('dept-notif-btn-cancel') && appJs.includes('dept-notif-btn-submit'));

// Check theme support (Dark & Light modes)
check('دعم الوضع الفاتح Light Mode متوفر عبر [data-theme="light"]', appJs.includes('[data-theme="light"] .dept-notif-modal-card') && appJs.includes('[data-theme="light"] .dept-notif-banner'));
check('دعم مسطرة التمرير في الوضع الفاتح متوفر', appJs.includes('[data-theme="light"] .dept-notif-scroll-body'));

// Check Tab unification to "التبليغات"
const deptMgmtCode = fs.readFileSync(path.join(__dirname, 'components', 'dept_management.js'), 'utf8');
check('اسم تبويب التبليغات في إدارة القسم موحد إلى "التبليغات"', deptMgmtCode.includes('📢 <span>التبليغات</span>'));
check('عدم وجود التسمية القديمة "التبليغات الرسمية" في أزرار التبويبات', !deptMgmtCode.includes('📢 <span>التبليغات الرسمية</span>'));

console.log('\n----------------------------------------------------------------------');
console.log(`النتيجة الإجمالية: ${passedTests} ناجح | ${failedTests} راسب`);
console.log('----------------------------------------------------------------------\n');

if (failedTests > 0) {
  console.error('❌ حدث فشل في بعض اختبارات التصميم!');
  process.exit(1);
} else {
  console.log('🎉 جميع اختبارات البانر الفاخر والمسطرة وتوسيع النافذة نجحت بنسبة 100%!');
  process.exit(0);
}
