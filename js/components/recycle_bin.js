/* ==========================================================================
   إدارة قسم الإنتاج الجنوبي - Recycle Bin Component (سلة المحذوفات)
   ========================================================================== */

function renderRecycleBinView() {
  const user = window.auth.getCurrentUser();
  const isAuthorized = ['DEPT_MANAGER', 'DEPUTY_DEPT_MANAGER', 'ADMIN_MANAGER', 'SUPER_ADMIN', 'ADMINISTRATOR', 'SECTION_MANAGER', 'DEPUTY_SECTION_MANAGER'].includes(user.role);
  
  if (!isAuthorized) {
    return `<div class="card" style="text-align: center; color: var(--md-sys-color-error); padding: 3rem;"><h2>⛔ ليس لديك صلاحية للوصول إلى سلة المحذوفات</h2></div>`;
  }

  const db = window.store.getDb();
  const binItems = window.store.getRecycleBin(user.departmentId);

  return `
    <div style="margin-bottom: 2rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
      <div>
        <h2 style="font-size: 1.6rem; font-weight: 800; color: var(--md-sys-color-primary);">🗑️ سلة المحذوفات واستعادة البيانات (Recycle Bin)</h2>
        <p style="color: var(--md-sys-color-outline);">نظام الحذف المؤقت (Soft Delete) لحماية المستندات والبيانات مع إمكانية الاستعادة الفورية.</p>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <h3 class="card-title">العناصر المحذوفة مؤقتاً (${binItems.length})</h3>
      </div>
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>العنصر المحذوف</th>
              <th>النوع</th>
              <th>تاريخ الحذف</th>
              <th>القائم بالحذف</th>
              <th>إجراءات</th>
            </tr>
          </thead>
          <tbody>
            ${binItems.map(item => `
              <tr>
                <td><strong>${item.itemTitle}</strong></td>
                <td><span class="badge badge-info">${item.itemType}</span></td>
                <td>${new Date(item.deletedAt).toLocaleString('ar-IQ')}</td>
                <td>${item.deletedByName}</td>
                <td>
                  <div style="display: flex; gap: 0.4rem; align-items: center;">
                    <button class="btn-action-accept" onclick="window.app.handleRestoreFromRecycleBin('${item.id}')" title="استعادة العنصر فوراً">
                      🔄 استعادة
                    </button>
                    ${user.role === 'SUPER_ADMIN' || user.role === 'DEPT_MANAGER' ? `
                      <button class="btn-action-decline" onclick="window.app.handlePermanentDelete('${item.id}')" title="حذف نهائي لا يمكن الرجوع عنه">
                        🗑️ حذف نهائي
                      </button>
                    ` : ''}
                  </div>
                </td>
              </tr>
            `).join('')}
            ${binItems.length === 0 ? '<tr><td colspan="5" style="text-align: center; padding: 2.5rem; color: var(--md-sys-color-outline);">سلة المحذوفات فارغة حالياً.</td></tr>' : ''}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

window.renderRecycleBinView = renderRecycleBinView;