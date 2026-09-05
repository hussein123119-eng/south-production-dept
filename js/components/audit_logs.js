/* ==========================================================================
   إدارة قسم الإنتاج الجنوبي - Audit Logs Component
   ========================================================================== */

function renderAuditLogsView() {
  const user = window.auth.getCurrentUser();
  if (!window.rbac.hasPermission(user, 'VIEW_AUDIT_LOGS')) {
    return `<div class="card" style="text-align:center; color: var(--md-sys-color-error);"><h2>ليس لديك صلاحية لعرض سجلات النظام</h2></div>`;
  }

  const logs = window.store.getAuditLogs(user.departmentId);

  return `
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">📜 سجل النشاطات الأمني (Audit Trail)</h3>
      </div>

      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>الوقت والتاريخ</th>
              <th>الرقم الوظيفي</th>
              <th>نوع العملية</th>
              <th>القسم المختص</th>
              <th>التفاصيل</th>
              <th>النتيجة</th>
            </tr>
          </thead>
          <tbody>
            ${logs.slice(0, 50).map(log => `
              <tr>
                <td style="direction: ltr; text-align: right;">${new Date(log.timestamp).toLocaleString('en-GB')}</td>
                <td><strong>${log.employeeId || '-'}</strong></td>
                <td>${log.action}</td>
                <td>${log.entity}</td>
                <td>${log.details}</td>
                <td>
                  <span class="badge ${log.result === 'SUCCESS' ? 'badge-success' : 'badge-error'}">
                    ${log.result}
                  </span>
                </td>
              </tr>
            `).join('')}
            ${logs.length === 0 ? '<tr><td colspan="6" style="text-align: center;">لا توجد سجلات حالية</td></tr>' : ''}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

window.renderAuditLogsView = renderAuditLogsView;
