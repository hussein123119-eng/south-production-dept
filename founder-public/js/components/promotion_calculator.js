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
  const employees = (window.store && typeof window.store.getEmployees === 'function') ? window.store.getEmployees() : [];

  // Initialize or maintain calculation state
  if (!window.promotionCalcState) {
    window.promotionCalcState = {
      employeeId: (user && user.id) ? user.id : '',
      employeeName: (user && user.name) ? user.name : 'مهندس إنتاج (نموذج افتراضي)',
      grade: (user && user.jobGrade) ? user.jobGrade : '4',
      stage: (user && user.jobStage) ? user.jobStage : 1,
      degree: (user && (user.degree || user.qualification)) ? (user.degree || user.qualification) : 'بكالوريوس',
      lastPromo: (user && user.lastPromotionDate) ? user.lastPromotionDate : '2022-01-01',
      thanksConfig: (user && user.thanksConfig) ? user.thanksConfig : {
        minister: (user && user.thanksLettersCount) || 2,
        primeMinister: 0,
        president: 0
      }
    };
  }

  const calcState = window.promotionCalcState;
  const userGrade = calcState.grade || '4';
  const userStage = calcState.stage || 1;
  const userDegree = calcState.degree || 'بكالوريوس';
  const userLastPromo = calcState.lastPromo || '2022-01-01';
  const thanksConfig = calcState.thanksConfig || { minister: 2, primeMinister: 0, president: 0 };

  const result = window.store.calculateCareerPromotion(userGrade, userStage, userLastPromo, thanksConfig, userDegree);
  const salaryScale = window.store.getBocSalaryScale();
  const promotionCourses = window.store.getBocPromotionCourses();

  return `
    <div style="width: 100%; margin-bottom: 1.5rem;">
      
      <!-- Top Title & Enterprise Seal -->
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; margin-bottom: 1.25rem;">
        <div>
          <h2 style="font-size: 1.55rem; font-weight: 800; color: var(--md-sys-color-primary); margin: 0 0 0.25rem 0; letter-spacing: -0.2px;">
            🧮 حاسبة استحقاق الترفيع والعلاوة وتغيير العنوان الوظيفي
          </h2>
          <p style="color: var(--md-sys-color-outline); margin: 0; font-size: 0.86rem; font-weight: 600;">
            شركة نفط البصرة - الهيأة الإدارية - قسم إدارة الموارد البشرية | استناداً لقانون الرواتب رقم 22 لسنة 2008 وضوابط القدم الوظيفي المعتمدة.
          </p>
        </div>
        <div style="display: flex; gap: 0.5rem; align-items: center;">
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
          <span>الضوابط والتعليمات القانونية</span>
        </button>
      </div>

      <!-- Active Tab Content -->
      ${activeTab === 'calculator' ? renderSmartCalculatorTab(result, userGrade, userStage, userDegree, userLastPromo, thanksConfig, calcState, employees) : ''}
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
// 1. تبويب الحاسبة الذكية والاستحقاق (Compact Vibrant Masterpiece)
// ==========================================================================
function renderSmartCalculatorTab(result, userGrade, userStage, userDegree, userLastPromo, thanksConfig, calcState, employees) {
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
      
      <!-- بلورات تاريخ الاستحقاق الثلاثية المضيئة -->
      <div style="display: grid; grid-template-columns: 1.25fr 1fr 1fr; gap: 0.85rem; align-items: stretch;">
        
        <!-- البلورة 1: تاريخ الاستحقاق القادم -->
        <div class="promo-crystal-card promo-crystal-due">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.25rem;">
            <span class="promo-card-title">
              🎯 تاريخ الاستحقاق القانوني القادم:
            </span>
            <span class="mini-pulse-dot" style="background-color: ${result.isDue ? '#10b981' : '#00dfd8'};"></span>
          </div>
          <div class="promo-card-date">
            ${result.dueDate}
          </div>
          <div style="margin-top: 0.35rem; display: flex; align-items: center; gap: 0.4rem;">
            <span class="badge ${result.isDue ? 'badge-success' : 'badge-warning'}" style="font-size: 0.74rem; padding: 0.2rem 0.65rem; font-weight: 800; border-radius: 999px;">
              ${result.status}
            </span>
          </div>
        </div>

        <!-- البلورة 2: المدة الأصغرية القانونية -->
        <div class="promo-crystal-card promo-crystal-duration">
          <div class="promo-card-title">
            ⏱️ المدة الأصغرية المطلوبة:
          </div>
          <div class="promo-card-value">
            ${result.requiredYears} سنوات <span class="promo-card-sub">(${result.totalMonthsRequired} شهراً)</span>
          </div>
          <div class="promo-card-detail">
            <span>📅 المباشرة:</span>
            <span style="font-family: monospace; font-weight: 800;">${userLastPromo}</span>
          </div>
        </div>

        <!-- البلورة 3: إجمالي القدم المكتسب -->
        <div class="promo-crystal-card promo-crystal-seniority">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span class="promo-card-title">
              🎖️ إجمالي القدم المكتسب:
            </span>
            <span class="badge badge-success" style="font-size: 0.65rem; padding: 0.1rem 0.45rem; font-weight: 800; border-radius: 999px;">
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

      ${result.exceptionNote ? `
        <div style="padding: 0.55rem 0.95rem; background: rgba(245, 158, 11, 0.12); border-right: 3.5px solid #d97706; border-radius: 10px; font-size: 0.78rem; color: var(--md-sys-color-on-surface); line-height: 1.4; font-weight: 600;">
          💡 <strong>تنبيه الاستحقاق القانوني الخاص:</strong> ${result.exceptionNote}
        </div>
      ` : ''}

      <!-- قسم معطيات الموظف وكتب الشكر المدمج التفاعلي -->
      <div class="card" style="box-shadow: 0 6px 20px rgba(0, 0, 0, 0.03), inset 0 1px 1px rgba(255, 255, 255, 0.9); border-radius: 16px; border: 1px solid rgba(11, 87, 208, 0.14); background: var(--md-sys-color-surface); padding: 1.15rem; margin-bottom: 0;">
        
        
        <!-- Presets Bar & Employee Roster Selection -->
        <div style="margin-bottom: 1rem; padding: 0.85rem; background: var(--md-sys-color-background); border: 1.5px solid rgba(13, 110, 253, 0.2); border-radius: 12px;">
          
          <!-- Presets -->
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 0.65rem;">
            <div style="font-size: 0.8rem; font-weight: 800; color: var(--md-sys-color-primary);">
              ⚡ نماذج وظيفية سريعة للاختبار:
            </div>
            <div style="display: flex; flex-wrap: wrap; gap: 0.35rem;">
              <button type="button" onclick="window.applyPromotionCalcPreset('senior_engineer')" class="btn btn-sm" style="font-size: 0.74rem; padding: 0.2rem 0.6rem; background: rgba(13, 110, 253, 0.08); color: #0d6efd; border: 1px solid rgba(13, 110, 253, 0.25); border-radius: 6px; font-weight: 700;">
                ⚙️ مهندس أقدم (د 4)
              </button>
              <button type="button" onclick="window.applyPromotionCalcPreset('chief_technician')" class="btn btn-sm" style="font-size: 0.74rem; padding: 0.2rem 0.6rem; background: rgba(25, 135, 84, 0.08); color: #198754; border: 1px solid rgba(25, 135, 84, 0.25); border-radius: 6px; font-weight: 700;">
                🔧 رئيس فنيين (د 5)
              </button>
              <button type="button" onclick="window.applyPromotionCalcPreset('ready_for_promo')" class="btn btn-sm" style="font-size: 0.74rem; padding: 0.2rem 0.6rem; background: rgba(245, 158, 11, 0.1); color: #d97706; border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 6px; font-weight: 800;">
                🎖️ مستحق ترفيع فوري
              </button>
              <button type="button" onclick="window.applyPromotionCalcPreset('annual_increment')" class="btn btn-sm" style="font-size: 0.74rem; padding: 0.2rem 0.6rem; background: rgba(108, 117, 125, 0.1); color: #6c757d; border: 1px solid rgba(108, 117, 125, 0.25); border-radius: 6px; font-weight: 700;">
                ⏳ علاوة سنوية
              </button>
            </div>
          </div>

          <!-- Employee Roster Dropdown -->
          ${employees && employees.length > 0 ? `
          <div style="border-top: 1px solid var(--md-sys-color-surface-variant); padding-top: 0.65rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.35rem; flex-wrap: wrap; gap: 0.35rem;">
              <label style="font-weight: 800; font-size: 0.8rem; color: #0d6efd; margin: 0; display: flex; align-items: center; gap: 0.35rem;">
                <span>👥</span> استيراد تلقائي من سجل منتسبي القسم:
              </label>
              <span style="font-size: 0.72rem; color: var(--md-sys-color-outline); font-weight: 600;">
                الموظف النشط: <strong>${calcState && calcState.employeeName ? calcState.employeeName : 'تعديل يدوي'}</strong>
              </span>
            </div>
            <select class="form-control" onchange="window.loadEmployeeToPromotionCalc(this.value)" style="width: 100%; font-size: 0.85rem; padding: 0.45rem 0.75rem; border-radius: 8px; border: 1.5px solid #0d6efd; background: var(--md-sys-color-surface); font-weight: 700; color: var(--md-sys-color-on-surface);">
              <option value="">-- اختر موظفاً من كادر القسم (لتعبئة الدرجة والمرحلة والمؤهل وتاريخ الترفيع تلقائياً) --</option>
              ${employees.map(e => `<option value="${e.id}" ${calcState && String(calcState.employeeId) === String(e.id) ? 'selected' : ''}>${e.name || 'بدون اسم'} - ${e.jobTitle || 'موظف'} (${e.section || 'القسم'})</option>`).join('')}
            </select>
          </div>
          ` : ''}

        </div>

        <form onsubmit="window.app.handleCalculatePromotion(event)">
          
          <div style="display: grid; grid-template-columns: 1.15fr 1fr; gap: 1rem; align-items: start; margin-bottom: 0.85rem;">
            
            <!-- معطيات الدرجة والمرحلة والمؤهل والتاريخ -->
            <div style="background: var(--md-sys-color-background); border: 1px solid var(--md-sys-color-surface-variant); border-radius: 12px; padding: 0.85rem; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);">
              <div style="display: flex; align-items: center; gap: 0.4rem; margin-bottom: 0.65rem; color: var(--md-sys-color-primary); font-weight: 800; font-size: 0.82rem;">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <span>معطيات الدرجة والمؤهل والمباشرة:</span>
              </div>

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
                    <option value="8" ${['8', 'الثامنة'].includes(userGrade) ? 'selected' : ''}>الدرجة الثامنة (4 س)</option>
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

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.6rem;">
                <!-- التحصيل الدراسي -->
                <div class="form-group" style="margin-bottom: 0;">
                  <label class="form-label" style="font-weight: 700; font-size: 0.74rem; color: var(--md-sys-color-on-surface); margin-bottom: 0.2rem;">التحصيل الدراسي:</label>
                  <select id="calcDegree" class="form-control" style="font-weight: 700; font-size: 0.78rem; border-radius: 7px; border: 1px solid var(--md-sys-color-outline-variant); background: var(--md-sys-color-surface); height: 35px; padding: 0 0.5rem;" onchange="window.app.handleCalculatePromotion(event)">
                    <option value="دكتوراه" ${userDegree === 'دكتوراه' ? 'selected' : ''}>دكتوراه</option>
                    <option value="ماجستير" ${userDegree === 'ماجستير' ? 'selected' : ''}>ماجستير</option>
                    <option value="دبلوم عالي" ${userDegree === 'دبلوم عالي' ? 'selected' : ''}>دبلوم عالي</option>
                    <option value="بكالوريوس" ${['بكالوريوس', 'بكلوريوس'].includes(userDegree) ? 'selected' : ''}>بكالوريوس</option>
                    <option value="دبلوم" ${userDegree === 'دبلوم' ? 'selected' : ''}>دبلوم فني / معهد</option>
                    <option value="اعدادية" ${['اعدادية', 'إعدادية'].includes(userDegree) ? 'selected' : ''}>إعدادية</option>
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
                  <span>كتب الشكر والتقدير والقدم:</span>
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
              <div style="display: flex; align-items: center; justify-content: space-between; gap: 0.4rem; margin-bottom: 0.4rem; background: var(--md-sys-color-surface); padding: 0.35rem 0.6rem; border-radius: 7px; border: 1px solid rgba(16, 185, 129, 0.18);">
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

          <!-- زر حفظ وتثبيت واحتساب الاستحقاق فوري مشع ومرتب -->
          <button type="submit" class="btn" style="width: 100%; height: 42px; font-weight: 800; border-radius: 10px; background: linear-gradient(135deg, #0b57d0 0%, #0284c7 50%, #10b981 100%); color: #ffffff; box-shadow: 0 3px 14px rgba(11, 87, 208, 0.3); display: flex; align-items: center; justify-content: center; gap: 0.5rem; cursor: pointer; border: none; font-size: 0.88rem; transition: all 0.2s ease;">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
              <polyline points="17 21 17 13 7 13 7 21"></polyline>
              <polyline points="7 3 7 8 15 8"></polyline>
            </svg>
            <span>💾 حفظ بيانات الموظف واحتساب الاستحقاق وتحديث الإضبارة</span>
          </button>

        </form>
      </div>

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

    const grade = document.getElementById('calcGrade') ? document.getElementById('calcGrade').value : '4';
    const stage = document.getElementById('calcStage') ? parseInt(document.getElementById('calcStage').value, 10) : 1;
    const degree = document.getElementById('calcDegree') ? document.getElementById('calcDegree').value : 'بكالوريوس';
    const lastPromo = document.getElementById('calcLastDate') ? document.getElementById('calcLastDate').value : '2022-01-01';

    const minister = document.getElementById('calcThanksMinister') ? parseInt(document.getElementById('calcThanksMinister').value, 10) || 0 : 0;
    const pm = document.getElementById('calcThanksPM') ? parseInt(document.getElementById('calcThanksPM').value, 10) || 0 : 0;
    const pres = document.getElementById('calcThanksPres') ? parseInt(document.getElementById('calcThanksPres').value, 10) || 0 : 0;

    if (!window.promotionCalcState) window.promotionCalcState = {};
    window.promotionCalcState.grade = grade;
    window.promotionCalcState.stage = stage;
    window.promotionCalcState.degree = degree;
    window.promotionCalcState.lastPromo = lastPromo;
    window.promotionCalcState.thanksConfig = { minister, primeMinister: pm, president: pres };

    const user = (window.auth && typeof window.auth.getCurrentUser === 'function') ? window.auth.getCurrentUser() : null;
    if (user && (!window.promotionCalcState.employeeId || window.promotionCalcState.employeeId === user.id)) {
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
        window.app.showToast('تم تحديث وحساب استحقاق الترفيع والعلاوة بنجاح! 💾', 'success');
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
            سيتم إرسال طلب الترفيع الإلكتروني مباشرة إلى شعبة تخطيط الموارد البشرية واللجنة الفنية المركزية للترقيات مع كافة معطيات الإضبارة وكتب الشكر المعتمدة.
          </p>
          <div class="form-group" style="margin-top: 1rem;">
            <label class="form-label" style="font-weight: 700;">ملاحظات الموظف أو طلب تغيير العنوان الوظيفي المفضل:</label>
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
      window.app.showToast('تم إرسال طلب الترفيع الرسمي إلى شعبة الموارد البشرية بنجاح! 🚀', 'success');
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
// Employee Roster Loading & Presets Handling for Promotion Calculator
// ==========================================================================
if (typeof window !== 'undefined') {
  window.loadEmployeeToPromotionCalc = function(empId) {
    if (!window.promotionCalcState) window.promotionCalcState = {};
    if (!empId) {
      window.promotionCalcState.employeeId = '';
      window.promotionCalcState.employeeName = 'إدخال يدوي مخصص';
      if (window.app && typeof window.app.render === 'function') window.app.render();
      return;
    }
    const employees = (window.store && typeof window.store.getEmployees === 'function') ? window.store.getEmployees() : [];
    const emp = employees.find(e => String(e.id) === String(empId));
    if (!emp) return;

    window.promotionCalcState.employeeId = emp.id;
    window.promotionCalcState.employeeName = emp.name || 'منتسب';

    // Map Grade
    let grade = '4';
    const gStr = String(emp.jobGrade || '').trim();
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
    window.promotionCalcState.stage = parseInt(emp.jobStage, 10) || 1;

    // Map Degree
    const dStr = (emp.qualification || emp.degree || '').toLowerCase();
    if (dStr.includes('دكتور') || dStr.includes('phd')) window.promotionCalcState.degree = 'دكتوراه';
    else if (dStr.includes('ماجستير') || dStr.includes('master')) window.promotionCalcState.degree = 'ماجستير';
    else if (dStr.includes('عالي') || dStr.includes('دبلوم عالي')) window.promotionCalcState.degree = 'دبلوم عالي';
    else if (dStr.includes('بكالوريوس') || dStr.includes('bachelor')) window.promotionCalcState.degree = 'بكالوريوس';
    else if (dStr.includes('دبلوم')) window.promotionCalcState.degree = 'دبلوم';
    else if (dStr.includes('إعداد') || dStr.includes('اعداد')) window.promotionCalcState.degree = 'إعدادية';
    else if (dStr.includes('متوسط')) window.promotionCalcState.degree = 'متوسطة';
    else if (dStr.includes('ابتدائ')) window.promotionCalcState.degree = 'ابتدائية';
    else window.promotionCalcState.degree = 'بكالوريوس';

    // Last Promotion Date
    window.promotionCalcState.lastPromo = emp.lastPromotionDate || emp.hireDate || '2022-01-01';

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
    if (preset === 'senior_engineer') {
      window.promotionCalcState.employeeId = '';
      window.promotionCalcState.employeeName = 'مهندس أقدم (نموذج افتراضي)';
      window.promotionCalcState.grade = '4';
      window.promotionCalcState.stage = 2;
      window.promotionCalcState.degree = 'بكالوريوس';
      window.promotionCalcState.lastPromo = '2020-07-01';
      window.promotionCalcState.thanksConfig = { minister: 2, primeMinister: 0, president: 0 };
    } else if (preset === 'chief_technician') {
      window.promotionCalcState.employeeId = '';
      window.promotionCalcState.employeeName = 'رئيس فنيين (نموذج افتراضي)';
      window.promotionCalcState.grade = '5';
      window.promotionCalcState.stage = 3;
      window.promotionCalcState.degree = 'دبلوم';
      window.promotionCalcState.lastPromo = '2021-03-15';
      window.promotionCalcState.thanksConfig = { minister: 1, primeMinister: 0, president: 0 };
    } else if (preset === 'ready_for_promo') {
      window.promotionCalcState.employeeId = '';
      window.promotionCalcState.employeeName = 'مستحق ترفيع فوري (مكتمل المدة القانونية)';
      window.promotionCalcState.grade = '6';
      window.promotionCalcState.stage = 4;
      window.promotionCalcState.degree = 'بكالوريوس';
      window.promotionCalcState.lastPromo = '2021-01-01';
      window.promotionCalcState.thanksConfig = { minister: 3, primeMinister: 0, president: 0 };
    } else if (preset === 'annual_increment') {
      window.promotionCalcState.employeeId = '';
      window.promotionCalcState.employeeName = 'مستحق علاوة سنوية فقط';
      window.promotionCalcState.grade = '3';
      window.promotionCalcState.stage = 2;
      window.promotionCalcState.degree = 'ماجستير';
      window.promotionCalcState.lastPromo = '2024-02-01';
      window.promotionCalcState.thanksConfig = { minister: 0, primeMinister: 0, president: 0 };
    }

    if (window.app && typeof window.app.render === 'function') {
      window.app.render();
    }
  };
}
