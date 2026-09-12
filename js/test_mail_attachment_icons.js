const fs = require('fs');
const path = require('path');
const base = __dirname;

const localStorageData = {};
global.localStorage = {
  getItem: (k) => localStorageData[k] || null,
  setItem: (k, v) => { localStorageData[k] = v; },
  removeItem: (k) => { delete localStorageData[k]; }
};
const sessionStorageData = {};
global.sessionStorage = {
  getItem: (k) => sessionStorageData[k] || null,
  setItem: (k, v) => { sessionStorageData[k] = v; },
  removeItem: (k) => { delete sessionStorageData[k]; }
};
global.window = global;
global.location = { hostname: 'localhost', href: 'http://localhost:3000' };

global.document = {
  documentElement: { setAttribute: () => {}, getAttribute: () => 'light' },
  body: { classList: { toggle: () => {}, remove: () => {}, add: () => {} } },
  getElementById: () => ({ value: '', innerHTML: '', style: {}, classList: { add: () => {}, remove: () => {} } }),
  querySelector: () => null,
  querySelectorAll: () => [],
  addEventListener: () => {}
};

console.log('======================================================================');
console.log('🧪 اختبارات التحقق من الأيقونات والأزرار الجذابة للمرفقات (SVG & Pills)');
console.log('======================================================================\n');

const scripts = [
  'store.js', 'auth.js', 'rbac.js', 'utils/exporter.js',
  'components/sidebar.js', 'components/topbar.js', 'components/announcement_bar.js',
  'components/dashboard.js', 'components/dept_management.js', 'components/section_workspace.js', 'components/unit_workspace.js',
  'components/user_management.js', 'components/documents.js', 'components/mail_system.js', 'app.js'
];

for (const s of scripts) {
  const code = fs.readFileSync(path.join(base, s), 'utf8');
  eval(code);
}

let passedCount = 0;
let failedCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passedCount++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failedCount++;
  }
}

console.log('1. التحقق من كود CSS وتنسيقات الأزرار الفاخرة للأيقونات:');
const cssCode = fs.readFileSync(path.join(base, '../css/style.css'), 'utf8');
assert(cssCode.includes('.pill-attachment-btn'), 'فئة .pill-attachment-btn متوفرة في ملف style.css');
assert(cssCode.includes('.pill-icon-box'), 'فئة .pill-icon-box متوفرة في ملف style.css');
assert(cssCode.includes('.pill-attachment-pdf'), 'فئة .pill-attachment-pdf المخصصة لملفات PDF متوفرة مع تأثير التوهج');
assert(cssCode.includes('.pill-attachment-word'), 'فئة .pill-attachment-word المخصصة لملفات Word متوفرة مع تأثير التوهج');
assert(cssCode.includes('.pill-attachment-excel'), 'فئة .pill-attachment-excel المخصصة لملفات Excel متوفرة مع التنسيق الزمردي');
assert(cssCode.includes('.pill-attachment-image'), 'فئة .pill-attachment-image المخصصة للصور متوفرة');
assert(cssCode.includes('.pill-attachment-other'), 'فئة .pill-attachment-other للمرفقات المتنوعة متوفرة');

console.log('\n2. التحقق من توليد أزرار وأيقونات PDF الجذابة في بطاقات البريد:');
const db = window.store.getDb();
const user = (db.users && db.users.find(u => u.role === 'DEPT_MANAGER')) || { id: 'usr-dept-mgr', fullName: 'م. أحمد عبد الحسين', role: 'DEPT_MANAGER', departmentId: 'dept-south-prod' };
window.auth.saveSession(user);

const pdfRes = window.sendMail({
  mailType: 'public',
  fromLevel: 'department',
  toLevel: 'all',
  toTargetName: 'الجميع',
  subject: 'تقرير الإنتاج لشهر آب PDF',
  body: 'مرفق طياً ملف تقرير الإنتاج الرسمي بصيغة PDF.',
  attachments: [{ name: 'Production_Report_Aug.pdf', dataUrl: 'data:application/pdf;base64,sample', type: 'application/pdf' }]
}, user);

const wordRes = window.sendMail({
  mailType: 'public',
  fromLevel: 'department',
  toLevel: 'all',
  toTargetName: 'الجميع',
  subject: 'محضر اجتماع الشعبة WORD',
  body: 'مرفق كتاب ومحضر رسمي بصيغة وورد.',
  attachments: [{ name: 'Meeting_Minutes.docx', dataUrl: 'data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,sample', type: 'application/msword' }]
}, user);

const mailTabHtml = window.renderMailTab({ level: 'department', id: 'dept-south-prod' });

assert(mailTabHtml.includes('pill-attachment-pdf'), 'بطاقة البريد تحتوي على فئة زر PDF الفاخر');
assert(mailTabHtml.includes('تصفح PDF'), 'زر تصفح PDF يحتوي على النص الصحيح');
assert(mailTabHtml.includes('<svg') && mailTabHtml.includes('pill-icon-box'), 'زر تصفح PDF يحتوي على أيقونة SVG فاخرة داخل pill-icon-box');

assert(mailTabHtml.includes('pill-attachment-word'), 'بطاقة البريد تحتوي على فئة زر Word الفاخر');
assert(mailTabHtml.includes('مستند Word'), 'زر مستند Word يحتوي على النص الصحيح');
assert(mailTabHtml.includes('pill-icon-box') && mailTabHtml.includes('viewBox="0 0 24 24"'), 'زر مستند Word يحتوي على أيقونة SVG متجهة');

console.log('\n3. التحقق من عارض البريد وتضمين أيقونات SVG الفاخرة:');
if (pdfRes && pdfRes.mail) {
  const viewerHtml = window.buildMailViewerContent(pdfRes.mail.id);
  assert(viewerHtml.includes('مستند PDF المرفق'), 'عارض البريد يعرض قسم مستند PDF المرفق');
  assert(viewerHtml.includes('<svg') && viewerHtml.includes('width="20" height="20"'), 'عارض البريد يحتوي على أيقونة SVG فائقة الوضوح لملف الـ PDF');
  
  // Clean up
  window.deleteMail(pdfRes.mail.id, user);
}
if (wordRes && wordRes.mail) {
  window.deleteMail(wordRes.mail.id, user);
}

console.log('\n----------------------------------------------------------------------');
console.log(`النتيجة الإجمالية: ${passedCount} ناجح | ${failedCount} راسب`);
console.log('----------------------------------------------------------------------');

if (failedCount > 0) {
  console.error('❌ فشل في بعض اختبارات الأيقونات الجذابة');
  process.exit(1);
} else {
  console.log('🎉 جميع اختبارات الأيقونات ذات التصميم الجذاب نجحت بنسبة 100%!');
  process.exit(0);
}
