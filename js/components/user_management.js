/* ==========================================================================
   إدارة قسم الإنتاج الجنوبي - إدارة المستخدمين ومصفوفة الصلاحيات المنظمة
   User Management & Organized RBAC Permission Matrix
   الهيكل: المستخدم → الدور → النطاق → مجموعة الصلاحيات → الصلاحيات الفرعية
   ========================================================================== */

function renderUserManagementView() {
  const actorUser = window.auth.getCurrentUser();
  if (!actorUser) return '';

  const activeTab = window.app.currentUserManagementSubTab || 'users_roster';
  const unifiedRoster = window.store.getUnifiedEmployeeRoster(actorUser);
  const sections = window.store.getSections(actorUser.departmentId);
  const units = window.store.getUnits(actorUser.departmentId);
  const stations = window.store.getStations(actorUser.departmentId);
  const groups = window.rbac.getPermissionGroups();
  const dynamicFields = window.store.getDynamicEmployeeFields(actorUser.departmentId);

  // Extract unique job titles for dynamic filter
  const uniqueJobTitles = Array.from(new Set(unifiedRoster.map(e => e.jobTitle).filter(Boolean)));

  // Statistics calculation
  const totalEmployees = unifiedRoster.length;
  const activeUsers = unifiedRoster.filter(e => e.accountStatus === 'ACTIVE').length;
  const pendingApprovals = unifiedRoster.filter(e => e.accountStatus === 'PENDING').length;
  const noAccountCount = unifiedRoster.filter(e => e.accountStatus === 'NO_ACCOUNT').length;
  const suspendedCount = unifiedRoster.filter(e => e.accountStatus === 'SUSPENDED' || e.accountStatus === 'DISABLED').length;

  return `
    <div style="margin-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1.25rem;">
      <div style="flex: 1 1 auto; min-width: 260px;">
        <h2 style="font-size: 1.6rem; font-weight: 800; color: var(--md-sys-color-primary); display: flex; align-items: center; gap: 0.5rem; margin: 0 0 0.25rem 0;">
          🛡️ إدارة المستخدمين
        </h2>
        <p style="color: var(--md-sys-color-outline); font-size: 0.88rem; margin: 0;">
          نظام التحكم المركزي في حسابات المنتسبين، سجل المستخدمين، مصفوفة الصلاحيات المنظمة، وطلبات القبول المعتمدة.
        </p>
      </div>
      <div style="display: flex; gap: 0.65rem; align-items: center; justify-content: flex-end; margin-right: auto; flex-wrap: nowrap; white-space: nowrap;">
        ${window.rbac.hasPermission(actorUser, 'CAREER_EDIT_INFO') || ['DEPT_MANAGER', 'SUPER_ADMIN'].includes(actorUser.role) ? `
          <button class="btn btn-glass-primary" onclick="window.app.openCreateMasterRecordModal()" title="إضافة منتسب ومستخدم جديد إلى السجل الموحد">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 5v14M5 12h14"></path>
            </svg>
            <span>إضافة مستخدم جديد للسجل</span>
          </button>
        ` : ''}
        ${window.rbac.hasPermission(actorUser, 'USERS_IMPORT_ROSTER') ? `
          <button class="btn btn-glass-amber" onclick="window.app.setUserManagementSubTab('import_ids')" title="استيراد وتحديث السجلات الرسمية">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            <span>استيراد سجلات الموظفين</span>
            <span style="font-size: 0.95rem;">📥</span>
          </button>
        ` : ''}
        <button class="btn btn-glass-emerald" onclick="window.app.openCustomStaffExportModal()" title="أداة التصدير والطباعة المخصصة لبيانات الكادر">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          <span>تصدير وطباعة مخصصة</span>
          <span style="font-size: 0.95rem;">⚡</span>
        </button>
      </div>
    </div>

    <!-- Quick Metrics Chips (Compact, Sleek & Highly Vivid) -->
    <div class="user-quick-stats-grid">
      <div class="user-stat-chip chip-primary" onclick="window.app.setUserManagementSubTab('users_roster')" title="عرض إجمالي سجل المستخدمين">
        <div class="chip-content">
          <span class="chip-number">${totalEmployees}</span>
          <span class="chip-title">إجمالي السجل</span>
        </div>
        <div class="chip-icon-box">
          <span class="chip-pulse-dot dot-primary"></span>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
        </div>
      </div>

      <div class="user-stat-chip chip-success" onclick="window.app.setUserManagementSubTab('users_roster')" title="عرض حسابات المستخدمين النشطة">
        <div class="chip-content">
          <span class="chip-number">${activeUsers}</span>
          <span class="chip-title">حسابات نشطة</span>
        </div>
        <div class="chip-icon-box">
          <span class="chip-pulse-dot dot-success"></span>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            <polyline points="9 12 11 14 15 10"></polyline>
          </svg>
        </div>
      </div>

      <div class="user-stat-chip chip-warning" onclick="window.app.setUserManagementSubTab('pending_approvals')" title="عرض طلبات القبول بانتظار الاعتماد">
        <div class="chip-content">
          <span class="chip-number">${pendingApprovals}</span>
          <span class="chip-title">بانتظار الاعتماد</span>
        </div>
        <div class="chip-icon-box">
          <span class="chip-pulse-dot dot-warning"></span>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
        </div>
      </div>

      <div class="user-stat-chip chip-slate" onclick="window.app.setUserManagementSubTab('users_roster')" title="عرض الموظفين بدون حساب مستخدم">
        <div class="chip-content">
          <span class="chip-number">${noAccountCount}</span>
          <span class="chip-title">بدون حساب</span>
        </div>
        <div class="chip-icon-box">
          <span class="chip-pulse-dot dot-slate"></span>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <line x1="17" y1="8" x2="23" y2="14"></line>
            <line x1="23" y1="8" x2="17" y2="14"></line>
          </svg>
        </div>
      </div>

      <div class="user-stat-chip chip-danger" onclick="window.app.setUserManagementSubTab('users_roster')" title="عرض الحسابات المجمدة أو المعطلة">
        <div class="chip-content">
          <span class="chip-number">${suspendedCount}</span>
          <span class="chip-title">مجمدة أو معطلة</span>
        </div>
        <div class="chip-icon-box">
          <span class="chip-pulse-dot dot-danger"></span>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
          </svg>
        </div>
      </div>
    </div>

    <!-- Navigation Tabs -->
    <div class="tabs-header" style="margin-bottom: 1.5rem;">
      <button class="tab-btn ${activeTab === 'users_roster' || activeTab === 'master_roster' ? 'active' : ''}" onclick="window.app.setUserManagementSubTab('users_roster')">
        👥 <span>سجل المستخدمين</span> <span class="tab-count-badge">${totalEmployees}</span>
      </button>
      <button class="tab-btn ${activeTab === 'pending_approvals' ? 'active' : ''}" onclick="window.app.setUserManagementSubTab('pending_approvals')">
        ⏳ <span>طلبات القبول</span> <span class="tab-count-badge">${pendingApprovals}</span>
      </button>
      <button class="tab-btn ${activeTab === 'permission_matrix' ? 'active' : ''}" onclick="window.app.setUserManagementSubTab('permission_matrix')">
        🎛️ <span>مصفوفة الصلاحيات</span>
      </button>
      <button class="tab-btn ${activeTab === 'import_ids' ? 'active' : ''}" onclick="window.app.setUserManagementSubTab('import_ids')">
        📥 <span>استيراد ومطابقة السجلات</span>
      </button>
      ${actorUser.role === 'DEPT_MANAGER' || actorUser.role === 'SUPER_ADMIN' ? `
        <button class="tab-btn ${activeTab === 'authority_handover' ? 'active' : ''}" onclick="window.app.setUserManagementSubTab('authority_handover')">
          🔄 <span>تسليم المنصب الإداري</span>
        </button>
      ` : ''}
    </div>

    <!-- Tab Contents -->
    ${activeTab === 'users_roster' || activeTab === 'master_roster' ? renderUserRegistryTab(unifiedRoster, actorUser, sections, units, stations, uniqueJobTitles) : ''}
    ${activeTab === 'pending_approvals' ? renderPendingApprovalsTab(unifiedRoster, actorUser) : ''}
    ${activeTab === 'permission_matrix' ? renderPermissionMatrixTab(unifiedRoster.filter(r => r.hasAccount), actorUser, groups, sections, units, stations) : ''}
    ${activeTab === 'import_ids' ? renderImportEmployeeIDsTab(actorUser) : ''}
    ${activeTab === 'authority_handover' ? renderAuthorityHandoverTab(unifiedRoster.filter(r => r.hasAccount), actorUser) : ''}
  `;
}

// ==========================================================================
// 1. تبويب سجل المستخدمين (User Registry Tab)
// الهيكل: المستخدم | الرقم الوظيفي | جهة الارتباط | المسمى الوظيفي | حالة الحساب | الدور | إجراءات / الصلاحيات | الإضبارة
// ==========================================================================
function renderUserRegistryTab(roster, actorUser, sections, units, stations, uniqueJobTitles) {
  const rolesList = [
    { key: 'DEPT_MANAGER', name: 'مدير قسم' },
    { key: 'DEPUTY_DEPT_MANAGER', name: 'وكيل مدير قسم' },
    { key: 'ADMIN_MANAGER', name: 'مدير إدارة' },
    { key: 'SECTION_MANAGER', name: 'مسؤول شعبة' },
    { key: 'DEPUTY_SECTION_MANAGER', name: 'وكيل مسؤول شعبة' },
    { key: 'UNIT_MANAGER', name: 'مسؤول وحدة' },
    { key: 'STATION_MANAGER', name: 'مسؤول موقع' },
    { key: 'DEPUTY_STATION_MANAGER', name: 'وكيل مسؤول موقع' },
    { key: 'STATION_SUPERVISOR', name: 'مشرف محطة' },
    { key: 'ADMINISTRATOR', name: 'إداري مخول' },
    { key: 'SHIFT_ENGINEER', name: 'مهندس مناوب' },
    { key: 'SHIFT_SUPERVISOR', name: 'مشرف نوبة' },
    { key: 'OPERATOR', name: 'مشغل' },
    { key: 'EMPLOYEE', name: 'منتسب' }
  ];

  return `
    <div class="card" style="margin-bottom: 1.5rem;">
      <!-- Search & Filters Toolbar -->
      <div style="display: flex; gap: 0.6rem; flex-wrap: wrap; margin-bottom: 1.25rem; align-items: center;">
        
        <!-- Search Input -->
        <div style="flex: 2; min-width: 220px;">
          <input type="text" id="unifiedRosterSearchInput" class="form-control" placeholder="🔍 بحث باسم المستخدم أو الرقم الوظيفي..." oninput="window.app.filterUnifiedRosterTable()">
        </div>

        <!-- Filter 1: Linked Scope / Section -->
        <div style="flex: 1; min-width: 140px;">
          <select id="unifiedRosterSectionFilter" class="form-control filter-select" onchange="window.app.filterUnifiedRosterTable()">
            <option value="ALL">كافة جهات الارتباط</option>
            <option value="NONE">-- بدون شعبة --</option>
            ${sections.map(s => `<option value="${s.id}">${s.name}</option>`).join('')}
          </select>
        </div>

        <!-- Filter 2: Job Title (المسمى الوظيفي) -->
        <div style="flex: 1; min-width: 130px;">
          <select id="unifiedRosterJobTitleFilter" class="form-control filter-select" onchange="window.app.filterUnifiedRosterTable()">
            <option value="ALL">كافة المسميات الوظيفية</option>
            ${uniqueJobTitles.map(title => `<option value="${title}">${title}</option>`).join('')}
          </select>
        </div>

        <!-- Filter 3: Account Status (حالة الحساب) -->
        <div style="flex: 1; min-width: 130px;">
          <select id="unifiedRosterStatusFilter" class="form-control filter-select" onchange="window.app.filterUnifiedRosterTable()">
            <option value="ALL">كافة حالات الحساب</option>
            <option value="ACTIVE">🟢 نشط</option>
            <option value="NO_ACCOUNT">⚪ غير نشط</option>
            <option value="PENDING">🟡 بانتظار الموافقة</option>
            <option value="SUSPENDED">⏸️ معلق</option>
            <option value="DISABLED">🔴 غير نشط / معطل</option>
            <option value="REJECTED">🔴 مرفوض</option>
          </select>
        </div>

        <!-- Filter 4: Role (الدور) -->
        <div style="flex: 1; min-width: 130px;">
          <select id="unifiedRosterRoleFilter" class="form-control filter-select" onchange="window.app.filterUnifiedRosterTable()">
            <option value="ALL">كافة الأدوار</option>
            ${rolesList.map(r => `<option value="${r.key}">${r.name}</option>`).join('')}
          </select>
        </div>
      </div>

      <!-- User Registry Table (سجل المستخدمين) -->
      <div class="table-container" style="overflow-x: auto;">
        <table class="data-table" id="unifiedRosterTable" style="font-size: 0.88rem;">
          <thead>
            <tr>
              <th style="min-width: 180px;">الاسم</th>
              <th style="min-width: 130px;">الرقم الوظيفي</th>
              <th style="min-width: 140px;">جهة الارتباط</th>
              <th style="min-width: 140px;">المسمى الوظيفي</th>
              <th style="min-width: 120px;">الدور</th>
              <th style="min-width: 140px; text-align: center;">الصلاحيات</th>
              <th style="min-width: 120px; text-align: center;">الإضبارة</th>
            </tr>
          </thead>
          <tbody>
            ${roster.map(emp => {
              const sec = sections.find(s => s.id === emp.sectionId);
              const un = units.find(u => u.id === emp.unitId);
              const st = stations.find(station => station.id === emp.stationId);
              const scopeText = sec ? sec.name : (un ? un.name : (st ? st.name : 'إدارة القسم'));
              const roleInfo = window.rbac.getRoleInfo(emp.role);

              return `
                <tr class="unified-roster-row" 
                    data-name="${(emp.fullName || '').toLowerCase()}" 
                    data-empid="${(emp.employeeId || '').toLowerCase()}" 
                    data-email="${(emp.userEmail || emp.emailPersonal || '').toLowerCase()}" 
                    data-status="${emp.accountStatus}"
                    data-section="${emp.sectionId || 'NONE'}"
                    data-jobtitle="${(emp.jobTitle || '').toLowerCase()}"
                    data-role="${emp.role || 'EMPLOYEE'}">
                  
                  <!-- 1. الاسم -->
                  <td>
                    <div style="display: flex; align-items: center; gap: 0.6rem;">
                      <div style="width: 34px; height: 34px; border-radius: 50%; background: var(--md-sys-color-primary); color: white; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.88rem;">
                        ${(emp.fullName || 'م').substring(0, 2)}
                      </div>
                      <div>
                        <strong style="font-size: 0.92rem; color: var(--md-sys-color-on-surface);">${emp.fullName}</strong>
                        <div style="font-size: 0.75rem; color: var(--md-sys-color-outline);">${emp.userEmail || emp.emailPersonal || 'مستخدم مسجل'}</div>
                      </div>
                    </div>
                  </td>

                  <!-- 2. الرقم الوظيفي -->
                  <td style="font-family: monospace; font-weight: 700;">
                    <code>${emp.employeeId}</code>
                  </td>

                  <!-- 3. جهة الارتباط -->
                  <td>
                    <div style="font-weight: 700; color: var(--md-sys-color-on-surface);">${scopeText}</div>
                    ${st ? `<div class="roster-location-sub" style="font-size: 0.76rem; color: var(--md-sys-color-outline); margin-top: 2px;">📍 الموقع: <span style="font-weight: 700; color: var(--md-sys-color-primary);">${st.name}</span></div>` : ''}
                  </td>

                  <!-- 4. المسمى الوظيفي -->
                  <td>
                    <span class="badge" style="background: var(--md-sys-color-surface-variant); color: var(--md-sys-color-on-surface); font-size: 0.82rem; font-weight: 600;">
                      ${emp.jobTitle || 'موظف تشغيل'}
                    </span>
                  </td>

                  <!-- 5. الدور -->
                  <td>
                    ${emp.hasAccount ? `
                      <span class="badge ${roleInfo.badgeClass}" style="font-size: 0.78rem;">
                        ${roleInfo.name}
                      </span>
                    ` : `
                      <span class="badge badge-secondary" style="font-size: 0.75rem;">منتسب</span>
                    `}
                  </td>

                  <!-- 6. الصلاحيات -->
                  <td style="text-align: center; white-space: nowrap;">
                    <button class="btn-action-permission" onclick="window.app.openEditUserRoleAndPermissionsModal('${emp.userId || ''}', '${emp.employeeId || ''}')" title="إدارة الصلاحيات" style="padding: 0.3rem 0.75rem;">
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                      </svg>
                      <span>الصلاحيات</span>
                    </button>
                  </td>

                  <!-- 7. الإضبارة -->
                  <td style="text-align: center; white-space: nowrap;">
                    <button class="btn-action-view" onclick="window.app.openMasterDossierModal('${emp.employeeId}')" title="معاينة الإضبارة الموحدة" style="padding: 0.3rem 0.75rem;">
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                      </svg>
                      <span>معاينة الإضبارة</span>
                    </button>
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
// 2. تبويب طلبات الحسابات المعلقة (Pending Approvals Tab)
// ==========================================================================
function renderPendingApprovalsTab(pendingRequests, actorUser) {
  return `
    <div class="card">
      <div style="margin-bottom: 1.25rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem;">
        <div>
          <h4 style="font-weight: 800; color: var(--md-sys-color-primary); margin: 0 0 0.25rem 0;">
            🟡 طلبات الحسابات المعلقة والتسجيل الذاتي
          </h4>
          <p style="color: var(--md-sys-color-outline); font-size: 0.85rem; margin: 0;">
            مراجعة وتدقيق طلبات إنشاء الحسابات الجديدة والتحقق من ارتباطها بسجل الموظفين المعتمد قبل التفعيل.
          </p>
        </div>
        <span class="badge badge-warning" style="font-size: 0.85rem; padding: 0.35rem 0.8rem;">
          الطلبات المعلقة: ${pendingRequests.length}
        </span>
      </div>

      <div style="display: grid; gap: 1rem;">
        ${pendingRequests.length === 0 ? `
          <div style="text-align: center; padding: 3rem 1rem; color: var(--md-sys-color-outline); background: var(--md-sys-color-surface-variant); border-radius: var(--radius-md);">
            <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">✅</div>
            <h4 style="margin: 0 0 0.25rem 0; font-weight: 700;">لا توجد طلبات تسجيل معلقة حالياً</h4>
            <p style="font-size: 0.85rem; margin: 0;">كافة حسابات المستخدمين معتمدة ونشطة في المنظومة.</p>
          </div>
        ` : pendingRequests.map(req => `
          <div class="card" style="margin-bottom: 0; background: var(--md-sys-color-surface); border-right: 5px solid var(--md-sys-color-warning); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
            <div>
              <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
                <h4 style="margin: 0; font-size: 1.05rem; font-weight: 800;">${req.fullName}</h4>
                <span class="badge badge-warning">بانتظار الموافقة</span>
              </div>
              <div style="font-size: 0.82rem; color: var(--md-sys-color-outline);">
                الرقم الوظيفي: <code>${req.employeeId}</code> | البريد: <strong>${req.email}</strong> | الهاتف: ${req.phone || 'غير مسجل'}
              </div>
            </div>

            <div style="display: flex; gap: 0.5rem; align-items: center; white-space: nowrap; flex-wrap: nowrap;">
              <button class="btn btn-glass-cyan" onclick="window.app.openMasterDossierModal('${req.employeeId}')" title="معاينة الإضبارة الموحدة" style="height: 38px; padding: 0 0.95rem; font-size: 0.84rem; font-weight: 700; border-radius: 9px;">
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
                <span>معاينة الإضبارة</span>
              </button>
              ${window.rbac.hasPermission(actorUser, 'USERS_APPROVE') ? `
                <button class="btn btn-glass-emerald" onclick="window.app.handleApprovePendingUser('${req.userId}', '${req.employeeId}')" title="قبول وتفعيل حساب المنتسب" style="height: 38px; padding: 0 1rem; font-size: 0.84rem; font-weight: 800; border-radius: 9px;">
                  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  <span>قبول وتفعيل الحساب</span>
                </button>
                <button class="btn btn-glass-rose" onclick="window.app.handleRejectPendingUser('${req.userId}')" title="رفض طلب التسجيل" style="height: 38px; padding: 0 0.95rem; font-size: 0.84rem; font-weight: 800; border-radius: 9px;">
                  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                  <span>رفض الطلب</span>
                </button>
              ` : ''}
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

// ==========================================================================
// 3. تبويب مصفوفة الصلاحيات المبسطة والمدمجة (Compact Permissions Matrix Tab)
// ==========================================================================
function renderPermissionMatrixTab(usersWithAccounts, actorUser, groups, sections, units, stations) {
  const selectedGroupId = window.app.activeMatrixFilterGroup || 'ALL';

  return `
    <div class="card">
      <div style="margin-bottom: 1.25rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: nowrap; gap: 1rem;">
        <div style="flex: 1 1 auto; min-width: 250px;">
          <h4 style="font-weight: 800; color: var(--md-sys-color-primary); margin: 0 0 0.25rem 0;">
            🎛️ مصفوفة الصلاحيات المدمجة والمبسطة
          </h4>
          <p style="color: var(--md-sys-color-outline); font-size: 0.85rem; margin: 0;">
            عرض سريع ومباشر لحزم الصلاحيات الممنوحة لكل مستخدم مع إمكانية التعديل الفوري بنقرة واحدة.
          </p>
        </div>
        <div style="display: flex; gap: 0.6rem; align-items: center; flex-wrap: nowrap; white-space: nowrap; margin-right: auto; justify-content: flex-end;">
          <input type="text" id="matrixSearchInput" class="form-control" style="width: 210px; min-width: 170px; font-size: 0.84rem; padding: 0.42rem 0.75rem;" placeholder="🔍 بحث في المصفوفة..." oninput="window.app.filterMatrixTable(this.value)">
          <select id="matrixGroupFilterSelect" class="form-control" style="width: 230px; min-width: 190px; font-size: 0.84rem; padding: 0.42rem 0.75rem;" onchange="window.app.activeMatrixFilterGroup = this.value; window.app.render();">
            <option value="ALL" ${selectedGroupId === 'ALL' ? 'selected' : ''}>📊 عرض كافة المجموعات (${groups.length})</option>
            ${groups.map(g => `
              <option value="${g.id}" ${selectedGroupId === g.id ? 'selected' : ''}>${g.icon} ${g.name} (${g.permissions.length})</option>
            `).join('')}
          </select>
        </div>
      </div>

      <!-- Compact Permissions Cards / Table Grid -->
      <div class="table-container" style="overflow-x: auto;">
        <table class="data-table" style="font-size: 0.85rem;">
          <thead>
            <tr>
              <th style="min-width: 170px;">المستخدم</th>
              <th style="min-width: 120px;">الرقم الوظيفي</th>
              <th style="min-width: 120px;">الدور الإداري</th>
              <th style="min-width: 130px;">جهة الارتباط</th>
              <th style="min-width: 260px;">حزم الصلاحيات الممنوحة</th>
              <th style="min-width: 130px; text-align: center;">إدارة الصلاحيات</th>
            </tr>
          </thead>
          <tbody>
            ${usersWithAccounts.map(u => {
              const roleInfo = window.rbac.getRoleInfo(u.role);
              const sec = sections.find(s => s.id === u.sectionId);
              const un = units.find(unit => unit.id === u.unitId);
              const st = stations.find(station => station.id === u.stationId);
              const scopeText = sec ? sec.name : (un ? un.name : (st ? st.name : 'إدارة القسم'));
              const filteredGroups = groups.filter(g => selectedGroupId === 'ALL' || g.id === selectedGroupId);
              let totalGranted = 0;
              const groupBadges = [];

              filteredGroups.forEach(g => {
                let activeCount = 0;
                g.permissions.forEach(p => {
                  if (window.rbac.hasPermission(u.linkedUser || u, p.key)) {
                    activeCount++;
                    totalGranted++;
                  }
                });
                if (activeCount > 0) {
                  groupBadges.push(`
                    <span class="badge ${activeCount === g.permissions.length ? 'badge-success' : 'badge-info'}" 
                          style="font-size: 0.72rem; padding: 0.2rem 0.45rem; cursor: pointer;"
                          onclick="window.app.openEditUserRoleAndPermissionsModal('${u.userId || u.id}', '${u.employeeId || ''}')"
                          title="${g.name}: ${activeCount} من ${g.permissions.length} صلاحيات مفعلة">
                      ${g.icon} ${g.name} (${activeCount}/${g.permissions.length})
                    </span>
                  `);
                }
              });

              return `
                <tr class="matrix-user-row"
                    data-name="${(u.fullName || '').toLowerCase()}"
                    data-empid="${(u.employeeId || '').toLowerCase()}"
                    data-email="${(u.email || '').toLowerCase()}">
                  <td>
                    <div style="font-weight: 700; color: var(--md-sys-color-primary);">${u.fullName}</div>
                    <div style="font-size: 0.75rem; color: var(--md-sys-color-outline);">${u.email || '-'}</div>
                  </td>

                  <td><code>${u.employeeId}</code></td>

                  <td>
                    <span class="badge ${roleInfo.badgeClass}" style="font-size: 0.75rem;">
                      ${roleInfo.name}
                    </span>
                  </td>

                  <td><strong>${scopeText}</strong></td>

                  <td>
                    <div style="display: flex; gap: 0.3rem; flex-wrap: wrap; align-items: center;">
                      ${groupBadges.length > 0 ? groupBadges.join('') : '<span style="color: var(--md-sys-color-outline); font-size: 0.75rem;">صلاحيات العضوية الأساسية فقط</span>'}
                    </div>
                  </td>

                  <td style="text-align: center; white-space: nowrap;">
                    <button class="btn-action-permission" onclick="window.app.openEditUserRoleAndPermissionsModal('${u.userId || u.id}', '${u.employeeId}')" title="فتح وتعديل مصفوفة الصلاحيات" style="padding: 0.35rem 0.85rem; font-size: 0.82rem; white-space: nowrap;">
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                      </svg>
                      <span>فتح الصلاحيات</span>
                    </button>
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
// 4. تبويب إدارة الحقول والمعلومات الديناميكية (Dynamic Fields Manager)
function getFieldTypeLabel(type) {
  const map = {
    text: 'نص عادي',
    number: 'رقم عددي',
    date: 'تاريخ',
    textarea: 'نص متعدد الأسطر / ملاحظات',
    select: 'قائمة اختيار مفرد',
    multiselect: 'اختيار متعدد',
    boolean: 'نعم / لا (Boolean)',
    file: 'مستند / ملف',
    image: 'صورة وثيقة',
    url: 'رابط إلكتروني'
  };
  return map[type] || type;
}

function getFieldCategoryLabel(cat) {
  const map = {
    personal: 'بيانات شخصية ومدنية',
    official_documents: 'وثائق ومستمسكات رسمية',
    career: 'مسار وظيفي وتدريب',
    section_specific: 'معلومات وملاحظات الشعبة',
    administrative: 'معلومات إدارية وكتب'
  };
  return map[cat] || cat;
}

// ==========================================================================
// 4. تبويب استيراد سجلات الموظفين (Excel / CSV)
// ==========================================================================
function renderImportEmployeeIDsTab(actorUser) {
  return `
    <div class="card">
      <div style="margin-bottom: 1.25rem;">
        <h4 style="font-weight: 800; color: var(--md-sys-color-primary); margin-bottom: 0.35rem;">
          📥 استيراد ومطابقة سجلات الموظفين الرسمية
        </h4>
        <p style="color: var(--md-sys-color-outline); font-size: 0.85rem;">
          استيراد وتحديث قائمة الموظفين والأرقام الوظيفية المعتمدة دفعة واحدة مع التحقق التلقائي لمنع التكرار.
        </p>
      </div>

      <div style="background: var(--md-sys-color-surface-variant); padding: 1rem; border-radius: var(--radius-md); margin-bottom: 1.25rem; font-size: 0.82rem; line-height: 1.6;">
        <strong>📌 صيغة الأعمدة المدعومة في الملف:</strong>
        <code>الرقم الوظيفي, الاسم الرباعي واللقب, الدرجة الوظيفية, المرحلة, الشهادة, التخصص</code>
      </div>

      <div class="form-group">
        <label class="form-label">اختر ملف CSV من جهازك أو الصق البيانات أدناه:</label>
        <input type="file" id="importCSVFileInput" accept=".csv, .txt, .tsv" class="form-control" onchange="window.app.handleCSVFileSelected(event)" style="margin-bottom: 0.75rem;">
        
        <textarea id="importCSVTextarea" class="form-control" rows="7" placeholder="الصق بيانات CSV هنا مباشرة..." style="font-family: monospace; font-size: 0.85rem; direction: ltr; text-align: left;"></textarea>
      </div>

      <div style="display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1rem;">
        <button class="btn btn-outline" onclick="document.getElementById('importCSVTextarea').value=''">مسح المدخلات</button>
        <button class="btn btn-primary" style="font-weight: 800;" onclick="window.app.handleParseImportEmployeeIDs()">
          🔍 فحص ومطابقة ومعاينة السجلات
        </button>
      </div>

      <div id="importPreviewContainer" style="display: none; margin-top: 1.5rem;"></div>
    </div>
  `;
}

// ==========================================================================
// 5. تبويب تسليم المنصب الإداري (Authority Handover)
// ==========================================================================
function renderAuthorityHandoverTab(usersWithAccounts, actorUser) {
  const eligibleUsers = usersWithAccounts.filter(u => u.userId !== actorUser.id);

  return `
    <div class="card" style="border-right: 5px solid #d93025;">
      <div style="margin-bottom: 1.25rem;">
        <h4 style="font-weight: 800; color: #d93025; margin-bottom: 0.35rem;">
          🔄 تسليم المنصب الإداري ونقل الصلاحيات (Authority Handover)
        </h4>
        <p style="color: var(--md-sys-color-outline); font-size: 0.85rem;">
          إجراء إداري رسمي لنقل منصب مدير القسم وصلاحياته الإدارية الكاملة إلى موظف آخر بديل، مع تحويل حسابك إلى منتسب وتوثيق العملية في سجل التدقيق.
        </p>
      </div>

      <div style="padding: 1rem; background: rgba(217, 48, 37, 0.06); border-radius: var(--radius-md); margin-bottom: 1.5rem;">
        <div style="font-weight: 700; color: #d93025; margin-bottom: 0.5rem;">⚠️ تنبيه أمني حاسم:</div>
        <div style="font-size: 0.85rem; color: var(--md-sys-color-on-surface); line-height: 1.6;">
          بمجرد تنفيذ هذا الإجراء، سيتم ترقية الموظف المختار إلى <strong>مدير قسم (DEPT_MANAGER)</strong>، وسيتم سحب صلاحيات الإدارة العليا من حسابك الحالي فوراً.
        </div>
      </div>

      <div class="form-group" style="max-width: 500px;">
        <label class="form-label">اختر الموظف المستلم للمنصب الإداري:</label>
        <select id="handoverTargetUserId" class="form-control">
          <option value="">-- اختر موظفاً معتمداً --</option>
          ${eligibleUsers.map(u => `
            <option value="${u.userId}">${u.fullName} (${u.employeeId}) - ${u.jobTitle || 'موظف'}</option>
          `).join('')}
        </select>
      </div>

      <div style="margin-top: 1.5rem;">
        <button class="btn btn-danger" style="font-weight: 800; padding: 0.6rem 1.5rem;" onclick="window.app.executeAuthorityHandover()">
          تأكيد تسليم المنصب ونقل الصلاحيات
        </button>
      </div>
    </div>
  `;
}

// Export global helper
window.renderUserManagementView = renderUserManagementView;
