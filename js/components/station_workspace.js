/* ==========================================================================
   إدارة قسم الإنتاج الجنوبي - Station Workspace Component
   ========================================================================== */

function renderStationWorkspaceView(stationId) {
  const user = (window.auth && typeof window.auth.getCurrentUser === 'function') ? window.auth.getCurrentUser() : {};
  const db = (window.store && typeof window.store.getDb === 'function') ? window.store.getDb() : { stations: [], sections: [], documents: [], users: [] };
  const station = (db.stations || []).find(s => s.id === stationId);
  
  if (!station) {
    return `<div class="card" style="text-align:center; color:var(--md-sys-color-error); padding: 3rem;">
      <h2>⚠️ المحطة أو الموقع غير موجود</h2>
      <button class="btn btn-primary" onclick="window.app.navigate('sections')" style="margin-top: 1rem;">العودة إلى الشعب</button>
    </div>`;
  }

  const section = (db.sections || []).find(s => s.id === station.sectionId);
  const manager = window.store.getUserById ? window.store.getUserById(station.managerId) : null;
  const deputyManager = station.deputyManagerId 
    ? (window.store.getUserById ? window.store.getUserById(station.deputyManagerId) : null)
    : ((db.users || []).find(u => u.stationId === station.id && (u.role === 'DEPUTY_STATION_MANAGER' || u.role === 'STATION_SUPERVISOR')) || (station.deputyManagerName ? { fullName: station.deputyManagerName } : null));
  
  const stationDocs = (db.documents || []).filter(d => d.stationId === stationId || (d.sectionId === station.sectionId && d.stationName === station.name));
  
  // Unified Employee Roster / Master Records for Station Staff
  const masterRecords = (window.store && typeof window.store.getEmployeeMasterRecords === 'function')
    ? window.store.getEmployeeMasterRecords(station.departmentId || 'dept-south-prod')
    : [];
  
  let stationStaffList = masterRecords.filter(m => m.stationId === stationId || (m.sectionId === station.sectionId && m.station === station.name));
  if (stationStaffList.length === 0) {
    stationStaffList = (db.users || []).filter(u => u.stationId === stationId || (u.sectionId === station.sectionId && !u.stationId));
  }

  // Section notifications routed to this station (including forwarded dept directives)
  const sectionNotifs = (window.store && typeof window.store.getSectionNotifications === 'function')
    ? window.store.getSectionNotifications(station.sectionId, user)
    : [];
  const relevantSectionNotifs = sectionNotifs.filter(n => 
    n.targetStationId === 'ALL' || 
    !n.targetStationId || 
    n.targetStationId === station.id || 
    n.targetStationName === station.name
  );

  // Direct station-issued notifications to station staff
  const stationIssuedNotifs = (window.store && typeof window.store.getStationNotifications === 'function')
    ? window.store.getStationNotifications(station.id, user)
    : [];

  const totalStationNotifsCount = relevantSectionNotifs.length + stationIssuedNotifs.length;

  const isSpecializedSection = (station.sectionId === 'sec-3' || station.sectionId === 'sec-4');
  let activeSubTab = (window.app && window.app.currentStationSubTab) || 'staff';
  if (activeSubTab === 'overview') activeSubTab = 'staff';

  const stationTechStatuses = (window.store && typeof window.store.getTechnicalStatuses === 'function')
    ? window.store.getTechnicalStatuses(station.departmentId || 'dept-south-prod', { stationId: station.id }, user)
    : [];

  return `
    <div style="margin-bottom: 1.5rem;">
      <div style="display: flex; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; gap: 1.25rem;">
        <div style="flex: 1 1 320px; min-width: 280px;">
          <button class="btn btn-sm" onclick="window.app.navigate('section_workspace', '${station.sectionId || ''}')" 
                  style="margin-bottom: 0.65rem; border-radius: 10px; font-weight: 700; font-size: 0.84rem; background: var(--md-sys-color-surface); border: 1.5px solid var(--md-sys-color-surface-variant); color: var(--md-sys-color-primary); box-shadow: 0 2px 6px rgba(0,0,0,0.03); display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.4rem 0.85rem; cursor: pointer;">
            ← العودة إلى مساحة عمل ${section ? section.name : 'الشعبة'}
          </button>
          <div style="display: flex; align-items: center; gap: 0.6rem; flex-wrap: wrap;">
            <h2 style="font-size: 1.8rem; font-weight: 800; color: var(--md-sys-color-primary); margin: 0;">
              ${station.name}
            </h2>
            <span class="badge badge-primary" style="font-size: 0.82rem; padding: 0.25rem 0.65rem; font-weight: 800; border-radius: 999px;">
              ${section ? section.name : 'القسم'}
            </span>
            ${isSpecializedSection ? `
              <span class="badge badge-info" style="font-size: 0.8rem; padding: 0.25rem 0.65rem; font-weight: 800; border-radius: 999px;">
                ${station.sectionId === 'sec-3' ? '🧪 ممثلية المختبرات بالموقع' : '📏 فريق معايرة وقياس العدادات'}
              </span>
            ` : ''}
          </div>
          <p style="color: var(--md-sys-color-outline); font-size: 0.92rem; margin: 0.35rem 0 0 0; line-height: 1.5;">
            رمز المحطة: <strong>${station.code}</strong> | ${station.capacity ? `الطاقة / التخصص: <strong>${station.capacity}</strong>` : ''}
          </p>
        </div>
        
        <div style="display: flex; gap: 0.65rem; align-items: center; flex-wrap: wrap; margin-right: auto; justify-content: flex-end;">
          <!-- زر إضافة تقرير أو مستند فوري -->
          <button class="btn btn-glass-primary" onclick="window.app.openCreateWordDocModal('${station.id}')" title="إضافة تقرير فني أو مستند جديد للمحطة" style="padding: 0.5rem 1rem; font-weight: 800; border-radius: 12px; box-shadow: 0 4px 12px rgba(11,87,208,0.18);">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 5v14M5 12h14"></path>
            </svg>
            <span>إضافة تقرير أو مستند</span>
            <span style="font-size: 1.05rem;">📄</span>
          </button>

          <!-- بطاقة القيادة الإدارية للمحطات الإنتاجية القياسية فقط -->
          ${!isSpecializedSection ? `
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
          ` : ''}
        </div>
      </div>
    </div>

    ${isSpecializedSection ? `
      <!-- التبويبات الثلاثية المبسطة لشعبتي المختبرات والعدادات (الكوادر أولاً ثم البريد) -->
      <div class="tabs-header" style="margin-bottom: 1.5rem;">
        <button class="tab-btn ${activeSubTab === 'staff' ? 'active' : ''}" 
                onclick="window.app.setStationSubTab('staff')">
          👥 <span>الكوادر العاملة</span> 
          <span class="tab-count-badge">${stationStaffList.length}</span>
        </button>
        <button class="tab-btn ${activeSubTab === 'mail' ? 'active' : ''}" 
                onclick="window.app.setStationSubTab('mail')">
          📬 <span>البريد</span>
        </button>
        <button class="tab-btn ${activeSubTab === 'tech_status' ? 'active' : ''}" 
                onclick="window.app.setStationSubTab('tech_status')">
          ⚙️ <span>الموقف الفني</span> 
          <span class="tab-count-badge">${stationTechStatuses.length}</span>
        </button>
        <button class="tab-btn ${activeSubTab === 'notifs' ? 'active' : ''}" 
                onclick="window.app.setStationSubTab('notifs')">
          📢 <span>التبليغات</span> 
          <span class="tab-count-badge">${totalStationNotifsCount}</span>
        </button>
        <button class="tab-btn ${(activeSubTab === 'reports' || activeSubTab === 'documents') ? 'active' : ''}" 
                onclick="window.app.setStationSubTab('reports')">
          📄 <span>التقارير الفنية والمستندات</span> 
          <span class="tab-count-badge">${stationDocs.length}</span>
        </button>
      </div>

      ${activeSubTab === 'tech_status' ? (typeof window.renderStationTechnicalStatusTab === 'function' ? window.renderStationTechnicalStatusTab(station, section, user) : '') : ''}
      ${(activeSubTab === 'reports' || activeSubTab === 'documents') ? renderSpecializedStationReportsTab(station, section, stationDocs, user) : ''}
      ${activeSubTab === 'notifs' ? renderStationNotificationsTab(station, section, relevantSectionNotifs, stationIssuedNotifs, user) : ''}
      ${activeSubTab === 'staff' ? renderSpecializedStationStaffTab(station, section, stationStaffList) : ''}
      ${activeSubTab === 'mail' ? (typeof window.renderMailTab === 'function' ? window.renderMailTab({ level: 'station', id: station.id }) : '<div class="card" style="padding:2rem;text-align:center;">⏳ جاري تحميل نظام البريد...</div>') : ''}
    ` : `
      <!-- التبويبات القياسية لمحطات الشعب الإنتاجية الأولى والثانية (الكوادر أولاً ثم البريد) -->
      <div class="tabs-header" style="margin-bottom: 1.5rem;">
        <button class="tab-btn ${activeSubTab === 'staff' ? 'active' : ''}" onclick="window.app.setStationSubTab('staff')">👥 <span>الكوادر العاملة</span> <span class="tab-count-badge">${stationStaffList.length}</span></button>
        <button class="tab-btn ${activeSubTab === 'mail' ? 'active' : ''}" onclick="window.app.setStationSubTab('mail')">📬 <span>البريد</span></button>
        <button class="tab-btn ${activeSubTab === 'tech_status' ? 'active' : ''}" onclick="window.app.setStationSubTab('tech_status')">⚙️ <span>الموقف الفني</span> <span class="tab-count-badge">${stationTechStatuses.length}</span></button>
        <button class="tab-btn ${activeSubTab === 'notifs' ? 'active' : ''}" onclick="window.app.setStationSubTab('notifs')">📢 <span>التبليغات</span> <span class="tab-count-badge">${totalStationNotifsCount}</span></button>
        <button class="tab-btn ${activeSubTab === 'documents' ? 'active' : ''}" onclick="window.app.setStationSubTab('documents')">📄 <span>الوثائق والمستندات</span> <span class="tab-count-badge">${stationDocs.length}</span></button>
        <button class="tab-btn ${activeSubTab === 'technical' ? 'active' : ''}" onclick="window.app.setStationSubTab('technical')">⚙️ <span>البيانات الفنية والتشغيل</span></button>
      </div>

      ${activeSubTab === 'tech_status' ? (typeof window.renderStationTechnicalStatusTab === 'function' ? window.renderStationTechnicalStatusTab(station, section, user) : '') : ''}
      ${activeSubTab === 'notifs' ? renderStationNotificationsTab(station, section, relevantSectionNotifs, stationIssuedNotifs, user) : ''}
      ${activeSubTab === 'documents' ? renderStationDocsTab(station, stationDocs, user) : ''}
      ${activeSubTab === 'staff' ? renderStationStaffTab(station, stationStaffList) : ''}
      ${activeSubTab === 'technical' ? renderStationTechnicalTab(station, user) : ''}
      ${activeSubTab === 'mail' ? (typeof window.renderMailTab === 'function' ? window.renderMailTab({ level: 'station', id: station.id }) : '<div class="card" style="padding:2rem;text-align:center;">⏳ جاري تحميل نظام البريد...</div>') : ''}
    `}
  `;
}

// ==========================================================================
// 1. تبويب التقارير الفنية والمستندات المعتمدة لشعبتي المختبرات والعدادات
// ==========================================================================
function renderSpecializedStationReportsTab(station, section, stationDocs, user) {
  const isLab = station.sectionId === 'sec-3';
  const reportCategoryLabel = isLab ? 'فحوصات كيميائية ومياه وغاز' : 'معايرة وقياس العدادات';

  return `
    <div style="display: flex; flex-direction: column; gap: 1.5rem;">
      <!-- شريط العنوان والعمليات الفورية للتقارير -->
      <div class="card" style="border-right: 5px solid var(--md-sys-color-primary); background: linear-gradient(135deg, rgba(11, 87, 208, 0.04) 0%, rgba(2, 132, 199, 0.08) 100%);">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
          <div>
            <h3 style="font-size: 1.3rem; font-weight: 800; color: var(--md-sys-color-primary); margin: 0 0 4px 0; display: flex; align-items: center; gap: 0.5rem;">
              <span>📄</span>
              <span>التقارير الفنية والمستندات — ${station.name} (${section ? section.name : ''})</span>
            </h3>
            <p style="color: var(--md-sys-color-outline); margin: 0; font-size: 0.88rem;">
              أرشيف وتوثيق التقارير الفنية الصادرة، محاضر الفحص، وقراءات ${reportCategoryLabel} المعتمدة.
            </p>
          </div>
          <div style="display: flex; gap: 0.65rem; flex-wrap: wrap; align-items: center;">
            <button class="btn btn-glass-primary" onclick="window.app.openCreateWordDocModal('${station.id}')" title="إضافة تقرير أو مستند جديد">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 5v14M5 12h14"></path>
              </svg>
              <span>➕ إضافة تقرير أو مستند</span>
              <span style="font-size: 1.05rem;">📄</span>
            </button>
          </div>
        </div>
      </div>

      <!-- جدول التقارير والمستندات -->
      <div class="card">
        <div class="card-header" style="border-bottom: 1px solid var(--md-sys-color-surface-variant); padding-bottom: 0.75rem; margin-bottom: 1rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem;">
          <h3 class="card-title" style="font-size: 1.15rem; font-weight: 800; color: var(--md-sys-color-primary); margin: 0; display: flex; align-items: center; gap: 0.45rem;">
            <span>📋</span>
            <span>قائمة التقارير الفنية المسجلة (${stationDocs.length})</span>
          </h3>
          <span class="badge badge-info" style="font-size: 0.8rem; font-weight: 750;">
            📍 موقع: ${station.name}
          </span>
        </div>

        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>عنوان التقرير / المستند</th>
                <th>التصنيف الفني</th>
                <th>الجهة المصدرة</th>
                <th>تاريخ التوثيق</th>
                <th>الحالة</th>
                <th style="text-align: center;">الإجراءات المتاحة</th>
              </tr>
            </thead>
            <tbody>
              ${stationDocs.map(d => `
                <tr>
                  <td>
                    <a href="#" onclick="window.app.openViewDocumentModal('${d.id}')" style="font-weight: 750; color: var(--md-sys-color-primary); display: inline-flex; align-items: center; gap: 0.35rem;">
                      <span>📄</span>
                      <span>${d.title}</span>
                    </a>
                  </td>
                  <td><span class="badge ${d.category === 'WORD' ? 'badge-info' : 'badge-success'}">${d.category || 'تقرير فني'}</span></td>
                  <td><strong>${d.createdByName || (section ? section.name : 'الكادر الفني')}</strong></td>
                  <td>${new Date(d.createdAt || Date.now()).toLocaleDateString('ar-IQ')}</td>
                  <td><span class="badge badge-success">معتمد رسمياً</span></td>
                  <td>
                    <div style="display: flex; align-items: center; justify-content: center; gap: 0.35rem;">
                      <button class="btn-action-view" onclick="window.app.openViewDocumentModal('${d.id}')" title="معاينة التقرير">معاينة</button>
                      <button class="btn-action-export" onclick="window.app.exportDocumentFile('${d.id}')" title="تصدير المستند">تصدير</button>
                      <button class="btn-circle-whatsapp btn-share-whatsapp" onclick="window.app.shareViaWhatsApp('${(d.title || '').replace(/'/g, "\\'")}')" title="مشاركة عبر واتساب">
                        <svg viewBox="0 0 24 24" width="15" height="15" fill="#ffffff">
                          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                        </svg>
                      </button>
                      <button class="btn-circle-email btn-share-email" onclick="window.app.shareViaOutlook('${(d.title || '').replace(/'/g, "\\'")}')" title="مشاركة عبر البريد الإلكتروني">
                        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                          <rect x="2" y="4" width="20" height="16" rx="3"></rect>
                          <path d="M22 7l-10 7L2 7"></path>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              `).join('')}
              ${stationDocs.length === 0 ? `
                <tr>
                  <td colspan="6" style="text-align: center; color: var(--md-sys-color-outline); padding: 3rem 1rem;">
                    <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">📄</div>
                    <div style="font-weight: 800; font-size: 1.05rem; color: var(--md-sys-color-on-surface); margin-bottom: 0.35rem;">لا توجد تقارير أو مستندات مسجلة لهذه المحطة حتى الآن</div>
                    <p style="font-size: 0.85rem; max-width: 400px; margin: 0 auto 1rem auto; line-height: 1.5;">
                      يمكن إضافة تقارير الفحص المختبري، محاضر المعايرة، أو التقارير الفنية الدورية عبر الزر أدناه.
                    </p>
                    <button class="btn btn-glass-primary" onclick="window.app.openCreateWordDocModal('${station.id}')">
                      <span>➕ إضافة أول تقرير فني للمحطة</span>
                    </button>
                  </td>
                </tr>
              ` : ''}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

// ==========================================================================
// 2. تبويب التبليغات (الواردة من الشعبة والصادرة من المحطة)
// ==========================================================================
function renderStationNotificationsTab(station, section, relevantSectionNotifs = [], stationIssuedNotifs = [], user = {}) {
  const canPublishStation = ['SUPER_ADMIN', 'DEPT_MANAGER', 'SECTION_MANAGER', 'STATION_MANAGER', 'DEPUTY_STATION_MANAGER', 'STATION_SUPERVISOR', 'ADMINISTRATOR'].includes(user.role) ||
                            (user.stationId === station.id && ['STATION_MANAGER', 'DEPUTY_STATION_MANAGER', 'STATION_SUPERVISOR'].includes(user.role));

  const activeNotifSubTab = (window.app && window.app.currentStationNotifSubTab) || 'section';

  return `
    <div style="display: flex; flex-direction: column; gap: 1.25rem;">
      <!-- Sub-Tabs Navigation for Station Notifications -->
      <div class="tabs-header" style="margin-bottom: 0.5rem;">
        <button class="tab-btn ${activeNotifSubTab === 'section' ? 'active' : ''}" onclick="window.app.setStationNotifSubTab('section')" title="التبليغات والتعاميم والتوجيهات الواردة من إدارة الشعبة أو القسم">
          🏛️ <span>التبليغات الواردة من الشعبة</span> <span class="tab-count-badge">${relevantSectionNotifs.length}</span>
        </button>
        <button class="tab-btn ${activeNotifSubTab === 'station' ? 'active' : ''}" onclick="window.app.setStationNotifSubTab('station')" title="التبليغات والتعليمات الصادرة من مسؤول المحطة إلى الكادر">
          📢 <span>التبليغات الصادرة من المحطة</span> <span class="tab-count-badge">${stationIssuedNotifs.length}</span>
        </button>
      </div>

      ${activeNotifSubTab === 'section' ? `
        <!-- التبويب الفرعي الأول: التبليغات الواردة من الشعبة والقسم -->
        <div class="card" style="border-top: 4px solid var(--md-sys-color-primary);">
          <div class="card-header" style="flex-wrap: wrap; gap: 1rem; border-bottom: 1px solid var(--md-sys-color-surface-variant); padding-bottom: 1rem; margin-bottom: 1.25rem; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <h3 class="card-title" style="font-size: 1.25rem; font-weight: 800; color: var(--md-sys-color-primary); margin: 0 0 4px 0;">
                🏛️ التوجيهات والتبليغات الواردة من ${section ? section.name : 'الشعبة'} وإدارة القسم
              </h3>
              <p style="color: var(--md-sys-color-outline); font-size: 0.85rem; margin: 0;">
                التعاميم والتوجيهات التشغيلية والإدارية الموجهة لمحطة (${station.name}) أو المعممة على محطات الشعبة.
              </p>
            </div>
            <span class="badge badge-info" style="font-weight: 800; font-size: 0.85rem;">${relevantSectionNotifs.length} تبليغات واردة</span>
          </div>

          ${relevantSectionNotifs.length === 0 ? `
            <div style="text-align: center; padding: 3.5rem 1.5rem; background: var(--md-sys-color-background); border-radius: var(--radius-md); border: 2px dashed var(--md-sys-color-surface-variant);">
              <div style="font-size: 3rem; margin-bottom: 0.75rem;">📭</div>
              <h4 style="font-weight: 800; color: var(--md-sys-color-on-surface); margin-bottom: 0.5rem;">لا توجد تعاميم أو توجيهات واردة من الشعبة حالياً</h4>
              <p style="color: var(--md-sys-color-outline); font-size: 0.9rem; max-width: 500px; margin: 0 auto; line-height: 1.6;">
                سيتم عرض أي تعاميم أو توجيهات تشغيلية يتم إصدارها من قِبل مسؤول الشعبة أو تعميمها من إدارة القسم هنا فوراً.
              </p>
            </div>
          ` : `
            <div style="display: flex; flex-direction: column; gap: 1rem;">
              ${relevantSectionNotifs.map(n => {
                const isUrgent = n.priority === 'URGENT';
                const isHigh = n.priority === 'HIGH';
                const priorityBadge = isUrgent 
                  ? '<span class="badge badge-danger" style="font-weight: 800;">🚨 عاجل جداً</span>' 
                  : (isHigh ? '<span class="badge badge-warning" style="font-weight: 800;">⚠️ هام</span>' : '<span class="badge badge-info">ℹ️ اعتيادي</span>');
                
                const formattedDate = new Date(n.publishDate || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
                const isForwarded = n.sourceType === 'FORWARDED_FROM_DEPT' || n.isForwardedFromDept;

                return `
                  <div style="border: 1px solid var(--md-sys-color-surface-variant); border-right: 5px solid ${isUrgent ? 'var(--md-sys-color-error)' : (isHigh ? 'var(--md-sys-color-warning)' : 'var(--md-sys-color-primary)')}; border-radius: var(--radius-md); padding: 1.25rem; background: var(--md-sys-color-surface); box-shadow: var(--shadow-1);">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 0.75rem; margin-bottom: 0.75rem;">
                      <div>
                        <div style="display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap; margin-bottom: 0.35rem;">
                          ${priorityBadge}
                          <span class="badge badge-primary" style="font-size: 0.78rem;">📍 موجه إلى: ${n.targetStationId === 'ALL' || !n.targetStationId ? 'كافة محطات الشعبة' : station.name}</span>
                          ${isForwarded ? '<span class="badge badge-success" style="font-size: 0.78rem; font-weight:800;">🏛️ تعميم رسمي صادر من إدارة القسم</span>' : ''}
                          <span style="font-size: 0.78rem; color: var(--md-sys-color-outline); font-family: monospace;">📅 ${formattedDate}</span>
                        </div>
                        <h4 style="margin: 0; font-weight: 800; font-size: 1.15rem; color: var(--md-sys-color-on-surface);">
                          ${n.title}
                        </h4>
                      </div>
                      
                      <div style="display: flex; gap: 0.35rem; align-items: center;">
                        <button class="btn-action-view" onclick="window.app.viewSectionNotificationDetails('${n.id}')" title="معاينة التبليغ">معاينة</button>
                        <button class="btn-action-print" onclick="window.app.printSectionNotification('${n.id}')" title="طباعة التبليغ">طباعة</button>
                      </div>
                    </div>

                    ${isForwarded ? `
                      <div style="background: linear-gradient(135deg, rgba(11, 87, 208, 0.07) 0%, rgba(2, 132, 199, 0.04) 100%); border: 1.5px solid rgba(11, 87, 208, 0.22); border-radius: 10px; padding: 0.85rem 1rem; margin-bottom: 0.85rem;">
                        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 0.4rem;">
                          <div style="display: flex; align-items: center; gap: 0.45rem; font-weight: 800; color: var(--md-sys-color-primary); font-size: 0.88rem;">
                            <span>🏛️</span>
                            <span>كتاب / تعميم إدارة القسم المنشور عبر الشعبة</span>
                          </div>
                          ${n.originalDeptNotifNumber ? `<code style="font-size: 0.78rem; font-weight:700;">كود التوجيه: ${n.originalDeptNotifNumber}</code>` : ''}
                        </div>
                        ${n.sectionDirective ? `
                          <div style="background: rgba(245, 158, 11, 0.12); border-right: 3.5px solid #f59e0b; padding: 0.6rem 0.85rem; border-radius: 8px; font-size: 0.88rem; color: var(--md-sys-color-on-surface); line-height: 1.6; margin-top: 0.45rem;">
                            <strong style="color: #b45309; font-weight: 800;">📌 هامش وتوجيه مسؤول الشعبة:</strong> ${n.sectionDirective}
                          </div>
                        ` : ''}
                      </div>
                    ` : ''}

                    <div style="font-size: 0.94rem; line-height: 1.8; color: var(--md-sys-color-on-surface); background: var(--md-sys-color-background); padding: 0.9rem 1.1rem; border-radius: var(--radius-sm); margin-bottom: 0.75rem; white-space: pre-wrap; border: 1px solid var(--md-sys-color-surface-variant);">
                      ${n.content}
                    </div>

                    <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.78rem; color: var(--md-sys-color-outline);">
                      <div>✍️ <strong>المسؤول المُصدِر / المُعمِّم:</strong> ${n.createdByName || (section ? section.name : 'مسؤول الشعبة')}</div>
                      <div>🆔 كود التبليغ: <code>${n.id}</code></div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          `}
        </div>
      ` : `
        <!-- التبويب الفرعي الثاني: التبليغات الصادرة من المحطة -->
        <div class="card" style="border-top: 4px solid #f59e0b;">
          <div class="card-header" style="flex-wrap: wrap; gap: 1rem; border-bottom: 1px solid var(--md-sys-color-surface-variant); padding-bottom: 1rem; margin-bottom: 1.25rem; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <h3 class="card-title" style="font-size: 1.25rem; font-weight: 800; color: var(--md-sys-color-primary); margin: 0 0 4px 0;">
                📢 تبليغات وتوجيهات مسؤول المحطة إلى الكادر (${station.name})
              </h3>
              <p style="color: var(--md-sys-color-outline); font-size: 0.85rem; margin: 0;">
                التعليمات الداخلية وجداول المناوبة وتوجيهات السلامة الصادرة من إدارة الموقع لكادر ونوبات المحطة.
              </p>
            </div>
            ${canPublishStation ? `
              <button class="btn btn-glass-amber" onclick="window.app.openCreateStationNotificationModal('${station.id}')" title="إصدار تبليغ وتوجيه جديد لكادر المحطة">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 5v14M5 12h14"></path>
                </svg>
                <span>إصدار تبليغ لكادر المحطة</span>
                <span style="font-size: 1.05rem;">📢</span>
              </button>
            ` : ''}
          </div>

          ${stationIssuedNotifs.length === 0 ? `
            <div style="text-align: center; padding: 3.5rem 1.5rem; background: var(--md-sys-color-background); border-radius: var(--radius-md); border: 2px dashed var(--md-sys-color-surface-variant);">
              <div style="font-size: 3rem; margin-bottom: 0.75rem;">📢</div>
              <h4 style="font-weight: 800; color: var(--md-sys-color-on-surface); margin-bottom: 0.5rem;">لا توجد تبليغات داخلية صادرة من المحطة حالياً</h4>
              <p style="color: var(--md-sys-color-outline); font-size: 0.9rem; max-width: 500px; margin: 0 auto 1.25rem auto; line-height: 1.6;">
                يمكن لمسؤول الموقع أو المشرفين إصدار توجيهات فورية، تنظيم جداول المناوبات، أو تعليمات السلامة الموقعية لكافة الكوادر.
              </p>
              ${canPublishStation ? `
                <button class="btn btn-glass-amber" onclick="window.app.openCreateStationNotificationModal('${station.id}')">
                  <span>إصدار أول تبليغ رسمي لكادر المحطة</span>
                  <span style="font-size: 1.05rem;">📢</span>
                </button>
              ` : ''}
            </div>
          ` : `
            <div style="display: flex; flex-direction: column; gap: 1rem;">
              ${stationIssuedNotifs.map(n => {
                const isUrgent = n.priority === 'URGENT';
                const isHigh = n.priority === 'HIGH';
                const priorityBadge = isUrgent 
                  ? '<span class="badge badge-danger" style="font-weight: 800;">🚨 عاجل جداً</span>' 
                  : (isHigh ? '<span class="badge badge-warning" style="font-weight: 800;">⚠️ هام</span>' : '<span class="badge badge-info">ℹ️ اعتيادي</span>');
                
                const scopeText = n.targetScope === 'SHIFT_A' ? 'الوجبة A' :
                                  (n.targetScope === 'SHIFT_B' ? 'الوجبة B' :
                                  (n.targetScope === 'SHIFT_C' ? 'الوجبة C' :
                                  (n.targetScope === 'DAY_SHIFT' ? 'الكادر النهاري' :
                                  (n.targetScope === 'MAINTENANCE' ? 'فريق الصيانة' :
                                  (n.targetScope === 'SAFETY' ? 'فريق السلامة والأمن' : '👥 كافة كادر ونوبات المحطة')))));

                const formattedDate = new Date(n.publishDate || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

                return `
                  <div style="border: 1px solid var(--md-sys-color-surface-variant); border-right: 5px solid ${isUrgent ? 'var(--md-sys-color-error)' : (isHigh ? 'var(--md-sys-color-warning)' : 'var(--md-sys-color-primary)')}; border-radius: var(--radius-md); padding: 1.25rem; background: var(--md-sys-color-surface); box-shadow: var(--shadow-1);">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 0.75rem; margin-bottom: 0.75rem;">
                      <div>
                        <div style="display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap; margin-bottom: 0.35rem;">
                          ${priorityBadge}
                          <span class="badge badge-secondary" style="font-size: 0.78rem;">🎯 النطاق: ${scopeText}</span>
                          ${n.docNumber ? `
                            <span style="font-family: monospace; font-size: 0.76rem; font-weight: 800; color: #003366; background: rgba(0,51,102,0.08); border: 1px solid rgba(0,51,102,0.2); padding: 1px 6px; border-radius: 4px;">
                              📋 العدد: ${n.docNumber}
                            </span>
                          ` : ''}
                          <span style="font-size: 0.78rem; color: var(--md-sys-color-outline); font-family: monospace;">📅 ${formattedDate}</span>
                        </div>
                        <h4 style="margin: 0; font-weight: 800; font-size: 1.15rem; color: var(--md-sys-color-on-surface);">
                          ${n.title}
                        </h4>
                      </div>
                      
                      <div style="display: flex; gap: 0.35rem; align-items: center; flex-wrap: wrap;">
                        ${n.docNumber ? `
                          <button class="btn btn-sm btn-outline" onclick="window.app.openVerifyCorrespondenceModal('${n.docNumber}')" title="فحص صحة الصدور والباركود" style="font-size: 0.78rem; padding: 2px 7px; border-color: #0284c7; color: #0284c7;">
                            🔍 صحة الصدور
                          </button>
                        ` : ''}
                        <button class="btn-action-view" onclick="window.app.viewStationNotificationDetails('${n.id}')" title="معاينة التبليغ">معاينة</button>
                        <button class="btn-action-print" onclick="window.app.printStationNotification('${n.id}')" title="طباعة التبليغ">طباعة</button>
                        ${canPublishStation ? `
                          <button class="btn-action-trash" onclick="window.app.handleDeleteStationNotification('${n.id}', '${station.id}')" title="حذف التبليغ">
                            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                              <polyline points="3 6 5 6 21 6"></polyline>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                          </button>
                        ` : ''}
                      </div>
                    </div>

                    <div style="font-size: 0.94rem; line-height: 1.8; color: var(--md-sys-color-on-surface); background: var(--md-sys-color-background); padding: 0.9rem 1.1rem; border-radius: var(--radius-sm); margin-bottom: 0.75rem; white-space: pre-wrap; border: 1px solid var(--md-sys-color-surface-variant);">
                      ${n.content}
                    </div>

                    <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.78rem; color: var(--md-sys-color-outline);">
                      <div>✍️ <strong>المسؤول المُصدِر:</strong> ${n.createdByName || 'مسؤول المحطة'} ${n.createdByRole ? `(${n.createdByRole})` : ''}</div>
                      <div>🆔 كود التبليغ: <code>${n.id}</code></div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          `}
        </div>
      `}
    </div>
  `;
}

// Backward compatibility alias
function renderSpecializedStationNotifsTab(station, section, relevantNotifs, user) {
  const stationIssuedNotifs = (window.store && typeof window.store.getStationNotifications === 'function')
    ? window.store.getStationNotifications(station.id, user)
    : [];
  return renderStationNotificationsTab(station, section, relevantNotifs, stationIssuedNotifs, user);
}

// ==========================================================================
// 3. تبويب الكوادر الفنية العاملة بالموقع
// ==========================================================================
function renderSpecializedStationStaffTab(station, section, stationStaffList) {
  return `
    <div class="card">
      <div class="card-header" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; border-bottom: 1px solid var(--md-sys-color-surface-variant); padding-bottom: 0.75rem; margin-bottom: 1rem;">
        <div>
          <h3 class="card-title" style="font-size: 1.2rem; font-weight: 800; color: var(--md-sys-color-primary); margin: 0 0 4px 0;">
            👥 الكوادر الفنية وممثلو ${section ? section.name : 'الشعبة'} في ${station.name}
          </h3>
          <p style="color: var(--md-sys-color-outline); font-size: 0.82rem; margin: 0;">
            سجل الكادر المتواجد في الموقع للفحوصات والمعايرة والمتابعة الفنية.
          </p>
        </div>
        <div style="display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap;">
          <span class="badge badge-primary" style="font-size: 0.85rem; padding: 0.4rem 0.8rem;">
            👥 إجمالي الكادر: ${stationStaffList.length} موظف وفني
          </span>
          <button class="btn btn-glass-primary" onclick="window.app.openCustomStaffExportModal({ stationId: '${station.id}', sectionId: '${station.sectionId || ''}', scopeType: 'STATION' })" title="اضبارة المحطة المركزية - تصدير وطباعة بيانات كادر ${station.name} (Excel, Word, PDF)" style="padding: 0.35rem 0.85rem; font-size: 0.84rem;">
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            <span>اضبارة المحطة المركزية</span>
            <span style="font-size: 0.95rem;">⚡</span>
          </button>
        </div>
      </div>

      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>الرقم الوظيفي</th>
              <th>الاسم الكامل</th>
              <th>العنوان الوظيفي والدرجة</th>
              <th>الشفت / الوجبة</th>
              <th>التحصيل والتخصص</th>
              <th>رقم الهاتف</th>
              <th>الحالة</th>
            </tr>
          </thead>
          <tbody>
            ${stationStaffList.map(u => `
              <tr>
                <td><strong>${u.employeeId || u.id}</strong></td>
                <td>
                  <div style="font-weight: 800; color: var(--md-sys-color-primary); font-size: 0.92rem;">
                    ${u.fullName || u.name}
                  </div>
                </td>
                <td>
                  <div>${u.jobTitle || 'فني'}</div>
                  ${u.jobGrade ? `<span style="font-size: 0.75rem; color: var(--md-sys-color-outline);">الدرجة ${u.jobGrade}</span>` : ''}
                </td>
                <td>
                  <span class="badge ${u.workShift === 'نهاري' || u.shift === 'نهاري' ? 'badge-secondary' : 'badge-info'}" style="font-weight: 750;">
                    ${u.workShift || u.assignedShift || u.shift || 'وجبة A'}
                  </span>
                </td>
                <td>${u.degree || u.qualification || 'دبلوم فني'}</td>
                <td style="font-family: monospace;">${u.phone || '0770XXXXXXX'}</td>
                <td><span class="badge badge-success">نشط بالخدمة</span></td>
              </tr>
            `).join('')}
            ${stationStaffList.length === 0 ? `
              <tr>
                <td colspan="7" style="text-align: center; color: var(--md-sys-color-outline); padding: 2.5rem;">
                  لا توجد كوادر محددة مسجلة في هذا الموقع حالياً.
                </td>
              </tr>
            ` : ''}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// ==========================================================================
// الدوال القياسية لمحطات الشعب الإنتاجية الأولى والثانية (Sec-1 & Sec-2)
// ==========================================================================
function renderStationOverviewTab(station, section, stationDocs, stationStaff, user) {
  return `
    <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 1.5rem; align-items: start;">
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">آخر تقارير ومستندات المحطة</h3>
          ${window.rbac && window.rbac.hasPermission(user, 'CREATE_DOCUMENT', station) ? `
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
                  <td><span class="badge ${d.category === 'WORD' ? 'badge-info' : 'badge-success'}">${d.category || 'تقرير'}</span></td>
                  <td>${d.createdByName || 'الكادر'}</td>
                  <td>${new Date(d.createdAt || Date.now()).toLocaleDateString('ar-IQ')}</td>
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
        ${window.rbac && window.rbac.hasPermission(user, 'CREATE_DOCUMENT', station) ? `
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
                <td><span class="badge ${d.category === 'WORD' ? 'badge-info' : 'badge-success'}">${d.category || 'تقرير'}</span></td>
                <td>v${d.version || '1.0'}</td>
                <td><span class="badge badge-success">معتمد</span></td>
                <td>${new Date(d.createdAt || Date.now()).toLocaleDateString('ar-IQ')}</td>
                <td>
                  <div style="display: flex; align-items: center; gap: 0.35rem;">
                    <button class="btn-action-view" onclick="window.app.openViewDocumentModal('${d.id}')" title="معاينة المستند">معاينة</button>
                    <button class="btn-action-export" onclick="window.app.exportDocumentFile('${d.id}')" title="تصدير المستند">تصدير</button>
                    <button class="btn-circle-whatsapp btn-share-whatsapp" onclick="window.app.shareViaWhatsApp('${(d.title || '').replace(/'/g, "\\'")}')" title="مشاركة عبر واتساب">
                      <svg viewBox="0 0 24 24" width="15" height="15" fill="#ffffff">
                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                      </svg>
                    </button>
                    <button class="btn-circle-email btn-share-email" onclick="window.app.shareViaOutlook('${(d.title || '').replace(/'/g, "\\'")}')" title="مشاركة عبر البريد الإلكتروني">
                      <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="2" y="4" width="20" height="16" rx="3"></rect>
                        <path d="M22 7l-10 7L2 7"></path>
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
      <div class="card-header" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
        <h3 class="card-title">فريق العمل والكوادر الفنية في محطة ${station.name}</h3>
        <div style="display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap;">
          <span class="badge badge-primary" style="font-size: 0.85rem; padding: 0.4rem 0.8rem;">
            👥 كادر المحطة: ${stationStaff.length} موظف
          </span>
          <button class="btn btn-glass-primary" onclick="window.app.openCustomStaffExportModal({ stationId: '${station.id}', sectionId: '${station.sectionId || ''}', scopeType: 'STATION' })" title="اضبارة المحطة المركزية - تصدير وطباعة بيانات كادر ${station.name} (Excel, Word, PDF)" style="padding: 0.35rem 0.85rem; font-size: 0.84rem;">
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            <span>اضبارة المحطة المركزية</span>
            <span style="font-size: 0.95rem;">⚡</span>
          </button>
        </div>
      </div>
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>الرقم الوظيفي</th>
              <th>الاسم الكامل</th>
              <th>العنوان الوظيفي</th>
              <th>الهاتف</th>
              <th>مستوى الصلاحية</th>
              <th>الحالة</th>
            </tr>
          </thead>
          <tbody>
            ${stationStaff.map(u => `
              <tr>
                <td><strong>${u.employeeId || u.id}</strong></td>
                <td>${u.fullName || u.name}</td>
                <td>${u.jobTitle || 'فني'}</td>
                <td>${u.phone || '-'}</td>
                <td><span class="badge ${window.rbac && window.rbac.getRoleInfo ? window.rbac.getRoleInfo(u.role).badgeClass : 'badge-info'}">${window.rbac && window.rbac.getRoleInfo ? window.rbac.getRoleInfo(u.role).name : 'كادر فني'}</span></td>
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

function renderStationTechnicalTab(station, user) {
  const profile = (window.store && typeof window.store.getStationTechnicalProfile === 'function')
    ? window.store.getStationTechnicalProfile(station.id)
    : (station.technicalProfile || {});

  const currentUser = user || ((window.auth && typeof window.auth.getCurrentUser === 'function') ? window.auth.getCurrentUser() : {});

  const canEditTech = Boolean(
    currentUser && (
      ['SUPER_ADMIN', 'DEPT_MANAGER', 'DEPT_DEPUTY', 'ADMINISTRATOR'].includes(currentUser.role) ||
      (currentUser.sectionId === station.sectionId && ['SECTION_HEAD', 'SECTION_MANAGER'].includes(currentUser.role)) ||
      (currentUser.stationId === station.id) ||
      (currentUser.id === station.managerId) ||
      (currentUser.id === station.deputyManagerId)
    )
  );

  const wells = profile.wells || {};
  const manifolds = profile.manifolds || {};
  const banks = profile.banks || {};
  const banksList = banks.banksList || [];
  const rotating = profile.rotatingEquipment || {};
  const control = profile.controlSystem || {};
  const salts = profile.salts || {};
  const power = profile.powerAndFuel || {};
  const compressors = profile.compressors || {};
  const customFields = profile.customFields || [];

  const fuelPct = Number(power.fuelPercentage) || 0;
  const fuelColor = fuelPct >= 70 ? '#10b981' : (fuelPct >= 35 ? '#f59e0b' : '#ef4444');

  const dcsBadge = control.type === 'FULL_DCS' 
    ? '<span class="badge badge-success" style="font-size:0.85rem; padding:0.35rem 0.75rem;">🟢 نظام DCS كلي (تغطية شاملة للموقع)</span>'
    : (control.type === 'PARTIAL_DCS' 
      ? '<span class="badge badge-warning" style="font-size:0.85rem; padding:0.35rem 0.75rem;">🟡 نظام DCS جزئي (مراقبة تشغيلية)</span>'
      : '<span class="badge badge-secondary" style="font-size:0.85rem; padding:0.35rem 0.75rem;">⚪ نظام سيطرة ومراقبة تقليدي</span>');

  const formattedUpdateDate = profile.lastUpdated
    ? new Date(profile.lastUpdated).toLocaleString('ar-IQ', { dateStyle: 'medium', timeStyle: 'short' })
    : 'بيانات تأسيسية أولية';

  return `
    <div style="display: flex; flex-direction: column; gap: 1.5rem;">

      <!-- شريط العنوان والعمليات الفنية للمحطة -->
      <div class="card" style="border-right: 5px solid var(--md-sys-color-primary); background: linear-gradient(135deg, rgba(11, 87, 208, 0.05) 0%, rgba(245, 158, 11, 0.04) 100%);">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1.25rem;">
          <div>
            <div style="display: flex; align-items: center; gap: 0.6rem; margin-bottom: 0.35rem; flex-wrap: wrap;">
              <h3 style="font-size: 1.35rem; font-weight: 900; color: var(--md-sys-color-primary); margin: 0; display: flex; align-items: center; gap: 0.5rem;">
                <span>⚙️</span>
                <span>المواصفات والبيانات الفنية والتشغيلية المعتمدة — ${station.name} (${station.code})</span>
              </h3>
              ${dcsBadge}
            </div>
            <p style="color: var(--md-sys-color-outline); margin: 0; font-size: 0.88rem; line-height: 1.5;">
              السجل الفني والهندسي لآبار المحطة، الضفاف، المضخات، التوربينات، ونوعية النفط المصدر.
            </p>
          </div>

          <div style="display: flex; gap: 0.65rem; align-items: center; flex-wrap: wrap;">
            <span style="font-size: 0.8rem; color: var(--md-sys-color-outline); background: var(--md-sys-color-surface); padding: 0.4rem 0.75rem; border-radius: 8px; border: 1px solid var(--md-sys-color-surface-variant);">
              🕒 <strong>آخر تحديث:</strong> ${formattedUpdateDate} (${profile.updatedByName || 'مسؤول الموقع'})
            </span>
            ${canEditTech ? `
              <button class="btn btn-glass-amber" onclick="window.app.openEditStationTechnicalModal('${station.id}')" title="تحديث وتعديل البيانات الفنية والتشغيلية للمحطة" style="padding: 0.45rem 1.1rem; font-weight: 800;">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
                <span>تحديث المواصفات الفنية</span>
                <span style="font-size: 1.05rem;">✏️</span>
              </button>
            ` : ''}
          </div>
        </div>
      </div>

      <!-- 1. إحصائيات الآبار والدمامات ومجمعات الإنتاج -->
      <div class="card">
        <div class="card-header" style="border-bottom: 1px solid var(--md-sys-color-surface-variant); padding-bottom: 0.75rem; margin-bottom: 1.25rem;">
          <h4 style="margin: 0; font-size: 1.15rem; font-weight: 800; color: var(--md-sys-color-primary); display: flex; align-items: center; gap: 0.45rem;">
            <span>🛢️</span>
            <span>منظومة الآبار، الدمامات، ومجمعات الإنتاج</span>
          </h4>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 1rem;">
          <div style="padding: 1rem; background: rgba(16, 185, 129, 0.08); border: 1.5px solid rgba(16, 185, 129, 0.3); border-radius: 12px; text-align: center;">
            <div style="font-size: 0.82rem; color: #059669; font-weight: 700; margin-bottom: 4px;">🟢 الآبار العاملة</div>
            <div style="font-size: 1.7rem; font-weight: 900; color: #059669;">${wells.operating ?? 0} <span style="font-size: 0.85rem; font-weight: 600;">بئر</span></div>
          </div>

          <div style="padding: 1rem; background: rgba(239, 68, 68, 0.08); border: 1.5px solid rgba(239, 68, 68, 0.3); border-radius: 12px; text-align: center;">
            <div style="font-size: 0.82rem; color: #dc2626; font-weight: 700; margin-bottom: 4px;">🔴 الآبار المتوقفة</div>
            <div style="font-size: 1.7rem; font-weight: 900; color: #dc2626;">${wells.stopped ?? 0} <span style="font-size: 0.85rem; font-weight: 600;">بئر</span></div>
          </div>

          <div style="padding: 1rem; background: rgba(11, 87, 208, 0.08); border: 1.5px solid rgba(11, 87, 208, 0.3); border-radius: 12px; text-align: center;">
            <div style="font-size: 0.82rem; color: var(--md-sys-color-primary); font-weight: 700; margin-bottom: 4px;">🔵 إجمالي الآبار المربوطة</div>
            <div style="font-size: 1.7rem; font-weight: 900; color: var(--md-sys-color-primary);">${wells.total ?? 0} <span style="font-size: 0.85rem; font-weight: 600;">بئر</span></div>
          </div>

          <div style="padding: 1rem; background: rgba(245, 158, 11, 0.08); border: 1.5px solid rgba(245, 158, 11, 0.3); border-radius: 12px; text-align: center;">
            <div style="font-size: 0.82rem; color: #d97706; font-weight: 700; margin-bottom: 4px;">🎛️ عدد الدمامات (Manifolds)</div>
            <div style="font-size: 1.7rem; font-weight: 900; color: #d97706;">${manifolds.count ?? 0}</div>
          </div>

          <div style="padding: 1rem; background: rgba(139, 92, 246, 0.08); border: 1.5px solid rgba(139, 92, 246, 0.3); border-radius: 12px; text-align: center;">
            <div style="font-size: 0.82rem; color: #7c3aed; font-weight: 700; margin-bottom: 4px;">🔀 مجمعات الآبار (Gathering Headers)</div>
            <div style="font-size: 1.7rem; font-weight: 900; color: #7c3aed;">${manifolds.gatheringHeaders ?? 0}</div>
          </div>
        </div>

        ${wells.notes ? `
          <div style="font-size: 0.86rem; color: var(--md-sys-color-outline); background: var(--md-sys-color-background); padding: 0.6rem 0.85rem; border-radius: 8px; border: 1px solid var(--md-sys-color-surface-variant);">
            📝 <strong>ملاحظات الآبار:</strong> ${wells.notes}
          </div>
        ` : ''}
      </div>

      <!-- 2. الضفاف والطاقات الإنتاجية الكلية والنوعية -->
      <div class="card">
        <div class="card-header" style="border-bottom: 1px solid var(--md-sys-color-surface-variant); padding-bottom: 0.75rem; margin-bottom: 1.25rem;">
          <h4 style="margin: 0; font-size: 1.15rem; font-weight: 800; color: var(--md-sys-color-primary); display: flex; align-items: center; gap: 0.45rem;">
            <span>🏭</span>
            <span>الضفاف والقدرات التصميمية والتشغيلية الكلية (نفط / ماء / غاز)</span>
          </h4>
        </div>

        <!-- ملخص الطاقات الكلية -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; margin-bottom: 1.5rem;">
          <div style="padding: 1.1rem; border-radius: 14px; background: linear-gradient(135deg, rgba(11, 87, 208, 0.1) 0%, rgba(2, 132, 199, 0.05) 100%); border: 1.5px solid rgba(11, 87, 208, 0.25);">
            <div style="font-size: 0.82rem; font-weight: 700; color: var(--md-sys-color-primary); margin-bottom: 4px;">🛢️ الطاقة الكلية المقررة للنفط</div>
            <div style="font-size: 1.45rem; font-weight: 900; color: var(--md-sys-color-on-surface);">${banks.totalOilCapacity || station.capacity || 'غير محدد'}</div>
          </div>

          <div style="padding: 1.1rem; border-radius: 14px; background: linear-gradient(135deg, rgba(14, 165, 233, 0.1) 0%, rgba(6, 182, 212, 0.05) 100%); border: 1.5px solid rgba(14, 165, 233, 0.25);">
            <div style="font-size: 0.82rem; font-weight: 700; color: #0284c7; margin-bottom: 4px;">💧 الطاقة الكلية للماء المنتج المصاحب</div>
            <div style="font-size: 1.45rem; font-weight: 900; color: var(--md-sys-color-on-surface);">${banks.totalWaterCapacity || 'غير محدد'}</div>
          </div>

          <div style="padding: 1.1rem; border-radius: 14px; background: linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(217, 119, 6, 0.05) 100%); border: 1.5px solid rgba(245, 158, 11, 0.25);">
            <div style="font-size: 0.82rem; font-weight: 700; color: #d97706; margin-bottom: 4px;">🔥 الطاقة الكلية للغاز المصاحب</div>
            <div style="font-size: 1.45rem; font-weight: 900; color: var(--md-sys-color-on-surface);">${banks.totalGasCapacity || 'غير محدد'}</div>
          </div>

          <div style="padding: 1.1rem; border-radius: 14px; background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.05) 100%); border: 1.5px solid rgba(16, 185, 129, 0.25);">
            <div style="font-size: 0.82rem; font-weight: 700; color: #059669; margin-bottom: 4px;">🔢 إجمالي عدد الضفاف العازلة</div>
            <div style="font-size: 1.45rem; font-weight: 900; color: #059669;">${banks.count ?? banksList.length} ضفاف</div>
          </div>
        </div>

        <!-- جدول تفاصيل الضفاف والأملاح لكل ضفة -->
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>تسمية الضفة العازلة</th>
                <th>الطاقة الاستيعابية للضفة</th>
                <th>نسبة وتركيز الأملاح في الضفة</th>
              </tr>
            </thead>
            <tbody>
              ${banksList.map(b => `
                <tr>
                  <td><strong>${b.name || 'ضفة إنتاجية'}</strong></td>
                  <td><span class="badge badge-primary" style="font-size:0.85rem;">${b.capacity || '-'}</span></td>
                  <td><span class="badge badge-warning" style="font-size:0.85rem; font-family:monospace;">${b.salts || '-'}</span></td>
                </tr>
              `).join('')}
              ${banksList.length === 0 ? '<tr><td colspan="3" style="text-align:center; padding:1.5rem; color:var(--md-sys-color-outline);">لم يتم تحديد تفاصيل الضفاف الفردية بعد.</td></tr>' : ''}
            </tbody>
          </table>
        </div>
      </div>

      <!-- 3. شبكة المعدات الدوارة، التحكم DCS، والأملاح -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap: 1.5rem;">

        <!-- بطاقة المعدات الدوارة والمضخات -->
        <div class="card" style="display: flex; flex-direction: column; gap: 1rem;">
          <div class="card-header" style="border-bottom: 1px solid var(--md-sys-color-surface-variant); padding-bottom: 0.65rem; margin-bottom: 0.25rem;">
            <h4 style="margin: 0; font-size: 1.1rem; font-weight: 800; color: var(--md-sys-color-primary); display: flex; align-items: center; gap: 0.45rem;">
              <span>⚙️</span>
              <span>المعدات الدوارة والمضخات والتوربينات</span>
            </h4>
          </div>

          <div style="padding: 0.85rem 1rem; border: 1px solid var(--md-sys-color-surface-variant); border-radius: 10px; background: var(--md-sys-color-surface);">
            <div style="font-size: 0.8rem; color: var(--md-sys-color-outline); margin-bottom: 2px;">مضخات المين بم (Main Export Pumps):</div>
            <div style="font-weight: 800; color: var(--md-sys-color-on-surface);">${rotating.mainPumps || 'غير محدد'}</div>
          </div>

          <div style="padding: 0.85rem 1rem; border: 1px solid var(--md-sys-color-surface-variant); border-radius: 10px; background: var(--md-sys-color-surface);">
            <div style="font-size: 0.8rem; color: var(--md-sys-color-outline); margin-bottom: 2px;">مضخات البوسترات (Booster Pumps):</div>
            <div style="font-weight: 800; color: var(--md-sys-color-on-surface);">${rotating.boosterPumps || 'غير محدد'}</div>
          </div>

          <div style="padding: 0.85rem 1rem; border: 1px solid var(--md-sys-color-surface-variant); border-radius: 10px; background: var(--md-sys-color-surface);">
            <div style="font-size: 0.8rem; color: var(--md-sys-color-outline); margin-bottom: 2px;">التوربينات (Turbines):</div>
            <div style="font-weight: 800; color: var(--md-sys-color-on-surface);">${rotating.turbines || 'غير محدد'}</div>
          </div>
        </div>

        <!-- بطاقة الأملاح وفحص الخط الرئيسي MAIN LINE -->
        <div class="card" style="display: flex; flex-direction: column; gap: 1rem; border-top: 3.5px solid #d97706;">
          <div class="card-header" style="border-bottom: 1px solid var(--md-sys-color-surface-variant); padding-bottom: 0.65rem; margin-bottom: 0.25rem;">
            <h4 style="margin: 0; font-size: 1.1rem; font-weight: 800; color: #d97706; display: flex; align-items: center; gap: 0.45rem;">
              <span>🧪</span>
              <span>الأملاح وجودة النفط وفحص الخط الرئيسي (MAIN LINE)</span>
            </h4>
          </div>

          <div style="padding: 1rem; border-radius: 12px; background: linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(217, 119, 6, 0.05) 100%); border: 1.5px solid rgba(245, 158, 11, 0.35);">
            <div style="font-size: 0.8rem; color: #b45309; font-weight: 800; margin-bottom: 4px;">⚡ الأملاح عند خط التصدير الرئيسي (MAIN LINE):</div>
            <div style="font-size: 1.6rem; font-weight: 900; color: #b45309; font-family: monospace;">${salts.mainLineSalts || 'غير محدد'}</div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
            <div style="padding: 0.75rem; border: 1px solid var(--md-sys-color-surface-variant); border-radius: 10px; background: var(--md-sys-color-surface);">
              <div style="font-size: 0.78rem; color: var(--md-sys-color-outline);">متوسط أملاح الضفاف:</div>
              <div style="font-weight: 800; color: var(--md-sys-color-on-surface); font-family: monospace;">${salts.banksAverage || '-'}</div>
            </div>
            <div style="padding: 0.75rem; border: 1px solid var(--md-sys-color-surface-variant); border-radius: 10px; background: var(--md-sys-color-surface);">
              <div style="font-size: 0.78rem; color: var(--md-sys-color-outline);">نسبة الرواسب والماء (BS&W):</div>
              <div style="font-weight: 800; color: var(--md-sys-color-on-surface); font-family: monospace;">${salts.bsw || '-'}</div>
            </div>
          </div>

          ${salts.notes ? `<div style="font-size: 0.82rem; color: var(--md-sys-color-outline);">📌 ${salts.notes}</div>` : ''}
        </div>

      </div>

      <!-- 4. الطاقة والمولدات والوقود + الضاغطات والديزل الاحتياطي -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap: 1.5rem;">

        <!-- بطاقة الطاقة وخزين الكاز (وقود الديزل) -->
        <div class="card" style="display: flex; flex-direction: column; gap: 1rem;">
          <div class="card-header" style="border-bottom: 1px solid var(--md-sys-color-surface-variant); padding-bottom: 0.65rem; margin-bottom: 0.25rem;">
            <h4 style="margin: 0; font-size: 1.1rem; font-weight: 800; color: var(--md-sys-color-primary); display: flex; align-items: center; gap: 0.45rem;">
              <span>⚡</span>
              <span>المولدات الديزل ونسبة خزين الكاز (وقود التشغيل)</span>
            </h4>
          </div>

          <div style="padding: 0.85rem 1rem; border: 1px solid var(--md-sys-color-surface-variant); border-radius: 10px; background: var(--md-sys-color-surface);">
            <div style="font-size: 0.8rem; color: var(--md-sys-color-outline); margin-bottom: 2px;">المولدات الديزل العاملة والقدرة:</div>
            <div style="font-weight: 800; color: var(--md-sys-color-on-surface);">${power.dieselGenerators || 'غير محدد'}</div>
          </div>

          <div style="padding: 1rem; border: 1.5px solid var(--md-sys-color-surface-variant); border-radius: 12px; background: var(--md-sys-color-surface);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
              <span style="font-size: 0.85rem; font-weight: 800; color: var(--md-sys-color-on-surface);">🛢️ نسبة خزين الكاز (وقود الديزل المتبقي):</span>
              <span style="font-size: 1.25rem; font-weight: 900; color: ${fuelColor}; font-family: monospace;">${fuelPct}%</span>
            </div>
            
            <div style="width: 100%; height: 14px; background: rgba(0, 0, 0, 0.1); border-radius: 999px; overflow: hidden; margin-bottom: 0.5rem; border: 1px solid var(--md-sys-color-surface-variant);">
              <div style="height: 100%; width: ${Math.min(100, Math.max(0, fuelPct))}%; background: ${fuelColor}; border-radius: 999px; transition: width 0.4s ease;"></div>
            </div>

            <div style="font-size: 0.82rem; color: var(--md-sys-color-outline);">
              ${power.fuelStatusText || 'مستوى خزين الوقود المسجل'}
            </div>
          </div>
        </div>

        <!-- بطاقة ضاغطات الهواء (هواء الآلات والتشغيل) وموقف ضاغطة الديزل الاحتياطية -->
        <div class="card" style="display: flex; flex-direction: column; gap: 1rem;">
          <div class="card-header" style="border-bottom: 1px solid var(--md-sys-color-surface-variant); padding-bottom: 0.65rem; margin-bottom: 0.25rem;">
            <h4 style="margin: 0; font-size: 1.1rem; font-weight: 800; color: var(--md-sys-color-primary); display: flex; align-items: center; gap: 0.45rem;">
              <span>💨</span>
              <span>منظومة ضاغطات الهواء وهواء الآلات والتشغيل</span>
            </h4>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
            <div style="padding: 0.85rem; border: 1px solid var(--md-sys-color-surface-variant); border-radius: 10px; text-align: center; background: var(--md-sys-color-surface);">
              <div style="font-size: 0.78rem; color: var(--md-sys-color-outline);">إجمالي ضاغطات الهواء</div>
              <div style="font-size: 1.5rem; font-weight: 900; color: var(--md-sys-color-primary);">${compressors.totalCount ?? 0}</div>
            </div>
            <div style="padding: 0.85rem; border: 1px solid var(--md-sys-color-surface-variant); border-radius: 10px; text-align: center; background: var(--md-sys-color-surface);">
              <div style="font-size: 0.78rem; color: #059669;">ضاغطات الهواء العاملة</div>
              <div style="font-size: 1.5rem; font-weight: 900; color: #059669;">${compressors.operatingCount ?? 0}</div>
            </div>
          </div>

          <div style="padding: 1rem; border-radius: 12px; background: linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(5, 150, 105, 0.04) 100%); border: 1.5px solid rgba(16, 185, 129, 0.3);">
            <div style="font-size: 0.82rem; font-weight: 800; color: #059669; margin-bottom: 4px;">🚨 موقف ضاغطة الديزل الاحتياطية لهواء الآلات (Diesel Standby Air Compressor):</div>
            <div style="font-size: 0.94rem; font-weight: 750; color: var(--md-sys-color-on-surface); line-height: 1.6;">
              ${compressors.dieselBackupStatus || 'غير مسجل'}
            </div>
          </div>

          ${control.coverageDescription ? `
            <div style="font-size: 0.82rem; color: var(--md-sys-color-outline); background: var(--md-sys-color-background); padding: 0.5rem 0.75rem; border-radius: 8px;">
              💻 <strong>منظومة التحكم:</strong> ${control.coverageDescription}
            </div>
          ` : ''}
        </div>

      </div>

      <!-- 5. المعلومات والمعايير الفنية المخصصة الإضافية -->
      <div class="card">
        <div class="card-header" style="border-bottom: 1px solid var(--md-sys-color-surface-variant); padding-bottom: 0.75rem; margin-bottom: 1.25rem; display: flex; justify-content: space-between; align-items: center;">
          <h4 style="margin: 0; font-size: 1.15rem; font-weight: 800; color: var(--md-sys-color-primary); display: flex; align-items: center; gap: 0.45rem;">
            <span>➕</span>
            <span>المعلومات والمعايير الفنية الإضافية المخصصة للمحطة</span>
          </h4>
          ${canEditTech ? `
            <button class="btn btn-sm btn-outline" onclick="window.app.openEditStationTechnicalModal('${station.id}')" style="font-size:0.8rem; font-weight:750;">
              إضافة أو إدارة المعايير ➕
            </button>
          ` : ''}
        </div>

        ${customFields.length === 0 ? `
          <div style="text-align: center; padding: 2rem; color: var(--md-sys-color-outline);">
            لا توجد معايير فنية إضافية مسجلة حالياً. يمكن لمسؤول الموقع إضافة أي منظومة خاصة (مثل: حقن كيمياويات، وحدات تجفيف الغاز، شبكات الإطفاء) عبر زر التحديث.
          </div>
        ` : `
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1rem;">
            ${customFields.map(cf => `
              <div style="padding: 1rem; border: 1px solid var(--md-sys-color-surface-variant); border-radius: 12px; background: var(--md-sys-color-surface); box-shadow: var(--shadow-1);">
                <div style="font-size: 0.82rem; color: var(--md-sys-color-outline); font-weight: 700; margin-bottom: 4px;">${cf.label}</div>
                <div style="font-size: 1.05rem; font-weight: 800; color: var(--md-sys-color-on-surface); margin-bottom: 2px;">${cf.value}</div>
                ${cf.unit ? `<div style="font-size: 0.78rem; color: var(--md-sys-color-primary); font-weight: 600;">${cf.unit}</div>` : ''}
              </div>
            `).join('')}
          </div>
        `}
      </div>

    </div>
  `;
}

if (typeof window !== 'undefined') {
  window.renderStationWorkspaceView = renderStationWorkspaceView;
  window.renderStationOverviewTab = renderStationOverviewTab;
  window.renderStationDocsTab = renderStationDocsTab;
  window.renderStationStaffTab = renderStationStaffTab;
  window.renderStationTechnicalTab = renderStationTechnicalTab;
  window.renderSpecializedStationReportsTab = renderSpecializedStationReportsTab;
  window.renderSpecializedStationNotifsTab = renderSpecializedStationNotifsTab;
  window.renderStationNotificationsTab = renderStationNotificationsTab;
  window.renderSpecializedStationStaffTab = renderSpecializedStationStaffTab;
}