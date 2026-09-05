/* ==========================================================================
   إدارة قسم الإنتاج الجنوبي - Unit Workspace Component (الوحدات والاستمارات)
   ========================================================================== */

function renderUnitWorkspaceView(unitId) {
  const user = window.auth.getCurrentUser();
  const db = window.store.getDb();
  const unit = (db.units || []).find(u => u.id === unitId);

  if (!unit) {
    return `
      <div class="card" style="text-align: center; padding: 3rem; color: var(--md-sys-color-error);">
        <h2>⚠️ الوحدة غير موجودة أو تم إلغاؤها</h2>
        <button class="btn btn-primary" onclick="window.app.navigate('units')" style="margin-top: 1rem;">العودة لقائمة الوحدات</button>
      </div>
    `;
  }

  const manager = window.store.getUserById(unit.managerId);
  const deputyManager = unit.deputyManagerId 
    ? window.store.getUserById(unit.deputyManagerId) 
    : ((db.users || []).find(u => u.unitId === unit.id && (u.role === 'DEPUTY_SECTION_MANAGER' || u.role === 'ADMINISTRATOR')) || (unit.deputyManagerName ? { fullName: unit.deputyManagerName } : null));
  const unitStaff = (db.users || []).filter(u => u.unitId === unit.id && u.status === 'APPROVED');
  const unitDocs = (db.documents || []).filter(d => d.unitId === unit.id);
  const unitRequests = (db.requests || []).filter(r => {
    const reqUser = window.store.getUserById(r.userId);
    return reqUser && reqUser.unitId === unit.id;
  });
  const unitNotifs = (window.store && typeof window.store.getOfficialNotifications === 'function')
    ? window.store.getOfficialNotifications(user.departmentId, user).filter(n => n.targetScope === 'ALL_SECTIONS' || !n.targetSectionId || (unit.sectionId && n.targetSectionId === unit.sectionId))
    : [];

  const activeSubTab = window.app.currentUnitSubTab || 'staff';

  return `
    <div style="margin-bottom: 1.5rem;">
      <div style="display: flex; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; gap: 1.25rem;">
        <div style="flex: 1 1 320px; min-width: 280px;">
          <button class="btn btn-sm" onclick="window.app.navigate('units')" 
                  style="margin-bottom: 0.65rem; border-radius: 10px; font-weight: 700; font-size: 0.84rem; background: var(--md-sys-color-surface); border: 1.5px solid var(--md-sys-color-surface-variant); color: var(--md-sys-color-primary); box-shadow: 0 2px 6px rgba(0,0,0,0.03); display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.4rem 0.85rem; cursor: pointer;">
            ← العودة إلى قائمة الوحدات
          </button>
          <h2 style="font-size: 1.8rem; font-weight: 800; color: var(--md-sys-color-primary); margin: 0;">${unit.name}</h2>
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

          <!-- زر 2: تحديث بيانات كادر الوحدة -->
          <button class="btn btn-glass-primary" onclick="window.app.openUnitDataEntryModal('${unit.id}')" title="تحديث بيانات الكادر">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
            <span>تحديث بيانات كادر الوحدة</span>
          </button>

          <!-- بطاقة القيادة الإدارية للوحدة: المسؤول والوكيل (تصميم زجاجي مكبّر ومميز) -->
          <div class="executive-leadership-card" style="padding: 0.55rem 1.15rem; border-radius: 14px; background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.92) 100%); border: 1.5px solid rgba(11, 87, 208, 0.22); box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05), inset 0 1px 1px rgba(255, 255, 255, 0.9); display: inline-flex; align-items: center; gap: 0.8rem; min-width: 220px; backdrop-filter: blur(10px);">
            <span class="nav-icon-box icon-emerald" style="width: 36px; height: 36px; min-width: 36px; border-radius: 9px; box-shadow: 0 2px 8px rgba(16, 185, 129, 0.25); display: flex; align-items: center; justify-content: center;">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </span>
            <div style="display: flex; flex-direction: column; justify-content: center; text-align: right; gap: 2px;">
              <div style="display: flex; align-items: baseline; gap: 0.35rem;">
                <span style="font-size: 0.72rem; font-weight: 800; color: var(--md-sys-color-primary); white-space: nowrap;">مسؤول الوحدة:</span>
                <span style="font-size: 0.92rem; font-weight: 900; color: var(--md-sys-color-on-surface); line-height: 1.2;">${manager ? manager.fullName : 'شاغر / قيد التعيين'}</span>
              </div>
              <div style="display: flex; align-items: baseline; gap: 0.35rem; border-top: 1px dashed rgba(0, 0, 0, 0.09); padding-top: 2px; margin-top: 1px;">
                <span style="font-size: 0.7rem; font-weight: 800; color: #d97706; white-space: nowrap;">وكيل المسؤول:</span>
                <span style="font-size: 0.85rem; font-weight: 800; color: #b45309; line-height: 1.2;">${deputyManager ? deputyManager.fullName : (unit.deputyManagerName || 'قيد التكليف')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Sub-Tabs Header Navigation (كادر الوحدة أولاً) -->
    <div class="tabs-header" style="margin-bottom: 1.5rem;">
      <button class="tab-btn ${activeSubTab === 'staff' ? 'active' : ''}" onclick="window.app.setUnitSubTab('staff')">👥 <span>كادر الوحدة</span> <span class="tab-count-badge">${unitStaff.length}</span></button>
      <button class="tab-btn ${activeSubTab === 'overview' ? 'active' : ''}" onclick="window.app.setUnitSubTab('overview')">📊 <span>المهام والمؤشرات العامة</span></button>
      <button class="tab-btn ${activeSubTab === 'notifs' ? 'active' : ''}" onclick="window.app.setUnitSubTab('notifs')">📢 <span>التبليغات والتوجيهات</span> <span class="tab-count-badge">${unitNotifs.length}</span></button>
      <button class="tab-btn ${activeSubTab === 'forms' ? 'active' : ''}" onclick="window.app.setUnitSubTab('forms')">📝 <span>استمارات وبيانات الوحدة</span></button>
      <button class="tab-btn ${activeSubTab === 'documents' ? 'active' : ''}" onclick="window.app.setUnitSubTab('documents')">📄 <span>الدراسات والتقارير الفنية</span> <span class="tab-count-badge">${unitDocs.length}</span></button>
    </div>

    ${activeSubTab === 'staff' ? renderUnitStaffTab(unit, unitStaff) : ''}
    ${activeSubTab === 'overview' ? renderUnitOverviewTab(unit, unitDocs, unitStaff, user) : ''}
    ${activeSubTab === 'notifs' ? renderUnitNotificationsTab(unit, unitNotifs, user) : ''}
    ${activeSubTab === 'forms' ? renderUnitFormsTab(unit, user, unitRequests) : ''}
    ${activeSubTab === 'documents' ? renderUnitDocsTab(unit, unitDocs, user) : ''}
  `;
}

function renderUnitFormsTab(unit, user, unitRequests) {
  const deptId = unit.departmentId || (user ? user.departmentId : 'dept-south-prod');
  const allDocs = (window.store && typeof window.store.getDocuments === 'function') ? (window.store.getDocuments(deptId) || []) : [];
  
  // تصفية النماذج والفورمات الجاهزة الخاصة بهذه الوحدة أو الشعبة التابعة لها
  const unitFormTemplates = allDocs.filter(d => {
    if (d.isArchived || d.status === 'ARCHIVED') return false;
    const isUnitDoc = d.unitId === unit.id || d.scopeId === unit.id || (unit.sectionId && (d.sectionId === unit.sectionId || d.scopeId === unit.sectionId));
    const isTemplateDoc = d.isTemplate === true || d.category === 'FORM_TEMPLATE' || (d.docType && d.docType.includes('TEMPLATE'));
    return (isUnitDoc && isTemplateDoc) || (isUnitDoc && ['WORD', 'EXCEL', 'PDF'].includes(d.category));
  });

  // تصفية الحقول المخصصة الديناميكية للوحدة
  const allDynamicFields = (window.store && typeof window.store.getDynamicEmployeeFields === 'function') ? (window.store.getDynamicEmployeeFields(deptId) || []) : [];
  const unitDynamicFields = allDynamicFields.filter(f => f.isActive !== false && (f.scope === 'GLOBAL' || (f.scope === 'SECTION' && (!f.scopeId || f.scopeId === unit.sectionId)) || (f.scope === 'UNIT' && (!f.scopeId || f.scopeId === unit.id))));

  const canManageForms = ['SUPER_ADMIN', 'DEPT_MANAGER', 'SECTION_MANAGER', 'DEPUTY_SECTION_MANAGER', 'ADMINISTRATOR'].includes(user.role) || (window.rbac && window.rbac.hasPermission(user, 'CREATE_DOCUMENT'));

  return `
    <div style="display: flex; flex-direction: column; gap: 1.5rem;">

      <!-- شريط العنوان والعمليات الفورية لإدارة استمارات الوحدة -->
      <div class="card" style="border-right: 5px solid var(--md-sys-color-primary); background: linear-gradient(135deg, rgba(11, 87, 208, 0.04) 0%, rgba(2, 132, 199, 0.08) 100%);">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
          <div>
            <h3 style="font-size: 1.35rem; font-weight: 800; color: var(--md-sys-color-primary); margin: 0 0 4px 0; display: flex; align-items: center; gap: 0.5rem;">
              <span>📝</span>
              <span>مركز الاستمارات والفورمات والنماذج التشغيلية — ${unit.name}</span>
            </h3>
            <p style="color: var(--md-sys-color-outline); margin: 0; font-size: 0.88rem;">
              إدارة واستعمال الفورمات المعتمدة للوحدة: رفع وتحميل النماذج الجاهزة، وبناء حقول الاستمارة الإلكترونية وتعبئة بيانات الكادر.
            </p>
          </div>
          <div style="display: flex; gap: 0.65rem; flex-wrap: wrap; align-items: center;">
            <button class="btn btn-glass-primary" onclick="window.app.openUploadSectionFormTemplateModal('${unit.sectionId || unit.id}', '${unit.name}')" title="رفع نموذج أو فورمة جاهزة للوحدة">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
              <span>📤 رفع فورمة جاهزة (Word/Excel/PDF)</span>
            </button>
            <button class="btn btn-glass-amber" onclick="window.app.openCreateDynamicFieldModalFromDataEntry('${unit.sectionId || unit.id}', '', '${unit.name}')" title="إضافة حقل أو معلومة جديدة لاستمارة الوحدة">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 5v14M5 12h14"></path>
              </svg>
              <span>➕ إضافة حقل مخصص لفورمة الوحدة</span>
            </button>
          </div>
        </div>
      </div>

      <!-- شبكة الأرباع الهندسية المتساوية (4 أقسام متساوية الأبعاد 2x2) -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; align-items: stretch;">

        <!-- 1. بنك ومستودع الفورمات والنماذج الجاهزة للوحدة -->
        <div class="card" style="border-top: 4px solid #0284c7; display: flex; flex-direction: column; min-height: 420px; max-height: 420px; height: 100%; margin: 0;">
          <div class="card-header" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem; border-bottom: 1px solid var(--md-sys-color-surface-variant); padding-bottom: 0.75rem; margin-bottom: 0.85rem; flex-shrink: 0;">
            <div>
              <h3 class="card-title" style="font-size: 1.1rem; font-weight: 800; color: #0284c7; display: flex; align-items: center; gap: 0.45rem; margin: 0;">
                <span>📁</span>
                <span>بنك الفورمات والنماذج الجاهزة (${unitFormTemplates.length})</span>
              </h3>
              <div style="font-size: 0.76rem; color: var(--md-sys-color-outline); margin-top: 2px;">
                ملفات وقوالب رسمية جاهزة للتحميل والتعبئة والطباعة
              </div>
            </div>
            <button class="btn btn-sm btn-outline" onclick="window.app.openUploadSectionFormTemplateModal('${unit.sectionId || unit.id}', '${unit.name}')" title="إضافة فورمة جديدة">
              <span>➕ رفع فورمة</span>
            </button>
          </div>

          <div style="flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 0.65rem; padding-right: 2px;">
            ${unitFormTemplates.length === 0 ? `
              <div style="text-align: center; padding: 2rem 1rem; background: var(--md-sys-color-background); border-radius: var(--radius-md); border: 2px dashed var(--md-sys-color-surface-variant); margin: auto 0;">
                <div style="font-size: 2.2rem; margin-bottom: 0.35rem;">📂</div>
                <h4 style="font-weight: 800; color: var(--md-sys-color-on-surface); margin-bottom: 0.25rem; font-size: 0.95rem;">لا توجد فورمات جاهزة مرفوعة للوحدة بعد</h4>
                <p style="color: var(--md-sys-color-outline); font-size: 0.8rem; max-width: 320px; margin: 0 auto 0.85rem auto; line-height: 1.5;">
                  يمكن لمسؤول الوحدة أو الإدارة رفع نماذج واستمارات مصممة مسبقاً (Word / Excel / PDF) لتكون متاحة للكادر.
                </p>
                <button class="btn btn-glass-primary" onclick="window.app.openUploadSectionFormTemplateModal('${unit.sectionId || unit.id}', '${unit.name}')" style="font-size: 0.82rem; padding: 0.4rem 0.9rem;">
                  <span>📤 رفع أول فورمة جاهزة الآن</span>
                </button>
              </div>
            ` : `
              ${unitFormTemplates.map(tmpl => {
                const isExcel = tmpl.category === 'EXCEL' || (tmpl.fileName && tmpl.fileName.match(/\.xlsx?$/i));
                const isPdf = tmpl.category === 'PDF' || (tmpl.fileName && tmpl.fileName.match(/\.pdf$/i));
                const isWord = tmpl.category === 'WORD' || (tmpl.fileName && tmpl.fileName.match(/\.docx?$/i));
                const iconBadge = isExcel ? '📊 Excel' : (isPdf ? '📕 PDF' : (isWord ? '📄 Word' : '📝 استمارة'));
                const badgeColor = isExcel ? '#059669' : (isPdf ? '#dc2626' : '#2563eb');
                const formattedDate = new Date(tmpl.createdAt || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

                return `
                  <div style="border: 1px solid var(--md-sys-color-surface-variant); border-radius: 10px; padding: 0.75rem 0.9rem; background: var(--md-sys-color-surface); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem; box-shadow: var(--shadow-1);">
                    <div style="display: flex; align-items: center; gap: 0.65rem;">
                      <div style="width: 36px; height: 36px; border-radius: 8px; background: rgba(11, 87, 208, 0.1); display: flex; align-items: center; justify-content: center; font-size: 1.2rem; flex-shrink: 0;">
                        ${isExcel ? '📊' : (isPdf ? '📕' : '📄')}
                      </div>
                      <div>
                        <div style="display: flex; align-items: center; gap: 0.35rem; margin-bottom: 2px;">
                          <span style="font-size: 0.7rem; font-weight: 800; padding: 0.05rem 0.4rem; border-radius: 4px; background: ${badgeColor}; color: #ffffff;">${iconBadge}</span>
                          <strong style="font-size: 0.88rem; color: var(--md-sys-color-on-surface);">${tmpl.title}</strong>
                        </div>
                        <div style="font-size: 0.74rem; color: var(--md-sys-color-outline); display: flex; gap: 0.6rem; align-items: center;">
                          <span>📅 ${formattedDate}</span>
                          ${tmpl.docNumber ? `<span>🆔 ${tmpl.docNumber}</span>` : ''}
                          <span>✍️ ${tmpl.createdByName || 'إدارة الوحدة'}</span>
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
                        <button class="btn-action-trash" onclick="window.app.handleDeleteSectionFormTemplate('${tmpl.id}', '${unit.sectionId || unit.id}')" title="حذف هذا النموذج">
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

        <!-- 2. حقول ومعلومات الاستمارة الإلكترونية المخصصة للوحدة -->
        <div class="card" style="border-top: 4px solid #f59e0b; display: flex; flex-direction: column; min-height: 420px; max-height: 420px; height: 100%; margin: 0;">
          <div class="card-header" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem; border-bottom: 1px solid var(--md-sys-color-surface-variant); padding-bottom: 0.75rem; margin-bottom: 0.85rem; flex-shrink: 0;">
            <div>
              <h3 class="card-title" style="font-size: 1.1rem; font-weight: 800; color: #b45309; display: flex; align-items: center; gap: 0.45rem; margin: 0;">
                <span>🧩</span>
                <span>حقول الاستمارة الإلكترونية المخصصة (${unitDynamicFields.length})</span>
              </h3>
              <div style="font-size: 0.76rem; color: var(--md-sys-color-outline); margin-top: 2px;">
                معلومات وحقول ذكية مضافة لاستمارة كادر الوحدة تُحفظ في قاعدة البيانات
              </div>
            </div>
            <button class="btn btn-sm btn-outline" onclick="window.app.openCreateDynamicFieldModalFromDataEntry('${unit.sectionId || unit.id}', '', '${unit.name}')" title="إضافة حقل جديد">
              <span>➕ إضافة حقل</span>
            </button>
          </div>

          <div style="flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 0.55rem; padding-right: 2px; margin-bottom: 0.65rem;">
            ${unitDynamicFields.length === 0 ? `
              <div style="text-align: center; padding: 2rem 1rem; background: var(--md-sys-color-background); border-radius: var(--radius-md); color: var(--md-sys-color-outline); font-size: 0.82rem; margin: auto 0;">
                لا توجد حقول مخصصة إضافية حالياً. اضغط على [➕ إضافة حقل] لإضافة أي معلومة ترغب بجمعها من كادر الوحدة.
              </div>
            ` : `
              ${unitDynamicFields.map(f => {
                const typeLabels = {
                  text: 'نص عادي 📝',
                  number: 'رقم عددي 🔢',
                  date: 'تاريخ 📅',
                  select: 'قائمة خيارات 📋',
                  textarea: 'نص تفصيلي 📜'
                };
                const scopeLabel = f.scope === 'GLOBAL' ? '🌐 شامل للقسم' : (f.scope === 'SECTION' ? '🏢 خاص بالشعبة' : `📍 خاص بـ ${unit.name}`);
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
                        <button class="btn-action-trash" onclick="window.app.handleDeleteDynamicFieldFromSection('${f.id}', '${unit.sectionId || unit.id}')" title="حذف هذا الحقل">
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
            <button class="btn btn-save-prominent" onclick="window.app.openUnitDataEntryModal('${unit.id}')" style="padding: 0.4rem 1rem; font-size: 0.82rem;">
              <span>📝 تعبئة وتحديث بيانات كادر الوحدة</span>
            </button>
          </div>
        </div>

        <!-- 3. الاستمارات الإلكترونية التشغيلية المباشرة للوحدة -->
        <div class="card" style="border-top: 4px solid var(--md-sys-color-primary); display: flex; flex-direction: column; min-height: 420px; max-height: 420px; height: 100%; margin: 0;">
          <div class="card-header" style="border-bottom: 1px solid var(--md-sys-color-surface-variant); padding-bottom: 0.75rem; margin-bottom: 0.85rem; flex-shrink: 0;">
            <h3 class="card-title" style="font-size: 1.1rem; font-weight: 800; color: var(--md-sys-color-primary); display: flex; align-items: center; gap: 0.45rem; margin: 0;">
              <span>⚡</span>
              <span>الاستمارات الإلكترونية التشغيلية المباشرة لـ ${unit.name}</span>
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

            <!-- تقرير فني -->
            <div style="padding: 0.65rem 0.85rem; border: 1px solid var(--md-sys-color-surface-variant); border-radius: var(--radius-sm); display: flex; justify-content: space-between; align-items: center; background: var(--md-sys-color-surface);">
              <div>
                <strong style="color: var(--md-sys-color-on-surface); font-size: 0.86rem;">⚙️ استمارة التقرير الفني والدراسات</strong>
                <div style="font-size: 0.72rem; color: var(--md-sys-color-outline);">تقديم نتائج الفحوصات الفنية وخطط الصيانة</div>
              </div>
              <button class="btn-action-broadcast" onclick="window.app.openCreateWordDocModal(null, null, '${unit.id}')" style="padding: 0.3rem 0.75rem; font-size: 0.78rem;">
                <span>كتابة تقرير</span>
              </button>
            </div>

            <!-- حجز مهمة وسيارة -->
            <div style="padding: 0.65rem 0.85rem; border: 1px solid var(--md-sys-color-surface-variant); border-radius: var(--radius-sm); display: flex; justify-content: space-between; align-items: center; background: var(--md-sys-color-surface);">
              <div>
                <strong style="color: var(--md-sys-color-on-surface); font-size: 0.86rem;">📦 استمارة حجز مهمة وتخصيص سيارة</strong>
                <div style="font-size: 0.72rem; color: var(--md-sys-color-outline);">طلب إيفاد موقعي للفرق ولجان التدريب</div>
              </div>
              <button class="btn-action-view" onclick="window.app.openSubmitRequestModal()" style="padding: 0.3rem 0.75rem; font-size: 0.78rem;">
                <span>تقديم طلب</span>
              </button>
            </div>

            <!-- إجازات -->
            <div style="padding: 0.65rem 0.85rem; border: 1px solid var(--md-sys-color-surface-variant); border-radius: var(--radius-sm); display: flex; justify-content: space-between; align-items: center; background: var(--md-sys-color-surface);">
              <div>
                <strong style="color: var(--md-sys-color-on-surface); font-size: 0.86rem;">🏖️ استمارة طلب إجازة رسمية</strong>
                <div style="font-size: 0.72rem; color: var(--md-sys-color-outline);">اعتيادية، مرضية، تعويضية</div>
              </div>
              <button class="btn-action-export" onclick="window.app.openSubmitRequestModal()" style="padding: 0.3rem 0.75rem; font-size: 0.78rem;">
                <span>طلب إجازة</span>
              </button>
            </div>
          </div>
        </div>

        <!-- 4. سجل البيانات والمعاملات المقدمة -->
        <div class="card" style="border-top: 4px solid #10b981; display: flex; flex-direction: column; min-height: 420px; max-height: 420px; height: 100%; margin: 0;">
          <div class="card-header" style="border-bottom: 1px solid var(--md-sys-color-surface-variant); padding-bottom: 0.75rem; margin-bottom: 0.85rem; flex-shrink: 0;">
            <h3 class="card-title" style="font-size: 1.1rem; font-weight: 800; color: #10b981; display: flex; align-items: center; gap: 0.45rem; margin: 0;">
              <span>📋</span>
              <span>سجل البيانات والمعاملات المقدمة (${unitRequests.length})</span>
            </h3>
            <div style="font-size: 0.76rem; color: var(--md-sys-color-outline); margin-top: 2px;">
              متابعة حالة وتاريخ المعاملات المرفوعة من كادر الوحدة
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
                ${unitRequests.map(r => `
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
                ${unitRequests.length === 0 ? '<tr><td colspan="4" style="text-align: center; padding: 2.5rem 1rem; color: var(--md-sys-color-outline); font-size: 0.84rem;">لا توجد معاملات مقدمة في هذه الوحدة مؤخراً.</td></tr>' : ''}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  `;
}

function renderUnitOverviewTab(unit, unitDocs, unitStaff, user) {
  return `
    <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 1.5rem; align-items: start;">
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">نطاق العمل والمسؤوليات الهندسية</h3>
          ${window.rbac.hasPermission(user, 'CREATE_DOCUMENT') ? `
            <button class="btn btn-glass-primary" onclick="window.app.openCreateWordDocModal(null, null, '${unit.id}')" title="إصدار كتاب أو تقرير فني للوحدة">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 5v14M5 12h14"></path>
              </svg>
              <span>إصدار كتاب / تقرير فني</span>
              <span style="font-size: 1.05rem;">📄</span>
            </button>
          ` : ''}
        </div>
        <p style="font-size: 0.95rem; line-height: 1.8; color: var(--md-sys-color-on-surface); margin-bottom: 1.5rem;">
          ${unit.description}
        </p>

        <h4 style="font-size: 1.05rem; font-weight: 700; margin-bottom: 0.75rem; color: var(--md-sys-color-primary);">المهام الجارية والمشاريع المعتمدة</h4>
        <div style="display: flex; flex-direction: column; gap: 0.75rem;">
          <div style="padding: 1rem; border: 1px solid var(--md-sys-color-surface-variant); border-radius: var(--radius-sm); display: flex; justify-content: space-between; align-items: center;">
            <div>
              <strong>متابعة الصيانة الوقائية للتوربينات والمضخات</strong>
              <div style="font-size: 0.8rem; color: var(--md-sys-color-outline);">تنسيق موقعي مع الشعبتين الأولى والثانية</div>
            </div>
            <span class="badge badge-warning">قيد التنفيذ (75%)</span>
          </div>
          <div style="padding: 1rem; border: 1px solid var(--md-sys-color-surface-variant); border-radius: var(--radius-sm); display: flex; justify-content: space-between; align-items: center;">
            <div>
              <strong>معايرة منظومات الإطفاء التلقائي والسلامة المهنية</strong>
              <div style="font-size: 0.8rem; color: var(--md-sys-color-outline);">فحص صمامات الأمان في المحطات المركزية والجنوبية</div>
            </div>
            <span class="badge badge-success">مكتمل ومعتمد</span>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h3 class="card-title">مؤشرات الوحدة</h3>
        </div>
        <div style="display: flex; flex-direction: column; gap: 1.25rem;">
          <div>
            <div style="font-size: 0.8rem; color: var(--md-sys-color-outline); margin-bottom: 4px;">الحالة التشغيلية</div>
            <div><span class="badge badge-success">نشطة - مرتبطة بإدارة القسم مباشرة</span></div>
          </div>
          <div>
            <div style="font-size: 0.8rem; color: var(--md-sys-color-outline); margin-bottom: 4px;">الكوادر المعتمدة</div>
            <div style="font-weight: 800; font-size: 1.2rem; color: var(--md-sys-color-primary);">${unitStaff.length} مهندساً وفنياً</div>
          </div>
          <div>
            <div style="font-size: 0.8rem; color: var(--md-sys-color-outline); margin-bottom: 4px;">إجمالي المستندات والتقارير</div>
            <div style="font-weight: 800; font-size: 1.2rem;">${unitDocs.length} وثيقة</div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderUnitStaffTab(unit, staff) {
  return `
    <div class="card">
      <div class="card-header" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem;">
        <div>
          <h3 class="card-title" style="margin: 0;">👥 كادر ${unit.name}</h3>
          <p style="color: var(--md-sys-color-outline); font-size: 0.82rem; margin: 0.25rem 0 0 0;">
            عرض ومتابعة بيانات الكوادر الهندسية والفنية في ${unit.name}.
          </p>
        </div>
        <div style="display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap;">
          <input type="text" id="unitStaffSearchInput" class="form-control" style="width: 220px; font-size: 0.85rem; padding: 0.38rem 0.85rem;" placeholder="🔍 بحث بالاسم أو الرقم الوظيفي..." oninput="window.app.filterUnitStaffTable()">
          <span class="badge badge-primary" style="font-size: 0.85rem; padding: 0.4rem 0.8rem;" id="unitStaffCountBadge">
            👥 كادر الوحدة: ${staff.length} موظف
          </span>
          <button class="btn btn-glass-primary" onclick="window.app.openCustomStaffExportModal({ unitId: '${unit.id}', sectionId: '${unit.sectionId || ''}', scopeType: 'UNIT' })" title="أداة التصدير والطباعة المخصصة لبيانات كادر ${unit.name}" style="padding: 0.35rem 0.85rem; font-size: 0.84rem;">
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
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>الرقم الوظيفي</th>
              <th>الاسم الكامل</th>
              <th>المسمى الوظيفي</th>
              <th>التخصص</th>
              <th>الهاتف</th>
              <th>الصلاحية</th>
            </tr>
          </thead>
          <tbody>
            ${staff.map(u => `
              <tr class="unit-staff-row" data-name="${(u.fullName || '').toLowerCase()}" data-empid="${(u.employeeId || '').toLowerCase()}" data-title="${(u.jobTitle || '').toLowerCase()}" data-phone="${(u.phone || '').toLowerCase()}">
                <td><strong>${u.employeeId}</strong></td>
                <td>${u.fullName}</td>
                <td>${u.jobTitle}</td>
                <td>${u.specialization || 'هندسة وعمليات'}</td>
                <td>${u.phone || '-'}</td>
                <td><span class="badge ${window.rbac.getRoleInfo(u.role).badgeClass}">${window.rbac.getRoleInfo(u.role).name}</span></td>
              </tr>
            `).join('')}
            ${staff.length === 0 ? '<tr><td colspan="6" style="text-align: center; padding: 2rem;">لا توجد كوادر مسجلة في هذه الوحدة حالياً.</td></tr>' : ''}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderUnitDocsTab(unit, docs, user) {
  return `
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">أرشيف الدراسات والتقارير الفنية لـ ${unit.name}</h3>
        ${window.rbac.hasPermission(user, 'CREATE_DOCUMENT') ? `
          <button class="btn btn-glass-primary" onclick="window.app.openCreateWordDocModal(null, null, '${unit.id}')" title="إنشاء دراسة أو تقرير فني جديد للوحدة">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 5v14M5 12h14"></path>
            </svg>
            <span>كتاب / دراسة فنية جديدة</span>
            <span style="font-size: 1.05rem;">📄</span>
          </button>
        ` : ''}
      </div>
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>عنوان الوثيقة</th>
              <th>التصنيف</th>
              <th>المنشئ</th>
              <th>تاريخ التحديث</th>
              <th>إجراءات</th>
            </tr>
          </thead>
          <tbody>
            ${docs.map(d => `
              <tr>
                <td><strong>${d.title}</strong></td>
                <td><span class="badge ${d.category === 'WORD' ? 'badge-info' : 'badge-success'}">${d.category}</span></td>
                <td>${d.createdByName}</td>
                <td>${new Date(d.updatedAt).toLocaleDateString('ar-IQ')}</td>
                <td>
                  <div style="display: flex; align-items: center; gap: 0.35rem;">
                    <button class="btn-action-view" onclick="window.app.openViewDocumentModal('${d.id}')" title="معاينة المستند">معاينة</button>
                    <button class="btn-action-export" onclick="window.app.exportDocumentFile('${d.id}')" title="تصدير المستند">تصدير</button>
                    <button class="btn-share-whatsapp" onclick="window.app.shareViaWhatsApp('${(d.title || '').replace(/'/g, "\\'")}')" title="مشاركة عبر واتساب">
                      <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
                        <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.196 8.196 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24zm4.52 11.66c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.02-1.25-.75-.67-1.26-1.5-1.41-1.75-.14-.25-.02-.39.11-.51.11-.11.25-.29.38-.44.13-.15.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.13.17 1.77 2.71 4.3 3.8.6.26 1.07.42 1.44.53.61.19 1.16.17 1.6-.1.49-.3 1.47-1.2 1.68-1.68.21-.48.21-.89.15-.98-.06-.09-.23-.15-.48-.27z"/>
                      </svg>
                    </button>
                    <button class="btn-share-email" onclick="window.app.shareViaOutlook('${(d.title || '').replace(/'/g, "\\'")}')" title="مشاركة عبر البريد الإلكتروني">
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="2" y="4" width="20" height="16" rx="3"></rect>
                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            `).join('')}
            ${docs.length === 0 ? '<tr><td colspan="5" style="text-align: center; padding: 2rem;">لا توجد تقارير مسجلة لهذه الوحدة حتى الآن.</td></tr>' : ''}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderUnitNotificationsTab(unit, unitNotifs, user) {
  return `
    <div class="card" style="border-top: 4px solid var(--md-sys-color-primary);">
      <div class="card-header" style="flex-wrap: wrap; gap: 1rem; border-bottom: 1px solid var(--md-sys-color-surface-variant); padding-bottom: 0.85rem; margin-bottom: 1rem;">
        <div>
          <h3 class="card-title" style="font-size: 1.25rem; font-weight: 800; color: var(--md-sys-color-primary);">
            📢 التبليغات والتوجيهات الإدارية المعتمدة لـ (${unit.name})
          </h3>
          <p style="color: var(--md-sys-color-outline); font-size: 0.85rem; margin: 0.25rem 0 0 0;">
            التوجيهات والتعليمات الصادرة من إدارة القسم ومسؤولي الشعب والموجهة لمنتسبي وكادر الوحدة.
          </p>
        </div>
        <span class="badge badge-info" style="font-weight: 800; font-size: 0.85rem;">${unitNotifs.length} تبليغات</span>
      </div>

      ${unitNotifs.length === 0 ? `
        <div style="text-align: center; padding: 3rem 1.5rem; color: var(--md-sys-color-outline); background: var(--md-sys-color-background); border-radius: var(--radius-md);">
          <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">🔔</div>
          <div style="font-weight: 800; font-size: 1.1rem; color: var(--md-sys-color-on-surface);">لا توجد تبليغات نشطة حالياً لهذه الوحدة</div>
          <div style="font-size: 0.85rem; margin-top: 4px;">سيتم عرض كافة التعاميم والتوجيهات الصادرة فور نشرها.</div>
        </div>
      ` : `
        <div style="display: flex; flex-direction: column; gap: 0.85rem;">
          ${unitNotifs.map(n => {
            const notifNum = n.number || n.id || 'ت-2026/001';
            const formattedDate = new Date(n.publishDate || n.createdAt || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
            const isUrgent = n.importance === 'URGENT' || n.priority === 'URGENT';
            const isHigh = n.importance === 'HIGH' || n.priority === 'HIGH';
            const priorityBadge = isUrgent 
              ? '<span class="badge badge-danger" style="font-weight: 800;">🚨 عاجل جداً</span>' 
              : (isHigh ? '<span class="badge badge-warning" style="font-weight: 800;">⚠️ هام</span>' : '<span class="badge badge-info">ℹ️ اعتيادي</span>');

            const scopeBadge = n.targetScope === 'ALL_SECTIONS' || !n.targetSectionId
              ? '<span class="badge badge-primary" style="font-size: 0.78rem;">🌐 تعميم لكافة شعب ووحدات القسم</span>'
              : `<span class="badge badge-secondary" style="font-size: 0.78rem;">🏢 موجه للشعبة والوحدة</span>`;

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
                    <button class="btn-action-print" onclick="window.app.printOfficialNotification('${n.id}')" title="طباعة التبليغ">
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
  `;
}

window.renderUnitWorkspaceView = renderUnitWorkspaceView;
window.renderUnitNotificationsTab = renderUnitNotificationsTab;
window.renderUnitFormsTab = renderUnitFormsTab;
window.renderUnitOverviewTab = renderUnitOverviewTab;
window.renderUnitStaffTab = renderUnitStaffTab;
window.renderUnitDocsTab = renderUnitDocsTab;
