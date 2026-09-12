/* ==========================================================================
   الاختبار 9 - نظام البريد الداخلي (mail_system.js)
   يتحقق من: وجود الوظائف، هيكل البيانات، الأرقام التسلسلية، فلترة البريد
   ========================================================================== */

// ─── Node.js polyfill للبيئة المتصفح ──────────────────────────────────────
if (typeof window === 'undefined') {
  // محاكاة localStorage
  const _store = {};
  const _localStorage = {
    getItem: k => _store[k] !== undefined ? _store[k] : null,
    setItem: (k, v) => { _store[k] = v; },
    removeItem: k => { delete _store[k]; }
  };

  // محاكاة db داخلية
  let _db = {
    mailSystem: { counter: 0, mails: [] },
    sections: [{ id: 'sec-1', name: 'شعبة الإنتاج الأولى', departmentId: 'dept-south-prod' }],
    units: [{ id: 'unit-1', name: 'وحدة الضخ', sectionId: 'sec-1' }],
    stations: [{ id: 'station-1', name: 'محطة ضخ 1', sectionId: 'sec-1' }],
    users: [{ id: 'test-user-1', fullName: 'مستخدم تجريبي', role: 'DEPT_MANAGER', status: 'APPROVED', employeeId: 'EMP001' }],
    employeeMasterRecords: []
  };

  // محاكاة window وstore
  global.window = global;
  global.localStorage = _localStorage;
  global.window.store = {
    getDb: () => _db,
    saveDb: (db) => { _db = JSON.parse(JSON.stringify(db)); }
  };
  global.window.auth = {
    getCurrentUser: () => ({ id: 'test-user-1', fullName: 'مستخدم تجريبي', role: 'DEPT_MANAGER' })
  };
  global.document = { addEventListener: () => {} };

  // تحميل mail_system.js بعد إعداد البيئة
  require('./components/mail_system.js');
}

(function runMailSystemTest() {
  const results = [];
  let passed = 0;
  let failed = 0;

  function check(name, condition, info) {
    if (condition) {
      results.push(`  ✅ PASS | ${name}`);
      passed++;
    } else {
      results.push(`  ❌ FAIL | ${name}${info ? ' → ' + info : ''}`);
      failed++;
    }
  }

  console.log('\n══════════════════════════════════════════════════');
  console.log('  🧪 TEST 9: نظام البريد الداخلي (Mail System)');
  console.log('══════════════════════════════════════════════════\n');

  // 1. التحقق من وجود الوظائف الأساسية
  check('renderMailTab موجودة', typeof window.renderMailTab === 'function');
  check('sendMail موجودة', typeof window.sendMail === 'function');
  check('getMailsForContext موجودة', typeof window.getMailsForContext === 'function');
  check('markMailRead موجودة', typeof window.markMailRead === 'function');
  check('replyToMail موجودة', typeof window.replyToMail === 'function');
  check('deleteMail موجودة', typeof window.deleteMail === 'function');
  check('buildMailViewerContent موجودة', typeof window.buildMailViewerContent === 'function');
  check('registerMailAppMethods موجودة', typeof window.registerMailAppMethods === 'function');

  // 2. التحقق من store.js - mailSystem موجود في DB
  let dbOk = false;
  if (window.store && typeof window.store.getDb === 'function') {
    const db = window.store.getDb();
    dbOk = db && db.mailSystem !== undefined && typeof db.mailSystem.counter === 'number' && Array.isArray(db.mailSystem.mails);
    check('mailSystem موجود في store.getDb()', dbOk, dbOk ? '' : 'mailSystem مفقود أو بنيته خاطئة');
  } else {
    check('store.getDb() متاح', false, 'window.store غير موجود');
  }

  // 3. التحقق من إرسال بريد وتوليد رقم تسلسلي
  if (window.store && typeof window.sendMail === 'function') {
    const fakeUser = { id: 'test-user-1', fullName: 'مستخدم تجريبي', role: 'DEPT_MANAGER' };
    const mailData = {
      mailType: 'public',
      fromLevel: 'department',
      toLevel: 'all',
      toTargetName: 'الجميع',
      subject: 'اختبار - بريد عام',
      body: 'هذا بريد تجريبي من اختبار الوحدة.',
      attachments: []
    };

    const result1 = window.sendMail(mailData, fakeUser);
    check('sendMail ترجع success:true', result1 && result1.success === true);
    check('البريد يحتوي على id', result1 && result1.mail && typeof result1.mail.id === 'string');
    check('id يبدأ بـ MAIL-', result1 && result1.mail && result1.mail.id.startsWith('MAIL-'));

    // إرسال بريد ثانٍ للتحقق من الزيادة التسلسلية
    const result2 = window.sendMail({ ...mailData, subject: 'اختبار - بريد ثانٍ' }, fakeUser);
    if (result1.success && result2.success) {
      const num1 = parseInt(result1.mail.id.split('-')[1]);
      const num2 = parseInt(result2.mail.id.split('-')[1]);
      check('الأرقام التسلسلية تزيد بشكل صحيح', num2 === num1 + 1, `${result1.mail.id} ← ${result2.mail.id}`);
    }

    // 4. التحقق من فلترة البريد العام
    const deptContext = { level: 'department', id: 'dept-south-prod' };
    const deptMails = window.getMailsForContext(deptContext, fakeUser);
    check('getMailsForContext يرجع مصفوفة', Array.isArray(deptMails));
    check('البريد العام يظهر في مستوى القسم', deptMails.some(m => m.mailType === 'public'));

    // 5. التحقق من markMailRead
    const firstMail = result1.mail;
    window.markMailRead(firstMail.id, fakeUser.id);
    const db2 = window.store.getDb();
    const updatedMail = db2.mailSystem.mails.find(m => m.id === firstMail.id);
    check('markMailRead تحدث حالة القراءة', updatedMail && updatedMail.isRead && updatedMail.isRead[fakeUser.id] === true);

    // 6. التحقق من الرد
    const replyResult = window.replyToMail(firstMail.id, 'هذا رد تجريبي', fakeUser);
    check('replyToMail ترجع success:true', replyResult && replyResult.success === true);
    const db3 = window.store.getDb();
    const mailWithReply = db3.mailSystem.mails.find(m => m.id === firstMail.id);
    check('الرد يُضاف للرسالة', mailWithReply && Array.isArray(mailWithReply.replies) && mailWithReply.replies.length > 0);

    // 7. التحقق من الحذف (مسموح لصاحب البريد)
    const delResult = window.deleteMail(result2.mail.id, fakeUser);
    check('deleteMail ترجع success:true لصاحب البريد', delResult && delResult.success === true);
    const db4 = window.store.getDb();
    check('البريد يُحذف من القاعدة', !db4.mailSystem.mails.some(m => m.id === result2.mail.id));

    // تنظيف - حذف بريد الاختبار المتبقي
    window.deleteMail(firstMail.id, fakeUser);

  } else {
    check('sendMail قابل للاختبار', false, 'store أو sendMail غير متاح');
  }

  // 8. التحقق من renderMailTab يرجع HTML
  if (typeof window.renderMailTab === 'function' && window.auth && typeof window.auth.getCurrentUser === 'function') {
    const html = window.renderMailTab({ level: 'department', id: 'dept-south-prod' });
    check('renderMailTab يرجع HTML string', typeof html === 'string' && html.length > 100);
    check('HTML يحتوي على البريد العام', html.includes('البريد العام'));
    check('HTML يحتوي على البريد الخاص', html.includes('البريد الخاص'));
    check('HTML يحتوي على زر إنشاء', html.includes('إنشاء بريد جديد') || html.includes('openComposeMailModal'));
  }

  // 9. التحقق من الكتاب الرسمي والصادر والتوقيع (Official Letter & Signatures)
  if (typeof window.sendMail === 'function') {
    const fakeAdmin = { id: 'test-user-1', fullName: 'مستخدم تجريبي', role: 'DEPT_MANAGER', jobTitle: 'مدير هيأة/قسم' };
    const officialLetterData = {
      mailType: 'public',
      letterType: 'OFFICIAL_LETTER',
      refNumber: 'ص / إنتاج / 777',
      letterDate: '2026-09-11',
      priority: 'URGENT',
      classification: 'CONFIDENTIAL',
      fromLevel: 'department',
      toLevel: 'section',
      toTargetName: 'شعبة الإنتاج الأولى',
      subject: 'أمر إداري رسمي - صيانة العازلات',
      body: 'تقرر إجراء الصيانة الدورية للعازلات وفق الجداول المعتمدة.',
      signatureDataUrl: 'data:image/png;base64,fakeSignatureData',
      stampInfo: {
        org: 'وزارة النفط - شركة نفط البصرة',
        dept: 'قسم الإنتاج الجنوبي',
        officialName: 'مستخدم تجريبي'
      }
    };

    const resOfficial = window.sendMail(officialLetterData, fakeAdmin);
    check('إرسال كتاب رسمي ينجح', resOfficial && resOfficial.success === true);
    check('الكتاب الرسمي يحفظ رقم الصادر', resOfficial && resOfficial.mail && resOfficial.mail.refNumber === 'ص / إنتاج / 777');
    check('الكتاب الرسمي يحفظ درجة الأسبقية والسرية', resOfficial && resOfficial.mail && resOfficial.mail.priority === 'URGENT' && resOfficial.mail.classification === 'CONFIDENTIAL');
    check('الكتاب الرسمي يحفظ التوقيع والختم', resOfficial && resOfficial.mail && resOfficial.mail.signatureDataUrl && resOfficial.mail.stampInfo);

    // 10. التحقق من مسار الإحالة والهامش الرسمي (Workflow Endorsement)
    if (typeof window.addMailEndorsement === 'function') {
      const endorsementData = {
        toLevel: 'station',
        toTargetId: 'station-1',
        toTargetName: 'محطة ضخ 1',
        actionType: 'FOR_ACTION',
        note: 'هامش: إلى مسؤول المحطة للعمل بموجبه وإعلامنا بالإنجاز فورا.',
        signatureDataUrl: 'data:image/png;base64,fakeEndorsementSig'
      };

      const endRes = window.addMailEndorsement(resOfficial.mail.id, endorsementData, fakeAdmin);
      check('addMailEndorsement ينجح', endRes && endRes.success === true);
      check('الإحالة تُضاف لسجل الكتاب', endRes && endRes.endorsement && endRes.endorsement.toTargetName === 'محطة ضخ 1');

      // التحقق من عرض الكتاب وعارض التتبع
      if (typeof window.buildMailViewerContent === 'function') {
        const viewerHtml = window.buildMailViewerContent(resOfficial.mail.id);
        check('عارض الكتاب يحتوي على الترويسة الرسمية ورقم الصادر', viewerHtml.includes('ص / إنتاج / 777') && viewerHtml.includes('جمهورية العراق'));
        check('عارض الكتاب يحتوي على الهامش والإحالة الرسمية', viewerHtml.includes('هامش: إلى مسؤول المحطة') && viewerHtml.includes('Workflow Audit Trail'));
      }
    }

    // تنظيف الكتاب الرسمي
    window.deleteMail(resOfficial.mail.id, fakeAdmin);
  }

  // ═══ ملخص النتائج ═══════════════════════════════════════════════════════
  console.log(results.join('\n'));
  console.log('\n──────────────────────────────────────────────────');
  console.log(`  📊 النتيجة: ${passed} نجاح | ${failed} فشل | ${passed + failed} إجمالي`);
  if (failed === 0) {
    console.log('  🎉 جميع اختبارات نظام البريد الداخلي نجحت!');
  } else {
    console.warn(`  ⚠️  ${failed} اختبارات فشلت - يرجى المراجعة`);
  }
  console.log('══════════════════════════════════════════════════\n');

  return { passed, failed, total: passed + failed };
})();
