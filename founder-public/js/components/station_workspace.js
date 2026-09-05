/* ==========================================================================
   إدارة قسم الإنتاج الجنوبي - Station Workspace Component
   ========================================================================== */

function renderStationWorkspaceView(stationId) {
  const user = window.auth.getCurrentUser();
  const db = window.store.getDb();
  const station = db.stations.find(s => s.id === stationId);
  
  if (!station) {
    return `<div class="card" style="text-align:center; color:var(--md-sys-color-error); padding: 3rem;">
      <h2>⚠️ المحطة غير موجودة</h2>
      <button class="btn btn-primary" onclick="window.app.navigate('sections')" style="margin-top: 1rem;">العودة إلى الشعب</button>
    </div>`;
  }

  const section = db.sections.find(s => s.id === station.sectionId);
  const manager = window.store.getUserById(station.managerId);
  const deputyManager = station.deputyManagerId 
    ? window.store.getUserById(station.deputyManagerId) 
    : ((db.users || []).find(u => u.stationId === station.id && (u.role === 'DEPUTY_STATION_MANAGER' || u.role === 'STATION_SUPERVISOR')) || (station.deputyManagerName ? { fullName: station.deputyManagerName } : null));
  const stationDocs = (db.documents || []).filter(d => d.stationId === stationId);
  const stationStaff = (db.users || []).filter(u => u.stationId === stationId || (u.sectionId === station.sectionId && !u.stationId));

  const activeSubTab = window.app.currentStationSubTab || 'overview';

  return `
    <div style="margin-bottom: 1.5rem;">
      <div style="display: flex; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; gap: 1.25rem;">
        <div style="flex: 1 1 320px; min-width: 280px;">
          <button class="btn btn-sm" onclick="window.app.navigate('sections')" 
                  style="margin-bottom: 0.65rem; border-radius: 10px; font-weight: 700; font-size: 0.84rem; background: var(--md-sys-color-surface); border: 1.5px solid var(--md-sys-color-surface-variant); color: var(--md-sys-color-primary); box-shadow: 0 2px 6px rgba(0,0,0,0.03); display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.4rem 0.85rem; cursor: pointer;">
            ← العودة إلى قائمة الشعب
          </button>
          <h2 style="font-size: 1.8rem; font-weight: 800; color: var(--md-sys-color-primary); margin-bottom: 0.25rem;">${station.name}</h2>
          <p style="color: var(--md-sys-color-outline); font-size: 0.95rem; margin: 0; line-height: 1.5;">${section ? section.name : 'القسم'} | رمز المحطة: <strong>${station.code}</strong></p>
        </div>
        <div style="display: flex; gap: 0.65rem; align-items: center; flex-wrap: wrap; margin-right: auto; justify-content: flex-end;">
          <!-- بطاقة القيادة الإدارية للمحطة: المسؤول والوكيل (تصميم زجاجي مكبّر ومميز) -->
          <div class="executive-leadership-card" style="padding: 0.55rem 1.15rem; border-radius: 14px; background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.92) 100%); border: 1.5px solid rgba(11, 87, 208, 0.22); box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05), inset 0 1px 1px rgba(255, 255, 255, 0.9); display: inline-flex; align-items: center; gap: 0.8rem; min-width: 220px; backdrop-filter: blur(10px);">
            <span class="nav-icon-box icon-emerald" style="width: 36px; height: 36px; min-width: 36px; border-radius: 9px; box-shadow: 0 2px 8px rgba(16, 185, 129, 0.25); display: flex; align-items: center; justify-content: center;">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </span>
            <div style="display: flex; flex-direction: column; justify-content: center; text-align: right; gap: 2px;">
              <div style="display: flex; align-items: baseline; gap: 0.35rem;">
                <span style="font-size: 0.72rem; font-weight: 800; color: var(--md-sys-color-primary); white-space: nowrap;">مسؤول الموقع:</span>
                <span style="font-size: 0.92rem; font-weight: 900; color: var(--md-sys-color-on-surface); line-height: 1.2;">${manager ? manager.fullName : 'شاغر / غير محدد'}</span>
              </div>
              <div style="display: flex; align-items: baseline; gap: 0.35rem; border-top: 1px dashed rgba(0, 0, 0, 0.09); padding-top: 2px; margin-top: 1px;">
                <span style="font-size: 0.7rem; font-weight: 800; color: #d97706; white-space: nowrap;">وكيل المسؤول:</span>
                <span style="font-size: 0.85rem; font-weight: 800; color: #b45309; line-height: 1.2;">${deputyManager ? deputyManager.fullName : (station.deputyManagerName || 'قيد التكليف')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="tabs-header" style="margin-bottom: 1.5rem;">
      <button class="tab-btn ${activeSubTab === 'overview' ? 'active' : ''}" onclick="window.app.setStationSubTab('overview')">📊 <span>نظرة عامة والتقارير</span></button>
      <button class="tab-btn ${activeSubTab === 'documents' ? 'active' : ''}" onclick="window.app.setStationSubTab('documents')">📄 <span>الوثائق والمستندات</span> <span class="tab-count-badge">${stationDocs.length}</span></button>
      <button class="tab-btn ${activeSubTab === 'staff' ? 'active' : ''}" onclick="window.app.setStationSubTab('staff')">👥 <span>الكوادر العاملة</span> <span class="tab-count-badge">${stationStaff.length}</span></button>
      <button class="tab-btn ${activeSubTab === 'technical' ? 'active' : ''}" onclick="window.app.setStationSubTab('technical')">⚙️ <span>البيانات الفنية والتشغيل</span></button>
    </div>

    ${activeSubTab === 'overview' ? renderStationOverviewTab(station, section, stationDocs, stationStaff, user) : ''}
    ${activeSubTab === 'documents' ? renderStationDocsTab(station, stationDocs, user) : ''}
    ${activeSubTab === 'staff' ? renderStationStaffTab(station, stationStaff) : ''}
    ${activeSubTab === 'technical' ? renderStationTechnicalTab(station) : ''}
  `;
}

function renderStationOverviewTab(station, section, stationDocs, stationStaff, user) {
  return `
    <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 1.5rem; align-items: start;">
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">آخر تقارير ومستندات المحطة</h3>
          ${window.rbac.hasPermission(user, 'CREATE_DOCUMENT', station) ? `
            <button class="btn btn-glass-primary" onclick="window.app.openCreateWordDocModal('${station.id}')" title="إنشاء تقرير أو مستند جديد للمحطة">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 5v14M5 12h14"></path>
              </svg>
              <span>تقرير جديد</span>
              <span style="font-size: 1.05rem;">📄</span>
            </button>
          ` : ''}
        </div>
        
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>عنوان المستند</th>
                <th>النوع</th>
                <th>المنشئ</th>
                <th>التاريخ</th>
                <th>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              ${stationDocs.map(d => `
                <tr>
                  <td><a href="#" onclick="window.app.openViewDocumentModal('${d.id}')" style="font-weight: 600; color: var(--md-sys-color-primary);">${d.title}</a></td>
                  <td><span class="badge ${d.category === 'WORD' ? 'badge-info' : 'badge-success'}">${d.category}</span></td>
                  <td>${d.createdByName}</td>
                  <td>${new Date(d.createdAt).toLocaleDateString('ar-IQ')}</td>
                  <td><button class="btn-action-view" onclick="window.app.openViewDocumentModal('${d.id}')" title="معاينة المستند">معاينة</button></td>
                </tr>
              `).join('')}
              ${stationDocs.length === 0 ? '<tr><td colspan="5" style="text-align: center; color: var(--md-sys-color-outline); padding: 1.5rem;">لا توجد تقارير مسجلة لهذه المحطة حتى الآن</td></tr>' : ''}
            </tbody>
          </table>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h3 class="card-title">المؤشرات التشغيلية</h3>
        </div>
        <div style="display: flex; flex-direction: column; gap: 1.25rem;">
          <div>
            <div style="font-size: 0.8rem; color: var(--md-sys-color-outline); margin-bottom: 4px;">الطاقة الإنتاجية القصوى</div>
            <div style="font-weight: 800; font-size: 1.2rem; color: var(--md-sys-color-primary);">${station.capacity}</div>
          </div>
          <div>
            <div style="font-size: 0.8rem; color: var(--md-sys-color-outline); margin-bottom: 4px;">الحالة الفنية للتشغيل</div>
            <div><span class="badge badge-success">جاهزية تشغيلية كاملة</span></div>
          </div>
          <div>
            <div style="font-size: 0.8rem; color: var(--md-sys-color-outline); margin-bottom: 4px;">إجمالي الكادر المرتبط</div>
            <div style="font-weight: 700; font-size: 1.1rem;">${stationStaff.length} موظف وفني</div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderStationDocsTab(station, stationDocs, user) {
  return `
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">أرشيف وثائق ومستندات محطة ${station.name}</h3>
        ${window.rbac.hasPermission(user, 'CREATE_DOCUMENT', station) ? `
          <button class="btn btn-glass-primary" onclick="window.app.openCreateWordDocModal('${station.id}')" title="إضافة مستند أو تقرير جديد للمحطة">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 5v14M5 12h14"></path>
            </svg>
            <span>إضافة مستند جديد</span>
            <span style="font-size: 1.05rem;">📄</span>
          </button>
        ` : ''}
      </div>
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>العنوان</th>
              <th>التصنيف</th>
              <th>الإصدار</th>
              <th>الحالة</th>
              <th>تاريخ الإنشاء</th>
              <th>إجراءات</th>
            </tr>
          </thead>
          <tbody>
            ${stationDocs.map(d => `
              <tr>
                <td><strong>${d.title}</strong></td>
                <td><span class="badge ${d.category === 'WORD' ? 'badge-info' : 'badge-success'}">${d.category}</span></td>
                <td>v${d.version || '1.0'}</td>
                <td><span class="badge badge-success">معتمد</span></td>
                <td>${new Date(d.createdAt).toLocaleDateString('ar-IQ')}</td>
                <td>
                  <div style="display: flex; align-items: center; gap: 0.35rem;">
                    <button class="btn-action-view" onclick="window.app.openViewDocumentModal('${d.id}')" title="معاينة المستند">معاينة</button>
                    <button class="btn-action-export" onclick="window.app.exportDocumentFile('${d.id}')" title="تصدير المستند">تصدير</button>
                    <button class="btn-share-whatsapp" onclick="window.app.shareViaWhatsApp('${(d.title || '').replace(/'/g, "\\'")}')" title="مشاركة عبر واتساب">
                      <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
                        <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.196 8.196 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24zm4.52 11.66c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.02-1.25-.75-.67-1.26-1.5-1.41-1.75-.14-.25-.02-.39.11-.51.11-.11.25-.29.38-.44.13-.15.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.13.17 1.77 2.71 4.3 3.8.6.26 1.07.42 1.44.53.61.19 1.16.17 1.6-.1.49-.3 1.47-1.2 1.68-1.68.21-.48.21-.89.15-.98-.06-.09-.23-.15-.48-.27z"/>
                      </svg>
                    </button>
                    <button class="btn-share-email" onclick="window.app.shareViaOutlook('${(d.title || '').replace(/'/g, "\\'")}')" title="مشاركة عبر البريد الإلكتروني">
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="2" y="4" width="20" height="16" rx="3"></rect>
                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            `).join('')}
            ${stationDocs.length === 0 ? '<tr><td colspan="6" style="text-align: center; padding: 2rem;">لا توجد وثائق مسجلة للمحطة.</td></tr>' : ''}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderStationStaffTab(station, stationStaff) {
  return `
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">فريق العمل والكوادر الفنية في محطة ${station.name}</h3>
      </div>
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>الرقم الوظيفي</th>
              <th>الاسم الكامل</th>
              <th>المسمى الوظيفي</th>
              <th>الهاتف</th>
              <th>مستوى الصلاحية</th>
              <th>الحالة</th>
            </tr>
          </thead>
          <tbody>
            ${stationStaff.map(u => `
              <tr>
                <td><strong>${u.employeeId}</strong></td>
                <td>${u.fullName}</td>
                <td>${u.jobTitle}</td>
                <td>${u.phone || '-'}</td>
                <td><span class="badge ${window.rbac.getRoleInfo(u.role).badgeClass}">${window.rbac.getRoleInfo(u.role).name}</span></td>
                <td><span class="badge badge-success">نشط</span></td>
              </tr>
            `).join('')}
            ${stationStaff.length === 0 ? '<tr><td colspan="6" style="text-align: center; padding: 2rem;">لا توجد كوادر محددة لهذه المحطة حالياً.</td></tr>' : ''}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderStationTechnicalTab(station) {
  return `
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">المواصفات الفنية ومخطط التشغيل لمحطة ${station.name}</h3>
      </div>
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem;">
        <div style="padding: 1rem; border: 1px solid var(--md-sys-color-surface-variant); border-radius: var(--radius-md);">
          <div style="color: var(--md-sys-color-outline); font-size: 0.85rem;">رمز المحطة المؤسسي</div>
          <div style="font-size: 1.3rem; font-weight: 800; color: var(--md-sys-color-primary); margin-top: 4px;">${station.code}</div>
        </div>
        <div style="padding: 1rem; border: 1px solid var(--md-sys-color-surface-variant); border-radius: var(--radius-md);">
          <div style="color: var(--md-sys-color-outline); font-size: 0.85rem;">الطاقة التصميمية</div>
          <div style="font-size: 1.3rem; font-weight: 800; color: var(--md-sys-color-on-surface); margin-top: 4px;">${station.capacity}</div>
        </div>
        <div style="padding: 1rem; border: 1px solid var(--md-sys-color-surface-variant); border-radius: var(--radius-md);">
          <div style="color: var(--md-sys-color-outline); font-size: 0.85rem;">نظام المراقبة والتحكم</div>
          <div style="font-size: 1.1rem; font-weight: 700; color: var(--md-sys-color-success); margin-top: 4px;">نظام SCADA متصل ومستقر</div>
        </div>
      </div>
    </div>
  `;
}

window.renderStationWorkspaceView = renderStationWorkspaceView;
window.renderStationOverviewTab = renderStationOverviewTab;
window.renderStationDocsTab = renderStationDocsTab;
window.renderStationStaffTab = renderStationStaffTab;
window.renderStationTechnicalTab = renderStationTechnicalTab;