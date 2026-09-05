/* ==========================================================================
   إدارة قسم الإنتاج الجنوبي - نظام الموقف الفني الموحد (Technical Status System)
   سجل ومتابعة واعتماد ونشر المواقف الفنية التشغيلية للشعب والمواقع
   ========================================================================== */

/**
 * Render Technical Status Tab inside Section Workspace
 */
function renderSectionTechnicalStatusTab(section, user) {
  const actorUser = user || (window.auth ? window.auth.getCurrentUser() : null);
  const canAdd = window.rbac ? (window.rbac.hasPermission(actorUser, 'TECH_STATUS_ADD') || ['DEPT_MANAGER', 'SUPER_ADMIN', 'SECTION_MANAGER', 'STATION_MANAGER'].includes(actorUser.role)) : true;
  const canEdit = window.rbac ? window.rbac.hasPermission(actorUser, 'TECH_STATUS_EDIT') : true;
  const canDelete = window.rbac ? window.rbac.hasPermission(actorUser, 'TECH_STATUS_DELETE') : true;
  const canPublish = window.rbac ? window.rbac.hasPermission(actorUser, 'TECH_STATUS_PUBLISH') : true;
  const canArchive = window.rbac ? window.rbac.hasPermission(actorUser, 'TECH_STATUS_ARCHIVE') : true;

  const stations = (window.store && typeof window.store.getStations === 'function') 
    ? window.store.getStations(actorUser.departmentId, section.id) 
    : [];

  const statuses = (window.store && typeof window.store.getTechnicalStatuses === 'function') 
    ? window.store.getTechnicalStatuses(actorUser.departmentId, { sectionId: section.id }, actorUser) 
    : [];

  const operationalCount = statuses.filter(s => s.status === 'OPERATIONAL' || s.operationalStatus === 'OPERATIONAL').length;
  const partialCount = statuses.filter(s => s.status === 'PARTIAL' || s.operationalStatus === 'PARTIAL').length;
  const stoppedCount = statuses.filter(s => s.status === 'STOPPED' || s.operationalStatus === 'STOPPED').length;

  return `
    <div class="card">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; margin-bottom: 1.25rem;">
        <div>
          <h3 style="font-size: 1.25rem; font-weight: 800; color: var(--md-sys-color-primary); margin: 0 0 0.25rem 0;">
            ⚙️ سجل الموقف الفني التشغيلي — ${section.name}
          </h3>
          <p style="color: var(--md-sys-color-outline); font-size: 0.85rem; margin: 0;">
            توثيق الحالة الفنية للمواقع والمحطات، الملاحظات الهندسية، والإجراءات المتخذة من قبل مسؤولي المواقع والشعبة.
          </p>
        </div>
        <div style="display: flex; gap: 0.65rem; flex-wrap: wrap; align-items: center;">
          ${canAdd ? `
            <button class="btn btn-glass-primary" onclick="window.app.openCreateTechnicalStatusModal('${section.id}')" title="تسجيل وتوثيق موقف فني تشغيلي جديد">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 5v14M5 12h14"></path>
              </svg>
              <span>تسجيل موقف فني جديد</span>
              <span style="font-size: 1.05rem;">⚙️</span>
            </button>
          ` : ''}
        </div>
      </div>

      <!-- Quick Metrics Badges (Compact & Highly Vivid) -->
      <div class="mini-status-chips-container">
        <div class="mini-status-chip mini-chip-success" title="مواقع ومحطات مستقرة وبالعمل">
          <span class="mini-pulse-dot dot-success"></span>
          <span>مستقرة / بالعمل</span>
          <span class="mini-chip-count">${operationalCount}</span>
        </div>
        <div class="mini-status-chip mini-chip-warning" title="مواقع قيد المتابعة أو الصيانة">
          <span class="mini-pulse-dot dot-warning"></span>
          <span>قيد المتابعة / صيانة</span>
          <span class="mini-chip-count">${partialCount}</span>
        </div>
        <div class="mini-status-chip mini-chip-danger" title="مواقع في حالة حرجة أو متوقفة">
          <span class="mini-pulse-dot dot-danger"></span>
          <span>حرجة / متوقفة</span>
          <span class="mini-chip-count">${stoppedCount}</span>
        </div>
      </div>

      <!-- Search & Filters -->
      <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 1.25rem;">
        <input type="text" id="sectionTechSearchInput" class="form-control" style="flex: 2; min-width: 200px; font-size: 0.85rem; padding: 0.35rem 0.75rem;" placeholder="🔍 بحث بالوصف، الإجراءات، أو الموقع..." oninput="window.app.filterSectionTechStatus()">
        <select id="sectionTechStationFilter" class="form-control" style="flex: 1; min-width: 150px; font-size: 0.85rem; padding: 0.35rem 0.75rem;" onchange="window.app.filterSectionTechStatus()">
          <option value="ALL">كافة المواقع والمحطات</option>
          ${stations.map(st => `<option value="${st.id}">${st.name}</option>`).join('')}
        </select>
        <select id="sectionTechStatusFilter" class="form-control" style="flex: 1; min-width: 140px; font-size: 0.85rem; padding: 0.35rem 0.75rem;" onchange="window.app.filterSectionTechStatus()">
          <option value="ALL">كافة الحالات الفنية</option>
          <option value="OPERATIONAL">🟢 مستقرة / بالعمل</option>
          <option value="PARTIAL">🟡 قيد المتابعة</option>
          <option value="STOPPED">🔴 حرجة / متوقفة</option>
        </select>
      </div>

      <!-- Technical Status Table -->
      <div class="table-container" style="overflow-x: auto;">
        <table class="data-table" id="sectionTechStatusTable" style="font-size: 0.88rem;">
          <thead>
            <tr>
              <th>التاريخ</th>
              <th>الموقع / المحطة</th>
              <th>الحالة الفنية</th>
              <th>وصف الموقف الفني</th>
              <th>الإجراءات المتخذة</th>
              <th>الملاحظات</th>
              <th>مسؤول الموقع / المسجل</th>
              <th>آخر تحديث</th>
              <th style="text-align: center; min-width: 140px;">الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            ${statuses.length === 0 ? `
              <tr>
                <td colspan="9" style="text-align: center; padding: 3rem 1rem; color: var(--md-sys-color-outline);">
                  <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">⚙️</div>
                  <h4>لا يوجد موقف فني مسجل حالياً لهذه الشعبة</h4>
                  <p style="font-size: 0.85rem; max-width: 450px; margin: 0.25rem auto 1.25rem auto;">
                    يمكن لمسؤول الموقع أو الشعبة تسجيل وتحديث الموقف الفني الميداني للمحطة بالضغط على الزر أدناه.
                  </p>
                  ${canAdd ? `
                    <button class="btn btn-primary" onclick="window.app.openCreateTechnicalStatusModal('${section.id}')">
                      + تسجيل أول موقف فني
                    </button>
                  ` : ''}
                </td>
              </tr>
            ` : statuses.map(s => {
              const opStatus = s.status || s.operationalStatus || 'OPERATIONAL';
              let badgeClass = 'badge-success';
              let labelText = '🟢 مستقرة';
              if (opStatus === 'PARTIAL') { badgeClass = 'badge-warning'; labelText = '🟡 قيد المتابعة'; }
              if (opStatus === 'STOPPED') { badgeClass = 'badge-danger'; labelText = '🔴 حرجة / متوقفة'; }

              const recordDateStr = s.recordDate ? new Date(s.recordDate).toLocaleDateString('ar-IQ') : '—';
              const updateTimeStr = (s.updatedAt || s.createdAt) ? new Date(s.updatedAt || s.createdAt).toLocaleDateString('ar-IQ') : '—';

              return `
                <tr class="section-tech-row"
                    data-desc="${(s.description || '').toLowerCase()}"
                    data-actions="${(s.actionsTaken || '').toLowerCase()}"
                    data-notes="${(s.notes || '').toLowerCase()}"
                    data-station="${s.stationId || 'NONE'}"
                    data-status="${opStatus}">
                  
                  <td style="font-weight: 700; white-space: nowrap;">
                    📅 ${recordDateStr}
                  </td>

                  <td>
                    <strong>${s.stationName || 'الموقع المركزي'}</strong>
                  </td>

                  <td>
                    <span class="badge ${badgeClass}" style="font-size: 0.78rem; padding: 0.25rem 0.55rem; white-space: nowrap;">
                      ${labelText}
                    </span>
                  </td>

                  <td style="max-width: 250px; line-height: 1.45;">
                    <div style="font-weight: 600; color: var(--md-sys-color-on-surface);">
                      ${s.description || '—'}
                    </div>
                  </td>

                  <td style="max-width: 200px; font-size: 0.82rem; color: var(--md-sys-color-on-surface-variant);">
                    ${s.actionsTaken || '—'}
                  </td>

                  <td style="max-width: 180px; font-size: 0.82rem; color: var(--md-sys-color-outline);">
                    ${s.notes || '—'}
                  </td>

                  <td style="font-size: 0.82rem; white-space: nowrap;">
                    <div><strong>${s.createdByName || 'مسؤول الموقع'}</strong></div>
                    <div style="font-size: 0.72rem; color: var(--md-sys-color-outline);">${s.createdByRole || 'مسؤول الموقع'}</div>
                  </td>

                  <td style="font-size: 0.78rem; color: var(--md-sys-color-outline); white-space: nowrap;">
                    ${updateTimeStr}
                  </td>

                  <td style="text-align: center;">
                    <div style="display: flex; gap: 0.35rem; justify-content: center; align-items: center; flex-wrap: wrap;">
                      <button class="btn-action-view" onclick="window.app.openViewTechnicalStatusDetailsModal('${s.id}')" title="معاينة الموقف الفني">
                        معاينة
                      </button>
                      ${canEdit ? `
                        <button class="btn-action-edit" onclick="window.app.openEditTechnicalStatusModal('${s.id}')" title="تعديل الموقف الفني">
                          تعديل
                        </button>
                      ` : ''}
                      ${canDelete ? `
                        <button class="btn-action-trash" onclick="window.app.deleteTechnicalStatus('${s.id}', '${section.id}')" title="حذف الموقف الفني">
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

/**
 * Global Standalone Technical Status View (for Central Dashboard/Nav)
 */
function renderTechnicalStatusView() {
  const actorUser = window.auth ? window.auth.getCurrentUser() : null;
  if (!actorUser) {
    return `<div class="card" style="text-align: center; padding: 3rem;"><h3>⚠️ يرجى تسجيل الدخول</h3></div>`;
  }

  const sections = (window.store && typeof window.store.getSections === 'function') 
    ? window.store.getSections(actorUser.departmentId) 
    : [];

  const statuses = (window.store && typeof window.store.getTechnicalStatuses === 'function') 
    ? window.store.getTechnicalStatuses(actorUser.departmentId, {}, actorUser) 
    : [];

  const operationalCount = statuses.filter(s => s.status === 'OPERATIONAL' || s.operationalStatus === 'OPERATIONAL').length;
  const partialCount = statuses.filter(s => s.status === 'PARTIAL' || s.operationalStatus === 'PARTIAL').length;
  const stoppedCount = statuses.filter(s => s.status === 'STOPPED' || s.operationalStatus === 'STOPPED').length;

  return `
    <div style="margin-bottom: 2rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
      <div>
        <h2 style="font-size: 1.6rem; font-weight: 800; color: var(--md-sys-color-primary); display: flex; align-items: center; gap: 0.5rem; margin: 0 0 0.35rem 0;">
          ⚙️ الموقف الفني العام للشعب والمواقع
        </h2>
        <p style="color: var(--md-sys-color-outline); font-size: 0.9rem; margin: 0;">
          المتابعة المركزية للجاهزية التشغيلية، صيانة المعدات، والأعمال الميدانية الجارية لقسم الإنتاج الجنوبي.
        </p>
      </div>
      ${window.rbac && window.rbac.hasPermission(actorUser, 'TECH_STATUS_ADD') ? `
        <button class="btn btn-glass-primary" onclick="window.app.openCreateTechnicalStatusModal()" title="تسجيل وتوثيق موقف فني تشغيلي جديد">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 5v14M5 12h14"></path>
          </svg>
          <span>تسجيل موقف فني جديد</span>
          <span style="font-size: 1.05rem;">⚙️</span>
        </button>
      ` : ''}
    </div>

    <!-- Quick Status Chips (Compact, Sleek & Highly Vivid) -->
    <div class="user-quick-stats-grid" style="margin-bottom: 1.25rem;">
      <div class="user-stat-chip chip-success" title="مواقع تعمل بكفاءة مستقرة">
        <div class="chip-content">
          <span class="chip-number">${operationalCount}</span>
          <span class="chip-title">مواقع تعمل بكفاءة مستقرة</span>
        </div>
        <div class="chip-icon-box">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
          <span class="chip-pulse-dot dot-success"></span>
        </div>
      </div>
      <div class="user-stat-chip chip-warning" title="مواقع قيد المتابعة والصيانة">
        <div class="chip-content">
          <span class="chip-number">${partialCount}</span>
          <span class="chip-title">مواقع قيد المتابعة والصيانة</span>
        </div>
        <div class="chip-icon-box">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <span class="chip-pulse-dot dot-warning"></span>
        </div>
      </div>
      <div class="user-stat-chip chip-danger" title="حالات حرجة / متوقفة">
        <div class="chip-content">
          <span class="chip-number">${stoppedCount}</span>
          <span class="chip-title">حالات حرجة / متوقفة</span>
        </div>
        <div class="chip-icon-box">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"></polygon>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
          <span class="chip-pulse-dot dot-danger"></span>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <h3 class="card-title">سجل المواقف الفنية التشغيلية المعتمدة</h3>
      </div>
      <div class="table-container" style="overflow-x: auto;">
        <table class="data-table" style="font-size: 0.88rem;">
          <thead>
            <tr>
              <th>التاريخ</th>
              <th>الشعبة</th>
              <th>الموقع / المحطة</th>
              <th>الحالة الفنية</th>
              <th>وصف الموقف الفني</th>
              <th>الإجراءات المتخذة</th>
              <th>المسجل</th>
              <th>آخر تحديث</th>
              <th style="text-align: center;">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            ${statuses.map(s => {
              const opStatus = s.status || s.operationalStatus || 'OPERATIONAL';
              let chipTheme = 'mini-chip-success';
              let labelText = 'مستقرة';
              if (opStatus === 'PARTIAL') { chipTheme = 'mini-chip-warning'; labelText = 'قيد المتابعة'; }
              if (opStatus === 'STOPPED') { chipTheme = 'mini-chip-danger'; labelText = 'حرجة / متوقفة'; }

              return `
                <tr>
                  <td style="font-weight: 700; white-space: nowrap;">📅 ${s.recordDate || '—'}</td>
                  <td><strong>${s.sectionName || 'الشعبة'}</strong></td>
                  <td>${s.stationName || 'الموقع المركزي'}</td>
                  <td>
                    <span class="mini-status-chip ${chipTheme}">
                      <span class="mini-pulse-dot"></span>
                      <span class="chip-label">${labelText}</span>
                    </span>
                  </td>
                  <td style="max-width: 250px;">${s.description || '—'}</td>
                  <td style="max-width: 200px; font-size: 0.82rem;">${s.actionsTaken || '—'}</td>
                  <td style="font-size: 0.82rem;">${s.createdByName || 'مسؤول الموقع'}</td>
                  <td style="font-size: 0.78rem; color: var(--md-sys-color-outline);">${new Date(s.updatedAt || s.createdAt).toLocaleDateString('ar-IQ')}</td>
                  <td style="text-align: center;">
                    <button class="btn-action-view" onclick="window.app.openViewTechnicalStatusDetailsModal('${s.id}')" title="معاينة الموقف الفني">معاينة</button>
                  </td>
                </tr>
              `;
            }).join('')}
            ${statuses.length === 0 ? '<tr><td colspan="9" style="text-align: center; padding: 2.5rem; color: var(--md-sys-color-outline);">لا توجد مواقف فنية مسجلة حالياً.</td></tr>' : ''}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

window.renderTechnicalStatusView = renderTechnicalStatusView;
window.renderSectionTechnicalStatusTab = renderSectionTechnicalStatusTab;
