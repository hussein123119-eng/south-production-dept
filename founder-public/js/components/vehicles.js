/* ==========================================================================
   إدارة قسم الإنتاج الجنوبي - إدارة حركة العجلات (Central Fleet & Movement Hub)
   ========================================================================== */

function renderVehiclesView() {
  const user = window.auth.getCurrentUser();
  const db = window.store.getDb();
  const sections = window.store.getSections(user.departmentId);
  const stations = window.store.getStations(user.departmentId);

  const canManage = window.rbac ? (window.rbac.hasPermission(user, 'MANAGE_VEHICLES') || ['DEPT_MANAGER', 'SUPER_ADMIN', 'SECTION_MANAGER'].includes(user.role)) : true;

  // Active Tab
  const activeTab = window.app.currentVehiclesHubTab || 'active_movements';
  const isTabActive = (t) => {
    if (t === 'active_movements') return activeTab === 'active_movements' || activeTab === 'active_trips';
    if (t === 'past_movements') return activeTab === 'past_movements' || activeTab === 'movements_log';
    if (t === 'fleet_registry') return activeTab === 'fleet_registry';
    return false;
  };

  // Retrieve Scoped Fleet & Movements
  const allVehicles = window.store.getVehicles(user.departmentId, {}, user);
  const allMovements = window.store.getVehicleMovements(user.departmentId, {}, user);

  const activeMovements = allMovements.filter(m => m.status === 'IN_TRANSIT');
  const pastMovements = allMovements.filter(m => m.status === 'COMPLETED' || m.status === 'CANCELLED');

  // Stats
  const operationalCount = allVehicles.filter(v => v.operationalState === 'OPERATIONAL' || v.operationalState === 'عاملة' || v.operationalState === 'بالعمل').length;
  const inRepairCount = allVehicles.filter(v => v.operationalState === 'IN_REPAIR' || v.operationalState === 'في التصليح' || v.operationalState === 'بالتصليح').length;
  const stoppedCount = allVehicles.filter(v => v.operationalState === 'STOPPED' || v.operationalState === 'متوقفة').length;
  const inTransitCount = allVehicles.filter(v => v.movementState === 'IN_TRANSIT').length;

  return `
    <div style="margin-bottom: 2rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
      <div>
        <h2 style="font-size: 1.6rem; font-weight: 800; color: var(--md-sys-color-primary);">
          🚘 إدارة حركة العجلات والسيارات الميدانية
        </h2>
        <p style="color: var(--md-sys-color-outline);">
          المركز الموحد لمتابعة وتوثيق حركات وسيارات إدارة القسم وكافة الشعب والمحطات.
        </p>
      </div>

      <div style="display: flex; gap: 0.65rem; flex-wrap: wrap; align-items: center;">
        ${canManage ? `
          <button class="btn btn-glass-primary" onclick="window.app.openCreateVehicleModal()" title="إضافة سيارة جديدة للمنظومة">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 5v14M5 12h14"></path>
            </svg>
            <span>إضافة سيارة جديدة</span>
            <span style="font-size: 1.05rem;">🚘</span>
          </button>
          <button class="btn btn-glass-amber" onclick="window.app.openStartVehicleMovementModal()" title="تسجيل وبدء حركة ميدانية">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
            </svg>
            <span>تسجيل وبدء حركة</span>
            <span style="font-size: 1.05rem;">🚀</span>
          </button>
        ` : ''}
        <button class="btn-action-export" style="height: 42px; padding: 0 1.15rem; font-size: 0.88rem; border-radius: 12px; font-weight: 700; display: inline-flex; align-items: center; gap: 0.45rem;" onclick="window.app.exportVehiclesDataCSV()">
          📊 تصدير السجل CSV
        </button>
      </div>
    </div>

    <!-- Live Status Overview Chips (Compact & Highly Vivid) -->
    <div class="fleet-quick-stats-grid">
      <div class="fleet-stat-chip chip-success" onclick="window.app.setVehiclesHubTab('fleet_registry')" title="عرض أسطول السيارات العاملة">
        <div class="chip-content">
          <span class="chip-number">${operationalCount}</span>
          <span class="chip-title">سيارات عاملة وجاهزة</span>
        </div>
        <div class="chip-icon-box">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
          <span class="chip-pulse-dot dot-success"></span>
        </div>
      </div>

      <div class="fleet-stat-chip chip-info" onclick="window.app.setVehiclesHubTab('active_movements')" title="عرض السيارات في حركة ميدانية حالية">
        <div class="chip-content">
          <span class="chip-number">${inTransitCount}</span>
          <span class="chip-title">سيارات في مهام حالية</span>
        </div>
        <div class="chip-icon-box">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
          </svg>
          <span class="chip-pulse-dot dot-info"></span>
        </div>
      </div>

      <div class="fleet-stat-chip chip-warning" onclick="window.app.setVehiclesHubTab('fleet_registry')" title="عرض السيارات في التصليح والصيانة">
        <div class="chip-content">
          <span class="chip-number">${inRepairCount}</span>
          <span class="chip-title">سيارات في التصليح</span>
        </div>
        <div class="chip-icon-box">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <span class="chip-pulse-dot dot-warning"></span>
        </div>
      </div>

      <div class="fleet-stat-chip chip-danger" onclick="window.app.setVehiclesHubTab('fleet_registry')" title="عرض السيارات المتوقفة عن العمل">
        <div class="chip-content">
          <span class="chip-number">${stoppedCount}</span>
          <span class="chip-title">سيارات متوقفة</span>
        </div>
        <div class="chip-icon-box">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
          <span class="chip-pulse-dot dot-danger"></span>
        </div>
      </div>
    </div>

    <!-- Vehicles Hub Navigation Tabs -->
    <div class="tabs-header" style="margin-bottom: 1.5rem;">
      <button class="tab-btn ${isTabActive('active_movements') ? 'active' : ''}" onclick="window.app.setVehiclesHubTab('active_movements')">
        🚙 <span>حركات جارية الآن</span> <span class="tab-count-badge">${activeMovements.length}</span>
      </button>
      <button class="tab-btn ${isTabActive('past_movements') ? 'active' : ''}" onclick="window.app.setVehiclesHubTab('past_movements')">
        📜 <span>الأرشيف والتاريخ</span> <span class="tab-count-badge">${pastMovements.length}</span>
      </button>
      <button class="tab-btn ${isTabActive('fleet_registry') ? 'active' : ''}" onclick="window.app.setVehiclesHubTab('fleet_registry')">
        🚗 <span>سجل أسطول السيارات</span> <span class="tab-count-badge">${allVehicles.length}</span>
      </button>
    </div>

    <!-- Sub-Tab Content -->
    ${isTabActive('active_movements') ? renderActiveMovementsTab(activeMovements, canManage) : ''}
    ${isTabActive('past_movements') ? renderPastMovementsTab(pastMovements) : ''}
    ${isTabActive('fleet_registry') ? renderFleetRegistryTab(allVehicles, sections, canManage) : ''}
  `;
}

function renderActiveMovementsTab(activeMovements, canManage) {
  return `
    <div class="card">
      <div class="card-header" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem;">
        <h3 class="card-title">🚙 الحركات الميدانية الجارية حالياً (${activeMovements.length})</h3>
        
        <!-- Live Quick Filters for Active Movements -->
        <div style="display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap;">
          <input type="text" id="vehMovementSearchInput" class="form-control" placeholder="🔍 بحث بالسائق / رقم الآلية / الرقم الجانبي..." 
                 oninput="window.app.filterActiveVehiclesMovements()" style="font-size: 0.8rem; padding: 0.35rem 0.75rem; width: 220px;">
          
          <select id="vehAffiliationFilter" class="form-control" onchange="window.app.filterActiveVehiclesMovements()" style="font-size: 0.8rem; padding: 0.35rem 0.75rem; width: 140px;">
            <option value="ALL">كافة الارتباطات</option>
            <option value="DEPT_MGMT">إدارة القسم</option>
            <option value="SECTION_MGMT">إدارة الشعبة</option>
            <option value="STATION">المحطات</option>
          </select>

          <select id="vehShiftFilter" class="form-control" onchange="window.app.filterActiveVehiclesMovements()" style="font-size: 0.8rem; padding: 0.35rem 0.75rem; width: 110px;">
            <option value="ALL">كافة النوبات</option>
            <option value="A">نوبة A</option>
            <option value="B">نوبة B</option>
            <option value="C">نوبة C</option>
            <option value="D">نوبة D</option>
            <option value="نهار">نهاري</option>
          </select>
        </div>
      </div>

      <div class="table-container" style="overflow-x: auto;">
        <table class="data-table" id="activeVehMovementsTable" style="font-size: 0.88rem;">
          <thead>
            <tr>
              <th>السائق المكلف</th>
              <th>النوبة</th>
              <th>نوع السيارة</th>
              <th>الصفة</th>
              <th>رقم السيارة</th>
              <th>الرقم الجانبي</th>
              <th>الشعبة / الارتباط</th>
              <th>المحطة</th>
              <th>الغرض من الحركة</th>
              <th>وقت الخروج</th>
              <th>الحالة</th>
              <th style="text-align: center;">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            ${activeMovements.length === 0 ? `
              <tr>
                <td colspan="12" style="text-align: center; padding: 2.5rem; color: var(--md-sys-color-outline);">
                  <div style="font-size: 1.8rem; margin-bottom: 0.5rem;">🚘</div>
                  <strong>لا توجد أي سيارة في حركة ميدانية حالياً.</strong>
                  <p style="font-size: 0.85rem;">جميع السيارات المتاحة متواجدة في المرآب والمواقع.</p>
                </td>
              </tr>
            ` : activeMovements.map(m => {
              const depFormatted = m.departureTime ? new Date(m.departureTime).toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit' }) : '—';
              const isGov = m.ownershipType === 'GOVERNMENT';
              let affLabel = 'إدارة القسم';
              if (m.affiliationType === 'SECTION_MGMT') affLabel = 'إدارة الشعبة';
              if (m.affiliationType === 'STATION') affLabel = 'محطة';

              return `
                <tr class="veh-movement-row"
                    data-search="${(m.driverName || '').toLowerCase()} ${(m.vehicleNumber || '').toLowerCase()} ${(m.sideNumber || '').toLowerCase()}"
                    data-section="${m.sectionId || 'DEPT'}"
                    data-affiliation="${m.affiliationType || 'DEPT_MGMT'}"
                    data-shift="${m.shift || 'ALL'}">
                  
                  <td><strong>${m.driverName || 'سائق غير محدد'}</strong></td>
                  <td><span class="mini-status-chip mini-chip-info">${m.shift || 'نهار'}</span></td>
                  <td><strong>${m.vehicleType || 'بيك آب'}</strong></td>
                  <td><span class="mini-status-chip ${isGov ? 'mini-chip-slate' : 'mini-chip-warning'}">${isGov ? 'حكومي' : 'مؤجرة'}</span></td>
                  <td><code>${m.vehicleNumber || '—'}</code></td>
                  <td><strong style="color: var(--md-sys-color-primary); font-family: monospace;">${m.sideNumber ? '#' + m.sideNumber : '—'}</strong></td>
                  <td style="white-space: nowrap;">${m.sectionName || 'إدارة القسم'}</td>
                  <td><span class="mini-status-chip mini-chip-primary" style="white-space: nowrap;">${affLabel}</span></td>
                  <td style="max-width: 220px;">${m.purpose || 'مهمة عمل'}</td>
                  <td>🕒 ${depFormatted}</td>
                  <td>
                    <span class="mini-status-chip mini-chip-info">
                      <span class="mini-pulse-dot"></span>
                      <span class="chip-label">في حركة</span>
                    </span>
                  </td>
                  <td style="text-align: center;">
                    <button class="btn-action-finish" onclick="window.app.endVehicleMovement('${m.id}')" title="إنهاء الحركة وتسجيل وقت العودة">
                      إنهاء
                    </button>
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

function renderPastMovementsTab(pastMovements) {
  return `
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">📜 سجل الأرشيف والتاريخ لحركات السيارات المكتملة (${pastMovements.length})</h3>
      </div>
      <div class="table-container" style="overflow-x: auto;">
        <table class="data-table" style="font-size: 0.88rem;">
          <thead>
            <tr>
              <th>السائق</th>
              <th>النوبة</th>
              <th>نوع السيارة</th>
              <th>الصفة</th>
              <th>رقم السيارة</th>
              <th>الرقم الجانبي</th>
              <th>الشعبة / الارتباط</th>
              <th>جهة الارتباط</th>
              <th>المحطة</th>
              <th>الغرض</th>
              <th>وقت الخروج</th>
              <th>وقت الرجوع</th>
              <th>الحالة</th>
            </tr>
          </thead>
          <tbody>
            ${pastMovements.length === 0 ? `
              <tr>
                <td colspan="13" style="text-align: center; padding: 2.5rem; color: var(--md-sys-color-outline);">
                  لا توجد حركات سابقة مسجلة في الأرشيف حتى الآن.
                </td>
              </tr>
            ` : pastMovements.map(m => {
              const depFormatted = m.departureTime ? new Date(m.departureTime).toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit' }) : '—';
              const retFormatted = m.returnTime ? new Date(m.returnTime).toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit' }) : '—';
              const isGov = m.ownershipType === 'GOVERNMENT';
              let affLabel = 'إدارة القسم';
              if (m.affiliationType === 'SECTION_MGMT') affLabel = 'إدارة الشعبة';
              if (m.affiliationType === 'STATION') affLabel = 'محطة';

              return `
                <tr class="veh-movement-row"
                    data-search="${(m.driverName || '').toLowerCase()} ${(m.vehicleNumber || '').toLowerCase()} ${(m.sideNumber || '').toLowerCase()}"
                    data-section="${m.sectionId || 'DEPT'}"
                    data-affiliation="${m.affiliationType || 'DEPT_MGMT'}"
                    data-shift="${m.shift || 'ALL'}">
                  
                  <td><strong>${m.driverName || 'سائق غير محدد'}</strong></td>
                  <td><span class="mini-status-chip mini-chip-info">${m.shift || 'نهار'}</span></td>
                  <td>${m.vehicleType || 'بيك آب'}</td>
                  <td><span class="mini-status-chip ${isGov ? 'mini-chip-slate' : 'mini-chip-warning'}">${isGov ? 'حكومي' : 'مؤجرة'}</span></td>
                  <td><code>${m.vehicleNumber || '—'}</code></td>
                  <td><strong style="color: var(--md-sys-color-primary);">${m.sideNumber ? '#' + m.sideNumber : '—'}</strong></td>
                  <td style="white-space: nowrap;">${m.sectionName || 'إدارة القسم'}</td>
                  <td style="white-space: nowrap;"><span class="mini-status-chip mini-chip-primary">${affLabel}</span></td>
                  <td>${m.stationName || '—'}</td>
                  <td style="max-width: 220px;">${m.purpose || 'مهمة عمل'}</td>
                  <td>🕒 ${depFormatted}</td>
                  <td>✅ ${retFormatted}</td>
                  <td>
                    <span class="mini-status-chip mini-chip-success">
                      <span class="mini-pulse-dot"></span>
                      <span class="chip-label">مكتملة</span>
                    </span>
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

function renderFleetRegistryTab(allVehicles, sections, canManage) {
  return `
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">🚗 السجل الموحد لسيارات القسم والشعب والمحطات (${allVehicles.length})</h3>
      </div>
      <div class="table-container" style="overflow-x: auto;">
        <table class="data-table" style="font-size: 0.88rem;">
          <thead>
            <tr>
              <th>نوع السيارة</th>
              <th>الصفة</th>
              <th>الرقم الجانبي</th>
              <th>رقم السيارة</th>
              <th>الشعبة / الارتباط</th>
              <th>جهة الارتباط</th>
              <th>المحطة التابعة</th>
              <th>السائق / سائقو النوبات (A/B/C/D)</th>
              <th>الحالة التشغيلية</th>
              <th>جاهزية الحركة</th>
              ${canManage ? '<th style="text-align: center;">إجراءات</th>' : ''}
            </tr>
          </thead>
          <tbody>
            ${allVehicles.length === 0 ? `
              <tr>
                <td colspan="11" style="text-align: center; padding: 2.5rem; color: var(--md-sys-color-outline);">
                  لا توجد سيارات مسجلة في سجل السيارات.
                </td>
              </tr>
            ` : allVehicles.map(v => {
              const isGov = v.ownershipType === 'GOVERNMENT';
              const isStation = v.affiliationType === 'STATION';
              let stateTheme = 'mini-chip-success';
              let stateLabel = 'عاملة';
              if (v.operationalState === 'IN_REPAIR' || v.operationalState === 'في التصليح' || v.operationalState === 'بالتصليح') {
                stateTheme = 'mini-chip-warning';
                stateLabel = 'في التصليح';
              } else if (v.operationalState === 'STOPPED' || v.operationalState === 'متوقفة') {
                stateTheme = 'mini-chip-danger';
                stateLabel = 'متوقفة';
              }

              const isInTransit = v.movementState === 'IN_TRANSIT';
              const affLabel = v.affiliationType === 'DEPT_MGMT' ? 'إدارة القسم' : (v.affiliationType === 'SECTION_MGMT' ? 'إدارة الشعبة' : 'محطة');

              let driversHtml = '';
              if (isStation) {
                const s = v.shiftDrivers || {};
                driversHtml = `
                  <div style="display: flex; flex-direction: column; gap: 0.15rem; font-size: 0.75rem;">
                    <div><span class="mini-status-chip mini-chip-info" style="padding: 0.05rem 0.35rem;">A</span> ${s.shiftA ? s.shiftA.driverName : '<span style="color: var(--md-sys-color-outline);">غير مخصص</span>'}</div>
                    <div><span class="mini-status-chip mini-chip-info" style="padding: 0.05rem 0.35rem;">B</span> ${s.shiftB ? s.shiftB.driverName : '<span style="color: var(--md-sys-color-outline);">غير مخصص</span>'}</div>
                    <div><span class="mini-status-chip mini-chip-info" style="padding: 0.05rem 0.35rem;">C</span> ${s.shiftC ? s.shiftC.driverName : '<span style="color: var(--md-sys-color-outline);">غير مخصص</span>'}</div>
                    <div><span class="mini-status-chip mini-chip-info" style="padding: 0.05rem 0.35rem;">D</span> ${s.shiftD ? s.shiftD.driverName : '<span style="color: var(--md-sys-color-outline);">غير مخصص</span>'}</div>
                  </div>
                `;
              } else {
                driversHtml = `<strong>${v.driverName || 'غير محدد'}</strong>`;
              }

              return `
                <tr class="veh-fleet-row"
                    data-search="${(v.driverName || '').toLowerCase()} ${(v.vehicleNumber || '').toLowerCase()} ${(v.sideNumber || '').toLowerCase()}"
                    data-section="${v.sectionId || 'DEPT'}"
                    data-affiliation="${v.affiliationType || 'DEPT_MGMT'}">
                  
                  <td><strong>${v.vehicleType || 'بيك آب'}</strong></td>
                  <td><span class="mini-status-chip ${isGov ? 'mini-chip-slate' : 'mini-chip-warning'}">${isGov ? 'حكومي' : 'مؤجرة'}</span></td>
                  <td><strong style="color: var(--md-sys-color-primary); font-family: monospace;">${v.sideNumber ? '#' + v.sideNumber : (isGov ? '<span style="color:#d93025;">مطلوب</span>' : '—')}</strong></td>
                  <td><code>${v.vehicleNumber || '—'}</code></td>
                  <td style="white-space: nowrap;">${v.sectionName || 'إدارة القسم'}</td>
                  <td style="white-space: nowrap;"><span class="mini-status-chip mini-chip-primary">${affLabel}</span></td>
                  <td>${v.stationName || '—'}</td>
                  <td>${driversHtml}</td>
                  <td>
                    <span class="mini-status-chip ${stateTheme}">
                      <span class="mini-pulse-dot"></span>
                      <span class="chip-label">${stateLabel}</span>
                    </span>
                  </td>
                  <td>
                    <span class="mini-status-chip ${isInTransit ? 'mini-chip-info' : 'mini-chip-success'}">
                      <span class="mini-pulse-dot"></span>
                      <span class="chip-label">${isInTransit ? 'في حركة' : 'متاحة'}</span>
                    </span>
                  </td>
                  ${canManage ? `
                    <td style="text-align: center; white-space: nowrap;">
                      <div style="display: flex; gap: 0.35rem; justify-content: center; align-items: center;">
                        <button class="btn-action-edit" onclick="window.app.openEditVehicleModal('${v.id}')" title="تعديل بيانات الآلية">تعديل</button>
                        <button class="btn-action-trash" onclick="window.app.deleteVehicle('${v.id}')" title="حذف الآلية">
                          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          </svg>
                        </button>
                      </div>
                    </td>
                  ` : ''}
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

window.renderVehiclesView = renderVehiclesView;
window.renderActiveMovementsTab = renderActiveMovementsTab;
window.renderPastMovementsTab = renderPastMovementsTab;
window.renderFleetRegistryTab = renderFleetRegistryTab;
