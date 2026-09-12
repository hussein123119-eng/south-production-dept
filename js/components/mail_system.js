/* ==========================================================================
   إدارة قسم الإنتاج الجنوبي - Mail System Component (نظام البريد الداخلي)
   يدعم 4 مستويات: القسم → الشعب → الوحدات → المحطات
   البريد العام: يُبث للجميع | البريد الخاص: يُوجَّه بدقة
   ========================================================================== */

// ─── صلاحيات البريد ─────────────────────────────────────────────────────────
function mailCanSend(user) {
  if (!user) return false;
  const roles = ['SUPER_ADMIN', 'DEPT_MANAGER', 'DEPUTY_DEPT_MANAGER', 'SECTION_MANAGER', 'UNIT_MANAGER', 'ADMINISTRATOR'];
  if (roles.includes(user.role)) return true;
  const cp = Array.isArray(user.customPermissions) ? user.customPermissions : [];
  return cp.includes('MAIL_SEND') || cp.includes('SCOPE_ALL_SECTIONS') || cp.includes('ALL_SECTIONS_UNITS_ACCESS');
}

function mailCanDelete(user, mail) {
  if (!user) return false;
  if (['SUPER_ADMIN', 'DEPT_MANAGER'].includes(user.role)) return true;
  return mail && mail.fromUserId === user.id;
}

// ─── توليد رقم تسلسلي ────────────────────────────────────────────────────────
function getNextMailNumber() {
  const db = window.store.getDb();
  if (!db.mailSystem) db.mailSystem = { counter: 0, mails: [] };
  db.mailSystem.counter = (db.mailSystem.counter || 0) + 1;
  window.store.saveDb(db);
  return String(db.mailSystem.counter).padStart(4, '0');
}

// ─── جلب بريد المستوى ────────────────────────────────────────────────────────
function getMailsForContext(context, user) {
  const db = window.store.getDb();
  if (!db.mailSystem || !db.mailSystem.mails) return [];

  return db.mailSystem.mails.filter(mail => {
    // البريد العام الصادر من القسم → يظهر في كل المستويات
    if (mail.mailType === 'public' && mail.fromLevel === 'department') return true;

    // البريد العام الصادر من شعبة → يظهر في الشعبة ووحداتها ومحطاتها
    if (mail.mailType === 'public' && mail.fromLevel === 'section') {
      if (context.level === 'department') return false;
      if (context.level === 'section') return mail.fromSectionId === context.id;
      if (context.level === 'unit') {
        const db2 = window.store.getDb();
        const unit = (db2.units || []).find(u => u.id === context.id);
        return unit && unit.sectionId === mail.fromSectionId;
      }
      if (context.level === 'station') {
        const db2 = window.store.getDb();
        const station = (db2.stations || []).find(s => s.id === context.id);
        return station && station.sectionId === mail.fromSectionId;
      }
    }

    // البريد الخاص → يظهر فقط للمستهدف
    if (mail.mailType === 'private') {
      if (mail.toLevel === 'all') return true;
      if (mail.toLevel === 'department' && context.level === 'department') return true;
      if (mail.toLevel === 'section' && context.level === 'section') return mail.toTargetId === context.id;
      if (mail.toLevel === 'unit' && context.level === 'unit') return mail.toTargetId === context.id;
      if (mail.toLevel === 'station' && context.level === 'station') return mail.toTargetId === context.id;
      if (mail.toLevel === 'person') {
        // يظهر للشخص المعني في أي مستوى ينتمي له
        return mail.toTargetId === user.id;
      }
      // لمدير القسم يرى كل الخاص أيضاً
      if (['SUPER_ADMIN', 'DEPT_MANAGER'].includes(user.role)) return true;
    }

    return false;
  });
}

// ─── إرسال بريد ──────────────────────────────────────────────────────────────
function sendMail(mailData, user) {
  const db = window.store.getDb();
  if (!db.mailSystem) db.mailSystem = { counter: 0, mails: [] };
  if (!Array.isArray(db.mailSystem.mails)) db.mailSystem.mails = [];

  db.mailSystem.counter = (db.mailSystem.counter || 0) + 1;
  const mailNumber = String(db.mailSystem.counter).padStart(4, '0');

  const letterType = mailData.letterType || 'REGULAR_MAIL';
  let refNumber = (mailData.refNumber || '').trim();
  if (!refNumber && letterType !== 'REGULAR_MAIL') {
    const lvl = mailData.fromLevel || 'department';
    if (lvl === 'department' || (user && ['DEPT_MANAGER', 'SUPER_ADMIN'].includes(user.role))) {
      refNumber = `ص / إنتاج / ${mailNumber}`;
    } else if (lvl === 'section') {
      refNumber = `ص / شعبة / ${mailNumber}`;
    } else if (lvl === 'station') {
      refNumber = `م / محطة / ${mailNumber}`;
    } else if (lvl === 'unit') {
      refNumber = `مذكرة / وحدة / ${mailNumber}`;
    } else {
      refNumber = `ص / ${mailNumber}`;
    }
  }

  const newMail = {
    id: 'MAIL-' + mailNumber,
    mailNumber: mailNumber,
    mailType: mailData.mailType || 'public',       // 'public' | 'private'
    letterType: letterType,                       // 'REGULAR_MAIL' | 'OFFICIAL_LETTER' | 'FIELD_MEMO' | 'INFO_REQUEST'
    refNumber: refNumber,                         // رقم الصادر الرسمي
    letterDate: mailData.letterDate || new Date().toISOString().slice(0, 10),
    priority: mailData.priority || 'NORMAL',       // 'NORMAL' | 'URGENT' | 'IMMEDIATE'
    classification: mailData.classification || 'PUBLIC', // 'PUBLIC' | 'CONFIDENTIAL'
    signatureDataUrl: mailData.signatureDataUrl || null,
    stampInfo: mailData.stampInfo || null,
    endorsements: Array.isArray(mailData.endorsements) ? mailData.endorsements : [],
    fromUserId: user.id,
    fromUserName: user.fullName,
    fromUserRole: user.role,
    fromUserTitle: user.jobTitle || user.role || 'مسؤول',
    fromLevel: mailData.fromLevel || 'department', // 'department' | 'section' | 'unit' | 'station'
    fromSectionId: mailData.fromSectionId || null,
    fromUnitId: mailData.fromUnitId || null,
    fromStationId: mailData.fromStationId || null,
    toLevel: mailData.toLevel || 'all',            // 'all' | 'section' | 'unit' | 'station' | 'person'
    toTargetId: mailData.toTargetId || null,
    toTargetName: mailData.toTargetName || 'الجميع',
    subject: (mailData.subject || '').trim(),
    body: (mailData.body || '').trim(),
    attachments: Array.isArray(mailData.attachments) ? mailData.attachments : [],
    timestamp: new Date().toISOString(),
    isRead: {},                                    // { userId: true }
    replies: [],
    status: 'sent'
  };

  db.mailSystem.mails.unshift(newMail); // أحدث أولاً
  window.store.saveDb(db);

  return { success: true, mail: newMail };
}

// ─── إضافة إحالة وهامش رسمي مع التوقيع (Workflow Endorsement) ───────────────
function addMailEndorsement(mailId, endorsementData, user) {
  const db = window.store.getDb();
  if (!db.mailSystem || !db.mailSystem.mails) return { success: false, error: 'قاعدة البيانات غير متاحة' };
  const mail = db.mailSystem.mails.find(m => m.id === mailId);
  if (!mail) return { success: false, error: 'الكتاب غير موجود' };
  if (!Array.isArray(mail.endorsements)) mail.endorsements = [];

  const endorsement = {
    id: 'END-' + Date.now(),
    fromUserId: user.id,
    fromUserName: user.fullName,
    fromUserRole: user.role,
    fromUserTitle: user.jobTitle || user.role || 'مسؤول',
    toLevel: endorsementData.toLevel || 'section',
    toTargetId: endorsementData.toTargetId || null,
    toTargetName: endorsementData.toTargetName || 'الجهة المعنية',
    actionType: endorsementData.actionType || 'FOR_ACTION', // 'FOR_ACTION' | 'FOR_INFO' | 'FOR_APPROVAL' | 'FOR_FEEDBACK'
    note: (endorsementData.note || '').trim(),
    signatureDataUrl: endorsementData.signatureDataUrl || null,
    stampInfo: endorsementData.stampInfo || {
      org: 'وزارة النفط - شركة نفط البصرة',
      dept: 'قسم الإنتاج الجنوبي',
      officialName: user.fullName,
      officialRole: user.jobTitle || user.role || 'مسؤول',
      timestamp: new Date().toISOString()
    },
    timestamp: new Date().toISOString()
  };

  mail.endorsements.push(endorsement);
  if (!mail.isRead) mail.isRead = {};
  mail.isRead[user.id] = true;

  window.store.saveDb(db);
  return { success: true, endorsement };
}

// ─── تحديد الرسالة كمقروءة ───────────────────────────────────────────────────
function markMailRead(mailId, userId) {
  const db = window.store.getDb();
  if (!db.mailSystem || !db.mailSystem.mails) return;
  const mail = db.mailSystem.mails.find(m => m.id === mailId);
  if (mail) {
    if (!mail.isRead) mail.isRead = {};
    mail.isRead[userId] = true;
    window.store.saveDb(db);
  }
}

// ─── إضافة رد ────────────────────────────────────────────────────────────────
function replyToMail(mailId, replyBody, user) {
  const db = window.store.getDb();
  if (!db.mailSystem || !db.mailSystem.mails) return { success: false };
  const mail = db.mailSystem.mails.find(m => m.id === mailId);
  if (!mail) return { success: false };
  if (!Array.isArray(mail.replies)) mail.replies = [];

  mail.replies.push({
    replyId: 'R-' + Date.now(),
    fromUserId: user.id,
    fromUserName: user.fullName,
    fromUserRole: user.role,
    body: (replyBody || '').trim(),
    timestamp: new Date().toISOString()
  });
  window.store.saveDb(db);
  return { success: true };
}

// ─── حذف بريد ────────────────────────────────────────────────────────────────
function deleteMail(mailId, user) {
  const db = window.store.getDb();
  if (!db.mailSystem || !db.mailSystem.mails) return { success: false };
  const mail = db.mailSystem.mails.find(m => m.id === mailId);
  if (!mail) return { success: false };
  if (!mailCanDelete(user, mail)) return { success: false, error: 'غير مصرح بالحذف' };
  db.mailSystem.mails = db.mailSystem.mails.filter(m => m.id !== mailId);
  window.store.saveDb(db);
  return { success: true };
}

// ─── تنسيق التاريخ ───────────────────────────────────────────────────────────
function formatMailDate(isoStr) {
  if (!isoStr) return '';
  try {
    const d = new Date(isoStr);
    return d.toLocaleDateString('ar-IQ', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch (e) { return isoStr; }
}

// ─── واتساب ──────────────────────────────────────────────────────────────────
function openWhatsAppForMail(mail, recipientPhone) {
  const text = encodeURIComponent(
    `📬 بريد داخلي رقم: ${mail.id}\n` +
    `📌 الموضوع: ${mail.subject}\n` +
    `📝 ${mail.body}\n` +
    `📅 ${formatMailDate(mail.timestamp)}\n` +
    `من: ${mail.fromUserName}`
  );
  const phone = (recipientPhone || '').replace(/[^0-9]/g, '');
  const url = phone
    ? `https://wa.me/${phone.startsWith('0') ? '964' + phone.slice(1) : phone}?text=${text}`
    : `https://wa.me/?text=${text}`;
  window.open(url, '_blank');
}

// ─── إيميل ───────────────────────────────────────────────────────────────────
function openEmailForMail(mail, recipientEmail) {
  const subject = encodeURIComponent(`[بريد داخلي ${mail.id}] ${mail.subject}`);
  const body = encodeURIComponent(
    `بريد داخلي رقم: ${mail.id}\nالموضوع: ${mail.subject}\n\n${mail.body}\n\nمن: ${mail.fromUserName}\nالتاريخ: ${formatMailDate(mail.timestamp)}`
  );
  const email = recipientEmail || '';
  window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
}

// ─── واجهة: تبويب البريد الرئيسي ────────────────────────────────────────────
function renderMailTab(context) {
  const user = (window.auth && typeof window.auth.getCurrentUser === 'function') ? window.auth.getCurrentUser() : null;
  if (!user) return `<div class="card" style="padding:2rem;text-align:center;"><p>⚠️ يرجى تسجيل الدخول</p></div>`;

  const canSend = mailCanSend(user);
  const activeMailTab = (window.app && window.app['mailSubTab_' + context.level + '_' + (context.id || 'dept')]) || 'public';

  const allMails = getMailsForContext(context, user);
  const publicMails = allMails.filter(m => m.mailType === 'public');
  const privateMails = allMails.filter(m => m.mailType === 'private');

  const setTabFn = `window.app.setMailSubTab('${context.level}', '${context.id || 'dept'}', 'TYPE')`;

  return `
    <div class="card" style="padding: 0; overflow: hidden; border-radius: var(--radius-lg);">
      <!-- رأس تبويب البريد -->
      <div style="background: linear-gradient(135deg, rgba(11,87,208,0.06) 0%, rgba(2,132,199,0.1) 100%); padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--md-sys-color-surface-variant); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
        <div>
          <h4 style="font-weight: 800; color: var(--md-sys-color-primary); margin: 0 0 0.2rem 0; display: flex; align-items: center; gap: 0.5rem; font-size: 1.1rem;">
            📬 <span>نظام البريد الداخلي</span>
          </h4>
          <p style="color: var(--md-sys-color-outline); font-size: 0.82rem; margin: 0;">
            البريد العام يُبث للجميع · البريد الخاص يُوجَّه بدقة لصاحبه
          </p>
        </div>
        ${canSend ? `
          <button class="btn btn-glass-primary" onclick="window.app.openComposeMailModal('${context.level}', '${context.id || ''}')"
                  style="font-weight: 800; display: flex; align-items: center; gap: 0.5rem;">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 5v14M5 12h14"></path>
            </svg>
            <span>إنشاء بريد جديد</span>
          </button>
        ` : ''}
      </div>

      <!-- تبويبات عام / خاص -->
      <div class="tabs-header" style="margin: 0; border-radius: 0; border-bottom: 2px solid var(--md-sys-color-surface-variant); background: var(--md-sys-color-surface);">
        <button class="tab-btn ${activeMailTab === 'public' ? 'active' : ''}"
                onclick="${setTabFn.replace('TYPE', 'public')}"
                style="border-radius: 0; font-weight: 800;">
          📢 <span>البريد العام</span>
          <span class="tab-count-badge">${publicMails.length}</span>
        </button>
        <button class="tab-btn ${activeMailTab === 'private' ? 'active' : ''}"
                onclick="${setTabFn.replace('TYPE', 'private')}"
                style="border-radius: 0; font-weight: 800;">
          🔒 <span>البريد الخاص</span>
          <span class="tab-count-badge">${privateMails.length}</span>
        </button>
      </div>

      <!-- محتوى البريد -->
      <div style="padding: 1.25rem;">
        ${activeMailTab === 'public' ? renderMailList(publicMails, user, context, 'public') : ''}
        ${activeMailTab === 'private' ? renderMailList(privateMails, user, context, 'private') : ''}
      </div>
    </div>

    ${renderComposeMailModal(context, user)}
    ${renderMailViewerModal()}
    ${renderMailReplyModal()}
    ${renderMailEndorsementModal()}
  `;
}

// ─── قائمة الرسائل ───────────────────────────────────────────────────────────
function renderMailList(mails, user, context, mailType) {
  const db = (window.store && typeof window.store.getDb === 'function') ? window.store.getDb() : { users: [], employeeMasterRecords: [] };
  const allUsers = db.users || [];
  const allMasters = db.employeeMasterRecords || [];

  if (mails.length === 0) {
    return `
      <div style="text-align: center; padding: 3rem 1rem; color: var(--md-sys-color-outline);">
        <div style="font-size: 3rem; margin-bottom: 0.75rem;">${mailType === 'public' ? '📭' : '🔒'}</div>
        <h4 style="margin: 0 0 0.5rem 0; font-weight: 700;">
          لا توجد رسائل ${mailType === 'public' ? 'عامة' : 'خاصة'} بعد
        </h4>
        <p style="font-size: 0.88rem; max-width: 400px; margin: 0 auto;">
          ${mailType === 'public'
            ? 'البريد العام يُبث لجميع مستويات القسم عند إرساله.'
            : 'البريد الخاص يُوجَّه لشخص أو جهة محددة.'}
        </p>
      </div>
    `;
  }

  return `
    <div style="display: flex; flex-direction: column; gap: 0.75rem;">
      ${mails.map(mail => {
        const isRead = mail.isRead && mail.isRead[user.id];
        const attachments = Array.isArray(mail.attachments) ? mail.attachments : [];
        const hasAttachments = attachments.length > 0;
        // تحليل المرفقات لأنواعها المختلفة
        const pdfAtt = attachments.find(a => (a.type && a.type === 'application/pdf') || (a.name && /\.pdf$/i.test(a.name)));
        const imgAtt = attachments.find(a => (a.type && a.type.startsWith('image/')) || (a.name && /\.(jpg|jpeg|png|webp|gif|svg|bmp)$/i.test(a.name)));
        const docAtt = attachments.find(a => (a.name && /\.(doc|docx)$/i.test(a.name)) || (a.type && a.type.includes('word')));
        const xlsAtt = attachments.find(a => (a.name && /\.(xls|xlsx|csv)$/i.test(a.name)) || (a.type && a.type.includes('sheet')));
        const otherAtt = attachments.find(a => a !== pdfAtt && a !== imgAtt && a !== docAtt && a !== xlsAtt);
        const repliesCount = Array.isArray(mail.replies) ? mail.replies.length : 0;

        // المرسل وبيانات الاتصال
        const fromUser = allUsers.find(u => u.id === mail.fromUserId) || {};
        const masterRec = allMasters.find(e => e.employeeId === fromUser.employeeId) || {};
        const mailJson = JSON.stringify({id:mail.id,subject:mail.subject,body:mail.body,timestamp:mail.timestamp,fromUserName:mail.fromUserName}).replace(/"/g,'&quot;');

        return `
          <div onclick="window.app.openMailViewer('${mail.id}')"
               style="
                 background: ${isRead
                   ? 'var(--md-sys-color-surface)'
                   : 'linear-gradient(135deg, rgba(11,87,208,0.04) 0%, rgba(2,132,199,0.07) 100%)'};
                 border: 1.5px solid ${isRead ? 'var(--md-sys-color-surface-variant)' : 'rgba(11,87,208,0.25)'};
                 border-right: 4px solid ${mailType === 'public' ? 'var(--md-sys-color-primary)' : '#7c3aed'};
                 border-radius: var(--radius-md);
                 padding: 0.9rem 1.25rem;
                 cursor: pointer;
                 transition: all 0.18s ease;
                 display: flex;
                 align-items: center;
                 justify-content: space-between;
                 flex-wrap: wrap;
                 gap: 0.9rem;
               "
               onmouseover="this.style.transform='translateX(-2px)';this.style.boxShadow='0 4px 14px rgba(0,0,0,0.08)'"
               onmouseout="this.style.transform='';this.style.boxShadow=''">

            <!-- الجزء الأيمن: الأيقونة ومحتوى الرسالة -->
            <div style="display: flex; align-items: center; gap: 0.9rem; flex: 1; min-width: 260px;">
              <!-- أيقونة الحالة -->
              <div style="font-size: 1.6rem; flex-shrink: 0; opacity: ${isRead ? '0.6' : '1'};">
                ${isRead ? '📬' : '📩'}
              </div>

              <!-- محتوى الرسالة -->
              <div style="min-width: 0; flex: 1;">
                <div style="display: flex; align-items: center; gap: 0.6rem; flex-wrap: wrap; margin-bottom: 0.25rem;">
                  <span style="font-weight: ${isRead ? '700' : '900'}; font-size: 0.98rem; color: var(--md-sys-color-on-surface);">
                    ${mail.subject || '(بدون موضوع)'}
                  </span>
                  <span style="background: rgba(11,87,208,0.12); color: var(--md-sys-color-primary); font-size: 0.72rem; font-weight: 800; padding: 0.1rem 0.55rem; border-radius: 999px; white-space: nowrap;">
                    ${mail.id}
                  </span>
                  ${mail.refNumber ? `
                    <span style="background:rgba(245,158,11,0.15); color:#b45309; font-size:0.72rem; font-weight:800; padding:0.1rem 0.55rem; border-radius:999px; border:1px solid rgba(245,158,11,0.3); white-space:nowrap;">
                      📜 ${mail.refNumber}
                    </span>
                  ` : ''}
                  ${mail.priority === 'URGENT' ? '<span style="background:rgba(239,68,68,0.12); color:#dc2626; font-size:0.7rem; font-weight:800; padding:0.1rem 0.5rem; border-radius:999px;">عاجل ⚠️</span>' : ''}
                  ${mail.priority === 'IMMEDIATE' ? '<span style="background:#dc2626; color:white; font-size:0.7rem; font-weight:900; padding:0.1rem 0.5rem; border-radius:999px;">فوري وسري 🔴</span>' : ''}
                  ${mail.endorsements && mail.endorsements.length > 0 ? `
                    <span style="background:rgba(16,185,129,0.12); color:#059669; font-size:0.7rem; font-weight:800; padding:0.1rem 0.5rem; border-radius:999px;">
                      🔖 ${mail.endorsements.length} إحالات
                    </span>
                  ` : ''}
                  ${(mail.signatureDataUrl || mail.stampInfo) ? '<span style="font-size:0.72rem; color:#059669; font-weight:800; background:rgba(16,185,129,0.1); padding:0.1rem 0.45rem; border-radius:999px;">✍️ موقّع</span>' : ''}
                  ${!isRead ? '<span style="background:#ef4444;color:white;font-size:0.65rem;font-weight:900;padding:0.1rem 0.45rem;border-radius:999px;">جديد</span>' : ''}
                </div>
                <div style="color: var(--md-sys-color-outline); font-size: 0.82rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                  من: <strong style="color:var(--md-sys-color-on-surface);">${mail.fromUserName}</strong> &nbsp;·&nbsp; ${formatMailDate(mail.timestamp)} &nbsp;·&nbsp; إلى: <span style="color:var(--md-sys-color-primary);">${mail.toTargetName || 'الجميع'}</span>
                </div>
                <div style="color: var(--md-sys-color-on-surface-variant); font-size: 0.84rem; margin-top: 0.2rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                  ${(mail.body || '').substring(0, 110)}${mail.body && mail.body.length > 110 ? '...' : ''}
                </div>
              </div>
            </div>

            <!-- الجزء الأيسر: أزرار التفاعل المباشرة في البطاقة -->
            <div style="display: flex; align-items: center; gap: 0.5rem; flex-shrink: 0;" onclick="event.stopPropagation()">
              <!-- زر التصفح المباشر لملف PDF -->
              ${pdfAtt ? `
                <button onclick="window.open('${pdfAtt.dataUrl}', '_blank')"
                        title="تصفح ملف PDF مباشرة (${pdfAtt.name})"
                        class="pill-attachment-btn pill-attachment-pdf">
                  <span class="pill-icon-box">
                    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                      <path d="M9 13h6"></path>
                      <path d="M9 17h3"></path>
                    </svg>
                  </span>
                  <span>تصفح PDF</span>
                </button>
              ` : ''}

              <!-- زر المعاينة الفورية للصورة (بأي صيغة) -->
              ${imgAtt && !pdfAtt ? `
                <button onclick="window.app.openMailImageLightbox('${imgAtt.dataUrl}', '${(imgAtt.name || 'صورة مرفقة').replace(/'/g, "\\'")}')"
                        title="معاينة وتكبير الصورة فورياً (${imgAtt.name})"
                        class="pill-attachment-btn pill-attachment-image">
                  <span class="pill-icon-box">
                    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                      <circle cx="8.5" cy="8.5" r="1.5"></circle>
                      <polyline points="21 15 16 10 5 21"></polyline>
                    </svg>
                  </span>
                  <span>عرض الصورة</span>
                </button>
              ` : ''}

              <!-- زر تنزيل مستند Word -->
              ${docAtt && !pdfAtt && !imgAtt ? `
                <a href="${docAtt.dataUrl}" download="${docAtt.name}"
                   title="تنزيل مستند Word (${docAtt.name})"
                   class="pill-attachment-btn pill-attachment-word">
                  <span class="pill-icon-box">
                    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                      <path d="M8 13l1.5 4 1.5-4 1.5 4 1.5-4"></path>
                    </svg>
                  </span>
                  <span>مستند Word</span>
                </a>
              ` : ''}

              <!-- زر تنزيل جدول Excel -->
              ${xlsAtt && !pdfAtt && !imgAtt && !docAtt ? `
                <a href="${xlsAtt.dataUrl}" download="${xlsAtt.name}"
                   title="تنزيل جدول Excel (${xlsAtt.name})"
                   class="pill-attachment-btn pill-attachment-excel">
                  <span class="pill-icon-box">
                    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="3" y1="9" x2="21" y2="9"></line>
                      <line x1="3" y1="15" x2="21" y2="15"></line>
                      <line x1="9" y1="3" x2="9" y2="21"></line>
                    </svg>
                  </span>
                  <span>جدول Excel</span>
                </a>
              ` : ''}

              <!-- زر ملف مرفق عام -->
              ${otherAtt && !pdfAtt && !imgAtt && !docAtt && !xlsAtt ? `
                <a href="${otherAtt.dataUrl}" download="${otherAtt.name}"
                   title="تنزيل الملف المرفق (${otherAtt.name})"
                   class="pill-attachment-btn pill-attachment-other">
                  <span class="pill-icon-box">
                    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
                    </svg>
                  </span>
                  <span>تحميل الملف</span>
                </a>
              ` : ''}

              <!-- شارة عدد المرفقات إذا كان هناك أكثر من مرفق -->
              ${attachments.length > 1 ? `
                <span title="يحتوي على ${attachments.length} مرفقات متنوعة"
                      style="background: rgba(0,0,0,0.06); color: var(--md-sys-color-outline); font-size: 0.72rem; font-weight: 800; padding: 0.2rem 0.5rem; border-radius: 999px; border: 1px solid var(--md-sys-color-surface-variant);">
                  +${attachments.length - 1} مرفقات
                </span>
              ` : ''}

              <!-- علامة واتساب المباشرة -->
              ${masterRec.phone ? `
                <button class="btn-circle-whatsapp btn-action-whatsapp"
                        onclick="openWhatsAppForMail(${mailJson}, '${masterRec.phone}')"
                        title="إشعار عبر واتساب (${masterRec.phone})">
                  <svg viewBox="0 0 24 24" width="15" height="15" fill="#ffffff">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                  </svg>
                </button>
              ` : ''}

              <!-- علامة إيميل المباشرة -->
              ${masterRec.emailPersonal ? `
                <button class="btn-circle-email btn-action-email"
                        onclick="openEmailForMail(${mailJson}, '${masterRec.emailPersonal}')"
                        title="إرسال للإيميل (${masterRec.emailPersonal})">
                  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="2" y="4" width="20" height="16" rx="3"></rect>
                    <path d="M22 7l-10 7L2 7"></path>
                  </svg>
                </button>
              ` : ''}

              <!-- شارة الردود أو المرفقات -->
              ${repliesCount > 0 ? `<span style="background:rgba(124,58,237,0.1); color:#7c3aed; font-size:0.75rem; font-weight:800; padding:0.2rem 0.5rem; border-radius:999px;">↩ ${repliesCount}</span>` : ''}
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

// ─── نافذة إنشاء بريد ────────────────────────────────────────────────────────
function renderComposeMailModal(context, user) {
  const db = (window.store && typeof window.store.getDb === 'function') ? window.store.getDb() : { sections: [], units: [], stations: [], users: [] };
  const sections = db.sections || [];
  const units = db.units || [];
  const stations = db.stations || [];
  const users = (db.users || []).filter(u => u.status === 'APPROVED' && u.id !== user.id);

  const canSendPublic = ['SUPER_ADMIN', 'DEPT_MANAGER', 'SECTION_MANAGER', 'ADMINISTRATOR'].includes(user.role);

  return `
    <div id="mailComposeModal" style="display:none; position:fixed; inset:0; z-index:9999; background:rgba(3,7,18,0.85); backdrop-filter:blur(16px) saturate(180%); -webkit-backdrop-filter:blur(16px) saturate(180%); padding:1rem; overflow-y:scroll; scrollbar-width:thin; scrollbar-color:#38bdf8 rgba(15,23,42,0.6);"
         onclick="if(event.target===this) window.app.closeComposeMailModal()">
      <style>
        #mailComposeModal::-webkit-scrollbar { width: 12px; }
        #mailComposeModal::-webkit-scrollbar-track { background: rgba(10, 18, 36, 0.75); border-radius: 8px; }
        #mailComposeModal::-webkit-scrollbar-thumb { background: linear-gradient(180deg, #38bdf8, #0284c7); border-radius: 8px; border: 2px solid rgba(15, 23, 42, 0.4); }
        #mailComposeModal::-webkit-scrollbar-thumb:hover { background: #38bdf8; box-shadow: 0 0 10px rgba(56, 189, 248, 0.5); }
        .mail-compose-card {
          background: rgba(11, 20, 42, 0.96) !important;
          backdrop-filter: blur(40px) saturate(200%) !important;
          -webkit-backdrop-filter: blur(40px) saturate(200%) !important;
          border: 1.2px solid rgba(56, 189, 248, 0.3) !important;
          border-radius: 24px !important;
          max-width: 980px !important;
          width: 95vw !important;
          margin: 1.5rem auto 4.5rem auto !important;
          box-shadow: 0 25px 75px rgba(0, 0, 0, 0.8), 0 0 30px rgba(56, 189, 248, 0.15), inset 0 1px 1px rgba(255, 255, 255, 0.22) !important;
          overflow: hidden !important;
          color: #ffffff !important;
        }
        .mail-card-section {
          background: rgba(15, 23, 42, 0.7) !important;
          border: 1.2px solid rgba(255, 255, 255, 0.12) !important;
          border-radius: 18px !important;
          padding: 1.35rem 1.45rem !important;
          backdrop-filter: blur(16px) !important;
          box-shadow: 0 12px 35px rgba(0, 0, 0, 0.28) !important;
          transition: border-color 0.2s ease !important;
        }
        .mail-card-section:hover {
          border-color: rgba(56, 189, 248, 0.35) !important;
        }
        .mail-glass-ctrl {
          background: rgba(8, 15, 30, 0.75) !important;
          border: 1.2px solid rgba(56, 189, 248, 0.3) !important;
          border-radius: 12px !important;
          color: #ffffff !important;
          box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.3) !important;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }
        .mail-glass-ctrl:focus {
          outline: none !important;
          border-color: rgba(56, 189, 248, 0.75) !important;
          background: rgba(13, 24, 46, 0.9) !important;
          box-shadow: 0 0 16px rgba(56, 189, 248, 0.32), inset 0 2px 4px rgba(0, 0, 0, 0.2) !important;
        }
        .mail-glass-ctrl::placeholder {
          color: #64748b !important;
        }
      </style>

      <div class="mail-compose-card">
        <!-- رأس النافذة الملكي الزجاجي -->
        <div style="background: linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 58, 138, 0.45) 50%, rgba(15, 23, 42, 0.95) 100%); padding: 1.25rem 1.65rem; border-bottom: 1.2px solid rgba(56, 189, 248, 0.25); display: flex; justify-content: space-between; align-items: center; gap: 1rem; flex-wrap: wrap;">
          <div style="display: flex; align-items: center; gap: 0.85rem;">
            <div style="width: 48px; height: 48px; border-radius: 15px; background: rgba(56, 189, 248, 0.18); border: 1.2px solid rgba(56, 189, 248, 0.45); display: flex; align-items: center; justify-content: center; font-size: 1.55rem; box-shadow: 0 0 20px rgba(56, 189, 248, 0.35);">
              ✉️
            </div>
            <div>
              <h3 style="margin: 0; font-weight: 900; color: #ffffff; font-size: 1.2rem; display: flex; align-items: center; gap: 0.5rem; letter-spacing: -0.2px;">
                إنشاء بريد جديد ومراسلة رسمية
              </h3>
              <div style="font-size: 0.82rem; color: #94a3b8; margin-top: 0.25rem;">
                المنظومة الرقمية الموحدة للمراسلات والكتب الرسمية والمطالعات التشغيلية
              </div>
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <span style="background: rgba(56, 189, 248, 0.16); border: 1px solid rgba(56, 189, 248, 0.4); color: #38bdf8; font-size: 0.8rem; font-weight: 800; padding: 0.35rem 0.85rem; border-radius: 20px; box-shadow: 0 0 12px rgba(56, 189, 248, 0.2);">
              نظام البريد 2.0
            </span>
            <button type="button" onclick="window.app.closeComposeMailModal()"
                    style="background: rgba(255, 255, 255, 0.08); border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 10px; width: 34px; height: 34px; color: #94a3b8; font-size: 1.1rem; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s;">
              ✕
            </button>
          </div>
        </div>

        <!-- نموذج الإرسال -->
        <form id="mailComposeForm" onsubmit="window.app.submitComposeMail(event)" style="padding: 1.6rem; display: flex; flex-direction: column; gap: 1.35rem;">

          <!-- البطاقة 1: تصنيف المعاملة ونطاق البث والمسار الإداري -->
          <div class="mail-card-section">
            <div style="font-size: 0.94rem; font-weight: 800; color: #38bdf8; display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1.1rem; border-bottom: 1px solid rgba(255, 255, 255, 0.08); padding-bottom: 0.65rem;">
              📜 تصنيف ونوع المعاملة ونطاق البث
            </div>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.25rem; margin-bottom: 1rem;">
              <!-- نوع وتصنيف المعاملة -->
              <div>
                <label style="font-weight: 700; font-size: 0.9rem; color: #f1f5f9; display: block; margin-bottom: 0.45rem;">
                  📜 نوع المعاملة والمراسلة:
                </label>
                <select id="mailLetterType" name="letterType" class="form-control mail-glass-ctrl" onchange="window.app.onLetterTypeChange(this.value)" style="font-weight: 700; padding: 0.75rem 1rem; width: 100%; cursor: pointer;">
                  <option value="REGULAR_MAIL" style="background: #0f172a; color: #e2e8f0;">📬 بريد داخلي عادي (مراسلة سريعة ومرفقات)</option>
                  <option value="OFFICIAL_LETTER" style="background: #0f172a; color: #fbbf24;">📜 كتاب رسمي صادر موثق (معتمد بعدد وتاريخ وتوقيع)</option>
                  <option value="FIELD_MEMO" style="background: #0f172a; color: #38bdf8;">⚡ مطالعة ميدانية / أمر تشغيلي (محطة ⮂ شعبة ⮂ قسم)</option>
                  <option value="INFO_REQUEST" style="background: #0f172a; color: #34d399;">📋 مذكرة طلب وتنسيق معلومات (لوحدات إدارة القسم ⮂ الشعب)</option>
                </select>
              </div>

              <!-- طبيعة البث (عام / خاص) -->
              <div>
                <label style="font-weight: 700; font-size: 0.9rem; color: #f1f5f9; display: block; margin-bottom: 0.45rem;">
                  📡 نطاق البث والتوجيه:
                </label>
                <div style="display: flex; gap: 0.75rem; align-items: center; min-height: 46px; background: rgba(8, 15, 30, 0.6); padding: 0.35rem 0.85rem; border-radius: 12px; border: 1.2px solid rgba(56, 189, 248, 0.3);">
                  <label style="display: flex; align-items: center; gap: 0.4rem; cursor: pointer; font-weight: 700; font-size: 0.9rem; color: #38bdf8; flex: 1;">
                    <input type="radio" name="mailType" value="public" checked onchange="window.app.toggleMailTargetField(this.value)"
                           style="accent-color: #38bdf8; width: 18px; height: 18px;">
                    📢 عام (يُبث للجميع)
                  </label>
                  <label style="display: flex; align-items: center; gap: 0.4rem; cursor: pointer; font-weight: 700; font-size: 0.9rem; color: #c084fc; flex: 1;">
                    <input type="radio" name="mailType" value="private" onchange="window.app.toggleMailTargetField(this.value)"
                           style="accent-color: #a855f7; width: 18px; height: 18px;">
                    🔒 خاص (موجَّه بدقة)
                  </label>
                </div>
              </div>
            </div>

            <!-- شريط توجيه الهيكل الإداري والعملياتي المعتمد -->
            <div style="background: linear-gradient(135deg, rgba(30, 58, 138, 0.25) 0%, rgba(15, 23, 42, 0.55) 100%); border: 1px solid rgba(96, 165, 250, 0.25); border-radius: 12px; padding: 0.75rem 1rem; font-size: 0.82rem; color: #bfdbfe; line-height: 1.6; display: flex; align-items: center; gap: 0.65rem;">
              <span style="font-size: 1.2rem; flex-shrink: 0;">🏛️</span>
              <div>
                <strong>الهيكل الإداري والتشغيلي:</strong> المسار المباشر للعمليات: [رئاسة القسم] ⮂ [الشعب الفنية] ⮂ [المحطات الميدانية]. وحدات إدارة القسم تختص بالتنسيق وطلب المعلومات والإحصائيات من الشعب فقط.
              </div>
            </div>
          </div>

          <!-- حقول التوجيه الخاص (تظهر فقط عند اختيار خاص) -->
          <div id="mailTargetField" class="mail-card-section" style="display: none; border-color: rgba(168, 85, 247, 0.4) !important; background: rgba(26, 16, 48, 0.55) !important;">
            <div style="font-size: 0.94rem; font-weight: 800; color: #c084fc; display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem; border-bottom: 1px solid rgba(168, 85, 247, 0.2); padding-bottom: 0.6rem;">
              🎯 تحديد الوجهة الموجه إليها البريد الخاص
            </div>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.1rem;">
              <div>
                <label style="font-weight: 700; font-size: 0.88rem; color: #f1f5f9; display: block; margin-bottom: 0.4rem;">
                  مستوى جهة التوجيه:
                </label>
                <select id="mailToLevel" name="toLevel" class="form-control mail-glass-ctrl" onchange="window.app.updateMailTargetOptions()"
                        style="font-weight: 700; padding: 0.75rem 1rem; width: 100%; border-color: rgba(168, 85, 247, 0.35);">
                  <option value="section" style="background: #0f172a;">🏢 شعبة محددة</option>
                  <option value="station" style="background: #0f172a;">🛢️ محطة ميدانية</option>
                  <option value="department" style="background: #0f172a;">🏛️ رئاسة القسم</option>
                  <option value="unit" style="background: #0f172a;">📋 وحدة إدارة القسم</option>
                  <option value="person" style="background: #0f172a;">👤 شخص محدد (بحث ذكي بالاسم والرقم)</option>
                </select>
              </div>

              <!-- اختيار عادي للشعب والوحدات والمحطات -->
              <div id="mailStandardTargetContainer">
                <label style="font-weight: 700; font-size: 0.88rem; color: #f1f5f9; display: block; margin-bottom: 0.4rem;">
                  الجهة المستهدفة:
                </label>
                <select id="mailToTargetId" name="toTargetId" class="form-control mail-glass-ctrl" style="font-weight: 700; padding: 0.75rem 1rem; width: 100%; border-color: rgba(168, 85, 247, 0.35);">
                  ${sections.map(s => `<option value="${s.id}" data-name="${s.name}" style="background: #0f172a;">${s.name}</option>`).join('')}
                </select>
              </div>
            </div>

            <!-- حاوية البحث الذكي عن الأشخاص -->
            <div id="mailPersonSearchContainer" style="display:none; position:relative; margin-top: 1rem;">
              <input type="hidden" id="mailSelectedPersonId" name="selectedPersonId" value="">
              <input type="hidden" id="mailSelectedPersonName" name="selectedPersonName" value="">

              <!-- شريط البحث الفوري -->
              <div id="mailPersonSearchInputWrapper" style="position:relative;">
                <input type="text" id="mailPersonSearchInput" class="form-control mail-glass-ctrl"
                       placeholder="🔍 ابحث بالاسم، الرقم الوظيفي، الشعبة أو العنوان..."
                       autocomplete="off"
                       oninput="window.app.searchMailPerson(this.value)"
                       style="padding: 0.75rem 2.4rem 0.75rem 1rem; font-weight: 700; width: 100%; border-color: rgba(168, 85, 247, 0.45);">
                <span style="position:absolute; right:0.85rem; top:50%; transform:translateY(-50%); font-size:1.1rem; pointer-events:none; opacity:0.7;">👤</span>
              </div>

              <!-- بطاقة الموظف المختار -->
              <div id="mailSelectedPersonBadge" style="display:none; margin-top:0.6rem; background:linear-gradient(135deg, rgba(168,85,247,0.15), rgba(99,102,241,0.15)); border:1.5px solid #a855f7; border-radius:14px; padding:0.75rem 1.1rem; align-items:center; justify-content:space-between; gap:0.75rem;">
                <div style="display:flex; align-items:center; gap:0.6rem; min-width:0;">
                  <span style="font-size:1.3rem;">✅</span>
                  <div style="min-width:0;">
                    <div id="mailSelectedPersonTitle" style="font-weight:800; font-size:0.95rem; color:#f8fafc; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;"></div>
                    <div id="mailSelectedPersonSub" style="font-size:0.8rem; color:#cbd5e1; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; margin-top: 0.15rem;"></div>
                  </div>
                </div>
                <button type="button" onclick="window.app.clearSelectedMailPerson()" class="btn btn-sm" style="background:rgba(239,68,68,0.15); color:#fca5a5; border:1px solid rgba(239,68,68,0.4); border-radius:8px; padding:0.35rem 0.8rem; font-size:0.78rem; font-weight:800; cursor:pointer; flex-shrink:0;">
                  ✕ تغيير المستلم
                </button>
              </div>

              <!-- القائمة المنسدلة للنتائج الذكية -->
              <div id="mailPersonSearchResults"
                   style="display:none; position:absolute; top:100%; left:0; right:0; z-index:1000; background:rgba(15,23,42,0.98); border:1.5px solid rgba(168,85,247,0.45); box-shadow:0 14px 36px rgba(0,0,0,0.6); border-radius:14px; max-height:240px; overflow-y:auto; margin-top:6px; padding:0.5rem; backdrop-filter:blur(20px);">
              </div>
            </div>
          </div>

          <!-- حقول التوثيق والصادر الرسمي المعتمد -->
          <div id="mailOfficialFieldsContainer" class="mail-card-section" style="display:none; background:linear-gradient(135deg, rgba(245,158,11,0.08), rgba(217,119,6,0.12)); border:1.5px solid rgba(245,158,11,0.38) !important;">
            <div style="font-weight:900; font-size:0.94rem; color:#fbbf24; display:flex; align-items:center; gap:0.5rem; margin-bottom: 1.1rem; border-bottom: 1px solid rgba(245,158,11,0.2); padding-bottom: 0.65rem;">
              <span>🏛️</span> <span>بيانات الصادر والتوثيق الرسمي المعتمد</span>
            </div>

            <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:1rem; margin-bottom: 1rem;">
              <div>
                <label style="font-weight:700; font-size:0.86rem; color:#f1f5f9; display:block; margin-bottom:0.4rem;">
                  رقم الصادر المعتمد <span style="color:#ef4444;">*</span>
                </label>
                <input type="text" id="mailRefNumber" name="refNumber" class="form-control mail-glass-ctrl"
                       placeholder="مثال: ص / إنتاج / 102"
                       style="font-size:0.9rem; font-weight:700; padding: 0.7rem 0.95rem; border-color: rgba(245,158,11,0.35);">
              </div>
              <div>
                <label style="font-weight:700; font-size:0.86rem; color:#f1f5f9; display:block; margin-bottom:0.4rem;">
                  التاريخ الرسمي للكتاب:
                </label>
                <input type="date" id="mailLetterDate" name="letterDate" class="form-control mail-glass-ctrl"
                       value="${new Date().toISOString().slice(0, 10)}"
                       style="font-size:0.9rem; font-weight:700; padding: 0.7rem 0.95rem; border-color: rgba(245,158,11,0.35);">
              </div>
              <div>
                <label style="font-weight:700; font-size:0.86rem; color:#f1f5f9; display:block; margin-bottom:0.4rem;">
                  درجة الأسبقية:
                </label>
                <select id="mailPriority" name="priority" class="form-control mail-glass-ctrl" style="font-weight:700; font-size:0.9rem; padding: 0.7rem 0.95rem; border-color: rgba(245,158,11,0.35);">
                  <option value="NORMAL" style="background:#0f172a; color:#e2e8f0;">عادي</option>
                  <option value="URGENT" style="background:#0f172a; color:#fbbf24;">عاجل ⚠️</option>
                  <option value="IMMEDIATE" style="background:#0f172a; color:#f87171;">فوري وسري 🔴</option>
                </select>
              </div>
              <div>
                <label style="font-weight:700; font-size:0.86rem; color:#f1f5f9; display:block; margin-bottom:0.4rem;">
                  درجة السرية:
                </label>
                <select id="mailClassification" name="classification" class="form-control mail-glass-ctrl" style="font-weight:700; font-size:0.9rem; padding: 0.7rem 0.95rem; border-color: rgba(245,158,11,0.35);">
                  <option value="PUBLIC" style="background:#0f172a; color:#e2e8f0;">عام (متاح للمعينين)</option>
                  <option value="CONFIDENTIAL" style="background:#0f172a; color:#fbbf24;">سري ومكتوم 🔒</option>
                </select>
              </div>
            </div>

            <!-- لوحة التوقيع الإلكتروني والختم المعتمد لمنشئ الكتاب -->
            <div style="border:1.2px solid rgba(245,158,11,0.35); border-radius:14px; padding:0.95rem 1.15rem; background:rgba(15,23,42,0.65);">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem; flex-wrap: wrap; gap: 0.5rem;">
                <label style="font-weight:800; font-size:0.86rem; color:#fbbf24; margin:0; display:flex; align-items:center; gap:0.4rem;">
                  ✍️ توقيع وختم منشئ الكتاب / المراسلة
                </label>
                <button type="button" class="btn btn-sm" onclick="window.app.applyComposeDigitalStamp()"
                        style="background:rgba(16,185,129,0.16); color:#34d399; border:1px solid rgba(16,185,129,0.45); font-size:0.78rem; font-weight:800; border-radius:8px; padding:0.35rem 0.85rem; cursor:pointer; display:inline-flex; align-items:center; gap:0.35rem;">
                  🛡️ ختم وتوقيع رسمي سريع
                </button>
              </div>
              <div style="background:#ffffff; border:1.5px solid rgba(245,158,11,0.3); border-radius:10px; overflow:hidden; position:relative;">
                <canvas id="mailComposeSignatureCanvas" width="650" height="95"
                        style="width:100%; height:95px; display:block; touch-action:none; cursor:crosshair; background:#ffffff;"></canvas>
                <div id="mailComposeSignaturePlaceholder" style="position:absolute; inset:0; display:flex; align-items:center; justify-content:center; pointer-events:none; color:#94a3b8; font-size:0.86rem; font-weight:700;">
                  ✍️ وقّع هنا باللمس أو الماوس
                </div>
              </div>
              <div style="display:flex; justify-content:space-between; align-items:center; margin-top:0.45rem;">
                <span id="mailComposeSignStatus" style="font-size:0.78rem; color:#94a3b8; font-weight:700;">لم يتم التوقيع بعد</span>
                <button type="button" onclick="window.app.clearComposeSignature()" style="background:none; border:none; color:#f87171; font-size:0.78rem; font-weight:800; cursor:pointer;">
                  ✕ مسح التوقيع
                </button>
              </div>
              <input type="hidden" id="mailComposeSignatureDataUrl" name="signatureDataUrl" value="">
              <input type="hidden" id="mailComposeStampInfo" name="stampInfo" value="">
            </div>
          </div>

          <!-- البطاقة 2: موضوع ونص البريد والقوالب السريعة -->
          <div class="mail-card-section">
            <div style="margin-bottom: 1.15rem;">
              <label style="font-weight: 700; font-size: 0.92rem; color: #f1f5f9; display: flex; align-items: center; gap: 0.4rem; margin-bottom: 0.45rem;">
                📌 موضوع البريد: <span style="color: #ef4444;">*</span>
              </label>
              <input type="text" name="subject" id="mailSubject" class="form-control mail-glass-ctrl" required
                     placeholder="أدخل موضوع البريد الداخلي بوضوح..."
                     style="font-size: 0.96rem; font-weight: 700; padding: 0.75rem 1.1rem; width: 100%;">
            </div>

            <div>
              <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 0.65rem;">
                <label style="font-weight: 700; font-size: 0.92rem; color: #f1f5f9; display: flex; align-items: center; gap: 0.4rem; margin: 0;">
                  📝 نص ومحتوى البريد: <span style="color: #ef4444;">*</span>
                </label>
                <div style="display: flex; gap: 0.35rem; flex-wrap: wrap; align-items: center;">
                  <span style="font-size: 0.76rem; color: #94a3b8; margin-left: 0.2rem;">قوالب سريعة:</span>
                  <button type="button" class="btn-glass-pill" onclick="window.app.insertComposeMailTemplate('official')" title="إدراج نموذج كتاب رسمي">📋 كتاب رسمي</button>
                  <button type="button" class="btn-glass-pill" onclick="window.app.insertComposeMailTemplate('memo')" title="إدراج نموذج مطالعة فنية">⚡ مطالعة فنية</button>
                  <button type="button" class="btn-glass-pill" onclick="window.app.insertComposeMailTemplate('coordination')" title="إدراج نموذج طلب معلومات وتنسيق">📋 مذكرة تنسيق</button>
                  <button type="button" class="btn-glass-pill" onclick="window.app.insertComposeMailTemplate('clear')" title="تفريغ النص" style="color: #fca5a5; border-color: rgba(239, 68, 68, 0.35);">🧹 مسح</button>
                </div>
              </div>
              <textarea name="body" id="mailBody" class="form-control mail-glass-ctrl" rows="7" required
                        placeholder="اكتب نص وتفاصيل البريد الداخلي هنا..."
                        style="font-size: 0.94rem; line-height: 1.65; resize: vertical; min-height: 140px; padding: 0.9rem 1.15rem; width: 100%;"></textarea>
            </div>
          </div>

          <!-- البطاقة 3: المرفقات مع السحب والإفلات -->
          <div class="mail-card-section">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
              <label style="font-weight: 700; font-size: 0.92rem; color: #f1f5f9; display: flex; align-items: center; gap: 0.4rem; margin: 0;">
                <span>📎 المرفقات (صور، ملفات PDF، مستندات)</span>
              </label>
              <span id="mailAttachmentCountBadge" style="font-size: 0.8rem; color: #38bdf8; font-weight: 800; background: rgba(56,189,248,0.15); padding: 0.2rem 0.6rem; border-radius: 12px; border: 1px solid rgba(56,189,248,0.3);"></span>
            </div>

            <!-- منطقة السحب والإفلات الزجاجية التفاعلية -->
            <div id="mailDropZone"
                 style="border: 2px dashed rgba(56, 189, 248, 0.4); background: linear-gradient(135deg, rgba(14, 165, 233, 0.06) 0%, rgba(99, 102, 241, 0.04) 100%); border-radius: 16px; padding: 1.6rem 1.2rem; text-align: center; cursor: pointer; transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);"
                 onclick="document.getElementById('mailAttachmentsInput').click()"
                 ondragover="event.preventDefault(); this.style.borderColor='#38bdf8'; this.style.background='rgba(56, 189, 248, 0.15)'; this.style.transform='scale(1.01)';"
                 ondragleave="event.preventDefault(); this.style.borderColor='rgba(56, 189, 248, 0.4)'; this.style.background='linear-gradient(135deg, rgba(14, 165, 233, 0.06) 0%, rgba(99, 102, 241, 0.04) 100%)'; this.style.transform='scale(1)';"
                 ondrop="window.app.handleMailFileDrop(event)">
              <div style="font-size: 2.5rem; margin-bottom: 0.4rem;">📂</div>
              <div style="font-weight: 800; font-size: 1rem; color: #38bdf8; margin-bottom: 0.25rem;">
                اسحب وأفلت الملفات أو الصور هنا
              </div>
              <div style="font-size: 0.82rem; color: #94a3b8;">
                يدعم ملفات PDF، صور JPG/PNG، ومستندات Word/Excel (أو انقر للتصفح المباشر من جهازك)
              </div>
              <input type="file" id="mailAttachmentsInput" multiple accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx"
                     style="display:none;" onchange="window.app.handleMailFileInputChange(this)">
            </div>

            <!-- معاينة المرفقات المحملة -->
            <div id="mailAttachmentsPreview" style="margin-top:0.85rem; display:flex; flex-wrap:wrap; gap:0.65rem;"></div>
          </div>

          <!-- شريط أزرار الإجراءات السفلي الزجاجي -->
          <div style="display: flex; gap: 0.85rem; justify-content: flex-end; align-items: center; padding-top: 0.8rem; border-top: 1.2px solid rgba(255, 255, 255, 0.1);">
            <button type="button" onclick="window.app.closeComposeMailModal()" class="btn btn-outline"
                    style="background: rgba(255, 255, 255, 0.07); border: 1.2px solid rgba(255, 255, 255, 0.2); color: #cbd5e1; border-radius: 12px; padding: 0.65rem 1.6rem; font-weight: 700; font-size: 0.94rem; cursor: pointer; transition: all 0.2s;">
              إلغاء
            </button>
            <button type="submit" class="btn btn-glass-primary"
                    style="background: linear-gradient(135deg, #0284c7 0%, #0369a1 50%, #075985 100%); border: 1.2px solid rgba(56, 189, 248, 0.45); color: #ffffff; border-radius: 12px; padding: 0.65rem 2rem; font-weight: 800; font-size: 0.96rem; display: inline-flex; align-items: center; gap: 0.6rem; box-shadow: 0 4px 18px rgba(2, 132, 199, 0.45), inset 0 1px 1px rgba(255, 255, 255, 0.35); cursor: pointer; transition: all 0.2s;">
              <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" style="transform:rotate(180deg)">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
              <span>إرسال البريد</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- بيانات السياق للاستخدام لاحقاً -->
    <script>
      if (!window._mailContext) window._mailContext = {};
      window._mailContext['${context.level}_${context.id || 'dept'}'] = ${JSON.stringify(context)};
    </script>
  `;
}

// ─── نافذة عرض البريد الزجاجية فائقة الدقة والاتساع ───────────────────────────
function renderMailViewerModal() {
  return `
    <div id="mailViewerModal" style="display:none; position:fixed; inset:0; z-index:9999; background:rgba(0,0,0,0.78); backdrop-filter:blur(12px); padding:1rem; overflow-y:scroll; scrollbar-width:thin; scrollbar-color:var(--md-sys-color-primary) rgba(0,0,0,0.3);"
         onclick="if(event.target===this) window.app.closeMailViewer()">
      <style>
        #mailViewerModal::-webkit-scrollbar { width: 12px; }
        #mailViewerModal::-webkit-scrollbar-track { background: rgba(0,0,0,0.3); border-radius: 8px; }
        #mailViewerModal::-webkit-scrollbar-thumb { background: linear-gradient(180deg, var(--md-sys-color-primary), #0284c7); border-radius: 8px; border: 2px solid rgba(0,0,0,0.2); }
        #mailViewerModal::-webkit-scrollbar-thumb:hover { background: #0284c7; }
      </style>
      <div style="background:var(--md-sys-color-surface); border:1.5px solid var(--md-sys-color-surface-variant); border-radius:var(--radius-lg); max-width:1200px; width:95%; margin:1rem auto 5rem auto; box-shadow:0 32px 110px rgba(0,0,0,0.5); overflow:hidden;">
        <div id="mailViewerContent" style="padding:0;">
          <!-- يُملأ ديناميكياً -->
        </div>
      </div>
    </div>

    <!-- عارض الصور الفوري (Lightbox) -->
    <div id="mailImageLightboxModal" style="display:none; position:fixed; inset:0; z-index:10001; background:rgba(0,0,0,0.92); backdrop-filter:blur(12px); padding:1rem; align-items:center; justify-content:center; flex-direction:column;"
         onclick="if(event.target===this) window.app.closeMailImageLightbox()">
      <div style="position:absolute; top:1.2rem; right:1.5rem; display:flex; align-items:center; gap:1rem; z-index:10002;">
        <span id="mailLightboxTitle" style="color:white; font-weight:800; font-size:0.95rem; background:rgba(0,0,0,0.5); padding:0.35rem 0.9rem; border-radius:999px; border:1px solid rgba(255,255,255,0.2);"></span>
        <button onclick="window.app.closeMailImageLightbox()" style="background:rgba(255,255,255,0.15); border:none; color:white; font-size:1.6rem; cursor:pointer; width:42px; height:42px; border-radius:50%; display:flex; align-items:center; justify-content:center; transition:background 0.2s;">✕</button>
      </div>
      <img id="mailLightboxImage" src="" alt="صورة مكبرة" style="max-width:94vw; max-height:88vh; border-radius:10px; box-shadow:0 12px 48px rgba(0,0,0,0.6); object-fit:contain; transition:transform 0.2s ease;">
    </div>
  `;
}

// ─── نافذة الرد ──────────────────────────────────────────────────────────────
function renderMailReplyModal() {
  return `
    <div id="mailReplyModal" style="display:none; position:fixed; inset:0; z-index:10000; background:rgba(3,7,18,0.85); backdrop-filter:blur(14px); padding:1rem; overflow-y:scroll; scrollbar-width:thin; scrollbar-color:#a855f7 rgba(15,23,42,0.6);"
         onclick="if(event.target===this) window.app.closeMailReplyModal()">
      <style>
        #mailReplyModal::-webkit-scrollbar { width: 10px; }
        #mailReplyModal::-webkit-scrollbar-track { background: rgba(10, 18, 36, 0.7); border-radius: 8px; }
        #mailReplyModal::-webkit-scrollbar-thumb { background: linear-gradient(180deg, #a855f7, #7c3aed); border-radius: 8px; border: 2px solid rgba(15, 23, 42, 0.4); }
      </style>
      <div style="background:rgba(11,20,42,0.96); border:1.2px solid rgba(168,85,247,0.38); border-radius:22px; max-width:680px; width:95vw; margin:3rem auto; box-shadow:0 24px 64px rgba(0,0,0,0.7), 0 0 25px rgba(168,85,247,0.15); overflow:hidden; color:#ffffff;">
        <div style="background:linear-gradient(135deg,rgba(124,58,237,0.25),rgba(15,23,42,0.9)); padding:1.25rem 1.6rem; border-bottom:1.2px solid rgba(168,85,247,0.3); display:flex; justify-content:space-between; align-items:center;">
          <h4 style="margin:0; font-weight:900; color:#c084fc; font-size:1.1rem; display:flex; align-items:center; gap:0.5rem;">
            <span>↩</span> <span>الرد على البريد الداخلي</span>
          </h4>
          <button onclick="window.app.closeMailReplyModal()" style="background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.15); border-radius:8px; width:32px; height:32px; cursor:pointer; font-size:1rem; color:#94a3b8; display:flex; align-items:center; justify-content:center;">✕</button>
        </div>
        <div style="padding:1.6rem;">
          <textarea id="mailReplyBody" class="form-control" rows="5" placeholder="اكتب ردك وملاحظاتك الرسمية هنا..."
                    style="font-size:0.94rem; resize:vertical; min-height:120px; margin-bottom:1.35rem; background:rgba(8,15,30,0.75); border:1.2px solid rgba(168,85,247,0.35); border-radius:12px; color:#ffffff; padding:0.85rem 1.1rem; line-height:1.6;"></textarea>
          <input type="hidden" id="mailReplyTargetId">
          <div style="display:flex; gap:0.75rem; justify-content:flex-end;">
            <button onclick="window.app.closeMailReplyModal()" class="btn btn-outline" style="background:rgba(255,255,255,0.06); border:1.2px solid rgba(255,255,255,0.2); color:#cbd5e1; border-radius:10px; padding:0.6rem 1.4rem; font-weight:700;">إلغاء</button>
            <button onclick="window.app.submitMailReply()" class="btn btn-glass-primary" style="font-weight:800; background:linear-gradient(135deg,#7c3aed,#9333ea); border:1.2px solid rgba(168,85,247,0.5); border-radius:10px; padding:0.6rem 1.8rem; box-shadow:0 4px 16px rgba(124,58,237,0.4);">
              ↩ إرسال الرد
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ─── نافذة إضافة إحالة وهامش رسمي وتوجيه ────────────────────────────────────
function renderMailEndorsementModal() {
  const db = (window.store && typeof window.store.getDb === 'function') ? window.store.getDb() : {};
  const sections = db.sections || [];

  return `
    <div id="mailEndorsementModal" style="display:none; position:fixed; inset:0; z-index:10000; background:rgba(3,7,18,0.85); backdrop-filter:blur(14px); padding:1rem; overflow-y:scroll; scrollbar-width:thin; scrollbar-color:#f59e0b rgba(15,23,42,0.6);"
         onclick="if(event.target===this) window.app.closeMailEndorsementModal()">
      <style>
        #mailEndorsementModal::-webkit-scrollbar { width: 10px; }
        #mailEndorsementModal::-webkit-scrollbar-track { background: rgba(10, 18, 36, 0.7); border-radius: 8px; }
        #mailEndorsementModal::-webkit-scrollbar-thumb { background: linear-gradient(180deg, #f59e0b, #d97706); border-radius: 8px; border: 2px solid rgba(15, 23, 42, 0.4); }
      </style>
      <div style="background:rgba(11,20,42,0.96); border:1.2px solid rgba(245,158,11,0.38); border-radius:22px; max-width:760px; width:95vw; margin:2rem auto 4rem auto; box-shadow:0 24px 64px rgba(0,0,0,0.7), 0 0 25px rgba(245,158,11,0.15); overflow:hidden; color:#ffffff;">
        <!-- رأس النافذة -->
        <div style="background:linear-gradient(135deg,rgba(245,158,11,0.25),rgba(15,23,42,0.9)); padding:1.25rem 1.6rem; border-bottom:1.2px solid rgba(245,158,11,0.3); display:flex; justify-content:space-between; align-items:center;">
          <h4 style="margin:0; font-weight:900; color:#fbbf24; font-size:1.12rem; display:flex; align-items:center; gap:0.5rem;">
            <span>✍️</span> <span>إضافة إحالة وهامش وتوجيه رسمي (Workflow Endorsement)</span>
          </h4>
          <button onclick="window.app.closeMailEndorsementModal()" style="background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.15); border-radius:8px; width:32px; height:32px; cursor:pointer; font-size:1rem; color:#94a3b8; display:flex; align-items:center; justify-content:center;">✕</button>
        </div>

        <form id="mailEndorsementForm" onsubmit="window.app.submitMailEndorsement(event)" style="padding:1.5rem; display:flex; flex-direction:column; gap:1.1rem;">
          <input type="hidden" id="mailEndorsementTargetMailId" value="">

          <!-- توجيه الإحالة إلى -->
          <div>
            <label style="font-weight:800; font-size:0.88rem; color:var(--md-sys-color-on-surface); display:block; margin-bottom:0.4rem;">
              🎯 إحالة وتوجيه إلى
            </label>
            <div style="display:grid; grid-template-columns:1fr 1.5fr; gap:0.5rem;">
              <select id="mailEndorsementToLevel" class="form-control" onchange="window.app.updateEndorsementTargetOptions()" style="font-weight:700;">
                <option value="section">🏢 شعبة محددة</option>
                <option value="station">🛢️ محطة ميدانية</option>
                <option value="department">🏛️ رئاسة القسم</option>
                <option value="unit">📋 وحدة إدارة القسم</option>
              </select>
              <select id="mailEndorsementToTargetId" class="form-control" style="font-weight:700;">
                ${sections.map(s => `<option value="${s.id}" data-name="${s.name}">${s.name}</option>`).join('')}
              </select>
            </div>
          </div>

          <!-- الإجراء المطلوب -->
          <div>
            <label style="font-weight:800; font-size:0.88rem; color:var(--md-sys-color-on-surface); display:block; margin-bottom:0.4rem;">
              ⚡ الإجراء والتوجيه المطلوب
            </label>
            <select id="mailEndorsementActionType" class="form-control" style="font-weight:700;">
              <option value="FOR_ACTION">لإجراء اللازم والعمل بموجبه وإعلامنا</option>
              <option value="FOR_INFO">للتفضل بالاطلاع والمتابعة</option>
              <option value="FOR_FEEDBACK">لبيان الرأي والمطالعة الفنية العاجلة</option>
              <option value="FOR_APPROVAL">للتأييد والمصادقة والاعتماد</option>
            </select>
          </div>

          <!-- نص الهامش الإداري -->
          <div>
            <label style="font-weight:800; font-size:0.88rem; color:var(--md-sys-color-on-surface); display:block; margin-bottom:0.4rem;">
              📝 نص الهامش الإداري والتوجيه <span style="color:#ef4444;">*</span>
            </label>
            <textarea id="mailEndorsementNote" class="form-control" rows="3" required
                      placeholder="اكتب التوجيه أو الهامش الإداري هنا..."
                      style="font-size:0.92rem; resize:vertical; min-height:85px;"></textarea>
          </div>

          <!-- لوحة توقيع وختم المسؤول المُحيل -->
          <div style="border:1.5px solid var(--md-sys-color-surface-variant); border-radius:8px; padding:0.9rem; background:rgba(0,0,0,0.02);">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.4rem;">
              <label style="font-weight:800; font-size:0.82rem; color:#b45309; margin:0;">
                ✍️ توقيع وختم المسؤول المُحيل
              </label>
              <button type="button" class="btn btn-sm" onclick="window.app.applyEndorsementDigitalStamp()"
                      style="background:rgba(16,185,129,0.12); color:#059669; border:1px solid rgba(16,185,129,0.4); font-size:0.75rem; font-weight:800; border-radius:6px; cursor:pointer;">
                🛡️ ختم وتوقيع رسمي سريع
              </button>
            </div>
            <div style="background:#ffffff; border:1px solid #cbd5e1; border-radius:6px; overflow:hidden; position:relative;">
              <canvas id="mailEndorsementCanvas" width="550" height="95"
                      style="width:100%; height:95px; display:block; touch-action:none; cursor:crosshair; background:#ffffff;"></canvas>
              <div id="mailEndorsementPlaceholder" style="position:absolute; inset:0; display:flex; align-items:center; justify-content:center; pointer-events:none; color:#94a3b8; font-size:0.82rem; font-weight:700;">
                ✍️ ارسم التوقيع هنا بالإصبع أو الماوس
              </div>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:0.3rem;">
              <span id="mailEndorsementSignStatus" style="font-size:0.72rem; color:var(--md-sys-color-outline); font-weight:700;">لم يتم التوقيع بعد</span>
              <button type="button" onclick="window.app.clearEndorsementSignature()" style="background:none; border:none; color:#ef4444; font-size:0.72rem; font-weight:800; cursor:pointer;">
                ✕ مسح التوقيع
              </button>
            </div>
            <input type="hidden" id="mailEndorsementSignatureDataUrl" value="">
            <input type="hidden" id="mailEndorsementStampInfo" value="">
          </div>

          <!-- الأزرار -->
          <div style="display:flex; gap:0.75rem; justify-content:flex-end; padding-top:0.5rem; border-top:1px solid var(--md-sys-color-surface-variant);">
            <button type="button" onclick="window.app.closeMailEndorsementModal()" class="btn btn-outline" style="font-weight:700;">إلغاء</button>
            <button type="submit" class="btn btn-glass-primary" style="font-weight:800; background:linear-gradient(135deg,#d97706,#b45309);">
              <span>✍️ اعتماد وإرسال الإحالة الرسمية</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  `;
}

// ─── محتوى عارض البريد الزجاجي فائق العرض والدقة ──────────────────────────────
function buildMailViewerContent(mailId) {
  const db = window.store.getDb();
  const user = window.auth.getCurrentUser();
  if (!db.mailSystem || !db.mailSystem.mails) return '<div style="padding:2rem;text-align:center;">⚠️ لا يوجد بريد</div>';

  const mail = db.mailSystem.mails.find(m => m.id === mailId);
  if (!mail) return '<div style="padding:2rem;text-align:center;">⚠️ الرسالة غير موجودة</div>';

  // تحديد كمقروءة
  markMailRead(mailId, user.id);

  // 🔐 دالة تهريب HTML المحلية — تحمي من XSS في بيانات المستخدم
  const esc = (str) => {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');
  };

  const attachments = Array.isArray(mail.attachments) ? mail.attachments : [];
  const imageAttachments = attachments.filter(a => a.type && a.type.startsWith('image/'));
  const pdfAttachments = attachments.filter(a => (a.type && a.type === 'application/pdf') || (a.name && a.name.toLowerCase().endsWith('.pdf')));
  const otherAttachments = attachments.filter(a => !imageAttachments.includes(a) && !pdfAttachments.includes(a));

  const replies = Array.isArray(mail.replies) ? mail.replies : [];
  const canDeleteMail = mailCanDelete(user, mail);

  // جلب بيانات المرسل لواتساب/إيميل
  const fromUser = (db.users || []).find(u => u.id === mail.fromUserId) || {};
  const masterRec = (db.employeeMasterRecords || []).find(e => e.employeeId === fromUser.employeeId) || {};

  return `
    <!-- رأس عارض البريد الزجاجي -->
    <div style="background:linear-gradient(135deg, rgba(11,87,208,0.1) 0%, rgba(2,132,199,0.15) 100%); padding:1.5rem 2rem; border-bottom:1px solid var(--md-sys-color-surface-variant); display:flex; justify-content:space-between; align-items:flex-start; gap:1.25rem;">
      <div>
        <div style="display:flex; align-items:center; gap:0.6rem; flex-wrap:wrap; margin-bottom:0.4rem;">
          <span style="background:var(--md-sys-color-primary); color:white; font-size:0.82rem; font-weight:900; padding:0.25rem 0.8rem; border-radius:999px; box-shadow:0 2px 8px rgba(11,87,208,0.3);">
            ${esc(mail.id)}
          </span>
          <span style="background:${mail.mailType === 'public' ? 'rgba(11,87,208,0.15)' : 'rgba(124,58,237,0.15)'}; color:${mail.mailType === 'public' ? 'var(--md-sys-color-primary)' : '#7c3aed'}; font-size:0.8rem; font-weight:800; padding:0.2rem 0.7rem; border-radius:999px; border:1px solid ${mail.mailType === 'public' ? 'rgba(11,87,208,0.3)' : 'rgba(124,58,237,0.3)'};">
            ${mail.mailType === 'public' ? '📢 بريد عام' : '🔒 بريد خاص'}
          </span>
        </div>
        <h3 style="margin:0; font-weight:900; color:var(--md-sys-color-on-surface); font-size:1.35rem; line-height:1.4;">
          ${esc(mail.subject || '(بدون موضوع)')}
        </h3>
      </div>
      <button onclick="window.app.closeMailViewer()" style="background:var(--md-sys-color-surface-variant); border:none; border-radius:50%; width:38px; height:38px; display:flex; align-items:center; justify-content:center; cursor:pointer; font-size:1.3rem; color:var(--md-sys-color-outline); flex-shrink:0; transition:all 0.2s;">✕</button>
    </div>

    <!-- شريط معلومات المرسل والمستقبل -->
    <div style="padding:1.1rem 2rem; border-bottom:1px solid var(--md-sys-color-surface-variant); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem; background:rgba(0,0,0,0.02);">
      <div style="display:flex; align-items:center; gap:0.85rem;">
        <div style="width:44px; height:44px; border-radius:50%; background:linear-gradient(135deg,var(--md-sys-color-primary),#0284c7); color:white; display:flex; align-items:center; justify-content:center; font-weight:900; font-size:1.15rem; flex-shrink:0;">
          ${esc((mail.fromUserName || 'م').substring(0, 1))}
        </div>
        <div>
          <div style="font-size:0.8rem; color:var(--md-sys-color-outline);">المرسِل</div>
          <div style="font-weight:800; color:var(--md-sys-color-on-surface); font-size:0.98rem;">${esc(mail.fromUserName)}</div>
          <div style="font-size:0.78rem; color:var(--md-sys-color-outline);">${formatMailDate(mail.timestamp)}</div>
        </div>
      </div>
      <div style="text-align:left; background:var(--md-sys-color-surface-variant); padding:0.5rem 1rem; border-radius:var(--radius-md);">
        <div style="font-size:0.75rem; color:var(--md-sys-color-outline);">الموجَّه إليه</div>
        <div style="font-weight:800; color:var(--md-sys-color-primary); font-size:0.92rem;">${esc(mail.toTargetName || 'الجميع')}</div>
      </div>
    </div>


    <!-- محتوى نص الرسالة -->
    <div style="padding:2rem; background:var(--md-sys-color-surface);">

      <!-- ترويسة الكتاب الرسمي المعتمدة (تظهر للكتب الرسمية والمطالعات والمذكرات) -->
      ${(mail.letterType && mail.letterType !== 'REGULAR_MAIL') || mail.refNumber ? `
        <div style="background:linear-gradient(135deg, rgba(245,158,11,0.08) 0%, rgba(217,119,6,0.12) 100%); border:1.5px solid rgba(245,158,11,0.3); border-radius:var(--radius-md); padding:1.25rem 1.5rem; margin-bottom:1.5rem; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem;">
          <div style="text-align:right;">
            <div style="font-weight:900; font-size:1.02rem; color:#b45309; display:flex; align-items:center; gap:0.4rem;">
              <span>🇮🇶</span> <span>جمهورية العراق · وزارة النفط</span>
            </div>
            <div style="font-weight:800; font-size:0.88rem; color:var(--md-sys-color-on-surface); margin-top:2px;">
              شركة نفط البصرة · قسم الإنتاج الجنوبي
            </div>
            <div style="font-size:0.78rem; color:var(--md-sys-color-outline); margin-top:2px;">
              ${mail.letterType === 'FIELD_MEMO' ? '⚡ مطالعة ميدانية / أمر تشغيلي' : (mail.letterType === 'INFO_REQUEST' ? '📋 مذكرة طلب وتنسيق معلومات' : '📜 كتاب صادر رسمي موثق')}
            </div>
          </div>
          <div style="display:flex; gap:0.6rem; flex-wrap:wrap; align-items:center;">
            ${mail.refNumber ? `
              <div style="background:var(--md-sys-color-surface); border:1.5px solid #d97706; padding:0.35rem 0.8rem; border-radius:var(--radius-sm); text-align:center; box-shadow:0 2px 6px rgba(0,0,0,0.04);">
                <div style="font-size:0.68rem; color:#b45309; font-weight:800;">العدد الصادر</div>
                <div style="font-weight:900; font-size:0.92rem; color:var(--md-sys-color-on-surface);">${esc(mail.refNumber)}</div>
              </div>
            ` : ''}
            <div style="background:var(--md-sys-color-surface); border:1.5px solid rgba(0,0,0,0.12); padding:0.35rem 0.8rem; border-radius:var(--radius-sm); text-align:center; box-shadow:0 2px 6px rgba(0,0,0,0.04);">
              <div style="font-size:0.68rem; color:var(--md-sys-color-outline); font-weight:800;">التاريخ الرسمي</div>
              <div style="font-weight:900; font-size:0.92rem; color:var(--md-sys-color-on-surface);">${esc(mail.letterDate || (mail.timestamp ? mail.timestamp.slice(0, 10) : '—'))}</div>
            </div>
            ${mail.priority === 'URGENT' ? '<span style="background:#dc2626; color:white; font-size:0.75rem; font-weight:900; padding:0.35rem 0.7rem; border-radius:999px;">عاجل ⚠️</span>' : ''}
            ${mail.priority === 'IMMEDIATE' ? '<span style="background:#7f1d1d; color:white; font-size:0.75rem; font-weight:900; padding:0.35rem 0.7rem; border-radius:999px; box-shadow:0 0 10px rgba(220,38,38,0.5);">🔴 فوري وسري جداً</span>' : ''}
            ${mail.classification === 'CONFIDENTIAL' ? '<span style="background:#1e293b; color:#f8fafc; font-size:0.75rem; font-weight:900; padding:0.35rem 0.7rem; border-radius:999px; border:1px solid #475569;">🔒 سري ومكتوم</span>' : ''}
          </div>
        </div>
      ` : ''}

      <div style="background:var(--md-sys-color-surface-variant); border-right:4px solid var(--md-sys-color-primary); border-radius:var(--radius-md); padding:1.5rem 1.75rem; line-height:1.9; color:var(--md-sys-color-on-surface); font-size:1.02rem; white-space:pre-wrap; box-shadow:inset 0 1px 3px rgba(0,0,0,0.04);">
        ${(mail.body || '').replace(/</g, '&lt;').replace(/>/g, '&gt;')}
      </div>

      <!-- توقيع وختم المنشئ المعتمد -->
      ${(mail.signatureDataUrl || mail.stampInfo || (mail.letterType && mail.letterType !== 'REGULAR_MAIL')) ? `
        <div style="display:flex; justify-content:flex-end; margin-top:1.5rem;">
          <div style="border:1.5px solid rgba(11,87,208,0.25); background:linear-gradient(135deg, rgba(11,87,208,0.03), rgba(2,132,199,0.06)); border-radius:var(--radius-md); padding:1rem 1.4rem; min-width:260px; text-align:center;">
            <div style="font-size:0.78rem; color:var(--md-sys-color-outline); font-weight:800;">توقيع واعتماد المنشئ</div>
            <div style="font-weight:900; font-size:0.98rem; color:var(--md-sys-color-on-surface); margin:0.3rem 0;">${esc(mail.fromUserName)}</div>
            <div style="font-size:0.8rem; color:var(--md-sys-color-primary); font-weight:800;">${esc(mail.fromUserTitle || mail.fromUserRole || 'مسؤول')}</div>
            ${mail.signatureDataUrl ? `
              <div style="margin-top:0.6rem; border-top:1px dashed rgba(11,87,208,0.2); padding-top:0.6rem;">
                <img src="${mail.signatureDataUrl}" alt="توقيع المنشئ" style="max-height:65px; max-width:220px; display:inline-block;">
              </div>
            ` : ''}
            ${mail.stampInfo ? `
              <div style="margin-top:0.5rem; display:inline-flex; align-items:center; gap:0.4rem; background:rgba(16,185,129,0.1); border:1px solid rgba(16,185,129,0.3); color:#059669; font-size:0.72rem; font-weight:800; padding:0.25rem 0.65rem; border-radius:999px;">
                <span>🛡️ معتمد بختم رسمي موثق</span>
              </div>
            ` : ''}
          </div>
        </div>
      ` : ''}

      <!-- ✍️ سلسلة وسجل الهوامش والإحالات الرسمية (Workflow Endorsements) -->
      ${Array.isArray(mail.endorsements) && mail.endorsements.length > 0 ? `
        <div style="margin-top:2rem; background:linear-gradient(135deg, rgba(245,158,11,0.03) 0%, rgba(217,119,6,0.07) 100%); border:1.5px solid rgba(245,158,11,0.3); border-radius:var(--radius-lg); padding:1.5rem;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.25rem; flex-wrap:wrap; gap:0.75rem;">
            <h4 style="font-weight:900; color:#b45309; margin:0; display:flex; align-items:center; gap:0.5rem; font-size:1.05rem;">
              <span>✍️</span> <span>سجل الهوامش والإحالات الرسمية المتسلسلة (${mail.endorsements.length})</span>
            </h4>
            <button onclick="window.app.openMailEndorsementModal('${mail.id}')" class="btn btn-sm btn-glass-primary" style="font-weight:800; background:linear-gradient(135deg, #d97706, #b45309); color:white; display:inline-flex; align-items:center; gap:0.4rem;">
              <span>➕</span> <span>إضافة إحالة وهامش جديد</span>
            </button>
          </div>
          
          <div style="display:flex; flex-direction:column; gap:1rem;">
            ${mail.endorsements.map((end, eIdx) => {
              let actionBadge = '';
              if (end.actionType === 'FOR_ACTION') actionBadge = '<span style="background:rgba(239,68,68,0.12); color:#dc2626; font-size:0.75rem; font-weight:800; padding:0.2rem 0.55rem; border-radius:999px;">لإجراء اللازم والعمل بموجبه</span>';
              else if (end.actionType === 'FOR_INFO') actionBadge = '<span style="background:rgba(59,130,246,0.12); color:#2563eb; font-size:0.75rem; font-weight:800; padding:0.2rem 0.55rem; border-radius:999px;">للتفضل بالاطلاع والمتابعة</span>';
              else if (end.actionType === 'FOR_FEEDBACK') actionBadge = '<span style="background:rgba(245,158,11,0.12); color:#b45309; font-size:0.75rem; font-weight:800; padding:0.2rem 0.55rem; border-radius:999px;">لبيان الرأي والمطالعة الفنية</span>';
              else actionBadge = '<span style="background:rgba(16,185,129,0.12); color:#059669; font-size:0.75rem; font-weight:800; padding:0.2rem 0.55rem; border-radius:999px;">للتأييد والمصادقة والاعتماد</span>';

              return `
                <div style="background:var(--md-sys-color-surface); border:1.5px solid rgba(245,158,11,0.25); border-right:5px solid #d97706; border-radius:var(--radius-md); padding:1.1rem 1.3rem; box-shadow:0 4px 14px rgba(0,0,0,0.04);">
                  <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:0.6rem; margin-bottom:0.6rem;">
                    <div style="display:flex; align-items:center; gap:0.5rem; flex-wrap:wrap;">
                      <span style="background:#b45309; color:white; width:24px; height:24px; border-radius:50%; display:inline-flex; align-items:center; justify-content:center; font-size:0.75rem; font-weight:900;">${eIdx + 1}</span>
                      <strong style="color:var(--md-sys-color-on-surface); font-size:0.92rem;">${esc(end.fromUserName)}</strong>
                      <span style="font-size:0.78rem; color:var(--md-sys-color-outline);">(${esc(end.fromUserTitle || end.fromUserRole || 'مسؤول')})</span>
                      <span style="color:var(--md-sys-color-outline);">← إحالة إلى:</span>
                      <strong style="color:var(--md-sys-color-primary); font-size:0.92rem;">${esc(end.toTargetName || 'الجهة المعنية')}</strong>
                    </div>
                    <div style="display:flex; align-items:center; gap:0.5rem;">
                      ${actionBadge}
                      <span style="font-size:0.75rem; color:var(--md-sys-color-outline);">${formatMailDate(end.timestamp)}</span>
                    </div>
                  </div>
                  
                  <div style="background:var(--md-sys-color-surface-variant); border-radius:6px; padding:0.8rem 1rem; font-size:0.92rem; line-height:1.7; color:var(--md-sys-color-on-surface); white-space:pre-wrap; margin-bottom:0.7rem;">
                    ${esc(end.note || '')}
                  </div>

                  <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem; font-size:0.78rem; color:var(--md-sys-color-outline);">
                    <div>
                      ${end.stampInfo ? `<span style="color:#059669; font-weight:800;">🛡️ ختم رسمي معتمد: ${esc(end.stampInfo.org || 'شركة نفط البصرة')} · ${esc(end.stampInfo.officialName || end.fromUserName)}</span>` : ''}
                    </div>
                    ${end.signatureDataUrl ? `
                      <div>
                        <img src="${end.signatureDataUrl}" alt="توقيع الإحالة" style="max-height:42px; max-width:160px; display:inline-block;">
                      </div>
                    ` : ''}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      ` : ''}

      <!-- ⏱️ المسار الإداري والتتبع الزمني (Workflow Audit Trail) -->
      <div style="margin-top:2rem; background:linear-gradient(135deg,rgba(11,87,208,0.03),rgba(2,132,199,0.05)); border:1px solid var(--md-sys-color-surface-variant); border-radius:var(--radius-lg); padding:1.25rem 1.5rem;">
        <h5 style="font-weight:900; color:var(--md-sys-color-on-surface); margin:0 0 1rem 0; font-size:0.92rem; display:flex; align-items:center; gap:0.5rem;">
          <span>⏱️</span> <span>المسار الإداري والتتبع الزمني للمعاملة (Workflow Audit Trail)</span>
        </h5>
        <div style="display:flex; flex-direction:column; gap:0.75rem; border-right:2px solid var(--md-sys-color-primary); padding-right:1.2rem; margin-right:0.5rem;">
          <div style="position:relative;">
            <span style="position:absolute; right:-1.65rem; top:2px; width:12px; height:12px; border-radius:50%; background:var(--md-sys-color-primary); border:2px solid white; box-shadow:0 0 0 2px rgba(11,87,208,0.3);"></span>
            <div style="font-weight:800; font-size:0.85rem; color:var(--md-sys-color-on-surface);">1. الصدور والإنشاء: ${esc(mail.fromUserName)} (${esc(mail.fromUserTitle || mail.fromUserRole || 'المنشئ')})</div>
            <div style="font-size:0.75rem; color:var(--md-sys-color-outline);">${formatMailDate(mail.timestamp)} · صادر إلى: <strong style="color:var(--md-sys-color-primary);">${esc(mail.toTargetName || 'الجميع')}</strong></div>
          </div>
          ${(mail.endorsements || []).map((end, idx) => `
            <div style="position:relative;">
              <span style="position:absolute; right:-1.65rem; top:2px; width:12px; height:12px; border-radius:50%; background:#d97706; border:2px solid white; box-shadow:0 0 0 2px rgba(217,119,6,0.3);"></span>
              <div style="font-weight:800; font-size:0.85rem; color:#b45309;">${idx + 2}. إحالة وهامش: ${esc(end.fromUserName)} (${esc(end.fromUserTitle || 'مسؤول')}) ➔ <strong style="color:var(--md-sys-color-primary);">${esc(end.toTargetName)}</strong></div>
              <div style="font-size:0.75rem; color:var(--md-sys-color-outline);">${formatMailDate(end.timestamp)} · ${esc(end.actionType === 'FOR_ACTION' ? 'لإجراء اللازم' : (end.actionType === 'FOR_INFO' ? 'للاطلاع' : 'للمطالعة والاعتماد'))}</div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- 📑 قسم ملفات الـ PDF (معاينة عريضة ومباشرة وتلقائية) -->
      ${pdfAttachments.length > 0 ? `
        <div style="margin-top:1.75rem; background:linear-gradient(135deg, rgba(239,68,68,0.04) 0%, rgba(220,38,38,0.08) 100%); border:1.5px solid rgba(239,68,68,0.25); border-radius:var(--radius-lg); padding:1.5rem;">
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.75rem; margin-bottom:1rem;">
            <h4 style="font-weight:900; color:#dc2626; margin:0; display:flex; align-items:center; gap:0.6rem; font-size:1.05rem;">
              <span style="display:inline-flex; align-items:center; justify-content:center; width:26px; height:26px; border-radius:8px; background:rgba(239,68,68,0.18); color:#dc2626;">
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <path d="M9 13h6"></path>
                  <path d="M9 17h3"></path>
                </svg>
              </span>
              <span>مستند PDF المرفق (${pdfAttachments.length})</span>
            </h4>
          </div>
          <div style="display:flex; flex-direction:column; gap:1.25rem;">
            ${pdfAttachments.map((pdf, pIdx) => `
              <div style="background:var(--md-sys-color-surface); border:1px solid var(--md-sys-color-surface-variant); border-radius:var(--radius-md); padding:1.2rem; box-shadow:0 4px 16px rgba(0,0,0,0.06);">
                <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.75rem; margin-bottom:0.9rem; padding-bottom:0.75rem; border-bottom:1px solid var(--md-sys-color-surface-variant);">
                  <div style="display:flex; align-items:center; gap:0.7rem; min-width:0;">
                    <span style="display:inline-flex; align-items:center; justify-content:center; width:36px; height:36px; border-radius:10px; background:linear-gradient(135deg, rgba(239,68,68,0.15), rgba(220,38,38,0.25)); color:#dc2626; flex-shrink:0;">
                      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <path d="M9 13h6"></path>
                        <path d="M9 17h3"></path>
                      </svg>
                    </span>
                    <div style="min-width:0;">
                      <div style="font-weight:900; font-size:1rem; color:var(--md-sys-color-on-surface); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                        ${esc(pdf.name)}
                      </div>
                      <div style="font-size:0.78rem; color:var(--md-sys-color-outline);">
                        عرض مباشر فائق الدقة
                      </div>
                    </div>
                  </div>
                  <div style="display:flex; gap:0.5rem; align-items:center;">
                    <button onclick="window.open('${pdf.dataUrl}', '_blank')" class="btn btn-sm btn-glass-primary" style="font-weight:800; font-size:0.8rem; display:inline-flex; align-items:center; gap:0.4rem;">
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                      <span>فتح في لسان جديد</span>
                    </button>
                    <a href="${pdf.dataUrl}" download="${esc(pdf.name)}" class="btn btn-sm btn-outline" style="font-weight:800; font-size:0.8rem; text-decoration:none; display:inline-flex; align-items:center; gap:0.4rem;">
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                      <span>تنزيل</span>
                    </a>
                  </div>
                </div>
                <!-- إطار عرض الـ PDF المباشر والتلقائي عالي الدقة -->
                <div style="width:100%; border-radius:8px; overflow:hidden; border:1.5px solid var(--md-sys-color-surface-variant); box-shadow:0 6px 24px rgba(0,0,0,0.15);">
                  <iframe src="${pdf.dataUrl}" style="width:100%; height:750px; min-height:600px; border:none; display:block; background:#525659;" title="${esc(pdf.name)}"></iframe>
                </div>
              </div>
            `).join('')}

          </div>
        </div>
      ` : ''}

      <!-- 🖼️ قسم معرض الصور المرفقة (مع تكبير Lightbox) -->
      ${imageAttachments.length > 0 ? `
        <div style="margin-top:1.75rem; background:linear-gradient(135deg, rgba(11,87,208,0.04) 0%, rgba(2,132,199,0.08) 100%); border:1.5px solid rgba(11,87,208,0.2); border-radius:var(--radius-lg); padding:1.5rem;">
          <h4 style="font-weight:900; color:var(--md-sys-color-primary); margin:0 0 1rem 0; display:flex; align-items:center; gap:0.6rem; font-size:1.05rem;">
            <span style="display:inline-flex; align-items:center; justify-content:center; width:26px; height:26px; border-radius:8px; background:rgba(11,87,208,0.18); color:var(--md-sys-color-primary);">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21 15 16 10 5 21"></polyline>
              </svg>
            </span>
            <span>معرض الصور المرفقة (${imageAttachments.length})</span>
          </h4>
          <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(200px, 1fr)); gap:1.2rem;">
            ${imageAttachments.map((img, imgIdx) => `
              <div style="background:var(--md-sys-color-surface); border:1.5px solid var(--md-sys-color-surface-variant); border-radius:var(--radius-md); overflow:hidden; box-shadow:0 4px 14px rgba(0,0,0,0.06); transition:all 0.2s ease; cursor:pointer;"
                   onmouseover="this.style.transform='translateY(-3px)'; this.style.borderColor='var(--md-sys-color-primary)';"
                   onmouseout="this.style.transform=''; this.style.borderColor='var(--md-sys-color-surface-variant)';"
                   onclick="window.app.openMailImageLightbox('${img.dataUrl}', '${(img.name || 'صورة مرفقة').replace(/'/g, "\\'")}')">
                <div style="height:150px; background:#f0f2f5; overflow:hidden; position:relative;">
                  <img src="${img.dataUrl}" alt="${img.name}" style="width:100%; height:100%; object-fit:cover; display:block;">
                  <div style="position:absolute; inset:0; background:rgba(0,0,0,0.35); opacity:0; transition:opacity 0.2s; display:flex; align-items:center; justify-content:center; color:white; font-weight:800; font-size:0.88rem;"
                       onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0'">
                    🔍 انقر للتكبير
                  </div>
                </div>
                <div style="padding:0.65rem 0.85rem;">
                  <div style="font-size:0.85rem; font-weight:800; color:var(--md-sys-color-on-surface); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                    ${img.name || `صورة ${imgIdx + 1}`}
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <!-- 📁 ملفات ومستندات أخرى -->
      ${otherAttachments.length > 0 ? `
        <div style="margin-top:1.5rem;">
          <h5 style="font-weight:800; color:var(--md-sys-color-outline); margin:0 0 0.6rem 0; font-size:0.9rem; display:flex; align-items:center; gap:0.5rem;">
            <span style="display:inline-flex; align-items:center; justify-content:center; width:22px; height:22px; border-radius:6px; background:rgba(124,58,237,0.15); color:#7c3aed;">
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
              </svg>
            </span>
            <span>مستندات وملفات إضافية (${otherAttachments.length})</span>
          </h5>
          <div style="display:flex; flex-wrap:wrap; gap:0.6rem;">
            ${otherAttachments.map(att => {
              const isW = (att.name && /\.(doc|docx)$/i.test(att.name)) || (att.type && att.type.includes('word'));
              const isX = (att.name && /\.(xls|xlsx|csv)$/i.test(att.name)) || (att.type && att.type.includes('sheet'));
              return `
                <div style="background:var(--md-sys-color-surface-variant); border-radius:var(--radius-md); padding:0.55rem 0.95rem; display:flex; align-items:center; gap:0.6rem; border:1px solid rgba(0,0,0,0.06);">
                  <span style="display:inline-flex; align-items:center; justify-content:center; width:24px; height:24px; border-radius:6px; background:${isW ? 'rgba(37,99,235,0.15)' : (isX ? 'rgba(16,185,129,0.15)' : 'rgba(124,58,237,0.15)')}; color:${isW ? '#2563eb' : (isX ? '#059669' : '#7c3aed')}; flex-shrink:0;">
                    ${isW ? `
                      <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <path d="M8 13l1.5 4 1.5-4 1.5 4 1.5-4"></path>
                      </svg>
                    ` : (isX ? `
                      <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="3" y1="9" x2="21" y2="9"></line>
                        <line x1="3" y1="15" x2="21" y2="15"></line>
                        <line x1="9" y1="3" x2="9" y2="21"></line>
                      </svg>
                    ` : `
                      <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
                      </svg>
                    `)}
                  </span>
                  <span style="font-weight:700; font-size:0.88rem; color:var(--md-sys-color-on-surface);">${att.name}</span>
                  <a href="${att.dataUrl}" download="${att.name}" style="color:var(--md-sys-color-primary); font-size:0.82rem; font-weight:800; text-decoration:none; margin-right:0.4rem; display:inline-flex; align-items:center; gap:0.25rem;">
                    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                    <span>تحميل</span>
                  </a>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      ` : ''}

      <!-- أزرار وعلامات التفاعل الزجاجية -->
      <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:0.75rem; margin-top:2rem; padding-top:1.5rem; border-top:1px solid var(--md-sys-color-surface-variant);">
        <div style="display:flex; align-items:center; flex-wrap:wrap; gap:0.75rem;">
          <!-- زر إضافة هامش وإحالة رسمية -->
          <button onclick="window.app.openMailEndorsementModal('${mail.id}')" class="btn btn-glass-primary" style="font-weight:800; font-size:0.92rem; display:flex; align-items:center; gap:0.5rem; background:linear-gradient(135deg,#d97706,#b45309); padding:0.6rem 1.3rem;">
            <span>✍️</span> <span>إضافة هامش وإحالة رسمية</span>
          </button>

          <!-- زر الرد الأساسي -->
          <button onclick="window.app.openMailReplyModal('${mail.id}')" class="btn btn-glass-primary" style="font-weight:800; font-size:0.92rem; display:flex; align-items:center; gap:0.5rem; background:linear-gradient(135deg,#7c3aed,#9333ea); padding:0.6rem 1.4rem;">
            <span>↩</span> <span>الرد على البريد</span>
          </button>

          <!-- علامة واتساب أيقونية متوهجة -->
          ${masterRec.phone ? `
            <button class="btn-circle-whatsapp btn-circle-lg-whatsapp btn-action-whatsapp"
                    onclick="openWhatsAppForMail(${JSON.stringify({id:mail.id,subject:mail.subject,body:mail.body,timestamp:mail.timestamp,fromUserName:mail.fromUserName}).replace(/"/g,'&quot;')}, '${masterRec.phone}')"
                    title="إرسال إشعار عبر واتساب (${masterRec.phone})">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="#ffffff">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
              </svg>
            </button>
          ` : ''}

          <!-- علامة إيميل أيقونية متوهجة -->
          ${masterRec.emailPersonal ? `
            <button class="btn-circle-email btn-circle-lg-email btn-action-email"
                    onclick="openEmailForMail(${JSON.stringify({id:mail.id,subject:mail.subject,body:mail.body,timestamp:mail.timestamp,fromUserName:mail.fromUserName}).replace(/"/g,'&quot;')}, '${masterRec.emailPersonal}')"
                    title="إرسال عبر البريد الإلكتروني (${masterRec.emailPersonal})">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="3"></rect>
                <path d="M22 7l-10 7L2 7"></path>
              </svg>
            </button>
          ` : ''}
        </div>

        <!-- زر الحذف -->
        ${canDeleteMail ? `
          <button onclick="if(confirm('هل أنت متأكد من رغبتك في حذف هذا البريد نهائياً؟')) { window.app.deleteMailItem('${mail.id}'); }"
                  class="btn btn-outline" style="font-weight:800; font-size:0.88rem; display:flex; align-items:center; gap:0.4rem; border-color:#ef4444; color:#ef4444;">
            <span>🗑</span> <span>حذف البريد</span>
          </button>
        ` : ''}
      </div>

      <!-- قسم الردود المتبادلة -->
      ${replies.length > 0 ? `
        <div style="margin-top:1.75rem; padding-top:1.5rem; border-top:1px solid var(--md-sys-color-surface-variant);">
          <h4 style="font-weight:900; color:var(--md-sys-color-outline); margin:0 0 1rem 0; font-size:0.98rem; display:flex; align-items:center; gap:0.4rem;">
            <span>↩</span> <span>الردود والتعليقات (${replies.length})</span>
          </h4>
          <div style="display:flex; flex-direction:column; gap:0.85rem;">
            ${replies.map(r => `
              <div style="background:linear-gradient(135deg,rgba(124,58,237,0.04),rgba(124,58,237,0.08)); border:1px solid rgba(124,58,237,0.2); border-right:4px solid #7c3aed; border-radius:var(--radius-md); padding:1rem 1.25rem;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.4rem;">
                  <span style="font-weight:900; font-size:0.92rem; color:var(--md-sys-color-on-surface);">${r.fromUserName}</span>
                  <span style="font-size:0.78rem; color:var(--md-sys-color-outline);">${formatMailDate(r.timestamp)}</span>
                </div>
                <div style="font-size:0.92rem; color:var(--md-sys-color-on-surface); line-height:1.7; white-space:pre-wrap;">
                  ${(r.body || '').replace(/</g, '&lt;').replace(/>/g, '&gt;')}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}
    </div>
  `;
}

// ─── تسجيل App Methods ────────────────────────────────────────────────────────
// يُستدعى من app.js لتسجيل وظائف البريد
function registerMailAppMethods(app) {
  if (!app) return;

  // تبديل تبويب عام/خاص
  app.setMailSubTab = function(level, id, type) {
    app['mailSubTab_' + level + '_' + id] = type;
    app.render();
  };

  // ─── مساعدة: لوحة التوقيع بالكانفاس (Touch & Mouse Pad) ──────────────────────
  let _composeSigPad = null;
  let _endorsementSigPad = null;

  function createSignaturePad(canvasId, placeholderId, statusId, hiddenDataId, hiddenStampId) {
    if (typeof document === 'undefined') return null;
    const canvas = document.getElementById(canvasId);
    if (!canvas) return null;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#0f172a';

    let isDrawing = false;
    let hasDrawn = false;

    const getPos = (e) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / (rect.width || 1);
      const scaleY = canvas.height / (rect.height || 1);
      if (e.touches && e.touches.length > 0) {
        return {
          x: (e.touches[0].clientX - rect.left) * scaleX,
          y: (e.touches[0].clientY - rect.top) * scaleY
        };
      }
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY
      };
    };

    const start = (e) => {
      if (e.cancelable) e.preventDefault();
      isDrawing = true;
      const pos = getPos(e);
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    };

    const move = (e) => {
      if (!isDrawing) return;
      if (e.cancelable) e.preventDefault();
      const pos = getPos(e);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      hasDrawn = true;
      const ph = document.getElementById(placeholderId);
      if (ph) ph.style.display = 'none';
      const st = document.getElementById(statusId);
      if (st) {
        st.textContent = '✅ تم رسم التوقيع باليد';
        st.style.color = '#059669';
      }
    };

    const end = (e) => {
      if (!isDrawing) return;
      isDrawing = false;
      if (hasDrawn) {
        const dataUrl = canvas.toDataURL('image/png');
        const hidden = document.getElementById(hiddenDataId);
        if (hidden) hidden.value = dataUrl;
      }
    };

    canvas.onmousedown = start;
    canvas.onmousemove = move;
    if (typeof window !== 'undefined') window.addEventListener('mouseup', end);

    canvas.ontouchstart = start;
    canvas.ontouchmove = move;
    canvas.ontouchend = end;

    return {
      clear: () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        hasDrawn = false;
        const ph = document.getElementById(placeholderId);
        if (ph) ph.style.display = 'flex';
        const hidden = document.getElementById(hiddenDataId);
        if (hidden) hidden.value = '';
        const hiddenStamp = document.getElementById(hiddenStampId);
        if (hiddenStamp) hiddenStamp.value = '';
        const st = document.getElementById(statusId);
        if (st) {
          st.textContent = 'لم يتم التوقيع بعد';
          st.style.color = 'var(--md-sys-color-outline)';
        }
      },
      stamp: (user) => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const w = canvas.width;
        const h = canvas.height;

        ctx.save();
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(0, 0, w, h);

        ctx.strokeStyle = '#059669';
        ctx.lineWidth = 3;
        ctx.strokeRect(10, 8, w - 20, h - 16);

        ctx.setLineDash([4, 4]);
        ctx.lineWidth = 1;
        ctx.strokeRect(15, 13, w - 30, h - 26);
        ctx.setLineDash([]);

        ctx.fillStyle = '#065f46';
        ctx.font = 'bold 12px Arial, sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText('جمهورية العراق - وزارة النفط - شركة نفط البصرة', w - 25, 28);

        ctx.fillStyle = '#047857';
        ctx.font = 'bold 11px Arial, sans-serif';
        ctx.fillText('قسم الإنتاج الجنوبي · معتمد إلكترونياً ومصدق', w - 25, 46);

        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 13px Arial, sans-serif';
        const uName = user ? (user.fullName || 'المسؤول المعتمد') : 'المسؤول المعتمد';
        const uTitle = user ? (user.jobTitle || user.role || 'مسؤول') : 'مسؤول';
        ctx.fillText(`المصادق: ${uName} (${uTitle})`, w - 25, 68);

        ctx.textAlign = 'left';
        ctx.font = '10px monospace';
        ctx.fillStyle = '#64748b';
        const now = new Date();
        ctx.fillText(`DATE: ${now.toISOString().slice(0, 10)}`, 25, 30);
        ctx.fillText(`TIME: ${now.toTimeString().slice(0, 8)}`, 25, 46);
        ctx.fillText(`CERT: BOC-SPD-${Math.random().toString(36).substring(2, 8).toUpperCase()}`, 25, 64);

        ctx.restore();

        hasDrawn = true;
        const dataUrl = canvas.toDataURL('image/png');
        const hidden = document.getElementById(hiddenDataId);
        if (hidden) hidden.value = dataUrl;
        const hiddenStamp = document.getElementById(hiddenStampId);
        if (hiddenStamp) {
          hiddenStamp.value = JSON.stringify({
            org: 'وزارة النفط - شركة نفط البصرة',
            dept: 'قسم الإنتاج الجنوبي',
            officialName: uName,
            officialRole: uTitle,
            timestamp: now.toISOString()
          });
        }
        const ph = document.getElementById(placeholderId);
        if (ph) ph.style.display = 'none';
        const st = document.getElementById(statusId);
        if (st) {
          st.textContent = '🛡️ تم اعتماد الختم والتوقيع الرقمي المعتمد';
          st.style.color = '#059669';
        }
      }
    };
  }

  // تهيئة لوحة توقيع إنشاء البريد
  app.initComposeSignatureCanvas = function() {
    _composeSigPad = createSignaturePad(
      'mailComposeSignatureCanvas',
      'mailComposeSignaturePlaceholder',
      'mailComposeSignStatus',
      'mailComposeSignatureDataUrl',
      'mailComposeStampInfo'
    );
  };

  // مسح توقيع الإنشاء
  app.clearComposeSignature = function() {
    if (_composeSigPad) _composeSigPad.clear();
  };

  // تطبيق الختم الرقمي للإنشاء
  app.applyComposeDigitalStamp = function() {
    const user = window.auth ? window.auth.getCurrentUser() : null;
    if (!_composeSigPad) app.initComposeSignatureCanvas();
    if (_composeSigPad) _composeSigPad.stamp(user);
  };

  // تغيير نوع المراسلة (عادي / رسمي / مطالعة / مذكرة)
  app.onLetterTypeChange = function(letterType) {
    const container = document.getElementById('mailOfficialFieldsContainer');
    const refInput = document.getElementById('mailRefNumber');
    if (!container) return;
    if (letterType === 'REGULAR_MAIL') {
      container.style.display = 'none';
    } else {
      container.style.display = 'flex';
      if (refInput && !refInput.value) {
        const modal = document.getElementById('mailComposeModal');
        const lvl = modal ? (modal.dataset.level || 'department') : 'department';
        const randNum = Math.floor(100 + Math.random() * 900);
        if (letterType === 'FIELD_MEMO') {
          refInput.value = `مطالعة / ${randNum}`;
        } else if (letterType === 'INFO_REQUEST') {
          refInput.value = `مذكرة / ${randNum}`;
        } else {
          if (lvl === 'section') refInput.value = `ص / شعبة / ${randNum}`;
          else if (lvl === 'station') refInput.value = `م / محطة / ${randNum}`;
          else if (lvl === 'unit') refInput.value = `مذكرة / وحدة / ${randNum}`;
          else refInput.value = `ص / إنتاج / ${randNum}`;
        }
      }
      setTimeout(() => {
        app.initComposeSignatureCanvas();
      }, 100);
    }
  };

  // إغلاق نافذة الإنشاء
  app.closeComposeMailModal = function() {
    const modal = document.getElementById('mailComposeModal');
    if (modal) modal.style.display = 'none';
  };

  // إظهار/إخفاء حقل الموجَّه
  app.toggleMailTargetField = function(mailType) {
    const targetField = document.getElementById('mailTargetField');
    if (targetField) targetField.style.display = mailType === 'private' ? 'block' : 'none';
  };

  // تحديث خيارات الموجه إليه
  app.updateMailTargetOptions = function() {
    const level = document.getElementById('mailToLevel') ? document.getElementById('mailToLevel').value : 'section';
    const stdContainer = document.getElementById('mailStandardTargetContainer');
    const personContainer = document.getElementById('mailPersonSearchContainer');
    const select = document.getElementById('mailToTargetId');
    if (!stdContainer || !personContainer || !select) return;
    const db = window.store.getDb();

    if (level === 'person') {
      stdContainer.style.display = 'none';
      personContainer.style.display = 'block';
      app.clearSelectedMailPerson();
    } else {
      stdContainer.style.display = 'block';
      personContainer.style.display = 'none';
      let options = [];
      if (level === 'section') {
        options = (db.sections || []).map(s => `<option value="${s.id}" data-name="${s.name}">${s.name}</option>`);
      } else if (level === 'unit') {
        options = (db.units || []).map(u => `<option value="${u.id}" data-name="${u.name}">${u.name}</option>`);
      } else if (level === 'station') {
        options = (db.stations || []).map(st => `<option value="${st.id}" data-name="${st.name}">${st.name}</option>`);
      } else if (level === 'department') {
        options = [`<option value="dept-south-prod" data-name="رئاسة قسم الإنتاج الجنوبي">🏛️ رئاسة قسم الإنتاج الجنوبي</option>`];
      }
      select.innerHTML = options.join('');
    }
  };

  // البحث الذكي الفوري عن المنتسبين
  app.searchMailPerson = function(query) {
    const resultsEl = document.getElementById('mailPersonSearchResults');
    if (!resultsEl) return;
    const qTokens = (query || '').trim().toLowerCase().split(/\s+/).filter(Boolean);
    if (qTokens.length === 0) {
      resultsEl.style.display = 'none';
      resultsEl.innerHTML = '';
      return;
    }

    const db = (window.store && typeof window.store.getDb === 'function') ? window.store.getDb() : {};
    const users = (db.users || []).filter(u => !u.status || u.status === 'APPROVED' || u.status === 'ACTIVE');
    const masterRecords = db.employeeMasterRecords || [];
    const sections = db.sections || [];
    const units = db.units || [];

    const matches = users.filter(u => {
      const mr = masterRecords.find(m => m.employeeId === u.employeeId) || {};
      const sec = sections.find(s => s.id === u.sectionId) || {};
      const un = units.find(unit => unit.id === u.unitId) || {};

      const fullName = (u.fullName || '').toLowerCase();
      const empId = (u.employeeId || '').toLowerCase();
      const jobTitle = (u.jobTitle || mr.jobTitle || '').toLowerCase();
      const role = (u.role || '').toLowerCase();
      const deptName = (u.department || '').toLowerCase();
      const secName = (sec.name || '').toLowerCase();
      const unName = (un.name || '').toLowerCase();

      const combined = `${fullName} ${empId} ${jobTitle} ${role} ${deptName} ${secName} ${unName}`;
      return qTokens.every(tok => combined.includes(tok));
    });

    if (matches.length === 0) {
      // 🔐 XSS: query يُهرَّب قبل الإدراج في HTML
      const escQ = (query || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
      resultsEl.innerHTML = `
        <div style="padding:0.75rem; text-align:center; color:var(--md-sys-color-outline); font-size:0.85rem;">
          🔍 لم يتم العثور على أي منتسب يطابق: "<strong>${escQ}</strong>"
        </div>
      `;
      resultsEl.style.display = 'block';
      return;
    }

    // 🔐 دالة تهريب HTML لنتائج البحث
    const escStr = (s) => s == null ? '' : String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#x27;');

    // خريطة مؤقتة لحفظ بيانات الأشخاص لضمان السلامة التامة وتجنب أي تعارض في علامات التنصيص
    window._mailPersonMap = window._mailPersonMap || {};

    resultsEl.innerHTML = matches.slice(0, 15).map(u => {
      const mr = masterRecords.find(m => m.employeeId === u.employeeId) || {};
      const sec = sections.find(s => s.id === u.sectionId) || {};
      const un = units.find(unit => unit.id === u.unitId) || {};
      const locText = sec.name ? (un.name ? `${sec.name} · ${un.name}` : sec.name) : (u.department || 'القسم الرئيسي');
      const titleText = u.jobTitle || mr.jobTitle || u.role || 'منتسب';
      const subInfoText = `${titleText} · ${locText} (رقم: ${u.employeeId || '—'})`;

      const safeId = String(u.id);
      window._mailPersonMap[safeId] = {
        id: safeId,
        name: u.fullName || 'منتسب',
        sub: subInfoText
      };

      const escName = escStr(u.fullName);
      const escId = escStr(safeId);

      return `
        <div class="mail-person-row"
             onclick="window.app.selectMailPerson('${escId}')"
             data-user-id="${escId}"
             style="padding:0.6rem 0.8rem; border-radius:6px; cursor:pointer; display:flex; align-items:center; justify-content:space-between; gap:0.5rem; transition:all 0.15s ease; margin-bottom:4px; border:1px solid rgba(0,0,0,0.06); background:var(--md-sys-color-surface);"
             onmouseover="this.style.background='var(--md-sys-color-surface-variant)'; this.style.borderColor='rgba(11,87,208,0.3)';"
             onmouseout="this.style.background='var(--md-sys-color-surface)'; this.style.borderColor='rgba(0,0,0,0.06)';">
          <div style="min-width:0; flex:1;">
            <div style="font-weight:800; font-size:0.88rem; color:var(--md-sys-color-on-surface); display:flex; align-items:center; gap:0.4rem; flex-wrap:wrap;">
              <span>${escName}</span>
              ${u.employeeId ? `<span style="font-size:0.72rem; background:rgba(11,87,208,0.1); color:var(--md-sys-color-primary); padding:0.1rem 0.4rem; border-radius:4px; font-weight:800;">${escStr(u.employeeId)}</span>` : ''}
            </div>
            <div style="font-size:0.76rem; color:var(--md-sys-color-outline); margin-top:2px;">
              ${escStr(titleText)} · <span style="color:var(--md-sys-color-primary);">${escStr(locText)}</span>
            </div>
          </div>
          <button type="button"
                  class="btn btn-sm mail-person-select-btn mail-select-person-btn"
                  onclick="event.stopPropagation(); window.app.selectMailPerson('${escId}')"
                  style="background:var(--md-sys-color-primary); color:#ffffff; border:none; border-radius:6px; padding:0.35rem 0.75rem; font-size:0.78rem; font-weight:800; cursor:pointer; flex-shrink:0; display:inline-flex; align-items:center; gap:0.35rem; box-shadow:0 1px 3px rgba(0,0,0,0.15); transition:all 0.15s ease;"
                  onmouseover="this.style.opacity='0.9'; this.style.transform='scale(1.03)';"
                  onmouseout="this.style.opacity='1'; this.style.transform='none';">
            <span>اختيار</span>
            <span style="font-size:0.85rem;">↵</span>
          </button>
        </div>
      `;
    }).join('');
    resultsEl.style.display = 'block';

  };

  // اختيار شخص وتثبيته
  app.selectMailPerson = function(userId, userName, subInfo) {
    if (!userId) return;

    // استرجاع البيانات إذا لم تُمرر
    if (!userName || !subInfo) {
      if (window._mailPersonMap && window._mailPersonMap[userId]) {
        userName = userName || window._mailPersonMap[userId].name;
        subInfo = subInfo || window._mailPersonMap[userId].sub;
      } else {
        const db = (window.store && typeof window.store.getDb === 'function') ? window.store.getDb() : {};
        const u = (db.users || []).find(usr => String(usr.id) === String(userId)) || {};
        const mr = (db.employeeMasterRecords || []).find(m => m.employeeId === u.employeeId) || {};
        const sec = (db.sections || []).find(s => s.id === u.sectionId) || {};
        const un = (db.units || []).find(unit => unit.id === u.unitId) || {};
        const locText = sec.name ? (un.name ? `${sec.name} · ${un.name}` : sec.name) : (u.department || 'القسم الرئيسي');
        const titleText = u.jobTitle || mr.jobTitle || u.role || 'منتسب';
        userName = userName || u.fullName || 'منتسب';
        subInfo = subInfo || `${titleText} · ${locText} (رقم: ${u.employeeId || '—'})`;
      }
    }

    const idInput = document.getElementById('mailSelectedPersonId');
    const nameInput = document.getElementById('mailSelectedPersonName');
    const targetIdInput = document.getElementById('mailTargetPersonId');
    const targetNameInput = document.getElementById('mailTargetPersonName');
    const badge = document.getElementById('mailSelectedPersonBadge');
    const displayBox = document.getElementById('mailSelectedPersonDisplay');
    const titleEl = document.getElementById('mailSelectedPersonTitle');
    const subEl = document.getElementById('mailSelectedPersonSub');
    const searchWrapper = document.getElementById('mailPersonSearchInputWrapper');
    const resultsEl = document.getElementById('mailPersonSearchResults');

    if (idInput) idInput.value = userId;
    if (targetIdInput) targetIdInput.value = userId;
    if (nameInput) nameInput.value = userName || '';
    if (targetNameInput) targetNameInput.value = userName || '';
    if (titleEl) titleEl.textContent = userName || '';
    if (subEl) subEl.textContent = subInfo || '';
    if (badge) badge.style.display = 'flex';
    if (displayBox) displayBox.style.display = 'flex';
    if (searchWrapper) searchWrapper.style.display = 'none';
    if (resultsEl) {
      resultsEl.style.display = 'none';
      resultsEl.innerHTML = '';
    }
  };

  // مسح الشخص المختار والعودة للبحث
  app.clearSelectedMailPerson = function() {
    const idInput = document.getElementById('mailSelectedPersonId');
    const nameInput = document.getElementById('mailSelectedPersonName');
    const targetIdInput = document.getElementById('mailTargetPersonId');
    const targetNameInput = document.getElementById('mailTargetPersonName');
    const badge = document.getElementById('mailSelectedPersonBadge');
    const displayBox = document.getElementById('mailSelectedPersonDisplay');
    const searchWrapper = document.getElementById('mailPersonSearchInputWrapper');
    const searchInput = document.getElementById('mailPersonSearchInput');
    const resultsEl = document.getElementById('mailPersonSearchResults');

    if (idInput) idInput.value = '';
    if (targetIdInput) targetIdInput.value = '';
    if (nameInput) nameInput.value = '';
    if (targetNameInput) targetNameInput.value = '';
    if (badge) badge.style.display = 'none';
    if (displayBox) displayBox.style.display = 'none';
    if (searchWrapper) searchWrapper.style.display = 'block';
    if (searchInput) {
      searchInput.value = '';
      if (typeof searchInput.focus === 'function') searchInput.focus();
    }
    if (resultsEl) {
      resultsEl.style.display = 'none';
      resultsEl.innerHTML = '';
    }
  };

  // فتح نافذة إنشاء البريد
  app.openComposeMailModal = function(level, id) {
    const modal = document.getElementById('mailComposeModal');
    if (modal) {
      modal.style.display = 'block';
      // حفظ السياق
      modal.dataset.level = level;
      modal.dataset.id = id;
      // إعادة تعيين المرفقات المسودة
      window._mailDraftAttachments = [];
      app.renderMailAttachmentsPreview();
      // إعادة تعيين النموذج
      const form = document.getElementById('mailComposeForm');
      if (form) form.reset();
      const targetField = document.getElementById('mailTargetField');
      if (targetField) targetField.style.display = 'none';
      const letterTypeEl = document.getElementById('mailLetterType');
      if (letterTypeEl) letterTypeEl.value = 'REGULAR_MAIL';
      app.onLetterTypeChange('REGULAR_MAIL');
      app.clearComposeSignature();
    }
  };

  // إدراج نماذج وقوالب الصياغة السريعة لنص البريد
  app.insertComposeMailTemplate = function(type) {
    const textarea = document.getElementById('mailBody');
    if (!textarea) return;

    if (type === 'official') {
      textarea.value = `إلى / السادة المحترمين\nم / أمر وتوجيه إداري رسمي\n\nتحية طيبة...\nبناءً على مقتضيات مصلحة العمل وحسن سير الأداء التشغيلي:\n1.\n2.\n3.\n\nيرجى التفضل بالاطلاع والعمل بموجبه وإعلامنا.\nمع التقدير...`;
    } else if (type === 'memo') {
      textarea.value = `مطالعة فنية تشغيلية عاجلة:\nالموقع / المحطة:\n1. الموقف الفني الراهن:\n2. الإجراءات الميدانية المتخذة:\n3. التوصيات والمتطلبات الفنية العاجلة:`;
    } else if (type === 'coordination') {
      textarea.value = `مذكرة طلب وتنسيق معلومات:\nإلى مسؤول الشعبة / المحطة:\nيرجى التفضل بتزويدنا بالبيانات والإحصائيات التالية في موعد أقصاه:\n1.\n2.\nشاكرين تعاونكم...`;
    } else if (type === 'clear') {
      textarea.value = '';
    }
    textarea.focus();
  };

  // معالجة سحب وإفلات الملفات
  app.handleMailFileDrop = function(event) {
    event.preventDefault();
    const dropZone = document.getElementById('mailDropZone');
    if (dropZone) {
      dropZone.style.borderColor = 'rgba(11,87,208,0.35)';
      dropZone.style.background = 'linear-gradient(135deg, rgba(11,87,208,0.03) 0%, rgba(2,132,199,0.05) 100%)';
      dropZone.style.transform = 'scale(1)';
    }
    if (event.dataTransfer && event.dataTransfer.files) {
      app.addMailAttachmentFiles(event.dataTransfer.files);
    }
  };

  // معالجة اختيار الملفات عبر المتصفح
  app.handleMailFileInputChange = function(input) {
    if (input && input.files) {
      app.addMailAttachmentFiles(input.files);
      input.value = ''; // إعادة تعيين لاختيار ملفات أخرى
    }
  };

  // إضافة ومعالجة الملفات إلى المسودة
  app.addMailAttachmentFiles = function(fileList) {
    if (!window._mailDraftAttachments) window._mailDraftAttachments = [];
    const files = Array.from(fileList);
    if (files.length === 0) return;

    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = function(e) {
        window._mailDraftAttachments.push({
          name: file.name,
          size: file.size,
          type: file.type || 'application/octet-stream',
          dataUrl: e.target.result
        });
        app.renderMailAttachmentsPreview();
      };
      reader.readAsDataURL(file);
    });
  };

  // رسم معاينات المرفقات المسودة
  app.renderMailAttachmentsPreview = function() {
    const preview = document.getElementById('mailAttachmentsPreview');
    const badge = document.getElementById('mailAttachmentCountBadge');
    if (!preview) return;

    const list = window._mailDraftAttachments || [];
    if (badge) badge.textContent = list.length > 0 ? `(${list.length} ملفات محددة)` : '';

    if (list.length === 0) {
      preview.innerHTML = '';
      return;
    }

    const formatBytes = (bytes) => {
      if (!bytes || bytes === 0) return '0 B';
      const k = 1024;
      const sizes = ['B', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    preview.innerHTML = list.map((att, idx) => {
      const isImg = att.type && att.type.startsWith('image/');
      const isPdf = (att.type && att.type === 'application/pdf') || (att.name && att.name.toLowerCase().endsWith('.pdf'));

      return `
        <div style="background:var(--md-sys-color-surface-variant); border:1.5px solid var(--md-sys-color-surface-variant); border-radius:var(--radius-md); padding:0.4rem 0.6rem; display:flex; align-items:center; gap:0.5rem; max-width:220px; box-shadow:0 2px 6px rgba(0,0,0,0.05); position:relative;">
          ${isImg ? `
            <img src="${att.dataUrl}" alt="${att.name}" style="width:36px; height:36px; object-fit:cover; border-radius:4px; flex-shrink:0;">
          ` : `
            <div style="width:36px; height:36px; border-radius:4px; background:${isPdf ? 'rgba(239,68,68,0.1)' : 'rgba(11,87,208,0.1)'}; display:flex; align-items:center; justify-content:center; font-size:1.2rem; flex-shrink:0;">
              ${isPdf ? '📄' : '📑'}
            </div>
          `}
          <div style="min-width:0; flex:1;">
            <div style="font-weight:800; font-size:0.8rem; color:var(--md-sys-color-on-surface); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
              ${att.name}
            </div>
            <div style="font-size:0.72rem; color:var(--md-sys-color-outline);">
              ${formatBytes(att.size)}
            </div>
          </div>
          <button type="button" onclick="window.app.removeMailDraftAttachment(${idx})"
                  style="background:rgba(239,68,68,0.1); border:none; color:#ef4444; width:22px; height:22px; border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer; font-size:0.75rem; font-weight:900; flex-shrink:0; transition:background 0.2s;"
                  title="حذف هذا المرفق">
            ✕
          </button>
        </div>
      `;
    }).join('');
  };

  // حذف مرفق من المسودة
  app.removeMailDraftAttachment = function(index) {
    if (!window._mailDraftAttachments) return;
    window._mailDraftAttachments.splice(index, 1);
    app.renderMailAttachmentsPreview();
  };

  // فتح / إغلاق عارض الـ PDF التفاعلي
  app.togglePdfViewer = function(frameId) {
    const el = document.getElementById(frameId);
    if (el) {
      el.style.display = el.style.display === 'none' ? 'block' : 'none';
    }
  };

  // فتح عارض الصور الكامل (Lightbox)
  app.openMailImageLightbox = function(imageUrl, title) {
    const modal = document.getElementById('mailImageLightboxModal');
    const img = document.getElementById('mailLightboxImage');
    const titleEl = document.getElementById('mailLightboxTitle');
    if (!modal || !img) return;

    img.src = imageUrl;
    if (titleEl) titleEl.textContent = title || 'صورة مكبرة';
    modal.style.display = 'flex';
  };

  // إغلاق عارض الصور الكامل
  app.closeMailImageLightbox = function() {
    const modal = document.getElementById('mailImageLightboxModal');
    if (modal) modal.style.display = 'none';
  };

  // إرسال البريد
  app.submitComposeMail = function(event) {
    event.preventDefault();
    const user = window.auth ? window.auth.getCurrentUser() : null;
    if (!user) return;

    const form = document.getElementById('mailComposeForm');
    const mailTypeEl = form.querySelector('input[name="mailType"]:checked');
    const letterTypeEl = document.getElementById('mailLetterType');
    const refNumberEl = document.getElementById('mailRefNumber');
    const letterDateEl = document.getElementById('mailLetterDate');
    const priorityEl = document.getElementById('mailPriority');
    const classificationEl = document.getElementById('mailClassification');
    const sigInput = document.getElementById('mailComposeSignatureDataUrl');
    const stampInput = document.getElementById('mailComposeStampInfo');

    const subjectEl = document.getElementById('mailSubject');
    const bodyEl = document.getElementById('mailBody');
    const toLevelEl = document.getElementById('mailToLevel');
    const toTargetEl = document.getElementById('mailToTargetId');
    const modal = document.getElementById('mailComposeModal');

    const mailType = mailTypeEl ? mailTypeEl.value : 'public';
    const letterType = letterTypeEl ? letterTypeEl.value : 'REGULAR_MAIL';
    const refNumber = refNumberEl ? refNumberEl.value.trim() : '';
    const letterDate = letterDateEl ? letterDateEl.value : new Date().toISOString().slice(0, 10);
    const priority = priorityEl ? priorityEl.value : 'NORMAL';
    const classification = classificationEl ? classificationEl.value : 'PUBLIC';
    const signatureDataUrl = sigInput ? sigInput.value : null;

    let stampInfo = null;
    if (stampInput && stampInput.value) {
      try { stampInfo = JSON.parse(stampInput.value); } catch(e) {}
    }

    const subject = subjectEl ? subjectEl.value.trim() : '';
    const body = bodyEl ? bodyEl.value.trim() : '';

    if (!subject || !body) {
      alert('يرجى إدخال الموضوع والنص');
      return;
    }

    let toLevel = 'all';
    let toTargetId = null;
    let toTargetName = 'الجميع';

    if (mailType === 'private' && toLevelEl) {
      toLevel = toLevelEl.value;
      if (toLevel === 'person') {
        const selectedId = document.getElementById('mailSelectedPersonId') ? document.getElementById('mailSelectedPersonId').value : '';
        const selectedName = document.getElementById('mailSelectedPersonName') ? document.getElementById('mailSelectedPersonName').value : '';
        if (!selectedId) {
          alert('⚠️ يرجى البحث واختيار الشخص المعني بالبريد الخاص');
          return;
        }
        toTargetId = selectedId;
        toTargetName = selectedName || 'شخص محدد';
      } else if (toTargetEl && toTargetEl.value) {
        toTargetId = toTargetEl.value;
        const selectedOpt = toTargetEl.options[toTargetEl.selectedIndex];
        toTargetName = selectedOpt ? selectedOpt.dataset.name || selectedOpt.text : toTargetId;
      }
    }

    const contextLevel = modal ? (modal.dataset.level || 'department') : 'department';
    const attachments = window._mailDraftAttachments || [];

    const mailData = {
      mailType,
      letterType,
      refNumber,
      letterDate,
      priority,
      classification,
      signatureDataUrl,
      stampInfo,
      fromLevel: contextLevel,
      fromSectionId: user.sectionId || null,
      fromUnitId: user.unitId || null,
      fromStationId: user.stationId || null,
      toLevel,
      toTargetId,
      toTargetName,
      subject,
      body,
      attachments
    };

    const result = sendMail(mailData, user);
    if (result.success) {
      window._mailDraftAttachments = [];
      app.clearComposeSignature();
      app.closeComposeMailModal();
      app.showToast && app.showToast(`✅ تم إرسال البريد ${result.mail.id} بنجاح`, 'success');
      app.render();
    } else {
      alert('⚠️ حدث خطأ أثناء إرسال البريد');
    }
  };

  // ─── دوال وإجراءات الإحالة والهامش الرسمي (Workflow Endorsement Methods) ───

  // تهيئة لوحة توقيع الإحالة
  app.initEndorsementSignatureCanvas = function() {
    _endorsementSigPad = createSignaturePad(
      'mailEndorsementCanvas',
      'mailEndorsementPlaceholder',
      'mailEndorsementSignStatus',
      'mailEndorsementSignatureDataUrl',
      'mailEndorsementStampInfo'
    );
  };

  // مسح توقيع الإحالة
  app.clearEndorsementSignature = function() {
    if (_endorsementSigPad) _endorsementSigPad.clear();
  };

  // تطبيق الختم الرقمي للإحالة
  app.applyEndorsementDigitalStamp = function() {
    const user = window.auth ? window.auth.getCurrentUser() : null;
    if (!_endorsementSigPad) app.initEndorsementSignatureCanvas();
    if (_endorsementSigPad) _endorsementSigPad.stamp(user);
  };

  // فتح نافذة الإحالة والهامش الرسمي
  app.openMailEndorsementModal = function(mailId) {
    const modal = document.getElementById('mailEndorsementModal');
    const targetInput = document.getElementById('mailEndorsementTargetMailId');
    const note = document.getElementById('mailEndorsementNote');
    if (!modal) return;
    if (targetInput) targetInput.value = mailId;
    if (note) note.value = '';
    app.updateEndorsementTargetOptions();
    app.clearEndorsementSignature();
    modal.style.display = 'block';
    setTimeout(() => {
      app.initEndorsementSignatureCanvas();
    }, 100);
  };

  // إغلاق نافذة الإحالة والهامش
  app.closeMailEndorsementModal = function() {
    const modal = document.getElementById('mailEndorsementModal');
    if (modal) modal.style.display = 'none';
  };

  // تحديث جهات الإحالة
  app.updateEndorsementTargetOptions = function() {
    const levelEl = document.getElementById('mailEndorsementToLevel');
    const selectEl = document.getElementById('mailEndorsementToTargetId');
    if (!levelEl || !selectEl) return;
    const level = levelEl.value || 'section';
    const db = window.store.getDb();

    let options = [];
    if (level === 'section') {
      options = (db.sections || []).map(s => `<option value="${s.id}" data-name="${s.name}">${s.name}</option>`);
    } else if (level === 'station') {
      options = (db.stations || []).map(st => `<option value="${st.id}" data-name="${st.name}">${st.name}</option>`);
    } else if (level === 'unit') {
      options = (db.units || []).map(u => `<option value="${u.id}" data-name="${u.name}">${u.name}</option>`);
    } else if (level === 'department') {
      options = [`<option value="dept-south-prod" data-name="رئاسة قسم الإنتاج الجنوبي">🏛️ رئاسة قسم الإنتاج الجنوبي</option>`];
    }
    selectEl.innerHTML = options.length > 0 ? options.join('') : '<option value="">لا توجد جهات متاحة</option>';
  };

  // اعتماد وإرسال الإحالة الرسمية
  app.submitMailEndorsement = function(event) {
    if (event) event.preventDefault();
    const user = window.auth ? window.auth.getCurrentUser() : null;
    if (!user) { alert('⚠️ يرجى تسجيل الدخول'); return; }

    const mailId = document.getElementById('mailEndorsementTargetMailId') ? document.getElementById('mailEndorsementTargetMailId').value : '';
    const toLevelEl = document.getElementById('mailEndorsementToLevel');
    const toTargetEl = document.getElementById('mailEndorsementToTargetId');
    const actionTypeEl = document.getElementById('mailEndorsementActionType');
    const noteEl = document.getElementById('mailEndorsementNote');
    const sigInput = document.getElementById('mailEndorsementSignatureDataUrl');
    const stampInput = document.getElementById('mailEndorsementStampInfo');

    const note = noteEl ? noteEl.value.trim() : '';
    if (!note) { alert('⚠️ يرجى كتابة نص الهامش الإداري والتوجيه'); return; }
    if (!mailId) { alert('⚠️ خطأ: لم يتم تحديد الكتاب المستهدف'); return; }

    const toLevel = toLevelEl ? toLevelEl.value : 'section';
    let toTargetId = toTargetEl ? toTargetEl.value : null;
    let toTargetName = 'الجهة المعنية';
    if (toTargetEl && toTargetEl.selectedIndex >= 0) {
      const opt = toTargetEl.options[toTargetEl.selectedIndex];
      toTargetName = opt.dataset.name || opt.text || toTargetId;
    }

    let stampInfo = null;
    if (stampInput && stampInput.value) {
      try { stampInfo = JSON.parse(stampInput.value); } catch(e) {}
    }

    const endorsementData = {
      toLevel,
      toTargetId,
      toTargetName,
      actionType: actionTypeEl ? actionTypeEl.value : 'FOR_ACTION',
      note,
      signatureDataUrl: sigInput ? sigInput.value : null,
      stampInfo
    };

    const res = addMailEndorsement(mailId, endorsementData, user);
    if (res.success) {
      app.closeMailEndorsementModal();
      // تحديث عارض البريد
      const content = document.getElementById('mailViewerContent');
      if (content) content.innerHTML = buildMailViewerContent(mailId);
      app.showToast && app.showToast('✅ تم اعتماد وتسجيل الإحالة الرسمية بنجاح', 'success');
      app.render && app.render();
    } else {
      alert(res.error || '⚠️ تعذر تسجيل الإحالة');
    }
  };

  // فتح عارض البريد
  app.openMailViewer = function(mailId) {
    const modal = document.getElementById('mailViewerModal');
    const content = document.getElementById('mailViewerContent');
    if (!modal || !content) return;
    content.innerHTML = buildMailViewerContent(mailId);
    modal.style.display = 'block';
  };

  // إغلاق عارض البريد
  app.closeMailViewer = function() {
    const modal = document.getElementById('mailViewerModal');
    if (modal) modal.style.display = 'none';
  };

  // فتح نافذة الرد
  app.openMailReplyModal = function(mailId) {
    const modal = document.getElementById('mailReplyModal');
    const target = document.getElementById('mailReplyTargetId');
    const body = document.getElementById('mailReplyBody');
    if (!modal) return;
    if (target) target.value = mailId;
    if (body) body.value = '';
    modal.style.display = 'block';
  };

  // إغلاق نافذة الرد
  app.closeMailReplyModal = function() {
    const modal = document.getElementById('mailReplyModal');
    if (modal) modal.style.display = 'none';
  };

  // إرسال الرد
  app.submitMailReply = function() {
    const user = window.auth.getCurrentUser();
    const mailId = document.getElementById('mailReplyTargetId') ? document.getElementById('mailReplyTargetId').value : '';
    const body = document.getElementById('mailReplyBody') ? document.getElementById('mailReplyBody').value.trim() : '';

    if (!body) { alert('يرجى كتابة نص الرد'); return; }
    if (!mailId) { alert('خطأ: لا يوجد بريد مستهدف'); return; }

    const result = replyToMail(mailId, body, user);
    if (result.success) {
      app.closeMailReplyModal();
      // تحديث عارض البريد
      const content = document.getElementById('mailViewerContent');
      if (content) content.innerHTML = buildMailViewerContent(mailId);
      app.showToast && app.showToast('✅ تم إرسال الرد بنجاح', 'success');
    } else {
      alert('⚠️ حدث خطأ أثناء إرسال الرد');
    }
  };

  // حذف بريد
  app.deleteMailItem = function(mailId) {
    const user = window.auth.getCurrentUser();
    const result = deleteMail(mailId, user);
    if (result.success) {
      app.closeMailViewer();
      app.showToast && app.showToast('🗑 تم حذف البريد بنجاح', 'info');
      app.render();
    } else {
      alert(result.error || '⚠️ لا يمكن حذف هذا البريد');
    }
  };
}

// ─── تهيئة نظام البريد عند التحميل ──────────────────────────────────────────
if (typeof window !== 'undefined' && window.app && typeof window.app === 'object') {
  registerMailAppMethods(window.app);
}

if (typeof document !== 'undefined' && typeof document.addEventListener === 'function') {
  document.addEventListener('DOMContentLoaded', function() {
    // تأجيل التسجيل حتى يتهيأ window.app
    const tryRegister = () => {
      if (window.app && typeof window.app === 'object') {
        registerMailAppMethods(window.app);
      } else {
        setTimeout(tryRegister, 200);
      }
    };
    setTimeout(tryRegister, 500);
  });
}

// تصدير للاستخدام العالمي
window.renderMailTab = renderMailTab;
window.buildMailViewerContent = buildMailViewerContent;
window.sendMail = sendMail;
window.addMailEndorsement = addMailEndorsement;
window.markMailRead = markMailRead;
window.replyToMail = replyToMail;
window.deleteMail = deleteMail;
window.getMailsForContext = getMailsForContext;
window.openWhatsAppForMail = openWhatsAppForMail;
window.openEmailForMail = openEmailForMail;
window.registerMailAppMethods = registerMailAppMethods;
