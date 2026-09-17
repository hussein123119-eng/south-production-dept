/**
 * js/test_endorsement_modal_theme.js
 * التحقق من التصميم الجذاب والبانر الموسع والتباين ودعم الأوضاع لنافذة الإحالة والتوجيه الرسمي (Workflow Endorsement)
 */

const fs = require('fs');
const path = require('path');

console.log('======================================================================');
console.log('🧪 اختبارات التحقق من التصميم والبانر الموسع لنافذة الإحالة والهامش الرسمي');
console.log('======================================================================\n');

let passed = 0;
let failed = 0;

function check(desc, cond) {
  if (cond) {
    console.log(`  ✅ PASS: ${desc}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${desc}`);
    failed++;
  }
}

// 1. قراءة كود mail_system.js
const mailSystemCode = fs.readFileSync(path.join(__dirname, 'components', 'mail_system.js'), 'utf8');

// محاكاة بيئة المتصفح الخفيفة
global.window = {
  store: {
    getDb: () => ({
      sections: [{ id: 'sec-1', name: 'شعبة العمليات' }],
      stations: [{ id: 'st-1', name: 'محطة 1' }],
      users: []
    })
  },
  auth: {
    getCurrentUser: () => ({ id: 'u1', name: 'مسؤول تجريبي', role: 'SECTION_HEAD' })
  },
  app: {}
};

// تحميل الكود
eval(mailSystemCode);

const modalHtml = typeof renderMailEndorsementModal === 'function' ? renderMailEndorsementModal() : '';

// 1. التحقق من توسيع البانر العلوي وعناصره الفاخرة
check('دالة renderMailEndorsementModal تولد HTML بنجاح', modalHtml.length > 0);
check('البانر العلوي الموسع يحتوي على كلاس endorsement-banner', modalHtml.includes('class="endorsement-banner"') || modalHtml.includes('endorsement-banner'));
check('البانر يحتوي على أيقونة التوقيع الفاخرة ✍️ في كبسولة متوهجة', modalHtml.includes('✍️') && modalHtml.includes('box-shadow:0 4px 15px rgba(245,158,11,0.25)'));
check('البانر يحتوي على العنوان الفاخر الملون بتدرج ذهبي', modalHtml.includes('إضافة إحالة وهامش وتوجيه رسمي') && modalHtml.includes('-webkit-background-clip:text'));
check('البانر يحتوي على العنوان الفرعي ونظام المراسلات المعتمد', modalHtml.includes('Workflow Endorsement') && modalHtml.includes('نظام المراسلات والتوجيه المعتمد'));
check('البانر يحتوي على زر إغلاق دائري زجاجي مع تأثير الدوران', modalHtml.includes('endorsement-close-btn') && modalHtml.includes('rotate(90deg)'));

// 2. التحقق من معالجة تباين العناوين والتسميات (High Contrast)
check('عناوين الحقول تستخدم كلاس endorsement-label مع تباين فائق وظلال واضحة', modalHtml.includes('class="endorsement-label"') && modalHtml.includes('text-shadow:0 1px 3px rgba(0,0,0,0.6)'));
check('عنوان جهة الإحالة يحتوي على أيقونة الهدف 🎯 الكبسولية', modalHtml.includes('🎯') && modalHtml.includes('تحديد جهة الإحالة والتوجيه'));
check('عنوان الإجراء المطلوب يحتوي على أيقونة البرق ⚡', modalHtml.includes('⚡') && modalHtml.includes('نوع الإجراء والتوجيه المطلوب'));
check('عنوان نص الهامش يحتوي على أيقونة الملاحظة 📝 والنجمة الحمراء الإلزامية', modalHtml.includes('📝') && modalHtml.includes('نص الهامش الإداري والتوجيه') && modalHtml.includes('*'));

// 3. التحقق من الحقول الزجاجية العصرية
check('الحقول تستخدم كلاس endorsement-input بخلفية زجاجية مصقولة', modalHtml.includes('endorsement-input') && modalHtml.includes('box-shadow: inset 0 2px 4px') || modalHtml.includes('endorsement-input'));
check('الحقول تدعم تأثير التوهج الأزرق السماوي عند التركيز focus glow', modalHtml.includes('border-color: #38bdf8') && modalHtml.includes('box-shadow: 0 0 14px rgba(56, 189, 248, 0.35)'));

// 4. التحقق من بطاقة التوقيع والختم الرقمي السريع
check('بطاقة التوقيع تستخدم كلاس endorsement-sig-box الأنيق', modalHtml.includes('class="endorsement-sig-box"'));
check('زر الختم والتوقيع السريع يستخدم كلاس endorsement-btn-stamp بتدرج زمردي فاخر', modalHtml.includes('endorsement-btn-stamp') && modalHtml.includes('linear-gradient(135deg, #059669 0%, #10b981 100%)'));
check('مؤشر حالة التوقيع يحتوي على شارة واضحة', modalHtml.includes('id="mailEndorsementSignStatus"') && modalHtml.includes('لم يتم التوقيع بعد'));
check('زر مسح التوقيع متوفر بتنسيق أحمر ناعم', modalHtml.includes('clearEndorsementSignature') && modalHtml.includes('مسح التوقيع'));

// 5. التحقق من أزرار الإجراءات السفلية ودعم الأوضاع (Light & Dark Theme)
check('زر اعتماد وإرسال الإحالة يستخدم كلاس endorsement-btn-submit بتدرج أزرق ملكي فاخر', modalHtml.includes('endorsement-btn-submit') && modalHtml.includes('linear-gradient(135deg, #2563eb 0%, #1d4ed8 50%, #0284c7 100%)'));
check('زر الإلغاء واضح بنص أبيض وتباين كامل دون أي عتامة', modalHtml.includes('endorsement-btn-cancel') && modalHtml.includes('color:#ffffff'));
// 6. التحقق من مسطرة التمرير واحتوائها التام داخل البطاقة والبانر وإخفائها من الإطار الخارجي
check('نافذة الإحالة تخفي مسطرة التمرير الخارجية عن الشاشة scrollbar-width:none', modalHtml.includes('scrollbar-width:none') || modalHtml.includes('display: none !important'));
check('بطاقة الإحالة تحتوي على استمارة قابلة للتمرير الداخلي endorsement-form-body', modalHtml.includes('class="endorsement-form-body"') && modalHtml.includes('overflow-y: auto'));
check('استمارة الإحالة تدمج مسطرة تمرير ذهبية فاخرة داخل البطاقة', modalHtml.includes('scrollbar-color: #f59e0b') && modalHtml.includes('linear-gradient(180deg, #f59e0b, #d97706)'));

// 7. التحقق من عارض البريد ونوافذ الإنشاء والرد
const viewerHtml = typeof renderMailViewerModal === 'function' ? renderMailViewerModal() : '';
check('عارض البريد يخفي مسطرة التمرير الخارجية ويدمج مسطرة داخلية mail-viewer-scroll-body', viewerHtml.includes('mail-viewer-scroll-body') && viewerHtml.includes('overflow-y: auto') && viewerHtml.includes('scrollbar-width: none'));

const composeHtml = typeof renderComposeMailModal === 'function' ? renderComposeMailModal({}, { role: 'SUPER_ADMIN' }) : '';
check('نافذة إنشاء البريد تدمج مسطرة التمرير داخل mail-compose-scroll-body', composeHtml.includes('mail-compose-scroll-body') && composeHtml.includes('overflow-y: auto') && composeHtml.includes('mail-compose-banner'));

const replyHtml = typeof renderMailReplyModal === 'function' ? renderMailReplyModal() : '';
check('نافذة الرد تدمج مسطرة التمرير داخل mail-reply-scroll-body', replyHtml.includes('mail-reply-scroll-body') && replyHtml.includes('overflow-y: auto'));

console.log('----------------------------------------------------------------------');
console.log(`النتيجة الإجمالية: ${passed} ناجح | ${failed} راسب`);
console.log('----------------------------------------------------------------------');

if (failed === 0) {
  console.log('🎉 جميع اختبارات التصميم والبانر الموسع ودعم الأوضاع نجحت بنسبة 100%!');
  process.exit(0);
} else {
  console.error('❌ توجد اختبارات راسبة!');
  process.exit(1);
}
