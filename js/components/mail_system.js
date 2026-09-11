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

  const newMail = {
    id: 'MAIL-' + mailNumber,
    mailNumber: mailNumber,
    mailType: mailData.mailType || 'public',       // 'public' | 'private'
    fromUserId: user.id,
    fromUserName: user.fullName,
    fromUserRole: user.role,
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
                        style="background: linear-gradient(135deg, rgba(239,68,68,0.12), rgba(220,38,38,0.18)); border: 1.5px solid rgba(239,68,68,0.35); color: #dc2626; padding: 0.35rem 0.75rem; border-radius: 999px; font-size: 0.78rem; font-weight: 800; display: flex; align-items: center; gap: 0.35rem; cursor: pointer; transition: all 0.2s;"
                        onmouseover="this.style.background='#dc2626'; this.style.color='#fff';"
                        onmouseout="this.style.background='linear-gradient(135deg, rgba(239,68,68,0.12), rgba(220,38,38,0.18))'; this.style.color='#dc2626';">
                  <span>📄</span> <span>تصفح PDF</span>
                </button>
              ` : ''}

              <!-- زر المعاينة الفورية للصورة (بأي صيغة) -->
              ${imgAtt && !pdfAtt ? `
                <button onclick="window.app.openMailImageLightbox('${imgAtt.dataUrl}', '${(imgAtt.name || 'صورة مرفقة').replace(/'/g, "\\'")}')"
                        title="معاينة وتكبير الصورة فورياً (${imgAtt.name})"
                        style="background: linear-gradient(135deg, rgba(11,87,208,0.12), rgba(2,132,199,0.18)); border: 1.5px solid rgba(11,87,208,0.35); color: var(--md-sys-color-primary); padding: 0.35rem 0.75rem; border-radius: 999px; font-size: 0.78rem; font-weight: 800; display: flex; align-items: center; gap: 0.35rem; cursor: pointer; transition: all 0.2s;"
                        onmouseover="this.style.background='var(--md-sys-color-primary)'; this.style.color='#fff';"
                        onmouseout="this.style.background='linear-gradient(135deg, rgba(11,87,208,0.12), rgba(2,132,199,0.18))'; this.style.color='var(--md-sys-color-primary)';">
                  <span>🖼️</span> <span>عرض الصورة</span>
                </button>
              ` : ''}

              <!-- زر تنزيل مستند Word -->
              ${docAtt && !pdfAtt && !imgAtt ? `
                <a href="${docAtt.dataUrl}" download="${docAtt.name}"
                   title="تنزيل مستند Word (${docAtt.name})"
                   style="background: linear-gradient(135deg, rgba(37,99,235,0.12), rgba(29,78,216,0.18)); border: 1.5px solid rgba(37,99,235,0.35); color: #2563eb; padding: 0.35rem 0.75rem; border-radius: 999px; font-size: 0.78rem; font-weight: 800; display: flex; align-items: center; gap: 0.35rem; text-decoration: none; transition: all 0.2s;"
                   onmouseover="this.style.background='#2563eb'; this.style.color='#fff';"
                   onmouseout="this.style.background='linear-gradient(135deg, rgba(37,99,235,0.12), rgba(29,78,216,0.18))'; this.style.color='#2563eb';">
                  <span>📑</span> <span>مستند Word</span>
                </a>
              ` : ''}

              <!-- زر تنزيل جدول Excel -->
              ${xlsAtt && !pdfAtt && !imgAtt && !docAtt ? `
                <a href="${xlsAtt.dataUrl}" download="${xlsAtt.name}"
                   title="تنزيل جدول Excel (${xlsAtt.name})"
                   style="background: linear-gradient(135deg, rgba(16,185,129,0.12), rgba(5,150,105,0.18)); border: 1.5px solid rgba(16,185,129,0.35); color: #059669; padding: 0.35rem 0.75rem; border-radius: 999px; font-size: 0.78rem; font-weight: 800; display: flex; align-items: center; gap: 0.35rem; text-decoration: none; transition: all 0.2s;"
                   onmouseover="this.style.background='#059669'; this.style.color='#fff';"
                   onmouseout="this.style.background='linear-gradient(135deg, rgba(16,185,129,0.12), rgba(5,150,105,0.18))'; this.style.color='#059669';">
                  <span>📊</span> <span>جدول Excel</span>
                </a>
              ` : ''}

              <!-- زر ملف مرفق عام -->
              ${otherAtt && !pdfAtt && !imgAtt && !docAtt && !xlsAtt ? `
                <a href="${otherAtt.dataUrl}" download="${otherAtt.name}"
                   title="تنزيل الملف المرفق (${otherAtt.name})"
                   style="background: linear-gradient(135deg, rgba(124,58,237,0.12), rgba(109,40,217,0.18)); border: 1.5px solid rgba(124,58,237,0.35); color: #7c3aed; padding: 0.35rem 0.75rem; border-radius: 999px; font-size: 0.78rem; font-weight: 800; display: flex; align-items: center; gap: 0.35rem; text-decoration: none; transition: all 0.2s;"
                   onmouseover="this.style.background='#7c3aed'; this.style.color='#fff';"
                   onmouseout="this.style.background='linear-gradient(135deg, rgba(124,58,237,0.12), rgba(109,40,217,0.18))'; this.style.color='#7c3aed';">
                  <span>📎</span> <span>تحميل الملف</span>
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
                <button onclick="openWhatsAppForMail(${mailJson}, '${masterRec.phone}')"
                        title="إشعار عبر واتساب (${masterRec.phone})"
                        style="width: 34px; height: 34px; border-radius: 50%; background: rgba(37,211,102,0.12); border: 1.5px solid #25d366; color: #25d366; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; box-shadow: 0 2px 6px rgba(37,211,102,0.2);"
                        onmouseover="this.style.transform='scale(1.1)'; this.style.background='#25d366'; this.style.color='#fff';"
                        onmouseout="this.style.transform='scale(1)'; this.style.background='rgba(37,211,102,0.12)'; this.style.color='#25d366';">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                    <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm5.8 14.13c-.24.67-1.39 1.28-1.92 1.36-.5.08-1.15.11-3.7-0.95-3.26-1.36-5.36-4.66-5.52-4.88-.16-.22-1.33-1.77-1.33-3.37s.84-2.39 1.14-2.72c.3-.33.65-.41.87-.41.22 0 .43.01.62.02.2.01.46-.07.72.55.27.65.92 2.25 1 2.41.08.16.14.36.03.58-.11.22-.16.36-.33.55-.16.2-.35.44-.5.59-.16.16-.33.34-.14.67.19.33.84 1.39 1.8 2.25 1.24 1.1 2.29 1.44 2.62 1.6.33.16.52.14.72-.08.2-.22.84-.98 1.06-1.32.22-.34.44-.28.74-.17.3.11 1.91.9 2.24 1.06.33.16.55.24.63.38.08.14.08.8-.16 1.47z"/>
                  </svg>
                </button>
              ` : ''}

              <!-- علامة إيميل المباشرة -->
              ${masterRec.emailPersonal ? `
                <button onclick="openEmailForMail(${mailJson}, '${masterRec.emailPersonal}')"
                        title="إرسال للإيميل (${masterRec.emailPersonal})"
                        style="width: 34px; height: 34px; border-radius: 50%; background: rgba(59,130,246,0.12); border: 1.5px solid #3b82f6; color: #3b82f6; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; box-shadow: 0 2px 6px rgba(59,130,246,0.2);"
                        onmouseover="this.style.transform='scale(1.1)'; this.style.background='#3b82f6'; this.style.color='#fff';"
                        onmouseout="this.style.transform='scale(1)'; this.style.background='rgba(59,130,246,0.12)'; this.style.color='#3b82f6';">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
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
  const db = window.store.getDb();
  const sections = db.sections || [];
  const units = db.units || [];
  const stations = db.stations || [];
  const users = (db.users || []).filter(u => u.status === 'APPROVED' && u.id !== user.id);

  const canSendPublic = ['SUPER_ADMIN', 'DEPT_MANAGER', 'SECTION_MANAGER', 'ADMINISTRATOR'].includes(user.role);

  return `
    <div id="mailComposeModal" style="display:none; position:fixed; inset:0; z-index:9999; background:rgba(0,0,0,0.55); backdrop-filter:blur(4px); padding:1rem; overflow-y:auto;"
         onclick="if(event.target===this) window.app.closeComposeMailModal()">
      <div style="background:var(--md-sys-color-surface); border-radius:var(--radius-lg); max-width:680px; margin:2rem auto; box-shadow:0 24px 64px rgba(0,0,0,0.2); overflow:hidden;">

        <!-- رأس النافذة -->
        <div style="background:linear-gradient(135deg,rgba(11,87,208,0.08),rgba(2,132,199,0.12)); padding:1.25rem 1.5rem; border-bottom:1px solid var(--md-sys-color-surface-variant); display:flex; justify-content:space-between; align-items:center;">
          <h3 style="margin:0; font-weight:900; color:var(--md-sys-color-primary); display:flex; align-items:center; gap:0.5rem;">
            ✉️ إنشاء بريد جديد
          </h3>
          <button onclick="window.app.closeComposeMailModal()" style="background:none; border:none; cursor:pointer; font-size:1.4rem; color:var(--md-sys-color-outline); line-height:1;">✕</button>
        </div>

        <!-- نموذج الإرسال -->
        <form id="mailComposeForm" onsubmit="window.app.submitComposeMail(event)" style="padding:1.5rem; display:flex; flex-direction:column; gap:1.1rem;">

          <!-- نوع البريد -->
          <div>
            <label style="font-weight:800; font-size:0.9rem; color:var(--md-sys-color-on-surface); display:block; margin-bottom:0.5rem;">
              📋 نوع البريد
            </label>
            <div style="display:flex; gap:1rem;">
              <label style="display:flex; align-items:center; gap:0.4rem; cursor:pointer; font-weight:700; font-size:0.9rem;">
                <input type="radio" name="mailType" value="public" checked onchange="window.app.toggleMailTargetField(this.value)"
                       style="accent-color:var(--md-sys-color-primary);">
                📢 عام (يُبث للجميع)
              </label>
              <label style="display:flex; align-items:center; gap:0.4rem; cursor:pointer; font-weight:700; font-size:0.9rem;">
                <input type="radio" name="mailType" value="private" onchange="window.app.toggleMailTargetField(this.value)"
                       style="accent-color:#7c3aed;">
                🔒 خاص (موجَّه)
              </label>
            </div>
          </div>

          <!-- حقل الموجَّه إليه (يظهر فقط للخاص) -->
          <div id="mailTargetField" style="display:none;">
            <label style="font-weight:800; font-size:0.9rem; color:var(--md-sys-color-on-surface); display:block; margin-bottom:0.5rem;">
              🎯 جهة التوجيه
            </label>
            <select id="mailToLevel" name="toLevel" class="form-control" onchange="window.app.updateMailTargetOptions()"
                    style="margin-bottom:0.75rem; font-weight:700;">
              <option value="section">🏢 شعبة محددة</option>
              <option value="unit">⚡ وحدة محددة</option>
              <option value="station">🛢️ محطة محددة</option>
              <option value="person">👤 شخص محدد (بحث ذكي)</option>
            </select>

            <!-- اختيار عادي للشعب والوحدات والمحطات -->
            <div id="mailStandardTargetContainer">
              <select id="mailToTargetId" name="toTargetId" class="form-control" style="font-weight:700;">
                ${sections.map(s => `<option value="${s.id}" data-name="${s.name}">${s.name}</option>`).join('')}
              </select>
            </div>

            <!-- حاوية البحث الذكي عن الأشخاص -->
            <div id="mailPersonSearchContainer" style="display:none; position:relative;">
              <input type="hidden" id="mailSelectedPersonId" name="selectedPersonId" value="">
              <input type="hidden" id="mailSelectedPersonName" name="selectedPersonName" value="">

              <!-- شريط البحث الفوري -->
              <div id="mailPersonSearchInputWrapper" style="position:relative;">
                <input type="text" id="mailPersonSearchInput" class="form-control"
                       placeholder="🔍 ابحث بالاسم، الرقم الوظيفي، الشعبة أو العنوان..."
                       autocomplete="off"
                       oninput="window.app.searchMailPerson(this.value)"
                       style="padding-right: 2.2rem; font-weight:700;">
                <span style="position:absolute; right:0.75rem; top:50%; transform:translateY(-50%); font-size:1rem; pointer-events:none; opacity:0.6;">👤</span>
              </div>

              <!-- بطاقة الموظف المختار -->
              <div id="mailSelectedPersonBadge" style="display:none; margin-top:0.5rem; background:linear-gradient(135deg, rgba(11,87,208,0.08), rgba(2,132,199,0.12)); border:1.5px solid var(--md-sys-color-primary); border-radius:var(--radius-md); padding:0.6rem 0.9rem; align-items:center; justify-content:space-between; gap:0.5rem;">
                <div style="display:flex; align-items:center; gap:0.5rem; min-width:0;">
                  <span style="font-size:1.2rem;">✅</span>
                  <div style="min-width:0;">
                    <div id="mailSelectedPersonTitle" style="font-weight:800; font-size:0.9rem; color:var(--md-sys-color-primary); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;"></div>
                    <div id="mailSelectedPersonSub" style="font-size:0.78rem; color:var(--md-sys-color-outline); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;"></div>
                  </div>
                </div>
                <button type="button" onclick="window.app.clearSelectedMailPerson()" class="btn btn-sm" style="background:rgba(239,68,68,0.1); color:#ef4444; border:1px solid rgba(239,68,68,0.3); border-radius:6px; padding:0.25rem 0.6rem; font-size:0.75rem; font-weight:800; cursor:pointer; flex-shrink:0;">
                  ✕ تغيير
                </button>
              </div>

              <!-- القائمة المنسدلة للنتائج الذكية -->
              <div id="mailPersonSearchResults"
                   style="display:none; position:absolute; top:100%; left:0; right:0; z-index:1000; background:var(--md-sys-color-surface); border:1.5px solid var(--md-sys-color-surface-variant); box-shadow:0 12px 32px rgba(0,0,0,0.2); border-radius:var(--radius-md); max-height:220px; overflow-y:auto; margin-top:4px; padding:0.4rem;">
              </div>
            </div>
          </div>

          <!-- الموضوع -->
          <div>
            <label style="font-weight:800; font-size:0.9rem; color:var(--md-sys-color-on-surface); display:block; margin-bottom:0.5rem;">
              📌 موضوع البريد <span style="color:#ef4444;">*</span>
            </label>
            <input type="text" name="subject" id="mailSubject" class="form-control" required
                   placeholder="أدخل موضوع البريد الداخلي..."
                   style="font-size:0.95rem; font-weight:700;">
          </div>

          <!-- النص -->
          <div>
            <label style="font-weight:800; font-size:0.9rem; color:var(--md-sys-color-on-surface); display:block; margin-bottom:0.5rem;">
              📝 نص البريد <span style="color:#ef4444;">*</span>
            </label>
            <textarea name="body" id="mailBody" class="form-control" rows="5" required
                      placeholder="اكتب نص البريد الداخلي هنا..."
                      style="font-size:0.92rem; resize:vertical; min-height:120px;"></textarea>
          </div>

          <!-- المرفقات مع السحب والإفلات -->
          <div>
            <label style="font-weight:800; font-size:0.9rem; color:var(--md-sys-color-on-surface); display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
              <span>📎 المرفقات (صور، ملفات PDF، مستندات)</span>
              <span id="mailAttachmentCountBadge" style="font-size:0.75rem; color:var(--md-sys-color-primary); font-weight:800;"></span>
            </label>

            <!-- منطقة السحب والإفلات الزجاجية التفاعلية -->
            <div id="mailDropZone"
                 style="border: 2px dashed rgba(11,87,208,0.35); background: linear-gradient(135deg, rgba(11,87,208,0.03) 0%, rgba(2,132,199,0.05) 100%); border-radius: var(--radius-md); padding: 1.5rem 1rem; text-align: center; cursor: pointer; transition: all 0.25s ease;"
                 onclick="document.getElementById('mailAttachmentsInput').click()"
                 ondragover="event.preventDefault(); this.style.borderColor='var(--md-sys-color-primary)'; this.style.background='rgba(11,87,208,0.09)'; this.style.transform='scale(1.01)';"
                 ondragleave="event.preventDefault(); this.style.borderColor='rgba(11,87,208,0.35)'; this.style.background='linear-gradient(135deg, rgba(11,87,208,0.03) 0%, rgba(2,132,199,0.05) 100%)'; this.style.transform='scale(1)';"
                 ondrop="window.app.handleMailFileDrop(event)">
              <div style="font-size: 2.2rem; margin-bottom: 0.35rem;">📂</div>
              <div style="font-weight: 800; font-size: 0.95rem; color: var(--md-sys-color-primary); margin-bottom: 0.2rem;">
                اسحب وأفلت الملفات أو الصور هنا
              </div>
              <div style="font-size: 0.8rem; color: var(--md-sys-color-outline);">
                يدعم ملفات PDF، صور JPG/PNG، ومستندات Word/Excel (أو انقر للتصفح)
              </div>
              <input type="file" id="mailAttachmentsInput" multiple accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx"
                     style="display:none;" onchange="window.app.handleMailFileInputChange(this)">
            </div>

            <!-- معاينة المرفقات المحملة -->
            <div id="mailAttachmentsPreview" style="margin-top:0.75rem; display:flex; flex-wrap:wrap; gap:0.6rem;"></div>
          </div>

          <!-- أزرار -->
          <div style="display:flex; gap:0.75rem; justify-content:flex-end; padding-top:0.5rem; border-top:1px solid var(--md-sys-color-surface-variant);">
            <button type="button" onclick="window.app.closeComposeMailModal()" class="btn btn-outline" style="font-weight:700;">
              إلغاء
            </button>
            <button type="submit" class="btn btn-glass-primary" style="font-weight:800; min-width:120px;">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" style="transform:rotate(180deg)">
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
    <div id="mailReplyModal" style="display:none; position:fixed; inset:0; z-index:10000; background:rgba(0,0,0,0.6); backdrop-filter:blur(6px); padding:1rem; overflow-y:auto;"
         onclick="if(event.target===this) window.app.closeMailReplyModal()">
      <div style="background:var(--md-sys-color-surface); border:1.5px solid rgba(124,58,237,0.3); border-radius:var(--radius-lg); max-width:580px; margin:4rem auto; box-shadow:0 24px 64px rgba(0,0,0,0.25); overflow:hidden;">
        <div style="background:linear-gradient(135deg,rgba(124,58,237,0.12),rgba(124,58,237,0.18)); padding:1.2rem 1.5rem; border-bottom:1px solid var(--md-sys-color-surface-variant); display:flex; justify-content:space-between; align-items:center;">
          <h4 style="margin:0; font-weight:900; color:#7c3aed; display:flex; align-items:center; gap:0.5rem;">
            <span>↩</span> <span>الرد على البريد الداخلي</span>
          </h4>
          <button onclick="window.app.closeMailReplyModal()" style="background:none; border:none; cursor:pointer; font-size:1.3rem; color:var(--md-sys-color-outline);">✕</button>
        </div>
        <div style="padding:1.5rem;">
          <textarea id="mailReplyBody" class="form-control" rows="4" placeholder="اكتب ردك هنا..."
                    style="font-size:0.92rem; resize:vertical; min-height:110px; margin-bottom:1.2rem;"></textarea>
          <input type="hidden" id="mailReplyTargetId">
          <div style="display:flex; gap:0.75rem; justify-content:flex-end;">
            <button onclick="window.app.closeMailReplyModal()" class="btn btn-outline" style="font-weight:700;">إلغاء</button>
            <button onclick="window.app.submitMailReply()" class="btn btn-glass-primary" style="font-weight:800; background:linear-gradient(135deg,#7c3aed,#9333ea);">
              ↩ إرسال الرد
            </button>
          </div>
        </div>
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
            ${mail.id}
          </span>
          <span style="background:${mail.mailType === 'public' ? 'rgba(11,87,208,0.15)' : 'rgba(124,58,237,0.15)'}; color:${mail.mailType === 'public' ? 'var(--md-sys-color-primary)' : '#7c3aed'}; font-size:0.8rem; font-weight:800; padding:0.2rem 0.7rem; border-radius:999px; border:1px solid ${mail.mailType === 'public' ? 'rgba(11,87,208,0.3)' : 'rgba(124,58,237,0.3)'};">
            ${mail.mailType === 'public' ? '📢 بريد عام' : '🔒 بريد خاص'}
          </span>
        </div>
        <h3 style="margin:0; font-weight:900; color:var(--md-sys-color-on-surface); font-size:1.35rem; line-height:1.4;">
          ${mail.subject || '(بدون موضوع)'}
        </h3>
      </div>
      <button onclick="window.app.closeMailViewer()" style="background:var(--md-sys-color-surface-variant); border:none; border-radius:50%; width:38px; height:38px; display:flex; align-items:center; justify-content:center; cursor:pointer; font-size:1.3rem; color:var(--md-sys-color-outline); flex-shrink:0; transition:all 0.2s;">✕</button>
    </div>

    <!-- شريط معلومات المرسل والمستقبل -->
    <div style="padding:1.1rem 2rem; border-bottom:1px solid var(--md-sys-color-surface-variant); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem; background:rgba(0,0,0,0.02);">
      <div style="display:flex; align-items:center; gap:0.85rem;">
        <div style="width:44px; height:44px; border-radius:50%; background:linear-gradient(135deg,var(--md-sys-color-primary),#0284c7); color:white; display:flex; align-items:center; justify-content:center; font-weight:900; font-size:1.15rem; flex-shrink:0;">
          ${(mail.fromUserName || 'م').substring(0, 1)}
        </div>
        <div>
          <div style="font-size:0.8rem; color:var(--md-sys-color-outline);">المرسِل</div>
          <div style="font-weight:800; color:var(--md-sys-color-on-surface); font-size:0.98rem;">${mail.fromUserName}</div>
          <div style="font-size:0.78rem; color:var(--md-sys-color-outline);">${formatMailDate(mail.timestamp)}</div>
        </div>
      </div>
      <div style="text-align:left; background:var(--md-sys-color-surface-variant); padding:0.5rem 1rem; border-radius:var(--radius-md);">
        <div style="font-size:0.75rem; color:var(--md-sys-color-outline);">الموجَّه إليه</div>
        <div style="font-weight:800; color:var(--md-sys-color-primary); font-size:0.92rem;">${mail.toTargetName || 'الجميع'}</div>
      </div>
    </div>

    <!-- محتوى نص الرسالة -->
    <div style="padding:2rem; background:var(--md-sys-color-surface);">
      <div style="background:var(--md-sys-color-surface-variant); border-right:4px solid var(--md-sys-color-primary); border-radius:var(--radius-md); padding:1.5rem 1.75rem; line-height:1.9; color:var(--md-sys-color-on-surface); font-size:1.02rem; white-space:pre-wrap; box-shadow:inset 0 1px 3px rgba(0,0,0,0.04);">
        ${(mail.body || '').replace(/</g, '&lt;').replace(/>/g, '&gt;')}
      </div>

      <!-- 📑 قسم ملفات الـ PDF (معاينة عريضة ومباشرة وتلقائية) -->
      ${pdfAttachments.length > 0 ? `
        <div style="margin-top:1.75rem; background:linear-gradient(135deg, rgba(239,68,68,0.04) 0%, rgba(220,38,38,0.08) 100%); border:1.5px solid rgba(239,68,68,0.25); border-radius:var(--radius-lg); padding:1.5rem;">
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.75rem; margin-bottom:1rem;">
            <h4 style="font-weight:900; color:#dc2626; margin:0; display:flex; align-items:center; gap:0.5rem; font-size:1.05rem;">
              <span>📑</span> <span>مستند PDF المرفق (${pdfAttachments.length})</span>
            </h4>
          </div>
          <div style="display:flex; flex-direction:column; gap:1.25rem;">
            ${pdfAttachments.map((pdf, pIdx) => `
              <div style="background:var(--md-sys-color-surface); border:1px solid var(--md-sys-color-surface-variant); border-radius:var(--radius-md); padding:1.2rem; box-shadow:0 4px 16px rgba(0,0,0,0.06);">
                <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.75rem; margin-bottom:0.9rem; padding-bottom:0.75rem; border-bottom:1px solid var(--md-sys-color-surface-variant);">
                  <div style="display:flex; align-items:center; gap:0.6rem; min-width:0;">
                    <span style="font-size:1.8rem;">📄</span>
                    <div style="min-width:0;">
                      <div style="font-weight:900; font-size:1rem; color:var(--md-sys-color-on-surface); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                        ${pdf.name}
                      </div>
                      <div style="font-size:0.78rem; color:var(--md-sys-color-outline);">
                        عرض مباشر فائق الدقة
                      </div>
                    </div>
                  </div>
                  <div style="display:flex; gap:0.5rem; align-items:center;">
                    <button onclick="window.open('${pdf.dataUrl}', '_blank')" class="btn btn-sm btn-glass-primary" style="font-weight:800; font-size:0.8rem; display:inline-flex; align-items:center; gap:0.3rem;">
                      <span>🔗</span> <span>فتح في لسان جديد</span>
                    </button>
                    <a href="${pdf.dataUrl}" download="${pdf.name}" class="btn btn-sm btn-outline" style="font-weight:800; font-size:0.8rem; text-decoration:none; display:inline-flex; align-items:center; gap:0.3rem;">
                      <span>⬇️</span> <span>تنزيل</span>
                    </a>
                  </div>
                </div>
                <!-- إطار عرض الـ PDF المباشر والتلقائي عالي الدقة -->
                <div style="width:100%; border-radius:8px; overflow:hidden; border:1.5px solid var(--md-sys-color-surface-variant); box-shadow:0 6px 24px rgba(0,0,0,0.15);">
                  <iframe src="${pdf.dataUrl}" style="width:100%; height:750px; min-height:600px; border:none; display:block; background:#525659;" title="${pdf.name}"></iframe>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <!-- 🖼️ قسم معرض الصور المرفقة (مع تكبير Lightbox) -->
      ${imageAttachments.length > 0 ? `
        <div style="margin-top:1.75rem; background:linear-gradient(135deg, rgba(11,87,208,0.04) 0%, rgba(2,132,199,0.08) 100%); border:1.5px solid rgba(11,87,208,0.2); border-radius:var(--radius-lg); padding:1.5rem;">
          <h4 style="font-weight:900; color:var(--md-sys-color-primary); margin:0 0 1rem 0; display:flex; align-items:center; gap:0.5rem; font-size:1.05rem;">
            <span>🖼️</span> <span>معرض الصور المرفقة (${imageAttachments.length})</span>
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
          <h5 style="font-weight:800; color:var(--md-sys-color-outline); margin:0 0 0.6rem 0; font-size:0.9rem;">
            📎 مستندات وملفات إضافية (${otherAttachments.length})
          </h5>
          <div style="display:flex; flex-wrap:wrap; gap:0.6rem;">
            ${otherAttachments.map(att => `
              <div style="background:var(--md-sys-color-surface-variant); border-radius:var(--radius-md); padding:0.65rem 1rem; display:flex; align-items:center; gap:0.6rem;">
                <span style="font-size:1.3rem;">📑</span>
                <span style="font-weight:700; font-size:0.88rem; color:var(--md-sys-color-on-surface);">${att.name}</span>
                <a href="${att.dataUrl}" download="${att.name}" style="color:var(--md-sys-color-primary); font-size:0.82rem; font-weight:800; text-decoration:none; margin-right:0.4rem;">⬇️ تحميل</a>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <!-- أزرار وعلامات التفاعل الزجاجية -->
      <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:0.75rem; margin-top:2rem; padding-top:1.5rem; border-top:1px solid var(--md-sys-color-surface-variant);">
        <div style="display:flex; align-items:center; gap:0.75rem;">
          <!-- زر الرد الأساسي -->
          <button onclick="window.app.openMailReplyModal('${mail.id}')" class="btn btn-glass-primary" style="font-weight:800; font-size:0.92rem; display:flex; align-items:center; gap:0.5rem; background:linear-gradient(135deg,#7c3aed,#9333ea); padding:0.6rem 1.4rem;">
            <span>↩</span> <span>الرد على البريد</span>
          </button>

          <!-- علامة واتساب أيقونية متوهجة -->
          ${masterRec.phone ? `
            <button onclick="openWhatsAppForMail(${JSON.stringify({id:mail.id,subject:mail.subject,body:mail.body,timestamp:mail.timestamp,fromUserName:mail.fromUserName}).replace(/"/g,'&quot;')}, '${masterRec.phone}')"
                    title="إرسال إشعار عبر واتساب (${masterRec.phone})"
                    style="width:42px; height:42px; border-radius:50%; background:rgba(37,211,102,0.12); border:1.5px solid #25d366; color:#25d366; display:flex; align-items:center; justify-content:center; cursor:pointer; transition:all 0.2s; box-shadow:0 2px 8px rgba(37,211,102,0.2);"
                    onmouseover="this.style.transform='scale(1.1)';this.style.background='#25d366';this.style.color='#fff';"
                    onmouseout="this.style.transform='scale(1)';this.style.background='rgba(37,211,102,0.12)';this.style.color='#25d366';">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm5.8 14.13c-.24.67-1.39 1.28-1.92 1.36-.5.08-1.15.11-3.7-0.95-3.26-1.36-5.36-4.66-5.52-4.88-.16-.22-1.33-1.77-1.33-3.37s.84-2.39 1.14-2.72c.3-.33.65-.41.87-.41.22 0 .43.01.62.02.2.01.46-.07.72.55.27.65.92 2.25 1 2.41.08.16.14.36.03.58-.11.22-.16.36-.33.55-.16.2-.35.44-.5.59-.16.16-.33.34-.14.67.19.33.84 1.39 1.8 2.25 1.24 1.1 2.29 1.44 2.62 1.6.33.16.52.14.72-.08.2-.22.84-.98 1.06-1.32.22-.34.44-.28.74-.17.3.11 1.91.9 2.24 1.06.33.16.55.24.63.38.08.14.08.8-.16 1.47z"/>
              </svg>
            </button>
          ` : ''}

          <!-- علامة إيميل أيقونية متوهجة -->
          ${masterRec.emailPersonal ? `
            <button onclick="openEmailForMail(${JSON.stringify({id:mail.id,subject:mail.subject,body:mail.body,timestamp:mail.timestamp,fromUserName:mail.fromUserName}).replace(/"/g,'&quot;')}, '${masterRec.emailPersonal}')"
                    title="إرسال عبر البريد الإلكتروني (${masterRec.emailPersonal})"
                    style="width:42px; height:42px; border-radius:50%; background:rgba(59,130,246,0.12); border:1.5px solid #3b82f6; color:#3b82f6; display:flex; align-items:center; justify-content:center; cursor:pointer; transition:all 0.2s; box-shadow:0 2px 8px rgba(59,130,246,0.2);"
                    onmouseover="this.style.transform='scale(1.1)';this.style.background='#3b82f6';this.style.color='#fff';"
                    onmouseout="this.style.transform='scale(1)';this.style.background='rgba(59,130,246,0.12)';this.style.color='#3b82f6';">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
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

  // فتح نافذة إنشاء البريد
  app.openComposeMailModal = function(level, id) {
    const modal = document.getElementById('mailComposeModal');
    if (modal) {
      modal.style.display = 'block';
      // حفظ السياق
      modal.dataset.level = level;
      modal.dataset.id = id;
      // إعادة تعيين النموذج
      const form = document.getElementById('mailComposeForm');
      if (form) form.reset();
      const preview = document.getElementById('mailAttachmentsPreview');
      if (preview) preview.innerHTML = '';
      const targetField = document.getElementById('mailTargetField');
      if (targetField) targetField.style.display = 'none';
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
      }
      select.innerHTML = options.join('');
    }
  };

  // البحث الذكي الفوري عن المنتسبين
  app.searchMailPerson = function(query) {
    const resultsEl = document.getElementById('mailPersonSearchResults');
    if (!resultsEl) return;
    const q = (query || '').trim().toLowerCase();
    if (!q) {
      resultsEl.style.display = 'none';
      resultsEl.innerHTML = '';
      return;
    }

    const db = window.store.getDb();
    const users = (db.users || []).filter(u => u.status === 'APPROVED');
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
      const secName = (sec.name || '').toLowerCase();
      const unName = (un.name || '').toLowerCase();

      return fullName.includes(q) || empId.includes(q) || jobTitle.includes(q) || role.includes(q) || secName.includes(q) || unName.includes(q);
    });

    if (matches.length === 0) {
      resultsEl.innerHTML = `
        <div style="padding:0.75rem; text-align:center; color:var(--md-sys-color-outline); font-size:0.85rem;">
          🔍 لم يتم العثور على أي منتسب يطابق: "<strong>${query}</strong>"
        </div>
      `;
      resultsEl.style.display = 'block';
      return;
    }

    resultsEl.innerHTML = matches.slice(0, 15).map(u => {
      const mr = masterRecords.find(m => m.employeeId === u.employeeId) || {};
      const sec = sections.find(s => s.id === u.sectionId) || {};
      const un = units.find(unit => unit.id === u.unitId) || {};
      const locText = sec.name ? (un.name ? `${sec.name} · ${un.name}` : sec.name) : 'القسم الرئيسي';
      const titleText = u.jobTitle || mr.jobTitle || u.role || 'منتسب';

      const escName = (u.fullName || '').replace(/'/g, "\\'");
      const escSub = `${titleText} · ${locText} (رقم: ${u.employeeId || '—'})`.replace(/'/g, "\\'");

      return `
        <div onclick="window.app.selectMailPerson('${u.id}', '${escName}', '${escSub}')"
             style="padding:0.6rem 0.8rem; border-radius:6px; cursor:pointer; display:flex; align-items:center; justify-content:space-between; gap:0.5rem; transition:background 0.15s ease; margin-bottom:2px;"
             onmouseover="this.style.background='var(--md-sys-color-surface-variant)'"
             onmouseout="this.style.background='transparent'">
          <div style="min-width:0;">
            <div style="font-weight:800; font-size:0.88rem; color:var(--md-sys-color-on-surface); display:flex; align-items:center; gap:0.4rem;">
              <span>${u.fullName}</span>
              ${u.employeeId ? `<span style="font-size:0.72rem; background:rgba(11,87,208,0.1); color:var(--md-sys-color-primary); padding:0.1rem 0.4rem; border-radius:4px; font-weight:800;">${u.employeeId}</span>` : ''}
            </div>
            <div style="font-size:0.76rem; color:var(--md-sys-color-outline); margin-top:2px;">
              ${titleText} · <span style="color:var(--md-sys-color-primary);">${locText}</span>
            </div>
          </div>
          <span style="font-size:0.75rem; color:var(--md-sys-color-primary); font-weight:800; flex-shrink:0;">اختيار ↵</span>
        </div>
      `;
    }).join('');
    resultsEl.style.display = 'block';
  };

  // اختيار شخص وتثبيته
  app.selectMailPerson = function(userId, userName, subInfo) {
    const idInput = document.getElementById('mailSelectedPersonId');
    const nameInput = document.getElementById('mailSelectedPersonName');
    const badge = document.getElementById('mailSelectedPersonBadge');
    const titleEl = document.getElementById('mailSelectedPersonTitle');
    const subEl = document.getElementById('mailSelectedPersonSub');
    const searchWrapper = document.getElementById('mailPersonSearchInputWrapper');
    const resultsEl = document.getElementById('mailPersonSearchResults');

    if (idInput) idInput.value = userId;
    if (nameInput) nameInput.value = userName;
    if (titleEl) titleEl.textContent = userName;
    if (subEl) subEl.textContent = subInfo || '';
    if (badge) badge.style.display = 'flex';
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
    const badge = document.getElementById('mailSelectedPersonBadge');
    const searchWrapper = document.getElementById('mailPersonSearchInputWrapper');
    const searchInput = document.getElementById('mailPersonSearchInput');
    const resultsEl = document.getElementById('mailPersonSearchResults');

    if (idInput) idInput.value = '';
    if (nameInput) nameInput.value = '';
    if (badge) badge.style.display = 'none';
    if (searchWrapper) searchWrapper.style.display = 'block';
    if (searchInput) {
      searchInput.value = '';
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
    }
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
    const user = window.auth.getCurrentUser();
    if (!user) return;

    const form = document.getElementById('mailComposeForm');
    const mailTypeEl = form.querySelector('input[name="mailType"]:checked');
    const subjectEl = document.getElementById('mailSubject');
    const bodyEl = document.getElementById('mailBody');
    const toLevelEl = document.getElementById('mailToLevel');
    const toTargetEl = document.getElementById('mailToTargetId');
    const modal = document.getElementById('mailComposeModal');

    const mailType = mailTypeEl ? mailTypeEl.value : 'public';
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
      app.closeComposeMailModal();
      app.showToast && app.showToast(`✅ تم إرسال البريد ${result.mail.id} بنجاح`, 'success');
      app.render();
    } else {
      alert('⚠️ حدث خطأ أثناء إرسال البريد');
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

// تصدير للاستخدام العالمي
window.renderMailTab = renderMailTab;
window.buildMailViewerContent = buildMailViewerContent;
window.sendMail = sendMail;
window.markMailRead = markMailRead;
window.replyToMail = replyToMail;
window.deleteMail = deleteMail;
window.getMailsForContext = getMailsForContext;
window.openWhatsAppForMail = openWhatsAppForMail;
window.openEmailForMail = openEmailForMail;
window.registerMailAppMethods = registerMailAppMethods;
