/* ==========================================================================
   إدارة قسم الإنتاج الجنوبي - Dynamic Administrative Requests & Change Logs
   ========================================================================== */

function renderRequestsView() {
  const user = window.auth.getCurrentUser();
  const db = window.store.getDb();
  const isHRorMgr = ['DEPT_MANAGER', 'DEPUTY_DEPT_MANAGER', 'ADMIN_MANAGER', 'SUPER_ADMIN', 'ADMINISTRATOR'].includes(user.role);
  
  const requests = (db.requests || []).filter(r => r.departmentId === user.departmentId && (isHRorMgr || r.userId === user.id));
  const changeLogs = (db.dataChangeLogs || []).filter(l => l.departmentId === user.departmentId && (isHRorMgr || l.userId === user.id));

  const activeSubTab = window.app.currentRequestSubTab || 'requestsList';

  return `
    <div class="requests-view">
      <div style="margin-bottom: 2rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
        <div>
          <h2 style="font-size: 1.6rem; font-weight: 800; color: var(--md-sys-color-primary);">📝 المنظومة الإلكترونية للطلبات وتحديث البيانات</h2>
          <p style="color: var(--md-sys-color-outline);">تقديم طلبات تعديل البيانات الرسمية، الإجازات، تصاريح العمل، ومتابعة سجل التعديلات.</p>
        </div>
        <button class="btn btn-primary" onclick="window.app.openSubmitRequestModal()">+ تقديم طلب إداري جديد</button>
      </div>
      
      <div class="tabs-header">
        <button class="tab-btn ${activeSubTab === 'requestsList' ? 'active' : ''}" onclick="window.app.switchRequestSubTab('requestsList')">
          📋 سجل الطلبات الرسمية (${requests.length})
        </button>
        <button class="tab-btn ${activeSubTab === 'changeLogs' ? 'active' : ''}" onclick="window.app.switchRequestSubTab('changeLogs')">
          📜 سجل تعديلات البيانات المعتمدة (Audit Trail) (${changeLogs.length})
        </button>
      </div>

      <div class="card">
        <div class="table-container">
          <table class="data-table">
            <tbody id="requestSubTabBody">
              ${activeSubTab === 'requestsList' ? renderRequestsListBody(requests, isHRorMgr) : renderChangeLogsBody(changeLogs)}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

function renderRequestsListBody(requests, isHRorMgr) {
  if (requests.length === 0) {
    return '<tr><td colspan="6" style="text-align: center; padding: 2.5rem; color: var(--md-sys-color-outline);">لا توجد طلبات مسجلة حالياً.</td></tr>';
  }
  
  return `
    <tr style="background: var(--md-sys-color-background); font-weight: bold;">
      <th>رقم الطلب</th>
      <th>نوع المعاملة والطلب</th>
      <th>مقدم الطلب</th>
      <th>التفاصيل المرفقة</th>
      <th>الحالة الإدارية</th>
      <th>الإجراءات</th>
    </tr>
    ${requests.map(r => `
      <tr>
        <td><strong>${r.id}</strong><br/><small style="color: var(--md-sys-color-outline);">${new Date(r.createdAt).toLocaleDateString('ar-IQ')}</small></td>
        <td><strong>${r.typeTitle}</strong></td>
        <td>${r.userName}<br/><small style="color: var(--md-sys-color-outline);">${r.userEmployeeId}</small></td>
        <td style="max-width: 250px; font-size: 0.85rem;">
          ${Object.entries(r.payload || {}).map(([k, v]) => `<div><strong>${k}:</strong> ${v}</div>`).join('')}
        </td>
        <td>
          <span class="badge ${r.status === 'APPROVED' ? 'badge-success' : (r.status === 'REJECTED' ? 'badge-error' : 'badge-warning')}">
            ${r.status === 'APPROVED' ? '✅ تمت الموافقة والتحديث' : (r.status === 'REJECTED' ? '❌ مرفوض' : '⏳ قيد المراجعة والتدقيق')}
          </span>
        </td>
        <td>
          <div style="display: flex; gap: 0.3rem;">
            ${isHRorMgr && r.status === 'PENDING' ? `
              <button class="btn btn-sm btn-success" onclick="window.app.approveAdministrativeRequest('${r.id}')">موافقة وتحديث</button>
              <button class="btn btn-sm btn-danger" onclick="window.app.rejectAdministrativeRequest('${r.id}')">رفض</button>
            ` : `
              <button class="btn-action-view" onclick="alert('تفاصيل ومحتوى الطلب: ${JSON.stringify(r.payload).replace(/"/g, "'")}')" title="معاينة تفاصيل الطلب">معاينة</button>
            `}
          </div>
        </td>
      </tr>
    `).join('')}
  `;
}

function renderChangeLogsBody(logs) {
  if (logs.length === 0) {
    return '<tr><td colspan="6" style="text-align: center; padding: 2.5rem; color: var(--md-sys-color-outline);">لا توجد سجلات تعديل بيانات حتى الآن.</td></tr>';
  }
  
  return `
    <tr style="background: var(--md-sys-color-background); font-weight: bold;">
      <th>وقت التعديل</th>
      <th>الموظف المعني</th>
      <th>الحقل المحدث</th>
      <th>القيمة السابقة</th>
      <th>القيمة الجديدة المعتمدة</th>
      <th>المصادق الإداري</th>
    </tr>
    ${logs.map(l => `
      <tr>
        <td style="direction: ltr; text-align: right;">${new Date(l.changedAt).toLocaleString('en-GB')}</td>
        <td><strong>${l.targetUserName}</strong></td>
        <td><span class="badge badge-info">${l.fieldName}</span></td>
        <td style="color: var(--md-sys-color-error); text-decoration: line-through; font-family: monospace;">${l.oldValue || '(فارغ)'}</td>
        <td style="color: var(--md-sys-color-success); font-weight: bold; font-family: monospace;">${l.newValue}</td>
        <td>${l.changedByName || 'مدير القسم'}</td>
      </tr>
    `).join('')}
  `;
}

window.renderRequestsView = renderRequestsView;
window.renderRequestsListBody = renderRequestsListBody;
window.renderChangeLogsBody = renderChangeLogsBody;