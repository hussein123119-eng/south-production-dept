/* ==========================================================================
   إدارة قسم الإنتاج الجنوبي - Native Mobile Navigation & Bottom Sheet Component
   ========================================================================== */

/**
 * 1. شريط التنقل السفلي الأصيل للهواتف الذكية (Native Mobile Bottom Navigation Bar)
 * مصمم كشريط زجاجي عائم فائق الرشاقة مخصص لتنقل الإبهام السريع
 */
function renderMobileBottomNav(activeView = 'dashboard') {
  const user = window.auth.getCurrentUser();
  if (!user) return '';

  const isHome = activeView === 'dashboard';
  const isForms = activeView === 'dept_management' || activeView === 'documents';
  const isIncentive = activeView === 'incentive_calculator';
  const isPromotion = activeView === 'promotion_calculator';
  const isMore = !isHome && !isForms && !isIncentive && !isPromotion;

  return `
    <nav class="mobile-bottom-nav" id="mobileBottomNav" aria-label="التنقل السفلي للتطبيق">
      <div class="bottom-nav-inner">
        
        <!-- 1. الرئيسية -->
        <button type="button" class="bottom-nav-btn ${isHome ? 'active' : ''}" onclick="window.app.navigateWithHaptic('dashboard')" aria-label="الرئيسية">
          <div class="nav-btn-icon-wrapper">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
            <span class="nav-active-dot"></span>
          </div>
          <span class="nav-btn-label">الرئيسية</span>
        </button>

        <!-- 2. الاستمارات والفورمات -->
        <button type="button" class="bottom-nav-btn ${isForms ? 'active' : ''}" onclick="window.app.navigateWithHaptic('dept_management')" aria-label="الاستمارات">
          <div class="nav-btn-icon-wrapper">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
            <span class="nav-active-dot"></span>
          </div>
          <span class="nav-btn-label">الاستمارات</span>
        </button>

        <!-- 3. زر الحاسبة المركزي العائم (الحوافز) -->
        <button type="button" class="bottom-nav-btn nav-btn-center ${isIncentive ? 'active' : ''}" onclick="window.app.navigateWithHaptic('incentive_calculator')" aria-label="حاسبة الحوافز">
          <div class="center-btn-orb">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
              <rect x="4" y="2" width="16" height="20" rx="3"></rect>
              <line x1="8" y1="6" x2="16" y2="6"></line>
              <line x1="16" y1="14" x2="16" y2="18"></line>
              <path d="M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M8 18h.01M12 18h.01"></path>
            </svg>
          </div>
          <span class="nav-btn-label">الحوافز</span>
        </button>

        <!-- 4. الترفيع والعلاوات -->
        <button type="button" class="bottom-nav-btn ${isPromotion ? 'active' : ''}" onclick="window.app.navigateWithHaptic('promotion_calculator')" aria-label="الترفيع">
          <div class="nav-btn-icon-wrapper">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
              <polyline points="17 6 23 6 23 12"></polyline>
            </svg>
            <span class="nav-active-dot"></span>
          </div>
          <span class="nav-btn-label">الترفيع</span>
        </button>

        <!-- 5. قائمة المزيد المنبثقة من الأسفل -->
        <button type="button" class="bottom-nav-btn ${isMore ? 'active' : ''}" onclick="window.app.openMobileBottomSheet()" aria-label="المزيد">
          <div class="nav-btn-icon-wrapper">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="1.5"></circle>
              <circle cx="19" cy="12" r="1.5"></circle>
              <circle cx="5" cy="12" r="1.5"></circle>
            </svg>
            <span class="nav-active-dot"></span>
          </div>
          <span class="nav-btn-label">المزيد</span>
        </button>

      </div>
    </nav>
  `;
}

/**
 * 2. صفيحة الخدمات الشاملة المنبثقة من الأسفل (Native Bottom Sheet Modal)
 */
function renderMobileBottomSheet() {
  const user = window.auth.getCurrentUser();
  if (!user) return '';

  const sections = (window.store && typeof window.store.getSections === 'function') ? window.store.getSections(user.departmentId) : [];
  const units = (window.store && typeof window.store.getUnits === 'function') ? window.store.getUnits(user.departmentId) : [];
  const isHRorMgr = ['DEPT_MANAGER', 'DEPUTY_DEPT_MANAGER', 'ADMIN_MANAGER', 'SUPER_ADMIN', 'ADMINISTRATOR', 'SECTION_MANAGER', 'DEPUTY_SECTION_MANAGER'].includes(user.role);

  return `
    <div class="bottom-sheet-overlay" id="mobileBottomSheetOverlay" onclick="window.app.closeMobileBottomSheet(event)" ontouchend="window.app.closeMobileBottomSheet(event)"></div>
    
    <div class="bottom-sheet" id="mobileBottomSheet" role="dialog" aria-labelledby="bottomSheetTitle">
      <!-- Drag Handle Indicator -->
      <div class="sheet-drag-pill" onclick="window.app.closeMobileBottomSheet(event)"></div>

      <!-- Sheet Header -->
      <div class="sheet-header">
        <div style="display: flex; align-items: center; gap: 0.65rem;">
          <div class="department-logo hr-logo" style="width: 34px; height: 34px; min-width: 34px; border-radius: 10px; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, var(--md-sys-color-primary) 0%, #006a6a 100%); color: #fff;">
            <svg class="department-logo-svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 21h18"></path>
              <path d="M5 21V7l8-4v18"></path>
              <path d="M19 21V11l-6-4"></path>
            </svg>
          </div>
          <div>
            <h3 id="bottomSheetTitle" style="font-size: 1.05rem; font-weight: 800; color: var(--md-sys-color-on-surface); margin: 0; line-height: 1.2;">خدمات ومنظومة القسم</h3>
            <span style="font-size: 0.74rem; color: var(--md-sys-color-outline); font-weight: 600;">${user.name || 'المنتسب'} • ${user.role || 'عضو'}</span>
          </div>
        </div>
        <button type="button" class="sheet-close-btn" onclick="window.app.closeMobileBottomSheet(event)" aria-label="إغلاق">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <!-- Sheet Scrollable Content -->
      <div class="sheet-content">
        
        <!-- Category 1: الإدارة والحاسبات الرئيسية -->
        <div class="sheet-category-title">الخدمات السريعة والحاسبات</div>
        <div class="sheet-apps-grid">
          <div class="app-item" onclick="window.app.selectBottomSheetNav('dashboard')">
            <div class="app-item-icon bg-cyan">📊</div>
            <span class="app-item-label">لوحة التحكم</span>
          </div>
          <div class="app-item" onclick="window.app.selectBottomSheetNav('dept_management')">
            <div class="app-item-icon bg-blue">🏛️</div>
            <span class="app-item-label">إدارة القسم</span>
          </div>
          <div class="app-item" onclick="window.app.selectBottomSheetNav('incentive_calculator')">
            <div class="app-item-icon bg-green">🧮</div>
            <span class="app-item-label">حاسبة الحوافز</span>
          </div>
          <div class="app-item" onclick="window.app.selectBottomSheetNav('promotion_calculator')">
            <div class="app-item-icon bg-amber">📈</div>
            <span class="app-item-label">حاسبة الترفيع</span>
          </div>
          <div class="app-item" onclick="window.app.selectBottomSheetNav('documents')">
            <div class="app-item-icon bg-indigo">📁</div>
            <span class="app-item-label">الأرشيف والوثائق</span>
          </div>
          <div class="app-item" onclick="window.app.selectBottomSheetNav('employees')">
            <div class="app-item-icon bg-purple">👥</div>
            <span class="app-item-label">سجل الكادر</span>
          </div>
        </div>

        <!-- Category 2: الشعب والقواطع التشغيلية -->
        <div class="sheet-category-title">الشعب وقواطع الإنتاج (${sections.length})</div>
        <div class="sheet-sections-list">
          ${sections.map(sec => `
            <div class="sheet-list-card" onclick="window.app.selectBottomSheetSection('${sec.id}')">
              <div class="list-card-icon">⚡</div>
              <div class="list-card-info">
                <span class="list-card-title">${sec.name}</span>
                <span class="list-card-sub">${sec.code || 'شعبة تشغيلية'} • ${sec.managerName || 'مسؤول الشعبة'}</span>
              </div>
              <div class="list-card-arrow">‹</div>
            </div>
          `).join('')}
        </div>

        <!-- Category 3: العمليات والآليات والموقف الفني -->
        <div class="sheet-category-title">العمليات والموقف التشغيلي</div>
        <div class="sheet-apps-grid">
          <div class="app-item" onclick="window.app.selectBottomSheetNav('technical_status')">
            <div class="app-item-icon bg-emerald">🛢️</div>
            <span class="app-item-label">الموقف الفني</span>
          </div>
          <div class="app-item" onclick="window.app.selectBottomSheetNav('vehicles')">
            <div class="app-item-icon bg-orange">🚗</div>
            <span class="app-item-label">حركة الآليات</span>
          </div>
          <div class="app-item" onclick="window.app.selectBottomSheetNav('announcements')">
            <div class="app-item-icon bg-rose">📢</div>
            <span class="app-item-label">التبليغات</span>
          </div>
          <div class="app-item" onclick="window.app.selectBottomSheetNav('recycle_bin')">
            <div class="app-item-icon bg-slate">🗑️</div>
            <span class="app-item-label">المحذوفات</span>
          </div>
          ${user.role === 'SUPER_ADMIN' ? `
            <div class="app-item" onclick="window.app.selectBottomSheetNav('super_admin')">
              <div class="app-item-icon bg-red">👑</div>
              <span class="app-item-label">بوابة المؤسس</span>
            </div>
          ` : ''}
          <div class="app-item" onclick="window.app.selectBottomSheetNav('profile')">
            <div class="app-item-icon bg-teal">👤</div>
            <span class="app-item-label">ملفي الشخصي</span>
          </div>
        </div>

        <!-- Quick Preferences Bottom -->
        <div class="sheet-footer-actions">
          <button class="sheet-action-btn" onclick="window.app.toggleTheme()">
            <span>🌓 تبديل المظهر (ليلي / نهاري)</span>
          </button>
          <button class="sheet-action-btn btn-danger-soft" onclick="window.auth.logout()">
            <span>🚪 تسجيل الخروج</span>
          </button>
        </div>

      </div>
    </div>
  `;
}

// Global helpers on window.app for Mobile Navigation
if (typeof window !== 'undefined') {
  window.renderMobileBottomNav = renderMobileBottomNav;
  window.renderMobileBottomSheet = renderMobileBottomSheet;

  // Enhance window.app with bottom sheet and haptic helpers
  window.addEventListener('DOMContentLoaded', () => {
    if (window.app) {
      window.app.navigateWithHaptic = function(viewName, paramId = null) {
        if (typeof window.app.triggerHaptic === 'function') window.app.triggerHaptic(10);
        window.app.closeMobileBottomSheet();
        window.app.navigate(viewName, paramId);
      };

      window.app.openMobileBottomSheet = function(e) {
        if (e && typeof e.preventDefault === 'function') e.preventDefault();
        if (typeof window.app.triggerHaptic === 'function') window.app.triggerHaptic(12);
        const overlay = document.getElementById('mobileBottomSheetOverlay');
        const sheet = document.getElementById('mobileBottomSheet');
        if (overlay) overlay.classList.add('active');
        if (sheet) sheet.classList.add('active');
        document.body.classList.add('bottom-sheet-open');
      };

      window.app.closeMobileBottomSheet = function(e) {
        if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
        const overlay = document.getElementById('mobileBottomSheetOverlay');
        const sheet = document.getElementById('mobileBottomSheet');
        if (overlay) overlay.classList.remove('active');
        if (sheet) sheet.classList.remove('active');
        document.body.classList.remove('bottom-sheet-open');
      };

      window.app.selectBottomSheetNav = function(viewName) {
        window.app.closeMobileBottomSheet();
        window.app.navigateWithHaptic(viewName);
      };

      window.app.selectBottomSheetSection = function(sectionId) {
        window.app.closeMobileBottomSheet();
        window.app.openSectionWorkspace(sectionId);
      };

      window.app.triggerHaptic = function(duration = 10) {
        try {
          if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
            navigator.vibrate(duration);
          }
        } catch (e) {}
      };
    }
  });
}
