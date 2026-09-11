/* ==========================================================================
   إدارة قسم الإنتاج الجنوبي - Main Router & Application Controller
   ========================================================================== */

class AppController {
  constructor() {
    this.currentView = 'dashboard';
    this.currentStationId = null;
    this.currentUnitId = null;
    this.currentDeptManagementSubTab = 'staff';
    this.currentSectionSubTab = 'staff';
    this.currentUnitSubTab = 'staff';
    this.isSectionsDropdownOpen = false;
    this.isUnitsDropdownOpen = false;
    this.initTheme();
    this.initGlobalSearchShortcuts();
    this.initMobileGestures();
  }

  initTheme() {
    const savedTheme = localStorage.getItem('SPD_THEME') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
  }

  initMobileGestures() {
    if (typeof window !== 'undefined' && typeof window.addEventListener === 'function' && !window._mobileGesturesBound) {
      window._mobileGesturesBound = true;
      let touchStartX = 0;
      let touchStartY = 0;
      let touchCurrentX = 0;
      let touchCurrentY = 0;
      let touchStartTime = 0;
      let isDraggingSidebar = false;
      let isTouchStartedOnInteractive = false;

      const getSidebarEl = () => document.getElementById('appSidebar') || document.querySelector('.sidebar');
      const getOverlayEl = () => document.querySelector('.sidebar-overlay');

      window.addEventListener('touchstart', (e) => {
        if (e.touches && e.touches.length > 0) {
          touchStartX = e.touches[0].clientX;
          touchStartY = e.touches[0].clientY;
          touchCurrentX = touchStartX;
          touchCurrentY = touchStartY;
          touchStartTime = Date.now();

          // Check if touch started on interactive elements (buttons, links, inputs, close btn)
          const target = e.target;
          isTouchStartedOnInteractive = !!(target && (
            target.closest('button') ||
            target.closest('a') ||
            target.closest('input') ||
            target.closest('select') ||
            target.closest('textarea') ||
            target.closest('.sidebar-close-btn') ||
            target.closest('.toggle-sidebar-btn') ||
            target.closest('.nav-item')
          ));

          isDraggingSidebar = document.body.classList.contains('sidebar-mobile-open');
        }
      }, { passive: true });

      window.addEventListener('touchmove', (e) => {
        if (!e.touches || e.touches.length === 0) return;
        touchCurrentX = e.touches[0].clientX;
        touchCurrentY = e.touches[0].clientY;
        const deltaX = touchCurrentX - touchStartX;
        const deltaY = Math.abs(touchCurrentY - touchStartY);

        // Do not intercept taps on interactive controls unless an intentional drag gesture is made (> 30px)
        if (isTouchStartedOnInteractive && deltaX < 30) return;

        // If sidebar is open and user is swiping to the right (in RTL right-anchored sidebar, drag right to close)
        // Must exceed threshold (15px) to prevent micro-jitters from overriding CSS transform
        if (isDraggingSidebar && deltaX > 15 && deltaX > deltaY * 1.2) {
          const sidebar = getSidebarEl();
          if (sidebar) {
            sidebar.style.transition = 'none';
            sidebar.style.transform = `translateX(${deltaX}px)`;
          }
          const overlay = getOverlayEl();
          if (overlay) {
            const opacity = Math.max(0, 1 - (deltaX / 260));
            overlay.style.opacity = `${opacity}`;
          }
        }
      }, { passive: true });

      const handleTouchEnd = () => {
        const deltaX = touchCurrentX - touchStartX;
        const deltaY = Math.abs(touchCurrentY - touchStartY);
        const duration = Date.now() - touchStartTime;
        const velocityX = duration > 0 ? deltaX / duration : 0;

        const sidebar = getSidebarEl();
        if (sidebar) {
          sidebar.style.transition = '';
          sidebar.style.transform = '';
        }
        const overlay = getOverlayEl();
        if (overlay) {
          overlay.style.opacity = '';
        }

        if (document.body.classList.contains('sidebar-mobile-open')) {
          // In RTL, dragging right (> 45px) or quick flick right closes sidebar
          if ((deltaX > 45 && deltaX > deltaY) || (velocityX > 0.4 && deltaX > 20)) {
            if (window.app && typeof window.app.closeSidebar === 'function') {
              window.app.closeSidebar();
            } else {
              document.body.classList.remove('sidebar-mobile-open');
            }
          }
        } else {
          // If closed and swiped from right edge inward (touchStartX > window.innerWidth - 35) to the left
          if (touchStartX > (window.innerWidth - 35) && deltaX < -45 && Math.abs(deltaX) > deltaY) {
            if (window.app && typeof window.app.openSidebar === 'function') {
              window.app.openSidebar();
            } else {
              document.body.classList.add('sidebar-mobile-open');
            }
          }
        }
        isDraggingSidebar = false;
        isTouchStartedOnInteractive = false;
      };

      window.addEventListener('touchend', handleTouchEnd, { passive: true });
      window.addEventListener('touchcancel', handleTouchEnd, { passive: true });
    }
  }

  initGlobalSearchShortcuts() {
    if (typeof window !== 'undefined' && typeof window.addEventListener === 'function' && !window._globalSearchShortcutBound) {
      window._globalSearchShortcutBound = true;
      window.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key && e.key.toLowerCase() === 'k') {
          e.preventDefault();
          const input = document.getElementById('globalSearchInput');
          if (input && typeof input.focus === 'function') {
            input.focus();
            if (typeof input.select === 'function') input.select();
          }
        }
        if (e.key === 'Escape') {
          if (window.app && typeof window.app.closeLiveSearchDropdown === 'function') {
            window.app.closeLiveSearchDropdown();
          }
        }
      });

      if (typeof document !== 'undefined' && typeof document.addEventListener === 'function') {
        document.addEventListener('click', (e) => {
          const container = document.getElementById('globalSearchContainer');
          if (container && !container.contains(e.target)) {
            if (window.app && typeof window.app.closeLiveSearchDropdown === 'function') {
              window.app.closeLiveSearchDropdown();
            }
          }
        });
      }
    }
  }

  toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('SPD_THEME', next);
    const icon = document.getElementById('themeIcon');
    if (icon) {
      icon.innerHTML = next === 'dark'
        ? `<svg class="theme-sun-svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#f59e0b" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`
        : `<svg class="theme-moon-svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#6366f1" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z"></path></svg>`;
    }
  }

  openSidebar(e) {
    if (e) {
      if (typeof e.preventDefault === 'function') e.preventDefault();
      if (typeof e.stopPropagation === 'function') e.stopPropagation();
    }
    const sidebar = document.getElementById('appSidebar') || document.querySelector('.sidebar');
    if (sidebar) {
      sidebar.style.transform = '';
      sidebar.style.transition = '';
    }
    const overlay = document.querySelector('.sidebar-overlay');
    if (overlay) {
      overlay.style.opacity = '';
    }
    if (window.innerWidth <= 992) {
      document.body.classList.add('sidebar-mobile-open');
    } else {
      document.body.classList.remove('sidebar-collapsed');
    }
  }

  closeSidebar(e) {
    if (e) {
      if (typeof e.preventDefault === 'function') e.preventDefault();
      if (typeof e.stopPropagation === 'function') e.stopPropagation();
    }
    const sidebar = document.getElementById('appSidebar') || document.querySelector('.sidebar');
    if (sidebar) {
      sidebar.style.transform = '';
      sidebar.style.transition = '';
    }
    const overlay = document.querySelector('.sidebar-overlay');
    if (overlay) {
      overlay.style.opacity = '';
    }
    document.body.classList.remove('sidebar-mobile-open');
  }

  toggleSidebar(e) {
    if (e) {
      if (typeof e.preventDefault === 'function') e.preventDefault();
      if (typeof e.stopPropagation === 'function') e.stopPropagation();
    }
    const sidebar = document.getElementById('appSidebar') || document.querySelector('.sidebar');
    if (sidebar) {
      sidebar.style.transform = '';
      sidebar.style.transition = '';
    }
    const overlay = document.querySelector('.sidebar-overlay');
    if (overlay) {
      overlay.style.opacity = '';
    }
    if (window.innerWidth <= 992) {
      document.body.classList.toggle('sidebar-mobile-open');
    } else {
      document.body.classList.toggle('sidebar-collapsed');
    }
  }

  toggleSidebarSectionsDropdown(event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.isSectionsDropdownOpen = !this.isSectionsDropdownOpen;
    const menu = document.getElementById('sectionsDropdownMenu');
    const arrow = document.getElementById('sectionsDropdownArrow');
    if (menu && arrow) {
      if (this.isSectionsDropdownOpen) {
        menu.style.display = 'flex';
        arrow.style.transform = 'rotate(180deg)';
      } else {
        menu.style.display = 'none';
        arrow.style.transform = 'rotate(0deg)';
      }
    } else {
      this.render();
    }
  }

  openSectionWorkspace(sectionId) {
    this.isSectionsDropdownOpen = true;
    this.navigate('section_workspace', sectionId);
  }

  toggleSidebarUnitsDropdown(event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.isUnitsDropdownOpen = !this.isUnitsDropdownOpen;
    const menu = document.getElementById('unitsDropdownMenu');
    const arrow = document.getElementById('unitsDropdownArrow');
    if (menu && arrow) {
      if (this.isUnitsDropdownOpen) {
        menu.style.display = 'flex';
        arrow.style.transform = 'rotate(180deg)';
      } else {
        menu.style.display = 'none';
        arrow.style.transform = 'rotate(0deg)';
      }
    } else {
      this.render();
    }
  }

  openUnitWorkspace(unitId) {
    this.isUnitsDropdownOpen = true;
    this.navigate('unit_workspace', unitId);
  }

  navigate(viewName, paramId = null) {
    this.closeSidebar();
    this.currentView = viewName;
    if (viewName === 'section_workspace') {
      this.currentSectionId = paramId;
    }
    if (viewName === 'station_workspace') {
      this.currentStationId = paramId;
    }
    if (viewName === 'unit_workspace') {
      this.currentUnitId = paramId;
    }
    this.render();
  }

  render() {
    const appEl = document.getElementById('app');
    const user = window.auth.getCurrentUser();

    if (!user) {
      appEl.innerHTML = this.renderLoginView();
      return;
    }

    if (!user.profileCompleted) {
      appEl.innerHTML = this.renderMandatoryProfileWizard(user);
      return;
    }

    if (!user.sectionId && !user.unitId && !['SUPER_ADMIN', 'DEPT_MANAGER', 'DEPT_DEPUTY', 'UNIT_MANAGER', 'SECTION_MANAGER', 'ADMINISTRATOR'].includes(user.role)) {
      appEl.innerHTML = this.renderMandatorySectionJoinWizard(user);
      return;
    }

    let viewHtml = '';
    switch (this.currentView) {
      case 'dashboard':
        viewHtml = typeof window.renderDashboardView === 'function' ? window.renderDashboardView() : '';
        break;
      case 'sections':
        viewHtml = typeof window.renderSectionsView === 'function' ? window.renderSectionsView() : '';
        break;
      case 'section_workspace':
        viewHtml = typeof window.renderSectionWorkspaceView === 'function' ? window.renderSectionWorkspaceView(this.currentSectionId) : '';
        break;
      case 'units':
        viewHtml = typeof window.renderUnitsView === 'function' ? window.renderUnitsView() : '';
        break;
      case 'unit_workspace':
        viewHtml = typeof window.renderUnitWorkspaceView === 'function' ? window.renderUnitWorkspaceView(this.currentUnitId) : '';
        break;
      case 'station_workspace':
        viewHtml = typeof window.renderStationWorkspaceView === 'function' ? window.renderStationWorkspaceView(this.currentStationId) : '';
        break;
      case 'documents':
        viewHtml = typeof window.renderDocumentsView === 'function' ? window.renderDocumentsView() : '';
        break;
      case 'announcements':
        viewHtml = typeof window.renderAnnouncementsView === 'function' ? window.renderAnnouncementsView() : '';
        break;
      case 'notifications':
        viewHtml = typeof window.renderNotificationsView === 'function' ? window.renderNotificationsView() : '';
        break;
      case 'technical_status':
        viewHtml = typeof window.renderTechnicalStatusView === 'function' ? window.renderTechnicalStatusView() : '';
        break;
      case 'vehicles':
        viewHtml = typeof window.renderVehiclesView === 'function' ? window.renderVehiclesView() : '';
        break;
      case 'promotion_calculator':
        viewHtml = typeof window.renderPromotionCalculatorView === 'function' ? window.renderPromotionCalculatorView() : '';
        break;
      case 'incentive_calculator':
        viewHtml = typeof window.renderIncentiveCalculatorView === 'function' ? window.renderIncentiveCalculatorView() : '';
        break;
      case 'recycle_bin':
        viewHtml = typeof window.renderRecycleBinView === 'function' ? window.renderRecycleBinView() : '';
        break;
      case 'employees':
        viewHtml = typeof window.renderEmployeesView === 'function' ? window.renderEmployeesView() : '';
        break;
      case 'audit_logs':
        viewHtml = typeof window.renderAuditLogsView === 'function' ? window.renderAuditLogsView() : '';
        break;
      case 'profile':
        viewHtml = typeof window.renderProfileView === 'function' ? window.renderProfileView() : '';
        break;
      case 'requests':
        viewHtml = typeof window.renderRequestsView === 'function' ? window.renderRequestsView() : '';
        break;
      case 'super_admin':
        viewHtml = typeof window.renderSuperAdminView === 'function' ? window.renderSuperAdminView() : '';
        break;
      case 'user_management':
        viewHtml = typeof window.renderUserManagementView === 'function' ? window.renderUserManagementView() : '';
        break;
      case 'dept_management':
        if (typeof window.renderDeptManagementView === 'function') {
          viewHtml = window.renderDeptManagementView();
        } else if (typeof renderDeptManagementView === 'function') {
          viewHtml = renderDeptManagementView();
        } else {
          viewHtml = '<div class="card" style="padding: 3rem; text-align: center;"><h3>🏛️ إدارة القسم</h3><p>جاري مزامنة بيانات إدارة القسم...</p><button class="btn btn-primary" onclick="window.location.reload()">إعادة تحميل الصفحة</button></div>';
        }
        break;
      default:
        viewHtml = typeof window.renderDashboardView === 'function' ? window.renderDashboardView() : '';
    }

    // --- Block non-super-admins from accessing super_admin view ---
    if (this.currentView === 'super_admin' && user.role !== 'SUPER_ADMIN') {
       appEl.innerHTML = `<div style="padding:2rem; text-align:center; color:var(--md-sys-color-error);"><h2>⛔ ليس لديك صلاحية الوصول</h2><p>هذه اللوحة مخصصة للمؤسس فقط.</p><button class="btn btn-primary" style="margin-top:1rem;" onclick="window.app.navigate('dashboard')">العودة للرئيسية</button></div>`;
       return;
    }

    appEl.innerHTML = `
      <div class="layout-wrapper">
        <div class="sidebar-overlay" onclick="window.app.closeSidebar(event)" ontouchend="window.app.closeSidebar(event)"></div>
        ${typeof window.renderSidebar === 'function' ? window.renderSidebar(this.currentView) : ''}
        
        <div class="main-content">
          ${typeof window.renderTopbar === 'function' ? window.renderTopbar() : ''}
          ${typeof window.renderAnnouncementBar === 'function' ? window.renderAnnouncementBar() : ''}
          <main class="content-area">
            ${viewHtml}
          </main>
        </div>

        <!-- Native Mobile Bottom Navigation Bar & Bottom Sheet -->
        ${typeof window.renderMobileBottomNav === 'function' ? window.renderMobileBottomNav(this.currentView) : ''}
        ${typeof window.renderMobileBottomSheet === 'function' ? window.renderMobileBottomSheet() : ''}
      </div>
    `;}

  navigateWithHaptic(viewName, paramId = null) {
    this.triggerHaptic(10);
    this.closeMobileBottomSheet();
    this.navigate(viewName, paramId);
  }

  openMobileBottomSheet(e) {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    this.triggerHaptic(12);
    const overlay = document.getElementById('mobileBottomSheetOverlay');
    const sheet = document.getElementById('mobileBottomSheet');
    if (overlay) overlay.classList.add('active');
    if (sheet) sheet.classList.add('active');
    document.body.classList.add('bottom-sheet-open');
  }

  closeMobileBottomSheet(e) {
    if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
    const overlay = document.getElementById('mobileBottomSheetOverlay');
    const sheet = document.getElementById('mobileBottomSheet');
    if (overlay) overlay.classList.remove('active');
    if (sheet) sheet.classList.remove('active');
    document.body.classList.remove('bottom-sheet-open');
  }

  selectBottomSheetNav(viewName) {
    this.closeMobileBottomSheet();
    this.navigateWithHaptic(viewName);
  }

  selectBottomSheetSection(sectionId) {
    this.closeMobileBottomSheet();
    this.openSectionWorkspace(sectionId);
  }

  triggerHaptic(duration = 10) {
    try {
      if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
        navigator.vibrate(duration);
      }
    } catch (e) {}
  }

  // --- Auth Handlers & Liquid Glassmorphic Login ---
  quickFillLogin(identifier) {
    const idEl = document.getElementById('loginIdentifier') || document.getElementById('loginEmail');
    if (idEl) {
      idEl.value = identifier || '';
    }
    const pwdEl = document.getElementById('loginPassword');
    if (pwdEl) {
      pwdEl.value = '';
      pwdEl.focus();
    }
    const errEl = document.getElementById('loginErrorMsg');
    if (errEl) {
      errEl.style.display = 'none';
      errEl.textContent = '';
    }
  }

  togglePasswordVisibility(inputId, btnEl) {
    const input = document.getElementById(inputId);
    if (!input) return;
    if (input.type === 'password') {
      input.type = 'text';
      if (btnEl) btnEl.innerHTML = '🔒';
    } else {
      input.type = 'password';
      if (btnEl) btnEl.innerHTML = '👁️';
    }
  }

  renderLoginView() {
    const isLocalEnv = typeof window !== 'undefined' && 
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

    // Check emergency maintenance lock for regular users
    const lock = window.store && typeof window.store.getMaintenanceLock === 'function' 
      ? window.store.getMaintenanceLock() 
      : { active: false };

    if (lock.active) {
      return `
        <div class="login-universe-wrapper">
          <div class="login-liquid-card" style="border-color: rgba(245, 158, 11, 0.5); text-align: center;">
            <div style="font-size: 3.5rem; margin-bottom: 1rem;">⚠️</div>
            <h2 style="font-size: 1.5rem; font-weight: 800; color: #f59e0b; margin-bottom: 0.8rem;">تنبيه سيادي: المنظومة تحت الصيانة والتدقيق</h2>
            <p style="color: #cbd5e1; font-size: 0.95rem; line-height: 1.7; margin-bottom: 1.5rem;">
              ${lock.reason || 'تم إيقاف تطبيق العمليات مؤقتاً بأمر المؤسس والإدارة العليا لإجراء عمليات فحص وتدقيق وتحديث المنظومة.'}
            </p>
            <div style="padding: 0.75rem 1rem; background: rgba(245, 158, 11, 0.12); border-radius: 8px; font-size: 0.85rem; color: #fbbf24; margin-bottom: 1.5rem;">
              وقت الإشعار: ${lock.updatedAt ? new Date(lock.updatedAt).toLocaleString('en-GB') : 'الآن'}
            </div>
            <div style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: 1.5rem; display: flex; flex-direction: column; gap: 0.8rem; align-items: center;">
              <a href="${isLocalEnv ? 'founder.html' : 'https://south-prod-founder.web.app'}" style="color: #38bdf8; text-decoration: none; font-size: 0.92rem; font-weight: 800;">
                👑 بوابة المؤسس والقيادة المستقلة ➔
              </a>
              <button type="button" class="glass-auth-btn-secondary" onclick="window.location.reload()">
                🔄 إعادة فحص حالة المنظومة
              </button>
            </div>
          </div>
        </div>
      `;
    }

    return `
      <div class="login-universe-wrapper">
        <div class="login-liquid-card">
          <!-- Pulsating Lively Administrative Brand Emblem -->
          <div class="pulsing-brand-box">
            <div class="pulsing-emblem-ring-outer">
              <div class="pulsing-aura-halo"></div>
              <div class="pulsing-emblem-core">
                <svg class="admin-crest-svg" viewBox="0 0 48 48" width="46" height="46" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="crestGold" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stop-color="#fef08a" />
                      <stop offset="50%" stop-color="#f59e0b" />
                      <stop offset="100%" stop-color="#b45309" />
                    </linearGradient>
                    <linearGradient id="crestCyan" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stop-color="#67e8f9" />
                      <stop offset="100%" stop-color="#00dfd8" />
                    </linearGradient>
                    <linearGradient id="flameGrad" x1="0%" y1="100%" x2="0%" y2="0%">
                      <stop offset="0%" stop-color="#f97316" />
                      <stop offset="60%" stop-color="#fbbf24" />
                      <stop offset="100%" stop-color="#ffffff" />
                    </linearGradient>
                  </defs>
                  <!-- Outer Executive Shield Badge -->
                  <path d="M24 4L38 9V20C38 30.5 32 39 24 43C16 39 10 30.5 10 20V9L24 4Z" fill="url(#crestCyan)" fill-opacity="0.18" stroke="url(#crestCyan)" stroke-width="2" stroke-linejoin="round" />
                  <!-- Inner Inset Shield -->
                  <path d="M24 7.5L35 11.5V20C35 28.5 30 35.5 24 39.2C18 35.5 13 28.5 13 20V11.5L24 7.5Z" stroke="url(#crestGold)" stroke-width="1.2" stroke-dasharray="3 2" opacity="0.85" />
                  <!-- Petroleum Flame / Drop Symbol -->
                  <path d="M24 13C24 13 18 21 18 26.5C18 30 20.7 32.8 24 32.8C27.3 32.8 30 30 30 26.5C30 21 24 13 24 13Z" fill="url(#crestCyan)" />
                  <!-- Radiant Inner Flame -->
                  <path d="M24 19C24 19 20.5 24 20.5 27C20.5 29 22 30.5 24 30.5C26 30.5 27.5 29 27.5 27C27.5 24 24 19 24 19Z" fill="url(#flameGrad)" />
                  <!-- Administration Star -->
                  <path d="M24 8.5L25.2 11.2L28.1 11.5L25.9 13.3L26.6 16.1L24 14.6L21.4 16.1L22.1 13.3L19.9 11.5L22.8 11.2L24 8.5Z" fill="url(#crestGold)" />
                  <circle cx="24" cy="26.5" r="2.5" fill="#071322" />
                </svg>
              </div>
            </div>
            <div class="login-header-sup">وزارة النفط — شركة نفط البصرة</div>
            <div class="login-header-mid">هيأة تشغيل الرميلة</div>
            <div class="login-header-main">إدارة قسم الإنتاج الجنوبي</div>
          </div>

          <form onsubmit="window.app.handleLoginSubmit(event)">
            <!-- Unified Identifier Field: Employee ID or Email -->
            <div class="glass-field-group">
              <label class="glass-field-label">
                الرقم الوظيفي أو البريد الإلكتروني
              </label>
              <div class="glass-input-wrapper">
                <input 
                  type="text" 
                  id="loginIdentifier" 
                  class="glass-auth-input" 
                  placeholder="الرقم الوظيفي أو البريد الإلكتروني" 
                  required 
                  autofocus
                  autocomplete="username">
              </div>
            </div>

            <!-- Password Field with Show/Hide Toggle -->
            <div class="glass-field-group" style="margin-bottom: 0.5rem;">
              <label class="glass-field-label">كلمة المرور</label>
              <div class="glass-input-wrapper">
                <input 
                  type="password" 
                  id="loginPassword" 
                  class="glass-auth-input" 
                  placeholder="••••••••" 
                  required
                  autocomplete="current-password">
                <button 
                  type="button" 
                  class="glass-pwd-toggle" 
                  onclick="window.app.togglePasswordVisibility('loginPassword', this)" 
                  title="إظهار / إخفاء كلمة المرور">
                  👁️
                </button>
              </div>
            </div>

            <div style="display: flex; justify-content: flex-end; margin-bottom: 1.2rem;">
              <a href="javascript:void(0)" onclick="window.app.openForgotPasswordModal()" style="font-size: 0.84rem; color: #00dfd8; text-decoration: none; font-weight: 700;">
                نسيت كلمة المرور؟
              </a>
            </div>

            <!-- Error Banner -->
            <div id="loginErrorMsg" class="glass-error-banner"></div>

            <!-- Submit Button -->
            <button type="submit" class="glass-auth-btn-primary" style="margin-bottom: 1.2rem;">
              <span>تسجيل الدخول</span>
              <span>➔</span>
            </button>
          </form>

          <!-- Local Dev Quick Fills -->
          ${isLocalEnv ? `
            <div class="glass-dev-chips">
              <div style="font-size: 0.78rem; font-weight: 800; color: #00dfd8; margin-bottom: 0.5rem;">
                🛠️ بيئة التطوير المحلي (تعبئة الرقم الوظيفي السريع)
              </div>
              <div style="display: flex; gap: 0.35rem; justify-content: center; flex-wrap: wrap;">
                <button type="button" class="glass-dev-chip-btn" onclick="window.app.quickFillLogin('EMP-0000')" style="background: rgba(245, 158, 11, 0.22); border-color: rgba(245, 158, 11, 0.5); color: #fbbf24; font-weight: 800;">👑 المؤسس (EMP-0000)</button>
                <button type="button" class="glass-dev-chip-btn" onclick="window.app.quickFillLogin('EMP-2024-001')">👔 مدير القسم (EMP-2024-001)</button>
                <button type="button" class="glass-dev-chip-btn" onclick="window.app.quickFillLogin('EMP-2024-002')">🏢 الشعبة 1 (EMP-2024-002)</button>
                <button type="button" class="glass-dev-chip-btn" onclick="window.app.quickFillLogin('EMP-2024-005')">⚙️ الوحدة الفنية (EMP-2024-005)</button>
                <button type="button" class="glass-dev-chip-btn" onclick="window.app.quickFillLogin('EMP-2024-004')">👷 عمار (EMP-2024-004)</button>
              </div>
              <div style="margin-top: 0.65rem; padding: 0.45rem 0.75rem; background: rgba(0, 223, 216, 0.08); border: 1px dashed rgba(0, 223, 216, 0.35); border-radius: 8px; font-size: 0.8rem; color: #f8fafc; display: flex; align-items: center; justify-content: space-between; gap: 0.5rem;">
                <span>🔑 كلمة المرور المحلية الموحدة: <strong style="color: #00dfd8; letter-spacing: 2px; font-size: 0.95rem; font-family: monospace;">123456</strong></span>
                <button type="button" class="btn btn-xs" style="padding: 2px 8px; font-size: 0.72rem; background: rgba(0,223,216,0.25); color: #fff; border: 1px solid rgba(0,223,216,0.4); border-radius: 6px; cursor: pointer;" onclick="navigator.clipboard.writeText('123456'); this.innerText='✓ تم النسخ'; setTimeout(()=>this.innerText='نسخ', 2000)">نسخ</button>
              </div>
            </div>
          ` : ''}

          <!-- New Registration Prompt -->
          <div style="border-top: 1px solid rgba(255, 255, 255, 0.1); padding-top: 1.1rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.5rem;">
            <span style="font-size: 0.88rem; color: #cbd5e1;">ليس لديك حساب مسجل؟</span>
            <button type="button" class="glass-auth-btn-secondary" onclick="window.app.openRegisterModal()">
              إنشاء حساب جديد ✦
            </button>
          </div>
        </div>
      </div>
    `;
  }

  handleLoginSubmit(e) {
    e.preventDefault();
    try {
      const idInput = document.getElementById('loginIdentifier') || document.getElementById('loginEmail');
      const identifier = (idInput?.value || '').trim();
      const pwd = document.getElementById('loginPassword')?.value || '';
      const errEl = document.getElementById('loginErrorMsg');

      if (errEl) errEl.style.display = 'none';

      if (!identifier) {
        if (errEl) {
          errEl.textContent = 'يرجى إدخال الرقم الوظيفي أو البريد الإلكتروني.';
          errEl.style.display = 'block';
        }
        return;
      }

      const res = window.auth.login(identifier, pwd);
      if (res && res.success) {
        this.render();
      } else {
        if (errEl) {
          errEl.textContent = res ? res.error : 'فشل تسجيل الدخول';
          errEl.style.display = 'block';
        } else {
          alert(res ? res.error : 'فشل تسجيل الدخول');
        }
      }
    } catch (err) {
      console.error('Login submit error:', err);
      const errEl = document.getElementById('loginErrorMsg');
      if (errEl) {
        errEl.textContent = 'حدث خطأ أثناء تسجيل الدخول: ' + err.message;
        errEl.style.display = 'block';
      }
    }
  }

  handleLogout() {
    window.auth.logout();
    this.render();
  }

  // --- Mandatory Profile Wizard ---
  renderMandatoryProfileWizard(user) {
    return `
      <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: var(--md-sys-color-background); padding: 1.5rem;">
        <div class="card" style="width: 100%; max-width: 580px;">
          <h2 style="font-size: 1.5rem; font-weight: 800; color: var(--md-sys-color-primary); margin-bottom: 0.5rem;">
            📋 إكمال البيانات الشخصية والوظيفية الإلزامية
          </h2>
          <p style="color: var(--md-sys-color-outline); font-size: 0.85rem; margin-bottom: 1.5rem;">
            مرحباً بك <strong>${user.fullName}</strong>. يرجى إكمال ملفك الوظيفي للسماح بالدخول التام للمنظومة.
          </p>

          <form onsubmit="window.app.handleCompleteProfileSubmit(event)">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
              <div class="form-group">
                <label class="form-label">الاسم الكامل</label>
                <input type="text" id="profFullName" class="form-control" value="${user.fullName}" required>
              </div>
              <div class="form-group">
                <label class="form-label">الرقم الوظيفي</label>
                <input type="text" class="form-control" value="${user.employeeId}" disabled style="background: var(--md-sys-color-surface-variant);">
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
              <div class="form-group">
                <label class="form-label">رقم الهاتف</label>
                <input type="text" id="profPhone" class="form-control" placeholder="0770XXXXXXX" required>
              </div>
              <div class="form-group">
                <label class="form-label">العنوان الوظيفي</label>
                <input type="text" id="profJobTitle" class="form-control" placeholder="معاون مهندس / مهندس / فني / ملاحظ" required>
              </div>
            </div>

            <button type="submit" class="btn btn-primary" style="width: 100%; padding: 0.8rem; font-size: 1rem; margin-top: 1rem;">
              حفظ الملف والدخول للنظام
            </button>
          </form>
        </div>
      </div>
    `;
  }

  handleCompleteProfileSubmit(e) {
    e.preventDefault();
    const user = window.auth.getCurrentUser();
    const fullName = document.getElementById('profFullName').value;
    const phone = document.getElementById('profPhone').value;
    const jobTitle = document.getElementById('profJobTitle').value;

    window.auth.completeProfile(user.id, { fullName, phone, jobTitle });
    this.render();
  }

  // --- Mandatory Section Join Wizard ---
  renderMandatorySectionJoinWizard(user) {
    const sections = window.store.getSections(user.departmentId) || [];
    let optionsHtml = sections.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
    
    return `
      <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: var(--md-sys-color-background); padding: 1.5rem;">
        <div class="card" style="width: 100%; max-width: 580px;">
          <h2 style="font-size: 1.5rem; font-weight: 800; color: var(--md-sys-color-primary); margin-bottom: 0.5rem;">
            🏢 الانضمام إلى الشعبة
          </h2>
          <p style="color: var(--md-sys-color-outline); font-size: 0.85rem; margin-bottom: 1.5rem;">
            حسب الهيكل التنظيمي الجديد، يجب عليك تحديد الشعبة التي تنتمي إليها ورفع المستمسك المطلوب.
          </p>

          <form onsubmit="window.app.handleSectionJoinSubmit(event)">
            <div class="form-group">
              <label class="form-label">اختر الشعبة</label>
              <select id="joinSectionId" class="form-control" required>
                <option value="" disabled selected>-- اختر الشعبة التي تعمل بها --</option>
                ${optionsHtml}
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">المستمسك الإضافي المطلوب (نسخة من الهوية أو الأمر الإداري)</label>
              <input type="file" id="joinDocument" class="form-control" accept="image/*,.pdf" required>
              <small style="color: var(--md-sys-color-outline); font-size: 0.75rem;">الملف إلزامي لاستكمال الانضمام</small>
            </div>

            <button type="submit" class="btn btn-primary" style="width: 100%; padding: 0.8rem; font-size: 1rem; margin-top: 1rem;">
              تقديم طلب الانضمام
            </button>
          </form>
        </div>
      </div>
    `;
  }

  handleSectionJoinSubmit(e) {
    e.preventDefault();
    const user = window.auth.getCurrentUser();
    const sectionId = document.getElementById('joinSectionId').value;
    const documentFile = document.getElementById('joinDocument').files[0];
    
    if (!sectionId || !documentFile) {
        alert("يرجى اختيار الشعبة ورفع المستمسك المطلوب.");
        return;
    }

    const db = window.store.getDb();
    const dbUser = db.users.find(u => u.id === user.id);
    if (dbUser) {
        dbUser.sectionId = sectionId;
        // In a real app we'd upload the file. Here we just mark it as done.
        dbUser.hasRequiredDocument = true; 
        window.store.saveDb(db);
        window.auth.currentUser = dbUser;
        window.store.logActivity(user.departmentId, user.id, user.employeeId, 'JOIN_SECTION', 'USER', `انضمام للشعبة: ${sectionId} مع رفع المستمسك`);
        this.render();
    }
  }

  // --- Dynamic Modals & OTP Registration System ---
  openRegisterModal() {
    this._pendingRegistration = null;
    this.showModal('📝 تسجيل حساب جديد في منظومة قسم الإنتاج الجنوبي', `
      <form onsubmit="window.app.handleRegisterStep1(event)">
        <div style="background: rgba(0, 223, 216, 0.08); border: 1px solid rgba(0, 223, 216, 0.3); border-radius: 12px; padding: 0.75rem 1rem; margin-bottom: 0.9rem; font-size: 0.85rem; color: #cbd5e1; line-height: 1.5;">
          🔒 <strong style="color: #00dfd8;">شروط التسجيل المعتمدة:</strong> يشترط إدخال الرقم الوظيفي الرسمي المعتمد في ملاكات قسم الإنتاج الجنوبي، وسيتم إرسال رمز تحقق سري (OTP) إلى بريدك الإلكتروني لتأكيد التسجيل والاعتماد.
        </div>

        <div class="glass-field-group" style="margin-bottom: 0.85rem;">
          <label class="glass-field-label" style="margin-bottom: 0.35rem;">الاسم الثلاثي واللقب</label>
          <div class="glass-input-wrapper">
            <input type="text" id="regFullName" class="glass-auth-input" placeholder="الاسم الثلاثي الكامل واللقب" required autofocus>
          </div>
        </div>

        <div class="glass-field-group" style="margin-bottom: 0.85rem;">
          <label class="glass-field-label" style="margin-bottom: 0.35rem;">الرقم الوظيفي الرسمي</label>
          <div class="glass-input-wrapper">
            <input type="text" id="regEmployeeId" class="glass-auth-input" placeholder="الرقم الوظيفي الرسمي" required style="font-family: monospace; letter-spacing: 0.5px;">
          </div>
          <small style="color: #94a3b8; font-size: 0.75rem; margin-top: 0.25rem; display: block;">شرط أساسي للتثبت من قاعدة بيانات ملاكات قسم الإنتاج الجنوبي</small>
        </div>

        <div class="glass-field-group" style="margin-bottom: 0.85rem;">
          <label class="glass-field-label" style="margin-bottom: 0.35rem;">البريد الإلكتروني المعتمد</label>
          <div class="glass-input-wrapper">
            <input type="email" id="regEmail" class="glass-auth-input" placeholder="البريد الإلكتروني المعتمد" required>
          </div>
          <small style="color: #94a3b8; font-size: 0.75rem; margin-top: 0.25rem; display: block;">سيتم إرسال رمز الأمان السري إلى هذا البريد لإكمال التفعيل</small>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.85rem; margin-bottom: 0.9rem;">
          <div class="glass-field-group" style="margin-bottom: 0;">
            <label class="glass-field-label" style="margin-bottom: 0.35rem;">كلمة المرور</label>
            <div class="glass-input-wrapper">
              <input type="password" id="regPassword" class="glass-auth-input" placeholder="••••••••" minlength="6" required>
            </div>
          </div>
          <div class="glass-field-group" style="margin-bottom: 0;">
            <label class="glass-field-label" style="margin-bottom: 0.35rem;">تأكيد كلمة المرور</label>
            <div class="glass-input-wrapper">
              <input type="password" id="regConfirmPassword" class="glass-auth-input" placeholder="••••••••" minlength="6" required>
            </div>
          </div>
        </div>

        <div id="regErrorMsg" class="glass-error-banner"></div>

        <div style="display: flex; gap: 0.6rem; justify-content: flex-end; align-items: center; white-space: nowrap; flex-wrap: nowrap; border-top: 1px solid rgba(255, 255, 255, 0.1); padding-top: 0.85rem; margin-top: 0.4rem;">
          <button type="button" class="glass-auth-btn-secondary" onclick="window.app.closeModal()">إلغاء</button>
          <button type="submit" id="regSubmitBtn" class="glass-auth-btn-primary" style="white-space: nowrap; width: auto; padding: 0 1.4rem;">
            التحقق وإرسال رمز الأمان للإيميل ➔
          </button>
        </div>
      </form>
    `, { glass: true });
  }

  async handleRegisterStep1(e) {
    e.preventDefault();
    const fullName = (document.getElementById('regFullName')?.value || '').trim();
    const employeeId = (document.getElementById('regEmployeeId')?.value || '').trim().toUpperCase();
    const email = (document.getElementById('regEmail')?.value || '').trim().toLowerCase();
    const password = document.getElementById('regPassword')?.value || '';
    const confirmPass = document.getElementById('regConfirmPassword')?.value || '';
    const errEl = document.getElementById('regErrorMsg');
    const submitBtn = document.getElementById('regSubmitBtn');

    if (errEl) errEl.style.display = 'none';

    // 1. Password Matching
    if (password !== confirmPass) {
      if (errEl) {
        errEl.textContent = 'كلمتا المرور غير متطابقتين.';
        errEl.style.display = 'block';
      }
      return;
    }

    // 2. Name validation
    const nameParts = fullName.split(/\s+/).filter(Boolean);
    if (nameParts.length < 2) {
      if (errEl) {
        errEl.textContent = 'يرجى إدخال الاسم الثلاثي واللقب بشكل كامل.';
        errEl.style.display = 'block';
      }
      return;
    }

    // 3. Strict Staff Directory Verification
    const staffRecord = window.auth.validateEmployeeDirectory(employeeId);
    if (!staffRecord) {
      if (errEl) {
        errEl.textContent = 'عذراً، الرقم الوظيفي المدخل غير مدرج في سجلات وملاكات قسم الإنتاج الجنوبي. يرجى مراجعة إدارة الموارد البشرية.';
        errEl.style.display = 'block';
      }
      return;
    }

    // 4. Check if already registered
    const existingUser = window.store.getUserByEmail(email) || window.store.getUserByEmployeeId(employeeId);
    if (existingUser) {
      if (errEl) {
        errEl.textContent = 'الرقم الوظيفي أو البريد الإلكتروني مرتبط بحساب مستخدم مسجل مسبقاً.';
        errEl.style.display = 'block';
      }
      return;
    }

    // 5. Send OTP to email via server
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'جاري إرسال رمز الأمان... ⏳';
    }

    try {
      const res = await fetch('/api/auth/register-send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, employeeId, email })
      });
      const data = await res.json();

      if (data && data.success) {
        this._pendingRegistration = {
          fullName,
          employeeId,
          email,
          password,
          otpPreview: data.otpPreview,
          simulated: data.simulated
        };
        this.renderRegisterOtpStep();
      } else {
        if (errEl) {
          errEl.textContent = data ? data.error : 'فشل إرسال رمز التحقق';
          errEl.style.display = 'block';
        }
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'التحقق وإرسال رمز الأمان للإيميل ➔';
        }
      }
    } catch (apiErr) {
      console.warn('Server registration OTP fallback:', apiErr);
      // Fallback in case of local offline testing
      const generatedOtp = String(Math.floor(100000 + Math.random() * 900000));
      this._pendingRegistration = {
        fullName,
        employeeId,
        email,
        password,
        otpPreview: generatedOtp,
        simulated: true
      };
      this.renderRegisterOtpStep();
    }
  }

  renderRegisterOtpStep() {
    const reg = this._pendingRegistration;
    if (!reg) return this.openRegisterModal();

    this.showModal('🔐 تأكيد رمز التحقق السري (OTP)', `
      <form onsubmit="window.app.handleRegisterOtpVerify(event)" class="otp-glass-screen">
        <div style="width: 60px; height: 60px; margin: 0 auto 0.8rem; background: rgba(0, 223, 216, 0.12); border: 1.5px solid rgba(0, 223, 216, 0.4); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.8rem; box-shadow: 0 0 20px rgba(0, 223, 216, 0.25);">
          📧
        </div>
        <h3 style="font-size: 1.2rem; font-weight: 800; color: #00dfd8; margin-bottom: 0.5rem; text-shadow: 0 2px 8px rgba(0,0,0,0.5);">
          تم إرسال رمز الأمان السري
        </h3>
        <p style="font-size: 0.88rem; color: #cbd5e1; margin-bottom: 1.3rem; line-height: 1.7;">
          تم إرسال رمز تحقق مكون من 6 أرقام إلى بريدك الإلكتروني:<br>
          <strong style="color: #38bdf8; font-size: 0.95rem; font-family: monospace;">${reg.email}</strong><br>
          لتأكيد هويتك للرقم الوظيفي: <strong style="color: #fbbf24; font-family: monospace;">${reg.employeeId}</strong>
        </p>

        <div style="margin-bottom: 1.2rem;">
          <input 
            type="text" 
            id="regOtpInput" 
            class="otp-code-input" 
            maxlength="6" 
            placeholder="••••••" 
            required 
            autofocus
            autocomplete="one-time-code">
        </div>

        <div id="regOtpErrorMsg" class="glass-error-banner"></div>

        <div style="display: flex; gap: 0.6rem; justify-content: space-between; align-items: center; margin-top: 1.4rem; border-top: 1px solid rgba(255, 255, 255, 0.1); padding-top: 1.1rem;">
          <button type="button" class="glass-auth-btn-secondary" onclick="window.app.openRegisterModal()" style="white-space: nowrap;">
            ↩ تعديل البيانات
          </button>
          <button type="submit" id="regVerifyBtn" class="glass-auth-btn-primary" style="white-space: nowrap; width: auto; padding: 0 1.5rem;">
            تأكيد الرمز وإكمال التسجيل ➔
          </button>
        </div>
      </form>
    `, { glass: true });
  }

  async handleRegisterOtpVerify(e) {
    e.preventDefault();
    const reg = this._pendingRegistration;
    if (!reg) return;

    const otp = (document.getElementById('regOtpInput')?.value || '').trim();
    const errEl = document.getElementById('regOtpErrorMsg');
    const verifyBtn = document.getElementById('regVerifyBtn');

    if (errEl) errEl.style.display = 'none';

    if (otp.length !== 6) {
      if (errEl) {
        errEl.textContent = 'يرجى إدخال رمز التحقق المكون من 6 أرقام بشكل كامل.';
        errEl.style.display = 'block';
      }
      return;
    }

    if (verifyBtn) {
      verifyBtn.disabled = true;
      verifyBtn.textContent = 'جاري التحقق والاعتماد... ⏳';
    }

    try {
      const res = await fetch('/api/auth/register-verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: reg.email,
          employeeId: reg.employeeId,
          otp,
          password: reg.password,
          fullName: reg.fullName
        })
      });
      const data = await res.json();

      if (data && data.success) {
        // Also register in client-side store
        window.auth.register({
          fullName: reg.fullName,
          employeeId: reg.employeeId,
          email: reg.email,
          password: reg.password
        });

        this.closeModal();
        alert('✓ تم التحقق بنجاح من بريدك الإلكتروني والرقم الوظيفي!\nتم تقديم طلب إنشاء الحساب بنجاح وهو الآن بانتظار اعتماد الصلاحيات من إدارة القسم.');
        
        this.render();

        // Pre-fill login identifier
        setTimeout(() => {
          this.quickFillLogin(reg.employeeId, '');
        }, 100);
      } else {
        if (errEl) {
          errEl.textContent = data ? data.error : 'فشل التحقق من الرمز';
          errEl.style.display = 'block';
        }
        if (verifyBtn) {
          verifyBtn.disabled = false;
          verifyBtn.textContent = 'تأكيد الرمز وإكمال التسجيل ➔';
        }
      }
    } catch (apiErr) {
      console.warn('Verify OTP fallback:', apiErr);
      // Fallback local validation
      if (reg.otpPreview && otp === reg.otpPreview) {
        window.auth.register({
          fullName: reg.fullName,
          employeeId: reg.employeeId,
          email: reg.email,
          password: reg.password
        });
        this.closeModal();
        alert('✓ تم التحقق من بريدك الإلكتروني بنجاح! تم إنشاء الحساب وحالته الآن (قيد الاعتماد).');
        this.render();
      } else {
        if (errEl) {
          errEl.textContent = 'رمز التحقق غير صحيح أو انتهت صلاحيته.';
          errEl.style.display = 'block';
        }
        if (verifyBtn) {
          verifyBtn.disabled = false;
          verifyBtn.textContent = 'تأكيد الرمز وإكمال التسجيل ➔';
        }
      }
    }
  }

  // --- Forgot Password System ---
  openForgotPasswordModal() {
    this._forgotOtpData = null;
    this.showModal('🔑 استرجاع كلمة المرور للمنظومة', `
      <div id="forgotPassContainer">
        <form onsubmit="window.app.handleForgotPasswordStep1(event)">
          <p style="font-size: 0.88rem; color: #cbd5e1; margin-bottom: 1.2rem; line-height: 1.6;">
            يرجى إدخال الرقم الوظيفي والبريد الإلكتروني المعتمد للتحقق من هويتك في قاعدة بيانات ملاكات قسم الإنتاج الجنوبي:
          </p>

          <div class="glass-field-group">
            <label class="glass-field-label">الرقم الوظيفي (للكوادر فقط — المؤسس معفى)</label>
            <div class="glass-input-wrapper">
              <input type="text" id="forgotEmpId" class="glass-auth-input" placeholder="الرقم الوظيفي للكوادر">
            </div>
            <small style="color: #94a3b8; font-size: 0.75rem; margin-top: 0.35rem; display: block;">المؤسس يسترجع حسابه بالبريد الإلكتروني فقط دون الحاجة لرقم وظيفي</small>
          </div>

          <div class="glass-field-group">
            <label class="glass-field-label">البريد الإلكتروني المسجل</label>
            <div class="glass-input-wrapper">
              <input type="email" id="forgotEmail" class="glass-auth-input" placeholder="البريد الإلكتروني المسجل" required>
            </div>
          </div>

          <div id="forgotErrorMsg" class="glass-error-banner"></div>

          <div style="display: flex; gap: 0.6rem; justify-content: flex-end; align-items: center; white-space: nowrap; flex-wrap: nowrap; border-top: 1px solid rgba(255, 255, 255, 0.1); padding-top: 1rem; margin-top: 0.5rem;">
            <button type="button" class="glass-auth-btn-secondary" onclick="window.app.closeModal()">إلغاء</button>
            <button type="submit" id="forgotSubmitBtn" class="glass-auth-btn-primary" style="white-space: nowrap; width: auto; padding: 0 1.4rem;">
              التحقق وإرسال رمز الأمان ➔
            </button>
          </div>
        </form>
      </div>
    `, { glass: true });
  }

  async handleForgotPasswordStep1(e) {
    e.preventDefault();
    const empId = (document.getElementById('forgotEmpId')?.value || '').trim();
    const email = (document.getElementById('forgotEmail')?.value || '').trim();
    const errEl = document.getElementById('forgotErrorMsg');

    if (!email) {
      if (errEl) {
        errEl.textContent = 'يرجى إدخال البريد الإلكتروني.';
        errEl.style.display = 'block';
      }
      return;
    }

    const cleanEmail = email.toLowerCase().trim();
    const isFounderEmail = cleanEmail === 'hussein123119@gmail.com' || cleanEmail === 'southprod.rumaila@gmail.com' || cleanEmail === 'founder@local.spd';

    if (!isFounderEmail && !empId) {
      if (errEl) {
        errEl.textContent = 'يرجى إدخال الرقم الوظيفي والبريد الإلكتروني.';
        errEl.style.display = 'block';
      }
      return;
    }

    let user = window.store.getUserByEmail(email);
    if (!user && isFounderEmail) {
      user = window.store.getUserById('user-founder') || (window.store.getDb().users || []).find(u => u && (u.role === 'SUPER_ADMIN' || u.id === 'user-founder'));
    }

    if (!user) {
      if (errEl) {
        errEl.textContent = 'عذراً، هذا البريد الإلكتروني غير مسجل في المنظومة.';
        errEl.style.display = 'block';
      }
      return;
    }

    const isFounderUser = user.role === 'SUPER_ADMIN' || user.id === 'user-founder' || isFounderEmail;
    if (!isFounderUser) {
      if ((user.employeeId || '').trim().toUpperCase() !== empId.toUpperCase()) {
        if (errEl) {
          errEl.textContent = 'الرقم الوظيفي غير مطابق للبريد الإلكتروني المدخل.';
          errEl.style.display = 'block';
        }
        return;
      }
    }

    // Call server API for real email dispatch
    let generatedOtp = String(Math.floor(100000 + Math.random() * 900000));
    let deliveredReal = false;
    let providerLabel = 'خادم جيميل المباشر المعتمد';

    try {
      const resp = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, employeeId: empId })
      });
      const data = await resp.json();
      if (data.success) {
        deliveredReal = data.deliveredReal;
        if (data.otpPreview) generatedOtp = data.otpPreview;
        if (data.providerLabel) providerLabel = data.providerLabel;
      }
    } catch (apiErr) {
      console.log('Server email API fallback to local:', apiErr);
    }

    this._forgotOtpData = {
      empId,
      email,
      otp: generatedOtp,
      userId: user.id,
      fullName: user.fullName,
      deliveredReal,
      providerLabel
    };

    // Render Step 2 inside the modal container
    const container = document.getElementById('forgotPassContainer');
    if (container) {
      container.innerHTML = `
        <form onsubmit="window.app.handleForgotPasswordStep2(event)">
          <div style="background: rgba(0, 223, 216, 0.08); border: 1px solid rgba(0, 223, 216, 0.3); border-radius: 12px; padding: 0.9rem 1.1rem; margin-bottom: 1.2rem;">
            <div style="font-size: 0.9rem; color: #00dfd8; font-weight: 800;">
              ✓ تم التحقق بنجاح من هوية المنتسب: <strong>${user.fullName}</strong>
            </div>
            <div style="font-size: 0.84rem; color: #cbd5e1; margin-top: 0.35rem;">
              تم إرسال رمز الأمان السري عبر: <strong style="color: #38bdf8;">${providerLabel}</strong> إلى بريدك الإلكتروني.
            </div>
            <div style="margin-top: 0.6rem; background: rgba(7, 13, 29, 0.85); padding: 0.45rem 0.9rem; border-radius: 8px; font-size: 0.84rem; border: 1px dashed rgba(0, 223, 216, 0.5); display: inline-block;">
              رمز التحقق للاختبار السريع: <strong style="color: #00dfd8; font-family: monospace; font-size: 1.05rem; letter-spacing: 2px;">${generatedOtp}</strong>
            </div>
          </div>

          <div class="glass-field-group">
            <label class="glass-field-label">رمز التحقق السري المؤقت</label>
            <div class="glass-input-wrapper">
              <input type="text" id="forgotOtpInput" class="glass-auth-input" placeholder="أدخل 6 أرقام" maxlength="6" required style="letter-spacing: 4px; font-weight: 800; font-size: 1.1rem; text-align: center;">
            </div>
          </div>

          <div class="glass-field-group">
            <label class="glass-field-label">كلمة المرور الجديدة</label>
            <div class="glass-input-wrapper">
              <input type="password" id="forgotNewPass" class="glass-auth-input" placeholder="••••••••" minlength="6" required>
            </div>
          </div>

          <div class="glass-field-group">
            <label class="glass-field-label">تأكيد كلمة المرور الجديدة</label>
            <div class="glass-input-wrapper">
              <input type="password" id="forgotConfirmPass" class="glass-auth-input" placeholder="••••••••" minlength="6" required>
            </div>
          </div>

          <div id="forgotStep2ErrorMsg" class="glass-error-banner"></div>

          <div style="display: flex; gap: 0.6rem; justify-content: flex-end; align-items: center; white-space: nowrap; flex-wrap: nowrap; border-top: 1px solid rgba(255, 255, 255, 0.1); padding-top: 1rem; margin-top: 0.5rem;">
            <button type="button" class="glass-auth-btn-secondary" onclick="window.app.closeModal()">إلغاء</button>
            <button type="submit" class="glass-auth-btn-primary" style="white-space: nowrap; width: auto; padding: 0 1.4rem;">
              حفظ كلمة المرور الجديدة وتأكيد الدخول
            </button>
          </div>
        </form>
      `;
    }
  }

  async handleForgotPasswordStep2(e) {
    e.preventDefault();
    if (!this._forgotOtpData) return;

    const enteredOtp = (document.getElementById('forgotOtpInput')?.value || '').trim();
    const newPass = document.getElementById('forgotNewPass')?.value || '';
    const confirmPass = document.getElementById('forgotConfirmPass')?.value || '';
    const errEl = document.getElementById('forgotStep2ErrorMsg');

    if (enteredOtp !== this._forgotOtpData.otp) {
      if (errEl) {
        errEl.textContent = 'رمز التحقق غير صحيح! يرجى التأكد وإعادة المحاولة.';
        errEl.style.display = 'block';
      }
      return;
    }

    if (newPass.length < 6) {
      if (errEl) {
        errEl.textContent = 'يجب ألا تقل كلمة المرور الجديدة عن 6 خانات.';
        errEl.style.display = 'block';
      }
      return;
    }

    if (newPass !== confirmPass) {
      if (errEl) {
        errEl.textContent = 'كلمتا المرور غير متطابقتين.';
        errEl.style.display = 'block';
      }
      return;
    }

    // Call server verify API
    try {
      await fetch('/api/auth/verify-otp-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: this._forgotOtpData.email,
          employeeId: this._forgotOtpData.empId,
          otp: enteredOtp,
          newPassword: newPass
        })
      });
    } catch (e) {
      console.log('Server verify API fallback:', e);
    }

    const res = window.auth.resetPassword(this._forgotOtpData.empId, this._forgotOtpData.email, newPass);
    if (res && res.success) {
      this.closeModal();
      alert('✓ ' + res.message);
      // Fill login inputs
      const emailInp = document.getElementById('loginEmail');
      const empInp = document.getElementById('loginEmployeeId');
      const passInp = document.getElementById('loginPassword');
      if (emailInp) emailInp.value = this._forgotOtpData.email;
      if (empInp) empInp.value = this._forgotOtpData.empId;
      if (passInp) passInp.value = newPass;
      this._forgotOtpData = null;
    } else {
      if (errEl) {
        errEl.textContent = res ? res.error : 'فشلت عملية إعادة التعيين';
        errEl.style.display = 'block';
      }
    }
  }

  handleChangePasswordSubmit(e) {
    e.preventDefault();
    const currPass = document.getElementById('currPassword')?.value || '';
    const newPass = document.getElementById('newPassword')?.value || '';
    const confirmPass = document.getElementById('confirmNewPassword')?.value || '';
    const msgEl = document.getElementById('changePassMsg');

    const user = window.auth.getCurrentUser();
    if (!user) return;

    if (user.password && user.password !== currPass) {
      if (msgEl) {
        msgEl.style.color = 'var(--md-sys-color-error, #ba1a1a)';
        msgEl.textContent = 'كلمة المرور الحالية غير صحيحة!';
        msgEl.style.display = 'block';
      }
      return;
    }

    if (newPass.length < 6) {
      if (msgEl) {
        msgEl.style.color = 'var(--md-sys-color-error, #ba1a1a)';
        msgEl.textContent = 'يجب ألا تقل كلمة المرور الجديدة عن 6 خانات.';
        msgEl.style.display = 'block';
      }
      return;
    }

    if (newPass !== confirmPass) {
      if (msgEl) {
        msgEl.style.color = 'var(--md-sys-color-error, #ba1a1a)';
        msgEl.textContent = 'كلمتا المرور الجديدتان غير متطابقتين!';
        msgEl.style.display = 'block';
      }
      return;
    }

    // Update in client store & session
    window.store.updateUser(user.id, { password: newPass });
    user.password = newPass;
    window.auth.saveSession(user);

    // Sync to backend DB
    fetch('/api/users/update-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, newPassword: newPass })
    }).catch(err => console.log('Password backend sync notice:', err));

    if (msgEl) {
      msgEl.style.color = '#10b981';
      msgEl.textContent = '✓ تم حفظ وتحديث كلمة المرور الجديدة بنجاح!';
      msgEl.style.display = 'block';
    }
    alert('✓ تم تحديث كلمة المرور الخاصة بحسابك بنجاح تام!');
    const currInp = document.getElementById('currPassword');
    const newInp = document.getElementById('newPassword');
    const confInp = document.getElementById('confirmNewPassword');
    if (currInp) currInp.value = '';
    if (newInp) newInp.value = '';
    if (confInp) confInp.value = '';
  }

  openCreateWordDocModal() {
    const user = window.auth.getCurrentUser();
    this.showModal('📄 إنشاء مستند Word جديد', `
      <form onsubmit="window.app.handleCreateWordSubmit(event)">
        <div class="form-group">
          <label class="form-label">عنوان المستند</label>
          <input type="text" id="wordTitle" class="form-control" placeholder="تقرير الصيانة / كتاب رسمي" required>
        </div>
        <div class="form-group">
          <label class="form-label">محتوى المستند (محرر النصوص)</label>
          <textarea id="wordContent" class="form-control" rows="8" placeholder="اكتب نص المستند هنا..." required></textarea>
        </div>
        <div class="form-group">
          <label class="form-label">حالة النشر</label>
          <select id="wordStatus" class="form-control">
            <option value="PUBLISHED">نشر فوراً (Published)</option>
            <option value="DRAFT">حفظ كمسودة خاصة (Draft)</option>
          </select>
        </div>
        <button type="submit" class="btn btn-primary" style="width: 100%;">حفظ المستند</button>
      </form>
    `);
  }

  handleCreateWordSubmit(e) {
    e.preventDefault();
    const user = window.auth.getCurrentUser();
    const title = document.getElementById('wordTitle').value;
    const content = document.getElementById('wordContent').value;
    const status = document.getElementById('wordStatus').value;

    window.store.addDocument({
      id: 'doc-' + Date.now(),
      departmentId: user.departmentId,
      title,
      category: 'WORD',
      status,
      privacy: 'PUBLIC',
      version: '1.0',
      createdBy: user.id,
      createdByName: user.fullName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      content: `<p>${content.replace(/\n/g, '<br/>')}</p>`
    });

    window.store.logActivity(user.departmentId, user.id, user.employeeId, 'CREATE_DOCUMENT', 'DOCUMENT', `إنشاء مستند Word: ${title}`);
    this.closeModal();
    this.render();
  }

  openCreateExcelSheetModal() {
    const user = window.auth.getCurrentUser();
    this.showModal('📊 إنشاء جدول Excel جديد', `
      <form onsubmit="window.app.handleCreateExcelSubmit(event)">
        <div class="form-group">
          <label class="form-label">عنوان جدول البيانات</label>
          <input type="text" id="excelTitle" class="form-control" placeholder="جدول قراءات العدادات / الحسابات" required>
        </div>
        <p style="font-size: 0.8rem; color: var(--md-sys-color-outline); margin-bottom: 1rem;">
          سيتم إنشاء جدول بيانات تفاعلي بمصفوفة أصولية للقسم.
        </p>
        <button type="submit" class="btn btn-primary" style="width: 100%;">إنشاء ورقة العمل</button>
      </form>
    `);
  }

  handleCreateExcelSubmit(e) {
    e.preventDefault();
    const user = window.auth.getCurrentUser();
    const title = document.getElementById('excelTitle').value;

    window.store.addDocument({
      id: 'doc-' + Date.now(),
      departmentId: user.departmentId,
      title,
      category: 'EXCEL',
      status: 'PUBLISHED',
      privacy: 'PUBLIC',
      version: '1.0',
      createdBy: user.id,
      createdByName: user.fullName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      gridData: [
        ['اسم المحطة', 'القراءة الأولى', 'القراءة الثانية', 'المجموع / الملاحظة'],
        ['المركزية', '1200', '1500', '2700'],
        ['الجنوبية', '950', '1100', '2050']
      ]
    });

    this.closeModal();
    this.render();
  }

  openCreateAnnouncementModal() {
    this.showModal('📢 نشر إعلان عام للقسم', `
      <form onsubmit="window.app.handleCreateAnnouncementSubmit(event)">
        <div class="form-group">
          <label class="form-label">عنوان الإعلان</label>
          <input type="text" id="ancTitle" class="form-control" required>
        </div>
        <div class="form-group">
          <label class="form-label">نص الإعلان</label>
          <textarea id="ancContent" class="form-control" rows="4" required></textarea>
        </div>
        <div class="form-group">
          <label class="form-label">درجة الأهمية</label>
          <select id="ancImportance" class="form-control">
            <option value="NORMAL">عادي</option>
            <option value="HIGH">هام</option>
            <option value="URGENT">عاجل جداً</option>
          </select>
        </div>
        <div class="form-group">
          <label><input type="checkbox" id="ancPinned" checked> تثبيت في الشريط المركزي العلوي</label>
        </div>
        <button type="submit" class="btn btn-primary" style="width: 100%;">نشر الإعلان</button>
      </form>
    `);
  }

  handleCreateAnnouncementSubmit(e) {
    e.preventDefault();
    const user = window.auth.getCurrentUser();
    const title = document.getElementById('ancTitle').value;
    const content = document.getElementById('ancContent').value;
    const importance = document.getElementById('ancImportance').value;
    const isPinned = document.getElementById('ancPinned').checked;

    // Unpin other announcements if this is pinned so it becomes the single active ticker
    if (isPinned) {
      const db = window.store.getDb();
      (db.announcements || []).forEach(a => {
        if (a.departmentId === user.departmentId) a.isPinned = false;
      });
      window.store.saveDb(db);
    }

    window.store.addAnnouncement({
      id: 'anc-' + Date.now(),
      departmentId: user.departmentId,
      targetType: 'ALL_DEPARTMENT',
      targetId: null,
      title,
      content,
      importance,
      status: 'PUBLISHED',
      isPinned,
      publishDate: new Date().toISOString(),
      createdBy: user.id
    });

    window.store.logActivity(user.departmentId, user.id, user.employeeId, 'PUBLISH_ANNOUNCEMENT', 'ANNOUNCEMENT', `نشر إعلان في شريط الأخبار: ${title}`);
    this.closeModal();
    this.render();
  }

  setActiveTickerAnnouncement(ancId) {
    const user = window.auth.getCurrentUser();
    const db = window.store.getDb();
    (db.announcements || []).forEach(a => {
      if (a.departmentId === user.departmentId) {
        a.isPinned = (a.id === ancId);
      }
    });
    window.store.saveDb(db);
    window.store.logActivity(user.departmentId, user.id, user.employeeId, 'SET_ACTIVE_TICKER', 'ANNOUNCEMENT', `تفعيل الإعلان ${ancId} كشريط أخبار رئيسي`);
    this.render();
  }

  handleDeleteAnnouncement(ancId) {
    const user = window.auth.getCurrentUser();
    if (confirm('هل أنت متأكد من حذف هذا الإعلان؟')) {
      const db = window.store.getDb();
      const anc = (db.announcements || []).find(a => a.id === ancId);
      if (anc) {
        window.store.moveToRecycleBin(user.departmentId, 'ANNOUNCEMENT', anc.title, anc, user);
      }
      window.store.deleteAnnouncement(ancId);
      window.store.logActivity(user.departmentId, user.id, user.employeeId, 'DELETE_ANNOUNCEMENT', 'ANNOUNCEMENT', `حذف الإعلان ${ancId}`);
      this.render();
    }
  }

  openCreateNotificationModal() {
    const user = window.auth.getCurrentUser();
    const sections = window.store.getSections(user.departmentId) || [];
    const units = window.store.getUnits(user.departmentId) || [];

    this.showModal('🔔 إصدار تبليغ وتوجيه إداري رسمي', `
      <form onsubmit="window.app.handleCreateNotificationSubmit(event)">
        <div class="form-group">
          <label class="form-label">عنوان التبليغ والتوجيه:</label>
          <input type="text" id="notifTitle" class="form-control" placeholder="مثال: تعليمات السلامة وخطة التشغيل الميداني..." required>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
          <div class="form-group">
            <label class="form-label">الجهة المستهدفة والنطاق:</label>
            <select id="notifTargetSelect" class="form-control" required>
              <option value="ALL_SECTIONS">🌐 تعميم لكافة شعب ووحدات القسم</option>
              
              <optgroup label="🏢 شعب القسم الإنتاجية والفنية">
                ${sections.map(s => `<option value="SECTION:${s.id}">🏢 ${s.name}</option>`).join('')}
              </optgroup>

              <optgroup label="⚡ الوحدات التابعة لإدارة القسم">
                ${units.map(u => `<option value="UNIT:${u.id}">⚡ ${u.name}</option>`).join('')}
              </optgroup>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">درجة الأهمية:</label>
            <select id="notifImportanceSelect" class="form-control">
              <option value="NORMAL">عادي</option>
              <option value="HIGH">⚠️ هام</option>
              <option value="URGENT">🚨 عاجل وهام جداً</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">نص التبليغ والتوجيهات الرسمية:</label>
          <textarea id="notifBody" class="form-control" rows="5" placeholder="اكتب التعليمات والتوجيهات الرسمية الصادرة هنا..." required></textarea>
        </div>

        <div style="margin-top: 1.25rem; display: flex; justify-content: flex-end; gap: 0.5rem;">
          <button type="button" class="btn btn-outline" onclick="window.app.closeModal()">إلغاء</button>
          <button type="submit" class="btn btn-glass-primary" style="font-weight: 800;">
            <span>📢 إصدار ونشر التبليغ فوراً</span>
          </button>
        </div>
      </form>
    `);
  }

  handleCreateNotificationSubmit(e) {
    e.preventDefault();
    const user = window.auth.getCurrentUser();
    const title = document.getElementById('notifTitle').value.trim();
    const targetScopeVal = document.getElementById('notifTargetSelect').value;
    const importance = document.getElementById('notifImportanceSelect').value;
    const content = document.getElementById('notifBody').value.trim();

    const sections = window.store.getSections(user.departmentId) || [];
    const units = window.store.getUnits(user.departmentId) || [];

    let targetScope = 'ALL_SECTIONS';
    let targetSectionId = null;
    let targetUnitId = null;
    let targetSectionName = 'كافة شعب ووحدات القسم';

    if (targetScopeVal.startsWith('SECTION:')) {
      targetScope = 'SECTION';
      targetSectionId = targetScopeVal.replace('SECTION:', '');
      const sec = sections.find(s => s.id === targetSectionId);
      targetSectionName = sec ? sec.name : 'شعبة محددة';
    } else if (targetScopeVal.startsWith('UNIT:')) {
      targetScope = 'UNIT';
      targetUnitId = targetScopeVal.replace('UNIT:', '');
      const unit = units.find(u => u.id === targetUnitId);
      targetSectionName = unit ? unit.name : 'وحدة محددة';
    } else if (targetScopeVal !== 'ALL_SECTIONS') {
      // Legacy fallback
      const sec = sections.find(s => s.id === targetScopeVal);
      targetScope = 'SECTION';
      targetSectionId = targetScopeVal;
      targetSectionName = sec ? sec.name : 'شعبة محددة';
    }

    const notifObj = {
      title,
      content,
      importance,
      priority: importance,
      targetScope,
      targetSectionId,
      targetUnitId,
      targetSectionName,
      status: 'PUBLISHED',
      isPinned: importance === 'URGENT',
      publishDate: new Date().toISOString(),
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      createdByName: user.fullName + ' (' + (user.jobTitle || 'إدارة القسم') + ')'
    };

    if (window.store.addOfficialNotification) {
      window.store.addOfficialNotification(notifObj, user);
    } else {
      window.store.addNotification(notifObj);
    }

    alert('تم إصدار التبليغ وتعميمه بنجاح.');
    this.closeModal();
    this.render();
  }

  openCreateVehicleModal() {
    this.showModal('🚘 تسجيل حركة سيارة جديدة', `
      <form onsubmit="window.app.handleCreateVehicleSubmit(event)">
        <div class="form-group">
          <label class="form-label">رقم السيارة والمركبة</label>
          <input type="text" id="vmNum" class="form-control" placeholder="76543 - بصرة" required>
        </div>
        <div class="form-group">
          <label class="form-label">نوع السيارة</label>
          <input type="text" id="vmType" class="form-control" placeholder="تويوتا بيك أب" required>
        </div>
        <div class="form-group">
          <label class="form-label">اسم السائق</label>
          <input type="text" id="vmDriver" class="form-control" required>
        </div>
        <div class="form-group">
          <label class="form-label">الوجهة / المحطة</label>
          <input type="text" id="vmDest" class="form-control" placeholder="محطة الرطكة / الشعبة الأولى" required>
        </div>
        <div class="form-group">
          <label class="form-label">الغرض والمهام</label>
          <textarea id="vmPurpose" class="form-control" rows="2" required></textarea>
        </div>
        <button type="submit" class="btn btn-primary" style="width: 100%;">تسجيل الخروج</button>
      </form>
    `);
  }

  handleCreateVehicleSubmit(e) {
    e.preventDefault();
    const user = window.auth.getCurrentUser();
    const vehicleNumber = document.getElementById('vmNum').value;
    const vehicleType = document.getElementById('vmType').value;
    const driverName = document.getElementById('vmDriver').value;
    const destination = document.getElementById('vmDest').value;
    const purpose = document.getElementById('vmPurpose').value;

    window.store.addVehicleMovement({
      id: 'vm-' + Date.now(),
      departmentId: user.departmentId,
      vehicleNumber,
      vehicleType,
      driverName,
      destination,
      exitTime: new Date().toISOString(),
      entryTime: null,
      purpose,
      status: 'IN_TRANSIT'
    });

    this.closeModal();
    this.render();
  }

  markVehicleReturn(vmId) {
    const db = window.store.getDb();
    const vm = db.vehicleMovements.find(v => v.id === vmId);
    if (vm) {
      vm.entryTime = new Date().toISOString();
      vm.status = 'COMPLETED';
      window.store.saveDb(db);
      this.render();
    }
  }

  approveUser(userId) {
    const user = window.auth.getCurrentUser();
    window.store.updateUser(userId, { status: 'APPROVED' });
    window.store.logActivity(user.departmentId, user.id, user.employeeId, 'APPROVE_USER', 'USER', `قبول حساب المستخدم: ${userId}`);
    this.render();
  }

  rejectUser(userId) {
    const user = window.auth.getCurrentUser();
    window.store.updateUser(userId, { status: 'REJECTED' });
    window.store.logActivity(user.departmentId, user.id, user.employeeId, 'REJECT_USER', 'USER', `رفض طلب المستخدم: ${userId}`);
    this.render();
  }

  setStationSubTab(subTab) {
    this.currentStationSubTab = subTab;
    this.render();
  }

  openViewDocumentModal(docId) {
    const user = window.auth.getCurrentUser();
    const doc = window.store.getDocuments(user.departmentId).find(d => d.id === docId);
    if (!doc) {
      alert('الوثيقة غير موجودة.');
      return;
    }

    const canEdit = window.rbac && typeof window.rbac.hasPermission === 'function'
      ? (window.rbac.hasPermission(user, 'FILES_EDIT') || ['SUPER_ADMIN', 'DEPT_MANAGER', 'SECTION_MANAGER'].includes(user.role))
      : ['SUPER_ADMIN', 'DEPT_MANAGER', 'SECTION_MANAGER'].includes(user?.role);

    let bodyHtml = '';
    if (doc.fileData && (doc.category === 'PDF' || (doc.fileName && doc.fileName.match(/\.pdf$/i)))) {
      bodyHtml = `
        <div style="margin-bottom: 1rem; display: flex; gap: 0.5rem; flex-wrap: wrap; align-items: center;">
          <span class="badge badge-danger">📕 ملف PDF جاهز</span>
          <span class="badge badge-info">${doc.fileName || 'document.pdf'}</span>
          <span class="badge badge-success">🟢 معتمد</span>
        </div>
        <div style="border: 1px solid var(--md-sys-color-surface-variant); border-radius: var(--radius-md); overflow: hidden; background: #525659; min-height: 480px;">
          <iframe src="${doc.fileData}" style="width: 100%; height: 500px; border: none;" title="${doc.title}"></iframe>
        </div>
      `;
    } else if (doc.fileData && (doc.category === 'IMAGE' || (doc.fileName && doc.fileName.match(/\.(png|jpe?g|webp)$/i)))) {
      bodyHtml = `
        <div style="margin-bottom: 1rem; display: flex; gap: 0.5rem; flex-wrap: wrap; align-items: center;">
          <span class="badge badge-primary">🖼️ صورة / نموذج</span>
          <span class="badge badge-info">${doc.fileName || 'image.png'}</span>
        </div>
        <div style="text-align: center; padding: 1rem; background: var(--md-sys-color-background); border-radius: var(--radius-md); border: 1px solid var(--md-sys-color-surface-variant);">
          <img src="${doc.fileData}" alt="${doc.title}" style="max-width: 100%; max-height: 480px; object-fit: contain; border-radius: 8px;" />
        </div>
      `;
    } else if (doc.fileData) {
      const isExcel = doc.category === 'EXCEL' || (doc.fileName && doc.fileName.match(/\.xlsx?$/i));
      const icon = isExcel ? '📊' : '📄';
      const typeBadge = isExcel ? 'Excel Template' : 'Word Template';
      bodyHtml = `
        <div style="margin-bottom: 1rem; display: flex; gap: 0.5rem; flex-wrap: wrap; align-items: center;">
          <span class="badge badge-primary">${icon} قالب ${typeBadge}</span>
          <span class="badge badge-info">الملف: ${doc.fileName || 'form_template'}</span>
          <span class="badge badge-success">🟢 جاهز للتحميل والتعديل</span>
        </div>
        <div style="padding: 1.75rem; background: var(--md-sys-color-background); border-radius: var(--radius-md); border: 1px solid var(--md-sys-color-surface-variant); text-align: center;">
          <div style="font-size: 3rem; margin-bottom: 0.75rem;">${icon}</div>
          <h4 style="margin: 0 0 0.5rem 0; font-weight: 800; color: var(--md-sys-color-on-surface); font-size: 1.15rem;">${doc.title}</h4>
          <p style="color: var(--md-sys-color-outline); font-size: 0.88rem; max-width: 500px; margin: 0 auto 1.25rem auto; line-height: 1.6;">
            ${doc.content || 'هذا النموذج مرفوع بصيغة رسمية جاهزة للتحميل والاستخدام المباشر في البرامج المكتبية.'}
          </p>
          <button class="btn btn-glass-primary" onclick="window.app.downloadDocumentFile('${doc.id}')" style="font-size: 0.92rem; padding: 0.5rem 1.4rem;">
            <span>📥 تحميل وتعديل النموذج الأصلي (${doc.fileName || 'تحميل'})</span>
          </button>
        </div>
      `;
    } else if (doc.category === 'EXCEL' && doc.gridData) {
      const headers = doc.gridData[0] || [];
      const rows = doc.gridData.slice(1) || [];
      bodyHtml = `
        <div style="margin-bottom: 1rem; display: flex; gap: 0.5rem; flex-wrap: wrap; align-items: center;">
          <span class="badge badge-success">📊 جدول بيانات Excel</span>
          <span class="badge badge-info">الإصدار v${doc.version || '1.0'}</span>
          <span class="badge ${doc.status === 'PUBLISHED' ? 'badge-success' : 'badge-warning'}">
            ${doc.status === 'PUBLISHED' ? '🟢 معتمد ومنشور' : '🟡 مسودة قيد المراجعة'}
          </span>
        </div>
        <div class="table-container" style="max-height: 400px; overflow: auto; border: 1px solid var(--md-sys-color-surface-variant); border-radius: var(--radius-sm);">
          <table class="data-table">
            <thead>
              <tr style="background: #107c41; color: white;">
                ${headers.map(h => `<th style="color: white; border-color: #0c5e31;">${h}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${rows.map(row => `
                <tr>
                  ${row.map((cell, idx) => `<td style="${idx === 0 ? 'font-weight: bold;' : ''}">${cell}</td>`).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    } else {
      bodyHtml = `
        <div style="margin-bottom: 1rem; display: flex; gap: 0.5rem; flex-wrap: wrap; align-items: center;">
          <span class="badge ${doc.category === 'PDF' ? 'badge-danger' : 'badge-info'}">${doc.category === 'PDF' ? '📕 تقرير PDF' : '📄 مستند Word'}</span>
          <span class="badge badge-info">الإصدار v${doc.version || '1.0'}</span>
          <span class="badge ${doc.status === 'PUBLISHED' ? 'badge-success' : 'badge-warning'}">
            ${doc.status === 'PUBLISHED' ? '🟢 معتمد ومنشور' : '🟡 مسودة قيد المراجعة'}
          </span>
        </div>
        <div style="padding: 1.5rem; background: var(--md-sys-color-background); border-radius: var(--radius-md); font-size: 1rem; line-height: 1.8; border: 1px solid var(--md-sys-color-surface-variant);">
          ${doc.content || '<p>محتوى المستند فارغ</p>'}
        </div>
      `;
    }

    this.showModal(`📄 ${doc.title}`, `
      ${bodyHtml}
      <div style="margin-top: 1.5rem; display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--md-sys-color-surface-variant); padding-top: 1.15rem; gap: 0.75rem; flex-wrap: nowrap;">
        <div style="font-size: 0.85rem; color: var(--md-sys-color-outline); display: flex; align-items: center; gap: 0.5rem; white-space: nowrap;">
          <span>المنشئ: <strong style="color: var(--md-sys-color-on-surface);">${doc.createdByName || '-'}</strong></span>
          <span>|</span>
          <span>التاريخ: <strong style="color: var(--md-sys-color-primary); font-family: monospace; font-size: 0.9rem;">${new Date(doc.createdAt || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</strong></span>
        </div>
        <div style="display: flex; gap: 0.45rem; align-items: center; flex-wrap: nowrap; white-space: nowrap;">
          ${canEdit ? `
            <button class="btn btn-glass-emerald" onclick="window.app.openEditDocumentModal('${doc.id}')" title="تعديل محتوى المستند" style="white-space: nowrap; padding: 0.45rem 0.85rem; font-size: 0.86rem;">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
              <span>تعديل</span>
              <span style="font-size: 0.95rem;">✏️</span>
            </button>
          ` : ''}
          <button class="btn btn-glass-amber" onclick="window.app.printDocumentFile('${doc.id}')" title="طباعة رسمية أو تصدير فوري إلى PDF" style="white-space: nowrap; padding: 0.45rem 0.85rem; font-size: 0.86rem;">
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="6 9 6 2 18 2 18 9"></polyline>
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
              <rect x="6" y="14" width="12" height="8"></rect>
            </svg>
            <span>طباعة / تصدير PDF</span>
            <span style="font-size: 0.95rem;">🖨️</span>
          </button>
          <button class="btn btn-glass-primary" onclick="window.app.downloadDocumentFile('${doc.id}')" title="تنزيل الملف الأصلي" style="white-space: nowrap; padding: 0.45rem 0.85rem; font-size: 0.86rem;">
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            <span>تنزيل ${doc.category === 'EXCEL' ? 'Excel (.csv)' : 'Word (.doc)'}</span>
            <span style="font-size: 0.95rem;">⬇️</span>
          </button>
          <button class="btn btn-glass-slate" onclick="window.app.closeModal()" title="إغلاق النافذة" style="white-space: nowrap; padding: 0.45rem 0.85rem; font-size: 0.86rem;">
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
            <span>إغلاق</span>
          </button>
        </div>
      </div>
    `, { size: 'lg', maxWidth: '980px' });
  }

  openDocumentViewModal(docId) {
    return this.openViewDocumentModal(docId);
  }

  openCreateDocumentModal() {
    const user = window.auth.getCurrentUser();
    const sections = window.store.getSections(user.departmentId) || [];
    
    this.showModal('📄 إضافة وثيقة أو تقرير رسمي جديد', `
      <form onsubmit="window.app.handleCreateDocumentSubmit(event)">
        <div class="form-group">
          <label class="form-label">عنوان الوثيقة / التقرير</label>
          <input type="text" id="docTitle" class="form-control" placeholder="مثال: تقرير الموقف اليومي لإنتاج النفط والغاز" required>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
          <div class="form-group">
            <label class="form-label">نوع وتصنيف الملف</label>
            <select id="docCategory" class="form-control" onchange="window.app.onDocCategoryChange(this.value)" required>
              <option value="WORD">📄 مستند Word / كتاب ومراسلات رسمية</option>
              <option value="EXCEL">📊 جدول بيانات Excel / تقرير أرقام وفحوصات</option>
              <option value="PDF">📕 تقرير PDF / وثيقة معتمدة ومؤرشفة</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">الجهة أو الشعبة المعنية</label>
            <select id="docSectionId" class="form-control">
              <option value="">🏢 إدارة القسم (المقر الرئيسي)</option>
              ${sections.map(s => `<option value="${s.id}">${s.name}</option>`).join('')}
            </select>
          </div>
        </div>

        <div id="docWordContentBox" class="form-group">
          <label class="form-label">محتوى ونص المستند / التقرير</label>
          <textarea id="docContent" class="form-control" rows="8" placeholder="اكتب نص المستند أو بنود التقرير الرسمي هنا..."></textarea>
        </div>

        <div id="docExcelGridBox" class="form-group" style="display: none;">
          <label class="form-label">بيانات الجدول (أدخل الصفوف مفصولة بفواصل):</label>
          <textarea id="docExcelData" class="form-control" rows="6" placeholder="المحطة, الإنتاج (برميل/يوم), الضغط (Bar), الحالة&#10;المحطة المركزية, 150000, 45, تشغيلي&#10;المحطة الجنوبية, 120000, 42, تشغيلي"></textarea>
          <small style="color: var(--md-sys-color-outline); font-size: 0.75rem;">الصف الأول يمثل عناوين الأعمدة والصفوف اللاحقة تمثل البيانات</small>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
          <div class="form-group">
            <label class="form-label">رقم الإصدار (Version)</label>
            <input type="text" id="docVersion" class="form-control" value="1.0" placeholder="1.0">
          </div>

          <div class="form-group">
            <label class="form-label">حالة النشر والاعتماد</label>
            <select id="docStatus" class="form-control">
              <option value="PUBLISHED">🟢 معتمد ومنشور (Published)</option>
              <option value="DRAFT">🟡 مسودة قيد المراجعة (Draft)</option>
            </select>
          </div>
        </div>

        <div style="margin-top: 1.25rem; display: flex; justify-content: flex-end; gap: 0.5rem;">
          <button type="button" class="btn btn-outline" onclick="window.app.closeModal()">إلغاء</button>
          <button type="submit" class="btn btn-primary" style="font-weight: 800;">
            💾 حفظ وتوثيق المستند
          </button>
        </div>
      </form>
    `);
  }

  onDocCategoryChange(cat) {
    const wordBox = document.getElementById('docWordContentBox');
    const excelBox = document.getElementById('docExcelGridBox');
    if (cat === 'EXCEL') {
      if (wordBox) wordBox.style.display = 'none';
      if (excelBox) excelBox.style.display = 'block';
    } else {
      if (wordBox) wordBox.style.display = 'block';
      if (excelBox) excelBox.style.display = 'none';
    }
  }

  handleCreateDocumentSubmit(e) {
    e.preventDefault();
    const user = window.auth.getCurrentUser();
    const title = document.getElementById('docTitle')?.value.trim();
    const category = document.getElementById('docCategory')?.value || 'WORD';
    const sectionId = document.getElementById('docSectionId')?.value || null;
    const version = document.getElementById('docVersion')?.value.trim() || '1.0';
    const status = document.getElementById('docStatus')?.value || 'PUBLISHED';
    const rawContent = document.getElementById('docContent')?.value || '';
    const rawExcel = document.getElementById('docExcelData')?.value || '';

    let gridData = null;
    let content = `<p>${rawContent.replace(/\n/g, '<br/>')}</p>`;

    if (category === 'EXCEL') {
      if (rawExcel.trim()) {
        gridData = rawExcel.trim().split('\n').map(line => line.split(',').map(cell => cell.trim()));
      } else {
        gridData = [
          ['البند / المحطة', 'القيمة المقاسة', 'الوحدة', 'الملاحظات'],
          ['معدل التدفق', '150,000', 'برميل/يوم', 'ضمن الحدود الطبيعية'],
          ['ضغط الغاز المصاحب', '45', 'Bar', 'مستقر']
        ];
      }
    }

    const newDoc = {
      id: 'doc-' + Date.now(),
      departmentId: user.departmentId,
      sectionId: sectionId,
      title,
      category,
      status,
      version,
      createdBy: user.id,
      createdByName: user.fullName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      content,
      gridData
    };

    window.store.addDocument(newDoc);
    window.store.logActivity(user.departmentId, user.id, user.employeeId, 'CREATE_DOCUMENT', 'DOCUMENT', `إنشاء وثيقة/تقرير جديد: [${title}]`);
    
    alert('✅ تم حفظ وتوثيق الوثيقة بنجاح.');
    this.closeModal();
    this.render();
  }

  openEditDocumentModal(docId) {
    const user = window.auth.getCurrentUser();
    const doc = window.store.getDocuments(user.departmentId).find(d => d.id === docId);
    if (!doc) {
      alert('الوثيقة غير موجودة.');
      return;
    }

    const sections = window.store.getSections(user.departmentId) || [];
    const plainContent = (doc.content || '').replace(/<br\s*[\/]?>/gi, '\n').replace(/<\/?[^>]+(>|$)/g, '');

    this.showModal(`✏️ تعديل وثيقة: ${doc.title}`, `
      <form onsubmit="window.app.handleEditDocumentSubmit(event, '${doc.id}')">
        <div class="form-group">
          <label class="form-label">عنوان الوثيقة / التقرير</label>
          <input type="text" id="editDocTitle" class="form-control" value="${doc.title || ''}" required>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
          <div class="form-group">
            <label class="form-label">التصنيف</label>
            <select id="editDocCategory" class="form-control" required>
              <option value="WORD" ${doc.category === 'WORD' ? 'selected' : ''}>📄 مستند Word / كتاب رسمي</option>
              <option value="EXCEL" ${doc.category === 'EXCEL' ? 'selected' : ''}>📊 جدول بيانات Excel</option>
              <option value="PDF" ${doc.category === 'PDF' ? 'selected' : ''}>📕 تقرير PDF معتمد</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">الجهة المصدرة / الشعبة</label>
            <select id="editDocSectionId" class="form-control">
              <option value="">🏢 إدارة القسم (المقر الرئيسي)</option>
              ${sections.map(s => `<option value="${s.id}" ${doc.sectionId === s.id ? 'selected' : ''}>${s.name}</option>`).join('')}
            </select>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">نص ومحتوى المستند</label>
          <textarea id="editDocContent" class="form-control" rows="8" required>${plainContent}</textarea>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
          <div class="form-group">
            <label class="form-label">رقم الإصدار (Version)</label>
            <input type="text" id="editDocVersion" class="form-control" value="${doc.version || '1.0'}" required>
          </div>

          <div class="form-group">
            <label class="form-label">حالة النشر والاعتماد</label>
            <select id="editDocStatus" class="form-control">
              <option value="PUBLISHED" ${doc.status === 'PUBLISHED' ? 'selected' : ''}>🟢 معتمد ومنشور (Published)</option>
              <option value="DRAFT" ${doc.status === 'DRAFT' ? 'selected' : ''}>🟡 مسودة قيد المراجعة (Draft)</option>
            </select>
          </div>
        </div>

        <div style="margin-top: 1.25rem; display: flex; justify-content: flex-end; gap: 0.5rem;">
          <button type="button" class="btn btn-outline" onclick="window.app.closeModal()">إلغاء</button>
          <button type="submit" class="btn btn-primary" style="font-weight: 800;">
            💾 حفظ التعديلات
          </button>
        </div>
      </form>
    `);
  }

  handleEditDocumentSubmit(e, docId) {
    e.preventDefault();
    const user = window.auth.getCurrentUser();
    const title = document.getElementById('editDocTitle')?.value.trim();
    const category = document.getElementById('editDocCategory')?.value || 'WORD';
    const sectionId = document.getElementById('editDocSectionId')?.value || null;
    const version = document.getElementById('editDocVersion')?.value.trim() || '1.0';
    const status = document.getElementById('editDocStatus')?.value || 'PUBLISHED';
    const rawContent = document.getElementById('editDocContent')?.value || '';

    const content = `<p>${rawContent.replace(/\n/g, '<br/>')}</p>`;

    window.store.updateDocument(docId, {
      title,
      category,
      sectionId,
      version,
      status,
      content,
      updatedBy: user.id,
      updatedByName: user.fullName
    });

    window.store.logActivity(user.departmentId, user.id, user.employeeId, 'EDIT_DOCUMENT', 'DOCUMENT', `تعديل الوثيقة: [${title}]`);
    
    alert('✅ تم تحديث الوثيقة بنجاح.');
    this.closeModal();
    this.render();
  }

  downloadDocumentFile(docId) {
    const user = window.auth.getCurrentUser();
    const doc = window.store.getDocuments(user.departmentId).find(d => d.id === docId);
    if (!doc) {
      alert('الوثيقة غير موجودة.');
      return;
    }

    if (doc.fileData) {
      const a = document.createElement('a');
      a.href = doc.fileData;
      a.download = doc.fileName || `${doc.title.replace(/\s+/g, '_')}.${doc.category === 'WORD' ? 'docx' : doc.category === 'EXCEL' ? 'xlsx' : 'pdf'}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.store.logActivity(user.departmentId, user.id, user.employeeId, 'DOWNLOAD_DOCUMENT', 'DOCUMENT', `تنزيل استمارة/نموذج: [${doc.title}]`);
      return;
    }

    if (doc.category === 'EXCEL' && doc.gridData) {
      window.exporter.exportToExcel(doc.title, doc.gridData[0] || [], doc.gridData.slice(1) || []);
    } else {
      const textContent = (doc.content || '').replace(/<br\s*[\/]?>/gi, '\n').replace(/<\/?[^>]+(>|$)/g, '');
      const htmlDoc = `
        <!DOCTYPE html>
        <html lang="ar" dir="rtl">
        <head>
          <meta charset="utf-8">
          <title>${doc.title}</title>
          <style>
            body { font-family: 'Cairo', sans-serif; padding: 2rem; line-height: 1.8; color: #222; }
            .header { border-bottom: 2px solid #00695c; padding-bottom: 1rem; margin-bottom: 2rem; text-align: center; }
            h1 { color: #00695c; margin: 0 0 0.5rem 0; font-size: 1.6rem; }
            .meta { font-size: 0.9rem; color: #666; }
            .content { font-size: 1.05rem; white-space: pre-wrap; margin-top: 1.5rem; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${doc.title}</h1>
            <div class="meta">قسم الإنتاج الجنوبي | الإصدار: v${doc.version || '1.0'} | المنشئ: ${doc.createdByName || 'إدارة القسم'} | التاريخ: ${new Date(doc.createdAt || Date.now()).toLocaleDateString('ar-IQ')}</div>
          </div>
          <div class="content">${textContent}</div>
        </body>
        </html>
      `;
      const blob = new Blob([htmlDoc], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${doc.title.replace(/\s+/g, '_')}_v${doc.version || '1.0'}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
    
    window.store.logActivity(user.departmentId, user.id, user.employeeId, 'DOWNLOAD_DOCUMENT', 'DOCUMENT', `تنزيل وثيقة: [${doc.title}]`);
  }

  printDocumentFile(docId) {
    const user = window.auth.getCurrentUser();
    const doc = window.store.getDocuments(user.departmentId).find(d => d.id === docId);
    if (!doc) {
      alert('الوثيقة غير موجودة.');
      return;
    }

    const sec = doc.sectionId ? window.store.getSectionById(doc.sectionId) : null;
    const st = doc.stationId ? window.store.getStationById(doc.stationId) : null;

    if (doc.category === 'EXCEL' && doc.gridData) {
      const headers = doc.gridData[0] || [];
      const rows = doc.gridData.slice(1) || [];
      const tableHtml = `
        <table>
          <thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>
          <tbody>${rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody>
        </table>
      `;
      window.exporter.printDocument(doc.title, `تقرير أرقام وجداول فنية - الإصدار v${doc.version || '1.0'}`, tableHtml, {
        sectionName: sec ? sec.name : '',
        stationName: st ? st.name : '',
        docNumber: doc.code || doc.id
      });
    } else {
      window.exporter.printDocument(doc.title, `مستند رسمي معتمد - الإصدار v${doc.version || '1.0'}`, doc.content || '<p>المحتوى فارغ</p>', {
        sectionName: sec ? sec.name : '',
        stationName: st ? st.name : '',
        docNumber: doc.code || doc.id
      });
    }

    window.store.logActivity(user.departmentId, user.id, user.employeeId, 'PRINT_DOCUMENT', 'DOCUMENT', `طباعة وثيقة: [${doc.title}]`);
  }

  deleteDocument(docId) {
    const user = window.auth.getCurrentUser();
    const doc = window.store.getDocuments(user.departmentId).find(d => d.id === docId);
    if (!doc) return;

    const canDelete = window.rbac && typeof window.rbac.hasPermission === 'function'
      ? (window.rbac.hasPermission(user, 'FILES_DELETE') || ['SUPER_ADMIN', 'DEPT_MANAGER'].includes(user.role))
      : ['SUPER_ADMIN', 'DEPT_MANAGER'].includes(user?.role);

    if (!canDelete) {
      alert('⛔ ليس لديك صلاحية حذف وأرشفة الوثائق.');
      return;
    }

    if (confirm(`هل أنت متأكد من حذف الوثيقة [${doc.title}] ونقلها للأرشيف؟`)) {
      window.store.deleteDocument(docId);
      window.store.logActivity(user.departmentId, user.id, user.employeeId, 'DELETE_DOCUMENT', 'DOCUMENT', `حذف وأرشفة وثيقة: [${doc.title}]`);
      alert('🗑️ تم حذف الوثيقة بنجاح.');
      this.render();
    }
  }

  openDeptDataEntryModal() {
    const user = window.auth.getCurrentUser();
    this.showDataEntryModal('إدارة القسم (المقر الرئيسي)', null, null, user);
  }

  openEditUserHRDataModal(identifier) {
    if (!identifier || identifier === 'undefined' || identifier === 'null') {
      identifier = window.auth?.getCurrentUser()?.id || window.auth?.getCurrentUser()?.employeeId;
    }
    let targetUser = window.store.getUserById(identifier) || window.store.getUserByEmployeeId(identifier);
    if (!targetUser && typeof window.store.getEmployeeMasterRecordByEmployeeId === 'function') {
      const master = window.store.getEmployeeMasterRecordByEmployeeId(identifier);
      if (master) {
        targetUser = {
          ...master,
          id: master.id || master.employeeId,
          role: master.role || 'EMPLOYEE',
          status: 'APPROVED'
        };
      }
    }
    if (!targetUser && typeof window.store.getEmployeeMasterRecords === 'function') {
      const records = window.store.getEmployeeMasterRecords();
      const master = (records || []).find(m => m.id === identifier || m.employeeId === identifier || m.userId === identifier || m.fullName === identifier);
      if (master) {
        targetUser = {
          ...master,
          id: master.id || master.employeeId,
          role: master.role || 'EMPLOYEE',
          status: 'APPROVED'
        };
      }
    }
    if (!targetUser) {
      const db = (window.store && typeof window.store.getDb === 'function') ? window.store.getDb() : {};
      const foundUser = (db.users || []).find(u => u.id === identifier || u.employeeId === identifier || u.fullName === identifier);
      if (foundUser) {
        targetUser = foundUser;
      }
    }
    if (!targetUser) {
      targetUser = window.auth.getCurrentUser() || {};
    }
    const sec = targetUser.sectionId ? window.store.getSectionById(targetUser.sectionId) : null;
    this.showDataEntryModal(sec ? sec.name : 'إدارة القسم', targetUser.sectionId, targetUser.unitId, targetUser);
  }

  openUploadEmployeeDocModal() {
    const user = window.auth.getCurrentUser();
    this.showModal('📁 رفع وتحديث مستمسك رسمي', `
      <form onsubmit="window.app.handleUploadEmployeeDocSubmit(event)">
        <div class="form-group">
          <label class="form-label">نوع المستمسك الرسمي</label>
          <select id="empDocType" class="form-control" required>
            <option value="البطاقة الوطنية الموحدة">البطاقة الوطنية الموحدة</option>
            <option value="بطاقة السكن">بطاقة السكن</option>
            <option value="البطاقة التموينية">البطاقة التموينية</option>
            <option value="الشهادة والوثيقة الدراسية">الشهادة والوثيقة الدراسية</option>
            <option value="جواز السفر">جواز السفر</option>
            <option value="جواز السلامة والصحة المهنية">جواز السلامة والصحة المهنية</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">الملف (PDF أو صورة)</label>
          <input type="file" id="empDocFile" class="form-control" accept=".pdf,image/*" required>
        </div>
        <div class="form-group">
          <label class="form-label">تاريخ النفاذ (إن وجد)</label>
          <input type="date" id="empDocExpiry" class="form-control">
        </div>
        <button type="submit" class="btn btn-primary" style="width: 100%;">رفع وتوثيق المستمسك</button>
      </form>
    `);
  }

  handleUploadEmployeeDocSubmit(e) {
    e.preventDefault();
    const user = window.auth.getCurrentUser();
    const type = document.getElementById('empDocType').value;
    const fileInput = document.getElementById('empDocFile');
    const expiryDate = document.getElementById('empDocExpiry').value || null;
    const fileName = fileInput.files[0] ? fileInput.files[0].name : 'document.pdf';

    const db = window.store.getDb();
    if (!db.employeeDocuments) db.employeeDocuments = [];
    
    db.employeeDocuments.push({
      id: 'doc-emp-' + Date.now(),
      userId: user.id,
      type,
      status: 'PENDING_REVIEW',
      fileUrl: '#',
      fileName,
      mandatory: true,
      expiryDate,
      reviewedBy: null,
      updatedAt: new Date().toISOString()
    });

    window.store.saveDb(db);
    window.store.logActivity(user.departmentId, user.id, user.employeeId, 'UPLOAD_DOC', 'USER', `رفع مستمسك: ${type}`);
    this.closeModal();
    alert('تم رفع المستمسك بنجاح وهو الآن بانتظار تدقيق الإدارة.');
    this.render();
  }

  exportDocumentFile(docId) {
    return this.downloadDocumentFile(docId);
  }

  viewStationWorkspace(stId) {
    this.navigate('station_workspace', stId);
  }

  viewUnitDetails(unitId) {
    const unit = window.store.getUnits(window.auth.getCurrentUser().departmentId).find(u => u.id === unitId);
    if (unit) {
      this.showModal(`⚡ ${unit.name}`, `
        <div style="margin-bottom: 1rem;">
          <p style="font-size: 0.95rem; color: var(--md-sys-color-outline); margin-bottom: 1rem;">${unit.description}</p>
          <div style="background: var(--md-sys-color-background); padding: 1rem; border-radius: var(--radius-sm); border: 1px solid var(--md-sys-color-surface-variant);">
            <strong>مسؤول الوحدة:</strong> ${window.store.getUserById(unit.managerId)?.fullName || 'شاغر'}<br/>
            <strong>الحالة:</strong> <span class="badge badge-success">${unit.status}</span>
          </div>
        </div>
        <div style="display: flex; gap: 0.5rem;">
          <button class="btn btn-primary" onclick="window.app.navigate('documents')">📄 مستندات الوحدة</button>
          <button class="btn btn-outline" onclick="window.app.closeModal()">إغلاق</button>
        </div>
      `);
    }
  }

  toggleNotificationsDropdown() {
    this.navigate('notifications');
  }

  exportEmployeesCSV() {
    const user = window.auth.getCurrentUser();
    const users = window.store.getUsers(user.departmentId).filter(u => u.status === 'APPROVED');
    const headers = ['الرقم الوظيفي', 'الاسم الكامل', 'العنوان الوظيفي', 'الدور'];
    const rows = users.map(u => [u.employeeId, u.fullName, u.jobTitle, window.rbac.getRoleInfo(u.role).name]);
    window.exporter.exportToExcel('سجل_الموظفين', headers, rows);
  }

  handleLiveSearchInput(query) {
    const clearBtn = document.getElementById('searchClearBtn');
    const dropdown = document.getElementById('globalSearchDropdown');
    
    if (clearBtn) {
      clearBtn.style.display = query && query.trim().length > 0 ? 'inline-flex' : 'none';
    }

    if (!dropdown) return;
    if (!query || query.trim().length === 0) {
      dropdown.style.display = 'none';
      dropdown.innerHTML = '';
      return;
    }

    const user = window.auth.getCurrentUser();
    if (!user) return;
    const db = window.store.getDb();
    const q = query.trim().toLowerCase();

    // 1. Search Users
    const matchedUsers = (db.users || [])
      .filter(u => u.departmentId === user.departmentId && (
        (u.fullName && u.fullName.toLowerCase().includes(q)) ||
        (u.employeeId && u.employeeId.toLowerCase().includes(q)) ||
        (u.jobTitle && u.jobTitle.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q))
      )).slice(0, 4);

    // 2. Search Sections & Stations
    const matchedSections = (db.sections || [])
      .filter(s => s.departmentId === user.departmentId && s.name && s.name.toLowerCase().includes(q))
      .slice(0, 3);

    const matchedStations = (db.stations || [])
      .filter(st => st.departmentId === user.departmentId && st.name && st.name.toLowerCase().includes(q))
      .slice(0, 3);

    // 3. Search Units
    const matchedUnits = (db.units || [])
      .filter(un => un.departmentId === user.departmentId && un.name && un.name.toLowerCase().includes(q))
      .slice(0, 3);

    // 4. Search Documents
    const matchedDocs = (db.documents || [])
      .filter(d => d.departmentId === user.departmentId && d.title && d.title.toLowerCase().includes(q))
      .slice(0, 4);

    // 5. Search Vehicles
    const matchedVehicles = (db.vehicles || [])
      .filter(v => v.departmentId === user.departmentId && (
        (v.plateNumber && v.plateNumber.toLowerCase().includes(q)) ||
        (v.type && v.type.toLowerCase().includes(q)) ||
        (v.model && v.model.toLowerCase().includes(q))
      )).slice(0, 3);

    let html = '';
    let totalCount = matchedUsers.length + matchedSections.length + matchedStations.length + matchedUnits.length + matchedDocs.length + matchedVehicles.length;

    if (totalCount === 0) {
      html = `<div style="padding: 1.25rem; text-align: center; color: var(--md-sys-color-outline); font-size: 0.85rem;">لا توجد نتائج مطابقة لـ "<strong>${query}</strong>"</div>`;
    } else {
      if (matchedUsers.length > 0) {
        html += `<div class="search-dropdown-group-title">👥 الكوادر والموظفين (${matchedUsers.length})</div>`;
        matchedUsers.forEach(u => {
          html += `
            <div class="search-dropdown-item" onclick="window.app.closeLiveSearchDropdown(); window.app.navigate('employees');">
              <div class="search-dropdown-item-main">
                <span style="font-size: 1rem;">👤</span>
                <div>
                  <div class="search-dropdown-item-title">${u.fullName}</div>
                  <div class="search-dropdown-item-sub">${u.employeeId} • ${u.jobTitle || 'موظف'}</div>
                </div>
              </div>
              <span class="search-dropdown-item-tag">كادر</span>
            </div>
          `;
        });
      }

      if (matchedSections.length > 0 || matchedStations.length > 0) {
        html += `<div class="search-dropdown-group-title">🛢️ الشعب والمحطات (${matchedSections.length + matchedStations.length})</div>`;
        matchedSections.forEach(s => {
          html += `
            <div class="search-dropdown-item" onclick="window.app.closeLiveSearchDropdown(); window.app.openSectionWorkspace('${s.id}');">
              <div class="search-dropdown-item-main">
                <span style="font-size: 1rem;">🏛️</span>
                <div>
                  <div class="search-dropdown-item-title">${s.name}</div>
                  <div class="search-dropdown-item-sub">شعبة تشغيلية</div>
                </div>
              </div>
              <span class="search-dropdown-item-tag">شعبة</span>
            </div>
          `;
        });
        matchedStations.forEach(st => {
          html += `
            <div class="search-dropdown-item" onclick="window.app.closeLiveSearchDropdown(); window.app.viewStationWorkspace('${st.id}');">
              <div class="search-dropdown-item-main">
                <span style="font-size: 1rem;">⚡</span>
                <div>
                  <div class="search-dropdown-item-title">${st.name}</div>
                  <div class="search-dropdown-item-sub">محطة إنتاج / تشغيل</div>
                </div>
              </div>
              <span class="search-dropdown-item-tag">محطة</span>
            </div>
          `;
        });
      }

      if (matchedUnits.length > 0) {
        html += `<div class="search-dropdown-group-title">⚡ الوحدات الفنية (${matchedUnits.length})</div>`;
        matchedUnits.forEach(un => {
          html += `
            <div class="search-dropdown-item" onclick="window.app.closeLiveSearchDropdown(); window.app.openUnitWorkspace('${un.id}');">
              <div class="search-dropdown-item-main">
                <span style="font-size: 1rem;">🔧</span>
                <div>
                  <div class="search-dropdown-item-title">${un.name}</div>
                  <div class="search-dropdown-item-sub">وحدة تخصصية</div>
                </div>
              </div>
              <span class="search-dropdown-item-tag">وحدة</span>
            </div>
          `;
        });
      }

      if (matchedDocs.length > 0) {
        html += `<div class="search-dropdown-group-title">📄 المستندات والوثائق (${matchedDocs.length})</div>`;
        matchedDocs.forEach(d => {
          html += `
            <div class="search-dropdown-item" onclick="window.app.closeLiveSearchDropdown(); window.app.openViewDocumentModal('${d.id}');">
              <div class="search-dropdown-item-main">
                <span style="font-size: 1rem;">📑</span>
                <div>
                  <div class="search-dropdown-item-title">${d.title}</div>
                  <div class="search-dropdown-item-sub">${d.category || 'عام'}</div>
                </div>
              </div>
              <span class="search-dropdown-item-tag">مستند</span>
            </div>
          `;
        });
      }

      if (matchedVehicles.length > 0) {
        html += `<div class="search-dropdown-group-title">🚘 حركة العجلات (${matchedVehicles.length})</div>`;
        matchedVehicles.forEach(v => {
          html += `
            <div class="search-dropdown-item" onclick="window.app.closeLiveSearchDropdown(); window.app.navigate('vehicles');">
              <div class="search-dropdown-item-main">
                <span style="font-size: 1rem;">🚗</span>
                <div>
                  <div class="search-dropdown-item-title">${v.type} - ${v.plateNumber}</div>
                  <div class="search-dropdown-item-sub">${v.driverName || 'سائق غير محدد'}</div>
                </div>
              </div>
              <span class="search-dropdown-item-tag">عجلة</span>
            </div>
          `;
        });
      }
    }

    dropdown.innerHTML = html;
    dropdown.style.display = 'block';
  }

  closeLiveSearchDropdown() {
    const dropdown = document.getElementById('globalSearchDropdown');
    if (dropdown) {
      dropdown.style.display = 'none';
    }
  }

  clearGlobalSearch() {
    const input = document.getElementById('globalSearchInput');
    const clearBtn = document.getElementById('searchClearBtn');
    const dropdown = document.getElementById('globalSearchDropdown');
    if (input) {
      input.value = '';
      input.focus();
    }
    if (clearBtn) clearBtn.style.display = 'none';
    if (dropdown) {
      dropdown.style.display = 'none';
      dropdown.innerHTML = '';
    }
  }

  handleGlobalSearch(query) {
    if (!query || query.trim() === '') return;
    this.closeLiveSearchDropdown();
    const user = window.auth.getCurrentUser();
    const db = window.store.getDb();
    const q = query.trim().toLowerCase();
    
    // Search users
    const matchedUsers = (db.users || []).filter(u => u.departmentId === user.departmentId && (
      (u.fullName && u.fullName.toLowerCase().includes(q)) ||
      (u.employeeId && u.employeeId.toLowerCase().includes(q)) ||
      (u.jobTitle && u.jobTitle.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q))
    ));
    // Search documents
    const matchedDocs = (db.documents || []).filter(d => d.departmentId === user.departmentId && d.title && d.title.toLowerCase().includes(q));
    // Search Sections & Stations
    const matchedSections = (db.sections || []).filter(s => s.departmentId === user.departmentId && s.name && s.name.toLowerCase().includes(q));
    const matchedStations = (db.stations || []).filter(st => st.departmentId === user.departmentId && st.name && st.name.toLowerCase().includes(q));
    // Search Units
    const matchedUnits = (db.units || []).filter(un => un.departmentId === user.departmentId && un.name && un.name.toLowerCase().includes(q));
    
    let resultsHtml = '<div style="display: flex; flex-direction: column; gap: 1rem;">';
    
    if (matchedUsers.length > 0) {
      resultsHtml += '<h4 style="color: var(--md-sys-color-primary);">👥 الكوادر والموظفين (' + matchedUsers.length + ')</h4>';
      matchedUsers.forEach(u => {
        resultsHtml += `<div style="padding: 0.75rem; border: 1px solid var(--md-sys-color-surface-variant); border-radius: var(--radius-sm); cursor: pointer;" onclick="window.app.closeModal(); window.app.navigate('employees');"><strong>${u.fullName}</strong> - ${u.employeeId} - ${u.jobTitle || 'موظف'}</div>`;
      });
    }

    if (matchedSections.length > 0 || matchedStations.length > 0) {
      resultsHtml += '<h4 style="color: var(--md-sys-color-primary); margin-top: 0.5rem;">🛢️ الشعب والمحطات (' + (matchedSections.length + matchedStations.length) + ')</h4>';
      matchedSections.forEach(s => {
        resultsHtml += `<div style="padding: 0.75rem; border: 1px solid var(--md-sys-color-surface-variant); border-radius: var(--radius-sm); cursor: pointer;" onclick="window.app.closeModal(); window.app.openSectionWorkspace('${s.id}');"><strong>شعبة: ${s.name}</strong></div>`;
      });
      matchedStations.forEach(st => {
        resultsHtml += `<div style="padding: 0.75rem; border: 1px solid var(--md-sys-color-surface-variant); border-radius: var(--radius-sm); cursor: pointer;" onclick="window.app.closeModal(); window.app.viewStationWorkspace('${st.id}');"><strong>محطة: ${st.name}</strong></div>`;
      });
    }

    if (matchedUnits.length > 0) {
      resultsHtml += '<h4 style="color: var(--md-sys-color-primary); margin-top: 0.5rem;">⚡ الوحدات الفنية (' + matchedUnits.length + ')</h4>';
      matchedUnits.forEach(un => {
        resultsHtml += `<div style="padding: 0.75rem; border: 1px solid var(--md-sys-color-surface-variant); border-radius: var(--radius-sm); cursor: pointer;" onclick="window.app.closeModal(); window.app.openUnitWorkspace('${un.id}');"><strong>وحدة: ${un.name}</strong></div>`;
      });
    }
    
    if (matchedDocs.length > 0) {
      resultsHtml += '<h4 style="color: var(--md-sys-color-primary); margin-top: 0.5rem;">📄 المستندات والوثائق (' + matchedDocs.length + ')</h4>';
      matchedDocs.forEach(d => {
        resultsHtml += `<div style="padding: 0.75rem; border: 1px solid var(--md-sys-color-surface-variant); border-radius: var(--radius-sm); cursor: pointer;" onclick="window.app.closeModal(); window.app.openViewDocumentModal('${d.id}')"><strong>${d.title}</strong> - ${d.category}</div>`;
      });
    }
    
    if (matchedUsers.length === 0 && matchedDocs.length === 0 && matchedSections.length === 0 && matchedStations.length === 0 && matchedUnits.length === 0) {
      resultsHtml += '<p style="text-align: center; color: var(--md-sys-color-outline); padding: 2rem;">لا توجد نتائج مطابقة لـ "' + query + '"</p>';
    }
    
    resultsHtml += '</div>';
    this.showModal('🔍 نتائج البحث الشامل: ' + query, resultsHtml);
  }

  showModal(title, bodyHtml, options = {}) {
    let backdrop = document.getElementById('appModalBackdrop');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.id = 'appModalBackdrop';
      backdrop.className = 'modal-backdrop';
      document.body.appendChild(backdrop);
    }

    let customDialogStyle = '';
    let customDialogClass = 'modal-dialog';
    const isGlass = options === 'glass' || (options && typeof options === 'object' && (options.glass || options.theme === 'glass'));

    if (isGlass) {
      customDialogClass += ' modal-glass-card';
      backdrop.classList.add('modal-backdrop-glass');
    } else {
      backdrop.classList.remove('modal-backdrop-glass');
    }

    if (typeof options === 'string') {
      if (options === 'xl' || options === 'dossier') {
        customDialogStyle = 'style="max-width: 1120px; width: 95vw;"';
        customDialogClass += ' modal-dossier';
      } else if (options === 'lg') {
        customDialogStyle = 'style="max-width: 850px; width: 92vw;"';
        customDialogClass += ' modal-lg';
      }
    } else if (options && typeof options === 'object') {
      const maxWidth = options.maxWidth || (options.size === 'xl' || options.size === 'dossier' ? '1120px' : (options.size === 'lg' ? '850px' : null));
      if (maxWidth) {
        customDialogStyle = `style="max-width: ${maxWidth}; width: 95vw;"`;
        customDialogClass += (options.size === 'dossier' ? ' modal-dossier' : ' modal-xl');
      }
    }

    backdrop.innerHTML = `
      <div class="${customDialogClass}" ${customDialogStyle}>
        <div class="modal-header">
          <h3 class="modal-title">${title}</h3>
          <button class="modal-close-btn" onclick="window.app.closeModal()">✕</button>
        </div>
        <div class="modal-body">
          ${bodyHtml}
        </div>
      </div>
    `;

    setTimeout(() => backdrop.classList.add('active'), 10);
  }

  closeModal() {
    const backdrop = document.getElementById('appModalBackdrop');
    if (backdrop) {
      backdrop.classList.remove('active');
      setTimeout(() => {
        backdrop.classList.remove('modal-backdrop-glass');
        backdrop.remove();
      }, 200);
    }
  }

  // --- Dynamic Request System ---
  switchRequestSubTab(tabName) {
    const tabs = document.querySelectorAll('.requests-view .tab-btn');
    tabs.forEach(t => t.classList.remove('active'));
    if (event && event.target) event.target.classList.add('active');
    
    const user = window.auth.getCurrentUser();
    const db = window.store.getDb();
    const isHRorMgr = ['DEPT_MANAGER', 'DEPUTY_DEPT_MANAGER', 'ADMIN_MANAGER', 'SUPER_ADMIN', 'ADMINISTRATOR'].includes(user.role);
    
    const tbody = document.getElementById('requestSubTabBody');
    if (!tbody) return;
    if (tabName === 'requestsList') {
      const requests = (db.requests || []).filter(r => r.departmentId === user.departmentId && (isHRorMgr || r.userId === user.id));
      tbody.innerHTML = typeof window.renderRequestsListBody === 'function' ? window.renderRequestsListBody(requests, isHRorMgr) : '';
    } else {
      const changeLogs = (db.dataChangeLogs || []).filter(l => isHRorMgr || l.userId === user.id);
      tbody.innerHTML = typeof window.renderChangeLogsBody === 'function' ? window.renderChangeLogsBody(changeLogs) : '';
    }
  }

  openSubmitRequestModal() {
    const types = window.store.getDb().requestTypes || [];
    let options = types.map(t => `<option value="${t.id}">${t.title}</option>`).join('');
    
    this.showModal('📝 تقديم وتثبيت طلب إداري جديد', `
      <form class="modal-form-container" onsubmit="event.preventDefault(); window.app.submitAdministrativeRequest();">
        <div class="modal-form-body">
          <div class="form-group">
            <label class="form-label" style="font-weight: 800;">نوع الطلب الإداري:</label>
            <select id="reqTypeId" class="form-control" onchange="window.app.renderDynamicFields(this.value)" required>
              <option value="">-- اختر نوع الطلب --</option>
              ${options}
            </select>
          </div>
          <div id="dynamicFieldsContainer" style="margin-top: 1rem;"></div>
        </div>
        <div class="modal-form-sticky-footer">
          <button type="button" class="btn btn-outline" onclick="window.app.closeModal()" style="font-weight: 700; padding: 0.6rem 1.4rem; border-radius: 10px;">
            إلغاء
          </button>
          <button type="submit" class="btn btn-save-prominent">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
            <span>💾 إرسال وتثبيت الطلب في المنظومة</span>
          </button>
        </div>
      </form>
    `, { size: 'lg', maxWidth: '800px' });
  }

  renderDynamicFields(typeId) {
    const type = window.store.getDb().requestTypes.find(t => t.id === typeId);
    const container = document.getElementById('dynamicFieldsContainer');
    if (!type) { container.innerHTML = ''; return; }
    
    container.innerHTML = type.fields.map(f => `
      <div class="form-group">
        <label class="form-label">${f.label}</label>
        <input type="${f.type}" id="dyn_${f.name}" class="form-control" ${f.required ? 'required' : ''}>
      </div>
    `).join('');
  }

  submitAdministrativeRequest() {
    const user = window.auth.getCurrentUser();
    const typeId = document.getElementById('reqTypeId').value;
    if (!typeId) { alert('يرجى اختيار نوع الطلب'); return; }
    const type = window.store.getDb().requestTypes.find(t => t.id === typeId);
    if (!type) return;
    
    let payload = {};
    type.fields.forEach(f => {
      const el = document.getElementById(`dyn_${f.name}`);
      payload[f.name] = el ? el.value : '';
    });

    const req = {
      id: 'REQ-' + Date.now(),
      typeId,
      typeTitle: type.title,
      userId: user.id,
      userName: user.fullName,
      userEmployeeId: user.employeeId,
      departmentId: user.departmentId,
      payload,
      status: 'PENDING',
      createdAt: new Date().toISOString()
    };

    window.store.addRequest(req);
    window.store.logActivity(user.departmentId, user.id, user.employeeId, 'SUBMIT_REQUEST', 'REQUESTS', `قدم طلب إداري: ${type.title}`);
    this.closeModal();
    this.render();
  }

  approveAdministrativeRequest(reqId) {
    const user = window.auth.getCurrentUser();
    const db = window.store.getDb();
    const req = (db.requests || []).find(r => r.id === reqId);
    if (!req) return;
    const targetUser = window.store.getUserById(req.userId);
    if (!targetUser) return;
    
    if (confirm('هل أنت متأكد من الموافقة وتحديث بيانات الموظف الرسمية؟')) {
      for (const [key, newValue] of Object.entries(req.payload)) {
        const oldValue = targetUser[key] || '';
        if (oldValue !== newValue) {
          window.store.addDataChangeLog({
            id: 'LOG-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
            departmentId: req.departmentId,
            userId: targetUser.id,
            targetUserName: targetUser.fullName,
            fieldName: key,
            oldValue,
            newValue,
            changedById: user.id,
            changedByName: user.fullName,
            changedAt: new Date().toISOString()
          });
          targetUser[key] = newValue;
        }
      }
      
      window.store.updateUser(targetUser.id, targetUser);
      window.store.updateRequest(reqId, { status: 'APPROVED' });
      window.store.logActivity(user.departmentId, user.id, user.employeeId, 'APPROVE_REQUEST', 'REQUESTS', `الموافقة على الطلب ${reqId}`);
      this.render();
    }
  }

  rejectAdministrativeRequest(reqId) {
    const user = window.auth.getCurrentUser();
    if (confirm('هل تريد فعلاً رفض هذا الطلب؟')) {
      window.store.updateRequest(reqId, { status: 'REJECTED' });
      window.store.logActivity(user.departmentId, user.id, user.employeeId, 'REJECT_REQUEST', 'REQUESTS', `رفض الطلب ${reqId}`);
      this.render();
    }
  }

  // --- Sub-Tab & Filter Controllers ---
  setSectionSubTab(subTab) {
    this.currentSectionSubTab = subTab;
    this.render();
  }

  setUnitSubTab(subTab) {
    this.currentUnitSubTab = subTab;
    this.render();
  }

  setDocCategoryFilter(cat) {
    this.currentDocCategoryFilter = cat;
    this.render();
  }

  // --- Section & Unit Modals (Dept Manager Only) ---
  openCreateSectionModal() {
    const user = window.auth.getCurrentUser();
    if (!user || (user.role !== 'DEPT_MANAGER' && user.role !== 'SUPER_ADMIN')) {
      alert('عذراً، هذه الصلاحية مخصصة للسيد مدير القسم فقط.');
      return;
    }

    this.showModal('🛢️ إنشاء شعبة جديدة في الهيكل الإداري', `
      <form onsubmit="window.app.handleCreateSectionSubmit(event)">
        <div class="form-group">
          <label class="form-label">اسم الشعبة الرسمي</label>
          <input type="text" id="newSecName" class="form-control" placeholder="مثال: شعبة السلامة والبيئة" required>
        </div>
        <div class="form-group">
          <label class="form-label">الوصف والمهام الرئيسية</label>
          <textarea id="newSecDesc" class="form-control" rows="3" placeholder="وصف اختصاصات الشعبة والمحطات التابعة..." required></textarea>
        </div>
        <div class="form-group">
          <label class="form-label">الموقع الجغرافي والميداني</label>
          <input type="text" id="newSecLocation" class="form-control" placeholder="مثال: موقع الرميلة / المجمع الشمالي">
        </div>
        <button type="submit" class="btn btn-primary" style="width: 100%;">حفظ وإنشاء الشعبة</button>
      </form>
    `);
  }

  handleCreateSectionSubmit(e) {
    e.preventDefault();
    const user = window.auth.getCurrentUser();
    const name = document.getElementById('newSecName').value.trim();
    const description = document.getElementById('newSecDesc').value.trim();
    const location = document.getElementById('newSecLocation').value.trim();

    const sec = window.store.addSection({
      id: 'sec-' + Date.now(),
      departmentId: user.departmentId || 'dept-south-prod',
      name,
      managerId: null,
      description,
      location,
      status: 'ACTIVE'
    });

    window.store.logActivity(user.departmentId, user.id, user.employeeId, 'CREATE_SECTION', 'ORGANIZATION', `استحداث شعبة جديدة: ${name}`);
    this.closeModal();
    this.render();
  }

  openCreateUnitModal() {
    const user = window.auth.getCurrentUser();
    if (!user || (user.role !== 'DEPT_MANAGER' && user.role !== 'SUPER_ADMIN')) {
      alert('عذراً، هذه الصلاحية مخصصة للسيد مدير القسم فقط.');
      return;
    }

    this.showModal('⚡ إنشاء وحدة جديدة تابعة للقسم', `
      <form onsubmit="window.app.handleCreateUnitSubmit(event)">
        <div class="form-group">
          <label class="form-label">اسم الوحدة (بدون كلمة وحدة)</label>
          <input type="text" id="newUnitName" class="form-control" placeholder="مثال: الأتمتة والسيطرة" required>
        </div>
        <div class="form-group">
          <label class="form-label">الوصف والمهام الرئيسية</label>
          <textarea id="newUnitDesc" class="form-control" rows="3" placeholder="بيان اختصاصات الوحدة ومهامها..." required></textarea>
        </div>
        <button type="submit" class="btn btn-primary" style="width: 100%;">حفظ وإنشاء الوحدة في الهيكل</button>
      </form>
    `);
  }

  handleCreateUnitSubmit(e) {
    e.preventDefault();
    const user = window.auth.getCurrentUser();
    const name = document.getElementById('newUnitName').value.trim();
    const description = document.getElementById('newUnitDesc').value.trim();

    window.store.addUnit({
      id: 'unit-' + Date.now(),
      departmentId: user.departmentId || 'dept-south-prod',
      name,
      managerId: null,
      description,
      status: 'ACTIVE',
      projectsCount: 0,
      activeStaff: 0
    });

    window.store.logActivity(user.departmentId, user.id, user.employeeId, 'CREATE_UNIT', 'ORGANIZATION', `استحداث وحدة جديدة: ${name}`);
    this.closeModal();
    this.render();
  }

  openCreateStationModal(sectionId) {
    const user = window.auth.getCurrentUser();
    const sections = window.store.getSections(user.departmentId);
    
    this.showModal('🛢️ إضافة محطة / مجمع إنتاجي جديد', `
      <form onsubmit="window.app.handleCreateStationSubmit(event)">
        <div class="form-group">
          <label class="form-label">اسم المحطة أو المجمع</label>
          <input type="text" id="newStName" class="form-control" placeholder="مثال: محطة عزل الغاز الرابعة" required>
        </div>
        <div class="form-group">
          <label class="form-label">رمز المحطة الكودي (Code)</label>
          <input type="text" id="newStCode" class="form-control" placeholder="مثال: ST-DS-04" required>
        </div>
        <div class="form-group">
          <label class="form-label">الشعبة التابعة لها</label>
          <select id="newStSecId" class="form-control" required>
            ${sections.map(s => `<option value="${s.id}" ${s.id === sectionId ? 'selected' : ''}>${s.name}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">الطاقة الإنتاجية والتصميمية</label>
          <input type="text" id="newStCapacity" class="form-control" placeholder="مثال: 100,000 برميل/يوم" required>
        </div>
        <button type="submit" class="btn btn-primary" style="width: 100%;">إضافة المحطة واعتمادها</button>
      </form>
    `);
  }

  handleCreateStationSubmit(e) {
    e.preventDefault();
    const user = window.auth.getCurrentUser();
    const name = document.getElementById('newStName').value;
    const code = document.getElementById('newStCode').value;
    const sectionId = document.getElementById('newStSecId').value;
    const capacity = document.getElementById('newStCapacity').value;

    window.store.addStation({
      id: 'st-' + Date.now(),
      sectionId,
      departmentId: user.departmentId,
      name,
      code,
      managerId: null,
      capacity,
      status: 'OPERATIONAL',
      lastMaintenance: new Date().toISOString().split('T')[0]
    });

    window.store.logActivity(user.departmentId, user.id, user.employeeId, 'CREATE_STATION', 'ORGANIZATION', `إضافة محطة جديدة: ${name} (${code})`);
    this.closeModal();
    this.render();
  }

  openCreateUnitModal() {
    this.showModal('⚡ استحداث وحدة جديدة تابعة للقسم', `
      <form onsubmit="window.app.handleCreateUnitSubmit(event)">
        <div class="form-group">
          <label class="form-label">اسم الوحدة الرسمي</label>
          <input type="text" id="newUnitName" class="form-control" placeholder="مثال: وحدة الطاقة والكهرباء" required>
        </div>
        <div class="form-group">
          <label class="form-label">الوصف ونطاق المسؤوليات</label>
          <textarea id="newUnitDesc" class="form-control" rows="3" placeholder="وصف المهام الهندسية والإدارية..." required></textarea>
        </div>
        <button type="submit" class="btn btn-primary" style="width: 100%;">استحداث الوحدة</button>
      </form>
    `);
  }

  handleCreateUnitSubmit(e) {
    e.preventDefault();
    const user = window.auth.getCurrentUser();
    const name = document.getElementById('newUnitName').value;
    const description = document.getElementById('newUnitDesc').value;

    window.store.addUnit({
      id: 'unit-' + Date.now(),
      departmentId: user.departmentId,
      name,
      managerId: null,
      description,
      status: 'ACTIVE'
    });

    window.store.logActivity(user.departmentId, user.id, user.employeeId, 'CREATE_UNIT', 'ORGANIZATION', `استحداث وحدة: ${name}`);
    this.closeModal();
    this.render();
  }

  // --- Vehicle Return & Dispatch Slips ---
  openVehicleReturnModal(vmId) {
    const user = window.auth.getCurrentUser();
    const vm = window.store.getVehicleMovements(user.departmentId).find(v => v.id === vmId);
    if (!vm) return;

    this.showModal('🚘 تسجيل عودة المركبة إلى المرآب', `
      <form onsubmit="window.app.handleVehicleReturnSubmit(event, '${vmId}')">
        <div style="background: var(--md-sys-color-background); padding: 1rem; border-radius: var(--radius-sm); margin-bottom: 1rem;">
          <div><strong>المركبة:</strong> ${vm.vehicleNumber} (${vm.vehicleType})</div>
          <div><strong>السائق:</strong> ${vm.driverName}</div>
          <div><strong>الوجهة:</strong> ${vm.destination}</div>
          <div><strong>وقت الخروج:</strong> ${new Date(vm.exitTime).toLocaleTimeString('ar-IQ')}</div>
        </div>
        <div class="form-group">
          <label class="form-label">قراءة عداد المسافة عند العودة (كم)</label>
          <input type="text" id="retOdo" class="form-control" placeholder="مثال: 142,650 كم" required>
        </div>
        <div class="form-group">
          <label class="form-label">ملاحظات العودة وحالة المركبة</label>
          <textarea id="retNotes" class="form-control" rows="2" placeholder="حالة الوقود، سلامة المركبة، إنجاز المهمة..."></textarea>
        </div>
        <button type="submit" class="btn btn-success" style="width: 100%;">تأكيد عودة المركبة وغلق الرحلة</button>
      </form>
    `);
  }

  handleVehicleReturnSubmit(e, vmId) {
    e.preventDefault();
    const user = window.auth.getCurrentUser();
    const odoIn = document.getElementById('retOdo').value;
    const notes = document.getElementById('retNotes').value;

    window.store.updateVehicleMovement(vmId, {
      entryTime: new Date().toISOString(),
      odometerIn: odoIn,
      notes: notes || 'عادت بسلام وأصولياً',
      status: 'COMPLETED'
    });

    window.store.logActivity(user.departmentId, user.id, user.employeeId, 'VEHICLE_RETURN', 'VEHICLES', `تسجيل عودة المركبة ${vmId}`);
    this.closeModal();
    this.render();
  }

  printVehicleDispatchSlip(vmId) {
    const user = window.auth.getCurrentUser();
    const vm = window.store.getVehicleMovements(user.departmentId).find(v => v.id === vmId);
    if (!vm) return;

    window.exporter.printDocument(`وصل إيفاد وحركة مركبة رسمية - ${vm.vehicleNumber}`, 'قسم الإنتاج الجنوبي - وحدة النقل والمرآب', `
      <table style="width: 100%; border-collapse: collapse; margin-top: 1rem;">
        <tr><td style="width: 30%; font-weight: bold; background: #f5f5f5;">رقم المركبة:</td><td>${vm.vehicleNumber}</td></tr>
        <tr><td style="font-weight: bold; background: #f5f5f5;">نوع المركبة:</td><td>${vm.vehicleType}</td></tr>
        <tr><td style="font-weight: bold; background: #f5f5f5;">اسم السائق المعتمد:</td><td>${vm.driverName}</td></tr>
        <tr><td style="font-weight: bold; background: #f5f5f5;">الوجهة المحددة:</td><td>${vm.destination}</td></tr>
        <tr><td style="font-weight: bold; background: #f5f5f5;">وقت وتاريخ المغادرة:</td><td>${new Date(vm.exitTime).toLocaleString('ar-IQ')}</td></tr>
        <tr><td style="font-weight: bold; background: #f5f5f5;">الغرض من الحركة:</td><td>${vm.purpose}</td></tr>
        <tr><td style="font-weight: bold; background: #f5f5f5;">حالة المهمة:</td><td>${vm.status === 'COMPLETED' ? 'مكتملة ومثبتة' : 'جارية'}</td></tr>
        <tr><td style="font-weight: bold; background: #f5f5f5;">توقيع مسؤول المرآب:</td><td style="height: 50px;">.......................................</td></tr>
      </table>
    `);
  }

  exportVehiclesCSV() {
    const user = window.auth.getCurrentUser();
    const movements = window.store.getVehicleMovements(user.departmentId);
    const headers = ['رقم المركبة', 'النوع', 'السائق', 'الوجهة', 'وقت الخروج', 'وقت العودة', 'الغرض', 'الحالة'];
    const rows = movements.map(v => [
      v.vehicleNumber,
      v.vehicleType,
      v.driverName,
      v.destination,
      new Date(v.exitTime).toLocaleString('ar-IQ'),
      v.entryTime ? new Date(v.entryTime).toLocaleString('ar-IQ') : 'في الطريق',
      `"${(v.purpose || '').replace(/"/g, '""')}"`,
      v.status
    ]);
    window.exporter.exportToExcel('سجل_حركة_السيارات', headers, rows);
  }

  // --- Database Backup & Restore & Multi-Tenant Tools ---
  exportDatabaseBackup() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(window.store.exportBackupJSON());
    const link = document.createElement('a');
    link.setAttribute("href", dataStr);
    link.setAttribute("download", `SPD_Backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  openRestoreDatabaseModal() {
    this.showModal('📤 استعادة نسخة احتياطية لقاعدة البيانات', `
      <form onsubmit="window.app.handleRestoreDatabaseSubmit(event)">
        <p style="color: var(--md-sys-color-error); font-size: 0.85rem; margin-bottom: 1rem;">
          ⚠️ تنبيه: استعادة النسخة الاحتياطية ستقوم باستبدال كافة البيانات الحالية بالبيانات الموجودة في الملف.
        </p>
        <div class="form-group">
          <label class="form-label">اختر ملف النسخة الاحتياطية (.json)</label>
          <input type="file" id="backupJsonFile" class="form-control" accept=".json" required>
        </div>
        <button type="submit" class="btn btn-danger" style="width: 100%;">تأكيد استعادة قاعدة البيانات</button>
      </form>
    `);
  }

  handleRestoreDatabaseSubmit(e) {
    e.preventDefault();
    const file = document.getElementById('backupJsonFile').files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const res = window.store.importBackupJSON(evt.target.result);
      if (res.success) {
        alert('تمت استعادة قاعدة البيانات بنجاح!');
        this.closeModal();
        this.render();
      } else {
        alert('فشل في استعادة البيانات: ' + res.error);
      }
    };
    reader.readAsText(file);
  }

  openCreateDepartmentModal() {
    this.showModal('🏢 تأسيس قسم إنتاجي مستقل جديد', `
      <form onsubmit="window.app.handleCreateDepartmentSubmit(event)">
        <div class="form-group">
          <label class="form-label">اسم القسم الرسمي</label>
          <input type="text" id="newDeptName" class="form-control" placeholder="مثال: إدارة قسم الإنتاج الغربي" required>
        </div>
        <div class="form-group">
          <label class="form-label">الرمز الكودي للقسم</label>
          <input type="text" id="newDeptCode" class="form-control" placeholder="مثال: WPD-03" required>
        </div>
        <div class="form-group">
          <label class="form-label">شعار الحروف (أيقونة مختصرة)</label>
          <input type="text" id="newDeptLogo" class="form-control" placeholder="مثال: ق غ" required>
        </div>
        <div class="form-group">
          <label class="form-label">الوصف المؤسسي</label>
          <textarea id="newDeptDesc" class="form-control" rows="2"></textarea>
        </div>
        <button type="submit" class="btn btn-primary" style="width: 100%;">تأسيس القسم وحفظه</button>
      </form>
    `);
  }

  handleCreateDepartmentSubmit(e) {
    e.preventDefault();
    const user = window.auth.getCurrentUser();
    const name = document.getElementById('newDeptName').value;
    const code = document.getElementById('newDeptCode').value;
    const logoText = document.getElementById('newDeptLogo').value;
    const description = document.getElementById('newDeptDesc').value;

    const newDept = {
      id: 'dept-' + Date.now(),
      name,
      code,
      logoText,
      description,
      managerId: null,
      status: 'ACTIVE',
      createdAt: new Date().toISOString()
    };

    window.store.addDepartment(newDept);
    window.store.logActivity(user.departmentId, user.id, user.employeeId, 'CREATE_DEPARTMENT', 'SUPER_ADMIN', `تأسيس قسم جديد: ${name}`);
    this.closeModal();
    this.render();
  }

  openAddApprovedEmployeeModal() {
    const user = window.auth.getCurrentUser();
    this.showModal('👤 إضافة رقم وظيفي معتمد في السجل المركزي (HR)', `
      <form onsubmit="window.app.handleAddApprovedEmployeeSubmit(event)">
        <div class="form-group">
          <label class="form-label">الرقم الوظيفي (Employee ID)</label>
          <input type="text" id="appEmpId" class="form-control" placeholder="مثال: EMP-2024-050" required>
        </div>
        <div class="form-group">
          <label class="form-label">الاسم الكامل المعتمد</label>
          <input type="text" id="appEmpName" class="form-control" placeholder="الاسم الثلاثي واللقب" required>
        </div>
        <div class="form-group">
          <label class="form-label">اسم الأم الثلاثي</label>
          <input type="text" id="appEmpMother" class="form-control" required>
        </div>
        <div class="form-group">
          <label class="form-label">رقم البطاقة الوطنية الموحدة</label>
          <input type="text" id="appEmpCard" class="form-control" required>
        </div>
        <div class="form-group">
          <label class="form-label">الدرجة والمرحلة</label>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;">
            <input type="text" id="appEmpGrade" class="form-control" placeholder="الدرجة (مثال: الخامسة)">
            <input type="text" id="appEmpStage" class="form-control" placeholder="المرحلة (مثال: الثانية)">
          </div>
        </div>
        <button type="submit" class="btn btn-primary" style="width: 100%;">إدراج في السجل المركزي المعتمد</button>
      </form>
    `);
  }

  handleAddApprovedEmployeeSubmit(e) {
    e.preventDefault();
    const user = window.auth.getCurrentUser();
    const id = document.getElementById('appEmpId').value.toUpperCase().trim();
    const name = document.getElementById('appEmpName').value;
    const motherName = document.getElementById('appEmpMother').value;
    const unifiedCardNumber = document.getElementById('appEmpCard').value;
    const jobGrade = document.getElementById('appEmpGrade').value;
    const jobStage = document.getElementById('appEmpStage').value;

    window.store.addApprovedEmployeeId({
      id,
      name,
      departmentId: user.departmentId,
      motherName,
      unifiedCardNumber,
      jobGrade,
      jobStage
    });

    window.store.logActivity(user.departmentId, user.id, user.employeeId, 'ADD_APPROVED_EMP_ID', 'HR', `إضافة رقم وظيفي معتمد: ${id} (${name})`);
    this.closeModal();
    this.render();
  }

  openEditUserRoleModal(userId) {
    const target = window.store.getUserById(userId);
    if (!target) return;

    this.showModal(`🛡️ تعديل صلاحيات الموظف: ${target.fullName}`, `
      <form onsubmit="window.app.handleEditUserRoleSubmit(event, '${userId}')">
        <div class="form-group">
          <label class="form-label">مستوى الصلاحية والدور</label>
          <select id="editUserRole" class="form-control" required>
            <option value="SUPER_ADMIN" ${target.role === 'SUPER_ADMIN' ? 'selected' : ''}>المؤسس / Super Admin</option>
            <option value="DEPT_MANAGER" ${target.role === 'DEPT_MANAGER' ? 'selected' : ''}>مدير قسم</option>
            <option value="DEPUTY_DEPT_MANAGER" ${target.role === 'DEPUTY_DEPT_MANAGER' ? 'selected' : ''}>وكيل مدير قسم</option>
            <option value="ADMIN_MANAGER" ${target.role === 'ADMIN_MANAGER' ? 'selected' : ''}>مدير إدارة</option>
            <option value="SECTION_MANAGER" ${target.role === 'SECTION_MANAGER' ? 'selected' : ''}>مسؤول شعبة</option>
            <option value="DEPUTY_SECTION_MANAGER" ${target.role === 'DEPUTY_SECTION_MANAGER' ? 'selected' : ''}>وكيل مسؤول شعبة</option>
            <option value="UNIT_MANAGER" ${target.role === 'UNIT_MANAGER' ? 'selected' : ''}>مسؤول وحدة</option>
            <option value="STATION_MANAGER" ${target.role === 'STATION_MANAGER' ? 'selected' : ''}>مسؤول موقع</option>
            <option value="DEPUTY_STATION_MANAGER" ${target.role === 'DEPUTY_STATION_MANAGER' ? 'selected' : ''}>وكيل مسؤول موقع</option>
            <option value="STATION_SUPERVISOR" ${target.role === 'STATION_SUPERVISOR' ? 'selected' : ''}>مشرف محطة</option>
            <option value="ADMINISTRATOR" ${target.role === 'ADMINISTRATOR' ? 'selected' : ''}>إداري مخول</option>
            <option value="SHIFT_ENGINEER" ${target.role === 'SHIFT_ENGINEER' ? 'selected' : ''}>مهندس مناوب</option>
            <option value="SHIFT_SUPERVISOR" ${target.role === 'SHIFT_SUPERVISOR' ? 'selected' : ''}>مشرف نوبة</option>
            <option value="OPERATOR" ${target.role === 'OPERATOR' ? 'selected' : ''}>مشغل</option>
            <option value="EMPLOYEE" ${target.role === 'EMPLOYEE' ? 'selected' : ''}>منتسب</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">حالة الحساب</label>
          <select id="editUserStatus" class="form-control">
            <option value="APPROVED" ${target.status === 'APPROVED' ? 'selected' : ''}>معتمد وفعال</option>
            <option value="PENDING" ${target.status === 'PENDING' ? 'selected' : ''}>قيد المراجعة</option>
            <option value="SUSPENDED" ${target.status === 'SUSPENDED' ? 'selected' : ''}>معلق</option>
          </select>
        </div>
        <button type="submit" class="btn btn-primary" style="width: 100%;">حفظ التعديلات</button>
      </form>
    `);
  }

  handleEditUserRoleSubmit(e, userId) {
    e.preventDefault();
    const user = window.auth.getCurrentUser();
    const role = document.getElementById('editUserRole').value;
    const status = document.getElementById('editUserStatus').value;

    window.store.updateUser(userId, { role, status });
    window.store.logActivity(user.departmentId, user.id, user.employeeId, 'EDIT_USER_ROLE', 'SUPER_ADMIN', `تعديل صلاحية المستخدم ${userId} إلى ${role}`);
    this.closeModal();
    this.render();
  }

  switchDepartmentSession(deptId) {
    const user = window.auth.getCurrentUser();
    if (user.role === 'SUPER_ADMIN') {
      user.departmentId = deptId;
      window.store.updateUser(user.id, { departmentId: deptId });
      window.auth.saveSession(user);
      this.navigate('dashboard');
    }
  }

  openEmployeeDossierModal(userId) {
    const u = window.store.getUserById(userId);
    if (!u) return;
    const db = window.store.getDb();
    const section = u.sectionId ? window.store.getSectionById(u.sectionId) : null;
    const unit = u.unitId ? window.store.getUnitById(u.unitId) : null;
    const station = u.stationId ? window.store.getStationById(u.stationId) : null;
    const empDocs = (db.employeeDocuments || []).filter(d => d.userId === u.id);

    this.showModal(`👤 الإضبارة الوظيفية والمدنية: ${u.fullName}`, `
      <div style="display: flex; flex-direction: column; gap: 1.25rem;">
        <div style="display: flex; gap: 1.25rem; align-items: center; background: var(--md-sys-color-background); padding: 1rem; border-radius: var(--radius-md); border: 1px solid var(--md-sys-color-surface-variant);">
          <div style="width: 60px; height: 60px; border-radius: 50%; background: var(--md-sys-color-primary); color: white; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; font-weight: bold;">
            ${u.fullName.charAt(0)}
          </div>
          <div>
            <h4 style="font-size: 1.2rem; font-weight: 800; margin-bottom: 2px;">${u.fullName}</h4>
            <div style="font-size: 0.85rem; color: var(--md-sys-color-outline);">
              ${u.jobTitle || 'موظف'} - ${section ? section.name : (unit ? unit.name : 'الإدارة')} ${station ? `(${station.name})` : ''}
            </div>
            <span class="badge ${window.rbac.getRoleInfo(u.role).badgeClass}" style="margin-top: 4px;">${window.rbac.getRoleInfo(u.role).name}</span>
          </div>
        </div>

        <div>
          <h5 style="color: var(--md-sys-color-primary); font-weight: bold; margin-bottom: 0.5rem;">📌 البيانات الوظيفية الرسمية</h5>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; font-size: 0.9rem;">
            <div><strong>الرقم الوظيفي:</strong> <code>${u.employeeId}</code></div>
            <div><strong>البريد الإلكتروني:</strong> ${u.email}</div>
            <div><strong>رقم الهاتف:</strong> ${u.phone || '-'}</div>
            <div><strong>الدرجة / المرحلة:</strong> ${u.jobGrade || '-'} / ${u.jobStage || '-'}</div>
            <div><strong>نوع الدوام والنوبة:</strong> ${u.workShift === 'مناوب' ? `<span class="badge badge-info" style="font-weight: 800;">مناوب (${u.assignedShift ? 'نوبة ' + u.assignedShift : (u.shift ? 'نوبة ' + u.shift : 'A')})</span>` : '<span class="badge badge-secondary">صباحي (رسمي)</span>'}</div>
            <div><strong>تاريخ التعيين:</strong> ${u.hireDate || '-'}</div>
            <div><strong>تاريخ المباشرة بالقسم:</strong> ${u.deptJoinDate || '-'}</div>
          </div>
        </div>

        <div style="border-top: 1px solid var(--md-sys-color-surface-variant); padding-top: 1rem;">
          <h5 style="color: var(--md-sys-color-primary); font-weight: bold; margin-bottom: 0.5rem;">📜 السجل المدني والشهادات</h5>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; font-size: 0.9rem;">
            <div><strong>اسم الأم:</strong> ${u.motherName || '-'}</div>
            <div><strong>اسم الأب:</strong> ${u.fatherName || '-'}</div>
            <div><strong>البطاقة الوطنية:</strong> ${u.unifiedCardNumber || '-'}</div>
            <div><strong>جواز السفر:</strong> ${u.passportNumber || '-'}</div>
            <div><strong>الشهادة والاختصاص:</strong> ${u.degree || '-'} ${u.specialization || ''}</div>
            <div><strong>جواز السلامة:</strong> ${u.safetyPassportNumber || '-'}</div>
          </div>
        </div>

        <div style="border-top: 1px solid var(--md-sys-color-surface-variant); padding-top: 1rem;">
          <h5 style="color: var(--md-sys-color-primary); font-weight: bold; margin-bottom: 0.5rem;">📁 المستمسكات الموثقة (${empDocs.length})</h5>
          <div style="display: flex; flex-direction: column; gap: 0.5rem;">
            ${empDocs.map(d => `
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem; background: var(--md-sys-color-surface-variant); border-radius: 4px; font-size: 0.85rem;">
                <span>📎 <strong>${d.type}:</strong> ${d.fileName}</span>
                <span class="badge ${d.status === 'APPROVED' ? 'badge-success' : 'badge-warning'}">${d.status === 'APPROVED' ? 'معتمد' : 'قيد التدقيق'}</span>
              </div>
            `).join('')}
            ${empDocs.length === 0 ? '<div style="color: var(--md-sys-color-outline); font-size: 0.85rem;">لم يتم رفع مستمسكات رقمية بعد.</div>' : ''}
          </div>
        </div>
      </div>
    `);
  }

  // --- Technical Status Modal & Submit (القسم 12) ---
  openCreateTechnicalStatusModal() {
    const user = window.auth.getCurrentUser();
    const stations = window.store.getStations(user.departmentId, user.sectionId);

    this.showModal('⚙️ إرسال تقرير موقف فني للمحطة', `
      <form onsubmit="window.app.handleCreateTechnicalStatusSubmit(event)">
        <div class="form-group">
          <label class="form-label">المحطة الإنتاجية</label>
          <select id="tsStationId" class="form-control" required>
            ${stations.map(st => `<option value="${st.id}">${st.name}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">الحالة التشغيلية العامة</label>
          <select id="tsOpStatus" class="form-control" required>
            <option value="OPERATIONAL">🟢 تعمل بشكل طبيعي وكفاءة كاملة</option>
            <option value="PARTIAL">🟡 تشغيل جزئي / صيانة جارية</option>
            <option value="STOPPED">🔴 متوقفة عن العمل / طارئ</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">المعدات أو الموضوع الفني</label>
          <input type="text" id="tsTopic" class="form-control" placeholder="مثال: عازلات المرحلة الأولى ومضخات الطرد" required>
        </div>
        <div class="form-group">
          <label class="form-label">وصف الحالة الفنية والضغوط</label>
          <textarea id="tsDesc" class="form-control" rows="3" placeholder="تفاصيل الملاحظات الفنية وقراءات الضغط..." required></textarea>
        </div>
        <div class="form-group">
          <label class="form-label">الأعمال الجارية والإجراءات المتخذة</label>
          <input type="text" id="tsWorks" class="form-control" placeholder="مثال: تبديل صمام LCV-201 وضبط المعايرة">
        </div>
        <button type="submit" class="btn btn-primary" style="width: 100%;">إرسال الموقف الفني للشعبة</button>
      </form>
    `);
  }

  handleCreateTechnicalStatusSubmit(e) {
    e.preventDefault();
    const user = window.auth.getCurrentUser();
    const stationId = document.getElementById('tsStationId').value;
    const station = window.store.getStationById(stationId);
    const operationalStatus = document.getElementById('tsOpStatus').value;
    const equipmentTopic = document.getElementById('tsTopic').value;
    const description = document.getElementById('tsDesc').value;
    const ongoingWorks = document.getElementById('tsWorks').value;

    window.store.addTechnicalStatusReport({
      id: 'ts-' + Date.now(),
      departmentId: user.departmentId,
      sectionId: station ? station.sectionId : user.sectionId,
      stationId,
      stationName: station ? station.name : 'المحطة',
      operationalStatus,
      equipmentTopic,
      description,
      ongoingWorks,
      priority: operationalStatus === 'STOPPED' ? 'HIGH' : 'NORMAL',
      handlingStatus: 'IN_PROGRESS',
      notes: 'تم استلام الموقف ومتابعته',
      submittedBy: user.id,
      submittedByName: user.fullName,
      submittedAt: new Date().toISOString()
    });

    window.store.logActivity(user.departmentId, user.id, user.employeeId, 'CREATE_TECHNICAL_STATUS', 'OPERATIONS', `إرسال موقف فني: ${station?.name || ''}`);
    this.closeModal();
    this.render();
  }

  // --- Promotion Calculator (BOC Law 22 of 2008 & Thanks Rules) ---
  handleCalculatePromotion(e) {
    if (e && e.preventDefault) e.preventDefault();
    const gradeEl = document.getElementById('calcGrade');
    const stageEl = document.getElementById('calcStage');
    const degreeEl = document.getElementById('calcDegree');
    const lastPromoEl = document.getElementById('calcLastDate');
    const thanksMinisterEl = document.getElementById('calcThanksMinister') || document.getElementById('calcThanks');
    const thanksPmEl = document.getElementById('calcThanksPM');
    const thanksPresEl = document.getElementById('calcThanksPres');

    const grade = gradeEl ? gradeEl.value : '4';
    const stage = stageEl ? parseInt(stageEl.value, 10) : 1;
    const degree = degreeEl ? degreeEl.value : 'بكالوريوس';
    const lastPromo = lastPromoEl ? lastPromoEl.value : '2022-01-01';
    
    const thanksMinister = thanksMinisterEl ? (parseInt(thanksMinisterEl.value, 10) || 0) : 0;
    const thanksPM = thanksPmEl ? (parseInt(thanksPmEl.value, 10) || 0) : 0;
    const thanksPres = thanksPresEl ? (parseInt(thanksPresEl.value, 10) || 0) : 0;

    const thanksConfig = {
      minister: thanksMinister,
      primeMinister: thanksPM,
      president: thanksPres
    };

    const user = window.auth.getCurrentUser();
    if (user) {
      user.jobGrade = grade;
      user.jobStage = stage;
      user.degree = degree;
      user.lastPromotionDate = lastPromo;
      user.thanksLettersCount = thanksMinister;
      user.thanksConfig = thanksConfig;
      window.store.updateUser(user.id, { 
        jobGrade: grade, 
        jobStage: stage, 
        degree: degree, 
        lastPromotionDate: lastPromo, 
        thanksLettersCount: thanksMinister,
        thanksConfig: thanksConfig
      });
      window.auth.saveSession(user);
    }
    this.render();
  }

  // --- Recycle Bin Handlers (القسم 18) ---
  handleRestoreFromRecycleBin(binId) {
    const res = window.store.restoreFromRecycleBin(binId);
    if (res.success) {
      alert('تمت استعادة العنصر بنجاح!');
      this.render();
    } else {
      alert('تعذر استعادة العنصر: ' + res.error);
    }
  }

  handlePermanentDelete(binId) {
    if (confirm('تحذير: هل أنت متأكد من الحذف النهائي؟ لا يمكن التراجع عن هذا الإجراء.')) {
      window.store.permanentDeleteFromRecycleBin(binId);
      this.render();
    }
  }

  // --- Feature Flags (القسم 63) ---
  toggleFeatureFlag(flagName, value) {
    window.store.updateFeatureFlag(flagName, value);
    this.render();
  }

  // --- Vehicle Status Modal (القسم 13) ---
  openEditVehicleStatusModal(vmId) {
    const user = window.auth.getCurrentUser();
    const vm = window.store.getVehicleMovements(user.departmentId).find(v => v.id === vmId);
    if (!vm) return;

    this.showModal(`🚘 تحديث حالة المركبة: ${vm.vehicleNumber}`, `
      <form onsubmit="window.app.handleEditVehicleStatusSubmit(event, '${vmId}')">
        <div class="form-group">
          <label class="form-label">الرقم الجانبي</label>
          <input type="text" id="vSideNum" class="form-control" value="${vm.sideNumber || ''}">
        </div>
        <div class="form-group">
          <label class="form-label">الحالة التشغيلية للمركبة</label>
          <select id="vOpState" class="form-control" required>
            <option value="OPERATIONAL" ${vm.operationalState === 'OPERATIONAL' ? 'selected' : ''}>🟢 تعمل (جاهزية كاملة)</option>
            <option value="IN_REPAIR" ${vm.operationalState === 'IN_REPAIR' ? 'selected' : ''}>🟡 في التصليح والصيانة</option>
            <option value="STOPPED" ${vm.operationalState === 'STOPPED' ? 'selected' : ''}>🔴 متوقفة عن العمل</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">الوجهة أو المهمة الميدانية</label>
          <input type="text" id="vDest" class="form-control" value="${vm.destination || ''}">
        </div>
        <button type="submit" class="btn btn-primary" style="width: 100%;">حفظ التحديثات</button>
      </form>
    `);
  }

  handleEditVehicleStatusSubmit(e, vmId) {
    e.preventDefault();
    const user = window.auth.getCurrentUser();
    const sideNumber = document.getElementById('vSideNum').value;
    const operationalState = document.getElementById('vOpState').value;
    const destination = document.getElementById('vDest').value;

    window.store.updateVehicleMovement(vmId, { sideNumber, operationalState, destination });
    window.store.logActivity(user.departmentId, user.id, user.employeeId, 'UPDATE_VEHICLE_STATUS', 'VEHICLES', `تحديث حالة المركبة ${vmId} إلى ${operationalState}`);
    this.closeModal();
    this.render();
  }

  // --- Official Sharing Handlers (القسم 15) ---
  shareViaWhatsApp(title) {
    const text = encodeURIComponent(`*منظومة قسم الإنتاج الجنوبي*\n📄 تم نشر وتحديث المستند: ${title}\n🌐 الرابط: ${window.location.href}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  }

  shareViaOutlook(title) {
    const subject = encodeURIComponent(`مستند رسمي: ${title} - قسم الإنتاج الجنوبي`);
    const body = encodeURIComponent(`تحية طيبة،\n\nنود إعلامكم بنشر المستند التالي عبر منصة قسم الإنتاج الجنوبي الموحدة:\n- العنوان: ${title}\n- الرابط: ${window.location.href}\n\nمع التقدير،\nإدارة قسم الإنتاج الجنوبي`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  }

  // --- Direct Staff Communication Handlers (واتساب وإيميل المنتسب) ---
  openDirectWhatsApp(rawPhone, name = '') {
    if (!rawPhone || !rawPhone.trim() || rawPhone === 'غير مسجل' || rawPhone === '-') {
      if (typeof this.showToast === 'function') {
        this.showToast('لا يتوفر رقم هاتف مسجل لهذا المنتسب للمراسلة عبر واتساب', 'warning');
      } else {
        alert('لا يتوفر رقم هاتف مسجل لهذا المنتسب للمراسلة عبر واتساب');
      }
      return;
    }
    let cleaned = rawPhone.replace(/\D/g, '');
    if (cleaned.startsWith('07')) {
      cleaned = '964' + cleaned.substring(1);
    } else if (cleaned.startsWith('7') && cleaned.length === 10) {
      cleaned = '964' + cleaned;
    }
    const defaultMsg = encodeURIComponent(`تحية طيبة زميلنا العزيز ${name ? name : ''}، بخصوص أعمال قسم الإنتاج الجنوبي.`);
    window.open(`https://wa.me/${cleaned}?text=${defaultMsg}`, '_blank');
  }

  openDirectEmail(email, name = '') {
    if (!email || !email.trim() || email === 'غير مسجل' || email === '-') {
      if (typeof this.showToast === 'function') {
        this.showToast('لا يتوفر بريد إلكتروني مسجل لهذا المنتسب للمراسلة', 'warning');
      } else {
        alert('لا يتوفر بريد إلكتروني مسجل لهذا المنتسب للمراسلة');
      }
      return;
    }
    const subject = encodeURIComponent(`تواصل رسمي - قسم الإنتاج الجنوبي ${name ? `(${name})` : ''}`);
    const body = encodeURIComponent(`تحية طيبة زميلنا العزيز ${name || ''}،\n\nنود التواصل معكم بخصوص متطلبات العمل في قسم الإنتاج الجنوبي.\n\nمع التقدير،\nإدارة قسم الإنتاج الجنوبي`);
    window.location.href = `mailto:${email.trim()}?subject=${subject}&body=${body}`;
  }

  // --- PWA Installation Prompt (القسم 39) ---
  promptPWAInstall() {
    if (window.deferredPWAPrompt) {
      window.deferredPWAPrompt.prompt();
      window.deferredPWAPrompt.userChoice.then(choiceResult => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted PWA install prompt');
          try {
            if (typeof localStorage !== 'undefined') localStorage.setItem('pwa_installed', 'true');
          } catch (e) {}
        }
        window.deferredPWAPrompt = null;
        const btn = document.getElementById('pwaInstallBtn');
        if (btn) btn.style.display = 'none';
        const card = document.getElementById('dashboardPwaInstallCard');
        if (card) card.remove();
      });
    } else {
      alert('لتثبيت المنظومة كتطبيق هاتف، اضغط على زر خيارات المتصفح (⋮) ثم اختر "إضافة إلى الشاشة الرئيسية" (Install App).');
    }
  }

  dismissPWABanner() {
    try {
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem('pwa_banner_dismissed', 'true');
      }
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('pwa_banner_dismissed', 'true');
      }
    } catch (e) {
      console.warn('Storage error on dismiss PWA banner:', e);
    }
    const card = document.getElementById('dashboardPwaInstallCard');
    if (card) {
      card.style.transition = 'opacity 0.25s ease, transform 0.25s ease, height 0.25s ease, margin 0.25s ease';
      card.style.opacity = '0';
      card.style.transform = 'scale(0.96) translateY(-8px)';
      card.style.pointerEvents = 'none';
      setTimeout(() => {
        if (card && card.parentNode) {
          card.parentNode.removeChild(card);
        }
      }, 260);
    }
  }

  // --- Section to Stations Notifications (تبليغات مسؤول الشعبة لمحطاته) ---
  openCreateSectionNotificationModal(sectionId) {
    const user = window.auth.getCurrentUser();
    const section = window.store.getSectionById(sectionId);
    const stations = window.store.getStations(user ? user.departmentId : 'dept-south-prod', sectionId);

    this.showModal(`📢 إصدار تبليغ رسمي لمحطات الشعبة (${section?.name || 'الشعبة'})`, `
      <form onsubmit="window.app.handleCreateSectionNotificationSubmit(event, '${sectionId}')">
        <div class="form-group" style="margin-bottom: 1rem;">
          <label class="form-label" style="font-weight: 700;">عنوان التبليغ / التوجيه <span style="color: red;">*</span></label>
          <input type="text" id="secNotifTitle" class="form-control" placeholder="مثال: تأكيد الالتزام بإجراءات السلامة وفحص صمامات العزل" required>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
          <div class="form-group">
            <label class="form-label" style="font-weight: 700;">المحطة المستهدفة بالتبليغ</label>
            <select id="secNotifTargetStation" class="form-control">
              <option value="ALL">📍 كافة محطات الشعبة (${stations.length} محطات)</option>
              ${stations.map(st => `
                <option value="${st.id}">محطة: ${st.name} (${st.code})</option>
              `).join('')}
            </select>
          </div>

          <div class="form-group">
            <label class="form-label" style="font-weight: 700;">درجة الأولوية والأهمية</label>
            <select id="secNotifPriority" class="form-control">
              <option value="NORMAL">ℹ️ اعتيادي</option>
              <option value="HIGH">⚠️ هام</option>
              <option value="URGENT">🚨 عاجل جداً</option>
            </select>
          </div>
        </div>

        <div class="form-group" style="margin-bottom: 1.25rem;">
          <label class="form-label" style="font-weight: 700;">نص التوجيه / التبليغ الرسمي <span style="color: red;">*</span></label>
          <textarea id="secNotifContent" class="form-control" rows="5" placeholder="أدخل تفاصيل التوجيه والتعليمات الصادرة لمسؤولي المحطات ومشغلي النوبات..." required></textarea>
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 0.5rem;">
          <button type="button" class="btn btn-outline" onclick="window.app.closeModal()">إلغاء</button>
          <button type="submit" class="btn btn-primary" style="font-weight: 700;">📢 نشر التبليغ فوراً</button>
        </div>
      </form>
    `);
  }

  handleCreateSectionNotificationSubmit(e, sectionId) {
    if (e && e.preventDefault) e.preventDefault();
    const user = window.auth.getCurrentUser();
    const title = document.getElementById('secNotifTitle')?.value.trim();
    const targetStationId = document.getElementById('secNotifTargetStation')?.value || 'ALL';
    const priority = document.getElementById('secNotifPriority')?.value || 'NORMAL';
    const content = document.getElementById('secNotifContent')?.value.trim();

    if (!title || !content) {
      alert('يرجى ملء عنوان التبليغ ونصه بشكل كامل.');
      return;
    }

    let targetStationName = 'كافة محطات الشعبة';
    if (targetStationId !== 'ALL') {
      const st = window.store.getStationById(targetStationId);
      if (st) targetStationName = st.name;
    }

    window.store.addSectionNotification({
      sectionId,
      targetStationId,
      targetStationName,
      title,
      content,
      priority
    }, user);

    alert('✅ تم نشر وتوجيه التبليغ الرسمي لمحطات الشعبة بنجاح.');
    this.closeModal();
    this.currentSectionSubTab = 'notifs';
    this.render();
  }

  handleDeleteSectionNotification(notifId, sectionId) {
    const user = window.auth.getCurrentUser();
    if (!confirm('هل أنت متأكد من رغبتك في حذف هذا التبليغ؟')) return;

    window.store.deleteSectionNotification(notifId, user);
    this.render();
  }

  viewSectionNotificationDetails(notifId) {
    const db = window.store.getDb();
    const notif = (db.sectionNotifications || []).find(n => n.id === notifId);
    if (!notif) {
      alert('التبليغ غير موجود.');
      return;
    }

    const priorityLabel = notif.priority === 'URGENT' ? '🚨 عاجل جداً' : (notif.priority === 'HIGH' ? '⚠️ هام' : 'ℹ️ اعتيادي');

    this.showModal(`📢 تفاصيل التبليغ: ${notif.title}`, `
      <div style="direction: rtl;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; border-bottom: 1px solid var(--md-sys-color-surface-variant); padding-bottom: 0.75rem;">
          <div style="display: flex; gap: 0.5rem; align-items: center;">
            <span class="badge ${notif.priority === 'URGENT' ? 'badge-danger' : (notif.priority === 'HIGH' ? 'badge-warning' : 'badge-info')}">
              ${priorityLabel}
            </span>
            <span class="badge badge-primary">
              📍 ${notif.targetStationName || 'كافة محطات الشعبة'}
            </span>
          </div>
          <span style="font-size: 0.82rem; color: var(--md-sys-color-outline); font-family: monospace;">
            📅 ${new Date(notif.publishDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
          </span>
        </div>

        <div style="background: var(--md-sys-color-background); border: 1px solid var(--md-sys-color-surface-variant); border-radius: var(--radius-md); padding: 1.25rem; font-size: 0.95rem; line-height: 1.8; margin-bottom: 1.25rem; white-space: pre-wrap;">
          ${notif.content}
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem; color: var(--md-sys-color-outline); margin-bottom: 1rem;">
          <div>
            ✍️ <strong>المسؤول المُصدِر:</strong> ${notif.createdByName || 'مسؤول الشعبة'}
          </div>
          <div>
            🆔 <code>${notif.id}</code>
          </div>
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 0.5rem;">
          <button class="btn btn-outline" onclick="window.app.printSectionNotification('${notif.id}')">
            🖨️ طباعة التبليغ
          </button>
          <button class="btn btn-primary" onclick="window.app.closeModal()">
            إغلاق
          </button>
        </div>
      </div>
    `);
  }

  printSectionNotification(notifId) {
    const db = window.store.getDb();
    const notif = (db.sectionNotifications || []).find(n => n.id === notifId);
    if (!notif) {
      alert('التبليغ غير موجود');
      return;
    }

    const priorityLabel = notif.priority === 'URGENT' ? 'عاجل جداً' : (notif.priority === 'HIGH' ? 'هام' : 'اعتيادي');
    const sec = notif.sectionId ? window.store.getSectionById(notif.sectionId) : null;
    const formattedDate = new Date(notif.publishDate || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    const contentHtml = `
      <div style="direction: rtl; font-family: 'Cairo', sans-serif; padding: 20px;">
        <div style="border-bottom: 2px solid #003366; padding-bottom: 15px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-start;">
          <div>
            <div style="font-size: 1.2rem; font-weight: 900; color: #003366;">جمهورية العراق - وزارة النفط</div>
            <div style="font-size: 1.1rem; font-weight: 800; color: #004d40;">شركة نفط البصرة</div>
            <div style="font-size: 1rem; font-weight: 800; color: #b45309;">هيأة تشغيل الرميلة</div>
            <div style="font-size: 0.95rem; font-weight: 800; color: #0f172a;">قسم الإنتاج الجنوبي ${sec ? ' | ' + sec.name : ''}</div>
          </div>
          <div style="text-align: left; font-size: 0.9rem; border: 1px solid #cbd5e1; padding: 8px 12px; border-radius: 6px; background: #f8fafc;">
            <div><strong>كود التبليغ:</strong> <code>${notif.id}</code></div>
            <div><strong>التاريخ:</strong> <span style="font-family: monospace;">${formattedDate}</span></div>
            <div><strong>الأولوية:</strong> ${priorityLabel}</div>
          </div>
        </div>

        <div style="margin-bottom: 20px;">
          <div style="background: #f4f4f4; padding: 10px 15px; border-radius: 5px; margin-bottom: 15px;">
            <strong>الجهة المستهدفة:</strong> ${notif.targetStationName || 'كافة محطات الشعبة'}
          </div>
          <h3 style="color: #003366; margin-bottom: 15px;">${notif.title}</h3>
          <div style="font-size: 1.05rem; line-height: 1.9; white-space: pre-wrap; padding: 15px; border: 1px solid #ddd; border-radius: 5px;">
            ${notif.content}
          </div>
        </div>

        <div style="margin-top: 40px; display: flex; justify-content: space-between; align-items: flex-end;">
          <div>
            <strong>المُصدِر:</strong> ${notif.createdByName || 'مسؤول الشعبة'}<br>
            <span style="font-size: 0.85rem; color: #666;">مسؤول الشعبة الميدانية</span>
          </div>
          <div style="text-align: left;">
            <strong>التوقيع والختم الرسمي</strong><br><br>
            _______________________
          </div>
        </div>
      </div>
    `;

    if (window.exporter && typeof window.exporter.printDocument === 'function') {
      window.exporter.printDocument(`تبليغ رسمي - ${notif.title}`, 'وزارة النفط - شركة نفط البصرة - هيأة تشغيل الرميلة - قسم الإنتاج الجنوبي', contentHtml, {
        sectionName: sec ? sec.name : '',
        stationName: notif.targetStationName || '',
        docNumber: notif.id
      });
    } else {
      window.print();
    }
  }

  // --- Official Department & Central Notifications (معاينة وطباعة التبليغات المركزية) ---
  openViewOfficialNotificationModal(notifId) {
    const db = window.store.getDb();
    let notif = (db.officialNotifications || []).find(n => n.id === notifId);
    if (!notif) {
      notif = (db.sectionNotifications || []).find(n => n.id === notifId);
    }
    if (!notif) {
      alert('التبليغ غير موجود.');
      return;
    }

    const priority = notif.importance || notif.priority || 'NORMAL';
    const isUrgent = priority === 'URGENT';
    const isHigh = priority === 'HIGH';
    const priorityLabel = isUrgent ? '🚨 عاجل جداً' : (isHigh ? '⚠️ هام' : 'ℹ️ اعتيادي');
    const priorityBadgeClass = isUrgent ? 'badge-danger' : (isHigh ? 'badge-warning' : 'badge-info');

    const targetLabel = notif.targetSectionName || (notif.targetScope === 'ALL_SECTIONS' ? '🌐 كافة شعب ووحدات القسم' : (notif.targetStationName ? '📍 ' + notif.targetStationName : '🏢 شعبة محددة'));
    const notifNum = notif.number || notif.id || 'ت-2026/001';
    const formattedDate = new Date(notif.publishDate || notif.createdAt || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const formattedTime = new Date(notif.publishDate || notif.createdAt || Date.now()).toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit' });

    this.showModal(`📢 تفاصيل التبليغ الرسمي: ${notif.title}`, `
      <div style="direction: rtl;">
        
        <!-- Header Info Banner -->
        <div style="background: linear-gradient(135deg, var(--md-sys-color-primary), #003366); color: white; border-radius: var(--radius-md); padding: 1.15rem 1.25rem; margin-bottom: 1.25rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem;">
          <div>
            <div style="font-size: 0.78rem; opacity: 0.85; margin-bottom: 3px;">
              وزارة النفط | شركة نفط البصرة | هيأة تشغيل الرميلة | قسم الإنتاج الجنوبي
            </div>
            <h3 style="margin: 0; font-size: 1.2rem; font-weight: 800; color: white;">${notif.title}</h3>
          </div>
          <div style="display: flex; gap: 0.4rem; flex-wrap: wrap;">
            <span class="badge ${priorityBadgeClass}" style="font-size: 0.8rem; padding: 0.35rem 0.75rem; font-weight: 800;">${priorityLabel}</span>
            <span class="badge" style="background: rgba(255,255,255,0.2); color: white; font-size: 0.8rem; padding: 0.35rem 0.75rem;">${targetLabel}</span>
          </div>
        </div>

        <!-- Meta Info Bar -->
        <div style="display: flex; justify-content: space-between; align-items: center; background: var(--md-sys-color-surface-variant); padding: 0.65rem 1rem; border-radius: var(--radius-sm); margin-bottom: 1rem; font-size: 0.82rem; color: var(--md-sys-color-outline); flex-wrap: wrap; gap: 0.5rem;">
          <div>✍️ <strong>المسؤول المُصدِر:</strong> <span style="color: var(--md-sys-color-on-surface); font-weight: 700;">${notif.createdByName || notif.sender || 'إدارة القسم'}</span></div>
          <div>📅 <strong>تاريخ الإصدار:</strong> <span style="font-family: monospace; color: var(--md-sys-color-primary); font-weight: 700;">${formattedDate} ${formattedTime}</span></div>
          <div>🆔 <strong>رقم التبليغ:</strong> <code style="font-weight: 700;">${notifNum}</code></div>
        </div>

        <!-- Content Body -->
        <div style="background: var(--md-sys-color-background); border: 1.5px solid var(--md-sys-color-surface-variant); border-radius: var(--radius-md); padding: 1.35rem; font-size: 1rem; line-height: 1.9; margin-bottom: 1.25rem; white-space: pre-wrap; color: var(--md-sys-color-on-surface);">
          ${notif.content || notif.body || 'لا يوجد نص'}
        </div>

        <!-- Footer Actions -->
        <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--md-sys-color-surface-variant); padding-top: 1rem; flex-wrap: wrap; gap: 0.5rem;">
          <div style="font-size: 0.78rem; color: var(--md-sys-color-outline);">
            وزارة النفط - شركة نفط البصرة - هيأة تشغيل الرميلة - قسم الإنتاج الجنوبي
          </div>
          <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; align-items: center;">
            <button class="btn btn-glass-amber" onclick="window.app.printOfficialNotification('${notif.id}')" title="طباعة التبليغ الرسمي">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="6 9 6 2 18 2 18 9"></polyline>
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                <rect x="6" y="14" width="12" height="8"></rect>
              </svg>
              <span>طباعة التبليغ</span>
              <span style="font-size: 1.05rem;">🖨️</span>
            </button>
            <button class="btn btn-glass-emerald" onclick="window.app.shareViaWhatsApp('${(notif.title || '').replace(/'/g, "\\'")}: ${(notif.content || notif.body || '').replace(/'/g, "\\'")}')" title="مشاركة التبليغ عبر واتساب">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.196 8.196 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24zm4.52 11.66c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.02-1.25-.75-.67-1.26-1.5-1.41-1.75-.14-.25-.02-.39.11-.51.11-.11.25-.29.38-.44.13-.15.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.13.17 1.77 2.71 4.3 3.8.6.26 1.07.42 1.44.53.61.19 1.16.17 1.6-.1.49-.3 1.47-1.2 1.68-1.68.21-.48.21-.89.15-.98-.06-.09-.23-.15-.48-.27z"/>
              </svg>
              <span>واتساب</span>
            </button>
            <button class="btn btn-glass-slate" onclick="window.app.closeModal()">
              <span>إغلاق</span>
            </button>
          </div>
        </div>

      </div>
    `);
  }

  openViewNotificationModal(notifId) {
    return this.openViewOfficialNotificationModal(notifId);
  }

  printOfficialNotification(notifId) {
    const db = window.store.getDb();
    let notif = (db.officialNotifications || []).find(n => n.id === notifId);
    if (!notif) notif = (db.sectionNotifications || []).find(n => n.id === notifId);
    if (!notif) {
      alert('التبليغ غير موجود');
      return;
    }

    const priority = notif.importance || notif.priority || 'NORMAL';
    const priorityLabel = priority === 'URGENT' ? 'عاجل جداً' : (priority === 'HIGH' ? 'هام' : 'اعتيادي');
    const targetLabel = notif.targetSectionName || (notif.targetScope === 'ALL_SECTIONS' ? 'كافة شعب ووحدات القسم' : (notif.targetStationName ? notif.targetStationName : 'شعبة محددة'));
    const notifNum = notif.number || notif.id || 'ت-2026/001';
    const formattedDate = new Date(notif.publishDate || notif.createdAt || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    const contentHtml = `
      <div style="direction: rtl; font-family: 'Cairo', sans-serif; padding: 25px;">
        <div style="border-bottom: 2px solid #003366; padding-bottom: 15px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-start;">
          <div>
            <div style="font-size: 1.2rem; font-weight: 900; color: #003366;">جمهورية العراق - وزارة النفط</div>
            <div style="font-size: 1.1rem; font-weight: 800; color: #004d40;">شركة نفط البصرة</div>
            <div style="font-size: 1rem; font-weight: 800; color: #b45309;">هيأة تشغيل الرميلة</div>
            <div style="font-size: 0.95rem; font-weight: 800; color: #0f172a;">قسم الإنتاج الجنوبي</div>
          </div>
          <div style="text-align: left; font-size: 0.9rem; border: 1px solid #cbd5e1; padding: 8px 12px; border-radius: 6px; background: #f8fafc;">
            <div><strong>كود التبليغ:</strong> <code>${notifNum}</code></div>
            <div><strong>التاريخ:</strong> <span style="font-family: monospace;">${formattedDate}</span></div>
            <div><strong>الأولوية:</strong> ${priorityLabel}</div>
          </div>
        </div>

        <div style="margin-bottom: 20px;">
          <div style="background: #f4f4f4; padding: 10px 15px; border-radius: 5px; margin-bottom: 15px; display: flex; justify-content: space-between;">
            <div><strong>الجهة المستهدفة:</strong> ${targetLabel}</div>
            <div><strong>الجهة المُصدِرة:</strong> ${notif.createdByName || notif.sender || 'إدارة القسم'}</div>
          </div>
          <h3 style="color: #003366; margin-bottom: 15px; font-size: 1.25rem;">${notif.title}</h3>
          <div style="font-size: 1.05rem; line-height: 2; white-space: pre-wrap; padding: 20px; border: 1px solid #ddd; border-radius: 6px; background: #fff;">
            ${notif.content || notif.body || ''}
          </div>
        </div>

        <div style="margin-top: 50px; display: flex; justify-content: space-between; align-items: flex-end;">
          <div>
            <strong>المُصدِر:</strong> ${notif.createdByName || notif.sender || 'إدارة قسم الإنتاج الجنوبي'}<br>
            <span style="font-size: 0.85rem; color: #666;">قسم الإنتاج الجنوبي</span>
          </div>
          <div style="text-align: left;">
            <strong>التوقيع والختم الرسمي المعتمد</strong><br><br>
            _______________________________
          </div>
        </div>
      </div>
    `;

    if (window.exporter && typeof window.exporter.printDocument === 'function') {
      window.exporter.printDocument(`تبليغ رسمي - ${notif.title}`, 'وزارة النفط - شركة نفط البصرة - هيأة تشغيل الرميلة - قسم الإنتاج الجنوبي', contentHtml, {
        sectionName: notif.targetSectionName || '',
        docNumber: notifNum
      });
    }
  }

  // --- Section & Unit Comprehensive Data Entry (الاستمارة المركزية الموحدة لملء وتحديث البيانات) ---
  openUnifiedDataEntryModal(options = {}) {
    const actorUser = window.auth.getCurrentUser();
    let targetUser = actorUser;
    let sectionId = options.sectionId || null;
    let unitId = options.unitId || null;

    if (options.employeeId) {
      const found = window.store.getEmployeeMasterRecordByEmployeeId(options.employeeId) || window.store.getUserByEmployeeId(options.employeeId);
      if (found) targetUser = found;
    } else if (options.targetUser) {
      targetUser = options.targetUser;
    }

    if (!sectionId && targetUser?.sectionId) sectionId = targetUser.sectionId;
    if (!unitId && targetUser?.unitId) unitId = targetUser.unitId;

    let entityName = 'الاستمارة المركزية الموحدة لملء وتحديث بيانات القسم';
    if (options.sectionId) {
      const sec = window.store.getSectionById(options.sectionId);
      if (sec) entityName = `شعبة ${sec.name}`;
    } else if (options.unitId) {
      const un = window.store.getUnitById(options.unitId);
      if (un) entityName = `وحدة ${un.name}`;
    }

    this.showDataEntryModal(entityName, sectionId, unitId, targetUser);
  }

  openSectionDataEntryModal(sectionId) {
    this.openUnifiedDataEntryModal({ sectionId });
  }

  openUnitDataEntryModal(unitId) {
    const unit = window.store.getUnitById(unitId);
    this.openUnifiedDataEntryModal({ unitId, sectionId: unit?.sectionId || null });
  }

  onDataEntrySectionChange(val) {
    this.onMainOrgChange(val);
  }

  onMainOrgChange(val) {
    const actorUser = window.auth.getCurrentUser();
    const deptId = actorUser?.departmentId || 'dept-south-prod';
    const allStations = window.store.getDb()?.stations || [];
    const subSelect = document.getElementById('deSubOrgSelect');
    const secHidden = document.getElementById('deSectionId');
    const unitHidden = document.getElementById('deUnitId');
    const stHidden = document.getElementById('deStationId');

    let sectionId = null;
    let unitId = null;
    let subOptionsHtml = '';

    if (!val || val === 'DEPT') {
      sectionId = null;
      unitId = null;
      subOptionsHtml = `<option value="HQ">🏛️ ادارة القسم</option>`;
    } else if (val.startsWith('SECTION:')) {
      sectionId = val.replace('SECTION:', '');
      unitId = null;
      const sec = window.store.getSectionById(sectionId);
      const secStations = allStations.filter(st => st.sectionId === sectionId);
      
      subOptionsHtml = `
        <option value="HQ">🏢 ادارة الشعبة</option>
        ${secStations.length > 0 ? `
          <optgroup label="🏭 المحطات التشغيلية التابعة للشعبة">
            ${secStations.map(st => `<option value="STATION:${st.id}">🏭 ${st.name} (${st.code || 'محطة'})</option>`).join('')}
          </optgroup>
        ` : ''}
      `;
    } else if (val.startsWith('UNIT:')) {
      unitId = val.replace('UNIT:', '');
      const unit = window.store.getUnitById(unitId);
      sectionId = unit?.sectionId || null;
      const unitStations = allStations.filter(st => st.unitId === unitId || (sectionId && st.sectionId === sectionId));

      subOptionsHtml = `
        <option value="HQ">🏢 ادارة الوحدة</option>
        ${unitStations.length > 0 ? `
          <optgroup label="🏭 المحطات والمواقع التشغيلية المرتبطة">
            ${unitStations.map(st => `<option value="STATION:${st.id}">🏭 ${st.name} (${st.code || 'محطة'})</option>`).join('')}
          </optgroup>
        ` : ''}
      `;
    }

    if (subSelect) {
      subSelect.innerHTML = subOptionsHtml;
      subSelect.value = 'HQ';
    }
    if (secHidden) secHidden.value = sectionId || '';
    if (unitHidden) unitHidden.value = unitId || '';
    if (stHidden) stHidden.value = '';

    this.updateOrgRoutePreview();
  }

  onSubOrgChange(val) {
    const stHidden = document.getElementById('deStationId');
    if (stHidden) {
      if (val && val.startsWith('STATION:')) {
        stHidden.value = val.replace('STATION:', '');
      } else {
        stHidden.value = '';
      }
    }
    this.updateOrgRoutePreview();
  }

  updateOrgRoutePreview() {
    const mainSelect = document.getElementById('deMainOrgSelect');
    const subSelect = document.getElementById('deSubOrgSelect');
    const workShiftSelect = document.getElementById('deWorkShift');
    const shiftNameSelect = document.getElementById('deShiftName');
    const previewEl = document.getElementById('deRoutePathPreview');
    if (!previewEl) return;

    const mainVal = mainSelect ? mainSelect.value : 'DEPT';
    const subVal = subSelect ? subSelect.value : 'HQ';
    const workShift = workShiftSelect ? workShiftSelect.value : 'صباحي';
    const shiftName = shiftNameSelect ? shiftNameSelect.value : 'A';

    const mainText = mainSelect ? mainSelect.options[mainSelect.selectedIndex]?.text.replace(/^[🛢️🏛️⚡\s]+/, '').trim() : 'ادارة القسم';
    const subText = subSelect ? subSelect.options[subSelect.selectedIndex]?.text.replace(/^[🏢🏛️🏭\s]+/, '').trim() : '';

    let parts = ['وزارة النفط', 'شركة نفط البصرة', 'هيأة تشغيل الرميلة', 'قسم الإنتاج الجنوبي'];
    if (mainVal === 'DEPT') {
      parts.push('ادارة القسم');
    } else {
      parts.push(mainText);
      if (subText) {
        parts.push(subText);
      }
    }

    if (workShift === 'مناوب') {
      const shiftDisplay = shiftName ? (shiftName.startsWith('نوبة') ? shiftName : 'نوبة ' + shiftName) : 'نوبة A';
      parts.push(`مناوب (${shiftDisplay})`);
    } else if (workShift === 'حقلي') {
      const fieldAscendDate = document.getElementById('deFieldAscendDate')?.value;
      const fieldDescendDate = document.getElementById('deFieldDescendDate')?.value;
      if (fieldAscendDate) {
        parts.push(`حقلي (صعود: ${fieldAscendDate} ← نزول: ${fieldDescendDate || 'بعد 14 يوماً'})`);
      } else {
        parts.push(`حقلي (نظام 14 يوم دوام / 14 يوم استراحة)`);
      }
    } else {
      parts.push(`صباحي`);
    }

    previewEl.innerHTML = parts.join(' <span class="cyber-route-arrow">←</span> ');
  }

  onFieldAscendDateChange(ascendDate) {
    if (!ascendDate) {
      this.updateOrgRoutePreview();
      return;
    }
    const start = new Date(ascendDate);
    if (!isNaN(start.getTime())) {
      const end = new Date(start.getTime() + 14 * 24 * 60 * 60 * 1000);
      const endStr = end.toISOString().split('T')[0];
      const descendEl = document.getElementById('deFieldDescendDate');
      if (descendEl) {
        descendEl.value = endStr;
      }
      const statusEl = document.getElementById('deFieldRotationStatusText');
      if (statusEl) {
        statusEl.textContent = `دورة العمل الحقلية الحالية: يبدأ الدوام الميداني بتاريخ ${ascendDate} وينزل للاستراحة بتاريخ ${endStr} (14 يوماً عمل / 14 يوماً استراحة).`;
      }
    }
    this.updateOrgRoutePreview();
  }

  toggleWorkShiftSelection(val) {
    const shiftBox = document.getElementById('deShiftNameBox');
    const shiftSelect = document.getElementById('deShiftName');
    const fieldDatesBox = document.getElementById('deFieldShiftDatesBox');

    if (val === 'مناوب') {
      if (shiftBox) {
        shiftBox.style.display = 'block';
        shiftBox.classList.add('cyber-shift-box-anim');
      }
      if (shiftSelect) shiftSelect.disabled = false;
      if (fieldDatesBox) {
        fieldDatesBox.style.display = 'none';
        fieldDatesBox.classList.remove('cyber-shift-box-anim');
      }
    } else if (val === 'حقلي') {
      if (shiftBox) {
        shiftBox.style.display = 'none';
        shiftBox.classList.remove('cyber-shift-box-anim');
      }
      if (shiftSelect) shiftSelect.disabled = true;
      if (fieldDatesBox) {
        fieldDatesBox.style.display = 'block';
        fieldDatesBox.classList.add('cyber-shift-box-anim');
      }
    } else {
      if (shiftBox) {
        shiftBox.style.display = 'none';
        shiftBox.classList.remove('cyber-shift-box-anim');
      }
      if (shiftSelect) shiftSelect.disabled = true;
      if (fieldDatesBox) {
        fieldDatesBox.style.display = 'none';
        fieldDatesBox.classList.remove('cyber-shift-box-anim');
      }
    }
    this.updateOrgRoutePreview();
  }

  showDataEntryModal(entityName, sectionId, unitId, user) {
    const actorUser = window.auth.getCurrentUser() || user || {};
    const targetUser = user || window.auth.getCurrentUser() || {};
    const canAddFields = window.rbac && typeof window.rbac.hasPermission === 'function'
      ? (window.rbac.hasPermission(actorUser, 'CAREER_ADD_DYNAMIC_FIELD') || ['SUPER_ADMIN', 'DEPT_MANAGER', 'SECTION_MANAGER', 'ADMINISTRATOR'].includes(actorUser?.role))
      : ['SUPER_ADMIN', 'DEPT_MANAGER', 'SECTION_MANAGER', 'ADMINISTRATOR'].includes(actorUser?.role);

    const effectiveDeptId = actorUser?.departmentId || targetUser?.departmentId || 'dept-south-prod';
    const allSections = window.store.getSections(effectiveDeptId) || [];
    const allUnits = window.store.getUnits(effectiveDeptId) || [];
    const allStations = window.store.getDb()?.stations || [];

    const effectiveSecId = sectionId || targetUser.sectionId || '';
    const effectiveUnitId = unitId || targetUser.unitId || '';
    const effectiveStationId = targetUser.stationId || '';
    const initialWorkShift = targetUser.workShift || 'صباحي';
    const initialShiftName = targetUser.assignedShift || targetUser.shift || 'A';
    const initialFieldAscendDate = targetUser.fieldAscendDate || '';
    const initialFieldDescendDate = targetUser.fieldDescendDate || (initialFieldAscendDate ? new Date(Date.parse(initialFieldAscendDate) + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : '');

    // Determine initial mainOrgValue
    let initialMainOrgValue = 'DEPT';
    if (effectiveUnitId) {
      initialMainOrgValue = `UNIT:${effectiveUnitId}`;
    } else if (effectiveSecId) {
      initialMainOrgValue = `SECTION:${effectiveSecId}`;
    }

    // Determine initial subOrg options
    let initialSubOptions = '';
    let initialSubOrgValue = 'HQ';

    if (initialMainOrgValue === 'DEPT') {
      initialSubOptions = `<option value="HQ">🏛️ ادارة القسم</option>`;
    } else if (initialMainOrgValue.startsWith('SECTION:')) {
      const sec = allSections.find(s => s.id === effectiveSecId);
      const secStations = allStations.filter(st => st.sectionId === effectiveSecId);
      initialSubOptions = `
        <option value="HQ" ${!effectiveStationId ? 'selected' : ''}>🏢 ادارة الشعبة</option>
        ${secStations.length > 0 ? `
          <optgroup label="🏭 المحطات التشغيلية التابعة للشعبة">
            ${secStations.map(st => `<option value="STATION:${st.id}" ${(effectiveStationId === st.id) ? 'selected' : ''}>🏭 ${st.name} (${st.code || 'محطة'})</option>`).join('')}
          </optgroup>
        ` : ''}
      `;
      if (effectiveStationId) initialSubOrgValue = `STATION:${effectiveStationId}`;
    } else if (initialMainOrgValue.startsWith('UNIT:')) {
      const unit = allUnits.find(u => u.id === effectiveUnitId);
      const unitStations = allStations.filter(st => st.unitId === effectiveUnitId || (unit?.sectionId && st.sectionId === unit.sectionId));
      initialSubOptions = `
        <option value="HQ" ${!effectiveStationId ? 'selected' : ''}>🏢 ادارة الوحدة</option>
        ${unitStations.length > 0 ? `
          <optgroup label="🏭 المحطات والمواقع التشغيلية المرتبطة">
            ${unitStations.map(st => `<option value="STATION:${st.id}" ${(effectiveStationId === st.id) ? 'selected' : ''}>🏭 ${st.name} (${st.code || 'محطة'})</option>`).join('')}
          </optgroup>
        ` : ''}
      `;
      if (effectiveStationId) initialSubOrgValue = `STATION:${effectiveStationId}`;
    }

    const allDynamicFields = window.store.getDynamicEmployeeFields(effectiveDeptId);
    const sectionFields = (allDynamicFields || []).filter(f => {
      if (f.isActive === false) return false;
      if (f.scope === 'GLOBAL') return true;
      if (f.scope === 'SECTION') {
        return !f.scopeId || f.scopeId === effectiveSecId || f.scopeId === targetUser.sectionId;
      }
      if (f.scope === 'UNIT') {
        return !f.scopeId || f.scopeId === effectiveUnitId || f.scopeId === targetUser.unitId;
      }
      return true;
    });

    let initialRoute = ['وزارة النفط', 'شركة نفط البصرة', 'هيأة تشغيل الرميلة', 'قسم الإنتاج الجنوبي'];
    if (initialMainOrgValue === 'DEPT') {
      initialRoute.push('ادارة القسم');
    } else if (initialMainOrgValue.startsWith('SECTION:')) {
      const sec = allSections.find(s => s.id === effectiveSecId);
      initialRoute.push(sec?.name || 'الشعبة');
      if (effectiveStationId) {
        const st = allStations.find(s => s.id === effectiveStationId);
        if (st) initialRoute.push(st.name);
      } else {
        initialRoute.push('ادارة الشعبة');
      }
    } else if (initialMainOrgValue.startsWith('UNIT:')) {
      const unit = allUnits.find(u => u.id === effectiveUnitId);
      initialRoute.push(unit?.name || 'الوحدة');
      if (effectiveStationId) {
        const st = allStations.find(s => s.id === effectiveStationId);
        if (st) initialRoute.push(st.name);
      } else {
        initialRoute.push('ادارة الوحدة');
      }
    }

    if (initialWorkShift === 'مناوب') {
      const shiftDisplay = initialShiftName ? (initialShiftName.startsWith('نوبة') ? initialShiftName : 'نوبة ' + initialShiftName) : 'نوبة A';
      initialRoute.push(`مناوب (${shiftDisplay})`);
    } else if (initialWorkShift === 'حقلي') {
      if (initialFieldAscendDate) {
        initialRoute.push(`حقلي (صعود: ${initialFieldAscendDate} ← نزول: ${initialFieldDescendDate || 'بعد 14 يوماً'})`);
      } else {
        initialRoute.push(`حقلي (نظام 14 يوم دوام / 14 يوم استراحة)`);
      }
    } else {
      initialRoute.push(`صباحي`);
    }

    this.showModal(`📝 ${entityName}`, `
      <form class="modal-form-container" onsubmit="window.app.handleSectionOrUnitDataEntrySubmit(event, '${targetUser.employeeId || ''}', '${targetUser.id || ''}')">
        <div class="modal-form-body">
          
          ${canAddFields ? `
            <div class="crystal-action-banner" style="background: linear-gradient(135deg, rgba(11, 87, 208, 0.08) 0%, rgba(16, 185, 129, 0.08) 100%); border: 1.5px solid rgba(11, 87, 208, 0.22); padding: 0.9rem 1.2rem; border-radius: 14px; margin-bottom: 1.25rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem; box-shadow: 0 4px 14px rgba(0, 0, 0, 0.03);">
              <div>
                <strong style="color: var(--md-sys-color-primary); font-size: 0.95rem; display: flex; align-items: center; gap: 0.4rem;">
                  <span>➕ طلب معلومة أو حقل إضافي جديد لمنتسبي</span> <span>${entityName}</span>
                </strong>
                <div style="font-size: 0.78rem; color: var(--md-sys-color-outline); margin-top: 3px;">
                  يمكن للإداري ومسؤول الشعبة إضافة معلومة جديدة مطلوبة لتظهر تلقائياً لكافة منتسبي الشعبة لملئها.
                </div>
              </div>
              <button type="button" class="btn btn-glass-primary" onclick="window.app.openCreateDynamicFieldModalFromDataEntry('${effectiveSecId}', '${effectiveUnitId}', '${entityName}')" style="white-space: nowrap; font-weight: 700;">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 5v14M5 12h14"></path>
                </svg>
                <span>إضافة معلومة مطلوبة جديدة</span>
              </button>
            </div>
          ` : ''}

          <!-- Hidden inputs for backward-compatible routing persistence -->
          <input type="hidden" id="deSectionId" value="${effectiveSecId}">
          <input type="hidden" id="deUnitId" value="${effectiveUnitId}">
          <input type="hidden" id="deStationId" value="${effectiveStationId}">

          <!-- 1. Cyber Smart Organizational Routing Matrix (الارتباط الإداري الذكي ونظام المناوبات) -->
          <div class="cyber-org-card">
            <div class="cyber-org-header">
              <h4 class="cyber-org-title">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
                <span>الارتباط الإداري الذكي</span>
              </h4>
              <div class="cyber-pulse-badge">
                <span class="cyber-pulse-dot"></span>
                <span>توجيه وتزامن فوري</span>
              </div>
            </div>

            <!-- Tier 1 (أدارة القسم المركزية) & Tier 2 (ادارة الشعبة المركزية) -->
            <div class="cyber-org-grid" style="margin-bottom: 0.85rem;">
              
              <!-- Tier 1: Primary Organizational Formation -->
              <div class="cyber-field-box">
                <label class="cyber-field-label">
                  <span>🏛️ أدارة القسم المركزية</span>
                  <span style="color: #dc2626; font-weight: 900;">*</span>
                </label>
                <select id="deMainOrgSelect" class="form-control" onchange="window.app.onMainOrgChange(this.value)">
                  <option value="DEPT" ${initialMainOrgValue === 'DEPT' ? 'selected' : ''}>🏛️ ادارة القسم</option>
                  
                  <optgroup label="🛢️ شعب القسم الإدارية والفنية">
                    ${allSections.map(s => `<option value="SECTION:${s.id}" ${initialMainOrgValue === `SECTION:${s.id}` ? 'selected' : ''}>🛢️ شعبة: ${s.name}</option>`).join('')}
                  </optgroup>
                  
                  <optgroup label="⚡ وحدات القسم الإدارية والتشغيلية">
                    ${allUnits.map(u => `<option value="UNIT:${u.id}" ${initialMainOrgValue === `UNIT:${u.id}` ? 'selected' : ''}>⚡ وحدة: ${u.name}</option>`).join('')}
                  </optgroup>
                </select>
                <span class="cyber-field-hint">اختر إدارة القسم أو الشعبة أو الوحدة التابع لها المنتسب</span>
              </div>

              <!-- Tier 2: Internal Formation Distribution (ادارة الشعبة المركزية) -->
              <div class="cyber-field-box">
                <label class="cyber-field-label">
                  <span>🏢 ادارة الشعبة المركزية</span>
                  <span style="color: #dc2626; font-weight: 900;">*</span>
                </label>
                <select id="deSubOrgSelect" class="form-control" onchange="window.app.onSubOrgChange(this.value)">
                  ${initialSubOptions}
                </select>
                <span class="cyber-field-hint">تحديد المقر الإداري للتشكيل أو المحطة الميدانية المحددة</span>
              </div>

            </div>

            <!-- Tier 3: Shift Allocation (نوع الدوام واسم النوبة أو التواريخ الحقلية) -->
            <div class="cyber-org-grid" style="margin-bottom: 0.85rem;">
              
              <div class="cyber-field-box">
                <label class="cyber-field-label">
                  <span>⏱️ نوع ونظام الدوام</span>
                  <span style="color: #dc2626; font-weight: 900;">*</span>
                </label>
                <select id="deWorkShift" class="form-control" onchange="window.app.toggleWorkShiftSelection(this.value)">
                  <option value="صباحي" ${initialWorkShift === 'صباحي' ? 'selected' : ''}>☀️ دوام صباحي (اعتيادي)</option>
                  <option value="مناوب" ${initialWorkShift === 'مناوب' ? 'selected' : ''}>🔄 دوام مناوبة (خفر 4 نوبات)</option>
                  <option value="حقلي" ${initialWorkShift === 'حقلي' ? 'selected' : ''}>🏕️ دوام حقلي (14 يوم دوام / 14 يوم استراحة)</option>
                </select>
                <span class="cyber-field-hint">تحديد نظام الدوام الرسمي الصباحي أو الخفر أو الحقلي</span>
              </div>

              <!-- Shift Selection for مناوب -->
              <div id="deShiftNameBox" class="cyber-field-box cyber-field-box-highlight ${initialWorkShift === 'مناوب' ? 'cyber-shift-box-anim' : ''}" style="display: ${initialWorkShift === 'مناوب' ? 'block' : 'none'};">
                <label class="cyber-field-label">
                  <span>اسم النوبة التشغيلية</span>
                  <span class="badge badge-primary" style="font-size: 0.7rem; padding: 1px 6px;">توزيع الكادر</span>
                </label>
                <select id="deShiftName" class="form-control" onchange="window.app.updateOrgRoutePreview()" ${initialWorkShift === 'مناوب' ? '' : 'disabled'}>
                  <option value="A" ${['A', 'نوبة A', 'نوبة A (الشفت الأول)'].includes(initialShiftName) ? 'selected' : ''}>نوبة A (الشفت الأول)</option>
                  <option value="B" ${['B', 'نوبة B', 'نوبة B (الشفت الثاني)'].includes(initialShiftName) ? 'selected' : ''}>نوبة B (الشفت الثاني)</option>
                  <option value="C" ${['C', 'نوبة C', 'نوبة C (الشفت الثالث)'].includes(initialShiftName) ? 'selected' : ''}>نوبة C (الشفت الثالث)</option>
                  <option value="D" ${['D', 'نوبة D', 'نوبة D (الشفت الرابع)'].includes(initialShiftName) ? 'selected' : ''}>نوبة D (الشفت الرابع)</option>
                </select>
                <span class="cyber-field-hint">تحديد النوبة التشغيلية المعتمدة للمنتسب في المحطة.</span>
              </div>

              <!-- Field Dates for حقلي (تاريخ الصعود والنزول) -->
              <div id="deFieldShiftDatesBox" class="cyber-field-box cyber-field-box-highlight ${initialWorkShift === 'حقلي' ? 'cyber-shift-box-anim' : ''}" style="display: ${initialWorkShift === 'حقلي' ? 'block' : 'none'};">
                <label class="cyber-field-label">
                  <span>🏕️ جدول الدوام الحقلي (14 يوم دوام / 14 يوم استراحة)</span>
                  <span class="badge badge-success" style="font-size: 0.7rem; padding: 1px 6px;">دورة 14/14</span>
                </label>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.6rem; margin-top: 0.25rem;">
                  <div>
                    <span style="font-size: 0.76rem; font-weight: 700; color: #0b57d0; display: block; margin-bottom: 3px;">📅 تاريخ الصعود (بدء الدوام):</span>
                    <input type="date" id="deFieldAscendDate" class="form-control" value="${initialFieldAscendDate}" onchange="window.app.onFieldAscendDateChange(this.value)">
                  </div>
                  <div>
                    <span style="font-size: 0.76rem; font-weight: 700; color: #059669; display: block; margin-bottom: 3px;">🏖️ تاريخ النزول (بدء الاستراحة):</span>
                    <input type="date" id="deFieldDescendDate" class="form-control" value="${initialFieldDescendDate}" onchange="window.app.updateOrgRoutePreview()">
                  </div>
                </div>
                <span class="cyber-field-hint" id="deFieldRotationStatusText">يتم احتساب تاريخ النزول تلقائياً بعد 14 يوماً من تاريخ الصعود.</span>
              </div>

            </div>

            <!-- Live Route Breadcrumb Preview -->
            <div class="cyber-route-preview">
              <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
                <span style="font-weight: 800; color: #1e40af; display: flex; align-items: center; gap: 0.25rem;">
                  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon>
                  </svg>
                  المسار التنظيمي والتشغيلي المعتمد:
                </span>
                <span id="deRoutePathPreview" class="cyber-route-path">${initialRoute.join(' <span class="cyber-route-arrow">←</span> ')}</span>
              </div>
              <span class="badge badge-success" style="font-size: 0.72rem; padding: 3px 8px; font-weight: 800;">تزامن فوري ⚡</span>
            </div>
          </div>

          <h5 style="color: var(--md-sys-color-primary); font-weight: 800; border-bottom: 1px solid var(--md-sys-color-surface-variant); padding-bottom: 0.4rem; margin-bottom: 1rem;">
            📌 المعلومات والبيانات الشخصية
          </h5>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
            <div class="form-group">
              <label class="form-label">الاسم الرباعي واللقب</label>
              <input type="text" id="deFullName" class="form-control" value="${targetUser.fullName || ''}" required>
            </div>
            <div class="form-group">
              <label class="form-label">اسم الأم الثلاثي</label>
              <input type="text" id="deMotherName" class="form-control" value="${targetUser.motherName || ''}" placeholder="اسم الأم الثلاثي" required>
            </div>
            <div class="form-group">
              <label class="form-label">اسم الأب والجد</label>
              <input type="text" id="deFatherName" class="form-control" value="${targetUser.fatherName || ''}" placeholder="اسم الأب والجد">
            </div>
            <div class="form-group">
              <label class="form-label">الرقم الوظيفي</label>
              <input type="text" id="deEmpId" class="form-control" value="${targetUser.employeeId || ''}" readonly style="background: var(--md-sys-color-surface-variant);">
            </div>
            <div class="form-group">
              <label class="form-label">رقم الهاتف</label>
              <input type="text" id="dePhone" class="form-control" value="${targetUser.phone || ''}" required>
            </div>
            <div class="form-group">
              <label class="form-label">البريد الإلكتروني</label>
              <input type="email" id="deEmail" class="form-control" value="${targetUser.email || ''}" required>
            </div>
          </div>

          <h5 style="color: var(--md-sys-color-primary); font-weight: 800; border-bottom: 1px solid var(--md-sys-color-surface-variant); padding-bottom: 0.4rem; margin: 1.25rem 0 1rem;">
            📜 الوثائق والمستمسكات الرسمية
          </h5>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; align-items: start;">
            <div class="form-group">
              <label class="form-label">رقم البطاقة الوطنية الموحدة (12 رقماً)</label>
              <input type="text" id="deUnifiedCard" class="form-control" value="${targetUser.unifiedCardNumber || ''}" placeholder="199012345678" required>
            </div>
            <div class="form-group">
              <label class="form-label">رقم جواز السفر</label>
              <input type="text" id="dePassport" class="form-control" value="${targetUser.passportNumber || ''}" placeholder="A1234567">
            </div>
            <div class="form-group">
              <label class="form-label">رقم بطاقة السكن</label>
              <input type="text" id="deResidenceCard" class="form-control" value="${targetUser.residenceCardNumber || ''}" placeholder="رقم بطاقة السكن">
            </div>
            <div class="form-group">
              <label class="form-label">رقم البطاقة التموينية</label>
              <input type="text" id="deRationCard" class="form-control" value="${targetUser.rationCardNumber || ''}" placeholder="رقم البطاقة التموينية">
            </div>
            <div class="form-group">
              <label class="form-label">رقم جواز السلامة والبيئة (HSE)</label>
              <input type="text" id="deSafetyPassport" class="form-control" value="${targetUser.safetyPassportNumber || ''}" placeholder="SAF-001">
            </div>
            <div class="form-group">
              <label class="form-label">فصيلة الدم</label>
              <select id="deBloodType" class="form-control">
                <option value="">-- غير محدد --</option>
                ${['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bt => `<option value="${bt}" ${targetUser.bloodType === bt ? 'selected' : ''}>${bt}</option>`).join('')}
              </select>
            </div>
          </div>

          <h5 style="color: var(--md-sys-color-primary); font-weight: 800; border-bottom: 1px solid var(--md-sys-color-surface-variant); padding-bottom: 0.4rem; margin: 1.25rem 0 1rem;">
            🎓 المؤهلات العلمية والتدرج الوظيفي
          </h5>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
            <div class="form-group">
              <label class="form-label">الشهادة الدراسية</label>
              <select id="deDegree" class="form-control">
                <option value="دكتوراه" ${targetUser.degree === 'دكتوراه' ? 'selected' : ''}>دكتوراه</option>
                <option value="ماجستير" ${targetUser.degree === 'ماجستير' ? 'selected' : ''}>ماجستير</option>
                <option value="دبلوم عالي" ${targetUser.degree === 'دبلوم عالي' ? 'selected' : ''}>دبلوم عالي</option>
                <option value="بكالوريوس" ${targetUser.degree === 'بكالوريوس' ? 'selected' : ''}>بكالوريوس</option>
                <option value="دبلوم تقني" ${targetUser.degree === 'دبلوم تقني' ? 'selected' : ''}>دبلوم تقني</option>
                <option value="إعدادية" ${targetUser.degree === 'إعدادية' ? 'selected' : ''}>إعدادية</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">التخصص العلمي / المهني</label>
              <input type="text" id="deSpecialization" class="form-control" value="${targetUser.specialization || ''}" placeholder="هندسة ميكانيك / نفط / تشغيل">
            </div>
            <div class="form-group">
              <label class="form-label">الجامعة / الكلية / المعهد</label>
              <input type="text" id="deUniversity" class="form-control" value="${targetUser.university || ''}" placeholder="جامعة البصرة">
            </div>
            <div class="form-group">
              <label class="form-label">سنة التخرج</label>
              <input type="text" id="deGradYear" class="form-control" value="${targetUser.graduationYear || ''}" placeholder="2010">
            </div>
            <div class="form-group">
              <label class="form-label">العنوان الوظيفي (التدرج القانوني)</label>
              <input type="text" id="deJobTitle" class="form-control" value="${targetUser.jobTitle || targetUser.careerTitle || ''}" placeholder="معاون مهندس / مهندس / فني / رئيس مهندسين..." required>
            </div>
            <div class="form-group">
              <label class="form-label">الدرجة الوظيفية</label>
              <select id="deJobGrade" class="form-control">
                <option value="الأولى" ${targetUser.jobGrade === 'الأولى' ? 'selected' : ''}>الدرجة الأولى</option>
                <option value="الثانية" ${targetUser.jobGrade === 'الثانية' ? 'selected' : ''}>الدرجة الثانية</option>
                <option value="الثالثة" ${targetUser.jobGrade === 'الثالثة' ? 'selected' : ''}>الدرجة الثالثة</option>
                <option value="الرابعة" ${targetUser.jobGrade === 'الرابعة' ? 'selected' : ''}>الدرجة الرابعة</option>
                <option value="الخامسة" ${targetUser.jobGrade === 'الخامسة' ? 'selected' : ''}>الدرجة الخامسة</option>
                <option value="السادسة" ${targetUser.jobGrade === 'السادسة' ? 'selected' : ''}>الدرجة السادسة</option>
                <option value="السابعة" ${targetUser.jobGrade === 'السابعة' ? 'selected' : ''}>الدرجة السابعة</option>
                <option value="الثامنة" ${targetUser.jobGrade === 'الثامنة' ? 'selected' : ''}>الدرجة الثامنة</option>
                <option value="التاسعة" ${targetUser.jobGrade === 'التاسعة' ? 'selected' : ''}>الدرجة التاسعة</option>
                <option value="العاشرة" ${targetUser.jobGrade === 'العاشرة' ? 'selected' : ''}>الدرجة العاشرة</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">المرحلة</label>
              <input type="text" id="deJobStage" class="form-control" value="${targetUser.jobStage || 'الأولى'}" placeholder="الأولى / الثانية...">
            </div>
            <div class="form-group">
              <label class="form-label">تاريخ التعيين الرسمي</label>
              <input type="date" id="deHireDate" class="form-control" value="${targetUser.hireDate || ''}">
            </div>
            <div class="form-group">
              <label class="form-label">تاريخ المباشرة بالقسم</label>
              <input type="date" id="deDeptJoinDate" class="form-control" value="${targetUser.deptJoinDate || ''}">
            </div>
          </div>

          <!-- Section for Custom / Dynamic Fields Requested by Administration -->
          <h5 style="color: var(--md-sys-color-primary); font-weight: 800; border-bottom: 1px solid var(--md-sys-color-surface-variant); padding-bottom: 0.4rem; margin: 1.25rem 0 1rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem;">
            <span>🧩 معلومات وحقول إضافية مطلوبة من الإدارة (${sectionFields.length})</span>
            ${canAddFields ? `
              <button type="button" class="btn btn-sm btn-outline" style="font-size: 0.75rem; padding: 2px 8px;" onclick="window.app.openCreateDynamicFieldModalFromDataEntry('${effectiveSecId}', '${effectiveUnitId}', '${entityName}')">
                + إضافة معلومة جديدة
              </button>
            ` : ''}
          </h5>

          ${sectionFields.length === 0 ? `
            <div style="padding: 0.85rem 1rem; background: var(--md-sys-color-surface-variant); border-radius: var(--radius-sm); text-align: center; color: var(--md-sys-color-outline); font-size: 0.84rem; margin-bottom: 1rem;">
              لا توجد حقول إضافية مطلوبة حالياً. ${canAddFields ? 'يمكنك كمسؤول إضافة معلومة جديدة عبر الزر أعلاه لتظهر لجميع المنتسبين.' : ''}
            </div>
          ` : `
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-bottom: 1rem;">
              ${sectionFields.map(f => {
                const curVal = (targetUser.dynamicValues && targetUser.dynamicValues[f.key] !== undefined) 
                  ? targetUser.dynamicValues[f.key] 
                  : ((targetUser.customFields && targetUser.customFields[f.key] !== undefined) 
                    ? targetUser.customFields[f.key] 
                    : (targetUser[f.key] || ''));
                
                const isTextarea = f.type === 'textarea';
                return `
                  <div class="form-group" style="${isTextarea ? 'grid-column: 1 / -1;' : ''}">
                    <label class="form-label" style="display: flex; justify-content: space-between; align-items: center;">
                      <span>${f.name} ${f.isRequired ? '<span style="color:#d93025; font-weight: bold;">*</span>' : ''}</span>
                      <span style="font-size: 0.7rem; color: var(--md-sys-color-outline); background: rgba(0,0,0,0.05); padding: 1px 6px; border-radius: 4px;">
                        ${f.scope === 'GLOBAL' ? '🌐 عام' : '🏢 الشعبة'}
                      </span>
                    </label>
                    ${f.type === 'textarea' ? `
                      <textarea class="form-control de-dynamic-input" data-key="${f.key}" data-type="${f.type}" placeholder="أدخل ${f.name}..." ${f.isRequired ? 'required' : ''} rows="2">${curVal}</textarea>
                    ` : f.type === 'select' ? `
                      <select class="form-control de-dynamic-input" data-key="${f.key}" data-type="${f.type}" ${f.isRequired ? 'required' : ''}>
                        <option value="">-- اختر --</option>
                        ${(f.options || []).map(opt => `<option value="${opt}" ${curVal === opt ? 'selected' : ''}>${opt}</option>`).join('')}
                      </select>
                    ` : f.type === 'date' ? `
                      <input type="date" class="form-control de-dynamic-input" data-key="${f.key}" data-type="${f.type}" value="${curVal}" ${f.isRequired ? 'required' : ''} />
                    ` : f.type === 'number' ? `
                      <input type="number" class="form-control de-dynamic-input" data-key="${f.key}" data-type="${f.type}" value="${curVal}" placeholder="أدخل ${f.name}..." ${f.isRequired ? 'required' : ''} />
                    ` : `
                      <input type="text" class="form-control de-dynamic-input" data-key="${f.key}" data-type="${f.type}" value="${curVal}" placeholder="أدخل ${f.name}..." ${f.isRequired ? 'required' : ''} />
                    `}
                  </div>
                `;
              }).join('')}
            </div>
          `}
        </div>

        <div class="modal-form-sticky-footer">
          <button type="button" class="btn btn-outline" onclick="window.app.closeModal()" style="font-weight: 700; padding: 0.6rem 1.4rem; border-radius: 10px;">
            إلغاء
          </button>
          <button type="submit" class="btn btn-save-prominent">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
              <polyline points="17 21 17 13 7 13 7 21"></polyline>
              <polyline points="7 3 7 8 15 8"></polyline>
            </svg>
            <span>💾 حفظ وتثبيت كافة البيانات في المنظومة</span>
          </button>
        </div>
      </form>
    `, { size: 'xl', maxWidth: '1150px' });
  }

  openCreateDynamicFieldModalFromDataEntry(sectionId, unitId, entityName) {
    this.showModal(`➕ إضافة معلومة جديدة مطلوبة لمنتسبي ${entityName}`, `
      <form onsubmit="window.app.handleSaveCreateDynamicFieldFromDataEntry(event, '${sectionId || ''}', '${unitId || ''}', '${entityName}')">
        <div class="form-group">
          <label class="form-label">اسم المعلومة / الحقل المطلوب بالعربية:</label>
          <input type="text" id="dfNameQuick" class="form-control" placeholder="مثال: فصيلة الدم، العنوان السكني المحدث، رقم إجازة السوق، دورة السلامة..." required>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
          <div class="form-group">
            <label class="form-label">نوع الإدخال:</label>
            <select id="dfTypeQuick" class="form-control" onchange="window.app.onQuickFieldTypeChange(this.value)">
              <option value="text">نص عادي</option>
              <option value="number">رقم عددي</option>
              <option value="date">تاريخ</option>
              <option value="select">قائمة خيارات منسدلة</option>
              <option value="textarea">نص تفصيلي متعدد الأسطر</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">نطاق تطبيق المعلومة:</label>
            <select id="dfScopeQuick" class="form-control">
              <option value="SECTION" selected>🏢 خاص بمنتسبي ${entityName}</option>
              <option value="GLOBAL">🌐 شامل لكافة موظفي القسم والشعب</option>
            </select>
          </div>
        </div>

        <div id="dfOptionsContainerQuick" class="form-group" style="display: none;">
          <label class="form-label">خيارات القائمة (مفصولة بفارزة ,):</label>
          <input type="text" id="dfOptionsInputQuick" class="form-control" placeholder="مثال: A+, A-, B+, B-, O+, O-, AB+, AB-">
        </div>

        <div class="form-group" style="margin-top: 0.75rem;">
          <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer; font-size: 0.85rem;">
            <input type="checkbox" id="dfRequiredQuick" style="width: 16px; height: 16px;">
            <strong>إلزام كافة المنتسبين بملء هذه المعلومة (حقل إجباري)</strong>
          </label>
        </div>

        <div style="margin-top: 1.25rem; display: flex; justify-content: flex-end; gap: 0.5rem;">
          <button type="button" class="btn btn-outline" onclick="window.app.returnToDataEntryModal('${sectionId || ''}', '${unitId || ''}', '${entityName}')">رجوع</button>
          <button type="submit" class="btn btn-glass-primary" style="font-weight: 800;">
            💾 حفظ وإضافة الحقل فوراً
          </button>
        </div>
      </form>
    `, { size: 'lg', maxWidth: '850px' });
  }

  onQuickFieldTypeChange(type) {
    const optBox = document.getElementById('dfOptionsContainerQuick');
    if (optBox) {
      optBox.style.display = type === 'select' ? 'block' : 'none';
    }
  }

  handleSaveCreateDynamicFieldFromDataEntry(e, sectionId, unitId, entityName) {
    e.preventDefault();
    const actorUser = window.auth.getCurrentUser();
    const name = document.getElementById('dfNameQuick')?.value.trim();
    if (!name) return;

    const type = document.getElementById('dfTypeQuick')?.value || 'text';
    const scope = document.getElementById('dfScopeQuick')?.value || 'SECTION';
    const isRequired = !!document.getElementById('dfRequiredQuick')?.checked;
    const rawOptions = document.getElementById('dfOptionsInputQuick')?.value || '';
    const options = rawOptions.split(',').map(s => s.trim()).filter(Boolean);

    const key = 'custom_' + Date.now();

    const res = window.store.addDynamicEmployeeField({
      name,
      key,
      type,
      scope,
      scopeId: scope === 'SECTION' ? sectionId : null,
      category: 'section_custom',
      isRequired,
      options
    }, actorUser);

    if (res.success) {
      alert(`✅ تمت إضافة المعلومة المطلوبة [${name}] بنجاح، وأصبحت متاحة فوراً لجميع منتسبي ${entityName} لملئها.`);
      const user = window.auth.getCurrentUser();
      this.showDataEntryModal(entityName, sectionId, unitId, user);
    } else {
      alert('خطأ: ' + res.error);
    }
  }

  returnToDataEntryModal(sectionId, unitId, entityName) {
    const user = window.auth.getCurrentUser();
    this.showDataEntryModal(entityName, sectionId, unitId, user);
  }

  handleSectionOrUnitDataEntrySubmit(e, targetEmpId, targetUserId) {
    e.preventDefault();
    const actorUser = window.auth.getCurrentUser() || {};
    
    // Find target employee / user
    const empIdToUpdate = targetEmpId || document.getElementById('deEmpId')?.value || actorUser.employeeId;
    let targetUser = (empIdToUpdate ? window.store.getUserByEmployeeId(empIdToUpdate) : null) || (targetUserId ? window.store.getUserById(targetUserId) : null) || actorUser;

    // Collect dynamic values
    const dynamicValues = { ...(targetUser.dynamicValues || {}), ...(targetUser.customFields || {}) };
    const dynamicInputs = document.querySelectorAll('.de-dynamic-input');
    dynamicInputs.forEach(input => {
      const key = input.getAttribute('data-key');
      if (key) {
        dynamicValues[key] = input.value;
      }
    });

    const workShift = document.getElementById('deWorkShift')?.value || 'صباحي';
    const assignedShift = (workShift === 'مناوب') ? (document.getElementById('deShiftName')?.value || 'A') : (workShift === 'حقلي' ? 'حقلي' : null);
    const fieldAscendDate = (workShift === 'حقلي') ? (document.getElementById('deFieldAscendDate')?.value || null) : null;
    const fieldDescendDate = (workShift === 'حقلي') ? (document.getElementById('deFieldDescendDate')?.value || null) : null;
    
    let selSectionId = document.getElementById('deSectionId')?.value || null;
    let selUnitId = document.getElementById('deUnitId')?.value || null;
    let selStationId = document.getElementById('deStationId')?.value || null;

    const mainSelect = document.getElementById('deMainOrgSelect');
    const subSelect = document.getElementById('deSubOrgSelect');
    if (mainSelect) {
      const mainVal = mainSelect.value;
      if (!mainVal || mainVal === 'DEPT') {
        selSectionId = null;
        selUnitId = null;
      } else if (mainVal.startsWith('SECTION:')) {
        selSectionId = mainVal.replace('SECTION:', '');
        selUnitId = null;
      } else if (mainVal.startsWith('UNIT:')) {
        selUnitId = mainVal.replace('UNIT:', '');
        const uObj = window.store.getUnitById(selUnitId);
        selSectionId = uObj?.sectionId || null;
      }
    }
    if (subSelect) {
      const subVal = subSelect.value;
      if (subVal && subVal.startsWith('STATION:')) {
        selStationId = subVal.replace('STATION:', '');
      } else {
        selStationId = null;
      }
    }

    const updates = {
      fullName: document.getElementById('deFullName')?.value || targetUser.fullName,
      motherName: document.getElementById('deMotherName')?.value || '',
      fatherName: document.getElementById('deFatherName')?.value || '',
      phone: document.getElementById('dePhone')?.value || '',
      email: document.getElementById('deEmail')?.value || targetUser.email,
      unifiedCardNumber: document.getElementById('deUnifiedCard')?.value || '',
      passportNumber: document.getElementById('dePassport')?.value || '',
      residenceCardNumber: document.getElementById('deResidenceCard')?.value || '',
      rationCardNumber: document.getElementById('deRationCard')?.value || '',
      safetyPassportNumber: document.getElementById('deSafetyPassport')?.value || '',
      bloodType: document.getElementById('deBloodType')?.value || targetUser.bloodType || '',
      workShift: workShift,
      assignedShift: assignedShift,
      shift: assignedShift,
      fieldAscendDate: fieldAscendDate,
      fieldDescendDate: fieldDescendDate,
      sectionId: selSectionId,
      unitId: selUnitId,
      stationId: selStationId,
      jobTitle: document.getElementById('deJobTitle')?.value.trim() || targetUser.jobTitle || targetUser.careerTitle || 'موظف',
      careerTitle: document.getElementById('deJobTitle')?.value.trim() || targetUser.careerTitle || targetUser.jobTitle || 'موظف',
      degree: document.getElementById('deDegree')?.value || 'بكالوريوس',
      specialization: document.getElementById('deSpecialization')?.value || '',
      university: document.getElementById('deUniversity')?.value || '',
      graduationYear: document.getElementById('deGradYear')?.value || '',
      jobGrade: document.getElementById('deJobGrade')?.value || 'الخامسة',
      jobStage: document.getElementById('deJobStage')?.value || 'الأولى',
      hireDate: document.getElementById('deHireDate')?.value || '',
      deptJoinDate: document.getElementById('deDeptJoinDate')?.value || '',
      dynamicValues: dynamicValues,
      customFields: dynamicValues,
      profileCompleted: true
    };

    if (targetUser && targetUser.id) {
      window.store.updateUser(targetUser.id, updates);
    }
    if (empIdToUpdate) {
      window.store.addOrUpdateEmployeeMasterRecord({
        employeeId: empIdToUpdate,
        ...updates
      }, actorUser);
    }

    if (actorUser.id === targetUser?.id || actorUser.employeeId === empIdToUpdate) {
      Object.assign(actorUser, updates);
      window.auth.saveSession(actorUser);
    }

    let destinationLabel = 'إدارة القسم المركزية';
    if (selSectionId) {
      const secObj = window.store.getSectionById(selSectionId);
      destinationLabel = secObj ? `شعبة ${secObj.name}` : 'الشعبة';
    } else if (selUnitId) {
      const unitObj = window.store.getUnitById(selUnitId);
      destinationLabel = unitObj ? `وحدة ${unitObj.name}` : 'الوحدة';
    }
    if (selStationId) {
      const stObj = (window.store.getDb()?.stations || []).find(s => s.id === selStationId);
      if (stObj) destinationLabel += ` / ${stObj.name}`;
    }

    window.store.logActivity(
      actorUser.departmentId || 'dept-south-prod',
      actorUser.id,
      actorUser.employeeId,
      'UPDATE_HR_DATA',
      'EMPLOYEE_PROFILE',
      `تم تحديث وتثبيت البيانات الرسمية للمنتسب [${updates.fullName}] وتوجيهه إلى [${destinationLabel}]`
    );
    
    // Add request record for transparency
    window.store.addRequest({
      id: 'REQ-' + Date.now(),
      typeId: 'reqType-01',
      typeTitle: 'استمارة تحديث وتثبيت بيانات الموظف الموحدة',
      userId: targetUser?.id || actorUser.id,
      userName: updates.fullName,
      userEmployeeId: empIdToUpdate,
      departmentId: actorUser.departmentId || 'dept-south-prod',
      payload: updates,
      status: 'APPROVED',
      createdAt: new Date().toISOString()
    });

    alert(`✅ تم حفظ وتثبيت كافة بيانات المنتسب بنجاح! وتم توجيه السجل تلقائياً إلى (${destinationLabel}) وكافة الواجهات والجداول المرتبطة بها.`);
    this.closeModal();
    this.render();
  }

  // --- User Management & Granular RBAC Handlers ---
  setUserManagementSubTab(tabName) {
    this.currentUserManagementSubTab = tabName;
    this.render();
  }

  filterRBACAuditLogs() {
    const query = (document.getElementById('rbacAuditSearchInput')?.value || '').toLowerCase().trim();
    const rows = document.querySelectorAll('#rbacAuditLogsTable tbody tr');
    rows.forEach(row => {
      if (row.classList.contains('no-results-row')) return;
      const text = row.textContent.toLowerCase();
      row.style.display = text.includes(query) ? '' : 'none';
    });
  }

  exportRBACAuditLogs() {
    const actorUser = window.auth ? window.auth.getCurrentUser() : null;
    const deptId = actorUser ? actorUser.departmentId : null;
    const logs = window.store.getAuditLogs(deptId);
    if (!logs || logs.length === 0) {
      alert('لا توجد سجلات تدقيق لتصديرها.');
      return;
    }
    const headers = ['الوقت والتاريخ', 'الرقم الوظيفي', 'نوع العملية', 'الجهة / القسم', 'التفاصيل', 'النتيجة'];
    const rows = logs.map(l => [
      new Date(l.timestamp).toLocaleString('en-GB'),
      l.employeeId || l.userId || '-',
      l.action || '-',
      l.entity || 'نظام المستخدمين',
      (l.details || '').replace(/,/g, ' - '),
      l.result || 'SUCCESS'
    ]);
    if (window.exportToCSV) {
      window.exportToCSV('سجل_التدقيق_الأمني_والانتقالات.csv', headers, rows);
    } else {
      let csvContent = '\uFEFF' + headers.join(',') + '\n' + rows.map(r => r.map(cell => `"${(cell || '').toString().replace(/"/g, '""')}"`).join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'سجل_التدقيق_الأمني_والانتقالات.csv';
      a.click();
      URL.revokeObjectURL(url);
    }
  }

  openEditUserRoleAndPermissionsModal(userId, empId) {
    const actorUser = window.auth.getCurrentUser();
    let targetUser = null;
    if (userId) {
      targetUser = window.store.getUserById(userId);
    }
    if (!targetUser && empId) {
      targetUser = window.store.getUserByEmployeeId(empId);
      if (!targetUser) {
        // Auto-provision user account from Master Record if not exists yet
        const master = window.store.getEmployeeMasterRecordByEmployeeId(empId);
        if (master) {
          targetUser = {
            id: 'user-' + Date.now(),
            departmentId: master.departmentId || actorUser.departmentId,
            email: master.emailPersonal || `${master.employeeId.toLowerCase()}@rumaila.iq`,
            password: 'password123',
            employeeId: master.employeeId,
            fullName: master.fullName,
            jobTitle: master.jobTitle || 'موظف تشغيل',
            phone: master.phone || '',
            role: 'EMPLOYEE',
            status: 'ACTIVE',
            profileCompleted: true,
            sectionId: master.sectionId || null,
            unitId: master.unitId || null,
            stationId: master.stationId || null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          window.store.addUser(targetUser);
        }
      }
    }

    if (!targetUser) {
      alert('المستخدم غير موجود.');
      return;
    }

    if (!window.rbac.canManageTargetUser(actorUser, targetUser)) {
      alert('⛔ غير مصرح لك بتعديل صلاحيات هذا المستخدم (تجاوز مستوى المسؤولية).');
      return;
    }

    const sections = window.store.getSections(actorUser.departmentId);
    const units = window.store.getUnits(actorUser.departmentId);
    const stations = window.store.getStations(actorUser.departmentId);
    const groups = window.rbac.getPermissionGroups();
    const targetPerms = Array.isArray(targetUser.customPermissions) ? targetUser.customPermissions : [];

    const availableRoles = [
      { key: 'DEPT_MANAGER', name: 'مدير القسم' },
      { key: 'DEPUTY_DEPT_MANAGER', name: 'وكيل مدير قسم' },
      { key: 'ADMIN_MANAGER', name: 'مدير إدارة' },
      { key: 'SECTION_MANAGER', name: 'مسؤول الشعبة' },
      { key: 'DEPUTY_SECTION_MANAGER', name: 'وكيل مسؤول شعبة' },
      { key: 'UNIT_MANAGER', name: 'مسؤول الوحدة' },
      { key: 'STATION_MANAGER', name: 'مسؤول الموقع / المحطة' },
      { key: 'DEPUTY_STATION_MANAGER', name: 'وكيل مسؤول موقع' },
      { key: 'STATION_SUPERVISOR', name: 'مشرف محطة' },
      { key: 'ADMINISTRATOR', name: 'إداري مخول' },
      { key: 'SHIFT_ENGINEER', name: 'مهندس مناوب' },
      { key: 'SHIFT_SUPERVISOR', name: 'مشرف نوبة' },
{ key: 'OPERATOR', name: 'مشغل' },
      { key: 'EMPLOYEE', name: 'منتسب' }
    ].filter(r => window.rbac.canGrantRole(actorUser, r.key));

    this.showModal(`🛡️ تعديل الدور والصلاحيات - ${targetUser.fullName}`, `
      <form class="modal-form-container" onsubmit="window.app.handleSaveUserRoleAndPermissions(event, '${targetUser.id}')">
        <div class="modal-form-body" style="padding: 0.5rem 0.25rem;">
          
          <!-- User Summary Banner (Ultra-Modern Soft Neon Frosted Glass Header) -->
          <div class="crystal-action-banner" style="background: linear-gradient(135deg, rgba(8, 28, 62, 0.92) 0%, rgba(12, 45, 88, 0.85) 50%, rgba(5, 20, 48, 0.92) 100%); border: 1.5px solid rgba(0, 223, 216, 0.4); padding: 1.35rem 1.6rem; border-radius: 18px; margin-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1.25rem; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.45), 0 0 25px rgba(0, 223, 216, 0.12), inset 0 1px 1px rgba(255, 255, 255, 0.18); backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px);">
            <div style="display: flex; align-items: center; gap: 1.2rem;">
              <div style="width: 58px; height: 58px; min-width: 58px; border-radius: 50%; background: linear-gradient(135deg, #00dfd8 0%, #0284c7 100%); color: #041e24; display: flex; align-items: center; justify-content: center; font-size: 1.65rem; font-weight: 900; box-shadow: 0 4px 20px rgba(0, 223, 216, 0.45), 0 0 0 3px rgba(0, 223, 216, 0.25); border: 2.5px solid #ffffff;">
                👤
              </div>
              <div>
                <div style="font-size: 1.35rem; color: #ffffff; font-weight: 900; letter-spacing: -0.3px; text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5); line-height: 1.3; margin-bottom: 0.4rem;">
                  ${targetUser.fullName}
                </div>
                <div style="display: flex; gap: 0.65rem; align-items: center; flex-wrap: wrap; font-size: 0.86rem;">
                  <span style="display: inline-flex; align-items: center; gap: 0.45rem; background: rgba(255, 255, 255, 0.07); padding: 4px 12px; border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.14);">
                    <span style="color: #38bdf8; font-size: 0.95rem;">📧</span>
                    <span style="color: #f1f5f9; font-weight: 600;">${targetUser.email}</span>
                  </span>
                  <span style="display: inline-flex; align-items: center; gap: 0.45rem; background: rgba(0, 223, 216, 0.12); padding: 4px 12px; border-radius: 8px; border: 1px solid rgba(0, 223, 216, 0.35);">
                    <span style="color: #94a3b8; font-weight: 700;">الرقم الوظيفي:</span>
                    <code style="color: #00dfd8; font-weight: 900; font-family: monospace; font-size: 0.92rem; letter-spacing: 0.5px;">${targetUser.employeeId}</code>
                  </span>
                </div>
              </div>
            </div>
            <div style="display: flex; align-items: center; gap: 0.6rem;">
              <span class="neon-pill-role" style="font-size: 0.94rem; padding: 0.55rem 1.4rem; font-weight: 800; border-radius: 9999px; background: linear-gradient(135deg, rgba(0, 223, 216, 0.22) 0%, rgba(14, 165, 233, 0.14) 100%); color: #ffffff; border: 1.5px solid rgba(0, 223, 216, 0.7); box-shadow: 0 4px 18px rgba(0, 0, 0, 0.3), 0 0 14px rgba(0, 223, 216, 0.35), inset 0 1px 1px rgba(255, 255, 255, 0.45); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); display: inline-flex; align-items: center; gap: 0.55rem; text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5); letter-spacing: 0.2px;">
                <span style="color: #00dfd8; font-size: 1.1rem; filter: drop-shadow(0 0 6px rgba(0, 223, 216, 0.7));">🎭</span>
                <span style="color: #94a3b8; font-size: 0.86rem; font-weight: 700;">الدور الحالي:</span>
                <strong style="color: #ffffff; font-weight: 900; text-shadow: 0 0 10px rgba(0, 223, 216, 0.5);">${window.rbac.getRoleInfo(targetUser.role).name}</strong>
              </span>
            </div>
          </div>

          <!-- Section 1: Role Selection -->
          <div style="background: var(--md-sys-color-surface, rgba(15, 27, 56, 0.8)); border: 1.5px solid var(--md-sys-color-outline-variant, rgba(255, 255, 255, 0.12)); border-radius: 16px; padding: 1.35rem; margin-bottom: 1.35rem; box-shadow: 0 4px 16px rgba(0,0,0,0.06);">
            <label class="form-label" style="font-weight: 800; color: var(--md-sys-color-on-surface, #ffffff); margin-bottom: 0.65rem; display: flex; align-items: center; gap: 0.45rem; font-size: 1rem;">
              <span>🎭 1. الدور الوظيفي الأساسي (System Role):</span>
              <span style="color: #ef4444;">*</span>
            </label>
            <select id="editUserRoleSelect" class="form-control" style="font-weight: 700; font-size: 0.98rem; background: var(--md-sys-color-surface-variant, rgba(11, 20, 42, 0.9)); color: var(--md-sys-color-on-surface, #ffffff); border: 1.5px solid var(--md-sys-color-outline-variant, rgba(255, 255, 255, 0.15)); border-radius: 10px; padding: 0.7rem 0.9rem;">
              ${availableRoles.map(r => `
                <option value="${r.key}" ${targetUser.role === r.key ? 'selected' : ''}>${r.name}</option>
              `).join('')}
            </select>
            <div style="font-size: 0.8rem; color: var(--md-sys-color-on-surface-variant, #cbd5e1); margin-top: 6px; opacity: 0.95;">
              💡 يمنح الدور حزمة الصلاحيات الافتراضية المحددة بالنظام، ويمكنك تخصيص وتوسيع الصلاحيات الإضافية في مصفوفة الصلاحيات بالأسفل.
            </div>
          </div>

          <!-- Section 2: Organizational Scopes (الارتباط والتشكيلات) -->
          <div style="background: var(--md-sys-color-surface, rgba(15, 27, 56, 0.8)); border: 1.5px solid var(--md-sys-color-outline-variant, rgba(255, 255, 255, 0.12)); border-radius: 16px; padding: 1.35rem; margin-bottom: 1.35rem; box-shadow: 0 4px 16px rgba(0,0,0,0.06);">
            <strong style="font-size: 1rem; color: var(--md-sys-color-on-surface, #ffffff); display: block; margin-bottom: 0.9rem; font-weight: 800;">
              🏢 2. نطاق المسؤولية والارتباط التنظيمي (Organizational Scope):
            </strong>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem;">
              <div class="form-group" style="margin-bottom: 0;">
                <label class="form-label" style="color: var(--md-sys-color-on-surface, #ffffff); font-weight: 700; margin-bottom: 0.4rem;">الشعبة:</label>
                <select id="editUserSectionSelect" class="form-control" style="background: var(--md-sys-color-surface-variant, rgba(11, 20, 42, 0.9)); color: var(--md-sys-color-on-surface, #ffffff); border: 1.5px solid var(--md-sys-color-outline-variant, rgba(255, 255, 255, 0.15)); border-radius: 10px; padding: 0.65rem 0.85rem;" onchange="window.app.onModalScopeSectionChange(this.value)">
                  <option value="">-- بدون شعبة (إدارة القسم) --</option>
                  ${sections.map(s => `
                    <option value="${s.id}" ${targetUser.sectionId === s.id ? 'selected' : ''}>${s.name}</option>
                  `).join('')}
                </select>
              </div>
              <div class="form-group" style="margin-bottom: 0;">
                <label class="form-label" style="color: var(--md-sys-color-on-surface, #ffffff); font-weight: 700; margin-bottom: 0.4rem;">الوحدة:</label>
                <select id="editUserUnitSelect" class="form-control" style="background: var(--md-sys-color-surface-variant, rgba(11, 20, 42, 0.9)); color: var(--md-sys-color-on-surface, #ffffff); border: 1.5px solid var(--md-sys-color-outline-variant, rgba(255, 255, 255, 0.15)); border-radius: 10px; padding: 0.65rem 0.85rem;">
                  <option value="">-- بدون وحدة --</option>
                  ${units.map(u => `
                    <option value="${u.id}" ${targetUser.unitId === u.id ? 'selected' : ''}>${u.name}</option>
                  `).join('')}
                </select>
              </div>
              <div class="form-group" style="margin-bottom: 0;">
                <label class="form-label" style="color: var(--md-sys-color-on-surface, #ffffff); font-weight: 700; margin-bottom: 0.4rem;">الموقع / المحطة:</label>
                <select id="editUserStationSelect" class="form-control" style="background: var(--md-sys-color-surface-variant, rgba(11, 20, 42, 0.9)); color: var(--md-sys-color-on-surface, #ffffff); border: 1.5px solid var(--md-sys-color-outline-variant, rgba(255, 255, 255, 0.15)); border-radius: 10px; padding: 0.65rem 0.85rem;">
                  <option value="">-- بدون محطة --</option>
                  ${stations.map(st => `
                    <option value="${st.id}" ${targetUser.stationId === st.id ? 'selected' : ''}>${st.name}</option>
                  `).join('')}
                </select>
              </div>
            </div>
          </div>

          <!-- Section 3: Permission Groups Matrix (المجاميع المنظمة) -->
          <div style="margin-bottom: 1.25rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.85rem; padding-bottom: 0.75rem; border-bottom: 1px solid var(--md-sys-color-outline-variant, rgba(255, 255, 255, 0.12));">
            <strong style="font-size: 1.12rem; color: var(--md-sys-color-on-surface, #ffffff); font-weight: 900; display: flex; align-items: center; gap: 0.5rem;">
              <span>🛡️ 3. مصفوفة الصلاحيات المخصصة (Permission Matrix):</span>
            </strong>
            <div style="display: flex; gap: 0.6rem;">
              <button type="button" class="btn btn-sm btn-glass-primary" style="padding: 0.35rem 0.9rem; font-size: 0.8rem; font-weight: 800; border-radius: 8px;" onclick="window.app.selectAllModalPermissions(true)">
                ✓ تحديد جميع الصلاحيات
              </button>
              <button type="button" class="btn btn-sm btn-outline" style="padding: 0.35rem 0.9rem; font-size: 0.8rem; font-weight: 800; border-radius: 8px;" onclick="window.app.selectAllModalPermissions(false)">
                ✕ إلغاء التحديد
              </button>
            </div>
          </div>

          <!-- Permission Groups Cards -->
          <div style="display: flex; flex-direction: column; gap: 1.25rem;">
            ${groups.map(grp => `
              <div style="background: var(--md-sys-color-surface, rgba(15, 27, 56, 0.8)); border: 1.5px solid var(--md-sys-color-outline-variant, rgba(255, 255, 255, 0.12)); border-radius: 16px; padding: 1.25rem 1.4rem; box-shadow: 0 4px 18px rgba(0,0,0,0.06); transition: all 0.2s ease;">
                
                <!-- Group Header Bar -->
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; border-bottom: 1px dashed var(--md-sys-color-outline-variant, rgba(255, 255, 255, 0.15)); padding-bottom: 0.65rem; flex-wrap: wrap; gap: 0.65rem;">
                  <div style="display: flex; align-items: center; gap: 0.65rem;">
                    <span style="font-size: 1.45rem; line-height: 1;">${grp.icon}</span>
                    <div>
                      <div style="font-size: 1.04rem; font-weight: 800; color: var(--md-sys-color-primary, #00dfd8); letter-spacing: -0.2px;">${grp.name}</div>
                      <div style="font-size: 0.78rem; color: var(--md-sys-color-on-surface-variant, #cbd5e1); margin-top: 2px; font-weight: 600;">
                        ${grp.desc} • <span style="font-weight: 800; color: var(--md-sys-color-secondary, #38bdf8);">${grp.permissions.length} صلاحيات</span>
                      </div>
                    </div>
                  </div>
                  <div style="display: flex; gap: 0.4rem;">
                    <button type="button" class="btn btn-sm btn-glass-emerald" style="padding: 0.25rem 0.75rem; font-size: 0.75rem; font-weight: 800; border-radius: 8px;" onclick="window.app.selectGroupModalPermissions('${grp.id}', true)">
                      ✓ تحديد الكل
                    </button>
                    <button type="button" class="btn btn-sm btn-outline" style="padding: 0.25rem 0.75rem; font-size: 0.75rem; font-weight: 800; border-radius: 8px;" onclick="window.app.selectGroupModalPermissions('${grp.id}', false)">
                      ✕ إلغاء
                    </button>
                  </div>
                </div>

                <!-- Structured Grid of Permissions within this Group -->
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(270px, 1fr)); gap: 0.75rem;">
                  ${grp.permissions.map(p => {
                    const isChecked = targetPerms.includes(p.key) || window.rbac.hasPermission(targetUser, p.key);
                    const canGrant = window.rbac.canGrantPermission(actorUser, p.key);

                    return `
                      <label style="display: flex; align-items: flex-start; gap: 0.65rem; font-size: 0.85rem; background: var(--md-sys-color-surface-variant, rgba(11, 20, 42, 0.85)); padding: 0.75rem 0.85rem; border-radius: 12px; border: 1.5px solid var(--md-sys-color-outline-variant, rgba(255, 255, 255, 0.12)); cursor: ${canGrant ? 'pointer' : 'not-allowed'}; opacity: ${canGrant ? 1 : 0.45}; transition: all 0.2s ease; position: relative; user-select: none;" title="${p.desc}">
                        <input type="checkbox" class="modal-perm-checkbox" data-group="${grp.id}" name="userPermissions" value="${p.key}" ${isChecked ? 'checked' : ''} ${canGrant ? '' : 'disabled'} style="margin-top: 3px; transform: scale(1.2); accent-color: var(--md-sys-color-primary, #00dfd8);">
                        <div style="flex: 1; min-width: 0;">
                          <div style="color: var(--md-sys-color-on-surface, #ffffff); font-weight: 800; font-size: 0.88rem; line-height: 1.35; margin-bottom: 2px;">${p.name}</div>
                          <div style="font-size: 0.73rem; color: var(--md-sys-color-on-surface-variant, #cbd5e1); line-height: 1.4; opacity: 0.9;">${p.desc}</div>
                          ${!canGrant ? '<span style="font-size: 0.68rem; color: var(--md-sys-color-error, #ef4444); font-weight: 800; display: block; margin-top: 4px;">⛔ غير مصرح لك بمنحها</span>' : ''}
                        </div>
                      </label>
                    `;
                  }).join('')}
                </div>
              </div>
            `).join('')}
          </div>

        </div>

        <div class="modal-form-sticky-footer" style="padding: 1rem 1.5rem; background: var(--md-sys-color-surface, rgba(15, 27, 56, 0.95)); border-top: 1.5px solid var(--md-sys-color-outline-variant, rgba(255, 255, 255, 0.12)); border-radius: 0 0 16px 16px; display: flex; justify-content: flex-end; gap: 0.75rem;">
          <button type="button" class="btn btn-outline" onclick="window.app.closeModal()" style="font-weight: 700; padding: 0.65rem 1.5rem; border-radius: 10px;">
            إلغاء
          </button>
          <button type="submit" class="btn btn-save-prominent" style="padding: 0.65rem 1.6rem; border-radius: 10px; font-weight: 800; font-size: 0.95rem; display: flex; align-items: center; gap: 0.5rem;">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
              <polyline points="17 21 17 13 7 13 7 21"></polyline>
              <polyline points="7 3 7 8 15 8"></polyline>
            </svg>
            <span>💾 حفظ واعتماد الصلاحيات المحدثة</span>
          </button>
        </div>
      </form>
    `, { size: 'xl', maxWidth: '1200px' });
  }

  selectAllModalPermissions(checkAll) {
    const checkboxes = document.querySelectorAll('.modal-perm-checkbox:not(:disabled)');
    checkboxes.forEach(cb => cb.checked = checkAll);
  }

  selectGroupModalPermissions(groupId, checkAll) {
    const checkboxes = document.querySelectorAll(`.modal-perm-checkbox[data-group="${groupId}"]:not(:disabled)`);
    checkboxes.forEach(cb => cb.checked = checkAll);
  }

  handleRoleChangeInModal(newRole) {
    // When role changes, can suggest default permissions if desired
  }

  handleSaveUserRoleAndPermissions(e, userId) {
    e.preventDefault();
    const actorUser = window.auth.getCurrentUser();

    const role = document.getElementById('editUserRoleSelect').value;
    const sectionId = document.getElementById('editUserSectionSelect').value;
    const unitId = document.getElementById('editUserUnitSelect').value;
    const stationId = document.getElementById('editUserStationSelect').value;

    const checkedPerms = Array.from(document.querySelectorAll('.modal-perm-checkbox:checked')).map(cb => cb.value);

    const result = window.store.updateUserRoleAndPermissions(
      userId,
      role,
      { sectionId, unitId, stationId },
      checkedPerms,
      actorUser
    );

    if (result.success) {
      alert('تم تحديث الدور والصلاحيات والنطاق للمستخدم بنجاح.');
      this.closeModal();
      this.render();
    } else {
      alert('خطأ: ' + result.error);
    }
  }

  // --- Change Employee ID Modal ---
  openChangeEmployeeIdModal(userId) {
    const actorUser = window.auth.getCurrentUser();
    const targetUser = window.store.getUserById(userId);
    if (!targetUser) return;

    if (!window.rbac.canManageTargetUser(actorUser, targetUser)) {
      alert('⛔ ليس لديك صلاحية تعديل الرقم الوظيفي لهذا المستخدم.');
      return;
    }

    this.showModal(`🆔 تغيير الرقم الوظيفي - ${targetUser.fullName}`, `
      <form onsubmit="window.app.handleSaveChangeEmployeeId(event, '${targetUser.id}')">
        <div style="padding: 0.75rem; background: var(--md-sys-color-surface-variant); border-radius: var(--radius-md); margin-bottom: 1.25rem;">
          <div style="font-weight: 700;">${targetUser.fullName}</div>
          <div style="font-size: 0.85rem; color: var(--md-sys-color-outline);">الرقم الوظيفي الحالي: <code>${targetUser.employeeId}</code></div>
        </div>

        <div class="form-group">
          <label class="form-label">الرقم الوظيفي الجديد (Unique Employee ID):</label>
          <input type="text" id="newEmployeeIdInput" class="form-control" value="${targetUser.employeeId}" required placeholder="EMP-2024-XXX" style="font-family: monospace; font-weight: 700; text-transform: uppercase;">
          <small style="color: var(--md-sys-color-outline); font-size: 0.75rem;">
            ⚠️ سيقوم النظام بالتحقق الفوري من عدم تكرار الرقم في قاعدة بيانات الموارد البشرية قبل اعتماده.
          </small>
        </div>

        <div style="margin-top: 1.25rem; display: flex; justify-content: flex-end; gap: 0.5rem;">
          <button type="button" class="btn btn-outline" onclick="window.app.closeModal()">إلغاء</button>
          <button type="submit" class="btn btn-primary" style="font-weight: 800;">
            تأكيد وتغيير الرقم الوظيفي
          </button>
        </div>
      </form>
    `);
  }

  handleSaveChangeEmployeeId(e, userId) {
    e.preventDefault();
    const actorUser = window.auth.getCurrentUser();
    const newEmpId = document.getElementById('newEmployeeIdInput').value;

    const res = window.store.changeUserEmployeeId(userId, newEmpId, actorUser);
    if (res.success) {
      alert(`تم تغيير الرقم الوظيفي بنجاح إلى: (${res.employeeId})`);
      this.closeModal();
      this.render();
    } else {
      alert('تعذر التغيير: ' + res.error);
    }
  }

  // --- Reset Password Modal ---
  openResetUserPasswordModal(userId) {
    const actorUser = window.auth.getCurrentUser();
    const targetUser = window.store.getUserById(userId);
    if (!targetUser) return;

    if (!window.rbac.canManageTargetUser(actorUser, targetUser)) {
      alert('⛔ ليس لديك صلاحية إعادة تعيين كلمة المرور لهذا المستخدم.');
      return;
    }

    this.showModal(`🔑 إعادة تعيين كلمة السر - ${targetUser.fullName}`, `
      <form onsubmit="window.app.handleSaveResetUserPassword(event, '${targetUser.id}')">
        <div style="padding: 0.75rem; background: var(--md-sys-color-surface-variant); border-radius: var(--radius-md); margin-bottom: 1.25rem;">
          <div style="font-weight: 700;">${targetUser.fullName} (${targetUser.employeeId})</div>
          <div style="font-size: 0.8rem; color: var(--md-sys-color-outline);">البريد: ${targetUser.email}</div>
        </div>

        <div class="form-group">
          <label class="form-label">كلمة المرور الجديدة:</label>
          <div style="display: flex; gap: 0.5rem;">
            <input type="password" id="resetNewPassInput" class="form-control" placeholder="••••••••" required minlength="6" style="flex: 1;">
            <button type="button" class="btn btn-outline btn-sm" onclick="
              const p = 'Pass@' + Math.floor(1000 + Math.random() * 9000);
              const inp = document.getElementById('resetNewPassInput');
              const conf = document.getElementById('resetConfPassInput');
              inp.type = 'text'; inp.value = p;
              conf.type = 'text'; conf.value = p;
            " title="توليد كلمة سر عشوائية">
              🎲 توليد آمن
            </button>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">تأكيد كلمة المرور الجديدة:</label>
          <input type="password" id="resetConfPassInput" class="form-control" placeholder="••••••••" required minlength="6">
        </div>

        <div style="font-size: 0.78rem; color: var(--md-sys-color-outline); margin-bottom: 1rem; line-height: 1.5;">
          🔒 سياسة الأمان: لا يتم عرض كلمات المرور القديمة لأي مسؤول أو مستخدم، ويتم توثيق عملية التعيين في سجل التدقيق الأمني.
        </div>

        <div style="margin-top: 1.25rem; display: flex; justify-content: flex-end; gap: 0.5rem;">
          <button type="button" class="btn btn-outline" onclick="window.app.closeModal()">إلغاء</button>
          <button type="submit" class="btn btn-primary" style="font-weight: 800;">
            تثبيت كلمة المرور الجديدة
          </button>
        </div>
      </form>
    `);
  }

  handleSaveResetUserPassword(e, userId) {
    e.preventDefault();
    const actorUser = window.auth.getCurrentUser();
    const newPass = document.getElementById('resetNewPassInput').value;
    const confPass = document.getElementById('resetConfPassInput').value;

    if (newPass !== confPass) {
      alert('كلمتا المرور غير متطابقتين.');
      return;
    }

    const res = window.store.resetUserPassword(userId, newPass, actorUser);
    if (res.success) {
      alert('تمت إعادة تعيين كلمة المرور للمستخدم بنجاح.');
      this.closeModal();
      this.render();
    } else {
      alert('خطأ: ' + res.error);
    }
  }

  handleToggleUserStatus(userId, newStatus) {
    const actorUser = window.auth.getCurrentUser();
    const res = window.store.toggleUserStatus(userId, newStatus, actorUser);
    if (res.success) {
      this.render();
    } else {
      alert('تعذر تغيير الحالة: ' + res.error);
    }
  }

  // --- Bulk Import Employee IDs from CSV / Excel & Quick Single Add ---
  handleCSVFileSelected(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const textarea = document.getElementById('importCSVTextarea');
      if (textarea) textarea.value = text;
      this.handleParseImportEmployeeIDs();
    };
    reader.readAsText(file);
  }

  handleInsertSampleCSV(sampleType) {
    const textarea = document.getElementById('importCSVTextarea');
    if (!textarea) return;

    if (sampleType === 'minimal') {
      textarea.value = `الرقم الوظيفي,الاسم الكامل
EMP-2026-901,كرار حيدر علي
EMP-2026-902,حسين جاسم محمد
EMP-2026-903,زينب كاظم جواد
EMP-2026-904,مصطفى باقر حسن
EMP-2026-905,مروة عادل عبد الرضا`;
    } else {
      textarea.value = `الرقم الوظيفي,الاسم الرباعي واللقب,العنوان الوظيفي,الدرجة,المرحلة,الشهادة,التخصص,الشعبة
EMP-2026-901,كرار حيدر علي الحسني,رئيس مهندسين أقدم,الثالثة,الأولى,بكالوريوس,هندسة نفط,شعبة العمليات
EMP-2026-902,حسين جاسم محمد الخفاجي,مشغل محطة إنتاجية أقدم,الرابعة,الثانية,دبلوم فني,تشغيل وسيطرة,شعبة الصيانة
EMP-2026-903,زينب كاظم جواد العامري,مهندس أقدم,الخامسة,الثالثة,بكالوريوس,هندسة كيمياوية,الشعبة الفنية
EMP-2026-904,مصطفى باقر حسن التميمي,معاون ملاحظ فني,السابعة,الرابعة,إعدادية صناعة,ميكانيك,شعبة الخدمات السطحية
EMP-2026-905,مروة عادل عبد الرضا المالكي,مدقق حسابات أقدم,الرابعة,الأولى,بكالوريوس,محاسبة مالية,شعبة الشؤون الإدارية`;
    }

    if (this.showToast) {
      this.showToast('📋 تم إدراج نموذج البيانات التجريبية في الصندوق جاهزاً للفحص.', 'info');
    }
    this.handleParseImportEmployeeIDs();
  }

  handleCopyTemplateText(sampleType) {
    let text = '';
    if (sampleType === 'minimal') {
      text = `الرقم الوظيفي,الاسم الكامل\nEMP-2026-901,كرار حيدر علي\nEMP-2026-902,حسين جاسم محمد`;
    } else {
      text = `الرقم الوظيفي,الاسم الرباعي واللقب,العنوان الوظيفي,الدرجة,المرحلة,الشهادة,التخصص,الشعبة\nEMP-2026-901,كرار حيدر علي الحسني,رئيس مهندسين أقدم,الثالثة,الأولى,بكالوريوس,هندسة نفط,شعبة العمليات`;
    }

    if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        if (this.showToast) this.showToast('📋 تم نسخ صيغة النموذج إلى الحافظة بنجاح!', 'success');
        else alert('تم النسخ إلى الحافظة!');
      }).catch(() => {
        if (this.showToast) this.showToast('تعذر النسخ التلقائي، يمكنك نسخه يدوياً من الشاشة.', 'warning');
      });
    } else {
      if (this.showToast) this.showToast('📋 صيغة النموذج متاحة على الشاشة.', 'info');
    }
  }

  handleQuickAddSingleEmployee(event) {
    if (event && event.preventDefault) event.preventDefault();
    const actorUser = window.auth ? window.auth.getCurrentUser() : null;
    if (!actorUser) return;

    const fullNameInput = document.getElementById('quickEmpFullName');
    const empIdInput = document.getElementById('quickEmpId');
    const jobTitleInput = document.getElementById('quickEmpJobTitle');
    const sectionInput = document.getElementById('quickEmpSectionId');
    const jobGradeInput = document.getElementById('quickEmpJobGrade');
    const jobStageInput = document.getElementById('quickEmpJobStage');
    const degreeInput = document.getElementById('quickEmpDegree');
    const workShiftInput = document.getElementById('quickEmpWorkShift');

    const fullName = (fullNameInput ? fullNameInput.value : '').trim();
    const empId = (empIdInput ? empIdInput.value : '').trim().toUpperCase();
    const jobTitle = (jobTitleInput ? jobTitleInput.value : '').trim() || 'موظف';
    const sectionId = sectionInput ? sectionInput.value : null;
    const jobGrade = jobGradeInput ? jobGradeInput.value : 'الخامسة';
    const jobStage = jobStageInput ? jobStageInput.value : 'الأولى';
    const degree = degreeInput ? degreeInput.value : 'بكالوريوس';
    const workShift = workShiftInput ? workShiftInput.value : 'صباحي';

    if (!fullName || !empId) {
      if (this.showToast) {
        this.showToast('يرجى إدخال كل من الاسم الرباعي والرقم الوظيفي كحد أدنى إلزامي.', 'warning');
      } else if (typeof alert === 'function') {
        alert('يرجى إدخال كل من الاسم الرباعي والرقم الوظيفي كحد أدنى إلزامي.');
      }
      return;
    }

    if (empId.length < 3) {
      if (this.showToast) {
        this.showToast('الرقم الوظيفي غير صالح (يجب أن يتكون من 3 رموز على الأقل).', 'warning');
      } else if (typeof alert === 'function') {
        alert('الرقم الوظيفي غير صالح (يجب أن يتكون من 3 رموز على الأقل).');
      }
      return;
    }

    const record = {
      employeeId: empId,
      fullName: fullName,
      name: fullName,
      jobTitle: jobTitle,
      sectionId: sectionId || null,
      jobGrade: jobGrade,
      jobStage: jobStage,
      degree: degree,
      workShift: workShift,
      departmentId: actorUser.departmentId || 'dept-south-prod'
    };

    const res = window.store.addOrUpdateEmployeeMasterRecord(record, actorUser);
    if (res && res.success !== false) {
      if (fullNameInput) fullNameInput.value = '';
      if (empIdInput) empIdInput.value = '';
      if (jobTitleInput) jobTitleInput.value = '';

      if (this.showToast) {
        this.showToast(`🎉 تم اعتماد وإضافة الموظف [${fullName} - ${empId}] في السجل الرسمي بنجاح!`, 'success');
      } else if (typeof alert === 'function') {
        alert(`🎉 تم اعتماد وإضافة الموظف [${fullName} - ${empId}] في السجل الرسمي بنجاح!`);
      }

      this.render();
    } else {
      const errMsg = (res && res.error) ? res.error : 'تعذر حفظ السجل.';
      if (this.showToast) {
        this.showToast(errMsg, 'error');
      } else if (typeof alert === 'function') {
        alert(errMsg);
      }
    }
  }

  handleParseImportEmployeeIDs() {
    const textarea = document.getElementById('importCSVTextarea');
    if (!textarea || !textarea.value.trim()) {
      if (this.showToast) this.showToast('يرجى لصق بيانات CSV أو اختيار ملف أولاً.', 'warning');
      else if (typeof alert === 'function') alert('يرجى لصق بيانات CSV أو اختيار ملف أولاً.');
      return;
    }

    const rawText = textarea.value.trim();
    const lines = rawText.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length === 0) return;

    const approvedList = window.store.getApprovedEmployeeIds();
    const existingSet = new Set(approvedList.map(a => (a.employeeId || '').toUpperCase()));

    const seenInBatch = new Set();
    const parsedRecords = [];

    // Header Detection
    const firstLineParts = lines[0].split(/[,\t;]/).map(p => p.trim().replace(/^["']|["']$/g, ''));
    let hasHeader = false;
    let idCol = 0;
    let nameCol = 1;
    let titleCol = -1;
    let gradeCol = -1;
    let stageCol = -1;
    let degreeCol = -1;
    let specCol = -1;
    let secCol = -1;
    let shiftCol = -1;

    firstLineParts.forEach((col, idx) => {
      const c = col.toLowerCase();
      if (c.includes('رقم') || c.includes('emp') || c.includes('id') || c.includes('code')) {
        idCol = idx;
        hasHeader = true;
      } else if (c.includes('اسم') || c.includes('name') || c.includes('موظف')) {
        nameCol = idx;
        hasHeader = true;
      } else if (c.includes('عنوان') || c.includes('title') || c.includes('منصب')) {
        titleCol = idx;
        hasHeader = true;
      } else if (c.includes('درجة') || c.includes('grade')) {
        gradeCol = idx;
        hasHeader = true;
      } else if (c.includes('مرحلة') || c.includes('stage')) {
        stageCol = idx;
        hasHeader = true;
      } else if (c.includes('شهادة') || c.includes('تحصيل') || c.includes('degree')) {
        degreeCol = idx;
        hasHeader = true;
      } else if (c.includes('تخصص') || c.includes('اختصاص') || c.includes('specialization')) {
        specCol = idx;
        hasHeader = true;
      } else if (c.includes('شعبة') || c.includes('قسم') || c.includes('ارتباط') || c.includes('section')) {
        secCol = idx;
        hasHeader = true;
      } else if (c.includes('وجبة') || c.includes('دوام') || c.includes('shift')) {
        shiftCol = idx;
        hasHeader = true;
      }
    });

    const dataLines = hasHeader ? lines.slice(1) : lines;

    dataLines.forEach((line, idx) => {
      let parts = line.split(/[,\t;]/).map(p => p.trim().replace(/^["']|["']$/g, ''));
      if (parts.length === 0 || (parts.length === 1 && !parts[0])) return;

      let rawEmpId = parts[idCol] || '';
      let rawFullName = parts[nameCol] || '';

      // Heuristic swap if first is Arabic name and second is ID code
      if ((/[\u0600-\u06FF]/.test(rawEmpId) || rawEmpId.includes(' ')) && (/^EMP/i.test(rawFullName) || /^\d+$/.test(rawFullName))) {
        const temp = rawEmpId;
        rawEmpId = rawFullName;
        rawFullName = temp;
      }

      const empId = rawEmpId.trim().toUpperCase();
      const fullName = rawFullName.trim() || 'منتسب معتمد';
      const jobTitle = (titleCol !== -1 && parts[titleCol]) ? parts[titleCol] : (parts.length > 2 && parts[2] && !parts[2].includes('الدرجة') ? parts[2] : 'موظف');
      const jobGrade = (gradeCol !== -1 && parts[gradeCol]) ? parts[gradeCol] : (parts.length > 3 ? parts[3] : 'الخامسة');
      const jobStage = (stageCol !== -1 && parts[stageCol]) ? parts[stageCol] : (parts.length > 4 ? parts[4] : 'الأولى');
      const degree = (degreeCol !== -1 && parts[degreeCol]) ? parts[degreeCol] : (parts.length > 5 ? parts[5] : 'بكالوريوس');
      const specialization = (specCol !== -1 && parts[specCol]) ? parts[specCol] : (parts.length > 6 ? parts[6] : 'تشغيل وإنتاج');
      const sectionHint = (secCol !== -1 && parts[secCol]) ? parts[secCol] : (parts.length > 7 ? parts[7] : '');
      const workShift = (shiftCol !== -1 && parts[shiftCol]) ? parts[shiftCol] : 'صباحي';

      let sectionId = null;
      if (sectionHint) {
        const matchedSec = (window.store ? window.store.getSections() : []).find(s => s && (s.name.includes(sectionHint) || sectionHint.includes(s.name)));
        if (matchedSec) sectionId = matchedSec.id;
      }

      let status = 'VALID_NEW';
      let statusLabel = '🟢 صالح وجديد';
      let isError = false;

      if (!empId || empId.length < 3) {
        status = 'INVALID';
        statusLabel = '🔴 رقم وظيفي غير صحيح';
        isError = true;
      } else if (seenInBatch.has(empId)) {
        status = 'DUPLICATE_IN_FILE';
        statusLabel = '⚠️ مكرر في الملف';
        isError = true;
      } else if (existingSet.has(empId)) {
        status = 'ALREADY_EXISTS';
        statusLabel = '🟡 مسجل مسبقاً (سيتم التحديث)';
      }

      if (!isError) {
        seenInBatch.add(empId);
      }

      parsedRecords.push({
        lineIndex: idx + (hasHeader ? 2 : 1),
        employeeId: empId,
        fullName,
        jobTitle,
        sectionId,
        sectionHint: sectionHint || 'إدارة القسم',
        jobGrade,
        jobStage,
        degree,
        specialization,
        workShift,
        status,
        statusLabel,
        isError
      });
    });

    this.parsedImportBatch = parsedRecords;

    // Render Preview
    const validCount = parsedRecords.filter(r => r.status === 'VALID_NEW').length;
    const existingCount = parsedRecords.filter(r => r.status === 'ALREADY_EXISTS').length;
    const duplicateCount = parsedRecords.filter(r => r.status === 'DUPLICATE_IN_FILE').length;
    const invalidCount = parsedRecords.filter(r => r.status === 'INVALID').length;

    const previewContainer = document.getElementById('importPreviewContainer');
    if (!previewContainer) return;

    previewContainer.style.display = 'block';
    previewContainer.innerHTML = `
      <div class="card" style="margin: 0; padding: 1.5rem; background: var(--md-sys-color-surface, rgba(255, 255, 255, 0.9)); border: 1.5px solid rgba(2, 132, 199, 0.25); border-radius: 16px; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08); backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px);">
        
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.75rem; margin-bottom: 1.25rem; padding-bottom: 0.75rem; border-bottom: 1px solid var(--md-sys-color-outline-variant, rgba(0,0,0,0.08));">
          <div>
            <h4 style="margin: 0; font-weight: 900; font-size: 1.15rem; color: var(--md-sys-color-primary, #0284c7); display: flex; align-items: center; gap: 0.4rem;">
              <span>📊</span> نتائج الفحص والمعاينة الذكية (${parsedRecords.length} سجل مقروء)
            </h4>
            <p style="margin: 0.2rem 0 0 0; font-size: 0.8rem; color: var(--md-sys-color-outline, #64748b);">
              تحقق من مطابقة السجلات قبل الاعتماد النهائي في السجل المركزي.
            </p>
          </div>
          <span class="badge badge-primary" style="font-size: 0.82rem; font-weight: 800; padding: 0.3rem 0.8rem; border-radius: 999px;">
            جاهز للاعتماد: ${validCount + existingCount} سجل
          </span>
        </div>

        <!-- Metric Counters -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 0.75rem; margin-bottom: 1.25rem;">
          <div style="padding: 0.85rem; background: rgba(16, 185, 129, 0.1); border: 1.5px solid rgba(16, 185, 129, 0.3); border-radius: 12px; text-align: center;">
            <div style="font-size: 1.6rem; font-weight: 900; color: #059669; font-family: monospace;">${validCount}</div>
            <div style="font-size: 0.75rem; font-weight: 800; color: #059669;">سجلات جديدة صالحة</div>
          </div>
          <div style="padding: 0.85rem; background: rgba(2, 132, 199, 0.1); border: 1.5px solid rgba(2, 132, 199, 0.3); border-radius: 12px; text-align: center;">
            <div style="font-size: 1.6rem; font-weight: 900; color: #0284c7; font-family: monospace;">${existingCount}</div>
            <div style="font-size: 0.75rem; font-weight: 800; color: #0284c7;">موجودة مسبقاً (تحديث)</div>
          </div>
          <div style="padding: 0.85rem; background: rgba(245, 158, 11, 0.1); border: 1.5px solid rgba(245, 158, 11, 0.3); border-radius: 12px; text-align: center;">
            <div style="font-size: 1.6rem; font-weight: 900; color: #d97706; font-family: monospace;">${duplicateCount}</div>
            <div style="font-size: 0.75rem; font-weight: 800; color: #d97706;">مكررة بالملف</div>
          </div>
          <div style="padding: 0.85rem; background: rgba(239, 68, 68, 0.1); border: 1.5px solid rgba(239, 68, 68, 0.3); border-radius: 12px; text-align: center;">
            <div style="font-size: 1.6rem; font-weight: 900; color: #dc2626; font-family: monospace;">${invalidCount}</div>
            <div style="font-size: 0.75rem; font-weight: 800; color: #dc2626;">أخطاء بالصيغة</div>
          </div>
        </div>

        <!-- Preview Table -->
        <div class="table-container" style="max-height: 320px; overflow-y: auto; margin-bottom: 1.25rem; border: 1px solid var(--md-sys-color-outline-variant, rgba(0,0,0,0.08)); border-radius: 12px;">
          <table class="data-table" style="font-size: 0.82rem; margin: 0;">
            <thead>
              <tr>
                <th style="width: 50px; text-align: center;">السطر</th>
                <th style="min-width: 120px;">الرقم الوظيفي</th>
                <th style="min-width: 160px;">الاسم الكامل</th>
                <th style="min-width: 130px;">العنوان / جهة الارتباط</th>
                <th style="min-width: 110px;">الدرجة والمرحلة</th>
                <th style="min-width: 120px;">الشهادة والتخصص</th>
                <th style="min-width: 130px; text-align: center;">حالة السجل</th>
              </tr>
            </thead>
            <tbody>
              ${parsedRecords.map(r => `
                <tr style="${r.isError ? 'background: rgba(239, 68, 68, 0.05);' : ''}">
                  <td style="text-align: center; font-weight: 700; color: var(--md-sys-color-outline, #64748b);">${r.lineIndex}</td>
                  <td><code style="font-weight: 800; color: #0284c7; background: rgba(2,132,199,0.08); padding: 0.15rem 0.45rem; border-radius: 6px;">${r.employeeId}</code></td>
                  <td style="font-weight: 800; color: var(--md-sys-color-on-surface, currentColor);">${r.fullName}</td>
                  <td>
                    <div style="font-weight: 700;">${r.jobTitle}</div>
                    <div style="font-size: 0.74rem; color: var(--md-sys-color-outline, #64748b);">${r.sectionHint}</div>
                  </td>
                  <td>${r.jobGrade} / ${r.jobStage}</td>
                  <td>${r.degree} - ${r.specialization}</td>
                  <td style="text-align: center;">
                    <span class="badge ${r.status === 'VALID_NEW' ? 'badge-success' : (r.status === 'ALREADY_EXISTS' ? 'badge-info' : 'badge-danger')}" style="font-weight: 800; font-size: 0.74rem; padding: 0.2rem 0.6rem; border-radius: 999px;">
                      ${r.statusLabel}
                    </span>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <!-- Confirm Action Bar -->
        <div style="display: flex; justify-content: flex-end; gap: 0.75rem; flex-wrap: wrap;">
          <button type="button" class="btn btn-outline" style="font-weight: 700;" onclick="document.getElementById('importPreviewContainer').style.display='none'">
            إلغاء المعاينة
          </button>
          <button type="button" class="btn btn-success" style="font-weight: 900; font-size: 0.88rem; padding: 0.65rem 1.6rem; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border: none; box-shadow: 0 4px 14px rgba(16, 185, 129, 0.35); border-radius: 10px; cursor: pointer;" onclick="window.app.handleExecuteImportEmployeeIDs()" ${validCount + existingCount === 0 ? 'disabled' : ''}>
            ✅ تأكيد واعتماد استيراد السجلات (${validCount + existingCount} سجل) فوراً
          </button>
        </div>

      </div>
    `;

    previewContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  handleExecuteImportEmployeeIDs() {
    if (!this.parsedImportBatch || this.parsedImportBatch.length === 0) return;

    const actorUser = window.auth.getCurrentUser();
    const validRecords = this.parsedImportBatch.filter(r => !r.isError);

    if (validRecords.length === 0) {
      if (this.showToast) this.showToast('لا توجد سجلات صالحة للاستيراد.', 'warning');
      else if (typeof alert === 'function') alert('لا توجد سجلات صالحة للاستيراد.');
      return;
    }

    const isConfirmed = (typeof confirm === 'function') ? confirm(`تأكيد الاستيراد: هل أنت متأكد من إضافة وتحديث ${validRecords.length} رقم وظيفي معتمد في قاعدة بيانات الموارد البشرية؟`) : true;

    if (isConfirmed) {
      const result = window.store.importApprovedEmployeeIds(validRecords, actorUser);
      if (this.showToast) {
        this.showToast(`🎉 تم الاستيراد والاعتماد بنجاح! تم حفظ ${result.total} سجل (${result.newCount} رقم وظيفي جديد).`, 'success');
      } else if (typeof alert === 'function') {
        alert(`تم الاستيراد بنجاح! تم حفظ ${result.total} سجل (${result.newCount} رقم وظيفي جديد).`);
      }
      this.setUserManagementSubTab('users_roster');
    }
  }

  // --- User Registry & Master Dossier Handlers ---
  setUserRegistryPage(page) {
    if (!this.userRegistryState) this.userRegistryState = { page: 1, pageSize: 25, search: '', section: 'ALL', jobTitle: 'ALL', status: 'ALL', role: 'ALL' };
    this.userRegistryState.page = Math.max(1, page);
    this.render();
  }

  setUserRegistryPageSize(size) {
    if (!this.userRegistryState) this.userRegistryState = { page: 1, pageSize: 25, search: '', section: 'ALL', jobTitle: 'ALL', status: 'ALL', role: 'ALL' };
    this.userRegistryState.pageSize = size;
    this.userRegistryState.page = 1;
    this.render();
  }

  filterUnifiedRosterTable() {
    if (!this.userRegistryState) this.userRegistryState = { page: 1, pageSize: 25, search: '', section: 'ALL', status: 'ALL', role: 'ALL' };
    const searchInput = document.getElementById('unifiedRosterSearchInput');
    const search = (searchInput?.value || '').trim();
    const sectionFilter = document.getElementById('unifiedRosterSectionFilter')?.value || 'ALL';
    const statusFilter = document.getElementById('unifiedRosterStatusFilter')?.value || 'ALL';
    const roleFilter = document.getElementById('unifiedRosterRoleFilter')?.value || 'ALL';

    const cursorStart = searchInput ? searchInput.selectionStart : null;
    const isFocused = searchInput && (document.activeElement === searchInput);

    this.userRegistryState.search = search;
    this.userRegistryState.section = sectionFilter;
    this.userRegistryState.jobTitle = 'ALL';
    this.userRegistryState.status = statusFilter;
    this.userRegistryState.role = roleFilter;
    this.userRegistryState.page = 1;

    this.render();

    if (isFocused) {
      const newInput = document.getElementById('unifiedRosterSearchInput');
      if (newInput) {
        newInput.focus();
        if (cursorStart !== null) {
          try { newInput.setSelectionRange(cursorStart, cursorStart); } catch (e) {}
        }
      }
    }
  }

  filterMatrixTable(query) {
    const search = (query || '').toLowerCase().trim();
    const rows = document.querySelectorAll('.matrix-user-row');
    rows.forEach(row => {
      const name = (row.getAttribute('data-name') || '').toLowerCase();
      const empid = (row.getAttribute('data-empid') || '').toLowerCase();
      const email = (row.getAttribute('data-email') || '').toLowerCase();
      const match = !search || name.includes(search) || empid.includes(search) || email.includes(search);
      row.style.display = match ? '' : 'none';
    });
  }

  exportUnifiedRosterCSV() {
    const actorUser = window.auth.getCurrentUser();
    const roster = window.store.getUnifiedEmployeeRoster(actorUser);
    
    let csv = '\uFEFFالرقم الوظيفي,الاسم الرباعي,العنوان الوظيفي,الدرجة,المرحلة,الشهادة,التخصص,رقم الهاتف,البريد,حالة الحساب,الشعبة\n';
    roster.forEach(e => {
      const sec = window.store.getSectionById(e.sectionId);
      const secName = sec ? sec.name : 'إدارة القسم';
      csv += `"${e.employeeId}","${e.fullName}","${e.jobTitle || ''}","${e.jobGrade || ''}","${e.jobStage || ''}","${e.degree || ''}","${e.specialization || ''}","${e.phone || ''}","${e.userEmail || ''}","${e.accountStatusLabel || ''}","${secName}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `سجل_الموظفين_الموحد_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  }

  // --- 8-Tab Unified Master Dossier Modal (الملف الموحد للإضبارة) ---
  openMasterDossierModal(empId) {
    const actorUser = window.auth.getCurrentUser();
    const master = window.store.getEmployeeMasterRecordByEmployeeId(empId);
    if (!master) {
      alert('سجل الموظف غير موجود في قاعدة البيانات.');
      return;
    }

    const linkedUser = window.store.getUserByEmployeeId(empId);
    const sections = window.store.getSections(actorUser.departmentId);
    const units = window.store.getUnits(actorUser.departmentId);
    const stations = window.store.getStations(actorUser.departmentId);
    const dynamicFields = window.store.getDynamicEmployeeFields(actorUser.departmentId);

    const sec = sections.find(s => s.id === master.sectionId);
    const un = units.find(u => u.id === master.unitId);
    const st = stations.find(station => station.id === master.stationId);
    const scopeName = sec ? sec.name : (un ? un.name : (st ? st.name : 'إدارة القسم'));

    const roleInfo = window.rbac.getRoleInfo(linkedUser ? linkedUser.role : 'EMPLOYEE');
    const canEditMaster = window.rbac.hasPermission(actorUser, 'EDIT_EMPLOYEE_INFO') || ['DEPT_MANAGER', 'SUPER_ADMIN'].includes(actorUser.role);
    const canViewSensitive = window.rbac.hasPermission(actorUser, 'VIEW_SENSITIVE_INFO') || ['DEPT_MANAGER', 'SUPER_ADMIN'].includes(actorUser.role);
    const canAddInfo = window.rbac.hasPermission(actorUser, 'ADD_EMPLOYEE_INFO') || ['DEPT_MANAGER', 'SUPER_ADMIN'].includes(actorUser.role) || (actorUser.sectionId && actorUser.sectionId === master.sectionId);

    const activeSubTab = this.currentDossierSubTab || 'tab_basic';

    this.showModal(`📂 إضبارة الموظف الموحدة والأصلية - ${master.fullName}`, `
      <div style="max-height: 75vh; overflow-y: auto; padding-left: 0.5rem;">
        
        <!-- Header Identity Banner (Deep Midnight Petroleum Glass Banner) -->
        <div class="dossier-hero-banner" style="background: linear-gradient(135deg, #06152d 0%, #0a254a 55%, #021a38 100%) !important; color: #ffffff !important; border-radius: var(--radius-lg); padding: 1.5rem 1.75rem; margin-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1.25rem; box-shadow: 0 12px 35px -5px rgba(0, 0, 0, 0.6), 0 0 20px rgba(0, 223, 216, 0.1) !important; border: 1.5px solid rgba(0, 223, 216, 0.35) !important;">
          <div style="display: flex; align-items: center; gap: 1.25rem;">
            <div style="width: 64px; height: 64px; border-radius: 50%; background: linear-gradient(135deg, #00dfd8 0%, #0284c7 100%); color: #041e24; display: flex; align-items: center; justify-content: center; font-size: 1.7rem; font-weight: 900; box-shadow: 0 4px 18px rgba(0, 223, 216, 0.4);">
              ${(master.fullName || 'م').substring(0, 2)}
            </div>
            <div>
              <h3 style="margin: 0; font-weight: 900; font-size: 1.55rem; color: #ffffff !important; letter-spacing: -0.3px; text-shadow: 0 2px 8px rgba(0,0,0,0.5);">${master.fullName}</h3>
              <div style="font-size: 0.92rem; color: #cbd5e1; margin-top: 4px; display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap;">
                <span style="color: #94a3b8;">الرقم الوظيفي:</span>
                <code style="background: rgba(0, 223, 216, 0.15); padding: 3px 10px; border-radius: 6px; font-weight: 800; font-size: 0.95rem; color: #00dfd8; border: 1.2px solid rgba(0, 223, 216, 0.4); font-family: monospace;">${master.employeeId}</code>
                <span style="color: #64748b;">|</span>
                <strong style="color: #f1f5f9; font-weight: 700;">${master.jobTitle || 'موظف تشغيل'}</strong>
              </div>
            </div>
          </div>
          <div style="display: flex; gap: 0.65rem; flex-direction: column; align-items: flex-end;">
            <span class="neon-pill-role" style="font-size: 0.92rem; padding: 0.45rem 1.2rem; font-weight: 800; border-radius: 9999px; background: linear-gradient(135deg, rgba(0, 223, 216, 0.2) 0%, rgba(14, 165, 233, 0.12) 100%); color: #ffffff; border: 1.5px solid rgba(0, 223, 216, 0.65); box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25), 0 0 12px rgba(0, 223, 216, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.4); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); display: inline-flex; align-items: center; gap: 0.45rem; text-shadow: 0 1px 3px rgba(0, 0, 0, 0.4); letter-spacing: 0.2px;">
              <span style="color: #00dfd8; font-size: 1rem;">🛡️</span>
              <span style="color: #ffffff; font-weight: 800;">${roleInfo.name}</span>
              <span style="color: #67e8f9; font-size: 0.85rem; font-weight: 700;">(${scopeName})</span>
            </span>
            ${linkedUser ? `
              <span class="neon-pill-status" style="font-size: 0.88rem; font-weight: 800; padding: 0.4rem 1.2rem; border-radius: 9999px; background: linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(5, 150, 105, 0.12) 100%); color: #ffffff; border: 1.5px solid rgba(52, 211, 153, 0.65); box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25), 0 0 12px rgba(16, 185, 129, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.4); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); display: inline-flex; align-items: center; gap: 0.5rem; text-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);">
                <span style="display: inline-block; width: 9px; height: 9px; border-radius: 50%; background: #10b981; box-shadow: 0 0 10px #10b981, 0 0 4px #34d399;"></span>
                <span style="color: #ffffff; font-weight: 800;">حساب معتمد</span>
                <span style="color: #6ee7b7; font-size: 0.82rem; font-weight: 700;">(${linkedUser.status})</span>
              </span>
            ` : `
              <span class="neon-pill-status" style="font-size: 0.88rem; font-weight: 800; padding: 0.4rem 1.2rem; border-radius: 9999px; background: linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.06) 100%); color: #ffffff; border: 1.5px solid rgba(255, 255, 255, 0.35); box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25), inset 0 1px 1px rgba(255, 255, 255, 0.4); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); display: inline-flex; align-items: center; gap: 0.5rem; text-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);">
                <span>⚪ بدون حساب مستخدم</span>
              </span>
            `}
          </div>
        </div>

        <!-- Dossier Subtabs Navigation (Next-Gen Glassmorphic Tabs Bar) -->
        <div class="dossier-glass-tabs-container" style="margin-bottom: 1.5rem;">
          
          <!-- Tab 1: البيانات الشخصية والمدنية -->
          <button type="button" class="dossier-step-tab ${activeSubTab === 'tab_basic' ? 'active' : ''}" onclick="window.app.setDossierModalTab('${master.employeeId}', 'tab_basic')" title="البيانات الشخصية والمعلومات المدنية">
            <span class="step-num">1</span>
            <span class="step-icon">📋</span>
            <div class="step-info">
              <span class="step-title">البيانات الشخصية</span>
              <span class="step-subtitle">والمعلومات المدنية</span>
            </div>
          </button>

          <!-- Tab 2: المسار والشهادات -->
          <button type="button" class="dossier-step-tab ${activeSubTab === 'tab_career' ? 'active' : ''}" onclick="window.app.setDossierModalTab('${master.employeeId}', 'tab_career')" title="المسار الوظيفي والشهادات والتخصص">
            <span class="step-num">2</span>
            <span class="step-icon">💼</span>
            <div class="step-info">
              <span class="step-title">المسار والشهادات</span>
              <span class="step-subtitle">والتخصص والدرجة</span>
            </div>
          </button>

          <!-- Tab 3: بيانات الحساب والدخول -->
          <button type="button" class="dossier-step-tab ${activeSubTab === 'tab_account' ? 'active' : ''}" onclick="window.app.setDossierModalTab('${master.employeeId}', 'tab_account')" title="بيانات الحساب والصلاحيات والدخول">
            <span class="step-num">3</span>
            <span class="step-icon">🔐</span>
            <div class="step-info">
              <span class="step-title">بيانات الحساب</span>
              <span class="step-subtitle">والصلاحيات والدخول</span>
            </div>
          </button>

          <!-- Tab 4: المعلومات الديناميكية -->
          <button type="button" class="dossier-step-tab ${activeSubTab === 'tab_dynamic' ? 'active' : ''}" onclick="window.app.setDossierModalTab('${master.employeeId}', 'tab_dynamic')" title="الحقول والمعلومات الديناميكية الإضافية">
            <span class="step-num">4</span>
            <span class="step-icon">🧩</span>
            <div class="step-info">
              <span class="step-title">المعلومات الديناميكية</span>
              <span class="step-subtitle">(${Object.keys(master.dynamicValues || {}).length} حقول إضافية)</span>
            </div>
          </button>

          <!-- Tab 5: معلومات الشعبة والانتقالات -->
          <button type="button" class="dossier-step-tab ${activeSubTab === 'tab_section' ? 'active' : ''}" onclick="window.app.setDossierModalTab('${master.employeeId}', 'tab_section')" title="معلومات الشعبة وتاريخ الانتقالات">
            <span class="step-num">5</span>
            <span class="step-icon">🏢</span>
            <div class="step-info">
              <span class="step-title">معلومات الشعبة</span>
              <span class="step-subtitle">والانتقالات والملاحظات</span>
            </div>
          </button>

        </div>

        <!-- Tab 1: Civil & Personal Data -->
        ${activeSubTab === 'tab_basic' ? `
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1rem;">
            <div class="form-group">
              <label class="form-label" style="font-size: 0.9rem; font-weight: 800; color: var(--md-sys-color-primary);">الاسم الرباعي واللقب:</label>
              <input type="text" class="form-control" value="${master.fullName || ''}" readonly style="background: var(--md-sys-color-surface-variant); font-size: 0.95rem; font-weight: 700; padding: 0.6rem 0.85rem;">
            </div>
            <div class="form-group">
              <label class="form-label" style="font-size: 0.9rem; font-weight: 800; color: var(--md-sys-color-primary);">اسم الأم الثلاثي:</label>
              <input type="text" class="form-control" value="${master.motherName || 'غير مسجل'}" readonly style="background: var(--md-sys-color-surface-variant); font-size: 0.95rem; font-weight: 600; padding: 0.6rem 0.85rem;">
            </div>
            <div class="form-group">
              <label class="form-label" style="font-size: 0.9rem; font-weight: 800; color: var(--md-sys-color-primary);">اسم الأب والجد:</label>
              <input type="text" class="form-control" value="${(master.fatherName || '') + ' ' + (master.grandfatherName || '')}" readonly style="background: var(--md-sys-color-surface-variant); font-size: 0.95rem; font-weight: 600; padding: 0.6rem 0.85rem;">
            </div>
            <div class="form-group">
              <label class="form-label" style="font-size: 0.9rem; font-weight: 800; color: var(--md-sys-color-primary);">تاريخ ومحل الولادة:</label>
              <input type="text" class="form-control" value="${(master.birthDate || '') + ' - ' + (master.birthPlace || '')}" readonly style="background: var(--md-sys-color-surface-variant); font-size: 0.95rem; font-weight: 600; padding: 0.6rem 0.85rem;">
            </div>
            <div class="form-group">
              <label class="form-label" style="font-size: 0.9rem; font-weight: 800; color: var(--md-sys-color-primary);">رقم الهاتف الشخصي:</label>
              <input type="text" class="form-control" value="${master.phone || 'غير مسجل'}" readonly style="background: var(--md-sys-color-surface-variant); font-size: 0.95rem; font-weight: 700; padding: 0.6rem 0.85rem; direction: ltr; text-align: right;">
            </div>
            <div class="form-group">
              <label class="form-label" style="font-size: 0.9rem; font-weight: 800; color: var(--md-sys-color-primary);">البريد الإلكتروني المعتمد:</label>
              <input type="text" class="form-control" value="${master.emailOfficial || master.emailPersonal || 'غير مسجل'}" readonly style="background: var(--md-sys-color-surface-variant); font-size: 0.95rem; font-weight: 600; padding: 0.6rem 0.85rem; direction: ltr; text-align: right;">
            </div>
            <div class="form-group">
              <label class="form-label" style="font-size: 0.9rem; font-weight: 800; color: var(--md-sys-color-primary);">رقم البطاقة الوطنية الموحدة:</label>
              <input type="text" class="form-control" value="${canViewSensitive ? (master.unifiedCardNumber || 'غير مسجل') : '••••••••••••'}" readonly style="background: var(--md-sys-color-surface-variant); font-size: 0.95rem; font-weight: 600; padding: 0.6rem 0.85rem;">
            </div>
            <div class="form-group">
              <label class="form-label" style="font-size: 0.9rem; font-weight: 800; color: var(--md-sys-color-primary);">رقم جواز السفر:</label>
              <input type="text" class="form-control" value="${canViewSensitive ? (master.passportNumber || 'غير مسجل') : '••••••••'}" readonly style="background: var(--md-sys-color-surface-variant); font-size: 0.95rem; font-weight: 600; padding: 0.6rem 0.85rem;">
            </div>
            <div class="form-group">
              <label class="form-label" style="font-size: 0.9rem; font-weight: 800; color: var(--md-sys-color-primary);">رقم بطاقة السكن والمحافظة:</label>
              <input type="text" class="form-control" value="${canViewSensitive ? (master.residenceCardNumber || 'غير مسجل') : '••••••••'}" readonly style="background: var(--md-sys-color-surface-variant); font-size: 0.95rem; font-weight: 600; padding: 0.6rem 0.85rem;">
            </div>
            <div class="form-group">
              <label class="form-label" style="font-size: 0.9rem; font-weight: 800; color: var(--md-sys-color-primary);">رقم البطاقة التموينية:</label>
              <input type="text" class="form-control" value="${canViewSensitive ? (master.rationCardNumber || 'غير مسجل') : '••••••••'}" readonly style="background: var(--md-sys-color-surface-variant); font-size: 0.95rem; font-weight: 600; padding: 0.6rem 0.85rem;">
            </div>
            <div class="form-group">
              <label class="form-label" style="font-size: 0.9rem; font-weight: 800; color: var(--md-sys-color-primary);">رقم جواز السلامة المهنية (HSE):</label>
              <input type="text" class="form-control" value="${master.safetyPassportNumber || 'غير مسجل'}" readonly style="background: var(--md-sys-color-surface-variant); font-size: 0.95rem; font-weight: 600; padding: 0.6rem 0.85rem;">
            </div>
            <div class="form-group">
              <label class="form-label" style="font-size: 0.9rem; font-weight: 800; color: var(--md-sys-color-primary);">نوع الدوام والنوبة التشغيلية:</label>
              <input type="text" class="form-control" value="${master.workShift === 'مناوب' ? ('مناوب (نوبة ' + (master.assignedShift || master.shift || 'A') + ')') : (master.workShift || 'صباحي')}" readonly style="background: var(--md-sys-color-surface-variant); font-weight: 800; font-size: 0.95rem; padding: 0.6rem 0.85rem; color: var(--md-sys-color-primary);">
            </div>
          </div>
        ` : ''}

        <!-- Tab 2: Career & Education -->
        ${activeSubTab === 'tab_career' ? `
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1rem;">
            <div class="form-group">
              <label class="form-label" style="font-size: 0.9rem; font-weight: 800; color: var(--md-sys-color-primary);">العنوان الوظيفي:</label>
              <input type="text" class="form-control" value="${master.jobTitle || 'موظف'}" readonly style="background: var(--md-sys-color-surface-variant); font-weight: 800; font-size: 0.95rem; padding: 0.6rem 0.85rem;">
            </div>
            <div class="form-group">
              <label class="form-label" style="font-size: 0.9rem; font-weight: 800; color: var(--md-sys-color-primary);">الدرجة والمرحلة الوظيفية:</label>
              <input type="text" class="form-control" value="${(master.jobGrade || 'الخامسة') + ' / ' + (master.jobStage || 'الأولى')}" readonly style="background: var(--md-sys-color-surface-variant); font-size: 0.95rem; font-weight: 700; padding: 0.6rem 0.85rem;">
            </div>
            <div class="form-group">
              <label class="form-label" style="font-size: 0.9rem; font-weight: 800; color: var(--md-sys-color-primary);">الشهادة والتخصص الدقيق:</label>
              <input type="text" class="form-control" value="${(master.degree || 'بكالوريوس') + ' - ' + (master.specialization || 'عام')}" readonly style="background: var(--md-sys-color-surface-variant); font-size: 0.95rem; font-weight: 700; padding: 0.6rem 0.85rem;">
            </div>
            <div class="form-group">
              <label class="form-label" style="font-size: 0.9rem; font-weight: 800; color: var(--md-sys-color-primary);">الجامعة / الكلية وسنة التخرج:</label>
              <input type="text" class="form-control" value="${(master.university || 'جامعة البصرة') + ' (' + (master.graduationYear || '2012') + ')'}" readonly style="background: var(--md-sys-color-surface-variant); font-size: 0.95rem; font-weight: 600; padding: 0.6rem 0.85rem;">
            </div>
            <div class="form-group">
              <label class="form-label" style="font-size: 0.9rem; font-weight: 800; color: var(--md-sys-color-primary);">تاريخ التعيين والمباشرة الرسمية:</label>
              <input type="text" class="form-control" value="${master.hireDate || '2015-01-01'}" readonly style="background: var(--md-sys-color-surface-variant); font-size: 0.95rem; font-weight: 700; padding: 0.6rem 0.85rem;">
            </div>
            <div class="form-group">
              <label class="form-label" style="font-size: 0.9rem; font-weight: 800; color: var(--md-sys-color-primary);">تاريخ الانضمام لقسم الإنتاج الجنوبي:</label>
              <input type="text" class="form-control" value="${master.deptJoinDate || '2018-01-01'}" readonly style="background: var(--md-sys-color-surface-variant); font-size: 0.95rem; font-weight: 700; padding: 0.6rem 0.85rem;">
            </div>
            <div class="form-group">
              <label class="form-label" style="font-size: 0.9rem; font-weight: 800; color: var(--md-sys-color-primary);">عدد كتب الشكر والتقدير:</label>
              <input type="text" class="form-control" value="${master.thanksLettersCount || 0} كتاب رسمي" readonly style="background: var(--md-sys-color-surface-variant); font-size: 0.95rem; font-weight: 800; padding: 0.6rem 0.85rem; color: #d97706;">
            </div>
            <div class="form-group">
              <label class="form-label" style="font-size: 0.9rem; font-weight: 800; color: var(--md-sys-color-primary);">نوع الدوام والنوبة التشغيلية:</label>
              <input type="text" class="form-control" value="${master.workShift === 'مناوب' ? ('مناوب (نوبة ' + (master.assignedShift || master.shift || 'A') + ')') : (master.workShift || 'صباحي')}" readonly style="background: var(--md-sys-color-surface-variant); font-weight: 800; font-size: 0.95rem; padding: 0.6rem 0.85rem;">
            </div>
          </div>
        ` : ''}

        <!-- Tab 3: Account & Login Data -->
        ${activeSubTab === 'tab_account' ? `
          <div style="background: var(--md-sys-color-surface-variant); padding: 1.5rem; border-radius: var(--radius-md); border: 1px solid rgba(11, 87, 208, 0.15);">
            ${linkedUser ? `
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1rem; margin-bottom: 1.5rem;">
                <div style="background: var(--md-sys-color-surface); padding: 1rem; border-radius: var(--radius-sm); border: 1px solid rgba(0,0,0,0.06);">
                  <div style="font-size: 0.82rem; color: var(--md-sys-color-outline); margin-bottom: 4px;">معرف الحساب (User ID):</div>
                  <code style="font-size: 0.95rem; font-weight: 800;">${linkedUser.id}</code>
                </div>
                <div style="background: var(--md-sys-color-surface); padding: 1rem; border-radius: var(--radius-sm); border: 1px solid rgba(0,0,0,0.06);">
                  <div style="font-size: 0.82rem; color: var(--md-sys-color-outline); margin-bottom: 4px;">بريد تسجيل الدخول:</div>
                  <strong style="font-size: 0.95rem; color: var(--md-sys-color-primary);">${linkedUser.email}</strong>
                </div>
                <div style="background: var(--md-sys-color-surface); padding: 1rem; border-radius: var(--radius-sm); border: 1px solid rgba(0,0,0,0.06);">
                  <div style="font-size: 0.82rem; color: var(--md-sys-color-outline); margin-bottom: 4px;">الدور الإداري والصلاحيات:</div>
                  <span class="badge ${roleInfo.badgeClass}" style="font-size: 0.88rem; font-weight: 800;">${roleInfo.name}</span>
                </div>
                <div style="background: var(--md-sys-color-surface); padding: 1rem; border-radius: var(--radius-sm); border: 1px solid rgba(0,0,0,0.06);">
                  <div style="font-size: 0.82rem; color: var(--md-sys-color-outline); margin-bottom: 4px;">حالة الحساب المعتمدة:</div>
                  <span class="badge badge-success" style="font-size: 0.88rem; font-weight: 800;">🟢 ${linkedUser.status}</span>
                </div>
              </div>

              <div style="border-top: 1px solid rgba(0,0,0,0.1); padding-top: 1rem; display: flex; gap: 0.65rem; flex-wrap: wrap;">
                ${window.rbac.canManageTargetUser(actorUser, linkedUser) ? `
                  <button class="btn btn-sm btn-glass-primary" onclick="window.app.openResetUserPasswordModal('${linkedUser.id}')">
                    🔑 إعادة تعيين كلمة السر
                  </button>
                  <button class="btn btn-sm btn-glass-amber" onclick="window.app.openEditUserRoleAndPermissionsModal('${linkedUser.id}')">
                    🛡️ تعديل الصلاحيات والنطاق
                  </button>
                  <button class="btn btn-sm btn-danger" onclick="window.app.handleToggleUserStatus('${linkedUser.id}', '${linkedUser.status === 'SUSPENDED' ? 'APPROVED' : 'SUSPENDED'}')">
                    ${linkedUser.status === 'SUSPENDED' ? 'إلغاء التجميد' : '⏸️ تجميد الحساب'}
                  </button>
                ` : ''}
              </div>
            ` : `
              <div style="text-align: center; padding: 2rem 1rem;">
                <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">👤</div>
                <div style="font-weight: 800; font-size: 1.1rem; margin-bottom: 0.35rem; color: var(--md-sys-color-on-surface);">لا يوجد حساب مستخدم مسجل لهذا الموظف حتى الآن</div>
                <p style="font-size: 0.9rem; color: var(--md-sys-color-outline); max-width: 450px; margin: 0 auto 1.25rem;">
                  الموظف معتمد في السجل الأصلي للموارد البشرية. يمكنه التسجيل في أي وقت باستخدام رقمه الوظيفي (<code>${master.employeeId}</code>).
                </p>
                ${['DEPT_MANAGER', 'SUPER_ADMIN'].includes(actorUser.role) ? `
                  <button class="btn btn-glass-primary" onclick="window.app.openRegisterModal('${master.employeeId}', '${master.fullName}', '${master.emailOfficial || master.emailPersonal || ''}')">
                    + إنشاء وتفعيل حساب مستخدم له الآن
                  </button>
                ` : ''}
              </div>
            `}
          </div>
        ` : ''}

        <!-- Tab 4: Dynamic Fields Management -->
        ${activeSubTab === 'tab_dynamic' ? `
          <div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; flex-wrap: wrap; gap: 0.5rem;">
              <h5 style="margin: 0; font-weight: 800; font-size: 1.1rem; color: var(--md-sys-color-primary);">
                🧩 المعلومات الإضافية والحقول الديناميكية المسجلة
              </h5>
              ${canAddInfo ? `
                <button class="btn btn-glass-primary btn-sm" onclick="window.app.openAddDynamicValueModal('${master.employeeId}')">
                  + إضافة / تعديل معلومة ديناميكية
                </button>
              ` : ''}
            </div>

            <div style="display: grid; gap: 0.85rem;">
              ${dynamicFields.map(f => {
                const valObj = master.dynamicValues ? master.dynamicValues[f.key] : null;
                const val = valObj ? valObj.value : null;

                return `
                  <div style="background: var(--md-sys-color-surface-variant); padding: 1rem 1.25rem; border-radius: var(--radius-md); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem; border: 1px solid rgba(0,0,0,0.05);">
                    <div>
                      <div style="font-weight: 800; font-size: 0.95rem; color: var(--md-sys-color-on-surface);">${f.name}</div>
                      <div style="font-size: 0.78rem; color: var(--md-sys-color-outline); margin-top: 2px;">
                        النطاق: <code>${f.scope}</code> | النوع: ${getFieldTypeLabel(f.type)}
                      </div>
                    </div>
                    <div style="text-align: left;">
                      <div style="font-weight: 800; color: var(--md-sys-color-primary); font-size: 1rem;">
                        ${val ? val : '<span style="color: var(--md-sys-color-outline); font-size: 0.85rem; font-weight: 400;">لم تسجل قيمة بعد</span>'}
                      </div>
                      ${valObj && valObj.updatedBy ? `
                        <div style="font-size: 0.75rem; color: var(--md-sys-color-outline); font-family: monospace; margin-top: 2px;">
                          حُدث بواسطة: ${valObj.updatedBy} (${new Date(valObj.updatedAt).toLocaleDateString('en-GB')})
                        </div>
                      ` : ''}
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        ` : ''}

        <!-- Tab 5: Section Specific & Transfer History -->
        ${activeSubTab === 'tab_section' ? `
          <div>
            <!-- Section Specific Notes -->
            <div style="background: var(--md-sys-color-surface-variant); padding: 1.25rem 1.5rem; border-radius: var(--radius-md); margin-bottom: 1.5rem; border: 1.5px solid rgba(11, 87, 208, 0.15);">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; flex-wrap: wrap; gap: 0.5rem;">
                <h5 style="margin: 0; font-weight: 800; font-size: 1.1rem; color: var(--md-sys-color-primary);">
                  🏢 معلومات وملاحظات خاصة بالشعبة (${scopeName})
                </h5>
                ${canAddInfo ? `
                  <button class="btn btn-sm btn-glass-primary" onclick="window.app.openSectionNotesModal('${master.employeeId}', '${master.sectionId}')">
                    ✏️ تعديل ملاحظات الشعبة
                  </button>
                ` : ''}
              </div>
              <div style="font-size: 0.95rem; line-height: 1.7; color: var(--md-sys-color-on-surface); background: var(--md-sys-color-surface); padding: 0.85rem 1rem; border-radius: var(--radius-sm); border: 1px solid rgba(0,0,0,0.06);">
                ${master.sectionNotes ? master.sectionNotes : 'لا توجد ملاحظات أو تكليفات داخلية مخصصة للشعبة حالياً.'}
              </div>
            </div>

            <!-- Transfer History Timeline -->
            <h5 style="font-weight: 800; font-size: 1.1rem; color: var(--md-sys-color-primary); margin: 1.25rem 0 0.65rem 0;">
              🕒 سجل تاريخ الانتقال بين الشعب والوحدات
            </h5>
            <div style="border: 1px solid var(--md-sys-color-surface-variant); border-radius: var(--radius-md); overflow-x: auto;">
              <table class="data-table" style="font-size: 0.88rem;">
                <thead>
                  <tr>
                    <th>التاريخ</th>
                    <th>من جهة</th>
                    <th>إلى جهة</th>
                    <th>المسؤول المنفذ</th>
                    <th>الأمر والملاحظات</th>
                  </tr>
                </thead>
                <tbody>
                  ${(master.transferHistory || []).map(tr => `
                    <tr>
                      <td><span style="font-family: monospace; font-weight: 700;">${tr.date}</span></td>
                      <td>${tr.fromSectionName || 'التعيين'}</td>
                      <td><strong style="color: var(--md-sys-color-primary);">${tr.toSectionName}</strong></td>
                      <td>${tr.transferredByName || 'الإدارة'}</td>
                      <td>${tr.notes || '-'}</td>
                    </tr>
                  `).join('')}
                  ${(!master.transferHistory || master.transferHistory.length === 0) ? `
                    <tr><td colspan="5" style="text-align: center; color: var(--md-sys-color-outline); padding: 2rem;">لا توجد حركات نقل سابقة مسجلة للموظف.</td></tr>
                  ` : ''}
                </tbody>
              </table>
            </div>

            <div style="margin-top: 1.25rem; text-align: left;">
              ${window.rbac.hasPermission(actorUser, 'TRANSFER_EMPLOYEE') || ['DEPT_MANAGER', 'SUPER_ADMIN'].includes(actorUser.role) ? `
                <button class="btn btn-glass-amber" onclick="window.app.openTransferEmployeeModal('${master.employeeId}')">
                  🔄 نقل الموظف إلى شعبة أخرى
                </button>
              ` : ''}
            </div>
          </div>
        ` : ''}

        <!-- Modal Footer Actions (Glassmorphic Luxury Action Bar) -->
        <div style="margin-top: 1.5rem; border-top: 1px solid var(--md-sys-color-surface-variant); padding-top: 1rem; display: flex; justify-content: space-between; align-items: center; gap: 0.75rem; flex-wrap: nowrap;">
          <div style="font-size: 0.82rem; color: var(--md-sys-color-outline); white-space: nowrap;">
            وزارة النفط | شركة نفط البصرة | هيأة تشغيل الرميلة | قسم الإنتاج الجنوبي
          </div>
          <div style="display: flex; gap: 0.45rem; align-items: center; flex-wrap: nowrap; white-space: nowrap;">
            <button type="button" class="btn btn-glass-emerald" onclick="window.app.openEditUserHRDataModal('${linkedUser ? linkedUser.id : ''}')" title="تعديل وتعبئة بيانات الموظف" style="white-space: nowrap; padding: 0.45rem 0.85rem; font-size: 0.86rem;">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
              <span>تعديل</span>
              <span style="font-size: 0.95rem;">✏️</span>
            </button>
            <button type="button" class="btn btn-glass-amber" onclick="window.app.printEmployeeMasterDossier('${master.employeeId}')" title="تصدير وطباعة ملف الإضبارة الشاملة لجميع بيانات المنتسب متسلسلة (PDF)" style="white-space: nowrap; padding: 0.45rem 0.85rem; font-size: 0.86rem;">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="6 9 6 2 18 2 18 9"></polyline>
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                <rect x="6" y="14" width="12" height="8"></rect>
              </svg>
              <span>طباعة / تصدير PDF</span>
              <span style="font-size: 0.95rem;">🖨️</span>
            </button>
            <button type="button" class="btn btn-glass-primary" onclick="window.app.downloadEmployeeMasterDossierDoc('${master.employeeId}')" title="تنزيل ملف الإضبارة الشامل بصيغة مستند رسمي" style="white-space: nowrap; padding: 0.45rem 0.85rem; font-size: 0.86rem;">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              <span>تنزيل Word (.doc)</span>
              <span style="font-size: 0.95rem;">⬇️</span>
            </button>
            <button type="button" class="btn btn-glass-slate" onclick="window.app.closeModal()" title="إغلاق الإضبارة" style="white-space: nowrap; padding: 0.45rem 0.85rem; font-size: 0.86rem;">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
              <span>إغلاق</span>
            </button>
          </div>
        </div>

      </div>
    `, { size: 'dossier', maxWidth: '1120px' });
  }

  printEmployeeMasterDossier(empId) {
    const actorUser = window.auth.getCurrentUser();
    const master = window.store.getEmployeeMasterRecordByEmployeeId(empId);
    if (!master) {
      alert('سجل الموظف غير متوفر في قاعدة البيانات.');
      return;
    }

    const linkedUser = window.store.getUserByEmployeeId(empId);
    const sections = window.store.getSections(actorUser.departmentId);
    const units = window.store.getUnits(actorUser.departmentId);
    const stations = window.store.getStations(actorUser.departmentId);
    const dynamicFields = window.store.getDynamicEmployeeFields(actorUser.departmentId);

    const sec = sections.find(s => s.id === master.sectionId);
    const un = units.find(u => u.id === master.unitId);
    const st = stations.find(station => station.id === master.stationId);
    const roleInfo = window.rbac.getRoleInfo(linkedUser ? linkedUser.role : 'EMPLOYEE');

    const printDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const printTime = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

    const customFieldsHtml = dynamicFields.length > 0 ? `
      <div class="dossier-print-section">
        <div class="section-title">📌 القسم الخامس (5): البيانات والحقول الإضافية المخصصة</div>
        <table class="dossier-print-table">
          <tbody>
            ${dynamicFields.map(f => {
              const val = (master.customFields && master.customFields[f.id]) || master[f.id] || 'غير محدد';
              return `
                <tr>
                  <td class="cell-label" style="width: 35%;">${f.name}:</td>
                  <td class="cell-value" style="width: 65%;"><strong>${val}</strong></td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    ` : '';

    const html = `
      <html lang="ar" dir="rtl">
        <head>
          <meta charset="utf-8">
          <title>إضبارة_الموظف_${master.fullName.replace(/\\s+/g, '_')}_${master.employeeId} - PDF</title>
          <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap" rel="stylesheet">
          <style>
            @page {
              size: A4;
              margin: 12mm 15mm 12mm 15mm;
            }
            body {
              font-family: 'Cairo', 'Segoe UI', Tahoma, sans-serif;
              color: #1e293b;
              background: #fff;
              margin: 0;
              padding: 10px;
              direction: rtl;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .dossier-header {
              border-bottom: 2.5px solid #003366;
              padding-bottom: 10px;
              margin-bottom: 14px;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .header-text h2 {
              margin: 0;
              font-size: 1.2rem;
              font-weight: 900;
              color: #003366;
            }
            .header-text h3 {
              margin: 3px 0 0 0;
              font-size: 0.92rem;
              font-weight: 700;
              color: #475569;
            }
            .header-meta {
              text-align: left;
              font-size: 0.82rem;
              color: #334155;
              border: 1px solid #cbd5e1;
              padding: 5px 10px;
              border-radius: 6px;
              background: #f8fafc;
            }
            .dossier-banner {
              background: linear-gradient(135deg, #003366 0%, #0284c7 100%);
              color: #ffffff;
              padding: 12px 16px;
              border-radius: 8px;
              margin-bottom: 14px;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .dossier-banner h1 {
              margin: 0;
              font-size: 1.3rem;
              font-weight: 900;
            }
            .dossier-banner .banner-sub {
              font-size: 0.86rem;
              opacity: 0.95;
              margin-top: 3px;
            }
            .badge-code {
              background: rgba(255,255,255,0.22);
              border: 1px solid rgba(255,255,255,0.4);
              padding: 4px 10px;
              border-radius: 6px;
              font-family: monospace;
              font-weight: 800;
              font-size: 0.95rem;
            }
            .dossier-print-section {
              margin-bottom: 12px;
              page-break-inside: avoid;
            }
            .section-title {
              font-size: 0.94rem;
              font-weight: 800;
              color: #003366;
              background: #f1f5f9;
              border-right: 4.5px solid #003366;
              padding: 5px 10px;
              margin-bottom: 6px;
              border-radius: 0 4px 4px 0;
            }
            .dossier-print-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 4px;
              font-size: 0.84rem;
            }
            .dossier-print-table td {
              padding: 5px 8px;
              border: 1px solid #e2e8f0;
              vertical-align: middle;
            }
            .cell-label {
              background: #f8fafc;
              color: #475569;
              font-weight: 700;
              width: 22%;
            }
            .cell-value {
              color: #0f172a;
              width: 28%;
            }
            .dossier-footer-signatures {
              margin-top: 20px;
              border-top: 1.5px solid #cbd5e1;
              padding-top: 14px;
              display: grid;
              grid-template-columns: 1fr 1fr 1fr;
              gap: 12px;
              text-align: center;
              font-size: 0.82rem;
              page-break-inside: avoid;
            }
            .sig-box {
              border: 1px dashed #cbd5e1;
              border-radius: 6px;
              padding: 8px 6px;
              background: #fafafa;
            }
            .sig-title {
              font-weight: 800;
              color: #003366;
              margin-bottom: 28px;
            }
            .barcode-line {
              font-family: monospace;
              font-size: 0.72rem;
              color: #64748b;
              margin-top: 10px;
              text-align: center;
            }
            @media print {
              .no-print { display: none !important; }
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          
          <!-- Official Letterhead -->
          <div class="dossier-header">
            <div class="header-text">
              <div style="font-size: 1.25rem; font-weight: 900; color: #003366; margin-bottom: 2px;">جمهورية العراق - وزارة النفط</div>
              <div style="font-size: 1.12rem; font-weight: 800; color: #004d40; margin-bottom: 2px;">شركة نفط البصرة</div>
              <div style="font-size: 1.02rem; font-weight: 800; color: #b45309; margin-bottom: 2px;">هيأة تشغيل الرميلة</div>
              <div style="font-size: 0.95rem; font-weight: 800; color: #0f172a;">
                قسم الإنتاج الجنوبي
                ${sec ? `<span style="color: #0284c7;"> | ${sec.name}</span>` : ''}
                ${st ? `<span style="color: #16a34a;"> | ${st.name}</span>` : (un ? `<span style="color: #16a34a;"> | ${un.name}</span>` : '')}
              </div>
            </div>
            <div class="header-meta">
              <div><strong>رقم الإضبارة:</strong> <code>DOS-${master.employeeId}</code></div>
              <div><strong>تاريخ الإصدار:</strong> ${printDate}</div>
              <div><strong>وقت الطباعة:</strong> ${printTime}</div>
            </div>
          </div>

          <!-- Banner Identity -->
          <div class="dossier-banner">
            <div>
              <h1>إضبارة الموظف الرسمية الموحدة (HR Master Record)</h1>
              <div class="banner-sub">الاسم: <strong>${master.fullName}</strong> | ${master.jobTitle || 'موظف تشغيل'}</div>
            </div>
            <div>
              <span class="badge-code">${master.employeeId}</span>
            </div>
          </div>

          <!-- 1. البيانات الشخصية والرسمية -->
          <div class="dossier-print-section">
            <div class="section-title">📌 القسم الأول (1): البيانات الشخصية والرسمية</div>
            <table class="dossier-print-table">
              <tbody>
                <tr>
                  <td class="cell-label">الاسم الرباعي واللقب:</td>
                  <td class="cell-value" colspan="3"><strong>${master.fullName}</strong></td>
                </tr>
                <tr>
                  <td class="cell-label">الرقم الوظيفي:</td>
                  <td class="cell-value"><code><strong>${master.employeeId}</strong></code></td>
                  <td class="cell-label">الرقم الإحصائي:</td>
                  <td class="cell-value">${master.nationalId || master.statisticalId || 'متطابق'}</td>
                </tr>
                <tr>
                  <td class="cell-label">تاريخ الولادة والمواليد:</td>
                  <td class="cell-value">${master.birthDate || 'غير محدد'} (${master.birthYear || '1988'})</td>
                  <td class="cell-label">محل السكن والمحافظة:</td>
                  <td class="cell-value">${master.address || master.residence || 'البصرة'}</td>
                </tr>
                <tr>
                  <td class="cell-label">رقم الهاتف:</td>
                  <td class="cell-value" style="direction: ltr; text-align: right;">${master.phone || master.mobile || 'غير مسجل'}</td>
                  <td class="cell-label">البريد الإلكتروني:</td>
                  <td class="cell-value" style="direction: ltr; text-align: right;">${master.email || (linkedUser ? linkedUser.email : 'غير مسجل')}</td>
                </tr>
                <tr>
                  <td class="cell-label">الحالة الاجتماعية:</td>
                  <td class="cell-value">${master.maritalStatus || 'متزوج'} (الأطفال: ${master.childrenCount || 0})</td>
                  <td class="cell-label">فصيلة الدم:</td>
                  <td class="cell-value"><strong>${master.bloodType || 'O+'}</strong></td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- 2. المسار المهني والشهادات الأكاديمية -->
          <div class="dossier-print-section">
            <div class="section-title">📌 القسم الثاني (2): المسار المهني والشهادات الأكاديمية</div>
            <table class="dossier-print-table">
              <tbody>
                <tr>
                  <td class="cell-label">العنوان الوظيفي:</td>
                  <td class="cell-value"><strong>${master.jobTitle || 'موظف'}</strong></td>
                  <td class="cell-label">الدرجة والمرحلة:</td>
                  <td class="cell-value"><strong>${(master.jobGrade || 'الخامسة') + ' / ' + (master.jobStage || 'الأولى')}</strong></td>
                </tr>
                <tr>
                  <td class="cell-label">الشهادة والتخصص:</td>
                  <td class="cell-value"><strong>${(master.degree || 'بكالوريوس') + ' - ' + (master.specialization || 'هندسة نفط')}</strong></td>
                  <td class="cell-label">الجامعة / الكلية والتخرج:</td>
                  <td class="cell-value">${(master.university || 'جامعة البصرة') + ' (' + (master.graduationYear || '2012') + ')'}</td>
                </tr>
                <tr>
                  <td class="cell-label">تاريخ التعيين والمباشرة:</td>
                  <td class="cell-value">${master.hireDate || '2015-01-01'}</td>
                  <td class="cell-label">تاريخ الانضمام للقسم:</td>
                  <td class="cell-value">${master.deptJoinDate || '2018-01-01'}</td>
                </tr>
                <tr>
                  <td class="cell-label">كتب الشكر والتقدير:</td>
                  <td class="cell-value"><strong>${master.thanksLettersCount || 0} كتاب رسمي</strong></td>
                  <td class="cell-label">العقوبات والانضباط:</td>
                  <td class="cell-value">${master.penaltiesCount ? master.penaltiesCount + ' عقوبة' : 'سجل ناصع (لا يوجد)'}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- 3. بيانات الحساب والارتباط الإداري -->
          <div class="dossier-print-section">
            <div class="section-title">📌 القسم الثالث (3): بيانات الارتباط الإداري وحساب النظام</div>
            <table class="dossier-print-table">
              <tbody>
                <tr>
                  <td class="cell-label">جهة الارتباط (الشعبة):</td>
                  <td class="cell-value"><strong>${sec ? sec.name : 'إدارة القسم'}</strong></td>
                  <td class="cell-label">الوحدة / المحطة التابعة:</td>
                  <td class="cell-value">${un ? un.name : (st ? st.name : 'الموقع المركزي')}</td>
                </tr>
                <tr>
                  <td class="cell-label">اسم المستخدم بالنظام:</td>
                  <td class="cell-value"><code>${linkedUser ? linkedUser.username : master.employeeId}</code></td>
                  <td class="cell-label">الدور الوظيفي والصلاحيات:</td>
                  <td class="cell-value"><strong>${roleInfo.title}</strong></td>
                </tr>
                <tr>
                  <td class="cell-label">حالة الحساب والسجل:</td>
                  <td class="cell-value" colspan="3"><span style="color: #15803d; font-weight: 800;">● معتمد ومفعل رسمياً في قاعدة بيانات القسم</span></td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- 4. الدورات التدريبية والتطويرية -->
          <div class="dossier-print-section">
            <div class="section-title">📌 القسم الرابع (4): الدورات التدريبية والتطوير المهني</div>
            <table class="dossier-print-table">
              <tbody>
                <tr>
                  <td class="cell-label" style="width: 25%;">الدورات الفنية والتشغيلية:</td>
                  <td class="cell-value" colspan="3">${master.technicalCourses || 'دورات السلامة المهنية، السيطرة على الآبار، والتحكم بالصمامات والمضخات'}</td>
                </tr>
                <tr>
                  <td class="cell-label" style="width: 25%;">الدورات الإدارية وتطوير المهارات:</td>
                  <td class="cell-value" colspan="3">${master.adminCourses || 'إدارة المخاطر والسلامة البيئية، نظام الأرشفة والتقارير اليومية'}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- 5. الحقول الديناميكية الإضافية -->
          ${customFieldsHtml}

          <!-- Official Signatures & Seal -->
          <div class="dossier-footer-signatures">
            <div class="sig-box">
              <div class="sig-title">مسؤول الموارد البشرية والإدارة</div>
              <div>التوقيع: __________________</div>
            </div>
            <div class="sig-box">
              <div class="sig-title">مسؤول الشعبة / الوحدة</div>
              <div>التوقيع: __________________</div>
            </div>
            <div class="sig-box">
              <div class="sig-title">مصادقة مدير قسم الإنتاج الجنوبي</div>
              <div>التوقيع والختم: ____________</div>
            </div>
          </div>

          <div class="barcode-line">
            وثيقة رسمية مشفرة صادرة من المنظومة الرقمية لقسم الإنتاج الجنوبي - كود التحقق: <code>SEC-BOC-HR-${master.employeeId}-2026</code>
          </div>

          <script>
            window.onload = () => {
              window.print();
            };
          </script>
        </body>
      </html>
    `;

    const printWin = window.open('', '_blank');
    if (printWin) {
      printWin.document.open();
      printWin.document.write(html);
      printWin.document.close();
    } else {
      alert('يرجى السماح بالنوافذ المنبثقة لطباعة وتنزيل الإضبارة بصيغة PDF.');
    }
  }

  downloadEmployeeMasterDossierDoc(empId) {
    const actorUser = window.auth.getCurrentUser();
    const master = window.store.getEmployeeMasterRecordByEmployeeId(empId);
    if (!master) {
      alert('سجل الموظف غير متوفر.');
      return;
    }

    const linkedUser = window.store.getUserByEmployeeId(empId);
    const sections = window.store.getSections(actorUser.departmentId);
    const units = window.store.getUnits(actorUser.departmentId);
    const stations = window.store.getStations(actorUser.departmentId);
    const dynamicFields = window.store.getDynamicEmployeeFields(actorUser.departmentId);

    const sec = sections.find(s => s.id === master.sectionId);
    const un = units.find(u => u.id === master.unitId);
    const st = stations.find(station => station.id === master.stationId);
    const roleInfo = window.rbac.getRoleInfo(linkedUser ? linkedUser.role : 'EMPLOYEE');
    const printDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    let docHtml = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head>
          <meta charset='utf-8'>
          <title>إضبارة_${master.fullName}</title>
          <style>
            body { font-family: 'Arial', sans-serif; direction: rtl; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
            td, th { border: 1px solid #999; padding: 8px; text-align: right; }
            th { background-color: #f2f2f2; font-weight: bold; }
            .header-title { font-size: 16pt; font-weight: bold; color: #003366; text-align: center; margin-bottom: 5px; }
            .sub-title { font-size: 12pt; text-align: center; color: #555; margin-bottom: 20px; }
            .section-header { background-color: #003366; color: white; padding: 6px 10px; font-weight: bold; margin-top: 15px; margin-bottom: 8px; }
          </style>
        </head>
        <body>
          <div class="header-title">جمهورية العراق - وزارة النفط - شركة نفط البصرة</div>
          <div class="sub-title" style="font-size: 13pt; font-weight: bold; color: #004d40; margin-bottom: 20px;">
            هيأة تشغيل الرميلة - قسم الإنتاج الجنوبي ${sec ? ' | ' + sec.name : ''} ${st ? ' | ' + st.name : (un ? ' | ' + un.name : '')}
          </div>
          
          <div class="section-header">1. البيانات الشخصية والرسمية</div>
          <table>
            <tr><th>الاسم الرباعي واللقب</th><td colspan="3"><b>${master.fullName}</b></td></tr>
            <tr><th>الرقم الوظيفي</th><td><b>${master.employeeId}</b></td><th>الرقم الإحصائي</th><td>${master.nationalId || master.statisticalId || 'متطابق'}</td></tr>
            <tr><th>تاريخ الولادة</th><td>${master.birthDate || '1988'}</td><th>محل السكن</th><td>${master.address || master.residence || 'البصرة'}</td></tr>
            <tr><th>رقم الهاتف</th><td>${master.phone || master.mobile || 'غير مسجل'}</td><th>البريد الإلكتروني</th><td>${master.email || (linkedUser ? linkedUser.email : 'غير مسجل')}</td></tr>
            <tr><th>الحالة الاجتماعية</th><td>${master.maritalStatus || 'متزوج'}</td><th>فصيلة الدم</th><td><b>${master.bloodType || 'O+'}</b></td></tr>
          </table>

          <div class="section-header">2. المسار المهني والشهادات الأكاديمية</div>
          <table>
            <tr><th>العنوان الوظيفي</th><td><b>${master.jobTitle || 'موظف'}</b></td><th>الدرجة والمرحلة</th><td><b>${(master.jobGrade || 'الخامسة') + ' / ' + (master.jobStage || 'الأولى')}</b></td></tr>
            <tr><th>الشهادة والتخصص</th><td><b>${(master.degree || 'بكالوريوس') + ' - ' + (master.specialization || 'عام')}</b></td><th>الجامعة وسنة التخرج</th><td>${(master.university || 'جامعة البصرة') + ' (' + (master.graduationYear || '2012') + ')'}</td></tr>
            <tr><th>تاريخ التعيين</th><td>${master.hireDate || '2015-01-01'}</td><th>تاريخ الانضمام للقسم</th><td>${master.deptJoinDate || '2018-01-01'}</td></tr>
            <tr><th>كتب الشكر والتقدير</th><td><b>${master.thanksLettersCount || 0} كتاب</b></td><th>العقوبات</th><td>${master.penaltiesCount || 0}</td></tr>
          </table>

          <div class="section-header">3. بيانات الحساب والارتباط الإداري</div>
          <table>
            <tr><th>جهة الارتباط (الشعبة)</th><td><b>${sec ? sec.name : 'إدارة القسم'}</b></td><th>الوحدة / المحطة</th><td>${un ? un.name : (st ? st.name : 'الموقع المركزي')}</td></tr>
            <tr><th>اسم المستخدم</th><td>${linkedUser ? linkedUser.username : master.employeeId}</td><th>الدور الوظيفي</th><td><b>${roleInfo.title}</b></td></tr>
          </table>

          <div class="section-header">4. الدورات التدريبية والتطوير المهني</div>
          <table>
            <tr><th>الدورات الفنية</th><td colspan="3">${master.technicalCourses || 'دورات السلامة المهنية، السيطرة على الآبار، والتحكم بالصمامات'}</td></tr>
            <tr><th>الدورات الإدارية</th><td colspan="3">${master.adminCourses || 'إدارة المخاطر والسلامة البيئية، نظام الأرشفة والتقارير'}</td></tr>
          </table>

          <p style="text-align: left; margin-top: 30px; font-size: 10pt; color: #777;">
            تاريخ التصدير: ${printDate} | كود التحقق: DOC-HR-${master.employeeId}-2026
          </p>
        </body>
      </html>
    `;

    const blob = new Blob(['\ufeff', docHtml], { type: 'application/msword;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `اضبارة_الموظف_${master.fullName.replace(/\\s+/g, '_')}_${master.employeeId}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  setDossierModalTab(empId, tabKey) {
    this.currentDossierSubTab = tabKey;
    this.openMasterDossierModal(empId);
  }

  // --- Dynamic Custom Staff Data Export & Print Tool (أداة التصدير والطباعة المخصصة لبيانات كادر القسم) ---
  openCustomStaffExportModal(options = {}) {
    const actorUser = window.auth.getCurrentUser();
    const deptId = actorUser ? actorUser.departmentId : 'dept-south-prod';
    const staff = window.store.getUnifiedEmployeeRoster(actorUser) || [];
    const sections = window.store.getSections(deptId) || [];
    const units = window.store.getUnits(deptId) || [];
    const stations = window.store.getDb()?.stations || [];
    const dynamicFields = window.store.getDynamicEmployeeFields(deptId) || [];

    const customPerms = Array.isArray(actorUser.customPermissions) ? actorUser.customPermissions : [];
    const hasGlobal = ['SUPER_ADMIN', 'DEPT_MANAGER', 'DEPUTY_DEPT_MANAGER', 'ADMIN_MANAGER'].includes(actorUser?.role) ||
                      customPerms.includes('SCOPE_ALL_SECTIONS') ||
                      customPerms.includes('SCOPE_ALL_DOSSIERS') ||
                      customPerms.includes('ALL_SECTIONS_UNITS_ACCESS') ||
                      actorUser?.hasGlobalAccess === true;

    let availableSections = sections;
    let availableUnits = units;
    let availableStations = stations;

    if (!hasGlobal) {
      if (actorUser.sectionId) {
        availableSections = sections.filter(s => s.id === actorUser.sectionId);
        availableStations = stations.filter(st => st.sectionId === actorUser.sectionId);
        availableUnits = units.filter(u => u.sectionId === actorUser.sectionId);
        if (!options.sectionId && !options.unitId && !options.stationId) {
          options.sectionId = actorUser.sectionId;
        }
      } else if (actorUser.unitId) {
        availableUnits = units.filter(u => u.id === actorUser.unitId);
        availableSections = [];
        availableStations = stations.filter(st => st.unitId === actorUser.unitId);
        if (!options.sectionId && !options.unitId && !options.stationId) {
          options.unitId = actorUser.unitId;
        }
      }
    }

    let targetScopeInitial = hasGlobal ? 'ALL' : (options.sectionId ? `SECTION:${options.sectionId}` : (options.unitId ? `UNIT:${options.unitId}` : 'ALL'));
    let modalTitleScope = hasGlobal ? 'كافة كادر ومنتسبي القسم' : 'كادر الشعبة / الوحدة المعتمدة';
    
    if (options.unitId) {
      targetScopeInitial = `UNIT:${options.unitId}`;
      const un = units.find(u => u.id === options.unitId);
      if (un) modalTitleScope = `كادر ${un.name}`;
    } else if (options.sectionId) {
      targetScopeInitial = `SECTION:${options.sectionId}`;
      const sec = sections.find(s => s.id === options.sectionId);
      if (sec) modalTitleScope = `كادر ${sec.name}`;
    } else if (options.stationId) {
      targetScopeInitial = `STATION:${options.stationId}`;
      const st = stations.find(s => s.id === options.stationId);
      if (st) modalTitleScope = `كادر ${st.name}`;
    }

    let initialCount = staff.length;
    if (targetScopeInitial.startsWith('SECTION:')) {
      const sId = targetScopeInitial.replace('SECTION:', '');
      initialCount = staff.filter(e => e.sectionId === sId).length;
    } else if (targetScopeInitial.startsWith('UNIT:')) {
      const uId = targetScopeInitial.replace('UNIT:', '');
      const u = units.find(unit => unit.id === uId);
      initialCount = staff.filter(e => e.unitId === uId || (u && u.sectionId && e.sectionId === u.sectionId)).length;
    } else if (targetScopeInitial.startsWith('STATION:')) {
      const stId = targetScopeInitial.replace('STATION:', '');
      initialCount = staff.filter(e => e.stationId === stId).length;
    }

    this.showModal(`📥 أداة التصدير والطباعة المخصصة لبيانات الكادر (${modalTitleScope})`, `
      <div style="direction: rtl; display: flex; flex-direction: column; min-height: 100%;">
        <div style="flex: 1 1 auto; padding-bottom: 0.5rem;">
        
        <!-- Header Banner -->
        <div class="custom-export-banner">
          <h3 style="margin: 0; font-size: 1.25rem; font-weight: 900; color: #ffffff;">
            ⚡ أداة استخراج وتصدير وطباعة بيانات الكادر (${modalTitleScope})
          </h3>
          <p style="margin: 4px 0 0 0; font-size: 0.84rem; opacity: 0.92; line-height: 1.5; color: rgba(255, 255, 255, 0.92);">
            تتيح لك هذه الأداة استخراج وتصدير وطباعة بيانات الكادر المصرح لك بالوصول إليهم (${hasGlobal ? 'على مستوى القسم بالكامل' : 'في نطاق الشعبة / الوحدة المعتمدة'})، واختيار الحقول والمعلومات المطلوبة بدقة، وتصديرها بصيغة <strong>Excel</strong> أو <strong>Word</strong> أو <strong>PDF / طباعة رسمية</strong>.
          </p>
        </div>

        <!-- الخطوة 1: تحديد نطاق الكادر والارتباط الإداري -->
        <div class="custom-export-step-box">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; flex-wrap: wrap; gap: 0.5rem;">
            <h5 class="custom-export-step-title">
              <span>1️⃣</span> <span>نطاق الكادر المستهدف:</span>
            </h5>
            <span id="customExportTargetCount" class="badge badge-primary" style="font-size: 0.82rem; font-weight: 800;">
              ${initialCount} منتسب محدد
            </span>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 0.75rem; align-items: center;">
            <div>
              <label class="form-label" style="font-size: 0.82rem; font-weight: 700; margin-bottom: 4px;">تحديد الجهة / الارتباط الإداري:</label>
              <select id="customExportScopeSelect" class="form-control" onchange="window.app.handleCustomExportScopeChange()" style="font-size: 0.88rem; font-weight: 700;">
                ${hasGlobal ? `
                  <option value="ALL" ${targetScopeInitial === 'ALL' ? 'selected' : ''}>
                    🌐 كافة كادر قسم الإنتاج الجنوبي (${staff.length} منتسب)
                  </option>
                ` : ''}
                
                ${availableSections.length > 0 ? `
                  <optgroup label="🛢️ كادر الشعب المحددة:">
                    ${availableSections.map(s => `
                      <option value="SECTION:${s.id}" ${targetScopeInitial === `SECTION:${s.id}` ? 'selected' : ''}>
                        🏢 شعبة ${s.name} (${staff.filter(e => e.sectionId === s.id).length} منتسب)
                      </option>
                    `).join('')}
                  </optgroup>
                ` : ''}

                ${availableUnits.length > 0 ? `
                  <optgroup label="⚡ كادر الوحدات المحددة:">
                    ${availableUnits.map(u => `
                      <option value="UNIT:${u.id}" ${targetScopeInitial === `UNIT:${u.id}` ? 'selected' : ''}>
                        📍 وحدة ${u.name} (${staff.filter(e => e.unitId === u.id || (u.sectionId && e.sectionId === u.sectionId)).length} منتسب)
                      </option>
                    `).join('')}
                  </optgroup>
                ` : ''}

                ${availableStations.length > 0 ? `
                  <optgroup label="🏭 كادر المحطات والمواقع:">
                    ${availableStations.map(st => `
                      <option value="STATION:${st.id}" ${targetScopeInitial === `STATION:${st.id}` ? 'selected' : ''}>
                        🏭 ${st.name} (${staff.filter(e => e.stationId === st.id).length} منتسب)
                      </option>
                    `).join('')}
                  </optgroup>
                ` : ''}
              </select>
            </div>

            <div>
              <label class="form-label" style="font-size: 0.82rem; font-weight: 700; margin-bottom: 4px;">تصفية حسب نوع الدوام:</label>
              <select id="customExportShiftFilter" class="form-control" onchange="window.app.handleCustomExportScopeChange()" style="font-size: 0.88rem; font-weight: 700;">
                <option value="ALL">الكل (صباحي + مناوب + حقلي)</option>
                <option value="صباحي">☀️ الدوام الصباحي فقط</option>
                <option value="مناوب">🔄 الدوام المناوب (نوبات A, B, C, D)</option>
                <option value="حقلي">🏕️ الدوام الحقلي (14/14)</option>
              </select>
            </div>
          </div>
        </div>

        <!-- الخطوة 2: اختيار وتخصيص الحقول والأعمدة المطلوبة -->
        <div class="custom-export-step-box">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.85rem; flex-wrap: wrap; gap: 0.5rem; border-bottom: 1px solid var(--md-sys-color-surface-variant); padding-bottom: 0.5rem;">
            <h5 class="custom-export-step-title">
              <span>2️⃣</span> <span>تحديد وتخصيص الحقول المراد تصديرها:</span>
            </h5>
            <div style="display: flex; gap: 0.4rem;">
              <button type="button" class="custom-export-pill-btn" onclick="window.app.toggleAllCustomExportFields(true)">
                تحديد الكل
              </button>
              <button type="button" class="custom-export-pill-btn" onclick="window.app.toggleAllCustomExportFields(false)">
                إلغاء التحديد
              </button>
            </div>
          </div>

          <!-- شبكة الحقول المقسمة موضوعياً -->
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1rem;">
            
            <!-- المجموعة 1: البيانات الشخصية والمدنية -->
            <div class="custom-export-group-card">
              <div class="custom-export-group-header">
                <span>📋</span> <span>البيانات الأساسية والمدنية:</span>
              </div>
              <div style="display: flex; flex-direction: column; gap: 0.35rem;">
                <label class="custom-export-field-item">
                  <input type="checkbox" class="custom-exp-field custom-export-checkbox" value="fullName" checked>
                  <strong>الاسم الرباعي واللقب</strong>
                </label>
                <label class="custom-export-field-item">
                  <input type="checkbox" class="custom-exp-field custom-export-checkbox" value="employeeId" checked>
                  <strong>الرقم الوظيفي</strong>
                </label>
                <label class="custom-export-field-item">
                  <input type="checkbox" class="custom-exp-field custom-export-checkbox" value="motherName">
                  <span>اسم الأم الثلاثي</span>
                </label>
                <label class="custom-export-field-item">
                  <input type="checkbox" class="custom-exp-field custom-export-checkbox" value="phone" checked>
                  <span>رقم الهاتف الشخصي</span>
                </label>
                <label class="custom-export-field-item">
                  <input type="checkbox" class="custom-exp-field custom-export-checkbox" value="email">
                  <span>البريد الإلكتروني</span>
                </label>
                <label class="custom-export-field-item">
                  <input type="checkbox" class="custom-exp-field custom-export-checkbox" value="address">
                  <span>محل السكن والمحافظة</span>
                </label>
                <label class="custom-export-field-item">
                  <input type="checkbox" class="custom-exp-field custom-export-checkbox" value="bloodType">
                  <span>فصيلة الدم</span>
                </label>
              </div>
            </div>

            <!-- المجموعة 2: المسار الوظيفي والشهادات -->
            <div class="custom-export-group-card">
              <div class="custom-export-group-header">
                <span>💼</span> <span>المسار الوظيفي والشهادات:</span>
              </div>
              <div style="display: flex; flex-direction: column; gap: 0.35rem;">
                <label class="custom-export-field-item">
                  <input type="checkbox" class="custom-exp-field custom-export-checkbox" value="jobTitle" checked>
                  <strong>المسمى والوظيفة الحالية</strong>
                </label>
                <label class="custom-export-field-item">
                  <input type="checkbox" class="custom-exp-field custom-export-checkbox" value="degree" checked>
                  <strong>الشهادة الأكاديمية والتخصص</strong>
                </label>
                <label class="custom-export-field-item">
                  <input type="checkbox" class="custom-exp-field custom-export-checkbox" value="jobGrade">
                  <span>الدرجة والمرحلة الوظيفية</span>
                </label>
                <label class="custom-export-field-item">
                  <input type="checkbox" class="custom-exp-field custom-export-checkbox" value="hireDate">
                  <span>تاريخ التعيين الرسمي</span>
                </label>
                <label class="custom-export-field-item">
                  <input type="checkbox" class="custom-exp-field custom-export-checkbox" value="deptJoinDate">
                  <span>تاريخ المباشرة بالقسم</span>
                </label>
                <label class="custom-export-field-item">
                  <input type="checkbox" class="custom-exp-field custom-export-checkbox" value="thanksLettersCount">
                  <span>عدد كتب الشكر والتقدير</span>
                </label>
                <label class="custom-export-field-item">
                  <input type="checkbox" class="custom-exp-field custom-export-checkbox" value="penaltiesCount">
                  <span>العقوبات والإنذارات</span>
                </label>
              </div>
            </div>

            <!-- المجموعة 3: التوزيع الإداري والتشغيلي والدوام -->
            <div class="custom-export-group-card">
              <div class="custom-export-group-header">
                <span>🏢</span> <span>التشكيل الإداري والمناوبات:</span>
              </div>
              <div style="display: flex; flex-direction: column; gap: 0.35rem;">
                <label class="custom-export-field-item">
                  <input type="checkbox" class="custom-exp-field custom-export-checkbox" value="sectionName" checked>
                  <strong>الشعبة التابع لها</strong>
                </label>
                <label class="custom-export-field-item">
                  <input type="checkbox" class="custom-exp-field custom-export-checkbox" value="unitName" checked>
                  <span>الوحدة / المحطة الميدانية</span>
                </label>
                <label class="custom-export-field-item">
                  <input type="checkbox" class="custom-exp-field custom-export-checkbox" value="workShift" checked>
                  <strong>نظام الدوام (صباحي/مناوب/حقلي)</strong>
                </label>
                <label class="custom-export-field-item">
                  <input type="checkbox" class="custom-exp-field custom-export-checkbox" value="shiftName">
                  <span>اسم النوبة (A, B, C, D)</span>
                </label>
                <label class="custom-export-field-item">
                  <input type="checkbox" class="custom-exp-field custom-export-checkbox" value="fieldShiftDates">
                  <span>تواريخ الصعود والنزول الحقلي</span>
                </label>
                <label class="custom-export-field-item">
                  <input type="checkbox" class="custom-exp-field custom-export-checkbox" value="unifiedCardNumber">
                  <span>رقم البطاقة الموحدة / الهوية</span>
                </label>
                <label class="custom-export-field-item">
                  <input type="checkbox" class="custom-exp-field custom-export-checkbox" value="safetyPassportNumber">
                  <span>رقم جواز السلامة HSE</span>
                </label>
              </div>
            </div>

          </div>

          <!-- المجموعة 4: الحقول الإضافية والديناميكية الخاصة بالقسم -->
          ${dynamicFields.length > 0 ? `
            <div style="margin-top: 1rem; border-top: 1px dashed var(--md-sys-color-surface-variant); padding-top: 0.75rem;">
              <div class="custom-export-group-header" style="border: none; margin-bottom: 0.45rem;">
                <span>🧩</span> <span>حقول ومعلومات خاصة ومخصصة بالقسم (${dynamicFields.length} حقول):</span>
              </div>
              <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; font-size: 0.82rem;">
                ${dynamicFields.map(df => `
                  <label class="custom-export-dynamic-chip">
                    <input type="checkbox" class="custom-exp-field custom-export-checkbox" value="dyn_${df.key}">
                    <span>${df.name}</span>
                  </label>
                `).join('')}
              </div>
            </div>
          ` : ''}

        </div>
        </div>

        <!-- الخطوة 3: أزرار التصدير والطباعة بالصيغ المختلفة (شريط مثبت sticky بالأسفل) -->
        <div class="modal-form-sticky-footer" style="display: flex; justify-content: space-between; align-items: center; gap: 0.75rem; flex-wrap: nowrap;">
          
          <div style="display: flex; flex-direction: column; white-space: nowrap;">
            <span style="font-weight: 800; font-size: 0.92rem; color: var(--md-sys-color-primary);">
              3️⃣ اختر صيغة التصدير أو الطباعة:
            </span>
            <span style="font-size: 0.78rem; color: var(--md-sys-color-outline);">
              سيتم التوليد والتنسيق الفوري بالترويسة الرسمية المعتمدة.
            </span>
          </div>

          <div style="display: flex; gap: 0.45rem; align-items: center; flex-wrap: nowrap; white-space: nowrap;">
            
            <!-- زر تصدير Excel الفاخر المنسق -->
            <button type="button" class="btn btn-glass-emerald" onclick="window.app.executeCustomStaffExport('EXCEL')" title="تصدير جدول Excel منسق وأنيق مع العناوين والترويسة" style="padding: 0.5rem 1rem; font-weight: 800; font-size: 0.88rem; white-space: nowrap;">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="8" y1="13" x2="16" y2="13"></line>
                <line x1="8" y1="17" x2="16" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
              <span>تنزيل Excel (.xls)</span>
              <span style="font-size: 1.05rem;">📊</span>
            </button>

            <!-- زر تصدير Word الرسمي -->
            <button type="button" class="btn btn-glass-primary" onclick="window.app.executeCustomStaffExport('WORD')" title="تصدير مستند Word رسمي مع الترويسة والتواقيع" style="padding: 0.5rem 1rem; font-weight: 800; font-size: 0.88rem; white-space: nowrap;">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
              </svg>
              <span>تنزيل Word (.doc)</span>
              <span style="font-size: 1.05rem;">📄</span>
            </button>

            <!-- زر طباعة / حفظ PDF الفوري -->
            <button type="button" class="btn btn-glass-amber" onclick="window.app.executeCustomStaffExport('PDF')" title="طباعة فورية أو حفظ بصيغة PDF الرسمية" style="padding: 0.5rem 1rem; font-weight: 800; font-size: 0.88rem; white-space: nowrap;">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="6 9 6 2 18 2 18 9"></polyline>
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                <rect x="6" y="14" width="12" height="8"></rect>
              </svg>
              <span>طباعة / تصدير PDF</span>
              <span style="font-size: 1.05rem;">🖨️</span>
            </button>

            <!-- زر الإغلاق الزجاجي -->
            <button type="button" class="btn btn-glass-slate" onclick="window.app.closeModal()" title="إغلاق النافذة" style="padding: 0.5rem 0.9rem; font-size: 0.88rem; white-space: nowrap;">
              <span>إغلاق</span>
            </button>

          </div>

        </div>

      </div>
    `, { size: 'xl', maxWidth: '1080px', glass: true });
  }

  executeCustomStaffExport(format) {
    const actorUser = window.auth.getCurrentUser();
    const deptId = actorUser ? actorUser.departmentId : 'dept-south-prod';
    const allStaff = window.store.getUnifiedEmployeeRoster(actorUser) || [];
    const sections = window.store.getSections(deptId) || [];
    const units = window.store.getUnits(deptId) || [];
    const stations = window.store.getDb()?.stations || [];
    const dynamicFields = window.store.getDynamicEmployeeFields(deptId) || [];

    // Filter staff according to scope selection & search
    const scopeVal = document.getElementById('customExportScopeSelect')?.value || 'ALL';
    const searchVal = (document.getElementById('customExportFilterSearch')?.value || '').trim().toLowerCase();

    let targetStaff = allStaff;
    let scopeName = 'كافة كادر قسم الإنتاج الجنوبي';
    let sectionName = '';
    let stationName = '';
    let unitName = '';

    if (scopeVal.startsWith('SECTION:')) {
      const secId = scopeVal.replace('SECTION:', '');
      const sec = sections.find(s => s.id === secId);
      if (sec) {
        targetStaff = targetStaff.filter(e => e.sectionId === secId);
        scopeName = `كادر ${sec.name}`;
        sectionName = sec.name;
      }
    } else if (scopeVal.startsWith('UNIT:')) {
      const uId = scopeVal.replace('UNIT:', '');
      const un = units.find(u => u.id === uId);
      if (un) {
        targetStaff = targetStaff.filter(e => e.unitId === uId || (un.sectionId && e.sectionId === un.sectionId));
        scopeName = `كادر ${un.name}`;
        unitName = un.name;
        if (un.sectionId) {
          const sec = sections.find(s => s.id === un.sectionId);
          if (sec) sectionName = sec.name;
        }
      }
    } else if (scopeVal.startsWith('STATION:')) {
      const stId = scopeVal.replace('STATION:', '');
      const st = stations.find(s => s.id === stId);
      if (st) {
        targetStaff = targetStaff.filter(e => e.stationId === stId);
        scopeName = `كادر ${st.name}`;
        stationName = st.name;
        if (st.sectionId) {
          const sec = sections.find(s => s.id === st.sectionId);
          if (sec) sectionName = sec.name;
        }
      }
    } else if (scopeVal !== 'ALL') {
      // Legacy fallback
      const sec = sections.find(s => s.id === scopeVal);
      if (sec) {
        targetStaff = targetStaff.filter(e => e.sectionId === scopeVal);
        scopeName = `كادر ${sec.name}`;
        sectionName = sec.name;
      }
    }

    if (searchVal) {
      targetStaff = targetStaff.filter(e => 
        (e.fullName || '').toLowerCase().includes(searchVal) ||
        (e.employeeId || '').toLowerCase().includes(searchVal) ||
        (e.jobTitle || '').toLowerCase().includes(searchVal)
      );
      scopeName += ` (مطابقة للبحث: ${searchVal})`;
    }

    if (targetStaff.length === 0) {
      alert('⚠️ لا توجد سجلات منتسبين مطابقة للنطاق المحدد.');
      return;
    }

    // Get checked fields
    const checkedCheckboxes = Array.from(document.querySelectorAll('.custom-exp-field:checked'));
    if (checkedCheckboxes.length === 0) {
      alert('⚠️ يرجى تحديد حقل أو معلومة واحدة على الأقل لتصديرها.');
      return;
    }

    const fieldMap = {
      fullName: { label: 'الاسم الرباعي واللقب', getVal: (e) => e.fullName || '-' },
      employeeId: { label: 'الرقم الوظيفي', getVal: (e) => e.employeeId || '-' },
      motherName: { label: 'اسم الأم', getVal: (e) => e.motherName || '-' },
      birthDate: { label: 'المواليد وتاريخ الولادة', getVal: (e) => (e.birthDate || '') + (e.birthPlace ? ' (' + e.birthPlace + ')' : '') },
      phone: { label: 'رقم الهاتف', getVal: (e) => e.phone || e.mobile || '-' },
      email: { label: 'البريد الإلكتروني', getVal: (e) => e.email || e.emailOfficial || '-' },
      address: { label: 'محل السكن', getVal: (e) => e.address || e.residence || '-' },
      bloodType: { label: 'فصيلة الدم', getVal: (e) => e.bloodType || '-' },
      maritalStatus: { label: 'الحالة الاجتماعية', getVal: (e) => e.maritalStatus || '-' },
      jobTitle: { label: 'العنوان الوظيفي', getVal: (e) => e.jobTitle || '-' },
      jobGrade: { label: 'الدرجة والمرحلة', getVal: (e) => (e.jobGrade || 'الخامسة') + ' / ' + (e.jobStage || 'الأولى') },
      degree: { label: 'الشهادة والتخصص', getVal: (e) => (e.degree || 'بكالوريوس') + (e.specialization ? ' - ' + e.specialization : '') },
      university: { label: 'الجامعة وسنة التخرج', getVal: (e) => (e.university || '') + (e.graduationYear ? ' (' + e.graduationYear + ')' : '') },
      hireDate: { label: 'تاريخ التعيين', getVal: (e) => e.hireDate || '-' },
      deptJoinDate: { label: 'تاريخ الانضمام للقسم', getVal: (e) => e.deptJoinDate || '-' },
      thanksLettersCount: { label: 'كتب الشكر', getVal: (e) => (e.thanksLettersCount || 0) + ' كتاب' },
      sectionName: { label: 'الشعبة', getVal: (e) => {
        const s = sections.find(sec => sec.id === e.sectionId);
        return s ? s.name : 'إدارة القسم';
      }},
      stationName: { label: 'المحطة / الوحدة', getVal: (e) => {
        const st = window.store.getStationById(e.stationId);
        if (st) return st.name;
        const un = window.store.getUnitById(e.unitId);
        if (un) return un.name;
        return 'الموقع المركزي';
      }},
      workShift: { label: 'نوع الدوام والنوبة', getVal: (e) => e.workShift === 'مناوب' ? ('مناوب (نوبة ' + (e.assignedShift || e.shift || 'A') + ')') : (e.workShift || 'صباحي') },
      roleName: { label: 'الدور الإداري', getVal: (e) => {
        const roleInfo = window.rbac.getRoleInfo(e.role);
        return roleInfo ? roleInfo.name : (e.role || 'منتسب');
      }},
      unifiedCardNumber: { label: 'البطاقة الموحدة', getVal: (e) => e.unifiedCardNumber || '-' },
      passportNumber: { label: 'جواز السفر', getVal: (e) => e.passportNumber || '-' },
      safetyPassportNumber: { label: 'جواز السلامة HSE', getVal: (e) => e.safetyPassportNumber || '-' }
    };

    // Add dynamic fields into fieldMap
    dynamicFields.forEach(df => {
      fieldMap['dyn_' + df.key] = {
        label: df.name,
        getVal: (e) => {
          if (e.dynamicValues && e.dynamicValues[df.key]) {
            return e.dynamicValues[df.key].value || '-';
          }
          return '-';
        }
      };
    });

    const selectedKeys = checkedCheckboxes.map(cb => cb.value);
    const headers = selectedKeys.map(k => fieldMap[k] ? fieldMap[k].label : k);
    const rows = targetStaff.map(emp => selectedKeys.map(k => fieldMap[k] ? fieldMap[k].getVal(emp) : '-'));

    const docTitle = `بيانات كادر ${sectionName ? sectionName : (unitName ? unitName : (stationName ? stationName : 'قسم الإنتاج الجنوبي'))} المخصصة`;
    const docSubtitle = `${scopeName} - إجمالي السجلات: ${targetStaff.length} منتسب`;

    if (format === 'EXCEL') {
      window.exporter.exportToStyledExcel(docTitle, headers, rows, {
        sectionName,
        stationName: stationName || unitName,
        scopeName
      });
      alert(`✅ تم تصدير ملف Excel بنجاح لعدد (${targetStaff.length}) منتسب وبـ (${headers.length}) حقول مختارة.`);
    } else if (format === 'WORD') {
      window.exporter.exportToWordDoc(docTitle, docSubtitle, headers, rows, {
        sectionName,
        stationName: stationName || unitName,
        scopeName
      });
      alert(`✅ تم تصدير مستند Word بنجاح لعدد (${targetStaff.length}) منتسب.`);
    } else if (format === 'PDF' || format === 'PRINT') {
      const tableHtml = `
        <div style="margin-bottom: 12px; font-size: 0.9rem; color: #475569;">
          <strong>النطاق:</strong> ${scopeName} | <strong>عدد السجلات:</strong> ${targetStaff.length} منتسب | <strong>الحقول المحددة:</strong> ${headers.length}
        </div>
        <table class="data-table" style="font-size: 0.85rem; width: 100%;">
          <thead>
            <tr>
              <th style="width: 35px; text-align: center;">#</th>
              ${headers.map(h => `<th>${h}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${rows.map((row, idx) => `
              <tr>
                <td style="text-align: center; font-weight: bold; font-family: monospace;">${idx + 1}</td>
                ${row.map(cell => `<td>${cell}</td>`).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div style="margin-top: 30px; display: flex; justify-content: space-between; font-size: 0.88rem;">
          <div><strong>مسؤول الشعبة / الوحدة</strong><br><br>___________________</div>
          <div style="text-align: left;"><strong>مصادقة مدير قسم الإنتاج الجنوبي</strong><br><br>___________________</div>
        </div>
      `;

      window.exporter.printDocument(docTitle, docSubtitle, tableHtml, {
        sectionName,
        stationName: stationName || unitName,
        docNumber: 'REP-HR-' + Date.now().toString().slice(-4)
      });
    }

    window.store.logActivity(deptId, actorUser.id, actorUser.employeeId, 'CUSTOM_DATA_EXPORT', 'HR', `تصدير بيانات الكادر بصيغة [${format}] لعدد (${targetStaff.length}) منتسب`);
  }

  setCustomExportPreset(preset) {
    const checkboxes = document.querySelectorAll('.custom-exp-field');
    if (preset === 'ALL') {
      checkboxes.forEach(cb => cb.checked = true);
    } else if (preset === 'NONE') {
      checkboxes.forEach(cb => cb.checked = false);
    } else if (preset === 'ESSENTIAL') {
      const essential = ['fullName', 'employeeId', 'jobTitle', 'sectionName', 'degree', 'phone'];
      checkboxes.forEach(cb => cb.checked = essential.includes(cb.value));
    } else if (preset === 'CAREER') {
      const career = ['fullName', 'employeeId', 'jobTitle', 'jobGrade', 'degree', 'university', 'hireDate', 'deptJoinDate', 'thanksLettersCount'];
      checkboxes.forEach(cb => cb.checked = career.includes(cb.value));
    } else if (preset === 'CONTACT') {
      const contact = ['fullName', 'employeeId', 'phone', 'email', 'address', 'sectionName', 'workShift'];
      checkboxes.forEach(cb => cb.checked = contact.includes(cb.value));
    }
  }

  handleCustomExportScopeChange() {
    const scopeVal = document.getElementById('customExportScopeSelect')?.value || 'ALL';
    const actorUser = window.auth.getCurrentUser();
    const allStaff = window.store.getUnifiedEmployeeRoster(actorUser) || [];
    const units = window.store.getUnits(actorUser?.departmentId) || [];
    
    let count = allStaff.length;
    if (scopeVal.startsWith('SECTION:')) {
      const sId = scopeVal.replace('SECTION:', '');
      count = allStaff.filter(e => e.sectionId === sId).length;
    } else if (scopeVal.startsWith('UNIT:')) {
      const uId = scopeVal.replace('UNIT:', '');
      const un = units.find(u => u.id === uId);
      count = allStaff.filter(e => e.unitId === uId || (un && un.sectionId && e.sectionId === un.sectionId)).length;
    } else if (scopeVal.startsWith('STATION:')) {
      const stId = scopeVal.replace('STATION:', '');
      count = allStaff.filter(e => e.stationId === stId).length;
    } else if (scopeVal !== 'ALL') {
      count = allStaff.filter(e => e.sectionId === scopeVal).length;
    }

    const badge = document.getElementById('customExportTargetCount');
    if (badge) badge.innerText = `${count} منتسب محدد`;
  }

  handleCustomExportSearch() {
    const scopeVal = document.getElementById('customExportScopeSelect')?.value || 'ALL';
    const searchVal = (document.getElementById('customExportFilterSearch')?.value || '').trim().toLowerCase();
    const actorUser = window.auth.getCurrentUser();
    const allStaff = window.store.getUnifiedEmployeeRoster(actorUser) || [];
    const units = window.store.getUnits(actorUser?.departmentId) || [];

    let staff = allStaff;
    if (scopeVal.startsWith('SECTION:')) {
      const sId = scopeVal.replace('SECTION:', '');
      staff = staff.filter(e => e.sectionId === sId);
    } else if (scopeVal.startsWith('UNIT:')) {
      const uId = scopeVal.replace('UNIT:', '');
      const un = units.find(u => u.id === uId);
      staff = staff.filter(e => e.unitId === uId || (un && un.sectionId && e.sectionId === un.sectionId));
    } else if (scopeVal.startsWith('STATION:')) {
      const stId = scopeVal.replace('STATION:', '');
      staff = staff.filter(e => e.stationId === stId);
    } else if (scopeVal !== 'ALL') {
      staff = staff.filter(e => e.sectionId === scopeVal);
    }

    if (searchVal) {
      staff = staff.filter(e => 
        (e.fullName || '').toLowerCase().includes(searchVal) ||
        (e.employeeId || '').toLowerCase().includes(searchVal) ||
        (e.jobTitle || '').toLowerCase().includes(searchVal)
      );
    }
    const badge = document.getElementById('customExportTargetCount');
    if (badge) badge.innerText = `${staff.length} منتسب مطابق`;
  }

  // --- Bulk Thanks & Seniority Modal (أداة توثيق وإضافة كتاب شكر وتقدير جماعي) ---
  openBulkThanksModal() {
    const actorUser = window.auth ? window.auth.getCurrentUser() : null;
    if (!actorUser) return;
    const deptId = actorUser.departmentId || 'dept-south-prod';
    const sections = (window.store && typeof window.store.getSections === 'function') ? window.store.getSections(deptId) : [];
    const stations = (window.store && typeof window.store.getStations === 'function') ? window.store.getStations(deptId) : [];
    const employees = (window.store && typeof window.store.getUnifiedEmployeeRoster === 'function') ? window.store.getUnifiedEmployeeRoster(actorUser) : [];
    const totalCount = employees.length;

    const content = `
      <div style="direction: rtl; text-align: right;">
        
        <!-- Header Badge -->
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; padding-bottom: 0.75rem; border-bottom: 1px solid var(--md-sys-color-surface-variant, rgba(255,255,255,0.1)); flex-wrap: wrap; gap: 0.5rem;">
          <div>
            <h4 style="margin: 0; font-weight: 800; color: var(--md-sys-color-primary, #0284c7); display: flex; align-items: center; gap: 0.4rem; font-size: 1.15rem;">
              <span>🎖️</span> إضافة وتوثيق كتاب شكر وتقدير عام (جماعي)
            </h4>
            <p style="margin: 0.25rem 0 0 0; font-size: 0.78rem; color: var(--md-sys-color-outline, #94a3b8); font-weight: 600;">
              توثيق الكتب الوزارية والرئاسية العامة ومنح القدم الوظيفي المعتمد لكافة المشمولين وتحديث حاسبة الترفيع دفعة واحدة.
            </p>
          </div>
          <span class="badge badge-success" style="font-size: 0.78rem; padding: 0.35rem 0.8rem; font-weight: 800; border-radius: 999px;">
            إجمالي الكادر المتاح: ${totalCount} منتسباً
          </span>
        </div>

        <form id="bulkThanksForm" onsubmit="window.app.submitBulkThanks(event)">
          
          <!-- 1. الجهة المصدرة لكتاب الشكر -->
          <div class="form-group" style="margin-bottom: 0.85rem;">
            <label class="form-label" style="font-weight: 800; font-size: 0.82rem; color: var(--md-sys-color-on-surface, currentColor);">
              🏛️ الجهة الرسمية المصدرة لكتاب الشكر:
            </label>
            <select id="bulkThanksIssuer" class="form-control" style="font-weight: 700; font-size: 0.85rem;" onchange="window.app.updateBulkThanksMonthsPreview()">
              <option value="MINISTER">السيد وزير النفط / السيد المدير العام (+1 شهر قدم وظيفي)</option>
              <option value="PM">دولة رئيس مجلس الوزراء (+6 أشهر قدم وظيفي)</option>
              <option value="PRESIDENT">فخامة رئيس الجمهورية (+6 أشهر أو +12 شهراً قدم وظيفي)</option>
            </select>
          </div>

          <!-- 2. رقم الكتاب وتاريخ الصدور -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-bottom: 0.85rem;">
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label" style="font-weight: 800; font-size: 0.82rem; color: var(--md-sys-color-on-surface, currentColor);">رقم الصادر للكتاب الرسمي:</label>
              <input type="text" id="bulkThanksNumber" class="form-control" placeholder="مثال: ش/2026/892" required style="font-weight: 700; font-family: monospace;">
            </div>
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label" style="font-weight: 800; font-size: 0.82rem; color: var(--md-sys-color-on-surface, currentColor);">تاريخ صدور الكتاب:</label>
              <input type="date" id="bulkThanksDate" class="form-control" value="${new Date().toISOString().split('T')[0]}" required style="font-weight: 700; font-family: monospace;">
            </div>
          </div>

          <!-- 3. موضوع الشكر والتثمين -->
          <div class="form-group" style="margin-bottom: 0.85rem;">
            <label class="form-label" style="font-weight: 800; font-size: 0.82rem; color: var(--md-sys-color-on-surface, currentColor);">موضوع / سبب منح الشكر والتقدير:</label>
            <input type="text" id="bulkThanksSubject" class="form-control" value="تثميناً للجهود المتميزة في استقرار العمليات التشغيلية وتحقيق الأهداف الإنتاجية" required style="font-weight: 700;">
          </div>

          <!-- 4. نطاق التطبيق والشمول -->
          <div class="form-group" style="margin-bottom: 0.85rem;">
            <label class="form-label" style="font-weight: 800; font-size: 0.82rem; color: var(--md-sys-color-on-surface, currentColor);">🎯 نطاق الشمول (المستفيدون من كتاب الشكر):</label>
            <select id="bulkThanksScope" class="form-control" style="font-weight: 700; font-size: 0.85rem;">
              <option value="ALL">⭐ كافة منتسبي قسم الإنتاج الجنوبي (${totalCount} موظفاً - شامل الجميع)</option>
              ${sections.map(s => `<option value="SECTION_${s.id}">شعبة: ${s.name}</option>`).join('')}
              ${stations.map(st => `<option value="STATION_${st.id}">محطة: ${st.name}</option>`).join('')}
            </select>
          </div>

          <!-- Live Preview Impact Box -->
          <div id="bulkThanksImpactBox" style="padding: 0.75rem 1rem; background: linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(2, 132, 199, 0.08) 100%); border: 1.5px solid rgba(16, 185, 129, 0.35); border-radius: 12px; margin-bottom: 1.15rem;">
            <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.5rem;">
              <div style="font-size: 0.82rem; font-weight: 800; color: #059669; display: flex; align-items: center; gap: 0.4rem;">
                <span>⚡</span> <span>الأثر القانوني والوظيفي المباشر:</span>
              </div>
              <span id="bulkThanksMonthsBadge" class="badge badge-success" style="font-weight: 800; font-size: 0.78rem; padding: 0.2rem 0.6rem; border-radius: 999px;">
                +1 شهر قدم وظيفي لكل منتسب
              </span>
            </div>
            <div style="font-size: 0.76rem; color: var(--md-sys-color-on-surface, currentColor); margin-top: 0.4rem; line-height: 1.45;">
              ✓ سيتم إدراج الكتاب الرسمي في إضبارة وسجل كل موظف مشمول وتحديث عداد كُتب الشكر تلقائياً.<br>
              ✓ سيتم تقليص موعد الترفيع القادم واحتساب الاستحقاق فوراً في الحاسبة الذكية.
            </div>
          </div>

          <!-- Submit & Actions -->
          <div style="display: flex; justify-content: flex-end; gap: 0.75rem;">
            <button type="button" class="btn btn-outline" onclick="window.app.closeModal()">إلغاء</button>
            <button type="submit" class="btn btn-primary" style="font-weight: 800; padding: 0.55rem 1.5rem; background: linear-gradient(135deg, #0b57d0 0%, #10b981 100%); border: none; box-shadow: 0 4px 14px rgba(11, 87, 208, 0.3); cursor: pointer;">
              💾 اعتماد وإضافة كتاب الشكر لكافة المشمولين فوراً
            </button>
          </div>
        </form>
      </div>
    `;

    this.showModal('توثيق كتاب شكر وتقدير جماعي', content, { size: 'lg' });
  }

  submitBulkThanks(event) {
    if (event && event.preventDefault) event.preventDefault();
    const actorUser = window.auth ? window.auth.getCurrentUser() : null;
    if (!actorUser) return;
    const deptId = actorUser.departmentId || 'dept-south-prod';

    const issuer = document.getElementById('bulkThanksIssuer') ? document.getElementById('bulkThanksIssuer').value : 'MINISTER';
    const letterNumber = document.getElementById('bulkThanksNumber') ? document.getElementById('bulkThanksNumber').value : '';
    const letterDate = document.getElementById('bulkThanksDate') ? document.getElementById('bulkThanksDate').value : '';
    const subject = document.getElementById('bulkThanksSubject') ? document.getElementById('bulkThanksSubject').value : '';
    const scope = document.getElementById('bulkThanksScope') ? document.getElementById('bulkThanksScope').value : 'ALL';

    if (!letterNumber || !letterDate) {
      if (typeof this.showToast === 'function') {
        this.showToast('يرجى إدخال رقم وتاريخ الكتاب الرسمي.', 'warning');
      } else if (typeof alert === 'function') {
        alert('يرجى إدخال رقم وتاريخ الكتاب الرسمي.');
      }
      return;
    }

    if (window.store && typeof window.store.addBulkThanksLetter === 'function') {
      const result = window.store.addBulkThanksLetter(deptId, {
        issuer,
        letterNumber,
        letterDate,
        subject
      }, scope, actorUser);

      if (typeof this.closeModal === 'function') this.closeModal();

      if (typeof this.showToast === 'function') {
        this.showToast(`🎖️ تم إضافة كتاب الشكر ومنح القدم لـ (${result.affectedCount}) منتسباً بنجاح!`, 'success');
      } else if (typeof alert === 'function') {
        alert(`🎖️ تم إضافة كتاب الشكر ومنح القدم لـ (${result.affectedCount}) منتسباً بنجاح!`);
      }

      if (typeof this.render === 'function') {
        this.render();
      }
    }
  }

  updateBulkThanksMonthsPreview() {
    const issuer = document.getElementById('bulkThanksIssuer') ? document.getElementById('bulkThanksIssuer').value : 'MINISTER';
    const badge = document.getElementById('bulkThanksMonthsBadge');
    if (!badge) return;
    if (issuer === 'MINISTER') {
      badge.textContent = '+1 شهر قدم وظيفي لكل منتسب';
    } else if (issuer === 'PM') {
      badge.textContent = '+6 أشهر قدم وظيفي لكل منتسب';
    } else if (issuer === 'PRESIDENT') {
      badge.textContent = '+6 أو +12 شهراً قدم وظيفي لكل منتسب';
    }
  }

  // --- Dynamic Field Creator Modal ---
  openCreateDynamicFieldModal() {
    this.showModal('🧩 إنشاء حقل / معلومة ديناميكية جديدة للإضبارة', `
      <form onsubmit="window.app.handleSaveCreateDynamicField(event)">
        <div class="form-group">
          <label class="form-label">اسم الحقل بالعربية (Label):</label>
          <input type="text" id="dfName" class="form-control" placeholder="مثال: رقم جواز السلامة HSE، تاريخ انتهاء العقد..." required>
        </div>

        <div class="form-group">
          <label class="form-label">المعرف البرمجي الفريد (Field Key):</label>
          <input type="text" id="dfKey" class="form-control" placeholder="مثال: safetyPassportNo" required style="font-family: monospace;">
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
          <div class="form-group">
            <label class="form-label">نوع البيانات:</label>
            <select id="dfType" class="form-control">
              <option value="text">نص عادي (Text)</option>
              <option value="number">رقم عددي (Number)</option>
              <option value="date">تاريخ (Date)</option>
              <option value="textarea">نص متعدد الأسطر (Textarea)</option>
              <option value="select">قائمة اختيار (Select)</option>
              <option value="boolean">نعم / لا (Boolean)</option>
              <option value="file">مستند / ملف (Document)</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">التصنيف الإداري:</label>
            <select id="dfCategory" class="form-control">
              <option value="official_documents">وثائق ومستمسكات رسمية</option>
              <option value="career">مسار وظيفي وتدريب</option>
              <option value="section_specific">معلومات خاصة بالشعبة</option>
              <option value="administrative">معلومات إدارية وكتب</option>
              <option value="personal">بيانات شخصية ومدنية</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">نطاق تطبيق الحقل (Scope):</label>
          <select id="dfScope" class="form-control">
            <option value="GLOBAL">🌐 شامل على كافة موظفي القسم (Global)</option>
            <option value="SECTION">🏢 خاص بموظفي الشعب فقط (Section Level)</option>
            <option value="UNIT">📍 خاص بالوحدات والمحطات (Unit/Station)</option>
          </select>
        </div>

        <div style="margin-top: 1.25rem; display: flex; justify-content: flex-end; gap: 0.5rem;">
          <button type="button" class="btn btn-outline" onclick="window.app.closeModal()">إلغاء</button>
          <button type="submit" class="btn btn-primary" style="font-weight: 800;">
            💾 حفظ واعتماد الحقل الجديد
          </button>
        </div>
      </form>
    `);
  }

  handleSaveCreateDynamicField(e) {
    e.preventDefault();
    const actorUser = window.auth.getCurrentUser();
    const name = document.getElementById('dfName').value.trim();
    const key = document.getElementById('dfKey').value.trim().replace(/[^a-zA-Z0-9_]/g, '');
    const type = document.getElementById('dfType').value;
    const category = document.getElementById('dfCategory').value;
    const scope = document.getElementById('dfScope').value;

    const res = window.store.addDynamicEmployeeField({ name, key, type, category, scope }, actorUser);
    if (res.success) {
      alert(`تم إنشاء الحقل الديناميكي [${name}] بنجاح، وأصبح متاحاً فوراً في إضبارة الموظفين.`);
      this.closeModal();
      this.render();
    } else {
      alert('خطأ: ' + res.error);
    }
  }

  handleDeleteDynamicField(fieldId) {
    const actorUser = window.auth.getCurrentUser();
    if (confirm('هل أنت متأكد من تعطيل هذا الحقل الديناميكي من الإضبارة الموحدة؟')) {
      window.store.deleteDynamicEmployeeField(fieldId, actorUser);
      this.render();
    }
  }

  // --- Add Dynamic Field Value for Employee Modal ---
  openAddDynamicValueModal(empId) {
    const actorUser = window.auth.getCurrentUser();
    const master = window.store.getEmployeeMasterRecordByEmployeeId(empId);
    const dynamicFields = window.store.getDynamicEmployeeFields(actorUser.departmentId);

    this.showModal(`🧩 إضافة / تحديث معلومة ديناميكية - ${master.fullName}`, `
      <form onsubmit="window.app.handleSaveDynamicFieldValueSubmit(event, '${master.employeeId}')">
        <div class="form-group">
          <label class="form-label">اختر الحقل / المعلومة المراد تسجيلها:</label>
          <select id="dynFieldKeySelect" class="form-control" required>
            ${dynamicFields.map(f => `
              <option value="${f.key}">${f.name} (${f.scope})</option>
            `).join('')}
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">القيمة أو البيان المراد حفظه:</label>
          <input type="text" id="dynFieldValueInput" class="form-control" placeholder="أدخل القيمة هنا..." required>
        </div>

        <div style="margin-top: 1.25rem; display: flex; justify-content: flex-end; gap: 0.5rem;">
          <button type="button" class="btn btn-outline" onclick="window.app.closeModal()">إلغاء</button>
          <button type="submit" class="btn btn-primary" style="font-weight: 800;">
            💾 حفظ القيمة في الإضبارة الأصلية
          </button>
        </div>
      </form>
    `);
  }

  handleSaveDynamicFieldValueSubmit(e, empId) {
    e.preventDefault();
    const actorUser = window.auth.getCurrentUser();
    const key = document.getElementById('dynFieldKeySelect').value;
    const value = document.getElementById('dynFieldValueInput').value.trim();

    const res = window.store.setEmployeeDynamicValue(empId, key, value, 'GLOBAL', actorUser);
    if (res.success) {
      alert('تم تحديث المعلومة بنجاح في الإضبارة الأصلية.');
      this.closeModal();
      this.openMasterDossierModal(empId);
    } else {
      alert('خطأ: ' + res.error);
    }
  }

  // --- Employee Transfer Modal ---
  openTransferEmployeeModal(empId) {
    const actorUser = window.auth.getCurrentUser();
    const master = window.store.getEmployeeMasterRecordByEmployeeId(empId);
    const sections = window.store.getSections(actorUser.departmentId);
    const units = window.store.getUnits(actorUser.departmentId);
    const stations = window.store.getStations(actorUser.departmentId);

    this.showModal(`🔄 نقل ارتباط الموظف - ${master.fullName}`, `
      <form onsubmit="window.app.handleSaveTransferEmployee(event, '${master.employeeId}')">
        <div style="background: var(--md-sys-color-surface-variant); padding: 0.75rem 1rem; border-radius: var(--radius-md); margin-bottom: 1.25rem;">
          <div style="font-weight: 700;">${master.fullName} (<code>${master.employeeId}</code>)</div>
          <div style="font-size: 0.8rem; color: var(--md-sys-color-outline);">الارتباط الحالي: ${master.sectionId ? window.store.getSectionById(master.sectionId)?.name : 'إدارة القسم'}</div>
        </div>

        <div class="form-group">
          <label class="form-label">الشعبة المستهدفة (Target Section):</label>
          <select id="transferTargetSection" class="form-control">
            <option value="">-- مقر إدارة القسم (بدون شعبة) --</option>
            ${sections.map(s => `
              <option value="${s.id}" ${master.sectionId === s.id ? 'selected' : ''}>${s.name}</option>
            `).join('')}
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">الوحدة أو المحطة التابعة (إن وجدت):</label>
          <select id="transferTargetStation" class="form-control">
            <option value="">-- بدون محطة محددة --</option>
            ${stations.map(st => `
              <option value="${st.id}" ${master.stationId === st.id ? 'selected' : ''}>${st.name}</option>
            `).join('')}
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">سند النقل أو الأمر الإداري والملاحظات:</label>
          <textarea id="transferNotes" class="form-control" rows="3" placeholder="مثال: استناداً للأمر الإداري المرقم 120 لسنة 2026 ومقتضيات المصلحة العامة..." required></textarea>
        </div>

        <div style="margin-top: 1.25rem; display: flex; justify-content: flex-end; gap: 0.5rem;">
          <button type="button" class="btn btn-outline" onclick="window.app.closeModal()">إلغاء</button>
          <button type="submit" class="btn btn-primary" style="font-weight: 800;">
            تأكيد ونقل ارتباط الموظف
          </button>
        </div>
      </form>
    `);
  }

  handleSaveTransferEmployee(e, empId) {
    e.preventDefault();
    const actorUser = window.auth.getCurrentUser();
    const targetSec = document.getElementById('transferTargetSection').value;
    const targetStation = document.getElementById('transferTargetStation').value;
    const notes = document.getElementById('transferNotes').value.trim();

    const res = window.store.transferEmployeeSection(empId, targetSec, null, targetStation, notes, actorUser);
    if (res.success) {
      alert(`تم نقل الموظف بنجاح إلى (${res.transferEntry.toSectionName}) وتوثيق النقل في سجل الإضبارة.`);
      this.closeModal();
      this.render();
    } else {
      alert('خطأ: ' + res.error);
    }
  }

  // --- Section & Unit Specific Notes Modal ---
  openSectionNotesModal(empId, sectionId, customTitle) {
    const actorUser = window.auth.getCurrentUser();
    let master = window.store.getEmployeeMasterRecordByEmployeeId(empId);
    if (!master) {
      const userObj = window.store.getUserById(empId) || (window.store.getUsers() || []).find(u => u.employeeId === empId || u.id === empId);
      if (userObj) {
        master = {
          employeeId: userObj.employeeId || userObj.id || empId,
          fullName: userObj.fullName || userObj.name || 'منتسب',
          sectionNotes: userObj.sectionNotes || userObj.notes || ''
        };
      }
    }
    if (!master) {
      alert('لم يتم العثور على سجل المنتسب المحدد.');
      return;
    }

    const titleText = customTitle || `📝 معلومات وملاحظات خاصة — ${master.fullName}`;
    this.showModal(titleText, `
      <form onsubmit="window.app.handleSaveSectionNotes(event, '${master.employeeId}')">
        <div class="form-group">
          <label class="form-label">الملاحظات، التكليفات الإدارية/الميدانية، أو أرقام الكتب والمذكرات:</label>
          <textarea id="secNotesInput" class="form-control" rows="5" placeholder="أدخل الملاحظات الخاصة بعمل المنتسب، تكليفه الميداني، أو أرقام المذكرات الداخلية..." required>${master.sectionNotes || ''}</textarea>
        </div>

        <div style="font-size: 0.8rem; color: var(--md-sys-color-outline); margin-bottom: 1rem;">
          💡 يتم حفظ هذه الملاحظات في الإضبارة الموحدة للمنتسب وتنعكس مباشرة في جداول الكادر.
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 0.5rem;">
          <button type="button" class="btn btn-outline" onclick="window.app.closeModal()">إلغاء</button>
          <button type="submit" class="btn btn-primary" style="font-weight: 800;">
            💾 حفظ الملاحظات
          </button>
        </div>
      </form>
    `);
  }

  openUnitNotesModal(empId, unitId) {
    const unit = unitId ? window.store.getUnitById(unitId) : null;
    this.openSectionNotesModal(empId, unitId, unit ? `📝 ملاحظات كادر ${unit.name} — ${empId}` : null);
  }

  handleSaveSectionNotes(e, empId) {
    e.preventDefault();
    const actorUser = window.auth.getCurrentUser();
    const notes = document.getElementById('secNotesInput').value.trim();

    const res = window.store.updateEmployeeSectionNotes(empId, notes, actorUser);
    if (res.success) {
      alert('تم حفظ وتحديث الملاحظات بنجاح.');
      this.closeModal();
      this.render();
    } else {
      alert('خطأ: ' + res.error);
    }
  }

  // --- Create Master Record Modal ---
  openCreateMasterRecordModal() {
    const actorUser = window.auth.getCurrentUser();
    const sections = window.store.getSections(actorUser.departmentId);

    this.showModal('➕ إضافة موظف جديد إلى السجل الموحد (HR Master Record)', `
      <form class="modal-form-container" onsubmit="window.app.handleSaveNewMasterRecord(event)">
        <div class="modal-form-body">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
            <div class="form-group">
              <label class="form-label">الاسم الرباعي واللقب:</label>
              <input type="text" id="newMasterFullName" class="form-control" required placeholder="مثال: علي حسن محمد الخفاجي">
            </div>
            <div class="form-group">
              <label class="form-label">الرقم الوظيفي الفريد:</label>
              <input type="text" id="newMasterEmpId" class="form-control" required placeholder="EMP-2024-XXX" style="font-family: monospace; font-weight: 700; text-transform: uppercase;">
            </div>
            <div class="form-group">
              <label class="form-label">اسم الأم الثلاثي:</label>
              <input type="text" id="newMasterMother" class="form-control" placeholder="اسم الأم الثلاثي">
            </div>
            <div class="form-group">
              <label class="form-label">رقم الهاتف:</label>
              <input type="text" id="newMasterPhone" class="form-control" placeholder="0770xxxxxxx">
            </div>
            <div class="form-group">
              <label class="form-label">العنوان الوظيفي:</label>
              <input type="text" id="newMasterJobTitle" class="form-control" placeholder="معاون مهندس، مهندس، مهندس أقدم، فني، رئيس كيمياويين..." required>
            </div>
            <div class="form-group">
              <label class="form-label">الشهادة والتخصص:</label>
              <input type="text" id="newMasterDegree" class="form-control" placeholder="بكالوريوس - هندسة كيمياء">
            </div>
            <div class="form-group">
              <label class="form-label">الشعبة التابع لها:</label>
              <select id="newMasterSection" class="form-control">
                <option value="">-- مقر إدارة القسم --</option>
                ${sections.map(s => `<option value="${s.id}">${s.name}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">رقم البطاقة الموحدة (12 رقماً):</label>
              <input type="text" id="newMasterUnifiedCard" class="form-control" placeholder="199012345678">
            </div>
          </div>
        </div>

        <div class="modal-form-sticky-footer">
          <button type="button" class="btn btn-outline" onclick="window.app.closeModal()" style="font-weight: 700; padding: 0.6rem 1.4rem; border-radius: 10px;">
            إلغاء
          </button>
          <button type="submit" class="btn btn-save-prominent">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
              <polyline points="17 21 17 13 7 13 7 21"></polyline>
              <polyline points="7 3 7 8 15 8"></polyline>
            </svg>
            <span>💾 اعتماد وإضافة الموظف للسجل الأصلي</span>
          </button>
        </div>
      </form>
    `, { size: 'lg', maxWidth: '850px' });
  }

  handleSaveNewMasterRecord(e) {
    e.preventDefault();
    const actorUser = window.auth.getCurrentUser();
    const fullName = document.getElementById('newMasterFullName').value.trim();
    const employeeId = document.getElementById('newMasterEmpId').value.trim().toUpperCase();
    const motherName = document.getElementById('newMasterMother').value.trim();
    const phone = document.getElementById('newMasterPhone').value.trim();
    const jobTitle = document.getElementById('newMasterJobTitle').value.trim();
    const degree = document.getElementById('newMasterDegree').value.trim();
    const sectionId = document.getElementById('newMasterSection').value;
    const unifiedCardNumber = document.getElementById('newMasterUnifiedCard').value.trim();

    if (window.store.getEmployeeMasterRecordByEmployeeId(employeeId)) {
      alert('الرقم الوظيفي مسجل مسبقاً لموظف آخر في قاعدة البيانات.');
      return;
    }

    const newRecord = {
      employeeId,
      fullName,
      motherName,
      phone,
      jobTitle: jobTitle || 'موظف تشغيل',
      degree: degree || 'بكالوريوس',
      sectionId: sectionId || null,
      unifiedCardNumber,
      departmentId: actorUser.departmentId
    };

    const res = window.store.addOrUpdateEmployeeMasterRecord(newRecord, actorUser);
    if (res.success) {
      alert(`تمت إضافة الموظف [${fullName} - ${employeeId}] بنجاح إلى السجل الموحد الأصلي.`);
      this.closeModal();
      this.render();
    } else {
      alert('خطأ: ' + res.error);
    }
  }

  // --- Direct Approvals & Rejections ---
  handleApprovePendingUser(userId, empId) {
    const actorUser = window.auth.getCurrentUser();
    if (confirm('هل أنت متأكد من اعتماد وقبول طلب التسجيل وتفعيل حساب المستخدم؟')) {
      const user = window.store.getUserById(userId);
      if (user) {
        window.store.updateUser(userId, { status: 'APPROVED' });
        window.store.logActivity(
          actorUser.departmentId,
          actorUser.id,
          actorUser.employeeId,
          'APPROVE_USER',
          'USER_MANAGEMENT',
          `تمت الموافقة على طلب تسجيل وتفعيل حساب المستخدم: ${user.fullName} (${user.employeeId})`
        );
        alert(`تم تفعيل حساب المستخدم (${user.fullName}) بنجاح.`);
        this.render();
      }
    }
  }

  handleRejectPendingUser(userId) {
    const actorUser = window.auth.getCurrentUser();
    const reason = prompt('يرجى كتابة سبب رفض الطلب:') || 'عدم مطابقة الشروط';
    if (confirm('تأكيد رفض طلب التسجيل؟')) {
      const user = window.store.getUserById(userId);
      if (user) {
        window.store.updateUser(userId, { status: 'REJECTED' });
        window.store.logActivity(
          actorUser.departmentId,
          actorUser.id,
          actorUser.employeeId,
          'REJECT_USER',
          'USER_MANAGEMENT',
          `تم رفض طلب تسجيل المستخدم: ${user.fullName} (${user.employeeId}) - السبب: ${reason}`
        );
        alert('تم رفض طلب التسجيل.');
        this.render();
      }
    }
  }

  executeAuthorityHandover() {
    const targetUserId = document.getElementById('handoverTargetUserId').value;
    if (!targetUserId) {
      alert('يرجى اختيار موظف أولاً.');
      return;
    }

    if (confirm('تأكيد نهائي: هل أنت متأكد من تسليم منصبك كمدير قسم ونقل كافة الصلاحيات؟ لا يمكن التراجع عن هذه الخطوة إلا من خلال الإدارة العليا.')) {
      const targetUser = window.store.getUserById(targetUserId);
      const currentUser = window.auth.getCurrentUser();

      targetUser.role = 'DEPT_MANAGER';
      currentUser.role = 'EMPLOYEE';

      window.store.updateUser(targetUser.id, targetUser);
      window.store.updateUser(currentUser.id, currentUser);

      window.store.logActivity(currentUser.departmentId, currentUser.id, currentUser.employeeId, 'AUTHORITY_HANDOVER', 'USER_MANAGEMENT', `تم تسليم منصب مدير القسم إلى ${targetUser.fullName}`);
      
      window.auth.saveSession(currentUser);
      alert('تم نقل الصلاحيات بنجاح. سيتم الآن تحديث واجهتك وفق الصلاحيات الجديدة.');
      
      this.navigate('dashboard');
    }
  }

  // ==========================================================================
  // --- حاسبة الترفيع والاستحقاق (Promotion Calculator Methods) ---
  // ==========================================================================
  setPromotionCalculatorTab(subTab) {
    this.activePromotionTab = subTab;
    this.render();
  }

  // ==========================================================================
  // --- إدارة القسم (Department Management Methods) ---
  // ==========================================================================
  setDeptManagementSubTab(subTab) {
    this.currentDeptManagementSubTab = subTab;
    this.render();
  }

  filterCentralNotifs() {
    const search = (document.getElementById('centralNotifSearchInput')?.value || '').toLowerCase().trim();
    const rows = document.querySelectorAll('.central-notif-row');
    rows.forEach(row => {
      const searchData = (row.getAttribute('data-search') || '').toLowerCase();
      row.style.display = (!search || searchData.includes(search)) ? '' : 'none';
    });
  }

  filterDeptNotifs() {
    const search = (document.getElementById('deptNotifSearchInput')?.value || '').toLowerCase().trim();
    const sectionFilter = document.getElementById('deptNotifSectionFilter')?.value || 'ALL';

    const items = document.querySelectorAll('.dept-notif-item');
    items.forEach(item => {
      const title = item.getAttribute('data-title') || '';
      const content = item.getAttribute('data-content') || '';
      const section = item.getAttribute('data-section') || 'ALL_SECTIONS';

      const matchSearch = !search || title.includes(search) || content.includes(search);
      const matchSection = sectionFilter === 'ALL' || section === sectionFilter || section === 'ALL_SECTIONS';

      item.style.display = (matchSearch && matchSection) ? '' : 'none';
    });
  }

  openCreateDeptNotificationModal() {
    const actorUser = window.auth.getCurrentUser();
    const sections = window.store.getSections(actorUser.departmentId) || [];
    const units = window.store.getUnits(actorUser.departmentId) || [];

    this.showModal('📢 إصدار تبليغ رسمي جديد للقسم', `
      <form onsubmit="window.app.handleSaveDeptNotification(event)">
        <div class="form-group">
          <label class="form-label">عنوان التبليغ الإداري:</label>
          <input type="text" id="deptNotifTitleInput" class="form-control" required placeholder="مثال: جدول مواعيد السلامة والصيانة..." />
        </div>

        <div class="form-group">
          <label class="form-label">الجهة المستلمة والنطاق الموجه له:</label>
          <select id="deptNotifTargetSelect" class="form-control" required>
            <option value="ALL_SECTIONS">🌐 تعميم لكافة شعب ووحدات القسم</option>
            
            <optgroup label="🏢 شعب القسم الإنتاجية والفنية">
              ${sections.map(s => `<option value="SECTION:${s.id}">🏢 ${s.name}</option>`).join('')}
            </optgroup>

            <optgroup label="⚡ الوحدات التابعة لإدارة القسم">
              ${units.map(u => `<option value="UNIT:${u.id}">⚡ ${u.name}</option>`).join('')}
            </optgroup>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">درجة الأهمية والأسبقية:</label>
          <select id="deptNotifImportanceSelect" class="form-control">
            <option value="NORMAL">عادي</option>
            <option value="HIGH">هام</option>
            <option value="URGENT">🔴 عاجل وهام جداً</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">نص ومحتوى التبليغ الرسمي (Text):</label>
          <textarea id="deptNotifContentInput" class="form-control" rows="5" required placeholder="اكتب تفاصيل التبليغ والتعليمات الصادرة هنا..."></textarea>
        </div>

        <div style="margin-top: 1.25rem; display: flex; justify-content: flex-end; gap: 0.5rem;">
          <button type="button" class="btn btn-outline" onclick="window.app.closeModal()">إلغاء</button>
          <button type="submit" class="btn btn-primary" style="font-weight: 800;">
            📢 إصدار ونشر التبليغ فوراً
          </button>
        </div>
      </form>
    `);
  }

  handleSaveDeptNotification(e) {
    e.preventDefault();
    const actorUser = window.auth.getCurrentUser();
    const title = document.getElementById('deptNotifTitleInput').value.trim();
    const targetScopeVal = document.getElementById('deptNotifTargetSelect').value;
    const importance = document.getElementById('deptNotifImportanceSelect').value;
    const content = document.getElementById('deptNotifContentInput').value.trim();

    const sections = window.store.getSections(actorUser.departmentId) || [];
    const units = window.store.getUnits(actorUser.departmentId) || [];

    let targetScope = 'ALL_SECTIONS';
    let targetSectionId = null;
    let targetUnitId = null;
    let targetSectionName = 'كافة شعب ووحدات القسم';

    if (targetScopeVal.startsWith('SECTION:')) {
      targetScope = 'SECTION';
      targetSectionId = targetScopeVal.replace('SECTION:', '');
      const sec = sections.find(s => s.id === targetSectionId);
      targetSectionName = sec ? sec.name : 'شعبة محددة';
    } else if (targetScopeVal.startsWith('UNIT:')) {
      targetScope = 'UNIT';
      targetUnitId = targetScopeVal.replace('UNIT:', '');
      const unit = units.find(u => u.id === targetUnitId);
      targetSectionName = unit ? unit.name : 'وحدة محددة';
    } else if (targetScopeVal !== 'ALL_SECTIONS') {
      const sec = sections.find(s => s.id === targetScopeVal);
      targetScope = 'SECTION';
      targetSectionId = targetScopeVal;
      targetSectionName = sec ? sec.name : 'شعبة محددة';
    }

    const notifObj = {
      title,
      content,
      importance,
      targetScope,
      targetSectionId,
      targetUnitId,
      targetSectionName,
      status: 'PUBLISHED',
      isPinned: importance === 'URGENT',
      publishDate: new Date().toISOString(),
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      createdByName: actorUser.fullName
    };

    if (window.store.addOfficialNotification) {
      window.store.addOfficialNotification(notifObj, actorUser);
    } else {
      const db = window.store.getDb();
      if (!db.officialNotifications) db.officialNotifications = [];
      notifObj.id = 'notif-' + Date.now();
      notifObj.departmentId = actorUser.departmentId;
      db.officialNotifications.unshift(notifObj);
      window.store.saveDb(db);
    }

    alert('تم إصدار التبليغ وتعميمه بنجاح.');
    this.closeModal();
    this.render();
  }

  togglePublishDeptNotification(id) {
    const db = window.store.getDb();
    const list = db.officialNotifications || [];
    const idx = list.findIndex(n => n.id === id);
    if (idx !== -1) {
      list[idx].status = list[idx].status === 'PUBLISHED' ? 'UNPUBLISHED' : 'PUBLISHED';
      window.store.saveDb(db);
      this.render();
    }
  }

  deleteDeptNotification(id) {
    if (confirm('هل أنت متأكد من أرشفة هذا التبليغ؟')) {
      const db = window.store.getDb();
      if (db.officialNotifications) {
        db.officialNotifications = db.officialNotifications.filter(n => n.id !== id);
        window.store.saveDb(db);
        this.render();
      }
    }
  }

  setDeptStaffPage(page) {
    if (!this.deptStaffState) this.deptStaffState = { page: 1, pageSize: 25, search: '', section: 'ALL' };
    this.deptStaffState.page = Math.max(1, page);
    this.render();
  }

  setDeptStaffPageSize(size) {
    if (!this.deptStaffState) this.deptStaffState = { page: 1, pageSize: 25, search: '', section: 'ALL' };
    this.deptStaffState.pageSize = size;
    this.deptStaffState.page = 1;
    this.render();
  }

  filterDeptStaff() {
    if (!this.deptStaffState) this.deptStaffState = { page: 1, pageSize: 25, search: '', section: 'ALL' };
    const searchInput = document.getElementById('deptStaffSearchInput');
    const search = (searchInput?.value || '').trim();
    const sectionFilter = document.getElementById('deptStaffSectionFilter')?.value || 'ALL';

    const cursorStart = searchInput ? searchInput.selectionStart : null;
    const isFocused = searchInput && (document.activeElement === searchInput);

    this.deptStaffState.search = search;
    this.deptStaffState.section = sectionFilter;
    this.deptStaffState.page = 1;

    this.render();

    if (isFocused) {
      const newInput = document.getElementById('deptStaffSearchInput');
      if (newInput) {
        newInput.focus();
        if (cursorStart !== null) {
          try { newInput.setSelectionRange(cursorStart, cursorStart); } catch (e) {}
        }
      }
    }
  }

  filterSectionStaffTable() {
    const input = document.getElementById('sectionStaffSearchInput');
    if (!input) return;
    const query = (input.value || '').trim().toLowerCase();
    const rows = document.querySelectorAll('.section-staff-row');
    let visibleCount = 0;
    rows.forEach(r => {
      const name = r.getAttribute('data-name') || '';
      const empid = r.getAttribute('data-empid') || '';
      const station = r.getAttribute('data-station') || '';
      const title = r.getAttribute('data-title') || '';
      const phone = r.getAttribute('data-phone') || '';
      const match = !query || name.includes(query) || empid.includes(query) || station.includes(query) || title.includes(query) || phone.includes(query);
      r.style.display = match ? '' : 'none';
      if (match) visibleCount++;
    });
    const countBadge = document.getElementById('sectionStaffCountBadge');
    if (countBadge) {
      countBadge.innerHTML = `👥 كادر الشعبة: ${visibleCount} موظف`;
    }
  }

  filterUnitStaffTable() {
    const input = document.getElementById('unitStaffSearchInput');
    if (!input) return;
    const query = (input.value || '').trim().toLowerCase();
    const rows = document.querySelectorAll('.unit-staff-row');
    let visibleCount = 0;
    rows.forEach(r => {
      const name = r.getAttribute('data-name') || '';
      const empid = r.getAttribute('data-empid') || '';
      const title = r.getAttribute('data-title') || '';
      const phone = r.getAttribute('data-phone') || '';
      const match = !query || name.includes(query) || empid.includes(query) || title.includes(query) || phone.includes(query);
      r.style.display = match ? '' : 'none';
      if (match) visibleCount++;
    });
    const countBadge = document.getElementById('unitStaffCountBadge');
    if (countBadge) {
      countBadge.innerHTML = `👥 كادر الوحدة: ${visibleCount} موظف`;
    }
  }

  filterDeptDocs() {
    const search = (document.getElementById('deptDocSearchInput')?.value || '').toLowerCase().trim();
    const categoryFilter = document.getElementById('deptDocCategoryFilter')?.value || 'ALL';

    const rows = document.querySelectorAll('.dept-doc-row');
    rows.forEach(row => {
      const title = row.getAttribute('data-title') || '';
      const category = row.getAttribute('data-category') || '';

      const matchSearch = !search || title.includes(search);
      const matchCat = categoryFilter === 'ALL' || category === categoryFilter;

      row.style.display = (matchSearch && matchCat) ? '' : 'none';
    });
  }

  // --- Interview Requests Methods ---
  openCreateInterviewRequestModal() {
    const actorUser = window.auth.getCurrentUser();
    const sections = window.store.getSections(actorUser.departmentId);
    const userSec = sections.find(s => s.id === actorUser.sectionId)?.name || 'إدارة القسم';

    this.showModal('🤝 تقديم طلب مقابلة مع إدارة القسم', `
      <form onsubmit="window.app.handleSaveInterviewRequest(event)">
        <div style="background: var(--md-sys-color-surface-variant); padding: 0.75rem 1rem; border-radius: var(--radius-md); margin-bottom: 1.25rem;">
          <div>مقدم الطلب: <strong>${actorUser.fullName}</strong> (<code>${actorUser.employeeId}</code>)</div>
          <div style="font-size: 0.8rem; color: var(--md-sys-color-outline);">الشعبة / جهة الارتباط: ${userSec}</div>
        </div>

        <div class="form-group">
          <label class="form-label">موضوع المقابلة الأساسي:</label>
          <input type="text" id="interviewTopicInput" class="form-control" required placeholder="مثال: مناقشة مقترح صيانة المحطة / التدريب الفني..." />
        </div>

        <div class="form-group">
          <label class="form-label">درجة الأولوية:</label>
          <select id="interviewPrioritySelect" class="form-control">
            <option value="NORMAL">عادي</option>
            <option value="IMPORTANT">هام</option>
            <option value="URGENT">🔴 عاجل</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">التاريخ المقترح للمقابلة:</label>
          <input type="date" id="interviewProposedDateInput" class="form-control" required value="${new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}" />
        </div>

        <div class="form-group">
          <label class="form-label">تفاصيل مختصرة ومبررات المقابلة:</label>
          <textarea id="interviewDetailsInput" class="form-control" rows="4" required placeholder="اكتب ملخصاً واضحاً للنقاط التي ترغب في طرحها ومناقشتها مع المسؤول..."></textarea>
        </div>

        <div style="margin-top: 1.25rem; display: flex; justify-content: flex-end; gap: 0.5rem;">
          <button type="button" class="btn btn-outline" onclick="window.app.closeModal()">إلغاء</button>
          <button type="submit" class="btn btn-primary" style="font-weight: 800;">
            إرسال طلب المقابلة
          </button>
        </div>
      </form>
    `);
  }

  handleSaveInterviewRequest(e) {
    e.preventDefault();
    const actorUser = window.auth.getCurrentUser();
    const sections = window.store.getSections(actorUser.departmentId);
    const userSec = sections.find(s => s.id === actorUser.sectionId)?.name || 'إدارة القسم';

    const topic = document.getElementById('interviewTopicInput').value.trim();
    const priority = document.getElementById('interviewPrioritySelect').value;
    const proposedDate = document.getElementById('interviewProposedDateInput').value;
    const details = document.getElementById('interviewDetailsInput').value.trim();

    const res = window.store.addInterviewRequest({
      topic,
      priority,
      proposedDate,
      details,
      applicantSection: userSec
    }, actorUser);

    if (res.success) {
      alert('تم تقديم طلب المقابلة بنجاح! سيتم إشعارك فور تدقيق الموعد من الإدارة.');
      this.closeModal();
      this.render();
    }
  }

  handleUpdateInterviewStatus(reqId, newStatus) {
    const actorUser = window.auth.getCurrentUser();
    let note = prompt('أدخل ملاحظات الإدارة / الموعد المحدد (اختياري):', '');
    if (note === null) return;

    window.store.updateInterviewRequest(reqId, {
      status: newStatus,
      notes: note || (newStatus === 'ACCEPTED' ? 'تم قبول الموعد' : newStatus === 'POSTPONED' ? 'تم تأجيل الموعد' : 'تم الرفض')
    }, actorUser);

    this.render();
  }

  // ==========================================================================
  // --- منظومة السيارات وإدارة حركة العجلات (Vehicles & Fleet System Controller) ---
  // ==========================================================================
  setDeptVehiclesSection(sec) {
    this.currentDeptVehiclesSection = sec;
    this.render();
  }

  setSectionVehiclesSubTab(tab) {
    this.currentSectionVehiclesSubTab = tab;
    this.render();
  }

  setVehiclesHubTab(tab) {
    this.currentVehiclesHubTab = tab;
    this.render();
  }

  filterDeptVehicles() {
    const search = (document.getElementById('deptVehicleSearchInput')?.value || '').toLowerCase().trim();
    const sectionFilter = document.getElementById('deptVehicleSectionFilter')?.value || 'ALL';
    const statusFilter = document.getElementById('deptVehicleStatusFilter')?.value || 'ALL';

    const rows = document.querySelectorAll('.dept-vehicle-row');
    rows.forEach(row => {
      const side = (row.getAttribute('data-side') || '').toLowerCase();
      const driver = (row.getAttribute('data-driver') || '').toLowerCase();
      const plate = (row.getAttribute('data-plate') || '').toLowerCase();
      const section = row.getAttribute('data-section') || 'NONE';
      const status = row.getAttribute('data-status') || 'OPERATIONAL';

      const matchSearch = !search || side.includes(search) || driver.includes(search) || plate.includes(search);
      const matchSection = sectionFilter === 'ALL' || section === sectionFilter;
      const matchStatus = statusFilter === 'ALL' || status === statusFilter;

      row.style.display = (matchSearch && matchSection && matchStatus) ? '' : 'none';
    });
  }

  filterVehiclesHub() {
    const search = (document.getElementById('vehSearchInput')?.value || '').toLowerCase().trim();
    const sectionFilter = document.getElementById('vehSectionFilter')?.value || 'ALL';
    const affiliationFilter = document.getElementById('vehAffiliationFilter')?.value || 'ALL';
    const shiftFilter = document.getElementById('vehShiftFilter')?.value || 'ALL';

    const movementRows = document.querySelectorAll('.veh-movement-row');
    movementRows.forEach(row => {
      const searchData = (row.getAttribute('data-search') || '').toLowerCase();
      const sec = row.getAttribute('data-section') || 'ALL';
      const aff = row.getAttribute('data-affiliation') || 'ALL';
      const shift = row.getAttribute('data-shift') || 'ALL';

      const matchSearch = !search || searchData.includes(search);
      const matchSec = sectionFilter === 'ALL' || sec === sectionFilter;
      const matchAff = affiliationFilter === 'ALL' || aff === affiliationFilter;
      const matchShift = shiftFilter === 'ALL' || shift === shiftFilter;

      row.style.display = (matchSearch && matchSec && matchAff && matchShift) ? '' : 'none';
    });

    const fleetRows = document.querySelectorAll('.veh-fleet-row');
    fleetRows.forEach(row => {
      const searchData = (row.getAttribute('data-search') || '').toLowerCase();
      const sec = row.getAttribute('data-section') || 'ALL';
      const aff = row.getAttribute('data-affiliation') || 'ALL';

      const matchSearch = !search || searchData.includes(search);
      const matchSec = sectionFilter === 'ALL' || sec === sectionFilter;
      const matchAff = affiliationFilter === 'ALL' || aff === affiliationFilter;

      row.style.display = (matchSearch && matchSec && matchAff) ? '' : 'none';
    });
  }

  openCreateVehicleModal(defaultSectionId = null, defaultAffiliation = null) {
    const actorUser = window.auth.getCurrentUser();
    const sections = window.store.getSections(actorUser.departmentId);
    const targetSecId = defaultSectionId || (actorUser.sectionId || (sections[0]?.id || ''));
    const stations = targetSecId ? window.store.getStationsBySection(targetSecId) : [];

    const isSectionContext = !!defaultSectionId || (actorUser.role === 'SECTION_MANAGER' && actorUser.sectionId);
    const initialAffiliation = defaultAffiliation || (isSectionContext ? 'SECTION_MGMT' : 'DEPT_MGMT');

    this.showModal('🚘 إضافة سيارة جديدة', `
      <form onsubmit="window.app.handleSaveCreateVehicle(event)">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
          <div class="form-group">
            <label class="form-label">نوع السيارة (طراز المركبة):</label>
            <input type="text" id="vTypeInput" class="form-control" required placeholder="مثال: تويوتا لاندكروزر / هايلوكس" />
          </div>

          <div class="form-group">
            <label class="form-label">الصفة:</label>
            <select id="vOwnershipSelect" class="form-control" onchange="window.app.onVehicleOwnershipChange()" required>
              <option value="GOVERNMENT">حكومي</option>
              <option value="RENTAL">مؤجرة</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label" id="vSideNoLabel">الرقم الجانبي (إجباري للحكومي):</label>
            <input type="text" id="vSideNoInput" class="form-control" required placeholder="مثال: 105" style="font-family: monospace; font-weight: 700;" />
          </div>

          <div class="form-group">
            <label class="form-label">رقم لوحة السيارة:</label>
            <input type="text" id="vPlateNoInput" class="form-control" required placeholder="مثال: 12490 - بصرة / حكومي" />
          </div>

          <div class="form-group">
            <label class="form-label">جهة الارتباط:</label>
            <select id="vAffiliationSelect" class="form-control" onchange="window.app.onVehicleAffiliationChange()" required>
              ${!isSectionContext ? '<option value="DEPT_MGMT">إدارة القسم</option>' : ''}
              <option value="SECTION_MGMT" ${initialAffiliation === 'SECTION_MGMT' ? 'selected' : ''}>إدارة الشعبة</option>
              <option value="STATION" ${initialAffiliation === 'STATION' ? 'selected' : ''}>محطة</option>
            </select>
          </div>

          <div class="form-group" id="vSectionGroup" style="${initialAffiliation === 'DEPT_MGMT' ? 'display: none;' : ''}">
            <label class="form-label">الشعبة التابعة لها:</label>
            <select id="vSectionSelect" class="form-control" onchange="window.app.onVehicleSectionChange()">
              ${sections.map(s => `<option value="${s.id}" ${s.id === targetSecId ? 'selected' : ''}>${s.name}</option>`).join('')}
            </select>
          </div>
        </div>

        <div class="form-group" id="vStationGroup" style="display: none;">
          <label class="form-label">المحطة التابعة للشعبة (محطات الشعبة الحالية فقط):</label>
          <select id="vStationSelect" class="form-control">
            ${stations.length > 0 ? stations.map(st => `<option value="${st.id}">${st.name}</option>`).join('') : '<option value="">لا توجد محطات مسجلة لهذه الشعبة</option>'}
          </select>
        </div>

        <!-- Shift Drivers for Station Affiliated Cars -->
        <div id="vShiftDriversContainer" style="display: none; background: var(--md-sys-color-surface-variant); padding: 0.85rem; border-radius: var(--radius-sm); margin-top: 0.75rem;">
          <h5 style="margin: 0 0 0.5rem 0; font-size: 0.88rem; color: var(--md-sys-color-primary); font-weight: 700;">
            👥 سائقو النوبات (A, B, C, D) — حد أقصى 4 سائقين (يمكن ترك أي نوبة غير مخصصة):
          </h5>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;">
            <div class="form-group" style="margin-bottom: 0.35rem;">
              <label class="form-label" style="font-size: 0.78rem;">سائق النوبة A:</label>
              <input type="text" id="vDriverShiftA" class="form-control" style="font-size: 0.82rem;" placeholder="اسم السائق أو اتركه فارغاً" />
            </div>
            <div class="form-group" style="margin-bottom: 0.35rem;">
              <label class="form-label" style="font-size: 0.78rem;">سائق النوبة B:</label>
              <input type="text" id="vDriverShiftB" class="form-control" style="font-size: 0.82rem;" placeholder="اسم السائق أو اتركه فارغاً" />
            </div>
            <div class="form-group" style="margin-bottom: 0.35rem;">
              <label class="form-label" style="font-size: 0.78rem;">سائق النوبة C:</label>
              <input type="text" id="vDriverShiftC" class="form-control" style="font-size: 0.82rem;" placeholder="اسم السائق أو اتركه فارغاً" />
            </div>
            <div class="form-group" style="margin-bottom: 0.35rem;">
              <label class="form-label" style="font-size: 0.78rem;">سائق النوبة D:</label>
              <input type="text" id="vDriverShiftD" class="form-control" style="font-size: 0.82rem;" placeholder="اسم السائق أو اتركه فارغاً" />
            </div>
          </div>
        </div>

        <!-- Single Driver for Dept/Section MGMT -->
        <div id="vSingleDriverContainer" style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-top: 0.75rem;">
          <div class="form-group">
            <label class="form-label">اسم السائق المسؤول:</label>
            <input type="text" id="vSingleDriverName" class="form-control" placeholder="اسم السائق المعتمد" />
          </div>
          <div class="form-group">
            <label class="form-label">رقم هاتف السائق:</label>
            <input type="text" id="vSingleDriverPhone" class="form-control" placeholder="0770XXXXXXX" />
          </div>
        </div>

        <div class="form-group" style="margin-top: 0.75rem;">
          <label class="form-label">الحالة التشغيلية للسيارة:</label>
          <select id="vOperationalStateSelect" class="form-control" required>
            <option value="OPERATIONAL">🟢 أخضر — عاملة</option>
            <option value="IN_REPAIR">🟡 أصفر — في التصليح</option>
            <option value="STOPPED">🔴 أحمر — متوقفة</option>
          </select>
        </div>

        <div style="margin-top: 1.25rem; display: flex; justify-content: flex-end; gap: 0.5rem;">
          <button type="button" class="btn btn-outline" onclick="window.app.closeModal()">إلغاء</button>
          <button type="submit" class="btn btn-primary" style="font-weight: 800;">
            💾 حفظ بيانات السيارة
          </button>
        </div>
      </form>
    `);
  }

  onVehicleOwnershipChange() {
    const ownership = document.getElementById('vOwnershipSelect')?.value;
    const sideLabel = document.getElementById('vSideNoLabel');
    const sideInput = document.getElementById('vSideNoInput');
    if (ownership === 'RENTAL') {
      if (sideLabel) sideLabel.textContent = 'الرقم الجانبي (اختياري للمؤجرة):';
      if (sideInput) sideInput.required = false;
    } else {
      if (sideLabel) sideLabel.textContent = 'الرقم الجانبي (إجباري للحكومي):';
      if (sideInput) sideInput.required = true;
    }
  }

  onVehicleAffiliationChange() {
    const aff = document.getElementById('vAffiliationSelect')?.value;
    const secGroup = document.getElementById('vSectionGroup');
    const stGroup = document.getElementById('vStationGroup');
    const shiftBox = document.getElementById('vShiftDriversContainer');
    const singleBox = document.getElementById('vSingleDriverContainer');

    if (aff === 'DEPT_MGMT') {
      if (secGroup) secGroup.style.display = 'none';
      if (stGroup) stGroup.style.display = 'none';
      if (shiftBox) shiftBox.style.display = 'none';
      if (singleBox) singleBox.style.display = 'grid';
    } else if (aff === 'SECTION_MGMT') {
      if (secGroup) secGroup.style.display = 'block';
      if (stGroup) stGroup.style.display = 'none';
      if (shiftBox) shiftBox.style.display = 'none';
      if (singleBox) singleBox.style.display = 'grid';
    } else if (aff === 'STATION') {
      if (secGroup) secGroup.style.display = 'block';
      if (stGroup) stGroup.style.display = 'block';
      if (shiftBox) shiftBox.style.display = 'block';
      if (singleBox) singleBox.style.display = 'none';
      this.onVehicleSectionChange();
    }
  }

  onVehicleSectionChange() {
    const secId = document.getElementById('vSectionSelect')?.value;
    const stSelect = document.getElementById('vStationSelect');
    if (stSelect && secId) {
      const stations = window.store.getStationsBySection(secId);
      if (stations.length > 0) {
        stSelect.innerHTML = stations.map(st => `<option value="${st.id}">${st.name}</option>`).join('');
      } else {
        stSelect.innerHTML = '<option value="">لا توجد محطات مسجلة لهذه الشعبة</option>';
      }
    }
  }

  handleSaveCreateVehicle(e) {
    e.preventDefault();
    const actorUser = window.auth.getCurrentUser();
    const vehicleType = document.getElementById('vTypeInput').value.trim();
    const ownershipType = document.getElementById('vOwnershipSelect').value;
    const sideNumber = document.getElementById('vSideNoInput').value.trim();
    const vehicleNumber = document.getElementById('vPlateNoInput').value.trim();
    const affiliationType = document.getElementById('vAffiliationSelect').value;
    const sectionId = affiliationType !== 'DEPT_MGMT' ? document.getElementById('vSectionSelect')?.value : null;
    const stationId = affiliationType === 'STATION' ? document.getElementById('vStationSelect')?.value : null;
    const operationalState = document.getElementById('vOperationalStateSelect').value;

    let driverName = null;
    let driverPhone = null;
    let shiftDrivers = null;

    if (affiliationType === 'STATION') {
      const drvA = document.getElementById('vDriverShiftA')?.value.trim();
      const drvB = document.getElementById('vDriverShiftB')?.value.trim();
      const drvC = document.getElementById('vDriverShiftC')?.value.trim();
      const drvD = document.getElementById('vDriverShiftD')?.value.trim();

      shiftDrivers = {
        shiftA: drvA ? { driverId: 'drv-a-' + Date.now(), driverName: drvA } : null,
        shiftB: drvB ? { driverId: 'drv-b-' + Date.now(), driverName: drvB } : null,
        shiftC: drvC ? { driverId: 'drv-c-' + Date.now(), driverName: drvC } : null,
        shiftD: drvD ? { driverId: 'drv-d-' + Date.now(), driverName: drvD } : null
      };
    } else {
      driverName = document.getElementById('vSingleDriverName')?.value.trim() || 'سائق غير محدد';
      driverPhone = document.getElementById('vSingleDriverPhone')?.value.trim() || '';
    }

    const res = window.store.addVehicle({
      vehicleType,
      ownershipType,
      sideNumber,
      vehicleNumber,
      affiliationType,
      sectionId,
      stationId,
      driverName,
      driverPhone,
      shiftDrivers,
      operationalState
    }, actorUser);

    if (res.success) {
      alert('تمت إضافة السيارة بنجاح إلى سجل السيارات.');
      this.closeModal();
      this.render();
    } else {
      alert('تعذر الحفظ: ' + res.error);
    }
  }

  openEditVehicleModal(vehicleId) {
    const actorUser = window.auth.getCurrentUser();
    const v = window.store.getVehicleById(vehicleId);
    if (!v) return;

    const sections = window.store.getSections(actorUser.departmentId);
    const targetSecId = v.sectionId || (sections[0]?.id || '');
    const stations = targetSecId ? window.store.getStationsBySection(targetSecId) : [];

    const isGov = v.ownershipType === 'GOVERNMENT';
    const isStation = v.affiliationType === 'STATION';
    const isDept = v.affiliationType === 'DEPT_MGMT';

    const sA = v.shiftDrivers?.shiftA?.driverName || '';
    const sB = v.shiftDrivers?.shiftB?.driverName || '';
    const sC = v.shiftDrivers?.shiftC?.driverName || '';
    const sD = v.shiftDrivers?.shiftD?.driverName || '';

    this.showModal(`✏️ تعديل بيانات السيارة ${v.vehicleType} (${v.vehicleNumber})`, `
      <form onsubmit="window.app.handleSaveEditVehicle(event, '${v.id}')">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
          <div class="form-group">
            <label class="form-label">نوع السيارة:</label>
            <input type="text" id="editVType" class="form-control" required value="${v.vehicleType || ''}" />
          </div>

          <div class="form-group">
            <label class="form-label">الصفة:</label>
            <select id="editVOwnership" class="form-control" required>
              <option value="GOVERNMENT" ${isGov ? 'selected' : ''}>حكومي</option>
              <option value="RENTAL" ${!isGov ? 'selected' : ''}>مؤجرة</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">الرقم الجانبي:</label>
            <input type="text" id="editVSideNo" class="form-control" value="${v.sideNumber || ''}" style="font-family: monospace; font-weight: 700;" />
          </div>

          <div class="form-group">
            <label class="form-label">رقم السيارة:</label>
            <input type="text" id="editVPlateNo" class="form-control" required value="${v.vehicleNumber || ''}" />
          </div>

          <div class="form-group">
            <label class="form-label">جهة الارتباط:</label>
            <select id="editVAffiliation" class="form-control" onchange="window.app.onEditVehicleAffiliationChange()" required>
              <option value="DEPT_MGMT" ${isDept ? 'selected' : ''}>إدارة القسم</option>
              <option value="SECTION_MGMT" ${v.affiliationType === 'SECTION_MGMT' ? 'selected' : ''}>إدارة الشعبة</option>
              <option value="STATION" ${isStation ? 'selected' : ''}>محطة</option>
            </select>
          </div>

          <div class="form-group" id="editVSectionGroup" style="${isDept ? 'display: none;' : ''}">
            <label class="form-label">الشعبة التابعة لها:</label>
            <select id="editVSection" class="form-control" onchange="window.app.onEditVehicleSectionChange()">
              ${sections.map(s => `<option value="${s.id}" ${s.id === v.sectionId ? 'selected' : ''}>${s.name}</option>`).join('')}
            </select>
          </div>
        </div>

        <div class="form-group" id="editVStationGroup" style="${!isStation ? 'display: none;' : ''}">
          <label class="form-label">المحطة التابعة للشعبة:</label>
          <select id="editVStation" class="form-control">
            ${stations.map(st => `<option value="${st.id}" ${st.id === v.stationId ? 'selected' : ''}>${st.name}</option>`).join('')}
          </select>
        </div>

        <!-- Shift Drivers for Station Affiliated Cars -->
        <div id="editVShiftDriversContainer" style="${!isStation ? 'display: none;' : ''}; background: var(--md-sys-color-surface-variant); padding: 0.85rem; border-radius: var(--radius-sm); margin-top: 0.75rem;">
          <h5 style="margin: 0 0 0.5rem 0; font-size: 0.88rem; color: var(--md-sys-color-primary); font-weight: 700;">
            👥 سائقو النوبات (A, B, C, D) — حد أقصى 4 سائقين (يمكن ترك أي نوبة غير مخصصة):
          </h5>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;">
            <div class="form-group" style="margin-bottom: 0.35rem;">
              <label class="form-label" style="font-size: 0.78rem;">سائق النوبة A:</label>
              <input type="text" id="editVDriverA" class="form-control" style="font-size: 0.82rem;" value="${sA}" placeholder="اسم السائق أو غير مخصص" />
            </div>
            <div class="form-group" style="margin-bottom: 0.35rem;">
              <label class="form-label" style="font-size: 0.78rem;">سائق النوبة B:</label>
              <input type="text" id="editVDriverB" class="form-control" style="font-size: 0.82rem;" value="${sB}" placeholder="اسم السائق أو غير مخصص" />
            </div>
            <div class="form-group" style="margin-bottom: 0.35rem;">
              <label class="form-label" style="font-size: 0.78rem;">سائق النوبة C:</label>
              <input type="text" id="editVDriverC" class="form-control" style="font-size: 0.82rem;" value="${sC}" placeholder="اسم السائق أو غير مخصص" />
            </div>
            <div class="form-group" style="margin-bottom: 0.35rem;">
              <label class="form-label" style="font-size: 0.78rem;">سائق النوبة D:</label>
              <input type="text" id="editVDriverD" class="form-control" style="font-size: 0.82rem;" value="${sD}" placeholder="اسم السائق أو غير مخصص" />
            </div>
          </div>
        </div>

        <!-- Single Driver for Dept/Section MGMT -->
        <div id="editVSingleDriverContainer" style="${isStation ? 'display: none;' : 'display: grid;'}; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-top: 0.75rem;">
          <div class="form-group">
            <label class="form-label">اسم السائق المسؤول:</label>
            <input type="text" id="editVSingleDriverName" class="form-control" value="${v.driverName || ''}" placeholder="اسم السائق المعتمد" />
          </div>
          <div class="form-group">
            <label class="form-label">رقم هاتف السائق:</label>
            <input type="text" id="editVSingleDriverPhone" class="form-control" value="${v.driverPhone || ''}" placeholder="0770XXXXXXX" />
          </div>
        </div>

        <div class="form-group" style="margin-top: 0.75rem;">
          <label class="form-label">الحالة التشغيلية للسيارة:</label>
          <select id="editVState" class="form-control" required>
            <option value="OPERATIONAL" ${v.operationalState === 'OPERATIONAL' || v.operationalState === 'عاملة' ? 'selected' : ''}>🟢 أخضر — عاملة</option>
            <option value="IN_REPAIR" ${v.operationalState === 'IN_REPAIR' || v.operationalState === 'في التصليح' ? 'selected' : ''}>🟡 أصفر — في التصليح</option>
            <option value="STOPPED" ${v.operationalState === 'STOPPED' || v.operationalState === 'متوقفة' ? 'selected' : ''}>🔴 أحمر — متوقفة</option>
          </select>
        </div>

        <div style="margin-top: 1.25rem; display: flex; justify-content: flex-end; gap: 0.5rem;">
          <button type="button" class="btn btn-outline" onclick="window.app.closeModal()">إلغاء</button>
          <button type="submit" class="btn btn-primary" style="font-weight: 800;">
            💾 حفظ التعديلات
          </button>
        </div>
      </form>
    `);
  }

  onEditVehicleAffiliationChange() {
    const aff = document.getElementById('editVAffiliation')?.value;
    const secGroup = document.getElementById('editVSectionGroup');
    const stGroup = document.getElementById('editVStationGroup');
    const shiftBox = document.getElementById('editVShiftDriversContainer');
    const singleBox = document.getElementById('editVSingleDriverContainer');

    if (aff === 'DEPT_MGMT') {
      if (secGroup) secGroup.style.display = 'none';
      if (stGroup) stGroup.style.display = 'none';
      if (shiftBox) shiftBox.style.display = 'none';
      if (singleBox) singleBox.style.display = 'grid';
    } else if (aff === 'SECTION_MGMT') {
      if (secGroup) secGroup.style.display = 'block';
      if (stGroup) stGroup.style.display = 'none';
      if (shiftBox) shiftBox.style.display = 'none';
      if (singleBox) singleBox.style.display = 'grid';
    } else if (aff === 'STATION') {
      if (secGroup) secGroup.style.display = 'block';
      if (stGroup) stGroup.style.display = 'block';
      if (shiftBox) shiftBox.style.display = 'block';
      if (singleBox) singleBox.style.display = 'none';
      this.onEditVehicleSectionChange();
    }
  }

  onEditVehicleSectionChange() {
    const secId = document.getElementById('editVSection')?.value;
    const stSelect = document.getElementById('editVStation');
    if (stSelect && secId) {
      const stations = window.store.getStationsBySection(secId);
      if (stations.length > 0) {
        stSelect.innerHTML = stations.map(st => `<option value="${st.id}">${st.name}</option>`).join('');
      } else {
        stSelect.innerHTML = '<option value="">لا توجد محطات مسجلة لهذه الشعبة</option>';
      }
    }
  }

  handleSaveEditVehicle(e, vehicleId) {
    e.preventDefault();
    const actorUser = window.auth.getCurrentUser();
    const vehicleType = document.getElementById('editVType').value.trim();
    const ownershipType = document.getElementById('editVOwnership').value;
    const sideNumber = document.getElementById('editVSideNo').value.trim();
    const vehicleNumber = document.getElementById('editVPlateNo').value.trim();
    const affiliationType = document.getElementById('editVAffiliation').value;
    const sectionId = affiliationType !== 'DEPT_MGMT' ? document.getElementById('editVSection')?.value : null;
    const stationId = affiliationType === 'STATION' ? document.getElementById('editVStation')?.value : null;
    const operationalState = document.getElementById('editVState').value;

    let driverName = null;
    let driverPhone = null;
    let shiftDrivers = null;

    if (affiliationType === 'STATION') {
      const drvA = document.getElementById('editVDriverA')?.value.trim();
      const drvB = document.getElementById('editVDriverB')?.value.trim();
      const drvC = document.getElementById('editVDriverC')?.value.trim();
      const drvD = document.getElementById('editVDriverD')?.value.trim();

      shiftDrivers = {
        shiftA: drvA ? { driverId: 'drv-a', driverName: drvA } : null,
        shiftB: drvB ? { driverId: 'drv-b', driverName: drvB } : null,
        shiftC: drvC ? { driverId: 'drv-c', driverName: drvC } : null,
        shiftD: drvD ? { driverId: 'drv-d', driverName: drvD } : null
      };
    } else {
      driverName = document.getElementById('editVSingleDriverName')?.value.trim() || 'سائق غير محدد';
      driverPhone = document.getElementById('editVSingleDriverPhone')?.value.trim() || '';
    }

    const res = window.store.updateVehicle(vehicleId, {
      vehicleType,
      ownershipType,
      sideNumber,
      vehicleNumber,
      affiliationType,
      sectionId,
      stationId,
      driverName,
      driverPhone,
      shiftDrivers,
      operationalState
    }, actorUser);

    if (res.success) {
      alert('تم تحديث بيانات السيارة بنجاح.');
      this.closeModal();
      this.render();
    } else {
      alert('تعذر التحديث: ' + res.error);
    }
  }

  deleteVehicle(vehicleId) {
    if (confirm('هل أنت متأكد من حذف هذه السيارة من سجل السيارات؟')) {
      const actorUser = window.auth.getCurrentUser();
      window.store.deleteVehicle(vehicleId, actorUser);
      this.render();
    }
  }

  // --- Start & End Movement Modal Logic ---
  openStartVehicleMovementModal(defaultVehicleId = null) {
    const actorUser = window.auth.getCurrentUser();
    const vehicles = window.store.getVehicles(actorUser.departmentId, {}, actorUser);
    const availableVehicles = vehicles.filter(v => 
      (v.operationalState === 'OPERATIONAL' || v.operationalState === 'عاملة' || v.operationalState === 'بالعمل') &&
      v.movementState !== 'IN_TRANSIT'
    );

    const shiftInfo = window.store.getCurrentShiftInfo();

    this.showModal('🚀 تسجيل وبدء حركة سيارة رسمية', `
      <form onsubmit="window.app.handleSaveStartVehicleMovement(event)">
        <div class="form-group">
          <label class="form-label">اختر السيارة المتاحة:</label>
          <select id="mvVehicleSelect" class="form-control" onchange="window.app.onMovementVehicleSelect(this.value)" required>
            <option value="">-- اضغط لاختيار السيارة --</option>
            ${availableVehicles.map(v => `
              <option value="${v.id}" ${defaultVehicleId === v.id ? 'selected' : ''}>
                ${v.vehicleType} | ${v.sideNumber ? '#' + v.sideNumber : v.vehicleNumber} | ${v.affiliationType === 'DEPT_MGMT' ? 'إدارة القسم' : (v.stationName || v.sectionName)}
              </option>
            `).join('')}
          </select>
        </div>

        <!-- Vehicle Details Auto-Resolved Box -->
        <div id="mvAutoDetailsBox" style="background: var(--md-sys-color-surface-variant); padding: 0.85rem; border-radius: var(--radius-sm); margin-bottom: 0.85rem;">
          <div style="font-size: 0.82rem; color: var(--md-sys-color-outline); margin-bottom: 0.35rem;">
            🕒 النوبة الحالية للنظام: <strong style="color: var(--md-sys-color-primary);">${shiftInfo.shiftName}</strong>
          </div>
          <div id="mvResolvedDriverInfo" style="font-size: 0.9rem; font-weight: 700; color: var(--md-sys-color-on-surface);">
            قم باختيار سيارة من القائمة أعلاه لعرض السائق والنوبة تلقائياً.
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">الغرض من الحركة (المهمة الميدانية):</label>
          <textarea id="mvPurposeInput" class="form-control" rows="3" required placeholder="اكتب الغرض من المهمة والوجهة المحددة..."></textarea>
        </div>

        <div style="margin-top: 1.25rem; display: flex; justify-content: flex-end; gap: 0.5rem;">
          <button type="button" class="btn btn-outline" onclick="window.app.closeModal()">إلغاء</button>
          <button type="submit" id="mvSubmitBtn" class="btn btn-primary" style="font-weight: 800;">
            🚀 بدء الحركة وتسجيل وقت الانطلاق
          </button>
        </div>
      </form>
    `);

    if (defaultVehicleId) {
      this.onMovementVehicleSelect(defaultVehicleId);
    }
  }

  onMovementVehicleSelect(vehicleId) {
    const box = document.getElementById('mvResolvedDriverInfo');
    const submitBtn = document.getElementById('mvSubmitBtn');
    if (!box || !vehicleId) return;

    const v = window.store.getVehicleById(vehicleId);
    if (!v) {
      box.innerHTML = 'السيارة غير موجودة.';
      if (submitBtn) submitBtn.disabled = true;
      return;
    }

    const shiftInfo = window.store.getCurrentShiftInfo();
    const activeShift = shiftInfo.currentShift; // A, B, C, D

    if (v.affiliationType === 'STATION') {
      const assignedDriver = v.shiftDrivers ? v.shiftDrivers['shift' + activeShift] : null;

      if (!assignedDriver || !assignedDriver.driverName || !assignedDriver.driverName.trim()) {
        box.innerHTML = `
          <div style="color: #d93025; font-size: 0.88rem; font-weight: 800;">
            ⚠️ لا يوجد سائق مخصص لهذه السيارة في النوبة الحالية (${shiftInfo.shiftName}). يمنع بدء الحركة.
          </div>
          <div style="font-size: 0.78rem; color: var(--md-sys-color-outline); margin-top: 0.25rem;">
            الجهة: محطة ${v.stationName || '—'} | الشعبة: ${v.sectionName}
          </div>
        `;
        if (submitBtn) submitBtn.disabled = true;
      } else {
        box.innerHTML = `
          <div style="color: #137333; font-size: 0.9rem; font-weight: 800;">
            👤 السائق المحدد تلقائياً: ${assignedDriver.driverName} (النوبة ${activeShift})
          </div>
          <div style="font-size: 0.8rem; color: var(--md-sys-color-outline); margin-top: 0.25rem;">
            المركبة: ${v.vehicleType} | لوحة: ${v.vehicleNumber} | رقم جانبي: #${v.sideNumber || '—'} | المحطة: ${v.stationName}
          </div>
        `;
        if (submitBtn) submitBtn.disabled = false;
      }
    } else {
      box.innerHTML = `
        <div style="color: #137333; font-size: 0.9rem; font-weight: 800;">
          👤 السائق المعتمد: ${v.driverName || 'سائق القسم'}
        </div>
        <div style="font-size: 0.8rem; color: var(--md-sys-color-outline); margin-top: 0.25rem;">
          المركبة: ${v.vehicleType} | لوحة: ${v.vehicleNumber} | رقم جانبي: #${v.sideNumber || '—'} | الارتباط: ${v.affiliationType === 'DEPT_MGMT' ? 'إدارة القسم' : v.sectionName}
        </div>
      `;
      if (submitBtn) submitBtn.disabled = false;
    }
  }

  handleSaveStartVehicleMovement(e) {
    e.preventDefault();
    const actorUser = window.auth.getCurrentUser();
    const vehicleId = document.getElementById('mvVehicleSelect').value;
    const purpose = document.getElementById('mvPurposeInput').value.trim();

    const res = window.store.startVehicleMovement({
      vehicleId,
      purpose
    }, actorUser);

    if (res.success) {
      alert('تم بدء الحركة وتسجيل وقت الانطلاق آلياً بنجاح.');
      this.closeModal();
      this.render();
    } else {
      alert('تعذر بدء الحركة: ' + res.error);
    }
  }

  endVehicleMovement(movementId) {
    if (confirm('هل تؤكد عودة السيارة وإنهاء الحركة وتسجيل وقت الرجوع؟')) {
      const actorUser = window.auth.getCurrentUser();
      const res = window.store.endVehicleMovement(movementId, actorUser);
      if (res.success) {
        alert('تم إنهاء الحركة وتحديث حالة السيارة إلى متاحة بنجاح.');
        this.render();
      } else {
        alert('خطأ: ' + res.error);
      }
    }
  }

  exportVehiclesDataCSV() {
    const actorUser = window.auth.getCurrentUser();
    const movements = window.store.getVehicleMovements(actorUser.departmentId, {}, actorUser);

    const headers = ['السائق', 'النوبة', 'نوع السيارة', 'الصفة', 'رقم السيارة', 'الرقم الجانبي', 'الشعبة', 'جهة الارتباط', 'المحطة', 'الغرض', 'وقت الذهاب', 'وقت الرجوع', 'الحالة'];
    const rows = movements.map(m => [
      m.driverName || '',
      m.shift || '',
      m.vehicleType || '',
      m.ownershipType === 'GOVERNMENT' ? 'حكومي' : 'مؤجرة',
      m.vehicleNumber || '',
      m.sideNumber || '',
      m.sectionName || '',
      m.affiliationType === 'DEPT_MGMT' ? 'إدارة القسم' : (m.affiliationType === 'SECTION_MGMT' ? 'إدارة الشعبة' : 'محطة'),
      m.stationName || '',
      m.purpose || '',
      m.departureTime ? new Date(m.departureTime).toLocaleString('ar-IQ') : '',
      m.returnTime ? new Date(m.returnTime).toLocaleString('ar-IQ') : '',
      m.status === 'IN_TRANSIT' ? 'في حركة' : 'مكتملة'
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `vehicle_movements_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  }

  // --- Department Vehicles Aliases ---
  openCreateDeptVehicleModal() {
    return this.openCreateVehicleModal(null, 'DEPT_MGMT');
  }

  openEditDeptVehicleModal(id) {
    return this.openEditVehicleModal(id);
  }

  deleteDeptVehicle(id) {
    return this.deleteVehicle(id);
  }

  // ==========================================================================
  // --- Shift Settings Controller Methods (إدارة وضبط مواعيد النوبات) ---
  // ==========================================================================
  openShiftSettingsModal() {
    const actorUser = window.auth.getCurrentUser();
    if (!actorUser) return;

    const canManage = window.rbac && typeof window.rbac.hasPermission === 'function'
      ? (window.rbac.hasPermission(actorUser, 'MANAGE_SHIFTS') || actorUser.role === 'DEPT_MANAGER' || actorUser.role === 'SUPER_ADMIN')
      : (actorUser.role === 'DEPT_MANAGER' || actorUser.role === 'SUPER_ADMIN');

    if (!canManage) {
      alert('⛔ غير مصرح لك بتعديل مواعيد النوبات (تحتاج إلى صلاحية إدارة مواعيد النوبات).');
      return;
    }

    const settings = window.store.getShiftSettings();
    const currentShiftInfo = window.store.getCurrentShiftInfo();
    const currentStartTime = settings.startTime || '07:30';

    this.showModal('⚙️ ضبط وإدارة مواعيد وجداول النوبات التشغيلية', `
      <form onsubmit="window.app.handleSaveShiftSettings(event)" class="shift-modal-container">
        <!-- Glass Hero Header Banner -->
        <div class="shift-hero-banner">
          <div>
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <span style="font-size: 1.35rem;">🔄</span>
              <strong style="font-size: 1.1rem; font-weight: 900; letter-spacing: -0.2px;">
                ${currentShiftInfo.shiftName}
              </strong>
            </div>
            <div style="font-size: 0.82rem; opacity: 0.85; margin-top: 4px; display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
              <span>🗓️ ${currentShiftInfo.period}</span>
              <span>•</span>
              <span>✍️ آخر تحديث: <strong>${settings.lastModifiedBy || 'مدير القسم'}</strong></span>
            </div>
          </div>
          <div class="shift-hero-badge">
            <span class="shift-pulse-live-dot"></span>
            <span>النظام نشط والتسلسل تلقائي</span>
          </div>
        </div>

        <!-- 2-Column Glass Grid -->
        <div class="shift-glass-grid">
          <!-- Card 1: Time & Cycle -->
          <div class="shift-glass-card">
            <div class="shift-card-header">
              <span>⏰</span>
              <span>توقيت ودورة النوبة اليومية</span>
            </div>

            <div class="form-group" style="margin-bottom: 0.25rem;">
              <label class="form-label" style="font-weight: 800; font-size: 0.85rem;">⏰ وقت بدء النوبة المعتمد:</label>
              <input type="time" id="shiftStartTimeInput" class="form-control" value="${currentStartTime}" oninput="window.app.updateShiftModalPreview()" onchange="window.app.updateShiftModalPreview()" required style="font-weight: 800; font-size: 1rem; text-align: center;" />
              
              <div class="shift-preset-chips-container">
                <span style="font-size: 0.74rem; font-weight: 700; opacity: 0.8; margin-left: 0.2rem;">توقيتات سريعة:</span>
                <button type="button" class="shift-preset-chip ${currentStartTime === '06:00' ? 'active' : ''}" data-time="06:00" onclick="window.app.setShiftStartTimePreset('06:00')">06:00 ص</button>
                <button type="button" class="shift-preset-chip ${currentStartTime === '07:00' ? 'active' : ''}" data-time="07:00" onclick="window.app.setShiftStartTimePreset('07:00')">07:00 ص</button>
                <button type="button" class="shift-preset-chip ${currentStartTime === '07:30' ? 'active' : ''}" data-time="07:30" onclick="window.app.setShiftStartTimePreset('07:30')">07:30 ص</button>
                <button type="button" class="shift-preset-chip ${currentStartTime === '08:00' ? 'active' : ''}" data-time="08:00" onclick="window.app.setShiftStartTimePreset('08:00')">08:00 ص</button>
                <button type="button" class="shift-preset-chip ${currentStartTime === '08:30' ? 'active' : ''}" data-time="08:30" onclick="window.app.setShiftStartTimePreset('08:30')">08:30 ص</button>
              </div>
            </div>

            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label" style="font-weight: 800; font-size: 0.85rem;">⌛ مدة دورة النوبة (بالساعات):</label>
              <select id="shiftDurationSelect" class="form-control" onchange="window.app.updateShiftModalPreview()" required style="font-weight: 700;">
                <option value="24" ${settings.shiftDurationHours == 24 ? 'selected' : ''}>24 ساعة (نوبة يومية كاملة - افتراضي)</option>
                <option value="12" ${settings.shiftDurationHours == 12 ? 'selected' : ''}>12 ساعة (نوبتان باليوم)</option>
                <option value="8" ${settings.shiftDurationHours == 8 ? 'selected' : ''}>8 ساعات (ثلاث نوبات باليوم)</option>
              </select>
              <small style="color: var(--md-sys-color-outline); font-size: 0.72rem; margin-top: 3px; display: block;">طول الفترة الزمنية لكل وجبة قبل انتقال الراية للنوبة التالية</small>
            </div>
          </div>

          <!-- Card 2: Reference Shift & Base Date -->
          <div class="shift-glass-card">
            <div class="shift-card-header">
              <span>🎯</span>
              <span>الأساس المرجعي والتسلسل</span>
            </div>

            <div class="form-group" style="margin-bottom: 0.5rem;">
              <label class="form-label" style="font-weight: 800; font-size: 0.85rem;">🎯 النوبة المرجعية (نوبة الأساس):</label>
              <select id="shiftReferenceSelect" class="form-control" onchange="window.app.updateShiftModalPreview()" required style="font-weight: 700;">
                <option value="A" ${settings.referenceShift === 'A' ? 'selected' : ''}>🅰️ النوبة الأولى (A)</option>
                <option value="B" ${settings.referenceShift === 'B' ? 'selected' : ''}>🅱️ النوبة الثانية (B)</option>
                <option value="C" ${settings.referenceShift === 'C' ? 'selected' : ''}>🅲 النوبة الثالثة (C)</option>
                <option value="D" ${settings.referenceShift === 'D' ? 'selected' : ''}>🅳 النوبة الرابعة (D)</option>
              </select>
              <small style="color: var(--md-sys-color-outline); font-size: 0.72rem; margin-top: 3px; display: block;">النوبة التي كانت متواجدة بالخدمة في تاريخ الأساس المرجعي</small>
            </div>

            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label" style="font-weight: 800; font-size: 0.85rem;">📅 تاريخ الأساس المرجعي للنظام:</label>
              <input type="date" id="shiftRefDateInput" class="form-control" value="${settings.referenceDate ? settings.referenceDate.split('T')[0] : '2026-01-01'}" onchange="window.app.updateShiftModalPreview()" required style="font-weight: 700;" />
              <small style="color: var(--md-sys-color-outline); font-size: 0.72rem; margin-top: 3px; display: block;">التاريخ الرياضي المعتمد لاحتساب تسلسل وتناوب النوبات بدقة</small>
            </div>
          </div>
        </div>

        <!-- Live Shift Calculation Preview Box -->
        <div id="shiftLivePreviewBox" class="shift-live-preview-container">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem;">
            <div>
              <div style="display: flex; align-items: center; gap: 0.4rem; font-size: 0.95rem; font-weight: 800; color: var(--md-sys-color-primary);">
                <span class="shift-pulse-live-dot"></span>
                <span>🔄 النوبة التشغيلية المحتسبة حالياً:</span>
                <span style="font-size: 1.1rem; color: var(--md-sys-color-tertiary, #059669); font-weight: 900;">${currentShiftInfo.shiftName}</span>
              </div>
              <div style="font-size: 0.78rem; opacity: 0.85; margin-top: 4px;">
                ⏱️ توقيت التدوير اليومي: <strong>${currentStartTime}</strong> | دورة العمل: <strong>${settings.shiftDurationHours || 24} ساعة</strong> | المرجع: <strong>النوبة (${settings.referenceShift || 'A'})</strong>
              </div>
            </div>
            <div class="shift-hero-badge" style="font-size: 0.75rem; padding: 0.25rem 0.65rem;">
              ⚡ معاينة حية وفورية
            </div>
          </div>
        </div>

        <!-- Operational Notes -->
        <div class="shift-glass-card" style="padding: 0.9rem 1.15rem; gap: 0.4rem;">
          <label class="form-label" style="font-weight: 800; font-size: 0.85rem; margin-bottom: 0.2rem;">📝 توجيهات وملاحظات إدارة النوبات:</label>
          <input type="text" id="shiftNotesInput" class="form-control" placeholder="مثال: التدوير يتم تلقائياً عند وقت البدء المحدد لجميع الكوادر والمنشآت الميدانية" value="${settings.notes || ''}" style="font-size: 0.86rem;" />
        </div>

        <!-- Footer Actions -->
        <div style="display: flex; justify-content: flex-end; align-items: center; gap: 0.65rem; margin-top: 0.35rem; padding-top: 0.5rem; border-top: 1px solid var(--md-sys-color-surface-variant, #e2e8f0);">
          <button type="button" class="btn btn-outline" style="border-radius: 10px; padding: 0.55rem 1.25rem; font-weight: 700;" onclick="window.app.closeModal()">إلغاء</button>
          <button type="submit" class="btn btn-primary" style="font-weight: 900; border-radius: 10px; padding: 0.55rem 1.6rem; box-shadow: 0 4px 14px rgba(11, 87, 208, 0.3); display: inline-flex; align-items: center; gap: 0.45rem;">
            <span>💾</span>
            <span>حفظ واعتماد إعدادات النوبة</span>
          </button>
        </div>
      </form>
    `);
  }

  setShiftStartTimePreset(timeVal) {
    const input = document.getElementById('shiftStartTimeInput');
    if (input) {
      input.value = timeVal;
      this.updateShiftModalPreview();
    }
  }

  updateShiftModalPreview() {
    const startTime = document.getElementById('shiftStartTimeInput')?.value || '07:30';
    const durationHours = Number(document.getElementById('shiftDurationSelect')?.value) || 24;
    const refShift = document.getElementById('shiftReferenceSelect')?.value || 'A';
    const refDateStr = document.getElementById('shiftRefDateInput')?.value || '2026-01-01';

    // Synchronize active preset chips
    document.querySelectorAll('.shift-preset-chip').forEach(chip => {
      const chipTime = chip.getAttribute('data-time');
      if (chipTime === startTime) {
        chip.classList.add('active');
      } else {
        chip.classList.remove('active');
      }
    });

    const refDate = new Date(`${refDateStr}T${startTime}:00Z`);
    const now = new Date();
    const msPerShift = durationHours * 60 * 60 * 1000;
    const shifts = ['A', 'B', 'C', 'D'];
    
    const diffMs = now.getTime() - refDate.getTime();
    let shiftIdx = Math.floor(diffMs / msPerShift) % 4;
    if (shiftIdx < 0) shiftIdx += 4;
    const refIdx = shifts.indexOf(refShift);
    if (refIdx !== -1) shiftIdx = (shiftIdx + refIdx) % 4;
    
    const previewShift = shifts[shiftIdx];
    const previewBox = document.getElementById('shiftLivePreviewBox');
    if (previewBox) {
      previewBox.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem;">
          <div>
            <div style="display: flex; align-items: center; gap: 0.4rem; font-size: 0.95rem; font-weight: 800; color: var(--md-sys-color-primary);">
              <span class="shift-pulse-live-dot"></span>
              <span>🔄 النوبة التشغيلية المحتسبة حالياً:</span>
              <span style="font-size: 1.1rem; color: var(--md-sys-color-tertiary, #059669); font-weight: 900;">النوبة (${previewShift})</span>
            </div>
            <div style="font-size: 0.78rem; opacity: 0.85; margin-top: 4px;">
              ⏱️ توقيت التدوير اليومي: <strong>${startTime}</strong> | دورة العمل: <strong>${durationHours} ساعة</strong> | المرجع: <strong>النوبة (${refShift})</strong> في <strong>${refDateStr}</strong>
            </div>
          </div>
          <div class="shift-hero-badge" style="font-size: 0.75rem; padding: 0.25rem 0.65rem;">
            ⚡ معاينة حية وفورية
          </div>
        </div>
      `;
    }
  }

  handleSaveShiftSettings(event) {
    if (event) event.preventDefault();
    const actorUser = window.auth.getCurrentUser();

    const startTime = document.getElementById('shiftStartTimeInput')?.value || '07:30';
    const shiftDurationHours = Number(document.getElementById('shiftDurationSelect')?.value) || 24;
    const referenceShift = document.getElementById('shiftReferenceSelect')?.value || 'A';
    const refDateStr = document.getElementById('shiftRefDateInput')?.value || '2026-01-01';
    const notes = document.getElementById('shiftNotesInput')?.value || '';

    const referenceDate = `${refDateStr}T${startTime}:00Z`;

    const res = window.store.updateShiftSettings({
      startTime,
      shiftDurationHours,
      referenceShift,
      referenceDate,
      notes
    }, actorUser);

    if (res.success) {
      alert('✅ تم تحديث وضبط وقت بدء ومواعيد النوبة بنجاح.');
      this.closeModal();
      this.render();
    } else {
      alert('❌ تعذر حفظ إعدادات النوبة: ' + res.error);
    }
  }

  // ==========================================================================
  // --- Technical Status Controller Methods (الموقف الفني) ---
  // ==========================================================================
  setSectionSubTab(subTab) {
    this.currentSectionSubTab = subTab;
    this.render();
  }

  openSectionTechStatus(sectionId) {
    this.currentSectionSubTab = 'tech_status';
    this.navigate('section_workspace', sectionId);
  }

  filterSectionTechStatus() {
    const q = (document.getElementById('sectionTechSearchInput')?.value || '').toLowerCase().trim();
    const stationFilter = document.getElementById('sectionTechStationFilter')?.value || 'ALL';
    const statusFilter = document.getElementById('sectionTechStatusFilter')?.value || 'ALL';

    const rows = document.querySelectorAll('.section-tech-row');
    rows.forEach(r => {
      const desc = r.getAttribute('data-desc') || '';
      const actions = r.getAttribute('data-actions') || '';
      const notes = r.getAttribute('data-notes') || '';
      const station = r.getAttribute('data-station') || 'NONE';
      const status = r.getAttribute('data-status') || '';

      const matchesSearch = !q || desc.includes(q) || actions.includes(q) || notes.includes(q);
      const matchesStation = stationFilter === 'ALL' || station === stationFilter;
      const matchesStatus = statusFilter === 'ALL' || status === statusFilter;

      if (matchesSearch && matchesStation && matchesStatus) {
        r.style.display = '';
      } else {
        r.style.display = 'none';
      }
    });
  }

  updateTechModalStationDropdown() {
    const actorUser = window.auth.getCurrentUser();
    const secSelect = document.getElementById('newTechSection');
    const stSelect = document.getElementById('newTechStation');
    if (!secSelect || !stSelect) return;

    const secId = secSelect.value;
    const stations = window.store.getStations(actorUser.departmentId, secId);
    
    stSelect.innerHTML = '<option value="">-- الموقع العام للشعبة / بدون تحديد --</option>' + 
      stations.map(st => `<option value="${st.id}">${st.name}</option>`).join('');
  }

  openCreateTechnicalStatusModal(defaultSectionId = null, defaultStationId = null) {
    const actorUser = window.auth.getCurrentUser();
    const sections = window.store.getSections(actorUser.departmentId);
    
    const targetSectionId = defaultSectionId || actorUser.sectionId || (sections[0] ? sections[0].id : '');
    const stations = window.store.getStations(actorUser.departmentId, targetSectionId);
    const targetStationId = defaultStationId || actorUser.stationId || '';

    // Scope lock for section manager or station manager
    const lockSection = (actorUser.role === 'SECTION_MANAGER' || actorUser.role === 'STATION_MANAGER') && actorUser.sectionId;
    const lockStation = actorUser.role === 'STATION_MANAGER' && actorUser.stationId;

    this.showModal('⚙️ تسجيل موقف فني تشغيلي جديد', `
      <form onsubmit="window.app.handleSaveTechnicalStatus(event)">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
          <div class="form-group">
            <label class="form-label">الشعبة المعنية:</label>
            <select id="newTechSection" class="form-control" ${lockSection ? 'disabled' : ''} onchange="window.app.updateTechModalStationDropdown()" required>
              ${sections.map(s => `<option value="${s.id}" ${s.id === targetSectionId ? 'selected' : ''}>${s.name}</option>`).join('')}
            </select>
            ${lockSection ? `<input type="hidden" id="newTechSectionHidden" value="${targetSectionId}" />` : ''}
          </div>

          <div class="form-group">
            <label class="form-label">الموقع / المحطة الإنتاجية:</label>
            <select id="newTechStation" class="form-control" ${lockStation ? 'disabled' : ''}>
              <option value="">-- الموقع العام للشعبة / بدون تحديد --</option>
              ${stations.map(st => `<option value="${st.id}" ${st.id === targetStationId ? 'selected' : ''}>${st.name}</option>`).join('')}
            </select>
            ${lockStation ? `<input type="hidden" id="newTechStationHidden" value="${targetStationId}" />` : ''}
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
          <div class="form-group">
            <label class="form-label">تاريخ الموقف الفني:</label>
            <input type="date" id="newTechDate" class="form-control" required value="${new Date().toISOString().split('T')[0]}" />
          </div>

          <div class="form-group">
            <label class="form-label">الحالة الفنية والتشغيلية:</label>
            <select id="newTechStatus" class="form-control" required>
              <option value="OPERATIONAL">🟢 أخضر — مستقرة / تعمل بكفاءة</option>
              <option value="PARTIAL">🟡 أصفر — قيد المتابعة / صيانة جزئية</option>
              <option value="STOPPED">🔴 أحمر — حرجة / متوقفة</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">المعدات / موضوع الموقف:</label>
          <input type="text" id="newTechEquipment" class="form-control" placeholder="مثال: مضخات الحقن، عازلة المرحلة الأولى، خط التصدير..." />
        </div>

        <div class="form-group">
          <label class="form-label">وصف الموقف الفني التشغيلي بالتفصيل:</label>
          <textarea id="newTechDesc" class="form-control" rows="3" required placeholder="توضيح الحالة الفنية للضغوط، درجات الحرارة، الاهتزازات، أو أسباب التوقف..."></textarea>
        </div>

        <div class="form-group">
          <label class="form-label">الإجراءات الهندسية / الميدانية المتخذة:</label>
          <textarea id="newTechActions" class="form-control" rows="2" placeholder="أعمال الصيانة الوقائية، استبدال الصمامات أو الفلاتر، الفحوصات المنفذة..."></textarea>
        </div>

        <div class="form-group">
          <label class="form-label">الملاحظات والتوصيات:</label>
          <input type="text" id="newTechNotes" class="form-control" placeholder="أي متطلبات لقطع الغيار أو إجراءات لاحقة..." />
        </div>

        <div style="margin-top: 1.25rem; display: flex; justify-content: flex-end; gap: 0.5rem;">
          <button type="button" class="btn btn-outline" onclick="window.app.closeModal()">إلغاء</button>
          <button type="submit" class="btn btn-primary" style="font-weight: 800;">
            💾 اعتماد وتسجيل الموقف الفني
          </button>
        </div>
      </form>
    `);
  }

  handleSaveTechnicalStatus(e) {
    e.preventDefault();
    const actorUser = window.auth.getCurrentUser();
    
    const sectionId = document.getElementById('newTechSectionHidden')?.value || document.getElementById('newTechSection').value;
    const stationId = document.getElementById('newTechStationHidden')?.value || document.getElementById('newTechStation').value;
    const recordDate = document.getElementById('newTechDate').value;
    const status = document.getElementById('newTechStatus').value;
    const equipmentTopic = document.getElementById('newTechEquipment').value.trim();
    const description = document.getElementById('newTechDesc').value.trim();
    const actionsTaken = document.getElementById('newTechActions').value.trim();
    const notes = document.getElementById('newTechNotes').value.trim();

    window.store.addTechnicalStatus({
      sectionId,
      stationId: stationId || null,
      recordDate,
      status,
      equipmentTopic,
      description,
      actionsTaken,
      notes
    }, actorUser);

    alert('تم تسجيل واعتماد الموقف الفني بنجاح وتحديث اللوحة الرئيسية.');
    this.closeModal();
    this.render();
  }

  openEditTechnicalStatusModal(statusId) {
    const actorUser = window.auth.getCurrentUser();
    const s = window.store.getTechnicalStatusById(statusId);
    if (!s) return;

    const sections = window.store.getSections(actorUser.departmentId);
    const stations = window.store.getStations(actorUser.departmentId, s.sectionId);

    const opStatus = s.status || s.operationalStatus || 'OPERATIONAL';

    this.showModal(`✏️ تعديل الموقف الفني — ${s.stationName || s.sectionName}`, `
      <form onsubmit="window.app.handleSaveEditTechnicalStatus(event, '${s.id}')">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
          <div class="form-group">
            <label class="form-label">الشعبة:</label>
            <input type="text" class="form-control" value="${s.sectionName || ''}" disabled />
          </div>

          <div class="form-group">
            <label class="form-label">الموقع / المحطة:</label>
            <input type="text" class="form-control" value="${s.stationName || 'عام'}" disabled />
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
          <div class="form-group">
            <label class="form-label">تاريخ الموقف الفني:</label>
            <input type="date" id="editTechDate" class="form-control" required value="${s.recordDate || new Date().toISOString().split('T')[0]}" />
          </div>

          <div class="form-group">
            <label class="form-label">الحالة الفنية والتشغيلية:</label>
            <select id="editTechStatus" class="form-control" required>
              <option value="OPERATIONAL" ${opStatus === 'OPERATIONAL' ? 'selected' : ''}>🟢 أخضر — مستقرة / تعمل بكفاءة</option>
              <option value="PARTIAL" ${opStatus === 'PARTIAL' ? 'selected' : ''}>🟡 أصفر — قيد المتابعة / صيانة جزئية</option>
              <option value="STOPPED" ${opStatus === 'STOPPED' ? 'selected' : ''}>🔴 أحمر — حرجة / متوقفة</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">المعدات / موضوع الموقف:</label>
          <input type="text" id="editTechEquipment" class="form-control" value="${s.equipmentTopic || ''}" />
        </div>

        <div class="form-group">
          <label class="form-label">وصف الموقف الفني التشغيلي:</label>
          <textarea id="editTechDesc" class="form-control" rows="3" required>${s.description || ''}</textarea>
        </div>

        <div class="form-group">
          <label class="form-label">الإجراءات المتخذة:</label>
          <textarea id="editTechActions" class="form-control" rows="2">${s.actionsTaken || ''}</textarea>
        </div>

        <div class="form-group">
          <label class="form-label">الملاحظات والتوصيات:</label>
          <input type="text" id="editTechNotes" class="form-control" value="${s.notes || ''}" />
        </div>

        <div style="margin-top: 1.25rem; display: flex; justify-content: flex-end; gap: 0.5rem;">
          <button type="button" class="btn btn-outline" onclick="window.app.closeModal()">إلغاء</button>
          <button type="submit" class="btn btn-primary" style="font-weight: 800;">
            💾 حفظ التعديلات وتحديث السجل
          </button>
        </div>
      </form>
    `);
  }

  handleSaveEditTechnicalStatus(e, statusId) {
    e.preventDefault();
    const actorUser = window.auth.getCurrentUser();

    const recordDate = document.getElementById('editTechDate').value;
    const status = document.getElementById('editTechStatus').value;
    const equipmentTopic = document.getElementById('editTechEquipment').value.trim();
    const description = document.getElementById('editTechDesc').value.trim();
    const actionsTaken = document.getElementById('editTechActions').value.trim();
    const notes = document.getElementById('editTechNotes').value.trim();

    window.store.updateTechnicalStatus(statusId, {
      recordDate,
      status,
      equipmentTopic,
      description,
      actionsTaken,
      notes
    }, actorUser);

    alert('تم تحديث الموقف الفني بنجاح وتوثيق التعديل في سجل العمليات.');
    this.closeModal();
    this.render();
  }

  openViewTechnicalStatusDetailsModal(statusId) {
    const s = window.store.getTechnicalStatusById(statusId);
    if (!s) return;

    const opStatus = s.status || s.operationalStatus || 'OPERATIONAL';
    let badgeClass = 'badge-success';
    let labelText = '🟢 مستقرة';
    if (opStatus === 'PARTIAL') { badgeClass = 'badge-warning'; labelText = '🟡 قيد المتابعة'; }
    if (opStatus === 'STOPPED') { badgeClass = 'badge-danger'; labelText = '🔴 حرجة / متوقفة'; }

    const history = Array.isArray(s.history) ? s.history : [];

    this.showModal(`⚙️ تفاصيل وسجل الموقف الفني (#${s.id})`, `
      <div style="display: flex; flex-direction: column; gap: 1rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--md-sys-color-surface-variant); padding-bottom: 0.75rem;">
          <div>
            <h4 style="margin: 0; font-size: 1.1rem; color: var(--md-sys-color-primary);">
              ${s.sectionName} — ${s.stationName || 'الموقع المركزي'}
            </h4>
            <div style="font-size: 0.8rem; color: var(--md-sys-color-outline); margin-top: 2px;">
              تاريخ الموقف: <strong>${s.recordDate || '—'}</strong> | تم التسجيل بواسطة: <strong>${s.createdByName || 'مسؤول الموقع'}</strong>
            </div>
          </div>
          <span class="badge ${badgeClass}" style="font-size: 0.9rem; padding: 0.35rem 0.75rem;">
            ${labelText}
          </span>
        </div>

        <div style="background: var(--md-sys-color-surface-variant); padding: 1rem; border-radius: var(--radius-sm);">
          <strong style="color: var(--md-sys-color-primary); display: block; margin-bottom: 0.35rem;">وصف الموقف الفني التشغيلي:</strong>
          <div style="font-size: 0.9rem; line-height: 1.6; color: var(--md-sys-color-on-surface); white-space: pre-wrap;">${s.description || 'لا يوجد وصف'}</div>
        </div>

        ${s.actionsTaken ? `
          <div style="background: rgba(19, 115, 51, 0.05); border: 1px solid #137333; padding: 0.85rem; border-radius: var(--radius-sm);">
            <strong style="color: #137333; display: block; margin-bottom: 0.25rem;">الإجراءات المتخذة:</strong>
            <div style="font-size: 0.88rem; color: var(--md-sys-color-on-surface);">${s.actionsTaken}</div>
          </div>
        ` : ''}

        ${s.notes ? `
          <div style="background: rgba(242, 153, 0, 0.05); border: 1px solid #f29900; padding: 0.85rem; border-radius: var(--radius-sm);">
            <strong style="color: #f29900; display: block; margin-bottom: 0.25rem;">ملاحظات وتوصيات الإدارة:</strong>
            <div style="font-size: 0.88rem; color: var(--md-sys-color-on-surface);">${s.notes}</div>
          </div>
        ` : ''}

        <!-- Audit History Log (سجل العمليات والتدقيق) -->
        <div style="border-top: 1px solid var(--md-sys-color-surface-variant); padding-top: 0.75rem;">
          <h5 style="font-size: 0.9rem; font-weight: 700; margin: 0 0 0.5rem 0; color: var(--md-sys-color-outline);">
            📜 سجل التعديلات والعمليات (${history.length}):
          </h5>
          <div style="display: flex; flex-direction: column; gap: 0.4rem; max-height: 150px; overflow-y: auto;">
            ${history.map(h => `
              <div style="font-size: 0.78rem; padding: 0.4rem 0.6rem; background: var(--md-sys-color-surface); border: 1px solid var(--md-sys-color-surface-variant); border-radius: var(--radius-sm); display: flex; justify-content: space-between;">
                <span><strong>${h.userName || 'المسؤول'}</strong>: ${h.details || h.action}</span>
                <span style="color: var(--md-sys-color-outline); font-family: monospace;">${new Date(h.timestamp).toLocaleString('ar-IQ')}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <div style="display: flex; justify-content: flex-end; margin-top: 1rem; border-top: 1px solid var(--md-sys-color-surface-variant); padding-top: 0.85rem;">
          <button type="button" class="btn btn-glass-primary" onclick="window.app.closeModal()" title="إغلاق النافذة" style="border-radius: var(--radius-full);">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
            <span>إغلاق</span>
          </button>
        </div>
      </div>
    `);
  }

  deleteTechnicalStatus(statusId, sectionId) {
    if (confirm('هل أنت متأكد من حذف هذا الموقف الفني من السجل؟')) {
      const actorUser = window.auth.getCurrentUser();
      window.store.deleteTechnicalStatus(statusId, actorUser);
      alert('تم حذف الموقف الفني بنجاح.');
      this.render();
    }
  }

  // ==========================================
  // --- SECTION FORMS & TEMPLATES HUB METHODS ---
  // ==========================================

  // --- Method 2: Ready-made Form Templates Upload Modal ---
  openUploadSectionFormTemplateModal(sectionId, sectionName) {
    const actorUser = window.auth.getCurrentUser();
    this.showModal(`📤 رفع نموذج / فورمة جاهزة — ${sectionName || 'الشعبة'}`, `
      <form onsubmit="window.app.handleSaveSectionFormTemplate(event, '${sectionId}')">
        <div class="form-group">
          <label class="form-label">عنوان / اسم الاستمارة أو النموذج:</label>
          <input type="text" id="secTmplTitle" class="form-control" placeholder="مثال: استمارة فحص الآبار الأسبوعي، طلب إجازة كادر، استمارة صيانة مضخة..." required>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
          <div class="form-group">
            <label class="form-label">نوع وصيغة الملف:</label>
            <select id="secTmplCategory" class="form-control" required>
              <option value="WORD">📄 مستند وورد (Word / DOCX / DOC)</option>
              <option value="EXCEL">📊 جدول إكسل (Excel / XLSX / CSV)</option>
              <option value="PDF">📕 وثيقة PDF رسمية جاهزة</option>
              <option value="IMAGE">🖼️ صورة / مخطط نموذجي (Image / Scan)</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">رمز أو كود النموذج (اختياري):</label>
            <input type="text" id="secTmplDocNumber" class="form-control" placeholder="مثال: FORM-PRD-01" style="font-family: monospace;">
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">اختر ملف النموذج من جهازك (Word / Excel / PDF):</label>
          <input type="file" id="secTmplFileInput" class="form-control" accept=".doc,.docx,.xls,.xlsx,.csv,.pdf,.png,.jpg,.jpeg" required style="padding: 0.4rem;">
          <small style="color: var(--md-sys-color-outline); font-size: 0.78rem; display: block; margin-top: 4px;">
            يدعم مستندات Word، Excel، PDF والصور المعتمدة. سيتم حفظ الملف في بنك نماذج الشعبة مباشرة.
          </small>
        </div>

        <div class="form-group">
          <label class="form-label">تعليمات وملاحظات الاستخدام (تظهر للكادر):</label>
          <textarea id="secTmplContent" class="form-control" rows="3" placeholder="أدخل إرشادات تعبئة الفورمة أو توجيهات الإدارة لمستخدمي النموذج..."></textarea>
        </div>

        <div style="margin-top: 1.25rem; display: flex; justify-content: flex-end; gap: 0.5rem;">
          <button type="button" class="btn btn-outline" onclick="window.app.closeModal()">إلغاء</button>
          <button type="submit" class="btn btn-glass-primary" style="font-weight: 800;">
            <span>💾 رفع وحفظ الفورمة في بنك النماذج</span>
          </button>
        </div>
      </form>
    `, { size: 'md' });
  }

  handleSaveSectionFormTemplate(e, sectionId) {
    e.preventDefault();
    const actorUser = window.auth.getCurrentUser();
    const title = document.getElementById('secTmplTitle').value.trim();
    const category = document.getElementById('secTmplCategory').value;
    const docNumber = document.getElementById('secTmplDocNumber').value.trim() || `FORM-${Date.now().toString().slice(-4)}`;
    const content = document.getElementById('secTmplContent').value.trim();
    const fileInput = document.getElementById('secTmplFileInput');

    if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
      alert('يرجى اختيار ملف النموذج أولاً.');
      return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
      const fileData = event.target.result;
      const isDept = !sectionId || sectionId === 'DEPT' || sectionId === 'dept-south-prod';
      const finalSecId = isDept ? null : sectionId;
      const finalScopeId = isDept ? 'DEPT' : sectionId;
      const creatorName = actorUser ? actorUser.fullName : (isDept ? 'إدارة القسم' : 'مسؤول الشعبة');

      const newDoc = {
        id: 'doc-tmpl-' + Date.now(),
        title,
        docNumber,
        category,
        content: content || `نموذج وفورمة عمل رسمية معتمدة: ${title}`,
        status: 'PUBLISHED',
        accessLevel: 'PUBLIC',
        version: '1.0',
        sectionId: finalSecId,
        scopeId: finalScopeId,
        isTemplate: true,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        fileData: fileData,
        createdBy: actorUser ? actorUser.id : 'admin',
        createdByName: creatorName,
        departmentId: actorUser ? actorUser.departmentId : 'dept-south-prod',
        createdAt: new Date().toISOString()
      };

      window.store.addDocument(newDoc);
      if (window.store.logActivity && actorUser) {
        window.store.logActivity(
          actorUser.departmentId,
          actorUser.id,
          actorUser.employeeId,
          'UPLOAD_FORM_TEMPLATE',
          isDept ? 'DEPT_MANAGEMENT' : 'SECTION_WORKSPACE',
          `تم رفع نموذج وفورمة جاهزة: [${title}] ${isDept ? 'للقسم' : 'للشعبة'}.`
        );
      }

      alert(`✅ تم رفع النموذج [${title}] بنجاح وحفظه في بنك النماذج.`);
      this.closeModal();
      this.render();
    };

    reader.onerror = () => {
      alert('حدث خطأ أثناء قراءة الملف، يرجى المحاولة مرة أخرى.');
    };

    reader.readAsDataURL(file);
  }

  handleDeleteSectionFormTemplate(docId, sectionId) {
    if (confirm('هل أنت متأكد من حذف هذا النموذج / الفورمة من بنك النماذج؟')) {
      const actorUser = window.auth.getCurrentUser();
      const isDept = !sectionId || sectionId === 'DEPT' || sectionId === 'dept-south-prod';
      window.store.deleteDocument(docId);
      if (window.store.logActivity && actorUser) {
        window.store.logActivity(
          actorUser.departmentId,
          actorUser.id,
          actorUser.employeeId,
          'DELETE_FORM_TEMPLATE',
          isDept ? 'DEPT_MANAGEMENT' : 'SECTION_WORKSPACE',
          `تم حذف نموذج وفورمة (${docId}) من بنك النماذج.`
        );
      }
      alert('✅ تم حذف النموذج بنجاح.');
      this.render();
    }
  }

  // --- Method 1: Dynamic Custom Fields Modal for Section / Dept ---
  openCreateDynamicFieldModalFromDataEntry(sectionId = '', empId = '', sectionName = '') {
    const actorUser = window.auth.getCurrentUser();
    const isDept = !sectionId || sectionId === 'DEPT' || sectionId === 'dept-south-prod';
    this.showModal(`➕ إضافة حقل مخصص للاستمارة ${sectionName ? `(${sectionName})` : ''}`, `
      <form onsubmit="window.app.handleSaveCreateDynamicFieldFromSection(event, '${sectionId}')">
        <div class="form-group">
          <label class="form-label">اسم الحقل أو المعلومة المطلوبة بالعربية:</label>
          <input type="text" id="secDfName" class="form-control" placeholder="مثال: رقم بطاقة السلامة المهنية HSE، رقم الهوية المهنية، تاريخ الفحص الدوري..." required>
        </div>

        <div class="form-group">
          <label class="form-label">المعرف البرمجي الفريد (Field Key):</label>
          <input type="text" id="secDfKey" class="form-control" placeholder="مثال: safety_badge_no" required style="font-family: monospace;">
          <small style="color: var(--md-sys-color-outline); font-size: 0.78rem;">أحرف إنجليزية وأرقام و _ فقط</small>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
          <div class="form-group">
            <label class="form-label">نوع البيانات:</label>
            <select id="secDfType" class="form-control" onchange="const opts = document.getElementById('secDfOptionsGroup'); if(opts) opts.style.display = (this.value === 'select') ? 'block' : 'none';">
              <option value="text">نص عادي (Text) 📝</option>
              <option value="number">رقم عددي (Number) 🔢</option>
              <option value="date">تاريخ (Date) 📅</option>
              <option value="select">قائمة خيارات (Select) 📋</option>
              <option value="textarea">نص تفصيلي (Textarea) 📜</option>
              <option value="boolean">نعم / لا (Boolean) 🔘</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">نطاق تطبيق الحقل:</label>
            <select id="secDfScope" class="form-control">
              ${isDept ? `
                <option value="GLOBAL" selected>🌐 شامل لكافة كوادر القسم</option>
              ` : `
                <option value="SECTION" selected>🏢 خاص بموظفي هذه الشعبة (${sectionName || 'الشعبة'})</option>
                <option value="GLOBAL">🌐 شامل لكافة كوادر القسم</option>
              `}
            </select>
          </div>
        </div>

        <div class="form-group" id="secDfOptionsGroup" style="display: none;">
          <label class="form-label">خيارات القائمة (مفصولة بفارزة ,):</label>
          <input type="text" id="secDfOptions" class="form-control" placeholder="مثال: صالح، منتهي، قيد التجديد">
        </div>

        <div class="form-group">
          <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
            <input type="checkbox" id="secDfRequired">
            <span style="font-size: 0.9rem; font-weight: 600;">حقل إلزامي عند تعبئة الاستمارة</span>
          </label>
        </div>

        <div style="margin-top: 1.25rem; display: flex; justify-content: flex-end; gap: 0.5rem;">
          <button type="button" class="btn btn-outline" onclick="window.app.closeModal()">إلغاء</button>
          <button type="submit" class="btn btn-glass-primary" style="font-weight: 800;">
            💾 حفظ واعتماد الحقل في الاستمارة
          </button>
        </div>
      </form>
    `);
  }

  handleSaveCreateDynamicFieldFromSection(e, sectionId) {
    e.preventDefault();
    const actorUser = window.auth.getCurrentUser();
    const name = document.getElementById('secDfName').value.trim();
    const key = document.getElementById('secDfKey').value.trim().replace(/[^a-zA-Z0-9_]/g, '');
    const type = document.getElementById('secDfType').value;
    const scope = document.getElementById('secDfScope').value;
    const isRequired = document.getElementById('secDfRequired').checked;
    const optionsRaw = document.getElementById('secDfOptions') ? document.getElementById('secDfOptions').value.trim() : '';
    const options = optionsRaw ? optionsRaw.split(',').map(s => s.trim()).filter(Boolean) : [];
    const isDept = !sectionId || sectionId === 'DEPT' || sectionId === 'dept-south-prod';

    const res = window.store.addDynamicEmployeeField({
      name,
      key: key || `custom_${Date.now()}`,
      type,
      category: isDept ? 'dept_specific' : 'section_specific',
      scope: isDept ? 'GLOBAL' : scope,
      scopeId: (scope === 'GLOBAL' || isDept) ? null : sectionId,
      isRequired,
      options
    }, actorUser);

    if (res.success) {
      alert(`✅ تم إنشاء الحقل المخصص [${name}] بنجاح، وأصبح متاحاً في الاستمارات.`);
      this.closeModal();
      this.render();
    } else {
      alert('خطأ: ' + res.error);
    }
  }

  handleDeleteDynamicFieldFromSection(fieldId, sectionId) {
    const actorUser = window.auth.getCurrentUser();
    if (confirm('هل أنت متأكد من حذف / تعطيل هذا الحقل المخصص؟')) {
      window.store.deleteDynamicEmployeeField(fieldId, actorUser);
      alert('✅ تم تعطيل الحقل بنجاح.');
      this.render();
    }
  }

  // --- Section Staff Data Entry Modal ---
  openSectionDataEntryModal(sectionId) {
    const actorUser = window.auth.getCurrentUser();
    const section = window.store.getSectionById(sectionId) || { id: sectionId, name: 'الشعبة' };
    const deptId = actorUser ? actorUser.departmentId : 'dept-south-prod';
    const staff = (window.store.getStaff(deptId) || []).filter(e => e.sectionId === sectionId && !e.isArchived);
    const dynamicFields = (window.store.getDynamicEmployeeFields(deptId) || []).filter(f => f.isActive !== false && (f.scope === 'GLOBAL' || (f.scope === 'SECTION' && (!f.scopeId || f.scopeId === sectionId))));

    if (staff.length === 0) {
      alert('لا يوجد منتسبون مسجلون في هذه الشعبة حالياً لتعبئة بياناتهم.');
      return;
    }

    const firstEmp = staff[0];
    const initialMaster = window.store.getEmployeeMasterRecordByEmployeeId(firstEmp.employeeId) || firstEmp;

    this.showModal(`📝 تعبئة وتحديث استمارة كادر — ${section.name}`, `
      <div style="display: flex; flex-direction: column; gap: 1.25rem;">
        <div style="background: var(--md-sys-color-surface-variant); padding: 1rem 1.25rem; border-radius: var(--radius-md); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem;">
          <div>
            <label style="font-weight: 700; font-size: 0.92rem; display: block; margin-bottom: 4px; color: var(--md-sys-color-primary);">اختر المنتسب لتعبئة أو مراجعة بياناته (${staff.length} منتسب):</label>
            <select id="sectionStaffSelect" class="form-control" style="min-width: 260px; font-weight: 600;" onchange="window.app.onSectionStaffSelectChange('${sectionId}', this.value)">
              ${staff.map(e => `
                <option value="${e.employeeId}">${e.fullName} (${e.employeeId}) — ${e.jobTitle || 'موظف'}</option>
              `).join('')}
            </select>
          </div>
          <div style="font-size: 0.82rem; color: var(--md-sys-color-outline);">
            عدد الحقول المخصصة المتاحة: <strong>${dynamicFields.length}</strong>
          </div>
        </div>

        <form id="sectionStaffDataForm" onsubmit="window.app.handleSaveSectionStaffDataSubmit(event, '${sectionId}')">
          <input type="hidden" id="currentStaffEmpId" value="${firstEmp.employeeId}">
          
          <div id="sectionStaffFieldsContainer" style="display: flex; flex-direction: column; gap: 1rem; max-height: 400px; overflow-y: auto; padding: 0.5rem 0.25rem;">
            ${dynamicFields.length === 0 ? `
              <div style="text-align: center; padding: 2rem; color: var(--md-sys-color-outline); font-size: 0.9rem;">
                لا توجد حقول مخصصة مضافة لهذه الشعبة حالياً. يمكنك استخدام زر [➕ إضافة حقل مخصص] أولاً.
              </div>
            ` : `
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                ${dynamicFields.map(f => {
                  const val = (initialMaster.dynamicValues && (initialMaster.dynamicValues[f.key]?.value ?? initialMaster.dynamicValues[f.key])) ?? (initialMaster.dynamicData && initialMaster.dynamicData[f.key]) ?? initialMaster[f.key] ?? '';
                  return `
                    <div class="form-group" style="margin: 0;">
                      <label class="form-label" style="display: flex; justify-content: space-between;">
                        <span>${f.name}</span>
                        ${f.isRequired ? '<span class="badge badge-danger" style="font-size: 0.65rem;">إلزامي</span>' : ''}
                      </label>
                      ${f.type === 'select' ? `
                        <select name="dyn_${f.key}" class="form-control" ${f.isRequired ? 'required' : ''}>
                          <option value="">-- اختر --</option>
                          ${(f.options || []).map(opt => `<option value="${opt}" ${val === opt ? 'selected' : ''}>${opt}</option>`).join('')}
                        </select>
                      ` : f.type === 'textarea' ? `
                        <textarea name="dyn_${f.key}" class="form-control" rows="2" placeholder="أدخل ${f.name}..." ${f.isRequired ? 'required' : ''}>${val}</textarea>
                      ` : `
                        <input type="${f.type === 'number' ? 'number' : f.type === 'date' ? 'date' : 'text'}" name="dyn_${f.key}" class="form-control" value="${val}" placeholder="أدخل ${f.name}..." ${f.isRequired ? 'required' : ''}>
                      `}
                    </div>
                  `;
                }).join('')}
              </div>
            `}
          </div>

          <div style="margin-top: 1.5rem; display: flex; justify-content: flex-end; gap: 0.5rem; border-top: 1px solid var(--md-sys-color-surface-variant); padding-top: 1rem;">
            <button type="button" class="btn btn-outline" onclick="window.app.closeModal()">إغلاق</button>
            <button type="submit" class="btn btn-save-prominent" style="font-weight: 800; padding: 0.5rem 1.5rem;">
              💾 حفظ وتحديث بيانات المنتسب
            </button>
          </div>
        </form>
      </div>
    `, { size: 'lg', maxWidth: '850px' });
  }

  onSectionStaffSelectChange(sectionId, empId) {
    const actorUser = window.auth.getCurrentUser();
    const deptId = actorUser ? actorUser.departmentId : 'dept-south-prod';
    const master = window.store.getEmployeeMasterRecordByEmployeeId(empId) || (window.store.getStaff && window.store.getStaff(deptId) || []).find(e => e.employeeId === empId) || {};
    const dynamicFields = (window.store.getDynamicEmployeeFields(deptId) || []).filter(f => f.isActive !== false && (f.scope === 'GLOBAL' || (f.scope === 'SECTION' && (!f.scopeId || f.scopeId === sectionId))));

    const hiddenInput = document.getElementById('currentStaffEmpId');
    if (hiddenInput) hiddenInput.value = empId;

    const container = document.getElementById('sectionStaffFieldsContainer');
    if (!container) return;

    if (dynamicFields.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 2rem; color: var(--md-sys-color-outline); font-size: 0.9rem;">
          لا توجد حقول مخصصة مضافة لهذه الشعبة حالياً. يمكنك استخدام زر [➕ إضافة حقل مخصص] أولاً.
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
        ${dynamicFields.map(f => {
          const val = (master.dynamicValues && (master.dynamicValues[f.key]?.value ?? master.dynamicValues[f.key])) ?? (master.dynamicData && master.dynamicData[f.key]) ?? master[f.key] ?? '';
          return `
            <div class="form-group" style="margin: 0;">
              <label class="form-label" style="display: flex; justify-content: space-between;">
                <span>${f.name}</span>
                ${f.isRequired ? '<span class="badge badge-danger" style="font-size: 0.65rem;">إلزامي</span>' : ''}
              </label>
              ${f.type === 'select' ? `
                <select name="dyn_${f.key}" class="form-control" ${f.isRequired ? 'required' : ''}>
                  <option value="">-- اختر --</option>
                  ${(f.options || []).map(opt => `<option value="${opt}" ${val === opt ? 'selected' : ''}>${opt}</option>`).join('')}
                </select>
              ` : f.type === 'textarea' ? `
                <textarea name="dyn_${f.key}" class="form-control" rows="2" placeholder="أدخل ${f.name}..." ${f.isRequired ? 'required' : ''}>${val}</textarea>
              ` : `
                <input type="${f.type === 'number' ? 'number' : f.type === 'date' ? 'date' : 'text'}" name="dyn_${f.key}" class="form-control" value="${val}" placeholder="أدخل ${f.name}..." ${f.isRequired ? 'required' : ''}>
              `}
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  handleSaveSectionStaffDataSubmit(e, sectionId) {
    e.preventDefault();
    const actorUser = window.auth.getCurrentUser();
    const empId = document.getElementById('currentStaffEmpId').value;
    const form = document.getElementById('sectionStaffDataForm');
    if (!form || !empId) return;

    const formData = new FormData(form);
    const deptId = actorUser ? actorUser.departmentId : 'dept-south-prod';
    const dynamicFields = (window.store.getDynamicEmployeeFields(deptId) || []).filter(f => f.isActive !== false && (f.scope === 'GLOBAL' || (f.scope === 'SECTION' && (!f.scopeId || f.scopeId === sectionId))));

    let updatedCount = 0;
    for (const f of dynamicFields) {
      const fieldVal = formData.get(`dyn_${f.key}`);
      if (fieldVal !== null && fieldVal !== undefined) {
        window.store.setEmployeeDynamicValue(empId, f.key, fieldVal.toString().trim(), f.scope, actorUser);
        updatedCount++;
      }
    }

    alert(`✅ تم حفظ وتحديث بيانات المنتسب (${empId}) بنجاح (${updatedCount} حقل).`);
    this.render();
  }
}

const app = new AppController();
window.app = app;

document.addEventListener('DOMContentLoaded', () => {
  app.render();

  // تسجيل وظائف نظام البريد الداخلي
  if (typeof window.registerMailAppMethods === 'function') {
    window.registerMailAppMethods(app);
  }

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    window.deferredPWAPrompt = e;
    const btn = document.getElementById('pwaInstallBtn');
    if (btn) btn.style.display = 'inline-flex';
  });
});
