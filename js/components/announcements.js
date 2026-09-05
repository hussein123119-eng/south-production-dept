/* ==========================================================================
   إدارة قسم الإنتاج الجنوبي - Announcements Component
   ========================================================================== */

function renderAnnouncementsView() {
  const user = window.auth.getCurrentUser();
  const db = window.store.getDb();
  const announcements = window.store.getAnnouncements(user.departmentId);
  const canManage = window.rbac.hasPermission(user, 'PUBLISH_CENTRAL_ANNOUNCEMENT') || user.role === 'SUPER_ADMIN' || user.role === 'DEPT_MANAGER';

  return `
    <div class="card">
      <div class="card-header" style="flex-wrap: wrap; gap: 1rem;">
        <div>
          <h3 class="card-title">📢 إدارة الإعلانات وشريط الأخبار التفاعلي</h3>
          <p style="color: var(--md-sys-color-outline); font-size: 0.85rem; margin-top: 4px;">يمكنك نشر إعلانات وتحديد الإعلان الذي يسري في شريط الأخبار المتحرك أعلى الشاشة.</p>
        </div>
        ${canManage ? `
          <button class="btn btn-glass-primary" onclick="window.app.openCreateAnnouncementModal()" title="نشر وتفعيل إعلان رسمي جديد في شريط الأخبار">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 5v14M5 12h14"></path>
            </svg>
            <span>+ نشر إعلان جديد في شريط الأخبار</span>
            <span style="font-size: 1.05rem;">📢</span>
          </button>
        ` : ''}
      </div>

      <div style="display: flex; flex-direction: column; gap: 1.5rem;">
        ${announcements.map(anc => `
          <div style="border: 1px solid var(--md-sys-color-surface-variant); border-radius: var(--radius-md); padding: 1.5rem; ${anc.isPinned ? 'border-right: 5px solid var(--md-sys-color-primary); background: rgba(0, 106, 106, 0.03);' : ''}">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem; flex-wrap: wrap; gap: 0.5rem;">
              <div>
                <h4 style="font-size: 1.2rem; font-weight: 700; color: var(--md-sys-color-on-surface); margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem;">
                  ${anc.isPinned ? '<span class="badge badge-success" style="font-size: 0.75rem;">🔴 معروض حالياً في شريط الأخبار</span>' : ''}
                  ${anc.title}
                </h4>
                <div style="font-size: 0.8rem; color: var(--md-sys-color-outline);">
                  نُشر في: <span style="font-family: monospace;">${new Date(anc.publishDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span> | 
                  بواسطة: ${window.store.getUserById(anc.createdBy)?.fullName || 'مجهول'}
                </div>
              </div>
              <div style="display: flex; gap: 0.5rem; align-items: center;">
                <span class="badge ${anc.importance === 'URGENT' ? 'badge-error' : (anc.importance === 'HIGH' ? 'badge-warning' : 'badge-info')}">
                  ${anc.importance === 'URGENT' ? 'عاجل جداً' : (anc.importance === 'HIGH' ? 'هام' : 'عادي')}
                </span>
                ${canManage ? `
                  ${!anc.isPinned ? `
                    <button class="btn-action-broadcast" onclick="window.app.setActiveTickerAnnouncement('${anc.id}')" title="جعله الإعلان النشط في الشريط المتحرك">
                      🎯 تفعيل في شريط الأخبار
                    </button>
                  ` : `
                    <button class="btn-action-export" style="cursor: default;" disabled>
                      ✓ نشط في الشريط
                    </button>
                  `}
                  <button class="btn-action-trash" onclick="window.app.handleDeleteAnnouncement('${anc.id}')" title="حذف الإعلان">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                  </button>
                ` : ''}
              </div>
            </div>
            
            <p style="font-size: 0.95rem; line-height: 1.6; margin-bottom: 1.25rem;">
              ${anc.content}
            </p>

            ${anc.attachmentName ? `
              <div style="background: var(--md-sys-color-background); padding: 0.75rem 1rem; border-radius: var(--radius-sm); display: inline-flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; font-weight: 600; border: 1px solid var(--md-sys-color-surface-variant);">
                📎 المرفقات: <a href="#" style="color: var(--md-sys-color-primary); text-decoration: underline;">${anc.attachmentName}</a>
              </div>
            ` : ''}
          </div>
        `).join('')}
        
        ${announcements.length === 0 ? '<div style="text-align: center; padding: 2rem; color: var(--md-sys-color-outline);">لا توجد إعلانات منشورة حالياً.</div>' : ''}
      </div>
    </div>
  `;
}

window.renderAnnouncementsView = renderAnnouncementsView;