/* ==========================================================================
   إدارة قسم الإنتاج الجنوبي - Career Title & Promotion Calculator (القسم 30)
   استناداً إلى جدول قانون الرواتب رقم 22 لسنة 2008 المعتمد في شركة نفط البصرة
   وجدول دورات الترقية المعتمد وضوابط القدم المكتسب لكتب الشكر والتقدير
   ========================================================================== */

if (typeof window !== 'undefined') {
  window.renderPromotionCalculatorView = renderPromotionCalculatorView;
}

function renderPromotionCalculatorView() {
  const user = (window.auth && typeof window.auth.getCurrentUser === 'function') ? window.auth.getCurrentUser() : {};
  const activeTab = window.app.activePromotionTab || 'calculator';
  const actorUser = user || { role: 'SUPER_ADMIN', departmentId: 'dept-south-prod' };
  const employees = (window.store && typeof window.store.getUnifiedEmployeeRoster === 'function') 
    ? window.store.getUnifiedEmployeeRoster(actorUser) 
    : ((window.store && typeof window.store.getEmployees === 'function') ? window.store.getEmployees() : []);

  // Initialize or maintain calculation state with Dual-Mode support
  if (!window.promotionCalcState) {
    const defaultEmp = (employees && employees.length > 0) ? employees[0] : null;
    window.promotionCalcState = {
      calcMode: 'auto', // 'auto' (الوضع التلقائي من السجلات) | 'manual' (الوضع اليدوي / المحاكاة)
      employeeId: defaultEmp ? (defaultEmp.employeeId || defaultEmp.id) : ((user && user.id) ? user.id : ''),
      employeeName: defaultEmp ? (defaultEmp.name || defaultEmp.fullName) : ((user && user.name) ? user.name : 'فني تشغيلي (نموذج افتراضي)'),
      jobTitle: defaultEmp ? (defaultEmp.jobTitle || 'فني') : ((user && user.jobTitle) ? user.jobTitle : 'فني'),
      trackKey: 'technical',
      grade: defaultEmp ? (defaultEmp.jobGrade || '8') : ((user && user.jobGrade) ? user.jobGrade : '8'),
      stage: defaultEmp ? (parseInt(defaultEmp.jobStage, 10) || 1) : ((user && user.jobStage) ? user.jobStage : 1),
      degree: defaultEmp ? (defaultEmp.qualification || defaultEmp.degree || 'دبلوم') : ((user && (user.degree || user.qualification)) ? (user.degree || user.qualification) : 'دبلوم'),
      lastPromo: defaultEmp ? (defaultEmp.lastPromotionDate || defaultEmp.hireDate || '2023-01-01') : ((user && user.lastPromotionDate) ? user.lastPromotionDate : '2023-01-01'),
      section: defaultEmp ? (defaultEmp.section || defaultEmp.station || '') : '',
      thanksConfig: defaultEmp ? (defaultEmp.thanksConfig || { minister: defaultEmp.thanksLettersCount || 1, primeMinister: 0, president: 0 }) : ((user && user.thanksConfig) ? user.thanksConfig : {
        minister: (user && user.thanksLettersCount) || 1,
        primeMinister: 0,
        president: 0
      })
    };
  }

  const calcState = window.promotionCalcState;
  if (!calcState.calcMode) calcState.calcMode = 'auto';
  const userGrade = calcState.grade || '8';
  const userStage = calcState.stage || 1;
  const userDegree = calcState.degree || 'دبلوم';
  const userJobTitle = calcState.jobTitle || 'فني';
  const userTrackKey = calcState.trackKey || 'technical';
  const userLastPromo = calcState.lastPromo || '2023-01-01';
  const thanksConfig = calcState.thanksConfig || { minister: 1, primeMinister: 0, president: 0 };

  const result = window.store.calculateCareerPromotion(userGrade, userStage, userLastPromo, thanksConfig, userDegree, userJobTitle, userTrackKey);
  const salaryScale = window.store.getBocSalaryScale();
  const promotionCourses = window.store.getBocPromotionCourses();
  const careerTracks = window.store.getCareerTracks();

  return `
    <div style="width: 100%; margin-bottom: 1.5rem;">
      
      <!-- Top Title & Enterprise Seal -->
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; margin-bottom: 1.25rem;">
        <div>
          <h2 style="font-size: 1.55rem; font-weight: 800; color: var(--md-sys-color-primary); margin: 0 0 0.25rem 0; letter-spacing: -0.2px;">
            🧮 حاسبة استحقاق الترفيع والعلاوة وتغيير العنوان الوظيفي
          </h2>
          <p style="color: var(--md-sys-color-outline); margin: 0; font-size: 0.86rem; font-weight: 600;">
            شركة نفط البصرة - الهيأة الإدارية - قسم إدارة الموارد البشرية | استناداً لقانون الرواتب رقم 22 لسنة 2008 ومسارات التوصيف الوظيفي المعتمدة.
          </p>
        </div>
        <div style="display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap;">
          ${(user && window.rbac && window.rbac.hasPermission(user, 'CAREER_EDIT_INFO')) || (user && ['DEPT_MANAGER', 'SUPER_ADMIN'].includes(user.role)) ? `
            <button class="btn btn-glass-amber" onclick="window.app.openBulkThanksModal()" style="font-size: 0.8rem; padding: 0.35rem 0.85rem; font-weight: 800; border-radius: 999px;">
              <span>🎖️ إضافة كتاب شكر للجميع</span>
            </button>
          ` : ''}
          <span class="badge badge-primary" style="font-size: 0.8rem; padding: 0.35rem 0.85rem; font-weight: 800; border-radius: 999px; box-shadow: 0 2px 8px rgba(11, 87, 208, 0.2);">
            قانون الرواتب رقم 22 لسنة 2008
          </span>
        </div>
      </div>

      <!-- Segmented Technological Navigation Tabs -->
      <div class="tabs-header" style="margin-top: 1.25rem; margin-bottom: 1.5rem;">
        <button class="tab-btn ${activeTab === 'calculator' ? 'active' : ''}" 
                onclick="window.app.setPromotionCalculatorTab('calculator')">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="3"></rect>
            <line x1="8" y1="7" x2="16" y2="7"></line>
            <line x1="8" y1="12" x2="10" y2="12"></line>
            <line x1="14" y1="12" x2="16" y2="12"></line>
            <line x1="8" y1="16" x2="10" y2="16"></line>
            <line x1="14" y1="16" x2="16" y2="16"></line>
          </svg>
          <span>الحاسبة الذكية والاستحقاق</span>
        </button>

        <button class="tab-btn ${activeTab === 'salary_scale' ? 'active' : ''}" 
                onclick="window.app.setPromotionCalculatorTab('salary_scale')">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="20" x2="18" y2="10"></line>
            <line x1="12" y1="20" x2="12" y2="4"></line>
            <line x1="6" y1="20" x2="6" y2="14"></line>
          </svg>
          <span>سلم الرواتب والعلاوات (قانون 22)</span>
        </button>

        <button class="tab-btn ${activeTab === 'courses_matrix' ? 'active' : ''}" 
                onclick="window.app.setPromotionCalculatorTab('courses_matrix')">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
            <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
          </svg>
          <span>مصفوفة الدورات الحتمية للترقية</span>
        </button>

        <button class="tab-btn ${activeTab === 'regulations' ? 'active' : ''}" 
                onclick="window.app.setPromotionCalculatorTab('regulations')">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
          <span>الضوابط ودليل الموظفين</span>
        </button>
      </div>

      <!-- Active Tab Content -->
      ${activeTab === 'calculator' ? renderSmartCalculatorTab(result, userGrade, userStage, userDegree, userLastPromo, thanksConfig, calcState, employees, careerTracks) : ''}
      ${activeTab === 'salary_scale' ? renderSalaryScaleTab(salaryScale, result) : ''}
      ${activeTab === 'courses_matrix' ? renderCoursesMatrixTab(promotionCourses) : ''}
      ${activeTab === 'regulations' ? renderRegulationsTab() : ''}

    </div>
  `;
}

// Global Tab Switcher Function
if (typeof window !== 'undefined') {
  if (!window.app) window.app = {};
  window.app.switchPromotionTab = function(tabName) {
    window.app.activePromotionTab = tabName;
    if (typeof window.app.render === 'function') {
      window.app.render();
    }
  };
}

// ==========================================================================
// 1. تبويب الحاسبة الذكية والاستحقاق (Dual Mode: Automatic & Manual Simulation)
// ==========================================================================
function renderSmartCalculatorTab(result, userGrade, userStage, userDegree, userLastPromo, thanksConfig, calcState, employees, careerTracks) {
  const user = (window.auth && typeof window.auth.getCurrentUser === 'function') ? (window.auth.getCurrentUser() || {}) : {};
  const isAutoMode = (calcState && calcState.calcMode === 'auto');
  const td = result.thanksDetails || {
    ministerCount: 0,
    ministerSeniorityMonths: 0,
    pmCount: 0,
    pmSeniorityMonths: 0,
    presCount: 0,
    presSeniorityMonths: 0,
    totalSeniorityMonths: 0
  };

  const salaryDiff = (result.salaryAfterPromotion || 0) - (result.currentSalary || 0);

  return `
    <div style="display: flex; flex-direction: column; gap: 1rem;">
      
      <!-- المفتاح التبادلي الفاخر بين الوضع التلقائي والوضع اليدوي (Segmented Dual-Mode Switcher) -->
      <div class="promo-mode-switcher-wrap">
        <div class="promo-mode-switcher">
          <button type="button" class="promo-mode-btn ${isAutoMode ? 'active-auto' : ''}" onclick="window.setPromotionCalcMode('auto')">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
            </svg>
            <span>الوضع التلقائي</span>
          </button>
          <button type="button" class="promo-mode-btn ${!isAutoMode ? 'active-manual' : ''}" onclick="window.setPromotionCalcMode('manual')">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 20h9"></path>
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
            </svg>
            <span>الوضع اليدوي</span>
          </button>
        </div>
      </div>

      <!-- بلورات الاستحقاق الرباعية المضيئة الحديثة (Jewel Frosted Glass) -->
      <div class="promo-crystal-grid">
        
        <!-- البلورة 1: العنوان الوظيفي القادم المستحق -->
        <div class="promo-crystal-card promo-crystal-career">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.35rem;">
            <span class="promo-card-title">
              🎯 العنوان المستحق القادم:
            </span>
          </div>
          <div class="promo-card-value promo-career-title">
            ${result.nextJobTitle || 'مدير فني أقدم'}
          </div>
          <div class="promo-card-detail">
            <span>الحالي: <strong>${result.currentJobTitle || 'فني'}</strong></span>
            <span class="promo-next-grade-tag">${result.nextGradeName || ''}</span>
          </div>
        </div>

        <!-- البلورة 2: تاريخ الاستحقاق القادم -->
        <div class="promo-crystal-card promo-crystal-due">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.35rem;">
            <span class="promo-card-title">
              📅 تاريخ الاستحقاق القانوني:
            </span>
            <span class="mini-pulse-dot" style="background-color: ${result.isDue ? '#10b981' : '#00dfd8'};"></span>
          </div>
          <div class="promo-card-date">
            ${result.dueDate}
          </div>
          <div style="margin-top: 0.35rem; display: flex; align-items: center; gap: 0.4rem;">
            <span class="badge ${result.isDue ? 'badge-success' : 'badge-warning'} promo-status-badge">
              ${result.status}
            </span>
          </div>
        </div>

        <!-- البلورة 3: المدة الأصغرية القانونية -->
        <div class="promo-crystal-card promo-crystal-duration">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.35rem;">
            <span class="promo-card-title">
              ⏱️ المدة الأصغرية المطلوبة:
            </span>
          </div>
          <div class="promo-card-value">
            ${result.requiredYears} ${result.requiredYears === 1 ? 'سنة واحدة' : 'سنوات'} <span class="promo-card-sub">(${result.totalMonthsRequired} شهراً)</span>
          </div>
          <div class="promo-card-detail">
            <span>📅 المباشرة:</span>
            <span style="font-family: monospace; font-weight: 800;">${userLastPromo}</span>
          </div>
        </div>

        <!-- البلورة 4: إجمالي القدم المكتسب -->
        <div class="promo-crystal-card promo-crystal-seniority">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.35rem;">
            <span class="promo-card-title">
              🎖️ إجمالي القدم المكتسب:
            </span>
            <span class="badge badge-seniority-sub">
              مخصومة
            </span>
          </div>
          <div class="promo-card-value">
            ${td.totalSeniorityMonths} أشهر <span class="promo-card-sub">(كامل المدة)</span>
          </div>
          <div class="promo-card-detail">
            ✓ بدون سقف 6 أشهر للترفيع
          </div>
        </div>

      </div>

      <!-- النصف السفلي التفاعلي حسب الوضع المختار (تلقائي أو يدوي) -->
      ${isAutoMode ? `
        <!-- ======================= الوضع التلقائي (AUTOMATIC ROSTER MODE) ======================= -->
        
        ${(() => {
          const curUser = (user && typeof user === 'object') ? user : {};
          const curRole = curUser.role || '';
          const canBrowseAll = (window.rbac && typeof window.rbac.hasPermission === 'function' && window.rbac.hasPermission(curUser, 'CAREER_EDIT_INFO')) 
            || ['SUPER_ADMIN', 'DEPT_MANAGER', 'DEPUTY_DEPT_MANAGER', 'ADMIN_MANAGER'].includes(curRole);
          const canBrowseSection = !canBrowseAll && ['SECTION_MANAGER', 'DEPUTY_SECTION_MANAGER', 'UNIT_MANAGER', 'STATION_MANAGER', 'DEPUTY_STATION_MANAGER', 'STATION_SUPERVISOR'].includes(curRole);
          const isRegularEmployee = !canBrowseAll && !canBrowseSection;

          let allowedEmployees = employees || [];
          if (isRegularEmployee) {
            if (curUser && (curUser.id || curUser.employeeId)) {
              const found = employees.find(e => 
                (curUser.employeeId && String(e.employeeId) === String(curUser.employeeId)) ||
                (curUser.id && (String(e.id) === String(curUser.id) || String(e.userId) === String(curUser.id)))
              );
              allowedEmployees = found ? [found] : (employees.length > 0 ? employees.slice(0, 1) : []);
            } else {
              allowedEmployees = (employees && employees.length > 0) ? employees.slice(0, 1) : [];
            }
          } else if (canBrowseSection && curUser) {
            const secFiltered = employees.filter(e => {
              const matchesSec = curUser.section && (e.section === curUser.section);
              const matchesSta = (curUser.station || curUser.stationId) && (e.station === curUser.station || e.stationId === curUser.stationId || e.station === curUser.stationId);
              const isSelf = (curUser.employeeId && String(e.employeeId) === String(curUser.employeeId)) || (curUser.id && String(e.id) === String(curUser.id));
              return matchesSec || matchesSta || isSelf;
            });
            allowedEmployees = secFiltered.length > 0 ? secFiltered : employees;
          }

          if (isRegularEmployee) {
            return `
              <!-- بنر الخصوصية والأمان للموظف الفردي -->
              <div class="promo-privacy-banner">
                <div style="display: flex; align-items: center; gap: 0.65rem;">
                  <span style="font-size: 1.35rem;">🔒</span>
                  <div>
                    <strong style="font-size: 0.88rem; color: #0284c7;">إضبارتك وسجلك الوظيفي الشخصي المعتمد | شركة نفط البصرة</strong>
                    <p style="margin: 0; font-size: 0.76rem; color: var(--md-sys-color-outline);">
                      يتم جلب بيانات درجتك وعنوانك واستحقاقك القانوني مباشرة من ملفك الوظيفي الموثق مع ضمان سرية وخصوصية البيانات.
                    </p>
                  </div>
                </div>
                <span class="badge badge-primary" style="font-size: 0.74rem; padding: 0.25rem 0.65rem; border-radius: 999px;">
                  ✓ حساب شخصي مؤمن
                </span>
              </div>
            `;
          }

          const searchState = window.promotionCalcSearchState || { searchQuery: '', selectedSection: 'ALL' };
          const searchQuery = (searchState.searchQuery || '').trim();
          const selectedSection = searchState.selectedSection || 'ALL';
          const isActivelyFiltering = !!searchQuery || selectedSection !== 'ALL';
          const uniqueSections = Array.from(new Set(allowedEmployees.map(e => e.section || e.station).filter(Boolean))).sort();

          const filteredEmployees = isActivelyFiltering ? allowedEmployees.filter(e => {
            if (selectedSection !== 'ALL') {
              const eSec = e.section || e.station || '';
              if (eSec !== selectedSection) return false;
            }
            if (searchQuery) {
              const q = searchQuery.toLowerCase();
              const nameStr = (e.name || e.fullName || '').toLowerCase();
              const idStr = String(e.employeeId || e.id || '').toLowerCase();
              const titleStr = (e.jobTitle || '').toLowerCase();
              const secStr = (e.section || e.station || '').toLowerCase();
              return nameStr.includes(q) || idStr.includes(q) || titleStr.includes(q) || secStr.includes(q);
            }
            return true;
          }) : [];

          // Currently active / loaded employee object
          const currentEmp = allowedEmployees.find(e => String(e.employeeId || e.id) === String(calcState.employeeId)) 
            || allowedEmployees.find(e => (e.name || e.fullName) === calcState.employeeName)
            || allowedEmployees[0];
          const currentEmpId = currentEmp ? (currentEmp.employeeId || currentEmp.id) : (calcState.employeeId || '');
          const currentEmpName = currentEmp ? (currentEmp.name || currentEmp.fullName) : (calcState.employeeName || 'المستخدم الحالي');
          const currentEmpTitle = currentEmp ? (currentEmp.jobTitle || 'موظف') : (calcState.jobTitle || 'موظف');
          const currentEmpSec = currentEmp ? (currentEmp.section || currentEmp.station || 'إدارة القسم') : (calcState.section || 'إدارة القسم');

          return `
            <!-- بطاقة البحث والفلترة الذكية واختيار الموظف للإدارة والمسؤولين -->
            ${allowedEmployees && allowedEmployees.length > 0 ? `
            <div class="card promo-search-filter-card">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.65rem; flex-wrap: wrap; gap: 0.5rem;">
                <label style="font-weight: 800; font-size: 0.86rem; color: var(--md-sys-color-primary); margin: 0; display: flex; align-items: center; gap: 0.45rem;">
                  <span>👥</span>
                  <span>${canBrowseAll ? 'البحث في سجلات الموظفين:' : `سجلات منتسبي ${curUser.section || curUser.station || 'الشعبة / المحطة'}:`}</span>
                </label>
                <div style="display: flex; align-items: center; gap: 0.4rem; flex-wrap: wrap;">
                  ${isActivelyFiltering ? `
                    <span class="badge ${filteredEmployees.length > 0 ? 'badge-info' : 'badge-warning'}" id="promoMatchCountBadge" style="font-size: 0.74rem; padding: 0.2rem 0.6rem; font-weight: 800; border-radius: 999px;">
                      ⚡ النتائج المطابقة: ${filteredEmployees.length}
                    </span>
                  ` : `
                    <span class="badge badge-info" id="promoMatchCountBadge" style="font-size: 0.74rem; padding: 0.2rem 0.6rem; font-weight: 800; border-radius: 999px;">
                      ⚡ الوضع التلقائي للمستخدم
                    </span>
                  `}
                  ${canBrowseSection ? `
                    <span class="badge badge-success" style="font-size: 0.72rem; padding: 0.2rem 0.55rem; font-weight: 800; border-radius: 999px;">
                      🔒 نطاق الشعبة
                    </span>
                  ` : ''}
                </div>
              </div>

              <!-- Search Controls Grid -->
              <div style="display: grid; grid-template-columns: 1.4fr 1fr; gap: 0.65rem; margin-bottom: 0.65rem; align-items: center;">
                
                <!-- Live Search Input with Clear Button -->
                <div style="position: relative; width: 100%;">
                  <div style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); pointer-events: none; color: var(--md-sys-color-outline); display: flex; align-items: center;">
                    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                      <circle cx="11" cy="11" r="8"></circle>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                  </div>
                  <input type="text" 
                         id="promoEmployeeSearchInput" 
                         class="form-control" 
                         style="padding-right: 32px; padding-left: 30px; font-size: 0.82rem; height: 36px; border-radius: 8px; border: 1.5px solid rgba(11, 87, 208, 0.25); font-weight: 700; background: var(--md-sys-color-background); color: var(--md-sys-color-on-surface);" 
                         placeholder="🔍 بحث فوري بالاسم أو الرقم الوظيفي..." 
                         value="${searchQuery}" 
                         oninput="window.handlePromotionEmployeeSearch(this.value)">
                  ${searchQuery ? `
                    <button type="button" 
                            onclick="window.clearPromotionEmployeeSearch()" 
                            style="position: absolute; left: 8px; top: 50%; transform: translateY(-50%); border: none; background: transparent; cursor: pointer; color: var(--md-sys-color-outline); font-size: 0.85rem; padding: 2px 5px; font-weight: 900;" 
                            title="مسح البحث">✕</button>
                  ` : ''}
                </div>

                <!-- Quick Section / Station Filter Dropdown -->
                <div>
                  <select class="form-control" 
                          id="promoSectionFilterSelect"
                          style="width: 100%; font-size: 0.82rem; height: 36px; border-radius: 8px; border: 1.5px solid rgba(11, 87, 208, 0.25); font-weight: 700; background: var(--md-sys-color-background); color: var(--md-sys-color-on-surface);" 
                          onchange="window.handlePromotionSectionFilter(this.value)">
                    <option value="ALL" ${selectedSection === 'ALL' ? 'selected' : ''}>🏢 كافة الشُعب والمحطات</option>
                    ${uniqueSections.map(sec => `<option value="${sec}" ${selectedSection === sec ? 'selected' : ''}>📍 ${sec}</option>`).join('')}
                  </select>
                </div>

              </div>

              <!-- Filtered Employee Dropdown Selector (Optimized Dynamic Select) -->
              <div>
                <select class="form-control" 
                        id="promoEmployeeSelect"
                        onchange="window.loadEmployeeToPromotionCalc(this.value)" 
                        style="width: 100%; font-size: 0.88rem; padding: 0.5rem 0.85rem; border-radius: 8px; border: 1.8px solid #0d6efd; background: var(--md-sys-color-background); font-weight: 750; color: var(--md-sys-color-on-surface); box-shadow: 0 2px 6px rgba(13, 110, 253, 0.08);">
                  ${!isActivelyFiltering ? `
                    <option value="${currentEmpId}" selected>
                      👤 ${currentEmpName} [الرقم: ${currentEmpId || '—'}] - ${currentEmpTitle} (${currentEmpSec})
                    </option>
                    <option value="" disabled style="color: var(--md-sys-color-outline); font-style: italic;">
                      💡 ابحث أعلاه بالاسم أو الرقم الوظيفي لاختيار منتسب آخر...
                    </option>
                  ` : (filteredEmployees.length === 0 ? `
                    <option value="">⚠️ لا توجد نتائج مطابقة لمعايير البحث الحالية</option>
                  ` : `
                    <option value="">-- اختر موظفاً من النتائج المطابقة (${filteredEmployees.length} نتيجة) --</option>
                    ${filteredEmployees.slice(0, 30).map(e => {
                      const empIdVal = e.employeeId || e.id;
                      const isSel = (calcState && (String(calcState.employeeId) === String(empIdVal) || String(calcState.employeeId) === String(e.id)));
                      return `<option value="${empIdVal}" ${isSel ? 'selected' : ''}>${e.name || e.fullName || 'بدون اسم'} [الرقم: ${empIdVal}] - ${e.jobTitle || 'موظف'} (${e.section || e.station || 'قسم الإنتاج الجنوبي'})</option>`;
                    }).join('')}
                    ${filteredEmployees.length > 30 ? `<option value="" disabled>... والمزيد (${filteredEmployees.length - 30} موظف إضافي) - حدد اسم الموظف بدقة أكبر في البحث</option>` : ''}
                  `)}
                </select>
              </div>
            </div>
            ` : ''}
          `;
        })()}

        <!-- بطاقة الإضبارة الشاملة المعتمدة للموظف (Master Dossier Summary Card) -->
        <div class="promo-dossier-card">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.85rem; border-bottom: 1.5px solid rgba(37, 99, 235, 0.16); padding-bottom: 0.95rem;">
            <div style="display: flex; align-items: center; gap: 0.85rem;">
              <div style="width: 50px; height: 50px; min-width: 50px; border-radius: 14px; background: linear-gradient(135deg, #2563eb 0%, #0284c7 100%); color: #ffffff; display: flex; align-items: center; justify-content: center; font-size: 1.4rem; font-weight: 900; box-shadow: 0 4px 16px rgba(37, 99, 235, 0.35);">
                ${(calcState.employeeName || 'م').charAt(0)}
              </div>
              <div>
                <div style="display: flex; align-items: center; gap: 0.55rem; flex-wrap: wrap;">
                  <h3 style="margin: 0; font-size: 1.2rem; font-weight: 900; color: var(--md-sys-color-primary); letter-spacing: -0.2px;">
                    ${calcState.employeeName || 'منتسب'}
                  </h3>
                  ${calcState.employeeId ? `
                    <span class="promo-dossier-id-pill">
                      الرقم الوظيفي: ${calcState.employeeId}
                    </span>
                  ` : ''}
                  ${(() => {
                    const knownRoles = ['مدير قسم', 'مسؤول شعبة', 'مسؤول وحدة', 'مسؤول موقع', 'مهندس مناوب', 'مشغل محطة'];
                    const candidate = (calcState.jobTitle || calcState.role || '').trim();
                    const isManagerial = knownRoles.some(r => candidate.includes(r)) || (calcState.role && !['EMPLOYEE', 'USER'].includes(calcState.role));
                    if (isManagerial && candidate) {
                      return `
                        <span class="promo-dossier-role-pill">
                          <span>⭐</span><span>${candidate}</span>
                        </span>
                      `;
                    }
                    return '';
                  })()}
                  ${calcState.section ? `
                    <span class="promo-dossier-section-pill">
                      <span>🏢</span><span>${calcState.section}</span>
                    </span>
                  ` : ''}
                </div>
                <p style="margin: 4px 0 0 0; font-size: 0.78rem; color: var(--md-sys-color-outline); font-weight: 600; display: flex; align-items: center; gap: 0.35rem;">
                  <span>🏛️</span>
                  <span>بيانات الإضبارة والخدمة الوظيفية المعتمدة رسمياً في شركة نفط البصرة</span>
                </p>
              </div>
            </div>

            <div>
              <button type="button" class="btn btn-glass-primary" style="font-size: 0.8rem; font-weight: 800; padding: 0.45rem 1rem; border-radius: 10px; display: inline-flex; align-items: center; gap: 0.4rem; box-shadow: 0 3px 10px rgba(37, 99, 235, 0.16);" onclick="window.app && typeof window.app.openMasterDossierModal === 'function' ? window.app.openMasterDossierModal('${calcState.employeeId}') : (window.app && window.app.showToast ? window.app.showToast('الإضبارة الرقمية للمنتسب محملة وجاهزة', 'info') : null)">
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                </svg>
                <span>📂 معاينة الإضبارة الشاملة</span>
              </button>
            </div>
          </div>

          <!-- Single Unbroken Row Ribbon for All 6 Dossier Fields -->
          <div class="promo-dossier-grid">
            <!-- Col 1: Official Career Job Title -->
            <div class="promo-dossier-pill">
              <div style="font-size: 0.68rem; color: var(--md-sys-color-outline); font-weight: 700; display: flex; align-items: center; justify-content: center; gap: 0.2rem; white-space: nowrap;">
                <span>🏷️</span><span>العنوان الرسمي:</span>
              </div>
              <strong style="font-size: 0.88rem; color: var(--md-sys-color-on-surface); font-weight: 900; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%;" title="${result.currentJobTitle || 'فني'}">
                ${result.currentJobTitle || 'فني'}
              </strong>
            </div>

            <!-- Col 2: Degree & Qualification -->
            <div class="promo-dossier-pill">
              <div style="font-size: 0.68rem; color: var(--md-sys-color-outline); font-weight: 700; display: flex; align-items: center; justify-content: center; gap: 0.2rem; white-space: nowrap;">
                <span>🎓</span><span>التحصيل والتخصص:</span>
              </div>
              <strong style="font-size: 0.86rem; color: var(--md-sys-color-on-surface); font-weight: 850; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%;" title="${calcState.degree || 'بكالوريوس'}">
                ${calcState.degree || 'بكالوريوس'}
              </strong>
            </div>

            <!-- Col 3: Current Grade & Stage -->
            <div class="promo-dossier-pill">
              <div style="font-size: 0.68rem; color: var(--md-sys-color-outline); font-weight: 700; display: flex; align-items: center; justify-content: center; gap: 0.2rem; white-space: nowrap;">
                <span>📊</span><span>الدرجة والمرحلة:</span>
              </div>
              <strong style="font-size: 0.84rem; color: var(--md-sys-color-on-surface); font-weight: 850; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%;">
                ${String(result.gradeName || calcState.grade || '').startsWith('الدرجة') ? (result.gradeName || calcState.grade) : ('الدرجة ' + (result.gradeName || calcState.grade))} <span style="font-size: 0.74rem; color: var(--md-sys-color-primary); font-weight: 800;">- م${calcState.stage || 1}</span>
              </strong>
            </div>

            <!-- Col 4: Last Promotion Date -->
            <div class="promo-dossier-pill">
              <div style="font-size: 0.68rem; color: var(--md-sys-color-outline); font-weight: 700; display: flex; align-items: center; justify-content: center; gap: 0.2rem; white-space: nowrap;">
                <span>📅</span><span>آخر ترفيع:</span>
              </div>
              <strong style="font-size: 0.84rem; font-family: 'JetBrains Mono', Consolas, monospace; font-weight: 850; color: var(--md-sys-color-on-surface); white-space: nowrap;">
                ${userLastPromo}
              </strong>
            </div>

            <!-- Col 5: Last Annual Increment Date -->
            <div class="promo-dossier-pill">
              <div style="font-size: 0.68rem; color: var(--md-sys-color-outline); font-weight: 700; display: flex; align-items: center; justify-content: center; gap: 0.2rem; white-space: nowrap;">
                <span>📅</span><span>آخر علاوة سنوية:</span>
              </div>
              <strong style="font-size: 0.84rem; color: #0284c7; font-family: 'JetBrains Mono', Consolas, monospace; font-weight: 850; white-space: nowrap;">
                ${(() => {
                  let lastIncStr = calcState.lastIncrementDate;
                  if (!lastIncStr && userLastPromo) {
                    try {
                      const pDate = new Date(userLastPromo);
                      if (!isNaN(pDate.getTime())) {
                        const stageNum = parseInt(calcState.stage, 10) || 1;
                        const incDate = new Date(pDate.getTime());
                        incDate.setFullYear(incDate.getFullYear() + Math.max(0, stageNum - 1));
                        lastIncStr = incDate.toISOString().split('T')[0];
                      }
                    } catch (e) {
                      lastIncStr = userLastPromo;
                    }
                  }
                  return lastIncStr || userLastPromo;
                })()}
              </strong>
            </div>

            <!-- Col 6: Thanks Letters & Seniority Credit -->
            <div class="promo-dossier-pill">
              <div style="font-size: 0.68rem; color: var(--md-sys-color-outline); font-weight: 700; display: flex; align-items: center; justify-content: center; gap: 0.2rem; white-space: nowrap;">
                <span>🎖️</span><span>القدم والشكر:</span>
              </div>
              <strong style="font-size: 0.78rem; color: #059669; font-weight: 850; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%;">
                <span class="badge badge-success" style="font-size: 0.7rem; font-weight: 850; padding: 0.12rem 0.45rem; border-radius: 999px;">${td.totalSeniorityMonths || 0} شهر قدم</span>
              </strong>
            </div>
          </div>
        </div>
      ` : `
        <!-- ======================= الوضع اليدوي / المحاكاة (MANUAL SIMULATION MODE) ======================= -->
        
        <div class="card" style="box-shadow: 0 6px 20px rgba(0, 0, 0, 0.03), inset 0 1px 1px rgba(255, 255, 255, 0.9); border-radius: 16px; border: 1.5px solid rgba(16, 185, 129, 0.25); background: var(--md-sys-color-surface); padding: 1.15rem; margin-bottom: 0;">
          
          <!-- Simulation Mode Banner -->
          <div style="margin-bottom: 1rem; padding: 0.75rem 1rem; background: linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(5, 150, 105, 0.05) 100%); border: 1.5px solid rgba(16, 185, 129, 0.3); border-radius: 12px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem;">
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <span style="font-size: 1.25rem;">🧪</span>
              <div>
                <strong style="font-size: 0.86rem; color: #065f46;">وضع المحاكاة والاحتساب اليدوي الافتراضي (What-If Analysis)</strong>
                <p style="margin: 0; font-size: 0.74rem; color: var(--md-sys-color-outline);">يمكنك تعديل كافة الحقول وتجربة السيناريوهات المختلفة بحرية تامة دون التأثير على سجلات الموظف الرسمية.</p>
              </div>
            </div>
            <div style="display: flex; gap: 0.4rem; align-items: center; flex-wrap: wrap;">
              <button type="button" class="btn btn-outline" onclick="window.resetManualSimulation()" style="font-size: 0.75rem; padding: 0.3rem 0.75rem; font-weight: 800; border-radius: 8px; border: 1px solid #10b981; color: #047857; display: flex; align-items: center; gap: 0.3rem;">
                <span>🔄</span>
                <span>إعادة ضبط المحاكاة</span>
              </button>
            </div>
          </div>

          <!-- Presets Quick Bar -->
          <div style="display: flex; align-items: center; gap: 0.4rem; margin-bottom: 0.85rem; flex-wrap: wrap;">
            <span style="font-size: 0.75rem; font-weight: 800; color: var(--md-sys-color-primary);">⚡ نماذج جاهزة:</span>
            <button type="button" class="btn btn-outline" onclick="window.applyPromotionCalcPreset('tech_institute')" style="font-size: 0.72rem; padding: 0.2rem 0.6rem; border-radius: 999px;">فني معهد (سنة واحدة)</button>
            <button type="button" class="btn btn-outline" onclick="window.applyPromotionCalcPreset('tech_preparatory')" style="font-size: 0.72rem; padding: 0.2rem 0.6rem; border-radius: 999px;">فني إعدادية (4 سنوات)</button>
            <button type="button" class="btn btn-outline" onclick="window.applyPromotionCalcPreset('chief_technician')" style="font-size: 0.72rem; padding: 0.2rem 0.6rem; border-radius: 999px;">رئيس ملاحظين فني</button>
            <button type="button" class="btn btn-outline" onclick="window.applyPromotionCalcPreset('senior_engineer')" style="font-size: 0.72rem; padding: 0.2rem 0.6rem; border-radius: 999px;">مهندس أقدم</button>
          </div>

          <form onsubmit="window.app.handleCalculatePromotion(event)">
            
            <div style="display: grid; grid-template-columns: 1.25fr 1fr; gap: 1rem; align-items: start; margin-bottom: 0.85rem;">
              
              <!-- معطيات العنوان والمسار والدرجة والمرحلة والمؤهل والتاريخ -->
              <div style="background: var(--md-sys-color-background); border: 1px solid var(--md-sys-color-surface-variant); border-radius: 12px; padding: 0.85rem; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);">
                <div style="display: flex; align-items: center; gap: 0.4rem; margin-bottom: 0.65rem; color: var(--md-sys-color-primary); font-weight: 800; font-size: 0.82rem;">
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  <span>بيانات العنوان الوظيفي والمسار والدرجة (محاكاة):</span>
                </div>

                <!-- السطر 1: العنوان الحالي + المسار الوظيفي -->
                <div style="display: grid; grid-template-columns: 1.15fr 1fr; gap: 0.6rem; margin-bottom: 0.6rem;">
                  <div class="form-group" style="margin-bottom: 0;">
                    <label class="form-label" style="font-weight: 700; font-size: 0.74rem; color: var(--md-sys-color-on-surface); margin-bottom: 0.2rem;">العنوان الوظيفي:</label>
                    <input type="text" id="calcJobTitle" class="form-control" style="font-weight: 800; font-size: 0.78rem; border-radius: 7px; border: 1px solid var(--md-sys-color-outline-variant); background: var(--md-sys-color-surface); height: 35px; padding: 0 0.5rem;" value="${calcState.jobTitle || 'فني'}" placeholder="مثال: فني، ملاحظ فني، مهندس أقدم..." onchange="window.app.handleCalculatePromotion(event)">
                  </div>

                  <div class="form-group" style="margin-bottom: 0;">
                    <label class="form-label" style="font-weight: 700; font-size: 0.74rem; color: var(--md-sys-color-on-surface); margin-bottom: 0.2rem;">المسار الوظيفي:</label>
                    <select id="calcTrack" class="form-control" style="font-weight: 700; font-size: 0.78rem; border-radius: 7px; border: 1px solid var(--md-sys-color-outline-variant); background: var(--md-sys-color-surface); height: 35px; padding: 0 0.5rem;" onchange="window.app.handleCalculatePromotion(event)">
                      <option value="technical" ${calcState.trackKey === 'technical' ? 'selected' : ''}>🔧 المسار الفني والتشغيلي</option>
                      <option value="engineering" ${calcState.trackKey === 'engineering' ? 'selected' : ''}>⚙️ المسار الهندسي</option>
                      <option value="administrative" ${calcState.trackKey === 'administrative' ? 'selected' : ''}>📋 المسار الإداري والمالي والقانوني</option>
                      <option value="scientific" ${calcState.trackKey === 'scientific' ? 'selected' : ''}>🔬 المسار العلمي والجيولوجي</option>
                      <option value="crafts" ${calcState.trackKey === 'crafts' ? 'selected' : ''}>🔨 المسار الحرفي والخدمي</option>
                    </select>
                  </div>
                </div>

                <!-- السطر 2: الدرجة + المرحلة -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.6rem; margin-bottom: 0.6rem;">
                  <!-- الدرجة -->
                  <div class="form-group" style="margin-bottom: 0;">
                    <label class="form-label" style="font-weight: 700; font-size: 0.74rem; color: var(--md-sys-color-on-surface); margin-bottom: 0.2rem;">الدرجة الوظيفية:</label>
                    <select id="calcGrade" class="form-control" style="font-weight: 700; font-size: 0.78rem; border-radius: 7px; border: 1px solid var(--md-sys-color-outline-variant); background: var(--md-sys-color-surface); height: 35px; padding: 0 0.5rem;" onchange="window.app.handleCalculatePromotion(event)">
                      <option value="SPECIAL" ${['SPECIAL', 'خاصة', 'الخاصة'].includes(userGrade) ? 'selected' : ''}>الدرجة الخاصة</option>
                      <option value="1" ${['1', 'الأولى', 'الاولى'].includes(userGrade) ? 'selected' : ''}>الدرجة الأولى (سقف الترفيع)</option>
                      <option value="2" ${['2', 'الثانية'].includes(userGrade) ? 'selected' : ''}>الدرجة الثانية (5 س)</option>
                      <option value="3" ${['3', 'الثالثة'].includes(userGrade) ? 'selected' : ''}>الدرجة الثالثة (5 س)</option>
                      <option value="4" ${['4', 'الرابعة'].includes(userGrade) ? 'selected' : ''}>الدرجة الرابعة (5 س)</option>
                      <option value="5" ${['5', 'الخامسة'].includes(userGrade) ? 'selected' : ''}>الدرجة الخامسة (5 س)</option>
                      <option value="6" ${['6', 'السادسة'].includes(userGrade) ? 'selected' : ''}>الدرجة السادسة (4 س)</option>
                      <option value="7" ${['7', 'السابعة'].includes(userGrade) ? 'selected' : ''}>الدرجة السابعة (4 س)</option>
                      <option value="8" ${['8', 'الثامنة'].includes(userGrade) ? 'selected' : ''}>الدرجة الثامنة (سنة للمعهد / 4 س للإعدادية)</option>
                      <option value="9" ${['9', 'التاسعة'].includes(userGrade) ? 'selected' : ''}>الدرجة التاسعة (4 س)</option>
                      <option value="10" ${['10', 'العاشرة'].includes(userGrade) ? 'selected' : ''}>الدرجة العاشرة (4 س)</option>
                    </select>
                  </div>

                  <!-- المرحلة -->
                  <div class="form-group" style="margin-bottom: 0;">
                    <label class="form-label" style="font-weight: 700; font-size: 0.74rem; color: var(--md-sys-color-on-surface); margin-bottom: 0.2rem;">المرحلة الحالية:</label>
                    <select id="calcStage" class="form-control" style="font-weight: 700; font-size: 0.78rem; border-radius: 7px; border: 1px solid var(--md-sys-color-outline-variant); background: var(--md-sys-color-surface); height: 35px; padding: 0 0.5rem;" onchange="window.app.handleCalculatePromotion(event)">
                      ${Array.from({ length: 11 }, (_, i) => i + 1).map(s => `
                        <option value="${s}" ${parseInt(userStage, 10) === s ? 'selected' : ''}>المرحلة ${s}</option>
                      `).join('')}
                    </select>
                  </div>
                </div>

                <!-- السطر 3: التحصيل الدراسي + تاريخ المباشرة/الترفيع -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.6rem;">
                  <!-- التحصيل الدراسي -->
                  <div class="form-group" style="margin-bottom: 0;">
                    <label class="form-label" style="font-weight: 700; font-size: 0.74rem; color: var(--md-sys-color-on-surface); margin-bottom: 0.2rem;">التحصيل الدراسي:</label>
                    <select id="calcDegree" class="form-control" style="font-weight: 700; font-size: 0.78rem; border-radius: 7px; border: 1px solid var(--md-sys-color-outline-variant); background: var(--md-sys-color-surface); height: 35px; padding: 0 0.5rem;" onchange="window.app.handleCalculatePromotion(event)">
                      <option value="دكتوراه" ${userDegree === 'دكتوراه' ? 'selected' : ''}>دكتوراه</option>
                      <option value="ماجستير" ${userDegree === 'ماجستير' ? 'selected' : ''}>ماجستير</option>
                      <option value="دبلوم عالي" ${userDegree === 'دبلوم عالي' ? 'selected' : ''}>دبلوم عالي</option>
                      <option value="بكالوريوس" ${['بكالوريوس', 'بكلوريوس'].includes(userDegree) ? 'selected' : ''}>بكالوريوس</option>
                      <option value="دبلوم" ${userDegree === 'دبلوم' ? 'selected' : ''}>دبلوم فني / معهد نفطي</option>
                      <option value="اعدادية" ${['اعدادية', 'إعدادية'].includes(userDegree) ? 'selected' : ''}>إعدادية (صناعة / عامة)</option>
                      <option value="متوسطة" ${userDegree === 'متوسطة' ? 'selected' : ''}>متوسطة</option>
                      <option value="ابتدائية" ${userDegree === 'ابتدائية' ? 'selected' : ''}>ابتدائية</option>
                    </select>
                  </div>

                  <!-- تاريخ آخر ترفيع -->
                  <div class="form-group" style="margin-bottom: 0;">
                    <label class="form-label" style="font-weight: 700; font-size: 0.74rem; color: var(--md-sys-color-on-surface); margin-bottom: 0.2rem;">تاريخ آخر ترفيع / مباشرة:</label>
                    <input type="date" id="calcLastDate" class="form-control" style="font-weight: 800; font-size: 0.78rem; border-radius: 7px; font-family: monospace; border: 1px solid var(--md-sys-color-outline-variant); background: var(--md-sys-color-surface); height: 35px; padding: 0 0.45rem;" value="${userLastPromo}" onchange="window.app.handleCalculatePromotion(event)">
                  </div>
                </div>
              </div>

              <!-- كتب الشكر والتقدير المعتمدة -->
              <div style="background: var(--md-sys-color-background); border: 1px solid var(--md-sys-color-surface-variant); border-radius: 12px; padding: 0.85rem; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.6rem;">
                  <div style="display: flex; align-items: center; gap: 0.35rem; color: var(--md-sys-color-primary); font-weight: 800; font-size: 0.82rem;">
                    <span class="nav-icon-box icon-amber" style="width: 18px; height: 18px; min-width: 18px; border-radius: 5px;">
                      <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="8" r="7"></circle>
                        <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
                      </svg>
                    </span>
                    <span>كتب الشكر والتقدير والقدم (محاكاة):</span>
                  </div>
                  <span class="badge badge-success" style="font-size: 0.65rem; padding: 0.1rem 0.45rem; font-weight: 800; border-radius: 999px;">
                    ${td.totalSeniorityMonths} شهر قدم
                  </span>
                </div>

                <!-- 1. كتب الوزير / المدير العام -->
                <div style="display: flex; align-items: center; justify-content: space-between; gap: 0.4rem; margin-bottom: 0.4rem; background: var(--md-sys-color-surface); padding: 0.35rem 0.6rem; border-radius: 7px; border: 1px solid rgba(2, 132, 199, 0.18);">
                  <span style="font-size: 0.74rem; font-weight: 700; color: var(--md-sys-color-on-surface);">🏛️ الوزير / المدير العام:</span>
                  <div style="display: flex; align-items: center; gap: 0.35rem;">
                    <span class="badge badge-success" style="font-size: 0.62rem; padding: 0.08rem 0.35rem; font-weight: 800; border-radius: 999px;">+1 ش (سقف 3)</span>
                    <input type="number" id="calcThanksMinister" class="form-control" style="width: 50px; height: 26px; font-weight: 900; font-family: monospace; text-align: center; border-radius: 5px; padding: 0; font-size: 0.78rem;" value="${thanksConfig.minister || 0}" min="0" oninput="window.app.handleCalculatePromotion(event)">
                  </div>
                </div>

                <!-- 2. كتب رئيس مجلس الوزراء -->
                <div style="display: flex; align-items: center; justify-content: space-between; gap: 0.4rem; margin-bottom: 0.4rem; background: var(--md-sys-color-surface); padding: 0.35rem 0.6rem; border-radius: 7px; border: 1px solid rgba(168, 85, 247, 0.18);">
                  <span style="font-size: 0.74rem; font-weight: 700; color: var(--md-sys-color-on-surface);">🎖️ رئيس مجلس الوزراء:</span>
                  <div style="display: flex; align-items: center; gap: 0.35rem;">
                    <span class="badge badge-success" style="font-size: 0.62rem; padding: 0.08rem 0.35rem; font-weight: 800; border-radius: 999px;">+6 ش (سقف 2)</span>
                    <input type="number" id="calcThanksPM" class="form-control" style="width: 50px; height: 26px; font-weight: 900; font-family: monospace; text-align: center; border-radius: 5px; padding: 0; font-size: 0.78rem;" value="${thanksConfig.primeMinister || 0}" min="0" oninput="window.app.handleCalculatePromotion(event)">
                  </div>
                </div>

                <!-- 3. كتب رئيس الجمهورية -->
                <div style="display: flex; align-items: center; justify-content: space-between; gap: 0.4rem; background: var(--md-sys-color-surface); padding: 0.35rem 0.6rem; border-radius: 7px; border: 1px solid rgba(168, 85, 247, 0.18);">
                  <span style="font-size: 0.74rem; font-weight: 700; color: var(--md-sys-color-on-surface);">👑 رئيس الجمهورية:</span>
                  <select id="calcThanksPres" class="form-control" style="width: 125px; height: 26px; font-weight: 800; font-size: 0.72rem; border-radius: 5px; padding: 0 0.3rem;" onchange="window.app.handleCalculatePromotion(event)">
                    <option value="0" ${parseInt(thanksConfig.president, 10) === 0 ? 'selected' : ''}>لا يوجد (0 قدم)</option>
                    <option value="1" ${parseInt(thanksConfig.president, 10) === 1 ? 'selected' : ''}>كتاب 1 (+6 أشهر)</option>
                    <option value="2" ${parseInt(thanksConfig.president, 10) === 2 ? 'selected' : ''}>كتابان (+18 شهراً)</option>
                  </select>
                </div>

              </div>

            </div>

            <!-- زر احتساب وتثبيت نتائج المحاكاة -->
            <button type="submit" class="btn" style="width: 100%; height: 40px; font-weight: 800; border-radius: 10px; background: linear-gradient(135deg, #059669 0%, #10b981 100%); color: #ffffff; box-shadow: 0 3px 14px rgba(16, 185, 129, 0.3); display: flex; align-items: center; justify-content: center; gap: 0.5rem; cursor: pointer; border: none; font-size: 0.88rem; transition: all 0.2s ease;">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                <polyline points="17 21 17 13 7 13 7 21"></polyline>
                <polyline points="7 3 7 8 15 8"></polyline>
              </svg>
              <span>💾 احتساب وتحديث نتائج المحاكاة الآن</span>
            </button>

          </form>
        </div>
      `}

      <!-- كروت المقارنة المالية الثلاثية المضيئة المدمجة -->
      <div style="display: grid; grid-template-columns: 1fr 1.15fr 1fr; gap: 0.85rem; align-items: stretch;">
        
        <!-- الكرت 1: الراتب الاسمي الحالي -->
        <div class="promo-crystal-card promo-crystal-salary-current">
          <div class="promo-card-title">
            الراتب الاسمي الحالي
          </div>
          <div class="promo-card-value">
            ${(result.currentSalary || 0).toLocaleString('en-US')} <span class="promo-card-sub">د.ع</span>
          </div>
          <div class="promo-card-detail">
            مرحلة ${result.stageNumber || 1}
          </div>
        </div>

        <!-- الكرت 2: الراتب عند الترفيع (البلورة الزمردية المركزية المتوهجة) -->
        <div class="promo-crystal-card promo-crystal-salary-next">
          <div style="display: flex; justify-content: space-between; align-items: center; gap: 0.35rem;">
            <span class="promo-card-title">
              ⭐ الراتب عند الترفيع
            </span>
            ${salaryDiff > 0 ? `
              <span class="badge badge-success" style="font-size: 0.65rem; padding: 0.08rem 0.4rem; font-weight: 800; border-radius: 999px;">
                +${(salaryDiff || 0).toLocaleString('en-US')} د.ع
              </span>
            ` : ''}
          </div>
          <div class="promo-card-value">
            ${(result.salaryAfterPromotion || 0).toLocaleString('en-US')} <span class="promo-card-sub">د.ع</span>
          </div>
          <div class="promo-card-detail">
            ${result.nextGradeName || ''}
          </div>
        </div>

        <!-- الكرت 3: العلاوة السنوية القادمة -->
        <div class="promo-crystal-card promo-crystal-salary-inc">
          <div class="promo-card-title">
            العلاوة السنوية القادمة
          </div>
          <div class="promo-card-value">
            +${(result.annualIncrement || 0).toLocaleString('en-US')} <span class="promo-card-sub">د.ع</span>
          </div>
          <div class="promo-card-detail">
            الراتب بعدها: ${(result.salaryAfterIncrement || 0).toLocaleString('en-US')} د.ع
          </div>
        </div>

      </div>

      <!-- الدورات التدريبية الإلزامية لاستحقاق الترفيع -->
      <div style="background: var(--md-sys-color-surface); border: 1px solid var(--md-sys-color-surface-variant); border-radius: 14px; padding: 0.85rem 1.15rem; box-shadow: 0 1px 4px rgba(0, 0, 0, 0.02);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; flex-wrap: wrap; gap: 0.35rem;">
          <strong style="color: var(--md-sys-color-primary); font-size: 0.84rem; display: flex; align-items: center; gap: 0.4rem; font-weight: 800;">
            <span class="nav-icon-box icon-purple" style="width: 20px; height: 20px; min-width: 20px; border-radius: 5px;">
              <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
                <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
              </svg>
            </span>
            <span>الدورات التدريبية الإلزامية لاستحقاق الترفيع:</span>
          </strong>
          <span class="badge badge-info" style="font-size: 0.7rem; padding: 0.15rem 0.55rem; font-weight: 800; border-radius: 999px;">
            الفترة المطلوبة: ${result.trainingWeeks} أسابيع
          </span>
        </div>

        <div style="display: flex; flex-direction: column; gap: 0.35rem;">
          ${result.requiredCourses && result.requiredCourses.length > 0 ? result.requiredCourses.map(c => `
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.45rem 0.75rem; background: var(--md-sys-color-surface-variant); border-radius: 8px; font-size: 0.8rem; border: 1px solid rgba(0, 0, 0, 0.04);">
              <div style="display: flex; align-items: center; gap: 0.5rem;">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#059669" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <strong style="color: var(--md-sys-color-on-surface);">${c.name}</strong>
              </div>
              <span class="badge badge-secondary" style="font-size: 0.65rem; padding: 0.12rem 0.45rem; font-weight: 700; border-radius: 999px;">${c.type}</span>
            </div>
          `).join('') : `
            <div style="font-size: 0.78rem; color: var(--md-sys-color-outline); padding: 0.45rem; text-align: center; background: var(--md-sys-color-surface-variant); border-radius: 8px; font-weight: 600;">
              لا توجد دورات تدريبية مطلوبة لهذه الدرجة أو أنك في سقف السلم الوظيفي.
            </div>
          `}
        </div>
      </div>

      <!-- زر تقديم الطلب الرسمي الفوري عند حلول موعد الاستحقاق فقط -->
      ${result.isDue ? `
        <div>
          <button class="btn" style="width: 100%; height: 44px; font-size: 0.92rem; font-weight: 800; border-radius: 12px; background: linear-gradient(135deg, #059669 0%, #10b981 100%); color: #ffffff; box-shadow: 0 4px 16px rgba(16, 185, 129, 0.4); border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.5rem;" onclick="window.app.openSubmitRequestModal()">
            <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
            <span>تقديم طلب ترفيع / تغيير عنوان وظيفي رسمي الآن</span>
          </button>
        </div>
      ` : ''}

    </div>
  `;
}

// ==========================================================================
// 2. تبويب جدول سلم الرواتب والعلاوات (Next-Gen Interactive Salary Scale Matrix)
// ==========================================================================
function renderSalaryScaleTab(scale, result) {
  const gradesKeys = ['SPECIAL', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];

  return `
    <div class="card promotion-matrix-card" style="box-shadow: 0 10px 36px rgba(0, 0, 0, 0.04), inset 0 1px 1px rgba(255, 255, 255, 0.95); border-radius: 20px; border: 1px solid rgba(11, 87, 208, 0.16); background: var(--md-sys-color-surface); position: relative; overflow: hidden; padding: 1.5rem;">
      
      <!-- Top Accent Sheen -->
      <div style="position: absolute; top: 0; left: 0; right: 0; height: 4px; background: linear-gradient(90deg, #0b57d0 0%, #0284c7 40%, #10b981 100%);"></div>

      <!-- Header Section -->
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; padding-bottom: 1rem; margin-bottom: 1.25rem; border-bottom: 1px solid var(--md-sys-color-surface-variant);">
        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <span class="nav-icon-box icon-emerald" style="width: 38px; height: 38px; min-width: 38px; border-radius: 11px; box-shadow: 0 3px 10px rgba(16, 185, 129, 0.25);">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="1" x2="12" y2="23"></line>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
          </span>
          <div>
            <h3 style="font-weight: 800; font-size: 1.15rem; margin: 0; color: var(--md-sys-color-on-surface); line-height: 1.2;">
              سلم الرواتب الاسمية والعلاوات والمدد الأصغرية (قانون رقم 22 لسنة 2008)
            </h3>
            <p style="color: var(--md-sys-color-outline); font-size: 0.76rem; margin: 2px 0 0 0; font-weight: 600;">
              الجدول الرسمي المعتمد في شركة نفط البصرة وكافة الوزارات والدوائر النفطية العراقية
            </p>
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <button class="btn btn-outline" onclick="window.print()" style="height: 34px; font-size: 0.78rem; font-weight: 800; border-radius: 8px; display: inline-flex; align-items: center; gap: 0.35rem; border: 1px solid var(--md-sys-color-outline-variant);">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="6 9 6 2 18 2 18 9"></polyline>
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
              <rect x="6" y="14" width="12" height="8"></rect>
            </svg>
            <span>طباعة السلم الرسمي</span>
          </button>
        </div>
      </div>

      <!-- Mobile Horizontal Scroll Hint Indicator -->
      <div class="mobile-table-scroll-hint">
        <div class="scroll-hint-content">
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
          <span>اسحب الجدول أفقياً لمعاينة كامل المراحل (1 إلى 11) والعلاوات</span>
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </div>
      </div>

      <!-- Table Matrix -->
      <div class="table-container table-scroll-wrapper" style="overflow-x: auto; -webkit-overflow-scrolling: touch; border: 1px solid var(--md-sys-color-surface-variant); border-radius: 14px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);">
        <table class="data-table scale-table" style="width: 100%; border-collapse: separate; border-spacing: 0; font-size: 0.82rem; text-align: center;">
          <thead>
            <tr class="scale-table-header">
              <th class="scale-th scale-th-sticky" style="min-width: 110px; padding: 0.85rem 0.75rem; text-align: right;">الدرجة</th>
              <th class="scale-th" style="min-width: 95px; padding: 0.85rem 0.5rem;">العلاوة السنوية</th>
              <th class="scale-th" style="min-width: 95px; padding: 0.85rem 0.5rem;">سنوات الترفيع</th>
              ${Array.from({ length: 11 }, (_, i) => `
                <th class="scale-th" style="min-width: 80px; padding: 0.85rem 0.4rem;">المرحلة ${i + 1}</th>
              `).join('')}
            </tr>
          </thead>
          <tbody>
            ${gradesKeys.map((k, idx) => {
              const g = scale[k];
              const isCurrentGrade = result && (result.gradeKey === k);
              const isEven = idx % 2 === 0;

              return `
                <tr class="scale-table-row ${isCurrentGrade ? 'scale-current-grade' : isEven ? 'scale-row-even' : 'scale-row-odd'}">
                  
                  <td class="scale-cell-grade scale-cell-sticky" style="padding: 0.75rem 0.85rem; font-weight: 900; text-align: right; white-space: nowrap;">
                    ${isCurrentGrade ? '<span class="mini-pulse-dot" style="display:inline-block; margin-left: 4px; vertical-align: middle;"></span>' : ''}
                    ${g.name}
                  </td>

                  <td class="scale-cell-inc" style="padding: 0.75rem 0.5rem; font-weight: 800;">
                    ${g.annualIncrement ? '+' + g.annualIncrement.toLocaleString('en-US') : '-'}
                  </td>

                  <td class="scale-cell-years ${!g.promotionYears ? 'scale-ceiling' : ''}" style="padding: 0.75rem 0.5rem; font-weight: 800;">
                    ${g.promotionYears ? g.promotionYears + ' سنوات' : 'سقف الترفيع'}
                  </td>

                  ${g.stages.map((stg, sIdx) => {
                    const isCurrentCell = isCurrentGrade && (result.stageNumber === sIdx + 1);
                    return `
                      <td class="scale-cell-stage ${isCurrentCell ? 'scale-cell-active' : ''}" style="padding: 0.75rem 0.4rem; font-family: monospace; font-size: 0.8rem; font-weight: ${isCurrentCell ? '900' : '700'};">
                        ${stg.toLocaleString('en-US')}
                      </td>
                    `;
                  }).join('')}

                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>

      <!-- Footnote Instructions -->
      <div style="margin-top: 1.15rem; padding: 0.95rem 1.15rem; background: var(--md-sys-color-background); border-radius: 12px; border: 1px solid var(--md-sys-color-surface-variant); font-size: 0.78rem; line-height: 1.6; color: var(--md-sys-color-outline);">
        <strong style="color: var(--md-sys-color-primary);">📌 ملاحظات وضوابط قانون الرواتب رقم 22 لسنة 2008:</strong>
        <ol style="margin: 0.35rem 0 0 1.25rem; padding: 0;">
          <li>تمنح العلاوة السنوية عند إكمال الموظف سنة واحدة في الخدمة الوظيفية وبتقرير كفاءة لا يقل عن جيد.</li>
          <li>يتم الترفيع إلى الدرجة الأعلى عند إكمال المدة الأصغرية المقررة قانوناً (4 أو 5 سنوات) بعد خصم كتب الشكر المعتمدة واجتياز الدورات الحتمية.</li>
          <li>تعتبر الدرجة الأولى - المرحلة 11 سقف الترفيع الاعتيادي للموظف في الملاك الدائم.</li>
        </ol>
      </div>

    </div>
  `;
}

// ==========================================================================
// 3. تبويب مصفوفة الدورات الحتمية للترقية (Next-Gen Glassmorphic Course Matrix Table)
// ==========================================================================
function renderCoursesMatrixTab(coursesList) {
  return `
    <div class="card promotion-matrix-card" style="box-shadow: 0 10px 36px rgba(0, 0, 0, 0.04), inset 0 1px 1px rgba(255, 255, 255, 0.95); border-radius: 20px; border: 1px solid rgba(11, 87, 208, 0.16); background: var(--md-sys-color-surface); position: relative; overflow: hidden; padding: 1.5rem;">
      
      <!-- Top Accent Sheen -->
      <div style="position: absolute; top: 0; left: 0; right: 0; height: 4px; background: linear-gradient(90deg, #6366f1 0%, #0b57d0 40%, #0284c7 75%, #10b981 100%);"></div>

      <!-- Header Section -->
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; padding-bottom: 1rem; margin-bottom: 1.25rem; border-bottom: 1px solid var(--md-sys-color-surface-variant);">
        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <span class="nav-icon-box icon-purple" style="width: 38px; height: 38px; min-width: 38px; border-radius: 11px; box-shadow: 0 3px 10px rgba(99, 102, 241, 0.25);">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
              <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
            </svg>
          </span>
          <div>
            <h3 style="font-weight: 800; font-size: 1.15rem; margin: 0; color: var(--md-sys-color-on-surface); line-height: 1.2;">
              مصفوفة الدورات الحتمية للترقية وتغيير العناوين الوظيفية
            </h3>
            <p style="color: var(--md-sys-color-outline); font-size: 0.76rem; margin: 2px 0 0 0; font-weight: 600;">
              المعتمد لدى مركز التدريب والتطوير وشعبة تخطيط الموارد البشرية في شركة نفط البصرة
            </p>
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
          <span class="badge badge-info" style="font-size: 0.74rem; padding: 0.35rem 0.8rem; font-weight: 800; border-radius: 999px; border: 1px solid rgba(11, 87, 208, 0.2);">
            10 مسارات وظيفية معتمدة
          </span>
          <button class="btn btn-outline" onclick="window.print()" style="height: 34px; font-size: 0.78rem; font-weight: 800; border-radius: 8px; display: inline-flex; align-items: center; gap: 0.35rem; border: 1px solid var(--md-sys-color-outline-variant);">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="6 9 6 2 18 2 18 9"></polyline>
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
              <rect x="6" y="14" width="12" height="8"></rect>
            </svg>
            <span>طباعة المصفوفة</span>
          </button>
        </div>
      </div>

      <!-- Mobile Horizontal Scroll Hint Indicator -->
      <div class="mobile-table-scroll-hint">
        <div class="scroll-hint-content">
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
          <span>اسحب الجدول أفقياً لمعاينة كامل الدورات والمؤهلات والمدد</span>
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </div>
      </div>

      <!-- Modern Data Table Container -->
      <div class="table-container table-scroll-wrapper" style="overflow-x: auto; -webkit-overflow-scrolling: touch; border: 1px solid var(--md-sys-color-surface-variant); border-radius: 14px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);">
        <table class="data-table courses-matrix-table" style="width: 100%; border-collapse: separate; border-spacing: 0; font-size: 0.84rem;">
          
          <!-- Modern Frosted Header -->
          <thead>
            <tr class="matrix-table-header">
              <th class="matrix-th matrix-th-sticky" style="min-width: 190px; padding: 0.95rem 1.15rem; text-align: right;">
                <div style="display: flex; align-items: center; gap: 0.4rem;">
                  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                  <span>المسار والدرجة (من ➔ إلى)</span>
                </div>
              </th>
              
              <th class="matrix-th" style="min-width: 170px; padding: 0.95rem 1rem; text-align: right;">
                <div style="display: flex; align-items: center; gap: 0.4rem;">
                  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
                    <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
                  </svg>
                  <span>الشهادات والمؤهلات المشمولة</span>
                </div>
              </th>

              <th class="matrix-th" style="min-width: 270px; padding: 0.95rem 1rem; text-align: right;">
                <div style="display: flex; align-items: center; gap: 0.4rem;">
                  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                  </svg>
                  <span>حزمة الدورات التدريبية المعتمدة</span>
                </div>
              </th>

              <th class="matrix-th" style="min-width: 120px; padding: 0.95rem 1rem; text-align: center;">
                <div style="display: flex; align-items: center; justify-content: center; gap: 0.4rem;">
                  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                  <span>المدة المطلوبة</span>
                </div>
              </th>

              <th class="matrix-th" style="min-width: 220px; padding: 0.95rem 1.15rem; text-align: right;">
                <div style="display: flex; align-items: center; gap: 0.4rem;">
                  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                  <span>الملاحظات والضوابط التنظيمية</span>
                </div>
              </th>
            </tr>
          </thead>

          <!-- Table Body with Next-Gen Polish -->
          <tbody>
            ${coursesList.map((c, idx) => {
              const isEven = idx % 2 === 0;
              return `
                <tr class="matrix-table-row ${isEven ? 'matrix-row-even' : 'matrix-row-odd'}">
                  
                  <!-- 1. المسار والدرجة -->
                  <td class="matrix-cell-sticky" style="padding: 1rem 1.15rem; vertical-align: middle;">
                    <div class="matrix-path-badge">
                      <span>الدرجة ${c.fromGrade}</span>
                      <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="19" y1="12" x2="5" y2="12"></line>
                        <polyline points="12 19 5 12 12 5"></polyline>
                      </svg>
                      <span>الدرجة ${c.toGrade}</span>
                    </div>
                    <div class="matrix-path-title" style="font-size: 0.74rem; font-weight: 700; margin-top: 5px;">
                      ${c.title}
                    </div>
                  </td>

                  <!-- 2. الشهادات المشمولة -->
                  <td style="padding: 1rem; vertical-align: middle;">
                    <div style="display: flex; gap: 0.35rem; flex-wrap: wrap;">
                      ${c.eligibleDegrees.map(deg => {
                        let degClass = "degree-general";
                        if (deg === 'دكتوراه') degClass = "degree-phd";
                        else if (deg === 'ماجستير') degClass = "degree-msc";
                        else if (deg === 'دبلوم عالي') degClass = "degree-high-dip";
                        else if (deg === 'بكالوريوس') degClass = "degree-bachelor";
                        else if (deg === 'دبلوم') degClass = "degree-diploma";
                        else if (deg === 'اعدادية' || deg === 'إعدادية') degClass = "degree-prep";
                        
                        return `<span class="degree-badge ${degClass}">${deg}</span>`;
                      }).join('')}
                    </div>
                  </td>

                  <!-- 3. الدورات المطلوبة -->
                  <td style="padding: 1rem; vertical-align: middle;">
                    <div style="display: flex; flex-direction: column; gap: 0.4rem;">
                      ${c.courses.map(crs => `
                        <div class="matrix-course-item">
                          <div style="display: flex; align-items: center; gap: 0.4rem;">
                            <span style="font-size: 0.85rem;">${crs.icon || '🔹'}</span>
                            <strong class="matrix-course-name" style="font-size: 0.8rem;">${crs.name}</strong>
                          </div>
                          <span class="matrix-course-type">
                            ${crs.type}
                          </span>
                        </div>
                      `).join('')}
                    </div>
                  </td>

                  <!-- 4. المدة المطلوبة -->
                  <td style="padding: 1rem; vertical-align: middle; text-align: center;">
                    <span class="matrix-duration-pill duration-${c.durationWeeks}">
                      <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                      </svg>
                      <span>${c.durationWeeks} أسابيع</span>
                    </span>
                  </td>

                  <!-- 5. الملاحظات والضوابط -->
                  <td style="padding: 1rem 1.15rem; vertical-align: middle; font-size: 0.78rem; line-height: 1.45;">
                    <div class="matrix-notes-box">
                      ${c.notes || '-'}
                    </div>
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

// ==========================================================================
// 4. تبويب الضوابط والتعليمات القانونية (Regulations Tab)
// ==========================================================================
function renderRegulationsTab() {
  return `
    <div class="card" style="box-shadow: 0 10px 36px rgba(0, 0, 0, 0.04), inset 0 1px 1px rgba(255, 255, 255, 0.95); border-radius: 20px; border: 1px solid rgba(11, 87, 208, 0.16); background: var(--md-sys-color-surface); position: relative; overflow: hidden; padding: 1.5rem;">
      
      <!-- Top Accent Sheen -->
      <div style="position: absolute; top: 0; left: 0; right: 0; height: 4px; background: linear-gradient(90deg, #d97706 0%, #f59e0b 50%, #10b981 100%);"></div>

      <div style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 1rem; margin-bottom: 1.25rem; border-bottom: 1px solid var(--md-sys-color-surface-variant);">
        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <span class="nav-icon-box icon-amber" style="width: 38px; height: 38px; min-width: 38px; border-radius: 11px; box-shadow: 0 3px 10px rgba(217, 119, 6, 0.25);">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
          </span>
          <div>
            <h3 style="font-weight: 800; font-size: 1.15rem; margin: 0; color: var(--md-sys-color-on-surface); line-height: 1.2;">
              الضوابط والتعليمات القانونية للترفيع والعلاوات
            </h3>
            <p style="color: var(--md-sys-color-outline); font-size: 0.76rem; margin: 2px 0 0 0; font-weight: 600;">
              دليل الضوابط والتعليمات الوزارية النافذة في وزارة النفط وشركة نفط البصرة
            </p>
          </div>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem;">
        
        <!-- البطاقة 1: شروط الترفيع القانونية -->
        <div style="background: var(--md-sys-color-background); border: 1px solid var(--md-sys-color-surface-variant); border-radius: 14px; padding: 1.25rem; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);">
          <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.85rem; color: var(--md-sys-color-primary); font-weight: 800; font-size: 0.92rem;">
            <span>⚖️</span>
            <span>شروط الترفيع القانونية (المادة 6 من قانون 22 لسنة 2008):</span>
          </div>
          <ul style="margin: 0; padding-right: 1.2rem; font-size: 0.82rem; line-height: 1.7; color: var(--md-sys-color-on-surface);">
            <li>وجود وظيفة شاغرة في الملاك المصدق للشركة في الدرجة المراد الترفيع إليها.</li>
            <li>إكمال المدة المقررة قانوناً في الدرجة السابقة (4 أو 5 سنوات).</li>
            <li>حصول الموظف على تقرير كفاءة سنوي لا يقل عن جيد جداً خلال سنتي الترفيع.</li>
            <li>اجتياز الدورات الحتمية التدريبية المقررة لكل درجة بنجاح.</li>
            <li>سلامة الموقف الإداري والقانوني للموظف وعدم وجود عقوبات مانعة للترفيع.</li>
          </ul>
        </div>

        <!-- البطاقة 2: ضوابط احتساب كتب الشكر والقدم -->
        <div style="background: var(--md-sys-color-background); border: 1px solid var(--md-sys-color-surface-variant); border-radius: 14px; padding: 1.25rem; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);">
          <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.85rem; color: #059669; font-weight: 800; font-size: 0.92rem;">
            <span>🎖️</span>
            <span>ضوابط احتساب القدم المكتسب من كتب الشكر والتقدير:</span>
          </div>
          <ul style="margin: 0; padding-right: 1.2rem; font-size: 0.82rem; line-height: 1.7; color: var(--md-sys-color-on-surface);">
            <li><strong>كتاب الوزير أو المدير العام:</strong> يمنح قدماً وظيفياً مدته (شهر واحد) بحد أقصى 3 كتب لكل سنة تجريبية.</li>
            <li><strong>كتاب رئيس مجلس الوزراء:</strong> يمنح قدماً وظيفياً مدته (6 أشهر) بحد أقصى كتابين في السنة الواحدة.</li>
            <li><strong>كتاب رئيس الجمهورية:</strong> يمنح الكتاب الأول (6 أشهر) والكتاب الثاني في سنة أخرى (12 شهراً) ليصبح المجموع 18 شهراً.</li>
            <li>تخصم كامل مدد القدم من استحقاق الترفيع القادم لتقليص سنوات الانتظار.</li>
          </ul>
        </div>

      </div>

    </div>
  `;
}

// Global Event Handler for Recalculation Form
if (typeof window !== 'undefined') {
  if (!window.app) window.app = {};
  window.app.handleCalculatePromotion = function(event) {
    if (event && event.preventDefault) event.preventDefault();

    const jobTitle = document.getElementById('calcJobTitle') ? document.getElementById('calcJobTitle').value.trim() : 'فني';
    const trackKey = document.getElementById('calcTrack') ? document.getElementById('calcTrack').value : 'technical';
    const grade = document.getElementById('calcGrade') ? document.getElementById('calcGrade').value : '8';
    const stage = document.getElementById('calcStage') ? parseInt(document.getElementById('calcStage').value, 10) : 1;
    const degree = document.getElementById('calcDegree') ? document.getElementById('calcDegree').value : 'دبلوم';
    const lastPromo = document.getElementById('calcLastDate') ? document.getElementById('calcLastDate').value : '2023-01-01';

    const minister = document.getElementById('calcThanksMinister') ? parseInt(document.getElementById('calcThanksMinister').value, 10) || 0 : 0;
    const pm = document.getElementById('calcThanksPM') ? parseInt(document.getElementById('calcThanksPM').value, 10) || 0 : 0;
    const pres = document.getElementById('calcThanksPres') ? parseInt(document.getElementById('calcThanksPres').value, 10) || 0 : 0;

    if (!window.promotionCalcState) window.promotionCalcState = {};
    window.promotionCalcState.jobTitle = jobTitle;
    window.promotionCalcState.trackKey = trackKey;
    window.promotionCalcState.grade = grade;
    window.promotionCalcState.stage = stage;
    window.promotionCalcState.degree = degree;
    window.promotionCalcState.lastPromo = lastPromo;
    window.promotionCalcState.thanksConfig = { minister, primeMinister: pm, president: pres };

    const user = (window.auth && typeof window.auth.getCurrentUser === 'function') ? window.auth.getCurrentUser() : null;
    if (user && (!window.promotionCalcState.employeeId || window.promotionCalcState.employeeId === user.id)) {
      user.jobTitle = jobTitle;
      user.jobGrade = grade;
      user.jobStage = stage;
      user.degree = degree;
      user.qualification = degree;
      user.lastPromotionDate = lastPromo;
      user.thanksConfig = { minister, primeMinister: pm, president: pres };
      user.thanksLettersCount = minister + (pm * 6) + (pres === 1 ? 6 : pres === 2 ? 18 : 0);
      if (window.store && typeof window.store.saveUser === 'function') {
        window.store.saveUser(user);
      }
    }

    if (event && event.type === 'submit') {
      if (typeof window.app.showToast === 'function') {
        window.app.showToast('تم تحديث وحساب استحقاق الترفيع والعنوان الوظيفي بنجاح! 💾', 'success');
      }
    }

    if (typeof window.app.render === 'function') {
      window.app.render();
    }
  };

  window.app.openSubmitRequestModal = function() {
    if (typeof window.app.showModal === 'function') {
      window.app.showModal(
        '📝 تقديم طلب ترفيع / ترقية وظيفية رسمي',
        `
          <p style="color: var(--md-sys-color-outline); font-size: 0.88rem; line-height: 1.5;">
            سيتم إرسال طلب الترفيع وتغيير العنوان الإلكتروني مباشرة إلى شعبة تخطيط الموارد البشرية واللجنة الفنية المركزية للترقيات مع كافة معطيات الإضبارة وكتب الشكر المعتمدة.
          </p>
          <div class="form-group" style="margin-top: 1rem;">
            <label class="form-label" style="font-weight: 700;">ملاحظات الموظف أو طلب العنوان الوظيفي المفضل:</label>
            <textarea id="promoRequestNotes" class="form-control" rows="3" placeholder="اكتب أي ملاحظات أو تفاصيل إضافية..."></textarea>
          </div>
          <div style="display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1.25rem;">
            <button type="button" class="btn btn-outline" onclick="window.app.closeModal()">إلغاء</button>
            <button type="button" class="btn btn-primary" onclick="window.app.submitPromotionRequest()">
              🚀 إرسال الطلب رسمياً
            </button>
          </div>
        `,
        { size: 'md' }
      );
    } else {
      alert('تم استلام طلب الترفيع وسيتم رفعه للجنة المركزية للموارد البشرية.');
    }
  };

  window.app.submitPromotionRequest = function() {
    if (typeof window.app.closeModal === 'function') window.app.closeModal();
    if (typeof window.app.showToast === 'function') {
      window.app.showToast('تم إرسال طلب الترفيع وتغيير العنوان الرسمي إلى شعبة الموارد البشرية بنجاح! 🚀', 'success');
    }
  };
}

if (typeof window !== 'undefined') {
  if (!window.app) window.app = {};
  window.app.setPromotionCalculatorTab = function(tabName) {
    window.app.activePromotionTab = tabName;
    if (typeof window.app.render === 'function') {
      window.app.render();
    }
  };
  window.app.switchPromotionTab = window.app.setPromotionCalculatorTab;
}


// ==========================================================================
// Mode Switcher & Employee Roster Loading Handling for Promotion Calculator
// ==========================================================================
if (typeof window !== 'undefined') {
  window.setPromotionCalcMode = function(mode) {
    if (!window.promotionCalcState) window.promotionCalcState = {};
    window.promotionCalcState.calcMode = mode;
    if (mode === 'auto') {
      const user = (window.auth && typeof window.auth.getCurrentUser === 'function') ? window.auth.getCurrentUser() : {};
      const actorUser = user || { role: 'SUPER_ADMIN', departmentId: 'dept-south-prod' };
      const employees = (window.store && typeof window.store.getUnifiedEmployeeRoster === 'function')
        ? window.store.getUnifiedEmployeeRoster(actorUser)
        : ((window.store && typeof window.store.getEmployees === 'function') ? window.store.getEmployees() : []);
      
      if (!window.promotionCalcState.employeeId && employees.length > 0) {
        window.loadEmployeeToPromotionCalc(employees[0].employeeId || employees[0].id);
        return;
      }
    }
    if (window.app && typeof window.app.render === 'function') {
      window.app.render();
    }
  };

  window.resetManualSimulation = function() {
    if (!window.promotionCalcState) window.promotionCalcState = {};
    window.promotionCalcState.calcMode = 'manual';
    window.promotionCalcState.employeeId = '';
    window.promotionCalcState.employeeName = 'نموذج محاكاة مخصص';
    window.promotionCalcState.jobTitle = 'فني';
    window.promotionCalcState.trackKey = 'technical';
    window.promotionCalcState.grade = '8';
    window.promotionCalcState.stage = 1;
    window.promotionCalcState.degree = 'دبلوم';
    window.promotionCalcState.lastPromo = '2023-01-01';
    window.promotionCalcState.section = '';
    window.promotionCalcState.thanksConfig = { minister: 1, primeMinister: 0, president: 0 };
    if (window.app && typeof window.app.showToast === 'function') {
      window.app.showToast('تمت إعادة ضبط نموذج المحاكاة الافتراضي بنجاح 🔄', 'info');
    }
    if (window.app && typeof window.app.render === 'function') {
      window.app.render();
    }
  };

  window.loadEmployeeToPromotionCalc = function(empId) {
    if (!window.promotionCalcState) window.promotionCalcState = {};
    if (!empId) {
      window.promotionCalcState.employeeId = '';
      window.promotionCalcState.employeeName = 'إدخال يدوي مخصص';
      if (window.app && typeof window.app.render === 'function') window.app.render();
      return;
    }
    const user = (window.auth && typeof window.auth.getCurrentUser === 'function') ? window.auth.getCurrentUser() : {};
    const actorUser = user || { role: 'SUPER_ADMIN', departmentId: 'dept-south-prod' };
    const employees = (window.store && typeof window.store.getUnifiedEmployeeRoster === 'function')
      ? window.store.getUnifiedEmployeeRoster(actorUser)
      : ((window.store && typeof window.store.getEmployees === 'function') ? window.store.getEmployees() : []);

    const emp = employees.find(e => String(e.id) === String(empId) || String(e.employeeId) === String(empId));
    if (!emp) return;

    window.promotionCalcState.employeeId = emp.employeeId || emp.id;
    window.promotionCalcState.employeeName = emp.name || emp.fullName || 'منتسب';
    window.promotionCalcState.jobTitle = emp.jobTitle || 'فني';
    window.promotionCalcState.section = emp.section || emp.station || '';

    // Map Track
    if (emp.careerTrack && ['technical', 'engineering', 'administrative', 'scientific', 'crafts'].includes(emp.careerTrack)) {
      window.promotionCalcState.trackKey = emp.careerTrack;
    } else {
      const titleLower = (emp.jobTitle || '').toLowerCase();
      if (titleLower.includes('فني') || titleLower.includes('تشغيل') || titleLower.includes('مشغل') || titleLower.includes('صيانة') || titleLower.includes('ميكانيك') || titleLower.includes('كهرباء')) {
        window.promotionCalcState.trackKey = 'technical';
      } else if (titleLower.includes('مهندس')) {
        window.promotionCalcState.trackKey = 'engineering';
      } else if (titleLower.includes('جيولوج') || titleLower.includes('كيمياو') || titleLower.includes('فيزياو') || titleLower.includes('مختبر')) {
        window.promotionCalcState.trackKey = 'scientific';
      } else if (titleLower.includes('حرفي') || titleLower.includes('سائق') || titleLower.includes('خدمات')) {
        window.promotionCalcState.trackKey = 'crafts';
      } else {
        window.promotionCalcState.trackKey = 'administrative';
      }
    }

    // Map Grade
    let grade = '8';
    const gStr = String(emp.jobGrade || emp.grade || '').trim();
    if (gStr.includes('خاص') || gStr === 'SPECIAL') grade = 'SPECIAL';
    else if (gStr.includes('أول') || gStr.includes('اول') || gStr === '1') grade = '1';
    else if (gStr.includes('ثاني') || gStr === '2') grade = '2';
    else if (gStr.includes('ثالث') || gStr === '3') grade = '3';
    else if (gStr.includes('رابع') || gStr === '4') grade = '4';
    else if (gStr.includes('خامس') || gStr === '5') grade = '5';
    else if (gStr.includes('سادس') || gStr === '6') grade = '6';
    else if (gStr.includes('سابع') || gStr === '7') grade = '7';
    else if (gStr.includes('ثامن') || gStr === '8') grade = '8';
    else if (gStr.includes('تاسع') || gStr === '9') grade = '9';
    else if (gStr.includes('عاشر') || gStr === '10') grade = '10';

    window.promotionCalcState.grade = grade;
    window.promotionCalcState.stage = parseInt(emp.jobStage || emp.stage, 10) || 1;

    // Map Degree
    const dStr = (emp.qualification || emp.degree || '').toLowerCase();
    if (dStr.includes('دكتور') || dStr.includes('phd')) window.promotionCalcState.degree = 'دكتوراه';
    else if (dStr.includes('ماجستير') || dStr.includes('master')) window.promotionCalcState.degree = 'ماجستير';
    else if (dStr.includes('عالي') || dStr.includes('دبلوم عالي')) window.promotionCalcState.degree = 'دبلوم عالي';
    else if (dStr.includes('بكالوريوس') || dStr.includes('بكلوريوس') || dStr.includes('bachelor')) window.promotionCalcState.degree = 'بكالوريوس';
    else if (dStr.includes('دبلوم') || dStr.includes('معهد')) window.promotionCalcState.degree = 'دبلوم';
    else if (dStr.includes('إعداد') || dStr.includes('اعداد')) window.promotionCalcState.degree = 'اعدادية';
    else if (dStr.includes('متوسط')) window.promotionCalcState.degree = 'متوسطة';
    else if (dStr.includes('ابتدائ')) window.promotionCalcState.degree = 'ابتدائية';
    else window.promotionCalcState.degree = 'بكالوريوس';

    // Last Promotion Date
    window.promotionCalcState.lastPromo = emp.lastPromotionDate || emp.hireDate || emp.appointmentDate || '2023-01-01';

    // Thanks Letters
    window.promotionCalcState.thanksConfig = emp.thanksConfig || {
      minister: emp.thanksLettersCount || 1,
      primeMinister: 0,
      president: 0
    };

    if (window.app && typeof window.app.render === 'function') {
      window.app.render();
    }
  };

  window.applyPromotionCalcPreset = function(preset) {
    if (!window.promotionCalcState) window.promotionCalcState = {};
    if (preset === 'tech_institute') {
      window.promotionCalcState.employeeId = '';
      window.promotionCalcState.employeeName = 'فني معهد نفطي (استثناء سنة واحدة)';
      window.promotionCalcState.jobTitle = 'فني';
      window.promotionCalcState.trackKey = 'technical';
      window.promotionCalcState.grade = '8';
      window.promotionCalcState.stage = 1;
      window.promotionCalcState.degree = 'دبلوم';
      window.promotionCalcState.lastPromo = '2025-09-01';
      window.promotionCalcState.thanksConfig = { minister: 1, primeMinister: 0, president: 0 };
    } else if (preset === 'tech_preparatory') {
      window.promotionCalcState.employeeId = '';
      window.promotionCalcState.employeeName = 'فني خريج إعدادية (مدة 4 سنوات)';
      window.promotionCalcState.jobTitle = 'فني';
      window.promotionCalcState.trackKey = 'technical';
      window.promotionCalcState.grade = '8';
      window.promotionCalcState.stage = 1;
      window.promotionCalcState.degree = 'اعدادية';
      window.promotionCalcState.lastPromo = '2022-09-01';
      window.promotionCalcState.thanksConfig = { minister: 1, primeMinister: 0, president: 0 };
    } else if (preset === 'chief_technician') {
      window.promotionCalcState.employeeId = '';
      window.promotionCalcState.employeeName = 'رئيس ملاحظين فني (نموذج المسار الفني)';
      window.promotionCalcState.jobTitle = 'رئيس ملاحظين فني';
      window.promotionCalcState.trackKey = 'technical';
      window.promotionCalcState.grade = '5';
      window.promotionCalcState.stage = 3;
      window.promotionCalcState.degree = 'دبلوم';
      window.promotionCalcState.lastPromo = '2021-03-15';
      window.promotionCalcState.thanksConfig = { minister: 2, primeMinister: 0, president: 0 };
    } else if (preset === 'senior_engineer') {
      window.promotionCalcState.employeeId = '';
      window.promotionCalcState.employeeName = 'مهندس أقدم (نموذج المسار الهندسي)';
      window.promotionCalcState.jobTitle = 'مهندس أقدم';
      window.promotionCalcState.trackKey = 'engineering';
      window.promotionCalcState.grade = '4';
      window.promotionCalcState.stage = 2;
      window.promotionCalcState.degree = 'بكالوريوس';
      window.promotionCalcState.lastPromo = '2021-07-01';
      window.promotionCalcState.thanksConfig = { minister: 2, primeMinister: 0, president: 0 };
    }

    if (window.app && typeof window.app.render === 'function') {
      window.app.render();
    }
  };

  window.handlePromotionEmployeeSearch = function(query) {
    if (!window.promotionCalcSearchState) {
      window.promotionCalcSearchState = { searchQuery: '', selectedSection: 'ALL' };
    }
    window.promotionCalcSearchState.searchQuery = query;
    if (window.app && typeof window.app.render === 'function') {
      window.app.render();
      setTimeout(() => {
        const inp = document.getElementById('promoEmployeeSearchInput');
        if (inp) {
          if (typeof inp.focus === 'function') inp.focus();
          const valLen = inp.value ? inp.value.length : 0;
          if (typeof inp.setSelectionRange === 'function') inp.setSelectionRange(valLen, valLen);
        }
      }, 30);
    }
  };

  window.handlePromotionSectionFilter = function(section) {
    if (!window.promotionCalcSearchState) {
      window.promotionCalcSearchState = { searchQuery: '', selectedSection: 'ALL' };
    }
    window.promotionCalcSearchState.selectedSection = section;
    if (window.app && typeof window.app.render === 'function') {
      window.app.render();
    }
  };

  window.clearPromotionEmployeeSearch = function() {
    if (!window.promotionCalcSearchState) {
      window.promotionCalcSearchState = { searchQuery: '', selectedSection: 'ALL' };
    }
    window.promotionCalcSearchState.searchQuery = '';
    window.promotionCalcSearchState.selectedSection = 'ALL';
    if (window.app && typeof window.app.render === 'function') {
      window.app.render();
    }
  };
}
