/* ==========================================================================
   إدارة قسم الإنتاج الجنوبي - Top Bar Component with Shifts & PWA (القسم 31 و 32 و 58)
   ========================================================================== */

function renderTopbar() {
  const user = window.auth.getCurrentUser();
  if (!user) return '';

  const roleInfo = window.rbac.getRoleInfo(user.role);
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
  const shiftInfo = window.store.getCurrentShiftInfo();
  const canManageShifts = window.rbac && typeof window.rbac.hasPermission === 'function'
    ? (window.rbac.hasPermission(user, 'MANAGE_SHIFTS') || user.role === 'DEPT_MANAGER' || user.role === 'SUPER_ADMIN')
    : (user.role === 'DEPT_MANAGER' || user.role === 'SUPER_ADMIN');
  
  const now = new Date();
  
  // Format Date and Time strictly with English numbers
  const days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const arabicDayName = days[now.getDay()];
  const formattedDateStr = `${arabicDayName}، ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;

  let h = now.getHours();
  const m = String(now.getMinutes()).padStart(2, '0');
  const s = String(now.getSeconds()).padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  h = h ? h : 12;
  const hh = String(h).padStart(2, '0');
  const liveTimeStr = `${hh}:${m}:${s} ${ampm}`;

  const shiftLetter = (shiftInfo.currentShift || 'A').toUpperCase();

  return `
    <header class="topbar">
      <!-- Zone 1: Toggle Navigation + Brand Name with generous breathing space -->
      <div class="topbar-left">
        <button class="toggle-sidebar-btn" onclick="window.app.toggleSidebar()" title="قائمة التنقل">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>

        <div class="department-brand">
          <div class="department-logo hr-logo" title="إدارة قسم الإنتاج الجنوبي">
            <svg class="department-logo-svg" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 21h18"></path>
              <path d="M5 21V7l8-4v18"></path>
              <path d="M19 21V11l-6-4"></path>
              <path d="M9 9v.01"></path>
              <path d="M9 13v.01"></path>
              <path d="M9 17v.01"></path>
            </svg>
          </div>
          <div class="department-title-group">
            <h1 class="department-main-title">إدارة قسم الإنتاج الجنوبي</h1>
          </div>
        </div>
      </div>

      <!-- Zone 2: Futuristic Cyber Search Bar with Quick Command Palette -->
      <div class="topbar-center">
        <div class="global-search-container" id="globalSearchContainer">
          <span class="search-icon-inside" title="بحث شامل في المنظومة">
            <svg class="search-lens-svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </span>
          <input type="text" class="global-search-input" id="globalSearchInput" 
                 placeholder="بحث شامل في المنظومة..." 
                 autocomplete="off"
                 oninput="window.app.handleLiveSearchInput(this.value)"
                 onfocus="window.app.handleLiveSearchInput(this.value)"
                 onkeyup="if(event.key==='Enter') window.app.handleGlobalSearch(this.value)">
          <div class="search-actions-inside">
            <button type="button" class="search-clear-btn" id="searchClearBtn" onclick="window.app.clearGlobalSearch()" title="مسح">✕</button>
            <kbd class="search-kbd-shortcut" title="اختصار لوحة المفاتيح">Ctrl K</kbd>
          </div>
          <div class="global-search-dropdown" id="globalSearchDropdown" style="display: none;"></div>
        </div>
      </div>

      <!-- Zone 3: Shift, Date/Time, Theme, Notifications & User Profile -->
      <div class="topbar-right">
        <!-- Compact Vivid Operational Shift Badge (Distinct Color Per Shift) -->
        <div class="topbar-shift-badge-container">
          <div class="topbar-shift-pill shift-pill-${shiftLetter} ${canManageShifts ? 'clickable' : ''}" 
               onclick="${canManageShifts ? 'window.app.openShiftSettingsModal()' : ''}" 
               title="${canManageShifts ? 'انقر لضبط وتعديل مواعيد وجدول النوبات التشغيلية' : 'النوبة التشغيلية الحالية'} (${shiftInfo.period})">
            <span class="shift-live-indicator" title="نوبة تشغيلية جارية">
              <span class="shift-ping-dot"></span>
              <span class="shift-core-dot"></span>
            </span>
            <span class="shift-letter-badge">${shiftLetter}</span>
            ${canManageShifts ? `
              <span class="shift-gear-btn" title="إعدادات مواعيد النوبة">
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="3"></circle>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                </svg>
              </span>
            ` : ''}
          </div>
        </div>

        <!-- Cyber Glassmorphic Date & Time Capsule (English Numerals & High-Tech Glow) -->
        <div class="topbar-datetime-card" id="topbarDateTimeWidget" title="${now.toLocaleDateString('en-GB')}">
          <div class="datetime-live-dot" title="تزامن زمني حي ومباشر"></div>
          
          <div class="datetime-section datetime-date" dir="ltr">
            <svg class="datetime-icon" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            <span class="datetime-text" id="topbarLiveDate" dir="ltr">${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}</span>
          </div>

          <div class="datetime-divider"></div>

          <div class="datetime-section datetime-time" dir="ltr">
            <svg class="datetime-icon clock-icon" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            <span class="datetime-text live-time-digits" id="topbarLiveTime" dir="ltr">${liveTimeStr}</span>
          </div>
        </div>

        <div class="topbar-actions">
          <!-- Theme Toggle with Clear High-Contrast SVG -->
          <button class="icon-btn theme-toggle-btn" onclick="window.app.toggleTheme()" title="${currentTheme === 'dark' ? 'التحويل إلى الوضع النهاري' : 'التحويل إلى الوضع الليلي'}">
            <span id="themeIcon">
              ${currentTheme === 'dark' ? `
                <svg class="theme-sun-svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#f59e0b" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="5"></circle>
                  <line x1="12" y1="1" x2="12" y2="3"></line>
                  <line x1="12" y1="21" x2="12" y2="23"></line>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                  <line x1="1" y1="12" x2="3" y2="12"></line>
                  <line x1="21" y1="12" x2="23" y2="12"></line>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                </svg>
              ` : `
                <svg class="theme-moon-svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#6366f1" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z"></path>
                </svg>
              `}
            </span>
          </button>

          <!-- Notifications Bell with Clear High-Contrast SVG -->
          <button class="icon-btn notification-icon-btn" onclick="window.app.navigate('notifications')" title="التبليغات الإدارية">
            <svg class="notification-bell-svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
            <span class="notification-badge">${window.store.getNotifications(user.departmentId).length}</span>
          </button>

          <!-- Profile Menu -->
          <div class="user-profile-menu" onclick="window.app.navigate('profile')">
            <div class="user-avatar">${user.fullName ? user.fullName.charAt(0) : 'م'}</div>
            <div class="user-info-text">
              <span class="user-name">${user.fullName}</span>
              <span class="user-role-badge">${roleInfo.name}</span>
            </div>
          </div>

          ${(user.role === 'SUPER_ADMIN' && window.store && typeof window.store.getMaintenanceLock === 'function' && window.store.getMaintenanceLock().active) ? `
            <span style="background: #ef4444; color: #ffffff; padding: 0.25rem 0.65rem; border-radius: 6px; font-size: 0.75rem; font-weight: 800; white-space: nowrap; flex-wrap: nowrap;" title="وضع الصيانة مفعل للمنظومة العامة من قبل المؤسس">
              ⚠️ وضع الصيانة مفعل
            </span>
          ` : ''}
        </div>
      </div>
    </header>
  `;
}

// Auto-updating live clock timer with pure English digits
if (typeof window !== 'undefined') {
  if (window._topbarLiveClockTimer) {
    clearInterval(window._topbarLiveClockTimer);
  }
  window._topbarLiveClockTimer = setInterval(() => {
    const timeEl = document.getElementById('topbarLiveTime');
    const dateEl = document.getElementById('topbarLiveDate');
    if (timeEl) {
      const now = new Date();
      let h = now.getHours();
      const m = String(now.getMinutes()).padStart(2, '0');
      const s = String(now.getSeconds()).padStart(2, '0');
      const ampm = h >= 12 ? 'PM' : 'AM';
      h = h % 12;
      h = h ? h : 12;
      const hh = String(h).padStart(2, '0');
      timeEl.textContent = `${hh}:${m}:${s} ${ampm}`;

      if (dateEl && now.getSeconds() === 0) {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        dateEl.textContent = `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
      }
    }
  }, 1000);
}

window.renderTopbar = renderTopbar;