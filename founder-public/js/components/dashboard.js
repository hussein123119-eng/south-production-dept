/* ==========================================================================
   إدارة قسم الإنتاج الجنوبي - Dashboard Component
   ========================================================================== */

function renderDashboardView() {
  const user = window.auth.getCurrentUser();
  const db = window.store.getDb();
  
  // Stats
  const usersCount = (db.users || []).filter(u => u.departmentId === user.departmentId).length;
  const docsCount = (db.documents || []).filter(d => d.departmentId === user.departmentId).length;
  const stationsCount = (db.stations || []).filter(s => s.departmentId === user.departmentId).length;
  const activeVehicles = (db.vehicleMovements || []).filter(v => v.departmentId === user.departmentId && v.status === 'IN_TRANSIT').length;
  const pendingRequests = (db.requests || []).filter(r => r.departmentId === user.departmentId && r.status === 'PENDING').length;

  const isStandalone = (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || 
                       (typeof window !== 'undefined' && window.navigator && window.navigator.standalone === true) || 
                       (typeof localStorage !== 'undefined' && localStorage.getItem('pwa_installed') === 'true') ||
                       (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('pwa_banner_dismissed') === 'true');

  return `
    ${!isStandalone ? `
      <!-- PWA Install Badge & Action Card inside Dashboard (علامة تثبيت التطبيق الزجاجية الجذابة) -->
      <div id="dashboardPwaInstallCard" class="pwa-install-crystal-card">
        
        <div class="pwa-install-main-info">
          <div class="pwa-install-icon-box">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
              <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
              <line x1="12" y1="18" x2="12.01" y2="18"></line>
              <path d="M12 6v6m0 0l-2-2m2 2l2-2"></path>
            </svg>
          </div>
          <div>
            <div class="pwa-install-header-row">
              <h4 class="pwa-install-title">
                📲 تثبيت منظومة قسم الإنتاج الجنوبي كتطبيق رسمي
              </h4>
              <span class="badge badge-success pwa-badge">
                ⚡ تطبيق PWA سريع
              </span>
            </div>
            <p class="pwa-install-desc">
              يمكنك تثبيت المنظومة على جهازك لفتحها بضغطة زر وبسرعة فائقة والعمل في أي وقت.
            </p>
          </div>
        </div>

        <div class="pwa-install-actions">
          <button class="btn btn-glass-emerald" onclick="window.app.promptPWAInstall()">
            <span>📲 تثبيت التطبيق الآن</span>
          </button>
          <button type="button" class="pwa-dismiss-btn" onclick="if(window.app && window.app.dismissPWABanner){window.app.dismissPWABanner()}else{const c=document.getElementById('dashboardPwaInstallCard');if(c)c.remove();sessionStorage.setItem('pwa_banner_dismissed','true');}" title="إغلاق التنبيه">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

      </div>
    ` : ''}

    <div class="dashboard-header" style="margin-bottom: 2rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
      <div>
        <h2 style="font-size: 1.6rem; font-weight: 800; color: var(--md-sys-color-primary);">لوحة التحكم الرئيسية</h2>
        <p style="color: var(--md-sys-color-outline);">مرحباً بك مجدداً، <strong>${user.fullName}</strong> (${user.jobTitle})</p>
      </div>
      <div class="dashboard-header-actions-group">
        <!-- Hero Primary Button: Prominent First Step for Employee Data Entry -->
        <button class="dash-action-btn dash-action-hero" onclick="window.app.openUnifiedDataEntryModal()" title="الاستمارة المركزية الموحدة لملء وتحديث بيانات منتسبي القسم">
          <span class="dash-action-pulse-indicator" aria-hidden="true"></span>
          <svg class="dash-action-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg>
          <span class="dash-action-label">ملء وتحديث بيانات منتسبي القسم</span>
          <span class="dash-action-badge">ابدأ هنا</span>
        </button>

        <div class="dash-actions-sub-row">
          <!-- Secondary Button: Submit Administrative Request -->
          <button class="dash-action-btn dash-action-primary" onclick="window.app.openSubmitRequestModal()" title="تقديم طلب إداري رسمي">
            <svg class="dash-action-icon" viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
            <span class="dash-action-label">تقديم طلب إداري</span>
          </button>

          <!-- Tertiary Button: Employee Profile -->
          <button class="dash-action-btn dash-action-outline" onclick="window.app.navigate('profile')" title="عرض وتعديل الملف الوظيفي">
            <svg class="dash-action-icon" viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <span class="dash-action-label">ملفي الوظيفي</span>
          </button>
        </div>
      </div>
    </div>

    <div class="user-quick-stats-grid" style="margin-bottom: 1.5rem;">
      <div class="user-stat-chip chip-primary" onclick="window.app.navigate('user_management')" title="انقر لعرض إدارة المستخدمين">
        <div class="chip-content">
          <span class="chip-number">${usersCount}</span>
          <span class="chip-title">إجمالي الكوادر والمنتسبين</span>
        </div>
        <div class="chip-icon-box">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
          <span class="chip-pulse-dot dot-primary"></span>
        </div>
      </div>
      <div class="user-stat-chip chip-info" onclick="window.app.navigate('documents')" title="انقر لعرض الوثائق والمستندات">
        <div class="chip-content">
          <span class="chip-number">${docsCount}</span>
          <span class="chip-title">المستندات والتقارير</span>
        </div>
        <div class="chip-icon-box">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
          <span class="chip-pulse-dot dot-info"></span>
        </div>
      </div>
      <div class="user-stat-chip chip-warning" onclick="window.app.navigate('sections')" title="انقر لعرض الشعب والمحطات">
        <div class="chip-content">
          <span class="chip-number">${stationsCount}</span>
          <span class="chip-title">المحطات الإنتاجية</span>
        </div>
        <div class="chip-icon-box">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
            <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
            <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
          </svg>
          <span class="chip-pulse-dot dot-warning"></span>
        </div>
      </div>
      <div class="user-stat-chip chip-danger" onclick="window.app.navigate('vehicles')" title="انقر لمتابعة حركة السيارات">
        <div class="chip-content">
          <span class="chip-number">${activeVehicles}</span>
          <span class="chip-title">سيارات في مهام حالية</span>
        </div>
        <div class="chip-icon-box">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.5 3c-.1.2-.1.4-.1.7v4.4c0 .6.4 1 1 1h2"></path>
            <circle cx="7" cy="17" r="2"></circle>
            <path d="M9 17h6"></path>
            <circle cx="17" cy="17" r="2"></circle>
          </svg>
          <span class="chip-pulse-dot dot-danger"></span>
        </div>
      </div>
    </div>

    ${pendingRequests > 0 && ['DEPT_MANAGER', 'SUPER_ADMIN', 'ADMINISTRATOR'].includes(user.role) ? `
      <div class="card" style="margin-bottom: 1.5rem; background: var(--md-sys-color-warning-container); border: 1px solid var(--md-sys-color-warning);">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <strong style="color: var(--md-sys-color-warning); font-size: 1.05rem;">⚠️ لديك (${pendingRequests}) طلبات إدارية جديدة بانتظار الموافقة</strong>
            <p style="font-size: 0.85rem; margin-top: 4px; color: var(--md-sys-color-on-surface);">يرجى مراجعة وتدقيق بيانات الموظفين لتحديث قاعدة البيانات تلقائياً.</p>
          </div>
          <button class="btn btn-sm btn-primary" onclick="window.app.navigate('requests')">مراجعة الطلبات الآن</button>
        </div>
      </div>
    ` : ''}

    <!-- Dedicated Technical Status Summary Section (الموقف الفني) -->
    <div class="card" style="margin-bottom: 1.5rem;">
      <div class="card-header" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem;">
        <div>
          <h3 class="card-title" style="display: flex; align-items: center; gap: 0.5rem; color: var(--md-sys-color-primary);">
            ⚙️ الموقف الفني
          </h3>
          <p style="color: var(--md-sys-color-outline); font-size: 0.85rem; margin: 0.25rem 0 0 0;">
            ملخص آخر موقف فني تشغيلي مسجل لكل شعبة وموقع وفق مصدر البيانات الموحد.
          </p>
        </div>
        ${window.rbac && window.rbac.hasPermission(user, 'TECH_STATUS_VIEW') ? `
          <button class="btn btn-sm btn-outline" onclick="window.app.navigate('sections')">
            استعراض الشعب والمحطات ←
          </button>
        ` : ''}
      </div>

      <div class="table-container" style="overflow-x: auto;">
        <table class="data-table" style="font-size: 0.88rem;">
          <thead>
            <tr>
              <th>الشعبة</th>
              <th>الموقع</th>
              <th>آخر موقف فني</th>
              <th>الحالة</th>
              <th>آخر تحديث</th>
              <th style="text-align: center;">الإجراء</th>
            </tr>
          </thead>
          <tbody>
            ${(() => {
              const summaries = (window.store && typeof window.store.getLatestTechnicalStatusBySection === 'function')
                ? window.store.getLatestTechnicalStatusBySection(user.departmentId, user)
                : [];

              if (summaries.length === 0) {
                return '<tr><td colspan="6" style="text-align: center; padding: 2rem; color: var(--md-sys-color-outline);">لا توجد شعب مسجلة حالياً.</td></tr>';
              }

              return summaries.map(item => {
                const sec = item.section;
                const status = item.latestStatus;
                
                // Permission scope check
                const canViewSection = window.rbac ? (
                  user.role === 'SUPER_ADMIN' || 
                  user.role === 'DEPT_MANAGER' || 
                  !user.sectionId || 
                  user.sectionId === sec.id ||
                  user.hasGlobalAccess === true
                ) : true;

                if (!status) {
                  return `
                    <tr>
                      <td><strong>${sec.name}</strong></td>
                      <td style="color: var(--md-sys-color-outline);">—</td>
                      <td style="color: var(--md-sys-color-outline);"><em>لا يوجد موقف فني مسجل حالياً</em></td>
                      <td>
                        <span class="mini-status-chip mini-chip-slate">
                          <span class="mini-pulse-dot"></span>
                          <span class="chip-label">غير محدد</span>
                        </span>
                      </td>
                      <td style="color: var(--md-sys-color-outline);">—</td>
                      <td style="text-align: center;">
                        ${canViewSection ? `
                          <button class="btn-action-view" onclick="window.app.openSectionTechStatus('${sec.id}')" title="معاينة الشعبة والموقف الفني">
                            معاينة
                          </button>
                        ` : '<span style="font-size: 0.75rem; color: var(--md-sys-color-outline);">غير مصرح</span>'}
                      </td>
                    </tr>
                  `;
                }

                const opStatus = status.status || status.operationalStatus || 'OPERATIONAL';
                let chipTheme = 'mini-chip-success';
                let labelText = 'مستقرة';
                if (opStatus === 'PARTIAL') { chipTheme = 'mini-chip-warning'; labelText = 'قيد المتابعة'; }
                if (opStatus === 'STOPPED') { chipTheme = 'mini-chip-danger'; labelText = 'حرجة / متوقفة'; }

                const dateFormatted = status.recordDate ? new Date(status.recordDate).toLocaleDateString('ar-IQ') : (
                  status.updatedAt ? new Date(status.updatedAt).toLocaleDateString('ar-IQ') : '—'
                );

                return `
                  <tr>
                    <td><strong>${sec.name}</strong></td>
                    <td><strong>${status.stationName || 'الموقع المركزي'}</strong></td>
                    <td style="max-width: 320px; line-height: 1.4;">
                      <div style="font-weight: 600; color: var(--md-sys-color-on-surface);">
                        ${status.description ? (status.description.length > 80 ? status.description.substring(0, 80) + '...' : status.description) : '—'}
                      </div>
                    </td>
                    <td>
                      <span class="mini-status-chip ${chipTheme}">
                        <span class="mini-pulse-dot"></span>
                        <span class="chip-label">${labelText}</span>
                      </span>
                    </td>
                    <td style="font-size: 0.8rem; color: var(--md-sys-color-outline); white-space: nowrap;">
                      ${dateFormatted}
                    </td>
                    <td style="text-align: center;">
                      ${canViewSection ? `
                        <button class="btn-action-view" onclick="window.app.openSectionTechStatus('${sec.id}')" title="معاينة الموقف الفني للشعبة">
                          معاينة
                        </button>
                      ` : '<span style="font-size: 0.75rem; color: var(--md-sys-color-outline);">غير مصرح</span>'}
                    </td>
                  </tr>
                `;
              }).join('');
            })()}
          </tbody>
        </table>
      </div>
    </div>

    <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 1.5rem; align-items: start;">
      <div class="card">
        <div class="card-header" style="display: flex; justify-content: space-between; align-items: center;">
          <h3 class="card-title" style="margin: 0;">آخر التبليغات والتوجيهات الإدارية</h3>
          <button class="btn-action-view" onclick="window.app.navigate('notifications')" title="معاينة كافة التبليغات والتوجيهات">
            معاينة الكل
          </button>
        </div>
        <div style="display: flex; flex-direction: column; gap: 0.85rem; margin-top: 0.5rem;">
          ${(db.officialNotifications || []).slice(0, 3).map(n => {
            const isHigh = n.priority === 'HIGH';
            const dateStr = n.publishDate ? n.publishDate.split('T')[0] : (
              n.createdAt ? n.createdAt.split('T')[0] : new Date().toISOString().split('T')[0]
            );

            return `
              <div style="padding: 0.9rem 1.1rem; border: 1px solid var(--md-sys-color-surface-variant); border-radius: var(--radius-sm); background: var(--md-sys-color-surface); transition: all var(--transition-fast);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.4rem;">
                  <strong style="font-size: 0.95rem; color: var(--md-sys-color-on-surface);">${n.title}</strong>
                  <span class="mini-status-chip ${isHigh ? 'mini-chip-danger' : 'mini-chip-info'}">
                    <span class="mini-pulse-dot"></span>
                    <span class="chip-label">${isHigh ? 'عاجل وهام' : 'عادي'}</span>
                  </span>
                </div>
                <p style="font-size: 0.85rem; color: var(--md-sys-color-on-surface-variant); margin-bottom: 0.5rem; line-height: 1.5;">${(n.content || n.body || '').substring(0, 140)}...</p>
                <div style="display: flex; justify-content: space-between; font-size: 0.76rem; color: var(--md-sys-color-outline);">
                  <span>المرسل: <strong>${n.createdByName || n.sender || 'إدارة القسم'}</strong></span>
                  <span style="font-family: 'Consolas', monospace; direction: ltr;">📅 ${dateStr}</span>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h3 class="card-title">⚡ إجراءات واختصارات سريعة</h3>
        </div>
        <div class="quick-actions-list">
          <div class="quick-action-tile tile-blue" onclick="window.app.openUnifiedDataEntryModal()" title="الاستمارة المركزية الموحدة لملء وتحديث بيانات المنتسبين وتوزيع الشعب والوحدات">
            <div class="tile-main">
              <div class="tile-icon" style="background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
              </div>
              <div class="tile-info">
                <span class="tile-title">ملء وتحديث بيانات القسم الموحدة</span>
                <span class="tile-subtitle">تثبيت وتحديث بيانات الكوادر وتوزيع الشعب والوحدات</span>
              </div>
            </div>
            <div class="tile-arrow">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </div>
          </div>
          ${window.rbac.hasPermission(user, 'FILES_UPLOAD') ? `
            <div class="quick-action-tile tile-blue" onclick="window.app.openCreateDocumentModal()" title="إضافة وحفظ كتاب رسمي أو تقرير فني جديد">
              <div class="tile-main">
                <div class="tile-icon">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="12" y1="18" x2="12" y2="12"></line>
                    <line x1="9" y1="15" x2="15" y2="15"></line>
                  </svg>
                </div>
                <div class="tile-info">
                  <span class="tile-title">إضافة وثيقة / تقرير رسمي</span>
                  <span class="tile-subtitle">كتب رسمية، تقارير Word، جداول Excel</span>
                </div>
              </div>
              <div class="tile-arrow">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
              </div>
            </div>
          ` : ''}

          ${window.rbac.hasPermission(user, 'TECH_STATUS_ADD') ? `
            <div class="quick-action-tile tile-green" onclick="window.app.openCreateTechnicalStatusModal()" title="تسجيل وتحديث الموقف الفني التشغيلي للمحطات">
              <div class="tile-main">
                <div class="tile-icon">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 14 14"></polyline>
                  </svg>
                </div>
                <div class="tile-info">
                  <span class="tile-title">تسجيل موقف فني تشغيلي</span>
                  <span class="tile-subtitle">توثيق جاهزية المحطات والضخ اليومي</span>
                </div>
              </div>
              <div class="tile-arrow">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
              </div>
            </div>
          ` : ''}

          ${window.rbac.hasPermission(user, 'MANAGE_VEHICLES') ? `
            <div class="quick-action-tile tile-amber" onclick="window.app.openCreateDeptVehicleModal()" title="تسجيل آلية جديدة في أسطول ومرآب القسم">
              <div class="tile-main">
                <div class="tile-icon">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.5 3c-.1.2-.1.4-.1.7v4.4c0 .6.4 1 1 1h2"></path>
                    <circle cx="7" cy="17" r="2"></circle>
                    <path d="M9 17h6"></path>
                    <circle cx="17" cy="17" r="2"></circle>
                  </svg>
                </div>
                <div class="tile-info">
                  <span class="tile-title">إضافة عجلة لمرآب القسم</span>
                  <span class="tile-subtitle">تخصيص سيارة، رقم الآلية، وتعيين السائق</span>
                </div>
              </div>
              <div class="tile-arrow">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
              </div>
            </div>
          ` : ''}

          ${window.rbac.hasPermission(user, 'NOTIFS_CREATE') ? `
            <div class="quick-action-tile tile-rose" onclick="window.app.openCreateDeptNotificationModal()" title="صياغة وإرسال تبليغ رسمي معمم للكوادر">
              <div class="tile-main">
                <div class="tile-icon">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                  </svg>
                </div>
                <div class="tile-info">
                  <span class="tile-title">إصدار تبليغ رسمي</span>
                  <span class="tile-subtitle">إعلانات وتوجيهات الإدارة العامة</span>
                </div>
              </div>
              <div class="tile-arrow">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
              </div>
            </div>
          ` : ''}

          <div class="quick-action-tile tile-purple" onclick="window.app.openCreateInterviewRequestModal()" title="تقديم طلب رسمي لمقابلة السيد مدير القسم">
            <div class="tile-main">
              <div class="tile-icon">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </div>
              <div class="tile-info">
                <span class="tile-title">تقديم طلب مقابلة للإدارة</span>
                <span class="tile-subtitle">حجز موعد رسمي مع إدارة القسم</span>
              </div>
            </div>
            <div class="tile-arrow">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

window.renderDashboardView = renderDashboardView;