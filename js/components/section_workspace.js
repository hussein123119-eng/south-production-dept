/* ==========================================================================
   إدارة قسم الإنتاج الجنوبي - Section Workspace Component (الشعب والاستمارات)
   ========================================================================== */

function renderSectionWorkspaceView(sectionId) {
  const user = window.auth.getCurrentUser();
  const db = window.store.getDb();
  const section = (db.sections || []).find(s => s.id === sectionId);

  if (!section) {
    return `
      <div class="card" style="text-align: center; padding: 3rem; color: var(--md-sys-color-error);">
        <h2>⚠️ الشعبة غير موجودة أو تم نقلها</h2>
        <button class="btn btn-primary" onclick="window.app.navigate('sections')" style="margin-top: 1rem;">العودة لقائمة الشعب</button>
      </div>
    `;
  }

  const customPerms = Array.isArray(user.customPermissions) ? user.customPermissions : [];
  const hasGlobalAccess = ['SUPER_ADMIN', 'DEPT_MANAGER'].includes(user.role) ||
                          customPerms.includes('SCOPE_ALL_SECTIONS') ||
                          customPerms.includes('ALL_SECTIONS_UNITS_ACCESS') ||
                          user.hasGlobalAccess === true;

  // Strict Section Isolation: Restrict access to user's assigned section only
  if (!hasGlobalAccess && user.sectionId && user.sectionId !== section.id) {
    const userSec = (db.sections || []).find(s => s.id === user.sectionId);
    return `
      <div class="card" style="text-align: center; padding: 3.5rem 1.5rem; max-width: 680px; margin: 2rem auto; border-top: 4px solid var(--md-sys-color-error); box-shadow: 0 10px 30px rgba(0,0,0,0.08); border-radius: 16px;">
        <div style="font-size: 3.5rem; margin-bottom: 1rem;">🔒</div>
        <h2 style="font-weight: 800; color: var(--md-sys-color-error); margin-bottom: 0.75rem; font-size: 1.5rem;">
          وصول مقيد - غير مصرح بالدخول
        </h2>
        <p style="color: var(--md-sys-color-on-surface); font-size: 1rem; line-height: 1.7; margin-bottom: 1.5rem;">
          حسب ضوابط الصلاحيات الإدارية المعتمدة (RBAC)، فإن محتوى ومراسلات وتبليغات <strong>${section.name}</strong> مقتصرة على منسوبي ومسؤولي هذه الشعبة فقط.
        </p>
        <div style="background: var(--md-sys-color-surface-variant); padding: 0.85rem 1.25rem; border-radius: 10px; margin-bottom: 1.5rem; font-size: 0.9rem; display: inline-flex; align-items: center; gap: 0.5rem;">
          <span>شعبتك التابع لها حالياً:</span>
          <strong style="color: var(--md-sys-color-primary);">${userSec ? userSec.name : 'شعبة أخرى'}</strong>
        </div>
        <div style="display: flex; justify-content: center; gap: 1rem; flex-wrap: wrap;">
          ${userSec ? `
            <button class="btn btn-primary" onclick="window.app.navigate('section_workspace', '${userSec.id}')" style="font-weight: 700;">
              الذهاب إلى مساحة عمل شعبتك (${userSec.name}) ←
            </button>
          ` : ''}
          <button class="btn btn-outline" onclick="window.app.navigate('sections')" style="font-weight: 700;">
            العودة لقائمة الشعب
          </button>
        </div>
      </div>
    `;
  }

  const manager = window.store.getUserById(section.managerId);
  const deputyManager = section.deputyManagerId 
    ? window.store.getUserById(section.deputyManagerId) 
    : ((db.users || []).find(u => u.sectionId === section.id && (u.role === 'DEPUTY_SECTION_MANAGER' || u.role === 'DEPUTY_DEPT_MANAGER')) || (section.deputyManagerName ? { fullName: section.deputyManagerName } : null));
  const stations = window.store.getStations(user.departmentId, section.id);
  const sectionStaff = (db.users || []).filter(u => u.sectionId === section.id && u.status === 'APPROVED');
  const sectionDocs = (db.documents || []).filter(d => d.sectionId === section.id || stations.some(st => st.id === d.stationId));
  const activeVehicles = (db.vehicleMovements || []).filter(v => v.sectionId === section.id && v.status === 'IN_TRANSIT');
  const sectionTechStatuses = (window.store && typeof window.store.getTechnicalStatuses === 'function') 
    ? window.store.getTechnicalStatuses(user.departmentId, { sectionId: section.id }, user) 
    : [];
  const sectionNotifs = (window.store && typeof window.store.getSectionNotifications === 'function')
    ? window.store.getSectionNotifications(section.id, user)
    : [];
  const deptNotifs = (window.store && typeof window.store.getOfficialNotifications === 'function')
    ? window.store.getOfficialNotifications(section.departmentId, user).filter(n => n.targetScope === 'ALL_SECTIONS' || !n.targetSectionId || n.targetSectionId === section.id)
    : [];
  const totalNotifsCount = sectionNotifs.length + deptNotifs.length;
  const sectionRequests = (db.requests || []).filter(r => {
    const reqUser = window.store.getUserById(r.userId);
    return reqUser && reqUser.sectionId === section.id;
  });

  const activeSubTab = (window.app && window.app.currentSectionSubTab) || 'staff';

  return `
    <div style="margin-bottom: 1.5rem;">
      <div style="display: flex; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; gap: 1.25rem;">
        <div style="flex: 1 1 320px; min-width: 280px;">
          <button class="btn btn-sm" onclick="window.app.navigate('sections')" 
                  style="margin-bottom: 0.65rem; border-radius: 10px; font-weight: 700; font-size: 0.84rem; background: var(--md-sys-color-surface); border: 1.5px solid var(--md-sys-color-surface-variant); color: var(--md-sys-color-primary); box-shadow: 0 2px 6px rgba(0,0,0,0.03); display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.4rem 0.85rem; cursor: pointer;">
            ← العودة إلى قائمة الشعب
          </button>
          <h2 style="font-size: 1.8rem; font-weight: 800; color: var(--md-sys-color-primary); margin: 0;">${section.name}</h2>
        </div>
        <div style="display: flex; gap: 0.65rem; align-items: center; flex-wrap: wrap; margin-right: auto; justify-content: flex-end;">
          <!-- زر 1: طلب مقابلة الإدارة -->
          <button class="btn btn-glass-amber" onclick="window.app.openCreateInterviewRequestModal()" title="طلب مقابلة رسمي مع الإدارة">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            <span>طلب مقابلة الإدارة</span>
          </button>

          <!-- زر 2: تحديث بيانات كادر الشعبة -->
          <button class="btn btn-glass-primary" onclick="window.app.openSectionDataEntryModal('${section.id}')" title="تحديث بيانات الكادر">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
            <span>تحديث بيانات كادر الشعبة</span>
          </button>

          <!-- بطاقة القيادة الإدارية للشعبة: المسؤول والوكيل (تصميم زجاجي مكبّر ومميز) -->
          <div class="executive-leadership-card" style="padding: 0.55rem 1.15rem; border-radius: 14px; background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.92) 100%); border: 1.5px solid rgba(11, 87, 208, 0.22); box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05), inset 0 1px 1px rgba(255, 255, 255, 0.9); display: inline-flex; align-items: center; gap: 0.8rem; min-width: 220px; backdrop-filter: blur(10px);">
            <span class="nav-icon-box icon-emerald" style="width: 36px; height: 36px; min-width: 36px; border-radius: 9px; box-shadow: 0 2px 8px rgba(16, 185, 129, 0.25); display: flex; align-items: center; justify-content: center;">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </span>
            <div style="display: flex; flex-direction: column; justify-content: center; text-align: right; gap: 2px;">
              <div style="display: flex; align-items: baseline; gap: 0.35rem;">
                <span style="font-size: 0.72rem; font-weight: 800; color: var(--md-sys-color-primary); white-space: nowrap;">مسؤول الشعبة:</span>
                <span style="font-size: 0.92rem; font-weight: 900; color: var(--md-sys-color-on-surface); line-height: 1.2;">${manager ? manager.fullName : 'شاغر / قيد التعيين'}</span>
              </div>
              <div style="display: flex; align-items: baseline; gap: 0.35rem; border-top: 1px dashed rgba(0, 0, 0, 0.09); padding-top: 2px; margin-top: 1px;">
                <span style="font-size: 0.7rem; font-weight: 800; color: #d97706; white-space: nowrap;">وكيل المسؤول:</span>
                <span style="font-size: 0.85rem; font-weight: 800; color: #b45309; line-height: 1.2;">${deputyManager ? deputyManager.fullName : (section.deputyManagerName || 'قيد التكليف')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Sub-Tabs Navigation (كادر الشعبة أولاً ثم البريد) -->
    <div class="tabs-header" style="margin-bottom: 1.5rem;">
      <button class="tab-btn ${activeSubTab === 'staff' ? 'active' : ''}" onclick="window.app.setSectionSubTab('staff')">👥 <span>كادر الشعبة</span> <span class="tab-count-badge">${sectionStaff.length}</span></button>
      <button class="tab-btn ${activeSubTab === 'mail' ? 'active' : ''}" onclick="window.app.setSectionSubTab('mail')">📬 <span>البريد</span></button>
      <button class="tab-btn ${activeSubTab === 'stations' ? 'active' : ''}" onclick="window.app.setSectionSubTab('stations')">🛢️ <span>المحطات</span> <span class="tab-count-badge">${stations.length}</span></button>
      <button class="tab-btn ${activeSubTab === 'tech_status' ? 'active' : ''}" onclick="window.app.setSectionSubTab('tech_status')">⚙️ <span>الموقف الفني</span> <span class="tab-count-badge">${sectionTechStatuses.length}</span></button>
      <button class="tab-btn ${activeSubTab === 'notifs' ? 'active' : ''}" onclick="window.app.setSectionSubTab('notifs')">📢 <span>التبليغات</span> <span class="tab-count-badge">${totalNotifsCount}</span></button>
      <button class="tab-btn ${activeSubTab === 'forms' ? 'active' : ''}" onclick="window.app.setSectionSubTab('forms')">📝 <span>الاستمارات والبيانات</span></button>
      <button class="tab-btn ${activeSubTab === 'documents' ? 'active' : ''}" onclick="window.app.setSectionSubTab('documents')">📄 <span>الوثائق والتقارير</span> <span class="tab-count-badge">${sectionDocs.length}</span></button>
      <button class="tab-btn ${activeSubTab === 'vehicles' ? 'active' : ''}" onclick="window.app.setSectionSubTab('vehicles')">🚘 <span>السيارات</span></button>
    </div>

    ${activeSubTab === 'stations' ? renderSectionStationsTab(section, stations, user) : ''}
    ${activeSubTab === 'tech_status' ? (typeof window.renderSectionTechnicalStatusTab === 'function' ? window.renderSectionTechnicalStatusTab(section, user) : '') : ''}
    ${activeSubTab === 'notifs' ? renderSectionNotificationsTab(section, sectionNotifs, deptNotifs, user, stations) : ''}
    ${activeSubTab === 'forms' ? renderSectionFormsTab(section, user, sectionRequests) : ''}
    ${activeSubTab === 'staff' ? renderSectionStaffTab(section, sectionStaff) : ''}
    ${activeSubTab === 'documents' ? renderSectionDocsTab(section, sectionDocs, user) : ''}
    ${activeSubTab === 'vehicles' ? renderSectionVehiclesTab(section, user) : ''}
    ${activeSubTab === 'mail' ? (typeof window.renderMailTab === 'function' ? window.renderMailTab({ level: 'section', id: section.id }) : '<div class="card" style="padding:2rem;text-align:center;">⏳ جاري تحميل نظام البريد...</div>') : ''}
  `;
}

function renderSectionFormsTab(section, user, sectionRequests) {
  const deptId = section.departmentId || (user ? user.departmentId : 'dept-south-prod');
  const allDocs = (window.store && typeof window.store.getDocuments === 'function') ? (window.store.getDocuments(deptId) || []) : [];
  
  // تصفية النماذج والفورمات الجاهزة الخاصة بهذه الشعبة أو المعممة رسمياً
  const sectionFormTemplates = allDocs.filter(d => {
    if (d.isArchived || d.status === 'ARCHIVED') return false;
    const isSecDoc = d.sectionId === section.id || d.scopeId === section.id;
    const isTemplateDoc = d.isTemplate === true || d.category === 'FORM_TEMPLATE' || (d.docType && d.docType.includes('TEMPLATE'));
    return (isSecDoc && isTemplateDoc) || (isSecDoc && ['WORD', 'EXCEL', 'PDF'].includes(d.category));
  });

  // تصفية الحقول المخصصة الديناميكية للشعبة (الطريقة الأولى)
  const allDynamicFields = (window.store && typeof window.store.getDynamicEmployeeFields === 'function') ? (window.store.getDynamicEmployeeFields(deptId) || []) : [];
  const sectionDynamicFields = allDynamicFields.filter(f => f.isActive !== false && (f.scope === 'GLOBAL' || (f.scope === 'SECTION' && (!f.scopeId || f.scopeId === section.id))));

  const canManageForms = ['SUPER_ADMIN', 'DEPT_MANAGER', 'SECTION_MANAGER', 'ADMINISTRATOR'].includes(user.role) || (window.rbac && window.rbac.hasPermission(user, 'CREATE_DOCUMENT'));

  return `
    <div style="display: flex; flex-direction: column; gap: 1.5rem;">

      <!-- شريط العنوان والعمليات الفورية لإدارة الفورمات -->
      <div class="card" style="border-right: 5px solid var(--md-sys-color-primary); background: linear-gradient(135deg, rgba(11, 87, 208, 0.04) 0%, rgba(2, 132, 199, 0.08) 100%);">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
          <div>
            <h3 style="font-size: 1.35rem; font-weight: 800; color: var(--md-sys-color-primary); margin: 0 0 4px 0; display: flex; align-items: center; gap: 0.5rem;">
              <span>📝</span>
              <span>مركز الاستمارات والفورمات والنماذج التشغيلية — ${section.name}</span>
            </h3>
            <p style="color: var(--md-sys-color-outline); margin: 0; font-size: 0.88rem;">
              إدارة واستعمال الفورمات المعتمدة: رفع وتحميل النماذج الجاهزة (Word/Excel/PDF)، وبناء حقول الاستمارة الإلكترونية وتعبئتها.
            </p>
          </div>
          <div style="display: flex; gap: 0.65rem; flex-wrap: wrap; align-items: center;">
            <!-- زر الطريقة الثانية: رفع فورمة جاهزة -->
            <button class="btn btn-glass-primary" onclick="window.app.openUploadSectionFormTemplateModal('${section.id}', '${section.name}')" title="رفع نموذج أو فورمة جاهزة للشعبة">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
              <span>📤 رفع فورمة جاهزة (Word/Excel/PDF)</span>
            </button>
            <!-- زر الطريقة الأولى: إضافة حقل مخصص للاستمارة -->
            <button class="btn btn-glass-amber" onclick="window.app.openCreateDynamicFieldModalFromDataEntry('${section.id}', '', '${section.name}')" title="إضافة حقل أو معلومة جديدة لاستمارة الشعبة">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 5v14M5 12h14"></path>
              </svg>
              <span>➕ إضافة حقل مخصص لفورمة الشعبة</span>
            </button>
          </div>
        </div>
      </div>

      <!-- شبكة الأرباع الهندسية المتساوية (4 أقسام متساوية الأبعاد 2x2) -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; align-items: stretch;">
        
        <!-- 1. بنك ومستودع الفورمات والنماذج الجاهزة للشعبة -->
        <div class="card" style="border-top: 4px solid #0284c7; display: flex; flex-direction: column; min-height: 420px; max-height: 420px; height: 100%; margin: 0;">
          <div class="card-header" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem; border-bottom: 1px solid var(--md-sys-color-surface-variant); padding-bottom: 0.75rem; margin-bottom: 0.85rem; flex-shrink: 0;">
            <div>
              <h3 class="card-title" style="font-size: 1.1rem; font-weight: 800; color: #0284c7; display: flex; align-items: center; gap: 0.45rem; margin: 0;">
                <span>📁</span>
                <span>بنك الفورمات والنماذج الجاهزة (${sectionFormTemplates.length})</span>
              </h3>
              <div style="font-size: 0.76rem; color: var(--md-sys-color-outline); margin-top: 2px;">
                ملفات وقوالب رسمية جاهزة للتحميل والتعبئة والطباعة
              </div>
            </div>
            <button class="btn btn-sm btn-outline" onclick="window.app.openUploadSectionFormTemplateModal('${section.id}', '${section.name}')" title="إضافة فورمة جديدة">
              <span>➕ رفع فورمة</span>
            </button>
          </div>

          <div style="flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 0.65rem; padding-right: 2px;">
            ${sectionFormTemplates.length === 0 ? `
              <div style="text-align: center; padding: 2rem 1rem; background: var(--md-sys-color-background); border-radius: var(--radius-md); border: 2px dashed var(--md-sys-color-surface-variant); margin: auto 0;">
                <div style="font-size: 2.2rem; margin-bottom: 0.35rem;">📂</div>
                <h4 style="font-weight: 800; color: var(--md-sys-color-on-surface); margin-bottom: 0.25rem; font-size: 0.95rem;">لا توجد فورمات جاهزة مرفوعة للشعبة بعد</h4>
                <p style="color: var(--md-sys-color-outline); font-size: 0.8rem; max-width: 320px; margin: 0 auto 0.85rem auto; line-height: 1.5;">
                  يمكن لمسؤول الشعبة أو الإدارة رفع نماذج واستمارات مصممة مسبقاً (Word / Excel / PDF) لتكون متاحة للكادر.
                </p>
                <button class="btn btn-glass-primary" onclick="window.app.openUploadSectionFormTemplateModal('${section.id}', '${section.name}')" style="font-size: 0.82rem; padding: 0.4rem 0.9rem;">
                  <span>📤 رفع أول فورمة جاهزة الآن</span>
                </button>
              </div>
            ` : `
              ${sectionFormTemplates.map(tmpl => {
                const isExcel = tmpl.category === 'EXCEL' || (tmpl.fileName && tmpl.fileName.match(/\.xlsx?$/i));
                const isPdf = tmpl.category === 'PDF' || (tmpl.fileName && tmpl.fileName.match(/\.pdf$/i));
                const isWord = tmpl.category === 'WORD' || (tmpl.fileName && tmpl.fileName.match(/\.docx?$/i));
                const iconBadge = isExcel ? '📊 Excel' : (isPdf ? '📕 PDF' : (isWord ? '📄 Word' : '📝 استمارة'));
                const badgeColor = isExcel ? '#059669' : (isPdf ? '#dc2626' : '#2563eb');
                const formattedDate = new Date(tmpl.createdAt || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

                return `
                  <div style="border: 1px solid var(--md-sys-color-surface-variant); border-radius: 10px; padding: 0.75rem 0.9rem; background: var(--md-sys-color-surface); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem; box-shadow: var(--shadow-1);">
                    <div style="display: flex; align-items: center; gap: 0.65rem;">
                      <div style="width: 36px; height: 36px; border-radius: 8px; background: ${isExcel ? 'rgba(16,185,129,0.15)' : (isPdf ? 'rgba(239,68,68,0.15)' : 'rgba(37,99,235,0.15)')}; color: ${isExcel ? '#059669' : (isPdf ? '#dc2626' : '#2563eb')}; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                        ${isExcel ? `
                          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="3" y1="9" x2="21" y2="9"></line>
                            <line x1="3" y1="15" x2="21" y2="15"></line>
                            <line x1="9" y1="3" x2="9" y2="21"></line>
                          </svg>
                        ` : (isPdf ? `
                          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                            <path d="M9 13h6"></path>
                            <path d="M9 17h3"></path>
                          </svg>
                        ` : `
                          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                            <path d="M8 13l1.5 4 1.5-4 1.5 4 1.5-4"></path>
                          </svg>
                        `)}
                      </div>
                      <div>
                        <div style="display: flex; align-items: center; gap: 0.35rem; margin-bottom: 2px;">
                          <span style="font-size: 0.7rem; font-weight: 800; padding: 0.05rem 0.4rem; border-radius: 4px; background: ${badgeColor}; color: #ffffff;">${iconBadge}</span>
                          <strong style="font-size: 0.88rem; color: var(--md-sys-color-on-surface);">${tmpl.title}</strong>
                        </div>
                        <div style="font-size: 0.74rem; color: var(--md-sys-color-outline); display: flex; gap: 0.6rem; align-items: center;">
                          <span>📅 ${formattedDate}</span>
                          ${tmpl.docNumber ? `<span>🆔 ${tmpl.docNumber}</span>` : ''}
                          <span>✍️ ${tmpl.createdByName || 'إدارة الشعبة'}</span>
                        </div>
                      </div>
                    </div>
                    <div style="display: flex; gap: 0.3rem; align-items: center;">
                      <button class="btn-action-view" onclick="window.app.openViewDocumentModal('${tmpl.id}')" title="معاينة وطباعة النموذج" style="padding: 0.3rem 0.65rem; font-size: 0.78rem;">
                        معاينة 🖨️
                      </button>
                      <button class="btn-action-export" onclick="window.app.downloadDocumentFile('${tmpl.id}')" title="تنزيل الملف الأصلي للفورمة" style="padding: 0.3rem 0.65rem; font-size: 0.78rem;">
                        تحميل 📥
                      </button>
                      ${canManageForms ? `
                        <button class="btn-action-trash" onclick="window.app.handleDeleteSectionFormTemplate('${tmpl.id}', '${section.id}')" title="حذف هذا النموذج">
                          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          </svg>
                        </button>
                      ` : ''}
                    </div>
                  </div>
                `;
              }).join('')}
            `}
          </div>
        </div>

        <!-- 2. حقول ومعلومات الاستمارة الإلكترونية المخصصة للشعبة -->
        <div class="card" style="border-top: 4px solid #f59e0b; display: flex; flex-direction: column; min-height: 420px; max-height: 420px; height: 100%; margin: 0;">
          <div class="card-header" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem; border-bottom: 1px solid var(--md-sys-color-surface-variant); padding-bottom: 0.75rem; margin-bottom: 0.85rem; flex-shrink: 0;">
            <div>
              <h3 class="card-title" style="font-size: 1.1rem; font-weight: 800; color: #b45309; display: flex; align-items: center; gap: 0.45rem; margin: 0;">
                <span>🧩</span>
                <span>حقول الاستمارة الإلكترونية المخصصة (${sectionDynamicFields.length})</span>
              </h3>
              <div style="font-size: 0.76rem; color: var(--md-sys-color-outline); margin-top: 2px;">
                معلومات وحقول ذكية مضافة لاستمارة كادر الشعبة تُحفظ في قاعدة البيانات
              </div>
            </div>
            <button class="btn btn-sm btn-outline" onclick="window.app.openCreateDynamicFieldModalFromDataEntry('${section.id}', '', '${section.name}')" title="إضافة حقل جديد">
              <span>➕ إضافة حقل</span>
            </button>
          </div>

          <div style="flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 0.55rem; padding-right: 2px; margin-bottom: 0.65rem;">
            ${sectionDynamicFields.length === 0 ? `
              <div style="text-align: center; padding: 2rem 1rem; background: var(--md-sys-color-background); border-radius: var(--radius-md); color: var(--md-sys-color-outline); font-size: 0.82rem; margin: auto 0;">
                لا توجد حقول مخصصة إضافية حالياً. اضغط على [➕ إضافة حقل] لإضافة أي معلومة ترغب بجمعها من كادر الشعبة.
              </div>
            ` : `
              ${sectionDynamicFields.map(f => {
                const typeLabels = {
                  text: 'نص عادي 📝',
                  number: 'رقم عددي 🔢',
                  date: 'تاريخ 📅',
                  select: 'قائمة خيارات 📋',
                  textarea: 'نص تفصيلي 📜'
                };
                const scopeLabel = f.scope === 'GLOBAL' ? '🌐 شامل للقسم' : `🏢 خاص بـ ${section.name}`;
                return `
                  <div style="padding: 0.65rem 0.85rem; border: 1px solid var(--md-sys-color-surface-variant); border-radius: 9px; background: var(--md-sys-color-surface); display: flex; justify-content: space-between; align-items: center; gap: 0.5rem;">
                    <div>
                      <div style="display: flex; align-items: center; gap: 0.4rem; margin-bottom: 2px;">
                        <strong style="font-size: 0.86rem; color: var(--md-sys-color-on-surface);">${f.name}</strong>
                        ${f.isRequired ? '<span class="badge badge-danger" style="font-size: 0.65rem; padding: 0.05rem 0.35rem;">إلزامي</span>' : ''}
                      </div>
                      <div style="font-size: 0.72rem; color: var(--md-sys-color-outline); display: flex; gap: 0.5rem;">
                        <span>النوع: ${typeLabels[f.type] || f.type}</span>
                        <span>النطاق: ${scopeLabel}</span>
                      </div>
                    </div>
                    <div style="display: flex; gap: 0.3rem; align-items: center;">
                      ${canManageForms && f.scope !== 'GLOBAL' ? `
                        <button class="btn-action-trash" onclick="window.app.handleDeleteDynamicFieldFromSection('${f.id}', '${section.id}')" title="حذف هذا الحقل">
                          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          </svg>
                        </button>
                      ` : ''}
                    </div>
                  </div>
                `;
              }).join('')}
            `}
          </div>

          <!-- زر تعبئة وتحديث البيانات بالحقول المخصصة -->
          <div style="border-top: 1px dashed var(--md-sys-color-surface-variant); padding-top: 0.65rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.4rem; flex-shrink: 0; margin-top: auto;">
            <span style="font-size: 0.78rem; color: var(--md-sys-color-outline);">لتحديث سجلات الكادر:</span>
            <button class="btn btn-save-prominent" onclick="window.app.openSectionDataEntryModal('${section.id}')" style="padding: 0.4rem 1rem; font-size: 0.82rem;">
              <span>📝 تعبئة وتحديث بيانات كادر الشعبة</span>
            </button>
          </div>
        </div>

        <!-- 3. الاستمارات الإلكترونية التشغيلية المباشرة -->
        <div class="card" style="border-top: 4px solid var(--md-sys-color-primary); display: flex; flex-direction: column; min-height: 420px; max-height: 420px; height: 100%; margin: 0;">
          <div class="card-header" style="border-bottom: 1px solid var(--md-sys-color-surface-variant); padding-bottom: 0.75rem; margin-bottom: 0.85rem; flex-shrink: 0;">
            <h3 class="card-title" style="font-size: 1.1rem; font-weight: 800; color: var(--md-sys-color-primary); display: flex; align-items: center; gap: 0.45rem; margin: 0;">
              <span>⚡</span>
              <span>الاستمارات الإلكترونية التشغيلية المباشرة لـ ${section.name}</span>
            </h3>
            <div style="font-size: 0.76rem; color: var(--md-sys-color-outline); margin-top: 2px;">
              استمارات سريعة لمعاملات الكادر والمواقف الميدانية المباشرة
            </div>
          </div>

          <div style="flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 0.55rem; padding-right: 2px;">
            <!-- طلب مقابلة -->
            <div style="padding: 0.65rem 0.85rem; border: 1.5px solid rgba(11, 87, 208, 0.2); border-radius: var(--radius-sm); display: flex; justify-content: space-between; align-items: center; background: linear-gradient(135deg, rgba(11, 87, 208, 0.03) 0%, rgba(2, 132, 199, 0.06) 100%);">
              <div>
                <strong style="color: var(--md-sys-color-primary); font-size: 0.86rem;">🤝 طلب مقابلة إدارة القسم</strong>
                <div style="font-size: 0.72rem; color: var(--md-sys-color-outline);">حجز موعد رسمي مع مدير القسم</div>
              </div>
              <button class="btn btn-primary" onclick="window.app.openCreateInterviewRequestModal()" style="padding: 0.3rem 0.75rem; font-size: 0.78rem;">
                <span>تقديم طلب</span>
              </button>
            </div>

            <!-- موقف فني -->
            <div style="padding: 0.65rem 0.85rem; border: 1px solid var(--md-sys-color-surface-variant); border-radius: var(--radius-sm); display: flex; justify-content: space-between; align-items: center; background: var(--md-sys-color-surface);">
              <div>
                <strong style="color: var(--md-sys-color-on-surface); font-size: 0.86rem;">⚙️ استمارة الموقف الفني التشغيلي</strong>
                <div style="font-size: 0.72rem; color: var(--md-sys-color-outline);">توثيق حالات المحطات والضغوط والصيانة</div>
              </div>
              <button class="btn-action-broadcast" onclick="window.app.openCreateTechnicalStatusModal('${section.id}')" style="padding: 0.3rem 0.75rem; font-size: 0.78rem;">
                <span>تعبئة الموقف</span>
              </button>
            </div>

            <!-- طلب تصريح أو نقل -->
            <div style="padding: 0.65rem 0.85rem; border: 1px solid var(--md-sys-color-surface-variant); border-radius: var(--radius-sm); display: flex; justify-content: space-between; align-items: center; background: var(--md-sys-color-surface);">
              <div>
                <strong style="color: var(--md-sys-color-on-surface); font-size: 0.86rem;">📦 استمارة تصريح عمل ونقل مواد</strong>
                <div style="font-size: 0.72rem; color: var(--md-sys-color-outline);">نقل معدات ومواد بين المحطات ومقر الشعبة</div>
              </div>
              <button class="btn-action-view" onclick="window.app.openSubmitRequestModal()" style="padding: 0.3rem 0.75rem; font-size: 0.78rem;">
                <span>تقديم تصريح</span>
              </button>
            </div>

            <!-- إجازات -->
            <div style="padding: 0.65rem 0.85rem; border: 1px solid var(--md-sys-color-surface-variant); border-radius: var(--radius-sm); display: flex; justify-content: space-between; align-items: center; background: var(--md-sys-color-surface);">
              <div>
                <strong style="color: var(--md-sys-color-on-surface); font-size: 0.86rem;">🏖️ استمارة طلب إجازة رسمية أو خفر</strong>
                <div style="font-size: 0.72rem; color: var(--md-sys-color-outline);">اعتيادية، مرضية، تعويضية، خفر محطات</div>
              </div>
              <button class="btn-action-export" onclick="window.app.openSubmitRequestModal()" style="padding: 0.3rem 0.75rem; font-size: 0.78rem;">
                <span>طلب إجازة</span>
              </button>
            </div>
          </div>
        </div>

        <!-- 4. سجل المعاملات والاستمارات المقدمة -->
        <div class="card" style="border-top: 4px solid #10b981; display: flex; flex-direction: column; min-height: 420px; max-height: 420px; height: 100%; margin: 0;">
          <div class="card-header" style="border-bottom: 1px solid var(--md-sys-color-surface-variant); padding-bottom: 0.75rem; margin-bottom: 0.85rem; flex-shrink: 0;">
            <h3 class="card-title" style="font-size: 1.1rem; font-weight: 800; color: #10b981; display: flex; align-items: center; gap: 0.45rem; margin: 0;">
              <span>📋</span>
              <span>سجل المعاملات والاستمارات المقدمة (${sectionRequests.length})</span>
            </h3>
            <div style="font-size: 0.76rem; color: var(--md-sys-color-outline); margin-top: 2px;">
              متابعة حالة وتاريخ المعاملات المرفوعة من كادر الشعبة
            </div>
          </div>

          <div class="table-container" style="flex: 1; overflow-y: auto; max-height: none;">
            <table class="data-table">
              <thead>
                <tr>
                  <th>نوع الاستمارة</th>
                  <th>مقدم الاستمارة</th>
                  <th>التاريخ</th>
                  <th>الحالة</th>
                </tr>
              </thead>
              <tbody>
                ${sectionRequests.map(r => `
                  <tr>
                    <td><strong>${r.typeTitle}</strong></td>
                    <td>${r.userName}</td>
                    <td>${new Date(r.createdAt).toLocaleDateString('ar-IQ')}</td>
                    <td>
                      <span class="badge ${r.status === 'APPROVED' ? 'badge-success' : 'badge-warning'}">
                        ${r.status === 'APPROVED' ? 'معتمد' : 'قيد المتابعة'}
                      </span>
                    </td>
                  </tr>
                `).join('')}
                ${sectionRequests.length === 0 ? '<tr><td colspan="4" style="text-align: center; padding: 2.5rem 1rem; color: var(--md-sys-color-outline); font-size: 0.84rem;">لا توجد معاملات مقدمة في هذه الشعبة مؤخراً.</td></tr>' : ''}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  `;
}

function renderSectionStationsTab(section, stations, user) {
  return `
    <div>
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
        <h3 style="font-size: 1.2rem; font-weight: 700;">قائمة المحطات الإنتاجية والمجمعات</h3>
        ${window.rbac.hasPermission(user, 'MANAGE_STATIONS') ? `
          <button class="btn btn-glass-primary" onclick="window.app.openCreateStationModal('${section.id}')" title="إضافة محطة جديدة تابعة للشعبة">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 5v14M5 12h14"></path>
            </svg>
            <span>إضافة محطة جديدة للشعبة</span>
            <span style="font-size: 1.05rem;">🏭</span>
          </button>
        ` : ''}
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem;">
        ${stations.map(st => {
          const stManager = window.store.getUserById(st.managerId);
          return `
            <div class="card" style="display: flex; flex-direction: column; justify-content: space-between; border-top: 4px solid var(--md-sys-color-primary);">
              <div>
                <div class="card-header" style="margin-bottom: 0.75rem;">
                  <h4 class="card-title">${st.name}</h4>
                  <span class="badge badge-success">${st.status === 'OPERATIONAL' ? 'تعمل بكفاءة' : st.status}</span>
                </div>
                <div style="display: flex; flex-direction: column; gap: 0.5rem; font-size: 0.875rem; margin-bottom: 1.25rem;">
                  <div><span style="color: var(--md-sys-color-outline);">رمز المحطة:</span> <strong>${st.code}</strong></div>
                  <div><span style="color: var(--md-sys-color-outline);">الطاقة الإنتاجية:</span> <strong>${st.capacity}</strong></div>
                  <div><span style="color: var(--md-sys-color-outline);">المسؤول المباشر:</span> <strong>${stManager ? stManager.fullName : 'شاغر'}</strong></div>
                  <div><span style="color: var(--md-sys-color-outline);">آخر صيانة وقائية:</span> ${st.lastMaintenance || '2026-01-15'}</div>
                </div>
              </div>
              <div style="display: flex; gap: 0.5rem;">
                <button class="btn btn-glass-primary" style="flex: 1; border-radius: var(--radius-full);" onclick="window.app.navigate('station_workspace', '${st.id}')" title="الدخول إلى مساحة عمل المحطة والموقف الفني">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                    <polyline points="15 3 21 3 21 9"></polyline>
                    <line x1="10" y1="14" x2="21" y2="3"></line>
                  </svg>
                  <span>فتح مساحة المحطة</span>
                  <span style="font-size: 1.05rem;">🏭 ←</span>
                </button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

function renderSectionStaffTab(section, staff) {
  const actorUser = window.auth.getCurrentUser();
  const deptId = (section && section.departmentId) || (actorUser ? actorUser.departmentId : 'dept-south-prod');
  const allMasterRecords = (window.store && typeof window.store.getEmployeeMasterRecords === 'function') 
    ? window.store.getEmployeeMasterRecords(deptId) 
    : [];
  const sectionMasterStaff = allMasterRecords.filter(m => section && m.sectionId === section.id);

  return `
    <div class="card">
      <div class="card-header" style="flex-wrap: wrap; gap: 1rem;">
        <div>
          <h3 class="card-title">👥 كادر ${section.name}</h3>
          <p style="color: var(--md-sys-color-outline); font-size: 0.82rem; margin: 0.25rem 0 0 0;">
            عرض ومتابعة بيانات منتسبي الشعبة والمحطات التابعة لها، وأي تحديث مركزي ينعكس هنا تلقائياً.
          </p>
        </div>
        <div style="display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap;">
          <input type="text" id="sectionStaffSearchInput" class="form-control" style="width: 230px; font-size: 0.85rem; padding: 0.38rem 0.85rem;" placeholder="🔍 بحث بالاسم، الرقم، أو المحطة..." oninput="window.app.filterSectionStaffTable()">
          <span class="badge badge-primary" style="font-size: 0.85rem; padding: 0.4rem 0.8rem;" id="sectionStaffCountBadge">
            👥 كادر الشعبة: ${sectionMasterStaff.length} موظف
          </span>
          <button class="btn btn-glass-primary" onclick="window.app.openCustomStaffExportModal({ sectionId: '${section.id}', scopeType: 'SECTION' })" title="أداة التصدير والطباعة المخصصة لبيانات كادر ${section.name} (Excel, Word, PDF)" style="padding: 0.35rem 0.85rem; font-size: 0.84rem;">
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            <span>تصدير وطباعة مخصصة</span>
            <span style="font-size: 0.95rem;">⚡</span>
          </button>
        </div>
      </div>

      <div class="table-container" style="overflow-x: auto;">
        <table class="data-table" style="font-size: 0.88rem;">
          <thead>
            <tr>
              <th style="min-width: 200px;">الاسم</th>
              <th style="min-width: 120px;">الرقم الوظيفي</th>
              <th style="min-width: 150px;">جهة الارتباط</th>
              <th style="min-width: 130px;">العنوان الوظيفي</th>
              <th style="min-width: 120px;">الدور</th>
              <th style="min-width: 140px;">الهاتف / واتساب</th>
              <th style="min-width: 190px; text-align: center;">الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            ${sectionMasterStaff.map(emp => {
              const st = emp.stationId ? window.store.getStationById(emp.stationId) : null;
              const roleInfo = (window.rbac && typeof window.rbac.getRoleInfo === 'function' && window.rbac.getRoleInfo(emp.role)) 
                || { name: emp.role || 'منتسب', badgeClass: 'badge-secondary' };
              const empPhone = emp.phone || emp.mobile || '';
              const empEmail = emp.userEmail || emp.emailPersonal || emp.email || '';

              // Check if employee is shift worker and get shift letter
              const rawShift = emp.assignedShift || emp.shift || emp.workShift || emp.workSchedule || '';
              const rawSchedule = String(emp.workShift || emp.workSchedule || '').trim();
              const isMorning = rawSchedule === 'صباحي' || rawShift === 'صباحي' || String(emp.jobTitle || '').includes('صباحي');
              const isShiftWorker = !isMorning && (
                rawSchedule === 'مناوب' || 
                emp.workShift === 'مناوب' || 
                (rawShift && rawShift !== 'صباحي' && rawShift !== 'حقلي') ||
                /[ABCDأبجد]/.test(String(rawShift)) ||
                String(emp.jobTitle || '').includes('نوبة')
              );

              let shiftLetter = '';
              if (isShiftWorker) {
                const match = String(rawShift + ' ' + (emp.jobTitle || '')).match(/(?:نوبة\s*([ABCDأبجد])|([ABCDأبجد]))/i);
                if (match) {
                  const rawChar = (match[1] || match[2] || '').toUpperCase();
                  if (rawChar === 'A' || rawChar === 'أ') shiftLetter = 'A';
                  else if (rawChar === 'B' || rawChar === 'ب') shiftLetter = 'B';
                  else if (rawChar === 'C' || rawChar === 'ج') shiftLetter = 'C';
                  else if (rawChar === 'D' || rawChar === 'د') shiftLetter = 'D';
                }
                if (!shiftLetter && (emp.workShift === 'مناوب' || isShiftWorker)) {
                  shiftLetter = 'A';
                }
              }

              const currentActiveShiftLetter = (window.store && typeof window.store.getCurrentShiftInfo === 'function')
                ? (window.store.getCurrentShiftInfo().currentShift || '').toUpperCase()
                : '';
              const isActiveShift = isShiftWorker && shiftLetter && (shiftLetter === currentActiveShiftLetter);

              return `
                <tr class="section-staff-row" 
                    data-name="${(emp.fullName || '').toLowerCase()}" 
                    data-empid="${(emp.employeeId || '').toLowerCase()}" 
                    data-station="${(st ? st.name : section.name).toLowerCase()}" 
                    data-title="${(emp.jobTitle || '').toLowerCase()}" 
                    data-phone="${(emp.phone || '').toLowerCase()}">
                  
                  <!-- 1. الاسم -->
                  <td>
                    <div style="display: flex; align-items: center; gap: 0.6rem; min-width: 0;">
                      <div style="width: 34px; height: 34px; border-radius: 50%; background: var(--md-sys-color-primary); color: white; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.88rem; flex-shrink: 0;">
                        ${(emp.fullName || 'م').substring(0, 2)}
                      </div>
                      <div style="min-width: 0;">
                        <strong style="font-size: 0.92rem; color: var(--md-sys-color-on-surface); white-space: nowrap; display: block;" title="${emp.fullName}">${emp.fullName}</strong>
                        <div style="font-size: 0.75rem; color: var(--md-sys-color-outline); white-space: nowrap;">${emp.userEmail || emp.emailPersonal || emp.phone || 'منتسب بالشعبة'}</div>
                      </div>
                    </div>
                  </td>

                  <!-- 2. الرقم الوظيفي -->
                  <td style="font-family: monospace; font-weight: 700; white-space: nowrap;">
                    <code>${emp.employeeId}</code>
                  </td>

                  <!-- 3. جهة الارتباط -->
                  <td>
                    <div style="font-weight: 700; color: var(--md-sys-color-on-surface); white-space: nowrap;">${section.name}</div>
                    ${st ? `
                      <div class="roster-location-sub" style="font-size: 0.76rem; color: var(--md-sys-color-outline); margin-top: 2px; white-space: nowrap; display: flex; align-items: center; gap: 0.25rem;">
                        <span style="font-weight: 700; color: var(--md-sys-color-primary);">${st.name}</span>
                        ${isShiftWorker && shiftLetter ? `<span class="roster-shift-pill shift-${shiftLetter} ${isActiveShift ? 'active-working-shift' : ''}" title="${isActiveShift ? `🟢 النوبة العاملة حالياً (${shiftLetter})` : `نوبة الموظف: (${shiftLetter})`}">${isActiveShift ? '<span class="shift-mini-ping"></span>' : ''}${shiftLetter}</span>` : ''}
                      </div>
                    ` : (isShiftWorker && shiftLetter ? `
                      <div class="roster-location-sub" style="font-size: 0.76rem; color: var(--md-sys-color-outline); margin-top: 2px; white-space: nowrap;">
                        <span class="roster-shift-pill shift-${shiftLetter} ${isActiveShift ? 'active-working-shift' : ''}" title="${isActiveShift ? `🟢 النوبة العاملة حالياً (${shiftLetter})` : `نوبة الموظف: (${shiftLetter})`}">${isActiveShift ? '<span class="shift-mini-ping"></span>' : ''}${shiftLetter}</span>
                      </div>
                    ` : '')}
                  </td>

                  <!-- 4. العنوان الوظيفي -->
                  <td>
                    <span class="badge" style="background: var(--md-sys-color-surface-variant); color: var(--md-sys-color-on-surface); font-size: 0.82rem; font-weight: 600; max-width: 170px; display: inline-block; overflow: hidden; text-overflow: ellipsis; vertical-align: middle; white-space: nowrap;" title="${emp.jobTitle || 'موظف'}">
                      ${emp.jobTitle || 'موظف'}
                    </span>
                  </td>

                  <!-- 5. الدور -->
                  <td>
                    <span class="badge ${roleInfo.badgeClass || 'badge-secondary'}" style="font-size: 0.78rem; max-width: 150px; display: inline-block; overflow: hidden; text-overflow: ellipsis; vertical-align: middle; white-space: nowrap;" title="${roleInfo.name || emp.role}">
                      ${roleInfo.name || emp.role || 'منتسب'}
                    </span>
                  </td>

                  <!-- 6. الهاتف / واتساب -->
                  <td>
                    ${empPhone ? `
                      <div style="direction: ltr; text-align: right; font-family: monospace; font-weight: 700; color: var(--md-sys-color-on-surface); font-size: 0.86rem; letter-spacing: 0.5px;">
                        ${empPhone}
                      </div>
                    ` : '<span style="color: var(--md-sys-color-outline); font-size: 0.78rem;">غير مسجل</span>'}
                  </td>

                  <!-- 7. الإجراءات (الإضبارة والمراسلة) -->
                  <td style="text-align: center; white-space: nowrap;">
                    <div style="display: flex; gap: 0.4rem; justify-content: center; align-items: center; flex-wrap: wrap;">
                      <button class="btn-action-view" onclick="window.app.openMasterDossierModal('${emp.employeeId}')" title="معاينة الإضبارة الموحدة" style="padding: 0.3rem 0.65rem;">
                        <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                        </svg>
                        <span>معاينة الإضبارة</span>
                      </button>
                      <button class="btn-circle-email btn-action-email" onclick="window.app.openDirectEmail('${empEmail}', '${(emp.fullName || '').replace(/'/g, "\\'")}')" title="مراسلة عبر البريد الإلكتروني (${empEmail || 'غير مسجل'})">
                        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                          <rect x="2" y="4" width="20" height="16" rx="3"></rect>
                          <path d="M22 7l-10 7L2 7"></path>
                        </svg>
                      </button>
                      <button class="btn-circle-whatsapp btn-action-whatsapp" onclick="window.app.openDirectWhatsApp('${empPhone}', '${(emp.fullName || '').replace(/'/g, "\\'")}')" title="تواصل عبر واتساب (${empPhone || 'غير مسجل'})">
                        <svg viewBox="0 0 24 24" width="15" height="15" fill="#ffffff">
                          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              `;
            }).join('')}
            ${sectionMasterStaff.length === 0 ? '<tr><td colspan="7" style="text-align: center; padding: 2.5rem; color: var(--md-sys-color-outline);">لا يوجد منتسبون مرتبطون بهذه الشعبة حالياً في السجل الموحد.</td></tr>' : ''}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderSectionDocsTab(section, docs, user) {
  return `
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">أرشيف تقارير ومستندات ${section.name}</h3>
        ${window.rbac.hasPermission(user, 'CREATE_DOCUMENT') ? `
          <button class="btn btn-glass-primary" onclick="window.app.openCreateWordDocModal(null, '${section.id}')" title="إنشاء تقرير أو مستند جديد للشعبة">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 5v14M5 12h14"></path>
            </svg>
            <span>تقرير جديد للشعبة</span>
            <span style="font-size: 1.05rem;">📄</span>
          </button>
        ` : ''}
      </div>
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>عنوان المستند</th>
              <th>النوع</th>
              <th>المحطة المعنية</th>
              <th>المنشئ</th>
              <th>تاريخ التحديث</th>
              <th>إجراءات</th>
            </tr>
          </thead>
          <tbody>
            ${docs.map(d => {
              const st = d.stationId ? window.store.getStationById(d.stationId) : null;
              return `
                <tr>
                  <td><strong>${d.title}</strong></td>
                  <td><span class="badge ${d.category === 'WORD' ? 'badge-info' : 'badge-success'}">${d.category}</span></td>
                  <td>${st ? st.name : 'الشعبة عامة'}</td>
                  <td>${d.createdByName}</td>
                  <td>${new Date(d.updatedAt).toLocaleDateString('ar-IQ')}</td>
                  <td>
                    <div style="display: flex; align-items: center; gap: 0.35rem;">
                      <button class="btn-action-view" onclick="window.app.openViewDocumentModal('${d.id}')" title="معاينة المستند">معاينة</button>
                      <button class="btn-action-export" onclick="window.app.exportDocumentFile('${d.id}')" title="تصدير المستند">تصدير</button>
                      <button class="btn-circle-whatsapp btn-share-whatsapp" onclick="window.app.shareViaWhatsApp('${(d.title || '').replace(/'/g, "\\'")}')" title="مشاركة عبر واتساب">
                        <svg viewBox="0 0 24 24" width="15" height="15" fill="#ffffff">
                          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                        </svg>
                      </button>
                      <button class="btn-circle-email btn-share-email" onclick="window.app.shareViaOutlook('${(d.title || '').replace(/'/g, "\\'")}')" title="مشاركة عبر البريد الإلكتروني">
                        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                          <rect x="2" y="4" width="20" height="16" rx="3"></rect>
                          <path d="M22 7l-10 7L2 7"></path>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              `;
            }).join('')}
            ${docs.length === 0 ? '<tr><td colspan="6" style="text-align: center; padding: 2rem;">لا توجد مستندات مسجلة لهذه الشعبة.</td></tr>' : ''}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderSectionVehiclesTab(section, user) {
  const canManage = window.rbac ? (window.rbac.hasPermission(user, 'MANAGE_VEHICLES') || ['DEPT_MANAGER', 'SUPER_ADMIN', 'SECTION_MANAGER'].includes(user.role)) : true;
  const currentSubTab = window.app.currentSectionVehiclesSubTab || 'fleet';

  const sectionVehicles = (window.store && typeof window.store.getVehicles === 'function')
    ? window.store.getVehicles(section.departmentId, { sectionId: section.id }, user)
    : [];

  const sectionMovements = (window.store && typeof window.store.getVehicleMovements === 'function')
    ? window.store.getVehicleMovements(section.departmentId, { sectionId: section.id }, user)
    : [];

  const operationalCount = sectionVehicles.filter(v => v.operationalState === 'OPERATIONAL' || v.operationalState === 'عاملة' || v.operationalState === 'بالعمل').length;
  const inRepairCount = sectionVehicles.filter(v => v.operationalState === 'IN_REPAIR' || v.operationalState === 'في التصليح' || v.operationalState === 'بالتصليح').length;
  const stoppedCount = sectionVehicles.filter(v => v.operationalState === 'STOPPED' || v.operationalState === 'متوقفة').length;
  const inTransitCount = sectionVehicles.filter(v => v.movementState === 'IN_TRANSIT').length;

  return `
    <div class="card">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; margin-bottom: 1.25rem;">
        <div>
          <h3 class="card-title" style="margin-bottom: 0.25rem;">🚘 سيارات وحركات آليات ${section.name}</h3>
          <p style="color: var(--md-sys-color-outline); font-size: 0.85rem; margin: 0;">
            متابعة وإدارة سيارات إدارة الشعبة والمحطات التابعة وسائقي النوبات وتوثيق حركاتها الميدانية.
          </p>
        </div>
        <div style="display: flex; gap: 0.65rem; flex-wrap: wrap; align-items: center;">
          ${canManage ? `
            <button class="btn btn-glass-primary" onclick="window.app.openCreateVehicleModal('${section.id}')" title="إضافة سيارة جديدة لمرآب الشعبة">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 5v14M5 12h14"></path>
              </svg>
              <span>إضافة سيارة للشعبة</span>
              <span style="font-size: 1.05rem;">🚘</span>
            </button>
            <button class="btn btn-glass-amber" onclick="window.app.openStartVehicleMovementModal()" title="تسجيل وتوثيق حركة ميدانية جديدة">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
              </svg>
              <span>تسجيل حركة جديدة</span>
              <span style="font-size: 1.05rem;">🚀</span>
            </button>
          ` : ''}
        </div>
      </div>

      <!-- Quick Vehicle Status Badges (Compact & Highly Vivid) -->
      <div class="mini-status-chips-container">
        <div class="mini-status-chip mini-chip-success" title="سيارات عاملة وجاهزة">
          <span class="mini-pulse-dot dot-success"></span>
          <span>عاملة وجاهزة</span>
          <span class="mini-chip-count">${operationalCount}</span>
        </div>
        <div class="mini-status-chip mini-chip-warning" title="سيارات في التصليح والصيانة">
          <span class="mini-pulse-dot dot-warning"></span>
          <span>في التصليح</span>
          <span class="mini-chip-count">${inRepairCount}</span>
        </div>
        <div class="mini-status-chip mini-chip-danger" title="سيارات متوقفة">
          <span class="mini-pulse-dot dot-danger"></span>
          <span>متوقفة</span>
          <span class="mini-chip-count">${stoppedCount}</span>
        </div>
        <div class="mini-status-chip mini-chip-info" title="سيارات في حركة جارية حالياً">
          <span class="mini-pulse-dot dot-info"></span>
          <span>في حركة حالياً</span>
          <span class="mini-chip-count">${inTransitCount}</span>
        </div>
      </div>

      <!-- Sub-Tabs Switcher (سيارات الشعبة vs حركة السيارات) -->
      <div class="crystal-subtab-bar">
        <button class="crystal-subtab-btn ${currentSubTab === 'fleet' ? 'active' : ''}" onclick="window.app.setSectionVehiclesSubTab('fleet')">
          <span>🚗 سيارات الشعبة</span>
          <span class="crystal-subtab-badge">${sectionVehicles.length}</span>
        </button>
        <button class="crystal-subtab-btn ${currentSubTab === 'movements' ? 'active' : ''}" onclick="window.app.setSectionVehiclesSubTab('movements')">
          <span>🚀 حركة السيارات</span>
          <span class="crystal-subtab-badge">${sectionMovements.length}</span>
        </button>
      </div>

      ${currentSubTab === 'fleet' ? `
        <!-- Section Fleet Table -->
        <div class="table-container" style="overflow-x: auto;">
          <table class="data-table" style="font-size: 0.88rem;">
            <thead>
              <tr>
                <th>نوع السيارة</th>
                <th>الصفة</th>
                <th>الرقم الجانبي</th>
                <th>رقم السيارة</th>
                <th>جهة الارتباط</th>
                <th>المحطة التابعة</th>
                <th>السائقون (النوبات A/B/C/D)</th>
                <th>الحالة التشغيلية</th>
                <th>جاهزية الحركة</th>
                ${canManage ? '<th style="text-align: center;">إجراءات</th>' : ''}
              </tr>
            </thead>
            <tbody>
              ${sectionVehicles.length === 0 ? `
                <tr>
                  <td colspan="10" style="text-align: center; padding: 2.5rem; color: var(--md-sys-color-outline);">
                    لا توجد سيارات مسجلة لهذه الشعبة حالياً.
                  </td>
                </tr>
              ` : sectionVehicles.map(v => {
                const isGov = v.ownershipType === 'GOVERNMENT';
                const isStation = v.affiliationType === 'STATION';
                let stateTheme = 'mini-chip-success';
                let stateLabel = 'عاملة';
                if (v.operationalState === 'IN_REPAIR' || v.operationalState === 'في التصليح' || v.operationalState === 'بالتصليح') {
                  stateTheme = 'mini-chip-warning';
                  stateLabel = 'في التصليح';
                } else if (v.operationalState === 'STOPPED' || v.operationalState === 'متوقفة') {
                  stateTheme = 'mini-chip-danger';
                  stateLabel = 'متوقفة';
                }

                const isInTransit = v.movementState === 'IN_TRANSIT';
                const affLabel = isStation ? 'محطة' : 'إدارة الشعبة';

                let driversHtml = '';
                if (isStation) {
                  const s = v.shiftDrivers || {};
                  driversHtml = `
                    <div style="display: flex; flex-direction: column; gap: 0.15rem; font-size: 0.75rem;">
                      <div><span class="mini-status-chip mini-chip-info" style="padding: 0.05rem 0.35rem;">A</span> ${s.shiftA ? s.shiftA.driverName : '<span style="color: var(--md-sys-color-outline);">غير مخصص</span>'}</div>
                      <div><span class="mini-status-chip mini-chip-info" style="padding: 0.05rem 0.35rem;">B</span> ${s.shiftB ? s.shiftB.driverName : '<span style="color: var(--md-sys-color-outline);">غير مخصص</span>'}</div>
                      <div><span class="mini-status-chip mini-chip-info" style="padding: 0.05rem 0.35rem;">C</span> ${s.shiftC ? s.shiftC.driverName : '<span style="color: var(--md-sys-color-outline);">غير مخصص</span>'}</div>
                      <div><span class="mini-status-chip mini-chip-info" style="padding: 0.05rem 0.35rem;">D</span> ${s.shiftD ? s.shiftD.driverName : '<span style="color: var(--md-sys-color-outline);">غير مخصص</span>'}</div>
                    </div>
                  `;
                } else {
                  driversHtml = `<strong>${v.driverName || 'غير محدد'}</strong>`;
                }

                return `
                  <tr>
                    <td><strong>${v.vehicleType || 'بيك آب'}</strong></td>
                    <td><span class="mini-status-chip ${isGov ? 'mini-chip-slate' : 'mini-chip-warning'}">${isGov ? 'حكومي' : 'مؤجرة'}</span></td>
                    <td><strong style="color: var(--md-sys-color-primary); font-family: monospace;">${v.sideNumber ? '#' + v.sideNumber : (isGov ? '<span style="color:#d93025;">مطلوب</span>' : '—')}</strong></td>
                    <td><code>${v.vehicleNumber || '—'}</code></td>
                    <td style="white-space: nowrap;"><span class="mini-status-chip mini-chip-primary">${affLabel}</span></td>
                    <td><strong>${v.stationName || '—'}</strong></td>
                    <td>${driversHtml}</td>
                    <td>
                      <span class="mini-status-chip ${stateTheme}">
                        <span class="mini-pulse-dot"></span>
                        <span class="chip-label">${stateLabel}</span>
                      </span>
                    </td>
                    <td>
                      <span class="mini-status-chip ${isInTransit ? 'mini-chip-info' : 'mini-chip-success'}">
                        <span class="mini-pulse-dot"></span>
                        <span class="chip-label">${isInTransit ? 'في حركة' : 'متاحة'}</span>
                      </span>
                    </td>
                    ${canManage ? `
                      <td style="text-align: center; white-space: nowrap;">
                        <div style="display: flex; gap: 0.35rem; justify-content: center; align-items: center;">
                          <button class="btn-action-edit" onclick="window.app.openEditVehicleModal('${v.id}')" title="تعديل بيانات الآلية">تعديل</button>
                          <button class="btn-action-trash" onclick="window.app.deleteVehicle('${v.id}')" title="حذف الآلية">
                            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                              <polyline points="3 6 5 6 21 6"></polyline>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                          </button>
                        </div>
                      </td>
                    ` : ''}
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      ` : `
        <!-- Section Movements Table -->
        <div class="table-container" style="overflow-x: auto;">
          <table class="data-table" style="font-size: 0.88rem;">
            <thead>
              <tr>
                <th>السائق</th>
                <th>النوبة</th>
                <th>نوع السيارة</th>
                <th>رقم السيارة</th>
                <th>الرقم الجانبي</th>
                <th>المحطة / الارتباط</th>
                <th>الغرض</th>
                <th>وقت الذهاب</th>
                <th>وقت الرجوع</th>
                <th>الحالة</th>
                <th style="text-align: center;">إجراء</th>
              </tr>
            </thead>
            <tbody>
              ${sectionMovements.length === 0 ? `
                <tr>
                  <td colspan="11" style="text-align: center; padding: 2.5rem; color: var(--md-sys-color-outline);">
                    لا توجد حركات مسجلة لسيارات هذه الشعبة حتى الآن.
                  </td>
                </tr>
              ` : sectionMovements.map(m => {
                const depFormatted = m.departureTime ? new Date(m.departureTime).toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit' }) : '—';
                const retFormatted = m.returnTime ? new Date(m.returnTime).toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit' }) : '—';

                return `
                  <tr>
                    <td><strong>${m.driverName || 'سائق الشعبة'}</strong></td>
                    <td><span class="mini-status-chip mini-chip-info">${m.shift || 'A'}</span></td>
                    <td>${m.vehicleType || 'بيك آب'}</td>
                    <td><code>${m.vehicleNumber || '—'}</code></td>
                    <td><strong style="color: var(--md-sys-color-primary);">${m.sideNumber ? '#' + m.sideNumber : '—'}</strong></td>
                    <td>${m.stationName || 'إدارة الشعبة'}</td>
                    <td style="max-width: 200px;">${m.purpose || 'مهمة عمل'}</td>
                    <td>🕒 ${depFormatted}</td>
                    <td>${m.status === 'COMPLETED' ? `✅ ${retFormatted}` : '<span style="color: var(--md-sys-color-outline);">—</span>'}</td>
                    <td>
                      <span class="mini-status-chip ${m.status === 'IN_TRANSIT' ? 'mini-chip-info' : 'mini-chip-success'}">
                        <span class="mini-pulse-dot"></span>
                        <span class="chip-label">${m.status === 'IN_TRANSIT' ? 'في حركة' : 'مكتملة'}</span>
                      </span>
                    </td>
                    <td style="text-align: center;">
                      ${m.status === 'IN_TRANSIT' ? `
                        <button class="btn-action-finish" onclick="window.app.endVehicleMovement('${m.id}')" title="إنهاء الحركة وتسجيل وقت العودة">
                          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
                            <line x1="4" y1="22" x2="4" y2="15"></line>
                          </svg>
                          <span>إنهاء الحركة</span>
                        </button>
                      ` : '<span style="color: var(--md-sys-color-outline); font-size: 0.75rem;">منتهية</span>'}
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      `}
    </div>
  `;
}

// ==========================================================================
// تبويب تبليغات وتوجيهات إدارة القسم ومسؤول الشعبة (Directives & Notifications)
// ==========================================================================
function renderSectionNotificationsTab(section, sectionNotifs, deptNotifs = [], user, stations) {
  const canPublish = ['SECTION_MANAGER', 'DEPT_MANAGER', 'SUPER_ADMIN', 'ADMINISTRATOR', 'DEPUTY_SECTION_MANAGER'].includes(user.role) ||
                     (user.sectionId === section.id && ['SECTION_MANAGER', 'DEPUTY_SECTION_MANAGER'].includes(user.role));

  return `
    <div style="display: flex; flex-direction: column; gap: 1.5rem;">
      
      <!-- القسم الأول: توجيهات وتبليغات إدارة القسم الرسمية -->
      <div class="card" style="border-top: 4px solid var(--md-sys-color-primary);">
        <div class="card-header" style="flex-wrap: wrap; gap: 1rem; border-bottom: 1px solid var(--md-sys-color-surface-variant); padding-bottom: 0.85rem; margin-bottom: 1rem;">
          <div>
            <h3 class="card-title" style="font-size: 1.25rem; font-weight: 800; color: var(--md-sys-color-primary);">
              🏛️ توجيهات وتبليغات إدارة القسم الرسمية الصادرة للشعبة
            </h3>
            <p style="color: var(--md-sys-color-outline); font-size: 0.85rem; margin: 0.25rem 0 0 0;">
              التعاميم والتوجيهات الصادرة من السيد مدير القسم وإدارة القسم الموجهة لـ (${section.name}) أو المعممة على كافة الشعب.
            </p>
          </div>
          <span class="badge badge-info" style="font-weight: 800; font-size: 0.85rem;">${deptNotifs.length} تبليغات معتمدة</span>
        </div>

        ${deptNotifs.length === 0 ? `
          <div style="text-align: center; padding: 2rem 1rem; color: var(--md-sys-color-outline); background: var(--md-sys-color-background); border-radius: var(--radius-md);">
            <div style="font-size: 2rem; margin-bottom: 0.35rem;">📭</div>
            <div style="font-weight: 700;">لا توجد تعاميم نشطة حالياً من إدارة القسم موجهة لهذه الشعبة.</div>
          </div>
        ` : `
          <div style="display: flex; flex-direction: column; gap: 0.85rem;">
            ${deptNotifs.map(n => {
              const notifNum = n.number || n.id || 'ت-2026/001';
              const formattedDate = new Date(n.publishDate || n.createdAt || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
              const isUrgent = n.importance === 'URGENT' || n.priority === 'URGENT';
              const isHigh = n.importance === 'HIGH' || n.priority === 'HIGH';
              const priorityBadge = isUrgent 
                ? '<span class="badge badge-danger" style="font-weight: 800;">🚨 عاجل جداً</span>' 
                : (isHigh ? '<span class="badge badge-warning" style="font-weight: 800;">⚠️ هام</span>' : '<span class="badge badge-info">ℹ️ اعتيادي</span>');
              
              const scopeBadge = n.targetScope === 'ALL_SECTIONS' || !n.targetSectionId
                ? '<span class="badge badge-primary" style="font-size: 0.78rem;">🌐 تعميم لكافة شعب ووحدات القسم</span>'
                : `<span class="badge badge-secondary" style="font-size: 0.78rem;">🏢 موجه حصرياً لـ: ${section.name}</span>`;

              return `
                <div style="border: 1.5px solid rgba(11, 87, 208, 0.2); border-right: 5px solid var(--md-sys-color-primary); border-radius: var(--radius-md); padding: 1.15rem; background: linear-gradient(135deg, rgba(11, 87, 208, 0.02) 0%, rgba(2, 132, 199, 0.04) 100%); box-shadow: var(--shadow-1);">
                  <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 0.75rem; margin-bottom: 0.65rem;">
                    <div>
                      <div style="display: flex; gap: 0.45rem; align-items: center; flex-wrap: wrap; margin-bottom: 0.35rem;">
                        ${priorityBadge}
                        ${scopeBadge}
                        <span style="font-size: 0.78rem; color: var(--md-sys-color-outline); font-family: monospace;">
                          📅 ${formattedDate}
                        </span>
                      </div>
                      <h4 style="margin: 0; font-weight: 800; font-size: 1.1rem; color: var(--md-sys-color-primary);">
                        ${n.title}
                      </h4>
                    </div>
                    <div style="display: flex; gap: 0.35rem; align-items: center;">
                      <button class="btn-action-view" onclick="window.app.openViewOfficialNotificationModal('${n.id}')" title="معاينة تفاصيل التوجيه">
                        معاينة التوجيه
                      </button>
                      <button class="btn-action-print" onclick="window.app.printOfficialNotification('${n.id}')" title="طباعة التبليغ الرسمي">
                        طباعة
                      </button>
                    </div>
                  </div>
                  <div style="font-size: 0.92rem; line-height: 1.7; color: var(--md-sys-color-on-surface); background: var(--md-sys-color-surface); padding: 0.85rem 1rem; border-radius: var(--radius-sm); margin-bottom: 0.65rem; white-space: pre-wrap; border: 1px solid var(--md-sys-color-surface-variant);">
                    ${n.content || n.body || ''}
                  </div>
                  <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.78rem; color: var(--md-sys-color-outline);">
                    <div>✍️ <strong>المسؤول المُصدِر:</strong> ${n.createdByName || n.sender || 'إدارة القسم'}</div>
                    <div>🆔 كود التبليغ: <code style="font-weight: 700;">${notifNum}</code></div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        `}
      </div>

      <!-- القسم الثاني: تبليغات وتوجيهات مسؤول الشعبة إلى المحطات التابعة -->
      <div class="card">
        <div class="card-header" style="flex-wrap: wrap; gap: 1rem; border-bottom: 1px solid var(--md-sys-color-surface-variant); padding-bottom: 1rem; margin-bottom: 1.25rem;">
          <div>
            <h3 class="card-title" style="font-size: 1.25rem; font-weight: 800; color: var(--md-sys-color-primary);">
              📢 تبليغات وتوجيهات مسؤول الشعبة إلى المحطات (${section.name})
            </h3>
            <p style="color: var(--md-sys-color-outline); font-size: 0.85rem; margin: 0.25rem 0 0 0;">
              توجيهات وتعليمات تشغيلية وإدارية صادرة من مسؤول الشعبة موجهة حصرياً إلى المحطات التابعة للشعبة.
            </p>
          </div>
          ${canPublish ? `
            <button class="btn btn-glass-amber" onclick="window.app.openCreateSectionNotificationModal('${section.id}')" title="إصدار تبليغ وتوجيه لمحطات الشعبة">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 5v14M5 12h14"></path>
              </svg>
              <span>إصدار تبليغ لمحطات الشعبة</span>
              <span style="font-size: 1.05rem;">📢</span>
            </button>
          ` : ''}
        </div>

        ${sectionNotifs.length === 0 ? `
          <div style="text-align: center; padding: 3rem 1.5rem; background: var(--md-sys-color-background); border-radius: var(--radius-md); border: 2px dashed var(--md-sys-color-surface-variant);">
            <div style="font-size: 3rem; margin-bottom: 0.75rem;">📢</div>
            <h4 style="font-weight: 800; color: var(--md-sys-color-on-surface); margin-bottom: 0.5rem;">لا توجد تبليغات نشطة حالياً لمحطات الشعبة</h4>
            <p style="color: var(--md-sys-color-outline); font-size: 0.9rem; max-width: 500px; margin: 0 auto 1.25rem auto;">
              يمكن لمسؤول الشعبة إصدار توجيهات فورية أو تعليمات أمن وسلامة وجداول تشغيل موجهة لكافة المحطات أو لمحطة محددة.
            </p>
            ${canPublish ? `
              <button class="btn btn-glass-amber" onclick="window.app.openCreateSectionNotificationModal('${section.id}')">
                <span>إصدار أول تبليغ رسمي لمحطات الشعبة</span>
                <span style="font-size: 1.05rem;">📢</span>
              </button>
            ` : ''}
          </div>
        ` : `
          <div style="display: flex; flex-direction: column; gap: 1rem;">
            ${sectionNotifs.map(n => {
              const isUrgent = n.priority === 'URGENT';
              const isHigh = n.priority === 'HIGH';
              const priorityBadge = isUrgent 
                ? '<span class="badge badge-danger" style="font-weight: 800;">🚨 عاجل جداً</span>' 
                : (isHigh ? '<span class="badge badge-warning" style="font-weight: 800;">⚠️ هام</span>' : '<span class="badge badge-info">ℹ️ اعتيادي</span>');
              
              const targetStationBadge = n.targetStationId === 'ALL' || !n.targetStationId
                ? '<span class="badge badge-primary" style="font-size: 0.78rem;">📍 موجه إلى: كافة محطات الشعبة</span>'
                : `<span class="badge badge-secondary" style="font-size: 0.78rem;">📍 موجه إلى: ${n.targetStationName || 'محطة محددة'}</span>`;

              const formattedDate = new Date(n.publishDate || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

              return `
                <div style="border: 1px solid var(--md-sys-color-surface-variant); border-right: 5px solid ${isUrgent ? 'var(--md-sys-color-error)' : (isHigh ? 'var(--md-sys-color-warning)' : 'var(--md-sys-color-primary)')}; border-radius: var(--radius-md); padding: 1.25rem; background: var(--md-sys-color-surface); box-shadow: var(--shadow-1);">
                  <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 0.75rem; margin-bottom: 0.75rem;">
                    <div>
                      <div style="display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap; margin-bottom: 0.35rem;">
                        ${priorityBadge}
                        ${targetStationBadge}
                        <span style="font-size: 0.78rem; color: var(--md-sys-color-outline); font-family: monospace;">
                          📅 ${formattedDate}
                        </span>
                      </div>
                      <h4 style="margin: 0; font-weight: 800; font-size: 1.1rem; color: var(--md-sys-color-on-surface);">
                        ${n.title}
                      </h4>
                    </div>
                    
                    <div style="display: flex; gap: 0.35rem; align-items: center;">
                      <button class="btn-action-view" onclick="window.app.viewSectionNotificationDetails('${n.id}')" title="معاينة التبليغ">
                        معاينة
                      </button>
                      <button class="btn-action-print" onclick="window.app.printSectionNotification('${n.id}')" title="طباعة التبليغ">
                        طباعة
                      </button>
                      ${canPublish ? `
                        <button class="btn-action-trash" onclick="window.app.handleDeleteSectionNotification('${n.id}', '${section.id}')" title="حذف التبليغ">
                          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          </svg>
                        </button>
                      ` : ''}
                    </div>
                  </div>

                  <div style="font-size: 0.92rem; line-height: 1.7; color: var(--md-sys-color-on-surface); background: var(--md-sys-color-background); padding: 0.85rem 1rem; border-radius: var(--radius-sm); margin-bottom: 0.75rem; white-space: pre-wrap;">
                    ${n.content}
                  </div>

                  <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.78rem; color: var(--md-sys-color-outline);">
                    <div>
                      ✍️ <strong>المسؤول المُصدِر:</strong> ${n.createdByName || 'مسؤول الشعبة'}
                    </div>
                    <div>
                      🆔 كود التبليغ: <code>${n.id}</code>
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        `}
      </div>

    </div>
  `;
}

window.renderSectionWorkspaceView = renderSectionWorkspaceView;
window.renderSectionFormsTab = renderSectionFormsTab;
window.renderSectionStationsTab = renderSectionStationsTab;
window.renderSectionNotificationsTab = renderSectionNotificationsTab;
window.renderSectionStaffTab = renderSectionStaffTab;
window.renderSectionDocsTab = renderSectionDocsTab;
window.renderSectionVehiclesTab = renderSectionVehiclesTab;

