/* ==========================================================================
   إدارة قسم الإنتاج الجنوبي - Next-Gen Dynamic Sidebar Component
   ========================================================================== */

function renderSidebar(activeNav = 'dashboard') {
  const user = window.auth.getCurrentUser();
  if (!user) return '';

  const sections = window.store.getSections(user.departmentId);
  const units = window.store.getUnits(user.departmentId);
  const isHRorMgr = ['DEPT_MANAGER', 'DEPUTY_DEPT_MANAGER', 'ADMIN_MANAGER', 'SUPER_ADMIN', 'ADMINISTRATOR', 'SECTION_MANAGER', 'DEPUTY_SECTION_MANAGER'].includes(user.role);

  return `
    <aside class="sidebar" id="appSidebar">
      <!-- Mobile Sidebar Header with Close Button & Gesture Indicator -->
      <div class="sidebar-mobile-header">
        <div class="sidebar-brand-mini">
          <div class="department-logo hr-logo" style="width: 32px; height: 32px; min-width: 32px; border-radius: 9px; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, var(--md-sys-color-primary) 0%, #006a6a 100%); color: #ffffff;">
            <svg class="department-logo-svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 21h18"></path>
              <path d="M5 21V7l8-4v18"></path>
              <path d="M19 21V11l-6-4"></path>
            </svg>
          </div>
          <div class="sidebar-brand-title">
            <span style="font-weight: 800; font-size: 0.92rem; color: var(--md-sys-color-primary); display: block; line-height: 1.2;">قسم الإنتاج الجنوبي</span>
            <span style="font-size: 0.72rem; color: var(--md-sys-color-outline); font-weight: 600;">القائمة الرئيسية</span>
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <button type="button" class="sidebar-close-btn" onclick="window.app.closeSidebar(event)" ontouchend="window.app.closeSidebar(event)" aria-label="إغلاق القائمة" title="إغلاق القائمة (X)">
            <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
            <span class="sidebar-close-btn-text">إغلاق</span>
          </button>
        </div>
      </div>

      <nav class="sidebar-nav">
        <!-- Category 1: Core Navigation -->
        <div class="nav-section-title">
          <span class="nav-section-dot"></span>
          <span>التنقل الرئيسي</span>
        </div>

        <a class="nav-item ${activeNav === 'dashboard' ? 'active' : ''}" onclick="window.app.navigate('dashboard')" title="لوحة التحكم والتحليلات الرئيسية">
          <div class="nav-item-content">
            <span class="nav-icon-box icon-cyan">
              <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="7" height="7" rx="2"></rect>
                <rect x="14" y="3" width="7" height="4" rx="1.5"></rect>
                <rect x="14" y="10" width="7" height="11" rx="2"></rect>
                <rect x="3" y="13" width="7" height="8" rx="2"></rect>
              </svg>
            </span>
            <span class="nav-item-label">الرئيسية</span>
          </div>
        </a>

        <a class="nav-item ${activeNav === 'announcements' ? 'active' : ''}" onclick="window.app.navigate('announcements')" title="الإعلانات والتعاميم الرسمية">
          <div class="nav-item-content">
            <span class="nav-icon-box icon-amber">
              <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 11v3a1 1 0 0 0 1 1h2l4 4V5L6 9H4a1 1 0 0 0-1 1z"></path>
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                <path d="M18.36 5.64a9 9 0 0 1 0 12.72"></path>
              </svg>
            </span>
            <span class="nav-item-label">الإعلانات العامة</span>
          </div>
        </a>

        <a class="nav-item ${activeNav === 'notifications' ? 'active' : ''}" onclick="window.app.navigate('notifications')" title="مركز التبليغات والتنبيهات الإدارية">
          <div class="nav-item-content">
            <span class="nav-icon-box icon-blue">
              <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                <circle cx="19" cy="5" r="2.5" fill="currentColor" stroke="none"></circle>
              </svg>
            </span>
            <span class="nav-item-label">التبليغات الإدارية</span>
          </div>
        </a>

        <a class="nav-item ${activeNav === 'documents' ? 'active' : ''}" onclick="window.app.navigate('documents')" title="نظام الأرشفة وإدارة المستندات">
          <div class="nav-item-content">
            <span class="nav-icon-box icon-indigo">
              <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                <line x1="9" y1="7" x2="15" y2="7"></line>
                <line x1="9" y1="11" x2="15" y2="11"></line>
              </svg>
            </span>
            <span class="nav-item-label">نظام المستندات</span>
          </div>
        </a>

        <!-- Category 2: Administrative Structure -->
        <div class="nav-section-title">
          <span class="nav-section-dot"></span>
          <span>الهيكل الإداري</span>
        </div>

        <a class="nav-item ${activeNav === 'dept_management' ? 'active' : ''}" onclick="window.app.navigate('dept_management')" title="شؤون وإدارة رئاسة القسم">
          <div class="nav-item-content">
            <span class="nav-icon-box icon-purple">
              <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 21h18"></path>
                <path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16"></path>
                <path d="M9 7h1"></path>
                <path d="M9 11h1"></path>
                <path d="M9 15h1"></path>
                <path d="M14 7h1"></path>
                <path d="M14 11h1"></path>
                <path d="M14 15h1"></path>
              </svg>
            </span>
            <span class="nav-item-label">إدارة القسم</span>
          </div>
        </a>

        <!-- Sections Dropdown -->
        <div class="nav-item-dropdown" id="sidebarSectionsDropdown">
          <div class="nav-item ${activeNav === 'sections' || activeNav === 'section_workspace' ? 'active' : ''}" onclick="window.app.toggleSidebarSectionsDropdown(event)" title="استعراض شعب القسم ومحطاتها">
            <div class="nav-item-content">
              <span class="nav-icon-box icon-emerald">
                <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                  <path d="M2 17l10 5 10-5"></path>
                  <path d="M2 12l10 5 10-5"></path>
                </svg>
              </span>
              <span class="nav-item-label">الشعب</span>
            </div>
            <div class="nav-item-meta">
              <span class="nav-item-badge">${sections.length}</span>
              <span id="sectionsDropdownArrow" class="nav-dropdown-caret" style="transform: ${window.app && window.app.isSectionsDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)'};">
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </span>
            </div>
          </div>

          <div id="sectionsDropdownMenu" class="nav-sub-items" style="display: ${window.app && window.app.isSectionsDropdownOpen ? 'flex' : 'none'};">
            ${sections.map((s, idx) => {
              const isSelected = activeNav === 'section_workspace' && window.app.currentSectionId === s.id;
              const stations = (window.store && typeof window.store.getStations === 'function') ? window.store.getStations(user.departmentId, s.id) : [];
              return `
                <a class="nav-sub-item ${isSelected ? 'active' : ''}" onclick="window.app.openSectionWorkspace('${s.id}')">
                  <span class="sub-item-prefix">
                    <span class="sub-item-dot"></span>
                    <span class="sub-item-name">${idx + 1}. ${s.name}</span>
                  </span>
                  <span class="sub-item-count">${stations.length} محطات</span>
                </a>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Units Dropdown -->
        <div class="nav-item-dropdown" id="sidebarUnitsDropdown">
          <div class="nav-item ${activeNav === 'units' || activeNav === 'unit_workspace' ? 'active' : ''}" onclick="window.app.toggleSidebarUnitsDropdown(event)" title="استعراض الوحدات التشغيلية والخدمية">
            <div class="nav-item-content">
              <span class="nav-icon-box icon-sky">
                <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="2" y="2" width="8" height="8" rx="2"></rect>
                  <rect x="14" y="2" width="8" height="8" rx="2"></rect>
                  <rect x="2" y="14" width="8" height="8" rx="2"></rect>
                  <rect x="14" y="14" width="8" height="8" rx="2"></rect>
                </svg>
              </span>
              <span class="nav-item-label">الوحدات</span>
            </div>
            <div class="nav-item-meta">
              <span class="nav-item-badge">${units.length}</span>
              <span id="unitsDropdownArrow" class="nav-dropdown-caret" style="transform: ${window.app && window.app.isUnitsDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)'};">
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </span>
            </div>
          </div>

          <div id="unitsDropdownMenu" class="nav-sub-items" style="display: ${window.app && window.app.isUnitsDropdownOpen ? 'flex' : 'none'};">
            ${units.map((u, idx) => {
              const isSelected = activeNav === 'unit_workspace' && window.app.currentUnitId === u.id;
              return `
                <a class="nav-sub-item ${isSelected ? 'active' : ''}" onclick="window.app.openUnitWorkspace('${u.id}')">
                  <span class="sub-item-prefix">
                    <span class="sub-item-dot"></span>
                    <span class="sub-item-name">${idx + 1}. ${u.name}</span>
                  </span>
                </a>
              `;
            }).join('')}
          </div>
        </div>

        <a class="nav-item ${activeNav === 'vehicles' ? 'active' : ''}" onclick="window.app.navigate('vehicles')" title="إدارة الآليات والحركة اللوجستية">
          <div class="nav-item-content">
            <span class="nav-icon-box icon-teal">
              <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a1 1 0 0 0-.8-.4H5a2 2 0 0 0-2 2v7h2"></path>
                <circle cx="7" cy="16" r="2"></circle>
                <circle cx="17" cy="16" r="2"></circle>
              </svg>
            </span>
            <span class="nav-item-label">إدارة حركة العجلات</span>
          </div>
        </a>

        <!-- Category 3: Human Resources & Requests -->
        <div class="nav-section-title">
          <span class="nav-section-dot"></span>
          <span>الموارد البشرية والطلبات</span>
        </div>

        <a class="nav-item ${activeNav === 'user_management' ? 'active' : ''}" onclick="window.app.navigate('user_management')" title="إدارة الكوادر والمستخدمين">
          <div class="nav-item-content">
            <span class="nav-icon-box icon-violet">
              <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </span>
            <span class="nav-item-label">إدارة المستخدمين</span>
          </div>
        </a>

        <a class="nav-item ${activeNav === 'requests' ? 'active' : ''}" onclick="window.app.navigate('requests')" title="متابعة وإرسال الطلبات الإدارية">
          <div class="nav-item-content">
            <span class="nav-icon-box icon-rose">
              <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </span>
            <span class="nav-item-label">الطلبات الإدارية</span>
          </div>
        </a>

        <a class="nav-item ${activeNav === 'promotion_calculator' ? 'active' : ''}" onclick="window.app.navigate('promotion_calculator')" title="حاسبة الاستحقاق الوظيفي والترفيعات">
          <div class="nav-item-content">
            <span class="nav-icon-box icon-emerald">
              <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="3"></rect>
                <line x1="8" y1="7" x2="16" y2="7"></line>
                <line x1="8" y1="12" x2="10" y2="12"></line>
                <line x1="14" y1="12" x2="16" y2="12"></line>
                <line x1="8" y1="16" x2="10" y2="16"></line>
                <line x1="14" y1="16" x2="16" y2="16"></line>
              </svg>
            </span>
            <span class="nav-item-label">حاسبة الاستحقاق والترفيع</span>
          </div>
        </a>

        <a class="nav-item ${activeNav === 'incentive_calculator' ? 'active' : ''}" onclick="window.app.navigate('incentive_calculator')" title="حاسبة الحوافز الرسمية (القسم المالي والتشغيلي)">
          <div class="nav-item-content">
            <span class="nav-icon-box icon-amber">
              <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"></path>
                <line x1="12" y1="6" x2="12" y2="8"></line>
                <line x1="12" y1="16" x2="12" y2="18"></line>
              </svg>
            </span>
            <span class="nav-item-label">حاسبة الحوافز الرسمية</span>
          </div>
        </a>

        ${isHRorMgr ? `
          <a class="nav-item ${activeNav === 'recycle_bin' ? 'active' : ''}" onclick="window.app.navigate('recycle_bin')" title="سلة المحذوفات واسترجاع السجلات">
            <div class="nav-item-content">
              <span class="nav-icon-box icon-slate">
                <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  <line x1="10" y1="11" x2="10" y2="17"></line>
                  <line x1="14" y1="11" x2="14" y2="17"></line>
                </svg>
              </span>
              <span class="nav-item-label">سلة المحذوفات (Soft Delete)</span>
            </div>
          </a>

          <a class="nav-item ${activeNav === 'audit_logs' ? 'active' : ''}" onclick="window.app.navigate('audit_logs')" title="سجل العمليات والأمان والرقابة">
            <div class="nav-item-content">
              <span class="nav-icon-box icon-amber">
                <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                  <polyline points="9 12 11 14 15 10"></polyline>
                </svg>
              </span>
              <span class="nav-item-label">سجل النشاطات والأمان</span>
            </div>
          </a>
        ` : ''}

        ${user.role === 'SUPER_ADMIN' ? `
          <!-- Category: Sovereign Leadership -->
          <div class="nav-section-title">
            <span class="nav-section-dot" style="background: var(--gold-primary, #f59e0b);"></span>
            <span style="color: #f59e0b; font-weight: 800;">القيادة السيادية</span>
          </div>

          <a class="nav-item ${activeNav === 'super_admin' ? 'active' : ''}" onclick="window.app.navigate('super_admin')" title="لوحة المؤسس والتحكم الداخلي بالنظام (المدمجة)">
            <div class="nav-item-content">
              <span class="nav-icon-box" style="background: rgba(245, 158, 11, 0.2); color: #f59e0b;">
                🛡️
              </span>
              <span class="nav-item-label" style="color: #f59e0b; font-weight: 800;">لوحة المؤسس الداخلية</span>
            </div>
          </a>

          <a class="nav-item" href="founder.html" target="_blank" title="الانتقال المباشر إلى بوابة المؤسس السيادية المستقلة">
            <div class="nav-item-content">
              <span class="nav-icon-box" style="background: rgba(0, 223, 216, 0.15); color: #00dfd8;">
                👑
              </span>
              <span class="nav-item-label" style="color: #00dfd8; font-weight: 700;">بوابة المؤسس السيادية ↗</span>
            </div>
          </a>
        ` : ''}

        <!-- Category 4: Personal Account -->
        <div class="nav-section-title">
          <span class="nav-section-dot"></span>
          <span>الحساب الشخصي</span>
        </div>

        <a class="nav-item ${activeNav === 'profile' ? 'active' : ''}" onclick="window.app.navigate('profile')" title="إدارة الملف الشخصي وإعدادات الحساب">
          <div class="nav-item-content">
            <span class="nav-icon-box icon-blue">
              <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </span>
            <span class="nav-item-label">الملف الوظيفي</span>
          </div>
        </a>

        <a class="nav-item nav-item-logout" onclick="window.app.handleLogout()" title="إنهاء الجلسة وتسجيل الخروج الآمن">
          <div class="nav-item-content">
            <span class="nav-icon-box icon-red">
              <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
            </span>
            <span class="nav-item-label">تسجيل الخروج</span>
          </div>
        </a>
      </nav>
    </aside>
  `;
}

window.renderSidebar = renderSidebar;
