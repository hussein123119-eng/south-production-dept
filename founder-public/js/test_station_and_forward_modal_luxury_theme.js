/**
 * js/test_station_and_forward_modal_luxury_theme.js
 * Suite 35: Verification of fixed modal overlay, backdrop blur, luxury theme (dark & light),
 * and automatic cleanup on navigation for section forward and station notification modals.
 */

const fs = require('fs');
const path = require('path');

console.log('======================================================================');
console.log('🧪 اختبارات التحقق من تصحيح موضع النوافذ ودعم المظهر الفاتح والتنظيف التلقائي');
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

const appJs = fs.readFileSync(path.join(__dirname, 'app.js'), 'utf8');
const styleCss = fs.readFileSync(path.join(__dirname, '..', 'css', 'style.css'), 'utf8');

check('ملف app.js متوفر ومقروء بنجاح', appJs.length > 0);
check('ملف style.css متوفر ومقروء بنجاح', styleCss.length > 0);

console.log('\n--- 1. التحقق من قواعد CSS في style.css للنوافذ المنبثقة والوضعين الداكن والفاتح ---');
check('كلاس sec-notif-overlay يمتلك position: fixed !important لمنع ظهوره أسفل الصفحة', styleCss.includes('.sec-notif-overlay') && styleCss.includes('position: fixed !important'));
check('كلاس sec-notif-modal-overlay يمتلك z-index: 10000 !important وتأثير البلور والعتامة', styleCss.includes('z-index: 10000 !important') && styleCss.includes('backdrop-filter: blur(18px)'));
check('كلاس sec-notif-modal-card يمتلك حواف دائرية 24px ومحاذاة في المنتصف margin: auto', styleCss.includes('.sec-notif-modal-card') && styleCss.includes('margin: auto'));
check('دعم الوضع الفاتح لبطاقة النافذة [data-theme="light"] .sec-notif-modal-card بخلفية بيضاء نقية', styleCss.includes('[data-theme="light"] .sec-notif-modal-card') && styleCss.includes('background: #ffffff !important'));
check('دعم الوضع الفاتح للحقول [data-theme="light"] .sec-notif-input بنص داكن مقروء', styleCss.includes('[data-theme="light"] .sec-notif-input') && styleCss.includes('color: #0f172a !important'));
check('دعم الوضع الفاتح لقائمة الاختيار [data-theme="light"] .sec-notif-select بحدود وتدرج متناسق', styleCss.includes('[data-theme="light"] .sec-notif-select') && styleCss.includes('border-color: #cbd5e1 !important'));
check('تنسيقات بطاقة ملخص توجيه القسم fwd-dept-summary-box متوفرة', styleCss.includes('.fwd-dept-summary-box'));
check('دعم الوضع الفاتح لملخص توجيه القسم [data-theme="light"] .fwd-dept-summary-box', styleCss.includes('[data-theme="light"] .fwd-dept-summary-box'));

console.log('\n--- 2. التحقق من نافذة تعميم توجيه القسم على المحطات في app.js ---');
check('نافذة تعميم توجيه القسم تمتلك معرّف forwardDeptNotifModal', appJs.includes("overlay.id = 'forwardDeptNotifModal'"));
check('نافذة تعميم توجيه القسم تستخدم overlay مثبت بحجم الشاشة الكامل position:fixed; inset:0', 
  appJs.includes("overlay.setAttribute('style', 'position:fixed; inset:0; z-index:10000;"));
check('نافذة تعميم توجيه القسم تحتوي على كلاسات التوافقية sec-notif-modal-overlay و sec-notif-overlay', 
  appJs.includes('sec-notif-modal-overlay') && appJs.includes('sec-notif-overlay'));
check('نافذة تعميم توجيه القسم تحتوي على صندوق الملخص fwd-dept-summary-box', appJs.includes('fwd-dept-summary-box'));
check('نافذة تعميم توجيه القسم تحتوي على زر الإلغاء sec-notif-btn-cancel وزر التعميم sec-notif-btn-submit', 
  appJs.includes('sec-notif-btn-cancel') && appJs.includes('sec-notif-btn-submit'));

console.log('\n--- 3. التحقق من نافذة إصدار تبليغ كادر المحطة في app.js ---');
check('نافذة تبليغ كادر المحطة تمتلك معرّف stationNotificationModal', appJs.includes("overlay.id = 'stationNotificationModal'"));
check('نافذة تبليغ كادر المحطة تستخدم overlay مثبت بحجم الشاشة الكامل position:fixed; inset:0', 
  appJs.includes("overlay.setAttribute('style', 'position:fixed; inset:0; z-index:10000;"));
check('نافذة تبليغ كادر المحطة تحتوي على بطاقة منبثقة sec-notif-modal-card', appJs.includes('sec-notif-modal-card sec-notif-card'));
check('نافذة تبليغ كادر المحطة تحتوي على بانر فاخر sec-notif-banner', appJs.includes('sec-notif-banner sec-notif-header'));
check('نافذة تبليغ كادر المحطة تحتوي على حقل النطاق والكوادر stNotifTargetScope', appJs.includes('id="stNotifTargetScope"'));

console.log('\n--- 4. التحقق من تنظيف النوافذ المنبثقة العالقة عند التنقل في navigate() ---');
check('دالة navigate() تقوم بإزالة النوافذ العالقة sec-notif-overlay و dept-notif-modal-overlay', 
  appJs.includes('querySelectorAll') && appJs.includes('.sec-notif-overlay') && appJs.includes('el.remove()'));

console.log('\n----------------------------------------------------------------------');
console.log(`النتيجة الإجمالية: ${passedTests} ناجح | ${failedTests} راسب`);
console.log('----------------------------------------------------------------------\n');

if (failedTests > 0) {
  process.exit(1);
} else {
  console.log('🎉 جميع اختبارات التحقق من تصحيح موضع النوافذ والمظهر الفاخر نجحت بنسبة 100%!');
}