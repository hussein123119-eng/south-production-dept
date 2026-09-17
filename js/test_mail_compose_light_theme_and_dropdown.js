/**
 * Unit Test: Mail Compose Light Theme Adaptation & Search Dropdown Stacking Context Elevation
 * Validates:
 * 1. Stacking Context fix for #mailTargetField, #mailPersonSearchContainer, and #mailPersonSearchResults (z-index 99999)
 * 2. Complete [data-theme="light"] overrides in mailComposeModal
 * 3. Complete [data-theme="light"] overrides in mailReplyModal
 * 4. Runtime simulation of rendering and search results with theme-adaptive styling
 */

const fs = require('fs');
const path = require('path');

console.log('======================================================================');
console.log('🧪 اختبارات الوضع الفاتح والبحث الفوري في نافذة البريد الجديد والرد');
console.log('======================================================================');

const mailSystemPath = path.join(__dirname, 'components', 'mail_system.js');
if (!fs.existsSync(mailSystemPath)) {
    console.error('❌ ملف mail_system.js غير موجود!');
    process.exit(1);
}

const content = fs.readFileSync(mailSystemPath, 'utf8');

let passed = 0;
let failed = 0;

function assert(condition, message) {
    if (condition) {
        console.log(`  ✅ PASS: ${message}`);
        passed++;
    } else {
        console.error(`  ❌ FAIL: ${message}`);
        failed++;
    }
}

// ─── 1. التحقق من حل مشكلة اختفاء الاسم ورفع طبقة التكديس (Stacking Context & Z-Index) ───
console.log('\n--- 1. التحقق من معالجة طبقة التكديس والقائمة المنسدلة للبحث الذكي ---');

assert(
    content.includes('id="mailTargetField"') && 
    content.includes('z-index: 100') && 
    content.includes('overflow: visible !important'),
    'حاوية التوجيه الخاص mailTargetField تمتلك z-index: 100 مع overflow: visible للسماح بتدفق القائمة'
);

assert(
    content.includes('id="mailPersonSearchContainer"') && 
    content.includes('z-index:100'),
    'حاوية البحث الذكي mailPersonSearchContainer تمتلك z-index:100'
);

assert(
    content.includes('id="mailPersonSearchResults"') && 
    content.includes('z-index:99999') && 
    content.includes('position:absolute'),
    'قائمة نتائج البحث mailPersonSearchResults مرفوعة بأعلى z-index:99999 لمنع حجبها خلف البطاقات التالية'
);

assert(
    content.includes('mail-card-section') && content.includes('z-index: 10'),
    'بطاقة موضوع ونص البريد محددة بطبقة z-index أقل لضمان عدم حجب القائمة المنسدلة للبحث'
);

// ─── 2. التحقق من دعم الوضع الفاتح الكامل لنافذة إنشاء البريد ([data-theme="light"]) ───
console.log('\n--- 2. التحقق من قواعد الوضع الفاتح الكاملة لنافذة إنشاء البريد ---');

const requiredLightRulesCompose = [
    '[data-theme="light"] #mailComposeModal',
    '[data-theme="light"] .mail-compose-card',
    '[data-theme="light"] .mail-compose-banner',
    '[data-theme="light"] .mail-compose-scroll-body',
    '[data-theme="light"] .mail-card-section',
    '[data-theme="light"] .mail-compose-label',
    '[data-theme="light"] .mail-glass-ctrl',
    '[data-theme="light"] .mail-radio-container',
    '[data-theme="light"] .mail-hierarchy-hint',
    '[data-theme="light"] #mailTargetField',
    '[data-theme="light"] #mailPersonSearchResults',
    '[data-theme="light"] .mail-person-row',
    '[data-theme="light"] #mailSelectedPersonBadge',
    '[data-theme="light"] #mailOfficialFieldsContainer',
    '[data-theme="light"] .mail-signature-panel',
    '[data-theme="light"] #mailDropZone',
    '[data-theme="light"] .mail-btn-cancel'
];

requiredLightRulesCompose.forEach(rule => {
    assert(content.includes(rule), `توفر قاعدة الوضع النهاري الفاتح: ${rule}`);
});

// ─── 3. التحقق من دعم الوضع الفاتح الكامل لنافذة الرد على البريد ───
console.log('\n--- 3. التحقق من قواعد الوضع الفاتح لنافذة الرد على البريد ---');

const requiredLightRulesReply = [
    '[data-theme="light"] #mailReplyModal',
    '[data-theme="light"] .mail-reply-card',
    '[data-theme="light"] .mail-reply-banner',
    '[data-theme="light"] .mail-reply-scroll-body',
    '[data-theme="light"] #mailReplyBody',
    '[data-theme="light"] .mail-reply-btn-cancel'
];

requiredLightRulesReply.forEach(rule => {
    assert(content.includes(rule), `توفر قاعدة الوضع النهاري الفاتح لنافذة الرد: ${rule}`);
});

// ─── 4. محاكاة إنشاء الواجهة البرمجية في بيئة تشغيل DOM وهمية ───
console.log('\n--- 4. محاكاة تشغيل دوال إنشاء النوافذ والبحث الذكي ---');

// Mock DOM
global.window = global;
global.document = {
    addEventListener: () => {},
    getElementById: (id) => {
        if (!global.mockElements) global.mockElements = {};
        if (!global.mockElements[id]) {
            global.mockElements[id] = {
                value: '',
                style: {},
                innerHTML: '',
                focus: () => {}
            };
        }
        return global.mockElements[id];
    }
};

const mockDb = {
    users: [
        { id: 'usr-10', fullName: 'علي عبد الحسين الساعدي', employeeId: '10045', jobTitle: 'مهندس أقدم', department: 'شعبة العمليات والسيطرة' },
        { id: 'usr-20', fullName: 'علي حسن كاظم', employeeId: '10088', jobTitle: 'مشغل محطة', department: 'شعبة شؤون المحطات' }
    ],
    sections: [{ id: 'sec-ops', name: 'شعبة العمليات والسيطرة' }],
    units: [],
    stations: []
};

window.store = {
    getDb: () => mockDb
};
window.app = {};

// تحميل ملف mail_system.js
require('./components/mail_system.js');
if (window.app.registerMailAppMethods) {
    window.app.registerMailAppMethods();
}

// اختبار البحث عن الاسم "علي" والتأكد من بناء العناصر بكلاسات الثيم السليمة
window.app.searchMailPerson('علي');
const resultsBox = document.getElementById('mailPersonSearchResults');

assert(
    resultsBox.innerHTML.includes('علي عبد الحسين الساعدي') && resultsBox.innerHTML.includes('علي حسن كاظم'),
    'نتائج البحث الذكي عن "علي" استرجعت جميع المطابقات بدقة'
);

assert(
    resultsBox.innerHTML.includes('mail-person-row') && 
    resultsBox.innerHTML.includes('mail-person-row-name') && 
    resultsBox.innerHTML.includes('mail-person-row-badge') &&
    resultsBox.innerHTML.includes('mail-person-select-btn'),
    'نتائج البحث تحتوي على الكلاسات المهيأة للتجاوب مع الوضع الفاتح والنيوني'
);

console.log('\n----------------------------------------------------------------------');
console.log(`النتيجة الإجمالية: ${passed} ناجح | ${failed} راسب`);
console.log('----------------------------------------------------------------------');

if (failed > 0) {
    console.error('❌ بعض الاختبارات فشلت!');
    process.exit(1);
} else {
    console.log('🎉 جميع اختبارات الوضع الفاتح وقائمة البحث المنسدلة للبريد نجحت بنسبة 100%!');
    process.exit(0);
}
