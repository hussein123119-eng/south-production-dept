/* ==========================================================================
   إدارة قسم الإنتاج الجنوبي - Units Component
   ========================================================================== */

function renderUnitsView() {
  const user = window.auth.getCurrentUser();
  const units = window.store.getUnits(user.departmentId);

  return `
    <div style="margin-bottom: 2rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
      <div>
        <h2 style="font-size: 1.6rem; font-weight: 800; color: var(--md-sys-color-primary);">⚡ الوحدات التابعة لإدارة القسم</h2>
        <p style="color: var(--md-sys-color-outline);">الوحدات الهندسية، الفنية، التدريبية، والسلامة المرتبطة مباشرة بمدير القسم.</p>
      </div>
      ${window.rbac.hasPermission(user, 'MANAGE_UNITS') ? `
        <button class="btn btn-glass-amber" onclick="window.app.openCreateUnitModal()" title="استحداث وحدة جديدة">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 5v14M5 12h14"></path>
          </svg>
          <span>استحداث وحدة جديدة</span>
          <span style="font-size: 1.05rem;">⚡</span>
        </button>
      ` : ''}
    </div>

    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 1.5rem;">
      ${units.map(unit => {
        const manager = window.store.getUserById(unit.managerId);
        const docsCount = (window.store.getDocuments(user.departmentId) || []).filter(d => d.unitId === unit.id).length;
        const staffCount = (window.store.getUsers(user.departmentId) || []).filter(u => u.unitId === unit.id && u.status === 'APPROVED').length;
        
        return `
          <div class="card" style="display: flex; flex-direction: column; justify-content: space-between; border-top: 4px solid var(--md-sys-color-secondary);">
            <div>
              <div class="card-header" style="margin-bottom: 0.5rem;">
                <h3 class="card-title">${unit.name}</h3>
                <span class="badge badge-success">نشطة</span>
              </div>
              
              <p style="font-size: 0.875rem; color: var(--md-sys-color-outline); margin-bottom: 1rem; line-height: 1.6;">
                ${unit.description}
              </p>
              
              <div style="background: var(--md-sys-color-background); padding: 0.75rem; border-radius: var(--radius-sm); margin-bottom: 1rem; border: 1px solid var(--md-sys-color-surface-variant);">
                <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 4px;">
                  <span style="color: var(--md-sys-color-outline);">مسؤول الوحدة:</span>
                  <strong>${manager ? manager.fullName : 'شاغر'}</strong>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 0.85rem;">
                  <span style="color: var(--md-sys-color-outline);">الارتباط:</span>
                  <span>مباشر بالسيد مدير القسم</span>
                </div>
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-bottom: 1.5rem; text-align: center;">
                <div style="background: var(--md-sys-color-surface-variant); padding: 0.5rem; border-radius: var(--radius-sm);">
                  <div style="font-size: 1.1rem; font-weight: 800; color: var(--md-sys-color-primary);">${staffCount}</div>
                  <div style="font-size: 0.75rem; color: var(--md-sys-color-outline);">الكوادر المعتمدة</div>
                </div>
                <div style="background: var(--md-sys-color-surface-variant); padding: 0.5rem; border-radius: var(--radius-sm);">
                  <div style="font-size: 1.1rem; font-weight: 800; color: var(--md-sys-color-secondary);">${docsCount}</div>
                  <div style="font-size: 0.75rem; color: var(--md-sys-color-outline);">الدراسات والتقارير</div>
                </div>
              </div>
            </div>

            <button class="btn btn-primary" style="width: 100%;" onclick="window.app.navigate('unit_workspace', '${unit.id}')">
              فتح مساحة الوحدة والمهام ←
            </button>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

window.renderUnitsView = renderUnitsView;