/* ==========================================================================
   إدارة قسم الإنتاج الجنوبي - Notifications Component (سجل التبليغات والتوجيهات المركزية)
   ========================================================================== */

function renderNotificationsView() {
  const user = window.auth.getCurrentUser();
  const db = window.store.getDb();
  
  // جلب التبليغات الرسمية المعتمدة للقسم والشعب
  const notifications = (window.store && typeof window.store.getOfficialNotifications === 'function')
    ? window.store.getOfficialNotifications(user.departmentId, user)
    : (db.officialNotifications || []);

  const canManage = window.rbac.hasPermission(user, 'MANAGE_OFFICIAL_NOTIFICATIONS') ||
                    ['DEPT_MANAGER', 'SUPER_ADMIN', 'ADMINISTRATOR', 'DEPUTY_DEPT_MANAGER', 'ADMIN_MANAGER'].includes(user.role);

  return `
    <div class="card">
      <div class="card-header" style="flex-wrap: wrap; gap: 1rem; border-bottom: 1px solid var(--md-sys-color-surface-variant); padding-bottom: 1rem; margin-bottom: 1.25rem;">
        <div>
          <h3 class="card-title" style="font-size: 1.35rem; font-weight: 800; color: var(--md-sys-color-primary);">
            🔔 سجل التبليغات والتوجيهات الإدارية الرسمية
          </h3>
          <p style="color: var(--md-sys-color-outline); font-size: 0.88rem; margin-top: 4px;">
            التوجيهات والتعليمات الصادرة من إدارة القسم والمسؤولين المعممّة لكافة شعب ووحدات ومحطات القسم.
          </p>
        </div>
        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; align-items: center;">
          <input type="text" id="centralNotifSearchInput" class="form-control" style="width: 220px; font-size: 0.85rem; padding: 0.4rem 0.85rem;" placeholder="🔍 بحث في التبليغات..." oninput="window.app.filterCentralNotifs()">
          ${canManage ? `
            <button class="btn btn-glass-primary" onclick="window.app.openCreateNotificationModal()" title="إصدار تبليغ وتوجيه إداري رسمي جديد">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 5v14M5 12h14"></path>
              </svg>
              <span>+ إصدار تبليغ رسمي جديد</span>
              <span style="font-size: 1.05rem;">🔔</span>
            </button>
          ` : ''}
        </div>
      </div>

      <div class="table-container" style="overflow-x: auto;">
        <table class="data-table" style="font-size: 0.88rem;">
          <thead>
            <tr>
              <th>رقم التبليغ</th>
              <th>تاريخ الإصدار</th>
              <th>عنوان التبليغ والتوجيه</th>
              <th>الجهة المستهدفة والنطاق</th>
              <th>الجهة المُصدِرة</th>
              <th>الأهمية</th>
              <th style="text-align: center;">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            ${notifications.map((n, idx) => {
              const notifNum = n.number || n.id || ('ت-' + new Date(n.publishDate || n.createdAt || Date.now()).getFullYear() + '/' + String(idx + 1).padStart(3, '0'));
              const formattedDate = new Date(n.publishDate || n.createdAt || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
              const isUrgent = n.importance === 'URGENT' || n.priority === 'URGENT';
              const isHigh = n.importance === 'HIGH' || n.priority === 'HIGH';
              const priorityBadge = isUrgent 
                ? '<span class="badge badge-danger" style="font-weight: 800;">🚨 عاجل جداً</span>' 
                : (isHigh ? '<span class="badge badge-warning" style="font-weight: 800;">⚠️ هام</span>' : '<span class="badge badge-info">ℹ️ عادي</span>');

              const targetLabel = n.targetSectionName || (n.targetScope === 'ALL_SECTIONS' ? '🌐 كافة شعب ووحدات القسم' : (n.targetStationName ? '📍 ' + n.targetStationName : '🏢 شعبة محددة'));
              const senderLabel = n.createdByName || n.sender || 'إدارة القسم';

              return `
                <tr class="central-notif-row" data-search="${(n.title + ' ' + notifNum + ' ' + senderLabel + ' ' + targetLabel).toLowerCase()}">
                  <td><code style="font-weight: 800; color: var(--md-sys-color-primary);">${notifNum}</code></td>
                  <td><span style="font-family: monospace; font-size: 0.84rem;">${formattedDate}</span></td>
                  <td style="max-width: 320px;">
                    <div style="font-weight: 800; color: var(--md-sys-color-on-surface); margin-bottom: 2px;">
                      ${n.title}
                    </div>
                    <div style="font-size: 0.78rem; color: var(--md-sys-color-outline); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 300px;">
                      ${(n.content || n.body || '').substring(0, 70)}...
                    </div>
                  </td>
                  <td><span class="badge badge-secondary" style="font-size: 0.78rem;">${targetLabel}</span></td>
                  <td><strong>${senderLabel}</strong></td>
                  <td>${priorityBadge}</td>
                  <td style="text-align: center;">
                    <div style="display: inline-flex; align-items: center; gap: 0.35rem;">
                      <!-- زر المعاينة الفعال 100% -->
                      <button class="btn-action-view" onclick="window.app.openViewOfficialNotificationModal('${n.id}')" title="معاينة تفاصيل التبليغ كاملة">
                        معاينة
                      </button>
                      <!-- زر الطباعة الرسمي -->
                      <button class="btn-action-print" onclick="window.app.printOfficialNotification('${n.id}')" title="طباعة التبليغ الرسمي">
                        طباعة
                      </button>
                      ${canManage ? `
                        <button class="btn-action-trash" onclick="window.app.deleteDeptNotification('${n.id}')" title="أرشفة وحذف التبليغ">
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
            ${notifications.length === 0 ? `
              <tr>
                <td colspan="7" style="text-align: center; padding: 3rem 1.5rem; color: var(--md-sys-color-outline);">
                  <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">🔔</div>
                  <div style="font-weight: 800; font-size: 1.1rem; color: var(--md-sys-color-on-surface);">لا توجد تبليغات رسمية حالياً</div>
                  <div style="font-size: 0.85rem; margin-top: 4px;">سيتم عرض جميع التعاميم والتوجيهات الصادرة من إدارة القسم هنا فور نشرها.</div>
                </td>
              </tr>
            ` : ''}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

window.renderNotificationsView = renderNotificationsView;
