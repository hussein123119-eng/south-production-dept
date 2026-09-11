/* ==========================================================================
   إدارة قسم الإنتاج الجنوبي - إدارة القسم (Department Management Component)
   الهيكل الإداري والعمليات الميدانية اليومية لقسم الإنتاج الجنوبي
   التبويبات: 1. التبليغات (Text) | 2. كادر القسم | 3. الوثائق والتقارير | 4. طلب مقابلة | 5. حركة العجلات
   ========================================================================== */

function renderDeptManagementView() {
  try {
    const actorUser = window.auth ? window.auth.getCurrentUser() : null;
    if (!actorUser) {
      return `
        <div class="card" style="text-align: center; padding: 3rem;">
          <h3>⚠️ يرجى تسجيل الدخول للوصول إلى إدارة القسم</h3>
        </div>
      `;
    }

    const customPerms = Array.isArray(actorUser.customPermissions) ? actorUser.customPermissions : [];
    const canAccessDeptMgmt = (window.rbac && window.rbac.hasPermission(actorUser, 'DEPT_VIEW')) ||
                              ['SUPER_ADMIN', 'DEPT_MANAGER', 'SECTION_MANAGER', 'UNIT_MANAGER', 'ADMINISTRATOR'].includes(actorUser.role) ||
                              customPerms.includes('SCOPE_ALL_SECTIONS') ||
                              customPerms.includes('SCOPE_DEPT_LEVEL_USERS') ||
                              customPerms.includes('ALL_SECTIONS_UNITS_ACCESS') ||
                              actorUser.hasGlobalAccess === true;

    if (!canAccessDeptMgmt) {
      const db = (window.store && typeof window.store.getDb === 'function') ? window.store.getDb() : {};
      const userSec = (db.sections || []).find(s => s.id === actorUser.sectionId);
      const userUnit = (db.units || []).find(u => u.id === actorUser.unitId);

      return `
        <div class="card" style="text-align: center; padding: 3.5rem 1.5rem; max-width: 680px; margin: 2rem auto; border-top: 4px solid var(--md-sys-color-error); box-shadow: 0 10px 30px rgba(0,0,0,0.08); border-radius: 16px;">
          <div style="font-size: 3.5rem; margin-bottom: 1rem;">🔒</div>
          <h2 style="font-weight: 800; color: var(--md-sys-color-error); margin-bottom: 0.75rem; font-size: 1.5rem;">
            وصول مقيد - غير مصرح بالدخول
          </h2>
          <p style="color: var(--md-sys-color-on-surface); font-size: 1rem; line-height: 1.7; margin-bottom: 1.5rem;">
            حسب ضوابط الصلاحيات الإدارية المعتمدة (RBAC)، فإن الدخول المباشر لإدارة القسم مخصص لقيادة القسم ومسؤولي الشُعب والوحدات والإداريين المكلفين فقط.
            <br>
            يمكن للمنتسبين تقديم <strong>طلبات المقابلة الرسمية</strong> والاستمارات الإدارية مباشرة من خلال مساحة عمل شعبتهم أو وحدتهم.
          </p>
          <div style="background: var(--md-sys-color-surface-variant); padding: 0.85rem 1.25rem; border-radius: 10px; margin-bottom: 1.5rem; font-size: 0.9rem; display: inline-flex; align-items: center; gap: 0.5rem;">
            <span>جهة الارتباط التابع لها حالياً:</span>
            <strong style="color: var(--md-sys-color-primary);">${userSec ? userSec.name : (userUnit ? userUnit.name : 'موقع ميداني')}</strong>
          </div>
          <div style="display: flex; justify-content: center; gap: 1rem; flex-wrap: wrap;">
            ${userSec ? `
              <button class="btn btn-primary" onclick="window.app.navigate('section_workspace', '${userSec.id}')" style="font-weight: 700;">
                الذهاب إلى مساحة عمل شعبتك (${userSec.name}) ←
              </button>
            ` : ''}
            ${userUnit ? `
              <button class="btn btn-primary" onclick="window.app.navigate('unit_workspace', '${userUnit.id}')" style="font-weight: 700;">
                الذهاب إلى مساحة عمل وحدتك (${userUnit.name}) ←
              </button>
            ` : ''}
            <button class="btn btn-outline" onclick="window.app.openCreateInterviewRequestModal()" style="font-weight: 700; display: inline-flex; align-items: center; gap: 0.35rem;">
              🤝 تقديم طلب مقابلة الإدارة
            </button>
          </div>
        </div>
      `;
    }

    if (!window.app) {
      window.app = window.app || {};
    }
    if (!window.app.currentDeptManagementSubTab) {
      window.app.currentDeptManagementSubTab = 'staff';
    }
    const activeTab = window.app.currentDeptManagementSubTab || 'staff';

    const sections = (window.store && typeof window.store.getSections === 'function') 
      ? window.store.getSections(actorUser.departmentId) 
      : [];
    const safeSections = Array.isArray(sections) ? sections : [];

    // Safely retrieve data collections
    let notifs = [];
    if (window.store && typeof window.store.getOfficialNotifications === 'function') {
      notifs = window.store.getOfficialNotifications(actorUser.departmentId, actorUser);
    } else if (window.store && typeof window.store.getAnnouncements === 'function') {
      notifs = window.store.getAnnouncements(actorUser.departmentId);
    }
    const safeNotifs = Array.isArray(notifs) ? notifs : [];

    let staff = [];
    if (window.store && typeof window.store.getUnifiedEmployeeRoster === 'function') {
      staff = window.store.getUnifiedEmployeeRoster(actorUser);
    } else if (window.store && typeof window.store.getUsers === 'function') {
      staff = window.store.getUsers(actorUser.departmentId);
    }
    const safeStaff = Array.isArray(staff) ? staff : [];

    let docs = [];
    if (window.store && typeof window.store.getDocuments === 'function') {
      docs = window.store.getDocuments(actorUser.departmentId);
    }
    const safeDocs = Array.isArray(docs) ? docs : [];

    let interviewRequests = [];
    if (window.store && typeof window.store.getInterviewRequests === 'function') {
      interviewRequests = window.store.getInterviewRequests(actorUser.departmentId, actorUser);
    }
    const safeInterviews = Array.isArray(interviewRequests) ? interviewRequests : [];

    let vehicles = [];
    if (window.store && typeof window.store.getDepartmentVehicles === 'function') {
      vehicles = window.store.getDepartmentVehicles(actorUser.departmentId);
    } else if (window.store && typeof window.store.getVehicles === 'function') {
      vehicles = window.store.getVehicles(actorUser.departmentId);
    }
    const safeVehicles = Array.isArray(vehicles) ? vehicles : [];

    const db = (window.store && typeof window.store.getDb === 'function') ? window.store.getDb() : {};
    const deptManager = (db.users || []).find(u => u.role === 'DEPT_MANAGER');
    const deputyDeptManager = (db.users || []).find(u => u.role === 'DEPUTY_DEPT_MANAGER');

    return `
      <!-- Department Header -->
      <div style="margin-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
        <div style="display: flex; align-items: center; gap: 1rem; flex-wrap: wrap;">
          <div>
            <h2 style="font-size: 1.75rem; font-weight: 900; color: var(--md-sys-color-primary); display: flex; align-items: center; gap: 0.5rem; margin: 0;">
              🏛️ إدارة قسم الإنتاج الجنوبي
            </h2>
          </div>

          <!-- بطاقة القيادة الإدارية المركزية للقسم: مدير القسم والوكيل (تصميم زجاجي مكبّر ومميز) -->
          <div class="executive-leadership-card" style="padding: 0.55rem 1.15rem; border-radius: 14px; background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.92) 100%); border: 1.5px solid rgba(11, 87, 208, 0.22); box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05), inset 0 1px 1px rgba(255, 255, 255, 0.9); display: inline-flex; align-items: center; gap: 0.8rem; min-width: 220px; backdrop-filter: blur(10px);">
            <span class="nav-icon-box icon-emerald" style="width: 36px; height: 36px; min-width: 36px; border-radius: 9px; box-shadow: 0 2px 8px rgba(16, 185, 129, 0.25); display: flex; align-items: center; justify-content: center;">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </span>
            <div style="display: flex; flex-direction: column; justify-content: center; text-align: right; gap: 2px;">
              <div style="display: flex; align-items: baseline; gap: 0.35rem;">
                <span style="font-size: 0.72rem; font-weight: 800; color: var(--md-sys-color-primary); white-space: nowrap;">مدير القسم:</span>
                <span style="font-size: 0.92rem; font-weight: 900; color: var(--md-sys-color-on-surface); line-height: 1.2;">${deptManager ? deptManager.fullName : 'م. أحمد عبد الحسين'}</span>
              </div>
              <div style="display: flex; align-items: baseline; gap: 0.35rem; border-top: 1px dashed rgba(0, 0, 0, 0.09); padding-top: 2px; margin-top: 1px;">
                <span style="font-size: 0.7rem; font-weight: 800; color: #d97706; white-space: nowrap;">وكيل مدير القسم:</span>
                <span style="font-size: 0.85rem; font-weight: 800; color: #b45309; line-height: 1.2;">${deputyDeptManager ? deputyDeptManager.fullName : 'قيد التكليف'}</span>
              </div>
            </div>
          </div>
        </div>
        <div style="display: flex; flex-direction: column; gap: 0.65rem; align-items: stretch;">
          <div style="display: flex; gap: 0.65rem; flex-wrap: wrap; align-items: center;">
            ${(actorUser && ['DEPT_MANAGER', 'SUPER_ADMIN'].includes(actorUser.role)) ? `
              <button class="btn btn-glass-primary" onclick="window.app.openCreateSectionModal()" title="استحداث شعبة جديدة">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 5v14M5 12h14"></path>
                </svg>
                <span>إنشاء شعبة جديدة</span>
                <span style="font-size: 1.05rem;">🛢️</span>
              </button>
              <button class="btn btn-glass-amber" onclick="window.app.openCreateUnitModal()" title="استحداث وحدة جديدة">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 5v14M5 12h14"></path>
                </svg>
                <span>إنشاء وحدة جديدة</span>
                <span style="font-size: 1.05rem;">⚡</span>
              </button>
            ` : ''}
          </div>

          <!-- الزر الزجاجي الحيوي: ملء وتحديث بيانات كادر القسم أسفلهما -->
          <button class="btn btn-glass-emerald" onclick="window.app.openDeptDataEntryModal()" title="تحديث وتعبئة استمارة بيانات كادر القسم"
                  style="width: 100%; justify-content: center;">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
            <span>ملء وتحديث بيانات كادر القسم</span>
            <span style="font-size: 1.05rem;">📝</span>
          </button>
        </div>
      </div>

      <!-- 6 Sub-Tabs Header Navigation (كادر القسم أولاً) -->
      <div class="tabs-header" style="margin-bottom: 1.5rem;">
        <button class="tab-btn ${activeTab === 'staff' ? 'active' : ''}" onclick="window.app.setDeptManagementSubTab('staff')">
          👥 <span>كادر القسم</span> <span class="tab-count-badge">${safeStaff.length}</span>
        </button>
        <button class="tab-btn ${activeTab === 'notifs' ? 'active' : ''}" onclick="window.app.setDeptManagementSubTab('notifs')">
          📢 <span>التبليغات الرسمية</span> <span class="tab-count-badge">${safeNotifs.length}</span>
        </button>
        <button class="tab-btn ${activeTab === 'forms' ? 'active' : ''}" onclick="window.app.setDeptManagementSubTab('forms')">
          📝 <span>الاستمارات والبيانات</span>
        </button>
        <button class="tab-btn ${activeTab === 'docs' ? 'active' : ''}" onclick="window.app.setDeptManagementSubTab('docs')">
          📄 <span>الوثائق والتقارير</span> <span class="tab-count-badge">${safeDocs.length}</span>
        </button>
        <button class="tab-btn ${activeTab === 'interviews' ? 'active' : ''}" onclick="window.app.setDeptManagementSubTab('interviews')">
          🤝 <span>طلبات المقابلة</span> <span class="tab-count-badge">${safeInterviews.length}</span>
        </button>
        <button class="tab-btn ${activeTab === 'vehicles' ? 'active' : ''}" onclick="window.app.setDeptManagementSubTab('vehicles')">
          🚘 <span>مرآب وعجلات القسم</span> <span class="tab-count-badge">${safeVehicles.length}</span>
        </button>
        <button class="tab-btn ${activeTab === 'mail' ? 'active' : ''}" onclick="window.app.setDeptManagementSubTab('mail')">
          📬 <span>البريد</span>
        </button>
      </div>

      <!-- Sub-Tab Content View -->
      <div id="deptSubTabContainer">
        ${activeTab === 'notifs' ? renderDeptNotifsTab(safeNotifs, actorUser, safeSections) : ''}
        ${activeTab === 'staff' ? renderDeptStaffTab(safeStaff, actorUser, safeSections) : ''}
        ${activeTab === 'forms' ? renderDeptFormsTab(actorUser) : ''}
        ${activeTab === 'docs' ? renderDeptDocsTab(safeDocs, actorUser, safeSections) : ''}
        ${activeTab === 'interviews' ? renderDeptInterviewsTab(safeInterviews, actorUser) : ''}
        ${activeTab === 'vehicles' ? renderDeptVehiclesTab(safeVehicles, actorUser, safeSections) : ''}
        ${activeTab === 'mail' ? (typeof window.renderMailTab === 'function' ? window.renderMailTab({ level: 'department', id: actorUser.departmentId || 'dept-south-prod' }) : '<div class="card" style="padding:2rem;text-align:center;">⏳ جاري تحميل نظام البريد...</div>') : ''}
      </div>
    `;
  } catch (err) {
    console.error('Error rendering DeptManagementView:', err);
    return `
      <div class="card" style="border: 2px solid #d93025; padding: 2rem;">
        <h3 style="color: #d93025; margin-top: 0;">⚠️ تنبيه: حدث خطأ أثناء تحميل واجهة إدارة القسم</h3>
        <p style="color: var(--md-sys-color-on-surface); font-family: monospace;">${err.message}</p>
        <button class="btn btn-primary" onclick="window.app.navigate('dept_management')">إعادة المحاولة</button>
      </div>
    `;
  }
}

// ==========================================================================
// 1. تبويب التبليغات (Text Notifications)
// ==========================================================================
function renderDeptNotifsTab(notifs, actorUser, sections) {
  const canCreate = window.rbac ? window.rbac.hasPermission(actorUser, 'NOTIFS_CREATE') : true;
  const canPublish = window.rbac ? window.rbac.hasPermission(actorUser, 'NOTIFS_PUBLISH') : true;
  const canDelete = window.rbac ? window.rbac.hasPermission(actorUser, 'NOTIFS_DELETE') : true;
  const safeSections = Array.isArray(sections) ? sections : [];

  return `
    <div class="card">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; margin-bottom: 1.25rem;">
        <div>
          <h4 style="font-weight: 800; color: var(--md-sys-color-primary); margin: 0 0 0.25rem 0;">
            📢 التبليغات الإدارية والرسمية للقسم (Official Text Notifications)
          </h4>
          <p style="color: var(--md-sys-color-outline); font-size: 0.85rem; margin: 0;">
            إصدار ومتابعة وتوجيه الكتب والتعليمات النصية المباشرة لكوادر الشعب والوحدات.
          </p>
        </div>
        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
          <input type="text" id="deptNotifSearchInput" class="form-control" style="width: 220px; font-size: 0.85rem; padding: 0.35rem 0.75rem;" placeholder="🔍 بحث في التبليغات..." oninput="window.app.filterDeptNotifs()">
          <select id="deptNotifSectionFilter" class="form-control" style="width: 170px; font-size: 0.85rem; padding: 0.35rem 0.75rem;" onchange="window.app.filterDeptNotifs()">
            <option value="ALL">كافة الجهات المستلمة</option>
            <option value="ALL_SECTIONS">🌐 كافة شعب القسم</option>
            ${safeSections.map(s => `<option value="${s.id}">${s.name}</option>`).join('')}
          </select>
          ${canCreate ? `
            <button class="btn btn-glass-primary" onclick="window.app.openCreateDeptNotificationModal()" title="إصدار تبليغ وتوجيه إداري جديد للقسم">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 5v14M5 12h14"></path>
              </svg>
              <span>إصدار تبليغ رسمي جديد</span>
              <span style="font-size: 1.05rem;">📢</span>
            </button>
          ` : ''}
        </div>
      </div>

      <div id="deptNotifsListContainer" style="display: grid; gap: 1rem;">
        ${notifs.length === 0 ? `
          <div style="text-align: center; padding: 3.5rem 1rem; color: var(--md-sys-color-outline); background: var(--md-sys-color-surface-variant); border-radius: var(--radius-md);">
            <div style="font-size: 2.8rem; margin-bottom: 0.6rem;">📭</div>
            <h4 style="margin: 0 0 0.5rem 0; font-weight: 700;">لا توجد تبليغات حالياً</h4>
            <p style="font-size: 0.88rem; max-width: 450px; margin: 0 auto 1.25rem auto;">
              يمكنك إصدار وتوجيه أول تبليغ رسمي نصي إلى كوادر القسم أو شعبة محددة بالضغط على الزر أدناه.
            </p>
            ${canCreate ? `
              <button class="btn btn-primary" onclick="window.app.openCreateDeptNotificationModal()">
                + إضافة تبليغ
              </button>
            ` : ''}
          </div>
        ` : notifs.map(n => {
          const isUrgent = n.importance === 'URGENT' || n.priority === 'URGENT';
          const targetSection = safeSections.find(s => s.id === n.targetSectionId);
          const targetText = n.targetScope === 'ALL_SECTIONS' || !n.targetSectionId 
            ? '🌐 تعميم لكافة شعب ووحدات القسم' 
            : (targetSection ? targetSection.name : (n.targetSectionName || 'شعبة محددة'));

          const dateStr = (n.publishDate || n.createdAt) 
            ? new Date(n.publishDate || n.createdAt).toLocaleDateString('ar-IQ') 
            : 'اليوم';

          return `
            <div class="dept-notif-item card" data-title="${(n.title || '').toLowerCase()}" data-content="${(n.content || '').toLowerCase()}" data-section="${n.targetSectionId || 'ALL_SECTIONS'}" style="margin-bottom: 0; border-right: 5px solid ${isUrgent ? '#d93025' : 'var(--md-sys-color-primary)'}; background: var(--md-sys-color-surface);">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 0.75rem; margin-bottom: 0.5rem;">
                <div>
                  <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
                    <h4 style="margin: 0; font-size: 1.05rem; font-weight: 800; color: var(--md-sys-color-on-surface);">
                      ${n.title || 'تبليغ رسمي'}
                    </h4>
                    ${isUrgent ? '<span class="badge badge-danger">عاجل وهام</span>' : ''}
                    <span class="badge badge-primary">${targetText}</span>
                    <span class="badge ${n.status === 'PUBLISHED' ? 'badge-success' : 'badge-secondary'}">
                      ${n.status === 'PUBLISHED' ? 'منشور' : 'مسودة / مؤرشف'}
                    </span>
                  </div>
                  <div style="font-size: 0.78rem; color: var(--md-sys-color-outline);">
                    📅 الصادر: ${dateStr} | بواسطة: <strong>${n.createdByName || 'إدارة القسم'}</strong>
                  </div>
                </div>

                <div style="display: flex; gap: 0.35rem; align-items: center;">
                  ${canPublish ? `
                    <button class="${n.status === 'PUBLISHED' ? 'btn-action-broadcast' : 'btn-action-export'}" onclick="window.app.togglePublishDeptNotification('${n.id}')" title="${n.status === 'PUBLISHED' ? 'إلغاء تعميم التبليغ' : 'نشر وتعميم التبليغ'}">
                      ${n.status === 'PUBLISHED' ? 'إلغاء النشر' : 'نشر التبليغ'}
                    </button>
                  ` : ''}
                  ${canDelete ? `
                    <button class="btn-action-trash" onclick="window.app.deleteDeptNotification('${n.id}')" title="أرشفة وحذف التبليغ" style="width: auto; padding: 0.24rem 0.65rem; border-radius: var(--radius-full); gap: 0.35rem;">
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                      <span>أرشفة</span>
                    </button>
                  ` : ''}
                </div>
              </div>

              <div style="font-size: 0.88rem; line-height: 1.6; color: var(--md-sys-color-on-surface); white-space: pre-wrap; background: var(--md-sys-color-surface-variant); padding: 0.75rem 1rem; border-radius: var(--radius-sm);">
                ${n.content || ''}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

// ==========================================================================
// 2. تبويب كادر ومستخدمي القسم (Department Staff & Users)
// ==========================================================================
function renderDeptStaffTab(staff, actorUser, sections) {
  const safeSections = Array.isArray(sections) ? sections : [];
  const secMap = {};
  safeSections.forEach(s => { if (s && s.id) secMap[s.id] = s; });

  const stations = (window.store && typeof window.store.getStations === 'function') ? window.store.getStations() : [];
  const staMap = {};
  stations.forEach(st => { if (st && st.id) staMap[st.id] = st; });

  const units = (window.store && typeof window.store.getUnits === 'function') ? window.store.getUnits() : [];
  const unitMap = {};
  units.forEach(u => { if (u && u.id) unitMap[u.id] = u; });

  if (typeof window !== 'undefined') {
    if (!window.app) window.app = {};
    if (!window.app.deptStaffState) {
      window.app.deptStaffState = { page: 1, pageSize: 25, search: '', section: 'ALL' };
    }
  }

  const state = (typeof window !== 'undefined' && window.app && window.app.deptStaffState)
    ? window.app.deptStaffState
    : { page: 1, pageSize: 25, search: '', section: 'ALL' };

  const q = (state.search || '').toLowerCase().trim();
  const safeStaffList = Array.isArray(staff) ? staff : [];
  const filtered = safeStaffList.filter(emp => {
    if (state.section !== 'ALL') {
      if (state.section === 'NONE' && emp.sectionId) return false;
      if (state.section !== 'NONE' && emp.sectionId !== state.section) return false;
    }
    if (q) {
      const name = (emp.fullName || emp.name || '').toLowerCase();
      const empid = (emp.employeeId || '').toLowerCase();
      const email = (emp.email || emp.userEmail || '').toLowerCase();
      if (!name.includes(q) && !empid.includes(q) && !email.includes(q)) return false;
    }
    return true;
  });

  const pageSizeNum = state.pageSize === 'ALL' ? (filtered.length || 1) : (parseInt(state.pageSize, 10) || 25);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSizeNum));
  const currentPage = Math.min(Math.max(1, state.page || 1), totalPages);
  state.page = currentPage;

  const startIdx = (currentPage - 1) * pageSizeNum;
  const endIdx = state.pageSize === 'ALL' ? filtered.length : Math.min(startIdx + pageSizeNum, filtered.length);
  const pageItems = filtered.slice(startIdx, endIdx);

  return `
    <div class="card">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; margin-bottom: 1.25rem;">
        <div>
          <h4 style="font-weight: 800; color: var(--md-sys-color-primary); margin: 0 0 0.25rem 0;">
            👥 كادر القسم (Department Staff)
          </h4>
          <p style="color: var(--md-sys-color-outline); font-size: 0.85rem; margin: 0;">
            عرض منظم لمستخدمي وكوادر القسم مرتبط مباشرة بسجل المستخدمين دون تكرار للبيانات.
          </p>
        </div>
        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; align-items: center;">
          <input type="text" id="deptStaffSearchInput" class="form-control" style="width: 180px; font-size: 0.85rem; padding: 0.35rem 0.75rem;" value="${state.search || ''}" placeholder="🔍 بحث بالاسم أو الرقم..." oninput="window.app.filterDeptStaff()">
          <select id="deptStaffSectionFilter" class="form-control" style="width: 140px; font-size: 0.85rem; padding: 0.35rem 0.75rem;" onchange="window.app.filterDeptStaff()">
            <option value="ALL" ${state.section === 'ALL' ? 'selected' : ''}>كافة الشعب</option>
            ${safeSections.map(s => `<option value="${s.id}" ${state.section === s.id ? 'selected' : ''}>${s.name}</option>`).join('')}
          </select>
          
          <!-- Custom Data Export & Print Tool Button -->
          <button type="button" class="btn btn-glass-primary" onclick="window.app.openCustomStaffExportModal()" title="أداة التصدير والطباعة المخصصة لبيانات كادر القسم (PDF, Word, Excel)" style="padding: 0.38rem 0.9rem; font-size: 0.85rem;">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            <span>📥 تصدير وطباعة مخصصة</span>
            <span style="font-size: 0.95rem;">⚡</span>
          </button>
        </div>
      </div>

      <div class="table-container" style="overflow-x: auto;">
        <table class="data-table" id="deptStaffTable" style="font-size: 0.88rem;">
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
          <tbody id="deptStaffTableBody">
            ${pageItems.length === 0 ? `
              <tr>
                <td colspan="7" style="text-align: center; padding: 3rem 1rem; color: var(--md-sys-color-outline);">
                  <div style="font-size: 2.2rem; margin-bottom: 0.5rem;">👥</div>
                  <h4>لا توجد نتائج مطابقة لبحث كادر القسم</h4>
                </td>
              </tr>
            ` : pageItems.map(emp => {
              const sec = secMap[emp.sectionId];
              const un = unitMap[emp.unitId];
              const st = staMap[emp.stationId];
              const scopeText = sec ? sec.name : (un ? un.name : (st ? st.name : 'إدارة القسم'));
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
                <tr class="dept-staff-row"
                    data-name="${(emp.fullName || '').toLowerCase()}"
                    data-empid="${(emp.employeeId || '').toLowerCase()}"
                    data-section="${emp.sectionId || 'NONE'}">
                  
                  <!-- 1. الاسم -->
                  <td>
                    <div style="display: flex; align-items: center; gap: 0.6rem; min-width: 0;">
                      <div style="width: 34px; height: 34px; border-radius: 50%; background: var(--md-sys-color-primary); color: white; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.88rem; flex-shrink: 0;">
                        ${(emp.fullName || 'م').substring(0, 2)}
                      </div>
                      <div style="min-width: 0;">
                        <strong style="font-size: 0.92rem; color: var(--md-sys-color-on-surface); white-space: nowrap; display: block;" title="${emp.fullName}">${emp.fullName}</strong>
                        <div style="font-size: 0.75rem; color: var(--md-sys-color-outline); white-space: nowrap;">${emp.email || emp.userEmail || emp.emailPersonal || emp.phone || 'كادر القسم'}</div>
                      </div>
                    </div>
                  </td>

                  <!-- 2. الرقم الوظيفي -->
                  <td style="font-family: monospace; font-weight: 700; white-space: nowrap;">
                    <code>${emp.employeeId || '—'}</code>
                  </td>

                  <!-- 3. جهة الارتباط -->
                  <td>
                    <div style="font-weight: 700; color: var(--md-sys-color-on-surface); white-space: nowrap;">${scopeText}</div>
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
                      <button class="btn-action-view" onclick="window.app.openMasterDossierModal('${emp.employeeId || ''}')" title="معاينة الإضبارة الموحدة" style="padding: 0.3rem 0.65rem;">
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
          </tbody>
        </table>
      </div>

      <!-- Department Staff Pagination Bar (تصميم كريستالي جذاب وعملي ومفعل) -->
      <div class="pagination-bar-container">
        <div style="display: flex; align-items: center; gap: 0.6rem; flex-wrap: wrap;">
          <div class="pagination-info-badge">
            <span>📊</span>
            <span>عرض <strong>${filtered.length === 0 ? 0 : startIdx + 1} - ${endIdx}</strong> من إجمالي <strong>${filtered.length}</strong> موظف</span>
          </div>
          ${filtered.length !== safeStaffList.length ? `<span style="font-size: 0.78rem; color: var(--md-sys-color-outline); font-weight: 600;">(إجمالي كادر القسم: ${safeStaffList.length})</span>` : ''}
        </div>

        <div class="pagination-controls-wrapper">
          <div class="pagination-size-group">
            <span>عرض بالصفحة:</span>
            <select class="pagination-size-select" onchange="window.app.setDeptStaffPageSize(this.value)">
              <option value="25" ${state.pageSize === 25 || state.pageSize === '25' ? 'selected' : ''}>25</option>
              <option value="50" ${state.pageSize === 50 || state.pageSize === '50' ? 'selected' : ''}>50</option>
              <option value="100" ${state.pageSize === 100 || state.pageSize === '100' ? 'selected' : ''}>100</option>
              <option value="ALL" ${state.pageSize === 'ALL' ? 'selected' : ''}>عرض الكل</option>
            </select>
          </div>

          <div class="pagination-nav-cluster">
            <button class="pagination-action-btn" onclick="window.app.setDeptStaffPage(1)" ${currentPage <= 1 ? 'disabled' : ''} title="الصفحة الأولى">
              <span>«</span>
              <span style="font-size: 0.76rem;">الأولى</span>
            </button>
            <button class="pagination-action-btn" onclick="window.app.setDeptStaffPage(${currentPage - 1})" ${currentPage <= 1 ? 'disabled' : ''} title="الصفحة السابقة">
              <span>‹</span>
              <span style="font-size: 0.76rem;">السابق</span>
            </button>
            <div class="pagination-page-indicator-pill" title="الصفحة الحالية من إجمالي الصفحات">
              <span style="font-size: 0.75rem; opacity: 0.9;">صفحة</span>
              <span style="font-size: 0.92rem; font-family: monospace; font-weight: 900;">${currentPage}</span>
              <span style="font-size: 0.75rem; opacity: 0.85;">من</span>
              <span style="font-size: 0.92rem; font-family: monospace; font-weight: 900;">${totalPages}</span>
            </div>
            <button class="pagination-action-btn" onclick="window.app.setDeptStaffPage(${currentPage + 1})" ${currentPage >= totalPages ? 'disabled' : ''} title="الصفحة التالية">
              <span style="font-size: 0.76rem;">التالي</span>
              <span>›</span>
            </button>
            <button class="pagination-action-btn" onclick="window.app.setDeptStaffPage(${totalPages})" ${currentPage >= totalPages ? 'disabled' : ''} title="الصفحة الأخيرة">
              <span style="font-size: 0.76rem;">الأخيرة</span>
              <span>»</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ==========================================================================
// 3. تبويب الوثائق والتقارير (Documents & Reports)
// ==========================================================================
function renderDeptDocsTab(docs, actorUser, sections) {
  const canUpload = window.rbac ? window.rbac.hasPermission(actorUser, 'FILES_UPLOAD') : true;
  const canEdit = window.rbac ? window.rbac.hasPermission(actorUser, 'FILES_EDIT') : true;
  const canDelete = window.rbac ? window.rbac.hasPermission(actorUser, 'FILES_DELETE') : true;
  const canDownload = window.rbac ? window.rbac.hasPermission(actorUser, 'FILES_DOWNLOAD') : true;
  const canPrint = window.rbac ? window.rbac.hasPermission(actorUser, 'FILES_PRINT') : true;
  const safeSections = Array.isArray(sections) ? sections : [];

  return `
    <div class="card">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; margin-bottom: 1.25rem;">
        <div>
          <h4 style="font-weight: 800; color: var(--md-sys-color-primary); margin: 0 0 0.25rem 0;">
            📄 الوثائق والتقارير (Documents & Reports)
          </h4>
          <p style="color: var(--md-sys-color-outline); font-size: 0.85rem; margin: 0;">
            إدارة الوثائق والتقارير الرسمية والهندسية للقسم وفق نظام إدارة الملفات المعتمد.
          </p>
        </div>
        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
          <input type="text" id="deptDocSearchInput" class="form-control" style="width: 200px; font-size: 0.85rem; padding: 0.35rem 0.75rem;" placeholder="🔍 بحث في الوثائق..." oninput="window.app.filterDeptDocs()">
          <select id="deptDocCategoryFilter" class="form-control" style="width: 140px; font-size: 0.85rem; padding: 0.35rem 0.75rem;" onchange="window.app.filterDeptDocs()">
            <option value="ALL">كافة التصنيفات</option>
            <option value="WORD">مستندات Word</option>
            <option value="EXCEL">جداول Excel</option>
            <option value="PDF">ملفات PDF</option>
          </select>
          ${canUpload ? `
            <button class="btn btn-glass-primary" onclick="window.app.openCreateDocumentModal()" title="إضافة وتوثيق مستند أو تقرير رسمي جديد">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 5v14M5 12h14"></path>
              </svg>
              <span>إضافة وثيقة / تقرير</span>
              <span style="font-size: 1.05rem;">📄</span>
            </button>
          ` : ''}
        </div>
      </div>

      <div class="table-container" style="overflow-x: auto;">
        <table class="data-table" id="deptDocsTable" style="font-size: 0.88rem;">
          <thead>
            <tr>
              <th>عنوان المستند / التقرير</th>
              <th>النوع والتصنيف</th>
              <th>الجهة المصدرة</th>
              <th>المحرر</th>
              <th>تاريخ التحديث</th>
              <th>الإصدار</th>
              <th style="text-align: center; min-width: 200px;">إدارة الملفات</th>
            </tr>
          </thead>
          <tbody>
            ${docs.length === 0 ? `
              <tr>
                <td colspan="7" style="text-align: center; padding: 3rem 1rem; color: var(--md-sys-color-outline);">
                  <div style="font-size: 2.2rem; margin-bottom: 0.5rem;">📄</div>
                  <h4>لا توجد وثائق حالياً</h4>
                  ${canUpload ? `
                    <button class="btn btn-primary" style="margin-top: 0.75rem;" onclick="window.app.openCreateDocumentModal()">
                      + رفع وثيقة / تقرير
                    </button>
                  ` : ''}
                </td>
              </tr>
            ` : docs.map(d => {
              const sec = safeSections.find(s => s.id === d.sectionId);
              const dateStr = (d.updatedAt || d.createdAt) 
                ? new Date(d.updatedAt || d.createdAt).toLocaleDateString('ar-IQ') 
                : 'اليوم';

              return `
                <tr class="dept-doc-row" data-title="${(d.title || '').toLowerCase()}" data-category="${d.category || ''}">
                  <td>
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                      <span style="font-size: 1.2rem;">${d.category === 'EXCEL' ? '📊' : d.category === 'PDF' ? '📕' : '📄'}</span>
                      <strong style="color: var(--md-sys-color-primary); cursor: pointer;" onclick="window.app.openDocumentViewModal('${d.id}')">
                        ${d.title || 'مستند'}
                      </strong>
                    </div>
                  </td>
                  <td>
                    <span class="badge ${d.category === 'EXCEL' ? 'badge-success' : 'badge-primary'}">
                      ${d.category || 'WORD'}
                    </span>
                  </td>
                  <td>${sec ? sec.name : 'إدارة القسم'}</td>
                  <td>${d.createdByName || 'مسؤول التوثيق'}</td>
                  <td>${dateStr}</td>
                  <td><code>v${d.version || '1.0'}</code></td>
                  <td style="text-align: center;">
                    <div style="display: flex; gap: 0.35rem; justify-content: center; align-items: center; flex-wrap: wrap;">
                      <button class="btn-action-view" onclick="window.app.openDocumentViewModal('${d.id}')" title="معاينة المستند">
                        معاينة
                      </button>
                      ${canDownload ? `
                        <button class="btn-action-download" onclick="window.app.downloadDocumentFile('${d.id}')" title="تنزيل المستند">
                          تنزيل
                        </button>
                      ` : ''}
                      ${canPrint ? `
                        <button class="btn-action-print" onclick="window.app.printDocumentFile('${d.id}')" title="طباعة المستند">
                          طباعة
                        </button>
                      ` : ''}
                      ${canEdit ? `
                        <button class="btn-action-edit" onclick="window.app.openEditDocumentModal('${d.id}')" title="تعديل المستند">
                          تعديل
                        </button>
                      ` : ''}
                      ${canDelete ? `
                        <button class="btn-action-trash" onclick="window.app.deleteDocument('${d.id}')" title="حذف للأرشيف">
                          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          </svg>
                        </button>
                      ` : ''}
                    </div>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// ==========================================================================
// 4. تبويب طلب مقابلة (Interview Requests Tab)
// ==========================================================================
function renderDeptInterviewsTab(requests, actorUser) {
  const isManager = ['DEPT_MANAGER', 'SUPER_ADMIN', 'SECTION_MANAGER'].includes(actorUser.role);

  return `
    <div class="card">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; margin-bottom: 1.25rem;">
        <div>
          <h4 style="font-weight: 800; color: var(--md-sys-color-primary); margin: 0 0 0.25rem 0;">
            🤝 طلبات المقابلة الرسمية (Interview Requests)
          </h4>
          <p style="color: var(--md-sys-color-outline); font-size: 0.85rem; margin: 0;">
            استعراض ومتابعة واتخاذ الإجراءات الإدارية بشأن طلبات المقابلات المقدمة من كوادر ومنتسبي الشعب والوحدات.
          </p>
        </div>
      </div>

      <div style="display: grid; gap: 1rem;">
        ${requests.length === 0 ? `
          <div style="text-align: center; padding: 3.5rem 1rem; color: var(--md-sys-color-outline); background: var(--md-sys-color-surface-variant); border-radius: var(--radius-md);">
            <div style="font-size: 2.8rem; margin-bottom: 0.6rem;">🤝</div>
            <h4 style="margin: 0 0 0.5rem 0; font-weight: 700;">لا توجد طلبات مقابلة حالياً</h4>
            <p style="font-size: 0.88rem; max-width: 450px; margin: 0 auto;">
              يتم استقبال طلبات المقابلات الرسمية المحالة من مساحات عمل الشعب والوحدات هنا للمعالجة والمتابعة من قبل إدارة القسم.
            </p>
          </div>
        ` : requests.map(req => {
          let statusBadge = 'badge';
          let statusLabel = req.status || 'جديد';

          if (req.status === 'NEW') {
            statusBadge = 'badge badge-primary'; statusLabel = 'جديد';
          } else if (req.status === 'UNDER_REVIEW') {
            statusBadge = 'badge badge-warning'; statusLabel = 'قيد المراجعة';
          } else if (req.status === 'ACCEPTED') {
            statusBadge = 'badge badge-success'; statusLabel = 'مقبول';
          } else if (req.status === 'REJECTED') {
            statusBadge = 'badge badge-danger'; statusLabel = 'مرفوض';
          } else if (req.status === 'POSTPONED') {
            statusBadge = 'badge badge-secondary'; statusLabel = 'مؤجل';
          } else if (req.status === 'COMPLETED') {
            statusBadge = 'badge badge-success'; statusLabel = 'مكتمل';
          }

          const priorityBadge = req.priority === 'URGENT' ? 'badge-danger' : req.priority === 'IMPORTANT' ? 'badge-warning' : 'badge-secondary';
          const priorityLabel = req.priority === 'URGENT' ? 'عاجل' : req.priority === 'IMPORTANT' ? 'هام' : 'عادي';

          return `
            <div class="card" style="margin-bottom: 0; border: 1px solid var(--md-sys-color-surface-variant); border-right: 5px solid ${req.status === 'ACCEPTED' ? '#137333' : req.status === 'REJECTED' ? '#d93025' : '#f29900'}; padding: 1.2rem;">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 0.75rem; margin-bottom: 0.5rem;">
                <div>
                  <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
                    <h4 style="margin: 0; font-size: 1.05rem; font-weight: 800; color: var(--md-sys-color-on-surface);">
                      ${req.topic || 'طلب مقابلة'}
                    </h4>
                    <span class="${statusBadge}">${statusLabel}</span>
                    <span class="badge ${priorityBadge}">${priorityLabel}</span>
                  </div>
                  <div style="font-size: 0.82rem; color: var(--md-sys-color-outline);">
                    مقدم الطلب: <strong>${req.applicantName || 'المنتسب'}</strong> (<code>${req.applicantEmployeeId || '—'}</code>) | ${req.applicantSection || 'إدارة القسم'} | التاريخ المقترح: <strong>${req.proposedDate || '—'}</strong>
                  </div>
                </div>

                ${isManager ? `
                  <div style="display: flex; gap: 0.35rem; align-items: center; flex-wrap: wrap;">
                    <button class="btn-action-accept" onclick="window.app.handleUpdateInterviewStatus('${req.id}', 'ACCEPTED')" title="قبول الموعد">
                      ✓ قبول
                    </button>
                    <button class="btn-action-postpone" onclick="window.app.handleUpdateInterviewStatus('${req.id}', 'POSTPONED')" title="تأجيل الموعد">
                      ⏸️ تأجيل
                    </button>
                    <button class="btn-action-decline" onclick="window.app.handleUpdateInterviewStatus('${req.id}', 'REJECTED')" title="الاعتذار عن الموعد">
                      ✗ اعتذار
                    </button>
                    <button class="btn-action-complete" onclick="window.app.handleUpdateInterviewStatus('${req.id}', 'COMPLETED')" title="إتمام وتوثيق المقابلة">
                      ✅ إتمام
                    </button>
                  </div>
                ` : ''}
              </div>

              <div style="font-size: 0.85rem; color: var(--md-sys-color-on-surface); background: var(--md-sys-color-surface-variant); padding: 0.6rem 0.85rem; border-radius: var(--radius-sm); margin-top: 0.4rem;">
                ${req.details || ''}
              </div>

              ${req.notes ? `
                <div style="font-size: 0.78rem; color: var(--md-sys-color-primary); margin-top: 0.4rem; font-weight: 600;">
                  📝 ملاحظات الإدارة: ${req.notes} ${req.reviewedBy ? `(بواسطة: ${req.reviewedBy})` : ''}
                </div>
              ` : ''}
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

// ==========================================================================
// 5. تبويب السيارات في إدارة القسم (Department Vehicles & Movements)
// ==========================================================================
function renderDeptVehiclesTab(vehicles, actorUser, sections) {
  const canManage = window.rbac ? (window.rbac.hasPermission(actorUser, 'MANAGE_VEHICLES') || ['DEPT_MANAGER', 'SUPER_ADMIN', 'SECTION_MANAGER'].includes(actorUser.role)) : true;
  const safeSections = Array.isArray(sections) ? sections : [];

  const currentSubSection = window.app.currentDeptVehiclesSection || 'fleet';

  // Get department vehicles and movements
  const deptVehicles = (window.store && typeof window.store.getVehicles === 'function')
    ? window.store.getVehicles(actorUser.departmentId, { affiliationType: 'DEPT_MGMT' }, actorUser)
    : vehicles;

  const deptMovements = (window.store && typeof window.store.getVehicleMovements === 'function')
    ? window.store.getVehicleMovements(actorUser.departmentId, { affiliationType: 'DEPT_MGMT' }, actorUser)
    : [];

  const operationalCount = deptVehicles.filter(v => v.operationalState === 'OPERATIONAL' || v.operationalState === 'بالعمل' || v.operationalState === 'عاملة').length;
  const inRepairCount = deptVehicles.filter(v => v.operationalState === 'IN_REPAIR' || v.operationalState === 'بالتصليح' || v.operationalState === 'في التصليح').length;
  const stoppedCount = deptVehicles.filter(v => v.operationalState === 'STOPPED' || v.operationalState === 'متوقفة').length;
  const inTransitCount = deptVehicles.filter(v => v.movementState === 'IN_TRANSIT').length;

  return `
    <div class="card">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; margin-bottom: 1.25rem;">
        <div>
          <h4 style="font-weight: 800; color: var(--md-sys-color-primary); margin: 0 0 0.25rem 0;">
            🚘 منظومة سيارات وحركة آليات إدارة القسم
          </h4>
          <p style="color: var(--md-sys-color-outline); font-size: 0.85rem; margin: 0;">
            إدارة سيارات مقر القسم المركزي وتوثيق حركاتها الميدانية اليومية.
          </p>
        </div>
        <div style="display: flex; gap: 0.65rem; flex-wrap: wrap; align-items: center;">
          ${canManage ? `
            <button class="btn btn-glass-primary" onclick="window.app.openCreateVehicleModal(null, 'DEPT_MGMT')" title="إضافة سيارة جديدة لمرآب القسم">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 5v14M5 12h14"></path>
              </svg>
              <span>إضافة سيارة جديدة للقسم</span>
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

      <!-- Sub-Tabs Switcher (سيارات القسم vs حركة السيارات) -->
      <div class="crystal-subtab-bar">
        <button class="crystal-subtab-btn ${currentSubSection === 'fleet' ? 'active' : ''}" onclick="window.app.setDeptVehiclesSection('fleet')">
          <span>🚗 سيارات القسم</span>
          <span class="crystal-subtab-badge">${deptVehicles.length}</span>
        </button>
        <button class="crystal-subtab-btn ${currentSubSection === 'movements' ? 'active' : ''}" onclick="window.app.setDeptVehiclesSection('movements')">
          <span>🚀 حركة السيارات</span>
          <span class="crystal-subtab-badge">${deptMovements.length}</span>
        </button>
      </div>

      ${currentSubSection === 'fleet' ? `
        <!-- Department Fleet Table -->
        <div class="table-container" style="overflow-x: auto;">
          <table class="data-table" id="deptVehiclesTable" style="font-size: 0.88rem;">
            <thead>
              <tr>
                <th>نوع السيارة</th>
                <th>الصفة</th>
                <th>الرقم الجانبي</th>
                <th>رقم السيارة</th>
                <th>اسم السائق</th>
                <th>الحالة</th>
                <th>جاهزية الحركة</th>
                ${canManage ? '<th style="text-align: center;">إجراءات</th>' : ''}
              </tr>
            </thead>
            <tbody>
              ${deptVehicles.length === 0 ? `
                <tr>
                  <td colspan="8" style="text-align: center; padding: 2.5rem; color: var(--md-sys-color-outline);">
                    لا توجد سيارات مسجلة لإدارة القسم حالياً.
                  </td>
                </tr>
              ` : deptVehicles.map(v => {
                const isGov = v.ownershipType === 'GOVERNMENT';
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

                return `
                  <tr>
                    <td><strong>${v.vehicleType || 'بيك آب'}</strong></td>
                    <td><span class="mini-status-chip ${isGov ? 'mini-chip-slate' : 'mini-chip-warning'}">${isGov ? 'حكومي' : 'مؤجرة'}</span></td>
                    <td><strong style="color: var(--md-sys-color-primary); font-family: monospace;">${v.sideNumber ? '#' + v.sideNumber : (isGov ? '<span style="color:#d93025;">مطلوب</span>' : '—')}</strong></td>
                    <td><code>${v.vehicleNumber || '—'}</code></td>
                    <td><strong>${v.driverName || 'غير محدد'}</strong></td>
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
        <!-- Department Movements Log Table -->
        <div class="table-container" style="overflow-x: auto;">
          <table class="data-table" style="font-size: 0.88rem;">
            <thead>
              <tr>
                <th>السائق</th>
                <th>نوع السيارة</th>
                <th>الصفة</th>
                <th>رقم السيارة</th>
                <th>الرقم الجانبي</th>
                <th>جهة الارتباط</th>
                <th>الغرض</th>
                <th>وقت الذهاب</th>
                <th>وقت الرجوع</th>
                <th>الحالة</th>
                <th style="text-align: center;">إجراء</th>
              </tr>
            </thead>
            <tbody>
              ${deptMovements.length === 0 ? `
                <tr>
                  <td colspan="11" style="text-align: center; padding: 2.5rem; color: var(--md-sys-color-outline);">
                    لا توجد حركات مسجلة لسيارات القسم حالياً.
                  </td>
                </tr>
              ` : deptMovements.map(m => {
                const depFormatted = m.departureTime ? new Date(m.departureTime).toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit' }) : '—';
                const retFormatted = m.returnTime ? new Date(m.returnTime).toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit' }) : '—';
                const isGov = m.ownershipType === 'GOVERNMENT';

                return `
                  <tr>
                    <td><strong>${m.driverName || 'سائق القسم'}</strong></td>
                    <td>${m.vehicleType || 'بيك آب'}</td>
                    <td><span class="mini-status-chip ${isGov ? 'mini-chip-slate' : 'mini-chip-warning'}">${isGov ? 'حكومي' : 'مؤجرة'}</span></td>
                    <td><code>${m.vehicleNumber || '—'}</code></td>
                    <td><strong style="color: var(--md-sys-color-primary);">${m.sideNumber ? '#' + m.sideNumber : '—'}</strong></td>
                    <td>${m.affiliationType === 'DEPT_MGMT' ? 'إدارة القسم' : (m.sectionName || 'الشعبة')}</td>
                    <td style="max-width: 220px;">${m.purpose || 'مهمة عمل'}</td>
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
// 6. تبويب الاستمارات والبيانات (Forms & Data Hub - 4 Equal Quadrants)
// ==========================================================================
function renderDeptFormsTab(actorUser) {
  const deptId = actorUser ? actorUser.departmentId : 'dept-south-prod';
  const allDocs = (window.store && typeof window.store.getDocuments === 'function') ? (window.store.getDocuments(deptId) || []) : [];
  
  // تصفية النماذج والفورمات الجاهزة المعتمدة على مستوى القسم
  const deptFormTemplates = allDocs.filter(d => {
    if (d.isArchived || d.status === 'ARCHIVED') return false;
    const isTemplateDoc = d.isTemplate === true || d.category === 'FORM_TEMPLATE' || (d.docType && d.docType.includes('TEMPLATE')) || ['WORD', 'EXCEL', 'PDF'].includes(d.category);
    return isTemplateDoc;
  });

  // تصفية الحقول المخصصة الديناميكية للقسم
  const allDynamicFields = (window.store && typeof window.store.getDynamicEmployeeFields === 'function') ? (window.store.getDynamicEmployeeFields(deptId) || []) : [];
  const deptDynamicFields = allDynamicFields.filter(f => f.isActive !== false);

  const db = (window.store && typeof window.store.getDb === 'function') ? window.store.getDb() : {};
  const deptRequests = (db.requests || []).slice(0, 50);

  const canManageForms = ['SUPER_ADMIN', 'DEPT_MANAGER', 'ADMINISTRATOR'].includes(actorUser.role) || (window.rbac && window.rbac.hasPermission(actorUser, 'CREATE_DOCUMENT'));

  return `
    <div style="display: flex; flex-direction: column; gap: 1.5rem;">

      <!-- شريط العنوان والعمليات الفورية لإدارة استمارات وفورمات القسم -->
      <div class="card" style="border-right: 5px solid var(--md-sys-color-primary); background: linear-gradient(135deg, rgba(11, 87, 208, 0.04) 0%, rgba(2, 132, 199, 0.08) 100%);">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
          <div>
            <h3 style="font-size: 1.35rem; font-weight: 800; color: var(--md-sys-color-primary); margin: 0 0 4px 0; display: flex; align-items: center; gap: 0.5rem;">
              <span>📝</span>
              <span>مركز الاستمارات والفورمات والنماذج التشغيلية — إدارة قسم الإنتاج الجنوبي</span>
            </h3>
            <p style="color: var(--md-sys-color-outline); margin: 0; font-size: 0.88rem;">
              المنظومة المركزية لإدارة واستعمال الفورمات: رفع وتحميل النماذج الجاهزة، وبناء حقول الاستمارة الإلكترونية الشاملة وتعبئة بيانات الكادر.
            </p>
          </div>
          <div style="display: flex; gap: 0.65rem; flex-wrap: wrap; align-items: center;">
            <button class="btn btn-glass-primary" onclick="window.app.openUploadSectionFormTemplateModal('DEPT', 'إدارة القسم')" title="رفع نموذج أو فورمة جاهزة للقسم">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
              <span>📤 رفع فورمة جاهزة (Word/Excel/PDF)</span>
            </button>
            <button class="btn btn-glass-amber" onclick="window.app.openCreateDynamicFieldModalFromDataEntry('DEPT', '', 'إدارة القسم')" title="إضافة حقل أو معلومة جديدة لاستمارة كادر القسم">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 5v14M5 12h14"></path>
              </svg>
              <span>➕ إضافة حقل مخصص لكادر القسم</span>
            </button>
          </div>
        </div>
      </div>

      <!-- شبكة الأرباع الهندسية المتساوية (4 أقسام متساوية الأبعاد 2x2) -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; align-items: stretch;">
        
        <!-- 1. بنك ومستودع الفورمات والنماذج الجاهزة للقسم -->
        <div class="card" style="border-top: 4px solid #0284c7; display: flex; flex-direction: column; min-height: 420px; max-height: 420px; height: 100%; margin: 0;">
          <div class="card-header" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem; border-bottom: 1px solid var(--md-sys-color-surface-variant); padding-bottom: 0.75rem; margin-bottom: 0.85rem; flex-shrink: 0;">
            <div>
              <h3 class="card-title" style="font-size: 1.1rem; font-weight: 800; color: #0284c7; display: flex; align-items: center; gap: 0.45rem; margin: 0;">
                <span>📁</span>
                <span>بنك الفورمات والنماذج الجاهزة (${deptFormTemplates.length})</span>
              </h3>
              <div style="font-size: 0.76rem; color: var(--md-sys-color-outline); margin-top: 2px;">
                ملفات وقوالب رسمية معتمدة على مستوى القسم للتحميل والتعبئة والطباعة
              </div>
            </div>
            <button class="btn btn-sm btn-outline" onclick="window.app.openUploadSectionFormTemplateModal('DEPT', 'إدارة القسم')" title="إضافة فورمة جديدة">
              <span>➕ رفع فورمة</span>
            </button>
          </div>

          <div style="flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 0.65rem; padding-right: 2px;">
            ${deptFormTemplates.length === 0 ? `
              <div style="text-align: center; padding: 2rem 1rem; background: var(--md-sys-color-background); border-radius: var(--radius-md); border: 2px dashed var(--md-sys-color-surface-variant); margin: auto 0;">
                <div style="font-size: 2.2rem; margin-bottom: 0.35rem;">📂</div>
                <h4 style="font-weight: 800; color: var(--md-sys-color-on-surface); margin-bottom: 0.25rem; font-size: 0.95rem;">لا توجد فورمات جاهزة مرفوعة للقسم بعد</h4>
                <p style="color: var(--md-sys-color-outline); font-size: 0.8rem; max-width: 320px; margin: 0 auto 0.85rem auto; line-height: 1.5;">
                  يمكن لإدارة القسم رفع نماذج واستمارات مصممة مسبقاً (Word / Excel / PDF) لتكون متاحة لجميع كوادر وشعب القسم.
                </p>
                <button class="btn btn-glass-primary" onclick="window.app.openUploadSectionFormTemplateModal('DEPT', 'إدارة القسم')" style="font-size: 0.82rem; padding: 0.4rem 0.9rem;">
                  <span>📤 رفع أول فورمة جاهزة الآن</span>
                </button>
              </div>
            ` : `
              ${deptFormTemplates.map(tmpl => {
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
                          <span>✍️ ${tmpl.createdByName || 'إدارة القسم'}</span>
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
                        <button class="btn-action-trash" onclick="window.app.handleDeleteSectionFormTemplate('${tmpl.id}', 'DEPT')" title="حذف هذا النموذج">
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

        <!-- 2. حقول ومعلومات الاستمارة الإلكترونية المخصصة للقسم -->
        <div class="card" style="border-top: 4px solid #f59e0b; display: flex; flex-direction: column; min-height: 420px; max-height: 420px; height: 100%; margin: 0;">
          <div class="card-header" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem; border-bottom: 1px solid var(--md-sys-color-surface-variant); padding-bottom: 0.75rem; margin-bottom: 0.85rem; flex-shrink: 0;">
            <div>
              <h3 class="card-title" style="font-size: 1.1rem; font-weight: 800; color: #b45309; display: flex; align-items: center; gap: 0.45rem; margin: 0;">
                <span>🧩</span>
                <span>حقول الاستمارة الإلكترونية المخصصة (${deptDynamicFields.length})</span>
              </h3>
              <div style="font-size: 0.76rem; color: var(--md-sys-color-outline); margin-top: 2px;">
                معلومات وحقول ذكية مضافة لاستمارة كادر القسم تُحفظ في قاعدة البيانات المركزية
              </div>
            </div>
            <button class="btn btn-sm btn-outline" onclick="window.app.openCreateDynamicFieldModalFromDataEntry('DEPT', '', 'إدارة القسم')" title="إضافة حقل جديد">
              <span>➕ إضافة حقل</span>
            </button>
          </div>

          <div style="flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 0.55rem; padding-right: 2px; margin-bottom: 0.65rem;">
            ${deptDynamicFields.length === 0 ? `
              <div style="text-align: center; padding: 2rem 1rem; background: var(--md-sys-color-background); border-radius: var(--radius-md); color: var(--md-sys-color-outline); font-size: 0.82rem; margin: auto 0;">
                لا توجد حقول مخصصة إضافية حالياً. اضغط على [➕ إضافة حقل] لإضافة أي معلومة ترغب بجمعها من كادر القسم.
              </div>
            ` : `
              ${deptDynamicFields.map(f => {
                const typeLabels = {
                  text: 'نص عادي 📝',
                  number: 'رقم عددي 🔢',
                  date: 'تاريخ 📅',
                  select: 'قائمة خيارات 📋',
                  textarea: 'نص تفصيلي 📜'
                };
                const scopeLabel = f.scope === 'GLOBAL' ? '🌐 شامل للقسم' : (f.scope === 'SECTION' ? '🏢 خاص بشعبة' : '📍 خاص بوحدة');
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
                      ${canManageForms ? `
                        <button class="btn-action-trash" onclick="window.app.handleDeleteDynamicFieldFromSection('${f.id}', 'DEPT')" title="حذف هذا الحقل">
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
            <button class="btn btn-save-prominent" onclick="window.app.openDeptDataEntryModal()" style="padding: 0.4rem 1rem; font-size: 0.82rem;">
              <span>📝 تعبئة وتحديث بيانات كادر القسم</span>
            </button>
          </div>
        </div>

        <!-- 3. الاستمارات الإلكترونية التشغيلية المباشرة للقسم -->
        <div class="card" style="border-top: 4px solid var(--md-sys-color-primary); display: flex; flex-direction: column; min-height: 420px; max-height: 420px; height: 100%; margin: 0;">
          <div class="card-header" style="border-bottom: 1px solid var(--md-sys-color-surface-variant); padding-bottom: 0.75rem; margin-bottom: 0.85rem; flex-shrink: 0;">
            <h3 class="card-title" style="font-size: 1.1rem; font-weight: 800; color: var(--md-sys-color-primary); display: flex; align-items: center; gap: 0.45rem; margin: 0;">
              <span>⚡</span>
              <span>الاستمارات الإلكترونية التشغيلية المباشرة لإدارة القسم</span>
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
                <div style="font-size: 0.72rem; color: var(--md-sys-color-outline);">حجز موعد رسمي ومباشر مع مدير القسم</div>
              </div>
              <button class="btn btn-primary" onclick="window.app.openCreateInterviewRequestModal()" style="padding: 0.3rem 0.75rem; font-size: 0.78rem;">
                <span>تقديم طلب</span>
              </button>
            </div>

            <!-- موقف فني -->
            <div style="padding: 0.65rem 0.85rem; border: 1px solid var(--md-sys-color-surface-variant); border-radius: var(--radius-sm); display: flex; justify-content: space-between; align-items: center; background: var(--md-sys-color-surface);">
              <div>
                <strong style="color: var(--md-sys-color-on-surface); font-size: 0.86rem;">⚙️ استمارة الموقف الفني التشغيلي العام</strong>
                <div style="font-size: 0.72rem; color: var(--md-sys-color-outline);">توثيق حالات المحطات والضغوط والصيانة المركزية</div>
              </div>
              <button class="btn-action-broadcast" onclick="window.app.openCreateTechnicalStatusModal()" style="padding: 0.3rem 0.75rem; font-size: 0.78rem;">
                <span>تعبئة الموقف</span>
              </button>
            </div>

            <!-- طلب تصريح أو نقل -->
            <div style="padding: 0.65rem 0.85rem; border: 1px solid var(--md-sys-color-surface-variant); border-radius: var(--radius-sm); display: flex; justify-content: space-between; align-items: center; background: var(--md-sys-color-surface);">
              <div>
                <strong style="color: var(--md-sys-color-on-surface); font-size: 0.86rem;">📦 استمارة تصريح عمل ونقل مواد ومعدات</strong>
                <div style="font-size: 0.72rem; color: var(--md-sys-color-outline);">نقل معدات ومواد بين المواقع ومقر القسم</div>
              </div>
              <button class="btn-action-view" onclick="window.app.openSubmitRequestModal()" style="padding: 0.3rem 0.75rem; font-size: 0.78rem;">
                <span>تقديم تصريح</span>
              </button>
            </div>

            <!-- إجازات -->
            <div style="padding: 0.65rem 0.85rem; border: 1px solid var(--md-sys-color-surface-variant); border-radius: var(--radius-sm); display: flex; justify-content: space-between; align-items: center; background: var(--md-sys-color-surface);">
              <div>
                <strong style="color: var(--md-sys-color-on-surface); font-size: 0.86rem;">🏖️ استمارة طلب إجازة رسمية</strong>
                <div style="font-size: 0.72rem; color: var(--md-sys-color-outline);">اعتيادية، مرضية، تعويضية، زمنية</div>
              </div>
              <button class="btn-action-export" onclick="window.app.openSubmitRequestModal()" style="padding: 0.3rem 0.75rem; font-size: 0.78rem;">
                <span>طلب إجازة</span>
              </button>
            </div>
          </div>
        </div>

        <!-- 4. سجل المعاملات والاستمارات المقدمة بالقسم -->
        <div class="card" style="border-top: 4px solid #10b981; display: flex; flex-direction: column; min-height: 420px; max-height: 420px; height: 100%; margin: 0;">
          <div class="card-header" style="border-bottom: 1px solid var(--md-sys-color-surface-variant); padding-bottom: 0.75rem; margin-bottom: 0.85rem; flex-shrink: 0;">
            <h3 class="card-title" style="font-size: 1.1rem; font-weight: 800; color: #10b981; display: flex; align-items: center; gap: 0.45rem; margin: 0;">
              <span>📋</span>
              <span>سجل المعاملات والاستمارات المقدمة (${deptRequests.length})</span>
            </h3>
            <div style="font-size: 0.76rem; color: var(--md-sys-color-outline); margin-top: 2px;">
              متابعة حالة وتاريخ المعاملات المرفوعة في القسم
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
                ${deptRequests.map(r => `
                  <tr>
                    <td><strong>${r.typeTitle || r.title || 'استمارة إلكترونية'}</strong></td>
                    <td>${r.userName || r.author || 'منتسب'}</td>
                    <td>${new Date(r.createdAt || Date.now()).toLocaleDateString('ar-IQ')}</td>
                    <td>
                      <span class="badge ${r.status === 'APPROVED' ? 'badge-success' : (r.status === 'REJECTED' ? 'badge-danger' : 'badge-warning')}">
                        ${r.status === 'APPROVED' ? 'معتمد' : (r.status === 'REJECTED' ? 'مرفوض' : 'قيد المتابعة')}
                      </span>
                    </td>
                  </tr>
                `).join('')}
                ${deptRequests.length === 0 ? '<tr><td colspan="4" style="text-align: center; padding: 2.5rem 1rem; color: var(--md-sys-color-outline); font-size: 0.84rem;">لا توجد معاملات مقدمة في القسم مؤخراً.</td></tr>' : ''}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  `;
}

// Global Export
window.renderDeptManagementView = renderDeptManagementView;
window.renderDeptFormsTab = renderDeptFormsTab;

