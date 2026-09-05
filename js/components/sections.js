/* ==========================================================================
   إدارة قسم الإنتاج الجنوبي - Sections Component
   ========================================================================== */

function renderSectionsView() {
  const user = window.auth.getCurrentUser();
  const sections = window.store.getSections(user.departmentId);

  return `
    <div style="margin-bottom: 2rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
      <div>
        <h2 style="font-size: 1.6rem; font-weight: 800; color: var(--md-sys-color-primary);">🛢️ شعب قسم الإنتاج الجنوبي والمحطات</h2>
        <p style="color: var(--md-sys-color-outline);">الهيكل التنظيمي والشعب الفنية والإنتاجية والمحطات والمجمعات التابعة.</p>
      </div>
      ${window.rbac.hasPermission(user, 'MANAGE_SECTIONS') ? `
        <button class="btn btn-glass-primary" onclick="window.app.openCreateSectionModal()" title="استحداث شعبة جديدة">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 5v14M5 12h14"></path>
          </svg>
          <span>استحداث شعبة جديدة</span>
          <span style="font-size: 1.05rem;">🛢️</span>
        </button>
      ` : ''}
    </div>

    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 1.5rem;">
      ${sections.map(sec => {
        const stations = window.store.getStations(user.departmentId, sec.id);
        const manager = window.store.getUserById(sec.managerId);
        const isUserSection = user.sectionId === sec.id;
        const customPerms = Array.isArray(user.customPermissions) ? user.customPermissions : [];
        const hasGlobal = ['SUPER_ADMIN', 'DEPT_MANAGER'].includes(user.role) ||
                          customPerms.includes('SCOPE_ALL_SECTIONS') ||
                          customPerms.includes('ALL_SECTIONS_UNITS_ACCESS') ||
                          user.hasGlobalAccess === true;
        const canAccess = isUserSection || hasGlobal || !user.sectionId;
        
        return `
          <div class="card" style="display: flex; flex-direction: column; justify-content: space-between; border-top: 4px solid ${isUserSection ? '#10b981' : canAccess ? 'var(--md-sys-color-primary)' : '#94a3b8'}; position: relative;">
            <div>
              <div class="card-header" style="margin-bottom: 0.5rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.35rem;">
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                  <h3 class="card-title" style="margin: 0;">${sec.name}</h3>
                  ${isUserSection ? `
                    <span class="badge badge-success" style="font-size: 0.72rem; padding: 0.15rem 0.55rem; font-weight: 800; border-radius: 999px;">
                      ⭐ شعبتك التابع لها
                    </span>
                  ` : ''}
                </div>
                <span class="badge badge-info">${stations.length} محطات</span>
              </div>
              
              <p style="font-size: 0.875rem; color: var(--md-sys-color-outline); margin-bottom: 1rem; line-height: 1.6;">
                ${sec.description}
              </p>
              
              <div style="background: var(--md-sys-color-background); padding: 0.75rem; border-radius: var(--radius-sm); margin-bottom: 1rem; border: 1px solid var(--md-sys-color-surface-variant);">
                <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 4px;">
                  <span style="color: var(--md-sys-color-outline);">مسؤول الشعبة:</span>
                  <strong>${manager ? manager.fullName : 'شاغر'}</strong>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 0.85rem;">
                  <span style="color: var(--md-sys-color-outline);">الموقع:</span>
                  <span>${sec.location || 'الموقع المركزي'}</span>
                </div>
              </div>

              <div style="margin-bottom: 1.5rem;">
                <div style="font-size: 0.85rem; font-weight: 700; margin-bottom: 0.75rem; color: var(--md-sys-color-primary);">المحطات التابعة:</div>
                <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
                  ${stations.map(st => `
                    <button class="badge badge-info" style="cursor: pointer; border: 1px solid var(--md-sys-color-primary); background: var(--md-sys-color-surface);" onclick="window.app.navigate('station_workspace', '${st.id}')">
                      🛢️ ${st.name}
                    </button>
                  `).join('')}
                  ${stations.length === 0 ? '<span style="font-size: 0.8rem; color: var(--md-sys-color-outline);">لا توجد محطات مسجلة</span>' : ''}
                </div>
              </div>
            </div>

            <div style="display: flex; gap: 0.5rem; border-top: 1px solid var(--md-sys-color-surface-variant); padding-top: 1rem;">
              <button class="btn ${canAccess ? (isUserSection ? 'btn-glass-emerald' : 'btn-glass-primary') : 'btn-outline'}" style="flex: 1; font-weight: 800; display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem; border-radius: var(--radius-full);" onclick="window.app.navigate('section_workspace', '${sec.id}')">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                  <polyline points="15 3 21 3 21 9"></polyline>
                  <line x1="10" y1="14" x2="21" y2="3"></line>
                </svg>
                <span>${canAccess ? (isUserSection ? 'فتح مساحة عمل شعبتك ←' : 'فتح مساحة عمل الشعبة ←') : '🔒 فتح مساحة العمل (مقيد)'}</span>
              </button>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

window.renderSectionsView = renderSectionsView;